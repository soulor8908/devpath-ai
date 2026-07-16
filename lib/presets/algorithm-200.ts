// lib/presets/algorithm-200.ts
// LeetCode 200 题全攻略预设：14 知识节点 + 156 道精选题（去重后）+ 14 天学习计划
// 数据来源：主项目 algorithm/leetcode-checklist.md
// 覆盖：Phase1 基础筑基 / Phase2 进阶突破 / Phase3 冲刺保温
// 跳过"（重）"标记重复题及 Phase3 空白模拟面试部分

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
    summary: "面试最高频：最大子数组和、回文链表、相交链表、LCA、螺旋矩阵、KMP 等。必须秒杀。",
    mastery: 0,
    customOrder: 12,
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
    customOrder: 13,
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
    customOrder: 14,
  },
];

// ============================================================
// 题目
// ============================================================

const ALGORITHM_200_QUESTIONS: Question[] = [
  // ===== Phase 1：数组与字符串（18题）=====
  {
    id: "algo-1",
    nodeId: "p1-array-string",
    question: "1. 两数之和（LeetCode 1）\n给定一个整数数组 nums 和目标值 target，返回和为 target 的两个元素的下标。假设恰好有一个解。",
    answer: `// 思路：哈希表一次遍历，边存边查 target-num
// 时间 O(n)，空间 O(n)
// 关键：一次遍历，边存边查

func twoSum(nums []int, target int) []int {
    m := map[int]int{}
    for i, num := range nums {
        if j, ok := m[target-num]; ok {
            return []int{j, i}
        }
        m[num] = i
    }
    return nil
}`,
    keyPoints: ["哈希表 O(1) 查找", "一次遍历边存边查", "返回下标不是值"],
    followUps: ["如果数组有序，能否用双指针 O(1) 空间？", "如果有多组答案怎么办？"],
    favorited: false,
  },
  {
    id: "algo-49",
    nodeId: "p1-array-string",
    question: "49. 字母异位词分组（LeetCode 49）\n给定字符串数组，将字母异位词组合在一起。",
    answer: `// 思路：排序后的字符串作为哈希 key 分组
// 时间 O(n·k·logk)，空间 O(n·k)
// 关键：排序字符串作为 key

func groupAnagrams(strs []string) [][]string {
    m := map[string][]string{}
    for _, s := range strs {
        b := []byte(s)
        sort.Slice(b, func(i, j int) bool { return b[i] < b[j] })
        m[string(b)] = append(m[string(b)], s)
    }
    res := [][]string{}
    for _, v := range m { res = append(res, v) }
    return res
}`,
    keyPoints: ["排序字符串作为哈希 key", "也可用字符计数数组作 key"],
    followUps: ["用字符计数（26 长度数组）代替排序能否更快？"],
    favorited: false,
  },
  {
    id: "algo-128",
    nodeId: "p1-array-string",
    question: "128. 最长连续序列（LeetCode 128）\n给定未排序数组，找最长连续元素序列长度。要求 O(n) 时间。",
    answer: `// 思路：哈希集合，只从序列起点开始计数
// 时间 O(n)，空间 O(n)
// 关键：只从 num-1 不在集合中的数开始

func longestConsecutive(nums []int) int {
    set := map[int]bool{}
    for _, n := range nums { set[n] = true }
    maxLen := 0
    for n := range set {
        if !set[n-1] { // 只有起点才计数
            cur, length := n, 1
            for set[cur+1] { cur++; length++ }
            maxLen = max(maxLen, length)
        }
    }
    return maxLen
}`,
    keyPoints: ["哈希集合去重", "只从序列起点（num-1 不存在）开始", "O(n) 不是 O(n²)"],
    followUps: ["如果允许 O(n logn) 怎么做？", "有重复元素怎么办？"],
    favorited: false,
  },
  {
    id: "algo-283",
    nodeId: "p1-array-string",
    question: "283. 移动零（LeetCode 283）\n将数组中所有 0 移到末尾，保持非零元素相对顺序，原地操作。",
    answer: `// 思路：快慢双指针，慢指针指向下一个非零位置
// 时间 O(n)，空间 O(1)
// 关键：快指针扫，遇到非零就交换到慢指针位置

func moveZeroes(nums []int) {
    slow := 0
    for fast := 0; fast < len(nums); fast++ {
        if nums[fast] != 0 {
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow++
        }
    }
}`,
    keyPoints: ["快慢双指针", "交换而非覆盖", "保持相对顺序"],
    followUps: ["如果要把零移到前面呢？", "如果要保持稳定排序？"],
    favorited: false,
  },
  {
    id: "algo-11",
    nodeId: "p1-array-string",
    question: "11. 盛最多水的容器（LeetCode 11）\n找出两条线与 x 轴构成的容器，使其能容纳最多水。",
    answer: `// 思路：双指针从两端向内，每次移动较矮的一边
// 时间 O(n)，空间 O(1)
// 关键：贪心——移动较矮边才可能找到更大面积

func maxArea(height []int) int {
    l, r, maxW := 0, len(height)-1, 0
    for l < r {
        h := min(height[l], height[r])
        maxW = max(maxW, h*(r-l))
        if height[l] < height[r] { l++ } else { r-- }
    }
    return maxW
}`,
    keyPoints: ["双指针从两端向内", "贪心：移动较矮边", "面积 = min(h1,h2) × 宽度"],
    followUps: ["为什么移动较矮的一边是正确的？请证明。"],
    favorited: false,
  },
  {
    id: "algo-15",
    nodeId: "p1-array-string",
    question: "15. 三数之和（LeetCode 15）\n返回数组中所有和为 0 的不重复三元组。",
    answer: `// 思路：排序后固定一个数 + 双指针
// 时间 O(n²)，空间 O(1)
// 关键：排序 + 固定一个数后双指针 + 三层去重

func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    var res [][]int
    for i := 0; i < len(nums)-2; i++ {
        if i > 0 && nums[i] == nums[i-1] { continue } // 去重
        l, r := i+1, len(nums)-1
        for l < r {
            sum := nums[i] + nums[l] + nums[r]
            if sum < 0 { l++ } else if sum > 0 { r-- } else {
                res = append(res, []int{nums[i], nums[l], nums[r]})
                for l < r && nums[l] == nums[l+1] { l++ }
                for l < r && nums[r] == nums[r-1] { r-- }
                l++; r--
            }
        }
    }
    return res
}`,
    keyPoints: ["先排序", "固定一个数 + 双指针", "三层去重逻辑"],
    followUps: ["四数之和怎么解？", "不排序能否用哈希？有什么问题？"],
    favorited: false,
  },
  {
    id: "algo-42",
    nodeId: "p1-array-string",
    question: "42. 接雨水（LeetCode 42）\n给定 n 个非负整数表示柱子高度，计算能接多少雨水。",
    answer: `// 思路：双指针，维护左右最大值，每次处理较矮的一侧
// 时间 O(n)，空间 O(1)
// 关键：当前柱子能接水 = min(左max, 右max) - 自身高度

func trap(height []int) int {
    l, r := 0, len(height)-1
    leftMax, rightMax, water := 0, 0, 0
    for l < r {
        if height[l] < height[r] {
            if height[l] >= leftMax { leftMax = height[l] } else { water += leftMax - height[l] }
            l++
        } else {
            if height[r] >= rightMax { rightMax = height[r] } else { water += rightMax - height[r] }
            r--
        }
    }
    return water
}`,
    keyPoints: ["双指针从两端", "维护左右最大值", "也可以用单调栈/动态规划"],
    followUps: ["用单调栈怎么解？", "二维接雨水怎么解？"],
    favorited: false,
  },
  {
    id: "algo-3",
    nodeId: "p1-array-string",
    question: "3. 无重复字符的最长子串（LeetCode 3）\n给定字符串，找不含重复字符的最长子串长度。",
    answer: `// 思路：滑动窗口 + 哈希集合
// 时间 O(n)，空间 O(min(n, 字符集))
// 关键：右指针扩展，遇重复则左指针收缩

func lengthOfLongestSubstring(s string) int {
    set := map[byte]bool{}
    l, maxLen := 0, 0
    for r := 0; r < len(s); r++ {
        for set[s[r]] { set[s[l]] = false; l++ }
        set[s[r]] = true
        maxLen = max(maxLen, r-l+1)
    }
    return maxLen
}`,
    keyPoints: ["滑动窗口", "哈希集合记录窗口内字符", "遇重复收缩左边界"],
    followUps: ["用 map 存下标能否避免内层 while？", "最长无重复子数组怎么解？"],
    favorited: false,
  },
  {
    id: "algo-438",
    nodeId: "p1-array-string",
    question: "438. 找到字符串中所有字母异位词（LeetCode 438）\n找 s 中所有 p 的字母异位词的子串起始索引。",
    answer: `// 思路：定长滑动窗口 + 字符计数匹配
// 时间 O(n)，空间 O(26)
// 关键：维护窗口内字符计数，与 p 比较

func findAnagrams(s, p string) []int {
    if len(s) < len(p) { return nil }
    var res []int
    cntS, cntP := [26]int{}, [26]int{}
    for i := range p { cntP[p[i]-'a']++; cntS[s[i]-'a']++ }
    if cntS == cntP { res = append(res, 0) }
    for i := len(p); i < len(s); i++ {
        cntS[s[i]-'a']++
        cntS[s[i-len(p)]-'a']--
        if cntS == cntP { res = append(res, i-len(p)+1) }
    }
    return res
}`,
    keyPoints: ["定长滑动窗口", "字符计数数组比较", "窗口大小 = len(p)"],
    followUps: ["如果字符集是 Unicode 怎么办？"],
    favorited: false,
  },
  {
    id: "algo-88",
    nodeId: "p1-array-string",
    question: "88. 合并两个有序数组（LeetCode 88）\n将 nums2 合并到 nums1 中，nums1 末尾有足够空间。原地合并。",
    answer: `// 思路：双指针从后往前填充，避免覆盖
// 时间 O(m+n)，空间 O(1)
// 关键：从后往前，大的先放

func merge(nums1 []int, m int, nums2 []int, n int) {
    i, j, k := m-1, n-1, m+n-1
    for i >= 0 && j >= 0 {
        if nums1[i] > nums2[j] { nums1[k] = nums1[i]; i-- } else { nums1[k] = nums2[j]; j-- }
        k--
    }
    for j >= 0 { nums1[k] = nums2[j]; j--; k-- }
}`,
    keyPoints: ["双指针从后往前", "避免从前往后覆盖", "处理剩余元素"],
    followUps: ["如果从头往前会怎样？"],
    favorited: false,
  },
  {
    id: "algo-27",
    nodeId: "p1-array-string",
    question: "27. 移除元素（LeetCode 27）\n原地移除数组中所有值为 val 的元素，返回新长度。",
    answer: `// 思路：快慢双指针覆盖
// 时间 O(n)，空间 O(1)
// 关键：快指针扫描，不等于 val 就覆盖到慢指针

func removeElement(nums []int, val int) int {
    slow := 0
    for fast := 0; fast < len(nums); fast++ {
        if nums[fast] != val { nums[slow] = nums[fast]; slow++ }
    }
    return slow
}`,
    keyPoints: ["快慢双指针", "覆盖而非删除", "返回新长度"],
    followUps: ["顺序可变时能否减少赋值次数？"],
    favorited: false,
  },
  {
    id: "algo-239",
    nodeId: "p1-array-string",
    question: "239. 滑动窗口最大值（LeetCode 239）\n返回大小为 k 的滑动窗口在数组中移动时的最大值数组。",
    answer: `// 思路：单调递减队列，队首始终是窗口最大值
// 时间 O(n)，空间 O(k)
// 关键：维护单调递减队列，队首过期则出队

func maxSlidingWindow(nums []int, k int) []int {
    var q []int // 存下标，对应值单调递减
    var res []int
    for i := 0; i < len(nums); i++ {
        // 队首出窗口
        for len(q) > 0 && q[0] <= i-k { q = q[1:] }
        // 队尾弹掉比当前小的
        for len(q) > 0 && nums[q[len(q)-1]] <= nums[i] { q = q[:len(q)-1] }
        q = append(q, i)
        if i >= k-1 { res = append(res, nums[q[0]]) }
    }
    return res
}`,
    keyPoints: ["单调递减队列", "队列存下标而非值", "队首维护窗口边界"],
    followUps: ["用大顶堆怎么解？时间复杂度？", "最小值窗口怎么解？"],
    favorited: false,
  },
  {
    id: "algo-76",
    nodeId: "p1-array-string",
    question: "76. 最小覆盖子串（LeetCode 76）\n在 s 中找包含 t 所有字符的最小子串。",
    answer: `// 思路：滑动窗口，右扩左缩，计数匹配
// 时间 O(n)，空间 O(字符集)
// 关键：维护 need 计数和 matched 计数

func minWindow(s, t string) string {
    need := map[byte]int{}
    for i := range t { need[t[i]]++ }
    l, matched, minStart, minLen := 0, 0, 0, len(s)+1
    for r := 0; r < len(s); r++ {
        if _, ok := need[s[r]]; ok {
            need[s[r]]--
            if need[s[r]] >= 0 { matched++ }
        }
        for matched == len(t) {
            if r-l+1 < minLen { minLen = r - l + 1; minStart = l }
            if _, ok := need[s[l]]; ok {
                need[s[l]]++
                if need[s[l]] > 0 { matched-- }
            }
            l++
        }
    }
    if minLen > len(s) { return "" }
    return s[minStart : minStart+minLen]
}`,
    keyPoints: ["滑动窗口右扩左缩", "need 计数 + matched 计数", "matched==len(t) 时收缩"],
    followUps: ["如果 t 有重复字符？", "如果不要求最小而是所有？"],
    favorited: false,
  },
  {
    id: "algo-41",
    nodeId: "p1-array-string",
    question: "41. 缺失的第一个正数（LeetCode 41）\n找未排序数组中缺失的最小正整数。要求 O(n) 时间 O(1) 空间。",
    answer: `// 思路：原地哈希，把 num 放到 num-1 的位置
// 时间 O(n)，空间 O(1)
// 关键：每个正数归位后，第一个不匹配的位置就是答案

func firstMissingPositive(nums []int) int {
    n := len(nums)
    for i := 0; i < n; i++ {
        for nums[i] > 0 && nums[i] <= n && nums[nums[i]-1] != nums[i] {
            nums[i], nums[nums[i]-1] = nums[nums[i]-1], nums[i]
        }
    }
    for i := 0; i < n; i++ {
        if nums[i] != i+1 { return i + 1 }
    }
    return n + 1
}`,
    keyPoints: ["原地哈希", "把值 num 放到下标 num-1", "第一个 nums[i]!=i+1 即答案"],
    followUps: ["为什么 while 不是 if？", "如果数组有重复怎么办？"],
    favorited: false,
  },
  {
    id: "algo-189",
    nodeId: "p1-array-string",
    question: "189. 轮转数组（LeetCode 189）\n将数组向右轮转 k 步。",
    answer: `// 思路：三次反转——整体反转、前 k 反转、后 n-k 反转
// 时间 O(n)，空间 O(1)
// 关键：k %= n 处理，三次反转

func rotate(nums []int, k int) {
    n := len(nums)
    k %= n
    reverse := func(l, r int) { for l < r { nums[l], nums[r] = nums[r], nums[l]; l++; r-- } }
    reverse(0, n-1)
    reverse(0, k-1)
    reverse(k, n-1)
}`,
    keyPoints: ["三次反转法", "k %= n 取模", "也可用额外数组拷贝"],
    followUps: ["向左轮转怎么改？", "环状替换怎么解？"],
    favorited: false,
  },
  {
    id: "algo-80",
    nodeId: "p1-array-string",
    question: "80. 删除有序数组中的重复项 II（LeetCode 80）\n原地删除使每个元素最多出现两次，返回新长度。",
    answer: `// 思路：快慢指针，允许保留 2 个重复
// 时间 O(n)，空间 O(1)
// 关键：慢指针从 2 开始，比较 nums[fast] 和 nums[slow-2]

func removeDuplicates(nums []int) int {
    if len(nums) <= 2 { return len(nums) }
    slow := 2
    for fast := 2; fast < len(nums); fast++ {
        if nums[fast] != nums[slow-2] { nums[slow] = nums[fast]; slow++ }
    }
    return slow
}`,
    keyPoints: ["快慢指针", "比较 nums[fast] 和 nums[slow-2]", "推广到最多 k 个"],
    followUps: ["最多保留 k 个重复怎么推广？"],
    favorited: false,
  },
  {
    id: "algo-169",
    nodeId: "p1-array-string",
    question: "169. 多数元素（LeetCode 169）\n找数组中出现次数超过 n/2 的元素。",
    answer: `// 思路：Boyer-Moore 投票算法
// 时间 O(n)，空间 O(1)
// 关键：候选人+计数，相同+1不同-1，归零换人

func majorityElement(nums []int) int {
    candidate, count := 0, 0
    for _, n := range nums {
        if count == 0 { candidate = n }
        if n == candidate { count++ } else { count-- }
    }
    return candidate
}`,
    keyPoints: ["Boyer-Moore 投票", "多数元素一定存活", "O(1) 空间"],
    followUps: ["超过 n/3 的元素怎么找？", "如何验证候选人？"],
    favorited: false,
  },
  {
    id: "algo-215",
    nodeId: "p1-array-string",
    question: "215. 数组中的第 K 个最大元素（LeetCode 215）\n找数组中第 K 大的元素。",
    answer: `// 思路：快速选择，partition 后看哪半边
// 时间平均 O(n)，最坏 O(n²)，空间 O(1)
// 关键：随机 pivot 避免最坏情况

func findKthLargest(nums []int, k int) int {
    target := len(nums) - k // 转为第 target 小
    l, r := 0, len(nums)-1
    for l < r {
        p := partition(nums, l, r)
        if p == target { return nums[p] }
        if p < target { l = p + 1 } else { r = p - 1 }
    }
    return nums[l]
}
func partition(nums []int, l, r int) int {
    pivot := nums[r]
    i := l
    for j := l; j < r; j++ {
        if nums[j] < pivot { nums[i], nums[j] = nums[j], nums[i]; i++ }
    }
    nums[i], nums[r] = nums[r], nums[i]
    return i
}`,
    keyPoints: ["快速选择（快排变体）", "随机 pivot 优化", "也可用小顶堆 O(n·logk)"],
    followUps: ["用堆怎么解？时间复杂度？", "如何保证 O(n) 最坏？"],
    favorited: false,
  },

  // ===== Phase 1：哈希表（3题，跳过重题）=====
  {
    id: "algo-347",
    nodeId: "p1-hash",
    question: "347. 前 K 个高频元素（LeetCode 347）\n返回数组中出现频率前 K 高的元素。",
    answer: `// 思路：哈希计数 + 桶排序（按频率分桶）
// 时间 O(n)，空间 O(n)
// 关键：频率作为桶下标，从高到低收集

func topKFrequent(nums []int, k int) []int {
    cnt := map[int]int{}
    for _, n := range nums { cnt[n]++ }
    // 桶：频率 i 存对应元素
    bucket := make([][]int, len(nums)+1)
    for n, c := range cnt { bucket[c] = append(bucket[c], n) }
    var res []int
    for i := len(bucket) - 1; i >= 0 && len(res) < k; i-- {
        res = append(res, bucket[i]...)
    }
    return res[:k]
}`,
    keyPoints: ["哈希表计数", "桶排序按频率", "也可用小顶堆 O(n·logk)"],
    followUps: ["用堆怎么解？时间复杂度？", "如果要求 O(n) 最坏呢？"],
    favorited: false,
  },
  {
    id: "algo-448",
    nodeId: "p1-hash",
    question: "448. 找到所有数组中消失的数字（LeetCode 448）\n数组长度 n，元素 1~n，找消失的数字。O(n) 时间 O(1) 空间。",
    answer: `// 思路：原地标记，用下标映射值，出现过就标记为负
// 时间 O(n)，空间 O(1)
// 关键：用值的正负做标记，不破坏信息

func findDisappearedNumbers(nums []int) []int {
    for _, n := range nums {
        idx := abs(n) - 1
        if nums[idx] > 0 { nums[idx] = -nums[idx] }
    }
    var res []int
    for i := range nums {
        if nums[i] > 0 { res = append(res, i+1) }
    }
    return res
}`,
    keyPoints: ["原地标记法", "用正负做标记", "不额外开空间"],
    followUps: ["找到重复的数字怎么解？", "恢复数组怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-146",
    nodeId: "p1-hash",
    question: "146. LRU 缓存（LeetCode 146）\n设计 O(1) get 和 put 的 LRU 缓存。",
    answer: `// 思路：哈希表 + 双向链表，访问即移到头部，满则删尾部
// 时间 O(1)，空间 O(capacity)
// 关键：哈希表存节点指针，双向链表维护顺序

type DLinkedNode struct {
    key, val  int
    prev, next *DLinkedNode
}
type LRUCache struct {
    cap int
    cache map[int]*DLinkedNode
    head, tail *DLinkedNode // 哨兵
}
func (c *LRUCache) moveToHead(node *DLinkedNode) { /* 摘出+插头 */ }
func (c *LRUCache) removeTail() *DLinkedNode { /* 删尾 */ }
func (c *LRUCache) get(key int) int {
    if node, ok := c.cache[key]; ok { c.moveToHead(node); return node.val }
    return -1
}
func (c *LRUCache) put(key, val int) {
    if node, ok := c.cache[key]; ok { node.val = val; c.moveToHead(node); return }
    node := &DLinkedNode{key: key, val: val}
    c.cache[key] = node
    // 插入头部
    if len(c.cache) > c.cap { tail := c.removeTail(); delete(c.cache, tail.key) }
}`,
    keyPoints: ["哈希表 + 双向链表", "哨兵节点简化边界", "访问移头、满则删尾"],
    followUps: ["LFU 怎么实现？", "用 LinkedHashMap 简化怎么做？"],
    favorited: false,
  },

  // ===== Phase 1：链表（10题）=====
  {
    id: "algo-21",
    nodeId: "p1-linkedlist",
    question: "21. 合并两个有序链表（LeetCode 21）\n将两个升序链表合并为一个新的升序链表。",
    answer: `// 思路：虚拟头节点 + 逐个比较拼接
// 时间 O(n+m)，空间 O(1)
// 关键：虚拟头节点简化头节点处理

func mergeTwoLists(l1, l2 *ListNode) *ListNode {
    dummy := &ListNode{}
    cur := dummy
    for l1 != nil && l2 != nil {
        if l1.Val < l2.Val { cur.Next = l1; l1 = l1.Next } else { cur.Next = l2; l2 = l2.Next }
        cur = cur.Next
    }
    if l1 != nil { cur.Next = l1 } else { cur.Next = l2 }
    return dummy.Next
}`,
    keyPoints: ["虚拟头节点", "迭代拼接", "处理剩余链表"],
    followUps: ["递归写法怎么写？", "合并 K 个有序链表呢？"],
    favorited: false,
  },
  {
    id: "algo-141",
    nodeId: "p1-linkedlist",
    question: "141. 环形链表（LeetCode 141）\n判断链表是否有环。",
    answer: `// 思路：Floyd 快慢指针，有环必相遇
// 时间 O(n)，空间 O(1)
// 关键：快指针走两步，慢指针走一步

func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast { return true }
    }
    return false
}`,
    keyPoints: ["Floyd 快慢指针", "快走 2 慢走 1", "相遇即有环"],
    followUps: ["如何找到环的入口？", "环的长度怎么求？"],
    favorited: false,
  },
  {
    id: "algo-142",
    nodeId: "p1-linkedlist",
    question: "142. 环形链表 II（LeetCode 142）\n找到环形链表的环入口节点。",
    answer: `// 思路：快慢指针相遇后，一个从头出发同步走再相遇即入口
// 时间 O(n)，空间 O(1)
// 关键：数学证明——a = c + (n-1)(b+c)

func detectCycle(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next; fast = fast.Next.Next
        if slow == fast {
            p := head
            for p != slow { p = p.Next; slow = slow.Next }
            return p
        }
    }
    return nil
}`,
    keyPoints: ["快慢指针找相遇点", "再从头同步走相遇即入口", "数学推导 a=c+(n-1)(b+c)"],
    followUps: ["环长度怎么求？", "多个环可能吗？"],
    favorited: false,
  },
  {
    id: "algo-206",
    nodeId: "p1-linkedlist",
    question: "206. 反转链表（LeetCode 206）\n反转单链表。",
    answer: `// 思路：三指针 prev/cur/next 逐个翻转
// 时间 O(n)，空间 O(1)
// 关键：保存 next 再翻转指针

func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    cur := head
    for cur != nil {
        next := cur.Next
        cur.Next = prev
        prev = cur
        cur = next
    }
    return prev
}`,
    keyPoints: ["迭代三指针", "也可递归实现", "注意处理 head 为 nil"],
    followUps: ["反转链表 II（区间反转）怎么解？", "K 个一组反转呢？"],
    favorited: false,
  },
  {
    id: "algo-92",
    nodeId: "p1-linkedlist",
    question: "92. 反转链表 II（LeetCode 92）\n反转从位置 left 到 right 的链表段。",
    answer: `// 思路：找到反转段前驱，反转段内链表，重新连接
// 时间 O(n)，空间 O(1)
// 关键：虚拟头节点 + 记录前驱和反转段起点

func reverseBetween(head *ListNode, left, right int) *ListNode {
    dummy := &ListNode{Next: head}
    prev := dummy
    for i := 1; i < left; i++ { prev = prev.Next }
    cur := prev.Next
    for i := 0; i < right-left; i++ {
        next := cur.Next
        cur.Next = next.Next
        next.Next = prev.Next
        prev.Next = next
    }
    return dummy.Next
}`,
    keyPoints: ["虚拟头节点", "头插法反转区间", "记录前驱节点"],
    followUps: ["K 个一组反转怎么解？", "递归怎么写？"],
    favorited: false,
  },
  {
    id: "algo-19",
    nodeId: "p1-linkedlist",
    question: "19. 删除链表的倒数第 N 个结点（LeetCode 19）\n删除链表倒数第 N 个节点。",
    answer: `// 思路：快慢指针，快指针先走 N 步，再同步走
// 时间 O(n)，空间 O(1)
// 关键：虚拟头节点处理删头节点的情况

func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    fast, slow := dummy, dummy
    for i := 0; i < n; i++ { fast = fast.Next }
    for fast.Next != nil { fast = fast.Next; slow = slow.Next }
    slow.Next = slow.Next.Next
    return dummy.Next
}`,
    keyPoints: ["快慢指针", "快指针先走 N 步", "虚拟头节点处理删头"],
    followUps: ["如果 n 大于链表长度？", "只遍历一次怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-24",
    nodeId: "p1-linkedlist",
    question: "24. 两两交换链表中的节点（LeetCode 24）\n每两个相邻节点交换，返回头节点。",
    answer: `// 思路：虚拟头节点，每次交换后面两个节点
// 时间 O(n)，空间 O(1)
// 关键：记录三个指针完成交换

func swapPairs(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    prev := dummy
    for prev.Next != nil && prev.Next.Next != nil {
        a, b := prev.Next, prev.Next.Next
        prev.Next = b
        a.Next = b.Next
        b.Next = a
        prev = a
    }
    return dummy.Next
}`,
    keyPoints: ["虚拟头节点", "三指针交换", "prev 跟进"],
    followUps: ["递归怎么写？", "K 个一组交换怎么解？"],
    favorited: false,
  },
  {
    id: "algo-25",
    nodeId: "p1-linkedlist",
    question: "25. K 个一组翻转链表（LeetCode 25）\n每 K 个节点一组翻转，不足 K 个保持原样。",
    answer: `// 思路：分组翻转，先数 K 个再反转再连接
// 时间 O(n)，空间 O(1)
// 关键：虚拟头节点 + 分组反转 + 尾部连接

func reverseKGroup(head *ListNode, k int) *ListNode {
    dummy := &ListNode{Next: head}
    prevGroup := dummy
    for {
        // 数 k 个
        tail := prevGroup
        for i := 0; i < k; i++ {
            tail = tail.Next
            if tail == nil { return dummy.Next }
        }
        nextGroup := tail.Next
        // 反转 prevGroup.Next 到 tail
        prev, cur := nextGroup, prevGroup.Next
        for cur != nextGroup {
            tmp := cur.Next
            cur.Next = prev
            prev = cur
            cur = tmp
        }
        newTail := prevGroup.Next
        prevGroup.Next = tail
        newTail.Next = nextGroup
        prevGroup = newTail
    }
}`,
    keyPoints: ["分组反转", "虚拟头节点", "连接前后组"],
    followUps: ["不足 K 个也翻转怎么改？", "递归怎么写？"],
    favorited: false,
  },
  {
    id: "algo-138",
    nodeId: "p1-linkedlist",
    question: "138. 随机链表的复制（LeetCode 138）\n深拷含 random 指针的链表。",
    answer: `// 思路：在每个节点后插入副本，再设 random，再拆分
// 时间 O(n)，空间 O(1)
// 关键：三步走——插入副本→设random→拆分

func copyRandomList(head *Node) *Node {
    if head == nil { return nil }
    // 1. 插入副本
    for cur := head; cur != nil; cur = cur.Next.Next {
        cur.Next = &Node{Val: cur.Val, Next: cur.Next}
    }
    // 2. 设 random
    for cur := head; cur != nil; cur = cur.Next.Next {
        if cur.Random != nil { cur.Next.Random = cur.Random.Next }
    }
    // 3. 拆分
    dummy := &Node{}
    copyCur := dummy
    for cur := head; cur != nil; cur = cur.Next {
        copyCur.Next = cur.Next
        copyCur = copyCur.Next
        cur.Next = cur.Next.Next
    }
    return dummy.Next
}`,
    keyPoints: ["原地插入副本", "副本的 random = 原节点的 random.Next", "拆分恢复原链表"],
    followUps: ["用哈希表怎么解？空间复杂度？"],
    favorited: false,
  },
  {
    id: "algo-148",
    nodeId: "p1-linkedlist",
    question: "148. 排序链表（LeetCode 148）\n对链表排序，要求 O(n logn) 时间 O(1) 空间。",
    answer: `// 思路：归并排序，快慢指针找中点 + 合并
// 时间 O(n logn)，空间 O(logn) 递归栈
// 关键：快慢指针找中点，递归归并

func sortList(head *ListNode) *ListNode {
    if head == nil || head.Next == nil { return head }
    // 找中点
    slow, fast := head, head.Next
    for fast != nil && fast.Next != nil { slow = slow.Next; fast = fast.Next.Next }
    mid := slow.Next
    slow.Next = nil
    // 递归排序 + 合并
    return merge(sortList(head), sortList(mid))
}`,
    keyPoints: ["归并排序", "快慢指针找中点", "合并两个有序链表"],
    followUps: ["自底向上迭代怎么实现 O(1) 空间？", "快速排序能排链表吗？"],
    favorited: false,
  },

  // ===== Phase 1：栈与队列（6题）=====
  {
    id: "algo-20",
    nodeId: "p1-stack-queue",
    question: "20. 有效的括号（LeetCode 20）\n判断括号字符串是否有效（匹配且闭合）。",
    answer: `// 思路：栈匹配，左括号入栈，右括号检查栈顶
// 时间 O(n)，空间 O(n)
// 关键：右括号必须匹配栈顶左括号

func isValid(s string) bool {
    pairs := map[byte]byte{')': '(', ']': '[', '}': '{'}
    var stack []byte
    for i := 0; i < len(s); i++ {
        if s[i] == '(' || s[i] == '[' || s[i] == '{' {
            stack = append(stack, s[i])
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != pairs[s[i]] { return false }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}`,
    keyPoints: ["栈匹配", "右括号检查栈顶", "最后栈必须为空"],
    followUps: ["有嵌套限制怎么处理？", "最长有效括号怎么解？"],
    favorited: false,
  },
  {
    id: "algo-155",
    nodeId: "p1-stack-queue",
    question: "155. 最小栈（LeetCode 155）\n设计支持 O(1) 获取最小值的栈。",
    answer: `// 思路：辅助栈同步记录当前最小值
// 时间 O(1) 每操作，空间 O(n)
// 关键：辅助栈与主栈同步 push/pop

type MinStack struct {
    stack    []int
    minStack []int
}
func (s *MinStack) Push(val int) {
    s.stack = append(s.stack, val)
    if len(s.minStack) == 0 || val <= s.minStack[len(s.minStack)-1] {
        s.minStack = append(s.minStack, val)
    } else {
        s.minStack = append(s.minStack, s.minStack[len(s.minStack)-1])
    }
}
func (s *MinStack) Pop() { s.stack = s.stack[:len(s.stack)-1]; s.minStack = s.minStack[:len(s.minStack)-1] }
func (s *MinStack) Top() int { return s.stack[len(s.stack)-1] }
func (s *MinStack) GetMin() int { return s.minStack[len(s.minStack)-1] }`,
    keyPoints: ["辅助栈同步", "push 时同步更新最小值", "也可差值法省空间"],
    followUps: ["用差值法怎么实现单栈？", "最大栈怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-394",
    nodeId: "p1-stack-queue",
    question: "394. 字符串解码（LeetCode 394）\n解码如 3[a2[c]] → accaccacc 的字符串。",
    answer: `// 思路：双栈——数字栈和字符串栈
// 时间 O(n)，空间 O(n)
// 关键：遇到 [ 压栈，遇到 ] 出栈拼接

func decodeString(s string) string {
    var numStack []int
    var strStack []string
    curStr := ""
    curNum := 0
    for i := 0; i < len(s); i++ {
        if s[i] >= '0' && s[i] <= '9' {
            curNum = curNum*10 + int(s[i]-'0')
        } else if s[i] == '[' {
            numStack = append(numStack, curNum)
            strStack = append(strStack, curStr)
            curNum = 0; curStr = ""
        } else if s[i] == ']' {
            n := numStack[len(numStack)-1]; numStack = numStack[:len(numStack)-1]
            prev := strStack[len(strStack)-1]; strStack = strStack[:len(strStack)-1]
            curStr = prev + strings.Repeat(curStr, n)
        } else {
            curStr += string(s[i])
        }
    }
    return curStr
}`,
    keyPoints: ["双栈：数字栈+字符串栈", "[ 压栈 ] 出栈拼接", "注意多位数字"],
    followUps: ["递归怎么写？", "嵌套深度有限制吗？"],
    favorited: false,
  },
  {
    id: "algo-739",
    nodeId: "p1-stack-queue",
    question: "739. 每日温度（LeetCode 739）\n对每天温度，找下一个更高温度在几天后。",
    answer: `// 思路：单调递减栈，栈存下标
// 时间 O(n)，空间 O(n)
// 关键：遇到更高温度时弹栈并记录差值

func dailyTemperatures(temps []int) []int {
    n := len(temps)
    res := make([]int, n)
    var stack []int // 存下标，对应温度单调递减
    for i := 0; i < n; i++ {
        for len(stack) > 0 && temps[i] > temps[stack[len(stack)-1]] {
            top := stack[len(stack)-1]; stack = stack[:len(stack)-1]
            res[top] = i - top
        }
        stack = append(stack, i)
    }
    return res
}`,
    keyPoints: ["单调递减栈", "栈存下标", "弹栈时记录天数差"],
    followUps: ["循环温度数组怎么解？", "用动态规划怎么解？"],
    favorited: false,
  },
  {
    id: "algo-84",
    nodeId: "p1-stack-queue",
    question: "84. 柱状图中最大的矩形（LeetCode 84）\n找柱状图中能勾勒出的最大矩形面积。",
    answer: `// 思路：单调递增栈，找每根柱子的左右边界
// 时间 O(n)，空间 O(n)
// 关键：弹栈时计算以栈顶为高的矩形面积

func largestRectangleArea(heights []int) int {
    heights = append(heights, 0) // 哨兵
    var stack []int
    maxArea := 0
    for i := 0; i < len(heights); i++ {
        for len(stack) > 0 && heights[i] < heights[stack[len(stack)-1]] {
            h := heights[stack[len(stack)-1]]; stack = stack[:len(stack)-1]
            w := i
            if len(stack) > 0 { w = i - stack[len(stack)-1] - 1 }
            maxArea = max(maxArea, h*w)
        }
        stack = append(stack, i)
    }
    return maxArea
}`,
    keyPoints: ["单调递增栈", "弹栈时计算面积", "哨兵节点简化边界"],
    followUps: ["最大矩形怎么转化为这题？", "接雨水和这题的区别？"],
    favorited: false,
  },
  {
    id: "algo-232",
    nodeId: "p1-stack-queue",
    question: "232. 用栈实现队列（LeetCode 232）\n用两个栈实现队列的 push/pop/peek。",
    answer: `// 思路：输入栈 + 输出栈，倒栈时摊还 O(1)
// 时间均摊 O(1)，空间 O(n)
// 关键：输出栈空时才从输入栈倒过来

type MyQueue struct {
    in, out []int
}
func (q *MyQueue) Push(x int) { q.in = append(q.in, x) }
func (q *MyQueue) Pop() int {
    q.peek()
    val := q.out[len(q.out)-1]; q.out = q.out[:len(q.out)-1]
    return val
}
func (q *MyQueue) peek() int {
    if len(q.out) == 0 {
        for len(q.in) > 0 { q.out = append(q.out, q.in[len(q.in)-1]); q.in = q.in[:len(q.in)-1] }
    }
    return q.out[len(q.out)-1]
}`,
    keyPoints: ["双栈：输入栈+输出栈", "输出栈空才倒栈", "摊还 O(1)"],
    followUps: ["用队列实现栈怎么解？", "为什么是均摊 O(1)？"],
    favorited: false,
  },

  // ===== Phase 1：二叉树与 BFS/DFS（12题）=====
  {
    id: "algo-94",
    nodeId: "p1-tree",
    question: "94. 二叉树中序遍历（LeetCode 94）\n返回二叉树中序遍历结果。",
    answer: `// 思路：递归或迭代（栈模拟）
// 时间 O(n)，空间 O(h)
// 关键：迭代法——一路左走压栈，弹出后转右

func inorderTraversal(root *TreeNode) []int {
    var res []int
    var stack []*TreeNode
    cur := root
    for cur != nil || len(stack) > 0 {
        for cur != nil { stack = append(stack, cur); cur = cur.Left }
        cur = stack[len(stack)-1]; stack = stack[:len(stack)-1]
        res = append(res, cur.Val)
        cur = cur.Right
    }
    return res
}`,
    keyPoints: ["迭代用栈", "一路左走压栈", "弹出后转右子树"],
    followUps: ["前序/后序迭代怎么写？", "Morris 遍历 O(1) 空间怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-104",
    nodeId: "p1-tree",
    question: "104. 二叉树最大深度（LeetCode 104）\n返回二叉树最大深度。",
    answer: `// 思路：递归后序遍历，子树最大深度+1
// 时间 O(n)，空间 O(h)
// 关键：return 1 + max(左, 右)

func maxDepth(root *TreeNode) int {
    if root == nil { return 0 }
    return 1 + max(maxDepth(root.Left), maxDepth(root.Right))
}`,
    keyPoints: ["递归后序遍历", "也可 BFS 层数计数", "最小深度是不同题"],
    followUps: ["最小深度怎么求？有什么坑？", "迭代法怎么写？"],
    favorited: false,
  },
  {
    id: "algo-226",
    nodeId: "p1-tree",
    question: "226. 翻转二叉树（LeetCode 226）\n翻转二叉树的每个左右子树。",
    answer: `// 思路：递归交换左右子树
// 时间 O(n)，空间 O(h)
// 关键：先交换再递归，或先递归再交换

func invertTree(root *TreeNode) *TreeNode {
    if root == nil { return nil }
    root.Left, root.Right = root.Right, root.Left
    invertTree(root.Left)
    invertTree(root.Right)
    return root
}`,
    keyPoints: ["递归交换", "前序或后序都行", "注意 nil 检查"],
    followUps: ["迭代怎么写？", "能否原地修改？"],
    favorited: false,
  },
  {
    id: "algo-101",
    nodeId: "p1-tree",
    question: "101. 对称二叉树（LeetCode 101）\n判断二叉树是否镜像对称。",
    answer: `// 思路：递归比较左右子树是否互为镜像
// 时间 O(n)，空间 O(h)
// 关键：左子树的左 vs 右子树的右，左子树的右 vs 右子树的左

func isSymmetric(root *TreeNode) bool {
    if root == nil { return true }
    return isMirror(root.Left, root.Right)
}
func isMirror(a, b *TreeNode) bool {
    if a == nil && b == nil { return true }
    if a == nil || b == nil { return false }
    return a.Val == b.Val && isMirror(a.Left, b.Right) && isMirror(a.Right, b.Left)
}`,
    keyPoints: ["递归比较镜像", "左左vs右右，左右vs右左", "也可用队列迭代"],
    followUps: ["迭代怎么写？", "判断两棵树是否相同？"],
    favorited: false,
  },
  {
    id: "algo-543",
    nodeId: "p1-tree",
    question: "543. 二叉树直径（LeetCode 543）\n返回任意两节点路径的最大长度（边数）。",
    answer: `// 思路：后序遍历，直径=左深+右深的最大值
// 时间 O(n)，空间 O(h)
// 关键：每个节点的直径 = 左子树深度 + 右子树深度

var maxDiameter int
func diameterOfBinaryTree(root *TreeNode) int {
    maxDiameter = 0
    depth(root)
    return maxDiameter
}
func depth(root *TreeNode) int {
    if root == nil { return 0 }
    l, r := depth(root.Left), depth(root.Right)
    maxDiameter = max(maxDiameter, l+r)
    return 1 + max(l, r)
}`,
    keyPoints: ["后序遍历", "直径 = 左深+右深", "返回的是深度，更新的是直径"],
    followUps: ["最长路径（节点数）怎么改？", "如果带权路径呢？"],
    favorited: false,
  },
  {
    id: "algo-102",
    nodeId: "p1-tree",
    question: "102. 二叉树层序遍历（LeetCode 102）\n返回二叉树按层遍历的节点值。",
    answer: `// 思路：BFS + 队列 + 按层记录
// 时间 O(n)，空间 O(n)
// 关键：每层先记录长度再批量出队

func levelOrder(root *TreeNode) [][]int {
    if root == nil { return nil }
    var res [][]int
    q := []*TreeNode{root}
    for len(q) > 0 {
        n := len(q)
        level := []int{}
        for i := 0; i < n; i++ {
            node := q[0]; q = q[1:]
            level = append(level, node.Val)
            if node.Left != nil { q = append(q, node.Left) }
            if node.Right != nil { q = append(q, node.Right) }
        }
        res = append(res, level)
    }
    return res
}`,
    keyPoints: ["BFS 队列", "每层先记录长度再批量出队", "也可用 DFS + level 参数"],
    followUps: ["之字形层序怎么解？", "右视图怎么解？"],
    favorited: false,
  },
  {
    id: "algo-108",
    nodeId: "p1-tree",
    question: "108. 有序数组转二叉搜索树（LeetCode 108）\n将升序数组转为高度平衡的 BST。",
    answer: `// 思路：取中间元素为根，递归构建左右子树
// 时间 O(n)，空间 O(logn)
// 关键：中间元素做根保证平衡

func sortedArrayToBST(nums []int) *TreeNode {
    if len(nums) == 0 { return nil }
    mid := len(nums) / 2
    return &TreeNode{
        Val:   nums[mid],
        Left:  sortedArrayToBST(nums[:mid]),
        Right: sortedArrayToBST(nums[mid+1:]),
    }
}`,
    keyPoints: ["二分递归", "中间元素做根", "保证高度平衡"],
    followUps: ["有序链表转 BST 怎么解？", "多种平衡 BST 答案都行吗？"],
    favorited: false,
  },
  {
    id: "algo-98",
    nodeId: "p1-tree",
    question: "98. 验证二叉搜索树（LeetCode 98）\n判断是否为有效的 BST。",
    answer: `// 思路：递归传上下界，或中序遍历判断递增
// 时间 O(n)，空间 O(h)
// 关键：每个节点值必须在 (min, max) 范围内

func isValidBST(root *TreeNode) bool {
    return validate(root, nil, nil)
}
func validate(root, min, max *int) bool {
    if root == nil { return true }
    if min != nil && root.Val <= *min { return false }
    if max != nil && root.Val >= *max { return false }
    return validate(root.Left, min, &root.Val) && validate(root.Right, &root.Val, max)
}`,
    keyPoints: ["递归传上下界", "也可中序遍历判递增", "注意边界用指针或特殊值"],
    followUps: ["中序遍历法怎么写？", "空树是否是 BST？"],
    favorited: false,
  },
  {
    id: "algo-230",
    nodeId: "p1-tree",
    question: "230. 二叉搜索树第 K 小（LeetCode 230）\n找 BST 中第 K 小的元素。",
    answer: `// 思路：中序遍历到第 K 个
// 时间 O(h+k)，空间 O(h)
// 关键：BST 中序遍历是递增序列

var kth, kthRes int
func kthSmallest(root *TreeNode, k int) int {
    kth = k
    inorderK(root)
    return kthRes
}
func inorderK(root *TreeNode) {
    if root == nil || kth == 0 { return }
    inorderK(root.Left)
    kth--
    if kth == 0 { kthRes = root.Val; return }
    inorderK(root.Right)
}`,
    keyPoints: ["BST 中序遍历递增", "中序到第 K 个停止", "也可迭代中序"],
    followUps: ["第 K 大怎么解？", "如果频繁查询怎么优化？"],
    favorited: false,
  },
  {
    id: "algo-199",
    nodeId: "p1-tree",
    question: "199. 二叉树右侧视图（LeetCode 199）\n返回从右侧看二叉树能看到的节点值。",
    answer: `// 思路：BFS 层序遍历，每层最后一个节点
// 时间 O(n)，空间 O(n)
// 关键：层序遍历每层的最右节点

func rightSideView(root *TreeNode) []int {
    if root == nil { return nil }
    var res []int
    q := []*TreeNode{root}
    for len(q) > 0 {
        n := len(q)
        for i := 0; i < n; i++ {
            node := q[0]; q = q[1:]
            if i == n-1 { res = append(res, node.Val) }
            if node.Left != nil { q = append(q, node.Left) }
            if node.Right != nil { q = append(q, node.Right) }
        }
    }
    return res
}`,
    keyPoints: ["BFS 层序", "每层最后一个节点", "也可 DFS 右子树优先"],
    followUps: ["左侧视图怎么解？", "DFS 怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-114",
    nodeId: "p1-tree",
    question: "114. 二叉树展开为链表（LeetCode 114）\n按前序遍历将二叉树展开为右链。",
    answer: `// 思路：后序遍历（右-左-根），用 prev 指针连接
// 时间 O(n)，空间 O(h)
// 关键：逆前序=后序变体，prev 记录上一个展开的节点

var prev *TreeNode
func flatten(root *TreeNode) {
    prev = nil
    flattenHelper(root)
}
func flattenHelper(root *TreeNode) {
    if root == nil { return }
    flattenHelper(root.Right)
    flattenHelper(root.Left)
    root.Right = prev
    root.Left = nil
    prev = root
}`,
    keyPoints: ["后序遍历变体（右左根）", "prev 指针连接", "左子树置 nil"],
    followUps: ["O(1) 空间怎么实现？", "迭代怎么写？"],
    favorited: false,
  },
  {
    id: "algo-105",
    nodeId: "p1-tree",
    question: "105. 从前序与中序遍历构造二叉树（LeetCode 105）\n根据前序和中序遍历构造二叉树。",
    answer: `// 思路：前序第一个是根，中序中找根分左右
// 时间 O(n)，空间 O(n)
// 关键：前序定根，中序分左右子树

func buildTree(preorder, inorder []int) *TreeNode {
    idxMap := map[int]int{}
    for i, v := range inorder { idxMap[v] = i }
    var build func(preL, preR, inL, inR int) *TreeNode
    build = func(preL, preR, inL, inR int) *TreeNode {
        if preL > preR { return nil }
        rootVal := preorder[preL]
        rootIdx := idxMap[rootVal]
        leftSize := rootIdx - inL
        return &TreeNode{
            Val:   rootVal,
            Left:  build(preL+1, preL+leftSize, inL, rootIdx-1),
            Right: build(preL+leftSize+1, preR, rootIdx+1, inR),
        }
    }
    return build(0, len(preorder)-1, 0, len(inorder)-1)
}`,
    keyPoints: ["前序定根", "中序分左右", "哈希表加速查找根位置"],
    followUps: ["中序+后序怎么构造？", "前序+后序能唯一确定吗？"],
    favorited: false,
  },

  // ===== Phase 1：回溯（6题）=====
  {
    id: "algo-46",
    nodeId: "p1-backtrack",
    question: "46. 全排列（LeetCode 46）\n返回不含重复数字数组的所有全排列。",
    answer: `// 思路：回溯 + used 数组
// 时间 O(n·n!)，空间 O(n)
// 关键：回溯模板——选择-递归-撤销

func permute(nums []int) [][]int {
    var res [][]int
    var path []int
    used := make([]bool, len(nums))
    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) {
            tmp := make([]int, len(path)); copy(tmp, path)
            res = append(res, tmp); return
        }
        for i := range nums {
            if used[i] { continue }
            used[i] = true; path = append(path, nums[i])
            backtrack()
            path = path[:len(path)-1]; used[i] = false
        }
    }
    backtrack()
    return res
}`,
    keyPoints: ["回溯三要素：选择/路径/结束", "used 数组标记", "复制 path 再加入结果"],
    followUps: ["有重复数字怎么去重？", "组合总和怎么解？"],
    favorited: false,
  },
  {
    id: "algo-78",
    nodeId: "p1-backtrack",
    question: "78. 子集（LeetCode 78）\n返回不含重复元素数组的所有子集。",
    answer: `// 思路：回溯 + start 参数避免回头
// 时间 O(n·2^n)，空间 O(n)
// 关键：每个递归节点都收集，start 控制不回头

func subsets(nums []int) [][]int {
    var res [][]int
    var path []int
    var backtrack func(start int)
    backtrack = func(start int) {
        tmp := make([]int, len(path)); copy(tmp, path)
        res = append(res, tmp)
        for i := start; i < len(nums); i++ {
            path = append(path, nums[i])
            backtrack(i + 1)
            path = path[:len(path)-1]
        }
    }
    backtrack(0)
    return res
}`,
    keyPoints: ["回溯 + start 参数", "每个节点都收集", "与全排列的区别"],
    followUps: ["有重复元素怎么去重？", "组合问题怎么解？"],
    favorited: false,
  },
  {
    id: "algo-17",
    nodeId: "p1-backtrack",
    question: "17. 电话号码的字母组合（LeetCode 17）\n返回电话号码对应的所有字母组合。",
    answer: `// 思路：回溯，每位数字对应多个字母
// 时间 O(4^n)，空间 O(n)
// 关键：数字到字母的映射 + 回溯

func letterCombinations(digits string) []string {
    if digits == "" { return nil }
    mapping := []string{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"}
    var res []string
    var path []byte
    var backtrack func(idx int)
    backtrack = func(idx int) {
        if idx == len(digits) { res = append(res, string(path)); return }
        for i := 0; i < len(mapping[digits[idx]-'0']); i++ {
            path = append(path, mapping[digits[idx]-'0'][i])
            backtrack(idx + 1)
            path = path[:len(path)-1]
        }
    }
    backtrack(0)
    return res
}`,
    keyPoints: ["数字到字母映射", "回溯遍历每位", "空串返回空"],
    followUps: ["如果有多个数字相同？", "BFS 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-39",
    nodeId: "p1-backtrack",
    question: "39. 组合总和（LeetCode 39）\n找候选数组中和为 target 的所有组合，数字可重复使用。",
    answer: `// 思路：回溯 + start 参数允许重复
// 时间 O(2^n)，空间 O(target)
// 关键：允许重复使用，所以 backtrack(i) 不是 backtrack(i+1)

func combinationSum(candidates []int, target int) [][]int {
    var res [][]int
    var path []int
    var backtrack func(start, remain int)
    backtrack = func(start, remain int) {
        if remain == 0 { tmp := make([]int, len(path)); copy(tmp, path); res = append(res, tmp); return }
        if remain < 0 { return }
        for i := start; i < len(candidates); i++ {
            path = append(path, candidates[i])
            backtrack(i, remain-candidates[i]) // i 不是 i+1，允许重复
            path = path[:len(path)-1]
        }
    }
    backtrack(0, target)
    return res
}`,
    keyPoints: ["回溯 + start 避免重复组合", "允许重复用所以传 i 不传 i+1", "剪枝 remain<0"],
    followUps: ["每个数字只能用一次怎么改？", "有重复候选数怎么去重？"],
    favorited: false,
  },
  {
    id: "algo-22",
    nodeId: "p1-backtrack",
    question: "22. 括号生成（LeetCode 22）\n生成 n 对括号的所有合法组合。",
    answer: `// 思路：回溯，左括号数<右括号数时可加右括号
// 时间 O(4^n/sqrt(n))，空间 O(n)
// 关键：左数<n 可加左，左数>右数可加右

func generateParenthesis(n int) []string {
    var res []string
    var path []byte
    var backtrack(left, right int)
    backtrack = func(left, right int) {
        if len(path) == 2*n { res = append(res, string(path)); return }
        if left < n { path = append(path, '('); backtrack(left+1, right); path = path[:len(path)-1] }
        if right < left { path = append(path, ')'); backtrack(left, right+1); path = path[:len(path)-1] }
    }
    backtrack(0, 0)
    return res
}`,
    keyPoints: ["回溯 + 左右计数", "左<n 加左，右<左 加右", "保证合法"],
    followUps: ["生成所有括号组合（不要求合法）？", "n 很大时怎么办？"],
    favorited: false,
  },
  {
    id: "algo-79",
    nodeId: "p1-backtrack",
    question: "79. 单词搜索（LeetCode 79）\n在二维字母板中搜索单词是否存在。",
    answer: `// 思路：DFS 回溯 + 访问标记
// 时间 O(m·n·4^L)，空间 O(L)
// 关键：从每个格子出发 DFS，标记已访问

func exist(board [][]byte, word string) bool {
    m, n := len(board), len(board[0])
    var dfs func(i, j, idx int) bool
    dfs = func(i, j, idx int) bool {
        if idx == len(word) { return true }
        if i < 0 || i >= m || j < 0 || j >= n || board[i][j] != word[idx] { return false }
        tmp := board[i][j]; board[i][j] = '#' // 标记
        found := dfs(i+1, j, idx+1) || dfs(i-1, j, idx+1) || dfs(i, j+1, idx+1) || dfs(i, j-1, idx+1)
        board[i][j] = tmp // 恢复
        return found
    }
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if dfs(i, j, 0) { return true }
        }
    }
    return false
}`,
    keyPoints: ["DFS 回溯", "原地标记访问", "四方向递归"],
    followUps: ["多个单词同时搜索怎么解（Trie）？", "如何剪枝优化？"],
    favorited: false,
  },

  // ===== Phase 1：排序与二分（6题）=====
  {
    id: "algo-33",
    nodeId: "p1-sort-binary",
    question: "33. 搜索旋转排序数组（LeetCode 33）\n在旋转后的有序数组中查找目标值。",
    answer: `// 思路：二分，判断哪半边有序再决定方向
// 时间 O(logn)，空间 O(1)
// 关键：判断左/右半哪边有序，再判断 target 在不在

func search(nums []int, target int) int {
    l, r := 0, len(nums)-1
    for l <= r {
        mid := l + (r-l)/2
        if nums[mid] == target { return mid }
        if nums[l] <= nums[mid] { // 左半有序
            if nums[l] <= target && target < nums[mid] { r = mid - 1 } else { l = mid + 1 }
        } else { // 右半有序
            if nums[mid] < target && target <= nums[r] { l = mid + 1 } else { r = mid - 1 }
        }
    }
    return -1
}`,
    keyPoints: ["二分查找", "判断左/右半哪边有序", "再判断 target 是否在有序区间"],
    followUps: ["有重复元素怎么办？", "查找最小值怎么解？"],
    favorited: false,
  },
  {
    id: "algo-34",
    nodeId: "p1-sort-binary",
    question: "34. 在排序数组中查找元素第一个和最后一个（LeetCode 34）\n返回有序数组中目标值的起止位置。",
    answer: `// 思路：两次二分——找左边界和右边界
// 时间 O(logn)，空间 O(1)
// 关键：找第一个 >= target 和第一个 > target

func searchRange(nums []int, target int) []int {
    left := lowerBound(nums, target)
    right := lowerBound(nums, target+1) - 1
    if left < len(nums) && nums[left] == target { return []int{left, right} }
    return []int{-1, -1}
}
func lowerBound(nums []int, target int) int {
    l, r := 0, len(nums)
    for l < r { mid := l + (r-l)/2; if nums[mid] < target { l = mid + 1 } else { r = mid } }
    return l
}`,
    keyPoints: ["两次二分", "lowerBound 模板", "左闭右开区间"],
    followUps: ["用一次二分怎么解？", "C++ 的 equal_range 怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-153",
    nodeId: "p1-sort-binary",
    question: "153. 寻找旋转排序数组中的最小值（LeetCode 153）\n找旋转有序数组的最小值。",
    answer: `// 思路：二分，比较 mid 和右端
// 时间 O(logn)，空间 O(1)
// 关键：nums[mid] > nums[r] 则最小在右半，否则在左半

func findMin(nums []int) int {
    l, r := 0, len(nums)-1
    for l < r {
        mid := l + (r-l)/2
        if nums[mid] > nums[r] { l = mid + 1 } else { r = mid }
    }
    return nums[l]
}`,
    keyPoints: ["二分比较 mid 和右端", "最小值在无序的那半", "左闭右闭收敛"],
    followUps: ["有重复元素怎么处理？", "最大值怎么找？"],
    favorited: false,
  },
  {
    id: "algo-56",
    nodeId: "p1-sort-binary",
    question: "56. 合并区间（LeetCode 56）\n合并所有重叠的区间。",
    answer: `// 思路：按起点排序，遍历合并
// 时间 O(n·logn)，空间 O(n)
// 关键：排序后判断当前区间起点 <= 上一区间终点

func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool { return intervals[i][0] < intervals[j][0] })
    var res [][]int
    for _, iv := range intervals {
        if len(res) > 0 && iv[0] <= res[len(res)-1][1] {
            res[len(res)-1][1] = max(res[len(res)-1][1], iv[1])
        } else {
            res = append(res, iv)
        }
    }
    return res
}`,
    keyPoints: ["按起点排序", "判断重叠合并终点", "不重叠直接加入"],
    followUps: ["插入区间怎么解？", "区间交集怎么解？"],
    favorited: false,
  },
  {
    id: "algo-179",
    nodeId: "p1-sort-binary",
    question: "179. 最大数（LeetCode 179）\n将数组排列成最大的数字字符串。",
    answer: `// 思路：自定义排序，a+b > b+a 则 a 在前
// 时间 O(n·logn·k)，空间 O(n)
// 关键：拼接比较 a+b vs b+a

func largestNumber(nums []int) string {
    strs := make([]string, len(nums))
    for i, n := range nums { strs[i] = strconv.Itoa(n) }
    sort.Slice(strs, func(i, j int) bool { return strs[i]+strs[j] > strs[j]+strs[i] })
    res := strings.Join(strs, "")
    if res[0] == '0' { return "0" }
    return res
}`,
    keyPoints: ["自定义排序", "拼接比较 a+b vs b+a", "全零特判"],
    followUps: ["最小数怎么解？", "不能转字符串怎么做？"],
    favorited: false,
  },
  {
    id: "algo-4",
    nodeId: "p1-sort-binary",
    question: "4. 寻找两个正序数组的中位数（LeetCode 4）\n找两个有序数组的中位数。要求 O(log(m+n))。",
    answer: `// 思路：二分较短数组，找第 K 小
// 时间 O(log(min(m,n)))，空间 O(1)
// 关键：二分找分割点，左边最大<=右边最小

func findMedianSortedArrays(nums1, nums2 []int) float64 {
    if len(nums1) > len(nums2) { nums1, nums2 = nums2, nums1 }
    m, n := len(nums1), len(nums2)
    l, r := 0, m
    for l <= r {
        i := (l + r) / 2 // nums1 左半长度
        j := (m+n+1)/2 - i // nums2 左半长度
        var maxLeft1, minRight1, maxLeft2, minRight2 int
        if i == 0 { maxLeft1 = -1<<31 } else { maxLeft1 = nums1[i-1] }
        if i == m { minRight1 = 1<<31 - 1 } else { minRight1 = nums1[i] }
        if j == 0 { maxLeft2 = -1<<31 } else { maxLeft2 = nums2[j-1] }
        if j == n { minRight2 = 1<<31 - 1 } else { minRight2 = nums2[j] }
        if maxLeft1 <= minRight2 && maxLeft2 <= minRight1 {
            if (m+n)%2 == 1 { return float64(max(maxLeft1, maxLeft2)) }
            return float64(max(maxLeft1, maxLeft2)+min(minRight1, minRight2)) / 2
        }
        if maxLeft1 > minRight2 { r = i - 1 } else { l = i + 1 }
    }
    return 0
}`,
    keyPoints: ["二分较短数组", "找分割点使左max<=右min", "奇偶分别处理"],
    followUps: ["第 K 小怎么求？", "如果允许 O(m+n) 怎么做？"],
    favorited: false,
  },

  // ===== Phase 2：动态规划（20题）=====
  {
    id: "algo-70",
    nodeId: "p2-dp",
    question: "70. 爬楼梯（LeetCode 70）\n每次爬 1 或 2 阶，爬到 n 阶有多少种方式？",
    answer: `// 思路：DP，dp[i] = dp[i-1] + dp[i-2]（斐波那契）
// 时间 O(n)，空间 O(1)
// 关键：滚动变量优化空间

func climbStairs(n int) int {
    if n <= 2 { return n }
    a, b := 1, 2
    for i := 3; i <= n; i++ { a, b = b, a+b }
    return b
}`,
    keyPoints: ["状态定义 dp[i]=爬到第i阶方式数", "转移方程 dp[i]=dp[i-1]+dp[i-2]", "滚动变量 O(1) 空间"],
    followUps: ["每次可以爬 1-3 阶呢？", "带代价的最小费用怎么解？"],
    favorited: false,
  },
  {
    id: "algo-118",
    nodeId: "p2-dp",
    question: "118. 杨辉三角（LeetCode 118）\n生成前 n 行杨辉三角。",
    answer: `// 思路：每行首尾为 1，中间 = 上一行相邻两数之和
// 时间 O(n²)，空间 O(n²)
// 关键：dp[i][j] = dp[i-1][j-1] + dp[i-1][j]

func generate(n int) [][]int {
    res := make([][]int, n)
    for i := 0; i < n; i++ {
        res[i] = make([]int, i+1)
        res[i][0], res[i][i] = 1, 1
        for j := 1; j < i; j++ { res[i][j] = res[i-1][j-1] + res[i-1][j] }
    }
    return res
}`,
    keyPoints: ["首尾为 1", "中间=上一行相邻和", "也可一维滚动"],
    followUps: ["只返回第 k 行怎么优化空间？", "杨辉三角 II 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-198",
    nodeId: "p2-dp",
    question: "198. 打家劫舍（LeetCode 198）\n不能偷相邻房屋，求最大金额。",
    answer: `// 思路：DP，dp[i] = max(dp[i-1], dp[i-2]+nums[i])
// 时间 O(n)，空间 O(1)
// 关键：偷或不偷当前房屋

func rob(nums []int) int {
    if len(nums) == 0 { return 0 }
    if len(nums) == 1 { return nums[0] }
    prev2, prev1 := 0, nums[0]
    for i := 1; i < len(nums); i++ {
        cur := max(prev1, prev2+nums[i])
        prev2, prev1 = prev1, cur
    }
    return prev1
}`,
    keyPoints: ["DP dp[i]=max(dp[i-1], dp[i-2]+nums[i])", "偷或不偷", "滚动变量"],
    followUps: ["环形房屋怎么解？", "树形打家劫舍呢？"],
    favorited: false,
  },
  {
    id: "algo-213",
    nodeId: "p2-dp",
    question: "213. 打家劫舍 II（LeetCode 213）\n环形排列的房屋，不能偷相邻，求最大金额。",
    answer: `// 思路：分两种情况——偷第一个不偷最后 vs 不偷第一个偷最后
// 时间 O(n)，空间 O(1)
// 关键：环形=拆成两条线性分别求

func rob2(nums []int) int {
    n := len(nums)
    if n == 1 { return nums[0] }
    return max(robRange(nums, 0, n-2), robRange(nums, 1, n-1))
}
func robRange(nums []int, l, r int) int {
    prev2, prev1 := 0, 0
    for i := l; i <= r; i++ {
        cur := max(prev1, prev2+nums[i])
        prev2, prev1 = prev1, cur
    }
    return prev1
}`,
    keyPoints: ["环形拆两条线性", "偷首不偷尾 vs 不偷首偷尾", "复用线性 rob"],
    followUps: ["树形怎么解？", "最多偷 K 个怎么解？"],
    favorited: false,
  },
  {
    id: "algo-300",
    nodeId: "p2-dp",
    question: "300. 最长递增子序列（LeetCode 300）\n返回最长严格递增子序列长度。",
    answer: `// 思路：DP O(n²) 或 贪心+二分 O(n·logn)
// 时间 O(n·logn)，空间 O(n)
// 关键：维护 tails 数组，tails[i]=长度 i+1 的 LIS 最小尾元素

func lengthOfLIS(nums []int) int {
    var tails []int
    for _, num := range nums {
        i := sort.SearchInts(tails, num)
        if i == len(tails) { tails = append(tails, num) } else { tails[i] = num }
    }
    return len(tails)
}`,
    keyPoints: ["贪心+二分", "tails 不是真正 LIS 但长度相等", "也可 DP O(n²)"],
    followUps: ["输出具体 LIS 怎么做？", "LCS 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-322",
    nodeId: "p2-dp",
    question: "322. 零钱兑换（LeetCode 322）\n给定硬币面额和金额，求凑成该金额的最少硬币数。",
    answer: `// 思路：完全背包 DP
// 时间 O(amount·n)，空间 O(amount)
// 关键：dp[i] = min(dp[i-c]+1)

func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp { dp[i] = amount + 1 }
    dp[0] = 0
    for i := 1; i <= amount; i++ {
        for _, c := range coins {
            if c <= i { dp[i] = min(dp[i], dp[i-c]+1) }
        }
    }
    if dp[amount] > amount { return -1 }
    return dp[amount]
}`,
    keyPoints: ["完全背包 DP", "dp[i]=金额i的最少硬币数", "初始化不可达"],
    followUps: ["求组合数怎么解？", "每种硬币只能用一次呢？"],
    favorited: false,
  },
  {
    id: "algo-518",
    nodeId: "p2-dp",
    question: "518. 零钱兑换 II（LeetCode 518）\n给定硬币面额和金额，求凑成该金额的组合数。",
    answer: `// 思路：完全背包 DP，求组合数
// 时间 O(amount·n)，空间 O(amount)
// 关键：外层遍历硬币避免重复组合

func change(amount int, coins []int) int {
    dp := make([]int, amount+1)
    dp[0] = 1
    for _, c := range coins { // 外层硬币
        for i := c; i <= amount; i++ { dp[i] += dp[i-c] }
    }
    return dp[amount]
}`,
    keyPoints: ["完全背包求组合数", "外层硬币内层金额", "外层硬币避免重复"],
    followUps: ["求排列数怎么改？", "每种只用一次呢？"],
    favorited: false,
  },
  {
    id: "algo-139",
    nodeId: "p2-dp",
    question: "139. 单词拆分（LeetCode 139）\n判断字符串能否被字典中的单词拼接而成。",
    answer: `// 思路：DP，dp[i]=s[0:i]能否拆分
// 时间 O(n²·m)，空间 O(n)
// 关键：dp[i] = 任意 dp[j] && s[j:i]在字典中

func wordBreak(s string, wordDict []string) bool {
    wordSet := map[string]bool{}
    for _, w := range wordDict { wordSet[w] = true }
    dp := make([]bool, len(s)+1)
    dp[0] = true
    for i := 1; i <= len(s); i++ {
        for j := 0; j < i; j++ {
            if dp[j] && wordSet[s[j:i]] { dp[i] = true; break }
        }
    }
    return dp[len(s)]
}`,
    keyPoints: ["DP dp[i]=s[0:i]能否拆分", "枚举分割点 j", "用哈希集合查字典"],
    followUps: ["返回所有拆分方案怎么解？", "用 Trie 优化？"],
    favorited: false,
  },
  {
    id: "algo-152",
    nodeId: "p2-dp",
    question: "152. 乘积最大子数组（LeetCode 152）\n找乘积最大的连续子数组。",
    answer: `// 思路：同时维护最大和最小（负负得正）
// 时间 O(n)，空间 O(1)
// 关键：负数翻转最大最小

func maxProduct(nums []int) int {
    maxP, minP, res := nums[0], nums[0], nums[0]
    for i := 1; i < len(nums); i++ {
        if nums[i] < 0 { maxP, minP = minP, maxP }
        maxP = max(nums[i], maxP*nums[i])
        minP = min(nums[i], minP*nums[i])
        res = max(res, maxP)
    }
    return res
}`,
    keyPoints: ["维护 maxP 和 minP", "负数交换 max/min", "负负得正"],
    followUps: ["如果含 0 怎么处理？", "返回子数组本身怎么解？"],
    favorited: false,
  },
  {
    id: "algo-416",
    nodeId: "p2-dp",
    question: "416. 分割等和子集（LeetCode 416）\n判断数组能否分成两个和相等的子集。",
    answer: `// 思路：0-1 背包，目标和=sum/2
// 时间 O(n·target)，空间 O(target)
// 关键：转化为能否选若干数凑成 sum/2

func canPartition(nums []int) bool {
    sum := 0
    for _, n := range nums { sum += n }
    if sum%2 != 0 { return false }
    target := sum / 2
    dp := make([]bool, target+1)
    dp[0] = true
    for _, n := range nums {
        for j := target; j >= n; j-- { dp[j] = dp[j] || dp[j-n] }
    }
    return dp[target]
}`,
    keyPoints: ["0-1 背包", "目标和=sum/2", "内层逆序避免重复选"],
    followUps: ["分成 K 个等和子集呢？", "返回具体子集怎么解？"],
    favorited: false,
  },
  {
    id: "algo-1143",
    nodeId: "p2-dp",
    question: "1143. 最长公共子序列（LeetCode 1143）\n返回两个字符串的最长公共子序列长度。",
    answer: `// 思路：二维 DP
// 时间 O(m·n)，空间 O(m·n) 可优化
// 关键：字符相等取左上+1，否则取上/左最大

func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp { dp[i] = make([]int, n+1) }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] { dp[i][j] = dp[i-1][j-1] + 1 } else { dp[i][j] = max(dp[i-1][j], dp[i][j-1]) }
        }
    }
    return dp[m][n]
}`,
    keyPoints: ["二维 DP", "相等取左上+1", "不等取上/左最大"],
    followUps: ["如何输出 LCS 字符串？", "最长公共子串（连续）有什么不同？"],
    favorited: false,
  },
  {
    id: "algo-72",
    nodeId: "p2-dp",
    question: "72. 编辑距离（LeetCode 72）\n将 word1 转为 word2 的最少操作数（增删改）。",
    answer: `// 思路：二维 DP
// 时间 O(m·n)，空间 O(m·n) 可优化
// 关键：相等则不变，不等取增删改最小+1

func minDistance(word1, word2 string) int {
    m, n := len(word1), len(word2)
    dp := make([][]int, m+1)
    for i := range dp { dp[i] = make([]int, n+1); dp[i][0] = i }
    for j := 0; j <= n; j++ { dp[0][j] = j }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if word1[i-1] == word2[j-1] { dp[i][j] = dp[i-1][j-1] } else {
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
            }
        }
    }
    return dp[m][n]
}`,
    keyPoints: ["二维 DP", "三种操作：增/删/改", "相等无操作，不等取三方向最小+1"],
    followUps: ["只允许增删怎么改？", "只允许替换怎么改？"],
    favorited: false,
  },
  {
    id: "algo-64",
    nodeId: "p2-dp",
    question: "64. 最小路径和（LeetCode 64）\n从左上到右下的最小路径和，只能右移或下移。",
    answer: `// 思路：二维 DP，dp[i][j] = grid[i][j] + min(上,左)
// 时间 O(m·n)，空间 O(1) 原地
// 关键：第一行和第一列特殊处理

func minPathSum(grid [][]int) int {
    m, n := len(grid), len(grid[0])
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if i == 0 && j == 0 { continue }
            if i == 0 { grid[i][j] += grid[i][j-1] } else if j == 0 { grid[i][j] += grid[i-1][j] } else { grid[i][j] += min(grid[i-1][j], grid[i][j-1]) }
        }
    }
    return grid[m-1][n-1]
}`,
    keyPoints: ["二维 DP", "dp[i][j]=grid[i][j]+min(上,左)", "可原地修改"],
    followUps: ["最大路径和怎么解？", "有障碍物呢？"],
    favorited: false,
  },
  {
    id: "algo-62",
    nodeId: "p2-dp",
    question: "62. 不同路径（LeetCode 62）\n从左上到右下的路径数，只能右移或下移。",
    answer: `// 思路：二维 DP，dp[i][j] = dp[i-1][j] + dp[i][j-1]
// 时间 O(m·n)，空间 O(n)
// 关键：第一行第一列全为 1

func uniquePaths(m, n int) int {
    dp := make([]int, n)
    for j := range dp { dp[j] = 1 }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ { dp[j] += dp[j-1] }
    }
    return dp[n-1]
}`,
    keyPoints: ["二维 DP 降为一维", "dp[j]+=dp[j-1]", "也可组合数公式"],
    followUps: ["有障碍物怎么解？", "求所有路径怎么解？"],
    favorited: false,
  },
  {
    id: "algo-5",
    nodeId: "p2-dp",
    question: "5. 最长回文子串（LeetCode 5）\n找字符串中最长的回文子串。",
    answer: `// 思路：中心扩展，枚举每个中心（奇偶两种）
// 时间 O(n²)，空间 O(1)
// 关键：从中心向两边扩展

func longestPalindrome(s string) string {
    if len(s) < 2 { return s }
    start, maxLen := 0, 1
    expand := func(l, r int) {
        for l >= 0 && r < len(s) && s[l] == s[r] { l--; r++ }
        if r-l-1 > maxLen { maxLen = r - l - 1; start = l + 1 }
    }
    for i := 0; i < len(s); i++ { expand(i, i); expand(i, i+1) }
    return s[start : start+maxLen]
}`,
    keyPoints: ["中心扩展法", "奇数偶数两种中心", "也可 Manacher O(n)"],
    followUps: ["Manacher 算法怎么实现？", "DP 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-647",
    nodeId: "p2-dp",
    question: "647. 回文子串（LeetCode 647）\n计算字符串中回文子串的个数。",
    answer: `// 思路：中心扩展，枚举每个中心
// 时间 O(n²)，空间 O(1)
// 关键：每个中心向两边扩展，是回文就计数

func countSubstrings(s string) int {
    count := 0
    expand := func(l, r int) {
        for l >= 0 && r < len(s) && s[l] == s[r] { count++; l--; r++ }
    }
    for i := 0; i < len(s); i++ { expand(i, i); expand(i, i+1) }
    return count
}`,
    keyPoints: ["中心扩展", "奇偶两种中心", "每个回文都计数"],
    followUps: ["最长回文子串怎么解？", "DP 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-121",
    nodeId: "p2-dp",
    question: "121. 买卖股票 I（LeetCode 121）\n买卖一次股票的最大利润。",
    answer: `// 思路：维护历史最低价，计算当天卖出利润
// 时间 O(n)，空间 O(1)
// 关键：minPrice 和 maxProfit

func maxProfit(prices []int) int {
    minPrice, maxProfit := 1<<31-1, 0
    for _, p := range prices {
        if p < minPrice { minPrice = p } else if p-minPrice > maxProfit { maxProfit = p - minPrice }
    }
    return maxProfit
}`,
    keyPoints: ["维护最低价", "当天卖出的利润", "一次遍历"],
    followUps: ["允许多次买卖怎么解？", "含冷冻期怎么解？"],
    favorited: false,
  },
  {
    id: "algo-122",
    nodeId: "p2-dp",
    question: "122. 买卖股票 II（LeetCode 122）\n允许多次买卖，求最大利润。",
    answer: `// 思路：贪心，所有上涨段都吃
// 时间 O(n)，空间 O(1)
// 关键：只要今天比昨天高就卖出

func maxProfit2(prices []int) int {
    profit := 0
    for i := 1; i < len(prices); i++ {
        if prices[i] > prices[i-1] { profit += prices[i] - prices[i-1] }
    }
    return profit
}`,
    keyPoints: ["贪心：所有上涨段求和", "等价于多次买卖", "也可 DP 状态机"],
    followUps: ["最多买卖两次怎么解？", "含手续费怎么改？"],
    favorited: false,
  },
  {
    id: "algo-188",
    nodeId: "p2-dp",
    question: "188. 买卖股票 IV（LeetCode 188）\n最多买卖 K 次的最大利润。",
    answer: `// 思路：状态机 DP，dp[i][k][0/1]
// 时间 O(n·k)，空间 O(n·k)
// 关键：buy/sell 状态转移

func maxProfit4(k int, prices []int) int {
    n := len(prices)
    if n == 0 || k == 0 { return 0 }
    if k >= n/2 { // 退化为无限次
        profit := 0
        for i := 1; i < n; i++ { if prices[i] > prices[i-1] { profit += prices[i] - prices[i-1] } }
        return profit
    }
    // dp[k][0]=持有, dp[k][1]=不持有
    buy := make([]int, k+1)
    sell := make([]int, k+1)
    for i := range buy { buy[i] = -1<<31 }
    for _, p := range prices {
        for j := 1; j <= k; j++ {
            buy[j] = max(buy[j], sell[j-1]-p)
            sell[j] = max(sell[j], buy[j]+p)
        }
    }
    return sell[k]
}`,
    keyPoints: ["状态机 DP", "dp[k][0/1]=第k次持有/不持有", "K>=n/2 退化为无限次"],
    followUps: ["含冷冻期怎么改？", "含手续费怎么改？"],
    favorited: false,
  },
  {
    id: "algo-32",
    nodeId: "p2-dp",
    question: "32. 最长有效括号（LeetCode 32）\n找最长的有效括号子串长度。",
    answer: `// 思路：DP，dp[i] = 以 i 结尾的最长有效括号
// 时间 O(n)，空间 O(n)
// 关键：...() 和 ...)) 两种情况

func longestValidParentheses(s string) int {
    n := len(s)
    dp := make([]int, n)
    maxLen := 0
    for i := 1; i < n; i++ {
        if s[i] == ')' {
            if s[i-1] == '(' { // ...()
                dp[i] = 2
                if i >= 2 { dp[i] += dp[i-2] }
            } else if i-dp[i-1]-1 >= 0 && s[i-dp[i-1]-1] == '(' { // ...))
                dp[i] = dp[i-1] + 2
                if i-dp[i-1]-2 >= 0 { dp[i] += dp[i-dp[i-1]-2] }
            }
            maxLen = max(maxLen, dp[i])
        }
    }
    return maxLen
}`,
    keyPoints: ["DP dp[i]=以i结尾的最长有效", "两种情况：()和))", "也可用栈"],
    followUps: ["用栈怎么解？", "O(1) 空间双向扫描怎么解？"],
    favorited: false,
  },

  // ===== Phase 2：图论（10题）=====
  {
    id: "algo-200",
    nodeId: "p2-graph",
    question: "200. 岛屿数量（LeetCode 200）\n计算二维网格中岛屿数量。",
    answer: `// 思路：DFS/BFS 遍历，遇到 1 就标记整个连通区域
// 时间 O(m·n)，空间 O(m·n)
// 关键：访问过的 1 标记为 0

func numIslands(grid [][]byte) int {
    m, n := len(grid), len(grid[0])
    count := 0
    var dfs func(i, j int)
    dfs = func(i, j int) {
        if i < 0 || i >= m || j < 0 || j >= n || grid[i][j] != '1' { return }
        grid[i][j] = '0'
        dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1)
    }
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if grid[i][j] == '1' { count++; dfs(i, j) }
        }
    }
    return count
}`,
    keyPoints: ["DFS 标记连通区域", "原地标记为 0", "也可 BFS"],
    followUps: ["岛屿最大面积怎么解？", "封闭岛屿怎么解？"],
    favorited: false,
  },
  {
    id: "algo-994",
    nodeId: "p2-graph",
    question: "994. 腐烂的橘子（LeetCode 994）\n多源 BFS，每分钟腐烂的橘子传染相邻新鲜橘子。",
    answer: `// 思路：多源 BFS，所有初始腐烂橘子同时入队
// 时间 O(m·n)，空间 O(m·n)
// 关键：多源 BFS = 超级源点

func orangesRotting(grid [][]int) int {
    m, n := len(grid), len(grid[0])
    var q [][2]int
    fresh := 0
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if grid[i][j] == 2 { q = append(q, [2]int{i, j}) } else if grid[i][j] == 1 { fresh++ }
        }
    }
    if fresh == 0 { return 0 }
    minutes := 0
    dirs := [4][2]int{{0,1},{0,-1},{1,0},{-1,0}}
    for len(q) > 0 {
        size := len(q)
        for i := 0; i < size; i++ {
            x, y := q[0][0], q[0][1]; q = q[1:]
            for _, d := range dirs {
                nx, ny := x+d[0], y+d[1]
                if nx >= 0 && nx < m && ny >= 0 && ny < n && grid[nx][ny] == 1 {
                    grid[nx][ny] = 2; fresh--; q = append(q, [2]int{nx, ny})
                }
            }
        }
        if len(q) > 0 { minutes++ }
    }
    if fresh > 0 { return -1 }
    return minutes
}`,
    keyPoints: ["多源 BFS", "所有腐烂橘子同时入队", "统计新鲜橘子数"],
    followUps: ["单源 BFS 怎么改？", "最短感染时间？"],
    favorited: false,
  },
  {
    id: "algo-207",
    nodeId: "p2-graph",
    question: "207. 课程表（LeetCode 207）\n判断能否完成所有课程（有向图无环）。",
    answer: `// 思路：拓扑排序，BFS 入度法
// 时间 O(V+E)，空间 O(V+E)
// 关键：入度为 0 的先入队，每出队减少后继入度

func canFinish(n int, prerequisites [][]int) bool {
    graph := make([][]int, n)
    indegree := make([]int, n)
    for _, p := range prerequisites { graph[p[1]] = append(graph[p[1]], p[0]); indegree[p[0]]++ }
    var queue []int
    for i := 0; i < n; i++ { if indegree[i] == 0 { queue = append(queue, i) } }
    count := 0
    for len(queue) > 0 {
        node := queue[0]; queue = queue[1:]; count++
        for _, next := range graph[node] { indegree[next]--; if indegree[next] == 0 { queue = append(queue, next) } }
    }
    return count == n
}`,
    keyPoints: ["拓扑排序 BFS", "入度为 0 先入队", "count==n 说明无环"],
    followUps: ["输出拓扑序怎么解？", "DFS 检测环怎么写？"],
    favorited: false,
  },
  {
    id: "algo-210",
    nodeId: "p2-graph",
    question: "210. 课程表 II（LeetCode 210）\n返回一个合法的课程学习顺序。",
    answer: `// 思路：拓扑排序 BFS，记录出队顺序
// 时间 O(V+E)，空间 O(V+E)
// 关键：同 207，但记录顺序

func findOrder(n int, prerequisites [][]int) []int {
    graph := make([][]int, n)
    indegree := make([]int, n)
    for _, p := range prerequisites { graph[p[1]] = append(graph[p[1]], p[0]); indegree[p[0]]++ }
    var queue []int
    for i := 0; i < n; i++ { if indegree[i] == 0 { queue = append(queue, i) } }
    var res []int
    for len(queue) > 0 {
        node := queue[0]; queue = queue[1:]; res = append(res, node)
        for _, next := range graph[node] { indegree[next]--; if indegree[next] == 0 { queue = append(queue, next) } }
    }
    if len(res) == n { return res }
    return nil
}`,
    keyPoints: ["拓扑排序 BFS", "记录出队顺序", "不等于 n 返回空"],
    followUps: ["所有拓扑序怎么解？", "DFS 怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-208",
    nodeId: "p2-graph",
    question: "208. Trie 实现（LeetCode 208）\n实现前缀树的 insert/search/startsWith。",
    answer: `// 思路：每个节点 26 个子节点 + isEnd 标记
// 时间 O(L) 每操作，空间 O(总字符数×26)
// 关键：共享前缀，isEnd 区分单词和前缀

type Trie struct {
    children [26]*Trie
    isEnd    bool
}
func (t *Trie) Insert(word string) {
    node := t
    for i := 0; i < len(word); i++ {
        idx := word[i] - 'a'
        if node.children[idx] == nil { node.children[idx] = &Trie{} }
        node = node.children[idx]
    }
    node.isEnd = true
}
func (t *Trie) Search(word string) bool {
    node := t.searchPrefix(word)
    return node != nil && node.isEnd
}
func (t *Trie) StartsWith(prefix string) bool { return t.searchPrefix(prefix) != nil }
func (t *Trie) searchPrefix(s string) *Trie {
    node := t
    for i := 0; i < len(s); i++ { idx := s[i]-'a'; if node.children[idx] == nil { return nil }; node = node.children[idx] }
    return node
}`,
    keyPoints: ["26 叉树", "isEnd 标记单词结束", "共享前缀"],
    followUps: ["如何删除单词？", "压缩前缀树怎么实现？"],
    favorited: false,
  },
  {
    id: "algo-130",
    nodeId: "p2-graph",
    question: "130. 被围绕的区域（LeetCode 130）\n将被围绕的 O 翻转为 X，边界 O 及其连通的 O 保留。",
    answer: `// 思路：从边界 O DFS 标记，未被标记的 O 翻转
// 时间 O(m·n)，空间 O(m·n)
// 关键：边界 O 先标记为临时字符

func solve(board [][]byte) {
    m, n := len(board), len(board[0])
    var dfs func(i, j int)
    dfs = func(i, j int) {
        if i < 0 || i >= m || j < 0 || j >= n || board[i][j] != 'O' { return }
        board[i][j] = '#'
        dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1)
    }
    for i := 0; i < m; i++ { dfs(i, 0); dfs(i, n-1) }
    for j := 0; j < n; j++ { dfs(0, j); dfs(m-1, j) }
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if board[i][j] == 'O' { board[i][j] = 'X' } else if board[i][j] == '#' { board[i][j] = 'O' }
        }
    }
}`,
    keyPoints: ["从边界 DFS 标记", "临时标记 #", "未标记的 O 翻转"],
    followUps: ["BFS 怎么解？", "并查集怎么解？"],
    favorited: false,
  },
  {
    id: "algo-133",
    nodeId: "p2-graph",
    question: "133. 克隆图（LeetCode 133）\n深拷贝无向连通图。",
    answer: `// 思路：DFS/BFS + 哈希表记录已克隆
// 时间 O(V+E)，空间 O(V)
// 关键：哈希表防重复克隆

func cloneGraph(node *Node) *Node {
    if node == nil { return nil }
    visited := map[*Node]*Node{}
    var dfs func(n *Node) *Node
    dfs = func(n *Node) *Node {
        if cloned, ok := visited[n]; ok { return cloned }
        clone := &Node{Val: n.Val}
        visited[n] = clone
        for _, neighbor := range n.Neighbors { clone.Neighbors = append(clone.Neighbors, dfs(neighbor)) }
        return clone
    }
    return dfs(node)
}`,
    keyPoints: ["DFS/BFS + 哈希表", "哈希表防重复", "先建节点再加入邻居"],
    followUps: ["BFS 怎么实现？", "有环怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-417",
    nodeId: "p2-graph",
    question: "417. 太平洋大西洋水流（LeetCode 417）\n找能同时流向太平洋和大西洋的格子。",
    answer: `// 思路：从两个大洋分别 DFS 逆流标记
// 时间 O(m·n)，空间 O(m·n)
// 关键：从边界逆流向上标记

func pacificAtlantic(heights [][]int) [][]int {
    m, n := len(heights), len(heights[0])
    pacific := make([][]bool, m)
    atlantic := make([][]bool, m)
    for i := range pacific { pacific[i] = make([]bool, n); atlantic[i] = make([]bool, n) }
    var dfs func(i, j int, visited [][]bool)
    dfs = func(i, j int, visited [][]bool) {
        visited[i][j] = true
        dirs := [4][2]int{{0,1},{0,-1},{1,0},{-1,0}}
        for _, d := range dirs {
            ni, nj := i+d[0], j+d[1]
            if ni >= 0 && ni < m && nj >= 0 && nj < n && !visited[ni][nj] && heights[ni][nj] >= heights[i][j] {
                dfs(ni, nj, visited)
            }
        }
    }
    for i := 0; i < m; i++ { dfs(i, 0, pacific); dfs(i, n-1, atlantic) }
    for j := 0; j < n; j++ { dfs(0, j, pacific); dfs(m-1, j, atlantic) }
    var res [][]int
    for i := 0; i < m; i++ { for j := 0; j < n; j++ { if pacific[i][j] && atlantic[i][j] { res = append(res, []int{i, j}) } } }
    return res
}`,
    keyPoints: ["从边界逆流 DFS", "两个标记数组", "两个都能到达的即为答案"],
    followUps: ["BFS 怎么解？", "如果水流可以斜着流呢？"],
    favorited: false,
  },
  {
    id: "algo-684",
    nodeId: "p2-graph",
    question: "684. 冗余连接（LeetCode 684）\n在树中多加了一条边，找那条冗余边。",
    answer: `// 思路：并查集，第一条使两端已连通的边即为答案
// 时间 O(n·α(n))，空间 O(n)
// 关键：并查集检测环

func findRedundantConnection(edges [][]int) []int {
    parent := make([]int, len(edges)+1)
    for i := range parent { parent[i] = i }
    var find func(x int) int
    find = func(x int) int { if parent[x] != x { parent[x] = find(parent[x]) }; return parent[x] }
    union := func(x, y int) bool { px, py := find(x), find(y); if px == py { return false }; parent[px] = py; return true }
    for _, e := range edges { if !union(e[0], e[1]) { return e } }
    return nil
}`,
    keyPoints: ["并查集", "第一条成环的边", "路径压缩优化"],
    followUps: ["有向图的冗余边怎么解？", "多条冗余边返回最后一条？"],
    favorited: false,
  },
  {
    id: "algo-787",
    nodeId: "p2-graph",
    question: "787. K 站中转内最便宜航班（LeetCode 787）\n找最多 K 中转的最便宜航班价格。",
    answer: `// 思路：Bellman-Ford 变体，限制 K+1 轮松弛
// 时间 O(K·E)，空间 O(n)
// 关键：每轮用上一轮的结果松弛

func findCheapestPrice(n int, flights [][]int, src, dst, k int) int {
    prices := make([]int, n)
    for i := range prices { prices[i] = 1<<31 - 1 }
    prices[src] = 0
    for i := 0; i <= k; i++ {
        tmp := make([]int, n); copy(tmp, prices)
        for _, f := range flights {
            from, to, price := f[0], f[1], f[2]
            if prices[from] != 1<<31-1 && prices[from]+price < tmp[to] { tmp[to] = prices[from] + price }
        }
        prices = tmp
    }
    if prices[dst] == 1<<31-1 { return -1 }
    return prices[dst]
}`,
    keyPoints: ["Bellman-Ford 变体", "K+1 轮松弛", "用上一轮结果防止超步"],
    followUps: ["Dijkstra 怎么解？", "如果允许负权呢？"],
    favorited: false,
  },

  // ===== Phase 2：堆与优先队列（4题，跳过重题）=====
  {
    id: "algo-295",
    nodeId: "p2-heap",
    question: "295. 数据流的中位数（LeetCode 295）\n动态添加数字并 O(1) 获取中位数。",
    answer: `// 思路：大顶堆存左半 + 小顶堆存右半，平衡两堆大小
// 时间 addNum O(logn)，findMedian O(1)
// 关键：两堆大小差<=1，大顶堆顶<=小顶堆顶

type MedianFinder struct {
    maxHeap *MaxHeap // 左半（较小）
    minHeap *MinHeap // 右半（较大）
}
func (mf *MedianFinder) AddNum(num int) {
    heap.Push(mf.maxHeap, num)
    heap.Push(mf.minHeap, heap.Pop(mf.maxHeap))
    if mf.minHeap.Len() > mf.maxHeap.Len() { heap.Push(mf.maxHeap, heap.Pop(mf.minHeap)) }
}
func (mf *MedianFinder) FindMedian() float64 {
    if mf.maxHeap.Len() > mf.minHeap.Len() { return float64(mf.maxHeap.Top()) }
    return float64(mf.maxHeap.Top()+mf.minHeap.Top()) / 2
}`,
    keyPoints: ["双堆：大顶堆+小顶堆", "平衡两堆大小", "大顶堆可多一个"],
    followUps: ["用排序怎么解？时间复杂度？", "数据量很大怎么办？"],
    favorited: false,
  },
  {
    id: "algo-703",
    nodeId: "p2-heap",
    question: "703. 数据流中第 K 大元素（LeetCode 703）\n动态添加数字并返回第 K 大。",
    answer: `// 思路：维护大小为 K 的小顶堆
// 时间 add O(logk)，空间 O(k)
// 关键：堆满后比堆顶大的才入堆

type KthLargest struct {
    k    int
    heap *MinHeap
}
func (kl *KthLargest) Add(val int) int {
    heap.Push(kl.heap, val)
    if kl.heap.Len() > kl.k { heap.Pop(kl.heap) }
    return kl.heap.Top()
}`,
    keyPoints: ["小顶堆大小 K", "堆顶即第 K 大", "堆满弹出最小"],
    followUps: ["第 K 小怎么解？", "快速选择怎么解？"],
    favorited: false,
  },
  {
    id: "algo-373",
    nodeId: "p2-heap",
    question: "373. 查找和最小的 K 对数字（LeetCode 373）\n从两个有序数组中找和最小的 K 对数字。",
    answer: `// 思路：小顶堆，按和从小弹出
// 时间 O(K·logK)，空间 O(K)
// 关键：先入第一列，弹出一个再入同行下一个

func kSmallestPairs(nums1, nums2 []int, k int) [][]int {
    var h MinHeap
    for i := 0; i < len(nums1) && i < k; i++ { heap.Push(&h, [3]int{nums1[i] + nums2[0], i, 0}) }
    var res [][]int
    for h.Len() > 0 && len(res) < k {
        top := heap.Pop(&h).([3]int)
        i, j := top[1], top[2]
        res = append(res, []int{nums1[i], nums2[j]})
        if j+1 < len(nums2) { heap.Push(&h, [3]int{nums1[i] + nums2[j+1], i, j + 1}) }
    }
    return res
}`,
    keyPoints: ["小顶堆", "先入第一列", "弹出后入同行下一个"],
    followUps: ["暴力法时间复杂度？", "二分怎么解？"],
    favorited: false,
  },
  {
    id: "algo-502",
    nodeId: "p2-heap",
    question: "502. IPO（LeetCode 502）\n初始资本 w，最多做 k 个项目，每个有资本和利润，求最终最大资本。",
    answer: `// 思路：按资本排序 + 大顶堆选利润最大
// 时间 O(n·logn)，空间 O(n)
// 关键：每次选资本允许范围内利润最大的

func findMaximizedCapital(k, w int, profits, capital []int) int {
    n := len(profits)
    projects := make([][2]int, n)
    for i := 0; i < n; i++ { projects[i] = [2]int{capital[i], profits[i]} }
    sort.Slice(projects, func(i, j int) bool { return projects[i][0] < projects[j][0] })
    var maxHeap MaxHeap
    idx := 0
    for i := 0; i < k; i++ {
        for idx < n && projects[idx][0] <= w { heap.Push(&maxHeap, projects[idx][1]); idx++ }
        if maxHeap.Len() == 0 { break }
        w += heap.Pop(&maxHeap).(int)
    }
    return w
}`,
    keyPoints: ["按资本排序", "大顶堆选利润最大", "贪心选 k 次"],
    followUps: ["如果项目有依赖关系？", "如果不限制 k？"],
    favorited: false,
  },

  // ===== Phase 2：贪心（7题，跳过重题）=====
  {
    id: "algo-55",
    nodeId: "p2-greedy",
    question: "55. 跳跃游戏（LeetCode 55）\n判断能否跳到终点。",
    answer: `// 思路：贪心维护最远可达位置
// 时间 O(n)，空间 O(1)
// 关键：maxReach = max(maxReach, i+nums[i])

func canJump(nums []int) bool {
    maxReach := 0
    for i := 0; i < len(nums); i++ {
        if i > maxReach { return false }
        maxReach = max(maxReach, i+nums[i])
        if maxReach >= len(nums)-1 { return true }
    }
    return true
}`,
    keyPoints: ["贪心维护 maxReach", "i > maxReach 则不可达", "到达终点即成功"],
    followUps: ["最少跳跃次数怎么解？", "如果允许后退呢？"],
    favorited: false,
  },
  {
    id: "algo-45",
    nodeId: "p2-greedy",
    question: "45. 跳跃游戏 II（LeetCode 45）\n求跳到终点的最少次数。",
    answer: `// 思路：贪心，维护当前步的边界和下一步最远
// 时间 O(n)，空间 O(1)
// 关键：到达当前边界时步数+1

func jump(nums []int) int {
    jumps, curEnd, maxReach := 0, 0, 0
    for i := 0; i < len(nums)-1; i++ {
        maxReach = max(maxReach, i+nums[i])
        if i == curEnd { jumps++; curEnd = maxReach }
    }
    return jumps
}`,
    keyPoints: ["贪心维护边界", "到达边界步数+1", "BFS 层次思想"],
    followUps: ["如果跳跃距离有上限？", "BFS 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-763",
    nodeId: "p2-greedy",
    question: "763. 划分字母区间（LeetCode 763）\n将字符串划分为尽量多的片段，每个字母只出现在一个片段中。",
    answer: `// 思路：记录每个字母最后出现位置，贪心扩展
// 时间 O(n)，空间 O(26)
// 关键：当前片段的右边界 = 片段内所有字母的最后位置

func partitionLabels(s string) []int {
    last := [26]int{}
    for i := 0; i < len(s); i++ { last[s[i]-'a'] = i }
    var res []int
    start, end := 0, 0
    for i := 0; i < len(s); i++ {
        end = max(end, last[s[i]-'a'])
        if i == end { res = append(res, i-start+1); start = i + 1 }
    }
    return res
}`,
    keyPoints: ["记录每个字母最后位置", "贪心扩展右边界", "i==end 时切割"],
    followUps: ["最少划分怎么解？", "合并区间思路？"],
    favorited: false,
  },
  {
    id: "algo-134",
    nodeId: "p2-greedy",
    question: "134. 加油站（LeetCode 134）\n找能跑完一圈的起始加油站。",
    answer: `// 思路：贪心，总油量>=总消耗则必有解
// 时间 O(n)，空间 O(1)
// 关键：从某点无法到达则从下一站重新开始

func canCompleteCircuit(gas, cost []int) int {
    total, tank, start := 0, 0, 0
    for i := 0; i < len(gas); i++ {
        diff := gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0 { start = i + 1; tank = 0 }
    }
    if total < 0 { return -1 }
    return start
}`,
    keyPoints: ["总油>=总耗必有解", "tank<0 重置起点", "一次遍历"],
    followUps: ["为什么这样是正确的？", "暴力 O(n²) 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-406",
    nodeId: "p2-greedy",
    question: "406. 根据身高重建队列（LeetCode 406）\n每个人有身高 h 和前面有几个不低于他的人 k，重建队列。",
    answer: `// 思路：按身高降序排序，按 k 插入
// 时间 O(n²)，空间 O(n)
// 关键：高的人先插，矮的人插入不影响高的人的 k

func reconstructQueue(people [][]int) [][]int {
    sort.Slice(people, func(i, j int) bool {
        if people[i][0] != people[j][0] { return people[i][0] > people[j][0] }
        return people[i][1] < people[j][1]
    })
    var res [][]int
    for _, p := range people {
        idx := p[1]
        res = append(res, nil)
        copy(res[idx+1:], res[idx:])
        res[idx] = p
    }
    return res
}`,
    keyPoints: ["身高降序 + k 升序", "按 k 位置插入", "矮人插入不影响高人"],
    followUps: ["为什么降序排？", "链表优化插入？"],
    favorited: false,
  },
  {
    id: "algo-621",
    nodeId: "p2-greedy",
    question: "621. 任务调度器（LeetCode 621）\n相同任务间需间隔 n 个冷却，求最少时间。",
    answer: `// 思路：找出现次数最多的任务，用公式计算
// 时间 O(n)，空间 O(26)
// 关键：(maxCount-1)*(n+1) + maxCountTasks，与总任务数取大

func leastInterval(tasks []byte, n int) int {
    cnt := [26]int{}
    maxCount := 0
    for _, t := range tasks { cnt[t-'A']++; maxCount = max(maxCount, cnt[t-'A']) }
    maxTasks := 0
    for _, c := range cnt { if c == maxCount { maxTasks++ } }
    return max(len(tasks), (maxCount-1)*(n+1)+maxTasks)
}`,
    keyPoints: ["最多任务决定框架", "公式 (max-1)(n+1)+maxTasks", "与总任务数取大"],
    followUps: ["如果不同任务冷却不同？", "模拟怎么解？"],
    favorited: false,
  },
  {
    id: "algo-135",
    nodeId: "p2-greedy",
    question: "135. 分发糖果（LeetCode 135）\n每个孩子至少 1 颗糖，评分高的比相邻的多，求最少糖果数。",
    answer: `// 思路：两次遍历——左到右和右到左
// 时间 O(n)，空间 O(n)
// 关键：左到右保证比左边高分多，右到左保证比右边高分多

func candy(ratings []int) int {
    n := len(ratings)
    candies := make([]int, n)
    for i := range candies { candies[i] = 1 }
    for i := 1; i < n; i++ { if ratings[i] > ratings[i-1] { candies[i] = candies[i-1] + 1 } }
    for i := n - 2; i >= 0; i-- { if ratings[i] > ratings[i+1] { candies[i] = max(candies[i], candies[i+1]+1) } }
    sum := 0
    for _, c := range candies { sum += c }
    return sum
}`,
    keyPoints: ["两次遍历", "左到右+右到左", "取两次结果的最大值"],
    followUps: ["O(1) 空间怎么解？", "环形怎么办？"],
    favorited: false,
  },

  // ===== Phase 2：高频面试题（23题，跳过重题）=====
  {
    id: "algo-53",
    nodeId: "p2-highfreq",
    question: "53. 最大子数组和（LeetCode 53）\n找连续子数组的最大和。",
    answer: `// 思路：DP，dp[i]=max(nums[i], dp[i-1]+nums[i])
// 时间 O(n)，空间 O(1)
// 关键：负和不如从当前重新开始

func maxSubArray(nums []int) int {
    maxSum, curSum := nums[0], nums[0]
    for i := 1; i < len(nums); i++ {
        curSum = max(nums[i], curSum+nums[i])
        maxSum = max(maxSum, curSum)
    }
    return maxSum
}`,
    keyPoints: ["Kadane 算法", "curSum=max(nums[i], curSum+nums[i])", "也可分治"],
    followUps: ["返回子数组起止位置？", "最大子数组乘积？"],
    favorited: false,
  },
  {
    id: "algo-234",
    nodeId: "p2-highfreq",
    question: "234. 回文链表（LeetCode 234）\n判断链表是否回文。",
    answer: `// 思路：快慢指针找中点，反转后半，比较
// 时间 O(n)，空间 O(1)
// 关键：找中点-反转-比较-（可选恢复）

func isPalindrome(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil { slow = slow.Next; fast = fast.Next.Next }
    // 反转后半
    var prev *ListNode
    for slow != nil { next := slow.Next; slow.Next = prev; prev = slow; slow = next }
    // 比较
    for prev != nil && head != nil {
        if head.Val != prev.Val { return false }
        head = head.Next; prev = prev.Next
    }
    return true
}`,
    keyPoints: ["快慢指针找中点", "反转后半部分", "O(1) 空间"],
    followUps: ["不修改链表怎么做？", "恢复链表怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-287",
    nodeId: "p2-highfreq",
    question: "287. 寻找重复数（LeetCode 287）\n数组 n+1 个数范围 1~n，找重复数。不修改数组 O(1) 空间。",
    answer: `// 思路：快慢指针，将值当作下一个下标
// 时间 O(n)，空间 O(1)
// 关键：等价于找环入口

func findDuplicate(nums []int) int {
    slow, fast := nums[0], nums[0]
    for { slow = nums[slow]; fast = nums[nums[fast]]; if slow == fast { break } }
    slow = nums[0]
    for slow != fast { slow = nums[slow]; fast = nums[fast] }
    return slow
}`,
    keyPoints: ["快慢指针找环", "值当作下标", "不修改数组"],
    followUps: ["二分法怎么解？", "位运算怎么解？"],
    favorited: false,
  },
  {
    id: "algo-160",
    nodeId: "p2-highfreq",
    question: "160. 相交链表（LeetCode 160）\n找两个链表的交点。",
    answer: `// 思路：双指针走完自己走对方的，总长度相同必在交点相遇
// 时间 O(m+n)，空间 O(1)
// 关键：走完自己换到对方链表头

func getIntersectionNode(headA, headB *ListNode) *ListNode {
    a, b := headA, headB
    for a != b {
        if a == nil { a = headB } else { a = a.Next }
        if b == nil { b = headA } else { b = b.Next }
    }
    return a
}`,
    keyPoints: ["双指针交换走", "总路径长度相同", "无交点则同时为 nil"],
    followUps: ["用哈希表怎么解？", "如果知道长度差怎么解？"],
    favorited: false,
  },
  {
    id: "algo-328",
    nodeId: "p2-highfreq",
    question: "328. 奇偶链表（LeetCode 328）\n将奇数位节点放一起，偶数位节点放一起。",
    answer: `// 思路：分离奇偶两条链，最后连接
// 时间 O(n)，空间 O(1)
// 关键：维护奇偶两个尾指针

func oddEvenList(head *ListNode) *ListNode {
    if head == nil { return nil }
    odd, even, evenHead := head, head.Next, head.Next
    for even != nil && even.Next != nil {
        odd.Next = even.Next; odd = odd.Next
        even.Next = odd.Next; even = even.Next
    }
    odd.Next = evenHead
    return head
}`,
    keyPoints: ["分离奇偶链表", "维护两个尾指针", "最后奇链尾接偶链头"],
    followUps: ["按 K 分组怎么解？", "原地操作？"],
    favorited: false,
  },
  {
    id: "algo-236",
    nodeId: "p2-highfreq",
    question: "236. 二叉树最近公共祖先（LeetCode 236）\n找两个节点的最近公共祖先。",
    answer: `// 思路：递归，左右子树分别找 p 和 q
// 时间 O(n)，空间 O(h)
// 关键：左有右有则当前是 LCA，左有返回左，右有返回右

func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q { return root }
    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)
    if left != nil && right != nil { return root }
    if left != nil { return left }
    return right
}`,
    keyPoints: ["递归后序遍历", "左右都找到则当前是 LCA", "一边找到返回那边"],
    followUps: ["BST 的 LCA 怎么优化？", "多个节点的 LCA？"],
    favorited: false,
  },
  {
    id: "algo-437",
    nodeId: "p2-highfreq",
    question: "437. 路径总和 III（LeetCode 437）\n找二叉树中和为 target 的路径数，路径向下。",
    answer: `// 思路：前缀和 + DFS
// 时间 O(n)，空间 O(h)
// 关键：前缀和差值判断子路径和

func pathSum(root *TreeNode, targetSum int) int {
    prefixSum := map[int]int{0: 1}
    var dfs func(node *TreeNode, curSum int) int
    dfs = func(node *TreeNode, curSum int) int {
        if node == nil { return 0 }
        curSum += node.Val
        count := prefixSum[curSum-targetSum]
        prefixSum[curSum]++
        count += dfs(node.Left, curSum) + dfs(node.Right, curSum)
        prefixSum[curSum]--
        return count
    }
    return dfs(root, 0)
}`,
    keyPoints: ["前缀和 + DFS", "回溯撤销前缀和", "差值判断子路径"],
    followUps: ["不回溯会怎样？", "如果路径可以任意方向？"],
    favorited: false,
  },
  {
    id: "algo-240",
    nodeId: "p2-highfreq",
    question: "240. 搜索二维矩阵 II（LeetCode 240）\n在每行每列递增的矩阵中搜索目标值。",
    answer: `// 思路：从右上角开始，小则左移，大则下移
// 时间 O(m+n)，空间 O(1)
// 关键：右上角是二叉搜索树的根

func searchMatrix(matrix [][]int, target int) bool {
    m, n := len(matrix), len(matrix[0])
    r, c := 0, n-1
    for r < m && c >= 0 {
        if matrix[r][c] == target { return true }
        if matrix[r][c] < target { r++ } else { c-- }
    }
    return false
}`,
    keyPoints: ["从右上角开始", "小则左移大则下移", "O(m+n) 时间"],
    followUps: ["左下角开始行不行？", "能否二分优化？"],
    favorited: false,
  },
  {
    id: "algo-162",
    nodeId: "p2-highfreq",
    question: "162. 寻找峰值（LeetCode 162）\n找任意一个峰值元素，要求 O(logn)。",
    answer: `// 思路：二分，往大的方向走
// 时间 O(logn)，空间 O(1)
// 关键：mid 比右边小则峰值在右半，否则在左半

func findPeakElement(nums []int) int {
    l, r := 0, len(nums)-1
    for l < r {
        mid := l + (r-l)/2
        if nums[mid] < nums[mid+1] { l = mid + 1 } else { r = mid }
    }
    return l
}`,
    keyPoints: ["二分往大方向走", "nums[mid]<nums[mid+1] 右半有峰值", "相邻不等保证有解"],
    followUps: ["找所有峰值怎么解？", "二维峰值怎么解？"],
    favorited: false,
  },
  {
    id: "algo-73",
    nodeId: "p2-highfreq",
    question: "73. 矩阵置零（LeetCode 73）\n如果矩阵元素为 0，将其行列全置 0。原地操作。",
    answer: `// 思路：用首行首列标记，再统一置零
// 时间 O(m·n)，空间 O(1)
// 关键：首行首列单独标记，先存原始状态

func setZeroes(matrix [][]int) {
    m, n := len(matrix), len(matrix[0])
    firstRow, firstCol := false, false
    for j := 0; j < n; j++ { if matrix[0][j] == 0 { firstRow = true } }
    for i := 0; i < m; i++ { if matrix[i][0] == 0 { firstCol = true } }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ { if matrix[i][j] == 0 { matrix[i][0] = 0; matrix[0][j] = 0 } }
    }
    for i := 1; i < m; i++ { for j := 1; j < n; j++ { if matrix[i][0] == 0 || matrix[0][j] == 0 { matrix[i][j] = 0 } } }
    if firstRow { for j := 0; j < n; j++ { matrix[0][j] = 0 } }
    if firstCol { for i := 0; i < m; i++ { matrix[i][0] = 0 } }
}`,
    keyPoints: ["用首行首列做标记", "先存首行首列原始状态", "最后处理首行首列"],
    followUps: ["用 O(m+n) 空间怎么解？", "常数空间还有别的方法吗？"],
    favorited: false,
  },
  {
    id: "algo-54",
    nodeId: "p2-highfreq",
    question: "54. 螺旋矩阵（LeetCode 54）\n按顺时针螺旋顺序返回矩阵所有元素。",
    answer: `// 思路：四方向模拟，维护边界
// 时间 O(m·n)，空间 O(1)
// 关键：上下左右四个边界，逐层收缩

func spiralOrder(matrix [][]int) []int {
    m, n := len(matrix), len(matrix[0])
    top, bottom, left, right := 0, m-1, 0, n-1
    var res []int
    for top <= bottom && left <= right {
        for j := left; j <= right; j++ { res = append(res, matrix[top][j]) }
        top++
        for i := top; i <= bottom; i++ { res = append(res, matrix[i][right]) }
        right--
        if top <= bottom { for j := right; j >= left; j-- { res = append(res, matrix[bottom][j]) }; bottom-- }
        if left <= right { for i := bottom; i >= top; i-- { res = append(res, matrix[i][left]) }; left++ }
    }
    return res
}`,
    keyPoints: ["四方向模拟", "维护四个边界", "注意边界收缩后判越界"],
    followUps: ["生成螺旋矩阵怎么解？", "逆时针怎么改？"],
    favorited: false,
  },
  {
    id: "algo-48",
    nodeId: "p2-highfreq",
    question: "48. 旋转图像（LeetCode 48）\n将 n×n 矩阵顺时针旋转 90 度，原地操作。",
    answer: `// 思路：先转置再每行翻转
// 时间 O(n²)，空间 O(1)
// 关键：转置 + 行翻转 = 顺时针 90 度

func rotate(matrix [][]int) {
    n := len(matrix)
    // 转置
    for i := 0; i < n; i++ { for j := i; j < n; j++ { matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j] } }
    // 每行翻转
    for i := 0; i < n; i++ { for j := 0; j < n/2; j++ { matrix[i][j], matrix[i][n-1-j] = matrix[i][n-1-j], matrix[i][j] } }
}`,
    keyPoints: ["转置 + 行翻转", "原地操作", "逆时针=转置+列翻转"],
    followUps: ["逆时针 90 度怎么解？", "180 度怎么解？"],
    favorited: false,
  },
  {
    id: "algo-14",
    nodeId: "p2-highfreq",
    question: "14. 最长公共前缀（LeetCode 14）\n找字符串数组的最长公共前缀。",
    answer: `// 思路：纵向比较每个字符串的同一位置
// 时间 O(S)，空间 O(1)
// 关键：逐字符比较，不等则返回

func longestCommonPrefix(strs []string) string {
    if len(strs) == 0 { return "" }
    for i := 0; i < len(strs[0]); i++ {
        for j := 1; j < len(strs); j++ {
            if i >= len(strs[j]) || strs[j][i] != strs[0][i] { return strs[0][:i] }
        }
    }
    return strs[0]
}`,
    keyPoints: ["纵向逐字符比较", "越界或不等则返回", "也可横向比较"],
    followUps: ["用分治怎么解？", "用二分怎么解？"],
    favorited: false,
  },
  {
    id: "algo-28",
    nodeId: "p2-highfreq",
    question: "28. 找出字符串中第一个匹配项（LeetCode 28）\n实现 strStr，返回 needle 在 haystack 中的位置。",
    answer: `// 思路：KMP 算法
// 时间 O(n+m)，空间 O(m)
// 关键：next 数组记录最长前后缀，失配时跳转

func strStr(haystack, needle string) int {
    if needle == "" { return 0 }
    next := buildNext(needle)
    j := 0
    for i := 0; i < len(haystack); i++ {
        for j > 0 && haystack[i] != needle[j] { j = next[j-1] }
        if haystack[i] == needle[j] { j++ }
        if j == len(needle) { return i - j + 1 }
    }
    return -1
}
func buildNext(s string) []int {
    next := make([]int, len(s))
    j := 0
    for i := 1; i < len(s); i++ {
        for j > 0 && s[i] != s[j] { j = next[j-1] }
        if s[i] == s[j] { j++ }
        next[i] = j
    }
    return next
}`,
    keyPoints: ["KMP 算法", "next 数组=最长相同前后缀", "失配时跳转"],
    followUps: ["暴力法时间复杂度？", "Rabin-Karp 怎么解？"],
    favorited: false,
  },
  {
    id: "algo-151",
    nodeId: "p2-highfreq",
    question: "151. 反转字符串中的单词（LeetCode 151）\n将字符串中的单词顺序反转。",
    answer: `// 思路：整体反转 + 逐词反转 + 去多余空格
// 时间 O(n)，空间 O(1)（Go 需转 []byte）
// 关键：三次反转

func reverseWords(s string) string {
    b := []byte(strings.TrimSpace(s))
    // 反转整体
    reverseBytes(b, 0, len(b)-1)
    // 逐词反转
    start := 0
    for i := 0; i <= len(b); i++ {
        if i == len(b) || b[i] == ' ' {
            reverseBytes(b, start, i-1)
            start = i + 1
        }
    }
    // 去多余空格
    return strings.Join(strings.Fields(string(b)), " ")
}`,
    keyPoints: ["三次反转", "先整体后逐词", "去多余空格"],
    followUps: ["不用 split/join 怎么做？", "原地怎么做？"],
    favorited: false,
  },
  {
    id: "algo-7",
    nodeId: "p2-highfreq",
    question: "7. 整数反转（LeetCode 7）\n反转 32 位有符号整数，溢出返回 0。",
    answer: `// 思路：逐位反转，溢出检查
// 时间 O(logn)，空间 O(1)
// 关键：反转前检查是否溢出

func reverse(x int) int {
    res := 0
    for x != 0 {
        digit := x % 10
        x /= 10
        if res > (1<<31-1)/10 || (res == (1<<31-1)/10 && digit > 7) { return 0 }
        if res < (-1<<31)/10 || (res == (-1<<31)/10 && digit < -8) { return 0 }
        res = res*10 + digit
    }
    return res
}`,
    keyPoints: ["逐位取模反转", "溢出检查", "注意负数取模"],
    followUps: ["不用 long 怎么解？", "字符串反转怎么解？"],
    favorited: false,
  },
  {
    id: "algo-9",
    nodeId: "p2-highfreq",
    question: "9. 回文数（LeetCode 9）\n判断整数是否回文，不转字符串。",
    answer: `// 思路：反转后半数字与前半比较
// 时间 O(logn)，空间 O(1)
// 关键：反转一半避免溢出

func isPalindrome(x int) bool {
    if x < 0 || (x%10 == 0 && x != 0) { return false }
    reverted := 0
    for x > reverted { reverted = reverted*10 + x%10; x /= 10 }
    return x == reverted || x == reverted/10
}`,
    keyPoints: ["反转后半", "处理负数和尾零", "奇偶长度分别处理"],
    followUps: ["转字符串怎么解？", "反转全部数字呢？"],
    favorited: false,
  },
  {
    id: "algo-66",
    nodeId: "p2-highfreq",
    question: "66. 加一（LeetCode 66）\n将用数组表示的非负整数加一。",
    answer: `// 思路：从末尾加一，处理进位
// 时间 O(n)，空间 O(1)
// 关键：全 9 时需要扩展数组

func plusOne(digits []int) []int {
    for i := len(digits) - 1; i >= 0; i-- {
        if digits[i] < 9 { digits[i]++; return digits }
        digits[i] = 0
    }
    return append([]int{1}, digits...)
}`,
    keyPoints: ["从后往前加一", "进位处理", "全 9 扩展数组"],
    followUps: ["加任意数字怎么解？", "字符串加法？"],
    favorited: false,
  },
  {
    id: "algo-58",
    nodeId: "p2-highfreq",
    question: "58. 最后一个单词的长度（LeetCode 58）\n返回字符串中最后一个单词的长度。",
    answer: `// 思路：从后往前跳过空格找单词
// 时间 O(n)，空间 O(1)
// 关键：先跳尾部空格再数单词

func lengthOfLastWord(s string) int {
    i := len(s) - 1
    for i >= 0 && s[i] == ' ' { i-- }
    length := 0
    for i >= 0 && s[i] != ' ' { length++; i-- }
    return length
}`,
    keyPoints: ["从后往前", "先跳尾部空格", "数非空格字符"],
    followUps: ["用 split 怎么解？", "多个连续空格怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-383",
    nodeId: "p2-highfreq",
    question: "383. 赎金信（LeetCode 383）\n判断 magazine 能否构造 ransomNote。",
    answer: `// 思路：字符计数
// 时间 O(m+n)，空间 O(26)
// 关键：magazine 计数减去 ransomNote

func canConstruct(ransomNote, magazine string) bool {
    cnt := [26]int{}
    for i := 0; i < len(magazine); i++ { cnt[magazine[i]-'a']++ }
    for i := 0; i < len(ransomNote); i++ { cnt[ransomNote[i]-'a']--; if cnt[ransomNote[i]-'a'] < 0 { return false } }
    return true
}`,
    keyPoints: ["字符计数", "magazine 计数", "不够则 false"],
    followUps: ["用哈希表怎么解？", "Unicode 字符怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-205",
    nodeId: "p2-highfreq",
    question: "205. 同构字符串（LeetCode 205）\n判断 s 和 t 是否同构（一一映射）。",
    answer: `// 思路：双向哈希映射
// 时间 O(n)，空间 O(128)
// 关键：s→t 和 t→s 双向映射一致

func isIsomorphic(s, t string) bool {
    m1, m2 := map[byte]byte{}, map[byte]byte{}
    for i := 0; i < len(s); i++ {
        if v, ok := m1[s[i]]; ok && v != t[i] { return false }
        if v, ok := m2[t[i]]; ok && v != s[i] { return false }
        m1[s[i]] = t[i]; m2[t[i]] = s[i]
    }
    return true
}`,
    keyPoints: ["双向映射", "s→t 和 t→s 都要检查", "一一对应"],
    followUps: ["用数组优化？", "多个字符串同构？"],
    favorited: false,
  },
  {
    id: "algo-290",
    nodeId: "p2-highfreq",
    question: "290. 单词规律（LeetCode 290）\n判断字符串是否遵循给定规律。",
    answer: `// 思路：双向映射，split 后逐词对应
// 时间 O(n)，空间 O(1)
// 关键：pattern→word 和 word→pattern 双向

func wordPattern(pattern, s string) bool {
    words := strings.Split(s, " ")
    if len(pattern) != len(words) { return false }
    m1, m2 := map[byte]string{}, map[string]byte{}
    for i := 0; i < len(pattern); i++ {
        if v, ok := m1[pattern[i]]; ok && v != words[i] { return false }
        if v, ok := m2[words[i]]; ok && v != pattern[i] { return false }
        m1[pattern[i]] = words[i]; m2[words[i]] = pattern[i]
    }
    return true
}`,
    keyPoints: ["双向映射", "pattern↔word", "长度先判"],
    followUps: ["同构字符串的扩展？", "Unicode 怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-242",
    nodeId: "p2-highfreq",
    question: "242. 有效的字母异位词（LeetCode 242）\n判断两个字符串是否字母异位词。",
    answer: `// 思路：字符计数比较
// 时间 O(n)，空间 O(26)
// 关键：计数数组相等

func isAnagram(s, t string) bool {
    if len(s) != len(t) { return false }
    cnt := [26]int{}
    for i := 0; i < len(s); i++ { cnt[s[i]-'a']++; cnt[t[i]-'a']-- }
    for _, c := range cnt { if c != 0 { return false } }
    return true
}`,
    keyPoints: ["字符计数", "s 加 t 减", "全零则异位"],
    followUps: ["Unicode 怎么处理？", "排序法？"],
    favorited: false,
  },

  // ===== Phase 3：字节/腾讯高频（19题，跳过重题）=====
  {
    id: "algo-1109",
    nodeId: "p3-bytedance-tencent",
    question: "1109. 航班预订统计（LeetCode 1109）\n返回每趟航班上预订的座位数。",
    answer: `// 思路：差分数组
// 时间 O(n+bookings)，空间 O(n)
// 关键：区间加用差分数组

func corpFlightBookings(bookings [][]int, n int) []int {
    diff := make([]int, n+2)
    for _, b := range bookings {
        diff[b[0]] += b[2]; diff[b[1]+1] -= b[2]
    }
    res := make([]int, n)
    for i := 1; i <= n; i++ { res[i-1] = res[i-1] + diff[i]; if i > 1 { res[i-1] += res[i-2] } }
    // 简化：前缀和还原
    cur := 0
    for i := 1; i <= n; i++ { cur += diff[i]; res[i-1] = cur }
    return res
}`,
    keyPoints: ["差分数组", "区间加减 O(1)", "前缀和还原"],
    followUps: ["多次区间操作怎么优化？", "二维差分？"],
    favorited: false,
  },
  {
    id: "algo-253",
    nodeId: "p3-bytedance-tencent",
    question: "253. 会议室 II（LeetCode 253）\n求需要的最少会议室数。",
    answer: `// 思路：排序 + 最小堆
// 时间 O(n·logn)，空间 O(n)
// 关键：堆顶是最早结束的，能复用就复用

func minMeetingRooms(intervals [][]int) int {
    if len(intervals) == 0 { return 0 }
    sort.Slice(intervals, func(i, j int) bool { return intervals[i][0] < intervals[j][0] })
    var h MinHeap
    heap.Push(&h, intervals[0][1])
    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= h.Top().(int) { heap.Pop(&h) }
        heap.Push(&h, intervals[i][1])
    }
    return h.Len()
}`,
    keyPoints: ["最小堆管理结束时间", "能复用则弹出", "堆大小即房间数"],
    followUps: ["不用堆怎么解？", "返回每个房间安排哪些会议？"],
    favorited: false,
  },
  {
    id: "algo-57",
    nodeId: "p3-bytedance-tencent",
    question: "57. 插入区间（LeetCode 57）\n在无重叠有序区间列表中插入新区间并合并。",
    answer: `// 思路：分三段——不重叠的前段、重叠合并、不重叠的后段
// 时间 O(n)，空间 O(n)
// 关键：分三阶段处理

func insert(intervals [][]int, newInterval []int) [][]int {
    var res [][]int
    i := 0
    // 不重叠的前段
    for i < len(intervals) && intervals[i][1] < newInterval[0] { res = append(res, intervals[i]); i++ }
    // 重叠合并
    for i < len(intervals) && intervals[i][0] <= newInterval[1] {
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i++
    }
    res = append(res, newInterval)
    // 不重叠的后段
    for i < len(intervals) { res = append(res, intervals[i]); i++ }
    return res
}`,
    keyPoints: ["三阶段处理", "重叠时合并边界", "保持有序"],
    followUps: ["多个区间插入怎么解？", "区间删除？"],
    favorited: false,
  },
  {
    id: "algo-31",
    nodeId: "p3-bytedance-tencent",
    question: "31. 下一个排列（LeetCode 31）\n将数组重排为下一个更大的排列，已是最大则升序。",
    answer: `// 思路：从右找第一个下降，交换，反转后段
// 时间 O(n)，空间 O(1)
// 关键：找 i 使 nums[i]<nums[i+1]，找 j 交换，反转 i+1 后

func nextPermutation(nums []int) {
    n := len(nums)
    i := n - 2
    for i >= 0 && nums[i] >= nums[i+1] { i-- }
    if i >= 0 {
        j := n - 1
        for nums[j] <= nums[i] { j-- }
        nums[i], nums[j] = nums[j], nums[i]
    }
    reverse(nums, i+1, n-1)
}`,
    keyPoints: ["从右找下降点", "找刚好大于的交换", "反转后段"],
    followUps: ["上一个排列怎么求？", "全排列第 K 个？"],
    favorited: false,
  },
  {
    id: "algo-10",
    nodeId: "p3-bytedance-tencent",
    question: "10. 正则表达式匹配（LeetCode 10）\n实现 . 和 * 的正则匹配。",
    answer: `// 思路：二维 DP
// 时间 O(m·n)，空间 O(m·n)
// 关键：* 匹配 0 次或多次

func isMatch(s, p string) bool {
    m, n := len(s), len(p)
    dp := make([][]bool, m+1)
    for i := range dp { dp[i] = make([]bool, n+1) }
    dp[0][0] = true
    for j := 2; j <= n; j += 2 { if p[j-1] == '*' { dp[0][j] = dp[0][j-2] } }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if p[j-1] == '*' {
                dp[i][j] = dp[i][j-2] || (dp[i-1][j] && (p[j-2] == '.' || p[j-2] == s[i-1]))
            } else {
                dp[i][j] = dp[i-1][j-1] && (p[j-1] == '.' || p[j-1] == s[i-1])
            }
        }
    }
    return dp[m][n]
}`,
    keyPoints: ["二维 DP", "* 匹配 0 次或多次", "初始化空串匹配 a* 模式"],
    followUps: ["通配符匹配怎么解？", "递归怎么写？"],
    favorited: false,
  },
  {
    id: "algo-44",
    nodeId: "p3-bytedance-tencent",
    question: "44. 通配符匹配（LeetCode 44）\n实现 ? 和 * 的通配符匹配。",
    answer: `// 思路：二维 DP 或贪心
// 时间 O(m·n)，空间 O(m·n) 可优化
// 关键：* 匹配任意序列（含空）

func isWildcardMatch(s, p string) bool {
    m, n := len(s), len(p)
    dp := make([][]bool, m+1)
    for i := range dp { dp[i] = make([]bool, n+1) }
    dp[0][0] = true
    for j := 1; j <= n; j++ { if p[j-1] == '*' { dp[0][j] = dp[0][j-1] } }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if p[j-1] == '*' { dp[i][j] = dp[i-1][j] || dp[i][j-1] }
            else if p[j-1] == '?' || p[j-1] == s[i-1] { dp[i][j] = dp[i-1][j-1] }
        }
    }
    return dp[m][n]
}`,
    keyPoints: ["二维 DP", "* 匹配任意序列", "也可贪心双指针 O(1) 空间"],
    followUps: ["贪心怎么解？", "正则和通配符的区别？"],
    favorited: false,
  },
  {
    id: "algo-460",
    nodeId: "p3-bytedance-tencent",
    question: "460. LFU 缓存（LeetCode 460）\n设计 O(1) 的 LFU 缓存。",
    answer: `// 思路：频率→双向链表集合 + key→节点哈希
// 时间 O(1) 每操作，空间 O(capacity)
// 关键：minFreq 维护，同频率按 LRU 排序

type LFUCache struct {
    cap, minFreq, size int
    keyToNode map[int]*LFUNode
    freqToList map[int]*DLinkedList
}
// get: 更新频率，从旧链表移到新链表
// put: 满了则删 minFreq 链表尾部，新节点加 freq=1 链表头部
// minFreq: get 时+1，put 新节点时设为 1，淘汰时需更新`,
    keyPoints: ["频率→双向链表", "key→节点哈希", "同频率内 LRU"],
    followUps: ["LRU 和 LFU 的区别？", "如何 O(1) 维护 minFreq？"],
    favorited: false,
  },
  {
    id: "algo-466",
    nodeId: "p3-bytedance-tencent",
    question: "466. 统计重复个数（LeetCode 466）\n求 S 在 [s1, n1] 次重复后的串中作为 [s2, n2] 出现的最大次数。",
    answer: `// 思路：找循环节
// 时间 O(s1·s2)，空间 O(s2)
// 关键：统计 s1 中每个 s2 字符的匹配位置，找循环节

func getMaxRepetitions(s1 string, n1 int, s2 string, n2 int) int {
    // 统计每轮 s1 匹配 s2 的次数和 s2 的位置
    // 找到循环节后用数学计算
    // 简化思路：模拟 + 循环节优化
    idx2, count := 0, 0
    for i := 0; i < n1; i++ {
        for j := 0; j < len(s1); j++ {
            if s1[j] == s2[idx2] { idx2++; if idx2 == len(s2) { idx2 = 0; count++ } }
        }
    }
    return count / n2
}`,
    keyPoints: ["模拟匹配", "找循环节优化", "统计匹配次数"],
    followUps: ["n1 很大怎么优化？", "循环节怎么找？"],
    favorited: false,
  },
  {
    id: "algo-316",
    nodeId: "p3-bytedance-tencent",
    question: "316. 去除重复字母（LeetCode 316）\n使字符串只含每个字母一次且字典序最小。",
    answer: `// 思路：单调栈 + 计数
// 时间 O(n)，空间 O(26)
// 关键：栈顶比当前大且后面还有则弹出

func removeDuplicateLetters(s string) string {
    lastOccur := [26]int{}
    for i := 0; i < len(s); i++ { lastOccur[s[i]-'a'] = i }
    var stack []byte
    inStack := [26]bool{}
    for i := 0; i < len(s); i++ {
        if inStack[s[i]-'a'] { continue }
        for len(stack) > 0 && stack[len(stack)-1] > s[i] && lastOccur[stack[len(stack)-1]-'a'] > i {
            inStack[stack[len(stack)-1]-'a'] = false
            stack = stack[:len(stack)-1]
        }
        stack = append(stack, s[i])
        inStack[s[i]-'a'] = true
    }
    return string(stack)
}`,
    keyPoints: ["单调栈", "记录最后出现位置", "栈内标记去重"],
    followUps: ["去掉重复使字典序最小？", "允许保留 K 个重复？"],
    favorited: false,
  },
  {
    id: "algo-402",
    nodeId: "p3-bytedance-tencent",
    question: "402. 移掉 K 位数字（LeetCode 402）\n移除 K 个数字使剩余数最小。",
    answer: `// 思路：单调栈，栈顶比当前大就弹出
// 时间 O(n)，空间 O(n)
// 关键：贪心 + 单调递增栈

func removeKdigits(num string, k int) string {
    var stack []byte
    for i := 0; i < len(num); i++ {
        for k > 0 && len(stack) > 0 && stack[len(stack)-1] > num[i] { stack = stack[:len(stack)-1]; k-- }
        stack = append(stack, num[i])
    }
    stack = stack[:len(stack)-k] // 还剩 k 个没删
    // 去前导零
    res := strings.TrimLeft(string(stack), "0")
    if res == "" { return "0" }
    return res
}`,
    keyPoints: ["单调递增栈", "贪心删除较大前缀", "去前导零"],
    followUps: ["保留 K 位最大怎么解？", "允许重新排列？"],
    favorited: false,
  },
  {
    id: "algo-321",
    nodeId: "p3-bytedance-tencent",
    question: "321. 拼接最大数（LeetCode 321）\n从两个数组中取 k 个数保持相对顺序，拼成最大数。",
    answer: `// 思路：枚举 i 个从 nums1，k-i 个从 nums2，分别取最大子序列再合并
// 时间 O(k·(m+n))，空间 O(k)
// 关键：单调栈取最大子序列 + 合并两个最大序列

func maxNumber(nums1, nums2 []int, k int) []int {
    var res []int
    for i := 0; i <= k && i <= len(nums1); i++ {
        if k-i > len(nums2) { continue }
        sub1 := maxSubsequence(nums1, i)
        sub2 := maxSubsequence(nums2, k-i)
        merged := merge(sub1, sub2)
        if greater(merged, res) { res = merged }
    }
    return res
}
// maxSubsequence: 单调栈取长度为 k 的最大子序列
// merge: 贪心合并，每次取较大的前缀`,
    keyPoints: ["枚举分配数量", "单调栈取最大子序列", "贪心合并"],
    followUps: ["最大子序列怎么取？", "合并时相同前缀怎么处理？"],
    favorited: false,
  },
  {
    id: "algo-8",
    nodeId: "p3-bytedance-tencent",
    question: "8. 字符串转整数 atoi（LeetCode 8）\n实现 myAtoi，处理空格/符号/溢出。",
    answer: `// 思路：状态机或逐字符处理
// 时间 O(n)，空间 O(1)
// 关键：跳空格-判符号-累数字-判溢出

func myAtoi(s string) int {
    i, n := 0, len(s)
    for i < n && s[i] == ' ' { i++ }
    sign := 1
    if i < n && (s[i] == '+' || s[i] == '-') { if s[i] == '-' { sign = -1 }; i++ }
    res := 0
    for i < n && s[i] >= '0' && s[i] <= '9' {
        digit := int(s[i] - '0')
        if res > (1<<31-1)/10 || (res == (1<<31-1)/10 && digit > 7) {
            if sign == 1 { return 1<<31 - 1 }
            return -1 << 31
        }
        res = res*10 + digit
        i++
    }
    return res * sign
}`,
    keyPoints: ["跳空格-判符号-累数字", "溢出截断", "状态机思想"],
    followUps: ["用状态机怎么实现？", "处理十六进制？"],
    favorited: false,
  },
  {
    id: "algo-43",
    nodeId: "p3-bytedance-tencent",
    question: "43. 字符串相乘（LeetCode 43）\n给定两个非负整数字符串，返回乘积字符串。",
    answer: `// 思路：模拟竖式乘法
// 时间 O(m·n)，空间 O(m+n)
// 关键：num1[i]*num2[j] 结果放在 res[i+j] 和 res[i+j+1]

func multiply(num1, num2 string) string {
    m, n := len(num1), len(num2)
    res := make([]int, m+n)
    for i := m - 1; i >= 0; i-- {
        for j := n - 1; j >= 0; j-- {
            mul := int(num1[i]-'0') * int(num2[j]-'0')
            p1, p2 := i+j, i+j+1
            sum := mul + res[p2]
            res[p2] = sum % 10
            res[p1] += sum / 10
        }
    }
    var sb strings.Builder
    for _, d := range res { if !(sb.Len() == 0 && d == 0) { sb.WriteByte(byte('0' + d)) } }
    if sb.Len() == 0 { return "0" }
    return sb.String()
}`,
    keyPoints: ["竖式乘法", "结果放 i+j 和 i+j+1", "去前导零"],
    followUps: ["大数加法怎么解？", "大数除法？"],
    favorited: false,
  },
  {
    id: "algo-297",
    nodeId: "p3-bytedance-tencent",
    question: "297. 二叉树序列化与反序列化（LeetCode 297）\n设计序列化和反序列化二叉树的算法。",
    answer: `// 思路：前序遍历 + null 标记
// 时间 O(n)，空间 O(n)
// 关键：用特殊字符标记 null

func serialize(root *TreeNode) string {
    if root == nil { return "#," }
    return strconv.Itoa(root.Val) + "," + serialize(root.Left) + serialize(root.Right)
}
func deserialize(data string) *TreeNode {
    vals := strings.Split(data, ",")
    var build func() *TreeNode
    build = func() *TreeNode {
        if vals[0] == "#" { vals = vals[1:]; return nil }
        val, _ := strconv.Atoi(vals[0]); vals = vals[1:]
        return &TreeNode{Val: val, Left: build(), Right: build()}
    }
    return build()
}`,
    keyPoints: ["前序遍历", "null 用 # 标记", "递归重建"],
    followUps: ["层序序列化怎么解？", "如何压缩？"],
    favorited: false,
  },
  {
    id: "algo-301",
    nodeId: "p3-bytedance-tencent",
    question: "301. 删除无效括号（LeetCode 301）\n删除最少括号使字符串有效，返回所有可能结果。",
    answer: `// 思路：BFS 逐层删除检查
// 时间 O(2^n)，空间 O(n)
// 关键：BFS 保证最少删除

func removeInvalidParentheses(s string) []string {
    visited := map[string]bool{}
    var res []string
    queue := []string{s}
    found := false
    for len(queue) > 0 && !found {
        size := len(queue)
        for i := 0; i < size; i++ {
            cur := queue[0]; queue = queue[1:]
            if visited[cur] { continue }
            visited[cur] = true
            if isValidParentheses(cur) { res = append(res, cur); found = true }
            if found { continue }
            for j := 0; j < len(cur); j++ {
                if cur[j] != '(' && cur[j] != ')' { continue }
                queue = append(queue, cur[:j]+cur[j+1:])
            }
        }
    }
    return res
}`,
    keyPoints: ["BFS 逐层删除", "找到即停止", "去重"],
    followUps: ["DFS 怎么解？", "如何优化？"],
    favorited: false,
  },
  {
    id: "algo-37",
    nodeId: "p3-bytedance-tencent",
    question: "37. 解数独（LeetCode 37）\n解 9×9 数独，保证有唯一解。",
    answer: `// 思路：回溯 + 约束剪枝
// 时间 O(9^空格数)，空间 O(9²)
// 关键：行/列/宫格三个集合去重

func solveSudoku(board [][]byte) {
    rows, cols, boxes := [9][9]bool{}, [9][9]bool{}, [9][9]bool{}
    for i := 0; i < 9; i++ {
        for j := 0; j < 9; j++ {
            if board[i][j] != '.' {
                idx := board[i][j] - '1'
                rows[i][idx] = true; cols[j][idx] = true; boxes[i/3*3+j/3][idx] = true
            }
        }
    }
    var backtrack func(i, j int) bool
    backtrack = func(i, j int) bool {
        if j == 9 { return backtrack(i+1, 0) }
        if i == 9 { return true }
        if board[i][j] != '.' { return backtrack(i, j+1) }
        for n := 0; n < 9; n++ {
            if !rows[i][n] && !cols[j][n] && !boxes[i/3*3+j/3][n] {
                board[i][j] = byte('1' + n)
                rows[i][n] = true; cols[j][n] = true; boxes[i/3*3+j/3][n] = true
                if backtrack(i, j+1) { return true }
                board[i][j] = '.'
                rows[i][n] = false; cols[j][n] = false; boxes[i/3*3+j/3][n] = false
            }
        }
        return false
    }
    backtrack(0, 0)
}`,
    keyPoints: ["回溯 + 剪枝", "行/列/宫格三个集合", "找到即停"],
    followUps: ["如何优化搜索顺序？", "N 皇后数独？"],
    favorited: false,
  },
  {
    id: "algo-51",
    nodeId: "p3-bytedance-tencent",
    question: "51. N 皇后（LeetCode 51）\n在 N×N 棋盘放 N 个皇后互不攻击，返回所有解。",
    answer: `// 思路：回溯，按行放置，列/对角线去重
// 时间 O(N!)，空间 O(N)
// 关键：三个集合去重——列、主对角线、副对角线

func solveNQueens(n int) [][]string {
    var res [][]string
    cols, diag1, diag2 := map[int]bool{}, map[int]bool{}, map[int]bool{}
    board := make([][]byte, n)
    for i := range board { board[i] = bytes.Repeat([]byte{'.'}, n) }
    var backtrack func(row int)
    backtrack = func(row int) {
        if row == n { tmp := make([]string, n); for i := range board { tmp[i] = string(board[i]) }; res = append(res, tmp); return }
        for col := 0; col < n; col++ {
            if cols[col] || diag1[row-col] || diag2[row+col] { continue }
            board[row][col] = 'Q'; cols[col] = true; diag1[row-col] = true; diag2[row+col] = true
            backtrack(row + 1)
            board[row][col] = '.'; cols[col] = false; diag1[row-col] = false; diag2[row+col] = false
        }
    }
    backtrack(0)
    return res
}`,
    keyPoints: ["回溯按行放", "列+主副对角线三个集合", "主对角 row-col 副对角 row+col"],
    followUps: ["N 皇后 II 只求数量怎么解？", "数独和 N 皇后的区别？"],
    favorited: false,
  },
  {
    id: "algo-52",
    nodeId: "p3-bytedance-tencent",
    question: "52. N 皇后 II（LeetCode 52）\n返回 N 皇后的解的数量。",
    answer: `// 思路：同 51，只计数不存解
// 时间 O(N!)，空间 O(N)
// 关键：位运算优化

func totalNQueens(n int) int {
    count := 0
    var solve func(row, cols, diag1, diag2 int)
    solve = func(row, cols, diag1, diag2 int) {
        if row == n { count++; return }
        bits := ((1<<n)-1) & ^(cols|diag1|diag2)
        for bits > 0 {
            p := bits & (-bits) // 取最低位 1
            solve(row+1, cols|p, (diag1|p)<<1, (diag2|p)>>1)
            bits &= bits - 1 // 清除最低位 1
        }
    }
    solve(0, 0, 0, 0)
    return count
}`,
    keyPoints: ["位运算优化", "cols|diag1|diag2 合并可用位", "取最低位 1 放皇后"],
    followUps: ["不用位运算怎么解？", "N 很大怎么办？"],
    favorited: false,
  },
  {
    id: "algo-124",
    nodeId: "p3-bytedance-tencent",
    question: "124. 二叉树最大路径和（LeetCode 124）\n找二叉树中任意路径的最大和。",
    answer: `// 思路：后序遍历，维护全局最大和单侧最大
// 时间 O(n)，空间 O(h)
// 关键：路径可以经过任意节点，单侧贡献 = max(0, 子树和)

var maxPathSum int
func maxPathSumFn(root *TreeNode) int {
    maxPathSum = -1 << 31
    gain(root)
    return maxPathSum
}
func gain(root *TreeNode) int {
    if root == nil { return 0 }
    l := max(0, gain(root.Left))
    r := max(0, gain(root.Right))
    maxPathSum = max(maxPathSum, root.Val+l+r) // 经过当前节点的路径
    return root.Val + max(l, r) // 单侧最大贡献
}`,
    keyPoints: ["后序遍历", "单侧贡献 max(0, 子树和)", "全局更新最大路径和"],
    followUps: ["输出最大路径怎么解？", "如果路径必须经过根？"],
    favorited: false,
  },

  // ===== Phase 3：阿里/美团高频（12题，跳过重题）=====
  {
    id: "algo-23",
    nodeId: "p3-ali-meituan",
    question: "23. 合并 K 个排序链表（LeetCode 23）\n合并 K 个升序链表。",
    answer: `// 思路：最小堆或分治归并
// 时间 O(N·logK)，空间 O(K)
// 关键：堆存每个链表头，每次弹最小

func mergeKLists(lists []*ListNode) *ListNode {
    var h MinHeap
    for _, l := range lists { if l != nil { heap.Push(&h, l) } }
    dummy := &ListNode{}
    cur := dummy
    for h.Len() > 0 {
        node := heap.Pop(&h).(*ListNode)
        cur.Next = node; cur = cur.Next
        if node.Next != nil { heap.Push(&h, node.Next) }
    }
    return dummy.Next
}`,
    keyPoints: ["最小堆", "堆存链表头节点", "也可分治两两合并"],
    followUps: ["分治法时间复杂度？", "不用堆怎么解？"],
    favorited: false,
  },
  {
    id: "algo-264",
    nodeId: "p3-ali-meituan",
    question: "264. 丑数 II（LeetCode 264）\n返回第 n 个丑数（只含 2/3/5 因子的数）。",
    answer: `// 思路：三指针 + 动态规划
// 时间 O(n)，空间 O(n)
// 关键：每个丑数由之前某丑数×2/×3/×5 得到

func nthUglyNumber(n int) int {
    dp := make([]int, n)
    dp[0] = 1
    p2, p3, p5 := 0, 0, 0
    for i := 1; i < n; i++ {
        dp[i] = min(dp[p2]*2, dp[p3]*3, dp[p5]*5)
        if dp[i] == dp[p2]*2 { p2++ }
        if dp[i] == dp[p3]*3 { p3++ }
        if dp[i] == dp[p5]*5 { p5++ }
    }
    return dp[n-1]
}`,
    keyPoints: ["三指针 DP", "每个丑数由更小丑数×2/3/5", "去重用 if 不用 else"],
    followUps: ["超级丑数怎么解？", "判断一个数是否丑数？"],
    favorited: false,
  },
  {
    id: "algo-313",
    nodeId: "p3-ali-meituan",
    question: "313. 超级丑数（LeetCode 313）\n给定质数列表，返回第 n 个超级丑数。",
    answer: `// 思路：多指针 DP，同丑数 II 推广
// 时间 O(n·k)，空间 O(n+k)
// 关键：每个质数一个指针

func nthSuperUglyNumber(n int, primes []int) int {
    dp := make([]int, n)
    dp[0] = 1
    pointers := make([]int, len(primes))
    for i := 1; i < n; i++ {
        dp[i] = 1 << 31 - 1
        for j := range primes { dp[i] = min(dp[i], dp[points[j]]*primes[j]) }
        for j := range primes { if dp[i] == dp[points[j]]*primes[j] { points[j]++ } }
    }
    return dp[n-1]
}`,
    keyPoints: ["多指针 DP", "每个质数一个指针", "推广丑数 II"],
    followUps: ["用堆优化？", "时间复杂度？"],
    favorited: false,
  },
  {
    id: "algo-279",
    nodeId: "p3-ali-meituan",
    question: "279. 完全平方数（LeetCode 279）\n找和为 n 的最少完全平方数个数。",
    answer: `// 思路：DP 或 BFS
// 时间 O(n·sqrt(n))，空间 O(n)
// 关键：dp[i] = min(dp[i-j*j]+1)

func numSquares(n int) int {
    dp := make([]int, n+1)
    for i := 1; i <= n; i++ {
        dp[i] = i
        for j := 1; j*j <= i; j++ { dp[i] = min(dp[i], dp[i-j*j]+1) }
    }
    return dp[n]
}`,
    keyPoints: ["DP dp[i]=min(dp[i-j*j]+1)", "也可 BFS", "数学四平方定理"],
    followUps: ["BFS 怎么解？", "四平方定理？"],
    favorited: false,
  },
  {
    id: "algo-127",
    nodeId: "p3-ali-meituan",
    question: "127. 单词接龙（LeetCode 127）\n从 beginWord 到 endWord 最短转换序列长度，每次改一个字母。",
    answer: `// 思路：BFS，逐层变换
// 时间 O(n·L²)，空间 O(n·L)
// 关键：BFS 求最短路径

func ladderLength(beginWord, endWord string, wordList []string) int {
    wordSet := map[string]bool{}
    for _, w := range wordList { wordSet[w] = true }
    if !wordSet[endWord] { return 0 }
    queue := []string{beginWord}
    level := 1
    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            word := queue[0]; queue = queue[1:]
            if word == endWord { return level }
            for j := 0; j < len(word); j++ {
                for c := 'a'; c <= 'z'; c++ {
                    newWord := word[:j] + string(c) + word[j+1:]
                    if wordSet[newWord] { delete(wordSet, newWord); queue = append(queue, newWord) }
                }
            }
        }
        level++
    }
    return 0
}`,
    keyPoints: ["BFS 最短路径", "逐字符变换", "访问过即删除"],
    followUps: ["双向 BFS 怎么优化？", "单词接龙 II 返回所有路径？"],
    favorited: false,
  },
  {
    id: "algo-126",
    nodeId: "p3-ali-meituan",
    question: "126. 单词接龙 II（LeetCode 126）\n返回所有最短转换序列。",
    answer: `// 思路：BFS + DFS 回溯
// 时间 O(n·L²)，空间 O(n·L)
// 关键：BFS 建图找最短层，DFS 回溯所有路径

func findLadders(beginWord, endWord string, wordList []string) [][]string {
    // 1. BFS 建立每个词的下一层邻居
    // 2. DFS 从 beginWord 回溯到 endWord 的所有最短路径
    // BFS 记录 children map，DFS 收集路径
    wordSet := map[string]bool{}
    for _, w := range wordList { wordSet[w] = true }
    if !wordSet[endWord] { return nil }
    // BFS 建图...
    // DFS 回溯...
    return nil // 简化：核心是 BFS+DFS 两步走
}`,
    keyPoints: ["BFS 建图", "DFS 回溯所有路径", "避免重复访问"],
    followUps: ["如何避免超时？", "双向 BFS 优化？"],
    favorited: false,
  },
  {
    id: "algo-773",
    nodeId: "p3-ali-meituan",
    question: "773. 滑动谜题（LeetCode 773）\n解 2×3 滑动拼图，返回最少移动步数。",
    answer: `// 思路：BFS，状态用字符串编码
// 时间 O(6!)，空间 O(6!)
// 关键：BFS 求最短路径，状态编码去重

func slidingPuzzle(board [][]int) int {
    target := "123450"
    var sb strings.Builder
    for i := 0; i < 2; i++ { for j := 0; j < 3; j++ { sb.WriteByte(byte('0' + board[i][j])) } }
    start := sb.String()
    moves := [][]int{{1,3},{0,2,4},{1,5},{0,4},{1,3,5},{2,4}}
    queue := []string{start}
    visited := map[string]bool{start: true}
    step := 0
    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            cur := queue[0]; queue = queue[1:]
            if cur == target { return step }
            zero := strings.IndexByte(cur, '0')
            for _, next := range moves[zero] {
                b := []byte(cur)
                b[zero], b[next] = b[next], b[zero]
                s := string(b)
                if !visited[s] { visited[s] = true; queue = append(queue, s) }
            }
        }
        step++
    }
    return -1
}`,
    keyPoints: ["BFS 最短路径", "状态编码为字符串", "预计算可移动位置"],
    followUps: ["A* 怎么优化？", "3×3 滑动谜题？"],
    favorited: false,
  },
  {
    id: "algo-212",
    nodeId: "p3-ali-meituan",
    question: "212. 单词搜索 II（LeetCode 212）\n在二维字母板中找所有字典中存在的单词。",
    answer: `// 思路：Trie + DFS 回溯
// 时间 O(m·n·4^L)，空间 O(字典大小)
// 关键：Trie 存字典，DFS 搜索时沿 Trie 走

func findWords(board [][]byte, words []string) []string {
    trie := &Trie{}
    for _, w := range words { trie.Insert(w) }
    m, n := len(board), len(board[0])
    var res []string
    var dfs func(i, j int, node *Trie)
    dfs = func(i, j int, node *Trie) {
        if i < 0 || i >= m || j < 0 || j >= n || board[i][j] == '#' { return }
        idx := board[i][j] - 'a'
        if node.children[idx] == nil { return }
        node = node.children[idx]
        if node.isEnd { res = append(res, node.word); node.isEnd = false } // 去重
        tmp := board[i][j]; board[i][j] = '#'
        dfs(i+1, j, node); dfs(i-1, j, node); dfs(i, j+1, node); dfs(i, j-1, node)
        board[i][j] = tmp
    }
    for i := 0; i < m; i++ { for j := 0; j < n; j++ { dfs(i, j, trie) } }
    return res
}`,
    keyPoints: ["Trie + DFS", "沿 Trie 走避免无效搜索", "找到后标记避免重复"],
    followUps: ["不用 Trie 怎么解？", "如何优化剪枝？"],
    favorited: false,
  },
  {
    id: "algo-289",
    nodeId: "p3-ali-meituan",
    question: "289. 生命游戏（LeetCode 289）\n原地更新生命游戏下一代状态。",
    answer: `// 思路：用二进制位记录新旧状态
// 时间 O(m·n)，空间 O(1)
// 关键：低位=旧状态，高位=新状态

func gameOfLife(board [][]int) {
    m, n := len(board), len(board[0])
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            live := 0
            for x := -1; x <= 1; x++ { for y := -1; y <= 1; y++ {
                if x == 0 && y == 0 { continue }
                ni, nj := i+x, j+y
                if ni >= 0 && ni < m && nj >= 0 && nj < n && board[ni][nj]&1 == 1 { live++ }
            }}
            if board[i][j] == 1 && (live == 2 || live == 3) { board[i][j] |= 2 }
            if board[i][j] == 0 && live == 3 { board[i][j] |= 2 }
        }
    }
    for i := 0; i < m; i++ { for j := 0; j < n; j++ { board[i][j] >>= 1 } }
}`,
    keyPoints: ["二进制位存新旧状态", "低位旧高位新", "最后右移取新状态"],
    followUps: ["无限棋盘怎么解？", "多代更新？"],
    favorited: false,
  },
  {
    id: "algo-309",
    nodeId: "p3-ali-meituan",
    question: "309. 买卖股票含冷冻期（LeetCode 309）\n卖后有一天冷冻期，求最大利润。",
    answer: `// 思路：状态机 DP，三状态
// 时间 O(n)，空间 O(1)
// 关键：持有/不持有（冷冻）/不持有（可买）

func maxProfitWithCooldown(prices []int) int {
    hold, sold, rest := -prices[0], 0, 0
    for i := 1; i < len(prices); i++ {
        prevHold, prevSold := hold, sold
        hold = max(prevHold, rest-prices[i])
        sold = prevHold + prices[i]
        rest = max(rest, prevSold)
    }
    return max(sold, rest)
}`,
    keyPoints: ["状态机 DP", "三状态：持有/冷冻/可买", "转移方程"],
    followUps: ["含手续费怎么解？", "最多 K 次怎么解？"],
    favorited: false,
  },
  {
    id: "algo-714",
    nodeId: "p3-ali-meituan",
    question: "714. 买卖股票含手续费（LeetCode 714）\n每次卖出有手续费，求最大利润。",
    answer: `// 思路：状态机 DP，两状态
// 时间 O(n)，空间 O(1)
// 关键：卖出时扣手续费

func maxProfitWithFee(prices []int, fee int) int {
    hold, cash := -prices[0], 0
    for i := 1; i < len(prices); i++ {
        hold = max(hold, cash-prices[i])
        cash = max(cash, hold+prices[i]-fee)
    }
    return cash
}`,
    keyPoints: ["状态机 DP", "卖出扣 fee", "两状态：持有/不持有"],
    followUps: ["含冷冻期怎么解？", "最多 K 次怎么解？"],
    favorited: false,
  },
  {
    id: "algo-310",
    nodeId: "p3-ali-meituan",
    question: "310. 最小高度树（LeetCode 310）\n找以哪些节点为根时树的高度最小。",
    answer: `// 思路：拓扑排序，逐层剥叶子
// 时间 O(n)，空间 O(n)
// 关键：从叶子（度=1）开始剥，最后 1-2 个即答案

func findMinHeightTrees(n int, edges [][]int) []int {
    if n == 1 { return []int{0} }
    graph := make([]map[int]bool, n)
    for i := range graph { graph[i] = map[int]bool{} }
    for _, e := range edges { graph[e[0]][e[1]] = true; graph[e[1]][e[0]] = true }
    var leaves []int
    for i := 0; i < n; i++ { if len(graph[i]) == 1 { leaves = append(leaves, i) } }
    for n > 2 {
        n -= len(leaves)
        var newLeaves []int
        for _, leaf := range leaves {
            for neighbor := range graph[leaf] {
                delete(graph[neighbor], leaf)
                if len(graph[neighbor]) == 1 { newLeaves = append(newLeaves, neighbor) }
            }
        }
        leaves = newLeaves
    }
    return leaves
}`,
    keyPoints: ["拓扑排序剥叶子", "最后剩 1-2 个节点", "类似 BFS 从外向内"],
    followUps: ["为什么最多 2 个？", "DFS 怎么解？"],
    favorited: false,
  },
];

// ============================================================
// 学习计划：14 个专题，每个先 learn 后 review，每天 2 项，共 14 天
// ============================================================

function buildSchedule(): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  // 拓扑顺序：Phase1 → Phase2 → Phase3
  const order: [string, "learn" | "review", number][] = [
    // Phase 1
    ["p1-array-string", "learn", 40],
    ["p1-array-string", "review", 20],
    ["p1-hash", "learn", 25],
    ["p1-hash", "review", 15],
    ["p1-linkedlist", "learn", 35],
    ["p1-linkedlist", "review", 20],
    ["p1-stack-queue", "learn", 30],
    ["p1-stack-queue", "review", 15],
    ["p1-tree", "learn", 40],
    ["p1-tree", "review", 20],
    ["p1-backtrack", "learn", 35],
    ["p1-backtrack", "review", 20],
    ["p1-sort-binary", "learn", 30],
    ["p1-sort-binary", "review", 15],
    // Phase 2
    ["p2-dp", "learn", 50],
    ["p2-dp", "review", 30],
    ["p2-graph", "learn", 40],
    ["p2-graph", "review", 20],
    ["p2-heap", "learn", 25],
    ["p2-heap", "review", 15],
    ["p2-greedy", "learn", 30],
    ["p2-greedy", "review", 15],
    ["p2-highfreq", "learn", 45],
    ["p2-highfreq", "review", 25],
    // Phase 3
    ["p3-bytedance-tencent", "learn", 50],
    ["p3-bytedance-tencent", "review", 30],
    ["p3-ali-meituan", "learn", 40],
    ["p3-ali-meituan", "review", 20],
  ];

  order.forEach(([nodeId, type, minutes], idx) => {
    schedule.push({
      day: Math.floor(idx / 2) + 1, // 每 2 项一天，共 14 天
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