// lib/presets/algorithm-200/questions/p1-backtrack.ts
// 「算法 200 题」内置知识库 · Phase1 回溯深度题解（8 题）
// 每题答案固定八段：题意与约束分析 / 思路推导：从暴力到最优 / 正确性要点 /
// 复杂度分析 / 代码实现 / 边界与易错点 / 举一反三 / 实际工程应用
// 代码统一 Go 实现；回溯模板统一为「选择 - 递归 - 撤销」三段式并配中文注释

import type { Question } from "../../../types";

export const P1_BACKTRACK_QUESTIONS: Question[] = [
  {
    id: "algo-46",
    nodeId: "p1-backtrack",
    question: `46. 全排列（LeetCode 46）\n题意：给定不含重复数字的数组，返回其所有可能的排列，顺序任意。\n示例：输入 [1,2,3] → 输出 [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]（共 3! = 6 个排列）\n约束：长度 1~6，元素互不相同`,
    answer: `## 题意与约束分析
给定无重复数组，返回全部排列，n ≤ 6。决策树：第 i 层从剩余元素选一个，深度 n，叶子 n! 个——下界 O(n·n!)，能优化的只有常数。

## 思路推导：从暴力到最优
枚举所有排列别无他法，n! 是输出下界，问题只剩系统化枚举做到不漏不重。回溯框架：维护 path（已选前缀）与 used（已用标记），每层选一个未用元素，递归后撤销——即 DFS 遍历决策树。原地交换法省 used，思想相同。

## 正确性要点
- 递归语义：backtrack() 在 path 前缀固定的前提下，枚举所有合法补全并收集。
- 不漏：第 k 层遍历全部 n-k 个未用元素，归纳得以 path 为前缀的排列都被生成。
- 不重：used 保证路径内不重复选；不同叶子前缀必不同，产出两两不同。
- 回溯不变式：递归返回立即撤销，回到父节点状态一致。

## 复杂度分析
- 时间 O(n·n!)：n! 个叶子各 O(n) 复制；内部节点 ≤ e·n!，同阶。
- 空间 O(n)：递归深度 + used + path（不计输出）。

## 代码实现
\`\`\`go
func permute(nums []int) [][]int {
    res := [][]int{}
    path := make([]int, 0, len(nums))
    used := make([]bool, len(nums))
    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) { // 叶子：收集
            cp := make([]int, len(path))
            copy(cp, path) // 必须复制，path 后续还会改
            res = append(res, cp)
            return
        }
        for i := range nums {
            if used[i] { continue }
            used[i] = true
            path = append(path, nums[i]) // 做选择
            backtrack()
            path = path[:len(path)-1]    // 撤销
            used[i] = false
        }
    }
    backtrack()
    return res
}
\`\`\`

## 边界与易错点
- 收集时必须复制 path：append(res, path) 共享底层数组，后续撤销污染已收答案——回溯题第一大坑。
- 撤销遗漏：used 复位或 path 弹出漏一个，状态污染导致漏解或重解。
- 空数组返回 [[]]（空排列）；单元素返回自身。

## 举一反三
- 47 全排列 II（含重复）：排序 + 同层去重。
- 31 下一个排列：数学构造 O(n)，不是回溯。
- 60 排列序列（第 k 个）：阶乘定位逐位确定。
- 784 字母大小写全排列：每字符两种选择的二叉决策树。

## 实际工程应用
任务调度暴力枚举、A/B 实验因子组合生成、游戏技能加点枚举。回溯框架是 CSP（约束满足问题）求解器的内核原型。`,
    keyPoints: ["决策树 n! 个叶子，输出决定复杂度下界", "框架三板斧：选择 - 递归 - 撤销", "收集必复制 path，否则答案被污染", "used 数组与原地交换是两种等价实现"],
    followUps: ["含重复元素（47 题）怎么去重？", "只要第 k 个排列（60 题）能不枚举吗？", "决策树有多少个节点？和叶子数什么关系？"],
    favorited: false,
  },
  {
    id: "algo-78",
    nodeId: "p1-backtrack",
    question: `78. 子集（LeetCode 78）\n题意：给定不含重复元素的数组，返回其全部子集（幂集），含空集与全集。\n示例：输入 [1,2,3] → 输出 [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]（共 2^3 = 8 个）\n约束：长度 1~10，元素互不相同`,
    answer: `## 题意与约束分析
返回无重复数组的幂集（全部子集），含空集。n ≤ 10，答案 2^n 个。两种等价视角：每个元素选/不选（二叉决策树），或按 startIndex 递增并收集决策树的每个节点。

## 思路推导：从暴力到最优
幂集 2^n 是输出下界。视角一：n 层决策，每层对 nums[i] 做「选/不选」两分支，叶子与所有子集一一对应。视角二（更常用）：组合式回溯，backtrack(start) 从 start 起逐个并入元素，进入函数先收集当前 path——决策树的每个节点（不只叶子）都是合法子集。位运算法（0..2^n-1 按位解释）是等价枚举。

## 正确性要点
- 不漏：任何子集的下标递增序列唯一对应视角二中一条「逐次并入」路径。
- 不重：startIndex 递增保证只按升序生成，{1,2} 与 {2,1} 只出现一次。
- 收集时机：进入 backtrack 立即收集（当前节点），再扩展子节点——对应「每个节点都是答案」。
- 位图法：k 的第 i 位为 1 当且仅当 nums[i] 入选，0..2^n-1 与幂集双射。

## 复杂度分析
- 时间 O(n·2^n)：2^n 个子集，每个子集复制 O(n)；即输出本身的代价。
- 空间 O(n)：递归深度（不计输出）。

## 代码实现
\`\`\`go
func subsets(nums []int) [][]int {
    res := [][]int{}
    path := []int{}
    var backtrack func(start int)
    backtrack = func(start int) {
        cp := make([]int, len(path))
        copy(cp, path)
        res = append(res, cp) // 每个节点都是合法子集，先收集
        for i := start; i < len(nums); i++ {
            path = append(path, nums[i]) // 选 nums[i]
            backtrack(i + 1)             // 下一个只能从 i 之后选，防重
            path = path[:len(path)-1]    // 撤销
        }
    }
    backtrack(0)
    return res
}
\`\`\`

## 边界与易错点
- 空集：backtrack(0) 首次进入时 path 为空，收集即空集，天然包含，别漏。
- 去重靠 startIndex 而非 used：组合题改用 used 会错杀合法升序组合。
- 收集时复制 path 的坑与 46 题相同。

## 举一反三
- 90 子集 II（含重复）：排序 + 同层去重。
- 77 组合（固定 k 个）：收集条件改为 len(path) == k，加长度剪枝。
- 39/40 组合总和：子集框架加「和」约束与去重。

## 实际工程应用
特性开关全组合测试矩阵生成、权限系统的角色子集枚举、电商赠品组合枚举、灰度发布多维组合实验。位图法对应状态压缩思想。`,
    keyPoints: ["2^n 个子集 = 输出下界", "组合式回溯：每个节点都是答案，不只叶子", "startIndex 递增防 {1,2}/{2,1} 重复", "位图枚举是等价的双射视角"],
    followUps: ["含重复元素（90 题）怎么改？", "只要大小为 k 的子集（77 题）呢？怎么剪枝？", "位运算迭代写法怎么做？什么场景更合适？"],
    favorited: false,
  },
  {
    id: "algo-90",
    nodeId: "p1-backtrack",
    question: `90. 子集 II（LeetCode 90）\n题意：给定可能含重复元素的数组，返回所有不重复的子集。\n示例：输入 [1,2,2] → 输出 [[],[1],[1,2],[1,2,2],[2],[2,2]]（[2] 只出现一次，重复的幂集被去重）\n约束：长度 1~10`,
    answer: `## 题意与约束分析
数组可能含重复元素，返回所有不重复的子集。n ≤ 10。核心：在枚举层面去重，而非生成 2^n 个后再去重。

## 思路推导：从暴力到最优
暴力：照 78 题生成全部 2^n 个子集再哈希去重——正确但大量无用功。洞察：重复子集源于「同层选了同值的另一拷贝」。排序使同值相邻，同层去重：i > start 且 nums[i] == nums[i-1] 时跳过——前一拷贝分支已枚举完「含该值」的子集。注意是「同层」去重：纵深路径选多个同值（如 [2,2]）合法，不能跳。

## 正确性要点
- 排序前置：相同值相邻，去重判断才有意义。
- 同层去重正确性：同层 nums[i] == nums[i-1]，两分支生成的含该值子集完全相同，跳过不丢新解。
- i > start 限定：i == start 时 nums[i-1] 是上一层已选元素，属不同层，不能跳——「同层」与「全局」的分界。
- 不漏不重由 78 题框架继承，去重只剪纯重复分支。

## 复杂度分析
- 时间 O(n·2^n)：最坏（全不相同）与子集 I 相同；重复越多剪枝越多。
- 空间 O(n)：递归深度；排序被吸收。

## 代码实现
\`\`\`go
func subsetsWithDup(nums []int) [][]int {
    sort.Ints(nums) // 相同值相邻，去重前提
    res := [][]int{}
    path := []int{}
    var backtrack func(start int)
    backtrack = func(start int) {
        cp := make([]int, len(path))
        copy(cp, path)
        res = append(res, cp)
        for i := start; i < len(nums); i++ {
            // 同层去重：同值前一个拷贝的分支已枚举过
            if i > start && nums[i] == nums[i-1] { continue }
            path = append(path, nums[i])
            backtrack(i + 1)
            path = path[:len(path)-1]
        }
    }
    backtrack(0)
    return res
}
\`\`\`

## 边界与易错点
- 忘记排序：去重依赖相邻性，不排序则去重失效产生重复答案。
- 把 i > start 写成 i > 0：变全局去重，纵深路径第二个 2 被误杀，漏掉 [2,2]。
- used 数组版（!used[i-1] 才跳过）是等价写法，别与 47 题方向记反。
- 收集位置：进入函数即收集；放错会漏空集或全集。

## 举一反三
- 40 组合总和 II：同层去重同模板，加目标和约束。
- 47 全排列 II：排序 + used + 同层去重，跳过条件是 used[i-1] == false。
- 491 递增子序列：不能排序（保原序），改用层内哈希集去重。

## 实际工程应用
含重复选项的组合枚举：多供应商同型号货源配货、同质实验组组合、可交换操作数的指令选择枚举。枚举层去重也是 SQL 优化器连接序枚举的标配技术。`,
    keyPoints: ["排序使同值相邻，是去重的前提", "同层去重：i > start 且 nums[i] == nums[i-1] 跳过", "同层 ≠ 全局：纵深路径选同值合法", "枚举层去重优于生成后集合去重"],
    followUps: ["为什么 i > start 而不是 i > 0？写错会漏什么解？", "used 数组版本的去重条件怎么写？和排列 II 有何不同？", "不能排序（保原序，491 题）时怎么去重？"],
    favorited: false,
  },
  {
    id: "algo-17",
    nodeId: "p1-backtrack",
    question: `17. 电话号码的字母组合（LeetCode 17）\n题意：给定仅含 2-9 的数字串，按电话键盘映射返回所有可能的字母组合。\n示例：输入 "23" → 输出 ["ad","ae","af","bd","be","bf","cd","ce","cf"]（2→abc 与 3→def 的笛卡尔积）\n约束：长度 0~4`,
    answer: `## 题意与约束分析
数字 2-9 映射电话键盘字母，返回数字串的全部字母组合。长度 ≤ 4。决策树：第 k 层选第 k 个数字的一个字母，分支 3~4，叶子 ≤ 4^n。

## 思路推导：从暴力到最优
输出规模 3^n~4^n 是下界，只能系统化枚举。回溯最自然：index 为当前数字下标，path 累积已选字母；对该数字每个字母「选择 - 递归 - 撤销」，触底收集。各数字字母互不相交，不需 used。队列迭代等价：初始 [""]，每读一数字把队列前缀与其字母两两拼接。

## 正确性要点
- 映射表：2-9 → abc/def/ghi/jkl/mno/pqrs/tuv/wxyz，写错一个全盘皆输。
- 递归语义：backtrack(index) 枚举 digits[index:] 的所有后缀，与 path 拼接后收集。
- 不漏不重：第 index 层遍历该数字全部分支，各分支当前位不同，叶子两两不同。

## 复杂度分析
- 时间 O(4^n · n)：叶子最多 4^n 个，每个字符串构建 O(n)。
- 空间 O(n)：递归深度（不计输出）。

## 代码实现
\`\`\`go
func letterCombinations(digits string) []string {
    if len(digits) == 0 { return []string{} } // 空输入空输出
    m := []string{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"}
    res := []string{}
    path := make([]byte, 0, len(digits))
    var backtrack func(index int)
    backtrack = func(index int) {
        if index == len(digits) { // 所有数字处理完
            res = append(res, string(path)) // string(path) 生成新串，天然复制
            return
        }
        for _, c := range m[digits[index]-'0'] {
            path = append(path, byte(c)) // 选一个字母
            backtrack(index + 1)
            path = path[:len(path)-1] // 撤销
        }
    }
    backtrack(0)
    return res
}
\`\`\`

## 边界与易错点
- 空输入：题目要求返回 []，别返回 [""]——先判空。
- 映射笔误：7→pqrs、9→wxyz 各 4 字母，其余 3 个，背错静默挂。
- Go 字符串索引得 byte：非 ASCII 场景要换 rune。

## 举一反三
- 22 括号生成：同为「固定深度、逐位选择」，选择受合法性约束。
- 784 字母大小写全排列：每字符 1~2 个分支的同构题。
- 93 复原 IP 地址：分段决策 + 数值合法性剪枝。

## 实际工程应用
T9/九宫格输入法候选词生成即本题：枚举组合再交词典过滤；模糊拨号同构。工业实现用 trie 把枚举与词典裁剪合一，避免全量生成。`,
    keyPoints: ["决策树：每位数字一层分支，叶子 3^n~4^n", "index 回溯：触底收集，无需 used", "空输入返回空集，常见判错点", "BFS 滚动拼接 = 笛卡尔积，等价视角"],
    followUps: ["枚举时同步过滤真实单词（给词典）怎么优化？", "BFS 迭代版怎么写？", "扩展到支持 0/1 或国际化键盘怎么做？"],
    favorited: false,
  },
  {
    id: "algo-39",
    nodeId: "p1-backtrack",
    question: `39. 组合总和（LeetCode 39）\n题意：候选数组无重复、每个元素可无限次选取，返回所有和为 target 的组合，顺序无关。\n示例：输入 candidates=[2,3,6,7], target=7 → 输出 [[2,2,3],[7]]（2 可重复用，[2,3,2] 与 [2,2,3] 视为同一组合）\n约束：长度 1~30，target ≤ 40`,
    answer: `## 题意与约束分析
无重复候选数组、元素可无限次选，求和为 target 的全部组合（顺序无关）。解数可能指数级——枚举必要，剪枝决定实际表现。

## 思路推导：从暴力到最优
「可重复选」= 递归参数从 i+1 改成 i：选完 candidates[i] 后仍可从 i 开始。防重靠 startIndex 单调不降（{2,2,3} 只生成一次）。剪枝：排序后 candidates[i] > remain 即整层 break。

## 正确性要点
- 递归语义：backtrack(start, remain) 枚举 candidates[start:] 凑 remain 的全部组合。
- 不漏不重：每层尝试 start..n-1，startIndex 非严格递增，不降序组合唯一生成。
- 剪枝不丢解：升序下 candidates[i] > remain 后全不可能。

## 复杂度分析
- 时间 O（决策树节点数 × 复制代价）：最坏指数级无多项式界。
- 空间 O(target/min)：递归深度。

## 代码实现
\`\`\`go
func combinationSum(candidates []int, target int) [][]int {
    sort.Ints(candidates) // 剪枝前提
    res := [][]int{}
    path := []int{}
    var backtrack func(start, remain int)
    backtrack = func(start, remain int) {
        if remain == 0 { // 凑齐
            cp := make([]int, len(path))
            copy(cp, path)
            res = append(res, cp)
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remain { break } // 前缀剪枝
            path = append(path, candidates[i])
            backtrack(i, remain-candidates[i]) // 传 i：可重复选
            path = path[:len(path)-1]
        }
    }
    backtrack(0, target)
    return res
}
\`\`\`

## 边界与易错点
- 递归传 i 而非 i+1 是可重复选的标志；写成 i+1 变 40 题语义，漏 [2,2,3]。
- break 剪枝前提是已排序；不排序只能 continue。
- remain 变负：有 break 时不可达；无 break 需先判 remain < 0 return。

## 举一反三
- 40 组合总和 II：限用一次 + 含重复 → i+1 + 同层去重。
- 377 组合总和 IV：求排列数——回溯超时，正解一维 DP。
- 322 零钱兑换：同结构求最少个数，DP 更优。

## 实际工程应用
凑单满减方案枚举、云资源规格凑目标算力、财务轧账核对。target 大时切 DP（322/377）。`,
    keyPoints: ["可重复选：递归传 i 不传 i+1", "组合去重靠 startIndex 单调不降", "排序 + candidates[i] > remain 则 break，前缀剪枝", "解数指数级是常态，复杂度如实描述"],
    followUps: ["每个元素只能用一次（40 题）改哪几行？", "为什么求方案数（377）回溯会超时？DP 怎么设计？", "剪枝为什么要求先排序？不排序怎么剪？"],
    favorited: false,
  },
  {
    id: "algo-40",
    nodeId: "p1-backtrack",
    question: `40. 组合总和 II（LeetCode 40）\n题意：候选数组含重复元素、每个元素至多使用一次，返回所有和为 target 的不重复组合。\n示例：输入 candidates=[10,1,2,7,6,1,5], target=8 → 输出 [[1,1,6],[1,2,5],[1,7],[2,6]]（两个 1 可同时入选，但 [1,7] 只出现一次）\n约束：长度 1~100，target ≤ 30`,
    answer: `## 题意与约束分析
候选数组含重复、每元素至多用一次，求和为 target 的不重复组合。限用 + 去重叠加，是 39 与 90 的合成题。

## 思路推导：从暴力到最优
限用一次 → 递归传 i+1（回到子集语义）；答案去重 → 排序 + 同层去重：i > start 且 candidates[i] == candidates[i-1] 时跳过。剪枝：candidates[i] > remain 时 break。「同层」含义：同层同值候选的组合集相同，第二分支纯重复；不同层选同值（[1,1,6]）合法。

## 正确性要点
- i+1 递归：每个元素在路径上至多选一次。
- 同层去重不丢解：同层同值分支互为重复；i == start 时前一个是父层元素。
- 三规则正交：限用、去重、剪枝分别作用于递归参数、循环头、循环体。

## 复杂度分析
- 时间：最坏 O(2^n·n)（全不重复退化为子集枚举）。
- 空间 O(n)：递归深度 ≤ n。

## 代码实现
\`\`\`go
func combinationSum2(candidates []int, target int) [][]int {
    sort.Ints(candidates) // 去重与剪枝前提
    res := [][]int{}
    path := []int{}
    var backtrack func(start, remain int)
    backtrack = func(start, remain int) {
        if remain == 0 {
            cp := make([]int, len(path))
            copy(cp, path)
            res = append(res, cp)
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remain { break } // 前缀剪枝
            if i > start && candidates[i] == candidates[i-1] { continue } // 同层去重
            path = append(path, candidates[i])
            backtrack(i+1, remain-candidates[i]) // i+1：限用一次
            path = path[:len(path)-1]
        }
    }
    backtrack(0, target)
    return res
}
\`\`\`

## 边界与易错点
- 递归写回 i（39 题习惯）：同一元素重复入选，产生非法解。
- 去重写成 i > 0：纵深合法同值（[1,1,6]）被误杀。
- 忘排序则去重与剪枝双失效；收集时复制 path。

## 举一反三
- 90 子集 II：去掉 target 即本题去重模板来源。
- 47 全排列 II：排列语义的同层去重，used 条件方向相反。
- 39/40/90 三题对比是考察去重理解的标准路径。

## 实际工程应用
限量库存配货（每 SKU 仅一件凑目标金额）、礼赠每样一份装配枚举、同质样本分组去重。本题是回溯去重基本功试金石。`,
    keyPoints: ["限用一次 → 递归 i+1", "含重复 → 排序 + 同层去重", "同层去重与限用一次是正交规则", "39/40/90 三题对比吃透去重本质"],
    followUps: ["同层去重换成 used 数组怎么写？条件是什么？", "如果元素可以用两次呢？框架怎么推广？", "为什么去重必须排序？给出不排序时失败的例子。"],
    favorited: false,
  },
  {
    id: "algo-22",
    nodeId: "p1-backtrack",
    question: `22. 括号生成（LeetCode 22）\n题意：给定 n 对括号，生成所有合法（正确匹配）的括号组合。\n示例：输入 n=3 → 输出 ["((()))","(()())","(())()","()(())","()()()"]（共卡特兰数 C_3 = 5 个）\n约束：1 ≤ n ≤ 8`,
    answer: `## 题意与约束分析
生成 n 对括号的全部合法组合，n ≤ 8。合法 = 任意前缀右括号数 ≤ 左括号数，且左右各 n。答案数为卡特兰数 C_n ≈ 4^n/(n^1.5·√π)。

## 思路推导：从暴力到最优
暴力：生成全部 2^(2n) 个序列再校验，O(n·4^n) 且浪费在非法串上。回溯：逐位构造，只延伸合法前缀——left < n 可放左，right < left 可放右。两条计数规则即剪枝，叶子恰为 C_n 个。剪枝本质：合法性检查从「事后校验」前移为「路径即时约束」。

## 正确性要点
- 充分性：按规则生成的串任意前缀 right ≤ left，最终 left == right == n，合法。
- 必要性（不漏）：合法串的构造必满足这两条规则——某步被禁则前缀已非法。
- 递归语义：backtrack(left, right) 枚举以 path 为前缀的所有合法补全。
- 计数自测：叶子数 = 卡特兰数（n=3→5，n=4→14）。

## 复杂度分析
- 时间 O(4^n/√n · n)：C_n 个叶子各 O(n) 复制。
- 空间 O(n)：递归深度 2n。

## 代码实现
\`\`\`go
func generateParenthesis(n int) []string {
    res := []string{}
    path := make([]byte, 0, 2*n)
    var backtrack func(left, right int)
    backtrack = func(left, right int) {
        if len(path) == 2*n { // 放满即合法串（规则保证）
            res = append(res, string(path))
            return
        }
        if left < n { // 左括号还有额度
            path = append(path, '(')
            backtrack(left+1, right)
            path = path[:len(path)-1]
        }
        if right < left { // 右括号不能超前
            path = append(path, ')')
            backtrack(left, right+1)
            path = path[:len(path)-1]
        }
    }
    backtrack(0, 0)
    return res
}
\`\`\`

## 边界与易错点
- 右括号条件写成 right < n：会生成前缀非法串——必须是 right < left。
- 终止条件 left == n && right == n 与 len(path) == 2n 等价。
- 撤销遗漏：两分支 append 后都要弹出。
- n = 0 返回 [""]；题目 n ≥ 1 无需处理。

## 举一反三
- 20 有效括号：校验版，栈匹配。
- 32 最长有效括号：DP/栈求最优值，同族不同解法。
- 301 删除无效括号：BFS/回溯 + 校验的逆向题。

## 实际工程应用
协议合法消息模板枚举（模糊测试种子）、表达式结构枚举。卡特兰数还出现在出栈序列、二叉树形态数等计数问题中。`,
    keyPoints: ["剪枝即合法性前移：right < left 才放右", "叶子数 = 卡特兰数，可自测", "两条计数规则充分且必要，不漏不重", "暴力 4^n → 剪枝后 4^n / √n 个叶子"],
    followUps: ["卡特兰数怎么推导？还出现在哪些题里？", "改成生成「最多错一处」的括号串怎么剪？", "n=15 时怎么优化常数？（位运算、记忆化）"],
    favorited: false,
  },
  {
    id: "algo-79",
    nodeId: "p1-backtrack",
    question: `79. 单词搜索（LeetCode 79）\n题意：在 m×n 字符网格中判断是否存在给定单词，路径由上下左右相邻格子组成且同一格子不可复用。\n示例：输入 board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word="ABCCED" → 输出 true（沿 A→B→C→C→E→D 可达）\n约束：m,n ≤ 6，word 长度 1~15`,
    answer: `## 题意与约束分析
m×n 网格查单词：路径为上下左右相邻格，同格不可复用。m,n ≤ 6、word ≤ 15——搜索空间 4^L 级，剪枝决定速度。

## 思路推导：从暴力到最优
暴力即正解骨架：每格做起点 DFS 四方向走 L 步，O(m·n·4^L)。优化：首字符预筛起点；多单词版（212）换 trie。visited 两种写法：布尔数组，或原地改字符走完恢复——后者省 O(mn) 空间，是加分细节。

## 正确性要点
- 递归语义：dfs(i, j, k) = 从 (i,j) 匹配 word[k:]，进入时已有 board[i][j]==word[k]。
- 复用禁止：原地标记防路径回头；回溯恢复字符，不影响其他起点。
- 边界：四方向判越界与标记；k == len(word) 即全匹配。

## 复杂度分析
- 时间 O(m·n·4^L)：首步分支 4、后续 ≤ 3，深度 L。
- 空间 O(L)：递归深度；布尔数组方案 O(m·n)。

## 代码实现
\`\`\`go
func exist(board [][]byte, word string) bool {
    m, n := len(board), len(board[0])
    var dfs func(i, j, k int) bool
    dfs = func(i, j, k int) bool {
        if k == len(word) { return true } // 全部匹配
        if i < 0 || i >= m || j < 0 || j >= n { return false } // 越界
        if board[i][j] != word[k] { return false } // 标记格也不等，天然拦截
        tmp := board[i][j]
        board[i][j] = '#' // 原地标记防复用
        found := dfs(i+1, j, k+1) || dfs(i-1, j, k+1) ||
            dfs(i, j+1, k+1) || dfs(i, j-1, k+1)
        board[i][j] = tmp // 恢复现场
        return found
    }
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if board[i][j] == word[0] && dfs(i, j, 0) { return true } // 首字符预筛
        }
    }
    return false
}
\`\`\`

## 边界与易错点
- 恢复现场：先算 found 再恢复；提前 return 版须先恢复再返回。
- 忘记标记导致 "ABA" 型假匹配（同格凑两字符）。
- Go 的 || 短路不跳过恢复语句。
- k == len(word) 判定放函数开头：单格单字符也正确。

## 举一反三
- 212 单词搜索 II：多单词 → trie + 一次 DFS。
- 200 岛屿数量：连通性搜索同族。
- 980 不同路径 III：网格回溯 + 哈密顿路径约束。

## 实际工程应用
棋盘游戏走法搜索、PCB 布线检查、网格路径可达性分析。trie 版与 IP 路由前缀查询同源。`,
    keyPoints: ["二维回溯 = 四方向 DFS + 访问标记", "原地改字符再恢复，省 O(mn) 空间", "首字符预筛是最便宜的剪枝", "多单词场景升级 trie（212 题）"],
    followUps: ["visited 数组与原地标记各有什么坑？并发搜索时原地标记还行吗？", "大网格怎么优化？（字符频次预检、从稀有字符起步）", "212 题 trie 版为什么只需要一次 DFS？"],
    favorited: false,
  },
];
