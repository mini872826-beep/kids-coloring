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


def post(host, path, body, key):
    req = urllib.request.Request(host + path, data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req, timeout=120).read())


def minimax():
    """找 MiniMax 系統聲音裡的台灣腔，每個都念一次"""
    key = os.environ.get('MINIMAX_API_KEY', '').strip()
    if not key:
        report.append('minimax: no key'); return
    host = 'https://api.minimax.io'
    voices = post(host, '/v1/get_voice', {'voice_type': 'system'}, key).get('system_voice') or []
    json.dump(voices, open(f'{OUT}/minimax-voices.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    tw = [v for v in voices if any(k in json.dumps(v, ensure_ascii=False).lower() for k in ('taiwan', '台灣', '台湾'))]
    report.append(f'minimax: {len(voices)} system voices, Taiwan: ' + ', '.join(v['voice_id'] for v in tw))
    for v in tw[:6]:
        vid = v['voice_id']
        safe = ''.join(c if c.isalnum() else '_' for c in vid)
        for i, t in enumerate(LINES):
            try:
                r = post(host, '/v1/t2a_v2', {'model': 'speech-02-hd', 'text': t, 'stream': False,
                                              'voice_setting': {'voice_id': vid, 'speed': 0.95},
                                              'audio_setting': {'format': 'mp3', 'sample_rate': 32000}}, key)
                open(f'{OUT}/mm-{safe}-{i}.mp3', 'wb').write(bytes.fromhex(r['data']['audio']))
            except Exception as e:
                report.append(f'minimax {vid} line {i}: {str(e)[:150]}')
        report.append(f'minimax {vid}: done')


import sys
if 'edge' in sys.argv:
    asyncio.run(edge())
minimax()
open(f'{OUT}/report.txt', 'a', encoding='utf-8').write('\n'.join(report))
print('\n'.join(report))
