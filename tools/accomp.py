"""兒歌伴奏：照每首歌的旋律自動配和弦，再編成低音、節奏和幾種樂器（不跟著主旋律彈），
用免費的 FluidR3 GM 音色庫（MIT）透過 fluidsynth 彈出來。速度和調都跟原本的歌一樣。

  timeline(song)  每句從第幾秒開始（tools/sing.py、tools/sing_svs.py 都用這個，人聲和伴奏才會對齊）
  render(song)    伴奏的聲音（numpy，24000 Hz 單聲道）

風格（STYLE）：
  gentle  鋼琴分解和弦＋弦樂鋪底＋鋼片琴點綴，輕柔不加鼓（搖籃曲、慢歌）
  bouncy  吉他刷和弦＋低音＋鼓、拍手、鈴鼓＋鐘琴（活潑的歌）
  marimba 馬林巴琴分解和弦＋撥奏弦樂＋木魚、沙鈴（輕快可愛的歌）
"""
import math, os, random, subprocess, tempfile

import mido
import numpy as np
import soundfile as sf

FS = 24000
TEMPO = .85                      # 和 tools/sing.py 一樣：比原本的速度慢一點，字才聽得清楚
SF2 = os.environ.get('SF2', '/usr/share/sounds/sf2/FluidR3_GM.sf2')
T0 = .3                          # 開頭留一點點空白
TPB = 480                        # MIDI 一拍幾格

STYLE = {
    'little-star': 'gentle', 'en-twinkle': 'gentle', 'goodnight-song': 'gentle', 'mom-dad': 'gentle',
    'en-row': 'gentle', 'sheep-home': 'gentle', 'en-baa': 'gentle',
    'two-tigers': 'bouncy', 'en-john': 'bouncy', 'old-farm': 'bouncy', 'en-farm': 'bouncy', 'tricycle': 'bouncy',
    'pull-carrot': 'bouncy', 'animal-sounds': 'bouncy', 'vehicle-song': 'bouncy', 'en-happy': 'bouncy',
    'birthday': 'bouncy', 'en-birthday': 'bouncy', 'en-abc': 'bouncy', 'london-bridge': 'bouncy',
    'en-london': 'bouncy',
}
# 大調常用的和弦（相對主音：0 = Do），後面的數字是「比較常用」的加分
CHORDS = {'I': ([0, 4, 7], .35), 'IV': ([5, 9, 0], .25), 'V': ([7, 11, 2], .3), 'vi': ([9, 0, 4], .12),
          'ii': ([2, 5, 9], .02), 'iii': ([4, 7, 11], 0)}


def tonic(song):
    """主音：這裡的兒歌都是 C 大調，只有結束在 Sol、而且沒用到 Fa 的（王老先生）是 G 大調"""
    pcs = {p % 12 for line in song['notes'] for p, _ in line}
    return 7 if song['notes'][-1][-1][0] % 12 == 7 and 5 not in pcs else 0


def meter(song):
    return song.get('meter') or 2


def tempo(song):
    """英文兒歌放慢太多會拖拖拉拉、沒精神，只慢一點點"""
    return .95 if song['kind'] == 'en-song' else TEMPO


def transpose(song):
    """英文兒歌整首升兩個半音（C 大調 → D 大調），人聲和伴奏一起升，聽起來比較明亮有精神"""
    return 2 if song['kind'] == 'en-song' else 0


def beat_sec(song):
    return 60 / (song['bpm'] * tempo(song))


def pickups(song):
    """每句前面有幾拍是「弱拍進來」的（例如 Mary had a little lamb, *its* fleece 的 its）"""
    p = song.get('pickup') or 0
    return list(p) if isinstance(p, list) else [p] * len(song['notes'])


def sub(song):
    """一拍切幾份：一般 2 份（八分音符），6/8 拍的搖擺歌 3 份（三連音）"""
    return 3 if song.get('compound') else 2


def timeline(song):
    """回傳（一拍幾秒, 每句開始的拍數, 每句開始的秒數, 整首結束的秒數）。
    每句的重拍落在小節的第一拍（弱拍進來的字放在前一小節的尾巴），伴奏的節拍才會一直穩穩的；
    開頭先彈 2 小節前奏。6/8 拍的歌一拍 = 附點四分音符（一小節 2 拍）。"""
    m = meter(song)
    beat = beat_sec(song)
    pos = 2 * m                                    # 第一句的重拍（前面是 2 小節前奏）
    starts, end = [], 0
    for notes, p in zip(song['notes'], pickups(song)):
        while pos - p < end - 1e-6:                # 弱拍會蓋到上一句：往後一小節
            pos += m
        starts.append(pos - p)
        end = pos - p + sum(b for _, b in notes)
        pos = max(pos + m, math.ceil(end / m - 1e-6) * m)
    end_beats = pos + 2 * m                        # 最後一個和弦留兩小節收尾
    return beat, starts, [round(T0 + s * beat, 3) for s in starts], T0 + end_beats * beat


def chords(song):
    """每小節（2 或 3 拍）選一個和弦：旋律的音落在和弦裡越多越好（拍子上的音更重要）"""
    m = meter(song)
    _, starts, _, _ = timeline(song)
    starts = [s - (2 * m) for s in starts]          # 從第一句的重拍開始算（前奏另外處理）
    key = tonic(song)
    events = []                                    # (開始拍, 長度, 相對主音的音名)
    for st, notes in zip(starts, song['notes']):
        t = st
        for p, b in notes:
            events.append((t, b, (p - key) % 12))
            t += b
    nbars = math.ceil((starts[-1] + sum(b for _, b in song['notes'][-1])) / m - 1e-6)
    line_end = {math.ceil((st + sum(b for _, b in n)) / m - 1e-6) - 1 for st, n in zip(starts, song['notes'])}
    out, prev = [], 'I'
    for k in range(nbars):
        a, z = k * m, (k + 1) * m
        best, score = prev, -1e9
        heard = False
        for name, (pcs, bonus) in CHORDS.items():
            sc = bonus + (.15 if name == prev else 0)
            for t, b, pc in events:
                ov = min(z, t + b) - max(a, t)
                if ov <= 0:
                    continue
                heard = True
                w = ov * (1.6 if abs(t - a) < 1e-6 or t < a else 1)   # 小節第一拍的音最重要
                sc += w if pc in pcs else -.7 * w
            if k in line_end and name in ('I', 'V'):
                sc += .2
            if sc > score:
                best, score = name, sc
        out.append(best if heard else prev)
        prev = out[-1]
    out[-1] = 'I'                                  # 最後一定回到主和弦
    if len(out) > 1 and out[-2] == 'I':
        out[-2] = 'V'                              # 收尾前先到屬和弦，聽起來才有「結束了」的感覺
    return out


def voicing(name, low, key=0):
    """和弦的音（從 low 往上排）"""
    pcs = [(p + key) % 12 for p in CHORDS[name][0]]
    root = low + (pcs[0] - low) % 12
    return [root + (pc - pcs[0]) % 12 for pc in pcs]


class Track:
    def __init__(self, ch, program=None):
        self.ch, self.program, self.ev = ch, program, []

    def note(self, beat_pos, length, pitch, vel):
        vel = max(1, min(127, int(vel)))
        self.ev.append((beat_pos, 1, pitch, vel))
        self.ev.append((beat_pos + length, 0, pitch, 0))

    def midi(self, tempo_us):
        tr = mido.MidiTrack()
        tr.append(mido.MetaMessage('set_tempo', tempo=tempo_us, time=0))
        if self.program is not None:
            tr.append(mido.Message('program_change', channel=self.ch, program=self.program, time=0))
        now = 0
        for pos, on, p, v in sorted(self.ev, key=lambda e: (e[0], e[1])):
            tick = int(round(pos * TPB))
            tr.append(mido.Message('note_on' if on else 'note_off', channel=self.ch, note=p, velocity=v,
                                   time=max(0, tick - now)))
            now = max(now, tick)
        return tr


def arrange(song):
    m = meter(song)
    beat, starts, _, end = timeline(song)
    prog = chords(song)
    key = (tonic(song) + transpose(song)) % 12
    style = STYLE.get(song['id'], 'marimba')
    rnd = random.Random(song['id'])
    hum = lambda v: v + rnd.randint(-6, 6)
    t0b = T0 / beat                                # 開頭空白換成拍數
    bass = Track(1, 32)                            # 原聲貝斯
    drums = Track(9)
    tracks = [bass, drums]
    if style == 'gentle':
        keys, pad, sparkle = Track(0, 0), Track(2, 49), Track(3, 8)          # 鋼琴、慢弦樂、鋼片琴
        tracks += [keys, pad, sparkle]
    elif style == 'bouncy':
        keys, sparkle = Track(0, 25), Track(3, 9)                            # 鋼弦吉他、鐘琴
        tracks += [keys, sparkle]
    else:
        keys, pizz, sparkle = Track(0, 12), Track(2, 45), Track(3, 13)       # 馬林巴、撥奏弦樂、木琴
        tracks += [keys, pizz, sparkle]
    lines_at = {math.ceil((s - 2 * m) / m - 1e-6) for s in starts}
    n = sub(song)                                  # 一拍切幾份
    for k in range(-2, len(prog) + 1):             # 前奏 2 小節（主和弦、屬和弦）＋歌＋最後的長和弦
        name = 'I' if k == -2 else 'V' if k == -1 else (prog[k] if k < len(prog) else 'I')
        b0 = t0b + (k + 2) * m
        last = k >= len(prog)
        ch = voicing(name, 55, key)                     # G3 以上
        root = voicing(name, 36, key)[0]                # C2 附近
        if last:
            if k == len(prog):                     # 最後一個和弦拉長
                bass.note(b0, m * 2, root, 70)
                for p in voicing(name, 60, key):
                    keys.note(b0, m * 2, p, 62)
                sparkle.note(b0, m * 2, voicing(name, 84, key)[0], 55)
                drums.note(b0, 1, 49 if style == 'bouncy' else 81, 60)
            continue
        fill = (k + 1) in lines_at and k >= 0      # 下一小節換新的一句：加一點過門
        if style == 'gentle':
            bass.note(b0, m * .95, root, hum(58))
            pat = [voicing(name, 48, key)[0], voicing(name, 55, key)[0], voicing(name, 60, key)[1], voicing(name, 60, key)[2]]
            for i in range(int(m * n)):            # 分解和弦（八分音符；6/8 拍是三連音）
                order = [0, 1, 2, 1] if n == 2 and m == 2 else [0, 1, 2, 1, 2, 3] if n == 2 else [0, 1, 2, 3, 2, 1]
                keys.note(b0 + i / n, .9, pat[order[i % len(order)]], hum(48 if i % n else 56))
            for p in voicing(name, 60, key):
                pad.note(b0, m, p, 34)
            if k % 2 == 0 and k >= 0:
                sparkle.note(b0, .8, voicing(name, 84, key)[rnd.randint(0, 2)], hum(40))
            if song['id'] != 'goodnight-song':
                for i in range(int(m * n)):
                    drums.note(b0 + i / n, .1, 70, hum(26 if i % n else 34))     # 沙鈴
        elif style == 'bouncy':
            if m == 3:                             # 三拍子：蹦－恰－恰
                bass.note(b0, .9, root, hum(80))
                for i in (1, 2):
                    for j, p in enumerate(ch):
                        keys.note(b0 + i + j * .02, .45, p, hum(60))
                drums.note(b0, .1, 36, hum(70))
                for i in (1, 2):
                    drums.note(b0 + i, .1, 42, hum(45))
            else:
                bass.note(b0, .9, root, hum(85))
                bass.note(b0 + 1, .9, root + 7 if root + 7 < 52 else root - 5, hum(75))
                for i in ([0, .5, 1, 1.5] if n == 2 else [0, 2 / 3, 1, 5 / 3]):   # 吉他刷：下、上、下、上（6/8 拍長短長短）
                    up = i % 1 > 0
                    for j, p in enumerate(reversed(ch) if up else ch):
                        keys.note(b0 + i + j * .015, .4, p, hum(52 if up else 66))
                drums.note(b0, .1, 36, hum(82))
                drums.note(b0 + 1, .1, 39 if k % 2 else 38, hum(64))         # 拍手、小鼓輪流
                for i in range(2 * n):
                    drums.note(b0 + i / n, .1, 42, hum(40 if i % n else 50))
                drums.note(b0 + (n - 1) / n, .1, 54, hum(38))
                drums.note(b0 + 1 + (n - 1) / n, .1, 54, hum(38))
                if fill:
                    for i, p in enumerate((48, 47, 45)):                     # 小小的鼓過門
                        drums.note(b0 + 1 + i * .25 + .25, .1, p, hum(60))
            if k % 2 == 0 and k >= 0:
                sparkle.note(b0, .5, voicing(name, 84, key)[(k // 2) % 3], hum(46))
                sparkle.note(b0 + .5, .5, voicing(name, 84, key)[((k // 2) + 1) % 3], hum(40))
        else:
            bass.note(b0, .8, root, hum(72))
            pat = [voicing(name, 60, key)[0], voicing(name, 60, key)[1], voicing(name, 60, key)[2], voicing(name, 60, key)[1]]
            for i in range(int(m * n)):
                keys.note(b0 + i / n, .45, pat[i % 4] if n == 2 else pat[[0, 1, 2][i % 3]], hum(58 if i % n == 0 else 48))
            for i in range(int(m)):
                pizz.note(b0 + i + (n - 1) / n, .3, voicing(name, 48, key)[1 + i % 2], hum(42))
            drums.note(b0, .1, 36, hum(48))
            for i in range(int(m * n)):
                drums.note(b0 + i / n, .1, 70, hum(30 if i % n else 40))     # 沙鈴
            drums.note(b0 + (n - 1) / n, .1, 76 if k % 2 else 77, hum(44))     # 木魚
            if fill:
                for i, p in enumerate(voicing(name, 72, key) + [voicing(name, 84, key)[0]]):
                    sparkle.note(b0 + 1 + i * .25, .25, p, hum(46))           # 木琴小小的跑音
    tempo_us = int(round(beat * 1e6))
    mid = mido.MidiFile(ticks_per_beat=TPB)
    for tr in tracks:
        mid.tracks.append(tr.midi(tempo_us))
    return mid, end


def render(song):
    mid, end = arrange(song)
    with tempfile.TemporaryDirectory() as d:
        mp, wp = os.path.join(d, 'a.mid'), os.path.join(d, 'a.wav')
        mid.save(mp)
        subprocess.run(['fluidsynth', '-ni', '-q', '-g', '0.7', '-r', str(FS), '-F', wp, SF2, mp],
                       check=True, capture_output=True)
        x, fs = sf.read(wp, dtype='float64')
    if x.ndim > 1:
        x = x.mean(1)
    n = int(end * FS)
    x = np.pad(x, (0, max(0, n - len(x))))[:n]
    fo = int(.8 * FS)
    x[-fo:] *= np.linspace(1, 0, fo)
    return x / max(1e-6, np.abs(x).max())
