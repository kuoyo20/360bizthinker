# 90 秒：把 Supabase Auth Email 改用 Resend SMTP

> 為什麼：Supabase 內建 SMTP 限 4 封/小時，Beta 學員會卡。
> Resend 免費 3000 封/月，可上 production。

## 前置（已假設你做完）

- ✅ Resend 帳號
- ✅ Resend API key（一串 `re_...` 開頭）
- ✅ 寄件 from email
  - 沒 verified domain → 用 `onboarding@resend.dev`（sandbox，所有收件人都能收）
  - 有 → 用 `noreply@yourdomain.com`

## 設定（2 分鐘）

開：[Supabase → Auth → Sign In/Up → SMTP Settings](https://supabase.com/dashboard/project/awwffyfxepwszstjxxdf/auth/sign-in-up)

往下找到 **Custom SMTP** → 打開 toggle → 填 6 個欄位：

| 欄位 | 值 |
|---|---|
| **Sender email** | `onboarding@resend.dev`（或你 verified domain 的 email） |
| **Sender name** | `360bizthinker` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | 你的 Resend API key（`re_...` 開頭那串）|

→ 按 **Save** → **立刻生效**（不用重啟）

## 驗證（30 秒）

1. 開無痕視窗 → https://360bizthinker.vercel.app/login
2. 輸入 `kuoyo20@gmail.com` → 寄出
3. 應該 5 秒內收到信（之前等 30 秒+），寄件人變 `360bizthinker <onboarding@resend.dev>`
4. 信內看得到 6 碼 + 連結
5. 用 6 碼登入 → 進 /admin

## 完成後通知我

告訴我「SMTP done」，我立刻：
1. 撈 auth log 確認下一封信是 Resend 寄的（會有 `mail.send` event 但不再 rate-limited）
2. 重新 trigger AI 生成測試
3. 順便把 Supabase email template 中文化（Magic Link 模板）

## 安全提醒

- API key 只貼到 Supabase 那個 Password 欄位，**不要貼 chat / 截圖 / 檔案**
- 這把是「應用程式金鑰」，外洩會被別人冒名你的 domain 寄信、燒掉額度
- 如果不小心外洩 → 到 Resend → API Keys → 刪掉那把重建
