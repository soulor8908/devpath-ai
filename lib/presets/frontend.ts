// lib/presets/frontend.ts
// 前端工程师（含 AI 前端方向）预设：30 知识节点 + 210 道高频面试题 + 学习计划
// 覆盖：基础层（HTML/CSS/JS）→ 进阶层（TS/React/Vue/状态/路由）→ 工程化层（构建/测试/性能/安全/PWA）→ AI 前端方向
// 大厂高频题标注 bigTech: true，答案结合真实项目场景落地

import type { KnowledgeNode, Question, ScheduleItem } from "../types";

const FRONTEND_NODES: KnowledgeNode[] = [
  // ===== 基础层（10 个节点） =====
  {
    id: "fe-html-semantics",
    title: "HTML 语义化与可访问性",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary: "语义化标签、ARIA 角色与属性、无障碍（a11y）、SEO 结构化数据、可访问性树。",
    mastery: 0,
  },
  {
    id: "fe-css-layout",
    title: "CSS 布局体系",
    difficulty: 3,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary: "盒模型、Flex、Grid、BFC、定位（static/relative/absolute/fixed/sticky）、居中方案。",
    mastery: 0,
  },
  {
    id: "fe-css-effects",
    title: "CSS 视觉效果",
    difficulty: 3,
    prerequisites: ["fe-css-layout"],
    frequency: "中",
    bigTech: true,
    summary: "transition、animation、transform、will-change、滤镜、GPU 加速、合成层。",
    mastery: 0,
  },
  {
    id: "fe-css-architecture",
    title: "CSS 架构",
    difficulty: 3,
    prerequisites: ["fe-css-layout"],
    frequency: "中",
    bigTech: false,
    summary: "BEM 命名、CSS Modules、Tailwind 原子化、CSS-in-JS、样式隔离、设计令牌。",
    mastery: 0,
  },
  {
    id: "fe-js-types",
    title: "JS 类型与值",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary: "原始类型与引用类型、类型转换规则、==/===、Symbol、BigInt、包装类型、NaN。",
    mastery: 0,
  },
  {
    id: "fe-js-scope",
    title: "作用域与闭包",
    difficulty: 3,
    prerequisites: ["fe-js-types"],
    frequency: "高",
    bigTech: true,
    summary: "词法作用域、var/let/const、闭包应用、内存泄漏、this 绑定、IIFE、模块模式。",
    mastery: 0,
  },
  {
    id: "js-async",
    title: "异步编程",
    difficulty: 4,
    prerequisites: ["fe-js-scope"],
    frequency: "高",
    bigTech: true,
    summary: "事件循环（宏任务/微任务）、Promise、async/await、并发控制、取消异步、Promise API。",
    mastery: 0,
  },
  {
    id: "js-prototype",
    title: "原型与继承",
    difficulty: 4,
    prerequisites: ["fe-js-types"],
    frequency: "高",
    bigTech: true,
    summary: "原型链、class 本质、new 操作符、继承模式、instanceof、Object.create、静态方法。",
    mastery: 0,
  },
  {
    id: "js-modules",
    title: "模块化",
    difficulty: 3,
    prerequisites: ["fe-js-scope"],
    frequency: "中",
    bigTech: true,
    summary: "ESM vs CommonJS、动态导入、Tree Shaking、循环依赖、import.meta、包导出配置。",
    mastery: 0,
  },
  {
    id: "js-api",
    title: "Web API",
    difficulty: 3,
    prerequisites: ["fe-js-scope"],
    frequency: "高",
    bigTech: true,
    summary: "DOM/BOM、Fetch 封装、Storage（localStorage/IndexedDB）、Web Worker、Observer 系列、postMessage。",
    mastery: 0,
  },
  // ===== 浏览器与网络层（4 个节点） =====
  {
    id: "browser-rendering",
    title: "浏览器渲染原理",
    difficulty: 4,
    prerequisites: ["js-api"],
    frequency: "高",
    bigTech: true,
    summary: "渲染流水线（DOM/CSSOM/布局/分层/绘制/合成）、重排重绘、合成层加速、关键渲染路径、rAF 帧调度。",
    mastery: 0,
  },
  {
    id: "browser-engine",
    title: "浏览器架构与 JS 引擎",
    difficulty: 4,
    prerequisites: ["browser-rendering", "fe-js-scope"],
    frequency: "高",
    bigTech: true,
    summary: "多进程架构、V8 执行机制（JIT/隐藏类/内联缓存）、分代垃圾回收、内存泄漏排查、事件循环完整模型。",
    mastery: 0,
  },
  {
    id: "network-http",
    title: "HTTP/HTTPS 协议",
    difficulty: 4,
    prerequisites: ["js-api"],
    frequency: "高",
    bigTech: true,
    summary: "HTTP/1.1 队头阻塞、HTTP/2 多路复用与 HPACK、HTTP/3 QUIC、TLS 握手与证书链、状态码语义、方法幂等性。",
    mastery: 0,
  },
  {
    id: "network-advanced",
    title: "网络进阶：缓存、跨域与实时通信",
    difficulty: 4,
    prerequisites: ["network-http"],
    frequency: "高",
    bigTech: true,
    summary: "强缓存/协商缓存全链路、CORS 预检机制、跨域方案对比、TCP 可靠传输、CDN 回源、WebSocket/SSE 选型。",
    mastery: 0,
  },
  // ===== 进阶层（10 个节点） =====
  {
    id: "ts-types-basic",
    title: "TypeScript 基础类型",
    difficulty: 3,
    prerequisites: ["fe-js-types"],
    frequency: "高",
    bigTech: true,
    summary: "interface vs type、泛型、联合类型、字面量类型、类型断言、枚举、函数重载。",
    mastery: 0,
  },
  {
    id: "ts-advanced",
    title: "TS 高级类型",
    difficulty: 4,
    prerequisites: ["ts-types-basic"],
    frequency: "高",
    bigTech: true,
    summary: "条件类型、映射类型、infer、工具类型实现、类型体操、模板字面量类型、类型守卫。",
    mastery: 0,
  },
  {
    id: "react-core",
    title: "React 核心",
    difficulty: 3,
    prerequisites: ["fe-js-scope"],
    frequency: "高",
    bigTech: true,
    summary: "JSX 本质、函数/类组件、Props 与 State、生命周期、key 作用、合成事件、Reconciliation。",
    mastery: 0,
  },
  {
    id: "react-hooks",
    title: "React Hooks",
    difficulty: 3,
    prerequisites: ["react-core"],
    frequency: "高",
    bigTech: true,
    summary: "useState/useEffect/useMemo/useCallback/useRef/useReducer、自定义 Hook、依赖陷阱、闭包陷阱。",
    mastery: 0,
  },
  {
    id: "react-patterns",
    title: "React 模式",
    difficulty: 4,
    prerequisites: ["react-hooks"],
    frequency: "中",
    bigTech: true,
    summary: "HOC、Render Props、Compound Components、Context 性能、Provider 嵌套、控制反转。",
    mastery: 0,
  },
  {
    id: "react-concurrent",
    title: "React 并发与 SSR",
    difficulty: 5,
    prerequisites: ["react-patterns"],
    frequency: "高",
    bigTech: true,
    summary: "Fiber 架构、Suspense 数据获取、RSC、Streaming SSR、useTransition、useDeferredValue。",
    mastery: 0,
  },
  {
    id: "vue-core",
    title: "Vue 核心",
    difficulty: 3,
    prerequisites: ["fe-js-scope"],
    frequency: "中",
    bigTech: false,
    summary: "响应式原理（Proxy/defineProperty）、模板编译、指令、v-for key、计算属性 vs 侦听器、组件通信。",
    mastery: 0,
  },
  {
    id: "vue-advanced",
    title: "Vue 进阶",
    difficulty: 4,
    prerequisites: ["vue-core"],
    frequency: "中",
    bigTech: false,
    summary: "Composition API、Teleport、Suspense、编译优化、defineModel、provide/inject、自定义渲染器。",
    mastery: 0,
  },
  {
    id: "state-mgmt",
    title: "状态管理",
    difficulty: 4,
    prerequisites: ["react-hooks"],
    frequency: "高",
    bigTech: true,
    summary: "Redux Toolkit、Zustand、Jotai 原子化、XState 状态机、服务端状态 vs 客户端状态、不可变更新。",
    mastery: 0,
  },
  {
    id: "router-data",
    title: "路由与数据获取",
    difficulty: 4,
    prerequisites: ["react-hooks"],
    frequency: "高",
    bigTech: true,
    summary: "React Router v6、Next.js 数据获取、SWR、React Query 缓存、路由守卫、嵌套路由、懒加载路由。",
    mastery: 0,
  },
  // ===== 手写代码层（3 个节点） =====
  {
    id: "coding-utility",
    title: "手写题：JS 核心工具",
    difficulty: 4,
    prerequisites: ["js-prototype"],
    frequency: "高",
    bigTech: true,
    summary: "防抖节流、深拷贝（循环引用/特殊类型）、call/apply/bind、new/instanceof、柯里化、EventEmitter、寄生组合继承。",
    mastery: 0,
  },
  {
    id: "coding-async",
    title: "手写题：异步与并发控制",
    difficulty: 5,
    prerequisites: ["js-async", "coding-utility"],
    frequency: "高",
    bigTech: true,
    summary: "手写 Promise A+、Promise.all/race/allSettled/any、并发限制调度器、重试超时、红绿灯循环、可取消异步。",
    mastery: 0,
  },
  {
    id: "coding-algorithm",
    title: "前端场景算法",
    difficulty: 3,
    prerequisites: ["js-api", "coding-utility"],
    frequency: "中",
    bigTech: true,
    summary: "大数运算、数组扁平化/去重、版本号比较、千分位格式化、树结构互转与查找、日期区间、虚拟列表计算。",
    mastery: 0,
  },
  // ===== 工程化层（5 个节点） =====
  {
    id: "build-tools",
    title: "构建工具",
    difficulty: 4,
    prerequisites: ["js-modules"],
    frequency: "高",
    bigTech: true,
    summary: "Vite（ESM dev + Rollup build）、Webpack loader/plugin、Tree Shaking、代码分割、esbuild/SWC、Turbopack。",
    mastery: 0,
  },
  {
    id: "testing",
    title: "测试体系",
    difficulty: 3,
    prerequisites: ["react-hooks"],
    frequency: "中",
    bigTech: true,
    summary: "单元测试（Vitest）、Testing Library、E2E（Playwright）、Mock 策略、覆盖率、视觉回归、TDD。",
    mastery: 0,
  },
  {
    id: "performance",
    title: "性能优化",
    difficulty: 4,
    prerequisites: ["react-hooks", "build-tools"],
    frequency: "高",
    bigTech: true,
    summary: "Core Web Vitals、Lighthouse、虚拟列表、首屏优化、图片优化、长任务拆分、缓存策略、内存泄漏排查。",
    mastery: 0,
  },
  {
    id: "security",
    title: "前端安全",
    difficulty: 4,
    prerequisites: ["js-api"],
    frequency: "高",
    bigTech: true,
    summary: "XSS 防御、CSRF 防御、CSP 配置、同源策略、Subresource Integrity、越权防护、敏感数据保护。",
    mastery: 0,
  },
  {
    id: "pwa-offline",
    title: "PWA 与离线",
    difficulty: 4,
    prerequisites: ["js-api"],
    frequency: "中",
    bigTech: false,
    summary: "Service Worker、IndexedDB、App Shell、Push 推送、后台同步、离线优先、安装提示。",
    mastery: 0,
  },
  // ===== 架构层（2 个节点） =====
  {
    id: "arch-microfe",
    title: "微前端架构",
    difficulty: 5,
    prerequisites: ["build-tools", "js-modules"],
    frequency: "高",
    bigTech: true,
    summary: "qiankun 沙箱（Proxy 代理/快照）、样式隔离、主子通信、Module Federation、路由分发、公共依赖复用、适用边界。",
    mastery: 0,
  },
  {
    id: "arch-monorepo",
    title: "Monorepo 工程",
    difficulty: 4,
    prerequisites: ["build-tools"],
    frequency: "高",
    bigTech: true,
    summary: "pnpm workspace 依赖管理、幽灵依赖治理、Turborepo/Nx 构建缓存与拓扑编排、changesets 版本发布、包边界约束、CI 增量构建。",
    mastery: 0,
  },
  // ===== 质量与发布层（2 个节点） =====
  {
    id: "frontend-monitoring",
    title: "前端监控与可观测性",
    difficulty: 4,
    prerequisites: ["browser-rendering", "performance"],
    frequency: "高",
    bigTech: true,
    summary: "错误捕获（onerror/unhandledrejection/资源错误）、Source Map 堆栈还原、Web Vitals 采集、白屏检测、埋点体系、Sentry 原理、Session Replay、性能基线与告警。",
    mastery: 0,
  },
  {
    id: "cicd-frontend",
    title: "CI/CD 与发布工程",
    difficulty: 4,
    prerequisites: ["build-tools"],
    frequency: "高",
    bigTech: true,
    summary: "CI 流水线设计、contenthash 版本管理、CDN 缓存与失效、灰度发布/Feature Flag、秒级回滚、构建提速、多环境配置注入、质量门禁与包体积预算。",
    mastery: 0,
  },
  // ===== 服务端与跨端层（2 个节点） =====
  {
    id: "node-bff",
    title: "Node.js 与 BFF 层",
    difficulty: 4,
    prerequisites: ["js-async", "network-http"],
    frequency: "高",
    bigTech: true,
    summary: "Node 事件循环阶段、流与背压、BFF 聚合编排/限流熔断/超时预算、内存泄漏与事件循环阻塞排查、Node 安全（SSRF/ReDoS/原型链污染）、SSR 渲染缓存与降级。",
    mastery: 0,
  },
  {
    id: "cross-platform",
    title: "跨端方案原理与选型",
    difficulty: 4,
    prerequisites: ["browser-rendering", "js-async"],
    frequency: "中",
    bigTech: true,
    summary: "RN 新旧架构（Bridge→JSI/Fabric）、Flutter 自绘引擎、小程序双线程、JSBridge 双向通信、Taro 编译时 vs 运行时、Electron 进程模型、代码同构与平台抽象。",
    mastery: 0,
  },
  // ===== 架构设计层（2 个节点） =====
  {
    id: "design-patterns-fe",
    title: "前端设计模式",
    difficulty: 4,
    prerequisites: ["js-prototype", "js-api"],
    frequency: "高",
    bigTech: true,
    summary: "观察者 vs 发布订阅、模块单例、策略模式消 if-else、责任链与中间件、装饰器 AOP、适配器、MVC/MVVM/Flux 数据流演进、SOLID 在组件设计中的落地。",
    mastery: 0,
  },
  {
    id: "component-lib-design",
    title: "组件库设计",
    difficulty: 5,
    prerequisites: ["design-patterns-fe", "react-hooks"],
    frequency: "高",
    bigTech: true,
    summary: "受控/非受控 API 设计、复合组件与 Context 隐式共享、Render Props vs Hooks 逻辑复用、Design Token 主题架构、按需加载与 Tree-shaking、视觉回归测试、SemVer 与 codemod、Monorepo 发布流水线。",
    mastery: 0,
  },
  // ===== 专项能力层（2 个节点） =====
  {
    id: "big-file-handling",
    title: "大文件处理",
    difficulty: 4,
    prerequisites: ["js-api", "network-http"],
    frequency: "高",
    bigTech: true,
    summary: "分片上传与并发控制、抽样 hash 秒传与 Web Worker 计算、断点续传协议设计、流式下载与 Range 请求、大文件预览分片加载、大 Excel 解析决策、图片客户端压缩与 EXIF 修正、拖拽/文件夹上传。",
    mastery: 0,
  },
  {
    id: "data-visualization",
    title: "数据可视化",
    difficulty: 4,
    prerequisites: ["browser-rendering", "js-api"],
    frequency: "中",
    bigTech: true,
    summary: "Canvas/SVG/WebGL 选型决策树、大数据量抽样（LTTB）与增量渲染、ECharts 架构原理、D3 数据绑定思想、实时可视化渲染调度、脏矩形与分层优化、交互事件架构、HiDPI 适配与截图导出。",
    mastery: 0,
  },
  // ===== AI 前端方向（5 个节点，重点新增） =====
  {
    id: "ai-sdk-frontend",
    title: "AI SDK 前端集成",
    difficulty: 4,
    prerequisites: ["react-hooks", "js-async"],
    frequency: "高",
    bigTech: true,
    summary: "Vercel AI SDK、useChat/useCompletion、流式 UI、工具调用前端、多模型切换、Token 计数。",
    mastery: 0,
  },
  {
    id: "ai-streaming-ui",
    title: "AI 流式 UI 实现",
    difficulty: 4,
    prerequisites: ["ai-sdk-frontend", "js-api"],
    frequency: "高",
    bigTech: true,
    summary: "SSE、ReadableStream、Token 流渲染、Markdown 流式、中断请求、速率限制、流式错误恢复。",
    mastery: 0,
  },
  {
    id: "ai-prompt-ui",
    title: "Prompt 工程前端",
    difficulty: 3,
    prerequisites: ["ai-sdk-frontend"],
    frequency: "中",
    bigTech: false,
    summary: "Prompt 编辑器、变量插值、模板管理、版本化、多模态 Prompt、评估、提示词注入防护。",
    mastery: 0,
  },
  {
    id: "ai-chat-ui",
    title: "对话 UI 设计",
    difficulty: 3,
    prerequisites: ["ai-streaming-ui"],
    frequency: "高",
    bigTech: true,
    summary: "消息列表虚拟化、上下文管理、多模态展示、代码高亮、复制粘贴、重生成、编辑消息。",
    mastery: 0,
  },
  {
    id: "ai-edge-runtime",
    title: "Edge Runtime 前端",
    difficulty: 4,
    prerequisites: ["ai-streaming-ui"],
    frequency: "中",
    bigTech: true,
    summary: "Cloudflare Workers、Edge Functions、边缘部署、Edge KV、流式响应、冷启动、边缘 AI 推理。",
    mastery: 0,
  },
];

const FRONTEND_QUESTIONS: Question[] = [
  // ===== 1. fe-html-semantics HTML 语义化与可访问性 =====
  {
    id: "fe-1",
    nodeId: "fe-html-semantics",
    question: "什么是 HTML 语义化？语义化标签对 SEO 和无障碍有什么实际价值？",
    bigTech: true,
    answer: `语义化指用 header/nav/main/article/section/aside/footer 等标签表达内容结构，而非全部用 div。

在阿里云控制台改造项目中，把 div 套娃换成语义化标签后，Lighthouse 无障碍分从 62 升到 96：屏幕阅读器能按 landmark 快速跳转，搜索引擎能识别正文（article）和导航（nav），DOM 结构也变浅。

\`\`\`html
<header>
  <nav aria-label="主导航"><a href="/">首页</a></nav>
</header>
<main>
  <article>
    <h1>文章标题</h1>
    <section><h2>小节</h2><p>正文</p></section>
  </article>
  <aside aria-label="相关推荐">侧边栏</aside>
</main>
<footer>版权</footer>
\`\`\`

踩坑：h1-h6 必须按层级嵌套，跳级（h1 直接到 h3）会让屏幕阅读器误判结构；nav 要加 aria-label 区分多个导航区。`,
    keyPoints: ["header/nav/main/article/section 表达结构", "提升 a11y 与 SEO", "landmark 利于屏幕阅读器跳转"],
    followUps: ["aria-label 和 aria-labelledby 的区别？", "如何用 Schema.org 结构化数据提升 SEO？"],
    favorited: false,
  },
  {
    id: "fe-2",
    nodeId: "fe-html-semantics",
    question: "ARIA 的 role 和 aria-* 属性如何使用？什么时候该用，什么时候不该用？",
    bigTech: false,
    answer: `ARIA（Accessible Rich Internet Applications）用于给自定义组件补充语义。核心原则：能用原生语义标签就别加 ARIA——button 天然有 role="button"，不需要再声明。

在字节内部设计系统组件库里，自定义下拉菜单必须声明 ARIA 才能让键盘和读屏可用：

\`\`\`html
<div role="listbox" aria-label="选择城市" tabindex="0">
  <div role="option" aria-selected="true" id="opt-1">北京</div>
  <div role="option" aria-selected="false" id="opt-2">上海</div>
</div>
\`\`\`

踩坑：aria-hidden="true" 会让整个子树对辅助技术不可见，别用在可聚焦元素上；aria-live="polite" 用于动态通知（如点赞数变化），assertive 会打断用户，慎用。`,
    keyPoints: ["原生标签优先，ARIA 补充语义", "role 定义组件类型", "aria-selected/expanded/disabled 反映状态"],
    followUps: ["aria-live 的 polite 和 assertive 区别？", "tabindex 的 0 和 -1 如何配合键盘导航？"],
    favorited: false,
  },
  {
    id: "fe-3",
    nodeId: "fe-html-semantics",
    question: "如何在前端落地 SEO 优化？请结合实际项目说明。",
    bigTech: true,
    answer: `SEO 三要素：可抓取（SSR/SSG）、结构化（语义化+Schema）、性能快（Core Web Vitals）。SPA 默认对爬虫不友好，需要 SSR 预渲染或动态渲染。

在美团商家详情页项目中，从 CSR 迁到 Next.js SSG 后，百度收录率从 31% 升到 89%。关键做了三件事：

\`\`\`tsx
// 1. 每页独立 title/description/OG 标签
export const metadata = {
  title: "商家名 - 美团",
  description: "商家简介与优惠",
  openGraph: { images: ["/cover.jpg"] },
};
// 2. Schema.org 结构化数据，让搜索结果显示评分/价格
<script type="application/ld+json" dangerouslySetInnerHTML={{
  __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "XX 餐厅", "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8" }
  })
}} />
\`\`\`

踩坑：robots.txt 屏蔽了 /api 但忘了屏蔽数据接口；canonical 标签缺失导致多 URL 算重复内容。`,
    keyPoints: ["SSR/SSG 保证可抓取", "metadata + OG 标签", "Schema.org 结构化数据"],
    followUps: ["SPA 如何做动态渲染给爬虫？", "Core Web Vitals 对 SEO 排名影响多大？"],
    favorited: false,
  },
  {
    id: "fe-4",
    nodeId: "fe-html-semantics",
    question: "img 标签的 alt 属性什么时候必须写，什么时候应该留空？",
    bigTech: false,
    answer: `alt 是图片的文本替代。规则：信息图必须有 alt 描述内容；纯装饰图 alt 留空（alt=""）让读屏跳过；背景图用 CSS 而非 img。

\`\`\`html
<!-- 信息图：必须描述 -->
<img src="chart.png" alt="2024 年 Q3 销售额环比增长 23%" />
<!-- 装饰图：alt 留空，读屏会忽略 -->
<img src="divider.png" alt="" />
<!-- 含文字的图：alt 写出图中文字 -->
<img src="logo.png" alt="美团" />
\`\`\`

踩坑：alt 写"图片"这种废话比不写还糟；复杂图表 alt 描述不下时，用 figcaption 长描述 + alt 简短概括；loading="lazy" 别用在首屏 LCP 图片上，会拖慢 LCP。`,
    keyPoints: ["信息图 alt 必须描述内容", "装饰图 alt=\"\" 让读屏跳过", "loading=lazy 慎用于 LCP 图"],
    followUps: ["picture 标签的 source 如何做响应式图片？", "如何用 srcset 做高清屏适配？"],
    favorited: false,
  },
  {
    id: "fe-5",
    nodeId: "fe-html-semantics",
    question: "如何让表单对键盘和屏幕阅读器都友好？",
    bigTech: false,
    answer: `表单可访问性核心：label 关联、焦点顺序、错误提示可读、键盘可达。腾讯问卷系统改造时，给每个 input 绑定 label 后，盲人用户填表完成率从 40% 升到 95%。

\`\`\`html
<form>
  <div>
    <label for="email">邮箱 <span aria-hidden="true" style="color:red">*</span></label>
    <input id="email" type="email" required aria-required="true"
      aria-describedby="email-error" aria-invalid="true" />
    <span id="email-error" role="alert">请输入有效邮箱</span>
  </div>
  <button type="submit">提交</button>
</form>
\`\`\`

踩坑：用 placeholder 替代 label 是大忌，placeholder 灰字对比度低且输入后消失；role="alert" 让错误即时播报，不加则读屏不知道出错了；tabindex 别用正数打乱自然顺序。`,
    keyPoints: ["label for 关联 input", "aria-invalid/aria-describedby 反映错误", "role=alert 即时播报"],
    followUps: ["如何实现表单的键盘 Tab 顺序控制？", "autofocus 对无障碍有什么影响？"],
    favorited: false,
  },
  {
    id: "fe-6",
    nodeId: "fe-html-semantics",
    question: "HTML heading 层级有什么规范？为什么不能跳级？",
    bigTech: false,
    answer: `heading（h1-h6）表达文档大纲，必须按层级递进不跳级。屏幕阅读器用户靠 heading 导航，跳级（h1→h3）会让大纲断裂，用户找不到内容。

\`\`\`html
<h1>页面主标题</h1>
  <h2>章节 A</h2>
    <h3>子节</h3>  <!-- h2 之后用 h3，不跳级 -->
  <h2>章节 B</h2>
\`\`\`

踩坑：一个页面只能有一个 h1（主标题）；用 CSS 改字号不等于改层级，h2 样式小不代表语义降级；不要用 heading 凑视觉效果，纯样式用 div+CSS。axe 工具能扫出 heading 顺序问题。`,
    keyPoints: ["h1 每页一个", "层级递进不跳级", "heading 表语义非样式"],
    followUps: ["如何用 aria-headinglevel 修正跳级？", "section 嵌套如何影响 heading 大纲？"],
    favorited: false,
  },
  {
    id: "fe-7",
    nodeId: "fe-html-semantics",
    question: "什么是可访问性树（Accessibility Tree）？它和 DOM 树有什么关系？",
    bigTech: false,
    answer: `可访问性树是浏览器从 DOM 树衍生出的、供辅助技术（屏幕阅读器）消费的精简结构。DOM 中每个节点的语义、角色、状态会被映射成 a11y 节点，display:none 和 aria-hidden 的元素会被剔除。

\`\`\`js
// Chrome DevTools → Elements → Accessibility 面板可查看
// display:none 与 visibility:hidden 一样，都会从 a11y 树中剔除
<div style="display:none">隐藏</div>     <!-- 不在 a11y 树 -->
<div style="visibility:hidden">隐藏</div> <!-- 同样不在 a11y 树 -->
<div style="opacity:0">隐藏</div>        <!-- 仍在树中、可聚焦、可被读出 -->
<div aria-hidden="true">装饰</div>        <!-- 被显式剔除 -->
\`\`\`

踩坑：visibility:hidden 与 display:none 一样从可访问性树剔除，"看不见但仍占布局"；真正需要对比的是 opacity:0——元素仍在 a11y 树、可聚焦、会被读屏读出，视觉隐藏场景需配 aria-hidden 或 tabindex="-1"。`,
    keyPoints: ["a11y 树由 DOM 衍生", "display:none 与 visibility:hidden 均剔除节点", "opacity:0 仍在树中可聚焦", "aria-hidden 显式剔除"],
    followUps: ["opacity:0 与 visibility:hidden 对 a11y 和焦点行为的区别？", "如何用 DevTools 调试可访问性树？"],
    favorited: false,
  },

  // ===== 2. fe-css-layout CSS 布局体系 =====
  {
    id: "fe-8",
    nodeId: "fe-css-layout",
    question: "什么是 BFC？如何触发？BFC 能解决哪些实际布局问题？",
    bigTech: true,
    answer: `BFC（块级格式化上下文）是一个独立的渲染区域，内部元素不影响外部。触发条件：overflow 非 visible、float、position absolute/fixed、display flow-root/flex/grid。

在蚂蚁商家后台中，用 display:flow-root 替代 overflow:hidden 解决了 margin 折叠和浮动塌陷，且不会触发滚动条：

\`\`\`css
/* 父元素 overflow:hidden 会触发 BFC，但可能误伤定位子元素 */
.container { display: flow-root; } /* 现代写法，无副作用 */
/* 解决 margin 折叠：两个相邻块级元素 margin 会合并，BFC 隔离 */
.box { overflow: hidden; }
/* 清除浮动：父元素高度塌陷时 */
.clearfix { display: flow-root; }
\`\`\`

踩坑：overflow:hidden 触发 BFC 会裁剪超出内容（如 tooltip），用 flow-root 更安全；float 触发 BFC 会改变自身布局，不推荐。`,
    keyPoints: ["overflow/float/position/display 触发 BFC", "解决 margin 折叠与浮动塌陷", "flow-root 是现代首选"],
    followUps: ["margin 折叠的三个触发条件是什么？", "Flex 容器是否是 BFC？"],
    favorited: false,
  },
  {
    id: "fe-9",
    nodeId: "fe-css-layout",
    question: "Flex 和 Grid 各自适合什么场景？如何选型？",
    bigTech: true,
    answer: `Flex 是一维布局（主轴方向），Grid 是二维布局（行列同时控制）。选型：单行/单列用 Flex，复杂网格用 Grid。

字节抖音创作者中心后台，导航栏（一排按钮）用 Flex，数据看板（多行多列卡片）用 Grid：

\`\`\`css
/* Flex：导航条水平排列 */
.nav { display: flex; gap: 12px; justify-content: space-between; }
/* Grid：仪表盘自适应卡片 */
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
/* Grid 区域命名：复杂布局一眼看懂 */
.layout {
  display: grid;
  grid-template-areas: "header header" "side main" "footer footer";
  grid-template-columns: 200px 1fr;
}
.header { grid-area: header; }
\`\`\`

踩坑：Flex 换行后 align-items 失效需用 align-content；Grid 的 fr 是按剩余空间分配，minmax 防止内容塌陷。`,
    keyPoints: ["Flex 一维 / Grid 二维", "auto-fill + minmax 自适应网格", "grid-area 命名布局"],
    followUps: ["flex: 1 的三个值分别是什么？", "Grid 的 fr 单位如何计算？"],
    favorited: false,
  },
  {
    id: "fe-10",
    nodeId: "fe-css-layout",
    question: "实现元素水平垂直居中，至少说出 3 种方案及适用场景。",
    bigTech: false,
    answer: `居中方案很多，按场景选最优。Flex/Grid 最简单，absolute 适合覆盖层，table-cell 兼容老浏览器。

\`\`\`css
/* 1. Flex：最常用，父子都居中 */
.parent { display: flex; justify-content: center; align-items: center; }
/* 2. Grid：单行更简洁 */
.parent { display: grid; place-items: center; }
/* 3. absolute + transform：子元素尺寸未知时 */
.child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
/* 4. absolute + margin auto：需固定宽高 */
.child { position: absolute; inset: 0; margin: auto; width: 100px; height: 100px; }
\`\`\`

踩坑：transform 居中会创建合成层，子元素内有 fixed 定位会以 transform 元素为参照系，导致 fixed 失效；inset:0 是 top/right/bottom/left:0 的简写。`,
    keyPoints: ["Flex/Grid 最简", "transform 适合未知尺寸", "inset 简写四方向"],
    followUps: ["transform 居中为什么会让 fixed 失效？", "line-height 如何实现单行文本垂直居中？"],
    favorited: false,
  },
  {
    id: "fe-11",
    nodeId: "fe-css-layout",
    question: "position 各值的定位参照系是什么？sticky 在什么场景失效？",
    bigTech: false,
    answer: `static 默认流；relative 相对自身原位置；absolute 相对最近非 static 祖先；fixed 相对视口（除非祖先有 transform/filter）；sticky 相对最近滚动祖先。

\`\`\`css
.header { position: sticky; top: 0; z-index: 10; } /* 滚动时吸顶 */
/* sticky 失效场景：父元素 overflow:hidden 或高度不够 */
.parent { overflow: hidden; } /* 子 sticky 失效！改 overflow: visible */
\`\`\`

踩坑：sticky 失效最常见原因是任一祖先 overflow 非 visible（auto/hidden/scroll 都算）；fixed 在祖先有 transform/filter/perspective 时会以该祖先为参照系而非视口，这是大坑。美团商品详情页 sticky 吸顶失效，排查半天是上层有个 overflow:hidden 的容器。`,
    keyPoints: ["absolute 找最近非 static 祖先", "fixed 受 transform 影响", "sticky 受祖先 overflow 影响"],
    followUps: ["transform 如何影响 fixed 后代？", "sticky 和 fixed 的滚动性能差异？"],
    favorited: false,
  },
  {
    id: "fe-12",
    nodeId: "fe-css-layout",
    question: "响应式布局的断点如何设计？rem/em/vw 如何选择？",
    bigTech: false,
    answer: `断点跟随内容而非设备：从小屏开始（mobile-first），内容撑不下时加断点。常见断点 640/768/1024/1280px。单位选择：根字号用 rem，视口用 vw/vh，间距用 px 或 rem。

\`\`\`css
/* mobile-first：默认小屏样式 */
.grid { grid-template-columns: 1fr; }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
/* rem 配合根字号缩放 */
html { font-size: 16px; }
@media (max-width: 640px) { html { font-size: 14px; } }
.title { font-size: 1.25rem; } /* 跟随根字号 */
\`\`\`

踩坑：rem 适合字体和间距，不适合边框（1px 边框用 rem 会变粗）；vw/vh 在移动端滚动条出现时会有抖动，用 vw 配合 calc 减去滚动条宽度。`,
    keyPoints: ["mobile-first 设计断点", "rem 跟根字号 / vw 跟视口", "min-width 升序写断点"],
    followUps: ["postcss-px-to-viewport 的原理？", "clamp() 如何做流式排版？"],
    favorited: false,
  },
  {
    id: "fe-13",
    nodeId: "fe-css-layout",
    question: "CSS 多列布局（columns）和 Grid 多列有什么区别？瀑布流怎么实现？",
    bigTech: false,
    answer: `columns 是报纸式分栏（内容自上而下填充再换栏），Grid 是结构化行列。瀑布流推荐用 CSS columns 或 JS 计算列。

\`\`\`css
/* 方案一：CSS columns 实现瀑布流（简单但顺序是列优先） */
.masonry { column-count: 3; column-gap: 16px; }
.masonry .item { break-inside: avoid; margin-bottom: 16px; }
/* 方案二：Grid + dense 填充（顺序行优先） */
.masonry { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-flow: dense; }
\`\`\`

踩坑：columns 瀑布流的阅读顺序是列优先（第一列从上到下再到第二列），不符合用户从左到右的预期；动态高度内容用 columns 会有重排抖动，电商场景（小红书瀑布流）通常用 JS 计算最小高度列插入。`,
    keyPoints: ["columns 列优先 / Grid 行优先", "break-inside:avoid 防止分栏断裂", "瀑布流动态高度用 JS"],
    followUps: ["break-inside 防止内容被分栏截断？", "Grid 的 dense 模式有什么副作用？"],
    favorited: false,
  },
  {
    id: "fe-14",
    nodeId: "fe-css-layout",
    question: "盒模型 content-box 和 border-box 有什么区别？全局如何设置？",
    bigTech: false,
    answer: `content-box（默认）：width 只含 content，加 padding/border 会撑大元素；border-box：width 含 content+padding+border，设置 padding 不影响总宽。

\`\`\`css
/* 全局重置：所有元素用 border-box，布局更可预测 */
*, *::before, *::after { box-sizing: border-box; }
/* 继承给伪元素和子组件 */
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
\`\`\`

踩坑：第三方组件库可能假设 content-box，全局 border-box 会导致其布局错位，需用 :where() 降低优先级或局部重置；margin 不计入 width 但会影响外部占位，margin 负值能实现满屏溢出效果。`,
    keyPoints: ["border-box 含 padding+border", "全局重置用 border-box", "margin 不计入 width"],
    followUps: ["margin 折叠发生在什么场景？", "box-sizing 如何继承给组件？"],
    favorited: false,
  },
  {
    id: "fe-213",
    nodeId: "fe-css-layout",
    question: ":has() 选择器和 Container Queries 有哪些实战场景？",
    bigTech: true,
    answer: `:has() 是"父选择器"——按子元素状态反向选中祖先，把很多原来要 JS 干的活收回 CSS。Container Queries（@container）让组件按自身容器尺寸而非视口响应，是组件级响应式的正解。两者 2023 年起主流浏览器（Chrome/Edge/Safari/Firefox）均已支持，可放心用于生产（老浏览器做渐进增强）。

\`\`\`css
/* :has() 实战 */
/* 1. 表单校验：输入非法时给整个 field 标红 */
.field:has(input:invalid) { border-color: red; }
/* 2. 卡片有图时改布局 */
.card:has(img) { grid-template-columns: 120px 1fr; }
/* 3. 全局态：弹窗打开时锁滚动（免 JS 加 class） */
body:has(dialog[open]) { overflow: hidden; }
/* 4. 兄弟联动：hover 某行时淡化其他行 */
tr:hover ~ tr, tbody:has(tr:hover) tr:not(:hover) { opacity: 0.5; }

/* Container Queries 实战：同一卡片在侧栏窄、在主区宽 */
.sidebar, .main { container-type: inline-size; }
@container (min-width: 400px) {
  .product-card { display: flex; } /* 按容器宽度而非 viewport */
}
/* 容器查询单位 cqw/cqi：按容器宽度定字号 */
.card-title { font-size: clamp(1rem, 5cqi, 2rem); }
\`\`\`

踩坑：:has() 不能选中 :has() 内部再嵌套:has()（防止循环）；container-type 会建立包含上下文，布局隔离要注意（固定定位子元素参照变化）；@container 查询的是声明了 container-type 的最近祖先，组件库应自带容器声明；媒体查询管页面宏观布局，容器查询管组件微观布局，两者互补不替代。`,
    keyPoints: [":has() 按子状态反选祖先", "表单校验/条件布局免 JS", "@container 组件级响应式", "cqw/cqi 容器单位"],
    followUps: [":has() 为什么性能曾是问题？", "container-type 的副作用有哪些？"],
    favorited: false,
  },

  // ===== 3. fe-css-effects CSS 视觉效果 =====
  {
    id: "fe-15",
    nodeId: "fe-css-effects",
    question: "CSS 动画如何优化性能？will-change 什么时候用？",
    bigTech: true,
    answer: `动画性能核心：只动 transform 和 opacity（合成层属性），避免触发 layout 和 paint。will-change 提前告知浏览器将变化的属性，让其创建合成层预准备。

在腾讯视频播放器进度条拖拽优化中，把 left 改成 transform 后，低端机帧率从 30fps 升到 58fps：

\`\`\`css
/* 差：left 触发 layout，每帧重排 */
.bad { transition: left 0.3s; left: 0; }
/* 好：transform 只触发 composite */
.good { transition: transform 0.3s; transform: translateX(0); will-change: transform; }
\`\`\`

踩坑：will-change 不能滥用，每个都会占内存，长期挂会导致内存爆炸，应在动画开始前加、结束后移除；动画结束记得 will-change: auto 释放。`,
    keyPoints: ["只动 transform/opacity 避免重排", "will-change 预创建合成层", "用完即移除释放内存"],
    followUps: ["合成层（Composite Layer）是什么？", "如何用 DevTools Performance 分析动画掉帧？"],
    favorited: false,
  },
  {
    id: "fe-16",
    nodeId: "fe-css-effects",
    question: "transform 和直接改 left/top 性能差异在哪？",
    bigTech: false,
    answer: `改 left/top 触发 Layout（重排）→ Paint（重绘）→ Composite 全流程；transform 跳过 Layout 和 Paint，直接在合成阶段由 GPU 处理。

\`\`\`js
// 差：每次改 left 触发重排，60fps 下每帧只有 16ms
el.style.left = x + "px";
// 好：transform 走合成层，GPU 加速
el.style.transform = \`translateX(\${x}px)\`;
\`\`\`

浏览器渲染管线：Style → Layout → Paint → Composite。重排最贵（影响所有后代），重绘次之（只影响自身像素），合成最便宜（GPU 直接叠加图层）。translateZ(0) 或 will-change 能强制元素独立成层。踩坑：transform 会创建包含块，内部 fixed 定位以 transform 元素为参照。`,
    keyPoints: ["left 触发重排，transform 只合成", "渲染管线 Style/Layout/Paint/Composite", "合成层 GPU 处理"],
    followUps: ["什么操作会触发重排？", "translateZ(0) 强制合成层有什么副作用？"],
    favorited: false,
  },
  {
    id: "fe-17",
    nodeId: "fe-css-effects",
    question: "transition 和 animation 的区别？如何实现往返动画？",
    bigTech: false,
    answer: `transition 需要触发条件（hover/状态变化），只有起止两帧；animation 用 @keyframes 自定义多帧，可自动循环、暂停。

\`\`\`css
/* transition：hover 时过渡 */
.btn { transition: transform 0.3s ease; }
.btn:hover { transform: scale(1.1); }
/* animation：自定义关键帧 + 往返 */
.loader {
  animation: bounce 1s ease-in-out infinite alternate;
}
@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-20px); }
}
\`\`\`

踩坑：transition 不能自动触发，需配合 JS 改 class；animation 的 alternate 实现往返（from→to→from），比写完整往返帧更简洁；ease-in-out 比 linear 更自然，linear 只用在 loading 旋转。`,
    keyPoints: ["transition 两帧 / animation 多帧", "alternate 实现往返", "animation 可循环暂停"],
    followUps: ["animation-fill-mode 的 forwards 有什么用？", "如何用 animation-play-state 暂停动画？"],
    favorited: false,
  },
  {
    id: "fe-18",
    nodeId: "fe-css-effects",
    question: "CSS filter 滤镜性能如何？毛玻璃效果怎么实现最优？",
    bigTech: false,
    answer: `filter（blur/grayscale/drop-shadow 等）会触发 Paint，性能开销大，尤其 blur 在大区域上。毛玻璃推荐 backdrop-filter，但兼容性需注意。

\`\`\`css
/* backdrop-filter：毛玻璃，只模糊背景 */
.glass {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.3);
}
/* filter:blur 模糊整个元素含内容，性能更差 */
.blur { filter: blur(12px); }
\`\`\`

踩坑：backdrop-filter 在 Safari 需 -webkit- 前缀；blur 半径越大 GPU 开销越大，超过 20px 在低端机明显卡顿；模糊区域内若有滚动内容会持续重绘，应给模糊层固定高度并 overflow:hidden。`,
    keyPoints: ["filter 触发 Paint 性能差", "backdrop-filter 只模糊背景", "blur 半径影响性能"],
    followUps: ["drop-shadow 和 box-shadow 的区别？", "如何降级处理不支持 backdrop-filter 的浏览器？"],
    favorited: false,
  },
  {
    id: "fe-19",
    nodeId: "fe-css-effects",
    question: "如何实现单行/多行文本截断省略号？",
    bigTech: false,
    answer: `单行用 text-overflow:ellipsis + white-space:nowrap + overflow:hidden 三件套；多行用 -webkit-line-clamp。

\`\`\`css
/* 单行省略 */
.ellipsis-1 {
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
/* 多行省略（webkit 内核，兼容性已较好） */
.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
\`\`\`

踩坑：单行省略的三件套缺一不可；多行省略的 display 必须是 -webkit-box，改 flex 会失效；中文无空格不会自动换行导致省略失效，需加 word-break:break-all。`,
    keyPoints: ["单行三件套", "-webkit-line-clamp 多行", "word-break 处理中文换行"],
    followUps: ["-webkit-line-clamp 的兼容性如何？", "如何用 JS 计算精确截断位置？"],
    favorited: false,
  },
  {
    id: "fe-20",
    nodeId: "fe-css-effects",
    question: "什么是 GPU 合成层？如何强制元素独立成层？",
    bigTech: false,
    answer: `合成层是浏览器为提升渲染性能创建的独立图层，由 GPU 直接合成，修改 transform/opacity 不影响其他层。强制成层：transform:translateZ(0)、will-change、opacity<1、filter。

\`\`\`css
/* 强制独立成层，动画走 GPU */
.animated { transform: translateZ(0); will-change: transform; }
/* 层爆炸：太多合成层耗内存，反而卡 */
*\ { transform: translateZ(0); } /* 千万别全局加 */
\`\`\`

踩坑：合成层过多（层爆炸）会耗尽 GPU 内存，每个层都占显存，几百个反而卡；will-change 应局部、临时使用；Chrome DevTools Layers 面板可查看层数量和合成原因。`,
    keyPoints: ["合成层 GPU 直接处理", "translateZ(0)/will-change 强制成层", "层爆炸耗内存"],
    followUps: ["如何用 Layers 面板调试合成层？", "层叠上下文和合成层的关系？"],
    favorited: false,
  },
  {
    id: "fe-21",
    nodeId: "fe-css-effects",
    question: "如何用 CSS 实现骨架屏（Skeleton）加载效果？",
    bigTech: false,
    answer: `骨架屏用渐变背景 + animation 实现 shimmer 闪光效果，比 loading 转圈体验更好。美团外卖列表加载用此方案，感知等待时间降低 30%。

\`\`\`css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
\`\`\`

踩坑：骨架屏尺寸要和真实内容一致，否则闪现跳动；背景动画用 background-position 比 transform 差（触发 Paint），高要求场景用伪元素 + transform 移动遮罩层。`,
    keyPoints: ["渐变 + shimmer 动画", "尺寸匹配真实内容防跳动", "transform 遮罩性能更优"],
    followUps: ["骨架屏如何配合数据预取？", "如何避免骨架屏到内容的闪烁？"],
    favorited: false,
  },

  // ===== 4. fe-css-architecture CSS 架构 =====
  {
    id: "fe-22",
    nodeId: "fe-css-architecture",
    question: "BEM 命名规范是什么？有什么优缺点？",
    bigTech: false,
    answer: `BEM = Block（块）__Element（元素）--Modifier（修饰符）。块是独立组件，元素是块的子部分，修饰符是状态变体。

\`\`\`css
/* Block: card / Element: card__title / Modifier: card--featured */
.card { }
.card__title { }
.card__title--large { }
.card--featured { border-color: gold; }
\`\`\`

优点：命名即结构、避免冲突、可读性强。缺点：类名冗长、嵌套深时名字爆炸。在饿了么组件库中，BEM 配合 Sass 嵌套减少手写长度。踩坑：Element 不能脱离 Block 单独使用（card__title 不能用在非 card 内）；Modifier 是块/元素的状态，不是新块。`,
    keyPoints: ["Block__Element--Modifier 三段式", "避免命名冲突", "命名即结构可读性强"],
    followUps: ["BEM 如何处理深层嵌套？", "BEM 和 CSS Modules 如何结合？"],
    favorited: false,
  },
  {
    id: "fe-23",
    nodeId: "fe-css-architecture",
    question: "CSS Modules 如何实现样式隔离？和 BEM 有什么区别？",
    bigTech: false,
    answer: `CSS Modules 在构建时给类名加 hash 后缀（如 .title → .title_x8y2k），天然隔离。BEM 靠人工命名规范，Modules 靠工具保证。

\`\`\`tsx
// Button.module.css
.btn { color: blue; }
// Button.tsx
import s from "./Button.module.css";
<button className={s.btn}>点击</button>
// 编译后 class="_btn_x8y2k_1"，全局唯一
\`\`\`

踩坑：CSS Modules 默认局部，:global(.xxx) 才能全局；动态 class 拼接要用类库（clsx）；和 Tailwind 混用时，@apply 在 module 里能引用全局 Tailwind 类。`,
    keyPoints: ["构建时加 hash 隔离", "默认局部 :global 全局", "配合 clsx 拼接动态 class"],
    followUps: [":global 和 :local 的区别？", "CSS Modules 如何引用全局变量？"],
    favorited: false,
  },
  {
    id: "fe-24",
    nodeId: "fe-css-architecture",
    question: "Tailwind CSS 的优缺点是什么？什么项目适合用？",
    bigTech: true,
    answer: `Tailwind 是原子化 CSS，类名即样式（p-4 = padding:1rem）。优点：不用起类名、样式即所见、Tree Shaking 后包体小、设计令牌统一。缺点：HTML 类名长、学习成本、需配 Prettier 插件排序。

\`\`\`tsx
// 字节飞书后台用 Tailwind，开发效率提升 40%
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors">
  提交
</button>
// 抽组件复用，避免类名重复
const btn = "px-4 py-2 rounded-lg transition-colors";
\`\`\`

踩坑：长类名用 @apply 抽公共类或抽组件；JIT 模式按需生成，动态 class（\`p-\${n}\`）不会被识别，需用 safelist 或完整类名；Tailwind 适合中后台和设计系统统一的项目，强定制设计稿反而不灵活。`,
    keyPoints: ["原子化类名即样式", "JIT 按需生成包体小", "动态 class 需 safelist"],
    followUps: ["@apply 的使用场景和限制？", "Tailwind 如何自定义设计令牌？"],
    favorited: false,
  },
  {
    id: "fe-25",
    nodeId: "fe-css-architecture",
    question: "CSS-in-JS（styled-components/emotion）和 CSS Modules 如何选型？",
    bigTech: false,
    answer: `CSS-in-JS 优势：样式能读 JS 变量（主题/动态值）、组件内聚；劣势：运行时开销、SSR 复杂。CSS Modules 优势：零运行时、构建时生成；劣势：动态样式需 props 传类名。

\`\`\`tsx
// styled-components：动态主题色
const Button = styled.button\`
  background: \${props => props.primary ? "#0070f3" : "#ccc"};
  padding: 8px 16px;
\`;
<Button primary>主按钮</Button>
// CSS Modules：静态为主，动态用 data-attr
<div className={s.box} data-active={isActive}>...</div>
\`\`\`

踩坑：styled-components 运行时注入样式有性能损耗，大型应用首屏慢；新方案用 Linaria/vanilla-extract 实现零运行时 CSS-in-JS（构建时提取）。SSR 项目优先 CSS Modules 或 vanilla-extract。`,
    keyPoints: ["CSS-in-JS 可读 JS 变量但运行时开销", "Modules 零运行时", "Linaria/vanilla-extract 零运行时方案"],
    followUps: ["styled-components 如何做 SSR？", "vanilla-extract 的构建时原理？"],
    favorited: false,
  },
  {
    id: "fe-26",
    nodeId: "fe-css-architecture",
    question: "如何实现主题切换（暗黑模式）？有哪些方案？",
    bigTech: false,
    answer: `方案：CSS 变量 + data-attr 切换、prefers-color-scheme 跟随系统、Tailwind dark: 前缀。推荐 CSS 变量，灵活且性能好。

\`\`\`css
:root { --bg: #fff; --text: #333; }
[data-theme="dark"] { --bg: #1a1a1a; --text: #eee; }
body { background: var(--bg); color: var(--text); }
\`\`\`
\`\`\`js
// 切换主题，配合 localStorage 持久化
const toggle = () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
};
\`\`\`

踩坑：防闪烁需在 head 内联脚本，SSR 时根据 cookie 预设 data-theme；CSS 变量切换不触发重排，性能优于换样式表；prefers-color-scheme 只跟系统，用户手动切需覆盖。`,
    keyPoints: ["CSS 变量切换主题", "data-attr + localStorage 持久化", "内联脚本防首屏闪烁"],
    followUps: ["如何防止暗黑模式首屏闪烁（FOUC）？", "prefers-color-scheme 如何检测系统主题？"],
    favorited: false,
  },
  {
    id: "fe-27",
    nodeId: "fe-css-architecture",
    question: "什么是设计令牌（Design Tokens）？如何在前端落地？",
    bigTech: false,
    answer: `设计令牌是设计系统的最小单位（颜色/间距/字号/圆角），以变量形式统一设计稿与代码。落地：JSON 定义 → 转 CSS 变量/JS 对象/Tailwind 配置。

\`\`\`json
{ "color": { "primary": { "500": "#0070f3" } }, "spacing": { "4": "1rem" } }
\`\`\`
\`\`\`css
:root { --color-primary-500: #0070f3; --spacing-4: 1rem; }
.btn { background: var(--color-primary-500); padding: var(--spacing-4); }
\`\`\`

踩坑：令牌要分层（global 语义令牌 → component 组件令牌），直接用原始色值后期改主题灾难；Style Dictionary 等工具能从一份 JSON 生成多平台令牌（Web/iOS/Android）。`,
    keyPoints: ["令牌是设计系统最小单位", "JSON 单一来源生成多平台", "分层：global → component"],
    followUps: ["Style Dictionary 如何生成多平台令牌？", "令牌版本化如何管理？"],
    favorited: false,
  },
  {
    id: "fe-28",
    nodeId: "fe-css-architecture",
    question: "如何解决第三方组件库样式被覆盖/无法覆盖的问题？",
    bigTech: false,
    answer: `覆盖三方库样式：提高选择器优先级（:where() 降权 / 多层类名 / !important 慎用）、CSS Modules 用 :global、Tailwind 用重要修饰符。

\`\`\`css
/* 方案一：提高优先级，多层类名 */
.parent .ant-btn { color: red; }
/* 方案二：:global 穿透 CSS Modules */
:global(.ant-btn) { color: red; }
/* 方案三：Tailwind !important 修饰符 */
<button className="!text-red-500 !important:bg-blue-500">
\`\`\`

踩坑：antd 等库用 CSS-in-JS 计算优先级较高，简单选择器盖不住；优先级战争会导致维护噩梦，优先用库提供的 theme/token 配置而非硬覆盖；Shadow DOM 隔离的组件（如微前端）外部样式完全进不去，需用 CSS 自定义属性穿透。`,
    keyPoints: ["提高优先级覆盖", ":global 穿透 Modules", "优先用库的 theme 配置"],
    followUps: [":where() 如何降低优先级？", "Shadow DOM 内如何注入样式？"],
    favorited: false,
  },

  // ===== 5. fe-js-types JS 类型与值 =====
  {
    id: "fe-29",
    nodeId: "fe-js-types",
    question: "JS 有哪些数据类型？如何准确判断一个变量的类型？",
    bigTech: true,
    answer: `8 种类型：7 原始类型（string/number/boolean/null/undefined/symbol/bigint）+ 1 引用类型（object）。判断：typeof 查原始类型，instanceof 查引用类型，Object.prototype.toString 最准。

\`\`\`js
typeof "a";        // "string"
typeof null;       // "object"（历史 bug）
typeof [];         // "object"（不能区分数组）
[] instanceof Array; // true
Object.prototype.toString.call([]); // "[object Array]" 最准
Array.isArray([]); // true（数组专用）
\`\`\`

踩坑：typeof null === "object" 是底层二进制前缀遗留 bug；instanceof 跨 iframe 失效（不同全局 Array 构造器）；NaN 用 typeof 是 "number"，判断用 Number.isNaN 而非全局 isNaN（后者会强制转换）。`,
    keyPoints: ["7 原始 + 1 引用", "typeof 查原始 / instanceof 查引用", "toString 最准"],
    followUps: ["typeof null 为什么是 object？", "instanceof 跨 iframe 为什么失效？"],
    favorited: false,
  },
  {
    id: "fe-30",
    nodeId: "fe-js-types",
    question: "JS 类型转换规则是什么？== 的隐式转换有哪些坑？",
    bigTech: true,
    answer: `隐式转换规则：相等比较时，null==undefined 只互相相等；数字和字符串比较，字符串转数字；布尔参与比较先转数字（true→1）；对象转原始值调 valueOf 再 toString。

\`\`\`js
[] == false;    // true：[]→""→0，false→0
[] == ![];      // true：![]→false→0，[]→""→0
null == 0;      // false：null 只和 undefined 相等
"0" == 0;       // true：字符串转数字
NaN == NaN;     // false：NaN 不等于任何值
\`\`\`

踩坑：团队规范一律用 ===，但判断 null/undefined 可用 obj == null 简写（只匹配这两个）；{} == {} 永远 false（引用不同）；+ 号既是数学加也是字符串拼接，{} + [] 结果因解析器而异。阿里规约强制 ===，code review 卡 ==。`,
    keyPoints: ["null/undefined 只互等", "对象转原始 valueOf→toString", "一律用 ==="],
    followUps: ["+[] 和 +{} 分别是什么？", "Symbol 转 string 为什么要显式 String()？"],
    favorited: false,
  },
  {
    id: "fe-31",
    nodeId: "fe-js-types",
    question: "原始类型和引用类型在赋值/传参时有什么区别？",
    bigTech: false,
    answer: `原始类型按值传递（复制值），引用类型按引用地址传递（共享同一对象）。函数参数都是按值传递，但引用类型的"值"是指针。

\`\`\`js
// 原始类型：互不影响
let a = 1; let b = a; b = 2; // a 仍是 1
// 引用类型：共享对象
let obj1 = { n: 1 }; let obj2 = obj1; obj2.n = 2; // obj1.n 也是 2
// 函数内改形参引用不影响外部
function fn(o) { o = { n: 99 }; } // 重新赋值形参，外部 obj 不变
let obj = { n: 1 }; fn(obj); // obj.n 仍是 1
\`\`\`

踩坑：深拷贝用 structuredClone（现代）或 JSON.parse(JSON.stringify())（无函数/循环引用）；浅拷贝用 {...obj} 或 Object.assign；React 状态必须不可变更新，直接改 state 对象不会触发渲染。`,
    keyPoints: ["原始值传递 / 引用地址传递", "函数内重赋值不影响外部", "深拷贝 structuredClone"],
    followUps: ["structuredClone 和 JSON 深拷贝的区别？", "如何实现一个完整深拷贝？"],
    favorited: false,
  },
  {
    id: "fe-32",
    nodeId: "fe-js-types",
    question: "Symbol 有什么用？为什么用它做对象 key 不会被遍历到？",
    bigTech: false,
    answer: `Symbol 是唯一且不可变原始值，主要做对象私有属性 key 和内置行为协议（Symbol.iterator/toStringTag）。Symbol key 不被 for...in/Object.keys 遍历，实现"半私有"。

\`\`\`js
// 私有属性：外部遍历不到
const id = Symbol("id");
const user = { name: "Tom", [id]: 123 };
Object.keys(user);       // ["name"]
Object.getOwnPropertySymbols(user); // [Symbol(id)] 才能拿到
// 内置协议：自定义可迭代
class Range {
  *[Symbol.iterator]() { yield 1; yield 2; }
}
\`\`\`

踩坑：Symbol.for("x") 会注册全局（可跨文件共享），Symbol("x") 每次新建唯一；Symbol 不能 new（不是构造器）；JSON.stringify 会忽略 Symbol key，序列化后丢失。`,
    keyPoints: ["Symbol 唯一不可变做私有 key", "不被 for...in/Object.keys 遍历", "Symbol.for 全局共享"],
    followUps: ["Symbol.iterator 如何让对象可迭代？", "Symbol 和私有字段 #field 的区别？"],
    favorited: false,
  },
  {
    id: "fe-33",
    nodeId: "fe-js-types",
    question: "BigInt 和 Number 有什么区别？什么时候用 BigInt？",
    bigTech: false,
    answer: `Number 是 64 位浮点（IEEE 754），安全整数范围 ±2^53-1；BigInt 是任意精度整数，无精度丢失。大整数 ID/加密计算用 BigInt。

\`\`\`js
Number.MAX_SAFE_INTEGER; // 9007199254740991
9007199254740991 + 2;    // 9007199254740992（精度丢失！）
9007199254740991n + 2n;  // 9007199254740993n（BigInt 精确）
// 后端返回大 ID（如雪花算法）JSON 解析会丢精度
JSON.parse('{"id": 9007199254740993}').id; // 9007199254740992 丢失！
// 解决：用 json-bigint 库或后端返回字符串
\`\`\`

踩坑：BigInt 不能和 Number 直接运算（1n + 1 报错），需显式转换；BigInt 不支持 Math 方法；JSON.stringify 不支持 BigInt 会报错，需自定义序列化。腾讯订单系统大额 ID 丢失导致对账错误，后端改返回字符串。`,
    keyPoints: ["Number 安全范围 2^53-1", "BigInt 任意精度", "大 ID 用字符串或 BigInt"],
    followUps: ["为什么 0.1+0.2≠0.3？", "JSON 如何序列化 BigInt？"],
    favorited: false,
  },
  {
    id: "fe-34",
    nodeId: "fe-js-types",
    question: "JS 的包装类型是什么？'abc'.length 为什么能访问到？",
    bigTech: false,
    answer: `原始类型没有方法，但 JS 在访问属性时临时创建包装对象（String/Number/Boolean），用完即销毁。所以 "abc".length 能取到值但不能赋值。

\`\`\`js
"abc".length;   // 3：临时 new String("abc").length，用完销毁
"abc".x = 1;    // 临时对象赋值，立即销毁
"abc".x;        // undefined：又新建了一个，没有 x
// 对比显式包装（不推荐）
const s = new String("abc"); // s 是对象，typeof "object"
s === "abc";    // false（对象 vs 原始）
\`\`\`

踩坑：new String/Number/Boolean 创建的是对象，=== 比较原始值会 false；用 typeof 区分：typeof "x" 是 "string"，typeof new String() 是 "object"；Symbol/BigInt 不能用 new，本身就是原始值。`,
    keyPoints: ["访问属性时临时创建包装对象", "用完即销毁不能存属性", "new String 是对象非原始"],
    followUps: ["new String 和 String() 的区别？", "为什么不能用 new Symbol？"],
    favorited: false,
  },
  {
    id: "fe-35",
    nodeId: "fe-js-types",
    question: "如何准确判断 NaN？为什么 isNaN 不靠谱？",
    bigTech: false,
    answer: `NaN 是"非数字"的数字值（typeof NaN === "number"），特点是 NaN≠NaN。全局 isNaN 会先强制转换参数再判断，导致 isNaN("abc") 也 true。用 Number.isNaN 严格判断。

\`\`\`js
isNaN("abc");      // true：先转 Number("abc")=NaN，再判
isNaN("123");      // false：Number("123")=123 不是 NaN
Number.isNaN("abc"); // false：不转换，"abc"不是 NaN 类型
Number.isNaN(NaN);   // true：严格判断
// 最简判断：利用 NaN≠NaN
const isNaNSafe = v => v !== v;
\`\`\`

踩坑：NaN 是唯一不等于自身的值，v !== v 是最快的 NaN 判断；NaN 参与运算结果都是 NaN（NaN+1=NaN）；数组的 indexOf 找不到 NaN（用 includes 能找到，因为用零值相等算法）。`,
    keyPoints: ["Number.isNaN 严格不转换", "全局 isNaN 会强制转换", "v!==v 判 NaN 最快"],
    followUps: ["为什么 NaN 不等于自身？", "Array.includes 为什么能找到 NaN？"],
    favorited: false,
  },

  // ===== 6. fe-js-scope 作用域与闭包 =====
  {
    id: "fe-36",
    nodeId: "fe-js-scope",
    question: "什么是闭包？闭包有哪些实际应用？内存泄漏怎么避免？",
    bigTech: true,
    answer: `闭包 = 函数 + 其词法作用域引用。内层函数引用外层变量，使外层变量在函数返回后仍存活。应用：私有化、缓存、柯里化、防抖节流。

\`\`\`js
// 私有化：腾讯文档协同模块用闭包封装内部状态
function createStore(init) {
  let state = init; // 外部无法直接访问
  return {
    get: () => state,
    set: v => state = v,
  };
}
// 内存泄漏：长生命周期闭包持有 DOM 引用
function bind() {
  const huge = document.querySelector("#huge"); // 闭包持有 DOM
  el.addEventListener("click", () => console.log(huge.id));
  // 忘了 removeEventListener，DOM 卸载后 huge 仍被闭包引用不回收
}
\`\`\`

踩坑：闭包持有的大对象用完置 null；定时器/事件监听必须在组件卸载时清理；WeakMap 持有的 key 不阻止垃圾回收，适合缓存关联 DOM。`,
    keyPoints: ["闭包=函数+词法作用域引用", "实现私有化/缓存/柯里化", "长生命周期闭包要释放引用"],
    followUps: ["闭包变量存在堆还是栈？", "WeakMap 如何避免缓存内存泄漏？"],
    favorited: false,
  },
  {
    id: "fe-37",
    nodeId: "fe-js-scope",
    question: "var、let、const 有什么区别？为什么推荐 const 优先？",
    bigTech: false,
    answer: `var 函数作用域、有变量提升（值为 undefined）、可重复声明；let/const 块级作用域、有暂时性死区（TDZ，声明前访问报错）、不可重复声明。const 声明后不能重新赋值（但对象内部可变）。

\`\`\`js
// var 提升：循环变量泄漏
for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); } // 3 3 3
for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); } // 0 1 2
// const 不可重新赋值，但对象属性可变
const obj = { n: 1 }; obj.n = 2; // OK
obj = {}; // TypeError
// 冻结对象
const frozen = Object.freeze({ n: 1 }); frozen.n = 2; // 静默失败
\`\`\`

踩坑：const 声明对象不是深冻结，要彻底不可变用 Object.freeze 或 Immutable.js；let/const 不挂 window（var 会）；TDZ 下 typeof 也报错（var 是 undefined）。`,
    keyPoints: ["var 函数作用域有提升", "let/const 块级+TDZ", "const 优先防误改"],
    followUps: ["暂时性死区（TDZ）是什么？", "Object.freeze 是浅冻结还是深冻结？"],
    favorited: false,
  },
  {
    id: "fe-38",
    nodeId: "fe-js-scope",
    question: "词法作用域和动态作用域有什么区别？JS 是哪种？",
    bigTech: false,
    answer: `词法作用域（静态作用域）：函数的作用域在定义时确定（看代码书写位置）；动态作用域：在调用时确定（看调用栈）。JS 是词法作用域，this 是动态的（类似动态作用域但不是）。

\`\`\`js
// 词法作用域：foo 定义在全局，访问的 a 是全局的
let a = 1;
function foo() { console.log(a); }
function bar() { let a = 2; foo(); }
bar(); // 1（词法：foo 定义处 a=1，非调用处 a=2）
// this 是动态的：取决于调用方式
const obj = { n: 1, get() { return this.n; } };
obj.get();           // 1（this=obj）
const fn = obj.get; fn(); // undefined（this=window）
\`\`\`

踩坑：闭包捕获的是变量引用而非值，循环中用 let 自动绑定每轮副本；eval/with 能动态改作用域（严格模式禁用）；箭头函数没有自己的 this，继承外层词法 this。`,
    keyPoints: ["词法作用域定义时确定", "this 动态绑定类似但不等同", "闭包捕获变量引用"],
    followUps: ["with 语句为什么被严格模式禁用？", "箭头函数的 this 如何确定？"],
    favorited: false,
  },
  {
    id: "fe-39",
    nodeId: "fe-js-scope",
    question: "this 的绑定规则有哪些？箭头函数的 this 有什么特殊？",
    bigTech: true,
    answer: `this 四规则（优先级从高到低）：new 绑定 → 显式绑定（call/apply/bind）→ 隐式绑定（obj.fn）→ 默认绑定（独立调用，严格模式 undefined）。箭头函数没有自己的 this，继承外层词法 this，且不可被 call 改变。

\`\`\`js
// 隐式绑定
const obj = { n: 1, get() { return this.n; } };
obj.get(); // 1
// 显式绑定
obj.get.call({ n: 2 }); // 2
// new 绑定
function Foo() { this.n = 3; }
new Foo().n; // 3
// 箭头函数：继承外层 this，回调中不丢失
class Comp {
  n = 1;
  handler = () => console.log(this.n); // 永远是实例
  mounted() { el.addEventListener("click", this.handler); }
}
\`\`\`

踩坑：回调函数丢失 this（fn = obj.get; fn() this 是 undefined），用箭头函数或 bind 解决；React 类组件事件处理必须 bind 或用箭头函数属性；箭头函数不能 new、没有 arguments。`,
    keyPoints: ["四规则优先级 new>显式>隐式>默认", "箭头函数继承词法 this", "回调丢失 this 用 bind/箭头"],
    followUps: ["call/apply/bind 的区别？", "new 操作符如何影响 this？"],
    favorited: false,
  },
  {
    id: "fe-40",
    nodeId: "fe-js-scope",
    question: "什么是 IIFE（立即执行函数）？现在还需要用吗？",
    bigTech: false,
    answer: `IIFE = 立即调用函数表达式，创建独立作用域隔离变量。ES6 前（无 let/模块）用来防全局污染和模拟块级作用域。ESM 和 let 普及后，IIFE 主要用于 UMD 包装和一次性逻辑。

\`\`\`js
// 经典：隔离变量防污染
(function() {
  var private = "secret"; // 不泄漏到全局
  window.MyLib = { get: () => private };
})();
// 现代场景：UMD 模块包装
(function(root, factory) {
  if (typeof define === "function" && define.amd) define(factory);
  else root.MyLib = factory();
})(this, function() { return {}; });
// for 循环闭包（let 已替代）
for (var i = 0; i < 3; i++) { (i => setTimeout(() => console.log(i)))(i); }
\`\`\`

踩坑：function foo(){}() 会被解析成函数声明报错，必须包括号 (function(){})() 或 +function(){}()；现代代码用 ESM 和块级作用域替代 IIFE，可读性更好。`,
    keyPoints: ["IIFE 创建独立作用域", "ESM/let 普及后减少使用", "UMD 包装仍需要"],
    followUps: ["IIFE 如何返回值？", "箭头函数能做 IIFE 吗？"],
    favorited: false,
  },
  {
    id: "fe-41",
    nodeId: "fe-js-scope",
    question: "模块模式（Module Pattern）如何用闭包实现私有化？",
    bigTech: false,
    answer: `模块模式用 IIFE + 闭包封装私有变量和方法，只暴露公共接口。ES6 前是主要的私有化方案，现已被 class 私有字段 # 和 ESM 取代，但理解原理重要。

\`\`\`js
// 经典模块模式
const Counter = (function() {
  let count = 0; // 私有
  const inc = () => ++count; // 私有
  return { // 公共
    increment: inc,
    get: () => count,
  };
})();
Counter.increment(); Counter.get(); // 1
// 现代：class 私有字段
class Counter {
  #count = 0; // 真私有
  increment() { return ++this.#count; }
}
\`\`\`

踩坑：模块模式的私有变量无法被实例化（单例）；class 私有字段 #x 是真私有（外部和子类都不可访问），相较闭包无运行时开销；单例模块适合全局配置/store。`,
    keyPoints: ["IIFE+闭包封装私有", "暴露公共接口", "现代用 # 私有字段"],
    followUps: ["class 私有字段 # 和闭包私有的区别？", "揭示模块模式（Revealing Module）是什么？"],
    favorited: false,
  },
  {
    id: "fe-42",
    nodeId: "fe-js-scope",
    question: "闭包会导致内存泄漏吗？如何排查和解决？",
    bigTech: false,
    answer: `闭包本身不是泄漏，只有当闭包长期存活（全局/长生命周期）且持有不再需要的大对象引用时才算泄漏。常见场景：事件监听未移除、定时器未清理、缓存无上限。

\`\`\`js
// 泄漏：组件卸载后定时器仍持有闭包
function Page() {
  const data = fetchHugeData();
  const timer = setInterval(() => console.log(data.length), 1000);
  // 忘了 clearInterval，Page 销毁后 data 仍被定时器闭包引用
}
// 修复：清理
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer); // 卸载时清理
}, []);
// WeakMap 缓存：key 被回收时自动清理
const cache = new WeakMap(); cache.set(domEl, data);
\`\`\`

踩坑：Chrome DevTools Memory → Heap Snapshot 对比两次快照找 retained 增量；detached DOM（已移除但被 JS 引用）是隐蔽泄漏；WeakRef/FinalizationRegistry 可做弱引用清理。`,
    keyPoints: ["长生命周期闭包持引用才泄漏", "清理监听/定时器", "WeakMap 自动回收"],
    followUps: ["如何用 DevTools 排查内存泄漏？", "detached DOM 是什么？"],
    favorited: false,
  },

  // ===== 7. js-async 异步编程 =====
  {
    id: "fe-43",
    nodeId: "js-async",
    question: "请详细描述浏览器事件循环的执行流程，宏任务和微任务的优先级？",
    bigTech: true,
    answer: `事件循环流程：执行同步代码（调用栈）→ 清空所有微任务 → 浏览器渲染（requestAnimationFrame）→ 取一个宏任务执行 → 再清空微任务 → 循环。微任务优先级高于宏任务，每轮宏任务后清空全部微任务。

\`\`\`js
console.log(1);
setTimeout(() => console.log(2));            // 宏任务
Promise.resolve().then(() => console.log(3)); // 微任务
requestAnimationFrame(() => console.log(4));  // 渲染前回调
console.log(5);
// 前三个输出确定：1 5 3（同步→微任务）
// 但 rAF 回调与 setTimeout(0) 的先后【不保证】：
// 渲染插入在两个宏任务之间的时机取决于帧调度，
// 可能输出 1 5 3 4 2，也可能输出 1 5 3 2 4。
\`\`\`

踩坑：rAF 回调与 setTimeout(0) 没有确定的先后关系——浏览器在每帧开始时按"取一个宏任务→清微任务→（若到帧时机）执行 rAF 回调并渲染"的循环调度，setTimeout(0) 实际有最小延迟且可能与渲染时机交错，不能依赖其顺序写逻辑；await 后续代码相当于 .then 微任务；微任务中产生的新微任务当轮清空。`,
    keyPoints: ["同步→微任务→（到帧时）渲染→宏任务循环", "每轮宏任务后清空全部微任务", "rAF 与 setTimeout(0) 先后不保证", "await 后续是微任务"],
    followUps: ["requestAnimationFrame 与 setTimeout(0) 谁先执行有定论吗？", "Node 事件循环和浏览器有何不同？"],
    favorited: false,
  },
  {
    id: "fe-44",
    nodeId: "js-async",
    question: "Promise 的状态如何流转？then 链式调用的原理？",
    bigTech: true,
    answer: `Promise 三态：pending→fulfilled/rejected，一旦确定不可逆。then 返回新 Promise，链式调用通过返回值传递。返回普通值→下一个 then fulfilled；返回 Promise→等其决议；throw→rejected。

\`\`\`js
fetch("/api")
  .then(res => res.json())        // 返回 Promise，等决议
  .then(data => data.id)          // 返回普通值，下一个 then 收到 id
  .then(id => fetch(\`/api/\${id}\`))
  .catch(err => console.log(err)) // 捕获链中任何 reject
  .finally(() => setLoading(false)); // 无论成败都执行
// 值穿透：then 不传参数，值原样传递
Promise.resolve(1).then().then(v => console.log(v)); // 1
\`\`\`

踩坑：catch 后再 then 仍会执行（catch 返回 fulfilled）；then 的回调是微任务，不会同步执行；unhandledrejection 事件捕获未处理的 reject。`,
    keyPoints: ["三态不可逆", "then 返回新 Promise 链式", "返回值/throw 决定下个状态"],
    followUps: ["Promise.catch 后还能 then 吗？", "如何实现 Promise.all？"],
    favorited: false,
  },
  {
    id: "fe-45",
    nodeId: "js-async",
    question: "async/await 的原理是什么？相比 Promise 有什么优势？",
    bigTech: true,
    answer: `async 函数返回 Promise，await 暂停函数等待 Promise 决议，本质是 Generator + 自动执行器的语法糖：每个 await 对应一次 yield，执行器（如 co 库）拿到 yield 出的 Promise 后注册 then，决议时把值塞回 next() 驱动下一步。

Babel 降级形态：目标是旧环境（无 Generator）时，@babel/plugin-transform-regenerator 会把 async 函数编译成 regeneratorRuntime 驱动的 switch-case 状态机（函数体被拆成 case 0/1/2…，用 _context.next 记录当前步骤）；配 @babel/preset-env 且 targets 包含现代浏览器时则保留原生 async，体积更小、栈更清晰。

优势：写法像同步、try/catch 能捕获、调试栈清晰。

\`\`\`js
// async/await 等价于 Promise 链
async function getUser(id) {
  try {
    const res = await fetch(\`/api/\${id}\`); // 暂停等决议
    const data = await res.json();
    return data; // return 值成为 Promise resolve 值
  } catch (e) {
    console.log(e); // await 的 reject 可被 try/catch 捕获
  }
}
// 并发用 Promise.all，别串行 await
async function loadAll() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]); // 并发
}
\`\`\`

踩坑：循环中逐个 await 是串行（慢），并发用 Promise.all——tradeoff：串行时总耗时是各请求之和但失败即停、时序确定；Promise.all 并发总耗时约等于最慢者，但任一失败即整体 reject（要容错用 allSettled），且全部请求同时发出可能触达并发上限，需要时再叠加并发池；await 后的代码是微任务；顶层 await（模块内）会阻塞依赖该模块的代码。`,
    keyPoints: ["async 返回 Promise", "await 暂停等决议", "Generator+自动执行器语法糖（Babel 降级为 regenerator 状态机）", "串行 await vs 并发 Promise.all 的 tradeoff"],
    followUps: ["for...of 中 await 是串行还是并发？", "顶层 await 有什么限制？"],
    favorited: false,
  },
  {
    id: "fe-46",
    nodeId: "js-async",
    question: "如何实现并发控制（限制同时请求数）？请结合实际场景。",
    bigTech: true,
    answer: `并发控制：限制同时进行的 Promise 数量，避免打垮服务端或浏览器连接数上限（同域 6 个）。核心：维护运行池，完成一个补一个。

字节图库批量上传 1000 张图，用并发池限 6 路，比串行快 100 倍又不超连接数：

\`\`\`js
async function pool(tasks, limit) {
  const results = [];
  const running = new Set();
  for (const task of tasks) {
    const p = Promise.resolve().then(task);
    results.push(p);
    running.add(p);
    p.finally(() => running.delete(p));
    if (running.size >= limit) await Promise.race(running);
  }
  return Promise.all(results);
}
// 用法：1000 个上传任务，同时最多 6 个
await pool(uploadTasks, 6);
\`\`\`

踩坑：Promise.all 全部完成才返回，要边完成边处理用 race 轮询；p-limit 库封装了此逻辑；注意任务失败要决定是否中断（allSettled 不中断）。`,
    keyPoints: ["运行池+race 补位", "避免超连接数上限", "p-limit 库封装"],
    followUps: ["Promise.race 和 Promise.any 的区别？", "如何实现失败重试？"],
    favorited: false,
  },
  {
    id: "fe-47",
    nodeId: "js-async",
    question: "Promise.all、allSettled、race、any 的区别？",
    bigTech: false,
    answer: `all：全部 fulfilled 才 fulfilled，一个 reject 立即 reject；allSettled：全部完成（无论成败）才 fulfilled，返回每个状态；race：第一个完成（成败都算）即决定；any：第一个 fulfilled 即 fulfilled，全 reject 才 reject。

\`\`\`js
Promise.all([f1(), f2()]);        // 都成功才成功，一个失败即失败
Promise.allSettled([f1(), f2()]); // 都完成，返回 [{status, value/reason}]
Promise.race([f1(), timeout()]);  // 第一个决定（超时控制）
Promise.any([f1(), f2(), f3()]);  // 第一个成功即成功（多源容灾）
// 实战：请求 + 超时
const data = await Promise.race([
  fetch("/api"), new Promise((_, r) => setTimeout(() => r("超时"), 5000))
]);
\`\`\`

踩坑：all 失败时其他 Promise 仍在执行（无法取消），只是结果被忽略；race 不会取消其他（Promise 不可取消）；any 全失败返回 AggregateError。`,
    keyPoints: ["all 全成/一败即败", "allSettled 全完成", "race 第一个决定 / any 第一个成功"],
    followUps: ["Promise.all 失败时其他请求会取消吗？", "如何实现可取消的 Promise？"],
    favorited: false,
  },
  {
    id: "fe-48",
    nodeId: "js-async",
    question: "如何取消一个已经发起的异步请求（fetch/setTimeout）？",
    bigTech: false,
    answer: `fetch 用 AbortController 取消；setTimeout 用 clearTimeout。AbortController 通过 signal 传递，调用 abort() 触发 reject。

\`\`\`js
// fetch 取消：React 查询组件卸载时取消请求
function useFetch(url) {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal }).catch(e => {
    if (e.name === "AbortError") console.log("已取消");
  });
  return () => ctrl.abort(); // 卸载调用
}
// 超时自动取消
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 5000);
fetch(url, { signal: ctrl.signal });
// Promise 包装超时
function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, r) => setTimeout(() => r("超时"), ms))]);
}
\`\`\`

踩坑：abort 后 fetch 抛 AbortError，需在 catch 区分；axios 用 CancelToken（旧）/ signal（新）；Promise 本身不可取消，只能忽略结果，AbortController 是标准取消机制。`,
    keyPoints: ["AbortController 取消 fetch", "clearTimeout 取消定时器", "Promise 不可取消只能忽略"],
    followUps: ["AbortController 如何取消多个请求？", "axios 的取消机制演进？"],
    favorited: false,
  },
  {
    id: "fe-49",
    nodeId: "js-async",
    question: "微任务和宏任务分别有哪些？为什么微任务优先级更高？",
    bigTech: false,
    answer: `微任务：Promise.then/catch/finally、queueMicrotask、MutationObserver、process.nextTick(Node)。宏任务：setTimeout/setInterval、I/O、UI 事件、postMessage、setImmediate(Node)。微任务优先级高是因为它在每次宏任务后、渲染前同步清空，保证状态及时更新。

\`\`\`js
// 微任务在宏任务前执行
setTimeout(() => console.log("宏"), 0);
Promise.resolve().then(() => console.log("微"));
console.log("同");
// 同 微 宏
// 微任务中产生新微任务，当轮清空
Promise.resolve().then(() => {
  console.log(1);
  Promise.resolve().then(() => console.log(2)); // 当轮微任务
});
setTimeout(() => console.log(3));
// 1 2 3（2 在 3 前）
\`\`\`

踩坑：queueMicrotask 比 setTimeout(fn,0) 更快且不阻塞渲染；MutationObserver 批量处理 DOM 变化（微任务），比 MutationEvent（宏）高效。`,
    keyPoints: ["微任务：Promise/MutationObserver", "宏任务：setTimeout/I/O", "微任务每轮清空"],
    followUps: ["queueMicrotask 的作用？", "MutationObserver 为什么用微任务？"],
    favorited: false,
  },

  // ===== 8. js-prototype 原型与继承 =====
  {
    id: "fe-50",
    nodeId: "js-prototype",
    question: "请描述 JS 的原型链，对象查找属性的顺序是怎样的？",
    bigTech: true,
    answer: `每个对象有 __proto__ 指向其构造函数的 prototype。访问属性时先找自身，找不到沿 __proto__ 链向上查找，直到 Object.prototype 或 null。原型链终点是 Object.prototype.__proto__ === null。

\`\`\`js
function Person(name) { this.name = name; }
Person.prototype.say = function() { console.log(this.name); };
const p = new Person("Tom");
p.say(); // 自身没有 → p.__proto__(Person.prototype) 有
p.toString(); // Person.prototype 没有 → Object.prototype 有
// 链：p → Person.prototype → Object.prototype → null
Object.getPrototypeOf(p) === Person.prototype; // true
Object.getPrototypeOf(Object.prototype) === null; // 终点
\`\`\`

踩坑：__proto__ 是非标准属性（用 Object.getPrototypeOf/setPrototypeOf）；Object.create(null) 创建无原型的对象（纯字典），无 toString 等方法；修改原型（__proto__=）破坏 V8 优化，性能差。`,
    keyPoints: ["__proto__ 指向构造器 prototype", "沿链向上查找到 null", "Object.create(null) 无链"],
    followUps: ["Object.create(null) 有什么用？", "为什么不要用 __proto__ 赋值？"],
    favorited: false,
  },
  {
    id: "fe-51",
    nodeId: "js-prototype",
    question: "ES6 class 和 ES5 构造函数有什么关系？class 的本质是什么？",
    bigTech: true,
    answer: `class 是构造函数 + 原型的语法糖。实例方法在 prototype 上，静态方法在构造器本身上，constructor 对应构造函数。class 默认严格模式，不可不 new 调用。

\`\`\`js
class Person {
  constructor(name) { this.name = name; } // 实例属性
  say() { console.log(this.name); }       // Person.prototype.say
  static create(name) { return new Person(name); } // Person.create
}
// 等价 ES5
function Person(name) { this.name = name; }
Person.prototype.say = function() { console.log(this.name); };
Person.create = function(name) { return new Person(name); };
\`\`\`

踩坑：class 方法不可枚举（ES5 prototype 方法可枚举）；class 内部默认严格模式；class 无变量提升（像 let 有 TDZ）；私有字段 #x 是真私有，非 prototype 上的方法。`,
    keyPoints: ["class 是构造函数语法糖", "实例方法在 prototype", "静态方法在构造器"],
    followUps: ["class 的方法为什么不可枚举？", "class 有变量提升吗？"],
    favorited: false,
  },
  {
    id: "fe-52",
    nodeId: "js-prototype",
    question: "new 操作符做了什么？如何手写一个 new？",
    bigTech: false,
    answer: `new 做四件事：1.创建空对象；2.对象 __proto__ 指向构造函数 prototype；3.构造函数 this 绑定新对象执行；4.若返回是对象则用返回值，否则用新对象。

\`\`\`js
function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype); // 步骤 1+2
  const result = Fn.apply(obj, args);      // 步骤 3
  return result instanceof Object ? result : obj; // 步骤 4
}
// 验证
function Person(name) { this.name = name; }
const p = myNew(Person, "Tom");
p instanceof Person; // true
p.name; // "Tom"
// 构造函数返回对象会覆盖 new 结果
function Foo() { return { x: 1 }; }
new Foo(); // { x: 1 }（返回的对象）
\`\`\`

踩坑：构造函数显式 return 对象会替换新对象，return 原始值被忽略；Object.create(Fn.prototype) 比 __proto__ 赋值更标准；new.target 可检测是否被 new 调用。`,
    keyPoints: ["创建对象+绑原型+绑 this+判返回", "返回对象覆盖新对象", "Object.create 绑原型"],
    followUps: ["构造函数 return 对象会发生什么？", "new.target 有什么用？"],
    favorited: false,
  },
  {
    id: "fe-53",
    nodeId: "js-prototype",
    question: "JS 有哪些继承模式？ES6 extends 的原理？",
    bigTech: false,
    answer: `继承演进：原型链继承（共享引用类型）→ 借用构造函数（无法继承原型方法）→ 组合继承（调两次父构造器）→ 寄生组合继承（最优）→ ES6 extends（语法糖，本质寄生组合）。

\`\`\`js
// 寄生组合继承（ES5 最优）
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}
// ES6 extends（本质同上 + super）
class Animal { constructor(name) { this.name = name; } speak() {} }
class Dog extends Animal {
  constructor(name) { super(name); this.type = "dog"; } // super 必须在 this 前
  bark() {}
}
\`\`\`

踩坑：extends 的 super() 调用父构造器，必须在 this 使用前调用（否则 ReferenceError）；extends 继承静态方法（ES5 需手动 Object.setPrototypeOf(Child, Parent)）；class 不能多继承，用 mixin 模拟。`,
    keyPoints: ["寄生组合继承 ES5 最优", "extends 本质寄生组合+super", "super 须在 this 前"],
    followUps: ["为什么组合继承调两次父构造器？", "如何用 mixin 实现多继承？"],
    favorited: false,
  },
  {
    id: "fe-54",
    nodeId: "js-prototype",
    question: "instanceof 的原理？如何手写？有什么局限？",
    bigTech: false,
    answer: `instanceof 沿左侧对象的原型链查找，看是否有右侧函数的 prototype。局限：跨 iframe/ realm 失效（不同全局构造器）；原始值永远 false（5 instanceof Number 是 false）。

\`\`\`js
function myInstanceof(obj, Fn) {
  if (obj == null) return false; // null/undefined
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Fn.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
myInstanceof([], Array);  // true
myInstanceof(5, Number);  // false（原始值无原型链）
// 跨 realm：iframe 内的数组
iframe.contentWindow.Array === Array; // false（两个 realm 的 Array 是不同构造器）
// 所以 iframe 里创建的数组 instanceof Array 在主 realm 里是 false
\`\`\`

踩坑：跨 iframe 用 Array.isArray 而非 instanceof；Symbol.hasInstance 可自定义 instanceof 行为；null instanceof 任何都是 false（无原型链）。`,
    keyPoints: ["沿原型链找 Fn.prototype", "跨 realm 失效", "原始值永远 false"],
    followUps: ["Symbol.hasInstance 如何自定义？", "Array.isArray 为什么能跨 realm？"],
    favorited: false,
  },
  {
    id: "fe-55",
    nodeId: "js-prototype",
    question: "Object.create 和 new 的区别？Object.create(null) 有什么用？",
    bigTech: false,
    answer: `Object.create(proto) 创建以 proto 为原型的新对象，不调构造函数；new 调用构造函数初始化实例。Object.create(null) 创建无原型的对象，是纯字典（无 toString 等方法），防原型污染。

\`\`\`js
// Object.create：只设原型，不执行构造器
const obj = Object.create({ greet() { return "hi"; } });
obj.greet(); // "hi"（继承自原型）
// new：执行构造器初始化
function Foo() { this.x = 1; }
const f = new Foo(); // f.x=1，f.__proto__=Foo.prototype
// Object.create(null)：纯字典，无原型污染风险
const map = Object.create(null);
map["toString"]; // undefined（不会查到 Object.prototype.toString）
// 防原型污染：用 null 原型做查找表
const config = Object.create(null);
if (config[key]) { ... } // key="toString" 不会误判
\`\`\`

踩坑：Object.create(null) 的对象没有 toString，console.log 显示特殊；JSON.stringify 正常；用作 Map 前的 polyfill 字典，现代用 Map 替代。`,
    keyPoints: ["Object.create 只设原型不调构造器", "new 执行构造器", "create(null) 防原型污染"],
    followUps: ["原型污染攻击是什么？", "Map 和 Object.create(null) 字典的区别？"],
    favorited: false,
  },
  {
    id: "fe-56",
    nodeId: "js-prototype",
    question: "class 的静态方法和实例方法有什么区别？static 的使用场景？",
    bigTech: false,
    answer: `实例方法在 prototype 上（实例访问），静态方法在构造器本身上（类访问，非实例）。静态方法常用于工厂方法、工具函数，无 this 实例。

\`\`\`js
class User {
  constructor(name) { this.name = name; }
  say() { console.log(this.name); }           // 实例方法：User.prototype.say
  static create(name) { return new User(name); } // 静态方法：User.create
  static #count = 0;                          // 静态私有字段
  static get total() { return User.#count; }
}
const u = User.create("Tom"); // 静态工厂
u.say(); // "Tom"（实例方法）
u.create; // undefined（实例访问不到静态）
User.say; // undefined（类访问不到实例）
// extends 继承静态方法
class Admin extends User {}
Admin.create("A"); // 继承自 User
\`\`\`

踩坑：静态方法内 this 指向类本身（子类调用时 this 是子类）；静态方法不能直接访问实例属性；工厂模式用 static create 比直接 new 更灵活（可返回缓存/子类）。`,
    keyPoints: ["实例方法在 prototype", "静态方法在构造器本身", "extends 继承静态方法"],
    followUps: ["静态方法内 this 指向什么？", "静态私有字段如何用？"],
    favorited: false,
  },

  // ===== 9. js-modules 模块化 =====
  {
    id: "fe-57",
    nodeId: "js-modules",
    question: "ESM 和 CommonJS 有什么区别？为什么现代前端用 ESM？",
    bigTech: true,
    answer: `CommonJS：运行时加载（require 同步）、exports 是模块执行后的一次性快照、可动态、Node 主用。ESM：编译时确定依赖（静态结构）、值为活绑定引用（导出变化反映）、支持 Tree Shaking、顶层 this 是 undefined。

CJS"值拷贝"要分两层说：require 拿到的 module.exports 是普通对象快照——原始值（number/string）拷贝后不再随模块内部变化；但对象/数组/函数是共享引用，模块内改对象属性两边都可见（只是重新赋值整个导出不影响已引用的旧对象）。

\`\`\`js
// CommonJS：原始值快照，对象共享引用
// lib.js
let count = 0;
const state = { n: 0 };
module.exports = { count, state, inc() { count++; state.n++; } };
// main.js
const { count, state, inc } = require("./lib");
inc();
console.log(count);   // 0（原始值快照，不变）
console.log(state.n); // 1（对象共享引用，可见变化）
// ESM：活绑定引用
// lib.mjs
export let count = 0; export function inc() { count++; }
// main.mjs
import { count, inc } from "./lib.mjs";
inc(); console.log(count); // 1（绑定反映变化）
\`\`\`

踩坑：ESM 顶层 await 可用，CJS 不行；ESM 文件 .mjs 或 package.json type:module；循环依赖 ESM 通过引用可能拿到未初始化值（TDZ 报错），CJS 拿到部分导出。`,
    keyPoints: ["CJS 原始值快照+对象共享引用 / ESM 活绑定", "ESM 支持 Tree Shaking", "ESM 顶层 await"],
    followUps: ["ESM 循环依赖为什么会 TDZ？", "package.json 的 type:module 有什么影响？"],
    favorited: false,
  },
  {
    id: "fe-58",
    nodeId: "js-modules",
    question: "动态 import() 和静态 import 有什么区别？使用场景？",
    bigTech: false,
    answer: `静态 import 在编译时确定依赖，顶层执行，会被打包进主包；动态 import() 运行时按需加载，返回 Promise，用于代码分割和懒加载。

\`\`\`js
// 静态：编译时，打包进主包
import lodash from "lodash";
// 动态：运行时，按需加载（代码分割）
const module = await import("./heavy-module");
// React 懒加载路由
const Admin = React.lazy(() => import("./Admin"));
<Suspense fallback={<Spinner />}><Admin /></Suspense>;
// 条件加载：按权限加载模块
if (user.role === "admin") {
  const { adminPanel } = await import("./admin");
  adminPanel.render();
}
\`\`\`

踩坑：import() 的路径不能完全是动态变量（需静态可分析），用模板字符串需有静态前缀（\`./pages/\${name}\`）；动态导入会生成单独 chunk，首屏不加载；Vite/Webpack 自动对 import() 做分割。`,
    keyPoints: ["静态编译时 / 动态运行时", "import() 实现代码分割", "路径需静态可分析"],
    followUps: ["import() 如何做预加载（prefetch）？", "Webpack magic comments 是什么？"],
    favorited: false,
  },
  {
    id: "fe-59",
    nodeId: "js-modules",
    question: "Tree Shaking 的原理是什么？为什么 CommonJS 不能 Tree Shaking？",
    bigTech: true,
    answer: `Tree Shaking 基于 ESM 静态结构，编译时分析导入导出，剔除未使用的代码。CJS 是运行时动态 require，无法静态分析，所以不能 Tree Shaking。

\`\`\`js
// math.js (ESM)
export function add(a, b) { return a + b; }   // 被使用，保留
export function sub(a, b) { return a - b; }   // 未使用，剔除
// main.js
import { add } from "./math"; // sub 被摇掉
// 副作用：模块顶层有副作用，需 package.json 标记
// package.json
{ "sideEffects": false } // 告诉打包器无副作用可安全摇
\`\`\`

踩坑：有副作用的模块（顶层修改全局/原型）不能被摇，需在 package.json sideEffects 数组排除；生产模式才摇（dev 不摇便于调试）；函数需纯（无副作用）才安全摇，class 方法默认保留。`,
    keyPoints: ["ESM 静态结构可分析", "CJS 运行时动态不可摇", "sideEffects 标记副作用"],
    followUps: ["sideEffects 如何配置？", "为什么 class 方法默认不摇？"],
    favorited: false,
  },
  {
    id: "fe-60",
    nodeId: "js-modules",
    question: "模块循环依赖（Circular Dependency）如何处理？ESM 和 CJS 表现有何不同？",
    bigTech: false,
    answer: `循环依赖：A 引用 B，B 又引用 A。CJS 返回已执行部分的导出（可能不全）；ESM 因是引用，可能触发 TDZ（访问未初始化的 let/const）。

\`\`\`js
// CJS 循环：a.js require b.js，b.js require a.js
// a.js
exports.x = 1; require("./b"); exports.y = 2;
// b.js
const a = require("./a"); console.log(a.x, a.y); // 1, undefined（a 未执行完）
// ESM 循环：可能 TDZ
// a.mjs
import { b } from "./b.mjs"; export const a = b + 1; // b 未初始化 → TDZ
// b.mjs
import { a } from "./a.mjs"; export const b = a + 1;
\`\`\`

踩坑：循环依赖是设计缺陷，应重构（提取公共模块/用依赖注入/事件解耦）；CJS 循环拿到的可能是部分导出对象，能跑但有隐患；ESM 循环在函数内访问（延迟到运行时）可避免 TDZ。`,
    keyPoints: ["CJS 返回部分导出", "ESM 循环可能 TDZ", "应重构避免循环"],
    followUps: ["如何检测项目中的循环依赖？", "依赖注入如何解耦循环？"],
    favorited: false,
  },
  {
    id: "fe-61",
    nodeId: "js-modules",
    question: "import.meta 有什么用？如何获取当前模块路径？",
    bigTech: false,
    answer: `import.meta 是 ESM 的元信息对象，包含当前模块信息。import.meta.url 是模块绝对 URL，可用于定位资源、动态导入相对路径。

\`\`\`js
// 获取当前模块 URL
console.log(import.meta.url); // file:///app/src/main.mjs
// 加载相对资源
const worker = new Worker(new URL("./worker.js", import.meta.url));
// Vite 环境变量
if (import.meta.env.DEV) console.log("开发模式");
const api = import.meta.env.VITE_API_URL;
// 动态导入相对路径
const name = "Admin";
const mod = await import(\`./pages/\${name}.js\`);
\`\`\`

踩坑：import.meta 只在 ESM 可用，CJS 用 __filename/__dirname；Vite/Next 用 import.meta.env 注入环境变量（构建时替换）；浏览器原生 ESM 的 import.meta.url 是 http/file URL。`,
    keyPoints: ["import.meta.url 模块绝对路径", "Vite env 注入", "仅 ESM 可用"],
    followUps: ["CJS 如何获取 __dirname？", "Vite 的 import.meta.env 如何定义变量？"],
    favorited: false,
  },
  {
    id: "fe-62",
    nodeId: "js-modules",
    question: "package.json 的 exports 字段如何配置模块导出？",
    bigTech: false,
    answer: `exports 字段定义包的入口映射，控制子路径导出、条件导出（import/require/types）、限制内部路径访问。现代库推荐用 exports 替代 main。

\`\`\`json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": "./dist/utils.js",
    "./package.json": "./package.json"
  }
}
\`\`\`
\`\`\`js
import { foo } from "my-lib";           // 走 "." 的 import
import { bar } from "my-lib/utils";     // 走 "./utils"
import "my-lib/internal";               // 报错（未导出，限制访问）
\`\`\`

踩坑：exports 定义后，未列出的子路径不可访问（封装内部）；types 必须在最前（TypeScript 解析）；条件顺序重要（Node 从上到下匹配）。`,
    keyPoints: ["exports 控制入口映射", "条件导出 import/require/types", "限制内部路径访问"],
    followUps: ["exports 和 main 的优先级？", "如何配置 dual package（CJS+ESM）？"],
    favorited: false,
  },
  {
    id: "fe-63",
    nodeId: "js-modules",
    question: "命名导出和默认导出有什么区别？什么时候用哪个？",
    bigTech: false,
    answer: `命名导出（named）：export const x，导入需 { x }，可多个；默认导出（default）：export default x，导入任意名，每文件一个。库推荐命名导出（可 Tree Shaking、自动补全），组件可用默认。

\`\`\`js
// utils.js
export const add = (a, b) => a + b;   // 命名导出
export default function calc() {}     // 默认导出（每文件一个）
// main.js
import calc, { add } from "./utils";  // 默认在前，命名在后
import { add as plus } from "./utils";// 重命名
import * as Utils from "./utils";     // 全量命名导入
// 默认导出本质：default 命名导出的语法糖
export default 42; // 等价 export const default = 42
\`\`\`

踩坑：默认导出导入时名字任意易写错，命名导出有编译时检查；混用默认+命名降低可读性，团队约定统一；CJS module.exports = x 对应 ESM default 导入。`,
    keyPoints: ["命名导出可多个可摇", "默认导出每文件一个", "库用命名/组件用默认"],
    followUps: ["默认导出如何 Tree Shaking？", "CJS module.exports 对应 ESM 什么导入？"],
    favorited: false,
  },

  // ===== 10. js-api Web API =====
  {
    id: "fe-64",
    nodeId: "js-api",
    question: "如何封装一个健壮的 Fetch 请求库？要处理超时、重试、错误码。",
    bigTech: true,
    answer: `fetch 原生不超时、不拒 4xx、无重试，需封装。核心：AbortController 超时、指数退避重试、统一错误处理、拦截器。

字节内部 request 库封装要点：

\`\`\`js
async function request(url, opts = {}, retries = 3) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout ?? 10000);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (e) {
    if (retries > 0 && isRetryable(e)) {
      await new Promise(r => setTimeout(r, 2 ** (3 - retries) * 1000)); // 指数退避
      return request(url, opts, retries - 1);
    }
    throw e;
  } finally { clearTimeout(timer); }
}
\`\`\`

踩坑：fetch 4xx/5xx 不 reject（只看 res.ok），需手动抛错；超时 abort 后 fetch 请求实际仍发到服务端（只是前端不等了）；401 统一跳登录、403 提示无权限，用拦截器处理。`,
    keyPoints: ["AbortController 超时", "指数退避重试", "fetch 4xx 不 reject 需手动抛"],
    followUps: ["fetch 如何上传进度？", "如何实现请求拦截器？"],
    favorited: false,
  },
  {
    id: "fe-65",
    nodeId: "js-api",
    question: "localStorage、sessionStorage、IndexedDB、Cookie 各自的使用场景？",
    bigTech: false,
    answer: `localStorage：持久化、5-10MB、同步、同源；sessionStorage：标签页会话、关闭清除；IndexedDB：大容量异步 NoSQL、存结构化数据；Cookie：随请求自动带、4KB、用于鉴权。

\`\`\`js
// localStorage：用户偏好/主题（持久）
localStorage.setItem("theme", "dark");
// sessionStorage：临时表单数据（标签页内）
sessionStorage.setItem("draft", JSON.stringify(form));
// IndexedDB：离线大数据（如邮件附件）
const db = await indexedDB.open("mail", 1);
db.onsuccess = () => db.result.transaction("mails", "readwrite").objectStore("mails").add(mail);
// Cookie：鉴权 token（httpOnly 防 XSS）
// httpOnly 只能由服务端通过 Set-Cookie 响应头设置，document.cookie 设置会被浏览器忽略
// 服务端响应示例（如 Express）：
//   HTTP/1.1 200 OK
//   Set-Cookie: token=xxx; Path=/; HttpOnly; Secure; SameSite=Strict
// 前端可读的非敏感 cookie 才能用 document.cookie：
document.cookie = "theme=dark; Path=/; SameSite=Lax";
\`\`\`

踩坑：localStorage 同步会阻塞主线程，大数据用 IndexedDB；Cookie httpOnly 前端读不到（防 XSS 偷 token），需后端设置；localStorage 跨子域不共享，需用 iframe+postMessage 中转或后端。`,
    keyPoints: ["localStorage 持久同步 5MB", "IndexedDB 异步大容量", "Cookie httpOnly 鉴权"],
    followUps: ["localStorage 如何跨域共享？", "Cookie 的 SameSite 各值区别？"],
    favorited: false,
  },
  {
    id: "fe-66",
    nodeId: "js-api",
    question: "Web Worker 的作用和使用场景？有什么限制？",
    bigTech: false,
    answer: `Web Worker 在独立线程执行 JS，不阻塞主线程。限制：不能操作 DOM、不能访问 window、通过 postMessage 通信。场景：大数据计算、图片处理、文件解析。

\`\`\`js
// main.js
const worker = new Worker(new URL("./worker.js", import.meta.url));
worker.postMessage({ data: hugeArray });
worker.onmessage = e => console.log("结果", e.data);
// worker.js
self.onmessage = e => {
  const result = heavyCompute(e.data.data); // 不阻塞 UI
  self.postMessage(result);
};
// 内联 Worker（Blob）
const blob = new Blob([\`onmessage = e => postMessage(e.data * 2)\`], { type: "text/js" });
const w = new Worker(URL.createObjectURL(blob));
\`\`\`

踩坑：Worker 通信是结构化克隆（大数据复制慢），用 Transferable 转移所有权（ArrayBuffer.transfer）；SharedArrayBuffer + Atomics 可共享内存（需 COOP/COEP 头）；Worker 启动有开销，小任务不划算。`,
    keyPoints: ["独立线程不阻塞 UI", "不能操作 DOM", "postMessage 通信 Transferable 转移"],
    followUps: ["Transferable 对象如何零拷贝？", "SharedArrayBuffer 需要什么安全头？"],
    favorited: false,
  },
  {
    id: "fe-67",
    nodeId: "js-api",
    question: "IntersectionObserver 的原理和使用场景？如何实现懒加载？",
    bigTech: true,
    answer: `IntersectionObserver 异步观察元素与视口（或根元素）的交叉状态，进入/离开触发回调。比 scroll 监听性能好（不每帧触发）。场景：图片懒加载、无限滚动、曝光埋点。

美团外卖商品图懒加载，用 IntersectionObserver 替代 scroll 监听后，滚动帧率从 40fps 升到 60fps：

\`\`\`js
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // 真实 src
      io.unobserve(img);         // 加载后停止观察
    }
  });
}, { rootMargin: "200px" }); // 提前 200px 加载
document.querySelectorAll("img[data-src]").forEach(img => io.observe(img));
\`\`\`

踩坑：rootMargin 提前加载避免滚动到才加载的闪烁；threshold 控制触发比例；回调是异步批量（多次交叉合并），性能好；卸载组件要 disconnect。`,
    keyPoints: ["异步观察交叉状态", "比 scroll 性能好", "rootMargin 提前加载"],
    followUps: ["如何用 IntersectionObserver 做曝光埋点？", "root 和 rootMargin 的作用？"],
    favorited: false,
  },
  {
    id: "fe-68",
    nodeId: "js-api",
    question: "MutationObserver 和 ResizeObserver 的使用场景？",
    bigTech: false,
    answer: `MutationObserver 观察 DOM 结构变化（子节点/属性/文本），用于第三方脚本监听、自动高亮、富文本同步。ResizeObserver 观察元素尺寸变化，用于自适应组件、画布缩放。

\`\`\`js
// MutationObserver：监听 DOM 变化（如广告拦截检测）
const mo = new MutationObserver((mutations) => {
  mutations.forEach(m => m.addedNodes.forEach(n => console.log("新增", n)));
});
mo.observe(document.body, { childList: true, subtree: true });
// ResizeObserver：自适应容器（如 ECharts 跟随容器缩放）
const ro = new ResizeObserver(entries => {
  entries.forEach(e => chart.resize({ width: e.contentRect.width }));
});
ro.observe(container);
// 组件卸载清理
useEffect(() => () => { mo.disconnect(); ro.disconnect(); }, []);
\`\`\`

踩坑：MutationObserver 回调是微任务（批量异步），非同步触发；ResizeObserver 在 resize 循环中改尺寸会触发循环报错（loop limit），改尺寸用 requestAnimationFrame 延迟。`,
    keyPoints: ["MutationObserver 监听 DOM 变化", "ResizeObserver 监听尺寸", "回调异步批量"],
    followUps: ["MutationObserver 的回调是宏还是微任务？", "ResizeObserver 报 loop 错怎么办？"],
    favorited: false,
  },
  {
    id: "fe-69",
    nodeId: "js-api",
    question: "postMessage 如何实现跨窗口/iframe 通信？安全注意点？",
    bigTech: false,
    answer: `postMessage 实现跨源窗口/iframe/Worker 通信。发送方 postMessage(data, targetOrigin)，接收方 message 事件监听。安全：必须校验 event.origin 防恶意来源。

\`\`\`js
// 父页面向 iframe 发消息
const iframe = document.querySelector("iframe");
iframe.contentWindow.postMessage({ type: "resize", size: 100 }, "https://child.com");
// iframe 接收
window.addEventListener("message", (e) => {
  if (e.origin !== "https://parent.com") return; // 校验来源！
  if (e.data.type === "resize") handleResize(e.data.size);
  e.source.postMessage({ ok: true }, e.origin); // 回复
});
\`\`\`

踩坑：targetOrigin 用 "*" 不安全（任何源能收到），必须指定具体源；接收方必须校验 origin 和 data 结构（防 XSS 注入）；structuredClone 传递数据（非 JSON），但函数不能传。`,
    keyPoints: ["postMessage 跨源通信", "必须校验 event.origin", "targetOrigin 指定具体源"],
    followUps: ["postMessage 能传递函数吗？", "如何实现 BroadcastChannel 跨标签通信？"],
    favorited: false,
  },
  {
    id: "fe-70",
    nodeId: "js-api",
    question: "Fetch 上传/下载进度如何监听？为什么 fetch 不支持上传进度？",
    bigTech: false,
    answer: `fetch 原生只支持下载进度（response.body 流），不支持上传进度（设计缺陷）。上传进度用 XMLHttpRequest 或 fetch + ReadableStream（实验性）。

\`\`\`js
// 下载进度：读 response.body 流
const res = await fetch(url);
const reader = res.body.getReader();
let received = 0;
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  received += value.length;
  console.log(\`下载 \${received}\`);
}
// 上传进度：用 XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.upload.onprogress = e => console.log(\`上传 \${e.loaded / e.total * 100}%\`);
xhr.open("POST", url); xhr.send(formData);
\`\`\`

踩坑：fetch 上传进度提案尚未普及，生产用 XHR；response.body 是 ReadableStream，需流式读取；大文件上传用分片（slice）+ 并发，断点续传记录已传分片。`,
    keyPoints: ["fetch 支持下载流不支持上传", "上传进度用 XHR", "大文件分片续传"],
    followUps: ["如何实现文件分片上传？", "ReadableStream 如何读取？"],
    favorited: false,
  },

  // ===== 11. ts-types-basic TypeScript 基础类型 =====
  {
    id: "fe-71",
    nodeId: "ts-types-basic",
    question: "interface 和 type 有什么区别？什么时候用哪个？",
    bigTech: true,
    answer: `两者多数场景可互换。区别：interface 支持声明合并（同名自动合并），可被 class implements；type 支持联合/交叉/映射/条件等高级类型。对象形状用 interface，联合/工具类型用 type。

\`\`\`ts
// interface：对象形状、可合并、可 implements
interface User { name: string; }
interface User { age: number; } // 合并：User 有 name+age
class Admin implements User { name = ""; age = 0; }
// type：联合、交叉、工具类型
type Status = "active" | "inactive";
type UserWithRole = User & { role: string };
type Nullable<T> = T | null;
// 推荐：对象用 interface，联合/映射用 type
\`\`\`

踩坑：interface 声明合并可能导致意外合并（库扩展）；type 不能被同名重新声明；团队约定统一，避免混用混乱。`,
    keyPoints: ["interface 可声明合并 / type 不可", "type 支持联合交叉映射", "对象用 interface 联合用 type"],
    followUps: ["interface 声明合并有什么风险？", "type 能 implements 吗？"],
    favorited: false,
  },
  {
    id: "fe-72",
    nodeId: "ts-types-basic",
    question: "泛型的作用是什么？如何约束泛型？",
    bigTech: false,
    answer: `泛型是类型的参数，让函数/接口/类复用且类型安全。约束泛型用 extends 限制范围（必须有某些属性/继承某类型）。

\`\`\`ts
// 泛型函数：保留入参类型
function first<T>(arr: T[]): T { return arr[0]; }
const n = first([1, 2, 3]); // n: number
// 约束泛型：T 必须有 length 属性
function logLength<T extends { length: number }>(x: T): number { return x.length; }
logLength("abc"); // 3
logLength([1, 2]); // 2
// keyof 约束：属性必须存在
function get<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
get({ name: "Tom" }, "name"); // string
\`\`\`

踩坑：泛型默认 any 会丢失类型（应用 unknown 约束）；泛型在箭头函数组件中需 <T,> 或 extends 避免被当 JSX；泛型推断失败时显式传入类型参数。`,
    keyPoints: ["泛型是类型参数复用且安全", "extends 约束泛型范围", "keyof 约束属性键"],
    followUps: ["泛型默认值如何设置？", "箭头函数组件如何写泛型？"],
    favorited: false,
  },
  {
    id: "fe-73",
    nodeId: "ts-types-basic",
    question: "联合类型和交叉类型有什么区别？如何收窄联合类型？",
    bigTech: false,
    answer: `联合类型（|）表示或的关系（值是其中之一），交叉类型（&）表示与的关系（合并所有）。联合类型用类型守卫（typeof/in/instanceof/判别联合）收窄。

\`\`\`ts
// 联合：值是 A 或 B
type Result = { ok: true; data: string } | { ok: false; error: string };
function handle(r: Result) {
  if (r.ok) console.log(r.data);  // 判别联合收窄
  else console.log(r.error);
}
// 交叉：合并 A 和 B
type WithId = { id: number };
type User = WithId & { name: string };
const u: User = { id: 1, name: "Tom" };
// in 守卫
type Cat = { meow: () => void };
type Dog = { bark: () => void };
function speak(p: Cat | Dog) {
  if ("meow" in p) p.meow(); else p.bark();
}
\`\`\`

踩坑：交叉类型同名属性类型冲突变为 never；联合类型只能访问公共属性，需收窄才能访问独有属性；判别联合（discriminated union）用字面量标签收窄最安全。`,
    keyPoints: ["联合 | 或 / 交叉 & 与", "判别联合用标签收窄", "交叉冲突属性变 never"],
    followUps: ["判别联合为什么比普通联合好？", "交叉类型同名冲突怎么办？"],
    favorited: false,
  },
  {
    id: "fe-74",
    nodeId: "ts-types-basic",
    question: "字面量类型和 const 断言有什么用？",
    bigTech: false,
    answer: `字面量类型把值当类型（"active" 作为类型），用于精确约束。const 断言（as const）让推断为字面量类型而非宽泛类型，对象变只读。

\`\`\`ts
// 字面量类型：精确状态值
type Status = "active" | "inactive" | "banned";
function setStatus(s: Status) {}
setStatus("active"); // OK
setStatus("deleted"); // 报错
// const 断言：推断为字面量
const config = { endpoint: "/api", retries: 3 } as const;
// config: { readonly endpoint: "/api"; readonly retries: 3 }
type Config = typeof config; // 字面量类型可用于他处
const arr = [1, 2, 3] as const; // readonly [1, 2, 3]
\`\`\`

踩坑：const 断言让数组变 readonly tuple，不能再 push；对象属性变 readonly 不可改；用于常量配置/枚举替代，比 enum 更轻量（enum 会编译成运行时对象）。`,
    keyPoints: ["字面量类型精确约束值", "as const 推断字面量+只读", "替代 enum 更轻量"],
    followUps: ["as const 和 enum 的区别？", "readonly tuple 和普通数组区别？"],
    favorited: false,
  },
  {
    id: "fe-75",
    nodeId: "ts-types-basic",
    question: "类型断言（as）什么时候用？有什么风险？",
    bigTech: false,
    answer: `类型断言告诉编译器"我知道这个值是这个类型"，绕过检查。用于：DOM 取值、第三方库类型不全、类型推断过宽。风险：编译时不报错但运行时可能错。

\`\`\`ts
// DOM 断言：querySelector 返回 Element，断言为具体类型
const input = document.querySelector("input") as HTMLInputElement;
input.value; // 无需类型守卫
// 双重断言：不相交类型需先转 unknown
const el = ({} as unknown) as HTMLDivElement;
// 非空断言：断言非 null/undefined
const el2 = document.getElementById("app")!; // 跳过 null 检查
// 风险：运行时可能为 null 导致报错
el2.innerHTML; // 若实际为 null 报错
\`\`\`

踩坑：as 不做运行时转换，只骗编译器；非空断言 ! 跳过检查，运行时 null 会崩；优先用类型守卫（if (el)）而非断言，更安全；unknown 是安全的 any，强制收窄后才能用。`,
    keyPoints: ["as 绕过类型检查", "! 非空断言跳过 null 检查", "优先类型守卫更安全"],
    followUps: ["unknown 和 any 的区别？", "如何写自定义类型守卫？"],
    favorited: false,
  },
  {
    id: "fe-76",
    nodeId: "ts-types-basic",
    question: "enum 有什么问题？为什么推荐用联合字面量类型替代？",
    bigTech: false,
    answer: `enum 问题：数值 enum 反向映射（增加代码）、编译成运行时对象（非纯类型）、tree-shaking 困难、const enum 跨包不安全。联合字面量类型是纯类型（零运行时），更轻量。

\`\`\`ts
// 数值 enum：有反向映射，编译成运行时对象
enum Direction { Up, Down }
const d = Direction.Up; // 0
Direction[0]; // "Up"（反向映射，多余代码）
// 字符串 enum：无反向映射，但仍编译成对象
enum Status { Active = "ACTIVE" }
// 推荐：联合字面量类型（零运行时）
type Direction = "Up" | "Down";
type Status = "ACTIVE" | "INACTIVE";
const d: Direction = "Up";
// as const 对象：需运行时值时
const STATUS = { Active: "ACTIVE" } as const;
type Status = typeof STATUS[keyof typeof STATUS];
\`\`\`

踩坑：const enum 跨包导出在 isolatedModules 下编译报错（Babel 不支持）；enum 不能 tree-shake；异构 enum（混合字符串数值）更糟。`,
    keyPoints: ["enum 编译成运行时对象", "数值 enum 有反向映射", "联合字面量零运行时更优"],
    followUps: ["const enum 为什么跨包不安全？", "isolatedModules 对 enum 的影响？"],
    favorited: false,
  },
  {
    id: "fe-77",
    nodeId: "ts-types-basic",
    question: "函数重载如何在 TS 中实现？",
    bigTech: false,
    answer: `TS 函数重载：声明多个签名（无实现），最后一个为实现签名（外部不可见）。调用时按签名顺序匹配，实现内需用类型守卫处理不同参数。

\`\`\`ts
// 重载签名
function pad(value: string, len: number): string;
function pad(value: number, len: number): number;
// 实现签名（不对外可见）
function pad(value: string | number, len: number): string | number {
  if (typeof value === "string") return value.padStart(len, "0");
  return Number(String(value).padStart(len, "0"));
}
const s = pad("5", 3); // string "005"
const n = pad(5, 3);   // number 5（推断正确）
\`\`\`

踩坑：实现签名不算重载，外部看不到（调用方只匹配重载签名）；重载顺序重要，具体在前宽泛在后；箭头函数不能直接重载，需用类型别名声明重载再赋值。`,
    keyPoints: ["多签名+一实现", "实现签名对外不可见", "顺序具体在前"],
    followUps: ["箭头函数如何重载？", "重载和方法重载的区别？"],
    favorited: false,
  },

  // ===== 12. ts-advanced TS 高级类型 =====
  {
    id: "fe-78",
    nodeId: "ts-advanced",
    question: "条件类型如何工作？extends 在条件类型中什么含义？",
    bigTech: true,
    answer: `条件类型 T extends U ? X : Y 根据类型关系选择类型。extends 在此是"可赋值"判断，不是继承。配合 infer 提取类型，分布式条件类型对联合自动分发。

\`\`\`ts
// 基础条件类型
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<"a">; // "yes"
type B = IsString<1>;   // "no"
// 分布式：对联合自动分发
type ToArray<T> = T extends unknown ? T[] : never;
type R = ToArray<string | number>; // string[] | number[]（非 (string|number)[]）
// 阻止分发：用 [T] 包裹
type ToArray2<T> = [T] extends [unknown] ? T[] : never;
type R2 = ToArray2<string | number>; // (string|number)[]
\`\`\`

踩坑：分布式条件类型只对裸类型参数（naked type parameter）分发，用 [T] 包裹阻止；never 在分布式条件类型中被跳过（never extends X 时返回 never 不分发）。`,
    keyPoints: ["T extends U ? X : Y 可赋值判断", "裸参数对联合分布式分发", "[T] 包裹阻止分发"],
    followUps: ["分布式条件类型为什么跳过 never？", "如何阻止条件类型分发？"],
    favorited: false,
  },
  {
    id: "fe-79",
    nodeId: "ts-advanced",
    question: "映射类型是什么？如何用 keyof 遍历对象类型？",
    bigTech: false,
    answer: `映射类型用 [K in keyof T] 遍历对象类型的键，对每个键的值类型做变换。内置工具类型 Partial/Required/Readonly/Pick 都是映射类型的实现。

\`\`\`ts
type User = { name: string; age: number; email?: string };
// Partial：所有属性可选
type PartialUser = { [K in keyof User]?: User[K] };
// Readonly：所有属性只读
type ReadonlyUser = { readonly [K in keyof User]: User[K] };
// 自定义：所有值变函数
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type UserGetters = Getters<User>; // { getName: () => string; getAge: () => number }
// 修饰符增减：-? 移除可选 +? 添加可选
type Required2<T> = { [K in keyof T]-?: T[K] };
\`\`\`

踩坑：映射类型 + as 重映射键名（重命名）；-? 移除可选、-readonly 移除只读；映射类型是同态的（保留修饰符），除非显式改。`,
    keyPoints: ["[K in keyof T] 遍历键", "as 重映射键名", "-?/-readonly 移除修饰符"],
    followUps: ["Partial 的实现原理？", "as 重映射如何过滤键？"],
    favorited: false,
  },
  {
    id: "fe-80",
    nodeId: "ts-advanced",
    question: "infer 关键字如何使用？如何提取函数返回值/参数类型？",
    bigTech: true,
    answer: `infer 在条件类型的 extends 子句中声明类型变量，"推断"并提取类型。常用于提取函数参数/返回值、Promise 值、数组元素等。

\`\`\`ts
// 提取函数返回值类型
type Return<T> = T extends (...args: any[]) => infer R ? R : never;
type R = Return<() => string>; // string
// 提取函数第一个参数类型
type FirstParam<T> = T extends (a: infer A, ...rest: any[]) => any ? A : never;
type P = FirstParam<(x: number, y: string) => void>; // number
// 提取 Promise 值类型（递归）
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
type V = Awaited<Promise<Promise<number>>>; // number
// 提取数组元素类型
type Item<T> = T extends (infer I)[] ? I : never;
type E = Item<string[]>; // string
\`\`\`

踩坑：infer 在同一 extends 中可多次出现（提取多个位置）；递归 infer 处理嵌套（如 Promise<Promise<T>>）；infer 提取的可能是联合（多个重载签名）。`,
    keyPoints: ["infer 在 extends 中推断类型", "提取返回值/参数/Promise 值", "递归 infer 处理嵌套"],
    followUps: ["infer 如何提取构造函数实例类型？", "多个 infer 如何协同？"],
    favorited: false,
  },
  {
    id: "fe-81",
    nodeId: "ts-advanced",
    question: "请实现 Partial、Required、Pick、Omit、Record 工具类型。",
    bigTech: false,
    answer: `这些都是映射类型的应用。Partial 加 ?，Required 去 ?，Pick 选键，Omit 排键，Record 构造键值对。

\`\`\`ts
type User = { name: string; age: number; email?: string };
// Partial：所有可选
type MyPartial<T> = { [K in keyof T]?: T[K] };
// Required：所有必选（-? 移除可选）
type MyRequired<T> = { [K in keyof T]-?: T[K] };
// Pick：选指定键
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type NameOnly = MyPick<User, "name">; // { name: string }
// Omit：排除指定键（Pick + Exclude）
type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
type NoName = MyOmit<User, "name">; // { age: number; email?: string }
// Record：构造键值对
type MyRecord<K extends keyof any, V> = { [P in K]: V };
type Roles = MyRecord<"admin" | "user", number>; // { admin: number; user: number }
\`\`\`

踩坑：Omit 用 Pick+Exclude 实现，keyof any = string|number|symbol；Record 的键可以是联合；Required 的 -? 对本来就必选的无影响。`,
    keyPoints: ["映射类型实现工具", "Pick+Exclude 实现 Omit", "keyof any 限键类型"],
    followUps: ["Exclude 和 Extract 的实现？", "Record 的键为什么是 keyof any？"],
    favorited: false,
  },
  {
    id: "fe-82",
    nodeId: "ts-advanced",
    question: "什么是类型体操？请实现 DeepPartial 和 DeepReadonly。",
    bigTech: true,
    answer: `类型体操是用条件/映射/递归类型解决复杂类型问题。DeepPartial 递归让所有嵌套属性可选，DeepReadonly 递归让所有嵌套只读。

\`\`\`ts
// DeepPartial：递归可选
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
type Config = { db: { host: string; port: number }; cache: boolean };
type PartialConfig = DeepPartial<Config>; // { db?: { host?: string; port?: number }; cache?: boolean }
// DeepReadonly：递归只读
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
// 判断是函数/数组不要递归（避免过度）
type DeepReadonly2<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly2<T[K]> }
  : T;
\`\`\`

踩坑：递归类型对函数/数组需特殊处理（函数不该 readonly，数组应变 readonly tuple 还是保持数组）；TS 递归深度有限（约 50 层），过深报错；用 as const 替代 DeepReadonly 更简单。`,
    keyPoints: ["递归映射实现深度变换", "函数/数组特殊处理", "TS 递归深度有限"],
    followUps: ["如何实现 Mutable（移除只读）？", "递归类型为什么有深度限制？"],
    favorited: false,
  },
  {
    id: "fe-83",
    nodeId: "ts-advanced",
    question: "模板字面量类型有什么用？如何实现路径参数提取？",
    bigTech: false,
    answer: `模板字面量类型用 \`\${Type}\` 拼接类型，配合 infer 提取字符串部分。用于 API 路径、CSS 属性、事件名等字符串模式约束。

\`\`\`ts
// 路由路径参数提取
type ExtractParams<S> = S extends \`\${infer Start}/:\${infer Param}/\${infer Rest}\`
  ? { [K in Param | keyof ExtractParams<\`/\${Rest}\`>]: string }
  : S extends \`\${infer Start}/:\${infer Param}\`
  ? { [K in Param]: string }
  : {};
type P = ExtractParams<"/users/:userId/posts/:postId">;
// { userId: string; postId: string }
// CSS 属性
type Margin = \`margin\${"" | "Top" | "Bottom" | "Left" | "Right"}\`;
// 事件名转换
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type Click = EventName<"click">; // "onClick"
\`\`\`

踩坑：模板字面量递归提取复杂字符串需小心终止条件；Capitalize/Uncapitalize 是内置工具；字符串类型太长影响编译性能。`,
    keyPoints: ["模板字面量拼接类型", "infer 提取字符串", "Capitalize 转换"],
    followUps: ["如何实现 SQL 语句类型解析？", "模板字面量性能如何？"],
    favorited: false,
  },
  {
    id: "fe-84",
    nodeId: "ts-advanced",
    question: "自定义类型守卫（Type Guard）如何写？和断言有什么区别？",
    bigTech: false,
    answer: `类型守卫是返回类型谓词（x is Type）的函数，让编译器在 if 块内收窄类型。比断言安全（运行时真检查），比 typeof/in 更灵活（自定义逻辑）。

\`\`\`ts
// 自定义守卫：判断是否是 Error
function isError(x: unknown): x is Error {
  return x instanceof Error;
}
try { throw new Error("boom"); }
catch (e: unknown) {
  if (isError(e)) console.log(e.message); // 收窄为 Error
}
// 判别对象形状
interface Fish { swim: () => void }
interface Bird { fly: () => void }
function isFish(p: Fish | Bird): p is Fish {
  return "swim" in p;
}
// 断言函数（asserts）
function assertNonNull<T>(x: T): asserts x is NonNullable<T> {
  if (x == null) throw new Error("null");
}
\`\`\`

踩坑：守卫返回值必须真实反映判断（写错守卫会导致类型不安全）；asserts 关键字声明断言函数（不返回抛错即通过）；unknown 比 any 安全，强制守卫收窄后才能用。`,
    keyPoints: ["x is Type 类型谓词", "运行时真检查比断言安全", "asserts 声明断言函数"],
    followUps: ["asserts 和 is 的区别？", "unknown 为什么比 any 安全？"],
    favorited: false,
  },

  // ===== 13. react-core React 核心 =====
  {
    id: "fe-85",
    nodeId: "react-core",
    question: "JSX 的本质是什么？它会被编译成什么？",
    bigTech: true,
    answer: `JSX 是 React.createElement 的语法糖，编译后变成描述 UI 的 JS 对象（虚拟 DOM 元素）。Babel/SWC 把 <div x={1}/> 转成 createElement("div", {x:1})。

\`\`\`jsx
// JSX
const el = <h1 className="title" onClick={fn}>Hello {name}</h1>;
// 编译后
const el = React.createElement("h1", { className: "title", onClick: fn }, "Hello ", name);
// 新版自动 runtime（无需 import React）
import { jsx as _jsx } from "react/jsx-runtime";
const el = _jsx("h1", { className: "title", onClick: fn, children: ["Hello ", name] });
// 虚拟 DOM 对象
{ type: "h1", props: { className: "title", children: ["Hello ", name] } }
\`\`\`

踩坑：组件名必须大写（小写当 HTML 标签）；children 是 props.children；key 是特殊 prop 不传给组件；新版 jsx-runtime 自动注入无需 import React。`,
    keyPoints: ["JSX 是 createElement 语法糖", "编译成虚拟 DOM 对象", "组件名大写"],
    followUps: ["jsx-runtime 为什么不需要 import React？", "key 为什么不进 props？"],
    favorited: false,
  },
  {
    id: "fe-86",
    nodeId: "react-core",
    question: "受控组件和非受控组件的区别？如何选择？",
    bigTech: true,
    answer: `受控组件：值由 React state 控制，onChange 同步更新 state（数据源单一）。非受控：值由 DOM 管理，用 ref 读取（像传统 HTML）。默认用受控，集成第三方/性能敏感用非受控。

\`\`\`jsx
// 受控：值绑定 state
function Controlled() {
  const [val, setVal] = useState("");
  return <input value={val} onChange={e => setVal(e.target.value)} />;
}
// 非受控：ref 读取
function Uncontrolled() {
  const ref = useRef(null);
  const submit = () => console.log(ref.current.value);
  return <input defaultValue="" ref={ref} />;
}
\`\`\`

踩坑：受控组件每次输入触发 re-render，大表单性能差，可用 debounce 或非受控；defaultValue 仅非受控初始值；file input 必须非受控（值只读）。`,
    keyPoints: ["受控值绑 state / 非受控 ref 读", "默认受控", "file input 必须非受控"],
    followUps: ["大表单如何优化受控性能？", "defaultValue 和 value 区别？"],
    favorited: false,
  },
  {
    id: "fe-87",
    nodeId: "react-core",
    question: "Props 和 State 的区别？什么时候用 Props 什么时候用 State？",
    bigTech: false,
    answer: `Props 是父传子的只读数据（外部传入），State 是组件内部可变状态（自己管理）。Props 变化触发重渲染，State 用 setState 更新。能从父计算的不放子 state（单一数据源）。

\`\`\`jsx
// Props：父控制
function Greeting({ name }) { return <h1>Hi {name}</h1>; }
<Greeting name="Tom" />
// State：自管理
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
// 反模式：把 props 复制到 state（数据源双份，不同步）
function Bad({ initial }) {
  const [val, setVal] = useState(initial); // initial 变了 val 不更新
}
\`\`\`

踩坑：props 复制到 state 是经典 bug（initial 变了 state 不更新）；state 更新异步，用函数式 setCount(c=>c+1) 避免批处理竞态；派生数据用 useMemo 计算而非存 state。`,
    keyPoints: ["Props 外部只读 / State 内部可变", "props 别复制到 state", "派生数据用 useMemo"],
    followUps: ["为什么 state 更新是异步的？", "如何同步外部变化到 state？"],
    favorited: false,
  },
  {
    id: "fe-88",
    nodeId: "react-core",
    question: "React 的 key 有什么作用？为什么不能用 index 做 key？",
    bigTech: true,
    answer: `key 是 diff 时识别列表项身份的标识。key 不变 React 复用 DOM（保留状态），key 变则卸载重建。用 index 做 key 在增删时导致状态错乱和性能下降。

\`\`\`jsx
// 差：index 做 key，删除第一项后所有项 key 错位，状态串了
{items.map((item, i) => <Item key={i} data={item} />)}
// 删除 items[0] 后，原 items[1] 变 key=0，复用了 items[0] 的 DOM 和 state
// 好：用稳定唯一 id
{items.map(item => <Item key={item.id} data={item} />)}
\`\`\`

字节直播间礼物列表曾用 index 做 key，删除首个礼物后动画串到下一个，改成 id 后修复。踩坑：key 只需兄弟间唯一不需全局唯一；key 变化会触发卸载挂载（input 失焦）；静态不变列表用 index 影响小但仍不推荐。`,
    keyPoints: ["key 识别列表项身份", "index 做 key 增删导致状态错乱", "用稳定唯一 id"],
    followUps: ["key 变化会触发什么生命周期？", "静态列表能用 index 做 key 吗？"],
    favorited: false,
  },
  {
    id: "fe-89",
    nodeId: "react-core",
    question: "React 合成事件和原生事件有什么区别？为什么要合成？",
    bigTech: false,
    answer: `合成事件是 React 包装原生事件的跨浏览器统一事件对象。React17+ 事件委托到根容器（旧版委托到 document），统一冒泡机制、池化优化（旧版）、兼容性。

\`\`\`jsx
function Comp() {
  const handleClick = (e) => {
    e.target;        // 原生 target
    e.nativeEvent;   // 原生事件对象
    e.stopPropagation(); // 合成事件阻止冒泡
  };
  return <button onClick={handleClick}>click</button>;
}
// 原生事件：addEventListener
useEffect(() => {
  const fn = (e) => {};
  ref.current.addEventListener("click", fn);
  return () => ref.current.removeEventListener("click", fn);
}, []);
\`\`\`

踩坑：合成事件旧版有池化（异步访问 e.target 为 null，需 e.persist()），17+ 移除池化；合成和原生混用 stopPropagation 不互通（各自冒泡链）；React17+ 委托根容器，多个根互不影响。`,
    keyPoints: ["合成事件包装原生统一", "17+ 委托根容器", "合成原生 stopPropagation 不互通"],
    followUps: ["React17 事件委托为什么从 document 改根容器？", "事件池是什么？"],
    favorited: false,
  },
  {
    id: "fe-90",
    nodeId: "react-core",
    question: "React 的 Reconciliation（协调）算法是怎样的？",
    bigTech: false,
    answer: `Reconciliation 是 diff 算法，对比新旧虚拟 DOM 树决定最小更新。核心假设：同层比较、type 变则销毁重建、key 标识同层项身份。O(n) 复杂度。

\`\`\`jsx
// type 不同：销毁旧树建新树（连同 state）
<div>{cond ? <A /> : <B />}</div> // 切换时 A 卸载 B 挂载，state 不保留
// type 相同 key 相同：复用，更新 props
{items.map(i => <Item key={i.id} v={i.v} />)}
// 跨层移动：React 不跨层 diff，会重建
\`\`\`

踩坑：条件渲染切换不同 type 组件会丢 state（需同 type 或提升 state）；列表顺序变化用 key 让 React 复用而非重建；diff 只同层比较，跨层移动会重建（性能差）。Fiber 后可中断分片渲染。`,
    keyPoints: ["同层比较 O(n)", "type 变销毁重建", "key 标识身份复用"],
    followUps: ["为什么 React 不做跨层 diff？", "Fiber 如何让 diff 可中断？"],
    favorited: false,
  },
  {
    id: "fe-91",
    nodeId: "react-core",
    question: "类组件的生命周期有哪些？对应 Hooks 怎么写？",
    bigTech: false,
    answer: `挂载：constructor→getDerivedStateFromProps→render→componentDidMount。更新：shouldComponentUpdate→render→getSnapshotBeforeUpdate→componentDidUpdate。卸载：componentWillUnmount。

\`\`\`jsx
class C extends React.Component {
  componentDidMount() { this.load(); }           // useEffect(()=>{...},[])
  componentDidUpdate(prev) { if(prev.id!==this.props.id) this.load(); } // useEffect(()=>{...},[id])
  componentWillUnmount() { this.clear(); }       // useEffect(()=>()=>clear(),[])
  shouldComponentUpdate(nextProps) { return !shallowEqual(this.props, nextProps); } // React.memo
}
// 函数组件等价
function C({ id }) {
  useEffect(() => { load(); return () => clear(); }, [id]);
}
\`\`\`

踩坑：getDerivedStateFromProps 易误用（派生 state 反模式），优先用 key 重置或 useMemo；componentWillMount/componentWillReceiveProps 已废弃（不安全）；useEffect 清理函数对应卸载。`,
    keyPoints: ["挂载/更新/卸载三阶段", "useEffect 等价 didMount/didUpdate/willUnmount", "废弃 will* 生命周期"],
    followUps: ["getDerivedStateFromProps 为什么是反模式？", "useEffect 如何模拟 shouldComponentUpdate？"],
    favorited: false,
  },
  // ===== 14. react-hooks React Hooks =====
  {
    id: "fe-92",
    nodeId: "react-hooks",
    question: "useEffect 的依赖数组有什么作用？依赖陷阱怎么避免？",
    bigTech: true,
    answer: `依赖数组决定 effect 何时重新执行：无数组每次渲染执行，空数组只挂载执行一次，有依赖则依赖变化时执行。陷阱：漏写依赖导致闭包读到旧值，过写依赖导致死循环。

\`\`\`jsx
// 陷阱：漏依赖，count 读到旧值
useEffect(() => { setInterval(() => console.log(count), 1000); }, []); // count 永远 0
// 修复：加依赖，但每次重建定时器
useEffect(() => {
  const t = setInterval(() => console.log(count), 1000);
  return () => clearInterval(t); // 清理
}, [count]);
// 只关心最新值：用 ref 或函数式更新
const ref = useRef(count); ref.current = count;
useEffect(() => { setInterval(() => console.log(ref.current), 1000); }, []);
\`\`\`

踩坑：ESLint exhaustive-deps 规则强制补全依赖；函数/对象依赖每次新建会死循环，用 useCallback/useMemo 稳定；effect 内异步要处理清理（卸载后 setState 警告）。`,
    keyPoints: ["依赖变才重执行 effect", "漏依赖读旧值", "exhaustive-deps 强制补全"],
    followUps: ["useEffect 死循环怎么排查？", "exhaustive-deps 规则原理？"],
    favorited: false,
  },
  {
    id: "fe-93",
    nodeId: "react-hooks",
    question: "useState 的函数式更新什么时候用？为什么推荐？",
    bigTech: false,
    answer: `函数式更新 setCount(c => c + 1) 基于最新 state 计算，避免批处理和闭包导致的竞态。连续多次更新时，函数式确保每次基于前一次结果。

\`\`\`jsx
// 差：基于闭包旧值，连续点击只 +1
function Bad() {
  const [c, setC] = useState(0);
  return <button onClick={() => { setC(c + 1); setC(c + 1); }}>{c}</button>; // 只 +1
}
// 好：函数式，每次基于最新
function Good() {
  const [c, setC] = useState(0);
  return <button onClick={() => { setC(x => x + 1); setC(x => x + 1); }}>{c}</button>; // +2
}
// 异步回调中尤其重要：闭包捕获旧 c
useEffect(() => {
  const t = setTimeout(() => setC(c + 1), 1000); // 闭包 c 是旧的
  // 改 setC(x => x + 1) 更安全
}, []);
\`\`\`

踩坑：批处理下 setC(c+1) 多次只生效一次（同值合并）；函数式更新不会触发额外渲染（同值跳过）；异步回调（定时器/事件）中闭包 c 是定义时的值，用函数式或 ref。`,
    keyPoints: ["函数式基于最新 state", "避免批处理竞态", "异步回调必用函数式"],
    followUps: ["React 批处理是什么？", "setCount 同值会重渲染吗？"],
    favorited: false,
  },
  {
    id: "fe-94",
    nodeId: "react-hooks",
    question: "useMemo 和 useCallback 的区别？什么时候用什么时候不用？",
    bigTech: true,
    answer: `useMemo 缓存计算结果（值），useCallback 缓存函数引用。用途：避免子组件无谓重渲染（配合 React.memo）、避免昂贵重算。但缓存本身有开销，简单场景不用。

\`\`\`jsx
// useMemo：缓存昂贵计算
const sorted = useMemo(() => heavySort(list), [list]);
// useCallback：缓存函数引用，传给 memo 子组件
const handleClick = useCallback(() => doSomething(id), [id]);
return <MemoChild onClick={handleClick} />; // handleClick 引用稳定，子不重渲染
// 反模式：简单值/函数缓存比计算还贵
const val = useMemo(() => a + b, [a, b]); // 加法比 useMemo 开销小，不该用
\`\`\`

踩坑：useMemo 不保证缓存（React 可丢弃重建），不能用作语义保证；过度使用增加心智负担和内存；React Compiler（实验）未来自动 memo，手动 memo 可能多余。`,
    keyPoints: ["useMemo 缓存值 / useCallback 缓存函数引用", "配合 React.memo 避免子重渲染", "简单场景不用避免反效果"],
    followUps: ["React.memo 的浅比较原理？", "React Compiler 如何自动优化？"],
    favorited: false,
  },
  {
    id: "fe-95",
    nodeId: "react-hooks",
    question: "useRef 除了引用 DOM 还有什么用途？",
    bigTech: false,
    answer: `useRef 创建跨渲染保持的可变引用，修改不触发重渲染。用途：引用 DOM、保存最新值（绕过闭包）、存定时器/实例、跨渲染保持状态但不渲染。

\`\`\`jsx
// 1. 引用 DOM
const inputRef = useRef(null);
useEffect(() => inputRef.current?.focus(), []);
// 2. 保存最新值（绕闭包）
const latest = useRef(props.value);
latest.current = props.value; // 每次更新
useEffect(() => { setInterval(() => console.log(latest.current), 1000); }, []);
// 3. 存定时器
const timerRef = useRef();
useEffect(() => { timerRef.current = setInterval(fn, 1000); return () => clearInterval(timerRef.current); }, []);
// 4. 标记是否首次渲染
const first = useRef(true);
useEffect(() => { if (first.current) { first.current = false; return; } fn(); }, [dep]);
\`\`\`

踩坑：ref.current 修改不触发渲染，UI 不更新（要渲染用 state）；ref 在 render 阶段不要读写（应在 effect/事件中）；forwardRef 转发 ref 给子组件。`,
    keyPoints: ["跨渲染可变引用不触发渲染", "DOM/最新值/定时器/标记", "render 阶段不读写 ref"],
    followUps: ["useRef 和 useState 区别？", "forwardRef 如何转发 ref？"],
    favorited: false,
  },
  {
    id: "fe-96",
    nodeId: "react-hooks",
    question: "如何自定义 Hook？自定义 Hook 的设计原则？",
    bigTech: false,
    answer: `自定义 Hook 是以 use 开头的函数，内部调用其他 Hook，封装可复用逻辑。原则：单一职责、返回值清晰（数组或对象）、依赖透传、命名 use 开头。

\`\`\`jsx
// 封装数据请求逻辑
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(url).then(r => r.json()).then(d => { if (active) { setData(d); setError(null); } })
      .catch(e => { if (active) setError(e); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; }; // 防卸载后 setState
  }, [url]);
  return { data, loading, error };
}
// 使用
const { data, loading } = useFetch("/api/user");
\`\`\`

踩坑：自定义 Hook 每次调用独立 state（不是共享），共享状态用 Context；Hook 必须在顶层调用（不能条件/循环）；返回对象比数组更易扩展（加字段不破坏解构）。`,
    keyPoints: ["use 开头封装复用逻辑", "单一职责依赖透传", "返回对象易扩展"],
    followUps: ["自定义 Hook 如何共享状态？", "Hook 为什么不能条件调用？"],
    favorited: false,
  },
  {
    id: "fe-97",
    nodeId: "react-hooks",
    question: "useReducer 和 useState 的区别？什么时候用 useReducer？",
    bigTech: false,
    answer: `useState 适合独立简单状态，useReducer 适合相关联/复杂状态逻辑（多字段联动/状态机）。useReducer 把状态转移逻辑集中到 reducer，便于测试和追踪。

\`\`\`jsx
// useState：简单独立状态
const [count, setCount] = useState(0);
// useReducer：复杂关联状态
function formReducer(state, action) {
  switch (action.type) {
    case "setField": return { ...state, [action.field]: action.value };
    case "reset": return initialState;
    case "submit": return { ...state, submitting: true };
    default: return state;
  }
}
const [state, dispatch] = useReducer(formReducer, initialState);
dispatch({ type: "setField", field: "name", value: "Tom" });
\`\`\`

踩坑：reducer 必须纯函数（无副作用）；状态逻辑复杂或下一状态依赖前一状态用 useReducer 更清晰；useReducer + Context 可替代轻量 Redux；dispatch 引用稳定不进依赖。`,
    keyPoints: ["useState 简单 / useReducer 复杂关联", "reducer 集中状态转移", "dispatch 引用稳定"],
    followUps: ["useReducer 如何配合 Context？", "reducer 为什么必须纯函数？"],
    favorited: false,
  },
  {
    id: "fe-98",
    nodeId: "react-hooks",
    question: "Hooks 的闭包陷阱是什么？如何解决？",
    bigTech: false,
    answer: `闭包陷阱：effect/回调捕获了渲染时的 state，异步执行时读到旧值。原因：每次渲染创建新闭包，effect 闭包绑定那次渲染的值。

\`\`\`jsx
// 陷阱：定时器闭包读到旧 count
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setInterval(() => console.log(count), 1000); // count 永远 0
    return () => clearInterval(t);
  }, []); // 漏依赖
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
// 解决一：函数式更新
setInterval(() => setCount(c => { console.log(c); return c; }), 1000);
// 解决二：useRef 存最新值
const latest = useRef(count); latest.current = count;
setInterval(() => console.log(latest.current), 1000);
\`\`\`

踩坑：闭包陷阱在 useEffect/useCallback/setTimeout 中常见；ESLint exhaustive-deps 能发现漏依赖；ref 方案适合不触发渲染的场景。`,
    keyPoints: ["effect 闭包绑定渲染时值", "函数式更新/ref 解决", "exhaustive-deps 发现漏依赖"],
    followUps: ["为什么 useEffect 闭包读旧值？", "useRef 如何绕过闭包？"],
    favorited: false,
  },
  {
    id: "fe-211",
    nodeId: "react-hooks",
    question: "React 19 的 use() 是什么？和普通 Hook 有什么区别？",
    bigTech: true,
    answer: `use() 是 React 19 引入的新 API，在渲染中直接读取 Promise 或 Context 的值。最大特点：它不是传统 Hook——可以在条件分支、循环中调用，不受"Hook 必须在顶层"规则约束。

\`\`\`tsx
// 读 Promise：配合 Suspense，Promise pending 时组件挂起
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // resolve 后拿到值
  return comments.map(c => <Comment key={c.id} {...c} />);
}
// 上层用 Suspense 包裹，父组件可在服务端创建 Promise 传入
<Suspense fallback={<Spinner />}>
  <Comments commentsPromise={fetchComments()} />
</Suspense>
// 读 Context：可条件调用（useContext 做不到）
function Button({ theme }) {
  if (theme === "auto") {
    const ctx = use(ThemeContext); // 条件分支里调用也合法
    return <button className={ctx.mode}>…</button>;
  }
  return <button className={theme}>…</button>;
}
\`\`\`

踩坑：use() 读 Promise 要求 Promise 在渲染间稳定（每次渲染新建 Promise 会导致重复挂起，应由服务端组件/缓存创建）；客户端组件中 use() 的 Promise 建议配合缓存（如 React 的 cache()）；use() 替代了部分 useContext 场景，但订阅高频变化的状态仍用 useSyncExternalStore。顺带：React 19 配套的 React Compiler（自动记忆化）逐步落地后，useMemo/useCallback 手写优化大量场景可省略，但 use() 的语义不受其影响。`,
    keyPoints: ["渲染中读 Promise/Context", "可在条件/循环中调用", "配合 Suspense 挂起", "Promise 需跨渲染稳定"],
    followUps: ["use() 和 useContext 如何选？", "React Compiler 带来什么变化？"],
    favorited: false,
  },
  // ===== 15. react-patterns React 模式 =====
  {
    id: "fe-99",
    nodeId: "react-patterns",
    question: "HOC（高阶组件）的原理和使用场景？有什么缺点？",
    bigTech: true,
    answer: `HOC 是接收组件返回新组件的函数，用于逻辑复用（如鉴权、数据注入、埋点）。缺点：嵌套地狱、props 来源不透明、ref 转发麻烦、displayName 调试难。现代多用 Hooks 替代。

\`\`\`jsx
// HOC：鉴权拦截
function withAuth(Wrapped) {
  return function Authed(props) {
    const { user } = useAuth();
    if (!user) return <Login />;
    return <Wrapped {...props} user={user} />;
  };
}
const Dashboard = withAuth(({ user }) => <h1>Hi {user.name}</h1>);
// ref 转发需 forwardRef
function withLog(Wrapped) {
  return forwardRef((props, ref) => {
    useEffect(() => console.log("mounted"));
    return <Wrapped {...props} ref={ref} />;
  });
}
\`\`\`

踩坑：HOC 不要在 render 内创建（每次新组件会卸载重挂丢 state）；props 命名冲突（HOC 和原组件同名 prop）；复制静态方法（hoist-non-react-statics）。Hooks 已能替代多数 HOC。`,
    keyPoints: ["HOC 接组件返组件复用逻辑", "嵌套地狱/props 不透明", "现代用 Hooks 替代"],
    followUps: ["HOC 如何转发 ref？", "HOC 和 Hooks 哪个更好？"],
    favorited: false,
  },
  {
    id: "fe-100",
    nodeId: "react-patterns",
    question: "Render Props 模式是什么？和 HOC 对比？",
    bigTech: false,
    answer: `Render Props 通过 prop（常叫 render/children）传函数动态渲染，实现逻辑复用。比 HOC 直观（props 来源清晰），但回调嵌套多了也乱。现代多用 Hooks 替代。

\`\`\`jsx
// Render Props：鼠标位置复用
function Mouse({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
    {children(pos)}
  </div>;
}
// 使用
<Mouse>{({ x, y }) => <span>{x},{y}</span>}</Mouse>
// HOC 等价
function withMouse(Wrapped) {
  return (props) => <Mouse>{pos => <Wrapped {...props} pos={pos} />}</Mouse>;
}
\`\`\`

踩坑：Render Props 的函数每次新建导致 React.memo 失效（需 useCallback）；pureComponent 中 render prop 函数变化触发重渲染；Hooks 把这类逻辑收敛到 useMouse()，无嵌套。`,
    keyPoints: ["render prop 传函数动态渲染", "props 来源比 HOC 清晰", "现代用 Hooks 替代"],
    followUps: ["Render Props 为什么会让 memo 失效？", "children as function 的问题？"],
    favorited: false,
  },
  {
    id: "fe-101",
    nodeId: "react-patterns",
    question: "Compound Components（复合组件）模式如何实现？",
    bigTech: true,
    answer: `复合组件：父组件通过 Context 共享状态，子组件声明式组合（如 Select>Option/Tabs>Tab）。用户写起来像 HTML 嵌套自然，内部状态自动联动。

\`\`\`jsx
// Tabs 复合组件
const TabsCtx = createContext();
function Tabs({ children, defaultIndex }) {
  const [active, setActive] = useState(defaultIndex);
  return <TabsCtx.Provider value={{ active, setActive }}>{children}</TabsCtx.Provider>;
}
function TabList({ children }) { return <div role="tablist">{children}</div>; }
function Tab({ index, children }) {
  const { active, setActive } = useContext(TabsCtx);
  return <button role="tab" aria-selected={active === index} onClick={() => setActive(index)}>{children}</button>;
}
// 使用：声明式，状态自动联动
<Tabs defaultIndex={0}>
  <TabList><Tab index={0}>A</Tab><Tab index={1}>B</Tab></TabList>
</Tabs>
\`\`\`

踩坑：子组件必须作为父组件静态属性（Tabs.Tab）方便使用；Context 默认值要防未包裹 Provider 误用；compound 模式常见于 antd/MUI 等组件库。`,
    keyPoints: ["Context 共享状态子组件组合", "声明式像 HTML 嵌套", "状态自动联动"],
    followUps: ["Compound 如何限制子组件类型？", "Context 默认值的作用？"],
    favorited: false,
  },
  {
    id: "fe-102",
    nodeId: "react-patterns",
    question: "Context 的性能问题是什么？如何优化？",
    bigTech: true,
    answer: `Context 值变化时所有消费该 Context 的组件都重渲染，即使只用了部分字段。优化：拆分 Context（按字段）、用 selector（use-context-selector）、value 用 useMemo 稳定。

\`\`\`jsx
// 问题：value 每次新建对象，所有 Consumer 重渲染
const Ctx = createContext();
function Provider({ children }) {
  const [user, setUser] = useState({});
  const [theme, setTheme] = useState("light");
  return <Ctx.Provider value={{ user, theme, setUser, setTheme }}>{children}</Ctx.Provider>;
  // value 每次新建，user 变了 theme 消费者也重渲染
}
// 优化：拆分 Context
const UserCtx = createContext(); const ThemeCtx = createContext();
<UserCtx.Provider value={user}><ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider></UserCtx.Provider>
// value 用 useMemo 稳定
<Ctx.Provider value={useMemo(() => ({ user, setUser }), [user])}>
\`\`\`

踩坑：Context value 是对象时每次新建触发所有 Consumer 重渲染，用 useMemo 稳定；拆 Context 让无关字段不互相影响；高频更新场景考虑 Zustand 等外部 store + selector。`,
    keyPoints: ["Context 值变所有 Consumer 重渲染", "拆 Context / useMemo 稳定 value", "selector 精确订阅"],
    followUps: ["use-context-selector 库解决什么？", "Context 和 Redux 性能差异？"],
    favorited: false,
  },
  {
    id: "fe-103",
    nodeId: "react-patterns",
    question: "如何抽离自定义 Hook 复用逻辑？什么逻辑适合抽 Hook？",
    bigTech: false,
    answer: `适合抽 Hook 的逻辑：跨组件复用的状态/副作用（数据请求、表单、媒体查询、本地存储）、无 UI 的纯逻辑。原则：单一职责、返回稳定引用、参数化。

\`\`\`jsx
// 复用：本地存储同步
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}
// 复用：媒体查询
function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatch(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return match;
}
\`\`\`

踩坑：Hook 返回函数用 useCallback 稳定引用（防 Consumer 重渲染）；Hook 不要返回过多字段（用对象解构）；跨页面复用的逻辑优先抽 Hook 而非复制。`,
    keyPoints: ["复用状态/副作用/纯逻辑", "单一职责返回稳定引用", "参数化通用化"],
    followUps: ["Hook 如何做单元测试？", "Hook 复用和组件复用的边界？"],
    favorited: false,
  },
  {
    id: "fe-104",
    nodeId: "react-patterns",
    question: "Provider 嵌套过深怎么解决？",
    bigTech: false,
    answer: `多个 Provider 嵌套（Theme/Auth/Toast/Query）导致 JSX 嵌套地狱。解决：组合 Provider 函数（compose）、按需 Provider、用单一 store（Zustand）替代多 Context。

\`\`\`jsx
// 嵌套地狱
<App>
  <ThemeProvider><AuthProvider><ToastProvider><QueryProvider><Router><Page /></Router></QueryProvider></ToastProvider></AuthProvider></ThemeProvider>
</App>
// 优化：compose 函数
function compose(...providers) {
  return ({ children }) => providers.reduceRight((acc, [P, props]) => <P {...props}>{acc}</P>, children);
}
const Providers = compose(
  [ThemeProvider, { theme }],
  [AuthProvider],
  [ToastProvider],
  [QueryProvider, { client }],
);
<Providers><App /></Providers>
\`\`\`

踩坑：Provider 顺序影响优先级（后包的覆盖先包的）；多个 Context 可合并成一个 store（如 Zustand）减少嵌套；Next.js 用 layout.tsx 自动包裹 Provider 更清晰。`,
    keyPoints: ["compose 组合 Provider 减嵌套", "单一 store 替代多 Context", "Provider 顺序影响优先级"],
    followUps: ["Zustand 如何替代多个 Context？", "Next.js layout 如何管理 Provider？"],
    favorited: false,
  },
  {
    id: "fe-105",
    nodeId: "react-patterns",
    question: "什么是控制反转（Inversion of Control）？在 React 中如何体现？",
    bigTech: false,
    answer: `控制反转：把"做什么"的控制权交给调用方，组件只提供"机制"。React 中体现：render props/children 传函数、依赖注入（Context 传实现）、Hook 注入逻辑。

\`\`\`jsx
// 控制反转：List 只管遍历，渲染交给调用方
function List({ items, renderItem }) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}
// 调用方决定渲染
<List items={users} renderItem={u => <UserCard user={u} />} />
// 依赖注入：Context 传数据获取实现
const FetchCtx = createContext(fetch);
function useFetch() { return useContext(FetchCtx); }
// 测试时注入 mock fetch
<FetchCtx.Provider value={mockFetch}><Comp /></FetchCtx.Provider>
\`\`\`

踩坑：控制反转提升灵活性但增加调用方心智负担；children as function 是常见 IoC；依赖注入便于测试（mock 替换实现），但过度抽象难追踪数据流。`,
    keyPoints: ["组件提供机制调用方决定内容", "render props/Context 注入", "便于测试 mock"],
    followUps: ["依赖注入如何便于测试？", "IoC 何时过度抽象？"],
    favorited: false,
  },
  // ===== 16. react-concurrent React 并发与 SSR =====
  {
    id: "fe-106",
    nodeId: "react-concurrent",
    question: "React Fiber 架构解决了什么问题？时间切片如何工作？",
    bigTech: true,
    answer: `Fiber 把渲染工作拆成可中断/恢复的单元（fiber 节点链表），让大渲染任务能分片到多帧执行，避免长时间阻塞主线程。时间切片：React 的 Scheduler 包给每个工作循环约 5ms 预算（scheduler 内部的 yieldInterval，由 MessageChannel 调度，非浏览器 API），到期 shouldYield() 返回 true 让出主线程，下轮宏任务继续。

\`\`\`jsx
// Fiber 前：递归渲染不可中断，大列表卡 100ms 掉帧
// Fiber 后：可中断恢复，帧率保持 60fps
// 每个 fiber 节点有 child/sibling/return 指针形成链表
{
  type: "div", key: null, stateNode: domEl,
  child: fiberA, sibling: fiberB, return: parentFiber,
  pendingProps: {}, memoizedState: {}, flags: 0,
}
// 调度：shouldYield() 检查 5ms 预算到期则让出（scheduler 内部实现）
while (nextUnitOfWork && !shouldYield()) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
}
\`\`\`

踩坑：5ms 是 React Scheduler 的默认预算常量而非规范要求，实现细节可能调整；Fiber 让 useTransition/useDeferredValue 成为可能；中断恢复需处理优先级（lane 模型），被高优先级打断后已做的 render 工作可能作废重做（所以渲染必须纯，重复执行无副作用）；fiber 节点是内部实现，业务代码不应直接操作。`,
    keyPoints: ["Fiber 可中断恢复渲染", "Scheduler 5ms 预算（MessageChannel 调度）", "打断后 render 可能重做（须纯）", "fiber 链表 child/sibling/return"],
    followUps: ["lane 优先级模型是什么？", "Fiber 如何处理中断恢复的状态？"],
    favorited: false,
  },
  {
    id: "fe-107",
    nodeId: "react-concurrent",
    question: "Suspense 如何用于数据获取？原理是什么？",
    bigTech: false,
    answer: `Suspense 让组件"挂起"等待异步数据，React 捕获 throw promise 后显示 fallback，数据就绪后恢复渲染。配合 React.lazy 做代码分割，配合数据库/Relay 做数据获取。

\`\`\`jsx
// 代码分割：lazy 组件加载时显示 fallback
const Admin = React.lazy(() => import("./Admin"));
<Suspense fallback={<Spinner />}><Admin /></Suspense>;
// 数据获取（实验性）：组件 throw promise
function fetchUser(id) {
  let cache;
  return function User() {
    if (!cache) {
      cache = fetch(\`/api/\${id}\`).then(r => r.json())
        .then(d => { cache.value = d; });
      throw cache; // 挂起，Suspense 显示 fallback
    }
    if (!cache.value) throw cache;
    return <div>{cache.value.name}</div>;
  };
}
\`\`\`

踩坑：Suspense 数据获取需库支持（Relay/SWR 新版/AI SDK），手写 throw promise 是底层机制；多个 Suspense 嵌套，最近的捕获挂起；Suspense 不能捕获事件回调中的异步。`,
    keyPoints: ["组件 throw promise 挂起", "Suspense 显示 fallback", "配合 lazy/数据库"],
    followUps: ["Suspense 如何配合 React Query？", "Suspense 边界如何设置？"],
    favorited: false,
  },
  {
    id: "fe-108",
    nodeId: "react-concurrent",
    question: "React Server Components（RSC）的原理、优势与代价？",
    bigTech: true,
    answer: `RSC 在服务端渲染成序列化描述发送到客户端，不发送组件代码（零 JS），可直接访问后端资源。客户端组件（"use client"）可水合交互。优势：减少 bundle、直接查 DB、流式渲染。

代价与心智成本：缓存复杂度上升——服务端渲染结果、数据请求、路由缓存多层叠加（如 Next.js 的 Full Route Cache / Data Cache / Router Cache），失效策略设计不当会出现"页面不更新"的疑难问题；心智模型分裂——同文件体系下 Server/Client 组件规则不同（能否用 hook、能否传函数 props），团队需要适应；服务端渲染错误调试链路更长（日志在服务端）；不适用场景：纯交互密集应用（仪表盘/编辑器，几乎全部组件都要 "use client"，RSC 收益趋零）、已有成熟 CSR+API 架构且无 SEO/首屏压力的项目，引入 RSC 的复杂度可能大于收益。

\`\`\`tsx
// Server Component（默认）：服务端执行，不进 bundle
async function ProductList() {
  const products = await db.query("SELECT * FROM products"); // 直连 DB
  return products.map(p => <Product key={p.id} {...p} />); // 传给客户端组件
}
// Client Component：需交互加 "use client"
"use client";
function AddToCart({ id }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
// 组合：Server 查数据，Client 做交互
<ProductList /> // 内部渲染 <AddToCart />
\`\`\`

踩坑：Server 组件不能用 useState/onClick（无客户端 JS）；Client 组件不能 async（需 useEffect）；Server→Client 边界需 props 序列化（不能传函数/类实例）；缓存层多（路由/数据/渲染结果），改数据后看不到更新先查缓存失效；Next.js App Router 默认 RSC。`,
    keyPoints: ["RSC 服务端渲染零 JS", "直连 DB 减 bundle", "use client 划边界", "多层缓存与不适用场景"],
    followUps: ["RSC 和 SSR 的区别？", "Server/Client 组件边界如何划分？"],
    favorited: false,
  },
  {
    id: "fe-109",
    nodeId: "react-concurrent",
    question: "Streaming SSR（流式服务端渲染）如何工作？",
    bigTech: false,
    answer: `Streaming SSR 把 HTML 分块流式发送，先发框架和已就绪部分，慢部分用 Suspense 占位，就绪后流式追加。优势：首字节更快、慢数据不阻塞快内容、渐进式水合。

\`\`\`jsx
// Next.js App Router 自动流式 SSR
export default function Page() {
  return (
    <div>
      <Header /> {/* 立即发送 */}
      <Suspense fallback={<Spinner />}>
        <SlowChart /> {/* 数据慢，先发 Spinner，就绪后流式追加 */}
      </Suspense>
      <Footer /> {/* 立即发送 */}
    </div>
  );
}
// 原理：renderToPipeableStream 分块输出
// <div><Header/><template id="B:1"><Spinner/></template><Footer/>...
// 数据就绪后：流式发送 <div hidden>替换内容</div> + 脚本替换 placeholder
\`\`\`

踩坑：Streaming 需配合选择性水合（Selective Hydration），Suspense 边界决定分块；SEO 上流式内容最终完整（爬虫等流结束）；React18 的 hydrateRoot 支持流式水合。`,
    keyPoints: ["分块流式发送 HTML", "Suspense 占位慢部分", "首字节更快渐进水合"],
    followUps: ["选择性水合是什么？", "Streaming SSR 对 SEO 影响？"],
    favorited: false,
  },
  {
    id: "fe-110",
    nodeId: "react-concurrent",
    question: "useTransition 和 useDeferredValue 的区别和场景？",
    bigTech: false,
    answer: `useTransition 标记某次 state 更新为低优先级（不阻塞高优先级如输入）。useDeferredValue 延迟某个值的传递（值滞后更新）。两者都让重渲染不阻塞交互。

\`\`\`jsx
// useTransition：输入即时更新（高优先级），列表关键词延迟更新（低优先级）
function Search() {
  const [query, setQuery] = useState("");
  const [listQuery, setListQuery] = useState(""); // 独立的列表 state
  const [isPending, startTransition] = useTransition();
  return <>
    <input
      value={query}
      onChange={e => {
        setQuery(e.target.value);                        // 高优先级：输入立即回显
        startTransition(() => setListQuery(e.target.value)); // 低优先级：列表后更新
      }}
    />
    {isPending && <Spinner />}
    <List query={listQuery} />
  </>;
}
// useDeferredValue：列表渲染用延迟值
function List({ query }) {
  const deferred = useDeferredValue(query);
  const items = useMemo(() => filter(deferred), [deferred]);
  return items.map(i => <Item key={i.id} />);
}
\`\`\`

踩坑：useTransition 包裹 setState（主动降级），useDeferredValue 包装读到的值（被动延迟）；isPending 显示加载态；低优先级更新可被高优先级打断重做。`,
    keyPoints: ["useTransition 主动降级更新", "useDeferredValue 被动延迟值", "不阻塞高优先级交互"],
    followUps: ["useTransition 的 isPending 如何用？", "并发更新如何被高优先级打断？"],
    favorited: false,
  },
  {
    id: "fe-111",
    nodeId: "react-concurrent",
    question: "React 并发渲染有哪些陷阱？什么场景不该开并发？",
    bigTech: false,
    answer: `并发模式陷阱：渲染必须纯（无副作用）、effect 依赖正确、外部 store 需用 useSyncExternalStore（防 tearing）。不该开：依赖渲染副作用、第三方 store 未适配。

\`\`\`jsx
// 陷阱一：渲染中改外部变量（非纯）
function Bad() {
  window.title = "x"; // 渲染副作用，并发下可能多次/不执行
  return <div />;
}
// 陷阱二：外部 store tearing（不同组件读到不同值）
// 修复：useSyncExternalStore
function useStore(subscribe, getSnapshot) {
  return useSyncExternalStore(subscribe, getSnapshot);
}
// 陷阱三：effect 漏依赖，并发下执行时机变
useEffect(() => { sync(value); }, []); // 并发下可能延迟执行读到错值
\`\`\`

踩坑：并发模式要求渲染纯函数（无副作用、不依赖可变外部）；第三方状态库（Redux 旧版）需 useSyncExternalStore 适配防撕裂；createRoot 开启并发，旧 ReactDOM.render 不支持。`,
    keyPoints: ["渲染必须纯无副作用", "useSyncExternalStore 防 tearing", "effect 依赖必须正确"],
    followUps: ["tearing（撕裂）是什么？", "useSyncExternalStore 如何防撕裂？"],
    favorited: false,
  },
  {
    id: "fe-112",
    nodeId: "react-concurrent",
    question: "React 的 lane 优先级模型是什么？",
    bigTech: false,
    answer: `lane 是 32 位二进制表示的优先级，不同位段代表不同优先级等级。多个更新可同时调度，高优先级可打断低优先级。比旧的 expirationTime 模型更细粒度（支持并行多优先级）。

\`\`\`js
// lane 模型（简化）
const SyncLane = 0b0001;        // 同步最高（如 onClick）
const InputLane = 0b0010;       // 输入
const TransitionLane = 0b0100;  // 过渡（useTransition）
const IdleLane = 0b1000;        // 空闲最低
// 多 lane 可并存：0b0110 表示 Input + Transition
// 调度时按优先级处理，高优先级打断低优先级重做
\`\`\`

踩坑：lane 让并发更新成为可能（同一组件可有多个未完成更新）；过渡更新被打断后丢弃中间结果重做；业务代码不直接操作 lane，通过 useTransition 等 API 间接控制。`,
    keyPoints: ["lane 32 位优先级", "多优先级并行调度", "高优先级打断低优先级"],
    followUps: ["lane 和 expirationTime 区别？", "Offscreen lane 是什么？"],
    favorited: false,
  },
  {
    id: "fe-212",
    nodeId: "react-concurrent",
    question: "React 19 的 Actions、useActionState、useOptimistic 解决什么问题？",
    bigTech: true,
    answer: `Actions 是 React 19 的表单/变更抽象：传给 <form action={fn}> 的函数自动获得 pending 状态、错误处理、并发管理（底层跑在 transition 里），提交期间旧 UI 保持可交互。useActionState 把 action 的返回结果接回组件状态；useOptimistic 在变更未完成前先展示"乐观结果"，失败自动回滚。

\`\`\`tsx
// useActionState：表单提交状态机
function UpdateName({ userId }) {
  const [error, submitAction, isPending] = useActionState(
    async (prevError, formData) => {
      const err = await updateUser(userId, formData.get("name"));
      return err ?? null; // 返回值成为新 state
    },
    null // 初始 state
  );
  return (
    <form action={submitAction}>
      <input name="name" />
      <button disabled={isPending}>保存</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
// useOptimistic：先显示新值，失败回滚
function LikeButton({ count }) {
  const [optimistic, addOptimistic] = useOptimistic(count, (c, n) => c + n);
  return (
    <form action={async () => { addOptimistic(1); await like(); }}>
      <button>{optimistic} 赞</button>
    </form>
  );
}
\`\`\`

踩坑：Actions 内更新跑在 transition 中，pending 期不阻塞输入；useOptimistic 值必须与真实 state 同源（真实值回来后乐观值自动被覆盖）；服务端场景配合 Server Functions（"use server"）可直接调后端逻辑。React Compiler 普及后手写 memo 减少，但 Actions 这套变更语义仍需自己设计。`,
    keyPoints: ["form action 自动 pending/错误/transition", "useActionState 接回提交结果", "useOptimistic 乐观更新自动回滚"],
    followUps: ["useOptimistic 失败如何回滚？", "Server Functions 和 Actions 如何配合？"],
    favorited: false,
  },
  // ===== 17. vue-core Vue 核心 =====
  {
    id: "fe-113",
    nodeId: "vue-core",
    question: "Vue3 的响应式原理是什么？和 Vue2 有什么区别？",
    bigTech: false,
    answer: `Vue3 用 Proxy 拦截对象的 get/set/delete，递归代理嵌套，依赖收集（track）和触发更新（trigger）。Vue2 用 Object.defineProperty 只能代理已声明属性，需 $set 添加。

\`\`\`js
// Vue3 简化原理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key); // 收集依赖
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
}
\`\`\`

踩坑：Proxy 能监听新增/删除属性（Vue2 不能需 $set）；Proxy 不代理原始值（ref 用 .value 包装）；Map/Set 需特殊处理（Vue3 已内置）。`,
    keyPoints: ["Vue3 Proxy / Vue2 defineProperty", "track 收集 trigger 触发", "Proxy 监听新增删除"],
    followUps: ["ref 和 reactive 区别？", "Proxy 为什么不能代理原始值？"],
    favorited: false,
  },
  {
    id: "fe-114",
    nodeId: "vue-core",
    question: "Vue 模板编译成什么？渲染函数如何工作？",
    bigTech: false,
    answer: `Vue 模板编译成渲染函数（h 函数/createElement），运行时执行渲染函数生成虚拟 DOM，diff 后更新真实 DOM。编译时还能做静态提升/补丁标记优化。

\`\`\`js
// 模板
// <div :id="id">{{ msg }}</div>
// 编译成渲染函数
function render() {
  return h("div", { id: id.value }, msg.value);
}
// Vue3 编译优化：静态节点提升（hoistStatic）
const _hoisted = createVNode("div", null, "静态"); // 提到 render 外只创建一次
function render() { return createVNode("div", null, [_hoisted, msg.value]); }
// 补丁标记：动态节点标记 dynamicProps，diff 时只比动态部分
\`\`\`

踩坑：模板比手写 h 函数多了编译优化（静态提升/补丁标记/块树）；v-if/v-for 编译成三元/循环；render 函数灵活但失去编译优化，能用模板优先用模板。`,
    keyPoints: ["模板编译成渲染函数", "静态提升/补丁标记优化", "模板比手写 h 快"],
    followUps: ["Vue3 块树（Block Tree）是什么？", "静态提升如何优化？"],
    favorited: false,
  },
  {
    id: "fe-115",
    nodeId: "vue-core",
    question: "Vue 的常用指令有哪些？v-if 和 v-show 的区别？",
    bigTech: false,
    answer: `v-if 条件渲染（真假销毁重建），v-show 切换 display（始终保留 DOM）。频繁切换用 v-show，条件少变用 v-if。v-for 遍历，v-model 双向绑定，v-on 事件，v-bind 属性。

\`\`\`html
<!-- v-if：false 时 DOM 不存在 -->
<div v-if="show">内容</div>
<!-- v-show：false 时 display:none，DOM 仍在 -->
<div v-show="show">内容</div>
<!-- v-for 必须加 key -->
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
<!-- v-model：双向绑定（本质 :value + @input） -->
<input v-model="text" />
\`\`\`

踩坑：v-if 和 v-for 不要同用（v-if 优先级高读不到 v-for 变量），用 computed 过滤；v-show 初始渲染成本高（都建 DOM），切换成本低；v-model 在组件上需 modelValue + update:modelValue。`,
    keyPoints: ["v-if 销毁重建 / v-show display 切换", "频繁切换用 v-show", "v-for 必须加 key"],
    followUps: ["v-model 自定义组件如何实现？", "v-for 和 v-if 为什么不能同用？"],
    favorited: false,
  },
  {
    id: "fe-116",
    nodeId: "vue-core",
    question: "Vue 组件通信有哪些方式？",
    bigTech: false,
    answer: `父子：props/emit、ref（父调子方法）。跨层：provide/inject。全局：Pinia/Vuex、EventBus（mitt 库）。模板引用：$refs。复杂场景用状态管理。

\`\`\`js
// 父子：props + emit
const props = defineProps(["modelValue"]); // 返回 props 对象，不是组件
const emit = defineEmits(["update:modelValue"]);
emit("update:modelValue", newVal);
// 跨层：provide/inject
const Parent = { provide: { theme: "dark" } };
const Child = { inject: ["theme"] };
// 事件总线：mitt 库（Vue3 移除了 $on/$emit）
import mitt from "mitt";
const bus = mitt();
bus.emit("login", user); bus.on("login", handler);
// 状态管理：Pinia
const useStore = defineStore("user", () => {
  const user = ref(null);
  return { user };
});
\`\`\`

踩坑：provide/inject 不是响应式默认（传 ref 才响应式）；EventBus 难追踪调试，大项目用 Pinia；Vue3 移除了实例 $on/$emit/$off，用 mitt 替代。`,
    keyPoints: ["父子 props/emit", "跨层 provide/inject", "全局 Pinia"],
    followUps: ["provide/inject 如何响应式？", "Pinia 和 Vuex 区别？"],
    favorited: false,
  },
  {
    id: "fe-117",
    nodeId: "vue-core",
    question: "computed 和 watch/watchEffect 的区别？",
    bigTech: false,
    answer: `computed 计算属性（有缓存、依赖不变不重算、返回值）；watch 侦听某值变化执行副作用（无返回值、可异步）；watchEffect 自动收集依赖立即执行。

\`\`\`js
// computed：有缓存，依赖不变返回缓存值
const fullName = computed(() => \`\${first.value} \${last.value}\`);
// watch：显式侦听，变化才执行，可拿新旧值
watch(count, (newVal, oldVal) => { saveToServer(newVal); }, { immediate: true });
// watchEffect：自动收集依赖，立即执行一次
watchEffect(() => { document.title = count.value; }); // 自动追踪 count
\`\`\`

踩坑：computed 必须纯函数（无副作用），副作用用 watch；computed 缓存基于依赖变化（依赖是响应式才缓存）；watch 监听对象需 deep:true 或用 getter 函数返回属性。`,
    keyPoints: ["computed 缓存纯计算", "watch 副作用拿新旧值", "watchEffect 自动依赖立即执行"],
    followUps: ["computed 缓存如何失效？", "watch 的 deep 和 immediate 区别？"],
    favorited: false,
  },
  {
    id: "fe-118",
    nodeId: "vue-core",
    question: "Vue 的生命周期有哪些？Composition API 怎么写？",
    bigTech: false,
    answer: `挂载：onBeforeMount→onMounted。更新：onBeforeUpdate→onUpdated。卸载：onBeforeUnmount→onUnmounted。调试：onErrorCaptured。

\`\`\`js
import { onMounted, onUnmounted, onUpdated } from "vue";
setup() {
  onMounted(() => { console.log("挂载"); startTimer(); });
  onUpdated(() => { console.log("更新"); });
  onUnmounted(() => { clearInterval(timer); }); // 清理
}
\`\`\`

踩坑：onMounted 中 DOM 才就绪可操作；onUpdated 内别改 state（可能死循环）；onUnmounted 必须清理副作用（定时器/事件/订阅）；keep-alive 用 onActivated/onDeactivated。`,
    keyPoints: ["挂载/更新/卸载三阶段", "onMounted DOM 就绪", "onUnmounted 清理副作用"],
    followUps: ["keep-alive 的生命周期？", "onUpdated 内改 state 会死循环吗？"],
    favorited: false,
  },
  {
    id: "fe-119",
    nodeId: "vue-core",
    question: "v-for 的 key 有什么作用？和 React key 区别？",
    bigTech: false,
    answer: `Vue 的 key 用于 diff 时识别节点身份，key 不变复用（保留状态），key 变重建。和 React 类似，但 Vue 的 diff 是双端比较+最长递增子序列优化。

\`\`\`html
<!-- 差：index 做 key，增删时状态错乱 -->
<li v-for="(item, i) in list" :key="i">{{ item.name }}<input /></li>
<!-- 好：稳定 id -->
<li v-for="item in list" :key="item.id">{{ item.name }}<input /></li>
\`\`\`

踩坑：Vue3 的 diff 用最长递增子序列（LIS）减少 DOM 移动，比 Vue2 双端更优；key 必须稳定唯一（兄弟间）；用 index 做 key 输入框状态会串（和 React 一样）。`,
    keyPoints: ["key 识别节点身份复用", "Vue3 LIS 优化 diff", "index 做 key 状态错乱"],
    followUps: ["Vue3 LIS diff 比 Vue2 强在哪？", "key 和 ref 的区别？"],
    favorited: false,
  },
  // ===== 18. vue-advanced Vue 进阶 =====
  {
    id: "fe-120",
    nodeId: "vue-advanced",
    question: "Composition API 相比 Options API 有什么优势？",
    bigTech: true,
    answer: `Composition API 把相关逻辑聚合（不再分散到 data/methods/computed），逻辑复用更简单（自定义 Hook），TS 支持更好。Options API 按 option 分类，逻辑分散。

\`\`\`js
// Options API：鼠标逻辑分散在 data/methods/mounted
export default {
  data() { return { x: 0, y: 0 }; },
  methods: { handleMove(e) { this.x = e.clientX; this.y = e.clientY; } },
  mounted() { window.addEventListener("mousemove", this.handleMove); },
  unmounted() { window.removeEventListener("mousemove", this.handleMove); },
};
// Composition API：逻辑聚合，易抽 useMouse()
function useMouse() {
  const x = ref(0); const y = ref(0);
  const handle = e => { x.value = e.clientX; y.value = e.clientY; };
  onMounted(() => window.addEventListener("mousemove", handle));
  onUnmounted(() => window.removeEventListener("mousemove", handle));
  return { x, y };
}
\`\`\`

踩坑：Composition API 逻辑复用比 mixin 直观（无命名冲突/来源不清）；setup 语法糖 <script setup> 更简洁；老项目可混用，新项目优先 Composition。`,
    keyPoints: ["逻辑聚合不分散", "自定义 Hook 复用清晰", "TS 支持更好"],
    followUps: ["Composition 和 mixin 复用的区别？", "script setup 语法糖优势？"],
    favorited: false,
  },
  {
    id: "fe-121",
    nodeId: "vue-advanced",
    question: "Teleport 组件的作用和使用场景？",
    bigTech: false,
    answer: `Teleport 把组件渲染到 DOM 树其他位置（如 body），脱离父级样式/层级约束。场景：弹窗/通知/全屏遮罩（避免被父级 overflow/transform/z-index 影响）。

\`\`\`html
<!-- 弹窗渲染到 body，不受父级 overflow:hidden 影响 -->
<Teleport to="body">
  <div class="modal" v-if="show">
    <h2>标题</h2>
    <slot />
  </div>
</Teleport>
<!-- 多个传送目标 -->
<Teleport :to="target" :disabled="!teleport">
  <Tooltip />
</Teleport>
\`\`\`

踩坑：Teleport 的内容仍是组件子树（props/emit 正常）；disabled 可关闭传送回原位；样式作用域（scoped）仍按原组件位置，需用 :deep 或全局样式。`,
    keyPoints: ["Teleport 渲染到指定 DOM", "弹窗脱离父级约束", "仍是组件子树"],
    followUps: ["Teleport 的 scoped 样式如何处理？", "Teleport 和 React Portal 区别？"],
    favorited: false,
  },
  {
    id: "fe-122",
    nodeId: "vue-advanced",
    question: "Vue 的 Suspense 如何处理异步组件？",
    bigTech: false,
    answer: `Vue Suspense 包裹异步组件，加载时显示 fallback，就绪后显示内容。异步组件用 defineAsyncComponent 或 async setup。

\`\`\`html
<Suspense>
  <template #default>
    <AsyncComp /> <!-- 异步加载 -->
  </template>
  <template #fallback>
    <Spinner />
  </template>
</Suspense>
\`\`\`
\`\`\`js
// 异步组件
const AsyncComp = defineAsyncComponent(() => import("./Heavy.vue"));
// async setup（实验性）
async function setup() {
  const data = await fetchData(); // Suspense 显示 fallback
  return { data };
}
\`\`\`

踩坑：Suspense 是实验性 API（Vue3 仍标注）；async setup 错误需用 onErrorCaptured 捕获；多个异步组件嵌套 Suspense，最近的捕获。`,
    keyPoints: ["Suspense 包裹异步组件", "fallback 加载态", "async setup 实验性"],
    followUps: ["Suspense 如何捕获异步错误？", "defineAsyncComponent 配置项？"],
    favorited: false,
  },
  {
    id: "fe-123",
    nodeId: "vue-advanced",
    question: "Vue3 的编译优化有哪些？为什么比 Vue2 快？",
    bigTech: false,
    answer: `Vue3 编译优化：静态提升（静态节点提到 render 外）、补丁标记（动态节点标记只比动态部分）、块树（Block Tree 收集动态节点）、缓存事件处理器。

\`\`\`js
// 静态提升：静态节点只创建一次
const _hoisted = createVNode("div", null, "静态");
// 补丁标记：动态属性标记
createVNode("div", { id: dynamicId }, text, 8 /* PROPS */, ["id"]);
// diff 时只比较 id 这个动态属性，跳过静态
// 块树：根节点收集所有动态子节点，diff 时直接遍历动态数组（非全树）
\`\`\`

踩坑：手写 render 函数失去编译优化，能用模板优先；block 树在结构稳定时高效，频繁结构变化退化；Vue3 比 Vue2 快约 1.3-2 倍（编译+运行时双重优化）。`,
    keyPoints: ["静态提升/补丁标记", "块树收集动态节点", "模板比手写 h 快"],
    followUps: ["块树什么时候退化？", "Vue3 比 Vue2 快多少？"],
    favorited: false,
  },
  {
    id: "fe-124",
    nodeId: "vue-advanced",
    question: "Vue3.4+ 的 defineModel 如何简化双向绑定？",
    bigTech: false,
    answer: `defineModel 是宏，自动声明 modelValue prop 和 update:modelValue emit，子组件直接赋值即触发更新，替代手写 props+emit。

\`\`\`js
// 旧写法：手写 props + emit
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
const update = (v) => emit("update:modelValue", v);
// 新写法：defineModel 一行搞定
const model = defineModel(); // 自动双向绑定
model.value = newVal; // 直接赋值触发更新
// 多 v-model
const first = defineModel("firstName");
const last = defineModel("lastName");
\`\`\`

踩坑：defineModel 是编译宏（无需 import）；多 v-model 用具名 defineModel("name")；父组件用 v-model:firstName 语法。`,
    keyPoints: ["defineModel 自动声明双向绑定", "替代手写 props+emit", "支持多 v-model"],
    followUps: ["defineModel 如何处理修饰符？", "defineModel 和 v-model 区别？"],
    favorited: false,
  },
  {
    id: "fe-125",
    nodeId: "vue-advanced",
    question: "provide/inject 如何做响应式和类型安全？",
    bigTech: false,
    answer: `provide/inject 默认非响应式（传普通值）。响应式：传 ref/reactive 或用 readonly 包裹防子组件直接改。类型安全：用 InjectionKey 携带类型。

\`\`\`js
import { provide, inject, ref, readonly, type InjectionKey } from "vue";
// 类型安全的 key
const userKey: InjectionKey<{ name: string }> = Symbol();
// 父：provide 响应式只读
const user = ref({ name: "Tom" });
provide(userKey, readonly(user));
// 子：inject 拿到带类型的响应式
const user = inject(userKey); // 类型自动推断 Ref<readonly {name}>
// 工厂函数封装
function useProvideUser() {
  const user = ref(null);
  provide(userKey, readonly(user));
  return { user }; // 父能改，子只读
}
\`\`\`

踩坑：inject 找不到返回 undefined，可设默认值 inject(key, defaultFn)；子组件不应直接改 inject 的值（单向数据流），用 readonly 防；跨层传递用 provide/inject，跨页面用 Pinia。`,
    keyPoints: ["传 ref 才响应式", "readonly 防子组件直改", "InjectionKey 类型安全"],
    followUps: ["inject 默认值如何设置？", "provide/inject 和 Pinia 怎么选？"],
    favorited: false,
  },
  {
    id: "fe-126",
    nodeId: "vue-advanced",
    question: "Vue 自定义渲染器能做什么？如何实现？",
    bigTech: false,
    answer: `自定义渲染器把虚拟 DOM 渲染到非 DOM 目标（Canvas/WebGL/SSR/原生）。createRenderer 传入节点操作 API（创建/插入/删除/属性），返回自定义的 render 函数。

\`\`\`js
import { createRenderer } from "@vue/runtime-core";
// Canvas 渲染器
const renderer = createRenderer({
  createElement(type) { return { type, children: [] }; },
  insert(child, parent) { parent.children.push(child); },
  remove(el) { /* 从父移除 */ },
  patchProp(el, key, prev, next) { el[key] = next; },
  // ... 其他节点操作
});
renderer.createApp(App).mount(canvas); // 挂载到 Canvas
\`\`\`

踩坑：自定义渲染器用于跨端（如 vue-native 渲染到原生组件）；DOM 渲染器是默认实现 createApp；实现要处理完整节点生命周期（创建/挂载/更新/卸载/属性/事件）。`,
    keyPoints: ["createRenderer 传入节点操作", "渲染到非 DOM 目标", "DOM 是默认渲染器"],
    followUps: ["如何实现 Canvas 渲染器？", "自定义渲染器和跨端框架关系？"],
    favorited: false,
  },
  // ===== 19. state-mgmt 状态管理 =====
  {
    id: "fe-127",
    nodeId: "state-mgmt",
    question: "Redux Toolkit 相比 Redux 解决了什么问题？核心 API？",
    bigTech: true,
    answer: `Redux 痛点：样板代码多、异步需中间件、不可变更新繁琐。RTK 用 createSlice 自动生成 reducer/actions、内置 Immer 不可变更新、createAsyncThunk 处理异步、RTK Query 数据获取。

\`\`\`js
import { createSlice, configureStore } from "@reduxjs/toolkit";
const counter = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    // Immer：可直接"修改"state（实际生成新对象）
    inc: (state) => { state.value += 1; },
    add: (state, action) => { state.value += action.payload; },
  },
});
const store = configureStore({ reducer: { counter: counter.reducer } });
// dispatch 自动生成的 action
store.dispatch(counter.actions.inc());
\`\`\`

踩坑：Immer 的"可变"写法只对 createReducer/createSlice 内有效；异步用 createAsyncThunk + extraReducers；selector 用 createSelector 做 memoization 防重算。`,
    keyPoints: ["createSlice 自动生成 actions/reducer", "Immer 不可变更新", "createAsyncThunk 异步"],
    followUps: ["Immer 如何实现可变写不可变？", "RTK Query 和 React Query 区别？"],
    favorited: false,
  },
  {
    id: "fe-128",
    nodeId: "state-mgmt",
    question: "Zustand 相比 Redux 有什么优势？什么时候选 Zustand？",
    bigTech: true,
    answer: `Zustand 极简：无 Provider、无 boilerplate、可直接修改、selector 精确订阅。适合中小项目或不想用 Redux 模板的项目。Redux 适合大型团队需严格约束和中间件生态。

\`\`\`js
import { create } from "zustand";
const useStore = create((set, get) => ({
  count: 0,
  user: null,
  inc: () => set(s => ({ count: s.count + 1 })),
  setUser: (u) => set({ user: u }),
}));
// 使用：selector 精确订阅（只 count 变才重渲染）
const count = useStore(s => s.count);
const inc = useStore(s => s.inc);
// 无需 Provider 包裹
function App() { return <Counter />; }
\`\`\`

踩坑：selector 返回新对象每次不同会死循环，用 shallow 比较或拆字段；时间旅行调试可通过官方 devtools 中间件接入 Redux DevTools（import { devtools } from "zustand/middleware"，create(devtools(...))），并非完全没有；中间件生态（persist/immer/devtools）够用。字节飞书部分模块用 Zustand 替代 Redux 减少模板。`,
    keyPoints: ["无 Provider 极简", "selector 精确订阅", "适合中小项目"],
    followUps: ["Zustand selector 返回新对象怎么办？", "Zustand 如何持久化？"],
    favorited: false,
  },
  {
    id: "fe-129",
    nodeId: "state-mgmt",
    question: "Jotai 的原子化状态模型是什么？和 Redux 区别？",
    bigTech: false,
    answer: `Jotai 把状态拆成原子（atom），组件订阅所需原子，原子变化只重渲染订阅者。Redux 是单一 store 树，组件 selector 订阅。Jotai 适合细粒度状态，Redux 适合全局结构化。

\`\`\`js
import { atom, useAtom } from "jotai";
// 原子：最小状态单元
const countAtom = atom(0);
const doubleAtom = atom(get => get(countAtom) * 2); // 派生原子
// 组件订阅
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count} {double}</button>;
}
\`\`\`

踩坑：派生 atom 自动 memo（依赖变才重算）；atom 可写（set）或只读（get）；Jotai 适合表单/可视化等细粒度场景，全局共享用 Zustand 更简单。`,
    keyPoints: ["atom 原子化细粒度", "派生 atom 自动 memo", "只订阅相关原子"],
    followUps: ["Jotai 派生 atom 如何缓存？", "Jotai 和 Recoil 区别？"],
    favorited: false,
  },
  {
    id: "fe-130",
    nodeId: "state-mgmt",
    question: "XState 状态机解决什么问题？什么场景用？",
    bigTech: false,
    answer: `XState 用状态机建模有明确状态流转的逻辑，防非法状态转移、可视化、可测试。场景：多步表单、向导、订单流程、支付状态。比散布的 if/else 更可靠。

\`\`\`js
import { createMachine } from "xstate";
const orderMachine = createMachine({
  initial: "idle",
  states: {
    idle: { on: { ADD_ITEM: "cart" } },
    cart: { on: { CHECKOUT: "paying", CLEAR: "idle" } },
    paying: { on: { SUCCESS: "done", FAIL: "cart" } },
    done: { type: "final" },
  }
});
// 非法转移被拒绝（idle 直接到 paying 不允许）
const state = orderMachine.transition("idle", { type: "CHECKOUT" }); // 仍 idle
\`\`\`

踩坑：状态机适合状态多且转移复杂的场景（简单场景过度设计）；可视化用 XState Visualizer 调试；与 React 集成用 @xstate/react 的 useMachine。`,
    keyPoints: ["状态机建模状态流转", "防非法转移", "可视化可测试"],
    followUps: ["状态机和 reducer 区别？", "XState 如何处理副作用？"],
    favorited: false,
  },
  {
    id: "fe-131",
    nodeId: "state-mgmt",
    question: "服务端状态和客户端状态有什么区别？为什么要分开管理？",
    bigTech: true,
    answer: `客户端状态：UI 交互态（表单/主题/弹窗），本地管理。服务端状态：远程数据（列表/详情），有缓存/失效/同步问题。分开因为服务端状态需处理缓存失效/重试/乐观更新，Redux 管不好。

\`\`\`js
// 客户端状态：Zustand 管 UI 态
const useUI = create(set => ({ theme: "light", toggleTheme: () => set(s => ({ theme: s.theme === "light" ? "dark" : "light" })) }));
// 服务端状态：React Query 管远程数据
const { data, isLoading } = useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
  staleTime: 60000, // 1 分钟内不重新请求
});
// 乐观更新：先改 UI 再请求，失败回滚
const mut = useMutation({ mutationFn: updateName, onMutate: async (newName) => {
  await queryClient.cancelQueries(["user"]);
  const prev = queryClient.getQueryData(["user"]);
  queryClient.setQueryData(["user"], { ...prev, name: newName });
  return { prev };
}, onError: (err, _, ctx) => queryClient.setQueryData(["user"], ctx.prev) });
\`\`\`

踩坑：把服务端数据塞 Redux 导致缓存/失效逻辑手写复杂，用 React Query/SWR 专门处理；React Query 的 queryKey 是缓存键，参数变化自动重取；staleTime 控制"新鲜期"。`,
    keyPoints: ["客户端状态 UI 态 / 服务端状态远程数据", "服务端状态需缓存失效", "React Query 专门处理"],
    followUps: ["React Query 的 staleTime 和 cacheTime 区别？", "乐观更新如何回滚？"],
    favorited: false,
  },
  {
    id: "fe-132",
    nodeId: "state-mgmt",
    question: "不可变更新为什么重要？如何简化？",
    bigTech: false,
    answer: `不可变更新：不直接改 state，返回新对象。原因：React/Redux 靠引用判断变化，直接改不触发渲染；利于时间旅行/撤销重做。简化：展开运算符、Immer、Immer 的 produce。

\`\`\`js
// 差：直接改不触发渲染
state.list.push(item); // 引用没变，React 不更新
// 好：展开返回新数组
const newList = [...list, item];
// 嵌套对象展开繁琐
const newState = { ...state, user: { ...state.user, name: "Tom" } };
// Immer：可变写法生成不可变
import { produce } from "immer";
const next = produce(state, draft => { draft.user.name = "Tom"; draft.list.push(item); });
\`\`\`

踩坑：深层嵌套展开易出错，用 Immer；Redux Toolkit 内置 Immer；React useState 也需不可变（setList([...list, item])）；Map/Set 不可变需新建实例。`,
    keyPoints: ["引用变化才触发更新", "展开运算符/Immer 简化", "利于时间旅行"],
    followUps: ["Immer 的 produce 原理？", "Map 如何不可变更新？"],
    favorited: false,
  },
  {
    id: "fe-133",
    nodeId: "state-mgmt",
    question: "状态如何持久化？有哪些方案？",
    bigTech: false,
    answer: `持久化把状态存到 localStorage/IndexedDB/服务端。方案：手动同步、Zustand persist 中间件、Redux persist、IndexedDB 大数据。

\`\`\`js
// Zustand persist：自动同步 localStorage
import { persist } from "zustand/middleware";
const useStore = create(persist(
  (set) => ({ user: null, setUser: (u) => set({ user: u }) }),
  { name: "app-storage", partialize: (s) => ({ user: s.user }) } // 只存 user
));
// Redux persist
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
const persisted = persistReducer({ key: "root", storage }, rootReducer);
// 大数据用 IndexedDB（idb-keyval）
import { get, set } from "idb-keyval";
await set("largeState", state);
\`\`\`

踩坑：持久化敏感数据需加密或只存 token；版本迁移（persist migrate）处理结构变化；SSR 时 localStorage 不可用需跳过；partialize 只存必要字段避免膨胀。`,
    keyPoints: ["Zustand/Redux persist 自动同步", "大数据用 IndexedDB", "partialize 只存必要字段"],
    followUps: ["persist 如何做版本迁移？", "敏感数据如何安全持久化？"],
    favorited: false,
  },
  // ===== 20. router-data 路由与数据获取 =====
  {
    id: "fe-134",
    nodeId: "router-data",
    question: "React Router v7 有哪些核心变化？和 Remix 是什么关系？",
    bigTech: true,
    answer: `React Router v7 把 Remix 合并了进来：Remix 团队宣布 Remix v3 以 React Router v7 的形式发布，v7 同时提供两种模式——library 模式（延续 v6 的组件路由用法，createBrowserRouter）和 framework 模式（原 Remix 的文件约定路由、loader/action、SSR 能力，由 @react-router/dev 提供）。v6 项目可平滑升级，API 基本兼容。

\`\`\`tsx
// framework 模式：文件约定路由 + loader/action（原 Remix 玩法）
// app/routes/users.$id.tsx
export async function loader({ params }: Route.LoaderArgs) {
  return { user: await fetchUser(params.id) }; // 服务端执行，类型安全
}
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  await updateUser(form); // 表单提交直接打 action
  return redirect("/users");
}
export default function User({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.user.name}</h1>; // loader 数据类型推断到组件
}
\`\`\`

踩坑：v7 的 Route.LoaderArgs/ComponentProps 等类型由框架按路由自动生成（typegen）；library 模式下仍用 v6 的 useLoaderData 泛型；框架模式默认 SSR，纯 SPA 需显式配置 ssr: false。`,
    keyPoints: ["v7 = v6 + Remix 合并，双模式", "framework 模式文件约定路由+loader/action", "类型安全自动生成（typegen）", "v6 平滑升级"],
    followUps: ["v7 的 action 如何处理表单？", "framework 模式如何做 SSR 流式渲染？"],
    favorited: false,
  },
  {
    id: "fe-135",
    nodeId: "router-data",
    question: "Next.js App Router 的数据获取方式有哪些？",
    bigTech: true,
    answer: `App Router 在 Server Component 中直接 async/await 获取数据（服务端执行），Client Component 用 SWR/React Query。关键变化：Next.js 15 起 fetch 请求、GET Route Handler、客户端路由缓存全部默认不缓存（uncached），缓存语义从"默认缓存、显式退出"反转为"默认不缓存、显式开启"。

\`\`\`tsx
// Server Component：直接 async 查数据
async function Products() {
  // Next 15：fetch 默认不缓存，要缓存需显式声明
  const res = await fetch("https://api/products", {
    cache: "force-cache",       // 显式开启缓存（配合 revalidate 实现 ISR）
    next: { revalidate: 60 },   // 60 秒后重新验证
  });
  const data = await res.json();
  return data.map(p => <Product key={p.id} {...p} />);
}
// 实时数据：默认即不缓存，无需 cache:"no-store"
async function Product({ params }) {
  const res = await fetch(\`https://api/products/\${params.id}\`); // 每次请求实时
  return <div>{(await res.json()).name}</div>;
}
// Client Component：SWR
"use client";
function useProducts() { return useSWR("/api/products", fetcher); }
\`\`\`

踩坑：Next 14 及之前 fetch 默认 force-cache，升级到 15 后不加显式 cache 选项的页面会从静态变动态；想整页静态可 export const dynamic = "force-static"；revalidate 搭配 force-cache 才有 ISR 语义；generateStaticParams 预生成静态页面。`,
    keyPoints: ["Server Component 直接 async", "Next 15 起 fetch 默认不缓存", "cache/revalidate 显式控制", "Client 用 SWR/React Query"],
    followUps: ["ISR 是什么？", "Server/Client 组件数据获取区别？"],
    favorited: false,
  },
  {
    id: "fe-136",
    nodeId: "router-data",
    question: "SWR 的原理是什么？有哪些特性？",
    bigTech: false,
    answer: `SWR（stale-while-revalidate）：先返回缓存（stale），后台重新验证（revalidate）更新数据。特性：自动重试、聚焦刷新、轮询、乐观更新、依赖请求。

\`\`\`js
import useSWR from "swr";
const fetcher = url => fetch(url).then(r => r.json());
function User({ id }) {
  const { data, error, isLoading } = useSWR(\`/api/user/\${id}\`, fetcher, {
    refreshInterval: 5000, // 每 5 秒轮询
    revalidateOnFocus: true, // 窗口聚焦刷新
    dedupingInterval: 2000, // 2 秒内去重
  });
  // 依赖请求：data 就绪再请求
  const { data: posts } = useSWR(() => data ? \`/api/posts?uid=\${data.id}\` : null, fetcher);
}
\`\`\`

踩坑：key 传 null 跳过请求（条件获取）；mutate 手动刷新/乐观更新；SWR 全局配置 SWRConfig 设默认 fetcher/选项；缓存按 key 全局共享，多组件复用。`,
    keyPoints: ["stale-while-revalidate 先缓存后更新", "聚焦刷新/轮询/去重", "key null 条件获取"],
    followUps: ["SWR 的 mutate 如何乐观更新？", "SWR 和 React Query 区别？"],
    favorited: false,
  },
  {
    id: "fe-137",
    nodeId: "router-data",
    question: "TanStack Query 的缓存策略如何工作？staleTime 和 gcTime 区别？",
    bigTech: true,
    answer: `TanStack Query（原 React Query）按 queryKey 缓存。staleTime：数据"新鲜期"内不重新请求；gcTime（v5 起由 cacheTime 改名，语义不变）：缓存保留时间，无观察者后倒计时由 GC 清除。还有失效 invalidateQueries、预取 prefetchQuery。

\`\`\`js
const { data, isPending } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 60000,   // 1 分钟内不重新请求（视为新鲜）
  gcTime: 300000,     // v5 改名：cacheTime → gcTime，5 分钟无组件观察后清除
  refetchOnWindowFocus: true,
});
// 失效：标记过期，重新请求
queryClient.invalidateQueries({ queryKey: ["todos"] });
// 预取：路由跳转前先加载
queryClient.prefetchQuery({ queryKey: ["user", id], queryFn: () => fetchUser(id) });
\`\`\`

v5 主要差异：cacheTime 改名 gcTime；回调从 useQuery 移除（onSuccess/onError 需在 queryFn 或全局配置处理）；isLoading 拆成 isPending（首次加载）与 isFetching（任何请求中）；useQuery 等 hook 入参收敛为单对象；refetchInterval 在后台页签默认继续需显式 refetchIntervalInBackground。

踩坑：staleTime=0（默认）每次组件挂载都重请求；gcTime 默认 5 分钟；invalidateQueries 标记 stale 触发重取；queryKey 含参数自动按参数缓存（["user", 1] 与 ["user", 2] 独立）。`,
    keyPoints: ["staleTime 新鲜期不重请求", "v5 cacheTime 改名 gcTime", "invalidate 触发重取", "isPending/isFetching 拆分"],
    followUps: ["TanStack Query v5 相比 v4 有哪些 breaking change？", "queryKey 设计原则？"],
    favorited: false,
  },
  {
    id: "fe-138",
    nodeId: "router-data",
    question: "前端路由守卫如何实现权限控制？",
    bigTech: false,
    answer: `路由守卫在导航前校验权限（登录/角色），不通过则跳登录/403。React Router v6 用 loader/组件包装，Vue Router 用 beforeEach。

\`\`\`jsx
// React Router v6：包装组件守卫
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
<Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
// Vue Router：全局守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLogin()) next("/login");
  else if (to.meta.role && !hasRole(to.meta.role)) next("/403");
  else next();
});
\`\`\`

踩坑：登录后跳回原页用 location state；权限细粒度用 meta.role 数组匹配；服务端也要校验（前端守卫只是 UX，可绕过）；React Router v6.4 loader 中可做服务端校验。`,
    keyPoints: ["导航前校验权限", "React 包装组件 / Vue beforeEach", "登录后跳回原页"],
    followUps: ["如何做按钮级权限？", "前端守卫能被绕过吗？"],
    favorited: false,
  },
  {
    id: "fe-139",
    nodeId: "router-data",
    question: "嵌套路由如何实现？布局复用怎么做？",
    bigTech: false,
    answer: `嵌套路由让子路由渲染在父路由的出口（Outlet）内，父布局复用不重新挂载。React Router 用 Outlet，Vue Router 用 <router-view>。

\`\`\`jsx
// React Router v6
<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />
  <Route path="users" element={<UsersLayout />}>
    <Route index element={<UserList />} />
    <Route path=":id" element={<UserDetail />} />
  </Route>
</Route>
function Layout() {
  return <div><Header /><Outlet /><Footer /></div>; // 子路由渲染在 Outlet
}
\`\`\`

踩坑：index 路由是父路径默认内容；嵌套层级深的用相对路径（path=":id" 非绝对）；父布局 Outlet 位置决定子渲染区；Vue 用 <router-view/> 同理。`,
    keyPoints: ["子路由渲染在 Outlet/router-view", "父布局复用", "index 路由默认内容"],
    followUps: ["index 路由的作用？", "如何实现多级嵌套？"],
    favorited: false,
  },
  {
    id: "fe-140",
    nodeId: "router-data",
    question: "路由懒加载如何实现？预加载怎么做？",
    bigTech: false,
    answer: `懒加载：路由组件用 React.lazy + dynamic import，按需生成 chunk 减小首屏。预加载：链接 hover 时预加载、IntersectionObserver、webpackPrefetch。

\`\`\`jsx
// 懒加载：动态 import
const Admin = lazy(() => import("./Admin"));
<Route path="/admin" element={<Suspense fallback={<Spinner />}><Admin /></Suspense>} />
// 预加载：hover 时加载
const [Admin, setAdmin] = useState(() => () => <Spinner />);
const preload = () => { import("./Admin").then(m => setAdmin(() => m.default)); };
<Link to="/admin" onMouseEnter={preload}>管理</Link>
// Vite/Webpack magic comment 预取
const Admin = lazy(() => import(/* webpackPrefetch: true */ "./Admin"));
\`\`\`

踩坑：懒加载首访有加载延迟，重要页面可预取；Suspense fallback 必须包裹懒组件；预取会下载但暂不执行（占带宽），移动端慎用；chunk 名用 /* webpackChunkName */ 便于调试。`,
    keyPoints: ["lazy + dynamic import 按需加载", "hover/IO 预加载", "webpackPrefetch 预取"],
    followUps: ["prefetch 和 preload 区别？", "懒加载如何处理加载失败？"],
    favorited: false,
  },
  // ===== 21. build-tools 构建工具 =====
  {
    id: "fe-141",
    nodeId: "build-tools",
    question: "Vite 为什么开发那么快？原理是什么？",
    bigTech: true,
    answer: `Vite dev 利用浏览器原生 ESM：请求时按需编译（esbuild），不打包，启动秒级。生产用 Rollup 打包（代码分割/Tree Shaking）。相比 Webpack dev 全量打包，Vite 冷启动快 10-100 倍。

\`\`\`js
// 浏览器请求 /src/main.ts
// Vite 拦截：esbuild 编译 TS→JS，返回 ESM
// import { foo } from "./foo" → 浏览器再请求 /src/foo.ts
// 依赖预构建：node_modules 的 CJS 用 esbuild 转 ESM 并缓存
// vite.config.ts
export default defineConfig({
  optimizeDeps: { include: ["react", "react-dom"] }, // 预构建
  build: { rollupOptions: { output: { manualChunks: { vendor: ["react"] } } } },
});
\`\`\`

踩坑：依赖多时首次预构建有延迟（可用 optimizeDeps.include 预声明）；CJS 依赖需预构建转 ESM；HMR 通过 WebSocket 推送变更模块，按 ESM 边界失效。2025 起 Vite 推出 Rolldown-Vite（用 Rust 版 Rolldown 替换 esbuild+Rollup 双引擎），目前以独立包 rolldown-vite 提供、可平滑替换体验，官方规划未来版本将其作为默认引擎，构建速度和 dev/build 一致性进一步提升，新项目可关注迁移进展。`,
    keyPoints: ["dev 原生 ESM 按需编译", "esbuild 极速编译", "生产 Rollup 打包", "Rolldown-Vite 统一引擎（迁移中）"],
    followUps: ["Vite 依赖预构建做什么？", "Rolldown-Vite 带来什么变化？"],
    favorited: false,
  },
  {
    id: "fe-142",
    nodeId: "build-tools",
    question: "Webpack 的 loader 和 plugin 有什么区别？",
    bigTech: false,
    answer: `loader 处理文件内容转换（链式，源码→模块），如 babel-loader/ts-loader/css-loader。plugin 监听构建生命周期钩子做扩展（emit/compilation），如 HtmlWebpackPlugin/CopyPlugin。

\`\`\`js
// loader：转换文件
module: { rules: [
  { test: /\.ts$/, use: "ts-loader" }, // TS→JS
  { test: /\.css$/, use: ["style-loader", "css-loader"] }, // 链式逆序执行
]}
// plugin：钩子扩展
plugins: [
  new HtmlWebpackPlugin({ template: "./index.html" }), // 注入 bundle
  new MiniCssExtractPlugin({ filename: "[name].css" }),
]
// 自定义 plugin：实现 apply(compiler)
class MyPlugin {
  apply(compiler) { compiler.hooks.emit.tap("My", compilation => { /* 改 assets */ }); }
}
\`\`\`

踩坑：loader 链式从右到左/从下到上执行；plugin 通过 compiler.hooks 介入生命周期；loader 只管文件转换，plugin 管构建流程（不能反过来）。`,
    keyPoints: ["loader 转换文件内容", "plugin 钩子扩展流程", "loader 链式逆序执行"],
    followUps: ["loader 的执行顺序？", "如何写自定义 plugin？"],
    favorited: false,
  },
  {
    id: "fe-143",
    nodeId: "build-tools",
    question: "Tree Shaking 的实现条件是什么？为什么有时摇不掉？",
    bigTech: true,
    answer: `Tree Shaking 条件：ESM（静态分析）、生产模式、package.json sideEffects 标记、纯函数（无副作用）。摇不掉原因：CJS 动态、有副作用未标记、函数有副作用、class 方法。

\`\`\`js
// math.ts（ESM 纯导出）
export const add = (a, b) => a + b;   // 用了保留
export const heavy = () => { sideEffect(); }; // 未用但 sideEffects 未标记 → 保留
// package.json
{ "sideEffects": false } // 标记无副作用，heavy 被摇掉
{ "sideEffects": ["*.css"] } // CSS 有副作用保留
// 摇不掉：class 方法默认保留（可能有副作用）
class Util { static fn() {} } // fn 不确定有无副作用，保留
// 函数调用有副作用
export const x = fetch("/api"); // 顶层副作用，保留
\`\`\`

踩坑：CSS 文件需在 sideEffects 声明保留（否则样式丢失）；按需引入用具名导出而非整体引入 default；Babel preset-env 的模块转换可能把 ESM 转 CJS 破坏摇树（设 modules:false）。`,
    keyPoints: ["ESM 静态分析前提", "sideEffects 标记副作用", "class 方法/顶层副作用难摇"],
    followUps: ["sideEffects 如何配置？", "Babel modules:false 为什么重要？"],
    favorited: false,
  },
  {
    id: "fe-144",
    nodeId: "build-tools",
    question: "代码分割有哪些方式？如何优化首屏加载？",
    bigTech: true,
    answer: `代码分割：路由懒加载（dynamic import）、vendor 分包（第三方单独 chunk）、动态导入大模块、SplitChunksPlugin/Vite manualChunks。优化首屏：只加载首屏所需，其余懒加载。

\`\`\`js
// 路由懒加载
const Admin = lazy(() => import("./Admin"));
// Vite 手动分包
build: { rollupOptions: { output: { manualChunks: {
  vendor: ["react", "react-dom"],
  utils: ["lodash-es"],
}}}}
// Webpack SplitChunks
optimization: { splitChunks: { chunks: "all", cacheGroups: {
  vendor: { test: /node_modules/, name: "vendor" }
}}}
// 动态导入大模块（如编辑器）
const editor = await import("./MonacoEditor");
\`\`\`

踩坑：分包过细导致请求过多（HTTP/2 缓解但不无限）；vendor 分包利用浏览器缓存（第三方不变不重下）；首屏 LCP 元素优先加载，非首屏 lazy；prefetch 预取下一页。`,
    keyPoints: ["路由/模块动态 import", "vendor 分包利用缓存", "首屏优先懒加载其余"],
    followUps: ["分包过多有什么问题？", "HTTP/2 对分包的影响？"],
    favorited: false,
  },
  {
    id: "fe-145",
    nodeId: "build-tools",
    question: "esbuild 和 SWC 有什么区别？为什么比 Babel 快？",
    bigTech: false,
    answer: `esbuild（Go）和 SWC（Rust）都是原生编译的极速转译器，比 Babel（JS）快 10-100 倍。esbuild 侧重打包+转译，SWC 侧重转译+压缩，可替代 Babel。

\`\`\`js
// Babel（JS）：AST 遍历慢，插件生态丰富
// .babelrc { presets: ["@babel/preset-env", "@babel/preset-react"] }
// SWC（Rust）：next.js 默认
// .swcrc { jsc: { parser: { syntax: "ecmascript", jsx: true } } }
// esbuild（Go）：Vite dev 用
// esbuild.build({ entryPoints: ["app.ts"], bundle: true, loader: { ".ts": "ts" } })
// 性能：esbuild/SWC > Babel 10-100x
\`\`\`

踩坑：Babel 插件生态最全（特殊语法转换 SWC 可能不支持）；SWC 是 Next.js 默认（替代 Babel+Terser）；esbuild 不做类型检查（tsc 单独跑）；Turbopack（Rust）是 Webpack 替代品，Next.js 15 起 dev 默认启用、build 已稳定；非 Next 生态看 Rspack/Rsbuild（Rust 实现、兼容 Webpack API）。`,
    keyPoints: ["esbuild(Go)/SWC(Rust) 原生极速", "比 Babel 快 10-100x", "Babel 插件生态最全", "Rust 工具链成主流"],
    followUps: ["esbuild 为什么不做类型检查？", "Turbopack 和 Vite 区别？"],
    favorited: false,
  },
  {
    id: "fe-146",
    nodeId: "build-tools",
    question: "Source Map 的作用？生产环境如何安全使用？",
    bigTech: false,
    answer: `Source Map 把打包后代码映射回源码，便于调试。生产环境为安全不公开（防暴露源码），用 hidden-source-map 生成但不在 bundle 引用，上传到错误监控（Sentry）。

\`\`\`js
// 开发：eval-source-map 快速重建
// 生产：hidden-source-map（生成不引用）+ 上传 Sentry
// Vite
build: { sourcemap: "hidden" } // 生成 .map 但注释不写
// Webpack
devtool: "hidden-source-map"
// Sentry 上传 map 后即可在错误栈看到源码位置
// 错误监控：window.onerror 上报 stack，Sentry 用 map 还原
\`\`\`

踩坑：生产 source map 泄露源码（竞争对手可还原）；eval-cheap-module-source-map 开发快但生产不可用；CSS source map 需单独配置；上传 Sentry 后删除服务器上的 map 文件。`,
    keyPoints: ["map 映射打包码到源码", "生产用 hidden 不引用", "上传 Sentry 安全调试"],
    followUps: ["source map 的格式是什么？", "eval-source-map 为什么快？"],
    favorited: false,
  },
  {
    id: "fe-147",
    nodeId: "build-tools",
    question: "Turbopack、Rspack 和 Vite/Webpack 有什么区别？2026 年现状如何？",
    bigTech: false,
    answer: `Turbopack（Rust，Vercel）是 Webpack 作者新作，函数级增量编译缓存，已深度集成 Next.js：Next.js 15 起 dev 默认启用 Turbopack，生产构建（next build --turbopack）也已稳定可用。Vite 利用原生 ESM 按需编译；Rspack（字节）/Rsbuild 是 Rust 实现的 Webpack API 兼容方案，主打存量 Webpack 项目平滑迁移，已被 Docusaurus 等采用。

\`\`\`js
// Next.js 15+：dev 默认就是 Turbopack，无需 --turbo
next dev
// 生产构建启用 Turbopack（已稳定）
next build --turbopack
// Rspack：webpack.config.js 几乎原样复用
// rspack.config.mjs 复用 Webpack loader/plugin 生态
// Vite：按请求编译 ESM，依赖预构建缓存
// Webpack：全量打包，HMR 增量但慢
\`\`\`

踩坑：Turbopack 绑定 Next 生态，自定义 Webpack loader 多的项目迁移需评估（支持常用 loader 子集）；Rspack 兼容 Webpack 5 绝大多数 API，适合存量迁移，周边配套 Rsbuild/Rslib/Rspress 全家桶；Vite 生态成熟更通用；Rust 系在超大项目（万文件）缓存优势明显。`,
    keyPoints: ["Turbopack：Next 15 dev 默认、build 稳定", "Rspack/Rsbuild：Rust 实现兼容 Webpack API", "函数级增量缓存", "存量 Webpack 项目看 Rspack"],
    followUps: ["Turbopack 函数级缓存原理？", "Rspack 和 Vite 在存量项目如何选型？"],
    favorited: false,
  },
  // ===== 22. testing 测试体系 =====
  {
    id: "fe-148",
    nodeId: "testing",
    question: "Vitest 相比 Jest 有什么优势？如何配置？",
    bigTech: true,
    answer: `Vitest 原生 ESM、Vite 共享配置、极速（esbuild）、TS 零配置、API 兼容 Jest。适合 Vite 项目，比 Jest 快且配置少。

\`\`\`js
// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "jsdom", globals: true, coverage: { provider: "v8" } },
});
// 测试用例（API 兼容 Jest）
import { describe, it, expect } from "vitest";
describe("sum", () => {
  it("adds", () => { expect(sum(1, 2)).toBe(3); });
});
// watch 模式：HMR 极速重跑
// vitest --watch
\`\`\`

踩坑：Vitest 原生 ESM 无需 transform，Jest 需 babel-jest；jsdom 环境需装；mock 用 vi.mock 替代 jest.mock；覆盖率用 v8 比 istanbul 快。`,
    keyPoints: ["原生 ESM + Vite 共享配置", "esbuild 极速", "API 兼容 Jest"],
    followUps: ["Vitest 如何 mock 模块？", "Vitest 和 Jest API 差异？"],
    favorited: false,
  },
  {
    id: "fe-149",
    nodeId: "testing",
    question: "Testing Library 的核心理念是什么？如何查询元素？",
    bigTech: false,
    answer: `核心理念：测用户行为而非实现细节（不测 state/内部方法），以用户方式查询（角色/文本/标签优先）。查询优先级：getByRole > getByLabelText > getByText > testId。

\`\`\`jsx
import { render, screen, fireEvent } from "@testing-library/react";
test("提交表单", () => {
  render(<LoginForm />);
  // 优先用角色（无障碍语义）
  fireEvent.change(screen.getByRole("textbox", { name: /邮箱/i }), { target: { value: "a@b.com" } });
  fireEvent.click(screen.getByRole("button", { name: /提交/i }));
  expect(screen.getByText("成功")).toBeInTheDocument();
});
// 查询方法：getBy（同步找不到抛错）/queryBy（找不到返回 null）/findBy（异步等待）
\`\`\`

踩坑：避免用 container.querySelector（测实现细节）；getBy 找到多个抛错（用 getAllBy）；异步用 findBy/await waitFor；testId 是最后手段（不反映用户行为）。`,
    keyPoints: ["测用户行为非实现细节", "角色查询优先（无障碍语义）", "getBy/queryBy/findBy 区别"],
    followUps: ["getBy 和 queryBy 区别？", "为什么避免 querySelector？"],
    favorited: false,
  },
  {
    id: "fe-150",
    nodeId: "testing",
    question: "Playwright 如何做 E2E 测试？相比 Cypress 优势？",
    bigTech: false,
    answer: `Playwright 跨浏览器（Chromium/Firefox/WebKit）、自动等待、并行测试、网络拦截。相比 Cypress：多浏览器、并行快、无 iframe 限制、语言多（JS/TS/Python/Java）。

\`\`\`js
import { test, expect } from "@playwright/test";
test("登录流程", async ({ page }) => {
  await page.goto("/login");
  await page.fill("[name=email]", "a@b.com");
  await page.fill("[name=password]", "123");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toHaveText("欢迎");
});
// 网络拦截：mock API
await page.route("**/api/user", route => route.fulfill({ json: { name: "Mock" } }));
\`\`\`

踩坑：Playwright 自动等待元素可操作（无需手动 sleep）；并行用 worker 进程；CIRS iframe 内测试 Cypress 受限，Playwright 无限制；CI 用 headless。`,
    keyPoints: ["跨浏览器自动等待", "并行测试快", "网络拦截 mock"],
    followUps: ["Playwright 自动等待原理？", "Playwright 和 Cypress 并行差异？"],
    favorited: false,
  },
  {
    id: "fe-151",
    nodeId: "testing",
    question: "Mock 策略有哪些？什么时候 mock 什么时候不 mock？",
    bigTech: false,
    answer: `Mock 策略：mock 网络请求（MSW）、mock 模块（vi.mock）、mock 时间（vi.useFakeTimers）、mock 全局（localStorage）。原则：mock 外部不稳定依赖（API/定时器），不 mock 被测代码内部逻辑。

\`\`\`js
// MSW mock API（推荐，拦截 fetch）
import { http, HttpResponse } from "msw";
const handlers = [http.get("/api/user", () => HttpResponse.json({ name: "Tom" }))];
// vitest mock 模块
vi.mock("./api", () => ({ fetchUser: vi.fn(() => ({ name: "Mock" })) }));
// mock 定时器
vi.useFakeTimers();
test("定时", () => {
  const fn = vi.fn();
  setInterval(fn, 1000);
  vi.advanceTimersByTime(3000);
  expect(fn).toHaveBeenCalledTimes(3);
});
\`\`\`

踩坑：过度 mock 导致测试不真实（测的是 mock 不是代码）；MSW 比 vi.mock fetch 更真实（拦截层）；mock 后测试要 restoreAllMocks 防污染。`,
    keyPoints: ["mock 外部不稳定依赖", "MSW 拦截 API 推荐", "不 mock 被测内部逻辑"],
    followUps: ["MSW 原理是什么？", "vi.mock 和 vi.spyOn 区别？"],
    favorited: false,
  },
  {
    id: "fe-152",
    nodeId: "testing",
    question: "测试覆盖率有哪些指标？多少合适？",
    bigTech: false,
    answer: `覆盖率指标：语句（Statements）、分支（Branches）、函数（Functions）、行（Lines）。80% 是常见目标，但 100% 不等于无 bug，关键路径和核心逻辑要高覆盖。

\`\`\`js
// vitest 覆盖率
test: { coverage: {
  provider: "v8",
  reporter: ["text", "html", "lcov"],
  thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
}}
// 跑覆盖率
vitest run --coverage
// 指标：if/else 两个分支都测到才算分支覆盖
\`\`\`

踩坑：覆盖率 100% 不等于测了所有场景（只测了执行路径）；分支覆盖比行覆盖更严格（条件组合）；核心支付/鉴权逻辑追求高覆盖，UI 样式可低；CI 卡覆盖率防回退。`,
    keyPoints: ["语句/分支/函数/行四指标", "80% 常见目标", "100% 不等于无 bug"],
    followUps: ["分支覆盖和语句覆盖区别？", "覆盖率如何接入 CI？"],
    favorited: false,
  },
  {
    id: "fe-153",
    nodeId: "testing",
    question: "视觉回归测试如何做？",
    bigTech: false,
    answer: `视觉回归：截图对比，捕获 UI 意外变化。工具：Playwright screenshot、Percy、Chromatic。流程：基线截图→改动后对比→差异高亮人工确认。

\`\`\`js
// Playwright 截图对比
test("首页视觉", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home.png", { maxDiffPixelRatio: 0.01 });
});
// 配置：首次生成基线，之后对比
// 差异超阈值失败，更新基线需 --update-snapshots
\`\`\`

踩坑：截图受字体/动画/时间影响需禁用（disableAnimations）；跨平台渲染差异导致误报（统一 CI 环境）；响应式需多视口截图；动态内容（日期/随机）需 mock 固定。`,
    keyPoints: ["截图对比捕获 UI 变化", "基线+对比+阈值", "禁用动画字体防误报"],
    followUps: ["如何处理动态内容截图？", "Percy 和 Playwright 截图区别？"],
    favorited: false,
  },
  {
    id: "fe-154",
    nodeId: "testing",
    question: "TDD（测试驱动开发）的流程是什么？优劣？",
    bigTech: false,
    answer: `TDD 流程：Red（写失败测试）→ Green（最少代码让测试过）→ Refactor（重构保持绿）。优势：设计驱动、即时反馈、回归保护。劣势：初期慢、UI 难 TDD、需练习。

\`\`\`js
// Red：先写测试（失败）
test("格式化金额", () => {
  expect(formatMoney(1234.5)).toBe("1,234.50");
});
// Green：最少实现
function formatMoney(n) { return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
// Refactor：优化（如抽正则常量）保持测试绿
\`\`\`

踩坑：TDD 适合纯逻辑/算法（边界清晰），UI/探索性开发难 TDD；不要为测而测（覆盖无意义路径）；先写测试能倒逼设计可测（依赖注入/纯函数）。`,
    keyPoints: ["Red→Green→Refactor", "设计驱动即时反馈", "适合纯逻辑不适合探索"],
    followUps: ["TDD 和 BDD 区别？", "什么场景不适合 TDD？"],
    favorited: false,
  },
  // ===== 23. performance 性能优化 =====
  {
    id: "fe-155",
    nodeId: "performance",
    question: "Core Web Vitals 有哪些指标？如何优化？",
    bigTech: true,
    answer: `Core Web Vitals 三核心：LCP（最大内容绘制，<2.5s）、INP（交互到下一帧，<200ms，替代 FID）、CLS（累积布局偏移，<0.1）。Lighthouse 测量并给优化建议。

\`\`\`js
// LCP 优化：首屏大图优先加载
<img src="hero.jpg" fetchpriority="high" /> // 提升优先级
<link rel="preload" as="image" href="hero.jpg" />
// INP 优化：长任务拆分、减少主线程阻塞
onClick = () => { startTransition(() => setState(x)); }; // 低优先级
// INP 优化三件套：
// 1) scheduler.yield()（新 API）：长任务中主动让出主线程，先画一帧再继续
async function processAll(items) {
  for (const item of items) {
    heavy(item);
    await scheduler.yield(); // 让出，浏览器可先响应输入/渲染
  }
}
// 2) 事件处理拆分：点击回调里先更新视觉反馈（同步少量工作），
//    重计算放 setTimeout/scheduler.postTask，缩短"输入到下一帧"
// 3) 归因：Long Animation Frames API（LoAF）定位掉帧长帧的脚本来源
new PerformanceObserver(list => {
  for (const e of list.getEntries()) {
    console.log(e.duration, e.scripts); // 哪个脚本贡献了长帧
  }
}).observe({ type: "long-animation-frame", buffered: true });
// CLS 优化：图片/广告位预留尺寸
<img width="800" height="600" /> // 预留防偏移
.ad-slot { min-height: 250px; } // 广告位预留
// 测量
new PerformanceObserver(list => list.getEntries().forEach(e => console.log(e)));
\`\`\`

踩坑：LCP 通常是首屏大图/大文字，预加载关键资源；CLS 多因异步加载图片/字体/广告无尺寸；INP 替代 FID（FID 只测首次输入），更严格；INP 差时用 LoAF 归因到具体脚本，再按 scheduler.yield/事件拆分治理。美团首屏 LCP 从 3.2s 优化到 1.8s。`,
    keyPoints: ["LCP<2.5s / INP<200ms / CLS<0.1", "LCP 预加载关键资源", "INP：scheduler.yield+事件拆分+LoAF 归因", "CLS 预留尺寸防偏移"],
    followUps: ["INP 为什么替代 FID？", "如何测量 Core Web Vitals？"],
    favorited: false,
  },
  {
    id: "fe-156",
    nodeId: "performance",
    question: "字节跳动电商直播间长列表万级消息如何优化？虚拟列表方案？",
    bigTech: true,
    answer: `直播间同时展示万级弹幕+商品卡，传统渲染卡顿。方案：虚拟列表只渲染可视区+缓冲区（约 20-50 项），滚动动态替换。配合时间切片（requestIdleCallback）防首屏卡顿。

\`\`\`js
// 虚拟列表核心：只渲染可视区
function VirtualList({ items, itemHeight, viewportH }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.min(start + Math.ceil(viewportH / itemHeight) + 5, items.length); // +5 缓冲
  const visible = items.slice(start, end);
  return (
    <div style={{ height: viewportH, overflowY: "auto" }} onScroll={e => setScrollTop(e.target.scrollTop)}>
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {visible.map((item, i) => (
          <div key={start + i} style={{ position: "absolute", top: (start + i) * itemHeight, height: itemHeight }}>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

字节直播间还做了：弹幕合并（同用户连续消息折叠）、requestIdleCallback 分批渲染历史、绝对定位避免重排。踩坑：动态高度需预估+测量校正；快速滚动白屏用缓冲区+骨架；react-window/react-virtualized 成熟方案。`,
    keyPoints: ["只渲染可视区+缓冲区", "绝对定位避免重排", "动态高度需测量校正"],
    followUps: ["动态高度虚拟列表如何实现？", "react-window 原理？"],
    favorited: false,
  },
  {
    id: "fe-157",
    nodeId: "performance",
    question: "美团外卖首屏加载如何从 4s 优化到 1.5s？",
    bigTech: true,
    answer: `首屏优化组合拳：SSR/SSG 减少白屏、路由懒加载分包、图片懒加载+WebP、预加载关键资源、骨架屏、HTTP/2 多路复用、CDN 加速。

\`\`\`js
// 1. 关键资源 preload
<link rel="preload" href="/font.woff2" as="font" crossorigin />
// 2. 非首屏 lazy
const Merchant = lazy(() => import("./Merchant"));
// 3. 图片懒加载 + WebP
<img loading="lazy" src="shop.webp" />
// 4. 骨架屏（感知性能）
{loading ? <Skeleton /> : <Content />}
// 5. 预连接 API 域名
<link rel="preconnect" href="https://api.meituan.com" />
// 6. SSR 首屏直出
export default function Page({ data }) { return <ShopList data={data} />; } // 服务端渲染
\`\`\`

美团外卖实测：SSR 直出减 1.2s 白屏、图片懒加载+WebP 减 0.8s、vendor 分包缓存减 0.5s。踩坑：preload 滥用抢带宽，只预加载 LCP 资源；SSR 首屏快但 TTFB 慢需流式；骨架屏尺寸匹配防 CLS。`,
    keyPoints: ["SSR/SSG 直出减白屏", "preload 关键资源/lazy 非首屏", "骨架屏提升感知"],
    followUps: ["preload 和 prefetch 区别？", "SSR 首屏快但有什么代价？"],
    favorited: false,
  },
  {
    id: "fe-158",
    nodeId: "performance",
    question: "图片优化有哪些方案？WebP/AVIF 何时用？",
    bigTech: false,
    answer: `图片优化：选格式（WebP/AVIF 比 JPEG 小 30-50%）、响应式（srcset 按屏幕加载）、懒加载（loading=lazy/IO）、压缩（tinypng）、CDN 动态裁剪。

\`\`\`html
<!-- 响应式：按屏幕加载合适尺寸 -->
<img src="small.jpg"
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px" />
<!-- 格式降级：AVIF > WebP > JPEG -->
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" />
</picture>
<!-- 懒加载 -->
<img loading="lazy" decoding="async" />
\`\`\`

踩坑：AVIF 兼容性比 WebP 差（用 picture 降级）；LCP 图片不要 lazy（影响首屏）；CDN 按需裁剪（?w=400）避免加载大图缩放；矢量图用 SVG 更小。`,
    keyPoints: ["AVIF>WebP>JPEG 体积递减", "srcset 响应式按屏加载", "LCP 图不 lazy"],
    followUps: ["picture 标签的作用？", "CDN 图片裁剪原理？"],
    favorited: false,
  },
  {
    id: "fe-159",
    nodeId: "performance",
    question: "长任务（Long Task）如何拆分？scheduler API 怎么用？",
    bigTech: false,
    answer: `长任务（>50ms）阻塞主线程导致卡顿。拆分：用 requestIdleCallback/scheduler.yield/setTimeout 切片，每片执行后让出主线程。scheduler.postTask 提供优先级调度。

\`\`\`js
// 切片处理大数据
function chunkProcess(tasks) {
  let i = 0;
  function run(deadline) {
    while (i < tasks.length && deadline.timeRemaining() > 1) {
      process(tasks[i++]); // 空闲时处理
    }
    if (i < tasks.length) requestIdleCallback(run);
  }
  requestIdleCallback(run);
}
// scheduler.yield（新）：让出后恢复
async function work() {
  for (const task of tasks) {
    process(task);
    await scheduler.yield(); // 让出主线程
  }
}
\`\`\`

踩坑：requestIdleCallback 超时（timeout）防饿死；scheduler.yield 比 setTimeout(0) 恢复更快（不进宏任务队列末尾）；Web Worker 适合纯计算（不阻塞 UI 线程）。`,
    keyPoints: ["长任务 >50ms 阻塞", "requestIdleCallback 空闲切片", "scheduler.yield 让出恢复"],
    followUps: ["requestIdleCallback 的 timeout 作用？", "Web Worker 和切片如何选？"],
    favorited: false,
  },
  {
    id: "fe-160",
    nodeId: "performance",
    question: "HTTP 缓存策略如何配置？强缓存和协商缓存？",
    bigTech: false,
    answer: `强缓存（Cache-Control/max-age）不请求直接用本地缓存；协商缓存（ETag/Last-Modified）请求服务端验证，304 用缓存。带 hash 的静态资源强缓存，HTML 协商缓存。

\`\`\`nginx
# 静态资源（带 hash）：强缓存一年
location ~* \.(js|css|png)$ {
  Cache-Control: public, max-age=31536000, immutable;
}
# HTML：协商缓存
location ~ \.html$ {
  Cache-Control: no-cache; # 每次验证 ETag
}
\`\`\`
\`\`\`js
// 文件名加 hash：内容变 hash 变，旧缓存失效
// main.[hash].js → 内容变 → main.[newhash].js
// immutable：告知浏览器内容不变不需验证
\`\`\`

踩坑：HTML 强缓存会导致用户拿不到更新（必须协商或 no-cache）；immutable 防 fetch 触发 304（即使刷新）；CDN 缓存需配合版本回源；Service Worker 缓存是另一层。`,
    keyPoints: ["强缓存不请求 / 协商缓存 304", "hash 静态强缓存一年", "HTML 协商缓存"],
    followUps: ["immutable 的作用？", "如何让用户立即看到更新？"],
    favorited: false,
  },
  {
    id: "fe-161",
    nodeId: "performance",
    question: "前端内存泄漏如何排查？常见原因？",
    bigTech: false,
    answer: `常见原因：未清理的定时器/事件监听/订阅、闭包持有大对象、detached DOM、全局变量。排查：Chrome DevTools Memory → Heap Snapshot 对比快照找 retained 增量。

\`\`\`js
// 1. 定时器泄漏：组件卸载未清理
useEffect(() => { const t = setInterval(fn, 1000); return () => clearInterval(t); }, []);
// 2. 事件泄漏：全局监听未移除
useEffect(() => { const fn = () => {}; window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
// 3. detached DOM：移除 DOM 但被 JS 引用
const el = document.querySelector("#x"); el.remove(); // el 仍引用，不回收
// 4. Map 缓存无限增长 → WeakMap 自动回收
const cache = new WeakMap(); // key 被回收自动清理
\`\`\`

踩坑：Heap Snapshot 找"detached"开头节点定位 DOM 泄漏；Allocation timeline 看连续分配不释放；Performance Monitor 看 JS heap size 持续增长判定泄漏。`,
    keyPoints: ["定时器/监听/订阅未清理", "detached DOM/闭包持引用", "Heap Snapshot 对比排查"],
    followUps: ["detached DOM 怎么定位？", "WeakMap 如何防泄漏？"],
    favorited: false,
  },
  // ===== 24. security 前端安全 =====
  {
    id: "fe-162",
    nodeId: "security",
    question: "XSS 攻击有哪些类型？前端如何防御？",
    bigTech: true,
    answer: `XSS 类型：存储型（存 DB 渲染执行）、反射型（URL 参数回显）、DOM 型（JS 操作 DOM 注入）。防御：输出转义、CSP、httpOnly Cookie、避免 innerHTML。

\`\`\`js
// 1. 文本转义（React 默认转义，dangerouslySetInnerHTML 才需手动）
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// 2. CSP 限制脚本来源
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
// 3. httpOnly Cookie 防 JS 偷
// httpOnly 只能由服务端通过 Set-Cookie 响应头设置（前端 JS 无法设置也读不到）：
//   Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict
// Express 示例：res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
// 4. URL 跳转白名单防 javascript:
const allowed = ["http", "https"]; if (!allowed.includes(new URL(href).protocol)) return;
\`\`\`

踩坑：React/Vue 默认转义文本，但 dangerouslySetInnerHTML/v-html 绕过需手动净化（DOMPurify）；富文本用白名单标签而非黑名单；CSP nonce/strict-dynamic 防 inline 注入。`,
    keyPoints: ["存储/反射/DOM 三型", "输出转义+CSP+httpOnly", "DOMPurify 净化富文本"],
    followUps: ["CSP 的 nonce 模式？", "DOMPurify 如何工作？"],
    favorited: false,
  },
  {
    id: "fe-163",
    nodeId: "security",
    question: "CSRF 攻击原理？如何防御？",
    bigTech: false,
    answer: `CSRF：用户登录 A 站后访问 B 站，B 站伪造请求带 A 站 Cookie 执行操作。防御：SameSite Cookie、CSRF Token、Referer 校验、自定义 Header。

\`\`\`js
// 1. SameSite Cookie（最有效）
Set-Cookie: token=xxx; SameSite=Strict; Secure // 跨站不带 Cookie
// 2. CSRF Token：服务端发 token，请求带 token 校验
<meta name="csrf-token" content="abc123" />
fetch("/api", { headers: { "X-CSRF-Token": "abc123" } });
// 3. Referer 校验
if (!req.headers.referer?.startsWith("https://myapp.com")) reject();
// 4. 自定义 Header（CORS 预检拦截）
fetch("/api", { headers: { "X-Requested-With": "XMLHttpRequest" } });
\`\`\`

踩坑：SameSite=Strict 影响从外链跳转的登录态（用 Lax 平衡）；GET 请求不应用作状态变更（CSRF 可通过 img 触发 GET）；CSRF Token 需每次刷新防固定。`,
    keyPoints: ["CSRF 借 Cookie 伪造请求", "SameSite Cookie 最有效", "CSRF Token + Referer"],
    followUps: ["SameSite Strict 和 Lax 区别？", "CORS 如何防 CSRF？"],
    favorited: false,
  },
  {
    id: "fe-164",
    nodeId: "security",
    question: "CSP（内容安全策略）如何配置？nonce 和 strict-dynamic？",
    bigTech: false,
    answer: `CSP 通过 HTTP 头/meta 限制资源加载来源，防 XSS 注入恶意脚本。nonce：每次请求生成随机 token，只允许带该 nonce 的 inline 脚本。strict-dynamic：信任已加载脚本能加载子脚本。

\`\`\`html
<!-- 基础 CSP：只允许同源脚本 -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'" />
<!-- nonce 模式：服务端生成随机 token -->
<script nonce="abc123">console.log("allowed")</script>
<!-- CSP: script-src 'nonce-abc123' 'strict-dynamic' -->
<!-- strict-dynamic：信任的脚本可加载子脚本（第三方库不需列入白名单） -->
\`\`\`

踩坑：unsafe-inline 和 nonce/hash 互斥（有 nonce 时 inline 被忽略除非匹配）；CSP report-uri 收集违规上报；逐步迁移用 Content-Security-Policy-Report-Only（只报告不拦截）。`,
    keyPoints: ["CSP 限制资源来源", "nonce 随机 token 防 inline", "strict-dynamic 信任链"],
    followUps: ["CSP Report-Only 作用？", "nonce 如何生成？"],
    favorited: false,
  },
  {
    id: "fe-165",
    nodeId: "security",
    question: "同源策略是什么？如何跨域？CORS 如何配置？",
    bigTech: true,
    answer: `同源策略：协议+域名+端口三者相同才同源，跨源 JS 默认不能读响应。跨域方案：CORS（标准）、代理、postMessage、JSONP（旧）。CORS 需服务端配 Access-Control-Allow-Origin。

\`\`\`js
// CORS 简单请求：服务端配
Access-Control-Allow-Origin: https://app.com
Access-Control-Allow-Credentials: true // 带 Cookie
// 预检请求（PUT/自定义 Header）：OPTIONS 预检
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom
Access-Control-Max-Age: 86400 // 预检结果缓存 24h，省掉重复 OPTIONS
// 开发代理（Vite）
server: { proxy: { "/api": { target: "https://api.com", changeOrigin: true } } }
// 生产代理：Nginx 反代
location /api { proxy_pass https://api.com; }
\`\`\`

三大坑：
1. 预检缓存：不配 Access-Control-Max-Age 时每个非简单请求都先发一次 OPTIONS（RTT 翻倍）；配上后浏览器缓存预检结果（注意缓存期内改服务端 CORS 配置不生效）。
2. 带凭据重定向：fetch(url, { credentials: "include", redirect: "follow" }) 跨 30x 跳转时，若目标源变化或响应头在重定向链上缺失 Allow-Credentials，请求会失败；稳妥做法是重定向目标同 CORS 配置齐全，或前端手动 redirect:"manual" 处理。
3. 简单请求边界：仅 GET/HEAD/POST + Content-Type 限 text/plain、application/x-www-form-urlencoded、multipart/form-data + 仅 safelist 头；一旦加 Authorization/Content-Type: application/json 就触发预检——很多"突然跨域失败"是某次改动让请求从简单变非简单。

踩坑：带 Cookie 时 Allow-Origin 不能是 *（需具体域名）且 Allow-Credentials:true。`,
    keyPoints: ["同源=协议+域名+端口", "CORS 服务端配 Allow-Origin", "Max-Age 缓存预检", "带凭据重定向易失败", "简单请求边界"],
    followUps: ["什么是预检请求？", "CORS 和代理跨域区别？"],
    favorited: false,
  },
  {
    id: "fe-166",
    nodeId: "security",
    question: "Subresource Integrity（SRI）是什么？解决什么问题？",
    bigTech: true,
    answer: `SRI 给外部资源（CDN JS/CSS）加 integrity 哈希，浏览器加载时校验哈希不匹配则拒绝执行，防 CDN 被篡改注入恶意代码。

\`\`\`html
<!-- integrity 哈希：内容变则不执行 -->
<script src="https://cdn.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"></script>
<!-- CSS 同理 -->
<link rel="stylesheet" href="https://cdn.com/style.css"
  integrity="sha384-xyz..." crossorigin="anonymous" />
\`\`\`

踩坑：SRI 需 crossorigin 属性（跨源资源）；CDN 更新资源需同步更新 integrity（构建工具自动生成）；SRI 只防篡改不防可用性（哈希不匹配资源不加载，需 fallback）。`,
    keyPoints: ["SRI 哈希校验防 CDN 篡改", "integrity + crossorigin", "CDN 更新需同步哈希"],
    followUps: ["SRI 如何生成哈希？", "SRI 校验失败怎么办？"],
    favorited: false,
  },
  {
    id: "fe-167",
    nodeId: "security",
    question: "前端如何防越权（水平/垂直越权）？",
    bigTech: false,
    answer: `水平越权：同权限用户访问彼此数据（如改 URL id 看他人订单）。垂直越权：低权限访问高权限功能。前端只能做 UX 隐藏，真正防御在服务端校验。

\`\`\`js
// 前端：按权限隐藏 UI（UX 层，可绕过）
const { role } = useUser();
{role === "admin" && <AdminButton />} // 隐藏按钮
// 路由守卫
<Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />
// 服务端必须校验（前端可绕过）
// 接口：PUT /order/:id → 服务端校验 id 属于当前用户
app.put("/order/:id", auth, (req, res) => {
  if (order.userId !== req.user.id && req.user.role !== "admin") return res.status(403);
});
\`\`\`

踩坑：前端隐藏只是 UX，篡改 JS/直接调 API 可绕过，服务端必须校验资源归属；IDOR（不安全直接对象引用）用 UUID 替代自增 id 增加猜测难度；权限变更后前端需重新拉取权限。`,
    keyPoints: ["前端隐藏仅 UX 可绕过", "服务端必须校验资源归属", "UUID 防 IDOR 猜测"],
    followUps: ["IDOR 是什么？", "权限变更如何实时同步？"],
    favorited: false,
  },
  {
    id: "fe-168",
    nodeId: "security",
    question: "敏感数据（token/密钥）前端如何安全处理？",
    bigTech: false,
    answer: `原则：前端不存密钥（密钥放服务端）、token 用 httpOnly Cookie 或内存、不写死密钥到代码、环境变量区分。

\`\`\`js
// 差：token 存 localStorage（XSS 可偷）
localStorage.setItem("token", jwt);
// 好：httpOnly Cookie（JS 读不到，防 XSS）
Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict
// 临时 token 存内存（刷新丢失，安全）
let token = null; fetch("/login").then(r => token = r.token);
// API Key 永不放前端，通过 BFF 代理
fetch("/api/llm", { /* 后端持有 key 调用 */ });
// 代码中不放密钥（构建时注入，但仍会进 bundle）
const API_KEY = process.env.KEY; // 会打包进前端！
\`\`\`

踩坑：localStorage 存 token 易被 XSS 偷（配合 CSP 缓解）；前端环境变量会进 bundle（任何用户可看到），密钥必须放 BFF；httpOnly Cookie 需配合 CSRF 防御（SameSite）。`,
    keyPoints: ["密钥不放前端走 BFF", "token httpOnly Cookie/内存", "前端 env 会进 bundle"],
    followUps: ["httpOnly Cookie 如何配合 CSRF 防御？", "BFF 是什么？"],
    favorited: false,
  },
  // ===== 25. pwa-offline PWA 与离线 =====
  {
    id: "fe-169",
    nodeId: "pwa-offline",
    question: "Service Worker 的生命周期和作用？如何缓存资源？",
    bigTech: true,
    answer: `Service Worker 是独立线程的代理脚本，拦截 fetch/缓存/推送。生命周期：install（预缓存）→ activate（清理旧缓存）→ fetch（拦截请求）。需 HTTPS。

\`\`\`js
// sw.js
self.addEventListener("install", e => {
  e.waitUntil(caches.open("v1").then(c => c.addAll(["/", "/app.js", "/style.css"])));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== "v1").map(k => caches.delete(k)))));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); // 缓存优先
});
\`\`\`

踩坑：SW 更新需关闭所有标签页才激活（skipWaiting + clients.claim 立即激活）；缓存版本号管理（v1→v2 清旧）；Workbox 库简化策略（CacheFirst/NetworkFirst/StaleWhileRevalidate）。`,
    keyPoints: ["SW 拦截 fetch/缓存", "install/activate/fetch 生命周期", "需 HTTPS"],
    followUps: ["SW 如何立即更新？", "Workbox 缓存策略有哪些？"],
    favorited: false,
  },
  {
    id: "fe-170",
    nodeId: "pwa-offline",
    question: "IndexedDB 如何使用？相比 localStorage 优势？",
    bigTech: false,
    answer: `IndexedDB 是异步 NoSQL 数据库，容量大（数百 MB+）、支持事务/索引/游标。localStorage 同步 5MB 仅存字符串。适合离线大数据、草稿、缓存。

\`\`\`js
// 打开数据库
const db = await new Promise((res, rej) => {
  const req = indexedDB.open("app", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("notes", { keyPath: "id" });
  req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error);
});
// 增删改查（事务）
const tx = db.transaction("notes", "readwrite");
const store = tx.objectStore("notes");
await store.put({ id: 1, text: "hello" }); // 写
const all = await store.getAll(); // 读
// 用 idb 库简化（Promise 封装）
import { openDB } from "idb";
const db = await openDB("app", 1, { upgrade(db) { db.createObjectStore("notes", { keyPath: "id" }); } });
await db.put("notes", { id: 1, text: "hi" });
\`\`\`

踩坑：原生 IndexedDB 是事件回调（繁琐），用 idb 库 Promise 封装；事务自动提交（回调结束）；大对象存 Blob（文件）；版本升级在 onupgradeneeded 建表。`,
    keyPoints: ["异步 NoSQL 大容量", "事务/索引/游标", "idb 库 Promise 简化"],
    followUps: ["IndexedDB 事务如何工作？", "如何存文件 Blob？"],
    favorited: false,
  },
  {
    id: "fe-171",
    nodeId: "pwa-offline",
    question: "App Shell 模型是什么？如何实现？",
    bigTech: false,
    answer: `App Shell 是应用的最小 HTML/CSS/JS（导航/布局），预缓存后离线秒开，内容动态加载。PWA 核心：Shell 即时显示，内容按需填充。

\`\`\`js
// 预缓存 App Shell
self.addEventListener("install", e => {
  e.waitUntil(caches.open("shell").then(c => c.addAll(["/", "/index.html", "/app.js", "/nav.css"])));
});
// 拦截导航请求返回 Shell
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(caches.match("/index.html")); // 离线返回 Shell
  }
});
// 内容用 NetworkFirst（在线优先，离线用缓存）
\`\`\`

踩坑：Shell 要极简（只含布局不含数据）保证秒开；导航请求返回 Shell，API 用其他策略；Shell 更新需版本号触发重新缓存；配合骨架屏体验更好。`,
    keyPoints: ["App Shell 预缓存秒开", "导航请求返回 Shell", "内容动态加载"],
    followUps: ["App Shell 和 SPA 区别？", "Shell 如何更新？"],
    favorited: false,
  },
  {
    id: "fe-172",
    nodeId: "pwa-offline",
    question: "Web Push 推送如何实现？需要什么前提？",
    bigTech: false,
    answer: `Web Push 用 Push API + Notification API。前提：HTTPS、Service Worker、VAPID 密钥对、推送服务（FCM/APNS）。流程：订阅→发订阅给后端→后端调推送服务→SW 收 push 显示通知。

\`\`\`js
// 前端订阅
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
await fetch("/api/subscribe", { method: "POST", body: JSON.stringify(sub) });
// SW 接收推送显示通知
self.addEventListener("push", e => {
  const data = e.data.json();
  self.registration.showNotification(data.title, { body: data.body });
});
// 后端推送（web-push 库）
webpush.sendNotification(sub, JSON.stringify({ title: "新消息" }));
\`\`\`

踩坑：iOS 16.4+ 才支持 Web Push（需安装到主屏）；用户需授权通知权限；VAPID 密钥对用 web-push 生成；推送服务因浏览器不同（Chrome 用 FCM，Safari 用 APNS）。`,
    keyPoints: ["Push API + Notification", "需 HTTPS/SW/VAPID", "后端调推送服务"],
    followUps: ["VAPID 密钥如何生成？", "iOS Web Push 限制？"],
    favorited: false,
  },
  {
    id: "fe-173",
    nodeId: "pwa-offline",
    question: "Background Sync（后台同步）如何实现？",
    bigTech: false,
    answer: `Background Sync 让 SW 在网络恢复时重试失败请求，即使页面关闭。流程：注册 sync 事件→SW 监听 sync→网络恢复时触发重试。

\`\`\`js
// 页面：注册同步
navigator.serviceWorker.ready.then(reg => reg.sync.register("send-message"));
// SW：监听 sync 重试
self.addEventListener("sync", e => {
  if (e.tag === "send-message") {
    e.waitUntil(retryFailedRequests()); // 网络恢复时执行
  }
});
// 离线时存请求到 IndexedDB，sync 时重放
async function retryFailedRequests() {
  const queue = await getQueue();
  for (const req of queue) {
    try { await fetch(req); await removeFromQueue(req); }
    catch (e) { throw e; } // 失败抛错，下次再试
  }
}
\`\`\`

踩坑：Background Sync 兼容性有限（Chrome 支持，Safari 不全）；Periodic Sync（周期同步）需用户授权；离线操作队列存 IndexedDB，sync 时重放；Workbox BackgroundSync Plugin 封装。`,
    keyPoints: ["网络恢复自动重试", "SW 监听 sync 事件", "队列存 IndexedDB 重放"],
    followUps: ["Periodic Sync 如何用？", "Workbox BackgroundSync 原理？"],
    favorited: false,
  },
  {
    id: "fe-174",
    nodeId: "pwa-offline",
    question: "离线优先（Offline First）策略如何设计？",
    bigTech: false,
    answer: `离线优先：默认用缓存，后台同步更新。策略：读用 StaleWhileRevalidate（返回缓存同时更新），写用队列暂存待同步。让应用离线可用，在线时同步。

\`\`\`js
// Workbox StaleWhileRevalidate
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
registerRoute(({ url }) => url.pathname.startsWith("/api/"), new StaleWhileRevalidate({ cacheName: "api" }));
// 离线写：存队列，联网同步
import { Queue } from "workbox-background-sync";
const queue = new Queue("writes");
async function postData(data) {
  try { await fetch("/api", { method: "POST", body: JSON.stringify(data) }); }
  catch { await queue.pushRequest({ request: new Request("/api", { method: "POST", body: JSON.stringify(data) }) }); }
}
\`\`\`

踩坑：离线优先适合读多写少（如资讯/笔记）；冲突处理（多端编辑）需版本号/时间戳；UI 提示离线状态和待同步数量；StaleWhileRevalidate 牺牲一致性换可用性。`,
    keyPoints: ["StaleWhileRevalidate 读缓存后台更新", "写用队列待同步", "UI 提示离线状态"],
    followUps: ["离线冲突如何解决？", "StaleWhileRevalidate 和 NetworkFirst 区别？"],
    favorited: false,
  },
  {
    id: "fe-175",
    nodeId: "pwa-offline",
    question: "PWA 安装提示（Add to Home Screen）如何实现？",
    bigTech: false,
    answer: `PWA 安装需满足：HTTPS、manifest.json（name/icons/start_url/display:standalone）、注册 SW、有图标。beforeinstallprompt 事件可自定义安装按钮（浏览器自动提示需用户交互）。

\`\`\`html
<!-- manifest.json -->
{ "name": "MyApp", "short_name": "App", "start_url": "/", "display": "standalone",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }] }
<link rel="manifest" href="/manifest.json" />
\`\`\`
\`\`\`js
// 自定义安装按钮
let deferredPrompt;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; showInstallBtn(); });
installBtn.onclick = async () => {
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") console.log("已安装");
  deferredPrompt = null;
};
// 检测已安装
window.addEventListener("appinstalled", () => console.log("已安装"));
\`\`\`

踩坑：beforeinstallprompt 在 iOS Safari 不触发（iOS 需手动分享→添加到主屏）；display:standalone 全屏无浏览器栏；已安装不再触发 beforeinstallprompt。`,
    keyPoints: ["需 HTTPS+manifest+SW", "beforeinstallprompt 自定义按钮", "iOS 需手动添加"],
    followUps: ["manifest 的 display 各值？", "如何检测已安装 PWA？"],
    favorited: false,
  },
  // ===== 26. ai-sdk-frontend AI SDK 前端集成 =====
  {
    id: "fe-176",
    nodeId: "ai-sdk-frontend",
    question: "Vercel AI SDK v5 的 useChat 如何工作？核心 API？",
    bigTech: true,
    answer: `useChat（v5 从 @ai-sdk/react 导入，v4 的 ai/react 已移除）封装消息流式接收、状态管理、发送逻辑。v5 核心变化：传输层抽象为 transport（DefaultChatTransport）；不再托管输入框状态（input/handleInputChange/handleSubmit 移除，输入自己管）；消息为 UIMessage，内容在 parts 数组而非单一 content 字符串；状态用 status（submitted/streaming/ready/error）。

\`\`\`tsx
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

function Chat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState(""); // v5：输入框状态自己管理
  const busy = status === "submitted" || status === "streaming";
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.parts.map((p, i) => p.type === "text" ? <span key={i}>{p.text}</span> : null)}
        </div>
      ))}
      <form onSubmit={e => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ text: input }); // v5：sendMessage 替代 handleSubmit
        setInput("");
      }}>
        <input value={input} onChange={e => setInput(e.target.value)} disabled={busy} />
        <button type="submit">发送</button>
        {busy && <button type="button" onClick={stop}>停止</button>}
      </form>
    </div>
  );
}
\`\`\`

踩坑：v5 消息渲染要遍历 parts（支持文本/工具/文件等多部分）；setMessages 仍可编辑/删除历史；v4 的 api 选项收进 transport；共享会话状态改为显式共享 Chat 实例（不再按 id 隐式共享）。`,
    keyPoints: ["@ai-sdk/react + transport 架构", "sendMessage 替代 handleSubmit，输入自管", "UIMessage.parts 替代 content", "status 状态机"],
    followUps: ["useChat 如何处理工具调用？", "transport 抽象解决什么问题？"],
    favorited: false,
  },
  {
    id: "fe-177",
    nodeId: "ai-sdk-frontend",
    question: "AI SDK 如何在前端实现流式 UI（Streaming UI）？",
    bigTech: true,
    answer: `流式 UI：后端流式返回 token，前端逐 token 渲染（打字机效果）。AI SDK v5 用 streamText + useChat，后端返回 UIMessage 流，前端 React state 逐块更新。

\`\`\`ts
// 后端 route.ts（AI SDK v5）
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: openai("gpt-4o"),
    messages: await convertToModelMessages(messages), // UIMessage → 模型消息
  });
  return result.toUIMessageStreamResponse(); // v5：替代 v4 的 toDataStreamResponse
}
// 前端：useChat 自动接收流，末条消息的 text part 逐 token 增长
const { messages } = useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) });
const last = messages[messages.length - 1];
last?.parts.filter(p => p.type === "text").map(p => p.text).join(""); // 实时增长
\`\`\`

踩坑：v5 服务端要用 convertToModelMessages 把前端 UIMessage 转成模型消息；流式 UI 用 useChat 自动处理，手动需解析 SSE/ReadableStream；逐 token 渲染避免整段闪烁；Markdown 流式需增量解析（未闭合标签处理）；高频更新可用 startTransition 防卡顿。`,
    keyPoints: ["streamText + toUIMessageStreamResponse", "convertToModelMessages 转换", "useChat 逐 token 更新 text part", "Markdown 增量解析"],
    followUps: ["Markdown 流式如何处理未闭合标签？", "流式渲染如何防卡顿？"],
    favorited: false,
  },
  {
    id: "fe-178",
    nodeId: "ai-sdk-frontend",
    question: "AI SDK 工具调用（Tool Calling）前端如何渲染？",
    bigTech: false,
    answer: `工具调用：模型决定调工具（如查天气/搜索），前端渲染工具状态（调用中/结果），结果回传模型继续。AI SDK v5 中工具调用以 parts 形式混入 UIMessage：每条助手消息的 parts 数组里会出现类型为 tool-{工具名} 的 part，带 state（输入流式中/输入就绪/有结果/出错），替代 v4 的 message.toolInvocations。

\`\`\`tsx
// 后端：定义工具（v5 用 inputSchema 描述入参）
const result = streamText({
  model, messages: await convertToModelMessages(messages),
  tools: {
    weather: tool({
      description: "查天气",
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => getWeather(city),
    }),
  },
});
// 前端：遍历 parts 渲染工具状态（part.type 形如 "tool-weather"）
{messages.map(m => m.parts.map((p, i) => {
  if (p.type === "tool-weather") {
    return (
      <div key={p.toolCallId}>
        {p.state !== "output-available" && <Spinner>调用天气工具…</Spinner>}
        {p.state === "output-available" && <Weather data={p.output} />}
      </div>
    );
  }
  return p.type === "text" ? <span key={i}>{p.text}</span> : null;
}))}
\`\`\`

踩坑：v5 工具 part 的 state 覆盖"入参流式→入参就绪→出参就绪/出错"全过程，比 v4 的 call/result 两态更细；客户端执行的工具用 onToolCall 回调 + addToolOutput 回传结果（替代 v4 的 addToolResult）；多步工具链由服务端 stopWhen 条件控制（v4 的 maxSteps 已移除）。`,
    keyPoints: ["工具调用是 parts 数组中的 tool-* part", "state 覆盖输入到输出全过程", "onToolCall + addToolOutput 客户端回传", "maxSteps 移除改服务端 stopWhen"],
    followUps: ["多轮工具调用如何处理？", "human-in-the-loop 如何实现？"],
    favorited: false,
  },
  {
    id: "fe-179",
    nodeId: "ai-sdk-frontend",
    question: "前端如何实现多模型切换（GPT/Claude/Gemini）？",
    bigTech: false,
    answer: `AI SDK 统一接口，后端切换 model 即可，前端传 model 参数。多模型对比可并发请求多个，UI 并排显示。

\`\`\`ts
// 后端：按参数选模型（v5）
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const m = model === "claude" ? anthropic("claude-sonnet-4") : openai("gpt-4o");
  return streamText({
    model: m,
    messages: await convertToModelMessages(messages),
  }).toUIMessageStreamResponse();
}
// 前端：v5 通过 transport 的 body 传额外参数
const chat = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat", body: { model: selectedModel } }),
});
<select onChange={e => setSelectedModel(e.target.value)}>
  <option value="gpt">GPT</option>
  <option value="claude">Claude</option>
</select>
\`\`\`

踩坑：v5 的 body 参数移到 DefaultChatTransport 上（v4 在 useChat 顶层）；不同模型 token 计费/上下文长度不同，前端需提示；流式格式可能略异（AI SDK 已统一为 UIMessage 流）；并发对比用 Promise.all 但注意限流。`,
    keyPoints: ["AI SDK 统一接口切模型", "v5 body 走 transport", "并发可对比多模型"],
    followUps: ["不同模型流式格式差异？", "如何做模型 A/B 测试？"],
    favorited: false,
  },
  {
    id: "fe-180",
    nodeId: "ai-sdk-frontend",
    question: "AI SDK 的流式传输协议是什么？v5 有哪些变化？",
    bigTech: false,
    answer: `AI SDK 前后端之间通过自定义流式协议传输：v4 是 Data Stream 协议（前缀标记 text/tool-call/tool-result/error），v5 改为 UIMessage Stream 协议——基于 SSE，每个事件携带结构化 chunk（文本增量、工具入参/出参、错误、结束信号），与 UIMessage 的 parts 模型一一对应，前端 useChat 据此增量拼装消息。

\`\`\`text
# v4 Data Stream 格式（已废弃，简化示意）
0:"Hello"        # text chunk
9:{"toolCallId":"x","toolName":"weather","args":{}}  # tool call
a:{"toolCallId":"x","result":{}}  # tool result
\`\`\`
\`\`\`ts
// v5 服务端：生成 UIMessage Stream 响应
return result.toUIMessageStreamResponse();
// 前端 useChat 经 transport 自动解析，无需手写解析器
\`\`\`

踩坑：v5 协议面向 parts 模型，一条消息可由多个 chunk 拼出多个 part（文本+多个工具调用交错）；手动消费时用 SDK 提供的读取工具而非自行 split 文本；自定义数据（如溯源引用）可通过 transient data part 下发。`,
    keyPoints: ["v5 改 UIMessage Stream 协议（SSE）", "chunk 与 parts 模型对应", "前端 useChat 自动解析"],
    followUps: ["UIMessage Stream 和普通 SSE 区别？", "如何下发自定义数据？"],
    favorited: false,
  },
  {
    id: "fe-181",
    nodeId: "ai-sdk-frontend",
    question: "AI 请求前端如何做错误处理和重试？",
    bigTech: false,
    answer: `AI 请求可能失败（限流/超时/模型错误）。useChat 的 onError 回调处理，重试调 regenerate（v5 替代 v4 的 reload）。限流（429）指数退避，超时 AbortController。

\`\`\`tsx
const { messages, regenerate, error } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" }),
  onError: (err) => {
    console.error(err);
    toast.error("请求失败，请重试");
  },
});
// 重试上一条（v5：regenerate 重新生成最后的助手回复）
<button onClick={() => regenerate()}>重试</button>
{error && <div className="error">{error.message}</div>}
// 后端限流处理
export async function POST(req) {
  try { return await streamText({...}).toUIMessageStreamResponse(); }
  catch (e) {
    if (e.status === 429) return Response.json({ error: "请求过快" }, { status: 429 });
    return Response.json({ error: "服务错误" }, { status: 500 });
  }
}
\`\`\`

踩坑：流式中途断开需 regenerate 重试（已收内容可能丢失）；429 限流前端需退避提示用户等待；错误状态 UI 明确（重试按钮），不要静默失败。`,
    keyPoints: ["onError 回调处理", "regenerate 重试", "429 限流退避"],
    followUps: ["流式中途断开如何恢复？", "如何做请求限流？"],
    favorited: false,
  },
  {
    id: "fe-182",
    nodeId: "ai-sdk-frontend",
    question: "前端如何统计 Token 用量和成本？",
    bigTech: false,
    answer: `AI SDK 的 onFinish 回调返回 usage（prompt/completion/total tokens），前端累计统计成本。不同模型单价不同需按模型计算。

\`\`\`ts
// 后端：onFinish 上报 usage
const result = streamText({
  model, messages,
  onFinish: ({ usage, finishReason }) => {
    console.log(usage); // { promptTokens, completionTokens, totalTokens }
    saveUsage(userId, model, usage); // 存库统计
  },
});
// 前端：useChat 的 onFinish 拿 usage
const { } = useChat({
  onFinish: (message) => { /* message 含 usage（如后端返回） */ },
});
// 成本计算
const PRICE = { "gpt-4": { input: 0.03, output: 0.06 } }; // 每 1k token 美元
const cost = (usage.promptTokens / 1000 * PRICE[model].input) + (usage.completionTokens / 1000 * PRICE[model].output);
\`\`\`

踩坑：usage 在流结束后才有（onFinish）；本地估算用 tiktoken（JS 版）计 token；上下文超限需截断历史（按 token 数）；成本统计在后端更准（防前端篡改）。`,
    keyPoints: ["onFinish 回调拿 usage", "按模型单价算成本", "tiktoken 本地估算"],
    followUps: ["如何本地估算 token？", "上下文超限如何截断？"],
    favorited: false,
  },
  // ===== AI 流式 UI 实现（ai-streaming-ui） =====
  {
    id: "fe-183",
    nodeId: "ai-streaming-ui",
    question: "前端如何用 SSE（Server-Sent Events）实现 AI 流式输出？",
    bigTech: true,
    answer: `结论：SSE 是 AI 流式输出的主流方案，基于 HTTP 长连接、服务端单向推送。EventSource API 自动重连，但只支持 GET；POST 场景用 fetch + ReadableStream 手动解析。

案例：字节豆包网页版用 SSE 接收模型流式 token，前端 EventSource 监听 onmessage 逐字追加到气泡。由于需要 POST body 带历史消息，实际用 fetch 读取 ReadableStream，手动按行解析 data: 前缀。

\`\`\`ts
// 方案一：EventSource（仅 GET，适合简单场景）
const es = new EventSource("/api/stream?prompt=你好");
es.onmessage = (e) => {
  if (e.data === "[DONE]") { es.close(); return; }
  appendToken(JSON.parse(e.data).text);
};
es.onerror = () => es.close();

// 方案二：fetch + ReadableStream（POST，主流 AI 场景）
async function streamChat(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\\n");
    buffer = lines.pop()!;
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        appendToken(JSON.parse(data).content);
      }
    }
  }
}
\`\`\`

踩坑：EventSource 不支持自定义 header（鉴权需走 cookie 或 query）；fetch 方案需手动处理半行 buffer（chunk 可能切断一行）；SSE 连接有最大连接数限制（HTTP/1.1 每域名 6 个），HTTP/2 无此限制。`,
    keyPoints: ["SSE 单向推送基于 HTTP 长连接", "EventSource 仅 GET", "fetch+ReadableStream 支持 POST"],
    followUps: ["SSE 和 WebSocket 区别？", "如何处理 SSE 断线重连？"],
    favorited: false,
  },
  {
    id: "fe-184",
    nodeId: "ai-streaming-ui",
    question: "ReadableStream 和 TransformStream 在流式渲染中怎么用？",
    bigTech: false,
    answer: `结论：ReadableStream 是可读字节流，用于消费 fetch 响应；TransformStream 可在管道中转换数据，适合做"原始 SSE 文本 → 结构化 chunk"的中间处理层，链式 pipeThrough 组合。

案例：阿里通义千问前端用 TransformStream 把 SSE 原始字节流先解码成文本行，再解析成 JSON chunk，最后过滤掉心跳 keepalive 事件，管道式处理代码清晰。

\`\`\`ts
// TransformStream：SSE 原始字节 → 结构化 chunk
function createSSEParser() {
  let buffer = "";
  return new TransformStream<Uint8Array, { type: string; content: string }>({
    transform(chunk, controller) {
      buffer += new TextDecoder().decode(chunk, { stream: true });
      const lines = buffer.split("\\n");
      buffer = lines.pop()!;
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") { controller.terminate(); return; }
        try { controller.enqueue(JSON.parse(data)); } catch {}
      }
    },
    flush(controller) { /* 处理 buffer 残留 */ },
  });
}

// 管道组合：fetch body → SSE 解析 → 业务过滤
const res = await fetch("/api/chat", { method: "POST", body: "..." });
const pipeline = res.body!
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(createSSEParser())
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      if (chunk.type !== "ping") controller.enqueue(chunk); // 过滤心跳
    },
  }));
for await (const chunk of pipeline) renderToken(chunk.content);
\`\`\`

踩坑：TransformStream 的 transform 是同步 enqueue 但可返回 Promise；flush 在流关闭时调用，别漏处理 buffer 残留；TextDecoderStream 是内置解码 TransformStream，比手动 new TextDecoder 更省事。`,
    keyPoints: ["ReadableStream 消费流", "TransformStream 管道转换", "pipeThrough 链式组合"],
    followUps: ["pipeThrough 的背压如何工作？", "TransformStream 和 WritableStream 区别？"],
    favorited: false,
  },
  {
    id: "fe-185",
    nodeId: "ai-streaming-ui",
    question: "Token 流式渲染如何实现逐字/逐词打字机效果？",
    bigTech: true,
    answer: `结论：流式 token 到达后直接 setState 追加即可实现"逐块出现"；要"逐字打字机"效果需用队列 + requestAnimationFrame 按帧消费，平滑视觉但不丢 token。关键是用 ref 缓冲避免渲染抖动。

案例：Kimi 网页版长文回答用打字机效果，token 高速到达时按 16ms 帧节流逐字渲染，避免一次性塞入大段文本导致视觉跳跃，体验更接近"AI 在思考书写"。

\`\`\`ts
function useTypewriter() {
  const [display, setDisplay] = useState("");
  const queue = useRef<string[]>([]);
  const raf = useRef<number>();

  const push = (token: string) => {
    // token 拆成单字符入队
    for (const ch of token) queue.current.push(ch);
    if (!raf.current) tick();
  };

  const tick = () => {
    raf.current = requestAnimationFrame(() => {
      // 每帧消费 N 个字符（控制速度）
      const batch = queue.current.splice(0, 4).join("");
      setDisplay((d) => d + batch);
      if (queue.current.length) tick();
      else raf.current = undefined;
    });
  };

  useEffect(() => () => cancelAnimationFrame(raf.current!), []);
  return { display, push };
}

// 使用：SSE token 到达 → push
const { display, push } = useTypewriter();
streamChat(messages, (token) => push(token));
\`\`\`

踩坑：token 到达速度远快于渲染时队列会堆积，需设上限丢弃或加速；组件卸载必须 cancelAnimationFrame 否则 setState 报错；打字机效果仅用于展示，实际数据用完整文本存储（display 不能当 source of truth）。`,
    keyPoints: ["队列缓冲 + rAF 按帧消费", "ref 存队列避免重渲染", "卸载清理 rAF"],
    followUps: ["如何控制打字机速度？", "token 积压如何降级？"],
    favorited: false,
  },
  {
    id: "fe-186",
    nodeId: "ai-streaming-ui",
    question: "Markdown 流式渲染如何避免半截代码块/表格闪烁？",
    bigTech: true,
    answer: `结论：流式 Markdown 难点是"不完整语法"（如代码块只收了 \`\`\` 没收结束符）。方案：用支持增量解析的库（react-markdown + 流式容错），或维护"完整段落"缓冲——只有遇到双换行才渲染一个块，代码块用计数器判断是否闭合。

案例：ChatGPT 前端流式 Markdown 渲染时，代码块未闭合会先以纯文本灰色显示，闭合后切换为高亮代码块，避免中途闪烁。腾讯 ima.copilot 用类似策略处理表格流式。

\`\`\`tsx
// 方案：流式安全的 Markdown 渲染
import ReactMarkdown from "react-markdown";

function StreamMarkdown({ content }: { content: string }) {
  // 检测未闭合代码块，补一个临时结束符让解析器不报错
  const safe = ensureClosedCodeFences(content);
  return (
    <ReactMarkdown
      components={{
        // react-markdown v9 起移除了 inline prop，
        // 改为按节点判定：块级代码会带 language-* 类名/处于 pre 中，行内代码则没有
        code({ node, className, children, ...rest }) {
          const isBlock = /language-/.test(className ?? "");
          return isBlock ? (
            <pre><code className={className}>{children}</code></pre>
          ) : (
            <code className={className} {...rest}>{children}</code>
          );
        },
        // 或者分别覆写 pre（块）与 code（行内默认渲染）更稳妥
      }}
    >
      {safe}
    </ReactMarkdown>
  );
}

function ensureClosedCodeFences(md: string): string {
  const fences = (md.match(/\`\`\`/g) || []).length;
  // 奇数个围栏 → 未闭合，补结束符
  return fences % 2 === 1 ? md + "\\n\`\`\`" : md;
}

// 段落级缓冲：双换行才渲染完整块
function useChunkedMd(stream: string) {
  const [blocks, setBlocks] = useState<string[]>([]);
  const idx = stream.lastIndexOf("\\n\\n");
  if (idx > 0) setBlocks(stream.slice(0, idx).split("\\n\\n"));
  // 最后未结束的块单独流式渲染
  const partial = stream.slice(idx + 2);
  return { blocks, partial };
}
\`\`\`

踩坑：每次 token 都全量 re-parse Markdown 性能差，长文本需虚拟化或 memo；react-markdown v9 移除了 code 组件的 inline prop，需按节点类型（language-* 类名或父级 pre）判定块级/行内；流式时代码高亮延迟切换会跳动，用 opacity 过渡；表格流式未闭合会渲染异常，建议表格整块收完再渲染。`,
    keyPoints: ["未闭合代码块补结束符", "段落级缓冲双换行", "v9 按节点类型判定 inline", "增量解析容错"],
    followUps: ["流式代码高亮如何平滑？", "表格流式如何处理？"],
    favorited: false,
  },
  {
    id: "fe-187",
    nodeId: "ai-streaming-ui",
    question: "如何用 AbortController 中断流式 AI 请求？",
    bigTech: true,
    answer: `结论：AbortController 是中断 fetch 流式请求的标准方案。new AbortController() 传 signal 给 fetch，调用 abort() 即可取消。中断后 reader.read() 抛 AbortError，需 try/catch 处理，已接收内容保留显示。

案例：豆包/通义网页版"停止生成"按钮即用 AbortController，点击后流立即中断，已输出文本保留，UI 从"生成中"切回"可输入"。字节内部规范要求所有流式请求必须支持中断，否则长文生成卡死无法操作。

\`\`\`ts
function useStreamChat() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController>();

  const send = async (messages) => {
    abortRef.current?.abort(); // 先中断上一个
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
        signal: ctrl.signal,
      });
      const reader = res.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + new TextDecoder().decode(value));
      }
    } catch (e) {
      if (e.name === "AbortError") {
        console.log("用户主动中断，已保留内容");
      } else throw e;
    } finally {
      setStreaming(false);
    }
  };

  const stop = () => abortRef.current?.abort();
  return { text, streaming, send, stop };
}
// UI：<button onClick={stop} disabled={!streaming}>停止生成</button>
\`\`\`

踩坑：abort 后 reader.read() 抛错必须 catch，否则 unhandledrejection；中断不等于后端停止计费（需后端配合监听 signal）；连点多次 send 要确保旧请求 abort 完再发新的，避免竞态。`,
    keyPoints: ["AbortController + signal", "abort 后 catch AbortError", "保留已收内容"],
    followUps: ["中断后后端如何感知？", "如何恢复中断的流？"],
    favorited: false,
  },
  {
    id: "fe-188",
    nodeId: "ai-streaming-ui",
    question: "流式 AI 场景下前端如何处理速率限制（429）与背压？",
    bigTech: false,
    answer: `结论：429 限流需指数退避重试并提示用户；背压（生成快于渲染）用队列缓冲 + 丢弃策略。前端展示"限流中"状态，避免无脑重试打死服务端。

案例：DeepSeek 高峰期频发 429，前端用指数退避（1s/2s/4s 上限 8s）重试 3 次，仍失败则提示"当前繁忙，稍后重试"。同时 token 流入快于 Markdown 渲染时，队列超阈值降级为"整段追加"而非逐字。

\`\`\`ts
// 指数退避重试
async function fetchWithRetry(url, opts, maxRetry = 3) {
  for (let i = 0; i < maxRetry; i++) {
    const res = await fetch(url, opts);
    if (res.status !== 429) return res;
    const retryAfter = Number(res.headers.get("Retry-After")) || Math.pow(2, i);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
  }
  throw new Error("限流，请稍后重试");
}

// 背压处理：队列超限降级
function useBackpressureRender() {
  const queue = useRef<string[]>([]);
  const [text, setText] = useState("");
  const push = (token: string) => {
    queue.current.push(token);
    if (queue.current.length > 200) {
      // 积压超限：一次性 flush，放弃逐字效果
      setText((t) => t + queue.current.join(""));
      queue.current = [];
    }
  };
  return { text, push };
}
\`\`\`

踩坑：429 必须读 Retry-After header 决定等待时间，别固定 sleep；退避上限要设封顶值防止指数爆炸；背压降级要保证不丢 token（降级是渲染策略变，数据要完整）；重试请求注意 idempotency，避免重复计费。`,
    keyPoints: ["429 指数退避读 Retry-After", "背压队列降级 flush", "限流状态 UI 提示"],
    followUps: ["Retry-After 如何计算？", "背压降级会丢数据吗？"],
    favorited: false,
  },
  {
    id: "fe-189",
    nodeId: "ai-streaming-ui",
    question: "流式渲染中途出错（网络断开/JSON 解析失败）如何恢复？",
    bigTech: false,
    answer: `结论：流式错误分两类——网络中断用断点续传或 regenerate 重试（AI SDK v5）；数据解析错误需容错跳过坏 chunk。策略：保留已收内容，错误状态明确，提供"重试"而非清空。用 ErrorBoundary 兜底渲染崩溃。

案例：飞书智能助手流式回答时遇网络抖动，前端保留已生成文本，底部显示"连接中断，点击重试"，重试时把已收内容作为 prefix 续写（后端支持）或重新生成。JSON 解析失败的单个 chunk 跳过不中断整体流。

\`\`\`ts
async function streamWithRecovery(messages, onToken, onError) {
  let received = "";
  try {
    const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages }) });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\\n");
      // 最后一段可能没有换行符（半行残段），pop 回 buffer 等下次拼完整再解析
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const chunk = JSON.parse(line.slice(6)); // 单 chunk 解析失败跳过
          received += chunk.content;
          onToken(chunk.content);
        } catch {
          console.warn("跳过坏 chunk:", line);
        }
      }
    }
  } catch (e) {
    onError(e, received); // 传出已收内容，供重试使用
  }
}

// 重试：用已收内容作为续写前缀
const retry = () => streamWithRecovery(
  [{ role: "assistant", content: received }, ...rest],
  onToken, onError
);
\`\`\`

踩坑：buffer 按行 split 后最后一段可能是不完整的半行（chunk 边界切断），必须 pop 回 buffer 留待下次拼接，否则残段被当完整行解析报错或丢失；单个 chunk JSON 解析失败不能 throw 中断整个流，要 try/catch 跳过；网络断开重试需考虑"是否重复计费"，最好后端支持 lastEventId 续传；ErrorBoundary 包裹流式渲染区，防 Markdown 解析崩溃白屏。`,
    keyPoints: ["buffer 残段 pop 回等下次拼接", "单 chunk 解析失败跳过不中断流", "保留已收内容供重试", "ErrorBoundary 兜底"],
    followUps: ["如何实现断点续传？", "ErrorBoundary 如何捕获流式错误？"],
    favorited: false,
  },
  // ===== Prompt 工程前端（ai-prompt-ui） =====
  {
    id: "fe-190",
    nodeId: "ai-prompt-ui",
    question: "前端如何设计一个支持变量插值的 Prompt 编辑器？",
    bigTech: true,
    answer: `结论：Prompt 编辑器需识别 {{变量}} 占位符并高亮，支持变量列表插入、实时预览渲染结果。技术方案：textarea + overlay 高亮层（背景同步滚动），或用 CodeMirror/Lexical 富文本插件。变量插值用正则匹配占位符替换为实际值。

案例：字节扣子（Coze）的 Prompt 编辑器用 CodeMirror 自定义 mode 高亮 {{变量}}，右侧面板实时预览插值后的完整 prompt，变量从知识库/用户输入/上下文自动注入，调试时一键切换变量值看效果。

\`\`\`tsx
// 轻量方案：textarea + overlay 高亮
function PromptEditor({ value, onChange, variables }) {
  const highlight = (text) =>
    text.replace(/\\{\\{(\\w+)\\}\\}/g, (_, name) =>
      \`<span class="var \${variables[name] ? "" : "error"}">\${name}</span>\`
    );
  return (
    <div className="relative">
      <div
        className="overlay"
        dangerouslySetInnerHTML={{ __html: highlight(value) }}
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="transparent-input"
      />
    </div>
  );
}

// 变量插值渲染
function interpolate(template, vars) {
  return template.replace(/\\{\\{(\\w+)\\}\\}/g, (_, name) =>
    vars[name] ?? \`{{\${name}}}\` // 缺失变量保留占位符
  );
}
const preview = interpolate(prompt, { user_name: "张三", task: "写周报" });
\`\`\`

踩坑：textarea 和 overlay 必须 font/line-height/padding 完全一致否则错位；未定义变量要标红提示别静默替换成空；插值结果要转义防注入（用户输入含 {{}} 会被二次解析，用占位符表而非正则替换更安全）。`,
    keyPoints: ["{{变量}} 占位符正则匹配", "textarea+overlay 高亮", "实时预览插值"],
    followUps: ["如何防止用户输入的 {{}} 被误解析？", "如何支持条件分支变量？"],
    favorited: false,
  },
  {
    id: "fe-191",
    nodeId: "ai-prompt-ui",
    question: "前端如何做 Prompt 模板管理与版本对比？",
    bigTech: false,
    answer: `结论：Prompt 模板需结构化存储（标题/内容/变量/标签/版本号），版本对比用 diff 算法高亮增删改。前端用 IndexedDB 存模板库，版本快照每次保存生成，对比视图左右分栏 + 行级 diff。

案例：阿里百炼平台的 Prompt 管理支持版本树，每次发布生成快照，A/B 测试时两个版本并行跑评估集，diff 视图高亮 prompt 改动点，方便回滚到效果更好的旧版本。

\`\`\`ts
interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  variables: string[];
  version: number;
  updatedAt: string;
}

// IndexedDB 存储模板与版本快照
async function saveVersion(template: PromptTemplate) {
  const db = await openDB("prompt-store");
  await db.put("templates", template);
  await db.put("versions", { ...template, vid: crypto.randomUUID() });
}

// 简易行级 diff
function diffLines(oldStr: string, newStr: string) {
  const oldLines = oldStr.split("\\n");
  const newLines = newStr.split("\\n");
  const result = [];
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    if (oldLines[i] === newLines[i]) {
      result.push({ type: "same", text: newLines[i] });
    } else {
      if (oldLines[i] !== undefined) result.push({ type: "del", text: oldLines[i] });
      if (newLines[i] !== undefined) result.push({ type: "add", text: newLines[i] });
    }
  }
  return result; // 渲染：del 红色、add 绿色
}
\`\`\`

踩坑：行级 diff 对长 prompt 不够精准，用 LCS 算法或 diff-match-patch 库做字符级；版本太多要支持按标签/时间筛选；回滚不是删除新版本而是新建分支，保留历史可追溯。`,
    keyPoints: ["模板结构化存储 IndexedDB", "版本快照 diff 对比", "支持回滚分支"],
    followUps: ["字符级 diff 怎么实现？", "如何做 A/B 评估？"],
    favorited: false,
  },
  {
    id: "fe-192",
    nodeId: "ai-prompt-ui",
    question: "前端如何实现 Prompt 的 Few-shot 示例动态拼装？",
    bigTech: false,
    answer: `结论：Few-shot 示例需根据场景动态选取（按相似度检索或按标签过滤），拼装到 prompt 中。前端维护示例库，调用时按策略选出 N 个插入到 system/user message 之间，控制总 token 不超限。

案例：美团客服 AI 助手按用户问题类别从示例库检索 3 个最相似 case 作为 few-shot，提升回答准确率。前端用向量相似度（预计算 embedding 存 IndexedDB）或关键词匹配选例，拼装时按"问题→答案"格式化。

\`\`\`ts
interface FewShotExample {
  id: string;
  input: string;
  output: string;
  tags: string[];
  embedding?: number[]; // 预计算向量
}

// 按相似度检索 few-shot（余弦相似度）
function selectFewShot(query: string, examples: FewShotExample[], n = 3) {
  const qVec = embed(query); // 调 embedding API
  return examples
    .map((ex) => ({ ex, score: cosine(qVec, ex.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ ex }) => ex);
}

// 拼装到 prompt
function buildPrompt(system: string, query: string, shots: FewShotExample[]) {
  const shotBlock = shots
    .map((s) => \`输入：\${s.input}\\n输出：\${s.output}\`)
    .join("\\n\\n");
  return \`\${system}\\n\\n示例：\\n\${shotBlock}\\n\\n输入：\${query}\\n输出：\`;
}

function cosine(a: number[], b: number[]) {
  return a.reduce((s, v, i) => s + v * b[i], 0) /
    (Math.hypot(...a) * Math.hypot(...b));
}
\`\`\`

踩坑：few-shot 太多会挤占上下文（每个示例算 token），需动态调整 n；示例顺序影响效果（放最相关的在最后）；示例输出格式要和期望输出一致，否则模型混淆；相似度检索在量大时需向量数据库（如 Chroma）。`,
    keyPoints: ["向量相似度检索 few-shot", "示例按格式拼装", "控制总 token"],
    followUps: ["embedding 如何预计算？", "few-shot 数量怎么定？"],
    favorited: false,
  },
  {
    id: "fe-193",
    nodeId: "ai-prompt-ui",
    question: "前端如何做 Prompt 的 Token 计数与超限截断？",
    bigTech: true,
    answer: `结论：前端用 tiktoken（JS 版 js-tiktoken）本地估算 token 数，超限时按优先级截断——保留 system + 最近消息，丢弃历史最远的多轮对话。不同模型 tokenizer 不同，需按模型加载对应编码。

案例：腾讯混元网页版输入框实时显示 token 计数和剩余配额，超限时红色提示并自动截断最早的历史消息，保留 system prompt 和当前问题。长文档场景按段落滑窗截断。

\`\`\`ts
import { encodingForModel } from "js-tiktoken";

function countTokens(text: string, model = "gpt-4") {
  const enc = encodingForModel(model);
  return enc.encode(text).length;
}

// 多轮对话截断：超限时从最早 user/assistant 对开始删
function truncateMessages(
  messages: { role: string; content: string }[],
  maxTokens: number,
  model = "gpt-4"
) {
  const enc = encodingForModel(model);
  let total = messages.reduce((s, m) => s + enc.encode(m.content).length, 0);
  if (total <= maxTokens) return messages;
  // 保留 system（index 0）和最后一条
  const system = messages.filter((m) => m.role === "system");
  const dialog = messages.filter((m) => m.role !== "system");
  while (dialog.length > 2 && total > maxTokens) {
    const removed = dialog.shift()!; // 删最早的
    total -= enc.encode(removed.content).length;
  }
  return [...system, ...dialog];
}

// UI 实时计数
const tokens = countTokens(promptText);
<div className={tokens > limit ? "over" : ""}>{tokens}/{limit} tokens</div>
\`\`\`

踩坑：tiktoken WASM 包体积大（~2MB），需按需加载或用 worker；不同模型 token 计数不同（Claude vs GPT）；截断要保持对话连贯性，别删到一半的问答对；前端计数仅估算，以服务端为准。`,
    keyPoints: ["js-tiktoken 本地计数", "按优先级截断历史", "保留 system+最近消息"],
    followUps: ["tiktoken 包体积如何优化？", "不同模型 tokenizer 差异？"],
    favorited: false,
  },
  {
    id: "fe-194",
    nodeId: "ai-prompt-ui",
    question: "前端如何实现 Prompt 的结构化输出约束（JSON Schema）？",
    bigTech: true,
    answer: `结论：结构化输出用 response_format 指定 json_schema（OpenAI/Gemini 支持），或用 Zod schema + generateObject（Vercel AI SDK）。前端定义 schema，模型返回 JSON，前端用 Zod 校验后类型安全消费。

案例：飞书多维表格 AI 字段用 JSON Schema 约束模型输出结构化数据（字段名/类型/值），保证直接写入表格。Vercel AI SDK 的 generateObject + Zod 让前端拿到类型安全的对象，无需手动 JSON.parse 容错。

\`\`\`ts
import { generateObject } from "ai";
import { z } from "zod";

// 定义输出 schema
const schema = z.object({
  summary: z.string().describe("一句话总结"),
  sentiment: z.enum(["正面", "中性", "负面"]),
  keywords: z.array(z.string()).max(5),
  actionItems: z.array(z.object({
    task: z.string(),
    priority: z.enum(["高", "中", "低"]),
  })),
});

const { object } = await generateObject({
  model,
  schema,
  prompt: \`分析以下反馈：\${userFeedback}\`,
});
// object 已类型安全：{ summary: string; sentiment: ...; keywords: string[]; ... }
console.log(object.actionItems[0].task);

// OpenAI 原生 response_format
const res = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: {
    type: "json_schema",
    json_schema: { name: "feedback", schema: zodToJsonSchema(schema) },
  },
  messages: [...],
});
\`\`\`

踩坑：模型可能不严格遵循 schema（尤其小模型），需 Zod safeParse 容错 + 重试；嵌套深层 schema 模型易出错，尽量扁平化；generateObject 内部会自动重试修复格式，但消耗更多 token；enum 值要在 prompt 里明确列出。`,
    keyPoints: ["Zod schema 约束输出", "generateObject 类型安全", "response_format json_schema"],
    followUps: ["模型不遵循 schema 怎么办？", "Zod 如何转 JSON Schema？"],
    favorited: false,
  },
  {
    id: "fe-195",
    nodeId: "ai-prompt-ui",
    question: "前端如何做 Prompt 的 A/B 测试与效果评估？",
    bigTech: false,
    answer: `结论：A/B 测试需分流（按用户 hash 分桶），两个 prompt 版本并行跑同一批测试用例，收集输出质量评分（人工/LLM-as-judge）。前端展示对比看板：胜率、平均分、耗时、token 成本。

案例：蚂蚁智能客服用 A/B 测试对比"直接回答"vs"引导追问"两种 prompt，按用户 ID 分桶，跑 1000 条历史工单，用 LLM-as-judge 自动评分，发现引导式满意度高 12% 后全量切换。

\`\`\`ts
// 分流：按 userId 稳定分桶
function getBucket(userId: string): "A" | "B" {
  const hash = simpleHash(userId);
  return hash % 2 === 0 ? "A" : "B";
}

const prompts = {
  A: "直接回答用户问题...",
  B: "先追问确认需求再回答...",
};

// 跑测试用例集
async function runABTest(cases: { input: string; expected: string }[]) {
  const results = { A: [], B: [] };
  for (const c of cases) {
    for (const variant of ["A", "B"] as const) {
      const out = await callModel(prompts[variant], c.input);
      const score = await llmJudge(out, c.expected); // LLM 打分 1-5
      results[variant].push({ input: c.input, output: out, score });
    }
  }
  return results;
}

// LLM-as-judge 评分
async function llmJudge(output: string, expected: string) {
  const { object } = await generateObject({
    model, schema: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
    prompt: \`评分输出与期望的匹配度（1-5）。输出：\${output} 期望：\${expected}\`,
  });
  return object.score;
}
\`\`\`

踩坑：分桶必须稳定（同一用户始终同一桶），用 hash 不是随机；样本量不够时差异不显著，需算 p-value；LLM-as-judge 有偏见（偏长答案），最好人工抽检校准；A/B 期间别改其他变量。`,
    keyPoints: ["按 userId 稳定分桶", "LLM-as-judge 自动评分", "对比看板胜率"],
    followUps: ["样本量如何计算？", "LLM-as-judge 有偏见吗？"],
    favorited: false,
  },
  {
    id: "fe-196",
    nodeId: "ai-prompt-ui",
    question: "前端如何实现 Prompt 的多语言/i18n 适配？",
    bigTech: false,
    answer: `结论：Prompt 多语言有两种策略——维护多语言模板（按 locale 切换），或单一模板 + 让模型自行翻译输出。前者精确可控但维护成本高，后者灵活但输出语言不稳定。推荐：system prompt 固定语言指令 + 模板按 locale 加载。

案例：Shein 全球化 AI 客服按用户 locale 加载对应语言的 prompt 模板（中/英/日/西），system prompt 显式指定"用{locale}回答"，避免用户用中文问但模型用英文答的情况。

\`\`\`ts
// 多语言模板库
const promptTemplates = {
  "zh-CN": {
    system: "你是一位专业的客服助手，请用简体中文回答。",
    greeting: "您好，请问有什么可以帮您？",
  },
  "en-US": {
    system: "You are a professional customer service assistant. Reply in English.",
    greeting: "Hello, how can I help you?",
  },
  "ja-JP": {
    system: "あなたはプロのカスタマーサービス assistant です。日本語で回答してください。",
    greeting: "こんにちは、ご用件は何でしょうか？",
  },
};

function getPrompt(locale: string) {
  return promptTemplates[locale] ?? promptTemplates["en-US"]; // fallback
}

// 拼装时注入语言指令
function buildMessages(locale: string, userInput: string) {
  const tpl = getPrompt(locale);
  return [
    { role: "system", content: \`\${tpl.system}\\n当前语言：\${locale}\` },
    { role: "assistant", content: tpl.greeting },
    { role: "user", content: userInput },
  ];
}

// React i18n 集成
const { i18n } = useTranslation();
const messages = buildMessages(i18n.language, input);
\`\`\`

踩坑：locale 要标准化（zh-CN vs zh-Hans），fallback 链要清晰（zh-HK → zh-CN → en）；模型可能不遵循语言指令，加"请务必用{lang}回答"强化；few-shot 示例也要同语言，混用会导致输出语言漂移；RTL 语言（阿拉伯语）UI 需 dir="rtl"。`,
    keyPoints: ["按 locale 加载模板", "system prompt 指定语言", "fallback 链"],
    followUps: ["模型不遵循语言指令怎么办？", "RTL 语言 UI 如何适配？"],
    favorited: false,
  },
  // ===== 对话 UI 设计（ai-chat-ui） =====
  {
    id: "fe-197",
    nodeId: "ai-chat-ui",
    question: "AI 对话消息列表如何实现自动滚动到底部但不打断用户上滑阅读？",
    bigTech: true,
    answer: `结论：需区分"用户在底部"和"用户上滑阅读历史"两种状态。用 IntersectionObserver 监听底部哨兵元素，可见时新消息自动滚动，不可见时仅显示"新消息"提示条，不强制滚动。

案例：飞书 AI 助手流式回答时，若用户上滑查看历史，新 token 不会把视图拽到底部，而是底部浮出"↓ 回到最新"按钮；用户在底部时跟随流式输出平滑滚动。ChatGPT 同样采用此策略。

\`\`\`tsx
function useAutoScroll(deps: unknown[]) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // 滚动容器 ref
  const [atBottom, setAtBottom] = useState(true);

  // 监听底部哨兵是否可见
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { root: scrollContainerRef.current }
    );
    if (bottomRef.current) obs.observe(bottomRef.current);
    return () => obs.disconnect();
  }, []);

  // atBottom 时跟随滚动
  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, deps); // deps 为 messages/streaming text

  return { bottomRef, scrollContainerRef, atBottom };
}

// 使用：容器挂 scrollContainerRef，底部哨兵挂 bottomRef
// <div ref={scrollContainerRef} className="overflow-y-auto">
//   {messages.map(...)}
//   <div ref={bottomRef} />
// </div>

// 用户上滑时显示"回到底部"按钮
{!atBottom && (
  <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}>
    ↓ 回到最新
  </button>
)}
\`\`\`

踩坑：流式高频更新时 scrollIntoView 每次都触发会卡顿，用 rAF 节流；smooth 滚动在快速流式下会"追不上"，可临时切 instant；用户手动上滑后 atBottom 变 false，但流式结束时应保持不自动滚（除非用户点击回到底部）。`,
    keyPoints: ["IntersectionObserver 监听底部哨兵", "atBottom 状态控制滚动", "上滑时显示提示条"],
    followUps: ["流式高频滚动如何节流？", "如何判断用户手动滚动？"],
    favorited: false,
  },
  {
    id: "fe-198",
    nodeId: "ai-chat-ui",
    question: "AI 多轮对话前端如何管理上下文窗口与消息折叠？",
    bigTech: true,
    answer: `结论：长对话 token 会超限，前端需管理上下文窗口——按 token 数滑窗截断旧消息，超长消息折叠为"展开/收起"，分组按日期/话题折叠。展示层与发送层分离：展示全部历史，发送只带窗口内消息。

案例：Kimi 长上下文对话前端把超过窗口的旧消息折叠为"较早的 N 条对话"，点击展开查看；发送给 API 时只携带最近窗口内消息 + system prompt，平衡上下文连续性和 token 成本。

\`\`\`ts
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  collapsed?: boolean;
}

// 上下文窗口管理：只发送窗口内消息
function getWindowedMessages(all: ChatMessage[], maxTokens: number) {
  const system = all.filter((m) => m.role === "system");
  const dialog = all.filter((m) => m.role !== "system");
  let tokens = system.reduce((s, m) => s + (m.tokens ?? 0), 0);
  const window: ChatMessage[] = [];
  // 从最新往前取，直到超限
  for (let i = dialog.length - 1; i >= 0; i--) {
    const t = dialog[i].tokens ?? 0;
    if (tokens + t > maxTokens) break;
    window.unshift(dialog[i]);
    tokens += t;
  }
  return [...system, ...window];
}

// 长消息折叠 UI
function MessageBubble({ msg }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = msg.content.length > 500;
  return (
    <div>
      <p>{isLong && !expanded ? msg.content.slice(0, 500) + "..." : msg.content}</p>
      {isLong && <button onClick={() => setExpanded(!expanded)}>
        {expanded ? "收起" : "展开全部"}
      </button>}
    </div>
  );
}
\`\`\`

踩坑：截断要按"问答对"截，别截到一半对话丢失上下文；折叠的旧消息不影响发送（发送用窗口，展示用全部）；token 计数需预计算缓存，每次实时算太慢；assistant 的工具调用消息要整体保留不能截断中间。`,
    keyPoints: ["token 滑窗截断旧消息", "展示与发送分离", "长消息折叠展开"],
    followUps: ["如何按问答对截断？", "工具调用消息如何处理？"],
    favorited: false,
  },
  {
    id: "fe-199",
    nodeId: "ai-chat-ui",
    question: "AI 对话中多模态消息（图片/文件）前端如何渲染与发送？",
    bigTech: true,
    answer: `结论：多模态消息 content 是数组（text/image_url/file），前端按 type 分别渲染。图片用 base64 或 URL，发送时 image_url 传给 vision 模型。文件需先上传拿 URL 再拼消息。上传用分片 + 进度条。

案例：通义千问网页版支持拖拽图片对话，前端把图片转 base64 内联到 message.content 的 image_url 部分，vision 模型识别图片内容回答。大文件则先上传到 OSS 拿 URL 再发送。

\`\`\`ts
// 多模态消息结构
interface MultiModalMessage {
  role: "user" | "assistant";
  content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
    | { type: "file"; file: { url: string; name: string } }
  >;
}

// 渲染多模态气泡
function MessageContent({ content }) {
  return content.map((part, i) => {
    switch (part.type) {
      case "text": return <p key={i}>{part.text}</p>;
      case "image_url":
        return <img key={i} src={part.image_url.url} className="chat-image" />;
      case "file":
        return <a key={i} href={part.file.url} download>{part.file.name}</a>;
    }
  });
}

// 图片转 base64 发送
async function fileToImageUrl(file: File) {
  // 小图直接 base64
  if (file.size < 4 * 1024 * 1024) {
    return await readFileAsBase64(file);
  }
  // 大图先上传拿 URL
  const { url } = await uploadFile(file);
  return url;
}

// 发送多模态消息
const msg: MultiModalMessage = {
  role: "user",
  content: [
    { type: "text", text: "这张图里有什么？" },
    { type: "image_url", image_url: { url: await fileToImageUrl(file) } },
  ],
};
\`\`\`

踩坑：base64 图片太大撑爆请求体（限制 4MB），大图必须先上传；vision 模型对图片尺寸有要求，超大图需前端压缩；粘贴图片需监听 paste 事件读 clipboardData；多模态消息历史回传时图片 URL 可能过期，需持久化存储。`,
    keyPoints: ["content 数组按 type 渲染", "小图 base64 大图上传 URL", "vision 模型发送 image_url"],
    followUps: ["图片如何压缩？", "粘贴图片如何监听？"],
    favorited: false,
  },
  {
    id: "fe-200",
    nodeId: "ai-chat-ui",
    question: "AI 对话中代码块如何实现语法高亮与一键复制？",
    bigTech: false,
    answer: `结论：用 react-markdown + rehype-highlight（或 Shiki）渲染代码高亮，复制按钮用 navigator.clipboard.writeText，复制后显示"已复制"反馈。流式场景代码块未闭合时降级显示，闭合后高亮。

案例：Cursor/通义灵码的 AI 回答中代码块带语言标签、行号、复制按钮，点击复制后按钮变"✓ 已复制"2 秒恢复，长代码块带折叠和横向滚动。

\`\`\`tsx
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace("language-", "") ?? "text";
  const code = String(children).replace(/\\n$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{lang}</span>
        <button onClick={copy}>{copied ? "✓ 已复制" : "复制"}</button>
      </div>
      <pre><code className={className}>{children}</code></pre>
    </div>
  );
}

// react-markdown 自定义 code 渲染
<ReactMarkdown
  rehypePlugins={[rehypeHighlight]}
  components={{ code: CodeBlock }}
>
  {markdown}
</ReactMarkdown>
\`\`\`

踩坑：navigator.clipboard 在非 HTTPS/localhost 下不可用，需降级 execCommand；rehype-highlight 首次渲染需加载语言包，按需引入；流式时代码块未闭合 rehype 会报错，先用 ensureClosedCodeFences 补全；超长代码块需虚拟滚动否则卡顿。`,
    keyPoints: ["rehype-highlight 高亮", "clipboard API 复制反馈", "语言标签与行号"],
    followUps: ["非 HTTPS 如何复制？", "Shiki 和 highlight.js 区别？"],
    favorited: false,
  },
  {
    id: "fe-201",
    nodeId: "ai-chat-ui",
    question: "AI 对话如何实现消息编辑/重新生成/分支对话？",
    bigTech: true,
    answer: `结论：编辑已有消息后重新生成会创建分支（fork），原对话保留。用树结构存储消息（每条有 parentId），编辑时从该节点 fork 新分支。UI 用"分支切换器"在多个版本间切换。这是 ChatGPT 的核心交互。

案例：ChatGPT 编辑用户消息后重新生成，原回答保留为分支 v1，新回答为 v2，底部箭头切换版本。扣子对话编辑同样支持分支，方便对比不同 prompt 的回答效果。

\`\`\`ts
// 树形消息结构
interface TreeNode {
  message: ChatMessage;
  parentId: string | null;
  children: string[];
}

const messageTree = new Map<string, TreeNode>();

// 编辑消息 → fork 新分支
function editAndRegenerate(nodeId: string, newContent: string) {
  const node = messageTree.get(nodeId)!;
  const newNode: TreeNode = {
    message: { ...node.message, content: newContent, id: genId() },
    parentId: node.parentId, // 同父，形成兄弟分支
    children: [],
  };
  messageTree.set(newNode.message.id, newNode);
  const parent = messageTree.get(node.parentId!)!;
  parent.children.push(newNode.message.id); // 加入兄弟
  // 重新生成 assistant 回答
  regenerate(parent.children); // 流式填充 newNode 的子节点
}

// 分支切换 UI：兄弟节点间切换
function BranchSwitcher({ siblings, currentId, onSelect }) {
  const idx = siblings.indexOf(currentId);
  return (
    <div className="branch-nav">
      <button disabled={idx === 0} onClick={() => onSelect(siblings[idx - 1])}>‹</button>
      <span>{idx + 1}/{siblings.length}</span>
      <button disabled={idx === siblings.length - 1}
        onClick={() => onSelect(siblings[idx + 1])}>›</button>
    </div>
  );
}

// 渲染：从根到当前叶子的路径
function getVisiblePath(leafId: string) {
  const path = [];
  let cur = leafId;
  while (cur) { path.unshift(cur); cur = messageTree.get(cur)!.parentId; }
  return path;
}
\`\`\`

踩坑：编辑后旧分支不能删（可能用户想对比），用懒清理；分支树太深时渲染路径计算要缓存；重新生成要 abort 旧请求避免竞态；本地树结构需持久化到 IndexedDB，刷新不丢。`,
    keyPoints: ["树形结构存消息", "编辑 fork 兄弟分支", "分支切换器 UI"],
    followUps: ["分支树如何持久化？", "如何清理废弃分支？"],
    favorited: false,
  },
  {
    id: "fe-202",
    nodeId: "ai-chat-ui",
    question: "AI 对话如何实现 Tool Calling（函数调用）结果的前端渲染？",
    bigTech: true,
    answer: `结论：Tool Calling 时模型返回 tool_calls，前端展示"正在调用 X 工具"状态，工具执行完把结果作为 tool message 回传，最终 assistant 基于结果回答。UI 需渲染工具调用卡片（名称/参数/结果/状态）。

案例：扣子 Agent 调用"搜索网页"工具时，对话流中插入一个可折叠的工具调用卡片，显示搜索参数和返回结果摘要，用户可展开查看，assistant 基于搜索结果继续回答。Vercel AI SDK v5 的 useChat 自动管理 tool round-trip，工具调用以 part 形式混入消息流。

\`\`\`tsx
// AI SDK v5：工具调用是 UIMessage.parts 中 type 为 "tool-{工具名}" 的 part
const { messages } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" }),
});

function MessageList({ messages }) {
  return messages.map((m) => (
    <div key={m.id}>
      {m.parts.map((part, i) => {
        if (part.type === "text") return <p key={i}>{part.text}</p>;
        // 工具 part：type 形如 "tool-searchWeb"，state 覆盖输入到输出
        if (part.type.startsWith("tool-")) {
          return <ToolCard key={part.toolCallId} tool={part} />;
        }
        return null;
      })}
    </div>
  ));
}

function ToolCard({ tool }) {
  const [expanded, setExpanded] = useState(false);
  const done = tool.state === "output-available";
  return (
    <div className="tool-card">
      <div className="tool-header" onClick={() => setExpanded(!expanded)}>
        <span className="tool-icon">🔧</span>
        <span>{tool.type.replace("tool-", "")}</span>
        <span className="tool-state">{done ? "✓ 完成" : "⏳ 调用中"}</span>
      </div>
      {expanded && (
        <div className="tool-detail">
          <pre>参数：{JSON.stringify(tool.input, null, 2)}</pre>
          {done && <pre>结果：{JSON.stringify(tool.output, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
\`\`\`

踩坑：工具调用是异步 round-trip（模型→工具→模型），UI 状态机要清晰（输入中→调用中→完成/出错）；v5 工具 part 的入参是 input、出参是 output（v4 是 args/result）；工具结果可能很大（如搜索返回 100 条），需折叠 + 分页；多工具并行调用时各自独立卡片；工具失败要展示错误并允许重试。`,
    keyPoints: ["tool-* part 渲染工具卡片", "state 状态机输入中→调用中→完成", "input/output 字段", "折叠展示参数与结果"],
    followUps: ["多工具并行如何渲染？", "工具失败如何重试？"],
    favorited: false,
  },
  {
    id: "fe-203",
    nodeId: "ai-chat-ui",
    question: "AI 对话 UI 如何做无障碍（a11y）与键盘交互？",
    bigTech: false,
    answer: `结论：对话 UI 需支持键盘全程操作——Enter 发送、Shift+Enter 换行、↑ 编辑上一条、Tab 焦点流转。屏幕阅读器用 aria-live="polite" 播报流式新内容，消息列表用 role="log"。焦点管理：流式输出时不抢焦点。

案例：微软 Copilot 网页版遵循 WCAG，流式回答用 aria-live 区域播报（节流避免刷屏），输入框 Enter 发送，对话框可用 Tab 遍历操作按钮，符合键盘可达性。

\`\`\`tsx
function ChatUI() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // Enter 发送，Shift+Enter 换行
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ↑ 编辑上一条用户消息
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && document.activeElement === inputRef.current) {
        e.preventDefault();
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) startEdit(lastUser.id);
      }
    };
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [messages]);

  return (
    <>
      {/* 消息列表：role=log + aria-live 播报 */}
      <div role="log" aria-label="对话记录" aria-live="polite" aria-atomic="false">
        {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
      </div>
      {/* 输入区 */}
      <textarea
        ref={inputRef}
        aria-label="输入消息"
        onKeyDown={onKeyDown}
        placeholder="输入消息，Enter 发送，Shift+Enter 换行"
      />
      <button aria-label="发送消息" onClick={handleSend}>发送</button>
    </>
  );
}
\`\`\`

踩坑：aria-live="polite" 流式高频更新会刷屏，用节流（每 500ms 播报一次增量）；流式输出时不要把焦点抢到消息区（会让输入框失焦）；工具卡片需 aria-expanded 标记折叠状态；加载状态用 aria-busy="true"；颜色对比度需达标（文字 ≥ 4.5:1）。`,
    keyPoints: ["aria-live 播报流式内容", "Enter/Shift+Enter/↑ 键盘交互", "role=log 消息列表"],
    followUps: ["aria-live 如何节流？", "屏幕阅读器如何读代码块？"],
    favorited: false,
  },
  // ===== Edge Runtime 前端（ai-edge-runtime） =====
  {
    id: "fe-204",
    nodeId: "ai-edge-runtime",
    question: "Edge Runtime 与 Node.js Runtime 在前端部署中有何差异？",
    bigTech: true,
    answer: `结论：Edge Runtime 运行在 CDN 边缘节点（V8 isolate），冷启动极快（<50ms）但 API 受限——无 fs/child_process，不支持原生模块，部分 Node API 缺失。Node.js Runtime 功能完整但冷启动慢。前端选型：AI 流式、轻量 API 用 Edge；重计算、需原生依赖用 Node。

案例：Vercel 上 AI 聊天 API 跑在 Edge Runtime，全球用户就近访问冷启动 <50ms，流式首 token 延迟低；而图片处理（sharp 依赖原生）必须用 Node.js Runtime。Next.js 通过 runtime = "edge" | "nodejs" 切换。

\`\`\`ts
// Next.js route 指定 runtime
export const runtime = "edge"; // 或 "nodejs"

export async function POST(req: Request) {
  // Edge Runtime：无 fs、无 Buffer（部分）、无 process.cwd()
  const { messages } = await req.json();
  const result = await streamText({ model, messages: await convertToModelMessages(messages) });
  return result.toUIMessageStreamResponse(); // AI SDK v5
}

// Node.js 专属能力（Edge 不支持）
import sharp from "sharp"; // 原生模块，Edge 报错
import fs from "fs";       // Edge 无 fs
export const runtime = "nodejs";
export async function POST() {
  const img = await sharp(fs.readFileSync("logo.png")).resize(100).png().toBuffer();
  return new Response(img, { headers: { "Content-Type": "image/png" } });
}

// 判断当前 runtime
const isEdge = typeof process === "undefined" || !process.versions?.node;
\`\`\`

踩坑：Edge 不支持 Buffer（用 Uint8Array）、不支持 setImmediate、setTimeout 最长 30s（Vercel 限制）；第三方库若依赖 Node 原生 API 在 Edge 会运行时报错；Edge 请求时长有限制（Vercel Hobby 25s，流式靠 streaming 续命）；环境变量在 Edge 用 next.config 的 env 或 process.env（部分需显式声明）。`,
    keyPoints: ["Edge = V8 isolate 冷启动快", "无 fs/原生模块", "runtime 字段切换"],
    followUps: ["Edge 不支持哪些 Node API？", "如何判断当前 runtime？"],
    favorited: false,
  },
  {
    id: "fe-205",
    nodeId: "ai-edge-runtime",
    question: "前端如何用 Cloudflare Workers / Pages 部署 Edge AI 推理？",
    bigTech: false,
    answer: `结论：Cloudflare Workers 跑在 V8 isolate，配合 Workers AI 在边缘直接推理（无冷启动）。前端用 fetch 调 Worker 接口，Worker 内部调 AI binding 或外部 API。Pages Functions 同理，支持静态资源 + Edge 函数一体部署。

案例：某出海 SaaS 用 Cloudflare Workers AI 在边缘跑文本分类，全球用户请求就近到最近 POP 推理，延迟 <100ms，比回源中心化 OpenAI 快 5 倍。前端 Pages 部署静态站，Functions 处理 AI 接口。

\`\`\`ts
// wrangler.toml 配置 AI binding
// [ai]
// binding = "AI"

// worker.ts：边缘 AI 推理
export default {
  async fetch(req: Request, env: Env) {
    const { text } = await req.json();
    // Workers AI 本地边缘推理
    const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [{ role: "user", content: text }],
    });
    return Response.json({ reply: result.response });
  },
};

// 流式输出
export default {
  async fetch(req: Request, env: Env) {
    const stream = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [...],
      stream: true,
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  },
};

// Pages Functions（pages/api/chat.ts）
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { text } = await ctx.request.json();
  const result = await ctx.env.AI.run("@cf/meta/bert-base-nli", { text });
  return Response.json(result);
};
\`\`\`

踩坑：Workers AI 模型库有限（非所有模型可用），大模型推理慢可能超 CPU 时间限额；Workers 有 CPU 时间限制（免费 10ms，付费 30s）；AI binding 需在 wrangler.toml 声明，否则 env.AI undefined；边缘节点并非都有 GPU，部分模型回退到区域中心。`,
    keyPoints: ["Workers AI 边缘推理", "wrangler.toml AI binding", "Pages Functions 一体部署"],
    followUps: ["Workers AI 模型库有哪些？", "CPU 时间超限怎么办？"],
    favorited: false,
  },
  {
    id: "fe-206",
    nodeId: "ai-edge-runtime",
    question: "Edge 上如何用 Cache API 和 KV 做缓存与状态存储？",
    bigTech: false,
    answer: `结论：Edge 无文件系统，缓存用 Cache API（标准 Web Cache，按 Request key 存 Response），状态存储用 KV（Cloudflare KV / Vercel KV，最终一致键值存储）。缓存用于 AI 响应去重，KV 用于会话/限流计数。

案例：某 AI 工具站用 Cache API 缓存相同 prompt 的回答（key = prompt hash），命中直接返回省 token 费用；用 Cloudflare KV 存用户每日调用次数做限流，全球边缘节点就近读写。

\`\`\`ts
// Cache API：缓存 AI 响应（Edge 标准 Web Cache）
export async function POST(req: Request) {
  const { prompt } = await req.json();
  const cacheKey = new Request(\`https://cache.local/\${await hash(prompt)}\`, req);
  const cache = caches.default;
  // 命中缓存直接返回
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 未命中：调 AI
  const result = await callAI(prompt);
  const res = Response.json({ reply: result });
  // 写入缓存（TTL 1 小时）
  res.headers.set("Cache-Control", "s-maxage=3600");
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

// Cloudflare KV：限流计数
export default {
  async fetch(req: Request, env: Env) {
    const ip = req.headers.get("CF-Connecting-IP")!;
    const key = \`rl:\${ip}\`;
    const count = Number(await env.RATE_LIMIT.get(key) ?? 0);
    if (count >= 100) return new Response("限流", { status: 429 });
    await env.RATE_LIMIT.put(key, count + 1, { expirationTtl: 86400 });
    return handleAI(req);
  },
};
\`\`\`

踩坑：Cache API 的 key 必须是 Request 且方法为 GET（POST 需用 GET key 变通）；KV 是最终一致（写入后几秒才全球同步），不能做强一致读后写；KV 读取有延迟（~10ms），热数据可配合 Cache API 二级缓存；caches.default 不能在 dev 环境（需 deploy 后生效）。`,
    keyPoints: ["Cache API 缓存 Response", "KV 键值最终一致", "POST 用 GET key 变通"],
    followUps: ["KV 如何做强一致？", "Cache API dev 环境如何调试？"],
    favorited: false,
  },
  {
    id: "fe-207",
    nodeId: "ai-edge-runtime",
    question: "Edge 部署如何做地理路由与低延迟优化？",
    bigTech: true,
    answer: `结论：Edge 天然地理分发——请求自动路由到最近 POP。前端可进一步用 request.cf（Cloudflare）或 geo header（Vercel）获取用户地理信息做定制（就近数据源、语言、合规）。延迟优化：静态资源 CDN + Edge 函数 + 就近数据库区域。

案例：某全球电商 AI 客服用 Cloudflare Worker 读 request.cf.country 路由到对应语言模型和就近数据库（北美→us-east KV、欧洲→eu KV），首 token 延迟从 800ms 降到 150ms。

\`\`\`ts
// Cloudflare：地理信息路由
export default {
  async fetch(req: Request, env: Env) {
    const cf = (req as any).cf;
    const country = cf?.country ?? "US";
    const colo = cf?.colo; // 用户命中的边缘机房

    // 按地区选模型/数据源
    const model = ASIAN_COUNTRIES.has(country)
      ? "@cf/meta/llama-3-8b-instruct"  // 亚洲
      : "gpt-4o-mini";                   // 其他走 OpenAI

    // 就近 KV 命名空间（多区域）
    const kv = REGION_KV[getRegion(country)] ?? env.KV_DEFAULT;
    const history = await kv.get(\`chat:\${userId}\`);

    const result = await callAI(model, history, prompt);
    return Response.json({ reply: result, region: colo });
  },
};

// Vercel：用 geo header
export async function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country") ?? "US";
  const city = req.headers.get("x-vercel-ip-city");
  return Response.json({ country, city });
}

// 延迟优化：静态资源 CDN + Edge 函数同源
// next.config.js: images.domains + output: "standalone"
\`\`\`

踩坑：request.cf 仅 Cloudflare 有，Vercel 用 x-vercel-ip-* header；地理路由要注意数据合规（GDPR 欧盟数据不出境）；就近数据库需多区域部署 + 复制，成本高；Edge 函数到外部 API（如 OpenAI 美西）仍跨区，最好用 Edge AI 就近推理。`,
    keyPoints: ["request.cf / geo header 取地理", "按地区路由模型与数据源", "就近 KV 多区域"],
    followUps: ["GDPR 合规如何处理？", "多区域 KV 如何同步？"],
    favorited: false,
  },
  {
    id: "fe-208",
    nodeId: "ai-edge-runtime",
    question: "Edge 上如何访问数据库（Turso/D1/PlanetScale）？",
    bigTech: false,
    answer: `结论：Edge 不能用传统 TCP 数据库连接（无 socket），需用 HTTP 协议的边缘数据库：Cloudflare D1（SQLite over HTTP）、Turso（libSQL HTTP API）、PlanetScale（HTTP driver）。Vercel Edge 也支持 Neon（Postgres HTTP）。

案例：某 Edge AI 应用用 Turso（libSQL）存对话历史，Worker 通过 HTTP fetch 读写，全球边缘就近访问最近副本，避免传统数据库连接池在 Edge 失效的问题。

\`\`\`ts
// Cloudflare D1：SQLite over HTTP（binding 方式）
export default {
  async fetch(req: Request, env: Env) {
    const { userId } = await req.json();
    // D1 用 prepared statement，HTTP 协议
    const { results } = await env.DB.prepare(
      "SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    ).bind(userId).all();
    return Response.json(results);
  },
};

// Turso（libSQL）：HTTP driver，跨平台 Edge
import { createClient } from "@libsql/client";
const db = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_TOKEN });
export async function POST(req: Request) {
  const { userId } = await req.json();
  const rs = await db.execute({
    sql: "SELECT content FROM messages WHERE user_id = ? LIMIT 20",
    args: [userId],
  });
  return Response.json(rs.rows);
}

// PlanetScale：HTTP driver（无 TCP）
import { connect } from "@planetscale/database";
const conn = connect({ url: process.env.DATABASE_URL });
export async function GET() {
  const rs = await conn.execute("SELECT * FROM users LIMIT 10");
  return Response.json(rs.rows);
}
\`\`\`

踩坑：Edge 无 TCP socket，传统 pg/mysql 驱动不可用，必须用 HTTP driver；D1 写入有延迟（最终一致读），强一致需用 read replication primary；HTTP 数据库每次请求都建连接，用连接复用或 server-side cache 优化；Edge 数据库查询要控制次数，过多往返增加延迟。`,
    keyPoints: ["Edge 用 HTTP 协议数据库", "D1/Turso/PlanetScale", "无 TCP socket"],
    followUps: ["D1 读写一致性？", "Neon Postgres 如何 Edge 接入？"],
    favorited: false,
  },
  {
    id: "fe-209",
    nodeId: "ai-edge-runtime",
    question: "Edge 部署如何做 IP 限流与地理封禁？",
    bigTech: false,
    answer: `结论：限流用 KV 计数器（IP → 计数 + TTL），地理封禁用 request.cf.country 拦截。Cloudflare 还可在 WAF/防火墙规则层做（免代码）。Edge 函数层限流更灵活（按用户/API key），适合 AI 接口防滥用。

案例：某 AI API 平台用 Cloudflare Worker 按 IP + API key 双重限流（免费 100 次/天），同时封禁高风险地区 IP，KV 计数器 TTL 86400s 自动重置，超限返回 429 + Retry-After。

\`\`\`ts
// Edge IP 限流 + 地理封禁
const BLOCKED_COUNTRIES = new Set(["XX", "YY"]);
const DAILY_LIMIT = 100;

export default {
  async fetch(req: Request, env: Env) {
    const ip = req.headers.get("CF-Connecting-IP")!;
    const cf = (req as any).cf;
    const country = cf?.country ?? "US";

    // 地理封禁
    if (BLOCKED_COUNTRIES.has(country)) {
      return new Response("该地区不可访问", { status: 403 });
    }

    // IP 限流（KV 计数）
    const key = \`rl:\${ip}\`;
    const count = Number(await env.RATE_LIMIT.get(key) ?? 0);
    if (count >= DAILY_LIMIT) {
      const ttl = 86400; // 剩余秒数（简化）
      return new Response("请求超限", {
        status: 429,
        headers: { "Retry-After": String(ttl) },
      });
    }
    // 原子递增（KV 无原子操作，用 Durable Object 或容忍竞态）
    await env.RATE_LIMIT.put(key, count + 1, { expirationTtl: 86400 });

    return handleAI(req, env);
  },
};

// 进阶：Durable Object 做精确原子限流（滑动窗口）
// 每个 IP 一个 DO，DO 内单线程保证原子性
\`\`\`

踩坑：KV 无原子操作，高并发下计数不准（多用 Durable Object 做精确限流）；CF-Connecting-IP 可伪造（Cloudflare 环境可信，自建 Edge 需校验）；地理封禁可能误伤（用户用 VPN），提供申诉入口；限流维度按业务选（IP/用户/API key），纯 IP 限流对 NAT 共享网络不友好。`,
    keyPoints: ["KV 计数器 IP 限流", "request.cf 地理封禁", "Durable Object 原子限流"],
    followUps: ["KV 计数不准如何解决？", "滑动窗口限流怎么实现？"],
    favorited: false,
  },
  {
    id: "fe-210",
    nodeId: "ai-edge-runtime",
    question: "前端项目如何同时部署到 Vercel Edge 与 Cloudflare Pages？",
    bigTech: false,
    answer: `结论：用适配层抽象 runtime 差异——Next.js 通过 output 标准化，或用 Hono（轻量框架，原生支持多 Edge runtime）写 API。构建产物分别适配 Vercel（@vercel/edge）和 Cloudflare。注意：@cloudflare/next-on-pages 已弃用，官方继任者是 OpenNext Cloudflare（@opennextjs/cloudflare），把 Next.js 构建产物适配到 Cloudflare Workers。共享业务逻辑，仅入口/绑定层不同。

案例：某开源 AI 工具为避免 Vercel vendor lock-in，用 Hono 写 Edge API 层，同一份代码分别部署到 Vercel Edge Functions 和 Cloudflare Workers，通过环境变量切换数据库 binding，用户可选自托管。

\`\`\`ts
// Hono：一套代码多 Edge runtime
import { Hono } from "hono";
const app = new Hono();

app.post("/api/chat", async (c) => {
  const { prompt } = await c.req.json();
  // 通用 AI 调用逻辑
  const result = await callAI(prompt);
  return c.json({ reply: result });
});

// Vercel Edge 入口（hono/vercel）
export const config = { runtime: "edge" };
export default app;

// Cloudflare Workers 入口（hono/cloudflare-workers）
export default app;

// 适配差异：用环境变量 + c.env 抽象 binding
app.get("/data", async (c) => {
  // Vercel 用 KV，Cloudflare 用 KV binding，接口统一
  const kv = c.env?.KV ?? getVercelKV();
  const val = await kv.get("key");
  return c.json({ val });
});

// 部署：
// Vercel:  npx vercel --prod（自动识别 Edge）
// Cloudflare（Next.js 项目）：用 OpenNext 适配
//   npx opennextjs-cloudflare build && npx wrangler deploy
//   （@cloudflare/next-on-pages 已弃用，勿再用于新项目）
\`\`\`

踩坑：next-on-pages 已停止维护，新项目用 OpenNext Cloudflare，对 Next 新特性（App Router、PPR 等）跟进更好，但部分功能（image optimization、部分缓存语义）仍有差异，上线前逐项验证；binding 差异（Vercel KV vs CF KV）API 略不同，需适配层抹平；两平台 Edge 限制不同（CPU 时间、内存），别写重逻辑。`,
    keyPoints: ["Hono 多 runtime 适配", "env 抽象 binding 差异", "OpenNext Cloudflare 替代已弃用的 next-on-pages"],
    followUps: ["Next.js 在 Cloudflare 功能差异？", "如何做自托管 fallback？"],
    favorited: false,
  },
  // ===== 31. browser-rendering 浏览器渲染原理 =====
  {
    id: "fe-214",
    nodeId: "browser-rendering",
    question: "从输入 URL 到页面渲染完成，浏览器经历了哪些阶段？请尽量深入到进程和线程级别。",
    bigTech: true,
    answer: `这是一道考察知识广度的综合题，要分层讲：网络层 → 解析层 → 渲染层，并点明每层的性能优化抓手。

1. 网络层：URL 解析 → DNS 查询（浏览器缓存 → 系统缓存 → hosts → 递归 DNS）→ TCP 三次握手（HTTPS 再加 TLS 握手，TLS1.3 只需 1-RTT）→ 发送 HTTP 请求 → 服务器响应。浏览器进程把响应交给渲染进程。
2. 解析层：渲染进程的主线程把 HTML 字节流 → 字符 → Token → 节点 → DOM 树；并行预加载扫描器提前发现 link/img/script 发起请求；CSS 解析成 CSSOM（CSS 是渲染阻塞资源）。
3. 渲染层：DOM + CSSOM 合成 Render 树 → Layout 布局（计算几何信息）→ Layer 分层 → Paint 绘制（生成绘制指令列表）→ 交给合成线程 Raster 光栅化（分块，GPU 加速）→ 合成显示。

在蚂蚁财富首页优化项目里，按这个链路逐段打点：DNS+TCP 占 400ms（用 preconnect/dns-prefetch 预热降到 50ms）、HTML 下载 300ms（CDN 边缘缓存降到 80ms）、CSS 阻塞渲染 500ms（关键 CSS 内联 + 非关键 media 拆分）、JS 执行阻塞 800ms（defer + 代码分割），最终 FCP 从 3.2s 降到 1.1s。

\`\`\`html
<!-- 优化抓手示例 -->
<link rel="dns-prefetch" href="//cdn.example.com" />
<link rel="preconnect" href="https://api.example.com" crossorigin />
<style>/* 关键 CSS 内联，首屏样式直接可用 */</style>
<link rel="stylesheet" href="print.css" media="print" /> <!-- 非关键 CSS 不阻塞 -->
<script src="app.js" defer></script> <!-- 不阻塞解析 -->
\`\`\`

踩坑：preconnect 超过 10 秒不用会被浏览器关闭，白做还多耗一次握手；dns-prefetch 是 preconnect 的降级（只做 DNS），两者要配对用；HTTP/2 下域名收敛比域名发散更重要，别再为"突破 6 连接限制"做多域名拆分了。`,
    keyPoints: ["网络→解析→渲染三层拆解", "CSS 渲染阻塞、JS 解析阻塞", "preconnect/关键 CSS 内联/defer 逐段优化"],
    followUps: ["TLS 握手具体过程？TLS1.3 为什么更快？", "预加载扫描器如何工作，什么情况会失效？"],
    favorited: false,
  },
  {
    id: "fe-215",
    nodeId: "browser-rendering",
    question: "重排（reflow）与重绘（repaint）的区别是什么？哪些操作会触发？如何系统性减少重排？",
    bigTech: true,
    answer: `结论：重排是几何属性变化导致重新布局（Layout），重绘是外观变化导致重新绘制（Paint）。重排必然引发重绘，重绘不一定重排。重排成本远高于重绘。

触发重排：增删可见 DOM、元素尺寸/位置变化（width/height/margin/padding）、内容变化（文本字数、图片加载完）、窗口 resize、字体加载、读取布局信息（offsetWidth/scrollTop/getBoundingClientRect 等，会强制同步刷新布局队列）。
只触发重绘：color、background、visibility、outline、box-shadow。
两者都跳过（只合成）：transform、opacity（前提是该元素已被提升为合成层）。

在携程酒店列表页优化时，筛选面板展开动画用 height 0→auto 实现，低端机上帧率只有 20fps。改成 transform: scaleY + opacity 并把面板提升为合成层后稳定 60fps：

\`\`\`css
/* 坏：height 动画每帧触发重排 */
.panel { transition: height .3s; }
/* 好：transform 走合成线程，主线程空闲 */
.panel { transform-origin: top; transition: transform .3s, opacity .3s; will-change: transform; }
.panel.collapsed { transform: scaleY(0); opacity: 0; pointer-events: none; }
\`\`\`

系统性减少重排的手法：①批量改样式（用 class 切换代替逐条 style 赋值）；②读写分离（先集中读布局值，再集中写，避免强制同步布局）；③离线操作（DocumentFragment 或 display:none 下批量改 DOM，一次重排）；④脱离文档流做动画（absolute/fixed 元素重排范围限于自身子树）；⑤resize/scroll 回调里只记录状态，DOM 修改放到 rAF 里统一做。

踩坑：display:none 的元素不参与渲染树，改它不触发任何重排重绘，但重新显示时是一次性大重排；visibility:hidden 只触发重绘；读写交替（for 循环里 offsetWidth → 改 style → 再读）是最隐蔽的性能杀手，每轮循环都是一次强制同步布局。`,
    keyPoints: ["重排=几何变化必带重绘，重绘=外观变化", "读布局属性会强制同步刷新队列", "transform/opacity 走合成线程跳过排绘"],
    followUps: ["如何验证某操作是否触发重排（DevTools Performance 面板）？", "display:none 与 visibility:hidden 在渲染树中的差异？"],
    favorited: false,
  },
  {
    id: "fe-216",
    nodeId: "browser-rendering",
    question: "为什么用 transform 和 opacity 做动画性能高？合成层（compositing layer）的提升条件与代价是什么？",
    bigTech: true,
    answer: `结论：transform/opacity 动画可以只在合成线程（Compositor Thread）上执行，完全不经过主线程的布局和绘制，即使主线程被 JS 阻塞动画也不掉帧。

原理：渲染流水线是 Layout → Paint → Composite。普通属性的动画每帧都要走完整流水线；而被提升为独立合成层的元素，其位图已光栅化好，动画时合成线程只需对位图做矩阵变换（transform）或透明度混合（opacity），交给 GPU 合成输出。

提升为合成层的条件：will-change: transform/opacity、transform 动画、position: fixed、有 3D transform、video/canvas/iframe、opacity 动画、z-index 层叠上下文中的重叠元素（被意外提升）。

在得物 App 内嵌 H5 的卡片滑动场景中，给 200 个卡片都加 will-change: transform 想"优化性能"，结果低端机直接白屏——每个合成层都要占 GPU 内存（位图 ≈ 宽×高×4 字节），200 层爆掉了 GPU 内存上限，浏览器回退软件渲染更卡。正确做法是只给当前可见的卡片动态添加 will-change，动画结束移除：

\`\`\`ts
function animateCard(el: HTMLElement) {
  el.style.willChange = "transform";       // 动画前提升
  el.style.transform = "translateX(100px)";
  el.addEventListener("transitionend", () => {
    el.style.willChange = "auto";          // 动画后释放 GPU 内存
  }, { once: true });
}
\`\`\`

踩坑：①层爆炸（layer explosion）：被提升元素上的重叠兄弟元素会被连带提升，层数远超预期，用 DevTools Layers 面板排查；②提升层后文本渲染模式变化，可能出现字体发虚（位图缩放导致）；③will-change 是"预言"不是"优化"，滥用等于告诉浏览器每个元素都要常驻 GPU，适得其反。`,
    keyPoints: ["合成线程独立于主线程执行 transform/opacity", "提升条件：will-change/3D transform/动画/fixed", "代价是 GPU 内存，滥用导致层爆炸"],
    followUps: ["如何用 DevTools 的 Layers 面板排查层爆炸？", "position:fixed 为什么也会被提升为合成层？"],
    favorited: false,
  },
  {
    id: "fe-217",
    nodeId: "browser-rendering",
    question: "CSS 会阻塞渲染吗？JS 会阻塞 HTML 解析吗？async、defer、type=module 的区别是什么？",
    bigTech: true,
    answer: `结论：CSS 不阻塞 HTML 解析，但阻塞渲染（CSSOM 没建好前不绘制首屏，避免 FOUC）；CSS 还会阻塞其后 JS 的执行。普通 JS 同步阻塞 HTML 解析（因为脚本可能 document.write 改 DOM）。

script 加载执行时机对比：
- 普通 script：遇到即阻塞解析 → 下载 → 执行 → 恢复解析。
- async：下载不阻塞，下载完立即执行（执行时阻塞解析），执行顺序不保证，适合独立脚本（统计、广告）。
- defer：下载不阻塞，等 HTML 解析完、DOMContentLoaded 前按声明顺序执行，适合有依赖关系的业务脚本。
- type="module"：默认行为等同 defer，且自动严格模式、支持顶层 await；加 async 后等同 async。

在网易新闻详情页，把 3 个有依赖关系的脚本从 async 改 defer 后，"组件未定义"报错率从 0.8% 降到 0：async 执行顺序随机，B 脚本依赖 A 的全局变量就炸了。

\`\`\`html
<!-- 统计 SDK：独立无依赖，用 async 尽快执行 -->
<script async src="https://analytics.example.com/sdk.js"></script>
<!-- 框架+业务：有依赖顺序，用 defer -->
<script defer src="vendor.js"></script>
<script defer src="app.js"></script>
<!-- 现代浏览器优先 module（天然 defer + 严格模式） -->
<script type="module" src="main.js"></script>
<!-- 首屏关键脚本也可 preload 提前发现 -->
<link rel="preload" href="main.js" as="script" />
\`\`\`

踩坑：①CSS 阻塞其后的 JS 执行这一特性常被忽略——把大 CSS 放 JS 前面会连带拖慢 JS 执行；②async 脚本里不能依赖 DOM 就绪状态；③module 脚本有 CORS 限制（跨域需 Access-Control-Allow-Origin），普通 script 没有；④动态插入的 script 默认是 async 行为，要保序需显式 script.async = false。`,
    keyPoints: ["CSS 阻塞渲染和其后的 JS，不阻塞解析", "async 乱序即下即执，defer 保序等解析完", "module 默认 defer + 严格模式 + CORS"],
    followUps: ["preload 和 prefetch 的区别？", "为什么 CSS 要放在 head、JS 要放在 body 底部（传统经验）？"],
    favorited: false,
  },
  {
    id: "fe-218",
    nodeId: "browser-rendering",
    question: "requestAnimationFrame 与 setTimeout 做动画有什么区别？rAF 的执行时机在事件循环的哪个阶段？",
    bigTech: true,
    answer: `结论：rAF 回调在浏览器每一帧渲染前执行（60Hz 屏约 16.7ms），与屏幕刷新同步；setTimeout 只是"至少延迟 n ms 后把回调放进宏任务队列"，与刷新率无关，可能丢帧也可能一帧执行多次。

差异点：
1. 同步性：rAF 回调在 Layout/Paint 之前，回调里改样式能赶上当前帧；setTimeout 时机随机，改早了当前帧来不及用，改晚了多等一帧。
2. 节能：页面隐藏时 rAF 自动暂停（浏览器不渲染隐藏页），setTimeout 照跑（还有最小 1s 节流）白白耗电。
3. 节流天然性：rAF 一帧最多一次回调，天然适配刷新率（120Hz 屏就是 8.3ms 一次）。

在小米商城秒杀倒计时动画里，setTimeout(16) 驱动的进度条在后台标签页照跑，用户切回来时进度跳变且手机发热；改 rAF 后后台自动暂停，切回时从当前帧继续，动画平滑且省电：

\`\`\`ts
function animate(el: HTMLElement, duration: number) {
  const start = performance.now();
  function frame(now: number) {
    const p = Math.min((now - start) / duration, 1); // 用时间戳算进度，不数帧数
    el.style.transform = \`translateX(\${p * 300}px)\`;
    if (p < 1) requestAnimationFrame(frame); // 链式调度下一帧
  }
  requestAnimationFrame(frame); // 启动：回调在下一帧渲染前执行
}
\`\`\`

执行时机：宏任务 → 所有微任务 → rAF 回调 → Layout/Paint。所以 rAF 里如果同步执行微任务（如 await Promise.resolve()），会在绘制前全部跑完。

踩坑：①进度必须用回调参数的时间戳算（now - start），不能"每帧 +1px"——不同刷新率下速度不同，120Hz 屏快一倍；②rAF 回调里做重活（超过帧预算 16.7ms）照样掉帧，重活要拆片或放 Worker；③不能指望 rAF 精确 60 次/秒，弱机/省电模式会降帧。`,
    keyPoints: ["rAF 与屏幕刷新同步，帧渲染前执行", "隐藏页 rAF 自动暂停，节能", "进度按时间戳计算，不按帧数"],
    followUps: ["requestIdleCallback 的适用场景和坑？", "一帧的完整生命周期（JS → 样式 → 布局 → 绘制 → 合成）是怎样的？"],
    favorited: false,
  },
  {
    id: "fe-219",
    nodeId: "browser-rendering",
    question: "什么是强制同步布局（Forced Synchronous Layout / Layout Thrashing）？如何在真实代码中避免？",
    bigTech: true,
    answer: `结论：浏览器本来会把样式修改攒成队列、在帧末批量重排（异步布局）；但当你读取布局属性（offsetWidth、getBoundingClientRect 等）时，浏览器必须立刻清空队列、同步执行一次完整布局才能返回正确值——这就是强制同步布局。读写交替循环时每轮都触发，就是 Layout Thrashing。

原理：JS 改了样式后，布局信息就是"脏"的。读布局属性 = 问浏览器"现在多宽？"，浏览器只能先重排再回答。改 → 读 → 改 → 读 循环，等于每轮一次完整 Layout，O(n) 次重排。

在京东商品图片懒加载旧代码里见过典型反例：循环 100 张图，每张先读 container.offsetWidth 算尺寸、再写 style，低端机上主线程被卡 1.2 秒。改成读写分离后降到 15ms：

\`\`\`ts
// 反例：每次循环都强制同步布局
for (const img of images) {
  const w = img.parentElement!.offsetWidth; // 读：强制重排
  img.style.height = \`\${w * 0.75}px\`;      // 写：弄脏布局
}
// 正例：先集中读，再集中写，一次重排
const widths = images.map((img) => img.parentElement!.offsetWidth); // 全部读（一次重排）
images.forEach((img, i) => {
  img.style.height = \`\${widths[i] * 0.75}px\`; // 全部写（帧末再一次重排）
});
\`\`\`

进一步：如果只是为了响应尺寸变化，用 ResizeObserver 替代轮询读尺寸——它在布局后异步回调，天然不会强制同步布局。

踩坑：①getComputedStyle 也会强制刷新；②element.classList 改动本身不触发，但紧接着读布局就会；③React 里 useLayoutEffect 读布局再 setState 会造成"帧内两次渲染"，能用 useEffect + 预先计算就别用 useLayoutEffect 写状态；④FastDOM 这类库本质就是把读写分别批处理。`,
    keyPoints: ["读布局属性强制同步刷新脏队列", "读写交替循环 = 每轮一次完整 Layout", "读写分离批处理 / ResizeObserver 替代轮询"],
    followUps: ["getBoundingClientRect 和 offsetWidth 在触发重排上有区别吗？", "React 的 useLayoutEffect 什么时候必须用？"],
    favorited: false,
  },
  {
    id: "fe-220",
    nodeId: "browser-rendering",
    question: "浏览器匹配 CSS 选择器为什么是从右往左的？这个机制对写 CSS 有什么实际指导意义？",
    bigTech: true,
    answer: `结论：浏览器从右往左匹配选择器（从最关键的最右选择器开始过滤），因为 DOM 树上每个元素只有一个父链，而子孙有无数——从右往左能快速把不匹配的元素大片剪掉，从左往右则要对每个元素遍历整个子树验证。

举例：.nav .list li a {} 这个选择器，从右往左的流程是：先找到页面里所有 <a>（可能 50 个）→ 检查父链上是否有 li → 是否有 .list → 是否有 .nav，任何一步不满足立即放弃，最多检查 50 次父链。若从左往右：找 .nav → 遍历其所有后代找 .list → 再遍历所有后代找 li → 再找 a，DOM 大时遍历量是数量级的差距。

实际指导意义（美团 B 端后台样式重构时的规则）：
1. 最右选择器要精确，别用通配符和标签当关键选择器：.list * 会拿页面上所有元素逐个检查，.list .item 只检查有 .item 的元素。
2. 选择器层级别太深：.a .b .c .d .e 每层都是一次父链检查，3 层以内为宜（BEM 天然单层：.list__item--active）。
3. 避免后代选择器堆标签：div ul li a 每层都要父链回溯。

\`\`\`css
/* 差：最右是通配符，全页面元素都要检查父链 */
.sidebar * { color: #333; }
/* 差：标签当关键选择器，所有 input 都要检查 */
.form input { border: 1px solid #ddd; }
/* 好：类名精确命中，父链检查一步 */
.form__field { border: 1px solid #ddd; }
\`\`\`

踩坑：①现代浏览器有选择器缓存和 bloom filter 优化，普通项目选择器性能差异其实很难感知——这条规则的真正价值在 B 端超长列表（万级 DOM）和老旧 IE 兼容项目；②比起选择器优化，"减少 DOM 数量"的收益大一个数量级，别本末倒置；③CSS Modules/BEM 的扁平类名顺便解决了这个问题，这也是工程上推崇它们的原因之一。`,
    keyPoints: ["从右往左利用父链唯一性快速剪枝", "最右选择器要精确，忌通配符/标签", "层级 ≤3 层，BEM 扁平化天然合规"],
    followUps: [":has() 选择器为什么拖了二十年才落地（父选择器性能难题）？", "Shadow DOM 对样式匹配性能有什么影响？"],
    favorited: false,
  },
  {
    id: "fe-221",
    nodeId: "browser-rendering",
    question: "首屏白屏时间长，如何系统性定位瓶颈在关键渲染路径的哪个环节？",
    bigTech: true,
    answer: `结论：用"分段计时"定位——白屏时间 = 网络耗时（TTFB）+ HTML 解析 + 阻塞资源加载 + 首屏 JS 执行。先用 Performance 面板看瀑布图分层，再针对性优化，别一上来就盲改。

定位流程（在字节 CRM 系统白屏治理中的 SOP）：
1. 看 TTFB：>600ms 说明服务端/网络慢（查 CDN 命中率、服务端渲染耗时、慢查询）。
2. 看 DCL（DOMContentLoaded）与 TTFB 的差值：差值大说明 HTML 大或解析被阻塞资源拖住（大 CSS、同步 JS）。
3. 看 FP/FCP 与 DCL 的差值：差值大说明首屏依赖的 JS 执行太久（大 bundle、长任务）。
4. 用 Performance 录制，看 Main 线程火焰图里紫色（Layout）/绿色（Paint）/黄色（JS）谁占大头。
5. 用 Coverage 面板看未使用 CSS/JS 占比（字节那个项目首屏 JS 有 68% 未执行，CSS 有 55% 未使用）。

\`\`\`ts
// 用 PerformanceObserver 在生产环境采集分段数据
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === "navigation") {
      const nav = entry as PerformanceNavigationTiming;
      report({
        ttfb: nav.responseStart - nav.startTime,        // 网络+服务端
        parse: nav.domContentLoadedEventEnd - nav.responseEnd, // 解析+阻塞资源
      });
    }
    if (entry.name === "first-contentful-paint") report({ fcp: entry.startTime });
  }
});
observer.observe({ type: "navigation", buffered: true });
observer.observe({ type: "paint", buffered: true });
\`\`\`

对症优化：TTFB 慢 → CDN/边缘缓存/服务端拆慢查询；解析慢 → HTML 瘦身、关键 CSS 内联、defer 掉非首屏 JS；执行慢 → 代码分割、长任务拆分（scheduler.yield）、非首屏组件懒渲染。

踩坑：①本地 DevTools 性能好不代表线上好——要用真机 + 慢网（Fast 3G 节流）+ 关闭缓存各录一遍；②SPA 的 FCP 好但 LCP 可能很差（骨架屏先出、内容后到），要同时盯 LCP 和 FID/INP；③Service Worker 首次安装反而会拖慢首屏（要下载 SW 脚本），预缓存要克制。`,
    keyPoints: ["分段计时：TTFB→解析→执行逐层定位", "Performance 火焰图 + Coverage 面板组合拳", "生产环境用 PerformanceObserver 采集真实数据"],
    followUps: ["LCP、FID、INP 的定义和优化手段分别是什么？", "SPA 和 SSR 在白屏问题上的差异？"],
    favorited: false,
  },
  // ===== 32. browser-engine 浏览器架构与 JS 引擎 =====
  {
    id: "fe-222",
    nodeId: "browser-engine",
    question: "Chrome 的多进程架构是怎样的？为什么渲染进程要沙箱化？JS 为什么是单线程？",
    bigTech: true,
    answer: `结论：Chrome 是多进程架构——1 个浏览器主进程（UI/地址栏/书签/网络调度）+ N 个渲染进程（每个站点隔离一个，跑 Blink + V8）+ GPU 进程 + 网络进程 + 插件进程。渲染进程彼此隔离且运行在沙箱里。

为什么沙箱化：渲染进程要执行不可信的 Web 内容（任意 JS、解析复杂 HTML/CSS——历史上浏览器 0day 大多出在渲染引擎）。沙箱限制渲染进程的系统调用（不能直接读写文件、不能直接访问网络），即使被攻破也困在沙箱里。站点隔离（Site Isolation）更进一步：不同站点的 iframe 也放进不同进程，防 Spectre 侧信道偷跨站数据。

代价是内存：每个渲染进程独占一份 V8/Blink，Chrome 吃内存的根源。同站点（same-site，同 eTLD+1）的多个标签页会共享渲染进程（process-per-site-instance）。

JS 为什么单线程：历史设计选择 + DOM 操作的线程安全。如果 JS 多线程，两个线程同时改 DOM（一个删节点、一个改节点样式）需要复杂的锁机制，会让脚本模型和渲染引擎都复杂到不可用。单线程 + 事件循环是简单可靠的并发模型。需要并行计算时用 Web Worker（独立线程，无 DOM 访问权，靠 postMessage 通信）：

\`\`\`ts
// 主线程：Worker 通信模型（消息传递，无共享内存）
const worker = new Worker("./heavy.js");
worker.postMessage({ data: bigArray });          // 结构化克隆拷贝
worker.onmessage = (e) => render(e.data.result);
// heavy.js 内部：无法访问 document/window，只能计算
\`\`\`

踩坑：①"一个标签页一个进程"是误解——同站点共享、iframe 按站点隔离，实际进程数由 Chrome 内存压力动态决定；②SharedArrayBuffer 允许 Worker 间共享内存，但因此能构造高精度计时器搞 Spectre 攻击，必须配 COOP/COEP 响应头（crossOriginIsolated）才能用；③Worker 启动有成本（新线程 + 新 JS 环境，约几十 ms），别为几毫秒的计算开 Worker。`,
    keyPoints: ["主进程/渲染进程/GPU/网络进程分工", "沙箱防渲染引擎漏洞，站点隔离防 Spectre", "单线程保 DOM 线程安全，Worker 做真并行"],
    followUps: ["Spectre 漏洞为什么催生了站点隔离？", "跨进程通信（IPC）的开销对架构设计有什么影响？"],
    favorited: false,
  },
  {
    id: "fe-223",
    nodeId: "browser-engine",
    question: "V8 是如何执行 JS 的？隐藏类（Hidden Class）和内联缓存（Inline Cache）的优化逻辑是什么？",
    bigTech: true,
    answer: `结论：V8 采用"解释 + JIT 分级优化"：Ignition 解释器先把源码编译成字节码直接执行，收集类型反馈；热点函数（执行频繁）交给 TurboFan 编译成优化机器码；若运行时发现假设不成立（类型变了），去优化（deopt）退回字节码。

隐藏类：JS 对象属性可动态增删，理论上属性查找要遍历哈希表。V8 为每个对象维护隐藏类（Map），相同"形状"（属性名 + 顺序 + 类型）的对象共享同一个隐藏类，属性偏移量固定，查找变成 O(1) 的内存偏移。属性按相同顺序初始化 → 共享隐藏类；动态增删/乱序 → 隐藏类转换树分叉，查找变慢。

内联缓存：函数执行时记录"上次这个对象是隐藏类 A，属性 x 在偏移 8"，下次直接比对隐藏类、命中就按偏移取值，跳过完整查找。单态（一直同一隐藏类）最快，多态（2-4 种）次之，超态（>4 种）退化为哈希表慢查。

在蚂蚁数据看板项目里，图表数据点构造函数曾写成条件赋值，导致帧率从 55 掉到 18，Profile 发现 megamorphic 属性访问占 40% CPU：

\`\`\`ts
// 反例：条件赋值导致隐藏类分叉（有的对象有 extra、有的没有，顺序还不同）
function makePoint(x: number, y: number, extra?: number) {
  const p: Record<string, number> = { x };
  if (extra) p.extra = extra;  // 隐藏类转换：Map1 → Map2 分叉
  p.y = y;
  return p;
}
// 正例：属性全量、固定顺序初始化，所有实例共享同一隐藏类
function makePoint(x: number, y: number, extra?: number) {
  return { x, y, extra: extra ?? 0 }; // 单一隐藏类，属性访问 O(1)
}
\`\`\`

踩坑：①delete obj.prop 会让对象退回"字典模式"（慢哈希表），置 undefined 代替；②数组当对象用（arr.foo = 1）会让数组退化为字典；③turboFan 优化假设被打破会 deopt——同一函数传入时而 number 时而 string（多态参数），热点函数要参数类型单一；④for-in 遍历顺序在整数 key 上自动变数字升序，与插入顺序不符，是隐藏类机制的副作用。`,
    keyPoints: ["Ignition 字节码 + TurboFan 热点优化 + deopt", "同形状对象共享隐藏类，属性偏移 O(1)", "IC 单态最快，超态退化为慢查"],
    followUps: ["deopt 怎么在代码里观测到（--trace-deopt）？", "为什么 TypeScript 的类型标注不能让 JS 运行更快？"],
    favorited: false,
  },
  {
    id: "fe-224",
    nodeId: "browser-engine",
    question: "V8 的垃圾回收机制是怎样的？分代假说、Scavenge、标记-清除、增量标记分别解决什么问题？",
    bigTech: true,
    answer: `结论：V8 基于分代假说——绝大多数对象朝生夕死（临时变量、中间结果），少数对象长期存活（全局缓存、闭包引用）。堆内存据此分为新生代（小，1-8MB）和老生代（大），用不同算法回收，把 GC 停顿从百毫秒级压到毫秒级。

新生代用 Scavenge（Cheney 算法）：空间分 From/To 两半，对象分配在 From，From 满了就把存活对象复制到 To，然后互换角色。复制 = 顺序内存写入，极快；适合"死的快"的小对象。对象存活过两次 Scavenge 就晋升到老生代（或 To 空间用超 25% 直接晋升）。

老生代用标记-清除（Mark-Sweep）+ 标记-整理（Mark-Compact）：从根（全局对象、调用栈）出发标记可达对象，清除未标记的；内存碎片多时用整理算法把存活对象紧凑到一端。全量标记要停 JS（STW），大堆下停顿明显，所以 V8 做了三重优化：
1. 增量标记：标记工作切成小步，与 JS 交替执行（黑灰白三色标记法记录进度）。
2. 惰性清理：清除不一次做完，用到哪块清哪块。
3. 并发/并行标记：Worker 线程在后台标记，主线程几乎不停。

在腾讯文档协同编辑器项目里，光标位置对象每帧创建（60 次/秒），新生代 Scavenge 完美消化零停顿；但文档操作历史栈无限增长，晋升老生代后内存只涨不降——最后给历史栈加了 LRU 上限 + 定期压缩快照，老年代占用稳定在 200MB 内。

\`\`\`ts
// 短命对象留给新生代，长命缓存要有上限
class UndoStack {
  private items: Snapshot[] = [];
  private readonly MAX = 50; // 防晋升后无限涨
  push(s: Snapshot) {
    this.items.push(s);
    if (this.items.length > this.MAX) this.items.shift();
  }
}
\`\`\`

踩坑：①闭包意外持有大对象（函数引用整个作用域链），新生代照样进老生代；②"手动触发 GC"——生产环境没有，window.gc 只在 DevTools 启动参数下存在；③内存涨不一定是泄漏，V8 会故意延迟 GC 换吞吐（堆上限内不急着收），看"GC 后基线"是否持续抬升才是判断标准。`,
    keyPoints: ["分代假说：对象朝生夕死", "新生代 Scavenge 复制，老生代标记-清除/整理", "增量+惰性+并发压缩 STW 停顿"],
    followUps: ["三色标记法如何保证并发标记的正确性？", "WeakMap/WeakRef 在 GC 友好编程中的作用？"],
    favorited: false,
  },
  {
    id: "fe-225",
    nodeId: "browser-engine",
    question: "前端内存泄漏有哪些典型场景？如何用 Chrome DevTools 定位泄漏源头？",
    bigTech: true,
    answer: `结论：泄漏 = 不再使用的内存仍被"根"可达。前端四大典型场景：①闭包误持大对象；②DOM 移除但 JS 引用还在（游离 DOM）；③定时器/事件监听未清理；④全局缓存无上限。定位靠 DevTools Memory 面板的堆快照对比。

典型场景与修复（快手直播中控台治理实录，泄漏让页面 4 小时涨到 2GB 崩溃）：

\`\`\`ts
// 场景1：闭包误持——bigData 被闭包引用，组件卸载仍存活
function createHandler() {
  const bigData = new Array(1e6).fill(0); // 10MB
  const unused = () => console.log(bigData.length); // 这个闭包不被调用也占着
  return { onClick: () => console.log("click") }; // 返回的对象间接持有 bigData
}
// 修复：大对象用完置空，或抽出组件级 store 手动释放

// 场景2：游离 DOM——DOM 删了，JS 里的引用还在
const refs: HTMLElement[] = [];
function render(list: Item[]) {
  list.forEach((item) => {
    const el = document.createElement("div");
    refs.push(el); // 永不清理 → 每次渲染泄漏一批
    container.append(el);
  });
}
// 修复：refs 改 WeakMap/WeakRef，或随组件卸载清空

// 场景3：监听器/定时器未清理（SPA 路由切换重灾区）
useEffect(() => {
  const timer = setInterval(fetchStatus, 5000);
  window.addEventListener("resize", onResize);
  return () => { clearInterval(timer); window.removeEventListener("resize", onResize); };
}, []); // 清理函数必须成对

// 场景4：全局缓存无上限 → 加 LRU 上限
const cache = new Map<string, Blob>();
function setCache(k: string, v: Blob) {
  if (cache.size > 100) cache.delete(cache.keys().next().value!); // 淘汰最旧
  cache.set(k, v);
}
\`\`\`

定位流程：①Performance Monitor 看 JS Heap 趋势——锯齿上升但谷值持续抬升 = 泄漏；②Memory 面板拍堆快照 A → 操作页面 → 拍快照 B → 对比视图（Comparison）按 Delta 排序，看哪类对象净增；③看 Retainers（引用链）找到谁持着不放；④Detached 筛选器直接找游离 DOM 树。

踩坑：①Heap 涨不等于泄漏——V8 惰性回收，先看 GC 后基线；②React 的 fiber 树在堆快照里噪音大，用 Allocation instrumentation on timeline 看分配时间线更直观；③WeakRef 要配 FinalizationRegistry 做清理，但回调时机不确定，别拿它做精确资源管理；④console.log 大对象会让 DevTools 持有引用，排查时先清 console。`,
    keyPoints: ["闭包/游离 DOM/未清理监听/无界缓存四大场景", "堆快照对比 + Retainers 引用链定位", "GC 后基线持续抬升才是真泄漏"],
    followUps: ["WeakMap 为什么能解决游离 DOM 问题？", "SPA 路由切换时如何做系统性的资源清理？"],
    favorited: false,
  },
  {
    id: "fe-226",
    nodeId: "browser-engine",
    question: "浏览器事件循环的完整过程是什么？宏任务、微任务、渲染更新的执行次序如何？",
    bigTech: true,
    answer: `结论：事件循环每轮（tick）= 执行一个宏任务 → 清空全部微任务队列 → （视时机）执行 rAF 回调并渲染更新。微任务在当前宏任务结束后立即全部执行，且微任务里新产生的微任务也本轮执行（可饿死渲染）；渲染更新插在宏任务之间，不是任务源。

任务分类：
- 宏任务：script 整体、setTimeout/setInterval、setImmediate（Node）、I/O、UI 事件、postMessage、MessageChannel。
- 微任务：Promise.then/catch/finally、queueMicrotask、MutationObserver、process.nextTick（Node，比微任务更早）。
- 渲染步骤：rAF 回调 → style/layout/paint；rIC（requestIdleCallback）在帧空闲时。

关键推论：
1. await 后面的代码 = 微任务，所以 async 函数里 await 连续多次渲染也不会插进来。
2. setTimeout(fn, 0) 永远排在"当前所有微任务"之后。
3. 微任务死循环会永久阻塞渲染和交互（宏任务队列进不来），宏任务递归（setTimeout 自调）则每轮让出一次渲染机会。

在猿辅导答题卡项目里，提交后连续 setState 十次期待"每步都渲染进度"，实际用户看到一步到位——十次 setState 在一个宏任务里，渲染只在最后发生一次。改成每步 await 一个宏任务（或直接用 startTransition）才能看到渐进渲染：

\`\`\`ts
// 想让渲染插进来：每步让出一个宏任务
async function processSteps(steps: Step[]) {
  for (const s of steps) {
    doStep(s);
    updateProgress(s);              // 改状态
    await new Promise((r) => setTimeout(r)); // 让出：宏任务边界，浏览器可渲染
  }
}
\`\`\`

踩坑：①Promise 构造函数里的代码是同步执行的，只有 then 是微任务；②async/await 混 setTimeout 的顺序题是面试重灾区（见下一题）；③MutationObserver 是微任务——DOM 变化回调会在渲染前批量执行；④Node 的事件循环（timers/poll/check 阶段）与浏览器不同，nextTick 优先级最高，别把浏览器结论套过去。`,
    keyPoints: ["宏任务→清空微任务→（rAF→渲染）循环", "微任务可饿死渲染，宏任务让出渲染机会", "await=微任务，setTimeout(0)排所有微任务后"],
    followUps: ["为什么 Vue 的 nextTick 优先用 Promise 而不是 setTimeout？", "requestIdleCallback 在什么时机执行，为什么可能被饿死？"],
    favorited: false,
  },
  {
    id: "fe-227",
    nodeId: "browser-engine",
    question: "写出下面代码的输出顺序，并解释每一步在事件循环中的位置。",
    bigTech: true,
    answer: `先看题：

\`\`\`ts
console.log("1");
setTimeout(() => console.log("2"));
Promise.resolve().then(() => {
  console.log("3");
  setTimeout(() => console.log("4"));
});
setTimeout(() => {
  console.log("5");
  Promise.resolve().then(() => console.log("6"));
});
Promise.resolve().then(() => console.log("7"));
console.log("8");
\`\`\`

输出：1 → 8 → 3 → 7 → 2 → 5 → 6 → 4。

逐步推演（按事件循环 tick）：
- Tick 0（script 整体是首个宏任务）：同步执行 1、8；遇到 setTimeout(2) 进宏任务队列 A；Promise.then(3) 进微任务队列；setTimeout(5) 进宏任务队列 B（在 A 后）；Promise.then(7) 进微任务队列（在 3 后）。
- 同步结束，清空微任务：输出 3（回调里 setTimeout(4) 进宏任务队列 C，排 B 后）、输出 7。
- Tick 1：取宏任务 A → 输出 2；无微任务。
- Tick 2：取宏任务 B → 输出 5；then(6) 进微任务 → 本轮清空微任务输出 6。
- Tick 3：取宏任务 C → 输出 4。

记忆口诀：同步先行 → 微任务插队（每个宏任务后清空）→ 宏任务按入队顺序一个一个来；每个宏任务执行完都要回头看微任务队列。

这类题在字节/美团一面出现率极高，考察的不是背答案而是"宏任务边界 + 微任务清空时机"的模型是否牢固。变体常加 async/await：await x 等价于 Promise.resolve(x).then(后续），所以 async fn 里 await 之后的代码都是微任务；再加 new Promise 构造器同步执行这个陷阱。

踩坑：①Promise.resolve().then() 和 async () => await 的等价转换要熟练，变体题全靠它；②Node 环境下 process.nextTick 插队在所有微任务之前，setImmediate 与 setTimeout(0) 顺序不确定（I/O 内外有别），面试官追问环境差异别答混；③rAF 不参与这个队列模型，别把它归入微任务。`,
    keyPoints: ["script 是首个宏任务", "每个宏任务后清空全部微任务（含新生）", "宏任务按入队顺序逐个执行"],
    followUps: ["加入 async/await 后顺序如何推演？", "Node 的 nextTick/setImmediate 与浏览器模型差异？"],
    favorited: false,
  },
  {
    id: "fe-228",
    nodeId: "browser-engine",
    question: "Web Worker 能做什么、不能做什么？postMessage 的结构化克隆和 Transferable 有什么区别？",
    bigTech: true,
    answer: `结论：Web Worker 是浏览器提供的真线程，能做：CPU 密集计算（解析大 JSON、加解密、压缩、图像处理）、不占主线程的轮询/预取。不能做：访问 DOM、window、document、localStorage（可用 IndexedDB）、同步弹窗。与主线程只能靠 postMessage 通信。

结构化克隆 vs Transferable：
- 结构化克隆（默认）：深拷贝数据到 Worker，支持 Map/Set/Date/RegExp/ArrayBuffer/循环引用（比 JSON.stringify 强），但拷贝有成本——100MB 数据拷贝一次约 200ms，且两份内存。
- Transferable（转移所有权）：第二个参数列出的 ArrayBuffer 直接转移给 Worker，零拷贝，转移后原线程该 buffer 长度变 0 不可用。适合二进制大数据。

在 B 站投稿页的视频封面上传功能中，要在前端对 4K 截图做滤镜处理，最初在主线程跑导致页面卡死 3 秒；迁到 Worker + Transferable 后主线程零卡顿，处理 2000 万像素位图只用 800ms：

\`\`\`ts
// 主线程
const worker = new Worker("./image-filter.js");
const bitmap = await createImageBitmap(file);
const pixels = await bitmapToArrayBuffer(bitmap); // 200MB
// 转移所有权：零拷贝，主线程此 buffer 随即失效
worker.postMessage({ pixels, width, height }, [pixels]);

// image-filter.js（Worker 内：无 DOM，纯计算）
self.onmessage = (e) => {
  const { pixels, width, height } = e.data;
  const result = applyFilter(new Uint8ClampedArray(pixels), width, height);
  self.postMessage({ result }, [result.buffer]); // 结果也转移回去
};
\`\`\`

踩坑：①Worker 里 import 第三方库要用 module Worker（new Worker(url, { type: "module" })），老浏览器要 importScripts；②postMessage 频繁小消息的开销大于想象（每次都有序列化+跨线程调度），高频通信用 SharedArrayBuffer + Atomics（需 COOP/COEP 头）；③Worker 不能复用主线程的函数/类实例（克隆只搬数据不搬代码），传过去的是"影子"；④Vite 里用 new Worker(new URL("./w.ts", import.meta.url), { type: "module" }) 才能被正确打包。`,
    keyPoints: ["Worker 真线程但无 DOM，通信靠 postMessage", "结构化克隆深拷贝有成本，Transferable 零拷贝转移", "SharedArrayBuffer+Atomics 应对高频通信"],
    followUps: ["Comlink 库如何简化 Worker 通信心智成本？", "Worklet（CSS Paint/Audio）与 Worker 有什么区别？"],
    favorited: false,
  },
  {
    id: "fe-229",
    nodeId: "browser-engine",
    question: "长任务（Long Task）如何治理？请实现一个时间切片调度器把大任务拆小，保证页面响应。",
    bigTech: true,
    answer: `结论：超过 50ms 的主线程任务即为长任务，会阻塞交互（INP 指标恶化）。治理思路：能进 Worker 的进 Worker；必须留在主线程的，拆成小片、每片 <50ms，片间让出主线程给渲染和输入。

让出方式优先级：scheduler.yield()（新 API，让出后回到队列头部，最优先续跑）> MessageChannel 宏任务（让出且允许渲染）> setTimeout(0)（有 4ms 嵌套钳制）> await Promise.resolve()（微任务，不让渲染！）。

在拼多多商家后台的对账单导入功能中，前端要解析 10 万行 Excel 行数据并校验，一次跑完主线程卡 8 秒；用时间切片后 INP 从 1200ms 降到 90ms，且能实时显示进度条：

\`\`\`ts
// 通用时间切片执行器：片间用 MessageChannel 让出（允许渲染，无 4ms 钳制）
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = () => resolve();
    port2.postMessage(null); // 触发一个宏任务，浏览器可在中间渲染/响应输入
  });
}

async function processInSlices<T, R>(
  items: T[],
  fn: (item: T) => R,
  budget = 32 // 每片预算 ms，留余量给渲染（50ms 上限内）
): Promise<R[]> {
  const results: R[] = [];
  let sliceStart = performance.now();
  for (let i = 0; i < items.length; i++) {
    results.push(fn(items[i]));
    if (performance.now() - sliceStart > budget) {
      await yieldToMain();        // 预算用完，让出主线程
      sliceStart = performance.now();
    }
  }
  return results;
}

// 使用：10 万行校验切片执行，UI 全程可交互
await processInSlices(rows, validateRow);
\`\`\`

要点：①按"时间预算"切片而非固定条数——不同机器上单条耗时不等；②让出用 MessageChannel 而非 setTimeout——后者嵌套 5 层后有 4ms 钳制，10 万次要白等 400ms+；③别用 await Promise.resolve() 让出——微任务不触发渲染，等于没让；④React 18 的 startTransition/useDeferredValue 是渲染层的时间切片，数据计算层还得自己动手。

踩坑：①切片后总耗时变长（调度开销），要对用户显示进度；②scheduler.yield 兼容性（Chrome 129+），降级链 yield → MessageChannel → setTimeout；③长任务也可能在框架内部（React 大列表调和），这时要用并发特性而非手动切片；④PerformanceObserver 的 longtask 类型可在生产环境采集长任务归因（attribution 字段指出哪个容器）。`,
    keyPoints: [">50ms 即长任务，阻塞 INP", "按时间预算切片 + MessageChannel 让出", "微任务让出是假让出，不触发渲染"],
    followUps: ["React 并发渲染的调度与手动时间切片如何配合？", "scheduler.postTask 的优先级队列怎么用？"],
    favorited: false,
  },
  // ===== 33. network-http HTTP/HTTPS 协议 =====
  {
    id: "fe-230",
    nodeId: "network-http",
    question: "HTTP/1.1 的队头阻塞是什么？HTTP/2 如何用多路复用解决？为什么还需要 HTTP/3？",
    bigTech: true,
    answer: `结论：队头阻塞分两层——HTTP/1.1 的"应用层队头阻塞"（同一 TCP 连接上请求必须排队等前一个响应回来）和 TCP 的"传输层队头阻塞"（一个包丢失，后续所有包都要等重传）。HTTP/2 解决了前者，HTTP/3 解决后者。

HTTP/1.1 的困局：keep-alive 复用连接但请求是串行的；pipelining 试图并行但响应必须按序返回（前一个慢响应堵死后面全部），浏览器默认禁用。于是浏览器只能开 6 个并发连接"绕开"，开发者用域名发散、雪碧图、资源内联来"骗"浏览器多下载——这些都是为协议缺陷打的补丁。

HTTP/2 的二进制分帧：请求/响应被切成带流 ID 的帧，多个流在同一 TCP 连接上交错传输、互不阻塞（多路复用）。配合 HPACK 头部压缩（静态表 + 动态表 + Huffman 编码，重复 UA/Cookie 不再每次都发）和流优先级。一个连接搞定一切，域名发散反而成了负优化。

但 HTTP/2 仍跑在 TCP 上：一个流丢包，TCP 重传期间所有流都被卡住（传输层队头阻塞），弱网丢包率 2% 时 HTTP/2 可能比 HTTP/1.1 还慢。HTTP/3 换 QUIC（基于 UDP）：每个流独立可靠传输，丢包只堵自己的流；连接用 Connection ID 标识，Wi-Fi 切 4G 不断连（TCP 换 IP 必须重连）；TLS 1.3 内置于 QUIC，握手 1-RTT 甚至 0-RTT。

在快手直播间的弱网优化中，开启 HTTP/3 后弱网用户（丢包 >3%）的接口 P95 延迟从 2.1s 降到 900ms，就是吃到了"流级独立重传 + 连接迁移"的红利。

\`\`\`nginx
# Nginx 开启 HTTP/3（1.25+）并广播 Alt-Svc 让浏览器升级
listen 443 quic reuseport;
listen 443 ssl;
add_header Alt-Svc 'h3=":443"; ma=86400'; # 首次 HTTP/2 响应里告知支持 h3
\`\`\`

踩坑：①HTTP/2 多路复用有默认 100 并发流上限，超了照样排队；②服务端推送（Server Push）已被 Chrome 移除，别再用，改 103 Early Hints；③HTTP/3 依赖 UDP，企业网关/防火墙可能拦 UDP 443，必须保留 HTTP/2 回退（Alt-Svc 机制天然支持）；④Nginx/CDN 开了 h3 但 LB 没透传 UDP，等于没开，用 curl --http3 实测验证。`,
    keyPoints: ["HTTP/1.1 应用层队头阻塞，TCP 传输层队头阻塞", "HTTP/2 二进制分帧多路复用 + HPACK", "HTTP/3 QUIC：流级独立重传 + 连接迁移 + 1-RTT"],
    followUps: ["HPACK 的动态表是怎么工作的？", "QUIC 的连接迁移如何实现，NAT 超时怎么办？"],
    favorited: false,
  },
  {
    id: "fe-231",
    nodeId: "network-http",
    question: "HTTPS 的 TLS 握手过程是怎样的？对称加密和非对称加密如何配合？TLS 1.3 优化了什么？",
    bigTech: true,
    answer: `结论：TLS 的设计是"用非对称加密安全地协商出对称密钥，之后通信全走对称加密"——非对称加密安全但慢（RSA 比 AES 慢千倍），对称加密快但密钥没法安全分发，两者各取所长。

TLS 1.2 握手（2-RTT）：
1. Client Hello：客户端随机数 + 支持的密码套件 +  TLS 版本。
2. Server Hello + 证书：服务端随机数 + 选定套件 + 证书链（含公钥）。
3. 客户端用 CA 根证书逐级验证证书链（域名匹配、有效期、吊销状态），生成预主密钥（Pre-Master Secret），用服务器公钥加密发送。
4. 双方用两个随机数 + 预主密钥算出会话密钥，切换对称加密通信。

TLS 1.3 的优化（1-RTT / 0-RTT）：
- 1-RTT：客户端在第一条消息就附带密钥协商参数（ECDHE 公钥分片），服务端一条响应就完成协商，砍掉一个往返。
- 废除不安全的 RSA 密钥交换，强制前向保密（PFS）：每次会话用临时 DH 密钥，私钥泄露也无法解密历史流量。
- 0-RTT：复用上次会话的 PSK，首条请求数据直接加密发出——但可被抓包重放，只能用于幂等请求。

在滴滴出行的端上网络库升级 TLS 1.3 后，海外高延迟地区（RTT 300ms+）的首接口耗时直接省出 300-600ms（少一个 RTT），超时率降了 40%。

\`\`\`nginx
# 生产配置：TLS1.3 + 前向保密套件 + OCSP Stapling（省客户端吊销查询）
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off; # 1.3 不需要
ssl_stapling on;
ssl_stapling_verify on;
\`\`\`

踩坑：①证书链不完整（缺中间证书）桌面浏览器能自动补（AIA fetching），但安卓老版本直接握手失败——上线前用 SSL Labs 全绿才算完；②0-RTT 有重放攻击风险，支付/转账类接口必须禁用；③HSTS 一旦开启且 max-age 很长，证书配错用户将无法访问（连跳过按钮都没有），先短 max-age 灰度；④TLS 终止在 LB/CDN 层时，到源站的回源流量也要加密（Full SSL Strict），否则中间链路是明文。`,
    keyPoints: ["非对称协商 + 对称通信，各取所长", "TLS1.3：1-RTT、强制 PFS、0-RTT 可重放", "证书链完整性是移动端大坑"],
    followUps: ["ECDHE 为什么能提供前向保密？", "ESNI/ECH 加密 SNI 解决什么隐私问题？"],
    favorited: false,
  },
  {
    id: "fe-232",
    nodeId: "network-http",
    question: "301/302/304/307/308 的区别是什么？401/403/404/429/502/504 在排查线上问题时各自指向什么？",
    bigTech: true,
    answer: `结论：3xx 是重定向家族（区别在于"是否永久"和"能否改方法"），4xx 是客户端问题（鉴权/权限/限流），5xx 是服务端/网关问题。记住语义就能在 10 秒内把线上故障定位到正确的层。

重定向四兄弟：
- 301（永久）：资源搬家了，浏览器/搜索引擎会缓存这个跳转。换域名用它，SEO 权重会传递。
- 302（临时）：临时跳转，每次都来问。大促会场临时导流到备用页用它。
- 307（临时）/308（永久）：HTTP/1.1 补充，严格禁止改变请求方法和 Body——302 的坑在于浏览器历史实现会把 POST 变 GET，表单提交跳转后数据丢了；307/308 保证 POST 重定向后还是 POST。
- 304（未修改）：不是跳转！是协商缓存命中——客户端带 If-Modified-Since/If-None-Match，服务端说"没变，用你缓存的"，响应无 body。

错误码排障速查（阿里客服工单系统排障 SOP）：
- 401 Unauthorized：没带凭证或凭证失效（token 过期）→ 查登录态。
- 403 Forbidden：有凭证但没权限（或 WAF/防盗链拦截）→ 查权限系统和防火墙规则。
- 404：路径错或资源被删；线上大面积 404 先看发布是否把静态资源删了。
- 429 Too Many Requests：被限流（带 Retry-After）→ 客户端要做退避重试。
- 502 Bad Gateway：网关收到上游非法响应（上游进程崩了/返回格式错）→ 查上游服务健康。
- 504 Gateway Timeout：上游超时（慢查询/死锁）→ 查上游 P99。

\`\`\`ts
// 前端按语义处理：401 跳登录，429 退避重试，5xx 提示稍后
async function fetchWithPolicy(url: string) {
  const res = await fetch(url);
  if (res.status === 401) return redirectLogin();
  if (res.status === 429) {
    const wait = Number(res.headers.get("Retry-After") ?? 2);
    await sleep(wait * 1000 * (1 + Math.random())); // 加抖动防重试风暴
    return fetchWithPolicy(url);
  }
  if (res.status >= 500) throw new Error("服务开小差，请稍后重试");
  return res;
}
\`\`\`

踩坑：①301 会被浏览器硬缓存，配错后用户侧长期跳错地址，服务端改配置也救不回来——上线 301 前先 302 验证；②302 丢失 POST body 的坑在低版本浏览器仍偶发，API 重定向一律 307/308；③404 页面也消耗 CDN 流量，被刷量时给 404 配短缓存；④502 和 504 经常交替出现——上游半死不活，别只盯着网关日志。`,
    keyPoints: ["301/308 永久会缓存，302/307 临时每次问", "307/308 保证不改方法和 body，304 是协商缓存", "401 凭证失效、403 权限不足、429 限流、502 上游崩、504 上游慢"],
    followUps: ["303 See Other 的设计意图是什么（PRG 模式）？", "Retry-After 与指数退避如何配合防重试风暴？"],
    favorited: false,
  },
  {
    id: "fe-233",
    nodeId: "network-http",
    question: "GET 和 POST 的本质区别是什么？什么是幂等性？RESTful 中 PUT/PATCH/DELETE 该如何正确使用？",
    bigTech: true,
    answer: `结论：GET/POST 在 HTTP 报文层面没有本质区别（都是 TCP 上的文本协议），区别在于语义约定——而语义会驱动浏览器、CDN、网关、爬虫的行为，这才是真正的差异：
1. 安全性：GET 是安全的（safe），不改服务端状态，所以浏览器敢预取、爬虫敢抓、CDN 敢缓存；POST 不行。
2. 幂等性：GET 幂等（执行 N 次 = 执行 1 次的效果），POST 不幂等（重复提交创建多条）。所以浏览器刷新 POST 页面会弹"确认重新提交"，刷新 GET 页面不会。
3. 缓存：GET 响应可被缓存，POST 默认不缓存。
4. 参数位置：GET 参数在 URL（有长度限制、会进浏览器历史和服务器日志——别放敏感数据），POST 在 body。

幂等性是分布式系统设计基石：PUT（整体替换，幂等）、DELETE（删除，幂等——删一次和删十次结果一样：资源不存在）、PATCH（局部修改，不保证幂等——取决于补丁语义，"quantity+1" 不幂等，"quantity=5" 幂等）。

在美团外卖下单接口的重构中，把"创建订单"从 POST 改为"POST + 幂等键"（客户端生成 Idempotency-Key 头，服务端 24h 内同键返回首次结果），彻底解决了弱网下用户重复点击 + 客户端自动重试产生的重复单问题（日均重复单从 300+ 降到 0）：

\`\`\`ts
// 幂等提交：同一操作复用同一 key，服务端去重
async function createOrder(payload: OrderPayload) {
  const key = crypto.randomUUID(); // 一次"下单意图"生成一次，重试复用
  return fetch("/api/orders", {
    method: "POST",
    headers: { "Idempotency-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
\`\`\`

RESTful 正确姿势：GET /orders 列表、GET /orders/123 详情、POST /orders 创建、PUT /orders/123 整体更新、PATCH /orders/123 局部更新、DELETE /orders/123 删除。资源是名词，动作用方法表达，别在 URL 里写动词（/api/getOrder 是 RPC 风格不是 REST）。

踩坑：①GET 带 body 技术上合法但许多框架/代理直接丢弃，别用；②"幂等键"要在用户连续点击/断线重试间复用，每次点击都新生成等于没做；③DELETE 响应体经常被 CDN 吃掉，返回删除后的资源摘要放 header 或干脆 204；④浏览器 form 只支持 GET/POST，PUT/DELETE 要靠 fetch 或隐藏字段 _method（老框架惯例）。`,
    keyPoints: ["本质无区别，语义驱动基础设施行为", "GET 安全幂等可缓存，POST 都不", "幂等键解决重复提交，PUT/DELETE 天然幂等"],
    followUps: ["PATCH 的 JSON Patch（RFC 6902）和 JSON Merge Patch 区别？", "HTTP 条件请求（If-Match）如何实现乐观锁更新？"],
    favorited: false,
  },
  {
    id: "fe-234",
    nodeId: "network-http",
    question: "HTTP/2 的头部压缩（HPACK）和流优先级是如何实现的？服务端推送为什么被废弃？",
    bigTech: true,
    answer: `结论：HPACK 用"静态表 + 动态表 + Huffman 编码"三级压缩干掉 HTTP/1.1 里每次原样重发的头部（Cookie/UA 动辄几百字节）；流优先级用依赖树 + 权重让浏览器告诉服务器先发谁。Server Push 因缓存协调难题和实际负收益被 Chrome 废弃。

HPACK 三级机制：
1. 静态表：RFC 7541 预定义 61 个常见头字段（:method: GET、:status: 200 等），发索引号即可。
2. 动态表：连接期内双方各维护一张 LRU 表，第一次发过的头（如长 Cookie）后续只发索引 + 增量更新，同连接内越压越小。
3. Huffman 编码：对剩余字面量按字符频率变长编码，再省 20-30%。

流优先级：每个流声明依赖父流和权重（1-256），同一父流下按权重分配带宽。浏览器用这套告诉服务器"先传 CSS/JS（阻塞渲染），图片靠后"。Chrome 实际实现是 FIFO 队列（简单但有效），Firefox 真的构建了复杂的依赖树。

Server Push 的失败（2022 年 Chrome 移除）：理论上服务器可以"未请求先推送"关键资源，但现实中——推送的资源浏览器缓存里可能已有（白推浪费带宽，Cache-Digest 提案没落地）；推送流与页面正常请求竞争带宽（反而拖慢首屏）；实现复杂且收益难量化。继任者是 103 Early Hints：服务器在最终响应前先回一个"提示响应"带上 preload 链接，浏览器拿到后自己决定要不要拉（有缓存就不拉），把决策权还给最懂缓存状态的一方。

\`\`\`http
# 103 Early Hints：最终响应还没算完，先给浏览器一点提示
HTTP/1.1 103 Early Hints
Link: </app.css>; rel=preload; as=style
Link: </hero.webp>; rel=preload; as=image

HTTP/1.1 200 OK
Content-Type: text/html
\`\`\`

踩坑：①HPACK 动态表是会话状态，中间代理要正确转发维护，错误的网关实现会导致头部解码错乱（间歇性 400）；②HTTP/2 头部字段必须全小写（:method、:path 是伪头），网关从 1.1 翻译时要规范化；③优先级只是"建议"，多路复用下大文件流照样可能挤占带宽——关键 API 走独立域名/连接隔离更稳；④103 Early Hints 需要 CDN/网关支持链路透传，Cloudflare 已支持，自建 Nginx 1.25+ 可用 early_hints 指令。`,
    keyPoints: ["HPACK：静态表索引 + 动态表增量 + Huffman", "优先级=依赖树+权重，指导带宽分配", "Push 死于缓存协调，103 Early Hints 接管"],
    followUps: ["HPACK 动态表的安全问题（CRIME 类攻击）如何规避？", "为什么 Chrome 用 FIFO 替代复杂的优先级树？"],
    favorited: false,
  },
  {
    id: "fe-235",
    nodeId: "network-http",
    question: "HTTPS 如何防御中间人攻击？HSTS 和证书固定（Pinning）分别解决什么残留风险？",
    bigTech: true,
    answer: `结论：HTTPS 防中间人（MITM）的核心是证书体系——客户端只信任 CA 签发的证书，攻击者伪造不了合法证书就建立不了加密通道。残留风险在"首次连接是 HTTP"和"CA 被攻破/误签发"两个口子，分别由 HSTS 和证书固定来堵。

证书如何堵 MITM：服务端证书绑定域名 + CA 数字签名。中间人想代理解密，必须出示目标域名的证书——去正规 CA 申请不到（要验证域名所有权），自签的证书浏览器直接红色警告。校验链：服务器证书 → 中间 CA → 根 CA（内置在 OS/浏览器信任库），任何一环对不上就断连。

口子 1 → HSTS（HTTP Strict Transport Security）：首次通过 HTTPS 访问后，服务器响应 Strict-Transport-Security: max-age=31536000; includeSubDomains，浏览器之后在 max-age 内对该域名的所有请求强制走 HTTPS——即使用户手敲 http:// 也在浏览器内部改写成 https://（307 内部跳转），不给"SSL Stripping"（把 HTTPS 降级成 HTTP 的攻击）留机会。preload 列表把域名硬编码进浏览器，连第一次都堵上。

口子 2 → 证书固定（Certificate Pinning）：App/Hybrid 内把"只接受某个 CA 或某张证书的公钥指纹"写死在客户端，即使攻击者拿到任意 CA 误签发的证书（DigiNotar 事件）也无法通过校验。Web 端曾用 HPKP 头，但因"配错=自杀"（把合法新证书也拒了，站点直接瘫痪）被废弃；App 端 pinning 仍是金融级标配。

\`\`\`ts
// 客户端指纹校验示意（App/WebView 内）
const PINNED_SPKI = "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
function verifyPin(certDer: ArrayBuffer) {
  const spki = extractPublicKey(certDer);
  if (sha256Base64(spki) !== PINNED_SPKI) throw new Error("cert pin mismatch");
}
\`\`\`

在招商银行 App 的渗透测试整改中，加上 SPKI pinning + 备用 pin（pin 当前证书 + 下一张备用证书，防换证锁死）后，Burp/Fiddler 类代理抓包全部失效。

踩坑：①HSTS 误开 includeSubDomains 会波及未上 HTTPS 的子域（如内部测试域），先不带子域灰度；②pinning 必须配备用 pin 且 pin 公钥而非证书（证书年年换，公钥可以不变）；③企业内网代理（Zscaler 类）会合法做 MITM—— pinning 的 App 在员工网络里会挂，要留白名单或企业证书通道；④Charles 抓包失败时先怀疑 pinning 而不是网络。`,
    keyPoints: ["证书链校验堵 MITM 主路", "HSTS 堵 SSL Stripping 降级，preload 连首次都堵", "Pinning 堵 CA 误签发，必须配备用 pin"],
    followUps: ["HPKP 为什么被废弃，教训是什么？", "证书透明度（CT Log）如何让误签发可被发现？"],
    favorited: false,
  },
  {
    id: "fe-236",
    nodeId: "network-http",
    question: "Cookie 的 HttpOnly、Secure、SameSite、Domain、Path 属性各自防什么？SameSite 三种模式的实战影响？",
    bigTech: true,
    answer: `结论：Cookie 属性的本质是"最小化凭证的暴露面"——HttpOnly 防 XSS 偷 Cookie，Secure 防明文窃听，SameSite 防 CSRF 跨站携带，Domain/Path 限制作用域防跨子域泄露。

属性逐个拆解：
- HttpOnly：document.cookie 读不到，XSS 注入的脚本偷不走会话（只能服务端 Set-Cookie 时设置）。
- Secure：仅 HTTPS 发送，防中间人在 HTTP 链路上嗅探。
- SameSite=Lax（默认）：跨站请求不携带，但"顶级导航 + 安全方法"（点链接 GET 跳转）放行——微信里点开链接能保持登录态靠的就是它。
- SameSite=Strict：一切跨站都不带，连点链接都不带（银行级，体验差）。
- SameSite=None：跨站携带，必须配 Secure——OAuth 回调、第三方嵌入（如支付收银台 iframe）必须用它。
- Domain：默认仅当前主机（不含子域）；设 Domain=.example.com 则所有子域共享——攻击者拿下任何一个子域就能读到主站 Cookie，作用域能小则小。
- Path=/admin：限制路径前缀，管理后台 Cookie 不带到前台页面。

在拼多多第三方登录接入时，微信 OAuth 回调后 session 丢失——回调是跨站 GET 顶级导航，Lax 本应放行，但我们在 SameSite 默认值变更前的老 Chrome 上显式设了 SameSite=None 却忘了 Secure，Chrome 直接拒收这个 Cookie。修复：SameSite=None; Secure 配对出现。

\`\`\`http
# 会话 Cookie 的黄金配置
Set-Cookie: sid=xxx; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
# 跨站场景（支付 iframe）
Set-Cookie: pay_token=yyy; HttpOnly; Secure; SameSite=None; Path=/pay
\`\`\`

踩坑：①前后端分离跨域 fetch 必须 credentials: "include" + 服务端 Access-Control-Allow-Credentials: true，且 Allow-Origin 不能是 *；②Cookie 的 key 同名但 Domain/Path 不同时是两个 Cookie，会并发发送两个，排查"莫名串号"时先看这个；③Max-Age 和 Expires 同时出现时 Max-Age 优先；④第三方 Cookie 正在被 Chrome 逐步淘汰（Privacy Sandbox），依赖它的广告/埋点方案要迁 CHIPS（分区 Cookie）或第一方。`,
    keyPoints: ["HttpOnly 防 XSS 窃取，Secure 防嗅探", "SameSite=Lax 默认，None 必须配 Secure", "Domain 作用域能小则小，防子域沦陷连坐"],
    followUps: ["CHIPS 分区 Cookie 如何解决第三方 Cookie 淘汰后的嵌入场景？", "Token 放 localStorage vs Cookie 的安全辩论双方论据？"],
    favorited: false,
  },
  {
    id: "fe-237",
    nodeId: "network-http",
    question: "如何实现大文件下载的断点续传和多线程并发下载？Range 请求的协议细节是什么？",
    bigTech: true,
    answer: `结论：HTTP Range 请求让客户端只拉取资源的字节区间（Range: bytes=start-end），服务端回 206 Partial Content 带 Content-Range。断点续传 = 记录已下载偏移，中断后从偏移续拉；并发下载 = 按区间切成 N 段并行拉取再拼接，前提是服务端支持 Range（响应头 Accept-Ranges: bytes）。

协议细节：
- 探测：HEAD 请求拿 Content-Length 和 Accept-Ranges，确认支持分段。
- 单段：Range: bytes=0-1048575 → 206 + Content-Range: bytes 0-1048575/52428800。
- 多段一次请求：Range: bytes=0-99,200-299 → 206 + multipart/byteranges 边界分隔（实际客户端多为每段单独请求，好重试）。
- 服务端不支持会回 200 全量——代码里必须判断状态码，206 才按段处理。
- If-Range 配合 ETag：文件在两次续传间被改了，重新全量下载，防止拼出"一半旧一半新"的损坏文件。

在百度网盘 Web 版的下载器实现中，50MB 安装包切 8 段并发（浏览器对单域名 6 连接限制，6-8 段是甜点），弱网下速度提升 4 倍，且每段失败独立重试：

\`\`\`ts
async function downloadChunk(url: string, start: number, end: number): Promise<ArrayBuffer> {
  const res = await fetch(url, { headers: { Range: \`bytes=\${start}-\${end}\` } });
  if (res.status !== 206) throw new Error("server does not support range");
  return res.arrayBuffer();
}

async function parallelDownload(url: string, workers = 6) {
  const head = await fetch(url, { method: "HEAD" });
  const size = Number(head.headers.get("Content-Length"));
  const etag = head.headers.get("ETag"); // 续传校验
  const chunkSize = Math.ceil(size / workers);
  const parts = await Promise.all(
    Array.from({ length: workers }, (_, i) =>
      downloadChunk(url, i * chunkSize, Math.min((i + 1) * chunkSize, size) - 1))
  );
  return new Blob(parts); // 顺序拼接
}
\`\`\`

踩坑：①分段不是越多越好——每段一次 TLS 慢启动，小文件分段反而慢，<2MB 直接全量；②断点记录要用 (url + etag) 做 key，文件变了旧偏移作废；③iOS Safari 对 Range + Blob 大文件容易内存爆，要改 IndexedDB 分段落盘；④CDN 边缘节点要支持 Range 透传，源站支持但 CDN 回源时吃掉 Range 头等于白搭；⑤暂停恢复时先 HEAD 校验 ETag 变了没。`,
    keyPoints: ["Range 请求 → 206 Partial Content + Content-Range", "并发分段甜点 6-8 段，失败独立重试", "If-Range/ETag 防跨版本拼接损坏"],
    followUps: ["视频流的 Range 请求（206 拖放播放）和下载场景有何不同？", "HTTP/2 下并发分段还有必要吗？"],
    favorited: false,
  },
  // ===== 34. network-advanced 网络进阶：缓存、跨域与实时通信 =====
  {
    id: "fe-238",
    nodeId: "network-advanced",
    question: "浏览器缓存的完整决策链路是什么？Cache-Control 各指令如何组合？为什么 HTML 用协商缓存、静态资源用强缓存？",
    bigTech: true,
    answer: `结论：缓存决策链 = 先看强缓存（不发请求，200 from disk/memory cache）→ 过期则走协商缓存（发请求带验证器，没变回 304 用缓存，变了回 200 新内容）。

决策链详解：
1. 强缓存：响应头 Cache-Control: max-age=31536000 或 Expires（HTTP/1.0 遗留，max-age 优先）。未过期直接用，连请求都不发——Network 面板显示 (disk cache)/(memory cache)。
2. 协商缓存：强缓存过期后，浏览器带 If-None-Match（存上次 ETag）和 If-Modified-Since（存上次 Last-Modified）发请求。服务端比对：没变 → 304（无 body，极省流量）；变了 → 200 + 新内容 + 新缓存头。
3. 验证器对比：ETag（内容哈希，精确）优先于 Last-Modified（秒级精度，1 秒内多次修改识别不出，且 CDN 回源可能改写 mtime）。

黄金组合（字节跳动静态资源发布规范）：
- HTML：Cache-Control: no-cache（每次协商，必须拿到最新 HTML，因为它引用了带 hash 的静态资源 URL）→ max-age=0 + ETag。
- 带内容 hash 的 JS/CSS/图片（app.a1b2c3.js）：Cache-Control: max-age=31536000, immutable（一年强缓存，内容变 = 文件名变 = 新 URL，旧缓存永不被请求）。
- no-cache ≠ 不缓存！是"每次用前先协商"；真不缓存是 no-store（敏感数据如银行页面）。

\`\`\`nginx
# HTML：每次协商（保证新版本立即生效）
location ~* \\.html$ {
  add_header Cache-Control "no-cache";
  etag on;
}
# hash 静态资源：一年强缓存（immutable 阻止刷新时协商）
location ~* \\.(js|css|png|webp|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
\`\`\`

踩坑：①immutable 防止"用户按 F5 时浏览器对所有资源发协商请求"——没它，F5 一次几百个 304 请求照样慢；②heuristic caching（无缓存头时浏览器按 Last-Modified 的 10% 时间猜一个缓存期）行为不可控，必须显式写头；③Service Worker 的 Cache API 优先级高于 HTTP 缓存，SW 缓存不更新会让 HTTP 缓存策略失效（版本升级要配套 SW 更新机制）；④private vs public：带用户态的响应（Set-Cookie）要 private，防 CDN 把 A 的页面缓存给 B。`,
    keyPoints: ["强缓存不发请求，协商缓存发请求验证", "HTML no-cache 协商 + hash 资源一年强缓存 immutable", "no-cache=每次协商，no-store=真不存"],
    followUps: ["ETag 在分布式集群（多机 mtime/哈希不一致）下怎么生成才可靠？", "stale-while-revalidate 和 stale-if-error 指令的价值？"],
    favorited: false,
  },
  {
    id: "fe-239",
    nodeId: "network-advanced",
    question: "CORS 预检请求（preflight）什么时候触发？服务端如何正确配置？如何减少预检带来的延迟？",
    bigTech: true,
    answer: `结论：跨域请求分两类——简单请求直接发（浏览器事后校验响应头），非简单请求先发 OPTIONS 预检探权限，通过后才发真实请求。预检的目的是"先问清楚再动手"，防止跨域写操作在服务端生效后才发现没权限。

简单请求三条件（全满足才算）：①方法是 GET/HEAD/POST；②头部只含安全清单（Accept、Accept-Language、Content-Language、Content-Type）；③Content-Type 仅为 text/plain、application/x-www-form-urlencoded、multipart/form-data 之一。——所以 application/json 的 POST 必触发预检，这是最常见的"为什么我的请求发了两次"。

服务端正确配置（Node 示例，滴滴顺风车 API 网关的 CORS 中间件）：

\`\`\`ts
function cors(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin;
  // 白名单精确匹配，别反射任意 origin（等于没防护）
  if (origin && ALLOW_LIST.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // 不能用 *（带凭证时）
    res.setHeader("Vary", "Origin"); // 关键：防 CDN 把 A 域的缓存给 B 域
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Trace-Id");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Max-Age", "86400"); // 预检结果缓存一天
  }
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return true; }
  return false;
}
\`\`\`

预检延迟优化：①Access-Control-Max-Age 拉长（Chrome 上限 2h，部分浏览器 24h），把 OPTIONS 从每次请求变成每天一次；②接口归并——把 application/json 的简单 GET 参数化改造（能进安全清单就不预检）；③同域部署用 nginx 反代把 /api 收编，从源头消灭跨域；④CDN 边缘节点应答 OPTIONS（边缘缓存预检结果），不用回源。

踩坑：①Allow-Origin 用 * 且 Allow-Credentials: true 会被浏览器拒绝（两者互斥）；②自定义头（X-Token 之类）忘记加进 Allow-Headers 是"预检 403"头号原因；③预检响应没有正确返回 204/200 而是 302 到登录页（SSO 拦截了 OPTIONS）——鉴权中间件必须放行 OPTIONS；④Vary: Origin 缺失会让 CDN 缓存错串，A 域能访问 B 域报错。`,
    keyPoints: ["json POST 必预检：非简单请求三条件", "Allow-Origin 精确值+Vary: Origin，带凭证不能 *", "Max-Age 缓存预检结果消灭重复 OPTIONS"],
    followUps: ["CORS 响应头 Access-Control-Expose-Headers 管什么？", "为什么 form 表单提交（text/plain）从不触发预检——历史兼容设计？"],
    favorited: false,
  },
  {
    id: "fe-240",
    nodeId: "network-advanced",
    question: "跨域解决方案有哪些？CORS、JSONP、postMessage、反向代理、WebSocket 各自适用什么场景？",
    bigTech: true,
    answer: `结论：现代首选 CORS（标准、安全、细粒度），开发期用反向代理消灭跨域，JSONP 只用于老浏览器/只读场景，postMessage 解决 iframe/窗口间通信，WebSocket 不受同源限制天然跨域。按"控制权和实时性"选型。

方案对比与选型（新浪微博历史架构演进实例）：
1. CORS：服务端加响应头授权，支持全部方法/自定义头/凭证。适用：你有服务端控制权的一切 API 场景。短板：老 IE 不支持、首次预检多一个 RTT。
2. JSONP：利用 script 标签无跨域限制，服务端把 JSON 包进回调函数名返回（callback({...})）。只支持 GET、无错误处理、XSS 面大（返回的 JS 直接执行）。适用：只读公开数据 + 古董浏览器。2026 年的今天基本只存在于面试题和老系统。
3. 反向代理：开发期 webpack/vite devServer.proxy 把 /api 转发到后端，生产用 nginx 把 /api 反代到 API 服务——浏览器看到的是同域，CORS 根本不存在。适用：前后端同团队、BFF 架构。
4. postMessage：iframe 父子窗口、window.open 打开的新窗口之间安全通信（要校验 event.origin！）。适用：支付收银台、第三方 SDK 嵌入、微前端主子应用隔离通信。
5. WebSocket：握手用 HTTP 但不受同源策略约束（服务端校验 Origin 头即可）。适用：实时推送、协同编辑。

\`\`\`ts
// postMessage 正确姿势：双向校验 origin 和 source
// 父页面（收银台宿主）
window.addEventListener("message", (e) => {
  if (e.origin !== "https://pay.example.com") return; // 防任意页面伪造消息
  if (e.source !== payFrame.contentWindow) return;
  handlePayResult(e.data);
});
payFrame.contentWindow!.postMessage({ order }, "https://pay.example.com"); // 精确目标，别用 *

// vite 开发代理：开发期消灭跨域
export default { server: { proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } } } };
\`\`\`

踩坑：①JSONP 没有错误回调，用 script.onerror 兜底也拿不到状态码；②postMessage 目标写 "*" = 把数据广播给任何能拿到窗口引用的页面，token 类数据直接泄露；③devServer proxy 只在开发环境存在，生产忘了配 nginx 反代会"本地好的线上跨域"；④WebSocket 不受同源限制 ≠ 不需要鉴权——握手时校验 Origin + 首包带 token；⑤document.domain 降域方案已被 Chrome 禁用（109+），老系统迁移时别踩。`,
    keyPoints: ["CORS 是标准答案，代理从源头消灭跨域", "JSONP 只读 GET，postMessage 必须校验 origin", "WebSocket 天然跨域但握手要鉴权"],
    followUps: ["微前端架构下子应用通信为什么倾向 CustomEvent 而非 postMessage？", "nginx 反代时 Host 头和 X-Forwarded-For 怎么正确传递？"],
    favorited: false,
  },
  {
    id: "fe-241",
    nodeId: "network-advanced",
    question: "TCP 三次握手和四次挥手的过程是什么？为什么握手是三次、挥手是四次？",
    bigTech: true,
    answer: `结论：三次握手的本质是"双方互相同步初始序列号（ISN）并确认彼此的收发能力正常"——两次握手无法让服务端确认客户端的接收能力，且会放大数据库中的历史重复连接（SYN 洪泛下资源耗尽）；四次挥手多一次是因为 TCP 全双工，两端要各自独立关闭自己的发送通道（FIN + ACK 分开），中间可能有数据没传完。

三次握手：
1. C→S：SYN=1, seq=x（我想连你，我的初始序号是 x）。
2. S→C：SYN=1, ACK=1, seq=y, ack=x+1（收到，我的序号是 y，你的 x 我收到了）。
3. C→S：ACK=1, seq=x+1, ack=y+1（你的 y 我也收到了，开聊）。
两次为什么不行：服务端发完 SYN+ACK 就进入 ESTABLISHED 分配资源的话，一个延迟到达的旧 SYN（网络拥塞重发的）会让服务端白白为一个死人开连接；第三次 ACK 让服务端确认"对方真实存在且收到了我的回复"。

四次挥手：
1. C→S：FIN=1, seq=u（我没数据要发了）。
2. S→C：ACK=1, ack=u+1（知道了，但我可能还有数据没发完——所以 ACK 和 FIN 不能合并，这是四次的关键）。
3. S→C：FIN=1, seq=w（我也发完了）。
4. C→S：ACK=1, ack=w+1（收到，拜拜）→ 客户端进入 TIME_WAIT 等 2MSL（防最后一个 ACK 丢失，让对方能重发 FIN）。

TIME_WAIT 是高频追问：主动关闭方等待 2 倍最大报文寿命（Linux 默认 60s）。高并发短连接下 TIME_WAIT 堆积会耗尽端口（单机 6 万端口）——这就是为什么要 keep-alive 长连接复用，也是 Node 服务要调 net.ipv4.tcp_tw_reuse 的原因。

在京东秒杀网关的容量治理中，压测时发现网关到上游全是 TIME_WAIT（QPS 3 万 × 60s 堆积），打开上游 keep-alive 复用后 TIME_WAIT 从 5 万降到 200，P99 延迟降 40%。

\`\`\`bash
# 查看 TIME_WAIT 堆积
ss -s  # 或 netstat -ant | grep TIME_WAIT | wc -l
# 复用 TIME_WAIT 端口（客户端侧有效）
sysctl -w net.ipv4.tcp_tw_reuse=1
\`\`\`

踩坑：①SYN 洪泛攻击利用"半连接队列"——服务端收到 SYN 不回 ACK 就占着坑，靠 syncookies 缓解；②CLOSE_WAIT 堆积是服务端 bug（收到 FIN 没调 close），别和 TIME_WAIT 搞混；③tcp_tw_recycle 在 NAT 环境下会丢包，已在内核 4.12 移除，别照抄老博客；④HTTP/1.1 keep-alive 空闲超时两端不一致（客户端 60s、服务端 5s）会导致"拿到一个刚被服务端关闭的连接"偶发报错，客户端超时必须小于服务端。`,
    keyPoints: ["三次握手互相同步 ISN + 确认收发能力", "四次挥手因全双工，FIN 与 ACK 分开", "TIME_WAIT=2MSL 防丢包，高并发靠长连接复用"],
    followUps: ["TIME_WAIT 和 CLOSE_WAIT 分别暴露什么问题？", "TCP 快速打开（TFO）如何砍掉握手 RTT，为什么没普及？"],
    favorited: false,
  },
  {
    id: "fe-242",
    nodeId: "network-advanced",
    question: "TCP 如何保证可靠传输？序号确认、超时重传、滑动窗口、流量控制、拥塞控制分别解决什么？",
    bigTech: true,
    answer: `结论：TCP 可靠性 = 序号/确认（知道谁没收到）+ 超时重传/快速重传（丢包补救）+ 滑动窗口（批量发送提效）+ 流量控制（别撑死接收方）+ 拥塞控制（别压垮网络）。五个机制环环相扣，缺一不可。

机制拆解：
1. 序号与确认：每个字节都有 seq，接收方回 ack=下一个期望序号（累积确认，ack=1001 表示 1000 以前全收到了）。
2. 超时重传（RTO）：发完启动计时器，超时未收到 ACK 重发。RTO 基于 RTT 动态计算（Karn 算法）。
3. 快速重传：收到 3 个重复 ACK 说明中间丢了一个包，不等超时立即重传——把恢复时间从 RTO（秒级）压到一个 RTT。
4. 滑动窗口：不等每个 ACK，窗口内连续发多个段，ACK 滑动窗口右移——把"停等协议"的吞吐从 1 段/RTT 提升到 窗口大小/RTT。
5. 流量控制：接收方在 ACK 里携带 rwnd（接收窗口剩余），发送方不超发——防接收缓冲区溢出。
6. 拥塞控制：发送方维护 cwnd，慢启动（指数爬升）→ 拥塞避免（线性）→ 丢包即减半（AIMD）。实际发送窗口 = min(rwnd, cwnd)。现代算法 BBR 不再把丢包当拥塞信号，而是测量带宽和 RTT 主动调速，高丢包网络下吞吐比 CUBIC 高 20 倍。

对前端的实战意义：①首屏要传的数据量 ÷ 初始拥塞窗口（10 个 MSS ≈ 14KB）决定首屏要几个 RTT——关键资源压进 14KB 内可以 1 个 RTT 送达，这是"14KB 规则"的由来；②BBR 在 CDN 侧开启即可让全球用户受益（Google/Cloudflare 默认开）；③大文件上传把应用层分块 + 并行连接，本质是绕过单连接 cwnd 上限。

\`\`\`text
# 初始拥塞窗口下的首包容量：14KB 是黄金线
TCP 初始 cwnd = 10 MSS ≈ 10 × 1460B ≈ 14KB
→ HTML + 关键 CSS + 首屏数据 < 14KB 时，1 个 RTT 就能开始渲染
\`\`\`

在 YouTube 的 QUIC 落地报告里，BBR + 0-RTT 让移动弱网（丢包 2%+）视频起播时间降低 15%——传统 CUBIC 一遇丢包就把窗口砍半，BBR 按实测带宽维持发送速率。

踩坑：①"TCP 不丢包"是错觉——它保证不重不漏不乱序，但代价是延迟抖动（重传时应用层干等）；实时音视频宁可丢帧也不要重传，所以走 UDP/QUIC；②Nagle 算法（攒小包）和延迟 ACK 叠加会制造 40ms 级延迟，RPC 场景要 TCP_NODELAY；③cwnd 在连接空闲一段时间后会回退（slow start after idle），长连接预热也防不住，别迷信"保活就能一直保持高吞吐"。`,
    keyPoints: ["序号累积确认 + 快速重传补丢包", "滑动窗口提吞吐，rwnd 流量控制，cwnd 拥塞控制", "14KB 初始窗口规则 + BBR 按带宽调速"],
    followUps: ["BBR 和 CUBIC 的本质分歧（丢包信号 vs 带宽测量）？", "队头阻塞在 TCP 层如何影响 HTTP/2？"],
    favorited: false,
  },
  {
    id: "fe-243",
    nodeId: "network-advanced",
    question: "CDN 的工作原理是什么？回源、缓存命中率、动态内容加速分别怎么理解和优化？",
    bigTech: true,
    answer: `结论：CDN = 把内容缓存到离用户最近的边缘节点，用 DNS 调度（或 Anycast）把用户导到最近节点。核心价值是消灭物理距离带来的 RTT——北京到洛杉矶光速往返就要 120ms，而本地节点只有 5ms。

工作链路：①用户解析 static.example.com → DNS 返回 CNAME 到 CDN 调度域 → 调度系统按用户 IP（LocalDNS 出口）返回最优边缘节点 IP；②浏览器向边缘节点请求；③节点有缓存且未过期 → 直接返回（命中）；④未命中 → 回源（节点向源站拉取，常走 CDN 内部骨干网优化链路）→ 缓存并返回。

缓存命中率优化（B 站静态资源命中率从 82% 提到 97% 的措施）：
1. 统一 URL：同资源多 URL（参数顺序不同、带无关 query 如 ?t=123、www 和非 www）会各存一份——规范化排序 + 忽略无意义参数。
2. 长缓存 + 内容 hash：max-age 一年，内容变 URL 变，命中率自然高。
3. 预热：发布前主动调 CDN 预热接口把新资源推送到边缘节点，避免发布瞬间回源风暴。
4. 分层回源：边缘 → 区域中心 → 源站三级，中心层聚合回源请求（request collapsing），1000 个边缘节点未命中也只回源 1 次。

动态内容加速：API/HTML 不能长缓存，但 CDN 仍有价值——边缘节点终结 TCP/TLS（握手 RTT 减半）、回源走骨干网（比公网稳定）、智能路由选最优路径（Akamai/Cloudflare 的 Argo）、DDoS 清洗。对 HTML 可用短缓存 + stale-while-revalidate：用户先拿到 5 秒前的缓存（秒开），后台异步回源刷新。

\`\`\`nginx
# 源站侧配合：告诉 CDN 什么能缓存
location /api/ {
  add_header Cache-Control "private, no-store"; # 动态接口禁缓存
}
location ~* \\.(js|css|webp)$ {
  add_header Cache-Control "public, max-age=31536000, immutable"; # 静态一年
}
\`\`\`

踩坑：①"命中率低"先查 URL 里有没有时间戳/随机数参数（前端埋点 SDK 最爱加）；②源站 Response 带 Set-Cookie 默认导致 CDN 不缓存（要显式忽略）；③刷新（purge）是异步生效的（分钟级全球扩散），紧急下架要配合源站 404；④回源 Host 头要带对（节点默认带加速域名，源站 vhost 按域名分发，带错回源 404）；⑤EDNS Client Subnet 让调度看到真实用户 IP，不开的话按 LocalDNS 位置调度，跨省宽带用户会被调度到错误省份。`,
    keyPoints: ["DNS 调度就近接入，消灭物理 RTT", "URL 规范化+hash 文件名+预热拉满命中率", "动态内容吃连接复用/骨干网/智能路由红利"],
    followUps: ["Anycast 调度和 DNS 调度各有什么优劣？", "CDN 边缘计算（Cloudflare Workers）把缓存架构变成了什么？"],
    favorited: false,
  },
  {
    id: "fe-244",
    nodeId: "network-advanced",
    question: "WebSocket、SSE、长轮询的区别和选型？WebSocket 的心跳与断线重连如何设计？",
    bigTech: true,
    answer: `结论：三者都是"服务器主动推数据"的方案——WebSocket 全双工二进制长连接（实时双向交互选它）；SSE 是 HTTP 单向文本流（服务端推、客户端收，自动重连内置，LLM 流式输出的事实标准）；长轮询是兼容性兜底的假实时（请求挂起 30s，有数据才返回）。

对比维度：
- 方向：WebSocket 双向；SSE 仅服务端→客户端；长轮询靠反复请求模拟。
- 协议开销：WebSocket 握手后帧头仅 2-14 字节；SSE 每次事件几个字节文本头；长轮询每条消息一次完整 HTTP 请求（头部几百字节）。
- 基础设施亲和：SSE 就是普通 HTTP，过代理/防火墙/CDN 无障碍，还能享受 HTTP/2 多路复用；WebSocket 要处理 Upgrade 协议在老旧代理上的兼容。
- 断线重连：SSE 浏览器原生自动重连（带 Last-Event-ID 续传）；WebSocket 必须自己实现。

WebSocket 生产级心跳与重连设计（知乎私信系统的线上配置）：心跳间隔 25s（NAT 表项普遍 60s 老化，必须更短）；客户端发 ping，连续 2 次未收到 pong 判定假死主动断开重连；重连用指数退避 + 随机抖动（1s→2s→4s…上限 30s），断线期间消息走"重连后拉取离线消息"补全：

\`\`\`ts
class LiveSocket {
  private ws!: WebSocket;
  private missedPongs = 0;
  private retries = 0;
  private heartbeat?: ReturnType<typeof setInterval>;

  connect() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => {
      this.retries = 0;
      this.heartbeat = setInterval(() => {
        if (this.missedPongs >= 2) return this.ws.close(); // 假死判定
        this.missedPongs++;
        this.ws.send(JSON.stringify({ type: "ping" }));
      }, 25_000); // 小于 NAT 60s 老化
    };
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "pong") { this.missedPongs = 0; return; }
      this.onMessage(msg);
    };
    this.ws.onclose = () => {
      clearInterval(this.heartbeat);
      const delay = Math.min(1000 * 2 ** this.retries++, 30_000) * (0.5 + Math.random() / 2);
      setTimeout(() => this.connect(), delay); // 指数退避 + 抖动防雪崩
    };
  }
}
\`\`\`

踩坑：①"连接还在但数据不通"的假死最阴——TCP 半开（对端断电没发 FIN）下浏览器以为连接正常，必须应用层心跳检测；②移动端切后台 JS 定时器被节流，心跳停发被服务端踢掉——切回前台要立即主动检测重连（visibilitychange）；③Nginx 反代 WebSocket 要配 Upgrade/Connection 头 + proxy_read_timeout（默认 60s 无数据就断）；④SSE 在 HTTP/1.1 下单域名 6 连接限制会被流占满，多开几个 tab 页就挂——必须 HTTP/2；⑤重连风暴：服务端重启瞬间万级客户端同时重连，抖动和随机化是保命设计。`,
    keyPoints: ["双向交互 WebSocket，服务端推流 SSE，兜底长轮询", "心跳 < NAT 老化 60s，2 次未 pong 判假死", "指数退避+抖动防重连风暴，离线消息重连补拉"],
    followUps: ["SSE 的 Last-Event-ID 断线续传如何实现？", "WebSocket 二进制协议（protobuf）相比 JSON 文本的收益？"],
    favorited: false,
  },
  {
    id: "fe-245",
    nodeId: "network-advanced",
    question: "DNS 解析的完整过程是什么？DNS 预解析、HTTPDNS、DNS over HTTPS 分别解决什么问题？",
    bigTech: true,
    answer: `结论：DNS 是域名 → IP 的分布式目录服务。解析链：浏览器缓存 → 系统缓存 → hosts 文件 → 本地递归 DNS（运营商）→ 根 → 顶级域（.com）→ 权威 DNS，逐级查询并缓存（TTL 控制）。移动端弱网下 DNS 可能成为首个性能瓶颈（递归查询数百毫秒），且运营商劫持/污染直接影响可用性。

完整过程（以 www.example.com 为例）：本地递归服务器没缓存时，先问根（返回 .com 顶级域服务器地址）→ 问 .com（返回 example.com 权威地址）→ 问权威（拿到 A 记录 IP）→ 沿途按 TTL 缓存。用户侧实际感知的是"递归服务器有没有缓存"——命中就是 1-5ms，未命中要 100-500ms。

三大优化技术：
1. DNS 预解析（dns-prefetch）：HTML 里声明 <link rel="dns-prefetch" href="//cdn.example.com">，浏览器空闲时提前解析，用户点击时省掉 100ms+。对跨域静态资源域、API 域必配。
2. HTTPDNS：App 内绕过运营商 LocalDNS，直接 HTTP 请求 DNS 服务商（阿里云/腾讯云 HTTPDNS）拿 IP——解决运营商劫持（插广告）、解析不准（跨网调度错误，CDN 给你分到错误省份）、TTL 被运营商篡改拉长（切流量切不动）三大顽疾。手淘接入 HTTPDNS 后，因 DNS 劫持导致的失败率下降 90%。
3. DoH（DNS over HTTPS）/DoT：把 DNS 查询加密进 HTTPS/TLS，防中间人窃听和篡改查询（隐私 + 防污染）。浏览器可在设置里开（Cloudflare 1.1.1.1、Google 8.8.8.8）。

\`\`\`html
<!-- 前端能做的两件事 -->
<link rel="dns-prefetch" href="//api.example.com" />
<link rel="preconnect" href="https://api.example.com" crossorigin /> <!-- 更进一步：连 TCP+TLS 都建好 -->
\`\`\`

踩坑：①TTL 设太短（<60s）递归服务器频繁回源，解析变慢且权威服务器压力大；设太长（>1天）切机房/换 IP 时老缓存不生效——灰度期调短，稳定期调长；②预解析别超过 10 个域，多了反而争抢；③HTTPDNS 拿到的 IP 直连后，HTTPS 证书校验的 SNI/Host 要手动带上原域名（不然证书不匹配）；④DoH 会让企业内网的 DNS 审计/安全网关失效，部分企业策略会封禁 DoH 域名；⑤IPv6 AAAA 记录和 A 记录并行查询，配错 AAAA（指向不可达 IPv6）会导致部分用户连接超时——Happy Eyeballs 算法能缓解但不根治。`,
    keyPoints: ["递归链：根→顶级→权威，TTL 层层缓存", "HTTPDNS 治劫持/调度错/TTL 篡改", "dns-prefetch 预解析，preconnect 连握手都提前"],
    followUps: ["Happy Eyeballs（RFC 8305）如何优化 IPv4/IPv6 竞速？", "ECS（EDNS Client Subnet）对 CDN 调度的意义？"],
    favorited: false,
  },
  // ===== 35. coding-utility 手写题：JS 核心工具 =====
  {
    id: "fe-246",
    nodeId: "coding-utility",
    question: "手写防抖和节流。两者本质区别是什么？immediate 版防抖如何实现？各自有哪些容易踩的坑？",
    bigTech: true,
    answer: `结论：防抖（debounce）是"等你不动了才执行"——n 秒内连续触发只保留最后一次；节流（throttle）是"按固定节奏执行"——n 秒内最多执行一次。防抖合并的是"意图"（搜索联想、resize 重算、自动保存），节流限制的是"频率"（滚动监听、按钮防连点、mousemove 上报）。

本质区别在"时间窗口的归属"：防抖的窗口随每次触发不断重置（ trailing edge 执行），节流的窗口固定向前推进（leading 或 trailing edge 执行）。

在字节跳动的中台表单项目中，我们用 immediate 防抖做"提交按钮防连点"——首次点击立即执行，之后 1 秒内的重复点击全部丢弃。如果用普通防抖，用户会觉得"点了没反应"：

\`\`\`ts
// 防抖：触发后等待 wait ms，期间再触发则重新计时
function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number, immediate = false) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  function debounced(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);          // 重置窗口：防抖的核心
    const callNow = immediate && !timer;     // immediate：窗口首次立即执行
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);  // 尾部执行
    }, wait);
    if (callNow) fn.apply(this, args);       // 立即执行分支
  }
  debounced.cancel = () => {                 // 必须提供 cancel：组件卸载防内存泄漏
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

// 节流：时间戳 + 定时器双版本。时间戳版 leading 执行，定时器版 trailing 执行
function throttle<T extends (...args: unknown[]) => void>(fn: T, interval: number) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function throttled(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - last);
    if (remaining <= 0) {                    // 间隔已到：立即执行（leading）
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timer) {                     // 间隔内：挂一个尾随和弦（trailing）
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
\`\`\`

踩坑实录：①this 和 event 丢失——React 合成事件有对象池复用（React 17 已移除但观念残留），防抖后 event 是"过期"的，要提前 e.persist() 或解构出值；②忘加 cancel——组件卸载后定时器回调访问已卸载的 setState，React 会警告内存泄漏；③immediate 版的判断顺序——先 clearTimeout 再判断 callNow，否则 immediate 永远 false；④时间戳版节流在"最后一段间隔内"的触发被直接丢弃，滚动停止时最后一帧丢失，需要 trailing 定时器补发；⑤requestAnimationFrame 其实是更"屏幕同步"的节流（16.6ms），视觉类场景优先 rAF 而非 setTimeout 节流。`,
    keyPoints: ["防抖重置窗口、节流固定窗口", "immediate = 窗口首次立即执行", "cancel 防卸载后回调，rAF 是视觉场景的更优节流"],
    followUps: ["防抖节流在 React 18 中与 startTransition 如何取舍？", "如何用 AbortController 统一管理一批 debounced 函数的生命周期？"],
    favorited: false,
  },
  {
    id: "fe-247",
    nodeId: "coding-utility",
    question: "手写深拷贝。如何处理循环引用、Date/RegExp/Map/Set 等特殊类型？structuredClone 能替代手写吗？",
    bigTech: true,
    answer: `结论：JSON.parse(JSON.stringify()) 只能处理纯数据——会丢 undefined/function/Symbol、Date 变字符串、RegExp 变 {}、循环引用直接抛错。生产级深拷贝必须递归遍历 + WeakMap 缓存处理循环引用 + 按类型分发特殊拷贝。structuredClone 是原生方案，能处理 90% 场景，但无法拷贝函数和 DOM 节点，且老浏览器要 polyfill。

在富文本编辑器项目中，我们曾用 JSON 深拷贝备份文档模型，结果文档里的 Date 字段全部变成字符串，导致"最近编辑时间"显示错乱；换成结构化深拷贝后解决：

\`\`\`ts
function deepClone<T>(value: T, hash = new WeakMap<object, unknown>()): T {
  // 1. 原始类型与函数直接返回（函数不可拷贝，共享引用）
  if (value === null || typeof value !== "object") return value;

  // 2. 循环引用：已拷贝过的对象直接返回缓存
  if (hash.has(value as object)) return hash.get(value as object) as T;

  // 3. 特殊类型分支
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (value instanceof RegExp) {
    const re = new RegExp(value.source, value.flags) as T;
    (re as RegExp).lastIndex = value.lastIndex; // 保留 lastIndex，g 标志的坑
    return re;
  }
  if (value instanceof Map) {
    const result = new Map();
    hash.set(value as object, result);          // 先注册再递归，防自引用 Map
    value.forEach((v, k) => result.set(deepClone(k, hash), deepClone(v, hash)));
    return result as T;
  }
  if (value instanceof Set) {
    const result = new Set();
    hash.set(value as object, result);
    value.forEach((v) => result.add(deepClone(v, hash)));
    return result as T;
  }
  if (value instanceof ArrayBuffer) return value.slice(0) as T;

  // 4. 普通对象/数组：保持原型链（class 实例不失真）
  const result: Record<PropertyKey, unknown> = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));
  hash.set(value as object, result);            // 关键：递归前先登记
  // Reflect.ownKeys 覆盖 string + Symbol 键（Object.keys 漏 Symbol）
  for (const key of Reflect.ownKeys(value)) {
    result[key] = deepClone((value as Record<PropertyKey, unknown>)[key], hash);
  }
  return result as T;
}
\`\`\`

要点解析：①WeakMap 而不是 Map——键是对象且弱引用，拷贝结束后缓存可被 GC，不会内存泄漏；②先 hash.set 再递归——遇到 { a: { self: a } } 这种结构时，递归回 self 时能命中缓存直接返回，否则栈溢出；③Object.create(Object.getPrototypeOf(value)) 保留原型链——class 实例拷贝后 instanceof 仍为 true，方法（在原型上）天然共享无需拷贝；④Reflect.ownKeys 而非 Object.keys——后者漏掉 Symbol 键和不可枚举键。

structuredClone 的现实定位：Chrome 98+/Safari 15.4+ 可用，原生 C++ 实现比 JS 递归快 5-10 倍，支持 Map/Set/Date/RegExp/ArrayBuffer/TypedArray 和循环引用。但它抛 DataCloneError 的场景：函数、DOM 节点、Proxy 对象、class 实例会丢原型（退化为普通对象！）。所以：纯数据用 structuredClone，含 class 实例的模型层还是得手写。

踩坑：①拷贝 Proxy 对象时读到的是代理后的值，可能触发意外的 getter 副作用；②getter/setter 会被"固化"成普通属性——拷贝后失去响应性（Vue2 的 defineProperty 响应式对象深拷贝后会失去响应，Vue3 的 Proxy 同理）；③共享引用变独立副本——{ x: shared, y: shared } 拷贝后 x !== y，如果业务依赖"同一引用"语义（如双向关联的图谱节点）会出 bug，需要拷贝后重建关联；④性能：10 万节点对象的深拷贝在主线程可能 100ms+，大对象考虑不可变数据结构（Immer）按需共享未变更部分，而不是全量拷贝。`,
    keyPoints: ["WeakMap 缓存治循环引用，先登记再递归", "Object.create(getPrototypeOf) 保原型链", "structuredClone 快但丢 class 原型、拒函数 DOM"],
    followUps: ["Immer 的结构共享（structural sharing）如何避免全量拷贝？", "如何深拷贝一个包含 DOM 引用的对象图？"],
    favorited: false,
  },
  {
    id: "fe-248",
    nodeId: "coding-utility",
    question: "手写 call、apply、bind。bind 返回的函数被 new 调用时 this 指向谁？",
    bigTech: true,
    answer: `结论：三者都是"显式绑定 this"。call/apply 立即调用（参数一个散一个数组），bind 返回绑定后的新函数。实现核心：把函数挂载为 context 的临时属性，通过"谁调用 this 就是谁"的隐式绑定规则借道执行，执行完删除属性。bind 被 new 调用时，new 绑定优先级最高，bind 绑定的 this 失效，this 指向新创建的实例。

在一个低代码平台的"表达式沙箱"里，我们需要让用户表达式在指定作用域对象上执行，用的就是 call 显式绑定；而 bind 的 new 场景出现在组件库的"偏函数 + 构造器复用"模式里：

\`\`\`ts
// call：thisArg + 散参，立即执行
Function.prototype.myCall = function (thisArg: unknown, ...args: unknown[]) {
  // 1. thisArg 为 null/undefined 时指向全局（非严格模式）——严格模式应保持 undefined
  const context = thisArg == null ? globalThis : Object(thisArg);
  // 2. Symbol 做临时键，防与 context 自有属性冲突
  const fnKey = Symbol("fn");
  context[fnKey] = this;          // this 就是调用 myCall 的函数
  const result = context[fnKey](...args); // 隐式绑定：context.fn() → this = context
  delete context[fnKey];          // 3. 清理现场
  return result;
};

// apply：参数是数组
Function.prototype.myApply = function (thisArg: unknown, argsArray: unknown[] = []) {
  const context = thisArg == null ? globalThis : Object(thisArg);
  const fnKey = Symbol("fn");
  context[fnKey] = this;
  const result = context[fnKey](...argsArray);
  delete context[fnKey];
  return result;
};

// bind：返回函数，支持柯里化预设参数，且要处理 new 场景
Function.prototype.myBind = function (thisArg: unknown, ...presetArgs: unknown[]) {
  if (typeof this !== "function") throw new TypeError("Bind must be called on a function");
  const originalFn = this;
  function boundFn(this: unknown, ...callArgs: unknown[]) {
    // 关键：new 调用时 this 是 boundFn 的实例，此时忽略 thisArg
    const isNew = this instanceof boundFn;
    return originalFn.apply(isNew ? this : thisArg, [...presetArgs, ...callArgs]);
  }
  // 维护原型链：new boundFn() 能访问 originalFn.prototype 上的方法
  boundFn.prototype = Object.create(originalFn.prototype);
  return boundFn;
};
\`\`\`

this 绑定优先级（从高到低）：①new 绑定（new fn()）→ ②显式绑定（call/apply/bind）→ ③隐式绑定（obj.fn()）→ ④默认绑定（独立调用，严格模式 undefined / 非严格全局）。验证：

\`\`\`js
function Foo(name) { this.name = name; }
const obj = {};
const BoundFoo = Foo.myBind(obj, "preset");
const inst = new BoundFoo("real");
console.log(inst.name);  // "real" —— new 赢了，this 不是 obj 是新实例
console.log(obj.name);   // undefined —— bind 的 thisArg 被 new 覆盖
\`\`\`

要点：①thisArg 是原始值要 Object(thisArg) 装箱——"abc".myCall 时 context 必须是对象；②Symbol 临时键防冲突——若 context 本来就有 fnKey 同名属性会被覆盖，Symbol 保证唯一；③bind 的原型链维护——漏了 boundFn.prototype = Object.create(originalFn.prototype)，new 出的实例就 instanceof 不了原函数（注意：这行用赋值会让两个 prototype 联动变更，原生 bind 用的是空函数中转，防互相污染）；④箭头函数没有自己的 this，call/apply/bind 对它无效——这是箭头函数"this 词法绑定"的定义，不是 bug。

踩坑：①非严格模式下 myCall(null) 指向 globalThis，严格模式下原生行为是保持 null/undefined，生产代码几乎都用严格模式，模拟实现与原生有细微差异；②bind 链——fn.bind(a).bind(b) 永远只有第一次的 a 生效（bind 不可覆盖）；③bind 后函数的 length 属性是 原length - 预设参数个数，柯里化判断参数个数时要小心；④性能敏感场景（每帧调用）避免频繁 bind 创建新函数，构造函数里 bind 一次缓存复用。`,
    keyPoints: ["临时属性借道隐式绑定，Symbol 防冲突", "this 优先级：new > 显式 > 隐式 > 默认", "bind 需维护原型链，bind 链只有首次生效"],
    followUps: ["为什么箭头函数无法被 bind 改变 this？", "实现一个软绑定 softBind：this 为 undefined 时才用默认对象"],
    favorited: false,
  },
  {
    id: "fe-249",
    nodeId: "coding-utility",
    question: "手写 new 操作符和 instanceof。new 的过程中发生了什么？instanceof 如何判断跨 iframe 的对象？",
    bigTech: true,
    answer: `结论：new 做四件事——①创建空对象、②空对象的 __proto__ 指向构造函数的 prototype、③以空对象为 this 执行构造函数、④构造函数返回对象则用之，否则返回空对象。instanceof 沿原型链向上找构造函数的 prototype。跨 iframe 的对象原型链不同（每个 realm 有自己的 Object.prototype），instanceof 会误判，应用 Object.prototype.toString 或结构化判断。

\`\`\`ts
// 手写 new：myNew(Constructor, ...args)
function myNew<T extends new (...args: unknown[]) => unknown>(
  Constructor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  // 1+2. 建对象并链接原型（Object.create 一步搞定）
  const obj = Object.create(Constructor.prototype);
  // 3. 以 obj 为 this 执行构造函数
  const result = Constructor.apply(obj, args);
  // 4. 构造函数显式返回对象则用它，否则用 obj（返回原始值被忽略）
  return (result !== null && (typeof result === "object" || typeof result === "function"))
    ? (result as InstanceType<T>)
    : (obj as InstanceType<T>);
}

// 手写 instanceof：右值 prototype 在左值原型链上即 true
function myInstanceof(left: unknown, right: new (...args: unknown[]) => unknown): boolean {
  if (typeof right !== "function") throw new TypeError("Right-hand side must be callable");
  let proto = Object.getPrototypeOf(left); // 取左值原型
  const target = right.prototype;
  while (proto !== null) {
    if (proto === target) return true;     // 链上命中
    proto = Object.getPrototypeOf(proto);  // 沿链向上
  }
  return false;                            // 查到 null 还没命中
}
\`\`\`

new 的细节决定面试深度：①构造函数返回原始值（return 1）被忽略，返回对象（return { x: 1 }）则替换新实例——这是"工厂函数伪装构造器"的技巧，也是 Vue2 的 this 不能被 return 覆盖的原因；②箭头函数不能 new——它没有 [[Construct]] 内部方法，也没有 prototype 属性；③Object.create(null) 的对象没有原型，myInstanceof(obj, Object) 为 false——做"纯净字典"防原型污染时有用，但别人 instanceof 判断会全部失效。

跨 realm 判定是真实痛点：在微前端 qiankun 项目中，主应用和子应用跑在不同 JS 全局环境里，子应用 new Array() 的结果在主应用 arr instanceof Array === false，导致主应用的"参数校验"误杀子应用传过来的数组。解决方案分层：

\`\`\`ts
// 1. Object.prototype.toString：读内部 [[Class]]，跨 realm 稳定
function isArrayLike(v: unknown): boolean {
  return Object.prototype.toString.call(v) === "[object Array]"; // 跨 iframe 也准
}
// 2. Array.isArray：ES5 起原生支持跨 realm
Array.isArray(iframeArr); // true，比 instanceof 可靠
// 3. Symbol.hasInstance：自定义 instanceof 行为（ES6）
class MyArray {
  static [Symbol.hasInstance](inst: unknown) {
    return Array.isArray(inst); // 让 instanceof 也走跨 realm 逻辑
  }
}
\`\`\`

要点：①instanceof 查的是"构造函数的 prototype 属性"，不是构造函数本身——改写了 Fn.prototype = {} 后，之前创建的实例 instanceof Fn 变 false；②基本类型 instanceof 永远 false——"a" instanceof String 是 false，因为左值是原始值没有原型链，Object.getPrototypeOf("a") 取到的是装箱后的 String.prototype（这步是规范行为）；③Symbol.hasInstance 是元编程钩子，可让"鸭子类型 instanceof"成为可能。

踩坑：①iframe 间通信用 postMessage 传的是结构化克隆后的副本，不存在跨 realm 引用问题，只有直接访问 iframe.contentWindow 的对象才会踩坑；②跨 realm 的 Promise 互相 await 没问题（thenable 鸭子检测），但 promise instanceof Promise 跨 realm false；③React DevTools 早期版本在微前端场景误判组件类型，就是 realm 问题；④Node 的 vm 模块、Worker 都是独立 realm，同理。`,
    keyPoints: ["new 四步：建对象/链原型/执行/返回值裁决", "instanceof 走原型链，改 prototype 会反转既有实例判定", "跨 realm 用 toString.call / Array.isArray 而非 instanceof"],
    followUps: ["Object.create(null) 对象的使用场景与代价？", "Symbol.hasInstance 如何被滥用导致 instanceof 语义混乱？"],
    favorited: false,
  },
  {
    id: "fe-250",
    nodeId: "coding-utility",
    question: "实现柯里化函数 curry，要求支持任意参数个数和占位符 _ 跳过参数。柯里化在真实项目里解决什么问题？",
    bigTech: true,
    answer: `结论：柯里化把 f(a, b, c) 变成 f(a)(b)(c)——收集参数直到凑齐原函数形参个数再执行。占位符 _ 允许"先传后面的参数"，本质是参数的重排等待。真实价值在于：参数复用（偏应用）、延迟执行（配置先行）、函数组合（pointfree 风格）。

在数据可视化项目中，我们有一个绘图函数 drawChart(type, config, data)，初始化阶段定了 type 和 config，运行期只有 data 在变——柯里化后 const drawLine = curry(drawChart)("line", lineConfig)，业务层只管 drawLine(data)，语义清晰且避免到处传重复配置：

\`\`\`ts
// 基础版：按形参个数（fn.length）判断凑齐
function curry<T extends (...args: unknown[]) => unknown>(fn: T) {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) {
      return fn.apply(this, args);       // 凑齐：执行
    }
    return function (this: unknown, ...rest: unknown[]) {
      return curried.apply(this, [...args, ...rest]); // 未凑齐：合并参数继续等
    };
  };
}

// 占位符版：curry._ 占位，允许"跳过某参数后补"
const _ = Symbol("placeholder");
function curryP<T extends (...args: unknown[]) => unknown>(fn: T) {
  // 判断 args 是否已"完整"：长度够 且 前 fn.length 位无占位符
  const isComplete = (args: unknown[]) =>
    args.length >= fn.length && !args.slice(0, fn.length).includes(_);

  // 合并：新参数尽量填充旧参数中的占位符空位
  const merge = (oldArgs: unknown[], newArgs: unknown[]) => {
    const result = [...oldArgs];
    const rest = [...newArgs];
    for (let i = 0; i < result.length && rest.length; i++) {
      if (result[i] === _) result[i] = rest.shift(); // 占位符被实参替换
    }
    return [...result, ...rest]; // 剩余实参追加
  };

  return function curried(...args: unknown[]): unknown {
    if (isComplete(args)) return fn.apply(this, args);
    return (this: unknown, ...rest: unknown[]) => curried.apply(this, merge(args, rest));
  };
}
curryP._ = _;

// 用法
const api = (method: string, url: string, body: unknown) => fetch(url, { method, body: JSON.stringify(body) });
const post = curryP(api)("POST");              // 固定 method
const postUser = curryP(api)("POST", "/user"); // 固定 method+url
const withMethod = curryP(api)(curryP._, "/log"); // method 留空后补
withMethod("PUT", { a: 1 }); // → api("PUT", "/log", { a: 1 })
\`\`\`

要点：①fn.length 是"声明的形参个数（不含默认值之后的）"——rest 参数和默认参数会让 length 失真，函数签名设计要注意；②递归返回的函数要透传 this——curried.apply(this, ...) 保留调用上下文，否则绑定丢失；③占位符合并算法是"填坑优先、追加其次"——Lodash 的 _.curry 就是这么干的；④柯里化与箭头函数——箭头函数没有自己的 this，curry 后 this 语义更可控，函数式库里几乎全用箭头函数。

真实价值场景：①事件处理参数复用——const handleClick = curry(logEvent)("click")，列表里 100 个按钮共享前缀；②中间件签名统一——Redux 的 middleware 是 store => next => action => ... 三层柯里化，让 store 在 applyMiddleware 时注入一次，运行时只过 action；③与组合函数配合——compose(map(f), filter(g)) 要求每个函数单参，柯里化是把多参函数塞进管道的适配器；④类型体操——TypeScript 下柯里化函数的类型推导（Curried<T>）是高级技巧，能精确推导每一步的剩余参数。

踩坑：①过度柯里化让调用栈变深、调试栈帧爆炸——Chrome DevTools 里看到十几层匿名函数很难追；②fn.length 失真：function f(a, b = 1, ...c) 的 length 是 1，curry(f)(1) 就直接执行了，b/c 永远收不到；③占位符版本无法用普通值当占位符（万一业务真传 undefined 呢）——必须用 Symbol 保证唯一；④柯里化函数无法被 .bind 二次绑定后还保持参数收集语义，this 绑定和参数收集是两层独立逻辑，别混用。`,
    keyPoints: ["收集参数至 fn.length 再执行，未齐则返回等待函数", "占位符 = Symbol，合并时填坑优先", "价值：参数复用/延迟执行/函数组合适配"],
    followUps: ["Redux middleware 三层柯里化各注入了什么？", "TypeScript 如何推导柯里化函数的剩余参数类型？"],
    favorited: false,
  },
  {
    id: "fe-251",
    nodeId: "coding-utility",
    question: "手写 EventEmitter（on/off/once/emit）。如何防止内存泄漏？为什么 Node 的 EventEmitter 默认限制 10 个监听器？",
    bigTech: true,
    answer: `结论：EventEmitter 是发布订阅的最小实现——用 Map<事件名, 监听器数组> 存订阅关系，emit 时按序同步执行。内存泄漏的根因是"订阅了但没人退订"——监听器闭包持有外部对象，事件中心不释放，外部对象就无法 GC。Node 默认限 10 个是"可能的泄漏预警"（不是硬限制），因为一个事件挂几十上百个监听器，大概率是忘了 off。

在跨组件通信总线（micro-frontend 下主子应用通信）中，我们实现过生产级 EventEmitter：

\`\`\`ts
type Listener = (...args: unknown[]) => void;
interface WrappedListener extends Listener { __original?: Listener } // once 包装溯源

class EventEmitter {
  private events = new Map<string, WrappedListener[]>();

  on(event: string, listener: Listener): this {
    const list = this.events.get(event) ?? [];
    list.push(listener);
    this.events.set(event, list);
    return this; // 链式调用
  }

  once(event: string, listener: Listener): this {
    // 包装：执行一次后自动 off
    const wrapper: WrappedListener = (...args) => {
      this.off(event, wrapper);      // 先退订再执行，防重入
      listener.apply(this, args);
    };
    wrapper.__original = listener;   // 记录原函数：off(event, 原函数) 也能退掉 once 注册的
    return this.on(event, wrapper);
  }

  off(event: string, listener?: Listener): this {
    if (!listener) { this.events.delete(event); return this; } // 不传则清空该事件
    const list = this.events.get(event);
    if (!list) return this;
    // 同时匹配原函数与 once 包装（__original 溯源）
    const next = list.filter((l) => l !== listener && l.__original !== listener);
    if (next.length) this.events.set(event, next);
    else this.events.delete(event);  // 空数组也要清，防 Map 无限增长
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this.events.get(event);
    if (!list?.length) return false;
    // 切片复制再遍历：防监听器内 off 自己导致数组被原地修改、跳过后续监听器
    for (const listener of [...list]) {
      listener.apply(this, args);
    }
    return true;
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.length ?? 0;
  }

  removeAll(): void { this.events.clear(); }
}
\`\`\`

关键实现决策：①emit 前 [...list] 切片——这是最容易被挂的点：监听器 A 里 off 了监听器 B，原地遍历时 B 已被 splice 掉，索引错位导致 C 被跳过。复制数组遍历，"本次 emit 的监听器快照"语义清晰；②once 的 wrapper 要先 off 再执行——监听器内同步 emit 同一事件（重入），若先执行后 off，wrapper 会被执行第二次；③__original 溯源——否则 once 注册的函数永远 off 不掉（你手里只有原函数引用，没有 wrapper）；④off 后清理空数组——高频 on/off 场景下 Map 的 key 无限膨胀也是泄漏。

内存泄漏防治体系：①组件级自动退订——React 里 useEffect(() => { bus.on(x, fn); return () => bus.off(x, fn); }, [])，cleanup 是强约束；②WeakRef 版监听器（实验）——监听器持有对象用 WeakRef，对象死了监听器自动失效，但回调时机不确定，生产慎用；③maxListeners 预警——Node 的 setMaxListeners(10) 是默认值，超过打警告 (MaxListenersExceededWarning)，定位"循环里重复 on"的低级错误；④命名空间事件——"user:login"、"user:logout" 前缀分组，便于按命名空间批量清理。

为什么 Node 默认 10 个：经验值——一个事件正常消费方就 1-3 个（日志、指标、业务），10 个以上通常意味着在循环/渲染里误注册。可调 emitter.setMaxListeners(0)（关闭限制），但正确姿势是怀疑代码而非调大阈值。我们线上出过一次事故：WebSocket 断线重连逻辑里每次重连都 on("message")，运行三天后单事件挂了 2000+ 监听器，每条消息触发 2000 次回调，CPU 直接打满。

踩坑：①同步执行模型——EventEmitter 的 emit 是同步的，监听器抛错会中断后续监听器并向上传播（Node 里 uncaughtException 直接挂进程），生产环境 emit 体要 try/catch 或监听器自治；②与 Promise 混用——once(event) 改成 Promise 风格 await once(emitter, "done") 时，事件先于监听触发会永久挂起，需要"已发生事件缓存"（replay 语义）；③EventTarget（DOM 标准）与 EventEmitter  API 不同（addEventListener/removeEventListener），浏览器新代码可优先 EventTarget，天然支持 signal 自动退订。`,
    keyPoints: ["emit 切片遍历防原地修改跳监听", "once 先 off 再执行 + __original 溯源", "泄漏根因 = 订阅无退订，10 监听上限是预警"],
    followUps: ["如何实现带 replay 语义的事件总线（新订阅者立即收到上次值）？", "AbortSignal 如何让 addEventListener 批量退订更优雅？"],
    favorited: false,
  },
  {
    id: "fe-252",
    nodeId: "coding-utility",
    question: "手写寄生组合继承，并说明它为什么是 ES5 时代最优继承方案。class extends 与它是什么关系？",
    bigTech: true,
    answer: `结论：继承要解决两件事——实例属性的独立（构造函数借调）+ 方法共享（原型链链接）。寄生组合继承用"借调父构造函数 + Object.create 链原型"，避开了组合继承"父构造函数被调两次"的浪费，是 ES5 最优解。class extends 是它的语法糖，Babel 转译后核心逻辑就是寄生组合继承。

先看不优的方案：①原型链继承 Child.prototype = new Parent()——父类引用类型属性被所有子实例共享，改一个全改；②构造函数继承 Parent.call(this)——方法在每个实例上重复创建，无法复用；③组合继承（前两个加起来）——属性独立了、方法共享了，但 Parent() 被调用两次：一次 call(this)、一次 new 挂原型，实例上属性覆盖了原型上的同名属性，纯属浪费。

寄生组合继承的"寄生"之处：不 new Parent()，而是 Object.create(Parent.prototype) 凭空造一个"只有原型链接、没有实例属性"的替身：

\`\`\`js
function Parent(name) {
  this.name = name;
  this.colors = ["red"];
}
Parent.prototype.sayName = function () { return this.name; };

function Child(name, age) {
  Parent.call(this, name); // 第二次调用（借调）——实例属性独立
  this.age = age;
}
// 关键三步：替代 Child.prototype = new Parent()
Child.prototype = Object.create(Parent.prototype); // 原型链接，不调 Parent
Child.prototype.constructor = Child;               // 修复 constructor 指回自己
// Object.create 的对象 constructor 默认继承自原型链上的 Parent，必须修正

const a = new Child("a", 1);
const b = new Child("b", 2);
a.colors.push("blue");
console.log(b.colors);           // ["red"] —— 引用属性不共享 ✓
console.log(a.sayName());        // "a" —— 原型方法共享 ✓
console.log(a.constructor);      // Child —— constructor 正确 ✓
\`\`\`

为什么最优：Parent 只被调一次（call 那次），原型上干干净净没有多余实例属性；instanceof、isPrototypeOf 全部正常工作；ES6 之前这就是事实标准（YUI、Dojo 都这么做）。

class extends 的关系——Babel 转译的核心就是这个模式 + 几条强化规则：

\`\`\`js
// class Child extends Parent {} 转译后（简化）
function _inherits(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
  Object.setPrototypeOf(Child, Parent); // 静态属性的继承！寄生组合继承漏了这条
}
\`\`\`

class 相对手写方案的增强：①静态属性继承——Object.setPrototypeOf(Child, Parent) 让 Child.staticMethod 能访问 Parent.staticMethod，寄生组合继承只管实例链；②super 语义——super.method() 通过 [[HomeObject]] 内部槽定位父类方法，手写方案只能 Parent.prototype.method.call(this) 笨拙模拟；③new.target 检查——class 不用 new 调用直接抛错，手写函数靠 instanceof 判断兜底；④原生 class 不能被 .call 借用——Parent.call(this) 对 class Parent 会抛 TypeError（class constructor cannot be invoked without 'new'），混合新旧代码时的真实坑：父类是 class、子类想 ES5 风格继承，无解，必须统一用 class。

踩坑：①constructor 修正时机——Child.prototype = Object.create(...) 是整体替换，之后补的 constructor 别忘了设 writable/enumerable 语义（默认赋值是可枚举的，原生 constructor 不可枚举，for-in 遍历会暴露，用 Object.defineProperty 补精确语义）；②继承内置类型（Array/Error）在 ES5 下有坑——new ChildArray() 的 length 行为异常，因为内置构造器有内部槽，class extends Array 也要配合 Symbol.species 才完备；③方法复写时调父类同名方法要 Parent.prototype.method.call(this)，忘了 .call(this) 会导致父方法里 this 指向原型对象，改的是共享状态；④多重继承 ES 不支持——Mixin 模式（Object.assign(Child.prototype, mixinA, mixinB)）是组合式替代，比继承更灵活。`,
    keyPoints: ["借调构造函数 + Object.create 链原型，父构造只调一次", "别忘了修 constructor，且注意可枚举性", "class extends = 语法糖 + 静态继承 + super 语义 + new 检查"],
    followUps: ["super 的 [[HomeObject]] 机制为什么让对象字面量方法也能用 super？", "Mixin 模式如何处理同名方法冲突？"],
    favorited: false,
  },
  {
    id: "fe-253",
    nodeId: "coding-utility",
    question: "手写 LRU 缓存，要求 get/put 都是 O(1)。为什么用 Map 而不是 {}？LRU 在前端有哪些真实应用？",
    bigTech: true,
    answer: `结论：LRU（最近最少使用）淘汰最久未访问的条目。O(1) 的关键是"哈希表 + 双向链表"：哈希表 O(1) 定位，双向链表 O(1) 移动/删除节点。JS 里 Map 天然是有序哈希表（插入序），迭代时第一个就是最久未用、最后一个是最新——用 Map 的"删除再重插"即可模拟双向链表行为，比手写链表简洁且不易错。

\`\`\`ts
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // 访问后移到最新：删除重插，Map 迭代序即"新旧序"
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key); // 已存在：先删，确保重插到最新
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      // 淘汰最久未用：Map 第一个 key（迭代序最老）
      const oldestKey = this.cache.keys().next().value as K;
      this.cache.delete(oldestKey);
    }
  }
}
\`\`\`

为什么用 Map 而不是 {}：①键类型——{} 的键被强制 toString（数字 1 和 "1" 冲突，对象键变 "[object Object]"），Map 支持任意类型键（对象、函数、NaN）；②顺序保证——Map 严格按插入序迭代（ES2015 规范），普通对象的整数键会按数值升序排在前面，迭代序不可靠；③性能——V8 对 Map 的频繁增删有专门优化，{} 频繁 delete 会从"字典模式"降级（hidden class 失效），性能劣化；④size O(1)——{} 要数成员得 Object.keys().length 是 O(n)。

前端真实应用（不是背八股）：①组件级数据缓存——我们中台项目的列表页"前进后退不重新请求"：路由参数做 key、响应数据做 value，capacity=20，返回历史页秒开且不会无限吃内存；②计算结果缓存（memoize）——大数据表格的"行高度计算"函数包一层 LRU，相同行数据直接命中缓存，万行表格滚动白屏率降 80%；③图片/资源缓存——canvas 编辑器的缩略图缓存，LRU 自动淘汰最早缩略图，防 Blob 对象撑爆内存；④API 去重 + 短缓存——搜索联想接口 1 秒内相同 query 直接返回缓存，capacity=50。

与 WeakMap 的分工：WeakMap 键弱引用、不可迭代，做不了 LRU（无法找"最老"键），它适合"对象附属数据"存储（对象死数据随之死）；LRU 要主动管理生命周期，Map 才是正解。

进阶追问：①容量语义——按"条目数"还是按"字节数"？大 value（图片 Blob）场景按条目数会撑爆内存，需要在 put 时累加 size、超限淘汰（size-based LRU）；②并发 get 同一 key——缓存未命中时 10 个并发请求同时回源（缓存击穿），要用 in-flight Promise 去重（同一个 key 的 pending Promise 复用）；③淘汰回调——淘汰的条目若是占用资源的对象（WebGL 纹理、Worker），需要 onEvict 钩子释放资源，光 delete 不够；④TTL 语义——LRU 只管"新旧"不管"过期"，数据缓存常要 LRU + TTL 双保险，条目存 { value, expireAt }，get 时先判过期。`,
    keyPoints: ["Map 迭代序即新旧序，删除重插模拟链表", "Map 胜在任意键/顺序保证/删除性能", "生产要加击穿去重、淘汰回调、TTL"],
    followUps: ["LRU-K 与 2Q 如何改进热点突发流量下的命中率？", "如何给 LRU 加 TTL 且过期清理不遍历全表？"],
    favorited: false,
  },
  // ===== 36. coding-async 手写题：异步与并发控制 =====
  {
    id: "fe-254",
    nodeId: "coding-async",
    question: "手写一个符合 Promise/A+ 规范的 Promise。then 的链式调用、值穿透、resolvePromise 循环引用检测分别怎么实现？",
    bigTech: true,
    answer: `结论：Promise 本质是"状态机 + 回调队列"——pending/fulfilled/rejected 三态不可逆迁移，then 注册回调并按当前状态决定"立即执行"还是"入队等待"，且 then 必须返回新 Promise 实现链式。链式的核心是 resolvePromise 决议程序：用前一个 then 回调的返回值决议下一个 Promise。

这是理解 async/await、微任务、框架响应式的地基。实现（含关键注释）：

\`\`\`ts
const PENDING = "pending", FULFILLED = "fulfilled", REJECTED = "rejected";

class MyPromise<T> {
  private state = PENDING;
  private value: unknown;
  private reason: unknown;
  private onFulfilledCallbacks: Array<() => void> = [];
  private onRejectedCallbacks: Array<() => void> = [];

  constructor(executor: (resolve: (v: unknown) => void, reject: (r: unknown) => void) => void) {
    const resolve = (value: unknown) => {
      if (this.state !== PENDING) return;          // 状态不可逆：已决后忽略
      this.state = FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach((fn) => fn()); // 发布
    };
    const reject = (reason: unknown) => {
      if (this.state !== PENDING) return;
      this.state = REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((fn) => fn());
    };
    try { executor(resolve, reject); }
    catch (e) { reject(e); }                        // executor 抛错即 reject
  }

  then(onFulfilled?: (v: unknown) => unknown, onRejected?: (r: unknown) => unknown): MyPromise<unknown> {
    // 值穿透：回调非函数则透传原值/原错 —— p.then().then(v => v) 拿到原值
    const fulfilledFn = typeof onFulfilled === "function" ? onFulfilled : (v: unknown) => v;
    const rejectedFn = typeof onRejected === "function"
      ? onRejected
      : (r: unknown) => { throw r; };              // 错误穿透：抛给下游 catch

    // then 必须返回新 Promise —— 链式的根基
    const next = new MyPromise<unknown>((resolve, reject) => {
      const runFulfilled = () => {
        queueMicrotask(() => {                     // 规范要求回调异步执行（微任务）
          try {
            const x = fulfilledFn(this.value);
            resolvePromise(next, x, resolve, reject); // 决议程序接管
          } catch (e) { reject(e); }               // 回调抛错 → 新 Promise reject
        });
      };
      const runRejected = () => {
        queueMicrotask(() => {
          try {
            const x = rejectedFn(this.reason);
            resolvePromise(next, x, resolve, reject);
          } catch (e) { reject(e); }
        });
      };
      if (this.state === FULFILLED) runFulfilled();       // 已决：立即调度
      else if (this.state === REJECTED) runRejected();
      else {                                               // 未决：入队等发布
        this.onFulfilledCallbacks.push(runFulfilled);
        this.onRejectedCallbacks.push(runRejected);
      }
    });
    return next;
  }
}

// resolvePromise 决议程序：链式调用的核心
function resolvePromise(next: MyPromise<unknown>, x: unknown, resolve: (v: unknown) => void, reject: (r: unknown) => void) {
  if (next === x) {                                  // 循环引用检测
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  if (x instanceof MyPromise) {                      // 返回 Promise：等待其决议
    x.then(resolve, reject);
    return;
  }
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    let called = false;                              // thenable 多次调用只取第一次
    try {
      const then = (x as { then?: unknown }).then;   // 鸭子检测 thenable
      if (typeof then === "function") {
        then.call(
          x,
          (y: unknown) => { if (!called) { called = true; resolvePromise(next, y, resolve, reject); } },
          (r: unknown) => { if (!called) { called = true; reject(r); } },
        );
        return;
      }
    } catch (e) { if (!called) { called = true; reject(e); } return; }
  }
  resolve(x);                                        // 普通值：直接决议
}
\`\`\`

三大考点拆解：①链式——then 返回新 Promise（next），回调返回值 x 经 resolvePromise 决议后成为 next 的结果。回调返回 Promise 时，next 会"等待"它——这就是 await 链能拍平嵌套的原因；②值穿透——then() 不传回调时，默认函数原样透传 value/throw reason，所以 p.then().then(v => console.log(v)) 仍能拿到值，catch 能跳过中间所有无 onRejected 的 then 直到最近一个 catch；③循环引用——const p2 = p1.then(() => p2) 中，回调返回值就是 then 返回的 next 本身，决议时 next === x 必须抛 TypeError，否则死循环。

微任务选择：规范只要求"异步执行"，浏览器原生用微任务。我们用 queueMicrotask 保真；若用 setTimeout 会变成宏任务，then 回调与原生 Promise 混用时执行顺序错乱（await 后面的代码跑到你的回调前面），测试环境断言会诡异失败。

踩坑：①executor 里 resolve(Promise) 时新 Promise 状态跟随该 Promise——我们的 resolve 没有递归解 thenable（规范 2.3.2 要求 resolve 也走决议程序，上面的实现为了突出 then 的路径做了简化，面试要主动说出这点）；②called 锁——恶意 thenable（then: (res) => { res(1); res(2); }）多次调 resolve 必须只生效第一次；③取 x.then 本身可能抛错（getter 副作用），要包在 try 里；④回调里访问 this.value 的时机——已决时立即调度微任务，但 this.value 读取被闭包延迟到微任务执行时，语义正确。`,
    keyPoints: ["状态机 + 回调队列，then 返回新 Promise", "resolvePromise：循环检测/thenable 鸭子检测/called 锁", "值穿透：默认 onFulfilled 透传、onRejected 抛出"],
    followUps: ["为什么 Promise 回调必须是微任务而非宏任务？（Zone.js 与宿主环境一致性）", "实现 Promise.prototype.finally 与 catch 的差异点在哪？"],
    favorited: false,
  },
  {
    id: "fe-255",
    nodeId: "coding-async",
    question: "手写 Promise.all / race / allSettled / any，说明四者的语义差异与真实使用场景。",
    bigTech: true,
    answer: `结论：四个组合器的差异在"完成条件与失败策略"——all 全成功才成功、一败全败；race 第一个 settle 的定胜负；allSettled 等全部 settle 永不 reject；any 第一个成功的赢、全败才报 AggregateError。计数器 + 保序写入是 all/allSettled 的实现核心。

\`\`\`ts
// all：全部 fulfilled → 按入序返回结果数组；任一 rejected → 立即 reject
function myAll<T>(promises: Iterable<Promise<T> | T>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const list = [...promises];
    if (list.length === 0) return resolve([]);        // 空数组边界：同步 resolve
    const results = new Array(list.length);
    let done = 0;
    list.forEach((p, i) => {
      Promise.resolve(p).then(                        // 包一层：兼容非 Promise 值
        (value) => {
          results[i] = value;                         // 保序：写入原索引，不用 push
          if (++done === list.length) resolve(results); // 计数器判定全部完成
        },
        reject,                                       // 一败即整体 reject（快速失败）
      );
    });
  });
}

// race：第一个 settle（无论成败）即定结果
function myRace<T>(promises: Iterable<Promise<T> | T>): Promise<T> {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);      // 谁的 then 先触发谁赢，天然竞态
    }
  });
}

// allSettled：等全部 settle，返回带 status 的结果描述
function myAllSettled<T>(promises: Iterable<Promise<T> | T>) {
  return new Promise((resolve) => {
    const list = [...promises];
    if (list.length === 0) return resolve([]);
    const results = new Array(list.length);
    let done = 0;
    list.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => { results[i] = { status: "fulfilled", value }; if (++done === list.length) resolve(results); },
        (reason) => { results[i] = { status: "rejected", reason }; if (++done === list.length) resolve(results); },
      );
    });
  });
}

// any：第一个 fulfilled 赢；全 rejected → AggregateError 汇总所有错误
function myAny<T>(promises: Iterable<Promise<T> | T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const list = [...promises];
    if (list.length === 0) return reject(new AggregateError([], "All promises were rejected"));
    const errors = new Array(list.length);
    let rejectedCount = 0;
    list.forEach((p, i) => {
      Promise.resolve(p).then(
        resolve,                                      // 一成即赢
        (reason) => {
          errors[i] = reason;
          if (++rejectedCount === list.length) reject(new AggregateError(errors, "All promises were rejected"));
        },
      );
    });
  });
}
\`\`\`

真实场景对号入座（来自生产项目）：①all——仪表盘首屏并行拉 5 个接口，任一失败则整屏降级到错误页（数据强一致性要求，缺一角的图表宁可不显示）；②race——接口超时控制：Promise.race([request, timeout(3000)])，3 秒没回来判超时（注意：原请求还在跑，配合 AbortController 真正取消才不浪费）；③allSettled——批量消息推送/批量操作结果面板：100 条里 97 成功 3 失败，要把 3 条失败原因列出来给用户重试，不能用 all 一败全丢；④any——多 CDN 容灾：同时向 3 个 CDN 域名请求同一资源，最快的成功就用，全部失败才报错（图片/字体等幂等资源的兜底策略）。

实现要点：①保序——结果数组按下标写入而非 push，因为完成顺序 ≠ 入参顺序；②Promise.resolve(p) 包一层——规范允许入参混合 Promise 与普通值；③空数组边界——all/allSettled 空入参同步 resolve([])，any 空入参 reject AggregateError，race 空入参永远 pending（规范行为，面试答出加分）；④快速失败语义——all 的 reject 是"立即"的，但已发出的请求不会取消，只是结果被忽略（Promise 无取消语义）。

踩坑：①all 的快速失败 ≠ 取消——5 个请求第 2 个失败，all 立即 reject，但剩 3 个还在跑，如果它们带着副作用（写库）会"无人认领地成功"，需要 AbortController 联动取消；②race 的泄漏——race([slowRequest, timeout]) 超时后 slowRequest 仍持有连接和回调，长轮询场景反复 race 会累积未决 Promise；③any 的 AggregateError 兼容性——ES2021 才有，老环境要手动构造 Error 并挂 errors 数组；④计数器并发安全——JS 单线程所以 ++done 是安全的，但同样的模式搬到 Worker 共享内存场景就要 Atomics。`,
    keyPoints: ["all 快速失败 / race 首个 settle / allSettled 永不败 / any 全败才败", "保序按下标写、入参包 Promise.resolve", "快速失败不取消请求，需 AbortController 联动"],
    followUps: ["Promise.all 失败时如何拿到已成功部分的结果？", "race 超时方案中如何真正中止被超时的请求？"],
    favorited: false,
  },
  {
    id: "fe-256",
    nodeId: "coding-async",
    question: "实现一个并发限制调度器 Scheduler：add(promiseCreator) 提交任务，最多同时运行 max 个。真实项目中哪里用到？",
    bigTech: true,
    answer: `结论：并发限制是"信号量"思想——维护运行计数与等待队列，任务完成时释放名额并唤醒队首。浏览器对同域名只有 6 个 TCP 连接，业务层不做并发控制，几十个请求同时发出去只会排队甚至互相拖垮。

\`\`\`ts
class Scheduler {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly max: number) {}

  /** 提交任务工厂（注意：传的是函数而非已创建的 Promise，避免任务提前启动） */
  add<T>(promiseCreator: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = () => {
        this.running++;
        promiseCreator()
          .then(resolve, reject)          // 结果透传给 add 的调用方
          .finally(() => {
            this.running--;
            this.next();                  // 释放名额，唤醒下一个
          });
      };
      if (this.running < this.max) task(); // 有空位：立即跑
      else this.queue.push(task);          // 满员：排队
    });
  }

  private next() {
    const task = this.queue.shift();
    if (task) task();
  }

  /** 运行中 + 等待中的任务数（监控用） */
  get pending(): number { return this.running + this.queue.length; }
}

// 用法：图片上传，一次最多 3 个
const scheduler = new Scheduler(3);
const uploadTasks = files.map((file) =>
  scheduler.add(() => uploadFile(file).then((url) => ({ file, url })))
);
const results = await Promise.allSettled(uploadTasks);
\`\`\`

实现要点：①传 promiseCreator 函数而非 Promise——Promise 创建即执行，直接传 Promise 的话 10 个任务早就全发出去了，调度器形同虚设。这是最经典的设计点，p-limit 库也是这个 API 形态；②.finally 里释放名额——成功失败都要释放，漏掉则队列永久卡死（曾经线上事故：只用 .then 释放，一个 500 错误后整个上传队列停摆）；③next() 同步唤醒——任务完成同步拉起队首，名额无缝衔接；④add 返回 Promise 给调用方——调度透明，调用方照常 await，还能配合 Promise.allSettled 汇总。

真实应用场景：①批量上传/下载——100 张图片上传限 4 并发，防浏览器连接打满导致页面其他请求（心跳、埋点）饿死；②爬虫/数据同步——后台管理系统同步 5000 条商品数据到第三方平台，对方限流 10 QPS，客户端先自我约束避免被 ban；③接口防雪崩——活动页初始化要拉 20 个配置接口，限 5 并发 + 优先级（首屏必需的插到队首）；④Node 侧更普遍——文件遍历、数据库批量写入、调 LLM API（严格 RPM 限制）。

进阶增强（面试加分）：①优先级队列——queue 改成堆结构，add 支持 priority 参数，高优先级插队（首屏关键请求 > 埋点上报）；②动态调整 max——网络从 Wi-Fi 掉到 4G 时把 max 从 6 降到 2（NetInfo API 感知）；③超时与取消——任务包装 AbortController，支持 scheduler.abort(taskId) 取消排队中/运行中的任务；④指数退避重试——任务失败自动重试 N 次再放回队列尾部，配合 jitter 防同步重试风暴；⑤全局单例 vs 按域隔离——API 调度器和上传调度器分开实例，互不占名额。

踩坑：①promiseCreator 同步抛错——promiseCreator() 本身（不是返回的 Promise）可能同步抛，要 try/catch 转成 reject 并释放名额；②内存——queue 无限增长（生产速度 > 消费速度），要有上限保护或背压（backpressure）策略；③与浏览器自带队列的关系——限 6 并发但浏览器同域连接也只有 6，如果页面还有其他请求，业务并发数要预留余量；④测试——调度器含异步时序，单测要用假定时器 + 可控 Promise 精确驱动，断言"同一时刻最多 max 个 running"。`,
    keyPoints: ["信号量：运行计数 + 等待队列，finally 释放名额", "传工厂函数不传 Promise，否则任务已提前启动", "生产增强：优先级/动态并发/取消/重试"],
    followUps: ["如何实现带优先级的并发调度（堆结构）？", "背压（backpressure）在前端流式处理中如何落地？"],
    favorited: false,
  },
  {
    id: "fe-257",
    nodeId: "coding-async",
    question: "实现带指数退避和随机抖动的请求重试函数 retry(fn, options)，要求支持超时控制与错误类型过滤。",
    bigTech: true,
    answer: `结论：重试是分布式系统的必修课，但无脑立即重试会加剧服务端雪崩。正确姿势：指数退避（间隔 = base * 2^n）拉开发送间隔，随机抖动（jitter）打散并发重试的同步效应，错误过滤（网络错误/5xx 才重试，4xx 业务错误重试无意义），单请求超时（AbortController）防悬挂。

\`\`\`ts
interface RetryOptions {
  retries?: number;          // 最大重试次数（不含首次）
  baseDelay?: number;        // 基础间隔 ms
  maxDelay?: number;         // 间隔上限
  timeout?: number;          // 单次尝试超时 ms
  shouldRetry?: (err: unknown) => boolean; // 错误过滤器
  onRetry?: (err: unknown, attempt: number) => void; // 重试钩子（埋点/日志）
}

async function retry<T>(fn: (signal: AbortSignal) => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    baseDelay = 500,
    maxDelay = 10_000,
    timeout = 5_000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout); // 单次超时
    try {
      return await fn(controller.signal);          // 成功直接返回
    } catch (err) {
      lastError = err;
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      // 不重试的情形：最后一次 / 错误过滤器否决
      if (attempt === retries || (!isAbort && !shouldRetry(err))) throw err;
      onRetry?.(err, attempt + 1);
      // 指数退避 + Full Jitter（AWS 推荐：在 [0, 上限] 均匀随机，彻底打散同步重试）
      const backoff = Math.min(baseDelay * 2 ** attempt, maxDelay);
      const wait = Math.random() * backoff;
      await new Promise((r) => setTimeout(r, wait));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

// 默认过滤：仅网络错误与 5xx 值得重试；4xx（参数/权限错）重试也是白试
function defaultShouldRetry(err: unknown): boolean {
  if (err instanceof TypeError) return true;              // fetch 网络层失败（断网/DNS/CORS）
  if (err instanceof HttpError) return err.status >= 500; // 服务端错误
  return false;
}
\`\`\`

为什么必须有抖动：服务端宕机恢复的瞬间，几千个客户端如果都按 1s/2s/4s 整齐重试，会形成"重试风暴"再次打垮服务（thundering herd）。Full Jitter 把重试时刻均匀打散到 [0, backoff] 区间，服务端压力曲线平滑。AWS 架构博客实测：同样重试预算下，Full Jitter 的完成时间分布显著优于无抖动退避。

真实项目案例：电商大促的库存接口，高峰期偶发 502。上重试策略后成功率从 99.2% 提到 99.97%，但最初没加抖动和错误过滤，一次后端发版事故中，前端把 400（参数错误，发版导致协议不匹配）也重试了 3 次，错误监控告警量翻 4 倍、后端错误日志爆炸——加上 shouldRetry 后只对 5xx/网络错重试才解决。

要点：①fn 接收 signal——重试函数必须把 AbortSignal 传给内部 fetch，否则超时只是"忽略结果"而非"取消请求"，悬挂请求照样占连接；②AbortError 的特殊地位——超时的请求算不算可重试？通常是（超时=服务慢，再试可能成功），上面实现里 isAbort 跳过过滤器直接重试，这是产品决策点，面试要讲出"为什么"；③退避上限——maxDelay 防 2^n 爆炸到分钟级；④onRetry 钩子——重试行为必须可观测（多少次重试、最终成功率），否则线上问题被重试掩盖，SLA 数据失真。

踩坑：①幂等性——只有幂等请求（GET/PUT/DELETE）能安全重试，POST 下单接口重试可能重复下单，必须配合幂等键（Idempotency-Key 头，服务端去重）；②重试与用户等待——首屏接口重试 3 次最长等 15s，用户早流失了，首屏要快败 + 友好降级，后台同步任务才适合激进重试；③定时器泄漏——fn 成功/失败后 clearTimeout，finally 里清，漏了则定时器持有 controller 引用延迟 GC；④与熔断配合——重试是"个体乐观"，熔断是"全局悲观"，错误率超阈值后熔断器直接拒发（不再重试），给服务端喘息，两者是互补的两层。`,
    keyPoints: ["指数退避 + Full Jitter 打散重试风暴", "shouldRetry 过滤：网络错/5xx 才重，4xx 白重", "AbortController 真取消；非幂等请求配幂等键"],
    followUps: ["熔断器（Circuit Breaker）三态如何与重试配合？", "Idempotency-Key 在服务端如何实现去重？"],
    favorited: false,
  },
  {
    id: "fe-258",
    nodeId: "coding-async",
    question: "经典题：用 JS 实现红绿灯循环——红灯 3 秒、绿灯 2 秒、黄灯 1 秒，无限循环切换。给出 Promise 链与 async 两种实现，并说明可取消性。",
    bigTech: true,
    answer: `结论：红绿灯题考察的是"异步串行编排"能力——把定时器 Promise 化后串起来。Promise 链版用递归生成无限链，async 版用 while(true) + await，后者可读性碾压前者。生产价值不在灯本身，而在"定时状态机"这个模式：轮播图、轮询任务、引导动画都是它。

\`\`\`ts
// 定时器 Promise 化：一切的基础
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ===== 方案 1：Promise 链递归 =====
function trafficLight(): void {
  const red = () => { console.log("红"); return sleep(3000); };
  const green = () => { console.log("绿"); return sleep(2000); };
  const yellow = () => { console.log("黄"); return sleep(1000); };
  const cycle = (): Promise<void> =>
    red().then(green).then(yellow).then(cycle); // 递归续链，无限循环
  cycle();
}

// ===== 方案 2：async/await（推荐） =====
async function trafficLightAsync(): Promise<void> {
  const steps: Array<[string, number]> = [["红", 3000], ["绿", 2000], ["黄", 1000]];
  let i = 0;
  while (true) {
    const [color, duration] = steps[i % steps.length];
    console.log(color);
    await sleep(duration);
    i++;
  }
}

// ===== 方案 3：可取消版（生产形态） =====
async function trafficLightCancellable(signal: AbortSignal): Promise<void> {
  const cancellableSleep = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);                    // 清定时器，reject 中止循环
        reject(new DOMException("Aborted", "AbortError"));
      }, { once: true });
    });

  const steps: Array<[string, number]> = [["红", 3000], ["绿", 2000], ["黄", 1000]];
  let i = 0;
  try {
    while (!signal.aborted) {
      const [color, duration] = steps[i % steps.length];
      console.log(color);
      await cancellableSleep(duration);         // abort 时这里抛 AbortError
      i++;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return; // 正常取消
    throw e;
  }
}

// 使用：组件卸载时取消
const controller = new AbortController();
trafficLightCancellable(controller.signal);
controller.abort(); // 立即停止，无残留定时器
\`\`\`

三种方案的工程对比：①Promise 链递归——while 题的标准答案，但语义藏在递归里，维护者要绕一圈才看懂；且无法优雅取消（链条一旦生成只能等当前环节走完）；②async 版——线性的代码表达异步的流程，是 async/await 存在意义的最好例证；状态表 steps 数据驱动，加"黄闪 3 次"这种需求只改数据不改结构；③可取消版——生产必备：组件卸载、路由切换时无限循环必须可停，否则定时器泄漏 + 对已卸载组件 setState。

考点延伸（面试官真正想听的）：①为什么递归 Promise 链不会栈溢出——then 回调在微任务里执行，每次递归调用栈是全新的，不累积栈帧（对比同步递归 setTimeout 早就爆栈）；②setTimeout 的误差——最小 4ms 嵌套钳制 + 事件循环延迟，红绿灯实际间隔 ≥ 标称值，对精度敏感场景（音乐节拍器）要用 Web Audio API 的时钟；③页面隐藏时 setTimeout 被节流（后台标签页 1s 一次），轮播图切后台再回来会"跳帧"，要用 visibilitychange 暂停或 rAF + 时间戳补偿。

踩坑：①while(true) + await 忘了 await——死循环直接卡死主线程；②递归版漏写 return——then 链断掉，只跑一轮就停；③取消时只 break 不清定时器——cancellableSleep 里 abort 必须 clearTimeout，否则定时器到点还会 resolve（虽然循环已退，但回调里若有副作用就出事）；④多实例竞争——两个 trafficLight 同时跑（重复挂载组件），灯的状态互相覆盖，组件级 AbortController 一一对应。`,
    keyPoints: ["sleep 化定时器 + 串行编排；async 版可读性碾压递归链", "递归链不爆栈：微任务每次全新调用栈", "生产必须可取消：AbortController + clearTimeout"],
    followUps: ["如何用 rAF + 时间戳实现不受后台节流影响的定时器？", "把红绿灯改造成「黄灯闪烁 3 次」需要什么改动？（状态机数据驱动的优势）"],
    favorited: false,
  },
  {
    id: "fe-259",
    nodeId: "coding-async",
    question: "Promise 本身不可取消。请设计一个可取消异步任务的方案，并说明 AbortController 的设计哲学。",
    bigTech: true,
    answer: `结论：Promise 规范刻意不含取消——一个 Promise 可能有多个消费者，取消语义对谁生效无解（A 取消了，B 还在等结果怎么办）。社区共识方案是 AbortController：分离"取消信号的生产者"（controller）与"取消信号的订阅者"（signal），任务内部主动检查信号并自行终止——取消是协作式的，不是强杀。

\`\`\`ts
// ===== 1. 通用可取消包装器：race 语义 =====
function cancellable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (v) => { signal.removeEventListener("abort", onAbort); resolve(v); },
      (e) => { signal.removeEventListener("abort", onAbort); reject(e); },
    );
  });
}

// ===== 2. 任务内部深度支持（真正释放资源）=====
async function fetchWithProgress(url: string, signal: AbortSignal) {
  const resp = await fetch(url, { signal });       // fetch 原生支持：abort 真正断开 TCP
  const reader = resp.body!.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    if (signal.aborted) {                          // 循环内主动检查
      await reader.cancel();                       // 释放流资源
      throw new DOMException("Aborted", "AbortError");
    }
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks;
}

// ===== 3. 搜索联想场景：新输入取消旧请求 =====
class SearchBox {
  private controller: AbortController | null = null;
  async onInput(keyword: string) {
    this.controller?.abort();              // 取消上一次
    this.controller = new AbortController();
    try {
      const result = await searchApi(keyword, { signal: this.controller.signal });
      render(result);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // 被自己取消，静默
      showError(e);
    }
  }
  destroy() { this.controller?.abort(); }   // 组件销毁取消在途请求
}
\`\`\`

AbortController 的设计哲学（为什么是 W3C 标准而非 Bluebird 的 cancel）：①信号与执行分离——controller 只有 abort()，signal 只能被监听，无法反向 abort，权限最小化。把 signal 传给第三方代码很安全，它只能"知道被取消"，不能"取消别人"；②协作式取消——abort 只是置位标记，任务在合适的检查点（checkpoint）自行清理后终止。对比线程强杀（Thread.stop，Java 已废弃）：强杀会留下不一致状态（写一半的文件、锁未释放），协作式让任务自己决定"在哪里安全退出"；③统一标准——fetch、addEventListener、setTimeout 包装、Node 的 fs/net 全部接受 signal，一个信号取消整条调用链，生态一致性远超各库自造轮子。

为什么"race 包装"不是真取消：cancellable() 只是让你的 await 提前 reject，原 Promise 还在跑——网络请求继续耗连接、回调继续执行、结果被丢弃。真取消必须任务内部支持：fetch 收到 abort 会真的断开 TCP 连接、停止下载。所以分层：浅层包装解决"消费者不再等待"，深层 signal 透传解决"生产者停止工作"。

多消费者语义：signal 天然广播——一个 controller 可以取消挂在同一 signal 上的 10 个任务（页面卸载时批量取消所有请求），这解决了"Promise 取消语义对多消费者无解"的难题：取消的是"任务"本身，不是某个"订阅"。

踩坑：①AbortError 的识别——e.name === "AbortError" 是标准判法，别拿 message 匹配（不同实现文案不同）；取消是"预期行为"不是错误，监控上报要过滤，否则告警被刷爆；②signal 复用——一个 controller abort 后 signal 永久 aborted，不能"重置"，每次操作要 new 一个新 controller；③监听泄漏——长存任务给 signal addEventListener 后，任务完成必须 removeEventListener（或用 { once: true }），否则 signal 对象持有回调无法 GC；④async 函数中 throw AbortError 与 return 的选择——协作取消的惯例是抛 AbortError，让调用方能区分"被取消"和"正常结束"。`,
    keyPoints: ["Promise 无取消是多消费者语义无解，AbortController 用信号广播破解", "协作式取消：任务自查信号、安全点退出、自行清理", "race 包装是假取消，真取消要 signal 透传到任务内部"],
    followUps: ["AbortSignal.timeout() 与手动 controller 实现超时有何差异？", "如何用 AbortSignal 实现「批量任务取消其中一个」的粒度控制？"],
    favorited: false,
  },
  {
    id: "fe-260",
    nodeId: "coding-async",
    question: "实现异步串行执行器：一系列返回 Promise 的函数，按顺序一个接一个执行（前一个完成后才启动下一个），收集所有结果。对比 reduce 链式与 for await 两种实现。",
    bigTech: true,
    answer: `结论：串行的本质是"把数组折叠成一条 Promise 链"。reduce 版函数式、一行流；for await 版命令式、可读性好且天然支持中途 break/条件跳过。关键区别在"任务何时被创建"：传工厂函数才能控制启动时机，传已创建的 Promise 数组则任务早已并发启动，串行只是"按序等待"的假象。

\`\`\`ts
// ===== 方案 1：reduce 链式（函数式） =====
function serial<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  return tasks.reduce<Promise<T[]>>(
    (chain, task) => chain.then(async (results) => {
      const value = await task();        // 前一个完成后才调用 task() —— 真串行
      return [...results, value];
    }),
    Promise.resolve([]),                 // 初始链：已完成的空结果
  );
}

// ===== 方案 2：for await（命令式，推荐） =====
async function serialFor<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());          // await 天然阻塞循环推进
  }
  return results;
}

// ===== 方案 3：支持失败策略的生产版 =====
async function serialRobust<T>(
  tasks: Array<() => Promise<T>>,
  options: { stopOnError?: boolean } = {},
): Promise<Array<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }>> {
  const results: Array<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }> = [];
  for (const task of tasks) {
    try {
      results.push({ status: "fulfilled", value: await task() });
    } catch (reason) {
      results.push({ status: "rejected", reason });
      if (options.stopOnError !== false) break;   // 默认快速失败，中断后续
    }
  }
  return results;
}

// 用法：按顺序迁移数据库（顺序有依赖，必须串行）
await serial([
  () => migrate("001_create_users"),
  () => migrate("002_add_index"),
  () => migrate("003_seed_admin"),
]);
\`\`\`

两种实现对比：reduce 版把"串行"编码进数据结构（链），优雅但调试时调用栈不直观；for await 版就是同步代码的样子，异常栈清晰、能随手加 if (condition) continue、需要时 break，团队协作首选。性能无差异——都是同一时刻只跑一个任务。

最大的坑——"假串行"：

\`\`\`ts
// ❌ 假串行：Promise 在 map 那一刻就全部并发启动了！
const promises = urls.map((url) => fetch(url)); // 10 个请求已发出
const results = [];
for (const p of promises) results.push(await p); // 只是按序收割

// ✅ 真串行：工厂函数延迟创建
const tasks = urls.map((url) => () => fetch(url)); // 只是函数，未启动
await serialFor(tasks); // 一个完成才调下一个工厂
\`\`\`

区分"按序等待已并发的任务"和"真按序启动"是这道题的分水岭——前者并发数不受控（可能瞬间打满连接），后者才是限流/依赖场景要的语义。

真实场景：①有序副作用——数据库迁移、数据修复脚本，步骤间有先后依赖（建表 → 建索引 → 灌数据）；②外部系统限流——调企业微信 API 发 500 条通知，对方限 20 QPS，串行 + 间隔 sleep 最稳妥；③事务语义模拟——多步操作任一失败要回滚已完成的（补偿模式），串行才能记录回滚栈逆序撤销；④爬取详情页——列表 100 个详情页串行抓，避免对目标站点造成并发压力被封 IP。

进阶：①串行与并发的中间态——分批并发（batch size = 5，批内并发批间串行），就是把 serial 和并发限制调度器组合；②reduce 版的内存——[...results, value] 每次复制数组，万级任务 O(n²)，改 push + 最后 return 的写法（上面 for 版天然没这问题）；③串行中传递上下文——前一个结果是后一个的参数（pipeline），把 results.push 换成 current = await task(current) 即可，这就是 Koa 中间件洋葱模型的串行内核。`,
    keyPoints: ["工厂函数延迟创建 = 真串行；已建 Promise 数组 = 假串行", "reduce 折叠成链 / for await 可读性胜出", "生产版：stopOnError 策略 + 结果带状态"],
    followUps: ["Koa 洋葱模型如何用串行 compose 实现前置/后置逻辑？", "批间串行批内并发（batch）如何实现？"],
    favorited: false,
  },
  {
    id: "fe-261",
    nodeId: "coding-async",
    question: "async/await 的本质是什么？用 Generator + 自动执行器实现一个简化版 async 函数，并解释错误传播机制。",
    bigTech: true,
    answer: `结论：async/await 是 Generator 的语法糖——async 函数 ≈ Generator 函数 + 自动执行器（spawn）。await 一个值 ≈ yield 一个 Promise，执行器负责：调用 next() 推进、把 Promise 结果回传（next(result)）、把 Promise 拒绝转成生成器内 throw（throw(err)）。理解了这层，就理解了为什么 await 能"暂停又恢复"，以及错误为什么能用 try/catch 捕获。

\`\`\`ts
// 自动执行器：让 Generator 像 async 一样自己跑完
function spawn<T>(genFn: (...args: unknown[]) => Generator<unknown, T, unknown>) {
  return function (this: unknown, ...args: unknown[]): Promise<T> {
    const gen = genFn.apply(this, args);
    return new Promise<T>((resolve, reject) => {
      // step 是推进引擎：每次拿到 yield 出来的 Promise，完成后喂回结果
      const step = (method: "next" | "throw", arg?: unknown) => {
        let result: IteratorResult<unknown, T>;
        try {
          result = gen[method](arg);        // 推进一格（或向内抛错）
        } catch (e) {
          return reject(e);                 // 生成器内未捕获的错 → 整体 reject
        }
        if (result.done) return resolve(result.value); // 跑完：return 值即 resolve
        // 未完成：把 yield 的值 Promise 化，挂回调继续推进
        Promise.resolve(result.value).then(
          (value) => step("next", value),   // fulfilled：结果喂回 yield 表达式
          (err) => step("throw", err),      // rejected：在 yield 处抛出，可被 try/catch
        );
      };
      step("next");                          // 点火
    });
  };
}

// 效果对比——两段代码等价：
// async 版
async function getUser(id: string) {
  try {
    const user = await fetchUser(id);       // 暂停，等结果恢复
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (e) {
    return fallback;
  }
}
// spawn 版（async 的"脱糖"形态）
const getUser2 = spawn(function* (id: string) {
  try {
    const user = yield fetchUser(id);       // yield ≈ await
    const posts = yield fetchPosts((user as { id: string }).id);
    return { user, posts };
  } catch (e) {
    return fallback;
  }
});
\`\`\`

错误传播机制是精髓：await 的 Promise reject 时，执行器调 gen.throw(err)——错误在 yield 表达式那个位置被"注入"到生成器内部，所以函数体内的 try/catch 能捕获它，就像同步代码一样。这是 async/await 相对 .then 链的革命性体验：异步错误可以用同步的错误处理语法捕获。反过来，函数体内 throw 的错没被捕获时，gen.next() 本身抛给执行器，执行器 reject 给外层 Promise——两条错误路径（内部 catch 消化 / 外层 reject）泾渭分明。

为什么选 Generator 做底层：Generator 是 JS 里唯一"可暂停、可恢复、可双向通信"的函数形态——next(value) 能把值注回暂停点，throw(err) 能在暂停点抛错。这种"协程"（coroutine）能力恰好是 await 需要的。Babel 转译 async 函数时，就是转成 _asyncToGenerator 包裹的 Generator + 一个 _wrap 状态机（regenerator 运行时）。

延伸理解：①微任务边界——每个 await 至少产生一个微任务跳变（实际规范下 await Promise.resolve() 有三个 tick 的历史包袱，Chrome 73 后优化为一个），循环里 await 一万次就是一万个微任务；②顶层 await（ES2022）——模块级 await 让模块本身变成"异步模块"，import 方会等它 resolve，背后是模块图的异步执行标记；③async 函数返回值——永远被 Promise 化（return 1 也是 Promise<1>），因为执行器 resolve 时走了 Promise.resolve 决议；④迭代器协议——Generator 的 next/throw/return 三方法对应"推进/注入错误/提前结束"，执行器只用了前两个，for await...of（异步迭代器）则是这个模式的镜像：消费端拉取式异步。

踩坑：①Generator 的 this 与箭头函数——Generator 函数不能是箭头函数（无 this、无 prototype），spawn 里要 apply(this) 透传；②错误时序——gen.throw(err) 若生成器内没有 try/catch 包裹该 yield，错误冒泡出生成器，执行器 reject，与 async 行为一致；③return 提前结束——生成器内 return 时 done: true，执行器 resolve 该值，对应 async 的 return；④for await 消费同步可迭代对象——会把每个元素 Promise.resolve 包一层再 await，语义安全但有微任务开销。`,
    keyPoints: ["async = Generator + spawn 自动执行器", "reject → gen.throw 在 yield 处注入，故可 try/catch", "双向通信（next 注值/throw 注错）是协程暂停恢复的本质"],
    followUps: ["for await...of 的异步迭代器协议（Symbol.asyncIterator）如何工作？", "为什么 await 循环会拖慢微任务队列？如何批量优化？"],
    favorited: false,
  },
  // ===== 37. coding-algorithm 前端场景算法 =====
  {
    id: "fe-262",
    nodeId: "coding-algorithm",
    question: "实现大数相加与大数相乘（输入输出均为字符串，数字可能超出 Number.MAX_SAFE_INTEGER）。为什么 JS 需要大数运算？",
    bigTech: true,
    answer: `结论：JS 的 Number 是 IEEE 754 双精度，安全整数范围 ±2^53（9007199254740991），超出即丢精度。后端雪花 ID、订单号、金额（以分为单位的大整数）常超此限。三种方案：字符串模拟竖式运算、BigInt（ES2020）、让后端传字符串（约定优先）。

真实事故：订单系统后端返回 Long 型订单 ID（19 位），前端 JSON.parse 后精度丢失（1234567890123456789 变成 1234567890123456800），导致"订单详情 404"——因为拿错误的 ID 去查库。修复方案就是接口规范：超 15 位的 ID 一律返回字符串。

\`\`\`ts
// 大数相加：竖式模拟，从低位向高位逐位加 + 进位
function addBig(a: string, b: string): string {
  let i = a.length - 1, j = b.length - 1, carry = 0;
  let result = "";
  while (i >= 0 || j >= 0 || carry > 0) {      // 注意：carry 也是循环条件
    const digitA = i >= 0 ? a.charCodeAt(i--) - 48 : 0;
    const digitB = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    const sum = digitA + digitB + carry;
    result = (sum % 10) + result;               // 当前位
    carry = Math.floor(sum / 10);               // 进位
  }
  return result;
}

// 大数相乘：竖式乘法——a[i]*b[j] 的结果累加到 result[i+j+1]，最后统一处理进位
function multiplyBig(a: string, b: string): string {
  if (a === "0" || b === "0") return "0";
  const m = a.length, n = b.length;
  const pos = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = (a.charCodeAt(i) - 48) * (b.charCodeAt(j) - 48);
      const p1 = i + j, p2 = i + j + 1;         // 竖式定位：乘积落在两位上
      const sum = mul + pos[p2];
      pos[p2] = sum % 10;
      pos[p1] += Math.floor(sum / 10);          // 进位累加到高位（暂不归一）
    }
  }
  // 去掉前导零后拼接
  return pos.join("").replace(/^0+/, "") || "0";
}

// BigInt 版（现代环境首选）：原生任意精度整数
const addBigNative = (a: string, b: string) => (BigInt(a) + BigInt(b)).toString();
\`\`\`

要点：①charCodeAt(i) - 48 比 Number(char) 快——避免创建字符串再解析，数字字符的 ASCII 从 48 开始；②加法的循环终止条件是 i>=0 || j>=0 || carry>0——最高位进位最容易漏（999+1=1000）；③乘法的位置映射 a[i]*b[j] → [i+j, i+j+1] 是竖式的数学本质，先在 pos 数组里"不归一累加"，最后一次性处理，避免中间态反复进位；④BigInt 与 Number 不能混合运算（1n + 1 抛 TypeError），互转要显式，BigInt 不支持 Math 方法、JSON.stringify（要 toJSON 补丁或 toString）。

面试加分——为什么不用浮点模拟：金额场景禁用浮点（0.1+0.2=0.30000000000000004），业内通行做法是"以分为单位用整数"或 decimal 库。BigInt 的运算性能比 Number 慢一个数量级（任意精度要堆分配），高频计算场景慎用。

踩坑：①输入含负号/小数点要单独处理（上面实现假设非负整数字符串）；②JSON.parse 解析大数时精度在 parse 阶段就丢了，轮不到你后续处理——必须源头传字符串，或自定义 JSON.parse 的 reviver 也无法挽回（reviver 拿到的已是丢精度的数）；③BigInt 转 Number 超出安全范围静默丢精度，Number(big) 之前要自行判断范围；④除法/开方 BigInt 会截断小数（7n / 2n === 3n），金融场景要配合定点数库。`,
    keyPoints: ["竖式模拟：低位向高位 + 进位；乘法 i+j 定位", "BigInt 原生但不可与 Number 混算、不可 JSON 序列化", "源头治理：超 15 位 ID 后端必须传字符串"],
    followUps: ["如何实现大数除法与取模？", "decimal.js 如何表示任意精度小数？（分数/科学计数法存储）"],
    favorited: false,
  },
  {
    id: "fe-263",
    nodeId: "coding-algorithm",
    question: "实现数组扁平化（支持任意深度）与对象扁平化（{a:{b:{c:1}}} → {'a.b.c':1}）。各有哪些边界情况？",
    bigTech: true,
    answer: `结论：数组扁平化是"深度遍历 + 拼接"，对象扁平化是"路径记录 + 叶子写入"。边界情况是区分度所在：循环引用、数组作为对象的叶子、特殊对象（Date/RegExp 不该被展开）、key 中含点号的路径冲突。

\`\`\`ts
// ===== 1. 数组扁平化 =====
// 递归版：depth 控制展开层数（Infinity 全展开）
function flat<T>(arr: unknown[], depth = Infinity): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flat<T>(item, depth - 1));  // 深度递减
    } else {
      result.push(item as T);
    }
  }
  return result;
}

// 迭代版（栈）：防深度爆炸栈溢出（10 万层嵌套递归会 stack overflow）
function flatIterative<T>(arr: unknown[]): T[] {
  const result: T[] = [];
  const stack = [...arr];
  while (stack.length) {
    const item = stack.shift()!;                 // BFS 顺序（要 DFS 用 pop+unshift 结果再反转）
    if (Array.isArray(item)) stack.unshift(...item); // 前插保序
    else result.push(item as T);
  }
  return result;
}

// 原生 arr.flat(Infinity)：ES2019，但不展开稀疏数组的空位（hole 会被跳过）

// ===== 2. 对象扁平化 =====
function flatten(obj: Record<string, unknown>, prefix = "", hash = new WeakSet<object>()): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (value !== null && typeof value === "object") {
      if (hash.has(value)) throw new TypeError("循环引用无法扁平化");
      // 边界决策：Date/RegExp/数组 视为叶子，不展开
      if (value instanceof Date || value instanceof RegExp || Array.isArray(value)) {
        result[path] = value;
        continue;
      }
      hash.add(value);
      Object.assign(result, flatten(value as Record<string, unknown>, path, hash));
      hash.delete(value);                        // 兄弟分支可复用同一引用（菱形引用不算循环）
    } else {
      result[path] = value;                      // 原始值叶子
    }
  }
  return result;
}
// { a: { b: { c: 1 }, d: [1,2] }, e: new Date() }
// → { 'a.b.c': 1, 'a.d': [1,2], 'e': Date }
\`\`\`

真实应用：①动态表单系统——嵌套的表单模型拍平成"路径 → 值"做校验和脏检查，lodash.get/set 配套按路径回写；②i18n 语言包——{ home: { title: "首页" } } 拍平成 "home.title" 做 key 查找；③接口参数转换——老后端要平铺 query 参数，前端把嵌套对象拍平再 URL 编码；④React 的 children 扁平化——React.Children.toArray 内部就做了扁平 + 去 Fragment。

边界情况逐个过：①稀疏数组——[, , 1] 手动递归会把 hole 当 undefined 收入结果，原生 flat 跳过 hole，语义差异要在面试中点出；②循环引用——{ a: { self: a } } 递归版爆栈，WeakSet 记录"当前路径上"的祖先（用完 delete，允许兄弟分支共享引用——菱形依赖是合法的）；③数组的处理分歧——有的业务要 'arr.0.x' 展开数组，有的把数组当叶子，必须和面试官确认需求（lodash.flattenDeep 只展开数组，flat 对象另有 flatten 库）；④key 冲突——{ a: { b: 1 }, 'a.b': 2 } 拍平后两个键都是 'a.b'，后写覆盖先写，要检测冲突报 warning；⑤Symbol 键——Object.entries 拿不到 Symbol 键，需要 Reflect.ownKeys 才完整。

逆向操作（unflatten）：按 . 拆分路径逐层建树，配合 lodash.set 一行搞定——拍平和还原常成对出现在"数据快照对比"场景（diff 两个版本的对象，先拍平再逐 key 比对）。`,
    keyPoints: ["数组扁平：递归 depth 递减 / 栈迭代防爆栈", "对象扁平：路径拼接 + 叶子判定（Date/数组不展开）", "循环引用用祖先集 WeakSet，菱形引用要放行"],
    followUps: ["原生 flat 对稀疏数组的处理与手动实现差异？", "unflatten 还原时 'a.0.b' 路径如何决定建数组还是对象？"],
    favorited: false,
  },
  {
    id: "fe-264",
    nodeId: "coding-algorithm",
    question: "实现数组去重的多种方案，并扩展到：按对象 key 去重、求两个数组的交集/并集/差集。分析各方案复杂度。",
    bigTech: true,
    answer: `结论：原始值去重首选 [...new Set(arr)]（O(n)）；NaN 和对象引用是 Set 的判定盲区（Set 用 SameValueZero，NaN 视为相等去重，对象按引用比）。按 key 去重要 Map 建索引；交并差集是 Set 语义的直接映射，但对象数组要先映射到键空间。

\`\`\`ts
// ===== 1. 原始值去重 =====
const uniq = <T>(arr: T[]): T[] => [...new Set(arr)];
// [1, '1', NaN, NaN] → [1, '1', NaN]（NaN 被去重，1 和 '1' 不相等）

// filter + indexOf 版（面试手写常考，O(n²)，只能当备胎）
const uniqLegacy = <T>(arr: T[]): T[] => arr.filter((v, i) => arr.indexOf(v) === i);
// 坑：indexOf 用严格相等，NaN 永远找不到自己 → NaN 全被过滤掉！

// ===== 2. 对象数组按 key 去重（保首次出现） =====
function uniqBy<T, K extends keyof T>(arr: T[], key: K): T[] {
  const seen = new Map<T[K], T>();
  for (const item of arr) {
    if (!seen.has(item[key])) seen.set(item[key], item); // 先到先得
  }
  return [...seen.values()];
}
// 保最后一次出现：改成每次都 set，Map 的 key 覆盖、插入序不变

// ===== 3. 集合运算（对象数组版本，先映射到键空间） =====
type KeyFn<T> = (item: T) => string | number;

function intersect<T>(a: T[], b: T[], key: KeyFn<T>): T[] {
  const bKeys = new Set(b.map(key));
  const seen = new Set<string | number>();
  return a.filter((item) => {
    const k = key(item);
    if (!bKeys.has(k) || seen.has(k)) return false; // 不在 b 或已取过
    seen.add(k);
    return true;
  });
}

function union<T>(a: T[], b: T[], key: KeyFn<T>): T[] {
  return uniqBy([...a, ...b], key as never);       // 并集 = 拼接后去重
}

function difference<T>(a: T[], b: T[], key: KeyFn<T>): T[] {
  const bKeys = new Set(b.map(key));
  return a.filter((item) => !bKeys.has(key(item))); // 在 a 不在 b
}
\`\`\`

复杂度分析（面试官必问）：①Set/Map 方案 O(n)——哈希表均摊 O(1) 查询；②filter+indexOf O(n²)——万条数据 1 亿次比较，实测 Chrome 下 10 万元素 Set 版 2ms vs indexOf 版 800ms，差 400 倍；③includes 版去重（arr.includes）同样 O(n²)，但正确处理 NaN（SameValueZero）。

真实场景：①标签系统——用户已选标签与推荐标签求差集，得出"还可添加"列表；②权限 diff——旧权限集与新权限集做交并差，算出"新增/删除/保留"三种操作渲染差异列表；③表格批量选择——跨页全选时，已选行按 id 去重合并（翻页回来不重复计数）；④埋点去抖——同一用户同一事件 5 分钟内按 eventId+uid 去重，防重复上报污染统计。

深度判定问题：①对象内容相等但引用不同（{a:1} 和 {a:1}）Set 无法去重——需要"键序列化"（JSON.stringify 键，但键顺序敏感：{a:1,b:2} 和 {b:2,a:1} 序列化不同，要排序键再序列化，或手写稳定 hash）；②Set 去重保持插入序——这也是为什么 [...new Set()] 比 Map 方案更常被首选，语义天然符合"去重且保序"；③大数组的内存——Set 额外占用一份存储，百万级数据可考虑"先排序再相邻去重"（O(nlogn) 但无额外哈希表），流式数据则必须在线算法。

踩坑：①NaN 的三种判定差异——indexOf(NaN)===-1（严格相等）、includes(NaN)===true、Set.has(NaN)===true；②+0 和 -0——SameValueZero 视为相等会去掉一个，Object.is(+0,-0) 为 false，数学计算场景要注意符号丢失；③去重后顺序——要求"按最后出现去重"（保留最新数据）时 Set 方案要从右往左遍历；④对象键冲突——id 有 number 1 和 string "1" 混合时，key 函数要 String(item.id) 统一类型，否则 Map 里 1 和 "1" 是两个键。`,
    keyPoints: ["Set 去重 O(n) 保序；indexOf 版 O(n²) 且丢 NaN", "按 key 去重 Map 索引；交并差先映射键空间", "对象内容去重要稳定序列化键（排序键再 stringify）"],
    followUps: ["百万级数据去重，Set 内存溢出时如何外排序去重？", "SameValueZero 与严格相等、Object.is 的三方差异？"],
    favorited: false,
  },
  {
    id: "fe-265",
    nodeId: "coding-algorithm",
    question: "实现版本号比较函数 compareVersion('1.2.0', '1.10.0')。如何处理预发布标签（alpha/beta/rc）？semver 规范还有哪些规则？",
    bigTech: true,
    answer: `结论：版本号按 . 分段数值比较，'1.10.0' > '1.2.0'（10 > 2，不能按字符串比）。带预发布标签时：正式版 > 预发布版，预发布按标签链逐级比较（alpha < beta < rc）。这是依赖管理（package.json 的 ^/~）、灰度发布、特性开关的基础设施。

\`\`\`ts
// 基础版：纯数字段比较，返回 1 / -1 / 0
function compareVersion(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  const len = Math.max(partsA.length, partsB.length); // 段数不等补 0
  for (let i = 0; i < len; i++) {
    const x = partsA[i] ?? 0;                          // '1.2' 视为 '1.2.0'
    const y = partsB[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

// 完整版：支持预发布标签（semver 规范 §11）
const PRERELEASE_ORDER = ["alpha", "beta", "rc"];      // 标签优先级表

function compareSemver(a: string, b: string): number {
  const parse = (v: string) => {
    const [core, pre = ""] = v.split("-");             // '1.2.0-rc.1' → core='1.2.0', pre='rc.1'
    return { nums: core.split(".").map(Number), pre: pre.split(".").filter(Boolean) };
  };
  const pa = parse(a), pb = parse(b);

  // 1. 主版本号三段数值比较
  for (let i = 0; i < 3; i++) {
    const diff = (pa.nums[i] ?? 0) - (pb.nums[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }

  // 2. 都有正式版 core 相同：无 pre 的（正式版）> 有 pre 的（预发布版）
  if (!pa.pre.length && !pb.pre.length) return 0;
  if (!pa.pre.length) return 1;                        // '1.2.0' > '1.2.0-rc.1'
  if (!pb.pre.length) return -1;

  // 3. 逐级比较 pre 标签：数字 < 字母；同类型数值比大小，字母按字典序
  for (let i = 0; i < Math.max(pa.pre.length, pb.pre.length); i++) {
    const x = pa.pre[i], y = pb.pre[i];
    if (x === undefined) return -1;                    // 标签链短的小：'1.0.0-alpha' < '1.0.0-alpha.1'
    if (y === undefined) return 1;
    const xNum = /^\\d+$/.test(x), yNum = /^\\d+$/.test(y);
    if (xNum && yNum) {                                // 都是数字：数值比
      const d = Number(x) - Number(y);
      if (d !== 0) return d > 0 ? 1 : -1;
    } else if (xNum) return -1;                        // 数字 < 字母
    else if (yNum) return 1;
    else if (x !== y) return x > y ? 1 : -1;           // 字母：字典序（alpha < beta < rc 天然成立）
  }
  return 0;
}
\`\`\`

semver 完整规则（面试常考背景知识）：①三段语义——MAJOR（不兼容变更）.MINOR（向后兼容新特性）.PATCH（向后兼容修复）；②^ 与 ~ 范围——^1.2.3 允许 1.x.x（主版本锁死），~1.2.3 只允许 1.2.x（次版本锁死），^0.x 特殊（0 主版本视为不稳定，^0.2.3 只到 0.2.x）；③build 元数据——1.0.0+build.123 不参与比较（只作构建标识）；④版本底线——1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0。

真实应用：①灰度发布——客户端上报版本，服务端判断 "version >= 3.2.0" 才下发新功能配置；②依赖冲突排查——npm ls 后手工判断两个传递依赖能否合并（semver.satisfies）；③强制升级——比较当前版本与最低支持版本，低于则弹强更框（App 内嵌 H5 常做）；④webpack Module Federation——共享依赖的版本协商，semver 不满足则各自加载独立副本（运行时包体积翻倍的根源）。

踩坑：①前导零——'1.02.0' 严格 semver 非法（数字段不许前导零），但宽松解析要兼容；②段数不等——'1.2' vs '1.2.0' 应视为相等（补零），别误判小于；③非数字字符——'v1.2.0' 的 v 前缀要先 strip（git tag 习惯）；④大数字段——版本段可能超 2^53（极少见但构建号可能很长），稳妥用 BigInt 或分段字符串比较；⑤比较方向——排序用 arr.sort(compareVersion) 是升序，要"最新在前"记得反转；⑥npm 实际算法——真实 npm semver 库还有连字符范围（1.2.3 - 2.3.4）、x 范围（1.2.x）、|| 并集等 DSL，面试点到即可，别陷入实现黑洞。`,
    keyPoints: ["分段数值比较，段数不等补零", "正式版 > 预发布版；数字标签 < 字母标签", "^ 锁主版本、~ 锁次版本、^0.x 特殊"],
    followUps: ["npm 依赖解析如何用最浅树 + semver 满足集选版本？", "Module Federation 共享依赖版本不满足时的加载策略？"],
    favorited: false,
  },
  {
    id: "fe-266",
    nodeId: "coding-algorithm",
    question: "实现数字千分位格式化（1234567.891 → '1,234,567.891'），要求支持负数与任意小数位。再实现大数缩写（12300 → '1.2万'）。",
    bigTech: true,
    answer: `结论：千分位的核心是"整数部分每三位插逗号"，正则版用前瞻断言一行搞定，手动版从右往左每三位切片。小数部分不参与千分位。大数缩写是"按数量级归一 + 单位映射"，中文环境按万/亿，英文按 k/M/B——这是数据看板的标配。

\`\`\`ts
// ===== 1. 千分位格式化 =====
// 正则版：利用前瞻断言，找"后面跟着 3 的倍数位数字"的位置插逗号
function toThousand(num: number | string): string {
  const [int, dec] = String(num).split(".");
  const formatted = int.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
  return dec === undefined ? formatted : \`\${formatted}.\${dec}\`;
}
// 正则拆解：\\B 非单词边界（不在开头）+ (?=(\\d{3})+(?!\\d)) 前瞻——
// 当前位置向右数，数字个数是 3 的倍数且结尾后无更多数字组

// 手动版（面试要求解释原理时写）：从右往左三位一切
function toThousandManual(num: number | string): string {
  const str = String(num);
  const negative = str.startsWith("-");
  const body = negative ? str.slice(1) : str;
  const [int, dec] = body.split(".");
  let result = "";
  for (let i = int.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    result = int.slice(start, i) + (result ? "," : "") + result;
  }
  return (negative ? "-" : "") + result + (dec === undefined ? "" : \`.\${dec}\`);
}

// ===== 2. 大数缩写（中文万/亿 与 英文 k/M/B 双体系） =====
function abbreviate(num: number, locale: "zh" | "en" = "zh"): string {
  const abs = Math.abs(num);
  const units: Array<[number, string]> = locale === "zh"
    ? [[1e8, "亿"], [1e4, "万"]]
    : [[1e9, "B"], [1e6, "M"], [1e3, "k"]];
  for (const [threshold, unit] of units) {
    if (abs >= threshold) {
      const value = abs / threshold;
      // 保留 1 位小数并去尾零：1.0万 → 1万，1.2万 保留
      const text = value.toFixed(1).replace(/\\.0$/, "");
      return (num < 0 ? "-" : "") + text + unit;
    }
  }
  return String(num);
}
\`\`\`

正则版原理详解（面试必追问）：(?=(\d{3})+(?!\d)) 是零宽前瞻断言——不消费字符、只断言"当前位置右侧"的模式。拆解：从某位置向右看，能看到若干组"恰好 3 位数字"，且最后一组后面不再是数字。这样匹配到的位置恰好是千分位逗号应插入处。\B 排除字符串开头（开头插逗号就错了）。整个过程不修改数字本身，只插入分隔符——零宽断言的经典应用，同类还有密码强度校验 (?=.*[a-z])(?=.*[A-Z])。

边界与精度：①负数——先取符号再处理，正则版对负号天然安全（- 不是 \d 不参与计数）；②小数——split('.') 分离，小数位不插逗号，科学计数法字符串（1e21）要先转普通表示（(1e21).toLocaleString 或直接拒绝处理）；③精度——123456789.12345678 浮点本身已丢精度，千分位只是"显示层"格式化，高精度场景要在字符串状态下格式化（函数入参接受 string 就是这个原因）；④原生方案——Intl.NumberFormat('zh-CN').format(1234567.89) 或 toLocaleString()，生产环境首选，还支持货币、百分比，手写是为了面试和兼容极端定制。

大数缩写的真实业务：①数据看板——GMV 显示 "12.3亿" 而非 1230000000，C 端阅读效率提升；②社交产品——粉丝数 1.2万、播放量 340万；③取舍细节——不足 1 万显示原值还是 "9999"？产品通常要求 "9999" 原样（避免 "1万" 在四舍五入边界的跳动），toFixed 是银行家舍入吗？——不是，toFixed 是"向最近舍入，0.5 情况实现相关"（二进制浮点导致 1.005.toFixed(2) === '1.00'），金额场景禁用 toFixed 做舍入，要用十进制定点库；④缩写后的悬停——缩写是展示态，title tooltip 要显示完整数字，无障碍场景 aria-label 同理。

踩坑：①toLocaleString 在旧 Android WebView 的兼容（部分机型不插逗号）；②缩写截断 vs 舍入——1.29万 显示 "1.2万" 还是 "1.3万" 要和产品确认（数据看板通常截断防"看起来虚高"）；③万/亿体系对英文用户不直观——国际化项目单位表按 locale 切换；④Number.isFinite 守卫——NaN/Infinity 输入要原样返回或抛错，正则版对 NaN 会输出 'NaN' 还算安全。`,
    keyPoints: ["\\B(?=(\\d{3})+(?!\\d)) 零宽前瞻插逗号", "小数与符号分离处理；生产首选 Intl.NumberFormat", "缩写按数量级归一，toFixed 非精确舍入金额禁用"],
    followUps: ["为什么 1.005.toFixed(2) 是 '1.00'？如何实现真正的四舍五入？", "Intl.NumberFormat 如何做货币与紧凑记数（notation:'compact'）？"],
    favorited: false,
  },
  {
    id: "fe-267",
    nodeId: "coding-algorithm",
    question: "实现扁平数组转树（listToTree）与树转数组（treeToList），再实现查找某节点的完整路径。这是哪些前端组件的底层？",
    bigTech: true,
    answer: `结论：listToTree 是"一次遍历建索引 + 二次遍历挂父子"的 O(n) 算法（朴素双重循环是 O(n²)）；treeToList 是 DFS/BFS 遍历；路径查找是"带回溯的 DFS"或"父指针回爬"。级联选择器、组织架构树、菜单权限树、评论区都建立在这三件套上。

\`\`\`ts
interface TreeNode { id: number; parentId: number | null; name: string; children?: TreeNode[] }

// ===== 1. 数组转树：O(n) 哈希索引法 =====
function listToTree(list: TreeNode[]): TreeNode[] {
  const map = new Map<number, TreeNode & { children: TreeNode[] }>();
  const roots: TreeNode[] = [];
  // 第一遍：建索引（顺便预置 children 数组）
  for (const item of list) map.set(item.id, { ...item, children: [] });
  // 第二遍：挂父子
  for (const node of map.values()) {
    if (node.parentId !== null && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);  // 挂到父节点
    } else {
      roots.push(node);                              // 无父即根（支持多根/森林）
    }
  }
  return roots;
}

// ===== 2. 树转数组：DFS 遍历（可带层级信息） =====
function treeToList(tree: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      const { children, ...rest } = node;            // 剥离 children 还原平铺结构
      result.push(rest as TreeNode);
      if (children?.length) walk(children);          // 先序遍历：父先于子
    }
  };
  walk(tree);
  return result;
}

// ===== 3. 查找节点路径：DFS 回溯 =====
function findPath(tree: TreeNode[], targetId: number): TreeNode[] | null {
  for (const node of tree) {
    if (node.id === targetId) return [node];         // 命中：路径起点
    if (node.children?.length) {
      const subPath = findPath(node.children, targetId);
      if (subPath) return [node, ...subPath];        // 子树命中：自己接在路径头部
    }
  }
  return null;                                       // 本分支未命中，回溯
}

// 4. 备选：父指针回爬（有 parent 引用时 O(depth)，无需遍历整棵树）
function findPathByParent(node: TreeNode & { parent?: TreeNode }): TreeNode[] {
  const path: TreeNode[] = [];
  let cur: TreeNode | undefined = node;
  while (cur) { path.unshift(cur); cur = cur.parent; } // 沿父指针爬到根
  return path;
}
\`\`\`

复杂度对比：listToTree 哈希版 O(n) 时间 O(n) 空间；朴素版（每个节点都扫一遍数组找父亲）O(n²)，5 万条组织架构数据从 3 秒降到 5ms。findPath DFS 最坏 O(n)，父指针版 O(depth)——树深通常 log n 级，差异在百万节点时才显著。

真实组件底层：①级联选择器（Cascader）——选中叶子后要展示"省/市/区"完整路径，findPath 的返回值直接绑给受控值；②菜单权限——后端存平铺的 menu 表（parent_id 字段），前端 listToTree 渲染侧边栏；③组织架构——企业微信式的部门树，搜索成员时 treeToList 做扁平索引再全文匹配；④评论区——嵌套评论平铺存储，渲染时转树，"删除父评论"策略（级联删 or 标记"该评论已删除"保留楼层）是产品决策点；⑤面包屑导航——findPath 的产物就是面包屑数据。

细节决策点：①数据源拷贝——上面实现 {...item} 浅拷贝不污染原数组（原数组可能被其他组件引用，直接挂 children 会造成"渲染一次数据脏一次"的诡异 bug）；②多根支持——parentId 找不到父节点的节点一律当根（容错脏数据：父节点被删但子节点还在）；③排序——children.push 保持原数组顺序，要求"按 sort 字段排序"要在挂载后对各层 children 排序；④深度限制——递归版在超深树（如 DOM 树转录）会栈溢出，迭代版用显式栈解决；⑤循环引用——脏数据 A 的 parent 是 B、B 的 parent 是 A 会形成环，遍历时死循环，生产代码要加 visited 集合防御。

踩坑：①id 类型混用（数字 1 vs 字符串 "1"）导致 map.get 拿不到父节点，树退化成全平铺——建索引前统一 String(id)；②listToTree 要求列表中父节点存在于数组中（允许孤儿当根），但有些业务要求"父缺失即丢弃"，要在挂载时判断；③treeToList 剥离 children 用解构是浅操作，深层嵌套属性仍共享引用；④虚拟滚动渲染大树时，要把树再拍平成"可见节点列表"（treeToList 的变体：只展开 expanded 的分支），万级节点全量渲染必卡。`,
    keyPoints: ["listToTree：哈希索引 O(n)，朴素双重循环 O(n²)", "findPath：DFS 命中回溯拼接 / 父指针回爬 O(depth)", "级联选择器/菜单树/组织架的底层三件套"],
    followUps: ["树的虚拟滚动如何只展开可见分支并计算缩进？", "不可变数据（Immer）下树节点更新如何做到 O(depth) 而非整树拷贝？"],
    favorited: false,
  },
  {
    id: "fe-268",
    nodeId: "coding-algorithm",
    question: "日期处理：实现判断两个日期区间是否重叠、获取某天所在周的周一日期、相对时间格式化（刚刚/x分钟前/昨天）。各有什么时区陷阱？",
    bigTech: true,
    answer: `结论：日期区间重叠用"起点交集"判定——a.start <= b.end && b.start <= a.end（转换为时间戳比较）。所在周周一要处理周日为 0 的偏移。相对时间是"差值分级映射"。时区陷阱的根源：Date 存的是 UTC 时间戳，显示时按本地时区渲染，跨时区比较必须统一基准。

\`\`\`ts
// ===== 1. 日期区间重叠判断 =====
interface Range { start: Date | number; end: Date | number }
function isOverlap(a: Range, b: Range): boolean {
  const aStart = +a.start, aEnd = +a.end;             // 一元 + 转时间戳
  const bStart = +b.start, bEnd = +b.end;
  return aStart <= bEnd && bStart <= aEnd;            // 闭区间判定
}
// 反证法好理解：不重叠 ⟺ a 完全在 b 前（aEnd < bStart）或 b 完全在 a 前

// 进阶：区间求交集（日程冲突检测用）
function intersectRange(a: Range, b: Range): Range | null {
  if (!isOverlap(a, b)) return null;
  return { start: Math.max(+a.start, +b.start), end: Math.min(+a.end, +b.end) };
}

// ===== 2. 获取某天所在周的周一 =====
function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);                              // 归零时分秒，避免跨天误差
  const day = d.getDay();                              // 0=周日 1=周一 ... 6=周六
  const diff = day === 0 ? -6 : 1 - day;               // 周日要回退 6 天，其余回退 day-1 天
  d.setDate(d.getDate() + diff);
  return d;
}

// ===== 3. 相对时间格式化 =====
function timeAgo(input: Date | number, now = Date.now()): string {
  const diff = now - +input;                           // 毫秒差
  if (diff < 0) return "未来";
  const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;
  if (diff < MIN) return "刚刚";
  if (diff < HOUR) return \`\${Math.floor(diff / MIN)}分钟前\`;
  if (diff < DAY) return \`\${Math.floor(diff / HOUR)}小时前\`;
  if (diff < 2 * DAY) return "昨天";
  if (diff < 7 * DAY) return \`\${Math.floor(diff / DAY)}天前\`;
  const d = new Date(input);                           // 超一周：显示具体日期
  return \`\${d.getMonth() + 1}月\${d.getDate()}日\`;
}
\`\`\`

时区陷阱（这才是区分度）：①new Date('2024-01-15') 的解析分歧——纯日期串按 UTC 解析（ISO 规范），'2024-01-15 10:00:00' 带空格的形式按本地时区解析，Chrome 和 Safari 对非 ISO 格式解析行为不一致（Safari 对 '2024-01-15 10:00:00' 返回 Invalid Date！）——生产环境日期串必须是 ISO 格式（YYYY-MM-DDTHH:mm:ss）或手动拆分构造；②跨时区比较——服务器存 UTC 时间戳、客户端按本地显示是唯一正解，任何"把时间字符串传来传去"的方案都会在跨国用户处爆炸；③夏令时——美国/欧洲夏令时切换日，一天可能是 23 或 25 小时，"加 24 小时"不等于"加一天"（要 setDate(getDate()+1) 而非 +86400000ms）；④getDay() 的周起点——JS 周日是 0，中国习惯周一是起点，getMonday 里 day===0 特判就是这个坑；⑤月末进位——setDate(31+15) 自动进位到下月（1月31日+15天=2月15日），这个"溢出"特性既是便利也是 bug 源（1月31日加一个月变 3月3日而非 2月28日）。

真实应用：①日程/会议系统——isOverlap 检测会议室冲突，intersectRange 算出冲突时段高亮；②周报系统——getMonday 定位数据归属周，配合 Intl API 还能拿 ISO 周数（某些公司以周为粒度 OKR）；③feed 流——timeAgo 是朋友圈/微博的标配，注意"昨天"和"1天前"的语义差（昨天是日历日概念，1 天前是 24 小时差）；④倒计时——要服务端校时（客户端时钟可被用户修改），首次握手拿 serverTime - clientTime 的偏移量，后续本地推算。

生产建议：超过上述级别的日期需求（周期事件、时区转换、DST 感知）直接上 date-fns（tree-shakable）或 dayjs，Intl.RelativeTimeFormat('zh-CN') 原生支持相对时间本地化（"3天前"），Temporal API（提案阶段）是 Date 的正统继任者，彻底解决可变性（Date 的 set* 方法原地修改是著名坑）与时区问题。

踩坑：①iOS Safari 的 YYYY-MM-DD HH:mm:ss 必须换成 YYYY/MM/DD 或 ISO T 分隔；②时间戳单位混用（后端给秒、前端 Date 要毫秒，×1000 忘了就显示 1970 年）；③timeAgo 的 now 要由调用方传入或缓存——列表 100 条各自 new Date() 会有毫秒级不一致，统一取一次更整齐；④性能：长列表每条 timeAgo 都调一次，万级列表考虑定时统一刷新（setInterval 60s 全量重算）而非各自挂定时器。`,
    keyPoints: ["区间重叠：aStart <= bEnd && bStart <= aEnd", "getDay 周日为 0，回退 6 天到周一", "UTC 存储本地显示；非 ISO 日期串 Safari 解析炸"],
    followUps: ["夏令时切换日「加一天」为什么不能用 +86400000ms？", "Temporal API 相对 Date 解决了哪些本质问题？"],
    favorited: false,
  },
  {
    id: "fe-269",
    nodeId: "coding-algorithm",
    question: "虚拟列表的核心算法：给定 10 万条定高数据，如何计算可视区应渲染的项范围与占位高度？不定高场景怎么办？",
    bigTech: true,
    answer: `结论：虚拟列表的本质是"只渲染视口 ± 缓冲区的项，用上下占位元素撑出完整滚动高度"。定高场景是纯算术：startIndex = floor(scrollTop / itemHeight)，渲染区间 [startIndex - buffer, endIndex + buffer]，上占位 = startIndex × itemHeight，下占位 = (total - endIndex) × itemHeight。不定高需要"预估高度 + 实测缓存 + 滚动修正"。

\`\`\`tsx
// 定高虚拟列表核心（React 示意，重点是算术）
function VirtualList({ items, itemHeight, viewportHeight }: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const BUFFER = 5;                                     // 上下各多渲染 5 条，滚动白屏缓冲

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER);
  const visibleCount = Math.ceil(viewportHeight / itemHeight);
  const endIndex = Math.min(items.length, startIndex + visibleCount + BUFFER * 2);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;              // 渲染块的偏移

  return (
    <div style={{ height: viewportHeight, overflow: "auto" }}
         onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      {/* 总高度容器：撑出真实滚动条 */}
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {/* 渲染块：transform 定位到可视位置 */}
        <div style={{ transform: \`translateY(\${offsetY}px)\` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>{item.content}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
\`\`\`

三个关键算术：①startIndex = floor(scrollTop / itemHeight)——当前滚动到的第一条完整项；②totalHeight = count × itemHeight——内层容器撑出和真实全量渲染一样的高度，滚动条比例才正确；③offsetY 用 transform 而非 top——合成层属性，滚动重排时只触发合成，不触发重排（性能关键）。

不定高场景（真实世界的常态）：预估 + 缓存 + 修正三步。①初始给每项预估高度 estimatedHeight，首次按定高算法渲染；②渲染后用 ResizeObserver 实测每项真实高度，存入 heights 缓存数组，并更新"前缀和"（或二分查找用的累积高度数组）；③用户滚动时，scrollTop 对应的目标项通过二分查找在累积高度数组中定位（O(log n)）；④修正——当已渲染项实测高度与预估不符时，总高度变化导致滚动条跳动，要调整 scrollTop 补偿差值（react-window 的 VariableSizeList 就是这么做的）。更先进的方案：IntersectionObserver 驱动的"按需回收"（如 FlashList 的回收池复用 cell）。

性能体系：①渲染量——视口 600px / 行高 50px = 12 条 + 缓冲 10 条 ≈ 22 个 DOM 节点 vs 全量 10 万节点，内存与首屏渲染都是数量级差距；②滚动事件节流——onScroll 高频触发，setState 要用 rAF 节流或直接读写 ref 手动控制渲染（React 18 的 useSyncExternalStore 模式）；③key 的稳定性——key 必须用数据 id 而非索引，否则缓冲区滑动时 React 复用错组件（输入框内容串行）；④图片懒加载协同——虚拟列表项进出视口快，图片要用 loading="lazy" 或 IO 提前半屏加载。

真实应用：①聊天记录——IM 消息列表（微信/飞书 Web），十万条历史消息虚拟滚动 + 向上翻页加载；②长报表——财报/日志查看器，固定表头 + 虚拟行；③表格——antd Table 的 virtual 模式、AG Grid 的 rowVirtualisation（默认开启，号称百万行不卡）；④通讯录——字母索引条与虚拟列表联动（点击字母直接 scrollTo 对应 offset，offset = 字母首项索引 × 行高）。

踩坑：①translateY 大数精度——10 万 × 50px = 500 万像素，Chrome 元素高度上限约 1677 万像素，超限后滚动失效（需分段渲染）；②scrollTop 漂移——不定高修正逻辑有 bug 时滚动会"弹跳"，调试手段是冻结 heights 缓存对比；③屏内 focus 丢失——滚动把 focus 中的输入框回收了，焦点直接丢失（要保留 focus 项或滚动前 blur）；④SSR 场景——服务端无 scrollTop，首屏按 scrollTop=0 渲染即可，注意 hydration 一致；⑤sticky 行——表头/分组吸顶行要与虚拟区间计算联动，吸顶行自身也在被回收的列表里时要特殊处理。`,
    keyPoints: ["startIndex=floor(scrollTop/itemHeight)，总高撑滚动条，transform 偏移", "不定高：预估+实测缓存+前缀和二分+scrollTop 修正", "key 用 id；滚动 rAF 节流；缓冲区防白屏"],
    followUps: ["二维虚拟滚动（行+列都虚拟的大表格）如何计算？", "IntersectionObserver 回收池方案相对索引计算的优劣？"],
    favorited: false,
  },
  // ===== 38. arch-microfe 微前端架构 =====
  {
    id: "fe-270",
    nodeId: "arch-microfe",
    question: "微前端解决什么问题？iframe、qiankun、Module Federation、Web Components 四条路线的本质差异与选型依据是什么？",
    bigTech: true,
    answer: `结论：微前端解决的是"巨石前端应用"的两个绝症——多个团队在同一代码库上互相阻塞（协作问题）、技术栈绑定无法渐进升级（演进问题）。核心目标是：独立开发、独立部署、独立技术栈、运行时集成。四条路线的隔离强度和集成成本各不相同。

四条路线的本质：

1. iframe——隔离最强（独立进程/独立 JS 环境/独立 CSS），但体验最割裂：路由不同步（刷新丢失子页面状态）、通信靠 postMessage 序列化（函数/对象传不了）、弹窗遮罩层无法穿透、滚动条双套、SEO 死绝。适合：完全隔离的第三方嵌入（支付页、客服系统）。
2. qiankun（基于 single-spa）——运行时集成：主应用按路由激活子应用，子应用暴露 bootstrap/mount/unmount 生命周期，JS 用 Proxy 沙箱隔离、CSS 用 scoped 隔离。本质是"同页多应用编排器"，主子仍是同一 JS 环境（沙箱是软隔离）。
3. Module Federation（webpack 5）——构建时/运行时混合：应用互相暴露模块（exposes）并消费远程模块（remotes），共享依赖（shared）在运行时协商单例。本质是"模块级的分布式构建"，没有应用生命周期概念，粒度更细（可以是组件、函数、页面）。
4. Web Components——浏览器原生组件隔离：Custom Element + Shadow DOM 提供 DOM 和样式封装，但 Shadow DOM 带来新问题（事件 retargeting、表单关联、CSS 变量穿透要显式定义），框架组件转 WC 有损耗（React 18 前对 WC 属性/事件支持差）。

选型决策树：①要绝对安全隔离（接入不信任的第三方）→ iframe；②多团队多技术栈的中后台整合（阿里系标准场景）→ qiankun；③同技术栈、追求依赖复用和细粒度共享（设计系统/组件库分发）→ Module Federation；④跨框架的"原子组件"分发且能接受 Shadow DOM 约束 → Web Components。

真实项目经验：在某集团中台整合中，主应用 React + 三个子应用（React/Vue2/Vue3）用 qiankun 整合，核心价值不是技术炫技而是"团队自治"——各团队按自己的节奏发版，主应用只维护路由注册表。踩过的最大坑是：把"技术问题"当微前端的价值，实际上它的成本（公共依赖治理、通信复杂度、调试链路变长）必须由"组织协作收益"来买单，小团队单应用强上微前端是纯负债。

判断是否该用的三个硬指标：①是否存在 3+ 团队在同一应用上互相阻塞发版？②是否存在必须共存的多技术栈（历史包袱）？③子应用是否有独立交付的价值（独立域名/独立 SLA）？三个都是"否"就别用——Monorepo + 模块边界就能解决 90% 的问题。`,
    keyPoints: ["价值=团队自治+独立部署+技术栈无关，成本=隔离+通信+调试复杂度", "iframe 硬隔离 / qiankun 应用编排 / MF 模块共享 / WC 原生组件", "小团队单应用别上微前端，Monorepo 模块边界已够用"],
    followUps: ["微前端与 Monorepo 是正交还是互斥？能否同时使用？", "如何度量微前端改造的收益？（发版频率/阻塞时长/依赖体积）"],
    favorited: false,
  },
  {
    id: "fe-271",
    nodeId: "arch-microfe",
    question: "qiankun 的 JS 沙箱是如何实现的？快照沙箱与代理沙箱（ProxySandbox）的原理差异和多实例支持是什么？",
    bigTech: true,
    answer: `结论：沙箱的目标是"子应用对全局环境的污染可隔离、可恢复"。快照沙箱靠"激活时 diff 还原、失活时恢复快照"（只支持单实例）；代理沙箱用 Proxy 给每个子应用造一个假 window，读写都被拦截到各自的沙箱副本上（支持多实例）。

快照沙箱（SnapshotSandbox）原理——遍历 window 所有可枚举属性：

\`\`\`ts
class SnapshotSandbox {
  private windowSnapshot: Record<string, unknown> = {};   // 激活前的 window 快照
  private modifyPropsMap: Record<string, unknown> = {};   // 上次运行期间修改过的属性
  active() {
    // 1. 拍快照：记录当前 window 全量状态
    for (const prop of Object.keys(window)) {
      this.windowSnapshot[prop] = (window as any)[prop];
    }
    // 2. 恢复上次修改：子应用上次运行时改的属性重新写回（保活）
    for (const prop of Object.keys(this.modifyPropsMap)) {
      (window as any)[prop] = this.modifyPropsMap[prop];
    }
  }
  inactive() {
    // 3. diff 当前 window 与快照，记录修改，并还原
    for (const prop of Object.keys(window)) {
      if ((window as any)[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = (window as any)[prop];      // 记下修改
        (window as any)[prop] = this.windowSnapshot[prop];      // 还原
      }
    }
  }
}
\`\`\`

致命短板：①全量遍历 window（上千属性）+ diff，激活/失活是 O(n) 开销；②所有子应用共享同一个真 window——同时只能激活一个（单实例），否则 A 的 window 状态会污染 B。

代理沙箱（ProxySandbox）——qiankun 的默认方案：

\`\`\`ts
class ProxySandbox {
  private fakeWindow: Record<string, unknown> = {};       // 沙箱私有的"全局对象"
  proxy: WindowProxy;
  constructor() {
    const fakeWindow = this.fakeWindow;
    const rawWindow = window;                              // 真 window
    this.proxy = new Proxy(fakeWindow, {
      get(target, prop) {
        if (prop in target) return target[prop as string];  // 先查沙箱副本
        const value = (rawWindow as any)[prop];             // 再查真 window
        // 函数要 bind 真 window，防 this 指向假 window（如 addEventListener 非法调用）
        return typeof value === "function" ? value.bind(rawWindow) : value;
      },
      set(target, prop, value) {
        target[prop as string] = value;                     // 写操作只进沙箱副本，不污染真 window
        return true;
      },
      has(target, prop) {                                   // with 语句/in 操作符拦截
        return prop in target || prop in rawWindow;
      },
    });
  }
}
\`\`\`

子应用代码被执行时，用 with(proxy) 包裹（构建产物 UMD 的 globalObject 指向 proxy），代码里的 window.xxx、自由变量 xxx 都被引导到 proxy 上：读走"副本优先"，写只写副本。每个子应用一个 ProxySandbox 实例 → 多实例共存互不污染。

沙箱的边界（面试加分——沙箱不是万能的）：①DOM 不隔离——子应用 document.body.appendChild 挂的是真 DOM，卸载时要自己清理（qiankun 靠子应用 unmount 钩子里 ReactDOM.unmount）；②定时器/全局监听——setInterval、window.addEventListener 仍在真 window 上，qiankun 的 patchers 模块记录了子应用的定时器和监听，卸载时统一清除；③ESM 逃逸——import 的模块顶层代码在模块加载时就执行，with 包裹管不到模块内部的全局访问（webpack 构建时 globalObject 配置才管得住）；④Symbol.unscopables 与特殊属性——window.top、window.parent 等不可代理属性要特殊放行；⑤原生函数 this——get 拦截里对函数 bind(rawWindow) 就是因为 addEventListener 等 DOM API 内部校验 this 必须是真 window，否则抛 Illegal invocation。

对比快照沙箱，代理沙箱的代价是 Proxy 的兼容性（IE11 直接出局）和性能（每次全局访问多一层 Proxy 拦截，热路径上可感知），但换来了多实例、按需拦截、无副作用激活的能力——现代微前端的唯一选择。`,
    keyPoints: ["快照沙箱：拍快照+diff还原，O(n) 且单实例", "代理沙箱：Proxy 假 window，读副本优先/写只进副本，多实例", "沙箱管不住 DOM/定时器/ESM 顶层副作用，靠 patchers 卸载清理"],
    followUps: ["with 语句为何被严格模式禁用？qiankun 为何又能用它？", "如何设计支持 Shadow DOM 的多重隔离沙箱（JS+DOM+CSS 三层）？"],
    favorited: false,
  },
  {
    id: "fe-272",
    nodeId: "arch-microfe",
    question: "微前端的样式隔离有哪些方案？qiankun 的 scoped CSS 与 Shadow DOM 模式各自有什么坑？",
    bigTech: true,
    answer: `结论：JS 沙箱隔离不了 CSS——样式是全局的，子应用的 .title 会污染主应用。方案谱系：构建时约定（BEM/CSS Modules）→ 运行时改写（scoped 属性选择器）→ 浏览器硬隔离（Shadow DOM）。强度递增，灵活性递减。

方案对比：

1. CSS Modules/BEM（约定层）——构建期把类名 hash 化（.title → .title_x8y2k），天然无冲突，但管不住"全局样式重置"（* { margin: 0 } 这种选择器）和第三方库的裸类名。是底线，不是微前端方案。
2. qiankun scoped CSS（运行时改写）——给子应用所有样式规则加属性选择器前缀：.title { } → div[data-qiankun="app1"] .title { }，子应用根容器挂上该 data 属性。实现是监听子应用的 style/link 节点插入，动态改写 CSSRule。
3. qiankun Shadow DOM（experimentalSandbox: { strictStyleIsolation }）——子应用挂载点改为 shadowRoot.appendChild，浏览器原生隔离：内部样式不外泄、外部样式不侵入（除了 CSS 变量和 ::part 显式穿透）。
4. 动态样式表装卸——子应用卸载时把它插入的 <style>/<link> 全部移除（qiankun 默认行为），防"卸载后样式残留污染下一个应用"。

scoped CSS 的坑（真实项目血泪）：①覆盖不了"子应用向 body 直接挂载的节点"——Modal/Dropdown/Tooltip 这类 portal 组件挂到 document.body，逃离了 [data-qiankun] 容器作用域，样式直接失效（antd 的 Modal 要配 getPopupContainer 或 getContainer 指定回子应用容器内）；②@global/通配符规则没法加前缀——* { box-sizing } 加前缀后语义全变，qiankun 选择跳过不改写，等于裸奔；③第三方库的 runtime CSS-in-JS——styled-components/emotion 运行时生成的样式表插到 head 顶部，qiankun 能捕获改写，但插入时机竞争（mount 前插入的样式可能漏捕获）；④优先级战争——[data-qiankun] 前缀提升了子应用选择器优先级（多了一层属性选择器），主应用想覆盖子应用样式时要跟着提权，互相加码最终 specificity 失控。

Shadow DOM 的坑更深：①portal 全死——任何依赖 document.body 挂载的库（弹窗/下拉/右键菜单/toast）都挂在 shadow 外，样式丢失，要逐个库配挂载点；②事件 retargeting——shadow 内的事件 target 对外部显示为 host 元素，全局事件代理（如 analytics 的 document 级点击采集）拿到的 e.target 失真，要读 e.composedPath()[0]；③表单关联断裂——shadow 内的 input 不被外部 form 天然收集（form 关联不跨 shadow 边界）；④图标字体/@font-face 不继承——字体要在 shadow 内重新声明；⑤find-in-page 失效——浏览器 Ctrl+F 搜不到 shadow 内文本（可访问性倒退）；⑥js 全局选择器失效——document.querySelector 穿不透 shadow，主子间 DOM 互操作要走 shadowRoot API。

落地决策（我们的生产标准）：①默认 scoped CSS + 团队约定（禁全局重置、portal 组件统一配挂载容器）——成本最低，覆盖 90% 场景；②接"不信任的第三方应用"（外包交付、历史 jQuery 巨石）才上 Shadow DOM，且提前验收 portal/事件/字体三类问题；③样式治理的根本是"设计系统统一"——主子应用共用一套 token（CSS 变量），冲突自然减少，比任何运行时隔离都便宜。

调试技巧：子应用样式异常时，DevTools 里检查渲染后 CSSRule——document.styleSheets 找到对应表，看规则是否被正确加了前缀；portal 问题直接在 Elements 面板找挂载位置是否在 [data-qiankun] 容器内。`,
    keyPoints: ["scoped CSS 加属性前缀，portal 逃逸 body 是最大坑", "Shadow DOM 硬隔离但 portal/事件/字体/表单全要重新适配", "根治靠设计系统 token 统一，运行时隔离只是兜底"],
    followUps: ["CSS 变量为何能穿透 Shadow DOM？利用它如何设计主题方案？", "qiankun 如何捕获并改写运行时插入的 style 节点？（patchers 原理）"],
    favorited: false,
  },
  {
    id: "fe-273",
    nodeId: "arch-microfe",
    question: "微前端主子应用如何通信？props、initGlobalState、自定义事件总线、URL 状态各自的适用场景与陷阱是什么？",
    bigTech: true,
    answer: `结论：通信设计的头号原则是"能少通信就少通信"——频繁通信是拆分错误的信号（该合并的两个应用被硬拆开了）。手段按耦合度从低到高：URL 状态（跨刷新共享）→ props（父子数据下发）→ 全局状态（initGlobalState）→ 事件总线（最灵活也最失控）。

四种方案的对决：

\`\`\`ts
// ===== 1. props 下发（qiankun 注册时传，React 父子组件思维） =====
// 主应用
registerMicroApps([{
  name: "order-app",
  props: { userInfo, theme: "dark", onNavigate: (path) => router.push(path) },
}]);
// 子应用 mount 时接收
export async function mount(props) {
  props.onGlobalStateChange?.((state) => { /* ... */ });
  renderApp(container, { userInfo: props.userInfo });
}
// 特点：单向数据流，类型可推导（TS 泛型传过去），函数/对象都能传（同 JS 环境）

// ===== 2. initGlobalState（qiankun 官方全局状态） =====
// 主应用
const actions = initGlobalState({ user: null, cart: [] });
actions.onGlobalStateChange((state, prev) => syncToBackend(state));
// 子应用 mount(props) 里 props.setGlobalState({ user: {...} })
// 特点：类似迷你 EventEmitter + 状态快照，主从都能读写

// ===== 3. 自定义事件总线（跨框架中立） =====
const bus = new EventTarget();  // 原生 EventTarget 就够，别引库
window.dispatchEvent(new CustomEvent("cart:updated", { detail: { count: 3 } }));
// 特点：发布订阅完全解耦，但"谁发的、谁该收"无类型无约束，靠文档约定

// ===== 4. URL 状态（唯一跨刷新/跨标签页的方案） =====
// 主应用跳转时把状态编进 query：/order?from=dashboard&highlight=123
// 子应用启动时解析 query 还原状态
\`\`\`

适用场景：①props——主子间稳定的契约数据（用户信息、主题、权限、回调函数），是首选（单向、可测、类型安全）；②initGlobalState——主子都需要读写的少量共享状态（当前租户、全局筛选条件），本质是带快照的事件；③事件总线——兄弟子应用间的瞬时通知（"购物车更新了，角标刷新"）、跨框架通信（Vue 子应用和 React 子应用都不依赖对方 API）；④URL——需要刷新保持/分享链接/浏览器前进后退感知的状态（当前 Tab、筛选条件），也是 iframe 嵌入场景的唯一可靠通道。

陷阱实录：①initGlobalState 的滥用——把整棵状态树塞进去，主子应用双向写，两周后没人说得清数据流向。纪律：全局状态只放"真正的全局上下文"（用户/租户/主题），业务状态各应用自治；②事件总线的事件名冲突与幽灵监听——子应用卸载忘 removeEventListener，重复 mount 后监听翻倍（事件处理执行 N 次）。必须配合卸载清理，或用带命名空间的事件名 + AbortController 批量退订；③props 传函数的 this 陷阱——主应用传 onNavigate 是箭头函数没问题，传类方法要 bind；④URL 状态的安全——敏感状态（token）别放 URL（历史记录/代理日志会留痕），放 sessionStorage 配合 postMessage；⑤跨 realm 类型——子应用传的数组在主应用 instanceof Array === false（沙箱假 window 的 Array 与真的不同 realm），结构化校验替代 instanceof。

架构原则（卡帕西视角）：通信拓扑应该反映业务拓扑——订单应用和商品应用天天互发消息，说明它们是"一个业务域被错误地切了两刀"，正解是合并或重新划界，而不是把总线做得更花哨。微前端圈的经验法则：通信 API 的复杂度与拆分的合理性成反比。`,
    keyPoints: ["首选 props 单向流；全局状态只放真全局上下文", "事件总线要命名空间+卸载清理，防监听翻倍", "URL 是唯一跨刷新通道，敏感状态别进 URL"],
    followUps: ["如何给跨应用事件总线加 TypeScript 类型约束（事件契约）？", "微前端间共享登录态的正确姿势？（cookie domain/token 透传）"],
    favorited: false,
  },
  {
    id: "fe-274",
    nodeId: "arch-microfe",
    question: "Module Federation 的核心机制是什么？exposes/remotes/shared 如何配置？共享依赖的版本冲突如何协商？",
    bigTech: true,
    answer: `结论：Module Federation（MF）让一个构建产物在运行时动态加载另一个构建产物的模块，并共享依赖单例。它把"应用"降级为"模块的集合"——没有主子概念，每个构建既是 host（消费方）也是 remote（提供方）。与 qiankun 的本质差异：qiankun 管应用生命周期，MF 管模块依赖图。

\`\`\`ts
// 提供方（remote）：暴露模块
// webpack.config.js
new ModuleFederationPlugin({
  name: "checkout",                          // 全局唯一名
  filename: "remoteEntry.js",                // 入口清单：暴露了什么、需要什么
  exposes: {
    "./Button": "./src/components/Button",   // 暴露组件
    "./payApi": "./src/api/pay",             // 暴露工具模块
  },
  shared: {
    react: { singleton: true, requiredVersion: "^18.0.0" },  // 单例共享
    "react-dom": { singleton: true },
    lodash: { import: "lodash", shareScope: "default" },      // 非单例可多版本
  },
});

// 消费方（host）：声明远程来源
new ModuleFederationPlugin({
  name: "host",
  remotes: {
    checkout: "checkout@https://cdn.example.com/checkout/remoteEntry.js",
  },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});

// 运行时消费：动态 import 远程模块
const RemoteButton = React.lazy(() => import("checkout/Button"));
\`\`\`

加载机制拆解：①remoteEntry.js 是"清单文件"——包含 exposes 映射表（模块名 → chunk URL）和 shared 声明；②host 启动时先加载 remoteEntry，注册到全局的共享作用域（share scope）；③import("checkout/Button") 时，webpack runtime 查映射表、加载对应 chunk、执行并返回模块；④shared 依赖在"共享作用域"里协商：所有参与的构建把自己的 react 版本注册进去，运行时按 semver 选一个"最高满足版本"，全局只加载这一个（单例的意义）。

版本冲突协商（重点）：①singleton: true——强制全局唯一实例。若两个 remote 提供的 react 版本不满足 requiredVersion，webpack 默认行为：开发环境警告，仍可运行（可能导致两个 React 实例的灾难——hooks 报错 "Invalid hook call"，因为 React 内部状态按模块实例隔离）；②非 singleton——允许共存多版本，运行时加载"最匹配"的版本，匹配不到就用自己的 fallback（eager: true 则打包进自身）；③strictVersion: true——版本不满足直接抛错（生产推荐，快速失败胜过诡异渲染）；④shareScope——可以开多个共享域做隔离（A 组应用共享 react@18，B 组共享 react@17），高级用法。

真实案例：设计系统分发——组件库作为 remote 暴露，20 个业务应用运行时消费，组件库发版后业务方零构建零发版自动获得新版本（这是 MF 最诱人的场景）。代价同样明显：①运行时加载 remoteEntry 多一个网络往返（要配 preload + CDN 强缓存 + 容错降级——远程挂了本地要有 fallback UI）；②TypeScript 类型跨边界丢失——远程模块的类型声明要通过 @module-federation/typescript 或 dts 插件同步，否则 host 端全是 any；③版本漂移——组件库 breaking change 没有构建期拦截，全靠运行时 strictVersion + 契约测试兜底；④调试链变长——sourcemap 跨构建，错误堆栈要配跨域 sourcemap 上传与拼接。

与 qiankun 的组合使用（业界现状）：qiankun 负责"应用编排"（路由、生命周期、沙箱），MF 负责"依赖复用"（主子应用把 react/antd 配成 shared 避免重复加载）——两者解决不同层的问题，不是二选一。新趋势是 webpack/Rspack 的 MF 2.0（Module Federation Runtime）吸收了应用编排能力，向"一体化"演进。`,
    keyPoints: ["remoteEntry 清单 + 运行时动态 import，应用降级为模块集合", "shared 单例协商：最高满足版本全局一份，版本不符 strictVersion 快速失败", "组件库分发是杀手场景；类型同步/远程容错/版本漂移是三大成本"],
    followUps: ["MF 与 qiankun 组合时沙箱和 shared 如何分工？", "如何实现远程模块加载失败的本地降级（fallback chunk）？"],
    favorited: false,
  },
  {
    id: "fe-275",
    nodeId: "arch-microfe",
    question: "微前端下路由如何设计？主应用路由分发、子应用路由自治、history 模式冲突分别怎么处理？",
    bigTech: true,
    answer: `结论：路由是微前端最棘手的集成点——全局只有一个地址栏，却有两个 router 实例要驱动。标准做法：主应用持有"一级路由"（按路径前缀激活子应用），子应用持有"二级路由"（自己的页面跳转），通过"激活规则 + 基础路径"划分主权。

\`\`\`ts
// 主应用：按前缀分发（qiankun 的 activeRule）
registerMicroApps([
  { name: "order", activeRule: "/order", container: "#subapp" },   // /order/** 归订单应用
  { name: "goods", activeRule: (loc) => loc.pathname.startsWith("/goods") },
]);
start();
// 当前 URL /order/detail/123 → order 应用激活，qiankun 调用其 mount

// 子应用：路由基础路径对齐
// React Router：<BrowserRouter basename="/order">
// Vue Router：createWebHistory(window.__POWERED_BY_QIANKUN__ ? "/order" : "/")
// 独立运行时 basename 为 "/"，嵌入运行时为 "/order"——一套代码两种部署

// 子应用内部跳转：用自己的 router
navigate("/detail/123");  // 实际 URL 变 /order/detail/123，仍命中 activeRule 保活
\`\`\`

主子跳转的三种情形：①子应用内部跳转——用自己的 router，URL 变化后 activeRule 仍命中自己，无感知；②子应用跳另一个子应用——不能直接用自己的 router（它只认 /order 前缀），要跳主应用路由：qiankun 下用 props 传入的 onNavigate 回调或直接 history.pushState + 手动触发 popstate（single-spa 的 navigateToUrl 就是干这个的）；③主应用跳子应用深层页面——主 router push /order/detail/123，qiankun 检测到 activeRule 命中，激活并等待子应用 mount 后由其内部 router 接管匹配 detail/123。

history 模式的冲突根源：①popstate 事件竞争——主 router 和子 router 都监听 popstate，浏览器后退一次两个 router 都响应，可能双重跳转。single-spa 的方案是"劫持 history API"：patch pushState/replaceState + 统一派发捕获，所有 router 订阅的是 single-spa 的 URL 变化通知（single-spa-router 协调）；②hash 与 history 混用——老应用用 hash 路由（/#/page），新应用用 history，切换时 URL 形态互相破坏（主应用 push /new 会把 #/page 冲掉）。迁移期强制约定：全站统一 history，老应用改造或接受"激活时 URL 重置"；③base 路径嵌套——Nginx 把整个微前端挂在 /console/ 下，主应用 basename=/console，子应用 basename 要拼 /console/order，三层路径拼接任何一层写错都是 404，用运行时注入的全局变量统一拼装。

刷新/直达链接问题：子应用路由是前端路由，直接刷新 /order/detail/123 时服务端要有该路径的 fallback（返回主应用 index.html），Nginx 配 try_files $uri /index.html；主应用 mount 子应用后，子 router 从当前 URL 解析出深层路径还原页面——这要求子应用"从任意 URL 冷启动"的能力，验收清单必备一项。

真实踩坑：①子应用 mount 后路由未同步——qiankun 是先 mount 再让子 router 匹配当前 URL，子应用若用懒加载 chunk，首屏路由匹配在 chunk 加载前执行会落空，要 mount 完成后手动 router.replace(location)；②多个子应用同时激活（single-spa 支持但少用）——两个 router 同时驱动 URL，地址栏被反复改写死循环，生产环境限制"同一时刻一个一级路由应用"；③跳转后滚动位置——主子切换时 scrollTop 未重置，用户从长列表跳到新页面发现停在中间，统一在路由切换钩子 scrollTo(0,0)；④a 标签硬跳——子应用里的 <a href="/goods"> 会整页刷新，全局拦截 a 标签点击转 router 跳转（single-spa 的 urlRerouteOnly 配置）。`,
    keyPoints: ["一级路由主应用分发（activeRule），二级路由子应用自治（basename）", "history API 被 patch 统一协调，防双 router 竞争 popstate", "子应用必须支持任意深层 URL 冷启动，Nginx fallback 到主应用"],
    followUps: ["single-spa 如何 patch history API 实现 router 协调？", "微前端间跳转如何携带大对象状态（放不进 URL 的）？"],
    favorited: false,
  },
  {
    id: "fe-276",
    nodeId: "arch-microfe",
    question: "微前端的公共依赖（React/antd/ lodash）如何避免重复加载？externals、MF shared、import map 三条路线的取舍是什么？",
    bigTech: true,
    answer: `结论：三个子应用各打一份 React 就是 3×140KB（gzip），公共依赖复用是微前端性能的生命线。三条路线：构建时外部化（externals + 全局变量）、运行时共享（MF shared）、浏览器原生模块映射（import map）。成熟度递减，标准化程度递增。

路线一：externals + UMD 全局变量（qiankun 经典搭配）

\`\`\`js
// 每个子应用 webpack 配置：React 不打进 bundle
externals: { react: "React", "react-dom": "ReactDOM", lodash: "_" }
// 主应用 index.html 先加载公共 UMD（挂 window.React）
<script src="https://cdn.example.com/react@18.2.0.umd.production.min.js"></script>
\`\`\`

简单直接、构建零侵入，但：①版本必须全局统一——三个子应用都得兼容 React 18.2，升级要全站联动（恰恰违背微前端"独立演进"的初衷）；②加载时序耦合——子应用启动前公共脚本必须就绪，串行加载阻塞首屏；③tree-shaking 失效——UMD 全量加载，lodash 用了一个函数也背 70KB。

路线二：MF shared（运行时协商，见 fe-274）——版本按 semver 协商、单例只载一份、不满足可多版本共存。代价：强绑定 webpack/Rspack 生态，vite 项目要 community 插件（@originjs/vite-plugin-federation）且共享机制实现有差异。

路线三：import map（浏览器原生）

\`\`\`html
<script type="importmap">
{
  "imports": {
    "react": "https://cdn.example.com/react@18.2.0.esm.js",
    "react-dom": "https://cdn.example.com/react-dom@18.2.0.esm.js"
  }
}
</script>
\`\`\`

浏览器原生解析 import "react" 到映射 URL——ESM 时代的外部化标准。优势：①HTTP 缓存友好（URL 带版本指纹，强缓存一年）；②ESM 保留 tree-shaking 成果；③多版本共存（scopes 字段给不同子路径映射不同版本）。现状：Chrome 89+ 支持，Safari 16.4+，生产要 SystemJS 做 polyfill 降级——这也是"SystemJS 在微前端圈回魂"的原因（single-spa 官方推荐 import map + SystemJS）。

真实项目的组合策略（我们的生产配置）：①框架层（react/react-dom/router）——import map + ESM CDN，全站统一大版本，一年升级一次；②组件库（antd/内部设计系统）——MF shared singleton，允许次版本自动浮动；③工具库（lodash/dayjs）——各应用自行打包（体积小、API 稳定，tree-shaking 后各自 3-5KB 不值得共享）；④监控兜底——打包后校验 bundle 中是否误打 react（webpack-bundle-analyzer CI 卡点），防"配置漂移"。

量化收益与成本：复用前三个应用总体积 2.1MB（gzip），复用后 1.2MB——但首屏多了 remoteEntry/公共库的往返，要用 preload + HTTP/2 多路复用摊平。别忘了度量：共享是把双刃剑，共享依赖的一次 breaking change 全站爆炸，"独立部署"的收益被"全局耦合"抵消——所以共享清单要克制，只共享"稳定到近乎基础设施"的依赖。

踩坑：①externals 后子应用的 React DevTools 检测异常（全局 React 来源不直观）；②import map 必须出现在任何 module script 之前，顺序错了静默失败；③SystemJS 与原生 ESM 混用时 import.meta.url 语义差异；④CDN 公共库要配 SRI（integrity 属性）——公共脚本被篡改全站沦陷。`,
    keyPoints: ["externals 简单但全站版本锁死；MF shared 协商灵活但绑 webpack", "import map 是 ESM 时代标准，生产配 SystemJS 降级", "共享清单要克制：只共享基础设施级依赖，工具库各打各的"],
    followUps: ["import map 的 scopes 字段如何实现按路径多版本共存？", "SRI 与 CSP 如何联防公共 CDN 脚本被篡改？"],
    favorited: false,
  },
  {
    id: "fe-277",
    nodeId: "arch-microfe",
    question: "微前端落地的工程化配套：子应用独立部署、版本管理、灰度发布、监控归因分别怎么做？",
    bigTech: true,
    answer: `结论：微前端的价值兑现靠工程化——"能独立部署"不是框架给的，是流水线给的。四大配套：注册表驱动的部署（主应用不重新发版就能上新子应用）、版本化的入口管理（子应用版本可回滚）、按应用维度的灰度（流量切分）、带应用标签的监控（错误归因到具体子应用）。

1. 独立部署与注册表：子应用产物上传 CDN（带内容 hash 路径 /order-app/1.2.3/），部署系统更新"应用注册表"（一个 JSON 配置：{ name, activeRule, entry, version }）。主应用启动时拉注册表而非硬编码——新增子应用 = 更新注册表，主应用零发版。注册表服务要有版本：配置中心的发布/回滚能力（我们用的自研配置平台，也可以用 Nacos/Apollo）。

2. 版本管理：子应用入口 URL 带版本号（entry: "https://cdn.../order-app/1.2.3/index.js"），主应用按注册表里的"当前版本"加载。回滚 = 注册表指回旧版本，秒级生效（对比巨石应用回滚要重新构建部署 20 分钟）。HTML entry 模式（qiankun 支持 entry 配 HTML URL）由 qiankun 解析 HTML 中的脚本样式清单，版本切换更原子。

3. 灰度发布：维度在"应用 × 用户群"。注册表返回按用户标签路由——灰度用户拿到 order-app@1.3.0-beta，普通用户拿 1.2.3。实现：注册表服务接 AB 实验平台，主应用拉配置时带用户 ID 哈希分桶。注意灰度期间主子兼容性契约（主应用传的 props 字段增减要向后兼容，用可选字段 + 默认值）。

4. 监控归因：错误、性能、行为数据都要打应用标签。①错误——window.onerror 捕获时判断当前激活应用（single-spa 提供 getAppStatus 或从 URL activeRule 反推），Sentry 配 release 和 tags.app；②性能——PerformanceObserver 的 resource timing 按 URL 归属应用分桶，各子应用独立的 FCP/LCP 看板；③行为——埋点 SDK 注入 appName 上下文，漏斗分析按应用切片。没有归因能力的监控等于没有监控——"页面报错率 2%" 无法行动，"order-app 在 1.3.0-beta 报错率 8%" 才能决策回滚。

真实项目的部署拓扑：主应用（React，双周发版）+ 6 个子应用（独立团队，平均每周各发 1.5 次）。注册表配置平台带审批流：子应用负责人提"版本切换申请"→ 自动灰度 5% 流量 30 分钟 → 错误率超阈值自动回切 → 全量。这套流水线让子应用发版从"跨团队协调会"变成"自助操作"，这才是微前端承诺的生产力。

反模式清单：①主应用硬编码子应用 entry——每次子应用发版都要主应用跟着发，微前端白做了；②版本用 latest 标签——缓存不可控、回滚无路径，必须语义化版本 + 内容 hash；③主子应用共享构建流水线——一个子应用构建失败全站发不出去，流水线必须按应用独立；④忽略"主应用自身也是故障源"——主应用挂了全站挂，主应用要极简（只留路由/布局/注册表拉取），业务逻辑全部下放。

成本提醒：这套配套（注册表服务、配置平台、灰度系统、归因监控）是 2-3 个工程师季度的投入。团队规模 < 20 人时，这个投入远超微前端带来的协作收益——再次回到那个判断：微前端是组织问题的技术解，不是技术升级的方向盘。`,
    keyPoints: ["注册表驱动：上新/切版本主应用零发版；回滚=注册表指回旧版", "灰度按应用×用户分桶，主子契约字段向后兼容", "监控必须带 appName 归因，否则数据不可行动"],
    followUps: ["主子应用的契约变更如何做自动化检测（契约测试）？", "子应用秒级回滚后，用户已加载到内存的旧版本如何优雅刷新？"],
    favorited: false,
  },
  // ===== 39. arch-monorepo Monorepo 工程 =====
  {
    id: "fe-278",
    nodeId: "arch-monorepo",
    question: "Monorepo 与 Multirepo 的本质权衡是什么？lerna → pnpm workspace → Turborepo/Nx 的工具链演进解决了什么问题？",
    bigTech: true,
    answer: `结论：Monorepo 的本质是"用工具复杂度换取协作效率"——原子化变更（一次 PR 同时改库和调用方）、统一版本与工具链、代码共享零发布。代价是构建规模膨胀（仓库越大构建越慢）和权限粒度变粗（所有人看到所有代码）。工具链的演进就是围绕"把代价打下去"。

权衡对比：Multirepo 下改一个组件库 API，要"发库版本 → 各应用逐个升级 → 一周内版本碎片化"；Monorepo 下是"一个 PR 改库 + 全量更新调用方 + CI 一次验证"，原子提交保证任意 commit 点全仓库可构建。但 Multirepo 的独立权限、独立 CI、仓库轻量也是真实优势——Google/Meta 用 Monorepo 是因为它们投入了专门的代码基础设施团队，不是因为它免费。

工具链三代演进：

1. lerna（2016）——Bootstrap 时代：把各包的 node_modules 互相软链（本地包 link 到一起），统一版本发布。痛点：依赖重复安装（每个包一份 node_modules）、安装慢、只解决"链接与发布"不管构建。lerna 本身已停止维护后由 Nx 团队接管，现在定位是"版本发布工具"。

2. pnpm workspace（2020+）——解决安装与磁盘：全局 store 硬链接去重（100 个包依赖同一个 lodash，磁盘只有一份）、非扁平 node_modules（根治幽灵依赖，见 fe-279）、内置 workspace 协议（workspace:* 声明本地依赖）。安装速度比 npm 快 2-3 倍，磁盘省 50%+。但 pnpm 不管"构建什么、按什么顺序构建"。

3. Turborepo/Nx（2021+）——解决构建编排：①任务图调度——turbo run build 自动按包依赖拓扑排序并行（ui 包先于 app 包构建）；②内容寻址缓存——输入（源码+依赖+环境变量）hash 作为缓存键，没变化的包直接跳过（"只构建受影响的部分"）；③远程缓存——CI 之间共享缓存，同事构建过的你直接复用。Nx 更进一步提供"依赖图可视化 + 受影响检测（affected）+ 代码生成器"，是带工程约束的全家桶。

真实数字：一个 40 包的 Monorepo，无编排时全量 CI 构建 28 分钟；Turborepo 本地缓存命中后 40 秒；远程缓存让 PR CI 平均 4 分钟（只构建受影响包）。这就是"工具复杂度"买到的东西。

选型决策：①只有"共享组件库 + 几个应用"（<10 包）——pnpm workspace 足够，Turborepo 可选；②中大型（10-100 包，多团队）——pnpm + Turborepo 是主流甜点组合（Vercel 生态），要更强的边界约束和生成器选 Nx；③超大规模（Google 级）——Bazel（内容寻址做到极致，但学习曲线陡峭，前端团队慎用）。

卡帕西视角：Monorepo 工具链的演进方向是"增量计算的精确化"——从"每次都全量"到"按内容 hash 只重算变化的"。这和 React 的 reconciliation、构建工具的 HMR 是同一个思想：声明式系统 + 精确的失效检测 = 可扩展的性能。理解这一层，工具选型就不会再纠结。`,
    keyPoints: ["Monorepo 核心收益=原子变更+统一工具链；核心成本=构建规模", "lerna 管链接发布→pnpm 管安装去重→Turborepo/Nx 管构建编排缓存", "中小规模 pnpm+Turborepo 是甜点组合"],
    followUps: ["内容寻址缓存的 hash 输入应包含哪些因子？漏掉环境变量会怎样？", "Bazel 的远端执行（remote execution）与 Turborepo 远程缓存的差异？"],
    favorited: false,
  },
  {
    id: "fe-279",
    nodeId: "arch-monorepo",
    question: "pnpm 的依赖管理机制是什么？什么是幽灵依赖（Phantom Dependency）与依赖提升（Hoisting）问题？pnpm 如何根治？",
    bigTech: true,
    answer: `结论：npm/yarn 的扁平化 node_modules 把所有依赖提升到顶层，导致代码可以 import 未在 package.json 声明的包（幽灵依赖）——这是"能用但脆弱"的定时炸弹。pnpm 用"全局 store 硬链接 + 符号链接树"的非扁平结构根治：每个包只能访问自己声明的依赖。

幽灵依赖的形成：npm v3+ 为了拍平嵌套依赖（node_modules/a/node_modules/b 变成顶层 b），把传递依赖也装到顶层。于是你的代码 import "b"（只被 a 依赖、你未声明）居然能跑——直到某天 a 升级不再依赖 b，你的代码在生产构建时突然"模块不存在"。更阴的版本：b 的版本被另一个包的依赖"顶"成了不兼容版本，运行时行为漂移。

依赖提升的次生灾害：①版本冲突时 npm 选择"提升其中一个，其余嵌套安装"——哪个被提升取决于安装顺序（npm 的不确定性），同一份 lock 文件在不同机器上可能结构不同；②多版本共存时 bundler 可能打包了错误的版本副本，React 被打两份的经典事故就是这么来的（Invalid hook call）。

pnpm 的结构（三层）：

\`\`\`
node_modules/
├── .pnpm/                          # 真实存储：所有包所有版本
│   ├── react@18.2.0/
│   │   └── node_modules/react/     # 硬链接到全局 store
│   └── lodash@4.17.21/node_modules/lodash/
├── react -> .pnpm/react@18.2.0/node_modules/react      # 符号链接：只有声明的依赖
└── lodash -> (不存在！除非你声明了 lodash)
\`\`\`

①全局 store——所有包内容按 hash 存一份（~/.pnpm-store），项目内用硬链接指向它：100 个项目装同一个 lodash，磁盘只有一份文件（这就是 pnpm 省 50% 磁盘的原因，Mac 上 clone store 更快）；②非扁平 node_modules——项目顶层 node_modules 只有 package.json 里声明的依赖（符号链接到 .pnpm），未声明的包物理上不可达——import 幽灵依赖直接报"找不到模块"，把隐性 bug 变成显性报错；③依赖内各自闭环——.pnpm/react@18.2.0/node_modules/ 里链着 react 自己的依赖，每个包看到的依赖树与它的声明严格一致。

Monorepo 加持：workspace:* 协议声明"依赖本仓库的包"，pnpm 直接符号链接本地包（不发版也能互相引用）；--filter 参数按包过滤执行命令（pnpm --filter app-a build）。

迁移真实痛点（从 npm/yarn 迁 pnpm 的坑）：①历史项目大量幽灵依赖暴露——一次性修复要批量补声明（pnpm 提供 public-hoist-pattern 把指定包提升到顶层做"缓刑"，逐步还债）；②某些库假设扁平结构——如 react-native 的 metro 打包器解析路径跟随符号链接有 bug（需要 shamefully-hoist=true 或 node-linker=hoisted 降级）；③peerDependencies 的自动安装——pnpm v8+ 默认 auto-install-peers=true，与旧行为不同可能引入意外版本；④Docker 构建要调整——layer 缓存策略改为先 COPY pnpm-lock.yaml 装依赖，store 挂载缓存大幅加速 CI。

本质上，pnpm 把 Node 的模块解析"拉回规范"：node_modules 结构严格镜像依赖声明。卡帕西视角：这是"让隐式依赖显式化"的工程胜利——系统的正确性不再依赖安装顺序这种实现细节。`,
    keyPoints: ["扁平化→传递依赖被提升→未声明可 import=幽灵依赖", "pnpm：全局 store 硬链接+符号链接树，只见到声明的依赖", "迁移要还幽灵依赖的债；public-hoist-pattern 做缓刑"],
    followUps: ["peerDependencies 在 pnpm 下的解析规则与 npm 有何不同？", "Yarn PnP 抛弃 node_modules 的思路与 pnpm 孰优？"],
    favorited: false,
  },
  {
    id: "fe-280",
    nodeId: "arch-monorepo",
    question: "Turborepo/Nx 的构建缓存与任务编排原理是什么？远程缓存如何工作？如何防止缓存污染？",
    bigTech: true,
    answer: `结论：Turbo/Nx 把构建视为"纯函数"——同样的输入（源码 + 依赖版本 + 环境变量 + 命令）必然产生同样的输出（产物 + 日志 + 退出码）。据此做两件事：内容寻址缓存（hash 输入 → 复用输出）和任务图调度（按包间依赖拓扑并行执行）。这是把"构建系统"升级成"增量计算系统"。

任务图编排：turbo run build 时，Turbo 读 turbo.json 的 pipeline 定义：

\`\`\`json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],          // ^ 表示先构建依赖包
      "outputs": ["dist/**", ".next/**"],
      "inputs": ["src/**", "package.json", "tsconfig.json"]
    },
    "test": { "dependsOn": ["build"], "outputs": [] },
    "lint": { "outputs": [] }
  }
}
\`\`\`

app-a 依赖 ui 包：构建 app-a 前必先完成 ui 的 build（^build 的拓扑含义）；无依赖关系的包并行执行（吃满 CPU 核）。

内容寻址缓存：Turbo 为每个任务计算 hash = hash(inputs 文件内容 + 依赖包 hash + 环境变量白名单 + 命令)。命中缓存则跳过执行，直接回放产物（outputs 文件恢复 + 完整日志重放，连 console.log 都和真实执行一样）。本地缓存在 .turbo/cache；远程缓存是 HTTP 服务（Vercel 托管或自建），PUT/GET 按 hash 存取 tar 包——同事（或上午的 CI）构建过的内容，你直接下载。

防缓存污染（正确性的四条军规）：①inputs 必须完备——凡影响产物的因子都要进 hash：源码、配置文件、tsconfig、甚至 .env 里被构建读取的变量（env 字段显式声明）。漏掉的后果是"改了配置却用了旧缓存"，比没缓存更糟——这种 bug 极难复现（换台机器就好）。军规：宁可选得宽（多进 hash 多重建）不可漏；②全局依赖版本——lock 文件 hash 默认参与，但全局安装的 CLI（如 graphql-codegen）版本要手动加入 globalDependencies；③非确定性任务禁缓存——依赖当前时间、随机数、网络状态的任务（如"上传产物到 CDN"）必须从缓存中排除（cache: false），否则第二个执行者会"重放"别人的上传日志以为成功；④远程缓存的信任边界——缓存服务器被投毒（恶意上传 hash 对应的假产物）会污染所有开发者，自建缓存要鉴权 + 产物签名校验，Vercel 托管缓存则继承其账号体系。

受影响检测（affected）：Nx 的 nx affected --target=build 通过 git diff（base 分支 vs HEAD）定位变更包，再沿依赖图找出"下游受影响者"，只构建这个闭包。PR 改了 ui 包的一个按钮 → 只有 ui 和引用它的 3 个 app 需要构建测试，其余 36 个包 CI 直接跳过。这是 Monorepo PR CI 从 28 分钟降到 4 分钟的另一个功臣（与缓存叠加）。

真实数字与调优：远程缓存命中率的健康线是 70%+。命中率低的常见原因：①inputs 配太宽（src/** 里混了经常变的快照文件）；②分支频繁变基（base 变化导致 git diff 范围扩大）；③环境变量泄漏进 hash（CI 每次注入不同的 BUILD_ID——这类变量必须排除或归一化）。

卡帕西视角：这和 React 的 memo、数据库的物化视图、HTTP 的 ETag 是同构的——"基于输入签名的失效检测"。构建系统的智能化本质是把这个思想贯彻到整个仓库。调试缓存问题的第一性原理：当行为异常时先问"这次执行与上次缓存时，输入真的相同吗？"——九成问题出在"影响了产物但没进 hash"的那个隐藏输入。`,
    keyPoints: ["构建=纯函数：hash(源码+依赖+env+命令)→复用产物，任务按 ^拓扑调度", "inputs 宁宽勿漏；非确定性任务 cache:false；远程缓存要鉴权防投毒", "affected=git diff 沿依赖图算闭包，PR 只构建受影响者"],
    followUps: ["如何设计一个任务既享受缓存又需要访问密钥（secret 不进 hash）？", "远程缓存的 eviction 策略应如何设计（LRU vs TTL vs 引用计数）？"],
    favorited: false,
  },
  {
    id: "fe-281",
    nodeId: "arch-monorepo",
    question: "Monorepo 中如何实现语义化的版本发布？changesets 的工作流（变更声明 → 版本计算 → 发布）解决了什么问题？",
    bigTech: true,
    answer: `结论：Monorepo 发布的难点是"N 个包互相依赖，谁的版本该涨、涨多少、谁该跟着涨"——人工决策必然出错。changesets 把版本决策前置到 PR 阶段：开发者在 PR 里提交一个"变更声明文件"（哪个包、major/minor/patch、changelog 文案），合并后工具自动计算版本、更新依赖引用、生成 CHANGELOG、发布。

\`\`\`bash
# 1. 开发者改完代码，声明变更
npx changeset
# 交互式选择：哪些包变了？patch/minor/major？写一句 changelog
# 生成 .changeset/great-pandas-sing.md：
# ---
# "@acme/ui": minor
# ---
# Button 新增 loading 属性

# 2. PR 评审：变更声明随代码一起评审（版本决策被 review！）
# 3. 合并后 CI 执行 changeset version：
#    - ui 包 1.2.3 → 1.3.0
#    - 依赖 ui 的 app-a 其 package.json 里 ui 版本引用自动更新
#    - 生成/更新 CHANGELOG.md
#    - 消耗掉 .changeset/*.md（状态清零）
# 4. changeset publish：按拓扑序发布到 npm
\`\`\`

解决的四个真问题：①版本决策滞后——lerna 时代是发布时看 commit message 猜版本（conventional commits 推断），错了已经发了；changesets 前置到编码时，开发者最清楚这次改动是不是 breaking；②依赖连锁更新——ui 升 minor，依赖它的 docs 站点和 app 该不该跟着发版？changesets 自动计算依赖图，patch 依赖引用（app 本身不发新包只更新引用，配置 updateInternalDependencies 控制）；③CHANGELOG 维护——每个包的 changelog 从变更声明聚合生成，不是发布时临时从 git log 拼凑；④快照发布（snapshot release）——PR 阶段发布 0.0.0-pr-123 版本供下游测试，验证后合并发正式版。

与 fixed/locked 模式的分歧：changesets 默认独立版本（independent）——各包版本各自演进；Babel/Angular 用的是 fixed 模式——全仓库统一版本号（任何包变化全仓库一起升）。fixed 简单可预期（"v7.24.0 的 Babel 全家桶"），independent 精准但版本矩阵复杂（app-a@2.1 依赖 ui@3.2 和 utils@1.0...）。选择看发布节奏：同步发布的生态（框架）选 fixed，异步演进的（工具集）选 independent。

真实工作流细节：①CI 守门——PR 检查必须包含变更声明（changesets 提供 status 命令，没加 .changeset 文件的 PR 挂红灯），否则"代码进了版本没进"等于没发；②预发布模式——changeset pre enter beta 进入预发布态，之后版本号带 -beta.0 后缀，供 beta 渠道验证；③私有包过滤——private: true 的包（如 app 应用）参与版本计算但不发布 npm，其内部依赖引用照样被更新；④发布失败的幂等——npm 已存在某版本则跳过该包继续（partial publish 恢复），避免"一个包失败全部重来"。

替代方案对比：①lerna version + conventional commits——从 commit 推断版本，要求全员严格写 commit 类型，推断错误的 breaking change 是灾难源；②release-please（Google）——同样基于 conventional commits 但自动生成 release PR，思路是"commit 即声明"，与 changesets 的"显式声明文件"是两种哲学；③手写脚本——10 个包以内可控，超过就要面对依赖拓扑、连锁更新、changelog 聚合这些 changesets 已经解决的问题。

卡帕西视角：changesets 的本质是"把版本这个元数据变成代码评审的对象"——版本号不再是发布时的魔法数字，而是 PR 里可读、可讨论、可回滚的声明。软件工程里一切"自动化决策"的可靠性，都不如"显式声明 + 工具执行"。`,
    keyPoints: ["变更声明随 PR 评审：版本决策前置到编码时", "自动算依赖连锁、聚合 CHANGELOG、拓扑序发布", "independent 各自演进 / fixed 全仓统一，按发布节奏选"],
    followUps: ["如何处理「忘记加 changeset」的漏网之鱼（已合并未声明）？", "fixed 模式下如何发布单个包的 hotfix？"],
    favorited: false,
  },
  {
    id: "fe-282",
    nodeId: "arch-monorepo",
    question: "Monorepo 中包之间如何共享代码？源码共享（internal package）与构建产物共享的取舍是什么？TS 项目引用与路径映射怎么配？",
    bigTech: true,
    answer: `结论：共享有两条路线——消费方直接引源码（internal package 模式，消费方构建时统一编译）或提供方先构建产物（dist）再被消费。前者开发体验丝滑（改库即时生效、类型直达源码）、构建责任在消费方；后者构建可缓存可并行、但改库要先 build 才能看到效果。现代 Monorepo 的甜点方案：开发时走源码，CI 构建缓存走产物。

\`\`\`jsonc
// 路线 A：internal package（源码直出）
// packages/ui/package.json
{
  "name": "@acme/ui",
  "exports": {
    ".": "./src/index.ts",        // 直接指向 TS 源码！
    "./button": "./src/button.tsx"
  }
  // 没有 main/module/types 指向 dist，没有 build 脚本
}
// 消费方（app）的 bundler（Vite/Next/turbopack）直接编译 node_modules 里的 TS
// 需要 transpilePackages: ["@acme/ui"]（Next.js）或 Vite 默认支持

// 路线 B：构建产物共享（经典）
{
  "name": "@acme/ui",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsup src/index.ts --format esm,cjs --dts" }
}
// 消费方 import 的是 dist——ui 改了要先 build，Turbo 缓存让重复 build 近乎免费
\`\`\`

取舍对比：①开发体验——A 改 ui 的 Button，app 里 HMR 秒级热更（没有中间构建层）；B 要 ui 侧 watch build 或手动重建，链式 watch 在多层依赖下（ui→hooks→utils）脆弱；②类型跳转——A 的 cmd+click 直达 TS 源码，改类型即时反映到消费方；B 跳到 .d.ts（只读声明），改类型要重建 d.ts；③构建编排——B 的产物可以被 Turbo 缓存和并行（ui 的 build 是独立任务）；A 没有独立构建步骤，每个消费方各自编译一遍 ui（3 个 app 编 3 次），大仓库下编译总量上升；④发布要求——对外发 npm 的包必须走 B（npm 用户不该编译你的源码）；纯内部共享的包放心用 A。

TypeScript 配套（两条路都要配好）：①paths 映射——tsconfig.base.json 里 "paths": { "@acme/ui": ["packages/ui/src/index.ts"] }，让 TS 解析直达源码，绕过 package.json exports 的解析分歧；②project references（项目引用）——每个包 tsconfig 里 composite: true + 根 tsconfig references 列表，tsc -b 按依赖拓扑增量编译，类型检查也能被缓存（大仓库全量 typecheck 5 分钟 → 增量 30 秒）；③references 与 paths 协同——references 管"编译顺序与缓存"，paths 管"模块解析位置"，两者是 TS 在 Monorepo 下的完整答案。

真实落地（我们的配置演进）：早期全部走 B——改一次组件库要 build 三次才能在 app 里看到，团队怨声载道；迁到 A + turbopack 后开发体验质变，但 40 个包的全量 CI typecheck 从 3 分钟涨到 9 分钟（每个 app 重复编译共享包）；最终形态：开发期 A（源码+paths），CI 用 project references 做增量类型检查，发 npm 的公开包保持 B 构建。——"环境分层"是解药：别指望一个模式通吃所有环节。

踩坑：①exports 指向源码后，消费方的 ESLint/测试也要能处理 node_modules 里的 TS（Jest 的 transformIgnorePatterns 要把 @acme/* 加入白名单）；②循环引用在源码模式下更容易出现（utils 引 ui、ui 引 utils，产物模式会在 build 时暴露，源码模式直接运行时炸）；③tailwind 的 content 配置要包含共享包的源码路径，否则 ui 包里的类名被 purge；④环境差异——源码模式假设消费方 bundler 能力一致，仓库里同时有 Next 14（turbopack）和老 CRA 项目时，老项目可能编不动新式语法，共享包语法要就低不就高或保留 B 产物做兼容出口。`,
    keyPoints: ["internal package 源码直出：HMR 丝滑/类型直达，但消费方重复编译", "产物共享可缓存可并行，发 npm 必须走产物", "TS 三件套：paths 解析 + project references 增量编译 + exports 环境分层"],
    followUps: ["turbopack 的 transpilePackages 与 webpack 的 externals 在源码共享中的角色？", "如何给 internal package 设计「既不发 npm 又能被 Turbo 缓存」的构建？"],
    favorited: false,
  },
  {
    id: "fe-283",
    nodeId: "arch-monorepo",
    question: "Monorepo 的包边界如何管控？如何防止跨层乱引用与循环依赖？eslint boundaries 与依赖方向约束怎么落地？",
    bigTech: true,
    answer: `结论：Monorepo 最大的隐性风险是"物理上在一个仓库，逻辑上变成一团乱麻"——任何包都能 import 任何包，三个月后依赖图变成 spaghetti。边界管控的目标：让依赖方向符合分层架构（app → features → shared → utils，绝不反向），用工具把"架构约定"变成"CI 红线"。

分层模型（推荐四层）：①apps——可部署的应用（不得被任何包依赖）；②features——业务特性包（订单/商品，平级之间禁止互引，防业务耦合）；③shared——共享业务组件/ hooks（可被 features/apps 引用，不得引用上层）；④utils/config——纯工具与配置（零业务，处于最底层）。

工具落地三板斧：

\`\`\`jsonc
// 1. Nx 的 module boundary 规则（标签化约束）
// .eslintrc.json
"@nx/enforce-module-boundaries": ["error", {
  "depConstraints": [{
    "sourceTag": "type:app",        // apps 下的包打 type:app 标签
    "onlyDependOnLibsWithTags": ["type:feature", "type:shared", "type:util"]
  }, {
    "sourceTag": "type:feature",
    "onlyDependOnLibsWithTags": ["type:shared", "type:util"]  // feature 不可引其他 feature
  }, {
    "sourceTag": "type:shared",
    "onlyDependOnLibsWithTags": ["type:util"]
  }]
}]

// 2. 通用方案：eslint-plugin-boundaries（不绑 Nx）
// 按文件路径划元素类型，同样配 allowed 依赖矩阵

// 3. 依赖健康度巡检：dependency-cruiser
// npx depcruise --validate .dependency-cruiser.js packages/
// 规则示例：no-circular（禁循环依赖）、not-to-unresolvable、no-orphans
\`\`\`

循环依赖的检测与危害：①ESM 循环引用（a 引 b、b 引 a）在打包产物里会导致"模块初始化顺序不确定"——某个包的顶层代码执行时，对方模块还是 undefined 的临时死区状态，报"Cannot access before initialization"；②Monorepo 放大此问题——包级循环（ui 引 hooks、hooks 引 ui）在 workspace 符号链接下静默成立，直到某天调整构建顺序才爆炸；③depcruise 的 no-circular 规则在 CI 上跑全量图分析，发现即失败；④解环手法——下沉共享部分到更底层包（把互相需要的类型/常量抽到 utils）、依赖注入（上层把实现传给下层）、事件解耦（用 emitter 替代直接调用）。

真实治理案例：40 包仓库的边界修复——引入 boundaries 规则首日 lint 报出 217 处违规（feature 互引 89 处、shared 反引 feature 61 处、apps 互引 12 处）。策略：①先把规则设为 warn 全量收集，按违规聚类排期；②高频违规对（order→goods 互引）用"下沉共享 domain 包"解耦；③设置 ratchet（棘轮）机制——CI 记录违规总数基线，只允许减少不允许增加（新违规 PR 挂红灯），存量逐步清偿，三个月后归零转 error 级别。

除了静态规则，还有三道防线：①CODEOWNERS 按包路径分配——跨层修改自动拉架构组 review；②包内 exports 显式声明——package.json 的 exports 字段只暴露公共 API（./internal/* 不导出），Node/打包器的 exports 解析会物理拦截深层引用（import "@acme/ui/src/internal/util" 直接报错）；③依赖图可视化（nx graph）——架构 review 时看图说话，发现"哪个包被大家乱引"（扇入过高的包要警惕变成上帝模块）。

卡帕西视角：边界规则的价值不在"限制"而在"让架构意图可执行"——写在 wiki 里的分层图三个月就过期，写在 eslint 规则里的分层每次 commit 都在执行。架构腐化的速度 = 约定的可违反程度。`,
    keyPoints: ["分层：apps→features→shared→utils，标签化 depConstraints 配 CI 红线", "exports 只暴露公共 API，物理拦截深层引用", "治理用 ratchet：存量基线只减不增，增量零容忍"],
    followUps: ["扇入过高的共享包（上帝模块）如何拆分？", "微服务架构的「数据库隔离」原则在 Monorepo 包边界上的对应物是什么？"],
    favorited: false,
  },
  {
    id: "fe-284",
    nodeId: "arch-monorepo",
    question: "Monorepo 的 CI 如何设计？全量构建与增量构建如何平衡？并行度与远程缓存命中率的调优手段有哪些？",
    bigTech: true,
    answer: `结论：Monorepo 的 CI 设计核心是"把 PR 反馈时间和主分支可靠性解耦"——PR 阶段跑增量（affected + 远程缓存，分钟级反馈），主分支/夜间跑全量（防增量逻辑的盲区漏检）。两手都要硬，只跑增量的团队终会被一次"未受影响却挂了"的事故教育。

流水线分层设计：

\`\`\`yaml
# PR 流水线（目标：<10 分钟反馈）
pr:
  steps:
    - 安装: pnpm install --frozen-lockfile           # lock 不变时 store 命中，秒级
    - 受影响检测: turbo run lint test build --filter=...[origin/main...HEAD]
      # 或 nx affected --target=build,test,lint --base=origin/main
    - 远程缓存: TURBO_TOKEN 注入，命中直接下载产物
    - 质量门禁: typecheck（project references 增量）+ 守护测试

# 主分支流水线（合并后）：增量 + 缓存回填（产物上传远程缓存供 PR 复用）
# 夜间全量流水线（兜底）：清空缓存全量构建 + 全量测试 + 依赖安全扫描
\`\`\`

为什么必须保留全量兜底：①affected 的盲区——git diff 只能看到"代码变更"，看不到"环境变更"（基础镜像升级、npm 仓库里的传递依赖发布新版本、CI 环境变量调整），这些变更影响下所有包都"未受影响"；②缓存正确性的信任——缓存回放掩盖了真实的构建错误（产物 hash 碰撞理论上存在），定期全量无缓存构建是对缓存系统的审计；③交叉影响——包 A 改了共享配置（根 tsconfig、ESLint 规则），按文件依赖图可能只算到少数包，但影响面是全仓库（这种"全局输入"要显式配置 globalDependencies 让 Turbo 全量重建）。

并行度调优：①任务级并行——Turbo/Nx 默认按 CPU 核数并行任务，CI 机器（如 4 核 runner）上 --concurrency 要实测调优（内存密集型构建开满会 OOM，webpack 构建常要限制 2-3 并发）；②机器级分片——测试任务按包分片到多台 runner（jest --shard=1/4），Turbo 的 --filter 按包列表分桶；③安装层并行——pnpm install 本身很快，但 postinstall 脚本（node-gyp 编译）要并行度控制；④Docker 层缓存——把 pnpm install 独立成一层（lock 文件不变则命中镜像层缓存），源码变更不触发重装。

远程缓存命中率优化（健康线 70%+）：①统一基础环境——构建 Docker 镜像固定 Node/pnpm 版本（Node 版本进 hash，开发者 Node 版本不一命中率暴跌）；②归一化环境变量——CI 注入的 BUILD_NUMBER、GIT_SHA 这类每次变化的变量不能进 hash（env 白名单只保留真正影响产物的，如 NODE_ENV、PUBLIC_API_URL）；③主分支回填——主分支每次合并后跑全量构建并把产物推入远程缓存，PR 基于最新 main 时命中率高；④outputs 精确化——outputs 配少了产物恢复不全（构建成功但文件缺失），配多了缓存体积膨胀下载变慢。

度量体系：①PR CI 时长 P50/P95（目标 P50 < 8min）；②缓存命中率（分本地/远程）；③affected 准确率——"PR 挂了但 affected 没跑到该包"的事故次数；④排队时长（runner 池容量规划）。我们的事故复盘：一次 affected 漏检导致主分支红了两小时——根因是共享 ESLint 配置变更未配 globalDependencies，教训写进了配置 checklist。

成本视角：远程缓存服务（自建 S3 + 签名服务或 Vercel 托管）的成本对比全量 CI 的 runner 分钟数成本——40 包仓库，远程缓存每月成本 ≈ 2 个 runner 的钱，省下的 CI 分钟数 ≈ 15 个 runner。这是 Monorepo 时代 ROI 最高的基础设施投资之一。`,
    keyPoints: ["PR 跑增量+远程缓存，主分支回填，夜间全量兜底防环境变更盲区", "全局输入（根配置）进 globalDependencies 触发全量重建", "命中率调优：统一镜像/env 白名单/主分支回填，健康线 70%"],
    followUps: ["如何设计「夜间全量失败但白天 PR 全绿」时的归因流程？", "测试分片与 Turbo 任务图如何协同（先分片再图内并行）？"],
    favorited: false,
  },
  {
    id: "fe-285",
    nodeId: "arch-monorepo",
    question: "从零落地一个 Monorepo：目录结构、包管理器、构建编排、版本发布、CI 的完整技术选型与初始化步骤是什么？",
    bigTech: true,
    answer: `结论：2026 年的主流甜点组合——pnpm workspace（包管理）+ Turborepo（构建编排）+ changesets（版本发布）+ GitHub Actions（CI）。这个组合的标准化程度意味着：新人半天上手、文档丰富、迁移成本低。以下是可以直接照抄的初始化蓝图。

\`\`\`
my-monorepo/
├── apps/
│   ├── web/                    # Next.js 主应用
│   └── admin/                  # 管理后台
├── packages/
│   ├── ui/                     # 组件库（internal package，源码直出）
│   ├── hooks/                  # 共享 hooks
│   ├── utils/                  # 纯工具（零依赖最底层）
│   ├── config-eslint/          # 共享 ESLint 配置
│   └── config-ts/              # 共享 tsconfig
├── package.json                # 根：private，只放 devDependencies 和脚本
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── .changeset/
\`\`\`

初始化步骤（顺序有讲究）：

\`\`\`bash
# 1. 根 package.json：private + 包管理器钉版本
npm init -y
# {"private": true, "packageManager": "pnpm@9.15.0", "workspaces": 不需要(pnpm 用 yaml)}

# 2. pnpm-workspace.yaml
# packages:
#   - "apps/*"
#   - "packages/*"

# 3. turbo.json：pipeline 定义
# {"pipeline": {
#   "build": {"dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"]},
#   "lint": {}, "test": {"dependsOn": ["build"]},
#   "typecheck": {"dependsOn": ["^build"]}
# }}

# 4. tsconfig.base.json + 各包 extends
# {"compilerOptions": {"strict": true, "composite": true, ...}}

# 5. 内部包声明：apps/web 的 package.json
# "dependencies": {"@acme/ui": "workspace:*", "@acme/utils": "workspace:*"}

# 6. changesets：npx changeset init，CI 配 changesets/action 自动发版

pnpm install   # 首次安装，见证符号链接树
pnpm build     # turbo 接管：拓扑并行 + 缓存
\`\`\`

关键决策点（每个都有回头路成本）：①internal package vs 构建产物——新仓库直接源码直出（exports: "./src/index.ts"），配合 transpilePackages，把"要不要构建 ui 包"的问题推迟到需要发 npm 那天；②标签（标签化边界）第一天就定——apps/ 和 packages/ 的物理隔离 + eslint boundaries 从空仓库开始配（历史违规为零时上线规则成本最低）；③版本策略——内部应用（apps）永远 private: true 不发版，库包用 changesets independent 模式；④Node 版本钉死——.nvmrc + packageManager 字段 + CI 镜像三层一致，防"我机器上能跑"；⑤守护测试前置——no-native-form-elements、依赖边界这类规则趁仓库小就上 CI，等 40 个包再补就是还债。

第一周验收清单：①clone 后 pnpm install && pnpm build 五分钟跑通（新人体验是工程质量的晴雨表）；②改 utils 包源码，web 应用 HMR 秒级热更；③turbo run build 第二次执行全量缓存命中（<10 秒）；④PR CI 只构建受影响包（改 ui 不会触发 admin 的构建）；⑤changeset 声明 → 合并 → 自动发版到 npm 全链路走通一次（哪怕发 0.0.1）。

演进路线：①30 包以内——上述组合完全够用，别过度设计；②30-80 包——加远程缓存（Vercel 或自建 S3）、依赖边界 lint、依赖图巡检（depcruise CI）；③80+ 包/多团队——评估 Nx（更强的 affected 与生成器）或 Bazel（极致增量但需专门团队），此时"Monorepo 平台"本身需要一个 owner 角色。

卡帕西视角：初始化的艺术是"把不可逆决策做对，把可逆决策推迟"——包管理器和目录结构是早期就要钉死的（迁移成本高），构建缓存和边界规则可以渐进增强。最小可用配置跑通全链路 > 一次配齐所有花哨特性。`,
    keyPoints: ["甜点组合：pnpm workspace + Turborepo + changesets + GitHub Actions", "源码直出 internal package 推迟构建决策；apps 永远 private 不发版", "验收：install 五分钟跑通/改库 HMR 秒更/二次构建全缓存命中"],
    followUps: ["什么信号出现时该从 Turborepo 迁移到 Nx/Bazel？", "Monorepo 中如何接入已有的独立仓库（存量迁移策略）？"],
    favorited: false,
  },
  {
    id: "fe-286",
    nodeId: "frontend-monitoring",
    question: "前端错误监控的三类捕获方式（window.onerror / unhandledrejection / addEventListener('error', true)）各覆盖什么场景？跨域脚本报错只拿到 \"Script error.\" 时如何还原完整堆栈？",
    bigTech: true,
    answer: `结论：三类捕获覆盖的错误类型互不重叠，缺一不可——window.onerror 抓 JS 运行时同步错误，unhandledrejection 抓未 catch 的 Promise 拒绝，addEventListener('error', true) 捕获阶段抓资源加载错误（script/img/link 的加载失败不冒泡、不触发 onerror）。生产环境必须三个都挂。

\`\`\`js
// 1. JS 运行时错误（同步 throw、引用错误等）
window.onerror = (msg, source, lineno, colno, error) => {
  report({ type: "js", msg, source, lineno, colno, stack: error?.stack });
  // 返回 true 阻止控制台默认输出（一般不用，保持 false）
};
// 等价写法：window.addEventListener("error", e => { if (e.error) ... })

// 2. Promise 未捕获拒绝（async/await 漏 catch、.then 链断尾）
window.addEventListener("unhandledrejection", (e) => {
  report({ type: "promise", reason: e.reason?.stack ?? String(e.reason) });
});

// 3. 资源加载错误（必须捕获阶段 + 第三个参数 true，因为资源 error 事件不冒泡）
window.addEventListener("error", (e) => {
  const t = e.target;
  if (t && (t.tagName === "SCRIPT" || t.tagName === "IMG" || t.tagName === "LINK")) {
    report({ type: "resource", src: t.src ?? t.href, tag: t.tagName });
  }
}, true);
\`\`\`

盲区清单（真实事故里踩过的坑）：①异步回调里的错误（setTimeout 回调 throw）onerror 能抓到，但 stack 只剩回调帧，需要错误边界或包裹上报补齐上下文；②跨域 iframe 内的错误被同源策略吞掉；③console.error 不算错误（需覆写 console 才能采集，Sentry 的 CaptureConsole 就是这么做的）；④React 组件渲染错误不会被 window.onerror 捕获（React 16+ 在自身 error boundary 链路里 throw，但 development 模式下会再抛一次到 window——生产模式依赖 ErrorBoundary 上报）；⑤Web Worker 内错误需 worker.onerror 单独挂。

跨域脚本 "Script error." 的还原：浏览器对跨域脚本的错误详情做脱敏（防信息泄漏：攻击者可通过错误信息探测第三方脚本内容）。解锁需要两步同时满足——①script 标签加 crossorigin="anonymous" 属性（让浏览器以 CORS 模式请求）；②CDN 对脚本响应头返回 Access-Control-Allow-Origin: *（或你的域名）。只加属性不配响应头，脚本直接加载失败。搞定后 onerror 就能拿到完整 message + lineno + stack。对不可控的第三方脚本（如某些广告 SDK），只能包裹 try-catch 的代理注入或用 Sentry 的 ignoreErrors 过滤掉噪音。

真实案例：某电商大促页面上线后错误率从 0.1% 飙到 2.3%，但 Sentry 里全是 "Script error." 无堆栈——排查发现运维新上的 CDN 配置丢了 CORS 响应头。修复 crossorigin + 响应头后定位到真凶：一个压缩工具把可选链 ?. 转译出错。教训：监控链路本身也要被监控（每天校验"能否收到带堆栈的测试错误"），否则监控失明比没监控更危险——你以为系统健康。`,
    keyPoints: ["onerror=同步错误 / unhandledrejection=Promise 断尾 / 捕获阶段 error=资源加载失败，三者互补", "跨域还原堆栈需 crossorigin 属性 + CDN CORS 响应头双满足", "监控本身要被监控：每日校验测试错误能否带堆栈上报"],
    followUps: ["React ErrorBoundary 与 window.onerror 的职责边界如何划分？", "如何设计错误采样率既控成本又不漏掉低频致命错误？"],
    favorited: false,
  },
  {
    id: "fe-287",
    nodeId: "frontend-monitoring",
    question: "Source Map 在生产环境还原压缩堆栈的完整链路是什么？为什么 Source Map 文件不能直接公开部署到 CDN？有哪些安全的分发方案？",
    bigTech: true,
    answer: `结论：Source Map 是"压缩后位置 ↔ 源码位置"的映射表（VLQ 编码的 mappings 字段记录行列映射，sourcesContent 内嵌源码）。还原链路：浏览器/Sentry 拿到压缩堆栈（file.min.js:1:23456）→ 拉取对应 .map 文件 → 用 source-map 库解析 mappings → 二分查找映射到（src/App.tsx:42:10）→ 结合 sourcesContent 显示源码上下文。整条链路的安全要害在于：.map 文件等于把你的源码全文公开。

完整链路拆解（以 Sentry 为例）：

\`\`\`bash
# 1. 构建时生成 map（hidden-source-map：生成 map 但产物里不写 //# sourceMappingURL 注释）
# vite.config.ts
export default { build: { sourcemap: "hidden" } }

# 2. 产物：app.a1b2c3.js（无 sourceMappingURL 注释）+ app.a1b2c3.js.map（含 mappings + sourcesContent）

# 3. 上传 map 到 Sentry（CI 里，发布前）
sentry-cli releases files v1.2.3 upload-sourcemaps ./dist \\
  --url-prefix "~/static/js" --validate

# 4. 删除本地 map，只部署 js 到 CDN
rm ./dist/**/*.map

# 5. 线上报错 → Sentry 用 release 版本号匹配已上传的 map → 服务端还原 → 展示源码级堆栈
\`\`\`

为什么不能公开部署 .map：①sourcesContent 字段默认内嵌完整源码——等于源码泄露（商业逻辑、接口地址、注释里的内部信息全暴露）；②即使关掉 sourcesContent，mappings 的结构映射也能被反推出高可读的代码结构（变量名都还在）；③真实案例：2018 年某大厂被扒出全部前端源码，起因就是 devtools 能直接下载到 .map。安全准则：map 文件的可见性必须等同于源码仓库的可见性。

安全分发四方案（按推荐度排序）：①Sentry/Bugsnag 类平台上传（最优）——CI 上传后删除本地 map，平台按 release 关联，支持权限管控与过期清理；②自建 map 服务——map 存内网 OSS，写一个带鉴权的还原接口（错误上报服务拿着堆栈去内网换源码位置），前端永远接触不到 map；③hidden-source-map + 浏览器白名单——map 部署到公司内网域名，只有办公网能访问（开发者 devtools 可用，外网 404）；④debug-id 方案（Sentry 新协议）——构建时往 js 和 map 同时注入唯一 debugId 注释，上报堆栈带 debugId，平台精确匹配 map 版本，解决"发版与上传时序不一致"的错配问题。

坑点：①sourcemap 生成模式选错——开发用 eval-cheap-module-source-map（快但映射到 loader 后代码），生产必须 hidden 或 true（完整映射），混用会导致线上堆栈还原到 webpack 包装层；②多级压缩链路（如先 esbuild 再 terser）map 链断裂，需要 source-map 的 remap 能力合并多级 map；③上 Upload 时 --url-prefix 写错（少了 ~ 或路径不对）会导致 release 关联失败，表现为 Sentry 里堆栈"部分还原"——这是最常见的配置事故，sentry-cli 的 --validate 参数能提前发现。`,
    keyPoints: ["map = 源码全文，可见性必须等同源码仓库；hidden-source-map + CI 上传 + 删除本地是正解", "还原链路：压缩位置 → VLQ mappings 二分查找 → 源码位置 + sourcesContent 上下文", "debug-id 解决发版与 map 上传的时序错配"],
    followUps: ["多级构建（esbuild→terser）的 map 链如何合并？", "不想用 Sentry，自建一个最小可用的堆栈还原服务需要哪些模块？"],
    favorited: false,
  },
  {
    id: "fe-288",
    nodeId: "frontend-monitoring",
    question: "Web Vitals 三大指标（LCP / INP / CLS）的采集原理分别是什么？基于 PerformanceObserver 手写一个采集 SDK，并说明各指标优化的第一优先级手段。",
    bigTech: true,
    answer: `结论：LCP 测"最大内容绘制何时完成"（加载体验），INP 测"交互后下一帧多久画出"（交互响应，2024 年取代 FID），CLS 测"布局意外偏移的累积量"（视觉稳定性）。三者采集都基于 PerformanceObserver，但 entry 类型与聚合逻辑完全不同——LCP 取最后一条 largest-contentful-paint，INP 取所有 event 条目的 P98，CLS 累加非用户输入引发的 layout-shift session window 峰值。

\`\`\`js
function observeVitals(report: (m: { name: string; value: number }) => void) {
  // LCP：每次更大的内容绘制都会发新条目，页面隐藏时取最后一条为准
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1];
    report({ name: "LCP", value: last.startTime });
  }).observe({ type: "largest-contentful-paint", buffered: true });

  // INP：收集所有交互延迟，页面隐藏时上报 P98
  const interactions: number[] = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries() as PerformanceEventTiming[]) {
      if (e.interactionId) interactions.push(e.duration); // duration = 输入延迟+处理+渲染
    }
  }).observe({ type: "event", durationThreshold: 16, buffered: true });
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && interactions.length) {
      interactions.sort((a, b) => a - b);
      report({ name: "INP", value: interactions[Math.floor(interactions.length * 0.98)] });
    }
  });

  // CLS：session window（偏移间隔<1s 且窗口总长<5s）内累加，取最大窗口值
  let cls = 0, sessionValue = 0, sessionStart = 0, lastShift = 0;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries() as LayoutShift[]) {
      if (e.hadRecentInput) continue; // 用户输入后 500ms 内的偏移不算
      if (e.startTime - lastShift > 1000 || e.startTime - sessionStart > 5000) {
        cls = Math.max(cls, sessionValue); sessionValue = 0; sessionStart = e.startTime;
      }
      sessionValue += e.value; lastShift = e.startTime;
    }
    cls = Math.max(cls, sessionValue);
    report({ name: "CLS", value: cls });
  }).observe({ type: "layout-shift", buffered: true });
}
\`\`\`

优化第一优先级（各指标投入产出比最高的手段）：①LCP——先拆四个子阶段定位（TTFB/资源发现延迟/资源加载时长/渲染阻塞），80% 的 LCP 问题出在"图片没预加载 + 被 JS 阻塞"：给 LCP 图加 fetchpriority="high" + preload，去掉懒加载，首屏 CSS 内联关键部分；②INP——长任务是元凶：拆分 >50ms 的同步任务（scheduler.yield / setTimeout 切片），事件回调里只做最小更新、把非紧急渲染塞进 startTransition，第三方脚本用 web worker（Partytown）挪出主线程；③CLS——90% 是三个原因：图片/视频没写 width height（或 aspect-ratio）、Web 字体 swap 闪动（用 size-adjust 字体描述符做兜底字体度量匹配）、异步广告位/推荐位插入顶开内容（预留固定高度容器）。

真实案例：某内容站 LCP 从 4.2s 优化到 1.9s 的路径——RUM 数据按子阶段拆解发现 TTFB 只占 0.6s，大头在"LCP 图（头图）等到 JS 水合后才插入 DOM"。改法极简单：头图从 React 渲染改为 SSR 直出 <img> + fetchpriority="high"，LCP 立刻掉到 2.1s。教训：先测量子阶段再动手，别凭感觉优化。CLS 的另一个经典事故：运营在首屏顶部插入"限时活动条"，全站 CLS 从 0.05 飙到 0.31 跌出 Google 搜索良好线——监控告警拦住后改为预留占位，指标回落。

坑点：①SPA 路由切换后 LCP 不再更新（largest-contentful-paint 只在首次渲染周期有意义），SPA 软导航需要框架级标记（如 Next.js 的 useReportWebVitals 配合 route change）；②INP 需要交互才有数据，首跳出用户无 INP——不能据此认为 INP 健康；③buffered: true 才能拿到 SDK 加载前已发生的条目，忘了它 SDK 就永远漏掉早期数据。`,
    keyPoints: ["LCP 取最后一条 / INP 取交互 P98 / CLS 取 session window 峰值，聚合逻辑完全不同", "LCP 先拆子阶段再优化；INP 拆长任务；CLS 先查尺寸缺失/字体/动态插入", "SDK 必须 buffered:true 且 visibilitychange 时 flush，SPA 软导航需单独处理"],
    followUps: ["LCP 的四个子阶段分别用什么 API 测量？", "INP 在 React 18 并发渲染下有哪些特有的优化手段？"],
    favorited: false,
  },
  {
    id: "fe-289",
    nodeId: "frontend-monitoring",
    question: "白屏检测有哪些主流方案？DOM 采样检测的实现与准确率优化怎么做？为什么单纯检测 #root 是否为空会大量误报？",
    bigTech: true,
    answer: `结论：白屏检测四代方案——①错误关联法（有 JS 致命错误 → 推断白屏，漏报多：接口挂了的白屏没有 JS 错误）；②关键节点检测（#root 为空 → 白屏，误报多：骨架屏也算有内容、弹窗遮罩场景误判）；③DOM 采样打分（视口取多个采样点看是否都有有效内容，主流方案）；④截图对比（headless 定期截图 + 图像差分，最准但成本高，用于核心页面巡检而非全量上报）。生产环境用 ③为主 + ①辅助归因 + ④抽检核心页。

DOM 采样实现（以原生截图思想的纯 JS 近似——多点位内容探测）：

\`\`\`js
function detectBlank(): { blank: boolean; score: number; details: string[] } {
  const SAMPLE_POINTS = 9; // 3×3 网格采样视口
  const wrapperSelectors = ["#root", "#app", "#__next"]; // 框架挂载点
  let emptyPoints = 0;
  const details: string[] = [];

  for (let i = 1; i <= SAMPLE_POINTS; i++) {
    const x = (innerWidth / 4) * ((i - 1) % 3 + 1) / 1 * 0 + (innerWidth / 4) * (((i - 1) % 3) + 0.5) * (2 / 3);
    // 简化：均匀取 9 个点
    const px = innerWidth * ((i % 3) * 0.25 + 0.25);
    const py = innerHeight * (Math.floor(i / 3) * 0.25 + 0.25);
    const el = document.elementFromPoint(px, py);
    if (!el) { emptyPoints++; details.push(\`point \${i}: null\`); continue; }
    // 有效内容判定：不是挂载点本身、不是 body/html、有可见尺寸、非全透明
    const isWrapper = wrapperSelectors.some((s) => el.matches?.(s) || el.closest?.(s) === el);
    const style = getComputedStyle(el);
    const visible = el.offsetWidth > 0 && el.offsetHeight > 0 &&
      style.visibility !== "hidden" && style.opacity !== "0";
    const hasContent = el.textContent?.trim() || el.tagName === "IMG" || el.tagName === "CANVAS" || el.tagName === "SVG";
    if ((isWrapper && !hasContent) || !visible) { emptyPoints++; details.push(\`point \${i}: \${el.tagName}\`); }
  }
  // 9 个采样点 ≥ 阈值认为白屏（阈值需按业务调，骨架屏多的站点要调高）
  const score = emptyPoints / SAMPLE_POINTS;
  return { blank: score >= 0.7, score, details };
}
// 时机：load 后延迟 3s 检测一次 + 路由切换后各检测一次，SPA 需对每个软导航重做
\`\`\`

为什么 #root 判空会大量误报：①骨架屏/loading 态——内容没加载完时 #root 里有骨架屏 DOM（非空）但用户看到的是灰块，判"非白屏"是漏报；反过来首屏 SSR 直出 + JS 水合前的瞬间检测，#root 可能短暂被判为空（误报）；②全屏弹窗/引导遮罩——采样点全被遮罩覆盖，遮罩本身有内容所以不算白屏，但业务内容其实全挂了；③微前端子应用——#root 是主应用的，子应用挂载在内部节点，主应用正常但子应用白屏时 #root 检测完全无感；④整页 iframe 业务——#root 里就一个 iframe，跨域时无法探入。所以必须"多点采样 + 有效内容判定 + 结合错误/接口状态联合判据"。

准确率优化三板斧：①联合判据——DOM 采样异常 + 同期有 JS 错误/关键接口失败 → 白屏置信度拉满立即告警；仅 DOM 采样异常 → 延迟 5s 复检一次再报（消除 loading 中间态误报）；②元素黑名单——把已知的遮罩/弹窗/骨架屏 class 加入"不算有效内容"名单，把广告 iframe 加入"不算空白"名单，名单运营化（误报案例每周复盘更新）；③基线对比——记录该页面历史正常时的采样分值分布，偏离基线才告警（不同页面的"正常形态"差异大，全局统一阈值必误报）。

真实案例：某中台系统上线白屏检测首周告警 400+ 条，复盘 85% 是误报——全部来自"全局 loading 遮罩持续时间 > 检测时机"。加入 loading 黑名单 + 5s 复检后降到日均 3 条真白屏，且全部与接口 500 关联。另一案例：SSR 项目 hydration 失败导致白屏（服务端渲染了 HTML，客户端 JS 报错后整个应用 unmount 变真空），这类白屏 #root 判空完全抓不到时序——因为检测发生在 SSR HTML 还在的时候。解法是延迟到 hydration 窗口后检测 + 监听 unhandledrejection 联合判定。`,
    keyPoints: ["三代方案：错误关联（漏）→ 关键点判空（误）→ 多点采样打分（主流），截图巡检做补充", "准确率靠联合判据（DOM+错误+接口）+ 黑名单运营 + 页面基线", "SPA 软导航、SSR 水合失败、微前端子应用是三大检测盲区"],
    followUps: ["截图对比方案的服务端架构怎么设计（成本与频次权衡）？", "白屏告警的值班降噪策略怎么做？"],
    favorited: false,
  },
  {
    id: "fe-290",
    nodeId: "frontend-monitoring",
    question: "设计一个生产级埋点 SDK：曝光/点击/页面浏览三类埋点各自的技术实现要点？如何保证数据不丢（发送可靠性）与不重（去重语义）？",
    bigTech: true,
    answer: `结论：埋点 SDK 的三大工程难题不在"怎么采集"而在"数据质量"——曝光埋点用 IntersectionObserver + 停留时长阈值 + 元素级去重；点击埋点用事件委托 + 元素路径标识（防重复绑定）；PV 在 SPA 下要拦截 history API + hashchange + replaceState。可靠性靠 sendBeacon 为主 + 批量队列 + 失败持久化重试；去重靠"事件唯一 ID + 服务端 dedup"双保险。

\`\`\`ts
class Tracker {
  private queue: object[] = [];
  private timer: number | null = null;
  private exposed = new WeakSet<Element>(); // 元素级曝光去重

  constructor(private appId: string) {
    // 页面隐藏时强制 flush（数据丢失的最高峰在页面关闭瞬间）
    addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flush(true);
    });
    addEventListener("pagehide", () => this.flush(true));
  }

  // 曝光：IO 观察 + 可见比例≥50% 且持续≥500ms 才算有效曝光
  observeExposure(el: Element, params: object) {
    if (this.exposed.has(el)) return;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.intersectionRatio >= 0.5 && !this.exposed.has(el)) {
          this.exposed.add(el); // 先标记，防停留计时与重复观察竞态
          this.track("exposure", params);
          io.unobserve(el);
        }
      }
    }, { threshold: [0.5] });
    io.observe(el);
  }

  // 点击：全局委托，元素带 data-track 属性才采集（声明式）
  initClick() {
    document.addEventListener("click", (e) => {
      const el = (e.target as Element).closest?.("[data-track]");
      if (!el) return;
      this.track("click", {
        id: el.getAttribute("data-track"),
        // 元素路径兜底：button.submit > form#login > div.page（排查定位用）
        path: this.buildPath(el),
      });
    }, { capture: true }); // capture 防业务代码 stopPropagation 截断采集
  }

  // SPA 的 PV：补丁 history 两个方法 + 监听 popstate/hashchange
  initPV() {
    const wrap = (type: "pushState" | "replaceState") => {
      const raw = history[type];
      history[type] = (...args) => {
        raw.apply(history, args);
        this.track("pv", { url: location.href, referrer: document.referrer });
      };
    };
    wrap("pushState"); wrap("replaceState");
    addEventListener("popstate", () => this.track("pv", { url: location.href }));
  }

  track(event: string, params: object) {
    this.queue.push({ event, params, ts: Date.now(), eid: crypto.randomUUID() }); // eid 服务端去重
    if (this.queue.length >= 20) this.flush();
    else if (!this.timer) this.timer = setTimeout(() => this.flush(), 5000) as unknown as number;
  }

  flush(immediate = false) {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0);
    const body = JSON.stringify({ appId: this.appId, events: batch });
    // 首选 sendBeacon（页面卸载也能发出）；不支持或失败降级 fetch keepalive；再失败持久化
    const ok = navigator.sendBeacon?.("/log", body);
    if (!ok) {
      if (immediate) fetch("/log", { method: "POST", body, keepalive: true });
      else this.persist(batch); // localStorage 暂存，下次启动重发
    }
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  private persist(batch: object[]) {
    const key = "tracker_backlog";
    const old = JSON.parse(localStorage.getItem(key) ?? "[]");
    localStorage.setItem(key, JSON.stringify([...old, ...batch].slice(-500))); // 上限防爆
  }
  private buildPath(el: Element): string {
    const parts: string[] = [];
    let cur: Element | null = el;
    while (cur && cur !== document.body) {
      parts.unshift(cur.tagName.toLowerCase() + (cur.id ? \`#\${cur.id}\` : ""));
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }
}
\`\`\`

可靠性细节（真实数据对账踩坑史）：①页面关闭丢失占全部丢失的 80%——sendBeacon 在 pagehide 里调用成功率 99%+，但 iOS Safari 对 Beacon 有 64KB 限制且后台标签页可能延迟发，超量要分批；②sendBeacon 失败无返回值反馈网络结果（它只告诉你"是否成功入队"），关键业务事件（如支付转化）要用 fetch keepalive + 响应确认，丢失后走 localStorage 补偿重发；③批量队列的 flush 阈值（20 条/5s）是成本与实时性的平衡，大促场景调小批次防单请求过大被网关截断。

去重语义：①曝光去重用"元素 × 内容版本"做 key——同一坑位内容轮换后应重新曝光（WeakSet 只解决元素级，内容变更要主动重置）；②防重放——弱网重试可能导致同一批事件发两次，每条事件带 eid（UUID），服务端 Redis SETNX 去重窗口 24h；③会话去重——PV 按 session_id（30 分钟无活动过期）聚合，刷新页面不换 session，避免把刷新统计为新访问。

真实案例：某内容产品曝光数据与广告结算数据差异 12%，对账发现三个源头：①客户端 IO threshold 配 0（元素露 1px 就算曝光） vs 广告行业标准 50%——改 threshold 后差异降到 4%；②剩余 4% 是秒开秒关用户——加入"曝光后停留 ≥500ms 才上报"降到 1.5%；③最后 1.5% 是 Android 低端机 IO 回调丢失（已知 WebView bug），接受为系统误差并写入数据字典。教训：埋点第一版上线时就要和下游对账口径对齐，"先上线再修"的代价是历史数据全部不可比。`,
    keyPoints: ["曝光=IO threshold 0.5+停留阈值+元素级去重；点击=捕获阶段委托+data-track 声明式；PV=补丁 history API", "可靠性=sendBeacon 为主+批量队列+visibilitychange 强制 flush+localStorage 补偿重试", "数据质量靠 eid 服务端去重+与下游对账口径对齐（比例/停留时长）"],
    followUps: ["曝光埋点在虚拟列表场景（元素复用）如何正确去重？", "埋点 SDK 如何做体积控制与按需加载？"],
    favorited: false,
  },
  {
    id: "fe-291",
    nodeId: "frontend-monitoring",
    question: "Sentry 的核心工作原理是什么？从错误采集、堆栈还原、聚合分组到告警通知的完整链路如何设计？release 与 sourcemap 关联的关键配置有哪些坑？",
    bigTech: true,
    answer: `结论：Sentry 本质是一条"边缘采集 → 服务端归一化 → 指纹分组 → 告警路由"的流水线。SDK 层负责无侵入劫持（重写 onerror/console/(fetch/XHR 做 breadcrumb），Transport 层负责采样与离线缓存，服务端用 stacktrace 的函数名+文件名+行号+上下文行做指纹 hash 把同一根因的错误聚合成 issue，再按告警规则（新 issue/频率突增/影响用户数阈值）路由到 Slack/钉钉。理解这条链路的价值在于：90% 的"Sentry 不好用"问题都出在链路各环节的配置错配，而不是 Sentry 本身。

\`\`\`js
Sentry.init({
  dsn: "https://xxx@o123.ingest.sentry.io/456",
  release: "web@1.4.2+a1b2c3",          // 版本标识：与 sourcemap 上传时严格一致
  environment: "production",
  sampleRate: 1.0,                       // 错误全采（错误量小）
  tracesSampleRate: 0.1,                 // 性能事务采 10%（量大）
  replaysSessionSampleRate: 0.01,        // 回放采 1%
  replaysOnErrorSampleRate: 1.0,         // 出错会话 100% 回放（关键！）
  beforeSend(event, hint) {
    // 1. 脱敏：密码/token/身份证绝不出网
    if (event.request?.data) scrubSensitive(event.request.data);
    // 2. 降噪：已知噪音直接丢弃（浏览器扩展错误、第三方脚本错误）
    if (isBrowserExtensionError(hint?.originalException)) return null;
    // 3. 富化：附加业务上下文（用户分层/AB 实验组/页面路由）
    event.tags = { ...event.tags, ab: getExperimentGroups() };
    return event;
  },
  ignoreErrors: [/ResizeObserver loop/, /Script error\.?$/], // 正则白名单
});
\`\`\`

链路逐段拆解：①采集层——SDK 通过重写 window.onerror/unhandledrejection 拿错误，通过包裹 fetch/XHR/setTimeout 记录 breadcrumb（错误发生前的用户行为轨迹：点了什么、请求了什么——复现错误的黄金线索）；②Transport 层——事件先落内存队列，支持 offline 缓存（IndexedDB）与采样率控制，beforeSend 是最后的客户端干预点；③归一化层——服务端用 stacktrace-parser 解析各浏览器不同格式的堆栈（Chrome 的 at fn (url:1:2) vs Firefox 的 fn@url:1:2 vs Safari 缺列号），统一为内部 schema；④还原层——按 event.release 查找该版本上传的 sourcemap 还原源码位置；⑤分组层——指纹默认 = hash（函数名 + 文件名 + 行号 + 源码上下文行），同一指纹归为一个 issue（可通过 fingerprint 配置自定义，比如把"所有支付接口超时"强制归一组）；⑥告警层——issue 触发规则（新建/回归/10 分钟内 >100 次）→ 通知渠道。

release 关联的坑（每一个都对应真实工单）：①release 名不一致——构建时 SENTRY_RELEASE 环境变量在 webpack DefinePlugin 里注了一份、sentry-cli 上传时用了另一份（比如一个带 git hash 一个不带），表现为 Sentry 收到错误但堆栈全是压缩后的——用 debug-id 新协议可根治（构建插件自动往产物和 map 里注入同一个 id，不依赖人肉对齐字符串）；②上传时序——先部署了 js 再上传 map，中间的窗口期错误永远还原失败（map 上传不追溯历史事件），正确顺序：构建 → 上传 map → 部署 js；③URL 前缀不匹配——上传时 --url-prefix ~/static/js 但实际加载路径是 https://cdn.x.com/static/js，~/ 前缀匹配域名归一化时容易配错，用 sentry-cli releases files ... upload-sourcemaps --validate 校验；④多产物项目——Monorepo 里多个应用共用一个 Sentry 项目，map 互相覆盖，应该按应用拆分 Sentry 项目或 release 名带应用前缀。

告警治理（防"狼来了"）：①新 issue 告警（所有新错误第一时间知道）；②阈值告警（同一 issue 5 分钟 >50 次——线上事故信号）；③回归告警（已 resolve 的 issue 在新 release 复现——发版质量信号）；④digest 聚合（低频 issue 每天一封摘要，别一条一响）。某团队踩过的坑：把"所有错误"接到钉钉群，三天后群被免打扰——监控告警的价值 = 信噪比，宁可漏报不可滥报。`,
    keyPoints: ["链路：SDK 劫持采集 → breadcrumb 行为轨迹 → 归一化 → map 还原 → 指纹分组 → 告警路由", "release 三大坑：名字不一致/上传时序错/url-prefix 错，debug-id 协议可根治", "告警价值=信噪比：新 issue+阈值突增+回归三级，digest 聚合低频"],
    followUps: ["Sentry 的 fingerprint 自定义规则在什么场景必须用？", "前端性能事务（tracing）的采样率如何按页面价值分层设计？"],
    favorited: false,
  },
  {
    id: "fe-292",
    nodeId: "frontend-monitoring",
    question: "RUM（真实用户监控）与合成监控（Synthetic）的本质差异是什么？如何设计性能指标体系与劣化告警（基线、分位数、维度下钻）？",
    bigTech: true,
    answer: `结论：RUM 采集真实用户的全部分布（长尾真实但噪声大），合成监控用固定环境主动探测（稳定可对比但覆盖不了真实长尾）。两者是互补关系：合成监控定"基线回归"（每次发版对比，防劣化上线），RUM 定"真实水位"（P75/P95 分位数看用户真实体验）。只用 RUM 会在发版评审时吵不清"到底是这次发版劣化还是流量结构变了"；只用合成监控会对低端机+弱网的真实劣化完全无感。

指标体系设计（三层）：①核心层——Web Vitals（LCP/INP/CLS）按 P75 对齐 Google 标准，这是 SEO 与体验的行业共同语言；②业务层——自定义关键节点：首屏可用时间（FMP 近似）、关键接口完成时间（performance.mark("api:list:done")）、路由切换耗时（SPA 软导航 startTransition 前后 mark）；③资源层——慢资源 TOP 榜（>3s 的 js/img/api 按 URL 聚合）、错误率、缓存命中率。上报用 PerformanceObserver + 自定义 mark，聚合在服务端按"分位数"而非均值——均值在长尾分布下毫无意义（一个 30s 的极端值能把均值拉高 10 倍，P75 才代表"大多数用户"）。

\`\`\`ts
// 分位数统计（服务端 ClickHouse 近似算法 t-digest，客户端只负责原始上报）
// 客户端上报维度设计（下钻能力的关键在维度而非指标）：
{
  metric: "LCP", value: 2340, ts: 1721...,
  dims: {
    page: "/detail",            // 页面（必须）
    release: "1.4.2",           // 版本（发版对比必须）
    device: "android-low",      // 设备分档（按内存/核数/UA 打分）
    network: "4g",              // navigator.connection.effectiveType
    geo: "cn-east",             // 地域（CDN 排查必须）
    ab: "exp101:b",             // 实验组（实验对性能的影响常被忽略）
  }
}
// 查询：P75(LCP) WHERE page='/detail' GROUP BY release → 发版回归一目了然
\`\`\`

劣化告警的基线设计（三道防线）：①发版防线（合成监控）——CI 里跑 Lighthouse/WebPageTest 对核心页面采样 N 次取中位数，与上一 release 基线对比，LCP 回退 >10% 阻塞发布（这就是"性能预算"的执法环节）；②天级防线（RUM 同比）——今日 P75 vs 昨日同期 vs 上周同期，三口径同时劣化 >15% 触发告警（单口径容易因为流量结构误报，比如周末低端机占比天然升高）；③实时防线（RUM 滑动窗口）——5 分钟窗口内指标均值 vs 过去 7 天同时段均值，偏移 >3σ（三倍标准差）触发，用于抓突发性事故（CDN 故障/接口劣化）。

维度下钻定位法（告警后 10 分钟定位的套路）：指标劣化 → 先按 release 分组（是发版引入还是线上渐变）→ 再按 geo/network 分组（是不是某 CDN 节点或运营商故障）→ 再按 device 分组（是不是只对低端机劣化——多半是包了太大 JS）→ 最后按 page 分组定位到具体页面。真实案例：某次 LCP 全站劣化 18%，release 分组无差异（排除发版），geo 分组发现集中在某省 4G 用户——最终定位是该省 CDN 节点证书过期导致回源。没有维度下钻的告警只是"告诉你疼了"，有下钻才是"告诉你哪疼"。

坑点：①指标口径漂移——SPA 软导航的 LCP 需要框架打点重新定义，否则"页面切换后 LCP 不再更新"导致新页面看起来指标很好（其实根本没采到）；②维度爆炸——dims 组合基数太大会拖垮聚合查询（user_id 这种高基数字段绝不能进 dims，进 tags 或单独存储）；③告警疲劳——阈值拍脑袋定 ±20% 必然天天误报，基线必须用历史数据统计出来（7 天同时段 ±3σ 是起步配置）；④合成监控的环境漂移——探测机性能自身变化会被误判为站点劣化，探测任务要跑"参照站点"做对照组（同时探测 google.com，两边都劣化=探测机问题）。`,
    keyPoints: ["RUM 看真实长尾（P75/P95），合成监控看发版回归（同环境对比），缺一不可", "指标用分位数不用均值；告警三道防线：CI 预算阻塞/天级同比/实时 3σ", "下钻路径：release→geo/network→device→page，10 分钟定位套路"],
    followUps: ["性能预算（performance budget）指标怎么定才既有约束力又不误伤创新？", "SPA 软导航的体验指标（如 INP 后的路由切换耗时）如何标准化采集？"],
    favorited: false,
  },
  {
    id: "fe-293",
    nodeId: "frontend-monitoring",
    question: "Session Replay（用户行为回放）的实现原理是什么？rrweb 的 DOM 快照 + 增量变更记录如何工作？隐私脱敏与性能成本控制的关键设计是什么？",
    bigTech: true,
    answer: `结论：Session Replay 不录屏（视频），而是"录 DOM"——rrweb 的方案：首次全量快照把 DOM 树序列化成带节点 id 的 JSON，之后用 MutationObserver 监听增量变更（节点增删/属性变化/文本变化），配合输入事件、滚动、鼠标位置、样式变更按时间轴记录为事件流；回放时在 iframe 里重建快照 DOM，再按时间戳回放增量事件。同等时长下数据量是视频的 1/100 量级，且可检索可脱敏。

\`\`\`
首次快照（全量序列化）：
<html id=1> → <body id=2> → <div id=3 class="card"> → "商品A"
序列化为：[{id:1,type:"Element",tag:"html"},{id:2,...},{id:3,attrs:{class:"card"}},...]

增量事件流（时间轴）：
t=0.5s  [mutation] added: <button id=47>, removed: none, attrs: [{id:3, class:"card active"}]
t=1.2s  [input] id=47 text: "用户输入..."
t=1.3s  [scroll] id=2 (0, 520)
t=1.5s  [mouse] (320, 480)  ← 鼠标轨迹 50ms 节流采样
t=2.0s  [viewport] resize 390×844

回放：iframe 重建 t=0 快照 → 按时间轴依次 apply 事件 → 用户看到"视频"
\`\`\`

rrweb 的技术要点：①快照序列化——遍历 DOM 为每个节点分配自增 id，序列化 tag/attrs/children，同时记录 CSSOM（外链样式表内容要内联进快照，否则回放时样式表已发版变了导致回放走样——这是回放失真的头号原因）；②增量监听——MutationObserver 捕获 DOM 变化，输入事件监听 input/change，鼠标用 mousemove 节流，滚动用 scroll 节流；③sandbox 回放——回放页把快照 DOM 放进 iframe + sandbox 属性，禁掉脚本执行（否则回放里的 <script> 会真的执行）、拦截表单交互与跳转。

隐私脱敏（合规红线，GDPR/个保法必查）：①输入脱敏——rrweb 的 maskAllInputs 把所有 input 值替换为 ***（密码框默认强制），更细粒度用 data-rrweb-mask 属性标记元素级脱敏（手机号/身份证字段）；②文本脱敏——maskTextSelector 对匹配选择器的文本内容整体替换（如 .user-phone 显示为 ****）；③采集前阻断——blockSelector 命中的元素完全不进快照（支付密码键盘、人脸识别区域）；④服务端二次清洗——敏感正则（手机号/卡号模式）在入库前对全文扫描替换，客户端脱敏只是第一道（客户端可被绕过，服务端清洗是兜底）。真实教训：某公司回放里泄露了用户银行卡号（前端忘记给自定义金额输入框加 mask，它不是一个 <input> 而是 contenteditable div），被罚后整改为"默认全脱敏 + 白名单放行"——隐私设计的安全默认值必须是 deny by default。

性能与成本三板斧：①采样——全量回放成本扛不住，典型策略：错误会话 100% 回放（排障价值最高）+ 普通会话 1-5% 抽样 + 关键漏斗页面（支付/注册）加权重；②数据压缩——事件流按 10s 或 200 事件切片，gzip 后上报（文本压缩率 ~90%），鼠标轨迹抽稀（50ms→200ms 精度够用数据量降 75%）；③主线程保护——MutationObserver 回调和序列化都在主线程跑，大列表场景（虚拟滚动一次增删千级节点）会卡顿，要开 worker 化序列化（rrweb 的 pack 压缩移入 worker）+ 单次 mutation 数量熔断（超过阈值放弃本帧记录，保性能优先保不了就丢回放不能丢体验）。

真实案例：某客服系统接入回放后，"用户说按钮点了没反应"类工单的平均定位时间从 40 分钟降到 5 分钟——回放直接看到用户点击时按钮被 loading 遮罩盖住（UI bug）。成本账单：DAU 50 万的站点，1% 采样 + 错误会话全量，日均回放数据 80GB（gzip 后），存储 30 天生命周期约 2.4TB，成本可接受。另一个坑：回放与 Sentry 错误关联靠 session id 打通——错误发生时能一键跳到该用户当时的回放，这个关联是回放价值最大化的关键设计，没做关联的回放只是一堆没人看的视频。`,
    keyPoints: ["录 DOM 不录屏：全量快照+MutationObserver 增量事件流，数据量约视频 1/100", "脱敏 deny by default：input 默认 mask，文本/区域选择器控制，服务端正则二次清洗兜底", "成本控制：错误会话全量+普通 1-5% 采样+gzip 切片+鼠标抽稀+worker 化序列化"],
    followUps: ["回放保真度问题（样式漂移/字体缺失/ canvas 内容）各怎么解？", "回放数据与错误监控/性能监控如何打通形成完整排障链路？"],
    favorited: false,
  },
  {
    id: "fe-294",
    nodeId: "cicd-frontend",
    question: "设计一个前端 PR 的 CI 流水线：应该包含哪些环节、顺序如何编排、如何把总时长控制在 10 分钟以内？哪些检查该阻塞合并、哪些只做提示？",
    bigTech: true,
    answer: `结论：CI 流水线的设计哲学是"快速失败 + 分层反馈"——便宜的检查放前面（秒级挂掉不浪费资源），昂贵的检查并行跑（test/build 不同 stage 并行而非串行），总时长预算 10 分钟（超过则开发者开始绕过 CI）。阻塞合并的只放"客观可判定"的检查（lint/typecheck/test/build/guard），"主观或波动"的（性能分数、覆盖率绝对值）只做评论提示。

\`\`\`yaml
# .github/workflows/ci.yml（典型编排，注意 needs 形成的并行 DAG）
jobs:
  install:                      # 阶段0：依赖安装 + 缓存（后续 job 复用）
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with: { cache: pnpm }
      - run: pnpm install --frozen-lockfile   # frozen 保证 CI 与 lockfile 一致

  static-check:                 # 阶段1：秒级静态检查（并行三件套）
    needs: install
    strategy:
      matrix: { task: [lint, typecheck, format-check] }
    steps:
      - run: pnpm \${{ matrix.task }}
      # lint: eslint --max-warnings 0（warning 也视为失败，防渐进腐化）
      # typecheck: tsc --noEmit
      # format: prettier --check（只校验不改写，改写交给 lint-staged 本地钩子）

  guard-test:                   # 阶段1b：架构守护测试（自定义规则，秒级）
    needs: install
    steps:
      - run: pnpm vitest run __tests__/no-native-form-elements.test.ts __tests__/ui-design-system-guard.test.ts
      # 防"原生 button 混进组件库"、"缺 dark: 配对"这类架构腐化

  unit-test:                    # 阶段2：单元测试（分片并行）
    needs: install
    strategy:
      matrix: { shard: [1, 2, 3, 4] }   # vitest --shard=x/4
    steps:
      - run: pnpm vitest run --shard=\${{ matrix.shard }}/4 --coverage

  build:                        # 阶段2b：构建（与 test 并行）
    needs: install
    steps:
      - run: pnpm build
      - run: pnpm size-limit    # 包体积预算检查（超预算失败）

  e2e-smoke:                    # 阶段3：E2E 冒烟（只跑核心路径 5-10 条，不是全量）
    needs: build
    steps:
      - run: pnpm playwright test --grep @smoke
\`\`\`

时长控制手段（20 分钟压到 8 分钟的实战清单）：①依赖缓存——setup-node 的 cache + pnpm store 缓存，安装从 90s → 15s；②测试分片——vitest/jest 的 shard 或 Playwright 的 shard，4 分片通常把 12 分钟测试压到 4 分钟；③构建缓存——Turborepo 远程缓存或 actions/cache 存 .next/cache，增量构建 60-80% 时间节省；④E2E 分层——PR 只跑 @smoke（10 条核心路径 3 分钟），全量 100 条放 nightly；⑤条件执行——paths-filter 让只改文档的 PR 跳过测试和构建；⑥并发取消——concurrency: { group: pr-\${{ github.event.number }}, cancel-in-progress: true }，同一 PR 新 push 自动取消旧运行（省钱又省时）。

阻塞 vs 提示的分层（这是团队协作的政治学）：①阻塞——lint 0 warning、typecheck、单测 100% 通过、构建成功、守护测试、lockfile 完整性（frozen-lockfile 失败=有人手改依赖）、包体积预算；②评论提示不阻塞——覆盖率变化（Codecov 评论 "-2.3%"）、Lighthouse 分数波动、bundle 分析报告链接；③灰度阻塞——新引入的检查规则先跑两周"只警告"期，修复存量问题后转阻塞（否则一次引入几百个历史违规永远合不了并）。某团队的教训：覆盖率硬门禁定 80% 导致开发者写大量"为覆盖而覆盖"的无断言测试，改为"覆盖率不下降"（diff coverage）后测试质量反而上升。

坑点：①CI 与本地环境不一致——Node 版本用 .nvmrc + packageManager 字段钉死，CI 镜像与本地一致；②flaky test（偶发失败）是 CI 信任的头号杀手——发现即隔离（quarantine 标签单独跑），重试机制只是止痛药不是治疗方案；③secret 泄漏——CI 日志里 echo $TOKEN 类调试语句要 code review 拦住，fork PR 默认拿不到 secrets（GitHub 默认行为，别改）；④CI 配置本身要进 review——workflow 文件改动要 CODEOWNERS 保护，防有人改 CI 跳过检查。`,
    keyPoints: ["快速失败：秒级检查前置，昂贵检查并行（test/build 分片），总预算 10 分钟", "阻塞只放客观判定项；覆盖率/性能分用评论提示；新规则先警告期再转阻塞", "时长优化：依赖缓存+测试分片+构建远程缓存+E2E 分层+同 PR 并发取消"],
    followUps: ["flaky test 的系统治理流程（发现/隔离/修复/防复发）怎么设计？", "Monorepo 中 PR 只改一个包时 CI 如何做 affected 检测？"],
    favorited: false,
  },
  {
    id: "fe-295",
    nodeId: "cicd-frontend",
    question: "前端静态资源的版本管理机制：contenthash 与 chunkhash 的区别？为什么 HTML 入口必须 no-cache 而静态资源可以 immutable 强缓存一年？灰度时新旧版本资源共存的坑有哪些？",
    bigTech: true,
    answer: `结论：现代前端缓存架构的基石是"内容寻址 + 双层缓存策略"——静态资源（js/css/img）文件名带 contenthash（内容变则文件名变），配 Cache-Control: public, max-age=31536000, immutable 让浏览器一年内零请求直接用；HTML 入口文件配 no-cache（每次协商验证）或 max-age=0，保证发版后用户立刻拿到新 HTML、新 HTML 引用新 hash 资源。这套组合让"发版即时生效"与"资源永久缓存"两个矛盾需求同时成立。

hash 三兄弟的区别（webpack 语境，概念通用）：①hash——整个构建一次一个 hash，任何文件变所有产物 hash 全变（缓存全失效，已淘汰）；②chunkhash——按 chunk 内容算，同 chunk 内任何模块变则该 chunk hash 变（问题：chunk 内联的 runtime 或 CSS 变化会牵连 JS 的 hash）；③contenthash——按文件最终内容算，只关心这个文件自身字节（最精确，现代默认）。Vite/Rollup 默认就是 contenthash 语义（[name]-[hash].js）。真实收益：改一行业务代码，vendor 库（react 等）hash 不变，老用户只下载变化的几个 KB 业务 chunk，缓存命中率 95%+。

HTML 为什么不能强缓存（发版事故的重灾区）：HTML 是资源的"引用清单"——如果 HTML 被强缓存一年，发版后用户拿到的还是旧 HTML 引用的旧 hash 资源，新功能永远不可见；更糟的是服务端如果按"HTML 里引用的资源必须存在"做清理，旧 hash 文件被删后老 HTML 直接白屏 404。正确配置：

\`\`\`nginx
# HTML：no-cache（每次都问服务端，304 省流量但保证新鲜）
location ~* \\.html$ {
  add_header Cache-Control "no-cache";   # 等价 max-age=0, must-revalidate
}
# 带 hash 的静态资源：一年强缓存 + immutable（连 304 协商都省掉）
location ~* \\.(js|css|png|jpg|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
\`\`\`

注意 immutable 的语义：告诉浏览器"这个 URL 的内容保证永不变，刷新页面也别来验证"——普通强缓存在用户按 F5 时会发协商请求，immutable 连这个都省。前提是文件名必须 contenthash 保证 URL 唯一性，否则 immutable 就是灾难（内容变了 URL 没变，用户永远拿旧文件）。

新旧版本共存（灰度/滚动发布的生死线）：发版瞬间集群里同时存在新旧两个版本的 HTML——用户 A 拿到新 HTML 引用 app.new123.js，用户 B 拿到旧 HTML 引用 app.old456.js。资源必须"只增不删"：①新资源先全量上传 CDN，再切 HTML（顺序反了=新 HTML 引用还没上传的 JS=白屏）；②旧资源保留至少一个会话周期（通常 7-30 天）再清理，防止"用户开着旧页面几天后点击触发懒加载 chunk 404"；③动态 import 的异步 chunk 是最大盲区——主包是新版本，异步 chunk 可能是旧 hash，若旧 chunk 已被删除则报错，解法：chunk 加载失败自动刷新页面（拿到新 HTML 和新引用清单）+ 旧资源延迟清理。

\`\`\`js
// 异步 chunk 404 兜底（生产必备）
window.addEventListener("error", (e) => {
  if (/Loading chunk \\d+ failed|Loading CSS chunk/.test(e.message)) {
    if (!sessionStorage.getItem("chunk_reload")) {
      sessionStorage.setItem("chunk_reload", "1"); // 防无限刷新循环
      location.reload();
    }
  }
});
\`\`\`

真实案例：某公司大促前发版，CDN 配置把 index.html 也设了一年缓存——运营后台切换了活动配置但用户端两天没变，紧急联系 CDN 厂商全网刷新才解决，之后 HTML 缓存策略进发布检查清单。另一个案例：清理脚本"删除 7 天前的旧资源"误删了还有用户会话的 hash 文件，导致大面积 chunk 404，上线 chunk_reload 兜底 + 清理窗口延长到 30 天才根治。`,
    keyPoints: ["contenthash 按文件内容定名+immutable 一年缓存；HTML no-cache 保证引用清单新鲜", "发版顺序：资源先传 CDN→再切 HTML；旧资源保留 7-30 天防懒加载 chunk 404", "chunk 404 兜底：检测加载失败自动刷新（带防循环锁）"],
    followUps: ["SSR 场景下 HTML 不再是静态文件，缓存策略怎么调整？", "Service Worker 缓存与 HTTP 缓存的优先级冲突怎么协调？"],
    favorited: false,
  },
  {
    id: "fe-296",
    nodeId: "cicd-frontend",
    question: "前端灰度发布有哪些实现方案（按用户分流 / 按比例分流 / Feature Flag）？纯静态站点没有服务端时怎么做灰度？Feature Flag 系统的工程要点是什么？",
    bigTech: true,
    answer: `结论：灰度的本质是"入口分流"——在用户拿到 HTML 的那一刻决定给他哪个版本。三条路线按控制力排序：①服务端分流（SSR/BFF 按用户 ID hash 渲染不同版本，最精确）；②边缘分流（CDN 边缘函数按 cookie/比例改写回源，静态站点可用）；③客户端分流（一个 HTML 内置双版本或远程配置，用 Feature Flag 控制显隐，成本最低但包体积代价）。Feature Flag 与前两者正交——它控制的不是"版本"而是"功能开关"，粒度更细。

\`\`\`ts
// 方案一：边缘分流（Cloudflare Worker 伪代码，静态站灰度标准方案）
export default {
  async fetch(req: Request) {
    const cookie = req.headers.get("cookie") ?? "";
    let bucket = /gray_bucket=(\\d+)/.exec(cookie)?.[1];
    if (!bucket) {
      // 首次访问：按 0-99 随机分桶，写 cookie 保持粘性（同一用户始终同版本）
      bucket = String(Math.floor(Math.random() * 100));
      return withCookie(await route(bucket), "gray_bucket=" + bucket);
    }
    return route(bucket);
  },
};
function route(bucket: string) {
  // 灰度 5%：桶号 <5 走新版本源站，其余走稳定版
  const origin = Number(bucket) < 5 ? "https://new.origin" : "https://stable.origin";
  return fetch(origin + new URL(req.url).pathname, req);
}

// 方案二：Feature Flag 客户端评估
interface Flag { key: string; enabled: boolean; rollout?: number; allowList?: string[] }
function isOn(flag: Flag, userId: string): boolean {
  if (!flag.enabled) return false;
  if (flag.allowList?.includes(userId)) return true;          // 白名单先行
  if (flag.rollout == null) return true;
  // 一致性 hash：同一用户每次评估结果稳定（不能像 Math.random 每次变）
  const h = hash(flag.key + userId) % 100;
  return h < flag.rollout;
}
\`\`\`

一致性 hash 是 Flag 系统的命门——如果用随机数评估，用户刷新一次页面功能就时有时无，必然引发客诉；用 hash(flagKey + userId) % 100 保证同一用户对同一 Flag 结果恒定，且 rollout 从 5% 调到 10% 时原来的 5% 用户仍在灰度内（单调扩大，不会让已灰度用户退出）。

Feature Flag 系统工程要点：①Flag 生命周期管理——Flag 是技术债的显性形式，每个 Flag 带 owner + 创建时间 + 预期移除日期，超过 90 天的 Flag 进周报催清理（某公司审计发现代码里 40% 的 Flag 对应的功能早已 100% 上线，分支逻辑成了死代码炸弹）；②配置下发——Flag 配置走"启动拉取 + 长轮询更新"，客户端本地缓存兜底（配置服务挂了用上次缓存，绝不能让 Flag 服务故障导致功能全灭或全开——默认值设计：新功能默认 off，核心功能 flag 挂了的 fallback 应该是 on 还是 off 要逐个评估）；③与实验平台打通——Flag 的曝光事件进埋点（isOn 评估时上报 flag_key + 结果），才能分析"开 Flag 的用户 vs 没开的"转化差异；④代码层面——Flag 判断收敛到 getFlag(key) 单点，禁止散落各处的 if (config.xxx) 直读配置，否则移除 Flag 时改不干净。

灰度发布完整流程（防事故 SOP）：内部白名单（员工 1 天）→ 1% 随机（观察核心指标 2 小时）→ 10%（半天）→ 50%（半天）→ 100%（Flag 保留一周作为回滚开关）→ 移除 Flag 代码。每个阶段设"自动熔断"：错误率或核心指标劣化超阈值自动把 rollout 调回 0（Flag 平台配告警联动），别等人工发现。

真实案例：某电商新结算页用 Flag 灰度，5% 阶段监控发现支付成功率降 0.3%（绝对值小但相对值大），自动熔断回滚后排查是新版地址组件在 iOS 12 的兼容问题——灰度 5% 挡下了估计数百万的资损。反面案例：某团队客户端灰度用"版本号比较"（新版本 App 才有新功能），结果 Web 端学这个思路用"随机刷新出不同 UI"，用户每次刷新界面都不一样，客诉爆炸后紧急下线——客户端（版本天然隔离）与 Web（每次访问都是新会话）的灰度模型完全不同，不能照抄。`,
    keyPoints: ["入口分流三层：服务端渲染分流 > 边缘 Worker 分流 > 客户端 Flag；静态站用边缘方案", "Flag 评估必须一致性 hash（粘性+单调扩大），生命周期管理防 Flag 烂尾", "灰度 SOP：白名单→1%→10%→50%→100%，每阶段自动熔断回滚"],
    followUps: ["Feature Flag 与 AB 实验平台的关系是什么（同一个系统还是两个）？", "微前端架构下主子应用的灰度如何协同（主应用灰度时子应用版本怎么锁）？"],
    favorited: false,
  },
  {
    id: "fe-297",
    nodeId: "cicd-frontend",
    question: "CDN 缓存策略实战：max-age / s-maxage / immutable / stale-while-revalidate 的分工？发版瞬间如何保证全球用户平滑拿到新版本？CDN 缓存刷新（Purge）的正确姿势是什么？",
    bigTech: true,
    answer: `结论：四个指令解决四个不同问题——max-age 控制浏览器缓存时长，s-maxage 覆盖 CDN 边缘节点的缓存时长（共享缓存专用），immutable 告诉浏览器"刷新也别来验证"（配合 contenthash 使用），stale-while-revalidate 允许边缘节点在缓存过期后先返回旧内容同时后台回源更新（用短暂的内容滞后换零回源尖峰）。发版平滑性的核心不是"刷新 CDN"而是"架构上避免需要刷新"——HTML 短缓存自然过期 + 资源 contenthash 天然新旧共存。

\`\`\`nginx
# 静态资源（带 hash）：浏览器一年 + CDN 一年 + immutable
location /static/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
# HTML 入口：浏览器每次协商（no-cache），CDN 短缓存 60s 扛源站压力
location ~* /(index\\.html|)$ {
  add_header Cache-Control "no-cache";              # 给浏览器
  # CDN 层单独配 s-maxage=60, stale-while-revalidate=300
  # 含义：CDN 缓存 60s，过期后 300s 内允许先吐旧版同时后台回源
}
# API 响应（可缓存的列表类）：浏览器不缓存，CDN 缓存 30s + swr 300s
location /api/public/ {
  add_header Cache-Control "no-cache, s-maxage=30, stale-while-revalidate=300";
}
\`\`\`

发版平滑的三层机制（按可靠性排序）：①contenthash 架构（根治）——资源新旧共存不需要任何刷新，HTML 的 60s CDN 缓存意味着发版后全球最多 60s 收敛（用户拿到新 HTML → 引用新 hash 资源 → CDN 未命中回源拿到新文件）；②主动预热——发版后脚本立即请求核心 URL 列表（含各区域 POP 节点探测），让边缘节点提前回源拉新文件，把"第一个用户触发回源的慢请求"消灭在监控前；③Purge 兜底——只对"必须立即生效且被长缓存"的资源用（如配错的缓存头、紧急安全修复），Purge 是手术刀不是常规武器。

Purge 的正确姿势（用错的代价是源站被打爆）：①按 URL 精确 Purge 优先，目录/通配符 Purge 是双刃剑——purge /static/* 会导致百万级 URL 同时回源（缓存击穿风暴），源站 QPS 瞬间放大百倍；②Purge 后立刻预热——先 purge 再马上用脚本请求一遍让 CDN 重新回源拉取，避免用户流量成为第一批回源请求；③软 Purge（soft purge）——部分 CDN 支持"标记过期但继续服务旧内容直到新内容拉取完成"（本质是服务端版 stale-while-revalidate），比硬删除安全；④Purge 传播延迟——全球数百个 POP 节点的 Purge 指令传播需要数秒到数分钟，"Purge 完立刻验证"要用多地域探测节点，别只测你本地。

真实案例三连：①某公司发版后客服炸锅"界面没变"——排查是 HTML 被某运营商透明缓存（非 CDN 的 HTTP 代理）缓存了 2 小时，这种缓存不受你的响应头控制（违规实现），终极解法：HTML 加版本号查询串兜底（/?v=1.4.2 只在故障时人工切换）+ 重要发布走双域名切换；②紧急修复一个 XSS 漏洞，Purge 了全部 JS——源站带宽瞬间打满 10G 触发限流，正确做法是只 Purge 受影响的一个 chunk（contenthash 架构下漏洞文件天然只有一两个）；③stale-while-revalidate 救场：某次源站宕机 40 分钟，因为 CDN 配置了 swr 300s + 长 stale-if-error，边缘节点持续用旧内容服务，全站用户无感知——swr 不只是性能优化，更是可用性保险。`,
    keyPoints: ["max-age=浏览器 / s-maxage=CDN / immutable=免验证 / swr=先旧后新后台更新，各司其职", "发版平滑靠 contenthash 架构+HTML 短缓存收敛，Purge 只是兜底手段", "Purge 三原则：精确 URL 优先、purge 后立刻预热、用 soft purge 防击穿风暴"],
    followUps: ["stale-if-error 与 stale-while-revalidate 的区别和组合用法？", "多 CDN 厂商容灾架构下缓存策略如何统一？"],
    favorited: false,
  },
  {
    id: "fe-298",
    nodeId: "cicd-frontend",
    question: "前端发布回滚策略：纯静态站点如何实现秒级回滚？版本目录保留、HTML 入口切换、CDN 回源切换三种方案的差异？微前端场景下主子应用如何独立回滚？",
    bigTech: true,
    answer: `结论：回滚速度的本质取决于"回滚动作改了什么"——改文件内容（重新构建部署旧代码）是分钟级且依赖 CI 状态；改入口指向（把 index.html 换回旧版本）是秒级且不依赖构建。所以现代前端架构把"版本保留"做成一等公民：每次发布的完整产物按版本目录保留 N 份，回滚 = 把入口软链/配置指回旧版本，把"重新构建"从回滚路径上彻底剔除。

\`\`\`
三种方案对比：

方案 A：版本目录 + 入口切换（推荐）
/releases/
  ├── v1.4.0/  (index.html + assets/*)
  ├── v1.4.1/  (index.html + assets/*)
  └── v1.4.2/  (index.html + assets/*)   ← 当前
回滚动作：对象存储/CDN 回源配置从 v1.4.2 切到 v1.4.1（或 nginx 软链切换）
耗时：秒级    依赖：只需存储服务可用

方案 B：HTML 覆盖式（简单项目）
index.html 每次发布覆盖，assets/ 按 hash 累积（contenthash 天然新旧共存）
回滚动作：从版本管理系统取回旧 index.html 重新上传 + Purge CDN
耗时：分钟级（受 Purge 传播延迟影响）  风险：回滚的是"引用清单"，资产还在

方案 C：双活切换（蓝绿）
blue.example.com / green.example.com 两套完整环境，DNS 或 LB 切换
耗时：秒级   成本：双倍基础设施   适用：超高可用核心站
\`\`\`

方案 A 的工程细节（为什么是主流）：①assets 跨版本共享——contenthash 让不同版本间相同内容的文件天然同名，版本目录可以用硬链接/去重存储，保留 20 个版本的存储成本远低于想象（通常只增 10-20%）；②切换动作原子化——用对象存储的"入口文件复制"（把 v1.4.1/index.html 复制为根 index.html）或 CDN 的"回源路径改写规则"切换，这两个都是单操作，不存在"切一半"的中间态；③自动化——发布系统记录版本时间线，回滚按钮 = 选版本 + 执行切换 + 验证探测（自动请求首页校验版本标识 meta 标签），全程 30 秒内完成。

微前端独立回滚（复杂度上一个台阶）：主应用通过"子应用清单"（manifest）决定加载每个子应用的哪个版本——回滚单元从"整个站"细化为"单个子应用"。正确架构：子应用清单存配置中心（如 {"subapp-order": "1.3.2", "subapp-user": "2.1.0"}），主应用启动时拉取。回滚子应用 = 配置中心把 subapp-order 指回 1.3.1 + 主应用侧短缓存过期，其他子应用完全不动。坑点：①主子应用有隐式协议耦合（主应用的通信 SDK 升级到 2.0，子应用 1.3.1 用的是 1.0 协议）——回滚子应用前必须确认协议兼容矩阵， manifest 里要声明每个版本依赖的宿主能力版本；②共享依赖版本锁定（主应用通过 import map 提供 react@18，回滚子应用到依赖 react@17 的旧版本会导致两个 React 实例共存报错）——子应用版本的依赖约束也要进 manifest 做兼容性校验；③回滚的爆炸半径测试——每次发布记录"可回滚窗口"（本次发布改了哪些协议/依赖，决定了能安全回滚到哪个历史版本）。

真实案例：某金融站大促期间新版本导致支付页样式错乱，值班同学用版本目录切换 18 秒回滚——同一天另一团队用"git revert + 重新跑 CI 部署"回滚他们的后台系统，花了 23 分钟（CI 排队 8 分钟）。教训：回滚路径上每多一个依赖（CI 可用性、构建缓存、排队），MTTR 就不可控一分。回滚方案要定期演练（每月一次"回滚消防演习"），没演练过的回滚方案等于没有方案——某公司真出事时发现"版本保留脚本"三个月前就坏了，20 个版本目录里 19 个是空壳。`,
    keyPoints: ["回滚速度=改入口指向（秒级）>改文件内容（分钟级）；版本目录保留让回滚不依赖 CI", "contenthash 让多版本 assets 去重共存，保留 20 版成本极低", "微前端回滚=配置中心改 manifest 版本指向；协议兼容矩阵与共享依赖锁定是前置条件"],
    followUps: ["回滚后用户已加载的新版本页面（懒加载 chunk 引用已删资源）如何兜底？", "数据库变更参与的发版如何设计可回滚性（前向兼容的 schema 演进）？"],
    favorited: false,
  },
  {
    id: "fe-299",
    nodeId: "cicd-frontend",
    question: "CI 构建从 20 分钟优化到 3 分钟的系统方法论：如何定位瓶颈（度量先行），以及缓存、并行、增量、依赖瘦身四类手段的优先级与预期收益？",
    bigTech: true,
    answer: `结论：构建优化第一原则——先度量再动手，80% 的构建时间通常花在 20% 的环节，凭感觉优化（上来就换 esbuild）经常事倍功半。方法论四步：①给流水线每个阶段打耗时标签（install/lint/typecheck/test/build/deploy 分开统计）；②构建工具内部用 profiler（webpack 的 speed-measure-webpack-plugin、vite --profile）定位到 loader/plugin 级；③按"消除 > 缓存 > 并行 > 换工具"的优先级动手；④把构建时长本身做成监控指标（趋势劣化告警），防优化成果被日常提交蚕食。

\`\`\`bash
# 度量示例（GitHub Actions 各 step 自带耗时，汇总到看板）
# webpack 内部定位：
npx webpack --profile --json > stats.json && npx webpack-bundle-analyzer stats.json
# 或 speed-measure-webpack-plugin 直接输出每个 loader/plugin 耗时：
#  Typical output:
#   babel-loader: 312s  ← 大头！
#   ts-loader (transpileOnly: false): 188s  ← 类型检查混在构建里
#   TerserPlugin: 95s
#   css-loader+postcss: 76s
\`\`\`

四类手段按优先级（预期收益基于真实项目数据）：①消除不必要的工作（收益 30-50%，成本最低）——typecheck 从构建剥离（ts-loader 开 transpileOnly，类型检查交给独立 CI job 并行跑，构建不再等它）；babel 换 swc/esbuild（同一件事快 20 倍，这不是换工具是消除冗余转译层）；移除被遗忘的 plugin（某项目发现一个 2019 年加的 BundleAnalyzerPlugin 每次构建都在跑，白送 40s）；②缓存（收益 40-70% 对增量构建）——依赖层缓存（pnpm store + lockfile hash 做 key，安装 90s→10s）；构建层缓存（Turborepo 远程缓存或 webpack filesystem cache，未变更包构建直接命中 0s）；测试缓存（vitest 只跑变更相关测试）；③并行（收益 50-75% 对可拆分任务）——test 按 shard 分 4 片、lint/typecheck/test/build 四 job 并行、Terser 多进程（parallel: true 默认开）；④换工具/架构（收益不确定，成本最高）——webpack→Vite（dev 10 倍，build 2-3 倍）、单仓→Turborepo 编排（多包拓扑并行）。

真实优化案例（某中后台 Monorepo，20min → 3min 清单）：起点分析——install 2min、lint+typecheck 4min（串行）、test 8min（单线程）、build 6min。优化动作按序：①install 加 pnpm 缓存 → 20s（-100s）；②lint/typecheck 拆成独立 job 与 test 并行 → 有效时长归零（-4min）；③test 4 分片 + 删除 3 个 flaky 后重跑率归零 → 2.5min（-5.5min）；④build 接 Turborepo 远程缓存（命中率 85%）+ babel→swc → 1min（-5min）；⑤加条件执行（docs-only PR 全跳过）。最终 P50 构建 2min40s。关键洞察：最大的单项收益来自"test 分片"和"远程缓存"，而这两件事都不需要改业务代码——构建优化的高杠杆区几乎都在工程配置层。

防劣化机制（优化成果一周就回潮是常态）：①构建时长进监控——每次 CI 记录各阶段耗时到时序数据库，周环比劣化 >20% 告警；②依赖添加评审——新依赖必须说明理由（bundle size bot 评论 +X KB 是基本配置），依赖数量增长是构建变慢的慢性毒药；③定期"构建审计"——每季度跑一次全量无缓存构建（缓存会掩盖结构性劣化），对比基线。卡帕西视角：构建时长是一个系统的"代谢率"指标——代谢变慢意味着系统复杂度在失控，优化的本质不是让构建变快，而是逼系统保持简单。`,
    keyPoints: ["度量先行：阶段耗时看板+profiler 定位 loader 级瓶颈，先找 80/20 再动手", "优先级：消除冗余工作 > 缓存 > 并行 > 换工具；transpileOnly 剥离 typecheck 是经典第一刀", "防劣化：构建时长趋势告警+依赖添加评审+季度无缓存审计"],
    followUps: ["webpack filesystem cache 与 Turborepo 远程缓存的适用边界？", "测试分片后总时长被最慢分片拖住（长尾分片）怎么均衡？"],
    favorited: false,
  },
  {
    id: "fe-300",
    nodeId: "cicd-frontend",
    question: "前端多环境配置管理：构建时注入（环境变量编译进包）与运行时注入（config.json / window.__CONFIG__）的本质差异？为什么\"一次构建，多处部署\"是发布工程的最佳实践？密钥泄露的边界在哪里？",
    bigTech: true,
    answer: `结论：构建时注入把环境差异编译进产物（每个环境一份包），运行时注入产物唯一、环境差异在启动时加载（一份包走天下）。后者是最佳实践，因为它把"构建产物"与"部署环境"解耦——你在 staging 验证过的那一份字节，就是上生产的那一份字节（哈希值都一样），消除了"staging 好的生产挂了"的一个完整故障类别（构建机环境漂移、环境变量打错）。

\`\`\`ts
// ❌ 构建时注入（Vite/webpack 通病）
// .env.production: VITE_API_URL=https://api.prod.com
const api = import.meta.env.VITE_API_URL; // 编译时被字符串替换，产物与 env 绑定
// 问题：staging 验证的包 ≠ 生产的包；紧急切环境要重新构建 20 分钟

// ✅ 运行时注入方案一：config.json（推荐，静态站通用）
// public/config.json（不进构建，部署时由运维/启动脚本生成）
// { "API_URL": "https://api.prod.com", "SENTRY_DSN": "...", "FEATURE_NEW_CHECKOUT": true }
// index.html 里同步阻塞加载（或应用启动时 await fetch）：
async function bootstrap() {
  const config = await fetch("/config.json?v=" + Date.now()).then((r) => r.json());
  (window as any).__CONFIG__ = config; // 挂全局，业务代码统一从 Config 模块读
  const { createApp } = await import("./main");
  createApp(config).mount("#root");
}

// ✅ 运行时注入方案二：HTML 模板注入（有服务端时）
// 服务端渲染 index.html 时把 <script>window.__CONFIG__ = {...}</script> 内联进去
// 优势：零额外请求；劣势：需要服务端参与
\`\`\`

运行时注入的工程细节：①config.json 必须 no-cache（每次协商），且建议加 ?v= 版本参数防运营商透明缓存；②启动时序——config 加载失败要有兜底（用打包时的默认配置 + 错误上报，绝不能白屏无提示）；③类型安全——Config 定义 TS 接口 + 启动时 zod 校验（运维写错类型立刻报错而不是运行到一半崩）；④与 K8s 集成——ConfigMap 挂载为 config.json 文件，改配置 = 更新 ConfigMap + 重启 Pod（不用重新构建镜像），这是云原生前端的标准姿势。

密钥边界（高频面试陷阱）：前端代码里的所有"密钥"都是公开的——VITE_/NEXT_PUBLIC_ 前缀的环境变量会被编译进产物，任何用户都能在 devtools 里看到。所以：①第三方服务的"公开 key"（如 Google Maps browser key、Sentry DSN）可以放，这些 key 设计上就是公开的，安全靠服务端域名校验/配额限制；②任何能写数据/调内部 API/访问用户数据的密钥（如 AWS SecretKey、内部 API token、数据库连接串）绝不能进前端产物，必须放 BFF/服务端，前端只持有用户会话凭证；③真实事故：某团队把 Algolia 的 Admin API Key 写进 .env.production 编译上线，被爬虫扫到后索引数据被恶意清空——正确做法是用 Search-Only Key（公开安全）+ 服务端代理管理操作。自检清单：CI 加一道"产物扫描"（grep 常见密钥正则模式，如 AKIA[0-9A-Z]{16} 是 AWS AccessKey 模式），泄密事故防在构建阶段。

"一次构建多处部署"的反模式识别：如果你发现自己在为每个环境跑 npm run build:xxx，或者 Dockerfile 里写 ARG ENV=staging，那就是构建时注入的味道——迁移路径：先把所有环境变量收敛到一个 Config 模块（业务代码不许直接读 import.meta.env），再把 Config 模块的实现从编译时换成运行时 fetch，最后删掉各环境的构建脚本。某团队迁移后的收益：发版流水线从"每个环境构建 3 次共 45 分钟"变成"构建 1 次 15 分钟 + 部署 3 次各 2 分钟"，且 staging→prod 的"环境差异导致的事故"归零。`,
    keyPoints: ["运行时注入（config.json/window.__CONFIG__）实现一份产物多环境部署，消除构建环境漂移事故类", "前端无秘密：产物内 key 全公开，管理类密钥必须放 BFF，CI 加产物密钥扫描", "迁移路径：收敛 Config 模块→运行时 fetch 替换编译时→删除多环境构建脚本"],
    followUps: ["SSR/Next.js 场景下运行时配置与 SSR 水合的一致性问题怎么处理？", "config.json 的版本灰度（不同用户拿到不同配置）怎么做？"],
    favorited: false,
  },
  {
    id: "fe-301",
    nodeId: "cicd-frontend",
    question: "质量门禁体系：如何用自定义 ESLint 规则、依赖边界检查、包体积预算把架构规范固化进 CI，防止架构腐化？新规则引入存量代码时的落地策略是什么？",
    bigTech: true,
    answer: `结论：架构腐化的本质是"规范靠口口相传，违反零成本"——质量门禁的核心思想是把每条架构规则翻译成可自动执行的检查（lint 规则/测试/CI 脚本），让违反规则在 PR 阶段就失败。规则没有测试守护等于建议，门禁没有 CI 阻塞等于装饰。三类门禁覆盖三个腐化方向：自定义 lint 规则管代码写法、依赖边界管模块关系、体积预算管产物质量。

\`\`\`js
// 一、自定义 ESLint 规则（管写法）示例：禁止在 components/ui/ 外使用原生表单元素
// eslint-rules/no-native-form-elements.js
module.exports = {
  create(context) {
    const filename = context.getFilename();
    if (filename.includes("components/ui/")) return {}; // 组件库内部豁免
    const BANNED = new Set(["input", "select", "textarea", "button"]);
    return {
      JSXOpeningElement(node) {
        if (node.name.type === "JSXIdentifier" && BANNED.has(node.name.name)) {
          context.report({
            node,
            message: \`禁止原生 <\${node.name.name}>，请使用 @/components/ui 的统一组件\`,
          });
        }
      },
    };
  },
};

// 二、依赖边界检查（管模块关系）：eslint-plugin-boundaries 或 dependency-cruiser
// .dependency-cruiser.js：领域层不许依赖基础设施层，app 不许 import 其他 app
module.exports = {
  forbidden: [
    { name: "no-cross-app-import",
      from: { path: "^apps/([^/]+)/" },
      to:   { path: "^apps/(?!\\1)[^/]+/" },
      comment: "app 之间禁止直接 import，共享代码下沉到 packages/" },
    { name: "no-domain-to-infra",
      from: { path: "^src/domain/" },
      to:   { path: "^src/infra/" },
      comment: "领域层保持纯净，基础设施通过接口注入" },
  ],
};

// 三、包体积预算（管产物）：size-limit
// .size-limit.json
// [{ "path": "dist/assets/index-*.js", "limit": "150 KB" },   ← 首屏 JS 预算
//  { "path": "dist/assets/vendor-*.js", "limit": "300 KB" }]  ← vendor 预算
// CI 中 size-limit 超限即失败，PR 评论展示体积 diff
\`\`\`

存量代码落地策略（直接上新规则 = 几百个历史违规 = 永远合不了并）：①基线豁免法——lint 用 eslint-baseline 或把存量违规逐一加 eslint-disable-next-line + TODO 注释（带清理截止日期），新增代码立即受约束，存量按排期消化；②警告期过渡——规则先设 warn 跑 2-4 周，团队周报公示违规数趋势（向下的曲线是最好的推进器），归零或接近零后转 error 阻塞；③增量检查法——只对 PR 变更的文件行做检查（lint-staged + betterer），"你碰过的代码必须合规，没碰的暂时不管"，类似"军营规则：离开营地时比来时更干净"；④守护测试代替全量扫描——把规则写成 vitest 单测（读源码文件扫描正则），与单测一起跑，天然享受测试分片和缓存。

防绕过机制（门禁最大的敌人是"聪明人"）：①eslint-disable 注释要审批——配 eslint-plugin-eslint-comments 要求 disable 必须带理由注释（--report-unused-disable-directives 清理失效 disable）；②CI 环境一致性——lint 结果本地与 CI 必须一致（版本钉死 + .eslintcache 不进 git 防状态污染），"我本地过了"不是绕过 CI 失败的理由；③CODEOWNERS 保护门禁配置本身——.eslintrc、dependency-cruiser 配置、CI workflow 的修改需要架构组 owner 批准；④定期审计例外——每季度 review 所有 baseline/disable 清单，防止"临时豁免"变成永久法外之地。

真实案例：本项目（devpath-ai）就是这套体系的实践者——no-native-form-elements.test.ts 和 ui-design-system-guard.test.ts 两个守护测试把"统一组件库"和"暗色配对"两条规范固化进 CI，任何违反直接 CI red，规则从此不再依赖 review 时的肉眼。另一个经典案例：某公司用 dependency-cruiser 拦住了一次"新人从业务代码直接 import 数据库 SDK"的 PR（绕过了 BFF 层）——门禁的价值在拦截"少数人少数时刻的危险操作"，而不是给大多数人的日常添堵。度量门禁健康度的指标：拦截次数（太少=规则可能太松或没人写代码）、绕过次数（disable 增长趋势）、误报率（误报高的规则会被团队恨屋及乌，必须快速修）。`,
    keyPoints: ["三类门禁：自定义 lint 管写法 / dependency-cruiser 管模块边界 / size-limit 管产物体积", "存量落地：基线豁免+警告期+增量检查（军营规则），别指望一次清零历史违规", "防绕过：disable 要带理由、门禁配置 CODEOWNERS 保护、季度审计例外清单"],
    followUps: ["如何度量门禁的 ROI（拦截的缺陷 vs 增加的开发摩擦）？", "AI 编程助手时代的门禁设计有什么新变化（机器生成代码更需要护栏）？"],
    favorited: false,
  },
  {
    id: "fe-302",
    nodeId: "node-bff",
    question: "Node.js 事件循环与浏览器事件循环的本质差异是什么？timers/poll/check 各阶段的执行顺序，以及 process.nextTick 与 setImmediate 的经典先后问题？为什么 Node 不适合 CPU 密集任务？",
    bigTech: true,
    answer: `结论：浏览器事件循环是"宏任务/微任务"两级模型，Node（基于 libuv）是"六阶段流水线"模型——timers（setTimeout/setInterval 回调）→ pending callbacks（系统级回调）→ idle/prepare（内部用）→ poll（取新 I/O 事件并执行回调，核心阶段）→ check（setImmediate）→ close callbacks（socket.on('close')）。微任务（Promise.then）在每个阶段之间清空，process.nextTick 优先级最高（当前阶段结束后立即执行，先于 Promise）。

\`\`\`js
// 经典顺序题（Node 11+ 与浏览器对齐后的行为）
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
// 主模块内执行：顺序不定！取决于事件循环进入时 poll 阶段是否已到 1ms
// 但在 I/O 回调内：immediate 永远先于 timeout（poll 之后必进 check）

const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  // 输出恒为：immediate → timeout（poll 阶段完成后下一站是 check）
});

// nextTick 是"插队王"：每阶段结束后最先清空
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
// 输出：nextTick → promise → immediate
\`\`\`

Node 11 的重要变更：此前 setTimeout(fn, 0) 在一个 timers 阶段内只执行一次回调就去看微任务，11 之后改为与浏览器一致——每执行一个宏任务回调就清空微任务队列。这就是为什么老面经里"Node 和浏览器输出顺序不同"的题现在答案趋于一致，面试要说出版本语境。

为什么 Node 不适合 CPU 密集：libuv 的线程池（默认 4 线程）只用于文件 I/O、DNS、crypto 等少数场景，JS 主线程只有一条——一段 while(true) 或 JSON.parse(超大对象) 会阻塞整个事件循环，所有在线请求全部卡住（p99 延迟爆炸但 CPU 只有一个核在烧）。解法三板斧：①cpu 密集任务扔 worker_threads（真线程，共享内存用 SharedArrayBuffer）；②计算下沉到原生 addon 或独立微服务（Go/Rust）；③必须主线程算的就切片（setImmediate 递归分片，让事件循环有机会处理请求）。真实案例：某 BFF 在请求链路里做全量日志的正则敏感词过滤，一个灾难性回溯正则把事件循环卡了 800ms，期间 4000 个并发请求全部超时——排查工具是 clinic doctor 的 event loop delay 曲线。教训：Node 服务的代码评审要把"主线程同步耗时"当作和"数据库慢查询"同级的事故隐患。`,
    keyPoints: ["Node 六阶段流水线 vs 浏览器宏微任务两级；微任务每阶段间清空，nextTick 最优先", "I/O 回调内 setImmediate 恒先于 setTimeout(0)；主模块内顺序不定", "CPU 密集阻塞整个事件循环（所有请求受害），解法：worker_threads/下沉/分片"],
    followUps: ["libuv 线程池处理哪些操作？UV_THREADPOOL_SIZE 调大的收益与代价？", "AsyncLocalStorage 在 BFF 链路追踪中的实现原理与性能损耗？"],
    favorited: false,
  },
  {
    id: "fe-303",
    nodeId: "node-bff",
    question: "BFF（Backend for Frontend）层的核心职责是什么？API 聚合、协议转换、鉴权透传、字段裁剪分别解决了前端的哪些具体痛点？什么情况下不该引入 BFF？",
    bigTech: true,
    answer: `结论：BFF 的本质是"为特定前端（Web/iOS/Android）定制的服务层"，把通用微服务的数据按前端需求组装好。它解决的核心矛盾：微服务架构下后端接口是"领域导向"的（用户服务/订单服务/商品服务），而前端页面是"场景导向"的（一个详情页要调 5 个服务的数据）——没有 BFF 时前端被迫做 N 次串行请求 + 自己拼装数据 + 处理 N 种错误形态，这在移动端弱网环境下是体验灾难。

四大职责对应的痛点：①API 聚合——前端 1 次请求拿全页面数据，BFF 内部并行调用多个微服务（服务端间是内网低延迟，比客户端多次公网往返快一个量级），还省掉了移动端的 TCP/TLS 握手成本；②协议转换——后端给的是 gRPC/Thrift/内部 RPC，前端只能吃 HTTP+JSON；或者后端返回的是 Protobuf 二进制，BFF 转成 JSON 并按需降级字段精度；③鉴权透传与收敛——前端只和 BFF 鉴权（cookie/session），BFF 用服务间凭证（mTLS/内部 token）调下游，前端永远接触不到内部系统的鉴权细节，安全边界清晰；④字段裁剪——后端通用接口返回 200 个字段，列表页只要 5 个，BFF 裁剪后传输体积降 90%（弱网救命），顺带解决了"后端接口一发版前端就崩"的耦合（BFF 做了字段映射，后端加字段不影响前端）。

\`\`\`ts
// 典型 BFF 聚合端点（Node + 并行编排）
app.get("/api/page/product-detail", async (req, res) => {
  const { id } = req.query;
  // 并行编排 + 独立容错：核心数据挂了整体失败，边缘数据挂了降级 null
  const [product, price, stock, recommend, commentSummary] = await Promise.all([
    productSvc.get(id),                          // 核心：必须成功
    priceSvc.get(id),                            // 核心：必须成功
    stockSvc.get(id).catch(() => ({ available: true })),  // 降级：默认有货
    recommendSvc.list(id).catch(() => []),       // 降级：推荐为空
    commentSvc.summary(id).catch(() => null),    // 降级：评论摘要为空
  ]);
  res.json({
    // 字段裁剪：只输出页面需要的，且做 camelCase 转换与脱敏
    title: product.name,
    price: formatPrice(price.amount),
    inStock: stock.available,
    recommends: recommend.slice(0, 8).map(pickDisplayFields),
  });
});
\`\`\`

BFF 的反模式与边界（不该引入的场景）：①把业务逻辑写进 BFF——BFF 只做"组装与适配"，一旦里面出现优惠计算、库存扣减这类领域逻辑，就形成了"游离在微服务体系外的逻辑黑洞"，两边改需求不同步必出事故；②小团队单前端应用——就一个 Web 端、后端也是单体，BFF 纯增一跳延迟和一层维护成本，直接让后端按页面需求出接口即可；③BFF 变成"新单体"——所有前端共用一个 BFF 应用，几十个页面端点互相影响（一个端点的内存泄漏拖死全部），正确姿势是按端拆分（Web-BFF/Mobile-BFF）或按域拆分模块 + 独立部署核心链路；④用 BFF 解决"后端接口烂"的问题——后端接口设计不合理应该推动后端改，BFF 糊一层只是技术债转移。

真实案例：某电商 App 首页从"客户端直调 6 个微服务"改为 BFF 聚合后——首屏接口耗时 P95 从 2.8s 降到 0.9s（内网并行 + 少 5 次 TLS 握手），更重要的是错误处理统一了：原来客户端要处理 6 种不同的错误码体系，改后 BFF 统一输出"核心失败 / 部分降级"两种语义，客户端代码砍掉 40%。另一个视角：GraphQL 常被当作 BFF 的技术选型——它把"字段裁剪权"交给前端（查询语句即裁剪），适合多页面形态差异大的场景，但引入了 N+1 查询、缓存复杂化的新问题，不要为用 GraphQL 而用。`,
    keyPoints: ["BFF 解决领域导向后端与场景导向前端的矛盾：聚合/转协议/收鉴权/裁字段", "聚合编排要独立容错：核心数据必成功，边缘数据可降级 null", "反模式：业务逻辑进 BFF、小团队硬上 BFF、BFF 长成新单体"],
    followUps: ["GraphQL 作为 BFF 方案的 N+1 问题与 DataLoader 解法？", "BFF 层的接口契约如何与下游微服务版本演进解耦（契约测试）？"],
    favorited: false,
  },
  {
    id: "fe-304",
    nodeId: "node-bff",
    question: "Node.js Stream 的四种类型与背压（backpressure）机制是什么？为什么处理大文件必须用流？pipe() 和 stream.pipeline() 的差异与错误处理要点？",
    bigTech: true,
    answer: `结论：四种流——Readable（读，如 fs.createReadStream）、Writable（写，如 res 响应对象）、Duplex（读写双向，如 TCP socket）、Transform（读写中转换，如 zlib.createGzip）。大文件必须用流的本质：把"文件全文进内存"（1GB 文件 = 1GB 内存 = 服务必挂）变成"64KB 块流水线"（内存恒定），背压机制保证"快生产者等慢消费者"——下游写不动时暂停上游读取，内存水位永远可控。

\`\`\`js
// ❌ 内存炸弹：1GB 文件直接爆掉默认堆（老版本默认 512MB）
fs.readFile("big.log", (err, data) => res.end(data));

// ✅ 流式：内存恒定 ~64KB 水位
fs.createReadStream("big.log").pipe(res);

// 背压的手动演示（pipe 内部就是这套逻辑）：
const readable = fs.createReadStream("big.log");
const writable = fs.createWriteStream("out.log");
readable.on("data", (chunk) => {
  const canContinue = writable.write(chunk);
  // write 返回 false = 内核缓冲区已满（超过 highWaterMark）
  if (!canContinue) readable.pause();          // 上游刹车
});
writable.on("drain", () => readable.resume()); // 下游排空 → 上游放行

// pipe vs pipeline：错误处理与资源清理的差异是生产事故分水岭
// pipe 的问题：①任一流出错不会自动销毁其他流（文件描述符泄漏）
//             ②错误不会沿管道传播（gzip 炸了 res 还挂着）
source.pipe(gzip).pipe(res);
source.on("error", () => {}); gzip.on("error", () => {}); // 得手挂 N 次还容易漏

// pipeline（Node 10+，生产标准）：任一出错全部清理 + 统一回调
const { pipeline } = require("stream/promises");
try {
  await pipeline(
    fs.createReadStream("big.log"),
    zlib.createGzip(),
    res,
  );
} catch (err) {
  // 统一处理：源文件不存在/压缩失败/客户端断开都在这里
  // 且所有流已被自动 destroy，无泄漏
  res.destroy(err);
}
\`\`\`

流的实战要点：①Transform 流的典型应用——BFF 里做"边下边转"：从上游服务拉 CSV 流，Transform 逐行转 JSON，边转边吐给客户端（首字节时间从"下载完整个文件"降到第一个 chunk）；②objectMode——普通流传 Buffer/string，objectMode: true 的流传任意对象（常用于数据库行流处理），highWaterMark 在对象模式下单位是"条数"而非字节；③背压失控案例——某日志收集服务用 readline 逐行读 + 直接推 Kafka，Kafka 客户端内部缓冲无限增长（没实现背压传播），堆内存 3 小时涨到 OOM——修复是换成 Kafka 客户端的流式接口并监听其 drain 等价物；④前端对应的场景——浏览器里的 fetch 响应体也是流（response.body.getReader()），大文件下载进度条、流式解析 NDJSON（LLM 流式输出就是 SSE 文本流）用的是同一套思想。

坑点清单：①pipe 之后源流出错目标流不会结束——永远用 pipeline 替代裸 pipe；②res 是可写流，客户端断开连接会触发 error，不监听就抛 uncaughtException 打挂进程（Express 里 res.on('error') 常被漏掉）；③highWaterMark 默认 16KB（对象模式 16 条），盲目调大不能提速反而加剧内存波动；④流 + async/await 混用——for await (const chunk of readable) 是现代写法且自带背压，但注意循环里 await 慢操作时流会自动暂停（这正是你要的行为），别画蛇添足再 pause。`,
    keyPoints: ["四流：Readable/Writable/Duplex/Transform；大文件必须流式（恒定内存 vs 全文进内存）", "背压=write 返回 false→pause，drain→resume；下游慢上游等，水位可控", "生产用 pipeline 不用 pipe：统一错误处理+自动 destroy 全链，防句柄泄漏"],
    followUps: ["Node 流与 Web Streams API 的互操作（toWeb/fromWeb）在边缘运行时怎么用？", "如何实现一个限速 Transform（如控制上传速度 1MB/s）？"],
    favorited: false,
  },
  {
    id: "fe-305",
    nodeId: "node-bff",
    question: "BFF 层调用下游微服务的稳定性三板斧：限流（令牌桶 vs 漏桶）、熔断、超时预算怎么设计？舱壁隔离（bulkhead）在 Node 单线程模型下如何落地？",
    bigTech: true,
    answer: `结论：BFF 是流量入口，下游任何一个慢服务都可能拖垮整个入口——三板斧的分工：超时控制（每个调用必须有截止时间，防"慢资源耗尽"）、熔断（下游持续失败时快速失败，防"重试风暴打挂病人"）、限流（入口和出口都要控，防"突发流量击穿"）。舱壁隔离在 Node 下的特殊含义：单线程模型没有线程池可隔，隔离的是"下游依赖的并发配额"和"进程维度"。

\`\`\`ts
// ① 超时预算：不是"每个接口一个超时"，而是"一次请求的预算在调用链上分配"
// 页面接口总预算 800ms：商品 300ms / 价格 200ms / 库存 200ms / 推荐 150ms（可降级）
async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer); // 不清理 = 定时器泄漏（每请求一个 setTimeout 常驻）
  }
}

// ② 熔断器（三态机：CLOSED → OPEN → HALF_OPEN）
class CircuitBreaker {
  private failures = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private openedAt = 0;
  constructor(private threshold = 5, private cooldownMs = 30_000) {}

  async call<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.openedAt > this.cooldownMs) {
        this.state = "HALF_OPEN"; // 冷却期到，放一个探测请求
      } else if (fallback) {
        return fallback();        // 熔断中：快速失败走降级
      } else {
        throw new Error("circuit open");
      }
    }
    try {
      const result = await fn();
      if (this.state === "HALF_OPEN") this.state = "CLOSED"; // 探测成功，恢复
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = "OPEN";
        this.openedAt = Date.now();
      }
      if (fallback && this.state === "OPEN") return fallback();
      throw err;
    }
  }
}

// ③ 令牌桶限流（允许突发）vs 漏桶（恒定速率，削峰）
// 令牌桶：桶容量 N，每秒放 R 个令牌，取到令牌才能过 → 允许 N 的瞬时突发
// 漏桶：请求先进队列，以恒定 R/s 流出 → 出口绝对平滑，突发被排队（带超时丢弃）
// BFF 入口用令牌桶（容忍用户操作的天然突发），出口调下游用漏桶（保护下游恒定负载）
\`\`\`

舱壁隔离在 Node 的落地（与 Java 线程池隔离思想对应）：①并发配额隔离——给每个下游依赖一个独立的并发上限（商品服务最多 30 并发、推荐服务最多 10 并发），用 semaphore 实现；推荐服务慢成蜗牛也只占满它自己的 10 个配额，不会耗尽进程资源影响商品链路；②进程隔离——核心链路（交易）与非核心链路（推荐/日志上报）部署不同 BFF 实例组，非核心组的内存泄漏/CPU 打满不影响核心组；③事件循环保护——同步 CPU 操作（大 JSON.parse、正则）是所有请求的共享风险，超过阈值的任务必须 worker_threads 化，否则任何隔离都白搭（单线程是全局共享的"最后一个舱壁"）。

真实事故复盘：某 BFF 调推荐服务无超时控制，推荐服务慢查询从 50ms 劣化到 8s——BFF 的 fetch 全部挂起等待，Node 进程的 socket 连接数 5 分钟内耗尽（ulimit 65535），健康检查接口也得不到响应，LB 判定全组下线导致全站 503。修复组合：①所有下游调用强制 timeout（按 P99 延迟 × 2 设置）；②推荐服务加熔断（5 次失败开 30s）+ 降级（返回空推荐）；③各下游并发配额。事后指标：同样劣化场景下核心接口 P99 仅上升 8%。教训：稳定性手段的价值不在"防事故"（下游劣化你挡不住），而在"把事故的爆炸半径从全站压缩到单个功能降级"。`,
    keyPoints: ["超时按预算在调用链分配；AbortController 用完必须 clearTimeout 防泄漏", "熔断三态：CLOSED→OPEN（快速失败+降级）→HALF_OPEN（探测恢复）", "Node 舱壁=下游并发配额+进程分组+CPU 任务 worker 化，单线程是最后共享舱壁"],
    followUps: ["熔断器与重试策略如何配合（重试会加速熔断计数吗）？", "限流在被 LB 多实例部署时如何实现全局限额（Redis 分布式限流）？"],
    favorited: false,
  },
  {
    id: "fe-306",
    nodeId: "node-bff",
    question: "Node.js 服务线上性能排查：如何定位内存泄漏（heapdump 对比法）与事件循环阻塞（event loop lag）？常见的泄漏模式有哪些？",
    bigTech: true,
    answer: `结论：Node 性能问题就两大类——内存泄漏（RSS 只涨不落，最终 OOM）和事件循环阻塞（单请求慢拖死所有请求，P99 飙升但 CPU 看着不高）。定位套路：内存问题用"三次 heapdump 对比"找只增不减的对象类型，阻塞问题用 eventLoopDelay 监控 + CPU profile 火焰图找热点函数。两类问题的高发元凶都是"无界增长"（无界缓存/无界队列）和"意外的闭包引用"。

\`\`\`js
// 内存泄漏排查三板斧：
// ① 监控先行：process.memoryUsage() 定期上报（rss/heapUsed/external 分开看）
//    heapUsed 涨 = JS 对象泄漏；external 涨 = Buffer/原生内存泄漏（另一个排查方向）
setInterval(() => {
  const m = process.memoryUsage();
  metrics.gauge("node.rss", m.rss);
  metrics.gauge("node.heapUsed", m.heapUsed);
}, 10_000);

// ② heapdump 对比法（泄漏定位黄金流程）：
//    服务运行时打 3 次 dump：启动后 / 压测或运行一段时间后 / 再一段
//    Chrome DevTools Memory 面板加载，按 "Comparison" 视图对比 dump1→dump2→dump3
//    两次对比都正增长的对象类型 = 泄漏嫌疑人，看 Retainers（谁引用它）
if (process.env.HEAPDUMP) {
  // 注意：写死路径示例，实际用 path.join(os.tmpdir(), Date.now() + ".heapsnapshot")
  require("heapdump").writeSnapshot("/tmp/" + Date.now() + ".heapsnapshot");
}

// ③ 事件循环阻塞监控：perf_hooks.monitorEventLoopDelay
const { monitorEventLoopDelay } = require("perf_hooks");
const h = monitorEventLoopDelay();
h.enable();
setInterval(() => {
  metrics.gauge("node.loopLag.p99", h.percentile(99) / 1e6); // ns→ms
  h.reset();
}, 10_000);
// p99 持续 >100ms = 有同步阻塞，上 clinic flame 或 --cpu-prof 找热点
\`\`\`

高频泄漏模式（真实案例库）：①无界 Map 当缓存——最经典：用全局 Map 做请求级缓存（key 是 userId），永不清理，两周 OOM。修复：LRU + TTL（如 lru-cache 库，max + ttl 双保险）；②闭包引用意外存活——事件监听器注册在短生命周期对象上但从不 off，emitter 活着对象就活着（EventEmitter 是泄漏重灾区，max listeners 警告别忽视）；③定时器泄漏——setInterval 回调闭包持有大对象，clearInterval 时机写错（比如请求级定时器在异常路径没清理）；④async 上下文泄漏——AsyncLocalStorage 存了大对象，在连接池复用的场景下 store 没正确清理；⑤Buffer 泄漏——external 涨的元凶：大 Buffer 被小视图引用（subarray/slice 在旧版本共享底层 ArrayBuffer，64KB 视图拖着 100MB 缓冲区不释放），Node 20 后 Buffer.copyBytesWithin 等行为有变化，排查时注意 external 指标。

事件循环阻塞的高发元凶：①大 JSON——JSON.parse/stringify 一个 50MB 对象直接阻塞几百 ms（BFF 聚合大响应时常见），解法：流式解析（stream-json）、拆小、或 worker_threads 挪走；②灾难性正则——嵌套量词回溯（(a+)+$ 类），输入稍长直接卡死；③同步加密/压缩——bcrypt.hashSync、gzipSync 在请求路径上（都是 CPU 密集，有异步版本必须用异步）；④console.log 刷屏——stdout 是同步的（管道满时），高 QPS 下日志写满管道直接阻塞，用异步日志库（pino）并控制级别。

真实案例：某网关服务每 24 小时 RSS 涨 200MB 必重启续命。heapdump 对比发现 LeakClass 是 "Timeout" 对象——查代码发现每个请求都 setTimeout 做兜底，但正常路径只 clear 了其中一个分支，异常分支漏 clear，定时器持有 req/res 大对象直到触发。修复 3 行代码（统一 finally 清理），内存曲线立刻平坦。另一个案例：P99 每隔几分钟飙升到 2s，火焰图显示热点是 gc——不是代码问题，是堆配小了（默认老生代 ~1.4GB 时 GC 频繁且长），--max-old-space-size 调到 4096 后 P99 平稳。教训：先排除"配置型问题"（堆大小/ulimit/线程池）再怀疑代码。`,
    keyPoints: ["内存用三次 heapdump 对比找正增长类型；阻塞用 eventLoopDelay p99+CPU 火焰图", "泄漏四模式：无界缓存 Map/事件监听不 off/定时器不清/Buffer 小视图拖大缓冲", "阻塞三元凶：大 JSON 同步解析/灾难性正则/同步加密压缩；先查配置再查代码"],
    followUps: ["external 内存（Buffer）泄漏与 heap 泄漏的排查路径差异？", "生产环境如何做低开销的持续 profiling（--cpu-prof 的开销与安全采样）？"],
    favorited: false,
  },
  {
    id: "fe-307",
    nodeId: "node-bff",
    question: "BFF 聚合层的接口编排：并行调用 + 部分失败容忍的完整实现模式？超时预算如何在多下游调用间分配？为什么 Promise.all 直接用往往是错的？",
    bigTech: true,
    answer: `结论：BFF 编排的核心语义是"按数据的关键程度分级容错"——Promise.all 是"一损俱损"（任何一个 reject 整体失败），直接用于聚合意味着推荐服务抖动会导致商品详情页 500，这是把非核心故障放大成核心故障。正确模式：核心数据用 Promise.all（必须全成功，否则页面无意义），边缘数据用"独立 catch 降级"或 Promise.allSettled + 分级映射，且每个调用带独立超时和熔断。

\`\`\`ts
// 反模式：一个慢/挂的边缘服务拖死整个页面
const [product, recommend] = await Promise.all([
  productSvc.get(id),
  recommendSvc.list(id),  // 挂了 → 整个接口 500
]);

// ✅ 分级容错编排（生产模式）
interface Slot<T> { status: "ok" | "degraded" | "failed"; data: T | null }
async function slot<T>(p: Promise<T>, timeoutMs: number): Promise<Slot<T>> {
  try {
    const data = await withTimeout(p, timeoutMs);
    return { status: "ok", data };
  } catch {
    return { status: "degraded", data: null }; // 降级而非失败
  }
}

app.get("/api/page/detail", async (req, res) => {
  const id = req.query.id as string;
  // 核心：必须成功（用 all，失败整体 500 合理——页面没商品没法看）
  const [product, price] = await Promise.all([
    withTimeout(productSvc.get(id), 300),
    withTimeout(priceSvc.get(id), 200),
  ]);
  // 边缘：各自独立降级，互不影响（此时它们已在并行跑）
  const [stock, recommend, comments] = await Promise.all([
    slot(stockSvc.get(id), 200),
    slot(recommendSvc.list(id), 150),
    slot(commentSvc.summary(id), 150),
  ]);
  res.json({
    product, price,
    inStock: stock.data?.available ?? true,        // 降级默认值
    recommends: recommend.data ?? [],               // 降级空列表
    commentSummary: comments.data,
    _meta: { degraded: [stock, recommend, comments] // 上报降级状态给前端展示/监控
      .filter((s) => s.status === "degraded").length },
  });
});
\`\`\`

超时预算分配（不是拍脑袋）：①从页面 SLO 倒推——页面接口 SLO 800ms，BFF 自身处理 50ms，留给下游 750ms；②按调用拓扑分配——并行调用取 max 而非 sum（商品 300 与价格 200 并行，占用 300）；③按下游 P99 校准——下游 P99 是 120ms，超时设 200-250ms（P99 × 2 经验值），太短会切掉正常慢请求放大错误率，太长失去保护意义；④级联场景的余量——BFF 调下游，下游又调更下游，每级都要留余量（BFF 给 300ms，下游内部拆分总预算必须 < 280ms），否则出现"上级已超时返回，下级还在傻算"的浪费（孤儿请求），配合 context 传递截止时间（gRPC 的 deadline 语义，HTTP 用 header 如 X-Deadline-Ms）让下游主动放弃。

Promise.allSettled 的正确使用姿势：它适合"所有数据都是边缘数据"的场景（如管理后台的仪表盘，8 个图表各自独立），返回结果后逐个 status 判断。但注意它不等价于"带超时的降级"——allSettled 只是收集了所有结果，慢调用依然会拖长整体响应时间（allSettled 等最慢的那个），所以必须 still 配合每调用 withTimeout。

编排的进阶话题：①短路优化——核心数据失败时立即返回错误，边缘数据的 Promise 还在飞（要 AbortController 取消掉，防孤儿请求浪费下游资源）；②并行度控制——聚合 20 个下游时全并发可能把自己或下游打爆，用 p-limit 控并发（如 5 并发池）；③响应流式化——页面数据分块到达（先骨架与核心数据，边缘数据后续推），用 HTTP chunked 或 SSR 流式渲染，首字节时间从"最慢边缘服务"解绑。真实案例：某详情页 BFF 聚合 12 个服务，上线分级降级后，"部分降级率"日常维持在 0.3%（边缘服务抖动的正常水位），但整页 500 率从 0.4% 降到 0.001%——可用性提升两个数量级，靠的不是让下游更稳，而是承认下游必然抖动的现实设计。`,
    keyPoints: ["核心数据 Promise.all 一损俱损（合理），边缘数据独立 catch 降级（all 直接聚合是反模式）", "超时预算：页面 SLO 倒推→并行取 max→按下游 P99×2 校准→级联留余量传 deadline", "allSettled 适合全边缘场景但仍需配每调用超时，否则被最慢调用拖住"],
    followUps: ["孤儿请求（上级超时后下游继续算）的资源浪费如何用 deadline 传播根治？", "BFF 编排与 GraphQL federation 的容错语义差异？"],
    favorited: false,
  },
  {
    id: "fe-308",
    nodeId: "node-bff",
    question: "Node.js BFF 层的安全实践：SSRF、ReDoS、原型链污染、依赖供应链四类攻击的原理与防御？为什么 BFF 是这些攻击的首要暴露面？",
    bigTech: true,
    answer: `结论：BFF 同时暴露于公网流量且持有内网访问凭证，是"攻击者从外网摸到内网"的跳板——SSRF 用它打内网，ReDoS 用一条请求打挂它（单线程 = 一个请求就能 DoS 全站），原型链污染通过它污染全局状态，供应链通过它的 node_modules 投毒。防御的共同思想：输入零信任 + 最小权限 + 依赖治理。

\`\`\`ts
// ① SSRF（服务端请求伪造）：BFF 常见的"代理转发"功能是重灾区
// 漏洞代码：把用户给的 URL 直接 fetch
app.get("/api/proxy", async (req, res) => {
  const data = await fetch(req.query.url as string); // 用户传 http://169.254.169.254/
  res.json(await data.json());                         // 云元数据被盗 = 整个云账号沦陷
});
// 防御：协议白名单 + 域名白名单 + 解析后 IP 校验（防 DNS rebinding）
const ALLOWED_HOSTS = new Set(["api.trusted.com"]);
function assertSafeUrl(input: string) {
  const u = new URL(input);
  if (!["https:"].includes(u.protocol)) throw new Error("protocol denied");
  if (!ALLOWED_HOSTS.has(u.hostname)) throw new Error("host denied");
  // 进阶：DNS 解析后检查 IP 不在内网段（10/8, 172.16/12, 192.168/16, 169.254/16, 127/8）
  // 且每次重定向后重新校验（否则白名单域名 302 到内网就绕过了）
}

// ② ReDoS（正则灾难性回溯）：Node 单线程，一条恶输入卡死全站
// 漏洞模式：嵌套量词 /^(a+)+$/ 输入 "aaaaaaaaaaaaaaaaaaaaX" → 指数级回溯
// 防御：
// - 审计正则：嵌套量词 (a+)+ (a|a)* 这类结构禁止上生产
// - 用 safe-regex 静态扫描 CI 拦截
// - 输入长度先截断（正则前先 if (input.length > 200) reject）
// - Node 15+ 可用超时执行（正则本身无超时 API，必须 worker 化或用 re2 线性引擎）
const RE2 = require("re2"); // 线性时间正则引擎，无回溯风险
const safePattern = new RE2(/^(a+)+$/); // RE2 直接拒绝病态模式或线性执行

// ③ 原型链污染：递归合并不可信 JSON 时 __proto__ 键污染 Object.prototype
function merge(target: any, source: any) {
  for (const k in source) {
    if (typeof source[k] === "object") merge(target[k] ??= {}, source[k]);
    else target[k] = source[k]; // k = "__proto__" 时，target.__proto__.isAdmin = true
  }                              // → 之后所有对象都带上 isAdmin
}
// 防御三连：
// - 合并时跳过危险键：if (k === "__proto__" || k === "constructor" || k === "prototype") continue
// - JSON 解析后立即 zod/class-validator 校验 schema（多余字段直接拒）
// - 冻结根基：Object.freeze(Object.prototype)（激进，需评估兼容性）
// - 或用 Object.create(null) 做字典对象（无原型可污染）

// ④ 依赖供应链：node_modules 是前端最大攻击面（平均项目 1000+ 传递依赖）
// 防御：
// - lockfile 完整性：CI 强制 --frozen-lockfile，禁 npm install 漂移
// - 安装脚本审计：ignore-scripts=true 默认全局，需要原生编译的包白名单放行
//   （投毒高发区：postinstall 里 curl | sh）
// - 定期 npm audit + Socket/Snyk 行为分析（版本突变 + 新 maintainer + 网络行为 = 高危）
// - 私有 registry 代理（Verdaccio/Nexus）隔离公网，加"新包 24h 冷静期"策略
\`\`\`

BFF 特有风险与纵深防御：①凭证保护——BFF 持有的下游服务 token/mTLS 证书必须从密钥管理系统注入（K8s Secret 挂卷），绝不进代码库和镜像层；②日志脱敏——BFF 日志会记录请求体（可能含密码/身份证），日志管道里做正则脱敏 + 访问控制，日志泄漏 = 数据泄漏；③错误信息不外泄——生产环境错误响应只给通用 message，堆栈和内部错误码只进监控（Express 的默认错误处理器会吐堆栈，必须自定义）。

真实案例：①event-stream 事件——2018 年下载量 200 万/周的 npm 包被新 maintainer 注入窃取比特币钱包的代码，通过传递依赖进入数千项目，教训：传递依赖的 maintainer 变更要监控；②某 BFF 的"图片代理"功能未校验 URL，被用来扫描内网 Redis（6379 端口探测），从外网一路摸进未授权 Redis 拿到会话数据——修复后加了 host 白名单 + 响应类型校验（只允许 image/*）；③polyfill.io 事件——2024 年知名 CDN 域名易主后对引用它的 10 万+ 网站投毒，说明"第三方脚本/依赖的信任是持续状态，不是一次性审核"。卡帕西视角：BFF 安全的核心是"假设每条输入都恶意、每个依赖都会烂"，然后把这两个假设变成自动化检查而不是靠人记。`,
    keyPoints: ["SSRF 防御=协议+域名白名单+解析 IP 校验+重定向重校验；云元数据 169.254.169.254 是首要目标", "ReDoS 单线程一卡全站：safe-regex CI 拦截+RE2 线性引擎+输入截断", "原型链污染=递归合并过滤 __proto__+schema 校验；供应链=lockfile 冻结+ignore-scripts+行为审计"],
    followUps: ["DNS rebinding 攻击如何绕过基于域名的 SSRF 白名单？防御的完整校验顺序？", "npm 包 typosquatting（仿冒名包）的识别与 CI 防御？"],
    favorited: false,
  },
  {
    id: "fe-309",
    nodeId: "node-bff",
    question: "SSR 服务在 Node 上的工程实现：渲染缓存（页面级/组件级）、流式渲染、内存控制、CSR 降级各怎么做？高并发下 SSR 服务的容量规划要点？",
    bigTech: true,
    answer: `结论：SSR 的工程矛盾是"每个请求都要跑一次 React 渲染（CPU 密集）"与"Node 单线程扛不住 CPU 密集"——所以 SSR 服务的核心设计不是渲染本身，而是"尽量少渲染"（多级缓存）和"渲染别堵门"（流式 + 容量隔离 + 降级 CSR）。生产 SSR 服务的请求路径上，真正走到 renderToString 的请求应该不到 20%。

\`\`\`ts
// ① 多级缓存体系（命中率决定容量）
// L1 页面级缓存（整页 HTML 缓存，命中即返回，零渲染）：
//    key = url + 用户分群（个性化页面不能整页缓存，或按分群维度缓存）
const pageCache = new LRU<string, string>({ max: 500, ttl: 60_000 });
// L2 数据缓存（渲染所需数据的接口结果缓存，命中率最高的层）：
//    页面数据 80% 是公共数据（商品信息），只有 20% 是个性化（推荐）
// L3 组件级缓存（昂贵子树的渲染结果缓存，React 18 暂无官方 API，
//    实践中按"静态壳 + 动态岛"拆分，静态部分整段缓存）

// ② 流式渲染（React 18 renderToPipeableStream）：首字节从"整页渲染完"
//    变成"布局壳立刻吐"，数据慢的部分用 Suspense 边界后补
import { renderToPipeableStream } from "react-dom/server";
app.get("*", (req, res) => {
  res.socket?.on("error", () => stream?.abort()); // 客户端断开即终止渲染
  const stream = renderToPipeableStream(<App url={req.url} />, {
    onShellReady() {
      // 壳（含 Suspense fallback）就绪 → 立刻开吐，TTFB 极小化
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      stream.pipe(res);
    },
    onShellError(err) {
      // 壳就崩了 → 降级 CSR：吐一个带客户端 bundle 的空壳 HTML
      res.statusCode = 200;
      res.end(csrFallbackHtml);
    },
    onError(err) {
      logger.error(err); // Suspense 边界内错误不致命，该边界降级为 CSR
    },
  });
  // 超时保护：5s 渲染不完强制 abort 走降级（防慢查询把渲染池耗死）
  setTimeout(() => stream.abort(), 5000);
});

// ③ 内存控制：每个请求一次 V8 上下文级别的对象图，并发 = 内存乘数
//    - 渲染并发上限：semaphore 控制同时渲染的请求数（如 CPU 核数 × 2）
//    - 大对象不进渲染上下文（数据裁剪在渲染前做）
//    - --max-old-space-size 按"单请求渲染峰值 × 并发数 × 3"配置
\`\`\`

CSR 降级（SSR 服务的保险丝，必须默认存在）：三级降级策略——①L1 渲染超时/渲染错误 → onShellError 吐 CSR 空壳（用户看到客户端渲染，体验降级但可用）；②L2 进程过载（event loop lag > 阈值或内存 > 85%）→ 健康检查返回异常让 LB 摘流，新请求直接返回 CSR 壳（注意：此时不能渲染 CSR 壳本身，CSR 壳 HTML 要预生成静态化，零渲染成本吐出）；③L3 全组故障 → CDN 边缘兜底（静态化的"简版页面"或历史缓存版本 stale-if-error）。降级的关键设计：CSR 壳必须零依赖（不查数据库、不调接口、不渲染），否则保险丝本身也会烧断。

容量规划要点（SSR 特有）：①并发模型——SSR 是 CPU 绑定型负载，单进程有效并发 ≈ CPU 核数（渲染占满核时再多连接只是排队），扩容靠进程数（cluster/容器副本）不靠单机线程；②压测口径——必须用"混合页面类型 + 真实数据大小"压测（列表页和详情页渲染成本差 3 倍），只压首页会得出虚假容量；③预热——新实例启动后先跑渲染预热（V8 JIT 编译热点函数 + 缓存填充），直接接全量流量的冷实例 P99 会难看 10 倍；④指标基线——SSR 服务必须监控 renderTime（渲染耗时分布）、cacheHitRate（各级命中率）、fallbackRate（CSR 降级率，>5% 告警）。

真实案例：某内容站 SSR 服务在明星绯闻热点时流量涨 8 倍，缓存命中率从 92% 暴跌到 40%（新内容 URL 都没缓存），渲染队列堆积 → event loop lag 到 2s → 健康检查失败 → LB 摘流 → 雪崩。复盘后三板斧：①热点内容主动预热缓存（编辑发布时触发渲染入库）；②过载保护前置——渲染请求入队前先查 lag 指标，超过 200ms 直接吐 CSR 壳，宁可降级不可排队（排队 = 全慢）；③容量按"缓存命中率 40% 的悲观水位"规划而非日常 92% 的乐观水位。教训：SSR 服务的容量模型必须以"缓存失效日"为基准设计，缓存是性能优化不是容量依赖——这个认知反过来了就是事故。`,
    keyPoints: ["多级缓存（页面/数据/组件）+流式渲染让真实渲染请求 <20%；onShellError 兜底 CSR", "CSR 壳必须预生成零渲染成本；降级三级：渲染错误→过载摘流→CDN 兜底", "容量按悲观缓存水位规划；渲染并发≈核数，扩容靠进程数；新实例要 JIT 预热"],
    followUps: ["React Server Components 与传统 SSR 的架构差异（渲染发生在哪里）？", "边缘 SSR（渲染放到 CDN 节点）对缓存与降级模型有什么改变？"],
    favorited: false,
  },
  {
    id: "fe-310",
    nodeId: "cross-platform",
    question: "跨端方案全景对比：React Native / Flutter / 小程序 / Taro 编译式 / Electron 五条路线的渲染原理本质差异是什么？选型决策树怎么走？",
    bigTech: true,
    answer: `结论：五路线的本质差异在"谁画出像素"——RN 是 JS 驱动原生组件（桥接通信），Flutter 是自绘引擎（Skia/Impeller 直接画像素，自带整套渲染），小程序是双线程 WebView（逻辑层 JS + 渲染层 WebView 桥接），Taro 是 DSL 编译（React 语法编译到各端原生 DSL），Electron 是打包整个 Chromium（每个应用一个浏览器）。差异决定了各自的性能上限、生态天花板和坑的形态。

\`\`\`
渲染原理对比：
┌──────────┬────────────────────┬──────────────┬────────────────┐
│ 方案      │ 像素由谁绘制        │ JS 如何触达 UI │ 性能天花板      │
├──────────┼────────────────────┼──────────────┼────────────────┤
│ RN       │ 原生组件（真 Button）│ Bridge/JSI    │ 接近原生        │
│ Flutter  │ 自绘引擎 Skia       │ Dart（无 JS）  │ 高且稳定        │
│ 小程序    │ WebView + 原生组件  │ JSBridge 异步  │ 受 WebView 限   │
│ Taro     │ 各端原生 DSL        │ 编译期转译     │ 取决于目标端    │
│ Electron │ Chromium 渲染引擎   │ 就是 Web      │ Web 水平        │
└──────────┴────────────────────┴──────────────┴────────────────┘
\`\`\`

选型决策树（按问题顺序）：①目标平台只有 iOS+Android 且追求原生体验 → RN（团队是 React 技术栈）或 Flutter（追求一致性+性能，愿意学 Dart）；②要进微信/支付宝生态吃平台流量 → 小程序原生或 Taro（必须遵守平台规则，没的选）；③一套代码要同时覆盖 App+小程序+H5 → Taro/uni-app（接受"各端能力的最大公约数"限制）；④桌面端（Win/Mac/Linux）且团队是前端 → Electron（VS Code/Slack 验证过的成熟路线），包体积敏感可看 Tauri（Rust 壳 + 系统 WebView，体积从 150MB 降到 10MB）；⑤内容型页面为主 → 别跨端，H5 + 原生壳（WebView 混合）成本最低。

各路线的隐性成本（决策时容易漏算的账）：①RN——原生模块维护成本（每个版本升级要跟原生生态），新架构迁移期（2024-2026 大量三方库新旧架构并存），调试链长（JS 崩溃好查，原生层崩溃要原生开发介入）；②Flutter——团队技术栈分裂（Dart 人才储备），包体积 +5-8MB，与平台原生 UI 的"质感差异"（自绘意味着每个控件都是 Flutter 自己画的，iOS 用户能感觉出来）；③小程序——平台审核与能力白名单（想要的能力平台不给就没辙），包体积限制（微信主包 2MB），WebView 内核碎片化（低端 Android 的 X5 内核坑）；④Taro——编译转译的能力损耗（React 的动态特性如高阶组件复杂用法转译后可能有边界 case），框架升级跟着 Taro 官方节奏走；⑤Electron——内存与包体积（每个应用带一个 Chromium，三个 Electron 应用 = 三个浏览器实例），自动更新与签名分发的运维成本。

真实案例：某团队 App 首页用 RN，业务页面用小程序同款 Taro 编译到 RN——看起来"一套代码两端跑"很美，实际维护了一年发现：Taro 编译到 RN 的性能在高频交互场景（长列表 + 动画）掉帧明显，最终核心链路重写回纯 RN，Taro 只保留"低频运营页"——选型教训：跨端方案适合"变化快、体验要求中等"的页面，核心高频交互链路用平台原生或 RN/Flutter 直连。另一个视角：乔布斯会问你"用户感知到差异了吗"——如果用户感知不到（如设置页），用最便宜的方案；如果用户感知强烈（如首页 Feed 滑动），用性能上限最高的方案。跨端选型的第一性问题不是技术偏好，而是"哪些页面的体验值得付原生成本"。`,
    keyPoints: ["本质差异=谁画像素：RN 原生组件 / Flutter 自绘 / 小程序 WebView / Taro 编译 DSL / Electron 打包浏览器", "决策树：平台范围→生态约束→交互性能要求→团队栈；核心交互链路慎用编译式方案", "隐性成本：RN 原生模块维护 / Flutter 栈分裂 / 小程序平台白名单 / Taro 转译损耗 / Electron 体积"],
    followUps: ["Tauri（系统 WebView + Rust）与 Electron 的架构权衡？", "KMP（Kotlin Multiplatform）与跨端 UI 方案的互补关系（共享逻辑 vs 共享 UI）？"],
    favorited: false,
  },
  {
    id: "fe-311",
    nodeId: "cross-platform",
    question: "React Native 新旧架构的本质差异：旧 Bridge 的异步序列化瓶颈具体是什么？JSI / Fabric / TurboModule / Codegen 四件套如何根治？升级新架构的坑有哪些？",
    bigTech: true,
    answer: `结论：旧架构的命门是"JS 与原生之间所有通信都要 JSON 序列化 + 异步排队过 Bridge"——一次 setState 引发的 UI 更新要序列化成 JSON 消息进队列，原生消费后再序列化回传，高频场景（滚动/动画/手势）每秒数百次序列化导致掉帧；且异步意味着 JS 无法同步调用原生方法（想同步读个屏幕宽度都做不到）。新架构用 JSI（C++ 层的 JS 引擎直接互操作，零序列化、可同步调用）替换 Bridge，Fabric（新渲染器，支持同步布局与并发渲染）替换旧 UI 管理器，TurboModule（懒加载 + JSI 直连的原生模块）替换旧 NativeModule，Codegen（从 TS 接口生成 C++ 绑定代码）保证类型安全。

\`\`\`
旧架构通信链路（每条消息的完整旅程）：
JS 线程:  setState → Yoga 计算布局 → UI 操作指令
    ↓ JSON.stringify(指令) → Bridge 消息队列（异步批量）
原生线程: 取消息 → JSON.parse → 影子树 diff → 主线程执行 UI 变更
    ↓ 原生事件（滚动/触摸）反向同样走一遍
代价：每次通信 = 2 次序列化 + 队列延迟（~ms 级）
高频滚动：JS 想跟手更新 UI？队列已堵 → 掉帧白屏（列表快速滑动的空白格）

新架构链路：
JS 线程 ──JSI（直接持有 C++ 对象引用，同步函数调用）──> C++ 层
    ↓ Fabric 渲染器（C++ 影子树，可跨线程布局，支持 React 18 并发特性）
    ↓ 同步布局提交（滚动时 JS 可同步驱动 UI，告别队列）
TurboModule：原生模块首次调用时才初始化（旧架构启动时全量初始化拖慢启动）
\`\`\`

四件套的分工细节：①JSI 是地基——JS 引擎（Hermes）暴露 C++ API，JS 可以同步调用 C++ 函数、直接读写 C++ 对象内存（HostObject），序列化归零；②Fabric 是渲染层革新——旧的 UI 操作走"JS 算布局 → 序列化 → 原生执行"，Fabric 把影子树放 C++，布局计算可多线程，且支持同步渲染提交（useSyncExternalStore、并发渲染在 RN 才有意义）；③TurboModule 解决启动与类型——旧 NativeModule 启动时全部初始化（哪怕你只用 3 个模块的 1 个），TurboModule 懒加载 + JSI 直连，启动快且调用零桥接；④Codegen 是工程保障——从 TypeScript/Flow 接口定义自动生成 JS↔C++ 的绑定胶水，接口不匹配编译期就炸（旧架构靠运行时才发现参数传错）。

升级新架构的真实坑（2024-2026 迁移期必读）：①三方库兼容性——老库只有 Bridge 实现，新架构下要么走兼容层（Interop Layer，性能打折），要么换库/自己包 TurboModule，迁移第一步是三方库盘点（rnnewarch 清单）；②Bridge 模式与新架构行为差异——旧架构下"启动时全量初始化模块"的副作用代码（有些库在 init 时注册了全局监听）在 TurboModule 懒加载下不再执行，功能静默失效；③同步调用的陷阱——JSI 同步调用让"原生卡顿直接卡 JS"成为可能（旧架构异步至少不堵 JS 线程），原生方法必须轻量；④Hermes 版本绑定——新架构强依赖 Hermes，用 JSC 的自定义场景要切换；⑤调试工具链变化——Flipper 被官方弃用，调试换成 Chrome DevTools（Hermes 直接支持 CDP）。

真实案例：某社区 App 长列表（图文混排 + 视频）在旧架构下快速滑动白格率 15%，升级新架构 + FlashList 后降到 2%——关键收益来自 Fabric 的同步布局（滚动位置同步驱动内容回收）而非"序列化变快"这个直觉理解。另一个案例：启动耗时优化——旧架构启动初始化 40+ 原生模块耗时 380ms，TurboModule 化后实际启动只用 6 个模块，初始化降到 45ms。教训：新架构的收益不是平均分布的，列表/动画/启动三个场景拿到 90% 收益，迁移优先级按这三个场景的业务权重排。`,
    keyPoints: ["旧 Bridge 三宗罪：JSON 序列化开销/异步队列延迟/无法同步调用；高频交互场景掉帧白格", "JSI 零序列化同步互操作；Fabric C++ 影子树+同步提交；TurboModule 懒加载；Codegen 类型安全", "迁移坑：三方库兼容盘点/模块初始化副作用失效/同步调用卡 JS 的新风险/Hermes 绑定"],
    followUps: ["Fabric 的同步渲染与 React 18 并发特性（startTransition）在 RN 如何协同？", "自研原生模块从旧架构迁移到 TurboModule + Codegen 的完整步骤？"],
    favorited: false,
  },
  {
    id: "fe-312",
    nodeId: "cross-platform",
    question: "微信小程序为什么采用双线程架构（逻辑层 JSCore + 渲染层 WebView）？setData 的通信成本如何影响开发范式？skyline 渲染引擎解决了什么？",
    bigTech: true,
    answer: `结论：双线程架构是平台管控的必然选择——逻辑层（JS 跑在 JSCore/V8，无 DOM API）与渲染层（WXML/WXSS 在 WebView）彻底隔离，开发者无法直接操作 DOM，所有 UI 变更必须通过 setData 经 JSBridge 序列化传递。这个设计用通信成本换来了平台要的三样东西：安全可控（JS 碰不到 DOM 就做不了 XSS 类攻击和界面劫持）、审核可静态分析（WXML 是受限 DSL）、体验可兜底（渲染层在平台手里，可以统一做首屏优化和管控）。

\`\`\`
双线程通信模型：
┌─────────────┐         ┌──────────────┐
│  逻辑层 AppService     │  渲染层 WebView      │
│  (JSCore，无 DOM/BOM)  │  (WXML 虚拟 DOM)     │
│  this.setData({list})  │  模板渲染            │
└──────┬──────┘         └──────▲───────┘
       │  ① JS 侧序列化          │
       └──> Native 中转（EvaluateJavascript）──┘
             ② 原生桥传递（字符串）
             ③ 渲染层反序列化 → diff → 更新 DOM

成本结构：一次 setData = 序列化（JS 侧）+ 桥传输（按字节计）+ 反序列化 + diff
数据量 256KB 的 setData 在低端 Android 上耗时可超 200ms，且传输期间 UI 无响应
\`\`\`

setData 成本对开发范式的深刻影响（每条都是血泪最佳实践）：①数据瘦身——只传"模板用到的字段"（后端返回 50 字段，setData 前裁剪到 5 个），一次传整个大对象数组是性能自杀；②路径更新——this.setData({ "list[3].done": true }) 只更新单个字段，而不是整个 list 重传（路径更新只序列化变化部分）；③粒度拆分——把大页面拆成自定义组件，每个组件独立 setData（组件间更新互不影响，避免页面级全量 diff）；④防抖合并——高频数据源（如滚动位置、倒计时）的 setData 必须节流（小程序官方建议每秒不超过 20 次）；⑤本地状态不外溢——纯 UI 状态（展开/收起）放组件的 data 局部管理，别都堆页面 data 里。

skyline 引擎（微信 2022+ 新渲染层）解决什么：WebView 渲染的固有问题——首屏依赖 WebView 初始化（慢）、长列表内存高（DOM 节点膨胀）、动画性能受 WebView 合成器限制。skyline 抛弃 WebView 改用自绘渲染（类 Flutter 思路：直接接管光栅化，WXML 编译为渲染指令而非 DOM），收益：首屏快 30-50%、列表内存降一半、动画 60fps 稳定。代价：CSS 能力子集（不支持部分复杂选择器和布局）、生态组件要适配——所以它适合"性能敏感的新页面"，全量迁移要评估样式兼容性。这其实是跨端史的轮回：小程序从"WebView 够用"走向"自绘追性能"，和 Flutter 否定 WebView 的逻辑一模一样——Web 渲染引擎的通用性在受限场景下就是性能税。

真实案例：某电商小程序商品列表页（100+ 卡片，每卡 10 图）初版直接在 onReachBottom 里 this.setData({ list: [...list, ...newItems] })——每加载一页全量重传整个数组，第 5 页时单次 setData 超 500KB，低端机直接卡死闪退。优化四连：①路径更新只追加新数据段 setData({ ["list[" + page + "]"]: newItems })（二维数组分页存储）；②图片字段裁剪（只留 id+url 缩略图，详情字段点击时再拉）；③骨架期用纯样式组件（不参与数据流）；④上 recycle-view（官方长列表组件，DOM 回收复用）——优化后第 10 页 setData 仍 <30KB，滑动 55fps。教训：小程序性能优化的 80% 是 setData 的学问，剩下 20% 才是常规 Web 优化。`,
    keyPoints: ["双线程是平台管控设计：安全隔离+静态可审+渲染可兜底，代价是 setData 通信税", "setData 四原则：字段瘦身/路径更新/组件粒度拆分/高频节流（<20 次/s）", "skyline 自绘引擎解决 WebView 首屏慢/内存高/动画弱，代价是 CSS 子集与生态适配"],
    followUps: ["小程序与宿主 App 的通信（小程序跳原生页面、共享登录态）机制？", "Donut/FinClip 类「小程序容器技术」把小程序跑在自有 App 的原理？"],
    favorited: false,
  },
  {
    id: "fe-313",
    nodeId: "cross-platform",
    question: "JSBridge 的实现原理：H5 与 Native 双向通信（URL Scheme 拦截 / 注入 API / WebView 消息通道）三种方式如何实现？回调管理、安全性与性能各有什么注意点？",
    bigTech: true,
    answer: `结论：JSBridge 的双向通信不对称——JS 调 Native 有三种姿势（URL Scheme 拦截、注入 API、官方消息通道），Native 调 JS 只有一种本质（在 WebView 上下文执行 JS 字符串）。生产级 Bridge 的复杂度不在"调通"而在"回调生命周期管理"（异步结果的配对与超时）和"安全"（任意 H5 页面都能调 bridge 等于把原生能力开放给全网）。

\`\`\`js
// ===== JS → Native 三方式 =====

// 方式一：URL Scheme 拦截（兼容最老的方案）
// JS 构造自定义 scheme 的 iframe 请求，Native 在 shouldOverrideUrlLoading 拦截
function callNativeByScheme(action: string, params: object, cbId: string) {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = \`jsbridge://\${action}?params=\${encodeURIComponent(JSON.stringify(params))}&cb=\${cbId}\`;
  document.body.appendChild(iframe);
  setTimeout(() => iframe.remove(), 0);
}
// Native 侧（Android）：shouldOverrideUrlLoading 里解析 scheme，处理并 return true 拦截
// 缺点：URL 长度限制（参数大就截断）、无法同步返回、连续调用可能丢（导航队列）

// 方式二：注入 API（Native 向 JS 上下文注入对象）
// Android: webView.addJavascriptInterface(new BridgeObject(), "NativeBridge")
// JS 直接同步调用：window.NativeBridge.scan({...}) ← 同步拿到返回值！
// iOS WKWebView: window.webkit.messageHandlers.xxx.postMessage（异步，但官方安全）
// Android 4.2 以下 addJavascriptInterface 有远程代码执行漏洞（反射任意类），
// 现代项目 minSdk 都已远超此版本，但注入对象的 public 方法仍要当公网 API 审计

// 方式三：官方消息通道（现代推荐）
// iOS: WKScriptMessageHandler（postMessage 风格，自动序列化）
// Android: WebMessagePort（WebViewCompat，双向通道）
// 优点：官方维护、序列化自动、与页面加载生命周期绑定

// ===== Native → JS =====
// 本质只有"执行 JS 字符串"：
// iOS: evaluateJavaScript("window.__onBridgeCallback('cb_1', {...})")
// Android: evaluateJavascript / loadUrl("javascript:...")

// ===== 回调管理（Bridge 的核心工程） =====
class Bridge {
  private callbacks = new Map<string, { resolve: Function; timer: number }>();
  private seq = 0;

  call<T>(action: string, params: object = {}): Promise<T> {
    const cbId = \`cb_\${++this.seq}\`;
    return new Promise((resolve, reject) => {
      // 超时兜底：Native 崩溃/未实现时 Promise 不能永远 pending
      const timer = setTimeout(() => {
        this.callbacks.delete(cbId);
        reject(new Error(\`bridge timeout: \${action}\`));
      }, 10_000) as unknown as number;
      this.callbacks.set(cbId, { resolve, timer });
      this.invokeNative(action, params, cbId);
    });
  }

  // Native 回调统一入口（注入到 window）
  __onCallback(cbId: string, err: string | null, data: unknown) {
    const cb = this.callbacks.get(cbId);
    if (!cb) return; // 已超时清理过，Native 迟到的回调直接丢弃
    clearTimeout(cb.timer);
    this.callbacks.delete(cbId);
    err ? cb.resolve(Promise.reject(err)) : cb.resolve(data as any);
  }
}
\`\`\`

安全三原则：①调用方鉴权——Bridge 方法执行前校验页面域名白名单（Native 侧拿 webView.url 判断），任意第三方 H5 加载进 WebView 就能调原生能力 = 灾难（比如 bridge.openCamera 被恶意页面调用）；②参数校验——action 白名单 + 参数 schema 校验（H5 传 {url: "file:///etc/passwd"} 给文件下载 bridge 就是任意文件读）；③能力分级——只读能力（获取设备信息）宽松，写能力（支付/通讯录/定位）要求登录态 + 用户授权弹窗（Native 侧二次确认，不信任 H5 侧的"用户已同意"声明）。

性能注意：①避免高频桥调用——传感器数据、滚动位置同步这类每秒几十次的场景走"批量聚合"（Native 攒 100ms 数据一次推给 JS）或专用通道（WebSocket/共享内存）；②大对象传输——图片/base64 走桥很伤（序列化两次），改用"Native 存文件 → 传临时 URL"模式；③注入时机——Android 的 addJavascriptInterface 要在页面加载前注入，iOS WKUserScript 用 atDocumentStart，否则 H5 首屏脚本调 bridge 时是 undefined（经典白屏原因：bridge 未就绪就调用，需要 H5 侧做 ready 轮询或事件等待）。

真实案例：某 Hybrid App 的"分享"bridge 在大促页面被第三方统计 SDK 的 iframe 误触发（iframe 里也有 window.NativeBridge 引用），导致用户没点分享却弹分享面板——修复是 Native 侧校验调用来源 frame 的 origin。另一个经典坑：iOS WKWebView 的 evaluateJavaScript 有主线程要求且大量调用会堆积，某页面每秒 30 次 Native→JS 推数据导致 WebView 卡顿，改批量推送后恢复。教训：Bridge 是"跨进程 RPC"，用它就要有 RPC 的觉悟——超时、幂等、限流、鉴权一个不能少。`,
    keyPoints: ["JS→Native 三方式：Scheme 拦截（兼容）/注入 API（同步）/官方消息通道（推荐）；Native→JS 只有执行 JS 字符串", "回调管理=cbId 配对+超时清理+迟到丢弃；bridge 未就绪的 ready 等待是首屏必备", "安全：来源 origin 白名单+action 白名单+参数 schema 校验+写能力 Native 二次确认"],
    followUps: ["WebView 复用池（预创建/预加载）对 Hybrid 首屏的优化与内存代价？", "DSBridge 等开源库相比手写 Bridge 解决了哪些工程问题？"],
    favorited: false,
  },
  {
    id: "fe-314",
    nodeId: "cross-platform",
    question: "Taro / uni-app 的编译时跨端与 RN 的运行时跨端本质差异是什么？DSL 转译（React 语法 → 小程序 WXML）的局限性体现在哪些场景？",
    bigTech: true,
    answer: `结论：编译时跨端把 React/Vue 代码在构建期翻译成各端原生 DSL（小程序 WXML/WXSS/JS 三件套），运行时没有框架内核——产物就是目标平台的标准代码；运行时跨端（RN）是带着一个 JS 引擎和框架内核在目标平台上跑，通过桥接驱动原生组件。本质差异：编译式是"翻译官"（翻译完就离场，产物受目标平台规则全约束），运行时是"虚拟机"（自带运行时，能力上限由自己的桥决定）。这决定了编译式的问题在"翻译损耗"，运行时的问题在"桥接成本"。

\`\`\`jsx
// 编译式转译（Taro 3 React → 微信小程序）：
// 你写的：
function List({ items }) {
  const [expand, setExpand] = useState(false);
  return (
    <View onClick={() => setExpand(!expand)}>
      {items.filter(i => i.visible).map(i => <Item key={i.id} data={i} />)}
    </View>
  );
}
// 编译后（概念示意）：
// WXML: <view bindtap="onTap"><block wx:for="{{visibleItems}}" wx:key="id">...
// JS:   Page({ data: { visibleItems, expand }, onTap() { this.setData(...) } })
// React 的 JSX 动态结构 → 静态模板 + data 绑定 + setData 更新
// 关键：运行时是小程序的，Taro 只留一个薄运行时做 React 语义模拟（reconciler）
\`\`\`

DSL 转译的局限性（真实踩坑场景）：①动态 JSX 结构——WXML 模板是静态的，React 里"运行时拼 JSX"（如条件返回完全不同的组件树、children 动态加工、render props 深度嵌套）转译后语义可能失真，Taro 3 用"运行时 reconciler 模拟"缓解了大部分但仍有边界 case（如 dangerouslySetInnerHTML 等价物、Portals 在小程序没有对应物）；②复杂 CSS——小程序 WXSS 的选择器能力子集（不支持复杂的后代/兄弟选择器组合）、无 CSS 变量（旧版）、媒体查询受限，编译器无法把全量 CSS 语义带过去，只能降级或告警；③跨端能力差异——React 生态的库（react-spring 动画、复杂手势库）依赖 DOM API，小程序没有 DOM，这些库编译不过去，跨端项目只能用"最大公约数"能力的库；④调试失真——出 bug 时你看的是编译后的 WXML/JS，源码映射多一层转译，堆栈定位比原生小程序或 RN 都难；⑤平台新能力滞后——微信小程序出了新组件（如 skyline、新的开放能力），要等 Taro 官方适配，原生小程序当天就能用。

编译式 vs 运行时的选择逻辑：①要进小程序生态且想保留 React 技术栈 → 编译式唯一解（小程序不允许自带 JS 引擎跑框架，规则强制）；②多端覆盖（App+小程序+H5）且页面形态规整（表单/列表/详情为主）→ 编译式合适，接受公约数限制；③高频交互/复杂动画/长列表性能敏感 → 运行时（RN）或原生，编译式到小程序的性能受 setData 天花板限制（上一题）；④团队已有 React 组件库资产 → 编译式可复用部分（业务组件），但依赖 DOM 的底层组件（富文本/复杂手势）要重写。

真实案例：某 O2O 团队用 Taro 一套代码覆盖微信小程序 + 支付宝小程序 + H5，页面型业务（下单/地址/订单列表）复用率 85%，一年节省的人力成本可观——但地图页（复杂手势 + 大量原生 SDK 交互）最终回退到各端原生写，Taro 只做页面壳。这个"85/15 分割"是编译式跨端的典型健康形态：把"页面结构规整的业务"交给编译式（吃复用红利），把"平台能力深度耦合的页面"交给原生（吃体验上限）。另一个教训：某团队在 Taro 项目里重度使用 styled-components（运行时 CSS-in-JS），编译到小程序后样式注入走的是 setData 内联 style，高频更新场景性能崩盘——选型编译式框架就要接受它的样式范式（静态 CSS 文件优先），把 Web 生态的运行时习惯带过去必踩坑。`,
    keyPoints: ["编译式=翻译官（产物即目标平台标准代码，受平台规则约束）；运行时=虚拟机（自带内核+桥接，上限看桥）", "转译局限：动态 JSX/复杂 CSS 子集/DOM 生态库不可用/调试多一层映射/平台新能力滞后", "健康形态 85/15：规整页面吃复用，平台深度耦合页面回原生；样式走静态范式"],
    followUps: ["Taro 3 的运行时 reconciler 如何在小程序里模拟 React 语义？这个设计的性能代价？", "鸿蒙（ArkTS）加入后，编译式跨端框架的多端适配成本有什么变化？"],
    favorited: false,
  },
  {
    id: "fe-315",
    nodeId: "cross-platform",
    question: "Electron 应用架构：主进程与渲染进程的职责边界、IPC 通信模式、安全模型（contextIsolation / nodeIntegration / sandbox）如何设计？为什么 VS Code 要自研进程模型而不是裸用 Electron 默认？",
    bigTech: true,
    answer: `结论：Electron 架构的第一性原则——渲染进程是不可信的（它跑任意网页/UI 代码），主进程是特权层（持有文件系统/系统 API 全权限）。安全模型的核心是"最小权限下放到渲染进程"：nodeIntegration: false（渲染进程禁止直接 require Node API）、contextIsolation: true（preload 的隔离世界，防页面 JS 篡改桥接对象）、sandbox: true（渲染进程跑在 OS 沙箱里）。所有特权操作必须经 IPC 上溯到主进程执行，且 IPC 入参当公网输入校验。

\`\`\`ts
// 主进程（main.ts）：特权层
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // ❌ true = 网页可直接 fs.readFileSync("/etc/passwd")
    contextIsolation: true,        // ✅ preload 与页面 JS 隔离两个世界
    sandbox: true,                 // ✅ OS 级沙箱，渲染进程连 Node 都没有
    preload: path.join(__dirname, "preload.js"), // 唯一合法的桥
  },
});

// preload.ts：桥接层（在隔离世界运行，能碰 Node API 也暴露受控接口给页面）
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  // 只暴露"语义化方法"，绝不暴露 ipcRenderer 本身！
  readFile: (path: string) => ipcRenderer.invoke("fs:read", path),
  // ❌ 反模式：exposeInMainWorld("ipc", ipcRenderer)
  //    = 把 invoke 任意 channel 的能力给了页面，白名单形同虚设
});

// 主进程 handler：入参校验当公网 API 对待
ipcMain.handle("fs:read", async (event, path: unknown) => {
  if (typeof path !== "string" || path.includes("..")) {
    throw new Error("invalid path"); // 防路径穿越
  }
  const allowed = await assertInWorkspace(path); // 工作区白名单
  return fs.promises.readFile(allowed, "utf-8");
});

// 渲染进程：只能 window.api.readFile(...)，碰不到 ipcRenderer/Node
\`\`\`

IPC 通信模式选型：①invoke/handle（Promise 风格请求-响应，90% 场景用）；②send/on（单向事件，如渲染进程通知主进程"窗口要关"）；③webContents.send（主进程推渲染进程，如推送通知）；④MessagePort（高频双向数据流，如终端模拟器的 pty 数据——Electron 18+ 支持 MessageChannelMain，避免 ipc 序列化开销）。性能注意：IPC 默认走结构化克隆序列化，大对象（如读大文件返回 Buffer）有拷贝开销，高频场景用 MessagePort 或"主进程写临时文件 + 传路径"模式。

为什么 VS Code 自研进程模型：Electron 默认模型是"一个窗口 = 一个渲染进程"，VS Code 的场景击穿了这个假设——①扩展需要 Node 能力但扩展可能恶意/有 bug：VS Code 把扩展放到独立的 Extension Host 进程（不是渲染进程也不是主进程），扩展崩溃不拖垮 UI，扩展的 API 能力被严格代理（vscode.window.xxx 实际走 RPC）；②性能隔离：编辑器 UI 进程绝不允许被扩展的 CPU 密集操作（如全项目符号索引）卡住，进程边界 = 事件循环边界；③共享服务进程：文件监听、搜索、TS Server 这类服务被多个窗口共享，放独立的 SharedProcess。这套"主进程 + UI 进程 × N + Extension Host × N + SharedProcess"的模型本质是微内核架构——Electron 只是它的窗口容器，进程编排全自研。这给所有 Electron 应用的启示：默认模型只适合简单应用，一旦"第三方代码/重 CPU 任务/多窗口共享状态"出现，就要自己设计进程拓扑。

真实案例：①Slack/Discord 的崩溃恢复——渲染进程崩溃只弹"重新加载"而不是整个应用退出（主进程监听 render-process-gone），这是 Electron 应用的基线韧性；②某团队 Electron 应用把 nodeIntegration 开着跑内部系统，一次引入的 npm 依赖含恶意代码，直接读走了用户 SSH 私钥——渲染进程能 require 就意味着任何 XSS（哪怕是依赖投毒）都是系统级沦陷；③VS Code 的扩展沙箱演进——扩展历史上出过多个挖矿/盗 token 事件，所以市场扩展有签名与隔离推进，说明"插件生态的安全"最终都要走到进程隔离 + 能力代理这条路上。`,
    keyPoints: ["安全三件套：nodeIntegration:false + contextIsolation:true + sandbox:true；特权操作全走 IPC 白名单", "preload 只暴露语义化方法，暴露 ipcRenderer 本体=白名单失效；主进程入参按公网输入校验", "VS Code 微内核进程拓扑（UI/ExtHost/SharedProcess）证明：重场景下 Electron 只是窗口容器"],
    followUps: ["Electron 应用的自动更新（electron-updater）签名与灰度策略？", "Tauri 的「系统 WebView + Rust 核心」模型在安全边界上与 Electron 的差异？"],
    favorited: false,
  },
  {
    id: "fe-316",
    nodeId: "cross-platform",
    question: "跨端项目的代码同构工程：如何设计平台抽象层让业务代码最大化复用？条件编译、文件后缀分发、依赖注入三种隔离手段的适用场景与边界？",
    bigTech: true,
    answer: `结论：跨端同构的核心不是"一份代码到处跑"（那是宣传话术），而是"把平台差异收敛到可枚举的抽象点后复用其余全部"——健康项目的复用结构是：业务逻辑/状态管理/网络层/工具函数 100% 共享，UI 组件 60-80% 共享（设计系统统一的部分），平台适配层 0% 共享但只占 5-10% 代码量。三种隔离手段是同一个思想的不同粒度：文件后缀分发（模块级替换）、条件编译（代码块级裁剪）、依赖注入（运行时装配）。

\`\`\`ts
// ① 文件后缀分发（构建工具按平台解析优先级，最常用）
//    storage.web.ts / storage.weapp.ts / storage.rn.ts
//    import { storage } from "./storage" → 构建目标决定解析到哪个文件
// 适用：模块级平台差异（存储/网络/路由/支付），接口完全一致
// storage 抽象示例：
export interface Storage {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}
// storage.weapp.ts: 包 wx.getStorage；storage.web.ts: 包 localStorage；
// storage.rn.ts: 包 AsyncStorage——业务代码永远 import "./storage"

// ② 条件编译（代码块级，uni-app/Taro 的 #ifdef 或 webpack DefinePlugin）
const channel = /* #ifdef WEAPP */ "wechat" /* #endif */
  /* #ifdef H5 */ "h5" /* #endif */;
// 或构建期常量：if (process.env.PLATFORM === "weapp") { ... }（死代码消除会剪掉）
// 适用：小块逻辑分叉（一两行的平台判断），滥用会导致代码可读性崩坏
// 红线：同文件条件编译超过 3 处就该拆成后缀分发

// ③ 依赖注入（运行时装配，测试也受益）
// 业务层只依赖接口，平台层在入口注入实现：
interface PlatformDeps {
  storage: Storage;
  payment: Payment;
  tracker: Tracker;
}
export function createApp(deps: PlatformDeps) { /* 业务逻辑只碰 deps */ }
// entry.weapp.ts: createApp({ storage: weappStorage, payment: wxPay, ... })
// entry.web.ts:   createApp({ storage: webStorage, payment: stripePay, ... })
// 适用：有运行时差异决策（同平台不同渠道）+ 单测要 mock 的场景
\`\`\`

平台抽象层的设计要点（决定同构成败）：①抽象点枚举——先把所有平台差异列全（存储/网络/路由/分享/支付/推送/定位/文件/媒体/权限/登录/剪贴板/传感器），每个差异点定义 TS 接口，接口设计取"能力交集"而非"并集"（某平台独有的能力通过扩展接口可选暴露）；②抽象层禁止泄漏平台类型——接口的出入参不能出现 wx.xxx 或 DOM 类型（一旦泄漏，业务代码就被平台类型污染，复用率崩塌）；③能力探测而非平台探测——业务代码问"canShare()" 而不是 "isWeapp()"（平台判断散落各处后，新增平台要改 N 处；能力判断只需在适配层注册时声明）；④目录结构物理隔离——platforms/ 目录放全部适配实现，src/ 业务代码 lint 规则禁止 import platforms/ 以外任何平台 API（dependency-cruiser 守护）。

复用率的度量与红线：①度量——统计 import 平台适配层的业务文件比例（应 <10%）、平台特定代码行占比（应 <15%）；②红线信号——业务文件里出现平台判断 if、同一组件三套实现且差异 >50%、抽象接口出现 any——出现任何一个说明抽象在腐化；③演进规律——新功能先在抽象层加接口再实现，"先写死某平台再抽象"的路径几乎必然烂尾（抽象成本后置 = 永不抽象）。

真实案例：某工具型产品（Web + 小程序 + RN App）同构改造前三个端三套代码，需求吞吐量受制于最慢的小程序端。改造路径：①先统一网络层和状态管理（纯 JS 零 UI，两周完成，立刻三端共享）；②UI 层用 Taro 重写共享 70%，三个"平台气质强"的页面（分享海报/支付/地图）保留端原生；③抽象层 23 个接口，dependency-cruiser 守护边界。结果：新功能平均交付从"三端排期 3 周"变"一次开发 + 各端适配 2 天"，复用率稳定 78%。反面案例：某团队迷信"Write Once Run Anywhere"，把 RN 和 Web 的导航逻辑强行统一（RN 是栈导航，Web 是 URL 驱动），抽象出一个四不像的路由层，两端的高级能力（RN 的手势返回/Web 的浏览器前进后退）全被阉割——教训：同构抽象的是"业务语义"（去详情页），不是"平台机制"（导航栈操作），机制差异必须留给平台层。`,
    keyPoints: ["健康复用结构：逻辑/状态/网络 100% 共享，UI 60-80%，适配层 0% 共享但只占 5-10%", "三手段粒度：后缀分发=模块级 / 条件编译=代码块级（≤3 处）/ 依赖注入=运行时装配", "抽象设计：能力探测非平台探测、接口不泄漏平台类型、lint 守护边界、度量复用率"],
    followUps: ["设计系统跨端统一（设计令牌→各端主题）的工程链路怎么搭？", "Monorepo 中跨端共享包的构建目标差异（web ESM / 小程序 CJS）如何编排？"],
    favorited: false,
  },
  {
    id: "fe-317",
    nodeId: "cross-platform",
    question: "跨端性能优化实战：RN 长列表卡顿、小程序 setData 风暴、H5 动画掉帧三类典型问题的根因与优化方案？各端的性能分析工具怎么用？",
    bigTech: true,
    answer: `结论：三端性能问题的共同根因是"更新量超过帧预算（16.6ms）"，但超支的来源不同——RN 卡在 JS 线程与 UI 线程的协调（JS 算布局慢了，UI 就断粮），小程序卡在 setData 的序列化传输（数据量 × 频率），H5 卡在主线程的布局/绘制成本（触发 reflow 的属性滥用）。优化的共同范式：减少更新量（虚拟化/增量更新）、挪出关键路径（脱离 JS 线程/用合成器属性）、测量定位（先用工具找到耗时点再优化）。

\`\`\`jsx
// ① RN 长列表卡顿根因：FlatList 默认配置保守 + 复杂 cell 的 JS 布局成本
<FlatList
  data={items}
  // 优化四件套：
  windowSize={5}              // 渲染窗口（默认 10 屏 → 5 屏，内存/初始化减半）
  initialNumToRender={8}      // 首屏条数（够一屏就行，别默认 10+）
  maxToRenderPerBatch={5}     // 每批增量渲染数
  removeClippedSubviews       // 屏外卸载原生视图（Android 收益大）
  getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
  // ↑ 固定高度时提供此项 = 跳过动态测量，滚动定位 O(1)
  renderItem={renderItem}     // memo 化 cell：React.memo(Item) 防全表重渲染
/>
// 根因深挖：cell 里有图片+视频+复杂布局时，换 FlashList（回收复用 cell，
// 类似 iOS UITableView 的 dequeueReusableCell，内存和初始化成本数量级下降）
// JS 线程保护：列表数据变换（filter/sort）用 useMemo + InteractionManager
// 把重计算推迟到交互动画结束后

// ② 小程序 setData 风暴（前面题目详解过，此处列工具与验证）
// 微信开发者工具 → Audits 面板：setData 频率/数据量直方图
// 体验评分 → "避免 setData 数据量过大/频率过高" 是高频扣分项
// 验证手段：Page 里 wrap setData 打日志，统计单次 KB 数与每秒次数

// ③ H5 动画掉帧：用了触发 layout 的属性做动画
// ❌ 每帧 reflow：el.style.left = x + "px"（left/top/width/height 都触发布局）
// ✅ 合成器属性（跳过 layout/paint，GPU 直接合成）：
el.style.transform = \`translateX(\${x}px)\`;
el.style.opacity = "0.8";
// will-change 预提层（但滥用会爆显存：每个提层都是一份位图内存）
// 长列表：content-visibility: auto（屏外跳过渲染）+ contain-intrinsic-size 占位
\`\`\`

性能分析工具速查：①RN——Hermes Profiler（Chrome DevTools 直接采 JS 火焰图）、Perf Monitor（FPS 双曲线：JS fps 和 UI fps 分开看，哪个掉就是哪边的问题）、Systrace（原生层耗时）；②小程序——开发者工具 Audits/体验评分、真机调试的 Trace 面板（setData 调用瀑布）、Performance 面板（渲染层帧率）；③H5——Chrome Performance 面板（录制一帧看 Long Task 归属：Scripting/Rendering/Painting 三色比例）、Layers 面板（合成层爆炸检查）、Rendering 工具的 Paint Flashing（重绘区域可视化——整个页面闪绿说明提层失败）。

共性优化心法：①先定位线程/进程边界——性能问题先问"慢在哪条线程"（RN: JS or UI；小程序： 逻辑层 or 渲染层；H5: 主线程 or 合成器），不同侧的药完全不同；②帧预算会计——把一帧 16.6ms 拆开记账（JS 执行 X ms + 序列化 Y ms + 布局 Z ms），优化就是削减最大科目；③降级预案——低端机检测（RN: DeviceInfo；小程序： 系统信息 API；H5: deviceMemory/hardwareConcurrency）后主动降配（关动画/减列表窗口/降图质量），让低端机"流畅的简陋"好过"卡顿的精美"。

真实案例：①RN 信息流页 JS fps 掉到 20——Profiler 发现每次滚动都触发"全部已渲染 cell 的重新 render"（父组件 state 变了），cell 全部 React.memo + state 下沉后恢复 58fps；②小程序首页 setData 每秒 40 次（倒计时 + 轮播 + 埋点上报共用数据通道），拆数据通道 + 倒计时改纯样式动画后降到 8 次，低端机卡顿投诉消失；③H5 活动页 iPhone Safari 掉帧——Performance 面板发现 backdrop-filter: blur(20px) 全屏使用（每帧重绘成本爆炸），改成小面积毛玻璃 + 背景预模糊图片后满帧。卡帕西视角：性能优化的第一刀永远是测量，第二刀是删（减更新量），第三刀才是换（换实现/换架构）——大多数人直接跳到第三刀，所以总是在错误的层优化。`,
    keyPoints: ["共同根因=帧预算超支，但超支位置不同：RN 在 JS 线程 / 小程序在序列化传输 / H5 在布局绘制", "RN 列表四件套+FlashList 复用；小程序拆数据通道；H5 动画只用 transform/opacity 合成器属性", "先定位慢在哪条线程再开药；帧预算记账找最大科目；低端机主动降级"],
    followUps: ["RN 的 Reanimated（UI 线程跑动画）与普通 Animated 的架构差异？", "content-visibility 与虚拟列表的适用边界（什么时候前者就够，什么时候必须上虚拟化）？"],
    favorited: false,
  },
  // ===== 架构设计层：前端设计模式（fe-318~fe-325） =====
  {
    id: "fe-318",
    nodeId: "design-patterns-fe",
    question: "观察者模式与发布订阅模式的本质区别是什么？EventEmitter、DOM 事件、Redux 各自属于哪种？为什么大型应用更倾向发布订阅？",
    bigTech: true,
    answer: `结论：两者都是"一对多的状态通知"，区别在于**有没有中间人**——观察者模式里 Subject 直接持有 Observer 列表并逐个调用（双方互相认识，紧耦合），发布订阅模式里 Publisher 和 Subscriber 之间隔着一个事件中心/Broker（双方互不认识，只认频道名，松耦合）。判断依据就一条：订阅者注册时，是把回调交给了"被观察者本体"还是"第三方调度中心"。

\`\`\`js
// ① 观察者模式：Subject 直接持有 observers（互相认识）
class Subject {
  private observers: Array<(data: unknown) => void> = [];
  addObserver(fn: (data: unknown) => void) { this.observers.push(fn); }
  notify(data: unknown) { this.observers.forEach((fn) => fn(data)); } // 直接调用
}

// ② 发布订阅模式：事件中心做 Broker（双方只认频道名）
class EventBus {
  private channels = new Map<string, Set<(data: unknown) => void>>();
  on(channel: string, fn: (data: unknown) => void) {
    if (!this.channels.has(channel)) this.channels.set(channel, new Set());
    this.channels.get(channel)!.add(fn);
    return () => this.off(channel, fn); // 返回取消函数（防泄漏的关键设计）
  }
  emit(channel: string, data: unknown) {
    this.channels.get(channel)?.forEach((fn) => {
      try { fn(data); } catch (e) { console.error(e); } // 单个订阅者崩不阻塞其他
    });
  }
  off(channel: string, fn: (data: unknown) => void) {
    this.channels.get(channel)?.delete(fn);
  }
}
// 发布者不知道订阅者是谁，订阅者不知道发布者是谁——只知道 "order:paid" 频道
\`\`\`

常见实现归类（面试高频辨析）：①EventEmitter（Node）——典型的发布订阅（on/emit 通过事件名解耦）；②DOM 事件 addEventListener——形式上是观察者（直接在元素上注册），但事件冒泡机制让它有"沿捕获/冒泡链传播"的调度层，实际更接近"DOM 树当 Broker"的发布订阅变体；③Redux——store.subscribe 是观察者模式（直接注册到 store），但 Flux 架构整体（action → dispatcher → store → view）是发布订阅思想：组件不依赖具体数据源，只响应 action 频道；④Vue2 的响应式——Dep 与 Watcher 是教科书级观察者模式（Dep 直接持有 Watcher 列表）；⑤RxJS——观察者模式的工业化实现（Observable 就是 Subject，加了操作符管线和背压）。

为什么大型应用倾向发布订阅：①跨模块通信不引入依赖——订单模块完成支付后 emit("order:paid")，积分/通知/库存模块各自订阅，订单模块不需要 import 它们（否则订单模块成了"上帝模块"，改积分逻辑要动订单代码）；②动态增减订阅者——新需求"支付成功发企业微信通知"只需新增一个订阅，不改发布方（开闭原则）；③可测试性——发布方可以脱离订阅方单测。代价同样明显：①事件流不可追踪——页面出了 bug 要全局搜谁 emit 了 "user:update"（解法：TypeScript 给事件名建联合类型 + 事件注册表集中声明）；②内存泄漏——订阅了忘取消（组件卸载时 off，React 里 useEffect 返回清理函数）；③隐式时序——订阅顺序影响执行结果，产生"换个 import 顺序 bug 复现不了"的灵异事件。

真实案例：①某中后台项目用 EventBus 通信上瘾，40+ 事件频道无文档，一次重构把 "filter:change" 改名 "filter:update"，漏改了一个订阅处，筛选失效三天才发现——之后立规：所有事件名必须注册在 src/events/registry.ts 的常量里，禁止字符串字面量直接 emit；②VS Code 的核心架构就是巨型发布订阅（vscode.EventEmitter 贯穿扩展 API），但它用"显式 disposable 对象"强制订阅者管理生命周期（每个订阅返回 Disposable，扩展 deactivate 时必须 dispose 全部）——这是把"防泄漏"做进 API 设计的典范。卡帕西视角：模式的选型不是背定义，是回答"耦合的代价谁承担"——观察者把耦合留在编译期（import 关系可见），发布订阅把耦合推到运行期（事件流黑盒），大型应用选后者是因为编译期耦合的修改成本更高，但必须用工程手段（事件注册表/类型化/disposable）把运行期黑盒照亮。`,
    keyPoints: ["区别=有无 Broker：观察者互相认识（Subject 直持列表），发布订阅只认频道（事件中心解耦）", "归类：EventEmitter/Flux 是发布订阅，Vue2 Dep-Watcher/RxJS 是观察者，DOM 事件是带冒泡调度的变体", "发布订阅三大坑：事件流不可追踪（用类型化注册表）/订阅泄漏（返回 disposable）/隐式时序"],
    followUps: ["RxJS 的 Subject/BehaviorSubject/ReplaySubject 在缓存语义上的差异与适用场景？", "为什么 React 生态最终放弃了全局 EventBus 而转向单向数据流（Context/状态库）？"],
    favorited: false,
  },
  {
    id: "fe-319",
    nodeId: "design-patterns-fe",
    question: "单例模式在前端的正确实现方式是什么？为什么说 ES Module 本身就是单例？全局状态库（Redux/Zustand）与单例是什么关系？",
    bigTech: true,
    answer: `结论：前端不需要 Java 式的"私有构造函数 + getInstance"样板——ES Module 的模块缓存机制天然保证单例（同一模块路径在整个应用生命周期只执行一次，导出的对象天然全局唯一）。但要警惕三个"单例失效"场景：多实例打包（同一库被打进多个 bundle）、微前端多运行时、SSR 跨请求污染（模块级状态在 Node 服务端是跨用户共享的）。

\`\`\`ts
// ① ESM 天然单例：模块只执行一次，导出的实例全局唯一
// api-client.ts
class ApiClient {
  private token: string | null = null;
  setToken(t: string) { this.token = t; }
  getToken() { return this.token; }
}
export const apiClient = new ApiClient(); // 整个应用共享这一个实例

// ② 惰性单例（需要延迟初始化/依赖注入参数时用）
let instance: ApiClient | null = null;
export function getApiClient(): ApiClient {
  if (!instance) {
    instance = new ApiClient(); // 首次调用才创建
  }
  return instance;
}
// 惰性版的价值：单测时可以 reset（暴露 _resetForTest），也可以在创建时注入配置

// ③ ❌ SSR 陷阱：模块级单例在 Node 服务端跨请求共享 = 用户数据串号！
// request-cache.ts（Next.js/Nuxt API 层千万别这么写）
const cache = new Map<string, unknown>(); // 模块级 = 所有用户共享！
export function setUserCache(id: string, data: unknown) { cache.set(id, data); }
// 用户 A 的缓存可能被用户 B 的请求读到——正确做法：挂到请求上下文（AsyncLocalStorage）
\`\`\`

单例失效的三大场景剖析：①多 bundle 场景——主应用和异步 chunk 如果各自打包了一份 "api-client"（webpack 配置不当或 pnpm 幽灵依赖导致两份物理文件），就是两个单例，token 在主应用设了 chunk 里读不到。解法：webpack/vite 的 dedupe、externals 公共依赖、Module Federation 的 shared 配置；②微前端——主子应用各自有自己的模块系统，qiankun 里主应用的单例子应用拿不到（除非显式挂 window 或走 props/initGlobalState 通信）。这也是"微前端里慎用模块单例传状态"的原因——状态要么走主应用中转，要么走持久层；③SSR——如上代码，Node 进程的模块缓存是进程级的，浏览器是"每个标签页一个 JS 环境"所以没有跨用户问题，服务端有。Next.js 官方文档专门警告：模块级可变状态 = SSR 数据泄漏重灾区。

Redux/Zustand 与单例的关系：它们本质都是"受控单例"——Zustand 的 create() 返回的 store 就是模块级单例（所以官方文档也提醒 SSR 要用 createStore + Provider 每请求创建）；Redux 的 store 通常模块级导出，但设计为"单一数据源"这个架构约束本身就是单例思想的正面应用：状态全局唯一，但**访问被规范约束**（只能通过 dispatch 改，只能通过 selector 读）。这是单例模式的精髓：单例的问题从来不是"全局唯一"，而是"全局唯一的可变状态 + 无约束的访问路径"。Redux 用 action/reducer 约束了写入路径，Zustand 用 set 函数约束，所以它们是"好的单例"。

真实案例：①某团队 SDK 被业务方 npm 安装后又被打包进业务的 vendor chunk，CDN 上还有一份独立版——运行时三份 SDK 实例，埋点队列分裂，数据丢失 30%，排查一周才发现 webpack 的 resolve.alias 没对齐；②Next.js 项目把 PrismaClient 直接模块级 new 出来，开发环境热更新每次都新建连接但不释放，数据库连接数打爆——官方解法就是"全局单例 + globalThis 缓存"（const globalForPrisma = globalThis，热更新时复用 globalThis 上已有的实例）；③微前端项目主应用挂载时把用户信息写进主应用的 authStore 单例，子应用直接 import 主应用的 store 包——联调正常，独立部署子应用时全挂。最终方案：主子通信只用 qiankun initGlobalState，store 不再跨应用共享。教训：单例的边界 = 模块系统的边界 = 部署/运行时的边界，跨边界共享状态必须走显式通信而非隐式单例。`,
    keyPoints: ["ESM 模块缓存=天然单例，惰性单例只为延迟初始化/单测 reset；SSR 模块级状态跨用户共享=数据串号", "单例失效三场景：多 bundle 打包分裂/微前端多运行时/SSR 进程级共享", "Redux/Zustand=受控单例：单例的恶不在全局唯一，而在可变状态+无约束访问路径"],
    followUps: ["Next.js 中 PrismaClient 用 globalThis 缓存的写法为什么能解决热更新连接泄漏？", "微前端主子应用共享状态，initGlobalState 与挂 window 的取舍？"],
    favorited: false,
  },
  {
    id: "fe-320",
    nodeId: "design-patterns-fe",
    question: "策略模式如何消除前端的大型 if-else/switch？以表单校验、权限渲染、多渠道分享为例说明，策略注册表与策略工厂各适合什么场景？",
    bigTech: true,
    answer: `结论：策略模式的前端价值不是"优雅"，而是**把"会一起变化的分支"收敛到一张表里**——if-else 的问题不在分支多，在于"新增一种情况要改动分散在各处的 N 个分支"，违反开闭原则。策略模式把每个分支抽成独立策略对象，用 Map/对象注册表索引，新增情况 = 新增一个条目 + 注册，不改既有代码。判断该不该用：分支是否随业务持续增加？是，上策略表；三五个分支十年不变，if-else 就是最简实现，过度设计反而增加阅读成本。

\`\`\`tsx
// ① 表单校验：反模式是校验逻辑堆在 onSubmit 里
function validate(values: FormValues): string | null {
  if (!values.email) return "邮箱必填";
  if (!/^[^@]+@[^@]+$/.test(values.email)) return "邮箱格式错误";
  if (values.age < 18) return "年龄需 >= 18";
  // ...每加一个字段改这个函数，函数膨胀到 200 行
}

// ✅ 策略注册表：每个字段/规则是独立策略，可组合可复用
type Validator = (value: unknown, ctx: FormValues) => string | null;
const required: Validator = (v) => (v == null || v === "" ? "必填" : null);
const pattern = (re: RegExp, msg: string): Validator => (v) =>
  typeof v === "string" && !re.test(v) ? msg : null;
const min = (n: number, msg: string): Validator => (v) =>
  typeof v === "number" && v < n ? msg : null;

// 声明式 schema：字段 → 策略数组（新增字段=新增一行，不改引擎）
const schema: Record<string, Validator[]> = {
  email: [required, pattern(/^[^@]+@[^@]+$/, "邮箱格式错误")],
  age: [required, min(18, "年龄需 >= 18")],
};
function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      const msg = rule(values[field as keyof FormValues], values);
      if (msg) { errors[field] = msg; break; } // 首错即停
    }
  }
  return errors;
}
// 这就是 react-hook-form + zod/yup 的设计原型：schema 声明，引擎执行

// ② 权限渲染：反模式是组件里塞满角色判断
function ActionPanel({ role }: { role: string }) {
  return (
    <div>
      {role === "admin" && <Button>删除</Button>}
      {(role === "admin" || role === "editor") && <Button>编辑</Button>}
      {/* 角色组合一多，JSX 里全是逻辑表达式，权限审计无从谈起 */}
    </div>
  );
}

// ✅ 策略表 + 能力声明：权限收敛到一张矩阵表
const PERMISSIONS = {
  "article:delete": ["admin"],
  "article:edit": ["admin", "editor"],
  "article:view": ["admin", "editor", "viewer"],
} as const;
const can = (action: keyof typeof PERMISSIONS, role: string) =>
  (PERMISSIONS[action] as readonly string[]).includes(role);
function ActionPanel({ role }: { role: string }) {
  return (
    <div>
      {can("article:delete", role) && <Button>删除</Button>}
      {can("article:edit", role) && <Button>编辑</Button>}
    </div>
  );
}
// 收益：权限矩阵可以导出给产品/安全团队评审，组件里零业务逻辑判断
\`\`\`

策略注册表 vs 策略工厂的选择：①注册表（Map/对象字面量）——策略是**静态已知**的，启动时全部注册（如权限矩阵、分享渠道、埋点通道），优点是简单直白、Tree-shaking 友好；②工厂（函数按 key 创建策略实例）——策略**创建有成本或依赖运行时参数**（如每个渠道要初始化不同 SDK、校验器要带配置），工厂延迟创建 + 缓存实例；③进阶：两者组合——注册表存"策略工厂"而非"策略实例"，取用方第一次使用时工厂创建并缓存（惰性单例 + 策略模式的合体）。

多渠道分享的真实演进案例：早期代码 handleShare(channel) 里 switch 7 个 case，每个 case 调不同 SDK，新增"小红书渠道"要改 4 处（switch、按钮列表、图标映射、埋点）。重构为策略表：每个渠道是一个对象 { key, label, icon, available(): boolean, share(content): Promise<void>, track(): void }，注册在 channels/ 目录下每个文件一个渠道，index.ts 统一导出 Map。新增渠道 = 新增一个文件 + 一行注册，老代码零改动。意外收益：渠道能力检测（available）抽出来做"只展示当前环境可用渠道"（微信内显示微信分享，APP 内显示原生分享），这个需求用 switch 写法几乎无法干净实现。坑的教训：策略表的 key 必须是联合类型而非裸 string——曾有同事注册 "xiaohongshu" 但消费处写 "redbook"，类型系统本可拦截，裸 string 放行后到线上才发现该渠道静默失效。

卡帕西视角：策略模式的本质是"用数据结构（表）替代控制结构（分支）"——表可以导出、可以评审、可以类型化、可以运行时增删，分支语句什么都不能。当你第三次给同一个 switch 加 case，就是该把它变成表的时刻。`,
    keyPoints: ["策略=用数据表替代分支语句：新增情况=加条目注册，不改既有代码（开闭原则）", "注册表适合静态已知策略（权限矩阵/渠道列表），工厂适合创建有成本/需运行时参数的策略", "策略 key 必须类型化（联合类型），裸 string 注册导致 key 不匹配静默失效"],
    followUps: ["zod 的 schema 校验与手写策略表的取舍（声明式 schema 何时值得引入）？", "策略模式与享元模式在大型列表渲染（千行表格单元格）中的组合应用？"],
    favorited: false,
  },
  {
    id: "fe-321",
    nodeId: "design-patterns-fe",
    question: "责任链模式与中间件机制的关系是什么？Koa 洋葱模型、Redux middleware、axios 拦截器三种实现的核心差异？如何中断链与传递上下文？",
    bigTech: true,
    answer: `结论：中间件是责任链的"双向增强版"——经典责任链是"请求沿链传递，任一节点处理或转发"（单向、单处理者），中间件是"每个节点都能在 next() 前后做事"（双向穿越、全节点参与）。Koa 洋葱模型是中间件的极致形态（异步递归穿越），Redux middleware 是同步嵌套调用，axios 拦截器是数组顺序执行（请求拦截器栈式逆序、响应拦截器队列顺序）。三者的共同抽象：把横切逻辑（日志/鉴权/错误处理/数据转换）从业务函数里剥离，挂到可组合的链上。

\`\`\`ts
// ① Koa 洋葱模型：compose 把中间件数组合成一个嵌套调用
type Next = () => Promise<void>;
type Middleware = (ctx: Ctx, next: Next) => Promise<void>;

function compose(middlewares: Middleware[]): (ctx: Ctx) => Promise<void> {
  return (ctx) => {
    const dispatch = (i: number): Promise<void> => {
      const mw = middlewares[i];
      if (!mw) return Promise.resolve(); // 链尾
      // 关键：把"下一个 dispatch"作为 next 传给当前中间件
      return mw(ctx, () => dispatch(i + 1));
    };
    return dispatch(0);
  };
}
// 执行顺序：mw1 前 → mw2 前 → mw3 → mw2 后 → mw1 后（洋葱：进去再出来）
// 应用：mw1 日志计时（await next() 后算耗时）、mw2 错误捕获（try{await next()}catch）
// mw3 鉴权（不通过就 return，不调 next → 链中断，但外层的"后"部分仍会执行！）

// ② Redux middleware：同步嵌套（store.dispatch 被层层包装）
const logger = (store: Store) => (next: Dispatch) => (action: Action) => {
  console.log("dispatching", action.type);
  const result = next(action); // 同步调用下一个
  console.log("next state", store.getState());
  return result;
};
// applyMiddleware(thunk, logger) 的洋葱：thunk 外 → logger → 真实 dispatch
// thunk 的特殊性：它能"吞掉"函数 action 不往下传（函数 action 到达不了 reducer）

// ③ axios 拦截器：不是洋葱！是两个独立数组
// 请求拦截器：后注册的先执行（栈/unshift），响应拦截器：先注册的先执行（队列/push）
axios.interceptors.request.use(injectToken);   // 注册顺序 A B → 执行 B A
axios.interceptors.response.use(unwrapData);
// 没有 next()——每个拦截器只能 return config（继续）或 throw（中断进 catch）
\`\`\`

核心差异与设计取舍：①穿越方式——Koa 的 next() 是"显式控制权移交"（中间件决定何时/是否继续，还能在回来后做事），Redux 是同步嵌套（同上但无异步语义，Redux Toolkit 建议异步逻辑用 thunk/listener 而非 middleware 里 setTimeout），axios 无 next 概念（链不可暂停后恢复，只能中断）；②中断语义——Koa 里不调 next() 内层不执行但外层"回程代码"照常（所以鉴权中间件要把"设置 401"放在不调 next 的分支里，且外层错误处理仍能兜住），axios 里 throw 直接跳 response 的 rejected 链（后续 fulfilled 拦截器全跳过）；③上下文传递——Koa 有共享 ctx 对象（挂载 state 跨中间件传值），Redux middleware 共享 store 引用，axios 靠 config 对象随链传递（headers 注入就是改 config）。

真实案例：①某 Koa 网关的错误处理中间件写成了 try { await next() } catch，但鉴权中间件在 catch 到下游业务错误时误把 500 也当鉴权失败返回 401——责任链的错误语义没对齐：错误处理必须是最外层中间件（第一个注册），鉴权失败应该"不调 next + 设置状态码"而非 throw（throw 会被外层当系统错误记 error 日志，401 是业务正常分支不该刷 error）；②Redux 项目把"路由跳转"写在 middleware 里拦截特定 action 后 history.push，迁移到 React Router v6 时 middleware 拿不到 navigate 函数（组件外），连锁重构——教训：副作用跳转该用 listener middleware 或在组件层 useEffect，middleware 里做导航是把框架耦合进数据流；③axios 项目两个请求拦截器都加 token，A 加 Authorization、B 又覆盖一遍，顺序因为是栈式执行与直觉相反（后注册先执行），线上出现"永远用旧 token"的 bug——拦截器顺序必须写进 README 并用 eject/use 的返回值管理。

面试加分的洞察：洋葱模型的精髓是" await next() 把异步栈帧串成了链"，这在生成器时代（co + yield）就存在，async/await 让它变得直白。而 Express（connect 派）的中间件是"线性流水"（next(err) 只往下走不回头），Koa 重写成洋葱就是为了拿到"回程能力"——错误统一处理、响应时间统计、事务提交/回滚这类"需要包住整个请求生命周期"的逻辑，线性模型做不了。这个演进史答出来，面试官就知道你理解的是设计动机而非 API 形状。`,
    keyPoints: ["中间件=责任链双向增强版：next() 前后都能做事；Koa 洋葱异步递归，Redux 同步嵌套，axios 双数组无回程", "中断语义差异：Koa 不调 next 内层停但外层回程照走；axios throw 跳 rejected 链", "Koa 洋葱解决了 Express 线性模型做不了的「包裹整个生命周期」逻辑（统一错误/计时/事务）"],
    followUps: ["Koa compose 如何防止同一中间件 next() 被调用两次（重复 dispatch 检测）？", "Redux listener middleware 与 saga/observable 在副作用编排上的取舍？"],
    favorited: false,
  },
  {
    id: "fe-322",
    nodeId: "design-patterns-fe",
    question: "装饰器模式在前端的两种形态（TS decorator 语法 vs 高阶函数/HOC）各有什么适用场景？mobx、Angular、Nest 为什么重度依赖装饰器？装饰器的执行顺序陷阱是什么？",
    bigTech: true,
    answer: `结论：装饰器的本质是"在不改原函数/类的前提下，包裹额外行为"——TS decorator 语法（@log class Foo）是编译期的声明式包装，高阶函数/HOC 是运行时的显式包装。声明式的价值是"横切关注点可视化"（一眼看到这个类被观察、被注入、被路由注册），代价是黑盒魔法（装饰器执行顺序、元数据反射机制不直观）。mobx/Angular/Nest 重度依赖是因为它们要收集"类的结构元数据"来做框架级编排（依赖注入、响应式追踪、路由注册），装饰器是目前 JS/TS 里最紧凑的元数据标注语法。

\`\`\`ts
// ① 方法装饰器：AOP 的经典应用（日志/性能/权限切面）
function measure(target: object, key: string, desc: PropertyDescriptor) {
  const original = desc.value as (...args: unknown[]) => unknown;
  desc.value = function (...args: unknown[]) {
    const t0 = performance.now();
    const result = original.apply(this, args);
    console.log(key + " took " + (performance.now() - t0) + "ms");
    return result;
  };
  return desc;
}
class DataService {
  @measure
  async fetchReport() { /* 业务代码不知道自己在被计时 */ }
}

// ② 属性/参数装饰器 + 元数据：mobx/Nest 的核心机制
// Nest 的路由注册：@Get("/users") 把 "GET /users → findAll" 写进 Reflect 元数据
// 框架启动时扫一遍元数据表，生成路由表——业务代码只写标注，框架做编排
class UsersController {
  @Get("/users")
  findAll(@Query("page") page: number) {}
}

// ③ HOC（React 的运行时装饰）：逻辑包装组件
function withLoading<P extends object>(Comp: React.ComponentType<P>) {
  return function Wrapped(props: P & { loading: boolean }) {
    if (props.loading) return <Spinner />;
    return <Comp {...props} />;
  };
}
const UserListWithLoading = withLoading(UserList);
// Hooks 时代 HOC 大部分场景被替代（useLoading 更直白），
// 但"包装第三方组件不能改其内部"时 HOC 仍是唯一解
\`\`\`

两种形态的适用边界：①TS decorator 适合"框架编排层的元数据标注"——路由、依赖注入、序列化规则、ORM 映射（typeorm 的 @Entity/@Column），共同点是"标注给框架看，不是给人调用的"；②HOC/高阶函数适合"应用层的运行时行为包装"——权限包裹、埋点注入、错误边界、props 适配，共同点是"包装逻辑本身是业务的一部分，需要显式可见可测"。经验法则：如果包装行为需要 React 生命周期/状态，用 HOC 或 Hooks；如果只是给类附加"声明信息"，用装饰器。

执行顺序陷阱（面试高频坑）：①多个装饰器装饰同一目标时，**求值从上到下，执行从下到上**——@A @B class Foo 等价于 A(B(Foo))，B 先执行（离目标近的先包，像洋葱一样从里往外）；②类的成员装饰器先于类装饰器执行（先收集完所有成员的元数据，类装饰器才能读到完整信息）；③方法装饰器里 desc.value 被替换后，后续装饰器拿到的是包装后的版本——顺序错了会出现"计时装饰器测的是权限装饰器的耗时"这种套娃测量；④TS 的 experimentalDecorators 是旧 stage-2 提案语义，与 TC39 stage-3 标准（TS 5.0 原生支持）不兼容——旧语义允许参数装饰器和新语义不同，混用 babel 插件与 tsc 时装饰器行为可能静默分裂，项目必须全链路统一一种语义。真实事故：某 Nest 项目升级 TS 5 时 babel 配置还留着旧插件，参数装饰器的元数据顺序反了，@Body 和 @Query 注错位置，接口参数全部错位——这类 bug 类型系统检测不到，只能靠装饰器语义统一 + 集成测试兜底。

为什么 Angular/Nest 离不开发装饰器：依赖注入容器需要"类 → 依赖列表"的映射，装饰器 @Injectable() + constructor(private userSvc: UserService) 配合 TS 编译时发射的 design:paramtypes 元数据，容器就能自动解析依赖图。没有装饰器就得手写 factory 注册（InversifyJS 早期风格），样板爆炸。这是"框架用装饰器买开发体验，用元数据反射付运行时成本"的经典权衡。卡帕西视角：装饰器是语法糖里掺了魔法——小规模用（日志/计时切面）是免费的午餐，框架级用（DI/路由）是把控制权抵押给元数据系统，后者必须配"元数据可视化工具 + 集成测试"，否则调试时你在和看不见的系统搏斗。`,
    keyPoints: ["decorator=编译期元数据标注（给框架编排用），HOC=运行时显式包装（业务逻辑复用）", "执行顺序：求值从上到下、执行从下到上（洋葱式包裹）；成员装饰器先于类装饰器", "TS experimentalDecorators（旧 stage-2）与 stage-3 标准不兼容，全工具链必须统一否则元数据静默错乱"],
    followUps: ["TC39 stage-3 装饰器标准与 TS 旧语义的具体差异（参数装饰器为何被移除）？", "MobX 的 makeObservable 显式 API 相比 @observable 装饰器解决了什么问题？"],
    favorited: false,
  },
  {
    id: "fe-323",
    nodeId: "design-patterns-fe",
    question: "适配器模式在前端的典型应用有哪些？以接口数据适配、第三方库包装、新旧 API 兼容为例说明。适配器与防腐层（ACL）的关系？",
    bigTech: true,
    answer: `结论：适配器模式的前端使命是"**隔离不稳定的接口形状**"——后端返回的数据结构、第三方 SDK 的 API、浏览器兼容差异，都是"你控制不了但会变"的东西。适配器在边界处把它们转换成应用内部的稳定模型（Domain Model），让业务代码只依赖自己的模型。当后端字段改名、SDK 升级 breaking change、换供应商时，改动收敛在适配器一个文件里。防腐层（ACL）是 DDD 里的概念，本质就是"系统边界的适配器集合 + 语义翻译"，适配器是战术（单个转换函数），防腐层是战略（整个边界层的架构决策）。

\`\`\`ts
// ① 接口数据适配（最普遍）：后端模型 ≠ 前端视图模型
// 后端返回：{ user_name, avatar_url, create_time: 1719800000, is_vip: 0 }
// 反模式：组件里到处 user.user_name、手动除 1000 转时间戳——后端一改名全站搜索替换
interface UserDTO {
  user_name: string;
  avatar_url: string;
  create_time: number;
  is_vip: 0 | 1;
}
interface User { // 应用内部模型：语义化、类型精确、单位统一
  name: string;
  avatar: string;
  createdAt: Date;
  isVip: boolean;
}
function adaptUser(dto: UserDTO): User {
  return {
    name: dto.user_name,
    avatar: dto.avatar_url || "/default-avatar.png", // 边界处兜底，组件不做判空
    createdAt: new Date(dto.create_time * 1000),     // 边界处统一单位
    isVip: dto.is_vip === 1,                         // 边界处语义化
  };
}
// 组件只认 User；后端改版只改 adaptUser；适配层还可以顺手做 zod 校验（DTO 不可信）

// ② 第三方库包装（换供应商的保险）：图表库适配
// 应用内定义自己的图表配置模型，不直接暴露 echarts/highcharts 的 API
interface ChartConfig { type: "line" | "bar"; series: number[][]; }
interface ChartAdapter {
  mount(el: HTMLElement, config: ChartConfig): void;
  update(config: ChartConfig): void;
  dispose(): void;
}
class EChartsAdapter implements ChartAdapter { /* echarts 特定实现 */ }
// 业务组件只 import ChartAdapter 接口和工厂
// 某天要换 uPlot（性能原因）→ 新增 UPlotAdapter，业务代码零改动

// ③ 新旧 API 兼容（渐进迁移）：老组件适配新 hooks
function useLegacyData(props: LegacyProps) {
  // 老组件期望 dataSource 对象，新数据源是 react-query
  const { data, isLoading } = useQuery(["report", props.id], fetchReport);
  return { dataSource: { data, loading: isLoading } }; // 适配成老形状，老组件无感知
}
\`\`\`

适配器的关键设计决策：①**放在哪一层**——数据适配放 service 层（api/user.ts 里 DTO→Model），绝不让 DTO 漏进组件（组件 props 出现 user_name 下划线命名就是防腐层失守的信号）；②**校验要不要合一**——适配函数里内嵌 zod schema 校验是最佳实践（DTO 是不可信输入，边界处必须验证，运行时报错比静默 undefined 强一百倍）；③**双向适配**——提交数据时也要 Model→DTO 反向适配（PATCH 接口要 snake_case 且只传脏字段），双向适配器通常成对出现（toModel/fromModel）；④**适配器不吸收业务逻辑**——它只做形状转换和兜底，"VIP 用户显示金色头像框"这种业务判断放组件/selectors，适配器太聪明就成了藏匿业务逻辑的黑洞。

防腐层（ACL）的战略视角：当系统对接的是"历史包袱重的遗留系统"或"语义完全不同的外部领域"（如支付网关的"交易"概念与你订单系统的"订单"概念），单点适配器不够，需要一个完整层：统一翻译语义（对方的 status=3 是你的"已退款"）、统一处理对方异常（错误码映射）、统一限流重试。真实案例：①某公司对接三个支付渠道，每个渠道的状态机不同（微信有"支付中"，支付宝没有），直接映射让订单状态机成了三渠道并集的烂摊子——防腐层定义了"支付领域的统一五态"，各渠道适配器负责把自己的状态机折叠进五态，订单系统从此只认五态；②前端接 GraphQL BFF 时，BFF 返回的结构直接对应 UI 卡片（服务端定 UI 数据结构），初期爽，后来多个客户端复用同一接口时 iOS 端要加的字段把 Web 端结构污染了——Web 端不得不建 ACL 把"为 iOS 加的字段"过滤掉，教训：BFF 按端定制是特性不是 bug，但客户端仍要保留薄适配层应对"服务端为别端做的变更"。

卡帕西视角：适配器是"隔离变化"这一软件工程第一原则的最小实现。面试时说"我用了适配器"不值钱，值钱的是说清"我把什么变化隔离在了边界处，因此什么重构没发生"——比如"后端三次改字段名，我们的组件代码一行没动过"。`,
    keyPoints: ["适配器=边界处形状转换：DTO→Model 在 service 层完成，组件只见内部模型；内嵌 zod 校验更稳", "第三方库包装=换供应商保险：业务依赖自己的接口，库升级只改 adapter", "防腐层=适配器的战略版：语义翻译+异常映射+状态机折叠，隔离遗留/外部系统的概念污染"],
    followUps: ["GraphQL 时代客户端还需要数据适配层吗（Fragment 直出 UI 结构的取舍）？", "适配器与门面模式（Facade）在包装复杂子系统时的分工差异？"],
    favorited: false,
  },
  {
    id: "fe-324",
    nodeId: "design-patterns-fe",
    question: "MVC、MVP、MVVM、Flux/Redux 四种前端架构的演进逻辑是什么？各自解决什么痛点？为什么 React 生态最终收敛到单向数据流？",
    bigTech: true,
    answer: `结论：四种架构的演进主线是"**状态与视图的同步责任不断转移，数据流方向不断收紧**"——MVC 里 View 和 Model 可以直接通信（双向，依赖成网），MVP 掐断 View-Model 直连（Presenter 中转，View 变被动），MVVM 用绑定引擎自动化同步（双向绑定省样板但状态流向不可见），Flux 干脆立法"数据只能单向流"（action → store → view，任何变更可追溯）。React 生态收敛到单向数据流的根本原因：**UI = f(state) 的渲染模型要求状态变更是可预测的，双向绑定/双向通信在组件树规模上会产生"变更源头无法定位"的调试地狱**。

演进痛点链：①MVC（Backbone 时代）——Controller 薄、Model 和 View 互相直接监听，小应用没问题，规模一大"谁改了 Model"成了谜（View 能改 Model，Model 又通知 N 个 View，View 再改别的 Model，事件链绕地球三圈）；②MVP——View 只暴露接口给 Presenter，所有交互走 Presenter，View 变"被动视图"（可测性大增），但 Presenter 成了臃肿的中转站（每个 View 事件都要手动转发，样板代码爆炸）；③MVVM（Angular/Vue）——引入绑定引擎（ViewModel 与 View 自动同步），Presenter 的样板没了，开发体验巅峰，但双向绑定的代价是"数据怎么变的不透明"：表单输入直接改 Model，Model 变化又刷其他绑定，大型表单里一个字段的联动规则（A 改 B、B 改 C、C 又校验 A）形成循环依赖，bug 表现为"值莫名被改但找不到 setter 调用点"；④Flux——Facebook 被 Messenger 的未读数 bug 逼出来的：多个地方改未读数，双向同步永远对不齐，解法简单粗暴——**所有变更必须发 action，store 集中处理，视图只读**。变更从"任何代码都能赋值"变成"必须通过唯一管道"，可追溯性 = 可调试性。

\`\`\`tsx
// Flux/Redux 单向数据流的纪律（对比双向绑定的"野自由"）
// ❌ 双向绑定世界：输入框直接改 model，谁都能改，变更无记录
// <input [(ngModel)]="user.name" /> —— name 变了，谁改的？input？还是别处的 watcher？

// ✅ 单向数据流：变更 = 发 action，store 是唯一写入点，每次变更有日志
dispatch({ type: "user/nameChanged", payload: "张三" });
// 调试三问都有答案：改成了什么（payload）、谁发的（action 发起处/调用栈）、
// 什么时候（Redux DevTools 时间旅行）
// 派生数据用 selector 计算而非手动同步：
const fullName = useSelector((s) => s.user.firstName + " " + s.user.lastName);
// 没有"firstName 变了要记得同步 fullName"这种手动维护的同步关系
\`\`\`

MVVM 与 Flux 不是水火不容——Vue3 的组合式 API + Pinia 就是"视图层 MVVM（响应式绑定）+ 状态层 Flux（单一 store、action 变更）"的混血，React 社区也承认受控组件本质就是"表单领域的受控双向绑定"（value + onChange 是手动版的 v-model）。真正的分水岭不在"绑不绑定"，在"**状态的所有权与变更入口是否收敛**"：Vue 的响应式数据如果散落在组件各处随意 mutation，一样陷入调试地狱；Redux 用好了，useState 的局部 state 也是健康的。架构选型的实操判断：①状态共享范围大、变更来源多（多人协作/实时推送/跨页面联动）→ 强约束单向流（Redux/Zustand）；②状态局部、交互密集（图形编辑器/表单页）→ 响应式/局部 state 更顺手；③团队规模是隐藏变量——5 人团队靠 review 纪律能守住自由，50 人团队必须靠架构约束兜底。

真实案例：①Angular 老项目（1.x）的 digest 循环地狱——$watch 互相触发，一次点击引发 7 轮 digest，页面假死，最后发现是三个 watcher 循环依赖（A watch B 改 C，C 的 watcher 改 B），双向绑定的"自动同步"在规模上必然产生这种图论问题——这个项目迁移 React 后同类 bug 绝迹，不是 React 更高明，是单向流让循环依赖无处藏身（action 链是 DAG）；②某 Redux 项目走到另一个极端：把"输入框每个字符"都发 action，Redux DevTools 每秒几百条 action，性能也垮了（每次 action 全 store 遍历 selector）——教训：单向流约束的是"共享状态"，局部瞬态（输入中的文本、悬停态）就该留在组件内，"所有状态进 Redux"和"所有状态双向绑定"是同一种病（不区分状态的所有权层级）的两个极端。卡帕西视角：架构演进不是新的一定好，是"自由度与约束的配比随规模调整"——MVC 的自由在 10 个模块时是生产力，在 100 个模块时是混沌；Flux 的约束在小项目是杀鸡用牛刀，在大项目是法治社会的基础设施。`,
    keyPoints: ["演进主线=同步责任转移+数据流收紧：MVC 双向成网→MVP 被动视图→MVVM 绑定自动同步→Flux 立法单向", "Flux 的本质贡献：变更入口收敛到 action 管道，可追溯性=可调试性（DevTools 时间旅行）", "现代实践是混血：视图层响应式+状态层单向流；按状态所有权分层，局部瞬态不进全局 store"],
    followUps: ["Zustand/Jotai/Recoil 代表的「原子化状态」相对 Redux 单一 store 解决了什么新问题？", "MVVM 的响应式依赖自动收集（Vue3 Proxy）与手动订阅在派生状态追踪上的精度差异？"],
    favorited: false,
  },
  {
    id: "fe-325",
    nodeId: "design-patterns-fe",
    question: "SOLID 原则如何落地到 React 组件设计？以开闭原则（组合 vs 配置）、单一职责（容器/展示分离）、依赖倒置（组件依赖抽象 props）为例写出改造前后对比。",
    bigTech: true,
    answer: `结论：SOLID 在 React 里的翻译：组件 = 类，props = 接口，组合 = 继承的替代，Hooks = 依赖注入容器。最有实操价值的三个：①开闭原则——对扩展开放（新需求加 slot/加子组件），对修改封闭（不改组件内部 if-else）——武器是组合（children/render props）而非配置（巨型 props 开关）；②单一职责——一个组件只干一件事（取数 or 展示 or 交互），容器/展示分离是老词但仍是良药，Hooks 时代进化为"逻辑进 Hook，渲染进组件"；③依赖倒置——组件依赖"抽象的 props 形状"而非"具体的 store/API/父组件"，高层组件注入实现。

\`\`\`tsx
// ① 开闭原则：配置式 vs 组合式
// ❌ 配置式（违反 OCP）：每个新需求加一个 prop，组件内部 if-else 繁殖
function Table({ data, showPagination, showExport, expandable, editable, selectable }) {
  // 20 个布尔 prop 的组合爆炸：2^20 种行为，测试不可能覆盖
  // 新需求"行内嵌图表"→ 加第 21 个 prop → 改组件内部 → 回归所有老用法
}

// ✅ 组合式（符合 OCP）：组件提供骨架，行为通过插槽扩展，核心永不修改
function Table({ data, children }: { data: Row[]; children: React.ReactNode }) {
  return <table>{children}</table>;
}
Table.Pagination = TablePagination;
Table.ExportButton = ExportButton;
Table.Row = TableRow;
// 新需求"行内嵌图表"→ 使用者组合 <Table.Row expand={<Chart />}/>
// Table 源码零改动 = 对修改封闭；能力可插拔 = 对扩展开放
// Ant Design 的 Form.Item + 自定义控件、Radix UI 的 asChild 都是这个思想

// ② 单一职责：Hook 管逻辑，组件管渲染
// ❌ 300 行组件：取数 + 轮询 + 权限判断 + 渲染 + 导出 Excel 全在一起
// ✅ 拆分后每层独立可测：
function useUserList() {
  const { data, isLoading, refetch } = useQuery(["users"], fetchUsers);
  usePolling(refetch, 30_000); // 轮询逻辑也是独立 Hook
  return { users: data, isLoading };
}
function UserListView({ users }: { users: User[] }) {
  // 纯展示组件：props 进，JSX 出，Storybook 里随便造数据截图
  return <ul>{users.map((u) => <UserRow key={u.id} user={u} />)}</ul>;
}
function UserListContainer() {
  const { users, isLoading } = useUserList();
  if (isLoading) return <Spinner />;
  return <UserListView users={users} />;
}

// ③ 依赖倒置：组件依赖抽象 props，不依赖具体实现
// ❌ 组件直接 import store/api（高层依赖低层，换实现=改所有组件）
function OrderCard({ orderId }: { orderId: string }) {
  const order = useOrderStore((s) => s.orders[orderId]); // 绑死 Zustand
  api.trackView(orderId);                                // 绑死具体埋点 SDK
}
// ✅ 依赖倒置：props 定义抽象接口，由上层注入实现
interface OrderCardProps {
  order: Order;                    // 数据由外部给
  onTrackView?: (id: string) => void; // 行为抽象成回调
}
function OrderCard({ order, onTrackView }: OrderCardProps) {
  useEffect(() => { onTrackView?.(order.id); }, [order.id]);
}
// 收益：组件可以脱离 store 单测/Storybook；换状态库只动容器层；
// 埋点 SDK 替换（神策→自研）容器层一行注入切换
\`\`\`

组合 vs 配置的决策框架（真实项目反复验证）：组件的**变化轴**在哪？①变化在"内容/布局"（表格单元格渲染、卡片头尾）→ 组合（slot/children/render props），因为内容是无限的，配置枚举不完；②变化在"有限的行为选项"（尺寸三档、主题两色）→ 配置（枚举 prop），因为选项封闭可控；③变化在"数据获取/副作用"→ Hooks 注入。判断错误的方向是配置化一切：见过 47 个 props 的"万能表单组件"，文档比组件还长，每个新需求先加 prop 再加内部分支，最终没人敢动——这就是 OCP 坟墓。反方向的错误也存在：把本该配置的两档尺寸做成组合 API，使用者每次包三层 JSX 只为改个 padding——复杂度没有消失，只是转移到了使用方。乔布斯视角：好的组件 API 像 iPhone 的按键——表面只有一个按钮（组合出口少而精），复杂留给内部；47 个 props 的组件像遥控器上 47 个按键，每个用户都只用 5 个但要为 42 个分心。

真实案例：①某中后台 Table 组件从配置式重构成组合式（Compound Components + Context），props 从 31 个降到 5 个，新需求的平均改动从"组件库发包 + 业务升级依赖"（2 天）变成"业务代码内组合"（2 小时）；②容器/展示分离在 AI 流式对话界面的应用：MessageList 展示组件只认 messages 数组，流式接收逻辑全在 useChatStream Hook——接新模型（GPT→Claude）只改 Hook，UI 层零感知，Storybook 用录制的流数据回放就能复现线上渲染问题做视觉回归。`,
    keyPoints: ["OCP 落地=组合替代配置：变化轴在内容/布局用 slot，有限行为选项用枚举 prop，副作用用 Hook 注入", "SRP 落地=Hook 管逻辑组件管渲染：展示组件 props 进 JSX 出，独立可测可截图", "DIP 落地=组件依赖抽象 props（数据+回调），store/API 由容器层注入，换实现不动组件"],
    followUps: ["Radix UI 的 asChild 模式相比 render props 在样式合并上解决了什么痛点？", "47 props 的「万能组件」重构时如何平滑迁移存量调用（codemod 思路）？"],
    favorited: false,
  },
  // ===== 架构设计层：组件库设计（fe-326~fe-333） =====
  {
    id: "fe-326",
    nodeId: "component-lib-design",
    question: "受控组件与非受控组件的设计边界是什么？为什么 antd 的 Form 选择「受控为主+defaultValue 兜底」？自研组件库如何决策一个组件该不该同时支持两种模式？",
    bigTech: true,
    answer: `结论：受控（value + onChange，状态由外部管理）与非受控（defaultValue + 内部 state，组件自己管）的本质分歧是"**状态的唯一事实源在哪**"。受控把事实源交给外部（可预测、可远程操控、可参与全局数据流，代价是每个用法都要写状态胶水）；非受控让组件自治（用法简单、表单这类"提交时才需要值"的场景最顺，代价是外部想干预值时束手无策）。成熟组件库的共识：**两种都支持，受控优先**——检测到传了 value 就走受控分支，没传走内部 state。这个"双模"协议是 React 组件库的事实标准。

\`\`\`tsx
// 双模组件的标准实现（useControllableValue 是组件库基础设施）
function useControllableValue<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (v: T) => void;
}) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const isControlled = value !== undefined; // 关键判断：传没传 value
  const mergedValue = isControlled ? value : innerValue;
  const triggerChange = useCallback((v: T) => {
    if (!isControlled) setInnerValue(v); // 非受控：更新内部 state
    onChange?.(v);                       // 两种模式都通知外部
  }, [isControlled, onChange]);
  return [mergedValue, triggerChange, isControlled] as const;
}

function Input(props: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useControllableValue(props);
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
// 用法 1（受控）：<Input value={v} onChange={setV} /> —— 外部完全掌控
// 用法 2（非受控）：<Input defaultValue="初始" onChange={log} /> —— 组件自治
\`\`\`

为什么 antd Form 选"受控为主"：表单场景有三个硬需求只有受控能满足——①**字段联动**（选了省份清空城市，外部必须能 setFieldValue）；②**校验驱动 UI**（校验器要读到当前值才能报错，值必须在 Form 的事实源里）；③**提交时对齐**（提交的值 = Form store 里的值，不是散落在各组件内部 state 的碎片）。所以 Form 用 FormStore 集中管理所有字段值（受控架构），但保留 initialValues 做"首屏非受控初始化"。这个设计回答了一个关键问题：受控的成本（状态胶水）由 Form 统一承担，使用者无感——高阶组件把受控做成了基础设施。

决策"一个组件该不该双模"的检查清单（自研组件库实操）：①**值是否需要被外部读取/修改/校验？** 是 → 必须受控支持（输入类组件全在此列）；②**组件内部状态是否纯粹是 UI 瞬态？** 是 → 可以纯非受控甚至不可控（如 Tooltip 的 open 通常不需要受控，但需要"点击外部关闭后通知外部"时又得支持受控 open——所以 antd Tooltip 也是双模）；③**是否存在"父组件偶尔需要重置"的场景？** 是 → 双模 + 受控优先（搜索框默认非受控，但"清空筛选"按钮要能受控清空）；④**受控成本谁承担？** 简单组件（Input/Switch）让使用者承担（自己 useState），复杂组件（Form/Table 的选中行）库内承担（提供 store/hooks）。

双模的坑（组件库维护者的血泪）：①**模式切换未定义行为**——同一个组件实例从非受控切成受控（父组件条件渲染 value prop），内部 state 与外部 value 谁赢？React 官方对 input 的答案是警告 + 外部赢，自研组件必须文档明确定义（并在 dev 环境打 warning，antd 就是这么做的）；②**onChange 时序分歧**——受控模式下 onChange 后外部不更新 value，组件显示什么？（答案：显示外部 value，用户的输入"被弹回"，这是受控的语义，但要做防抖输入法的兼容——中文输入法 composition 期间不能弹回，这是 antd Input 多年的修 bug 史）；③**key 重置的滥用**——很多人用 key={JSON.stringify(value)} 强制重置非受控组件，这在有焦点/动画的组件上是灾难（焦点丢失、动画中断），正确解是受控模式或组件暴露 reset 方法（ref API）。

真实案例：①某自研组件库的 DatePicker 初版只有非受控，业务做"选择开始日期后联动限制结束日期范围"时发现拿不到内部值，被迫 hack ref 读内部 state——v2 补受控后此类 issue 清零；②另一个组件库的 Tabs 受控模式下切换有 200ms 动画，外部快速连续 setActiveKey 导致动画状态机错乱（受控值变了三次，动画队列爆炸）——教训：受控组件的内部动画/过渡状态必须与受控值解耦（动画有自己的 state，受控值只决定"目标"），否则外部的高频变更直接打进动画系统。`,
    keyPoints: ["双模标准协议：传 value 走受控（外部是事实源），没传走内部 state；onChange 两种模式都发", "antd Form 受控为主的原因：字段联动/校验驱动/提交对齐都要求值集中在 FormStore", "坑：模式切换要定义并 warning；受控+输入法 composition 不能弹回；受控值与内部动画状态要解耦"],
    followUps: ["Vue 的 v-model 与 React 受控模式在「双向同步」语义上的实现差异？", "react-hook-form 为什么主打非受控还能做好校验（ref 直读 DOM 的取舍）？"],
    favorited: false,
  },
  {
    id: "fe-327",
    nodeId: "component-lib-design",
    question: "复合组件（Compound Components）模式如何用 Context 实现隐式状态共享？以 Tabs/Select/Menu 为例说明。相比 props 逐层传递，它解决了什么问题？有什么代价？",
    bigTech: true,
    answer: `结论：复合组件把"一个逻辑组件拆成多个视觉部件"（<Select> + <Select.Option>），部件间用 Context 隐式共享状态（选中值、开关状态、注册表），使用者像写 HTML 一样声明结构，无需关心状态怎么流。它解决的核心问题是"**配置式 API 的表达力天花板**"——当部件需要自定义渲染（Option 里要放头像+两行文字）、需要自由布局（Tab 的 extra 区域放按钮）、需要条件组合（某些 Menu.Item 权限控制）时，props 配置枚举不完，复合组件让使用者用 JSX 的组合表达无限结构。代价：部件脱离父组件使用会报错（Context 缺失）、动态增删部件需要注册表机制、React DevTools 里组件层级变深。

\`\`\`tsx
// Tabs 的复合组件实现（Context 隐式共享 activeKey + setActiveKey）
const TabsContext = createContext<{
  activeKey: string;
  setActiveKey: (k: string) => void;
} | null>(null);

function Tabs({ children, defaultActiveKey }: TabsProps) {
  const [activeKey, setActiveKey] = useControllableValue(props);
  return (
    <TabsContext.Provider value={{ activeKey, setActiveKey }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
}
function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("<Tab> 必须在 <Tabs> 内使用"); // 边界保护
  return (
    <button role="tab" aria-selected={ctx.activeKey === value}
      onClick={() => ctx.setActiveKey(value)}>
      {children}
    </button>
  );
}
function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("<TabPanel> 必须在 <Tabs> 内使用");
  if (ctx.activeKey !== value) return null;
  return <div role="tabpanel">{children}</div>;
}
Tabs.List = TabList; Tabs.Tab = Tab; Tabs.Panel = TabPanel;

// 使用方：结构即配置，插什么内容都行
<Tabs defaultActiveKey="a">
  <Tabs.List>
    <Tabs.Tab value="a"><Icon name="user" /> 基本资料</Tabs.Tab>
    <Tabs.Tab value="b">消息 <Badge count={5} /></Tabs.Tab> {/* 自由内容 */}
    <Button size="sm" className="ml-auto">导出</Button>    {/* 自由布局 */}
  </Tabs.List>
  <Tabs.Panel value="a"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel value="b"><MessageList /></Tabs.Panel>
</Tabs>
\`\`\`

对比 props 配置式（items=[{key, label, content}]）的优势场景：①**部件内容需要自定义**——Option 里放富内容（antd Select 的 option 配置 vs <Select.Option> 子组件之争，后者完胜复杂场景）；②**部件需要插槽扩展**——Tab 栏右侧放操作区（配置式要开 extra prop，复合式直接插进 List）；③**条件/循环生成部件**——权限过滤 <Menu.Item> 用数组 map + 条件渲染，JSX 原生表达，配置式要在数据层过滤（逻辑割裂）；④**ARIA 关系自动化**——Tab 与 Panel 的 aria-controls/aria-labelledby 配对可以在 Context 里注册生成，使用者不用手写 id 配对（可访问性正确率提升，Radix UI 的核心理念）。

代价与应对：①**脱离上下文即崩**——<Tab> 单独渲染拿不到 Context，必须 throw 清晰错误（上面的 if (!ctx) throw 是组件库的良心）；②**动态部件的注册表**——Select 的 Option 如果允许异步加载/动态增删，父组件需要知道"当前有哪些 option"（用于键盘导航/搜索过滤），解法是部件 mount 时向 Context 注册自己（useEffect 里 register/unregister），维护有序注册表（注意顺序问题：注册顺序=挂载顺序≠视觉顺序，虚拟滚动场景尤其坑）；③**重渲染扩散**——Context value 每次 render 新建对象导致所有部件重渲染，解法：value 用 useMemo 稳定化，或拆两个 Context（state Context + dispatch Context，只调 dispatch 的部件不随 state 变）；④**React 18 的并发挑战**——注册表模式在并发渲染下可能读到"半提交"状态，Radix 等库为此引入了更复杂的 collection 机制。

真实案例：①antd Menu 的 items 配置化改造（v4→v5）是反向案例——从复合组件 <Menu.Item> 迁到 items 数组，社区初期反弹，但官方理由充分：配置式可以做"菜单数据从后端来"的直出、可以做递归类型校验、可以避免 children 解析的运行时成本——启示：复合组件 vs 配置式不是谁取代谁，是"结构表达力"与"数据驱动便利"的权衡，antd 的答案是低频定制场景用配置提效（80% 后台菜单就是数据直出），高定制场景仍留 render 出口；②Radix UI（shadcn/ui 底座）把复合组件做到极致：每个部件独立可样式化、ARIA 全自动、键盘导航内建——它证明了复合组件是"无样式组件库"的唯一合理形态（样式完全交给使用者，库只提供行为与结构骨架，配置式做不到这种解耦）。`,
    keyPoints: ["复合组件=逻辑组件拆成视觉部件+Context 隐式共享状态，JSX 组合表达无限结构（配置式枚举不完）", "适用：部件内容自定义/插槽扩展/条件生成/ARIA 关系自动化；代价：脱离上下文崩/动态部件需注册表", "性能：Context value 要 memo 稳定化或拆 state/dispatch 双 Context，防全部件重渲染"],
    followUps: ["Select 的 Option 虚拟滚动与复合组件注册表的冲突怎么解（顺序与挂载时序）？", "antd Menu 从 children 迁到 items 配置的完整收益分析？"],
    favorited: false,
  },
  {
    id: "fe-328",
    nodeId: "component-lib-design",
    question: "逻辑复用范式的演进：Mixin → HOC → Render Props → Hooks，每一代解决了什么、引入了什么新问题？为什么 Hooks 最终胜出？组件库里还有哪些场景必须用 Render Props？",
    bigTech: true,
    answer: `结论：四代范式的演进主线是"**复用的逻辑与被复用方的耦合方式不断显式化、命名冲突不断消解**"——Mixin 隐式注入（不知道属性哪来的、重名被覆盖），HOC 包装注入（props 来源不透明、嵌套地狱、ref 断裂），Render Props 显式传递（数据流清晰了，但 JSX 金字塔回来了），Hooks 用"函数内顺序调用"一举拿下：逻辑复用不引入组件层级、数据源显式（返回值）、命名自由（解构重命名）、类型推导完美。Hooks 胜出的本质：它把"状态逻辑的复用"从"组件结构的复用"中解放出来——复用不再改变组件树形状。

\`\`\`tsx
// ① Mixin（React.createClass 时代，已被官方废弃）
const WindowSizeMixin = {
  getInitialState() { return { width: window.innerWidth }; },
  componentDidMount() { window.addEventListener("resize", this.handleResize); },
};
// 死因：隐式契约——this.state.width 哪来的？多个 Mixin 重名 state 互相覆盖；
// 生命周期合并规则黑盒（Mixin 的 didMount 和组件的执行顺序？）

// ② HOC：显式了一点，但注入的 props 仍然来源不明
const withWindowSize = (Comp) => (props) => (
  <Comp {...props} windowWidth={useWindowWidth()} />
);
// 问题：props.windowWidth 是哪来的（要查所有外层 HOC）；
// 三个 HOC 嵌套 = DevTools 三层匿名组件；ref 被每层 HOC 吃掉（要 forwardRef 逐层接力）

// ③ Render Props：数据流完全显式（mouse 是参数，来源一眼可见）
<MouseTracker render={({ x, y }) => <Cursor pos={{ x, y }} />} />
// 问题：嵌套两个以上就是 JSX 金字塔（回调地狱的组件版）；
// 且 render prop 内联函数每次渲染新建，子组件 memo 失效

// ④ Hooks：逻辑复用不改变组件树形状
function Cursor() {
  const { x, y } = useMouse();        // 来源显式（返回值解构）
  const size = useWindowSize();       // 多个逻辑叠加 = 多写一行，无嵌套
  const { t } = useTranslation();     // 命名冲突？解构重命名即可
  return <div style={{ left: x, top: y, width: size.isMobile ? 20 : 12 }}>{t("cursor")}</div>;
}
// 类型推导：useMouse 返回什么，x/y 就是什么类型，全程不用手写泛型
\`\`\`

Hooks 没解决的（诚实清单）：①**调用顺序约束**（不能在条件/循环里调用）——因为 React 用"调用顺序"作为 Hook 状态的 key，这是拿"API 简洁"换"心智约束"的交易，eslint-plugin-react-hooks 是必需品；②**闭包旧值陷阱**——useEffect/setInterval 里读到过期 state，要用 ref 或函数式更新绕过，这是 Hooks"每次渲染全新闭包"模型的代价（Class 的 this 反而没这个问题）；③**逻辑复用粒度变细后的组织问题**——一个组件 15 个 Hook 调用，相关逻辑被拆散在多个 Hook 里，Class 时代"这个功能的所有代码在一个 class 里"的内聚性反而丢了（解法：自定义 Hook 再聚合，但聚合的边界设计成了新难题）。

组件库里 Render Props 仍不可替代的场景：①**渲染控制权必须交给使用方的部件**——Table 的单元格（columns render）、虚拟列表的 item 渲染（react-window 的 children as function）——这些场景复用的不是"状态逻辑"而是"遍历/布局机制"，Hooks 给不了"每行渲染什么"的控制权；②**需要子组件访问"只有渲染时才存在的值"**——Form 的 field render（当前字段的错误/触碰状态只在渲染该字段时有意义），react-final-form 的 <Field render={({ input, meta }) => ...}> 是标准答案（react-hook-form 用 Controller，本质同构）；③**动画库的插值驱动**——react-spring 的 <Spring from to children={styles => <div style={styles} />}>，动画帧值只能在 render 时传递，Hook 版本（useSpring）存在但返回的 animated 值需要配合 animated.div，Render Props 版在"驱动非 React 树目标"时更直接。判断准则：**复用的是"状态/副作用"→ Hooks；复用的是"渲染时机/遍历机制/每帧值"→ Render Props 仍有其位**。

真实案例：①antd Table 的 columns.render 用了二十年没人质疑——因为"每行渲染什么"天然是 Render Props 的领土，曾经有人提议改 Hooks 化（useCell），连提案者自己都写不下去（Hook 无法表达"对每行调用"的语义）；②react-router v5→v6 把 Route 的 render/component props 全废，统一 element={<Page />}，配合 useNavigate/useParams Hooks——这是"路由复用逻辑 Hooks 化"的收官之战，社区争议半年后发现：以前用 render prop 做的"路由参数注入"在 Hooks 世界全部变成一行 useParams，代码量腰斩。卡帕西视角：范式的胜负不看优雅看"错误率 × 样板量"——Mixin 的错误率（隐式冲突）不可接受，HOC 的样板量（forwardRef 接力）不可接受，Render Props 在嵌套时两者皆输，Hooks 把两项都压到最低，所以它赢了；但在"渲染控制权"这个 Render Props 的主场，Hooks 根本不上场竞争。`,
    keyPoints: ["演进主线=复用与组件结构解耦：Mixin 隐式注入→HOC 包装注入→Render Props 显式传参→Hooks 顺序调用", "Hooks 胜出本质：逻辑复用不改组件树形状+类型推导完整+命名自由；代价是顺序约束与闭包旧值陷阱", "Render Props 不可替代区：渲染控制权（Table cell/虚拟列表 item）/渲染时才存在的值（Form field）/每帧插值（动画）"],
    followUps: ["Hooks 的「调用顺序即 key」模型与 Vue Composition API 的 setup 单次执行模型的取舍？", "React Server Components 对 Hooks 复用范式的冲击（服务端组件不能用 Hooks 怎么办）？"],
    favorited: false,
  },
  {
    id: "fe-329",
    nodeId: "component-lib-design",
    question: "组件库的主题系统如何设计？Design Token 的三层架构（原始 token/语义 token/组件 token）是什么？CSS 变量 vs CSS-in-JS 运行时主题的取舍？暗色模式如何不落一色？",
    bigTech: true,
    answer: `结论：主题系统的核心矛盾是"**设计的灵活性与实现的一致性**"——设计师要改一个品牌色，工程师要保证 200 个组件、暗色模式、高低对比度模式全部正确跟随。解法是把颜色决策分层：原始 token（palette-blue-6 这类物理色值）→ 语义 token（color-primary 表达"品牌主色"意图）→ 组件 token（button-primary-bg 绑定到具体组件槽位）。三层隔离后，改品牌色只动语义层的映射，组件层零改动。CSS 变量是目前运行时主题的最优解（浏览器原生、JS 可读写、媒体查询可联动、无运行时成本），CSS-in-JS 运行时主题（styled-components ThemeProvider）在动态性上更强但付 JS 运行时税，且 SSR/ hydration 复杂。

\`\`\`css
/* 三层 token 架构（CSS 变量实现） */
:root {
  /* L1 原始层：物理色板，设计师交付的调色盘，不被组件直接使用 */
  --palette-blue-1: #e6f4ff;
  --palette-blue-6: #1677ff;
  --palette-gray-1: #ffffff;
  --palette-gray-13: #000000;

  /* L2 语义层：表达意图（这个角色是什么颜色），亮暗主题的分叉点 */
  --color-primary: var(--palette-blue-6);
  --color-bg-container: var(--palette-gray-1);
  --color-text: rgb(0 0 0 / 88%);
  --color-border: #d9d9d9;
}
[data-theme="dark"] {
  /* 暗色模式只覆盖语义层：组件引用的 token 名不变，映射的物理值换 */
  --color-primary: var(--palette-blue-6); /* 主色可不变 */
  --color-bg-container: #141414;
  --color-text: rgb(255 255 255 / 85%);
  --color-border: #424242;
}

/* L3 组件层：组件只引用语义层，槽位化命名 */
.button-primary {
  background: var(--color-primary);       /* 直接引语义层（简单组件） */
}
/* 复杂组件可以再定义自己的组件级 token，允许单独定制 */
.card {
  --card-bg: var(--color-bg-container);   /* 组件 token 默认引语义层 */
  background: var(--card-bg);
}
/* 业务方定制单卡片：.my-card { --card-bg: #f0f0f0; } —— 不改库源码 */
\`\`\`

三层架构的价值论证（每层解决一类变化）：①换品牌色/换色板 → 只改 L2 映射（--color-primary 从 blue-6 指向 green-6），组件无感；②暗色模式 → 只加 [data-theme="dark"] 的 L2 覆盖，组件无感；③单个业务方要定制某组件 → 改 L3 组件 token（--card-bg），不动全局语义；④设计师要全局调"边框都浅一点" → 改 L2 的 --color-border，所有组件的边框统一变化。**没有 L2 语义层的系统（组件直接用 #1677ff）在暗色模式下是灾难**：你得搜遍 200 个组件找"哪些颜色在暗色下要换"，必然漏——漏一个就是用户截图反馈"这里暗色模式瞎眼"。

暗色模式的完整正确姿势（"不落一色"的工程体系）：①**组件样式零硬编码色值**——所有颜色必须 var() 引用 token，lint 规则强制（stylelint 禁止 hex/rgb 字面量出现在组件样式，只允许 token 定义文件）；②**语义 token 全集评审**——文本（主/次/弱/禁用）、背景（页面/容器/浮层/填充）、边框、功能色（成功/警告/错误/信息）各档位定义齐全，暗色映射表由设计师交付（不是工程师拍脑袋反色）；③**特殊资产处理**——图片/插画/图表配色不进 token 系统，图表库（echarts）主题要单独适配（token 导出成 JS 对象喂给 echarts theme），图片建议用 mask/滤镜或双份资产；④**跟随系统 vs 手动切换**——media (prefers-color-scheme) 做默认，用户手动选择覆盖并持久化（localStorage），切换时 html[data-theme] 属性翻转 + transition 防闪烁（给 background/color 加 200ms transition，但注意只对影响的属性加，全属性 transition 会引发布局动画）。

CSS 变量 vs CSS-in-JS 运行时主题的真实权衡：CSS 变量赢面——①零运行时成本（主题切换是改一个 html 属性，浏览器原生级联）；②SSR 友好（首屏直出主题，无 hydration 主题闪烁问题——styled-components 的主题在 hydration 前后不一致会闪）；③DevTools 可调试（变量面板直读）；④非 JS 环境（服务端模板/iframe 注入样式）也能用。CSS-in-JS 赢面——①token 有类型（TS 主题对象补全）；②动态计算主题（根据用户上传 logo 提取主色生成整套色板，运行时算法派生 token——CSS 变量要 JS 算出再 setProperty，其实也能做，只是没类型）；③样式与组件同文件的内聚性。**现代答案（antd v5 / MUI v6 都收敛于此）：CSS 变量做 token 载体 + JS 侧保留 token 的类型化对象供逻辑使用（如图表配色、canvas 绘制）**，两者通过构建时或运行时同步（token 单一事实源在 CSS 或 TS，另一边生成）。

真实案例：①antd v4→v5 的主题重构——v4 用 less 变量（编译期主题：改主色要重编译 less，运行时换主题基本不可能），v5 全量迁 CSS 变量 + cssinjs，运行时换主题、多主题并存（一个页面两个主题区域）都成为可能，但迁移期社区组件大量硬编码色值失效，官方出 codemod + 视觉回归清单才平息——教训：token 化必须在组件库 v1 就做，后补的代价是生态级重构；②某 SaaS 产品做租户级主题（每个企业客户上传品牌色），方案：租户主色 → 色板生成算法（antd 的色阶算法，主色派生 10 档）→ 运行时 setProperty 注入语义 token → 全部组件自动跟随，上线后"换品牌色"从发版需求变成运营后台的表单配置。`,
    keyPoints: ["三层 token：L1 物理色板→L2 语义意图（主题分叉点）→L3 组件槽位；改品牌色/暗色只动 L2", "暗色不落一色体系：组件零硬编码（lint 强制）+语义 token 全集设计师交付+图表/图片特殊处理+切换防闪烁", "CSS 变量赢运行时/SSR/调试；CSS-in-JS 赢类型/动态派生；现代共识=CSS 变量承载+TS 对象供逻辑层消费"],
    followUps: ["antd 色板算法（主色派生 10 档）的 HSV 变换逻辑与可访问性对比度校验？", "多主题并存（同页两主题区域）的 CSS 变量作用域隔离方案？"],
    favorited: false,
  },
  {
    id: "fe-330",
    nodeId: "component-lib-design",
    question: "组件库的按需加载与 Tree-shaking 如何实现？ESM + sideEffects 的原理是什么？为什么 babel-plugin-import 仍是很多项目的现实选择？组件库作者要做对哪些事？",
    bigTech: true,
    answer: `结论：按需加载的理想路径是"**ESM 静态结构 + bundler Tree-shaking**"——库以 ESM 发布（保留 import/export 静态分析能力），package.json 声明 sideEffects: false（告诉 bundler"模块无副作用，未引用的导出可以安全删除"），业务代码 import { Button } from "lib"，webpack/rollup/vite 构建时只打包 Button 及其依赖的子树。但现实骨感：组件库普遍有 CSS 文件（样式 import 是"副作用"，sideEffects: false 会误删样式）、有全局 polyfill/样式重置、有的库内部模块图有循环依赖导致摇树失效——所以 babel-plugin-import（把 import { Button } 改写成 import Button from "lib/es/button" + 自动引入样式）这种"编译期路径重写"仍是大量存量项目的现实最优解。

\`\`\`jsonc
// 组件库 package.json 的按需加载四件套
{
  "main": "./lib/index.js",        // CJS 产物（老环境/Node 工具链）
  "module": "./es/index.js",       // ESM 产物（Tree-shaking 的入口）
  "exports": {
    ".": { "import": "./es/index.js", "require": "./lib/index.js" },
    "./*": { "import": "./es/*", "require": "./lib/*" }  // 深路径按需引入
  },
  "sideEffects": [
    "*.css",                        // 样式文件有副作用（不能摇掉）
    "./es/style/**"                 // 样式入口保留
  ]
}
\`\`\`

Tree-shaking 失效的常见原因（库作者的检查清单）：①**产物不是真 ESM**——用 tsc/babel 转 ESM 时配置错误输出了 CJS（bundler 对 CJS 只能全量打包，因为 require 是动态的无法静态分析）；验证方法：产物里搜 module.exports，有就是失败；②**sideEffects 声明错误**——声明 false 但库里 import "./style/index.css"，样式被摇掉（线上样式全无，经典事故）；正确做法是数组形式把 CSS 文件列入白名单；③**桶文件 re-export 陷阱**——index.ts 里 export * from "./components"，如果某个组件模块有顶层副作用（如 window 监听注册），整个桶都被标记有副作用而保留（摇树是模块粒度的）；④**CSS 架构问题**——CSS-in-JS 库样式随 JS 摇树自然按需，但传统 less/css 文件的库，样式按需要靠 babel-plugin-import 自动补 import 样式文件，或要求用户全量引入样式（antd v4 的 css 全量 600KB+ 是按需加载时代的痛点，v5 改 cssinjs 才根治）。

babel-plugin-import 的工作机制与现实意义：它在编译期把 import { Button, Table } from "antd" 改写成两行深路径引入 import Button from "antd/es/button" + import "antd/es/button/style"，绕过桶文件直取模块——这样即使库的 ESM 摇树配置不完美，业务侧也能精确按需。它在 2026 年的今天仍大量存在的原因：①存量项目的库升级不动（锁定在老版本组件库，ESM 产物质量差）；②样式按需的自动化（免手动 import 样式文件，对开发者透明）；③构建速度——深路径引入跳过桶文件解析，大型组件库（300+ 组件）的全量 ESM 分析对 bundler 是负担。代价：它是 babel 层的私有协议，与 SWC/esbuild/Rspack 等新工具链不兼容（这些工具要么提供等价插件如 swc-plugin-import，要么要求库本身 ESM 质量过关）。

库作者的完整正确姿势（2026 年标准）：①**双产物发布**——es/（ESM，Tree-shaking 用）+ lib/（CJS，Node 工具链用），tsc 双目标编译或 rollup 多格式；②**sideEffects 精确声明**——数组白名单列出 CSS/全局样式/初始化脚本，其余默认无副作用；③**样式策略三选一**——cssinjs（样式随 JS 摇树，最现代）、CSS 文件 + 自动按需引入约定（配插件）、原子化 CSS（样式极致复用，antd v5 的 cssinjs 也带原子化缓存）；④**避免模块级副作用**——不在组件模块顶层做 window 监听/全局注册（改到组件 mount 时做），这是摇树友好的内功；⑤**验证**——CI 里加一个"摇树验证"步骤：建一个只 import Button 的 fixture 项目，webpack 打包后断言产物里没有 Table 的代码字符串（很多知名库都栽在这步）。

真实案例：①某业务项目首屏 bundle 2.8MB，排查发现组件库虽然标了 ESM，但库内 utils 模块在顶层执行了 dayjs.locale("zh-cn")（副作用），整个 utils 模块被保留，utils 又引用了全部组件的常量定义，连锁保留——bundle 里 60% 是没用到的组件。修复：utils 的 locale 设置改到显式 init() 函数，业务 bundle 降到 900KB；②lodash 的教训史——lodash（CJS 全量） vs lodash-es（ESM 可摇树），多少项目 import { debounce } from "lodash" 打包进 70KB 全量库，这是"产物格式决定摇树命运"的教科书案例，后来 es-toolkit 等现代替代品直接 ESM-only 发布。卡帕西视角：按需加载不是"构建技巧"，是"库与业务的契约"——库承诺无副作用的模块结构，bundler 才能兑现摇树；契约的任何一环说谎（sideEffects 乱标、ESM 是假货、顶层有副作用），买单的都是用户的加载时间。`,
    keyPoints: ["理想路径=ESM 产物+sideEffects 精确白名单+静态 import；桶文件内任何顶层副作用让摇树模块级失效", "babel-plugin-import 仍存在的理由：老库 ESM 质量差/样式按需自动化/构建速度；但绑死 babel 生态", "库作者五件事：双产物/sideEffects 白名单/样式策略/无顶层副作用/CI 摇树验证断言"],
    followUps: ["sideEffects: false 误删样式的线上事故如何用视觉回归测试兜底？", "es-toolkit/Radix 等现代库 ESM-only 发布策略对 Node 工具链用户的影响与对策？"],
    favorited: false,
  },
  {
    id: "fe-331",
    nodeId: "component-lib-design",
    question: "组件库的质量保障体系怎么建？单元测试、视觉回归测试、文档即代码、API 变更检测四道防线各自防什么？为什么快照测试在组件库场景要慎用？",
    bigTech: true,
    answer: `结论：组件库的特殊性在于"**一次缺陷，全部业务方受害**"——业务代码的 bug 影响一个产品，组件库的 bug 影响几百个引用方。四道防线分工：单测防"行为逻辑错误"（交互/状态机/边界），视觉回归防"样式意外变更"（改 padding 波及 50 个组件），文档即代码防"文档与实现漂移"（示例代码跑不通），API 变更检测防"无意识 breaking change"（删了个 prop 没发 major 版本）。快照测试要慎用是因为组件库的快照噪音极大（任何 class 名/hash/结构微调都全量失败），维护者会形成"看都不看就 update snapshot"的肌肉记忆，测试形同虚设。

\`\`\`tsx
// ① 单测：测行为契约，不测实现细节（Testing Library 哲学）
test("受控模式下 onChange 不直接改值，等外部更新", async () => {
  const onChange = vi.fn();
  const { rerender } = render(<Input value="a" onChange={onChange} />);
  await userEvent.type(screen.getByRole("textbox"), "b");
  expect(onChange).toHaveBeenCalledWith("ab");
  expect(screen.getByRole("textbox")).toHaveValue("a"); // 外部没更新，值被弹回
  rerender(<Input value="ab" onChange={onChange} />);     // 外部更新后才显示
  expect(screen.getByRole("textbox")).toHaveValue("ab");
});
// 交互行为覆盖：键盘导航（Tab/方向键/ESC）、焦点管理、ARIA 属性、受控/非受控双模、
// 边界（空数据/超长文本/disabled 态）——这些是"行为契约"，业务方依赖的语义

// ② 视觉回归：Storybook 每个 story 截图对比（Chromatic/Loki/Playwright）
// stories: Button 的 4 种 type × 3 种 size × disabled/loading = 全组合截图
// CI 里像素 diff 超阈值 → 失败。防的是"改了 token 色值，30 个组件样式全变，
// 单测全绿（行为没错），但 UI 面目全非"

// ③ 文档即代码：示例代码从真实可运行文件提取（dumi/storybook docs 模式）
// 反模式：markdown 里手写示例（API 改名后示例静默失效，用户复制就跑不通）
// 正解：示例是真实 .tsx 文件，被文档引用 + 被测试执行（示例即测试用例）

// ④ API 变更检测：构建时导出 API 报告（api-extractor），diff 检测
// Button.d.ts 的 props 从 { size?: "sm"|"lg" } 变成 { size?: "sm"|"md"|"lg" } = minor
// 删了 ghost prop = major。CI 检测到 breaking 但版本号没 bump major → 拦截
\`\`\`

快照测试在组件库场景的失败模式：①**序列化噪音**——emotion/cssinjs 生成的 hash class 名每次构建变（css-1x2y3z），快照全红，维护者机械执行 jest -u，测试信用破产；②**结构快照不等于正确性**——快照记录了 <div class="wrapper"><span>，但没记录"aria-expanded 应该是 true"（这才是用户可感知的契约），结构对了 ARIA 错了照样过；③**大快照无人 review**——一个 500 行快照的 diff 在 PR 里没人逐行看，变更混进去就混进去了。正确的替代：①行为断言替代结构快照（expect(button).toHaveAttribute("aria-expanded", "true") 比 toMatchSnapshot 精确一百倍）；②真要快照只快照"稳定的叶子"（如 svg 图标路径、错误消息文本），且快照文件控制在 50 行内可人工 review；③视觉的事交给视觉回归（像素 diff 对"意外样式变更"的捕获能力远超 DOM 快照）。

四道防线的投入配比（组件库团队的资源现实）：单测是地基必须厚（核心组件 Button/Input/Form 行为覆盖率 90%+），视觉回归投入产出比最高（一次接入，每次改样式都有网兜底），文档即代码是长期信用（组件库的竞争一半是文档体验的竞争），API 检测是版本纪律的执法者（没有它，SemVer 全靠自觉=没有 SemVer）。真实案例：①Material UI 的视觉回归体系——每个 PR 自动跑 2000+ 截图对比，一次"修复 Tooltip 定位"的 PR 被发现顺带改变了 Popover 的定位（共用定位引擎），视觉 diff 直接标红，避免了一次跨组件回归——单测全部通过的情况下，只有像素说了真话；②某内部组件库的"文档漂移"事故——Select 组件 v2 把 options 的数据结构从 {label, value} 改成 {label, value, disabled}，文档站示例还是手写的老结构，新业务方复制示例跑起来 disabled 不生效，提了 5 个重复 issue——后来接入 dumi 的"示例即源码"模式，示例文件进 CI 单测，漂移绝迹；③api-extractor 在 Fluent UI（微软）的应用——每次 PR 自动评论"本 PR 的 API 变更：+2 props, -1 prop(breaking)"，reviewer 一眼看到 breaking 标记，没有检测工具时这类变更藏在 500 行 diff 里根本没人注意。

卡帕西视角：组件库的质量体系本质是"**信任的基础设施**"——业务方敢不敢升级你的 minor 版本，取决于历史上你有没有"minor 里夹带 breaking"的前科。四道防线防的不是 bug，是信任的复利流失。`,
    keyPoints: ["四道防线：单测防行为错/视觉回归防样式意外/文档即代码防示例漂移/API 检测防无意识 breaking", "快照测试失败模式：hash class 噪音→机械 update→测试信用破产；改用行为断言+视觉回归", "业务方敢升级 minor 的前提是版本纪律被工具执法（api-extractor diff 自动评论）"],
    followUps: ["Chromatic 的 TurboSnap（只重截受影响 story）原理与成本优化？", "组件库的可访问性测试（axe-core 集成）如何自动化进 CI？"],
    favorited: false,
  },
  {
    id: "fe-332",
    nodeId: "component-lib-design",
    question: "组件库的版本管理（SemVer）在「样式也算 API」的现实下怎么执行？breaking change 如何平滑迁移（deprecation 周期 + codemod）？多版本共存问题怎么解？",
    bigTech: true,
    answer: `结论：组件库的 SemVer 比普通库难在"**什么是 breaking 的边界模糊**"——删 prop 是 breaking，改默认样式算不算？改 DOM 结构（多包一层 div）算不算（业务方有 CSS 选择器穿透）？改 z-index 层级呢？成熟组件库的实践共识：行为 API（props/事件/方法）严格 SemVer；样式变更凡"视觉上可感知"按 minor 谨慎对待、重大视觉重构（antd v4→v5）按 major；DOM 结构视为半公开 API（文档声明"不要依赖内部结构"但仍尽量 minor 不动）。迁移体系三件套：deprecation 警告周期（一个 major 周期内新旧并存 + console warning）、codemod 自动迁移工具、详尽的迁移指南。

\`\`\`tsx
// ① Deprecation 周期的标准做法：旧 API 保留一个 major 周期，运行时警告
function Button({ type, variant, ...rest }: ButtonProps) {
  if (type !== undefined) {
    // v5 用 variant 替代 type，但 type 在 v5 全周期仍可用（只是警告）
    warningOnce(
      false,
      "[Button] type 已废弃，请使用 variant。v6 将移除 type。" +
      "迁移指南: https://lib.dev/migration/v5"
    );
  }
  const mergedVariant = variant ?? typeToVariant(type);
  // ...
}
// warningOnce 保证每个调用点只警告一次（不刷屏）
// 业务方升级 v5：功能不破 + 控制台黄字引导，一个周期内从容迁移

// ② Codemod：用 jscodeshift 写 AST 变换脚本，库随 major 版本附带
// npx @mylib/codemod v5-to-v6 src/
// 自动完成：<Button type="primary"> → <Button variant="primary">
//           import { LocaleProvider } → import { ConfigProvider }
// codemod 覆盖 80% 机械变更，剩下 20% 特殊用法迁移指南人工处理

// ③ 多版本共存的样式隔离：CSS 变量前缀 + 类名前缀可配置
// v5 和 v6 同页共存（微前端主子应用不同版本）：
<ConfigProvider prefixCls="v6-lib" theme={{ cssVarPrefix: "v6" }}>
  <App />
</ConfigProvider>
// 类名从 lib-button 变 v6-lib-button，CSS 变量从 --lib-color 变 --v6-color
// 两版样式互不污染（antd 的 prefixCls 机制就是为此设计）
\`\`\`

"样式算不算 breaking"的实操判据（业界吵了十年的问题的可执行答案）：①**明确 breaking**——删/改 prop 语义、改默认值（defaultPageSize 20→50 会让依赖旧默认的分页逻辑错）、改 DOM 结构且业务方有已知依赖（组件库文档里提供过 className 定制口子的，动结构就是 breaking）；②**灰色地带按 minor + changelog 醒目标注**——微调间距/字号/色值（视觉回归让业务方自己判断要不要跟进）、新增 DOM 包裹层（不影响已声明的定制口子时）；③**不算 breaking 但要 changelog**——修 bug 导致的样式变化（bug 本身就是错的）、性能优化不触摸觉。关键纪律：**changelog 按"用户可感知"写而非按 commit 写**——"fix: adjust padding" 无意义，要写成 "Button: 水平 padding 从 15px 调整为 16px，如您有依赖旧间距的布局请检查"。

多版本共存的三大场景与解法：①**微前端主子应用版本不一致**——主子应用各自打包自己的组件库版本，样式靠 prefixCls/CSS 变量前缀隔离，但**全局副作用会打架**（两版的 message 组件都往 body append 容器、两版的 ResizeObserver polyfill 重复打）——解法：全局单例资源通过 window symbol 协调（先到先得），或主应用统一提供基础能力子应用复用；②**monorepo 内多包依赖不同版本**——pnpm 的严格 node_modules 结构会装两份（components-a 依赖 lib@5，components-b 依赖 lib@6），React 上下文断裂（lib@5 的 ConfigProvider 包不住 lib@6 的组件——两个版本的 Context 是不同对象）——解法：组件库声明为 peerDependency（宿主统一版本），或 pnpm overrides 强制对齐；③**渐进升级期**——大应用不可能一夜升级，新旧页面用不同版本过渡，路由级隔离 + 统一升级排期，过渡期不超过一个季度（否则永久双份 bundle）。

真实案例：①antd v3→v4 的迁移工程——官方提供 codemod（@ant-design/codemod-v4）自动处理 Icon 的 type 字符串改组件式（<Icon type="check" /> → <CheckOutlined />），一个 200 个页面的中后台项目 codemod 跑了 10 分钟完成 85% 迁移，剩下 15% 动态 type 拼接（type={iconMap[k]}）人工处理 2 天——没有 codemod 时同类项目迁移以"月"计；②某组件库 v2 把 message.success 的全局容器从 document.body 直挂改成 Shadow DOM（隔离样式），这看起来是内部实现，但业务方大量 e2e 测试用 document.querySelector(".lib-message") 断言——全部失败。教训：e2e 测试选择器也是"隐式 API"，组件库变更要评估对业务方测试设施的影响，官方应提供 data-testid 稳定契约；③Element Plus 的 unplugin-vue-components 自动按需引入 + 版本升级时的 resolver 兼容——解析器与库版本耦合，库目录结构调整（es/ 改 modules/）导致老 resolver 解析 404，这类"工具链耦合的 breaking"最容易被 SemVer 遗漏，现在库变更目录结构必须同步发 resolver 大版本。`,
    keyPoints: ["SemVer 扩展判据：行为 API 严格执行；样式按用户可感知分级；DOM 结构半公开（有定制口子就算 API）", "迁移三件套：deprecation 警告一个 major 周期/codemod 覆盖 80% 机械变更/迁移指南处理边角", "多版本共存：prefixCls+CSS 变量前缀隔离样式；Context 断裂用 peerDeps/overrides 对齐；全局副作用 window symbol 协调"],
    followUps: ["组件库的 data-testid 稳定契约如何设计（哪些元素承诺稳定）？", "微前端场景两版组件库的全局 message/notification 容器冲突的具体协调代码？"],
    favorited: false,
  },
  {
    id: "fe-333",
    nodeId: "component-lib-design",
    question: "组件库的 Monorepo 工程架构怎么搭？包划分策略（core/icons/hooks/单组件包）、构建产物矩阵（esm/cjs/umd/types）、发布流水线（changesets）与文档站如何协同？",
    bigTech: true,
    answer: `结论：组件库 Monorepo 的核心决策是"**包的粒度**"——单包（antd 式，一个 antd 包装所有组件）还是多包（@scope/button、@scope/table 独立发布）？答案取决于消费方式：业务方 90% 场景是"装一个库用一堆组件"→ 单包 + 内部模块化（摇树按需）是最优；组件要被其他设计系统二次封装或按需单装（如 @radix-ui/react-* 每个组件独立包）→ 多包。现代主流（2026 共识）：**单主包 + 少数独立包**（icons/hooks/utils/theme 独立，组件集中在主包）——icons 独立是因为图标集巨大且更新频率不同，hooks 独立是因为无 UI 依赖可被非本库项目复用。

\`\`\`
packages/
├── components/          # 主包 @mylib/components：全部组件，内部按目录分模块
│   ├── button/          #   每组件一个目录：index.tsx / style/ / __tests__/ / demo/
│   ├── table/
│   └── package.json     #   sideEffects 白名单样式，exports 双格式
├── icons/               # @mylib/icons：SVG 组件化（构建期 svgr 转换）
├── hooks/               # @mylib/hooks：useControllableValue 等无 UI 依赖
├── theme/               # @mylib/theme：token 定义 + 主题生成算法
└── shared/              # 内部构建配置/工具（不发布，workspace 内部复用）
docs/                    # 文档站（dumi/vitepress），引用 workspace 包源码
\`\`\`

构建产物矩阵的现代答案：①**es/（ESM + 保留目录结构）**——Tree-shaking 主战场，tsc --module esnext 直出（不做 bundle，保留模块粒度让业务方 bundler 摇树）；②**lib/（CJS）**——Node 工具链（jest/SSR 老配置）兼容，同一份 tsc 双目标；③**类型 .d.ts**——tsc 生成，注意 exports 字段的 types 条件指向；④**umd 已死**——2026 年不需要为 script 标签出 umd 包（CDN 场景用 esm.sh 这类 ESM CDN 自动转换）；⑤**CSS 策略**——cssinjs 免构建（样式在 JS 里），CSS 文件方案要构建 less→css + 拷贝 + sideEffects 白名单。构建工具的选型现实：tsup（esbuild 内核）快但类型生成要另跑 tsc；rollup 生态最全但配置重；tsdown/rolldown 是新趋势（Rust 内核 + rollup 兼容 API）。

Changesets 发布流水线（多包版本管理的行业标准）：①开发者在 PR 里跑 npx changeset 生成"变更声明文件"（哪个包 + patch/minor/major + changelog 描述），随 PR 提交；②合入 main 后，changesets/action 自动开一个"Version Packages"PR——消费所有 changeset 文件，bump 版本号、生成 CHANGELOG、处理包间依赖联动（components 依赖 hooks，hooks bump minor 则 components 至少 bump patch）；③合并 Version PR 后自动发布到 npm + 打 git tag。这套机制的价值：**版本决策左移到写代码时**（开发者最清楚自己的改动是什么级别），changelog 不再是发版时从 commit 里考古。配套纪律：PR 模板强制要求"是否包含 changeset"，CI 检查 feat/fix 类 PR 无 changeset 则警告。

文档站与源码的协同（文档即代码的落地）：①**demo 即测试**——docs 里的示例从 packages/components/*/demo/ 目录真实 .tsx 文件加载，这些 demo 文件同时被 jest 渲染测试引用（示例坏 = 测试红）；②**API 表格自动生成**——从 TS 类型注释（react-docgen-typescript）提取 props 表，类型改了文档自动更新（不手写 markdown 表格——手写表格与类型的漂移率是 100%）；③**文档站直接 import workspace 源码**（vite alias 指向 src 而非 dist）——改组件代码文档站热更新即时可见，且文档站本身就是组件的"第一个真实用户"（构建/SSR/主题切换问题在文档站先暴露）；④**每个版本快照**——文档站按版本部署（v5.lib.dev / v6.lib.dev），老版本用户不迷路（changesets 的 tag 触发对应版本文档构建）。

真实案例：①Radix UI 的多包策略——@radix-ui/react-dialog 等 30+ 独立包，每个可单装，配合 changesets 管理（一次 Dialog 的 a11y 修复只 bump 一个包），这服务了它的定位"被设计系统二次封装"（shadcn/ui 只装了需要的十几个包）；反面是版本碎片化——业务方 lock 文件里 radix 各包版本交错，Dialog v1.0.3 + Popover v1.0.7 的内部依赖（都依赖 react-dismissable-layer）出现版本分裂，靠 pnpm overrides 压平；②antd 的单包巨无霸模式——一个 antd 包 300+ 组件，靠 ESM 摇树按需，业务方 lock 文件干净（就一个 antd 版本），但"只想用一个 DatePicker 却要装整个 antd（哪怕摇树，安装体积/类型检查速度都是成本）"的抱怨从未停止；③某团队组件库发布事故——手改版本号发版，忘了 components 依赖的 hooks 也变了，发了 components minor 但 hooks 没发，业务方安装后拿到老 hooks 新 components，运行时 undefined 函数崩溃——接入 changesets 后包间依赖联动 bump 自动化，此类事故绝迹。教训：Monorepo 的发布纪律必须工具化，人肉协调多包版本的错误率是 100%（只是时间问题）。`,
    keyPoints: ["包粒度决策：组件集中主包+icons/hooks/theme 独立包；多包只服务于「二次封装/单装」场景", "产物矩阵 2026：es（不 bundle 保模块粒度）+lib（CJS 兼容）+d.ts；umd 已死，CDN 用 esm.sh", "changesets 把版本决策左移到 PR 时+包间依赖联动自动 bump；人肉协调多包版本必出事故"],
    followUps: ["Radix 多包版本分裂的 pnpm overrides 压平策略与风险？", "文档站 import 源码（vite alias 到 src）在组件用了构建期宏/插件时的处理？"],
    favorited: false,
  },
  // ===== 专项能力层：大文件处理（fe-334~fe-341） =====
  {
    id: "fe-334",
    nodeId: "big-file-handling",
    question: "大文件分片上传的完整方案怎么设计？分片大小如何决策？并发控制、进度聚合、暂停恢复各有什么实现要点？",
    bigTech: true,
    answer: `结论：分片上传的本质是"**把一次不可控的大请求拆成 N 次可控的小请求**"——解决三大问题：①单次请求体过大网关/服务端拒绝（nginx 默认 client_max_body_size 1MB，调大也有上限）；②网络抖动全量重传的灾难（2GB 文件传到 99% 断了重传是体验死刑）；③进度反馈缺失（单请求只有 0 和 1 两种状态）。完整方案五要素：分片（固定大小切片）→ 标识（文件 hash 作为 uploadId）→ 并发调度（控制同时上传的分片数）→ 进度聚合（各分片进度加权求和）→ 合并确认（全部分片就位后通知服务端 merge）。

\`\`\`ts
// 核心实现骨架（生产级要素已标注）
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB：见下方决策依据

interface ChunkTask { index: number; blob: Blob; uploaded: boolean; }

async function uploadFile(file: File) {
  // ① 分片
  const chunks: ChunkTask[] = [];
  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    chunks.push({
      index: chunks.length,
      blob: file.slice(i, i + CHUNK_SIZE), // slice 零拷贝，不读入内存
      uploaded: false,
    });
  }
  // ② 文件标识：hash 作为 uploadId（秒传与断点续传都靠它，见 fe-335）
  const fileHash = await hashFile(file);
  // 断点恢复：问服务端"这个 hash 哪些分片已传过"
  const { uploaded: doneList } = await api.getUploadedChunks(fileHash);
  chunks.forEach((c) => { c.uploaded = doneList.includes(c.index); });

  // ③ 并发调度：信号量控制（同时 3 片，失败重试 3 次）
  const pending = chunks.filter((c) => !c.uploaded);
  await runWithConcurrency(pending, 3, async (chunk) => {
    await retry(() => uploadChunk(fileHash, chunk), 3);
    chunk.uploaded = true;
    updateProgress(chunks); // ④ 进度聚合：已完成片数/总片数（加权更精确）
  });
  // ⑤ 合并：全绿后通知服务端按序拼接
  await api.mergeChunks(fileHash, { fileName: file.name, total: chunks.length });
}

// 并发调度器（信号量模式，比 Promise.all 全发可控）
async function runWithConcurrency<T>(
  tasks: T[], limit: number, worker: (t: T) => Promise<void>,
) {
  const queue = [...tasks];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()!;
      await worker(task); // 一个 worker 串行取任务，N 个 worker 并行
    }
  });
  await Promise.all(runners);
}
\`\`\`

分片大小的决策依据（不是拍脑袋）：①**太小**（如 1MB）——分片数爆炸（2GB = 2000 片），请求开销占比飙升（每片都有 TLS/HTTP 头成本），服务端的"分片清单"管理成本也高；②**太大**（如 50MB）——单片失败重传成本高，进度粒度粗，弱网下单片成功率下降；③**经验值 2-10MB**——webuploader/阿里云 OSS 默认 4-5MB，七牛 4MB；④**动态调整**（进阶）：根据网络质量（navigator.connection.effectiveType 或前几片的实测吞吐）调整——快网加大片减少请求数，弱网减小片提高单片成功率。

实现要点深挖：①**进度聚合的精确性**——简单版用"完成片数/总片数"，但各片进度不实时反映；精确版每片用 XMLHttpRequest 的 upload.onprogress 拿字节级进度，总进度 = Σ（每片已传字节）/总字节（fetch 不支持上传进度！必须用 XHR，这是大文件上传的技术选型关键点）；②**暂停/恢复**——暂停 = 清空调度队列不再取新任务（在飞的分片要么等它完成要么 AbortController 中断）；恢复 = 重新查询服务端已传分片清单，从未传分片继续（所以分片状态必须服务端持久化，不能只存前端内存）；③**分片与文件读取**——file.slice 是惰性的零拷贝操作，只有真正读 Blob 内容（formData.append 时）才触发磁盘 IO，所以分片本身不占内存。

真实案例：①某网盘产品早期用"单请求 + 后端流式接收"，2GB 文件在弱网（地铁 4G）成功率不到 30%——改分片上传 + 断点续传后成功率 99.2%，核心指标"重传字节比"从平均 1.8（传 1.8 遍）降到 1.02；②一个经典的进度条 bug：前端用"已传片数/总片数"显示进度，最后一片是尾片（只有 800KB，其他 5MB），进度卡在 99% 很久——用户以为卡死狂点取消。修复：按字节加权进度；③服务端合并的坑：某团队 merge 接口用"按分片 index 顺序读临时文件拼接"，但没校验分片完整性（客户端 bug 漏传了第 7 片但调了 merge），生成缺块文件且前端显示"上传成功"——merge 前必须校验"分片数量齐全 + 每片 size 符合预期（除尾片）"，合并后再校验整体 hash（客户端算的文件 hash 与服务端合并后重算的 hash 对比），三重校验缺一不可。卡帕西视角：分片上传是"协议设计"问题不是"API 调用"问题——前端、网关、存储三方对"分片的生命周期"（创建/上传/校验/合并/清理过期分片）要有共识，任何一个环节的状态机没对齐都是线上事故。`,
    keyPoints: ["分片上传五要素：固定分片（2-10MB)/文件 hash 标识/信号量并发/字节加权进度/合并前三重校验", "fetch 不支持上传进度，必须用 XHR 的 upload.onprogress；file.slice 零拷贝不占内存", "暂停=队列停取+Abort 在飞片；恢复=查服务端已传清单续传，分片状态必须服务端持久化"],
    followUps: ["分片上传的服务端临时分片清理策略（上传中断后垃圾分片的 TTL 设计）？", "S3 multipart upload 协议与自研分片协议的映射关系（前端直传 OSS 的签名方案）？"],
    favorited: false,
  },
  {
    id: "fe-335",
    nodeId: "big-file-handling",
    question: "文件 hash 秒传与断点续传如何实现？全量 MD5 太慢怎么优化（抽样 hash/Web Worker/异步分片调度）？抽样 hash 的碰撞风险怎么评估？",
    bigTech: true,
    answer: `结论：秒传的原理是"**内容寻址**"——上传前算文件 hash，问服务端"这个 hash 的文件存在吗"，存在则直接建立文件引用（秒传成功，零字节传输）。瓶颈在"算 hash 的成本"：2GB 文件全量 MD5 在主线程要 10-30 秒且页面卡死。三级优化：①Web Worker 算（不卡 UI，但用户仍要等）；②抽样 hash（牺牲唯一性换速度，1 秒内出结果）；③异步惰性调度（边上传边算，hash 还没算完第一片已在传）。抽样 hash 的碰撞风险工程上可控——只要 hash 用途是"去重提示"而非"安全校验"，误撞的后果是"误以为秒传成功"，服务端在 merge 时全量校验一次即可兜底。

\`\`\`ts
// ① Web Worker 全量 hash（spark-md5 增量计算，不一次性读入内存）
// worker.ts
importScripts("https://cdn.jsdelivr.net/npm/spark-md5/spark-md5.min.js");
self.onmessage = async (e: MessageEvent<File>) => {
  const file = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();
  const CHUNK = 2 * 1024 * 1024;
  for (let i = 0; i < file.size; i += CHUNK) {
    const buf = await file.slice(i, i + CHUNK).arrayBuffer(); // 2MB 一读，内存友好
    spark.append(buf);
    self.postMessage({ type: "progress", value: i / file.size }); // 算 hash 也要进度
  }
  self.postMessage({ type: "done", hash: spark.end() });
};

// ② 抽样 hash（秒级方案）：只取"头中尾 + 若干随机点"的片段计算
async function sampleHash(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer();
  // 文件元信息混入 hash（同名不同内容会区分开）
  spark.append(new TextEncoder().encode(file.name + file.size + file.lastModified));
  const SAMPLE_SIZE = 1024 * 1024; // 每处抽 1MB
  const positions = [
    0,                                    // 头
    Math.floor(file.size / 2),            // 中
    Math.max(0, file.size - SAMPLE_SIZE), // 尾
    // 可加 2-3 个基于 size 的伪随机点（确定性！同文件必同点）
  ];
  for (const pos of positions) {
    spark.append(await file.slice(pos, pos + SAMPLE_SIZE).arrayBuffer());
  }
  return spark.end(); // 2GB 文件也只读 ~4MB，亚秒完成
}

// ③ 惰性调度（体验最优）：先抽样 hash 快速问秒传 → 不命中立即开传，
//    同时在 Worker 里算全量 hash，算完再核对服务端（防抽样碰撞的误秒传）
\`\`\`

抽样 hash 的碰撞风险评估（面试加分项）：①**碰撞后果分级**——如果 hash 用于"秒传去重"，碰撞 = 用户 B 拿到了用户 A 的文件引用（数据错乱，严重）；如果 hash 只用于"断点续传的分片对齐"（同一用户同一浏览器的上传会话），碰撞 = 续传错位（merge 时全量校验能发现，可降级为重新上传，轻微）；②**碰撞概率工程化**——混入 size + 抽样点位确定性 + MD5 128bit，同 size 且抽样区相同的概率在天文数字级，真实风险不是随机碰撞而是"**相似文件**"：同一模板导出的 Excel（只有末尾几行不同）、视频文件的头部元数据相同——这就是为什么要抽"中尾"和混入 size；③**兜底设计**——抽样 hash 命中的秒传结果，服务端可标记"待确认"，后台全量校验，不匹配则撤销引用并通知客户端重传（最终一致性）。

断点续传的协议设计：①**分片清单服务端持久化**——uploadId（hash）→ 已接收分片 index 列表 + 每片校验值，客户端重连后先 GET 清单，跳过已传片；②**会话过期**——分片上传会话要有 TTL（如 7 天），过期清理临时分片（否则存储泄漏），客户端拿到 410 Gone 要能重新全量；③**内容变更检测**——续传前重新算 hash 对比 uploadId，用户换了个同名文件继续传会错位（hash 不匹配则新开会话）；④**浏览器关闭恢复**——把 uploadId + 文件引用（File 对象不可持久化，重新选择文件后比对 name+size+hash 匹配才允许续传）。

真实案例：①百度网盘的秒传神话——上传热门电影（院线种子）几乎 100% 秒传，因为全网用户内容相同，服务端 hash 库命中即完成；但这也引来"秒传审核"问题（已知违规文件的 hash 黑名单），说明 hash 寻址的隐私与安全边界是产品级议题；②某团队用"文件名+大小"当秒传标识（不算 hash，怕慢），用户把同名的新版本设计稿拖进去，直接"秒传成功"拿到了旧文件——hash 是内容寻址的必要条件，任何元信息替代方案都是自欺欺人；③Worker 的兼容坑：spark-md5 的 ArrayBuffer.append 在某些 Android WebView 的 Worker 里 importScripts CDN 脚本失败（离线/WebView 拦截），工程上要 Worker 脚本本地打包 + importScripts 失败降级主线程惰性计算。卡帕西视角：hash 方案的选择是"时间预算分配"——全量 hash 把成本付在上传前（用户等待），抽样 hash 把成本摊在风险里（服务端兜底），惰性调度把成本隐藏在并行里（体验最优实现最复杂），按业务的文件大小分布选（平均 <50MB 全量都行，GB 级必须抽样或惰性）。`,
    keyPoints: ["秒传=内容寻址：hash 命中即零字节传输；全量 hash 用 Worker+增量计算（2MB 片），抽样 hash 头中尾+元信息亚秒出", "抽样碰撞工程可控：混入 size/name/lastModified+中尾采样防相似文件；秒传结果服务端全量校验兜底", "断点续传：分片清单服务端持久化+会话 TTL+重选文件后 hash 校验匹配才续传"],
    followUps: ["hash 寻址存储的隐私问题（服务端知道「某文件存在」能推出什么）与加密网盘的矛盾？", "Web Crypto API 的 digest 为什么不支持流式增量 hash（SHA-256 的局限与应对）？"],
    favorited: false,
  },
  {
    id: "fe-336",
    nodeId: "big-file-handling",
    question: "分片上传的失败重试策略怎么设计？指数退避、分片级校验、整体一致性保证（merge 校验）如何配合？为什么上传 99% 后失败最危险？",
    bigTech: true,
    answer: `结论：分片上传的重试体系要分三层：**分片级重试**（单片失败独立重传，指数退避）、**会话级恢复**（网络断开后整体续传）、**合并级校验**（服务端 merge 前的完整性检查）。最危险的状态是"99% 后失败"——不是进度问题，是**沉没成本与状态不一致的叠加**：用户等了 10 分钟，最后一步 merge 失败，如果此时客户端状态机设计不当（比如本地标记"已完成"但服务端 merge 失败，或临时分片被 TTL 清理），用户面临"重传全部"的崩溃体验。99% 失败的处理质量决定了整个功能的口碑。

\`\`\`ts
// ① 分片级重试：指数退避 + 抖动 + 可重入
async function uploadChunkWithRetry(
  uploadId: string, chunk: ChunkTask, maxRetry = 3,
): Promise<void> {
  for (let attempt = 0; attempt <= maxRetry; attempt++) {
    try {
      await uploadChunk(uploadId, chunk);
      return;
    } catch (err) {
      if (attempt === maxRetry) throw err;
      // 指数退避：1s, 2s, 4s + 随机抖动（防多客户端同步重试打爆服务端）
      const backoff = 2 ** attempt * 1000 + Math.random() * 1000;
      await sleep(backoff);
      // 重试前检查：这片是不是其实已经传上去了（网络回包丢失的假失败）
      const { uploaded } = await api.getUploadedChunks(uploadId);
      if (uploaded.includes(chunk.index)) return; // 服务端有 = 成功，直接跳过
    }
  }
}

// ② 分片级校验：每片带上自己的校验值（服务端逐片验证，坏片立即暴露）
async function uploadChunk(uploadId: string, chunk: ChunkTask) {
  const buf = await chunk.blob.arrayBuffer();
  const chunkMd5 = SparkMD5.ArrayBuffer.hash(buf); // 单片 hash 便宜
  const form = new FormData();
  form.append("uploadId", uploadId);
  form.append("index", String(chunk.index));
  form.append("checksum", chunkMd5);
  form.append("data", chunk.blob);
  await xhrPost("/upload/chunk", form); // 服务端收片先验 checksum 再落盘
}

// ③ merge 前三重校验（服务端职责，前端要懂协议）：
//    - 数量齐全：收到的分片数 == 声明的总数
//    - 尺寸合规：除尾片外每片大小 == CHUNK_SIZE
//    - 整体 hash：合并后的文件重算 hash == 客户端上传前声明的 hash
\`\`\`

失败场景分类与策略（不是所有失败都配重试）：①**可重试错误**——网络超时/5xx/连接重置（瞬时故障，退避后重试）；②**不可重试错误**——4xx 业务错误（uploadId 过期 410、配额不足 413、文件类型拒绝 415），重试无意义，直接进入"恢复流程"（410 就重新创建会话）或失败终止；③**假失败**——请求发出去了服务端也处理了，但响应丢失（网络断在回程）——重试导致"重复分片"，所以分片上传必须幂等（同 uploadId+index 重复传，服务端覆盖或忽略，不能报错也不能存两份）；④**并发竞争**——用户在两个标签页同时传同一文件（同 hash），两个会话互相覆盖分片——服务端对 uploadId 加锁或按会话隔离（uploadId = hash + sessionId）。

为什么 99% 失败最危险（深度分析）：①**用户心理**——损失厌恶在 99% 时最强（行为经济学：快到手的东西丢了比一开始没有更痛），此时给一个"重新开始"按钮等于劝退；②**状态腐烂**——分片在服务端有 TTL（常见 24h-7d），用户"明天再传"时 99% 的进度可能已被清理，前端显示的进度成了谎言（恢复前必须重新核对清单）；③**merge 的原子性**——merge 本身可能很慢（2GB 文件拼接+全量 hash 校验要秒级），merge 请求超时但服务端其实成功了（假失败的 merge 版）——merge 接口必须幂等且支持查询状态（merge 提交后轮询 merge 状态，而非依赖单次请求结果）。

真实案例：①某企业网盘的"99% 重传"投诉潮——排查发现 merge 接口在文件 >1GB 时超时（nginx proxy_read_timeout 默认 60s，2GB 拼接+MD5 要 90s+），客户端把超时当失败，用户重传全部。修复三连：merge 改异步（提交即返回 taskId，客户端轮询）+ 分片 TTL 从 24h 延到 7d + merge 失败明确提示"分片已保存，点击重试合并"（而不是"上传失败"）——重试合并成功率 99.7%，投诉清零；②重试风暴事故：客户端无抖动指数退避，服务端一次 30 秒抖动后，5000 个上传会话在同一秒集体重试（大家的退避序列同步了），瞬间 QPS 打满网关——加随机抖动（±50%）后重试流量平滑化。卡帕西视角：重试不是"失败就再来一次"，是"**带状态判定的恢复协议**"——每次重试前问"当前真实状态是什么"（查清单），而不是假设"上次失败=没传上"，这个认知差是业余实现与生产实现的分水岭。`,
    keyPoints: ["三层重试体系：分片级指数退避+抖动/会话级断点恢复/merge 级三重校验（数量/尺寸/整体 hash）", "分片与 merge 都必须幂等（防假失败重试造成重复）；4xx 业务错误不重试，410 重建会话", "99% 失败最危险：merge 要异步化+状态轮询；分片 TTL 内进度才可信，恢复前必查清单"],
    followUps: ["merge 异步化后客户端轮询的频率策略（退避轮询 vs WebSocket 推送）？", "分片上传在弱网下的「小片重传优于大片」动态降级算法怎么设计？"],
    favorited: false,
  },
  {
    id: "fe-337",
    nodeId: "big-file-handling",
    question: "大文件下载的前端方案有哪些？Range 断点下载、流式保存（StreamSaver/File System Access API）、a[download] 的内存瓶颈各是什么原理？",
    bigTech: true,
    answer: `结论：大文件下载的核心矛盾是"**浏览器没有直接的'边下边存盘'通道**"——传统 a[download] + Blob URL 方案要求整个文件先进内存（Blob），2GB 文件 = 2GB 内存，标签页直接崩。三级方案：①a[download] 指向后端 URL（让浏览器原生下载器处理，最优但要求后端支持直链）；②ReadableStream + File System Access API（showSaveFilePicker 拿文件句柄，流式写入，Chrome 系最佳）；③StreamSaver.js（Service Worker 拦截流，模拟原生下载，兼容性兜底）。Range 请求解决的是"断点续传与并行下载"，与保存方案正交。

\`\`\`ts
// 方案 1：a[download] 直链（首选，零内存问题）
function downloadByUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;                    // 浏览器原生下载器接管：边下边存、自带续传
  a.download = filename;           // 仅同源有效！跨域 download 属性被忽略
  a.click();
}
// 前提：后端返回 Content-Disposition: attachment 头（跨域时强制下载的唯一办法）
// 适合：静态资源/OSS 直链；不适合：需要鉴权 header 的动态流

// 方案 2：File System Access API（Chrome/Edge 现代方案）
async function streamDownload(url: string) {
  // 先拿保存位置（用户选路径，拿可写句柄）
  const handle = await window.showSaveFilePicker({ suggestedName: "big.zip" });
  const writable = await handle.createWritable();
  const resp = await fetch(url, { headers: { Authorization: "Bearer xxx" } });
  // 流式：边下边写，内存恒定（不经过 Blob）
  await resp.body!.pipeTo(writable);
}
// 优势：内存 O(1)、可带鉴权 header、用户指定路径
// 限制：仅 Chromium 系、HTTPS、需用户手势触发

// 方案 3：StreamSaver.js（兼容兜底：Service Worker 当中转站）
// 原理：SW 注册一个虚拟 URL，fetch 到的流 pipe 给 SW，SW 以"响应"形式吐回浏览器
// 浏览器把它当普通下载处理（边下边存），主页面全程不碰数据本体
\`\`\`

a[download] + Blob 的内存瓶颈剖析（经典错误）：const blob = await (await fetch(url)).blob() 把响应完整读入内存成 Blob，再 URL.createObjectURL(blob) 触发下载——①内存峰值 = 文件大小 ×（1~2）（Blob 本体 + 可能的 ArrayBuffer 中间态）；②浏览器对单标签内存有硬限制（移动端 Chrome 约 2GB、桌面约 4GB），1.5GB 文件在中端手机上必崩（崩的表现是标签页无声消失，用户甚至不知道下载失败）；③Blob URL 还有"会话生命周期"问题——长时间不消费可能被回收。这个方案的文件大小上限经验值：**100MB 以内可以忍，500MB 以上必死**。

Range 断点下载的实现要点：①协议——请求头 Range: bytes=0-1048575，服务端回 206 Partial Content + Content-Range: bytes 0-1048575/52428800；②断点恢复——记录已下载字节数 N，重连时 Range: bytes=N- 续传（IndexedDB 存已下载分片，File System Access API 续写）；③并行下载（IDM 原理）——按 Range 把文件分 4 段并行拉取，本地拼接（File System Access API 的 writable.seek 定位写入）；④前置条件——服务端必须支持 Range（Accept-Ranges: bytes 响应头声明），OSS/S3 默认支持，自研文件服务用 nginx 的 sendfile 或 Node 的 fs.createReadStream({start, end})。

真实案例：①某数据平台"导出报表"功能——用户导出 800MB CSV，前端用 Blob 方案，桌面 Chrome 内存冲到 3GB 后崩溃，客服收到"网站一导出就闪退"投诉。修复路径：后端改支持流式生成 + 前端迁 File System Access API（非 Chromium 用户提示用 StreamSaver 兜底），内存占用稳定 50MB；②鉴权下载的经典坑——视频站点的付费视频下载，URL 带签名参数（有效期 15 分钟），用户 2GB 文件下了 20 分钟到 95% 时签名过期，续传请求 403——签名 URL 的续传要"刷新签名"机制（按 Range 续传前先调 API 换新 URL，新 URL 必须与原文件 byte-level 一致）；③Safari 的特殊性——不支持 File System Access API，且对 SW 流的下载支持有 bug（旧版本），兜底方案是"后端生成临时直链 + a[download]"（把流式压力转给后端网关），这就是真实项目的"降级链"：FS Access API → StreamSaver → 后端直链。卡帕西视角：下载方案的选择是"**内存预算与兼容性的二维决策**"——先问文件多大（>100MB 排除 Blob），再问浏览器分布（内部系统 Chrome 优先 FS Access，C 端全兼容必须三层降级链），没有银弹，只有预算表。`,
    keyPoints: ["三级方案：a[download] 直链（零成本）→ File System Access API 流式（Chrome 最优）→ StreamSaver SW 中转（兼容兜底）", "Blob 方案内存=文件大小×2，100MB 是上限 500MB 必崩；跨域 a[download] 无效，要 Content-Disposition: attachment", "Range 断点：记录字节数续传/分片并行/服务端必须回 206；签名 URL 续传要先刷新签名"],
    followUps: ["Service Worker 流式下载在 Safari 的兼容性细节与降级检测代码？", "并行 Range 下载的分片乱序落盘（writable.seek）与最终完整性校验方案？"],
    favorited: false,
  },
  {
    id: "fe-338",
    nodeId: "big-file-handling",
    question: "大文件在线预览如何实现？PDF 分页加载、视频流式播放（HLS/Range）、大型文本/代码文件的虚拟化渲染各是什么原理？",
    bigTech: true,
    answer: `结论：大文件预览的统一思想是"**视口驱动加载**"——用户只看一屏，就只加载一屏的内容，滚动到哪里加载到哪里。三种文件类型的技术路径不同：PDF 靠"按页渲染 + 分页加载文档结构"（pdf.js 的 range request 只取当前页的页面对象）；视频靠"流媒体协议切片"（HLS 把视频切成 2-10s 的 ts 分片 + m3u8 索引，播放器按带宽选码率按需拉片）；大型文本靠"虚拟滚动 + 分片解析"（只渲染视口内行，按需读取文件字节段）。共同的敌人是"全量加载思维"。

\`\`\`ts
// ① PDF 分页加载（pdf.js 原理）
const loadingTask = pdfjsLib.getDocument({
  url: "/api/report.pdf",
  // 关键：开启 Range 请求，pdf.js 先取文件尾部的 xref 索引表，
  // 再按需取当前页的对象——100MB PDF 首屏只拉几百 KB
  rangeChunkSize: 65536,
});
const pdf = await loadingTask.promise;   // 此时只加载了结构，未加载页面内容
const page = await pdf.getPage(1);        // 只拉第 1 页的对象
await page.render({ canvasContext: ctx, viewport }).promise;
// 翻页才 getPage(2)；渲染过的页缓存，来回翻不重复拉

// ② 大文本虚拟化（Monaco/自研虚拟列表原理）
function VirtualTextView({ file }: { file: File }) {
  const [lines, setLines] = useState<string[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const LINE_HEIGHT = 20, VIEWPORT_LINES = 50;
  // 滚动时只解析视口附近 ±100 行的字节段（文件已按行偏移建索引）
  useEffect(() => {
    const startLine = Math.floor(scrollTop / LINE_HEIGHT);
    loadLineRange(file, startLine - 100, startLine + VIEWPORT_LINES + 100)
      .then(setLines); // 只持有 250 行内存，不管文件是 10 万行还是 1000 万行
  }, [scrollTop]);
  // 总高度用 lineCount * LINE_HEIGHT 撑起滚动条，内容区绝对定位渲染可视行
}

// ③ 视频流式（HLS.js 接入）
const hls = new Hls({ maxBufferLength: 30 }); // 最多缓冲 30s，控内存
hls.loadSource("/api/video/index.m3u8");
hls.attachMedia(videoEl);
// m3u8 索引列出 N 个 ts 分片，播放器根据播放位置+带宽拉取，看多少下多少
\`\`\`

三种路径的深层原理：①**PDF 的结构特殊性**——PDF 是"随机访问"格式：文件尾部有 xref 交叉引用表（每页对象的字节偏移），所以可以先取尾部索引，再按 Range 取任意页——这是"格式本身支持分片"的幸运案例；②**视频的协议切片**——MP4 直接 Range 播放也可行（moov 元数据在前就能边下边播，所以 MP4 转码要 faststart 把 moov 移头部），HLS/DASH 更进一步：物理切成小片 + 多码率自适应（弱网自动降清晰度），代价是延迟（直播场景 HLS 延迟 10-30s，低延迟要用 LL-HLS 或 WebRTC）；③**文本的行偏移索引**——大文本虚拟化的前提是"知道第 N 行的字节偏移"，一次性扫一遍文件建"行号→偏移"索引（索引本身也要分块存储），之后按行号 O(1) 定位读取——日志平台（如 Kibana 前端）就是这么处理 GB 级日志的。

真实案例与坑：①某网盘预览 50MB PDF 白屏 20 秒——pdf.js 未开 range 模式，全量下载后才渲染。开 rangeChunkSize 后首屏 1.2s。坑：服务端必须支持 Range 且正确返回 Content-Range，某些 CDN 配置会吃掉 Range 头回 200 全量，前端要检测（返回 200 而非 206 时降级提示）；②视频预览的"伪流式"——MP4 的 moov atom 在文件尾部（手机直接录的 MP4 常见），播放器必须下载完才能开始播，表现为"加载圈转到底才出画面"。修复：转码时加 -movflags faststart；检测：ffprobe 看 moov 位置；③大型 CSV 预览 200MB 卡死——直接 readAsText 全量读 + split("\n")，内存 3 倍爆炸（字符串 + 数组 + 渲染）。修复：流式读取（stream + TextDecoder 逐段）+ 行索引后台建 + 虚拟渲染，首屏 300ms。卡帕西视角：预览方案的选择先看"格式是否支持随机访问"（PDF/带索引文本 支持 → Range 按需；无结构二进制 不支持 → 转码出索引或切片），格式不给力就用服务端转码补——前端预览的终极形态是"前端只负责渲染视口，一切寻址与切片是协议与服务端的事"。`,
    keyPoints: ["统一原则=视口驱动加载：PDF 按页 Range/视频 HLS 切片按需/文本行偏移索引+虚拟滚动", "MP4 边下边播要 moov 前置（faststart）；HLS 多码率自适应代价是直播延迟 10-30s", "pdf.js 开 rangeChunkSize 后首屏只拉几百 KB；服务端/CDN 必须真支持 Range（回 206 而非 200）"],
    followUps: ["LL-HLS 与 WebRTC 在低延迟直播的技术路线差异？", "大文本「行偏移索引」如何在 Web Worker 里流式构建且不占双份内存？"],
    favorited: false,
  },
  {
    id: "fe-339",
    nodeId: "big-file-handling",
    question: "大型 Excel 文件（10 万行）的前端导入方案怎么设计？SheetJS 解析的内存问题、Web Worker 分片解析、前后端解析的职责边界如何决策？",
    bigTech: true,
    answer: `结论：10 万行 Excel 导入的核心矛盾是"**SheetJS 一次性全量解析的内存与时间成本**"——XLSX.read 一个 50MB Excel 在主线程要 10-30 秒且内存峰值可达文件 10 倍（解压 XML + JS 对象），页面假死甚至崩溃。三级方案：①Web Worker 里全量解析（不卡 UI，但内存峰值仍在，适合 <10MB）；②Worker + 分片流式解析（按 sheet/按行段切块处理，边解析边上报，内存可控）；③前端只传文件、后端解析（前端零负担，适合超大文件与需要入库校验的场景）。决策边界：**文件大小与"解析后数据的去向"**——纯前端预览/小规模入库用 ①②，要入库校验/超大文件/复杂业务规则用 ③。

\`\`\`ts
// ① Worker 内解析（基础版：不卡 UI）
// excel.worker.ts
self.onmessage = async (e: MessageEvent<ArrayBuffer>) => {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(e.data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // 分块上报：每 5000 行 postMessage 一次（增量渲染进度条）
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { raw: true });
  for (let i = 0; i < rows.length; i += 5000) {
    self.postMessage({ type: "chunk", rows: rows.slice(i, i + 5000) });
  }
  self.postMessage({ type: "done", total: rows.length });
};
// 内存优化：dense: true 选项（行数组而非稀疏对象，内存降 30-50%）

// ② 降内存关键选项与技巧
const wb = XLSX.read(buf, {
  type: "array",
  dense: true,        // 稠密数组存储（sheet_to_json 直接出行数组）
  sheetRows: 10000,   // 只解析前 N 行（预览模式！分次加载）
  cellDates: false,   // 不转 Date 对象（省内存，需要时再转）
  cellStyles: false,  // 不要样式信息（导入场景 99% 不需要）
});
// 真正的流式：xlsx 库本身不支持逐行流读（XML 结构限制），
// 超大文件的终极方案是换库（exceljs 的 stream reader）或后端解析

// ③ 后端解析的职责切分（企业级标准做法）
// 前端：文件直传 OSS → 调导入 API（传 OSS key）
// 后端：流式读 OSS → 逐行校验（业务规则）→ 批量写库 → 错误行生成报告
// 前端轮询导入进度，完成后展示"成功 9982 行 / 失败 18 行（下载错误报告）"
\`\`\`

SheetJS 内存问题剖析：①**解压放大**——xlsx 本质是 zip，50MB 的 xlsx 解压出 XML 可能是 300MB；②**对象膨胀**——sheet_to_json 的默认输出每行是一个对象，10 万行 × 20 列 = 200 万个字符串引用，V8 的对象头开销让内存再翻 2-3 倍；③**峰值叠加**——ArrayBuffer（原文件）+ 解压 XML + 解析中的内部结构 + 输出行数组同时存活，峰值轻松破 GB。优化组合：dense 模式（行数组替对象）+ sheetRows 分批 + 解析完立即释放中间引用（wb 置 null 让 GC 收）+ Worker 独立堆（爆了不拖死主页面）。

前后端解析的决策矩阵（真实项目选型框架）：①**文件 <5MB 且纯前端校验够用** → Worker 全量解析（体验最好：离线可用、零服务端成本）；②**5-50MB 或需要进度反馈** → Worker + 分批上报 + 分批提交后端入库（前端做格式校验，后端做业务校验）；③**>50MB 或校验依赖数据库（如"工号必须在 HR 系统存在"）或导入是高频运营动作** → 后端流式解析（前端只负责上传与进度展示）；④**混合校验陷阱**——常见错误是"前端校验一遍，后端又校验一遍，规则漂移"（前端说通过的后端拒了），规则必须单一事实源（通常在后端），前端校验只是"提前反馈体验"，错误文案要能从后端规则生成。

真实案例：①某 CRM 批量导入联系人（运营常态动作，单次 5-20 万行）——初版前端 SheetJS 全量解析后 POST JSON，8 万行时请求体 40MB+，网关 413 拒绝；改成分批 5000 行/批 + 后端逐批入库，再改成前端直传 OSS 后端流式解析后，20 万行从"不可用"到 90 秒完成，且错误行报告精确到"第 3841 行手机号格式错"；②Worker 内存崩溃的教训——某团队 Worker 里 sheet_to_json 输出 15 万行对象数组，Worker 内存超 2GB 被杀（浏览器对 Worker 也有限制），表现为"解析到 80% 永远卡住"（Worker 死了 postMessage 没人收）。修复：dense 模式 + 分批立即 transfer 给主线程（Transferable 零拷贝移交所有权，Worker 侧立即释放）；③进度条谎言——sheet_to_json 是同步阻塞调用，"解析进度"无法实时上报（JS 单线程，解析时没机会 postMessage），所以进度只能按"分片解析"粒度伪造（每片之间上报），或干脆显示不确定进度（indeterminate spinner）——诚实比精确的谎言好。卡帕西视角：Excel 导入是"**内存预算、时间预算、校验归属**"的三元决策——先把三个预算算清楚，方案是自己浮出来的；带着"前端就该解析 Excel"的执念在 20 万行面前必然翻车。`,
    keyPoints: ["三级方案：<5MB Worker 全量/5-50MB Worker 分批上报/>50MB 或需库校验 后端流式解析", "SheetJS 内存三板斧：dense 模式/sheetRows 分批/cellStyles:false；Worker 独立堆防爆主页面", "校验规则单一事实源在后端，前端校验只做提前反馈；Transferable 零拷贝移交防 Worker 内存翻倍"],
    followUps: ["xlsx 的 XML 结构为什么决定了它无法真正逐行流读（sharedStrings 全局表）？", "exceljs stream reader 与 SheetJS 分片方案在 50MB 级文件上的实测对比？"],
    favorited: false,
  },
  {
    id: "fe-340",
    nodeId: "big-file-handling",
    question: "图片上传前的客户端压缩如何做到极致？canvas 缩放、createImageBitmap、OffscreenCanvas + Worker、EXIF 方向修正、WebP 转换的完整链路是什么？",
    bigTech: true,
    answer: `结论：客户端图片压缩的价值是"**把上行带宽成本降下来**"——手机直出照片 5-12MB，压缩到 200KB 上传，上传时间从 30s（弱网）缩到 1s，服务端存储成本降 95%。完整链路六步：读取（createImageBitmap 高效解码）→ EXIF 方向修正（手机照片旋转元数据）→ 尺寸缩放（canvas 按目标最长边等比缩）→ 质量压缩（canvas.toBlob webp/jpeg 质量参数）→ 效果校验（压缩后尺寸/体积断言）→ 上传。性能进阶：OffscreenCanvas + Worker 让解码压缩全程不碰主线程。

\`\`\`ts
// 生产级压缩管线（含全部关键细节）
async function compressImage(file: File, opts = {
  maxEdge: 1920, quality: 0.8, type: "image/webp",
}): Promise<Blob> {
  // ① 高效解码：createImageBitmap 比 <img> onload 快且支持 EXIF 取向
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "flipY", // 见下方 EXIF 详解（兼容性注意）
  });

  // ② 等比缩放到最长边 maxEdge（不放大，只缩小）
  const scale = Math.min(1, opts.maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  // ③ Canvas 重绘（缩放即重采样）
  const canvas = new OffscreenCanvas(w, h); // 或 document.createElement("canvas")
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close(); // 立即释放解码内存（大图片占几十 MB）

  // ④ 编码压缩：webp 同质量体积比 jpeg 小 25-35%
  const blob = await canvas.convertToBlob({ type: opts.type, quality: opts.quality });
  // canvas.toBlob 是 DOM 版 API，OffscreenCanvas 用 convertToBlob（Promise 化）

  // ⑤ 兜底：压缩后反而变大（小图/已压过的图）→ 用原文件
  return blob.size < file.size ? blob : file;
}

// ⑥ Worker 化（大图不卡 UI）：把 file 用 postMessage 传给 Worker（File 可结构化克隆）
// Worker 内跑上面管线，结果 Blob transfer 回主线程
\`\`\`

EXIF 方向修正（手机照片的经典坑）：手机竖拍的照片像素数据其实是横的，正确朝向存在 EXIF 的 Orientation 字段（值 1-8，表示旋转/翻转组合）。问题：①<img> 标签渲染时现代浏览器会自动按 EXIF 旋转（image-orientation: from-image 默认行为），但 **canvas.drawImage 读的是原始像素**——直接 drawImage 画出来的图是躺倒的；②旧方案是用 exif.js 读 Orientation 再手动 ctx.rotate 修正；③现代方案：createImageBitmap(file, { imageOrientation: "from-image" }) 让浏览器解码时直接修正（Chrome/FF 支持，Safari 15.4-），不支持的环境降级 exif.js 手动旋转；④压缩后的图要**剥掉 EXIF**（canvas 重绘天然剥离，因为像素已经修正过了——如果保留原 EXIF，查看器会二次旋转）。

压缩策略的进阶决策：①**格式选择**——webp 是 2026 年的默认答案（全平台支持已普及），avif 更小（再省 20%）但编码慢（客户端编码 avif 要 1-3s，webp 只要 100ms），jpeg 留给"必须兼容上古环境"；②**质量参数**——0.8 是甜点（视觉无损，体积降 60%+），头像类可以到 0.7，证件照/票据类要 0.9+（文字边缘不能糊）；③**尺寸策略**——按用途定 maxEdge（头像 512、动态图 1080、详情图 1920），不要无脑 4K；④**迭代压缩**——体积不达标时逐步降质量重试（0.8 → 0.6 → 0.5），比一次性低质量的观感好；⑤**透明通道**——png 截图类有 alpha 的别转 jpeg（变黑底），webp 支持 alpha。

真实案例：①某社区 App 的图片上传优化——用户发帖 9 图（手机直出共 60MB），弱网失败率 40%；上压缩管线（1080px + webp 0.8 + Worker 并行 3 张）后单图 ~150KB，总上传量 1.4MB，失败率降到 2%，服务端存储账单降 92%；②EXIF 旋转事故——客服系统用户上传的"屏幕旋转截图"在服务端缩略图里全部躺倒（服务端 sharp 库默认不读 EXIF，而前端压缩时已经剥了 EXIF 但没修正像素）——两端必须对齐策略：要么前端修正像素+剥 EXIF（推荐，一劳永逸），要么全链路保留 EXIF 且所有渲染方都尊重它；③OffscreenCanvas 的兼容坑——Safari 16.4 前不支持 convertToBlob 的 webp 编码（能画不能编），检测方法：try 一次 1×1 webp 编码，失败降级 document canvas + jpeg。卡帕西视角：图片压缩是典型的"**用客户端免费算力换服务端付费带宽/存储**"——每 1ms 客户端压缩时间换回的是真金白银的 CDN 与 OSS 账单，这个交换率在所有前端优化里排前三。`,
    keyPoints: ["压缩链路：createImageBitmap 解码→EXIF 修正→OffscreenCanvas 缩放→webp 0.8 编码→体积对比兜底", "canvas.drawImage 不读 EXIF，直接画会躺倒；修正像素后要剥 EXIF 防二次旋转；全链路策略要前后端对齐", "webp 默认/avif 更小但编码慢/jpeg 兼容兜底；OffscreenCanvas+Worker 大图不卡 UI，Safari 编码能力要探测降级"],
    followUps: ["avif 客户端编码的 WASM 方案（avif.js）性能与体积收益实测？", "图片压缩与 CDN 图片处理（oss image process）的职责划分（哪些压缩该留给云端）？"],
    favorited: false,
  },
  {
    id: "fe-341",
    nodeId: "big-file-handling",
    question: "拖拽上传、粘贴上传、文件夹上传三种增强上传交互的实现原理是什么？DataTransferItem 的 getAsFileSystemHandle 与 webkitGetAsEntry 在遍历文件夹时有什么差异？",
    bigTech: true,
    answer: `结论：三种交互的数据源都是 DataTransfer（拖拽/粘贴事件的剪贴数据载体），但能力不同：拖拽上传读 drop 事件的 dataTransfer.files；粘贴上传读 paste 事件的 clipboardData（截图粘贴得到的是 image/png 的 File）；文件夹上传的关键是"**递归遍历目录**"——input 的 webkitdirectory 属性最简（用户选文件夹，files 平铺展开），拖拽文件夹必须用 webkitGetAsEntry（Entry API，递归 walk 目录树）或新的 getAsFileSystemHandle（File System Access API）。上传器的产品力 80% 在这些交互细节里。

\`\`\`ts
// ① 拖拽上传（含拖拽态视觉反馈的完整实现）
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault(); // 必须！否则 drop 不触发（浏览器默认行为是打开文件）
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  const items = e.dataTransfer!.items; // 用 items 不用 files（items 才能探文件夹）
  const files = await collectFiles(items); // 见③：递归展开文件夹
  upload(files);
});
// 坑：拖拽区域是整个页面时要防"拖文件到页面误导航"——window 上也 preventDefault

// ② 粘贴上传（截图直达）
document.addEventListener("paste", (e) => {
  for (const item of e.clipboardData!.items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile()!;
      // 粘贴的文件名是 "image.png" 无意义，按时间戳重命名
      upload([renameFile(file, "screenshot-" + Date.now() + ".png")]);
    }
  }
});
// 注意：粘贴的文件没有路径信息；富文本编辑器里粘贴 HTML 中的图片是 URL 不是 File

// ③ 文件夹上传：拖拽场景的递归遍历（webkitGetAsEntry 版）
async function collectFiles(items: DataTransferItemList): Promise<File[]> {
  const result: File[] = [];
  const walk = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((res) =>
        (entry as FileSystemFileEntry).file(res));
      // file 无路径，用 fullPath 保留目录结构（后端据此还原目录树）
      Object.defineProperty(file, "relativePath", { value: entry.fullPath });
      result.push(file);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // 坑！readEntries 每次最多 100 条，必须循环读到空
      let batch: FileSystemEntry[];
      do {
        batch = await new Promise((res) => reader.readEntries(res));
        for (const e of batch) await walk(e);
      } while (batch.length > 0);
    }
  };
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) await walk(entry);
  }
  return result;
}
\`\`\`

getAsFileSystemHandle vs webkitGetAsEntry（新旧 API 的差异决策）：①**能力**——Handle 是新标准（File System Access API），拿到 handle 可以重复读文件（甚至写），Entry 只能读一次（file() 回调）；②**兼容性**——Entry API（webkit 前缀）实际支持更广（Chrome/FF/Edge/Safari 都支持拖拽遍历），Handle 在拖拽场景仅 Chromium（Firefox/Safari 的 DataTransferItem.getAsFileSystemHandle 长期未实现）——**2026 年的现实：拖拽文件夹遍历还是 webkitGetAsEntry 的天下**，Handle 用于 showDirectoryPicker 主动选择场景；③**大目录性能**——两者都是异步分批，但 Entry 的 readEntries 有"每次最多 100 条必须循环读"的祖传坑（只读一次会漏文件，这是无数上传器丢文件的根因）。

input webkitdirectory vs 拖拽遍历的取舍：①**input 版**（<input type="file" webkitdirectory>）——实现成本零（浏览器自己递归，files 平铺 + webkitRelativePath 给相对路径），但交互是"系统选择器选文件夹"，不能拖拽；②**拖拽版**——交互丝滑但实现复杂（上面的递归 + 100 条分页坑 + fullPath 拼接）；③**生产答案：两个都要**——入口按钮用 input 版（可靠），拖拽区用 Entry 版（体验），两者产出的 File 统一带 relativePath 进入同一上传管线。

真实案例与坑：①readEntries 漏文件事故——某设计稿上传工具，用户拖入 500 个文件的文件夹只传了 100 个，设计师"丢稿"投诉到 CEO。根因：readEntries 只调了一次（规范就是每次最多 100，要循环到空数组）。修复 + 加测试："mock 250 个 entry 的目录断言全部收齐"；②粘贴上传的格式陷阱——Mac 截图粘贴是 PNG，Windows 微信截图粘贴有时是 image/jpeg 有时直接给不出 File（剪贴板里是 DIB 位图格式，浏览器不暴露），要做"粘贴无 File 时的提示降级"；③拖拽区的 event 冒泡坑——页面多处 drop 监听（编辑器、上传组件、全局）互相 preventDefault 导致某些区域收不到，要用"最近原则"（最内层 dropZone 处理并 stopPropagation）+ 全局兜底防导航。卡帕西视角：上传交互的本质是"**把操作系统的文件语义翻译成 Web 的数据结构**"——目录树→平铺列表+路径字符串，剪贴板→File 对象，这个翻译层的 bug 全部表现为"用户文件丢失"，是产品信任度的生死线。`,
    keyPoints: ["拖拽文件夹遍历用 webkitGetAsEntry 递归（readEntries 必须循环读到空，单次最多 100 条是丢文件根因）", "getAsFileSystemHandle 仅 Chromium 支持拖拽场景，Entry API 才是全兼容现实；input webkitdirectory 做可靠入口", "粘贴截图文件名无意义要重命名；拖拽区 preventDefault 是前提，多 dropZone 用最近原则+全局兜底防误导航"],
    followUps: ["拖拽上传时如何在 drop 前预判内容（dragover 的 items 只有 type 没有 File）做「可放置」提示？", "webkitRelativePath 与 Entry fullPath 的路径格式差异（斜杠/盘符/编码）如何统一？"],
    favorited: false,
  },
  // ===== 专项能力层：数据可视化（fe-342~fe-349） =====
  {
    id: "fe-342",
    nodeId: "data-visualization",
    question: "图表渲染技术选型：Canvas、SVG、WebGL 三者的渲染原理、性能边界与适用场景是什么？ECharts 为什么选 Canvas？D3 为什么默认 SVG？",
    bigTech: true,
    answer: `结论：三者的本质差异在"**渲染结果的表示形式**"——SVG 是"DOM 节点即图形"（每个圆/线都是一个元素，可被 CSS/事件/无障碍树感知），Canvas 是"位图画布"（画完就是像素，无对象无事件，全部自己管理），WebGL 是"GPU 指令通道"（顶点着色器批量喂给显卡，JS 只组织数据不画像素）。性能边界经验值：SVG 在 ~1000 个元素内流畅（每元素都是 DOM 成本），Canvas 到 ~10 万图元（重绘整帧但无 DOM 开销），WebGL 百万级顶点（GPU 并行）。选型三问：多少个图元？要不要逐元素交互/无障碍？要不要逐帧动画？

\`\`\`
决策树（经验法则，不是教条）：
├─ 图元 < 1k 且需要复杂交互/可访问性（点击某个扇区/屏幕阅读器）
│   → SVG（D3 的默认领土：地图、关系图、编辑器类可视化）
├─ 图元 1k-100k 或需要频繁整体刷新（实时折线/大数据散点）
│   → Canvas（ECharts 的主战场：通用图表）
├─ 图元 > 100k（百万散点/轨迹流/3D）
│   → WebGL（deck.gl/l7/echarts-gl：地理与 3D 可视化）
└─ 混合：Canvas 画底图（性能敏感层）+ SVG 画标注层（交互敏感层）
    → 高德/百度地图标注、BI 工具的十字线层都是这个结构
\`\`\`

ECharts 选 Canvas 的深层理由：①**数据规模假设**——商业图表库按"万级数据点"设计（10 万点的折线），SVG 在这个规模 DOM 操作直接卡死（1 万个 circle 元素，一次数据更新 = 1 万次 DOM 属性写 + 全树 reflow）；②**增量渲染可控**——Canvas 每帧重绘，ECharts 的 incremental 模式把 10 万点分片到多帧渲染（不阻塞交互），SVG 做不到这种帧级调度；③**导出/合成自由**——Canvas 可直接 toDataURL 出图、可以离屏合成，SVG 导出要序列化 DOM + 处理外部资源；④代价就是交互要自己做：ECharts 内部维护"图元拾取系统"（每个图形的包围盒/路径，鼠标事件时做几何命中检测——zrender 库的 silent/ignore 机制），把 Canvas 的"无对象"劣势用空间索引补回来。

D3 默认 SVG 的理由（设计哲学）：①D3 的定位是"**数据驱动文档**"（Data-Driven Documents）——它的核心抽象是 data join（数据与 DOM 元素绑定），SVG 元素天然是 DOM，join 后 enter/update/exit 三态管理就是 D3 的灵魂；②D3 的目标场景是"定制化可视化"（NYT 的可交互新闻图、学术图表）——图元少（几百个）但每个都要精确控制（自定义路径/渐变/标注），SVG 的声明式正合适；③D3 也能画 Canvas（它有 d3-path 生成 Canvas 指令），但那就退化成"绘图工具"，失去了 DOM 绑定这个核心优势——所以 D3 + Canvas 的场景通常是"D3 算布局，Canvas 画像素"（力导向图 10 万节点：d3-force 算坐标，Canvas 画点）。

真实案例：①某监控大盘从 SVG 迁 Canvas——500 台服务器的状态网格（500 个 rect 每分钟变色），SVG 版变色时全页卡顿 200ms（500 次 DOM 写 + reflow），Canvas 版重绘 2ms；但后来产品要"点击格子下钻"，Canvas 版得自己写命中检测（算鼠标在哪个格子的数学）——**性能换来的代价是交互代码量**；②高德地图的标注层架构：百万 POI 用 WebGL（deck.gl 图层），几千个业务标注用 Canvas 层，几十个可点击气泡用 DOM 层——三层各取所长，这是"混合渲染"的教科书；③可访问性事故：某政府数据平台用纯 Canvas 图表，无障碍审计不过（屏幕阅读器读不到任何数据），被迫为每个图表补"隐藏的 SVG/表格版本"——Canvas 图表的可访问性要从第一天设计（aria-label 描述 + 数据表格备选），不是事后补丁。卡帕西视角：选型不是选"最强的技术"而是选"**与数据规模和交互复杂度匹配的最简技术**"——能用 SVG 不碰 Canvas（DOM 免费的交互/样式/无障碍），能用 Canvas 不碰 WebGL（2D API 一天上手，shader 一周入门），性能不够时自然知道该往哪迁。`,
    keyPoints: ["SVG=DOM 即图形（<1k 元素，交互/无障碍免费）；Canvas=位图（1k-100k，重绘整帧）；WebGL=GPU 通道（>100k 顶点）", "ECharts 选 Canvas：万级数据假设+分片增量渲染+导出自由，交互用空间索引（zrender 命中检测）补", "D3 默认 SVG 因核心抽象是 data join（数据绑 DOM）；D3+Canvas 场景=D3 算布局 Canvas 画像素"],
    followUps: ["WebGL 的 instancing（实例化渲染）如何把百万散点的 draw call 压到个位数？", "Canvas 图表的 aria 无障碍方案（aria-label+数据表格+focus 管理）完整设计？"],
    favorited: false,
  },
  {
    id: "fe-343",
    nodeId: "data-visualization",
    question: "10 万个数据点的折线图如何流畅渲染？数据抽样（LTTB 算法）、Canvas 分片绘制、WebGL 加速三条路径的原理与取舍？为什么直接全量绘制必死？",
    bigTech: true,
    answer: `结论：10 万点全量绘制的死因是"**像素浪费**"——1920px 宽的图表，横向只有 1920 个像素列，10 万点意味着每列 52 个点叠在一起，肉眼看到的效果与 2000 点完全一样，但绘制成本是 50 倍。第一条路永远是**数据抽样**（把 10 万点降到像素级密度，视觉无损）：LTTB（Largest-Triangle-Three-Buckets）是时序数据抽样的黄金标准（保形状不失真，远胜简单隔 N 取一）。抽样到 2000 点后 Canvas 轻松应对；WebGL 是"不能抽样"场景（金融逐笔/科学数据）的终极手段。

\`\`\`ts
// ① LTTB 抽样（保形抽样的经典算法，30 行实现）
function lttb(data: [number, number][], threshold: number): [number, number][] {
  if (data.length <= threshold) return data;
  const sampled: [number, number][] = [data[0]]; // 首尾必保留
  const bucketSize = (data.length - 2) / (threshold - 2);
  let a = 0; // 当前选中的点（三角形的左顶点）
  for (let i = 0; i < threshold - 2; i++) {
    // 当前桶范围 + 下一个桶的平均点（三角形右顶点用邻桶均值，保持趋势）
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const nextBucket = data.slice(rangeStart, Math.min(rangeEnd, data.length));
    const avgX = avg(nextBucket.map((p) => p[0]));
    const avgY = avg(nextBucket.map((p) => p[1]));
    // 桶内选"与左顶点 a、邻桶均值构成最大三角形"的点（形状贡献最大者）
    let maxArea = -1, maxIdx = rangeStart;
    const bucketStart = Math.floor(i * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (data[a][0] - avgX) * (data[j][1] - data[a][1]) -
        (data[a][0] - data[j][0]) * (avgY - data[a][1]),
      );
      if (area > maxArea) { maxArea = area; maxIdx = j; }
    }
    sampled.push(data[maxIdx]);
    a = maxIdx;
  }
  sampled.push(data[data.length - 1]);
  return sampled;
}
// 对比：隔 N 取一会丢峰值/谷值（极端点恰好被跳过），LTTB 保证形状特征点入选

// ② Canvas 分片绘制（抽样后仍大或不可抽样时的调度）
function drawInChunks(ctx: CanvasRenderingContext2D, points: [number, number][]) {
  const CHUNK = 20000;
  let i = 0;
  function drawChunk() {
    ctx.beginPath();
    for (let j = 0; j < CHUNK && i < points.length; j++, i++) {
      ctx.lineTo(points[i][0], points[i][1]); // 连续 path 不 break
    }
    ctx.stroke();
    if (i < points.length) requestAnimationFrame(drawChunk); // 每帧一片，不阻塞
  }
  drawChunk(); // ECharts 的 incremental rendering 同款思路
}
\`\`\`

三条路径的取舍矩阵：①**LTTB 抽样**——优点：视觉无损（峰值谷值全保留）、实现极简、与任何渲染层兼容；缺点：缩放时要按新视口重新抽样（zoom-in 后 2000 点不够用，要保留原始数据按需重抽）；适用：时序数据默认答案。②**Canvas 分片**——优点：数据保真（全量绘制）、代码简单；缺点：总绘制时间不变（只是摊到多帧）、低端机仍可能掉帧；适用：2-20 万点且"必须看到每一个点"的场景（如异常检测散点）。③**WebGL**——优点：百万点 60fps（GPU 并行，点的位置用 attribute buffer 一次喂入）；缺点：开发成本数量级上升（着色器/缓冲区管理/文字渲染要另想办法），或依赖 echarts-gl/deck.gl；适用：>50 万点或 3D 场景。工程上的组合策略：**缩略图用 LTTB 全览 + 主视图按视口范围抽 + 原始数据留在 Worker 里按需切片**——Kibana/Grafana 都是这个架构。

真实案例：①某 APM 产品的 trace 火焰图（单次请求 8 万 span）——初版全量 Canvas 绘制首屏 12s 白屏，用户以为卡死。优化链：span 按宽度过滤（<0.5px 的 span 聚合为"合并段"）+ 视口外不绘制 + LTTB 思想的三维变体（时间×层级×宽度三约束抽样），首屏降到 400ms；②Grafana 的 downsampling 演进——早期用平均聚合（avg 每 N 点），告警毛刺被平均掉（峰值没了，用户"监控漏报"），后来 M3/ClickHouse 后端默认用 min+max+avg 三聚合（前端画区间带），保峰又保形——说明**抽样算法的选择是业务语义问题**（监控场景丢峰值=事故）；③echarts-gl 的教训：某团队为 30 万散点上 WebGL，发现文字标签渲染还要 fallback 回 Canvas 2D（WebGL 画文字极难），两层对齐（相机矩阵同步）写了一个月——WebGL 路径的隐性成本 70% 在"非图形"部分（文字/交互/导出）。卡帕西视角：性能优化的第一性问题永远是"**用户真的需要这 10 万个点吗**"——抽样是把问题消灭在数据层，分片是把成本摊在时间维，WebGL 是用硬件暴力碾过去，按这个顺序尝试，90% 的问题在第一层就死了。`,
    keyPoints: ["全量必死因像素浪费：1920 列像素对 10 万点=每列 52 点叠加，视觉与 2000 点无异但成本 50 倍", "LTTB 保形抽样：桶内选最大三角形点，峰值谷值必保留；隔 N 取一会丢极端点；缩放要按视口重抽", "组合架构：缩略图全览抽样+主视图按视口抽+原始数据 Worker 切片；WebGL 的隐性成本在文字/交互/导出"],
    followUps: ["LTTB 在「多序列对齐抽样」（多折线共享 x 轴）时的失真问题与改进算法？", "Grafana 的 min/max/avg 三聚合区间带如何在 ECharts 里用 custom series 实现？"],
    favorited: false,
  },
  {
    id: "fe-344",
    nodeId: "data-visualization",
    question: "ECharts 的架构原理是什么？zrender 渲染层、增量渲染、数据驱动 option、动画系统四层如何协作？为什么 setOption 是增量合并而非全量替换？",
    bigTech: true,
    answer: `结论：ECharts 的四层架构：**zrender**（自研 2D 渲染引擎，Canvas/SVG 双后端，负责图形绘制与事件拾取）→ **series 层**（每种图表类型一个"数据→图元"的翻译器）→ **动画系统**（图元属性的插值引擎，数据更新自动补间）→ **option 驱动**（声明式配置，setOption 做 diff 合并后触发最小更新）。setOption 用增量合并（merge）而非替换的原因：**保留内部状态与动画连续性**——全量替换会让"上次的缩放位置、图例选中态、正在进行的动画"全部丢失，用户看到的就是图表闪断重开；merge 让"只改数据"时坐标轴/交互状态原样保留，数据变化还能平滑动画过渡。

\`\`\`js
// setOption 合并语义的实际影响
chart.setOption({                          // 第一次：完整配置
  xAxis: { type: "time" },
  series: [{ type: "line", data: [/* 1万点 */] }],
});
chart.setOption({ series: [{ data: newData }] }); // 第二次：只给数据
// merge 结果：xAxis 保留，series[0].type 保留（按 index 合并！），只有 data 被替换
// 且数据替换触发"形变动画"：旧折线平滑过渡到新折线（而非闪烁重开）

// 按 index 合并的坑：series 数组顺序变了会错位合并
chart.setOption({
  series: [
    { id: "a", data: d1 },  // ✅ 用 id 指定合并目标（顺序无关）
    { id: "b", data: d2 },
  ],
});
// 或 notMerge: true 彻底重建（放弃动画与状态保留，用于结构大改）
chart.setOption(newOption, { notMerge: true });
// 或 replaceMerge 只替换指定组件（精控制衡点）
chart.setOption(option, { replaceMerge: ["series"] });
\`\`\`

zrender 的核心设计（为什么是自研而非用现成库）：①**图形拾取系统**——Canvas 无 DOM 事件，zrender 给每个图形存包围盒与路径，鼠标移动时做"空间索引粗筛 + 路径精判"（isPointInPath），实现了悬停高亮/点击扇区这些"Canvas 上的 DOM 级交互"；②**增量渲染（incremental）**——大数据量时把图元分片，每帧画一批（不阻塞主线程长任务），用户看到图表"渐进式浮现"且中途可以交互；③**双后端抽象**——同一套图形描述可输出 Canvas 或 SVG（SVG 模式用于小数据量 + 需要 DOM 交互/打印保真的场景），业务无感切换；④**脏矩形优化**——局部更新时只重绘受影响区域（而不是整画布清屏重画），配合分层画布（静态层 + 动态层分离，十字线层独立重绘不碰底图）。

动画系统的本质：图元不是重建而是"**属性插值**"——数据更新时，每个图形元素的形状属性（path 的点坐标、rect 的宽高、颜色）从旧值插值到新值（requestAnimationFrame 驱动 + easing 函数），所以"折线图数据刷新"呈现为线条平滑蠕动到新形状。这个设计的代价：**动画要求新旧图元可配对**（同 id/同 index 的图元才能插值），所以 series 用 id 合并不仅为了正确性也为了动画连续性。性能预算上，同时动画的图元数要控制（几千个图元同时插值时 CPU 算不过来，ECharts 大数据量时会自动降级为无动画直接跳变）。

真实案例与坑：①实时行情大屏的"闪断"事故——前端每秒 setOption 全量 option（后端推什么塞什么），图表每秒闪白重开，客户投诉"像 PPT 翻页"。根因：全量 option 里 series 无 id，且包含 layout 配置导致 merge 后判定为结构变化重建。修复：静态配置只 setOption 一次，数据更新只推 { series: [{ id: "main", data }] }，闪断消失且有了平滑过渡动画；②merge 的数组陷阱——setOption({ xAxis: [{ max: 100 }] }) 后再 setOption({ xAxis: [{ min: 0 }] })，结果是 { max: 100, min: 0 }（merge 不是替换！），想清掉 max 必须显式 max: undefined 或 notMerge——无数人栽在"我明明没设这个值它哪来的"；③incremental 的交互坑——增量渲染进行中时，部分图元还没画出来，此时点击"未渲染区域"无响应（拾取系统里也还没有这些图元），大数据量下要展示"渲染中"状态并暂缓交互响应。卡帕西视角：ECharts 的架构是"**声明式外壳 + 命令式内核**"——option 是给人写的（声明心智），内部转 zrender 图元是指令式的（性能心智），merge 语义是两界的翻译协议，理解了 merge 就理解了为什么"声明式 API 也可以有状态"。`,
    keyPoints: ["四层架构：zrender（绘制+拾取）→series（数据→图元翻译）→动画（属性插值）→option（声明式 diff 合并）", "setOption merge 保状态与动画连续性；series 合并按 index（用 id 防错位）；数组字段 merge 不替换，清值要显式 undefined", "zrender 三大件：空间索引拾取（Canvas 上的 DOM 级交互）/分片增量渲染/脏矩形+分层重绘"],
    followUps: ["ECharts 5 的 dataset 组件与 series.data 直填在「数据复用与更新粒度」上的架构差异？", "zrender 的 SVG 后端与 Canvas 后端在事件拾取实现上的本质不同？"],
    favorited: false,
  },
  {
    id: "fe-345",
    nodeId: "data-visualization",
    question: "D3 的 data join（enter/update/exit）设计思想是什么？为什么说 D3 是「可视化内核」而非图表库？什么场景该用 D3 而非 ECharts？",
    bigTech: true,
    answer: `结论：D3 的核心抽象是"**数据与文档元素的绑定关系**"——data join 把数据数组和 DOM 选择集对齐，产生三种状态：enter（有数据无元素 → 创建）、update（都有 → 更新属性）、exit（有元素无数据 → 移除）。这个抽象让"数据变化驱动的 DOM 增删改"变成声明式三态处理，而不是手动 diff。D3 不是图表库——它不提供 barChart() 这种成品，它提供的是"**构造任何可视化的零件**"（比例尺/形状生成器/布局算法/数据绑定），所以 D3 的正确心智是"可视化领域的 jQuery + 算法库"。

\`\`\`js
// data join 三态的完整范式（D3 的灵魂代码）
const bars = d3.select("svg").selectAll("rect").data(data, (d) => d.id);
// key 函数 (d) => d.id：按 id 配对（默认按索引，数据乱序时按索引会错配！）

bars.enter()                    // 新数据：创建元素
  .append("rect")
  .attr("height", 0)            // 初始状态（动画起点）
  .merge(bars)                  // enter + update 合并处理共同属性
  .transition()
  .attr("x", (d) => x(d.name))
  .attr("height", (d) => h - y(d.value)); // 新值（动画终点）

bars.exit()                     // 消失的数据：移除元素
  .transition()
  .attr("height", 0)
  .remove();
// 数据从 10 条变 8 条：2 个 rect 退场动画后移除，8 个平滑更新
// 全程没有 if/else 判断"哪个该增哪个该删"——三态声明完毕，D3 做 diff

// D3 的"零件"示例：比例尺（数据域→像素域的纯函数）
const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, width]);
const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).range([h, 0]);
// 布局算法（力导向/层级/弦图——这些才是 D3 的不可替代品）
const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink(links));
\`\`\`

D3 vs ECharts 的决策框架（不是高低之分是定位之差）：①**需求是标准图表（折线/柱/饼/散点/雷达）+ 快速交付** → ECharts（配置 10 分钟出图，D3 要写 200 行）；②**需求是"世界上没有这种图"（定制布局/特殊映射/交互叙事）** → D3（NYT 的 scrollytelling、学术界的和弦图/桑基图定制、网络关系图）；③**需要 D3 的算法但不需要它的渲染** → 现代混血方案：d3-force 算节点坐标 + React 渲染 DOM、scaleLinear 做映射 + ECharts custom series 画图——D3 的模块是独立发布的（d3-scale/d3-force/d3-hierarchy 可单装），**把 D3 当算法库用是 2026 年的主流姿势**；④**数据量**——D3 默认 SVG（<1k 元素），超了要 D3 算 + Canvas 画，此时复杂度直逼自研，先问自己 ECharts 能不能凑合。

D3 的现代演进与误区：①**Observable Plot**——D3 团队意识到"零件太散"后出的"图表语法层"（Plot.barY(data).plot() 一行出图），定位类似 ggplot2——证明社区痛点的真实存在；②**D3 + React 的集成之争**——早期模式是"D3 操作 DOM，React 靠边"（useRef + useEffect 里跑 D3），这与 React 的声明式心智冲突；现代模式是"**D3 只做计算，React 负责渲染**"（D3 的 scale/shape 输出坐标和 path 字符串，React 渲染 <path d={pathStr}>），data join 的角色被 React 的 key + diff 接管——这是两个声明式系统的正确分工；③误区：把 D3 当"高级图表库"期待——它学习曲线陡（数据绑定/选择集/生成器三层概念），但陡的部分正是它的力量来源，用 ECharts 的心态学 D3 必然挫败。

真实案例：①某知识图谱产品（5 万节点关系图）——先用 ECharts graph 系列，力导向布局帧率 8fps 且定制节点形状受限；迁到 d3-force（Worker 里跑物理模拟）+ Canvas 自绘，帧率 45fps，节点的"论文卡片"样式完全自定义——D3 的布局算法质量（力收敛速度/稳定性）是 ECharts 内置布局比不了的；②一个数据新闻项目（滚动叙事：滚动到某段落，图表平滑形变到对应状态）——ECharts 做这种"图表即叙事道具"要 hack 大量私有 API，D3 + GSAP 用数据 join + transition 自然表达——**当可视化是"内容的一部分"而非"数据的容器"时，D3 是唯一解**；③反例：某团队用 D3 做管理后台的 20 个常规图表，两个前端写了三个月（坐标轴/图例/tooltip 全手撸），同样的活 ECharts 一周——选型错误不是技术问题是成本问题。卡帕西视角：D3 是"**给你最大的表达自由，同时把组合成本也给你**"——它是汇编语言，ECharts 是高级语言；问"该用哪个"前先问"我的需求在现有图表库的词汇表里吗"，在就用库，不在才上 D3。`,
    keyPoints: ["data join 三态：enter 创建/update 更新/exit 移除，key 函数配对防索引错配；声明三态，D3 做 diff", "D3=可视化内核（零件：比例尺/生成器/布局算法）非图表库；现代姿势=D3 当算法库单装模块用", "决策：标准图表快交付用 ECharts；定制布局/交互叙事/特殊映射用 D3；D3+React 现代分工=D3 算 React 渲染"],
    followUps: ["Observable Plot 的语法层设计（marks/channels）与 D3 原生 API 的抽象差异？", "d3-force 放 Web Worker 的架构（数据序列化成本与物理模拟帧率平衡）？"],
    favorited: false,
  },
  {
    id: "fe-346",
    nodeId: "data-visualization",
    question: "实时数据可视化（行情/监控大盘）的渲染调度怎么设计？高频推送（100 次/秒）下 requestAnimationFrame 节流、批量聚合、离屏缓冲、数据窗口滑动各起什么作用？",
    bigTech: true,
    answer: `结论：实时可视化的核心矛盾是"**数据到达速率 >> 屏幕刷新速率**"——WebSocket 推 100 次/秒，屏幕只有 60fps，且人眼能感知的极限也就 60 帧。渲染调度的四层设计：①**数据层缓冲**（推送先进队列，不直接触发渲染）；②**rAF 对齐渲染**（每帧最多渲染一次，把帧间到达的数据批量应用）；③**聚合降频**（帧内多次更新合并为最新快照，或按时间窗口聚合）；④**窗口滑动**（只保留可视时间窗的数据，老数据出窗即弃）。目标：渲染成本与数据速率解耦——推 100 次还是 1000 次，渲染都是 60fps 恒定。

\`\`\`ts
// 生产级实时渲染调度器
class RealtimeChart {
  private buffer: DataPoint[] = [];        // ① 数据缓冲队列
  private dirty = false;                    // 帧标记：本帧有待渲染数据
  private windowMs = 60_000;                // ④ 可视窗口 60s

  onPush(points: DataPoint[]) {
    this.buffer.push(...points);            // 推送只进队列，零渲染成本
    if (!this.dirty) {
      this.dirty = true;
      requestAnimationFrame(() => this.flush()); // ② 注册本帧渲染
    }
  }

  private flush() {
    this.dirty = false;
    // ③ 批量应用：帧内到达的 N 批数据一次处理
    const batch = this.buffer;
    this.buffer = [];
    this.data.push(...batch);
    // ④ 窗口滑动：丢弃出窗数据（数组头删是 O(n)，用环形缓冲或定期 slice）
    const cutoff = Date.now() - this.windowMs;
    let dropCount = 0;
    while (dropCount < this.data.length && this.data[dropCount].t < cutoff) {
      dropCount++;
    }
    if (dropCount > 1000) this.data = this.data.slice(dropCount); // 攒批删

    // 渲染：抽样后绘制（复用 fe-343 的 LTTB，窗口内 8 万点抽 1500）
    const sampled = lttb(this.data, this.targetPoints);
    this.draw(sampled);
  }
}
\`\`\`

四层机制的深度剖析：①**rAF 对齐的必要性**——直接在 onPush 里渲染，100 次推送 = 100 次绘制（60fps 屏幕浪费 40 次），且绘制阻塞 WS 消息处理（消息堆积，延迟越来越大，恶性循环）；rAF 把渲染锁在帧边界，绘制最多 60 次/秒，消息处理与渲染互不阻塞。②**批量聚合的两级**——第一级"快照覆盖"（同一指标的多次更新只保留最新值：股价 10ms 内跳 5 次，渲染时只画最后一次）；第二级"时间聚合"（100 个点聚合成 OHLC 一根 K 线，数据密度超过像素密度时聚合而非叠加）。③**窗口滑动的数据结构**——朴素 shift/slice 是 O(n) 且制造大量垃圾（每帧产生新数组），生产方案：环形缓冲区（RingBuffer，头尾指针移动 O(1)）或分块数组（chunk list，整块出窗整块丢）；内存硬顶必须设（WS 断开重连期间数据可能洪水般补发，无上限会 OOM）。④**离屏缓冲的适用面**——底图（坐标轴/网格/历史数据）不变时画到离屏 canvas，每帧只画"新增数据段"然后与底图合成（drawImage 贴底图 + 增量路径），避免全量重绘历史数据——滑动窗口场景"历史左移"其实整体在变，所以更常见的做法是**滚动偏移优化**：把画布内容 drawImage 左移 dx 像素，只在右侧空白带画新数据（股票软件的滚动条就是这么做的，整帧绘制量从 N 点降到新增 M 点）。

真实案例与坑：①某交易所行情页（500 档深度 + 逐笔成交 200 条/秒）——初版每条推送 setState（React），每秒 200 次 reconciliation，页面卡到 5fps。重构：推送 → 缓冲队列 → rAF 批量 flush → Canvas 绘制（绕过 React 渲染层），帧率稳定 60，CPU 降 70%。教训：**React 不适合承载高频数据流**（它的渲染调度以"用户交互"为假设），高频数据要在框架外的 ref/Worker 层处理，React 只负责低频的 UI 状态（连接状态/面板布局）；②聚合的语义坑——监控大盘把 1s 内 100 个 CPU 采样聚合为 avg，结果 99% 的毛刺被平均掉（故障时刻恰好在两帧之间），告警漏报。修复：聚合函数按业务选（监控用 max 保毛刺，趋势图用 avg 平滑，交易量用 sum），且聚合要在数据层完成而非渲染层；③离屏合成的 HiDPI 坑——离屏 canvas 没按 devicePixelRatio 缩放，drawImage 合成后全图模糊（Retina 屏），离屏与主屏必须同倍率。卡帕西视角：实时渲染的本质是"**用缓冲把「推送驱动」改造成「帧驱动」**"——推送是敌（不可控速率），帧是友（恒定预算），中间的四层机制都是这个改造工程的部件；谁直接在回调里画图，谁就把系统的生死交给了推送方的良心。`,
    keyPoints: ["四层调度：推送进缓冲队列→rAF 帧边界批量 flush→帧内快照/时间聚合→窗口滑动+环形缓冲控内存", "React 不承载高频流（200 次/s setState=5fps），数据层在 ref/Worker，React 只管低频 UI 状态", "滚动场景用 drawImage 左移+右侧增量绘制；离屏缓冲必须按 devicePixelRatio 同倍率否则 Retina 模糊"],
    followUps: ["Web Worker 里做数据聚合 + Transferable 传输给主线程渲染的架构与序列化成本？", "环形缓冲区在「多序列不同速率推送」时的对齐与水位管理？"],
    favorited: false,
  },
  {
    id: "fe-347",
    nodeId: "data-visualization",
    question: "Canvas 可视化的性能优化武器库：脏矩形重绘、图层分离（多层 canvas 叠加）、离屏缓存、避免状态切换，各自的原理与适用场景？",
    bigTech: true,
    answer: `结论：Canvas 性能优化的总纲是"**减少每帧的绘制工作量**"——Canvas 没有 DOM 的"只更新变化元素"概念，默认每帧全量重绘，所有优化武器都在回答"这一帧哪些可以不画"。四大武器：①**脏矩形**（只重绘变化区域的矩形范围，clearRect + clip 限定）；②**图层分离**（多个 canvas 元素叠放，静态层不动，动态层独立重绘——牺牲内存换帧率）；③**离屏缓存**（复杂图形一次画到离屏 canvas，之后 drawImage 复用位图，把"绘制成本"换成"贴图成本"）；④**状态批处理**（fillStyle/strokeStyle 切换有成本，按样式分组批量绘制）。

\`\`\`js
// ① 脏矩形：只重绘变化区域
function renderDirtyRegion(dirty: {x: number; y: number; w: number; h: number}) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(dirty.x, dirty.y, dirty.w, dirty.h);
  ctx.clip();                       // 裁剪：后续绘制只影响此区域
  ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h);
  redrawElementsInRegion(dirty);    // 只画与此区域相交的元素（需空间索引）
  ctx.restore();
}
// 适用：局部变化（光标移动/单点更新）；收益与画布面积成反比
// 坑：抗锯齿边缘要外扩 1-2px，否则留下残影；元素跨区时重绘边界计算复杂

// ② 图层分离：canvas 元素叠放（CSS position absolute 叠层）
// <canvas id="bg">   静态：坐标轴/网格/历史底图（数据不变不重画）
// <canvas id="main"> 半动态：数据图形（数据变才重画）
// <canvas id="hud">  高频：十字线/tooltip/高亮框（每鼠标移动都重画，但只有几笔）
function onMouseMove(e: MouseEvent) {
  hudCtx.clearRect(0, 0, W, H);     // 只清 HUD 层（几 KB 像素）
  drawCrosshair(hudCtx, e.offsetX, e.offsetY); // 底图层零成本
}
// 收益：高频小更新的成本不再与底图复杂度挂钩
// 代价：N 层 = N 份位图内存（4K 画布一层 33MB）；层数 3-4 层是甜点

// ③ 离屏缓存：复杂图形位图化
const spriteCache = new OffscreenCanvas(64, 64);
drawComplexIcon(spriteCache.getContext("2d")!); // 画一次（100 条 path）
// 之后一万次引用：
for (const pos of positions) {
  ctx.drawImage(spriteCache, pos.x, pos.y); // 每次 1 次 drawImage（GPU 纹理拷贝）
}
// 收益：绘制成本 O(path 复杂度) → O(1)；散点图的自定义点形状、地图的 POI 图标必用
// 注意：HiDPI 下离屏要按 dpr 缩放，否则贴上去模糊

// ④ 状态批处理：按样式分组
// ❌ 交替切换样式（每次切换都 flush GPU 管线）
items.forEach((it) => {
  ctx.fillStyle = it.color;
  ctx.fillRect(it.x, it.y, 10, 10);
});
// ✅ 按颜色分组（同样式一段 path 一次 fill）
const byColor = groupBy(items, "color");
for (const [color, group] of byColor) {
  ctx.fillStyle = color;
  ctx.beginPath();
  group.forEach((it) => ctx.rect(it.x, it.y, 10, 10));
  ctx.fill(); // 一次提交
}
\`\`\`

武器的选择与组合拳：①**更新频率分层**是选武器的元规则——把场景元素按更新频率分档（永不/低频/高频/每帧），每档一个策略：永不→静态层或离屏缓存，低频→脏矩形，高频→独立图层，每帧→最小化该层元素数；②**测量先行**——Canvas 性能的测量工具：Performance 面板看 Rendering/Painting 占比、ECharts 的 opts.useDirtyRect（内置脏矩形开关，官方实测大数据 tooltip 场景帧率提升 2-5 倍）、自测每帧绘制指令数；③**反面教材预警**——save/restore 滥用（每画一个元素 save 一次，状态栈 push/pop 成本可观）、shadowBlur 大量使用（阴影是逐像素模糊，Canvas 性能黑洞，图表里能不用就不用）、渐变对象每帧新建（createLinearGradient 每帧调用 = 每帧分配新对象，缓存之）。

真实案例：①某电力监控大屏（2 万设备点位 + 每 5s 数据刷新）——初版单 canvas 全量重绘，每帧 180ms（幻灯片体验）。优化组合：底图（地图+网格）静态层 + 设备图标离屏 sprite 缓存 + 数据变化用脏矩形（5s 内变化的设备通常 <5%，区域重绘）+ 告警闪烁动画独立 HUD 层，帧成本降到 8ms；②ECharts 的 dirtyRect 实践——官方 5.3 引入 useDirtyRect，在"大数据量 + tooltip 十字线"场景，鼠标移动从整画布重绘变为只重绘十字线经过的窄条区域，低端机帧率 12→55fps；③阴影性能事故：某设计稿要求所有柱状图带弥散阴影（shadowBlur: 20），800 根柱子帧率 6fps，改成立体渐变模拟阴影视觉（无 shadowBlur）后 60fps——设计师要的"柔和感"可以用渐变/透明度骗出来，不要用真实模糊算出来。卡帕西视角：Canvas 优化与 DOM 优化的思维差异在于"**DOM 帮你做增量，Canvas 增量全靠自己**"——所有武器本质都是"自己实现一个增量系统"（按区域增量=脏矩形，按频率增量=图层，按内容增量=离屏缓存），理解了这一点，武器库可以自己生长。`,
    keyPoints: ["四大武器：脏矩形（区域增量）/图层分离（频率分层，3-4 层甜点）/离屏缓存（内容复用位图化）/状态批处理（按样式分组一次提交）", "元规则=按更新频率分档配策略；ECharts useDirtyRect 官方实测 tooltip 场景帧率 2-5 倍", "性能黑洞：save/restore 滥用/shadowBlur 大面积模糊/每帧新建渐变对象；HiDPI 离屏必须按 dpr 缩放"],
    followUps: ["脏矩形在「元素大面积重叠」（散点密集区）时的收益衰减与合并策略？", "多层 canvas 与 WebGL 的单一上下文在多显示器不同 dpr 场景的适配差异？"],
    favorited: false,
  },
  {
    id: "fe-348",
    nodeId: "data-visualization",
    question: "图表的交互系统怎么设计？tooltip 十字线、框选缩放（brush）、图例联动、下钻（drill-down）四类交互的事件架构与状态管理？Canvas 图表如何做精确的图形拾取？",
    bigTech: true,
    answer: `结论：Canvas 图表交互的核心难点是"**没有 DOM 事件免费午餐**"——所有交互要自建：图形拾取（鼠标位置→命中哪个图元）、事件分发（hover/click/drag 路由到对应交互模块）、状态管理（当前高亮/选中/缩放窗）。架构三层：①**拾取层**（空间索引 + 几何判定）；②**交互层**（每种交互一个状态机：tooltip/brush/legend/drill）；③**渲染层联动**（交互状态变化触发对应图层重绘）。四类交互的共性：都是"**手势 → 状态机迁移 → 视觉反馈**"的循环。

\`\`\`ts
// ① 图形拾取：空间索引 + 两级判定
class PickSystem {
  private grid = new Map<string, GraphicElement[]>(); // 空间哈希格

  build(elements: GraphicElement[]) {
    // 粗筛结构：把画布分成 64px 格子，元素按包围盒注册到覆盖的格子
    for (const el of elements) {
      for (const key of coveredGridKeys(el.bbox)) {
        pushTo(this.grid, key, el);
      }
    }
  }
  pick(x: number, y: number): GraphicElement | null {
    // 第一级：只查鼠标所在格子的元素（10 万元素 → 格子内几个）
    const candidates = this.grid.get(gridKey(x, y)) ?? [];
    // 第二级：精确几何判定
    for (let i = candidates.length - 1; i >= 0; i--) { // 顶层优先（后画的在上）
      const el = candidates[i];
      if (el.type === "rect" && pointInRect(x, y, el.bbox)) return el;
      if (el.type === "path" && ctx.isPointInPath(el.path2d, x, y)) return el;
      if (el.type === "circle" && dist(x, y, el.cx, el.cy) <= el.r) return el;
    }
    return null;
  }
}
// Path2D 是现代 Canvas 的拾取利器：路径存对象，isPointInPath 硬件加速
// 折线图的拾取不是"点在线上"而是"最近数据点吸附"（距离 x 最近的点高亮）

// ② 框选缩放（brush）的状态机
// idle →(mousedown)→ brushing(记录起点，HUD 层画选框)
//      →(mousemove 实时更新选框)→ brushing
//      →(mouseup)→ 计算选框覆盖的数据范围 → setZoom(domain) → idle
// 关键：选框画在 HUD 层（不动底图）；松手后按选框范围重设比例尺 domain，
// 数据按新 domain 重抽样（复用 LTTB）再重绘——这是"缩放即重新抽样"的联动

// ③ 图例联动：legend 点击 → 该 series visible=false →
//    重算可见系列的 y 轴 domain（隐藏最大值系列后轴要自适应收缩）→ 形变动画
\`\`\`

四类交互的设计要点与坑：①**tooltip**——十字线跟随是"最近点吸附"（对 x 扫描线找最近数据点），多序列时一次性展示该 x 处所有序列值（联动 tooltip）；坑：大数据量下"找最近点"必须二分查找（有序 x 轴），线性扫描 10 万点每次 mousemove 卡 5ms 积累成掉帧；②**brush 缩放**——选框过程中不要实时重抽样（拖动时数据不动，只有 HUD 选框动），松手才一次性重算；坑：时序轴缩放要处理"选框跨夏令时/跨断档"（金融数据周末空档），比例尺的 domain 语义要分清"索引域"还是"时间域"；③**图例联动**——隐藏系列后 y 轴自适应是体验关键（ECharts 默认重算 domain），但"多 y 轴"（左右双轴）时联动规则要用户可预期（左轴系列隐藏只重算左轴）；④**下钻**——本质是"数据层级导航"（省 → 市 → 区），状态栈管理（面包屑 = 栈），每层有自己的比例尺与抽样；坑：下钻动画（父块放大过渡到子视图）要求父子图元可配对（同 id 映射），与 fe-344 的动画配对机制同源。

事件架构的工程化（ECharts 的做法值得抄）：①**事件总线解耦**——拾取层只发"原始事件 + 命中图元"，交互模块订阅自己关心的（tooltip 订阅 mousemove，brush 订阅 mousedown/move/up 序列）；②**手势识别层**——mousedown+move+up 序列识别为 click/drag/wheel-zoom 等"手势"，交互模块面向手势编程而非原始事件（双击与两次单击的消歧、拖拽阈值 3px 内算点击）；③**状态与渲染的联动协议**——交互状态存统一 store（hovered/selected/zoomStack），渲染层订阅 store 变化按图层重绘（hover 只重绘 HUD 层，zoom 重绘全部）；④**移动端手势**——touch 的 pinch（双指缩放）与 pan（平移）要映射到同一套状态机（pinch → zoom，pan → 窗口平移），不能只写 mouse 事件。

真实案例：①某 BI 工具的"联动分析"（点击 A 图的柱子，B/C/D 图同时过滤高亮）——初版用事件直接互调（A 图调 B 图的 filter 方法），图表多了以后依赖成网；重构为"全局 selection store"（所有图表订阅同一份选择状态，各自决定如何视觉响应），新增图表零接入成本——**联动交互的正确架构是共享状态而非互相调用**；②tooltip 的边界处理事故——图表贴屏幕右边缘时 tooltip 浮层超出视口被裁，用户看不到值。修复：浮层定位逻辑加"视口碰撞检测"（右侧不够放就翻到左侧，上不够翻到下），这个细节是"能用"与"好用"的分水岭；③Canvas 拾取的替代方案评估：有团队用"离屏颜色编码拾取"（每个图元在离屏画布用唯一颜色画一遍，读鼠标处像素色值反查图元）——O(1) 精确拾取（连 path 内部都准），代价是一份离屏内存；适合图元形状极复杂（地图多边形）的场景，空间索引适合常规图元。卡帕西视角：交互系统的复杂度不在"单个交互"而在"**交互间的状态一致性**"（brush 中 tooltip 要不要显示？下钻后 legend 状态保留吗？）——这些问题的答案不在代码里在产品定义里，先画出"交互状态机全图"再动手，否则每个新交互都是一次存量回归。`,
    keyPoints: ["拾取两层判定：空间哈希粗筛（格子索引）+几何精判（Path2D.isPointInPath 硬件加速）；折线用最近点吸附+二分查找", "brush 拖动只动 HUD 选框，松手才重设 domain+重抽样；tooltip 贴边要视口碰撞检测翻转", "联动架构=共享 selection store 而非图表互调；手势识别层消歧 click/drag/pinch，移动端映射同一状态机"],
    followUps: ["颜色编码离屏拾取（唯一色反查）与空间索引在 10 万图元下的性能对比？", "「框选过滤」与「框选缩放」的产品语义差异在状态机上如何区分（mouseup 后的分支）？"],
    favorited: false,
  },
  {
    id: "fe-349",
    nodeId: "data-visualization",
    question: "Canvas 图表的 HiDPI（Retina）适配怎么做？devicePixelRatio 缩放的完整实现、线条发虚/文字模糊的根因、图表导出高清图片的方案？",
    bigTech: true,
    answer: `结论：HiDPI 适配的本质是"**CSS 像素与物理像素的换算**"——Retina 屏 devicePixelRatio=2，一个 CSS 像素对应 2×2 物理像素，Canvas 默认按 CSS 尺寸分配位图（1:1），浏览器把 300px 位图拉伸到 600 物理像素显示 = 全线模糊。标准解法三连：①canvas.width/height 按 dpr 放大（位图用物理像素尺寸）；②canvas.style.width/height 保持 CSS 尺寸（布局不变）；③ctx.scale(dpr, dpr)（绘图坐标系仍用 CSS 像素思考，映射到底层物理像素）。导出高清图：用更大 dpr 重绘到离屏再 toDataURL。

\`\`\`ts
// ① HiDPI 适配的标准三件套
function setupHiDPICanvas(canvas: HTMLCanvasElement, cssW: number, cssH: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssW * dpr);   // 位图物理尺寸
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = cssW + "px";         // CSS 布局尺寸（不变）
  canvas.style.height = cssH + "px";
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);                      // 坐标系映射：代码里继续用 CSS 像素
  return ctx;
}
// 之后所有绘制坐标/字号都用 CSS 像素值，浏览器按 dpr 映射到物理像素 = 全清晰

// ② 0.5px 对齐（细线发虚的克星）
// dpr=1 屏幕上画 1px 竖线 x=100：线横跨 x=99.5~100.5 两个物理像素列，
// 每列只覆盖一半 → 抗锯齿成 50% 灰度的"虚线"
// 解法：奇数宽度的线画在半像素处
ctx.moveTo(Math.round(x) + 0.5, 0);  // 1px 线完美落在物理像素列中央
ctx.lineTo(Math.round(x) + 0.5, h);
// dpr=2 屏无此问题（1 CSS px = 2 物理 px 整除），所以发虚多在 dpr=1 屏

// ③ 导出高清图（离屏放大重绘）
function exportPNG(chart: Chart, scale = 3): string {
  const off = document.createElement("canvas");
  const { width, height } = chart.size;
  off.width = width * scale;
  off.height = height * scale;
  const offCtx = off.getContext("2d")!;
  offCtx.scale(scale, scale);
  chart.render(offCtx);                    // 用 3 倍尺寸完整重绘（矢量指令重放）
  return off.toDataURL("image/png");       // 3000×2000 的高清图（印刷级）
}
// 关键：导出是"重绘"而非"放大截图"——canvas.toDataURL 直接导当前画布
// 只有 dpr 倍清晰度，重绘到 3x 离屏才是真高清（文字/线条重新光栅化）
\`\`\`

模糊根因的深度剖析（面试要能讲出三层）：①**位图拉伸模糊**——canvas 位图 < 显示尺寸时被浏览器插值放大（双线性插值，边缘发虚）——这是没做 dpr 三件套的症状；②**半像素抗锯齿**——线条落在物理像素边界上，每边覆盖 50%，抗锯齿渲染成灰色半透明（1px 线变 2px 灰线）——dpr=1 屏的经典病，0.5px 对齐解决；③**变换矩阵累积误差**——多次 scale/translate 后坐标变成 100.499999 这类值，落在非整数像素上全线轻微模糊——解法：关键绘制前 ctx.setTransform(dpr, 0, 0, dpr, 0, 0) 重置矩阵（而不是在脏矩阵上继续叠）。文字模糊的特例：textBaseline/字体在缩放后由系统重新光栅化，理论上 ctx.scale 后文字是清晰的（文字是矢量渲染），如果文字模糊大概率是"截取了缩放前的画布"或 CSS transform: scale 缩放 canvas 元素（CSS 缩放是位图拉伸，必模糊——检查有没有给 canvas 加 transform！）。

dpr 的动态性（容易漏的边界）：①**多显示器拖动**——窗口从 dpr=1 的显示器拖到 dpr=2 的显示器，matchMedia("(resolution: 2dppx)").change 或 resize 监听里要重新 setup（位图尺寸重建 + 重绘）；②**浏览器缩放**——Ctrl +/- 改变 dpr（125% 缩放时 dpr=1.25），同上监听重建；③**dpr 不是整数**——1.25/1.5 倍缩放下，0.5px 对齐规则失效（物理像素网格变了），此时"对齐到物理像素"的正确计算是 Math.round(x * dpr) / dpr。

真实案例：①某报表系统的"打印模糊"投诉——屏幕上看清晰（dpr 适配做了），打印模糊（打印机 300dpi，相当于 dpr≈3）。修复：打印前用 3x 离屏重绘导出 PNG 塞进打印视图，或用 SVG 后端（矢量天然高清）——ECharts 双后端的价值在此显现（屏幕用 Canvas 性能，打印切 SVG 矢量）；②CSS transform 事故——设计师给图表容器加了 transform: scale(0.9) 做"卡片缩略"效果，图表全糊（位图被二次拉伸），排查两天才发现不是图表库问题是外层 CSS。规则：**canvas 元素及其祖先禁止 CSS 缩放**，要缩放就重设 canvas 尺寸重绘；③ECharts 的实现参考——它内部 pixelRatio 选项默认取 window.devicePixelRatio，导出 getDataURL 时可以传 pixelRatio: 3 获得高清图（离屏重绘机制官方封装好了），自研图表库时这三个 API（init 的 pixelRatio、export 的 pixelRatio、resize 时的重建）抄它的语义即可。卡帕西视角：HiDPI 问题的本质是"**抽象泄漏**"——Canvas 用"像素"这个词同时指 CSS 像素和物理像素，所有模糊都是这两个"像素"没对齐的症状；适配方案的优雅之处在于 ctx.scale 把这层换算一次性吃掉，让业务代码重新活在"一像素就是一像素"的纯真年代。`,
    keyPoints: ["HiDPI 三件套：位图按 dpr 放大+CSS 尺寸不变+ctx.scale(dpr) 坐标映射；dpr 动态变化（拖屏/缩放）要监听重建", "模糊三根因：位图拉伸（没适配）/半像素抗锯齿（dpr=1 要 0.5px 对齐）/CSS transform 缩放 canvas（位图二次拉伸，禁止）", "导出高清=离屏 3x 重绘（矢量指令重放重新光栅化），不是放大当前画布位图；打印场景可切 SVG 后端"],
    followUps: ["dpr=1.25/1.5 非整数屏的物理像素对齐通式（Math.round(x*dpr)/dpr）在折线密集场景的实测效果？", "WebGL 场景的 HiDPI 适配与 Canvas2D 的差异（drawingBufferSize 与抗锯齿 MSAA）？"],
    favorited: false,
  },
];

/**
 * 按拓扑顺序生成学习计划：
 * FRONTEND_NODES 已按「基础层 → 进阶层 → 工程化层 → AI 前端」拓扑排列，
 * 每天安排 2 个 learn（最后一天可能 1 个），并穿插对前一天首节点的 review。
 */
function buildSchedule(): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const learnPerDay = 2; // 每天学习 2 个节点

  FRONTEND_NODES.forEach((node, index) => {
    const day = Math.floor(index / learnPerDay) + 1;
    schedule.push({
      day,
      nodeId: node.id,
      type: "learn",
      estimatedMinutes: 30,
      completed: false,
    });
    // 从第 2 天起，插入对前一天首个学习节点的复习
    if (index >= learnPerDay) {
      const reviewNode = FRONTEND_NODES[index - learnPerDay];
      schedule.push({
        day,
        nodeId: reviewNode.id,
        type: "review",
        estimatedMinutes: 15,
        completed: false,
      });
    }
  });

  // 按天排序：同一天内 learn 在前、review 在后
  schedule.sort((a, b) =>
    a.day !== b.day ? a.day - b.day : a.type === "learn" ? -1 : 1
  );
  return schedule;
}

export const FRONTEND_PRESET = {
  topic: "前端工程师（含 AI 前端方向）",
  knowledgeTree: FRONTEND_NODES,
  questions: FRONTEND_QUESTIONS,
  schedule: buildSchedule(),
};