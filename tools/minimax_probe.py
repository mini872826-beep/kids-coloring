"""測試 MiniMax 唱歌：看帳號能用哪些模型（優先免費），各做一首試聽放到 trial/。
金鑰從環境變數 MINIMAX_API_KEY 讀，不會印出來。"""
import base64, json, os, sys, urllib.request, urllib.error

KEY = os.environ.get('MINIMAX_API_KEY', '').strip()
HOSTS = ['https://api.minimax.io', 'https://api.minimaxi.com']
os.makedirs('trial', exist_ok=True)
index = json.load(open('audio/sing/index.json', encoding='utf-8'))

SONGS = {
    'little-star': ('小星星', ['一閃一閃亮晶晶', '滿天都是小星星', '掛在天上放光明', '好像許多小眼睛', '一閃一閃亮晶晶', '滿天都是小星星'],
                    "Children's nursery rhyme in Taiwanese Mandarin, sweet gentle young female voice, slow and clear, music box, glockenspiel and soft piano, lullaby, warm"),
    'en-twinkle': ('Twinkle', ['Twinkle, twinkle, little star', 'How I wonder what you are', 'Up above the world so high', 'Like a diamond in the sky', 'Twinkle, twinkle, little star', 'How I wonder what you are'],
                   "Classic English nursery rhyme for toddlers, sweet clear young female voice, slow tempo, music box, glockenspiel and soft piano, gentle and warm"),
}


def call(host, body):
    req = urllib.request.Request(host + '/v1/music_generation', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'http_error': e.code, 'body': e.read().decode()[:300]}
    except Exception as e:
        return {'error': str(e)[:300]}


def summary(res):
    if 'base_resp' in res:
        return f"code={res['base_resp'].get('status_code')} msg={res['base_resp'].get('status_msg')}"
    return json.dumps(res, ensure_ascii=False)[:300]


def save(res, name):
    audio = (res.get('data') or {}).get('audio')
    if not audio:
        return False
    if audio.startswith('http'):
        data = urllib.request.urlopen(audio, timeout=120).read()
    else:
        data = bytes.fromhex(audio)
    open(f'trial/{name}.mp3', 'wb').write(data)
    return True


if not KEY:
    sys.exit('沒有 MINIMAX_API_KEY')

report = []
host_ok = None
for sid, (title, lines, style) in SONGS.items():
    lyrics = '[verse]\n' + '\n'.join(lines)
    ref = base64.b64encode(open('audio/sing/' + index[sid]['file'], 'rb').read()).decode()
    tries = [
        ('cover-free', {'model': 'music-cover-free', 'prompt': style, 'lyrics': lyrics, 'audio_base64': ref}),
        ('cover', {'model': 'music-cover', 'prompt': style, 'lyrics': lyrics, 'audio_base64': ref}),
        ('3.0-free', {'model': 'music-3.0-free', 'prompt': style, 'lyrics': lyrics}),
        ('2.6-free', {'model': 'music-2.6-free', 'prompt': style, 'lyrics': lyrics}),
        ('2.6', {'model': 'music-2.6', 'prompt': style, 'lyrics': lyrics}),
        ('3.0', {'model': 'music-3.0', 'prompt': style, 'lyrics': lyrics}),
    ]
    for label, body in tries:
        body['audio_setting'] = {'sample_rate': 44100, 'bitrate': 128000, 'format': 'mp3'}
        body['output_format'] = 'hex'
        for host in ([host_ok] if host_ok else HOSTS):
            res = call(host, body)
            ok = save(res, f'minimax-{sid}-{label}')
            line = f'{sid} {label} {host}: {"SAVED " if ok else ""}{summary(res)}'
            print(line, flush=True)
            report.append(line)
            if 'base_resp' in res:
                host_ok = host
                break
open('trial/minimax-report.txt', 'w', encoding='utf-8').write('\n'.join(report) + '\n')
