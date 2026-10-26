"""在 Kaggle 免費 GPU 上用 SoulX-Singer（Apache-2.0）照歌譜唱兒歌：每個字唱哪個音、唱多久都照我們的譜，
所以字、旋律、字幕一定對得上。再配上 tools/accomp.py 編的伴奏。
JOBS 由 tools/kaggle_svs/kaggle.sh 填進來（tools/sing_svs.py --plan 產生），做好的 mp3 放在 /kaggle/working/out/。"""
import json, os, subprocess, time, traceback

JOBS = json.loads(r'''__JOBS__''')
RAW = 'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/__BRANCH__/'
SX = '/kaggle/tmp/sx'
VENV = '/kaggle/tmp/venv/bin/python'
os.makedirs('/kaggle/working/out', exist_ok=True)
open('/kaggle/working/log.txt', 'w').close()
LOG = open('/kaggle/working/log.txt', 'a')


def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()


def sh(cmd, cwd=None):
    log('$', cmd)
    r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    log((r.stdout or '')[-1500:], (r.stderr or '')[-2500:])
    if r.returncode:
        raise RuntimeError(f'failed: {cmd}')


PHONEMES = r'''__PHONEMES__'''

GEN = r'''
import json, os, subprocess, sys, time, traceback, urllib.request
import numpy as np, soundfile as sf, torch
sys.path.insert(0, '/kaggle/tmp/sx')
sys.path.insert(0, '/kaggle/tmp')
os.chdir('/kaggle/tmp/sx')
LOG = open('/kaggle/working/log.txt', 'a')
def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(' '.join(cmd) + '\n' + r.stderr[-1500:])
import nltk
for pkg in ('averaged_perceptron_tagger_eng', 'averaged_perceptron_tagger', 'cmudict'):
    nltk.download(pkg, quiet=True)
import phonemes
from cli.inference import build_model
from soulxsinger.utils.file_utils import load_config
from soulxsinger.utils.data_processor import DataProcessor
jobs = json.load(open('/kaggle/tmp/jobs.json', encoding='utf-8'))
raw = open('/kaggle/tmp/raw.txt').read().strip()
def get(path):
    local = '/kaggle/tmp/dl/' + path.replace('/', '_')
    if not os.path.exists(local):
        os.makedirs('/kaggle/tmp/dl', exist_ok=True)
        urllib.request.urlretrieve(raw + path, local)
    return local
t = time.time()
config = load_config('soulxsinger/config/soulxsinger.yaml')
model = build_model('pretrained_models/SoulX-Singer/model.pt', config, device='cuda', use_fp16=False)
dp = DataProcessor(hop_size=config.audio.hop_size, sample_rate=config.audio.sample_rate,
                   phoneset_path='soulxsinger/utils/phoneme/phone_set.json', device='cuda')
phoneset = set(json.load(open('soulxsinger/utils/phoneme/phone_set.json')))
SR = config.audio.sample_rate
# 範本歌聲：用 SoulX-Singer 附的示範女聲（中文、英文各一個）
prompts = {}
for lang, name in (('Mandarin', 'zh_prompt'), ('English', 'en_prompt')):
    meta = json.load(open(f'example/audio/{name}.json', encoding='utf-8'))[0]
    # 範本的標記只對應錄音裡 time 那一段（英文範本是 5.2～10.3 秒），先剪出那段再給模型，
    # 不然聲音和歌詞對不上，學到的發音就會怪怪的
    a, b = meta['time']
    cut = f'/kaggle/tmp/{name}.wav'
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a / 1000), '-t', str((b - a) / 1000), '-i', f'example/audio/{name}.mp3', cut])
    prompts[lang] = dp.process(meta, cut)
try:   # 只是用來檢查，載不起來也照樣唱
    import whisper
    asr = whisper.load_model('small', device='cuda')
except Exception as e:
    asr = None
    log('whisper not loaded', str(e)[:200])
log('loaded %.0fs' % (time.time() - t))
for job in jobs:
    out = '/kaggle/working/out/' + job['file']
    try:
        t = time.time()
        segs = job['segments']
        total = np.zeros(int(segs[-1]['time'][1] / 1000 * SR) + SR, dtype=np.float32)
        for k, g in enumerate(segs):
            ph = phonemes.convert(g['words'], g['type'], job['lang'], phoneset)
            meta = {'index': f"{job['id']}_{k}", 'language': job['lang'], 'time': g['time'],
                    'duration': ' '.join(str(x) for x in g['dur']), 'text': ' '.join(g['words']),
                    'phoneme': ' '.join(ph), 'note_pitch': ' '.join(str(x) for x in g['pitch']),
                    'note_type': ' '.join(str(x) for x in g['type'])}
            data = {'prompt': prompts[job['lang']], 'target': dp.process(meta, None)}
            with torch.no_grad():
                y = model.infer(data, auto_shift=False, pitch_shift=0, n_steps=job['steps'], cfg=job['cfg'],
                                control='score', use_fp16=False)
            y = y.squeeze().cpu().numpy()
            s = int(g['time'][0] / 1000 * SR)
            n = min(len(y), len(total) - s, int((g['time'][1] - g['time'][0]) / 1000 * SR) + int(.05 * SR))
            fade = min(n, int(.01 * SR))
            y = y[:n].copy()
            y[-fade:] *= np.linspace(1, 0, fade)
            total[s:s + n] += y
        vox = '/kaggle/tmp/vox.wav'
        sf.write(vox, total, SR)
        # 人聲另外存一份，之後只改伴奏就不用再請 GPU 重唱
        os.makedirs('/kaggle/working/out/stems', exist_ok=True)
        run(['ffmpeg', '-v', 'error', '-y', '-i', vox, '-b:a', '96k', '/kaggle/working/out/stems/' + job['file']])
        # 人聲放前面、八音盒輕輕在後面，最後限幅避免爆音
        run(['ffmpeg', '-v', 'error', '-y', '-i', vox, '-i', get(job['acc']), '-filter_complex',
             f"[0:a]loudnorm=I=-17:TP=-2,aresample=44100,volume={job['vox_gain']}[a];"
             f"[1:a]loudnorm=I=-23:TP=-2,aresample=44100,volume={job['acc_gain']}[b];"
             '[a][b]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.9',
             '-ac', '1', '-b:a', '96k', out])
        log('ok', job['file'], '%.0fs' % (time.time() - t))
        try:
            if asr is None:
                raise RuntimeError('no whisper')
            heard = asr.transcribe(vox, language='en' if job['lang'] == 'English' else 'zh', fp16=False)['text'].strip()
            log('heard', job['id'], '|', heard[:400])
        except Exception as e:
            log('heard', job['id'], '| (whisper failed)', str(e)[:200])
    except Exception:
        log('FAILED', job['file'], traceback.format_exc()[-1500:])
log('gen done')
'''

try:
    t0 = time.time()
    sh('nvidia-smi -L')
    sh(f'git clone --depth 1 https://github.com/Soul-AILab/SoulX-Singer {SX}')
    # SoulX-Singer 用 Python 3.10，Kaggle 是 3.13：用 uv 另外建一個 3.10 的環境，只裝唱歌需要的套件
    sh('pip install -q uv')
    sh('uv venv -p 3.10 /kaggle/tmp/venv')
    sh(f'uv pip install --python {VENV} torch==2.2.0 torchaudio==2.2.0 --index-url https://download.pytorch.org/whl/cu121')
    sh(f'uv pip install --python {VENV} torch==2.2.0 torchaudio==2.2.0 accelerate==1.11.0 einops==0.8.2 librosa==0.11.0 '
       '"numpy<2" omegaconf==2.3.0 scipy==1.15.3 soundfile==0.13.1 tqdm transformers==4.41.2 huggingface_hub '
       'g2pM g2p_en nltk opencc-python-reimplemented openai-whisper '
       '--extra-index-url https://download.pytorch.org/whl/cu121 --index-strategy unsafe-best-match')
    sh(f'{VENV} -c "from huggingface_hub import snapshot_download as d; d(\'Soul-AILab/SoulX-Singer\', local_dir=\'pretrained_models/SoulX-Singer\')"', cwd=SX)
    json.dump(JOBS, open('/kaggle/tmp/jobs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open('/kaggle/tmp/raw.txt', 'w').write(RAW)
    open('/kaggle/tmp/phonemes.py', 'w', encoding='utf-8').write(PHONEMES)
    open('/kaggle/tmp/gen.py', 'w', encoding='utf-8').write(GEN)
    log('setup %.0fs' % (time.time() - t0))
    r = subprocess.run(f'{VENV} /kaggle/tmp/gen.py', shell=True, cwd=SX)
    log('gen exit', r.returncode)
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
