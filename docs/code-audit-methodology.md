# 代码审计方法论（Code Audit Methodology）

> **地位**：本项目所有「多轮深度审计」的强制流程规范。
> **适用场景**：定期审计、重大版本发布前审计、新功能合入后审计、安全合规审计。
> **优先级**：与 [AGENTS.md](file:///workspace/AGENTS.md) 第 3 节「测试与质量门禁」并列，构成「预防（编码规范）→ 检测（守护测试）→ 审计（本文件）」三层质量护栏。
> **强制性**：任何按本方法执行的审计，必须完整跑完 6 个 Round，不得跳轮。

---

## 0. 为什么需要这套方法

单次代码审查（code review）聚焦「这次改动对不对」，而**多轮深度审计**聚焦「整个项目现在健不健康」。两者互补：

| 维度 | Code Review | 深度审计 |
|---|---|---|
| 范围 | 单个 PR / commit | 全项目 |
| 时机 | 合入前 | 里程碑 / 定期 |
| 视角 | 「这次改动」 | 「6 个维度系统扫描」 |
| 产出 | approve / request changes | 问题清单 + 修复 + 健康度评分 |

**核心原则**：按优先级逐轮扫描，每轮「扫描→清单→确认→修复→验证→下一轮」，避免一次性铺开所有维度导致遗漏 Critical 问题。

---

## 1. 审计维度（按优先级逐轮执行）

### Round 1: 功能正确性（Critical）

**目标**：消灭会导致运行时崩溃 / 数据损坏的问题。

检查点：
- 运行时错误：空指针解引用（`undefined.foo`）、数组越界、`JSON.parse` 未 try-catch
- 异步异常未捕获：`Promise` 链无 `.catch`、`async` 函数未 `await`、`useEffect` 内异步未处理 rejection
- 逻辑漏洞：边界条件缺失（空数组 / 空字符串 / 0 / 负数）、off-by-one、短路求值误用
- 类型错误：`as any` 绕过类型、联合类型未窄化、`strict: true` 下的类型逃逸
- 输入校验：API 请求体未校验类型 / 范围、客户端入参直接传入底层

**典型反模式**：
```ts
// ❌ req.json() 未容错（非法 JSON → 500）
const body = await req.json();

// ❌ 联合类型未窄化（preferredPersona 可能为非法值 → undefined.snippet）
const persona = PERSONAS[preferredPersona];
persona.snippet; // 500

// ❌ 数值校验只查范围不查类型（NaN 绕过）
if (dailyMinutes < 15 || dailyMinutes > 120) { ... }
```

### Round 2: 性能与体验（High）

**目标**：消除可感知的卡顿、内存泄漏、资源浪费。

检查点：
- 不必要的重渲染：缺 `useMemo` / `useCallback`、`Context` value 每次新建、列表缺稳定 `key`
- 内存泄漏：`setInterval` / `setTimeout` / 事件监听 / WebSocket 未在 `useEffect` 清理函数中释放
- 大数据量：未分页 / 未虚拟滚动、`Array.find` 嵌套循环（O(n²)）、`JSON.parse` 大对象在热路径
- 资源加载：图片未懒加载 / 未设 `width`+`height`（CLS）、首屏未代码分割、未 Tree Shaking 死代码
- 防抖节流：搜索输入 / 窗口 resize / 滚动监听未 debounce/throttle

**验证手段**：React DevTools Profiler + Lighthouse + `npm run test:perf`。

### Round 3: 安全规范（High）

**目标**：堵住可被外部利用的漏洞。

检查点：
- **IDOR 越权**：PUT/DELETE 路由是否校验「当前 session 是否拥有该资源的所有权」
- **XSS**：用户输入 / AI 输出是否未经转义直接 `dangerouslySetInnerHTML` 或注入 `href`（`javascript:` 协议）
- **CSRF**：状态变更接口是否校验 `Origin` / `SameSite` cookie
- **敏感信息暴露**：API Key / 密钥是否硬编码、是否出现在客户端 bundle、日志是否打印密文
- **输入校验**：URL 参数 / 请求体是否校验类型与范围、文件上传是否校验 MIME
- **不安全 DOM**：`eval` / `new Function` / `document.write` / `innerHTML` 赋值

**本项目特定**：
- `username` 与 `userId` 必须绑定（`getUsernameOwner` / `claimUsername`），PUT 公开数据前校验 owner
- Markdown 链接 / 作品集 URL 必须过协议白名单（http/https/mailto/相对路径）
- `MASTER_KEY` 是加密会话根密钥，不得出现在客户端代码

### Round 4: 代码质量与规范（Medium）

**目标**：降低阅读成本，消灭技术债。

检查点：
- 重复代码：>10 行完全重复逻辑、copy-paste 的错误处理
- 过长函数：单函数 >80 行、圈复杂度 >10
- 命名：变量名不达意（`data` / `tmp` / `x`）、布尔变量非谓语（`flag` 而非 `isLoading`）
- 注释：文件头缺用途说明、注释仅复述代码、复杂逻辑无行内注释
- 魔法数字 / 硬编码：未提取常量、URL / 阈值散落代码中
- TODO / FIXME：未关联 issue 的遗留标记、超过 30 天未处理的 TODO

### Round 5: 可维护性与架构（Medium）

**目标**：确保项目可长期演进。

检查点：
- **耦合度**：页面组件是否绕过领域 store 直连底层存储、跨层依赖（UI → DB 而非 UI → Store → DB）
- **循环依赖**：模块 A → B → A（用 `madge` 或人工追踪 import 链）
- **状态管理**：prop drilling >3 层、Context 滥用（一个 Context 塞所有状态）、同一数据多处 fetch 无缓存
- **测试覆盖缺口**：核心业务逻辑（store / 纯函数）是否有单测、API 路由是否有 KV 层镜像测试
- **测试守护**：新增的安全 / 设计规则是否有对应守护测试（「规则没有测试守护等于不存在」）

### Round 6: 工程化与兼容性（Low）

**目标**：构建 / 依赖 / 兼容性收尾。

检查点：
- **构建配置**：`next.config.js` 是否有冗余、`tsconfig.json` 是否 `strict: true`、PostCSS / Tailwind 配置是否最新
- **依赖版本**：`dependencies` 是否混入了 `@types/*` 等纯开发依赖、是否有已知漏洞（`npm audit`）、版本冲突
- **浏览器兼容**：是否用了未 transpile 的 ES 特性、CSS 是否有未加前缀的实验性属性
- **移动端适配**：`viewport` 是否允许缩放（a11y）、触控目标是否 ≥44px、窄屏布局是否溢出
- **无障碍（a11y）**：icon-only 按钮是否有 `aria-label`、模态是否有 focus trap、折叠按钮是否有 `aria-expanded`、进度条是否有 `role="progressbar"`

---

## 2. 工作流程（Loop）

每轮严格按以下步骤执行，不得跳步：

```
┌─────────────────────────────────────────────────────┐
│  1. 扫描当前轮次维度                                  │
│     └─ 基于当前 Round 的检查点，全面扫描项目代码       │
├─────────────────────────────────────────────────────┤
│  2. 列出问题清单                                      │
│     └─ 表格：ID / 文件路径 / 问题描述 / 严重程度 / 建议 │
├─────────────────────────────────────────────────────┤
│  3. 等待确认                                          │
│     └─ 询问「是否继续修复以上问题？」                   │
├─────────────────────────────────────────────────────┤
│  4. 执行修复                                          │
│     └─ diff 格式输出完整修复后代码，说明修改原因        │
├─────────────────────────────────────────────────────┤
│  5. 验证修复                                          │
│     └─ 自问：是否引入新问题？是否满足当前 Round 检查点？│
│        └─ 有新问题 → 回到步骤 2（最多自迭代 3 次）     │
├─────────────────────────────────────────────────────┤
│  6. 轮次切换                                          │
│     └─ 当前 Round 无问题 → 自动进入下一 Round          │
└─────────────────────────────────────────────────────┘
```

### 终止条件（满足任一）

1. **正常终止**：6 个 Round 均通过，且最后一轮验证无新问题。
2. **提前终止**：连续两轮零问题。
3. **上限终止**：达到最大 6 轮上限。

终止后必须输出：
- 总修复问题数统计
- 项目健康度评分（百分制）
- 后续维护建议

---

## 3. 输出格式要求

### 3.1 每轮开始

```
🔄 正在执行 Round X: [维度名]
```

### 3.2 问题清单（Markdown 表格）

| 问题 ID | 文件路径 | 问题描述（含代码位置） | 严重程度 | 修复建议概述 |
|---|---|---|---|---|
| R1-001 | app/api/chat/route.ts:L167 | preferredPersona 未校验白名单，非法值致 undefined.snippet 500 | Critical | 用 Object.hasOwn 校验后再索引 |

### 3.3 代码修复（diff 格式）

```diff
- const persona = PERSONAS[preferredPersona];
- personaSnippet = persona.snippet;
+ if (preferredPersona && Object.hasOwn(PERSONAS, preferredPersona)) {
+   const persona = PERSONAS[preferredPersona];
+   personaSnippet = persona.snippet;
+ }
```

### 3.4 关键修改设计决策

> 💡 **设计决策**：为什么用 `Object.hasOwn` 而非 `in` 或 `!== undefined`？
> - `in` 会遍历原型链，可能命中 `toString` 等继承属性
> - `!== undefined` 无法区分「值为 undefined」和「键不存在」
> - `Object.hasOwn` 只查自身可枚举属性，语义最精确

### 3.5 每轮结束

```
✅ Round X 完成，发现 N 个问题，已修复 N 个
```

---

## 4. 约束与边界

1. **不跨轮修改**：不要修改与当前 Round 无关的代码（除非存在 Block 级依赖）。
2. **大重构先确认**：如果某个修复涉及大范围重构（>5 文件），先给出方案让用户确认，再执行。
3. **保持原有风格**：除非风格本身是需要修复的问题，否则不改动无关代码风格。
4. **长代码片段**：可只展示关键修改部分，但需标明行号范围。
5. **幻觉防御**：子代理报告的问题必须逐条用 `Grep` / `Read` 验证后再采纳，不得直接采信模糊行号声明。

---

## 5. 提交规范

审计修复按 Round 语义拆分 commit，每个 commit 对应一个 Round 的修复：

```
fix(api): R1 功能正确性 — req.json 容错、persona 注入防护
fix(security): R3 安全规范 — IDOR 越权防护 + 存储型 XSS 拦截
refactor: R4 代码质量 — 清理废弃函数与死变量
test(kv): R5 可维护性 — username 所有权绑定测试守护
chore(deps): R6 工程化 — @types/qrcode 移至 devDependencies
```

**禁止**在一个 commit 里混合多个 Round 的改动（便于 review 和 revert）。

---

## 6. 健康度评分标准

| 分数区间 | 含义 | 标准 |
|---|---|---|
| 90-100 | 优秀 | 无 Critical/High 问题，仅剩 Low 或架构性建议 |
| 75-89 | 良好 | 无 Critical，有少量 High 已修复，残留 Medium |
| 60-74 | 及格 | 有 Critical 已修复，High 有残留 |
| <60 | 不及格 | 有未修复的 Critical / High |

**扣分项**（每项 -2 ~ -5）：
- Critical 问题未修复：-10
- High 问题未修复：-5
- 测试覆盖率缺口（核心逻辑无单测）：-2 ~ -4
- 架构耦合（跨层依赖）：-2 ~ -3
- 重复代码：-1 ~ -2

---

## 7. 与 AGENTS.md 的关系

| 文档 | 职责 | 时机 |
|---|---|---|
| [AGENTS.md](file:///workspace/AGENTS.md) | 编码强制规则（预防） | 写代码前 |
| [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) | UI 设计规范（预防） | 写 UI 前 |
| `__tests__/*-guard.test.ts` | 守护测试（检测） | 每次 commit |
| **本文档** | 多轮深度审计（审计） | 里程碑 / 定期 |

三层护栏缺一不可：**没有预防 → 缺陷流入代码；没有检测 → 缺陷流入 main；没有审计 → 累积技术债。**

---

## 8. 后续维护建议（上次审计产出，2026-07-25）

1. **username 所有权无释放路径**：用户改 username 后旧绑定永久占坑，建议在「我的」页加解绑/改名流程。
2. **限流非原子**：`incrementRateLimitCount` 读-改-写在突发并发下可能少计，流量增长后考虑 Durable Object 计数器。
3. **路由集成测试**：可引入 Miniflare 跑 Pages Functions 真实运行时，把 IDOR 守卫从「KV 层镜像测试」升级为路由层端到端测试。

> 下次审计时复核以上 3 项是否已解决，解决则从本节移除。
