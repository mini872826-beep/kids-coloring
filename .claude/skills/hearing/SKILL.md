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

## 另一隻眼：看圖、看意思（只靠耳朵不夠）
耳朵只能確認「錄音和文字一樣」；如果文字本身寫錯（圖是餅乾、字卻寫「餅錢」），照字念一定錯。所以每次也要：
1. **看圖**：每個分類的線稿和名字並排截圖（Playwright 打開首頁，用 `ART.DRAWINGS` 依 `cat` 分組，`ART.svgDoc(d.svg)` 畫出來），
   一張一張看名字跟圖對不對。
2. **讀懂每一句**：`node tools/phrases.js --minimax` 列出全部中文，逐句讀，找錯字和照意思該念的特別讀音
   （古詩、三字經、弟子規的破音字：孝弟 ti4、少小 shao4、石徑斜 xia2、返景 ying3、一日還 huan2、冠必正 guan1……），
   補進 `pronounce`。
3. **自我修正**：`hear-fix.yml`（`tools/hear_fix.py`）把可疑的錄音用幾種方法重錄，兩隻耳朵（wav2vec2＋Whisper）挑念對的換上，
   結果在 /listen/check/fix.html；跑完會自動再跑一次讀音檢查。

## 自我修正的經驗（11/15）
- 微軟（edge-tts）同一個聲音每次錄出來都一樣，重錄沒用，要換聲音或換字。
- 注音整區改用曉雨（比較 35 個：曉雨好 19、一樣 16、差 0）。不要一區混兩個聲音。
- wav2vec2 是大陸模型，台灣捲舌音（ㄓㄔㄖ）常聽成 ㄐㄑ；Whisper（懂意思的耳朵）比較準，兩隻耳朵意見不同時以 Whisper 為主再自己判斷。
- Whisper 會把數字寫成阿拉伯數字，hear_check.heard_py 會換回國字再比。
- 乘法表「二一得二」的「得」台灣念 ㄉㄜˊ（minimax.json「一得」）。
- 英文單字前面加「The word is」（同一個聲音）再聽。兩隻耳朵都說錯的，多半是寶可夢／超人力霸王名字、拼法不同（Pooooof、sand castle），或字尾輕的子音（grapes 的 s、moon 的 n、Earth 的 th）。
  先看波形：字尾那一小段聲音還在就不是剪掉（trim 沒問題），是耳朵聽不到輕的子音。
- 打包前的狀態（11/15）：中文＋注音 1961 段，兩隻耳朵都覺得怪的只剩 5 個單一注音（ㄇㄧˇ ㄈ ㄔㄤˊ ㄝ ㄟ，都是辨識的極限）；英文 1097 段剩 149 段，大多是名字。
