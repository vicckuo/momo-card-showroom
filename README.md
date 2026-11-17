# momo Merchant Card Showroom

momo 前端 Take Home — 題目 B。分析 momo 真站的商品卡類型，做成可調整、可保存、可嵌入的商品卡展示系統。

- 技術：Vue 3、TypeScript、Vite、zod、Vitest
- 設計筆記：[`docs/DESIGN.md`](docs/DESIGN.md)
- AI 協作紀錄：[`docs/AI_COLLAB_LOG.md`](docs/AI_COLLAB_LOG.md)

## 快速開始

```bash
npm ci
npm test                          # 單元 / 元件測試
npm run build && npm run preview  # 打包並啟動預覽
```

打開：
- Showroom：<http://localhost:4173/>
- 嵌入範例：<http://localhost:4173/sample.html>

> `sample.html` 載入的 `embed/momo-card.js` 只在 build 之後才存在，`npm run dev` 底下會 404。
> 請用 `build && preview`，讓 showroom 與 sample.html 在**同一個網域**，才能共用 localStorage 並看到同步。

## 功能

| 需求 | 實作 |
|---|---|
| 列出所有商品卡 / 展示單一商品卡 | `/` 列表（可依類型篩選），`/card/:id` 單卡預覽 |
| 商品卡細節調整介面 | 單卡頁右側編輯器，欄位依卡片類型自動產生 |
| Browser-side Persistence | localStorage，含格式版本號、逐張驗證、跨分頁同步 |
| sample html | `public/sample.html`，用 `<script>` 載入 `<momo-card>` web component |
| Bonus：Reusable Card Architecture | 所有卡片共用 `BaseCard` 骨架，variant 只透過 slot 加自己的區塊 |
| Bonus：Schema / Plugin Extensibility | variant registry：新增卡片類型 = 註冊一次，不改核心程式 |
| Bonus：State Consistency Strategy | 見下方「狀態一致性」 |

## 真站觀察

2026-11-17 用 Playwright 開 momo 首頁，整理出三種卡片與一種版型（細節與文字樣本見 `docs/DESIGN.md` §1，截圖在 `docs/momo-home-reference.jpg`）：

| 卡片 | 真站特徵 |
|---|---|
| `standard` 一般卡 | 促銷標語、【品牌】標題、售價 + 原價刪除線、評價數、總銷量、活動標籤（如「登記」）；另有**橫式版型**（今日精選，圖左文右） |
| `flash-sale` 限時搶購卡 | 「限搶價」前綴、折數徽章、「最後 N 組」 |
| `ranking` 排行卡 | TOP N 名次徽章、類型標籤（如「電子票券★即買即用」） |

**限制：** 只看了一天的首頁。商品詳情頁、搜尋結果頁、直播頁的卡片沒有分析。商品與品牌為虛構，圖片是本機產生的 placeholder，不使用 momo 素材、不呼叫 momo API。

## 架構

```
src/
  cards/
    schema.ts          商品與卡片的 zod schema、欄位上限 LIMITS（單一事實來源）
    registry.ts        variant 註冊表、normalizeCard（把不可信資料轉成合法卡片）
    index.ts           內建 variant 的唯一註冊處（import 即註冊）
    variants/          standard / flashSale / ranking：各自的 schema、預設值、編輯欄位、元件
    parts/             BaseCard（共用骨架）、PriceTag
    CardRenderer.vue   依 variant 動態選元件
    cards.css          卡片樣式：app 直接 import，web component 注入 shadow DOM，同一份
  persistence/
    storage.ts         localStorage 讀寫：版本、驗證、回退、跨分頁訂閱
    useCards.ts        showroom 的唯一狀態來源
  editor/              依欄位定義自動產生的編輯器
  views/               列表頁、單卡頁
  embed/               <momo-card> web component（另外打包成單一 IIFE）
  data/                seed 資料、placeholder 圖
public/sample.html     嵌入範例
```

資料流：

```
編輯器 ──CardPatch──▶ useCards ──▶ storage.ts ──▶ localStorage
                         ▲                            │
                         └──── storage event ◀────────┤
<momo-card> ◀── loadCardsShared ◀─────────────────────┘
```

### 新增一種卡片

1. 在 `src/cards/variants/` 新增 `xxx.ts`（options schema、defaults、編輯欄位）與 `XxxCard.vue`（用 `BaseCard` 加自己的 slot）
2. 在 `src/cards/index.ts` 註冊
3. 在 `src/data/seed.ts` 加一張範例卡

編輯器、持久化、列表頁、web component 都不用改。編輯欄位的數字必須宣告上下限、文字必須宣告長度上限，型別會強制。

## 關鍵決策與取捨

| 決策 | 選擇 | 考慮過但沒選 | 理由 |
|---|---|---|---|
| 卡片擴充 | Registry（plugin） | `if (type === …)` 分支 | 新增卡片不改核心；代價是多一層抽象 |
| 驗證 | zod，型別由 schema 推導 | 手寫型別 + 手寫檢查 | localStorage 與嵌入屬性都是不可信輸入；型別與驗證不會分岔 |
| 編輯器 | 依欄位定義自動產生 | 每種卡寫一個編輯器；JSON Schema 表單套件 | 新卡不用寫編輯器；套件對這個規模太重。代價是不支援巢狀欄位 |
| 狀態管理 | 一個 composable（`useCards`） | Pinia | 只有一份狀態，不值得多一個依賴 |
| 持久化 | localStorage | IndexedDB | 資料量小、同步 API 夠用 |
| 嵌入 | Vue `defineCustomElement` 打包成 IIFE | Lit 重寫；iframe | 卡片元件 app 與嵌入共用同一份；代價是 bundle 含 Vue runtime（171 KB，gzip 56 KB） |
| 樣式隔離 | shadow DOM + 同一份 `cards.css` | CSS-in-JS；scoped CSS | 外部頁面的 CSS 不會影響卡片，app 與嵌入樣式不分岔 |
| 折數 | 無條件進位（3.81 折顯示 3.9 折） | 跟真站一樣捨去（顯示 3.8 折） | 捨去會讓折扣看起來比實際更划算，有不實廣告疑慮。這是刻意與真站不同 |
| 欄位上限 | `LIMITS` 一張表，schema 與編輯器共用 | 只在 input 加 `max` | 只靠 input 擋不住手改的存檔；超大數字會超出 JS 安全整數範圍 |

## 狀態一致性

- **單一寫入路徑**：所有編輯都經過 `useCards` → `storage.ts`，沒有第二個地方寫 localStorage。
- **存檔視為不可信輸入**：壞 JSON、未知版本 → 回到 seed；單張壞卡 → 用同 id 的 seed 取代，其他卡的編輯保留；單一選項壞掉 → 只把那個選項換回預設值。
- **版本號**：存檔帶 `schemaVersion`，`migrate()` 是格式升級的入口；遇到比程式更新的版本不猜，直接回到 seed。
- **新版本新增的卡片**：舊存檔裡沒有的 seed 卡會補在最後，不會被舊存檔蓋掉。
- **跨分頁 / 嵌入同步**：showroom 與 `<momo-card>` 讀同一個 key，透過 `storage` 事件即時更新。同一頁多張 `<momo-card>` 共用解析結果，沒變的卡不重新渲染。
- **跨網域**：localStorage 無法跨網域共用，所以 `<momo-card config='{…}'>` 可以直接帶入完整卡片資料，同樣經過驗證。

## 驗證

- `npm test`：25 個測試，涵蓋 registry、壞資料回退、版本、新卡補入、重新整理後資料保留（模擬真實的模組載入順序）、折數、欄位上限、編輯器提示。
- `npm run build`：包含 `vue-tsc` 型別檢查。
- 手動（Playwright 在 build 產物上）：編輯 → 重新整理 → 資料還在；showroom 修改 → sample.html 同步；超大數字輸入被夾到上限；錯誤的 `card-id` / `config` 顯示錯誤狀態。

## 刻意不做

- 後端、登入、多人同步
- 像素級還原真站、RWD 細節
- 編輯器的巢狀欄位、拖拉排版、新增 / 刪除卡片
- 倒數計時（限時搶購的結束時間）：需要時間來源與時區策略，時限內不做
- e2e 測試：重新整理與嵌入同步目前靠單元測試 + 手動驗證

## 已知限制

- `<momo-card>` bundle 含 Vue runtime，約 171 KB（gzip 56 KB），對單純嵌入一張卡偏重
- 每個 `<momo-card>` 的 shadow root 各有一份 `<style>`；很多張卡時可改用 `adoptedStyleSheets`
- 真站分析只有一天的首頁樣本

## 後續演進方向

1. **e2e 測試**：Playwright 跑「編輯 → 重新整理」「showroom → sample.html 同步」，放進 CI
2. **更多卡片類型**：分析商品頁、搜尋頁、直播頁的卡片；直播卡、加價購卡用同一個 registry 加入
3. **Design token**：顏色、字級、間距抽成 token，與 momo 的 design system 對齊
4. **嵌入 bundle 瘦身**：卡片改用 Lit 或原生 web component 重寫渲染層，registry 與 schema 保留
5. **資料來源抽象**：`storage.ts` 的介面已是 `KeyValueStore`，可換成後端 API，加上樂觀更新與衝突處理
6. **Schema 驅動的文件**：由 registry 自動產生每種卡片的欄位文件與 Storybook

## AI / Agent 協作

使用 Claude Code。每個 Agent 參與撰寫的 commit 都有 `Co-authored-by: Claude`。
人負責決策與審查，Agent 負責調查、提案與實作；完整時間線、人工發現的問題與 Agent 的自我修正，見 [`docs/AI_COLLAB_LOG.md`](docs/AI_COLLAB_LOG.md)。

## 我的審查重點

> TODO（郭峻豪本人填寫，送出前刪除這行）：用自己的話寫這次審查了什麼、做了哪些判斷、從 AI 的產出裡抓到什麼。
