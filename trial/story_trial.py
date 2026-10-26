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
    # 內建聲音沒有標「台灣」：挑南方口音、溫柔的女聲；再用「聲音設計」做一個台灣腔講故事的大姊姊
    picks = ['Chinese (Mandarin)_Soft_Girl', 'Chinese (Mandarin)_Warm_Girl', 'Chinese (Mandarin)_Sweet_Lady',
             'Chinese (Mandarin)_Crisp_Girl']
    try:
        r = post(host, '/v1/voice_design', {
            'prompt': '一位講台灣腔國語的年輕女生，聲音溫柔甜美、咬字清楚，像幼兒園老師在講故事給小朋友聽，語調起伏豐富、有感情。',
            'preview_text': LINES[1]}, key)
        report.append('voice_design: ' + json.dumps(r.get('base_resp'), ensure_ascii=False)[:200])
        if r.get('voice_id'):
            picks.insert(0, r['voice_id'])
            report.append('voice_design voice_id: ' + r['voice_id'])
    except urllib.error.HTTPError as e:
        report.append(f'voice_design: http {e.code} {e.read().decode()[:200]}')
    except Exception as e:
        report.append(f'voice_design: {str(e)[:200]}')
    for n, vid in enumerate(picks):
        safe = 'design' if n == 0 and not vid.startswith('Chinese') else vid.split('_', 1)[1]
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
