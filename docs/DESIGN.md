# Phase 1 — 設計筆記（Design / Planning）

題目：B. Merchant Card Showroom
技術棧：Vue 3 + TypeScript + Vite，Vitest 測試
時間：2026-11-17 15:00 收題，18:30 截止

## 1. 真實 momo 商品卡觀察（2026-11-17 首頁）

用 Playwright 開 momoshop.com.tw 首頁，看了各區塊的商品卡（截圖：`docs/momo-home-reference.jpg`）。
真站文字樣本：

| 區塊 | 文字樣本（真站） | 歸納出的卡片類型 |
|---|---|---|
| 猜你喜歡 / 推薦 | `滿1件折480 【ARIEL】雙11必買 4D抗菌洗衣膠囊… $1,299 $2,316 (20,379) 登記 總銷量>20萬` | **standard**：促銷標語、【品牌】標題、售價、原價刪除線、評價數、銷量、活動標籤 |
| 限時搶購 | `飆低38折★再贈原廠禮盒 【JoMalone】香水100ml 限搶價 $2,211 $5,800 最後238組` | **flash-sale**：「限搶價」標示、折數、剩餘組數（稀缺感） |
| 排行 / 電子票券 | `【全家】大冰經典拿鐵好禮即享券 TOP 1 電子票券★即買即用 $55 (25) 總銷量>1萬` | **ranking**：名次徽章（TOP N）、類型標籤 |
| 今日精選 | `+送日式牙刷4入組 【BRAUN 百靈】耳溫槍… $2,411 $4,980` | standard 的**橫式版型**（圖左文右） |

結論：卡片之間**共用同一組商品資料**（圖、標題、價格），差別在**加上的區塊**（限搶標示、剩餘組數、名次）與**版型**（直式 / 橫式）。

## 2. 架構方向

```
src/
  cards/
    schema.ts        # 共用商品資料 + 各 variant 的 zod schema（單一事實來源）
    registry.ts      # registerCardVariant()：variant = schema + 預設值 + 編輯欄位 + component
    variants/        # standard / flash-sale / ranking，每個一個資料夾
    parts/           # 共用小元件：Price、Badge、Rating
  persistence/
    storage.ts       # localStorage：版本號、驗證、失敗時回預設、跨分頁同步
  editor/            # 依 registry 的欄位定義自動產生調整介面
  views/             # / 列出全部卡片、/card/:id 單卡 + 編輯
  embed/
    momo-card.ts     # defineCustomElement 打包成 <momo-card> web component
public/sample.html   # 用 <script> 載入 web component 的範例頁
```

### 關鍵決策與取捨

| 決策 | 選擇 | 為什麼 / 放棄了什麼 |
|---|---|---|
| 卡片擴充方式 | **Registry（plugin）**：新增卡片 = 註冊一個 variant，不改核心 | 比 `if (type === ...)` 好維護；代價是多一層抽象，3 種卡片看起來稍多 |
| 資料驗證 | **zod schema 當單一事實來源**，型別由 schema 推導 | localStorage 是不可信輸入（舊版本、手改、壞 JSON）；代價是多一個依賴 |
| 編輯器 | **依欄位定義自動產生** | 新 variant 不用寫編輯器；代價是複雜欄位（巢狀）表達力有限，先只支援 text / number / boolean / select |
| 持久化 | localStorage + `schemaVersion` + 驗證失敗回預設 + `storage` event 跨分頁同步 | 題目要求 browser-side；不用 IndexedDB（資料量小，不需要） |
| 嵌入 | Vue `defineCustomElement` 打包成 IIFE，`<script>` 載入 | 外部頁面不需要 Vue 或 build 工具；代價是 bundle 內含 Vue runtime（約數十 KB） |
| 狀態一致性 | showroom 與 web component 讀**同一個 storage key**；寫入只走 `storage.ts` | 同網域下改了卡片，sample.html 重整即同步；跨網域無法共用 localStorage（README 說明） |
| 樣式 | 純 CSS + CSS 變數（主題色），custom element 用 shadow DOM 內嵌樣式 | 不引入 UI 框架，避免 shadow DOM 樣式穿透問題 |

### 刻意不做
- 不抓真實 momo API、不用 momo 圖片（用 placeholder）
- 不做後端、登入、多人同步
- 不追求像素級還原，重點在架構
- 編輯器不支援巢狀欄位、拖拉排版

## 3. 實作順序（2 小時內，依優先度）

1. schema + registry + standard 卡（核心架構）
2. persistence（版本、驗證、跨分頁）+ 單元測試
3. showroom 列表頁 + 單卡編輯頁（自動產生欄位）
4. flash-sale、ranking 兩個 variant（驗證擴充性）
5. web component 打包 + sample.html
6. README：架構、取捨、驗證方式、後續演進

時間不夠時從 4、5 的細節開始砍，1–3 一定完成。

## 4. 驗證方式
- Vitest：schema 驗證、壞資料 / 舊版本回預設、registry 註冊
- 手動：showroom 改卡片 → 重整 sample.html 看到同步
- `npm run build` + `vue-tsc` 型別檢查通過
