"""講故事的聲音試聽：同幾句故事，用微軟曉曉、曉伊、曉臻（台灣）和 MiniMax（帳號能用的話）各念一次，放到 trial/story/。"""
import asyncio, json, os, urllib.request, urllib.error
import edge_tts

LINES = ['三隻小豬',
         '豬媽媽說：「孩子們長大了，去蓋自己的房子吧！」',
         '豬大哥用稻草蓋房子，一下子就蓋好了。',
         '大野狼來了！牠用力一吹，呼——稻草屋倒了！',
         '豬小弟說：「別怕別怕，快躲進我的磚頭屋！」']
EDGE = {'xiaoxiao': 'zh-CN-XiaoxiaoNeural', 'xiaoyi': 'zh-CN-XiaoyiNeural', 'hsiaochen': 'zh-TW-HsiaoChenNeural'}
OUT = 'trial/story'
os.makedirs(OUT, exist_ok=True)
report = []


async def edge():
    for name, voice in EDGE.items():
        for i, t in enumerate(LINES):
            await edge_tts.Communicate(t, voice, rate='-5%').save(f'{OUT}/{name}-{i}.mp3')
        report.append(f'{name}: ok')


def minimax():
    key = os.environ.get('MINIMAX_API_KEY', '').strip()
    if not key:
        report.append('minimax: no key'); return
    for host in ('https://api.minimax.io', 'https://api.minimaxi.com'):
        for model in ('speech-02-hd', 'speech-02-turbo', 'speech-01-turbo'):
            for voice in ('female-shaonv', 'female-tianmei', 'female-yujie'):
                body = {'model': model, 'text': LINES[1], 'stream': False,
                        'voice_setting': {'voice_id': voice, 'speed': 0.95, 'emotion': 'happy'},
                        'audio_setting': {'format': 'mp3', 'sample_rate': 32000}}
                req = urllib.request.Request(host + '/v1/t2a_v2', data=json.dumps(body).encode(),
                                             headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
                try:
                    res = json.loads(urllib.request.urlopen(req, timeout=120).read())
                except urllib.error.HTTPError as e:
                    report.append(f'minimax {host} {model} {voice}: http {e.code} {e.read().decode()[:150]}'); continue
                except Exception as e:
                    report.append(f'minimax {host} {model} {voice}: {str(e)[:150]}'); continue
                audio = (res.get('data') or {}).get('audio')
                report.append(f"minimax {host} {model} {voice}: {json.dumps(res.get('base_resp'), ensure_ascii=False)[:150]}")
                if audio:
                    for i, t in enumerate(LINES):
                        body['text'] = t
                        req = urllib.request.Request(host + '/v1/t2a_v2', data=json.dumps(body).encode(),
                                                     headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
                        r = json.loads(urllib.request.urlopen(req, timeout=120).read())
                        open(f'{OUT}/minimax-{voice}-{i}.mp3', 'wb').write(bytes.fromhex(r['data']['audio']))
                    return


asyncio.run(edge())
minimax()
open(f'{OUT}/report.txt', 'w', encoding='utf-8').write('\n'.join(report))
print('\n'.join(report))
