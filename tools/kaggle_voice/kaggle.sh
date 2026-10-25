#!/usr/bin/env bash
# 用法：tools/kaggle_voice/kaggle.sh jobs.json 分支名 輸出資料夾
# 把要錄的句子丟到 Kaggle 免費 GPU 用 BreezyVoice 錄，跑完把 mp3 抓回來（上一次已經做好的會先收回來，不重做）
set -u
JOBS_FILE=$1; BRANCH=$2; DEST=$3
KID="$KAGGLE_USERNAME/kids-voice-$BRANCH"   # 正式版和試跑分開，不會互相干擾
rm -rf /tmp/kv /tmp/kv-prev /tmp/kv-out && mkdir -p /tmp/kv /tmp/kv-prev /tmp/kv-out "$DEST"
status() { kaggle kernels status "$KID" 2>&1 | tr A-Z a-z; }   # Kaggle 回的是 COMPLETE 這種大寫

# 1. 先把上一次（可能已經跑完）的成果收回來，只送還沒做好的
case "$(status)" in *running*|*queued*) RUNNING=1;; *) RUNNING=0;; esac
if [ $RUNNING = 0 ]; then
  kaggle kernels output "$KID" -p /tmp/kv-prev/ >/dev/null 2>&1 || true
  python3 - "$JOBS_FILE" "/tmp/kv-prev/out" "$DEST" <<'PY'
import json, os, shutil, sys
jobs = json.load(open(sys.argv[1], encoding='utf-8'))
prev, dest = sys.argv[2], sys.argv[3]
name = lambda j: j[1] if isinstance(j, list) else j['file']
left = []
for j in jobs:
    f = os.path.join(prev, name(j))
    if os.path.exists(f) and os.path.getsize(f) > 0:
        shutil.copy(f, os.path.join(dest, name(j)))
    else:
        left.append(j)
print(len(jobs) - len(left), 'already done,', len(left), 'left')
json.dump(left, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False)
PY
  if [ "$(python3 -c 'import json,sys;print(len(json.load(open(sys.argv[1]))))' "$JOBS_FILE")" = 0 ]; then echo "全部都做好了"; exit 0; fi

  # 2. 把剩下的送到 Kaggle
  python3 - "$JOBS_FILE" "$BRANCH" <<'PY'
import json, sys
src = open('tools/kaggle_voice/run.py', encoding='utf-8').read()
jobs = json.load(open(sys.argv[1], encoding='utf-8'))
src = src.replace('__JOBS__', json.dumps(jobs, ensure_ascii=False)).replace('__BRANCH__', sys.argv[2])
src = src.replace('__PROMPT_TEXT__', open('tools/voice/prompt.txt', encoding='utf-8').read().strip())
open('/tmp/kv/run.py', 'w', encoding='utf-8').write(src)
PY
  cat > /tmp/kv/kernel-metadata.json <<META
{"id": "$KID", "title": "kids-voice-$BRANCH", "code_file": "run.py", "language": "python",
 "kernel_type": "script", "is_private": "true", "enable_gpu": "true", "enable_internet": "true",
 "machine_shape": "NvidiaTeslaT4", "dataset_sources": [], "competition_sources": [], "kernel_sources": [], "model_sources": []}
META
  # Kaggle 免費 GPU 同時最多跑 2 個：滿了就等一下再送
  for t in $(seq 1 60); do
    out=$(kaggle kernels push -p /tmp/kv 2>&1); echo "$out"
    case "$out" in *"Maximum batch GPU session"*) sleep 120;; *rror*) exit 1;; *) break;; esac
  done
else
  echo "上一次還在跑，繼續等"
fi

# 3. 等它跑完，把成果收回來
for i in $(seq 1 600); do
  sleep 30
  s=$(status)
  case "$s" in *complete*|*error*|*cancel*) echo "$s"; break;; esac
  [ $((i % 20)) = 0 ] && echo "$s"
done
kaggle kernels output "$KID" -p /tmp/kv-out/ >/dev/null || true
cp /tmp/kv-out/log.txt "$DEST/kaggle-voice-log.txt" 2>/dev/null
grep -E "^ok |FAIL|EXCEPTION|setup|loaded|gen done|^dit" /tmp/kv-out/log.txt | cut -c1-300 | tail -40
cp /tmp/kv-out/out/*.mp3 "$DEST"/ 2>/dev/null
ls "$DEST" | wc -l
