---
name: hearing
description: 檢查 App 所有錄音的讀音（台灣國語繁體、注音、英文）。改了旁白、加了新句子、或爸爸媽媽說哪裡念錯時用：跑「讀音檢查」workflow，讀報告，把念錯的字加進指定讀音，重錄後再檢查一次。
---

# 讀音檢查（AI 的耳朵）

App 的錄音都在 `audio/`（`audio/index.json`：句子 → 檔名）。Claude 聽不到聲音，所以用語音辨識當耳朵：

- `tools/hear_check.py`：每一段錄音用 wav2vec2 辨識（中文、英文各一個模型，CTC 沒有語言模型，念錯就會寫錯字），
  中文轉成拼音跟「應有的台灣讀音」比；英文比字錯率。
- `.github/workflows/hear-check.yml`：在 GitHub 上跑（這裡的容器連不到 Hugging Face），
  報告推到 `listen/check/report.json`、`listen/check/index.html`（網址 /listen/check/，可以點來聽）。

## 流程
1. 觸發 workflow「讀音檢查」（`mcp__github__actions_run_trigger`，workflow `hear-check.yml`，ref `main`），約 30～60 分鐘。
2. `git pull` 後讀 `listen/check/report.json`：
   - `poly`（多音字念成另一個讀音）幾乎都是真的念錯 → 一定要修。
   - `err` 高的中文 / 英文：辨識也會出錯，對照 `want`/`got` 判斷，拿不準就請爸爸媽媽點報告頁聽。
3. 修法：
   - 中文（MiniMax 大姊姊）：`tools/voice/minimax.json` 的 `pronounce` 加 `詞: (拼音)(拼音)`（台灣讀音，教育部《國語辭典簡編本》）。
     繁體多音字的通用規則在 `tools/gen_voice.py` 的 `TRAD` / `TRAD_EXCEPT`。
   - 注音（微軟曉臻）：改 `js/words.js` 裡的代表字（`ZY_SYMBOLS` 的 `say`、`ZY_REP`）。
   - 英文：改句子寫法或 `tools/gen_voice.py` 的英文聲音設定。
   - 推上去後 `voice.yml` 只重錄有改的句子；錄好再跑一次讀音檢查確認。
4. 台灣讀音和大陸不同的詞，加到 `tools/hear_check.py` 的 `TW` 表（例如 垃圾 le4 se4、星期 qi2），以免把對的當成錯的。
