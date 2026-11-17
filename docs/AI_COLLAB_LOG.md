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

| 時間 | 誰 | 內容 | Commit |
|---|---|---|---|
| 15:16–15:22 | Agent | 依設計快速實作：schema + registry + 一般卡、localStorage 持久化、showroom 與編輯器、限時搶購 / 排行卡、web component + sample.html。每步跑 Vitest、vue-tsc、build | `6ed38a6` … `9540f32` |
| 15:20 | Agent（自我審查） | 發現折數原本無條件捨去（3.81 折顯示 3.8 折），會誇大折扣 → 改為無條件進位，刻意與真站文案不同 | `60ac9f1` |
| 15:20 | Agent（自我審查） | 發現已有存檔的使用者看不到新版本新增的卡片 → 載入時補上缺少的 seed 卡 | `8ced7fb` |
| 15:22 | Agent | 用 Playwright 在 build 產物上驗證：showroom 改價格 → sample.html 同步。**只驗證了 sample.html，沒有驗證 showroom 自己重新整理後資料是否還在** | — |
| 約 15:40 | 人 | 實際操作 showroom：原本沒有值的「評價數」「銷量文字」填上後，卡片不會更新，回報給 Agent | — |
| 15:42–15:44 | Agent | 重現後找到**兩個問題**：<br>1. **主因**：`useCards` 在 import 時就讀 localStorage，早於 `main.ts` 註冊卡片類型（ES module 的 import 先執行）。每次重新整理，所有存檔都被當成未知類型而回退成 seed；下一次編輯再把 seed 寫回去，**覆蓋使用者的資料**。改為第一次使用時才載入，補上回歸測試，並確認該測試在舊程式碼上會失敗。<br>2. 限時搶購卡把評價 / 銷量寫死為不顯示、沒有開關 → 加上 `showMeta` 選項（預設關閉，與真站一致），編輯器在欄位被隱藏時顯示提示 | `32e32ac`、`50a9b4b` |

| 15:50 | 人 | 要求跑一輪程式碼整理審查（`/simplify`） | — |
| 15:50–15:53 | Agent | 開 4 個 sub-agent 平行審查（重用 / 簡化 / 效能 / 修正深度），合併重複意見後套用：<br>• 卡片類型改為 import 即註冊，`storage.ts` 讀取前保證已註冊——**reload bug 的根因在源頭修掉**，不只靠延遲載入<br>• 編輯器不再寫死 `showMeta` 與欄位名稱，改由 variant 宣告 `hiddenProductFields`<br>• 共用 localStorage 存取、zod 解析存檔、共用主題色 schema<br>• 多個 `<momo-card>` 共用解析結果，沒變的卡不重新渲染<br>略過：adoptedStyleSheets（需處理不支援的瀏覽器）、編輯存檔 debounce（輸入已是 change 事件，成本低）、字型 / 數字格式抽共用（價值低） | `7b1144d` |

| 15:54 | 人 | 要求用全新、沒有對話脈絡的 agent 跑 `/code-review`（Standards + Spec 兩軸） | — |
| 15:55–15:56 | Agent | 兩份報告分開呈現；Agent 查證後指出 Spec reviewer 的一條錯誤結論（「橫式版型沒實作」，其實有，grep 漏掉） | — |
| 15:56 | 人 | 決定：寫 README、修兩個 code smell；**另外要求所有輸入欄位加上限，避免數字無限增長、超出 JS 安全整數範圍** | — |
| 15:56–15:58 | Agent | 上限集中在 `LIMITS`，schema 與編輯器共用（存檔超限也會被擋）；數字欄位型別強制宣告 min/max、文字欄位強制 maxLength。另修 feature envy（variant 宣告 `gridSpan`）與 `CardPatch` 型別 | `d368cfe` |

| 16:09 | 人 | 撰寫並 commit README「我的審查重點」 | `f845b69` |
| 16:16 | 人 | 審查 `sample.html` 時追問「錯誤處理」區塊的用意 | — |
| 16:17 | Agent | 說明用意（嵌入在別人的頁面，壞資料要被擋下、錯誤不擴散），並指出缺口：錯誤訊息正式環境的購物者也看得到、沒有回報監控。人決定這次只在 README 記錄限制與演進方向，不改程式 | `3cecdc9` |

### 這次協作的觀察
- Agent 實作速度快，單元測試也都通過，但**單元測試是在「先註冊、再載入」的順序下跑的**，沒有涵蓋真實頁面的 import 順序。
- Agent 的端對端驗證只走了「showroom → sample.html」這條路徑，漏掉「showroom 重新整理」。
- **人實際操作產品才抓到會覆蓋使用者資料的 bug**。之後的流程調整：Agent 交付前的驗證清單要包含「編輯 → 重新整理 → 確認資料還在」，回歸測試要模擬真實的模組載入順序。
