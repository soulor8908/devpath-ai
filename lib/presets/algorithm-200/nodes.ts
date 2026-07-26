// lib/presets/algorithm-200/nodes.ts
// 算法 200 题知识树：18 个专题节点（Phase1 基础 8 / Phase2 进阶 8 / Phase3 冲刺 2）
//
// 设计说明（相比旧版 14 节点的改进）：
//   - 新增 p1-bit-math（位运算与数学）：136/191/231 这类题在旧库散落到数组/DP，技巧体系断裂
//   - 新增 p2-prefix-sum（前缀和与差分）：560/523/437/1109 是大厂新高频，旧库埋在哈希/高频杂项里
//   - 新增 p2-string-adv（字符串进阶）：KMP/回文/最小覆盖子串独立成专题，旧库只有题没有体系
//   - 新增 p2-design（分治与设计）：LRU/LFU/序列化/设计数据结构是面试"工程设计"考察点
//   - 堆、哈希、栈队列等旧节点题目数量过少（4-6 题），扩充到 8-12 题
//   - 每道题答案为深度结构：题意约束 → 思路推导（从暴力到最优）→ 正确性要点
//     → 复杂度对比 → 代码 → 边界易错 → 举一反三 → 实际工程应用

import type { KnowledgeNode } from "../../types";

export const ALGORITHM_200_NODES: KnowledgeNode[] = [
  // --- Phase 1：基础筑基（8 节点） ---
  {
    id: "p1-array-string",
    title: "数组与字符串",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary:
      "数组基本功决定上限。四大范式：双指针（对撞求和/快慢去重）、滑动窗口（子串约束问题统一框架：右扩左缩+窗口状态）、原地操作（下标即哈希，如缺失的第一个正数）、排序后贪心扫描。掌握「为什么移动这个指针」的排除法论证，比背代码重要。",
    mastery: 0,
    customOrder: 1,
  },
  {
    id: "p1-hash",
    title: "哈希表",
    difficulty: 2,
    prerequisites: ["p1-array-string"],
    frequency: "高",
    bigTech: true,
    summary:
      "用空间换时间的典范：O(1) 查找/计数/去重/映射。进阶考点：设计自定义 key（异位词=排序串或计数数组）、双向映射（同构字符串）、哈希+数组实现 O(1) 随机化（380 的交换删除技巧）。理解哈希冲突与负载因子是追问重灾区。",
    mastery: 0,
    customOrder: 2,
  },
  {
    id: "p1-linkedlist",
    title: "链表",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary:
      "链表题考的是指针操作的严谨性。三板斧：虚拟头节点（统一删除/插入边界）、快慢指针（中点/判环/倒数第K）、三指针反转（迭代与递归都要会）。画图推演指针变化是避免断链的唯一方法。",
    mastery: 0,
    customOrder: 3,
  },
  {
    id: "p1-stack-queue",
    title: "栈与队列（含单调栈/单调队列）",
    difficulty: 3,
    prerequisites: ["p1-array-string"],
    frequency: "高",
    bigTech: true,
    summary:
      "栈处理「最近相关性」：括号匹配、表达式求值、路径化简。单调栈解决「下一个更大元素」族问题（每日温度/接雨水/最大矩形），核心不变式：栈内元素单调，出栈时刻即答案时刻。单调队列维护滑动窗口最值，均摊 O(1)。",
    mastery: 0,
    customOrder: 4,
  },
  {
    id: "p1-tree",
    title: "二叉树与 BFS/DFS",
    difficulty: 3,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary:
      "递归三要素：函数定义、终止条件、单层逻辑。遍历体系：DFS（前中后序，递归+迭代都要会）、BFS 层序（队列+分层标记）。BST 利用中序有序性。路径问题用「自上而下传值」或「自下而上返回值」两种范式。",
    mastery: 0,
    customOrder: 5,
  },
  {
    id: "p1-backtrack",
    title: "回溯",
    difficulty: 4,
    prerequisites: ["p1-tree"],
    frequency: "高",
    bigTech: true,
    summary:
      "回溯 = 暴力搜索 + 剪枝，本质是 DFS 遍历决策树。统一模板：路径记录 → 选择列表 → 做选择 → 递归 → 撤销选择。排列用 used 数组，组合/子集用 startIndex 控制层序，去重先排序再跳过同层重复元素。",
    mastery: 0,
    customOrder: 6,
  },
  {
    id: "p1-sort-binary",
    title: "排序与二分",
    difficulty: 3,
    prerequisites: ["p1-array-string"],
    frequency: "高",
    bigTech: true,
    summary:
      "二分的本质是「排除一半搜索空间」，不止用于有序数组：旋转数组（判断哪半有序）、二分答案（珂珂吃香蕉/运力问题，单调性判定是钥匙）。排序后处理是区间问题（合并/插入/交集）的万能前置。边界写法：l<=r 配 mid±1。",
    mastery: 0,
    customOrder: 7,
  },
  {
    id: "p1-bit-math",
    title: "位运算与数学",
    difficulty: 2,
    prerequisites: ["p1-array-string"],
    frequency: "中",
    bigTech: true,
    summary:
      "位运算四大件：异或消重（a^a=0）、lowbit（x&-x 取最低位1）、n&(n-1) 消最低位1（判2的幂/数1的个数）、位图压缩状态。数学题考溢出处理（整数反转）与快速幂（倍增思想，O(logN)）。",
    mastery: 0,
    customOrder: 8,
  },
  // --- Phase 2：进阶突破（8 节点） ---
  {
    id: "p2-prefix-sum",
    title: "前缀和与差分",
    difficulty: 3,
    prerequisites: ["p1-array-string", "p1-hash"],
    frequency: "高",
    bigTech: true,
    summary:
      "区间和 O(1) 查询的基石。核心恒等式 sum(i..j)=pre[j+1]-pre[i]，配合哈希表把「计数满足条件的区间」降为 O(n)。差分是前缀和的逆运算：区间加减 O(1) 打标记，最后一次性还原。树上前缀和解决路径和问题。",
    mastery: 0,
    customOrder: 9,
  },
  {
    id: "p2-dp",
    title: "动态规划",
    difficulty: 4,
    prerequisites: ["p1-array-string", "p1-backtrack"],
    frequency: "高",
    bigTech: true,
    summary:
      "DP 五部曲：状态定义（dp 数组含义）→ 转移方程 → 初始化 → 遍历顺序 → 举例验证。四大模型：线性 DP（打家劫舍/股票状态机）、背包（01/完全，组合数遍历顺序是分水岭）、子序列（LIS/LCS/编辑距离）、区间 DP。先写记忆化搜索再改递推是最稳的路径。",
    mastery: 0,
    customOrder: 10,
  },
  {
    id: "p2-graph",
    title: "图论",
    difficulty: 4,
    prerequisites: ["p1-tree", "p1-backtrack"],
    frequency: "中",
    bigTech: true,
    summary:
      "建图是第一步：邻接表 vs 邻接矩阵。遍历即 Flood Fill（岛屿/腐烂橘子），多源 BFS 从所有源点同时入队。拓扑排序用入度表（Kahn）或 DFS 三色标记判环。并查集路径压缩+按秩合并近 O(1)。最短路：BFS（无权）/Dijkstra（非负权）/Bellman-Ford（负权/限K站）。",
    mastery: 0,
    customOrder: 11,
  },
  {
    id: "p2-heap",
    title: "堆与优先队列",
    difficulty: 4,
    prerequisites: ["p1-sort-binary"],
    frequency: "中",
    bigTech: true,
    summary:
      "堆是「动态维护极值」的唯一答案。Top-K 用 K 大小顶堆（反直觉：求最大用小顶堆）、双堆求动态中位数（大顶存小半+小顶存大半）、K 路归并（合并K链表/最小K对）。贪心+堆组合是 IPO/任务调度类题的标配。",
    mastery: 0,
    customOrder: 12,
  },
  {
    id: "p2-greedy",
    title: "贪心",
    difficulty: 3,
    prerequisites: ["p1-sort-binary"],
    frequency: "中",
    bigTech: true,
    summary:
      "贪心的难点不在代码在证明：局部最优 → 全局最优需要交换论证或反证。经典套路：区间问题按右端点排序、跳跃游戏维护最远可达、二维约束先固定一维（重建队列）、分发类双向扫描（糖果）。想不出证明就换 DP。",
    mastery: 0,
    customOrder: 13,
  },
  {
    id: "p2-string-adv",
    title: "字符串进阶（KMP/回文/窗口）",
    difficulty: 4,
    prerequisites: ["p1-array-string"],
    frequency: "中",
    bigTech: true,
    summary:
      "KMP 的核心是 next 数组：模式串自我匹配的最长公共前后缀，失配时 O(1) 回退，整体 O(n+m)。回文三板斧：中心扩展 O(n²)、DP、Manacher O(n)。Hard 级滑动窗口（最小覆盖子串）用「need/have 双计数+valid 收缩」框架。",
    mastery: 0,
    customOrder: 14,
  },
  {
    id: "p2-design",
    title: "分治与设计",
    difficulty: 4,
    prerequisites: ["p1-hash", "p1-linkedlist", "p1-tree"],
    frequency: "中",
    bigTech: true,
    summary:
      "设计题考察数据结构组合能力：LRU=哈希表+双向链表（O(1) 定位+O(1) 移动），LFU 再加一层 freq→链表映射。O(1) 随机化=数组+哈希下标+换尾删除。序列化用先序+空标记或 BFS。面试必写测试用例驱动设计。",
    mastery: 0,
    customOrder: 15,
  },
  {
    id: "p2-highfreq",
    title: "高频面试题",
    difficulty: 3,
    prerequisites: ["p1-array-string", "p1-linkedlist", "p1-tree"],
    frequency: "高",
    bigTech: true,
    summary:
      "面试出场率最高的综合题：最大子数组和（Kadane）、回文链表/相交链表（快慢指针组合拳）、LCA（递归返回值语义）、矩阵操作（原地标记/螺旋边界收缩/旋转=转置+翻转）。这些题要求 10 分钟内无 bug 秒杀。",
    mastery: 0,
    customOrder: 16,
  },
  // --- Phase 3：冲刺保温（2 节点） ---
  {
    id: "p3-bytedance-tencent",
    title: "字节/腾讯高频",
    difficulty: 5,
    prerequisites: ["p2-dp", "p2-graph", "p1-stack-queue"],
    frequency: "高",
    bigTech: true,
    summary:
      "困难题集中营：正则/通配符匹配（二维 DP 的*号处理）、单调栈三部曲（去除重复字母/移掉K位/拼接最大数）、N皇后与数独（回溯+位运算加速）、大数运算（atoi/字符串相乘的边界地狱）。考察代码鲁棒性与边界意识。",
    mastery: 0,
    customOrder: 17,
  },
  {
    id: "p3-ali-meituan",
    title: "阿里/美团高频",
    difficulty: 5,
    prerequisites: ["p2-dp", "p2-graph", "p2-heap"],
    frequency: "高",
    bigTech: true,
    summary:
      "BFS 进阶（单词接龙的建图优化/滑动谜题的状态编码）、Trie+回溯剪枝（单词搜索II）、状态机 DP（冷冻期/手续费股票）、区间 DP（戳气球）、DFS+记忆化（矩阵最长路径）。考察多知识点融合与状态抽象能力。",
    mastery: 0,
    customOrder: 18,
  },
];
