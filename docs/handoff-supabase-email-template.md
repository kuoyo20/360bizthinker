# Cowork 簡報：更新 Supabase Magic Link Email 模板（加 6 碼數字）

> 任務交辦人：kuoyo
> 預計時間：2-3 分鐘
> 難度：⭐（複製貼上而已）

---

## 任務目標

讓登入信裡同時出現「6 碼數字」和「登入連結」，讓使用者可以二選一登入。
目前預設模板只有連結，但連結會被某些 email 防護機制提前消耗，造成登入失敗。

---

## 前置條件

- [ ] 你能登入 [supabase.com](https://supabase.com)（用 kuoyo20@gmail.com）
- [ ] 看得到 `360bizthinker` 專案（如果側邊欄顯示舊名 `dotdotwiki` 那也是同一個，URL ref `awwffyfxepwszstjxxdf`）

---

## Step-by-step

### 1. 開啟 Email Templates 頁

直接點：
https://supabase.com/dashboard/project/awwffyfxepwszstjxxdf/auth/templates

進去後找上方分頁，**點「Magic Link」**（不是其他的，例如不要點 Confirm signup 或 Invite user）。

### 2. 替換 body

把整個 body 文字框內容**全部刪除**，貼上這段：

```html
<h2>登入 360bizthinker</h2>

<p>你的 6 碼登入碼：</p>
<p style="font-size: 32px; font-family: monospace; letter-spacing: 8px; font-weight: bold;">
  {{ .Token }}
</p>

<p>或直接點連結登入：</p>
<p><a href="{{ .ConfirmationURL }}">點此登入</a></p>

<p style="color: #666; font-size: 12px;">
  6 碼或連結，任一種有效。1 小時內不用會自動失效。
  如果不是你本人申請，忽略此信即可。
</p>
```

> ⚠️ 重點：`{{ .Token }}` 和 `{{ .ConfirmationURL }}` **這兩個變數寫法不能改**（包括前後空格 + 大小寫 + 雙大括號）。改了模板就壞掉。

### 3. （可選）改 Subject heading

上方 Subject 欄位（信件標題）建議改成：

```
360bizthinker 登入碼：{{ .Token }}
```

這樣使用者連信都不用點開就看得到 6 碼。

### 4. 按 Save changes

頁面右下/右上的綠色 **Save** 按鈕。**立刻生效**，不需要重啟任何服務。

---

## 驗證（你做完請測這 3 步）

1. 開無痕視窗 → https://360bizthinker.vercel.app/login
2. 輸入 `kuoyo20@gmail.com` → 點「寄出 6 碼登入碼」
3. **20 秒內收信** → 信中應該看到大大的 6 碼數字（很顯眼）
4. 把那 6 碼複製 → 貼到網站「6 碼登入碼」欄位 → 點「登入」
5. 應該直接進 `/admin`（不需要點信中連結）

---

## 完成後請回報

- [ ] 信中看得到 6 碼數字 — **截圖**
- [ ] 6 碼登入成功進到 /admin — 簡單一句「OK」即可

如果信中只有連結沒 6 碼 → Save 沒按到，回去再 Save 一次。
如果出現紅字錯誤 → 把錯誤訊息貼給 kuoyo。

---

## 安全注意事項

- 這個動作沒有任何 secret 操作，只是修改 email 文案範本
- 不需要 service role key，不需要 API token
- Supabase 後台會自動 sandbox 模板變數，不會出現 XSS 風險（dashboard 內建檢查）
