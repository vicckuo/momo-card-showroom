# AI / Agent 協作紀錄

工具：Claude Code（Claude Opus）。人負責決策與審查，Agent 負責調查、提案與實作。
commit 中 Agent 參與撰寫的都加上 `Co-authored-by: Claude`。

## Phase 1 — 設計（15:00–15:16）

| 時間 | 誰 | 內容 |
|---|---|---|
| 15:02 | Agent | 讀題目 PDF，整理兩題差異，建議選 B（範圍可控、加分項對到 shared modules / 私有套件） |
| 15:05 | 人 | 決定：題目 B、Vue 3 + TS + Vite、zip + git history 交件 |
| 15:08 | Agent | 用 Playwright 開 momo 首頁，抓商品卡文字樣本，歸納 standard / flash-sale / ranking + 橫式版型 |
| 15:12 | Agent | 寫 `docs/DESIGN.md`：registry 擴充點、zod schema、自動產生編輯器、localStorage 版本化 |
| 15:16 | 人 | 審查設計，核准方向；決定 commit 加 Agent co-author 標記 |

## Phase 2 — 實作

（依 commit 順序補記人工審查與修正）
