# 附录 B：踩坑记录

> 15 个真实踩坑记录，按"现象 / 根因 / 修复 / 关联"结构整理。来源：AGENTS.md 2.11-2.13 + 各 spec 的"Why"部分 + 迭代史 Phase 0-13。

---

## 坑 1：脑图搜索框挡住工具栏 + 遮挡画布节点

**现象**：用户反馈"脑图搜索框挡住工具栏 + 工具栏和搜索框遮挡脑图节点"。在窄屏（< 510px 视口）下两个浮层重叠；大屏下画布顶部 60-80px 节点被永久遮挡。

**根因**：用 `absolute top-2 left-2 w-44`（搜索框）+ `absolute top-2 right-2`（工具栏）当浮层。两个浮层都 `z-20` 覆盖在 SVG 画布上，默认假设"不占空间"，实际占了 viewport 顶部固定区域。开发时只在小数据集 / 桌面宽屏验证，没考虑窄 Modal（脑图弹窗在 xl=1024px Modal 内）和移动端。

**修复**：改为 sticky header + flex 行布局——工具栏 / 搜索框用 `sticky top-0` + `flex` 行，让它们占据自己应得的空间，画布从工具栏下方开始。详见 [AGENTS.md 2.11](file:///workspace/AGENTS.md)。

**关联**：Phase 12 / [2026-07-23-ui-redesign-and-learning-page-rework-design.md](file:///workspace/docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md)

---

## 坑 2：跳转不带场景参数，用户在目标页要重新找任务

**现象**：用户反馈"我从某个知识点进来的，那就默认过来某个知识点；从今天计划进来的，就加今日过滤条件"。原代码从首页/计划详情跳到训练/复习/学习详情页时不带任何 query 参数，用户落到目标页后还要重新找刚点过的任务。

**根因**：跳转方只写 `href="/review"` 或 `href={`/learn/${planId}`}`，没把"用户当前在看的任务上下文"传过去。目标页只能从全量数据加载，不知道用户想聚焦哪一项。交互闭环断裂。

**修复**：用 `buildSceneUrl` 构造带场景参数的 URL（`planId/nodeId/cardId/date/from`）；目标页用 `parseSceneParams` 读取并过滤/预选。详见 [AGENTS.md 2.12](file:///workspace/AGENTS.md) / [lib/study-queue/nav-params.ts](file:///workspace/lib/study-queue/nav-params.ts)。

**关联**：Phase 12 / [2026-07-23-ui-redesign-and-learning-page-rework-design.md](file:///workspace/docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md)

---

## 坑 3：学习路径节点太浅，用户反馈"浮于表面"

**现象**：用户投诉"所有学习路径还是不行，太简单，不全面，让人觉得候选人知识太浮于表面"。

**根因**（卡帕西视角）：
1. **schema 太薄**：旧 `knowledge_decompose` 只产 `summary` 一句话，用户看到的学习路径是"标题列表 + 一句话摘要"
2. **守护断层**：`preset-content-quality.test.ts` 只查答案字符数，不查答案是否真有四段式结构；`content-generation-standard.test.ts` 只查 prompt 字符串 marker，不查 preset 实际产物。结果 16 道 AI preset 题答案 < 500 字符蒙混过关
3. **prompt 不要求深度**：`knowledge_decompose` 第 5 条"节点数量" + 第 8 条"覆盖面试主要考察面"，只管"宽度"不管"深度"

**修复**：
1. v4 schema：节点必带 `coreMechanism`（80-150 字）/ `commonPitfalls`（2-3 条）/ `interviewAngles`（4 题）/ `sourceHint`（一手来源）
2. 守护测试强化：`content-generation-standard.test.ts` 守 prompt 必含 4 字段标记 + "求职资产" + "缺一不可" + "禁止名词罗列"；`preset-content-quality.test.ts` 守 preset 节点深度字段达标
3. Prompt 强化：注入四段式宪章（结论与原理 / 实战案例 / 举一反三 / 扣分点对照）

详见 [AGENTS.md 2.13 + 第 9 节](file:///workspace/AGENTS.md)。

**关联**：Phase 13 / [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md)

---

## 坑 4：React error #185（Maximum update depth exceeded）

**现象**：用户打开学习列表页直接白屏，控制台 `Maximum update depth exceeded`。

**根因**：`app/learn/list/ListClient.tsx` 的 `useCallback(refresh, [router])` + `useEffect(refresh)` 形成链式依赖。Next.js App Router 的 `useRouter()` 返回的 router 实例**不保证引用稳定**，每次 render 都可能变 → `refresh` 函数引用变 → `useEffect(refresh)` 重新触发 → 触发 render → 无限循环。同类 `useEffect(..., [planId, router])` 反模式在 4 个文件中重复出现。

**修复**：
1. 把 `router` 用 `useRouter()` 的 `pathname`（string，引用稳定）替代
2. 把 `refresh` 拆成"读数据"（pure function，依赖稳定）和"副作用"（useEffect 内调）两层
3. 4 个文件全部修复

**关联**：Phase 9 / [fix-react-loop-and-arch-hardening spec](file:///workspace/.trae/specs/fix-react-loop-and-arch-hardening/spec.md)

---

## 坑 5：AI 工具完全空转，"AI 回复了但没执行"

**现象**：用户反馈"只看到 AI 回复，没看到番茄钟启动"。7 个写入工具（番茄钟 / 计划调整 / 提醒 / 生成计划）全是空转。

**根因**：`ChatClient.tsx:637` 流解析器监听 `type === "a"`（Vercel AI SDK annotation 前缀），但工具结果实际通过 `6:` 前缀发送（Data Stream Protocol 的 data channel）。`pendingActions` 永远为空，`executeClientAction` 从不执行。还有二级 bug：`start_focus_session` 跳 `/focus`（实际是 `/timer`），`generate_learning_plan` 写 `learn:pending_plan` 但无人读取。

**修复**：
1. 流解析器监听 `6:` 前缀（data channel）而非 `type === "a"`
2. `start_focus_session` 跳 `/timer` 而非 `/focus`
3. `generate_learning_plan` 写入 `learn:current_plan` 而非 `learn:pending_plan`

**教训**：流式协议的 bug 最难发现——表面上"AI 回复正常"，实际上工具空转。AI 工具调用必须有端到端冒烟测试。

**关联**：Phase 10 / [ai-tool-fix-and-ux-polish spec](file:///workspace/.trae/specs/ai-tool-fix-and-ux-polish/spec.md)

---

## 坑 6：ESLint 问题反复复发，CI 部署失败

**现象**：又一次因为 ESLint 问题导致发布失败——`next build` 在 deploy 工作流里才跑 lint，错误暴露太晚，已经构建 5 分钟才发现一个未使用变量。

**根因**：
1. `next build` 把 lint 放在构建阶段，错误暴露晚
2. `.eslintrc.json` 把 `no-unused-vars` / `exhaustive-deps` / `prefer-const` 设为 `"warn"`，`next lint` 默认对 warning 退出 0 → 错误溜进 CI
3. `npm run lint` 未带 `--max-warnings 0` → 残留 warning 永远不 fail
4. `scripts/install-git-hooks.sh` 需手动执行，新人/换机器必然漏装

**修复**：
1. CI 拆 `quality-gate → deploy` 两段，quality-gate 跑 lint / typecheck / test，失败阻断 deploy
2. `.eslintrc.json` 把规则从 `"warn"` 改 `"error"`
3. `npm run lint` 加 `--max-warnings 0`
4. `scripts/install-git-hooks.sh` 自动安装 pre-commit hook

**关联**：Phase 5 / Phase 8 / [eslint-and-apikey-security-overhaul spec](file:///workspace/.trae/specs/eslint-and-apikey-security-overhaul/spec.md)

---

## 坑 7：userId 明文显示，任何看到的人都能拉取覆盖数据

**现象**：用户反馈"我的 userId 在同步状态里明文显示还能复制，任何看到的人都能拉取覆盖我的数据"。

**根因**：[SyncStatus.tsx](file:///workspace/components/SyncStatus.tsx) 把 `userId`（nanoid 生成的匿名 ID）明文显示在"个人信息"分区，且支持复制。第一轮只做了 `username` 脱敏，但用户实际担忧的是 `userId`——这是数据同步的真正钥匙。

**修复**：`lib/username-mask.ts` 纯函数 `maskUsername("user_abc123def") → "user_abc***"`，在所有公开渲染点替换 userId。

**教训**：安全问题的根因不是"忘了脱敏"，是"渲染点分散且无统一入口"。修一次只能堵一个洞，下次新加功能又会漏。Phase 4 的守护测试思路就是从这里萌芽——把"不能再漏"变成 CI 检查。

**关联**：Phase 1 / [2026-07-16-username-mask-dashboard-rework.md](file:///workspace/docs/superpowers/plans/2026-07-16-username-mask-dashboard-rework.md)

---

## 坑 8：apiKey 明文存 IndexedDB + 同步到云端 KV

**现象**：架构隐患——apiKey 一直是明文存在 IndexedDB + 明文同步到云端 KV。这是定时炸弹。

**根因**：MVP 阶段为了快速验证"AI 教练"假设，跳过了安全架构。`MODEL_CONFIG`（含 apiKey）在 `SYNC_PREFIXES` 里，会随同步上传到 KV。

**修复**（零信任 session 架构）：
1. apiKey 不直接暴露，AES-GCM 加密 session
2. nonce 5min 一次性消费防重放
3. HMAC-SHA256 签名防篡改
4. 时间窗 ±60s 防中间人
5. 滑动续期 7d 体验好
6. 4 个独立 KV namespace（业务 / AUTH_SESSIONS / AUTH_NONCES / AUTH_AUDIT）安全边界清晰
7. `MODEL_CONFIG` 移出 `SYNC_PREFIXES`，仅本地存储
8. 旧用户首次访问检测：有 `modelConfig.apiKey` 但无 session → 显示升级提示
9. 提供「登出所有设备」按钮调 `revokeSession` 吊销 session

**关联**：Phase 8 / [eslint-and-apikey-security-overhaul spec](file:///workspace/.trae/specs/eslint-and-apikey-security-overhaul/spec.md)

---

## 坑 9：同步不传播删除，另一台设备"复活"已删数据

**现象**：用户在 A 设备删除一张卡片，同步到云端。B 设备同步时，云端没有这张卡，但 B 设备本地还有，同步后云端又被 B 设备的本地数据"复活"。

**根因**：删除时直接物理删除 KV 里的数据，没有"删除标记"。B 设备同步时不知道这张卡"已被删除"，把本地数据上传，导致复活。

**修复**：tombstone（带 `deletedAt` 时间戳的墓碑）——删除时不物理删除，而是写入 `deletedAt` 字段。同步时另一台设备看到 tombstone 就删除本地数据。TTL 30 天后真删（定期清理）。

**关联**：Phase 9 / [fix-react-loop-and-arch-hardening spec](file:///workspace/.trae/specs/fix-react-loop-and-arch-hardening/spec.md)

---

## 坑 10：Preset bundle 13MB 超过 Cloudflare Pages 3MB 限制

**现象**：Phase 13 后 preset 增到 6 个，bundle 13MB 超过 Cloudflare Pages 单文件 3MB 限制，部署失败。

**根因**：preset 数据（学习计划 + 知识点 + 面试题）是静态 `import` TS 源文件，打包进 bundle。preset 多了 bundle 就大。

**修复**：改为运行时 `fetch('/data/presets/{id}.json')`，JSON 数据放 `public/data/`，构建期由 `scripts/export-presets.ts` 从 TS 源生成。bundle 从 13MB 降到 6.5MB，通过限制。详见 [lib/presets/index.ts](file:///workspace/lib/presets/index.ts)（`PRESET_METAS` 同步轻量 + `loadPresetData` async fetch JSON）。

**代价**：首次加载多一次 HTTP 请求（按需加载，不影响首屏）。**收益**：bundle 通过限制，preset 数据可独立缓存（HTTP 缓存 + Service Worker stale-while-revalidate）。

**关联**：Phase 13 / [lib/presets/index.ts](file:///workspace/lib/presets/index.ts)

---

## 坑 11：原生表单元素散落各处，UI 风格不统一

**现象**：UI 体检发现组件风格不统一——有的地方用 `ui/Button`，有的地方写 `<button className="...">`，原生元素缺 ARIA、缺 focus trap、缺键盘支持。每修一个 bug 都要查"这里到底用的是哪个按钮"。

**根因**：MVP 阶段图快，直接写原生元素。后续没有统一约束，新功能继续写原生元素，越积越多。

**修复**：
1. 扩展统一组件库覆盖缺口（新建 `ui/Slider`、扩展 `ui/Button` 支持 `iconOnly`）
2. 写守护测试 `__tests__/no-native-form-elements.test.ts` 扫描所有 `.tsx` 文件，凡在 `components/ui/` 之外出现原生 `<input>/<select>/<textarea>/<button>` 即失败
3. 逐文件替换 + 每完成一组跑回归测试

**教训**：UI 一致性不是"设计师画规范"能解决的，是"代码层面强制"才能解决的。规范文档会被忽略，但 CI red 不会。

**关联**：Phase 4 / [2026-07-19-unify-all-form-components.md](file:///workspace/docs/superpowers/plans/2026-07-19-unify-all-form-components.md)

---

## 坑 12：浅色 utility 缺 dark: 配对，暗色模式断裂

**现象**：用户切换暗色模式后，部分元素仍然是浅色（如 `bg-white` 在暗色模式下应该是 `bg-gray-800`），视觉断裂。

**根因**：开发者写 `bg-white p-4` 时没写 `dark:bg-gray-800`。Tailwind 不会自动配对，要手动加。

**修复**：守护测试 `__tests__/ui-design-system-guard.test.ts` 扫描 className，发现浅色 utility（`bg-white` / `text-gray-500` / `border-gray-200` 等）缺 `dark:` 配对即失败。同时禁止 `text-[10px]` / `text-[11px]` / `text-[13px]` 等逃逸值，必须用 `tailwind.config.ts` 定义的令牌（`text-2xs` / `text-xs` / `text-sm`）。

**关联**：Phase 4 / [AGENTS.md 2.2-2.3](file:///workspace/AGENTS.md)

---

## 坑 13：emoji 当功能图标，不可访问

**现象**：用户反馈"🍅 番茄钟" / "⚠️ 已被打断"这种 emoji 当功能图标在屏幕阅读器上是"tomato" / "warning emoji"，含义不清。

**根因**：MVP 阶段图快用 emoji 当图标。emoji 没有 ARIA 语义，屏幕阅读器读出来是 emoji 名字而非功能含义。

**修复**：
1. 新建 `<Icon>` 组件，封装 SVG 图标库
2. 功能图标必须用 `<Icon name="tomato" />`，禁止 emoji 当功能图标
3. 例外：情绪表情等纯装饰 emoji 允许保留，但应加 `aria-hidden="true"`

详见 [AGENTS.md 2.9](file:///workspace/AGENTS.md)。

**关联**：Phase 4 / [AGENTS.md 2.9](file:///workspace/AGENTS.md)

---

## 坑 14：div onClick 当按钮，键盘不可访问

**现象**：用户反馈"用 Tab 键无法聚焦到这个卡片"。开发者写了 `<div onClick={handleClick} className="cursor-pointer">点击</div>`，div 不是交互元素，键盘不可访问。

**根因**：MVP 阶段图快用 div + onClick 模拟按钮。div 没有 `tabIndex` / `role` / `onKeyDown`，键盘用户无法聚焦和激活。

**修复**：
1. 优先用 `<Button>` 或 `<Link>`
2. 如必须用 div（如复杂卡片整体可点击），必须补 `role="button"` + `tabIndex={0}` + `onKeyDown`（Enter/Space 触发）

详见 [AGENTS.md 2.10](file:///workspace/AGENTS.md)。

**关联**：Phase 4 / [AGENTS.md 2.10](file:///workspace/AGENTS.md)

---

## 坑 15：BGE 768 维向量索引运行时嵌入慢且贵

**现象**：用户反馈"问 AI '闭包是什么'，要等 5 秒才回复"。RAG 检索时每次冷启动要调 500 次 Workers AI 嵌入知识条目，慢且贵。

**根因**：MVP 阶段把嵌入放在运行时——每次冷启动都重新嵌入 500 条知识。Workers AI 虽然免费，但有调用频率限制，且冷启动慢。

**修复**：
1. 构建期预嵌入：`scripts/build-knowledge-index.ts` 一次性预嵌入成 `public/data/knowledge-index.json`
2. 运行时只嵌查询文本（1 次 API 调用）
3. 三级降级加载：内存命中（最快）→ IndexedDB 命中（次快）→ fetch JSON（最慢但首次必走）
4. 启发式判定跳过检索："删除这张卡" / "创建提醒" 这种命令型输入不需要 RAG，直接跳过

**教训**：RAG 不是"调嵌入 API + 余弦相似度"那么简单。要考虑：(1) 嵌入时机（构建期 vs 运行时）；(2) 加载策略（内存 / IndexedDB / fetch）；(3) 检索触发条件（不是所有输入都需要 RAG）；(4) 降级方案（向量失败时关键词降级）。

**关联**：Phase 11 / [2026-07-22-knowledge-vector-search-design.md](file:///workspace/docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md)

---

## 踩坑规律总结

回顾 15 个坑，能提炼出 4 条规律：

### 规律 1：MVP 阶段图快会埋雷

坑 4 / 7 / 8 / 11 / 12 / 13 / 14 / 15 都是 MVP 阶段图快埋的——原生元素、明文 apiKey、运行时嵌入、emoji 图标、div onClick。短期省事，长期付大代价。

**对策**：MVP 不是"跳过非核心功能"，是"跳过非核心机制"。安全 / 可访问性 / 性能是核心机制，不能跳。

### 规律 2：守护测试是唯一可靠的护栏

坑 3 / 6 / 11 / 12 都是"规范文档失效"——AGENTS.md 写了规范，但没人执行。守护测试（`no-native-form-elements.test.ts` / `ui-design-system-guard.test.ts` / `content-generation-standard.test.ts`）把规范变成 CI red，才真正落地。

**对策**：每加一条规范，同时加一个守护测试。**规则没有测试守护等于建议。**

### 规律 3：流式协议的 bug 最难发现

坑 5 是 AI 工具空转 bug，Phase 3 就有，Phase 10 才发现。表面上"AI 回复正常"，实际上工具空转。

**对策**：流式协议必须有端到端冒烟测试——不只是"AI 回复了"，而是"工具真的执行了"。

### 规律 4：UI 反模式在窄屏 + 数据密集下必然崩

坑 1 是 absolute 浮层反模式，开发时桌面宽屏 + 小数据集看不出来，窄 Modal + 数据密集下必然崩。

**对策**：UI 测试要覆盖"窄屏 + 数据稀疏"和"窄屏 + 数据密集"两种场景。详见 [AGENTS.md 2.11](file:///workspace/AGENTS.md) 判断标准。
