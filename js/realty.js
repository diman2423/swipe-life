// Квартира и рынок: скрытая цена, которую игрок не видит (SPEC §5).
// Всё в очках шкалы 💰; рубли нужны только для текстов карточек.
(function (root) {
  const RUB_PER_POINT = 100000; // 1 очко капитала = 100 000 ₽
  const BASE = 30;              // типичная квартира ≈ 30 очков ≈ 3 млн ₽

  // Рынок — случайное блуждание с возвратом к норме (не уходит в бесконечность)
  // плюс медленный рост цен со временем.
  const THETA = 0.02;   // сила возврата к норме за неделю
  const SIGMA = 0.015;  // недельный шум; разброс рынка в итоге около ±7–8%
  const TREND = 0.0005; // +0.05% в неделю ≈ +2.6% в год

  // Нормальное распределение из равномерного (Бокс — Мюллер).
  function gauss(rand) {
    let u = 0;
    while (!u) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  }

  function newMarket() {
    return { logM: 0 };
  }

  function tickMarket(market, rand) {
    market.logM += -THETA * market.logM + SIGMA * gauss(rand);
  }

  // quality — свойство конкретной квартиры (район, этаж, ремонт), тоже скрыто.
  function newFlat(name, book, rand) {
    const quality = Math.max(0.75, Math.min(1.25, 1 + 0.1 * gauss(rand)));
    return { name, book, quality };
  }

  // Бабушкина квартира учтена по условной оценке BASE, а настоящая цена — какая уж есть.
  function grandmaFlat(rand) {
    return newFlat("Бабушкина квартира", BASE, rand);
  }

  // Настоящая цена прямо сейчас. Игроку не показывается — только в ?debug и при сделках.
  function hiddenValue(state, flat) {
    return BASE * flat.quality * Math.exp(state.market.logM) * Math.pow(1 + TREND, state.week);
  }

  function formatRub(points) {
    const mln = (points * RUB_PER_POINT) / 1e6;
    return mln.toFixed(2).replace(".", ",") + " млн ₽";
  }

  // ───────────── Продажа (T6) ─────────────
  // Карточки сделок собираются здесь, а не в cards.js: в них живые цены.
  // Вариант карточки несёт deal = { type, price } — его применяет applyDeal.

  const round = (p, step = 0.1) => Math.round(p / step) * step;
  const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];
  const REALTOR = { who: "Риелтор", face: "🧑‍💼" };

  // Шанс, что за неделю придёт покупатель: цена выставления против скрытой.
  // По скрытой цене — примерно раз в 3 недели, на 12% дороже — раз в 2–3 месяца.
  function buyerChance(ask, value) {
    const p = 0.3 * Math.exp(-12 * (ask / value - 1));
    return Math.max(0.02, Math.min(0.7, p));
  }

  // Карточка, которая приходит вне очереди: результат оценщика, выбор цены после
  // «давайте продавать» или покупатель, если он пришёл на этой неделе. Вызывается один раз за неделю.
  function forcedCard(state, rand) {
    if (state.debugSeller && !state.flat) {
      state.debugSeller = false;
      return sellerCard(state, rand);
    }
    if (!state.flat) return null;
    const value = hiddenValue(state, state.flat);
    if (state.pendingAppraisal) {
      state.pendingAppraisal = false;
      return appraisalCard(state, value, rand);
    }
    if (state.pendingListing) {
      state.pendingListing = false;
      return priceCard(value, rand);
    }
    if (state.listing && rand() < buyerChance(state.listing.ask, value)) {
      return buyerCard(state.listing.ask, value, rand);
    }
    return null;
  }

  function priceCard(value, rand) {
    const estimate = value * (1 + 0.07 * gauss(rand)); // риелтор тоже не знает точно
    const low = round(estimate * 0.93, 0.5);
    const high = round(estimate * 1.12, 0.5);
    return {
      id: "realty_price", ...REALTOR, system: true,
      text: `За сколько выставляем? За ${formatRub(low)} уйдёт быстрее. За ${formatRub(high)} — придётся подождать.`,
      left: { label: formatRub(low), deal: { type: "list", price: low } },
      right: { label: formatRub(high), deal: { type: "list", price: high } },
    };
  }

  function buyerCard(ask, value, rand) {
    const full = ask <= value && rand() < 0.6;
    const offer = full ? ask : Math.min(ask, round(value * (0.93 + 0.12 * rand())));
    const text = offer >= ask
      ? `Беру за ${formatRub(ask)}, без торга. Деньги сразу.`
      : `Вы просите ${formatRub(ask)}. Даю ${formatRub(offer)} — и выходим на сделку хоть завтра.`;
    return {
      id: "realty_buyer", who: "Покупатель", face: pick(["🧔", "👩‍💼", "👨‍👩‍👧", "🧑‍🔧"], rand), system: true,
      text,
      left: { label: "Нет", fx: {} },
      right: { label: "Продаю", deal: { type: "sell", price: offer } },
    };
  }

  const VIEWINGS = [
    "Вчера смотрели две семьи. Думают.",
    "Был просмотр. Спросили, почему так дорого, и ушли.",
    "Звонил покупатель, спрашивал про соседей сверху. Обещал перезвонить.",
    "Пара пришла, походила, сказала «надо посоветоваться с мамой».",
  ];

  // ───────────── Покупка, оценщик, сплетник (T7) ─────────────

  const FLAT_NAMES = ["Однушка у метро", "Двушка в панельке", "Студия в новостройке", "Сталинка с высокими потолками", "Двушка у парка"];
  const SELLER_PITCHES = [
    "Срочно, переезжаем в другой город.",
    "Ремонт свежий, соседи тихие.",
    "Без торга, цена и так ниже рынка.",
    "Документы чистые, один собственник.",
    "Продаю, потому что развожусь. Не спрашивайте.",
  ];

  // Продавец: цена от −12% до +15% к скрытой. Что значит «срочно» или «ниже рынка» — не говорит ничего.
  function sellerCard(state, rand) {
    const flat = newFlat(pick(FLAT_NAMES, rand), 0, rand);
    const value = hiddenValue(state, flat);
    const price = round(value * (0.88 + 0.27 * rand()), 0.5);
    return {
      id: "realty_seller", who: "Продавец", face: pick(["🧑‍🦳", "👩", "🧔‍♂️", "👨‍💼"], rand), system: true, weight: 0.6,
      text: `Продаю: ${flat.name.toLowerCase()}. ${pick(SELLER_PITCHES, rand)} ${formatRub(price)}.`,
      left: { label: "Не надо", fx: {} },
      right: { label: "Покупаю", deal: { type: "buy", price, flat } },
      debugInfo: `скрыто ${value.toFixed(1)}, просят ${Math.round((price / value - 1) * 100)}% к скрытой`,
    };
  }

  // Оценщик называет вилку ±5% вокруг своей оценки, а оценка сама ошибается (±6%).
  function appraisalCard(state, value, rand) {
    const center = value * (1 + 0.06 * gauss(rand));
    const lo = round(center * 0.95), hi = round(center * 1.05);
    const sellOption = state.listing
      ? { label: "Понятно", fx: {} }
      : { label: "Выставляйте", deal: { type: "pitch" } };
    return {
      id: "realty_appraisal", who: "Оценщик", face: "🧐", system: true,
      text: `Ваша квартира стоит от ${formatRub(lo)} до ${formatRub(hi)}. Точнее скажет только рынок.`,
      left: { label: "Понятно", fx: {} },
      right: sellOption,
      debugInfo: `скрыто ${value.toFixed(1)}, вилка ${lo.toFixed(1)}–${hi.toFixed(1)}`,
    };
  }

  // Сплетник: через 4–20 недель после сделки говорит, за сколько «ушла соседняя».
  // Обычно ±10% к настоящей цене такой же квартиры, но в четверти случаев врёт на ±20%.
  function gossipCard(state, rand) {
    const deal = state.lastDeal;
    const value = BASE * deal.quality * Math.exp(state.market.logM) * Math.pow(1 + TREND, state.week);
    const lie = rand() < 0.25;
    const told = round(value * (1 + (lie ? 0.2 * (rand() < 0.5 ? -1 : 1) : 0.1 * gauss(rand))));
    const text = deal.kind === "sell"
      ? `А ты слышал? Соседнюю с твоей бывшей квартирой продали за ${formatRub(told)}!`
      : `Говорят, в вашем доме такую же продали за ${formatRub(told)}. Не переплатил?`;
    return {
      id: "realty_gossip", who: "Сосед-сплетник", face: "🗣️", system: true, weight: 1.5,
      text,
      left: { label: "Да ладно", fx: { love: 4 }, deal: { type: "gossip" } },
      right: { label: "Не хочу знать", fx: { love: -4 }, deal: { type: "gossip" } },
      debugInfo: `такая квартира сейчас ${value.toFixed(1)}, сказал ${told.toFixed(1)}${lie ? " (врёт)" : ""}`,
    };
  }

  // Обычные карточки, которые подмешиваются в колоду: сделки с квартирой.
  function systemCards(state, rand) {
    const out = [];
    const d = state.lastDeal;
    if (d && !d.gossiped && state.week - d.week >= 4 && state.week - d.week <= 20) {
      out.push(gossipCard(state, rand));
    }
    if (!state.flat) {
      if (state.scales.money >= 25) out.push(sellerCard(state, rand));
      return out;
    }

    const value = hiddenValue(state, state.flat);
    const L = state.listing;

    out.push({
      id: "realty_appraiser", who: "Оценщик", face: "🧐", system: true, weight: 0.3,
      text: "За 30 000 ₽ скажу, сколько стоит ваша квартира. Почти точно.",
      left: { label: "Не надо", fx: {} },
      right: { label: "Давайте", fx: { money: -0.3 }, deal: { type: "appraise" } },
    });

    if (!L) {
      out.push({
        id: "realty_pitch", ...REALTOR, system: true, weight: 0.4,
        text: "Рынок сейчас интересный. Не думали продать квартиру?",
        left: { label: "Не продаю", fx: {} },
        right: { label: "Давайте", deal: { type: "pitch" } },
      });
      const offer = round(value * (0.85 + 0.4 * rand()));
      out.push({
        id: "realty_neighbor", who: "Сосед", face: "🧓", system: true, weight: 0.35,
        text: `Слушай, продашь квартиру за ${formatRub(offer)}? Сыну надо срочно, деньги сразу.`,
        left: { label: "Не продаётся", fx: {} },
        right: { label: "По рукам", deal: { type: "sell", price: offer } },
      });
    } else {
      const weeks = state.week - L.since;
      out.push({
        id: "realty_viewing", ...REALTOR, system: true, weight: 2,
        text: pick(VIEWINGS, rand),
        left: { label: "Ждём", fx: {} },
        right: { label: "Позвоните им", fx: { health: -4 } },
      });
      if (state.week - L.lastCut >= 6) {
        const cut = round(L.ask * 0.95, 0.5);
        out.push({
          id: "realty_cut", ...REALTOR, system: true, weight: 2,
          text: `Звонков мало. Может, скинем до ${formatRub(cut)}?`,
          left: { label: "Держим цену", fx: {}, deal: { type: "hold" } },
          right: { label: "Скидываем", deal: { type: "cut", price: cut } },
        });
      }
      if (weeks >= 10) {
        out.push({
          id: "realty_delist", ...REALTOR, system: true, weight: 0.5,
          text: "Может, снимем с продажи? Сейчас не сезон.",
          left: { label: "Продолжаем", fx: {} },
          right: { label: "Снимаем", deal: { type: "delist" } },
        });
      }
    }

    if (state.scales.money <= 20) {
      const offer = round(value * (0.75 + 0.13 * rand()));
      out.push({
        id: "realty_distress", who: "Коллекторы", face: "📞", system: true, weight: 3,
        text: `Продавай квартиру. Покупатель уже есть: ${formatRub(offer)}, сегодня.`,
        left: { label: "Выкручусь", fx: { health: -12, love: -6 } },
        right: { label: "Продаю", deal: { type: "sell", price: offer } },
      });
    }
    return out;
  }

  // Применяет сделку. Возвращает { money: изменение 💰, news: строка для игрока }.
  function applyDeal(state, deal) {
    switch (deal.type) {
      case "pitch":
        state.pendingListing = true;
        return {};
      case "list":
        state.listing = { ask: deal.price, since: state.week, lastCut: state.week };
        return { news: `Квартира выставлена за ${formatRub(deal.price)}` };
      case "hold":
        state.listing.lastCut = state.week; // риелтор спросит снова не раньше чем через 6 недель
        return {};
      case "cut":
        state.listing.ask = deal.price;
        state.listing.lastCut = state.week;
        return { news: `Цена снижена до ${formatRub(deal.price)}` };
      case "delist":
        state.listing = null;
        return { news: "Квартира снята с продажи" };
      case "sell": {
        // 💰 меняется не на всю сумму, а на разницу с ценой учёта: правда раскрылась.
        const delta = deal.price - state.flat.book;
        state.lastDeal = { kind: "sell", quality: state.flat.quality, week: state.week, gossiped: false };
        state.flat = null;
        state.listing = null;
        state.pendingListing = false;
        return { money: delta, news: `Квартира продана за ${formatRub(deal.price)}` };
      }
      case "buy":
        // Деньги ушли, квартира пришла по той же цене — 💰 не двигается. Переплатил ли — узнаешь при продаже.
        state.flat = { ...deal.flat, book: deal.price };
        state.lastDeal = { kind: "buy", quality: deal.flat.quality, week: state.week, gossiped: false };
        return { news: `Куплена квартира за ${formatRub(deal.price)}` };
      case "appraise":
        state.pendingAppraisal = true;
        return {};
      case "gossip":
        if (state.lastDeal) state.lastDeal.gossiped = true;
        return {};
    }
    return {};
  }

  const api = {
    BASE, RUB_PER_POINT, gauss, newMarket, tickMarket, newFlat, grandmaFlat, hiddenValue, formatRub,
    buyerChance, forcedCard, systemCards, applyDeal,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Realty = api;
})(this);
