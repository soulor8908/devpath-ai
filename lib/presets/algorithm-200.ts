// lib/presets/algorithm-200.ts
// LeetCode 200 题全攻略预设：20 知识节点 + 200 道精选题（去重后）+ 20 天学习计划
// 数据来源：主项目 algorithm/leetcode-checklist.md + LeetCode Hot 100 / CodeTop 高频考点补全
// 覆盖：Phase1 基础筑基 / Phase2 进阶突破（含位运算数学/字符串匹配/单调队列栈/二分答案/Trie 并查集/图论进阶六大补丁专题）/ Phase3 冲刺保温
// 跳过"（重）"标记重复题及 Phase3 空白模拟面试部分
// 答案标准：四段式（思路推导 → TS 代码示例 → 实际应用/案例 → 踩坑与变体），全部 ≥500 字符

import type { KnowledgeNode, Question, ScheduleItem } from "../types";

// ============================================================
// 知识树节点
// ============================================================

const ALGORITHM_200_NODES: KnowledgeNode[] = [
  // --- Phase 1：基础筑基 ---
  {
    id: "p1-array-string",
    title: "数组与字符串",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary: "双指针（对撞/快慢）、滑动窗口、前缀和、原地哈希。数组下标随机访问 O(1)，双指针是核心技巧。",
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
    summary: "哈希表 O(1) 查找。前 K 高频用堆/桶排，LRU 缓存用哈希表+双向链表。",
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
    summary: "虚拟头节点简化边界、快慢指针找中点/判环、反转链表三指针。链表题画图是关键。",
    mastery: 0,
    customOrder: 3,
  },
  {
    id: "p1-stack-queue",
    title: "栈与队列",
    difficulty: 3,
    prerequisites: ["p1-array-string"],
    frequency: "高",
    bigTech: true,
    summary: "单调栈解决_next greater_类问题，双栈实现队列，括号匹配用栈。",
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
    summary: "递归是核心，前中后序/层序遍历是基础。掌握递归框架可解 80% 树题。BFS 用队列，DFS 用递归/栈。",
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
    summary: "全排列/组合/子集三大经典。回溯模板：选择-递归-撤销。剪枝优化是难点。",
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
    summary: "二分查找 O(logN)，关键在边界处理。排序后双指针/合并区间是常见套路。",
    mastery: 0,
    customOrder: 7,
  },
  // --- Phase 2：进阶突破 ---
  {
    id: "p2-dp",
    title: "动态规划",
    difficulty: 4,
    prerequisites: ["p1-array-string", "p1-backtrack"],
    frequency: "高",
    bigTech: true,
    summary: "状态定义+状态转移方程。从一维到二维，背包/子序列/区间 DP/股票系列。面试高频难点。",
    mastery: 0,
    customOrder: 8,
  },
  {
    id: "p2-graph",
    title: "图论",
    difficulty: 4,
    prerequisites: ["p1-tree", "p1-backtrack"],
    frequency: "中",
    bigTech: true,
    summary: "DFS/BFS 遍历、拓扑排序、并查集、Dijkstra 最短路。Trie 树前缀匹配。",
    mastery: 0,
    customOrder: 9,
  },
  {
    id: "p2-heap",
    title: "堆与优先队列",
    difficulty: 4,
    prerequisites: ["p1-sort-binary"],
    frequency: "中",
    bigTech: true,
    summary: "Top-K 问题用小顶堆/大顶堆，双堆求中位数，堆是动态维护极值的数据结构。",
    mastery: 0,
    customOrder: 10,
  },
  {
    id: "p2-greedy",
    title: "贪心",
    difficulty: 3,
    prerequisites: ["p1-sort-binary"],
    frequency: "中",
    bigTech: true,
    summary: "局部最优推导全局最优。区间问题先排序，跳跃/分发糖果需要策略性贪心。",
    mastery: 0,
    customOrder: 11,
  },
  {
    id: "p2-highfreq",
    title: "高频面试题",
    difficulty: 3,
    prerequisites: ["p1-array-string", "p1-linkedlist", "p1-tree"],
    frequency: "高",
    bigTech: true,
    summary: "面试最高频：最大子数组和、回文链表、相交链表、LCA、螺旋矩阵等必须秒杀；前缀和、二分答案为 2026 大厂新高频重点掌握；KMP 了解原理即可。",
    mastery: 0,
    customOrder: 12,
  },
  // --- Phase 2：补丁专题（Hot 100 之外的高频盲区） ---
  {
    id: "p2-bit-math",
    title: "位运算与数学",
    difficulty: 3,
    prerequisites: ["p1-array-string"],
    frequency: "中",
    bigTech: true,
    summary: "位运算三板斧 n&(n-1)/lowbit/异或消消乐，快速幂、埃氏筛、因子计数等数学找规律题，用 O(1) 空间换思维深度。",
    mastery: 0,
    customOrder: 13,
  },
  {
    id: "p2-string-match",
    title: "字符串匹配进阶",
    difficulty: 4,
    prerequisites: ["p1-array-string"],
    frequency: "中",
    bigTech: true,
    summary: "KMP next 数组、Rabin-Karp 滚动哈希、回文串判定与构造。next 的「最长相等前后缀」思想可迁移到周期判定与最短回文构造。",
    mastery: 0,
    customOrder: 14,
  },
  {
    id: "p2-mono-queue",
    title: "单调队列与单调栈进阶",
    difficulty: 4,
    prerequisites: ["p1-stack-queue"],
    frequency: "中",
    bigTech: true,
    summary: "单调队列维护滑动窗口极值，单调栈通杀「下一个更大元素」族问题，双单调队列维护窗口极差，环形数组用倍增展开。",
    mastery: 0,
    customOrder: 15,
  },
  {
    id: "p2-binary-answer",
    title: "二分答案进阶",
    difficulty: 4,
    prerequisites: ["p1-sort-binary"],
    frequency: "高",
    bigTech: true,
    summary: "「最小化最大值 / 最大化最小值」判定+二分范式，值域二分求第 K 小。识别答案单调性 + 写对 check 函数是两大核心。",
    mastery: 0,
    customOrder: 16,
  },
  {
    id: "p2-trie-union-find",
    title: "字典树与并查集",
    difficulty: 4,
    prerequisites: ["p1-tree", "p1-hash"],
    frequency: "中",
    bigTech: true,
    summary: "Trie 做前缀检索与 01 字典树求最大异或；并查集路径压缩+按秩合并处理动态连通性与等价关系，带权并查集处理比值约束。",
    mastery: 0,
    customOrder: 17,
  },
  {
    id: "p2-graph-advanced",
    title: "图论进阶",
    difficulty: 5,
    prerequisites: ["p2-graph"],
    frequency: "中",
    bigTech: true,
    summary: "拓扑排序进阶应用、Dijkstra 变形（最大概率/最小体力）、最小生成树 Kruskal/Prim、欧拉路径 Hierholzer。把「状态即点、转移即边」的建模能力拉满。",
    mastery: 0,
    customOrder: 18,
  },
  // --- Phase 3：冲刺保温 ---
  {
    id: "p3-bytedance-tencent",
    title: "字节/腾讯高频",
    difficulty: 5,
    prerequisites: ["p2-dp", "p2-graph", "p1-stack-queue"],
    frequency: "高",
    bigTech: true,
    summary: "字节腾讯面试高频困难题：正则匹配、LFU、数独、N 皇后、二叉树最大路径和。考察综合能力。",
    mastery: 0,
    customOrder: 19,
  },
  {
    id: "p3-ali-meituan",
    title: "阿里/美团高频",
    difficulty: 5,
    prerequisites: ["p2-dp", "p2-graph", "p2-heap"],
    frequency: "高",
    bigTech: true,
    summary: "阿里美团面试高频：合并 K 链表、单词接龙、滑动谜题、股票含冷冻期/手续费。考察 BFS/A*/状态机 DP。",
    mastery: 0,
    customOrder: 20,
  },
];

// ============================================================
// 题目
// ============================================================

const ALGORITHM_200_QUESTIONS: Question[] = [
  // ===== Phase 1：数组与字符串（20题）=====
  {
    id: "algo-1",
    nodeId: "p1-array-string",
    question: "1. 两数之和（LeetCode 1）\n给定一个整数数组 nums 和目标值 target，返回和为 target 的两个元素的下标。假设恰好有一个解。",
    answer: `【思路推导】暴力解是双层循环：对每个 nums[i] 线性扫描它后面的元素找 target-nums[i]，O(n²)。瓶颈在「找补数」这一步的线性查找。换个角度：遍历到 nums[i] 时真正想知道的是「target-nums[i] 之前出现过吗、在哪个下标」。这正是哈希表的用武之地——把已遍历元素和它的下标存进 Map，补数查询降到 O(1)，总复杂度 O(n)。一次遍历边存边查，并且「先查后存」：先问 Map 里有没有补数，再把自己放进去，天然避免同一个元素被用两次。
【代码实现】
\`\`\`python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}  # 值 → 下标
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:           # 先查后存，防同一元素用两次
            return [seen[need], i]
        seen[x] = i                # 时间 O(n)，空间 O(n)
    return []
\`\`\`
【实际应用】「边存边查」是工程提速的通用套路：接口幂等性校验把请求指纹存 Redis、命中即拒；风控系统实时查设备黑名单；编译器用符号表 O(1) 查变量声明。面试官出这题，真正想确认的是你能主动把「查找」翻译成「哈希」。
【踩坑与变体】① 必须先查后存，否则 [3,2,4]、target=6 会把 3 用两次；② 返回的是下标不是值，审题别错；③ 变体 LeetCode 167「有序数组两数之和」用对撞双指针把空间降到 O(1)；④ 若存在多组解，Map 的 value 要存下标数组并继续扫描。`,
    keyPoints: ["哈希表把补数查找降为 O(1)", "一次遍历先查后存防复用", "返回下标而非值", "有序数组变体用双指针"],
    followUps: ["数组有序时如何用对撞双指针做到 O(1) 空间？", "如果要求返回所有满足条件的下标对，哈希表结构要怎么改？"],
    favorited: false,
  },
  {
    id: "algo-49",
    nodeId: "p1-array-string",
    question: "49. 字母异位词分组（LeetCode 49）\n给定字符串数组，将字母异位词组合在一起。",
    answer: `【思路推导】异位词的本质是「字符多重集合相同」。暴力解把单词两两比较，O(n²·klogk) 不可接受。关键观察：把每个单词的字母排序后，异位词会得到同一个串（eat、tea → aet），这个串天然是分组的 key。于是用哈希表 key → 单词数组，一遍遍历完成分组，O(n·klogk)。进一步优化：key 换成 26 维字符计数数组拼成的串（如 a1b0c2...），省掉排序的 klogk 因子，降到 O(n·k)。
【代码实现】
\`\`\`python
def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for s in strs:
        key = "".join(sorted(s))  # 规范化 key
        groups.setdefault(key, []).append(s)
    return list(groups.values())  # 时间 O(n·klogk)，空间 O(n·k)
\`\`\`
【实际应用】「规范化后作 key」应用极广：搜索引擎把 query 做大小写/全半角归一后命中同一缓存；推荐系统把同义 query 归组共享特征；反垃圾系统用文本 simhash 作 key 聚合相似内容；数据库的 NFD/NFC Unicode 归一化同理。
【踩坑与变体】① key 必须用排序/计数后的串，直接用原串会按字面分组；② 计数数组拼 key 要带分隔符，否则计数 [1,11] 与 [11,1] 会撞 key；③ Unicode 字符集下排序法仍通用，计数法要换成 Map 统计频次；④ 姊妹题 242「有效的字母异位词」只需比较两个计数数组是否相等。`,
    keyPoints: ["排序串或计数向量作分组 key", "哈希表一遍遍历完成分组", "异位词 = 字符频次向量相同", "Unicode 场景换 Map 计数"],
    followUps: ["用 26 维计数数组作 key 时为什么要加分隔符？", "如果字符集是任意 Unicode，分组策略要如何调整？"],
    favorited: false,
  },
  {
    id: "algo-128",
    nodeId: "p1-array-string",
    question: "128. 最长连续序列（LeetCode 128）\n给定未排序数组，找最长连续元素序列长度。要求 O(n) 时间。",
    answer: `【思路推导】排序后扫描是最直观的解法，但 O(nlogn) 不满足要求。O(n) 的关键是让每个元素只被访问常数次：先把所有数放进哈希集合 O(1) 查存在性，然后只对「序列起点」展开计数——若 num-1 不在集合中，num 就是某段连续序列的最小值，从它开始不断查 num+1、num+2 统计长度；非起点的数直接跳过，因为它所在的序列一定会被它自己的起点覆盖。每段序列只被它的起点扫一遍，所有内层枚举加起来是 O(n)，整体均摊 O(n)。
【代码实现】
\`\`\`python
def longest_consecutive(nums: list[int]) -> int:
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:  # 只从起点出发
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best  # 时间 O(n)，空间 O(n)
\`\`\`
【实际应用】「起点判定 + 哈希集合」用于区间聚类场景：监控系统把离散告警时间戳聚成连续故障窗口；日志分析合并连续异常码流定位事故起止；网络分析中把离散的已分配端口段合并成连续区间。
【踩坑与变体】① 不做起点判定会每段重复扫多次，退化 O(n²)；② 重复元素被 Set 天然去重，无需额外处理；③ 并查集也能解（相邻数 union），但代码更重；④ 变体「最长等差子序列」要换 DP：以「差值+末值」为状态；⑤ 若只要求近似，可用桶计数省内存。`,
    keyPoints: ["哈希集合 O(1) 判存在", "只从序列起点展开计数", "均摊 O(n) 的均摊分析", "并查集是替代解"],
    followUps: ["为什么只从 num-1 不存在的数开始枚举就能保证 O(n)？", "如果允许 O(nlogn)，排序法怎么写，它有什么额外好处？"],
    favorited: false,
  },
  {
    id: "algo-283",
    nodeId: "p1-array-string",
    question: "283. 移动零（LeetCode 283）\n将数组中所有 0 移到末尾，保持非零元素相对顺序，原地操作。",
    answer: `【思路推导】要求原地且保持非零相对顺序。暴力解遇到 0 就把后面元素整体前移，O(n²)。双指针优化：快指针 fast 负责扫描，慢指针 slow 指向「下一个非零该落的位置」；fast 遇到非零就与 slow 位置交换并 slow++。因为 fast 始终不落后于 slow，fast 扫过的非零按原顺序被依次搬到前面，0 自然被挤到尾部，一趟 O(n) 完成。本质是快慢指针分区：slow 左侧始终是「已整理好的非零区」，循环不变式清晰。
【代码实现】
\`\`\`python
def move_zeroes(nums: list[int]) -> None:
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「保留满足条件元素、原地压缩数组」是通用过滤模板：GC 标记-整理阶段把存活对象压缩到堆前部；日志管道原地剔除空行；前端大数据量表格过滤时复用原数组减少 GC。LeetCode 26/27/80 全是这一族。
【踩坑与变体】① 另一写法「非零前移 + 尾部补零」要记得补零循环；② slow==fast 时自换无副作用；③ 变体「把 0 移到开头」反向扫描即可；④ 变体 27 题「移除指定元素」用覆盖而非交换，写操作更少；⑤ 若不要求保序，头尾交换法可进一步减少赋值。`,
    keyPoints: ["快慢指针分区交换", "slow 左侧恒为非零区", "保序是交换法的关键", "原地过滤通用模板"],
    followUps: ["如果要求把 0 移到数组开头且保持非零顺序，指针方向怎么改？", "移除指定值（27 题）为什么用覆盖优于交换？"],
    favorited: false,
  },
  {
    id: "algo-11",
    nodeId: "p1-array-string",
    question: "11. 盛最多水的容器（LeetCode 11）\n找出两条线与 x 轴构成的容器，使其能容纳最多水。",
    answer: `【思路推导】暴力枚举所有 (i,j) 组合 O(n²)。面积 = min(h[i],h[j]) × (j-i)，两个变量同时动没法优化。用对撞双指针夹逼：l=0、r=n-1 从最大宽度开始，每步算面积，然后移动较矮的一边。正确性证明（面试必考）：设 h[l]<h[r]，当前面积被短板 h[l] 锁死；若移动高边 r，宽度必减，而新边再高也突破不了 h[l] 这个瓶颈（更矮只会更小），所以 (l, r-1)、(l, r-2)… 这些组合全都不可能更优，可以安全排除。每步排除「以当前短板为一边」的所有剩余组合，不遗漏最优解，O(n) 收敛。
【代码实现】
\`\`\`python
def max_area(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        best = max(best, area)
        if height[l] < height[r]:
            l += 1  # 淘汰短板
        else:
            r -= 1
    return best  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「夹逼 + 排除法论证」是贪心直觉的训练范本：限流系统中找最大吞吐时间窗、A/B 实验里两策略收益曲线的最优分割点、双变量资源分配问题（带宽 × 时长）都靠这套思维。
【踩坑与变体】① 「移动高边」的错误直觉很普遍，必须能用短板论反驳；② 两边相等时移哪边都行；③ 变体 42 题「接雨水」同样双指针但维护左右最大高度，难度升一档；④ 变体「盛水容器 II」（三维地形）要用最小堆 + BFS。`,
    keyPoints: ["对撞双指针从最大宽度夹逼", "移动短板的排除法证明", "面积 = min(高) × 宽", "接雨水是同族进阶"],
    followUps: ["请严格证明：为什么移动较矮的一边不会漏掉最优解？", "如果改成求能盛水的最大容积（42 题），状态需要增加什么？"],
    favorited: false,
  },
  {
    id: "algo-15",
    nodeId: "p1-array-string",
    question: "15. 三数之和（LeetCode 15）\n返回数组中所有和为 0 的不重复三元组。",
    answer: `\`\`\`python
# 思路：排序后固定一个数 + 双指针
# 时间 O(n²)，空间 O(1)
# 关键：排序 + 固定一个数后双指针 + 三层去重
def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res: list[list[int]] = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # 去重
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l + 1]:
                    l += 1
                while l < r and nums[r] == nums[r - 1]:
                    r -= 1
                l += 1
                r -= 1
    return res
\`\`\``,
    keyPoints: ["先排序", "固定一个数 + 双指针", "三层去重逻辑"],
    followUps: ["四数之和怎么解？", "不排序能否用哈希？有什么问题？"],
    favorited: false,
  },
  {
    id: "algo-42",
    nodeId: "p1-array-string",
    question: "42. 接雨水（LeetCode 42）\n给定 n 个非负整数表示柱子高度，计算能接多少雨水。",
    answer: `\`\`\`python
# 思路：双指针，维护左右最大值，每次处理较矮的一侧
# 时间 O(n)，空间 O(1)
# 关键：当前柱子能接水 = min(左max, 右max) - 自身高度
def trap(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        if height[l] < height[r]:
            if height[l] >= left_max:
                left_max = height[l]
            else:
                water += left_max - height[l]
            l += 1
        else:
            if height[r] >= right_max:
                right_max = height[r]
            else:
                water += right_max - height[r]
            r -= 1
    return water
\`\`\``,
    keyPoints: ["双指针从两端", "维护左右最大值", "也可以用单调栈/动态规划"],
    followUps: ["用单调栈怎么解？", "二维接雨水怎么解？"],
    favorited: false,
  },
  {
    id: "algo-3",
    nodeId: "p1-array-string",
    question: "3. 无重复字符的最长子串（LeetCode 3）\n给定字符串，找不含重复字符的最长子串长度。",
    answer: `【思路推导】暴力枚举所有子串 O(n²)、每个再查重 O(n)，共 O(n³)。关键观察：以 r 结尾的合法子串，其左边界 l 具有单调性——r 右移时，l 只会右移不会回退，因为新出现的重复字符只会把 l 往右逼。于是滑动窗口：哈希表记录每个字符最近一次出现的下标，r 每右移一位，若 s[r] 在窗口内出现过（last[s[r]] >= l），l 直接跳到 last[s[r]]+1，无需逐格收缩。l、r 均单调右移，各走 n 步，总时间 O(n)。
【代码实现】
\`\`\`python
def length_of_longest_substring(s: str) -> int:
    last: dict[str, int] = {}  # 字符 → 最近下标
    l = 0
    best = 0
    for r, ch in enumerate(s):
        prev = last.get(ch)
        if prev is not None and prev >= l:
            l = prev + 1  # 跳过重复位
        last[ch] = r
        best = max(best, r - l + 1)
    return best  # 时间 O(n)，空间 O(|字符集|)
\`\`\`
【实际应用】滑动窗口是流式处理标配：TCP 拥塞控制的滑动窗口、限流器的滑动时间窗计数、实时统计「最近 5 分钟无重复 UV」、音视频播放器的 seek 缓存窗口管理，背后都是同一个单调移动模型。
【踩坑与变体】① 更新 l 必须判 prev >= l，否则 "abba" 会把 l 拉回左边出错；② Set + while 逐格收缩的写法也对，均摊同样 O(n)；③ 变体 340 题「至多 K 个重复字符」用频次 Map 维护窗口合法数；④ 变体「最长无重复子数组」同理，只是元素类型从字符换成整数。`,
    keyPoints: ["滑动窗口左右指针单调右移", "哈希表记字符最近下标", "l 跳转条件 prev >= l", "至多 K 重复用频次 Map"],
    followUps: ["为什么 l 必须取 max(l, prev+1) 而不是直接赋值？", "改成「至多包含 K 个不同字符的最长子串」时窗口合法性怎么判定？"],
    favorited: false,
  },
  {
    id: "algo-438",
    nodeId: "p1-array-string",
    question: "438. 找到字符串中所有字母异位词（LeetCode 438）\n找 s 中所有 p 的字母异位词的子串起始索引。",
    answer: `【思路推导】异位词判定 = 字符频次向量相等。暴力对每个起点截 len(p) 长度的子串重新统计比较，O(n·m)。注意子串长度固定为 m=len(p)，这是「定长滑动窗口」信号：维护窗口内 26 维字符计数，右端进一个、左端出一个，O(1) 完成滑动。再引入 diff（当前窗口与 p 频次不一致的字符种数），字符进出时增量维护，diff==0 即匹配，每步判定也降到 O(1)，总时间 O(n)。
【代码实现】
\`\`\`python
def find_anagrams(s: str, p: str) -> list[int]:
    res: list[int] = []
    m = len(p)
    if len(s) < m:
        return res
    cnt = [0] * 26  # 窗口频次 − p 频次
    for i in range(m):
        cnt[ord(p[i]) - 97] -= 1
        cnt[ord(s[i]) - 97] += 1
    diff = sum(1 for x in cnt if x != 0)
    if diff == 0:
        res.append(0)
    for i in range(m, len(s)):
        add = ord(s[i]) - 97
        del_ = ord(s[i - m]) - 97
        if cnt[add] == 0:
            diff += 1
        cnt[add] += 1
        if cnt[add] == 0:
            diff -= 1
        if cnt[del_] == 0:
            diff += 1
        cnt[del_] -= 1
        if cnt[del_] == 0:
            diff -= 1
        if diff == 0:
            res.append(i - m + 1)
    return res  # 时间 O(n)，空间 O(26)
\`\`\`
【实际应用】定长窗口 + 频次指纹匹配用于：入侵检测在字节流中匹配恶意特征码、抄袭检测的 n-gram 指纹命中、搜索纠错把乱序输入映射到标准 query、基因序列中查找目标碱基排列。
【踩坑与变体】① diff 维护顺序：先判旧值是否为 0 再修改，再判新值是否归 0，顺序反了会漏/误报；② 每步 O(26) 数组比较版更易写对，面试可先写再优化；③ 变体 567「字符串的排列」找到第一个匹配即可返回 true；④ Unicode 字符集把定长数组换成 Map 统计。`,
    keyPoints: ["定长滑动窗口", "频次向量 + diff 增量维护", "字符进出 O(1) 更新", "Unicode 换 Map 计数"],
    followUps: ["diff 计数器在字符进出窗口时的精确更新规则是什么？", "567 题要求判断是否存在排列，如何在当前解法上提前退出？"],
    favorited: false,
  },
  {
    id: "algo-88",
    nodeId: "p1-array-string",
    question: "88. 合并两个有序数组（LeetCode 88）\n将 nums2 合并到 nums1 中，nums1 末尾有足够空间。原地合并。",
    answer: `【思路推导】直觉是从前往后双指针合并，但 nums1 前部空间被自身占用，写入会覆盖未处理的元素，只能先开 O(m) 副本。想 O(1) 空间就换方向：nums1 末尾有 n 个空位，从后往前写绝不会覆盖任何未读数据。三指针：i 指向 nums1 有效尾部 m-1，j 指向 nums2 尾部 n-1，k 指向合并尾部 m+n-1；每步把 max(nums1[i], nums2[j]) 写入 k，胜者指针前移。j 有剩余就顺次拷完；i 有剩余无需处理——它们本来就在正确位置。
【代码实现】
\`\`\`python
def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    i, j = m - 1, n - 1
    k = m + n - 1
    while j >= 0:  # 只需关心 j 耗尽
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1
    # 时间 O(m+n)，空间 O(1)
\`\`\`
【实际应用】「逆向写避免覆盖」是原地算法的经典技巧：归并排序的就地优化、LSM-Tree 合并两个有序 segment 时的倒序写、日志文件按时间戳归并。面试高频追问就是「为什么不能从前往后」。
【踩坑与变体】① 循环条件用 j>=0 最简洁，i 剩余元素天然就位；② k 必须随 i/j 同步递减；③ 变体 21 题「合并有序链表」是指针拼接，无需逆向思维；④ 扩展到合并 K 个有序数组要用小顶堆（373 题）；⑤ 若要求稳定（相等时保留 nums1 在前），比较要写成 nums1[i] > nums2[j] 才走 i。`,
    keyPoints: ["逆向三指针避免覆盖", "从后往前写利用尾部空位", "j 耗尽即终止", "稳定性由比较方向决定"],
    followUps: ["为什么从前往后合并必须开 O(m) 额外空间？", "合并 K 个有序数组时复杂度如何优化到 O(NlogK)？"],
    favorited: false,
  },
  {
    id: "algo-27",
    nodeId: "p1-array-string",
    question: "27. 移除元素（LeetCode 27）\n原地移除数组中所有值为 val 的元素，返回新长度。",
    answer: `【思路推导】「删除数组元素」在定长数组语义下实际是「覆盖 + 返回新长度」。暴力：遇到 val 就把后续元素整体前移，O(n²)。快慢指针：fast 扫描全部元素，slow 指向下一个保留位；nums[fast] !== val 就写入 nums[slow] 并 slow++。循环不变式：slow 左侧恒为「已保留区」，slow 到 fast 之间是「已丢弃区」，一趟 O(n) 完成且保序。进阶：若 val 极少（大数组只删几个），可改用「尾部交换法」——遇到 val 就与末尾元素交换并缩短逻辑长度，写操作从 O(n) 降到 O(k)，代价是不保序。
【代码实现】
\`\`\`python
def remove_element(nums: list[int], val: int) -> int:
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != val:
            nums[slow] = nums[fast]  # 覆盖保留
            slow += 1
    return slow  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】原地过滤模板无处不在：GC 标记-整理算法压缩存活对象、内存池碎片整理、前端长列表按条件过滤后复用原数组引用以降低 GC 压力、流处理管道剔除非法数据包。
【踩坑与变体】① 返回 slow 是新长度，不是 slow-1；② 不保序场景用尾部交换更省写，面试主动提是加分项；③ 同族题：26（有序去重 k=1）、80（最多留 2 个）、283（移动零），共用快慢指针骨架只改保留条件；④ 若用库函数 splice 逐个删是 O(n²)，面试禁忌。`,
    keyPoints: ["快慢指针覆盖保留", "slow 左侧恒为保留区", "尾部交换法省写不保序", "26/80/283 同模板族"],
    followUps: ["当 val 出现次数极少时，尾部交换法为什么更优？代价是什么？", "如何把本题模板泛化成「保留满足任意谓词的元素」？"],
    favorited: false,
  },
  {
    id: "algo-239",
    nodeId: "p1-array-string",
    question: "239. 滑动窗口最大值（LeetCode 239）\n返回大小为 k 的滑动窗口在数组中移动时的最大值数组。",
    answer: `【思路推导】暴力每个窗口扫 k 个数取 max，O(n·k)；大顶堆懒删除 O(nlogk)。还能更快吗？核心观察：窗口内若 i<j 且 nums[i]<=nums[j]，则 nums[i] 对之后任何窗口都不可能是最大值——它被 nums[j] 永久压制。据此维护单调递减队列（存下标）：新元素入队前，从队尾弹掉所有比它小的（它们已被压制）；队首下标若滑出窗口则出队。队首即当前窗口最大值。每个元素入队出队各一次，均摊 O(n)。
【代码实现】
\`\`\`python
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()  # 存下标，对应值单调递减
    res: list[int] = []
    for i in range(len(nums)):
        while dq and dq[0] <= i - k:  # 队首过期
            dq.popleft()
        while dq and nums[dq[-1]] <= nums[i]:  # 弹被压制者
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res  # 时间 O(n)，空间 O(k)
\`\`\`
【实际应用】单调队列是实时流极值统计的标准件：行情系统的滚动窗口最高/最低价、物联网传感器滑动窗口峰值告警、游戏服务器统计最近 N 秒伤害峰值、前端虚拟滚动中可见区域的最值懒计算。
【踩坑与变体】① 队列存下标（判过期需要），比较用值；② 数组 shift 是 O(k)，工程上必须维护 head 指针或用真双端队列；③ 求最小值改单调递增队列；④ 进阶族：862（前缀和+单调队列）、1438（双单调队列维护极差）、918（环形最大子数组和）。`,
    keyPoints: ["单调递减队列维护窗口最大值", "队尾弹被压制者、队首判过期", "均摊 O(n)", "head 指针代替 shift"],
    followUps: ["为什么被 nums[j] 压制的 nums[i] 可以安全丢弃，永不再用？", "如何用两个单调队列同时维护窗口最大值与最小值（1438 题）？"],
    favorited: false,
  },
  {
    id: "algo-76",
    nodeId: "p1-array-string",
    question: "76. 最小覆盖子串（LeetCode 76）\n在 s 中找包含 t 所有字符的最小子串。",
    answer: `\`\`\`python
# 思路：滑动窗口，右扩左缩，计数匹配
# 时间 O(n)，空间 O(字符集)
# 关键：维护 need 计数和 matched 计数
def min_window(s: str, t: str) -> str:
    need: dict[str, int] = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    l = 0
    matched = 0
    min_start = 0
    min_len = len(s) + 1
    for r in range(len(s)):
        if s[r] in need:
            need[s[r]] -= 1
            if need[s[r]] >= 0:
                matched += 1
        while matched == len(t):
            if r - l + 1 < min_len:
                min_len = r - l + 1
                min_start = l
            if s[l] in need:
                need[s[l]] += 1
                if need[s[l]] > 0:
                    matched -= 1
            l += 1
    if min_len > len(s):
        return ""
    return s[min_start:min_start + min_len]
\`\`\``,
    keyPoints: ["滑动窗口右扩左缩", "need 计数 + matched 计数", "matched==len(t) 时收缩"],
    followUps: ["如果 t 有重复字符？", "如果不要求最小而是所有？"],
    favorited: false,
  },
  {
    id: "algo-41",
    nodeId: "p1-array-string",
    question: "41. 缺失的第一个正数（LeetCode 41）\n找未排序数组中缺失的最小正整数。要求 O(n) 时间 O(1) 空间。",
    answer: `【思路推导】排序 O(nlogn)、哈希集合 O(n) 空间都不满足约束。突破口是抽屉原理：答案必在 [1, n+1] 内——n 个位置最多恰好占满 1..n。于是把数组本身当哈希表用：让数值 x 归位到下标 x-1。第一遍遍历，若 nums[i] 在 [1,n] 且它的目标位置放的不是它，就交换过去，循环直到当前位置无法归位（是负数、越界或会死循环的重复值）；第二遍扫描，第一个 nums[i] !== i+1 的位置 i+1 即答案，全部匹配则返回 n+1。每个元素最多被交换到正确位置一次，均摊 O(n)。
【代码实现】
\`\`\`python
def first_missing_positive(nums: list[int]) -> int:
    n = len(nums)
    for i in range(n):
        while 0 < nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]  # 归位交换
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「数组即哈希」的原地思想用于内存受限场景：嵌入式设备上的数据完整性校验、数据库页内 slot 重排、位图之外的原地去重方案。姊妹题 448（消失的数字）、287（寻找重复数）共用这套原地映射思维。
【踩坑与变体】① 必须用 while 不是 if——交换过来的新值可能还要继续归位；② 终止条件 nums[nums[i]-1] !== nums[i] 是防重复值死循环的命门；③ 0、负数、大于 n 的数直接跳过；④ 变体 448 题可改用「下标取负标记」代替交换，更省写。`,
    keyPoints: ["抽屉原理锁定答案域 [1,n+1]", "原地哈希：值 x 归位下标 x-1", "while 循环归位 + 防死循环", "均摊 O(n) 交换次数"],
    followUps: ["为什么 while 循环里的交换总次数是 O(n) 而不是 O(n²)？", "448 题的「取负标记」法和本题的交换归位法各有什么优劣？"],
    favorited: false,
  },
  {
    id: "algo-189",
    nodeId: "p1-array-string",
    question: "189. 轮转数组（LeetCode 189）\n将数组向右轮转 k 步。",
    answer: `【思路推导】额外数组拷贝最直观：nums[(i+k)%n] = nums[i]，但要 O(n) 空间；环状替换法 O(1) 空间但分圈讨论很绕。最优雅的是「三次反转」：以 [1,2,3,4,5,6,7]、k=3 为例，目标 [5,6,7,1,2,3,4] 相当于「后 k 个元素整体挪到前面，且两段内部顺序不变」。操作：先整体反转得 [7,6,5,4,3,2,1]，两段元素的相对位置已正确、只是各自内部颠倒；再分别反转前 k 个得 [5,6,7,...]、后 n-k 个得 [...,1,2,3,4]，收工。三次反转共 2n 次赋值，cache 友好。务必先 k %= n。
【代码实现】
\`\`\`python
def rotate(nums: list[int], k: int) -> None:
    n = len(nums)
    k %= n  # 防 k > n

    def rev(l: int, r: int) -> None:
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1
            r -= 1

    rev(0, n - 1)
    rev(0, k - 1)
    rev(k, n - 1)
    # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】数组轮转是环形缓冲（Ring Buffer）的核心操作：音视频采集环形队列、日志滚动写入、负载均衡节点轮换、定时任务时间轮的槽位滚动。反转法因纯顺序访问，在实际工程里比环状替换更快。
【踩坑与变体】① k %= n 是保命第一步，漏了下标越界；② 向左轮转 k 位 = 向右轮转 n-k 位；③ 变体 796「旋转字符串」判断 goal 是否为 s+s 的子串即可；④ 环状替换法要按 gcd(n,k) 分圈，代码复杂但赋值次数最少（n 次），面试可作对比讨论。`,
    keyPoints: ["三次反转法", "先 k %= n 防越界", "整体反转恢复段间顺序", "环形缓冲的实际对应"],
    followUps: ["向左轮转 k 位如何用同一套反转代码实现？", "环状替换法为什么需要按 gcd(n, k) 分圈处理？"],
    favorited: false,
  },
  {
    id: "algo-80",
    nodeId: "p1-array-string",
    question: "80. 删除有序数组中的重复项 II（LeetCode 80）\n原地删除使每个元素最多出现两次，返回新长度。",
    answer: `【思路推导】把题目看成「每个值最多保留 k=2 个」的通式。暴力：统计每段重复长度再整体前移，O(n²)。快慢指针通解：slow 指向下一个写入位，fast 扫描；nums[fast] 可保留的条件是它与「已保留序列倒数第 k 个」不同，即 nums[fast] !== nums[slow-k]。数组有序保证了：若相同，说明前面已留满 k 个，直接跳过。slow 从 k 起步（前 k 个天然合法）。这个写法对任意 k 通用，k=1 即退化为 26 题「删除重复项」。
【代码实现】
\`\`\`python
def remove_duplicates(nums: list[int]) -> int:
    k = 2
    if len(nums) <= k:
        return len(nums)
    slow = k
    for fast in range(k, len(nums)):
        if nums[fast] != nums[slow - k]:
            nums[slow] = nums[fast]
            slow += 1
    return slow  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「截断重复保留 N 份」在数据治理里很常见：日志系统对相同错误堆栈每分钟只留 2 条采样、监控指标降采样防爆炸半径、前端长列表合并连续重复项。背下这个泛化模板能秒一族题。
【踩坑与变体】① 比较对象是 nums[slow-k] 而非 nums[slow-1]（后者只保 1 个）；② slow 初值是 k 不是 0；③ 数组无序时此法的「保留 k 个」语义不成立，需哈希计数；④ 变体 26（k=1）、27（删指定值）、283（移零）同族，只换保留条件。`,
    keyPoints: ["泛化模板：每值最多留 k 个", "比较 nums[fast] 与 nums[slow-k]", "slow 初值为 k", "依赖数组有序前提"],
    followUps: ["为什么比较 nums[slow-k] 而不是 nums[slow-1]？画个例子说明。", "如果数组无序且要求保留每个值前两次出现，算法要如何改？"],
    favorited: false,
  },
  {
    id: "algo-169",
    nodeId: "p1-array-string",
    question: "169. 多数元素（LeetCode 169）\n找数组中出现次数超过 n/2 的元素。",
    answer: `【思路推导】排序取中位 O(nlogn)、哈希计数 O(n) 空间都太普通。Boyer-Moore 投票：多数元素出现次数 > 其余所有元素之和，那么「两两抵消」后必然剩下多数元素。维护 candidate 与 count：count==0 时把当前数设为 candidate；之后相等 count++、不等 count--。直觉：把多数元素当 +1 兵、其他都当 -1 兵，异族兵两两同归于尽后，多数族必然还有存活。题目保证多数存在所以一次遍历即可；若不保证，必须二次遍历验证 candidate 的真实频次。
【代码实现】
\`\`\`python
def majority_element(nums: list[int]) -> int:
    cand = 0
    cnt = 0
    for x in nums:
        if cnt == 0:
            cand = x  # 换候选人
        # 同族加兵，异族抵消
        if x == cand:
            cnt += 1
        else:
            cnt -= 1
    return cand  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】投票抵消思想用在：分布式拜占庭容错中的多数派投票、实时流里找绝对多数事件（如 DDoS 攻击源 IP 识别）、MapReduce combine 阶段的局部多数归并以减少 shuffle 量。
【踩坑与变体】① count 归零才换候选人，顺序不能反（先换再判）；② 变体 229「超过 n/3」要维护两个候选人 + 两个计数（答案至多 2 个），且必须二次验证；③ 位运算解（逐位统计 1 的个数取多数）是另一视角，可应对「不保证存在」的场景；④ 分治解 O(nlogn) 可作为思路对比。`,
    keyPoints: ["Boyer-Moore 投票抵消", "count 归零换候选人", "不保证存在需二次验证", "229 题双候选人扩展"],
    followUps: ["为什么两两抵消后剩下的一定是多数元素？给出不变式论证。", "扩展到「出现次数超过 n/3」时为什么要两个候选人且必须验证？"],
    favorited: false,
  },
  {
    id: "algo-215",
    nodeId: "p1-array-string",
    question: "215. 数组中的第 K 个最大元素（LeetCode 215）\n找数组中第 K 大的元素。",
    answer: `\`\`\`python
# 思路：快速选择，partition 后看哪半边
# 时间平均 O(n)，最坏 O(n²)，空间 O(1)
# 关键：随机 pivot 避免最坏情况
import random

def find_kth_largest(nums: list[int], k: int) -> int:
    target = len(nums) - k  # 转为第 target 小
    l, r = 0, len(nums) - 1
    while l < r:
        p = _partition(nums, l, r)
        if p == target:
            return nums[p]
        if p < target:
            l = p + 1
        else:
            r = p - 1
    return nums[l]

def _partition(nums: list[int], l: int, r: int) -> int:
    ri = random.randint(l, r)  # 随机选 pivot 换到末尾，避免有序数组退化为 O(n²)
    nums[ri], nums[r] = nums[r], nums[ri]
    pivot = nums[r]
    i = l
    for j in range(l, r):
        if nums[j] < pivot:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
    nums[i], nums[r] = nums[r], nums[i]
    return i
\`\`\``,
    keyPoints: ["快速选择（快排变体）", "随机 pivot 优化", "也可用小顶堆 O(n·logk)"],
    followUps: ["用堆怎么解？时间复杂度？", "如何保证 O(n) 最坏？"],
    favorited: false,
  },
  {
    id: "algo-523",
    nodeId: "p1-array-string",
    question: "523. 连续的子数组和（LeetCode 523）\n是否存在长度至少为 2、和为 k 的倍数的连续子数组。",
    answer: `【思路推导】暴力枚举所有长度 ≥2 的子数组求和，O(n²)。子数组和问题的标准转化是前缀和：sum(i..j) = pre[j] − pre[i]。要求和为 k 的倍数 ⟺ pre[j] ≡ pre[i] (mod k)，即两个前缀和余数相同。于是一次遍历：哈希表存「余数 → 最早下标」，遍历到 i 时若当前余数曾在 j 出现，则 (j, i] 区间和是 k 的倍数，再验长度 i−j ≥ 2。只存最早下标——跨度越大越容易满足长度约束，后来的同余下标没有保存价值。初始化 {0: −1} 处理从头开始的子数组。
【代码实现】
\`\`\`python
def check_subarray_sum(nums: list[int], k: int) -> bool:
    first: dict[int, int] = {0: -1}  # 余数 → 最早下标
    pre = 0
    for i in range(len(nums)):
        pre = (pre + nums[i]) % k
        j = first.get(pre)
        if j is not None:
            if i - j >= 2:
                return True
        else:
            first[pre] = i
    return False  # 时间 O(n)，空间 O(min(n, k))
\`\`\`
【实际应用】「前缀和 + 同余分组」用于区间统计：财务系统找「连续交易日盈亏恰为整手」的区间、指标平台检测周期对齐的异常窗口、流媒体码率按窗口求和校验。974 题（统计个数）是它的计数版。
【踩坑与变体】① 长度 ≥2 用 i−j ≥ 2 判，故只存最早下标；② JS 负数取模得负值，含负数数据要 (x%k+k)%k 修正；③ 变体 560 统计「和恰为 k」的个数，存前缀和出现次数而非最早下标；④ 变体 974 统计「和为 k 倍数」的个数，存余数出现次数。`,
    keyPoints: ["前缀和 + 同余映射", "哈希存余数最早下标", "长度 ≥2 用下标差判", "负数取模需修正"],
    followUps: ["为什么余数相等的两个前缀和下标差 ≥2 就必然命中？", "974 题要统计所有合法子数组个数，哈希表的 value 要怎么改？"],
    favorited: false,
  },
  {
    id: "algo-136",
    nodeId: "p1-array-string",
    question: "136. 只出现一次的数字（LeetCode 136）\n数组中除一个元素只出现一次外，其余均出现两次，找出那个元素。",
    answer: `【思路推导】常规思路：哈希计数 O(n) 空间、排序 O(nlogn)，都不满足 O(1) 空间 + O(n) 时间的要求。只能上异或运算。异或三条性质：a^a=0（同数抵消）、a^0=a（与 0 异或不变）、交换律结合律（顺序无关）。把全部元素异或起来，成对的数两两抵消为 0，0 再与单身数异或仍是它本身，最终结果即答案。本质是「异或消消乐」——把「出现偶数次」的信息在比特层面全部抹平，留下的就是奇数次的那个。
【代码实现】
\`\`\`python
def single_number(nums: list[int]) -> int:
    res = 0
    for x in nums:
        res ^= x  # 成对抵消
    return res  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】异或消消乐在工程里真实存在：RAID5 用异或做校验盘（任意一块盘损坏，用其余盘异或恢复数据）、网络传输奇偶校验、分布式存储 EC 纠删码、大规模日志 diff 的快速判等。
【踩坑与变体】① 初值必须是 0 不能是 nums[0]；② 变体 260「两个单身数」：全员异或得 a^b，取 lowbit（最低位的 1）把数组按该位分两组，组内各自异或即得两数；③ 变体 137「其余出现三次」异或失效，改用逐位计数 % 3 或两位状态机；④ 姊妹题 268「缺失数字」：下标与值一起异或。`,
    keyPoints: ["异或性质 a^a=0、a^0=a", "交换律结合律与顺序无关", "O(1) 空间位运算典范", "lowbit 分组解 260"],
    followUps: ["数组里有两个只出现一次的数时，如何用 lowbit 把它们分到两组？", "其余数都出现三次时异或为什么失效？逐位计数法怎么做？"],
    favorited: false,
  },

  // ===== Phase 1：哈希表（4题，跳过重题）=====
  {
    id: "algo-347",
    nodeId: "p1-hash",
    question: "347. 前 K 个高频元素（LeetCode 347）\n返回数组中出现频率前 K 高的元素。",
    answer: `【思路推导】第一步无悬念：哈希表统计频次 O(n)。分水岭在第二步「取频次前 K」：全排序 O(nlogn) 太浪费；小顶堆维护 K 个最大 O(nlogk) 是通用解；但注意频次的上界就是 n，可以桶排序——bucket[f] 存所有频次为 f 的元素，从最高频桶向低扫，收集够 K 个即止，整体 O(n)。面试建议：先给桶排 O(n)，再主动补堆解法展示权衡——堆对「数据持续流入、频次范围不可预知」的流式场景更稳。
【代码实现】
\`\`\`python
def top_k_frequent(nums: list[int], k: int) -> list[int]:
    cnt: dict[int, int] = {}
    for x in nums:
        cnt[x] = cnt.get(x, 0) + 1
    bucket: list[list[int]] = [[] for _ in range(len(nums) + 1)]
    for num, f in cnt.items():
        bucket[f].append(num)
    res: list[int] = []
    for f in range(len(bucket) - 1, 0, -1):
        if len(res) >= k:
            break
        res.extend(bucket[f])
    return res[:k]  # 时间 O(n)，空间 O(n)
\`\`\`
【实际应用】Top-K 是推荐与搜索的基础设施：微博热搜/知乎热榜计算、实时统计高频访问 IP、Redis 热点 key 发现、CDN 高频资源识别。工程上离线批处理用桶/快排划分，在线流式用「哈希计数 + 小顶堆」。
【踩坑与变体】① 桶数组开 n+1（频次最大为 n）；② 收集可能超 k，记得截断；③ 堆解法维护的是大小为 k 的小顶堆，堆顶即第 K 高；④ 变体 692「前 K 高频单词」要加字典序二级排序；⑤ quickselect 可做到期望 O(n)、O(1) 空间，是最坏优化的谈资。`,
    keyPoints: ["频次上界为 n 可用桶排", "小顶堆维护 Top-K 通用解", "quickselect 期望 O(n)", "流式数据用堆不用桶"],
    followUps: ["桶排序、小顶堆、quickselect 三种 Top-K 方案各自的适用场景是什么？", "692 题要求频次相同按字典序排列，比较器如何设计？"],
    favorited: false,
  },
  {
    id: "algo-448",
    nodeId: "p1-hash",
    question: "448. 找到所有数组中消失的数字（LeetCode 448）\n数组长度 n，元素 1~n，找消失的数字。O(n) 时间 O(1) 空间。",
    answer: `【思路推导】元素范围恰是 1..n，与下标 0..n−1 天然一一对应——这是「数组即哈希」的强信号。要求 O(1) 空间不能开布尔数组，就利用「值的正负」当标记位：遍历每个数 x，把下标 |x|−1 处的值取负（已是负则不动）；第二遍扫描，下标 i 处仍为正 ⟺ 值 i+1 从未出现过。取负不破坏原值（读的时候用绝对值），一份空间承载两份信息。与 41 题（交换归位）并称原地哈希的两种实现路线。
【代码实现】
\`\`\`python
def find_disappeared_numbers(nums: list[int]) -> list[int]:
    for x in nums:
        idx = abs(x) - 1
        if nums[idx] > 0:
            nums[idx] = -nums[idx]  # 标记「idx+1 出现过」
    res: list[int] = []
    for i in range(len(nums)):
        if nums[i] > 0:
            res.append(i + 1)  # 未被标记即缺失
    return res  # 时间 O(n)，空间 O(1)（不计输出数组）
\`\`\`
【实际应用】「符号位当标记」是内存极致优化的代表：位图去重的单比特版、数据库行内 tombstone 标记、嵌入式设备上无额外内存的数据校验。面试常把 41/287/442/448 组成「原地哈希四连问」。
【踩坑与变体】① 读标记时务必用 |x|——前面的数可能已被取负；② 判 nums[idx] > 0 才取负，防重复值把标记翻回正；③ 变体 442「找所有重复数」：标记时发现已负就收集该值；④ 若不允许改数组，只能换快慢指针（287 题）或排序；⑤ 「输出数组不计空间」是面试惯例，先和面试官确认。`,
    keyPoints: ["值域 1..n 映射下标", "符号位作出现标记", "绝对值还原原值", "原地哈希四题族"],
    followUps: ["如何用本题的标记法顺手找出所有重复出现的数（442 题）？", "不允许修改输入数组时有哪些替代方案？复杂度各是多少？"],
    favorited: false,
  },
  {
    id: "algo-146",
    nodeId: "p1-hash",
    question: "146. LRU 缓存（LeetCode 146）\n设计 O(1) get 和 put 的 LRU 缓存。",
    answer: `\`\`\`python
# 思路：哈希表 + 双向链表，访问即移到头部，满则删尾部
# 时间 O(1)，空间 O(capacity)
# 关键：哈希表存节点指针，双向链表维护顺序；哨兵 head/tail 简化边界
class _Node:
    def __init__(self, key: int = 0, val: int = 0):
        self.key = key
        self.val = val
        self.prev: "_Node | None" = None
        self.next: "_Node | None" = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache: dict[int, _Node] = {}
        self.head = _Node()  # 哨兵：head.next 是最近使用
        self.tail = _Node()  # 哨兵：tail.prev 是最久未用
        self.head.next = self.tail  # 哨兵接线：空表时 head 与 tail 直连
        self.tail.prev = self.head

    def _add_to_head(self, node: _Node) -> None:
        node.prev = self.head
        node.next = self.head.next
        assert self.head.next is not None
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node: _Node) -> None:
        assert node.prev is not None and node.next is not None
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node: _Node) -> None:
        self._remove_node(node)
        self._add_to_head(node)

    def _remove_tail(self) -> _Node:
        node = self.tail.prev
        assert node is not None
        self._remove_node(node)
        return node

    def get(self, key: int) -> int:
        node = self.cache.get(key)
        if node is not None:
            self._move_to_head(node)
            return node.val
        return -1

    def put(self, key: int, val: int) -> None:
        node = self.cache.get(key)
        if node is not None:
            node.val = val
            self._move_to_head(node)
            return
        node = _Node(key, val)
        self.cache[key] = node
        self._add_to_head(node)  # 新节点必须接入链表头部，否则链表与哈希表脱节
        if len(self.cache) > self.cap:
            tail = self._remove_tail()
            del self.cache[tail.key]
\`\`\``,
    keyPoints: ["哈希表 + 双向链表", "哨兵节点简化边界", "访问移头、满则删尾"],
    followUps: ["LFU 怎么实现？", "用 LinkedHashMap 简化怎么做？"],
    favorited: false,
  },
  {
    id: "algo-560",
    nodeId: "p1-hash",
    question: "560. 和为 K 的子数组（LeetCode 560）\n统计数组中和为 k 的连续子数组个数。字节/美团第一高频。",
    answer: `【思路推导】暴力枚举所有子数组求和 O(n²)，字节面试必被追问优化。标准转化：连续子数组和 sum(i..j) = pre[j] − pre[i] = k ⟺ pre[i] = pre[j] − k。问题瞬间变成「两数之和的统计版」：从左到右累加前缀和 pre，每到一个位置就查哈希表里 pre − k 出现过几次、累进答案，再把当前 pre 入库。哈希表存「前缀和 → 出现次数」，初始 {0: 1} 表示空前缀——处理从下标 0 开始的子数组。一次遍历 O(n)。
【代码实现】
\`\`\`python
def subarray_sum(nums: list[int], k: int) -> int:
    cnt: dict[int, int] = {0: 1}  # 前缀和 → 次数
    pre = 0
    res = 0
    for x in nums:
        pre += x
        res += cnt.get(pre - k, 0)  # 先查
        cnt[pre] = cnt.get(pre, 0) + 1  # 后存
    return res  # 时间 O(n)，空间 O(n)
\`\`\`
【实际应用】「前缀和 + 哈希统计」是区间统计的万能转化：广告系统统计「连续时段消耗恰好为预算」的组合数、风控检测「连续 N 笔交易总额命中阈值」、股票分析统计涨跌和为某值的区间数。它是字节/美团一面标配，因为能同时考察转化思维与边界严谨性。
【踩坑与变体】① 必须先查后存，否则会把空子数组（i==j）计入；② {0:1} 初始化是边界命门；③ 数组含负数时滑动窗口失效（和不单调），前缀和哈希是唯一正解；④ 变体：「和为 k 的最长子数组」存前缀和最早下标；523/974「和为 k 倍数」改存余数。`,
    keyPoints: ["前缀和转两数之和统计版", "先查后存防空子数组", "{0:1} 初始化处理从头开始", "含负数滑窗失效的判据"],
    followUps: ["为什么数组含负数时滑动窗口不可用、必须用前缀和哈希？", "改成求和为 k 的最长连续子数组长度，哈希表 value 存什么？"],
    favorited: false,
  },

  // ===== Phase 1：链表（10题）=====
  {
    id: "algo-21",
    nodeId: "p1-linkedlist",
    question: "21. 合并两个有序链表（LeetCode 21）\n将两个升序链表合并为一个新的升序链表。",
    answer: `【思路推导】这是归并排序 merge 阶段在链表上的翻版。逐个比较 l1、l2 的头节点，小的接到结果尾部、对应指针前移；一方耗尽后另一方剩余部分整体接上。用虚拟头节点 dummy 统一「第一个节点」的边界，避免对头指针的特判。迭代 O(n+m) 时间、O(1) 空间。递归写法同样经典：每层选较小头，其 next 指向递归结果，但长链表栈深 O(n+m) 有溢出风险，工程上选迭代。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义（LeetCode 标准定义）
def merge_two_lists(l1: "ListNode | None", l2: "ListNode | None") -> "ListNode | None":
    dummy = ListNode(0)
    cur = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            cur.next = l1
            l1 = l1.next
        else:
            cur.next = l2
            l2 = l2.next
        cur = cur.next
    cur.next = l1 if l1 else l2  # 剩余整体接上
    return dummy.next  # 时间 O(n+m)，空间 O(1)
\`\`\`
【实际应用】归并两个有序流是基础设施级操作：数据库 merge join、LSM-Tree 多层有序 segment 合并、K 路归并外排序、两个用户的 feed 时间线归并。23 题「合并 K 个有序链表」就是它的堆/分治升级版。
【踩坑与变体】① 结尾 cur.next = l1 ?? l2 一步接整条，别写循环逐个接；② 相等时取 l1 更「稳定」；③ 递归版注意栈深度；④ 变体 88 题「合并有序数组」用逆向双指针省空间；⑤ 23 题合并 K 个用最小堆 O(NlogK) 或分治两两合并，两法复杂度相同。`,
    keyPoints: ["归并 merge 阶段链表版", "虚拟头节点统一边界", "剩余链表整体接上", "23 题堆/分治升级"],
    followUps: ["递归写法的终止条件和返回逻辑是什么？栈深多少？", "合并 K 个有序链表时，分治两两合并为什么和堆解法复杂度相同？"],
    favorited: false,
  },
  {
    id: "algo-141",
    nodeId: "p1-linkedlist",
    question: "141. 环形链表（LeetCode 141）\n判断链表是否有环。",
    answer: `【思路推导】哈希表存访问过的节点，O(n) 空间可行但不优雅。Floyd 判圈（龟兔赛跑）：慢指针每步走 1、快指针每步走 2。若无环，快指针先到 null；若有环，快指针进环后在环上打转，相对慢指针以速度 1 追赶，环内距离每步缩 1，必然相遇——这就是严格性论证的核心。时间 O(n)（相遇前慢指针最多走 n+环长步）、空间 O(1)。追问「速度为什么是 2」：任何 >1 的速度差都能保证相遇，2 是最小且最好算的。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义
def has_cycle(head: "ListNode | None") -> bool:
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True  # 环内必相遇
    return False  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】环检测思想用于：GC 辅助检测对象循环引用、状态机死循环检测、工作流引擎任务依赖环校验、爬虫 URL 环路去重、有限自动机调试。快慢指针还衍生出「找中点」「倒数第 K 个」一族题。
【踩坑与变体】① 循环条件要判 fast && fast.next 两个，漏一个就空指针；② fast/slow 同从 head 出发；③ 变体 142 求入口：相遇后一指针回头与 slow 同速走，再相遇即入口；④ 求环长：相遇点绕一圈计数；⑤ 扩展 202 题「快乐数」数值迭代判环是同款套路。`,
    keyPoints: ["Floyd 龟兔赛跑", "相对速度 1 环内必相遇", "fast 双判空防越界", "142 题入口推导"],
    followUps: ["快指针速度取 3 行不行？速度差对最坏步数有什么影响？", "相遇之后如何用数学推导定位环入口（142 题）？"],
    favorited: false,
  },
  {
    id: "algo-142",
    nodeId: "p1-linkedlist",
    question: "142. 环形链表 II（LeetCode 142）\n找到环形链表的环入口节点。",
    answer: `【思路推导】先用 Floyd 判圈拿到相遇点，难点在如何从相遇点推出环入口。设头到入口距离 a、入口到相遇点 b、相遇点沿环回入口 c。相遇时慢指针走 a+b，快指针走 a+b+n(b+c)（n 为它多绕的圈数）；由快 = 2×慢得 2(a+b) = a+b+n(b+c)，化简 a = (n−1)(b+c) + c。含义：从 head 走 a 步到入口，等价于从相遇点绕 n−1 圈再走 c 步——两者必在入口汇合。所以第二阶段：一指针回 head，与 slow 同速前进，相遇处即入口。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义
def detect_cycle(head: "ListNode | None") -> "ListNode | None":
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p = p.next
                slow = slow.next
            return p  # 数学保证此处即入口
    return None  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「相遇点 + 同步重置」的定位思想用于：内存分析工具定位循环引用起点、分布式链路追踪定位重入点、状态机调试中找到进入死循环的那条转移边。287 题「寻找重复数」就是把数组映射抽象成本题的环。
【踩坑与变体】① 第二阶段 slow 留在相遇点、p 从 head 出发，两指针同速；② 推导中 n≥1，快指针至少多绕一圈；③ 第一阶段判空别漏，无环返回 null；④ 求环长：到入口后绕一圈计数；⑤ 287 题同构：下标 i → nums[i] 的映射必有环，环入口即重复数。`,
    keyPoints: ["a = (n−1)(b+c) + c 推导", "相遇后双指针同速找入口", "环长绕圈计数", "287 题同构映射"],
    followUps: ["请完整推导 a = (n−1)(b+c) + c，并解释第二阶段为什么同速必在入口相遇。", "287 题如何把「数组下标 → 值」的映射抽象成链表环？"],
    favorited: false,
  },
  {
    id: "algo-206",
    nodeId: "p1-linkedlist",
    question: "206. 反转链表（LeetCode 206）\n反转单链表。",
    answer: `【思路推导】反转的本质是把每个节点的 next 指针掉头。迭代法三指针：prev（已反转段的头）、cur（当前处理节点）、next（暂存后继防断链）。每轮四步：next = cur.next 保存现场 → cur.next = prev 掉头 → prev = cur → cur = next 整体右移。cur 走到 null 时 prev 即新头。递归法是另一视角：reverse(head.next) 返回反转后子链的头，再令 head.next.next = head、head.next = null 完成本层掉头——代码 3 行但栈深 O(n)，长链表有溢出风险。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义
def reverse_list(head: "ListNode | None") -> "ListNode | None":
    prev = None
    cur = head
    while cur:
        nxt = cur.next  # 暂存后继
        cur.next = prev  # 指针掉头
        prev = cur
        cur = nxt  # 整体右移
    return prev  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】链表反转是链式结构的基本功：栈的链式实现天然反序、浏览器前进/后退双栈模型、编辑器撤销重做栈、日志倒序回放。92（区间反转）、25（K 组反转）都是它的组合升级，面试常三连问。
【踩坑与变体】① 必须先存 next 再改指针，否则断链丢后半段；② 循环结束返回 prev 不是 cur（cur 已是 null）；③ 递归版终止条件是 head 或 head.next 为 null；④ 变体 92 题用头插法做区间反转；⑤ 25 题 K 组反转需先数够 K 个再调用段反转。`,
    keyPoints: ["三指针迭代掉头", "先存 next 防断链", "返回 prev 而非 cur", "递归版栈深 O(n)"],
    followUps: ["递归反转中 head.next.next = head 这一行到底做了什么？画三层展开说明。", "如何只反转链表的 [left, right] 区间（92 题）？"],
    favorited: false,
  },
  {
    id: "algo-92",
    nodeId: "p1-linkedlist",
    question: "92. 反转链表 II（LeetCode 92）\n反转从位置 left 到 right 的链表段。",
    answer: `【思路推导】区间反转 = 定位 + 反转 + 重连三步。先用 dummy 虚拟头统一 left=1 的边界，把 prev 走 left−1 步停到反转段的前驱。段内反转用「头插法」：固定 cur 为段首（反转完成它就是段尾），反复把 cur.next 摘下来插到 prev 之后，执行 right−left 次。头插法的精妙在于段外两根锚针（prev 与 cur）始终不动，摘-插动作天然完成与段外的重连，无需额外保存段尾、段首，是三指针反转的进阶形态。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义
def reverse_between(head: "ListNode | None", left: int, right: int) -> "ListNode | None":
    dummy = ListNode(0, head)
    prev = dummy
    for _ in range(1, left):
        prev = prev.next  # 段前驱
    cur = prev.next  # 段首（反转后变段尾）
    for _ in range(right - left):
        nxt = cur.next  # 待头插节点
        cur.next = nxt.next  # 摘下
        nxt.next = prev.next  # 插到段首
        prev.next = nxt
    return dummy.next  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】区间重排是编辑类系统的日常：文本编辑器撤销一段重排、日志流局部倒序回放、版本控制 revert 指定区间的提交序列。「摘下-插入」也是内存分配器空闲链表整理的原语操作。
【踩坑与变体】① prev 走 left−1 步停在段前驱，别走过头；② 头插次数是 right−left 不是 right−left+1；③ cur 始终指向原段首、别在循环里移动它；④ 变体 25 题 K 组反转 = 判段长够 K + 循环区间反转；⑤ 递归解法可作对比但不省空间。`,
    keyPoints: ["定位-反转-重连三步", "头插法段内反转", "cur 固定为段首不动", "dummy 统一 left=1 边界"],
    followUps: ["头插法每执行一次，段内节点顺序发生什么变化？画三步过程图。", "25 题 K 个一组翻转如何复用本题的区间反转逻辑？"],
    favorited: false,
  },
  {
    id: "algo-19",
    nodeId: "p1-linkedlist",
    question: "19. 删除链表的倒数第 N 个结点（LeetCode 19）\n删除链表倒数第 N 个节点。",
    answer: `【思路推导】倒数第 N 个 = 正数第 len−N+1 个，但「一趟遍历」的要求排除了先算长度。快慢指针：快指针先走 N 步拉开间距，然后两指针同速前进；快指针到达末尾时，慢指针恰好落在倒数第 N 个的前驱——因为两指针间距恒为 N（间距不变式）。删除动作 slow.next = slow.next.next。dummy 虚拟头处理「删的是头节点」（N = len）的边界：此时 slow 停在 dummy 上，删除照样成立。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义
def remove_nth_from_end(head: "ListNode | None", n: int) -> "ListNode | None":
    dummy = ListNode(0, head)
    fast = dummy
    slow = dummy
    for _ in range(n):
        fast = fast.next  # 拉开 N 步间距
    while fast.next:
        fast = fast.next
        slow = slow.next  # 同速前进
    slow.next = slow.next.next  # 删除倒数第 N 个
    return dummy.next  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「固定间距双指针」用于流式场景：实时事件流中定位「当前点往前第 N 个事件」、日志系统动态维护倒数 N 条缓存、音视频帧队列中定位最近关键帧。找链表中点（速度差法）是它的同族题。
【踩坑与变体】① slow 必须停在待删节点的前驱——fast 从 dummy 出发、循环条件 fast.next 非空，两处配合才正确；② N = len 时删的是头，dummy 兜底；③ N > len 题目保证不发生，工程上要校验；④ 变体「删除正数第 N 个」直接计数即可，无需技巧；⑤ 若允许两趟，先求长度再定位更直白。`,
    keyPoints: ["快慢指针固定间距 N", "slow 停在待删前驱", "dummy 处理删头边界", "一趟遍历完成"],
    followUps: ["为什么 fast 先走 N 步后，fast 到尾时 slow 恰好在倒数第 N 个的前驱？", "链表很长且 N 也很大时，双指针比「先求长度再定位」省了什么？"],
    favorited: false,
  },
  {
    id: "algo-24",
    nodeId: "p1-linkedlist",
    question: "24. 两两交换链表中的节点（LeetCode 24）\n每两个相邻节点交换，返回头节点。",
    answer: `【思路推导】交换相邻节点要改 3 根指针，顺序错了就断链。设 prev 指向待交换对的前驱，a = prev.next、b = prev.next.next 是要交换的两个。三步标准动作：prev.next = b（前驱接 b）→ a.next = b.next（a 接住 b 的后继）→ b.next = a（b 接 a，完成掉头）。然后 prev 前进到 a（a 现在是这一对的老二，恰是下一对的前驱），循环直到剩余不足两个节点。dummy 统一「头节点也参与交换」的边界。递归版：head.next 接递归处理好的子链，返回交换后的新头 b。
【代码实现】
\`\`\`python
# 假设 ListNode 已定义
def swap_pairs(head: "ListNode | None") -> "ListNode | None":
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next and prev.next.next:
        a = prev.next
        b = prev.next.next
        prev.next = b  # ① 前驱接 b
        a.next = b.next  # ② a 接 b 的后继
        b.next = a  # ③ b 接 a
        prev = a  # 前进到下一对的前驱
    return dummy.next  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】节点成对/成组重排是链式结构的基础体操：内存分配器空闲链表整理、网络数据包成对重组、洗牌算法的链式实现。25 题「K 个一组翻转」是它的直接升级，字节喜欢两题连问考迁移能力。
【踩坑与变体】① 三根指针赋值顺序固定：先接 prev→b，再 a→b.next，最后 b→a；② 循环条件要同时判 prev.next 与 prev.next.next（奇数长度落单保留）；③ prev 每轮前进到 a 不是 b；④ 隐性约束是「改指针不改值」；⑤ 变体 25 题要先判段长够 K 再翻转。`,
    keyPoints: ["三指针成对交换", "prev 跳到已交换对尾部", "dummy 统一边界", "25 题 K 组升级"],
    followUps: ["交换 a、b 两个节点为什么恰好要改 3 根指针？少改一根会发生什么？", "从两两交换迁移到 K 个一组翻转，需要新增哪些步骤？"],
    favorited: false,
  },
  {
    id: "algo-25",
    nodeId: "p1-linkedlist",
    question: "25. K 个一组翻转链表（LeetCode 25）\n每 K 个节点一组翻转，不足 K 个保持原样。",
    answer: `\`\`\`python
# 思路：分组翻转，先数 K 个再反转再连接
# 时间 O(n)，空间 O(1)
# 关键：虚拟头节点 + 分组反转 + 尾部连接
# 假设 ListNode 已定义
def reverse_k_group(head: "ListNode | None", k: int) -> "ListNode | None":
    dummy = ListNode(0, head)
    prev_group = dummy
    while True:
        # 数 k 个
        tail = prev_group
        for _ in range(k):
            tail = tail.next
            if tail is None:
                return dummy.next
        next_group = tail.next
        # 反转 prev_group.next 到 tail
        prev = next_group
        cur = prev_group.next
        while cur is not next_group:
            tmp = cur.next
            cur.next = prev
            prev = cur
            cur = tmp
        new_tail = prev_group.next
        prev_group.next = tail
        new_tail.next = next_group
        prev_group = new_tail
\`\`\``,
    keyPoints: ["分组反转", "虚拟头节点", "连接前后组"],
    followUps: ["不足 K 个也翻转怎么改？", "递归怎么写？"],
    favorited: false,
  },
  {
    id: "algo-138",
    nodeId: "p1-linkedlist",
    question: "138. 随机链表的复制（LeetCode 138）\n深拷含 random 指针的链表。",
    answer: `\`\`\`python
# 思路：在每个节点后插入副本，再设 random，再拆分
# 时间 O(n)，空间 O(1)
# 关键：三步走——插入副本→设random→拆分
# 假设 Node 已定义（含 val/next/random）
def copy_random_list(head: "Node | None") -> "Node | None":
    if head is None:
        return None
    # 1. 插入副本
    cur = head
    while cur is not None:
        cur.next = Node(cur.val, cur.next, None)
        cur = cur.next.next
    # 2. 设 random
    cur = head
    while cur is not None:
        if cur.random is not None:
            cur.next.random = cur.random.next
        cur = cur.next.next
    # 3. 拆分
    dummy = Node(0, None, None)
    copy_cur = dummy
    cur = head
    while cur is not None:
        copy_cur.next = cur.next
        copy_cur = copy_cur.next
        cur.next = cur.next.next
        cur = cur.next
    return dummy.next
\`\`\``,
    keyPoints: ["原地插入副本", "副本的 random = 原节点的 random.Next", "拆分恢复原链表"],
    followUps: ["用哈希表怎么解？空间复杂度？"],
    favorited: false,
  },
  {
    id: "algo-148",
    nodeId: "p1-linkedlist",
    question: "148. 排序链表（LeetCode 148）\n对链表排序，要求 O(n logn) 时间 O(1) 空间。",
    answer: `\`\`\`python
# 思路：归并排序——自底向上迭代，满足题目 O(1) 空间要求（递归版需 O(logn) 栈空间）
# 时间 O(n logn)，空间 O(1)
# 关键：按步长 1,2,4... 两两合并相邻有序段，每轮扫一遍链表
# 假设 ListNode 已定义
def sort_list(head: "ListNode | None") -> "ListNode | None":
    n = 0
    p = head
    while p is not None:
        n += 1
        p = p.next
    dummy = ListNode(0, head)
    step = 1
    while step < n:
        prev = dummy
        cur = dummy.next
        while cur is not None:
            h1 = cur
            h2 = _split(h1, step)  # h1 段长 step，返回第二段头
            nxt = _split(h2, step)
            merged, tail = _merge2(h1, h2)
            prev.next = merged
            prev = tail
            cur = nxt
        step *= 2
    return dummy.next

# _split：切出以 head 开头、长度 n 的一段，返回下一段的头
def _split(head: "ListNode | None", n: int) -> "ListNode | None":
    for _ in range(1, n):
        if head is None:
            break
        head = head.next
    if head is None:
        return None
    nxt = head.next
    head.next = None
    return nxt

# _merge2：合并两个有序链表，返回 (头, 尾)
def _merge2(h1: "ListNode | None", h2: "ListNode | None") -> tuple:
    dummy = ListNode(0)
    tail = dummy
    while h1 is not None and h2 is not None:
        if h1.val < h2.val:
            tail.next = h1
            h1 = h1.next
        else:
            tail.next = h2
            h2 = h2.next
        tail = tail.next
    tail.next = h1 if h1 is not None else h2
    while tail.next is not None:
        tail = tail.next
    return dummy.next, tail
\`\`\``,
    keyPoints: ["归并排序", "自底向上迭代 O(1) 空间", "按步长两两合并", "快慢指针找中点（递归版）"],
    followUps: ["递归版为什么不是 O(1) 空间？", "快速排序能排链表吗？"],
    favorited: false,
  },

  // ===== Phase 1：栈与队列（6题）=====
  {
    id: "algo-20",
    nodeId: "p1-stack-queue",
    question: "20. 有效的括号（LeetCode 20）\n判断括号字符串是否有效（匹配且闭合）。",
    answer: `【思路推导】暴力解法是反复扫描，每次消去一对相邻的匹配括号，直到无法消除再看串是否为空，复杂度 O(n^2) 且不好写。关键洞察：右括号必须匹配“最近一个尚未配对的左括号”，这种最近者优先正是栈的语义。类比食堂摞盘子：最后放上的盘子最先被取走。于是一次遍历：左括号入栈，右括号要求栈顶是对应左括号并弹栈，最后栈空才算闭合。
【代码实现】\`\`\`python
def is_valid(s: str) -> bool:
    pair = {')': '(', ']': '[', '}': '{'}
    st: list[str] = []
    for c in s:
        if c in '([{':
            st.append(c)  # 左括号入栈
        elif not st or st.pop() != pair[c]:
            return False  # 栈顶必须匹配
    return len(st) == 0  # 栈空才说明全配对
# 时间 O(n)，空间 O(n)
\`\`\`
【实际应用】括号匹配是编译器语法分析的基础，JSON/XML 解析器、IDE 括号高亮、JSX 标签校验都建立在同一栈模型上。面试官考察：能否把“嵌套、最近优先”的结构抽象成栈，这是单调栈、表达式求值、DFS 的共同原型。
【踩坑与变体】1. 忘判空栈，pop 出 undefined 侥幸通过部分用例；2. 遍历完忘查栈空，"(((" 会误判；3. 只含一种括号可用计数器 O(1) 空间；4. 变体：LeetCode 32 最长有效括号、LeetCode 1249 移除无效括号、LeetCode 856 括号得分。`,
    keyPoints: ["括号匹配的“最近未闭合者优先”结构天然对应栈的 LIFO 语义","一次遍历：左括号入栈，右括号查栈顶并弹栈，最后栈必须为空","两个必查失败分支：空栈遇右括号、结束时栈非空","嵌套结构（标签、表达式、DFS 撤销）都是同一栈模型的换皮"],
    followUps: ["如果只含一种括号，能不能用 O(1) 空间判定？这个思路怎么推广回三种括号？","如何改成返回最长有效括号子串的长度（LeetCode 32）？栈里该存什么？"],
    favorited: false,
  },
  {
    id: "algo-155",
    nodeId: "p1-stack-queue",
    question: "155. 最小栈（LeetCode 155）\n设计支持 O(1) 获取最小值的栈。",
    answer: `\`\`\`python
# 思路：辅助栈同步记录当前最小值
# 时间 O(1) 每操作，空间 O(n)
# 关键：辅助栈与主栈同步 push/pop
class MinStack:
    def __init__(self):
        self.stack: list[int] = []
        self.min_stack: list[int] = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def get_min(self) -> int:
        return self.min_stack[-1]
\`\`\``,
    keyPoints: ["辅助栈同步", "push 时同步更新最小值", "也可差值法省空间"],
    followUps: ["用差值法怎么实现单栈？", "最大栈怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-394",
    nodeId: "p1-stack-queue",
    question: "394. 字符串解码（LeetCode 394）\n解码如 3[a2[c]] → accaccacc 的字符串。",
    answer: `\`\`\`python
# 思路：双栈——数字栈和字符串栈
# 时间 O(输出长度)，空间 O(输出长度)
# 注：嵌套解码会让输出远长于输入，如 3[a10[b]] 输入 9 字符、输出 33 字符，
#     嵌套时输出随重复次数乘积膨胀，故按输出长度衡量更准确
# 关键：遇到 [ 压栈，遇到 ] 出栈拼接
def decode_string(s: str) -> str:
    num_stack: list[int] = []
    str_stack: list[str] = []
    cur_str = ""
    cur_num = 0
    for ch in s:
        if ch.isdigit():
            cur_num = cur_num * 10 + int(ch)
        elif ch == '[':
            num_stack.append(cur_num)
            str_stack.append(cur_str)
            cur_num = 0
            cur_str = ""
        elif ch == ']':
            n = num_stack.pop()
            prev = str_stack.pop()
            cur_str = prev + cur_str * n
        else:
            cur_str += ch
    return cur_str
\`\`\``,
    keyPoints: ["双栈：数字栈+字符串栈", "[ 压栈 ] 出栈拼接", "注意多位数字"],
    followUps: ["递归怎么写？", "嵌套深度有限制吗？"],
    favorited: false,
  },
  {
    id: "algo-739",
    nodeId: "p1-stack-queue",
    question: "739. 每日温度（LeetCode 739）\n对每天温度，找下一个更高温度在几天后。",
    answer: `【思路推导】暴力是对每个 i 向右扫第一个更高温度，O(n^2)。关键洞察：若 j 大于 i 且 temperatures[j] 不高于 temperatures[i]，j 就永远不可能是 i 左侧任何一天的答案——i 更近且不低于它。故未结算下标天然按温度单调递减，用单调栈维护，遇更高温连续弹栈结算。类比排队：后面不比你高的人挡不住你的视线。
【代码实现】\`\`\`python
def daily_temperatures(t: list[int]) -> list[int]:
    n = len(t)
    res = [0] * n
    st: list[int] = []  # 存下标，温度单调递减
    for i in range(n):
        while st and t[i] > t[st[-1]]:
            top = st.pop()
            res[top] = i - top  # 结算那一天
        st.append(i)
    return res  # 剩余天答案为 0
# 时间 O(n)：每下标进出栈各一次；空间 O(n)
\`\`\`
【实际应用】单调栈专解“下一个更大元素”类问题：股价的下一个新高、风控里滑动窗口最大值（LeetCode 239 单调队列）、直方图最大矩形（LeetCode 84）。面试官想看的是你能否发现“候选可批量作废”的单调性，而非背模板。
【踩坑与变体】1. 栈存值而非下标，算不出天数差；2. while 写成 if，漏掉连续结算；3. 循环数组走两圈取模（LeetCode 503）；4. 同族：LeetCode 496、42 接雨水。`,
    keyPoints: ["单调递减栈存下标，遇到更高温连续弹栈并结算天数差","每个下标最多进出栈各一次，总时间 O(n) 而非 O(n^2)","核心洞察：被更近且更高的天“压住”的天可以批量作废","栈里存下标而不是值，才能算出距离"],
    followUps: ["如果温度数组是循环的（下一个更大元素 II），怎么处理？","同一套单调栈思想还能解哪些题？说说接雨水或柱状图最大矩形的套路。"],
    favorited: false,
  },
  {
    id: "algo-84",
    nodeId: "p1-stack-queue",
    question: "84. 柱状图中最大的矩形（LeetCode 84）\n找柱状图中能勾勒出的最大矩形面积。",
    answer: `【思路推导】暴力枚举每根柱子作为高，向左右扩展找不矮于它的边界，O(n²)。关键洞察：用单调递增栈一次扫描即可——栈中存下标对应高度递增，遇到更矮的柱子时弹出栈顶，弹出的柱子右边界就是当前下标 i，左边界是弹出后新栈顶+1（栈空则到 0），宽度 × 高即得面积。末尾加 0 哨兵强制弹出所有剩余柱子。类比：栈维护"待结算的柱子"，遇到矮柱就回头结算之前的高柱。
【代码实现】
\`\`\`python
# 时间 O(n)，空间 O(n)
# 关键：弹栈时计算以栈顶为高的矩形面积
def largest_rectangle_area(heights: list[int]) -> int:
    heights = heights + [0]  # 末尾加 0 哨兵，强制弹出所有剩余柱子结算
    stack: list[int] = []  # 存下标，对应高度单调递增
    max_area = 0
    for i in range(len(heights)):
        # 当前柱比栈顶矮，栈顶柱的右边界就是 i，左边界是弹出后新栈顶+1
        while stack and heights[i] < heights[stack[-1]]:
            h = heights[stack.pop()]  # 以栈顶柱为高的矩形
            w = i if not stack else i - stack[-1] - 1  # 栈空则左边界到 0
            max_area = max(max_area, h * w)
        stack.append(i)
    return max_area
\`\`\`
【实际应用】单调栈用于 skyline 问题、股票跨度（LC 901）、温度等待日（LC 739）。面试官考察：能否把"找两侧第一个更小元素"抽象成单调栈模型，以及哨兵简化边界处理的技巧。
【踩坑与变体】1) 必须加哨兵，否则栈中剩余柱子不会被结算；2) 栈存下标而非高度，便于算宽度；3) 变体 LC 85 最大矩形在矩阵中按行重复调用本函数；4) LC 42 接雨水用单调栈或双指针，模型不同。`,
    keyPoints: ["单调递增栈", "弹栈时计算面积", "哨兵节点简化边界"],
    followUps: ["最大矩形怎么转化为这题？", "接雨水和这题的区别？"],
    favorited: false,
  },
  {
    id: "algo-232",
    nodeId: "p1-stack-queue",
    question: "232. 用栈实现队列（LeetCode 232）\n用两个栈实现队列的 push/pop/peek。",
    answer: `【思路推导】栈后进先出、队列先进先出，单栈无法反转顺序；每次 pop 都全倒一遍则单次 O(n)。关键洞察：每个元素只需倒一次——输入栈管 push，输出栈管 pop/peek，输出栈空时才整体倒入，栈底变栈顶，顺序恰好转正。类比两摞纸：新纸放左摞，取最旧的就把左摞翻到右摞上。
【代码实现】\`\`\`python
class MyQueue:
    def __init__(self):
        self.in_s: list[int] = []
        self.out_s: list[int] = []

    def push(self, x: int) -> None:
        self.in_s.append(x)

    def pop(self) -> int:
        self._shift()
        return self.out_s.pop()

    def peek(self) -> int:
        self._shift()
        return self.out_s[-1]

    def _shift(self) -> None:  # 输出栈空才倒栈
        if not self.out_s:
            while self.in_s:
                self.out_s.append(self.in_s.pop())
# 均摊 O(1)，空间 O(n)
\`\`\`
【实际应用】双栈反转见于消息队列消费缓冲、撤销/重做双栈、用栈模拟递归。面试官更想听均摊分析：每个元素进出栈各一次，2n 平摊到 n 次，单次最坏 O(n) 而均摊 O(1)。
【踩坑与变体】1. 每次 pop 都倒栈退化成 O(n)；2. 输出栈非空时误倒栈会乱序；3. 对偶题 LeetCode 225 用队列实现栈；4. 要 O(1) 取最小值可配同步最小栈（LeetCode 155）。`,
    keyPoints: ["输入栈加输出栈：输出栈空时才整体倒栈","每个元素只倒一次，均摊 O(1)，单次最坏 O(n)","倒栈完成顺序反转，输出栈顶即队首","能讲清均摊分析比会写代码更加分"],
    followUps: ["反过来用队列实现栈，单队列能做到吗？","如果要求队列支持 O(1) 取最小值，结构怎么扩展？"],
    favorited: false,
  },

  // ===== Phase 1：二叉树与 BFS/DFS（12题）=====
  {
    id: "algo-94",
    nodeId: "p1-tree",
    question: "94. 二叉树中序遍历（LeetCode 94）\n返回二叉树中序遍历结果。",
    answer: `【思路推导】递归版中序（左-根-右）几行写完，但面试常要求迭代。暴力模拟就是用栈手动保存待回访的节点。关键洞察：中序第一个节点是最左节点；访问完某节点后，下一个要访问的是它右子树的最左节点。循环不变式：一路向左把沿途节点压栈，弹出即访问，再转向右子树。类比沿左链走到头，回头时顺路补看右支。
【代码实现】\`\`\`python
# 假设 TreeNode 已定义
def inorder_traversal(root: "TreeNode | None") -> list[int]:
    res: list[int] = []
    st: list[TreeNode] = []
    cur = root
    while cur is not None or st:
        while cur is not None:
            st.append(cur)
            cur = cur.left  # 左链全压栈
        cur = st.pop()
        res.append(cur.val)  # 弹出即访问
        cur = cur.right  # 转向右子树
    return res
# 时间 O(n)，空间 O(h)，h 为树高
\`\`\`
【实际应用】遍历顺序是树处理的骨架：B+ 树按中序输出有序键，表达式树中序还原中缀式，React Fiber 用显式栈遍历避免调用栈溢出。面试官考察递归与栈的等价转换：任何递归 DFS 都能显式栈化。
【踩坑与变体】1. 外层条件漏“栈非空”，右斜树漏节点；2. 前序把访问移到压栈时；后序加标记或“根右左再反转”；3. Morris 遍历线索化可 O(1) 空间；4. 相关：LeetCode 144 前序、145 后序、173 BST 迭代器。`,
    keyPoints: ["迭代模板：左链全压栈，弹出即访问，转向右子树","外层循环条件是 cur 非空或栈非空，两者缺一不可","递归就是隐式栈，任何递归 DFS 都能显式栈化","前序把访问移到压栈时；后序需标记或反转技巧"],
    followUps: ["Morris 遍历怎么做到 O(1) 空间？代价是什么？","用这个栈结构怎么实现 BST 迭代器的 next 与 hasNext？"],
    favorited: false,
  },
  {
    id: "algo-104",
    nodeId: "p1-tree",
    question: "104. 二叉树最大深度（LeetCode 104）\n返回二叉树最大深度。",
    answer: `【思路推导】最直接的想法是 BFS 逐层展开数层数，正确好懂但要维护队列和层计数。递归视角更精炼：一棵树的最大深度等于左右子树深度的较大者加一，空节点深度为零。为什么成立？从根出发的任意最长路径，跨过根之后必然完整落在某一棵子树里，因此子问题自相似。类比公司层级：CEO 的管理深度等于最深汇报线加一。
【代码实现】\`\`\`python
# 假设 TreeNode 已定义
def max_depth(root: "TreeNode | None") -> int:
    if root is None:
        return 0  # 空节点深度 0
    l = max_depth(root.left)
    r = max_depth(root.right)
    return max(l, r) + 1  # 后序：先取子树答案再合并
# 时间 O(n)，空间 O(h)：递归栈深度等于树高，斜树退化到 O(n)
\`\`\`
【实际应用】树的深度直接决定操作成本：B 树与 B+ 树的层数就是磁盘 IO 次数，权限系统里组织树深度影响继承链解析时长，DOM 深度影响渲染与事件冒泡性能。面试官考察两点：能否套“子问题加合并”的后序模式，以及是否意识到递归深度风险——生产里万层深树会打爆调用栈，应改 BFS 或显式栈迭代。
【踩坑与变体】1. 与最小深度（LeetCode 111）混淆：最小深度在一侧子树为空时必须走非空侧，否则会把单链树误报为 1；2. 斜树递归爆栈；3. BFS 迭代版按层展开计数即可；4. 相关题：LeetCode 559 N 叉树最大深度、LeetCode 543 二叉树直径（深度信息的进阶复用）。`,
    keyPoints: ["后序递归：深度等于 max(左, 右) 加 1，空节点为 0","递归栈空间 O(h)，斜树退化 O(n)，有爆栈风险","BFS 层序计数是等价的迭代解","最小深度是另一道题：一侧为空必须走非空侧"],
    followUps: ["最小深度（LeetCode 111）为什么不能套同一个式子？","树可能有十万层深时，生产代码应该怎么写？"],
    favorited: false,
  },
  {
    id: "algo-226",
    nodeId: "p1-tree",
    question: "226. 翻转二叉树（LeetCode 226）\n翻转二叉树的每个左右子树。",
    answer: `【思路推导】这题没有暴力与优化之分，核心是直接看出自相似性：翻转一棵树等于交换根的左右孩子，再递归翻转两棵子树；先递归再交换同样正确，前序后序皆可。为什么成立？镜像的定义就是对每个节点做同一变换，顺序无关。类比照镜子：整棵树的镜像等于两个子树各自照镜子后再互换位置。Homebrew 作者当年被 Google 拒在这题上，反而说明简单题要写稳。
【代码实现】\`\`\`python
# 假设 TreeNode 已定义
def invert_tree(root: "TreeNode | None") -> "TreeNode | None":
    if root is None:
        return None
    root.left, root.right = root.right, root.left  # 交换左右孩子
    invert_tree(root.left)  # 此时 left 已是原 right
    invert_tree(root.right)
    return root
# 时间 O(n)：每个节点访问一次；空间 O(h)：递归栈
\`\`\`
【实际应用】镜像与结构变换在图形学里对应坐标翻转（CSS 的 scale(-1,1)），在 diff 工具里对应结构对齐。面试官借这题看基本功：递归定义能否脱口而出、nil 判断放在哪、是否原地修改。简单递归写不利索，后面 LeetCode 114 展开链表、LeetCode 236 最近公共祖先这类指针加递归综合题必挂。
【踩坑与变体】1. 交换后仍用保存的旧指针递归，会翻转错误的子树；2. 忘判空导致空指针异常；3. 迭代版用栈或队列做同样交换，BFS 与 DFS 均可；4. 相关题：LeetCode 101 对称二叉树（镜像判定）、LeetCode 100 相同的树、LeetCode 951 翻转等价二叉树。`,
    keyPoints: ["镜像等于每个节点交换左右孩子，前序后序皆可","递归出口：空节点直接返回 null","交换与递归顺序不影响正确性，但交换后要用新指针递归","简单题真正考察编码稳定性与 nil 防护"],
    followUps: ["用迭代（栈或队列）改写，BFS 和 DFS 都可行吗？","怎么判断两棵树是否互为镜像（LeetCode 101 的思路）？"],
    favorited: false,
  },
  {
    id: "algo-101",
    nodeId: "p1-tree",
    question: "101. 对称二叉树（LeetCode 101）\n判断二叉树是否镜像对称。",
    answer: `【思路推导】朴素想法：把左子树翻转后与右子树比较，两次遍历且啰嗦。关键洞察：镜像可直接双指针递归定义——p、q 互为镜像当且仅当值相等，且 p 左与 q 右镜像、p 右与 q 左镜像。一次递归同步下探两棵树，把“翻转再比较”折叠成“比较即翻转”。类比面对面打太极：左出右手对应右出左手。
【代码实现】\`\`\`python
# 假设 TreeNode 已定义
def is_symmetric(root: "TreeNode | None") -> bool:
    if root is None:
        return True
    return _mirror(root.left, root.right)

def _mirror(a: "TreeNode | None", b: "TreeNode | None") -> bool:
    if a is None or b is None:
        return a is b  # 一空一不空即否
    if a.val != b.val:
        return False
    return _mirror(a.left, b.right) and _mirror(a.right, b.left)  # 交叉比较
# 时间 O(n)，空间 O(h)
\`\`\`
【实际应用】对称性判定用于布局校验、镜像目录 diff、编译器结构等价检查。面试官考察双递归参数的建模：LeetCode 100 相同的树、572 子树包含都要同步控制两棵树的游走，写对交叉关系说明真懂镜像。
【踩坑与变体】1. 交叉关系写反成 a.left 对 b.left，变成判断“相同”而非“对称”；2. 空树约定为对称；一空一不空必须 false；3. 迭代版用队列成对取出比较，入队顺序要交叉；4. 变体：LeetCode 100 相同的树、LeetCode 951 翻转等价树。`,
    keyPoints: ["镜像判定：值相等，且 a.left 对 b.right、a.right 对 b.left 交叉递归","双参数递归同步游走两棵树，省掉“翻转再比较”的两遍扫描","一空一不空必为 false，双空为 true","交叉关系写反就成了判断相同的树（LeetCode 100）"],
    followUps: ["用队列迭代怎么写？入队顺序有什么讲究？","如果允许任意节点交换，怎么判断翻转等价（LeetCode 951）？"],
    favorited: false,
  },
  {
    id: "algo-543",
    nodeId: "p1-tree",
    question: "543. 二叉树直径（LeetCode 543）\n返回任意两节点路径的最大长度（边数）。",
    answer: `【思路推导】暴力：对每个节点算左深加右深再取最大，深度被重复计算，O(n^2)。关键洞察：直径必形如“过某节点的两条最长链拼接”，即左深加右深。于是后序一趟：自底向上返回深度的同时用 l+r 更新全局最大，深度信息被复用，零冗余。注意直径不保证过根，故需全局记录。类比：集团内最远两名员工的汇报线必经其公共上级，但那人不一定是 CEO。
【代码实现】function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0;
  const depth = (node: TreeNode | null): number => {
    if (node === null) return 0;
    const l = depth(node.left);
    const r = depth(node.right);
    best = Math.max(best, l + r); // 过该节点的直径
    return Math.max(l, r) + 1; // 返回的是深度
  };
  depth(root);
  return best;
}
时间 O(n)，空间 O(h)。
【实际应用】最长路径见于网络拓扑最大跳数、依赖图最长调用链（构建关键路径）、社交关系最远两人距离。面试官考察“返回 A 顺带更新 B”的后序套路：LeetCode 124 最大路径和、337 打家劫舍 III 同模式。
【踩坑与变体】1. 误以为直径必过根，只在根处算 l+r；2. 混淆返回值与目标值：返回深度、更新直径；3. best 初值取 0 即可覆盖空树；4. 变体：LeetCode 124 最大路径和、687 最长同值路径、1372 最长 ZigZag 路径。`,
    keyPoints: ["过某节点的直径等于左子树深度加右子树深度","后序遍历返回深度、顺手更新全局最大直径，一趟 O(n)","直径不一定过根节点，必须用全局量记录","“返回 A 更新 B”是树形 DP 通用套路，124 与 337 同款"],
    followUps: ["改成带权路径求最大路径和（LeetCode 124），负权怎么处理？","如果要求返回直径的两个端点或具体路径，怎么做？"],
    favorited: false,
  },
  {
    id: "algo-102",
    nodeId: "p1-tree",
    question: "102. 二叉树层序遍历（LeetCode 102）\n返回二叉树按层遍历的节点值。",
    answer: `\`\`\`python
# 思路：BFS + 队列 + 按层记录
# 时间 O(n)，空间 O(n)
# 关键：每层先记录长度再批量出队
# 假设 TreeNode 已定义
from collections import deque

def level_order(root: "TreeNode | None") -> list[list[int]]:
    if root is None:
        return []
    res: list[list[int]] = []
    q: deque[TreeNode] = deque([root])
    while q:
        n = len(q)
        level: list[int] = []
        for _ in range(n):
            node = q.popleft()
            level.append(node.val)
            if node.left is not None:
                q.append(node.left)
            if node.right is not None:
                q.append(node.right)
        res.append(level)
    return res
\`\`\``,
    keyPoints: ["BFS 队列", "每层先记录长度再批量出队", "也可用 DFS + level 参数"],
    followUps: ["之字形层序怎么解？", "右视图怎么解？"],
    favorited: false,
  },
  {
    id: "algo-108",
    nodeId: "p1-tree",
    question: "108. 有序数组转二叉搜索树（LeetCode 108）\n将升序数组转为高度平衡的 BST。",
    answer: `【思路推导】暴力：按序插入升序数组得到右斜链，高度 O(n)，查找退化成链表。关键洞察：BST 中序即升序，升序数组与 BST 互为中序还原；要平衡就让左右子树节点数尽量相等——取区间中点做根，两半递归构建，天然高度平衡。类比二分查找过程树：各比较点连起来正是这棵 BST。
【代码实现】\`\`\`python
# 假设 TreeNode 已定义
def sorted_array_to_bst(nums: list[int]) -> "TreeNode | None":
    def build(lo: int, hi: int) -> "TreeNode | None":
        if lo > hi:
            return None
        mid = (lo + hi) >> 1  # 中点做根
        node = TreeNode(nums[mid])
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(nums) - 1)
# 时间 O(n)，递归栈 O(log n)。传下标而非切片，避免 O(n log n) 拷贝
\`\`\`
【实际应用】有序数据建树是索引构建的原型：数据库把有序键批量加载成 B+ 树、倒排索引离线构建 FST。面试官考察中序与 BST 的对偶理解，以及“下标代替切片”的工程习惯。
【踩坑与变体】1. 递归里 nums.slice 会放大时间空间；2. 中点偏左偏右都行，答案不唯一；3. 偶数个元素取任一中间点都平衡；4. 变体：LeetCode 109 有序链表转 BST（快慢指针找中点）、1382 将 BST 平衡化（先中序拍平再套本题）。`,
    keyPoints: ["升序数组与 BST 中序对偶：区间中点做根，左右半递归构建","传下标区间而非切片，避免 O(n log n) 的数组拷贝","中点偏左偏右都平衡，答案不唯一","二分查找的比较序列本身就是这棵 BST"],
    followUps: ["换成有序链表（LeetCode 109）怎么高效找中点？","给一棵已不平衡的 BST，怎么原地平衡化（LeetCode 1382）？"],
    favorited: false,
  },
  {
    id: "algo-98",
    nodeId: "p1-tree",
    question: "98. 验证二叉搜索树（LeetCode 98）\n判断是否为有效的 BST。",
    answer: `【思路推导】最常见的错误解法：只查每个节点大于左孩子、小于右孩子。反例立刻推翻——右子树深处可能有比根还小的值，局部关系管不住全局约束。关键洞察：合法值域沿路径继承，根值是左子树上界、右子树下界，递归把 (lo, hi) 区间收窄传下，每节点只判自己是否落在开区间。等价地，BST 中序必严格递增。类比安检：每人的合法身份由整条继承链决定，而非只看相邻两人。
【代码实现】\`\`\`python
import math
# 假设 TreeNode 已定义
def is_valid_bst(root: "TreeNode | None") -> bool:
    def dfs(node: "TreeNode | None", lo: float, hi: float) -> bool:
        if node is None:
            return True
        if node.val <= lo or node.val >= hi:
            return False  # 严格开区间
        return dfs(node.left, lo, node.val) and dfs(node.right, node.val, hi)
    return dfs(root, -math.inf, math.inf)
# 时间 O(n)，空间 O(h)
\`\`\`
【实际应用】“沿路径继承约束”是编译器作用域分析、类型检查、RBAC 权限继承的通用模型。面试官考察两点：能否造反例推翻局部判定，以及两种解法的对偶——区间法管祖先约束，中序法管全局顺序。
【踩坑与变体】1. 只比父子不管祖先，反例 [5,1,4,null,null,3,6]；2. 严格不等，重复值必须 false；3. 初界用整数最小值会误判同值节点，改用 Infinity；4. 中序迭代维护 prev 判递增；变体：LeetCode 530、333 最大 BST 子树。`,
    keyPoints: ["BST 合法值域沿路径继承：递归携带 (lo, hi) 开区间并一路收窄","只比父子是经典错误，反例 [5,1,4,null,null,3,6]","中序严格递增是等价判定，与区间法互为对偶","初界用 Infinity，避免与节点极值冲突；重复值必须判 false"],
    followUps: ["中序遍历法怎么写？迭代版维护 prev 要注意什么？","如果树里允许重复值且约定左侧小于等于根，判定式怎么改？"],
    favorited: false,
  },
  {
    id: "algo-230",
    nodeId: "p1-tree",
    question: "230. 二叉搜索树第 K 小（LeetCode 230）\n找 BST 中第 K 小的元素。",
    answer: `【思路推导】暴力：中序遍历成数组再取下标 k-1，O(n) 时间加 O(n) 空间。关键洞察：BST 中序序列就是升序，第 k 小等于中序第 k 个被访问的节点，故只需中序游走计数，数到 k 立即停。类比翻字典：按字母序数到第 k 个词条就合上书。
【代码实现】\`\`\`python
# 假设 TreeNode 已定义
def kth_smallest(root: "TreeNode | None", k: int) -> int:
    st: list[TreeNode] = []
    cur = root
    while cur is not None or st:
        while cur is not None:
            st.append(cur)
            cur = cur.left  # 压左链
        cur = st.pop()
        k -= 1
        if k == 0:
            return cur.val  # 数到第 k 个立即返回
        cur = cur.right
    return -1  # 按题意不会发生
# 时间 O(h+k)，空间 O(h)，远优于整树遍历
\`\`\`
【实际应用】有序存储取第 N 条很常见：数据库 ORDER BY LIMIT 走 B+ 树有序扫描、时序库按时间戳取第 k 个采样点。面试官真正的考点在 follow-up：频繁查询时给节点维护子树 size，就能像 order-statistics tree 一样 O(h) 定位，跳表排名也是这原理。
【踩坑与变体】1. 递归版忘剪枝，找到后仍跑完整棵树；2. 闭包计数变量跨测例没重置；3. 第 k 大即“右-根-左”反向中序；4. 变体：LeetCode 173 BST 迭代器、538 转累加树、671 二叉树第二小。`,
    keyPoints: ["BST 中序即升序，第 k 小等于中序第 k 个被访问的节点","迭代中序加计数，数到 k 提前返回，时间 O(h+k)","第 k 大就是右-根-左的反向中序","频繁查询：节点维护子树 size，降为 O(h) 的 order-statistics 树"],
    followUps: ["频繁查询 k 值且树会动态插入删除，怎么优化？","改成 BST 迭代器（LeetCode 173），next 均摊 O(1) 怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-199",
    nodeId: "p1-tree",
    question: "199. 二叉树右侧视图（LeetCode 199）\n返回从右侧看二叉树能看到的节点值。",
    answer: `\`\`\`python
# 思路：BFS 层序遍历，每层最后一个节点
# 时间 O(n)，空间 O(n)
# 关键：层序遍历每层的最右节点
# 假设 TreeNode 已定义
from collections import deque

def right_side_view(root: "TreeNode | None") -> list[int]:
    if root is None:
        return []
    res: list[int] = []
    q: deque[TreeNode] = deque([root])
    while q:
        n = len(q)
        for i in range(n):
            node = q.popleft()
            if i == n - 1:
                res.append(node.val)
            if node.left is not None:
                q.append(node.left)
            if node.right is not None:
                q.append(node.right)
    return res
\`\`\``,
    keyPoints: ["BFS 层序", "每层最后一个节点", "也可 DFS 右子树优先"],
    followUps: ["左侧视图怎么解？", "DFS 怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-114",
    nodeId: "p1-tree",
    question: "114. 二叉树展开为链表（LeetCode 114）\n按前序遍历将二叉树展开为右链。",
    answer: `【思路推导】要求按前序原地展开成右链。朴素做法：先序收集节点再串起来，要 O(n) 额外空间。关键洞察：前序的逆序是“右-左-根”遍历——按右、左、根处理时，每个节点的前序后继恰是上一个处理完的节点。于是维护 prev：当前节点 right 指向 prev、left 置空，prev 前移，每节点只动一次指针。类比从队尾往队首系绳子：新一节接到已系好的绳头上。
【代码实现】
\`\`\`python
def flatten(root: "TreeNode | None") -> None:
    prev: "TreeNode | None" = None

    def dfs(node: "TreeNode | None") -> None:
        nonlocal prev
        if node is None:
            return
        dfs(node.right)            # 先右后左：逆前序
        dfs(node.left)
        node.right = prev          # 接到已展开的链头
        node.left = None
        prev = node                # 链头前移

    dfs(root)
# 时间 O(n)，空间 O(h)
\`\`\`
【实际应用】遍历序逆用是编译器常见技巧：从期望输出倒推构造顺序，类似寄存器分配的逆序活跃分析。面试官考察三点：发现“前序逆等于右左根”的对称性、指针不断链、改出迭代版——栈做正向前序，边遍历边把上一节点 right 指向当前节点。
【踩坑与变体】1. 正序递归先改指针再访右子树会丢右子树，必须先存；2. 忘把 left 置空，评测判链不合法；3. 迭代版先压 right 再压 left，prev 同步推进；4. O(1) 空间用 Morris 式：左子树最右节点接右子树；变体 LeetCode 116 填充 next 指针、897 递增顺序搜索树。`,
    keyPoints: ["前序的逆序等于右-左-根遍历，逆序接链每节点只动一次指针","prev 指针记录已展开链头，right 接 prev、left 置空","迭代版：栈做正向前序，上一节点 right 指向当前节点","正序直接改指针会丢右子树，必须先保存"],
    followUps: ["用 O(1) 空间的 Morris 式做法怎么实现？","如果改成展开成双向链表（LeetCode 426），思路怎么变？"],
    favorited: false,
  },
  {
    id: "algo-105",
    nodeId: "p1-tree",
    question: "105. 从前序与中序遍历构造二叉树（LeetCode 105）\n根据前序和中序遍历构造二叉树。",
    answer: `\`\`\`python
# 思路：前序第一个是根，中序中找根分左右
# 时间 O(n)，空间 O(n)
# 关键：前序定根，中序分左右子树

def build_tree(preorder: list[int], inorder: list[int]) -> "TreeNode | None":
    idx_map: dict[int, int] = {v: i for i, v in enumerate(inorder)}

    def build(pre_l: int, pre_r: int, in_l: int, in_r: int) -> "TreeNode | None":
        if pre_l > pre_r:
            return None
        root_val = preorder[pre_l]
        root_idx = idx_map[root_val]
        left_size = root_idx - in_l
        return TreeNode(
            root_val,
            build(pre_l + 1, pre_l + left_size, in_l, root_idx - 1),
            build(pre_l + left_size + 1, pre_r, root_idx + 1, in_r),
        )

    return build(0, len(preorder) - 1, 0, len(inorder) - 1)
\`\`\``,
    keyPoints: ["前序定根", "中序分左右", "哈希表加速查找根位置"],
    followUps: ["中序+后序怎么构造？", "前序+后序能唯一确定吗？"],
    favorited: false,
  },

  // ===== Phase 1：回溯（6题）=====
  {
    id: "algo-46",
    nodeId: "p1-backtrack",
    question: "46. 全排列（LeetCode 46）\n返回不含重复数字数组的所有全排列。",
    answer: `\`\`\`python
# 思路：回溯 + used 数组
# 时间 O(n·n!)，空间 O(n)
# 关键：回溯模板——选择-递归-撤销

def permute(nums: list[int]) -> list[list[int]]:
    res: list[list[int]] = []
    path: list[int] = []
    used = [False] * len(nums)

    def backtrack() -> None:
        if len(path) == len(nums):
            res.append(path[:])  # 复制 path 再加入结果
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return res
\`\`\``,
    keyPoints: ["回溯三要素：选择/路径/结束", "used 数组标记", "复制 path 再加入结果"],
    followUps: ["有重复数字怎么去重？", "组合总和怎么解？"],
    favorited: false,
  },
  {
    id: "algo-78",
    nodeId: "p1-backtrack",
    question: "78. 子集（LeetCode 78）\n返回不含重复元素数组的所有子集。",
    answer: `【思路推导】暴力枚举每个元素选或不选，2^n 种组合。关键洞察：用回溯 + start 参数避免回头——每个递归节点先收集当前 path（每个节点都是一个子集），再从 start 开始枚举下一个选谁，选了就递归再撤销。start 控制只向后选，天然避免重复子集。类比：排队选人，选了第 i 个就只能从 i+1 往后选，不会回头选前面的。
【代码实现】
\`\`\`python
# 时间 O(n·2^n)，空间 O(n)
# 关键：每个递归节点都收集，start 控制不回头
def subsets(nums: list[int]) -> list[list[int]]:
    res: list[list[int]] = []
    path: list[int] = []

    def backtrack(start: int) -> None:
        res.append(path[:])  # 每个节点都收集
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()

    backtrack(0)
    return res
\`\`\`
【实际应用】回溯 + start 参数是组合/子集问题的通用模板：组合（LC 77）、组合总和（LC 39）、子集 II（LC 90 含去重）。面试官考察：能否区分全排列（用 visited 数组）与子集（用 start）的框架差异。
【踩坑与变体】1) path 必须拷贝后收集，否则后续修改会污染结果；2) 含重复元素时先排序再用 nums[i]==nums[i-1] 跳过同层重复；3) 全排列不用 start 而用 visited，因为顺序不同算不同排列；4) 迭代法：每个元素对现有子集做"加或不加"二选一扩展。`,
    keyPoints: ["回溯 + start 参数", "每个节点都收集", "与全排列的区别"],
    followUps: ["有重复元素怎么去重？", "组合问题怎么解？"],
    favorited: false,
  },
  {
    id: "algo-17",
    nodeId: "p1-backtrack",
    question: "17. 电话号码的字母组合（LeetCode 17）\n返回电话号码对应的所有字母组合。",
    answer: `\`\`\`python
# 思路：回溯，每位数字对应多个字母
# 时间 O(4^n)，空间 O(n)
# 关键：数字到字母的映射 + 回溯

def letter_combinations(digits: str) -> list[str]:
    if not digits:
        return []
    mapping = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
    res: list[str] = []
    path: list[str] = []

    def backtrack(idx: int) -> None:
        if idx == len(digits):
            res.append("".join(path))
            return
        for ch in mapping[int(digits[idx])]:
            path.append(ch)
            backtrack(idx + 1)
            path.pop()

    backtrack(0)
    return res
\`\`\``,
    keyPoints: ["数字到字母映射", "回溯遍历每位", "空串返回空"],
    followUps: ["如果有多个数字相同？", "BFS 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-39",
    nodeId: "p1-backtrack",
    question: "39. 组合总和（LeetCode 39）\n找候选数组中和为 target 的所有组合，数字可重复使用。",
    answer: `\`\`\`python
# 思路：回溯 + start 参数允许重复
# 时间 O(2^n)，空间 O(target)
# 关键：允许重复使用，所以 backtrack(i) 不是 backtrack(i+1)

def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    res: list[list[int]] = []
    path: list[int] = []

    def backtrack(start: int, remain: int) -> None:
        if remain == 0:
            res.append(path[:])
            return
        if remain < 0:  # 剪枝
            return
        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i, remain - candidates[i])  # i 不是 i+1，允许重复
            path.pop()

    backtrack(0, target)
    return res
\`\`\``,
    keyPoints: ["回溯 + start 避免重复组合", "允许重复用所以传 i 不传 i+1", "剪枝 remain<0"],
    followUps: ["每个数字只能用一次怎么改？", "有重复候选数怎么去重？"],
    favorited: false,
  },
  {
    id: "algo-22",
    nodeId: "p1-backtrack",
    question: "22. 括号生成（LeetCode 22）\n生成 n 对括号的所有合法组合。",
    answer: `\`\`\`python
# 思路：回溯，左括号数<右括号数时可加右括号
# 时间 O(4^n/sqrt(n))，空间 O(n)
# 关键：左数<n 可加左，左数>右数可加右

def generate_parenthesis(n: int) -> list[str]:
    res: list[str] = []
    path: list[str] = []

    def backtrack(left: int, right: int) -> None:
        if len(path) == 2 * n:
            res.append("".join(path))
            return
        if left < n:
            path.append("(")
            backtrack(left + 1, right)
            path.pop()
        if right < left:
            path.append(")")
            backtrack(left, right + 1)
            path.pop()

    backtrack(0, 0)
    return res
\`\`\``,
    keyPoints: ["回溯 + 左右计数", "左<n 加左，右<左 加右", "保证合法"],
    followUps: ["生成所有括号组合（不要求合法）？", "n 很大时怎么办？"],
    favorited: false,
  },
  {
    id: "algo-79",
    nodeId: "p1-backtrack",
    question: "79. 单词搜索（LeetCode 79）\n在二维字母板中搜索单词是否存在。",
    answer: `\`\`\`python
# 思路：DFS 回溯 + 访问标记
# 时间 O(m·n·4^L)，空间 O(L)
# 关键：从每个格子出发 DFS，标记已访问

def exist(board: list[list[str]], word: str) -> bool:
    m, n = len(board), len(board[0])

    def dfs(i: int, j: int, idx: int) -> bool:
        if idx == len(word):
            return True
        if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[idx]:
            return False
        tmp = board[i][j]
        board[i][j] = "#"  # 标记已访问
        found = (
            dfs(i + 1, j, idx + 1)
            or dfs(i - 1, j, idx + 1)
            or dfs(i, j + 1, idx + 1)
            or dfs(i, j - 1, idx + 1)
        )
        board[i][j] = tmp  # 恢复
        return found

    for i in range(m):
        for j in range(n):
            if dfs(i, j, 0):
                return True
    return False
\`\`\``,
    keyPoints: ["DFS 回溯", "原地标记访问", "四方向递归"],
    followUps: ["多个单词同时搜索怎么解（Trie）？", "如何剪枝优化？"],
    favorited: false,
  },

  // ===== Phase 1：排序与二分（7题）=====
  {
    id: "algo-33",
    nodeId: "p1-sort-binary",
    question: "33. 搜索旋转排序数组（LeetCode 33）\n在旋转后的有序数组中查找目标值。",
    answer: `\`\`\`python
# 思路：二分，判断哪半边有序再决定方向
# 时间 O(logn)，空间 O(1)
# 关键：判断左/右半哪边有序，再判断 target 在不在

def search(nums: list[int], target: int) -> int:
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if nums[mid] == target:
            return mid
        if nums[l] <= nums[mid]:  # 左半有序
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:  # 右半有序
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    return -1
\`\`\``,
    keyPoints: ["二分查找", "判断左/右半哪边有序", "再判断 target 是否在有序区间"],
    followUps: ["有重复元素怎么办？", "查找最小值怎么解？"],
    favorited: false,
  },
  {
    id: "algo-34",
    nodeId: "p1-sort-binary",
    question: "34. 在排序数组中查找元素第一个和最后一个（LeetCode 34）\n返回有序数组中目标值的起止位置。",
    answer: `【思路推导】暴力扫描 O(n)，不满足 O(log n) 要求。关键洞察：等于 target 的连续区间由两个边界决定——第一个大于等于 target（左边界）与第一个大于 target（减一即右边界）。二分不命中即停，每次向可能含答案的一侧收敛，不变式保证 l 停在边界。对 target 与 target+1 各查一次即得。
【代码实现】
\`\`\`python
def search_range(nums: list[int], target: int) -> list[int]:
    def lower(x: int) -> int:
        l, r = 0, len(nums)
        while l < r:
            m = (l + r) // 2
            if nums[m] < x:
                l = m + 1
            else:
                r = m
        return l

    left = lower(target)
    right = lower(target + 1) - 1
    return [left, right] if left <= right else [-1, -1]
# 时间 O(log n)，空间 O(1)
\`\`\`
【实际应用】lower_bound 是有序存储核心原语：STL 的 equal_range、索引范围扫描定位、日志按时间戳二分偏移。面试官考察模板洁癖：区间定义、收敛方向、死循环防护。
【踩坑与变体】1. 误用小于等于收缩右边界会死循环；2. target 为整数上限时 target+1 溢出，改查大于 target；3. 不存在时忘返回 [-1,-1]；4. 变体：LeetCode 35 搜索插入位置、33 搜索旋转数组、278 第一个错误版本。`,
    keyPoints: ["左边界等于第一个大于等于 target，右边界等于第一个大于 target 再减一","一个 lower_bound 模板查 target 与 target+1 两次","左闭右开区间配 nums[m] 小于 x 时 l=m+1、否则 r=m，保证收敛","二分找边界不靠命中即停，靠循环不变式"],
    followUps: ["target 是整数上限时 target+1 溢出，怎么改？","用一次二分同时找两个边界，分治递归版怎么写？"],
    favorited: false,
  },
  {
    id: "algo-153",
    nodeId: "p1-sort-binary",
    question: "153. 寻找旋转排序数组中的最小值（LeetCode 153）\n找旋转有序数组的最小值。",
    answer: `【思路推导】暴力线性扫描找谷底 O(n)，浪费了两段有序的结构。关键洞察：旋转数组由两个升序段拼成，最小值是唯一比前驱小的断点，也是右段起点。二分时比较 nums[mid] 与右端 nums[r]：若 nums[mid] 大于 nums[r]，说明 mid 在左段、断点在右半，l=mid+1；否则 mid 已在右段或恰为最小值，r=mid。区间恒缩一半且答案始终在 [l,r] 内，l 等于 r 即收敛。类比：断点一定藏在看起来乱的那一半里。
【代码实现】
\`\`\`python
def find_min(nums: list[int]) -> int:
    l, r = 0, len(nums) - 1  # 左闭右闭
    while l < r:
        m = (l + r) >> 1
        if nums[m] > nums[r]:
            l = m + 1      # 最小值在右半
        else:
            r = m          # m 可能就是最小值
    return nums[l]
# 时间 O(log n)，空间 O(1)
\`\`\`
【实际应用】在近似有序里二分广泛用于工程：环形缓冲区定位最老日志、Kafka 分区内按 offset 二分消息、git bisect 定位第一个坏提交、CDN 按时间戳二分缓存分片。面试官考察的核心认知：二分的本质是单调性判定，不要求数组整体有序。
【踩坑与变体】1. 与 nums[l] 比较会搞错方向，与右端比最稳；2. 数组未旋转时同样正确，不必特判；3. l=mid 会死循环，本模板 r=mid 配向下取整安全；4. 变体：LeetCode 154 含重复元素（相等时 r 减一，最坏 O(n)）、LeetCode 33 搜索旋转排序数组、LeetCode 81 搜索旋转排序数组 II。`,
    keyPoints: ["与右端 nums[r] 比较：大于则最小值在右半，否则在左半（含 mid）","r=mid 配合向下取整，区间必缩不死循环","未旋转数组同样正确，无需特判","本质是单调性判定：断点藏在乱的那一半，不要求整体有序"],
    followUps: ["含重复元素（LeetCode 154）时为什么要 r 减一？复杂度退化到多少？","在旋转数组里搜索目标值（LeetCode 33）怎么复用同一思想？"],
    favorited: false,
  },
  {
    id: "algo-56",
    nodeId: "p1-sort-binary",
    question: "56. 合并区间（LeetCode 56）\n合并所有重叠的区间。",
    answer: `【思路推导】暴力解法是反复扫描区间对、两两合并直到收敛，O(n²) 以上且繁琐。关键洞察：按起点排序后，重叠关系变成相邻关系——若当前区间与结果末尾区间不重叠，它与更早的也不可能重叠，于是只需一次线性扫描。类比：整理书架上叠放的书，按左边沿排序后从左到右扫，能摞一起就摞，否则新起一摞。
【代码实现】
\`\`\`python
def merge(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])  # 按起点排序
    res: list[list[int]] = []
    for iv in intervals:
        if res and iv[0] <= res[-1][1]:
            res[-1][1] = max(res[-1][1], iv[1])  # 有重叠，扩展终点
        else:
            res.append([iv[0], iv[1]])           # 无重叠，开新区间
    return res
# 时间 O(n log n)，瓶颈在排序；空间 O(n)
\`\`\`
【实际应用】日历合并忙碌时段求空闲、监控平台合并重叠告警窗口、数据库范围查询归并、云资源按时段合并账单。面试官考察你能否看出排序把全局两两关系降为局部相邻关系这一通用范式。
【踩坑与变体】1) 忘排序直接扫，结果错误。2) 合并终点要取 max(last[1], iv[1])，存在包含关系如 [1,10] 与 [2,3]。3) 变体：LeetCode 57 插入区间、986 区间交集、253 会议室 II。`,
    keyPoints: ["按起点排序后，重叠关系变为相邻关系，一次线性扫描即可合并","合并时终点取 max，防止被包含区间（如 [1,10] 吞掉 [2,3]）写小","排序 O(n log n) 是瓶颈，扫描合并本身只要 O(n)","判断重叠条件：当前起点 <= 结果末尾区间的终点"],
    followUps: ["如果要在已合并的有序区间列表里插入一个新区间，怎么做到 O(n)？（LeetCode 57）","给你两个各自无重叠的区间列表，如何求它们的交集？（LeetCode 986）"],
    favorited: false,
  },
  {
    id: "algo-179",
    nodeId: "p1-sort-binary",
    question: "179. 最大数（LeetCode 179）\n将数组排列成最大的数字字符串。",
    answer: `【思路推导】暴力是全排列枚举所有拼接顺序取最大，O(n!) 不可行。关键洞察：相邻两个数的相对顺序可局部决定——比较拼接串 a+b 与 b+a 谁大，谁大谁就排前面。这个比较关系满足传递性（可证明构成全序），因此用该比较器排序整个数组即得全局最优。这是贪心思想的典型：局部两两最优拼出全局最优。类比：给合影排队，按两人站一起谁更显高来决定前后，两两比较定下的顺序就是最佳站位。
【代码实现】
\`\`\`python
from functools import cmp_to_key

def largest_number(nums: list[int]) -> str:
    strs = [str(x) for x in nums]

    def cmp(a: str, b: str) -> int:
        # 比较 ab 与 ba，谁大谁排前
        if a + b > b + a:
            return -1
        elif a + b < b + a:
            return 1
        return 0

    strs.sort(key=cmp_to_key(cmp))
    if strs[0] == "0":  # 全零特判
        return "0"
    return "".join(strs)
# 时间 O(n log n * k)，k 为数字平均位数；空间 O(n)
\`\`\`
【实际应用】自定义比较器在工程中无处不在：版本号排序（1.10 > 1.9）、数值与字典序混合排序、多优先级任务调度。核心方法论是先证明比较关系是全序，再交给标准排序。面试官考察你能否构造正确比较函数、是否意识到排序器必须满足严格弱序，以及全零这类脏数据边界。
【踩坑与变体】1) 直接按数值降序排是错的：3 和 30 应拼 330 而非 303。2) 忘全零特判，输入 [0,0] 会输出 00 而非 0。3) 比较器不能随意返回相等，否则排序结果不确定。4) 变体：求最小数即比较器反向；LeetCode 937 重新排列日志（复合比较器）、LeetCode 953 验证外星语词典（自定义字母序）。`,
    keyPoints: ["贪心比较器：a+b 与 b+a 谁大谁排前，局部最优推全局最优","比较关系必须构成全序（有传递性），否则排序结果未定义","全零输入必须特判，否则输出 00 这类前导零串","复杂度 O(n log n * k)，k 是数字位数，拼接比较不是 O(1)"],
    followUps: ["如何证明这个比较器具有传递性，排序后一定是全局最大？","如果不能把数字转成字符串，纯数值比较该怎么做？"],
    favorited: false,
  },
  {
    id: "algo-4",
    nodeId: "p1-sort-binary",
    question: "4. 寻找两个正序数组的中位数（LeetCode 4）\n找两个有序数组的中位数。要求 O(log(m+n))。",
    answer: `\`\`\`python
# 思路：二分较短数组，找第 K 小
# 时间 O(log(min(m,n)))，空间 O(1)
# 关键：二分找分割点，左边最大<=右边最小

def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    l, r = 0, m
    INF = 1 << 31
    while l <= r:
        i = (l + r) // 2                       # nums1 左半长度
        j = (m + n + 1) // 2 - i               # nums2 左半长度
        max_left1 = -INF if i == 0 else nums1[i - 1]
        min_right1 = INF if i == m else nums1[i]
        max_left2 = -INF if j == 0 else nums2[j - 1]
        min_right2 = INF if j == n else nums2[j]
        if max_left1 <= min_right2 and max_left2 <= min_right1:
            if (m + n) % 2 == 1:
                return float(max(max_left1, max_left2))
            return (max(max_left1, max_left2) + min(min_right1, min_right2)) / 2
        if max_left1 > min_right2:
            r = i - 1
        else:
            l = i + 1
    return 0.0
\`\`\``,
    keyPoints: ["二分较短数组", "找分割点使左max<=右min", "奇偶分别处理"],
    followUps: ["第 K 小怎么求？", "如果允许 O(m+n) 怎么做？"],
    favorited: false,
  },
  {
    id: "algo-875",
    nodeId: "p1-sort-binary",
    question: "875. 爱吃香蕉的珂珂（LeetCode 875）\n每小时吃 k 根香蕉，求在 h 小时内吃完所有堆的最小速度 k。",
    answer: `\`\`\`python
# 思路：二分答案——速度 k 越大耗时越少，单调可二分；"最大值最小化"范式
# 时间 O(n·log max(piles))，空间 O(1)
# 关键：判定函数 hours(k) = ∑⌈p/k⌉ 单调递减，二分满足 hours(k) <= h 的最小 k

def min_eating_speed(piles: list[int], h: int) -> int:
    lo, hi = 1, max(piles)  # 上界：最快一堆一小时
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if _hours(piles, mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo  # lo == hi 即最小可行速度

def _hours(piles: list[int], k: int) -> int:
    t = 0
    for p in piles:
        t += (p + k - 1) // k  # 向上取整
    return t
\`\`\``,
    keyPoints: ["二分答案：最大值最小化", "判定函数单调", "向上取整 (p+k-1)/k"],
    followUps: ["为什么 lo==hi 时就是答案？", "同范式题：LC 1011 船运货物？"],
    favorited: false,
  },

  // ===== Phase 2：动态规划（21题）=====
  {
    id: "algo-70",
    nodeId: "p2-dp",
    question: "70. 爬楼梯（LeetCode 70）\n每次爬 1 或 2 阶，爬到 n 阶有多少种方式？",
    answer: `【思路推导】暴力是递归枚举每步走 1 或 2 阶的所有路径，等于遍历一棵高度 n 的二叉树，O(2^n) 指数级，且子问题被大量重复计算。关键洞察：到达第 i 阶的最后一步只有两种互斥且穷尽的可能——从 i-1 迈 1 步，或从 i-2 迈 2 步，所以 f(i) = f(i-1) + f(i-2)，即斐波那契。重叠子问题加最优子结构，正是动态规划的标志。类比：数路线不用真走完，只需记住到每个路口有几条来路。
【代码实现】
\`\`\`python
def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    a, b = 1, 2  # a=f(1), b=f(2)
    for _ in range(3, n + 1):
        c = a + b  # f(i)=f(i-1)+f(i-2)
        a, b = b, c
    return b
# 时间 O(n)，空间 O(1)（滚动变量压缩）
\`\`\`
【实际应用】这是 DP 入门范式，同构问题遍布工程：消息消费每次处理 1 或 2 条的批处理方案计数、套餐组合数、缓存逐层预热的可达状态数。面试官真正想看的不是背答案，而是你能否从递归树里识别重叠子问题，并主动走记忆化、自底向上、滚动变量这条优化演进路线。
【踩坑与变体】1) 纯递归不记忆化会超时，n=45 就要几十亿次调用。2) 初始条件 n=1、2 容易写错。3) n 大时结果溢出 32 位整数，实际要取模或大数。4) 变体：LeetCode 746 使用最小花费爬楼梯（带代价 DP）；每次可爬 1 到 k 步则转移变窗口和，可用滑动窗口优化；LeetCode 91 解码方法同属最后一步分类思想。`,
    keyPoints: ["状态定义 f(i)=爬到第 i 阶的方式数，转移 f(i)=f(i-1)+f(i-2)","识别标志：重叠子问题 + 最优子结构，从递归树重复节点看出","状态只依赖前两项，滚动变量把空间从 O(n) 压到 O(1)","优化演进路线：暴力递归 -> 记忆化 -> 自底向上 -> 空间压缩"],
    followUps: ["如果每次可以爬 1 到 k 阶，转移方程怎么改，还能继续优化吗？","如果每阶台阶有花费，求爬到顶的最小花费怎么解？（LeetCode 746）"],
    favorited: false,
  },
  {
    id: "algo-118",
    nodeId: "p2-dp",
    question: "118. 杨辉三角（LeetCode 118）\n生成前 n 行杨辉三角。",
    answer: `【思路推导】从定义出发：每个位置 (i,j) 等于肩上两数之和，即 dp[i][j] = dp[i-1][j-1] + dp[i-1][j]，边界 j=0 和 j=i 恒为 1，这是最朴素的二维 DP，依赖图是一张三角形网。若用组合数公式逐个算，阶乘溢出且子结果无法复用；DP 天然复用。类比：Excel 里每个单元格引用上一行相邻两格，逐行填表即得全表。
【代码实现】
\`\`\`python
def generate(num_rows: int) -> list[list[int]]:
    res: list[list[int]] = []
    for i in range(num_rows):
        row = [1] * (i + 1)  # 首尾天然为 1
        for j in range(1, i):
            row[j] = res[i - 1][j - 1] + res[i - 1][j]  # 肩上两数之和
        res.append(row)
    return res
# 时间 O(n²)，空间 O(n²)（输出本身就需要）
\`\`\`
【实际应用】杨辉三角即二项式系数表，用于组合计数与概率计算：二项分布、多项式展开、推荐系统特征组合数估算、A/B 实验分组方案数 C(n,k)。面试官考察基础 DP 建模与边界控制。
【踩坑与变体】1) 内层写成 j <= i 会越界读 undefined。2) 30 行后数值超 32 位整数，需大数或取模。3) 变体：LeetCode 119 只要第 k 行——一维数组从后往前滚动更新，O(k) 空间，逆序防止覆盖旧值。4) 组合数递推 C(i,j+1)=C(i,j)*(i-j)/(j+1) 可单行生成，注意连乘精度。`,
    keyPoints: ["转移方程 dp[i][j]=dp[i-1][j-1]+dp[i-1][j]，首尾恒为 1","逐行生成，新行先 fill(1) 再填中间，边界处理最干净","时间 O(n²) 已是最优，因为输出本身就有 O(n²) 个元素","只要单行时可一维逆序滚动，把空间压到 O(k)"],
    followUps: ["如果只要求返回第 k 行而不是全部，空间怎么优化到 O(k)？（LeetCode 119）","杨辉三角第 i 行第 j 个数和组合数 C(i,j) 什么关系，能利用它做什么？"],
    favorited: false,
  },
  {
    id: "algo-198",
    nodeId: "p2-dp",
    question: "198. 打家劫舍（LeetCode 198）\n不能偷相邻房屋，求最大金额。",
    answer: `【思路推导】暴力枚举所有不含相邻房屋的子集，O(2^n) 不可行。关键洞察：对第 i 家只有偷与不偷两种决策——偷则收益为 nums[i] 加上前 i-2 家的最优解，不偷则收益等于前 i-1 家的最优解，取两者较大，即 dp[i] = max(dp[i-1], dp[i-2] + nums[i])。状态只依赖前两项，可滚动压缩到 O(1)。类比：走格子游戏，每格决定踩不踩，踩了下一格必须跳过，记忆里只留最近两步的最好成绩。
【代码实现】
\`\`\`python
def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0  # dp[i-2], dp[i-1]
    for x in nums:
        cur = max(prev1, prev2 + x)  # 偷或不偷
        prev2, prev1 = prev1, cur
    return prev1
# 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】相邻互斥选择模型在工程里很常见：广告投放同一用户不能连续打扰两次的最大曝光收益、调度系统中互斥任务的最大权重独立集、限流窗口内动作选择。面试官考察你能否把业务约束抽象成选/不选加互斥的 DP 状态，以及是否主动做空间压缩，而不是只写个 dp 数组交差。
【踩坑与变体】1) 初始值 prev1、prev2 都从 0 起步即可兼容 n=1 等短数组，无需一堆特判。2) 误以为要处理负金额，其实不偷就是 0 起步已天然覆盖。3) 变体：LeetCode 213 环形房屋（拆两条线性）、LeetCode 337 树形打家劫舍（后序遍历返回偷/不偷二元组）、LeetCode 740 删除并获得点数（先聚合成点数序列再套用本题模板）。`,
    keyPoints: ["核心决策：偷第 i 家则收益 nums[i]+dp[i-2]，不偷则 dp[i-1]，取 max","转移 dp[i]=max(dp[i-1], dp[i-2]+nums[i])，只依赖前两项","滚动变量 prev1/prev2 实现 O(1) 空间，初值全 0 免特判","相邻互斥是通用建模模板，环形、树形都是它的变体"],
    followUps: ["如果房屋排成一个环，第一家和最后一家相邻，怎么改？（LeetCode 213）","如果房屋是一棵二叉树结构，相邻指父子节点，怎么做？（LeetCode 337）"],
    favorited: false,
  },
  {
    id: "algo-213",
    nodeId: "p2-dp",
    question: "213. 打家劫舍 II（LeetCode 213）\n环形排列的房屋，不能偷相邻，求最大金额。",
    answer: `【思路推导】环形麻烦在首尾相邻，直接套线性解法会导致首尾同偷。关键洞察：首尾不能同时选，按第一家分类讨论，把环劈成两条互斥的链——偷第一家则最后一家禁选（范围 [0, n-2]），不偷第一家则最后一家可选（范围 [1, n-1]），各自是标准线性打家劫舍，取最大值。类比：圆桌就座拆成主人坐与不坐两条直线排队。
【代码实现】
\`\`\`python
def rob(nums: list[int]) -> int:
    n = len(nums)
    if n == 1:
        return nums[0]

    def rob_range(l: int, r: int) -> int:
        prev2 = prev1 = 0
        for i in range(l, r + 1):
            cur = max(prev1, prev2 + nums[i])  # 线性 rob
            prev2, prev1 = prev1, cur
        return prev1

    return max(rob_range(0, n - 2), rob_range(1, n - 1))
# 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】环形约束对应环形缓冲区调度、循环排班、环形拓扑负载。破环成链是通用技巧：环形 DP 优先对某元素分类讨论把环断开。
【踩坑与变体】1) 忘 n=1 特判，两范围落空返回 0 而非 nums[0]。2) 试图一条扫描内处理环形约束会状态混乱，拆两次扫描最清晰。3) 变体：LeetCode 337 树形、256 粉刷房子；限偷 K 家则状态加一维 dp[i][k]。`,
    keyPoints: ["破环成链：按第一家偷/不偷拆成 [0,n-2] 与 [1,n-1] 两条线性","两种情形互斥且穷尽，答案取两者 max","复用线性打家劫舍作为子函数，不重复造轮子","n=1 必须特判，否则两个范围都为空"],
    followUps: ["为什么拆成的两种情况能覆盖所有合法方案，会不会漏掉首尾都不偷的情形？","如果限制最多只能偷 K 家房屋，状态该怎么设计？"],
    favorited: false,
  },
  {
    id: "algo-300",
    nodeId: "p2-dp",
    question: "300. 最长递增子序列（LeetCode 300）\n返回最长严格递增子序列长度。",
    answer: `【思路推导】暴力枚举子序列 O(2^n)；常规 DP 为 O(n²)。更快的关键洞察：真正关心的是长度 len 的递增子序列结尾最小能是多少——维护 tails，结尾越小未来越容易接长。每个新元素二分找第一个大于等于它的位置替换，找不到就追加；tails 单调递增保证二分可行。类比：耐心排序发牌，堆数即答案。
【代码实现】
\`\`\`python
import bisect

def length_of_lis(nums: list[int]) -> int:
    tails: list[int] = []
    for x in nums:
        # 二分找第一个 >= x 的位置
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x  # 替换，保持结尾最小
    return len(tails)
# 时间 O(n log n)，空间 O(n)
\`\`\`
【实际应用】流水线无冲突调度、股价上涨波段分析、网络包乱序评估。面试官考察你是否知道 O(n log n) 优化，能否解释 tails 非真实 LIS 但长度相等。
【踩坑与变体】1) 二分相等分支写错会把严格递增做成非递减，要找第一个 >= x。2) tails 不是真实 LIS，输出序列需另记前驱指针。3) 变体：LeetCode 673 LIS 个数、354 俄罗斯套娃、1143 LCS 二维版。`,
    keyPoints: ["tails[i] 表示长度 i+1 的递增子序列的最小结尾，越小越有前途","tails 单调递增，每个元素二分定位替换或追加，O(n log n)","tails 的内容不是真实 LIS，但其长度与 LIS 长度相等","严格递增对应找第一个 >= x 的位置；非递减则找第一个 > x"],
    followUps: ["为什么 tails 数组一定是单调递增的，二分查找的前提怎么保证？","如果要求输出具体的最长递增子序列而不仅是长度，怎么改？"],
    favorited: false,
  },
  {
    id: "algo-322",
    nodeId: "p2-dp",
    question: "322. 零钱兑换（LeetCode 322）\n给定硬币面额和金额，求凑成该金额的最少硬币数。",
    answer: `【思路推导】暴力 DFS 枚举每种硬币用几枚，指数级且大量金额被重复求解。关键洞察：设 dp[i] 为凑金额 i 的最少硬币数，最后一枚面额 c 确定后归约为 i-c 的最优解加一，即 dp[i] = min(dp[i-c] + 1)，自底向上填表。这是完全背包求最小方案数的经典形态。类比：BFS 最短路径，每个金额是节点，每种硬币是一条边。
【代码实现】
\`\`\`python
def coin_change(coins: list[int], amount: int) -> int:
    INF = amount + 1  # 不可达哨兵，比任何合法答案都大
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return -1 if dp[amount] > amount else dp[amount]
# 时间 O(amount * n)，空间 O(amount)
\`\`\`
【实际应用】资源拼装：最少规格容器装够容量、最少机型组合覆盖算力、最少 SKU 凑单。面试官考察哨兵设计及与 BFS 最短路径的等价性。
【踩坑与变体】1) 哨兵用 Infinity 会被 dp[i-c]+1 污染，用 amount+1 最安全。2) 忘返回 -1 的不可达判断。3) 本题求 min 与硬币顺序无关，这点与 518 截然不同。4) 变体：LeetCode 518 组合数、279 完全平方数；贪心仅特定币制成立，反例 [1,3,4] 凑 6。`,
    keyPoints: ["状态 dp[i]=凑金额 i 的最少硬币数，转移 dp[i]=min(dp[i-c]+1)","哨兵取 amount+1：任何合法答案都不超过 amount，判不可达最稳","等价于 BFS 最短路径：金额是节点，硬币是边","贪心对一般币制不成立（[1,3,4] 凑 6 反例），必须 DP"],
    followUps: ["为什么这道题内外层循环顺序无所谓，而求组合数的 518 题却必须外层硬币？","如果每种硬币只能使用一次，问题变成什么，怎么改？（0-1 背包）"],
    favorited: false,
  },
  {
    id: "algo-518",
    nodeId: "p2-dp",
    question: "518. 零钱兑换 II（LeetCode 518）\n给定硬币面额和金额，求凑成该金额的组合数。",
    answer: `【思路推导】求组合数而非最优解。若对金额 DP 并枚举所有硬币，[1,2] 和 [2,1] 会重复计数。关键洞察：把按硬币种类分阶段作为循环结构——外层硬币、内层金额，第 k 轮只决定第 k 种硬币用几枚，每种组合被唯一生成一次，与顺序无关。这是完全背包求方案数的标准写法。类比：配料一种一种加，而非一勺一勺尝，配方计数不重不漏。
【代码实现】
\`\`\`python
def change(amount: int, coins: list[int]) -> int:
    dp = [0] * (amount + 1)
    dp[0] = 1  # 凑 0 元有一种方案：什么都不选
    for c in coins:  # 外层硬币：按种类分阶段
        for i in range(c, amount + 1):
            dp[i] += dp[i - c]  # 累加用上一枚 c 的方案数
    return dp[amount]
# 时间 O(amount * n)，空间 O(amount)
\`\`\`
【实际应用】预算按固定面额代金券拆分方案数、灰度发布按批次组合的 rollout 统计、权限包组合枚举。面试官最想看你是否理解外层硬币与外层金额的本质区别——前者计组合后者计排列，这是本题灵魂。
【踩坑与变体】1) 内外层写反会把组合算成排列，最高频错误。2) dp[0]=1 忘记则全表恒 0。3) 大 amount 结果可能溢出。4) 变体：排列数即外层金额（LeetCode 377）；每种限用一次即 0-1 背包，内层逆序；LeetCode 39 输出全部方案用回溯。`,
    keyPoints: ["外层硬币、内层金额：按种类分阶段，每种组合只生成一次","dp[0]=1 是计数 DP 的锚点，忘记则全表为 0","内外层互换就从组合数变排列数，两者模型完全不同","完全背包求方案数模板：dp[i] += dp[i-c]，金额正序"],
    followUps: ["为什么外层遍历硬币就能避免 [1,2] 和 [2,1] 的重复计数？","如果题目要求把每种具体组合都输出，而不只是数量，怎么做？（LeetCode 39）"],
    favorited: false,
  },
  {
    id: "algo-139",
    nodeId: "p2-dp",
    question: "139. 单词拆分（LeetCode 139）\n判断字符串能否被字典中的单词拼接而成。",
    answer: `【思路推导】暴力回溯枚举切分点组合，指数级且前缀被重复判断。关键洞察：设 dp[i] 表示前 i 个字符能否拆分，若存在切分点 j 使 dp[j] 为真且 s[j..i-1] 在字典中，则 dp[i] 为真。重叠子问题被记忆。类比：拼火车——前 j 节能拼好，新车厢在名录里，前 i 节就能拼好。
【代码实现】
\`\`\`python
def word_break(s: str, word_dict: list[str]) -> bool:
    word_set = set(word_dict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True  # 空前缀天然可拆
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break  # 找到一种即可
    return dp[n]
# 时间 O(n² * L)，L 为子串哈希成本；空间 O(n)
\`\`\`
【实际应用】分词系统是核心应用：中文 NLP 词典分词、URL 切分、输入法整句候选。面试官考察前缀 DP 建模，及用最长词限制内层枚举或 Trie 剪枝的敏感度。
【踩坑与变体】1) dp[0] 忘设 true 全表 false，最高频错误。2) slice(j, i) 边界 off-by-one。3) 找到一种即 break 提速。4) 变体：LeetCode 140 输出所有句子（回溯剪枝）、472 连接词；大字典用 Trie 流式扫描。`,
    keyPoints: ["前缀 DP：dp[i]=前 i 字符能否拆分，枚举最后一段 s[j..i-1]","dp[0]=true 是一切合法拆分的出发点，必设","哈希集合把字典查询降到 O(L)，按最长词长度裁剪内层枚举","判定题找到一种即可 break；输出全部方案要退回回溯"],
    followUps: ["如果要返回所有可能的拆分句子而不是只判断能否拆分，怎么改？（LeetCode 140）","字典很大时子串哈希查询成为瓶颈，用 Trie 怎么优化？"],
    favorited: false,
  },
  {
    id: "algo-152",
    nodeId: "p2-dp",
    question: "152. 乘积最大子数组（LeetCode 152）\n找乘积最大的连续子数组。",
    answer: `【思路推导】Kadane 不能直接套：乘积里负数会翻转大小关系，当前最小值乘负数可能变最大。暴力 O(n²)。关键洞察：以 i 结尾的最大乘积只来自三个候选——nums[i] 自己（重启）、上一段最大乘积乘它、上一段最小乘积乘它（负负得正）。所以同时维护 maxP 与 minP 两条链，遇负数交换角色。类比：炒股同时盯最高和最低估值，利空一来多空互换。
【代码实现】
\`\`\`python
def max_product(nums: list[int]) -> int:
    max_p = min_p = res = nums[0]
    for i in range(1, len(nums)):
        x = nums[i]
        if x < 0:  # 负数翻转：最大变最小
            max_p, min_p = min_p, max_p
        max_p = max(x, max_p * x)
        min_p = min(x, min_p * x)
        res = max(res, max_p)
    return res
# 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】收益率连乘最大区间、信号增益峰值检测、风控连续亏损评估。面试官考察能否发现符号翻转性质，及为何必须追踪最小值——只维护最大值会丢负负得正，如 [2,-5,-2]。
【踩坑与变体】1) 只维护 maxP，两负数相连必漏解。2) 交换时不用临时变量会相互污染。3) max(x, maxP*x) 已内建遇 0 重启，无需特判。4) 变体：LeetCode 53 最大子数组和、LeetCode 918 环形版本；要返回子数组本身需额外记录起点下标。`,
    keyPoints: ["乘积问题必须同时维护以 i 结尾的最大积 maxP 与最小积 minP","负数会翻转大小关系：遇负交换 maxP/minP，负负得正","maxP = max(x, maxP*x) 内建重启逻辑，遇 0 自动归零重来","O(n) 时间 O(1) 空间，是 Kadane 思想在乘法域的推广"],
    followUps: ["为什么加法版本（LeetCode 53）只需要维护一个值，乘法版本却要维护两个？","如果要求返回乘积最大的那个子数组本身而不只是乘积值，怎么改？"],
    favorited: false,
  },
  {
    id: "algo-416",
    nodeId: "p2-dp",
    question: "416. 分割等和子集（LeetCode 416）\n判断数组能否分成两个和相等的子集。",
    answer: `【思路推导】暴力枚举所有子集找和为 sum/2 的，O(2^n)。关键洞察是两次转化：两子集和相等，当且仅当存在子集和为 sum/2；于是变 0-1 背包可行性——dp[j] 表示能否恰好凑出 j。每个数只能用一次，内层必须逆序防止同轮重复选用。类比：往容量 sum/2 的背包里装物品，每种一件，问能否恰好装满。
【代码实现】
\`\`\`python
def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 != 0:
        return False  # 奇数直接不可能
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for x in nums:
        for j in range(target, x - 1, -1):  # 逆序：每个数只能用一次
            dp[j] = dp[j] or dp[j - x]
    return dp[target]
# 时间 O(n * target)，空间 O(target)
\`\`\`
【实际应用】任务均衡分到两台机器、数据集均分、账期对账拆分。这是 NP 完全问题的伪多项式解法，target 不大时工程可用。面试官考察你能否独立完成转化链。
【踩坑与变体】1) 内层正序会把 0-1 背包写成完全背包，同数重复选。2) 忘判 sum 奇数早退。3) 布尔数组只表可行性，求方案数要换计数。4) 变体：LeetCode 698 分 K 个等和子集、494 目标和、1049 最后一块石头 II。`,
    keyPoints: ["两次转化：分割等和 -> 存在子集和为 sum/2 -> 0-1 背包可行性","0-1 背包内层逆序遍历，防止同一物品同轮重复选用","sum 为奇数直接返回 false，最早剪枝","伪多项式复杂度 O(n*sum/2)，sum 大时该解法失效"],
    followUps: ["为什么 0-1 背包要逆序遍历而完全背包要正序，本质区别是什么？","如果要分成 K 个和相等的子集，还能用背包吗？（LeetCode 698）"],
    favorited: false,
  },
  {
    id: "algo-1143",
    nodeId: "p2-dp",
    question: "1143. 最长公共子序列（LeetCode 1143）\n返回两个字符串的最长公共子序列长度。",
    answer: `【思路推导】暴力枚举子序列，O(2^m * n)。关键洞察：比较两串末尾——相等则锁定它，缩为两前缀 LCS 加一；不等则取丢 text1 或 text2 末尾的较大值。dp[i][j] 只依赖左、上、左上，自底向上填表。
【代码实现】
\`\`\`python
def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # 末尾相等，锁定
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # 丢一边
    return dp[m][n]
# 时间 O(mn)，空间 O(mn)（可滚动压缩）
\`\`\`
【实际应用】diff 工具核心：git diff、版本比对；DNA 序列比对同源。面试官考察二维 DP 状态定义与下标处理。
【踩坑与变体】1) dp 下标与字符串差一，text1[i-1] 对应 dp[i] 行。2) 变体：LeetCode 72 编辑距离、718 最长公共子串（连续，不等归零）；输出 LCS 需回溯。`,
    keyPoints: ["状态 dp[i][j]=text1 前 i 字符与 text2 前 j 字符的 LCS 长度","末尾相等取左上+1，不等取上与左的 max","dp 下标比字符串下标多 1，第 0 行第 0 列是空串基例","滚动数组可省空间，但回溯输出 LCS 需要完整表或 Hirschberg"],
    followUps: ["最长公共子序列和最长公共子串（LeetCode 718）的状态转移有什么不同？","git diff 是怎么基于 LCS 思想算出最小编辑脚本的？"],
    favorited: false,
  },
  {
    id: "algo-72",
    nodeId: "p2-dp",
    question: "72. 编辑距离（LeetCode 72）\n将 word1 转为 word2 的最少操作数（增删改）。",
    answer: `\`\`\`python
# 思路：二维 DP
# 时间 O(m·n)，空间 O(m·n) 可优化
# 关键：相等则不变，不等取增删改最小+1

def min_distance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
\`\`\``,
    keyPoints: ["二维 DP", "三种操作：增/删/改", "相等无操作，不等取三方向最小+1"],
    followUps: ["只允许增删怎么改？", "只允许替换怎么改？"],
    favorited: false,
  },
  {
    id: "algo-64",
    nodeId: "p2-dp",
    question: "64. 最小路径和（LeetCode 64）\n从左上到右下的最小路径和，只能右移或下移。",
    answer: `【思路推导】暴力 DFS 枚举右下路径，总数 C(m+n-2, m-1) 指数级。关键洞察：到 (i,j) 的最后一步只能来自上方或左方，所以 dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])；第一行只能从左、第一列只能从上。子问题重叠且最优子结构成立，可原地修改省空间。类比：水流漫过网格，每格记录最低成本。
【代码实现】
\`\`\`python
def min_path_sum(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    for i in range(m):
        for j in range(n):
            if i == 0 and j == 0:
                continue
            if i == 0:
                grid[i][j] += grid[i][j - 1]               # 第一行只从左来
            elif j == 0:
                grid[i][j] += grid[i - 1][j]               # 第一列只从上来
            else:
                grid[i][j] += min(grid[i - 1][j], grid[i][j - 1])
    return grid[m - 1][n - 1]
# 时间 O(mn)，空间 O(1)（原地）
\`\`\`
【实际应用】游戏寻路成本场、机器人巡检能耗规划、图像 seam carving 裁剪缝。面试官考察边界处理与原地修改权衡。
【踩坑与变体】1) 边界漏处理会访问 -1 下标。2) 原地修改污染输入，工程上需先拷贝。3) 变体：LeetCode 62/63 不同路径、120 三角形路径和、174 地下城游戏。`,
    keyPoints: ["转移 dp[i][j]=grid[i][j]+min(上方, 左方)，方向限制保证无环可 DP","第一行与第一列是单来源边界，必须单独处理","原地修改做到 O(1) 空间，但要意识到污染输入的副作用","只能右下走的最短路是 DP；允许四方向走就得 Dijkstra"],
    followUps: ["如果格子里有障碍物不能通行，怎么改？（LeetCode 63）","如果允许上下左右四个方向移动，还能用 DP 吗，该换成什么算法？"],
    favorited: false,
  },
  {
    id: "algo-62",
    nodeId: "p2-dp",
    question: "62. 不同路径（LeetCode 62）\n从左上到右下的路径数，只能右移或下移。",
    answer: `【思路推导】暴力解是递归枚举所有走法：f(i,j) = f(i-1,j) + f(i,j-1)，但存在指数级重复计算，到达同一格子的路径数会被反复重算。关键洞察：到达 (i,j) 的路径数只取决于上方和左方两个格子，具备最优子结构且子问题重叠，正好递推。类比：棋盘上的人口流动，每格人数等于北边加西边流入之和。边界是第一行第一列，只能单方向到达，全为 1。也可用组合数一步算出 C(m+n-2, m-1)。
【代码实现】
\`\`\`python
def unique_paths(m: int, n: int) -> int:
    dp = [1] * n  # 滚动数组，第一行全 1
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] = dp[j] + dp[j - 1]  # 上方旧值 + 左方新值
    return dp[n - 1]
# 时间 O(m*n)，空间 O(n)；内层从左向右更新，dp[j-1] 已是本行新值
\`\`\`
【实际应用】路径计数用于 ECMP 等价路由条数估算、棋类 AI 局面枚举、机器人栅格地图可达性分析。面试官真正考察：能否从重叠子问题识别 DP、能否用滚动数组压缩状态、能否想到组合数公式体现数学功底。
【踩坑与变体】1) 忘记把第一行第一列初始化为 1 会得到全 0；2) LC 63 有障碍物：障碍格置 0，且初始化时障碍之后的格子也要置 0；3) LC 64 最小路径和：转移取 min 而非求和；4) 组合数公式要防溢出，边乘边除约分。`,
    keyPoints: ["状态定义 dp[i][j] 为到达 (i,j) 的路径数，转移 = 上方 + 左方","第一行第一列初始化全 1 是递推地基","滚动数组把空间从 O(mn) 压到 O(n)，内层必须从左向右更新","组合数公式 C(m+n-2, m-1) 一步出答案，注意边乘边除防溢出"],
    followUps: ["如果网格里有障碍物（LC 63），递推式和初始化分别要怎么改？","用组合数公式求解时，m、n 很大（比如 100）怎样避免阶乘溢出？"],
    favorited: false,
  },
  {
    id: "algo-5",
    nodeId: "p2-dp",
    question: "5. 最长回文子串（LeetCode 5）\n找字符串中最长的回文子串。",
    answer: `【思路推导】暴力解枚举全部 O(n^2) 个子串再逐个 O(n) 验证，共 O(n^3)。关键洞察：回文去掉首尾相同字符仍是回文，能从中心向两边长出来；每个回文子串都有唯一中心，枚举 2n-1 个中心（字符本身和间隙）向外扩展，不重不漏。类比：水波纹从圆心扩散，遇不对称即停。
【代码实现】
\`\`\`python
def longest_palindrome(s: str) -> str:
    start = 0
    max_len = 1

    def expand(l: int, r: int) -> None:
        nonlocal start, max_len
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        # 停后回文区间是 [l+1, r-1]
        if r - l - 1 > max_len:
            max_len = r - l - 1
            start = l + 1

    for i in range(len(s)):
        expand(i, i)      # 奇数长度中心
        expand(i, i + 1)  # 偶数长度中心
    return s[start:start + max_len]
# 时间 O(n^2)，空间 O(1)
\`\`\`
【实际应用】回文检测用于生物信息学 DNA 回文序列（酶切位点）识别。面试官考察：能否发现子结构降次；Manacher 追问考察用已算半径对称复用压到线性。
【踩坑与变体】1) 漏偶数中心会把 bb 错答成 b；2) 停止后长度是 r-l-1 不是 r-l+1；3) DP 解按区间长度升序填表；4) 变体 LC 516、LC 647。`,
    keyPoints: ["每个回文子串有唯一中心，枚举 2n-1 个中心不重不漏","奇偶两种中心 expand(i,i) 与 expand(i,i+1) 缺一不可","扩展停止时回文长度是 r-l-1，起点是 l+1","Manacher 用对称复用已算半径把复杂度降到 O(n)"],
    followUps: ["Manacher 算法是怎么利用对称性把复杂度降到 O(n) 的？","如果改成求最长回文子序列（LC 516），为什么中心扩展会失效、必须用区间 DP？"],
    favorited: false,
  },
  {
    id: "algo-647",
    nodeId: "p2-dp",
    question: "647. 回文子串（LeetCode 647）\n计算字符串中回文子串的个数。",
    answer: `【思路推导】暴力枚举 O(n^2) 个子串各花 O(n) 验证是 O(n^3)。关键洞察与 LC 5 同源：每个回文子串有唯一中心，枚举 2n-1 个中心向外扩展，每扩出一圈就是一个新回文，计数即可，连存储都省。类比：数涟漪圈数，每个中心能扩几圈就贡献几个。也可用区间 DP：dp[i][j]=dp[i+1][j-1] 且 s[i]==s[j]，按长度升序填表统计 true。
【代码实现】
\`\`\`python
def count_substrings(s: str) -> int:
    count = 0

    def expand(l: int, r: int) -> None:
        nonlocal count
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1  # 每扩出一圈就是一个新回文
            l -= 1
            r += 1

    for i in range(len(s)):
        expand(i, i)      # 奇数中心
        expand(i, i + 1)  # 偶数中心
    return count
# 时间 O(n^2)，空间 O(1)
\`\`\`
【实际应用】子串模式计数用于日志高频模式挖掘、基因序列重复片段统计。面试官考察：能否看出与 LC 5 同构（一套模板两道题），以及区间 DP 的状态定义和填表顺序。
【踩坑与变体】1) 漏偶数中心会少算 aa 类；2) 按位置计数不去重，aaa 答案是 6，用 Set 去重就错；3) DP 解法 i 倒序 j 正序，否则子问题未先算；4) 变体 LC 5、LC 516、LC 131。`,
    keyPoints: ["与 LC 5 同模板：中心扩展，每扩一圈计数加一","按位置计数不去重，aaa 的答案是 6","DP 定义 dp[i][j] 表示 s[i..j] 是否回文，按区间长度升序填表","奇偶两种中心都要枚举，漏一种答案减半"],
    followUps: ["用 DP 解这题时，为什么必须按区间长度升序（或 i 倒序 j 正序）遍历？","如果要求不同内容的回文子串个数（按字符串值去重），思路要怎么变？"],
    favorited: false,
  },
  {
    id: "algo-121",
    nodeId: "p2-dp",
    question: "121. 买卖股票 I（LeetCode 121）\n买卖一次股票的最大利润。",
    answer: `【思路推导】暴力枚举所有买卖日对取最大差价，O(n^2)。关键洞察：固定卖出日，最优买入日一定是它左侧价格最低的那天——于是维护历史最低价一遍扫描，每天用当前价减最低价得到当天卖出的最优利润，全局取最大。类比：站在每一天回头看，只需记住最便宜的进货日。为什么成立：利润只依赖卖出点之前的最小值，这是在线算法，不预知未来。
【代码实现】
\`\`\`python
def max_profit(prices: list[int]) -> int:
    min_price = float("inf")  # 历史最低价
    profit = 0                # 允许不交易，答案不为负
    for p in prices:
        if p < min_price:
            min_price = p                          # 刷新买入点
        elif p - min_price > profit:
            profit = p - min_price                 # 今天卖出更优
    return profit
# 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】维护历史极值的模式用于监控告警基线计算、风控最低余额跟踪。面试官考察：把二维枚举降成一维扫描的压缩思维，以及推广到 hold/sold 状态机，为 LC 122/123/309/714 股票系列打底。
【踩坑与变体】1) profit 必须初始为 0 而非 -Infinity，一路下跌时应返回 0；2) 同一天不能先卖后买，更新顺序要想清楚；3) 变体 LC 122 无限次、LC 123 最多两次（四状态 DP）、LC 309 含冷冻期、LC 714 含手续费；4) 也可对差分数组跑 Kadane 最大子数组和。`,
    keyPoints: ["固定卖出日，最优买入日是其左侧最低价——一维扫描的核心","profit 初始为 0：允许不交易，答案不会为负","是在线算法：不预知未来，只维护历史信息","hold/sold 状态机视角可推广到整个股票系列"],
    followUps: ["如果要求同时输出具体的买入日和卖出日，代码要改哪里？","这题能看成最大子数组和（Kadane）的变体吗？怎么转化？"],
    favorited: false,
  },
  {
    id: "algo-122",
    nodeId: "p2-dp",
    question: "122. 买卖股票 II（LeetCode 122）\n允许多次买卖，求最大利润。",
    answer: `【思路推导】暴力枚举买卖子序列是指数级。关键洞察：无限次交易下，一段从 a 涨到 b 再涨到 c 的行情，(b-a)+(c-b) 恰好等于 c-a——上涨段可以拆成相邻日差价之和而不损失任何利润。所以只要今天比昨天贵就视作昨天买今天卖，累加所有正差价即全局最优。类比：收费站只在上坡路段收钱。也可用状态机 DP：hold 持股、sold 空仓两状态互相转移，框架更通用。
【代码实现】
\`\`\`python
def max_profit(prices: list[int]) -> int:
    profit = 0
    for i in range(1, len(prices)):
        diff = prices[i] - prices[i - 1]
        if diff > 0:
            profit += diff  # 每段上涨的差价都收入囊中
    return profit
# 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】吃掉所有正增量的思想用于储能低充高放的电价套利、CDN 流量调度、量化做市策略。面试官考察：能否用拆分等价性证明贪心正确，以及是否知道状态机 DP 这个更通用的框架——加约束后贪心会失效必须回到 DP。
【踩坑与变体】1) 不需要找谷底峰顶配对，相邻正差求和即可；2) 同一天卖出再买入是允许的，不算违规；3) LC 714 含手续费：贪心改为差价覆盖 fee 才交易，或直接状态机 DP；4) LC 123/188 限制交易次数必须上多维状态 DP，贪心不再适用。`,
    keyPoints: ["上涨段可拆成相邻差价之和，(b-a)+(c-b)=c-a，拆分不损失利润","贪心吃掉所有正差价即全局最优","同一天卖完再买是允许的","加手续费/冷冻期后贪心失效，回到 hold-sold 状态机 DP"],
    followUps: ["为什么加了手续费（LC 714）之后就不能简单累加所有上涨段了？","用状态机 DP 写这题，hold 和 sold 两个状态的转移方程分别是什么？"],
    favorited: false,
  },
  {
    id: "algo-188",
    nodeId: "p2-dp",
    question: "188. 买卖股票 IV（LeetCode 188）\n最多买卖 K 次的最大利润。",
    answer: `\`\`\`python
# 思路：状态机 DP，dp[i][k][0/1]
# 时间 O(n·k)，空间 O(n·k)
# 关键：buy/sell 状态转移

def max_profit4(k: int, prices: list[int]) -> int:
    n = len(prices)
    if n == 0 or k == 0:
        return 0
    if k >= n // 2:  # 退化为无限次
        profit = 0
        for i in range(1, n):
            if prices[i] > prices[i - 1]:
                profit += prices[i] - prices[i - 1]
        return profit
    # buy[k]=第 k 次持有，sell[k]=第 k 次不持有
    NEG = float("-inf")
    buy = [NEG] * (k + 1)
    sell = [0] * (k + 1)
    for p in prices:
        for j in range(1, k + 1):
            buy[j] = max(buy[j], sell[j - 1] - p)
            sell[j] = max(sell[j], buy[j] + p)
    return sell[k]
\`\`\``,
    keyPoints: ["状态机 DP", "dp[k][0/1]=第k次持有/不持有", "K>=n/2 退化为无限次"],
    followUps: ["含冷冻期怎么改？", "含手续费怎么改？"],
    favorited: false,
  },
  {
    id: "algo-32",
    nodeId: "p2-dp",
    question: "32. 最长有效括号（LeetCode 32）\n找最长的有效括号子串长度。",
    answer: `\`\`\`python
# 思路：DP，dp[i] = 以 i 结尾的最长有效括号
# 时间 O(n)，空间 O(n)
# 关键：...() 和 ...)) 两种情况

def longest_valid_parentheses(s: str) -> int:
    n = len(s)
    dp = [0] * n
    max_len = 0
    for i in range(1, n):
        if s[i] == ")":
            if s[i - 1] == "(":  # ...()
                dp[i] = 2
                if i >= 2:
                    dp[i] += dp[i - 2]
            elif i - dp[i - 1] - 1 >= 0 and s[i - dp[i - 1] - 1] == "(":  # ...))
                dp[i] = dp[i - 1] + 2
                if i - dp[i - 1] - 2 >= 0:
                    dp[i] += dp[i - dp[i - 1] - 2]
            max_len = max(max_len, dp[i])
    return max_len
\`\`\``,
    keyPoints: ["DP dp[i]=以i结尾的最长有效", "两种情况：()和))", "也可用栈"],
    followUps: ["用栈怎么解？", "O(1) 空间双向扫描怎么解？"],
    favorited: false,
  },
  {
    id: "algo-338",
    nodeId: "p2-dp",
    question: "338. 比特位计数（LeetCode 338）\n对 0~n 的每个数，求其二进制表示中 1 的个数。",
    answer: `【思路推导】暴力对每个数单独数 1 的个数，每次 O(32)，共 O(32n)。关键洞察：数与数之间有结构可复用——x 右移一位等于抹掉最低位，x 与 x>>1 的 1 的个数只差最低位那一位：dp[x] = dp[x>>1] + (x&1)，而 x>>1 更小一定先算过。类比：十进制中 12345 的位数等于 1234 的位数加一。另一视角：x&(x-1) 能消去最低位的 1，得 dp[x] = dp[x&(x-1)] + 1。本质是把位运算性质翻译成 DP 递推，批量推导代替逐个重算。
【代码实现】
\`\`\`python
def count_bits(n: int) -> list[int]:
    dp = [0] * (n + 1)
    for x in range(1, n + 1):
        dp[x] = dp[x >> 1] + (x & 1)  # 右移抹低位，补回最低位
    return dp
# 时间 O(n)，空间 O(n)（返回数组本身，额外空间 O(1)）
\`\`\`
【实际应用】popcount 是布隆过滤器位密度估计、Roaring Bitmap 基数统计、SIMD 优化（CPU 有 POPCNT 硬件指令）的核心操作。面试官考察：能否完成从逐个数位到批量递推的思维跃迁，以及对位运算性质的熟练度。
【踩坑与变体】1) 循环从 1 开始，dp[0]=0 是正确基准；2) JS 里 & 的优先级低于 +，写成 dp[x>>1] + x & 1 就错了，括号不能省；3) LC 191 单数 popcount 用 x&(x-1) 循环消位；4) 第三种写法按最高位分段 dp[x] = dp[x - 2^k] + 1，体现二进制分块理解。`,
    keyPoints: ["dp[x] = dp[x>>1] + (x&1)：右移抹低位，补回最低位","x&(x-1) 消去最低位的 1，得第二条递推 dp[x]=dp[x&(x-1)]+1","本质是子问题复用：批量递推代替逐个数位","JS 中 & 优先级低于 +，括号不能省"],
    followUps: ["dp[x] = dp[x&(x-1)] + 1 这个转移为什么成立？","如果只求一个数的 popcount（LC 191），怎么做最快？CPU 层面有什么硬件指令？"],
    favorited: false,
  },

  // ===== Phase 2：图论（11题）=====
  {
    id: "algo-200",
    nodeId: "p2-graph",
    question: "200. 岛屿数量（LeetCode 200）\n计算二维网格中岛屿数量。",
    answer: `\`\`\`python
# 思路：DFS/BFS 遍历，遇到 1 就标记整个连通区域
# 时间 O(m·n)，空间 O(m·n)
# 关键：访问过的 1 标记为 0

def num_islands(grid: list[list[str]]) -> int:
    m, n = len(grid), len(grid[0])
    count = 0

    def dfs(i: int, j: int) -> None:
        if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != "1":
            return
        grid[i][j] = "0"  # 原地标记
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)

    for i in range(m):
        for j in range(n):
            if grid[i][j] == "1":
                count += 1
                dfs(i, j)
    return count
\`\`\``,
    keyPoints: ["DFS 标记连通区域", "原地标记为 0", "也可 BFS"],
    followUps: ["岛屿最大面积怎么解？", "封闭岛屿怎么解？"],
    favorited: false,
  },
  {
    id: "algo-994",
    nodeId: "p2-graph",
    question: "994. 腐烂的橘子（LeetCode 994）\n多源 BFS，每分钟腐烂的橘子传染相邻新鲜橘子。",
    answer: `\`\`\`python
# 思路：多源 BFS，所有初始腐烂橘子同时入队
# 时间 O(m·n)，空间 O(m·n)
# 关键：多源 BFS = 超级源点

from collections import deque

def oranges_rotting(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    q: deque[tuple[int, int]] = deque()
    fresh = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 2:
                q.append((i, j))
            elif grid[i][j] == 1:
                fresh += 1
    if fresh == 0:
        return 0
    minutes = 0
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    while q:
        size = len(q)
        for _ in range(size):
            x, y = q.popleft()
            for dx, dy in dirs:
                nx, ny = x + dx, y + dy
                if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == 1:
                    grid[nx][ny] = 2
                    fresh -= 1
                    q.append((nx, ny))
        if q:
            minutes += 1
    return -1 if fresh > 0 else minutes
\`\`\``,
    keyPoints: ["多源 BFS", "所有腐烂橘子同时入队", "统计新鲜橘子数"],
    followUps: ["单源 BFS 怎么改？", "最短感染时间？"],
    favorited: false,
  },
  {
    id: "algo-207",
    nodeId: "p2-graph",
    question: "207. 课程表（LeetCode 207）\n判断能否完成所有课程（有向图无环）。",
    answer: `\`\`\`python
# 思路：拓扑排序，BFS 入度法
# 时间 O(V+E)，空间 O(V+E)
# 关键：入度为 0 的先入队，每出队减少后继入度

from collections import deque

def can_finish(n: int, prerequisites: list[list[int]]) -> bool:
    graph: list[list[int]] = [[] for _ in range(n)]
    indegree = [0] * n
    for p in prerequisites:
        graph[p[1]].append(p[0])
        indegree[p[0]] += 1
    q = deque(i for i in range(n) if indegree[i] == 0)
    count = 0
    while q:
        node = q.popleft()
        count += 1
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return count == n
\`\`\``,
    keyPoints: ["拓扑排序 BFS", "入度为 0 先入队", "count==n 说明无环"],
    followUps: ["输出拓扑序怎么解？", "DFS 检测环怎么写？"],
    favorited: false,
  },
  {
    id: "algo-210",
    nodeId: "p2-graph",
    question: "210. 课程表 II（LeetCode 210）\n返回一个合法的课程学习顺序。",
    answer: `\`\`\`python
# 思路：拓扑排序 BFS，记录出队顺序
# 时间 O(V+E)，空间 O(V+E)
# 关键：同 207，但记录顺序

from collections import deque

def find_order(n: int, prerequisites: list[list[int]]) -> list[int]:
    graph: list[list[int]] = [[] for _ in range(n)]
    indegree = [0] * n
    for p in prerequisites:
        graph[p[1]].append(p[0])
        indegree[p[0]] += 1
    q = deque(i for i in range(n) if indegree[i] == 0)
    res: list[int] = []
    while q:
        node = q.popleft()
        res.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return res if len(res) == n else []
\`\`\``,
    keyPoints: ["拓扑排序 BFS", "记录出队顺序", "不等于 n 返回空"],
    followUps: ["所有拓扑序怎么解？", "DFS 怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-208",
    nodeId: "p2-graph",
    question: "208. Trie 实现（LeetCode 208）\n实现前缀树的 insert/search/startsWith。",
    answer: `\`\`\`python
# 思路：每个节点 26 个子节点 + is_end 标记
# 时间 O(L) 每操作，空间 O(总字符数×26)
# 关键：共享前缀，is_end 区分单词和前缀

class Trie:
    def __init__(self) -> None:
        self.children: list["Trie | None"] = [None] * 26
        self.is_end: bool = False

    def insert(self, word: str) -> None:
        node = self
        for ch in word:
            idx = ord(ch) - ord("a")
            if node.children[idx] is None:
                node.children[idx] = Trie()
            node = node.children[idx]  # type: ignore[assignment]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._search_prefix(word)
        return node is not None and node.is_end

    def starts_with(self, prefix: str) -> bool:
        return self._search_prefix(prefix) is not None

    def _search_prefix(self, s: str) -> "Trie | None":
        node = self
        for ch in s:
            idx = ord(ch) - ord("a")
            if node.children[idx] is None:
                return None
            node = node.children[idx]  # type: ignore[assignment]
        return node
\`\`\``,
    keyPoints: ["26 叉树", "isEnd 标记单词结束", "共享前缀"],
    followUps: ["如何删除单词？", "压缩前缀树怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-130",
    nodeId: "p2-graph",
    question: "130. 被围绕的区域（LeetCode 130）\n将被围绕的 O 翻转为 X，边界 O 及其连通的 O 保留。",
    answer: `\`\`\`python
# 思路：从边界 O DFS 标记，未被标记的 O 翻转
# 时间 O(m·n)，空间 O(m·n)
# 关键：边界 O 先标记为临时字符

def solve(board: list[list[str]]) -> None:
    m, n = len(board), len(board[0])

    def dfs(i: int, j: int) -> None:
        if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != "O":
            return
        board[i][j] = "#"  # 临时标记
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)

    for i in range(m):
        dfs(i, 0)
        dfs(i, n - 1)
    for j in range(n):
        dfs(0, j)
        dfs(m - 1, j)
    for i in range(m):
        for j in range(n):
            if board[i][j] == "O":
                board[i][j] = "X"
            elif board[i][j] == "#":
                board[i][j] = "O"
\`\`\``,
    keyPoints: ["从边界 DFS 标记", "临时标记 #", "未标记的 O 翻转"],
    followUps: ["BFS 怎么解？", "并查集怎么解？"],
    favorited: false,
  },
  {
    id: "algo-133",
    nodeId: "p2-graph",
    question: "133. 克隆图（LeetCode 133）\n深拷贝无向连通图。",
    answer: `\`\`\`python
# 思路：DFS/BFS + 哈希表记录已克隆
# 时间 O(V+E)，空间 O(V)
# 关键：哈希表防重复克隆

class Node:
    def __init__(self, val: int = 0, neighbors: list["Node"] | None = None) -> None:
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def clone_graph(node: "Node | None") -> "Node | None":
    if node is None:
        return None
    visited: dict["Node", "Node"] = {}

    def dfs(n: "Node") -> "Node":
        if n in visited:
            return visited[n]
        clone = Node(n.val)
        visited[n] = clone
        for neighbor in n.neighbors:
            clone.neighbors.append(dfs(neighbor))
        return clone

    return dfs(node)
\`\`\``,
    keyPoints: ["DFS/BFS + 哈希表", "哈希表防重复", "先建节点再加入邻居"],
    followUps: ["BFS 怎么实现？", "有环怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-417",
    nodeId: "p2-graph",
    question: "417. 太平洋大西洋水流（LeetCode 417）\n找能同时流向太平洋和大西洋的格子。",
    answer: `\`\`\`python
# 思路：从两个大洋分别 DFS 逆流标记
# 时间 O(m·n)，空间 O(m·n)
# 关键：从边界逆流向上标记

def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    m, n = len(heights), len(heights[0])
    pacific = [[False] * n for _ in range(m)]
    atlantic = [[False] * n for _ in range(m)]

    def dfs(i: int, j: int, visited: list[list[bool]]) -> None:
        visited[i][j] = True
        for di, dj in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ni, nj = i + di, j + dj
            if (
                0 <= ni < m
                and 0 <= nj < n
                and not visited[ni][nj]
                and heights[ni][nj] >= heights[i][j]
            ):
                dfs(ni, nj, visited)

    for i in range(m):
        dfs(i, 0, pacific)
        dfs(i, n - 1, atlantic)
    for j in range(n):
        dfs(0, j, pacific)
        dfs(m - 1, j, atlantic)
    res: list[list[int]] = []
    for i in range(m):
        for j in range(n):
            if pacific[i][j] and atlantic[i][j]:
                res.append([i, j])
    return res
\`\`\``,
    keyPoints: ["从边界逆流 DFS", "两个标记数组", "两个都能到达的即为答案"],
    followUps: ["BFS 怎么解？", "如果水流可以斜着流呢？"],
    favorited: false,
  },
  {
    id: "algo-684",
    nodeId: "p2-graph",
    question: "684. 冗余连接（LeetCode 684）\n在树中多加了一条边，找那条冗余边。",
    answer: `\`\`\`python
# 思路：并查集，第一条使两端已连通的边即为答案
# 时间 O(n·α(n))，空间 O(n)
# 关键：并查集检测环

def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    parent = list(range(len(edges) + 1))

    def find(x: int) -> int:
        if parent[x] != x:
            parent[x] = find(parent[x])  # 路径压缩
        return parent[x]

    def union(x: int, y: int) -> bool:
        px, py = find(x), find(y)
        if px == py:
            return False  # 已连通，这条边成环
        parent[px] = py
        return True

    for e in edges:
        if not union(e[0], e[1]):
            return e
    return []
\`\`\``,
    keyPoints: ["并查集", "第一条成环的边", "路径压缩优化"],
    followUps: ["有向图的冗余边怎么解？", "多条冗余边返回最后一条？"],
    favorited: false,
  },
  {
    id: "algo-787",
    nodeId: "p2-graph",
    question: "787. K 站中转内最便宜航班（LeetCode 787）\n找最多 K 中转的最便宜航班价格。",
    answer: `\`\`\`python
# 思路：Bellman-Ford 变体，限制 K+1 轮松弛
# 时间 O(K·E)，空间 O(n)
# 关键：每轮用上一轮的结果松弛

def find_cheapest_price(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
    INF = float("inf")
    prices = [INF] * n
    prices[src] = 0
    for _ in range(k + 1):
        tmp = prices[:]  # 用上一轮结果松弛
        for f in flights:
            frm, to, price = f[0], f[1], f[2]
            if prices[frm] != INF and prices[frm] + price < tmp[to]:
                tmp[to] = prices[frm] + price
        prices = tmp
    return -1 if prices[dst] == INF else int(prices[dst])
\`\`\``,
    keyPoints: ["Bellman-Ford 变体", "K+1 轮松弛", "用上一轮结果防止超步"],
    followUps: ["Dijkstra 怎么解？", "如果允许负权呢？"],
    favorited: false,
  },
  {
    id: "algo-743",
    nodeId: "p2-graph",
    question: "743. 网络延迟时间（LeetCode 743）\n信号从节点 k 出发沿有向边传播，求所有节点收到信号的最早时间。",
    answer: `\`\`\`python
# 思路：Dijkstra 最短路——求 k 到所有点的最短距离，答案为其中的最大值
# 时间 O(E log V)，空间 O(V+E)
# 关键：小顶堆按距离弹出，节点首次弹出时距离即最短（边权非负）

import heapq

def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    graph: list[list[tuple[int, int]]] = [[] for _ in range(n + 1)]  # 邻接表：[(终点, 权重)]
    for u, v, w in times:
        graph[u].append((v, w))
    dist: list[int] = [-1] * (n + 1)  # -1 = 未确定
    h: list[tuple[int, int]] = [(0, k)]  # 小顶堆元素：(距离, 节点)
    while h:
        d, u = heapq.heappop(h)
        if dist[u] != -1:
            continue  # 已有更短路径，跳过
        dist[u] = d
        for v, w in graph[u]:
            if dist[v] == -1:
                heapq.heappush(h, (d + w, v))
    res = 0
    for i in range(1, n + 1):
        if dist[i] == -1:
            return -1  # 存在不可达节点
        if dist[i] > res:
            res = dist[i]
    return res
\`\`\``,
    keyPoints: ["Dijkstra + 小顶堆", "首次弹出即最短路", "答案为各点最短距离的最大值"],
    followUps: ["Bellman-Ford 怎么写（LC 787）？", "为什么弹出的点无需再更新？"],
    favorited: false,
  },

  // ===== Phase 2：堆与优先队列（4题，跳过重题）=====
  {
    id: "algo-295",
    nodeId: "p2-heap",
    question: "295. 数据流的中位数（LeetCode 295）\n动态添加数字并 O(1) 获取中位数。",
    answer: `\`\`\`python
# 思路：大顶堆存左半 + 小顶堆存右半，平衡两堆大小
# 时间 add_num O(logn)，find_median O(1)
# 关键：两堆大小差<=1，大顶堆顶<=小顶堆顶

import heapq

class MedianFinder:
    def __init__(self) -> None:
        # Python heapq 是小顶堆；左半用负数模拟大顶堆
        self.max_heap: list[int] = []  # 左半（较小）
        self.min_heap: list[int] = []  # 右半（较大）

    def add_num(self, num: int) -> None:
        heapq.heappush(self.max_heap, -num)
        heapq.heappush(self.min_heap, -heapq.heappop(self.max_heap))
        if len(self.min_heap) > len(self.max_heap):
            heapq.heappush(self.max_heap, -heapq.heappop(self.min_heap))

    def find_median(self) -> float:
        if len(self.max_heap) > len(self.min_heap):
            return float(-self.max_heap[0])
        return (-self.max_heap[0] + self.min_heap[0]) / 2
\`\`\``,
    keyPoints: ["双堆：大顶堆+小顶堆", "平衡两堆大小", "大顶堆可多一个"],
    followUps: ["用排序怎么解？时间复杂度？", "数据量很大怎么办？"],
    favorited: false,
  },
  {
    id: "algo-703",
    nodeId: "p2-heap",
    question: "703. 数据流中第 K 大元素（LeetCode 703）\n动态添加数字并返回第 K 大。",
    answer: `【思路推导】暴力每次 add 全量排序取第 K 个，O(n log n)。关键洞察：只关心前 K 大的门槛，其余是噪声——只保留最大的 K 个，其中最小者（小顶堆堆顶）即第 K 大；进不了前 K 就丢弃。类比：K 个 VIP 位，更大牌的来了就把最小牌的请出去。
【代码实现】
\`\`\`python
class KthLargest:
    def __init__(self, k: int, nums: list[int]) -> None:
        self.k = k
        self.top: list[int] = []  # 升序保存前 K 大
        for x in nums:
            self.add(x)

    def add(self, v: int) -> int:
        import bisect
        # 二分找插入位
        i = bisect.bisect_left(self.top, v)
        self.top.insert(i, v)  # top 升序保存前 K 大
        if len(self.top) > self.k:
            self.top.pop(0)  # 超编丢最小
        return self.top[0]
# add 时间 O(k)（手写堆可优化到 O(log k)），空间 O(k)
\`\`\`
【实际应用】实时排行榜、最慢 K 查询监控、限流 TopK 大 IP。考察 TopK 选型（堆/快速选择/平衡树）与流式状态压缩。
【踩坑与变体】1) 初始 nums 可能不足 K 个；2) 方向反成保留最小的 K 个全错；3) LC 215 用快速选择平均 O(n)；4) LC 295 中位数用双堆。`,
    keyPoints: ["只保留前 K 大，门槛值（小顶堆堆顶）即第 K 大","新元素进不了前 K 直接丢弃，状态只留必要信息","初始化 nums 不足 K 个时不能假设已装满","静态数组第 K 大用快速选择平均 O(n)（LC 215），流式场景用堆"],
    followUps: ["为什么用小顶堆而不是大顶堆？换成求第 K 小呢？","如果数据流里的元素会过期失效，堆要怎么改造？"],
    favorited: false,
  },
  {
    id: "algo-373",
    nodeId: "p2-heap",
    question: "373. 查找和最小的 K 对数字（LeetCode 373）\n从两个有序数组中找和最小的 K 对数字。",
    answer: `\`\`\`python
# 思路：小顶堆，按和从小弹出
# 时间 O(K·logK)，空间 O(K)
# 关键：先入第一列，弹出一个再入同行下一个

import heapq

def k_smallest_pairs(nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
    if not nums1 or not nums2:
        return []
    h: list[tuple[int, int, int]] = []  # (和, i, j)
    for i in range(min(len(nums1), k)):
        heapq.heappush(h, (nums1[i] + nums2[0], i, 0))
    res: list[list[int]] = []
    while h and len(res) < k:
        _, i, j = heapq.heappop(h)
        res.append([nums1[i], nums2[j]])
        if j + 1 < len(nums2):
            heapq.heappush(h, (nums1[i] + nums2[j + 1], i, j + 1))
    return res
\`\`\``,
    keyPoints: ["小顶堆", "先入第一列", "弹出后入同行下一个"],
    followUps: ["暴力法时间复杂度？", "二分怎么解？"],
    favorited: false,
  },
  {
    id: "algo-502",
    nodeId: "p2-heap",
    question: "502. IPO（LeetCode 502）\n初始资本 w，最多做 k 个项目，每个有资本和利润，求最终最大资本。",
    answer: `\`\`\`python
# 思路：按资本排序 + 大顶堆选利润最大
# 时间 O(n·logn)，空间 O(n)
# 关键：每次选资本允许范围内利润最大的

import heapq

def find_maximized_capital(k: int, w: int, profits: list[int], capital: list[int]) -> int:
    n = len(profits)
    projects = sorted(zip(capital, profits))  # 按资本升序
    max_heap: list[int] = []  # Python 小顶堆存负值模拟大顶堆
    idx = 0
    for _ in range(k):
        while idx < n and projects[idx][0] <= w:
            heapq.heappush(max_heap, -projects[idx][1])  # 取负模拟大顶堆
            idx += 1
        if not max_heap:
            break
        w += -heapq.heappop(max_heap)
    return w
\`\`\``,
    keyPoints: ["按资本排序", "大顶堆选利润最大", "贪心选 k 次"],
    followUps: ["如果项目有依赖关系？", "如果不限制 k？"],
    favorited: false,
  },

  // ===== Phase 2：贪心（8题，跳过重题）=====
  {
    id: "algo-55",
    nodeId: "p2-greedy",
    question: "55. 跳跃游戏（LeetCode 55）\n判断能否跳到终点。",
    answer: `【思路推导】暴力 DFS/BFS 枚举所有跳法，指数级。关键洞察：不需要知道具体怎么跳，只需知道最远能到哪——扫描时维护 maxReach（当前可达的最远下标），每格用 i+nums[i] 刷新它；一旦扫描指针 i 超过 maxReach，说明前面所有位置合力也够不到 i，必败。类比：接力赛传棒，棒传不到的位置就是断点。贪心成立的原因：可达性只依赖最远边界，不依赖路径细节，能到更远绝不会更差（交换论证）。
【代码实现】
\`\`\`python
def can_jump(nums: list[int]) -> bool:
    max_reach = 0  # 最远可达下标
    for i in range(len(nums)):
        if i > max_reach:
            return False  # 断点：当前位置不可达
        max_reach = max(max_reach, i + nums[i])
        if max_reach >= len(nums) - 1:
            return True  # 已覆盖终点
    return True
# 时间 O(n)，空间 O(1)。
\`\`\`
【实际应用】最远可达边界的思想用于编译器基本块可达性分析、网络传播覆盖估算、内存分配器连续空闲块扫描。面试官考察：能否把路径搜索问题抽象成边界维护问题，以及对贪心正确性的论证能力。
【踩坑与变体】1) 循环条件若写成 i <= maxReach 要小心与 i < n 的配合，越界就错；2) 提前 return 是优化，但终点判断不能漏；3) LC 45 求最少跳数要加 curEnd 边界变量；4) LC 1306/1871 带障碍或特殊规则要回到 BFS/DP。`,
    keyPoints: ["只维护最远可达边界 maxReach，不关心具体路径","扫描指针 i 超过 maxReach 即为断点，必败","贪心正确性：可达范围更远绝不会更差（交换论证）","maxReach 覆盖终点可提前返回 true"],
    followUps: ["如果改成求最少跳跃次数（LC 45），为什么一个变量就不够了？","如果数组里允许负数（可以后退），问题会变成什么样？"],
    favorited: false,
  },
  {
    id: "algo-45",
    nodeId: "p2-greedy",
    question: "45. 跳跃游戏 II（LeetCode 45）\n求跳到终点的最少次数。",
    answer: `【思路推导】暴力 BFS 按层展开 O(n^2)。关键洞察：最少跳数本质是 BFS 层数——第 k 步能到的位置构成连续区间，区间内扫描可求出第 k+1 步的最远边界。用 curEnd（当前步右边界）和 maxReach（下一步最远点）隐式模拟 BFS：i 到达 curEnd 说明当前步选择耗尽，必须再跳一步，jumps++，curEnd 更新为 maxReach。类比：蛙跳接力，潜能攒到边界才结算。
【代码实现】
\`\`\`python
def jump(nums: list[int]) -> int:
    jumps = 0
    cur_end = 0
    max_reach = 0
    for i in range(len(nums) - 1):  # 注意不访问最后一个元素
        max_reach = max(max_reach, i + nums[i])
        if i == cur_end:  # 当前步边界耗尽，必须起跳
            jumps += 1
            cur_end = max_reach
    return jumps
# 时间 O(n)，空间 O(1)。
\`\`\`
【实际应用】分层贪心用于路由最少跳数（RIP 跳数限制）、任务最小批次划分。面试官考察：识别 BFS 层次结构并用 O(1) 空间隐式模拟，省掉显式队列。
【踩坑与变体】1) 循环必须止于 n-2，访问到最后一个元素且 i==curEnd 会多算一跳；2) 题目保证可达，若不保证需判 maxReach <= i 的死局返回 -1；3) 与 LC 55 的区别：55 只管可达性用一个变量，45 要计数用两个；4) 每跳代价不同则贪心失效，需 Dijkstra。`,
    keyPoints: ["最少跳数 = BFS 层数：第 k 步可达的是一个连续区间","curEnd 是当前步边界，maxReach 攒下一步的最远点","i 到达 curEnd 才结算一跳，贪心做延迟决策","循环到 n-2 为止：访问最后元素会多算一跳"],
    followUps: ["这题为什么可以不用显式 BFS 队列？隐式 BFS 省掉了什么？","如果题目不保证一定能到达终点，代码要在哪里加什么判断？"],
    favorited: false,
  },
  {
    id: "algo-763",
    nodeId: "p2-greedy",
    question: "763. 划分字母区间（LeetCode 763）\n将字符串划分为尽量多的片段，每个字母只出现在一个片段中。",
    answer: `【思路推导】暴力枚举切分方案是指数级。关键洞察：同一字母的所有出现必须落在同一片段——片段右边界至少是片段内每个字母最后出现位置的最大值。预处理 last[c] 记录各字母最后下标，扫描时维护 end = max(end, last[s[i]])；i == end 即封团，可切一刀。类比：包裹没到齐不能封箱；最早切割即得最多片段。
【代码实现】
\`\`\`python
def partition_labels(s: str) -> list[int]:
    last = [0] * 26
    for i, ch in enumerate(s):
        last[ord(ch) - 97] = i  # 97 即 a
    res: list[int] = []
    start = 0
    end = 0
    for i, ch in enumerate(s):
        end = max(end, last[ord(ch) - 97])  # 扩展封团边界
        if i == end:
            res.append(i - start + 1)  # 封团切割
            start = i + 1
    return res
# 时间 O(n)，空间 O(1)（字母表固定 26）。
\`\`\`
【实际应用】封团切割用于日志按会话切分（同 traceId 落同文件）、寄存器分配 live interval 划分。考察：把字母约束翻译成区间覆盖模型。
【踩坑与变体】1) last 存最后位置而非首次，写反全错；2) 切割条件 i == end；3) 求最少片段一刀切；4) 同族 LC 56、435。`,
    keyPoints: ["片段右边界 = 片段内所有字母最后出现位置的最大值","i == end 即封团，切割后 start 更新为 i+1","尽量多片段才用贪心；求最少片段则一刀切","本质是区间覆盖模型，与 LC 56 合并区间同族"],
    followUps: ["为什么要记录字母的最后出现位置，而不是第一次出现的位置？","这题和合并区间（LC 56）有什么内在联系？"],
    favorited: false,
  },
  {
    id: "algo-134",
    nodeId: "p2-greedy",
    question: "134. 加油站（LeetCode 134）\n找能跑完一圈的起始加油站。",
    answer: `【思路推导】暴力枚举每个起点模拟跑一圈，O(n^2)。洞察一：总油量小于总消耗必无解，否则解唯一。洞察二：从 start 出发若在 i 处油量变负，则 start 到 i 之间任何站都不能做起点——从中间站出发拿不到之前累积的正贡献，处境只会更差，直接从 i+1 重新起步。类比：链条断在最弱环，断点前的环节都不用再试。
【代码实现】
\`\`\`python
def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    total = 0
    tank = 0
    start = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff  # 全局可行性判据
        tank += diff   # 当前段净油量
        if tank < 0:
            start = i + 1  # 断点，从下一站重来
            tank = 0
    return -1 if total < 0 else start
# 时间 O(n)，空间 O(1)。
\`\`\`
【实际应用】累计净值断点重置用于环形缓冲区写点定位、一致性哈希环负载切入。面试官考察：能否证明中间站点都不如新起点（反证或归纳），这是贪心题里最需说理的一档。
【踩坑与变体】1) 忘查 total < 0 返回 -1，会在无解数据上给假答案；2) tank < 0 时 start 置 i+1 而非 i，i 本身已经跑不到；3) total >= 0 时 start 一定就是答案，无需再模拟验证；4) 若排成一行而非环形，问题退化为找前缀和最低点。`,
    keyPoints: ["total < 0 必无解，否则解存在且唯一","tank 变负说明起点到当前站之间任何站都不是答案","从断点下一站重新起步，一趟扫描定答案","贪心核心：从中间站出发拿不到之前累积的正贡献"],
    followUps: ["证明一下：为什么 start 到 i 之间的站点都不可能做起点？","如果加油站排成一行而不是环形，问题会有什么变化？"],
    favorited: false,
  },
  {
    id: "algo-406",
    nodeId: "p2-greedy",
    question: "406. 根据身高重建队列（LeetCode 406）\n每个人有身高 h 和前面有几个不低于他的人 k，重建队列。",
    answer: `【思路推导】暴力枚举所有排列再逐个验证 k 值，n! 不可行。关键洞察：高个子不受矮个子影响——矮个子插到高个子前面或后面，都不改变高个子前面不低于他的人数。于是按身高降序、同身高按 k 升序排序，依次把每个人插到结果的第 k 位：轮到他时，已插入的人都不比他矮，插到 k 位恰好满足约束；后续更矮的人再插队也不影响他。类比：合影先定高个子的站位，矮个子后加塞，高个子的相对次序纹丝不动。
【代码实现】
\`\`\`python
def reconstruct_queue(people: list[list[int]]) -> list[list[int]]:
    # 身高降序，k 升序
    people.sort(key=lambda p: (-p[0], p[1]))
    res: list[list[int]] = []
    for p in people:
        res.insert(p[1], p)  # 插到第 k 位
    return res
# 时间 O(n^2)（insert 搬移），空间 O(n)。
\`\`\`
【实际应用】先排支配维度再插入的技巧用于带权排行榜插入、数据库索引有序性维护、调度系统按优先级插队。面试官考察：能否发现一个维度的决策不被另一维度干扰（降维打击），以及排序加插入的组合模式——与 LC 315 数右侧更小元素（树状数组）是近亲。
【踩坑与变体】1) 同身高必须按 k 升序，否则后来者把前者的 k 语义挤乱；2) 数组插入 O(n)，总量 O(n^2)，追求 O(n log n) 可用树状数组按空位索引；3) 不能身高升序——矮个子先占位后，高个子插入会把 k 语义搞反；4) 变体 LC 315、LC 493 同为插入位置即排名的思想。`,
    keyPoints: ["身高降序 + k 升序排序，高个子先定位","矮个子插入不影响高个子的 k——这是降维的关键","轮到某人时已插入者都不比他矮，插到第 k 位即满足","数组 splice 是 O(n)，追求 O(n log n) 可用树状数组"],
    followUps: ["为什么同身高的人必须按 k 升序排？反了会出什么问题？","如果要求 O(n log n)，可以用什么数据结构替代数组插入？"],
    favorited: false,
  },
  {
    id: "algo-621",
    nodeId: "p2-greedy",
    question: "621. 任务调度器（LeetCode 621）\n相同任务间需间隔 n 个冷却，求最少时间。",
    answer: `\`\`\`python
# 思路：找出现次数最多的任务作为框架，插空填其他任务
# 时间 O(n)，空间 O(26)
# 公式推导：设最多任务出现 maxCount 次，把它排成 maxCount 行，每行占 n+1 个槽
# （1 个任务 + n 个冷却位）。前 maxCount-1 行共 (maxCount-1)*(n+1) 个槽；
# 最后一行只需放"次数同样为 maxCount"的任务，共 maxTasks 个（它们同排互不冲突）。
# 其余任务插入框架空槽即满足冷却；若任务总数超过框架槽数，说明槽可全填满
# 无需空闲，答案就是 len(tasks)。故取两者较大值。

def least_interval(tasks: list[str], n: int) -> int:
    cnt = [0] * 26
    max_count = 0
    for t in tasks:
        idx = ord(t) - ord('A')
        cnt[idx] += 1
        max_count = max(max_count, cnt[idx])
    max_tasks = sum(1 for c in cnt if c == max_count)
    return max(len(tasks), (max_count - 1) * (n + 1) + max_tasks)
\`\`\``,
    keyPoints: ["最多任务决定框架", "公式 (max-1)(n+1)+maxTasks", "与总任务数取大"],
    followUps: ["如果不同任务冷却不同？", "模拟怎么解？"],
    favorited: false,
  },
  {
    id: "algo-135",
    nodeId: "p2-greedy",
    question: "135. 分发糖果（LeetCode 135）\n每个孩子至少 1 颗糖，评分高的比相邻的多，求最少糖果数。",
    answer: `【思路推导】暴力枚举方案再校验是指数级。关键洞察：约束分两组——比左高则更多、比右高则更多，方向相反互不干扰，可分开求解再合并。左到右满足左向（递增则比左多 1，否则归 1）；右到左满足右向，取两次 max 即同时满足的最小方案。类比：装订书先左对齐再右对齐取较紧者。一次扫不行，左右约束会打架。
【代码实现】
\`\`\`python
def candy(ratings: list[int]) -> int:
    n = len(ratings)
    candies = [1] * n
    for i in range(1, n):  # 左到右：比左边高则比左边多 1
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    for i in range(n - 2, -1, -1):  # 右到左：比右边高则至少比右边多 1
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    return sum(candies)
# 时间 O(n)，空间 O(n)。
\`\`\`
【实际应用】双向约束分解用于分布式时钟校准、UI 布局约束求解（Cassowary）。面试官考察：识别约束可分向满足的结构，及取 max 合并的合理性证明。
【踩坑与变体】1) 右到左必须取 max，覆盖会破坏左向成果；2) 评分相等无约束，可同为 1；3) O(1) 空间用上升下降段求和，难写对；4) 环形需先断环，思路近 LC 134。`,
    keyPoints: ["两组方向相反的约束可分解：左向一遍、右向一遍","右到左时必须取 max，直接覆盖会破坏左向结果","评分相等无约束，糖果可同为 1","每方向各自最优，取 max 仍双向合法"],
    followUps: ["怎么用上升段/下降段长度求和把空间降到 O(1)？","如果孩子坐成一圈（首尾也相邻），算法要怎么改？"],
    favorited: false,
  },
  {
    id: "algo-435",
    nodeId: "p2-greedy",
    question: "435. 无重叠区间（LeetCode 435）\n给定区间集合，求最少移除多少区间可使剩余互不重叠。",
    answer: `【思路推导】暴力枚举子集是 2^n。关键洞察：经典调度模型——按右端点升序排序，优先保留右端点最早的区间，它给后面留的空间最大；扫描时当前区间起点不小于已保留右端点则保留并更新，否则重叠，移除当前区间（它右端点更大，移除它对后续最有利）。类比：会议室优先排最早结束的会。移除数 = 总数 - 最多保留数。
【代码实现】
\`\`\`python
def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    intervals.sort(key=lambda iv: iv[1])  # 右端点升序
    removed = 0
    end = float('-inf')
    for iv in intervals:
        if iv[0] >= end:
            end = iv[1]  # 不重叠：保留并更新占用边界
        else:
            removed += 1  # 重叠：移除右端点更大的当前区间
    return removed
# 时间 O(n log n)（排序主导），空间 O(log n)。
\`\`\`
【实际应用】区间调度是 OS 进程调度、会议室系统、广告排期的通用模型，YARN 的截止优先策略也源于此。面试官考察：排序键的选择理由，以及把最少移除转化为最多保留的转化能力。
【踩坑与变体】1) 按左端点排序是错的，反例 [1,10] [2,3] [3,4]：长区间挤掉多个短区间；2) 重叠时移除当前区间而非已保留者，因为当前区间右端点更大；3) 边界相接 [1,2] 与 [2,3] 不算重叠，条件是 >= 而非 >；4) 同族：LC 452 射箭爆气球、LC 56 合并区间、LC 253 会议室 II 用堆。`,
    keyPoints: ["按右端点升序排序，优先保留最早结束的区间","移除数 = 总数 - 最多保留的不重叠区间数","边界相接不算重叠，条件是 iv[0] >= end","交换论证：最优解第一个区间换成右端点最小者不会更差"],
    followUps: ["为什么按右端点排序而不是左端点或区间长度？给个反例。","LC 452 用最少数量的箭射气球，和这题的思路对应关系是什么？"],
    favorited: false,
  },

  // ===== Phase 2：高频面试题（23题，跳过重题）=====
  {
    id: "algo-53",
    nodeId: "p2-highfreq",
    question: "53. 最大子数组和（LeetCode 53）\n找连续子数组的最大和。",
    answer: `【思路推导】暴力解枚举所有子数组要 O(n²) 甚至 O(n³)。关键洞察：以 i 结尾的最大子数组和只有两种可能——把 nums[i] 接到前面的最优解之后，或前面累加和为负、不如从 nums[i] 重新开始。因为负前缀只会拉低总和，绝不可能是更优选择，这就是 Kadane 的贪心本质。类比记账：之前累计是亏的，不如今天另起炉灶。
【代码实现】
\`\`\`python
def max_sub_array(nums: list[int]) -> int:
    cur = nums[0]   # 以 i 结尾的最大和
    best = nums[0]  # 全局最大
    for i in range(1, len(nums)):
        cur = max(nums[i], cur + nums[i])  # 负前缀不如重启
        best = max(best, cur)
    return best
# 时间 O(n)，空间 O(1)。
\`\`\`
【实际应用】Kadane 用于流式数据的在线最值统计：监控系统找收益最高的连续时间窗、股票单次买卖最大收益（LeetCode 121 即其变形）。面试官考察能否从 DP 定义做状态压缩，以及全负数边界的处理。
【踩坑与变体】1) best 必须初始化为 nums[0] 而非 0，否则全负数数组返回错误的 0。2) 要求返回起止下标时，需在 cur 重启处记录 start。3) 变体：最大子数组乘积（LeetCode 152，需同时维护最小值，因负负得正）；环形最大子数组（LeetCode 918，分跨不跨中点）。4) 分治 O(n log n) 可回答能否并行的追问。`,
    keyPoints: ["以 i 结尾的最大和只取 max(nums[i], cur+nums[i])，负前缀必然被丢弃","best 初始化为 nums[0] 而非 0，否则全负数数组翻车","时间 O(n) 空间 O(1)，是 DP 状态压缩到单变量的经典范例","乘积版要同时维护最小值应对负负得正，环形版分跨不跨中点"],
    followUps: ["如果要求返回最大子数组的起止下标，代码要改哪里？","最大子数组乘积（LeetCode 152）为什么不能只维护一个最大值？"],
    favorited: false,
  },
  {
    id: "algo-234",
    nodeId: "p2-highfreq",
    question: "234. 回文链表（LeetCode 234）\n判断链表是否回文。",
    answer: `\`\`\`python
# 思路：快慢指针找中点，反转后半，比较
# 时间 O(n)，空间 O(1)
# 关键：找中点-反转-比较-（可选恢复）

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def is_palindrome(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    # 反转后半
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt
    # 比较
    while prev and head:
        if head.val != prev.val:
            return False
        head = head.next
        prev = prev.next
    return True
\`\`\``,
    keyPoints: ["快慢指针找中点", "反转后半部分", "O(1) 空间"],
    followUps: ["不修改链表怎么做？", "恢复链表怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-287",
    nodeId: "p2-highfreq",
    question: "287. 寻找重复数（LeetCode 287）\n数组 n+1 个数范围 1~n，找重复数。不修改数组 O(1) 空间。",
    answer: `【思路推导】排序要 O(n log n) 且修改数组，哈希表要 O(n) 空间，都被题目禁止。关键洞察：把 nums[i] 看作从下标 i 跳到下标 nums[i] 的指针，n+1 个数落在 1~n 且有重复，意味着至少两个下标指向同一后继——这等价于链表有环，重复数就是环入口。用 Floyd 判圈：快慢指针先相遇，再把一个指针放回起点同速前进，再相遇即环入口。类比操场套圈：快者必追上慢者。
【代码实现】
\`\`\`python
def find_duplicate(nums: list[int]) -> int:
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]            # 慢指针一步
        fast = nums[nums[fast]]      # 快指针两步
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:              # 同速相遇点即环入口
        slow = nums[slow]
        fast = nums[fast]
    return slow
# 时间 O(n)，空间 O(1)。
\`\`\`
【实际应用】Floyd 判圈用于状态机死循环检测、循环引用内存分析、爬虫 URL 去重。面试官考察把数组映射为函数图的建模能力。
【踩坑与变体】1) 第一阶段必须先走一步再判等，否则循环直接退出，所以用 do-while。2) 二分解法：统计小于等于 mid 的个数 cnt，cnt 大于 mid 则答案在左半，O(n log n) 也满足空间要求。3) 变体：找所有重复（LeetCode 442，值作下标记负）；只出现一次的数（LeetCode 136，异或）。`,
    keyPoints: ["把值当作下一个下标，数组即函数图，重复数等价于环入口","Floyd 两阶段：先快慢相遇，再一个回起点同速走到环入口","第一阶段必须 do-while 先走一步，否则开局就误判相遇","二分按值域统计计数，O(n log n) 同样满足 O(1) 空间"],
    followUps: ["为什么快慢指针一定会在环内相遇？数学上怎么说明？","如果允许修改数组，找所有重复数（LeetCode 442）有更简单的做法吗？"],
    favorited: false,
  },
  {
    id: "algo-160",
    nodeId: "p2-highfreq",
    question: "160. 相交链表（LeetCode 160）\n找两个链表的交点。",
    answer: `【思路推导】暴力解对 A 的每个节点遍历 B，O(mn)；哈希表存 A 要 O(m) 空间。关键洞察：指针 a 走完 A 接着走 B，指针 b 走完 B 接着走 A，两者总路程都是 m+n。若有交点，交点后公共段长度相同，前面的长度差被交换走恰好抵消，两指针必在交点首次相遇。类比两人赛跑互换后半程跑道，路程拉平后必同时到达汇合点。
【代码实现】
\`\`\`python
def get_intersection_node(headA: ListNode | None, headB: ListNode | None) -> ListNode | None:
    a = headA
    b = headB
    while a is not b:
        a = headB if a is None else a.next  # 走完换到对方头部
        b = headA if b is None else b.next
    return a  # 无交点时同时为 None 退出
# 时间 O(m+n)，空间 O(1)。
\`\`\`
【实际应用】消除长度差的思想出现在 Git merge-base 找公共祖先的简化模型、DNA 序列比对找公共后缀中。面试官考察能否发现交换遍历消除差异这个不变量，以及无交点时循环靠 a 等于 b 等于 null 正确终止。
【踩坑与变体】1) 循环条件是 a !== b 而非 a.next 非空，否则无交点时死循环。2) 已知长度差 d 时：长表先走 d 步再同步走，一趟即可。3) 变体：先判环再判相交（LeetCode 141 与 142 组合）；环形链表 II 用同款快慢指针框架。`,
    keyPoints: ["a 走完 A 走 B、b 走完 B 走 A，总路程都是 m+n，长度差被交换抵消","无交点时两指针同时变 null，循环靠 a 等于 b 终止，不死循环","已知长度差的解法：长表先走 d 步再同步走，一趟完成","比较的是节点引用而非节点值，判等条件是 a !== b"],
    followUps: ["如果两个链表都可能带环，怎么判断是否相交？","为什么第一次相等的位置就是交点，而不是公共段中间某个节点？"],
    favorited: false,
  },
  {
    id: "algo-328",
    nodeId: "p2-highfreq",
    question: "328. 奇偶链表（LeetCode 328）\n将奇数位节点放一起，偶数位节点放一起。",
    answer: `【思路推导】暴力解存数组重排再建链要 O(n) 空间，题目要求 O(1) 暗示原地改指针。关键洞察：维护奇偶两条子链尾指针，每轮把奇节点接到下一奇节点、偶节点接到下一偶节点，最后奇链尾接偶链头。类比洗牌：奇偶位分两摞再接。
【代码实现】
\`\`\`python
def odd_even_list(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head
    odd = head
    even = head.next
    even_head = even  # 保存偶链头
    while even is not None and even.next is not None:
        odd.next = even.next  # 奇链接下一个奇节点
        odd = even.next       # 循环条件已保证非空
        even.next = odd.next  # 偶链接下一个偶节点
        even = even.next
    odd.next = even_head  # 奇链尾接偶链头
    return head
# 时间 O(n)，空间 O(1)。
\`\`\`
【实际应用】链表原地重排用于内存池 free-list 按块分类回收、I/O 调度读写队列分离。面试考察指针严密性：断链前存后继、终止条件覆盖长度奇偶两情形。
【踩坑与变体】1) evenHead 须在改指针前保存，否则拼不回。2) 循环条件只看 odd 会漏偶数长度收尾。3) 变体：按值分割链表（86 题同款双尾指针）、重排链表（143 题，中点加反转加合并）。`,
    keyPoints: ["拆奇偶两条链再拼接：奇链尾接偶链头，evenHead 必须在改动前保存","循环条件看 even 和 even.next，天然覆盖长度为奇为偶两种情形","每轮处理一对节点：先接奇链尾再接偶链尾，顺序不能反","时间 O(n) 空间 O(1)，是原地链表重排的模板题"],
    followUps: ["按值分割链表（LeetCode 86）和这题的双尾指针框架有什么共性？","重排链表 L0 接 Ln 接 L1（LeetCode 143）怎么拆成中点、反转、合并三步？"],
    favorited: false,
  },
  {
    id: "algo-236",
    nodeId: "p2-highfreq",
    question: "236. 二叉树最近公共祖先（LeetCode 236）\n找两个节点的最近公共祖先。",
    answer: `\`\`\`python
# 思路：递归后序遍历，左右子树分别找 p 和 q
# 时间 O(n)，空间 O(h)
# 返回值语义：lowest_common_ancestor(root) 表示"root 子树中是否含 p/q"——
# 子树含 p 或 q 之一就返回该节点；都不含返回 None；
# 若左右返回值均非 None，说明 p、q 分属当前节点两侧，当前节点即 LCA。
# 后序自底向上汇总，第一个左右均非空的节点就是最近公共祖先。

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def lowest_common_ancestor(root: TreeNode | None, p: TreeNode, q: TreeNode) -> TreeNode | None:
    if root is None or root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left is not None and right is not None:
        return root
    return left if left is not None else right
\`\`\``,
    keyPoints: ["递归后序遍历", "左右都找到则当前是 LCA", "一边找到返回那边"],
    followUps: ["BST 的 LCA 怎么优化？", "多个节点的 LCA？"],
    favorited: false,
  },
  {
    id: "algo-437",
    nodeId: "p2-highfreq",
    question: "437. 路径总和 III（LeetCode 437）\n找二叉树中和为 target 的路径数，路径向下。",
    answer: `\`\`\`python
# 思路：前缀和 + DFS
# 时间 O(n)，空间 O(h)
# 关键：前缀和差值判断子路径和

def path_sum(root: TreeNode | None, target_sum: int) -> int:
    prefix_sum: dict[int, int] = {0: 1}

    def dfs(node: TreeNode | None, cur_sum: int) -> int:
        if node is None:
            return 0
        cur_sum += node.val
        count = prefix_sum.get(cur_sum - target_sum, 0)
        prefix_sum[cur_sum] = prefix_sum.get(cur_sum, 0) + 1
        count += dfs(node.left, cur_sum) + dfs(node.right, cur_sum)
        prefix_sum[cur_sum] -= 1  # 回溯撤销前缀和
        return count

    return dfs(root, 0)
\`\`\``,
    keyPoints: ["前缀和 + DFS", "回溯撤销前缀和", "差值判断子路径"],
    followUps: ["不回溯会怎样？", "如果路径可以任意方向？"],
    favorited: false,
  },
  {
    id: "algo-240",
    nodeId: "p2-highfreq",
    question: "240. 搜索二维矩阵 II（LeetCode 240）\n在每行每列递增的矩阵中搜索目标值。",
    answer: `【思路推导】暴力逐格扫描 O(mn)，对每行二分是 O(m log n)。关键洞察：站在右上角，往左递减、往下递增，这个角落就是一棵隐形二叉搜索树的根——比 target 大就往左走淘汰整列，比 target 小就往下走淘汰整行，每步排除一行或一列。类比 BST：左小右大变成左小下大。
【代码实现】
\`\`\`python
def search_matrix(matrix: list[list[int]], target: int) -> bool:
    m = len(matrix)
    n = len(matrix[0])
    row = 0
    col = n - 1  # 从右上角出发
    while row < m and col >= 0:
        cur = matrix[row][col]
        if cur == target:
            return True
        if cur < target:
            row += 1  # 本行左侧都更小，淘汰本行
        else:
            col -= 1  # 本列下方都更大，淘汰本列
    return False
# 时间 O(m+n)，空间 O(1)。
\`\`\`
【实际应用】单调矩阵出现在 LSM 树按 key 有序的跳跃查找、时序数据多维检索。面试官考察能否发现行列双单调性提供的两个剪枝方向，以及为何左上、右下角不行——那两个角落两方向单调性相同，无法排除。
【踩坑与变体】1) 起点必须是右上或左下，选错则两方向同向无法剪枝。2) 与 LeetCode 74 区分：74 行间全局有序可整体二分 O(log(mn))，本题无此保证。3) 变体：矩阵中第 K 小（LeetCode 378，值域二分）。`,
    keyPoints: ["从右上角出发：大则左移淘汰一列，小则下移淘汰一行","右上角是隐形 BST 的根，左小下大；左上和右下角方向同向无法剪枝","时间 O(m+n) 空间 O(1)，行列各最多走一遍","与 LeetCode 74 的全局有序矩阵区分：74 可整体二分 O(log(mn))"],
    followUps: ["为什么从左上角出发不行？两个方向的信息量差在哪？","如果改成找矩阵中第 K 小的数（LeetCode 378），该怎么做？"],
    favorited: false,
  },
  {
    id: "algo-162",
    nodeId: "p2-highfreq",
    question: "162. 寻找峰值（LeetCode 162）\n找任意一个峰值元素，要求 O(logn)。",
    answer: `【思路推导】暴力 O(n) 扫一遍即可，但题目要求 O(log n)。数组无序怎么二分？关键洞察：若 nums[mid] 小于 nums[mid+1]，右半必有峰——从 mid 往右是上坡，要么一直升到边界（题设边界外视为负无穷，边界即峰），要么中途下拐，拐点就是峰。所以二分永远朝上坡方向爬。类比连绵山脉：只要还在上坡，往前走必有山顶。
【代码实现】
\`\`\`python
def find_peak_element(nums: list[int]) -> int:
    lo = 0
    hi = len(nums) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1  # 右半必有峰
        else:
            hi = mid      # 左半含 mid 必有峰
    return lo  # lo 等于 hi 即峰值下标
# 时间 O(log n)，空间 O(1)。
\`\`\`
【实际应用】沿梯度方向搜索必达局部极值是梯度上升的离散版，用于超参搜索、语音基频极大值提取、负载均衡找热点。面试官考察无序数组能二分的条件：每步都能证明答案在某一侧存在。
【踩坑与变体】1) hi 取 mid 而非 mid-1，因为 mid 本身可能就是峰。2) lo 小于 hi 配合 mid 下取整不会死循环。3) 变体：山脉数组最大值（LeetCode 852 同解）；二维峰值（LeetCode 1901，对列二分取列内最大再横向比）；找所有峰只能 O(n)。`,
    keyPoints: ["nums[mid] 小于 nums[mid+1] 则右半必有峰：上坡必有顶，二分朝坡上爬","hi 收缩到 mid 而非 mid-1，因为 mid 本身可能就是峰","相邻元素不等且边界外视为负无穷，保证任意数组都有峰","无序数组能二分的本质：每步都能证明答案在某一侧存在"],
    followUps: ["峰值不唯一时这个二分会收敛到哪个峰？","二维数组找峰值（LeetCode 1901）怎么把一维思路推广过去？"],
    favorited: false,
  },
  {
    id: "algo-73",
    nodeId: "p2-highfreq",
    question: "73. 矩阵置零（LeetCode 73）\n如果矩阵元素为 0，将其行列全置 0。原地操作。",
    answer: `\`\`\`python
# 思路：用首行首列标记，再统一置零
# 时间 O(m·n)，空间 O(1)
# 关键：首行首列单独标记，先存原始状态

def set_zeroes(matrix: list[list[int]]) -> None:
    m, n = len(matrix), len(matrix[0])
    first_row = first_col = False
    for j in range(n):
        if matrix[0][j] == 0:
            first_row = True
    for i in range(m):
        if matrix[i][0] == 0:
            first_col = True
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if first_row:
        for j in range(n):
            matrix[0][j] = 0
    if first_col:
        for i in range(m):
            matrix[i][0] = 0
\`\`\``,
    keyPoints: ["用首行首列做标记", "先存首行首列原始状态", "最后处理首行首列"],
    followUps: ["用 O(m+n) 空间怎么解？", "常数空间还有别的方法吗？"],
    favorited: false,
  },
  {
    id: "algo-54",
    nodeId: "p2-highfreq",
    question: "54. 螺旋矩阵（LeetCode 54）\n按顺时针螺旋顺序返回矩阵所有元素。",
    answer: `\`\`\`python
# 思路：四方向模拟，维护边界
# 时间 O(m·n)，空间 O(1)
# 关键：上下左右四个边界，逐层收缩

def spiral_order(matrix: list[list[int]]) -> list[int]:
    m, n = len(matrix), len(matrix[0])
    top, bottom, left, right = 0, m - 1, 0, n - 1
    res: list[int] = []
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):
            res.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                res.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                res.append(matrix[i][left])
            left += 1
    return res
\`\`\``,
    keyPoints: ["四方向模拟", "维护四个边界", "注意边界收缩后判越界"],
    followUps: ["生成螺旋矩阵怎么解？", "逆时针怎么改？"],
    favorited: false,
  },
  {
    id: "algo-48",
    nodeId: "p2-highfreq",
    question: "48. 旋转图像（LeetCode 48）\n将 n×n 矩阵顺时针旋转 90 度，原地操作。",
    answer: `【思路推导】暴力解开新矩阵拷贝，题目要求原地。关键洞察：顺时针 90 度等于主对角线转置加每行左右翻转，两步都是原地交换。推导：转置把 (i,j) 变 (j,i)，行翻转再变 (j,n-1-i)，合成正是顺时针映射。类比两次照镜子：两次镜像等于一次旋转。
【代码实现】
\`\`\`python
def rotate(matrix: list[list[int]]) -> None:
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):   # 转置：只走上三角
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for i in range(n):
        for j in range(n // 2):     # 每行左右翻转
            matrix[i][j], matrix[i][n - 1 - j] = matrix[i][n - 1 - j], matrix[i][j]
# 时间 O(n²)，空间 O(1)
\`\`\`
【实际应用】图像库 EXIF 旋转、手机相机旋正、游戏地图朝向变换都用此分解。面试官考察坐标变换分解能力，以及对遍历范围的把控——j 从 i+1 开始避免换回去。
【踩坑与变体】1) 转置时 j 从 0 开始会把元素换回原位。2) 逐环四层旋转法易错在环边界，转置法更稳。3) 逆时针 90 度等于转置加列翻转；180 度等于行列各翻一次。4) 变体：LeetCode 54 螺旋矩阵用同样的按层坐标思维。`,
    keyPoints: ["顺时针 90 度等于主对角线转置加每行左右翻转，两步都是原地交换","转置内层 j 从 i+1 开始只走上三角，从 0 开始会换回原位","逆时针 90 度等于转置加列翻转，180 度等于行列各翻一次","坐标推导：(i,j) 转置变 (j,i) 再行翻转变 (j,n-1-i)，正是顺时针映射"],
    followUps: ["如果不是方阵而是 m 乘 n 矩阵要旋转 90 度，还能原地做吗？","逐环四层交换的原地旋转法怎么写？和转置法比哪个更不易错？"],
    favorited: false,
  },
  {
    id: "algo-14",
    nodeId: "p2-highfreq",
    question: "14. 最长公共前缀（LeetCode 14）\n找字符串数组的最长公共前缀。",
    answer: `【思路推导】暴力解两两求公共前缀再与下一个合并，最坏多次重复比较。关键洞察：公共前缀一定是第一个串的前缀，以它为基准逐列纵向比较所有串的第 i 个字符，一旦遇到不等或某串到头，前缀即终止。这是上限递减思想：公共前缀长度不超过最短串。类比合唱：整齐部分在最短歌词结束或有人唱错时戛然而止。
【代码实现】
\`\`\`python
def longest_common_prefix(strs: list[str]) -> str:
    if not strs:
        return ''
    base = strs[0]
    for i in range(len(base)):
        for j in range(1, len(strs)):
            if i >= len(strs[j]) or strs[j][i] != base[i]:
                return base[:i]   # 越界或不等，前缀到此为止
    return base                    # base 整体都是公共前缀
# 时间 O(S)，S 为所有字符总数；空间 O(1)
\`\`\`
【实际应用】公共前缀是 Trie、路由最长前缀匹配（IP 转发）、自动补全的核心操作，CIDR 聚合也是求二进制前缀。面试官考察基准串选取与判断顺序，以及能否扩展到分治或二分。
【踩坑与变体】1) 空数组返回空串，单串返回自身。2) 必须先判 i 越界再比较字符，顺序反了会取到 undefined。3) 变体：二分前缀长度 O(S log m)；分治合并左右前缀。4) Unicode 下按码元与按字素簇比较结果可能不同。`,
    keyPoints: ["公共前缀必是第一个串的前缀，以它为基准纵向逐列比较","终止条件二选一：某串越界或字符不等，必须先判越界再取字符","时间 O(S) 即所有字符总数，空间 O(1)","可扩展为二分前缀长度或分治合并，应对海量短前缀场景"],
    followUps: ["如果字符串数量巨大且前缀很短，二分长度比纵向扫描快在哪？","扩展成求一组字符串的最长公共后缀，思路要变什么？"],
    favorited: false,
  },
  {
    id: "algo-28",
    nodeId: "p2-highfreq",
    question: "28. 找出字符串中第一个匹配项（LeetCode 28）\n实现 strStr，返回 needle 在 haystack 中的位置。",
    answer: `\`\`\`python
# 思路：KMP 算法
# 时间 O(n+m)，空间 O(m)
# 关键：next 数组记录最长前后缀，失配时跳转

def str_str(haystack: str, needle: str) -> int:
    if needle == "":
        return 0
    nxt = build_next(needle)
    j = 0
    for i in range(len(haystack)):
        while j > 0 and haystack[i] != needle[j]:
            j = nxt[j - 1]
        if haystack[i] == needle[j]:
            j += 1
        if j == len(needle):
            return i - j + 1
    return -1

def build_next(s: str) -> list[int]:
    nxt = [0] * len(s)
    j = 0
    for i in range(1, len(s)):
        while j > 0 and s[i] != s[j]:
            j = nxt[j - 1]
        if s[i] == s[j]:
            j += 1
        nxt[i] = j
    return nxt
\`\`\``,
    keyPoints: ["KMP 算法", "next 数组=最长相同前后缀", "失配时跳转"],
    followUps: ["暴力法时间复杂度？", "Rabin-Karp 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-151",
    nodeId: "p2-highfreq",
    question: "151. 反转字符串中的单词（LeetCode 151）\n将字符串中的单词顺序反转。",
    answer: `【思路推导】最省事是 split 加 reverse 加 join 一把梭，但面试考察三段式反转思想：先整体反转，单词顺序就位但每个单词内部也反了，再逐词反转恢复，空格最后压实。类比翻烙饼：先翻整摞再翻每块。
【代码实现】
\`\`\`python
def reverse_words(s: str) -> str:
    a = list(s)
    def rev(l: int, r: int) -> None:
        while l < r:
            a[l], a[r] = a[r], a[l]
            l += 1
            r -= 1
    rev(0, len(a) - 1)              # 整体反转
    start = 0
    for i in range(len(a) + 1):
        if i == len(a) or a[i] == ' ':
            rev(start, i - 1)       # 逐词反转
            start = i + 1
    return ' '.join(''.join(a).split())   # 压实多余空格
# 时间 O(n)，空间 O(n)（字符串不可变须转数组）
\`\`\`
【实际应用】三段式反转与旋转数组（LeetCode 189）同构。面试官真正考察空间认知：C++ 可原地 O(1)，JS/Java/Go 字符串不可变必须 O(n)，答不出会露馅。
【踩坑与变体】1) 忘压实空格输出含多余空格。2) 逐词反转必须处理到末尾的边界，否则最后一词漏反。3) 变体：LeetCode 186 无空格版；LeetCode 557 只反转每个单词不换序。`,
    keyPoints: ["三段式：整体反转让单词顺序就位，再逐词反转恢复内部，空格最后压实","JS/Java/Go 字符串不可变，O(n) 空间不可避免；C++ 可原地 O(1)","逐词反转必须处理下标到末尾的边界，否则最后一个词漏反","与旋转数组（LeetCode 189）同构，都是整体加局部反转"],
    followUps: ["如果要求完全原地、不用任何库函数处理多余空格，关键步骤是什么？","如果输入是流式的、内存放不下整个字符串，还能做吗？"],
    favorited: false,
  },
  {
    id: "algo-7",
    nodeId: "p2-highfreq",
    question: "7. 整数反转（LeetCode 7）\n反转 32 位有符号整数，溢出返回 0。",
    answer: `【思路推导】逐位取模拼接是显然的，真正考点是溢出：反转 1534236469 得 9646324351 越出 32 位范围。关键洞察：在乘 10 加 digit 之前预判——res 大于 214748364 则必溢出；等于则新 digit 正不超 7、负不小于 -8（上下界的个位）。类比水库放水前看水位，而不是漫坝后补救。
【代码实现】
\`\`\`python
def reverse(x: int) -> int:
    res = 0
    sign = -1 if x < 0 else 1
    x = abs(x)                     # Python 取模与截断行为不同，先取绝对值
    while x != 0:
        digit = x % 10
        x = x // 10
        if res > 214748364 or (res == 214748364 and digit > 7):
            return 0
        res = res * 10 + digit
    return sign * res
# 时间 O(log n)，空间 O(1)
\`\`\`
【实际应用】溢出预判是金融计算、序列号回绕、自增 ID 设计的必修课；Integer.parseInt 内部就是乘前预判。面试官考察防御性数值思维与 7、-8 的由来。
【踩坑与变体】1) JS 除法是浮点的，必须 Math.trunc，负数用 floor 会多减 1。2) JS 可后验但 C/Java 必须先预判，语言差异要说清。3) 变体：LeetCode 8 atoi 同款溢出处理；LeetCode 9 只反转一半可避开溢出。`,
    keyPoints: ["溢出在乘 10 之前预判：res 超 214748364 必溢出，等于则个位不能超 7 或 -8","JS 除法是浮点的，必须 Math.trunc 取整；取模带符号，负数天然兼容","时间 O(log n) 空间 O(1)，循环次数即十进制位数","语言差异要说清：JS 安全整数大可后验，C/Java 必须先预判"],
    followUps: ["2147483647 和 -2147483648 的个位 7 和 -8 是怎么推出来的？","字符串转整数 atoi（LeetCode 8）的溢出处理和这题有什么异同？"],
    favorited: false,
  },
  {
    id: "algo-9",
    nodeId: "p2-highfreq",
    question: "9. 回文数（LeetCode 9）\n判断整数是否回文，不转字符串。",
    answer: `【思路推导】转字符串双指针是作弊解；全部反转再比较可行，但大整数有溢出风险（语言相关）。关键洞察：只需反转后半段与前半段比较——当 reverted 不再小于 x 时说明已过半。负数、以及以 0 结尾的非零数（如 10）必然不是回文，提前排除。类比判断一本书是否对称：不必重抄整本，后半倒读与前半正读对照即可。
【代码实现】
\`\`\`python
def is_palindrome(x: int) -> bool:
    if x < 0 or (x % 10 == 0 and x != 0):  # 负数与尾零非零数
        return False
    reverted = 0
    while x > reverted:
        reverted = reverted * 10 + x % 10
        x //= 10
    # 偶数位直接相等；奇数位 reverted 多一位，去掉末位再比
    return x == reverted or x == reverted // 10
# 时间 O(log n)，空间 O(1)
\`\`\`
【实际应用】半段比较思想用于大数校验、双向对账系统（各算一半再汇合比对）、分布式幂等键的对称性检测。面试官考察循环终止条件 x 大于 reverted 的不变量分析，以及奇偶长度两种情形的统一处理。
【踩坑与变体】1) 漏掉尾零判断：10 反转半段是 1，会被误判为回文。2) JS 里要用 Math.trunc 而非直接除法赋值。3) 变体：回文链表（LeetCode 234，快慢指针找中点加反转后半，同款半段思想）；回文子串（LeetCode 5、647）是中心扩展的另一类问题。`,
    keyPoints: ["只反转后半段：x 不再大于 reverted 时过半，偶数位直等、奇数位去末位","负数与尾零非零数必然不是回文，提前剪枝","半段反转避开全反转的溢出风险，空间 O(1)","循环不变量：reverted 始终是已剥下低位数字的反转值"],
    followUps: ["为什么循环条件是 x 大于 reverted 而不是 x 不等于 0？过半依据是什么？","回文链表（LeetCode 234）如何借用同样的半段思想做到 O(1) 空间？"],
    favorited: false,
  },
  {
    id: "algo-66",
    nodeId: "p2-highfreq",
    question: "66. 加一（LeetCode 66）\n将用数组表示的非负整数加一。",
    answer: `【思路推导】模拟竖式加法：从末位加一，遇 9 变 0 继续进位，非 9 加一即结束。唯一需要扩容的是全 9 情形（999 变 1000）。关键洞察：提前返回让全 9 场景自然落到循环外统一处理，代码无冗余分支。类比里程表滚动：9 归零进位，一连串 9 就一路滚到最高位再补 1。
【代码实现】
\`\`\`python
def plus_one(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1           # 无进位，直接结束
            return digits
        digits[i] = 0                # 9 变 0，继续进位
    return [1] + digits              # 全 9，高位补 1
# 时间 O(n)，空间 O(1)（不计输出数组）
\`\`\`
【实际应用】这是大数运算的入门模型：数据库自增 ID、版本号 bump、雪花算法序列位回绕处理都是同款进位逻辑。面试官考察边界设计：提前返回的简洁性与 carry 变量的通用性之取舍，以及是否意识到高位扩容。
【踩坑与变体】1) 忘记全 9 扩容是最高频错误。2) 本题判 9 已够用，但加任意数时必须用 carry 通用写法，别生搬。3) 变体构成完整大数加法系列：LeetCode 67 二进制加法、LeetCode 415 字符串加法、LeetCode 2 链表相加；LeetCode 369 给链表加一可用栈或递归。`,
    keyPoints: ["从末位加一：非 9 加一直接返回，遇 9 置 0 继续进位","全 9 是唯一需要扩容的情形，落到循环外统一补最高位 1","提前返回消灭冗余分支，比 carry 写法更贴合本题","时间 O(n) 空间 O(1)，是大数加法系列的入门模型"],
    followUps: ["改成加任意非负整数而不只是加一，代码要怎么扩展？","如果数字存在正序链表里（LeetCode 369），怎么处理进位方向？"],
    favorited: false,
  },
  {
    id: "algo-58",
    nodeId: "p2-highfreq",
    question: "58. 最后一个单词的长度（LeetCode 58）\n返回字符串中最后一个单词的长度。",
    answer: `【思路推导】暴力解 split 后取最后一项，但尾部空格会产生空串需额外处理，还费 O(n) 空间。关键洞察：从后往前先跳过尾部空格，再数连续非空格字符，一次扫描零额外空间。这体现倒序处理避开前置干扰的思路——正序要在多个单词间定位，倒序只需一次状态切换。类比从绳子末端找最后一个结，比从头数到尾快。
【代码实现】
\`\`\`python
def length_of_last_word(s: str) -> int:
    i = len(s) - 1
    length = 0
    while i >= 0 and s[i] == ' ':
        i -= 1                          # 跳过尾部空格
    while i >= 0 and s[i] != ' ':       # 统计最后一个单词
        length += 1
        i -= 1
    return length
# 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】倒序扫描在文本处理很常见：编辑器 Ctrl+Backspace 回退到词首、URL 提取最后一段路径、日志 tail 倒读。面试官考察边界严谨性：全空格串返回 0、整串无空格、单字符。
【踩坑与变体】1) 不跳尾部空格直接数，对尾部带空格的输入会得 0。2) split(' ') 在多空格下产生空串元素，正则又要处理首尾空项，不如手写扫描干净。3) 变体：LeetCode 151 反转单词是其升级版；LeetCode 165 版本号比较同样需要分段解析的思维。`,
    keyPoints: ["倒序扫描：先跳尾部空格，再数连续非空格字符，一次遍历 O(1) 空间","不跳尾部空格是最高频错误，尾部带空格会得到 0","split 方案在多空格下产生空串元素，边界处理反而更脏","正序要管理多个单词的状态，倒序只需一次状态切换"],
    followUps: ["字符串全是空格或为空时，你的代码返回什么？验证过吗？","扩展成返回最后一个单词本身而不是长度，改动大吗？"],
    favorited: false,
  },
  {
    id: "algo-383",
    nodeId: "p2-highfreq",
    question: "383. 赎金信（LeetCode 383）\n判断 magazine 能否构造 ransomNote。",
    answer: `【思路推导】暴力解对每个字符去 magazine 找并标记已用，O(mn)。关键洞察：只有 26 个小写字母，用定长数组计数——magazine 计数相当于盘点库存，ransomNote 逐个扣减，出现负数即缺货。即容量大于等于需求的判定。
【代码实现】
\`\`\`python
def can_construct(ransom_note: str, magazine: str) -> bool:
    if len(ransom_note) > len(magazine):
        return False                      # 提前剪枝
    count = [0] * 26
    for ch in magazine:
        count[ord(ch) - 97] += 1          # 盘点库存
    for ch in ransom_note:
        idx = ord(ch) - 97
        count[idx] -= 1
        if count[idx] < 0:                # 缺货立即失败
            return False
    return True
# 时间 O(m+n)，空间 O(1)（定长 26）
\`\`\`
【实际应用】定长数组计数是桶思想原型：限流令牌桶、库存预占、拼写检查候选生成。面试官考察：知道 26 字母约束时用数组而非哈希表（常数小、缓存友好），以及约束放松后方案如何演化。
【踩坑与变体】1) 忘记先剪枝：ransomNote 更长可直接 false。2) 变体：字母异位词（LeetCode 242 计数相等；LeetCode 438 滑动窗口）；字符集放宽到 Unicode 时数组失效，必须换 Map。`,
    keyPoints: ["26 个小写字母约束下用定长数组计数，比哈希表常数小且缓存友好","magazine 先建库存，ransomNote 逐项扣减，出现负数即失败","ransomNote 更长直接 false，是最便宜的提前剪枝","本质是资源容量大于等于需求的判定模型，时间 O(m+n)"],
    followUps: ["字符集放宽到任意 Unicode，方案要怎么改？代价是什么？","找所有字母异位词（LeetCode 438）的滑动窗口和本题计数框架有什么关联？"],
    favorited: false,
  },
  {
    id: "algo-205",
    nodeId: "p2-highfreq",
    question: "205. 同构字符串（LeetCode 205）\n判断 s 和 t 是否同构（一一映射）。",
    answer: `【思路推导】
同构的本质是字符一一映射：s 中每个字符唯一映射到 t 中某字符，反向也唯一。用两个哈希表分别记录 s 到 t、t 到 s 的映射，遍历时若 s[i] 已映射但目标不是 t[i]，或 t[i] 已被别的字符占用，即冲突返回 false。时间 O(n)，空间 O(字符集)。
【代码实现】
\`\`\`python
def is_isomorphic(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    s2t: dict[str, str] = {}
    t2s: dict[str, str] = {}
    for a, b in zip(s, t):
        if a in s2t and s2t[a] != b:
            return False
        if b in t2s and t2s[b] != a:
            return False
        s2t[a] = b
        t2s[b] = a
    return True
\`\`\`
【实际应用】
字符映射很常见：替换密码合法性校验、编译器标识符重命名检查、文本模板匹配（word pattern）、数据脱敏的映射一致性保证。双向约束是举一反三的关键。
【踩坑与变体】
易错点是只建单向映射：s=ab、t=aa 时 s 到 t 看似合法，反向却冲突。变体：LeetCode 290 单词规律是同思想套在单词粒度上；ASCII 场景可用长度 128 的数组代替 Map，索引即字符码，常数更小；多字符串同构需两两校验。`,
    keyPoints: ["同构要求双向一一映射，必须同时建 s→t 与 t→s 两张表校验","任一方向出现映射冲突即返回 false","时间 O(n)，空间 O(字符集)，ASCII 可用 128 长度数组优化","与 LeetCode 290 单词规律互为变体"],
    followUps: ["如果字符集是 ASCII，如何用数组代替哈希表把常数压到最小？","给定一组字符串，如何判断它们两两之间是否同构？"],
    favorited: false,
  },
  {
    id: "algo-290",
    nodeId: "p2-highfreq",
    question: "290. 单词规律（LeetCode 290）\n判断字符串是否遵循给定规律。",
    answer: `\`\`\`python
# 思路：双向映射，split 后逐词对应
# 时间 O(n)，空间 O(1)
# 关键：pattern→word 和 word→pattern 双向
# 注意：只建单向映射会被 abba/aa 反例击穿，必须双向校验

def word_pattern(pattern: str, s: str) -> bool:
    words = s.split(' ')
    if len(pattern) != len(words):
        return False
    m1: dict[str, str] = {}   # pattern → word
    m2: dict[str, str] = {}   # word → pattern
    for ch, w in zip(pattern, words):
        if ch in m1 and m1[ch] != w:
            return False      # 同一 pattern 字符映射到不同单词
        if w in m2 and m2[w] != ch:
            return False      # 同一单词被不同 pattern 字符占用
        m1[ch] = w
        m2[w] = ch
    return True
\`\`\``,
    keyPoints: ["双向映射", "pattern↔word", "长度先判"],
    followUps: ["同构字符串的扩展？", "Unicode 怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-242",
    nodeId: "p2-highfreq",
    question: "242. 有效的字母异位词（LeetCode 242）\n判断两个字符串是否字母异位词。",
    answer: `【思路推导】
异位词要求字符种类与频次完全一致、顺序无关。先比长度，不等直接 false。然后用计数法：开 26 长度数组，一次循环里对 s 的字符加一、对 t 的字符减一，最后数组全零即异位。排序后比较也行，但 O(n log n) 更慢，计数法时间 O(n)、空间 O(1)，是定长小字符集下的最优解。
【代码实现】
\`\`\`python
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    cnt = [0] * 26
    base = ord('a')
    for ch_s, ch_t in zip(s, t):
        cnt[ord(ch_s) - base] += 1
        cnt[ord(ch_t) - base] -= 1
    return all(c == 0 for c in cnt)
\`\`\`
【实际应用】
字符频次统计是文本处理的基本功：拼写纠错中判断可重排候选词、输入法组词、搜索引擎同义词归并、抄袭检测里的文档指纹比对。用数组代替哈希表是固定小字符集场景的经典优化手法。
【踩坑与变体】
题目进阶要求支持 Unicode 时，26 长度数组不够用，必须改 Map 按字符计数。变体：LeetCode 438 找所有异位子串，用定长滑动窗口加计数比较；LeetCode 49 异位词分组，把排序串或计数编码当作 key 聚合；判断能否重排成回文只需统计奇数次字符不超过一个。`,
    keyPoints: ["异位词等价于字符频次完全相同，计数法是首选","一次循环 s 加 t 减，最后全零判定，时间 O(n) 空间 O(1)","Unicode 场景必须改用 Map 计数","计数编码/排序串可作为异位词分组的 key"],
    followUps: ["如果要支持 Unicode 字符，计数方案需要怎么调整？","如何在一个长串中找出所有与目标串互为异位词的子串？"],
    favorited: false,
  },

  // ===== Phase 3：字节/腾讯高频（19题，跳过重题）=====
  {
    id: "algo-1109",
    nodeId: "p3-bytedance-tencent",
    question: "1109. 航班预订统计（LeetCode 1109）\n返回每趟航班上预订的座位数。",
    answer: `【思路推导】
暴力是对每条预订给区间内每个航班加座位数，O(n·bookings) 会超时。观察到这里是大量区间加法加最后一次整体查询，差分数组正是为此设计：diff[i] 记录第 i 站相对前一站的增量，区间 [l, r] 加 k 只需 diff[l] += k、diff[r+1] -= k，两次操作 O(1)；全部修改做完后跑一遍前缀和即可还原每个位置的真实值。总时间 O(n+bookings)，空间 O(n)。
【代码实现】
\`\`\`python
def corp_flight_bookings(bookings: list[list[int]], n: int) -> list[int]:
    diff = [0] * (n + 1)
    for b in bookings:
        diff[b[0] - 1] += b[2]
        diff[b[1]] -= b[2]
    res = [0] * n
    for i in range(n):
        res[i] = (0 if i == 0 else res[i - 1]) + diff[i]
    return res
\`\`\`
【实际应用】
差分适合先批量改、后统一查的离线场景：日志系统按时间段统计请求量、运营活动按日期区间加减库存、数据库范围批量更新、图像区域亮度批量调整。
【踩坑与变体】
本题航班从 1 开始编号，转 0 索引后右端点恰好是 diff[b[1]]，下标错位是最常见的 bug。变体：区间修改配单点查询可用树状数组；区间修改配区间求和要线段树加懒标记；二维推广是二维差分（LeetCode 2132 印章覆盖），处理矩阵区域批量加。`,
    keyPoints: ["区间加 k：diff[l] += k 且 diff[r+1] -= k，单次 O(1)","前缀和还原真实值，总复杂度 O(n+bookings)","注意本题航班编号从 1 开始的下标偏移","多次区间改+多次区间查需升级线段树懒标记"],
    followUps: ["如果需要边修改边查询区间和，差分数组还够用吗？","二维差分数组怎么处理矩阵区域的批量加法？"],
    favorited: false,
  },
  {
    id: "algo-253",
    nodeId: "p3-bytedance-tencent",
    question: "253. 会议室 II（LeetCode 253）\n求需要的最少会议室数。",
    answer: `【思路推导】
最少会议室数等于同一时刻并行会议的峰值。用扫描线思想：把开始时间和结束时间分别排序，双指针扫描——每当一个会议开始，先把所有结束时间不晚于它的会议释放掉，再占用一间房，过程中记录占用的最大值。另一解法：按开始排序加最小堆维护最早结束时间，堆顶可复用则弹出，堆峰值同为答案。时间 O(n log n)，空间 O(n)。
【代码实现】
\`\`\`python
def min_meeting_rooms(intervals: list[list[int]]) -> int:
    starts = sorted(v[0] for v in intervals)
    ends = sorted(v[1] for v in intervals)
    rooms = 0
    ans = 0
    j = 0
    for i in range(len(starts)):
        while j < len(ends) and ends[j] <= starts[i]:
            rooms -= 1
            j += 1
        rooms += 1
        ans = max(ans, rooms)
    return ans
\`\`\`
【实际应用】
峰值资源估算：服务器最大并发连接规划、网约车时段最少车辆数、影院排片所需影厅数、共享工位占用峰值分析。
【踩坑与变体】
边界：结束时间等于下一个开始时间时可复用，所以释放条件必须带等号。变体：LeetCode 252 会议室 I 只判能否全参加，排序后看相邻是否重叠即可；要求输出每个房间的具体安排时，堆中要存房间编号并维护空闲房间池；带优先级的抢占式调度则不能用简单扫描线。`,
    keyPoints: ["答案等于并行会议的峰值数","扫描线：开始结束分别排序，双指针统计占用峰值","等价解法：按开始排序+最小堆维护最早结束时间","结束等于开始可复用，释放条件用小于等于"],
    followUps: ["如果还要求返回每个会议室具体安排了哪些会议，堆结构要怎么扩展？","不用堆也不用排序，计数排序思想在这题可行吗？"],
    favorited: false,
  },
  {
    id: "algo-57",
    nodeId: "p3-bytedance-tencent",
    question: "57. 插入区间（LeetCode 57）\n在无重叠有序区间列表中插入新区间并合并。",
    answer: `\`\`\`python
# 思路：分三段——不重叠的前段、重叠合并、不重叠的后段
# 时间 O(n)，空间 O(n)
# 关键：分三阶段处理

def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    res: list[list[int]] = []
    i = 0
    # 不重叠的前段
    while i < len(intervals) and intervals[i][1] < new_interval[0]:
        res.append(intervals[i])
        i += 1
    # 重叠合并
    while i < len(intervals) and intervals[i][0] <= new_interval[1]:
        new_interval[0] = min(new_interval[0], intervals[i][0])
        new_interval[1] = max(new_interval[1], intervals[i][1])
        i += 1
    res.append(new_interval)
    # 不重叠的后段
    while i < len(intervals):
        res.append(intervals[i])
        i += 1
    return res
\`\`\``,
    keyPoints: ["三阶段处理", "重叠时合并边界", "保持有序"],
    followUps: ["多个区间插入怎么解？", "区间删除？"],
    favorited: false,
  },
  {
    id: "algo-31",
    nodeId: "p3-bytedance-tencent",
    question: "31. 下一个排列（LeetCode 31）\n将数组重排为下一个更大的排列，已是最大则升序。",
    answer: `【思路推导】
要在尽量靠右的位置做最小增幅。从右往左找第一个下降点 i（nums[i] 小于 nums[i+1]），右侧已是降序最大后缀；再从右找第一个大于 nums[i] 的 j 交换，后缀仍降序；最后反转 i 之后部分成升序，即得恰好大一点的排列。整段降序则整体反转为最小排列。时间 O(n)，空间 O(1)。
【代码实现】
\`\`\`python
def next_permutation(nums: list[int]) -> None:
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = n - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    l, r = i + 1, n - 1
    while l < r:
        nums[l], nums[r] = nums[r], nums[l]
        l += 1
        r -= 1
\`\`\`
【实际应用】
字典序推进是组合枚举基础：全排列穷举、调度顺序遍历、密钥空间枚举、AI 操作序列生成，标准库 next_permutation 即此逻辑。
【踩坑与变体】
易错点：交换后忘记反转后缀成升序；含重复元素时找 j 必须严格大于 nums[i]。变体：上一个排列把比较方向反转；LeetCode 60 第 K 个排列用阶乘进制直接定位；LeetCode 556 是同思想的数位版。`,
    keyPoints: ["从右找第一个下降点 i，右半是最大后缀","交换 nums[i] 与后缀中刚好大于它的元素","后缀反转成升序得到最小增幅","整段降序时直接反转，时间 O(n) 空间 O(1)"],
    followUps: ["如何用阶乘进制直接求第 K 个排列，而不是逐次推进？","求上一个排列时，算法要做哪些对称修改？"],
    favorited: false,
  },
  {
    id: "algo-10",
    nodeId: "p3-bytedance-tencent",
    question: "10. 正则表达式匹配（LeetCode 10）\n实现 . 和 * 的正则匹配。",
    answer: `\`\`\`python
# 思路：二维 DP
# 时间 O(m·n)，空间 O(m·n)
# 关键：* 匹配 0 次或多次

def is_match(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1, 2):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i][j - 2] or (dp[i - 1][j] and (p[j - 2] == '.' or p[j - 2] == s[i - 1]))
            else:
                dp[i][j] = dp[i - 1][j - 1] and (p[j - 1] == '.' or p[j - 1] == s[i - 1])
    return dp[m][n]
\`\`\``,
    keyPoints: ["二维 DP", "* 匹配 0 次或多次", "初始化空串匹配 a* 模式"],
    followUps: ["通配符匹配怎么解？", "递归怎么写？"],
    favorited: false,
  },
  {
    id: "algo-44",
    nodeId: "p3-bytedance-tencent",
    question: "44. 通配符匹配（LeetCode 44）\n实现 ? 和 * 的通配符匹配。",
    answer: `\`\`\`python
# 思路：二维 DP 或贪心
# 时间 O(m·n)，空间 O(m·n) 可优化
# 关键：* 匹配任意序列（含空）

def is_wildcard_match(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 1]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i - 1][j] or dp[i][j - 1]
            elif p[j - 1] == '?' or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]
\`\`\``,
    keyPoints: ["二维 DP", "* 匹配任意序列", "也可贪心双指针 O(1) 空间"],
    followUps: ["贪心怎么解？", "正则和通配符的区别？"],
    favorited: false,
  },
  {
    id: "algo-460",
    nodeId: "p3-bytedance-tencent",
    question: "460. LFU 缓存（LeetCode 460）\n设计 O(1) 的 LFU 缓存。",
    answer: `\`\`\`python
# 思路：key→节点哈希 + freq→双向链表哈希，同频率内新节点在头（LRU）
# 时间 O(1) 每操作，空间 O(capacity)
# 关键：minFreq 指针——get/put 命中时节点频率 +1 并移到新链表头部；
#       旧频率链表空了且等于 minFreq 时 minFreq++；put 新节点时 minFreq 重置为 1

class _Node:
    __slots__ = ('key', 'val', 'freq', 'prev', 'next')
    def __init__(self, key: int = 0, val: int = 0, freq: int = 1):
        self.key = key
        self.val = val
        self.freq = freq
        self.prev: '_Node | None' = None
        self.next: '_Node | None' = None

class _FreqList:
    def __init__(self) -> None:
        self.head = _Node()   # 哨兵
        self.tail = _Node()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.size = 0
    def add_to_head(self, n: '_Node') -> None:
        n.prev = self.head
        n.next = self.head.next
        self.head.next.prev = n   # type: ignore[union-attr]
        self.head.next = n
        self.size += 1
    def remove(self, n: '_Node') -> None:
        n.prev.next = n.next       # type: ignore[union-attr]
        n.next.prev = n.prev       # type: ignore[union-attr]
        self.size -= 1
    def remove_tail(self) -> '_Node':
        n = self.tail.prev         # type: ignore[assignment]
        self.remove(n)
        return n

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.min_freq = 0
        self.key_to_node: dict[int, _Node] = {}
        self.freq_to_list: dict[int, _FreqList] = {}
    # touch：节点频率 +1，从旧频率链表摘出、插入新频率链表头部
    def _touch(self, n: '_Node') -> None:
        old = self.freq_to_list[n.freq]
        old.remove(n)
        if old.size == 0 and n.freq == self.min_freq:
            self.min_freq += 1
        n.freq += 1
        if n.freq not in self.freq_to_list:
            self.freq_to_list[n.freq] = _FreqList()
        self.freq_to_list[n.freq].add_to_head(n)
    def get(self, key: int) -> int:
        n = self.key_to_node.get(key)
        if n is None:
            return -1
        self._touch(n)
        return n.val
    def put(self, key: int, val: int) -> None:
        if self.cap == 0:
            return
        n = self.key_to_node.get(key)
        if n is not None:
            n.val = val
            self._touch(n)
            return
        if len(self.key_to_node) == self.cap:  # 淘汰 min_freq 链表尾部（最久未用）
            victim = self.freq_to_list[self.min_freq].remove_tail()
            self.key_to_node.pop(victim.key)
        n = _Node(key, val, 1)
        self.key_to_node[key] = n
        if 1 not in self.freq_to_list:
            self.freq_to_list[1] = _FreqList()
        self.freq_to_list[1].add_to_head(n)
        self.min_freq = 1  # 新节点插入后最小频率必为 1
\`\`\``,
    keyPoints: ["频率→双向链表", "key→节点哈希", "同频率内 LRU"],
    followUps: ["LRU 和 LFU 的区别？", "如何 O(1) 维护 minFreq？"],
    favorited: false,
  },
  {
    id: "algo-466",
    nodeId: "p3-bytedance-tencent",
    question: "466. 统计重复个数（LeetCode 466）\n求 S 在 [s1, n1] 次重复后的串中作为 [s2, n2] 出现的最大次数。",
    answer: `\`\`\`python
# 思路：模拟 + 循环节检测 + 数学跳跃（纯模拟 O(n1·|s1|) 在 n1≤10^6 时必 TLE）
# 时间 O(|s1|·|s2|)：idx2 最多 |s2| 种取值，|s2| 轮内必出现重复状态进入跳跃；空间 O(|s2|)
# 关键：记录每轮结束时的 (idx2, count)，状态重复即找到循环节，剩余轮数用乘法跳过

def get_max_repetitions(s1: str, n1: int, s2: str, n2: int) -> int:
    idx2, count = 0, 0                  # idx2: s2 匹配到的位置；count: 已完整匹配 s2 的次数
    recall: dict[int, tuple[int, int]] = {}  # idx2 -> 该状态首次出现时的 (count, round)
    round_ = 0
    while round_ < n1:
        round_ += 1
        for ch in s1:
            if ch == s2[idx2]:
                idx2 += 1
                if idx2 == len(s2):
                    idx2 = 0
                    count += 1
        if idx2 in recall:
            # 找到循环节：每 cycle_round 轮 s1 可多匹配 cycle_count 个 s2
            prev_count, prev_round = recall[idx2]
            cycle_round = round_ - prev_round
            cycle_count = count - prev_count
            jump = (n1 - round_) // cycle_round
            count += jump * cycle_count
            round_ += jump * cycle_round
            recall = {}                  # 跳跃后剩余不足一个周期，无需再检测
        else:
            recall[idx2] = (count, round_)
    return count // n2
\`\`\``,
    keyPoints: ["模拟匹配", "找循环节优化", "统计匹配次数"],
    followUps: ["n1 很大怎么优化？", "循环节怎么找？"],
    favorited: false,
  },
  {
    id: "algo-316",
    nodeId: "p3-bytedance-tencent",
    question: "316. 去除重复字母（LeetCode 316）\n使字符串只含每个字母一次且字典序最小。",
    answer: `\`\`\`python
# 思路：单调栈 + 计数
# 时间 O(n)，空间 O(26)
# 关键：栈顶比当前大且后面还有则弹出

def remove_duplicate_letters(s: str) -> str:
    last_occur = [0] * 26
    for i, ch in enumerate(s):
        last_occur[ord(ch) - ord('a')] = i
    stack: list[str] = []
    in_stack = [False] * 26
    for i, ch in enumerate(s):
        idx = ord(ch) - ord('a')
        if in_stack[idx]:
            continue
        while stack and stack[-1] > ch and last_occur[ord(stack[-1]) - ord('a')] > i:
            in_stack[ord(stack.pop()) - ord('a')] = False
        stack.append(ch)
        in_stack[idx] = True
    return ''.join(stack)
\`\`\``,
    keyPoints: ["单调栈", "记录最后出现位置", "栈内标记去重"],
    followUps: ["去掉重复使字典序最小？", "允许保留 K 个重复？"],
    favorited: false,
  },
  {
    id: "algo-402",
    nodeId: "p3-bytedance-tencent",
    question: "402. 移掉 K 位数字（LeetCode 402）\n移除 K 个数字使剩余数最小。",
    answer: `【思路推导】
要让剩下的数最小，高位必须尽可能小。从左到右扫描，若当前位比左边某位小，删掉左边那个较大的总更优——这是贪心。用单调递增栈维护结果：新数字入栈前，只要删除额度 k 没用完且栈顶比它大，就弹栈并 k 减一；扫完若 k 仍有剩（说明序列本身递增），从末尾继续删。最后去掉前导零，空串返回 "0"。每位最多入栈出栈各一次，时间 O(n)，空间 O(n)。
【代码实现】
\`\`\`python
def remove_k_digits(num: str, k: int) -> str:
    stack: list[str] = []
    for ch in num:
        while k > 0 and stack and stack[-1] > ch:
            stack.pop()
            k -= 1
        stack.append(ch)
    while k > 0:
        stack.pop()
        k -= 1
    i = 0
    while i < len(stack) and stack[i] == '0':
        i += 1
    res = ''.join(stack[i:])
    return res if res else '0'
\`\`\`
【实际应用】
单调栈处理局部删除最优问题：股价前后最近更低价、编译器表达式化简、遮挡剔除、直方图最大矩形。
【踩坑与变体】
三大坑：递增序列导致 k 没用完、前导零没清理、全删光忘记返回 "0"。变体：LeetCode 321 拼接最大数需两数组各自单调栈取子序列再归并；保留 k 位最大把栈方向反过来；LeetCode 1673 是同款贪心。`,
    keyPoints: ["贪心：靠左的较大位优先删，单调递增栈实现","每位最多进出栈一次，时间 O(n)","三处收尾：剩余 k 从尾删、去前导零、空串返回 0","LeetCode 321/1673 为同族变体"],
    followUps: ["如果改成保留 K 位使结果最大，单调栈要怎么改？","两个数组各取若干位拼成最大数（LeetCode 321）如何复用本题思路？"],
    favorited: false,
  },
  {
    id: "algo-321",
    nodeId: "p3-bytedance-tencent",
    question: "321. 拼接最大数（LeetCode 321）\n从两个数组中取 k 个数保持相对顺序，拼成最大数。",
    answer: `\`\`\`python
# 思路：枚举 i 个从 nums1，k-i 个从 nums2，分别取最大子序列再合并
# 时间 O(k·(m+n))，空间 O(k)
# 关键：单调栈取最大子序列 + 合并两个最大序列

def max_number(nums1: list[int], nums2: list[int], k: int) -> list[int]:
    res: list[int] = []
    for i in range(k + 1):
        if i > len(nums1) or k - i > len(nums2):
            continue
        merged = merge(max_subsequence(nums1, i), max_subsequence(nums2, k - i))
        if greater(merged, res):
            res = merged
    return res

# max_subsequence：单调栈取长度为 k、保持相对顺序的最大子序列
# drop 记录还能丢弃几个元素，栈顶小于当前元素时弹出
def max_subsequence(nums: list[int], k: int) -> list[int]:
    drop = len(nums) - k
    stack: list[int] = []
    for x in nums:
        while drop > 0 and stack and stack[-1] < x:
            stack.pop()
            drop -= 1
        stack.append(x)
    return stack[:k]

# merge：贪心合并，每步从"剩余字典序更大"的序列取头元素
# 注意：两序列当前元素相等时不能随意取，必须向后比较第一个不同元素，
#       例如 a=[6,7], b=[6,0,4]，取 a 的 6 后面跟 7 更优
def merge(a: list[int], b: list[int]) -> list[int]:
    res: list[int] = []
    while a or b:
        if greater(a, b):
            res.append(a.pop(0))
        else:
            res.append(b.pop(0))
    return res

# greater：字典序比较 a > b（前缀相等时剩余更长的更大）
def greater(a: list[int], b: list[int]) -> bool:
    for x, y in zip(a, b):
        if x != y:
            return x > y
    return len(a) > len(b)
\`\`\``,
    keyPoints: ["枚举分配数量", "单调栈取最大子序列", "贪心合并"],
    followUps: ["最大子序列怎么取？", "合并时相同前缀怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-8",
    nodeId: "p3-bytedance-tencent",
    question: "8. 字符串转整数 atoi（LeetCode 8）\n实现 myAtoi，处理空格/符号/溢出。",
    answer: `\`\`\`python
# 思路：状态机或逐字符处理
# 时间 O(n)，空间 O(1)
# 关键：跳空格-判符号-累数字-判溢出

def my_atoi(s: str) -> int:
    i, n = 0, len(s)
    while i < n and s[i] == ' ':
        i += 1
    sign = 1
    if i < n and s[i] in '+-':
        if s[i] == '-':
            sign = -1
        i += 1
    res = 0
    INT_MAX = 2 ** 31 - 1
    INT_MIN = -2 ** 31
    while i < n and s[i].isdigit():
        digit = ord(s[i]) - ord('0')
        if res > INT_MAX // 10 or (res == INT_MAX // 10 and digit > 7):
            return INT_MAX if sign == 1 else INT_MIN
        res = res * 10 + digit
        i += 1
    return sign * res
\`\`\``,
    keyPoints: ["跳空格-判符号-累数字", "溢出截断", "状态机思想"],
    followUps: ["用状态机怎么实现？", "处理十六进制？"],
    favorited: false,
  },
  {
    id: "algo-43",
    nodeId: "p3-bytedance-tencent",
    question: "43. 字符串相乘（LeetCode 43）\n给定两个非负整数字符串，返回乘积字符串。",
    answer: `\`\`\`python
# 思路：模拟竖式乘法
# 时间 O(m·n)，空间 O(m+n)
# 关键：num1[i]*num2[j] 结果放在 res[i+j] 和 res[i+j+1]

def multiply(num1: str, num2: str) -> str:
    m, n = len(num1), len(num2)
    res = [0] * (m + n)
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            mul = (ord(num1[i]) - ord('0')) * (ord(num2[j]) - ord('0'))
            p1, p2 = i + j, i + j + 1
            total = mul + res[p2]
            res[p2] = total % 10
            res[p1] += total // 10
    out: list[str] = []
    for d in res:
        if not (len(out) == 0 and d == 0):
            out.append(str(d))
    return ''.join(out) if out else '0'
\`\`\``,
    keyPoints: ["竖式乘法", "结果放 i+j 和 i+j+1", "去前导零"],
    followUps: ["大数加法怎么解？", "大数除法？"],
    favorited: false,
  },
  {
    id: "algo-297",
    nodeId: "p3-bytedance-tencent",
    question: "297. 二叉树序列化与反序列化（LeetCode 297）\n设计序列化和反序列化二叉树的算法。",
    answer: `\`\`\`python
# 思路：前序遍历 + null 标记
# 时间 O(n)，空间 O(n)
# 关键：用特殊字符标记 null

class TreeNode:
    def __init__(self, val: int = 0, left: 'TreeNode | None' = None, right: 'TreeNode | None' = None):
        self.val = val
        self.left = left
        self.right = right

def serialize(root: 'TreeNode | None') -> str:
    if root is None:
        return '#,'
    return str(root.val) + ',' + serialize(root.left) + serialize(root.right)

def deserialize(data: str) -> 'TreeNode | None':
    vals = data.split(',')
    it = iter(vals)
    def build() -> 'TreeNode | None':
        v = next(it)
        if v == '#':
            return None
        node = TreeNode(int(v))
        node.left = build()
        node.right = build()
        return node
    return build()
\`\`\``,
    keyPoints: ["前序遍历", "null 用 # 标记", "递归重建"],
    followUps: ["层序序列化怎么解？", "如何压缩？"],
    favorited: false,
  },
  {
    id: "algo-301",
    nodeId: "p3-bytedance-tencent",
    question: "301. 删除无效括号（LeetCode 301）\n删除最少括号使字符串有效，返回所有可能结果。",
    answer: `\`\`\`python
# 思路：BFS 逐层删除检查
# 时间 O(2^n)，空间 O(n)
# 关键：BFS 保证最少删除

def is_valid_parentheses(s: str) -> bool:
    bal = 0
    for ch in s:
        if ch == '(':
            bal += 1
        elif ch == ')':
            bal -= 1
            if bal < 0:
                return False
    return bal == 0

def remove_invalid_parentheses(s: str) -> list[str]:
    visited: set[str] = set()
    res: list[str] = []
    queue = [s]
    found = False
    while queue and not found:
        size = len(queue)
        for _ in range(size):
            cur = queue.pop(0)
            if cur in visited:
                continue
            visited.add(cur)
            if is_valid_parentheses(cur):
                res.append(cur)
                found = True
            if found:
                continue
            for j, ch in enumerate(cur):
                if ch not in '()':
                    continue
                queue.append(cur[:j] + cur[j + 1:])
    return res
\`\`\``,
    keyPoints: ["BFS 逐层删除", "找到即停止", "去重"],
    followUps: ["DFS 怎么解？", "如何优化？"],
    favorited: false,
  },
  {
    id: "algo-37",
    nodeId: "p3-bytedance-tencent",
    question: "37. 解数独（LeetCode 37）\n解 9×9 数独，保证有唯一解。",
    answer: `\`\`\`python
# 思路：回溯 + 约束剪枝
# 时间 O(9^空格数)，空间 O(9²)
# 关键：行/列/宫格三个集合去重

def solve_sudoku(board: list[list[str]]) -> None:
    rows = [[False] * 9 for _ in range(9)]
    cols = [[False] * 9 for _ in range(9)]
    boxes = [[False] * 9 for _ in range(9)]
    for i in range(9):
        for j in range(9):
            if board[i][j] != '.':
                idx = ord(board[i][j]) - ord('1')
                rows[i][idx] = True
                cols[j][idx] = True
                boxes[i // 3 * 3 + j // 3][idx] = True
    def backtrack(i: int, j: int) -> bool:
        if j == 9:
            return backtrack(i + 1, 0)
        if i == 9:
            return True
        if board[i][j] != '.':
            return backtrack(i, j + 1)
        for n in range(9):
            b = i // 3 * 3 + j // 3
            if not rows[i][n] and not cols[j][n] and not boxes[b][n]:
                board[i][j] = chr(ord('1') + n)
                rows[i][n] = True
                cols[j][n] = True
                boxes[b][n] = True
                if backtrack(i, j + 1):
                    return True
                board[i][j] = '.'
                rows[i][n] = False
                cols[j][n] = False
                boxes[b][n] = False
        return False
    backtrack(0, 0)
\`\`\``,
    keyPoints: ["回溯 + 剪枝", "行/列/宫格三个集合", "找到即停"],
    followUps: ["如何优化搜索顺序？", "N 皇后数独？"],
    favorited: false,
  },
  {
    id: "algo-51",
    nodeId: "p3-bytedance-tencent",
    question: "51. N 皇后（LeetCode 51）\n在 N×N 棋盘放 N 个皇后互不攻击，返回所有解。",
    answer: `\`\`\`python
# 思路：回溯，按行放置，列/对角线去重
# 时间 O(N!)，空间 O(N)
# 关键：三个集合去重——列、主对角线、副对角线

def solve_n_queens(n: int) -> list[list[str]]:
    res: list[list[str]] = []
    cols: set[int] = set()
    diag1: set[int] = set()
    diag2: set[int] = set()
    board = [['.'] * n for _ in range(n)]
    def backtrack(row: int) -> None:
        if row == n:
            res.append([''.join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            board[row][col] = 'Q'
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            backtrack(row + 1)
            board[row][col] = '.'
            cols.discard(col); diag1.discard(row - col); diag2.discard(row + col)
    backtrack(0)
    return res
\`\`\``,
    keyPoints: ["回溯按行放", "列+主副对角线三个集合", "主对角 row-col 副对角 row+col"],
    followUps: ["N 皇后 II 只求数量怎么解？", "数独和 N 皇后的区别？"],
    favorited: false,
  },
  {
    id: "algo-52",
    nodeId: "p3-bytedance-tencent",
    question: "52. N 皇后 II（LeetCode 52）\n返回 N 皇后的解的数量。",
    answer: `\`\`\`python
# 思路：同 51，只计数不存解
# 时间 O(N!)，空间 O(N)
# 关键：位运算优化

def total_n_queens(n: int) -> int:
    count = 0
    def solve(row: int, cols: int, diag1: int, diag2: int) -> None:
        nonlocal count
        if row == n:
            count += 1
            return
        bits = ((1 << n) - 1) & ~(cols | diag1 | diag2)
        while bits > 0:
            p = bits & (-bits)              # 取最低位 1
            solve(row + 1, cols | p, (diag1 | p) << 1, (diag2 | p) >> 1)
            bits &= bits - 1                # 清除最低位 1
    solve(0, 0, 0, 0)
    return count
\`\`\``,
    keyPoints: ["位运算优化", "cols|diag1|diag2 合并可用位", "取最低位 1 放皇后"],
    followUps: ["不用位运算怎么解？", "N 很大怎么办？"],
    favorited: false,
  },
  {
    id: "algo-124",
    nodeId: "p3-bytedance-tencent",
    question: "124. 二叉树最大路径和（LeetCode 124）\n找二叉树中任意路径的最大和。",
    answer: `【思路推导】
路径可起止于任意节点，但必须是不拐弯的链。后序遍历时对每个节点维护两个值：一是经过该节点、左右各取一条最优支链的完整路径和，用它更新全局答案；二是该节点能向上提供的单侧最大贡献，即节点值加上左右支链较大者，负支链直接舍弃取零。空节点返回零，全局最优初始为负无穷以兼容全负树。时间 O(n)，空间 O(h) 为递归栈深。
【代码实现】
\`\`\`python
class TreeNode:
    def __init__(self, val: int = 0, left: 'TreeNode | None' = None, right: 'TreeNode | None' = None):
        self.val = val
        self.left = left
        self.right = right

def max_path_sum(root: 'TreeNode | None') -> int:
    best = float('-inf')
    def gain(node: 'TreeNode | None') -> int:
        nonlocal best
        if node is None:
            return 0
        l = max(0, gain(node.left))
        r = max(0, gain(node.right))
        best = max(best, node.val + l + r)
        return node.val + max(l, r)
    gain(root)
    return best
\`\`\`
【实际应用】
树形结构的最大收益路径：组织架构中的影响力传播链、电网树状拓扑的最大负载路径、游戏技能树最优加点路线、依赖图中的关键链挖掘。
【踩坑与变体】
常见错误：把单侧贡献也拿去更新全局答案、负支链没取零、best 初始化为零导致全负树算错。变体：要求输出具体路径需额外记录端点回溯；路径必须过根时退化为根值加左右最大支链；LeetCode 543 二叉树直径是同框架的边数版本；LeetCode 687 最长同值路径也可套用。`,
    keyPoints: ["后序遍历，每节点算完整路径和更新全局、返回单侧贡献","负支链取零舍弃，单侧贡献只取左右较大者","全负树要求 best 初始为负无穷","直径/最长同值路径可复用同一后序框架"],
    followUps: ["如果要求输出取得最大和的那条路径本身，算法要怎么扩展？","路径必须经过根节点时，问题会如何简化？"],
    favorited: false,
  },

  // ===== Phase 3：阿里/美团高频（12题，跳过重题）=====
  {
    id: "algo-23",
    nodeId: "p3-ali-meituan",
    question: "23. 合并 K 个排序链表（LeetCode 23）\n合并 K 个升序链表。",
    answer: `【思路推导】
两链表归并是基本功，扩展 K 条有三路：逐条合并 O(N·K) 最差；分治两两配对层层减半 O(N·log K)；最小堆放各链表头，弹最小接结果、推进 next 入堆，同复杂度且支持流式。分治写法无需堆结构，面试优先推荐。
【代码实现】
\`\`\`python
from typing import Optional

class ListNode:
    def __init__(self, val: int = 0, next: 'Optional[ListNode]' = None):
        self.val = val
        self.next = next

def merge_k_lists(lists: list[Optional[ListNode]]) -> Optional[ListNode]:
    def mg(a: Optional[ListNode], b: Optional[ListNode]) -> Optional[ListNode]:
        if a is None:
            return b
        if b is None:
            return a
        if a.val <= b.val:
            a.next = mg(a.next, b)
            return a
        b.next = mg(a, b.next)
        return b
    if not lists:
        return None
    s = 1
    while s < len(lists):
        for i in range(0, len(lists) - s, s * 2):
            lists[i] = mg(lists[i], lists[i + s])
        s *= 2
    return lists[0]
\`\`\`
【实际应用】
多路有序归并：数据库外排、搜索倒排流合并、多机日志时序汇聚、MapReduce shuffle。
【踩坑与变体】
注意空数组与 null 输入。变体：堆写法适合流式或动态 K；LeetCode 21 两链表归并须默写；超大 K 可用败者树优化常数。`,
    keyPoints: ["分治两两归并：O(N·log K)，无需额外数据结构","最小堆写法同复杂度，适合流式与动态 K","逐条合并 O(N·K) 是典型错误示范","以 LeetCode 21 两链表归并为基础构件"],
    followUps: ["分治法和堆法的时间复杂度相同，实际工程中如何选择？","如果 K 个链表是流式动态加入的，算法要怎么调整？"],
    favorited: false,
  },
  {
    id: "algo-264",
    nodeId: "p3-ali-meituan",
    question: "264. 丑数 II（LeetCode 264）\n返回第 n 个丑数（只含 2/3/5 因子的数）。",
    answer: `【思路推导】
丑数序列从 1 开始，每个后继都是某个已有丑数乘 2、3 或 5。核心洞察：新丑数按从小到大生成，因此对每个因子维护一个指针，指向还没被该因子乘过的最小丑数。每轮取 dp[p2]*2、dp[p3]*3、dp[p5]*5 三者最小值作为下一个丑数，并把产生它的指针前移。同一值可能由多个因子同时产生（如 6=2*3），所以三个 if 并列去重而非 if-else。时间 O(n)，空间 O(n)。
【代码实现】
\`\`\`python
def nth_ugly_number(n: int) -> int:
    dp = [1] * n
    p2 = p3 = p5 = 0
    for i in range(1, n):
        v = min(dp[p2] * 2, dp[p3] * 3, dp[p5] * 5)
        dp[i] = v
        if v == dp[p2] * 2:
            p2 += 1
        if v == dp[p3] * 3:
            p3 += 1
        if v == dp[p5] * 5:
            p5 += 1
    return dp[n - 1]
\`\`\`
【实际应用】
多路归一生成单调序列的思想：推荐系统多路召回按分数合并、构建系统按依赖生成任务队列、版本号与单号递增生成器、音乐播放列表多维度混合。
【踩坑与变体】
最大坑是用 if-else 导致重复值时漏移指针，序列出现重复丑数。变体：LeetCode 313 超级丑数把因子推广为任意质数表，换指针数组即可；最小堆加 seen 集合也能解，每次弹出最小后压入三个后继，复杂度 O(n log n)；LeetCode 263 判断单个数是否丑数，循环除尽 2、3、5 看余数是否为 1。`,
    keyPoints: ["每个丑数由更小丑数乘 2/3/5 生成，三指针 DP","取三路候选最小值，并列 if 移动指针去重","时间 O(n) 空间 O(n)，优于堆的 O(n log n)","LeetCode 313 是指针数组化的直接推广"],
    followUps: ["为什么三个 if 必须并列而不能写成 if-else 链？","用最小堆求解时，如何避免同一个丑数被重复入堆？"],
    favorited: false,
  },
  {
    id: "algo-313",
    nodeId: "p3-ali-meituan",
    question: "313. 超级丑数（LeetCode 313）\n给定质数列表，返回第 n 个超级丑数。",
    answer: `【思路推导】
丑数 II 的推广：因子从固定 2、3、5 变成任意质数表 primes。为每个质数维护指针 ptr[j]，指向它还没乘过的最小丑数下标。每轮先扫所有 dp[ptr[j]]*primes[j] 取最小值作 dp[i]，再扫一遍把产生该值的指针前移去重。时间 O(n·k)，k 为质数个数，空间 O(n+k)。
【代码实现】
\`\`\`python
def nth_super_ugly_number(n: int, primes: list[int]) -> int:
    dp = [1] * n
    ptr = [0] * len(primes)
    for i in range(1, n):
        v = min(dp[ptr[j]] * primes[j] for j in range(len(primes)))
        dp[i] = v
        for j in range(len(primes)):
            if dp[ptr[j]] * primes[j] == v:
                ptr[j] += 1
    return dp[n - 1]
\`\`\`
【实际应用】
多指针协同生成单调序列：多版本数据按时间戳归并、分布式日志全局序合并、电商多仓发货优先级调度。
【踩坑与变体】
去重扫描不可省，两趟循环也不能合并，否则指针前移时机错。变体：k 大时用最小堆存（值, 下标），弹最小后只推进对应指针，降到 O(n·log k)；LeetCode 1201 用二分加容斥，注意区分题型。`,
    keyPoints: ["丑数 II 的推广：每个质数一个指针的指针数组","先取最小值再统一前移产生它的指针，去重不可省","时间 O(n·k)，k 大时可用堆降到 O(n·log k)","与 LeetCode 1201 的二分容斥思路区分"],
    followUps: ["当质数表很长时，如何用最小堆把每轮取最小值优化到 O(log k)？","LeetCode 1201 为什么不能用多指针而要用二分加容斥？"],
    favorited: false,
  },
  {
    id: "algo-279",
    nodeId: "p3-ali-meituan",
    question: "279. 完全平方数（LeetCode 279）\n找和为 n 的最少完全平方数个数。",
    answer: `【思路推导】
把 n 看作背包容量、完全平方数看作物品，就是完全背包求最少物品数：dp[i] 表示和为 i 所需的最少平方数个数，转移 dp[i] = min(dp[i-j*j]) + 1，j 枚举所有不超过根号 i 的整数。另一视角是图论：n 到 0 每步跳一个平方数，BFS 首达 0 的层数即答案。数学上拉格朗日四平方定理保证答案不超过 4，配合勒让德三平方定理可直接分类加速。DP 版时间 O(n·sqrt n)，空间 O(n)。
【代码实现】
\`\`\`python
def num_squares(n: int) -> int:
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = i
        j = 1
        while j * j <= i:
            dp[i] = min(dp[i], dp[i - j * j] + 1)
            j += 1
    return dp[n]
\`\`\`
【实际应用】
最少量组合覆盖问题：硬币找零最少张数、排版系统最少拼版次数、云资源按规格组合覆盖需求的成本优化、图像压缩中的块划分。
【踩坑与变体】
求个数时内外层循环顺序无所谓，但求方案数时顺序决定是否把排列算重。变体：LeetCode 322 零钱兑换是同一模板；LeetCode 518 零钱兑换 II 求组合总数必须物品在外层循环；四平方定理数学解先判完全平方数返回 1，再判 4^a*(8b+7) 型返回 4，再枚举两平方和，否则返回 3，可压到 O(sqrt n)。`,
    keyPoints: ["完全背包模型：dp[i]=min(dp[i-j*j])+1","BFS 视角等价于 n 到 0 的最短路径","四平方定理给出答案上界 4，可数学分类加速","与零钱兑换系列共用模板，注意计数类循环顺序"],
    followUps: ["如何用四平方定理把解法优化到 O(根号 n)？","BFS 解法的状态图长什么样，为什么首达即最优？"],
    favorited: false,
  },
  {
    id: "algo-127",
    nodeId: "p3-ali-meituan",
    question: "127. 单词接龙（LeetCode 127）\n从 beginWord 到 endWord 最短转换序列长度，每次改一个字母。",
    answer: `\`\`\`python
# 思路：BFS，逐层变换
# 时间 O(n·L²)，空间 O(n·L)
# 关键：BFS 求最短路径

def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    word_set = set(word_list)
    if end_word not in word_set:
        return 0
    queue = [begin_word]
    level = 1
    while queue:
        size = len(queue)
        for _ in range(size):
            word = queue.pop(0)
            if word == end_word:
                return level
            for j in range(len(word)):
                for k in range(26):
                    ch = chr(ord('a') + k)
                    new_word = word[:j] + ch + word[j + 1:]
                    if new_word in word_set:
                        word_set.discard(new_word)
                        queue.append(new_word)
        level += 1
    return 0
\`\`\``,
    keyPoints: ["BFS 最短路径", "逐字符变换", "访问过即删除"],
    followUps: ["双向 BFS 怎么优化？", "单词接龙 II 返回所有路径？"],
    favorited: false,
  },
  {
    id: "algo-126",
    nodeId: "p3-ali-meituan",
    question: "126. 单词接龙 II（LeetCode 126）\n返回所有最短转换序列。",
    answer: `\`\`\`python
# 思路：BFS 分层建有向图 + DFS 回溯所有最短路径
# 时间 O(n·26·L²)，空间 O(n·L)
# 关键：每层开始前先把本层词从 wordSet 删除，杜绝同层连边；
#       children 只记录指向下一层的边，DFS 沿图走天然无环

def find_ladders(begin_word: str, end_word: str, word_list: list[str]) -> list[list[str]]:
    res: list[list[str]] = []
    word_set = set(word_list)
    if end_word not in word_set:
        return res
    # 1. BFS 建图：children[x] = x 在下一层的所有邻居
    children: dict[str, list[str]] = {}
    queue = [begin_word]
    found = False
    while queue and not found:
        for w in queue:
            word_set.discard(w)        # 本层词先删
        nxt: set[str] = set()
        for word in queue:
            for i in range(len(word)):
                for k in range(26):
                    ch = chr(ord('a') + k)
                    if ch == word[i]:
                        continue
                    nb = word[:i] + ch + word[i + 1:]
                    if nb in word_set:
                        children.setdefault(word, []).append(nb)
                        nxt.add(nb)
                        if nb == end_word:
                            found = True
        queue = list(nxt)
    # 2. DFS 回溯：沿 children 从 beginWord 走到 endWord
    path = [begin_word]
    def dfs(word: str) -> None:
        if word == end_word:
            res.append(path[:])
            return
        for nb in children.get(word, []):
            path.append(nb)
            dfs(nb)
            path.pop()
    dfs(begin_word)
    return res
\`\`\``,
    keyPoints: ["BFS 建图", "DFS 回溯所有路径", "避免重复访问"],
    followUps: ["如何避免超时？", "双向 BFS 优化？"],
    favorited: false,
  },
  {
    id: "algo-773",
    nodeId: "p3-ali-meituan",
    question: "773. 滑动谜题（LeetCode 773）\n解 2×3 滑动拼图，返回最少移动步数。",
    answer: `\`\`\`python
# 思路：BFS，状态用字符串编码
# 时间 O(6!)，空间 O(6!)
# 关键：BFS 求最短路径，状态编码去重

def sliding_puzzle(board: list[list[int]]) -> int:
    target = '123450'
    start = ''.join(str(board[i][j]) for i in range(2) for j in range(3))
    moves = [[1, 3], [0, 2, 4], [1, 5], [0, 4], [1, 3, 5], [2, 4]]
    queue = [start]
    visited = {start}
    step = 0
    while queue:
        size = len(queue)
        for _ in range(size):
            cur = queue.pop(0)
            if cur == target:
                return step
            zero = cur.index('0')
            for nxt in moves[zero]:
                b = list(cur)
                b[zero], b[nxt] = b[nxt], b[zero]
                s = ''.join(b)
                if s not in visited:
                    visited.add(s)
                    queue.append(s)
        step += 1
    return -1
\`\`\``,
    keyPoints: ["BFS 最短路径", "状态编码为字符串", "预计算可移动位置"],
    followUps: ["A* 怎么优化？", "3×3 滑动谜题？"],
    favorited: false,
  },
  {
    id: "algo-212",
    nodeId: "p3-ali-meituan",
    question: "212. 单词搜索 II（LeetCode 212）\n在二维字母板中找所有字典中存在的单词。",
    answer: `\`\`\`python
# 思路：Trie + DFS 回溯
# 时间 O(m·n·4^L)，空间 O(字典大小)
# 关键：Trie 存字典，DFS 搜索时沿 Trie 走
# 注意：需在 algo-208 的 Trie 节点上扩展 word 字段，
#       Insert 时在结尾节点记录完整单词，命中时 O(1) 取词，无需回溯拼接路径

class TrieNode:
    def __init__(self):
        self.children: list['TrieNode | None'] = [None] * 26
        self.is_end = False
        self.word = ''

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, w: str) -> None:
        node = self.root
        for ch in w:
            idx = ord(ch) - ord('a')
            if node.children[idx] is None:
                node.children[idx] = TrieNode()
            node = node.children[idx]   # type: ignore[assignment]
        node.is_end = True
        node.word = w                    # 末尾需 node.word = w

def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    trie = Trie()
    for w in words:
        trie.insert(w)
    m, n = len(board), len(board[0])
    res: list[str] = []
    def dfs(i: int, j: int, node: TrieNode) -> None:
        if i < 0 or i >= m or j < 0 or j >= n or board[i][j] == '#':
            return
        idx = ord(board[i][j]) - ord('a')
        if idx < 0 or idx >= 26 or node.children[idx] is None:
            return
        node = node.children[idx]       # type: ignore[assignment]
        if node.is_end:
            res.append(node.word)
            node.is_end = False          # 去重
        tmp = board[i][j]
        board[i][j] = '#'
        dfs(i + 1, j, node); dfs(i - 1, j, node)
        dfs(i, j + 1, node); dfs(i, j - 1, node)
        board[i][j] = tmp
    for i in range(m):
        for j in range(n):
            dfs(i, j, trie.root)
    return res
\`\`\``,
    keyPoints: ["Trie + DFS", "沿 Trie 走避免无效搜索", "找到后标记避免重复"],
    followUps: ["不用 Trie 怎么解？", "如何优化剪枝？"],
    favorited: false,
  },
  {
    id: "algo-289",
    nodeId: "p3-ali-meituan",
    question: "289. 生命游戏（LeetCode 289）\n原地更新生命游戏下一代状态。",
    answer: `\`\`\`python
# 思路：用二进制位记录新旧状态
# 时间 O(m·n)，空间 O(1)
# 关键：低位=旧状态，高位=新状态

def game_of_life(board: list[list[int]]) -> None:
    m, n = len(board), len(board[0])
    for i in range(m):
        for j in range(n):
            live = 0
            for x in (-1, 0, 1):
                for y in (-1, 0, 1):
                    if x == 0 and y == 0:
                        continue
                    ni, nj = i + x, j + y
                    if 0 <= ni < m and 0 <= nj < n and board[ni][nj] & 1 == 1:
                        live += 1
            if board[i][j] == 1 and (live == 2 or live == 3):
                board[i][j] |= 2
            if board[i][j] == 0 and live == 3:
                board[i][j] |= 2
    for i in range(m):
        for j in range(n):
            board[i][j] >>= 1
\`\`\``,
    keyPoints: ["二进制位存新旧状态", "低位旧高位新", "最后右移取新状态"],
    followUps: ["无限棋盘怎么解？", "多代更新？"],
    favorited: false,
  },
  {
    id: "algo-309",
    nodeId: "p3-ali-meituan",
    question: "309. 买卖股票含冷冻期（LeetCode 309）\n卖后有一天冷冻期，求最大利润。",
    answer: `【思路推导】
每天结束后只可能处于三种状态之一：持股 hold、当天刚卖出进入冷冻 sold、空仓且可买 rest。转移：hold 来自继续持有或从 rest 买入（sold 后隔天不可买）；sold 只能由 hold 当天卖出得到；rest 来自继续空仓或由 sold 解冻而来。三个变量滚动更新，关键是当天所有转移必须基于前一天的旧值，更新前先暂存。时间 O(n)，空间 O(1)。
【代码实现】
\`\`\`python
def max_profit(prices: list[int]) -> int:
    hold, sold, rest = -prices[0], 0, 0
    for i in range(1, len(prices)):
        ph, ps = hold, sold
        hold = max(ph, rest - prices[i])
        sold = ph + prices[i]
        rest = max(rest, ps)
    return max(sold, rest)
\`\`\`
【实际应用】
状态机 DP 描述受限交易：A 股 T+1 正是真实冷冻期，量化回测要照此建模；游戏技能冷却循环的输出规划；工厂设备启停有冷却的排产优化；限流器令牌恢复策略。
【踩坑与变体】
最易错的是转移用了当天新值导致结果虚高，必须先存旧值；答案不能取 hold，收盘时持股不算收益。变体：LeetCode 714 加手续费，卖出时减 fee 即可；LeetCode 123/188 限制交易次数需加一维次数状态；LeetCode 122 无限次无冷冻，两状态足够。状态机画图是股票系列通杀的第一步。`,
    keyPoints: ["三状态机：持股/刚卖出冷冻/空仓可买","转移必须基于前一天旧值，先暂存再更新","答案取 max(sold, rest)，收盘持股无收益","状态机画图是股票 DP 系列的通用套路"],
    followUps: ["如果冷冻期从一天变成 K 天，状态机要怎么扩展？","同时含冷冻期和手续费时，转移方程如何合并？"],
    favorited: false,
  },
  {
    id: "algo-714",
    nodeId: "p3-ali-meituan",
    question: "714. 买卖股票含手续费（LeetCode 714）\n每次卖出有手续费，求最大利润。",
    answer: `【思路推导】
无限次交易，唯一区别是每次卖出付手续费 fee。两个状态滚动：hold 表示当前持股的最大净收益，cash 表示当前空仓的最大净收益。每天 hold 取继续持有与用昨天 cash 买入的较大者；cash 取继续空仓与昨天 hold 卖出并扣 fee 的较大者。fee 扣在卖出侧或买入侧等价，全程只扣一次即可。时间 O(n)，空间 O(1)。
【代码实现】
\`\`\`python
def max_profit(prices: list[int], fee: int) -> int:
    hold = -prices[0]
    cash = 0
    for i in range(1, len(prices)):
        ph = hold
        hold = max(ph, cash - prices[i])
        cash = max(cash, ph + prices[i] - fee)
    return cash
\`\`\`
【实际应用】
含交易成本的策略建模：量化回测中的佣金与印花税、跨境电商含汇损的套利计算、游戏拍卖行手续费下的倒卖收益估算、含迁移成本的云资源调度。
【踩坑与变体】
手续费必须全程只扣一次，买卖两侧都扣会低估收益；注意 hold 的更新要用昨天的 cash 而非当天新 cash（本题因同一天买卖无意义，顺序写错有时不暴露，但含冷冻期版本必错）。变体：LeetCode 309 加冷冻期需第三状态；LeetCode 188 限 K 次交易，用两个长度 K 的数组滚动；贪心写法把 fee 计入买入价遇涨即卖，思路绕、面试不推荐首选。`,
    keyPoints: ["两状态 DP：持股 hold 与空仓 cash","卖出时一次性扣除手续费，买卖侧等价","时间 O(n) 空间 O(1)，可在线滚动处理","与 309/122/188 同属状态机股票系列"],
    followUps: ["手续费改成按交易金额的比例收取，DP 方程要怎么改？","限 K 次交易且含手续费时，状态设计如何组合两个维度？"],
    favorited: false,
  },
  {
    id: "algo-310",
    nodeId: "p3-ali-meituan",
    question: "310. 最小高度树（LeetCode 310）\n找以哪些节点为根时树的高度最小。",
    answer: `\`\`\`python
# 思路：拓扑排序，逐层剥叶子
# 时间 O(n)，空间 O(n)
# 关键：从叶子（度=1）开始剥，最后 1-2 个即答案
def find_min_height_trees(n: int, edges: list[list[int]]) -> list[int]:
    if n == 1:
        return [0]
    graph: list[set[int]] = [set() for _ in range(n)]
    for a, b in edges:
        graph[a].add(b)
        graph[b].add(a)
    leaves = [i for i in range(n) if len(graph[i]) == 1]
    while n > 2:
        n -= len(leaves)
        new_leaves: list[int] = []
        for leaf in leaves:
            for neighbor in list(graph[leaf]):
                graph[neighbor].discard(leaf)
                if len(graph[neighbor]) == 1:
                    new_leaves.append(neighbor)
        leaves = new_leaves
    return leaves
\`\`\``,
    keyPoints: ["拓扑排序剥叶子", "最后剩 1-2 个节点", "类似 BFS 从外向内"],
    followUps: ["为什么最多 2 个？", "DFS 怎么解？"],
    favorited: false,
  },
  // ===== Phase 2 新增：位运算与数学（6题）=====
  {
    id: "algo-2001",
    nodeId: "p2-bit-math",
    question: "136. 只出现一次的数字（LeetCode 136）\n数组中除一个元素只出现一次外，其余都出现两次，找出那个只出现一次的元素。要求 O(n) 时间、O(1) 空间。",
    bigTech: true,
    answer: `【思路推导】哈希集合能 O(n) 找出单身元素，但要 O(n) 空间。O(1) 空间的关键洞察是异或（XOR）的三个性质：a^a=0（相同抵消）、a^0=a、异或满足交换律和结合律。把数组全部元素异或一遍，成对的元素两两抵消成 0，0 再与单身元素异或就是它本身。这就像「消消乐」——不关心顺序，成对即消。
【代码实现】
\`\`\`python
def single_number(nums: list[int]) -> int:
    ans = 0
    for x in nums:
        ans ^= x  # 成对抵消，最后剩单身
    return ans  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】异或消消乐在工程里是「无状态对账」思想：RAID 磁盘阵列用异或做奇偶校验，一块盘坏了用其余盘异或恢复数据；P2P 传输用异或校验块完整性；分布式系统比较两份数据差异时用异或指纹快速定位。面试官真正想考的是你能否把「成对抵消」抽象成位运算模型。
【踩坑与变体】① 前提是「其余恰好出现两次」，出现三次就失效（变体 LeetCode 137 要用位计数或状态机）；② 两个单身元素的变体 LeetCode 260：全体异或得到 a^b，取 lowbit 位把数组分成两组分别异或；③ 异或结果不为 0 时才能用 lowbit 分组，注意边界。`,
    keyPoints: ["a^a=0、a^0=a、交换律结合律", "全体异或成对抵消", "O(1) 空间换思维深度", "lowbit 分组解两个单身元素"],
    followUps: ["如果其余元素都出现三次，如何用位计数找单身元素（LeetCode 137）？", "两个只出现一次的元素如何用 lowbit 分组异或求出（LeetCode 260）？"],
    favorited: false,
  },
  {
    id: "algo-2002",
    nodeId: "p2-bit-math",
    question: "191. 位1的个数（LeetCode 191）\n输入一个无符号整数，返回它二进制表示中 1 的个数（汉明重量）。",
    bigTech: false,
    answer: `【思路推导】逐位检查：循环 32 次，每次 n&1 取最低位再右移，O(32)。更优雅的是 n&(n-1) 技巧——n-1 会把 n 最低位的 1 变成 0、其后的 0 全变 1，再与 n 相与恰好消掉最低位的 1。每执行一次 n &= n-1 就消掉一个 1，循环次数等于 1 的个数，最坏 O(32) 但平均远小于逐位法。
【代码实现】
\`\`\`python
def hamming_weight(n: int) -> int:
    count = 0
    while n != 0:
        n &= n - 1  # 消掉最低位的 1
        count += 1
    return count  # 时间 O(popcount)，空间 O(1)
\`\`\`
【实际应用】汉明重量是信息论基础操作：布隆过滤器用它统计位数组密度评估误判率；汉明距离（两数异或后的汉明重量）用于相似图片检索 pHash、编辑距离近似；CPU 指令集 POPCNT 一条指令完成，JDK 的 Integer.bitCount 直接映射它。位图索引（Roaring Bitmap）的基数统计也依赖它。
【踩坑与变体】① JS 的位运算把数当 32 位有符号处理，负数右移用 >>> 无符号右移；② 逐位法写成 n>>1 会在负数上死循环；③ 变体 LeetCode 338「比特位计数」用 DP：dp[i]=dp[i&(i-1)]+1，正是 n&(n-1) 思想的递推化。`,
    keyPoints: ["n&(n-1) 消掉最低位的 1", "循环次数 = 1 的个数", "JS 注意 >>> 无符号右移", "POPCNT 硬件指令"],
    followUps: ["如何用 dp[i]=dp[i&(i-1)]+1 在 O(n) 求出 0~n 所有数的比特位计数？", "汉明距离如何用在 pHash 相似图片检索中？"],
    favorited: false,
  },
  {
    id: "algo-2003",
    nodeId: "p2-bit-math",
    question: "50. Pow(x, n)（LeetCode 50）\n实现 pow(x, n)，即 x 的 n 次幂，n 是整数（可负）。",
    bigTech: true,
    answer: `【思路推导】暴力解连乘 n 次 O(n)，n 到 2^31 必然超时。快速幂把指数按二进制拆分：x^13 = x^(1101b) = x^8·x^4·x^1。从低位到高位扫描 n 的二进制位，底数每轮自乘（x→x²→x⁴→x⁸），遇到当前位为 1 就把当前底数乘进答案。指数每轮右移一位，循环次数是 O(logn)。负指数先取倒数再算正幂。
【代码实现】
\`\`\`python
def my_pow(x: float, n: int) -> float:
    ans, base, e = 1, x, abs(n)
    while e > 0:
        if e & 1:
            ans *= base  # 当前位为 1，收下这个因子
        base *= base  # 底数平方：x→x²→x⁴
        e //= 2  # 等价 e >>= 1（JS 位运算 32 位溢出坑，用除法稳妥）
    return 1 / ans if n < 0 else ans  # 时间 O(logn)，空间 O(1)
\`\`\`
【实际应用】快速幂是密码学基石：RSA 加密的 c=m^e mod n 用快速幂+取模（蒙哥马利乘法优化）实现；区块链 PoW 难度计算、斐波那契数列 O(logn) 矩阵快速幂求解、组合数取模（费马小定理求逆元）都建立在它之上。
【踩坑与变体】① JS 位运算把操作数截成 32 位，e=-2^31 取绝对值后 >> 会出错，用 Math.floor(e/2) 规避；② n=-2^31 时 Math.abs 溢出（其他语言），先转 BigInt 或用 long；③ 递归版快速幂有 O(logn) 栈深度，迭代版 O(1) 空间；④ 变体「超级次方」需逐位快速幂+取模。`,
    keyPoints: ["指数二进制拆分", "底数自乘、位为 1 才乘进答案", "O(logn) 对数复杂度", "JS 位运算 32 位截断坑"],
    followUps: ["如何用矩阵快速幂 O(logn) 求斐波那契第 n 项？", "模运算下如何结合费马小定理求除法逆元？"],
    favorited: false,
  },
  {
    id: "algo-2004",
    nodeId: "p2-bit-math",
    question: "29. 两数相除（LeetCode 29）\n不用乘法、除法和取模，实现两整数相除，结果向零取整，溢出返回 2^31-1。",
    bigTech: false,
    answer: `【思路推导】禁乘除后最直观是反复减去除数，O(商) 会超时（如 2^31/1）。倍增思想：除数不断左移翻倍（1倍、2倍、4倍…），找到「不超过被除数的最大 2^k 倍除数」，减掉它、答案加上 2^k，然后对剩余被除数重复。这本质是二进制展开的试商——商的第 k 位为 1 当且仅当剩余被除数 ≥ 除数·2^k，O(log商) 轮完成。
【代码实现】
\`\`\`python
def divide(dividend: int, divisor: int) -> int:
    INT_MAX = 2147483647
    if dividend == -2147483648 and divisor == -1:
        return INT_MAX  # 唯一溢出点
    neg = (dividend < 0) != (divisor < 0)
    a, b, ans = abs(dividend), abs(divisor), 0
    for k in range(31, -1, -1):
        # 防溢出用减法比较代替 b<<k：b*2^k <= a 等价于 b <= a>>k 不成立时用位长判断
        if (a >> k) >= b:
            ans += 2 ** k
            a -= b * 2 ** k
    return -ans if neg else ans  # 时间 O(32)，空间 O(1)
\`\`\`
【实际应用】倍增试商是计算机除法的硬件原型：CPU 除法指令就是恢复余数/不恢复余数除法，逐位试商；SRT 除法（奔腾 FDIV bug 的那个）是它的基数-4 加速版。大数运算库（如 BigInt）的除法同样是「估计商位-乘回比较-修正」的循环。
【踩坑与变体】① 溢出只有 -2^31 / -1 一种，特判即可；② 全部转负数计算是更稳的写法（负数范围比正数大 1，|−2^31| 溢出）；③ b<<k 可能整型溢出，比较时用 (a>>k)>=b 规避；④ 变体「不用加减乘除做加法」用异或+进位左移。`,
    keyPoints: ["倍增试商 = 二进制展开商", "O(log商) 轮试商", "-2^31 边界特判", "硬件除法的软件原型"],
    followUps: ["为什么转负数计算比转绝对值更安全？", "不用四则运算如何实现两数相加（位运算）？"],
    favorited: false,
  },
  {
    id: "algo-2005",
    nodeId: "p2-bit-math",
    question: "204. 计数质数（LeetCode 204）\n统计小于非负整数 n 的质数个数。",
    bigTech: false,
    answer: `【思路推导】试除法判每个数：O(n√n)，n=5×10^6 时超时。埃氏筛（Eratosthenes）反过来：从 2 开始，把每个质数的所有倍数标记为合数，剩下的就是质数。关键优化：标记倍数从 i² 开始（更小的倍数已被更小质数标过），且只需筛到 √n。复杂度 O(n·loglogn)，接近线性。每个合数只会被它的最小质因子标记（线性筛 Euler 则严格 O(n)，用「每个合数只被最小质因子筛一次」做到）。
【代码实现】
\`\`\`python
def count_primes(n: int) -> int:
    is_comp = bytearray(n)  # 0=质数 1=合数
    count = 0
    for i in range(2, n):
        if is_comp[i]:
            continue
        count += 1
        for j in range(i * i, n, i):
            is_comp[j] = 1  # 从 i² 开始标
    return count  # 时间 O(n·loglogn)，空间 O(n)
\`\`\`
【实际应用】质数筛是密码学与数论计算的入口：RSA 密钥生成需要大质数池，先做小质数预筛再用 Miller-Rabin 概率性素性测试；区块链某些 PoW（如 Primecoin）直接挖质数链；数据库分区键设计、哈希表桶长取质数减少碰撞，都依赖对素数分布的理解。
【踩坑与变体】① j 从 i² 开始，从 2i 开始会重复标记浪费一半时间；② i*i 在大 n 时溢出（其他语言用 long）；③  Uint8Array 比 boolean[] 省 8 倍内存；④ 线性筛变种：维护 primes 数组，i 与每个质数 p 相乘标记，遇到 i%p==0 立即 break，保证最小质因子唯一标记；⑤ 区间筛 [L,R] 用 √R 内质数筛偏移量。`,
    keyPoints: ["埃氏筛从 i² 开始标记", "只需筛到 √n", "O(n·loglogn) 近线性", "线性筛每合数只标一次"],
    followUps: ["线性筛如何保证每个合数只被最小质因子标记一次？", "如何对 [10^12, 10^12+10^6] 这样的区间做素数筛选？"],
    favorited: false,
  },
  {
    id: "algo-2006",
    nodeId: "p2-bit-math",
    question: "260. 只出现一次的数字 III（LeetCode 260）\n数组中恰有两个元素只出现一次，其余都出现两次，找出这两个元素。O(n) 时间、O(1) 空间。",
    bigTech: true,
    answer: `【思路推导】全体异或得到 diff = a^b（a、b 是两个单身元素）。因为 a≠b，diff 必不为 0，至少有一位是 1，而该位为 1 说明 a、b 在这一位上不同。取 diff 的 lowbit（diff & -diff，即最低位的 1），按「这一位是 0 还是 1」把数组分成两组：a、b 必分属两组，而成对元素必然同组（相同元素所有位相同）。两组各自异或，分别得到 a 和 b。
【代码实现】
\`\`\`python
def single_number(nums: list[int]) -> list[int]:
    diff = 0
    for x in nums:
        diff ^= x  # diff = a ^ b
    lowbit = diff & -diff  # 取最低位的 1 作分组标准
    a, b = 0, 0
    for x in nums:
        if (x & lowbit) == 0:
            a ^= x  # 该位为 0 的一组
        else:
            b ^= x  # 该位为 1 的一组
    return [a, b]  # 时间 O(n)，空间 O(1)
\`\`\`
【实际应用】「按某个可区分维度分治」是工程通用套路：数据库一致性哈希按虚拟节点分组定位漂移；MapReduce 按 key 哈希分桶后桶内聚合；A/B 实验按用户 ID 某一位分流。lowbit 本身还是树状数组（Fenwick Tree）的核心操作，区间求和与单点更新都靠它定位父节点。
【踩坑与变体】① lowbit 用 diff & -diff，依赖补码表示（JS 位运算自动转 32 位补码，安全）；② 分组判断用 (x & lowbit)===0 而非 ===1，lowbit 是 2 的幂、相与结果要么是 0 要么是 lowbit 本身；③ 思路可推广到「k 个单身元素」——需要 k 个线性无关的区分位；④ 姊妹题 137（出现三次）不能用此法，换位计数模 3。`,
    keyPoints: ["全体异或得 a^b", "lowbit 找可区分位", "按位分组各自异或", "lowbit 是树状数组核心"],
    followUps: ["树状数组如何利用 lowbit 实现 O(logn) 区间求和？", "如果有三个只出现一次的元素，分组异或思路要如何扩展？"],
    favorited: false,
  },
  // ===== Phase 2 新增：字符串匹配进阶（6题）=====
  {
    id: "algo-2007",
    nodeId: "p2-string-match",
    question: "28. 找出字符串中第一个匹配项的下标（LeetCode 28）\n实现 strStr：在 haystack 中找 needle 首次出现的位置，不存在返回 -1。要求用 KMP 做到 O(n+m)。",
    bigTech: true,
    answer: `【思路推导】暴力匹配每次失配都把模式串回退到起点、主串回退到 i-j+1，最坏 O(n·m)（如 aaa...ab 配 aaab）。KMP 的核心洞察：失配时主串指针 i 绝不回退，模式串指针 j 回退到 next[j]——next[j] 表示「模式串前 j 个字符中，最长相等真前后缀的长度」。因为已匹配的 j 个字符里，后缀与前缀有 next[j] 个天然重合，这部分不用重新比。预处理 next 数组同样用「自己匹配自己」的递推，O(m)，总复杂度 O(n+m)。
【代码实现】
\`\`\`python
def str_str(haystack: str, needle: str) -> int:
    m = len(needle)
    nxt = [0] * m
    j = 0
    for i in range(1, m):  # 自匹配建 next
        while j > 0 and needle[i] != needle[j]:
            j = nxt[j - 1]
        if needle[i] == needle[j]:
            j += 1
        nxt[i] = j
    j = 0
    for i in range(len(haystack)):
        while j > 0 and haystack[i] != needle[j]:
            j = nxt[j - 1]
        if haystack[i] == needle[j]:
            j += 1
        if j == m:
            return i - m + 1  # 时间 O(n+m)，空间 O(m)
    return -1
\`\`\`
【实际应用】KMP 是文本处理基础设施：grep/编辑器的查找、网络入侵检测（Snort 规则匹配报文特征串）、DNA 序列比对（AC 自动机多模式版）都用它或其变种。next 数组的「最长相等前后缀」思想还能迁移：判断字符串周期（459 题）、构造最短回文（214 题）。
【踩坑与变体】① next 数组有两种定义（next[j] 是长度还是下标），混用必错，本实现 next[i]=最长相等前后缀长度；② j=next[j-1] 的回退必须 while 循环不能 if；③ 变体 Rabin-Karp 用滚动哈希平均 O(n+m)，适合多模式；④ 多模式串匹配上 AC 自动机（KMP + Trie）。`,
    keyPoints: ["失配时主串指针不回退", "next[j] = 最长相等真前后缀长度", "预处理 O(m) 匹配 O(n)", "AC 自动机 = KMP + Trie"],
    followUps: ["为什么 next 数组的构造也是一次 KMP 自匹配？", "AC 自动机如何在 KMP 基础上结合 Trie 实现多模式匹配？"],
    favorited: false,
  },
  {
    id: "algo-2008",
    nodeId: "p2-string-match",
    question: "459. 重复的子字符串（LeetCode 459）\n判断字符串 s 是否可由它的某个子串重复多次拼接构成。",
    bigTech: false,
    answer: `【思路推导】暴力解枚举所有可能的子串长度 len（必须整除 n），逐段比较，O(n²)。两个优雅解法：① 字符串旋转性质——s 由子串重复构成 ⟺ s+s 去掉首尾字符后仍包含 s（破环成链思想的镜像）；② KMP next 数组——若 s 有周期，最小周期长度 = n - next[n-1]，且 n 能被它整除。因为 next[n-1] 是最长相等前后缀，前缀移过去的那段差就是最小重复单元。两种方法都是 O(n)。
【代码实现】
\`\`\`python
def repeated_substring_pattern(s: str) -> bool:
    n = len(s)
    nxt = [0] * n
    j = 0
    for i in range(1, n):
        while j > 0 and s[i] != s[j]:
            j = nxt[j - 1]
        if s[i] == s[j]:
            j += 1
        nxt[i] = j
    period = n - nxt[n - 1]  # 最小周期
    return nxt[n - 1] > 0 and n % period == 0  # 时间 O(n)，空间 O(n)
\`\`\`
【实际应用】周期判定在时序数据里常用：监控系统检测「日志/指标是否按固定周期抖动」（如定时任务每 5 分钟打一条重复错误）；协议分析中识别心跳包间隔；音频处理里基频检测（自相关找周期）与这是同一思想。
【踩坑与变体】① 必须验证 n % period === 0，否则 abcab 这类「有前后缀但不整除」会误判；② next[n-1]===0 说明连相等前后缀都没有，直接 false；③ (s+s).slice(1,-1).includes(s) 一行解法面试可提但要说清原理；④ 变体「找最小重复单元」直接返回 s.slice(0, period)。`,
    keyPoints: ["最小周期 = n - next[n-1]", "必须整除才构成重复", "s+s 去首尾包含 s 的等价判定", "KMP next 的迁移应用"],
    followUps: ["为什么 n - next[n-1] 就是最小周期长度？给出证明思路。", "如何用同一思想找字符串的所有周期？"],
    favorited: false,
  },
  {
    id: "algo-2009",
    nodeId: "p2-string-match",
    question: "Rabin-Karp 滚动哈希\n设计一个平均 O(n+m) 的字符串匹配算法，并说明它相比 KMP 的优势场景。",
    bigTech: false,
    answer: `【思路推导】把模式串看成一个 base 进制数算哈希 H(pattern)，主串每个长度为 m 的窗口也算哈希，相等则逐字符确认（防哈希碰撞）。朴素实现每窗口 O(m) 算哈希还是 O(n·m)。滚动哈希的关键：窗口右移一格时，新哈希 = (旧哈希 - 首字符·base^(m-1))·base + 新字符，O(1) 更新。取大质数模（如 2^31-1）防溢出，于是平均 O(n+m)。最坏情况（恶意构造碰撞）退化 O(n·m)，所以叫「平均」。
【代码实现】
\`\`\`python
def rabin_karp(s: str, p: str) -> int:
    base, mod, m = 26, (1 << 31) - 1, len(p)
    if len(s) < m:
        return -1
    ph = wh = 0
    high = 1
    for i in range(m):
        ph = (ph * base + ord(p[i])) % mod
        wh = (wh * base + ord(s[i])) % mod
        if i > 0:
            high = (high * base) % mod  # base^(m-1)
    for i in range(len(s) - m + 1):
        if wh == ph and s[i:i + m] == p:
            return i  # 哈希命中再确认
        if i + m < len(s):
            wh = ((wh - ord(s[i]) * high) * base + ord(s[i + m])) % mod
    return -1  # 平均时间 O(n+m)，空间 O(1)
\`\`\`
【实际应用】滚动哈希是「内容指纹」的鼻祖技术：rsync 文件同步用它切分变长块、只传差异块；网盘秒传（文件分块哈希比对）；抄袭检测系统（论文查重）对文档算 shingle 哈希；Git 的对象模型也用内容寻址。优势场景：多模式匹配（一次滚动比对一组模式哈希）比 KMP 更省。
【踩坑与变体】① 哈希命中必须逐字符确认，否则碰撞误判；② 取模用 2^31-1 这类梅森质数分布更均匀；③ 双哈希（两个 mod）把误判率降到可忽略；④ 变体「最长重复子串」用二分长度+滚动哈希判重，O(nlogn)。`,
    keyPoints: ["窗口哈希 O(1) 滚动更新", "哈希命中需逐字符确认", "平均 O(n+m) 最坏 O(nm)", "多模式匹配优于 KMP"],
    followUps: ["为什么双哈希能把碰撞误判率降到工程可忽略？", "如何用二分+滚动哈希求最长重复子串？"],
    favorited: false,
  },
  {
    id: "algo-2010",
    nodeId: "p2-string-match",
    question: "5. 最长回文子串（LeetCode 5）\n返回字符串中最长的回文子串。",
    bigTech: true,
    answer: `【思路推导】暴力 O(n³)：枚举所有子串再判回文。动态规划 O(n²)：dp[i][j] 表示 s[i..j] 是否回文，dp[i][j] = s[i]===s[j] && dp[i+1][j-1]，按长度递推。中心扩展更省空间：回文串必有对称中心（单字符中心对应奇数长、双字符间隙对应偶数长），共 2n-1 个中心，每个中心向两边扩展直到失配，O(n²) 时间 O(1) 空间。最优解 Manacher 利用回文对称性复用已算半径，O(n)，面试写出中心扩展即可，Manacher 能讲清思想加分。
【代码实现】
\`\`\`python
def longest_palindrome(s: str) -> str:
    best = ""
    def expand(l: int, r: int) -> str:
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return s[l + 1:r]
    for i in range(len(s)):
        for cand in (expand(i, i), expand(i, i + 1)):  # 奇偶两种中心
            if len(cand) > len(best):
                best = cand
    return best  # 时间 O(n²)，空间 O(1)
\`\`\`
【实际应用】回文结构在生物信息学中是核心信号：DNA 回文序列是限制性内切酶的识别位点（基因工程 CRISPR 靶点设计）；编译器词法分析的对称结构匹配；文本编辑器「最长对称子串」高亮。中心扩展思想还用于「枚举所有回文子串」（647 题）——每扩展一步就是一个回文。
【踩坑与变体】① 奇偶两种中心都要试，漏掉偶数中心会错过 abba 型；② expand 返回时注意边界 l+1..r-1；③ DP 版空间可压到 O(n) 但代码更绕；④ Manacher 的臂长复用：i 在已覆盖回文内时，其臂长至少为镜像点的臂长与右边界剩余距离的较小值；⑤ 变体 214「最短回文串」用 KMP 求 s 的最长回文前缀。`,
    keyPoints: ["2n-1 个对称中心", "奇偶中心分别扩展", "O(n²)/O(1) 中心扩展", "Manacher O(n) 最优"],
    followUps: ["Manacher 算法如何利用回文对称性把复杂度降到 O(n)？", "如何用 KMP 求字符串的最长回文前缀（LeetCode 214）？"],
    favorited: false,
  },
  {
    id: "algo-2011",
    nodeId: "p2-string-match",
    question: "214. 最短回文串（LeetCode 214）\n只能在字符串前面添加字符，把它变成回文串，返回最短的添加结果。",
    bigTech: true,
    answer: `【思路推导】在开头补字符构成回文 ⟺ 找 s 的「最长回文前缀」，把剩下的非回文后缀反转拼到前面即可。暴力判每个前缀是否回文 O(n²)。KMP 解法堪称神来之笔：构造 t = s + "#" + reverse(s)，对 t 求 next 数组，next[t.length-1] 就是「s 的最长前缀 = reverse(s) 的最长后缀」的长度——而 reverse(s) 的后缀对应 s 的前缀反转，相等意味着这段前缀本身就是回文。于是最长回文前缀长度 L = next[last]，答案 = reverse(s.slice(L)) + s，O(n)。
【代码实现】
\`\`\`python
def shortest_palindrome(s: str) -> str:
    rev = s[::-1]
    t = s + "#" + rev  # # 防前后缀跨越拼接缝
    nxt = [0] * len(t)
    j = 0
    for i in range(1, len(t)):
        while j > 0 and t[i] != t[j]:
            j = nxt[j - 1]
        if t[i] == t[j]:
            j += 1
        nxt[i] = j
    L = nxt[-1]  # 最长回文前缀长度
    return rev[: len(s) - L] + s  # 时间 O(n)，空间 O(n)
\`\`\`
【实际应用】「拼接 + 分隔符 + KMP」是把回文问题翻译成前后缀问题的经典手法，同类手法还用于循环移位等价判定（s2 是 s1 的旋转 ⟺ s2 是 s1+s1 的子串）。分隔符思想在协议设计里对应 magic number 定界：HTTP multipart 的 boundary、Protobuf 的 varint 分隔都是防止数据跨越语义边界。
【踩坑与变体】① 必须加分隔符 #（且不能出现在字符集里），否则 abba 型会错误跨越拼接缝得到虚高 next 值；② 只能在前添加是本题约束，任意位置添加就变成「最少插入构成回文」的区间 DP（LeetCode 1312）；③ 反转用数组展开而非 split("")，避免 UTF-16 代理对问题（emoji 场景）。`,
    keyPoints: ["补前缀 ⟺ 找最长回文前缀", "s+#+reverse(s) 求 next", "分隔符防跨缝匹配", "O(n) KMP 解法"],
    followUps: ["为什么分隔符缺失会导致 KMP 解法出错？举一个具体反例。", "任意位置插入字符构成回文的最少次数如何用区间 DP 求解？"],
    favorited: false,
  },
  {
    id: "algo-2012",
    nodeId: "p2-string-match",
    question: "647. 回文子串（LeetCode 647）\n统计字符串中有多少个回文子串（不同位置相同内容算多个）。",
    bigTech: false,
    answer: `【思路推导】与最长回文子串（第 5 题）同族，但目标是计数。中心扩展法天然适配：每个中心每向外扩展成功一步，就产生一个新回文子串，直接把扩展次数累加即可，O(n²) 时间 O(1) 空间。DP 解法同样可行：dp[i][j] 表示 s[i..j] 是否回文，转移同第 5 题，统计 true 的个数，O(n²) 时间 O(n²) 空间（可压到 O(n)）。
【代码实现】
\`\`\`python
def count_substrings(s: str) -> int:
    count = 0
    def expand(l: int, r: int) -> None:
        nonlocal count
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1  # 每扩展成功一步就多一个回文
            l -= 1
            r += 1
    for i in range(len(s)):
        expand(i, i)  # 奇数中心
        expand(i, i + 1)  # 偶数中心
    return count  # 时间 O(n²)，空间 O(1)
\`\`\`
【实际应用】回文计数是文本对称性分析的基础：自然语言处理中统计回文结构做文体指纹（识别特定作者的修辞习惯）；基因序列分析中回文密度异常区段往往对应功能域；压缩算法评估字符串自相似度时的参考指标。
【踩坑与变体】① 题目规定「位置不同即算不同」，aa 算 3 个（两个 a 加一个 aa），别去重；② 单个字符恒为回文，中心扩展的第一次成功就计入了；③ 变体「不同的回文子序列」（LeetCode 730）难得多，需要按首尾字符分类的区间 DP+去重，是 Hard；④ Manacher 求出所有臂长后，Σ⌈arm/2⌉ 也是答案，O(n)。`,
    keyPoints: ["中心扩展次数 = 回文数", "位置不同算不同不去重", "O(n²) 时间 O(1) 空间", "Manacher 臂长求和 O(n)"],
    followUps: ["为什么「不同的回文子序列」比「回文子串计数」难一个量级？", "如何用 Manacher 的臂长数组 O(n) 完成计数？"],
    favorited: false,
  },
  // ===== Phase 2 新增：单调队列与单调栈进阶（6题）=====
  {
    id: "algo-2013",
    nodeId: "p2-mono-queue",
    question: "239. 滑动窗口最大值（LeetCode 239）\n数组 nums 上大小为 k 的滑动窗口从左到右移动，返回每个窗口的最大值。要求 O(n)。",
    bigTech: true,
    answer: `【思路推导】暴力每窗口扫 k 个元素，O(n·k)。关键洞察：窗口右移时，新进来的元素 x 会让队列里所有比它小的元素「永久失去成为最大值的可能」——它们既比 x 旧（更早出窗）又比 x 小，永无出头之日。于是维护一个下标单调递减的双端队列：队首始终是当前窗口最大值；入队前从队尾弹掉所有 ≤ x 的元素；队首下标滑出窗口时从队首弹出。每个元素最多入队出队各一次，均摊 O(n)。
【代码实现】
\`\`\`python
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()  # 存下标，值单调递减
    ans: list[int] = []
    for i in range(len(nums)):
        while dq and nums[dq[-1]] <= nums[i]:
            dq.pop()  # 队尾让位
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()  # 队首出窗
        if i >= k - 1:
            ans.append(nums[dq[0]])  # 时间 O(n)，空间 O(k)
    return ans
\`\`\`
【实际应用】单调队列是流式极值计算的标准件：实时监控大盘的「最近 5 分钟峰值」滚动统计；股票行情软件的滑动窗口最高/最低价；音视频码率自适应（ABR）算法用滑动窗口估计带宽极值；ROS 机器人滑动窗口激光雷达避障。
【踩坑与变体】① 队列存下标而非值，否则无法判断队首是否出窗；② 弹出条件是 ≤（等于也弹），保留等值会让队首过期后拿不到正确最大值；③ JS 的 shift() 是 O(k)，严格场景用环形数组实现真 O(1)；④ 变体 1438 用两个单调队列（一增一减）维护窗口极差；⑤ 优先级队列（大顶堆）也能解但 O(nlogk)，且懒删除要哈希表配合。`,
    keyPoints: ["双端队列值单调递减", "队首即窗口最大值", "每元素均摊 O(1)", "存下标判断是否出窗"],
    followUps: ["为什么均摊分析下每个元素最多进出队各一次？", "如何用两个单调队列求「绝对差不超过 limit 的最长连续子数组」（1438）？"],
    favorited: false,
  },
  {
    id: "algo-2014",
    nodeId: "p2-mono-queue",
    question: "503. 下一个更大元素 II（LeetCode 503）\n循环数组中找每个元素的下一个更大元素，不存在返回 -1。",
    bigTech: false,
    answer: `【思路推导】「下一个更大元素」族问题的通法是单调栈：从右往左扫，栈里保留「右侧可能比当前元素大的候选」，栈顶到栈底单调递减；遇到当前元素 x，弹掉所有 ≤ x 的（它们被 x 挡住，对左边元素无用），栈顶就是 x 的下一个更大元素，然后 x 入栈。循环数组的处理是经典「倍增展开」：把数组逻辑上复制一遍（下标取模 i % n），扫 2n 次，让每个元素都能看到「绕到开头」的右侧。
【代码实现】
\`\`\`python
def next_greater_elements(nums: list[int]) -> list[int]:
    n = len(nums)
    ans = [-1] * n
    stack: list[int] = []  # 存下标，值单调递减
    for i in range(2 * n - 1, -1, -1):
        x = nums[i % n]
        while stack and nums[stack[-1]] <= x:
            stack.pop()
        if i < n:
            ans[i] = nums[stack[-1]] if stack else -1
        stack.append(i % n)  # 时间 O(n)，空间 O(n)
    return ans
\`\`\`
【实际应用】环形结构在系统设计中很常见：环形缓冲区（Ring Buffer）的生产者-消费者模型、时间轮（Timing Wheel）定时器、一致性哈希环上找下一个节点——都是「倍增/取模展开成线性」的思维。单调栈本身则是编译器括号匹配、直方图 UI 组件计算的底层。
【踩坑与变体】① 循环扫 2n 但只在 i<n 时写答案，否则重复覆盖；② 栈里元素可能因取模重复入栈，但因为值单调性维护，逻辑仍正确；③ 非循环版（496/739 题）只需扫一遍 n；④ 变体「下一个更大元素 III」（找数字重排的下一个排列）是 next-permutation 问题，用「找右起第一个升序对+交换+反转后缀」三步。`,
    keyPoints: ["单调栈从右往左扫", "环形数组倍增展开 i%n", "栈顶即下一个更大元素", "≤ 弹栈保持严格递减"],
    followUps: ["为什么倍增展开后栈内逻辑仍然正确？", "下一个排列（next permutation）的三步法是什么？"],
    favorited: false,
  },
  {
    id: "algo-2015",
    nodeId: "p2-mono-queue",
    question: "739. 每日温度（LeetCode 739）\n给定每日温度数组，对每一天计算还要等多少天才会出现更高温度，没有则为 0。",
    bigTech: true,
    answer: `【思路推导】暴力对每天向右扫描，O(n²)。单调栈视角：从左往右扫，栈里存「还没等到更高温度的日子下标」，栈对应温度单调递减；当前温度 T[i] 高于栈顶日子 T[top] 时，那个日子的答案就是 i-top（它等到了），弹出并继续比较新栈顶。每个下标最多入栈出栈一次，O(n)。这与「下一个更大元素」互为镜像：一个从左往右记录等待者，一个从右往左记录候选者，选哪个方向取决于「谁等谁」。
【代码实现】
\`\`\`python
def daily_temperatures(temperatures: list[int]) -> list[int]:
    n = len(temperatures)
    ans = [0] * n
    stack: list[int] = []  # 等待者下标，温度单调递减
    for i in range(n):
        while stack and temperatures[stack[-1]] < temperatures[i]:
            top = stack.pop()
            ans[top] = i - top  # 等到更高温的天数
        stack.append(i)  # 时间 O(n)，空间 O(n)
    return ans
\`\`\`
【实际应用】「等待者队列 + 触发结算」是事件驱动系统的通用模式：股票限价单撮合（价格触及即成交，订单簿就是多档单调队列）；告警系统「连续 N 次超阈值才触发」的窗口判定；游戏匹配系统按等待时长动态放宽段位差。
【踩坑与变体】① 弹出条件 < 而非 ≤，等温不算「更高」；② ans 默认 0 覆盖「之后没有更高温」的尾巴；③ 同族题 496「下一个更大元素 I」带 nums1/nums2 映射，先对 nums2 建单调栈答案表再查表；④ 84 题「柱状图最大矩形」是单调栈的巅峰应用：每根柱子向左右找第一个更矮的位置确定宽度。`,
    keyPoints: ["栈存等待者下标", "遇高温结算等待时长", "每下标均摊 O(1)", "与下一个更大元素互为镜像"],
    followUps: ["为什么单调栈解法是每个元素均摊 O(1) 而不是 O(n)？", "柱状图中最大矩形（84）如何用单调栈确定每根柱子的最大宽度？"],
    favorited: false,
  },
  {
    id: "algo-2016",
    nodeId: "p2-mono-queue",
    question: "42. 接雨水（LeetCode 42）\n给定柱状图表示的地形，计算下雨后能接多少水。",
    bigTech: true,
    answer: `【思路推导】位置 i 的积水量 = min（左侧最高， 右侧最高） - height[i]（不够 0 则为 0），这是所有解法的出发点。三种实现：① 暴力：每个位置向左右各扫一遍找最高，O(n²)；② 前缀/后缀最大值数组预处理，O(n) 时间 O(n) 空间；③ 双指针 O(1) 空间：左右指针向中间收，哪边的当前最大值低就结算哪边——因为低的那边的积水量已被「它自己的最大值」决定，与另一边更高的柱子无关（木桶短板效应）。单调栈也行：维护递减栈，遇到更高的柱子说明形成凹槽，弹出结算凹槽面积。
【代码实现】
\`\`\`python
def trap(height: list[int]) -> int:
    l, r, l_max, r_max, water = 0, len(height) - 1, 0, 0, 0
    while l < r:
        l_max = max(l_max, height[l])
        r_max = max(r_max, height[r])
        if l_max < r_max:
            water += l_max - height[l]
            l += 1  # 短板侧可结算
        else:
            water += r_max - height[r]
            r -= 1  # 时间 O(n)，空间 O(1)
    return water
\`\`\`
【实际应用】「短板决定容量」是系统容量规划的通用模型：服务链路的吞吐由最慢节点决定（水桶效应）；CDN 边缘节点的回源带宽按峰值短板预留；双指针压缩空间的思想还用于容器盛水（11 题）、雨季后洪水位模拟等。
【踩坑与变体】① 双指针结算的是「当前指针位置」不是最大值位置，water += lMax - height[l] 别写反；② 两端是边界不可能积水，l/r 初始即可跳过 0 高度；③ 2D 版「接雨水 II」（407 题）要用最小堆从边界向中心 BFS；④ 单调栈版按层横向结算，理解凹槽「底-左墙-右墙」三元组。`,
    keyPoints: ["积水量 = min(左右最高) - 当前高度", "双指针短板侧先结算", "O(1) 空间最优", "2D 版用最小堆 BFS"],
    followUps: ["为什么双指针中较低一侧的积水量与另一侧无关？", "接雨水 II（二维）为什么必须用最小堆从边界开始？"],
    favorited: false,
  },
  {
    id: "algo-2017",
    nodeId: "p2-mono-queue",
    question: "84. 柱状图中最大的矩形（LeetCode 84）\n给定柱状图，求能勾勒出的最大矩形面积。",
    bigTech: true,
    answer: `【思路推导】最大矩形必以某根柱子的高度为高、向两侧延伸到「第一根更矮的柱子」为宽。暴力对每根柱子向左右扫，O(n²)。单调栈把「向左/右第一个更矮位置」的查询降到均摊 O(1)：维护高度单调递增的栈，当前柱子 h[i] 低于栈顶时，栈顶柱子的高度已无法继续扩展（右边界就是 i），弹出结算：高=弹出的高度，宽=i-新栈顶-1。末尾加一根高度 0 的哨兵强制清空栈。每根柱子进出栈各一次，O(n)。
【代码实现】
\`\`\`python
def largest_rectangle_area(heights: list[int]) -> int:
    stack: list[int] = []  # 递增栈，存下标
    best = 0
    hs = heights + [0]  # 哨兵清栈
    for i in range(len(hs)):
        while stack and hs[stack[-1]] > hs[i]:
            h = hs[stack.pop()]
            w = i - stack[-1] - 1 if stack else i
            best = max(best, h * w)
        stack.append(i)  # 时间 O(n)，空间 O(n)
    return best
\`\`\`
【实际应用】「以某元素为瓶颈向两侧扩展」的模型很常见：UI 排版引擎计算最大可用留白矩形；直方图均衡化的面积统计；最大全 1 矩形（85 题）把每行当柱状图逐行套用本题，是二维矩阵问题的标准降维套路；数据库列式存储的游程编码（RLE）压缩率估算。
【踩坑与变体】① 宽度公式是 i - 新栈顶 - 1（弹出后新栈顶是左边界外第一根更矮的）；② 栈空时宽度为 i（从 0 到 i-1 全高于弹出柱）；③ 哨兵 0 必须有，否则递增序列的柱子永远不会被结算；④ 85 题逐行降维时高度数组要累加（遇到 1 则 +1，遇 0 清零）。`,
    keyPoints: ["每根柱子的矩形宽 = 左右第一根更矮柱间距", "单调递增栈遇低结算", "末尾哨兵强制清栈", "85 题逐行降维复用"],
    followUps: ["最大矩形（85 题）如何把二维 01 矩阵逐行降维成柱状图问题？", "为什么宽度是 i - 新栈顶 - 1 而不是 i - 弹出位置？"],
    favorited: false,
  },
  {
    id: "algo-2018",
    nodeId: "p2-mono-queue",
    question: "1438. 绝对差不超过限制的最长连续子数组（LeetCode 1438）\n找最长连续子数组，使其中最大值与最小值之差不超过 limit。",
    bigTech: false,
    answer: `【思路推导】滑动窗口 + 双单调队列。窗口 [left, right] 内维护两个双端队列：maxQ 值单调递减（队首窗口最大值）、minQ 值单调递增（队首最小值）；右指针每纳入一个元素就更新两队列，然后检查 maxQ 队首 - minQ 队首 > limit 时收缩左指针（把 left 位置元素从两队列中剔除），直到合法。此时窗口 [left, right] 是以 right 结尾的最长合法窗口，全程 O(n)。这题是滑动窗口最大值（239）与不定长滑窗的复合。
【代码实现】
\`\`\`python
from collections import deque

def longest_subarray(nums: list[int], limit: int) -> int:
    max_q: deque[int] = deque()
    min_q: deque[int] = deque()  # 存下标
    left = 0
    best = 0
    for right in range(len(nums)):
        while max_q and nums[max_q[-1]] <= nums[right]:
            max_q.pop()
        while min_q and nums[min_q[-1]] >= nums[right]:
            min_q.pop()
        max_q.append(right)
        min_q.append(right)
        while nums[max_q[0]] - nums[min_q[0]] > limit:  # 收缩到合法
            left += 1
            if max_q[0] < left:
                max_q.popleft()
            if min_q[0] < left:
                min_q.popleft()
        best = max(best, right - left + 1)  # 时间 O(n)，空间 O(n)
    return best
\`\`\`
【实际应用】「窗口内多约束联合维护」是流式风控的典型形态：实时交易监控「最近 1 小时内最高-最低价差超过阈值即熔断」；物联网传感器数据质量窗口（剔除抖动超差的时段）；在线算法竞赛判题系统的运行时间稳定性检测。
【踩坑与变体】① 收缩 left 后要同时清理两个队列的过期队首；② 队列存下标才能与 left 比较判断是否过期；③ 平衡二叉搜索树（TreeMap/ multiset）替代方案 O(nlogn)，C++ 可直接用 multiset 但更慢；④ 变体「最长连续递增子数组」简单得多，一次遍历即可，注意与本题的「极差约束」区分。`,
    keyPoints: ["双单调队列维护窗口最值", "极差超限即收缩左指针", "存下标判过期", "O(n) 均摊"],
    followUps: ["为什么这题不能只用一个大顶堆+一个小顶堆？", "如果约束改为「窗口内最多 K 个不同元素」，滑动窗口要如何调整？"],
    favorited: false,
  },
  // ===== Phase 2 新增：二分答案进阶（6题）=====
  {
    id: "algo-2019",
    nodeId: "p2-binary-answer",
    question: "875. 爱吃香蕉的珂珂（LeetCode 875）\n珂珂每小时吃 K 根香蕉，每堆一小时最多吃 K 根，H 小时内吃完所有堆的最小 K 是多少？",
    bigTech: true,
    answer: `【思路推导】直接求最小 K 没有公式，但「速度 K → 所需总工时」是单调不减的：K 越大耗时越少。单调性一出现，二分答案就成立：在 [1, max(piles)] 上二分 K，check(K) = 每堆按 ⌈pile/K⌉ 小时累加是否 ≤ H。答案是「满足 check 的最小 K」，用左边界二分模板。总工时计算时注意向上取整 (pile + K - 1) / K。
【代码实现】
\`\`\`python
import math

def min_eating_speed(piles: list[int], h: int) -> int:
    lo, hi = 1, max(piles)
    while lo < hi:  # 找最小可行 K：左边界二分
        mid = (lo + hi) >> 1
        hours = sum(math.ceil(p / mid) for p in piles)
        if hours <= h:
            hi = mid  # 可行，尝试更小
        else:
            lo = mid + 1
    return lo  # 时间 O(n·log(max))，空间 O(1)
\`\`\`
【实际应用】「最小化成本满足时限」是容量规划的日常：CDN 带宽买多大才能扛住晚会峰值（二分带宽，check 是模拟压测）；线程池开多大能在 SLA 内跑完批任务；限流器阈值定多少既防雪崩又不误伤正常流量。面试识别信号：「最小化最大值 / 最大化最小值 / 求满足条件的最小参数」。
【踩坑与变体】① hi 初始取 max(piles) 而非 piles 总和（一堆一小时最多吃一堆的量）；② 小时累加可能溢出 32 位（其他语言用 long，或累加超 h 即提前 break）；③ 左边界二分用 lo<hi + hi=mid，右边界用 lo<=hi 或 mid 上取整，两套模板别混；④ 同族题：1011 运货、410 分割数组、1482 花束，全是「check 单调 + 二分」。`,
    keyPoints: ["答案单调性 ⟺ 可二分", "check(K)=总工时≤H", "左边界二分模板", "识别信号：最小化最大值"],
    followUps: ["为什么「最小化最大值」类问题几乎都满足二分单调性？", "check 函数写成贪心累加的正确性如何证明？"],
    favorited: false,
  },
  {
    id: "algo-2020",
    nodeId: "p2-binary-answer",
    question: "1011. 在 D 天内送达包裹的能力（LeetCode 1011）\n货船每天按顺序装载包裹，总重不超过运载能力 C，求 D 天内送完的最小 C。",
    bigTech: true,
    answer: `【思路推导】运载能力 C 与所需天数单调相关：C 越大天数越少。二分 C，下界是 max(weights)（最重的包裹也得装下），上界是 sum(weights)（一天全装走）。check(C) 用贪心：按顺序装，装不下就换船（天数+1），贪心的正确性在于「顺序固定时装到最满换船」不会比任何方案用更多天——反证：若贪心用了 d 天，任何方案第 i 艘船装的包裹集合都不会比贪心多，归纳可得天数不更少。
【代码实现】
\`\`\`python
def ship_within_days(weights: list[int], days: int) -> int:
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) >> 1
        need, cur = 1, 0
        for w in weights:
            if cur + w > mid:
                need += 1
                cur = 0  # 换船
            cur += w
        if need <= days:
            hi = mid
        else:
            lo = mid + 1  # 时间 O(n·log(sum))，空间 O(1)
    return lo
\`\`\`
【实际应用】这就是物流系统的真实缩影：集装箱配载（顺序约束对应「先到先装」的传送带规则）；消息队列分区数规划（C 类比单分区吞吐，D 类比消费延迟 SLA）；CDN 回源并发度规划。二分答案的本质是把「最优化问题」转化为「可行性判定问题」，后者往往有简单贪心。
【踩坑与变体】① lo 必须从 max(weights) 开始，从 1 开始会算出装不下重包裹的假解；② 换船逻辑是先判断再装，cur+w>mid 才换；③ 天数从 1 起算（第一艘船）；④ 410 题「分割数组的最大值」是同构换皮：把数组分成 m 段使最大段和最小，check 同样是贪心切分计数；⑤ 若允许调整包裹顺序，问题变成装箱问题（NP-hard），二分不再适用。`,
    keyPoints: ["C 与天数单调负相关", "贪心装满即最优（顺序固定）", "下界 max 上界 sum", "与 410 分割数组同构"],
    followUps: ["证明：顺序固定时贪心「装满即换船」得到的天数最少。", "如果包裹可以任意调整顺序，问题复杂度会发生什么变化？"],
    favorited: false,
  },
  {
    id: "algo-2021",
    nodeId: "p2-binary-answer",
    question: "410. 分割数组的最大值（LeetCode 410）\n把数组分成 m 个连续非空子数组，使「各段和的最大值」最小，返回这个最小化的最大值。",
    bigTech: true,
    answer: `【思路推导】这是二分答案的招牌题。「最大段和 ≤ X 时能否分成 ≤ m 段」关于 X 单调：X 越大越容易满足。于是二分 X ∈ [max(nums), sum(nums)]，check(X) 贪心切分：累加当前段，超过 X 就切一刀段数+1，最后段数 ≤ m 则 X 可行。注意是「≤ m」而非「= m」——段数少了可以把某段再拆开（和只会更小），所以段数 ≤ m 等价于可行。DP 解法 O(n²·m)（dp[i][j]=前 i 个分 j 段的最小最大段和）在面试中作为对照提及即可。
【代码实现】
\`\`\`python
def split_array(nums: list[int], m: int) -> int:
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) >> 1
        parts, cur = 1, 0
        for x in nums:
            if cur + x > mid:
                parts += 1
                cur = 0
            cur += x
        if parts <= m:
            hi = mid
        else:
            lo = mid + 1  # 时间 O(n·log(sum))，空间 O(1)
    return lo
\`\`\`
【实际应用】负载均衡的数学原型：把任务列表切给 m 台机器使最忙的机器最闲（makespan 最小化）；视频转码任务分片；大文件分块上传的块大小规划。工业界这类「连续分配 + 最小化最大负载」还出现在印刷排版（行宽最小化最大行高）和内存分配器设计里。
【踩坑与变体】① check 里段数是 ≤ m 不是 == m，想通「可再拆」这一点是关键；② 负数元素会破坏单调性（本题约束非负），含负数时贪心失效；③ DP 版是「 painter partition」经典，空间可滚动压缩；④ 变体「最小化去 K 个元素后的最大值」等，识别信号一致：答案对约束单调。`,
    keyPoints: ["最小化最大值 ⟹ 二分答案", "check=贪心切段数≤m", "段数少可再拆等价可行", "DP 对照 O(n²m)"],
    followUps: ["为什么 check 中段数 ≤ m 即可而不要求恰好 m 段？", "写出 O(n²·m) 的 DP 解法并说明状态定义。"],
    favorited: false,
  },
  {
    id: "algo-2022",
    nodeId: "p2-binary-answer",
    question: "153. 寻找旋转排序数组中的最小值（LeetCode 153）\n升序数组被旋转了一次（如 [4,5,6,7,0,1,2]），无重复元素，O(logn) 找最小值。",
    bigTech: false,
    answer: `【思路推导】旋转数组的最小值是「两段有序的分界点」，也是唯一满足「比前一个元素小」的位置。二分的关键是选对标：拿 mid 与 right 比较——若 nums[mid] > nums[right]，说明 mid 在左段（大数段），最小值必在 mid 右侧，lo=mid+1；否则 mid 在右段（含最小值的有序段）或就是最小值，hi=mid（不丢候选）。与 right 比而非与 left 比的原因：与 left 比无法区分「mid 在左段」与「数组根本没旋转」两种情况。
【代码实现】
\`\`\`python
def find_min(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) >> 1
        if nums[mid] > nums[hi]:
            lo = mid + 1  # 最小值在右半
        else:
            hi = mid  # mid 可能就是最小值
    return nums[lo]  # 时间 O(logn)，空间 O(1)
\`\`\`
【实际应用】「循环移位序列找分界」在系统领域对应：环形日志文件定位最旧记录；时间轮定时器的当前槽位校正；分布式版本向量中找分叉点。变形的 33 题「旋转数组搜索 target」是先找分界再在对应段二分，或一次二分每步判断哪半有序。
【踩坑与变体】① hi=mid 不能写成 hi=mid-1，否则丢掉「mid 即最小值」的候选；② 循环不变式：最小值始终在 [lo,hi] 内；③ 含重复元素的 154 题遇到 nums[mid]===nums[hi] 只能 hi-- 线性收缩，最坏 O(n)；④ 33 题搜索 target 时先判断 [lo,mid] 是否有序，再决定 target 落在哪半。`,
    keyPoints: ["最小值=两段分界点", "与 right 比较定向", "hi=mid 保候选", "重复元素退化 O(n)"],
    followUps: ["为什么与 nums[right] 比较而不是 nums[left]？", "旋转数组中搜索 target（33 题）如何一次二分完成？"],
    favorited: false,
  },
  {
    id: "algo-2023",
    nodeId: "p2-binary-answer",
    question: "378. 有序矩阵中第 K 小的元素（LeetCode 378）\nn×n 矩阵每行每列均升序，求第 k 小的元素。",
    bigTech: false,
    answer: `【思路推导】堆解法：最小堆放 k 个候选（初始第一列，每次弹出并推入同行下一个），弹 k 次得答案，O(k·logn)。更妙的是值域二分：矩阵值域 [matrix[0][0], matrix[n-1][n-1]]，对任意 mid 能 O(n) 数出「≤ mid 的元素个数」——从左下角出发，当前值 ≤ mid 则整列向上都 ≤ mid（计数 += i+1，右移），否则上移。count ≤ mid 关于 mid 单调，二分找「count ≥ k 的最小 mid」，它必等于第 k 小元素本身（因为 count 只在矩阵元素值处跳变）。O(n·log(max-min))。
【代码实现】
\`\`\`python
def kth_smallest(matrix: list[list[int]], k: int) -> int:
    n = len(matrix)
    lo, hi = matrix[0][0], matrix[n - 1][n - 1]
    def count_le(mid: int) -> int:
        cnt, i, j = 0, n - 1, 0
        while i >= 0 and j < n:
            if matrix[i][j] <= mid:
                cnt += i + 1
                j += 1  # 整列计入
            else:
                i -= 1
        return cnt
    while lo < hi:
        mid = (lo + hi) >> 1
        if count_le(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo  # 时间 O(n·log值域)，空间 O(1)
\`\`\`
【实际应用】「在排序空间上二分计数」是分位数计算的范式：OLAP 引擎（ClickHouse/Doris）求 P99 延迟的近似分位数；时序数据库在有序分段上二分定位时间窗；倒排索引的 docID 归并查找。
【踩坑与变体】① 从左下角（或右上角）出发才能每步唯一定向，从左上出发两个方向都 ≤/≥ 无法抉择；② 二分出的是「值」不是「位置」，最终 lo 必为矩阵中存在的值；③ 堆解法 k 很小时更优，值域二分在值域小或 k 接近 n² 时更优；④ 变体「第 K 小的距离对」「第 K 小的分数对」同用值域二分+双指针计数。`,
    keyPoints: ["值域二分 + 计数判定", "左下角出发 O(n) 计数", "count 在元素值处跳变", "堆解法 O(klogn) 对照"],
    followUps: ["为什么二分最终收敛到的值一定是矩阵中真实存在的元素？", "「两个正序数组中第 K 小的 pairwise 和」如何用同样框架求解？"],
    favorited: false,
  },
  {
    id: "algo-2024",
    nodeId: "p2-binary-answer",
    question: "1482. 制作 m 束花所需的最少天数（LeetCode 1482）\nbloomDay[i] 是第 i 朵花开放日，每束花需 k 朵相邻的花，求做出 m 束花的最少天数，无解返回 -1。",
    bigTech: false,
    answer: `【思路推导】天数 d 与「能做出的花束数」单调：等得越久开的花越多。二分 d ∈ [min(bloomDay), max(bloomDay)]，check(d) 一趟扫描：维护连续已开放计数，满 k 朵即成一束、计数清零（贪心从左到右成束不会错过任何可行解——相邻约束下从左贪心与最优解束数相同，交换论证可证）。总束数 ≥ m 则 d 可行。无解判定：m*k > n 直接 -1。
【代码实现】
\`\`\`python
def min_days(bloom_day: list[int], m: int, k: int) -> int:
    n = len(bloom_day)
    if m * k > n:
        return -1
    lo, hi = min(bloom_day), max(bloom_day)
    while lo < hi:
        mid = (lo + hi) >> 1
        bouquets, run = 0, 0
        for d in bloom_day:
            run = run + 1 if d <= mid else 0  # 连续开放段
            if run == k:
                bouquets += 1
                run = 0
        if bouquets >= m:
            hi = mid
        else:
            lo = mid + 1  # 时间 O(n·log(max))，空间 O(1)
    return lo
\`\`\`
【实际应用】「资源就绪时间 + 批量约束」模型：制造业排产（零件到齐才能组装，求最早交付日）；分布式任务依赖（等齐 k 个上游分片再触发下游）；库存系统的可售天数预估。check 里的「连续段计数清零」技巧与滑动窗口、游程编码一脉相承。
【踩坑与变体】① 必须先判 m*k > n 无解；② run 归零的时机是满 k 立即成束，不能等到段末；③ 相邻约束是核心——去掉相邻就变成「第 m·k 小的 bloomDay」，直接排序/快速选择即可；④ 同族：1283「使结果不超过阈值的最小除数」、1870「准时到达的最小时速」，全是 check 单调+左边界二分。`,
    keyPoints: ["天数与花束数单调", "连续开放满 k 成束清零", "先判 m*k>n 无解", "相邻约束是二分前提"],
    followUps: ["证明从左到右贪心成束与最优解束数相同。", "去掉相邻约束后问题退化成什么？用什么算法 O(n) 解决？"],
    favorited: false,
  },
  // ===== Phase 2 新增：字典树与并查集（7题）=====
  {
    id: "algo-2025",
    nodeId: "p2-trie-union-find",
    question: "208. 实现 Trie（前缀树）（LeetCode 208）\n实现 Trie 的 insert、search（精确）、startsWith（前缀）三个操作。",
    bigTech: true,
    answer: `【思路推导】哈希表能 O(L) 精确查一个词，但「前缀检索」无能为力——这正是 Trie 的主场。每个节点存 26 个子指针（或 Map）+ isEnd 标记：插入沿字符逐层下沉，路径即前缀；search 走到底且 isEnd 为真才算命中；startsWith 只需走到底。插入/查询都是 O(L)，L 为词长，与词库规模无关——这是 Trie 对比「遍历词库逐个 startsWith」的 O(N·L) 的本质优势。
【代码实现】
\`\`\`python
class Trie:
    def __init__(self) -> None:
        self.children: dict[str, "Trie"] = {}
        self.is_end = False

    def insert(self, word: str) -> None:
        node = self
        for ch in word:
            if ch not in node.children:
                node.children[ch] = Trie()
            node = node.children[ch]
        node.is_end = True

    def _walk(self, word: str) -> "Trie | None":
        node = self
        for ch in word:
            nxt = node.children.get(ch)
            if nxt is None:
                return None
            node = nxt
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node.is_end if node else False

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None
        # 时间 O(L)，空间 O(ΣL)
\`\`\`
【实际应用】Trie 是自动补全的基础设施：搜索框联想词（走到前缀节点后 DFS 收集子树 Top-K）；IDE 代码补全；输入法词典；IP 路由表的最长前缀匹配（01 Trie）；敏感词过滤（AC 自动机 = Trie + KMP 失配指针）。工程上会用双数组 Trie（DAT）压缩指针空间，把内存降一个量级。
【踩坑与变体】① search 和 startsWith 的差别只在 isEnd，别共用返回值；② 字符集大时用 Map 比定长数组省内存，字符集小用数组更快；③ 删除操作要自底向上回收无子节点且非词尾的节点；④ 变体 211「添加与搜索单词」带 . 通配符，在 Trie 上 DFS 展开分支；⑤ 01 Trie 把整数按二进制位插入，可解最大异或对（421 题）。`,
    keyPoints: ["路径即前缀", "插入/查询 O(L) 与词库规模无关", "isEnd 区分精确与前缀", "AC 自动机 = Trie + KMP"],
    followUps: ["如何用 01 Trie 求数组中两数最大异或值？", "Trie 的删除操作为什么需要自底向上回收节点？"],
    favorited: false,
  },
  {
    id: "algo-2026",
    nodeId: "p2-trie-union-find",
    question: "421. 数组中两个数的最大异或值（LeetCode 421）\n在数组中找两个数，使它们的异或值最大。",
    bigTech: false,
    answer: `【思路推导】暴力两两异或 O(n²)。最大异或的本质是「贪心让高位尽量为 1」：从最高位到最低位，若某一位能取到 1（即两个数这一位不同）就取 1。把每个数按二进制位插入 01 Trie，然后对每个数 x 在 Trie 里走「尽量相反位」的路径（当前位是 0 就走 1 分支，反之亦然），走不通才妥协走相同位。每个数 O(32)，总 O(32n)。也可以在 Trie 构建时两两在线处理：插入第 i 个数之前，先用它在已有 Trie 里查最大异或。
【代码实现】
\`\`\`python
def find_maximum_xor(nums: list[int]) -> int:
    class Node:
        __slots__ = ("child",)
        def __init__(self) -> None:
            self.child: list = [None, None]
    root = Node()
    def insert(x: int) -> None:
        node = root
        for b in range(30, -1, -1):
            bit = (x >> b) & 1
            if not node.child[bit]:
                node.child[bit] = Node()
            node = node.child[bit]
    def max_xor_with(x: int) -> int:
        node, ans = root, 0
        for b in range(30, -1, -1):
            bit = (x >> b) & 1
            want = 1 - bit
            if node.child[want]:
                ans |= 1 << b
                node = node.child[want]
            else:
                node = node.child[bit]
        return ans
    insert(nums[0])
    best = 0
    for i in range(1, len(nums)):
        best = max(best, max_xor_with(nums[i]))
        insert(nums[i])
    return best  # 时间 O(32n)，空间 O(32n)
\`\`\`
【实际应用】「按位贪心 + 前缀结构」用于相似检索：局部敏感哈希（LSH）按位段索引近似最近邻；网络掩码最长前缀匹配（路由器转发表就是 01 Trie）；图形学里 Morton 码（Z-order）把多维数据交织成一维做范围查询。
【踩坑与变体】① 位数从 30（或 31）开始，题目给非负 int；② 必须先查后插（或从 i=1 开始），否则数会和自己异或得 0；③ JS 位运算 32 位有符号，最高位处理用 >>> 或限定非负；④ 变体「与目标值异或最大的子集」用线性基（高斯消元思想），是 01 Trie 的代数化。`,
    keyPoints: ["高位优先贪心取 1", "01 Trie 走相反位", "O(32n) 线性", "先查后插防自配对"],
    followUps: ["线性基（XOR basis）如何用高斯消元思想求子集最大异或？", "Morton 码如何把多维点映射成一维做空间索引？"],
    favorited: false,
  },
  {
    id: "algo-2027",
    nodeId: "p2-trie-union-find",
    question: "212. 单词搜索 II（LeetCode 212）\n在 m×n 字符网格中找出词典里所有能由相邻格子（上下左右）拼成的单词，格子不能重复使用。",
    bigTech: true,
    answer: `【思路推导】对每个单词各跑一次 DFS 回溯是 O(N·mn·4^L)，N 个词重复扫网格太慢。反转视角：把词典建成 Trie，从网格每个格子出发做 DFS，沿 Trie 节点同步下沉——当前路径不是任何词的前缀就整枝剪掉（这是比单词搜索 I 多出的关键剪枝），命中 isEnd 就收集。visited 用原地标记（改成 # 再恢复）省空间。Trie 节点的词频计数可优化：收集过的词去重并剪枝子树。
【代码实现】
\`\`\`python
def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    class N:
        __slots__ = ("ch", "word")
        def __init__(self) -> None:
            self.ch: dict[str, "N"] = {}
            self.word: str | None = None
    root = N()
    for w in words:
        node = root
        for c in w:
            if c not in node.ch:
                node.ch[c] = N()
            node = node.ch[c]
        node.word = w
    m, n = len(board), len(board[0])
    ans: list[str] = []
    def dfs(i: int, j: int, node: N) -> None:
        c = board[i][j]
        nxt = node.ch.get(c)
        if not nxt:
            return  # 前缀剪枝：核心提速点
        if nxt.word:
            ans.append(nxt.word)
            nxt.word = None  # 去重
        board[i][j] = "#"
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != "#":
                dfs(ni, nj, nxt)
        board[i][j] = c
    for i in range(m):
        for j in range(n):
            dfs(i, j, root)
    return ans  # 时间 O(mn·4^L) 带前缀剪枝，空间 O(Σ词长)
\`\`\`
【实际应用】「候选集索引化 + 搜索空间剪枝」是检索系统的元思想：搜索引擎倒排索引就是把文档集索引化，查询时只展开命中的 posting list；规则引擎（Drools）的 Rete 网络同理；拼写游戏（如 Wordle 求解器、Scrabble AI）都基于词典 Trie。
【踩坑与变体】① 命中后把 next.word 置 null 去重（同一词可从多路径拼出）；② 原地标记比 visited 数组省内存且快，但必须回溯恢复；③ 极端 case：词典含超长词直接跳过（长度 > m*n 不可能拼出）；④ 前缀剪枝是与 79 题（单词搜索 I）的唯一但本质的差异。`,
    keyPoints: ["词典建 Trie + 网格 DFS", "非前缀整枝剪除", "命中置空去重", "原地标记省空间"],
    followUps: ["相比对每个单词单独 DFS，Trie 剪枝在渐进复杂度上带来了什么改变？", "如果允许对角相邻，代码要改哪几处？"],
    favorited: false,
  },
  {
    id: "algo-2028",
    nodeId: "p2-trie-union-find",
    question: "547. 省份数量（LeetCode 547）\n给定 n×n 邻接矩阵表示城市连通关系，求连通分量（省份）个数。",
    bigTech: false,
    answer: `【思路推导】连通分量计数是并查集的招牌场景：初始每个城市自立门户（count=n），每发现一对连通 (i,j) 就 union 合并，成功合并一次 count 减一。find 用路径压缩（查询时把路径上的节点直接挂到根），union 用按秩合并（小树挂大树），均摊复杂度接近 O(α(n))——α 是反阿克曼函数，任何现实输入下 α(n)≤4，可视为常数。DFS/BFS 染色也能解，但并查集在「边动态加入」的在线场景不可替代。
【代码实现】
\`\`\`python
def find_circle_num(is_connected: list[list[int]]) -> int:
    n = len(is_connected)
    parent = list(range(n))
    rank = [1] * n
    def find(x: int) -> int:
        if parent[x] != x:
            parent[x] = find(parent[x])  # 路径压缩
        return parent[x]
    def union(a: int, b: int) -> bool:
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        if rank[ra] < rank[rb]:
            ra, rb = rb, ra  # 按秩：小挂大
        parent[rb] = ra
        rank[ra] += rank[rb]
        return True
    count = n
    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j] == 1 and union(i, j):
                count -= 1
    return count  # 时间 O(n²·α(n))，空间 O(n)
\`\`\`
【实际应用】并查集是「动态连通性」的工业标准：社交网络「共同好友群」聚类；分布式系统的节点分区检测；图像处理的连通区域标记（等价表法）；Kruskal 最小生成树的核心数据结构；数据库 GROUP BY 的等价类合并优化。
【踩坑与变体】① 矩阵对称，只扫上三角避免重复 union；② 路径压缩用递归版注意栈深（n 很大时写迭代版）；③ 只压缩不按秩，或只按秩不压缩，复杂度都会退化——两者配合才是近 O(1)；④ 变体 990「等式方程的可满足性」：先 union 所有 ==，再检查每个 != 是否同根；⑤ 684「冗余连接」：第一条两端已连通的边即答案。`,
    keyPoints: ["union 成功一次分量减一", "路径压缩 + 按秩合并", "均摊 O(α(n))≈O(1)", "在线动态连通性首选"],
    followUps: ["为什么路径压缩和按秩合并必须同时使用？", "如何用带权并查集解决「除法求值」（399 题）的比值约束？"],
    favorited: false,
  },
  {
    id: "algo-2029",
    nodeId: "p2-trie-union-find",
    question: "684. 冗余连接（LeetCode 684）\n无向图是一棵树加一条多余的边，找出这条删除后仍保持连通的冗余边（有多个答案时返回最后出现的）。",
    bigTech: false,
    answer: `【思路推导】树有 n 个节点 n-1 条边且无环，多出来的那条边必然构成环。按顺序遍历边做 union：若边两端已属同一连通分量，说明加入它会成环——这条边就是冗余边。「返回最后出现的」天然被顺序处理满足（第一条成环的边是环上最后被遍历到的边）。判断成环是本题本质：并查集 find 同根即环。DFS 判环也可，但要建图+递归，代码更长且不如并查集在线处理自然。
【代码实现】
\`\`\`python
def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    n = len(edges)
    parent = list(range(n + 1))
    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # 迭代路径压缩
            x = parent[x]
        return x
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]  # 成环边
        parent[ru] = rv
    return []  # 时间 O(n·α(n))，空间 O(n)
\`\`\`
【实际应用】「检测约束冲突」的通用件：网络拓扑变更时检测环路（STP 生成树协议的软件模拟）；依赖注入框架检测循环依赖；Git 合并时检测祖先关系成环；电子表格公式循环引用检测（Excel 的 circular reference 警告）。
【踩坑与变体】① 节点编号 1..n，parent 数组开 n+1；② 迭代版路径压缩用「隔代指向」（parent[x]=parent[parent[x]]）即可，不必一步到根；③ 有向图版本（685 题「冗余连接 II」）难得多：要分「入度为 2 的节点」与「环」两种情况讨论；④ 若要求返回「使图变树的任意一条边」而非最后一条，当前解同样成立。`,
    keyPoints: ["树+一边必有且仅有一个环", "find 同根即成环", "顺序处理天然满足最后出现", "有向版 685 分情况讨论"],
    followUps: ["冗余连接 II（有向图）为什么要分入度为 2 和成环两种情况？", "并查集如何支持「删除边」操作？（提示：不可行，需动态树 Link-Cut Tree）"],
    favorited: false,
  },
  {
    id: "algo-2030",
    nodeId: "p2-trie-union-find",
    question: "990. 等式方程的可满足性（LeetCode 990）\n给定若干 a==b 和 a!=b 约束，判断是否存在一组赋值满足全部约束。",
    bigTech: false,
    answer: `【思路推导】== 是等价关系（自反/对称/传递），!= 是不等价约束。处理顺序是题眼：先把所有 == 的变量 union 进同一连通分量（等价类合并），再逐条检查 != 约束——若某条 a!=b 的 a、b 已在同一分量，说明矛盾（等价类内部必须相等），返回 false。顺序反过来就错了：先查 != 时等价类还没合并完，会漏掉传递性推出的矛盾（如 a==b, b==c, a!=c）。
【代码实现】
\`\`\`python
def equations_possible(equations: list[str]) -> bool:
    parent = list(range(26))  # 仅小写字母
    def find(x: int) -> int:
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
    def union(a: int, b: int) -> None:
        parent[find(a)] = find(b)
    def idx(s: str) -> int:
        return ord(s) - 97
    for eq in equations:  # 第一遍：合并所有 ==
        if eq[1] == "=":
            union(idx(eq[0]), idx(eq[3]))
    for eq in equations:  # 第二遍：检查所有 !=
        if eq[1] == "!" and find(idx(eq[0])) == find(idx(eq[3])):
            return False
    return True  # 时间 O(n·α(26))，空间 O(1)
\`\`\`
【实际应用】等价类合并是编译器与数据库的常驻技术：编译器寄存器分配的「合并相同值变量」（公共子表达式消除）；数据库优化器把 WHERE a=b AND b=c 推出 a=c 用于索引选择；类型系统的 Union-Find 实现（Hindley-Milner 类型推导的 unify）；实体对齐（同一用户的多个账号合并）。
【踩坑与变体】① 顺序！先全部 == 再全部 !=，这是唯一易错点；② 自等约束 a==a 合法，a!=a 恒矛盾（find 同根）会被正确判 false；③ 变量不止小写字母时用哈希 Map 动态编号；④ 进阶「带权等式」如 x-y=3 的差分约束，用带权并查集或 Bellman-Ford。`,
    keyPoints: ["== 合并、!= 校验", "顺序不可颠倒", "等价关系传递性", "a!=a 恒矛盾"],
    followUps: ["差分约束系统（x-y≤k）如何用最短路判可行解？", "类型推导中的 unify 与并查集有什么对应关系？"],
    favorited: false,
  },
  {
    id: "algo-2031",
    nodeId: "p2-trie-union-find",
    question: "399. 除法求值（LeetCode 399）\n给定 a/b=v 形式的等式组，回答若干查询 x/y 的值，无法确定返回 -1。",
    bigTech: true,
    answer: `【思路推导】把变量看作点、a/b=v 看作边权为 v 的有向边（反向边权 1/v），则 x/y = x 到 y 路径上边权的乘积。带权并查集是优雅解：每个节点维护「它到根的倍数」weight[x]（即 x = weight[x] × root）；find 路径压缩时同步更新 weight；union(a,b,v) 时设两节点根 ra、rb，令 weight[ra] 使等式成立：weight[ra] = weight[b]·v / weight[a]。查询时 x、y 同根才能求值，结果 = weight[x]/weight[y]。Floyd 或 DFS 建图也可，但带权并查集支持在线加入等式。
【代码实现】
\`\`\`python
def calc_equation(equations: list[list[str]], values: list[float], queries: list[list[str]]) -> list[float]:
    parent: dict[str, str] = {}
    weight: dict[str, float] = {}  # weight[x]: x = weight[x] * parent[x]
    def find(x: str) -> str:
        if x not in parent:
            parent[x] = x
            weight[x] = 1.0
            return x
        p = parent[x]
        if p != x:
            root = find(p)
            weight[x] *= weight[p]  # 压缩时连乘
            parent[x] = root
        return parent[x]
    for (a, b), v in zip(equations, values):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            weight[ra] = weight[b] * v / weight[a]  # 关键一步
    result: list[float] = []
    for x, y in queries:
        if x not in parent and y not in parent:
            result.append(-1.0)
            continue
        rx, ry = find(x), find(y)
        if rx != ry:
            result.append(-1.0)
        else:
            result.append(weight[x] / weight[y])
    return result  # 时间 O((E+Q)·α(n))，空间 O(n)
\`\`\`
【实际应用】「比值/汇率传导」模型直接对应金融系统：外汇多级换算（USD→EUR→JPY 推导任意交叉汇率）；会计系统的多币种折算；单位换算引擎（UCUM 医疗单位标准）；供应链 BOM 表的用量比例传导。
【踩坑与变体】① find 里必须先递归拿根再更新 weight，顺序反了权重会错；② 查询的变量没出现过要返回 -1（Map 未注册）；③ 除 0 不存在的约束题目保证合法；④ 离线场景 Floyd 全源最短路（乘法取对数变加法）也行但 O(n³)；⑤ 变体「分数加减法」纯属解析题，别混淆。`,
    keyPoints: ["变量为点、比值为边权", "weight[x]=x 到根的倍数", "find 压缩同步连乘权重", "同根才可求值"],
    followUps: ["带权并查集中 union 时 weight[ra] 的赋值公式如何推导？", "如果等式可能矛盾（a/b=2 又 a/b=3），如何检测冲突？"],
    favorited: false,
  },
  // ===== Phase 2 新增：图论进阶（6题）=====
  {
    id: "algo-2032",
    nodeId: "p2-graph-advanced",
    question: "210. 课程表 II（LeetCode 210）\n给定课程先修关系，返回一个满足所有先修约束的学习顺序；有环无解返回空数组。",
    bigTech: true,
    answer: `【思路推导】拓扑排序的标准应用：Kahn 算法（BFS 版）。建图后统计每个节点的入度，入度为 0 的节点（无先修课）先入队；每次出队一个节点就「修掉」它——把它加入结果、所有后继入度减 1，减到 0 的后继入队。若最终结果不足 n 个节点，说明剩下的节点互相等待成环，无解。DFS 版则用三色标记（白/灰/黑）：DFS 中遇到灰色节点说明存在回边即成环，正常退栈时逆序加入结果。
【代码实现】
\`\`\`python
from collections import deque

def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    graph: list[list[int]] = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for course, pre in prerequisites:
        graph[pre].append(course)
        indeg[course] += 1
    queue = deque(i for i, d in enumerate(indeg) if d == 0)
    order: list[int] = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return order if len(order) == num_courses else []  # 时间 O(V+E)，空间 O(V+E)
\`\`\`
【实际应用】拓扑排序是依赖调度的数学骨架：构建系统（Make/Bazel）按依赖图编排编译任务；CI/CD 流水线的 stage 编排；Kubernetes 的 InitContainer 顺序；前端打包器的模块解析顺序；数据库迁移（migration）脚本的依赖排序。入队顺序可用优先队列控制（如字典序最小方案，630/269 题变体）。
【踩坑与变体】① 注意边方向：prerequisites[i]=[a,b] 表示 b→a（先 b 后 a），建反图答案全错；② 队列用数组+head 指针替代 shift()，否则 O(n²)；③ 结果个数 < n 即环，但「具体是哪几个点成环」要 DFS 三色版定位；④ 269「外星文字典」是拓扑排序的进阶：先从相邻词比较中推字母序关系再排。`,
    keyPoints: ["Kahn：入度 0 入队逐层剥离", "结果数 < n 即成环", "DFS 三色标记判环", "依赖调度的通用骨架"],
    followUps: ["DFS 三色标记法如何在拓扑排序的同时找出环上的具体节点？", "如何输出字典序最小的拓扑序（269 外星文字典）？"],
    favorited: false,
  },
  {
    id: "algo-2033",
    nodeId: "p2-graph-advanced",
    question: "1514. 概率最大的路径（LeetCode 1514）\n无向图每条边有通过概率，求从 start 到 end 的最大概率路径的概率值。",
    bigTech: false,
    answer: `【思路推导】路径概率是边权的乘积，求最大乘积路径——这是 Dijkstra 的变形：把「距离最小」换成「概率最大」，用小顶堆换大顶堆，松弛条件从 dist[u]+w<dist[v] 变成 prob[u]·w>prob[v]。为什么贪心仍成立？概率 ∈[0,1]，乘积单调不增，已确定最大概率的节点不会被其他路径改进（非负权 Dijkstra 正确性在「乘法单调+值域有界」下同样成立）。也可用取对数把乘法变加法（权重 -log(p) 求最短路），但浮点精度要小心。
【代码实现】
\`\`\`python
import heapq

def max_probability(n: int, edges: list[list[int]], succ_prob: list[float], start: int, end: int) -> float:
    graph: list[list[tuple[int, float]]] = [[] for _ in range(n)]
    for (a, b), p in zip(edges, succ_prob):
        graph[a].append((b, p))
        graph[b].append((a, p))
    prob = [0.0] * n
    prob[start] = 1.0
    heap: list[tuple[float, int]] = [(-1.0, start)]  # 取负模拟大顶堆
    while heap:
        neg_p, u = heapq.heappop(heap)
        p = -neg_p
        if u == end:
            return p  # 首次弹出即最优
        if p < prob[u]:
            continue  # 过期堆元素
        for v, w in graph[u]:
            if p * w > prob[v]:
                prob[v] = p * w
                heapq.heappush(heap, (-prob[v], v))
    return 0.0  # 时间 O(E·logV)，空间 O(V+E)
\`\`\`
【实际应用】「最大可信路径」模型：网络可靠性规划（每条链路有可用率，选整体可用率最高的路由）；金融反欺诈的关联路径置信度计算；推荐系统知识图谱中实体关系的置信度传播；自动驾驶路径规划的成功通过率优化。
【踩坑与变体】① 弹出 end 即可返回（Dijkstra 性质：首次弹出即最优）；② 堆中过期元素（概率小于已记录值）要跳过；③ JS 无内置堆，sort+shift 仅适合演示，生产用二叉堆实现；④ 概率连乘下溢（长路径趋近 0）时用对数域计算；⑤ 对比 Bellman-Ford：边权为正（或对数域非负）时 Dijkstra 更优。`,
    keyPoints: ["Dijkstra 变形：最小→最大乘积", "概率∈[0,1]保证贪心正确", "首次弹出 end 即最优", "对数域化乘为加"],
    followUps: ["为什么概率乘积路径可以直接套 Dijkstra 而不用担心负环？", "如果边权是「通过率」且要求恰好经过 k 条边，问题变成什么样？"],
    favorited: false,
  },
  {
    id: "algo-2034",
    nodeId: "p2-graph-advanced",
    question: "1631. 最小体力消耗路径（LeetCode 1631）\n网格中移动，一条路径的体力消耗是路径上相邻格子高度差绝对值的最大值，求从左上到右下的最小消耗。",
    bigTech: false,
    answer: `【思路推导】路径代价 = 路径上最大边权，求最小化这个最大值——「最小瓶颈路径」问题。两种主流解：① 变形 Dijkstra：dist[x] 表示到 x 的最小瓶颈值，松弛 dist[v]=min(dist[v], max(dist[u], |h[u]-h[v]|))，大顶堆每次扩展当前瓶颈最小的节点，O(mn·log(mn))；② 二分答案+并查集/BFS：二分瓶颈值 D，只走高度差 ≤ D 的边看能否连通左上右下，单调性显然，O(mn·log(高度差))。识别信号与二分答案家族一致：最小化最大值。
【代码实现】
\`\`\`python
def minimum_effort_path(heights: list[list[int]]) -> int:
    m, n = len(heights), len(heights[0])
    lo = 0
    hi = 0
    for i in range(m):
        for j in range(n):
            if i + 1 < m:
                hi = max(hi, abs(heights[i][j] - heights[i + 1][j]))
            if j + 1 < n:
                hi = max(hi, abs(heights[i][j] - heights[i][j + 1]))
    def can_reach(d: int) -> bool:
        seen = [[False] * n for _ in range(m)]
        stack: list[tuple[int, int]] = [(0, 0)]
        seen[0][0] = True
        while stack:
            i, j = stack.pop()
            if i == m - 1 and j == n - 1:
                return True
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ni, nj = i + di, j + dj
                if 0 <= ni < m and 0 <= nj < n and not seen[ni][nj] \\
                        and abs(heights[ni][nj] - heights[i][j]) <= d:
                    seen[ni][nj] = True
                    stack.append((ni, nj))
        return False
    while lo < hi:
        mid = (lo + hi) >> 1
        if can_reach(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo  # 时间 O(mn·log(hi))，空间 O(mn)
\`\`\`
【实际应用】瓶颈路径是网络规划的常客：选路时让「链路中最差一跳的带宽」尽量大（宽宽路径 widest path，QoS 路由）；物流配送让路线中「最陡路段坡度」最小（电动车续航友好）；数据中心选址考虑最坏时延。
【踩坑与变体】① 别错用「路径总长度最小」——本题是最大边最小，BFS 无权图思路不适用；② 二分上界 hi 预先扫描最大相邻差，比固定 10^6 省迭代；③ 变形 Dijkstra 的堆排键是瓶颈值而非累加和；④ Kruskal 视角：按边权从小到大加边，左上右下首次连通时的边权即答案（最小生成树的路径最小化最大边）。`,
    keyPoints: ["最小瓶颈路径", "二分+BFS 连通判定", "变形 Dijkstra 堆排瓶颈值", "Kruskal 首次连通边权即解"],
    followUps: ["为什么最小生成树上任意两点间的路径是最小瓶颈路径？", "如果要求「路径总消耗」最小而非最大边最小，算法怎么改？"],
    favorited: false,
  },
  {
    id: "algo-2035",
    nodeId: "p2-graph-advanced",
    question: "1584. 连接所有点的最小费用（LeetCode 1584）\n平面上若干点，两点连接费用为曼哈顿距离，求连通所有点的最小总费用（最小生成树）。",
    bigTech: true,
    answer: `【思路推导】标准 MST：Kruskal 与 Prim 都要会。Kruskal：生成所有 O(n²) 条边按权排序，从小到大用并查集加边（不成环就纳入），加到 n-1 条即完成，O(E·logE)；Prim：从任意点出发，维护「树内到树外的最小边」（懒删除堆或 dist 数组），每次把最近的树外点拉入树，稠密图用数组版 O(n²) 更优。曼哈顿距离完全图边数 O(n²)，n=1000 时 50 万条边，Kruskal 排序可行；点更多时需利用曼哈顿距离的几何性质剪枝（只保留最近邻候选边）。
【代码实现】
\`\`\`python
def min_cost_connect_points(points: list[list[int]]) -> int:
    n = len(points)
    edges: list[tuple[int, int, int]] = []
    for i in range(n):
        for j in range(i + 1, n):
            edges.append((
                abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]),
                i, j,
            ))
    edges.sort(key=lambda e: e[0])
    parent = list(range(n))
    def find(x: int) -> int:
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
    cost, used = 0, 0
    for w, u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            continue  # 成环跳过
        parent[ru] = rv
        cost += w
        used += 1
        if used == n - 1:
            break  # 树已成型
    return cost  # 时间 O(E·logE)，空间 O(E)
\`\`\`
【实际应用】MST 是网络建设成本优化的原型：电网/光缆铺设的最小总长；聚类分析的单链接层次聚类（MST 删最长 k-1 条边得 k 簇）；芯片布线的 Steiner 树近似；图像分割（Graph-based Segmentation，Felzenszwalb 算法）直接用 MST。
【踩坑与变体】① Kruskal 加到 n-1 条边立即停，别扫完所有边；② 完全图无需显式存边可改用 Prim 数组版省内存；③ 曼哈顿距离下最优解只可能含「按 x、x+y、x-y 排序后相邻点」的边（高级剪枝）；④ Prim 懒删除版堆里有旧 dist 条目要跳过；⑤ 对比：次小生成树、度限制生成树是竞赛进阶。`,
    keyPoints: ["Kruskal：排序+并查集加边", "Prim：树外最近点贪心", "n-1 条边即停", "MST 路径最小化最大边"],
    followUps: ["证明 Kruskal 的贪心正确性（切割定理）。", "如何用 MST 删除最长 k-1 条边实现 k 聚类？与 KMeans 有何差异？"],
    favorited: false,
  },
  {
    id: "algo-2036",
    nodeId: "p2-graph-advanced",
    question: "332. 重新安排行程（LeetCode 332）\n给定机票 [from, to]，从 JFK 出发用完所有机票，求字典序最小的行程（欧拉路径）。",
    bigTech: true,
    answer: `【思路推导】用完所有边恰好一次 ⟺ 欧拉路径（Hierholzer 算法）。贪心 DFS 会走进死胡同（先用了关键边导致剩余边走不完），Hierholzer 的精髓是「逆序插入」：DFS 到底（某节点没有未用出边）时才把它压入结果栈，最后逆序输出——先被困住的节点排在行程后部，保证所有边都被走掉。字典序最小通过「邻接表按目的地升序」实现：DFS 总是先尝试字典序最小的下一段。多重边用「每个邻接表项弹出即消费」处理。
【代码实现】
\`\`\`python
from collections import defaultdict

def find_itinerary(tickets: list[list[str]]) -> list[str]:
    graph: dict[str, list[str]] = defaultdict(list)
    for from_, to in tickets:
        graph[from_].append(to)
    for lst in graph.values():
        lst.sort()  # 字典序优先
    route: list[str] = []
    def dfs(u: str) -> None:
        lst = graph.get(u)
        while lst:
            dfs(lst.pop(0))  # 消费边
        route.append(u)  # 死路节点逆序入栈
    dfs("JFK")
    return route[::-1]  # 时间 O(E·logE)，空间 O(E)
\`\`\`
【实际应用】欧拉路径是「一笔画」的工程化身：物流派送的无重复路线规划（邮路问题）；PCB 自动布线的一次走线；DNA 测序的 De Bruijn 图拼接（reads 重建成基因组，bioinformatics 核心）；网络抓包的 TCP 流重组。
【踩坑与变体】① 必须「先递归后入栈再逆序」，先记录访问顺序会得到非法行程（死胡同场景）；② shift() 是 O(E)，生产用下标指针；③ 图不保证连通？本题保证有解，但工程上要校验欧拉条件（入度出度差 ≤1）；④ 对比「字母序最小拓扑序」：欧拉用 Hierholzer 逆序，拓扑用优先队列 Kahn，别混。`,
    keyPoints: ["Hierholzer 逆序插入", "邻接表排序保字典序", "边消费制防重用", "死路节点排尾部"],
    followUps: ["为什么朴素的「先访问先记录」DFS 会在欧拉路径上失效？举一反例。", "De Bruijn 图如何用欧拉路径解决基因组拼接？"],
    favorited: false,
  },
  {
    id: "algo-2037",
    nodeId: "p2-graph-advanced",
    question: "743. 网络延迟时间（LeetCode 743）\n有向加权图，信号从节点 k 出发沿边传播，求所有节点收到信号的最早时刻（最大值）；有节点收不到返回 -1。",
    bigTech: true,
    answer: `【思路推导】这就是单源最短路径的直球应用：dist[x] = k 到 x 的最短耗时，答案是 max(dist)，有 dist 为 ∞ 则 -1。正权图用 Dijkstra（堆优化 O(E·logV)）：每次从堆中取 dist 最小的未确定节点，它的最短路已确定（贪心核心：正权保证不会有更短路径绕过来），用它松弛所有出边。Bellman-Ford（O(V·E)）作为对照：支持负权、可判负环，但正权场景 Dijkstra 完胜。SPFA 是 Bellman-Ford 的队列优化，最坏退化。
【代码实现】
\`\`\`python
import heapq
import math

def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    graph: list[list[tuple[int, int]]] = [[] for _ in range(n + 1)]
    for u, v, w in times:
        graph[u].append((v, w))
    dist: list[float] = [math.inf] * (n + 1)
    dist[k] = 0
    heap: list[tuple[int, int]] = [(0, k)]  # [dist, 节点]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # 过期条目
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (int(dist[v]), v))
    ans = max(dist[1:])  # 节点编号 1..n
    return -1 if ans == math.inf else int(ans)  # 时间 O(E·logV)，空间 O(V+E)
\`\`\`
【实际应用】Dijkstra 是一切「最小代价传播」的原型：OSPF 路由协议每台路由器独立跑 Dijkstra 算最短路径树；地图导航的驾车路径（配 A* 启发加速）；社交网络信息传播时延分析；游戏中的 NPC 寻路。BGP 协议则用路径向量（类 Bellman-Ford），因为策略路由不满足纯距离贪心。
【踩坑与变体】① 节点编号 1..n，dist 开 n+1 并切掉 0 号再取 max；② 懒删除堆必须跳过 d>dist[u] 的过期条目；③ 负权边时 Dijkstra 失效（已确定节点可能被改进），换 Bellman-Ford；④ 求「信号从任意点出发的全源最短」用 Floyd；⑤ 变体「概率最大路径」把加法换乘法、最小换最大。`,
    keyPoints: ["单源最短路取 max(dist)", "Dijkstra 正权贪心", "过期堆条目跳过", "负权换 Bellman-Ford"],
    followUps: ["证明 Dijkstra 中「弹出节点的 dist 即最短路」的贪心正确性。", "A* 算法的启发函数需要满足什么条件才能保证最优解？"],
    favorited: false,
  },
];

// ============================================================
// 学习计划：20 个专题，每个先 learn 后 review，每天 2 项，共 20 天
// ============================================================

function buildSchedule(): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  // 拓扑顺序：Phase1 → Phase2 → Phase3
  // 时间预算：learn ≈ 每题 30 分钟，review ≈ 每题 15 分钟（按各节点实际题量估算）
  const order: [string, "learn" | "review", number][] = [
    // Phase 1
    ["p1-array-string", "learn", 600], // 20 题
    ["p1-array-string", "review", 300],
    ["p1-hash", "learn", 120], // 4 题
    ["p1-hash", "review", 60],
    ["p1-linkedlist", "learn", 300], // 10 题
    ["p1-linkedlist", "review", 150],
    ["p1-stack-queue", "learn", 180], // 6 题
    ["p1-stack-queue", "review", 90],
    ["p1-tree", "learn", 360], // 12 题
    ["p1-tree", "review", 180],
    ["p1-backtrack", "learn", 180], // 6 题
    ["p1-backtrack", "review", 90],
    ["p1-sort-binary", "learn", 210], // 7 题
    ["p1-sort-binary", "review", 105],
    // Phase 2
    ["p2-dp", "learn", 630], // 21 题
    ["p2-dp", "review", 315],
    ["p2-graph", "learn", 330], // 11 题
    ["p2-graph", "review", 165],
    ["p2-heap", "learn", 120], // 4 题
    ["p2-heap", "review", 60],
    ["p2-greedy", "learn", 240], // 8 题
    ["p2-greedy", "review", 120],
    ["p2-highfreq", "learn", 690], // 23 题
    ["p2-highfreq", "review", 345],
    // Phase 2 补丁专题
    ["p2-bit-math", "learn", 210], // 7 题
    ["p2-bit-math", "review", 105],
    ["p2-string-match", "learn", 180], // 6 题
    ["p2-string-match", "review", 90],
    ["p2-mono-queue", "learn", 180], // 6 题
    ["p2-mono-queue", "review", 90],
    ["p2-binary-answer", "learn", 180], // 6 题
    ["p2-binary-answer", "review", 90],
    ["p2-trie-union-find", "learn", 180], // 6 题
    ["p2-trie-union-find", "review", 90],
    ["p2-graph-advanced", "learn", 180], // 6 题
    ["p2-graph-advanced", "review", 90],
    // Phase 3
    ["p3-bytedance-tencent", "learn", 570], // 19 题
    ["p3-bytedance-tencent", "review", 285],
    ["p3-ali-meituan", "learn", 360], // 12 题
    ["p3-ali-meituan", "review", 180],
  ];

  order.forEach(([nodeId, type, minutes], idx) => {
    schedule.push({
      day: Math.floor(idx / 2) + 1, // 每 2 项一天，共 20 天
      nodeId,
      type,
      estimatedMinutes: minutes,
      completed: false,
    });
  });
  return schedule;
}

// ============================================================
// 导出
// ============================================================

export interface Algorithm200Preset {
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

export const ALGORITHM_200_PRESET: Algorithm200Preset = {
  topic: "LeetCode 200 题全攻略",
  knowledgeTree: ALGORITHM_200_NODES,
  questions: ALGORITHM_200_QUESTIONS,
  schedule: buildSchedule(),
};