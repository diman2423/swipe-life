// Логика игры без интерфейса: шкалы, время, смерть, колода, квартира.
// Работает и в браузере (window.Game), и в Node (require) — для бота-симулятора в T9.
(function (root) {
  const Realty = root.Realty || require("./realty.js");
  const SCALES = ["money", "health", "love", "work"];
  const FLAT_FLAG = "has_flat"; // ставится сам, пока есть квартира — для условий карточек
  const START = 50;
  const BIG = 20; // изменение от этой величины показывается большой точкой (типичный эффект 6–20)

  // opts.withFlat = false — старт без квартиры (SPEC §8, открытый вопрос)
  function newState(opts = {}, rand = Math.random) {
    const scales = {};
    for (const k of SCALES) scales[k] = START;
    const state = {
      scales,
      week: 0,
      dead: null,
      flags: {},    // имя флага -> true
      queue: [],    // отложенные карточки: { card: id, week: когда }
      used: {},     // id разовых карточек, которые уже были
      lastId: null, // чтобы одна карточка не шла дважды подряд
      news: null,
      market: Realty.newMarket(),
      listing: null,        // квартира на продаже: { ask, since, lastCut }
      pendingListing: false, // согласился продавать — следующей придёт карточка выбора цены
      pendingAppraisal: false, // заплатил оценщику — следующей придёт его вилка
      lastDeal: null,       // { kind: sell|buy, quality, week, gossiped } — для сплетника
      // Квартира входит в 💰 по цене учёта flat.book; настоящая цена скрыта.
      flat: opts.withFlat === false ? null : Realty.grandmaFlat(rand),
    };
    syncFlatFlag(state);
    return state;
  }

  function syncFlatFlag(state) {
    if (state.flat) state.flags[FLAT_FLAG] = true;
    else delete state.flags[FLAT_FLAG];
  }

  const clamp = (v) => Math.max(0, Math.min(100, v));
  const asList = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

  // option = { label, fx, set, unset, then }  — формат в cards_format.md
  function applyChoice(state, option, card, rand = Math.random) {
    const fx = { ...(option.fx || {}) };
    state.news = null; // строка для игрока о том, что случилось (продажа и т.п.)
    if (option.deal) {
      const res = Realty.applyDeal(state, option.deal);
      if (res.money) fx.money = (fx.money || 0) + res.money;
      state.news = res.news || null;
    }
    for (const k of SCALES) {
      if (fx[k]) state.scales[k] = clamp(state.scales[k] + fx[k]);
    }
    for (const f of asList(option.set)) state.flags[f] = true;
    for (const f of asList(option.unset)) delete state.flags[f];

    syncFlatFlag(state); // has_flat руками не ставится и не снимается

    state.week += 1; // 1 свайп = 1 неделя
    Realty.tickMarket(state.market, rand);

    for (const t of asList(option.then)) {
      // then.card может быть списком — тогда исход выбирается случайно (акции выросли / упали)
      const ids = asList(t.card);
      const id = ids[Math.floor(rand() * ids.length)];
      state.queue.push({ card: id, week: state.week + (t.in || 1) });
    }
    if (card) {
      if (card.once) state.used[card.id] = true;
      state.lastId = card.id;
    }
    state.dead = checkDeath(state);
    return state;
  }

  // Шкала в 0 или в 100 — конец забега. Если сразу несколько, берётся первая по порядку SCALES.
  function checkDeath(state) {
    for (const k of SCALES) {
      if (state.scales[k] <= 0) return { scale: k, side: "low" };
      if (state.scales[k] >= 100) return { scale: k, side: "high" };
    }
    return null;
  }

  // card.if = { health: [0, 30], flags: [...], notFlags: [...] }
  function fits(state, card) {
    const cond = card.if || {};
    for (const k of SCALES) {
      if (!cond[k]) continue;
      const [lo, hi] = cond[k];
      if (state.scales[k] < lo || state.scales[k] > hi) return false;
    }
    for (const f of asList(cond.flags)) if (!state.flags[f]) return false;
    for (const f of asList(cond.notFlags)) if (state.flags[f]) return false;
    return true;
  }

  // Следующая карточка: сначала созревшие отложенные, потом сделки с квартирой вне очереди
  // (выбор цены, покупатель), иначе случайная подходящая с учётом веса.
  function drawCard(state, cards, rand = Math.random) {
    const byId = indexCards(cards);

    state.queue.sort((a, b) => a.week - b.week);
    const due = state.queue.findIndex((q) => q.week <= state.week && byId[q.card]);
    if (due !== -1) return byId[state.queue.splice(due, 1)[0].card];

    const forced = Realty.forcedCard(state, rand);
    if (forced) return forced;

    const all = cards.concat(Realty.systemCards(state, rand));
    const pool = (skipLast) =>
      all.filter((c) =>
        !c.chainOnly &&
        !state.used[c.id] &&
        !(skipLast && c.id === state.lastId) &&
        fits(state, c));

    let eligible = pool(true);
    if (!eligible.length) eligible = pool(false);
    if (!eligible.length) return null;

    const total = eligible.reduce((s, c) => s + weightOf(c), 0);
    let r = rand() * total;
    for (const c of eligible) {
      r -= weightOf(c);
      if (r < 0) return c;
    }
    return eligible[eligible.length - 1];
  }

  const weightOf = (c) => (c.weight == null ? 1 : c.weight);

  function indexCards(cards) {
    const byId = {};
    for (const c of cards) byId[c.id] = c;
    return byId;
  }

  // Проверка файла карточек: возвращает список понятных ошибок (пустой — всё ок).
  function validateCards(cards) {
    const errors = [];
    const byId = {};
    cards.forEach((c, i) => {
      const name = c.id || `#${i + 1}`;
      if (!c.id) errors.push(`${name}: нет id`);
      else if (byId[c.id]) errors.push(`${name}: id повторяется`);
      byId[c.id] = c;
      if (!c.text) errors.push(`${name}: нет text`);
      for (const side of ["left", "right"]) {
        const o = c[side];
        if (!o || !o.label) { errors.push(`${name}: нет ${side}.label`); continue; }
        for (const k of Object.keys(o.fx || {})) {
          if (!SCALES.includes(k)) errors.push(`${name}: ${side}.fx — неизвестная шкала «${k}»`);
        }
      }
      for (const k of Object.keys(c.if || {})) {
        if (k !== "flags" && k !== "notFlags" && !SCALES.includes(k)) {
          errors.push(`${name}: if — неизвестное условие «${k}»`);
        }
      }
    });
    for (const c of cards) {
      for (const side of ["left", "right"]) {
        for (const t of asList(c[side] && c[side].then)) {
          for (const id of asList(t.card)) {
            if (!byId[id]) errors.push(`${c.id}: ${side}.then ссылается на несуществующую карточку «${id}»`);
          }
        }
      }
    }
    return errors;
  }

  function formatAge(weeks) {
    const years = Math.floor(weeks / 52);
    const months = Math.floor(((weeks % 52) * 12) / 52);
    return `${years} г. ${months} мес.`;
  }

  // Какие шкалы изменит вариант и насколько сильно — без направления.
  function preview(option) {
    const fx = option.fx || {};
    const out = {};
    for (const k of SCALES) {
      const d = Math.abs(fx[k] || 0);
      if (d) out[k] = d >= BIG ? "big" : "small";
    }
    // Продажа всегда большая точка на 💰: размер выдал бы, выгодна ли сделка.
    if (option.deal && option.deal.type === "sell") out.money = "big";
    return out;
  }

  // Настоящая цена квартиры игрока (или null). Только для ?debug и логики сделок.
  function flatValue(state) {
    return state.flat ? Realty.hiddenValue(state, state.flat) : null;
  }

  const api = {
    SCALES, FLAT_FLAG, newState, flatValue, applyChoice, checkDeath, fits, drawCard, validateCards, preview, formatAge,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Game = api;
})(this);
