#!/usr/bin/env bash
# 用法：tools/kaggle_sing/kaggle.sh jobs.json 分支名 輸出資料夾
# 把要唱的歌丟到 Kaggle 免費 GPU 用 ACE-Step 做，跑完把 mp3 抓回來
set -u
JOBS_FILE=$1; BRANCH=$2; DEST=$3
KID="$KAGGLE_USERNAME/kids-songs-$BRANCH"
rm -rf /tmp/ks && mkdir -p /tmp/ks
python3 - "$JOBS_FILE" "$BRANCH" <<'PY'
import json, sys
src = open('tools/kaggle_sing/run.py', encoding='utf-8').read()
jobs = json.load(open(sys.argv[1], encoding='utf-8'))
src = src.replace('__JOBS__', json.dumps(jobs, ensure_ascii=False)).replace('__BRANCH__', sys.argv[2])
open('/tmp/ks/run.py', 'w', encoding='utf-8').write(src)
PY
cat > /tmp/ks/kernel-metadata.json <<META
{"id": "$KID", "title": "kids-songs-$BRANCH", "code_file": "run.py", "language": "python",
 "kernel_type": "script", "is_private": "true", "enable_gpu": "true", "enable_internet": "true",
 "machine_shape": "NvidiaTeslaT4", "dataset_sources": [], "competition_sources": [], "kernel_sources": [], "model_sources": []}
META
s=$(kaggle kernels status "$KID" 2>&1)
case "$s" in
  *running*|*queued*) echo "上一次還在跑，繼續等：$s";;
  *) kaggle kernels push -p /tmp/ks || exit 1;;
esac
for i in $(seq 1 300); do
  sleep 30
  s=$(kaggle kernels status "$KID" 2>&1)
  case "$s" in *complete*|*error*|*ERROR*|*cancel*) echo "$s"; break;; esac
  [ $((i % 20)) = 0 ] && echo "$s"
done
mkdir -p /tmp/ks-out "$DEST"
kaggle kernels output "$KID" -p /tmp/ks-out/ >/dev/null || true
grep -E "^ok |^FAILED|EXCEPTION|setup|gen done|^dit" /tmp/ks-out/log.txt | cut -c1-300 | tail -80
cp /tmp/ks-out/out/*.mp3 "$DEST"/ 2>/dev/null
ls "$DEST" | wc -l
