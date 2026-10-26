// 列出 App 裡所有會念出來的句子（給 gen_voice.py 錄音用）
// 用法：node tools/phrases.js > phrases.json
//       node tools/phrases.js --minimax > minimax.json   用 MiniMax 台灣腔講故事大姊姊念的句子（全部中文）
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['js/words.js', 'js/art.js', ...fs.readdirSync('js').filter(f => f.startsWith('pack-')).sort().map(f => 'js/' + f), 'js/books.js', ...fs.readdirSync('js').filter(f => f.startsWith('stories-')).sort().map(f => 'js/' + f), 'js/songs.js']) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
}
const { ART, BOOKS, SONGS, WORDS } = ctx.window;
const all = new Set([
  ...ART.CATEGORIES.map(c => c.name),
  ...ART.DRAWINGS.map(d => d.name),
  ...ART.DRAWINGS.map(d => d.en).filter(Boolean),
  ...ART.CATEGORIES.map(c => c.en).filter(Boolean),
  ...BOOKS.flatMap(b => [b.title, ...b.pages.map(p => p.text)]),
  ...WORDS.BRUSHES.map(b => b.name),
  ...SONGS.flatMap(s => [s.title, ...(s.author ? [s.author] : []), ...s.lines]),
  ...WORDS.COLOR_NAMES,
  ...WORDS.PATTERNS.map(p => p.name),
  ...WORDS.SHAPES.map(p => p.name),
  ...WORDS.FIXED,
]);
for (let i = 1; i <= 60; i++) all.add(`白紙 ${i}`);
// 學數學：0~1000 的數字片段、題目用語
for (let n = 0; n <= 1000; n++) WORDS.numberWords(n).forEach(w => all.add(w));
WORDS.MATH_WORDS.forEach(w => all.add(w));

// 全部中文旁白都用 MiniMax 台灣腔講故事大姊姊念（英文另外用英文的聲音）
// --story：故事的句子（念故事用比較慢的速度）
const story = [...new Set(BOOKS.flatMap(b => [b.title, ...b.pages.map(p => p.text)]))];
const out = process.argv.includes('--story') ? story
  : process.argv.includes('--minimax') ? [...all].filter(t => /[\u4e00-\u9fff]/.test(t)) : [...all];
process.stdout.write(JSON.stringify(out, null, 1));
