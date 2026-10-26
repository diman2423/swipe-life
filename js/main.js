// Интерфейс: шкалы и возраст сверху, карточки из cards.js, экран смерти.
(function () {
  const Game = window.Game;
  const ENDINGS = window.ENDINGS;
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has("debug");
  const STATE_OPTS = { withFlat: !params.has("noflat") }; // ?noflat — старт без квартиры
  const RECORD_KEY = "swipe_life.record";

  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const question = $("question");
  const who = $("who");
  const log = $("log");
  const age = $("age");
  const assets = $("assets");
  const scalesBox = $("scales");
  const death = $("death");
  const problems = $("problems");
  const debugLine = $("debug");

  const cards = window.CARDS;
  if (!Array.isArray(cards)) {
    problems.textContent = "cards.js не загрузился — скорее всего, ошибка в JSON (запятая или кавычка). Подробности в консоли браузера (F12).";
    return;
  }
  const cardErrors = Game.validateCards(cards);
  if (cardErrors.length) problems.textContent = "Ошибки в cards.js: " + cardErrors.join("; ");

  const SCALE_VIEW = {
    money: { icon: "💰", name: "Деньги" },
    health: { icon: "❤️", name: "Здоровье" },
    love: { icon: "💞", name: "Отношения" },
    work: { icon: "💼", name: "Дело" },
  };

  let state = Game.newState(STATE_OPTS);
  const meters = {}; // key -> { dot, meter, fill, value }

  function loadRecord() {
    try { return Number(localStorage.getItem(RECORD_KEY)) || 0; } catch { return 0; }
  }
  function saveRecord(weeks) {
    try { localStorage.setItem(RECORD_KEY, String(weeks)); } catch { /* приватный режим — без рекорда */ }
  }

  function buildScales() {
    for (const k of Game.SCALES) {
      const box = document.createElement("div");
      box.className = "scale";
      box.title = SCALE_VIEW[k].name;

      const dot = document.createElement("div");
      dot.className = "dot";

      const meter = document.createElement("div");
      meter.className = "meter";
      const fill = document.createElement("div");
      fill.className = "fill";
      const icon = document.createElement("div");
      icon.className = "icon";
      icon.textContent = SCALE_VIEW[k].icon;
      meter.append(fill, icon);

      box.append(dot, meter);

      // ?debug в адресе — видны точные значения шкал
      let value = null;
      if (DEBUG) {
        value = document.createElement("div");
        value.className = "debug-value";
        box.append(value);
      }

      scalesBox.append(box);
      meters[k] = { dot, meter, fill, value };
    }
  }

  function renderScales(before) {
    for (const k of Game.SCALES) {
      const m = meters[k];
      const v = state.scales[k];
      m.fill.style.height = v + "%";
      if (m.value) m.value.textContent = Number.isInteger(v) ? v : v.toFixed(1);
      if (before && before[k] !== v) {
        m.meter.classList.remove("up", "down");
        void m.meter.offsetWidth; // перезапуск подсветки
        m.meter.classList.add(v > before[k] ? "up" : "down");
        setTimeout(() => m.meter.classList.remove("up", "down"), 600);
      }
    }
    age.textContent = Game.formatAge(state.week);
    // Видно только, что квартира есть. Цены нет нигде (SPEC §5).
    assets.textContent = state.flat ? " · 🏠 " + state.flat.name : "";
    if (state.listing) assets.textContent += " · продаётся за " + window.Realty.formatRub(state.listing.ask);
    assets.title = state.flat ? "Своя квартира. Сколько она стоит — узнаешь, только когда продашь" : "";
  }

  function showDots(option) {
    const p = option ? Game.preview(option) : {};
    for (const k of Game.SCALES) {
      meters[k].dot.className = "dot" + (p[k] ? " " + p[k] : "");
    }
  }

  function showDeath() {
    const end = ENDINGS[state.dead.scale][state.dead.side];
    const record = loadRecord();
    const isNew = state.week > record;
    if (isNew) saveRecord(state.week);

    $("death-face").textContent = end.face;
    $("death-title").textContent = end.title;
    $("death-text").textContent = end.text;

    const stats = $("death-stats");
    stats.textContent = "";
    stats.append("Прожито: " + Game.formatAge(state.week), document.createElement("br"));
    if (isNew) {
      const mark = document.createElement("span");
      mark.className = "new-record";
      mark.textContent = "Новый рекорд!";
      stats.append(mark);
    } else {
      stats.append("Рекорд: " + Game.formatAge(record));
    }

    death.hidden = false;
    $("again").focus();
  }

  function restart() {
    death.hidden = true;
    state = Game.newState(STATE_OPTS);
    log.textContent = "";
    renderScales(null);
    show();
  }

  let current = null; // { el, swipe }

  function makeCard(card) {
    const el = document.createElement("div");
    el.className = "card enter";
    el.addEventListener("animationend", () => el.classList.remove("enter"), { once: true });

    const face = document.createElement("div");
    face.className = "face";
    face.textContent = card.face;

    const choice = document.createElement("div");
    choice.className = "choice";

    el.append(face, choice);

    const swipe = window.attachSwipe(el, {
      onMove(progress, side) {
        choice.style.opacity = side ? progress : 0;
        choice.className = "choice" + (side ? " " + side : "");
        if (side) choice.textContent = card[side].label;
        showDots(side && progress > 0.15 ? card[side] : null);
      },
      onChoose(side) {
        const option = card[side];
        const before = { ...state.scales };
        Game.applyChoice(state, option, card);
        renderScales(before);
        showDots(null);
        log.textContent = state.news ||
          "Выбрано: " + (side === "left" ? "← " + option.label : option.label + " →");
        el.remove();
        current = null;
        if (state.dead) {
          setTimeout(showDeath, 700); // дать увидеть, как шкала упёрлась
          return;
        }
        show();
      },
    });

    return { el, swipe };
  }

  function renderDebug(card) {
    if (!DEBUG) return;
    const flags = Object.keys(state.flags).join(", ") || "—";
    const queue = state.queue.map((q) => `${q.card} на нед. ${q.week}`).join(", ") || "—";
    let flat = "нет";
    if (state.flat) {
      const v = Game.flatValue(state);
      flat = `учёт ${state.flat.book.toFixed(1)} · скрыто ${v.toFixed(1)} (${window.Realty.formatRub(v)})`;
      if (state.listing) {
        const ask = state.listing.ask;
        const p = window.Realty.buyerChance(ask, v);
        flat += ` · просим ${ask.toFixed(1)} (${Math.round((ask / v - 1) * 100)}% к скрытой, покупатель ${Math.round(p * 100)}%/нед)`;
      }
    }
    debugLine.textContent =
      `неделя ${state.week} · карточка: ${card.id} · флаги: ${flags} · очередь: ${queue} · квартира: ${flat}` +
      (card.debugInfo ? ` · ${card.id}: ${card.debugInfo}` : "");
  }

  function show() {
    const card = Game.drawCard(state, cards);
    if (!card) {
      problems.textContent = "Нет ни одной подходящей карточки — проверь условия if в cards.js.";
      return;
    }
    renderDebug(card);
    question.textContent = card.text;
    who.textContent = card.who;
    current = makeCard(card);
    stage.append(current.el);
  }

  const intro = $("intro");
  document.addEventListener("keydown", (e) => {
    if (!current || !intro.hidden) return;
    if (e.key === "ArrowLeft") current.swipe.fly("left");
    if (e.key === "ArrowRight") current.swipe.fly("right");
    if (!DEBUG) return;
    // ?debug: R — выбор цены продажи, O — оценщик, B — продавец (без квартиры); всё следующей картой
    const k = e.key.toLowerCase();
    if ((k === "r" || k === "к") && state.flat && !state.listing) {
      state.pendingListing = true;
      log.textContent = "debug: следующей придёт карточка риелтора с ценой";
    }
    if ((k === "o" || k === "щ") && state.flat) {
      state.pendingAppraisal = true;
      log.textContent = "debug: следующей придёт вилка оценщика";
    }
    if ((k === "b" || k === "и") && !state.flat) {
      state.debugSeller = true;
      log.textContent = "debug: следующей придёт продавец квартиры";
    }
  });
  $("again").addEventListener("click", restart);

  // Стартовый экран с правилами — при каждом открытии страницы; в ?debug пропускается.
  $("start").addEventListener("click", () => { intro.hidden = true; });
  if (DEBUG) intro.hidden = true;
  else $("start").focus();

  buildScales();
  renderScales(null);
  show();
})();
