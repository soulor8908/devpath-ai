// lib/presets/ai/questions-rec-rl.ts
// AI 算法工程师面试题：推荐系统 + 强化学习（5 节点）
// 从 lib/presets/ai.ts 拆分而来，内容保持不变

import type { Question } from "../../types";

export const REC_RL_QUESTIONS: Question[] = [
  // ===== ai-rec-fundamentals =====

  {
    id: "ai-147",
    nodeId: "ai-rec-fundamentals",
    question: "协同过滤 UserCF vs ItemCF 原理？适用场景？",
    answer: `结论：UserCF 找相似用户推荐其喜欢物品（"和你相似的人也喜欢"），适合新闻等兴趣时效性强场景；ItemCF 找相似物品推荐（"喜欢这个的人也喜欢"），适合电商等物品稳定场景。相似度用余弦/Jaccard。

实际案例：今日头条早期用 UserCF 做新闻推荐；淘宝/京东用 ItemCF 做商品推荐。ItemCF 可离线算物品相似度矩阵。

\`\`\`python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# ItemCF：基于用户-物品交互矩阵算物品相似度
item_sim = cosine_similarity(item_user_matrix.T)  # 物品相似度
def recommend(user, top_k=10):
    bought = user_items[user]
    scores = item_sim[bought].sum(0)  # 相似物品得分
    scores[bought] = 0  # 去已买
    return scores.argsort()[::-1][:top_k]
\`\`\`

踩坑：冷启动无交互无法推荐；矩阵稀疏相似度不准；需归一化热门物品。`,
    keyPoints: ["UserCF 相似用户推荐", "ItemCF 相似物品推荐", "余弦/Jaccard 相似度"],
    followUps: ["Swing 算法？", "如何归一化热门物品？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-148",
    nodeId: "ai-rec-fundamentals",
    question: "矩阵分解（SVD/ALS）推荐原理？隐因子如何学？",
    answer: `结论：矩阵分解把用户-物品评分矩阵 R 分解为用户隐因子矩阵 P 和物品隐因子矩阵 Q，R≈PQ^T，用学到的隐因子预测未观测评分。ALS（交替最小二乘）固定一方优化另一方，适合大规模隐式反馈。

实际案例：Netflix 大赛矩阵分解一战成名；淘宝用 ALS 做隐式反馈召回。隐因子捕捉潜在兴趣维度。

\`\`\`python
import numpy as np
def als(R, k=10, iters=20):
    m, n = R.shape
    P = np.random.rand(m, k); Q = np.random.rand(n, k)
    for _ in range(iters):
        for u in range(m):  # 固定 Q 优化 P
            P[u] = np.linalg.solve(Q.T@Q+0.1*np.eye(k), R[u]@Q)
        for i in range(n):  # 固定 P 优化 Q
            Q[i] = np.linalg.solve(P.T@P+0.1*np.eye(k), R[:,i]@P)
    return P, Q
\`\`\`

踩坑：隐式反馈需加权（BPR/WMF）；隐因子数 k 需调；冷启动仍困难。`,
    keyPoints: ["R 分解为 P 和 Q 隐因子", "ALS 交替最小二乘", "隐因子捕捉潜在兴趣"],
    followUps: ["BPR 排序损失？", "隐式反馈如何加权？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-149",
    nodeId: "ai-rec-fundamentals",
    question: "召回-排序双塔架构？多路召回如何融合？",
    answer: `结论：推荐分召回（从亿级物品快速筛千级，双塔/ItemCF/图召回等多路）和排序（对千级精排十级，用 CTR 模型）。多路召回并行后去重合并，粗排模型统一打分截断。双塔用 ANN 加速，精排用交叉特征。

实际案例：抖音召回多路（双塔/图/行为序列/标签）→粗排→精排 DIN；淘宝召回多路→精排 DeepFM。漏斗逐层筛。

\`\`\`python
# 多路召回融合
recall = {}
for name, fn in [("twin_tower", twin_recall), ("itemcf", itemcf_recall)]:
    for item, score in fn(user):
        recall[item] = max(recall.get(item,0), score)  # 融合
candidates = sorted(recall, key=recall.get, reverse=True)[:1000]
# 精排
scores = deepfm(user_feat, item_feat)
\`\`\`

踩坑：多路召回需去重；各路分数量纲不同需归一；粗排需平衡速度精度。`,
    keyPoints: ["召回亿级筛千级", "排序千级筛十级", "多路召回并行融合"],
    followUps: ["粗排模型选型？", "图召回原理？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-150",
    nodeId: "ai-rec-fundamentals",
    question: "冷启动问题（用户/物品/系统冷启动）如何解决？",
    answer: `结论：用户冷启动无历史行为，用注册信息/热门/兴趣问卷/跨域迁移；物品冷启动无交互，用内容特征/标签/相似物品；系统冷启动用热门/规则/专家编辑。核心是用已有信息（内容/上下文）替代缺失行为。

实际案例：抖音新用户用注册时选兴趣标签+热门推荐冷启动；淘宝新品用内容特征+类目相似物品召回。

\`\`\`python
# 用户冷启动：内容特征召回
def cold_start_user(user_profile):
    group = user_profile["age_bucket"] + user_profile["gender"]
    return popular_by_group[group][:50]
# 物品冷启动：内容相似
new_item_emb = content_encoder(new_item)  # 用标题/图编码
sim_items = ann_search(new_item_emb)
\`\`\`

踩坑：冷启动指标（新用户 CTR）需单独监控；E&E 探索牺牲短期换长期；内容特征质量影响大。`,
    keyPoints: ["用户冷启动用内容/热门", "物品冷启动用内容相似", "系统冷启动用规则"],
    followUps: ["E&E 探索利用？", "跨域推荐？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-151",
    nodeId: "ai-rec-fundamentals",
    question: "FM 因子分解机原理？如何做二阶特征交叉？",
    answer: `结论：FM 在线性模型基础上为每个特征学隐向量，二阶交叉项用隐向量内积代替显式交叉，复杂度从 O(n²) 降到 O(nk)。解决稀疏数据下特征交叉学习，是 CTR 预估经典模型，后续 DeepFM/FFM 都基于此。

实际案例：腾讯广告/百度凤巢早期用 FM 做 CTR；阿里用 DeepFM（FM+DNN）。FM 适合高维稀疏特征。

\`\`\`python
import torch
import torch.nn as nn
class FM(nn.Module):
    def __init__(self, n_feat, k=10):
        super().__init__()
        self.w0 = nn.Parameter(torch.zeros(1))
        self.w = nn.Embedding(n_feat, 1)
        self.v = nn.Embedding(n_feat, k)  # 隐向量
    def forward(self, x):  # x: (B, F) 特征 id
        lin = self.w(x).sum(1)  # 一阶
        emb = self.v(x)  # (B,F,k)
        square = emb.sum(1)**2
        inter = (square - (emb**2).sum(1)).sum(1)/2  # 二阶交叉
        return self.w0 + lin.squeeze() + inter
\`\`\`

踩坑：稀疏特征下隐向量需正则；FFM 引入字段感知提升但慢；k 选择影响表达。`,
    keyPoints: ["隐向量内积做二阶交叉", "复杂度 O(n²)→O(nk)", "适合高维稀疏特征"],
    followUps: ["FFM 字段感知？", "FM vs DeepFM？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-152",
    nodeId: "ai-rec-fundamentals",
    question: "字节抖音推荐召回策略实战？多路召回如何设计？",
    answer: `结论：抖音召回多路并行：双塔召回（user-item 向量 ANN）、行为序列召回（用户历史 item 相似）、图召回（item-item 图传播）、标签召回、社交召回等。各路召回千级后融合去重，粗排模型统一打分截断到百级进精排。

实际案例：抖音推荐核心是召回多路覆盖不同兴趣，避免信息茧房。新内容通过冷启动+流量探索池分发。双塔用用户实时兴趣+item 向量。

\`\`\`python
# 抖音式多路召回
recalls = {
    "twin_tower": ann_search(user_emb, k=500),  # 双塔
    "seq": itemcf(user_history, k=300),  # 行为序列
    "graph": graph_recall(user, k=200),  # 图召回
    "tag": tag_recall(user_tags, k=200),  # 标签
}
# 融合去重 + 粗排
candidates = merge_dedupe(recalls)  # ~1000
scores = coarse_rank(user_feat, candidates)  # 粗排
\`\`\`

踩坑：召回路数过多成本高；各路需多样性平衡；新内容需流量扶持防马太。`,
    keyPoints: ["多路召回并行覆盖兴趣", "双塔/序列/图/标签召回", "融合去重后粗排"],
    followUps: ["图召回如何做？", "如何避免信息茧房？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-153",
    nodeId: "ai-rec-fundamentals",
    question: "推荐系统评估指标：CTR/留存/GMV/多样性如何权衡？",
    answer: `结论：离线指标有 CTR 预估 AUC/LogLoss、排序 NDCG/Hit Rate；在线指标有 CTR、点击率、停留时长、留存率、GMV、多样性。单一优化 CTR 易导致信息茧房和短期化，需多目标平衡（如 CTR×多样性×留存）。

实际案例：抖音同时看 CTR、完播率、互动率、次日留存；淘宝看 CTR、CVR、GMV、客单价。A/B 测试验证在线指标。

\`\`\`python
# 离线 AUC
from sklearn.metrics import roc_auc_score
auc = roc_auc_score(labels, preds)
# 在线多目标融合分
score = w1*ctr + w2*finish_rate + w3*like_rate + w4*diversity
# 多样性：MMR 或 DPP
diverse = mmr_rank(scores, item_emb, lambda_=0.5)
\`\`\`

踩坑：离线 AUC 提升不一定在线提升；CTR 虚高可能伤留存；需长期 A/B 验证。`,
    keyPoints: ["离线 AUC/NDCG", "在线 CTR/留存/GMV", "多目标平衡避免短期化"],
    followUps: ["NDCG 计算？", "MMR 多样性？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 24. ai-rec-deep =====,

  // ===== ai-rec-deep =====

  {
    id: "ai-154",
    nodeId: "ai-rec-deep",
    question: "Wide&Deep 原理？记忆与泛化如何结合？",
    answer: `结论：Wide&Deep 并联 wide 部分（交叉特征，记忆能力）和 deep 部分（DNN Embedding，泛化能力），联合训练。wide 记住高频共现模式，deep 泛化到未见组合。Google 提出，推荐系统 CTR 经典基线。

实际案例：Google Play 应用推荐用 Wide&Deep；淘宝/百度早期 CTR 用此架构。wide 部分需特征工程设计交叉。

\`\`\`python
class WideDeep(nn.Module):
    def __init__(self, n_feat, k=10):
        self.wide = nn.Linear(n_feat, 1)  # 交叉特征线性
        self.deep = nn.Sequential(
            nn.Embedding(n_feat, k),  # embedding
            nn.Linear(k*8, 64), nn.ReLU(),
            nn.Linear(64, 1))
    def forward(self, wide_feat, deep_ids):
        return self.wide(wide_feat) + self.deep(deep_ids)
\`\`\`

踩坑：wide 需手工交叉特征；deep 部分稀疏特征需 embedding；联合训练 lr 不同。`,
    keyPoints: ["wide 记忆+deep 泛化", "并联联合训练", "wide 需特征交叉工程"],
    followUps: ["Deep&Cross 区别？", "wide 特征如何设计？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-155",
    nodeId: "ai-rec-deep",
    question: "DeepFM 原理？相比 Wide&Deep 改进？",
    answer: `结论：DeepFM 用 FM 替代 Wide&Deep 的 wide 部分，自动学二阶交叉无需手工特征工程。FM+DNN 共享 embedding，端到端训练。相比 Wide&Deep 省去特征交叉工程，效果更好，是 CTR 主流模型。

实际案例：阿里/美团 CTR 精排用 DeepFM；华为提出 DeepFM 后工业广泛采用。共享 embedding 降参数量。

\`\`\`python
class DeepFM(nn.Module):
    def __init__(self, n_feat, k=10):
        self.emb = nn.Embedding(n_feat, k)  # FM 和 DNN 共享
        self.fm_w = nn.Embedding(n_feat, 1)
        self.dnn = nn.Sequential(nn.Linear(k*8,64), nn.ReLU(), nn.Linear(64,1))
    def forward(self, x):
        emb = self.emb(x)  # (B,F,k)
        fm = self.fm_w(x).sum(1) + ((emb.sum(1)**2-(emb**2).sum(1)).sum(1))/2
        deep = self.dnn(emb.flatten(1))
        return fm.squeeze() + deep.squeeze()
\`\`\`

踩坑：embedding 共享需调 k；高阶交叉需 DCN/xDeepFM；线上推理需优化延迟。`,
    keyPoints: ["FM 替代 wide 自动交叉", "FM+DNN 共享 embedding", "无需手工特征工程"],
    followUps: ["DCN 交叉网络？", "xDeepFM 区别？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-156",
    nodeId: "ai-rec-deep",
    question: "DIN/DIEN 原理？如何用注意力建模用户兴趣序列？",
    answer: `结论：DIN（Deep Interest Network）对用户行为序列用目标 item 注意力加权，不同候选 item 激活不同历史兴趣。DIEN 在 DIN 基础上用 GRU 建模兴趣演进时序。解决统一兴趣向量无法表达多元兴趣问题。

实际案例：阿里淘宝推荐用 DIN/DIEN 做精排，候选商品激活用户相关历史行为兴趣。效果显著优于 pooling。

\`\`\`python
class DIN(nn.Module):
    def attention_pool(self, seq_emb, target_emb):
        # 目标 item 与每个历史 item 算注意力
        att = MLP(torch.cat([seq_emb, target_emb.expand_as(seq_emb)], -1))
        weight = softmax(att)  # (B, L, 1)
        return (weight * seq_emb).sum(1)  # 兴趣向量随目标变化
# DIEN：兴趣 GRU 演进 + 辅助损失
\`\`\`

踩坑：长序列注意力计算量大需截断；兴趣演进需时序建模；负采样辅助损失提升。`,
    keyPoints: ["DIN 目标注意力激活兴趣", "DIEN GRU 建模兴趣演进", "兴趣随候选变化"],
    followUps: ["DIEN 辅助损失？", "长序列如何处理？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-157",
    nodeId: "ai-rec-deep",
    question: "多目标优化 MMoE/PLE 原理？如何处理任务冲突？",
    answer: `结论：多任务学习共享底层易负迁移。MMoE 用多个专家网络+门控，每个任务通过门控选不同专家组合，软共享。PLE（Progressive Layered Extraction）分多层专家+任务特定专家，比 MMoE 更解耦，解决任务冲突。

实际案例：抖音/腾讯视频推荐同时预估点击+完播+点赞+评论，用 MMoE/PLE 多目标。淘宝同时估 CTR+CVR。

\`\`\`python
class MMoE(nn.Module):
    def __init__(self, n_expert=8, n_task=3):
        self.experts = nn.ModuleList([MLP() for _ in range(n_expert)])
        self.gates = nn.ModuleList([nn.Linear(d, n_expert) for _ in range(n_task)])
        self.towers = nn.ModuleList([MLP() for _ in range(n_task)])
    def forward(self, x):
        feats = torch.stack([e(x) for e in self.experts], -1)  # (B,d,E)
        outs = []
        for g, t in zip(self.gates, self.towers):
            w = softmax(g(x))  # 任务专属门控
            outs.append(t((feats * w).sum(-1)))
        return outs
\`\`\`

踩坑：专家数需调；门控易塌缩到少数专家；损失加权影响多任务平衡。`,
    keyPoints: ["MMoE 多专家+任务门控", "PLE 分层专家解耦", "解决负迁移"],
    followUps: ["PLE 与 MMoE 区别？", "门控塌缩如何处理？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-158",
    nodeId: "ai-rec-deep",
    question: "多任务损失加权与梯度冲突如何处理？",
    answer: `结论：多任务各损失量纲和收敛速度不同，简单加权会导致某任务主导。方法：Uncertainty Weighting（用任务不确定性自动学权重）、GradNorm（动态调权重使梯度范数均衡）、PCGrad（冲突梯度投影消除冲突）。推荐系统 CTR+CVR 常用 ESMM 解决样本选择偏差。

实际案例：阿里 ESMM 同时建模 CTR+CVR，用 CTCR 联合损失解决 CVR 样本稀疏和选择偏差。

\`\`\`python
# ESMM：CTR 和 CVR 联合，pCTCVR = pCTR * pCVR
pctr = ctr_tower(x); pcvr = cvr_tower(x)
pctcvr = pctr * pcvr
loss = bce(pctr, click) + bce(pctcvr, conversion)  # 转化标签间接监督 CVR
# GradNorm：动态调权重平衡梯度
\`\`\`

踩坑：CVR 正样本稀疏需 ESMM；梯度冲突需 PCGrad；权重需随训练调整。`,
    keyPoints: ["Uncertainty/GradNorm 自动加权", "PCGrad 投影消冲突", "ESMM 解 CVR 样本偏差"],
    followUps: ["ESMM 原理？", "Uncertainty weighting？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-159",
    nodeId: "ai-rec-deep",
    question: "阿里淘宝搜索排序模型演进？从 GBDT 到深度模型？",
    answer: `结论：淘宝搜索排序演进：GBDT/LR（特征工程）→ Wide&Deep（记忆泛化）→ DIN（兴趣注意力）→ DIEN（兴趣演进）→ 多目标（CTR+CVR+GMV）。每次演进解决上代痛点，从手工特征到端到端深度学习。

实际案例：阿里妈妈广告、淘宝搜索精排都经历此演进。DIN 论文成为推荐领域经典。现多目标+多场景统一建模。

\`\`\`python
# 演进脉络
# v1: GBDT 编码特征 + LR 分类
# v2: Wide&Deep 并联记忆泛化
# v3: DIN 目标注意力兴趣
class DIEN(nn.Module):
    def forward(self, seq, target):
        # 兴趣 GRU + 目标注意力
        interest = self.interest_gru(seq)
        att = self.attention(interest, target)
        return self.tower(torch.cat([att, target_emb]))
\`\`\`

踩坑：深度模型需大数据；特征工程仍有价值；多场景需场景感知建模。`,
    keyPoints: ["GBDT→Wide&Deep→DIN→DIEN→多目标", "从手工特征到端到端", "DIN 兴趣注意力经典"],
    followUps: ["多场景统一建模？", "搜索与推荐排序差异？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-160",
    nodeId: "ai-rec-deep",
    question: "腾讯广告 CTR 预估实战？如何处理亿级特征和实时性？",
    answer: `结论：腾讯广告 CTR 用 DeepFM/DCN 多塔结构，特征分用户/广告/上下文/交叉。亿级特征用 embedding table+哈希分桶，在线学习实时更新用户行为。特征穿越需严格隔离离线在线。

实际案例：腾讯广告系统亿级 ID 特征 embedding，用参数服务器分布式训练，流式更新。A/B 验证 CTR 提升。

\`\`\`python
# 亿级特征哈希 embedding
class HashEmbedding(nn.Module):
    def __init__(self, n_bucket=1_000_000, k=8):
        self.emb = nn.Embedding(n_bucket, k)  # 哈希分桶降表大小
    def forward(self, ids):
        buckets = ids % self.n_bucket  # 哈希映射
        return self.emb(buckets)
# 在线流式更新
optimizer.zero_grad(); loss.backward(); optimizer.step()
\`\`\`

踩坑：哈希碰撞影响精度；实时特征延迟需监控；特征穿越导致离线高在线低。`,
    keyPoints: ["亿级特征哈希 embedding", "参数服务器分布式", "实时流式更新"],
    followUps: ["参数服务器架构？", "特征穿越如何避免？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 25. ai-rec-engineering =====,

  // ===== ai-rec-engineering =====

  {
    id: "ai-161",
    nodeId: "ai-rec-engineering",
    question: "召回-粗排-精排-重排四层漏斗架构？各层目标？",
    answer: `结论：召回（亿级→万级，重覆盖用 ANN/多路）→粗排（万级→千级，轻量模型平衡速度精度）→精排（千级→百级，复杂 CTR 模型+多目标）→重排（百级→最终，多样性/业务规则/广告插入）。逐层减量提精度。

实际案例：抖音/淘宝/百度都是此漏斗。召回重覆盖，精排重精度，重排重体验和商业化。

\`\`\`python
# 四层漏斗
candidates = multi_recall(user)  # 召回 ~10000
coarse_scores = coarse_model(user, candidates)  # 粗排
candidates = candidates[coarse_scores.topk(1000)]
fine_scores = deepfm(user, candidates)  # 精排
candidates = candidates[fine_scores.topk(100)]
final = rerank(candidates, diversity=True)  # 重排
\`\`\`

踩坑：粗排精度不够漏好内容；精排延迟需优化；重排规则过多难维护。`,
    keyPoints: ["召回重覆盖", "粗排平衡速度精度", "精排重精度+重排重体验"],
    followUps: ["粗排如何蒸馏精排？", "重排商业化插入？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-162",
    nodeId: "ai-rec-engineering",
    question: "重排多样性 MMR / DPP 原理？如何平衡相关性和多样性？",
    answer: `结论：MMR（Maximal Marginal Relevance）贪心选 item：每步选相关性高且与已选相似度低的，score=λ*rel-(1-λ)*max_sim。DPP（行列式点过程）用核矩阵行列式衡量子集质量，最大化行列式等价相关+多样，可近似加速。

实际案例：抖音/腾讯新闻重排用 MMR 避免连续相似内容；淘宝用 DPP 做类目多样。λ 调相关性与多样性权衡。

\`\`\`python
def mmr(rel_scores, sim_matrix, lambda_=0.7, k=20):
    selected = []
    for _ in range(k):
        mmr = []
        for i in range(len(rel_scores)):
            if i in selected: continue
            max_sim = max(sim_matrix[i][j] for j in selected) if selected else 0
            mmr.append(lambda_*rel_scores[i] - (1-lambda_)*max_sim)
        selected.append(mmr.index(max(mmr)))
    return selected
\`\`\`

踩坑：MMR 贪心非全局最优；DPP 计算量大需近似；多样性过头伤相关性。`,
    keyPoints: ["MMR 相关性-相似度贪心", "DPP 行列式最大化", "λ 调相关多样权衡"],
    followUps: ["DPP 如何加速？", "业务规则如何叠加？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-163",
    nodeId: "ai-rec-engineering",
    question: "实时特征与在线学习？如何平衡新鲜度和稳定性？",
    answer: `结论：实时特征（用户最近 N 分钟行为）提升新鲜度，用流式计算（Flink）生成。在线学习实时更新模型权重但需防漂移和震荡，常用增量训练+灰度发布+回滚机制。特征和模型都需监控漂移。

实际案例：抖音用实时特征（最近播放/跳过）捕捉即时兴趣；淘宝用在线学习更新 CTR 模型。实时性 vs 稳定性需权衡。

\`\`\`python
# 实时特征：Flink 流式聚合
user_realtime = {
    "last_5_clicks": flink_window(user_events, 5*60),
    "session_clicks": session_count(user),
}
# 在线增量更新
for batch in stream:
    loss = model(batch); optimizer.step()  # 增量更新
    if metrics degrade: rollback()  # 回滚
\`\`\`

踩坑：实时特征延迟需监控；在线学习易震荡需正则；特征漂移需报警。`,
    keyPoints: ["Flink 流式实时特征", "在线增量训练", "灰度发布+回滚防震荡"],
    followUps: ["特征漂移检测？", "增量训练正则？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-164",
    nodeId: "ai-rec-engineering",
    question: "E&E 探索与利用？推荐如何平衡短期收益和长期价值？",
    answer: `结论：E&E（Exploration vs Exploitation）权衡：Exploitation 推已知高 CTR 内容（短期），Exploration 推新内容探索潜力（长期）。方法：ε-greedy（ε 概率随机探索）、UCB（置信上界）、Thompson Sampling（贝叶斯采样）。新内容冷启动需探索流量。

实际案例：抖音新视频用探索流量池测试，CTR 达标才扩大分发；淘宝新品用 UCB 平衡探索利用。

\`\`\`python
import numpy as np
def ucb(scores, counts, total, c=2):
    # UCB：得分 + 探索 bonus
    bonus = c * np.sqrt(np.log(total) / (counts + 1e-9))
    return scores + bonus
# ε-greedy
if np.random.rand() < epsilon:
    return random_item()  # 探索
return best_item  # 利用
\`\`\`

踩坑：探索过多伤短期 CTR；UCB c 需调；新内容需保底流量否则难起量。`,
    keyPoints: ["ε-greedy/UCB/Thompson", "探索潜力利用收益", "新内容需探索流量"],
    followUps: ["Thompson Sampling？", "Contextual Bandit？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-165",
    nodeId: "ai-rec-engineering",
    question: "推荐系统工程架构？离线/近线/在线如何划分？",
    answer: `结论：推荐架构分离线（训练模型/算 embedding/离线特征）、近线（流式实时特征/增量更新）、在线（召回-排序-重排实时请求）。各层数据流通过消息队列（Kafka）和特征平台打通，模型通过参数服务器/模型服务化上线。

实际案例：抖音/淘宝推荐架构：离线 Hadoop/Spark 训练→近线 Flink 实时特征→在线微服务召回排序。弹性扩容应对流量峰。

\`\`\`python
# 架构分层
# 离线：Spark 训练 DeepFM，导出模型
# 近线：Flink 实时算用户行为特征写 Redis
# 在线：推荐服务
def recommend(user):
    realtime_feat = redis.get(user.id)  # 近线特征
    candidates = recall(user, realtime_feat)  # 在线召回
    return rerank(rank(user, candidates, realtime_feat))
\`\`\`

踩坑：离线在线特征不一致需特征平台统一；在线延迟需缓存+异步；模型上线需 A/B 灰度。`,
    keyPoints: ["离线训练/近线实时/在线服务", "Kafka+特征平台打通", "参数服务器模型服务化"],
    followUps: ["特征平台设计？", "如何保证离线在线一致？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-166",
    nodeId: "ai-rec-engineering",
    question: "推荐特征工程：用户/物品/上下文/交叉特征如何设计？",
    answer: `结论：推荐特征分用户特征（画像/行为序列/兴趣标签）、物品特征（类目/价格/统计量）、上下文特征（时间/地点/设备）、交叉特征（用户×类目 CTR 历史统计）。统计特征+Embedding 特征结合，深度模型自动学交叉。

实际案例：抖音特征含用户完播率/兴趣 tag/设备；物品含类目/热度/质量分。交叉统计特征仍是强信号。

\`\`\`python
# 特征工程
features = {
    "user": {"age": 25, "gender": "M", "last_clicks": seq_ids},
    "item": {"category": "数码", "price": 999, "ctr_7d": 0.05},
    "context": {"hour": 20, "weekday": 6, "city": "北京"},
    "cross": {"user_cat_ctr": 0.08},  # 用户对该类目历史 CTR
}
# Embedding + 统计特征拼接进 DNN
\`\`\`

踩坑：统计特征需平滑防噪声；长序列需截断+注意力；特征穿越需时间隔离。`,
    keyPoints: ["用户/物品/上下文/交叉四类", "统计+Embedding 结合", "深度模型自动学交叉"],
    followUps: ["统计特征平滑？", "行为序列如何编码？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-167",
    nodeId: "ai-rec-engineering",
    question: "推荐系统冷启动流量池机制？新内容如何起量？",
    answer: `结论：新内容无交互冷启动，用流量池机制：先投小流量测试（探索池）收集 CTR/完播等反馈，达标则扩大分发（爬坡），否则淘汰。配合内容质量分预估，保底曝光避免好内容被埋。

实际案例：抖音新视频进初始流量池（~500 曝光），根据完播率/互动率决定是否进更大流量池；淘宝新品用类似机制。

\`\`\`python
# 流量池爬坡
def traffic_pool(item, stage):
    pools = [500, 5000, 50000, 500000]  # 各级曝光量
    expose = pools[stage]
    metrics = serve(item, expose)  # 收集反馈
    if metrics["finish_rate"] > threshold:
        return stage + 1  # 升级流量池
    elif stage > 0 and metrics["ctr"] < min_threshold:
        return stage - 1  # 降级
    return stage  # 保持
\`\`\`

踩坑：阈值需动态调整防马太；流量池成本需控制；新内容需质量分预筛。`,
    keyPoints: ["流量池分级测试", "达标爬坡扩大分发", "内容质量分预筛"],
    followUps: ["阈值如何动态调？", "质量分如何预估？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 26. ai-rl-fundamentals =====,

  // ===== ai-rl-fundamentals =====

  {
    id: "ai-168",
    nodeId: "ai-rl-fundamentals",
    question: "MDP 马尔可夫决策过程？状态/动作/奖励/转移如何定义？",
    answer: `结论：MDP 由五元组 (S, A, P, R, γ) 定义：状态集 S、动作集 A、转移概率 P(s'|s,a)、奖励函数 R(s,a)、折扣因子 γ。马尔可夫性指下一状态只依赖当前状态和动作。RL 目标是找策略 π 最大化累计折扣奖励。

实际案例：推荐系统把用户状态=兴趣，动作=推荐 item，奖励=点击/停留；RL 优化长期留存而非单次 CTR。

\`\`\`python
# MDP 建模
class MDP:
    def __init__(self, states, actions, transitions, rewards, gamma=0.9):
        self.S = states; self.A = actions
        self.P = transitions  # P[s][a][s']
        self.R = rewards  # R[s][a]
        self.gamma = gamma
def value_iteration(mdp):
    V = {s: 0 for s in mdp.S}
    for _ in range(100):
        for s in mdp.S:
            V[s] = max(sum(mdp.P[s][a][s2]*(mdp.R[s][a]+mdp.gamma*V[s2])
                        for s2 in mdp.S) for a in mdp.A)
    return V
\`\`\`

踩坑：状态空间大需函数逼近；奖励设计影响策略；γ 调短期长期权衡。`,
    keyPoints: ["MDP 五元组 S/A/P/R/γ", "马尔可夫性无记忆", "最大化累计折扣奖励"],
    followUps: ["POMDP？", "折扣因子如何选？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-169",
    nodeId: "ai-rl-fundamentals",
    question: "Q-Learning 原理？Q 值如何更新？off-policy 含义？",
    answer: `结论：Q-Learning 学习动作价值函数 Q(s,a)，更新公式 Q(s,a)←Q(s,a)+α[r+γ max_a' Q(s',a')-Q(s,a)]。用 max 选下一状态最优动作（不依赖实际行为策略），是 off-policy，可用经验回放。ε-greedy 平衡探索利用。

实际案例：DQN（Deep Q-Network）用神经网络逼近 Q 函数玩 Atari；百度凤巢用 Q-Learning 做广告竞价策略。

\`\`\`python
import numpy as np
def q_learning(env, episodes=1000, alpha=0.1, gamma=0.9, eps=0.1):
    Q = np.zeros((n_states, n_actions))
    for _ in range(episodes):
        s = env.reset()
        while True:
            a = np.argmax(Q[s]) if np.random.rand()>eps else env.random_action()
            s2, r, done = env.step(a)
            Q[s,a] += alpha*(r + gamma*np.max(Q[s2]) - Q[s,a])  # off-policy 更新
            s = s2
            if done: break
    return Q
\`\`\`

踩坑：Q 值过估计用 Double DQN；离散动作空间限制；学习率 α 需调。`,
    keyPoints: ["Q 值 TD 更新", "max 选最优 off-policy", "ε-greedy 探索"],
    followUps: ["Double DQN？", "经验回放作用？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-170",
    nodeId: "ai-rl-fundamentals",
    question: "SARSA vs Q-Learning 区别？on-policy vs off-policy？",
    answer: `结论：SARSA 是 on-policy，用实际执行的动作 a' 更新：Q(s,a)←Q(s,a)+α[r+γ Q(s',a')-Q(s,a)]，a' 是行为策略选的。Q-Learning 是 off-policy，用 max Q(s',a') 更新（最优动作非实际）。SARSA 更保守考虑探索代价，Q-Learning 更激进乐观。

实际案例：Q-Learning 适合离线学习大量经验；SARSA 适合在线学习需考虑探索风险（如机器人避障）。

\`\`\`python
# SARSA（on-policy）
a2 = epsilon_greedy(Q[s2])  # 实际下一动作
Q[s,a] += alpha*(r + gamma*Q[s2,a2] - Q[s,a])
# Q-Learning（off-policy）
Q[s,a] += alpha*(r + gamma*max(Q[s2]) - Q[s,a])  # 最优动作
\`\`\`

踩坑：SARSA 在悬崖寻路更安全；Q-Learning 学最优但探索时风险高；off-policy 可用旧经验。`,
    keyPoints: ["SARSA on-policy 用实际动作", "Q-Learning off-policy 用 max", "SARSA 保守 Q-Learning 激进"],
    followUps: ["Expected SARSA？", "off-policy 优势？"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-171",
    nodeId: "ai-rl-fundamentals",
    question: "Policy Gradient 策略梯度原理？REINFORCE 算法？",
    answer: `结论：Policy Gradient 直接参数化策略 π_θ(a|s)，用梯度上升最大化期望回报 J(θ)。REINFORCE 用蒙特卡洛回报 G_t 估计：∇J=∇log π_θ(a|s) G_t。优势是无须价值函数、支持连续动作，但方差大需 baseline 降方差。

实际案例：连续控制（机器人）用策略梯度；AlphaGo 用策略网络。REINFORCE 是基础，PPO/A3C 都基于此。

\`\`\`python
import torch
class PolicyNet(torch.nn.Module):
    def __init__(self, s_dim, a_dim):
        self.fc = nn.Sequential(nn.Linear(s_dim,64), nn.ReLU(), nn.Linear(64,a_dim))
    def forward(self, s): return softmax(self.fc(s), dim=-1)
# REINFORCE
log_prob = torch.log(policy(s)[a])
loss = -log_prob * G_t  # 回报加权 log 概率
loss.backward()  # 梯度上升
\`\`\`

踩坑：方差大需 baseline G_t-b(s)；离散用 softmax 连续用高斯；样本效率低。`,
    keyPoints: ["直接参数化策略 π_θ", "∇J=∇logπ·G_t", "REINFORCE 蒙特卡洛"],
    followUps: ["baseline 降方差？", "连续动作如何处理？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-172",
    nodeId: "ai-rl-fundamentals",
    question: "Actor-Critic 原理？如何结合策略梯度和价值函数？",
    answer: `结论：Actor-Critic 结合策略网络 Actor（π_θ 输出动作）和价值网络 Critic（V_φ 估计状态价值）。Actor 用 Critic 的优势函数 A=Q-V 做梯度更新降方差，Critic 用 TD 误差更新。A2C/A3C 是经典实现。

实际案例：OpenAI Five 用 Actor-Critic 训练 Dota；字节/阿里用 Actor-Critic 做推荐长期优化。

\`\`\`python
class ActorCritic(nn.Module):
    def __init__(self, s_dim, a_dim):
        self.actor = nn.Sequential(nn.Linear(s_dim,64), nn.ReLU(), nn.Linear(64,a_dim))
        self.critic = nn.Sequential(nn.Linear(s_dim,64), nn.ReLU(), nn.Linear(64,1))
    def forward(self, s):
        return softmax(self.actor(s), -1), self.critic(s)
# Actor 用优势更新，Critic 用 TD 误差
advantage = G_t - V(s)  # A(s,a)
actor_loss = -log_prob * advantage.detach()
critic_loss = mse(V(s), G_t)
\`\`\`

踩坑：Actor/Critic 学习率需平衡；优势函数需归一化；A3C 异步易不稳。`,
    keyPoints: ["Actor 策略+Critic 价值", "优势函数 A=Q-V 降方差", "A2C/A3C 经典"],
    followUps: ["A3C 异步原理？", "GAE 优势估计？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-173",
    nodeId: "ai-rl-fundamentals",
    question: "DQN 原理与改进（Double/Dueling/Prioritized Replay）？",
    answer: `结论：DQN 用神经网络逼近 Q 函数，用经验回放和目标网络稳定训练。改进：Double DQN 用 online 网络选动作 target 网络估值减少过估计；Dueling DQN 分解 Q=V+A；Prioritized Experience Replay 按 TD 误差优先采样重要样本。

实际案例：DeepMind DQN 玩 Atari 达人类水平；百度/腾讯用 DQN 变体做推荐列表生成。

\`\`\`python
class DuelingDQN(nn.Module):
    def forward(self, s):
        feat = self.feature(s)
        V = self.value_head(feat)  # 状态价值
        A = self.adv_head(feat)    # 动作优势
        return V + A - A.mean(1, keepdim=True)  # Q=V+A-avg(A)
# Double DQN：online 选动作，target 估值
a_max = online_net(s2).argmax(1)
target = r + gamma * target_net(s2)[a_max]  # 减过估计
\`\`\`

踩坑：目标网络更新频率；经验回放缓冲区大小；连续动作 DQN 不适用用 DDPG。`,
    keyPoints: ["经验回放+目标网络", "Double 减过估计", "Dueling 分解 V+A"],
    followUps: ["PER 优先级如何算？", "DDPG 连续动作？"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-174",
    nodeId: "ai-rl-fundamentals",
    question: "RL 在推荐/广告如何应用？长期价值优化怎么做？",
    answer: `结论：推荐 RL 把列表生成视为序列决策，状态=用户兴趣，动作=推荐 item，奖励=点击/停留/留存。优化长期累计奖励而非单次 CTR。用 DDPG/PPO 处理连续/离散动作，离线 RL 用历史日志学习避免在线探索风险。

实际案例：阿里用 RL 优化淘宝列表长期 GMV；腾讯广告用 RL 做竞价策略；字节用 RL 优化抖音长期留存。

\`\`\`python
# 推荐 RL：列表生成
state = user_interest_encoder(user_history)
action = policy(state)  # 推荐 item 分布
reward = click + 0.5*dwell_time + 2*retention  # 多目标奖励
# 离线 RL：用历史日志学策略避免在线风险
offline_data = logs  # (s, a, r, s')
policy = train_offline_rl(offline_data)  # CQL/BCQ
\`\`\`

踩坑：奖励设计影响策略；在线探索风险大用离线 RL；模拟器偏差需校准。`,
    keyPoints: ["推荐建模为序列决策", "优化长期累计奖励", "离线 RL 避在线风险"],
    followUps: ["离线 RL 方法？", "奖励如何设计？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 27. ai-rl-advanced =====,

  // ===== ai-rl-advanced =====

  {
    id: "ai-175",
    nodeId: "ai-rl-advanced",
    question: "PPO 原理？为何成为 RLHF 主流算法？",
    answer: `结论：PPO（Proximal Policy Optimization）用 clipped surrogate objective 限制策略更新幅度，ratio=π_new/π_old 裁剪到 [1-ε,1+ε]，防策略崩溃。稳定且易实现，成 RLHF 主流。相比 TRPO 计算简单。

实际案例：OpenAI 用 PPO 做 RLHF 训练 GPT；Meta/字节用 PPO 对齐 LLM。PPO 在 InstructGPT 中证明有效。

\`\`\`python
import torch
def ppo_loss(logp_new, logp_old, advantages, eps=0.2):
    ratio = torch.exp(logp_new - logp_old)  # π_new/π_old
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1-eps, 1+eps) * advantages
    return -torch.min(surr1, surr2).mean()  # clip 限更新幅度
# 加 value loss + entropy bonus
loss = ppo_loss + 0.5*value_loss + 0.01*entropy
\`\`\`

踩坑：clip ε 需调（0.1-0.3）；多 epoch 复用数据需 KL 早停；advantage 需 GAE 估计。`,
    keyPoints: ["clipped surrogate 限更新", "ratio 裁剪防崩溃", "稳定易实现主流"],
    followUps: ["TRPO 原理？", "GAE 优势估计？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-176",
    nodeId: "ai-rl-advanced",
    question: "RLHF 三阶段流程？SFT/RM/PPO 各做什么？",
    answer: `结论：RLHF 三阶段：1）SFT 监督微调（用人工示范数据微调基座模型学指令遵循）；2）RM 奖励模型训练（用人工偏好对（A>B）训练奖励模型打分）；3）PPO 强化学习（用 RM 奖励+KL 约束优化 SFT 模型，KL 防偏离太远）。

实际案例：OpenAI InstructGPT/ChatGPT 用此流程；Llama2-Chat、Qwen 都用 RLHF 对齐。Anthropic 用 Constitutional AI 替代部分人工标注。

\`\`\`python
# Stage 1: SFT
sft_model = train_supervised(base_model, demo_data)
# Stage 2: RM
rm = train_reward_model(preference_pairs)  # A>B 学打分
# Stage 3: PPO
for batch in prompts:
    resp = ppo_model.generate(batch)
    reward = rm(batch, resp) - kl_coef*kl(ppo_model, sft_model)
    ppo_update(ppo_model, reward)  # PPO 优化
\`\`\`

踩坑：RM 过拟合需调；KL 系数防奖励黑客；PPO 训练不稳需调超参。`,
    keyPoints: ["SFT 学指令遵循", "RM 偏好训练打分", "PPO+KL 约束优化"],
    followUps: ["奖励黑客问题？", "Constitutional AI？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-177",
    nodeId: "ai-rl-advanced",
    question: "奖励建模（Reward Model）如何训练？偏好数据如何收集？",
    answer: `结论：RM 用 Bradley-Terry 模型：对偏好对（A>B），损失=-log σ(r(A)-r(B))，让好回答分数高于差回答。偏好数据由人工标注员对模型输出排序，需质量控制和多样性。RM 质量直接决定 RLHF 效果。

实际案例：OpenAI/Anthropic 聘请大量标注员；Llama2 用 Meta 内部标注+开源偏好数据。RM 偏差导致对齐失败。

\`\`\`python
import torch.nn.functional as F
class RewardModel(nn.Module):
    def forward(self, prompt, response):
        return self.transformer(prompt+response).last_hidden_state[:,-1] @ self.head
# Bradley-Terry 损失
r_chosen = rm(prompt, chosen); r_rejected = rm(prompt, rejected)
loss = -F.logsigmoid(r_chosen - r_rejected).mean()
\`\`\`

踩坑：标注主观性需多标注者融合；RM 泛化差需多样数据；RM 过拟合需正则。`,
    keyPoints: ["Bradley-Terry 偏好损失", "人工标注偏好对", "RM 质量决定 RLHF"],
    followUps: ["标注一致性如何保证？", "RM 泛化如何提升？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-178",
    nodeId: "ai-rl-advanced",
    question: "DPO 原理？为何无需 RM 直接优化偏好？",
    answer: `结论：DPO（Direct Preference Optimization）推导出 RLHF 的最优策略可由奖励函数表示，直接用偏好对优化策略，无需显式 RM 和 PPO。损失等价于让 chosen 概率相对 rejected 概率提升，用 reference 模型做 KL 约束。简单稳定省资源。

实际案例：Llama3/Mistral 用 DPO 替代 PPO 对齐；Zephyr 用 DPO 训练。DPO 比 PPO 省显存易实现。

\`\`\`python
import torch.nn.functional as F
def dpo_loss(policy, ref, chosen_ids, rejected_ids, beta=0.1):
    logp_chosen = logprob(policy, chosen_ids) - logprob(ref, chosen_ids)
    logp_rejected = logprob(policy, rejected_ids) - logprob(ref, rejected_ids)
    return -F.logsigmoid(beta * (logp_chosen - logp_rejected)).mean()
# 无需 RM，直接策略优化
\`\`\`

踩坑：DPO 可能偏离参考模型太远；β 调 KL 强度；效果有时不如 PPO 需迭代。`,
    keyPoints: ["无需 RM 直接优化偏好", "reference 模型 KL 约束", "简单稳定省资源"],
    followUps: ["DPO vs PPO 效果？", "IPO/KTO 变体？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-179",
    nodeId: "ai-rl-advanced",
    question: "GRPO 原理？DeepSeek 如何用它降低 RLHF 成本？",
    answer: `结论：GRPO（Group Relative Policy Optimization）对每个 prompt 采样一组回答，用组内相对优势（回答奖励减组均值、除以组标准差）代替独立 critic 网络，省去价值模型降低显存。注意区分 DeepSeek-R1-Zero 与 R1：R1-Zero 才是"无 SFT、在基座上直接纯 RL"的实验（能涌现长 CoT 但输出可读性差、语言混杂）；R1 正式版是"少量冷启动 CoT 数据 SFT → 推理导向 RL（GRPO）→ 拒绝采样再造 SFT 数据 → 全场景 RL"的多阶段流程，并非直接裸 RL。

实际案例：DeepSeek-R1 用 GRPO+可验证奖励（数学/代码正确性）训练出强推理能力，成本低于 PPO；R1-Zero 证明了纯 RL 也能激发推理，但工程落地走 R1 的冷启动多阶段路线。

\`\`\`python
def grpo_loss(policy, ref, prompt, group_size=8):
    responses = [policy.generate(prompt) for _ in range(group_size)]
    rewards = [reward_fn(prompt, r) for r in responses]
    adv = (rewards - mean(rewards)) / (std(rewards)+1e-8)  # 组内相对优势
    loss = 0
    for resp, a in zip(responses, adv):
        log_ratio = logprob(policy, resp) - logprob(ref, resp)
        loss += -min(log_ratio*a, clip(log_ratio,1-eps,1+eps)*a)
    return loss / group_size  # 无需 critic
\`\`\`

踩坑：组大小影响优势估计；无 critic 偏差需校准；可验证奖励需领域设计。`,
    keyPoints: ["组内相对优势省 critic", "R1-Zero 纯 RL vs R1 冷启动 SFT+RL", "可验证奖励降成本"],
    followUps: ["R1 多阶段训练流程？", "可验证奖励设计？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-180",
    nodeId: "ai-rl-advanced",
    question: "RLHF 工程挑战？显存/分布式/奖励黑客如何解决？",
    answer: `结论：RLHF 工程挑战：1）显存大需 policy+ref+RM+critic 四模型，用 LoRA/量化/ZeRO 降显存；2）分布式训练需 vLLM 加速生成+Megatron 并行；3）奖励黑客（模型钻 RM 漏洞刷分）需 KL 约束+RM 鲁棒性+奖励多样性。

实际案例：字节/阿里 RLHF 用 DeepSpeed-Chat/trl 框架，LoRA+量化降显存。奖励黑客是核心难题。

\`\`\`python
# 显存优化：4 模型 LoRA+量化
from peft import LoraConfig
policy = AutoModelForCausalLM.from_pretrained(base, load_in_4bit=True)
policy = peft.get_peft_model(policy, LoraConfig(r=16))  # LoRA
ref = copy(policy); rm = RewardModel(...); critic = ...
# 奖励黑客防御
reward = rm_score - kl_coef*kl(policy, ref)  # KL 约束
reward += diversity_penalty(response)  # 多样性防钻漏洞
\`\`\`

踩坑：四模型显存易 OOM；生成速度是瓶颈用 vLLM；奖励黑客需持续监控。`,
    keyPoints: ["四模型 LoRA+量化降显存", "vLLM 加速生成", "KL+多样性防奖励黑客"],
    followUps: ["DeepSpeed-Chat 架构？", "奖励黑客检测？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-181",
    nodeId: "ai-rl-advanced",
    question: "LLM 对齐实战与安全？如何防止有害输出？",
    answer: `结论：对齐目标让 LLM 有用+无害+诚实。方法：RLHF/DPO 对齐人类价值观；红队测试主动找漏洞；安全护栏（输入过滤+输出审核）；Constitutional AI 用 AI 自我批评替代部分人工。需持续迭代应对新型攻击。

实际案例：字节豆包/阿里通义用 RLHF+安全过滤+红队；OpenAI 用 Moderation API 过滤。越狱提示需持续对抗。

\`\`\`python
# 安全护栏：多层防御
def safe_generate(prompt):
    if is_harmful(prompt):  # 输入审核
        return "抱歉，无法回答"
    resp = llm.generate(prompt)
    if moderation_api(resp)["flagged"]:  # 输出审核
        return filter_or_refuse(resp)
    return resp
# 红队测试：自动生成攻击 prompt
attacks = red_team_generator.generate()  # 自动找漏洞
\`\`\`

踩坑：过度安全导致拒答（过对齐）；越狱攻击持续演化；需人工+自动结合审核。`,
    keyPoints: ["RLHF 对齐价值观", "红队+安全护栏", "Constitutional AI 自我批评"],
    followUps: ["越狱攻击防御？", "过对齐如何缓解？"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-204",
    nodeId: "ai-rl-advanced",
    question: "o1/R1 类推理模型的范式？test-time scaling 与 self-consistency 原理？",
    answer: `结论：推理模型范式是用 RL（GRPO/PPO）+ 可验证奖励（数学答案对、代码过测试）把模型训出长思维链（CoT），链中含规划、验证、反思回溯（所谓 aha moment），把"训练时 scaling"延伸到"推理时 scaling"：生成 token 越多、思考越久，难题准确率越高，accuracy 随推理算力近对数线性提升。两条互补路线：①内生长 CoT（o1/R1，训练固化进模型）；②推理时搜索增强：self-consistency 采样多条 CoT 多数投票、Best-of-N 配奖励模型筛选、过程奖励模型（PRM）逐步打分引导搜索。代价是推理成本数倍于普通模型，简单问题用长思考是浪费，衍生出"按难度分配思考预算"的路由做法。

实际案例：OpenAI o1/o3、DeepSeek-R1、Qwen-QwQ 走 RL 长 CoT 路线，数学/代码基准大幅提升；字节豆包、阿里通义推出深度思考模式，按问题难度切换快思考/慢思考。

\`\`\`python
# self-consistency：多条 CoT 投票（训练-free 的 test-time scaling）
from collections import Counter
def self_consistency(model, question, n=16, temp=0.7):
    answers = []
    for _ in range(n):
        cot = model.generate(question + "\\n请逐步推理", temperature=temp)
        answers.append(extract_final_answer(cot))  # 提取 \\boxed{} 答案
    return Counter(answers).most_common(1)[0][0]   # 多数投票
# Best-of-N：配 ORM/PRM 打分取最高，比投票更准但需奖励模型
best = max(samples, key=lambda s: reward_model.score(question, s))
\`\`\`

踩坑：test-time scaling 存在收益拐点，超过预算 token 反而过思考（overthinking）掉点；self-consistency 依赖答案可聚合，开放任务无效；可验证奖励仅限数学/代码等封闭域，通用推理需 RM 打分代替；长 CoT 可能泄露不安全推理过程需额外审核。`,
    keyPoints: ["RL+可验证奖励训出长 CoT", "test-time scaling 推理算力换准确率", "self-consistency 投票/Best-of-N/PRM 搜索"],
    followUps: ["PRM 与 ORM 区别？", "overthinking 如何检测与抑制？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 28. ai-multimodal =====,
];
