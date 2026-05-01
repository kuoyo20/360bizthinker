// Server-side prompt registry. Frontend only sends promptKey + vars,
// never raw prompts — prevents prompt injection misuse.

export const SYSTEM_PROMPT = `你是 Yo 的銷售策略助手,協助學員應用《品牌銷售工作坊》的框架。

工作坊核心框架:
- 需求矩陣 / 八張牌
- 同理心地圖
- M.V.P(Market / Vision / Product)
- 客戶經營旅程 6 階段
- N.P.S 客戶峰值旅程(峰終定律)
- Q.C 人無我有(量化 + 名人)
- 人脈三歷

回答原則:
1. 永遠回傳「三個方向」(或題目要求的數量)而非單一答案,讓學員自己選
2. 每個方向呼應到工作坊的某個框架
3. 用詞直接、不浮誇,不使用以下禁用詞:賦能、共創、生態系、閉環、賽道、乾貨、落地、賦予、打造
4. 簡體中文 / 英文都不使用,只用繁體中文
5. 回傳格式為 JSON,結構固定 — 不要包在 markdown code block 裡,直接吐 JSON
6. 如果學員尚未填寫某些上下文(顯示為「尚未填寫」),請用通用銷售情境給建議,不要捏造學員的產品或客戶細節`

export type PromptKey =
  | 'm1_network'
  | 'm2_vision'
  | 'm2_product'
  | 'm2_positioning'
  | 'm3_pain_points'
  | 'm3_conflict_analysis'
  | 'm4_questions'
  | 'm4_outputs'
  | 'm4_peaks'

interface PromptDef {
  template: string
  requiredVars: readonly string[]
  expectedShape: string
}

export const PROMPTS: Record<PromptKey, PromptDef> = {
  m1_network: {
    requiredVars: ['cell_label', 'existing_content'],
    expectedShape:
      '{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, ...] }',
    template: `學員正在看「人脈三歷」的這一格:{{cell_label}}

學員填的「現有」人脈:
{{existing_content}}

請根據這個現有人脈基礎,給 3 個「如何開發新人脈」的具體方向。
每個方向必須:
- label:<10 字方向名
- summary:<60 字,告訴他這個方向為什麼有效(以現有為跳板)
- next_step:<30 字,告訴他「這週可以做的具體一個動作」(可執行)
- framework_link:對應到人脈三歷的哪一格,或工作坊其他框架(同理心地圖 / M.V.P / 客戶經營旅程)

如果學員「現有」是空的,請依「{{cell_label}}」這個類別的常見開發路徑給通用建議。

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, { ... }, { ... }] }`,
  },

  m2_vision: {
    requiredVars: ['market_target'],
    expectedShape:
      '{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, ...] }',
    template: `學員的目標市場:{{market_target}}

請給 3 個感性溝通方向(願景 / 使命 / 信仰層次),每個方向描述「品牌想讓客戶感受到的核心情感」。

參考範例的層次:
- 7-11「全家就是你家」→ 家的溫暖
- M&M「Always open」→ 隨時陪伴
- Volvo → 安全感
- Apple → 創意自我表達

每個方向必須:
- label:<10 字情感標籤
- summary:<60 字,描述客戶接觸到品牌時的內心感受
- next_step:<30 字,告訴學員「這個方向要靠什麼接觸點傳達」
- framework_link:對應 M.V.P 哪一段、或同理心地圖 / N.P.S 框架

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, { ... }, { ... }] }`,
  },

  m2_product: {
    requiredVars: ['market_target', 'vision_emotion'],
    expectedShape:
      '{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, ...] }',
    template: `學員的目標市場:{{market_target}}
學員的感性溝通(品牌情感):{{vision_emotion}}

請給 3 個理性差異化的方向(功能 / 特殊性 / 優勢),每個方向必須具體、可量化。

參考工作坊的 Q.C 框架:
- Quantify(量化支持):18 摺痕、14 小時熬煮、99.9% 純度
- Celebrity(名人 / 形象代表):吳寶春+麵包、海底撈+服務

每個方向必須:
- label:<10 字差異點
- summary:<60 字,具體寫出可量化的差異(數字、規格、流程、認證)
- next_step:<30 字,告訴學員「這個差異要怎麼證明 / 包裝」
- framework_link:對應 Q.C 量化或名人、M.V.P P 段、或客戶經營旅程

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, { ... }, { ... }] }`,
  },

  m2_positioning: {
    requiredVars: ['market_target', 'vision_emotion', 'product_rational'],
    expectedShape: '{ "versions": ["...", "...", "..."] }',
    template: `學員的 M.V.P:
- M(目標市場):{{market_target}}
- V(感性溝通):{{vision_emotion}}
- P(理性差異):{{product_rational}}

請依以下句型,生成 3 個版本的定位句(短 / 中 / 長):

句型:「對於 ___ 來說,與 ___ 相比,我們更 ___、___、___」

- 短版本:不超過 30 字,只填 1 個關鍵差異
- 中版本:40-60 字,填 2-3 個差異
- 長版本:60-90 字,填 3 個差異 + 加上情感呼應

不要使用禁用詞(賦能 / 共創 / 生態系 / 閉環 / 賽道 / 乾貨 / 落地 / 賦予 / 打造)。

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "versions": ["短版本句子", "中版本句子", "長版本句子"] }`,
  },

  m3_pain_points: {
    requiredVars: [
      'role_label',
      'industry_label',
      'role_basic',
      'role_think_feel',
      'other_roles',
    ],
    expectedShape:
      '{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, ...] }',
    template: `學員正在填寫角色:{{role_label}}
產業:{{industry_label}}
基本資料 / 內心想法:
{{role_basic}}
{{role_think_feel}}

組織內其他角色:
{{other_roles}}

請根據此角色的職位特性,給 3 個常見的工作痛點方向(內心恐懼 / 沮喪 / 阻礙前進)。
每個方向必須:
- label:<10 字
- summary:<60 字,具體到該職位的日常情境
- next_step:<30 字,告訴學員「銷售方可以怎麼用這個痛點切入」
- framework_link:對應到工作坊的同理心地圖、M.V.P 哪一段、或 Q.C 框架

重點:
- 必須與「組織內其他角色」的痛點有差異化(避免三個角色講同一件事)
- 必須是「銷售方可解決」的痛點(否則填了也沒用)

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, { ... }, { ... }] }`,
  },

  m3_conflict_analysis: {
    requiredVars: ['industry_label', 'roles_summary', 'm2_mvp_summary'],
    expectedShape:
      '{ "conflicts": "...", "excited_resistant": "...", "attack_path": "..." }',
    template: `產業:{{industry_label}}

學員已填寫的角色與痛點 / 爽點:
{{roles_summary}}

學員的提案(來自 M2.M.V.P):
{{m2_mvp_summary}}

請輸出 3 段分析,每段 100 字以內:

1. **conflicts(角色間利益衝突)**:這幾個角色之間最可能的核心矛盾是什麼?
   舉例格式:「[角色 A] 想要 X,[角色 B] 想要 Y,衝突點在於 Z」
   如果只有 1 個角色或衝突不明顯,寫「角色數不足以分析衝突,建議至少填 2-3 個關鍵角色」

2. **excited_resistant(誰最興奮、誰最抗拒)**:基於學員的提案內容,
   哪個角色最會買單、為什麼?哪個角色會最抗拒、為什麼?

3. **attack_path(攻擊路徑建議)**:應該先攻誰、後攻誰、為什麼這個順序?
   要呼應學員的提案優勢與各角色的痛點。

不要包在 markdown code block 裡。回傳 JSON 嚴格如下:
{ "conflicts": "...", "excited_resistant": "...", "attack_path": "..." }`,
  },

  m4_questions: {
    requiredVars: [
      'stage_label',
      'm2_market',
      'm2_vision',
      'm2_product',
      'm3_industry',
      'm3_keyman',
    ],
    expectedShape: '{ "questions": ["...", "...", "...", "...", "..."] }',
    template: `階段:{{stage_label}}

學員的事業背景:
- 目標市場:{{m2_market}}
- 感性溝通:{{m2_vision}}
- 理性差異:{{m2_product}}

目標客戶:
- 產業類型:{{m3_industry}}
- KEY MAN:{{m3_keyman}}

請給 5 個這個階段適合問的引導問題,每個問題必須:
- 開放式(不能用是/否回答)
- 能挖出對方的需求或痛點
- 推進到下一個銷售階段
- 在 25 字以內

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "questions": ["...", "...", "...", "...", "..."] }`,
  },

  m4_outputs: {
    requiredVars: ['stage_label', 'questions'],
    expectedShape:
      '{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, ...] }',
    template: `階段:{{stage_label}}

學員填的引導問題:
{{questions}}

請給 3 個方向,告訴學員:
「如果我這樣問,我預期對方會說出什麼樣的答案,才算推進成功?」

每個方向必須:
- label:<10 字的方向名
- summary:<50 字描述,具體說明對方應該講出哪些訊息(可被觀察 / 驗證)
- next_step:<30 字,告訴學員拿到這些訊息後下一步可以做什麼
- framework_link:對應到工作坊的哪個框架(例:同理心地圖 / M.V.P / Q.C / N.P.S)

範例:
- 開發階段問「你們現在用哪家供應商?」
- 預期產出 label:競品情報、summary:得知競品名稱 + 合作年限 + 不滿意點(3 個)、next_step:用 Q.C 量化我們的優勢

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "directions": [{ "label": "...", "summary": "...", "next_step": "...", "framework_link": "..." }, { ... }, { ... }] }`,
  },

  m4_peaks: {
    requiredVars: ['m2_mvp_summary', 'm3_industry', 'm4_stages_summary'],
    expectedShape:
      '{ "directions": [{ "label": "60 秒第一印象", ... }, { "label": "創造高峰", ... }, { "label": "峰終留念", ... }] }',
    template: `學員的事業:{{m2_mvp_summary}}
目標客戶:{{m3_industry}}
旅程設計摘要:
{{m4_stages_summary}}

請根據峰終定律與 N.P.S 框架,給 3 個情緒高峰設計建議,順序固定為:
1. 60 秒第一印象怎麼設計?(對應 S2 拜訪;例:海底撈遞髮圈、製造記憶點)
2. 創造高峰怎麼設計?(對應 S4 提案;例:解決對方一個沒講出來的痛點)
3. 峰終留念怎麼設計?(對應 S6 成交;例:離場前的一個小驚喜)

每個建議呼應學員的事業特性。

每個 direction 物件結構:
- label:必須是上面 3 個固定字串之一(60 秒第一印象 / 創造高峰 / 峰終留念)
- summary:<60 字,描述這個高峰要創造什麼情緒
- next_step:<40 字,具體可執行的動作
- framework_link:對應的工作坊框架(N.P.S / 峰終定律 / 6S 感官)

回傳 JSON,結構嚴格如下,不要任何其他文字:
{ "directions": [
  { "label": "60 秒第一印象", "summary": "...", "next_step": "...", "framework_link": "..." },
  { "label": "創造高峰", "summary": "...", "next_step": "...", "framework_link": "..." },
  { "label": "峰終留念", "summary": "...", "next_step": "...", "framework_link": "..." }
]}`,
  },
}

export function renderPrompt(key: PromptKey, vars: Record<string, string>): string {
  const def = PROMPTS[key]
  if (!def) throw new Error(`Unknown promptKey: ${key}`)

  let rendered = def.template
  for (const v of def.requiredVars) {
    const value = (vars[v] ?? '').trim() || '尚未填寫'
    rendered = rendered.replaceAll(`{{${v}}}`, value)
  }
  return rendered
}

export function isValidPromptKey(k: unknown): k is PromptKey {
  return typeof k === 'string' && k in PROMPTS
}
