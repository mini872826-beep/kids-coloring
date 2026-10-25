// 列出 App 裡所有會念出來的句子（給 gen_voice.py 錄音用）
// 用法：node tools/phrases.js > phrases.json
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['js/art.js', 'js/books.js', 'js/words.js']) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
}
const { ART, BOOKS, WORDS } = ctx.window;

const all = new Set([
  ...ART.CATEGORIES.map(c => c.name),
  ...ART.DRAWINGS.map(d => d.name),
  ...BOOKS.flatMap(b => [b.title, ...b.pages.map(p => p.text)]),
  ...WORDS.BRUSHES.map(b => b.name),
  ...WORDS.COLOR_NAMES,
  ...WORDS.FIXED,
]);
for (let i = 1; i <= 60; i++) all.add(`白紙 ${i}`);

process.stdout.write(JSON.stringify([...all], null, 1));
