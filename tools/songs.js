// 把有旋律的兒歌（歌詞 + 音符）匯出成 JSON，給 tools/sing.py 合成唱歌的聲音。
// 用法：node tools/songs.js > songs.json
const fs = require('fs');
const vm = require('vm');
const ctx = { window: {}, console };
vm.createContext(ctx);
const js = f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
js('js/words.js');
js('js/art.js');
for (const f of fs.readdirSync('js').filter(f => f.startsWith('pack-')).sort()) js('js/' + f);
js('js/songs.js');

const out = ctx.window.SONGS.filter(s => s.notes && s.kind !== 'times').map(s => ({
  id: s.id, kind: s.kind, bpm: s.bpm, lines: s.lines, notes: s.notes, sing: s.sing || null, meter: s.meter || null,
}));
process.stdout.write(JSON.stringify(out, null, 1));
