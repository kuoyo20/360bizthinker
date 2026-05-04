# Manual E2E Test Plan — 你需要親手點過的步驟

> 我（Claude）已用 Playwright 自動跑完所有公開頁 + 保護路由的匿名行為。
> 下面這些**必須真人收 email + 點連結**才能驗證，請你按順序測。
>
> 預估 10 分鐘。

---

## 前置條件（已驗）

- ✅ Vercel domain `360bizthinker.vercel.app` HTTP 200
- ✅ Supabase Auth URL Configuration 已設
- ✅ 你目前是 admin 在 workspace「360」
- ✅ 1 個 cohort 「MX 1期(測試)」已存在
- ✅ 2 間公司：苗林行 (own) + 元榆牧場 (client)

---

## Test 1：你自己重新登入

**預期**：你已有 session，但測一次 fresh login 確保 magic link 能完整跑通。

1. 開無痕視窗（避免 stale session）
2. 到 https://360bizthinker.vercel.app/login
3. 輸入 `kuoyo20@gmail.com` → 寄送
4. 收信（Gmail 收件夾或「促銷內容」標籤）
5. 點連結
6. 預期跳到 `/auth/callback`（短暫顯示「驗證登入連結…」）
7. 自動跳到 `/admin`（因為你是 admin）

**回報**：✅ 進到 /admin 看到 3 個 stat cards / ❌ 卡哪一步 + 截圖

---

## Test 2：邀請學員 → 學員端走完一輪

**目的**：驗證真實 invite email click-through。

### 2a — 從顧問端寄出邀請

1. /admin/cohorts → 點「MX 1期(測試)」
2. 在「邀請學員」textarea 貼一個你能收信的測試 email
   （建議：`kuoyo20+student-test@gmail.com`，會進你的 Gmail）
3. **勾 2 個模組**：影響力密碼 + 360 戰略（不要勾 brand_os，留給 Test 3 測）
4. 點「寄出邀請」
5. **預期**：看到綠色 `✓ kuoyo20+student-test@gmail.com`

### 2b — 學員端收信 + 進入

> ⚠️ 開**另一個無痕視窗**（不要跟 admin session 混）

1. 收到「You have been invited」之類的信
2. 點信中連結 → 跳 `/auth/callback`
3. **預期**：自動跳到 `/home`（不是 /admin，因為你是 student 角色）
4. /home 顯示「+ 建立第一間公司」CTA（own + client 兩區都空）

### 2c — 學員建公司

1. 點「+ 建立第一間公司」（own 那區）
2. 表單：
   - 類型：「我自己的公司」
   - 名稱：`測試公司`
   - 產業：`測試`
   - 規模：選一個
3. 建立
4. **預期**：跳到 `/companies/{id}`

### 2d — 學員看模組卡片

在 `/companies/:id` 應看到 6 張模組卡片：
- 影響力密碼 → **亮**（已開通）
- 能力評分 → 暗（未開通）
- 人脈管理 → 暗
- 銷售大師 → 暗
- 品牌大師 → 暗（因為你 2a 沒勾）
- 360 戰略 → **亮**

**回報**：哪幾張亮、哪幾張暗

### 2e — 點亮的模組

點「影響力密碼」卡片 → 預期跳轉到 `/companies/:id/assessment` → 但因為 W3 還沒做，會跳回 `/`（因為 wildcard catch）

> 這是預期行為，W3 之後才有實際內容

---

## Test 3：Brand OS 同步（你自己當 admin 測）

> ⚠️ 用 admin session（Test 1 那個視窗）

### 3a — 把 brand_os 加給自己

由於你的 cohort 邀請當時只勾了 brand_os（從 SQL 看到），你已經有 brand_os 權限。
但你本來建公司時，`student_module_access` 的開通是針對某個 cohort_student。
實際邏輯：**你建的 own 公司 vs 從 cohort 拿到的權限**怎麼配對？

**簡化測法**：
1. 進 `/companies/苗林行` 或 `/companies/元榆牧場`
2. 看「品牌大師」卡片是亮還是暗

### 3b — 點 brand_os 卡片 → 進內頁

預期看到：
- 標題「品牌大師」
- 「↗ 前往 Brand OS（建立品牌）」按鈕
- 「從 Brand OS 同步」按鈕

### 3c — 同步真實 Brand OS 資料

點「從 Brand OS 同步」按鈕。三種可能結果：

| 訊息 | 意思 | 解 |
|---|---|---|
| 跳出金字塔/Soul/同理心三段資料 | 🟢 通了！ | 完成 |
| `Brand OS 找不到 kuoyo20@gmail.com` | 你 Brand OS 沒有用此 email 註冊 | 點「↗ 前往 Brand OS」用 KOI 邀請碼建帳號 |
| `Brand OS 中找不到名為「苗林行」的品牌` | 帳號有，品牌名不一樣 | 在 Brand OS 建一個叫「苗林行」的品牌 |

**回報**：訊息 + 截圖

---

## Test 4：清理測試用 email（可選）

如果 Test 2 跑了，Supabase 會留下 `kuoyo20+student-test@gmail.com` 這個 auth.user
+ 對應的 student / workspace_members / cohort_students / module_access。

不影響功能，但想清乾淨告訴我，我用 SQL 刪。

---

## 回報模板

照這個 copy 給我：

```
Test 1: ✅ / ❌（哪步卡）
Test 2a: ✅ / ❌
Test 2b: ✅ 進 /home / ❌
Test 2c: ✅ 公司建立 / ❌
Test 2d: 亮的有 [...] 暗的有 [...]
Test 2e: ✅ 跳回 / 看到別的東西
Test 3c: 哪一種訊息
其他發現：
```
