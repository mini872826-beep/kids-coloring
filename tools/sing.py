"""把兒歌「唱」出來：AI 聲音一個字一個字錄，再用 WORLD 聲碼器把音高、長度改成歌譜上的音符，
配上 tools/accomp.py 編的伴奏，輸出 audio/sing/<id>-<hash>.mp3，並在 audio/sing/index.json 記下每一句開始的時間。

GitHub Actions 跑（.github/workflows/sing-svs.yml）；歌詞或旋律沒變就不會重做。
用法：python tools/sing.py songs.json        （songs.json 由 node tools/songs.js 產生）
"""
import asyncio
import hashlib
import json
import os
import re
import subprocess
import sys

import numpy as np
import pyworld as pw
import soundfile as sf

import accomp

FS = 24000
FRAME = 5.0                      # WORLD 一格 5 毫秒
VOICE = 'zh-TW-HsiaoYuNeural'
VOICE_EN = 'en-US-AnaNeural'
OUT = 'audio/sing'
CACHE = '.sing-cache'            # 每個字的錄音（不進 git，Actions 用 cache 存）
VERSION = 'v3'                   # 改了合成方法就換號碼，全部重唱
TEMPO = accomp.TEMPO              # 唱的比原本慢一點，字才聽得清楚

CJK = re.compile(r'[一-鿿]')


# ---------------- 歌詞 → 音節 ----------------
SYL_FIX = {'the': 1, 'are': 1, 'fire': 1, 'every': 3, 'everywhere': 3, 'little': 2, 'water': 2,
           'diamond': 2, 'lady': 2, 'merrily': 3, 'gently': 2, 'tumbling': 2, 'tumbling': 2,
           'happy': 2, 'birthday': 2, 'together': 3, 'macdonald': 3, 'e-i-e-i-o': 5, 'abcs': 3,
           'w': 2, 'climbed': 1, 'washed': 1, 'one': 1, 'once': 1, 'came': 1, 'came,': 1, 'mother': 2, 'over': 2,
           'sleeping': 2, 'morning': 2, 'ringing': 2, 'brother': 2, 'humpty': 2, 'dumpty': 2,
           'hickory': 2, 'dickory': 2, 'itsy': 2, 'bitsy': 2, 'spider': 2, 'again': 2,
           'another': 3, 'children': 2, 'surely': 2, 'master': 2, 'falling': 2, 'london': 2,
           'wonder': 2, 'above': 2, 'kings': 1, "king's": 1, "couldn't": 2, "you're": 1, 'fetch': 1}


def syllables(word):
    w = re.sub(r"[^a-z'\-]", '', word.lower())
    if w in SYL_FIX:
        return SYL_FIX[w]
    if '-' in w:
        return sum(syllables(p) for p in w.split('-') if p)
    if len(w) <= 1:
        return 1
    n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and not w.endswith(('le', 'ee')) and n > 1:
        n -= 1
    if w.endswith('es') and not w.endswith(('ses', 'zes', 'ches', 'shes')) and n > 1:
        n -= 1
    return max(1, n)


def tokens(line, english):
    """一句歌詞 → [(要錄的字, 第幾段, 共幾段)]"""
    # ~ = 不唱新的字，前一個字拉長到下一個音（一字多音）
    if not english:
        return [None if ch == '~' else (ch, 0, 1) for ch in re.findall(r'[一-鿿~]', line)]
    out = []
    for w in line.replace(',', ' ').replace('?', ' ').replace('.', ' ').replace('!', ' ').split():
        if w == '~':
            out.append(None)
            continue
        k = syllables(w)
        out += [(w.strip("'"), i, k) for i in range(k)]
    return out


def align(toks, notes):
    """把音節和音符配對：一個音節一個音符（歌譜應該寫成這樣，tools/check_songs.py 會檢查）。
    數量對不上時才自己猜：音節多就把最長的音符切兩半，音節少就讓前一個字拉長（換音高）。"""
    if len(toks) == len(notes):
        return [(e, m, b) for e, (m, b) in zip(toks, notes)]
    print('  WARNING 字數和音符數對不上：', len(toks), len(notes))
    toks = [t for t in toks if t]
    notes = [list(n) for n in notes]
    while len(toks) > len(notes):
        i = max(range(len(notes)), key=lambda k: notes[k][1])
        m, b = notes[i]
        notes[i:i + 1] = [[m, b / 2], [m, b / 2]]
    ev = [None] * len(notes)                 # None = 延長上一個字
    # 多出來的音符：從最長的音符後面開始當延長音
    extra = len(notes) - len(toks)
    hold = set()
    order = sorted(range(1, len(notes)), key=lambda k: -notes[k - 1][1])
    for k in order:
        if len(hold) >= extra:
            break
        if k not in hold and k - 1 not in hold:
            hold.add(k)
    for k in range(len(notes) - 1, 0, -1):   # 還不夠就從後面補
        if len(hold) >= extra:
            break
        hold.add(k)
    it = iter(toks)
    for k in range(len(notes)):
        ev[k] = None if k in hold else next(it)
    return [(e, m, b) for e, (m, b) in zip(ev, notes)]


# ---------------- 錄音（每個字或英文單字一個檔，存在 cache） ----------------
def clip_path(text, voice):
    h = hashlib.sha1(f'{voice}|{text}'.encode()).hexdigest()[:16]
    return os.path.join(CACHE, h + '.wav')


async def record(text, voice):
    path = clip_path(text, voice)
    if os.path.exists(path):
        return path
    import edge_tts
    mp3 = path[:-4] + '.mp3'
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice).save(mp3)
            break
        except Exception as e:
            print('retry', text, e)
            await asyncio.sleep(2 * (attempt + 1))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', str(FS), '-ac', '1', path], check=True)
    os.remove(mp3)
    return path


def load(path):
    x, fs = sf.read(path, dtype='float64')
    if x.ndim > 1:
        x = x.mean(1)
    # 去掉頭尾靜音
    e = np.abs(x)
    th = max(e.max() * .02, 1e-4)
    idx = np.where(e > th)[0]
    return x[idx[0]:idx[-1] + 1] if len(idx) else x


# ---------------- 唱：改音高、改長度 ----------------
def analyse(x):
    f0, t = pw.harvest(x, FS, f0_floor=70, f0_ceil=800, frame_period=FRAME)
    sp = pw.cheaptrick(x, f0, t, FS)
    ap = pw.d4c(x, f0, t, FS)
    return f0, sp, ap


def sing(feat, part, nparts, hz, dur, prev_hz=None):
    f0, sp, ap = feat
    n = len(f0)
    # 英文多音節的字：把這個字的聲音平分成幾段
    a, b = int(n * part / nparts), int(n * (part + 1) / nparts)
    f0, sp, ap = f0[a:b], sp[a:b], ap[a:b]
    voiced = np.where(f0 > 0)[0]
    total = max(8, int(round(dur * 1000 / FRAME)))
    lead = []
    if len(voiced) == 0:
        idx = np.linspace(0, len(f0) - 1, min(total, len(f0))).astype(int)
        newf0 = np.zeros(len(idx))
    else:
        v0, v1 = voiced[0], voiced[-1]
        lead = list(range(max(0, v0 - 16), v0))           # 子音最多留 80 毫秒
        tail = list(range(v1 + 1, min(len(f0), v1 + 7)))   # 尾巴最多 30 毫秒
        core_n = max(6, total - len(lead) - len(tail))
        core = np.linspace(v0, v1, core_n).round().astype(int)
        idx = np.array(lead + list(core) + tail)
        newf0 = np.zeros(len(idx))
        cn = len(core)
        tt = np.arange(cn) * FRAME / 1000
        target = np.full(cn, hz)
        # 一開始從上一個音滑過來一點點（像真人唱）
        if prev_hz:
            g = min(cn, 8)
            target[:g] = prev_hz * (hz / prev_hz) ** (np.arange(g) / g)
        # 長音加一點抖音
        if dur > .45:
            depth = np.clip((tt - .25) / .3, 0, 1) * .35   # 半音
            target = target * 2 ** (depth * np.sin(2 * np.pi * 5.5 * tt) / 12)
        newf0[len(lead):len(lead) + cn] = target
    y = pw.synthesize(np.ascontiguousarray(newf0), np.ascontiguousarray(sp[idx]),
                      np.ascontiguousarray(ap[idx]), FS, FRAME)
    # 淡入淡出
    fi, fo = int(.005 * FS), int(.03 * FS)
    y[:fi] *= np.linspace(0, 1, fi)
    y[-fo:] *= np.linspace(1, 0, fo)
    # 子音那一段要提早唱，母音才會剛好落在拍子上
    return y, int(len(lead) * FRAME / 1000 * FS)


def hold_feat(feat):
    """延長音：拿上一個字的韻母（後半段）來唱"""
    f0, sp, ap = feat
    n = len(f0)
    v = np.where(f0 > 0)[0]
    a = v[len(v) // 2] if len(v) else n // 2
    b = v[-1] + 1 if len(v) else n
    return f0[a:b], sp[a:b], ap[a:b]


def midi_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def render(song):
    english = song['kind'] == 'en-song'
    voice = VOICE_EN if english else VOICE
    lines = song['sing'] or song['lines']
    plan = [align(tokens(l, english), n) for l, n in zip(lines, song['notes'])]
    beat = accomp.beat_sec(song)
    allm = [m for line in song['notes'] for m, _ in line]
    # 人聲移到舒服的音域（中間大約在 G4）
    shift = -12 * round((np.mean(allm) - 67) / 12)

    texts = sorted({e[0] for line in plan for e, _, _ in line if e})
    paths = asyncio.run(_record_all(texts, voice))
    feats = {t: analyse(load(paths[t])) for t in texts}

    # 時間軸和伴奏都由 tools/accomp.py 決定：每句佔滿整數小節，前面有兩小節前奏
    _, _, starts, total = accomp.timeline(song)
    vox = np.zeros(int((total + 1) * FS))
    times = []
    for line, notes, t in zip(plan, song['notes'], starts):
        times.append(round(t, 2))
        last, prev_hz = None, None
        for (e, m, b), (om, _) in zip(line, notes):
            dur = b * beat
            hz = midi_hz(m + shift + accomp.transpose(song))
            if e:
                text, part, k = e
                last = (feats[text], part, k)
                y, pre = sing(feats[text], part, k, hz, dur * .95, prev_hz)
            elif last:
                f = hold_feat(sing_slice(*last))
                y, pre = sing(f, 0, 1, hz, dur * .95, prev_hz)
            else:
                y, pre = np.zeros(1), 0
            prev_hz = hz
            s = int(t * FS)
            v = max(0, s - pre)
            vox[v:v + len(y)] += y[:len(vox) - v]
            t += dur
    acc = accomp.render(song)
    vox = vox[:len(acc)]
    vox /= max(1e-6, np.abs(vox).max())
    return vox, acc, times


def mixdown(vox, acc):
    mix = vox * .85 + acc * .45
    return mix / (max(1e-6, np.abs(mix).max()) / .9)


def sing_slice(feat, part, k):
    f0, sp, ap = feat
    n = len(f0)
    a, b = int(n * part / k), int(n * (part + 1) / k)
    return f0[a:b], sp[a:b], ap[a:b]


async def _record_all(texts, voice):
    os.makedirs(CACHE, exist_ok=True)
    out = {}
    for tx in texts:
        out[tx] = await record(tx, voice)
    return out


def song_key(song):
    raw = json.dumps([VERSION, TEMPO, song['bpm'], song['lines'], song['notes'], song['sing'], song.get('meter'), song.get('pickup'), song.get('compound'),
                      hashlib.sha1(open(accomp.__file__, 'rb').read()).hexdigest()], ensure_ascii=False)
    return hashlib.sha1(raw.encode()).hexdigest()[:10]


def stem(name, kind):
    return f"stems/{name[:-4]}-{kind}.mp3"


def main():
    songs = json.load(open(sys.argv[1], encoding='utf-8'))
    only = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
    os.makedirs(os.path.join(OUT, 'stems'), exist_ok=True)
    ipath = os.path.join(OUT, 'index.json')
    index = json.load(open(ipath, encoding='utf-8')) if os.path.exists(ipath) else {}
    keep = set()
    for song in songs:
        if only and song['id'] not in only:
            if song['id'] in index:
                keep.add(index[song['id']]['file'])
            continue
        name = f"{song['id']}-{song_key(song)}.mp3"
        keep.add(name)
        stems = [stem(name, k) for k in ('vox', 'acc')]
        if (song['id'] in index and index[song['id']]['file'] == name and os.path.exists(os.path.join(OUT, name))
                and all(os.path.exists(os.path.join(OUT, f)) for f in stems)):
            continue
        print('sing:', song['id'])
        vox, acc, times = render(song)
        # 人聲和伴奏也分開存一份：tools/sing_vc.py 拿人聲去換成自然的歌聲，再跟伴奏混在一起
        for y, f, rate in ((mixdown(vox, acc), name, '64k'), (vox * .9, stems[0], '96k'), (acc * .9, stems[1], '48k')):
            wav = os.path.join(CACHE, 'mix.wav')
            sf.write(wav, y, FS)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', rate, os.path.join(OUT, f)], check=True)
        index[song['id']] = {'file': name, 'times': times}
    index = {k: v for k, v in index.items() if v['file'] in keep}
    keep |= {stem(v['file'], k) for v in index.values() for k in ('vox', 'acc')}
    for f in os.listdir(OUT) + ['stems/' + f for f in os.listdir(os.path.join(OUT, 'stems'))]:
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f))
    with open(ipath, 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, indent=0, sort_keys=True)
    print(len(index), 'songs sung')


if __name__ == '__main__':
    main()
