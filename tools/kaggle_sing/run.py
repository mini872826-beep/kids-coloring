"""在 Kaggle 免費 GPU 上跑 ACE-Step 1.5，把兒歌唱成像真人唱的版本（試聽版）。
cover：拿 App 裡旋律正確的版本當參考，保留旋律、換成自然的人聲。"""
import json, os, subprocess, sys, time, traceback, urllib.request

OUT = '/kaggle/working'
LOG = open(f'{OUT}/log.txt', 'w')


def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()


def sh(cmd, cwd=None):
    log('$', cmd)
    r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    log((r.stdout or '')[-3000:], (r.stderr or '')[-3000:])
    if r.returncode:
        raise RuntimeError(f'failed: {cmd}')


RAW = 'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/main/'
ACE = '/kaggle/tmp/ace'
JOBS = [
    {'name': 'acestep-little-star-cover', 'id': 'little-star', 'task': 'cover', 'lang': 'zh',
     'caption': "children's nursery rhyme, sweet gentle young female voice singing clearly in Mandarin Chinese, music box, glockenspiel, soft piano, slow tempo, warm lullaby",
     'lyrics': '[verse]\n一閃一閃亮晶晶\n滿天都是小星星\n掛在天上放光明\n好像許多小眼睛\n[outro]\n一閃一閃亮晶晶\n滿天都是小星星'},
    {'name': 'acestep-twinkle-cover', 'id': 'en-twinkle', 'task': 'cover', 'lang': 'en',
     'caption': "classic English nursery rhyme for toddlers, sweet clear young female voice, music box, glockenspiel, soft piano, slow tempo, gentle and warm",
     'lyrics': '[verse]\nTwinkle, twinkle, little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky\n[outro]\nTwinkle, twinkle, little star\nHow I wonder what you are'},
    {'name': 'acestep-little-star-new', 'id': None, 'task': 'text2music', 'lang': 'zh',
     'caption': "children's nursery rhyme, sweet gentle young female voice singing clearly in Mandarin Chinese, music box, glockenspiel, soft piano, slow tempo, warm lullaby",
     'lyrics': '[verse]\n一閃一閃亮晶晶\n滿天都是小星星\n掛在天上放光明\n好像許多小眼睛\n[outro]\n一閃一閃亮晶晶\n滿天都是小星星'},
]

GEN = 'import json, os, sys, time, traceback, urllib.request, subprocess\nsys.path.insert(0, \'/kaggle/tmp/ace\')\nos.chdir(\'/kaggle/tmp/ace\')\nLOG = open(\'/kaggle/working/log.txt\', \'a\')\ndef log(*a):\n    s = \' \'.join(str(x) for x in a)\n    print(s, flush=True)\n    LOG.write(s + \'\\n\')\n    LOG.flush()\ndef sh(cmd):\n    subprocess.run(cmd, shell=True)\nRAW = \'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/main/\'\nACE = \'/kaggle/tmp/ace\'\nOUT = \'/kaggle/working\'\nJOBS = json.load(open(\'/kaggle/tmp/jobs.json\', encoding=\'utf-8\'))\ntry:\n    from acestep.handler import AceStepHandler\n    from acestep.llm_inference import LLMHandler\n    from acestep.inference import GenerationParams, GenerationConfig, generate_music\n\n    index = json.loads(urllib.request.urlopen(RAW + \'audio/sing/index.json\').read())\n    dit = AceStepHandler()\n    msg, ok = dit.initialize_service(project_root=ACE, config_path=\'acestep-v15-turbo\', device=\'auto\', offload_to_cpu=False)\n    log(\'dit\', ok, msg)\n    llm = LLMHandler()\n    msg, ok = llm.initialize(checkpoint_dir=os.path.join(ACE, \'checkpoints\'), lm_model_path=\'acestep-5Hz-lm-0.6B\',\n                             backend=\'pt\', device=\'auto\', offload_to_cpu=False, dtype=None)\n    log(\'llm\', ok, msg)\n    for job in JOBS:\n        try:\n            kw = dict(task_type=job[\'task\'], caption=job[\'caption\'], lyrics=job[\'lyrics\'], vocal_language=job[\'lang\'],\n                      inference_steps=8, shift=3.0, seed=42)\n            if job[\'task\'] == \'cover\':\n                src = f\'/kaggle/tmp/{job["id"]}.mp3\'\n                urllib.request.urlretrieve(RAW + \'audio/sing/\' + index[job[\'id\']][\'file\'], src)\n                kw.update(src_audio=src, audio_cover_strength=0.8)\n            else:\n                kw.update(thinking=True, bpm=88, duration=45)\n            t = time.time()\n            res = generate_music(dit, llm, params=GenerationParams(**kw),\n                                 config=GenerationConfig(batch_size=1, audio_format=\'mp3\'), save_dir=f\'/kaggle/tmp/{job["name"]}\')\n            log(job[\'name\'], \'ok\' if res.success else \'FAILED\', \'%.0fs\' % (time.time() - t), getattr(res, \'status_message\', \'\'))\n            for a in (res.audios or []):\n                p = a.get(\'path\')\n                if p and os.path.exists(p):\n                    sh(f\'cp "{p}" {OUT}/{job["name"]}.mp3\')\n                    break\n        except Exception:\n            log(job[\'name\'], \'EXCEPTION\', traceback.format_exc()[-2000:])\nexcept Exception:\n    log(\'GEN EXCEPTION\', traceback.format_exc()[-3000:])\n'

try:
    sh('nvidia-smi -L')
    sh(f'git clone --depth 1 https://github.com/ace-step/ACE-Step-1.5 {ACE}')
    # ACE-Step 要 Python 3.11～3.12，Kaggle 是 3.13：用 uv 另外建一個 3.12 的環境
    sh('pip install -q uv')
    sh('uv venv -p 3.12 /kaggle/tmp/venv')
    sh('uv pip install --python /kaggle/tmp/venv/bin/python -e .', cwd=ACE)
    sh('/kaggle/tmp/venv/bin/python -m acestep.model_downloader', cwd=ACE)
    json.dump(JOBS, open('/kaggle/tmp/jobs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open('/kaggle/tmp/gen.py', 'w', encoding='utf-8').write(GEN)
    LOG.flush()
    r = subprocess.run('/kaggle/tmp/venv/bin/python /kaggle/tmp/gen.py', shell=True, cwd=ACE,
                       env={**os.environ, 'ACESTEP_DTYPE': 'float32'})   # T4 是舊顯卡，半精度會溢位
    log('gen exit', r.returncode)
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
