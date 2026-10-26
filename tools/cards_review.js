// Собирает cards_review.md — все карточки и концовки в читаемом виде для вычитки.
// Запуск: node tools/cards_review.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const load = (file) => {
  const window = {};
  new Function("window", fs.readFileSync(path.join(root, file), "utf8"))(window);
  return window;
};
const cards = load("cards.js").CARDS;
const endings = load("js/endings.js").ENDINGS;

const ICON = { money: "💰", health: "❤️", love: "💞", work: "💼" };
const NAME = { money: "Деньги", health: "Здоровье", love: "Отношения", work: "Дело" };
const list = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

function fx(o) {
  const parts = Object.entries(o.fx || {}).map(([k, v]) => `${ICON[k]}${v > 0 ? "+" : "−"}${Math.abs(v)}`);
  for (const f of list(o.set)) parts.push(`+флаг ${f}`);
  for (const f of list(o.unset)) parts.push(`−флаг ${f}`);
  for (const t of list(o.then)) parts.push(`→ через ${t.in} нед.: ${list(t.card).join(" или ")}`);
  return parts.join(", ") || "без эффекта";
}

function conditions(c) {
  const out = [];
  const cond = c.if || {};
  for (const k of Object.keys(ICON)) if (cond[k]) out.push(`${ICON[k]} ${cond[k][0]}–${cond[k][1]}`);
  for (const f of list(cond.flags)) out.push(`есть ${f}`);
  for (const f of list(cond.notFlags)) out.push(`нет ${f}`);
  if (c.chainOnly) out.push("только по цепочке");
  if (c.once) out.push("разовая");
  if (c.weight != null && c.weight !== 1) out.push(`вес ${c.weight}`);
  return out.length ? ` _(${out.join(", ")})_` : "";
}

const groups = new Map();
for (const c of cards) {
  if (!groups.has(c.who)) groups.set(c.who, []);
  groups.get(c.who).push(c);
}

let md = "# Вычитка карточек\n\n";
md += "Файл собирается сам из `cards.js` и `js/endings.js` (`node tools/cards_review.js`) — править здесь бесполезно.\n";
md += "Как давать правки: пиши в чат по `id`, например «boss_night: текст скучный», «mom_tv — выкинуть», «friend_gym: вправо пусть будет «Ну пошли»».\n\n";
md += `Всего карточек: **${cards.length}**, персонажей: **${groups.size}**.\n\n`;
md += "Эффекты: 💰 Деньги · ❤️ Здоровье · 💞 Отношения · 💼 Дело. Шкалы 0–100, старт 50, смерть на 0 и на 100.\n\n";

md += "## Содержание\n\n";
for (const [who, cs] of groups) md += `- ${cs[0].face} ${who} — ${cs.length}\n`;
md += "- Концовки — 8\n- Карточки сделок с квартирой — в коде\n\n";

for (const [who, cs] of groups) {
  md += `## ${cs[0].face} ${who}\n\n`;
  for (const c of cs) {
    md += `**${c.id}**${conditions(c)}\n\n`;
    md += `> ${c.text}\n\n`;
    md += `- ← **${c.left.label}** — ${fx(c.left)}\n`;
    md += `- → **${c.right.label}** — ${fx(c.right)}\n\n`;
  }
}

md += "## Концовки\n\n";
for (const k of Object.keys(ICON)) {
  for (const side of ["low", "high"]) {
    const e = endings[k][side];
    md += `**${e.face} ${e.title}** _(${NAME[k]} ${side === "low" ? "0" : "100"})_\n\n> ${e.text}\n\n`;
  }
}

md += "## Карточки сделок с квартирой\n\n";
md += "Риелтор, покупатели, сосед с предложением, коллекторы, продавцы, оценщик и сплетник собираются в коде (`js/realty.js`), потому что в них живые цены. ";
md += "Их тексты тоже можно править — скажи, какую реплику поменять, и я поправлю в коде.\n";

fs.writeFileSync(path.join(root, "cards_review.md"), "﻿" + md, "utf8");
console.log(`cards_review.md: ${cards.length} карточек, ${groups.size} персонажей`);
