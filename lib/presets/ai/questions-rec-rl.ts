// lib/presets/ai/questions-rec-rl.ts
// AI 算法工程师面试题：推荐系统 + 强化学习（5 节点 × 8 题 = 40 题）
// 从 lib/presets/ai.ts 拆分而来；2026-07 全量重写为策展级深度答案
// 每题结构：分层原理 → 实际案例 → 举一反三 → 扣分点对照 → 代码 → 踩坑

import type { Question } from "../../types";

export const REC_RL_QUESTIONS: Question[] = [
  // ===== ai-rec-fundamentals =====

  {
    id: "ai-147",
    nodeId: "ai-rec-fundamentals",
    question: "协同过滤 UserCF vs ItemCF 原理？适用场景？",
    answer: `【分层原理】结论：UserCF 推荐"与你相似的人喜欢的物品"，ItemCF 推荐"与你喜欢物品相似的物品"，工业界用户量过亿后几乎都用 ItemCF。第一层：UserCF 在用户-物品交互矩阵上算用户间余弦/Jaccard 相似度，取 TopK 相似用户的交互物品加权打分；第二层：ItemCF 算物品共现相似度 sim(i,j)=|N(i)∩N(j)|/√(|N(i)||N(j)|)，可离线天级预计算；第三层为什么选 ItemCF：用户量 U 远大于物品量 I，UserCF 相似矩阵 O(U²) 存不下且用户兴趣漂移快需频繁重算，物品语义稳定、相似表可复用，还自带可解释性（"因为你看过 X"）；第四层：共现矩阵对热门物品有偏置（爆款与万物共现），需热度惩罚 1/log(1+|N(i)|) 或归一化。

【实际案例】今日头条 2014-2016 年用 UserCF 做新闻召回：新闻时效强、兴趣快变，UserCF 能借群体行为把热点新闻实时扩散出去，支撑早期 DAU 从百万到五千万的增长；用户破亿后相似度矩阵存储爆炸，切换为 ItemCF+双塔多路召回。淘宝猜你喜欢用 ItemCF 日更十亿级物品相似表，大促峰值 QPS 30 万+ 召回延迟 <10ms；早期爆款霸屏导致长尾商品曝光占比仅 8%，引入热度惩罚+时间衰减（近期共现权重高）后长尾曝光占比升到 23%，GMV 提升约 4%。

【举一反三】短视频"同好人群扩散"本质是 UserCF 思想，"相关视频"是 ItemCF；广告 lookalike 人群扩展=以种子用户做 UserCF；内容社区可用 UserCF 做关注推荐、ItemCF 做相关笔记。

【扣分点对照】背八股的只说"一个找相似用户一个找相似物品"；真做过的能讲清 O(U²) 存储在亿级用户下为何不可行、热度惩罚公式怎么推、Swing 相比余弦如何解决"无关共现"（两个用户因都买爆款被误判相似）。

\`\`\`python
import numpy as np
# ItemCF 物品相似度（带热度惩罚）
cooccur = user_item.T @ user_item          # 物品共现矩阵
pop = user_item.sum(0)                     # 各物品热度
sim = cooccur / np.sqrt(np.outer(pop, pop) + 1e-9)
sim /= np.log1p(pop)[None, :]              # 打压热门物品的"泛相似"
def recommend(user, k=10):
    seen = user_item[user].nonzero()[0]
    score = sim[seen].sum(0)               # 历史物品加权聚合
    score[seen] = -np.inf                  # 过滤已交互
    return score.argsort()[::-1][:k]
\`\`\`

踩坑：①稀疏数据下相似度方差极大，必须设最小共现阈值（如 ≥3）否则推荐噪声；②只算余弦不打压热门，推荐结果全是爆款、长尾饿死；③用户新行为不近线回写共现矩阵，推荐滞后一天，新闻场景直接不可用。`,
    keyPoints: ["UserCF 相似用户，ItemCF 相似物品", "ItemCF 可离线预计算，工业主流", "热度惩罚+时间衰减防爆款霸屏", "Swing 惩罚无关共现"],
    followUps: ["Swing 算法相对余弦相似度解决了什么问题？（提示：两个用户只因共买爆款而相似，需惩罚共现对中用户相似度的贡献）", "用户量 10 亿时 UserCF 为什么不可行？（提示：O(U²) 相似矩阵存储与更新成本）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-148",
    nodeId: "ai-rec-fundamentals",
    question: "矩阵分解（SVD/ALS）推荐原理？隐因子如何学？",
    answer: `【分层原理】结论：矩阵分解把稀疏评分矩阵 R(m×n) 分解为 P(m×k)Q(n×k)^T，用 k 维隐因子表达用户兴趣和物品属性，泛化能力远超共现统计。第一层：纯 SVD 要求矩阵稠密，推荐场景 99% 缺失，实际用 FunkSVD——只对观测项最小化 (r_ui - p_u·q_i)² + λ(||p_u||²+||q_i||²)，SGD 逐样本更新；第二层：ALS 固定 Q 时 P 的每行有闭式解 p_u=(Q^TQ+λI)^{-1}Q^Tr_u，交替求解可并行，Spark MLlib 标配；第三层：隐式反馈没有"不喜欢"，Hu 的 WMF 方案把交互转置信度 c=1+αr、偏好 p=1{交互过}，ALS 闭式解仍成立；第四层：k 控制表达能力，通常 32-256，k 过大会记住噪声。

【实际案例】Netflix Prize 2009 年获奖方案核心是矩阵分解家族（SVD++/timeSVD 融合），把 RMSE 从 0.95 降到 0.856，证明隐因子能捕捉"用户-题材"潜在维度。阿里早期推荐用 Spark ALS 做隐式反馈召回：点击 c=1+α、购买权重更高，十亿级交互 20 轮交替训练约 2 小时；上线后发现新物品隐向量随机、永远召不回，迭代动作是物品冷启时先用内容特征回归出初始 q_i 再在线微调，新品首日曝光提升 3 倍，召回贡献占比从 0 升到 12%。

【举一反三】广告场景把"用户×广告"分解得隐向量可做人群定向；视频平台把观看时长当置信度权重（看 90% vs 看 5% 置信度差一个量级）；知识图谱缺失关系预测（TransE 之前）本质也是矩阵分解。

【扣分点对照】背八股的会背"R≈PQ^T"；真做过的能讲清为什么不能直接 SVD（缺失项当 0 会把未交互学成不喜欢）、隐式反馈置信度怎么设计、ALS 为什么比 SGD 更适合分布式（每行独立可并行、无学习率调参）。

\`\`\`python
import numpy as np
def als_implicit(C, k=64, lam=0.1, iters=15):
    # C: 置信度矩阵, P: 0/1 偏好矩阵 (Hu et al. 2008)
    m, n = C.shape
    X = np.random.rand(m, k) * 0.01
    Y = np.random.rand(n, k) * 0.01
    for _ in range(iters):
        YtY = Y.T @ Y
        for u in range(m):
            Cu = np.diag(C[u])              # 用户置信度对角阵
            A = YtY + Y.T @ (Cu - np.eye(n)) @ Y + lam * np.eye(k)
            X[u] = np.linalg.solve(A, Y.T @ Cu @ P[u])
        X, Y = Y, X  # 对称交替（伪码示意，实际分别更新）
    return X, Y
\`\`\`

踩坑：①把缺失当 0 训练，模型学会"不推荐一切"，AUC 看似不低但推荐全崩；②隐式反馈不加置信度，看 1 秒和看 1 小时等权；③k 盲目调大，离线 RMSE 降、线上 CTR 反降——过拟合历史兴趣丧失探索能力。`,
    keyPoints: ["FunkSVD 只拟合观测项", "ALS 交替闭式解可并行", "隐式反馈用置信度加权（WMF）", "k 控制泛化与记忆平衡"],
    followUps: ["为什么推荐场景不能直接用经典 SVD？（提示：缺失项占 99%，当 0 训练会把未交互学成负样本）", "BPR 与 ALS 的目标差异？（提示：BPR 优化相对排序 AUC，ALS 回归绝对置信度）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-149",
    nodeId: "ai-rec-fundamentals",
    question: "召回-排序双塔架构？多路召回如何融合？",
    answer: `【分层原理】结论：推荐是漏斗系统——召回从亿级库筛千级（重覆盖、轻精度），排序对千级精排（重精度、可复杂模型），双塔是召回主力结构。第一层：双塔把 user 特征和 item 特征分别过 DNN 得向量 u、v，训练用 sampled softmax/InfoNCE 让正样本对内积最大，线上 item 侧向量离线灌入 Faiss/Milvus，请求时 ANN 检索 TopK，把"全库打分"变成 O(log N) 近邻搜索；第二层：双塔结构限制了两塔只能在最后点积，无法做特征交叉，所以精度上限低于精排模型——这正是"召回求快求全、精排求准"的分工根源；第三层：多路召回（双塔/ItemCF/图/标签/地理）并行，各路去重后按配额或归一化分数合并；第四层：粗排用轻量模型（双塔加交叉或小型 MLP）把千级压到百级，桥接召回与精排目标差异。

【实际案例】抖音召回层 20+ 路并行：双塔（实时兴趣向量）、ItemCF 序列召回、图召回、同城、关注、热点等，融合后约 3000 候选进粗排、500 进精排 DIN 族模型。一次典型迭代：双塔召回占比过高（70%）导致信息茧房投诉上升，动作是给非双塔路数设最低配额（每路保底 50 条）并在融合分数上加路数间归一化（各路分数除各自均值），结果次日留存 +0.3%，双塔占比降到 45% 且 CTR 不降。阿里则公开过用"向量召回+图召回"互补：图召回贡献了 25% 的双塔覆盖不到的新奇商品点击。

【举一反三】搜索广告召回同理：Query 塔+广告塔；本地生活用"地理围栏"作为一路强召回；内容社区把"关注作者新文"作为高优先级保底路。决策模型：新增一路召回前先问"它带来了哪路给不了的覆盖率"。

【扣分点对照】背八股的会画"召回→排序"两个框；真做过的能讲清双塔为什么不能上交叉特征（item 侧要离线预算）、sampled softmax 的采样分布为什么要按热度^0.75 修正、多路融合为什么必须配额制而不是纯分数排序（分数不可比）。

\`\`\`python
import torch, torch.nn.functional as F
# 双塔训练：InfoNCE 对比损失
u = user_tower(user_feat)                  # (B, d)
v = item_tower(item_feat)                  # (B, d) 正样本
neg = item_tower(neg_feat)                 # (B, N, d) 负采样
u, v = F.normalize(u), F.normalize(v)
logits_pos = (u * v).sum(-1, keepdim=True) / tau
logits_neg = torch.einsum("bd,bnd->bn", u, F.normalize(neg)) / tau
loss = F.cross_entropy(
    torch.cat([logits_pos, logits_neg], 1),
    torch.zeros(len(u), dtype=torch.long)) # 正样本是第 0 类
# 线上：item 库向量灌 Faiss，u 向量 ANN 检索 TopK
\`\`\`

踩坑：①负采样只用 batch 内负例，热门物品被过度打压——需按热度^0.75 采样并 log-uniform 修正；②双塔线上向量版本不一致（user 塔热更、item 塔日更）导致点积错位，需版本号对齐；③各路召回直接按原始分数合并，量纲不同导致某一路屠榜。`,
    keyPoints: ["双塔 ANN 把全库打分变近邻检索", "召回重覆盖、精排重精度", "多路并行+配额融合防一路屠榜", "sampled softmax 需热度修正"],
    followUps: ["双塔为什么做不了特征交叉，怎么缓解？（提示：item 侧需离线预计算；可后期加浅层交叉或 SENet 门控）", "粗排存在的意义是什么？（提示：精排模型打 3000 个候选延迟不可接受，需轻量模型桥接）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-150",
    nodeId: "ai-rec-fundamentals",
    question: "冷启动问题（用户/物品/系统冷启动）如何解决？",
    answer: `【分层原理】结论：冷启动本质是"行为数据缺失时用先验信息补位"——用户冷启用注册画像与热门兜底，物品冷启用内容特征对齐，系统冷启用规则与编辑。第一层：新用户零行为，可用人口属性分桶（同年龄同性别人群的热门）、注册兴趣标签、设备/渠道先验，首刷后立刻切入实时行为；第二层：新物品零交互，用标题/封面/类目经内容编码器得到 embedding，做内容相似召回，或进探索流量池买量测真实 CTR；第三层：Bandit（UCB/汤普森采样）把冷启形式化为"探索未知臂 vs 利用已知臂"，给出理论最优的探索预算；第四层：跨域迁移（如淘宝行为迁移到闲鱼）用 MMD/共享 embedding 把老域兴趣映射到新域，降冷启成本。

【实际案例】抖音新用户冷启链路：注册页选 3+ 兴趣标签→首刷 60% 热门精品池+40% 标签内容→前 10 个视频的完播/划走实时更新兴趣向量，行业公开数据新用户次留从纯热门的 32% 提到该链路的 45%+。拼多多新商品冷启：内容 embedding（标题 BERT+图 CNN）先对齐老品向量做相似召回，同时给 200-500 保底曝光进探索池，真实 CTR 达标转正式分发；早期纯靠探索池导致商家新品 7 天起量率仅 18%，加内容召回后升到 41%，新品 GMV 占比提升 6 个点。

【举一反三】网约车冷启城市：用相似城市的供需密度模型迁移；招聘推荐新职位：JD 文本 embedding 对齐历史职位；直播间冷启：主播历史片段内容特征+小额付费流量买测。共性决策：先问"有什么先验可用"，再问"探索预算给多少"。

【扣分点对照】背八股的会罗列"热门、标签、内容推荐"；真做过的能讲清新用户前几屏为什么必须混热门（防止标签偏科导致留存崩）、内容 embedding 与行为 embedding 空间不对齐怎么解决（对比学习/映射层）、探索流量的 ROI 怎么算。

\`\`\`python
# 新物品冷启：内容向量对齐行为向量空间
content_emb = text_image_encoder(new_item)     # 内容侧向量
aligned = projector(content_emb)               # 映射到行为 embedding 空间
seed_items = faiss_index.search(aligned, 100)  # 相似老品召回
# Bandit 探索：UCB 给新物品加探索 bonus
bonus = c * np.sqrt(np.log(total_impr) / (item_impr + 1))
final_score = pred_ctr + bonus                 # 新物品天然高 bonus
\`\`\`

踩坑：①新用户首刷全推热门导致兴趣画像建不起来，次日就流失；②内容向量直接和行为向量混排（空间不同），召回质量差；③探索流量无保底机制，新品永远拿不到第一批曝光，马太效应加剧。`,
    keyPoints: ["用户冷启：画像+热门+实时行为切换", "物品冷启：内容 embedding 对齐召回", "Bandit 形式化探索预算", "跨域迁移降冷启成本"],
    followUps: ["内容 embedding 与行为 embedding 空间如何对齐？（提示：投影层/对比学习/以老品行为向量做蒸馏目标）", "新用户首刷为什么不能全推个性化？（提示：无行为时个性化=标签偏科，需热门保留存）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-151",
    nodeId: "ai-rec-fundamentals",
    question: "FM 因子分解机原理？如何做二阶特征交叉？",
    answer: `【分层原理】结论：FM 给每个特征学一个 k 维隐向量 v_i，用内积 ⟨v_i,v_j⟩ 表示二阶交叉权重，把稀疏场景下学不出的交叉变成可学。第一层：LR 加手工二阶交叉 w_ij 有 O(n²) 参数，且"i、j 从没共现过"时 w_ij 永远是 0——推荐场景 90% 特征对无共现，交叉项全废；第二层：FM 把 w_ij 分解为 ⟨v_i,v_j⟩，只要 i 与别人共现过就能学好 v_i，未见组合也能泛化——这是"参数共享解决稀疏"的核心思想；第三层：复杂度优化，ΣΣ⟨v_i,v_j⟩ 用 (Σv)²-Σv² 恒等式从 O(n²k) 降到 O(nk)，可线性时间训练；第四层：FFM 引入 field 概念，每个特征对每个 field 学一个隐向量（n×f×k 参数），表达更细但贵；DeepFM 把 FM 与 DNN 并联共享 embedding，二阶显式+高阶隐式交叉兼得。

【实际案例】腾讯广告早期 CTR 预估用 FFM 在 2015 年前后把 AUC 提升约 1.5 个点（在广告场景对应营收提升数个百分点），成为当年精排标配；美团外卖精排从 GBDT+LR 切 DeepFM 后 CTR 提升 2.1%、下单 CVR 提升 1.8%，其中 FM 部分贡献主要来自"用户×时段""用户×品类"这类稀疏交叉终于被学到。实践中 FM 的 embedding 维度 k 从 8 调到 64，AUC 增益边际递减，多数场景 k=16 性价比最高。

【举一反三】搜索广告 Query 词×广告词的稀疏交叉同理用 FM 思想；风控场景"设备×IP"交叉极稀疏，FM 隐向量可泛化到新设备；多模态场景把图片 tag 当特征进 FM 与行为特征交叉。

【扣分点对照】背八股的会背公式 y=w0+Σwx+ΣΣ⟨vi,vj⟩xixj；真做过的能讲清为什么稀疏场景 LR 交叉学不出来（无共现梯度为零）、O(nk) 化简的恒等式怎么推、FFM 的 field 设计为什么让参数涨 f 倍却仍划算。

\`\`\`python
import torch, torch.nn as nn
class FM(nn.Module):
    def __init__(self, n_feat, k=16):
        super().__init__()
        self.w0 = nn.Parameter(torch.zeros(1))
        self.w = nn.Embedding(n_feat, 1)       # 一阶权重
        self.v = nn.Embedding(n_feat, k)       # 二阶隐向量
    def forward(self, x):                      # x: (B, F) 特征 id
        linear = self.w(x).sum(1).squeeze(-1)
        emb = self.v(x)                        # (B, F, k)
        # (Σv)² - Σv² 恒等式，O(n²k) → O(nk)
        cross = ((emb.sum(1) ** 2 - (emb ** 2).sum(1)).sum(1)) / 2
        return self.w0 + linear + cross
\`\`\`

踩坑：①隐向量不加 L2 正则，长尾特征 embedding 过拟合噪声；②连续特征直接当 id 进 embedding 报错/爆炸，需先分桶离散化；③线上特征 id 与训练不一致（特征穿越），离线 AUC 0.82 线上 0.61。`,
    keyPoints: ["隐向量内积解稀疏交叉", "参数共享可泛化未见组合", "恒等式 O(n²k)→O(nk)", "FFM 分 field 更细，DeepFM 并联 DNN"],
    followUps: ["为什么 LR 的二阶交叉在推荐场景学不出来？（提示：特征对无共现时 w_ij 梯度恒为 0，FM 靠参数共享破局）", "FM 的 embedding 和双塔的 embedding 有何异同？（提示：都是低维稠密表示，FM 为交叉权重服务、双塔为 ANN 检索服务）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-152",
    nodeId: "ai-rec-fundamentals",
    question: "字节抖音推荐召回策略实战？多路召回如何设计？",
    answer: `【分层原理】结论：抖音召回的设计哲学是"多路互补覆盖兴趣全貌，用配额防单路垄断"——双塔扛大梁，序列/图/标签/社交各路补盲区。第一层：双塔召回是主力，用户塔吃实时行为序列（近 100 条播放/完播/点赞）产出兴趣向量，ANN 检索亿级视频库，占召回量 40-60%；第二层：行为序列召回（取用户最近点赞的 N 个视频做 ItemCF 找相似）捕捉"看了这个还会看什么"的强关联；第三层：图召回在用户-视频二部图上做随机游走/PersonalRank，能发现双塔向量近邻覆盖不了的跨圈层内容；第四层：标签召回（用户兴趣 tag 倒排）、同城召回、关注召回、热点召回各补一个维度。各路产出去重后按配额+归一化分融合，进粗排统一打分。

【实际案例】抖音曾遇到"双塔独大"问题：双塔召回占比超 70%，用户反馈"刷来刷去都是一类视频"，留存出现疲态。迭代动作：①新增图召回和"兴趣探索"路（故意推与主兴趣弱相关的新领域），每路保底配额 5-10%；②双塔用户向量从单兴趣升级为多兴趣向量（MIND/ComiRec 思想，一个用户出 4-8 个向量分别检索）；③新视频进探索流量池保底 500 曝光。结果：人均观看时长 +2.4%，30 日留存 +0.5%，长尾视频曝光占比从 15% 升到 28%（数据为公开分享口径量级）。

【举一反三】快手借鉴同样思路但强化"关注关系"一路（老铁经济）；B站召回加重"订阅 UP 主更新"路；电商把"购物车相似商品"作为高转化路。设计决策可复用：先盘点用户兴趣的来源维度（行为/关系/时空/声明），每个维度至少一路。

【扣分点对照】背八股的会背"多路召回融合"；真做过的能讲清为什么必须配额制（各路分数不可比）、双塔多兴趣向量怎么训练（胶囊路由/自注意力聚类）、图召回相对双塔的增量价值怎么量化（overlap 分析）。

\`\`\`python
# 多路召回 + 配额融合
RECALL_QUOTA = {"twin_tower": 500, "itemcf_seq": 200,
                "graph": 150, "tag": 100, "explore": 50}
pool = {}
for name, k in RECALL_QUOTA.items():
    items = recall_fn[name](user)[:k]          # 每路按配额截断
    scores = normalize([s for _, s in items])  # 路内归一化(除均值)
    for (vid, _), s in zip(items, scores):
        pool[vid] = max(pool.get(vid, 0), s)   # 去重取最优分
candidates = sorted(pool, key=pool.get, reverse=True)[:1500]
\`\`\`

踩坑：①路数盲目扩张到 30+，机器成本翻倍但增量覆盖不到 3%——每加一路先做 overlap 分析；②不加配额让双塔分数屠榜，多路形同虚设；③忽略"探索路"，系统越走越窄，长期留存被侵蚀但短期 CTR 看不出来。`,
    keyPoints: ["双塔主力+序列/图/标签/社交补盲", "配额制防单路垄断", "多兴趣向量破信息茧房", "新内容探索池保底曝光"],
    followUps: ["如何量化某一路召回的增量价值？（提示：该路与全集的 overlap、独占候选在精排后的最终曝光占比）", "多兴趣向量相比单向量为什么能破茧房？（提示：单向量是多兴趣的平均，平均后小众兴趣被淹没）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-153",
    nodeId: "ai-rec-fundamentals",
    question: "推荐系统评估指标：CTR/留存/GMV/多样性如何权衡？",
    answer: `【分层原理】结论：离线指标（AUC/GAUC/LogLoss）筛模型，在线指标（CTR/时长/留存/GMV）定生死，多目标用"加权融合+约束满足"权衡。第一层：AUC 衡量全样本排序能力但对头部不准，GAUC 按用户分组算 AUC 再加权平均，更贴近"单个用户内排得好"；第二层：离线 AUC 涨 0.1% 在线 CTR 未必涨——因为离线分布≠在线分布（幸存者偏差），所以必须 A/B 验证；第三层：单一优化 CTR 会推出标题党/擦边内容，短期涨长期留存崩，所以要同时盯"北极星护栏指标"：留存、人均时长、负反馈率；第四层：工程上多目标融合 score=Σw_i·p_i（CTR、完播、点赞、关注加权），或用 PLE 多任务模型+帕累托调权，或用"约束优化"：CTR 最大化 s.t. 负反馈率<阈值。

【实际案例】YouTube 公开案例：早期纯优化点击率导致大量标题党，改为优化"观看时长"后时长指标大涨、标题党自然消亡。抖音的融合分公式的迭代很典型：曾把完播率权重调过高，导致 15 秒以内短视频屠榜、中长视频生态受损，人均时长反而下降；动作是引入"时长分桶内比完播"（与同时长视频比）+ 关注/复访等长期信号加权，结果中长视频供给回升，人均时长 +3%。淘宝大促期间目标函数从 CTR 切换到 GMV=CTR×CVR×客单价，权重随大促阶段（预热/爆发/返场）动态调整。

【举一反三】广告系统权衡：CTR 最大化 vs 用户体验约束（广告加载率上限）；直播推荐：打赏 GMV vs 观看时长；音乐 App：播放完成率 vs 新歌探索率。通用决策模型：先定北极星指标，其余指标做护栏，权重用 A/B 扫参。

【扣分点对照】背八股的会罗列 AUC/NDCG/MAP；真做过的能讲清 GAUC 为什么比 AUC 更适合推荐、离线涨在线不涨的三个根因（分布偏移/工程延迟/指标口径）、融合权重怎么用 A/B 实验网格搜索而不是拍脑袋。

\`\`\`python
import numpy as np
def gauc(labels, preds, user_ids):
    # 按用户分组算 AUC，按曝光数加权
    aucs, weights = [], []
    for u in np.unique(user_ids):
        m = user_ids == u
        if len(np.unique(labels[m])) < 2:      # 该用户全正或全负则跳过
            continue
        aucs.append(roc_auc(labels[m], preds[m]))
        weights.append(m.sum())
    return np.average(aucs, weights=weights)
# 在线多目标融合
score = 1.0*p_ctr + 2.0*p_finish + 3.0*p_follow - 5.0*p_dislike
\`\`\`

踩坑：①AUC 整体很高但头部用户排得差，GAUC 才暴露问题；②只看 CTR 上线，两周后留存跌才发现推了标题党——护栏指标必须同屏监控；③融合权重拍脑袋定，从不扫参，多目标实际是单目标。`,
    keyPoints: ["离线 GAUC 贴近用户内排序", "在线 A/B 定生死", "北极星+护栏指标防短期化", "融合权重 A/B 扫参"],
    followUps: ["离线 AUC 涨、在线 CTR 不涨的三个常见原因？（提示：训练/服务分布偏移、特征延迟、离线标签口径与在线不一致）", "为什么 YouTube 从点击率改优化观看时长？（提示：点击率激励标题党，时长更贴近真实满意度）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-283",
    nodeId: "ai-rec-fundamentals",
    question: "推荐系统的偏差问题（位置偏差/流行度偏差/选择偏差）有哪些？如何纠偏？",
    answer: `【分层原理】结论：推荐日志不是随机样本——曝光由上一代模型决定、点击受展示位置影响、热门物品被过度曝光，直接用日志训练会让偏差自我强化（feedback loop）。第一层：位置偏差——用户点第一位因为"它在第一位"不是因为喜欢，点击日志里 P(click)=P(examine|position)·P(relevant)，解决方法：训练时把位置当特征、推理时位置特征置默认值（pal 框架），或用点击率按位置分桶做 IPW；第二层：流行度偏差——训练数据里热门占 80% 曝光，模型学会推热门，长尾饿死，解决：负采样按热度^0.75、log-uniform 修正 softmax 分母、或因果图上去掉 item 流行度这个混杂因子（PDA 方法）；第三层：选择偏差——只能观察到被曝光物品的反馈，用 IPS（逆倾向得分）给样本加权 w=1/P(曝光)，倾向分用随机流量桶估计。

【实际案例】华为应用市场公开的 pal 框架实践：训练时位置作为特征输入，服务时固定为默认位，离线 AUC +0.4%，线上 CTR +1.2%。YouTube 推荐论文中把"视频曝光位置"和"视频年龄"作为偏差特征单独浅塔输入，主塔学纯相关性，防止模型把"新视频曝光少"学成"新视频质量差"。阿里在猜你喜欢做过 IPS 纠偏实验：用 1% 随机流量估计倾向分，对长尾商品样本加权后，长尾商品点击率提升 9%，整体 GMV +1.1%，但方差变大需要裁剪权重（clip 到 10 以内）。

【举一反三】搜索广告的首位点击虚高同理需位置纠偏；直播推荐中"大主播被推荐→更多人看→更被推荐"是流行度正反馈，需打散；招聘推荐中"只给候选人推过互联网岗位→他只会点互联网"是选择偏差。通用模型：先问"这份日志的生成机制是什么"，再决定纠偏方法。

【扣分点对照】背八股的会说"有位置偏差，加个位置特征"；真做过的能讲清训练和推理时位置特征为什么不对称处理、IPS 权重方差爆炸怎么 clip、随机流量桶为什么是估计倾向分的金标准以及它的流量成本。

\`\`\`python
import numpy as np
# IPS 纠偏：倾向分用随机流量桶估计
propensity = impressions_random / impressions_random.sum()
w = 1.0 / np.maximum(propensity[item_ids], 1e-3)
w = np.clip(w, 0, 10)                        # 防方差爆炸
loss = (bce(pred, click) * w).mean()         # 加权损失
# 位置偏差：训练时位置进浅塔，推理时置默认位
logit = main_tower(u, i) + position_tower(pos)
serving_logit = main_tower(u, i) + position_tower(DEFAULT_POS)
\`\`\`

踩坑：①位置特征训练和推理不一致（推理忘置默认位），等于没纠偏；②IPS 不裁剪权重，个别样本权重 1000+ 主导梯度，训练震荡；③负采样不打压热门，模型 AUC 虚高，上线全是爆款。`,
    keyPoints: ["位置偏差：位置作特征+推理置默认", "流行度偏差：热度修正采样/softmax", "选择偏差：IPS 逆倾向加权", "随机流量桶估倾向分是金标准"],
    followUps: ["IPS 权重为什么容易方差爆炸，工程上怎么处理？（提示：小倾向分样本权重极大；clip、自归一化 SNIPS）", "feedback loop 如何自我强化？（提示：模型推什么用户只能点什么，日志进一步强化原策略，多样性持续坍缩）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-rec-deep =====

  {
    id: "ai-154",
    nodeId: "ai-rec-deep",
    question: "Wide&Deep 原理？记忆与泛化如何结合？",
    answer: `【分层原理】结论：Wide&Deep 用 Wide 线性部分"记忆"高频显式规则、Deep 部分"泛化"到未见组合，联合训练让两者互补。第一层：Wide 侧是 LR+人工交叉特征（如"已安装应用×曝光应用"的叉乘），直接记住"装了抖音的人也装剪映"这种强规则，稀疏二值特征 + FTRL 在线学习；第二层：Deep 侧把高维稀疏 id 转 embedding 过 MLP，学到"相似兴趣用户"的隐含模式，对没出现过的组合也能打分；第三层为什么联合训练而不是集成：联合训练时 Wide 只需补足 Deep 的残差，两边参数互相感知，集成则是各自独立学完整目标，Wide 会学重；第四层：Wide 的痛点是特征工程——交叉特征靠人工设计，覆盖率有限，这正是 DeepFM/DCN 要解决的。

【实际案例】Google Play 2016 年论文原场景：应用推荐，Wide 侧用"用户已装应用×候选应用"叉乘特征，Deep 侧用 embedding+3 层 ReLU MLP，线上 A/B 显示相比纯 Wide（LR 时代）App 获取率 +3.9%，相比纯 Deep +1%。国内美团/百度凤巢早期精排都以此过渡，美团相比 LR 基线 CTR +1.5%；但 Wide 侧交叉特征维护成本随业务膨胀，后来切 DeepFM 自动化二阶交叉。

【举一反三】搜索广告：Wide 记"Query 词×广告"历史共现，Deep 泛化长尾 Query；风控：Wide 记黑白名单规则，Deep 学欺诈泛化。决策：高频规则给 Wide，稀疏长尾交 Deep。

【扣分点对照】背八股的会背"记忆+泛化"两个词；真做过的能讲清为什么联合训练优于两模型集成（残差互补 vs 重复学习）、Wide 侧为什么配 FTRL 而 Deep 侧配 Adam（稀疏特征需要 L1 稀疏化解，稠密参数用自适应 lr）、Wide 特征表线上怎么热更新。

\`\`\`python
import torch, torch.nn as nn
class WideDeep(nn.Module):
    def __init__(self, n_cross, n_id, k=16):
        super().__init__()
        self.wide = nn.Embedding(n_cross, 1)   # 交叉特征线性
        self.emb = nn.Embedding(n_id, k)
        self.deep = nn.Sequential(
            nn.Linear(k * 8, 128), nn.ReLU(),
            nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 1))
    def forward(self, cross_ids, deep_ids):
        w = self.wide(cross_ids).sum(1)        # Wide：记忆
        d = self.deep(self.emb(deep_ids).flatten(1))  # Deep：泛化
        return torch.sigmoid(w.squeeze(-1) + d.squeeze(-1))
# 训练：Wide 用 FTRL(带L1)，Deep 用 Adam，分参数组设优化器
\`\`\`

踩坑：①Wide 交叉特征无限膨胀，哈希冲突导致 AUC 抖动，需配额+重要性淘汰；②Wide/Deep 共用一个优化器和学习率，Wide 收敛慢拖垮整体；③交叉特征线上生成逻辑与离线不一致，离线涨在线跌。`,
    keyPoints: ["Wide 记高频规则，Deep 泛化长尾", "联合训练=残差互补，优于集成", "Wide 配 FTRL，Deep 配 Adam", "交叉特征工程是其最大成本"],
    followUps: ["为什么联合训练比分别训练再融合更好？（提示：联合时 Wide 只学 Deep 的残差，集成会重复学习同一信号）", "Wide&Deep 相比纯 LR 线上收益来自哪里？（提示：Deep 侧对未见组合泛化，长尾 Query/商品的打分质量提升）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-155",
    nodeId: "ai-rec-deep",
    question: "DeepFM 原理？相比 Wide&Deep 改进？",
    answer: `【分层原理】结论：DeepFM 用 FM 替换 Wide&Deep 的人工交叉 Wide 部分，二阶交叉自动化，且 FM 与 DNN 共享同一份 embedding，端到端训练。第一层：Wide&Deep 的 Wide 侧交叉特征靠人工设计，覆盖率受限于工程师经验；FM 用隐向量内积自动学任意二阶交叉，稀疏下也能泛化；第二层：DeepFM 中 FM 的一阶、二阶项和 DNN 的输入共享 embedding 矩阵 V——参数量减半，且 embedding 同时被显式交叉梯度和隐式高阶梯度监督，学得更充分；第三层：DCN 用 Cross 网络 x_{l+1}=x0·x_l^T·w_l+x_l 每层显式升一阶；xDeepFM 用 CIN 做向量级交叉，更强但贵。

【实际案例】DeepFM 由华为诺亚 2017 年提出，Criteo 数据上比 Wide&Deep AUC +0.4-0.8 个点。阿里妈妈广告精排切 DeepFM 后去掉 300+ 人工交叉特征表，线上 CTR +1.2%、RPM +0.8%。美团外卖以 DeepFM 打底、叠加 DIN 序列后 CVR 再 +1.5%——FM 解交叉、DIN 解序列，正交可叠加。k 从 4 扫到 64，k=10-16 性价比拐点明显。

【举一反三】DCN 在风控精排常用（交叉阶数可控可解释）；xDeepFM 适合图像 tag 等向量级交叉；数据量小纯 FM 就够。决策：数据稠密→自动交叉收益大；规则强且稳→保留手工 Wide。

【扣分点对照】背八股的会说"FM+DNN"；真做过的能讲清共享 embedding 的两个收益、DCN Cross 层为什么交叉阶数随层数线性增长（x0 始终参与）。

\`\`\`python
import torch, torch.nn as nn
class DeepFM(nn.Module):
    def __init__(self, n_feat, k=16):
        super().__init__()
        self.w = nn.Embedding(n_feat, 1)       # 一阶
        self.v = nn.Embedding(n_feat, k)       # 共享 embedding
        self.dnn = nn.Sequential(nn.Linear(k*8, 128), nn.ReLU(),
                                 nn.Linear(128, 1))
    def forward(self, x):                      # x: (B, F)
        emb = self.v(x)                        # (B, F, k)
        fm2 = ((emb.sum(1)**2 - (emb**2).sum(1)).sum(1)) / 2
        y = self.w(x).sum(1).squeeze(-1) + fm2 \
            + self.dnn(emb.flatten(1)).squeeze(-1)
        return torch.sigmoid(y)                # FM 二阶 + DNN 高阶
\`\`\`

踩坑：①共享 embedding 维度 k 设太大（64+），FM 部分开始过拟合，AUC 反降；②dense 统计特征不归一化直接拼 DNN，梯度被大数值特征主导；③线上推理 F 个特征全量展开，延迟超标——需 embedding lookup 合并+算子融合。`,
    keyPoints: ["FM 自动二阶交叉替代手工 Wide", "FM 与 DNN 共享 embedding", "DCN 显式逐层升阶交叉", "xDeepFM 向量级 CIN 交叉"],
    followUps: ["共享 embedding 为什么比 FM 和 DNN 各自一份更好？（提示：参数量减半，且 embedding 受显式+隐式两路梯度监督）", "DCN 的 Cross 网络每层如何升一阶？（提示：x_{l+1}=x0·(x_l^T w_l)+b_l+x_l，x0 恒在，阶数随层数线性增长）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-156",
    nodeId: "ai-rec-deep",
    question: "DIN/DIEN 原理？如何用注意力建模用户兴趣序列？",
    answer: `【分层原理】结论：DIN 用"候选广告与历史行为的注意力权重"让兴趣向量随候选变化——同一用户对连衣裙和机械键盘激活完全不同的历史子序列。第一层：传统做法把用户历史行为 embedding 直接 sum/mean pooling 成固定向量，多元兴趣被平均掉，"上周看球鞋、昨天看奶粉"混成一个四不像；第二层：DIN 对序列中每个行为算与候选的相关分 a(e_i, v_a)（外积+MLP），softmax 加权求和得到候选感知的兴趣向量——相关行为权重高，无关被压到近零；第三层：DIN 的 softmax 不归一化（论文用 sum 保留兴趣强度），且引入 Dice 激活和自适应正则；第四层：DIEN 进一步认为兴趣是演化的：用 GRU 把行为序列编码成隐状态序列（兴趣抽取层），再加辅助损失（用下一时刻真实行为做监督防隐层只学拼接），最后 AUGRU（注意力门控 GRU）让与候选相关的演化路径影响最终状态。

【实际案例】阿里妈妈 2018 年 DIN 论文：在淘宝展示广告上相比 BaseModel（embedding+pooling）CTR +10%、RPM +3.8%（论文公开数字），核心收益来自"候选感知"——对买连衣裙的女性用户，机械键盘历史行为权重被压到近 0。2019 年 DIEN 再提升 CTR 约 +1.5%（公开口径），代价是 GRU 串行计算推高延迟，工程上靠序列截断+GPU 优化扛住。字节电商借鉴后发现序列从 50 扩到 300 时 AUC +0.6% 但注意力计算量涨 6 倍——直接催生了 SIM 两阶段方案。

【举一反三】搜索广告：用 Query 当注意力 target 激活历史搜索词；短视频：候选视频的作者/类目/BGM 分别与历史行为算多头注意力；本地生活：用"当前时段+地理位置"作为上下文与历史就餐行为做注意力。决策模型：用户兴趣越多元、序列越长，候选感知注意力收益越大。

【扣分点对照】背八股的会说"DIN 加了注意力机制"；真做过的能讲清为什么 pooling 丢多元兴趣、DIN 注意力为什么不做归一化（保留兴趣强度信息）、DIEN 辅助损失监督的是什么（GRU 隐状态要能预测下一行为，否则只是记忆拼接）。

\`\`\`python
import torch, torch.nn.functional as F
def din_attention(hist_emb, item_emb, mask):
    # hist_emb: (B, L, d) 历史行为, item_emb: (B, d) 候选
    B, L, d = hist_emb.shape
    q = item_emb.unsqueeze(1).expand(-1, L, -1)
    # 外积+拼接过 MLP 得相关分
    att_in = torch.cat([hist_emb, q, hist_emb*q], dim=-1)
    score = mlp(att_in).squeeze(-1)            # (B, L)
    score = score.masked_fill(~mask, -1e9)
    weight = F.softmax(score, dim=-1).unsqueeze(-1)
    return (weight * hist_emb).sum(1)          # 候选感知兴趣向量
\`\`\`

踩坑：①序列无脑截断最近 50 条，丢掉周期性长兴趣（如每年买一次的年货）；②注意力分数直接 softmax 归一化，用户只有一个相关行为时也被拉满，丢失"兴趣强度"；③DIEN 不加辅助损失，GRU 隐状态记不住兴趣，提升归零。`,
    keyPoints: ["DIN：候选感知注意力激活子序列", "pooling 平均抹掉多元兴趣", "DIEN：GRU 兴趣演化+辅助损失", "注意力保留兴趣强度不归一"],
    followUps: ["DIEN 的辅助损失在监督什么？（提示：GRU 每个隐状态要能预测下一时刻真实行为，否则隐层只学拼接不学兴趣）", "序列从 50 扩到 1000 时 DIN 会遇到什么问题？（提示：O(L·d) 注意力计算爆炸，需 SIM 两阶段先检索后精排注意力）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-157",
    nodeId: "ai-rec-deep",
    question: "多目标优化 MMoE/PLE 原理？如何处理任务冲突？",
    answer: `【分层原理】结论：MMoE 用多专家+每任务独立门控替代硬共享底层，让冲突任务各取所需；PLE 再把专家显式分共享+任务专属，缓解跷跷板。第一层：硬共享底层下，低相关任务（点击 vs 时长）梯度互拖出现负迁移与跷跷板；第二层：MMoE 学 E 个专家 MLP，每任务独立 gate 做 softmax 加权，点击可 80% 用专家 1、时长用专家 2，软路由解耦；第三层：MMoE 专家无显式分工，易退化成所有任务抢同一批专家；PLE（腾讯 2020）把每层专家分共享+任务专属，任务输入=专属+共享专家的 gate 组合，多层渐进分离；第四层：各任务塔输出 pCTR/pCVR/pFinish 融合成排序分。

【实际案例】快手公开实践：预估点击/完播/点赞/关注/负反馈多目标，硬共享上线点击涨但负反馈也涨（跷跷板），切 MMoE 后负反馈降 12% 且点击不降；再切 PLE 播放时长 +1.7%（公开口径）。PLE 论文腾讯视频场景：相比 MMoE 各任务 AUC 同时 +0.3-0.5。

【举一反三】电商 CTR/CVR/GMV 连乘建模；广告 CTR 与 CVR 冲突适合 PLE；社区消费与生产指标天然冲突。决策：先算任务间梯度余弦相似度，负相关就该上 MMoE/PLE。

【扣分点对照】背八股的会背"MMoE 多专家门控"；真做过的能讲清门控塌缩怎么检测（gate 熵）与缓解（dropout/均衡 loss）、PLE 比 MMoE 多解耦了什么（共享与专属显式分离）。

\`\`\`python
import torch, torch.nn as nn
class PLELayer(nn.Module):
    def __init__(self, d, n_shared=2, tasks=("ctr","cvr")):
        super().__init__()
        self.shared = nn.ModuleList([mlp(d) for _ in range(n_shared)])
        self.specific = nn.ModuleDict(
            {t: nn.ModuleList([mlp(d)]) for t in tasks})
        self.gates = nn.ModuleDict({t: nn.Linear(d, n_shared+1) for t in tasks})
    def forward(self, x):
        sh = torch.stack([e(x) for e in self.shared], 1)  # (B,S,d)
        out = {}
        for t, exps in self.specific.items():
            sp = torch.stack([e(x) for e in exps], 1)     # (B,1,d)
            pool = torch.cat([sp, sh], 1)                 # 专属+共享
            g = torch.softmax(self.gates[t](x), -1).unsqueeze(1)
            out[t] = (g @ pool).squeeze(1)                # 门控组合
        return out
\`\`\`

踩坑：①专家数设 1 退化成硬共享，16 个训练不稳，4 个左右最稳；②门控塌缩熵近 0 等于单专家，需监控 gate 分布；③loss 简单相加，量纲大的任务主导梯度，需 uncertainty 加权。`,
    keyPoints: ["MMoE：多专家+任务独立门控软路由", "PLE：共享与专属专家显式分离", "治负迁移与跷跷板现象", "门控塌缩需熵监控+正则"],
    followUps: ["门控塌缩怎么检测和缓解？（提示：监控各任务 gate 分布的熵；gate 加 dropout、负载均衡 loss、温度系数）", "什么信号提示你该从硬共享升级到 MMoE？（提示：任务间梯度余弦相似度为负、一任务涨另一必跌的跷跷板）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-158",
    nodeId: "ai-rec-deep",
    question: "多任务损失加权与梯度冲突如何处理？",
    answer: `【分层原理】结论：多任务损失的三大坑——量纲不同、收敛速度不同、梯度方向冲突，分别用自动加权、动态平衡、梯度投影解决。第一层：手工加权 w1·L1+w2·L2 中量纲大的任务主导（回归 loss 数值远大于分类），Uncertainty Weighting 给每个任务学一个可学习参数 σ，loss=Σ L_i/(2σ_i²)+log σ_i，同方差不确定性大的任务自动降权；第二层：GradNorm 动态调权，让各任务梯度范数与平均收敛速率匹配——跑得快的任务降权、慢的加权，训练全程平衡；第三层：梯度冲突——两任务梯度余弦为负时互相拖拽，PCGrad 把冲突方向的分量投影掉（g_i 减去在 g_j 上的投影），只保留共识方向；第四层：推荐场景还有样本选择偏差：CVR 只能在点击样本上训练但要在全曝光上推理，ESMM 用 pCTCVR=pCTR×pCVR 让 CVR 在全曝光空间间接监督，同时解决数据稀疏。

【实际案例】阿里 ESMM 论文（SIGIR 2018）公开数据：相比传统 CVR 模型（只在点击样本训练），AUC 提升 2.18 个点（淘宝生产数据），因为训练样本从"点击子集"扩到"全曝光"且消除了选择偏差，线上 CVR +2%、GMV +3%。字节在多目标精排（点击+时长+互动）上实践 GradNorm：相比固定权重，三个目标同时提升，免去每季度手工调权；PCGrad 在抖音多任务模型中用于解决"点击与负反馈"的梯度冲突，负反馈预估 AUC +0.8% 且点击指标不掉。

【举一反三】自动驾驶多任务（检测+分割+深度估计）广泛用 PCGrad；风控同时估"逾期概率+欺诈概率"可用 ESMM 式链式建模（先欺诈后逾期）；广告 oCPC 出价本质是 CTR×CVR 连乘。决策模型：先查 loss 量纲（差 10 倍以上必须归一/自动加权），再查梯度冲突（负余弦上 PCGrad），最后查样本偏差（上 ESMM）。

【扣分点对照】背八股的会说"调 loss 权重"；真做过的能讲清 uncertainty weighting 的 σ 为什么可学（同方差假设下最大化似然推导）、PCGrad 只做投影不缩放的细节、ESMM 为什么能消选择偏差（pCVR 不单独计算 loss，只在 pCTCVR 中被监督，样本空间是全曝光）。

\`\`\`python
import torch
# ESMM：CTR、CTCVR 两个 loss 都在全曝光空间计算
pctr = ctr_tower(x); pcvr = cvr_tower(x)
pctcvr = pctr * pcvr                         # 链式乘积
loss = bce(pctr, click) + bce(pctcvr, click & convert)
# PCGrad：消除梯度冲突
g1 = torch.autograd.grad(loss_ctr, shared, retain_graph=True)
g2 = torch.autograd.grad(loss_cvr, shared)
if dot(g1, g2) < 0:
    g2 = g2 - dot(g1, g2) / (g1.norm()**2) * g1   # 投影掉冲突分量
\`\`\`

踩坑：①CVR 模型只用点击样本训练，上线在全曝光打分，分布外泛化崩——ESMM 是标配；②多任务 loss 直接相加，时长回归 loss 数值比点击 BCE 大 100 倍，点击任务被淹没；③PCGrad 用在不共享参数的层上白费算力，只对共享层做投影。`,
    keyPoints: ["Uncertainty 自动学任务权重", "GradNorm 平衡收敛速率", "PCGrad 投影消梯度冲突", "ESMM 链式乘积消选择偏差"],
    followUps: ["ESMM 为什么能消除 CVR 的样本选择偏差？（提示：pCVR 不直接算 loss，通过 pCTCVR=pCTR×pCVR 在全曝光空间被间接监督）", "PCGrad 的具体操作是什么？（提示：两任务梯度点积为负时，把一方在另一方方向上的投影分量减掉）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-159",
    nodeId: "ai-rec-deep",
    question: "阿里淘宝搜索排序模型演进？从 GBDT 到深度模型？",
    answer: `【分层原理】结论：淘宝排序演进路线是"GBDT/LR（人工特征）→Wide&Deep（记忆+泛化）→DIN/DIEN（序列兴趣）→多目标多场景（PLE/STAR）"，每一步都在解决上一代的结构性瓶颈。第一层：GBDT+LR 时代靠特征工程，树模型自动组合出交叉规则喂给 LR，千人千面的天花板是人工特征的想象力；第二层：Wide&Deep/DeepFM 引入 embedding+DNN，稀疏 id 可学、高阶交叉自动化，但用户被压成一个固定向量；第三层：DIN 发现用户兴趣是多元的，用候选感知注意力从行为序列中动态抽取兴趣；DIEN 进一步建模兴趣随时间的演化；第四层：多目标时代要同时优化 CTR/CVR/GMV 且多场景（首页猜你喜欢/搜索/直播）差异大，STAR 用场景私有参数+共享参数的星型拓扑、PLE 解任务冲突，走向"一个底座、场景插件化"。

【实际案例】演进每一步都有公开数字：阿里妈妈 GBDT+LR 时代靠"组合特征"支撑 2013-2015 年广告收入增长；2016 年 Wide&Deep 上线 CTR 提升约 1%；2018 年 DIN 论文数字 CTR +10%、RPM +3.8%（相对 BaseModel）；2019 年 DIEN 再 +1.5%；2020 年后多目标+多场景统一建模（STAR/PLE 在猜你喜欢多场景），公开分享提到多场景联合训练相比各场景独立模型整体 CTR +2%。每代切换的真实动因都不是"追新"：GBDT 的瓶颈是特征工程师人力，Wide&Deep 的瓶颈是固定兴趣向量，DIN 的瓶颈是序列长度，多目标时代的瓶颈是场景间数据互相稀释。

【举一反三】美团外卖排序走了几乎相同路线（GBDT→DeepFM→DIN→多目标），可对照学习；拼多多电商推荐晚两年但跳过 GBDT 直接深度起步；京东搜索排序在 DIN 之后重点做了"Query 与序列的双重注意力"。通用洞察：架构演进永远跟着"当前最大瓶颈"走，面试时讲出每代的瓶颈比背架构图值钱。

【扣分点对照】背八股的会按时间线背模型名；真做过的能讲清每代切换的业务动因（如 GBDT 时代扩特征的人力成本 vs 深度模型的算力成本这笔账怎么算）、为什么搜索场景 DIN 要加 Query 注意力而推荐场景不用（搜索有明确意图锚点）。

\`\`\`python
# 演进脉络的代码速写：从固定兴趣到候选感知兴趣
# v1 GBDT+LR: features = gbdt.encode(x); p = lr(features)
# v2 DeepFM:  p = fm(x) + dnn(x)                # 固定用户向量
# v3 DIN:     u = attention(hist_seq, cand)     # 兴趣随候选变化
# v4 多目标:  {t: tower_t(ple_layer(x)[t]) for t in TASKS}
score = w1*pctr + w2*pcvr + w3*pstay           # 多目标融合排序
\`\`\`

踩坑：①直接照搬大厂最新架构，自己数据量只有百万级，DIN 打不过调好的 GBDT——数据规模决定架构上限；②多场景硬共享一个模型，小场景数据被大场景稀释；③演进中丢掉上一代积累的手工统计特征，AUC 回退——统计特征在深度时代仍是强信号。`,
    keyPoints: ["GBDT→DeepFM→DIN/DIEN→多目标多场景", "每代切换由结构性瓶颈驱动", "STAR 场景插件化底座共享", "统计特征深度时代仍有效"],
    followUps: ["为什么数据量小时深度模型可能打不过 GBDT？（提示：embedding 需要足够样本学稳，稀疏 id 在小数据下全是噪声）", "多场景统一建模的核心矛盾是什么？（提示：共享学共性 vs 场景差异被稀释，STAR/PLE 都是对这个矛盾的回答）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-160",
    nodeId: "ai-rec-deep",
    question: "腾讯广告 CTR 预估实战？如何处理亿级特征和实时性？",
    answer: `【分层原理】结论：腾讯广告的 CTR 工程核心是"亿级稀疏 id 的 embedding 存储、毫秒级推理、分钟级模型更新"三件事。第一层：特征规模——用户 id、广告 id、广告主、上下文玩出亿级维度，one-hot 存不下，用哈希分桶（feature hashing）或按频率截断低频 id，embedding table 放参数服务器（PS）分片存储，训练时 worker 只拉本 batch 命中的行；第二层：模型结构——DeepFM/DCN/多塔，交叉特征离线预生成，在线只查表不实时算交叉；第三层：实时性——用户行为经 Kafka→Flink 秒级聚合成实时特征（近 5 分钟点击序列），模型用在线学习（FTRL/增量训练）分钟级更新，新广告冷启动 10 分钟内拿到可打的 CTR；第四层：训练-推理一致性靠特征平台统一注册，离线样本和在线请求走同一份特征定义，杜绝穿越。

【实际案例】腾讯广告（广点通）公开的技术分享：特征维度十亿级，embedding 总参数量 TB 级，用自研 PS（后开源为 Angel）分片存储+稀疏更新，训练吞吐支撑日增百亿样本；在线推理通过模型量化（FP16/INT8）+算子融合把 p99 延迟压在 20ms 内，大促 QPS 峰值 50 万+。一次典型迭代：实时特征链路延迟从 3 秒优化到 500ms（Flink 窗口调小+状态后端换 RocksDB），新广告冷启动期 CTR 预估偏差下降 40%，广告主冷启动消耗速度提升 25%。特征穿越事故也公开复盘过：某次离线用 T+1 的统计特征训练、线上 T+0 实时值，离线 AUC 0.81 上线暴跌，之后强制特征平台做时间戳对齐校验。

【举一反三】字节巨量引擎同构（PS+流式更新+特征平台）；快手广告把"观看时长实时分"作为秒级特征；百度凤巢在创意维度加图神经网络 embedding。通用决策：先保特征一致性（穿越是头号事故源），再优化延迟，最后扩特征规模。

【扣分点对照】背八股的会说"用参数服务器和哈希"；真做过的能讲清哈希碰撞为什么在小 bucket 下杀伤 AUC（两个高频 id 撞桶共享 embedding）、在线学习为什么要防"凌晨低流量时段模型漂移"（流量分布剧变时锁学习率）、特征穿越的三种形态（时间穿越/口径不一致/label 泄漏）。

\`\`\`python
import torch, torch.nn as nn
class HashEmbedding(nn.Module):
    def __init__(self, n_bucket=2_000_000, k=16):
        super().__init__()
        self.emb = nn.Embedding(n_bucket, k)   # 分桶后的共享表
        self.n_bucket = n_bucket
    def forward(self, ids):
        return self.emb(ids % self.n_bucket)   # 哈希映射查表
# 训练: worker 只从 PS 拉 batch 命中的 embedding 行, 梯度稀疏回传
# 在线学习: 样本流 → 增量 SGD/FTRL → 分钟级把增量 push 到在线 PS
\`\`\`

踩坑：①哈希 bucket 按内存拍脑袋设，高频 id 撞桶，AUC 莫名掉 0.3 个点——撞桶率需监控；②在线学习无护栏，凌晨稀疏流量把模型带偏，早高峰 CTR 崩——需学习率随流量自适应+漂移报警；③离线在线特征各写一套代码，半年必穿越——特征平台统一是必答题。`,
    keyPoints: ["亿级 id 哈希分桶+PS 分片存储", "Flink 秒级实时特征+在线学习", "特征平台统一防穿越", "量化+算子融合压 p99 延迟"],
    followUps: ["哈希碰撞对模型有什么影响，怎么量化？（提示：两 id 共享 embedding 互相污染；监控每桶承载的高频 id 数）", "在线学习凌晨漂移问题怎么防？（提示：低流量时降学习率/冻结更新、回放到白天分布、漂移指标报警）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-284",
    nodeId: "ai-rec-deep",
    question: "SIM 长序列建模原理？两阶段检索如何支撑千级行为序列？",
    answer: `【分层原理】结论：SIM（Search-based Interest Model，阿里 2020）把超长行为序列（1000+）建模拆成两阶段：GSU 先用候选快速检索出 TopK 相关行为，ESU 再对短序列做精细注意力，用检索的 O(log L) 换掉注意力的 O(L)。第一层：DIN 对每条历史行为算注意力，复杂度随序列长度线性增长，序列从 50 扩到 1000 时精排延迟不可接受；第二层：GSU（General Search Unit）两种实现——hard search 用类目相同做规则过滤，soft search 把行为向量和候选向量建 ANN 索引检索 TopK，把 1000 条压到 50 条；第三层：ESU（Exact Search Unit）对检索出的短序列做 DIN 式 target attention，并引入时间衰减特征（行为距今天数的 embedding）捕捉兴趣新鲜度；第四层：长序列的价值在"终身兴趣"——去年买过奶粉的用户今年是母婴高潜，短序列看不到这种周期信号。

【实际案例】阿里妈妈公开 SIM 论文数据：在淘宝展示广告上，相比 DIEN（序列截断 50），SIM 用 1000 长序列 CTR +7.1%、RPM +4.4%（论文口径），证明长序列里藏着真金白银。工程落地关键：hard search（同类目过滤）实现零成本但丢掉跨类目兴趣，soft search（ANN 检索）覆盖全但需维护行为向量的在线索引；生产上 GSU 压到 50 条后 ESU 开销与 DIEN 持平，p99 延迟只 +3ms。美团外卖跟进：长序列让高频用户复购预测 AUC +1.2%，因为"每周五下午茶"这类周期模式只有长序列可见。

【举一反三】短视频"半年前追过的剧更新了"提醒=长序列周期信号；电商大促"去年双十一买过的品牌"召回=终身兴趣检索；音乐 App 的"怀旧推荐"本质是对长序列做时间衰减注意力。决策模型：用户行为周期性强（电商/外卖）→长序列收益大；兴趣快变（新闻）→长序列需重时间衰减。

【扣分点对照】背八股的会说"SIM 先检索再注意力"；真做过的能讲清 GSU 的 hard/soft 两种 search 的取舍（成本 vs 覆盖率）、为什么 ESU 要加时间衰减 embedding（注意力本身对时序不敏感）、长序列引入的噪声问题（半年前的误点也被检索到）怎么靠 ESU 注意力压掉。

\`\`\`python
import torch
# GSU: soft search 用候选向量检索 TopK 相关行为
hist_vec = encoder(hist_items)               # (B, 1000, d) 长序列
q = encoder(candidate)                       # (B, d)
sim = hist_vec @ q                           # 内积粗筛
topk_idx = sim.topk(50, dim=-1).indices      # 压到 50 条
short_seq = gather(hist_vec, topk_idx)
time_gap = gather(behavior_days_ago, topk_idx)
# ESU: 精细注意力 + 时间衰减 embedding
u = din_attention(short_seq, q, time_emb(time_gap))
\`\`\`

踩坑：①GSU 只做 hard search 同类目过滤，跨类目强相关（手机→手机壳）全丢；②长序列不做去重去噪（刷屏/误点），检索结果被噪声占满；③ESU 漏加时间特征，模型分不清"昨天看过"和"去年看过"，兴趣新鲜度建模失败。`,
    keyPoints: ["GSU 检索压缩千级序列到 TopK", "ESU 精细注意力+时间衰减", "长序列藏周期性与终身兴趣", "检索 O(log L) 替代 O(L) 注意力"],
    followUps: ["GSU 的 hard search 和 soft search 各有什么代价？（提示：hard 零成本但丢跨类目兴趣，soft 覆盖全但需维护 ANN 索引）", "为什么长序列场景时间衰减特征是必须的？（提示：注意力对绝对时间不敏感，去年的行为需显式降权）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-rec-engineering =====

  {
    id: "ai-161",
    nodeId: "ai-rec-engineering",
    question: "召回-粗排-精排-重排四层漏斗架构？各层目标？",
    answer: `【分层原理】结论：四层漏斗是"算力与精度 trade-off 的流水线"——每层用能承受的最贵模型筛掉一批，让最贵模型只打最少的量。第一层：召回亿级→万级，目标是覆盖率（宁可错留不可错杀），用 ANN/多路倒排，单候选成本微秒级；第二层：粗排万级→千级，目标是与精排目标对齐的粗打分，用双塔加浅交叉或小型 MLP，单候选 0.1ms 级；第三层：精排千级→百级，目标是预估精度，上 DIN/PLE 等重模型+全量特征交叉，单候选 1ms 级；第四层：重排百级→最终曝光，目标是序列级最优——多样性、打散、业务规则（广告混排、生态扶持）、上下文感知（前面推了美食后面少推），用 MMR/DPP 或序列生成模型。核心设计原则：每层的"漏损"由下一层兜不住，所以召回漏了好内容全盘皆输。

【实际案例】抖音全链路：召回 3000→粗排 500→精排 100→重排出 8-12 条一刷。公开分享的数字：精排模型（DIN 族）打全量 3000 候选需 300ms，远超 100ms 预算，粗排把量压到 500 后精排只用 50ms——粗排存在的意义就是这笔延迟账。淘宝首页猜你喜欢的重排实践：直接按精排分排序导致同店商品连出 5 个，点击率 -8%；重排加"同店/同类目窗口打散+DPP 类目多样性"后 CTR 回升且多样性指标 +30%。一次典型失败：粗排用与精排差异大的目标（只估点击率），精排的高分候选 30% 不在粗排 Top500 里——迭代为粗排蒸馏精排模型后，精排候选命中率升到 92%。

【举一反三】搜索广告同构：召回（Query 改写+广告倒排）→粗排→精排→重排（广告位分配+计费）；直播推荐在重排层加"已关注主播优先"业务规则；招聘推荐在重排层做"求职者-职位双边匹配约束"。通用决策：先算每层的延迟预算账，再定各层模型复杂度上限。

【扣分点对照】背八股的会背四层名字；真做过的能讲清粗排为什么要蒸馏精排（目标不一致导致候选漏损）、重排为什么不能只按分数排序（序列级效应：相邻 item 互相影响 CTR）、每层候选量数字怎么定（延迟预算÷单候选成本）。

\`\`\`python
# 四层漏斗主流程（在线服务伪码）
def recommend(user, ctx):
    cand = multi_recall(user)[:3000]           # 召回：重覆盖
    s1 = coarse_model(user, cand)              # 粗排：蒸馏精排目标
    cand = topk(cand, s1, 500)
    s2 = rank_model(user, cand, ctx)           # 精排：多目标融合分
    cand = topk(cand, s2, 100)
    return rerank(cand, s2, rules=[Dedup(),    # 重排：打散+多样性
        CategoryDiversity(), AdInsert(), Explore()])[:12]
\`\`\`

踩坑：①粗排目标与精排不一致（如只估 CTR 而精排融合多目标），好候选中途被误杀；②重排规则越加越多（几十个 if-else），互相冲突且无人敢删——规则需平台化+收益归因；③各层候选量凭经验定，没按延迟预算核算，大促流量翻倍直接超时。`,
    keyPoints: ["每层用最贵可承受模型筛量", "召回漏损全盘皆输", "粗排蒸馏精排对齐目标", "重排做序列级最优非分数排序"],
    followUps: ["粗排为什么要蒸馏精排模型？（提示：目标不一致时精排高分候选被粗排误杀，蒸馏让粗排逼近精排排序）", "重排为什么不能只按精排分截断？（提示：相邻 item 互相影响点击率，序列级最优≠单点分数和最大）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-162",
    nodeId: "ai-rec-engineering",
    question: "重排多样性 MMR / DPP 原理？如何平衡相关性和多样性？",
    answer: `【分层原理】结论：MMR 贪心逐步选"相关且与已选最不相似"的 item，DPP 用行列式直接建模"子集整体既相关又互异"的概率，前者快后者理论优。第一层：精排分数是单点预估，假设各 item 独立——但用户连续看到 3 个同类视频，第 3 个 CTR 必然衰减（序列级效应），单点分数之和≠序列收益；第二层：MMR 迭代选择 argmax[λ·rel(i) - (1-λ)·max_sim(i, 已选集)]，λ 调相关-多样权衡，贪心 O(k·n) 工程友好；第三层：DPP 把 item 表示为核矩阵 L_ij=rel_i·rel_j·emb_i·emb_j，子集被抽中的概率∝det(L_S)，行列式大要求向量既长（相关）又正交（互异），直接优化序列级目标；精确 MAP 推断 NP-hard，工业用贪心/Cholesky 加速到毫秒级；第四层：业务约束（同作者最多 2 条、每 N 条插广告）以规则层叠加在算法之上。

【实际案例】阿里 2018 年 DPP 论文落地淘宝重排：相比 MMR，CTR +1.39%、类目覆盖率 +38%（公开口径），核矩阵用精排分×item embedding 构造，贪心+Cholesky 分解把推断压到 10ms 内。YouTube 重排公开实践：用"同类视频连续出现惩罚"替代显式 DPP，实现简单且可解释，观看时长 +0.7%。抖音是混合方案：规则层（同作者/同 BGM 打散、广告固定位）+算法层（类目级 DPP 多样性）；曾把 λ 调过头"为了多样而多样"，低质内容混入导致负反馈 +15%，回滚后按用户多样性偏好分层调 λ。

【举一反三】搜索结果的类目聚合展示=类目级 DPP；新闻的类目配额=多样性约束；歌单排序要兼顾"风格跳变不能太大"。决策：相似度矩阵质量决定上限——内容 embedding 还是行为共现，要先对齐业务对"多样"的定义。

【扣分点对照】背八股的会背 MMR 公式；真做过的能讲清 DPP 行列式为什么天然表达"相关且互异"（向量张成的体积）、贪心推断怎么加速（增量 Cholesky）、λ/相似度矩阵用什么调（按用户分层 A/B，不是全局一个值）。

\`\`\`python
import numpy as np
def dpp_greedy(rel, emb, k=12):
    # L_ij = rel_i * rel_j * <emb_i, emb_j>
    emb = emb / np.linalg.norm(emb, axis=1, keepdims=True)
    L = np.outer(rel, rel) * (emb @ emb.T)
    S, cis = [], np.zeros((k, len(rel)))
    d = np.diag(L).copy()                      # 剩余"体积"贡献
    for t in range(k):
        j = int(np.argmax(d)); S.append(j)
        if t == k - 1: break
        # 增量 Cholesky：更新各候选在已选子空间下的残差
        e = (L[j] - cis[:t].T @ cis[:t, j]) / np.sqrt(d[j] + 1e-9)
        cis[t] = e; d -= e ** 2
    return S
\`\`\`

踩坑：①相似度用内容 embedding，两个"同品类但用户群完全不同"的商品被判相似误杀；②多样性全局一刀切，高偏好集中的用户被强行打散导致 CTR 掉；③DPP 核矩阵不数值稳定（对角线近零），Cholesky 分解崩溃——需加小扰动 εI。`,
    keyPoints: ["MMR 贪心：相关-最大相似权衡", "DPP 行列式=向量张成体积", "增量 Cholesky 毫秒级推断", "多样性强度按用户分层"],
    followUps: ["DPP 的行列式为什么能同时表达相关性和多样性？（提示：det=向量张成的平行体体积，向量长=相关，向量正交=互异）", "相似度矩阵该用内容 embedding 还是行为共现？（提示：取决于业务对'多样'的定义是内容视角还是用户行为视角，需 A/B 对齐）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-163",
    nodeId: "ai-rec-engineering",
    question: "实时特征与在线学习？如何平衡新鲜度和稳定性？",
    answer: `【分层原理】结论：实时性提升=捕捉即时意图的能力，但链路越短方差越大，工程上用"分级时效+护栏机制"平衡。第一层：实时特征分级——秒级（当前 session 行为序列、本次请求上下文）、分钟级（近 5 分钟点击/完播聚合）、小时级（CTR 统计滑窗）、天级（长期画像），不同特征走不同链路，不是越快越好；第二层：链路——行为日志→Kafka→Flink 窗口聚合→Redis/特征服务，在线请求时拼接；秒级特征甚至直接在请求线程内读 session 缓存；第三层：在线学习把样本流（曝光+点击 join）实时训练，FTRL/增量 SGD 分钟级推送到在线 PS，新 item 的 embedding 快速收敛；第四层：稳定性护栏——增量更新加学习率上限、权重漂移监控、异常流量（刷量/爬虫）熔断回滚到上一快照，灰度发布按 1%→10%→100% 推全。

【实际案例】抖音的实时特征体系：用户"刚才划走了 3 个美食视频"这一秒级信号，能让下一个视频的精排分立刻变化，公开分享提到实时序列特征贡献 CTR +3% 以上。阿里双十一大促的在线学习实践：流量分布剧变（大促商品集中曝光），批处理 T+1 模型中午就失效，在线学习 15 分钟级更新让 CVR 预估保持校准，大促当天 GMV 提升约 2%（公开口径）。一次公开复盘的事故：某平台在线学习凌晨低流量时段被少量异常样本带偏，早高峰 CTR 暴跌 5%，之后的护栏是"低流量时段自动降学习率+权重与昨日快照的 L2 距离超阈值即回滚"。

【举一反三】搜索广告的"刚搜过竞品"实时意图=秒级特征价值；外卖午高峰前用户行为模式突变，在线学习比批处理快半天适应；直播推荐"主播刚开播 5 分钟"的冷启动靠实时互动特征。通用决策：先问"这个意图的半衰期多久"——半衰期短的必须实时，半衰期长的实时化只是徒增方差。

【扣分点对照】背八股的会说"Flink 算实时特征+在线学习更新模型"；真做过的能讲清曝光-点击 join 的窗口怎么设（点早了 join 不上、窗口大了延迟高）、凌晨漂移为什么发生（流量分布与白天完全不同，小样本主导梯度）、特征快照一致性问题（训练和 serving 用的特征时间戳必须对齐）。

\`\`\`python
# Flink 实时特征（伪码）+ 在线学习护栏
events.keyBy("user_id") \
      .window(SlidingEventTimeWindows.of(min=10, sec=30)) \
      .aggregate(ClickCounter())               # 10 分钟滑窗 30 秒步长
      .addSink(RedisSink())                    # 写特征服务
# 在线学习护栏
delta = new_weights - snapshot_weights
if delta.norm() / snapshot_weights.norm() > 0.05:
    rollback(snapshot_weights)                 # 漂移超阈值回滚
elif traffic_now < LOW_TRAFFIC_THRESHOLD:
    lr *= 0.1                                  # 低流量降学习率
\`\`\`

踩坑：①曝光-点击 join 窗口设太短，长决策链路（电商加购）点击全部丢失，正样本被误标负；②无灰度直接全量推在线学习模型，一次坏更新全站事故；③实时特征故障时无降级方案，服务直接挂——需离线特征兜底。`,
    keyPoints: ["特征按秒/分/时/天分级时效", "Flink 滑窗+Redis 特征服务", "在线学习分钟级更新", "漂移监控+灰度+回滚护栏"],
    followUps: ["曝光-点击 join 的窗口怎么设？（提示：按业务决策链路时长分布设，覆盖 95% 点击的时延，电商要比短视频长得多）", "凌晨低流量为什么会让在线学习漂移？（提示：样本少且分布与白天不同，少量异常样本主导梯度，需降学习率或冻结）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-164",
    nodeId: "ai-rec-engineering",
    question: "E&E 探索与利用？推荐如何平衡短期收益和长期价值？",
    answer: `【分层原理】结论：E&E 的核心矛盾是"推已知高分的赚现在的钱"vs"给未知物品机会赚未来的数据"，Bandit 理论给出了 regret 最优的探索预算分配。第一层：ε-greedy 以 ε 概率随机探索（1-ε 利用），简单但不智能——探索是盲目的；第二层：UCB 给每个臂加上置信上界 bonus=c·√(ln T/n_i)，曝光少的物品天然 bonus 高，"不确定性即探索价值"，理论 regret 上界 O(log T)；第三层：Thompson Sampling 给每个臂的 CTR 建 Beta 后验，每次从后验采样选最大，天然把不确定性转成探索概率，实践效果常优于 UCB；第四层：推荐里臂是动态且海量的，纯 Bandit 不够用——Contextual Bandit/LinUCB 把特征放进置信上界，深度推荐里用"探索网络"（如华为 VEP 用方差预估不确定性）或在精排分上加不确定性 bonus，配合流量池机制给新物品保底曝光。

【实际案例】抖音新视频冷启动：初始流量池 500 曝光探索，按完播率/互动率爬坡到 5000/50000 级，本质是"分级 ε-greedy"——探索成本由小池子控制，公开口径新品首日分发效率提升数倍。阿里 UCB 实践：新品期给 CTR 预估值加不确定性 bonus，新品曝光占比从 5% 提到 12% 且整体 CTR 只降 0.3%（可承受探索成本）。LinkedIn 公开 Thompson 案例：job 推荐 CTR +10% 且收敛快于 ε-greedy。典型失败：探索流量无上限曾致大盘 CTR 掉 1.2%，之后改为预算制——全局探索流量硬顶 5%，按内容池质量分配。

【举一反三】广告投放新素材冷启=Bandit 探索；搜索的"意图探索"（给模糊 Query 插 1 条异类结果）；直播新主播扶持计划=人工设定的探索预算。通用决策：探索预算=流量成本，先算"1% 探索流量值多少钱"，再决定用哪种 Bandit 把这笔钱花在不确定性最高的物品上。

【扣分点对照】背八股的会背 ε-greedy/UCB/Thompson 三个名词；真做过的能讲清 UCB 中 ln T 的作用（时间推移未探索臂 bonus 自动增大，保证所有臂最终被试）、Thompson 为什么实践常胜 UCB（后验采样天然随机化且利用全分布信息）、推荐里为什么不能对每个 item 单独建臂（臂太多，需内容特征泛化）。

\`\`\`python
import numpy as np
# Thompson Sampling：Beta 后验采样
def thompson_select(alpha, beta):
    # alpha=历史点击+1, beta=历史未点+1
    samples = np.random.beta(alpha, beta)      # 每臂采一个 CTR 样本
    return int(np.argmax(samples))
# LinUCB：特征化置信上界
def linucb(x, A, b, c=1.0):
    theta = np.linalg.solve(A, b)              # 岭回归估 CTR 系数
    ucb = x @ theta + c * np.sqrt(x @ np.linalg.inv(A) @ x)
    return ucb                                 # 特征越少见 bonus 越大
\`\`\`

踩坑：①探索无预算上限，短期指标被侵蚀后说不清是谁的责任；②新物品保底曝光"只给一次"，CTR 置信区间宽到无法决策就打入冷宫——需累积多批证据；③Bandit 状态（曝光/点击计数）不持久化，服务重启探索进度清零。`,
    keyPoints: ["UCB：不确定性即探索价值", "Thompson 后验采样实践最优", "LinUCB 特征泛化到海量臂", "探索预算制控短期损失"],
    followUps: ["Thompson Sampling 为什么实践常优于 UCB？（提示：利用完整后验分布而非点上界，探索天然随机化且收敛更快）", "推荐场景为什么不能对每 item 独立建臂？（提示：臂数亿级且新臂不断产生，必须靠内容特征让 Bandit 泛化）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-165",
    nodeId: "ai-rec-engineering",
    question: "推荐系统工程架构？离线/近线/在线如何划分？",
    answer: `【分层原理】结论：三层架构按"时效与算力"分工——离线干重活（训练+全量计算）、近线补时效（流式特征+增量更新）、在线拼延迟（毫秒级召回排序）。第一层：离线层用 Hadoop/Spark 跑批：样本拼接（曝光 join 点击）、特征统计（7 天 CTR）、模型训练（DeepFM/PLE）、item embedding 全量预计算灌 ANN 索引，T+1 或小时级；第二层：近线层用 Flink 消费 Kafka 行为流：实时特征聚合（近 10 分钟点击序列）、实时样本流（曝光-点击 join 后送在线学习）、item 侧向量近线更新；第三层：在线层是微服务集群：请求进来→取用户特征（Redis/特征服务）→多路召回（ANN+倒排）→粗排→精排（模型服务化，TF-Serving/Triton）→重排→返回，p99 预算通常 100-200ms；第四层：三层通过特征平台统一特征定义，通过消息队列和模型仓库衔接，A/B 平台贯穿全链路做实验分流。

【实际案例】抖音/淘宝公开架构几乎同构：离线 Spark 日级训练主模型，Flink 集群上万核跑实时特征，在线精排服务 GPU 推理。数字量级：在线精排单次请求打 500-1000 候选，p99 <50ms；召回 ANN 索引亿级向量，单 query <5ms。典型事故：特征平台建立前离线在线各写一套特征代码，某次"用户 7 天 CTR"离线用曝光日口径、在线用点击日口径，上线效果对半砍——之后强制特征统一注册、穿越率常态化监控为 0。模型上线走"离线评估→1%→10%→全量"灰度。

【举一反三】广告系统多一层"计费与预算控制"在线模块；搜索推荐混合架构中 Query 理解在近线做；小团队起步可砍掉近线层（T+1 特征+离线模型也能跑到 80 分）。通用决策：架构跟着时效需求长——业务对"用户刚干了什么"的敏感度决定近线层的投资。

【扣分点对照】背八股的会画三个框加箭头；真做过的能讲清离线在线特征一致性怎么保证（统一特征平台+穿越监控）、精排为什么常独立成 GPU 推理服务（与 CPU 业务逻辑解耦扩缩容）、样本拼接的 label 窗口和特征窗口为什么要错开（防 label 泄漏进特征）。

\`\`\`python
# 在线服务主链路（伪码）
def serve(request):
    u_feat = feature_store.get_online(request.user_id)   # Redis 实时特征
    cand = []
    for r in RECALLERS:                                  # 多路召回
        cand += r.recall(u_feat, k=r.quota)
    cand = dedupe(cand)
    s1 = coarse_rank.predict(u_feat, cand)               # CPU 粗排
    top = select(cand, s1, 500)
    s2 = triton_client.infer("rank_model", u_feat, top)  # GPU 精排
    return rerank(top, s2, business_rules)[:12]          # 重排出结果
# p99 预算: 特征5ms + 召回10ms + 粗排20ms + 精排50ms + 重排10ms
\`\`\`

踩坑：①离线在线特征两套实现，半年后必穿越——特征平台统一是保命工程；②在线逻辑全部塞一个服务，精排模型升级导致全站抖动——模型服务化独立部署；③无降级预案：特征服务挂了全站 500——需本地缓存兜底特征+降级策略。`,
    keyPoints: ["离线训练+近线流式+在线服务", "特征平台统一三层定义", "精排 GPU 服务化独立扩缩", "A/B 平台贯穿全链路"],
    followUps: ["如何保证离线训练与在线推理的特征一致性？（提示：特征平台统一定义+同一计算引擎+穿越率常态化监控）", "样本拼接时 label 窗口和特征窗口为什么要错开？（提示：特征只能用曝光时刻之前的数据，否则 label 泄漏进特征）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-166",
    nodeId: "ai-rec-engineering",
    question: "推荐特征工程：用户/物品/上下文/交叉特征如何设计？",
    answer: `【分层原理】结论：特征设计的本质是"把领域的先验知识翻译成模型能吃的信号"——用户侧回答他是谁/想要什么，物品侧回答它是什么/表现如何，上下文回答此时此刻，交叉回答两者相遇的历史。第一层：用户特征=静态画像（年龄/性别/城市分桶）+动态行为（点击/完播/加购序列，近 N 天聚合统计：类目偏好分布、活跃度分桶）+兴趣向量（预训练 embedding）；第二层：物品特征=内容属性（类目/标签/标题 embedding/封面图 embedding）+统计指标（1/3/7 天 CTR、曝光/点击/转化率，需贝叶斯平滑防小样本噪声）+质量分（审核/原创度）；第三层：上下文=时间（小时/星期，embedding 化捕捉周期）、地点、网络环境、请求入口；第四层：交叉特征=用户×类目的历史 CTR、用户×物品的交互次数等——深度模型能自动学交叉，但"统计型交叉特征"仍是工业界最强信号之一，因为模型学统计规律要样本，人工统计直接用全量数据。

【实际案例】抖音的特征体系中，"用户近 7 天对各一级类目的完播率"这类交叉统计特征是精排 Top 贡献特征之一；淘宝精排公开分享提到统计特征在 DIN 时代仍贡献约 20% 的特征重要性。一次典型迭代：某平台把"物品 7 天 CTR"直接用原始比值，新物品 3 曝光 2 点击 CTR=0.67 屠榜，低质新品刷屏——改为贝叶斯平滑（先验均值 + (点击+α)/(曝光+α+β)）后，新品排名回归合理，整体 CTR +0.8%。序列特征工程另有一条线：行为序列从"最近 N 个 id"升级为"id+时长+行为类型+时间戳"四元组，仅这一改动让某电商精排 AUC +0.4%。

【举一反三】广告特征多一维"广告主侧"（预算消耗速度、行业竞争度）；外卖加"配送时长预估"这种服务侧特征；直播加"主播实时在线状态"秒级特征。通用决策：新特征上线前问三个问题——时间窗口多少、是否平滑、离线在线能否一致生产。

【扣分点对照】背八股的会列"用户/物品/上下文"三分法；真做过的能讲清统计特征为什么必须平滑（小样本方差）、id 特征 embedding 化的分桶策略（高频独热低频哈希）、特征重要性怎么归因（permutation importance 而非模型权重）。

\`\`\`python
# 统计特征贝叶斯平滑 + 交叉特征
def smooth_ctr(clicks, impressions, prior=0.05, strength=100):
    # 先验强度 strength：曝光少时向大盘均值收缩
    return (clicks + prior * strength) / (impressions + strength)
features = {
    "user_cat_ctr_7d": smooth_ctr(u_clk[cat], u_imp[cat]),  # 交叉统计
    "item_ctr_1d": smooth_ctr(i_clk, i_imp),
    "hour_emb": hour_of_day,                                # 上下文 embedding
    "user_seq": last_n_behavior_ids[:50],                   # 行为序列
}
\`\`\`

踩坑：①统计特征不平滑，小样本物品 CTR 虚高屠榜；②特征时间窗口用"自然天"而非"滚动 24 小时"，凌晨请求拿到的是两天前的数据；③序列特征只存 id 丢时间戳和行为类型，模型无法区分"误点 1 秒划走"和"看完 3 分钟"。`,
    keyPoints: ["四类特征：用户/物品/上下文/交叉", "统计特征必须贝叶斯平滑", "交叉统计仍是深度时代强信号", "序列特征升级为四元组"],
    followUps: ["统计特征为什么必须平滑，怎么做？（提示：小样本 CTR 方差大；贝叶斯平滑向大盘先验收缩，先验强度对应置信度）", "深度模型能自动学交叉，为什么手工交叉统计特征仍有效？（提示：模型学统计规律要消耗样本容量，人工统计直接用全量历史）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-167",
    nodeId: "ai-rec-engineering",
    question: "推荐系统冷启动流量池机制？新内容如何起量？",
    answer: `【分层原理】结论：流量池是"用小成本买新内容的真实反馈数据，按表现分级放大"的分发机制，本质是把 Bandit 探索工程化。第一层：新内容入库先进初始池（如 500 曝光），选择"质量相对均质"的用户群投出，收集完播率/互动率/负反馈率；第二层：爬坡机制——指标超阈值升一级流量池（500→5000→5 万→50 万），不达标停留或降级，每级曝光成本指数增长，用低成本过滤掉 90% 平庸内容；第三层：防误判——小样本下指标方差大，单级决策容易误杀，所以升级通常要求"连续两级达标"或累积证据到置信度阈值；第四层：公平性与生态——纯效率导向会让头部创作者垄断（马太效应），需要给新人创作者保底权重、给新赛道（新类目内容）独立池子，避免与成熟类目正面 PK。

【实际案例】抖音公开的创作者侧信息：新视频先进小流量池测试，根据完播率、点赞率、评论率决定是否推向更大池子，这套"赛马机制"是抖音内容生态的核心发动机。一次典型的生态迭代：早期流量池对成熟类目（颜值/搞笑）有利，知识类内容完播率天然低、起量难，平台为知识类开设独立赛道池（与同类内容赛马而非全站赛马），知识区创作者数量一年内数倍增长（公开口径）。拼多多商品冷启动类似：新品进"新品频道"专属流量，7 天内 CTR 达标转正式推荐池，未达标自然沉底；加"新品标"前端透传后，新品点击率提升约 15%，因为用户对新品的点击意图本身就不同（猎新心理）。

【举一反三】直播新主播冷启=开播保底流量+留存赛马；招聘新职位=首 3 天加权曝光；音乐平台新歌=新歌榜+每日推荐保底坑位。通用决策模型：赛马池设计三要素——同级对手是谁（分赛道）、晋级阈值多少（按类目基线校准）、给几次机会（证据累积）。

【扣分点对照】背八股的会说"给小流量测试再放大"；真做过的能讲清为什么升级要累积证据而非单批定生死（500 曝光的 CTR 置信区间 ±4%）、分赛道赛马解决什么问题（类目间指标基线不可比）、保底曝光与效率的账怎么算（生态多样性是长期留存资产）。

\`\`\`python
# 流量池赛马机制
POOLS = [500, 5000, 50000, 500000]           # 分级曝光量
def on_pool_report(item, metrics):
    th = baseline[item.category]               # 类目基线阈值
    ev = item.evidence                         # 累积证据(曝光数)
    score = bayes_smooth(metrics, prior=th)    # 平滑小样本
    if score > th.promote and ev > MIN_EVIDENCE:
        item.stage = min(item.stage + 1, 3)    # 升级
        item.evidence = 0                      # 新一级重新累积
    elif score < th.demote and ev > MIN_EVIDENCE:
        item.stage = max(item.stage - 1, 0)    # 降级
    return POOLS[item.stage]
\`\`\`

踩坑：①阈值全类目一刀切，知识类内容永远打不过颜值类，生态单一化；②单批 500 曝光就定生死，随机波动误杀优质内容（置信区间 ±4% 意味着好内容有 20% 概率被误杀）；③流量池机制被工作室摸透后刷量养号，需反作弊联动——异常完播模式（秒完播、集中 IP）的批次数据作废。`,
    keyPoints: ["小池测真实反馈，分级爬坡", "累积证据防小样本误杀", "分赛道赛马校准类目基线", "保底流量防马太垄断生态"],
    followUps: ["为什么升级决策要累积证据而非单批曝光定生死？（提示：500 曝光 CTR 置信区间约 ±4%，单批决策误杀率不可忽视）", "分赛道赛马解决什么问题？（提示：类目间完播率基线差异巨大，全站赛马等于让知识内容永远输给颜值内容）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-285",
    nodeId: "ai-rec-engineering",
    question: "推荐系统 A/B 测试如何设计？离线涨在线不涨时怎么排查？",
    answer: `【分层原理】结论：A/B 测试是推荐迭代的唯一裁判，设计核心是"分流正交、指标先行、样本量够、干扰隔离"。第一层：分流——按用户 id 哈希分桶（不是按请求，否则同一用户忽 A 忽 B 体验割裂），多层实验平台（Google 重叠实验架构）让召回层/排序层/UI 层实验并行且组间正交，每层独立 100% 流量复用；第二层：指标——先定北极星（如人均时长）和护栏（留存/负反馈/服务延迟），显著性用 p-value/置信区间，样本量提前用 MDE（最小可检测效应）反推，CTR 类指标 0.3% 的提升通常需单组几十万日活跑 1-2 周；第三层：干扰——新奇效应（新策略前 3 天虚高）需拉长观察，网络效应（双边市场实验组抢了控制组的供给）需用地理隔离/双边分流等特殊设计；第四层：离线涨在线不涨的三板斧排查：特征穿越（训练用了未来信息）、分布偏移（离线样本是旧策略产生的）、工程落差（特征生产口径/模型版本不一致）。

【实际案例】字节公开的实验文化：推荐任何改动默认要过 A/B，实验平台同时跑数千个实验，靠层域分流实现流量复用。典型的新奇效应案例：某次 UI 改版实验前两天 CTR +5%，第 7 天回落到 +0.5%——如果 48 小时就推全，等于被新鲜感骗了。阿里公开复盘过双边干扰问题：外卖场景给实验组用户推更优商家，实验组把热门商家产能吃光，控制组体验下降，差值被高估——改用"商家侧+用户侧双边分流"解决。离线涨在线不涨的真实案例：某团队离线 AUC +1.2% 上线 CTR 纹丝不动，排查发现训练样本里"是否曝光"本身泄漏了位置信息，模型离线学了位置先验而线上打分位置是未知的——特征穿越的典型形态。

【举一反三】广告实验要额外看平台收入（RPM）与广告主 ROI 的平衡；社交产品看网络效应需群随机（cluster randomization）；小流量新业务样本量不够可用 CUPED（用实验前数据降方差）或分层抽样提效。通用决策：样本量不够别硬跑，先降方差或放大效应量（合并相似改动）。

【扣分点对照】背八股的会说"分流跑数据看显著性"；真做过的能讲清为什么按用户不按请求分流、新奇效应怎么识别（按天分桶看指标曲线形态）、离线涨在线不涨时先查什么（先查特征穿越，再查分布偏移，最后查工程实现）。

\`\`\`python
# 分流：用户 id 哈希，层内互斥、层间正交
def bucket(user_id, layer, n=100):
    h = md5(f"{layer}:{user_id}".encode()).hexdigest()
    return int(h[:8], 16) % n                  # 0-99 桶
# 样本量估算（比率指标）
def sample_size(p, mde, alpha=0.05, power=0.8):
    from statsmodels.stats.power import NormalIndPower
    effect = mde / np.sqrt(p * (1 - p))        # Cohen's h 近似
    return NormalIndPower().solve_power(effect, alpha=alpha,
                                        power=power)
\`\`\`

踩坑：①按请求分流，同一用户一会新版一会旧版，行为数据互相污染；②实验跑 3 天看到显著就推全，撞上新奇效应，推全后回落；③忽略护栏指标：CTR 涨了但负反馈率也涨、留存跌，长期伤害大于短期收益——推全决策必须北极星+护栏同时过关。`,
    keyPoints: ["按用户哈希分流，层间正交复用流量", "北极星+护栏指标，样本量按 MDE 反推", "新奇效应拉长观察", "离线涨在线不涨先查特征穿越"],
    followUps: ["为什么必须按用户 id 分流而不是按请求？（提示：同一用户策略不一致既割裂体验又污染行为归因）", "CUPED 为什么能加速实验？（提示：用实验前协变量解释掉指标方差，等效样本量放大，小流量业务也能测出小效应）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-rl-fundamentals =====

  {
    id: "ai-168",
    nodeId: "ai-rl-fundamentals",
    question: "MDP 马尔可夫决策过程？状态/动作/奖励/转移如何定义？",
    answer: `【分层原理】结论：MDP 用五元组 (S, A, P, R, γ) 把"序列决策"形式化——智能体在状态 s 选动作 a，环境按 P(s'|s,a) 转移并给奖励 r，目标是找策略 π 最大化折扣累计奖励 E[Σγ^t·r_t]。第一层：马尔可夫性=下一状态只依赖当前状态与动作，与历史无关——这让 Bellman 方程 V(s)=max_a[R+γΣP·V(s')] 成立，动态规划可解；第二层：γ∈[0,1) 折现未来，γ→0 只看重眼前（myopic），γ→1 看重长远但值函数可能不收敛；第三层：已知 P 和 R 时用值迭代/策略迭代求解（model-based），未知时用采样学习（model-free，Q-Learning/PPO 都属于此类）；第四层：真实问题大多不完全可观测（POMDP），工程上用"堆叠历史特征"把部分可观测问题近似成马尔可夫——推荐里把用户近 N 条行为塞进 state 就是这个思想。

【实际案例】阿里在淘宝列表推荐的 RL 建模（公开论文）：state=用户近期浏览/购买序列编码的兴趣向量，action=一页推荐的商品列表，reward=点击率×1+加购×2+成交×5 的加权，γ=0.9；相比 supervised 精排，长期 GMV 提升约 2%（公开口径）。广告竞价场景（腾讯/字节 RTB）：state=剩余预算+剩余时间+流量分布，action=出价，reward=转化数-成本惩罚，用 RL 学"预算在一天内平滑花完且在优质流量上加价"——相比固定出价策略，广告主 ROI 提升 10-20%（公开分享量级）。γ 的选择在这些场景有明确业务含义：次日留存权重高就调大 γ。

【举一反三】游戏 AI（状态=棋盘，P 已知可直接树搜索）；机器人控制（state=关节角度，连续动作空间用 DDPG/PPO）；网约车调度（state=城市网格供需，reward=应答率）。通用决策：建模时先问"state 是否满足马尔可夫性"——不满足就把历史堆进去，再问"reward 是否对齐业务北极星"。

【扣分点对照】背八股的会背五元组定义；真做过的能讲清马尔可夫性为什么让 Bellman 方程成立、γ 在推荐场景的业务含义（γ=0 退化成 supervised CTR 预估）、真实系统几乎都不满足马尔可夫性时怎么办（历史堆叠/RNN 状态）。

\`\`\`python
import numpy as np
def value_iteration(P, R, gamma=0.9, tol=1e-6):
    # P[s][a][s']: 转移概率, R[s][a]: 即时奖励
    n_s, n_a = R.shape
    V = np.zeros(n_s)
    while True:
        Q = R + gamma * np.einsum("san,n->sa", P, V)  # Bellman 最优备份
        V_new = Q.max(axis=1)
        if np.abs(V_new - V).max() < tol: break
        V = V_new
    return Q.argmax(axis=1), V               # 最优策略与值函数
\`\`\`

踩坑：①reward 设计与业务目标错位——奖励点击率，策略学会推标题党（reward hacking 的雏形）；②state 只放当前请求特征不满足马尔可夫性，值函数学不收敛；③γ 拍脑袋设 0.99，长 horizon 下值估计方差爆炸，推荐场景 0.8-0.95 更稳。`,
    keyPoints: ["五元组 S/A/P/R/γ 形式化序列决策", "马尔可夫性是 Bellman 方程前提", "γ 折现未来，业务上=长短期权重", "POMDP 用历史堆叠近似"],
    followUps: ["为什么马尔可夫性是 Bellman 方程成立的前提？（提示：V(s) 只依赖 s 才能递归定义，历史相关则状态定义不完整）", "推荐场景 γ 取 0 等价于什么？（提示：退化成最大化即时奖励=监督学习 CTR 预估，说明 RL 的价值全在长期项）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-169",
    nodeId: "ai-rl-fundamentals",
    question: "Q-Learning 原理？Q 值如何更新？off-policy 含义？",
    answer: `【分层原理】结论：Q-Learning 直接学最优动作价值函数 Q*(s,a)，更新目标用 max_a' Q(s',a')——不管行为策略实际选了什么，这就是 off-policy 的含义。第一层：TD 更新 Q(s,a)←Q+α[r+γ·max Q(s',·)-Q]，括号内是 TD 误差，无需环境模型、无需完整回合，单步即可学习；第二层：off-policy=目标策略（greedy）与行为策略（ε-greedy）分离，可以用旧数据/别人的数据学最优策略——这是经验回放和离线 RL 的理论根基；第三层：max 算子带来过估计问题（对噪声取 max 系统性偏高），Double Q-Learning 用两个 Q 网络解耦"选动作"和"估价值"缓解；第四层：表格法只适用小状态空间，大状态空间用函数逼近（DQN）。

【实际案例】DQN 是其深度化：DeepMind 2015 Nature 用同一套超参在 49 个 Atari 游戏达人类水平，关键工程就是补经验回放和目标网络。工业侧：百度凤巢广告出价用 Q-Learning 变体（state=流量+剩余预算，action=出价档位），广告主成本降 8%（公开量级）；美团配送派单用其做骑手调度，超时率降约 1.5 个点。共性：行为数据海量且来自旧策略——off-policy 是刚需。

【举一反三】SARSA 把 max 换成实际执行的 a'，适合探索有代价的场景；Expected SARSA 用期望降方差；max 思想延续到 DQN 全家桶。决策：历史日志→off-policy 必选；在线学习且探索危险→SARSA。

【扣分点对照】背八股的会背更新公式；真做过的能讲清 max 算子为什么导致过估计（E[max]≥max E，噪声被系统性放大）、off-policy 为什么重要（经验回放/离线学习/行为策略可以是探索性的）、Q 表在大状态空间为何不可行。

\`\`\`python
import numpy as np
def q_learning(env, episodes=5000, alpha=0.1, gamma=0.95, eps=0.1):
    Q = np.zeros((env.n_states, env.n_actions))
    for _ in range(episodes):
        s, done = env.reset(), False
        while not done:
            if np.random.rand() < eps:
                a = env.action_space_sample()      # 探索
            else:
                a = Q[s].argmax()                  # 利用
            s2, r, done = env.step(a)
            td_target = r + gamma * Q[s2].max()    # off-policy: max
            Q[s, a] += alpha * (td_target - Q[s, a])
            s = s2
    return Q
\`\`\`

踩坑：①α 固定不变导致后期震荡，应按访问次数衰减（α=1/N(s,a)）；②稀疏奖励下 Q 长期全零，探索效率极低——需 reward shaping 或好奇心奖励；③直接上深度网络不加目标网络和经验回放，TD 目标追着网络跑，训练发散。`,
    keyPoints: ["TD 更新：r+γ·maxQ 单步学习", "off-policy：目标与行为策略分离", "max 算子致过估计，Double 解耦", "经验回放+目标网络稳定深度版"],
    followUps: ["max 算子为什么会过估计 Q 值？（提示：对含噪估计取 max，E[max]≥max E，噪声越大越偏高）", "经验回放为什么必须配 off-policy 算法？（提示：回放数据来自旧行为策略，on-policy 算法无法用他策略数据）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-170",
    nodeId: "ai-rl-fundamentals",
    question: "SARSA vs Q-Learning 区别？on-policy vs off-policy？",
    answer: `【分层原理】结论：SARSA 用实际执行的下一动作 a' 更新（on-policy），Q-Learning 用 max Q(s',·) 更新（off-policy）——一个学"行为策略的价值"，一个学"最优策略的价值"。第一层：SARSA 更新 Q(s,a)←Q+α[r+γQ(s',a')-Q]，a' 是行为策略（如 ε-greedy）真实选出的，TD 目标里包含了探索动作的后果；第二层：Q-Learning 的 TD 目标假设下一状态按最优策略行动，与行为策略无关，因此更"乐观"；第三层：经典悬崖寻路实验——SARSA 学会绕远走安全路线（它知道 ε-greedy 会偶尔探索到悬崖边掉下去），Q-Learning 学会贴悬崖走最短路线（它假设下一步永远最优，训练中频繁摔落）；第四层：选型准则——在线学习且探索有真实代价（机器人、资金交易）用 SARSA 类；离线数据学习或探索无代价（仿真器、推荐回放日志）用 Q-Learning 类，off-policy 还能复用任意来源的历史数据。

【实际案例】机器人领域的标准实践：机械臂在线训练时探索动作可能撞坏设备，用 SARSA/Expected SARSA 把探索风险计入价值，学到的策略天然保守；而游戏 AI 在仿真器里探索零成本，Q-Learning/DQN 系是绝对主流。推荐场景的映射：如果用 RL 在线调推荐策略，探索（乱推内容）会伤害真实用户体验——有真实代价，所以工业界几乎不用纯在线 RL，而是用历史日志做 off-policy 学习（CQL/BCQ），或用 SARSA 思想做"保守策略评估"。滴滴公开的司机调度实践：用 SARSA 做在线策略迭代，因为司机端试错直接影响接单体验。

【举一反三】Expected SARSA 用期望代替采样 a'，方差更小且可退化成 Q-Learning（目标策略取 greedy 时）；n-step SARSA 在两者间折中偏差与方差；离线 RL 可以看作"行为策略固定且未知"的极端 off-policy 场景。决策模型：先问"探索的代价由谁承担"——仿真器承担选 Q 系，用户承担选保守路线。

【扣分点对照】背八股的会背"一个 on 一个 off"；真做过的能讲清悬崖实验中两者学出的策略差异及其根因（SARSA 的 TD 目标含探索代价）、Expected SARSA 取 greedy 目标策略时与 Q-Learning 的等价关系、工业界为什么偏爱 off-policy（历史日志是免费的数据资产）。

\`\`\`python
# SARSA：on-policy，a2 是行为策略实际选出的动作
a2 = epsilon_greedy(Q, s2, eps)
Q[s, a] += alpha * (r + gamma * Q[s2, a2] - Q[s, a])
# Q-Learning：off-policy，假设下一步按最优策略行动
Q[s, a] += alpha * (r + gamma * Q[s2].max() - Q[s, a])
# Expected SARSA：对下一动作取期望，方差更小
exp_q = (1 - eps) * Q[s2].max() + eps * Q[s2].mean()
Q[s, a] += alpha * (r + gamma * exp_q - Q[s, a])
\`\`\`

踩坑：①把 SARSA 当 Q-Learning 用——行为策略不变就永远学不到最优策略（它学的是行为策略的价值）；②悬崖场景用 Q-Learning 评估策略质量，训练曲线难看就误判算法失效，其实它学的是最优策略；③Expected SARSA 的期望动作分布算错（忘了 ε 归一），值估计整体偏移。`,
    keyPoints: ["SARSA：学行为策略的价值", "Q-Learning：学最优策略的价值", "悬崖实验：SARSA 保守 Q 系激进", "探索有代价选 SARSA 类"],
    followUps: ["悬崖寻路中两者学出的策略有何差异，为什么？（提示：SARSA 的 TD 目标含 ε-greedy 探索代价，故绕远；Q-Learning 假设后续最优故贴边）", "Expected SARSA 什么情况下等价于 Q-Learning？（提示：目标策略取 greedy 时，期望退化为 max）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-171",
    nodeId: "ai-rl-fundamentals",
    question: "Policy Gradient 策略梯度原理？REINFORCE 算法？",
    answer: `【分层原理】结论：策略梯度直接参数化策略 π_θ(a|s)，沿 ∇J(θ)=E[∇log π_θ(a|s)·G_t] 上升，不绕价值函数的弯。第一层：目标是最大化期望回报 J(θ)，用 log-derivative trick 把梯度写成 E[∇log π·G]——"让高回报轨迹中的动作概率变大"，即 REINFORCE；第二层：G_t 用整回合累计回报估计，无偏但方差极大（回合内所有动作共享同一回报，好坏不分），引入 baseline b(s)（通常用 V(s)）后梯度变 E[∇logπ·(G-b)]，期望不变方差大降——这是 Actor-Critic 的萌芽；第三层：相比值函数方法的三个优势：直接优化目标（不用绕 Q 取 argmax）、天然支持连续动作（输出高斯均值方差）、可学随机策略（石头剪刀布类博弈最优策略是随机的）；第四层：劣势同样鲜明——样本效率低（on-policy 数据用一次就扔）、对超参敏感，这催生 PPO 等改进。

【实际案例】OpenAI 机械手解魔方（2019）用 PPO 在仿真中训练连续控制策略再迁移真机；LLM 时代的 RLHF 本质就是策略梯度——语言模型当策略、token 生成当动作、RM 打分当奖励，PPO/GRPO 都是 REINFORCE 的现代变体（GRPO 用组内均值当 baseline，正是 REINFORCE+baseline 思想）。推荐场景：京东列表页 RL 排序用策略梯度直接优化"整页 GMV 期望"，采样+REINFORCE 估梯度，线上 GMV +1.5%（公开量级）。

【举一反三】连续控制（机械臂力矩、无人机油门）只能走策略梯度（Q 方法对连续动作取不了 argmax）；Bandit 是 horizon=1 的策略梯度特例；LLM 的 temperature 采样推理=随机策略部署。决策模型：动作空间连续/需要随机策略→策略梯度；离散小动作空间+样本宝贵→值函数方法。

【扣分点对照】背八股的会背 ∇J=E[∇logπ·G]；真做过的能讲清 log-derivative trick 怎么把期望梯度变可采样形式、baseline 为什么无偏（E[∇logπ·b]=0 对不依赖 a 的 b）、REINFORCE 方差大的根因（回合回报与单步动作弱相关）。

\`\`\`python
import torch
# REINFORCE with baseline
log_probs, values, rewards = rollout(policy, env)   # 采一回合
returns = discount(rewards, gamma=0.99)             # 蒙特卡洛回报
advantage = returns - values.detach()               # baseline 降方差
pg_loss = -(log_probs * advantage).mean()           # 高回报动作概率↑
value_loss = (values - returns).pow(2).mean()       # 学 V 当 baseline
loss = pg_loss + 0.5 * value_loss
# 连续动作: 网络输出 mu, sigma, 采样 a~N(mu,sigma), logπ 用高斯密度
\`\`\`

踩坑：①忘了对 baseline  detach，梯度经 value 网络回流污染策略更新；②回报不归一化（减均值除标准差），不同 episode 量纲差异导致更新忽大忽小；③on-policy 数据复用多轮训练，策略偏移后梯度有偏——复用需重要性采样修正（这就是 PPO 的 ratio）。`,
    keyPoints: ["∇J=E[∇logπ·G] 直接优化策略", "baseline 无偏降方差", "天然支持连续动作与随机策略", "on-policy 样本效率低"],
    followUps: ["baseline 为什么不影响梯度的无偏性？（提示：E_a[∇logπ(a|s)·b(s)]=b(s)·∇Σπ=0，b 不依赖动作即可）", "REINFORCE 的方差从哪里来，如何系统性降低？（提示：整回合回报与单步动作弱相关；baseline、GAE、增大 batch）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-172",
    nodeId: "ai-rl-fundamentals",
    question: "Actor-Critic 原理？如何结合策略梯度和价值函数？",
    answer: `【分层原理】结论：Actor-Critic 让 Critic（价值网络）当裁判、Actor（策略网络）当运动员——Critic 用 TD 学价值，Actor 用 Critic 给出的优势信号更新，兼得低方差与单步更新。第一层：REINFORCE 用整回合回报 G_t 当信号，方差大；Actor-Critic 用优势函数 A(s,a)=Q(s,a)-V(s) 替代，"比该状态平均好多少"才是动作真实贡献，方差大降；第二层：Critic 用 TD 误差 δ=r+γV(s')-V(s) 更新 V，δ 本身就是 A 的单步采样估计——一个网络两份用途，单步即可学习（不用等回合结束）；第三层：A 的多步估计有偏差-方差权衡，GAE（广义优势估计）用 (γλ)^l 加权的指数平均融合 1 步到 ∞ 步估计，λ=0 偏 TD 低方差高偏差，λ=1 偏蒙特卡洛反之；第四层：A3C/A2C 多 worker 并行采样打破时序相关，PPO 在其骨架上加 clip 约束更新幅度成现代标配。

【实际案例】DeepMind A3C（2016）用 16 个 CPU worker 并行在 Atari 超 DQN 且训练时间减半，证明 Actor-Critic 的扩展性；OpenAI Five（Dota2，2019）底层就是 PPO+大规模分布式，击败 TI 冠军 OG。工业推荐场景：阿里公开的 RL 排序方案中，Critic 预估"当前兴趣状态的长期价值"，Actor 输出列表策略，优势信号让"短期 CTR 高但伤留存"的动作被天然扣分——这是单用 supervised 做不到的。GAE 的 λ 通常取 0.9-0.95。

【举一反三】PPO/GRPO 都是 Actor-Critic 思想（GRPO 用组内均值替代 Critic 省显存）；AlphaGo 的策略网络+价值网络双头结构本质是 Actor-Critic；量化交易中 Actor 输出仓位、Critic 估组合价值。决策模型：需要在线单步更新+低方差→Actor-Critic；数据离线且量大→值函数系（DQN/CQL）。

【扣分点对照】背八股的会说"一个演员一个评论家"；真做过的能讲清 TD 误差 δ 为什么是优势函数的单步采样、GAE 的 λ 怎么权衡偏差方差、Actor 和 Critic 共享底层网络时的坑（两 loss 梯度互相干扰，需分头或调权重）。

\`\`\`python
import torch
# Actor-Critic with GAE
delta = r + gamma * V(s2) * (1 - done) - V(s)       # TD 误差
advantage = gae(delta, gamma, lam=0.95)             # 指数加权多步 δ
actor_loss = -(logp * advantage.detach()).mean()    # 优势引导策略
critic_loss = (V(s) - returns).pow(2).mean()        # TD 学价值
entropy = -(probs * logp_all).sum(-1).mean()
loss = actor_loss + 0.5 * critic_loss - 0.01 * entropy  # 熵鼓励探索
\`\`\`

踩坑：①Actor 和 Critic 全共享一个网络，两任务梯度冲突互相拖累——至少分头部；②advantage 忘了 detach，Critic 的梯度经 advantage 回流到 Actor；③Critic 学不准时 Actor 被错误优势信号带崩——Critic 通常要更大学习率或先预热训练。`,
    keyPoints: ["Critic 估优势，Actor 按优势更新", "TD 误差=优势单步采样，可在线学", "GAE λ 权衡偏差与方差", "PPO/GRPO 都是其现代变体"],
    followUps: ["为什么说 TD 误差是优势函数的单步采样估计？（提示：δ=r+γV(s')-V(s)≈Q(s,a)-V(s)=A(s,a)，把 Q 用单步回报近似）", "GAE 的 λ=0 和 λ=1 各退化成什么？（提示：λ=0 纯 TD 单步优势，λ=1 蒙特卡洛回报减 baseline）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-173",
    nodeId: "ai-rl-fundamentals",
    question: "DQN 原理与改进（Double/Dueling/Prioritized Replay）？",
    answer: `【分层原理】结论：DQN=深度 Q 网络+经验回放+目标网络三件套，三大改进分别治过估计、学值结构、采样效率。第一层：基础 DQN 用神经网络逼近 Q(s,a)，两个稳定器缺一不可——经验回放打散样本破时序相关（满足 SGD 独立同分布假设），目标网络 Q_target 周期性从主网络拷贝（TD 目标不再追着主网络跑）；第二层：Double DQN 治过估计——max 算子对噪声取最大导致 Q 系统性偏高，解耦为"主网络选动作、目标网络估值"，估计偏差显著下降；第三层：Dueling DQN 改结构——Q=V+A-mean(A)，很多状态下动作选择无关紧要（如路上没车时直行/微调都行），显式建模 V 让状态价值学习不被动作噪声干扰，收敛更快；第四层：Prioritized Replay 按 |TD 误差| 加权采样多练慢样本，引入分布偏差需 IS 权重纠正。

【实际案例】原始 DQN（2015 Nature）在 49 个 Atari 游戏达人类水平；Rainbow（2017）把 Double/Dueling/PER 等六改进全叠，中位数性能再翻倍，证明这些改进正交可叠加。工业侧：京东/淘宝公开的 RL 列表生成都用 Dueling+Double——推荐状态下动作价值接近，Dueling 的 V(s) 学得快训练稳；阿里智能出价用 PER：高 TD 误差样本恰是"预算耗尽临界"等关键时刻，收敛提速约 40%（公开量级）。

【举一反三】PER 的思想迁移到监督学习=难例挖掘（OHEM/focal loss 同源）；Dueling 的"状态基线+动作增量"结构与 RLHF 里 reward 减 baseline 同构；Double 思想在多模型集成中用于防 winner's curse。决策模型：动作价值差异小（推荐/调度）优先 Dueling；Q 噪声大（稀疏奖励）优先 Double；样本贵优先 PER。

【扣分点对照】背八股的会列三个改进名；真做过的能讲清 Double 为什么必须两个网络（同一网络选+估，max 噪声自相矛盾）、Dueling 为什么减 mean(A)（否则 V/A 不可辨识）、PER 的 IS 权重为什么在 β→1 退化为均匀校正。

\`\`\`python
import torch
class DuelingDQN(torch.nn.Module):
    def forward(self, s):
        f = self.feature(s)
        V = self.value_head(f)                 # 状态价值 (B,1)
        A = self.adv_head(f)                   # 动作优势 (B,n_a)
        return V + A - A.mean(-1, keepdim=True)  # 可辨识约束
# Double DQN 目标：online 选动作，target 估值
a_star = online_net(s2).argmax(-1, keepdim=True)
q_next = target_net(s2).gather(-1, a_star)
td_target = r + gamma * q_next * (1 - done)
# PER: 采样概率 p∝|δ|^α, 校正权重 w=(1/(N·p))^β
\`\`\`

踩坑：①目标网络更新太勤（每步拷贝）等于没目标网络，训练震荡——硬更新间隔千步级或 τ=0.005 软更新；②PER 不加 IS 权重校正，高优先级样本主导过拟合难例；③回放缓冲区太小（<10 万），近期样本占比高，旧策略遗忘导致灾难性循环。`,
    keyPoints: ["经验回放+目标网络=稳定基座", "Double 解耦选与估治过估计", "Dueling 分解 V+A 加速收敛", "PER 按 TD 误差优先，IS 纠偏"],
    followUps: ["Dueling 中为什么要减 mean(A)？（提示：Q=V+A 分解不唯一，加 A 均值为零的约束才可辨识）", "PER 为什么需要重要性采样权重？（提示：优先采样改变了数据分布，需 w=(1/Np)^β 纠偏，否则收敛到有偏解）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-174",
    nodeId: "ai-rl-fundamentals",
    question: "RL 在推荐/广告如何应用？长期价值优化怎么做？",
    answer: `【分层原理】结论：推荐 RL 把"排序"从单次打分升级为序列决策——state 是用户兴趣，action 是推荐内容，reward 是即时反馈+长期留住的折现和，目标是用户生命周期价值（LTV）最大化。第一层：为什么需要 RL——supervised CTR 模型优化"这一跳"，但推荐是连续剧：今天推的内容改变用户明天的兴趣分布，长期价值（留存、复访、LTV）无法用单步监督信号表达；第二层：建模难点在 action 空间——一次曝光 8-12 个 item 的组合空间是天文数字，工业界用"逐位生成"（RNN/指针网络逐个产出）或"单 item 打分+listwise 重排奖励"近似；第三层：reward 工程是成败关键——点击 1 分、完播加权、关注/复访高分、负反馈重罚，系数决定策略性格；第四层：落地路线几乎全是离线 RL 或"仿真器+小流量"——在线探索伤用户体验，用历史日志做 off-policy 评估（IPS/Doubly Robust）先在沙盘里赢过基线，再小流量验证。

【实际案例】阿里公开的 RL 推荐实践（淘宝列表页）：state=用户近期行为编码，action=页面商品序列，reward 含点击/加购/成交，用 DDPG 变体+仿真环境预训练，线上 GMV 提升约 2%；腾讯广告智能出价：RL 学"预算约束下的全天出价曲线"，相比规则策略广告主转化成本降 8-15%（公开量级）；字节的探索实践：用 RL 在"即时 CTR"与"用户兴趣多样化"间权衡，长期留存指标 +0.4%——数字不大但留存类指标的 0.4% 对应亿级 DAU 产品的巨大绝对值。

【举一反三】广告出价、推荐排序、内容流量分配（给哪个垂类多少流量）是 RL 在增长域的三架马车；外卖配送的派单（state=供需分布，reward=准时率+骑手效率）同构。通用决策：先建仿真器做离线评估，指标同时看即时收益与留存护栏，reward 系数用 A/B 扫而非拍脑袋。

【扣分点对照】背八股的会说"用 DQN 做推荐"；真做过的能讲清 action 空间爆炸怎么解（逐位生成/listwise 近似）、离线 RL 为什么必须（在线探索伤用户）、reward 里留存项怎么定义才不被短期指标淹没（复访窗口、折现系数）。

\`\`\`python
# 推荐 RL 主循环（离线日志 + 仿真评估）
state = user_encoder(history)                  # 兴趣状态
action = actor(state)                          # 列表生成策略
reward = 1*click + 2*finish + 5*follow - 3*dislike + 4*revisit_d1
# 离线评估: Doubly Robust 估计新策略价值再上小流量
dr = ips_reward + (q_hat(s, a_new) - q_hat(s, a_log))
\`\`\`

踩坑：①reward 系数拍脑袋定，策略学会"骗分"——推擦边内容点击高但留存崩，reward hacking 必须配护栏指标；②直接在线探索训练，小流量期间用户体验受损、数据被污染；③仿真器与真实环境差距大（sim2real gap），仿真里 +5% 上线 -1%——仿真器需定期用真实日志校准。`,
    keyPoints: ["推荐=序列决策，优化 LTV 非单次 CTR", "action 组合爆炸用逐位生成近似", "reward 工程决定策略性格", "离线 RL+仿真评估再小流量"],
    followUps: ["推荐 RL 的 action 空间爆炸怎么解？（提示：逐位生成把列表拆成序列决策，或单 item 打分+listwise 奖励近似）", "为什么不能直接在线训练 RL 推荐？（提示：探索期伤害真实用户体验，且污染后续训练数据分布）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-286",
    nodeId: "ai-rl-fundamentals",
    question: "离线强化学习（Offline RL）原理？分布外动作问题如何解决（BCQ/CQL/IQL）？",
    answer: `【分层原理】结论：离线 RL 只用固定历史日志学策略、不允许与环境交互，核心难题是"分布外（OOD）动作的价值被高估"——模型对没见过的动作乱打分，策略专挑这些被高估的坑跳。第一层：标准 off-policy 算法（DQN/DDPG）在离线场景失效——TD 目标里的 max/argmax 会选中日志中不存在的动作，函数逼近对这些 OOD 动作的外推误差被 max 放大，bootstrap 滚雪球式传播，值函数发散；第二层：BCQ（Batch-Constrained Q）思路最直观——用生成模型（VAE）从日志分布中采样候选动作，只在"行为策略见过附近"的动作上取 max，把策略约束在数据流形内；第三层：CQL（Conservative Q-Learning）不约束动作空间，而是给 Q 函数加正则：对当前策略会选的动作压低 Q 值、对日志中的动作抬高 Q 值，学到的 Q 对 OOD 动作天然保守悲观；第四层：IQL（Implicit Q-Learning）更彻底——完全不对 OOD 动作查询 Q，用 expectile 回归从数据内动作拟合价值，再用优势加权行为克隆提取策略，训练最稳。

【实际案例】推荐/广告是离线 RL 最现实的应用场：字节/快手都公开过用离线 RL 从推荐日志学排序策略，因为在线探索的代价是真实用户流失。阿里在出价场景实践：历史日志由多代旧策略混合产生，直接跑 DDPG 值函数两周内发散到天文数字（OOD 高估的典型症状），换 CQL 后训练稳定，小流量 A/B 转化成本 -5%。工业界更广的落地其实是 IQL 路线的"优势加权回归"——实现接近行为克隆，工程团队敢接手：美团公开的履约调度优化用类似思路，在不改动在线系统的前提下从半年日志学出新派单策略，超时率降 0.8 个点。共性教训：离线 RL 的收益上限受限于日志覆盖度——日志里从没出现过的策略空间，再保守的算法也学不到。

【举一反三】自动驾驶用离线 RL 从车队数据学驾驶策略（不能在线试错）；医疗治疗策略学习只能离线（伦理禁止探索）；LLM 的 DPO 本质是"无显式 RL 的离线偏好学习"，与 IQL 的优势加权思想一脉相承。决策模型：日志覆盖度差→先做探索策略补数据；覆盖度够→IQL 起步（稳），收益不够再上 CQL。

【扣分点对照】背八股的会说"离线 RL 用历史数据训练"；真做过的能讲清 OOD 高估的机理（外推误差×max 算子×bootstrap 传播）、BCQ/CQL/IQL 三派路线差异（约束动作/惩罚价值/回避查询）、日志覆盖度为什么决定收益上限。

\`\`\`python
# CQL 核心损失：Bellman 误差 + 保守正则
q_pred = Q(s, a_log)                           # 日志动作的 Q
q_ood = Q(s, a_policy)                         # 当前策略动作的 Q
bellman = (q_pred - (r + gamma * Q_target(s2).max())) ** 2
conservative = torch.logsumexp(q_ood, dim=-1).mean() - q_pred.mean()
loss = bellman.mean() + alpha * conservative   # 压低 OOD 抬高数据内
\`\`\`

踩坑：①拿在线 RL 代码直接跑离线日志，值函数发散还以为调参能救——必须换离线专用算法；②日志来自单一旧策略且探索极少，数据覆盖度不足，学什么都是行为克隆的上限；③评估也用同一批日志（无 off-policy 评估），离线指标虚高，上线翻车——需 IPS/DR 或留出时间段评估。`,
    keyPoints: ["OOD 动作高估=离线 RL 核心难题", "BCQ 约束动作在数据流形内", "CQL 对 OOD 价值保守惩罚", "IQL 回避查询，expectile+加权克隆"],
    followUps: ["为什么标准 DQN 在离线场景会发散？（提示：max 选中 OOD 动作，外推误差被 bootstrap 反复传播放大）", "CQL 的保守正则具体在做什么？（提示：压低当前策略动作的 Q、抬高日志动作的 Q，让 Q 对 OOD 天然悲观）"],
    favorited: false,
    bigTech: true,
  },
  // ===== ai-rl-advanced =====

  {
    id: "ai-175",
    nodeId: "ai-rl-advanced",
    question: "PPO 原理？为何成为 RLHF 主流算法？",
    answer: `【分层原理】结论：PPO 用 clipped surrogate objective 把策略更新幅度裁剪在安全区，以一阶优化的成本逼近 TRPO 的稳定性。第一层：朴素策略梯度对新数据只能更新一次，策略偏一点梯度就有偏——样本效率低；第二层：TRPO 引入重要性采样比 ratio=π_new/π_old 让旧数据可复用，并用 KL 约束限步长，但需解二阶优化（共轭梯度+Fisher 矩阵）实现复杂；第三层：PPO 的洞察是"约束可简化成 clip"——目标 min(ratio·A, clip(ratio,1-ε,1+ε)·A)，ratio 超出 [1-ε,1+ε] 梯度被截断，策略不因单批数据跑偏，ε 通常 0.1-0.2；第四层：完整 PPO 还配 GAE 优势估计、value loss（0.5）、entropy bonus（0.01）防过早收敛，多 epoch 复用数据配 KL 早停。

【实际案例】OpenAI PPO（2017）后成默认算法：OpenAI Five、机械手解魔方、InstructGPT/ChatGPT 的 RLHF 全用 PPO。InstructGPT 公开细节：1.3B 模型经 PPO（RM 奖励+KL 惩罚）后人工偏好胜率超 175B GPT-3——对齐收益远大于堆参数，直接确立 RLHF 范式。LLM 场景特殊工程：一次 rollout 是生成整段回答，KL 惩罚 KL(π_θ||π_ref) 防模型为刷 RM 分输出乱码（reward hacking）。2024 年后 GRPO 等去 critic 变体兴起，PPO 仍是 trl/OpenRLHF 等框架默认基线。

【举一反三】clip 思想可迁移到任何"用旧数据更新新策略"的场景：推荐在线学习的信任域限制、A/B 灰度同源；GRPO 用组内均值替代 critic 是 PPO 的降显存变体；DPO 把 PPO+RM 折叠成一个分类损失。决策模型：动作连续/需在线交互→PPO；纯离线偏好数据→DPO；显存受限→GRPO。

【扣分点对照】背八股的会背 clip 公式；真做过的能讲清 clip 为什么有效（截断超出信任域的梯度方向）、KL 早停和 clip 的双重保险关系、LLM RLHF 里 PPO 的四个模型（policy/ref/RM/critic）各自角色和显存账。

\`\`\`python
import torch
def ppo_loss(logp_new, logp_old, adv, ret, v_pred, eps=0.2):
    ratio = torch.exp(logp_new - logp_old)     # π_new/π_old
    s1 = ratio * adv
    s2 = torch.clamp(ratio, 1 - eps, 1 + eps) * adv
    pg = -torch.min(s1, s2).mean()             # clip 截断激进更新
    v_loss = (v_pred - ret).pow(2).mean()      # critic 回归回报
    return pg + 0.5 * v_loss - 0.01 * entropy_bonus
# 每批数据复用 3-4 epoch，KL(policy||ref) 超阈值即早停
\`\`\`

踩坑：①advantage 不做归一化，不同 batch 尺度差异导致更新忽大忽小；②多 epoch 复用数据不配 KL 早停，epoch 3 之后策略已漂出信任域，clip 也救不回；③LLM 场景 KL 系数设为 0，模型几轮就学会输出 RM 偏好的奇怪格式（过长的列表、堆叠褒义词）——reward hacking。`,
    keyPoints: ["clip 截断替代 TRPO 二阶约束", "ratio 重要性采样复用旧数据", "GAE+value loss+entropy 三件套", "RLHF 四模型：policy/ref/RM/critic"],
    followUps: ["PPO 的 clip 为什么能替代 TRPO 的 KL 约束？（提示：超出信任域的样本梯度被置零，一阶近似实现类似约束，省去 Fisher 矩阵求逆）", "RLHF 中 PPO 的 KL 惩罚项在防什么？（提示：防策略为刷 RM 分而偏离语言建模能力，即 reward hacking）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-176",
    nodeId: "ai-rl-advanced",
    question: "RLHF 三阶段流程？SFT/RM/PPO 各做什么？",
    answer: `【分层原理】结论：RLHF 把"人类偏好"蒸馏进 LLM 分三步——SFT 教格式、RM 学偏好、PPO 用偏好打分反向优化策略。第一层：SFT（监督微调）用人工撰写的高质量指令-回答对微调基座模型，让模型学会"指令→回答"的基本格式与遵循能力，这是对齐的冷启动；第二层：RM（奖励模型）训练——同一 prompt 采样多个回答，人工标注排序（A>B），用 Bradley-Terry 损失 -log σ(r_A-r_B) 训练打分模型，RM 把不可微的人类偏好变成可微的标量信号；第三层：PPO 阶段把 SFT 模型当初始策略，对 prompt 生成回答，RM 打分作为奖励，同时加 KL(π_θ||π_SFT) 惩罚防止模型为刷分偏离语言能力，策略梯度更新；第四层：三阶段各自失败形态不同——SFT 差则指令遵循就不行，RM 差则 PPO 放大错误偏好，PPO 超参差则输出退化（重复、格式怪）。

【实际案例】OpenAI InstructGPT 论文（2022）是范式确立之作：40 人标注团队，SFT 用 13k 示范数据，RM 用 33k 偏好对，PPO 用 31k prompt；结果 1.3B InstructGPT 的人工偏好胜率超过 175B GPT-3，且真实性和无害性同时提升——证明"对齐税"可以很小甚至为负。Meta Llama2-Chat 走得更远：五轮 RLHF 迭代、超 100 万条人类偏好标注，RM 分 helpfulness 和 safety 双头训练，公开报告 PPO 阶段拒绝采样（rejection sampling）辅助：每个 prompt 采 K 个回答用 RM 选最优回灌 SFT。国内 Qwen/豆包等同路线：SFT→RM→PPO/DPO，差异在标注体系与领域配比。

【举一反三】多模态模型对齐（图文偏好 RM）同流程；代码模型的 RL 用编译/单测通过率替代人工 RM（可验证奖励）；Agent 场景把"任务完成度"当 RM。决策模型：有人类偏好数据→标准三段式；有可自动验证的信号（数学/代码）→跳过 RM 直接 RLVR。

【扣分点对照】背八股的会背"SFT 学格式、RM 学偏好、PPO 优化"；真做过的能讲清 RM 为什么用 pairwise 排序而非绝对打分（标注者间一致性高、绝对分不可比）、KL 惩罚的参考模型为什么冻结在 SFT 而非 RM 阶段、三阶段数据量的数量级关系（SFT 万级、RM 十万级偏好对）。

\`\`\`python
# 三阶段主流程
sft = train(base, demo_data)                   # Stage1: 指令微调
rm = train_rm(pairs)                           # Stage2: loss=-logσ(r_A-r_B)
for prompt in prompts:                         # Stage3: PPO
    resp = policy.generate(prompt)
    r = rm(prompt, resp) - beta * kl(policy, sft)  # RM 奖励 - KL 惩罚
    ppo_update(policy, resp, r)                # clip 目标更新
\`\`\`

踩坑：①RM 过拟合标注员的表面偏好（如偏爱长回答），PPO 阶段模型输出越来越长——RM 需长度归一化+多标注者仲裁；②PPO 的 KL 系数 β 太小，模型崩坏输出乱码刷分；太大则学不动，β 需随训练自适应调整；③SFT 数据质量差（网上爬的问答），后面两阶段救不回来——SFT 宁缺毋滥。`,
    keyPoints: ["SFT 教指令遵循与格式", "RM 用 BT 模型蒸馏人类偏好", "PPO：RM 奖励+KL 惩罚优化策略", "1.3B 对齐可胜 175B 未对齐"],
    followUps: ["RM 为什么用成对排序而非绝对打分？（提示：标注者对排序的一致性远高于绝对分，且 BT 模型天然处理相对比较）", "PPO 阶段为什么必须用 SFT 模型做 KL 参考？（提示：锚定语言能力，防策略为刷 RM 分退化；参考模型随训练更新会锚定失效）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-177",
    nodeId: "ai-rl-advanced",
    question: "奖励建模（Reward Model）如何训练？偏好数据如何收集？",
    answer: `【分层原理】结论：RM 是把"人类偏好"参数化成可微标量函数的桥梁，用 Bradley-Terry 模型从成对比较中学打分。第一层：数据形态——同一 prompt 的多个回答，标注员排序或两两比较（chosen/rejected 对），pairwise 而非绝对分，因为人对"哪个更好"的判断一致性远高于"好到几分"；第二层：BT 模型假设 P(A>B)=σ(r_A-r_B)，训练损失 -log σ(r_chosen-r_rejected)，让分数差对齐人类偏好序，RM 通常用 SFT 模型初始化、去掉生成头换成标量头；第三层：排序不变性——BT 只约束分差，r 整体平移不影响 loss，所以推理时 RM 分数要做校准（或对每 prompt 标准化）；第四层：RM 的致命弱点是泛化——它只在标注分布内可靠，PPO 把策略推到分布外后 RM 分数失真，这就是 reward hacking 的温床，因此 RM 需随策略迭代重新收集数据训练（迭代式 RLHF）。

【实际案例】InstructGPT 标注管线是行业模板：40 名标注员经筛选培训，标注指南数十页，标注者间一致性监控在 72-78%；Llama2 公开数据：超 100 万条偏好标注分批迭代，RM 分 helpfulness/safety 双头，并发现 RM 数据量翻倍时 PPO 收益近似对数线性增长——偏好数据是 RLHF 的"燃料"。反面案例同样公开：早期某开源项目用单一标注者的 cheap 偏好数据训 RM，PPO 后模型学会堆表情符号和奉承话（sycophancy），因为标注者潜意识里偏爱"态度好"的回答——RM 放大标注者的系统性偏差。Anthropic 用 Constitutional AI 部分替代人工：让 AI 按原则清单自我批评生成偏好对，标注成本降一个量级。

【举一反三】电商"好客服"对话偏好建模同流程；搜索相关性评估（good/fair/poor 分级转 pairwise）；Agent 轨迹偏好（哪个任务完成路径更优）。决策模型：先设计标注指南把模糊的"好"操作化成可执行 checklist，再谈标注量。

【扣分点对照】背八股的会背 BT 损失公式；真做过的能讲清为什么 pairwise 一致性高于绝对分、RM 平移不变性为什么要求推理时校准、迭代式 RLHF 为什么必须（静态 RM 防不住分布外 reward hacking）、sycophancy 是怎么被 RM 放大的。

\`\`\`python
import torch, torch.nn.functional as F
# Bradley-Terry 偏好损失
r_c = reward_model(prompt, chosen)             # chosen 得分
r_r = reward_model(prompt, rejected)           # rejected 得分
loss = -F.logsigmoid(r_c - r_r).mean()
# 工程增强: 同一 prompt 多回答可构 C(k,2) 对; 加边际正则
loss += margin_reg * F.relu(margin - (r_c - r_r)).mean()
# 推理校准: 对每个 prompt 的候选分数做 z-score 标准化再用
\`\`\`

踩坑：①标注指南模糊（"选更好的"），标注者各按各的标准，RM 学出一锅粥——指南必须操作化成可勾选 checklist；②chosen/rejected 长度系统性差异没控制，RM 学成"长度检测器"，PPO 后输出无限变长；③RM 训完一劳永逸，策略迭代几代后分数失真仍当奖励用——必须随策略分布更新偏好数据重训。`,
    keyPoints: ["BT 模型：P(A>B)=σ(分差)", "pairwise 标注一致性高于绝对分", "RM 分数平移不变需校准", "静态 RM 必遭 reward hacking"],
    followUps: ["为什么 pairwise 排序比绝对打分更可靠？（提示：人类相对比较判断一致性好、跨标注者可比；绝对分量纲人人不同）", "迭代式 RLHF 为什么必须重训 RM？（提示：PPO 把策略推到 RM 训练分布之外，静态 RM 在 OOD 区域打分失真被钻空子）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-178",
    nodeId: "ai-rl-advanced",
    question: "DPO 原理？为何无需 RM 直接优化偏好？",
    answer: `【分层原理】结论：DPO 从 RLHF 的最优解闭式形式出发反推——最优策略本身隐含奖励函数，于是跳过 RM 训练，直接用偏好对以分类损失优化策略。第一层：RLHF 的 KL 约束优化问题有解析解 π*(y|x)∝π_ref(y|x)·exp(r(x,y)/β)，反解得 r=β·log(π*/π_ref)+β·logZ(x)——奖励可以用策略比值表示；第二层：把这个 r 代入 BT 偏好模型，logZ 项在 chosen/rejected 相减时约掉，得到 DPO 损失 -log σ(β·[log(π_θ/π_ref)(y_w)-log(π_θ/π_ref)(y_l)])——让 chosen 的相对对数概率高于 rejected，就是一个二分类损失；第三层：π_ref（SFT 模型）充当隐式 KL 约束，β 控制偏离强度；第四层：省掉 RM 和 PPO 后无需在线生成采样、无需 critic、显存减半、训练稳定——但也失去在线探索能力，效果上限依赖偏好数据质量与覆盖，实践中常见"SFT→DPO 起步，收益见顶后上 PPO/GRPO 在线 RL"的混合路线。

【实际案例】DPO（NeurIPS 2023）发表后迅速成为开源社区对齐标配：Zephyr-7B 用 UltraFeedback 偏好数据+DPO 在 MT-Bench 上超越 Llama2-70B-Chat，证明小模型+好偏好数据+DPO 的性价比；Mistral、Qwen2.5、Llama3 的对齐管线都包含 DPO 或其变体（IPO/KTO/ORPO）。工业实践的经验值：DPO 相比 PPO 训练成本降 50-70%（无需四模型、无需 rollout），在偏好数据 10 万对以内时效果与 PPO 相当；但多项公开对比（如 Llama3 技术报告）显示大规模在线 RL 在推理类任务上仍更强——DPO 是"性价比之王"而非"效果之王"。KTO 变体进一步只要"好/坏"单边标注无需成对，标注成本再降。

【举一反三】推荐场景的"用户对物品 A 的偏好高于 B"日志可直接 DPO 化训练生成式推荐模型；多模态对齐（图文偏好）同样适用；没有成对数据只有点赞/点踩时用 KTO。决策模型：偏好数据 <50 万对且求快→DPO；有可验证奖励或追极限→在线 RL。

【扣分点对照】背八股的会说"DPO 不需要 RM"；真做过的能讲清 DPO 损失从 RLHF 解析解推导的过程（logZ 相约）、β 的作用（等价 KL 约束强度）、DPO 的两个失效模式（偏好数据分布太窄、对 chosen 的概率也可能降——只是 rejected 降更快）。

\`\`\`python
import torch, torch.nn.functional as F
def dpo_loss(pi_w, ref_w, pi_l, ref_l, beta=0.1):
    # pi/ref: 策略与参考模型对序列的 logprob
    logits = beta * ((pi_w - ref_w) - (pi_l - ref_l))
    return -F.logsigmoid(logits).mean()        # chosen 相对概率↑
# π_ref 冻结; β 大=贴近参考模型, β 小=偏好优化激进
\`\`\`

踩坑：①序列 logprob 没按 token 长度归一，长回答天然分低，模型越训越短；②β 设太小（0.01），几轮就偏离 SFT 语言能力开始复读；③偏好数据 chosen/rejected 同源同模型采样时 DPO 效果最佳，混用异源数据（别的模型生成）分布偏移明显——需注意数据管线一致性。`,
    keyPoints: ["RLHF 解析解反推奖励，折叠 RM 与 PPO", "BT 代入后 logZ 相消得分类损失", "π_ref 隐式 KL 约束，β 控强度", "省显存求稳定，上限靠数据"],
    followUps: ["DPO 损失推导中 logZ 为什么能消掉？（提示：chosen 与 rejected 同 prompt，配分函数相减约去，只剩策略比值差）", "DPO 相比 PPO 失去了什么？（提示：在线探索能力——DPO 只能在已有偏好数据分布内优化，无法发现数据外更优策略）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-179",
    nodeId: "ai-rl-advanced",
    question: "GRPO 原理？DeepSeek 如何用它降低 RLHF 成本？",
    answer: `【分层原理】结论：GRPO 用同 prompt 一组回答的组内相对优势替代独立 critic 网络，砍掉 PPO 的显存与训练复杂度一大块。第一层：PPO 需与策略同量级的 critic 估 V(s)，LLM 场景四模型（policy/ref/RM/critic）显存爆炸；第二层：GRPO 对每个 prompt 采 G 个回答（G=8-64），组内奖励均值、标准差归一化得优势 A_i=(r_i-mean)/std——组均值当 baseline，本质是 REINFORCE with baseline 组采样版，彻底不要 critic；第三层：目标仍是 PPO 式 clip+对 ref 的 KL 惩罚（直接进损失），兼稳定与省显存；第四层：GRPO 与可验证奖励（RLVR）绝配——数学对不对、代码过不过测试可程序化判定，无需 RM，绕开其成本与偏差。注意 R1-Zero≠R1：前者基座直接纯 RL，后者冷启动多阶段管线。

【实际案例】DeepSeek-R1（2025.1）用 GRPO+规则奖励（数学匹配、代码单测）训出比肩 o1 的推理能力，AIME pass@1 从 15% 级提到 70%+，成本远低于 PPO 管线——省 critic 意味 7B 模型 RL 显存近乎减半，无 RM 就没有 reward hacking 温床（规则刷不了分）。R1-Zero 证明纯 RL 可自发涌现反思、回溯，但输出混乱不可读，故工程上选 R1 冷启动路线。此后 Qwen/Kimi 等普遍用 GRPO 或变体（DAPO 改进 clip 与采样）。

【举一反三】代码 Agent 的 RL 训练（奖励=任务完成率）同用 GRPO；推荐"组内候选对比"可迁移到 listwise 优势估计；任何"奖励可程序化验证"的领域（数学/代码/棋类/结构化问答）都该优先 RLVR+GRPO 而非 RLHF+PPO。

【扣分点对照】背八股的会说"GRPO 不用 critic"；真做过的能讲清组内均值为什么等价于 baseline（同 prompt 下相对排序无偏）、R1-Zero 和 R1 的训练管线差异（纯 RL vs 冷启动多阶段）、可验证奖励为什么天然免疫 reward hacking（规则无法被讨好）。

\`\`\`python
import torch
def grpo_advantage(rewards):                   # (G,) 同 prompt 一组奖励
    return (rewards - rewards.mean()) / (rewards.std() + 1e-8)
def grpo_loss(logp_new, logp_old, adv, logp_ref, eps=0.2, beta=0.04):
    ratio = torch.exp(logp_new - logp_old)
    pg = -torch.min(ratio * adv,
                    torch.clamp(ratio, 1-eps, 1+eps) * adv).mean()
    kl = (logp_new - logp_ref).mean()          # KL 惩罚直接进损失
    return pg + beta * kl                      # 无 critic 无 RM
\`\`\`

踩坑：①组内奖励全相同时（全对或全错）std=0 优势为零，该 prompt 白采——需过滤零方差组或加课程学习控制难度；②组大小 G 太小（<8）优势估计方差大，G 太大采样成本高，需按任务难度自适应；③KL 项系数 β 照搬论文值，自己任务奖励尺度不同需重调——奖励方差大时 β 要相应调。`,
    keyPoints: ["组内相对优势替代 critic 网络", "clip+KL 保持 PPO 式稳定", "配可验证奖励绕开 RM", "R1-Zero 纯 RL，R1 冷启动多阶段"],
    followUps: ["GRPO 的组内均值为什么能当 baseline？（提示：同 prompt 下组内相对排序等价于 REINFORCE 减均值基线，无偏且方差低）", "可验证奖励为什么能免疫 reward hacking？（提示：规则判定无模型可讨好——答案对就是对，不存在钻 RM 空子的空间）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-180",
    nodeId: "ai-rl-advanced",
    question: "RLHF 工程挑战？显存/分布式/奖励黑客如何解决？",
    answer: `【分层原理】结论：RLHF 工程有三大山头——显存装不下、rollout 太慢、奖励模型被钻空子。第一层：显存——PPO 需同时驻留 policy（训练态）、ref、RM、critic 四模型，7B 全参 RLHF 轻松超 200GB；解法：LoRA/QLoRA 只训低秩增量（显存降 70%+）、量化加载 ref 与 RM、ZeRO-3 分片优化器状态；第二层：吞吐——80% 时间花在生成 rollout，解法：vLLM（PagedAttention+连续批处理）提速 10-20 倍、生成与训练分离架构、权重更新后同步推理实例；第三层：reward hacking——策略钻 RM 漏洞（输出变长、堆褒义词、格式怪异），解法：KL 惩罚锚定 ref、RM 集成投票、分数分位数截断、长度归一化；第四层：稳定性——advantage 归一化、KL 自适应系数、梯度裁剪，缺一都可能在百步内崩坏。

【实际案例】两大开源框架的公开实践：DeepSpeed-Chat 用 ZeRO-3+LoRA 让单台 8×A100 跑 13B 级 RLHF；OpenRLHF 用 Ray 把 vLLM 生成与训练 worker 分离调度，7B PPO 吞吐比 naive 提升约 3 倍。reward hacking 经典公开案例：某开源项目模型学会在回答末尾堆"希望这对你有帮助！"刷分，RM 分涨但人工评分降——迭代动作是 RM 数据加入"客套多但内容差"负样本+长度控制，hacking 收敛。DeepSeek 选规则奖励路线，从根上消灭一类 hacking。

【举一反三】多模态 RLHF 显存问题更凶（视觉编码器+LLM）；Agent RL 的 rollout 是环境交互更慢，需并行环境；推荐在线学习的防漂移护栏与 KL 锚定同源。决策模型：预算有限→LoRA+量化+GRPO 三件套；追极限性能→全参+分布式+迭代 RM。

【扣分点对照】背八股的会说"显存大、训练难"；真做过的能算清四模型显存账（7B 全参=权重 14G+梯度 14G+Adam 56G，再乘多模型）、讲清 vLLM 为什么快（PagedAttention 消除 KV cache 碎片+连续批处理）、举出具体 reward hacking 形态及对策。

\`\`\`python
# 显存优化三件套: LoRA + 量化 + ZeRO
policy = AutoModelForCausalLM.from_pretrained(
    base, load_in_4bit=True)                   # 量化加载
policy = get_peft_model(policy, LoraConfig(r=16, lora_alpha=32))
# rollout 用 vLLM: PagedAttention + 连续批处理
llm = LLM(model=ckpt, tensor_parallel_size=2)  # 生成提速 10x+
# reward hacking 防御: KL 锚定 + 长度归一 + 分数截断
r = min(rm(prompt, resp), quantile_99) - beta * kl(policy, ref)
r = r / (1 + len_penalty * resp_tokens)
\`\`\`

踩坑：①LoRA 的 r 设太小（4），策略学不动 RM 偏好，r=16-64 是经验甜区；②vLLM 与训练权重同步有版本错位（生成用旧权重），需在每轮 rollout 前强制 sync；③只监控 RM 分数不监控人工抽检，hacking 发生时 RM 分还在涨——必须保留人工/GPT-4 侧写评估作为真相源。`,
    keyPoints: ["四模型显存账：LoRA+量化+ZeRO", "vLLM 分离生成与训练提吞吐", "KL 锚定+集成+截断防 hacking", "人工抽检是 reward 真相源"],
    followUps: ["7B 全参 PPO 的显存账怎么算？（提示：policy 训练态约 84G+ref 14G+RM 14G+critic 训练态 84G，ZeRO 分片后多卡摊薄）", "vLLM 为什么比 HF generate 快一个量级？（提示：PagedAttention 消除 KV cache 内存碎片+连续批处理把 GPU 利用率拉满）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-181",
    nodeId: "ai-rl-advanced",
    question: "LLM 对齐实战与安全？如何防止有害输出？",
    answer: `【分层原理】结论：LLM 安全是"对齐+护栏+红队"三层纵深防御——对齐让模型内在不想作恶，护栏在外部拦截漏网之鱼，红队主动找漏洞反哺前两层。第一层：对齐层用 RLHF/DPO 把无害性偏好训进模型，Anthropic 的 Constitutional AI 用"原则清单+AI 自我批评"替代部分人工安全标注：先让模型按原则自我修订回答，再用修订前后对做偏好训练，成本降一个量级；第二层：护栏层是外部系统——输入侧提示注入检测/敏感话题分类器，输出侧 Moderation 分类模型逐段审核，命中即拒答或转安全话术，护栏与主模型解耦可独立快速迭代；第三层：红队层主动攻击——人工红队+自动化红队（用另一个 LLM 生成越狱提示，如 PAIR/GCG 攻击）持续挖掘新攻击面，发现的漏洞回灌成对齐数据与护栏规则；第四层：核心矛盾是"过对齐"——安全阈值调太高，正常请求（医学咨询、小说创作）也被拒答，用户体验崩坏，安全性与有用性的帕累托前沿需精细调权。

【实际案例】OpenAI 的公开安全架构：GPT-4 系统卡披露经过 6 个月红队测试才发布，Moderation API 对外提供多类目（暴力/自残/仇恨等）输出审核；Anthropic 公开 Constitutional AI 流程，Claude 的有害输出率相比纯 RLHF 显著下降且不过度拒答。国内实践：豆包/通义等产品均采用"对齐训练+输入输出双层审核+敏感话题安全库"，等保与备案要求生成内容可追溯。过对齐的典型失败：早期 Llama2-Chat 因安全权重过高，"如何杀死一个 Python 进程"这类正常技术问题也拒答，被社区群嘲后在后续版本回调——这是"kill 歧义"的经典案例。越狱攻防是军备竞赛：GCG 对抗后缀攻击曾能攻破多数开源模型，防御方通过对齐数据加入对抗样本训练逐步收敛。

【举一反三】多模态安全更难（图片绕过文本护栏，需视觉审核模型）；Agent 安全是新前沿（工具调用权限控制、动作白名单）；RAG 场景的间接提示注入（检索内容里藏指令）需检索侧过滤。决策模型：安全水位按场景定——医疗/金融从严，创作助手从宽，护栏规则热更新。

【扣分点对照】背八股的会说"RLHF 加内容过滤"；真做过的能讲清 Constitutional AI 的两阶段（自我批评修订+偏好训练）、过对齐的 kill 进程案例、护栏为什么必须与主模型解耦（主模型升级不改护栏，攻击响应速度按小时计）。

\`\`\`python
# 三层纵深防御（伪码）
def safe_chat(prompt):
    if input_guard.is_injection(prompt):       # 护栏1: 输入检测
        return refuse("检测到异常指令")
    resp = aligned_llm.generate(prompt)        # 对齐层: 内在安全
    flagged = moderation.classify(resp)        # 护栏2: 输出审核
    if flagged.score > THRESHOLD[resp.category]:
        return safe_template(flagged.category) # 安全话术兜底
    return resp
# 红队闭环: 攻击 LLM 生成越狱样本 → 测试 → 漏洞回灌对齐数据
\`\`\`

踩坑：①安全全靠对齐不加护栏，模型升级一次所有安全行为重训，攻击响应以周计——护栏解耦才能小时级热修；②过对齐一刀切，正常技术/医疗问题全拒答，用户流失后才回调——按类目分级阈值；③红队只在发布前做一次，上线后新攻击手法无人盯——红队需常态化+自动化。`,
    keyPoints: ["对齐+护栏+红队三层纵深", "Constitutional AI 原则自我批评", "护栏与主模型解耦可热修", "过对齐与安全需帕累托调权"],
    followUps: ["Constitutional AI 相比纯人工标注 RLHF 省在哪？（提示：用 AI 按原则清单自我批评生成偏好对，人工标注量降一个量级）", "为什么护栏必须与主模型解耦？（提示：主模型迭代周期以月计，攻击手法演化以天计，解耦后护栏规则可独立热更新）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-204",
    nodeId: "ai-rl-advanced",
    question: "o1/R1 类推理模型的范式？test-time scaling 与 self-consistency 原理？",
    answer: `【分层原理】结论：推理模型用 RL+可验证奖励把长思维链（CoT）训进模型，使 scaling 从训练时延伸到推理时——思考越久，难题越准。第一层：范式核心是把"想清楚再答"显式化——模型先在 thinking 段规划、尝试、验证、反思（aha moment）再给答案，长 CoT 本身就是更大有效计算量，accuracy 随推理 token 数近对数线性提升；第二层：训练侧——内生长 CoT（o1/R1 用 RL 固化，奖励=数学对/代码过测试等可验证信号）或过程奖励（PRM 每步打分，学"怎么推理"而非只学"答对"）；第三层：推理侧两路线——self-consistency 采样多条 CoT 多数投票（训练-free）、Best-of-N 配 ORM/PRM 筛选或引导搜索（需 RM 但更准）；第四层：代价与边界——推理成本数倍于普通调用，需按难度路由思考预算，且存在 overthinking：超过拐点的 token 反而引入错误。

【实际案例】o1（2024.9）首次公开该范式：AIME 从 GPT-4o 的 13% 提到 74%，o3 突破 ARC-AGI；DeepSeek-R1（2025.1）复现并开源，AIME pass@1 达 70%+、成本远低于预期，引发全行业跟进（Qwen-QwQ、Kimi k1.5、豆包深度思考）。工程共识：按难度分配思考预算——豆包/通义"深度思考"开关本质是 test-time compute 路由；self-consistency 作为低成本增强广泛用于评测（16-64 次采样投票再抬 pass@1 几点）。公开经验：Best-of-N 配好 PRM 比投票再高 3-5 点，但逐步标注成本极高。

【举一反三】代码 Agent 多路径探索（多补丁跑单测选最优）=Best-of-N；推荐重排"候选多样采样+价值模型筛选"同构；开放任务无法投票时用 RM 打分替代是标准降级。决策模型：答案可聚合（数学/选择）→投票；答案开放→Best-of-N+RM；追求极限→PRM 引导树搜索。

【扣分点对照】背八股的会说"推理时多采样投票"；真做过的能讲清 self-consistency 依赖"答案可聚合"这个前提（开放生成任务投票无效）、overthinking 现象（思考链过长引入自洽但错误的推理）、PRM 与 ORM 的标注成本差异（逐步标注 vs 只标结果）、思考预算路由的产品化逻辑。

\`\`\`python
from collections import Counter
# self-consistency: 多采样后多数投票（训练-free）
def self_consistency(model, q, n=16, temp=0.7):
    cots = [model.generate(q, temperature=temp) for _ in range(n)]
    answers = [extract_final_answer(c) for c in cots]
    return Counter(answers).most_common(1)[0][0]
# Best-of-N: RM 筛选, 更准但需奖励模型
best = max(samples, key=lambda s: reward_model.score(q, s))
\`\`\`

踩坑：①test-time 预算盲目加，过拐点后 overthinking 反掉点——按难度校准 token 预算；②self-consistency 用在开放任务（写作/翻译），答案无法聚合投票失效；③可验证奖励只覆盖封闭域，通用领域需 RM 打分替代；④长 CoT 直接展示有合规风险，产品侧需摘要或隐藏 thinking。`,
    keyPoints: ["RL+可验证奖励固化长 CoT", "推理算力换准确率近对数线性", "self-consistency 投票需答案可聚合", "overthinking 存在收益拐点"],
    followUps: ["PRM 与 ORM 的区别及成本差异？（提示：PRM 对推理每步打分可引导搜索但需逐步标注，ORM 只评最终结果标注便宜但信号稀疏）", "self-consistency 为什么对开放生成任务失效？（提示：多数投票要求答案可聚合成离散选项，自由文本无'多数'可言，需改 RM 打分）"],
    favorited: false,
    bigTech: true,
  },
];
