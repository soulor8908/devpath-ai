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
// display:none 的元素不出现在 a11y 树，但 visibility:hidden 仍在
<div style="display:none">隐藏</div>     <!-- 不在 a11y 树 -->
<div style="visibility:hidden">隐藏</div> <!-- 在树里但不可见 -->
<div aria-hidden="true">装饰</div>        <!-- 被剔除 -->
\`\`\`

踩坑：visibility:hidden 仍占 a11y 位置但读屏不读，逻辑混乱；用 opacity:0 隐藏的元素仍可聚焦被读出，需配 aria-hidden 或 tabindex="-1"。`,
    keyPoints: ["a11y 树由 DOM 衍生", "display:none 剔除节点", "aria-hidden 显式剔除"],
    followUps: ["visibility:hidden 和 display:none 对 a11y 的区别？", "如何用 DevTools 调试可访问性树？"],
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
requestAnimationFrame(() => console.log(4));  // 渲染前
console.log(5);
// 输出：1 5 3 4 2（同步→微→raf→宏）
\`\`\`

踩坑：await 后续代码相当于 .then 微任务；每轮宏任务执行完都清空所有微任务，微任务中产生的新微任务当轮清空；process.nextTick（Node）优先级高于所有微任务，浏览器无此 API。`,
    keyPoints: ["同步→微任务→渲染→宏任务", "每轮宏任务后清空全部微任务", "await 后续是微任务"],
    followUps: ["requestAnimationFrame 在哪个阶段执行？", "Node 事件循环和浏览器有何不同？"],
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
    answer: `async 函数返回 Promise，await 暂停函数等待 Promise 决议，本质是 Generator + 自动执行器的语法糖。优势：写法像同步、try/catch 能捕获、调试栈清晰。

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

踩坑：循环中逐个 await 是串行（慢），并发用 Promise.all；await 后的代码是微任务；顶层 await（模块内）会阻塞依赖该模块的代码。`,
    keyPoints: ["async 返回 Promise", "await 暂停等决议", "Generator+自动执行语法糖"],
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
iframe.contentWindow.[].constructor === Array; // false（不同 Array）
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
    answer: `CommonJS：运行时加载（require 同步）、值为拷贝、可动态、Node 主用。ESM：编译时确定依赖（静态结构）、值为引用（导出变化反映）、支持 Tree Shaking、顶层 this 是 undefined。

\`\`\`js
// CommonJS：值的拷贝
// lib.js
let count = 0; module.exports = { count, inc() { count++; } };
// main.js
const { count, inc } = require("./lib");
inc(); console.log(count); // 0（拷贝，不变）
// ESM：值的引用
// lib.mjs
export let count = 0; export function inc() { count++; }
// main.mjs
import { count, inc } from "./lib.mjs";
inc(); console.log(count); // 1（引用，反映变化）
\`\`\`

踩坑：ESM 顶层 await 可用，CJS 不行；ESM 文件 .mjs 或 package.json type:module；循环依赖 ESM 通过引用可能拿到未初始化值（TDZ 报错），CJS 拿到部分导出。`,
    keyPoints: ["CJS 运行时+值拷贝 / ESM 编译时+值引用", "ESM 支持 Tree Shaking", "ESM 顶层 await"],
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
document.cookie = "token=xxx; Path=/; Secure; SameSite=Strict";
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
    answer: `Fiber 把渲染工作拆成可中断/恢复的单元（fiber 节点链表），让大渲染任务能分片到多帧执行，避免长时间阻塞主线程。时间切片：每个帧空闲时间（5ms）执行 work，到期让出，下帧继续。

\`\`\`jsx
// Fiber 前：递归渲染不可中断，大列表卡 100ms 掉帧
// Fiber 后：可中断恢复，帧率保持 60fps
// 每个 fiber 节点有 child/sibling/return 指针形成链表
{
  type: "div", key: null, stateNode: domEl,
  child: fiberA, sibling: fiberB, return: parentFiber,
  pendingProps: {}, memoizedState: {}, flags: 0,
}
// 调度：shouldYield() 检查时间片到期则让出
while (nextUnitOfWork && !shouldYield()) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
}
\`\`\`

踩坑：Fiber 让 useTransition/useDeferredValue 成为可能；中断恢复需处理优先级（lane 模型）；fiber 节点是内部实现，业务代码不应直接操作。`,
    keyPoints: ["Fiber 可中断恢复渲染", "时间切片 5ms 让出", "fiber 链表 child/sibling/return"],
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
    question: "React Server Components（RSC）的原理和优势？",
    bigTech: true,
    answer: `RSC 在服务端渲染成序列化描述发送到客户端，不发送组件代码（零 JS），可直接访问后端资源。客户端组件（"use client"）可水合交互。优势：减少 bundle、直接查 DB、流式渲染。

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

踩坑：Server 组件不能用 useState/onClick（无客户端 JS）；Client 组件不能 async（需 useEffect）；Server→Client 边界需 props 序列化（不能传函数/类实例）；Next.js App Router 默认 RSC。`,
    keyPoints: ["RSC 服务端渲染零 JS", "直连 DB 减 bundle", "use client 划边界"],
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
// useTransition：搜索框输入不阻塞列表渲染
function Search() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  return <>
    <input value={query} onChange={e => setQuery(e.target.value)} /> {/* 高优先级 */}
    <button onClick={() => startTransition(() => setQuery(query))}>搜索</button>
    {isPending ? <Spinner /> : <List query={query} />} {/* 低优先级 */}
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
const Child = defineProps(["modelValue"]);
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

踩坑：selector 返回新对象每次不同会死循环，用 shallow 比较或拆字段；Zustand 无时间旅行（Redux 有）；中间件少（persist/immer）但够用。字节飞书部分模块用 Zustand 替代 Redux 减少模板。`,
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
    question: "React Router v6 相比 v5 有哪些变化？核心 API？",
    bigTech: true,
    answer: `v6 变化：路由配置用 Routes/Route（switch 语义）、嵌套路由 Outlet、useNavigate 替代 useHistory、loader/action 数据获取、类型安全更好。

\`\`\`jsx
import { Routes, Route, Link, Outlet, useNavigate, useParams } from "react-router-dom";
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="users/:id" element={<User />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
function Layout() { return <div><Outlet /></div>; } {/* 嵌套出口 */}
function User() { const { id } = useParams(); const nav = useNavigate(); return <button onClick={() => nav("/")}>返回</button>; }
\`\`\`

踩坑：v6 嵌套路由需 Outlet 出口；路径相对父级（path="users" 非绝对）；v6.4+ 的 createBrowserRouter 支持 loader/action 数据获取；useNavigate 替代 useHistory。`,
    keyPoints: ["Routes/Route switch 语义", "Outlet 嵌套出口", "loader/action 数据获取"],
    followUps: ["v6 的 loader 如何用？", "createBrowserRouter 和 Router 区别？"],
    favorited: false,
  },
  {
    id: "fe-135",
    nodeId: "router-data",
    question: "Next.js App Router 的数据获取方式有哪些？",
    bigTech: true,
    answer: `App Router 在 Server Component 中直接 async/await 获取数据（服务端执行），Client Component 用 SWR/React Query。缓存：fetch 的 cache 选项、revalidate、ISR。

\`\`\`tsx
// Server Component：直接 async 查数据
async function Products() {
  const res = await fetch("https://api/products", { next: { revalidate: 60 } }); // ISR 60 秒
  const data = await res.json();
  return data.map(p => <Product key={p.id} {...p} />);
}
// 动态路由：按需
async function Product({ params }) {
  const res = await fetch(\`https://api/products/\${params.id}\`, { cache: "no-store" }); // 实时
  return <div>{(await res.json()).name}</div>;
}
// Client Component：SWR
"use client";
function useProducts() { return useSWR("/api/products", fetcher); }
\`\`\`

踩坑：Server 组件 fetch 默认缓存（force-static），动态数据加 cache:"no-store"；revalidate 控制 ISR 重新生成；generateStaticParams 预生成静态页面。`,
    keyPoints: ["Server Component 直接 async", "fetch cache/revalidate 控制", "Client 用 SWR/React Query"],
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
    question: "React Query 的缓存策略如何工作？staleTime 和 cacheTime 区别？",
    bigTech: true,
    answer: `React Query 按 queryKey 缓存。staleTime：数据"新鲜期"内不重新请求；cacheTime：缓存保留时间（无观察者后倒计时清除）。还有失效 invalidateQueries、预取 prefetchQuery。

\`\`\`js
const { data } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 60000,    // 1 分钟内不重新请求（视为新鲜）
  cacheTime: 300000,   // 5 分钟无组件观察后清除缓存
  refetchOnWindowFocus: true,
});
// 失效：标记过期，重新请求
queryClient.invalidateQueries({ queryKey: ["todos"] });
// 预取：路由跳转前先加载
queryClient.prefetchQuery({ queryKey: ["user", id], queryFn: () => fetchUser(id) });
\`\`\`

踩坑：staleTime=0（默认）每次组件挂载都重请求；cacheTime 默认 5 分钟；invalidateQueries 标记 stale 触发重取；queryKey 含参数自动按参数缓存（["user", 1] 与 ["user", 2] 独立）。`,
    keyPoints: ["staleTime 新鲜期不重请求", "cacheTime 无观察者后清除", "invalidate 触发重取"],
    followUps: ["React Query 如何预取？", "queryKey 设计原则？"],
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

踩坑：依赖多时首次预构建有延迟（可用 optimizeDeps.include 预声明）；CJS 依赖需预构建转 ESM；HMR 通过 WebSocket 推送变更模块，按 ESM 边界失效。`,
    keyPoints: ["dev 原生 ESM 按需编译", "esbuild 极速编译", "生产 Rollup 打包"],
    followUps: ["Vite 依赖预构建做什么？", "Vite HMR 原理？"],
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

踩坑：Babel 插件生态最全（特殊语法转换 SWC 可能不支持）；SWC 是 Next.js 默认（替代 Babel+Terser）；esbuild 不做类型检查（tsc 单独跑）；Turbopack（Rust）是 Webpack 替代品（Next.js 实验）。`,
    keyPoints: ["esbuild(Go)/SWC(Rust) 原生极速", "比 Babel 快 10-100x", "Babel 插件生态最全"],
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
    question: "Turbopack 和 Vite/Webpack 有什么区别？",
    bigTech: false,
    answer: `Turbopack（Rust，Vercel）是 Webpack 作者新作，增量编译缓存极致，Next.js 集成。Vite 利用原生 ESM，Turbopack 自带模块图缓存。两者都比 Webpack 快，Turbopack 更适合大型 Next 项目。

\`\`\`js
// Next.js 启用 Turbopack（实验）
next dev --turbo
// 增量编译：函数级缓存，改一个函数只重编该函数
// Vite：按请求编译 ESM，依赖预构建缓存
// Webpack：全量打包，HMR 增量但慢
\`\`\`

踩坑：Turbopack 仍在 beta（部分 Webpack loader 不兼容）；Vite 生态成熟更通用；Turbopack 在超大项目（万文件）缓存优势明显；Rust 编译器初期生态少。`,
    keyPoints: ["Turbopack(Rust) 增量缓存", "函数级缓存极致", "Next.js 集成"],
    followUps: ["Turbopack 函数级缓存原理？", "Turbopack 和 Vite 选型？"],
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
// CLS 优化：图片/广告位预留尺寸
<img width="800" height="600" /> // 预留防偏移
.ad-slot { min-height: 250px; } // 广告位预留
// 测量
new PerformanceObserver(list => list.getEntries().forEach(e => console.log(e)));
\`\`\`

踩坑：LCP 通常是首屏大图/大文字，预加载关键资源；CLS 多因异步加载图片/字体/广告无尺寸；INP 替代 FID（FID 只测首次输入），更严格。美团首屏 LCP 从 3.2s 优化到 1.8s。`,
    keyPoints: ["LCP<2.5s / INP<200ms / CLS<0.1", "LCP 预加载关键资源", "CLS 预留尺寸防偏移"],
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
document.cookie = "token=xxx; HttpOnly; Secure; SameSite=Strict";
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
// 开发代理（Vite）
server: { proxy: { "/api": { target: "https://api.com", changeOrigin: true } } }
// 生产代理：Nginx 反代
location /api { proxy_pass https://api.com; }
\`\`\`

踩坑：带 Cookie 时 Allow-Origin 不能是 *（需具体域名）且 Allow-Credentials:true；预检请求缓存（Access-Control-Max-Age）减少 OPTIONS；简单请求条件：GET/POST/HEAD + 安全 Header。`,
    keyPoints: ["同源=协议+域名+端口", "CORS 服务端配 Allow-Origin", "带 Cookie 不能用 *"],
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
    question: "Vercel AI SDK 的 useChat 如何工作？核心 API？",
    bigTech: true,
    answer: `useChat 是 AI SDK 的 React Hook，封装消息流式接收、状态管理、发送逻辑。自动管理 messages/input/handleSubmit，流式更新 UI。

\`\`\`tsx
import { useChat } from "ai/react";
function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat", // 后端流式接口
  });
  return (
    <div>
      {messages.map(m => <div key={m.id}>{m.role}: {m.content}</div>)}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">发送</button>
        {isLoading && <button onClick={stop}>停止</button>}
      </form>
    </div>
  );
}
\`\`\`

踩坑：useChat 自动处理流式 SSE 解析；messages 是受控状态，可用 setMessages 修改（编辑/删除）；onFinish 回调拿完整响应；多轮对话自动带历史发送后端。`,
    keyPoints: ["useChat 封装流式消息状态", "自动 SSE 解析", "stop 可中断"],
    followUps: ["useChat 如何处理工具调用？", "useChat 和 useCompletion 区别？"],
    favorited: false,
  },
  {
    id: "fe-177",
    nodeId: "ai-sdk-frontend",
    question: "AI SDK 如何在前端实现流式 UI（Streaming UI）？",
    bigTech: true,
    answer: `流式 UI：后端流式返回 token，前端逐 token 渲染（打字机效果）。AI SDK 用 streamText + useChat，后端返回流，前端 React state 逐块更新。

\`\`\`ts
// 后端 route.ts（AI SDK）
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
export async function POST(req) {
  const { messages } = await req.json();
  const result = streamText({ model: openai("gpt-4"), messages });
  return result.toDataStreamResponse(); // 流式响应
}
// 前端：useChat 自动接收流，messages.content 逐 token 增长
const { messages } = useChat();
messages[messages.length - 1].content; // 实时增长
\`\`\`

踩坑：流式 UI 用 useChat 自动处理，手动需解析 SSE/ReadableStream；逐 token 渲染避免整段闪烁；Markdown 流式需增量解析（未闭合标签处理）；用 useTransition 防高频更新卡顿。`,
    keyPoints: ["streamText 返回流", "useChat 自动逐 token 更新", "Markdown 增量解析"],
    followUps: ["Markdown 流式如何处理未闭合标签？", "流式渲染如何防卡顿？"],
    favorited: false,
  },
  {
    id: "fe-178",
    nodeId: "ai-sdk-frontend",
    question: "AI SDK 工具调用（Tool Calling）前端如何渲染？",
    bigTech: false,
    answer: `工具调用：模型决定调工具（如查天气/搜索），前端渲染工具状态（调用中/结果），结果回传模型继续。AI SDK 用 tools + streamText，前端检测 toolInvocations 渲染。

\`\`\`ts
// 后端：定义工具
const result = streamText({
  model, messages,
  tools: {
    weather: { description: "查天气", parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => getWeather(city) },
  },
});
// 前端：渲染工具调用状态
{messages.map(m => m.toolInvocations?.map(t => (
  <div key={t.toolCallId}>
    {t.state === "call" && <Spinner>调用 {t.toolName}</Spinner>}
    {t.state === "result" && <Weather data={t.result} />}
  </div>
)))}
\`\`\`

踩坑：工具调用可能多轮（模型调多个工具）；前端需处理 call/result 两态；人工确认工具（human-in-the-loop）用 addToolResult 手动回传结果。`,
    keyPoints: ["tools 定义模型可调用", "toolInvocations 渲染 call/result", "人工确认可手动回传"],
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
// 后端：按参数选模型
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
export async function POST(req) {
  const { messages, model } = await req.json();
  const m = model === "claude" ? anthropic("claude-3") : openai("gpt-4");
  return streamText({ model: m, messages }).toDataStreamResponse();
}
// 前端：切换模型
const { setInput } = useChat({ body: { model: selectedModel } });
<select onChange={e => setSelectedModel(e.target.value)}>
  <option value="gpt">GPT-4</option>
  <option value="claude">Claude</option>
</select>
\`\`\`

踩坑：不同模型 token 计费/上下文长度不同，前端需提示；流式格式可能略异（AI SDK 已统一）；并发对比用 Promise.all 但注意限流。`,
    keyPoints: ["AI SDK 统一接口切模型", "前端传 model 参数", "并发可对比多模型"],
    followUps: ["不同模型流式格式差异？", "如何做模型 A/B 测试？"],
    favorited: false,
  },
  {
    id: "fe-180",
    nodeId: "ai-sdk-frontend",
    question: "AI SDK 的 Data Stream 协议是什么？",
    bigTech: false,
    answer: `Data Stream 是 AI SDK 自定义的流式协议，用特定前缀标记不同数据类型（text/tool-call/tool-result/error），前端按协议解析。

\`\`\`text
# Data Stream 格式（简化）
0:"Hello"        # text chunk
9:{"toolCallId":"x","toolName":"weather","args":{}}  # tool call
a:{"toolCallId":"x","result":{}}  # tool result
3:"错误信息"      # error
d:{"finishReason":"stop"}  # finish
\`\`\`
\`\`\`ts
// toDataStreamResponse 生成该格式
return result.toDataStreamResponse();
// 前端 useChat 自动解析（也可手动用 useChatParser）
\`\`\`

踩坑：Data Stream 比 SSE 更结构化（区分文本/工具/错误）；手动解析用 @ai-sdk/react 的 parseDataStream；自定义数据用 streamData 追加自定义部分。`,
    keyPoints: ["Data Stream 前缀标记类型", "区分 text/tool/error", "比 SSE 更结构化"],
    followUps: ["Data Stream 和 SSE 区别？", "如何追加自定义数据？"],
    favorited: false,
  },
  {
    id: "fe-181",
    nodeId: "ai-sdk-frontend",
    question: "AI 请求前端如何做错误处理和重试？",
    bigTech: false,
    answer: `AI 请求可能失败（限流/超时/模型错误）。useChat 的 onError 回调处理，重试用手动 reload。限流（429）指数退避，超时 AbortController。

\`\`\`tsx
const { messages, reload, error } = useChat({
  api: "/api/chat",
  onError: (err) => {
    console.error(err);
    toast.error("请求失败，请重试");
  },
});
// 重试上一条
<button onClick={() => reload()}>重试</button>
{error && <div className="error">{error.message}</div>}
// 后端限流处理
export async function POST(req) {
  try { return await streamText({...}).toDataStreamResponse(); }
  catch (e) {
    if (e.status === 429) return Response.json({ error: "请求过快" }, { status: 429 });
    return Response.json({ error: "服务错误" }, { status: 500 });
  }
}
\`\`\`

踩坑：流式中途断开需 reload 重试（已收内容可能丢失）；429 限流前端需退避提示用户等待；错误状态 UI 明确（重试按钮），不要静默失败。`,
    keyPoints: ["onError 回调处理", "reload 重试", "429 限流退避"],
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
        // 代码块未高亮完成时降级显示
        code({ inline, children }) {
          return inline ? <code>{children}</code> : <pre><code>{children}</code></pre>;
        },
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

踩坑：每次 token 都全量 re-parse Markdown 性能差，长文本需虚拟化或 memo；react-markdown 流式时代码高亮延迟切换会跳动，用 opacity 过渡；表格流式未闭合会渲染异常，建议表格整块收完再渲染。`,
    keyPoints: ["未闭合代码块补结束符", "段落级缓冲双换行", "增量解析容错"],
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
    answer: `结论：流式错误分两类——网络中断用断点续传或 reload 重试；数据解析错误需容错跳过坏 chunk。策略：保留已收内容，错误状态明确，提供"重试"而非清空。用 ErrorBoundary 兜底渲染崩溃。

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
      for (const line of buffer.split("\\n")) {
        if (!line.startsWith("data: ")) continue;
        try {
          const chunk = JSON.parse(line.slice(6)); // 单 chunk 解析失败跳过
          received += chunk.content;
          onToken(chunk.content);
        } catch {
          console.warn("跳过坏 chunk:", line);
        }
      }
      buffer = buffer.lastIndexOf("\\n") >= 0 ? "" : buffer;
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

踩坑：单个 chunk JSON 解析失败不能 throw 中断整个流，要 try/catch 跳过；网络断开重试需考虑"是否重复计费"，最好后端支持 lastEventId 续传；ErrorBoundary 包裹流式渲染区，防 Markdown 解析崩溃白屏。`,
    keyPoints: ["单 chunk 解析失败跳过不中断流", "保留已收内容供重试", "ErrorBoundary 兜底"],
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

  return { bottomRef, atBottom };
}

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

案例：扣子 Agent 调用"搜索网页"工具时，对话流中插入一个可折叠的工具调用卡片，显示搜索参数和返回结果摘要，用户可展开查看，assistant 基于搜索结果继续回答。Vercel AI SDK 的 useChat 自动管理 tool round-trip。

\`\`\`tsx
// Vercel AI SDK：tool calling 自动渲染
const { messages } = useChat({
  api: "/api/chat",
  // 工具定义在后端，前端渲染 tool invocation
});

function MessageList({ messages }) {
  return messages.map((m) => (
    <div key={m.id}>
      {/* 文本部分 */}
      {m.content && <p>{m.content}</p>}
      {/* 工具调用部分 */}
      {m.toolInvocations?.map((tool) => (
        <ToolCard key={tool.toolCallId} tool={tool} />
      ))}
    </div>
  ));
}

function ToolCard({ tool }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="tool-card">
      <div className="tool-header" onClick={() => setExpanded(!expanded)}>
        <span className="tool-icon">🔧</span>
        <span>{tool.toolName}</span>
        <span className="tool-state">
          {tool.state === "result" ? "✓ 完成" : "⏳ 调用中"}
        </span>
      </div>
      {expanded && (
        <div className="tool-detail">
          <pre>参数：{JSON.stringify(tool.args, null, 2)}</pre>
          {tool.state === "result" && (
            <pre>结果：{JSON.stringify(tool.result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
\`\`\`

踩坑：工具调用是异步 round-trip（模型→工具→模型），UI 状态机要清晰（calling→result→answering）；工具结果可能很大（如搜索返回 100 条），需折叠 + 分页；多工具并行调用时各自独立卡片；工具失败要展示错误并允许重试。`,
    keyPoints: ["toolInvocations 渲染工具卡片", "状态机 calling→result", "折叠展示参数与结果"],
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
  const result = await streamText({ model, messages });
  return result.toDataStreamResponse();
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
    answer: `结论：用适配层抽象 runtime 差异——Next.js 通过 output 标准化，或用 Hono（轻量框架，原生支持多 Edge runtime）写 API。构建产物分别适配 Vercel（@vercel/edge）和 Cloudflare（@cloudflare/next-on-pages）。共享业务逻辑，仅入口/绑定层不同。

案例：某开源 AI 工具为避免 Vercel vendor lock-in，用 Hono 写 Edge API 层，同一份代码分别部署到 Vercel Edge Functions 和 Cloudflare Pages，通过环境变量切换数据库 binding，用户可选自托管。

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

// Cloudflare Pages 入口（hono/cloudflare-pages）
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
// CF Pages: npx wrangler pages deploy .vercel/output/static
//          或用 @cloudflare/next-on-pages 转换 Next 产物
\`\`\`

踩坑：Next.js 在 Cloudflare 需用 @cloudflare/next-on-pages 转换，部分功能（ISR、image optimization）支持不全；binding 差异（Vercel KV vs CF KV）API 略不同，需适配层抹平；静态资源在 Cloudflare 直接 CDN，Vercel 需配置 headers；两平台 Edge 限制不同（CPU 时间、内存），别写重逻辑。`,
    keyPoints: ["Hono 多 runtime 适配", "env 抽象 binding 差异", "next-on-pages 转换"],
    followUps: ["Next.js 在 Cloudflare 功能差异？", "如何做自托管 fallback？"],
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