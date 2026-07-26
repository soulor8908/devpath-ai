// lib/presets/algorithm-200/questions/p1-linkedlist.ts
// 链表模块深度题解（10 题）：覆盖反转、合并、判环、倒数删除、分组翻转、深拷贝、归并排序。
// 设计思路：每题答案固定 8 段（题意/思路推导/正确性要点/复杂度/Go 实现/易错点/举一反三/工程应用），
// 强调「循环不变式 + 数学证明 + 面试口述路径」，而非只给代码。
// 链表题的公共心法：虚拟头节点统一边界、指针改名前先用图推演、断链前先保存后继。

import type { Question } from "../../../types";

export const P1_LINKEDLIST_QUESTIONS: Question[] = [
  {
    id: "algo-206",
    nodeId: "p1-linkedlist",
    question: `1. 反转链表（LeetCode 206）
题意：给定单链表的头节点 head，反转整个链表并返回新的头节点。
示例：输入 1->2->3->4->5 → 输出 5->4->3->2->1（每个节点的 Next 指针方向全部调转）。
约束：节点数 0 ~ 5000，节点值在 -5000 ~ 5000 之间；要求迭代与递归两种写法都掌握。`,
    answer: `## 题意与约束分析
把单链表所有 Next 指针反向，返回原尾节点作为新头。节点数最多 5000，值域无意义（不比较值），说明这是纯指针操作题。任何 O(n) 时间、O(1) 额外空间的解都达标；递归版会消耗 O(n) 栈空间，要能说清这个权衡。

## 思路推导：从暴力到最优
暴力思路是把节点值依次读出来存进数组再反向重建链表，时间 O(n) 但破坏了节点 identity，且空间 O(n)，面试官一听就会追问「能不能不开新节点」。观察到：单链表唯一的结构就是 Next 指针，反转等价于「每个节点的 Next 从指向后继改为指向前驱」。那就只需遍历一遍，边走边改指针。关键障碍是改了 cur.Next 之后找不到原来的后继——所以改之前必须先用一个变量把后继存下来。这就自然引出三指针迭代：prev、cur、next。递归视角则等价：先假设子问题 head.Next 之后的部分已反转好，只需把 head 接到已反转段的尾部。

## 正确性要点
- 迭代的循环不变式：每轮循环开始前，prev 指向「已反转部分的头」，cur 指向「未反转部分的头」，已反转部分内部指针已全部正确反向。循环体执行 cur.Next = prev 后不变式对新节点重新成立。
- 终止性：cur 严格沿原链前进，n 步后 cur 为 nil 退出；此时 prev 恰为原尾节点即新头，且原头节点的 Next 已在第一轮被置为 nil，不会成环。
- 递归版正确性：归纳假设 reverse(head.Next) 返回已反转子链的新头，且 head.Next 是反转后子链的尾；执行 head.Next.Next = head 把 head 接尾，再 head.Next = nil 封口，归纳成立。

## 复杂度分析
- 时间：O(n) —— 每个节点恰好访问一次，与暴力重建相同但无重建开销
- 空间：迭代 O(1)；递归 O(n) 的调用栈

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }

// 迭代版：三指针
func reverseList(head *ListNode) *ListNode {
	var prev *ListNode // prev 初始为 nil，反转后原头节点自然指向 nil
	cur := head
	for cur != nil {
		next := cur.Next // 先保存后继，防止断链后丢失
		cur.Next = prev  // 反转当前节点的指针
		prev = cur       // prev 前进一步
		cur = next       // cur 前进一步
	}
	return prev // 循环结束时 prev 落在原尾节点，即新头
}

// 递归版
func reverseListRecursive(head *ListNode) *ListNode {
	if head == nil || head.Next == nil {
		return head // 递归到底：最后一个节点就是新头
	}
	newHead := reverseListRecursive(head.Next)
	head.Next.Next = head // 后继节点回头指向当前节点
	head.Next = nil       // 当前节点断开旧指针，防止成环
	return newHead        // 新头一路透传回最外层
}
\`\`\`

## 边界与易错点
- 空链表：迭代版 prev 为 nil 直接返回 nil，天然正确；递归版必须判 head == nil 否则空指针。
- 忘记先存 next 就改 cur.Next：后继丢失，链表断成两截，这是新手第一大挂法。
- 递归版漏写 head.Next = nil：原头节点的 Next 仍指向原第二个节点，而新头那一端也指回来，形成二元环，后续遍历死循环。
- 返回 cur 而不是 prev：循环结束时 cur 已是 nil。

## 举一反三
- LeetCode 92 反转链表 II：只反转 [left, right] 区间，拆成「定位前驱 + 复用本题的局部反转」。
- LeetCode 25 K 个一组翻转：把本题封装成「反转 k 个节点」的子函数反复调用，是本题的批量版。
- LeetCode 234 回文链表：快慢指针找中点 + 反转后半段 + 双头比对，反转作为子步骤出现。
- 识别信号：题目出现「反向」「逆序」「从尾到头」且要求原地，基本就是三指针反转或其变体。

## 实际工程应用
链式结构的逆向遍历在不允许反向指针的存储布局里只能靠反转：例如某些内存受限的嵌入式日志系统用单链表存事件流，需要就地逆序回放时用的就是三指针原地反转，避免 O(n) 额外缓冲。另外反转链表是「指针操作正确性证明」的最小教学模型，面试里常作为白板编程的第一道热身题。`,
    keyPoints: [
      "迭代三指针的不变式：prev=已反转段头，cur=未反转段头，每轮把一个节点从未反转段迁移到已反转段",
      "改指针前必须先存 next，否则断链丢节点——这是所有链表指针题的通用纪律",
      "递归版的本质是「把 head 挂到已反转子链的尾部」，head.Next.Next = head 这行是挂接动作",
      "递归代价是 O(n) 栈空间，5000 节点在 Go 里没问题，但面试要主动说出这个权衡",
    ],
    followUps: [
      "要求 O(1) 空间且不能用递归，怎么处理？（迭代三指针即是答案，追问意图是确认你知道递归栈也算空间）",
      "如何只反转链表的后半段？（快慢指针找中点 + 对后半段调用同一反转函数）",
      "如果链表可能带环，反转会发生什么？（死循环/成环，需先判环）",
    ],
    favorited: false,
  },
  {
    id: "algo-92",
    nodeId: "p1-linkedlist",
    question: `2. 反转链表 II（LeetCode 92）
题意：给定单链表和整数 left、right（1 ≤ left ≤ right ≤ n），只反转第 left 到第 right 个节点之间的部分，其余位置保持不变。
示例：输入 1->2->3->4->5, left=2, right=4 → 输出 1->4->3->2->5（中间 2-3-4 反转为 4-3-2，首尾保持）。
约束：节点数 1 ~ 500，要求一趟扫描完成，不得先反转再拼回的多趟做法。`,
    answer: `## 题意与约束分析
反转链表的区间版：只有 [left, right] 这段需要反转，区间的左右接口要与原链无缝接回。left 可能等于 1（从头开始反转），这是最大边界陷阱，必须虚拟头节点。一趟扫描的要求排除了「先切段、反转、再拼接」的多趟写法，需要在一次遍历中完成定位与反转。

## 思路推导：从暴力到最优
暴力做法：先走到 left 切出子链，对子链调用 206 的反转，再串回去，需要两趟以上且接口指针容易搞错。优化观察：反转区间的本质是「区间内每个节点依次被插到区间头部」，可以用头插法一趟完成——固定区间第一个节点 cur 不动，反复把 cur 的后继摘下来插到区间最前面，执行 right-left 次后整个区间完成反转。这样只需要一个指向区间前驱的指针 pre 和一个不动的 cur，不需要真的切断链表。定位 pre 用虚拟头节点 dummy 从 0 号位走 left-1 步即可，天然兼容 left=1。

## 正确性要点
- 不变式：头插法每轮执行后，pre.Next 到 cur 之间的部分是「已反转部分」，且长度恰好增加 1；cur 始终是原区间第一个节点，位置永不动。
- 执行恰好 right-left 次插入后，已反转部分覆盖整个 [left, right] 区间，pre.Next 指向原 right 节点（新区间头），cur.Next 指向原 right 的后继（区间外部分），左右接口自动接好。
- 虚拟头节点使 left=1 时 pre=dummy，逻辑与内部位置完全一致，无需特判。

## 复杂度分析
- 时间：O(n) —— 定位 left 用 O(left)，反转用 O(right-left)，合计一趟
- 空间：O(1)，只用到固定几个指针

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }
func reverseBetween(head *ListNode, left int, right int) *ListNode {
	dummy := &ListNode{Next: head} // 虚拟头：兼容 left=1 从头反转
	pre := dummy
	// 第一步：pre 走 left-1 步，停在反转区间的前驱
	for i := 0; i < left-1; i++ {
		pre = pre.Next
	}
	cur := pre.Next // cur 是区间第一个节点，全程不移动
	// 第二步：头插法，把 cur 的后继反复插到 pre 之后，共 right-left 次
	for i := 0; i < right-left; i++ {
		next := cur.Next      // 待迁移的节点
		cur.Next = next.Next  // 把 next 从原位置摘下
		next.Next = pre.Next  // next 插到区间头部
		pre.Next = next       // pre 与新头连接
	}
	return dummy.Next
}
\`\`\`

## 边界与易错点
- left=1：没有虚拟头节点就必须单独处理「换头」逻辑，极易漏；dummy 一行代码消掉这个分支。
- left==right：反转区间长度为 1，循环体执行 0 次，原样返回，代码天然正确。
- 指针改名顺序错误：cur.Next = next.Next 必须先于 next.Next = pre.Next，否则摘链动作把 next 自己的后继改掉，造成环。
- 反转后忘记 cur.Next 已自动指向区间外第一个节点而多接一次：头插法的接口是自动接好的，多写拼接反而画蛇添足。

## 举一反三
- LeetCode 206 反转链表：本题的特例 left=1, right=n，模板退化为整链反转。
- LeetCode 25 K 个一组翻转：区间反转的批量版，每段长度固定 k，需要额外维护段前驱与段尾。
- LeetCode 24 两两交换相邻节点：等价于每段长度为 2 的区间反转，同样用前驱指针驱动。
- 识别信号：「只处理链表的某一段」→ 先定位前驱 pre，再在段内操作，段外接口交给 pre 和段内不动节点自动衔接。

## 实际工程应用
文本编辑器中「选中一段并反向」的操作在底层行链表上就是区间反转；diff 工具的 hunk 重排也常用区间级链表操作。头插法本身还是网络协议栈中把乱序到达的数据包重排进接收窗口的经典手法之一。`,
    keyPoints: [
      "头插法不变式：cur 永不动，每轮把 cur.Next 摘到 pre 之后，执行 right-left 次恰好反转整个区间",
      "虚拟头节点把 left=1 的特判消成统一逻辑，这是链表题的第一工程纪律",
      "一趟完成的本质：不真切断链表，靠 pre 与 cur 的相对运动完成反转与接口衔接",
    ],
    followUps: [
      "如果 left/right 以 0 为起点、且可能越界，接口要怎么改？（先 clamp 并判空，pre 步数相应调整）",
      "能否用递归实现区间反转？（可以，前 left-1 层只递归不操作，但栈空间 O(n)，不如迭代）",
      "如果是双向链表，反转区间要改几个指针？（4 条链：两个 Next 两个 Prev，接口处各两条）",
    ],
    favorited: false,
  },
  {
    id: "algo-21",
    nodeId: "p1-linkedlist",
    question: `3. 合并两个有序链表（LeetCode 21）
题意：给定两个升序链表的头节点 l1 和 l2，将它们合并为一个升序链表并返回，要求通过拼接原有节点完成，不新建数据节点。
示例：输入 1->2->4 与 1->3->4 → 输出 1->1->2->3->4->4（交错取较小者尾插）。
约束：两链表节点数均为 0 ~ 50，节点值 -100 ~ 100，两链表各自保证非递减。`,
    answer: `## 题意与约束分析
归并排序中 merge 子过程的链表版。关键约束是「拼接原有节点」而非新建——意味着我们只是在重排指针，空间可以做到 O(1)。链表的有序性保证了两条链各自内部已排好，合并只需在两链当前头之间取小者，这正是归并的两路归并性质。

## 思路推导：从暴力到最优
暴力思路是把值全部读进数组、排序、重建链表，O(n log n) 且破坏节点 identity，直接丢弃。观察有序性带来的结构性质：合并结果的下一个节点必然是 l1.Val 与 l2.Val 中较小者，且取走一个后剩余子问题结构不变——这就是典型的贪心 + 递归结构。于是维护一个 tail 指针指向已合并区间的末尾，每轮把较小节点接到 tail.Next 并推进对应指针。当一条链耗尽时，另一条链的剩余部分整体已经有序，直接整段挂上即可，无需逐节点搬运。递归版同样自然：比较两头，小者的 Next 指向递归结果。

## 正确性要点
- 循环不变式：每轮迭代后，dummy 到 tail 的链是「l1 已消费前缀与 l2 已消费前缀的有序合并」，且 tail 指向该有序段末尾。
- 贪心选择的正确性：全局最小未合并元素必为 min(l1.Val, l2.Val)，取走它不损害最优性（交换论证：若答案先取了另一边较大者，交换后仍合法且不差）。
- 剩余段直接拼接的正确性：一条链耗尽后，另一条链的剩余部分全部不小于已合并段末尾，且内部有序，故整段挂上保持整体有序。

## 复杂度分析
- 时间：O(m+n) —— 每个节点最多被比较和链接一次，对比暴力排序的 O((m+n) log(m+n))
- 空间：迭代 O(1)；递归 O(m+n) 栈深

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }

// 迭代版：虚拟头 + 尾插
func mergeTwoLists(l1 *ListNode, l2 *ListNode) *ListNode {
	dummy := &ListNode{}
	tail := dummy // tail 始终指向已合并区间的最后一个节点
	for l1 != nil && l2 != nil {
		if l1.Val <= l2.Val {
			tail.Next = l1
			l1 = l1.Next
		} else {
			tail.Next = l2
			l2 = l2.Next
		}
		tail = tail.Next
	}
	// 剩余部分整体接上，无需逐个复制
	if l1 != nil {
		tail.Next = l1
	} else {
		tail.Next = l2
	}
	return dummy.Next
}

// 递归版
func mergeTwoListsRecursive(l1, l2 *ListNode) *ListNode {
	if l1 == nil {
		return l2
	}
	if l2 == nil {
		return l1
	}
	if l1.Val <= l2.Val {
		l1.Next = mergeTwoListsRecursive(l1.Next, l2)
		return l1
	}
	l2.Next = mergeTwoListsRecursive(l1, l2.Next)
	return l2
}
\`\`\`

## 边界与易错点
- 一条或两条链为空：主循环直接跳过，剩余段拼接逻辑覆盖，天然正确；递归版的两个 base case 也是它。
- 忘记 tail = tail.Next 推进：所有节点都挤在 dummy.Next 上反复覆盖，结果只剩一个节点。
- 剩余段用循环逐个接：功能对但违背「整段挂上」的简洁性，面试中会显得没吃透有序性。
- 等号归属：l1.Val <= l2.Val 用小于等于时优先取 l1，保证稳定合并（同值保持原相对顺序），归并排序的稳定性正来源于此。

## 举一反三
- LeetCode 148 排序链表：归并排序链表版，本题是其 merge 子过程。
- LeetCode 23 合并 K 个升序链表：两两归并（分治）或最小堆，本题是 K=2 的底座。
- LeetCode 88 合并两个有序数组：同一贪心思想的数组版，区别是利用尾部空位从后往前写，避免挪动。
- 识别信号：「两个/多个已排序序列合并为一个」→ 两路归并贪心；链表用尾插，数组用双指针从可行的一端写。

## 实际工程应用
两路归并是归并排序、外部排序（磁盘多路归并）和 LSM-Tree  compaction 的核心子过程：LevelDB/RocksDB 合并 SSTable 时就是在多个有序迭代器间反复取最小 key 尾插写新文件，与本题逻辑同构。日志系统按时间戳合并多个分片的有序日志流也是同一模型。`,
    keyPoints: [
      "不变式：dummy..tail 始终是两条链已消费前缀的有序合并，tail 指向段尾",
      "一条链耗尽后另一条整段挂上——有序性保证剩余部分全部够大，这是与数组版合并的本质区别",
      "等号归属决定稳定性：<= 取左链保证同值元素的原始先后顺序，归并排序稳定性即源于此",
      "递归版结构优雅但栈深 O(m+n)，工程实现一律迭代",
    ],
    followUps: [
      "扩展到 K 条有序链表怎么做？复杂度多少？（分治两两归并 O(nk log k)，或最小堆 O(nk log k)）",
      "如果要求合并时去除重复值呢？（链接前检查 tail.Val 与候选值，相等则跳过并继续推进）",
      "并发场景下两个生产者各自维护有序链，消费者归并，有什么坑？（节点共享时的数据竞争，需要拷贝或加锁）",
    ],
    favorited: false,
  },
  {
    id: "algo-141",
    nodeId: "p1-linkedlist",
    question: `4. 环形链表（LeetCode 141）
题意：给定单链表头节点 head，判断链表中是否存在环（某个节点的 Next 指向了之前出现过的节点）。
示例：输入 3->2->0->-4 且尾节点指回第 2 个节点 → 输出 true（存在环）。
约束：节点数 0 ~ 10^4，要求尽量用 O(1) 空间完成。`,
    answer: `## 题意与约束分析
判断单链表是否有环。难点在于环上无限循环，不能靠「走到 nil」终止，也不能简单记住走过的节点数上限。O(1) 空间的要求排除了哈希表记录访问痕迹的做法，指向经典解法：Floyd 快慢指针。

## 思路推导：从暴力到最优
暴力做法：哈希表记录每个访问过的节点指针，每走一步查表，出现重复即有环，走到 nil 即无环。时间 O(n) 但空间 O(n)。如何省空间？观察环的结构：一旦进入环，任何沿 Next 的行走都永远在环内打转。如果有两个速度不同的指针同向行驶在环形跑道上，快的一定会从后方追上慢的——就像操场套圈。这就是 Floyd 判环：slow 每次 1 步，fast 每次 2 步；若 fast 或其 Next 触及 nil，说明存在出口即无环；否则 fast 必在环内与 slow 相遇。

## 正确性要点
- 一定会相遇（反证 + 相对速度）：设 slow 刚进入环时，fast 已在环内，两者环上距离为 d（fast 落后 slow 的距离，沿行进方向度量）。每轮 fast 比 slow 多走 1 步，相对速度为 1，d 每轮减 1（mod 环长），故至多再走环长步后 d=0，二者必然相遇，不会永远错过。
- 不会跳过：相对速度为 1 保证了 fast 追上 slow 时是逐格逼近，不存在「从头上飞过去」的情况——这是选速度差 2:1 而非 3:1 的隐藏原因之一（速度差更大时仍正确，但 2:1 分析最干净）。
- 无环时终止性：无环则链有终点，fast 每次 2 步，至多 ceil(n/2) 轮后 fast 或 fast.Next 为 nil，循环退出返回 false。

## 复杂度分析
- 时间：O(n) —— slow 进环前走 O(n)，进环后至多再走一圈，总量线性
- 空间：O(1) —— 对比哈希表的 O(n)

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }
func hasCycle(head *ListNode) bool {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next      // 慢指针每次 1 步
		fast = fast.Next.Next // 快指针每次 2 步
		if slow == fast {
			return true // 相遇即有环
		}
	}
	return false // 快指针触到 nil，无环
}
\`\`\`

## 边界与易错点
- 空链表或单节点无环：循环条件 fast != nil && fast.Next != nil 直接挡住，返回 false。
- 循环条件只判 fast != nil：fast.Next.Next 在 fast.Next 为 nil 时空指针 panic，必须两个都判。
- 把 slow==fast 的判断写在移动之前：初始时两者都在 head，会误判为有环——必须先移动再比较（或初始让 fast 先走一步）。
- 用值比较代替指针比较：值可以重复，只有指针相等才是同一节点，判环必须比指针。

## 举一反三
- LeetCode 142 环形链表 II：判环的进阶版，在相遇基础上用数学推导定位环入口。
- LeetCode 287 寻找重复数：把数组下标与值的映射看成隐式链表，重复数即环入口，同一套 Floyd。
- LeetCode 202 快乐数：数位平方和的迭代序列若进入循环（非 1）即成环，快慢指针直接套。
- 识别信号：「迭代序列 / 指针行走 / 状态转移是否进入死循环」→ 建模为链式结构判环。

## 实际工程应用
Floyd 判环是「检测迭代系统死循环」的极简模型：轮询状态机是否陷入循环、爬虫 URL 去重后的环路检测、GC 中引用环检测的理论原型（实际 GC 用三色标记而非判环，但「对象图成环」概念同源）。密码学中 Pollard rho 大数分解算法正是用 Floyd 判环在伪随机序列中找循环，从而找到因子。`,
    keyPoints: [
      "相遇必然性：slow 进环后 fast 每轮把环上距离缩 1，相对速度 1 保证逐格逼近不会跨过",
      "循环条件必须是 fast != nil && fast.Next != nil，少一个判空就是 panic",
      "必须先移动再比较，否则初始同点被误判成环",
      "哈希表法 O(n) 空间是兜底层答案，Floyd 的卖点是 O(1) 空间——面试要两个都能说",
    ],
    followUps: [
      "为什么 fast 走 2 步而不是 3 步？（仍正确，但 2:1 的相对速度为 1，证明最简洁，且总步数最少）",
      "能否顺便求出环的长度？（相遇后固定 slow 不动，fast 再走一圈计数即得）",
      "如果链表在并发环境下另一线程正在改指针，判环还可靠吗？（不可靠，可能读到撕裂状态，需要快照或锁）",
    ],
    favorited: false,
  },
  {
    id: "algo-142",
    nodeId: "p1-linkedlist",
    question: `5. 环形链表 II（LeetCode 142）
题意：给定单链表头节点 head，若存在环则返回入环的第一个节点，否则返回 nil；不允许修改链表。
示例：输入 3->2->0->-4 且尾节点指回节点 2 → 输出节点 2（值为 2 的节点即环入口）。
约束：节点数 0 ~ 10^4，进阶要求 O(1) 空间。`,
    answer: `## 题意与约束分析
在 141 判环的基础上更进一步：不仅要判定，还要精确定位环入口。O(1) 空间的要求同样排除哈希表，需要在 Floyd 相遇之后追加一个数学上保证正确的第二阶段。这题的核心不是代码而是推导。

## 思路推导：从暴力到最优
哈希表法直接：第一个重复访问的节点就是入口，但空间 O(n)。如何在 Floyd 框架上继续？设头到入口距离为 a，入口到相遇点距离为 b，相遇点继续走到入口的距离为 c（环长 b+c）。相遇时 slow 走了 a+b，fast 走了 a+b+n(b+c)（多绕 n 圈）。由 fast 步数 = 2 倍 slow 步数得 a+b+n(b+c) = 2(a+b)，化简得 a = c + (n-1)(b+c)。这个等式的含义：从 head 走 a 步，等价于从相遇点走 c 步再绕 n-1 整圈——都恰好停在入口。于是第二阶段：一个指针从 head 出发，另一个从相遇点出发，同速各走 1 步，首次相遇处即环入口。

## 正确性要点
- 数学推导：由 fast = 2 × slow 的步数关系推出 a = c + (n-1)(b+c)，对任意整数 n ≥ 1 成立；等式右边表明从相遇点出发走 c 步后（再绕若干整圈）落在入口，左边表明从 head 走 a 步也在入口。
- 同步出发必在入口相遇：两指针速度相同，距离差恒为 a - c = (n-1)(b+c)，是环长的整数倍，故慢者走 a 步时快者走了 a + (n-1)(b+c)，两者位置相同且为入口；且在到达入口之前不可能相遇，因为入口是链上首个环节点，之前的直线段上两指针距离为正的 a 的差值。
- 无环情形由第一阶段的 fast 触及 nil 正确处理，返回 nil。

## 复杂度分析
- 时间：O(n) —— 第一阶段 O(a + 环长)，第二阶段 O(a)，总量线性
- 空间：O(1)

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }
func detectCycle(head *ListNode) *ListNode {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast {
			// 第一次相遇：进入第二阶段定位入口
			p := head
			for p != slow {
				p = p.Next      // 从头出发
				slow = slow.Next // 从相遇点出发，同速
			}
			return p // 相遇处即环入口
		}
	}
	return nil // 无环
}
\`\`\`

## 边界与易错点
- 环入口就是头节点（a=0）：p 初始就在入口，若 slow 第一次相遇点恰为 head，则 p == slow 立即返回，正确；若相遇点在环内，c 步后 slow 也回到 head，仍正确。
- 单节点自环：slow 走一步、fast 走两步后相遇于该节点，p 从 head 出发即得入口。
- 忘记第二阶段两指针同速：若一个走 2 步推导就失效，必须都是 1 步。
- 相遇后从头走时用错了指针：必须用相遇时的 slow（或 fast，同点），不能用已移走的其他变量。

## 举一反三
- LeetCode 287 寻找重复数：值域 1..n 的 n+1 数组必有重复，i -> nums[i] 构成带环隐式链表，环入口即重复数，代码与思路完全同构。
- LeetCode 202 快乐数：迭代序列的循环检测 + 定位循环起点，同一框架。
- LeetCode 141：本题的前置，只会判不会找入口说明数学推导没吃透。
- 识别信号：「隐式图/序列中存在循环，要求定位循环起点」→ Floyd 两阶段。

## 实际工程应用
「检测 + 定位循环起点」是分析迭代系统收敛性的通用工具：仿真器里检测状态死循环并定位首个重复状态，可以精确定位 bug 引入点；分布式共识日志回放中检测消息重放环路时可用同一思想。调试器中检测无限递归的栈帧循环、内存分析工具定位引用环的入口对象，其理论模型都是 Floyd 两阶段。`,
    keyPoints: [
      "核心等式 a = c + (n-1)(b+c)：头到入口的距离 = 相遇点到入口的距离 + 环长的整数倍",
      "第二阶段从头与相遇点同速出发，距离差是环长整数倍，故首次相遇必在入口",
      "推导只依赖 fast = 2 slow 这一比例，证明时先设 a/b/c 三个距离是标准动作",
      "代码两个阶段加起来不到 20 行，但这题的考察点 100% 在推导而非代码",
    ],
    followUps: [
      "推导中 n 可以是 0 吗？（不可以，相遇时 fast 至少多走一圈，n ≥ 1；n=0 意味着 fast 没追上）",
      "如何同时输出环的长度？（第二阶段后让一指针绕环一周计数，或直接由相遇信息推不出，需要再走一圈）",
      "把数组当隐式链表的 287 题为什么不能修改数组还要求 O(1) 空间？（Floyd 恰好只读不写，完美契合约束）",
    ],
    favorited: false,
  },
  {
    id: "algo-19",
    nodeId: "p1-linkedlist",
    question: `6. 删除链表的倒数第 N 个结点（LeetCode 19）
题意：给定单链表头节点 head 和整数 n，删除链表的倒数第 n 个节点，并返回头节点。
示例：输入 1->2->3->4->5, n=2 → 输出 1->2->3->5（删除倒数第 2 个节点 4）。
约束：节点数 1 ~ 30，1 ≤ n ≤ 节点数；进阶要求一趟扫描完成。`,
    answer: `## 题意与约束分析
删除倒数第 n 个节点。链表只能单向遍历，「倒数」概念无法直接定位，需要把倒数第 n 转化为正数位置信息。约束保证 n 合法（1 ≤ n ≤ 长度），但删除的可能是头节点（n 等于长度时），这是必须处理的边界。一趟扫描的要求排除了「先数长度再走」的两趟做法。

## 思路推导：从暴力到最优
两趟做法：第一趟数出总长 L，第二趟走到第 L-n 个节点（待删节点的前驱）执行删除。简单但扫两遍。一趟做法的关键洞察：让两个指针保持固定间距，先行的 fast 到达末尾时，落后的 slow 所处的位置就被这个间距唯一确定。要删除倒数第 n 个节点，slow 必须停在它的前驱，即倒数第 n+1 个位置；所以 fast 要比 slow 多走 n+1 步（从虚拟头起算：fast 先走 n+1 步）。之后两指针同步前进，fast 为 nil 时 slow 恰在待删节点前驱，执行 slow.Next = slow.Next.Next 完成删除。虚拟头节点让「删除头节点」与「删除中间节点」逻辑统一。

## 正确性要点
- 位置论证：设链表长 L，从 dummy（位置 0）起节点位于 1..L。fast 先走 n+1 步到位置 n+1；随后两指针同步走，fast 再走 L-n 步到达 nil（位置 L+1），此时 slow 走了 L-n 步停在位置 L-n，即第 L-n+1 个节点（倒数第 n 个）的前驱。删除其 Next 即删除目标。
- 间距 n+1 而非 n 的原因：删除操作需要前驱，若只要「定位」倒数第 n 个本身，间距 n 即可；前驱要求多退一格。
- dummy 的存在使 n = L（删头）时 slow 恰停在 dummy，删除动作与其余位置完全一致，无特判。

## 复杂度分析
- 时间：O(L) —— fast 总共走 L+1 步，一趟；对比两趟做法的 2L 步
- 空间：O(1)

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }
func removeNthFromEnd(head *ListNode, n int) *ListNode {
	dummy := &ListNode{Next: head} // 虚拟头：删除头节点时逻辑统一
	fast, slow := dummy, dummy
	// fast 先走 n+1 步，使 slow 最终停在待删节点的前驱
	for i := 0; i <= n; i++ {
		fast = fast.Next
	}
	// 同步前进，fast 到 nil 时 slow 即前驱
	for fast != nil {
		fast = fast.Next
		slow = slow.Next
	}
	slow.Next = slow.Next.Next // 跳过倒数第 n 个节点
	return dummy.Next
}
\`\`\`

## 边界与易错点
- 删除头节点（n 等于长度）：dummy 让 slow 停在 dummy 上，删除的正是原头，返回 dummy.Next 即新头；没有 dummy 就必须特判换头。
- 单节点链表 n=1：fast 先走 2 步到 nil，同步循环不执行，slow 在 dummy，删除唯一节点返回 nil，正确。
- 间距写成 n 而不是 n+1：slow 会停在待删节点本身，slow.Next = slow.Next.Next 删成了倒数第 n-1 个，差一错误。
- fast 先行时没考虑 n+1 恰等于 L+1：fast 直接为 nil，后续同步循环不执行，逻辑仍正确——约束 n ≤ L 保证不会空指针。

## 举一反三
- LeetCode 876 链表的中间结点：同族「间距双指针」，fast 走 2 步 slow 走 1 步，fast 到底时 slow 在中点。
- LeetCode 141/142 环形链表：快慢指针的另一变体，速度差用于判环而非定位。
- LeetCode 61 旋转链表：先成环再在倒数第 k 处断开，倒数定位思想一致。
- 识别信号：「倒数第 k 个」「中间位置」等需要相对尾部定位的场景 → 等间距双指针，间距由目标位置反推。

## 实际工程应用
「与尾部保持固定距离的滑窗定位」在流式系统里很常见：TCP 拥塞控制中维护与最新 ACK 保持固定窗口的发送指针；日志采集端需要删除倒数第 k 条已确认记录时，用两个游标保持 k+1 间距一趟定位，避免先遍历统计总量。零拷贝网络栈中的环形缓冲回收也复用同一「前后游标」模型。`,
    keyPoints: [
      "间距为 n+1 而非 n：删除需要前驱，等间距双指针的间距由「目标的前驱」反推",
      "虚拟头把「删头节点」与「删中间节点」消成同一段代码，是链表删除题的标配",
      "位置证明：fast 走到 nil（位置 L+1）时 slow 在位置 L-n，恰为倒数第 n 个的前驱",
      "一趟扫描的本质是用 fast 的先行距离替换了第一趟的长度统计",
    ],
    followUps: [
      "如果 n 可能大于链表长度（不合法输入），代码要怎么防御？（fast 先行时判 nil，提前返回原链表）",
      "如果要求返回被删除节点的值呢？（删除前先存 slow.Next.Val，其余不变）",
      "双向链表下这个题会简化吗？（不需要前驱信息，但定位仍需一次扫描或长度信息，收益有限）",
    ],
    favorited: false,
  },
  {
    id: "algo-24",
    nodeId: "p1-linkedlist",
    question: `7. 两两交换链表中的节点（LeetCode 24）
题意：给定单链表，两两交换相邻的节点（交换节点本身而非仅交换值），返回交换后的头节点；节点数为奇数时最后一个保持不动。
示例：输入 1->2->3->4 → 输出 2->1->4->3（1 和 2 互换，3 和 4 互换）。
约束：节点数 0 ~ 100，要求 O(1) 空间，不能只改节点的值。`,
    answer: `## 题意与约束分析
相邻节点成对交换，必须改指针而非改值——改值在节点带额外数据或面试明确要求时不可接受。奇数长度时末尾落单节点保持原位。这是「虚拟头 + 前驱驱动 + 三步指针交换」的模板题，也是 25 题 K 个一组翻转的直接特例（k=2 且不足 k 不处理）。

## 思路推导：从暴力到最优
最朴素的想法是逐对处理，但每对交换涉及三个指针的改动：前驱指向第二个节点、第二个节点指向第一个、第一个指向下一对的头。指针改名顺序一旦错乱就会成环或断链，所以必须画图。结构观察：每一对的处理完全独立，处理完一对后「上一对的第二个节点」自然成为「下一对的前驱」，于是只需维护一个 pre 指针滚动前进。循环继续的条件是 pre 之后至少还有两个节点，即 pre.Next != nil && pre.Next.Next != nil——这个条件同时覆盖了空链表、单节点和奇数长度落单三种边界。用 dummy 作为初始 pre，头节点交换（第一对）与其他对逻辑统一。

## 正确性要点
- 每轮迭代不变式：pre 指向「下一对待交换节点的前驱」，pre 之前的部分已完成交换且指针全部正确。
- 交换三步的原子顺序：设 a=pre.Next、b=a.Next，执行 a.Next = b.Next（a 接上下一对的头）、b.Next = a（b 指向 a）、pre.Next = b（前驱接上 b）。三步完成后 [b, a] 顺序正确且与前后接口衔接。
- 终止性：每轮 pre 前进两个节点位置，链长有限故循环必终止；退出时剩余节点数 0 或 1，均不需处理。

## 复杂度分析
- 时间：O(n) —— 每对节点常数次指针操作，共 n/2 对
- 空间：O(1)，只用到 pre、a、b 三个指针

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }
func swapPairs(head *ListNode) *ListNode {
	dummy := &ListNode{Next: head}
	pre := dummy // pre 是每对待交换节点的前驱
	for pre.Next != nil && pre.Next.Next != nil {
		a := pre.Next     // 对中第一个节点
		b := a.Next       // 对中第二个节点
		a.Next = b.Next   // 1. a 接上下一对的头（先动 a，防止丢链）
		b.Next = a        // 2. b 指向 a，完成对内反转
		pre.Next = b      // 3. 前驱接上 b，完成与外部的衔接
		pre = a           // a 成为下一对的前驱
	}
	return dummy.Next
}
\`\`\`

## 边界与易错点
- 空链表 / 单节点：循环条件两个判空直接挡住，返回原样。
- 奇数长度：最后一轮 pre.Next.Next 为 nil，落单节点不动，正确。
- 指针顺序错误：先写 pre.Next = b 再写 a.Next = b.Next 时，b.Next 尚未改所以碰巧还能对，但若先写 b.Next = a 再写 a.Next = b.Next 就会读到已被污染的 b.Next 造成自环——必须先保存或按「先远端后近端」的顺序改。
- 忘记 pre = a 滚动：pre 停在原地，同一对会被重复交换造成死循环。

## 举一反三
- LeetCode 25 K 个一组翻转链表：本题的一般化，k=2 即本题；25 题需要额外处理「不足 k 不翻转」和段间拼接。
- LeetCode 92 反转链表 II：区间反转的特例感——本题等价于对每对做长度为 2 的区间反转。
- LeetCode 61 旋转链表：分段重接的另一变体，同样靠前驱指针驱动。
- 识别信号：「按固定长度对链表分段做局部变换」→ 维护段前驱 pre，段内操作，pre 滚动到上一段的尾。

## 实际工程应用
成对交换是数据重排的原语之一：音频处理中立体声左右声道样本的就地交换（interleave/deinterleave）、网络协议中字节序转换在链式缓冲上的实现，都是同一「相邻成对重排」模型。它更是面试中检验「指针改名顺序纪律」的试金石——能一次写对三步顺序的人，写 25 题通常也不会翻车。`,
    keyPoints: [
      "三步交换顺序：a.Next = b.Next → b.Next = a → pre.Next = b，先接远端再接近端，任何乱序都可能成环",
      "循环条件 pre.Next != nil && pre.Next.Next != nil 一个表达式覆盖空链、单节点、奇数落单三种边界",
      "pre 滚动规则：处理完一对后 pre = a（原第一个节点现为第二个，恰是下一对的前驱）",
      "本题是 k=2 的 LeetCode 25，把「段」抽象出来是通向 25 的桥梁",
    ],
    followUps: [
      "用递归怎么写？（先递归交换 head.Next.Next 之后的部分，再交换当前对，栈空间 O(n)）",
      "三个一组交换呢？（即 25 题 k=3，需要段内反转而非简单交换）",
      "如果链表带环，本算法会怎样？（pre 永远到不了尾部，死循环——所以判环是所有链表遍历的前置安全检查）",
    ],
    favorited: false,
  },
  {
    id: "algo-25",
    nodeId: "p1-linkedlist",
    question: `8. K 个一组翻转链表（LeetCode 25）
题意：给定单链表和正整数 k，每 k 个节点为一组进行翻转；不足 k 个的剩余节点保持原顺序不变。
示例：输入 1->2->3->4->5, k=3 → 输出 3->2->1->4->5（前三节点翻转，剩余两个不足 k 不动）。
约束：节点数 1 ~ 5000，1 ≤ k ≤ 节点数；要求 O(1) 空间。`,
    answer: `## 题意与约束分析
206 整链反转的分段批量版：每 k 个节点为一段独立反转，段间保持顺序，尾段不足 k 不处理。O(1) 空间排除了递归（栈深 O(n/k)）。难点有三：判断剩余是否够 k 个、段内反转、段与段之间的无缝拼接。

## 思路推导：从暴力到最优
暴力思路是把每段读入数组反转再重建，空间 O(k) 且破坏节点，直接放弃。结构观察：本题 = 24 题的一般化，仍可用「段前驱 pre 驱动」框架，只是段内操作从「交换一对」变成「反转 k 个节点」。流程：每轮先用一个探测指针从 pre 走 k 步确认段完整（走不到 k 步说明是尾段，直接结束）；然后对 [pre.Next, tail] 这一段调用反转子函数（206 的逻辑限定 k 步）；最后把段接回主链——pre.Next 接新段头，新段尾接下一段的头。关键简化：反转后原段头变成新段尾，恰好成为下一段的前驱，pre 直接滚到它身上。O(n) 的证明要点是「每个节点恰好被反转一次」。

## 正确性要点
- 复杂度证明：每个节点只属于一个段，只在所属段的反转中被访问常数次（摘链 + 改指针各一次），段探测指针总移动不超过 n 步，故总操作数 O(n)，均摊到每个节点是 O(1)。
- 拼接正确性：反转子函数返回新段头 segHead 与新段尾 segTail（即原段头）；pre.Next = segHead 衔接前段，segTail.Next = next（下一段原头）衔接后段，四个接口指针全部覆盖。
- 尾段处理：探测循环中 tail 为 nil 即不足 k 个，直接返回，尾段未被触碰，顺序保持。

## 复杂度分析
- 时间：O(n) —— 每节点恰好反转一次，探测总步数不超过 n
- 空间：O(1) —— 只用固定指针，对比递归实现的 O(n/k) 栈

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }
func reverseKGroup(head *ListNode, k int) *ListNode {
	dummy := &ListNode{Next: head}
	pre := dummy // 当前待处理段的前驱（哨兵）
	for {
		// 第一步：探测剩余是否够 k 个，tail 落在本段尾
		tail := pre
		for i := 0; i < k; i++ {
			tail = tail.Next
			if tail == nil {
				return dummy.Next // 不足 k 个，保持原样直接结束
			}
		}
		next := tail.Next // 暂存下一段的头
		// 第二步：反转本段 [pre.Next, tail]
		segHead, segTail := reverseK(pre.Next, k)
		// 第三步：接回主链
		pre.Next = segHead
		segTail.Next = next
		pre = segTail // 滚到下一段的前驱
	}
}

// reverseK 反转从 head 开始的 k 个节点，返回新头与新尾
func reverseK(head *ListNode, k int) (*ListNode, *ListNode) {
	var prev *ListNode
	cur := head
	for i := 0; i < k; i++ {
		next := cur.Next
		cur.Next = prev
		prev = cur
		cur = next
	}
	return prev, head // 原头 head 成为新尾
}
\`\`\`

## 边界与易错点
- k=1：每段长 1，反转无效果，探测每轮走 1 步，正确退化为原样遍历。
- k 恰好等于链长：一轮完整反转后 next 为 nil，segTail.Next = nil 正确收尾，下一轮探测立即返回。
- 忘记暂存 next 就反转：反转把段尾 tail.Next 改成 prev，下一段的头丢失，主链断裂。
- pre 滚错位置：必须滚到 segTail（原段头），若滚到 segHead 则下一段的 pre.Next 指向已反转段内部，结构错乱。

## 举一反三
- LeetCode 24 两两交换：k=2 的特例，段内操作简化成三步交换。
- LeetCode 206 反转链表：k = n 的特例，只有一段。
- LeetCode 92 反转链表 II：只有中间一段需要反转，拼接思想一致。
- LeetCode 61 旋转链表：「切段 + 重接」的另一变体，k=n-旋转位数。
- 识别信号：「按固定步长分段，每段做局部变换」→ 段前驱哨兵 + 段内复用基础算法 + 四指针拼接。

## 实际工程应用
分段就地重排是流式数据处理的常见需求：音视频编码中按 GOP（画面组）重排帧缓冲区、数据库页内记录按块逆序整理、SIMD 指令的分块洗牌（shuffle）在概念上都是「k 个一组的就地变换」。本题「探测 + 段内反转 + 拼接」的三段式框架也是处理链式缓冲区分块操作的标准工程模式。`,
    keyPoints: [
      "O(n) 证明的核心：每个节点只在所属段被反转一次，探测指针总步数 ≤ n，均摊每节点 O(1)",
      "段前驱哨兵 pre + 反转后 pre = 原段头（现段尾），是自驱动的段间推进机制",
      "反转前必须暂存 tail.Next，否则段尾指针被改写后下一段头丢失",
      "先探测够 k 个再动手，保证「不足 k 不动」的语义无需任何回滚",
    ],
    followUps: [
      "如果要求不足 k 的尾段也翻转呢？（去掉探测的提前返回，尾段直接反转即可——这其实是某些公司的变体题）",
      "递归实现的空间复杂度是多少？（每段一层递归，O(n/k) 栈深，k=1 时退化为 O(n)）",
      "双向链表下段内反转要改多少指针？（每节点两条，但「探测 + 拼接」框架不变）",
    ],
    favorited: false,
  },
  {
    id: "algo-138",
    nodeId: "p1-linkedlist",
    question: `9. 随机链表的复制（LeetCode 138）
题意：给定一个链表，每个节点除了 Next 外还有一个 Random 指针，可指向链表中任意节点或 nil。请深拷贝该链表并返回新链表头节点，新链表与原链表完全独立。
示例：输入 [[7,null],[13,0],[11,4],[10,2],[1,0]] → 输出结构相同但节点全新的链表（Random 指向新链表中对应位置的节点）。
约束：节点数 0 ~ 1000，-10^4 ≤ 节点值 ≤ 10^4；要求 Random 指针映射正确。`,
    answer: `## 题意与约束分析
深拷贝带随机指针的链表。难点不在 Next（顺序复制即可），而在 Random：复制节点 A 时，A.Random 指向的节点可能还没被创建，无法直接接线。需要一种机制把「原节点 → 新节点」的对应关系维护起来，经典解法是哈希表；进阶是 O(1) 空间的原地三步法。

## 思路推导：从暴力到最优
第一直觉是哈希表：第一遍遍历创建所有新节点并建立 原节点→新节点 的映射；第二遍遍历补全 Next 和 Random——通过映射表，cur.Random 的新对应者就是 map[cur.Random]，不管它指向哪里都能 O(1) 查到。时间 O(n)、空间 O(n)。如何省掉哈希表？关键观察：如果新节点就「贴着」原节点放（交织成 A→A'→B→B'→C→C'），那么 原节点.Random.Next 恰好就是 新节点.Random 应指向的目标——映射关系被链表结构本身编码了，不再需要外部存储。于是三步法：第一步交织复制节点；第二步接 Random（拷贝节点的 Random = 原节点 Random 的后一个）；第三步把两条链拆分开并恢复原链。

## 正确性要点
- 哈希表法：映射在接 Random 之前已覆盖全部节点，故任意指向关系都能查到；查 nil 时 map 返回零值 nil，Random 为空的语义自动正确。
- 三步法的接线正确性：交织后，对任意原节点 x，x.Random 若指向 y，则 y 的拷贝 y' 恰为 y.Next（第一步保证），故 x'.Random = x.Random.Next 指向的正是 y'。
- 拆分正确性：第三步沿交织链交替摘出原节点与拷贝节点，恢复原链的 Next 关系（x.Next = x'.Next = 原 x 的原后继），同时把拷贝节点串成新链；归纳可得两条链各自内部顺序与原链一致。

## 复杂度分析
- 时间：两种方法均为 O(n)，三步法是三趟常数倍的遍历
- 空间：哈希表法 O(n)；三步法 O(1)（不计返回的新链表本身）

## 代码实现
\`\`\`go
// Node 定义：type Node struct { Val int; Next, Random *Node }

// 方法一：哈希表两遍扫描
func copyRandomList(head *Node) *Node {
	if head == nil {
		return nil
	}
	m := make(map[*Node]*Node) // 原节点 -> 新节点
	for cur := head; cur != nil; cur = cur.Next {
		m[cur] = &Node{Val: cur.Val}
	}
	for cur := head; cur != nil; cur = cur.Next {
		m[cur].Next = m[cur.Next]     // nil 查表得零值 nil，天然正确
		m[cur].Random = m[cur.Random]
	}
	return m[head]
}

// 方法二：原地三步法，O(1) 额外空间
func copyRandomListO1(head *Node) *Node {
	if head == nil {
		return nil
	}
	// 第一步：每个原节点后插入其拷贝，A->A'->B->B'
	for cur := head; cur != nil; {
		cp := &Node{Val: cur.Val, Next: cur.Next}
		cur.Next = cp
		cur = cp.Next
	}
	// 第二步：接 Random，拷贝节点的 Random = 原 Random 的后一个
	for cur := head; cur != nil; cur = cur.Next.Next {
		if cur.Random != nil {
			cur.Next.Random = cur.Random.Next
		}
	}
	// 第三步：拆分两条链，同时恢复原链
	dummy := &Node{}
	tail := dummy
	for cur := head; cur != nil; {
		cp := cur.Next
		tail.Next = cp
		tail = cp
		cur.Next = cp.Next // 恢复原链的 Next
		cur = cp.Next
	}
	return dummy.Next
}
\`\`\`

## 边界与易错点
- 空链表：两种方法开头都判 nil，直接返回 nil。
- Random 指向自身：哈希表中 m[cur].Random = m[cur] 正确；三步法中 cur.Next.Random = cur.Next（自身拷贝）也正确。
- Random 为 nil：哈希表查 nil 返回零值 nil；三步法必须判 cur.Random != nil 否则 nil.Next 空指针——这是三步法最常见的崩溃点。
- 三步法忘记恢复原链：交作业时原链表被改得面目全非，「不修改输入」的隐性要求被破坏。

## 举一反三
- LeetCode 133 克隆图：同样的「原→新」映射问题，从链表升级到图，哈希表 + DFS/BFS。
- LeetCode 1485 克隆含随机指针的二叉树：同一思想的树版。
- LeetCode 117 填充每个节点的下一个右侧节点指针 II：也有 O(1) 空间的「利用已建立的指针当下一次映射」技巧，与三步法思想相通。
- 识别信号：「深拷贝 + 非顺序引用」→ 先想哈希表映射；追问 O(1) 空间时想「能否把新节点嵌进原结构里编码映射」。

## 实际工程应用
深拷贝带交叉引用的对象图是序列化框架的核心问题：Protobuf/Java 序列化在还原对象网络时用 ID 表做「原引用 → 新对象」映射，即哈希表法的工业化版本。ORM 的实体深拷贝、编辑器撤销系统中的文档快照、分布式系统的状态机日志重放复制，本质都是同一个「任意引用图的克隆」问题。三步法则展示了空间受限场景下「用结构自身编码映射」的巧思。`,
    keyPoints: [
      "核心矛盾：复制节点时其 Random 目标可能尚未创建，必须先建全量映射再接线",
      "哈希表法 nil 语义免费正确：map 查 nil 键/缺失键都返回零值 nil",
      "三步法的本质：用交织结构把「原→新」映射编码进链表自身，省掉 O(n) 哈希表",
      "三步法判空纪律：接 Random 前必须 cur.Random != nil，否则 nil.Next 崩溃",
    ],
    followUps: [
      "三步法为什么必须恢复原链表？不恢复行不行？（会破坏调用方持有的输入引用，工程上不可接受）",
      "如果链表带环，两种方法还正确吗？（都正确：哈希表第一遍会死循环——需先判环；三步法同理，所以输入默认无环）",
      "克隆图（133 题）为什么不能用三步法？（图没有「每个节点后插一个」的线性结构可依托，映射无处编码）",
    ],
    favorited: false,
  },
  {
    id: "algo-148",
    nodeId: "p1-linkedlist",
    question: `10. 排序链表（LeetCode 148）
题意：给定单链表头节点 head，将其按升序排序并返回。
示例：输入 4->2->1->3 → 输出 1->2->3->4（升序重排节点）。
约束：节点数 0 ~ 5×10^4，要求 O(n log n) 时间；进阶要求 O(1) 空间。`,
    answer: `## 题意与约束分析
给链表排序。数组排序的三巨头里：快排依赖随机访问、堆排依赖下标寻址，都不适合链表；归并排序只需要顺序遍历和合并，天然契合链表结构。O(n log n) 时间 + O(1) 空间的组合要求，把答案锁定为「自底向上迭代归并」；递归归并是 O(log n) 栈空间，作为对照必须掌握。

## 思路推导：从暴力到最优
暴力：值读出到数组排序后重写回链表，O(n log n) 但破坏节点且空间 O(n)，面试直接判负。观察链表结构：唯一能高效做的就是顺序扫描和指针重接。归并排序的 merge 过程恰好只需顺序扫描（21 题已解决），而「分」对链表来说不用下标——用快慢指针找中点再断开即可。递归版（自顶向下）：找中点、断开、左右各自递归、merge，栈深 O(log n)。要 O(1) 空间就改为自底向上：步长 step 从 1 开始翻倍，每轮把链表切成若干对长度为 step 的有序段两两归并，step ≥ n 时整体有序。找中点用快慢指针：fast 走 2 步 slow 走 1 步，fast 到底时 slow 在中点偏左，从 slow 处断开。

## 正确性要点
- 归并正确性：merge 子过程即 21 题，已证。递归版由归纳法：左右半链各自有序则合并后整链有序，基例单节点天然有序。
- 自底向上正确性：循环不变式为「第 k 轮结束后，链表由若干长度 ≤ 2^k 的有序段顺次拼接而成」。k=0 时每个节点自成有序段；每轮把相邻两对有序段归并为一段，段长上限翻倍，故不变式保持。step ≥ n 时只剩一段，整体有序。轮数 ⌈log n⌉，每轮 O(n)，总 O(n log n)。
- 找中点正确性：fast 初始为 head.Next（而非 head）使 slow 停在中点偏左，保证偶数长度时左段严格较短，断开点正确。

## 复杂度分析
- 时间：O(n log n) —— 归并层数 ⌈log n⌉，每层总比较 O(n)；对比暴力重排的 O(n log n) + O(n) 额外空间
- 空间：自底向上 O(1)；递归版 O(log n) 调用栈

## 代码实现
\`\`\`go
// ListNode 定义：type ListNode struct { Val int; Next *ListNode }

// 递归版：自顶向下归并
func sortList(head *ListNode) *ListNode {
	if head == nil || head.Next == nil {
		return head // 基例：空或单节点天然有序
	}
	// 快慢指针找中点：fast 先走一步使 slow 停在中点偏左
	slow, fast := head, head.Next
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
	}
	mid := slow.Next
	slow.Next = nil // 断成左右两段
	return merge(sortList(head), sortList(mid))
}

// 自底向上版：O(1) 空间
func sortListBottomUp(head *ListNode) *ListNode {
	n := 0
	for cur := head; cur != nil; cur = cur.Next {
		n++
	}
	dummy := &ListNode{Next: head}
	for step := 1; step < n; step *= 2 {
		pre := dummy      // 已归并区间的尾
		cur := dummy.Next // 待处理起点
		for cur != nil {
			// 切第一段，长 step
			h1 := cur
			i := 1
			for i < step && cur.Next != nil {
				cur = cur.Next
				i++
			}
			h2 := cur.Next // 第二段头
			cur.Next = nil // 切断第一段
			// 切第二段，长 step（可能不足）
			cur = h2
			i = 1
			for i < step && cur != nil && cur.Next != nil {
				cur = cur.Next
				i++
			}
			var next *ListNode
			if cur != nil {
				next = cur.Next
				cur.Next = nil // 切断第二段
			}
			pre.Next = merge(h1, h2) // 归并接回
			for pre.Next != nil {
				pre = pre.Next // pre 滚到归并段尾
			}
			cur = next
		}
	}
	return dummy.Next
}

// merge：21 题两路归并
func merge(l1, l2 *ListNode) *ListNode {
	d := &ListNode{}
	t := d
	for l1 != nil && l2 != nil {
		if l1.Val <= l2.Val {
			t.Next = l1
			l1 = l1.Next
		} else {
			t.Next = l2
			l2 = l2.Next
		}
		t = t.Next
	}
	if l1 != nil {
		t.Next = l1
	} else {
		t.Next = l2
	}
	return d.Next
}
\`\`\`

## 边界与易错点
- 空链表 / 单节点：递归版基例直接返回；迭代版 n ≤ 1 时外循环不执行，原样返回。
- 找中点时 fast 从 head 出发：偶数长度 slow 会停在中点偏右，导致左段包含 mid，断开后左右递归规模不减，可能死循环——必须 fast = head.Next。
- 自底向上忘记 pre 滚到段尾：下一轮归并会接在段头而非段尾，链表结构错乱。
- 第二段不足 step 时 cur 为 nil：取 next 前必须判空，否则空指针。

## 举一反三
- LeetCode 21 合并两个有序链表：本题的 merge 子过程，底座必须先会。
- LeetCode 23 合并 K 个升序链表：分治归并的 K 路推广。
- LeetCode 147 对链表进行插入排序：O(n^2) 对照组，用来回答「为什么不用插排」。
- LeetCode 912 排序数组：数组上归并 vs 快排的对比，帮你说清「为什么链表选归并」。
- 识别信号：「链表 + 排序 + 低空间要求」→ 归并；「要求 O(1) 空间」→ 自底向上迭代。

## 实际工程应用
归并排序是外部排序的唯一选择：数据库 ORDER BY 超内存时把数据分块排序落盘再多路归并；MapReduce 的 shuffle 阶段本质就是大规模归并。链表归并在流式场景也有对应物：合并多个已排序的日志流、时间序列数据库的 compaction。自底向上的迭代归并还避免了深递归栈，是嵌入式与内核态代码（不允许深栈）排序链表的标准实现。`,
    keyPoints: [
      "链表排序选归并的根本原因：归并只需顺序访问，快排/堆排依赖随机访问，链表给不了",
      "找中点 fast 必须从 head.Next 出发，slow 才停在中点偏左，保证断开后两边规模严格递减",
      "自底向上把递归的 O(log n) 栈换成固定的步长翻倍循环，空间压到 O(1)",
      "不变式：第 k 轮后链表由长度 ≤ 2^k 的有序段顺次拼接，step ≥ n 时收敛",
    ],
    followUps: [
      "为什么递归版在 5×10^4 数据下能过，到 10^6 就危险了？（栈深 log n 本身没问题，但每帧开销 × 递归常数在极端深度下有栈溢出风险，工程上选迭代）",
      "链表快排可行吗？复杂度多少？（可行，partition 用三条链分装，平均 O(n log n) 最坏 O(n^2)，工程不选）",
      "自底向上版的 merge 次数精确是多少？（每轮约 n/(2·step) 次，逐轮减半，总比较次数与递归版同阶）",
    ],
    favorited: false,
  },
];
