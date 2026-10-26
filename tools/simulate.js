// Бот-симулятор: гоняет тысячи забегов разными ботами и печатает отчёт по балансу.
// Запуск: node tools/simulate.js            (по 3000 забегов на бота)
//         node tools/simulate.js 10000 7    (10000 забегов, зерно 7)
const fs = require("fs");
const path = require("path");
const Game = require("../js/game.js");

const root = path.join(__dirname, "..");
const window = {};
new Function("window", fs.readFileSync(path.join(root, "cards.js"), "utf8"))(window);
const cards = window.CARDS;

const RUNS = Number(process.argv[2]) || 3000;
const SEED = Number(process.argv[3]) || 1;
const MAX_WEEKS = 52 * 20; // дальше 20 лет не гоняем

// Детерминированный генератор, чтобы прогоны можно было повторить.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Бот получает карточку и состояние, возвращает "left" или "right".
const BOTS = {
  // Свайпает наугад.
  random: (card, state, rand) => (rand() < 0.5 ? "left" : "right"),
  // Всегда соглашается.
  yes: () => "right",
  // Как живой игрок: направление угадывает по смыслу текста, силу знает только по размеру
  // точки (маленькая ≈ 10, большая ≈ 24), держит шкалы у середины и в 15% случаев ошибается.
  human: (card, state, rand) => {
    if (rand() < 0.15) return rand() < 0.5 ? "left" : "right";
    const score = (opt) => {
      const p = Game.preview(opt);
      let s = 0;
      for (const k of Game.SCALES) {
        const real = (opt.fx || {})[k] || 0;
        const guess = p[k] && real ? Math.sign(real) * (p[k] === "big" ? 24 : 10) : 0;
        s += (state.scales[k] + guess - 50) ** 2;
      }
      return s;
    };
    const l = score(card.left), r = score(card.right);
    if (l === r) return rand() < 0.5 ? "left" : "right";
    return l < r ? "left" : "right";
  },
  // Знает эффекты и держит шкалы ближе к середине. Это потолок: живой игрок видит только точки.
  middle: (card, state, rand) => {
    const score = (opt) => {
      let s = 0;
      for (const k of Game.SCALES) {
        const v = state.scales[k] + ((opt.fx || {})[k] || 0);
        s += (v - 50) ** 2;
      }
      return s;
    };
    const l = score(card.left), r = score(card.right);
    if (l === r) return rand() < 0.5 ? "left" : "right";
    return l < r ? "left" : "right";
  },
};

function run(botName, rand) {
  const bot = BOTS[botName];
  const s = Game.newState({}, rand);
  let deals = 0;
  const seen = {};
  while (!s.dead && s.week < MAX_WEEKS) {
    const c = Game.drawCard(s, cards, rand);
    seen[c.id] = (seen[c.id] || 0) + 1;
    const opt = c[bot(c, s, rand)];
    if (opt.deal && (opt.deal.type === "sell" || opt.deal.type === "buy")) deals++;
    Game.applyChoice(s, opt, c, rand);
  }
  return { weeks: s.week, death: s.dead ? `${s.dead.scale}-${s.dead.side}` : "дожил до 20 лет игры", deals, seen };
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
const DEATH = {
  "money-low": "💰 0 коллекторы", "money-high": "💰 100 всё спустил",
  "health-low": "❤️ 0 больничка", "health-high": "❤️ 100 ЗОЖ",
  "love-low": "💞 0 один", "love-high": "💞 100 растворился",
  "work-low": "💼 0 уволен", "work-high": "💼 100 выгорел",
};

console.log(`Свайп-жизнь · баланс · ${RUNS} забегов на бота · зерно ${SEED} · карточек ${cards.length}\n`);
const summary = {};
const seenTotal = {};
for (const name of Object.keys(BOTS)) {
  const rand = mulberry32(SEED);
  const res = Array.from({ length: RUNS }, () => run(name, rand));
  const weeks = res.map((r) => r.weeks).sort((a, b) => a - b);
  const deaths = {};
  for (const r of res) deaths[r.death] = (deaths[r.death] || 0) + 1;
  for (const r of res) for (const [id, n] of Object.entries(r.seen)) seenTotal[id] = (seenTotal[id] || 0) + n;
  const withDeal = res.filter((r) => r.deals > 0).length / RUNS;
  const top = Object.entries(deaths).sort((a, b) => b[1] - a[1]);
  const died = res.filter((x) => !x.death.startsWith("дожил")).length || 1;
  const topDeath = top.find(([k]) => !k.startsWith("дожил"));
  summary[name] = { median: pct(weeks, 0.5), topShare: topDeath ? topDeath[1] / died : 0, withDeal };

  console.log(`■ бот «${name}»`);
  console.log(`  жизнь: медиана ${Game.formatAge(pct(weeks, 0.5))} (${pct(weeks, 0.5)} нед.) · 10% живут меньше ${pct(weeks, 0.1)} нед. · 10% дольше ${pct(weeks, 0.9)} нед.`);
  console.log(`  смерти: ${top.map(([k, v]) => `${DEATH[k] || k} ${Math.round((v / RUNS) * 100)}%`).join(" · ")}`);
  console.log(`  сделка с квартирой (купил/продал) хоть раз: ${Math.round(withDeal * 100)}% забегов\n`);
}

const never = cards.filter((c) => !seenTotal[c.id]).map((c) => c.id);
if (never.length) console.log(`⚠ ни разу не выпали: ${never.join(", ")}\n`);

// Критерии приёмки T9
// Доля смерти считается среди умерших. «Середина» видит точные эффекты и почти бессмертна —
// поэтому распределение смертей проверяем на случайном боте и на «человеке».
const r = summary.random, h = summary.human, m = summary.middle;
const checks = [
  [`случайный бот живёт заметно меньше «середины» (${r.median} против ${m.median} нед., нужно ×2+)`, m.median >= 2 * r.median],
  [`«человек» живёт дольше случайного, но не вечно (${h.median} нед. против ${r.median})`, h.median > r.median && h.median < 52 * 20],
  [`ни одна смерть не больше ~30% (у случайного ${Math.round(r.topShare * 100)}%, у «человека» ${Math.round(h.topShare * 100)}%)`, r.topShare <= 0.32 && h.topShare <= 0.32],
  [`сделка с квартирой хотя бы в половине забегов «середины» (${Math.round(m.withDeal * 100)}%)`, m.withDeal >= 0.5],
];
console.log("Критерии T9:");
for (const [text, ok] of checks) console.log(`  ${ok ? "✅" : "❌"} ${text}`);
