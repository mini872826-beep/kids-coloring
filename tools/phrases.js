// 列出 App 裡所有會念出來的句子（給 gen_voice.py 錄音用）
// 用法：node tools/phrases.js > phrases.json
//       node tools/phrases.js --minimax > minimax.json   用 MiniMax 台灣腔講故事大姊姊念的句子（全部中文）
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['js/words.js', 'js/art.js', ...fs.readdirSync('js').filter(f => f.startsWith('pack-')).sort().map(f => 'js/' + f), 'js/books.js', ...fs.readdirSync('js').filter(f => f.startsWith('stories-')).sort().map(f => 'js/' + f), 'js/songs.js', 'school/js/shelf.js', ...fs.readdirSync('school/js/books').sort().map(f => 'school/js/books/' + f)]) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
}
const { ART, BOOKS, SONGS, WORDS, SHELF } = ctx.window;
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
// 學注音：符號念法、音節的代表字、例詞、題目用語
WORDS.ZHUYIN_WORDS.forEach(w => all.add(w));
// 小書包學習本（school/，另一個 App，錄音共用）：單字、句型、念謠和中文意思（英文用英文的聲音，中文用老師的聲音）
SHELF.phrases().forEach(w => all.add(w));
// 慢速英文（0.75 倍、0.5 倍），小朋友聽不清楚時可以放慢
SHELF.phrases().filter(w => /^[\x00-\x7F]+$/.test(w)).forEach(w => { all.add('slow75:' + w); all.add('slow50:' + w); });

// 全部中文旁白都用 MiniMax 台灣腔講故事大姊姊念（英文另外用英文的聲音）
// --story：故事的句子（念故事用比較慢的速度）
const story = [...new Set(BOOKS.flatMap(b => [b.title, ...b.pages.map(p => p.text)]))];
// --zhuyin-read：注音 → 要念的字（ㄅ → 玻、ㄅㄚˊ → 拔）。這些用注音當 key 的發音由 gen_voice.py 用微軟曉臻錄
if (process.argv.includes('--zhuyin-read')) { process.stdout.write(JSON.stringify(WORDS.ZHUYIN.SAY, null, 1)); process.exit(0); }
const out = process.argv.includes('--story') ? story
  : process.argv.includes('--minimax') ? [...all].filter(t => /[\u4e00-\u9fff]/.test(t)) : [...all];
process.stdout.write(JSON.stringify(out, null, 1));
