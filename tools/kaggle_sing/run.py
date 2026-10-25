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

try:
    sh('nvidia-smi')
    sh(f'git clone --depth 1 https://github.com/ace-step/ACE-Step-1.5 {ACE}')
    sh('pip install -q -e .', cwd=ACE)
    sh(f'{sys.executable} -m acestep.model_downloader', cwd=ACE)
    sys.path.insert(0, ACE)
    os.chdir(ACE)
    from acestep.handler import AceStepHandler
    from acestep.llm_inference import LLMHandler
    from acestep.inference import GenerationParams, GenerationConfig, generate_music

    index = json.loads(urllib.request.urlopen(RAW + 'audio/sing/index.json').read())
    dit = AceStepHandler()
    msg, ok = dit.initialize_service(project_root=ACE, config_path='acestep-v15-turbo', device='auto', offload_to_cpu=False)
    log('dit', ok, msg)
    llm = LLMHandler()
    msg, ok = llm.initialize(checkpoint_dir=os.path.join(ACE, 'checkpoints'), lm_model_path='acestep-5Hz-lm-0.6B',
                             backend='pt', device='auto', offload_to_cpu=False, dtype=None)
    log('llm', ok, msg)
    for job in JOBS:
        try:
            kw = dict(task_type=job['task'], caption=job['caption'], lyrics=job['lyrics'], vocal_language=job['lang'],
                      inference_steps=8, shift=3.0, seed=42)
            if job['task'] == 'cover':
                src = f'/kaggle/tmp/{job["id"]}.mp3'
                urllib.request.urlretrieve(RAW + 'audio/sing/' + index[job['id']]['file'], src)
                kw.update(src_audio=src, audio_cover_strength=0.8)
            else:
                kw.update(thinking=True, bpm=88, duration=45)
            t = time.time()
            res = generate_music(dit, llm, params=GenerationParams(**kw),
                                 config=GenerationConfig(batch_size=1, audio_format='mp3'), save_dir=f'/kaggle/tmp/{job["name"]}')
            log(job['name'], 'ok' if res.success else 'FAILED', '%.0fs' % (time.time() - t), getattr(res, 'status_message', ''))
            for a in (res.audios or []):
                p = a.get('path')
                if p and os.path.exists(p):
                    sh(f'cp "{p}" {OUT}/{job["name"]}.mp3')
                    break
        except Exception:
            log(job['name'], 'EXCEPTION', traceback.format_exc()[-2000:])
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
