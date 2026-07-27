# 第 2 章：需求分析

> **视角**：双视角（乔布斯讲用户矛盾，卡帕西讲非功能约束）
> **前置知识**：读完了 [第 1 章 立项与背景](file:///workspace/docs/tutorial/01-initiation.md)
> **本章学什么**：
> 1. 功能性需求：4 个核心矛盾 → 4 层架构的具体功能
> 2. 非功能性需求：性能 / 安全 / 可用性 / 离线 / 成本
> 3. 用户故事：5-8 个典型场景
> 4. 约束条件：运行时 / 平台 / 成本限制
> **预计阅读时间**：25 分钟
> **关联文档**：[docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) / [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md)

---

## 2.1 功能性需求：4 矛盾 → 4 层架构

第 1 章讲的三个核心矛盾，展开为四层架构（L1-L4）。每一层解决一个明确的问题：

### L1 内容层：解决"学什么"和"凭什么信你"

| 功能 | 描述 | 实现位置 |
|---|---|---|
| 策展式知识库 | 49 个技能节点，每个挂载 ≥2 条 T0-T2 级权威来源 | [content/graph/nodes/*.yaml](file:///workspace/content/graph/nodes/) |
| Content-as-Code | 知识库不是数据库行，是仓库里的 YAML 代码 | [content/](file:///workspace/content/) |
| 权威来源等级 | T0（官方文档/论文）/ T1（经典源码）/ T2（工程博客）/ T3（二手解读，仅补充） | [content/sources/registry.yaml](file:///workspace/content/sources/registry.yaml) |
| 三层质量门禁 | 结构层（zod schema）+ 图谱层 G1-G7 + 成分层 | [lib/curriculum/graph.ts](file:///workspace/lib/curriculum/graph.ts) |
| 知识库向量搜索 | 500 条 × 768 维 BGE 嵌入，余弦相似度 top-k + 关键词降级 | [lib/knowledge/](file:///workspace/lib/knowledge/) |

### L2 路径引擎：解决"下一步学什么"

| 功能 | 描述 | 实现位置 |
|---|---|---|
| 技能图谱 + 拓扑排序 | Kahn 算法 + 同层按 phase/id 字典序，保证产物确定性 | [lib/curriculum/path-engine.ts](file:///workspace/lib/curriculum/path-engine.ts) |
| 跳过已掌握节点 | 基于用户画像自动跳过 `skillLevel=advanced 且 stability>21天` 的节点 | 同上 |
| 6 个预置学习计划 | 前端转 AI（旗舰 49 节点）/ 算法 200 / 前端 / 后端 / AI / LLM 应用 | [lib/presets/](file:///workspace/lib/presets/) |
| 自定义主题 AI 拆解 | 输入主题，AI 拆成知识节点 + 依赖图 + v4 深度字段 | [lib/ai/knowledge.ts](file:///workspace/lib/ai/knowledge.ts) |
| 可行性评分 | confidence < 0.5 自动降级（减少每日新学量） | [lib/ai/plan-feasibility.ts](file:///workspace/lib/ai/plan-feasibility.ts) |

### L3 验证层：解决"学会了吗"的客观验证

| 功能 | 描述 | 实现位置 |
|---|---|---|
| V1 FSRS 卡片 | 基于 FSRS-4.5 遗忘曲线的复习调度（理解层） | [lib/fsrs.ts](file:///workspace/lib/fsrs.ts) |
| V2 代码沙箱 | 沙箱代码题（应用层，能写出来） | 进行中 |
| V3 项目检查点 | AI 按 Rubric 逐项审 GitHub 仓库（构建层，能造出来） | [lib/ai/project-review.ts](file:///workspace/lib/ai/project-review.ts) |
| V4 作品集发布 | `/portfolio` 草稿/发布/删除/同步 + 二维码分享（交付层，能证明给谁看） | [app/portfolio/](file:///workspace/app/portfolio/) |

### L4 交付层：解决"坚持"和"记忆"

| 功能 | 描述 | 实现位置 |
|---|---|---|
| 番茄时钟 | 25min 专注 + 5min 休息 + 4-1 长休息规则，浮动 widget 两态（ring 56px ↔ card 280px） | [lib/timer/](file:///workspace/lib/timer/) + [components/PomodoroWidget.tsx](file:///workspace/components/PomodoroWidget.tsx) |
| 节奏引擎 | 6 条决策优先级链统一编排"现在该做什么"，不消耗 AI 额度 | [lib/ai/rhythm-engine.ts](file:///workspace/lib/ai/rhythm-engine.ts) |
| 能量回归 | 8 维特征线性回归预测次日容量，每周自动重训练 | [lib/energy-*.ts](file:///workspace/lib/) |
| 情绪觉察 | 1 秒记录情绪 + 多巴胺干扰来源，AI 生成应对建议 | [app/emotion/](file:///workspace/app/emotion/) |
| 成就系统 | 16 个预置成就（连续打卡 / 计划完成 / 专注时长 / 复习连续 / 断卡恢复 / 首次成就），纯函数检测 | [lib/achievements/](file:///workspace/lib/achievements/) |
| 学习队列 | 合并"新学"+"复习"为单一待办流，5 维评分 + 中文 reason | [lib/study-queue/](file:///workspace/lib/study-queue/) |
| 优先级引擎 | 4 维加权评分（截止紧迫度 0.3 + FSRS 到期 0.3 + 技能差距 0.2 + 能量匹配 0.2） | [lib/ai/priority-engine.ts](file:///workspace/lib/ai/priority-engine.ts) |

### 智能化能力（AI-Native，跨层）

| 功能 | 描述 | 实现位置 |
|---|---|---|
| AI 聊天 | 流式对话 + 8 个工具调用 + Persona 注入 | [components/ChatClient.tsx](file:///workspace/components/ChatClient.tsx) |
| 4 种 Persona | 严厉教练 / 温和陪伴 / 苏格拉底导师 / 平等同行，根据状态自动切换 | [lib/ai/persona.ts](file:///workspace/lib/ai/persona.ts) |
| 用户画像 | 6 维（技能水平 / 偏好时段 / 平均专注时长 / 薄弱环节 / 学习风格 / 目标），24h TTL 自动重建 | [lib/ai/memory/](file:///workspace/lib/ai/memory/) |
| 周报 | AI 生成本周学习报告（统计 / 模式识别 / 情绪与多巴胺 / 下周建议） | [app/api/weekly/](file:///workspace/app/api/weekly/) |
| AI 质量观测 | 按场景统计调用数 / 采纳率 / 再生成率 / 平均耗时 | [lib/ai/quality-tracker.ts](file:///workspace/lib/ai/quality-tracker.ts) |
| AI 成本追踪 | 从 data stream 协议解析 token 使用量，按模型定价表估算 USD 成本 | 同上 |

---

## 2.2 非功能性需求

### 性能

| 指标 | 要求 | 实现策略 |
|---|---|---|
| 首屏加载 | < 2s（4G 网络） | Server Component SSR + Suspense 骨架屏 + 关键 CSS 内联 |
| 路由切换 | < 500ms | RouteLoading 4 variant 骨架屏 + 预加载 |
| AI 响应 | 首 token < 1s | Vercel AI SDK 流式响应 + Edge Runtime 零冷启动 |
| 本地查询 | < 50ms | IndexedDB 索引查询 + 5min TTL + LRU 100 内存缓存 |
| Bundle 体积 | < 3MB（Cloudflare Pages 限制） | 重库懒加载（recharts / html-to-image / qrcode）+ preset 数据 fetch 化 |

详细性能优化见 [docs/perf-optimization-methodology.md](file:///workspace/docs/perf-optimization-methodology.md)。

### 安全

| 要求 | 实现策略 |
|---|---|
| apiKey 不直接暴露 | 零信任 session：AES-GCM 加密 + nonce 5min 一次性消费 + HMAC-SHA256 签名 + 时间窗 ±60s + 滑动续期 7d |
| 服务端不存 apiKey 明文 | session 加密存储在 KV，解密后只在内存使用 |
| 数据隔离 | 云端按 `userId` 隔离，4 个独立 KV namespace（业务 / session / nonce / 审计） |
| 防重放攻击 | nonce 5min 一次性消费 + 时间窗 ±60s |
| 防暴力破解 | 按场景配额限流（聊天 20/日 / 计划 5/日 / 周报 1/日 / 提醒 4/日 / Trial 5/日） |
| 旧用户兼容 | 有 `modelConfig.apiKey` 但无 session → 显示升级提示 |

详细安全配置见 [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) 的"安全配置"章节。

### 可用性

| 要求 | 实现策略 |
|---|---|
| 离线可用 | PWA Service Worker stale-while-revalidate 缓存 + IndexedDB 本地存储 |
| 跨设备同步 | 增量同步到 Cloudflare KV，Last-Write-Wins 合并，tombstone TTL 30 天 |
| 暗色模式 | Tailwind `dark:` 变体，守护测试强制每对浅色 utility 必须带 dark 配对 |
| 无障碍（a11y） | Modal 内置 focus trap + ARIA + ESC + 焦点恢复；折叠按钮带 `aria-expanded`；进度条带 `role="progressbar"`；倒计时带 `role="timer"` |
| 移动端适配 | Tailwind 响应式 + 浮动 widget（番茄钟 / 聊天）边缘吸附 |

### 离线

| 场景 | 策略 |
|---|---|
| 完全离线 | IndexedDB 本地存储所有学习数据，FSRS 调度 / 番茄钟 / 学习队列全可用 |
| 离线 AI 调用 | 不可用（AI 必须走云端），但已生成的 preset 题目可离线使用 |
| 后台同步 | Service Worker `periodicsync` 事件检查到期复习 + 断卡回归提醒 |
| 推送通知 | Web Push API（需用户授权 + VAPID 密钥） |

### 成本

| 资源 | 成本控制策略 |
|---|---|
| Cloudflare Pages | 免费额度足够（500 builds/月 + 无限请求） |
| Cloudflare KV | 免费额度（100K reads/天 + 1K writes/天），按 userId 隔离避免热点 |
| AI 调用 | 用户自带 Key 不受限；Trial 模式按场景配额限流；成本追踪仪表盘可见 |
| Workers AI（向量嵌入） | 构建期预嵌入（500 条 × 768 维），运行时只嵌查询文本，省 99% 调用 |
| Bundle 体积 | < 3MB 限制，重库懒加载 |

---

## 2.3 用户故事

### 故事 1：首次使用（小张的 Aha Moment）

```
作为小张（前端工程师想转 AI），
我打开 https://devpath-ai.pages.dev/，
系统自动注入 Demo 数据（前端工程师示例计划 + 3 张复习卡片 + 2 天学习日志），
我立即看到完整功能，不用配置任何东西，
10 秒内理解"哦，这是个学习教练"。
```

### 故事 2：配置 AI 模型

```
作为小张，
我在"我的 → AI 模型配置"填入 GLM API Key（国内免梯子有免费额度），
系统用零信任 session 加密我的 Key（AES-GCM + nonce + HMAC），
我立即能用 AI 聊天 / 生成计划 / 周报等功能，无限流。
```

### 故事 3：日常学习闭环

```
作为小张，
每天早上打开 devpath-ai，
首页 Hero 区节奏引擎告诉我"现在该做什么"：
- 继续专注 → 启动番茄钟（25min）
- 低能量 → 休息建议
- 到期复习 → 跳转复习页
- 学习时段 → 跳转学习页

我点"继续专注"，番茄钟开始倒计时，
25 分钟后自动提醒休息，完成后写 LearnLog + 更新能量样本。
```

### 故事 4：复习卡片

```
作为小张，
我有 3 张到期复习卡片（FSRS 调度），
打开复习页，看到卡片正面（问题），
思考后点"显示答案"，看到四段式答案（结论与原理 / 实战案例 / 举一反三 / 扣分点对照），
按 FSRS 4 档评分（Again / Hard / Good / Easy），
系统更新卡片稳定性 + 下次到期时间。
```

### 故事 5：AI 教练对话

```
作为小张，
我点右下角浮动聊天入口，
告诉 AI 教练"我今天不想学 RAG，想复习一下 Transformer"，
AI（当前 Persona 是温和陪伴，因为检测到 energy≤2 + mood=bad）回复：
  "理解，今天能量低，我们复习点轻松的。Transformer 你最熟的是哪部分？"
我回复"注意力机制"，
AI 调用 8 个工具之一（启动番茄 / 调整计划 / 等），
幂等键防止重复执行。
```

### 故事 6：跨设备同步

```
作为小张，
我在公司电脑学了一上午（番茄钟 4 个 + 复习卡片 10 张），
点击"我的 → 数据同步 → 上传到云端"，
系统增量同步到 Cloudflare KV（只传 updatedAt > lastSyncAt 的数据）。

回到家，打开家里的电脑，
点击"下载云端数据"，Last-Write-Wins 合并，
我的学习进度完整恢复。
```

### 故事 7：作品集发布

```
作为小张，
我完成了 V3 项目检查点（AI 按 Rubric 审我的 GitHub 仓库，评分 85/100），
在 /portfolio 把项目发布为作品集，
生成二维码分享给招聘官，
招聘官扫码看到 /u/xiaozhang/portfolio 公开作品集。
```

### 故事 8：断卡恢复

```
作为小张，
我连续打卡 30 天后断卡了 1 周（出差没空学），
重新打开 devpath-ai，
系统检测到断卡，触发"断卡恢复"成就（16 个成就之一），
AI Persona 切换到"温和陪伴"，
首页 Hero 区提示"欢迎回来，先复习几张卡片找回感觉？"
```

---

## 2.4 约束条件

### 运行时约束

| 约束 | 含义 | 影响 |
|---|---|---|
| Edge Runtime | Cloudflare Pages Edge Runtime（非 Node.js） | 不能用 Node 内置模块（fs / path / crypto），需 `nodejs_compat` flag |
| Bundle < 3MB | Cloudflare Pages Worker bundle 限制 | 重库必须懒加载；preset 数据不能静态 import，要 fetch JSON |
| 无文件系统 | Edge Runtime 无 fs | 所有数据走 IndexedDB（本地）或 KV（云端） |
| 无原生 crypto | Edge Runtime 的 Web Crypto API | 用 `lib/ai/crypto.ts` 封装 base64/hex/AES-GCM/HMAC-SHA256 |

### 平台约束

| 约束 | 含义 | 影响 |
|---|---|---|
| Cloudflare KV 最终一致性 | 写入后可能延迟几秒才全球同步 | session 写入后需 retry；不适用于强一致场景 |
| KV 限流 | 免费额度 100K reads/天 + 1K writes/天 | 用 `userId` 隔离 + 增量同步（只传变更） + 5min TTL 缓存 |
| IndexedDB 容量 | 浏览器限制（通常 50MB-无上限） | 单表 kv 设计 + 4 索引，避免过度规范化 |
| Service Worker 生命周期 | 安装 / 激活 / 失活 | 用 stale-while-revalidate 策略，避免破坏性更新 |

### 成本约束

| 约束 | 含义 | 影响 |
|---|---|---|
| 零后端成本 | 不想养服务器 | 全走 Edge Runtime + KV，免费额度内 |
| AI 成本可控 | 用户自带 Key 不受限，Trial 模式服务端付费 | Trial 按场景配额限流（聊天 20/日 / 计划 5/日 / 周报 1/日） |
| 向量嵌入成本 | Workers AI 按调用计费 | 构建期预嵌入 500 条，运行时只嵌查询文本 |

### 设计约束（来自 AGENTS.md）

| 约束 | 含义 | 影响 |
|---|---|---|
| 统一组件库 | `components/ui/` 之外禁止原生表单元素 | 守护测试 `no-native-form-elements.test.ts` 扫描 |
| 设计令牌单一事实源 | 禁止 `text-[10px]` 逃逸值，必须用 `text-2xs` 等令牌 | 守护测试 `ui-design-system-guard.test.ts` 扫描 |
| 暗色配对 | 每个浅色 utility 必须带 `dark:` 变体 | 同上守护测试 |
| Modal 必须用 `<Modal>` | 禁止手写 div 模态（缺 ARIA + focus trap） | 代码评审 + 未来补守护测试 |
| 跳转必须带场景参数 | 用 `buildSceneUrl` 构造 URL，`parseSceneParams` 读取 | AGENTS.md 2.12 强制 |

---

## 本章小结

**学到了什么**：
1. 功能性需求按 4 层架构组织（L1 内容 / L2 路径 / L3 验证 / L4 交付）+ 智能化能力跨层
2. 非功能性需求 5 类：性能 / 安全 / 可用性 / 离线 / 成本，每类有明确指标和策略
3. 8 个用户故事覆盖典型场景（首次使用 / 配置 / 日常 / 复习 / AI 对话 / 同步 / 作品集 / 断卡恢复）
4. 约束条件 4 类：运行时（Edge Runtime）/ 平台（KV）/ 成本（零后端）/ 设计（AGENTS.md）

**关键决策回顾**：
1. 本地优先 PWA + 可选云端同步（数据归用户）
2. 零信任 session（apiKey 不直接暴露，AES-GCM + nonce + HMAC）
3. 按场景配额限流（Trial 模式服务端付费，用户自带 Key 不受限）
4. 守护测试强制设计规范（统一组件 / 设计令牌 / 暗色配对）

## 下一章衔接

下一章 [03-product-design.md](file:///workspace/docs/tutorial/03-product-design.md) 会深入产品设计：L1-L4 四层架构的详细设计、6 条产品原则、与竞品的差异、设计哲学。这是乔布斯视角的"怎么做产品决策"。

## 延伸阅读

- [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) — 技术架构（分层 / 数据流 / 设计决策）
- [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) — 产品说明（用户视角的功能介绍）
- [12 Factor App](https://12factor.net/) — 现代 Web 应用的方法论
