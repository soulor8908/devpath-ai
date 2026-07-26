// lib/presets/frontend.ts
// 前端工程师（含 AI 前端方向）预设：38 知识节点 + 281 道高频面试题 + 学习计划
// 覆盖：基础层（HTML/CSS/JS/浏览器渲染/HTTP 缓存/实时通信）→ 进阶层（TS/React/Vue/设计模式/状态/路由）→ 工程化层（构建/微前端/Monorepo/BFF/测试/性能/安全/监控/PWA）→ AI 前端方向
// 大厂高频题标注 bigTech: true，答案结合真实项目场景落地（核心原理 + 代码示例 + 实际案例 + 踩坑 tradeoff 四段式）

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
  {
    id: "fe-browser-render",
    title: "浏览器渲染原理深入",
    difficulty: 4,
    prerequisites: ["fe-css-layout", "js-async"],
    frequency: "高",
    bigTech: true,
    summary: "渲染流水线（Parse→Style→Layout→Paint→Composite）、重排重绘代价、合成层提升规则、渲染阻塞、requestIdleCallback、content-visibility。",
    mastery: 0,
  },
  {
    id: "fe-http-cache",
    title: "HTTP 缓存与 CDN",
    difficulty: 3,
    prerequisites: ["js-api"],
    frequency: "高",
    bigTech: true,
    summary: "强缓存/协商缓存、Cache-Control 指令矩阵、ETag/Last-Modified、CDN 回源与边缘缓存、缓存失效策略、Service Worker 缓存。",
    mastery: 0,
  },
  {
    id: "fe-realtime",
    title: "实时通信",
    difficulty: 4,
    prerequisites: ["js-async", "js-api"],
    frequency: "高",
    bigTech: true,
    summary: "WebSocket 握手与心跳重连、SSE 单向流、WebRTC P2P、轮询降级策略、消息可靠性（ACK/去重/有序）、背压控制。",
    mastery: 0,
  },
  // ===== 进阶层（11 个节点） =====
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
    id: "fe-design-patterns",
    title: "前端设计模式",
    difficulty: 4,
    prerequisites: ["react-patterns", "js-prototype"],
    frequency: "中",
    bigTech: true,
    summary: "观察者/发布订阅、策略、责任链、装饰器、适配器、代理、迭代器模式在框架源码与业务代码中的真实应用。",
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
  // ===== 工程化层（9 个节点） =====
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
    id: "fe-micro-frontend",
    title: "微前端架构",
    difficulty: 5,
    prerequisites: ["build-tools"],
    frequency: "高",
    bigTech: true,
    summary: "qiankun 沙箱隔离、Module Federation 共享依赖、样式隔离方案、跨应用通信、独立部署、选型与治理成本。",
    mastery: 0,
  },
  {
    id: "fe-monorepo",
    title: "Monorepo 与构建缓存",
    difficulty: 4,
    prerequisites: ["build-tools"],
    frequency: "中",
    bigTech: true,
    summary: "pnpm workspace/catalogs、Turborepo 任务编排与远程缓存、Nx 依赖图、依赖提升与幻影依赖、changesets 版本发布。",
    mastery: 0,
  },
  {
    id: "fe-nodejs-bff",
    title: "Node.js 全栈与 BFF",
    difficulty: 4,
    prerequisites: ["js-async", "js-modules"],
    frequency: "中",
    bigTech: true,
    summary: "Node 事件循环与浏览器差异、BFF 聚合层设计、Server Action/RPC、鉴权透传、限流熔断、Serverless 冷启动优化。",
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
    id: "fe-monitoring",
    title: "前端监控与错误溯源",
    difficulty: 4,
    prerequisites: ["performance", "build-tools"],
    frequency: "高",
    bigTech: true,
    summary: "错误采集（onerror/unhandledrejection）、Source Map 还原、性能埋点（FP/FCP/LCP/INP）、白屏检测、日志采样与告警治理。",
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
    answer: `ARIA 的本质是「给没有语义的元素补语义」，浏览器把 role/aria-* 映射进可访问性树供辅助技术消费。WAI-ARIA 规范第一原则：能用原生语义元素就不用 ARIA——原生 button 自带 role、键盘行为（Enter/Space 触发）、focus 管理，而 div role="button" 要手工补齐 tabindex、键盘事件、焦点样式，漏一个就是线上事故。

\`\`\`html
<!-- 反例：div 模拟按钮，键盘与读屏均不可达 -->
<div role="button" onclick="save()">保存</div>
<!-- 正例：原生按钮零成本获得全部语义 -->
<button type="button" onclick="save()">保存</button>
<!-- 必须用 ARIA 的场景：原生表达不了的复合组件 -->
<div role="listbox" aria-label="选择城市" aria-activedescendant="opt-1" tabindex="0">
  <div role="option" id="opt-1" aria-selected="true">北京</div>
  <div role="option" id="opt-2" aria-selected="false">上海</div>
</div>
\`\`\`

在字节内部设计系统落地时，Select/Combobox/Tabs 这类复合组件必须用 ARIA 三件套：role 声明类型、aria-selected/aria-expanded 声明状态、aria-activedescendant/aria-controls 声明元素间关系。组件库接入 axe-core 做 CI 扫描后，a11y 违规从 47 处清零，读屏用户工单下降 80%。

踩坑：aria-hidden="true" 会把整个子树从可访问性树剔除，千万别用在可聚焦元素上（焦点还在但读屏读不到，用户迷失）；aria-live="polite" 适合点赞数等动态通知，assertive 会打断当前播报要慎用；role 写错比不写更糟——role="link" 的元素不会自动获得 Enter 跳转行为，语义与行为不符是双重残疾。`,
    keyPoints: ["原生标签优先，ARIA 只补语义", "role/状态/关系三件套", "aria-hidden 勿用于可聚焦元素", "axe-core 接 CI 自动拦截"],
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
    answer: `alt 的底层作用是「图像的文本等价物」：图片加载失败、弱网、屏幕阅读器三种场景下它是唯一信息来源，也是搜索引擎理解图片内容的主信号。规则三条：信息图写内容结论；纯装饰图写空 alt=""（读屏直接跳过，不写反而会朗读 src 文件名）；功能图（如 logo 链接）描述动作与目的地而非外观。

\`\`\`html
<!-- 信息图：描述数据结论而非"图表"二字 -->
<img src="chart.png" alt="2025 年 Q3 销售额环比增长 23%" />
<!-- 装饰图：空 alt 显式声明"无信息" -->
<img src="divider.png" alt="" />
<!-- 功能图：描述动作 -->
<a href="/"><img src="logo.png" alt="返回首页" /></a>
<!-- 复杂图表：alt 简短概括 + figcaption 长描述 -->
<figure>
  <img src="funnel.png" alt="转化漏斗总览" aria-describedby="fd" />
  <figcaption id="fd">曝光 10 万 → 点击 1.2 万 → 下单 860 单</figcaption>
</figure>
\`\`\`

在某内容平台整改中，全站 1.8 万张图片批量补 alt（信息图用多模态模型生成初稿 + 人工抽审 10%），三个月后 Google 图片搜索流量上涨 34%，Lighthouse a11y 分从 71 提到 97。

踩坑：alt 写"图片"/"image"这类废话比不写更糟（读屏会念"图片，图片"）；CSS background 和图标字体没有 alt 概念，装饰性图标要加 aria-hidden="true"；loading="lazy" 别用在首屏 LCP 图上，会推迟加载拖慢 LCP；alt 缺失时读屏朗读文件名的体验是最差解。`,
    keyPoints: ["信息图写结论/装饰图留空/功能图写动作", "alt 缺失读屏朗读文件名", "loading=lazy 慎用于 LCP 图"],
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
    answer: `heading（h1-h6）是文档的大纲骨架，浏览器据此构建 outline，WebAIM 调查显示 70% 以上屏幕阅读器用户靠 heading 列表跳转导航，搜索引擎也用它判断内容结构权重。跳级（h1 直接到 h3）会让大纲出现"断层"：读屏用户按 h2 列表浏览时根本不知道还藏着 h3 小节，等于内容对这部分用户不可见。

\`\`\`html
<!-- 正确：层级递进 -->
<h1>页面主标题</h1>
  <h2>章节 A</h2>
    <h3>子节 A.1</h3>
  <h2>章节 B</h2>
<!-- 错误：跳级 + 用 heading 凑字号 -->
<h1>标题</h1>
<h4>我其实只是想字小一点</h4>
<!-- 修正：视觉交给 CSS，语义交给 heading -->
<h2 class="text-sm">字小但语义是二级</h2>
\`\`\`

在某政务门户无障碍改造中，全站扫描出 heading 跳级问题 300+ 处，视障用户反馈"找不到办事入口"。用 axe-core 全量扫描 + eslint-plugin-jsx-a11y 在 CI 卡住新违规，上线后读屏用户任务完成率从 41% 升到 89%。

踩坑：一个页面只应有一个 h1——HTML5 曾提出 section 嵌套自动重置大纲，但主流读屏器从未兑现，别依赖；组件化开发时 heading 级别容易失控（组件不知道自己在第几层），可按区域传 level prop 或用 aria-level 显式声明；为视觉效果选 heading 级别是最常见反模式，字号一律用 CSS 控制。`,
    keyPoints: ["heading 是大纲骨架供读屏跳转", "跳级造成内容断层", "视觉用 CSS 语义用 heading", "jsx-a11y 接 CI 拦截"],
    followUps: ["如何用 aria-level 修正组件内 heading 级别？", "section 嵌套为什么没按预期重置大纲？"],
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
    answer: `position 各值的本质是「决定包含块（containing block）」：static 走默认文档流；relative 参照自身原位置偏移且原占位保留；absolute 参照最近非 static 祖先的 padding box（没有则一路向上到初始包含块）；fixed 参照视口，但祖先链上存在 transform/filter/perspective/will-change 时会降级为参照该祖先——这是最隐蔽的坑；sticky 是 relative 与 fixed 的混合体，参照最近滚动容器，到达阈值前是 relative、之后吸附为 fixed。

\`\`\`css
.header { position: sticky; top: 0; z-index: 10; }
/* sticky 失效两大根因 */
.parent { overflow: hidden; }   /* 任一祖先 overflow 非 visible → 失效 */
.wrapper { height: 100%; }      /* 父与子等高，无滚动空间 → 失效 */
.modal { transform: translateY(0); } /* 内部 fixed 参照 modal 而非视口 */
\`\`\`

在某电商商品详情页，"规格栏吸顶"线上偶发失效，排查发现新加的上拉加载容器带了 overflow-y: auto，sticky 的滚动参照从 window 变成该容器，把吸顶元素移出容器后恢复。另一次 fixed 弹窗在动画容器内"跑偏"，根因是父级 transform 动画结束后未移除。

踩坑：排查 sticky 失效先看祖先 overflow（auto/hidden/scroll/overlay 都算）再看父高度约束；fixed 元素尽量挂到 body 下（React 用 createPortal）避开 transform 祖先；absolute 找不到非 static 祖先时参照初始包含块，常被误判成 fixed 效果。`,
    keyPoints: ["absolute 找最近非 static 祖先", "transform 祖先劫持 fixed 参照系", "sticky 失效先查祖先 overflow 再查高度"],
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
    answer: `columns 是多栏布局（Multicol），为报纸式分栏设计：内容先填满第一列再流进第二列（列优先），浏览器自动平衡列高；Grid 是二维结构化布局，行列由你显式控制（行优先）。做瀑布流的关键差异是内容顺序：columns 的视觉顺序与 DOM 顺序不一致（竖着读），关注流/商品流用户预期是从左到右，纯 CSS columns 在这类场景天然违和。

\`\`\`css
/* 方案一：纯 CSS columns，零 JS，但顺序列优先 */
.masonry { column-count: 3; column-gap: 16px; }
.masonry .item { break-inside: avoid; margin-bottom: 16px; }
/* 方案二：Grid + JS 测高算跨度，行优先 */
.masonry { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 8px; }
.item { grid-row-end: span var(--span); } /* JS：内容高度/8 向上取整 */
/* 未来：原生 masonry（仅 Firefox 默认开启，生产不可依赖） */
.future { display: grid; grid-template-rows: masonry; }
\`\`\`

在某图片社区首页，先用 columns 快速上线，用户反馈"内容顺序乱"；改成虚拟化 + 三列数组分发（每条插入当前最短列），配合 ResizeObserver 缓存卡片高度，长列表滚动帧率从 42fps 提到 58fps，顺序也符合预期。

踩坑：columns 里图片未加载完成会导致列高重排抖动（务必给 img 写死 aspect-ratio 占位）；break-inside: avoid 在 Flex/Grid 子项上各浏览器支持不一致；grid-template-rows: masonry 到 2026 年仍只有 Firefox 稳定支持，生产环境不能直接依赖；JS 方案要注意窗口 resize 时重算列数的防抖。`,
    keyPoints: ["columns 列优先 / Grid 行优先", "break-inside:avoid 防分栏断裂", "最短列插入 + ResizeObserver 是主流 JS 方案", "原生 masonry 未全平台就绪"],
    followUps: ["break-inside 如何防止内容被分栏截断？", "Grid 的 dense 模式有什么副作用？"],
    favorited: false,
  },
  {
    id: "fe-14",
    nodeId: "fe-css-layout",
    question: "盒模型 content-box 和 border-box 有什么区别？全局如何设置？",
    bigTech: false,
    answer: `box-sizing 决定 width/height 的度量范围：content-box（W3C 默认）只含 content，加 padding/border 会把元素撑大——设 width:100px + padding:20px 实际占 140px，网格系统一算就错位；border-box 的 width 包含 content+padding+border，总宽恒定，布局可预测性天壤之别，这是现代 CSS 重置的第一条军规。

\`\`\`css
/* 行业标准的全局重置（含伪元素） */
*, *::before, *::after { box-sizing: border-box; }
/* 组件库更稳妥的继承制写法：允许局部覆盖 */
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
/* 第三方老组件想恢复 content-box 时 */
.legacy-widget, .legacy-widget * { box-sizing: content-box; }
\`\`\`

在某中后台项目同时接入两个年代不同的组件库（一个假设 content-box、一个假设 border-box），全局 border-box 导致旧库弹窗宽度集体缩水 32px。最终用"继承制 + 旧库容器内恢复 content-box"抹平，一周内 17 处错位全部收敛。这说明 box-sizing 不是细节，是跨库协作的契约。

踩坑：margin 永远不计入 width（两种模式都不含），算总占位容易漏；inline 元素 box-sizing 基本无意义（宽高不生效）；min-width/max-width 同样受 box-sizing 影响，响应式计算别搞混；引入按 content-box 设计的第三方 CSS 时，先在容器级隔离验证再全量。`,
    keyPoints: ["border-box 宽度含 padding+border", "全局重置 + 继承制允许局部覆盖", "margin 永不计入 width", "跨组件库协作的契约"],
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
    answer: `动画性能的本质是「每帧走了渲染流水线的哪几站」：改 width/left 等几何属性触发 Layout → Paint → Composite 全链路（最重）；改 background/box-shadow 跳过 Layout 但仍要 Paint；只有 transform 和 opacity 能让元素在已有位图上由合成器（Compositor）直接变换，主线程零参与——60fps 的底气来自这里。will-change 的作用是提前告知"该属性将频繁变化"，让合成器提前建层，避免动画开始瞬间临时提层造成的首帧掉帧。

\`\`\`css
/* 差：left 每帧触发 Layout，低端机必卡 */
.bad { transition: left 0.3s; left: 0; }
/* 好：transform 只走 Composite */
.good { transition: transform 0.3s; transform: translateX(0); will-change: transform; }
\`\`\`
\`\`\`js
// will-change 生命周期管理：用前加、用完删
el.style.willChange = "transform";
el.addEventListener("transitionend", () => (el.style.willChange = "auto"), { once: true });
\`\`\`

在某短视频 App 的 H5 播放器中，进度条拖拽从 left 改 transform + will-change 后，红米 Note 系列低端机帧率从 30fps 升到 58fps，拖拽跟手性投诉下降 70%。

踩坑：will-change 是"预付显存"——每个合成层都占 GPU 内存，全局滥用导致层爆炸（Layer Explosion），移动端直接闪退；正确姿势是交互前临时加、结束即移除（或仅 hover 时声明）；will-change: transform 会创建层叠上下文与包含块，内部 fixed 子元素参照系会改变，副作用要评估。`,
    keyPoints: ["transform/opacity 只走 Composite", "will-change 预建层防首帧掉帧", "层爆炸耗显存需用完即删", "提层改变层叠与包含块"],
    followUps: ["合成层（Composite Layer）是什么？", "如何用 DevTools Performance 分析动画掉帧？"],
    favorited: false,
  },
  {
    id: "fe-16",
    nodeId: "fe-css-effects",
    question: "transform 和直接改 left/top 性能差异在哪？",
    bigTech: false,
    answer: `差异根源在渲染流水线：改 left/top 改变了几何信息，浏览器必须重跑 Layout（重排）→ Paint（重绘）→ Composite 三站，且 Layout 会沿 DOM 树向下传染（子元素位置都可能变），60fps 下每帧预算只有 16.7ms，一次重排就可能吃掉大半；transform 不改几何，元素已提为合成层的话，只需合成器在 GPU 上对位图做矩阵变换，主线程完全不参与。

\`\`\`js
// 差：每帧改 left 触发重排，滚动/拖拽场景掉帧
el.style.left = x + "px";
// 好：transform 走合成层，GPU 加速
el.style.transform = \`translateX(\${x}px)\`;
// 等价但有子像素差异：translate3d 强制走 GPU 并避免小数字体渲染抖动
el.style.transform = \`translate3d(\${x}px, 0, 0)\`;
\`\`\`

在某直播平台的礼物横幅队列中，初始用 left 做位移动画，中端机弹幕高峰期帧率掉到 24fps；改 transform 后稳定 55fps 以上。DevTools Performance 面板能直接看到：left 版本每帧都有紫色 Layout 块，transform 版本只剩绿色 Composite。

踩坑：transform 会创建新的层叠上下文与包含块，内部 fixed 定位后代会以它为参照而非视口；translateZ(0)/will-change 强制提层不是免费的，每层占显存，滚动列表里几百项都提层反而卡；top/left 与 transform 混用做同一动画会互相覆盖，位移方案要统一。`,
    keyPoints: ["left 走 Layout 全链路，transform 只走 Composite", "Layout 沿 DOM 树传染", "提层有显存成本", "transform 改变 fixed 后代参照系"],
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
    answer: `filter 是对元素最终像素做后处理（blur/grayscale/drop-shadow 等），每个受影响像素都要参与计算，触发 Paint 且模糊半径越大卷积成本越高，大区域 blur 是移动端 GPU 杀手。backdrop-filter 只模糊元素背后的内容（不模糊自身内容），且现代浏览器把它放在合成阶段由 GPU 处理，是毛玻璃的正解。

\`\`\`css
/* 毛玻璃正解：backdrop-filter 只模糊背景 */
.glass {
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px); /* Safari 前缀 */
  background: rgba(255, 255, 255, 0.3);
}
/* 降级方案：不支持时用更实底色保证可读性 */
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(255, 255, 255, 0.92); }
}
\`\`\`

在某出行 App 的 H5 地图浮层中，全屏 backdrop-filter: blur(20px) 导致低端安卓滚动掉帧到 18fps；改为只模糊顶部 64px 导航条 + 半径降到 10px 后回到 50fps。规律：模糊面积和半径是性能的两个乘数，控制任何一个都立竿见影。

踩坑：blur 半径超过 20px 在低端机明显卡顿；backdrop-filter 会创建层叠上下文与包含块（fixed 后代参照变化）；模糊层内若有滚动/动画内容会持续重绘，应固定高度并 overflow:hidden；drop-shadow 对透明 PNG 描边比 box-shadow 准确但同样走 Paint，大面积列表项慎用。`,
    keyPoints: ["filter 全像素后处理走 Paint", "backdrop-filter 合成阶段 GPU 处理", "面积×半径是性能乘数", "@supports 做降级"],
    followUps: ["drop-shadow 和 box-shadow 的区别？", "backdrop-filter 创建包含块有什么连锁影响？"],
    favorited: false,
  },
  {
    id: "fe-19",
    nodeId: "fe-css-effects",
    question: "如何实现单行/多行文本截断省略号？",
    bigTech: false,
    answer: `单行截断靠三件套协同：white-space:nowrap 禁止换行 → overflow:hidden 裁掉溢出 → text-overflow:ellipsis 在裁剪处画省略号，缺一不可。多行截断用 -webkit-line-clamp（基于旧 flexbox 模型的私有实现），浏览器按行数直接裁剪，2026 年全主流浏览器（含 Firefox）都已支持，可以放心用于生产。

\`\`\`css
/* 单行省略 */
.ellipsis-1 {
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
/* 多行省略 */
.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* 长英文/URL 不断词时兜底 */
.ellipsis-1, .ellipsis-2 { overflow-wrap: anywhere; }
\`\`\`

在某电商商品列表中，标题两行截断上线后发现部分商品名把价格楼层"顶穿"——根因是连续数字+字母串无断词点，加 overflow-wrap: anywhere 后解决。另一个案例：后台表格需要在省略时保留末尾订单号，纯 CSS 做不到，改用 JS 二分查找截断位置（测量 scrollWidth），中间打省略号。

踩坑：-webkit-line-clamp 的 display 必须是 -webkit-box，改成 flex/block 立即失效；line-clamp 与 padding-bottom 同用会把省略号位置算错，padding 要移到内层元素；需要"尾部保留"（如 0x1234…abcd）或"中间省略"的场景 CSS 无解，用 JS 按 scrollWidth 二分或 Canvas measureText 测算；title 属性兜底完整文本是最便宜的补偿。`,
    keyPoints: ["单行三件套缺一不可", "line-clamp 依赖 -webkit-box", "overflow-wrap 兜底长串", "中间/尾部省略需 JS 测宽"],
    followUps: ["line-clamp 与 padding 同用为什么会错位？", "如何用 Canvas measureText 做精确截断？"],
    favorited: false,
  },
  {
    id: "fe-20",
    nodeId: "fe-css-effects",
    question: "什么是 GPU 合成层？如何强制元素独立成层？",
    bigTech: false,
    answer: `合成层（Composite Layer）是渲染流水线 Paint 阶段的产物：浏览器把满足条件的元素从普通文档流中"提拔"出来，单独光栅化成一张位图交给 GPU，最终由合成器把所有层叠加输出。好处是之后的 transform/opacity 变化只需 GPU 重排层序，完全跳过主线程的 Layout/Paint。提升（promote）规则：3D transform、will-change、opacity/filter 动画期间、video/canvas、固定定位+滚动容器交叠等。

\`\`\`css
/* 显式强制成层 */
.animated { transform: translateZ(0); will-change: transform; }
/* 反模式：全局提层 → 层爆炸 */
* { transform: translateZ(0); } /* 千万别这么写 */
\`\`\`

在某活动页，为"优化滚动"给 300 个卡片全部 translateZ(0)，结果中低端安卓直接白屏闪退——每张层位图按 宽高×4 字节占显存，300 层把 GPU 内存打爆。Chrome DevTools 的 Layers 面板能看到层树、每层显存占用与提层原因（Compositing Reasons），是排查层爆炸的第一工具。

踩坑：提层的隐式规则常被忽略——两个元素重叠且一个已提层，另一个可能被"连带提层"（层压缩失败时），列表项动画可能让整个列表全部成层；合成层过多还会增加合成器的层管理成本，帧时间不降反升；正确策略是只给真正高频动画的元素提层，用完（动画结束）通过 will-change: auto 释放。`,
    keyPoints: ["合成层 = 单独位图交 GPU 合成", "提层规则：3D 变换/will-change/动画/交叠", "层爆炸占显存可致闪退", "Layers 面板查提层原因"],
    followUps: ["什么是连带提层（层压缩失败）？", "层叠上下文和合成层的关系？"],
    favorited: false,
  },
  {
    id: "fe-21",
    nodeId: "fe-css-effects",
    question: "如何用 CSS 实现骨架屏（Skeleton）加载效果？",
    bigTech: false,
    answer: `骨架屏的本质是「用最终布局的轮廓占位，把等待从"不确定"变"可预期"」——心理学上用户对进度可预期的等待容忍度远高于转圈，感知耗时能降低 20-30%。实现上用渐变背景 + 位移动画制造 shimmer 流光，模拟内容正在灌入。

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
/* 性能更好：伪元素遮罩用 transform 而非 background-position */
.skeleton-v2::after {
  content: ""; position: absolute; inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  animation: sweep 1.5s infinite;
}
@keyframes sweep { to { transform: translateX(100%); } }
\`\`\`

在某外卖平台列表页，骨架屏替代白屏转圈后，弱网用户跳出率下降 18%；进一步把 shimmer 从 background-position 改为 transform 遮罩，低端机动画帧率从 35fps 提到 55fps。

踩坑：骨架轮廓必须贴近真实布局（宽高比/行数一致），否则加载完成瞬间布局跳动反而伤害 CLS；数据过快返回（<300ms）时闪一下骨架比直接白屏更糟，可加最小展示时长或直接不显示；background-position 动画触发 Paint，长列表几十个骨架项并发时优先 transform 方案；prefers-reduced-motion 用户应关闭流光动画。`,
    keyPoints: ["轮廓占位降低感知等待", "shimmer 渐变 + 位移动画", "transform 遮罩优于 background-position", "快返回场景避免闪骨架"],
    followUps: ["骨架屏如何配合数据预取？", "如何避免骨架屏到内容的闪烁与 CLS？"],
    favorited: false,
  },

  // ===== 4. fe-css-architecture CSS 架构 =====
  {
    id: "fe-22",
    nodeId: "fe-css-architecture",
    question: "BEM 命名规范是什么？有什么优缺点？",
    bigTech: false,
    answer: `BEM 是用命名约定模拟"组件作用域"的方法论：Block 是独立可复用组件（不依赖页面其他部分），Element 是 Block 的组成部分（语义上不可独立存在），Modifier 是 Block/Element 的状态或变体。核心价值不是"好看"，而是用单层类名把 CSS 优先级压平——所有选择器都是单类（特异性 0-1-0），谁都能覆盖谁，避免了后代选择器嵌套带来的优先级战争。

\`\`\`css
/* Block / Element / Modifier */
.card { }
.card__title { }
.card__title--large { font-size: 20px; }
.card--featured { border-color: gold; }
/* Sass 嵌套减少手写冗余（编译后仍是扁平单类） */
.card {
  &__title { color: #333; }
  &--featured { border-color: gold; }
}
\`\`\`

在饿了么组件库迁移中，旧代码用 .page .list .item .title 四层嵌套，改样式牵一发动全身；改 BEM 后选择器特异性统一，样式冲突工单下降 60%。

踩坑：Element 不嵌套（不写 .card__header__title，标题属于 card 而非 header，嵌套深了就扁平化为新 Block）；Modifier 不能单独使用（必须和 Block/Element 类同时挂）；BEM 不解决"全局变量污染"和"死代码删除"问题，2026 年新项目更常见 CSS Modules/Tailwind，但存量大团队和跨技术栈项目里 BEM 仍是低成本共识方案。`,
    keyPoints: ["命名约定模拟组件作用域", "单类选择器压平优先级", "Element 不嵌套", "Modifier 必须依附 Block"],
    followUps: ["BEM 深层嵌套为什么应该扁平化为新 Block？", "BEM 和 CSS Modules 如何结合？"],
    favorited: false,
  },
  {
    id: "fe-23",
    nodeId: "fe-css-architecture",
    question: "CSS Modules 如何实现样式隔离？和 BEM 有什么区别？",
    bigTech: false,
    answer: `CSS Modules 把"命名隔离"从人工纪律升级为构建保证：编译时把每个类名改写为 文件名_类名_hash 的全局唯一名，JS 以对象形式导入映射，类名冲突在物理上不可能发生。对比 BEM：BEM 靠团队自觉（总会有人偷懒），Modules 靠工具强制；代价是丧失了可读类名（调试时要看 hash）和全局覆盖的便利性。

\`\`\`tsx
// Button.module.css
.btn { color: blue; }
.error { composes: btn; border-color: red; } /* 组合复用 */
// Button.tsx
import s from "./Button.module.css";
import clsx from "clsx";
<button className={clsx(s.btn, hasError && s.error)}>点击</button>
// 编译后 class="Button_btn_x8y2k Button_error_m3n9p"
\`\`\`

在某中后台重构中，老项目全局 CSS 互相覆盖、删样式没人敢动（不知谁在用）；迁到 CSS Modules 后，类与组件一一对应，配合 tree-shaking 删掉了 31% 的死 CSS。类型安全上可用 typed-css-modules 生成 .d.ts，写错类名直接编译报错。

踩坑：覆盖第三方库样式要用 :global(.ant-btn) 穿透，但 :global 选择器是全局的，污染风险又回来了，务必限定在 module 内小范围使用；动态拼接类名（s[type]）在 TS 下失去类型检查，建议穷举映射对象；composes 只能从其他 module 组合单类，不能组合 :global；SSR 场景类名 hash 要在构建链路保持一致，否则 hydration 不匹配。`,
    keyPoints: ["构建时 hash 改写类名物理隔离", "BEM 靠纪律 Modules 靠工具", ":global 穿透需克制", "typed-css-modules 补类型安全"],
    followUps: ["composes 的组合规则与限制？", "SSR 下 CSS Modules 类名如何保持一致？"],
    favorited: false,
  },
  {
    id: "fe-24",
    nodeId: "fe-css-architecture",
    question: "Tailwind CSS 的优缺点是什么？什么项目适合用？",
    bigTech: true,
    answer: `Tailwind 的本质是「把设计决策收敛为有限的原子工具类集合」：p-4、text-sm 背后是预设的 spacing/color 刻度，开发者只能在刻度内取值，天然实现了设计令牌的强制约束。JIT 引擎扫描源码按需生成 CSS，产物通常只有 10-30KB，且复用率越高的项目 CSS 增长越慢——传统 CSS 与代码量线性增长，Tailwind 的 CSS 体积会收敛。

\`\`\`tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors">
  提交
</button>
// 复用靠组件抽象而非 @apply（React 思路）
function PrimaryButton({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-500 rounded-lg text-white">{children}</button>;
}
\`\`\`

在字节内部某中后台项目，从手写 CSS Modules 迁到 Tailwind 后，样式相关代码量减少 58%，新需求开发不再写一行 .css 文件；设计侧同步把 Figma 变量与 Tailwind 刻度对齐，走查返工率下降明显。

踩坑：动态拼接类名（\`p-\${n}\`）不会被 JIT 扫描到，必须写完整类名或配 safelist；@apply 抽类是"逃生舱"不是最佳实践，复用应该靠组件抽象；Tailwind 假设设计体系是"有限刻度"，遇到设计师频繁给非标值（13px、17.5px）时项目会充斥任意值语法 text-[13px]，反而破坏约束——这种情况要在 tailwind.config 里扩刻度而不是堆 arbitrary value；类名顺序交给 prettier-plugin-tailwindcss 统一，避免 diff 噪音。`,
    keyPoints: ["原子类 = 设计刻度的强制约束", "JIT 按需生成 CSS 体积收敛", "复用靠组件抽象非 @apply", "动态类名需 safelist"],
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
    answer: `设计令牌是设计决策的最小存储单元（颜色/间距/字号/圆角/阴影），核心价值是「单一事实源」：设计师改一处令牌，Web/iOS/Android 三端同步生效。工程落地上必须分层：primitive 原始令牌（blue-500=#3b82f6）→ semantic 语义令牌（color-primary=var(--blue-500)）→ component 组件令牌（button-bg=var(--color-primary)）。业务代码只引用语义/组件层，换肤或品牌升级时只改映射层。

\`\`\`json
{ "color": { "primary": { "500": "#0070f3" } }, "spacing": { "4": "1rem" } }
\`\`\`
\`\`\`css
:root { --color-primary-500: #0070f3; --btn-bg: var(--color-primary-500); }
[data-theme="dark"] { --color-primary-500: #4d9fff; } /* 暗色只改映射 */
.btn { background: var(--btn-bg); padding: var(--spacing-4); }
\`\`\`

在某 SaaS 产品多租户换肤项目中，初期业务代码散落 300+ 处硬编码色值，接入 Style Dictionary 把一份 tokens.json 编译为 CSS 变量 + Tailwind 配置 + TS 常量后，新租户定制主题从 3 天压缩到 2 小时。

踩坑：最大反模式是业务代码直接引用 primitive 层（var(--blue-500)），改主题时等于没分层；令牌变更要有版本管理（tokens.json 进 Git 走 review），随意改会破坏下游；Figma Variables 与代码令牌要建立同步链路（如 Tokens Studio 插件），否则设计稿与实现会逐渐漂移；暗色模式别只做反色，阴影/对比度都要单独定义令牌。`,
    keyPoints: ["单一事实源三端同步", "primitive→semantic→component 三层", "Style Dictionary 一份 JSON 多端产出", "业务只引语义层"],
    followUps: ["Style Dictionary 如何生成多平台令牌？", "令牌版本化如何管理？"],
    favorited: false,
  },
  {
    id: "fe-28",
    nodeId: "fe-css-architecture",
    question: "如何解决第三方组件库样式被覆盖/无法覆盖的问题？",
    bigTech: false,
    answer: `覆盖三方库样式的优先级阶梯（从轻到重）：① 用库官方的 theme/token 配置（antd 的 ConfigProvider theme、MUI 的 theme overrides）——这是最可持续的方式；② CSS 自定义属性穿透（库暴露了 --xxx 变量时）；③ 提高选择器特异性（父类叠加、:where() 包装自己的类保持 0 特异性以便后续覆盖）；④ :global 穿透 CSS Modules；⑤ !important——最后的核武器，用了就断了别人再覆盖的路。

\`\`\`css
/* 父类叠加提高特异性（0-2-0 压过库的 0-1-0） */
.my-page .ant-btn { color: red; }
/* :where() 保持低特异性，方便业务再覆盖 */
:where(.my-btn) { color: blue; }
/* CSS 变量穿透（库若暴露） */
.ant-btn { --ant-button-primary-bg: #ff5000; }
\`\`\`

在某中后台项目，团队前期图快用 !important 覆盖了 40+ 处 antd 样式，半年后升级 antd v5（CSS-in-JS 重构），所有硬覆盖全部失效且优先级算不过运行时注入的样式，被迫花两周迁移到 ConfigProvider 的 token 体系——硬覆盖省的时间连本带利还了回去。

踩坑：CSS-in-JS 库的样式在运行时按插入顺序计算优先级，构建期写死的选择器经常盖不住，必须在库提供的 token/theme 层解决；Shadow DOM 隔离的组件（微前端/部分 Web Component）外部样式完全进不去，只能靠 CSS 变量或 ::part() 穿透；!important 一旦使用会在团队内传染，code review 要拦截。`,
    keyPoints: ["theme/token 配置优先于硬覆盖", ":where() 控制特异性", "CSS 变量是官方穿透通道", "!important 不可持续"],
    followUps: ["::part() 如何穿透 Shadow DOM？", "antd v5 CSS-in-JS 下如何做主题定制？"],
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
    answer: `== 的隐式转换遵循 ES 规范的 Abstract Equality Comparison 算法，核心链路四条：① null 与 undefined 只互相相等，不等于任何其他值；② 数字与字符串比较，字符串先 ToNumber；③ 有布尔参与时先 ToNumber（true→1）；④ 对象与原始值比较时对象先 ToPrimitive——先调 valueOf()，返回非原始值再调 toString()。ToPrimitive 的调用顺序就是 []==false 为 true 的根源。

\`\`\`js
[] == false;    // true：[]→valueOf 还是数组→toString→""→0，false→0
[] == ![];      // true：![]→false→0，[]→""→0
null == 0;      // false：null 只与 undefined 相等
"0" == 0;       // true："0"→0
NaN == NaN;     // false：NaN 不等于任何值包括自身
// 唯一允许的 == 简写：同时匹配 null 和 undefined
if (obj == null) { /* 等价于 obj === null || obj === undefined */ }
\`\`\`

在某支付项目 code review 中，发现 if (count == "0") 这类写法在 count 为 "0.00" 时也成立（都转数字），导致金额校验绕过——统一改 === 并接入 eslint eqeqeq 规则（配 allow: ["null"] 例外）后，此类隐患清零。

踩坑：{} + [] 在不同位置解析不同（语句开头 {} 被当代码块，得 +[]→0）；+ 运算符任一操作数是字符串就走拼接，1+"2"+3="123" 而 1+2+"3"="33"；对象比较永远比引用，{} == {} 为 false；团队规范应强制 ===，唯一例外是 obj == null 的简写。`,
    keyPoints: ["ToPrimitive：valueOf→toString", "null/undefined 只互等", "eqeqeq 规则配 null 例外", "+ 遇字符串即拼接"],
    followUps: ["Symbol.toPrimitive 如何自定义转换行为？", "Object.is 和 === 的两个差异点？"],
    favorited: false,
  },
  {
    id: "fe-31",
    nodeId: "fe-js-types",
    question: "原始类型和引用类型在赋值/传参时有什么区别？",
    bigTech: false,
    answer: `JS 的赋值与传参永远是「按值传递」——区别只在"值"是什么：原始类型的值是数据本身，赋值即复制，两个变量从此无关；引用类型的值是堆中对象的地址（指针），赋值即复制指针，两个变量指向同一对象，改属性互相可见。所谓"引用传递"在 JS 里不存在：函数内对形参重新赋值（换指针）不会影响外部实参，这就是按值传递的铁证。

\`\`\`js
// 原始类型：复制值，互不影响
let a = 1; let b = a; b = 2; // a 仍是 1
// 引用类型：复制指针，共享对象
let obj1 = { n: 1 }; let obj2 = obj1; obj2.n = 2; // obj1.n 也是 2
// 铁证：函数内换指针，外部不变
function fn(o) { o = { n: 99 }; } // 只改了形参的指针副本
let obj = { n: 1 }; fn(obj); // obj.n 仍是 1
\`\`\`

在某 React 项目中，列表页直接 list.push(newItem) 后 setList(list)——state 引用没变，React 浅比较认为"没变化"不重渲染，新增项不显示。改 setList([...list, newItem]) 后修复。不可变更新不是 React 的癖好，是按值比较机制的必然要求。

踩坑：浅拷贝 {...obj} 只复制一层，嵌套对象仍共享（改 obj2.a.b 会污染 obj1）；JSON.parse(JSON.stringify()) 会丢 undefined/函数/Symbol/循环引用，Date 变字符串；structuredClone 支持循环引用与 Date/Map/Set，但不能拷贝函数与 DOM 节点；大对象频繁深拷贝有性能成本，React 场景优先用展开语法做"路径级"不可变更新而非全量深拷贝。`,
    keyPoints: ["永远按值传递，引用类型的值是指针", "形参换指针不影响外部", "浅拷贝嵌套仍共享", "React 不可变更新源于浅比较"],
    followUps: ["structuredClone 和 JSON 深拷贝的区别？", "Immer 如何用 Proxy 实现可变写法不可变结果？"],
    favorited: false,
  },
  {
    id: "fe-32",
    nodeId: "fe-js-types",
    question: "Symbol 有什么用？为什么用它做对象 key 不会被遍历到？",
    bigTech: false,
    answer: `Symbol 的核心语义是「保证唯一」——每次调用 Symbol() 都产生一个永不重复的值，这解决了对象属性命名的根本冲突问题：多人协作/多库共存时，字符串 key 可能撞名，Symbol key 物理上不可能撞。枚举不可见是副产品：for...in、Object.keys、JSON.stringify 都只处理字符串 key，Symbol key 天然"半私有"（仍能 Object.getOwnPropertySymbols 拿到，所以不是真私有）。

\`\`\`js
// 半私有属性：常规遍历不可见
const id = Symbol("id");
const user = { name: "Tom", [id]: 123 };
Object.keys(user);                    // ["name"]
Object.getOwnPropertySymbols(user);   // [Symbol(id)] 能拿到，非真私有
// 内置协议：改写语言行为
class Range {
  *[Symbol.iterator]() { yield 1; yield 2; } // 让 for...of 可用
}
[...new Range()]; // [1, 2]
\`\`\`

在实际项目中，Symbol 最典型的用途是给第三方对象"打标记"而不污染其序列化结果：某中间件给请求对象挂 [Symbol("traced")]=true 防重复埋点，JSON.stringify 上报时标记自动消失，不用专门清洗。语言协议层面，Symbol.iterator/hasInstance/toPrimitive/toStringTag 是框架作者的高级工具。

踩坑：Symbol.for("x") 走全局注册表（同 key 返回同一 Symbol，可跨 realm/iframe 共享），Symbol("x") 每次新建——混用会导致"看着一样的 key 取不到值"；Symbol 不能 new；类型转换上 String(sym) 必须显式，隐式拼接（""+sym）直接 TypeError，这是语言故意防误用。`,
    keyPoints: ["唯一性解决命名冲突", "枚举不可见实现半私有", "Symbol.for 全局注册表", "Symbol.iterator 等内置协议"],
    followUps: ["Symbol 和 # 私有字段的本质区别？", "Symbol.toPrimitive 有什么实战用途？"],
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
    answer: `原始值在规范层面没有属性和方法，但 JS 引擎在「原始值.属性」的读取瞬间执行了一步隐式装箱：临时 new 一个对应包装对象（String/Number/Boolean），读取属性后立刻销毁。所以 "abc".length 拿到 3 是包装对象的属性，而 "abc".x = 1 写入的是刚创建就被丢弃的临时对象——下一行再读 .x 又是一个全新的包装对象，自然 undefined。

\`\`\`js
"abc".length;   // 3：等价于 new String("abc").length，用完销毁
"abc".x = 1;    // 静默失败：写进临时对象，立即销毁（严格模式报错）
"abc".x;        // undefined：新建了一个包装对象，没有 x
// 显式装箱（永远不要这么写）
const s = new String("abc");
typeof s;       // "object"，不是 "string"
s === "abc";    // false：对象与原始值是两个世界
\`\`\`

实际项目中的真实事故：某表单校验库用 typeof value === "string" 判断输入类型，上游某处用了 new String() 构造的值，校验全部绕过，最后靠 value instanceof String 兜底 + 上游去 new 化才收敛。这也是为什么 lint 规则 no-new-wrappers 必须开。

踩坑：typeof new String() 是 "object"，与 "string" 原始值的类型判断结果不同，混用会让类型分支失效；Boolean 包装对象永远 truthy——if (new Boolean(false)) 会进分支，是经典 bug 温床；Symbol/BigInt 设计上禁止 new（防止同样陷阱），但可用 Object(sym) 显式装箱（几乎没用途）；装箱拆箱有性能开销，热路径上别对原始值做属性读写链。`,
    keyPoints: ["读属性时隐式装箱用完即毁", "包装对象 ≠ 原始值（typeof/=== 都不同）", "new Boolean(false) 是 truthy", "no-new-wrappers 规则必开"],
    followUps: ["为什么 if (new Boolean(false)) 会进分支？", "V8 对包装对象有什么优化？"],
    favorited: false,
  },
  {
    id: "fe-35",
    nodeId: "fe-js-types",
    question: "如何准确判断 NaN？为什么 isNaN 不靠谱？",
    bigTech: false,
    answer: `NaN 的设计语义是「无效数值运算的结果占位符」，IEEE 754 规定它与任何值（含自身）比较都为 false——这样 NaN 参与比较运算不会误判相等。全局 isNaN 的坑在于它先对参数做 ToNumber 强制转换再判断："abc" 转数字得到 NaN，于是 isNaN("abc") 返回 true——它回答的其实是"这个值转不成数字吗"，而不是"这个值是 NaN 吗"。ES6 的 Number.isNaN 不做转换，严格检查值本身就是 NaN。

\`\`\`js
isNaN("abc");        // true：ToNumber("abc")=NaN，误判！
isNaN("123");        // false：ToNumber("123")=123
Number.isNaN("abc"); // false：不做转换，"abc"不是 NaN
Number.isNaN(NaN);   // true：严格判断
// 利用 NaN≠NaN 的零依赖判断
const isReallyNaN = (v) => v !== v;
// 集合查找的差异
[NaN].indexOf(NaN);   // -1：indexOf 用严格相等
[NaN].includes(NaN);  // true：includes 用 SameValueZero
\`\`\`

在某数据看板项目中，接口偶发返回 null，前端计算 null * 1.2 得 0（null 转数字为 0），而 undefined * 1.2 得 NaN，两种"空数据"渲染出 0 和 NaN% 两种结果。统一用 Number.isNaN + 空值归一化后修复。

踩坑：NaN 会沿运算链传染（NaN + 1 = NaN），链式计算中一步出错结果全毁，要在入口处用 Number.isFinite 守门；typeof NaN === "number" 容易让 typeof 检查放行，记得先 Number.isNaN 排除；Object.is(NaN, NaN) 返回 true，是 === 之外唯一能判等 NaN 的比较。`,
    keyPoints: ["isNaN 回答的是'转不成数字吗'", "Number.isNaN 严格不转换", "v!==v 与 Object.is 都能判 NaN", "NaN 沿运算链传染"],
    followUps: ["SameValueZero 和严格相等的差异？", "Number.isFinite 和 isFinite 的区别？"],
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
    answer: `词法作用域的判定时机是「写代码时」：函数能访问哪些变量，在函数定义的位置就已固定，引擎据此构建作用域链——与函数在哪里被调用无关。动态作用域则相反，变量的解析沿调用栈向上找（bash、早期 Lisp 是这种）。JS 选择了词法作用域，这让代码可静态分析（Tree Shaking、lint 都受益）；唯一的"动态"例外是 this——它在调用时按绑定规则确定，但 this 不是变量，不走作用域链，所以说 JS 是词法作用域语言依然成立。

\`\`\`js
let a = 1;
function foo() { console.log(a); } // 定义在全局，词法上 a 绑定全局
function bar() { let a = 2; foo(); }
bar(); // 1：foo 的作用域链在定义时定型，与调用处 bar 的 a=2 无关
// this 是调用时确定（动态）
const obj = { n: 1, get() { return this.n; } };
obj.get();            // 1：隐式绑定 this=obj
const fn = obj.get;
fn();                 // undefined：独立调用，this 走默认绑定
\`\`\`

某团队封装通用事件工具时，把对象方法 extract 出来当回调（const onClick = btn.handle; el.addEventListener("click", onClick)），this 全部丢失指向 undefined——本质是混淆了词法变量（定义时）与 this（调用时）两套解析时机，用箭头函数或 bind 固定后修复。

踩坑：闭包捕获的是变量引用而非快照，var 循环里所有回调共享同一 i，let 每轮创建新词法环境副本；eval("var x=1") 和 with 能在运行时改作用域链，破坏静态优化，严格模式已禁用；箭头函数无自己的 this，继承外层词法环境的 this 且不可被 call/apply 改变。`,
    keyPoints: ["作用域链在定义时定型", "this 调用时绑定但不走作用域链", "闭包捕获引用 let 每轮新副本", "eval/with 破坏静态分析"],
    followUps: ["V8 如何利用词法作用域做变量访问优化？", "箭头函数的 this 为什么不能被 bind 改变？"],
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
    answer: `模块模式的机制是「利用闭包让变量逃出作用域生命周期」：IIFE 执行完毕其作用域本应销毁，但返回的公共方法持有对内层变量的引用，变量便以"只有这些方法能触达"的方式存活——这是 JS 在 ES6 之前实现信息隐藏的唯一手段。理解它是理解闭包、乃至理解 ESM 模块作用域设计的钥匙。

\`\`\`js
// 经典模块模式：单例 + 私有状态
const Counter = (function () {
  let count = 0;              // 私有：外部无法访问
  const inc = () => ++count;  // 私有实现细节
  return {                    // 公共接口（揭示模块模式）
    increment: inc,
    get: () => count,
  };
})();
Counter.increment(); Counter.get(); // 1，但 Counter.count 是 undefined
// 现代等价物：class 私有字段（语法级真私有）
class ModernCounter {
  #count = 0; // 外部/子类/序列化都不可见
  increment() { return ++this.#count; }
}
\`\`\`

在维护某老项目全局 store 时，模块模式仍活跃：window.__APP_CONFIG__ 下挂着一个 IIFE 返回的对象，私有缓存了鉴权 token，外部只能通过 getToken() 读取——十多年前的代码依然安全运行，说明模式的生命力。

踩坑：模块模式产出单例，需要多实例时要退化为"工厂函数 + 闭包"；闭包私有有内存成本（作用域链常驻），# 私有字段是语法级实现无此开销且 DevTools 也不可读；闭包私有在序列化（JSON.stringify）时同样会暴露给返回的公共方法，别存真机密——前端没有真正的安全存储，token 类敏感信息应放 httpOnly cookie 而非任何 JS 变量。`,
    keyPoints: ["闭包延长作用域生命周期实现私有", "单例/工厂两种产出形态", "# 私有字段语法级真私有", "前端变量不存真机密"],
    followUps: ["# 私有字段和 WeakMap 模拟私有的性能差异？", "ESM 模块作用域如何替代 IIFE？"],
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
    answer: `Tree Shaking 的可行性建立在 ESM 的「静态绑定」上：import/export 在源码层面就是字面量声明，打包器在编译期（不执行任何代码）就能构建完整的依赖图，标记哪些导出被引用、哪些是死代码，最后由压缩器（Terser/esbuild）物理删除。CJS 的 require 是普通函数调用——require(condition ? "a" : "b")、require("./" + name) 都合法，模块边界要到运行时才能确定，静态分析无从下手。

\`\`\`js
// math.js (ESM)：静态结构，sub 可被安全剔除
export function add(a, b) { return a + b; }
export function sub(a, b) { return a - b; }
// main.js
import { add } from "./math.js"; // 打包后只有 add
// package.json：声明包无副作用，摇树才能激进
{ "sideEffects": false }
// 有副作用的文件列入白名单保护
{ "sideEffects": ["./src/polyfills.js", "*.css"] }
\`\`\`

在某组件库发包优化中，产物从 CJS 单文件改为 ESM 按文件分割 + sideEffects:false 后，下游项目按需引入的实际加载体积从 180KB 降到 34KB。注意摇树是"打包器 + 压缩器"接力：Rollup/webpack 标记 unused export，真正删除靠 Terser 的 dead code elimination。

踩坑：顶层副作用（import "./polyfill"、修改原型链、注册全局）会被误摇，必须 sideEffects 白名单保护；Babel 把 ESM 编译成 CJS（preset-env 配 modules:"commonjs"）会让摇树失效，TS/Babel 配置要保留 ESM；re-export 星号（export * from）会阻碍分析，具名 re-export 更友好；class 的方法挂载在 prototype 上，静态分析无法证明单个方法未被使用，所以 class 通常整体保留——这是 lodash 按方法分包而非单 class 的原因。`,
    keyPoints: ["ESM 静态绑定编译期建依赖图", "CJS require 运行时才能确定边界", "sideEffects 白名单保护副作用文件", "标记靠打包器删除靠压缩器"],
    followUps: ["为什么 Babel 转 CJS 会让 Tree Shaking 失效？", "barrel 文件（index re-export）对摇树的影响？"],
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
    answer: `key 的本质是 React Reconciliation 的「元素身份标识」：diff 同层列表时，React 按 key 建立新旧元素的映射——key 相同则复用 Fiber 节点与 DOM（state、DOM 内部状态如 input 值全部保留），key 不同则旧节点卸载、新节点挂载。用 index 做 key 时，身份被绑死在"位置"而非"数据"上：删除头部后，原第 2 项的 index 从 1 变 0，React 认为"key=0 的元素还在"，于是把它的 state 安到了新数据头上——状态错位就是这么来的。

\`\`\`tsx
// 差：index 做 key，增删/排序时状态串位
{items.map((item, i) => <Item key={i} data={item} />)}
// 删除 items[0]：原 items[1] 变 key=0，复用了 items[0] 的 state
// 好：业务唯一 id，身份跟随数据
{items.map((item) => <Item key={item.id} data={item} />)}
// 高级技巧：用 key 强制重置组件（表单切换编辑对象时）
<Editor key={currentDocId} initialValue={doc.content} />
\`\`\`

在字节某直播间，礼物横幅队列用 index 做 key，移除已播完的礼物后，下一个礼物的入场动画直接继承上一项的动画状态，出现"礼物瞬移"——改 item.id 后修复。另一个正面用法：后台编辑页切换编辑对象时，给表单组件换 key 强制重建，比手动 reset 各字段干净得多。

踩坑：key 只需兄弟间唯一，不要求全局唯一；key 变化 = 卸载 + 挂载（useEffect 清理重跑、input 失焦），别在渲染中生成随机 key（Math.random()），那等于每帧重建整棵树；纯静态且永不增删排序的列表用 index 无 bug，但仍不推荐——需求总会变。`,
    keyPoints: ["key 标识身份驱动复用/重建决策", "index 把身份绑在位置上导致状态错位", "换 key 可强制重置组件", "随机 key = 每帧重建"],
    followUps: ["key 变化会触发哪些生命周期/effect？", "React 为什么不警告 index 做 key？"],
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
    answer: `Reconciliation 是 React 用 O(n) 近似 O(n³) 的启发式 diff：传统树 diff 要跨层两两比较（约 10 亿次操作/1000 节点），React 用三条假设砍到线性——① 只在同层兄弟间比较，不跨层追踪节点移动；② 元素 type 不同（div→span 或 A→B）直接销毁整棵子树重建，连同内部 state 一起丢弃；③ 用 key 标识同层列表项身份，key 相同则复用 Fiber 节点只更新 props。diff 结果是一串 mutation 标记，commit 阶段一次性应用到真实 DOM。

\`\`\`jsx
// 假设②：type 变化销毁重建，state 不保留
{cond ? <Counter /> : <Timer />}   // 切换即卸载+挂载
// 想保留 state 的两种方案：同 type 换 props，或 key 不变提升 state
{cond ? <Panel type="a" /> : <Panel type="b" />}  // 复用，仅 props 变
// 假设③：key 让列表重排变"移动"而非"重建"
{todos.map(t => <TodoItem key={t.id} todo={t} />)}
\`\`\`

实际案例：字节一个 CRM 列表页，编辑弹窗组件挂在每行内，表格按不同列排序后所有弹窗内部状态（草稿、校验态）全部错乱——根因是 key 用了 index，排序后 index 与数据的对应关系变了，React 按"key 相同=同一实例"复用，把 A 行的弹窗状态安到了 B 行数据上。改用业务主键 id 做 key 后解决；另一个反例是筛选 Tab 用 <ListA/>/<ListB/> 两个组件切换，每次切 Tab 列表滚动位置和筛选输入全丢，合并成同 type 组件 + props 区分后状态自然保留。

踩坑与 tradeoff：React 放弃跨层 diff 是有意取舍——真实产品里跨层移动极罕见，为它做全树追踪得不偿失，但意味着 <div><A/></div> 改成 <section><A/></section> 会重建 A；key 要稳定唯一且只在兄弟间比较，全局唯一不等于兄弟内唯一性的保证可省；Fiber 架构让 diff 过程可中断（时间切片），但"同层/type/key"三条假设从未变过，面试别把它们和并发渲染混为一谈。`,
    keyPoints: ["三假设：同层比较/type 变重建/key 定身份", "O(n³)→O(n) 的启发式取舍", "key=index 排序后状态串行是真实事故", "Fiber 让 diff 可中断但假设不变"],
    followUps: ["为什么 React 不做跨层 diff？代价是什么？", "Fiber 双缓冲树（current/workInProgress）如何配合 diff？"],
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
    answer: `lane 是 React 18 并发渲染的优先级模型：用 31 位二进制位（bitmask）表示更新优先级，位越靠左优先级越高。它取代旧的 expirationTime（截止时间戳）模型，解决了两个硬伤——① expirationTime 是单值，一次只能表达一个优先级，而 lane 是集合，可以用按位或同时持有多个优先级（一批更新可包含 TransitionLane | DefaultLane）；② 位运算求"当前最高优先级 lane"（getHighestPriorityLane）、判断包含关系、批量清除都是 O(1) 机器指令，调度循环极快。同一 Fiber 的 updateQueue 上可挂多个不同 lane 的更新，渲染时只处理当前调度到的 lane，其余留给下一轮。

\`\`\`js
// 简化后的 lane 布局（位越小优先级越高）
const SyncLane            = 0b0000000000000000000000000000001; // 离散事件：click
const InputContinuousLane = 0b0000000000000000000000000000100; // 连续输入：drag
const DefaultLane         = 0b0000000000000000000000000100000; // 普通 setState
const TransitionLane1     = 0b0000000000000000000001000000000; // useTransition
const IdleLane            = 0b0100000000000000000000000000000; // 空闲
// 按位或合并、按位与判断，调度器取最左的 1 对应 lane 执行
\`\`\`

实际案例：蚂蚁一个数据看板页，用户输入筛选词（InputContinuous）时触发大表格重算，输入卡顿明显。改造用 useTransition 把表格过滤包成 TransitionLane 更新后，输入框（高 lane）可随时打断表格渲染（低 lane），打断时丢弃 workInProgress 树中间结果、从上次提交态重做，输入保持 60fps。这正是 lane 模型的价值：没有它，"输入更新"和"表格更新"只能排队二选一。

踩坑与 tradeoff：lane 数量是有限的（31 个），TransitionLane 有 16 个槽位，大量并发 transition 会复用槽位导致不同 transition 被合并调度；被高优先级打断的低优先级更新不是"暂停续跑"而是"丢弃重做"，所以渲染函数必须纯——副作用要放 commit 阶段或 effect，否则打断重放会产生重复请求；业务代码不直接碰 lane，用 startTransition/useDeferredValue 间接打标，面试说出"API 到 lane 的映射"比背位定义更加分。`,
    keyPoints: ["lane=31 位 bitmask 优先级集合", "位运算 O(1) 求最高优先级", "高 lane 打断低 lane：丢弃重做非续跑", "useTransition 是业务侧打 lane 的入口"],
    followUps: ["lane 相对 expirationTime 解决了哪两个问题？", "Transition 槽位耗尽会发生什么？"],
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
    answer: `三者的本质区别在于「产出一个值」还是「执行一个副作用」，以及依赖如何收集。computed 是带缓存的惰性求值：内部用脏标记（dirty）实现——首次访问执行 getter 并缓存结果，之后依赖没变直接返回缓存，依赖变更时只是把 dirty 置 true，下次访问才重算；所以它必须同步、纯函数、有返回值。watch 是显式订阅某个/某些响应式源，值变化后调度执行回调，可拿 newVal/oldVal，可异步、可做请求等副作用，默认惰性（源变了才执行）。watchEffect 则是立即执行一次函数体，执行期间自动收集访问到的所有响应式依赖，任一依赖变化就重新执行——适合「这个函数里用到的响应式值都该触发它」的场景，省得手动列依赖。

\`\`\`js
// computed：派生状态，依赖不变零重算成本
const total = computed(() => cart.value.reduce((s, i) => s + i.price * i.n, 0));
// watch：跨页码/关键词变化时发请求，需要 oldVal 判断要不要重置页码
watch(keyword, async (n, o) => { page.value = 1; list.value = await search(n); });
// watchEffect：自动收集 count+theme，不用手动列依赖数组
watchEffect(() => { document.title = \`\${count.value} - \${theme.value}\`; });
\`\`\`

实际案例：有赞一个商品筛选页，最初用 watchEffect 发搜索请求，结果函数体里顺手读了 pageSize、sortBy、keyword 三个 ref，任何筛选条件变化都触发请求——包括用户只是展开了一个用 ref 控制的面板（面板状态也在函数体里被读到），造成接口风暴。改成 watch 显式侦听 [keyword, sortBy] 后请求量降 70%。另一个常见误用是在 computed 里发请求"顺便存结果"，由于 computed 可能被多次重算且语义上是纯函数，导致重复请求和不可预期的缓存。

踩坑与 tradeoff：watch 默认侦听 ref 的 .value 替换，侦听 reactive 对象内部属性要传 getter（() => obj.a）或 deep: true，deep 遍历大对象有性能代价；watchEffect 的依赖是"运行时收集"，条件分支里没执行到的属性不会被追踪——分支切换后依赖集会变化，调试时容易困惑；flush 选项控制回调时机（pre 组件更新前/post 更新后），要操作更新后 DOM 用 flush: "post" 或 nextTick。`,
    keyPoints: ["computed=缓存派生值，watch=显式副作用，watchEffect=自动依赖", "computed 脏标记惰性重算", "watchEffect 依赖运行时收集易过度触发", "deep/flush 选项的成本与时机"],
    followUps: ["computed 的脏标记机制怎么实现缓存？", "watch 的 flush: pre/post/sync 分别在什么时机执行？"],
    favorited: false,
  },
  {
    id: "fe-118",
    nodeId: "vue-core",
    question: "Vue 的生命周期有哪些？Composition API 怎么写？",
    bigTech: false,
    answer: `Vue3 生命周期对应组件实例的四个阶段：创建（setup 本身即 created 时机，没有单独钩子）、挂载（onBeforeMount 模板编译完成未插 DOM → onMounted DOM 已插入可操作）、更新（onBeforeUpdate 响应式数据变了 DOM 未更新 → onUpdated DOM 已同步）、卸载（onBeforeUnmount 实例还在 → onUnmounted DOM 移除实例销毁）。另有 keep-alive 专属的 onActivated/onDeactivated 和错误处理的 onErrorCaptured。父子组件的顺序是面试加分点：挂载时父 beforeMount → 子 mounted → 父 mounted（子先挂完父才算挂完）；卸载时父 beforeUnmount → 子 unmounted → 父 unmounted。

\`\`\`vue
<script setup>
import { onMounted, onUnmounted, onErrorCaptured } from "vue";
let timer; let ob;
onMounted(() => {
  timer = setInterval(poll, 5000);                       // 定时轮询
  ob = new ResizeObserver(onResize); ob.observe(elRef);  // 监听尺寸
});
onUnmounted(() => { clearInterval(timer); ob.disconnect(); }); // 对称清理
onErrorCaptured((err, instance, info) => { report(err); return false; }); // 阻止冒泡
</script>
\`\`\`

实际案例：美团一个 H5 活动页在线上偶发白屏，排查发现是某卡片组件 onMounted 里同步初始化了一个重 Canvas 图表（约 300ms），而页面有 12 个同类卡片——父组件 onMounted 要等全部子组件 mounted 才触发，导致首屏可交互时间（TTI）被拉长到 4s+。优化方案是把图表初始化包进 requestIdleCallback + IntersectionObserver 懒加载，onMounted 里只做轻量 DOM 测量，TTI 降到 1.8s。另一个高频事故源是 onUnmounted 忘记清理：WebSocket 订阅、EventBus 监听、setInterval 不清理，在路由频繁切换的 SPA 里内存线性上涨，还出现"已离开页面还在收到推送并 setState"的警告。

踩坑与 tradeoff：onUpdated 里直接改响应式数据会再次触发更新，形成死循环（Vue 会警告 "Maximum recursive updates"），要改必须加条件判断收敛；onMounted 保证本组件 DOM 就绪但不保证异步子组件（defineAsyncComponent）已渲染，测量尺寸要配合 nextTick 或 ResizeObserver；SSR 场景下 onMounted/onUpdated 等客户端钩子不在服务端执行，把浏览器 API 调用写在这些钩子里天然同构安全，写在 setup 顶层则会 SSR 报错。`,
    keyPoints: ["四阶段八钩子+keep-alive 双钩子", "子 mounted 先于父 mounted", "onUnmounted 不对称清理=内存泄漏", "SSR 只执行 setup，客户端钩子天然同构安全"],
    followUps: ["父子组件生命周期的完整执行顺序？", "为什么 onUpdated 里改状态会报 recursive updates？"],
    favorited: false,
  },
  {
    id: "fe-119",
    nodeId: "vue-core",
    question: "v-for 的 key 有什么作用？和 React key 区别？",
    bigTech: false,
    answer: `key 是 Vue diff 算法识别 vnode 身份的唯一依据：sameVnode 判定先看 key 再看 tag，key 相同则 patch 复用旧 DOM（保留组件实例、表单内部状态、焦点），key 不同则卸载重建。没给 key 时 Vue3 对 v-for 走"就地复用"策略——按位置一一 patch，等价于 key=index。Vue3 的 keyed diff 流程是：先从头尾双端同步（i 前扫、e 后扫，处理头尾未变部分），再处理纯新增/纯删除，剩余乱序段建 key→index 映射表，对旧序列求新位置序列的最长递增子序列（LIS），LIS 上的节点保持不动、其余节点做移动——LIS 保证 DOM 移动次数最少。

\`\`\`html
<!-- 反例：index 做 key，头部插入一条后所有行 key 与数据错位 -->
<li v-for="(u, i) in users" :key="i"><input v-model="u.remark" /></li>
<!-- 正例：业务主键做 key，增删排序都安全 -->
<li v-for="u in users" :key="u.id"><input v-model="u.remark" /></li>
<!-- key 也可用于强制重渲染：路由参数变化时重建组件，重置内部状态 -->
<UserCard :key="$route.params.id" />
\`\`\`

实际案例：滴滴一个司机端订单列表，行内有"已读/未读"本地勾选态（未持久化），用 index 做 key 时新订单推到数组头部，用户之前勾的第 1 行状态被复用到了新订单上——因为 key=0 的旧节点被 patch 成了新数据，而勾选态存在组件实例里跟着 DOM 走了。改 :key="order.id" 后解决。另一个正面用法是"key 重置换组件"：详情页从 /user/1 跳到 /user/2 时组件复用导致 onMounted 不再执行、旧数据残留，给组件加 :key="$route.fullPath" 强制重建，逻辑比 watch 路由参数干净得多。

踩坑与 tradeoff：key 只需在兄弟节点间唯一，不同列表可复用相同 key 值；key 不要用随机数或 Date.now()——每次渲染 key 都变等于全量重建，比不加 key 还慢；v-if 和 v-for 同元素时 Vue3 中 v-if 优先级更高且访问不到 v-for 的 item（编译期报错），要包一层 template；Vue 的 key 语义和 React 一致，但 Vue 模板编译器会对静态 v-for 做优化（静态提升），React 则完全依赖运行时 diff，这是两者"同语义不同实现"的典型考点。`,
    keyPoints: ["sameVnode 先比 key 再比 tag", "Vue3 双端同步+LIS 最少移动", "key=index 在增删/排序时状态错位", "key 置换可强制重建组件"],
    followUps: ["Vue3  keyed diff 的完整五步流程？", "为什么 LIS 能保证移动次数最少？"],
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
    answer: `Teleport 解决的核心矛盾是「逻辑上属于当前组件，视觉上必须脱离当前组件的 DOM 上下文」。渲染时 vnode 被 patch 到 to 选择器指定的目标节点（通常是 body 末尾），但组件树层级不变——props 传递、emit 冒泡、provide/inject、响应式更新全部按原逻辑位置工作，DOM 位置和逻辑位置解耦。典型动机是突破 CSS 层叠上下文：父链上任何 overflow: hidden、transform、filter、will-change、z-index 隔离都会把"局部弹窗"裁剪或压住，Teleport 到 body 后弹窗直接参与全局层叠。

\`\`\`vue
<!-- 嵌套在 overflow:hidden 卡片里的弹窗，传送到 body 摆脱裁剪 -->
<Teleport to="body">
  <BaseModal v-model:open="show" :z-index="1000">
    <OrderDetail :order="order" @close="show = false" />
  </BaseModal>
</Teleport>
<!-- disabled 动态切换：大屏传送到侧栏容器，小屏就地渲染 -->
<Teleport :to="isDesktop ? '#sidebar' : 'body'" :disabled="false">
  <FilterPanel />
</Teleport>
<!-- defer（3.5+）：等目标元素在后续渲染中出现再传送 -->
<Teleport defer to="#async-target">...</Teleport>
\`\`\`

实际案例：小红书一个编辑器项目，气泡菜单放在编辑器容器内实现，容器为了做滚动设了 overflow: auto，结果气泡菜单一弹出就被容器边界裁掉一半，用各种 z-index 和 position 都救不回来（层叠上下文被 transform 锁死）。改 Teleport 到 body、用 floating-ui 计算绝对坐标后彻底解决。另一个用法是多实例共存：页面多个组件都 Teleport 到 #toast-root，按挂载顺序天然形成通知堆叠，不用额外搞全局通知 store 管理 DOM。

踩坑与 tradeoff：目标节点必须在挂载时已存在于 DOM（否则警告并渲染失败），3.5 之前常见做法是把 #modal-root 静态写在 index.html，或用 defer 修饰符等异步目标出现；scoped 样式按组件逻辑位置编译，Teleport 出去的节点 class 哈希不变所以样式仍生效，但"在 body 上用全局类名覆盖"的思路会失效，得用 :deep()；事件冒泡沿组件树（逻辑树）而非 DOM 树走，在 Teleport 内容里点按钮，原生事件监听器挂在父组件容器上是收不到的——这和直觉相反，调试事件委托 bug 时极易踩中。`,
    keyPoints: ["DOM 位置与逻辑位置解耦", "突破层叠上下文/overflow 裁剪", "provide/inject/emit 按逻辑树工作", "事件沿组件树冒泡而非 DOM 树"],
    followUps: ["Teleport 和 React Portal 在事件冒泡上有什么差异？", "SSR 场景下 Teleport 如何处理？"],
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
    answer: `Vue3 把"模板是静态可分析的"这个优势吃干榨净，编译期把运行时 diff 的工作前置掉，核心是四件套。① 静态提升（hoistStatic）：纯静态节点/属性被提到 render 函数外只创建一次，后续渲染直接复用引用，diff 时引用相同直接跳过。② 补丁标记（PatchFlag）：编译器给每个动态节点打上位标记（TEXT=1/CLASS=2/STYLE=4/PROPS=8…）和 dynamicProps 数组，patch 时按标记只比对变化的绑定，不用全量 props 浅比较。③ 块树（Block Tree）：每个 Block 节点收集后代所有动态节点到 dynamicChildren 扁平数组，diff 时跳过整棵静态子树直接遍历动态数组，把 diff 复杂度从"树规模"降到"动态节点数量"。④ 缓存事件处理（cacheHandler）：@click 内联函数被缓存，避免每次渲染生成新函数导致子组件误判 props 变化重渲染。

\`\`\`js
// <div><p>静态</p><p :id="pid">{{ msg }}</p></div> 编译结果（示意）
const _hoisted_1 = /*#__PURE__*/createStaticVNode("<p>静态</p>", 1); // ①提升
return (openBlock(), createBlock("div", null, [                    // ③Block
  _hoisted_1,                                                       // 静态跳过
  createVNode("p", { id: _ctx.pid }, toDisplayString(_ctx.msg),
    9 /* TEXT, PROPS */, ["id"]),                                   // ②PatchFlag
]))
\`\`\`

实际案例：携程一个大表单页（300+ 表单项）从 Vue2 迁 Vue3，仅框架升级不改业务代码，首屏渲染从 900ms 降到 380ms、输入响应从 120ms 降到 40ms——收益大头来自块树：表单里 95% 节点是静态 label/布局，Vue2 全树 diff 每次都要遍历，Vue3 只遍历几十个动态绑定。另一个收益点是 v-memo（3.2+）手动跳过子树：消息列表给每项加 v-memo="[msg.id, msg.read]"，长列表滚动时未读状态没变的消息整项跳过 patch。

踩坑与 tradeoff：优化建立在"结构稳定"假设上——v-if/v-for 会创建新的 Block 边界，模板里大量嵌套条件会让块树碎片化、退化接近全树 diff，此时应考虑拆分组件；手写 h()/JSX 失去编译期分析，PatchFlag 和静态提升全没了（JSX 插件只能补一部分），性能敏感页面优先模板；静态提升会常驻内存（hoisted 节点永不释放），页面有成百上千个大静态块时内存换 CPU 的账要算一下；v-once 是终极静态标记，用了之后该子树永远跳过 diff，数据变了也不更新，别误用在"只是不常变"的内容上。`,
    keyPoints: ["静态提升+PatchFlag+Block Tree+事件缓存", "diff 复杂度降到动态节点数量", "v-if/v-for 创建 Block 边界", "手写 h/JSX 丢失编译优化"],
    followUps: ["PatchFlag 的位运算如何组合多个标记？", "v-memo 和 v-once 的区别与适用场景？"],
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
    answer: `Source Map 是"压缩产物 → 原始源码"的映射文件：本质是一个 JSON（version/sources/names/mappings），mappings 字段用 VLQ 编码的半增量序列记录"生成文件第 n 行第 m 列 ↔ 源文件第 x 行第 y 列"，浏览器 DevTools 和错误监控凭它把混淆后的行列号还原成源码位置。没有它，线上报错栈指向 bundle.min.js:1:87342 这种位置等于没法定位。工程上的矛盾是：调试需要它，公开它等于把源码拱手送人，所以生产方案的核心是"生成但不随包发布"。

\`\`\`js
// Vite：生成 .map 但产物末尾不写 //# sourceMappingURL 注释
export default { build: { sourcemap: "hidden" } };
// Webpack 等价
module.exports = { devtool: "hidden-source-map" };
// CI 里构建后上传到 Sentry 再删除，不让 .map 进 CDN
// sentry-cli sourcemaps upload ./dist && rm -rf ./dist/**/*.map
// 折中方案：nosources-source-map——映射可用但内嵌的源码内容不发布
\`\`\`

实际案例：拼多多某个促销页曾因 CI 配置失误把 sourcemap: true（非 hidden）带上生产，.map 文件和 bundle 一起推了 CDN，安全团队扫描发现核心业务逻辑（含未上线的活动规则）可被任何人完整还原，紧急清缓存换密钥。后续固化的流水线是：构建产 hidden map → sentry-cli 上传（带 release 版本号绑定）→ 上传成功后从产物目录删除 map → 只把无 map 的 dist 推 CDN。Sentry 侧按 release + dist 匹配 map，错误栈自动还原出 TS 源码行列，线上问题平均定位时间从 2 小时降到 10 分钟。

踩坑与 tradeoff：hidden-source-map 的"安全"只是不让浏览器自动加载，map 文件如果还放在可访问路径上照样泄露，必须构建后移出发布目录；eval-cheap-module-source-map 系列只适合开发（eval 包代码 + 只到模块级映射），生产禁用；Terser 压缩 + Babel 转译 + TS 编译是多级转换，需要每级都生成并链式合并 map（inputSourceMap），断链就只能还原到中间产物；CSS 的 map 要单独开（css.devSourcemap / cssSourceMap），漏了样式调试照样瞎；第三方 SDK 不愿公开源码时可只上传自家代码的 map，外部库栈帧显示 native/匿名即可，别为了完整栈把别人的源码也暴露了。`,
    keyPoints: ["mappings=VLQ 编码的行列映射", "生产 hidden：生成不引用+CI 上传后删除", "多级转换要链式合并 map", "map 留在 CDN 等于源码泄露"],
    followUps: ["VLQ 编码为什么能压缩 mappings 体积？", "多级构建链的 source map 如何合并？"],
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
    answer: `覆盖率衡量"测试执行了代码的多大范围"，四个标准指标：Statements（执行到的语句占比）、Branches（if/else、三元、switch、&&/|| 每条路径都走到的占比，最严格也最有价值）、Functions（被调用过的函数占比）、Lines（执行到的行占比，和语句接近但按物理行算）。工具原理是插桩（babel-plugin-istanbul）或 V8 内置 coverage 统计执行计数，跑完汇总出报告。业界通行水位是核心模块 80%+，但数字只是手段——它回答"哪些代码没测"，回答不了"测了的代码对不对"（断言质量是另一回事）。

\`\`\`ts
// vitest.config.ts：v8 provider + 阈值门禁，低于阈值 CI 直接红
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/hooks/**"],
      exclude: ["**/*.d.ts", "src/types/**"],
      reporter: ["text", "lcov"],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
\`\`\`

实际案例：蚂蚁一个账单中台把分支覆盖率从 45% 拉到 80% 的过程中，最大收益不是数字本身，而是补分支时挖出了 3 个存量 bug——其中一个是金额舍入分支从未被测到（amount % 1 === 0 走整数路径），线上小数金额四舍五入规则和执行路径不符，测试补齐后直接拦下了一次资损风险。反过来也有教训：团队曾一刀切要求全仓 90%，结果前端给纯展示组件写了大量"渲染一下就算过"的僵尸测试，覆盖率达标但重构一碰就碎，维护成本暴涨，最后改成"lib/utils/hooks 强制 85%+，页面组件只看关键交互"。

踩坑与 tradeoff：100% 行覆盖仍可能测不出组合逻辑 bug（a && b 只测 a=true 的行，条件恒真路径全过）——所以分支覆盖比行覆盖更接近真实质量；覆盖率驱动容易诱发"为覆盖而测"：无断言的 render 快照、硬调私有方法凑数，这些测试在重构时全变噪音；阈值要防回退而非一步登天（先把当前水位设成基线，每次 PR 只许升不许降）；变异测试（Stryker，往代码里注入 bug 看测试能否抓到）是更硬核的质量度量，但成本高，适合支付/鉴权等命脉模块而非全仓。`,
    keyPoints: ["四指标中 Branches 最接近真实质量", "覆盖率回答测没测，不回答对不对", "CI 阈值防回退：基线起步只升不降", "变异测试是断言质量的终极度量"],
    followUps: ["为什么 100% 行覆盖仍可能漏 bug？", "变异测试（Mutation Testing）原理是什么？"],
    favorited: false,
  },
  {
    id: "fe-153",
    nodeId: "testing",
    question: "视觉回归测试如何做？",
    bigTech: false,
    answer: `视觉回归测试（VRT）通过"像素级截图 diff"捕获功能测试抓不到的 UI 意外变更：按钮挪了 2px、字体回退、暗色模式漏配对，断言 DOM 结构全绿但用户看到的就是坏了。标准流程：首次运行生成基线截图（baseline）→ 后续运行同场景再截图 → 与基线逐像素比对 → 差异超阈值则失败，产出 diff 高亮图供人工确认是预期变更（更新基线）还是回归（修代码）。工具分两派：自建派 Playwright toHaveScreenshot（免费、CI 内跑），SaaS 派 Percy/Chromatic（云端渲染多浏览器多视口、UI 审阅工作流、按 DOM 快照 diff 抗噪更强）。

\`\`\`ts
// Playwright：冻结一切不稳定因素是成败关键
test("结算页视觉", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-07-25T10:00:00")); // 冻结时间
  await page.route("**/api/cart", r => r.fulfill({ json: cartFixture })); // 固定数据
  await page.goto("/checkout");
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  await expect(page).toHaveScreenshot("checkout.png", { maxDiffPixelRatio: 0.01 });
});
\`\`\`

实际案例：有赞组件库（Vant）级项目把 VRT 接进 PR 检查：每个组件 story 跑 Percy，某次 PR 改了一个全局 tokens 文件里的圆角变量，Percy 一次报出 47 个组件截图差异，人工在网页端逐张 approve——如果没有 VRT，这类"改一个变量影响半个组件库"的变更只能靠 review 肉眼脑补。另一个教训是早期自研方案没处理字体加载：截图时 webfont 偶发未加载完成，文字宽度差几个像素，CI 误报率 30%+，团队开始直接忽略 VRT 结果——信任崩塌后花了一个月治理（document.fonts.ready + 统一 Docker 镜像锁字体版本）才恢复。

踩坑与 tradeoff：误报是 VRT 的天敌，来源包括字体渲染抗锯齿差异（macOS vs Linux 必须统一 CI 环境，基线也在同一镜像生成）、动画/视频/GIF（注入 CSS 冻结）、动态内容（时间、随机数、A/B 分组全要 mock）、懒加载图片（等加载完或用占位色块遮罩 mask 掉）；阈值 maxDiffPixelRatio 设 0 太敏感、设太高漏真回归，经验值 0.005–0.02 并按页面分级；VRT 跑全站成本高，策略是组件库全量 + 页面级只保核心链路，别指望它替代功能测试——两者是正交的防线。`,
    keyPoints: ["像素 diff 抓 DOM 断言抓不到的回归", "冻结时间/动画/字体/数据四要素", "误报率失控=团队不再信任 VRT", "组件库全量+页面核心链路的分层策略"],
    followUps: ["Percy 的 DOM 快照 diff 为什么比纯像素 diff 抗噪？", "基线截图应该用什么策略更新？"],
    favorited: false,
  },
  {
    id: "fe-154",
    nodeId: "testing",
    question: "TDD（测试驱动开发）的流程是什么？优劣？",
    bigTech: false,
    answer: `TDD 用"测试先行"倒逼设计：Red 先写一个必然失败的测试（此时实现不存在，测试必须真的跑红，防止写出恒绿的假测试）→ Green 写能让测试通过的最少代码（允许写死、允许丑，目标只是转绿）→ Refactor 在测试保护下清理重复、改善结构，每步都保持全绿。循环以分钟计。它的深层价值不是"先有测试"，而是强制你从调用者视角设计 API——先写 expect 意味着先想清楚"这个函数该长什么样、边界是什么"，可测性（纯函数、依赖注入、小接口）是设计的副产品而非额外工作。

\`\`\`ts
// Red：先定契约——空数组返回 null 而非 0，这个边界是测试先定的
test("计算购物车总价", () => {
  expect(cartTotal([{ price: 10, n: 2 }, { price: 5, n: 1 }])).toBe(25);
  expect(cartTotal([])).toBeNull(); // 业务边界在 Red 阶段被显式化
});
// Green：最小实现
const cartTotal = (items) =>
  items.length ? items.reduce((s, i) => s + i.price * i.n, 0) : null;
// Refactor：抽单价计算、加类型，测试全程保持绿
\`\`\`

实际案例：京东一个优惠规则引擎（满减/折扣/券叠加，共 40+ 组合规则）用 TDD 开发：每接一条新规则先写 3-5 个边界用例（临界金额、互斥券、叠加顺序），半年内该模块线上缺陷为零，而相邻"先写代码后补测试"的库存模块同期 7 个 P2 故障。反例同样鲜明：团队尝试对活动页 UI 组件搞 TDD，视觉布局调一次就要同步改十几个断言，三天后集体放弃——UI 的"正确性"很大程度是视觉和交互直觉，无法用断言前置定义。

踩坑与 tradeoff：TDD 的甜蜜点是输入输出明确的纯逻辑（util、状态机、规则引擎、解析器），对探索性开发（原型、动画、复杂交互编排）是负担——规格本身在漂移时，先写的测试全是沉没成本；常见反模式是"Green 阶段过度设计"，一个测试没过就开始搭抽象层，违背了"最少代码"原则；测试要断言行为而非实现细节（否则 Refactor 阶段每改一行内部实现都红一片，直接摧毁 TDD 循环）；落地策略上不必全仓 TDD，核心领域逻辑 TDD + 页面组件测试后补是多数团队的务实均衡。`,
    keyPoints: ["Red 必须真红，Green 只写最少代码", "测试先行=从调用者视角设计 API", "纯逻辑适合 TDD，探索性 UI 不适合", "断言行为而非实现细节"],
    followUps: ["TDD 的 Refactor 阶段如何保证不改变行为？", "为什么断言实现细节会摧毁 TDD 循环？"],
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
    answer: `SRI（Subresource Integrity）针对的威胁模型是：你信任的 CDN 本身不可信——CDN 被入侵、中间人劫持、运营商劫持插广告，第三方 JS 内容一旦被替换，你的页面就执行了攻击者的代码（第三方脚本和本站脚本权限完全相同，可读 cookie、可改 DOM、可发请求）。SRI 的方案是在引用处声明预期内容的密码学哈希（sha256/384/512），浏览器下载后先算哈希比对，不匹配就拒绝执行并报错，把"内容可信"从"来源可信"解耦出来。

\`\`\`html
<script src="https://cdn.example.com/react@19.1.0/prod.min.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wxFUJw8Bd"
        crossorigin="anonymous"></script>
<!-- 构建期自动生成，别手算：cat lib.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<!-- Webpack: new SubresourceIntegrityPlugin({ hashFuncNames: ["sha384"] }) -->
\`\`\`

实际案例：2018 年 BrowseAloud（无障碍插件）被注入门罗币挖矿脚本，英美政府网站集体中招——凡引用了该 CDN 脚本且没用 SRI 的站点全部沦陷，这成了 SRI 布道的经典教材。工程落地侧的正面案例：招行系 H5 对所有外联 CDN 资源强制 SRI + 本地 fallback——script onerror 里检测校验失败后切换加载自备份域名资源并上报安全告警，某次 CDN 节点内容异常（非攻击，是回源错误导致内容变化）时 SRI 拦截 + fallback 让页面零感知，监控同时抓到了这次供应商事故。

踩坑与 tradeoff：crossorigin="anonymous" 是硬性前提——跨源资源不带 CORS 头时浏览器无法读取内容算哈希，校验直接失败资源被拒，很多人以为是 SRI 配置错了其实是缺这个属性；integrity 锁死了内容版本，CDN 上"同名文件热更新"的运维习惯和 SRI 根本冲突，资源必须带版本号指纹发布、HTML 与资源同步更新，这也是构建插件自动注入的价值；SRI 只保护首次引用的静态资源，防不住"第三方脚本自己再动态加载二级脚本"（供应链纵深问题，得配合 CSP script-src 收紧）；动态拼接的广告/埋点脚本内容经常变，用不了 SRI，这类资源只能靠 CSP 域名白名单 + iframe 沙箱隔离。`,
    keyPoints: ["威胁模型：可信 CDN 内容被替换", "哈希校验失败拒绝执行", "crossorigin 是硬性前提", "锁版本发布+本地 fallback 兜底"],
    followUps: ["SRI 和 CSP 各自防什么？如何配合？", "为什么 SRI 无法保护动态二级加载的脚本？"],
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
  // ===== 新增节点题目：fe-browser-render 浏览器渲染原理深入 =====
  {
    id: "fe-313",
    nodeId: "fe-browser-render",
    question: "浏览器从拿到 HTML 到像素上屏的完整渲染流水线是怎样的？",
    bigTech: true,
    answer: `渲染流水线主干五步：Parse（HTML 字节流→字符→token→DOM 树，CSS 并行解析成 CSSOM）→ Style（DOM+CSSOM 合成 Render Tree，计算每个节点的最终样式，display:none 不进树）→ Layout/Reflow（遍历 Render Tree 计算几何：盒模型、位置、尺寸，产出 Layout Tree）→ Paint（把节点转成绘制指令列表 display list，按层栅格化为位图）→ Composite（合成线程把各图层按 transform/z-index 合成为最终帧提交 GPU 上屏）。现代浏览器（Blink）还把 Paint 前细分为 PrePaint（构建属性树 Property Trees）和 CompositeAfterPaint。

\`\`\`
HTML bytes → characters → tokens → nodes → DOM ─┐
                                                 ├→ Render Tree → Layout
CSS  bytes → CSSOM ──────────────────────────────┘      ↓
              PrePaint(属性树) → Paint(display list) → Raster → Composite → 上屏
\`\`\`

实际案例：阿里一个详情页 LCP 优化项目，用 Chrome DevTools 的 Performance 面板逐段拆解，发现 Style 阶段耗时 80ms——根因是 CSS 选择器写了 5000+ 条复杂后代选择器（.a .b .c .d），样式匹配成本爆炸；Layout 阶段又有 120ms 的"强制同步布局"尖峰，定位到代码里 offsetHeight 读取夹在 style 写入循环中。针对性优化（选择器扁平化 + 读写分离）后 LCP 从 3.2s 降到 1.9s。不懂流水线，Performance 面板里那些紫色/绿色色块就只是颜色而已。

踩坑与 tradeoff：DOM 和 CSSOM 都是增量构建的（流式解析），但 JS 会打断一切——解析到同步 script 必须暂停 DOM 构建等 JS 下载执行完（因为 JS 可能 document.write），这就是"JS 阻塞解析"；CSS 不阻塞 DOM 解析但阻塞 render 和 JS 执行（JS 可能读计算样式），所以 CSS 放 head、JS 放底部或加 defer 不是玄学而是流水线推导的必然；Layout 是整树全局计算（宽度依赖父级），所以改一个元素可能触发整树 reflow，而 transform 跳过 Layout/Paint 直接 Composite——动画性能差异的根源就在流水线阶段的不同。`,
    keyPoints: ["Parse→Style→Layout→Paint→Composite 五段", "JS 阻塞解析，CSS 阻塞渲染与 JS", "Layout 全局计算，transform 直达合成", "Performance 面板按流水线阶段读"],
    followUps: ["为什么 CSS 在 head 而 JS 在 body 底部？", "PrePaint 的属性树（Property Trees）解决什么问题？"],
    favorited: false,
  },
  {
    id: "fe-314",
    nodeId: "fe-browser-render",
    question: "重排（reflow）和重绘（repaint）的区别？如何最小化重排代价？",
    bigTech: true,
    answer: `重排是 Layout 阶段重算：几何属性变化（width/height/margin/位置/字号/窗口 resize）使部分或全部 Render Tree 的几何信息失效，浏览器重新遍历计算——Layout 是全局性操作，改一个节点可能级联影响父链和兄弟。重绘是 Paint 阶段重做：外观属性变化（color/background/visibility/box-shadow）不影响几何，跳过 Layout 直接重画位图。所以代价排序：重排 > 重绘 > 仅合成（transform/opacity 三者皆跳）。读操作也会触发重排：offsetWidth/getBoundingClientRect/getComputedStyle 等会强制浏览器立刻 flush 待处理的样式变更以保证返回最新值——这就是"强制同步布局"。

\`\`\`js
// 反例：读写交替，每次循环都强制同步布局，n 次 reflow
for (const el of items) {
  el.style.width = el.offsetWidth + 10 + "px"; // 读→写→读→写
}
// 正例：批量读→批量写，最多 2 次 reflow
const widths = items.map(el => el.offsetWidth);   // 全读完
items.forEach((el, i) => el.style.width = widths[i] + 10 + "px"); // 再全写
\`\`\`

实际案例：快手一个无限滚动 feed 在低端机上滚动掉帧到 20fps，火焰图显示 Layout 占帧耗时 70%。排查发现卡片展开动画直接改 height，每帧都触发整列表 reflow（下面所有卡片位置都要重算）。改造方案：动画改 transform: scaleY + 反向 scale 内容防变形（FLIP 技术的变体），或给列表容器加 contain: layout 把 reflow 范围限制在容器内，帧率回到 55fps+。另一个常见手法是虚拟列表——DOM 里只保留视口内 20 个节点，reflow 范围天然受限。

踩坑与 tradeoff：现代浏览器有"渲染队列"会把连续样式写入合并到下一帧统一 Layout，但任何读取几何的代码都会立即清空队列强制执行——读写交替是最隐蔽的性能杀手，且只在长列表/低端机上暴露；display:none 的元素不参与 Render Tree，批量修改时先隐藏再改再显示（2 次 reflow）比在可见状态改 n 次划算；absolute/fixed 定位脱离文档流，其 reflow 范围小于普通流元素；别过度迷信"零重排"——把简单的高度动画硬改成 FLIP transform 会引入复杂度和视觉瑕疵，列表短、动画少时直接改 height 反而更稳。`,
    keyPoints: ["重排改几何>重绘改外观>合成最便宜", "读几何属性会强制同步布局", "读写分离/批量 DOM 操作", "contain/虚拟列表限制 reflow 范围"],
    followUps: ["强制同步布局（forced synchronous layout）如何检测？", "FLIP 动画技术的原理是什么？"],
    favorited: false,
  },
  {
    id: "fe-315",
    nodeId: "fe-browser-render",
    question: "什么是合成层（compositing layer）？提升条件是什么？什么是层爆炸？",
    bigTech: true,
    answer: `合成层是浏览器把满足特定条件的元素从普通文档层中"提拔"出来、单独栅格化为一张纹理交给 GPU 的图层。合成时这些层只需 GPU 做矩阵变换和透明度混合，跳过 Layout 和 Paint——这是动画流畅的硬件基础。提升条件（Chrome/Blink）：① 3D transform（translateZ/rotateX 等）或 will-change: transform/opacity；② video/canvas/iframe 元素；③ CSS filter；④ 对 opacity/transform 做 transition/animation；⑤ z-index 较高的元素叠在已提升的合成层上（层压缩失败时的"隐式合成"）；⑥ position: fixed。用 DevTools 的 Layers 面板可查看每个层的提升原因（Compositing Reasons）和内存占用。

\`\`\`css
.card { will-change: transform; }          /* 显式声明，浏览器提前建层 */
.modal { transform: translateZ(0); }        /* 经典 hack：强制提升 */
.animated { animation: fade 1s; }           /* opacity 动画期间自动提升 */
\`\`\`

实际案例：蘑菇街一个商品瀑布流页面曾给全部 200 个卡片加 will-change: transform "优化性能"，结果低端机直接白屏崩溃——每个合成层都是一张独立纹理（卡片 300×400×4 字节 ≈ 480KB），200 层近 100MB GPU 纹理内存，移动端显存爆了，这就是"层爆炸"（layer explosion）。修复是只在真正动画的卡片上动态添加 will-change，动画结束即移除。另一个隐蔽案例是 z-index 叠层：一个 fixed 弹窗被提升后，它下方同 stacking context 里所有兄弟元素也被"连带提升"，内存占用翻倍。

踩坑与 tradeoff：合成层不是免费的——层数 × 面积 = 纹理内存，还有层间通信（主线程→合成线程）成本，层太多时合成本身变慢；will-change 是"预告"不是"优化"，提前太久声明等于一直占着内存，正确姿势是交互前挂上、用完即删；opacity/transform 动画在合成线程跑，主线程被 JS 阻塞时动画仍流畅——这是它们性能好的真正原因，但 filter/clip-path 动画会打回主线程 Paint；Safari 对 3D transform 提升策略比 Chrome 激进，同一份代码内存表现不同，跨端要实测。`,
    keyPoints: ["合成层=GPU 独立纹理，跳过 Layout/Paint", "提升条件：3D transform/will-change/filter/动画", "层爆炸=纹理内存耗尽", "will-change 动态挂卸"],
    followUps: ["为什么 transform 动画不受主线程 JS 阻塞影响？", "如何在 DevTools 中诊断层爆炸？"],
    favorited: false,
  },
  {
    id: "fe-316",
    nodeId: "fe-browser-render",
    question: "为什么 CSS 动画优先用 transform 和 opacity？width/height 动画卡的根本原因是什么？",
    bigTech: true,
    answer: `根本原因在于三者触发流水线不同阶段。transform 和 opacity 的动画值变化只影响 Composite 阶段：浏览器把元素提升为合成层后，GPU 每帧只对纹理做矩阵变换或透明度混合，主线程完全不参与——即使主线程被 JS 占满，合成线程照样 60fps 输出。而 width/height/top/left 属于几何属性，每帧变化都触发 Layout（重排）：主线程重算几何→重新 Paint→再合成，三步全走；碰上复杂页面 Layout 单次就要 10ms+，帧预算 16.6ms 直接爆掉，表现为掉帧卡顿。margin/padding/box-shadow（非 inset 可部分优化）同理触发重排或重绘。

\`\`\`css
/* 反例：每帧触发 Layout+Paint，列表场景必卡 */
.drawer { transition: height .3s; }
.drawer.open { height: 400px; }
/* 正例：只触发 Composite */
.drawer { transform: translateX(-100%); transition: transform .3s; }
.drawer.open { transform: translateX(0); }
/* 尺寸缩放场景的 tradeoff：scale 会模糊内容，需配合反缩放或 FLIP */
\`\`\`

实际案例：得物 App 内嵌 H5 的购物车抽屉，最初用 height 动画展开，中端安卓机上帧率 25fps 且伴随列表跳动（每次 Layout 重排了下方 50 个商品卡片）。改为固定高度容器 + transform: translateY 位移 + 内部内容 translateY 反向补偿后稳定 60fps。另一个对照实验：同一个按钮点击缩放反馈，用 width/height 实现时在低端机上掉帧可感知，改 transform: scale 后丝滑——但 scale 放大超过 1.5 倍时文字发虚，最终方案是按钮预渲染 1.5 倍大小、默认 scale(0.67)，动画只放大到 1。

踩坑与 tradeoff：transform 动画的副作用是创建新层叠上下文和 containing block——fixed 定位的子元素会相对 transform 祖先定位而非视口，这是无数"弹窗定位错乱"bug 的根源；scale 放大会模糊（纹理拉伸），超大缩放场景要预渲染高分辨率或改用 FLIP（First-Last-Invert-Play）技术：先记录起止几何，用 transform 模拟位移，动画结束再真实布局；JS 驱动的 width 动画（requestAnimationFrame 逐帧改）比 CSS transition 更糟——每帧强制同步 Layout，连浏览器的队列合并都绕过；box-shadow 动画可用伪元素预建阴影 + opacity 淡入来绕开重绘。`,
    keyPoints: ["transform/opacity 走合成线程，主线程零参与", "几何属性每帧 Layout+Paint", "transform 创建层叠上下文坑 fixed 定位", "FLIP 技术兼顾性能与清晰度"],
    followUps: ["合成线程动画与主线程动画如何区分？", "transform 为什么会影响 fixed 定位？"],
    favorited: false,
  },
  {
    id: "fe-317",
    nodeId: "fe-browser-render",
    question: "script 标签的 async、defer、type=module 有什么区别？为什么同步 JS 会阻塞渲染？",
    bigTech: true,
    answer: `阻塞根源：HTML 解析器遇到同步 <script> 必须暂停 DOM 构建，下载并立即执行脚本，因为脚本可能 document.write 修改后续输入流、或读写尚未构建的 DOM——浏览器无法预判，只能保守地串行等待。三种非阻塞方案：async 下载不阻塞解析、下载完立即暂停解析执行（执行顺序不确定，先到先跑）；defer 下载不阻塞、延迟到 DOM 解析完成后按声明顺序执行（DOMContentLoaded 之前）；type="module" 默认 defer 行为（顺序保证），且自带模块作用域、严格模式、CORS 加载、可静态分析依赖做预加载。内联 module 脚本立即执行不等待。无 src 的 async/defer 属性无效。

\`\`\`html
<script src="a.js"></script>             <!-- 解析暂停：下载+执行都阻塞 -->
<script src="b.js" async></script>       <!-- 下载并行，执行随机插队 -->
<script src="c.js" defer></script>       <!-- 下载并行，DOM 完成后按序执行 -->
<script type="module" src="d.js"></script> <!-- 默认 defer，模块依赖静态预加载 -->
<!-- 选型：独立埋点用 async；依赖 DOM/有顺序要求用 defer；现代项目全 module -->
\`\`\`

实际案例：网易新闻 H5 首屏优化时，把首屏不需要的 6 个第三方脚本（统计/推荐/广告 SDK）全部从同步改 async，LCP 从 2.8s 降到 1.6s——但上线后发现推荐模块偶发不渲染：async 脚本执行时机早于 DOM 就绪，脚本里 getElementById 拿不到容器。修复是给该 SDK 改 defer（DOM 完成后执行）或把初始化逻辑挂到 DOMContentLoaded。这个事故精确说明了 async/defer 的语义差异不是背概念，而是选型依据：只关心"加载了"的用 async，关心"操作 DOM"的用 defer。

踩坑与 tradeoff：async 的执行顺序不确定性意味着多个 async 脚本间不能有依赖（jQuery 和它的插件都 async 就是赌博）；defer 脚本虽在 DOM 解析后执行，但下载太晚仍会推迟 DOMContentLoaded——巨型 defer 包依然拖累可交互时间；module 的静态依赖图让浏览器可以用 <link rel="modulepreload"> 并行预取整棵依赖树，这是 ESM 相对 CJS 在浏览器端的结构性优势；CSS 会阻塞其后 script 的执行（脚本可能要 getComputedStyle），所以"CSS 阻塞 JS，JS 阻塞解析"的链条让 head 里的巨型 CSS 间接触发首屏白屏；2026 年的 Baseline 认知：动态 import() 做路由级代码分割 + modulepreload 首屏关键模块，是比纠结 async/defer 更现代的性能手段。`,
    keyPoints: ["同步脚本阻塞解析因 document.write 可能性", "async 乱序执行，defer 有序等 DOM", "module 默认 defer+静态依赖预加载", "CSS 阻塞 JS 执行进而阻塞解析"],
    followUps: ["modulepreload 和 prefetch/preload 的区别？", "为什么 ESM 能做静态依赖分析而 CJS 不行？"],
    favorited: false,
  },
  {
    id: "fe-318",
    nodeId: "fe-browser-render",
    question: "requestAnimationFrame、requestIdleCallback、setTimeout 在渲染时序上有什么区别？",
    bigTech: true,
    answer: `三者对应一帧生命周期的不同相位。rAF 回调在下一帧渲染前（Style/Layout/Paint 之前）执行，浏览器保证回调里的 DOM 修改会在本帧一起上屏——所以动画必须用 rAF 对齐刷新率（通常 60Hz 即 16.6ms，高刷屏 120Hz 则 8.3ms），setTimeout 驱动动画无法对齐 VSync，必然出现掉帧或同一帧多次无效绘制。rIC 在帧的空闲期执行（渲染完成后如果还有剩余时间），超时参数 timeout 保证最坏情况下也会执行——适合低优先级任务：埋点上报、预加载、大数据分片处理。setTimeout(fn, 0) 是宏任务，最快也要在"当前任务+微任务队列清空后"的下一个宏任务执行，和渲染帧没有对齐关系，实际间隔还受 4ms 最小钳制（嵌套 5 层以上）和后台标签页 1s 节流影响。

\`\`\`js
// 动画：rAF 对齐帧率，一帧一改
function tick() { ball.style.left = ballX += vx + "px"; rafId = requestAnimationFrame(tick); }
// 大列表分片渲染：空闲时干活，1s 内必须完成
function chunk(deadline) {
  while (deadline.timeRemaining() > 0 && queue.length) renderOne(queue.shift());
  if (queue.length) requestIdleCallback(chunk, { timeout: 1000 });
}
\`\`\`

实际案例：即刻 App 网页版的消息流初始化要渲染 500 条卡片，直接同步渲染阻塞主线程 800ms 白屏。第一版优化用 setTimeout 分批（每批 20 条），卡顿依旧——setTimeout 批次可能插在帧中间执行，半批渲染照样长任务。改 rIC 分片后，利用每帧渲染完的空闲时间渲染 2-3 条，首屏可交互时间降到 200ms。但发现 Safari 不支持 rIC（直到 2024 年 Safari 17.4 才加入，2026 年已属 Baseline），需要 fallback：用 MessageChannel 实现的 scheduler polyfill（React Scheduler 就是这个思路）。

踩坑与 tradeoff：rAF 在后台标签页完全暂停（省电），依赖 rAF 计时的逻辑（倒计时、轮播）切后台就停——计时要用 Date 差值而非计数帧数；rIC 回调可能因帧一直繁忙而被推迟很久，timeout 参数是底线保障，关键任务别依赖它；rIC 里不要改 DOM（可能触发下一帧前的意外 Layout），适合纯计算和数据预处理；React 的并发调度器最初用 rIC polyfill 后来换成 MessageChannel——因为 rIC 执行频率受浏览器帧率影响（部分设备帧间无空闲，调度饥饿），这个演进本身就是时序理解深度的试金石。`,
    keyPoints: ["rAF 渲染前执行对齐 VSync", "rIC 帧空闲期执行+timeout 兜底", "setTimeout 不对齐帧率且后台节流", "rIC 不适合改 DOM 和关键任务"],
    followUps: ["React Scheduler 为什么弃用 rIC 改用 MessageChannel？", "后台标签页对 rAF/setTimeout 分别有什么节流策略？"],
    favorited: false,
  },
  {
    id: "fe-319",
    nodeId: "fe-browser-render",
    question: "content-visibility 和 contain 属性如何优化长页面渲染？和虚拟列表是什么关系？",
    bigTech: true,
    answer: `content-visibility: auto 让浏览器跳过视口外元素的整个渲染子树（Layout+Paint 全省），直到元素接近视口才渲染——效果类似虚拟列表但零 JS、保留真实 DOM（find-in-page、可访问性树完整可用）。配套的 contain-intrinsic-size 为未渲染元素声明占位尺寸，防止滚动条跳动。contain 是更底层的 CSS 包含机制：layout/paint/size/style 四个值分别声明"该元素内部变化不影响外部"，浏览器据此把 reflow/repaint 范围裁剪到子树内——contain: strict 等于 size+layout+paint 全开。两者关系：content-visibility 解决"屏外不渲染"（省首次渲染成本），contain 解决"屏内变化不扩散"（省更新成本），虚拟列表则是 JS 方案解决"DOM 节点总量"问题。

\`\`\`css
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 320px; /* 占位高 320，渲染后自动校准 */
}
.widget { contain: layout paint; }    /* 内部 reflow 不外溢 */
\`\`\`

实际案例：Chrome 团队官方案例，一个 1300 个 DOM 节点的长文章页，开启 content-visibility: auto 后首次渲染从 233ms 降到 30ms（87% 提升）。国内落地案例：淘宝某店铺装修页有 50+ 楼层模块，每个楼层 DOM 结构复杂，首屏渲染 1.8s。给非首屏楼层加 content-visibility + contain-intrinsic-size 后首屏降到 600ms——相比之前评估的虚拟列表方案，不用改组件结构、楼层内表单状态天然保留、SEO 内容完整可索引（虚拟列表的隐藏内容对爬虫不可见是硬伤）。但楼层高度预估偏差导致滚动条轻微跳动，用 contain-intrinsic-size: auto 记忆已渲染高度后缓解。

踩坑与 tradeoff：content-visibility: auto 的元素仍参与文档流但跳过渲染，嵌套过深（每个小元素都加）反而增加样式计算开销——粒度选"卡片/楼层"级别而非"文本节点"级别；Safari 支持较晚（Safari 18 起，2026 年已基本可用），旧 Safari 需 @supports 兜底或直接当增强不加兜底；占位尺寸与实际尺寸偏差大时滚动位置会跳（滚动锚定只能部分缓解），无限加载场景慎用；contain: size 声明后元素尺寸不再由内容撑开，忘了显式给宽高就塌成 0；和虚拟列表对比选型：十万级节点、行高一致选虚拟列表，几千节点、结构异构选 content-visibility。`,
    keyPoints: ["content-visibility 跳过屏外渲染零 JS", "contain 限制 reflow/repaint 范围", "contain-intrinsic-size 防滚动条跳动", "与虚拟列表按节点量级和结构选型"],
    followUps: ["content-visibility 对可访问性和 SEO 有什么影响？", "contain 的四个值分别裁剪什么？"],
    favorited: false,
  },
  {
    id: "fe-320",
    nodeId: "fe-browser-render",
    question: "什么是关键渲染路径（CRP）？如何系统优化首屏渲染？",
    bigTech: true,
    answer: `关键渲染路径是"首字节到首次绘制"之间浏览器必须完成的最短依赖链：HTML 到达→解析遇到 CSS（阻塞渲染）→下载执行关键 JS（阻塞解析）→构建 Render Tree→Layout→Paint 上屏。CRP 优化就是缩短这条链的每一环：减少关键资源数量（内联首屏 CSS/JS）、减小关键资源体积（压缩/Tree Shaking/代码分割）、缩短关键路径长度（RTT 次数：preload 提前加载、HTTP/2 多路复用、CDN 就近）、降低阻塞权重（defer/async 非关键 JS、media 属性拆分非关键 CSS）。度量指标对应：FCP（首次内容绘制）、LCP（最大内容绘制，<2.5s 为优）。

\`\`\`html
<!-- 首屏 CSS 内联，非首屏 CSS 异步 -->
<style>/* critical css 3KB */</style>
<link rel="preload" href="rest.css" as="style" onload="this.rel='stylesheet'">
<!-- 首屏关键图 preload，跳队优先 -->
<link rel="preload" as="image" href="hero.avif" fetchpriority="high">
<!-- 第三方脚本全部 defer/async -->
<script src="analytics.js" async></script>
\`\`\`

实际案例：蔚来官网首屏优化项目，LCP 从 4.1s 优化到 1.7s 的四板斧：① 首屏 hero 图从 CSS background 改为 <img fetchpriority="high">（background 要等 CSSOM 构建完才开始下载，img 在预解析阶段就被 preload scanner 发现）；② 14KB 首屏 CSS 内联进 HTML，剩余 180KB 异步加载；③ 字体改用 font-display: swap + preload 关键字重（原方案 FOIT 导致文字 3s 不可见）；④ 接入 CDN 边缘节点 + HTTP/2，TTFB 从 800ms 降到 180ms。每一步都能对应回 CRP 链条的某一环，这就是"系统性"的含义。

踩坑与 tradeoff：内联首屏 CSS 会失去缓存（每次 HTML 都带一遍），控制在内联 <15KB 且配合 Service Worker 缓存 HTML 才划算；preload 用多了适得其反——所有资源都"最高优先级"等于没有优先级，preload 只给真正阻塞 LCP 的 1-2 个资源；SSR/SSG 是 CRP 优化的终极形态（首屏 HTML 即完整内容，不等 JS），但引入服务端复杂度和 TTFB 成本，纯展示页值得，重交互应用要算 hydration 成本；别忽略 preload scanner 的存在——写在 JS 里动态创建的资源引用（new Image()/动态 import）跳过了扫描器的提前发现，首屏关键资源必须出现在 HTML 里。`,
    keyPoints: ["CRP=首字节到首绘的最短依赖链", "四板斧：减数量/减体积/缩短链/降阻塞", "img 比 CSS background 更早被发现", "preload 只给 1-2 个真关键资源"],
    followUps: ["preload scanner 的工作原理是什么？", "SSR 为什么可能让 TTFB 变差？"],
    favorited: false,
  },
  {
    id: "fe-321",
    nodeId: "fe-browser-render",
    question: "浏览器一帧的生命周期是怎样的？16.6ms 内发生了什么？",
    bigTech: true,
    answer: `一帧的标准流程（以 60Hz 为例，预算 16.6ms）：① 输入事件（Input：click/scroll 回调，合成线程先收到再转发主线程）→ ② rAF 回调执行（动画 DOM 修改在此）→ ③ 主线程跑 JS 宏任务/微任务（可能耗时 0 到无限）→ ④ Style 计算（选择器匹配、样式级联）→ ⑤ Layout（几何计算，仅在脏标记时）→ ⑥ Paint（生成绘制指令+栅格化，可部分在 worker 线程）→ ⑦ Composite（合成线程合并图层）→ ⑧ 帧提交 GPU 上屏。之后若还有剩余时间，执行 rIC 空闲回调。任一步超时都会挤压后续步骤，整个流程超过 16.6ms 就掉帧（jank）——用户感知的卡顿本质是帧没有按时提交。

\`\`\`
|← 16.6ms →|
Input → rAF → JS tasks → Style → Layout → Paint → Composite → [idle: rIC]
 ↑ 主线程 ────────────────────────────↑      ↑ 合成线程
\`\`\`

实际案例：B 站播放器弹幕优化的经典思路正是帧生命周期驱动：弹幕轨道的 translateX 位移用 rAF 驱动（步骤②），弹幕对象池的创建/回收放 rIC（步骤⑧之后），弹幕文本的 Canvas 绘制在离屏 canvas 批量完成（减少步骤⑥的 Paint 范围），实测万条弹幕同屏从 15fps 提升到 55fps。另一个排查案例：某活动页点击按钮后 UI 响应慢半拍，Performance 面板显示 Input 事件（步骤①）后 90ms 才执行回调——根因是主线程被上一个长任务占着，事件排队等待，解决方案是长任务拆分（scheduler.yield 或 setTimeout 切片）。

踩坑与 tradeoff：高刷屏（120Hz/144Hz）把预算砍到 8.3ms/6.9ms，在 60Hz 设备上"刚好不卡"的代码到高刷屏上反而更容易掉帧——性能测试要覆盖高刷设备；getBoundingClientRect 等强制同步布局会把 Layout 从步骤⑤提前到 JS 执行中，打乱帧节奏；long task（>50ms）不等于掉帧但必然影响 INP（交互响应指标），2026 年 INP 已是 Google 排名因素；帧生命周期理解的最大价值是"知道优化手段作用于哪一步"：防抖节流省②③、合成层省⑤⑥、content-visibility 省④⑤⑥——脱离帧模型背优化清单，面试一问就穿。`,
    keyPoints: ["Input→rAF→JS→Style→Layout→Paint→Composite", "任一步超时即掉帧", "高刷屏预算仅 8.3ms", "优化手段要对位到具体帧步骤"],
    followUps: ["长任务（long task）和掉帧的关系是什么？", "合成线程和主线程分别负责帧流程的哪些步骤？"],
    favorited: false,
  },
  // ===== 新增节点题目：fe-http-cache HTTP 缓存与 CDN =====
  {
    id: "fe-322",
    nodeId: "fe-http-cache",
    question: "强缓存和协商缓存的完整流程是什么？浏览器如何决策用哪个？",
    bigTech: true,
    answer: `强缓存：浏览器发请求前先查本地缓存，命中且未过期（Cache-Control: max-age=3600 或 Expires 未到期）则直接返回缓存副本，状态码 200 (from disk/memory cache)，网络请求根本不发出。协商缓存：强缓存过期后，请求携带上次响应给的验证器（If-None-Match: ETag 或 If-Modified-Since: Last-Modified）发到源站，服务器比对内容没变就回 304 Not Modified（只有头没有 body），浏览器复用本地 body；变了就回 200 带新内容。决策顺序是固定的：先看 Cache-Control 的 max-age/s-maxage（HTTP/1.1，优先级高于 HTTP/1.0 的 Expires 绝对时间），过期了才走协商；no-cache 表示"可以存但每次用前必须协商"，no-store 才是"完全不存"。

\`\`\`
请求 → 本地有缓存？
        ├─ 无 → 发请求 → 存缓存(按响应头)
        └─ 有 → max-age 未过期？ → 是 → 直接用(200 from cache)
                 └─ 否 → 带 ETag/Last-Modified 协商
                          ├─ 304 → 复用本地 body
                          └─ 200 → 更新缓存
\`\`\`

实际案例：京东首页的缓存策略是教科书式的分层：HTML 文档 Cache-Control: no-cache（每次协商，保证发版即时生效），带 contenthash 的 JS/CSS 用 max-age=31536000, immutable（一年强缓存，内容变 hash 变 URL 变，旧缓存自然失效），接口数据按业务分级——商品信息 s-maxage=60（CDN 缓存 1 分钟）+ 浏览器不缓存，用户信息完全 no-store。一次错误配置教训：运维把 HTML 也设了 max-age=86400，大促改版后 30% 用户一整天看到旧页面，回滚 CDN 配置 + 强制刷新推送才恢复。

踩坑与 tradeoff：memory cache 和 disk cache 的选择由浏览器决定（小文件/频繁用倾向内存，关标签页内存缓存即清），不是配置项；max-age 是相对时间（响应生成时刻起算）而 Expires 是服务器绝对时间——客户端时钟错乱时 Expires 会翻车，这是它被废弃的原因；协商缓存的 304 也有一次完整 RTT，弱网环境下 RTT 成本可能比 body 传输还高，所以"长强缓存 + hash 指纹"永远优于"短缓存 + 协商"；隐私模式/禁用缓存（DevTools Disable cache 勾选时）绕过全部缓存逻辑，调试缓存问题先确认这个开关。`,
    keyPoints: ["强缓存零请求，协商缓存一次 RTT 换 304", "max-age 优先于 Expires，no-cache≠no-store", "HTML 协商+静态资源长缓存是标配", "弱网下协商 RTT 成本不可忽略"],
    followUps: ["memory cache 和 disk cache 的决策逻辑？", "为什么 Expires 被 max-age 取代？"],
    favorited: false,
  },
  {
    id: "fe-323",
    nodeId: "fe-http-cache",
    question: "Cache-Control 的常用指令矩阵是什么？no-cache 和 no-store 到底差在哪？",
    bigTech: true,
    answer: `Cache-Control 是逗号分隔的指令集，按作用域分三组。可缓存性：public（共享缓存如 CDN 可存，默认）/private（仅浏览器私有缓存可存，CDN 不可存）/no-store（任何缓存都不许存，每次全量拉取）/no-cache（可以存，但每次使用前必须向源站验证，等价于 max-age=0 + 强制协商）。过期控制：max-age=N（浏览器缓存 N 秒）/s-maxage=N（仅共享缓存生效，覆盖 max-age，CDN 专用）/stale-while-revalidate=N（过期后 N 秒内先返回旧缓存同时后台异步更新，SWR 策略的协议化）/stale-if-error（源站挂了就给旧缓存兜底）。其他：immutable（声明内容永不变，浏览器在 max-age 内连刷新都不发协商请求）/must-revalidate（过期后必须协商成功才能用，禁用启发式缓存）。

\`\`\`
# 静态资源（带 hash）：一年强缓存+不变声明
Cache-Control: public, max-age=31536000, immutable
# HTML 文档：每次协商
Cache-Control: no-cache
# 用户敏感数据：完全不存
Cache-Control: no-store
# API 列表数据：缓存 60s，容忍 5 分钟旧数据后台更新
Cache-Control: public, max-age=60, stale-while-revalidate=300
\`\`\`

实际案例：淘宝 CDN 的静态资源配置是 max-age=31536000, immutable——immutable 的价值在"刷新"场景：没有它，用户按 F5 时浏览器会对所有资源发协商请求（Conditional GET），几百个请求涌向 CDN 边缘节点；有 immutable，刷新也直接用本地缓存，淘宝实测刷新场景的请求数下降 90%。反面案例：某银行 H5 把账户总览接口设成 private, max-age=300，用户转账后余额 5 分钟不更新引发大量客诉——金融数据必须 no-store，缓存分级表上"钱"永远在最严格档。

踩坑与 tradeoff：no-cache 是最大的误解源——名字像"不缓存"实际是"存了但每次都验证"，真想不存用 no-store；s-maxage 只作用于共享缓存，浏览器直接无视，所以 CDN 和浏览器想要不同 TTL 时用 max-age=0, s-maxage=3600 组合（浏览器每次协商、CDN 缓存 1 小时）；stale-while-revalidate 需要 CDN 支持（Cloudflare/阿里云 CDN 都支持），浏览器原生对 HTTP header 版本的支持在 2026 年仍有限，别指望它替代 Service Worker 版 SWR；immutable 在 Firefox 全支持、Chrome 只认 HTTPS 场景下的部分行为，跨浏览器收益不一致——它是增强项不是基础项。`,
    keyPoints: ["no-cache=存但每次验证，no-store=完全不存", "s-maxage 只管共享缓存（CDN）", "immutable 抑制刷新时的协商洪水", "钱相关数据永远 no-store"],
    followUps: ["stale-while-revalidate 和 Service Worker SWR 策略的关系？", "启发式缓存（无 Cache-Control 时）浏览器怎么算 TTL？"],
    favorited: false,
  },
  {
    id: "fe-324",
    nodeId: "fe-http-cache",
    question: "ETag 和 Last-Modified 有什么区别？各自的缺陷是什么？",
    bigTech: true,
    answer: `Last-Modified 是资源最后修改时间（秒级精度），浏览器下次带 If-Modified-Since 比对；ETag 是内容标识（通常是内容 hash 或版本号，分强 ETag 和弱 ETag W/"..."），浏览器带 If-None-Match 比对。差异本质：Last-Modified 是"时间戳语义"，ETag 是"内容语义"。当两者同时存在时 ETag 优先。Last-Modified 三大缺陷：① 秒级精度，1 秒内多次修改检测不到（高频发布场景翻车）；② 内容没变但 mtime 变了（文件被 touch、集群机器时钟漂移）会误判为修改，白白回 200 全量传输；③ 某些服务器对动态内容不提供或提供的是页面生成时间。ETag 的缺陷：① 集群环境下不同机器生成算法不一致（Nginx 默认用 mtime+size，多机部署同一资源 ETag 可能不同，协商直接失效）；② 强 ETag 要求字节级一致，CDN 做 gzip/brotli 转码后字节变了——所以 CDN 场景要用弱 ETag（W/ 前缀，语义级比较）。

\`\`\`
HTTP/1.1 200 OK
Last-Modified: Sat, 25 Jul 2026 08:00:00 GMT   ← 秒级时间戳
ETag: W/"5e8f-a3b2c1"                            ← 弱 ETag：长度-hash
# 下次请求
If-None-Match: W/"5e8f-a3b2c1"      ← ETag 优先
If-Modified-Since: Sat, 25 Jul 2026 08:00:00 GMT
\`\`\`

实际案例：一个经典生产事故：公司从单机 Nginx 迁移到三机负载均衡集群后，静态资源 304 率从 95% 暴跌到 20%，带宽成本翻倍。排查发现默认 ETag 算法含 inode 信息，三台机器同一文件的 inode 不同，用户轮询到不同机器时 ETag 永远对不上。修复方案二选一：关闭 ETag 只用 Last-Modified（损失秒级精度），或统一 ETag 生成算法为内容 MD5（Nginx 需要第三方模块，或交给构建产物文件名 hash + 长强缓存绕开协商）。最终选了后者——这又印证"长强缓存+hash 指纹"是对协商缓存复杂性的终极绕行。

踩坑与 tradeoff：ETag 校验在分布式系统里的隐性成本常被低估——如果后端要为每个协商请求计算内容 hash，CPU 开销可能超过直接回 body（小文件场景协商反而更贵），所以 ETag 应该预计算存起来或用文件元数据近似；If-None-Match: * 在 PUT 场景是"仅当资源不存在才写入"的乐观锁语义，和缓存无关但同源；弱 ETag 的"语义等价"由服务器自定义（gzip 前后算等价），如果服务器实现粗糙会把真变更也判为等价；实践中，静态资源交给构建指纹，动态接口的协商缓存用 ETag=业务数据版本号（如 updated_at+id 的 hash）比用内容 hash 便宜得多。`,
    keyPoints: ["Last-Modified 秒级精度+mtime 误判", "ETag 内容语义但集群生成不一致", "弱 ETag 适配 CDN 转码场景", "指纹长缓存绕开协商复杂性"],
    followUps: ["强 ETag 和弱 ETag 的语义差异？", "协商缓存对后端 CPU 的成本如何评估？"],
    favorited: false,
  },
  {
    id: "fe-325",
    nodeId: "fe-http-cache",
    question: "为什么带 hash 指纹的静态资源可以放心设置一年强缓存？",
    bigTech: true,
    answer: `核心逻辑是"URL 即版本"：构建工具（Vite/Webpack/Rspack）给产物文件名注入内容哈希（app.a3f2c1.js），文件内容任何变化都会产出新 hash 新 URL。这意味着同一个 URL 对应的内容在数学上永不变更——给它 max-age=31536000, immutable 没有"内容更新了缓存没失效"的风险，因为更新必然换 URL。HTML 文档引用新 hash 的资源，所以"HTML 不缓存（或协商缓存）+ 静态资源一年强缓存"构成完整的发版闭环：用户拉新 HTML→发现新资源 URL→缓存未命中→拉新资源；没发版时所有资源 200 from cache 零网络请求。

\`\`\`html
<!-- 构建产物引用：hash 即版本 -->
<script src="/assets/app.a3f2c1.js"></script>
<link href="/assets/index.b8d4e2.css" rel="stylesheet">
<!-- nginx 对 /assets/ 目录统一长缓存 -->
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /index.html {
  add_header Cache-Control "no-cache";
}
\`\`\`

实际案例：字节内部前端发布平台的统计：接入 hash 指纹 + 一年强缓存后，静态资源平均命中率 98.5%，回源带宽下降 82%，二次访问首屏时间中位数从 1.4s 降到 400ms。但踩过一个经典的坑：老项目把 hash 加在 query 上（app.js?v=a3f2c1）而非文件名上——部分老旧 CDN 节点和代理服务器默认忽略 query 串做缓存键，导致 ?v=新hash 仍返回旧文件，全部改成文件名 hash 才解决。另一个细节：source map 文件（app.a3f2c1.js.map）如果也要发布，别忘了它同样享受长缓存，配合 hidden-source-map 策略上传到监控平台即可。

踩坑与 tradeoff：hash 指纹方案的前提是所有资源引用都经过构建工具重写——HTML 里手写的 <img src="/logo.png"> 不进构建管线就没有 hash，这类"裸引用"资源要单独目录 + 短缓存策略；动态 import 的异步 chunk 也有 hash，但如果用户页面开着超过一次发版，旧 HTML 里记录的 chunk URL 已不存在（旧文件被清理），会报 ChunkLoadError——工程上要保留最近 N 个版本的产物目录，或捕获该错误引导用户刷新；immutable 声明后用户强刷（Ctrl+F5）才会跳过缓存，普通 F5 在 Chrome 里对 immutable 资源也不发请求，排查"我改了怎么没生效"先想缓存层级；文件 hash 用内容算（contenthash）而非构建序号（buildhash），否则无关改动也会让全部资源 hash 变化、缓存集体失效。`,
    keyPoints: ["URL 即版本：内容变 hash 变", "HTML 协商+资源长缓存构成发版闭环", "hash 放文件名而非 query", "ChunkLoadError 要留旧版本或引导刷新"],
    followUps: ["contenthash/chunkhash/buildhash 的区别？", "用户停留在旧页面时发版如何优雅处理？"],
    favorited: false,
  },
  {
    id: "fe-326",
    nodeId: "fe-http-cache",
    question: "CDN 的工作原理是什么？边缘缓存、回源、缓存键分别怎么理解？",
    bigTech: true,
    answer: `CDN（内容分发网络）用"地理就近"对抗光速延迟：在全球部署边缘节点（PoP），用户 DNS 解析时被调度到最近的节点，静态内容直接从边缘返回（RTT 从跨省 50ms 降到同城 5ms）。流程：用户请求→边缘节点查本地缓存→命中直接返回（HIT）→未命中则向源站回源（MISS），拿到内容后按源站响应头（Cache-Control/s-maxage）缓存并返回给用户。缓存键（Cache Key）决定"什么算同一份内容"：默认是完整 URL（含 query），可配置忽略 query、加入 Cookie/Device-Type 等维度——电商大促场景会按 UA 区分移动/PC 缓存不同版本。缓存层级通常是 边缘节点 → 区域中心节点 → 源站 三级，边缘 MISS 先问中心节点，减少回源压力。回源还有"回源 HOST"概念：CDN 回源时请求头的 Host 要配成源站认识的域名，否则源站 404。

\`\`\`
用户 → [边缘节点] --MISS--> [中心节点] --MISS--> [源站]
         HIT: 直接返回         回源带上游缓存        按 s-maxage 下发
缓存键示例： scheme://host/path?query → 可定制剔除 utm_* 等营销参数
\`\`\`

实际案例：B 站视频封面图的 CDN 缓存键治理：早期 URL 带了一堆统计参数（?from=feed&ts=xxx），每张封面在边缘节点被当成几十个不同资源缓存，命中率只有 40%，回源带宽成本巨大。治理方案是在 CDN 控制台配置缓存键忽略 ts/from 等参数（query string 排序 + 白名单），命中率拉到 92%。另一个经典案例是缓存穿透防护：某电商被恶意爬虫用随机 query（?rand=xxxx）打爆，每个 URL 都是新缓存键，全部回源，源站 QPS 翻 20 倍——最后靠 CDN 层做"缓存键标准化 + 异常流量清洗"才稳住。

踩坑与 tradeoff：CDN 缓存和浏览器缓存是两层独立体系，排查"内容不更新"要先分清是哪一层没刷新——CDN 侧用 curl -I 看响应头里的 X-Cache: HIT/MISS 和 Age 判断；动态内容（个性化推荐）不该过 CDN 缓存或用极短 TTL + vary 头维度，配错了就是"A 用户看到 B 用户数据"的 P0 事故（缓存键里漏了 Cookie/Token 维度）；Purge（缓存刷新）不是瞬时的——全球节点刷新有几分钟延迟，大促发版要预热（主动回源拉新内容到边缘）而不是等 purge 生效；CDN 厂商对 Set-Cookie 响应默认不缓存（合理默认），需要缓存带 Set-Cookie 的响应要显式开配置，反之也要警惕把带 Set-Cookie 的响应缓存下来发给所有用户。`,
    keyPoints: ["就近访问+边缘缓存抗回源", "缓存键维度决定命中率与正确性", "X-Cache/Age 区分 CDN 层与浏览器层", "个性化内容禁共享缓存防串号"],
    followUps: ["缓存穿透/击穿/雪崩在 CDN 层各怎么防？", "CDN 预热（prefetch）和刷新（purge）的使用场景？"],
    favorited: false,
  },
  {
    id: "fe-327",
    nodeId: "fe-http-cache",
    question: "前端发版时「HTML 不缓存 + 静态资源长缓存」方案如何完整落地？常见翻车点有哪些？",
    bigTech: true,
    answer: `落地方案分四层。构建层：产物文件名带 contenthash，index.html 由构建工具生成并自动引用新 hash 资源。Web 服务器层（Nginx）：/assets/ 目录返回 Cache-Control: public, max-age=31536000, immutable；index.html 返回 Cache-Control: no-cache（每次协商，不发版时 304 成本极小，发版时立即拿到新 HTML）。CDN 层：HTML 不缓存或极短 TTL（s-maxage=0~60s，防 CDN 缓存住旧 HTML），静态资源长缓存 + 缓存键忽略无意义 query。发布层：静态资源先推 CDN（新 hash 资源先就位），再切 HTML（引流量指向新资源）——顺序反了会出现"新 HTML 引用还没上传的资源"404。

\`\`\`nginx
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
location / {
  try_files $uri /index.html;
  add_header Cache-Control "no-cache";
}
\`\`\`

实际案例：小红书 web 端一次发版事故完整还原：发布流水线先切 HTML 后传静态资源（并行任务时序错乱），新 HTML 上线后引用的新 hash JS 还没到 CDN，用户拿到新 HTML→请求新 JS→404→白屏。故障 15 分钟，回滚 HTML 恢复。之后的流水线固化为"资源先行"：构建产物先全量推 CDN（新旧资源共存，旧 HTML 引用旧资源不受影响）→ 校验资源可访问 → 最后切 HTML 指向新版本。另一个翻车点是 Service Worker 把 HTML 也 CacheFirst 缓存了，协商缓存策略被 SW 拦截层架空——SW 的缓存策略优先级高于 HTTP 缓存，HTML 在 SW 里必须 NetworkFirst。

踩坑与 tradeoff：no-cache 的 HTML 每次都有协商 RTT，对首屏 TTFB 有轻微影响——折中是 CDN 层给 HTML 极短 s-maxage（30-60s）+ stale-if-error，发版延迟一分钟换边缘分发速度；SPA 的 history 路由回退到 index.html 的 try_files 配置别忘加缓存头，否则路由深链直接访问时 HTML 被默认缓存策略坑；灰度发布场景"HTML 不缓存"和"灰度分流"会打架——CDN 按 cookie 分流到新旧 HTML 需要缓存键带灰度维度，复杂度上来后很多团队选择"HTML 不走 CDN 缓存"一刀切；别忘了 favicon/manifest.json 这类非构建产物资源，它们没有 hash 指纹，要单独短缓存策略，否则换 logo 一周不生效。`,
    keyPoints: ["资源先行后切 HTML 的发版时序", "HTML no-cache+SW 里 NetworkFirst", "CDN 层 HTML 短 TTL 折中", "非构建产物资源单独缓存策略"],
    followUps: ["灰度发布时 CDN 缓存键如何带灰度维度？", "Service Worker 缓存和 HTTP 缓存的优先级关系？"],
    favorited: false,
  },
  {
    id: "fe-328",
    nodeId: "fe-http-cache",
    question: "Service Worker 缓存策略有哪些？CacheFirst/NetworkFirst/SWR 各自适用什么资源？",
    bigTech: false,
    answer: `Service Worker 是浏览器和网络之间的可编程代理，fetch 事件里可以自定义"缓存 vs 网络"的决策，五种经典策略（Workbox 均有实现）：CacheFirst（先查缓存，没有再走网络并写入缓存——适合带 hash 的静态资源，命中后零延迟）；NetworkFirst（先走网络，失败/超时再回退缓存——适合 HTML 和 API 数据，保证新鲜度且有离线兜底）；StaleWhileRevalidate（先返回缓存，同时后台发请求更新缓存供下次用——适合头像/配置类"旧一点没关系但希望更新"的资源）；NetworkOnly/CacheOnly（纯网络/纯缓存，用于特殊场景如 analytics 只走网络）。选型矩阵本质是"新鲜度 vs 可用性 vs 速度"的三角权衡。

\`\`\`js
// Workbox 路由级策略配置
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({ cacheName: "html", networkTimeoutSeconds: 3 })
);
registerRoute(
  /\/assets\/.*\.(js|css)$/,
  new CacheFirst({ cacheName: "static-v1", plugins: [
    new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 86400 }),
  ]})
);
registerRoute(
  /\/api\/config/,
  new StaleWhileRevalidate({ cacheName: "api-swr" })
);
\`\`\`

实际案例：语雀文档的离线方案是策略组合的范例：文档 HTML 用 NetworkFirst（3 秒超时回退缓存，地铁弱网下直接给缓存版本秒开），编辑器静态资源 CacheFirst（hash 指纹天然安全），文档内容 API 用 SWR（先展示缓存的旧内容，后台拉新后 UI 提示"内容已更新"）。上线后离线/弱网场景的崩溃率下降 76%。反面案例：某团队把用户信息 API 也配了 CacheFirst，用户改头像后 24 小时内看到的都是旧头像——API 数据用 CacheFirst 必须配主动失效机制（如版本号或 maxAge），否则就是数据不一致事故。

踩坑与 tradeoff：SW 的更新机制是面试必考连环坑——新 SW 文件下载后进入 waiting 状态，要等所有页面标签关闭后才 activate（用户感知到的"更新了但不生效"就是这个），skipWaiting + clients.claim() 可强制接管但要小心新旧页面与 SW 版本错配（旧页面拿着旧缓存结构、新 SW 按新结构读）；缓存命名要带版本号，activate 时清理旧版本 cache，否则 CacheStorage 无限膨胀被浏览器配额驱逐（配额满时整个源站数据可能被清，包括 IndexedDB）；预缓存（precache）列表过大拖慢 SW 安装，只预缓存 App Shell，其余运行时缓存；调试 SW 问题三件套：Application 面板看 SW 状态、勾选 Update on reload、Network 面板看请求是否走了 SW（Size 列显示 ServiceWorker）。`,
    keyPoints: ["五策略本质是新鲜度/可用性/速度权衡", "HTML NetworkFirst+静态资源 CacheFirst+配置 SWR", "SW 更新要 skipWaiting 防版本错配", "cache 命名带版本+activate 清旧"],
    followUps: ["Service Worker 更新流程（install/waiting/activate）的坑？", "CacheStorage 配额驱逐如何防御？"],
    favorited: false,
  },
  {
    id: "fe-329",
    nodeId: "fe-http-cache",
    question: "发版后用户看到旧页面，如何系统排查缓存问题？",
    bigTech: true,
    answer: `缓存排查的本质是"沿请求链路逐层定位"——浏览器缓存（memory/disk）→ Service Worker → CDN 边缘缓存 → 源站，每层都可能持有旧内容。标准动作：① 复现时用 curl -I 直接打源站（绕过全部缓存层）确认源站内容是否最新，源站就是旧的那是发布本身没成功；② curl 打 CDN 域名看响应头：X-Cache: HIT 说明命中边缘缓存，Age 值显示缓存了多久，需要 purge CDN；③ 浏览器 DevTools Network 面板看 Size 列：from disk cache/from memory cache 是浏览器层，from ServiceWorker 是 SW 层；④ Application → Service Workers 看 SW 脚本版本是否是旧版，Storage 里看 CacheStorage 残留。定位到层后对症下药：浏览器层（强缓存头配错）、SW 层（缓存策略/版本未更新）、CDN 层（TTL 过长未 purge）、发布层（资源/HTML 时序错）。

\`\`\`bash
# 逐层排查三板斧
curl -I https://origin.internal/app.js      # ① 源站直查
curl -I https://cdn.example.com/app.js       # ② CDN 层：看 X-Cache/Age
# ③ 浏览器：Network Size 列 + Application SW 状态
\`\`\`

实际案例：蚂蚁一次"发了版用户还说看到旧页面"的排查记录堪称模板：客服反馈量 200+，按层排查——源站最新（①排除）、CDN X-Cache: MISS（②排除）、新装浏览器无痕窗口访问正常（排除 CDN 和浏览器强缓存）、老用户 DevTools 里 HTML 显示 from ServiceWorker——锁定 SW 层：上一版 SW 把 HTML 配成了 CacheFirst 且无 maxAge 兜底，新 SW 虽然改了策略但旧 SW 还在控制页面（要等全部标签关闭），旧 SW 持续用旧缓存应答。修复：紧急推送一个带 skipWaiting + 清掉 HTML 缓存的 SW 版本，后续规范固化"HTML 永远 NetworkFirst + SW 更新提示用户刷新"双保险。

踩坑与 tradeoff：最常见的误判是"用户说看到旧页面"就直接 purge CDN——先做分层确认，CDN purge 全球生效有几分钟延迟，乱 purge 还会导致回源流量洪峰；DevTools 的 Disable cache 只影响浏览器 HTTP 缓存，不影响 Service Worker（SW 要单独 Bypass for network），这个开关差异坑过无数人；硬性救场手段是"缓存击穿参数"：在 HTML 引用资源的 URL 后加构建版本 query（?v=build123）并配置 CDN 缓存键包含该参数，一次发版全部缓存键失效——这是核武器，平时别用；建立"缓存配置变更审查"机制比事后排查重要：响应头改动和 SW 策略改动进同一个发布 checklist，很多缓存事故其实是配置 PR 没人 review。`,
    keyPoints: ["源站→CDN→SW→浏览器逐层定位", "X-Cache/Age/Size 列三个判断点", "SW 旧实例持续控制页面最隐蔽", "purge 前先定位，乱 purge 引发回源洪峰"],
    followUps: ["Service Worker 的 skipWaiting 使用时机和风险？", "如何设计发版时的缓存失效演练（cache busting drill）？"],
    favorited: false,
  },
  {
    id: "fe-330",
    nodeId: "fe-http-cache",
    question: "HTTP/2 和 HTTP/3 对前端资源加载与缓存策略有什么影响？",
    bigTech: false,
    answer: `HTTP/2 的核心变革是多路复用：单 TCP 连接上并行交错传输多个请求/响应流，解决了 HTTP/1.1 的队头阻塞（一个慢响应堵住后面所有请求）和连接数限制（浏览器对单域名 6 连接）。这直接废掉了一批 H1 时代的优化实践：域名分片（shard 到多个域名为绕开连接限制）变得有害（多域名多 TLS 握手，H2 单连接更优）、资源合并雪碧图/打包合并失去意义（多路复用让小文件并行成本极低，合并反而破坏缓存粒度——改一个图标整张雪碧图缓存失效）。HTTP/3 基于 QUIC（UDP 上实现可靠传输+TLS1.3 内建）：0-RTT 握手（二次访问零往返建立连接）、连接迁移（WiFi 切 4G 连接不断，靠 Connection ID 而非四元组）、传输层流级独立（某条流丢包不阻塞其他流，解决 H2 的 TCP 层队头阻塞）。

\`\`\`
H1: 6 连接 × 队头阻塞 → 域名分片/雪碧图/合并打包
H2: 单连接多路复用 → 小文件并行、缓存粒度最优化
H3: QUIC/UDP → 0-RTT、连接迁移、传输层无队头阻塞
\`\`\`

实际案例：京东将图片域名从 H1 时代的 5 个分片域名（img1-5.360buyimg.com）收拢到单域名 + H2 后，TLS 握手开销下降 60%，图片加载 P95 延迟降 25%——多路复用下并行度不再是瓶颈。另一个 H3 的真实收益案例：快手直播页面的 H3 灰度数据显示，移动网络下（丢包率 2%+ 场景）首帧时间降低 40%，核心机制就是 QUIC 的流级独立：传统 TCP 下 2% 丢包导致整条连接的所有流被重传阻塞，QUIC 下只有丢包那条流等重传。缓存策略侧的影响：H2 时代把"打包合并"改为"按路由/变更频率分 chunk"，每个 chunk 独立指纹独立缓存，变更频率低的 vendor 包缓存命中率从 60% 提升到 95%。

踩坑与 tradeoff：H2 的 server push 已被 Chrome 弃用（2022 年移除，滥用导致推送了浏览器已有缓存的资源，浪费带宽）——替代方案是 103 Early Hints（浏览器收到早期提示头后预加载关键资源，2026 年主流 CDN 均支持）；H3 不是银弹：QUIC 的用户态拥塞控制在某些设备上 CPU 开销高于内核态 TCP，且企业防火墙/运营商对 UDP 的 QoS 策略不可控，主流做法是 H2/H3 双栈 + Alt-Svc 头优雅升级，浏览器自动协商；H2 多路复用有默认流并发上限（SETTINGS_MAX_CONCURRENT_STREAMS，常见 100-256），一个页面几百个小资源仍要排队——代码分割别过度碎片化；TLS 会话复用（session resumption）和 H3 的 0-RTT 都有重放攻击面，非幂等请求（支付/下单）禁止走 0-RTT 数据。`,
    keyPoints: ["H2 多路复用废掉域名分片和雪碧图", "H3=QUIC：0-RTT/连接迁移/流级独立", "server push 已死，103 Early Hints 接班", "分 chunk 按变更频率提升缓存命中率"],
    followUps: ["HTTP/2 的 TCP 层队头阻塞是怎么回事？", "103 Early Hints 相比 server push 好在哪？"],
    favorited: false,
  },
  // ===== 新增节点题目：fe-realtime 实时通信 =====
  {
    id: "fe-331",
    nodeId: "fe-realtime",
    question: "WebSocket 的握手过程是怎样的？它和 HTTP 是什么关系？",
    bigTech: true,
    answer: `WebSocket 借 HTTP/1.1 完成握手，之后彻底脱离 HTTP 语义。握手四要素：客户端发 GET 请求带 Upgrade: websocket + Connection: Upgrade + Sec-WebSocket-Key（16 字节随机 base64）+ Sec-WebSocket-Version: 13；服务端回 101 Switching Protocols + Sec-WebSocket-Accept（把 Key 拼接固定 GUID "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" 后 SHA-1 再 base64——客户端校验这个值确认服务端真的懂 WS 协议而非偶然返回 101 的代理）。此后连接升级为全双工二进制帧通道：不再有请求/响应模型，双方随时互发，帧头最小 2 字节（对比 HTTP 头动辄几百字节），这就是为什么实时场景 WS 远优于轮询。URL scheme 是 ws:// 和 wss://（TLS），wss 走 443 能穿过绝大多数企业防火墙。

\`\`\`
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
→ HTTP/1.1 101 Switching Protocols
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

实际案例：字节飞书网页版长连接的演进很典型：早期用 HTTP 长轮询（30s 挂起），消息到达延迟平均 15s+，服务器维持海量挂起连接内存爆炸；切 WebSocket 后消息延迟降到 100ms 内，单机连接数提升 10 倍（帧协议无 HTTP 头开销，内存占用大降）。但灰度阶段发现企业客户内网防火墙会重置带 Upgrade 头的连接——降级方案必不可少：握手失败/超时 3 秒自动回退到 SSE 或长轮询，这个"渐进降级链"至今是飞书 SDK 的标配。

踩坑与 tradeoff：握手阶段是 HTTP，意味着 cookie、鉴权头可以复用——但 WS 建立后不再带 HTTP 头，鉴权 token 过期后连接不会自动断开，要自己做"服务端主动关闭 + 客户端重连带新 token"的续期机制；反向代理（Nginx）必须显式配置 proxy_set_header Upgrade/Connection 并调大 proxy_read_timeout（默认 60s 无流量就断，心跳间隔要小于它），否则连接莫名被切；WS 没有内置跨域限制（不遵循 CORS！），服务端必须校验 Origin 头防跨站劫持（CSWSH 攻击）；帧分片（FIN 位 + opcode）和 Ping/Pong 控制帧是协议自带的，但应用层消息完整性（粘包拆包）要自己设计——WS 是流式帧协议不是消息协议，这个认知差是新手第一个 bug 的根源。`,
    keyPoints: ["借 HTTP 握手升级 101，之后脱离 HTTP", "Sec-WebSocket-Accept=Key+GUID 的 SHA-1", "帧头最小 2 字节，全双工", "WS 不遵循 CORS，服务端要校验 Origin"],
    followUps: ["为什么 WebSocket 不受同源策略限制？如何防 CSWSH？", "Nginx 反代 WebSocket 需要哪些配置？"],
    favorited: false,
  },
  {
    id: "fe-332",
    nodeId: "fe-realtime",
    question: "WebSocket 心跳机制和断线重连如何设计才健壮？",
    bigTech: true,
    answer: `心跳的必要性：TCP 连接在无数据时无法感知"假死"——NAT 网关空闲超时（常见 2-5 分钟清映射表）、运营商中间设备断链、对端进程崩溃，TCP 层都不会立刻通知应用层，连接看起来 Established 实际已不通。心跳设计三要素：间隔（25-30s 是业界甜点，小于 NAT 超时又不太频繁）、方向（浏览器 WS API 无法发送协议层 Ping 帧，必须应用层心跳：发 {type:"ping"} 等服务端 pong）、超时判定（发 ping 后 5-10s 没收到 pong 就主动 close 触发重连，别等 TCP 超时）。重连设计三要素：指数退避（1s/2s/4s/8s 封顶 30s，避免服务端重启时被重连风暴打死）、随机抖动（退避时间 ±25% 随机化，防止所有客户端同步重连）、状态机（手动 close 不触发重连，区分"用户主动断开"与"异常断开"，code 1000 正常关闭不重连）。

\`\`\`ts
class RobustWS {
  private retry = 0; private heartbeat?: number; private manualClose = false;
  connect() {
    this.ws = new WebSocket(URL);
    this.ws.onopen = () => {
      this.retry = 0;
      this.heartbeat = setInterval(() => this.ping(), 25000);
    };
    this.ws.onclose = (e) => {
      clearInterval(this.heartbeat);
      if (this.manualClose || e.code === 1000) return;
      const delay = Math.min(1000 * 2 ** this.retry++, 30000) * (0.75 + Math.random() * 0.5);
      setTimeout(() => this.connect(), delay);
    };
  }
}
\`\`\`

实际案例：滴滴司机端 H5 的心跳参数是经过实测调优的：移动网络下 NAT 超时实测最短 4 分钟（某省运营商），但考虑电量（心跳唤醒射频模块耗电），最终定 4.5 分钟应用层心跳 + 服务端 10 分钟无消息主动断开。重连侧曾踩过"重连风暴"坑：一次服务端滚动重启，上万客户端同时收到断开事件，都按 1s 固定间隔重连，新实例刚起来就被打满——加入指数退避 + 全抖动（full jitter）后，重连请求被均匀摊在 30s 窗口内，重启恢复时间从 5 分钟降到 40 秒。

踩坑与 tradeoff：心跳太勤费电（移动端射频唤醒是耗电大头），太懒检测慢——iOS 上 WKWebView 对 JS 定时器有后台节流，页面切后台心跳会停，要监听 visibilitychange 在回前台时立即探活一次；重连后必须恢复会话状态：重新订阅频道、用 lastEventId 拉取断线期间的消息（服务端要缓存最近 N 条），否则重连成功但消息丢了等于白连；双开检测别忽略：同一账号两个标签页各连一条 WS，服务端要踢旧连接或做连接合并，不然消息双份推送、客户端状态互相打架；弱网环境下 WebSocket 帧也可能乱序到达吗？——不会，TCP 保证有序，但"应用层重连补发"和"旧连接残余消息"可能交错，需要消息 seq 去重，这是从心跳重连自然延伸到的可靠性设计。`,
    keyPoints: ["心跳防 NAT 假死，浏览器只能应用层心跳", "指数退避+全抖动防重连风暴", "code 1000/手动关闭不重连", "重连后要补拉断线消息+重订阅"],
    followUps: ["移动端后台节流对心跳的影响与对策？", "重连后如何恢复消息连续性（lastEventId 机制）？"],
    favorited: false,
  },
  {
    id: "fe-333",
    nodeId: "fe-realtime",
    question: "SSE（Server-Sent Events）和 WebSocket 有什么区别？如何选型？",
    bigTech: true,
    answer: `SSE 是基于普通 HTTP 的单向推送：客户端 EventSource 发起请求，服务端回 Content-Type: text/event-stream 并保持连接不断，随时写入 data: {...}\\n\\n 格式的帧。与 WS 的本质差异：① 方向——SSE 只能服务端→客户端单向，客户端想说话得另外发普通 fetch；WS 全双工。② 协议——SSE 就是 HTTP，天然过代理/防火墙/CDN，自带 HTTP 语义（cookie/缓存/状态码）；WS 是独立协议，基础设施支持参差不齐。③ 重连——SSE 浏览器原生自动重连（默认 3s），且支持 Last-Event-ID 断线续传；WS 要手写整个重连逻辑。④ 数据格式——SSE 只支持 UTF-8 文本；WS 支持二进制帧。⑤ 连接数——SSE 在 HTTP/1.1 下受浏览器单域名 6 连接限制，HTTP/2 下靠多路复用解决。⑥ 实现成本——SSE 服务端就是"不结束的 HTTP 响应"，任何框架 10 行搞定。

\`\`\`js
// SSE 客户端：自动重连+断点续传开箱即用
const es = new EventSource("/api/stream");
es.onmessage = (e) => render(JSON.parse(e.data));
es.addEventListener("done", () => es.close());
// 服务端（Node）：就是不关的 HTTP 响应
res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
res.write(\`data: \${JSON.stringify(chunk)}\\n\\n\`);
\`\`\`

实际案例：ChatGPT 及国内所有大模型对话产品的流式输出都用 SSE（而非 WebSocket）——选型逻辑完美契合 SSE 的甜区：用户发一条消息（普通 POST）→服务端持续吐 token（单向流）→流结束连接关闭。双向需求为零，WS 的双工能力纯属浪费；且 SSE 过企业代理的通过率远高于 WS（很多公司内网拦 Upgrade 头），ToB 产品这点是决定性的。反例是协同编辑（Figma/腾讯文档）：多人光标位置要高频互发（双向+低延迟+二进制优化），必须 WS/WebRTC，SSE 单向通道干不了。

踩坑与 tradeoff：SSE 的"自动重连"是双刃剑——服务端主动结束流后浏览器还会傻乎乎重连，要发特定事件（如 event: close）让客户端 es.close()；HTTP/1.1 下 SSE 长连接占满 6 连接配额后，页面其他请求全部排队（真实事故：某监控大屏开 2 个 SSE 标签页后页面加载卡死），生产环境 SSE 必须配 HTTP/2；Nginx 反代要关 buffering（proxy_buffering off）加 X-Accel-Buffering: no，否则流式数据被攒在代理缓冲区，"流式"变"一次性"；Last-Event-ID 续传要求服务端缓存历史消息，内存成本高，大模型场景通常放弃续传（流断了就重新生成）；移动网络下 SSE 没有心跳标准，要自己发注释行（: ping\\n\\n）防代理断连。`,
    keyPoints: ["SSE=HTTP 单向流，WS=独立协议全双工", "SSE 自动重连+Last-Event-ID 原生续传", "大模型流式输出是 SSE 甜区", "H1 下 SSE 占连接配额，必须 H2"],
    followUps: ["为什么 ChatGPT 类应用选 SSE 而不是 WebSocket？", "Nginx 反代 SSE 需要哪些配置？"],
    favorited: false,
  },
  {
    id: "fe-334",
    nodeId: "fe-realtime",
    question: "WebRTC 建立 P2P 连接的过程是怎样的？信令、ICE、STUN/TURN 各扮演什么角色？",
    bigTech: false,
    answer: `WebRTC 是浏览器内置的 P2P 实时音视频/数据通道协议栈，建连四步：① 信令交换（Signaling）：双方通过任意信道（通常是 WebSocket）互换 SDP offer/answer——SDP 描述各自支持的编解码、媒体格式、传输参数；WebRTC 故意不定义信令协议，把灵活性留给应用层。② ICE 候选收集：每个端通过 host（本机 IP）、srflx（STUN 服务器反射出的公网 IP:端口）、relay（TURN 服务器中继地址）三种方式收集候选地址，经信令通道互换。③ 连通性检查：ICE 框架按优先级对候选地址两两打洞（UDP 打洞穿越 NAT），找到可达路径。④ DTLS 握手加密 + 媒体/数据通道建立。STUN 解决"我在公网眼里是谁"（轻量查询），TURN 解决"打洞实在打不通"（对称 NAT 场景，流量全走服务器中继，带宽成本高，是兜底）。

\`\`\`js
const pc = new RTCPeerConnection({ iceServers: [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "turn:turn.example.com", username: "u", credential: "p" },
]});
pc.onicecandidate = ({ candidate }) => candidate && ws.send({ type: "ice", candidate });
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
ws.send({ type: "offer", sdp: offer });  // 信令通道互换，之后 ICE 打洞
\`\`\`

实际案例：腾讯会议的网页版实践说明了 TURN 的现实地位：纯 P2P 理想很丰满，但企业网常见对称 NAT（每次映射端口都变）+ UDP 封锁，实测 P2P 打洞成功率约 70-80%，剩下 20-30% 必须走 TURN 中继——所以商业 RTC 产品的成本模型里 TURN 带宽是大头，"边缘 TURN 节点部署密度"直接决定弱网体验。另一个前端侧案例：WebRTC DataChannel 做游戏联机（无需音视频的纯数据 P2P），某派对游戏 H5 用 DataChannel 传操作指令，延迟从走服务器的 120ms 降到 P2P 的 35ms，但同样要准备 TURN 兜底 + 失败时降级到 WebSocket 中继。

踩坑与 tradeoff：localhost 调试一切正常、上真机全挂是 WebRTC 第一坑——host candidate 在 NAT 后毫无意义，没有 STUN/TURN 配置就是同网段玩具；ICE 重启（iceRestart）在网络切换（WiFi→4G）时必须触发，WebRTC 没有像 QUIC 那样的连接迁移，不断线重协商就会卡死；Safari 的 WebRTC 实现长期有坑（H.264 强制、DataChannel 兼容），跨端音视频务必用 adapter.js 抹平；P2P 省服务器带宽是双刃剑——大规模会议（>6 人）全网状 P2P 上行带宽爆炸（n-1 路上传），必须用 SFU（Selective Forwarding Unit，服务器只转发不转码）架构，这就回到"服务器中转"了，所谓 P2P 在小规模通话才是真相；DataChannel 默认不可靠无序（可配 reliable/ordered），游戏指令用不可靠模式降延迟，文件传输必须可靠模式。`,
    keyPoints: ["信令换 SDP，ICE 收集候选打洞", "STUN 查公网地址，TURN 中继兜底", "对称 NAT 场景 TURN 是刚需成本", "多人场景 SFU 架构取代全网状 P2P"],
    followUps: ["对称 NAT 为什么打洞必失败？", "SFU 和 MCU 架构的区别与成本对比？"],
    favorited: false,
  },
  {
    id: "fe-335",
    nodeId: "fe-realtime",
    question: "轮询、长轮询、SSE、WebSocket 四种实时方案的对比与降级链如何设计？",
    bigTech: true,
    answer: `四维对比。实时性：WS（毫秒级双向）> SSE（毫秒级单向）> 长轮询（秒级，消息到达时若正好没有挂起请求要等下一轮）> 轮询（取决于间隔，分钟级）。服务器成本：WS/SSE 维持长连接（内存 = 连接数 × 缓冲区），长轮询是"挂起的 HTTP"同样占连接但更费（每次消息都要重建请求），轮询连接成本最低但 QPS 高（10 万客户端 30s 轮询 = 3333 QPS 空请求）。兼容性/穿透性：轮询 = 长轮询 > SSE > WS（Upgrade 头被企业代理拦的概率最高）。基础设施：轮询/长轮询吃尽 HTTP 生态（CDN/缓存/负载均衡零改造），SSE 要代理关 buffering，WS 要 LB 支持协议升级且不能简单轮询负载（连接亲和性 sticky session）。降级链设计：WS → SSE → 长轮询 → 短轮询，每级探测失败自动降一级并定期尝试升级。

\`\`\`ts
async function connect() {
  if (await tryWebSocket(3000)) return startWS();          // 3s 握手超时降级
  if (await trySSE(3000)) return startSSE();
  return startLongPolling();                                // 兜底：30s 挂起
}
// 每 5 分钟悄悄探测 WS 是否恢复，恢复则静默升级
\`\`\`

实际案例：钉钉网页版消息通道的降级策略：默认 WebSocket；检测到企业代理拦截（握手 3s 超时）降 SSE；SSE 也被拦（极少数代理对长连接 HTTP 也超时截断）降长轮询（挂起 25s）；以上全挂（IE 时代遗产）降 5s 短轮询。每层降级都上报埋点，运营后台能看到"全公司有多少用户被迫轮询"，某次发现某大客户全员走长轮询，推动客户网管放行 WS 后服务器成本降一半。另一个反向教训：早期版本没有"升级回探"，一次运营商网络抖动让几万用户掉进轮询后再没回来，空跑了一周 QPS 成本。

踩坑与 tradeoff：长轮询的实现细节决定生死——服务端挂起请求要设超时（25-30s，小于 LB 空闲超时），超时返回空响应客户端立即重发，否则 LB 先断连客户端拿到 truncated response；挂起期间消息到达要立刻返回（别攒批），客户端收到响应要立刻发起下一轮（间隙就是消息盲区）；轮询的"看起来的简单"有隐性成本：etag/304 可以减少空轮询的带宽，但数据库查询压力一点没少，热点数据要配服务端缓存；降级链的探测顺序要按用户环境记忆（localStorage 记录上次成功的通道），企业网用户不用每次都先试 WS 失败 3 秒；别忘了电量：移动端高频轮询是电量杀手，降级到轮询时把间隔拉长到业务可接受的最低频。`,
    keyPoints: ["实时性/成本/穿透性三角权衡", "降级链 WS→SSE→长轮询→短轮询", "长轮询挂起超时<LB 空闲超时", "降级要记忆+静默回探升级"],
    followUps: ["长轮询服务端如何实现挂起与唤醒？", "WebSocket 的负载均衡为什么需要 sticky session？"],
    favorited: false,
  },
  {
    id: "fe-336",
    nodeId: "fe-realtime",
    question: "实时消息系统如何保证消息可靠性？ACK、去重、有序、幂等分别怎么实现？",
    bigTech: true,
    answer: `WebSocket 底层 TCP 保证"连接内"可靠有序，但应用层可靠性要自建——连接断开、服务端重启、客户端崩溃期间的消息都会丢。四件套设计：① ACK 确认：客户端收到消息后回 {ack: msgId}，服务端未收到 ACK 的消息在超时后重发（at-least-once 语义，代价是可能重复）；② 去重：每条消息带全局唯一 msgId（服务端发号，如 snowflake），客户端维护已处理 msgId 集合（LRU 存最近几千条），重复消息直接丢弃——ACK+去重组合实现"恰好一次"效果；③ 有序：消息带单调递增 seq（按会话维度），客户端发现 seq 跳号（收到 105 时上次是 102）说明中间丢了，主动拉取 103-104 补洞；④ 幂等：写操作（发送消息/点赞）带客户端生成的 requestId，服务端对重复 requestId 返回首次结果而非重复执行——重试不产生副作用。

\`\`\`ts
// 客户端可靠接收骨架
const seen = new LRUSet<string>(5000);
let lastSeq = 0;
ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);
  ws.send(JSON.stringify({ ack: msg.msgId }));          // ① ACK
  if (seen.has(msg.msgId)) return; seen.add(msg.msgId); // ② 去重
  if (msg.seq > lastSeq + 1) await fetchMissed(lastSeq, msg.seq); // ③ 补洞
  lastSeq = Math.max(lastSeq, msg.seq);
  render(msg);
};
\`\`\`

实际案例：企业微信的消息可靠性协议简化版即此模型：服务端为每个会话维护 seq 序列，客户端本地持久化 lastSeq，重连后上报 lastSeq，服务端差量推送缺失消息（类似 Kafka 的 offset 消费语义）；ACK 超时 5s 重发最多 3 次仍失败则标记"未达"，转为离线消息等下次登录拉取。反例教训：某客服系统初版没做幂等——用户点"发送"后网络抖动，客户端 3s 没收到响应自动重试，结果同一句话发出两条，客服侧看到重复消息以为是用户刷屏。加 requestId 幂等后解决：重试命中服务端已处理的 requestId，直接返回首次的 msgId。

踩坑与 tradeoff：at-least-once + 去重是业界标准答案，别追求传输层"恰好一次"（两阶段提交在移动网络下不现实）；ACK 的粒度有讲究——逐条 ACK 在高频消息场景（直播弹幕每秒千条）信令开销爆炸，可以批量 ACK（每 100 条或每秒一次，ack 最大 seq）；msgId 发号器是分布式系统的经典难题，snowflake 时钟回拨要处理，小系统用 UUID 牺牲有序性换取零协调；seq 补洞拉取接口要做限流和最大窗口（一次最多补 200 条，更多则走全量同步），防止恶意客户端用补洞接口拖垮服务端；客户端持久化 lastSeq 用 IndexedDB 异步写，注意"渲染了但 lastSeq 没落盘就崩溃"的边界——宁可重放消息（去重兜底）不可跳号。`,
    keyPoints: ["TCP 只保连接内可靠，应用层要 ACK+重发", "msgId 去重把 at-least-once 变恰好一次", "seq 跳号主动补洞", "写操作 requestId 幂等防重试副作用"],
    followUps: ["为什么分布式消息 ID 常用 snowflake？时钟回拨怎么办？", "批量 ACK 和逐条 ACK 如何取舍？"],
    favorited: false,
  },
  {
    id: "fe-337",
    nodeId: "fe-realtime",
    question: "WebSocket 高频消息下的背压（backpressure）问题如何处理？",
    bigTech: false,
    answer: `背压是"生产速度 > 消费速度"时的流量控制问题。WS 场景：服务端每秒推 1000 条行情/弹幕，客户端渲染只能消化 100 条，消息在 JS 层堆积——onmessage 回调排队、内存上涨、UI 假死。TCP 层有内建背压（接收窗口 rwnd 满了通知发送方减速），但 WS 应用层消息一旦 deliver 给 JS 就脱离了 TCP 背压管辖——bufferedAmount 属性只能看"客户端→服务端"方向的发送积压（要控制发送速率时检查 bufferedAmount < 阈值再 send），接收方向没有 API，必须应用层自建。客户端侧三板斧：① 采样/合并——高频更新只保留最新值（股票行情同一代码每秒 50 次报价只渲染最后一次，中间丢弃）；② 批量渲染——消息先入数组缓冲，rAF 回调里一次性 flush（每帧最多渲染 N 条）；③ 限流降级——缓冲区超阈值时通知服务端降频（应用层 flow control 消息）。

\`\`\`ts
// 缓冲+rAF 批量渲染+自适应采样
const buf: Tick[] = [];
ws.onmessage = (e) => {
  const tick = JSON.parse(e.data);
  const i = buf.findIndex(t => t.code === tick.code);
  if (i >= 0) buf[i] = tick; else buf.push(tick);  // 同代码只留最新
  if (buf.length > 5000) buf.splice(0, buf.length - 5000); // 硬上限防 OOM
};
function flush() {
  if (buf.length) render(buf.splice(0));  // 每帧一次 DOM 更新
  requestAnimationFrame(flush);
}
\`\`\`

实际案例：某币圈行情站点的真实事故：BTC 剧烈波动时服务端推送频率从每秒 50 涨到 2000，客户端 onmessage 里直接 React setState 逐条渲染，3 分钟后页面内存 1.2GB 崩溃。治理分三层：渲染层改 Canvas 绘制（表格 DOM 改 canvas，单帧渲染成本从 80ms 降到 4ms）；数据层同代码报价合并（90% 的消息被合并丢弃）；协议层加 flow control——客户端检测到缓冲超阈值就发 {slowDown: true}，服务端降采样到 10 次/秒推送。三层下来 CPU 从 95% 降到 20%。

踩坑与 tradeoff：发送方向的 bufferedAmount 检查有坑——它是"已交给 WS 但还没进 TCP 缓冲区"的字节数，判断时机要异步（send 后立即查是同步增长的），且浏览器实现有差异（Safari 历史版本不更新该值）；丢弃策略必须业务对齐：行情可以丢中间态（只关心最新价），聊天消息一条都不能丢（只能排队不能采样），日志流可以丢但要在服务端标记"此处有丢失"（否则排查问题误以为日志断了）；服务端侧的背压同样存在——Node WS 服务端向慢客户端发送时 socket 缓冲区膨胀拖垮整个进程，成熟的库（uWebSockets.js）会按客户端分组限速甚至主动断开"拖累全局"的慢消费者；监控指标必须前置：缓冲区长度、丢弃率、flush 延迟埋点上报，背压问题在用户感知前就该告警。`,
    keyPoints: ["接收方向无 API，背压要应用层自建", "采样合并/批量渲染/服务端降频三板斧", "bufferedAmount 只覆盖发送方向", "丢弃策略必须对齐业务语义"],
    followUps: ["TCP 接收窗口（rwnd）如何实现传输层背压？", "Node WS 服务端如何防御慢消费者拖垮进程？"],
    favorited: false,
  },
  {
    id: "fe-338",
    nodeId: "fe-realtime",
    question: "大模型流式输出（SSE / fetch ReadableStream）前端如何高效渲染？",
    bigTech: true,
    answer: `2026 年 AI 应用的标准形态：POST 发起对话，响应体是 text/event-stream 流，服务端逐 token 推送，前端边收边渲染"打字机"效果。技术栈两种：EventSource（简单但不支持 POST/自定义头，基本被淘汰出 AI 场景）和 fetch + ReadableStream（支持 POST/鉴权头，主流方案）。流解析要点：reader.read() 返回 Uint8Array 块，块边界任意切分——一个 data: 帧可能被拆到两个块里，必须维护字符串缓冲区按 \\n\\n 分隔符切帧，帧不完整就等下一块。渲染优化三招：① 节流 setState——token 到达频率（每秒 50-200 个）远超渲染需求，缓冲区攒 50-100ms 批量 setState 一次，或直接用 useSyncExternalStore/外部 store 绕过 React 渲染队列；② Markdown 增量解析——全量 re-parse 是 O(n²)，用增量解析器或只在段落边界（双换行）重解析已完成段落，进行中的段落纯文本渲染；③ 自动滚动——新内容到底部时跟随滚动，用户上翻则暂停跟随（滚动位置判定 + ResizeObserver）。

\`\`\`ts
const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ prompt }) });
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
let buffer = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += value;
  const frames = buffer.split("\\n\\n");
  buffer = frames.pop()!;                       // 半帧留到下轮
  for (const f of frames) {
    if (f.startsWith("data: ")) appendToken(f.slice(6));
  }
}
\`\`\`

实际案例：Kimi 网页版的渲染管线实测数据：直接每 token setState 时，长回答（4000 token）场景 React 渲染 4000 次，主线程占用 90%+，输入框卡顿；改 100ms 攒批后渲染次数降到 1/20，打字机效果肉眼无差别。另一个工程细节是 Markdown 代码块的特殊处理：流式输出中代码块未闭合时（三个反引号的开始围栏已出现、结束围栏还没到），全量解析会把后续所有内容吞进代码块——方案是解析前检测未闭合围栏，临时补上闭合符再解析（业内称"补尾解析"），显示效果稳定且不影响后续增量。

踩坑与 tradeoff：fetch 流式读取在部分安卓 WebView（老版本 Chromium）不支持 ReadableStream——要降级到 XHR onprogress（responseText 增量读取，记录已处理长度切片）或 EventSource+GET 方案；SSE 帧里的 data: [DONE] 是 OpenAI 风格约定不是协议标准，解析逻辑要对齐所用模型服务商的帧格式；流中断处理是产品体验分水岭：网络断开时已生成的内容要保留并提示"继续生成"（带上上文重发请求），而不是整个回答消失；长回答自动滚动时如果用户在阅读历史内容，强制滚动到底部是体验灾难——"跟随滚动只在贴底时激活"是必备交互；token 渲染如果带代码高亮（highlight.js/shiki），高频调用高亮是性能黑洞，代码块闭合前只做轻量染色或纯文本，闭合后再完整高亮。`,
    keyPoints: ["流块边界任意，缓冲区按 \\n\\n 切帧", "token 攒批渲染防 setState 风暴", "未闭合代码块要补尾解析", "贴底跟随+上翻暂停的滚动策略"],
    followUps: ["为什么 AI 对话场景 EventSource 不够用？", "Markdown 增量解析还有哪些边界情况（表格/列表）？"],
    favorited: false,
  },
  {
    id: "fe-339",
    nodeId: "fe-realtime",
    question: "WebSocket 在弱网和移动端环境下面临哪些挑战？如何优化？",
    bigTech: false,
    answer: `移动端弱网对 WS 是五连击：① 连接存活难——NAT 超时（2-5 分钟）、基站切换、WiFi/4G 切换都会静默断链，TCP 层无感知；② 后台节流——iOS 上 JS 定时器在后台被冻结，心跳停摆，回前台时连接已死但应用还以为活着；③ 耗电——长连接阻止基带休眠，心跳频率是电量与实时性的直接 tradeoff；④ 协议开销敏感——弱网带宽宝贵，JSON 文本帧的体积浪费被放大；⑤ 重连成功率低——弱网下握手本身可能多次超时，固定重试策略会在"永远连不上"的场景空转耗电。优化矩阵：心跳间隔动态化（根据网络类型 WiFi 25s/4G 4.5min，Network Information API 辅助判断）、visibilitychange 联动（回前台立即探活重连）、消息协议二进制化（Protobuf/MessagePack 替代 JSON，体积降 60-80%）、重连加预算（弱网场景最多重试 N 次后转轮询或提示用户）。

\`\`\`ts
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") ws.pingNow(); // 回前台立即探活
});
// 二进制协议：Protobuf 编码后帧体积为 JSON 的 1/4
const frame = Message.encode({ seq, body }).finish();
ws.send(frame);
\`\`\`

实际案例：美团骑手端 Web 长连接的优化数据：心跳从固定 30s 改为按网络类型动态调整（WiFi 30s/4G 270s）后，骑手端日均电量消耗降 8%，消息到达延迟 P95 仅从 1.2s 升到 1.8s（业务可接受）。另一个经典案例是微信网页版的教训：早期版本在 iOS Safari 后台被杀 JS 后，回前台不检测连接状态直接发消息，消息实际已发不出但 UI 显示"已发送"，造成大量"对方没收到"投诉——修复是发送前必检 readyState，非 OPEN 状态先入离线队列 + 触发重连，重连成功再补发并标记补发状态。

踩坑与 tradeoff：Network Information API（navigator.connection）的兼容性在 2026 年仍是 Chromium 系专属，Safari/Firefox 拿不到网络类型——降级策略是用历史 RTT 数据推断网络质量（心跳 RTT 连续超阈值判定弱网）；二进制协议省下流量但牺牲可调试性，DevTools 里二进制帧不可读，开发环境要保留 JSON 模式开关；iOS 的 PWA/添加到主屏场景对长连接更不友好（独立进程生命周期更激进），核心消息必须有"拉取兜底"——进入会话时全量同步一次最新消息，别全押推送通道；多标签页共享一条 WS（SharedWorker 或 BroadcastChannel 转发）能省连接数和电量，但 SharedWorker 的 Safari 支持在 2026 年仍不完整，备选方案是选一个标签页当"主连接持有者"（localStorage 竞选锁）；别忽视 IPv6-only 网络（部分校园网/新运营商），DNS 解析和 STUN 地址都要兼容。`,
    keyPoints: ["NAT 超时/后台节流/耗电/协议开销/重连成功率五连击", "心跳按网络类型动态化", "回前台立即探活+发送前检 readyState", "Protobuf 二进制帧省 60-80% 体积"],
    followUps: ["多标签页共享 WebSocket 的方案与兼容性？", "弱网下如何用历史 RTT 推断网络质量？"],
    favorited: false,
  },
  // ===== 新增节点题目：fe-design-patterns 前端设计模式 =====
  {
    id: "fe-340",
    nodeId: "fe-design-patterns",
    question: "观察者模式和发布订阅模式的区别是什么？前端有哪些真实应用？",
    bigTech: true,
    answer: `区别在"耦合度"：观察者模式里 Subject 直接持有观察者列表并逐个调用 update（双方互相知道对方存在，同步调用）；发布订阅多了一层事件中心（Broker），发布者 emit 到频道、订阅者 on 频道，双方互不知道对方——解耦更彻底但调试链路更长（"谁发的、谁在听"要靠日志追）。前端的真实应用遍地都是：观察者——Vue2 的响应式系统（Dep 持Watcher 列表，Dep 就是 Subject，Watcher 就是 Observer，数据变化时 dep.notify() 直接调 watcher.update）、MutationObserver、RxJS 的 Subject；发布订阅——Node 的 EventEmitter、Redux 的 store.subscribe、postMessage、Mitt/TinyEmitter 这类 200 字节的事件库、Vue3 组件间通信的 emit。

\`\`\`ts
// 观察者：Subject 直持观察者，同步逐个通知
class Dep {
  private subs = new Set<Watcher>();
  depend(w: Watcher) { this.subs.add(w); }
  notify() { this.subs.forEach(w => w.update()); }  // 直接调用，知道对方
}
// 发布订阅：中间商赚差价（解耦）
const bus = {
  map: new Map<string, Set<Fn>>(),
  on(ev: string, fn: Fn) { /* ... */ },
  emit(ev: string, data: unknown) { this.map.get(ev)?.forEach(fn => fn(data)); },
};
// 发布者和订阅者只认识 bus，互不认识
\`\`\`

实际案例：微前端架构里跨应用通信的经典选择就是发布订阅——主应用不 import 子应用任何模块（那是构建时耦合，违背微前端初衷），而是约定一个全局 eventBus（qiankun 的 initGlobalState 本质就是带状态快照的发布订阅），订单应用 emit("cart:updated")，商品应用 on("cart:updated") 刷新推荐位。反面案例：某中后台项目滥用全局 EventBus 替代 props 传递，三个月后没人说得清一个事件有几处监听、触发顺序是什么，一次重构漏改监听名导致功能静默失效——事件总线的解耦是以"显式依赖变隐式依赖"为代价的。

踩坑与 tradeoff：发布订阅最大的坑是内存泄漏——组件销毁忘了 off，回调里持有组件引用，SPA 路由切换十几次后同一事件挂着十几个僵尸回调，重复请求、重复弹窗、内存上涨三连；用 AbortSignal 或封装 useEventBus hook 在组件卸载时自动 off 是现代解法；同步发布订阅会让"一次 emit 触发连环 emit"形成事件瀑布，排查时用事件名全局搜索 + 打埋点日志是基本生存技能；选型建议：父子组件通信用 props/emit（显式），跨层级用 provide/inject 或状态库（可追踪），只有真正"广播且不关心谁听"的场景（埋点、全局通知、微前端通信）才上事件总线。`,
    keyPoints: ["观察者直接互知，发布订阅经 Broker 解耦", "Vue 响应式=观察者，EventEmitter=发布订阅", "忘 off 是内存泄漏头号来源", "解耦的代价是依赖关系隐式化"],
    followUps: ["Vue3 的响应式（Proxy+effect）还算观察者模式吗？", "如何用 AbortSignal 管理事件订阅的生命周期？"],
    favorited: false,
  },
  {
    id: "fe-341",
    nodeId: "fe-design-patterns",
    question: "策略模式如何消除前端的大量 if-else/switch？举个真实业务例子。",
    bigTech: true,
    answer: `策略模式把"可互换的算法族"各自封装成策略对象，运行时按 key 选取执行，替代按条件分支堆叠的 if-else。前端收益不只是"少几个分支"：新增策略只需注册新条目（开闭原则），每个策略可独立测试，条件逻辑从"n 层嵌套 if"变成"查表 dispatch"。典型场景：表单校验规则、支付方式路由、导出格式处理、主题/皮肤切换、A/B 实验分桶。反模式是策略退化——策略表里每个函数又写成一坨 if-else，等于换了个地方堆。

\`\`\`ts
// 反例：新增一种导出格式要改两个 switch，漏一个就出 bug
function exportData(type: string, data: Row[]) {
  if (type === "csv") { /* ... */ } else if (type === "xlsx") { /* ... */ }
}
// 策略表：新增格式只加一行注册，调用方零改动
const exporters: Record<string, (rows: Row[]) => Blob> = {
  csv: (rows) => new Blob([toCsv(rows)], { type: "text/csv" }),
  xlsx: (rows) => new Blob([toXlsx(rows)], { type: "application/vnd.ms-excel" }),
  pdf: (rows) => toPdf(rows),
};
const exportData = (type: string, rows: Row[]) =>
  (exporters[type] ?? exporters.csv)(rows);
\`\`\`

实际案例：有赞微商城的订单列表页有 20+ 种订单状态（待付款/待发货/拼团中/退款中…），每种状态对应的操作按钮组、状态徽标颜色、跳转逻辑都不同。早期代码是一个 300 行的 switch，产品每加一种状态类型就要在 5 个 switch 里各加 case，漏改率极高，测试全靠人肉回归。重构为策略配置表：statusConfig: Record<OrderStatus, { actions: Action[]; badge: string; route: string }>，新状态只加配置项，并写了 schema 校验——配置缺字段时构建期报错，相关缺陷归零。这就是"数据驱动 UI"的本质：策略表其实是 DSL。

踩坑与 tradeoff：策略模式的滥用信号是"每个策略只有一行代码"——为三分支的 if 建策略表是过度设计，判断标准：分支数 ≥4、分支逻辑独立演化、不同分支被不同需求驱动时才值得抽；策略表放模块级常量还是运行时注册（register API）有讲究：库代码用注册机制（插件化，如 rollup 插件、webpack loader 都是策略注册），应用代码用静态表（可 tree-shake、IDE 可跳转）；策略 key 的类型安全用 TS 的 satisfies Record<Status, Strategy> 锁死，避免"加了枚举值忘了加策略"在运行时才炸；策略内共享的上下文（如用户权限、AB 分组）用工厂函数闭包注入，别用 this 魔法。`,
    keyPoints: ["查表 dispatch 替代条件分支", "开闭原则：新策略只注册不改调用方", "分支≥4 且独立演化才值得抽", "TS satisfies 锁死策略表完整性"],
    followUps: ["策略模式和状态模式的区别？", "库代码的插件注册机制（如 Rollup）是不是策略模式？"],
    favorited: false,
  },
  {
    id: "fe-342",
    nodeId: "fe-design-patterns",
    question: "装饰器模式在前端有哪些真实应用？TS 装饰器和 HOC 是什么关系？",
    bigTech: true,
    answer: `装饰器模式的核心是"不改原对象结构，通过包装叠加能力"——输入一个函数/类/组件，输出增强了日志、缓存、权限、埋点等横切能力的新版本。前端三大真实载体：① 高阶组件 HOC（React 生态的装饰器：withAuth(withLogging(Component))，每层包装加一种能力，洋葱模型）；② 高阶函数工具（lodash 的 once/memoize/debounce 全是装饰器——拿原函数返回增强函数）；③ TS 装饰器语法（@observable、@bound、NestJS/Angular 的 @Injectable/@Get——本质是把元编程包装写成声明式标注，TS 5.0 已支持 2023-11 版标准装饰器，与旧的 experimentalDecorators 语义不同）。axios 拦截器、Koa/Express 中间件是同一思想的"责任链变体"。

\`\`\`ts
// 高阶函数装饰器：埋点能力叠加到任意函数
const withTrack = <F extends Fn>(fn: F, event: string): F =>
  ((...args: unknown[]) => { track(event); return fn(...args); }) as F;
const save = withTrack(realSave, "btn_save_click");
// HOC 装饰组件：权限+加载态
const withAuth = (C: FC) => (p: P) => useAuth() ? <C {...p} /> : <Login />;
// TS 标准装饰器（2023-11）：方法级增强
function logged(_t: unknown, _k: string, d: PropertyDescriptor) { /* 包装原方法 */ }
\`\`\`

实际案例：Ant Design Pro 的权限组件生态就是装饰器链：页面组件 export default withAuth(withLayout(withErrorBoundary(Page)))，每层职责单一可独立测试。另一个大规模应用是 Sentry SDK 的侵入方式——它不让你改代码，而是启动时装饰 window.fetch、XMLHttpRequest、console.error，透明叠加监控能力，这是装饰器模式"对调用方透明"特性的极致运用。MobX 的 @observable 曾是 TS 装饰器最著名用户，其迁移史（legacy 实验装饰器→TC39 标准装饰器）也是前端观察标准演进的最佳样本。

踩坑与 tradeoff：HOC 的著名陷阱：① 嵌套地狱——五层 HOC 后 props 来源无法追溯，displayName 全是 withX(withY(...))，DevTools 里调试痛苦；② ref 黑洞——HOC 包装的组件 ref 指向包装层而非原组件，要 React.forwardRef 逐层穿透；③ 静态方法丢失——原组件的静态属性不会自动拷贝到包装后组件（要 hoist-non-react-statics）。这些问题正是 Hooks 取代 HOC 的原因：useAuth() 在函数体内组合能力，没有包装层级——可以说 Hooks 是 React 对装饰器模式的"函数式回答"。TS 装饰器的坑：新旧两版语义不兼容（legacy 的 @dec 在类定义时执行，标准的在类定义后、可访问 initializer），混用库要确认它们编译目标哪一版；装饰器执行顺序是从下到上（洋葱包裹），@A @B class 实际先执行 B——顺序写反导致依赖关系错乱的 bug 极难查。`,
    keyPoints: ["包装叠加能力，不改原结构", "HOC/HOF/TS 装饰器是同一思想三载体", "Hooks 是对 HOC 痛点的函数式回答", "TS 新旧装饰器语义不兼容"],
    followUps: ["Hooks 为什么能替代大部分 HOC 场景？", "TS 标准装饰器（2023-11）和实验版的核心差异？"],
    favorited: false,
  },
  {
    id: "fe-343",
    nodeId: "fe-design-patterns",
    question: "代理模式在前端的应用：ES6 Proxy 如何改变了框架设计？",
    bigTech: true,
    answer: `代理模式用"替身"拦截对原对象的访问，在拦截点注入自定义逻辑。ES6 Proxy 是语言级代理：new Proxy(target, handler) 可拦截 get/set/has/deleteProperty/apply 等 13 种操作，这直接改写了前端框架的响应式历史——Vue2 用 Object.defineProperty 递归劫持属性（缺陷：监听不到新增/删除属性、数组下标和 length 变化，才有了臭名昭著的 Vue.set 和数组变异方法补丁）；Vue3 换 Proxy 后，新增属性、删除、数组任意操作全部天然可追踪，且是"惰性代理"（访问到才递归包，不再启动时全量递归），大对象初始化性能提升一个量级。Proxy 的其他杀手级应用：immer 的不可变更新（代理 draft 拦截所有写入，产出不可变副本）、MobX 的响应式、表单库的字段级订阅、安全的沙箱对象（微前端 qiankun 的 Proxy 沙箱）。

\`\`\`js
// Vue3 响应式骨架：get 收集依赖，set 触发更新
const reactive = (obj) => new Proxy(obj, {
  get(t, k, r) { track(t, k); return isObj(t[k]) ? reactive(t[k]) : t[k]; },
  set(t, k, v) { t[k] = v; trigger(t, k); return true; },
  deleteProperty(t, k) { delete t[k]; trigger(t, k); return true; }, // Vue2 做不到
});
// immer：写"可变代码"，产出不可变对象
const next = produce(state, (draft) => { draft.user.name = "x"; });
\`\`\`

实际案例：immer 在 Redux 生态的地位就是代理模式的胜利——Redux 要求不可变更新，手写展开运算符在深层嵌套时是灾难（...state, a: {...state.a, b: {...}}），immer 用 Proxy 拦截 draft 的写入路径，自动生成最小不可变副本，Redux Toolkit 内置后成为事实标准。另一个案例是 qiankun 的 JS 沙箱：用 Proxy 包一层 fakeWindow，子应用的 window.xxx = y 写入被拦截到沙箱自己的记录表，卸载子应用时按记录恢复——代理模式直接解决了微前端的全局污染难题，这是快照沙箱（性能差）到 Proxy 沙箱（主流方案）的演进核心。

踩坑与 tradeoff：Proxy 无法 polyfill（Babel 也救不了，它是引擎级能力），这是 Vue3 放弃 IE11 的根本原因；Proxy 代理的是"对象"不是"值"——基本类型、Date、Map/Set 需要特殊处理（Vue3 对 Map/Set 用 collectionHandlers 单独代理其方法）；identity 坑：reactive(obj) !== obj，同一份数据裸对象和代理对象混用会导致 watch 失效、Map 键不匹配，Vue3 为此提供 toRaw/markRaw；性能不是免费的——Proxy 的每次属性访问都有拦截开销，密集计算场景（表格万级单元格逐格响应式）要权衡粒度，Vue3 的答案是 shallowRef + 手动 triggerRef；Proxy 撤销（Proxy.revocable）可构建"一次性权限对象"，在插件沙箱场景很有用但鲜为人知。`,
    keyPoints: ["Proxy 拦截 13 种操作，defineProperty 只拦 get/set", "Vue3 响应式/immer/qiankun 沙箱三大应用", "无法 polyfill，Vue3 弃 IE11 的根因", "代理对象与原对象 identity 不同"],
    followUps: ["immer 的 Proxy draft 如何产出最小不可变副本？", "qiankun Proxy 沙箱如何处理 window 的写入与恢复？"],
    favorited: false,
  },
  {
    id: "fe-344",
    nodeId: "fe-design-patterns",
    question: "适配器模式在前端的应用场景？接口数据适配为什么要单独一层？",
    bigTech: false,
    answer: `适配器模式把"不兼容的接口"翻译成"系统期望的接口"，前端最典型的战场是 API 数据层：后端返回的数据结构（蛇形命名、嵌套层级、枚举数字码、日期字符串）和前端视图模型（驼峰、扁平、语义化枚举、Date 对象）几乎从不一致。如果在组件里直接消费原始响应，后端字段一改名，几十个组件连环爆炸。适配层（常叫 API layer/transform layer/anti-corruption layer 防腐层）集中做三件事：字段映射与命名转换、类型与格式归一（时间戳→Date、状态码→枚举）、容错兜底（字段缺失给默认值、脏数据过滤）。它本质是用 DDD 的"防腐层"思想保护前端领域模型不被后端 API 变更污染。

\`\`\`ts
// 后端返回：蛇形+数字枚举+秒级时间戳
interface ApiOrder { order_id: string; status: 1 | 2 | 3; create_time: number; user_info: { nick_name: string } }
// 适配层：一处翻译，全局受益
const adaptOrder = (raw: ApiOrder): Order => ({
  id: raw.order_id,
  status: statusMap[raw.status] ?? "unknown",      // 未知状态码兜底
  createdAt: new Date(raw.create_time * 1000),
  userName: raw.user_info?.nick_name ?? "匿名",     // 脏数据兜底
});
\`\`\`

实际案例：携程一个酒店详情页对接三个数据源（自营 API、供应商 A、供应商 B），三家的房型数据结构完全不同（自营 roomList[].price、A 家 rooms[].rate.amount、B 家嵌套三层的 product.sku.price）。早期直接在组件里写三套渲染逻辑，维护地狱。重构为适配层：每个数据源一个 adapter 函数，统一输出前端 Room 视图模型，组件只认 Room——新接供应商 C 时只加一个 adapter，组件零改动。另一个收益在联调期：后端接口未就绪时，适配层切到 mock 数据源，前端照常开发，"契约先行"得以落地。

踩坑与 tradeoff：适配层最大的争议是"是否值得"——项目只有一个简单 API 时适配层是过度设计，判断信号：数据源 ≥2、后端字段风格与前端冲突、接口还在频繁变动期，满足任一条就建；适配层放前端还是 BFF 有讲究：BFF 聚合多个微服务时适配应在 BFF 完成（前端拿即用数据），纯前端项目才在前端做，别把两层的适配重复做一遍；运行时校验（zod/io-ts）是适配层的现代搭档——在适配函数里 schema.parse(raw)，接口契约被破坏时立刻报错而非静默渲染 undefined，把"后端改字段前端白屏"变成"前端监控立刻告警"；性能注意：大列表（万级）逐条适配的序列化成本可观，必要时惰性适配（渲染到才转）或让后端直接给对的格式。`,
    keyPoints: ["防腐层思想：隔离后端变更", "字段映射/格式归一/脏数据兜底三件事", "多数据源场景适配层是刚需", "zod 运行时校验把静默白屏变告警"],
    followUps: ["适配层和 BFF 的职责边界怎么划？", "zod 校验失败时应该如何降级展示？"],
    favorited: false,
  },
  {
    id: "fe-345",
    nodeId: "fe-design-patterns",
    question: "迭代器模式和 Generator 在前端有什么用？为什么说它们是异步编程的隐形基石？",
    bigTech: false,
    answer: `迭代器模式提供"统一接口遍历聚合对象，不暴露内部结构"——ES6 把这一模式语言化：可迭代协议（Symbol.iterator）+ 迭代器协议（next() 返回 {value, done}），for...of、展开运算符、解构赋值、Array.from 全部建立在它之上。Generator（function*）是"可暂停的迭代器工厂"：yield 把函数切成多个执行点，每次 next() 推进一段，执行权在调用者和生成器之间往返（协程 coroutine 的雏形）。它奠定异步基石的史实：async/await 出现之前，co 库用 Generator+Promise 实现了"同步写法跑异步"——yield 一个 Promise，co 自动等它 resolve 再把结果塞回生成器继续执行；async/await 本质就是"语言内置的 co + Generator 语法糖化"，Babel 转译 async 函数的产物就是 Generator 驱动器（regeneratorRuntime）。

\`\`\`js
// 自定义可迭代对象：分页数据源的统一消费
const paged = (fetcher) => ({
  async *[Symbol.asyncIterator]() {
    let page = 1;
    while (true) {
      const { items, hasMore } = await fetcher(page++);
      yield* items;
      if (!hasMore) return;
    }
  },
});
for await (const user of paged(fetchUsers)) render(user); // 消费方不关心分页
\`\`\`

实际案例：Redux-Saga 是 Generator 工程化应用的巅峰——把副作用（请求/延时/竞态）写成 Generator 函数，yield 的是"副作用描述对象"（call/put/takeEvery），Saga 运行时逐个解释执行。这套设计的杀手锏是可测试性：测试时逐条 next() 断言 yield 的描述对象即可，完全不用 mock 网络——effect 即数据，执行即解释器，这是迭代器模式+解释器模式的组合拳。另一个案例：虚拟滚动的大数据流处理，用 async generator 包装 IndexedDB 游标读取，渲染层 for await 消费，内存恒定（不一次读全表），十万条记录的导出功能流畅完成。

踩坑与 tradeoff：Generator 的执行权手动控制是把双刃剑——它能实现 async 做不到的"惰性求值"（数据不消费就不计算，处理无限序列/大文件的天然结构），但也意味着没人 next() 它就永远停着，协作式而非抢占式；Generator 没有原生取消语义——for await 提前 break 会触发 return() 清理，但手写循环忘了清理会挂起异步资源（游标/连接不释放）；for await...of 的错误处理容易踩坑：生成器内部 throw 会传播到消费循环，但"生成器已 return 后还 next()"静默返回 {done: true} 不报错，调试时疑惑"为什么后半段没执行"；性能上，热路径（每帧调用的工具函数）别用 Generator——next() 的对象分配和状态机切换比直接循环慢，它是"结构化异步/惰性"的利器，不是通用循环替代品。`,
    keyPoints: ["可迭代协议统一 for...of/解构/展开", "Generator=可暂停函数=协程雏形", "async/await 是 Generator 的语法糖化", "惰性求值+无限序列是独有甜区"],
    followUps: ["co 库如何用 Generator 模拟 async/await？", "Redux-Saga 为什么测试友好（effect 即数据）？"],
    favorited: false,
  },
  {
    id: "fe-346",
    nodeId: "fe-design-patterns",
    question: "责任链模式在前端的应用：中间件、拦截器、表单校验有什么共同结构？",
    bigTech: false,
    answer: `责任链模式让请求沿处理器链传递，每个处理器决定"处理、拒绝、还是传给下一个"——发送方不知道最终谁处理，处理器可动态增删。前端的共同结构是洋葱模型：请求穿过层层中间件到达核心，响应再原路返回（Koa 的 compose 是最优雅的实现：await next() 之前是请求阶段，之后是响应阶段）。三大应用：① 服务端中间件（Express/Koa 的 app.use：日志→鉴权→限流→业务，每层可短路）；② HTTP 拦截器（axios 的 request/response interceptor：请求链注入 token/签名，响应链统一处理 401 刷新 token、错误码归一化）；③ 表单校验管道（async-validator 把每个字段的多条规则串成链，逐条执行直到失败或全过）。共同点：链节点职责单一、可独立测试、顺序敏感、可中断。

\`\`\`ts
// Koa compose 骨架：洋葱模型的核心 20 行
function compose(mws: Middleware[]): Middleware {
  return (ctx, next) => {
    const dispatch = (i: number): Promise<void> =>
      i === mws.length ? (next?.() ?? Promise.resolve())
        : Promise.resolve(mws[i](ctx, () => dispatch(i + 1)));
    return dispatch(0);
  };
}
// axios 响应拦截：401→刷新 token→重放原请求，业务层无感知
\`\`\`

实际案例：axios 的 401 自动续期是企业项目的标配责任链：响应拦截器捕获 401 → 调用刷新接口拿新 token → 用新 token 重放原请求 → 返回给业务层，全程业务无感知。这里的高级细节是并发场景：同时 5 个请求都拿到 401，不能触发 5 次刷新——要用"刷新中的 Promise 单例"（第一个 401 发起刷新，后续 401 等待同一个 Promise），这是责任链+单例+Promise 缓存的组合题，面试常被追问。另一个案例：表单引擎把"必填→格式→长度→远程唯一性"校验串成链，本地规则全过才发远程校验（省请求），任一失败即短路返回错误信息。

踩坑与 tradeoff：中间件的顺序就是语义——鉴权放在日志前，未授权请求连日志都不记；限流放在鉴权后，恶意登录尝试消耗的是鉴权资源而非限流配额，顺序写错安全防线形同虚设；Koa 的 await next() 忘写 await 是经典 bug——下游异步错误不被捕获，响应阶段逻辑在错误发生后照样执行，出"返回了 200 但 body 是错误页"的灵异现象；拦截器里修改共享对象（如直接改 config 引用）会污染重放逻辑，重放请求前要用原始配置快照；责任链 vs 策略模式的选型：多个处理器"都可能参与处理"用责任链（管道），"只选一个处理"用策略（路由），把表单校验写成策略表（只跑第一条规则）是常见误用；链条过长时调试困难，给每个中间件加名称和耗时日志是生产可观测性的底线。`,
    keyPoints: ["洋葱模型：请求进响应出，可短路", "401 续期=责任链+单例 Promise 缓存", "顺序即语义，await next() 不可省", "多选参与用链，单选路由用策略"],
    followUps: ["Koa compose 如何保证异步错误正确冒泡？", "并发 401 时如何用 Promise 单例防止重复刷新？"],
    favorited: false,
  },
  {
    id: "fe-347",
    nodeId: "fe-design-patterns",
    question: "单例和工厂模式在前端的应用与陷阱？模块系统是不是天然单例？",
    bigTech: false,
    answer: `单例模式保证"全局唯一实例+全局访问点"。前端语境下 ES Module 就是天然单例机制：模块首次 import 时求值并缓存，后续所有 import 拿到同一模块实例——所以 export const store = createStore() 即单例，无需写 class Singleton 那套 Java 遗产。显式单例仍有场景：跨包共享（两个 npm 包版本不一时各自打包了一份模块，模块级单例失效，要挂 globalThis/window 兜底）、延迟初始化（首次访问才创建的重资源对象）。工厂模式按输入创建对象而不暴露构造细节：React 的 createElement 就是超级工厂（按 type 字段产出不同 Fiber），组件库的主题工厂（createTheme(light/dark)）、请求实例工厂（createAxios({ baseURL }) 产出预配置实例）都是日常。

\`\`\`ts
// 跨包单例：挂 globalThis 防多版本并存
export function getGlobalStore(): Store {
  const g = globalThis as { __APP_STORE__?: Store };
  return (g.__APP_STORE__ ??= createStore());
}
// 工厂：预配置请求实例
export const createApi = (base: string) => {
  const ins = axios.create({ baseURL: base, timeout: 5000 });
  ins.interceptors.request.use(injectToken);
  return ins;
};
\`\`\`

实际案例：微前端架构里"主应用和子应用共享同一个 React 实例"是生死问题——如果子应用打包了自己的 React，两份 React 并存会导致 Hooks 报错（Invalid hook call，内部 dispatcher 状态分裂）。qiankun/Module Federation 的标准解法就是把 React 声明为 singleton 共享依赖（MF 配置 shared: { react: { singleton: true } }），本质是强制单例。另一个工厂案例：富文本编辑器的"按配置生成编辑器实例"（工具栏按钮组合/插件列表/快捷键映射都是工厂参数），同一页面渲染 5 个不同配置的编辑器，工厂模式让每处调用只传配置不传类。

踩坑与 tradeoff：模块单例的陷阱在构建环节——Webpack/Rollup 打包时若同一包被 resolve 出多个版本（依赖提升不一致），模块级单例立刻分裂成两个实例，症状是"store 里明明有数据，组件读到 undefined"，排查靠 npm ls react 查版本树；SSR 场景模块单例是事故源——Node 进程里模块缓存跨请求共享，用户 A 的状态泄漏给用户 B，SSR 的单例必须按请求作用域重建（每请求创建 store 实例，注入 context）；单例+测试的组合拳：模块单例在测试间会互相污染，工厂函数（每次创建新实例）才是可测试设计，所以"应用运行时单例、测试时工厂重建"是标准姿势，DI 容器（tsyringe/inversify）把这层抽象化；全局单例的隐性耦合在大型项目里会发酵——导入即执行的模块副作用让 tree-shaking 失效、启动顺序不可控，优先用"显式初始化的工厂+context 注入"，单例只留给真正全局唯一的资源（eventBus、全局配置、监控 SDK）。`,
    keyPoints: ["ESM 模块即天然单例", "多版本并存时挂 globalThis 兜底", "SSR 单例必须按请求作用域重建", "测试友好性：运行时单例+测试工厂重建"],
    followUps: ["Module Federation 的 shared singleton 如何工作？", "为什么 SSR 应用里模块级单例会泄漏用户数据？"],
    favorited: false,
  },
  {
    id: "fe-348",
    nodeId: "fe-design-patterns",
    question: "前端什么时候不该用设计模式？如何避免过度设计？",
    bigTech: true,
    answer: `设计模式是"被反复验证的问题-方案对"，不是装饰简历的贴纸。前端的过度设计有五个典型信号：① 为一次性脚本建抽象层（运营活动页活两周，配齐策略+工厂+观察者全家桶）；② 三个分支的 if-else 硬抽策略表（读者要跳三个文件才能看懂原来三行能写完的逻辑）；③ 提前面向"想象中的变化"（"万一以后要多主题"于是上了完整主题引擎，三年后主题还是两套）；④ 模式套娃（Factory 生产 Builder 构建 Strategy 包装 Decorator，每层都"合理"，合起来没人懂）；⑤ 用模式对抗框架范式（在 React 里手写观察者管理组件刷新，而不是用 state——框架自带的范式通常就是该场景的最优模式实现）。判断标准只有一个：当前真实存在的复杂度是否需要这层抽象来管理。

\`\`\`ts
// 过度设计：为两个状态写状态机库
const machine = createMachine({ idle: { TOGGLE: "active" }, active: { TOGGLE: "idle" } });
// 恰如其分：一个 useState 就是答案
const [active, setActive] = useState(false);
// 需要模式：20 种状态、状态迁移有约束、要可视化审计 → XState 登场
\`\`\`

实际案例：重构反例教材：某后台系统列表页，原代码 200 行直白逻辑（fetch+render+几个 if），被"架构升级"成 Entity 层/Repository 层/Service 层/ViewModel 层四层 DDD 架构，文件从 1 个变 14 个。半年后业务改版（需求变化率极高的运营后台），每改一个字段要穿透四层，开发效率反而降 60%，最终回退到两层（API 适配+组件）。另一个正面案例：石墨文档的协同编辑核心用命令模式（Command Pattern）实现 undo/redo——每个编辑操作封装成带 execute/undo 的命令对象入栈，这是模式用在"真复杂度"上的典范：undo 语义天然要求"操作可逆可回放"，没有命令模式就要靠快照 diff，内存和正确性都崩。

踩坑与 tradeoff：YAGNI（You Aren't Gonna Need It）和"预留扩展点"的张力是永恒的——工程上的解法是"小步抽象"：第一次写死，第二次容忍重复，第三次出现时才抽模式（Rule of Three），此时你对变化方向的判断有实证支撑；模式的成本要算认知账：团队平均水平决定可用模式的上限，引入 Saga/状态机前先想"新同事三天内能否上手改 bug"；框架趋势在帮你"消化"模式——React Hooks 消化了 HOC/RenderProps，Vue 组合式函数消化了 mixin，现代状态库消化了 Flux 样板，追新框架特性的性价比常常高于手写模式；代码评审时的试金石问题："删掉这层抽象，最坏会怎样？"答案是"重复三行"就别建，答案是"改动要穿透二十处"就值得。`,
    keyPoints: ["模式管理真实复杂度，不管理想象复杂度", "Rule of Three：第三次重复才抽象", "团队认知上限决定模式上限", "删层测试：最坏结果决定抽象价值"],
    followUps: ["YAGNI 和预留扩展点如何平衡？", "哪些前端场景是命令模式/状态机的真甜区？"],
    favorited: false,
  },
  {
    id: "fe-349",
    nodeId: "fe-micro-frontend",
    question: "微前端到底解决什么问题？什么场景该用、什么场景是过度设计？",
    bigTech: true,
    answer: `微前端是把单体前端按业务域拆成可独立开发、独立部署、独立运行的多个应用，运行时由主应用（壳工程）按需加载组合。它解决的核心问题不是技术而是组织：① 团队扩张后的协作瓶颈——几十人改同一个应用，CI 排队、发版互相等待、代码冲突天天有；② 技术栈异构——老系统 jQuery/AngularJS 要和新 React 系统共存于同一页面，整体重写成本不可接受；③ 独立交付与爆炸半径控制——各业务线按自己节奏发版，一个子应用崩溃不拖垮全站。注意它从不解决性能问题，反而通常引入性能成本（多套框架运行时、重复依赖、沙箱开销）。

\`\`\`ts
// qiankun 主应用注册子应用：组织边界的代码化表达
import { registerMicroApps, start } from "qiankun";
registerMicroApps([
  { name: "order", entry: "//cdn.example.com/order/", container: "#subapp",
    activeRule: "/order" },          // 订单团队独立交付
  { name: "goods", entry: "//cdn.example.com/goods/", container: "#subapp",
    activeRule: "/goods" },          // 商品团队独立交付
]);
start({ sandbox: { experimentalStyleIsolation: true } });
\`\`\`

实际案例：阿里中后台（蚂蚁体验技术部是 qiankun 的诞生地）是最大甜区——几百个业务系统、几十个团队、技术栈横跨十年，微前端让"平台壳 + 业务插件"成为唯一可行解；字节的抖音电商后台同样按域拆分独立发版。反例同样真实：某 6 人创业公司跟风拆出 3 个子应用，结果每个跨域需求都要改壳工程 + 联调三个仓库，部署从 1 次变 4 次，半年后合并回单体，效率反而提升——拆分的收益没兑现，固定成本先吃掉了团队。

踩坑与 tradeoff：微前端是康威定律的映射——组织结构不独立，应用拆了也白拆，判断标准是"子应用是否有独立团队、独立发布节奏、独立业务边界"，三个缺两个就别拆；成本清单要前置算清：公共依赖治理、样式隔离、跨应用通信、监控归因、新人认知门槛，这些是每次开发都要还的"分布式税"；渐进路径更稳——先模块联邦共享组件、后应用拆分，或先 iframe 物理隔离、再 qiankun 收编，一步到位的"大拆"几乎必翻车。`,
    keyPoints: ["解决组织协作/异构栈/独立交付，不解决性能", "判断三要素：独立团队+独立发版+独立边界", "拆分是康威定律映射，组织不独立白拆", "固定成本：依赖治理/通信/监控/认知税"],
    followUps: ["微前端和 monorepo 是什么关系？能互相替代吗？", "如何从单体渐进演进到微前端而不中断业务？"],
    favorited: false,
  },
  {
    id: "fe-350",
    nodeId: "fe-micro-frontend",
    question: "qiankun 的 JS 沙箱是如何实现隔离的？各代沙箱的差异是什么？",
    bigTech: true,
    answer: `qiankun 沙箱三代演进，核心是"拦截子应用对 window 的读写"：① SnapshotSandbox（快照沙箱）——子应用激活时遍历 window 存一份快照，运行期间不做拦截，卸载时再次遍历 window 与快照对比，把新增/修改的全局量还原，只支持单实例（遍历整个 window 是 O(n) 且无法多份并存）；② LegacySandbox——用 Proxy 代理 window，set 操作记录到 addedMap/modifiedMap，卸载时按记录回滚，仍是单实例；③ ProxySandbox（多实例沙箱，当前默认）——每个子应用发一个 fakeWindow 普通对象，Proxy 拦截所有读写：读先查 fakeWindow 再落到真 window，写只写 fakeWindow，子应用的全局变量永远不触达真 window，多个子应用各自持有独立 fakeWindow 可同时存活。同时 import-html-entry 会把子应用脚本包成 (function(window){...})(proxy) 形态，让脚本内的 window 引用全部指向代理。

\`\`\`ts
// 简化版 ProxySandbox 核心
class ProxySandbox {
  fakeWindow = {};
  proxy: Window;
  constructor() {
    this.proxy = new Proxy(window, {
      get: (target, key) =>
        key in this.fakeWindow ? this.fakeWindow[key] : target[key],
      set: (target, key, value) => { this.fakeWindow[key] = value; return true; },
    });
  }
}
\`\`\`

实际案例：主子应用都往 window 挂全局量是隔离失效的重灾区——某电商后台三个子应用各自定义 window.__STORE__，无沙箱时后挂载的应用直接覆盖前者，订单页读到商品页的 store 数据串单；接入 ProxySandbox 后各写各的 fakeWindow 相安无事。另一个案例是判断环境：qiankun 注入的 window.__POWERED_BY_QIANKUN__ 就放在 fakeWindow 上，子应用据此决定是否独立 render 还是暴露生命周期钩子。

踩坑与 tradeoff：沙箱只隔离 JS 全局状态，不隔离副作用——setInterval、addEventListener、直接 document.body.appendChild 的游离 DOM 照样泄漏，qiankun 用 patcher 记录定时器/事件在卸载时清理，但手动 append 的 DOM 要靠 mount/unmount 钩子自律；逃逸通道存在：new Function("return window")()、iframe.contentWindow、以及 document.defaultView 都能拿到真 window，安全敏感场景别依赖沙箱做安全边界；性能成本真实可测——Proxy 拦截每次全局访问，大表格高频读全局配置的场景有 5%~10% 开销；Vite 兼容坑：Vite dev 模式原生 ESM 让 import-html-entry 无法劫持脚本执行，需 vite-plugin-qiankun 或生产构建验证先行。`,
    keyPoints: ["三代：快照→记录回滚→Proxy fakeWindow 多实例", "读写拦截：读先查 fake，写只写 fake", "不隔离副作用：定时器/事件/游离 DOM 靠 patcher", "逃逸通道存在，沙箱不是安全边界"],
    followUps: ["为什么 SnapshotSandbox 无法支持多实例？", "子应用里 eval/new Function 的 window 指向哪里？"],
    favorited: false,
  },
  {
    id: "fe-351",
    nodeId: "fe-micro-frontend",
    question: "微前端的样式隔离方案有哪些？为什么 Shadow DOM 反而少用？",
    bigTech: true,
    answer: `CSS 天生全局无作用域，隔离方案按强度分五档：① 命名约定——BEM 或统一 namespace 前缀（.app-order-*），配合 Stylelint 规则强制，成本最低靠纪律；② CSS Modules/CSS-in-JS——编译期 hash 或运行时唯一类名，应用内隔离完美，跨应用仍可能撞第三方库的全局样式；③ qiankun experimentalStyleIsolation——给子应用所有选择器编译期加属性前缀（div[data-qiankun="order"]），本质是 scope 提升优先级，但对 append 到 body 的全局弹窗失效（弹窗 DOM 在子应用容器外，选择器够不着）；④ strictStyleIsolation——Shadow DOM 彻底隔离，内外样式互不可见；⑤ 运行时动态插拔——qiankun 默认行为：子应用卸载时移除其 style/link 标签，保证"不运行的应用不留样式"，这是基线而非隔离。

\`\`\`css
/* experimentalStyleIsolation 编译结果示意 */
/* 子应用原始样式 */
.title { color: red; }
/* 转换后：只在子应用容器内生效 */
div[data-qiankun="order"] .title { color: red; }
/* 但 Modal 挂在 body 下，吃不到这条规则 → 样式丢失 */
\`\`\`

实际案例：Shadow DOM 翻车是行业集体记忆——蚂蚁内部实践里 antd 的 Modal.confirm、message 等挂 document.body 的组件在 Shadow DOM 下样式全丢，富文本编辑器（依赖 document.execCommand 和全局选区）、第三方 SDK（地图/支付弹窗）也批量阵亡，最终主流中后台全部退回 experimentalStyleIsolation + 命名约定双保险。另一个典型事故：某子应用引入的 CSS reset 写了 * { margin: 0; box-sizing: border-box }，无 scope 直接污染主应用导航，全站布局错位——此后 Stylelint 增加"禁止通配符和裸标签选择器"规则。

踩坑与 tradeoff：Shadow DOM 是理论最完美、工程最贵的方案——隔离彻底但破坏一切"依赖 document 全局查找"的生态库，适配成本远高于收益；CSS 变量是漏网之鱼——定义在 :root 的变量不受属性 scope 影响照样全局，设计令牌必须加前缀（--order-color-primary）；@font-face 和 iconfont 也是全局资源，两个子应用同名 iconfont 类会互相覆盖，要各自改名；样式顺序敏感——后挂载子应用的样式表插在更后方，同优先级规则后者赢，升级 UI 库大版本时特异性战争高发，建议子应用样式统一加一层优先级容器。`,
    keyPoints: ["五档：约定/Modules/属性 scope/Shadow DOM/动态插拔", "属性 scope 对 body 级弹窗失效", "Shadow DOM 杀死全局查找类生态库", "CSS 变量/@font-face/iconfont 不受 scope 约束"],
    followUps: ["experimentalStyleIsolation 的实现原理是什么？", "CSS 变量的设计令牌在微前端下如何治理？"],
    favorited: false,
  },
  {
    id: "fe-352",
    nodeId: "fe-micro-frontend",
    question: "Module Federation 的原理是什么？shared 依赖协商如何工作？",
    bigTech: true,
    answer: `Module Federation（MF）是 Webpack 5 / Rspack 的内置能力，让每个构建产物既可当宿主（host）也可当远程（remote）。三个核心概念：① exposes——远程应用声明对外暴露的模块（如 ./Button、./utils），构建时生成 remoteEntry.js（模块清单 + 异步加载运行时）；② remotes——宿主声明远程模块地址，运行时先拉 remoteEntry.js 解析清单，再按需动态 import 对应 chunk，对业务代码透明（就像 import 本地模块）；③ shared——声明共享依赖（react、react-dom、antd），运行时做版本协商：宿主已加载且版本满足语义化范围就直接复用单例，不满足才加载远程自带的副本；singleton: true 强制全站唯一实例，版本冲突时直接报错而非降级。MF 与 qiankun 的本质区别：它只做模块分发与依赖共享，不做沙箱隔离。

\`\`\`ts
// 远程应用（rspack 配置）
new ModuleFederationPlugin({
  name: "order",
  filename: "remoteEntry.js",
  exposes: { "./OrderList": "./src/OrderList" },
  shared: { react: { singleton: true, requiredVersion: "^18.2.0" }, "react-dom": { singleton: true } },
});
// 宿主消费：import OrderList from "order/OrderList" —— 像本地模块一样
\`\`\`

实际案例：Shopify 用 MF 支撑其巨型商家后台（几十个团队模块级拼装）；字节现代中后台新系统大量采用 Rspack + MF。相比 qiankun 的本质优势在三个场景兑现：① 模块级粒度——可以只共享一个组件库/工具函数而不必加载整个子应用，某设计系统团队用 MF 把 200+ 组件直接喂给 15 个业务应用，省去 npm 发版-升级-联调循环；② 构建时契约—— exposes/remotes 是显式声明，配合类型同步方案可做编译期检查；③ 零运行时劫持——没有 Proxy 沙箱和 HTML Entry 解析，性能与原生应用无异。

踩坑与 tradeoff：shared 协商失败是头号事故源——宿主 React 18.1 而远程声明 requiredVersion ^18.2，协商破裂加载双份 React，hooks 报 Invalid hook call 且 Context 跨实例不通，排查极难（页面"部分正常"）；singleton: true 是双刃剑——保了单实例但版本不齐时直接白屏，生产策略是只对"多实例必崩"的库开 singleton；类型缺失是最大短板——远程模块天然没有 d.ts，社区方案 @module-federation/typescript 或 native-federation-typescript 做类型产物同步，跨团队流程较重；版本漂移治理——十个团队各自升级依赖，shared 协商结果随加载顺序变化而不可复现，需要 Platform 团队设定统一升级窗口和 CI 版本卡点。`,
    keyPoints: ["三概念：exposes 暴露/remotes 消费/shared 共享协商", "协商：版本满足复用单例，不满足加载副本", "与 qiankun 本质区别：管模块分发，不管沙箱", "双 React 事故：协商失败→Invalid hook call"],
    followUps: ["MF 的 shared 版本协商算法细节是什么？", "如何解决 MF 跨应用的 TypeScript 类型问题？"],
    favorited: false,
  },
  {
    id: "fe-353",
    nodeId: "fe-micro-frontend",
    question: "微前端应用之间如何做通信？各方案的耦合度如何取舍？",
    bigTech: true,
    answer: `通信方案按耦合度从低到高排列，优先用低的：① URL/路由参数——跨应用跳转的天然通道，刷新可恢复、可分享、可埋点，能用 URL 表达的 state 绝不放别处；② 事件总线——qiankun 的 initGlobalState 本质是发布订阅：主应用 setGlobalState 写入、各子应用 onGlobalStateChange 监听，松耦合但事件流难以静态追踪；③ 共享状态——主应用创建 store 通过 props 注入子应用，或 MF 场景 shared 一个 zustand/redux store 实例，强类型高可控但应用间耦合升级；④ localStorage + storage 事件 / BroadcastChannel——跨标签页也能用，受同源限制且有序列化成本；⑤ postMessage——iframe 方案的唯一通道，异步且要设计消息协议。原则一句话：数据向下走 props、事件向上走回调、平级跨域走事件、可持久化状态走 URL。

\`\`\`ts
// 主应用：创建全局状态并广播
import { initGlobalState } from "qiankun";
const actions = initGlobalState({ token: "", user: null });
// 子应用（qiankun 生命周期里拿到 actions）
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    requestInterceptor.setToken(state.token); // 登录态变化 → 刷新请求拦截器
  });
}
// MF 场景更直接：shared 一个 store 实例，两边 import 的是同一个模块单例
\`\`\`

实际案例：登录态下发是刚需场景——用户中心子应用完成登录后，订单/商品/客服子应用都要感知 token 变化，用 initGlobalState 广播、各子应用监听里刷新 axios 拦截器和用户信息缓存，一次接入全站生效。反例同样深刻：某团队把事件总线当万能胶，半年积累 40+ 种事件（refresh-list、sync-filter、close-modal……），没人画得清事件流向图，改一个事件要全文检索五个仓库，重构时把 80% 事件砍成"路由参数 + props 下发"，可维护性才救回来。

踩坑与 tradeoff：通信是微前端最大的隐藏复杂度——应用拆得越碎通信越多，分布式单体比单体更难维护，拆分前先画通信拓扑图；时序问题高发——子应用 A 发事件时 B 还没挂载，事件直接丢失，解法是主应用缓存最近一份 state、子应用 mount 时主动 getGlobalState 拉取而非干等推送；内存泄漏——onGlobalStateChange 返回的 off 必须在 unmount 调用，自己 addEventListener 的更要自己清；类型安全缺失——跨应用事件 payload 没有编译期检查，monorepo 内抽 events 契约包（zod schema + 类型导出）是最实用的解法，运行时校验兜底防脏数据扩散。`,
    keyPoints: ["耦合排序：URL < 事件总线 < 共享 store < postMessage", "数据向下 props、事件向上回调、平级走事件", "时序坑：挂载晚于事件→拉取代替等待", "契约包+zod 解决跨应用类型安全"],
    followUps: ["事件总线滥用有哪些信号？如何收敛？", "iframe 方案下如何设计 postMessage 协议？"],
    favorited: false,
  },
  {
    id: "fe-354",
    nodeId: "fe-micro-frontend",
    question: "qiankun、Module Federation、iframe、Web Components 如何选型？",
    bigTech: true,
    answer: `四者不是替代关系而是不同象限的工具，按"隔离程度 × 集成粒度"定位：iframe——隔离最彻底（JS/CSS/路由/网络/崩溃全隔离，安全边界真实存在），代价是体验割裂：路由与浏览器历史不同步、弹窗只能在自己窗口内、通信全靠 postMessage 序列化、登录态要单独维护，适合嵌入完全不可控的第三方系统（支付、地图、老 CGI 系统）；qiankun（single-spa 系）——应用级集成，HTML Entry 接入任意技术栈老项目，提供 JS/样式沙箱，改造成本低，适合"巨石应用渐进拆分、异构栈收编"；Module Federation——模块级集成，构建时契约 + 运行时共享依赖，无沙箱、性能原生，适合"同构技术栈的新系统、需要细粒度共享组件/工具"；Web Components——浏览器原生组件级隔离（Shadow DOM + Custom Elements），产物是跨框架渲染单元，适合"设计系统跨框架分发原子组件"，但 SSR 支持弱、生态薄。

\`\`\`
决策树：
要嵌入完全不可控的外部系统？        → iframe
老巨石应用要渐进拆分、技术栈异构？    → qiankun
新系统、同构栈、要共享组件库粒度？    → Module Federation
设计系统原子组件跨框架分发？          → Web Components
只是 6 人团队想"架构先进一点"？      → 都不用，回去写单体
\`\`\`

实际案例：阿里中后台主力 qiankun——历史包袱重（十年技术栈大杂烩）、需要渐进迁移，HTML Entry 一把收编；字节新中后台 + Shopify 商家后台用 MF——同构 React 栈、性能敏感、组件级共享是刚需；腾讯文档用 iframe 嵌第三方表单与外部编辑器——不可控系统的唯一体面方案；GitHub 用 Web Components（自研 Catalyst）做 UI 原子跨技术栈分发，连 Rails 页面和 React 岛都复用同一批元素。混合使用也很常见：qiankun 管应用编排、子应用内部用 MF 共享组件库，但复杂度叠加要有 Platform 团队兜底。

踩坑与 tradeoff：选型最大误区是"为技术而技术"——先确认有组织协作或异构栈的真实痛点再谈方案；iframe 的弹窗/路由问题有工程巧解（Modal 提升到主应用渲染、路由变化双向同步），协议设计好 iframe 也能有体面体验，别急着排除；MF 无沙箱意味着老项目接入要自身干净（无全局污染、无样式泄漏），接入门槛被低估；Web Components 的 SSR 与无障碍短板在企业级场景常是硬阻塞；四维评估法——隔离程度、性能成本、接入成本、通信成本，让业务方给四维度排序，答案自然浮现，不存在脱离场景的"最佳方案"。`,
    keyPoints: ["iframe：不可控外部系统嵌入", "qiankun：异构老系统渐进收编", "MF：同构新系统模块级共享", "WC：设计系统跨框架原子分发"],
    followUps: ["iframe 弹窗与路由同步的工程解法有哪些？", "MF 无沙箱如何保证老项目接入安全？"],
    favorited: false,
  },
  {
    id: "fe-355",
    nodeId: "fe-micro-frontend",
    question: "微前端如何治理公共依赖？为什么 React 必须单实例？",
    bigTech: true,
    answer: `React/Vue 这类带全局内部状态的库必须全站单实例：React 用模块级变量追踪当前渲染的 Dispatcher 和 Fiber 树，hooks（useState/useContext）执行时读的是"当前 React 副本"的内部状态；两个 React 副本共存时，组件在副本 A 的渲染里却解析到副本 B 的 Dispatcher，直接报 Invalid hook call，Context 跨副本也不互通（Provider 在 A、Consumer 读 B 的默认 context 永远是空）。治理三层：① 构建层——主应用 external 掉 react/react-dom 由主应用统一提供，子应用 webpack externals 或 MF shared singleton: true，全部复用同一模块实例；② 运行时层——import map（浏览器原生模块映射）把 react 统一指向同一 CDN URL，SystemJS/ESM 场景通用；③ 版本契约层——主应用锁定框架大版本，子应用 peerDependencies 声明兼容范围，CI 卡点校验产物里的框架指纹。

\`\`\`ts
// 方案一：webpack externals（qiankun 场景）
// 子应用构建配置
module.exports = { externals: { react: "React", "react-dom": "ReactDOM" } };
// 主应用 HTML 提前加载 React UMD → window.React 唯一实例

// 方案二：MF shared singleton
shared: {
  react: { singleton: true, requiredVersion: "^18.2.0", strictVersion: true },
  "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
}
\`\`\`

实际案例：双 React 事故几乎每家微前端团队都踩过——某子应用的 dependencies 里误留 react（本应 external 或用 peerDependencies），构建产物打包了 React 17，与主应用的 React 18 共存：子应用内所有 useContext 拿到默认值、hooks 随机报错、页面"一半正常一半疯"。排查半天，最后靠 window.__REACT_DEVTOOLS_GLOBAL_HOOK__ 里挂了两个 renderers 才发现真相。根治手段是 CI 体检：扫描各子应用产物 chunk 里的 React 指纹字符串，发现双实例直接卡发布。

踩坑与 tradeoff：singleton: true 遇版本不满足会 strict 报错——生产上宁可降级多版本也不能白屏，策略是 singleton 只给"多实例必崩"的库（react、react-dom、带全局 ConfigProvider 的 antd），纯工具库（lodash、dayjs）允许多版本共存换兼容性；externals 的隐性契约——主应用升级 React 大版本等于强制所有子应用同步升级，升级窗口需要 Platform 团队协调排期，这本身就是微前端承诺的"独立"的反面教材；Vue2/Vue3 混部比 React 更痛（响应式系统和运行时 API 完全不同，无法 singleton），现实做法是 Vue2 子应用限期迁移或物理 iframe 隔离；验证手段清单化——CI 依赖体检 + 运行时 React DevTools 副本数断言 + 灰度期错误关键字监控（Invalid hook call），三道防线缺一不可。`,
    keyPoints: ["hooks 依赖模块级 Dispatcher，双实例必崩", "治理：externals / MF singleton / import map", "singleton 只给多实例必崩的库，工具库放行", "CI 指纹扫描 + 运行时副本断言兜底"],
    followUps: ["import map 方案的浏览器兼容性如何兜底？", "Vue2/Vue3 混部为什么无法像 React 一样 singleton？"],
    favorited: false,
  },
  {
    id: "fe-356",
    nodeId: "fe-micro-frontend",
    question: "微前端落地有哪些工程坑？独立部署、联调、灰度、监控分别怎么做？",
    bigTech: true,
    answer: `微前端把"一个系统的复杂度"转移成"系统之间的复杂度"，工程配套不到位就是灾难现场。四大坑及解法：① 独立部署——子应用产物上 CDN，主应用只存注册表 manifest（子应用名 → 当前入口 URL + 版本），发版 = 更新注册表记录，主应用不发版；代价是注册表成为单点，需 CDN 缓存 + localStorage 兜底上一可用版本，注册表本身也要版本化可回滚；② 环境一致性——"我这好使线上崩"高发，因为本地主应用拉的是测试环境子应用，解法是环境切换器：主应用本地起服务，通过代理把任意子应用指向 线上/预发/本地 任意组合，URL 参数一键切换；③ 灰度与回滚——按用户/租户维度在注册表层路由版本（A 子应用给 5% 用户发 v2），回滚只动单应用；但跨应用契约变更（props、事件 schema）必须多应用锁定协同灰度，且新旧版本向后兼容至少一个发布周期；④ 监控归因——所有错误、性能、日志必须注入子应用标签（appName），错误边界兜底单应用崩溃不扩散，否则一个报错五个团队互相甩锅。

\`\`\`json
// 注册表 manifest（部署的唯一真相源）
{
  "apps": [
    { "name": "order", "entry": "//cdn.x.com/order/v2.3.1/", "version": "2.3.1",
      "gray": { "percent": 5, "fallback": "//cdn.x.com/order/v2.3.0/" } },
    { "name": "goods", "entry": "//cdn.x.com/goods/v1.8.0/", "version": "1.8.0" }
  ]
}
\`\`\`

实际案例：蚂蚁金服的发布节奏是微前端价值的最佳注脚——子应用独立发版每天几十次，主应用壳一年发不了几次；反例同样教科书级：某公司子应用 A 通过 MF 给 B 提供组件，A 改了 props 契约独立发版，B 未感知未发版，线上 B 消费新 props 直接崩溃。事故后立下铁律："契约变更双应用锁定发版 + 旧契约保留一个版本周期 + CI 契约 diff 检查"，从此该类事故归零。

踩坑与 tradeoff：预加载策略要分网络环境——qiankun prefetch 在浏览器空闲时拉子应用资源，WiFi 下体验提升明显，但弱网环境反而抢主应用关键带宽，要按 navigator.connection 动态关闭；权限与菜单必须集中下发——主应用统一鉴权后把权限树传给子应用，各管各的必然出现"看得到菜单点进去 403"的割裂体验；联调成本被普遍低估——跨应用 bug 需要同时起三四个服务，docker-compose 一键起全环境或远程环境代理是刚需基建；最大的隐性成本是认知负担——新人要理解整套编排才能改一个按钮，文档、脚手架、一站式 CLI 的投入省不得，否则微前端省下的发版时间全填进沟通黑洞。`,
    keyPoints: ["注册表 manifest 是部署真相源，要做成非单点", "环境切换器解决本地-线上组合联调", "契约变更：锁定发版+向后兼容一周期", "监控注入 appName，崩溃边界到单应用"],
    followUps: ["注册表服务的高可用方案怎么设计？", "跨应用契约的 CI diff 检查怎么落地？"],
    favorited: false,
  },
  {
    id: "fe-357",
    nodeId: "fe-monorepo",
    question: "Monorepo 和 Polyrepo 如何取舍？什么规模该上 Monorepo？",
    bigTech: true,
    answer: `Monorepo 是把多个项目/包放进同一仓库统一版本管理，Polyrepo 是每个项目独立仓库。取舍的本质是"代码共享成本"与"仓库规模成本"的对冲：Monorepo 的收益——① 原子提交：跨包改动一个 commit 完成，API 变更和调用方修改同时落地，不存在"先发包再升级"的两阶段提交；② 代码共享零摩擦：共享组件/工具直接源码引用，省掉 npm 发版-审批-升级-联调循环；③ 统一基建：一套 lint/TS 配置/CI 模板/依赖版本，工具链升级一次到位；④ 重构可见性：全局搜索替换 + IDE 跨项目跳转，大重构敢动手。Polyrepo 的收益——仓库小 clone 快、权限边界天然清晰、团队完全自治、CI 简单。规模临界点经验值：超过 3 个互相依赖的包、或 5 人以上频繁跨库改动，Monorepo 开始净赚。

\`\`\`
monorepo 典型结构（pnpm workspace + Turborepo）：
├── apps/
│   ├── web/          # 主站（Next.js）
│   └── admin/        # 管理后台
├── packages/
│   ├── ui/           # 组件库（被 apps 源码引用）
│   ├── utils/        # 工具函数
│   └── config/       # 共享 eslint/tsconfig
├── pnpm-workspace.yaml
└── turbo.json
\`\`\`

实际案例：正面——Google/Meta 单仓库支撑万人协作（自研 Piper/VFS 基建）；前端圈的 Vercel（Next.js+turborepo 本家）、React 官方仓库（react/react-dom/scheduler 同仓联动发版）都是受益者；某电商中台把 12 个仓库合并后，跨包需求交付周期从平均 9 天降到 3 天。反面——某团队 40 个包塞进单仓但没上任务编排，CI 全量构建 45 分钟，开发抱怨"改一行注释等一节课"，半年后拆回 6 个仓：只合了代码没合基建，等于把 polyrepo 的缺点和 monorepo 的缺点一起吞下。

踩坑与 tradeoff：Monorepo 不是免费的——仓库膨胀让 clone/checkout 变慢（需要 partial clone、sparse checkout 或 VFS）；CI 必须上 affected 增量构建（只构建改动影响的项目），否则构建时间随包数线性爆炸；权限模型反转——GitHub 的仓库级权限不够用，要 CODEOWNERS 按目录控权；版本哲学分歧——统一版本（lockstep，Babel 模式）vs 独立版本（changesets，React 模式）要在上车前定好；最大的失败模式是"只搬代码不建基建"：没有任务编排、缓存、依赖治理的 monorepo 就是一个更乱的 polyrepo。`,
    keyPoints: ["本质对冲：共享成本 vs 仓库规模成本", "收益：原子提交/源码共享/统一基建", "临界点：3+ 互依赖包或 5+ 人跨库改动", "失败模式：只合代码不合基建"],
    followUps: ["Monorepo 和微前端是替代还是互补关系？", "超大规模 monorepo 的 Git 性能怎么救？"],
    favorited: false,
  },
  {
    id: "fe-358",
    nodeId: "fe-monorepo",
    question: "pnpm 如何解决幻影依赖和依赖提升？workspace 协议怎么工作？",
    bigTech: true,
    answer: `npm/yarn 的扁平 node_modules 把所有依赖提升到顶层，带来两个经典病：① 幻影依赖（Phantom Dependency）——代码里 require 了一个没声明在 package.json 里的包也能跑（因为它被别的依赖提升到了顶层），某天底层依赖升级把它移走，你的代码莫名爆炸；② 分身依赖（Doppelganger）——不同版本被提升到不同层级，同包多实例共存（React 双实例事故的温床）。pnpm 的解法是"符号链接 + 硬链接"的非扁平结构：node_modules/.pnpm 下按 包名@版本 真实存储（内容寻址硬链接到全局 store，多项目共享不占双份磁盘），项目根 node_modules 只放 package.json 里显式声明的依赖符号链接，未声明的包物理上够不着——幻影依赖被目录结构本身消灭。workspace 协议（workspace:*）则解决 monorepo 内部互引：发布时 pnpm 自动把 workspace:* 替换成真实版本号。

\`\`\`
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

# packages/ui/package.json
{ "name": "@acme/ui", "dependencies": { "@acme/utils": "workspace:*" } }

# node_modules 结构（关键：只有声明的依赖可见）
node_modules/
├── .pnpm/                    # 真实文件：react@18.2.0、lodash@4.17.21...
├── react -> .pnpm/react@18.2.0/node_modules/react   # 声明过的才有链接
└── @acme/ui -> ../packages/ui                       # workspace 内部软链
\`\`\`

实际案例：Vue/Vite 官方生态、字节现代前端工程全部迁移 pnpm——最直接的动力是磁盘和安装速度（硬链接全局 store 让 monorepo 安装时间砍半以上）；更深刻的是依赖治理：某团队从 yarn 迁 pnpm 后 CI 立刻红了 30 多处——全是幻影依赖现形（代码 import 了从未声明的 dayjs/lodash，之前靠扁平提升"碰巧能跑"），这批定时炸弹如果不被 pnpm 逼出来，迟早在生产环境随机引爆。

踩坑与 tradeoff：严格性是把双刃剑——部分老包（如某些 CLI 工具）自己就有幻影依赖，在 pnpm 下直接跑不起来，要用 packageExtensions 或 public-hoist-pattern 打补丁，这是迁移期主要摩擦；符号链接的兼容坑——个别工具（老版本 metro、某些 webpack loader 配置）不跟随软链解析路径，需要 shamefully-hoist 临时退回扁平模式过渡；peerDependencies 解析更严格——pnpm 按"每个消费者的依赖闭包"隔离 peer 实例，一个包被不同版本 React 消费时会生成多份实例，行为正确但排查时要有预期；workspace 协议的发布陷阱——忘记 pnpm publish（而非 npm publish）会把 workspace:* 原样发出去导致下游安装失败，CI 里要锁死发布命令。`,
    keyPoints: ["扁平提升两宗病：幻影依赖+分身依赖", "pnpm：.pnpm 真实存储+声明才链接", "workspace:* 内部互引，发布时替换版本号", "迁移红利：幻影依赖批量现形"],
    followUps: ["pnpm 的硬链接全局 store 如何节省磁盘？", "peerDependencies 在 pnpm 下的实例隔离规则？"],
    favorited: false,
  },
  {
    id: "fe-359",
    nodeId: "fe-monorepo",
    question: "Turborepo 的任务编排（pipeline/dependsOn）如何设计？",
    bigTech: true,
    answer: `Turborepo 的核心是把 monorepo 里的任务（build/test/lint/dev）抽象成有向无环图（DAG），按依赖拓扑调度 + 并行执行。turbo.json 里的关键字段：① dependsOn——声明任务间依赖，^build 表示"先完成所有依赖包的 build"（^ 指上游包），不带 ^ 的是包内任务顺序；② inputs/outputs——声明任务的输入文件指纹与输出产物，是缓存命中的依据；③ env——显式声明影响产物的环境变量（防环境变量污染缓存）。执行时 turbo 先按 workspace 依赖图算出拓扑序，同层任务并行跑满 CPU，再逐层推进——apps/web 的 build 会等 packages/ui 和 packages/utils 的 build 完成才启动，而 ui 和 utils 互不依赖并行构建。

\`\`\`jsonc
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],          // 先构建上游依赖包
      "inputs": ["src/**", "package.json", "tsconfig.json"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["API_BASE_URL"]           // 环境变量参与缓存指纹
    },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "lint": { "dependsOn": [] },        // 无依赖，全仓并行
    "dev": { "cache": false, "persistent": true }  // 长任务不缓存
  }
}
\`\`\`

实际案例：Vercel 自家 monorepo（next.js + turbo 同仓）是最强背书——上百个包的全量 CI 从 40+ 分钟压到 5 分钟内，核心就是 DAG 并行 + 缓存命中；某内容平台团队落地时的一个关键调优：最初把 test 也 dependsOn: ["^build"]，CI 里测试总在等构建，后来发现单测跑的是 tsx 直接执行源码根本不需要构建产物，去掉这层依赖后测试与构建并行，流水线再省 8 分钟——dependsOn 声明的是"真实数据依赖"而非"想象中的顺序"。

踩坑与 tradeoff：dependsOn 声明错误是头号坑——漏了 ^build 导致消费方拿到旧产物（本地 dev 正常、CI 偶发失败的灵异事件源头），多了又串行化拖慢流水线，原则是把"文件级真实依赖"翻译成任务依赖；outputs 声明不全导致缓存恢复后缺文件——.next/cache 这类中间产物要么排除要么容忍，漏声明的生成目录会在缓存命中时"消失"；dev/watch 这类 persistent 任务不能进缓存，且 dependsOn 指向它的任务会被禁缓存（下游不可复现）；与 pnpm scripts 的关系——turbo 只编排不执行，实际命令还是各包的 package.json scripts，保持包可脱离 turbo 独立运行是良好实践（工具可替换性）。`,
    keyPoints: ["任务抽象成 DAG：拓扑调度+同层并行", "^build 跨包依赖，不带 ^ 是包内顺序", "dependsOn 声明真实数据依赖，非想象顺序", "outputs/env 是缓存正确性的边界"],
    followUps: ["persistent 任务为什么不能被缓存？", "如何排查 turbo 缓存命中异常？"],
    favorited: false,
  },
  {
    id: "fe-360",
    nodeId: "fe-monorepo",
    question: "Turborepo/Nx 的远程缓存原理是什么？为什么能跨机器复用构建产物？",
    bigTech: true,
    answer: `远程缓存的本质是"内容寻址的构建产物仓库"：任务执行前，turbo 对"决定产物的全部输入"算一个 hash——包括 inputs 声明的源文件内容、依赖包版本、环境变量、任务命令本身、Node/系统信息；hash 命中远程存储（Vercel Remote Cache 或自建 S3/HTTP 服务）就直接下载 outputs 声明的产物并恢复文件树，跳过整个构建过程，耗时从分钟级降到秒级。关键在于 hash 的输入集与机器无关：源码相同 + 依赖相同 + 命令相同，产物就被视为相同，所以同事 A 本地构建过的包，同事 B 和 CI 直接白嫖——这就是"一次构建、全队复用"。安全性上产物按 hash 隔离存储，配合签名（--remote-cache-signature）可防产物篡改。

\`\`\`bash
# 本地接入远程缓存（Vercel 托管或自建）
turbo login && turbo link
# 自建 HTTP 缓存服务只需实现两个端点：
# GET  /v8/artifacts/:hash   → 返回产物 tar 包（304/404 未命中）
# PUT  /v8/artifacts/:hash   → 上传产物
# CI 中使用：构建日志会出现 >>> FULL TURBO（全部命中）或部分 cache hit
turbo run build --summarize   # 输出各任务缓存命中率
\`\`\`

实际案例：Vercel 公布的数据是 CI 时间平均节省 70%+；某出行团队 30 个包的 monorepo 接入远程缓存后，主干 CI 从 28 分钟降到 4 分钟——最戏剧性的场景是"回滚"：revert 一个 commit 后 hash 恰好等于昨天的某个状态，整个流水线 40 秒 FULL TURBO 结束，回滚从"再构建一遍"变成"找回昨天的产物"。Nx 的思路一致但实现更重（自带计算缓存 + 分布式任务执行 Nx Cloud，可以把任务分发到多台 agent 并行）。

踩坑与 tradeoff：缓存正确性的边界是人划的——inputs 漏声明某个影响产物的文件（如 .env.production、browserslist 配置），改动它不会换 hash，产物就是错的，且"有时对有时错"极难排查，纪律是"宁多勿少"；env 声明要克制——把 CI=true 这类无关变量纳入 hash 会让 CI 永远 miss；非确定性构建是缓存天敌——产物里嵌时间戳/随机数/绝对路径（如 sourcemap 的本地路径）会导致同输入不同输出，缓存命中率永远上不去，先治理构建确定性再谈缓存；安全边界——远程缓存服务要能鉴权（产物可能含未公开代码），自研服务别忘了限速和清理策略，否则存储账单会教你做人。`,
    keyPoints: ["hash(源码+依赖+命令+env) → 命中即下载产物", "输入集机器无关 → 一次构建全队复用", "命中率三杀手：inputs 漏/env 滥/构建不确定", "回滚=找回旧产物，FULL TURBO 秒级完成"],
    followUps: ["如何治理构建确定性（时间戳/路径/随机数）？", "自建远程缓存服务的最小实现是什么？"],
    favorited: false,
  },
  {
    id: "fe-361",
    nodeId: "fe-monorepo",
    question: "Monorepo 里如何做版本管理和发布？changesets 的工作流是什么？",
    bigTech: true,
    answer: `Monorepo 发布比单仓难在"多包联动"：包 A 依赖包 B，B 发了 minor，A 要不要跟？CHANGELOG 怎么聚合？changesets 的方案是"声明式版本意图 + 发布时统一计算"：① 开发阶段——每次改动执行 pnpm changeset，交互式选择受影响的包和版本级别（major/minor/patch），生成一个 markdown 文件（.changeset/xxx.md）描述本次变更，随功能代码一起进 PR 评审；② 版本计算——发布时 changeset version 消费所有 changeset 文件：按依赖图做级联 bump（B 升 minor，依赖 B 的 A 至少升 patch），更新各包 package.json 版本、生成/合并 CHANGELOG、删除已消费的 changeset 文件；③ 发布——changeset publish 按拓扑序把"版本号与 npm 上不一致"的包依次发布，internal dependencies 的 workspace:* 替换为真实新版本。整个流程把"版本决策"从发布时刻提前到编码时刻，且每个决策都有 PR 记录可追溯。

\`\`\`bash
# 开发时：声明变更意图（进 PR）
pnpm changeset
# 生成 .changeset/tidy-pandas-jump.md:
# ---
# "@acme/ui": minor
# "@acme/web": patch
# ---
# 新增 Table 虚拟滚动；web 适配新 API

# 发布流水线（CI）
pnpm changeset version   # 计算版本+生成 CHANGELOG（产出"版本 PR"）
pnpm changeset publish   # 按拓扑序发包
\`\`\`

实际案例：React 生态大量库（TanStack 全家桶、Radix UI、astro）都用 changesets——TanStack Query 一个 monorepo 管 5 个框架适配包，核心包修复 bug 时 changesets 自动级联 bump 全部适配包 patch 版本，CHANGELOG 逐包生成且互相关联，这在手工时代是发版工程师半天的活；某公司内部组件库接入后，发版周期从"每两周集中发一次"变成"随 PR 合入即出 beta、每天正式版"，业务方拿到修复的延迟从周级降到小时级。

踩坑与 tradeoff：级联 bump 的哲学要想清楚——默认策略是"下游至少升 patch"，十几个包的仓库里一次核心包改动会引发全仓版本号"通胀"，可用 onlyUpdatePeerDependentsWhenOutOfRange 等配置收敛；snapshot/canary 发布——PR 阶段的预览包（0.0.0-pr-123-xxx）对跨团队联调是刚需，changesets 的 snapshot 命令配合 pkg.pr.new 服务可以白嫖；私有包混排——apps/ 下的应用不该发包，private: true + fixed/linked 分组配置别漏；与 git tag 的关系——changesets 默认按 包名@版本 打 tag，百包仓库 tag 爆炸，要评估是否改用 GitHub Release 聚合；最大风险是流程纪律——改动忘加 changeset 就合入，版本计算就缺了一块，CI 加"changeset 存在性检查"（对比 base 分支）是标准护栏。`,
    keyPoints: ["版本意图前置：changeset 文件随 PR 评审", "级联 bump：核心包 minor→下游至少 patch", "version 计算 + publish 按拓扑序发包", "护栏：CI 检查 changeset 存在性"],
    followUps: ["fixed/linked 分组解决什么版本耦合问题？", "snapshot 预览发布的完整链路怎么搭？"],
    favorited: false,
  },
  {
    id: "fe-362",
    nodeId: "fe-monorepo",
    question: "Monorepo 的 TypeScript 怎么配？project references 和路径映射怎么选？",
    bigTech: true,
    answer: `Monorepo 的 TS 配置要同时满足三个矛盾目标：编辑器里跨包跳转好用、tsc 类型检查快、构建产物类型正确。两套主流方案：① Project References（官方方案）——每个包一个 tsconfig，根 tsconfig 用 references 串成图，被引用包开 composite: true 生成 .d.ts 和增量元信息（tsconfig.tsbuildinfo），tsc -b 按拓扑序增量类型检查，只重查改动的包及其下游；优点是构建缓存精确、类型边界清晰（消费的是声明文件而非源码），缺点是配置繁琐、IDE 跳转默认进 d.ts 而非源码（需 publishConfig 或 declarationMap 补救）；② 路径映射（paths）——根 tsconfig 把 @acme/ui 映射到 packages/ui/src，消费方直接读源码类型，IDE 体验完美（跳转进源码、改类型即时生效），代价是每次全量类型检查、且"源码引用"绕过了包的真实构建产物（发布后用 d.ts 可能行为不一致）。实践中的主流是混合：开发期 paths 指源码保体验，CI/构建期用真实产物验证。

\`\`\`jsonc
// 方案一：project references（根 tsconfig.json）
{ "files": [], "references": [{ "path": "packages/ui" }, { "path": "apps/web" }] }
// packages/ui/tsconfig.json
{ "compilerOptions": { "composite": true, "declaration": true, "declarationMap": true, "outDir": "dist" } }

// 方案二：开发期 paths（tsconfig.dev.json）
{ "compilerOptions": { "paths": { "@acme/ui": ["../packages/ui/src"], "@acme/utils": ["../packages/utils/src"] } } }
\`\`\`

实际案例：Vercel/Next.js 模板仓库用 paths 方案（开发体验优先，配合 bundler 的 alias 双写）；大型仓库如 Azure SDK for JS 用 project references（上千个包，增量检查是刚需，全量 tsc 要几十分钟）；某金融中台的踩坑史很有代表性——初期全仓 paths 指源码，本地一切美好，直到某包构建配置改了 output 格式（ESM→双格式），paths 消费源码的应用毫无感知，发布后生产环境类型运行时不匹配批量报错，此后规矩改为"paths 只管开发，CI 必跑 tsc -b 对真实产物做类型契约校验"。

踩坑与 tradeoff：paths 的最大陷阱是"源码与产物的类型漂移"——源码类型完美不代表构建产物 d.ts 正确（dts 生成插件的 bug、exports 字段指错文件），CI 必须用真实产物链路兜底；declarationMap 是 references 方案的体验救星——让 cmd+click 从 d.ts 跳回源码；TS 5.x 的 moduleResolution: bundler 与 monorepo 更配（尊重 package.json exports 又允许无扩展名导入）；类型检查该放进 turbo 任务图——typecheck 任务 dependsOn: ["^build"]（因为消费的是上游 d.ts），缓存命中后全仓类型检查从分钟级降到秒级；别忽视 tsbuildinfo 的提交策略——它是增量检查的缓存，要么 gitignore 每次重来，要么纳入 turbo outputs 复用。`,
    keyPoints: ["references：精确增量，IDE 默认跳 d.ts", "paths：跳源码体验好，但绕过真实产物", "混合派：开发 paths + CI 真实产物校验", "typecheck 进 turbo 图，缓存复用 tsbuildinfo"],
    followUps: ["exports 字段与 types 版本（typesVersions）如何配合？", "composite 项目的增量元信息原理是什么？"],
    favorited: false,
  },
  {
    id: "fe-363",
    nodeId: "fe-monorepo",
    question: "Monorepo 如何做依赖治理？catalogs、包边界、循环依赖怎么处理？",
    bigTech: true,
    answer: `Monorepo 的依赖治理三个战场：① 版本统一——同一个依赖（如 react、lodash）在 30 个包里有 8 个版本是常态灾难（包体积膨胀、类型冲突、行为不一致），pnpm catalogs 提供"单一事实源"：在 pnpm-workspace.yaml 定义目录（catalog:），各包用 catalog: 协议引用，升级只改一处；替代方案是 syncpack 这类工具 CI 校验版本一致性；② 包边界——monorepo 里"什么都能 import"是架构腐化的温床（应用直接引用另一个应用的内部文件、工具包反向依赖业务包），用 ESLint 的 boundaries 插件或 Nx 的 module boundary 规则按"层"约束：apps 可依赖 packages，packages 之间按层级（ui → hooks → utils）单向依赖，违规直接 CI 红；③ 循环依赖——A 依赖 B、B 又依赖 A，构建时拓扑排序失败或运行时 undefined，解法是依赖图可视化（madge、nx graph）定期体检，循环处要么下沉公共部分成第三包，要么用依赖注入/事件解耦。

\`\`\`yaml
# pnpm-workspace.yaml：catalogs 单一事实源
catalog:
  react: ^18.3.1
  react-dom: ^18.3.1
  zustand: ^5.0.0

# packages/ui/package.json
{ "dependencies": { "react": "catalog:", "zustand": "catalog:" } }
\`\`\`

实际案例：某内容平台 monorepo 治理前的体检报告触目惊心——react 存在 4 个版本（17/18.1/18.2/18.3）、lodash 和 lodash-es 混用、3 处循环依赖导致构建偶发 undefined；治理三板斧：catalogs 收编 20 个高频依赖（升级 PR 从改 30 个文件变改 1 行）、ESLint boundaries 按四层架构卡死依赖方向（app → feature → shared → infra）、madge 接入 CI 把循环依赖数做成趋势图挂在团队看板。半年后依赖相关的灵异 bug 归零，升级 React 大版本从"季度工程"变成"一周任务"。

踩坑与 tradeoff：catalogs 的认知成本——新人看到 catalog: 协议一脸懵，文档和脚手架模板要跟上，且目前 only pnpm 支持（yarn 有 resolutions、npm 有 overrides 但都是"覆盖"而非"引用"语义）；边界规则别太理想主义——存量代码先加 warn 模式跑两个月，直接 error 会让团队 ban 掉整个规则；peerDependencies 是边界的好搭档——ui 库把 react 声明为 peer 而非 dependency，版本控制权交给消费方，避免"库内置 React 版本"与应用打架；循环依赖不总是坏味道——类型层面的循环（A 的 interface 引用 B 的 type）用 import type 切断即可，运行时循环才必须物理拆解；治理要产品化——依赖版本分布、循环数量、层级违规数做成 dashboard 周会过一眼，比任何一次性运动式治理都持久。`,
    keyPoints: ["catalogs：版本单一事实源，升级改一处", "boundaries：按层约束依赖方向，CI 执法", "循环依赖：madge 体检，下沉或注入解耦", "治理产品化：dashboard 趋势代替运动式"],
    followUps: ["ESLint boundaries 的层级规则如何设计？", "import type 为什么能切断类型层循环依赖？"],
    favorited: false,
  },
  {
    id: "fe-364",
    nodeId: "fe-monorepo",
    question: "Monorepo 的 CI 如何优化？affected 检测和增量构建怎么落地？",
    bigTech: true,
    answer: `Monorepo CI 的核心命题：改了一个包，只构建/测试/部署受它影响的部分，而不是全仓重来。affected 检测的算法：以 git diff（对比 base 分支，通常是 origin/main）找出变更文件 → 映射到所属 workspace 包 → 沿依赖图正向传播（变更包 + 所有依赖它的下游包）= affected 集合。落地三层：① 任务级——turbo run build --filter=...[origin/main] 或 nx affected -t build，只对受影响包跑任务，配合 DAG 并行；② 缓存级——远程缓存让"受影响"进一步缩水：affected 集合里源码没真正变化的包 hash 不变直接命中，实际构建的往往只剩改动的零头；③ 部署级——Vercel/Netlify 的 ignored build step（git diff 判断 apps/web 目录无变化则跳过整次部署），或自研流水线按 affected 应用清单动态生成部署矩阵。

\`\`\`bash
# turbo：只构建 main 分支以来受影响的包
turbo run build test lint --filter=...[origin/main] --parallel

# nx 等价命令
nx affected -t build test lint --base=origin/main --parallel=3

# GitHub Actions 关键配置：必须拉全历史才能 diff
- uses: actions/checkout@v4
  with: { fetch-depth: 0 }
\`\`\`

实际案例：某 40 包的 monorepo 优化前后对比是教科书数字——全量 CI 45 分钟，接入 affected + 远程缓存后：改文档类 PR 40 秒（全命中缓存），改 utils 核心包（影响面最大）12 分钟（下游 15 个包重建），普通业务包 PR 平均 3 分钟。另一个案例是部署级优化的威力：某公司主站和管理后台同仓，此前每次 merge 两个应用都重新构建部署（各 8 分钟），加 ignored build step 后互不影响的变更直接跳过，部署次数下降 60%，回滚定位也从"这次部署改了啥"变成精确的"就是这个应用的这次构建"。

踩坑与 tradeoff：fetch-depth 是新手第一坑——CI 默认浅克隆（depth=1）拿不到 base 分支，diff 结果为空导致"什么都不构建"或"全部构建"，必须 fetch-depth: 0 或按需 deepen；merge-base 漂移——PR 长期不 rebase，base 对比点太旧，affected 集合虚胖，可用"合并后的虚拟提交"（GitHub 的 merge ref）做 diff 更准；非确定性任务污染 affected——某包测试依赖随机端口或真实网络，在 affected 里跑挂了就阻塞全链路，这类任务要隔离标记；根目录文件的影响面——改根 tsconfig、pnpm-lock、CI 配置应该触发全量（turbo 的 globalDependencies 声明这些文件，改动即全体 hash 失效，行为正确但要心里有数）；affected 不是银弹——锁文件更新、依赖升级这类"全仓影响"的 PR 该全量就全量，别为了快而漏。`,
    keyPoints: ["affected = 变更包 + 依赖它的下游包", "三层优化：任务级/缓存级/部署级", "fetch-depth: 0 是 diff 前提", "根配置改动=全量，globalDependencies 声明"],
    followUps: ["merge-base 漂移为什么让 affected 虚胖？", "部署级 ignored build step 怎么实现？"],
    favorited: false,
  },
  {
    id: "fe-365",
    nodeId: "fe-nodejs-bff",
    question: "Node.js 事件循环和浏览器的有什么差异？setImmediate 和 setTimeout(0) 谁先执行？",
    bigTech: true,
    answer: `Node 事件循环基于 libuv，按阶段轮转：timers（setTimeout/setInterval 到期回调）→ pending callbacks（系统层回调如 TCP 错误）→ idle/prepare（内部用）→ poll（取 I/O 事件，执行 fs/网络回调，循环大部分时间的家）→ check（setImmediate）→ close callbacks（socket.on("close")），每个阶段执行完清空该阶段回调队列，阶段之间处理微任务。与浏览器的三大差异：① 阶段模型 vs 任务队列——浏览器是宏任务队列 + 渲染步骤交错（requestAnimationFrame、渲染时机由浏览器决定），Node 没有渲染，多了 setImmediate 和 poll 阶段的概念；② 微任务时机——Node 11 之前微任务在阶段切换时才清空（一个阶段里 1000 个回调共享一次微任务清空），Node 11+ 与浏览器对齐为"每个宏任务后清空"，process.nextTick 是 Node 独有的更高优先级微任务（先于 Promise.then）；③ 环境 API——Node 没有 DOM/BOM，多了 Buffer、process、原生 addon。setImmediate vs setTimeout(0) 的顺序：主模块直接调用时取决于定时器精度（0~1ms 内是否过点），顺序不确定；但在 I/O 回调内 setImmediate 永远先（当前在 poll 阶段，下一步就是 check 阶段，而 timers 要等下一轮）。

\`\`\`js
const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate")); // 一定先输出 immediate
});
process.nextTick(() => console.log("tick"));    // 先于所有 Promise.then
Promise.resolve().then(() => console.log("then"));
\`\`\`

实际案例：经典的"回调地狱变炸栈"事故——某日志服务用递归 setImmediate 处理百万行文件流，本意是"让出事件循环"，但写成同步递归调用导致栈溢出；改对姿势是每处理一批用 setImmediate 调度下一批，事件循环每轮只消化一批，GC 和定时器都有喘息。另一个真实排查：某 BFF 接口偶发 RT 尖峰，火焰图发现大量 Promise.then 排队——上游服务一次性并发回了 200 个响应，每个响应的微任务链把 poll 阶段回调拖到 800ms 才轮到，最后用 p-limit 限流上游并发解决。

踩坑与 tradeoff：process.nextTick 是逃生舱也是陷阱——递归 nextTick 会饿死整个事件循环（它比 I/O 优先级高，永远插队），流式处理请用 setImmediate；CPU 密集任务放主线程等于自杀——事件循环单线程，一个 JSON.parse 大文件就冻结所有请求，要么 worker_threads 要么拆分小任务 setImmediate 切片；异步上下文丢失——AsyncLocalStorage 在部分回调场景（如 EventEmitter 跨边界）会断链，全链路追踪要测试覆盖；面试高频变体：async/await 包裹下的输出顺序题，本质是"await 后面等价于 then，而 then 是微任务"，记住"同步 > nextTick > 微任务 > 宏任务阶段"口诀稳过。`,
    keyPoints: ["libuv 六阶段：timers→poll→check 轮转", "Node11+ 微任务与浏览器对齐，nextTick 更优先", "I/O 回调内 setImmediate 必胜 setTimeout(0)", "递归 nextTick 饿死循环，CPU 密集用 worker"],
    followUps: ["poll 阶段的阻塞策略是怎么决定的？", "AsyncLocalStorage 的实现原理与断链场景？"],
    favorited: false,
  },
  {
    id: "fe-366",
    nodeId: "fe-nodejs-bff",
    question: "BFF 层到底解决什么问题？设计原则是什么？",
    bigTech: true,
    answer: `BFF（Backend for Frontend）是在前端与微服务之间加的一层"面向前端体验的服务端"：一个端（Web/iOS/Android）配一个 BFF，负责聚合多个下游微服务的接口、按 UI 所需的数据结构裁剪组装、屏蔽后端接口的变动与异构（REST/gRPC/老 SOAP 混存）。它解决四个真实痛点：① 多端数据需求差异——移动端要精简字段省流量，PC 端要宽表，让微服务为每个端出特化接口不现实；② 聚合降往返——一个页面要调 5 个微服务，弱网下 5 次 RTT 是灾难，BFF 内网并发聚合一次返回；③ 前端渲染逻辑的服务端化——SSR、鉴权、AB 实验、灰度路由这些"必须服务端做"的事有了落点；④ 接口防腐——后端微服务重构/换协议时，BFF 做适配层，前端代码零改动。设计原则三条：BFF 只做"体验组装"不含业务规则（业务规则属于领域服务）、BFF 归前端团队所有（谁懂 UI 谁编排数据）、BFF 本身要薄（逻辑厚了就变成新的巨石）。

\`\`\`ts
// Next.js Route Handler 作为 BFF：聚合 + 裁剪
export async function GET(req: Request) {
  const token = await getSession(req);          // 鉴权在 BFF 收口
  const [user, orders, coupons] = await Promise.all([  // 内网并发聚合
    userSvc.get(token.uid), orderSvc.list(token.uid), couponSvc.available(token.uid),
  ]);
  return Response.json({                        // 按 UI 结构裁剪
    nickname: user.nickname,                    // 移动端只要这三个字段
    orderCount: orders.length,
    usableCoupons: coupons.filter(c => !c.expired).length,
  });
}
\`\`\`

实际案例：阿里/美团的中台实践是 BFF 的大规模验证——手机淘宝首页背后是 BFF 聚合 20+ 下游服务，弱网地区首屏从 6 个串行请求压到 1 个；Netflix 是 BFF 概念的提出者，每个设备形态（TV/手机/Web）一个专属 BFF。反例也典型：某公司 BFF 层写着写着把"满减计算、库存校验"都搬了进去，一年后 BFF 变成 5 万行的第二后端，前后端都改不动，最后含泪拆回领域服务——BFF 变厚的每一步在当时都"很合理"。

踩坑与 tradeoff：BFF 最大的反模式是"逻辑泄漏"——今天塞一个字段映射、明天塞一个业务校验，最终变成无人敢动的关键路径，纪律是"BFF 只组装不决策"；性能陷阱是聚合放大故障——BFF 并发调 5 个下游，任一抖动都拖垮整体 RT，必须配超时（单下游 300ms 红线）、降级（优惠券挂了返回空数组不挂整页）、熔断（连续失败短路）；谁拥有 BFF 决定成败——归后端团队管的 BFF 最终变成"又一个微服务"（前端提需求排期两周），归前端团队才有"为体验服务"的动力；GraphQL 是 BFF 的进化形态之一——把"裁剪权"交给前端查询语句，但治理成本（N+1、缓存、限流）随之而来，小团队 REST 聚合往往更划算。`,
    keyPoints: ["一端一 BFF：聚合/裁剪/防腐/服务端收口", "弱网聚合：5 次 RTT→1 次，内网并发", "三原则：只组装、前端所有、保持薄", "逻辑泄漏是头号反模式"],
    followUps: ["BFF 聚合时如何做超时、降级、熔断？", "GraphQL BFF 与 REST 聚合 BFF 如何选？"],
    favorited: false,
  },
  {
    id: "fe-367",
    nodeId: "fe-nodejs-bff",
    question: "Next.js 的 Server Actions 和 RSC 数据流是怎样的？和传统 API 路由什么关系？",
    bigTech: true,
    answer: `RSC（React Server Components）把组件分为两类：Server Component 只在服务端执行（可直接查库/读文件/调内网服务，零客户端 JS 体积），Client Component（"use client" 标记）负责交互。数据流：请求进来 → 服务端执行 RSC 树，产出一个可流式传输的序列化格式（RSC Payload，含渲染结果 + Client 组件的引用占位）→ 浏览器端 React 按 Payload 拼装，Client 组件正常 hydration。Server Actions 是配套的"服务端函数远程调用"：用 "use server" 标记的 async 函数可以直接在表单 action 或事件里调用，框架自动序列化参数、POST 到服务端执行、返回结果并触发 revalidate——等于把"手写 fetch('/api/xxx')"变成"直接 import 一个函数"，且类型端到端安全。与传统 API 路由的关系：API 路由（Route Handlers）是通用 HTTP 端点（给第三方/爬虫/跨端用），Server Actions 是"同应用内的 RPC"（自有前端专用），两者互补不替代。

\`\`\`tsx
// app/todos/actions.ts —— 服务端函数即接口
"use server";
export async function addTodo(formData: FormData) {
  await db.todo.create({ data: { title: formData.get("title") } });
  revalidatePath("/todos");        // 执行后自动刷新页面数据
}
// app/todos/page.tsx —— RSC 直读数据库，零客户端 JS
export default async function Todos() {
  const todos = await db.todo.findMany();   // 服务端直接查，无 API 层
  return <ul>{todos.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
// 表单里 <form action={addTodo}> 直接调用服务端函数
\`\`\`

实际案例：Vercel 官方 demo（Next.js Commerce）把商品页做成纯 RSC——商品数据服务端直读，页面 JS 体积比 Pages Router 版本小 40%；某内部后台迁移到 Server Actions 后砍掉了 60+ 个手写 API 路由和对应的 fetch 封装，表单提交流程从"useState + fetch + loading/错误处理 20 行"变成 action={fn} 一行，配合 useFormStatus 拿到 pending 态。但另一个团队的教训同样深刻：把 Server Actions 当万能 RPC 在客户端事件里高频调用（每次输入都触发），结果每次调用都是一次完整 POST 往返，输入卡顿严重——Actions 适合"提交类"低频操作，高频交互还得本地状态或专门端点。

踩坑与 tradeoff：缓存是最大心智负担——RSC 的 fetch 默认参与 Full Route Cache，页面数据"莫名不更新"多半是缓存层没搞清（force-dynamic / revalidate 三板斧要熟练）；Server Actions 的安全边界——函数会暴露为公开 HTTP 端点（有加密 ID 但可被枚举调用），鉴权和参数校验必须在 Action 内部重新做，"隐藏即安全"是幻觉；序列化限制——RSC 边界只能传可序列化数据（Date/Map/Set 有支持但类实例/函数不行），踩坑报错通常晦涩；回退与兼容——JS 禁用时 form action 依然工作（渐进增强是 RSC 的隐藏福利），但客户端路由跳转时的 RSC Payload 请求失败要有重试；调试体验断层——服务端组件的 console.log 在终端不在浏览器，全链路日志要一开始就规划 trace id 透传。`,
    keyPoints: ["RSC：服务端执行+流式 Payload+零客户端 JS", "Server Actions：use server 的端到端类型安全 RPC", "Action 是公开端点，鉴权校验必须内置", "低频提交用 Actions，高频交互走本地状态"],
    followUps: ["RSC Payload 的流式渲染与 Suspense 如何配合？", "Next.js 四层缓存各是什么、如何失效？"],
    favorited: false,
  },
  {
    id: "fe-368",
    nodeId: "fe-nodejs-bff",
    question: "Node 服务如何做鉴权透传？Cookie、Token、Session 在 BFF 层怎么处理？",
    bigTech: true,
    answer: `BFF 鉴权透传的核心是"浏览器与 BFF 之间一套凭证，BFF 与下游微服务之间另一套凭证"，两层隔离各管各的。标准姿势：① 浏览器→BFF——HttpOnly + Secure + SameSite 的 Cookie 存 session id（防 XSS 读不到、防 CSRF 靠 SameSite=Lax/Strict + 自定义头校验），或 Authorization Bearer token（SPA 跨域场景）；② BFF→下游——BFF 用 session id 换出内部凭证（JWT/内部 token）调下游微服务，绝不让浏览器凭证直接穿透到内网（防爆库后一锅端）；③ 续期——access token 短寿（15 分钟）+ refresh token 长寿（30 天）双 token 机制，BFF 拦截 401 自动用 refresh 换新 token 重放请求，前端无感；④ 登出——吊销服务端 session（Redis 删 key），Cookie 设过期，"登出所有设备"= 吊销该用户全部 session 记录。加密存储：session 内容落 Redis 时用 AES-GCM 加密，密钥走环境变量 MASTER_KEY 注入，不进代码库。

\`\`\`ts
// Next.js middleware 层的鉴权透传骨架
export async function middleware(req: NextRequest) {
  const sid = req.cookies.get("sid")?.value;
  const session = sid ? await getSessionFromRedis(sid) : null;
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  const res = NextResponse.next({
    request: { headers: new Headers({ "x-internal-token": signInternalJWT(session.uid) }) },
  });
  if (session.expiresIn < 300) await refreshAndSetCookie(res, session); // 滑动续期
  return res;
}
\`\`\`

实际案例：本项目的生产实现就是活教材——API Key 不落 localStorage（XSS 可读），而是加密后放 HttpOnly Cookie 的服务端 session，前端调 AI 接口走 /api/ai 代理，密钥全程不出服务端；某金融后台的教训更惨痛：早期把 JWT 直接存 localStorage 且 7 天有效，一次 XSS 漏洞（富文本未消毒）被批量盗号，攻击者拿着 token 从容调了一周接口才被发现，整改后换成"双 token + HttpOnly Cookie + 服务端可吊销"，同类事故归零。

踩坑与 tradeoff：SameSite 与跨站跳转的拉扯——OAuth 回调、支付回跳这类跨站 GET 需要 Lax（Strict 会丢登录态），POST 类第三方回调（WebHook）必须签名验证不能靠 Cookie；CSRF 的现代答案——SameSite 已挡住大部分场景，但老浏览器和子域共享 Cookie 的场景仍需 CSRF Token（双重提交校验）；多标签页竞态——两个标签同时触发 refresh token 轮换会导致一个用旧 token 失败，要加单例锁或用"宽限窗口"（旧 refresh token 10 秒内仍可用）；微服务间信任——BFF 签发的内部 JWT 要短寿 +  audience 限定下游服务，防止拿到一个服务的 token 横向打穿全部内网；日志红线——Cookie/Authorization 头必须进日志脱敏黑名单，打印出来等于把钥匙挂门上。`,
    keyPoints: ["两层凭证隔离：浏览器-BFF 与 BFF-下游分开", "HttpOnly Cookie + 双 token + 服务端可吊销", "滑动续期与 401 拦截重放，前端无感", "密钥加密落盘，凭证进日志黑名单"],
    followUps: ["refresh token 轮换的多标签竞态怎么解？", "内部 JWT 的 audience/scope 怎么设计防横向移动？"],
    favorited: false,
  },
  {
    id: "fe-369",
    nodeId: "fe-nodejs-bff",
    question: "Node 服务的稳定性手段有哪些？超时、限流、熔断、降级怎么配？",
    bigTech: true,
    answer: `Node BFF 的稳定性四件套，按"故障传播链"逐环设防：① 超时——一切 I/O 必须有 deadline：下游 HTTP 调用设 connect/socket 双层超时（axios 的 timeout 只罩响应，连接阶段要单独配），Node 默认 HTTP 请求无超时是裸奔；全链路预算法：页面级 3s → BFF 聚合层 1.5s → 单下游 300ms，层层递减且写入配置而非拍脑袋；② 限流——入口侧令牌桶/滑动窗口防突发（express-rate-limit 或网关层），出口侧并发上限（p-limit 包住下游调用）防自爆，Node 单线程事件循环的并发瓶颈在 socket 数而非 CPU；③ 熔断——下游连续失败（如 10 秒内错误率 >50%）就短路一段时间（30s 半开试探），用 cockatiel/opossum 实现，避免"下游已死、BFF 还在拼命重试"的资源耗尽雪崩；④ 降级——非关键下游挂了返回兜底数据（空列表/缓存快照/静态推荐），核心链路（下单）与非核心链路（推荐、优惠券）分开定降级策略。

\`\`\`ts
import { circuitBreaker, ConsecutiveBreaker, retry, wrapAll } from "cockatiel";
const breaker = circuitBreaker(fetchDownstream, {
  halfOpenAfter: 30_000,                     // 30s 后半开试探
  breaker: new ConsecutiveBreaker(5),        // 连续 5 次失败跳闸
});
const policy = wrapAll(
  retry(handleTransient, { maxAttempts: 2 }),  // 瞬时错误重试
  breaker
);
const result = await Promise.race([
  policy.execute(() => fetchCoupons(uid)),
  timeout(300, () => []),                      // 300ms 红线，超时兜底空数组
]);
\`\`\`

实际案例：某电商大促的真实故障链——推荐服务凌晨 OOM 变慢（RT 从 50ms 涨到 8s），BFF 无超时无熔断，Node 进程的 socket 连接被慢请求占满（默认 maxSockets 无上限、事件循环堆积回调），10 分钟内 BFF 集群全部假死，连健康的商品服务也调不通，首页白屏 40 分钟。整改四件套上线后，同样的推荐服务故障只表现为"推荐位展示兜底榜单"，核心交易零感知。另一个正面案例：Netflix 的 Hystrix（熔断器概念的推广者）当年就是把"任一依赖的故障隔离在舱壁内"作为设计核心，Node 生态的 cockatiel 是同源思想。

踩坑与 tradeoff：超时不是越小越好——下游 P99 是 250ms 你配 200ms，等于常态化切掉 1% 的慢请求，要按 P99 + 一定余量配；重试要配幂等——非幂等接口（创建订单）重试会重复扣款，重试只给 GET 或带幂等 key 的写操作，且重试间隔指数退避防雪崩（jitter 防羊群）；熔断粒度要对——按"下游服务 + 接口"维度熔断而非进程级全局熔断，一个接口挂拖垮全部调用就矫枉过正；降级的兜底数据要预热——缓存快照平时不写、故障时才发现是三个月前的数据，降级等于没降；指标先行——四件套的效果要用监控闭环（熔断次数、降级命中率、超时分布），没指标的稳定性配置是心理安慰。`,
    keyPoints: ["全链路超时预算：页面3s→聚合1.5s→单下游300ms", "限流双向：入口防突发，出口并发上限防自爆", "熔断按服务+接口粒度，半开试探恢复", "重试只给幂等接口，指数退避+jitter"],
    followUps: ["Node 的 maxSockets 与连接池怎么调？", "半开状态的流量试探策略有哪些？"],
    favorited: false,
  },
  {
    id: "fe-370",
    nodeId: "fe-nodejs-bff",
    question: "SSR / Serverless 的冷启动如何优化？Node 服务的启动性能怎么治理？",
    bigTech: true,
    answer: `冷启动 = 平台从零拉起一个 Node 进程到它能处理第一个请求的耗时，构成是：加载运行时（Node 本身 ~50ms）+ require 依赖链（最大的头，大型应用 node_modules 加载可占 1~3s）+ 框架初始化（Next.js 路由注册、中间件装载）+ 业务初始化（连数据库、预热缓存）。优化手段按性价比排序：① 依赖瘦身——Serverless 环境只打包生产依赖（排除 devDependencies），用 esbuild/Vercel nft 做 tree-shaking 打包成单文件，require 数量从几千降到几十，冷启动降 60%+；② 懒加载重依赖——非首屏必须的模块（富文本渲染、报表库）改成动态 import，推迟到首次使用时；③ 连接复用——数据库/Redis 连接做成"进程级单例 + 跨调用复用"（Serverless 容器复用时连接还在），用全局变量缓存防止热重连；④ 平台层——Vercel Fluid / AWS Lambda Provisioned Concurrency 保持热实例，Cloudflare Workers 直接换 V8 isolate 架构把冷启动压到 <5ms（没有进程启动，只有 isolate 初始化）；⑤ SSR 专项——React 18 renderToPipeableStream 流式输出，首字节不等全量渲染。

\`\`\`ts
// Serverless 数据库连接单例：容器复用时跳过握手
let cached: Pool | null = null;
export function getDB(): Pool {
  if (!cached) {
    cached = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    // Serverless 单并发场景 max:1，避免连接数随实例数爆炸
  }
  return cached;
}
// next.config.ts：服务端打包瘦身
module.exports = { output: "standalone", serverExternalPackages: ["sharp"] };
\`\`\`

实际案例：Vercel 的 nft（Node File Trace）打包是行业标配——Next.js standalone 模式自动追踪 server 代码的真实依赖，把几百 MB 的 node_modules 压到几十 MB；某内容站迁移 Cloudflare Workers（SSR 用 next-on-pages / OpenNext）后，全球冷启动从美东节点的 800ms 降到各边缘节点 <20ms，代价是 Node API 兼容层（fs、原生 addon 不可用）要逐一适配。另一个治理案例：某 BFF 冷启动 2.8s，profiling 发现 70% 花在 require 一个"瑞士军刀"工具库（它顶层 require 了整个 aws-sdk），改成按需子路径导入后冷启动降到 900ms。

踩坑与 tradeoff：打包与调试的权衡——单文件 bundle 冷启动快但 source map 链路多一层，生产错误堆栈还原要配置好；连接池悖论——Serverless 实例数随流量弹性伸缩，每个实例一个连接池 × 峰值 1000 实例 = 数据库 1000 连接直接打满，解法是 RDS Proxy / PgBouncer 这类服务端连接池，或干脆换 HTTP 协议的数据库（Neon/PlanetScale 的 serverless driver）；热实例保活的成本——Provisioned Concurrency 按小时计费，低频接口保活不如接受偶发冷启动；Node 22+ 的 --experimental-compile-cache 可以把 V8 编译缓存落盘，二次冷启动省 20~40% 编译耗时，属于白捡的优化；观测先行——冷启动占比要用平台指标（Lambda 的 Init Duration）监控，别靠体感。`,
    keyPoints: ["冷启动构成：运行时+require 链+框架+业务初始化", "esbuild/nft 打包瘦身是性价比之王", "连接单例跨调用复用，池大小按 serverless 特性配", "Workers/V8 isolate 把冷启动压到毫秒级"],
    followUps: ["Serverless 下数据库连接数爆炸的完整解法？", "Node compile cache 的原理和适用范围？"],
    favorited: false,
  },
  {
    id: "fe-371",
    nodeId: "fe-nodejs-bff",
    question: "Node.js 内存泄漏和事件循环阻塞如何排查？",
    bigTech: true,
    answer: `Node 性能问题的两类典型及排查路径：内存泄漏——症状是 RSS 持续上涨不回落、GC 频繁、最终 OOM（JavaScript heap out of memory）。排查三板斧：① 监控先行——process.memoryUsage() 定期采样（heapUsed/rss/external），画趋势图，泄漏的曲线是锯齿上移而非平台波动；② heap snapshot 对比——node --inspect 启动 + Chrome DevTools 连上，在泄漏前后各拍一份堆快照，用 Comparison 视图按 retained size 排序找增长最快的对象类型，顺引用链（Retainers）找到谁拽着不放；③ 常见嫌犯清单——全局 Map/数组当缓存不设上限、闭包引用大对象被长生命周期结构持有、EventEmitter 忘 removeListener（MaxListenersExceededWarning 是预警信号）、定时器回调引用外部大对象、async 上下文（AsyncLocalStorage store）未清理。事件循环阻塞——症状是 RT 毛刺、健康检查超时。工具：node --prof 或 0x 生成火焰图找热点函数；clinic.js 的 doctor 自动诊断"事件循环延迟高"模式；监控 eventLoopLag（perf_hooks.monitorEventLoopDelay），P99 超过 100ms 就要警惕。

\`\`\`js
// 经典泄漏：无界缓存
const cache = new Map();                    // 只进不出，必漏
function getUser(id) {
  if (!cache.has(id)) cache.set(id, db.query(id));
  return cache.get(id);
}
// 修复：LRU 有界缓存
import { LRUCache } from "lru-cache";
const cache = new LRUCache({ max: 1000, ttl: 60_000 });

// 事件循环延迟监控（接告警）
import { monitorEventLoopDelay } from "perf_hooks";
const h = monitorEventLoopDelay(); h.enable();
setInterval(() => report("eventLoopLagP99", h.percentile(99)), 10_000);
\`\`\`

实际案例：某 BFF 服务每三天 OOM 重启一次——heap snapshot 对比发现增长最快的是字符串数组，顺 Retainers 找到是日志库的请求上下文 buffer：每个请求 push 日志条目，请求结束没清理，遇到长连接（SSE）请求永不结束，buffer 无限增长，改成分级 buffer + 请求结束 flush 后内存曲线立刻平稳。另一个阻塞案例：某接口 P99 偶发 5 秒尖峰，0x 火焰图定位到 JSON.parse 一个 40MB 的配置对象在每个请求里重复执行，挪到启动时加载 + 引用复用，尖峰消失——同步代码的代价在 Node 里被所有并发请求平摊，比 Java 多线程模型敏感得多。

踩坑与 tradeoff：快照是重型操作——拍 heap snapshot 时进程暂停数十秒，生产环境要在副本实例上操作，别对线上唯一实例动手；external 内存是盲区——Buffer（如大文件读取）不占 V8 heap 但占 RSS，heapUsed 正常而 RSS 暴涨时想 Buffer/stream；GC 调参的幻觉——--max-old-space-size 调大只是把 OOM 推迟，不解决泄漏；V8 的 APM 工具（如 clinic、Elk APM、阿里 Node.js 性能平台）能自动化大部分采集，自建脚本不如接现成平台；预防优于排查——CR 时盯四类高危代码（全局可变集合、listener 注册、闭包缓存、大对象序列化），比事后捞快照省十倍力气。`,
    keyPoints: ["泄漏曲线=锯齿上移，快照对比+Retainers 定位", "四大嫌犯：无界缓存/闭包持有/listener 泄漏/定时器", "阻塞用火焰图+eventLoopLag P99 监控", "RSS 高 heap 正常时查 Buffer/external"],
    followUps: ["V8 老生代 GC 的标记-整理流程与停顿优化？", "AsyncLocalStorage 为什么也会造成内存驻留？"],
    favorited: false,
  },
  {
    id: "fe-372",
    nodeId: "fe-nodejs-bff",
    question: "BFF 聚合和前端直调微服务怎么选？什么场景该绕过 BFF？",
    bigTech: true,
    answer: `这不是非黑即白，而是按"数据特征 × 链路特征"做路由决策。该走 BFF 聚合的场景：① 多源组装——页面数据来自 3+ 微服务（用户信息+订单+优惠券），BFF 内网并发聚合把多次公网 RTT 压成一次；② 弱网端——移动端/海外用户，请求数比请求大小更伤体验；③ 需要服务端能力的逻辑——鉴权收口、AB 实验分流、数据脱敏（手机号打码）、协议转换（gRPC→REST）；④ 接口防腐——下游频繁重构时 BFF 做稳定层。该绕过 BFF 直调的场景：① 大文件传输——上传/下载走 BFF 等于让 Node 进程当二传手（内存和带宽双重消耗），应该 BFF 只发签名 URL，前端直传 OSS/S3；② 高频低延迟数据——股价推送、协同编辑光标，WebSocket/SSE 直连专门服务，BFF 转发只增延迟；③ 第三方 SDK——支付、地图等官方 SDK 直连官方服务，BFF 代理反而破坏签名和风控；④ 内部可信场景的简单 CRUD——后台系统对内网服务直调，加一层 BFF 只是多了个故障点。

\`\`\`
决策矩阵：
                  低频读          高频读/写        大文件/流
单服务数据源      可直调          直调             直传(签名URL)
多服务聚合        BFF 聚合        BFF+缓存         BFF 只发凭证
需鉴权/脱敏       必须 BFF        必须 BFF         BFF 发临时令牌
\`\`\`

实际案例：某视频平台的混合架构是教科书——视频元数据/评论/推荐走 BFF 聚合（一次请求渲染详情页），但视频流本身直连 CDN、上传走 BFF 签发的 OSS 直传（断点续传、秒传逻辑全在前端与 OSS 之间），BFF 的带宽成本降了 90%；反例：某公司"BFF 原教旨主义"，连 200MB 的报表导出都走 BFF 中转，大促期间 Node 进程被几个并发导出占满内存连环 OOM，事后改成"BFF 生成预签名 URL，前端直拉 S3"，问题根治。

踩坑与 tradeoff：直调的代价要算清——前端直接持有微服务地址意味着 CORS 配置分散、鉴权逻辑前端化（token 泄露面变大）、接口变更需要发前端版本，这些成本在小团队可能超过聚合收益；BFF 缓存是把双刃剑——聚合层加 Redis 缓存能扛读流量，但多源数据的失效策略（任一源变即失效 or 按源 TTL 分别缓存）设计不好会读到脏数据；GraphQL Federation 是第三条路——各微服务自持 subgraph，网关层自动聚合，兼顾"服务自治"与"一次查询"，但基建门槛高（schema 治理、查询复杂度限制）；演进视角——项目早期直调一两个服务很正常，当"页面 loading 要转三次圈"或"前端 if-else 拼装五个接口数据"出现时，就是 BFF 该登场的信号，别预先架构也别死不架构。`,
    keyPoints: ["走 BFF：多源聚合/弱网/服务端能力/防腐", "绕 BFF：大文件直传/实时推送/三方 SDK", "直传模式：BFF 发签名 URL，流量不过 Node", "演进信号：多次转圈+前端拼装数据=BFF 登场"],
    followUps: ["BFF 层缓存的多源失效策略怎么设计？", "GraphQL Federation 与手写 BFF 的治理成本对比？"],
    favorited: false,
  },
  {
    id: "fe-373",
    nodeId: "fe-monitoring",
    question: "前端错误监控体系怎么建？window.onerror、unhandledrejection、资源错误各覆盖什么？",
    bigTech: true,
    answer: `前端错误采集要铺满四个入口，缺一个就有盲区：① window.onerror——捕获同步运行时错误（跨域脚本只给 "Script error." 无堆栈，解法：script 加 crossorigin="anonymous" + CDN 返回 Access-Control-Allow-Origin）；② window.addEventListener("unhandledrejection")——捕获没有 catch 的 Promise 拒绝，event.reason 可能是 Error 也可能是任意值（throw "字符串" 的代码真实存在）；③ window.addEventListener("error", ..., true) 捕获阶段——资源加载错误（img/script/link 404）不冒泡只捕获，拿到的是 Event 不是 Error，要读 target.src/href；④ 框架层——React ErrorBoundary（渲染期错误 onerror 捕获不到，会卸载整棵树）、Vue errorHandler。上报内容决定排查效率：错误消息 + 堆栈 + 发生时的 URL/路由 + userId + 设备/浏览器 + 版本号（release）+ 面包屑（用户最近的点击/请求/路由变化序列，复现路径的黄金线索）。工程闭环：采样（错误风暴时限流，单用户同错误聚合）→ 符号化（source map 还原）→ 聚合分组（fingerprint 去重）→ 告警（新增错误类型立即报，存量错误按阈值）→ 分派（按代码 OWNER 自动指派）。

\`\`\`ts
window.addEventListener("error", (e) => {
  if (e instanceof ErrorEvent) report({ type: "js", msg: e.message, stack: e.error?.stack });
  else report({ type: "resource", url: (e.target as HTMLElement)?.src });  // 资源错误
}, true);   // 捕获阶段拿资源错误
window.addEventListener("unhandledrejection", (e) =>
  report({ type: "promise", reason: e.reason instanceof Error ? e.reason.stack : String(e.reason) }));
// 面包屑：环形缓冲记录最近 20 条行为，错误时随单上报
\`\`\`

实际案例：Sentry 的开源实现是行业事实标准（自部署或 SaaS）；某电商自研监控平台上线第一周就抓到一个大瓜——"Script error." 占错误总量 60% 且无任何堆栈，排查发现是第三方统计 SDK 内部报错 + 业务代码跨域资源未配 crossorigin，配置后真实错误现形：一个存在半年的空指针每天在影响 2000+ 用户而无人知晓。另一个案例是面包屑的价值：一个"偶发白屏"投诉，靠面包屑还原出"点击导出→路由跳转→接口 401→重定向循环"的完整路径，两小时修复，没有面包屑这种偶发问题通常以"无法复现"关闭。

踩坑与 tradeoff：错误风暴要双向防护——客户端本地 dedup（同一错误 10 秒内只报一次）+ 服务端按 fingerprint 限流，否则一个线上事故先把监控服务打挂（监控自己成为故障放大器是最讽刺的事故）；隐私红线——面包屑可能含表单输入、URL 里的 token，上报前过脱敏规则（密码字段、query 敏感参数、手机号正则替换），GDPR/个保法合规不是可选项；SPA 路由上下文——错误发生时的路由要用框架钩子记录而非读 location（上报时路由可能已变）；采样率的哲学——错误监控不采样（错误本身就是低频高价值信号），性能监控才采样，别搞反；sourcemap 上传要纳入 CI——发版忘了传 symbol 文件，错误平台里全是压缩后的乱码堆栈，等于裸奔。`,
    keyPoints: ["四入口：onerror/unhandledrejection/捕获阶段/框架边界", "Script error 解法：crossorigin+CORS 双配", "上报三要素：堆栈+上下文+面包屑", "错误不采样、性能才采样，别搞反"],
    followUps: ["React ErrorBoundary 与全局错误采集如何分工？", "错误 fingerprint 聚合算法怎么设计？"],
    favorited: false,
  },
  {
    id: "fe-374",
    nodeId: "fe-monitoring",
    question: "Source Map 错误还原的原理是什么？工程上如何落地？",
    bigTech: true,
    answer: `压缩混淆后的堆栈（at http://cdn/app.min.js:1:23456）对人无意义，Source Map 就是"压缩后位置 ↔ 源码位置"的映射表：文件里是一串 VLQ（Variable Length Quantity）Base64 编码的 mappings，每段记录 [生成列, 源文件索引, 源码行, 源码列, 名称索引]，配合 sources（原始文件列表）和 names（原始标识符）三张表完成双向映射。还原过程：错误平台拿到压缩堆栈 → 按 URL+版本找到对应 .map 文件 → 用 source-map 库把 line:col 翻译成 源码文件:行:列 + 原始函数名 → 结合 CI 上传的源码上下文显示出错代码片段。工程落地四步：① 构建期生成 hidden sourcemap（devtool: "hidden-source-map"，产物里不写 //# sourceMappingURL 注释，浏览器 DevTools 和用户都拿不到）；② CI 把 .map 文件随版本号（release 字段）上传到错误平台（Sentry 的 sentry-cli 或自研服务的 symbol 仓库），上传后从 CDN 删除或鉴权保护；③ 运行时错误 SDK 打上报表带 release，平台按 release 匹配 map 版本；④ 还原失败兜底——保留原始压缩堆栈并标记未符号化，别让符号化失败吃掉错误本身。

\`\`\`ts
// webpack：生成但不暴露 sourcemap
{ devtool: "hidden-source-map" }
// Vite 等价
{ build: { sourcemap: "hidden" } }
// CI 上传（Sentry 示例）
// sentry-cli releases files v1.2.3 upload-sourcemaps ./dist --url-prefix "~/static/js"
// 上传完删除公网 .map：find dist -name "*.map" -delete
\`\`\`

实际案例：某团队 sourcemap 治理的完整闭环——早期 map 文件直接发 CDN（相当于源码裸奔，竞品扒下来看逻辑），后来改 hidden + 内网 symbol 服务，CI 按 git commit hash 归档 map，错误平台按 release 拉取还原；一次线上事故中，压缩堆栈还原后精确指向"utils/format.ts 第 47 行可选链漏写"，从告警到定位 5 分钟。另一个常见翻车：CDN 缓存了旧版 JS 但 HTML 引用了新版 chunk，错误堆栈的行号与新版 map 对不上，还原出来指向完全错误的文件——map 与产物必须严格按版本一一对应，content hash 命名 + 不可变缓存是前提。

踩坑与 tradeoff：map 泄露等于源码泄露——hidden-source-map + 内网存储是基线，曾有大厂把 .map 留在公网被完整扒出业务源码；版本错配是还原失败首因——A/B 实验多版本并存时，错误要带具体 chunk hash 而非笼统 release；多级编译的映射链——TS→JS→压缩是两步，tsc 和 bundler 的 map 要串联（sourcemap-loader 或直接一体化构建），断一环就还原到中间产物；WASM/Worker 的 map 要单独处理——线程内错误的堆栈 URL 指向 blob 或独立 chunk，SDK 要给 Worker 上下文也注入 release；性能成本——source-map 解析大 map（10MB+）耗时可观，错误平台通常预处理成索引结构，自研平台别把解析放请求热路径。`,
    keyPoints: ["mappings：VLQ 编码的位置映射+sources+names", "hidden-sourcemap：生成但公网不可见", "CI 按 release 上传，map 与产物严格一一对应", "还原失败要兜底保留原始堆栈"],
    followUps: ["多级编译（TS→JS→min）的 map 链如何串联？", "Worker/WASM 场景的错误符号化差异？"],
    favorited: false,
  },
  {
    id: "fe-375",
    nodeId: "fe-monitoring",
    question: "Web Vitals 性能指标怎么采集？LCP、INP、CLS 的测量原理是什么？",
    bigTech: true,
    answer: `真实用户监控（RUM）靠浏览器 Performance API 三件套：① LCP（Largest Contentful Paint，最大内容绘制，≤2.5s 优）——PerformanceObserver 监听 "largest-contentful-paint" 条目，浏览器持续上报视口内最大元素（图片/视频封面/块级文本）的渲染时间，用户交互后停止更新（取最后一次为准）；② INP（Interaction to Next Paint，交互到下次绘制，2024 年 3 月取代 FID，≤200ms 优）——监听 "event" 条目（buffered: true 可拿历史），记录每次交互（点击/输入/键盘）从触发到下一帧绘制的完整延迟，取 P98 近似最差值，比 FID 严苛得多（FID 只测首次输入的延迟部分，INP 测全生命周期所有交互的全程耗时）；③ CLS（Cumulative Layout Shift，累积布局偏移，≤0.1 优）——监听 "layout-shift"，按 影响分数×距离分数 累计每个意外位移（会话窗口内聚合，取最大窗口值）。上报策略：web-vitals 库封装好全部细节（可见性变化时 sendBeacon 上报，避免页面隐藏丢失数据），附带 元素选择器归因（LCP 是哪个元素、INP 卡在哪个事件处理器、CLS 谁动了）才有优化价值。

\`\`\`ts
import { onLCP, onINP, onCLS } from "web-vitals";
onLCP((m) => report("LCP", m.value, m.entries.at(-1)?.element));  // 归因到元素
onINP((m) => report("INP", m.value, m.attribution.interactionTarget));
onCLS((m) => report("CLS", m.value, m.attribution.largestShiftTarget));
// 发送用 navigator.sendBeacon（页面隐藏时可靠投递），采样率 5%~10%
\`\`\`

实际案例：某内容平台 LCP 优化的归因式打法——RUM 数据显示 LCP P75 3.8s 但元素归因发现 70% 的 LCP 元素是首屏 banner 图，进一步拆解（web-vitals 的 attribution 给出 TTFB/资源加载/渲染延迟分段）定位到 60% 耗时在图片下载，上 AVIF + preload + CDN 边缘缓存后 P75 降到 2.1s；INP 优化的典型路径：某后台系统 INP P75 高达 600ms，归因到点击表格排序的处理器——一次排序触发全表 2000 行重渲染，上 useTransition + 虚拟滚动后降到 180ms。实验室数据（Lighthouse）与 RUM 的关系：实验室是"标准工况"用于回归防线，RUM 才是用户真实体验（分布、长尾、设备网络差异），两者常差一倍，只看 Lighthouse 优化是自欺。

踩坑与 tradeoff：INP 的归因最难——长任务可能被多个交互分摊，attribution 给的是主导者而非全部贡献者，优化时要看长任务火焰图；SPA 的指标失真——LCP/CLS 都是页面级，路由切换后的"二次 LCP"没有官方定义（社区用软导航补丁或按路由切片自定义），单看首页指标会高估整体体验；采样与配额——全量上报性能数据成本高，5% 采样 + 关键页面加权是常态，但告警阈值要按采样后的统计显著性校准；sendBeacon 的 payload 上限（64KB）和多指标合并上报要一次设计好；反作弊意识——RUM 数据会被爬虫/预渲染污染（prerender 的 LCP 接近 0），要过滤 navigator.webdriver 和 visibilityState 异常样本。`,
    keyPoints: ["LCP 取最大元素最后上报值，交互后冻结", "INP 测全程全交互 P98，取代只测首次的 FID", "CLS 按影响×距离分会话窗口累计", "归因（元素/处理器/目标）比数值更值钱"],
    followUps: ["INP 与长任务（Long Tasks）的关系是什么？", "SPA 软导航的性能指标怎么自定义采集？"],
    favorited: false,
  },
  {
    id: "fe-376",
    nodeId: "fe-monitoring",
    question: "前端白屏如何检测？SPA 场景的白屏判定为什么难？",
    bigTech: true,
    answer: `白屏定义比想象中微妙：不是"页面空白"（加载中的合法状态），而是"超过预期时间仍无有效内容"。检测方案四代演进：① 存活探针式——定时器检查 DOM 关键容器（#root/#app）在 N 秒后是否有子节点，简单但误报高（慢网用户还在加载就报白屏）；② 像素采样式——用 html2canvas 或 native 截图能力对页面采样，计算空白像素占比，准确但性能开销大，只适合抽样；③ 渲染信号式——监听 FP/FCP/LCP：页面打开后 N 秒内没有 FCP（首次内容绘制）判定白屏候选，结合 DOM 检查二次确认，性能与准确平衡最好；④ 框架信号式——React/Vue 应用根组件 mount 成功上报"存活心跳"，超时未收到即白屏，SPA 场景最可靠（直接证明 JS 执行到渲染）。SPA 判定难在三处：路由切换的白屏（JS 活着但新页面渲染失败，DOM 里有旧内容，容器检查失效）；hydration 失败（SSR 页面 HTML 有内容但 JS 没接管，看着正常其实死的，要检查事件是否响应或 React 根标记）；微前端容器白屏（子应用加载失败但壳正常，每个子应用容器要独立探针）。

\`\`\`ts
function whiteScreenDetect() {
  const deadline = 5000;
  setTimeout(() => {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    const rootHasContent = document.getElementById("root")?.children.length ?? 0;
    if (!fcp && !rootHasContent) report("white-screen", { url: location.href });
  }, deadline);
}
// React 侧：根组件 useEffect 上报 mount 心跳，与上者互补（JS 崩了心跳缺席）
\`\`\`

实际案例：某工具站白屏监控上线后的数据分布很有代表性——白屏率 0.3%，但其中 80% 集中在"低端 Android + 弱网"象限，进一步归因是 4MB 的 JS bundle 在弱网下 30 秒未下载完，上路由级 code splitting + 预加载关键 chunk 后白屏率降到 0.05%。另一个 SPA 特有案例：路由懒加载 chunk 因 CDN 节点故障 404，React Router 的 lazy 抛错被 ErrorBoundary 捕获显示兜底（不算白屏），但兜底组件本身的图片也 404 导致用户看到全灰——监控补上了"ErrorBoundary 触发率"指标才把这类问题纳入视野。

踩坑与 tradeoff：误报是白屏监控的天敌——合法慢加载被报白屏会淹没告警（告警疲劳后真白屏也没人看），所以阈值要按设备/网络分层（低端机弱网放宽到 10s），且"候选白屏"要二次确认（发一个探针请求看网络是否通）；SSR 的 hydration 失败最阴——HTML 正常渲染（用户看到内容），但 onClick 全无反应，检测要靠"根组件 mount 心跳"或"事件探针"（静默触发测试事件）；采样成本控制——像素采样只给 1% 流量或疑似会话做；与白屏关联的止损动作——检测到白屏后自动刷新一次（location.reload）能救回约 30% 的临时性白屏（chunk 加载抖动类），但要防刷新循环（sessionStorage 记次数，超 2 次放弃）；指标要进大盘按版本/渠道下钻——发版后白屏率突增是最常见的回滚信号。`,
    keyPoints: ["白屏=超时无有效内容，非加载中状态", "FCP 信号+DOM 二次确认性价比最高", "SPA 三难：路由切换/hydration 死/子应用容器", "误报治理：分层阈值+二次确认+自动刷新止损"],
    followUps: ["hydration 失败的线上检测方案有哪些？", "白屏率与哪些指标做关联分析最有效？"],
    favorited: false,
  },
  {
    id: "fe-377",
    nodeId: "fe-monitoring",
    question: "前端埋点体系怎么设计？代码埋点、无痕埋点、曝光埋点各适合什么场景？",
    bigTech: true,
    answer: `埋点三流派：① 代码埋点（手动）——在业务逻辑里显式调用 track("pay_click", { sku })，优点是语义精确、携带业务参数完整，缺点是维护随代码腐化（重构时埋点被遗忘）、覆盖成本高，适合核心转化链路（支付、注册、提交）；② 无痕埋点（全埋点）——SDK 自动拦截所有点击/输入/路由变化上报，后期用可视化圈选定义事件，优点是回溯能力强（昨天上线的新分析今天就有历史数据）、产品自助，缺点是数据量爆炸、元素定位脆弱（class 改名圈选失效）、携带不了业务语义，适合探索性分析和长周期漏斗；③ 曝光埋点——IntersectionObserver 监听元素进入视口（threshold 通常 0.5 以上、停留 300ms+ 防一闪而过），上报 元素ID+位置+时长，列表场景要去重（同一 item 同会话只报一次）。工程规范三件套：事件协议统一（event 名动宾结构、参数 snake_case、公共参数 page/uid/ts 由 SDK 注入）、埋点注册表（事件字典随代码版本进 git，CI 校验未注册事件拦截）、验证工具（开发环境浮层实时显示触发的事件流）。

\`\`\`ts
// 曝光埋点骨架：IntersectionObserver + 停留时长判定
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const id = e.target.dataset.trackId;
    if (e.intersectionRatio >= 0.5) {
      e.target.dataset.showAt = Date.now();
    } else if (e.target.dataset.showAt) {
      const dur = Date.now() - Number(e.target.dataset.showAt);
      if (dur >= 300 && !seen.has(id)) { seen.add(id); track("item_expose", { id, dur }); }
      delete e.target.dataset.showAt;
    }
  }
}, { threshold: [0, 0.5] });
\`\`\`

实际案例：字节的增长分析体系（DataFinder/火山引擎）是无痕+代码混合派的代表——列表信息流用无痕圈选快速验证假设，支付等核心链路用代码埋点保精度；某电商的曝光埋点治理教训典型：早期用 scroll 事件 + getBoundingClientRect 计算曝光，长列表滚动时主线程卡死（每帧几十次强制同步布局），换 IntersectionObserver 后滚动帧率从 30fps 回到 60fps，且原生节流天然去抖。另一个失败案例：某团队埋点没有注册表约束，半年积累 3000+ 事件名（buy_click/buyClick/BUY-CLICK 并存），数据分析靠考古，最后清库重建并立下"事件字典 CI 卡点"的规矩。

踩坑与 tradeoff：无痕埋点的定位脆弱性——用 xpath/class 链圈选的元素，UI 改版后圈选规则集体失效且无声无息（数据悄悄断层），重要指标必须用带稳定 data-track-id 的代码埋点；曝光口径要和业务对齐——"进入视口 50% 且停留 300ms"还是"完全可见"，不同口径数据差 3 倍，定错了 GMV 归因全乱；SPA 的 PV 定义——路由切换算 PV，但要区分"首次加载"与"软导航"（性能归因完全不同），且路由变化时未完成的曝光要结算；隐私合规——输入框内容、URL query 默认不采，欧盟/国内个保法要求明示同意前的埋点要缓存延迟发送；埋点与监控是两个体系别混——埋点回答"用户怎么用"（分析驱动），监控回答"系统健康吗"（稳定性驱动），数据管道和采样策略都不同。`,
    keyPoints: ["代码埋点保核心，无痕做探索，分工不替代", "曝光：IntersectionObserver+阈值+停留+去重", "事件注册表进 git，CI 拦未注册事件", "定位脆弱性：重要指标必须稳定 track-id"],
    followUps: ["无痕埋点的元素指纹算法怎么设计抗改版？", "埋点数据如何与后端日志做全链路关联？"],
    favorited: false,
  },
  {
    id: "fe-378",
    nodeId: "fe-monitoring",
    question: "前端日志的采样、上报与告警治理怎么做？如何避免告警疲劳？",
    bigTech: true,
    answer: `前端日志体系的三个子问题：① 采样——性能/行为类高频数据必须采样（全量上报成本扛不住），常用策略：固定比例采样（5%）按用户 ID hash 保持同一用户一致性（可还原单个用户完整路径）、分层采样（核心页面 100%、长尾页面 1%）、错误场景不降采（错误本身低频高价值，且错误发生前后自动提升该会话日志级别——"事后补救"式全量）；② 上报——通道选择：navigator.sendBeacon 优先（页面隐藏/卸载时可靠投递、不阻塞主线程）、fetch keepalive 备选、img 像素点兜底（兼容老浏览器，1x1 gif 带 query）；批量聚合（本地缓冲 10 条或 5 秒 flush 一次，省连接数）；失败重试与离线缓存（IndexedDB 暂存，网络恢复补发，但设上限防存储膨胀）；压缩（日志体大时 gzip，但要算 CPU 成本）；③ 告警治理——告警的三条军规：可行动（收到告警的人有明确处置动作，否则降级为周报指标）、有阈值依据（基线偏离而非绝对值，如"错误率较 7 日均值 +3σ"）、去重聚合（同一 root cause 的 10 万条错误聚合为一个事件，新增错误类型单独告警）。

\`\`\`ts
// 一致性采样：同一用户永远在同一侧
function sampled(uid: string, ratio: number): boolean {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000 < ratio;
}
// 上报队列：批量 + beacon 兜底
class LogQueue {
  private buf: LogItem[] = [];
  flush() {
    if (!this.buf.length) return;
    const body = JSON.stringify(this.buf.splice(0));
    if (!navigator.sendBeacon("/log", body)) fetch("/log", { method: "POST", body, keepalive: true });
  }
}
window.addEventListener("visibilitychange", () => document.hidden && queue.flush());
\`\`\`

实际案例：告警疲劳的真实灾难——某团队告警群每天 200+ 条机器人消息（阈值拍脑袋：错误数 >50 就报），三个月后真事故（支付回调失败率 40%）被淹没在日常噪音里 40 分钟才被发现；治理后告警分三级：P0（新增错误类型、核心指标 +3σ、白屏率突增）电话+IM，P1（非核心指标偏离）IM 群，P2（趋势性劣化）日报，告警量降到每天 5 条内且条条有人认领。另一个正面案例：某平台做"错误发生时的会话全量回放"——平时 5% 采样，一旦某会话触发错误，自动把该会话的完整行为日志（之前缓冲在本地）补报，排查效率翻倍而成本几乎不增。

踩坑与 tradeoff：采样率与统计显著性的矛盾——1% 采样下每天只有 3 个样本的冷门页面，任何波动都是噪音，这类页面的告警要么并池要么放弃；客户端时钟不可信——日志时间戳以服务端接收时间为准（客户端时区错乱、手动改时间真实存在），但行为序列的相对时间用客户端单调时钟（performance.now 类）可靠；上报竞态——页面卸载瞬间的日志丢失率最高，beacon + visibilitychange 组合是已验证的最稳姿势；隐私与采样同规——采样开关不能绕过同意机制（用户拒绝追踪时连采样资格都没有）；告警自愈闭环——告警触发自动刷新/降级/回滚动作的系统（如白屏率突增自动切备用版本）比人工响应快一个量级，但动作本身要有护栏（自动回滚最多一次，防反复横跳）。`,
    keyPoints: ["一致性采样按 uid hash，会话可完整还原", "beacon+批量+离线缓存+visibilitychange 四件套", "告警军规：可行动/有基线/去重聚合", "错误触发会话全量补报，成本与效率双赢"],
    followUps: ["告警基线用固定阈值还是动态基线（3σ/同比）？", "客户端时间戳不可信时如何做会话时长分析？"],
    favorited: false,
  },
  {
    id: "fe-379",
    nodeId: "fe-monitoring",
    question: "接口质量监控（成功率、慢查询、异常状态码）前端怎么做？",
    bigTech: true,
    answer: `接口监控的前端实现：拦截层统一埋点——fetch/xhr 各包一层（或 axios 拦截器），记录 接口名（URL 模式化，/order/123 → /order/:id，否则高基数爆炸）、耗时、状态码、业务码（200 但 code:50001 的逻辑失败才是业务接口的真实成功率）、请求体大小、重试次数。四类核心指标：① 成功率——HTTP 成功率与业务成功率分开算（HTTP 200 率 99.9% 但业务成功率 95% 的接口比比皆是），分接口/分页面/分版本下钻；② 耗时分布——P50/P90/P99 缺一不可（均值会被长尾掩盖），慢请求阈值按接口重要级分层（核心交易 1s、查询 2s、报表 5s）；③ 异常状态码——4xx 突增通常是前端 bug（参数错、鉴权失效），5xx 是服务端故障，499/超时类是网络或客户端中断，三类处置人完全不同；④ 熔断联动——前端对持续失败的接口做本地降级（3 次失败切备用域名/静态兜底），监控数据驱动降级策略的触发与恢复。

\`\`\`ts
// fetch 拦截埋点骨架
const rawFetch = window.fetch;
window.fetch = async (input, init) => {
  const start = performance.now();
  const api = patternize(typeof input === "string" ? input : input.url); // /order/:id
  try {
    const res = await rawFetch(input, init);
    const clone = res.clone();
    const body = await clone.json().catch(() => null);   // 读业务码
    report("api", { api, dur: performance.now() - start, status: res.status, bizCode: body?.code });
    return res;
  } catch (e) {
    report("api", { api, dur: performance.now() - start, status: 0, error: String(e) });
    throw e;
  }
};
\`\`\`

实际案例：某电商大促的"接口熔断地图"——网关层故障导致部分区域 CDN 回源超时，前端监控按地域下钻发现华东 5xx 突增而华北正常，自动触发"华东流量切备用域名"的预案（前端 SDK 内置多域名 failover），故障期间华东下单成功率从 40% 拉回 92%。另一个教训型案例：某团队只看 HTTP 状态码，某核心接口业务失败（库存不足 code:40001）率到 15% 都无人感知——HTTP 层一片绿色 200，直到客服投诉爆发才发现，此后"业务码纳入成功率"成为铁律。高基数事故：早期直接以上报原始 URL，/order/123、/order/124 各成一条指标，时序数据库一天写入 2 亿个点直接打爆，模式化（path 参数占位）是接口监控的前置条件。

踩坑与 tradeoff：拦截器要幂等可叠加——多个 SDK（监控/AB 实验/日志）都包 fetch，层层包裹后错误归因混乱，约定单一入口（公司内部 BaseSDK 统一封装）是治理终点；克隆响应读业务码有成本——clone().json() 会消耗内存和 CPU，大响应（列表 5MB）要跳过或只读 header 里的业务码（推动后端把业务码放 header 是治本）；采样与关键接口豁免——接口监控通常全量（请求数远低于行为日志），但批量轮询接口（每秒心跳）要聚合上报（1 分钟一个汇总点）；第三方接口不可控——支付/地图 SDK 的内部请求也要监控但单独打标（third_party=true），它们的故障不该算进自家 SLA；前端监控与服务端监控的黄金信号对齐——同一次失败两端都报，用 trace id 串联，前端看到的"超时"服务端可能是"慢 SQL"，两端数据拼起来才是完整故事。`,
    keyPoints: ["URL 模式化防高基数，业务码才是真实成功率", "P50/P90/P99 分层阈值，4xx/5xx/超时分类处置", "fetch 拦截统一入口，多 SDK 包裹要治理", "trace id 串联前后端，拼出完整故障故事"],
    followUps: ["高基数问题在指标系统里还有哪些表现和解法？", "业务码放 header 与放 body 的工程权衡？"],
    favorited: false,
  },
  {
    id: "fe-380",
    nodeId: "fe-monitoring",
    question: "线上问题从告警到定位的排查方法论是什么？如何建立可复用的排查体系？",
    bigTech: true,
    answer: `线上排查的标准动线（按信息密度排序）：① 定界——先看监控大盘确认影响面：是全局还是局部（单页面/单接口/单地域/单版本）？"什么时候开始的"比"发生了什么"更先回答——时间点对齐发版记录/配置变更/依赖服务告警，80% 的线上问题在这一步锁定方向（变更是万恶之源）；② 定位——全局问题看基础设施（CDN/网关/DNS），局部问题下钻：单接口 5xx 找后端链路，单页面错误率突增看该页面的错误聚类和面包屑，单版本问题直接回滚验证假设；③ 归因——拿到具体错误后走"错误堆栈（sourcemap 还原）→ 用户行为回放（面包屑/会话录屏）→ 最小复现"三步，复现不了的问题靠加日志而非空想；④ 止血——优先回滚/降级/切流（分钟级），修复代码是止血之后的事，"先恢复再排查"是线上第一原则；⑤ 复盘——写事故报告（时间线/根因/处置/改进项），每个改进项落实负责人和期限，进 backlog 跟踪闭环。可复用体系三支柱：变更可观测（发版/配置变更自动打时间标记到监控大盘）、下钻有路径（指标→页面→接口→用户会话四层联动，每层预置 dashboard 而非现查）、预案成文档（常见故障的处置 SOP：白屏→查 CDN→切备用、支付失败率突增→查渠道→切渠道）。

\`\`\`
排查决策树（贴在团队 wiki 首页）：
告警触发
 ├─ 影响面=全局？ → 查 CDN/DNS/网关/最近发版 → 回滚 or 切流
 ├─ 单接口异常？  → 状态码分类：5xx→后端链路（trace id），4xx→前端参数/鉴权变更
 ├─ 单页面异常？  → 该页错误聚类 top1 + 面包屑回放 → 定位代码段
 ├─ 单版本异常？  → 回滚该版本，事后排查
 └─ 单用户投诉？  → 会话回放 + 设备/网络画像 → 大概率边缘 case，加日志复现
\`\`\`

实际案例：某次"首页白屏率 0.1%→2%"告警的完整动线——定界（仅 Android WebView 渠道，18:30 开始，对齐 18:25 的一次配置变更：WebView 内核灰度升级）→ 定位（该渠道错误聚类 top1 是 "ResizeObserver is not defined"，老内核无此 API）→ 归因（新上的图表库用了 ResizeObserver 未做 polyfill，灰度渠道命中老内核）→ 止血（关闭该渠道的图表功能开关，5 分钟白屏率回落）→ 复盘（改进项：新 API 使用前查 caniuse 基线 + 灰度渠道覆盖老内核 + polyfill 自动注入检查进 CI）。整个处置 25 分钟，靠的是预置的"渠道×指标"下钻看板和功能开关系统，而非临时英雄主义。

踩坑与 tradeoff：最常见的反模式是"先怀疑代码再看数据"——凭直觉翻两小时代码，不如先看 5 分钟监控定界；告警与 dashboard 脱节——告警文案里必须带直达下钻看板的链接（携带时间窗和过滤条件），否则每个告警都要从零拼装查询；会话回放类工具（rrweb 录屏）是疑难杂症的核武器但要过隐私评审（输入脱敏、采样率低、留存期短）；"无法复现"不等于"不存在"——低频问题用"日志增强 + 拉长观察窗"策略，给关键路径预埋可动态开启的 debug 日志（配置中心下发开关）；复盘不追责是文化底线——追责文化下大家藏问题，改进项永远落不了地；把排查经验产品化——每次事故的决策路径沉淀进 runbook，新人照着 runbook 能处理 70% 的常见问题，这才是体系对抗个人英雄主义。`,
    keyPoints: ["先定界再定位：影响面+时间点对齐变更", "先止血再归因：回滚/降级优先于修代码", "四层下钻：指标→页面→接口→会话", "复盘产品化：runbook 沉淀决策路径"],
    followUps: ["如何设计变更事件与监控大盘的自动关联？", "rrweb 会话录屏的原理与隐私脱敏方案？"],
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