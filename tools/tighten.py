"""人聲對拍：AI 歌手唱的每個音，有的早一點、有的晚一點（聽起來一下搶拍、一下掉拍）。
這裡先找出每個音實際開始的時間（音高換過去、或聲音冒出來的那一刻），
再用 Rubber Band 把聲音一段一段拉長或縮短，讓每個音都落在歌譜的時間上；音高和音色不變。

  anchors(song, x)          找出「實際時間 → 歌譜時間」的對照點
  tighten(song, src, dst)   對好拍子寫到 dst（wav）
  report(song, x)           每個換音的時間誤差（毫秒），檢查用
"""
import os, subprocess, sys, tempfile

import numpy as np
import pyworld as pw
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
import sing_svs   # noqa: E402

FS = 24000
FRAME = 5.0      # 毫秒


def notes(song):
    """[(歌譜開始秒數, 長度, 音高, 是否一句的第一個音)]（空白不算）"""
    out = []
    for g in sing_svs.segments(song):
        t = g['time'][0] / 1000
        first = True
        for d, p, ty in zip(g['dur'], g['pitch'], g['type']):
            if ty != 1:
                out.append((t, d, p, first))
                first = False
            t += d
    return out


def analyse(x):
    f0, _ = pw.harvest(x.astype(np.float64), FS, f0_floor=80, f0_ceil=1000, frame_period=FRAME)
    midi = np.where(f0 > 0, 69 + 12 * np.log2(np.maximum(f0, 1) / 440), np.nan)
    hop = int(FS * FRAME / 1000)
    n = len(midi)
    rms = np.array([np.sqrt((x[i * hop:i * hop + hop * 2] ** 2).mean()) if i * hop < len(x) else 0 for i in range(n)])
    return midi, rms / (rms.max() + 1e-9)


def expected(song, n):
    """歌譜每 5 毫秒應該是什麼音（沒唱的地方是 nan）"""
    sec = FRAME / 1000
    e = np.full(n, np.nan)
    for t, d, p, _ in notes(song):
        e[int(t / sec):min(n, int((t + d) / sec))] = p
    return e


def path(song, x, band=.45):
    """DTW：把實際唱的音高曲線和歌譜對齊，回傳每個歌譜格子對到實際的哪一格"""
    midi, rms = analyse(x)
    n = len(midi)
    e = expected(song, n)
    sec = FRAME / 1000
    w = int(band / sec)
    INF = 1e9
    # 只在對角線附近 ±band 秒找（不會亂跳）
    D = np.full((n + 1, 2 * w + 1), INF)
    D[0, w] = 0
    back = np.zeros((n + 1, 2 * w + 1), dtype=np.int8)

    def cost(i, j):
        a, b = e[i], midi[j]
        if np.isnan(a) and np.isnan(b):
            return 0
        if np.isnan(a) or np.isnan(b):
            return 1.5 if (np.isnan(a) and rms[j] > .05) or np.isnan(b) else .3
        return min(abs(a - b), 3)
    for i in range(1, n + 1):
        for k in range(2 * w + 1):
            j = i + k - w
            if j < 1 or j > n:
                continue
            c = cost(i - 1, j - 1)
            opts = (D[i - 1, k], D[i, k - 1] if k > 0 else INF, D[i - 1, k + 1] if k + 1 <= 2 * w else INF)
            m = int(np.argmin(opts))
            D[i, k] = c + opts[m] + (0 if m == 0 else .05)
            back[i, k] = m
    # 往回走
    i, k = n, w
    match = np.zeros(n + 1, dtype=int)
    while i > 0:
        match[i] = i + k - w
        m = back[i, k]
        if m == 0:
            i -= 1
        elif m == 1:
            k -= 1
        else:
            i -= 1
            k += 1
    return match[1:] - 1


LEAD = .02   # 子音比拍子早一點點開始，母音才剛好落在拍子上（像真人唱歌）


def flux_of(x):
    hop, win = 120, 1024
    n = (len(x) - win) // hop
    w = np.hanning(win)
    S = np.abs(np.fft.rfft(np.stack([x[i * hop:i * hop + win] * w for i in range(n)]), axis=1))
    f = np.r_[0, np.maximum(0, np.diff(np.log1p(100 * S), axis=0)).sum(1)]
    return f / (f.max() + 1e-9), hop


def anchors(song, x):
    """每個新的字：在歌譜時間前後找聲音突然冒出來（子音）的那一刻 → 拉到歌譜時間（早 LEAD 秒）"""
    f, hop = flux_of(x)
    pts, last_a, last_b = [], -1, -1
    for g in sing_svs.segments(song):
        t = g['time'][0] / 1000
        for d, ty in zip(g['dur'], g['type']):
            if ty == 2:
                a, b = int((t - .2) * FS / hop), int((t + min(.25, d * .6)) * FS / hop)
                if 0 < a < b <= len(f) and f[a:b].max() > .05:
                    src = (a + np.argmax(f[a:b])) * hop / FS
                    dst = t - LEAD
                    if src > last_a + .04 and dst > last_b + .04:
                        pts.append((src, dst))
                        last_a, last_b = src, dst
            t += d
    return pts


def onsets(song, x):
    """獨立檢查：每個新字（type 2）在歌譜時間附近，聲音頻譜突然變化（子音／新的字）的時間差（毫秒）"""
    hop, win = 120, 1024
    n = (len(x) - win) // hop
    w = np.hanning(win)
    S = np.abs(np.fft.rfft(np.stack([x[i * hop:i * hop + win] * w for i in range(n)]), axis=1))
    flux = np.r_[0, np.maximum(0, np.diff(np.log1p(100 * S), axis=0)).sum(1)]
    out = []
    for g in sing_svs.segments(song):
        t = g['time'][0] / 1000
        for d, ty in zip(g['dur'], g['type']):
            if ty == 2:
                a, b = int((t - .15) * FS / hop), int((t + min(.2, d * .6)) * FS / hop)
                if 0 < a < b <= n:
                    out.append(round(((a + np.argmax(flux[a:b])) * hop / FS - t) * 1000))
            t += d
    return out


def report(song, x):
    return [round((a - b) * 1000) for a, b in anchors(song, x)]


def tighten(song, src, dst):
    x, fs = sf.read(src)
    if x.ndim > 1:
        x = x.mean(1)
    assert fs == FS, fs
    pts = anchors(song, x)
    n = len(x)
    with tempfile.TemporaryDirectory() as d:
        mp = os.path.join(d, 'map.txt')
        with open(mp, 'w') as f:
            f.write('0 0\n')
            for a, b in pts:
                f.write(f'{int(a * FS)} {int(b * FS)}\n')
        subprocess.run(['rubberband', '-q', '-2', '-D', f'{n / FS:.6f}', '-M', mp, src, dst], check=True,
                       capture_output=True)
    y, _ = sf.read(dst)
    if y.ndim > 1:
        y = y.mean(1)
    y = np.pad(y, (0, max(0, n - len(y))))[:n]
    sf.write(dst, y, FS)
    return len(pts)
