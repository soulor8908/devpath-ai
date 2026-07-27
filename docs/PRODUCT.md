# devpath-ai 产品说明

> 面向所有人：理解 DevPath 是什么、为谁而造、解决什么问题、如何使用。
> 视角：乔布斯式产品思维——少即是多、聚焦真实场景、说人话。

---

## 一句话定位

**DevPath AI 是把自学者变成能独立交付 AI 产品的工程师的转型系统。**

不是学习工具，是身份转变。学习只是过程，能交付才是结果。

---

## 谁该用 DevPath

### 目标用户

- **前端工程师 → AI 全栈 / AI Agent 工程师**：旗舰路径已策展（49 节点 / 196 题 / 5 阶段 16-20 周）
- **想转 AI 但不知从何下手**：用策展轨道避免「学了忘、忘了学」的低效循环
- **有基础但缺项目证据**：通过 V3 项目审查 + V4 作品集把零散学习变成可证明的能力
- **自学能力强但需要节奏**：番茄钟 + 节奏引擎 + FSRS 复习帮你坚持而不靠意志力

### 不该用 DevPath

- 想找「3 天速成 LLM」的（这里没有捷径）
- 想让 AI 直接生成面试答案的（违反内容生成宪章，会被守护测试拦截）
- 不愿意写代码只想看视频的（V2 代码沙箱是必经环节）
- 想要纯理论 / 学术研究的（DevPath 聚焦工程交付，不教训练模型）

---

## 解决什么问题（第一性原理）

自学开发者转型 AI 工程师，本质有 4 个矛盾。DevPath 用 4 层架构一一化解：

| 矛盾 | DevPath 的解法 | 对应架构层 |
|---|---|---|
| 通用工具找不到方向 | 6 条预置策展轨道 + 跳过已掌握节点的最短路径 | L1 内容层 + L2 路径引擎 |
| AI 生成内容没权威、无出处 | Content-as-Code，每节点 ≥2 条 T0-T2 级权威来源 | L1 内容层 |
| 学了就忘、不知道会不会 | V1 FSRS 卡片 → V2 代码沙箱 → V3 项目审查 → V4 作品集 | L3 验证层 |
| 坚持不下去、状态起伏 | 番茄钟 + 节奏引擎 + 能量回归 + 情绪觉察 + 成就 | L4 交付层 |

---

## 核心产品原则

### 1. 内容是护城河，不是机制

> 「健身房再豪华也没用，关键看里面有没有训练计划。」

DevPath 的学习内容不是 LLM 现场生成的二手货，而是仓库里 YAML 代码版本化的策展知识图谱。每条节点都能回答：「这句话的依据是什么？出处在哪？」。LLM 是导师，不是教材本身。

### 2. Skills are built by doing, not by reading

神经层面，「看懂」和「会做」是两套回路。学习的最小单元是项目，文章只是项目的说明书。所以 DevPath 强制每个知识节点挂 V2 代码沙箱 + V3 项目检查点，AI 按 Rubric 审你的真实 GitHub 仓库。

### 3. 路径是个性化的最短路径

前端工程师不是零基础——TypeScript、异步、HTTP、组件化思维全部是可迁移资产。DevPath 用技能图谱 + 拓扑排序 + 用户画像自动跳过已掌握节点，不浪费你一分钟。

### 4. 权威 = 策展，不是生成

2026 年 LLM 生成的二手内容无限供应且持续贬值，有出处的一手内容反而升值。DevPath 的知识库每条内容必须挂载 T0（官方文档/论文）或 T1（经典源码/Cookbook）级权威来源，T3 二手解读仅作补充不可单独支撑节点。

### 5. 动力 = 朝向身份的可见进展

人坚持不下去不是因为懒，是因为看不到自己在接近「成为某种人」。DevPath 把进度外显为证据：可部署的项目、GitHub 仓库、`/portfolio` 可分享作品集、`/u/<username>` 公开学习轨迹。学习轨迹本身就是求职资产。

### 6. 坚持是设计出来的，不是靠意志力

番茄钟 25min 专注 + 5min 休息 + 4-1 长休息规则；节奏引擎 6 条决策链告诉你「现在该做什么」；能量回归模型预测你明天的容量，自动降级过载日程；情绪觉察识别多巴胺干扰，AI 给出应对建议；成就系统 16 个徽章正向激励。

---

## 核心使用流程

### 第一次使用

1. **打开** https://devpath-ai.pages.dev/ → 自动注入 Demo 数据（前端工程师示例计划 + 3 张复习卡片 + 2 天学习日志），不用配置即可体验完整功能
2. **配置 AI 模型**：我的 → AI 模型配置
   - Trial 模式：免费试用，按场景配额限流（聊天 20/日、计划 5/日、周报 1/日、提醒 4/日）
   - 自带 Key：用 GLM / DeepSeek / OpenAI 等模型的 API Key，走零信任 session 加密，无限流
3. **创建真实计划**：选 6 个预置轨道之一，或输入自定义主题让 AI 拆解
4. **清除 Demo 数据**：创建首个真实计划时提示一键清除

### 日常使用闭环

```
每天打开 DevPath
   │
   ├─ 首页 Hero 区：节奏引擎告诉你「现在该做什么」
   │   ├─ 继续专注 → 启动番茄钟（25min 专注 + 5min 休息）
   │   ├─ 低能量 → 休息建议
   │   ├─ 到期复习 → 跳转复习页（FSRS 调度卡片）
   │   ├─ 学习时段 → 跳转学习页（当日新学任务）
   │   └─ 接近睡觉 → 睡前复盘
   │
   ├─ KPI 三宫格：今日清单 N 项 / 已完成 X 项 / 连续打卡 N 天
   ├─ AI 教练洞察区：用户画像 + 能力雷达 + AI 质量摘要
   ├─ 能量趋势迷你图 + 7 天热力图
   └─ 今日学习队列：5 维评分排序的新学+复习合并待办流
       ↓
       跳转用 buildSceneUrl 携带场景参数（planId/nodeId/cardId/date）
       ↓
   学习/复习页聚焦到目标任务，无需重新查找
```

### 周末复盘

- `我的 → 周报` 触发 AI 生成本周学习报告
- 包含：统计（学习时长 / 完成任务 / 复习卡片）+ 模式识别 + 情绪与多巴胺分析 + 下周建议
- 限流 1 次/日，每周首次自动提示

### 跨设备同步

- `我的 → 数据同步 → 上传到云端`：增量同步到 Cloudflare KV（Last-Write-Wins 合并，tombstone TTL 30 天）
- 在另一台设备 `下载云端数据` 即可恢复
- 完全手动触发，不主动上传任何数据

---

## 主要功能模块

### 学习（L1+L2+L3）

- **6 个预置轨道**：
  - 前端转 AI 工程师（旗舰，49 节点 / 196 题，策展自 YAML 图谱）
  - 算法 200 题（LeetCode Hot 100 + 进阶 + 高频面试）
  - 前端工程师（30 节点 / 210 题，HTML/CSS → JS → TS → React/Vue → 性能 → 工程化）
  - 后端工程师（46 节点 / 340 题，Java/Python/Go + Spring/Django/FastAPI + 微服务 + 分布式）
  - AI 工程师（44 节点 / 270 题，ML 基础 → Transformer → LLM → CV/推荐）
  - LLM 应用开发（38 节点 / 287 题，Prompt → RAG → Agent → LangChain → 微调/部署/评估）
- **自定义主题**：输入主题（如「前端性能」「系统设计」），AI 拆成可独立学习的知识节点 + 依赖图
- **v4 深度字段**：每个 AI 生成节点自带 `coreMechanism`（核心机制 80-150 字）/ `commonPitfalls`（高频踩坑 2-3 条）/ `interviewAngles`（4 题角度提示）/ `sourceHint`（一手来源提示）
- **拓扑排序**：Kahn 算法 + 同层按 phase/id 字典序，保证产物确定性
- **跳过已掌握**：基于用户画像自动跳过 `skillLevel=advanced 且 stability>21天` 的节点
- **可行性评分**：confidence < 0.5 自动降级（减少每日新学量）

### 复习（L4 FSRS）

- ts-fsrs 4.5 遗忘曲线调度
- 3 种参数预设：conservative 0.95 / standard 0.9 / aggressive 0.8
- Streak + 热力图可视化（CloneElement 实现 SVG rect 点击，禁止 div 包裹破坏 SVG）
- 复习队列：5 维评分（FSRS 紧迫度 + 能量补偿 + 多巴胺补偿 + 连续 new 过载扣分）

### 番茄时钟（L4）

- 右下角浮动 widget，两态切换：
  - ring 态：56px 圆环浮窗，常驻显示倒计时进度，可拖动 + 边缘吸附
  - card 态：280×420 卡片浮窗，承载 idle / running / completed 三态视图与表单输入
- 4-1 长休息规则（4 个专注后长休息 15min，否则短休息 5min）
- 严格模式：3 次打断（visibilitychange + blur）自动放弃 session，actualMinutes 扣除打断时长
- 完成自动写 LearnLog + 更新能量样本 + 触发成就检测

### AI 教练（智能化）

- **流式对话**：右下角浮动入口（FloatingChatButton 常驻 + ChatModal 按需挂载）
- **8 个工具调用**：创建提醒 / 调整计划 / 切换冻结 / 设置优先级 / 启动番茄 / 生成计划 / 优化日程 / 获取今日日程，幂等键防重复执行
- **4 种 Persona**：
  - 严厉教练（energy≥4 + 计划滞后）
  - 温和陪伴（energy≤2 + mood=bad）
  - 苏格拉底导师（topic 含代码/算法/原理）
  - 平等同行（默认）
  - 用户可在 `我的 → Persona` 手动覆盖
- **用户画像**：6 维（技能水平 / 偏好时段 / 平均专注时长 / 薄弱环节 / 学习风格 / 目标），24h TTL 自动重建，高频维度事件驱动增量更新
- **节奏引擎**：6 条决策优先级链，不消耗 AI 额度
- **能量回归**：8 维特征线性回归预测次日容量，每周自动重训练

### 成就系统（L4）

- 16 个预置成就：连续打卡（3/7/30/100 天）/ 计划完成（1/3/10 个）/ 专注时长（10/50/200h）/ 复习连续（7/30 天）/ 断卡恢复 / 首次成就（番茄 / 答对错题 / 周报）
- 纯函数检测，首页通知 + 成就墙
- 公开主页 `/u/<username>` 默认关闭，需显式开启

### 作品集（L3+L4）

- `/portfolio` 草稿 / 发布 / 删除 / 同步云端
- 二维码分享
- `/u/[username]/portfolio` 公开作品集访客查看
- 关联 V3 项目检查点（AI 按 Rubric 审 GitHub 仓库）

### 数据与同步

- 本地存储：IndexedDB（Dexie），三索引 `&key, prefix, updatedAt`
- 云端备份：Cloudflare KV，4 个独立 namespace（业务 / session / nonce / 审计）
- 增量同步：`getChangesSince(lastSyncAt)` 利用 updatedAt 索引，无变更返回 noop（O(0) 网络成本）
- Last-Write-Wins 合并，tombstone TTL 30 天

### AI 质量与成本

- **质量看板** `/stats/ai-quality`：按场景统计调用数 / 采纳率 / 再生成率 / 平均耗时，Prompt 版本对比，失败模式聚类
- **成本追踪**：从 Vercel AI SDK data stream 协议解析 token 使用量，按模型定价表估算 USD 成本，仪表盘展示 Token 总量 + 估算成本 + 场景级成本聚合

---

## 数据隐私

- 所有学习数据存储在浏览器 IndexedDB，**不会主动上传**到任何服务器
- 跨设备同步是**手动触发**，用户点击「上传到云端」才传输
- 云端数据按 `userId` 隔离
- **零信任 session**：apiKey 不直接暴露，AES-GCM 加密 + nonce 5min 一次性消费 + HMAC-SHA256 签名 + 时间窗 ±60s + 滑动续期 7d
- `MODEL_CONFIG`（含 apiKey）不在 `SYNC_PREFIXES`，仅本地存储
- 提供「登出所有设备」按钮调 `revokeSession` 吊销 session
- AI 调用只传输必要的上下文（学习日志摘要 / 能量数据 / 用户画像 / 聊天历史），不传输全量数据
- 成就墙默认关闭，需用户在隐私设置中显式开启才会公开展示

---

## 与其他产品的差异

| 维度 | DevPath | 普通学习网站 | AI 聊天工具 | 刷题平台 |
|---|---|---|---|---|
| 内容来源 | 仓库 YAML 策展 + T0-T2 权威来源 | UGC / 编辑整理 | LLM 即兴生成 | 题库 |
| 路径个性化 | 技能图谱 + 拓扑排序 + 跳过已掌握 | 固定课程 | 无 | 无 |
| 验证闭环 | V1 FSRS → V2 沙箱 → V3 项目审 → V4 作品集 | 选择题 / 测验 | 无 | 算法题 |
| 坚持机制 | 番茄 + 节奏引擎 + 能量回归 + 情绪 + 成就 | Streak | 无 | Streak |
| AI 角色 | 编排器（Persona + 画像 + 工具调用） | 无 / 辅助 | 主功能 | 无 |
| 输出证据 | GitHub 仓库 + 作品集 + 公开主页 | 证书 | 无 | 通过率 |
| 数据归属 | 本地 IndexedDB + 可选 KV 同步 | 平台服务器 | 平台服务器 | 平台服务器 |

---

## 设计哲学（乔布斯视角）

1. **聚焦**：不做「想学什么都行」的通用工具，先做穿一条前端→AI 旗舰路径。一条被验证的 16 周转型路径，比一百条 AI 现场生成的路径值钱。
2. **说人话**：UI 文案是「我答对了」「现在该做什么」「休息 5 分钟」，不是「Confirm Mastery」「Next Action」「Break Session」。
3. **少即是多**：番茄钟 widget 只有 ring/card 两态；首页只有 6 区；底部导航只有 4 项。每多一个选项都是认知负担。
4. **真实场景驱动**：Demo 数据是真实前端工程师计划，不是 placeholder。每个功能都对应一个真实使用场景，没有「万一有人想用」的边缘功能。
5. **质量优先于功能数量**：1037+ 测试 + 三层质量护栏（预防 / 检测 / 审计）+ 守护测试。功能可以少，质量不能塌。
6. **用户拥有数据**：本地优先 + 可选同步 + 一键清除 Demo + 登出所有设备。数据归用户，不归平台。

---

## 路线图

详见 [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) 的「落地路线图」章节。当前进展：

- ✅ **Sprint 1-2 内容层骨架**：49 节点 YAML 策展 + G1-G7 图谱规则 + 来源登记处
- ✅ **Sprint 3-4 路径引擎**：拓扑排序 + 跳过已掌握 + 可行性评分
- 🚧 **Sprint 5-8 验证层**：V1 FSRS 已有；V2 代码沙箱 / V3 项目审查 / V4 作品集 进行中
- 🚧 **PWA Service Worker**：stale-while-revalidate + Web Push + periodicsync 已完成
- 📋 **未来**：模型 fallback 链 / Prompt A/B 测试 / 成本追踪扩展到非流式路由

---

## 相关文档

- [README.md](file:///workspace/README.md) — 项目介绍（开发者入口）
- [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) — 技术架构（分层 / 数据流 / 设计决策）
- [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) — 开发指南（环境 / 测试 / 各模块开发流程）
- [AGENTS.md](file:///workspace/AGENTS.md) — AI 编码守则（强制规范）
- [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) — UI 设计系统
- [docs/curriculum-content.md](file:///workspace/docs/curriculum-content.md) — 课程内容规范
- [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md) — AI 内容生成规范
- [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) — 产品诊断与重构设计
