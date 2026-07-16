// lib/ai/templates.ts
// AI 拆解失败时的降级预设模板（5 套常见主题，每套 8 节点）

import type { KnowledgeNode } from "../types";

export const FALLBACK_TEMPLATES: Record<string, KnowledgeNode[]> = {
  前端性能: [
    { id: "k1", title: "浏览器渲染原理与关键渲染路径", difficulty: 2, prerequisites: [], frequency: "高", summary: "DOM/CSSOM/Render Tree/Layout/Paint/Composite 流程", mastery: 0 },
    { id: "k2", title: "重排(Reflow)与重绘(Repaint)优化", difficulty: 3, prerequisites: ["k1"], frequency: "高", summary: "减少 reflow/repaint，使用 transform/opacity 替代几何属性", mastery: 0 },
    { id: "k3", title: "资源加载优化（preload/prefetch/懒加载）", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "关键资源 preload，非关键 prefetch，图片懒加载", mastery: 0 },
    { id: "k4", title: "代码分割与按需加载", difficulty: 3, prerequisites: ["k3"], frequency: "中", summary: "动态 import()、React.lazy、路由级分割", mastery: 0 },
    { id: "k5", title: "图片优化（WebP/AVIF/响应式）", difficulty: 2, prerequisites: ["k3"], frequency: "中", summary: "现代图片格式、srcset、picture 标签", mastery: 0 },
    { id: "k6", title: "JS 执行优化（防抖/节流/Web Worker）", difficulty: 3, prerequisites: ["k1"], frequency: "中", summary: "减少主线程阻塞，耗时任务移入 Worker", mastery: 0 },
    { id: "k7", title: "缓存策略（HTTP 缓存/Service Worker/CDN）", difficulty: 4, prerequisites: ["k3"], frequency: "高", summary: "强缓存/协商缓存、SW 离线缓存、CDN 边缘缓存", mastery: 0 },
    { id: "k8", title: "Core Web Vitals 与性能指标", difficulty: 3, prerequisites: ["k1", "k2"], frequency: "高", summary: "LCP/FID/CLS/INP 指标优化与测量", mastery: 0 },
  ],
  React基础: [
    { id: "k1", title: "JSX 本质与 React.createElement", difficulty: 1, prerequisites: [], frequency: "高", summary: "JSX 编译为 createElement 调用", mastery: 0 },
    { id: "k2", title: "React 组件生命周期", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "mount/update/unmount 三阶段", mastery: 0 },
    { id: "k3", title: "Hooks 基础（useState/useEffect）", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "状态管理与副作用处理", mastery: 0 },
    { id: "k4", title: "Hooks 进阶（useMemo/useCallback/useRef）", difficulty: 3, prerequisites: ["k3"], frequency: "中", summary: "性能优化与引用稳定性", mastery: 0 },
    { id: "k5", title: "React diff 算法与 key 属性", difficulty: 3, prerequisites: ["k1"], frequency: "高", summary: "虚拟 DOM 同层比较，key 的作用", mastery: 0 },
    { id: "k6", title: "Fiber 架构与时间切片", difficulty: 4, prerequisites: ["k5"], frequency: "中", summary: "可中断渲染、优先级调度", mastery: 0 },
    { id: "k7", title: "Context 与状态管理", difficulty: 3, prerequisites: ["k3"], frequency: "中", summary: "Context API、跨组件数据传递", mastery: 0 },
    { id: "k8", title: "React 性能优化策略", difficulty: 4, prerequisites: ["k4", "k5"], frequency: "高", summary: "memo/懒加载/虚拟列表", mastery: 0 },
  ],
  TypeScript: [
    { id: "k1", title: "基础类型与类型注解", difficulty: 1, prerequisites: [], frequency: "高", summary: "string/number/boolean/数组/元组", mastery: 0 },
    { id: "k2", title: "接口(Interface)与类型别名(Type Alias)", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "对象形状定义，interface vs type", mastery: 0 },
    { id: "k3", title: "泛型(Generic)", difficulty: 3, prerequisites: ["k1", "k2"], frequency: "高", summary: "可复用类型组件，泛型约束", mastery: 0 },
    { id: "k4", title: "联合类型与交叉类型", difficulty: 2, prerequisites: ["k1"], frequency: "中", summary: "| 和 & 操作符", mastery: 0 },
    { id: "k5", title: "类型守卫与类型收窄", difficulty: 3, prerequisites: ["k4"], frequency: "中", summary: "typeof/instanceof/in/自定义守卫", mastery: 0 },
    { id: "k6", title: "映射类型与条件类型", difficulty: 4, prerequisites: ["k3", "k4"], frequency: "中", summary: "Partial/Required/Pick/Omit/Record", mastery: 0 },
    { id: "k7", title: "工具类型(Utility Types)", difficulty: 2, prerequisites: ["k2"], frequency: "高", summary: "内置工具类型使用", mastery: 0 },
    { id: "k8", title: "装饰器与元数据", difficulty: 4, prerequisites: ["k3"], frequency: "低", summary: "类装饰器、方法装饰器、reflect-metadata", mastery: 0 },
  ],
  算法基础: [
    { id: "k1", title: "时间复杂度与空间复杂度", difficulty: 1, prerequisites: [], frequency: "高", summary: "Big-O 表示法，常见复杂度排序", mastery: 0 },
    { id: "k2", title: "数组与双指针", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "快慢指针、左右指针", mastery: 0 },
    { id: "k3", title: "链表操作", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "反转、合并、环检测", mastery: 0 },
    { id: "k4", title: "栈与队列", difficulty: 2, prerequisites: ["k1"], frequency: "中", summary: "LIFO/FIFO、单调栈", mastery: 0 },
    { id: "k5", title: "二叉树遍历与递归", difficulty: 3, prerequisites: ["k1"], frequency: "高", summary: "前/中/后/层序遍历", mastery: 0 },
    { id: "k6", title: "排序算法", difficulty: 3, prerequisites: ["k2"], frequency: "高", summary: "快排/归并/堆排", mastery: 0 },
    { id: "k7", title: "二分查找", difficulty: 3, prerequisites: ["k2"], frequency: "中", summary: "有序数组查找、边界处理", mastery: 0 },
    { id: "k8", title: "动态规划入门", difficulty: 4, prerequisites: ["k5"], frequency: "中", summary: "状态转移方程、经典 DP 题", mastery: 0 },
  ],
  系统设计: [
    { id: "k1", title: "系统设计基础流程", difficulty: 2, prerequisites: [], frequency: "高", summary: "需求分析→容量估算→架构设计→详细设计", mastery: 0 },
    { id: "k2", title: "负载均衡", difficulty: 3, prerequisites: ["k1"], frequency: "高", summary: "L4/L7 LB、常见算法、Nginx/HAProxy", mastery: 0 },
    { id: "k3", title: "缓存策略", difficulty: 3, prerequisites: ["k1"], frequency: "高", summary: "Cache-aside/Write-through/Write-back", mastery: 0 },
    { id: "k4", title: "数据库分片与复制", difficulty: 4, prerequisites: ["k1"], frequency: "中", summary: "主从复制、读写分离、分库分表", mastery: 0 },
    { id: "k5", title: "消息队列", difficulty: 4, prerequisites: ["k1"], frequency: "中", summary: "Kafka/RabbitMQ、异步解耦", mastery: 0 },
    { id: "k6", title: "微服务架构", difficulty: 4, prerequisites: ["k2"], frequency: "中", summary: "服务拆分、注册发现、API 网关", mastery: 0 },
    { id: "k7", title: "CDN 与边缘缓存", difficulty: 3, prerequisites: ["k3"], frequency: "中", summary: "静态资源加速、动态加速", mastery: 0 },
    { id: "k8", title: "高可用与容灾", difficulty: 4, prerequisites: ["k2", "k4"], frequency: "高", summary: "多活/灾备/降级/熔断", mastery: 0 },
  ],
};

const TEMPLATE_KEYS = Object.keys(FALLBACK_TEMPLATES);

export function getFallbackTemplate(topic: string): KnowledgeNode[] {
  // 模糊匹配主题
  for (const key of TEMPLATE_KEYS) {
    if (topic.includes(key) || key.includes(topic)) {
      return FALLBACK_TEMPLATES[key].map((n) => ({ ...n }));
    }
  }
  // 默认返回前端性能模板
  return FALLBACK_TEMPLATES["前端性能"].map((n) => ({ ...n }));
}

export function listTemplateTopics(): string[] {
  return TEMPLATE_KEYS;
}
