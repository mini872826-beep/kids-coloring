"""故事、兒歌唐詩、畫畫的中文句子用 MiniMax 的「台灣腔講故事大姊姊」念（tools/voice/minimax.json），錄好放在 audio/。
只錄還沒錄過的句子；頭尾靜音修掉、音量調到和其他旁白一樣。檔名由 tools/gen_voice.py 的 mm_name() 決定。
用法：MINIMAX_API_KEY=... MINIMAX_PHRASES=minimax.json python tools/minimax_voice.py
"""
import json, os, subprocess, sys, time, urllib.error, urllib.request

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from gen_voice import MM, OUT, STORY, TRIM, mm_name   # noqa: E402

KEY = os.environ.get('MINIMAX_API_KEY', '').strip()
HOST = 'https://api.minimax.io'
LOUD = -21.8     # 和志工 1 的旁白一樣大聲（dB）


def say(text):
    body = {'model': MM['model'], 'text': text, 'stream': False,
            'voice_setting': {'voice_id': MM['voice_id'], 'speed': MM['speed']},
            'audio_setting': {'format': 'mp3', 'sample_rate': 32000}}
    req = urllib.request.Request(HOST + '/v1/t2a_v2', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
    res = json.loads(urllib.request.urlopen(req, timeout=120).read())
    audio = (res.get('data') or {}).get('audio')
    if not audio:
        raise RuntimeError(json.dumps(res.get('base_resp'), ensure_ascii=False))
    return bytes.fromhex(audio)


def save(data, path):
    open('/tmp/mm.mp3', 'wb').write(data)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/mm.mp3', '-af', TRIM, '-ar', '24000', '-ac', '1', '/tmp/mm.wav'], check=True)
    y, fs = sf.read('/tmp/mm.wav')
    y = y * 10 ** ((LOUD - 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)) / 20)
    y = y / max(1, np.abs(y).max() / 0.89)
    sf.write('/tmp/mm.wav', y, fs)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/mm.wav', '-b:a', '48k', path], check=True)


def main():
    if not KEY:
        sys.exit('沒有 MINIMAX_API_KEY，故事先用其他聲音')
    todo = [t for t in sorted(STORY) if not os.path.exists(os.path.join(OUT, mm_name(t)))]
    print(f'{len(todo)} phrases for MiniMax')
    fails = 0
    for i, t in enumerate(todo):
        for attempt in range(3):
            try:
                save(say(t), os.path.join(OUT, mm_name(t)))
                break
            except Exception as e:   # 網路不穩、太快被擋：等一下再試
                print(f'retry {attempt + 1}: {t} ({str(e)[:200]})')
                time.sleep(5 * (attempt + 1))
        else:
            fails += 1
            if fails >= 5:
                sys.exit('MiniMax 一直失敗，先停下來（可能是額度用完）')
        if i % 50 == 0:
            print(i, '/', len(todo))
    print('done, failed', fails)


if __name__ == '__main__':
    main()
