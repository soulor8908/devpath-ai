// lib/algorithm-preset.ts
// 内置算法题预设：精选 15 道高频面试题（参考主项目 Phase 1 Hot 100 核心）
// 每题含分析、参考答案（代码）、关键点、学习计划
// 覆盖：数组/哈希/双指针/链表/树/DP/回溯/二分

import type { KnowledgeNode, Question, ScheduleItem } from "./types";

const ALGORITHM_NODES: KnowledgeNode[] = [
  {
    id: "arr-hash",
    title: "数组与哈希表",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    summary: "哈希表实现 O(1) 查找，数组下标随机访问。两数之和是入门必会题。",
    mastery: 0,
  },
  {
    id: "two-pointers",
    title: "双指针技巧",
    difficulty: 2,
    prerequisites: ["arr-hash"],
    frequency: "高",
    summary: "快慢指针解决链表/数组问题，左右指针解决有序数组/字符串问题。",
    mastery: 0,
  },
  {
    id: "linked-list",
    title: "链表",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    summary: "虚拟头节点简化边界处理，快慢指针找中点/判环。",
    mastery: 0,
  },
  {
    id: "binary-tree",
    title: "二叉树与 BFS/DFS",
    difficulty: 3,
    prerequisites: [],
    frequency: "高",
    summary: "递归是核心，前中后序/层序遍历是基础。掌握递归框架可解 80% 树题。",
    mastery: 0,
  },
  {
    id: "binary-search",
    title: "二分查找",
    difficulty: 3,
    prerequisites: [],
    frequency: "中",
    summary: "有序数组查找 O(logN)。关键在边界处理：左闭右闭 vs 左闭右开。",
    mastery: 0,
  },
  {
    id: "backtracking",
    title: "回溯算法",
    difficulty: 4,
    prerequisites: ["binary-tree"],
    frequency: "高",
    summary: "全排列/组合/子集三大经典。掌握回溯模板 + 剪枝优化。",
    mastery: 0,
  },
  {
    id: "dp-intro",
    title: "动态规划入门",
    difficulty: 4,
    prerequisites: ["arr-hash"],
    frequency: "高",
    summary: "状态定义 + 状态转移方程。从斐波那契到背包问题，一维到二维。",
    mastery: 0,
  },
  {
    id: "dp-advanced",
    title: "动态规划进阶",
    difficulty: 5,
    prerequisites: ["dp-intro"],
    frequency: "高",
    summary: "子序列问题（LIS/LCS）、区间 DP、状态压缩。面试高频难点。",
    mastery: 0,
  },
];

const ALGORITHM_QUESTIONS: Question[] = [
  {
    id: "q1",
    nodeId: "arr-hash",
    question: "1. 两数之和（LeetCode 1）\n给定一个整数数组 nums 和目标值 target，返回和为 target 的两个元素的下标。",
    answer: `func twoSum(nums []int, target int) []int {
    m := map[int]int{}
    for i, num := range nums {
        if j, ok := m[target-num]; ok {
            return []int{j, i}
        }
        m[num] = i
    }
    return nil
}

// 时间 O(n)，空间 O(n)
// 关键：一次遍历，边存边查`,
    keyPoints: ["哈希表 O(1) 查找", "一次遍历边存边查", "返回下标不是值"],
    followUps: ["如果数组有序，能否用双指针 O(1) 空间？", "如果有多组答案怎么办？"],
    codeSnippet: "func twoSum(nums []int, target int) []int",
    favorited: false,
  },
  {
    id: "q2",
    nodeId: "arr-hash",
    question: "49. 字母异位词分组（LeetCode 49）\n给定字符串数组，将字母异位词组合在一起。",
    answer: `func groupAnagrams(strs []string) [][]string {
    m := map[string][]string{}
    for _, s := range strs {
        b := []byte(s)
        sort.Slice(b, func(i, j int) bool { return b[i] < b[j] })
        key := string(b)
        m[key] = append(m[key], s)
    }
    res := [][]string{}
    for _, v := range m {
        res = append(res, v)
    }
    return res
}

// 时间 O(n·k·logk)，空间 O(n·k)
// 关键：排序后的字符串作为 key`,
    keyPoints: ["排序字符串作为哈希 key", "也可以用字符计数数组作 key"],
    followUps: ["用字符计数（26 长度数组）代替排序能否更快？"],
    favorited: false,
  },
  {
    id: "q3",
    nodeId: "two-pointers",
    question: "15. 三数之和（LeetCode 15）\n返回数组中所有和为 0 的不重复三元组。",
    answer: `func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    var res [][]int
    for i := 0; i < len(nums)-2; i++ {
        if i > 0 && nums[i] == nums[i-1] { continue } // 去重
        l, r := i+1, len(nums)-1
        for l < r {
            sum := nums[i] + nums[l] + nums[r]
            if sum < 0 {
                l++
            } else if sum > 0 {
                r--
            } else {
                res = append(res, []int{nums[i], nums[l], nums[r]})
                for l < r && nums[l] == nums[l+1] { l++ }
                for l < r && nums[r] == nums[r-1] { r-- }
                l++; r--
            }
        }
    }
    return res
}

// 时间 O(n²)，空间 O(1)
// 关键：排序 + 固定一个数后用双指针 + 去重`,
    keyPoints: ["先排序", "固定一个数 + 双指针", "三层去重逻辑"],
    followUps: ["四数之和怎么解？", "不排序能否用哈希？有什么问题？"],
    favorited: false,
  },
  {
    id: "q4",
    nodeId: "two-pointers",
    question: "11. 盛最多水的容器（LeetCode 11）\n找出两条线与 x 轴构成的容器，使其能容纳最多水。",
    answer: `func maxArea(height []int) int {
    l, r := 0, len(height)-1
    maxW := 0
    for l < r {
        h := min(height[l], height[r])
        w := r - l
        maxW = max(maxW, h*w)
        if height[l] < height[r] {
            l++
        } else {
            r--
        }
    }
    return maxW
}

// 时间 O(n)，空间 O(1)
// 关键：双指针从两端向内收缩，每次移动较矮的一边`,
    keyPoints: ["双指针从两端向内", "贪心：移动较矮边", "面积 = min(h1,h2) × 宽度"],
    followUps: ["为什么移动较矮的一边是正确的？请证明。"],
    favorited: false,
  },
  {
    id: "q5",
    nodeId: "linked-list",
    question: "206. 反转链表（LeetCode 206）\n反转单链表。",
    answer: `func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    cur := head
    for cur != nil {
        next := cur.Next
        cur.Next = prev
        prev = cur
        cur = next
    }
    return prev
}

// 时间 O(n)，空间 O(1)
// 关键：三指针 prev/cur/next 逐个翻转`,
    keyPoints: ["迭代三指针", "也可以递归实现", "注意处理 head 为 nil"],
    followUps: ["反转链表 II（区间反转）怎么解？", "K 个一组反转呢？"],
    favorited: false,
  },
  {
    id: "q6",
    nodeId: "linked-list",
    question: "141. 环形链表（LeetCode 141）\n判断链表是否有环。",
    answer: `func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true
        }
    }
    return false
}

// 时间 O(n)，空间 O(1)
// 关键：快慢指针，有环必相遇`,
    keyPoints: ["Floyd 快慢指针", "快指针走两步慢指针走一步", "相遇即有环"],
    followUps: ["如何找到环的入口？", "环的长度怎么求？"],
    favorited: false,
  },
  {
    id: "q7",
    nodeId: "binary-tree",
    question: "102. 二叉树的层序遍历（LeetCode 102）\n返回二叉树按层遍历的节点值。",
    answer: `func levelOrder(root *TreeNode) [][]int {
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
}

// 时间 O(n)，空间 O(n)
// 关键：BFS + 队列 + 按层记录`,
    keyPoints: ["BFS 队列", "每层先记录长度再批量出队", "也可用 DFS + level 参数"],
    followUps: ["之字形层序遍历怎么解？", "右视图怎么解？"],
    favorited: false,
  },
  {
    id: "q8",
    nodeId: "binary-tree",
    question: "104. 二叉树最大深度（LeetCode 104）\n返回二叉树的最大深度。",
    answer: `func maxDepth(root *TreeNode) int {
    if root == nil { return 0 }
    return 1 + max(maxDepth(root.Left), maxDepth(root.Right))
}

// 时间 O(n)，空间 O(h)
// 关键：后序遍历，子树深度 + 1`,
    keyPoints: ["递归后序遍历", "也可以 BFS 层数计数", "最小深度是不同题（注意单子树情况）"],
    followUps: ["最小深度怎么求？有什么坑？", "迭代法怎么写？"],
    favorited: false,
  },
  {
    id: "q9",
    nodeId: "binary-search",
    question: "33. 搜索旋转排序数组（LeetCode 33）\n在旋转后的有序数组中查找目标值。",
    answer: `func search(nums []int, target int) int {
    l, r := 0, len(nums)-1
    for l <= r {
        mid := l + (r-l)/2
        if nums[mid] == target { return mid }
        // 左半有序
        if nums[l] <= nums[mid] {
            if nums[l] <= target && target < nums[mid] {
                r = mid - 1
            } else {
                l = mid + 1
            }
        } else { // 右半有序
            if nums[mid] < target && target <= nums[r] {
                l = mid + 1
            } else {
                r = mid - 1
            }
        }
    }
    return -1
}

// 时间 O(logn)，空间 O(1)
// 关键：判断哪半边有序，再判断 target 在不在有序区间`,
    keyPoints: ["二分查找", "判断左/右半哪边有序", "再判断 target 是否落在有序区间"],
    followUps: ["有重复元素怎么办？", "查找最小值怎么解？"],
    favorited: false,
  },
  {
    id: "q10",
    nodeId: "backtracking",
    question: "46. 全排列（LeetCode 46）\n返回不含重复数字数组的所有全排列。",
    answer: `func permute(nums []int) [][]int {
    var res [][]int
    var path []int
    used := make([]bool, len(nums))
    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) {
            tmp := make([]int, len(path))
            copy(tmp, path)
            res = append(res, tmp)
            return
        }
        for i := 0; i < len(nums); i++ {
            if used[i] { continue }
            used[i] = true
            path = append(path, nums[i])
            backtrack()
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    backtrack()
    return res
}

// 时间 O(n·n!)，空间 O(n)
// 关键：回溯模板 + used 数组去重`,
    keyPoints: ["回溯三要素：选择/路径/结束条件", "used 数组标记已选", "复制 path 再加入结果"],
    followUps: ["有重复数字的全排列怎么去重？", "组合总和怎么解？"],
    favorited: false,
  },
  {
    id: "q11",
    nodeId: "backtracking",
    question: "78. 子集（LeetCode 78）\n返回不含重复元素数组的所有子集。",
    answer: `func subsets(nums []int) [][]int {
    var res [][]int
    var path []int
    var backtrack func(start int)
    backtrack = func(start int) {
        tmp := make([]int, len(path))
        copy(tmp, path)
        res = append(res, tmp)
        for i := start; i < len(nums); i++ {
            path = append(path, nums[i])
            backtrack(i + 1)
            path = path[:len(path)-1]
        }
    }
    backtrack(0)
    return res
}

// 时间 O(n·2^n)，空间 O(n)
// 关键：每个节点都收集，start 控制不回头`,
    keyPoints: ["回溯 + start 参数避免回头", "每个递归节点都加入结果", "与全排列的区别"],
    followUps: ["有重复元素的子集怎么去重？", "组合问题怎么解？"],
    favorited: false,
  },
  {
    id: "q12",
    nodeId: "dp-intro",
    question: "70. 爬楼梯（LeetCode 70）\n每次爬 1 或 2 阶，爬到 n 阶有多少种方式？",
    answer: `func climbStairs(n int) int {
    if n <= 2 { return n }
    a, b := 1, 2
    for i := 3; i <= n; i++ {
        a, b = b, a+b
    }
    return b
}

// 时间 O(n)，空间 O(1)
// 关键：dp[i] = dp[i-1] + dp[i-2]，即斐波那契`,
    keyPoints: ["状态定义：dp[i] = 爬到第 i 阶的方式数", "转移方程 dp[i]=dp[i-1]+dp[i-2]", "滚动变量优化空间到 O(1)"],
    followUps: ["每次可以爬 1-3 阶呢？", "带代价的最小爬楼梯费用怎么解？"],
    favorited: false,
  },
  {
    id: "q13",
    nodeId: "dp-intro",
    question: "322. 零钱兑换（LeetCode 322）\n给定硬币面额和金额，求凑成该金额的最少硬币数。",
    answer: `func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp { dp[i] = amount + 1 }
    dp[0] = 0
    for i := 1; i <= amount; i++ {
        for _, c := range coins {
            if c <= i && dp[i-c]+1 < dp[i] {
                dp[i] = dp[i-c] + 1
            }
        }
    }
    if dp[amount] > amount { return -1 }
    return dp[amount]
}

// 时间 O(amount·n)，空间 O(amount)
// 关键：完全背包问题，dp[i]=min(dp[i-c]+1)`,
    keyPoints: ["完全背包 DP", "dp[i] 表示金额 i 的最少硬币数", "初始化 dp[0]=0 其余设为不可达"],
    followUps: ["求组合数（不是最少）怎么解？", "每种硬币只能用一次呢？"],
    favorited: false,
  },
  {
    id: "q14",
    nodeId: "dp-advanced",
    question: "300. 最长递增子序列（LeetCode 300）\n返回数组的最长严格递增子序列长度。",
    answer: `// 解法一：DP O(n²)
func lengthOfLIS(nums []int) int {
    n := len(nums)
    dp := make([]int, n)
    for i := range dp { dp[i] = 1 }
    maxLen := 1
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
            }
        }
        if dp[i] > maxLen { maxLen = dp[i] }
    }
    return maxLen
}

// 解法二：二分查找 O(n·logn)
// 维护一个 tails 数组，tails[i] 表示长度为 i+1 的 LIS 的最小尾元素
func lengthOfLIS2(nums []int) int {
    var tails []int
    for _, num := range nums {
        i := sort.SearchInts(tails, num)
        if i == len(tails) {
            tails = append(tails, num)
        } else {
            tails[i] = num
        }
    }
    return len(tails)
}

// 关键：DP O(n²) 或 贪心+二分 O(n·logn)`,
    keyPoints: ["DP：dp[i] = 以 nums[i] 结尾的 LIS 长度", "二分解法：维护 tails 数组", "tails 不是真正的 LIS，长度相等"],
    followUps: ["输出具体的一个 LIS 怎么做？", "最长公共子序列（LCS）怎么解？"],
    favorited: false,
  },
  {
    id: "q15",
    nodeId: "dp-advanced",
    question: "1143. 最长公共子序列（LeetCode 1143）\n返回两个字符串的最长公共子序列长度。",
    answer: `func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[m][n]
}

// 时间 O(m·n)，空间 O(m·n)，可优化为 O(min(m,n))
// 关键：二维 DP，字符相等取左上+1，否则取上/左最大`,
    keyPoints: ["二维 DP", "dp[i][j] 表示前 i 个和前 j 个字符的 LCS", "空间可滚动数组优化"],
    followUps: ["如何输出具体的 LCS 字符串？", "最长公共子串（连续）有什么不同？"],
    favorited: false,
  },
];

// 生成学习计划：8 知识点 × 15 题，按拓扑顺序排 10 天
function buildSchedule(nodes: KnowledgeNode[]): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const order = [
    ["arr-hash", "learn", 30],
    ["arr-hash", "review", 15],
    ["two-pointers", "learn", 30],
    ["two-pointers", "review", 15],
    ["linked-list", "learn", 30],
    ["linked-list", "review", 15],
    ["binary-tree", "learn", 40],
    ["binary-tree", "review", 20],
    ["binary-search", "learn", 30],
    ["backtracking", "learn", 40],
    ["backtracking", "review", 20],
    ["dp-intro", "learn", 40],
    ["dp-intro", "review", 20],
    ["dp-advanced", "learn", 50],
    ["dp-advanced", "review", 30],
  ] as const;

  order.forEach(([nodeId, type, minutes], idx) => {
    schedule.push({
      day: Math.floor(idx / 2) + 1, // 每 2 项一天，共 8 天
      nodeId: nodeId as string,
      type: type as "learn" | "review",
      estimatedMinutes: minutes as number,
      completed: false,
    });
  });
  return schedule;
}

export interface AlgorithmPreset {
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

export const ALGORITHM_PRESET: AlgorithmPreset = {
  topic: "算法面试必刷 15 题（Hot 100 精选）",
  knowledgeTree: ALGORITHM_NODES,
  questions: ALGORITHM_QUESTIONS,
  schedule: buildSchedule(ALGORITHM_NODES),
};
