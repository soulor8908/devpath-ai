// lib/presets/ai.ts
// AI 算法工程师面试全攻略预设：30 知识节点 + 210 道高频面试题 + 学习计划
// 覆盖：机器学习基础 → 深度学习 → CV → NLP → 推荐系统 → 强化学习 → 前沿与部署
// 大厂高频题答案结合真实项目场景（字节抖音推荐/阿里电商搜索/腾讯广告/百度凤巢等）

import type { KnowledgeNode, Question, ScheduleItem } from "../types";

const AI_NODES: KnowledgeNode[] = [
  // ===== 机器学习基础（8 个节点） =====
  {
    id: "ai-ml-fundamentals",
    title: "机器学习基础",
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary: "监督/无监督/强化学习、偏差-方差权衡、过拟合与欠拟合、交叉验证、训练/验证/测试集划分、生成模型与判别模型。",
    mastery: 0,
  },
  {
    id: "ai-linear-models",
    title: "线性模型（回归与分类）",
    difficulty: 3,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "线性回归最小二乘与梯度下降、逻辑回归与交叉熵、L1/L2 正则化与稀疏解、Softmax 多分类、大规模 CTR 应用。",
    mastery: 0,
  },
  {
    id: "ai-tree-models",
    title: "树模型与 GBDT 系列",
    difficulty: 3,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "决策树划分标准、随机森林 Bagging、GBDT/XGBoost/LightGBM/CatBoost 原理与改进、特征重要性、工业实战。",
    mastery: 0,
  },
  {
    id: "ai-svm",
    title: "SVM 与核方法",
    difficulty: 4,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "中",
    summary: "最大间隔、软间隔与松弛变量、核函数（线性/RBF/多项式）、对偶问题与 SMO、多分类、SVR、SVM vs 逻辑回归。",
    mastery: 0,
  },
  {
    id: "ai-ensemble",
    title: "集成学习",
    difficulty: 3,
    prerequisites: ["ai-tree-models"],
    frequency: "高",
    bigTech: true,
    summary: "Bagging vs Boosting、Stacking/Blending、多样性来源、XGBoost vs 随机森林选型、多模型融合工业实践。",
    mastery: 0,
  },
  {
    id: "ai-optimization",
    title: "优化算法",
    difficulty: 4,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "梯度下降变体、Momentum/RMSProp/Adam 演进、AdamW 解耦权重衰减、学习率调度 warmup+cosine、二阶方法、梯度裁剪。",
    mastery: 0,
  },
  {
    id: "ai-evaluation",
    title: "评估指标与 A/B 测试",
    difficulty: 3,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "分类（P/R/F1/AUC）、ROC vs PR、回归（MAE/MSE/MAPE）、排序（NDCG/MRR/MAP）、A/B 测试与显著性、在线离线指标对齐。",
    mastery: 0,
  },
  {
    id: "ai-feature-eng",
    title: "特征工程",
    difficulty: 3,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "数值/类别特征处理、特征选择、特征交叉、自动特征与哈希、时间序列特征、推荐系统特征工程实战。",
    mastery: 0,
  },
  // ===== 深度学习（6 个节点） =====
  {
    id: "ai-nn-fundamentals",
    title: "神经网络基础",
    difficulty: 4,
    prerequisites: ["ai-ml-fundamentals", "ai-optimization"],
    frequency: "高",
    bigTech: true,
    summary: "反向传播链式法则、激活函数（ReLU/Sigmoid/GELU）、权重初始化（Xavier/He）、BatchNorm/Dropout、梯度消失爆炸、LayerNorm。",
    mastery: 0,
  },
  {
    id: "ai-cnn",
    title: "CNN 卷积神经网络",
    difficulty: 4,
    prerequisites: ["ai-nn-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "卷积/池化/感受野、ResNet 残差连接、1×1 卷积、经典架构演进、深度可分离卷积轻量化、迁移学习微调、backbone 选型。",
    mastery: 0,
  },
  {
    id: "ai-rnn",
    title: "RNN/LSTM/GRU",
    difficulty: 4,
    prerequisites: ["ai-nn-fundamentals"],
    frequency: "高",
    summary: "RNN 梯度消失、LSTM 门控机制、GRU 简化、双向 RNN、Seq2Seq 与注意力、梯度裁剪、语音/OCR 应用。",
    mastery: 0,
  },
  {
    id: "ai-transformer",
    title: "Transformer",
    difficulty: 5,
    prerequisites: ["ai-rnn"],
    frequency: "高",
    bigTech: true,
    summary: "Self-Attention、多头注意力、位置编码/RoPE、LayerNorm Pre/Post-Norm、Encoder-Decoder 与因果掩码、训练技巧、长序列优化。",
    mastery: 0,
  },
  {
    id: "ai-pretrain",
    title: "预训练模型",
    difficulty: 5,
    prerequisites: ["ai-transformer"],
    frequency: "高",
    bigTech: true,
    summary: "BERT MLM vs GPT 自回归、T5、对比学习 SimCLR/CLIP、Prompt/Prefix Tuning、LoRA/QLoRA、scaling law、预训练工程。",
    mastery: 0,
  },
  {
    id: "ai-frameworks",
    title: "深度学习框架",
    difficulty: 3,
    prerequisites: ["ai-nn-fundamentals"],
    frequency: "中",
    bigTech: true,
    summary: "PyTorch autograd 动态图、nn.Module、混合精度训练、DDP 分布式训练、模型保存加载、TF/PyTorch 对比、Megatron/DeepSpeed。",
    mastery: 0,
  },
  // ===== CV 方向（4 个节点） =====
  {
    id: "ai-cv-classification",
    title: "图像分类",
    difficulty: 3,
    prerequisites: ["ai-cnn"],
    frequency: "中",
    bigTech: true,
    summary: "数据增强、迁移学习、ResNet 变体、Vision Transformer、知识蒸馏、长尾分布分类、商品识别工业落地。",
    mastery: 0,
  },
  {
    id: "ai-cv-detection",
    title: "目标检测",
    difficulty: 4,
    prerequisites: ["ai-cnn"],
    frequency: "高",
    bigTech: true,
    summary: "YOLO 单阶段、Faster R-CNN 两阶段、DETR、NMS/Soft-NMS、Anchor-free、mAP 评估、无人配送/安防应用。",
    mastery: 0,
  },
  {
    id: "ai-cv-segmentation",
    title: "图像分割",
    difficulty: 4,
    prerequisites: ["ai-cnn"],
    frequency: "中",
    bigTech: true,
    summary: "语义/实例/全景分割、U-Net、DeepLab 空洞卷积、Mask R-CNN、分割损失、医学图像、自动驾驶分割。",
    mastery: 0,
  },
  {
    id: "ai-cv-generative",
    title: "生成模型",
    difficulty: 5,
    prerequisites: ["ai-cnn"],
    frequency: "高",
    bigTech: true,
    summary: "GAN 原理与训练、VAE、Diffusion 模型、Stable Diffusion、FID/IS 评估、AIGC 图像生成应用。",
    mastery: 0,
  },
  // ===== NLP 方向（4 个节点） =====
  {
    id: "ai-nlp-fundamentals",
    title: "NLP 基础",
    difficulty: 3,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "中",
    summary: "分词（BPE/WordPiece）、Word2Vec（CBOW/Skip-gram）、GloVe、FastText、词向量评估、子词、中文分词与预训练。",
    mastery: 0,
  },
  {
    id: "ai-nlp-embeddings",
    title: "上下文向量与句向量",
    difficulty: 4,
    prerequisites: ["ai-nlp-fundamentals", "ai-transformer"],
    frequency: "高",
    bigTech: true,
    summary: "ELMo、BERT 嵌入、句向量 SBERT、SimCSE 对比学习、Embedding 检索、向量数据库、语义检索工业应用。",
    mastery: 0,
  },
  {
    id: "ai-nlp-sequence",
    title: "序列任务",
    difficulty: 4,
    prerequisites: ["ai-nlp-embeddings"],
    frequency: "中",
    bigTech: true,
    summary: "NER、POS 标注、文本分类、CRF、序列标注评估、BERT 微调序列任务、医疗/法律 NER 工业应用。",
    mastery: 0,
  },
  {
    id: "ai-nlp-generation",
    title: "生成任务",
    difficulty: 5,
    prerequisites: ["ai-pretrain"],
    frequency: "高",
    bigTech: true,
    summary: "摘要生成、机器翻译、对话系统、代码生成、解码策略（beam search/sampling）、BLEU/ROUGE 评估、LLM 生成应用。",
    mastery: 0,
  },
  // ===== 推荐系统（3 个节点） =====
  {
    id: "ai-rec-fundamentals",
    title: "推荐基础",
    difficulty: 3,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "协同过滤（UserCF/ItemCF）、矩阵分解、召回排序双塔、冷启动、多路召回、FM、抖音召回策略实战。",
    mastery: 0,
  },
  {
    id: "ai-rec-deep",
    title: "深度推荐模型",
    difficulty: 4,
    prerequisites: ["ai-rec-fundamentals", "ai-nn-fundamentals"],
    frequency: "高",
    bigTech: true,
    summary: "Wide&Deep、DeepFM、DIN/DIEN 注意力序列兴趣、多目标优化（MMoE/PLE）、多任务损失加权、淘宝搜索排序演进。",
    mastery: 0,
  },
  {
    id: "ai-rec-engineering",
    title: "推荐工程化",
    difficulty: 4,
    prerequisites: ["ai-rec-deep"],
    frequency: "高",
    bigTech: true,
    summary: "召回-粗排-精排-重排漏斗、重排多样性（MMR/DPP）、实时特征、在线学习、E&E 探索利用、推荐系统工程架构。",
    mastery: 0,
  },
  // ===== 强化学习（2 个节点） =====
  {
    id: "ai-rl-fundamentals",
    title: "强化学习基础",
    difficulty: 4,
    prerequisites: ["ai-ml-fundamentals"],
    frequency: "中",
    bigTech: true,
    summary: "MDP、Q-Learning、SARSA、Policy Gradient、Actor-Critic、DQN、RL 在推荐/广告的应用。",
    mastery: 0,
  },
  {
    id: "ai-rl-advanced",
    title: "强化学习进阶",
    difficulty: 5,
    prerequisites: ["ai-rl-fundamentals", "ai-pretrain"],
    frequency: "高",
    bigTech: true,
    summary: "PPO、RLHF 三阶段、奖励建模、DPO、GRPO、RLHF 工程挑战、对齐实战。",
    mastery: 0,
  },
  // ===== 前沿与部署（4 个节点） =====
  {
    id: "ai-multimodal",
    title: "多模态",
    difficulty: 5,
    prerequisites: ["ai-pretrain", "ai-cnn"],
    frequency: "高",
    bigTech: true,
    summary: "CLIP、BLIP、Visual Language Model、图文检索、多模态对齐、VQA、多模态大模型应用。",
    mastery: 0,
  },
  {
    id: "ai-model-deploy",
    title: "模型部署",
    difficulty: 4,
    prerequisites: ["ai-frameworks"],
    frequency: "高",
    bigTech: true,
    summary: "模型量化、知识蒸馏、ONNX、TensorRT、模型服务化、推理优化 KV Cache、大模型部署。",
    mastery: 0,
  },
  {
    id: "ai-mlops",
    title: "MLOps",
    difficulty: 3,
    prerequisites: ["ai-model-deploy"],
    frequency: "中",
    bigTech: true,
    summary: "实验管理、模型注册、数据版本、模型监控漂移、CI/CD for ML、特征平台、MLOps 平台建设。",
    mastery: 0,
  },
];

const AI_QUESTIONS: Question[] = [
  // ===== 1. ai-ml-fundamentals =====
  {
    id: "ai-1",
    nodeId: "ai-ml-fundamentals",
    question: "解释偏差-方差权衡（Bias-Variance Tradeoff），过拟合和欠拟合分别对应什么？",
    answer: `结论：期望误差 = 偏差² + 方差 + 不可约噪声。偏差高对应欠拟合（模型太简单），方差高对应过拟合（学到噪声），目标是找到总误差最低的平衡点。

实际案例：在阿里淘宝搜索点击率预估早期，用线性 LR 模型偏差高（拟合不了特征非线性交互），后来引入 GBDT+LR 才降低偏差；但如果直接用深层神经网络在小样本上训练，又会方差高、过拟合。工业上靠"加数据+正则+早停+交叉验证"在偏差方差间权衡。

\`\`\`python
from sklearn.model_selection import validation_curve
import numpy as np
train_scores, val_scores = validation_curve(
    RandomForestClassifier(), X, y, param_name="max_depth",
    param_range=range(1, 30), cv=5, scoring="f1")
# 训练分高、验证分低 → 过拟合；两者都低 → 欠拟合
print("最优深度:", np.argmax(val_scores.mean(axis=1)) + 1)
\`\`\`

踩坑：不要只看训练误差判断过拟合，必须看验证误差；类别不平衡时偏差方差判断要用 PR-AUC 而非 Accuracy。`,
    keyPoints: ["误差 = 偏差² + 方差 + 噪声", "高偏差=欠拟合，高方差=过拟合", "正则化/增数据降方差"],
    followUps: ["集成学习如何降低方差？", "L1 和 L2 降低方差方式有何不同？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-2",
    nodeId: "ai-ml-fundamentals",
    question: "什么是交叉验证？K 折、分层 K 折、时间序列交叉验证有何区别？",
    answer: `结论：交叉验证把数据轮流划分训练/验证多轮取平均，更可靠估计泛化能力。K 折均分 K 份轮流验证；分层 K 折保持每折类别比例；时间序列不能打乱，用前 n 天训练预测第 n+1 天。

实际案例：百度凤巢广告 CTR 模型离线评估必须用时间序列交叉验证（按天滚动），如果用随机 K 折会造成"用未来数据预测过去"的数据泄露，离线 AUC 虚高但上线效果差。金融风控用分层 K 折保证正负样本比例。

\`\`\`python
from sklearn.model_selection import StratifiedKFold, TimeSeriesSplit
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
for tr, va in skf.split(X, y):
    model.fit(X[tr], y[tr]); print(model.score(X[va], y[va]))
# 时间序列：前向滚动
tscv = TimeSeriesSplit(n_splits=5)
for tr, va in tscv.split(X):
    model.fit(X[tr], y[tr])
\`\`\`

踩坑：Target Encoding、特征缩放必须在每折训练集内部 fit 再 transform 到验证集，否则泄露；最终上线的模型要在全量数据上重训。`,
    keyPoints: ["K 折轮流验证取平均", "分层 K 折保类别比例", "时间序列不能随机打乱"],
    followUps: ["交叉验证能防止过拟合吗？", "数据泄露在交叉验证中如何避免？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-3",
    nodeId: "ai-ml-fundamentals",
    question: "训练集、验证集、测试集的作用？如何划分？数据泄露如何避免？",
    answer: `结论：训练集学参数，验证集调超参和早停，测试集只做最终一次性评估。常见 6:2:2 或 8:1:1。数据泄露指测试/验证信息流入训练，导致离线虚高。

实际案例：腾讯广告做 CTR 特征工程时，如果用全量数据算 Target Encoding 再划分，会把验证集标签统计进特征造成泄露。正确做法是 Target Encoding 只在每折训练集算。时间相关特征（如"未来 7 天点击数"）也是常见泄露源。

\`\`\`python
from sklearn.model_selection import train_test_split
# 先分出测试集
X_trval, X_test, y_trval, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# 再从训练验证集中分验证集
X_tr, X_val, y_tr, y_val = train_test_split(X_trval, y_trval, test_size=0.25, random_state=42)
# 缩放器只在训练集 fit
scaler = StandardScaler().fit(X_tr)
X_tr = scaler.transform(X_tr); X_val = scaler.transform(X_val)
\`\`\`

踩坑：预处理（缩放、填充、编码）都只能在训练集 fit；时间序列按时间切而非随机切；测试集绝对不能参与任何调参。`,
    keyPoints: ["训练学参数/验证调超参/测试最终评估", "预处理只在训练集 fit", "Target Encoding 易泄露"],
    followUps: ["交叉验证能替代验证集吗？", "如何检测数据泄露？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-4",
    nodeId: "ai-ml-fundamentals",
    question: "监督学习、无监督学习、半监督学习、强化学习的区别？各举典型场景。",
    answer: `结论：监督学习有标签（分类/回归）；无监督无标签（聚类/降维/生成）；半监督少量标签+大量无标签；强化学习靠奖励信号序列决策。

实际案例：阿里淘宝搜索用监督学习做点击率预估（有点击标签）；抖音用无监督聚类做用户兴趣分群发现新群体；半监督在医疗影像标注昂贵时用少量标注+大量未标注预训练；强化学习在美团骑手派单、字节推荐长期收益优化中使用。

\`\`\`python
from sklearn.cluster import KMeans  # 无监督
from sklearn.ensemble import RandomForestClassifier  # 监督
# 半监督：标签传播
from sklearn.semi_supervised import LabelSpreading
y_semi = y.copy(); y_semi[500:] = -1  # 仅前 500 有标签
model = LabelSpreading().fit(X, y_semi)
\`\`\`

踩坑：无监督聚类结果不稳定，需多 k 评估轮廓系数；强化学习样本相关性强、奖励稀疏，需重视 reward shaping 和经验回放。`,
    keyPoints: ["监督有标签/无监督无标签", "半监督少量标签+大量无标签", "RL 靠奖励序列决策"],
    followUps: ["主动学习和半监督区别？", "强化学习为什么样本相关？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-5",
    nodeId: "ai-ml-fundamentals",
    question: "生成模型和判别模型的区别？朴素贝叶斯、逻辑回归、HMM、GAN 分别属于哪类？",
    answer: `结论：判别模型直接学 P(Y|X)（条件概率），生成模型学 P(X,Y)=P(X|Y)P(Y)（联合分布），生成模型可采样生成新样本但需要更多数据。

实际案例：垃圾邮件分类用朴素贝叶斯（生成）或逻辑回归（判别）都可，判别通常精度更高；语音识别用 HMM（生成）建模语音序列；GAN（生成）在字节即梦里生成图像。判别模型在分类任务上通常更准，生成模型可处理缺失数据、做异常检测和生成。

\`\`\`python
from sklearn.naive_bayes import GaussianNB  # 生成模型
from sklearn.linear_model import LogisticRegression  # 判别模型
gnb = GaussianNB().fit(X_tr, y_tr)
lr = LogisticRegression().fit(X_tr, y_tr)
# 生成模型可估计 P(X|Y)，判别只给 P(Y|X)
print("生成模型可采样:", gnb.class_prior_)
\`\`\`

踩坑：生成模型在数据少时利用先验更稳，但数据多时判别模型上限更高；GAN 训练不稳定需精心调参。`,
    keyPoints: ["判别学 P(Y|X)，生成学 P(X,Y)", "生成可采样新样本", "判别分类通常更准"],
    followUps: ["朴素贝叶斯为什么是生成模型？", "GAN 训练为什么不稳定？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-6",
    nodeId: "ai-ml-fundamentals",
    question: "类别不平衡（正样本仅 1%）如何处理？各方法优缺点？",
    answer: `结论：重采样（过采样 SMOTE/欠采样）、类权重、阈值调整、Focal Loss、用 PR-AUC/F1 评估而非 Accuracy。

实际案例：腾讯广告反作弊识别正样本占比 <0.1%，直接训练模型全预测负类也有 99.9% 准确率。工业做法：类权重 balanced + Focal Loss 聚焦难分样本 + 阈值按 PR 曲线选最优 + 用 PR-AUC 评估，而不是过采样（会引入合成噪声样本影响 CTR 校准）。

\`\`\`python
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
w = compute_class_weight("balanced", classes=np.unique(y), y=y)
clf = RandomForestClassifier(class_weight="balanced", n_estimators=300)
# Focal Loss（检测/不平衡常用）
import torch.nn.functional as F
def focal_loss(logits, target, alpha=0.25, gamma=2.0):
    ce = F.cross_entropy(logits, target, reduction="none")
    p = torch.exp(-ce)
    return (alpha * (1 - p) ** gamma * ce).mean()
\`\`\`

踩坑：过采样在交叉验证时必须只在训练折做，否则验证折被污染；CTR 预估需校准概率，过采样会破坏校准。`,
    keyPoints: ["重采样/类权重/阈值调整/Focal Loss", "评估用 PR-AUC+F1 不用 Accuracy", "SMOTE 须在训练折内做"],
    followUps: ["Focal Loss 的 α 和 γ 如何调？", "为什么 AUC 在极度不平衡时也可能高估？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-7",
    nodeId: "ai-ml-fundamentals",
    question: "数据质量和特征工程如何影响模型上限？Garbage in garbage out 怎么理解？",
    answer: `结论：数据和特征决定模型上限，算法只是逼近上限。脏数据（错误标签、缺失、噪声）会直接拉低所有模型表现，再强的算法也救不回来。

实际案例：阿里搜索做商品点击率预估时，曾发现"用户点击序列"特征里混入了点击后立即取消的噪声点击，导致离线 AUC 看起来很高但线上无提升。清洗数据后用同样的 LR 模型 AUC 反而涨了 1.5 个点。特征工程（交叉、统计、序列）往往比换模型收益更大。

\`\`\`python
import pandas as pd
# 数据质量检查
def check_quality(df):
    print("缺失率:", df.isna().mean().sort_values(ascending=False).head())
    print("重复行:", df.duplicated().sum())
    print("标签分布:", df["label"].value_counts(normalize=True))
# 特征工程示例：用户近期点击统计
df["user_click_7d"] = df.groupby("user_id")["item_id"].transform(
    lambda s: s.rolling("7D").count())
\`\`\`

踩坑：不要迷信模型，先做 EDA 和数据清洗；特征泄露会让离线指标虚高但线上无效；线上特征与离线特征不一致是工业大坑。`,
    keyPoints: ["数据特征决定上限算法逼近上限", "特征泄露致离线虚高", "线上线下特征一致性"],
    followUps: ["如何检测特征泄露？", "线上线下特征不一致如何排查？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 2. ai-linear-models =====
  {
    id: "ai-8",
    nodeId: "ai-linear-models",
    question: "线性回归的最小二乘解和梯度下降解有何区别？何时用哪个？",
    answer: `结论：最小二乘是闭式解 θ=(XᵀX)⁻¹Xᵀy，一步到位但要求 XᵀX 可逆且特征数不太大；梯度下降迭代逼近，适合大数据和高维。

实际案例：腾讯广告做 CTR 预估时特征维度上亿（one-hot 后），XᵀX 巨大无法求逆，必须用 SGD/FTRL 在线学习。小数据集回归（如房价预测几十特征）直接最小二乘即可。当特征数 > 样本数时 XᵀX 奇异，需加 L2 正则（岭回归）保证可逆。

\`\`\`python
import numpy as np
# 闭式解（最小二乘）
Xb = np.c_[np.ones(len(X)), X]
theta = np.linalg.pinv(Xb.T @ Xb) @ Xb.T @ y
# 梯度下降
w = np.zeros(X.shape[1])
for _ in range(1000):
    grad = X.T @ (X @ w - y) / len(y)
    w -= 0.01 * grad
\`\`\`

踩坑：特征未标准化时梯度下降收敛慢且不同维度步长不一；共线性特征会让最小二乘解不稳定，需正则化。`,
    keyPoints: ["最小二乘闭式解需可逆", "梯度下降适合大数据高维", "XᵀX 奇异加 L2"],
    followUps: ["岭回归和最小二乘的关系？", "FTRL 为什么适合在线学习？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-9",
    nodeId: "ai-linear-models",
    question: "逻辑回归为什么用交叉熵损失而不是 MSE？",
    answer: `结论：逻辑回归用交叉熵是因为与极大似然等价、损失对参数凸（全局最优），且梯度为 (ŷ-y)x 形式简洁；用 MSE 会导致非凸优化、梯度在饱和区消失。

实际案例：腾讯广告 CTR 预估早期广泛用逻辑回归，正是看中它凸优化、可解释、输出概率可直接校准出价。MSE 下 Sigmoid 饱和区梯度接近 0，训练极慢且易陷局部最优。

\`\`\`python
import torch
import torch.nn.functional as F
# 交叉熵（凸，梯度 = (ŷ-y)x）
logits = torch.randn(4) @ torch.randn(4, 1, requires_grad=True)
loss_ce = F.binary_cross_entropy_with_logits(logits, target)
# MSE（非凸，饱和区梯度消失）
prob = torch.sigmoid(logits)
loss_mse = F.mse_loss(prob, target)
\`\`\`

踩坑：交叉熵要求 logits 不要太大否则数值溢出，框架已用 log-sum-exp 稳定化；类别不平衡时交叉熵需配合类权重。`,
    keyPoints: ["交叉熵与极大似然等价且凸", "MSE 非凸且饱和区梯度消失", "梯度 (ŷ-y)x 简洁"],
    followUps: ["为什么 MSE 在 Sigmoid 下非凸？", "交叉熵如何处理类不平衡？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-10",
    nodeId: "ai-linear-models",
    question: "L1 和 L2 正则化的区别？为什么 L1 能产生稀疏解？",
    answer: `结论：L1（Lasso）加 λΣ|w| 产生稀疏解可做特征选择；L2（Ridge）加 λΣw² 使权重小而分散不归零。L1 稀疏是因为约束区域是菱形，等值线在顶点（坐标轴）相切，对应某些维度为 0。

实际案例：阿里风控用 L1 逻辑回归做特征筛选，从上千特征里挑出几十个强特征，便于上线解释和降低线上特征计算成本；腾讯广告用 L2 防过拟合保概率校准。Elastic Net 结合两者。

\`\`\`python
from sklearn.linear_model import LogisticRegression
l1 = LogisticRegression(penalty="l1", solver="liblinear", C=0.1)
l2 = LogisticRegression(penalty="l2", C=1.0)
l1.fit(X, y)
print("L1 非零特征数:", (l1.coef_ != 0).sum())  # 稀疏
\`\`\`

踩坑：L1 在特征高度相关时不稳定（随机选其中一个）；C 越小正则越强，需交叉验证调参；L1 不可导需用坐标下降/次梯度求解器。`,
    keyPoints: ["L1 稀疏可做特征选择", "L2 平滑权重分散", "L1 菱形顶点相切致稀疏"],
    followUps: ["Elastic Net 是什么？", "正则化系数如何选择？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-11",
    nodeId: "ai-linear-models",
    question: "Softmax 回归如何做多分类？与 OvR 逻辑回归有何区别？",
    answer: `结论：Softmax 回归直接建模多类概率 pᵢ=exp(zᵢ)/Σexp(zⱼ)，所有类联合优化交叉熵，概率和为 1，适合类间互斥；OvR 训 K 个二分类器取最大置信，类多时高效但分类器不协调。

实际案例：ImageNet 图像分类用 Softmax（1000 类互斥）；阿里商品一级类目分类用 Softmax。OvR 适合类间不互斥或类极多且稀疏场景。互斥任务优先 Softmax。

\`\`\`python
from sklearn.linear_model import LogisticRegression
softmax = LogisticRegression(multi_class="multinomial", solver="lbfgs", max_iter=1000)
ovr = LogisticRegression(multi_class="ovr", solver="liblinear")
softmax.fit(X, y)
# 手动 Softmax
import numpy as np
def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    return np.exp(z) / np.exp(z).sum(axis=1, keepdims=True)
\`\`\`

踩坑：Softmax 数值溢出要先减最大值；类别极不平衡时 Softmax 会被大类主导，需类权重；多标签任务用 K 个 Sigmoid 而非 Softmax。`,
    keyPoints: ["Softmax 联合优化概率和为1", "OvR 训 K 个二分类器", "互斥用 Softmax 多标签用 Sigmoid"],
    followUps: ["Softmax 和 Sigmoid 关系？", "多标签分类如何评估？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-12",
    nodeId: "ai-linear-models",
    question: "逻辑回归在大规模 CTR 预估中为何长期被使用？如何工程化？",
    answer: `结论：逻辑回归凸优化、输出概率可校准、可解释、易并行、特征工程灵活，长期是 CTR 预估基线。工程上用 FTRL 在线学习处理亿万级稀疏特征。

实际案例：腾讯广告、百度凤巢 CTR 预估早期核心模型就是 LR+FTRL。理由：广告出价需要校准概率（LR 输出即概率），GBDT 虽然精度高但概率校准差。配合特征交叉（FM/GBDT 生成交叉特征）后 LR 仍是强基线。后续才演进到 DeepFM/Wide&Deep。

\`\`\`python
from sklearn.linear_model import SGDClassifier
# 在线学习 FTRL（sklearn 用 SGD 近似）
clf = SGDClassifier(loss="log_loss", penalty="l2", alpha=1e-6,
                    learning_rate="constant", eta0=0.01)
for chunk in pd.read_csv("huge_ctr.csv", chunksize=100000):
    clf.partial_fit(chunk[feats], chunk["click"], classes=[0, 1])
# 概率校准： Platt scaling
from sklearn.calibration import CalibratedClassifierCV
calibrated = CalibratedClassifierCV(clf, method="isotonic", cv=3)
\`\`\`

踩坑：CTR 概率校准至关重要，否则广告出价失真；线上特征需与离线一致；高基数 ID 特征用 Embedding 或哈希分桶。`,
    keyPoints: ["LR 凸优化输出概率可校准", "FTRL 在线学习处理稀疏高维", "CTR 出价依赖概率校准"],
    followUps: ["FTRL 为什么适合在线学习？", "GBDT 概率为什么校准差？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-13",
    nodeId: "ai-linear-models",
    question: "线性回归的假设有哪些？异方差和多重共线性如何处理？",
    answer: `结论：线性回归假设线性关系、误差独立、同方差、近似正态、特征无强共线性。异方差用加权最小二乘或对数变换；多重共线性用 L2 正则或剔除相关特征。

实际案例：房价预测中"面积"和"房间数"高度相关（共线性），最小二乘解不稳定、系数符号异常。加 Ridge 正则后稳定。残差呈漏斗形（异方差）时对 y 做 log 变换。

\`\`\`python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
X_sm = sm.add_constant(X)
model = sm.OLS(y, X_sm).fit()
print(model.summary())
# 多重共线性检测：VIF > 10 需处理
vif = [variance_inflation_factor(X_sm, i) for i in range(X_sm.shape[1])]
# Ridge 处理共线性
from sklearn.linear_model import Ridge
ridge = Ridge(alpha=10.0).fit(X, y)
\`\`\`

踩坑：共线性不影响预测但破坏系数解释性；异方差会让置信区间失效；树模型对共线性和异方差不敏感，是稳健替代。`,
    keyPoints: ["假设线性/独立/同方差/正态/无共线", "异方差用 WLS 或 log 变换", "共线性用 Ridge 或剔除"],
    followUps: ["VIF 如何判断共线性？", "Ridge 如何缓解共线性？"],
    favorited: false,
    bigTech: false,
  },

  // ===== 3. ai-tree-models =====
  {
    id: "ai-14",
    nodeId: "ai-tree-models",
    question: "决策树划分特征的标准有哪些？信息增益 vs 基尼指数？",
    answer: `结论：划分标准衡量"划分后纯度提升"。ID3 用信息增益（熵），C4.5 用增益率（修正偏向多值特征），CART 用基尼指数（计算快无 log）。

实际案例：阿里搜索用树模型做特征筛选时，基尼重要性（MDI）会偏向高基数连续特征，需配合排列重要性（MDA）交叉验证。CART 生成二叉树，工程实现简单，是 XGBoost/LightGBM 的基础。

\`\`\`python
import numpy as np
def gini(y):
    _, counts = np.unique(y, return_counts=True)
    p = counts / len(y)
    return 1 - np.sum(p ** 2)
def info_gain(y, y_left, y_right):
    p = len(y_left) / len(y)
    return gini(y) - p * gini(y_left) - (1 - p) * gini(y_right)
from sklearn.tree import DecisionTreeClassifier
clf = DecisionTreeClassifier(criterion="gini", max_depth=5)
\`\`\`

踩坑：信息增益偏向取值多的特征（如 ID）；基尼偏向隔离高频类；连续值需找最优切分点，计算量大。`,
    keyPoints: ["ID3 信息增益/C4.5 增益率/CART 基尼", "信息增益偏向多值特征", "基尼计算快无 log"],
    followUps: ["CART 如何处理连续值和缺失值？", "决策树如何剪枝？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-15",
    nodeId: "ai-tree-models",
    question: "随机森林为什么能降低过拟合？Bagging 的原理？",
    answer: `结论：Bagging 有放回采样训练多棵树，再投票/平均，多树独立误差平均后方差降为 σ²/n。随机森林再加特征随机（每次分裂只选特征子集）降低树间相关性，进一步降方差。

实际案例：金融风控用随机森林做信用评分，单棵深决策树易过拟合，集成后稳定且 OOB（袋外）评估免费。Boosting（GBDT）则降偏差，串联纠错，适合残差还大的场景。

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=300, max_features="sqrt",
                            oob_score=True, n_jobs=-1, random_state=42)
rf.fit(X_tr, y_tr)
print("OOB 得分:", rf.oob_score_)  # 免费验证集评估
\`\`\`

踩坑：树越多收益递减且耗时，通常 100-500 棵够了；特征随机比例 sqrt 适合分类，1/3 适合回归；Bagging 降方差不降偏差，欠拟合时换 Boosting。`,
    keyPoints: ["Bagging 有放回采样训练多棵树", "随机森林加特征随机去相关", "平均降方差 σ²/n"],
    followUps: ["Bagging 和 Boosting 区别？", "OOB 评估原理？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-16",
    nodeId: "ai-tree-models",
    question: "GBDT 的原理？为什么拟合负梯度（残差）？",
    answer: `结论：GBDT 串行训练，每棵新树拟合之前模型的负梯度（残差），逐步降低偏差。加法模型 Fₘ=Fₘ₋₁+α·hₘ，hₘ 学残差。

实际案例：搜索排序早期用 GBDT（LambdaMART）做排序，每棵树拟合 NDCG 的负梯度。GBDT 降偏差适合"模型还不够强"的场景，但串行训练慢、对噪声敏感。

\`\`\`python
from sklearn.ensemble import GradientBoostingClassifier
gbdt = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1,
                                  max_depth=3, subsample=0.8)
gbdt.fit(X_tr, y_tr)
# 手动残差拟合示意
import numpy as np
residual = y - model.predict(X)  # 负梯度
new_tree.fit(X, residual)
model.add(new_tree, weight=learning_rate)
\`\`\`

踩坑：学习率小+树多更稳但慢，需早停防过拟合；GBDT 对异常值敏感（残差被拉大），需稳健损失或剔除异常；类别特征需先编码。`,
    keyPoints: ["GBDT 串行拟合负梯度残差", "加法模型降偏差", "学习率小+早停防过拟合"],
    followUps: ["GBDT 和 AdaBoost 区别？", "GBDT 如何做回归和分类？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-17",
    nodeId: "ai-tree-models",
    question: "XGBoost 相比 GBDT 的核心改进？",
    answer: `结论：XGBoost 改进：目标函数二阶泰勒展开（用一阶+二阶梯度）、正则化项（叶子数+L2）、特征/列采样、缺失值自动学默认方向、直方图近似分裂加速、并行化（特征粒度）。

实际案例：XGBoost 长期是 Kaggle 表格数据冠军模型，也是金融风控/广告 CTR 的主力。腾讯广告用 XGBoost 做特征筛选和预估，二阶展开收敛快、精度高，缺失值自动处理省去填充。

\`\`\`python
import xgboost as xgb
dtr = xgb.DMatrix(X_tr, label=y_tr)
dval = xgb.DMatrix(X_val, label=y_val)
params = {"objective": "binary:logistic", "max_depth": 6, "eta": 0.1,
          "subsample": 0.8, "colsample_bytree": 0.8, "eval_metric": "auc"}
model = xgb.train(params, dtr, num_boost_round=1000,
                  evals=[(dval, "val")], early_stopping_rounds=50)
\`\`\`

踩坑：max_depth 过深易过拟合（表 6-8 足够）；scale_pos_weight 处理不平衡；调参顺序 eta→max_depth→subsample→colsample→正则。`,
    keyPoints: ["二阶泰勒展开收敛快", "正则化+采样防过拟合", "直方图+并行加速"],
    followUps: ["XGBoost 直方图算法如何加速？", "XGBoost 如何处理缺失值？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-18",
    nodeId: "ai-tree-models",
    question: "LightGBM 的 leaf-wise、GOSS、EFB 各解决什么问题？",
    answer: `结论：LightGBM 三大改进：leaf-wise（按叶子增益最大分裂，深但快，需限 max_depth）替代 level-wise；GOSS（基于梯度的单侧采样，保留梯度大样本）；EFB（互斥特征捆绑降维）。直方图算法+类别特征原生支持，速度比 XGBoost 快 3-5 倍。

实际案例：阿里淘宝搜索排序用 LightGBM 训练上亿样本，相比 XGBoost 训练时间从天级降到小时级。leaf-wise 在大数据上收敛快但小数据易过拟合，需配合 max_depth 和早停。

\`\`\`python
import lightgbm as lgb
tr_data = lgb.Dataset(X_tr, label=y_tr, categorical_feature=["city", "hour"])
val_data = lgb.Dataset(X_val, label=y_val, reference=tr_data)
params = {"objective": "binary", "metric": "auc", "num_leaves": 63,
          "learning_rate": 0.05, "feature_fraction": 0.8,
          "bagging_fraction": 0.8, "bagging_freq": 5, "verbose": -1}
model = lgb.train(params, tr_data, num_boost_round=2000,
                  valid_sets=[val_data], callbacks=[lgb.early_stopping(50)])
\`\`\`

踩坑：leaf-wise 小数据易过拟合，num_leaves 别太大；GOSS 采样比例影响精度需调；类别特征直接传 categorical_feature 比手动 one-hot 快且准。`,
    keyPoints: ["leaf-wise 增益最大分裂深但快", "GOSS 保留梯度大样本", "EFB 捆绑互斥特征降维"],
    followUps: ["leaf-wise 为什么易过拟合？", "直方图算法如何加速？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-19",
    nodeId: "ai-tree-models",
    question: "CatBoost 如何处理类别特征？相比 One-Hot 优势？",
    answer: `结论：CatBoost 用有序 Target Statistics（Ordered TS）把类别替换为目标均值，只用"之前"样本算避免标签泄露；Ordered Boosting 防预测偏移；对称树推理快抗过拟合。

实际案例：蚂蚁金服风控数据类别特征丰富（城市、设备、渠道），CatBoost 无需手动编码直接传入 cat_features，相比 XGBoost 还需先 Target Encoding 省心且防泄露，AUC 更稳。

\`\`\`python
from catboost import CatBoostClassifier, Pool
pool = Pool(X_tr, y_tr, cat_features=["city", "device", "channel"])
model = CatBoostClassifier(iterations=1000, depth=6, learning_rate=0.05,
                           eval_metric="AUC", random_seed=42)
model.fit(pool, eval_set=Pool(X_val, y_val, cat_features=["city","device","channel"]),
          early_stopping_rounds=50, verbose=100)
\`\`\`

踩坑：高基数类别 Ordered TS 仍可能过拟合，需调 l2_leaf_reg；对称树对某些非线性交互表达力弱；CatBoost 训练比 LightGBM 略慢。`,
    keyPoints: ["有序 Target Statistics 防泄露", "Ordered Boosting 防偏移", "对称树推理快"],
    followUps: ["Ordered TS 为什么防泄露？", "对称树和普通 CART 区别？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-20",
    nodeId: "ai-tree-models",
    question: "树模型特征重要性有哪几种？为什么会有偏差？",
    answer: `结论：MDI（基尼重要性）偏高基数特征；MDA（排列重要性）模型无关更稳但相关特征互相替代会低估；SHAP 基于 Shapley 值最严谨但计算贵。

实际案例：蚂蚁风控做可解释性时，MDI 把"用户 ID"这种高基数特征排第一（其实无用），改用 SHAP 后发现真正重要的是"历史逾期次数"。监管要求可解释，SHAP 提供单样本级归因。

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=300).fit(X_tr, y_tr)
print("MDI:", rf.feature_importances_)
perm = permutation_importance(rf, X_val, y_val, n_repeats=10, random_state=0)
print("MDA:", perm.importances_mean)
# SHAP
import shap
explainer = shap.TreeExplainer(rf)
shap_values = explainer.shap_values(X_val[:100])
shap.summary_plot(shap_values, X_val[:100])
\`\`\`

踩坑：MDI 在训练集算会乐观偏置，务必在验证集算 MDA；相关特征让重要性分散低估；SHAP 计算量大需采样。`,
    keyPoints: ["MDI 偏高基数特征", "MDA 打乱特征看指标下降", "SHAP 最严谨但贵"],
    followUps: ["SHAP 和 LIME 区别？", "相关特征为何低估重要性？"],
    favorited: false,
    bigTech: false,
  },

  // ===== 4. ai-svm =====
  {
    id: "ai-21",
    nodeId: "ai-svm",
    question: "SVM 的核心思想？软间隔和 C 参数的作用？",
    answer: `结论：SVM 寻找最大化分类间隔的超平面，间隔=2/||w||。软间隔引入松弛变量 ξᵢ 允许部分样本错分，目标 min 1/2||w||²+C·Σξᵢ，C 权衡间隔与错分：C 大过拟合，C 小欠拟合。

实际案例：文本分类高维稀疏场景线性 SVM 表现优异，曾是新闻分类主力。C 通过对数网格搜索调优。SVM 只由支持向量决定，泛化好、对小样本鲁棒。

\`\`\`python
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV
param_grid = {"C": [0.1, 1, 10, 100], "gamma": ["scale", 0.001, 0.01, 0.1]}
grid = GridSearchCV(SVC(kernel="rbf"), param_grid, cv=5, scoring="f1")
grid.fit(X_tr, y_tr)
print("最优:", grid.best_params_)
\`\`\`

踩坑：SVM 训练复杂度 O(n²)~O(n³)，样本过万极慢，大数据用 LinearSVC 或换树模型；特征必须标准化，否则距离被大量纲特征主导。`,
    keyPoints: ["最大化分类间隔 2/||w||", "软间隔 C 权衡间隔与错分", "支持向量决定边界"],
    followUps: ["C 和 γ 如何互相影响？", "为什么 SVM 对小样本鲁棒？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-22",
    nodeId: "ai-svm",
    question: "为什么要用核函数？RBF 核的 γ 参数影响？",
    answer: `结论：线性不可分时核函数 K(xᵢ,xⱼ)=φ(xᵢ)·φ(xⱼ) 直接算高维内积（核技巧），避免显式映射的维度爆炸。RBF 核 K=exp(-γ||x-z||²)，γ 大只近样本影响易过拟合，γ 小远样本也影响平滑可能欠拟合。

实际案例：基因表达数据样本少维度高，RBF 核 SVM 常胜出。γ 和 C 联合对数网格搜索。文本高维稀疏用线性核更快更好。

\`\`\`python
from sklearn.svm import SVC
# 线性核：高维稀疏
linear = SVC(kernel="linear", C=1.0)
# RBF 核：非线性中小样本
rbf = SVC(kernel="rbf", C=10, gamma=0.01)
# 自定义核
def my_kernel(X, Z): return X @ Z.T
custom = SVC(kernel=my_kernel)
\`\`\`

踩坑：γ 过大模型退化为 KNN（只看最近邻）；核矩阵 O(n²) 内存，样本多需用近似核方法或 Nystroem；标准化是核方法前提。`,
    keyPoints: ["核技巧隐式高维映射避免维度爆炸", "RBF γ 大过拟合小欠拟合", "高维稀疏用线性核"],
    followUps: ["核函数如何自定义？", "多项式核适合什么场景？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-23",
    nodeId: "ai-svm",
    question: "SVM 对偶问题是什么？为什么要求对偶？",
    answer: `结论：拉格朗日乘子法把原始问题转为对偶：max Σαᵢ-1/2ΣΣαᵢαⱼyᵢyⱼ(xᵢ·xⱼ)，约束 Σαᵢyᵢ=0, 0≤αᵢ≤C。求对偶因为：只涉及内积便于核技巧、d≫n 时维度更低、支持向量稀疏（多数 α=0）加速预测。

实际案例：SMO 算法每次选两个 α 优化求解对偶，是 libsvm 核心。理解对偶能解释为何 SVM 预测只需支持向量。

\`\`\`python
# 概念示意：对偶解出 alpha 后
# w = Σ alpha_i * y_i * x_i  （仅 alpha>0 即支持向量参与）
# b 由支持向量约束求得
from sklearn.svm import SVC
clf = SVC(kernel="linear", C=1.0).fit(X, y)
print("支持向量数:", clf.n_support_)  # 多数样本 alpha=0
\`\`\`

踩坑：样本数大时对偶核矩阵 O(n²) 仍是大瓶颈；线性 SVM 用原问题（LinearSVC）比对偶快得多；理解 KKT 条件有助于分析支持向量。`,
    keyPoints: ["拉格朗日乘子转对偶", "对偶只涉内积便于核技巧", "支持向量 α>0 稀疏"],
    followUps: ["SMO 算法流程？", "KKT 条件作用？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-24",
    nodeId: "ai-svm",
    question: "SVM 如何做多分类？为什么常选 OvO？",
    answer: `结论：SVM 原生二分类，多分类用 OvR（K 个全量模型）或 OvO（K(K-1)/2 个小子集模型投票）。SVM 训练复杂度 O(n²)~O(n³)，OvO 每个子分类器样本少总开销低，libsvm 默认 OvO。

实际案例：手写数字识别用 OvO SVM，10 类训 45 个二分类器，每个只在 2 类样本上训，比 OvR 10 个全量模型快。DAG-SVM 把决策减到 K-1 次。

\`\`\`python
from sklearn.svm import SVC
from sklearn.multiclass import OneVsOneClassifier, OneVsRestClassifier
base = SVC(kernel="rbf", C=1.0, gamma="scale")
ovo = OneVsOneClassifier(base).fit(X, y)   # 45 个子模型（10 类）
ovr = OneVsRestClassifier(base).fit(X, y)
\`\`\`

踩坑：OvO 模型多但单个小，类多时存储成本上升；投票平票用决策值大小破平；类别极不平衡时 OvR 的"其余"类过大需采样。`,
    keyPoints: ["OvR 训 K 个全量模型", "OvO 训 K(K-1)/2 个小子集模型", "SVM 复杂度高常选 OvO"],
    followUps: ["OvO 投票平票怎么办？", "DAG-SVM 如何加速？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-25",
    nodeId: "ai-svm",
    question: "SVR 的原理？ε-不敏感损失是什么？",
    answer: `结论：SVR 找超平面让预测与真实差距不超过 ε（容忍带），带内样本无损失，目标 min 1/2||w||²+C·Σξ。ε 大容忍多支持向量少平滑可能欠拟合，ε 小严格易过拟合。

实际案例：时间序列预测用 SVR 时 ε 控制容忍带，太大欠拟合太小过拟合。C/γ/ε 三参数对数网格搜索调优。

\`\`\`python
from sklearn.svm import SVR
from sklearn.model_selection import GridSearchCV
param_grid = {"C": [0.1, 1, 10, 100], "gamma": ["scale", 0.01, 0.1],
              "epsilon": [0.01, 0.1, 0.5]}
grid = GridSearchCV(SVR(kernel="rbf"), param_grid, cv=5,
                    scoring="neg_mean_squared_error")
grid.fit(X, y)
\`\`\`

踩坑：SVR 样本多极慢，大数据换 GBDT/线性回归；ε=0 退化为普通 SVR 易过拟合；标准化特征必需。`,
    keyPoints: ["ε-不敏感损失只惩罚带外样本", "C 权衡间隔与误差", "C/γ/ε 对数网格搜索"],
    followUps: ["ε 如何选择？", "SVR 和岭回归区别？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-26",
    nodeId: "ai-svm",
    question: "SVM 和逻辑回归的区别？什么场景选哪个？",
    answer: `结论：SVM 用 hinge loss 最大化间隔，只由支持向量决定，小样本鲁棒但不输出概率；LR 用交叉熵输出概率，全样本参与，可解释、大样本工程化好。

实际案例：腾讯广告 CTR 预估选 LR（需概率出价、大规模稀疏、可解释）；小样本非线性分类（如医疗诊断）选 RBF 核 SVM。文本高维稀疏两者都可，LR 更易工程化。

\`\`\`python
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
lr = LogisticRegression(C=1.0, class_weight="balanced")
svm = SVC(kernel="rbf", C=1.0, gamma="scale", probability=True)  # Platt 转概率
\`\`\`

踩坑：SVM 需 Platt scaling 才有概率，校准不如 LR 自然；LR 大数据可并行训练，SVM 难并行；树模型/XGBoost 在表格数据上常优于两者。`,
    keyPoints: ["SVM hinge loss 最大化间隔", "LR 交叉熵输出概率", "小样本非线性 SVM / 大样本概率 LR"],
    followUps: ["hinge loss 和 log loss 形状区别？", "为什么 SVM 对异常点更鲁棒？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 5. ai-ensemble =====
  {
    id: "ai-27",
    nodeId: "ai-ensemble",
    question: "Bagging 和 Boosting 的本质区别？各自适合什么场景？",
    answer: `结论：Bagging 并行训练独立模型再平均，降方差，适合高方差模型（深决策树）；Boosting 串行纠错，降偏差，适合高偏差模型（弱学习器）。Bagging 样本有放回采样，Boosting 关注难分样本。

实际案例：随机森林（Bagging）在风控数据稳定不易过拟合；GBDT/XGBoost（Boosting）在 CTR/排序上精度更高但需精细调参防过拟合。

\`\`\`python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
rf = RandomForestClassifier(n_estimators=300, max_features="sqrt")  # Bagging
gbdt = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1)  # Boosting
\`\`\`

踩坑：Boosting 学习率小+树多更稳但慢，需早停；Bagging 增树收益递减；噪声大时 Boosting 易过拟合噪声，Bagging 更鲁棒。`,
    keyPoints: ["Bagging 并行降方差", "Boosting 串行降偏差", "Bagging 适合深树 Boosting 适合弱学习器"],
    followUps: ["Boosting 如何关注难分样本？", "噪声大时哪个更鲁棒？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-28",
    nodeId: "ai-ensemble",
    question: "Stacking 的原理？如何避免标签泄露？",
    answer: `结论：Stacking 训练多个基模型，用它们的预测作为新特征训练元模型。为防标签泄露，基模型预测必须用 K 折 Out-of-Fold（OOF）生成，即每个样本的预测由未见过它的模型给出。

实际案例：Kaggle 比赛中常见 XGBoost+LightGBM+神经网络 Stacking，OOF 特征喂给 LR/LightGBM 元模型。美团配送 ETA 预估也用多模型 Stacking 提升稳定性。

\`\`\`python
from sklearn.model_selection import StratifiedKFold
import numpy as np
def oof_predict(model_cls, X, y, X_test, n_splits=5):
    oof = np.zeros(len(X)); pred = np.zeros(len(X_test))
    skf = StratifiedKFold(n_splits, shuffle=True, random_state=42)
    for tr, va in skf.split(X, y):
        m = model_cls().fit(X[tr], y[tr])
        oof[va] = m.predict_proba(X[va])[:, 1]
        pred += m.predict_proba(X_test)[:, 1] / n_splits
    return oof, pred
# 元模型用 OOF 特征训练
meta_X = np.column_stack([oof_lgb, oof_xgb])
meta_model = LogisticRegression().fit(meta_X, y)
\`\`\`

踩坑：直接用基模型在训练集预测做特征会严重泄露；元模型别太复杂（LR/简单树即可）否则过拟合；基模型需多样性。`,
    keyPoints: ["多基模型预测做元模型特征", "OOF 防标签泄露", "元模型宜简单"],
    followUps: ["Stacking 和 Blending 区别？", "元模型选什么？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-29",
    nodeId: "ai-ensemble",
    question: "Blending 和 Stacking 的区别？",
    answer: `结论：Stacking 用 K 折 OOF 生成元特征；Blending 简单划分一个 holdout 验证集，基模型在训练集训练、在验证集预测生成元特征，更简单但数据利用率低。

实际案例：时间紧或数据大时用 Blending 快速验证融合效果；追求精度用 Stacking（K 折充分利用数据）。两者都是模型融合，差异在元特征生成方式。

\`\`\`python
from sklearn.model_selection import train_test_split
# Blending：划 holdout
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.3)
m1 = LGBMClassifier().fit(X_tr, y_tr)
m2 = XGBClassifier().fit(X_tr, y_tr)
val_feat = np.column_stack([m1.predict_proba(X_val)[:,1],
                            m2.predict_proba(X_val)[:,1]])
meta = LogisticRegression().fit(val_feat, y_val)
\`\`\`

踩坑：Blending holdout 小则元特征噪声大；Stacking 计算量是基模型的 K 倍；融合收益递减，3-5 个差异大的模型即可。`,
    keyPoints: ["Blending 用 holdout 生成元特征", "Stacking 用 K 折 OOF", "Blending 简单数据利用率低"],
    followUps: ["Blending 何时优于 Stacking？", "融合多少个模型合适？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-30",
    nodeId: "ai-ensemble",
    question: "集成学习的多样性来源有哪些？为什么多样性重要？",
    answer: `结论：多样性让基模型误差不相关，平均后方差降低更多。来源：数据多样性（Bootstrap/不同样本子集）、特征多样性（随机特征子集）、算法多样性（不同模型）、参数多样性（不同超参）、标签多样性（不同目标）。

实际案例：随机森林用样本+特征双重随机；Kaggle 冠军队常融合 GBDT+DNN+LR，模型差异大互补性强。同质模型融合（全是 XGBoost）多样性低收益小。

\`\`\`python
# 多样性度量：模型预测的 disagreement
def disagreement(pred1, pred2):
    return np.mean(pred1 != pred2)
# 构造多样基模型
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.neural_network import MLPClassifier
models = [RandomForestClassifier(), XGBClassifier(), MLPClassifier()]
\`\`\`

踩坑：基模型都弱则融合仍弱（需个体强+差异大）；相关性高的模型融合收益小；多样性 vs 准确性需平衡。`,
    keyPoints: ["数据/特征/算法/参数多样性", "误差不相关平均降方差多", "个体强+差异大"],
    followUps: ["如何量化模型多样性？", "同质模型融合为何收益小？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-31",
    nodeId: "ai-ensemble",
    question: "XGBoost 和随机森林如何选择？",
    answer: `结论：随机森林并行训练稳定不易过拟合，适合数据噪声大、调参精力少；XGBoost 精度通常更高但需精细调参，适合追求精度的竞赛和工业 CTR。

实际案例：风控数据噪声大、稳定性优先选随机森林；CTR/排序精度优先选 XGBoost/LightGBM。数据小用 RF 更稳，数据大 XGBoost 上限高。

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
rf = RandomForestClassifier(n_estimators=500, max_features="sqrt", n_jobs=-1)
xgb = XGBClassifier(n_estimators=1000, max_depth=6, learning_rate=0.05,
                    subsample=0.8, colsample_bytree=0.8,
                    eval_metric="auc", early_stopping_rounds=50)
\`\`\`

踩坑：RF 不需太多调参，XGBoost 调参空间大；RF 并行训练快，XGBoost 串行慢但 GPU 加速可弥补；两者都给特征重要性。`,
    keyPoints: ["RF 稳定少调参", "XGBoost 精度高需调参", "噪声大 RF / 精度优先 XGBoost"],
    followUps: ["RF 为什么不易过拟合？", "XGBoost GPU 加速原理？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-32",
    nodeId: "ai-ensemble",
    question: "多模型融合在工业实战中如何落地？",
    answer: `结论：工业融合常用 Stacking/加权平均/投票，基模型选差异大的（树+DNN+LR），元模型简单（LR）。线上需考虑延迟和工程复杂度，常做模型蒸馏把融合效果压进单模型。

实际案例：美团配送 ETA 预估融合 LightGBM+深度网络+规则模型，离线 MAE 降 8%，但线上延迟敏感，最终用蒸馏把融合模型知识迁移到单 LightGBM 部署。腾讯广告 CTR 多模型加权融合后用蒸馏上线。

\`\`\`python
# 加权融合
preds = {"lgb": lgb_pred, "xgb": xgb_pred, "dnn": dnn_pred}
weights = {"lgb": 0.4, "xgb": 0.3, "dnn": 0.3}  # 按验证集表现调
final = sum(weights[k] * preds[k] for k in preds)
# 蒸馏：融合模型的软标签训单模型
soft_label = final
student = LGBMClassifier().fit(X, (soft_label > 0.5).astype(int),
                                sample_weight=soft_label)
\`\`\`

踩坑：融合提升 1-2% 但延迟翻倍，需 ROI 评估；线上特征一致性比模型复杂度更重要；蒸馏温度 T 调优保留软标签信息。`,
    keyPoints: ["基模型差异大+元模型简单", "蒸馏把融合压进单模型上线", "延迟与精度 ROI 权衡"],
    followUps: ["知识蒸馏温度如何选？", "线上融合延迟如何控制？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-33",
    nodeId: "ai-ensemble",
    question: "集成模型的可解释性如何处理？SHAP 在树模型中如何加速？",
    answer: `结论：树模型集成用 TreeSHAP 算法（基于树结构的精确 Shapley 值，多项式复杂度而非指数），可在 XGBoost/LightGBM 上快速计算单样本归因，满足金融监管可解释要求。

实际案例：蚂蚁金服风控需向监管解释拒贷原因，用 TreeSHAP 输出每用户"历史逾期次数贡献+0.3、负债比贡献+0.2..."，比 MDI 全局重要性更细粒度。

\`\`\`python
import shap
explainer = shap.TreeExplainer(model)  # TreeSHAP 自动用快速算法
shap_values = explainer.shap_values(X_val[:1000])
shap.force_plot(explainer.expected_value, shap_values[0], X_val.iloc[0])
shap.summary_plot(shap_values, X_val[:1000])  # 全局特征重要性
\`\`\`

踩坑：TreeSHAP 仍是 O(TLD²) 需采样大样本；相关特征下 SHAP 值分配有偏；深度网络用 DeepSHAP/Integrated Gradients。`,
    keyPoints: ["TreeSHAP 多项式复杂度", "单样本归因满足监管", "相关特征下分配有偏"],
    followUps: ["SHAP 和 LIME 区别？", "深度网络如何归因？"],
    favorited: false,
    bigTech: false,
  },

  // ===== 6. ai-optimization =====
  {
    id: "ai-34",
    nodeId: "ai-optimization",
    question: "梯度下降的 BGD、SGD、Mini-batch 区别？深度学习为什么用 Mini-batch？",
    answer: `结论：BGD 全量算梯度稳但慢；SGD 单样本快但噪声大震荡；Mini-batch（32-256）折中，利用 GPU 并行+矩阵加速，是深度学习主流。

实际案例：大模型训练用 batch 越大越好（GPU 利用率高），但受显存限制用梯度累加模拟大 batch。腾讯广告在线学习用 SGD/FTRL 单样本更新应对实时性。

\`\`\`python
from torch.utils.data import DataLoader
loader = DataLoader(dataset, batch_size=256, shuffle=True, num_workers=4)
for x, y in loader:
    optimizer.zero_grad()
    loss = model(x, y)
    loss.backward()
    optimizer.step()
# 梯度累加模拟大 batch
accum_steps = 4
for i, (x, y) in enumerate(loader):
    loss = model(x, y) / accum_steps
    loss.backward()
    if (i + 1) % accum_steps == 0:
        optimizer.step(); optimizer.zero_grad()
\`\`\`

踩坑：batch 太小噪声大收敛慢，太大泛化差（尖锐极小值）；学习率需随 batch 调整（线性缩放规则）；BN 层 batch 太小统计不准。`,
    keyPoints: ["Mini-batch 折中速度与稳定", "GPU 并行矩阵加速", "梯度累加模拟大 batch"],
    followUps: ["batch 大小如何影响泛化？", "线性缩放规则是什么？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-35",
    nodeId: "ai-optimization",
    question: "Momentum、RMSProp、Adam 的演进与区别？",
    answer: `结论：Momentum 累积一阶动量加速方向；RMSProp 累积二阶动量自适应步长；Adam=一阶+二阶+偏差修正，自适应学习率+动量，是 NLP/Embedding 默认。

实际案例：CV 大批训练常用 SGD+Momentum 泛化更好；Transformer/LLM 用 AdamW（解耦权重衰减）；稀疏特征（NLP）Adam 自适应优势明显。字节 AML 训练大模型默认 AdamW。

\`\`\`python
# Adam 手动实现
m = beta1 * m + (1 - beta1) * g          # 一阶动量
v = beta2 * v + (1 - beta2) * g * g       # 二阶动量
m_hat = m / (1 - beta1 ** t)              # 偏差修正
v_hat = v / (1 - beta2 ** t)
theta -= lr * m_hat / (sqrt(v_hat) + eps)
# PyTorch
import torch
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
\`\`\`

踩坑：Adam 泛化有时不如 SGD+Momentum（CV），因自适应学习率可能陷入尖锐极小值；AdamW 比 Adam+L2 更有效；β₁=0.9 β₂=0.999 ε=1e-8 是好默认。`,
    keyPoints: ["Momentum 加速方向 / RMSProp 自适应步长", "Adam = 一阶+二阶+偏差修正", "AdamW 解耦权重衰减"],
    followUps: ["为什么 Adam 泛化有时不如 SGD？", "AdamW 解耦权重衰减原理？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-36",
    nodeId: "ai-optimization",
    question: "AdamW 相比 Adam+L2 的解耦权重衰减有何优势？",
    answer: `结论：Adam+L2 把权重衰减混进梯度，自适应学习率会让大梯度参数衰减不足、小梯度参数衰减过度；AdamW 把权重衰减独立作用在参数上（θ←(1-ηλ)θ），衰减均匀有效，Transformer 标配。

实际案例：BERT/GPT/LLaMA 等所有主流 LLM 训练用 AdamW。字节豆包、智谱 GLM 训练框架默认 AdamW。L2 正则在自适应优化器下效果被扭曲。

\`\`\`python
import torch
# AdamW：权重衰减独立
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01,
                        betas=(0.9, 0.999), eps=1e-8)
# 等价手动：先衰减参数再按 Adam 更新
for p in model.parameters():
    p.data.mul_(1 - lr * weight_decay)  # 解耦衰减
# 然后 Adam 更新
\`\`\`

踩坑：weight_decay 别太大（0.01-0.1），过大欠拟合；不同参数组可用不同 weight_decay（如 LayerNorm/bias 不衰减）；大 batch 训练需配合更大 weight_decay。`,
    keyPoints: ["Adam+L2 衰减被自适应扭曲", "AdamW 衰减独立作用参数", "Transformer/LLM 标配"],
    followUps: ["为什么 LayerNorm 不衰减？", "weight_decay 如何调？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-37",
    nodeId: "ai-optimization",
    question: "学习率调度策略有哪些？warmup 为什么重要？",
    answer: `结论：常见 Step/Cosine/OneCycle/Plateau 调度。warmup 前若干步线性升学习率防初期发散（权重随机、Adam 二阶矩未稳），再衰减精调，大 batch/大模型几乎必备。

实际案例：BERT/LLaMA 训练用 warmup+cosine，warmup 占总步数 1-5%。CV 用 OneCycle 超参少效果稳。腾讯训练百亿参数模型 warmup 2000 步+cosine 衰减。

\`\`\`python
import torch
from torch.optim.lr_scheduler import LinearLR, CosineAnnealingLR, SequentialLR
optim = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
warmup = LinearLR(optim, start_factor=0.01, total_iters=2000)
cosine = CosineAnnealingLR(optim, T_max=total_steps - 2000)
scheduler = SequentialLR(optim, [warmup, cosine], milestones=[2000])
\`\`\`

踩坑：warmup 太长欠拟合，太短初期发散；大 batch 需更长 warmup 和更大峰值学习率；监控学习率曲线与 loss 关系调优。`,
    keyPoints: ["Cosine/OneCycle/Step/Plateau 调度", "warmup 防初期发散建稳定动量", "大 batch 大模型 warmup 必备"],
    followUps: ["OneCycle 超参如何选？", "为什么大 batch 需更长 warmup？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-38",
    nodeId: "ai-optimization",
    question: "二阶方法（牛顿法、拟牛顿）为什么在深度学习中很少用？",
    answer: `结论：二阶方法用 Hessian 矩阵加速收敛，但 Hessian 是 O(d²) 存储、O(d³) 求逆，深度学习参数上亿不可行；且非凸+噪声使 Hessian 不定。故深度学习用一阶+自适应+动量。

实际案例：传统凸优化（LR/SVM 小规模）可用 L-BFGS 拟牛顿快速收敛；深度学习用 Adam 近似二阶信息（二阶动量 v 近似 Hessian 对角）。XGBoost 二阶泰勒展开是借鉴二阶思想但树结构特殊。

\`\`\`python
from scipy.optimize import minimize
# L-BFGS 拟牛顿（小规模优化）
res = minimize(loss_fn, x0, jac=grad_fn, method="L-BFGS-B")
# 深度学习用 Adam 近似
# torch.optim.Adam(...)  # 二阶动量 v 近似 Hessian 对角
\`\`\`

踩坑：小数据凸问题 L-BFGS 仍有效；深度学习 Hessian-vector product 可用于二阶优化研究但工业少用；K-FAC 等近似二阶方法在部分场景有效。`,
    keyPoints: ["Hessian O(d²)存储 O(d³)求逆不可行", "深度学习用一阶+自适应", "Adam 二阶动量近似 Hessian 对角"],
    followUps: ["L-BFGS 何时有用？", "K-FAC 是什么？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-39",
    nodeId: "ai-optimization",
    question: "梯度裁剪的原理？为什么 RNN/Transformer 训练常需要它？",
    answer: `结论：梯度裁剪限制梯度范数/数值防爆炸。按范数裁剪：若 ||g||>max_norm 则 g=g·max_norm/||g||，保留方向只缩放大小。RNN 时间步连乘易爆炸，Transformer 注意力数值不稳，训练必备。

实际案例：LLaMA/GPT 训练 max_norm=1.0 是标配；RNN 机器翻译训练梯度裁剪防止 loss 突变 NaN。字节训练大模型监控梯度范数超阈值即裁剪。

\`\`\`python
import torch
optimizer.zero_grad()
loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # 范数裁剪
optimizer.step()
# 按值裁剪（改变方向，少用）
for p in model.parameters():
    p.grad.data.clamp_(-5, 5)
\`\`\`

踩坑：梯度爆炸用裁剪，梯度消失用残差/LSTM/门控解决；裁剪阈值过小欠拟合；监控梯度范数判断是否需裁剪。`,
    keyPoints: ["按范数裁剪保留方向缩放大小", "RNN 连乘易梯度爆炸", "Transformer/LLM 训练必备"],
    followUps: ["梯度爆炸和消失哪个易处理？", "范数裁剪和值裁剪区别？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-40",
    nodeId: "ai-optimization",
    question: "大规模分布式训练中优化器有哪些工程挑战？ZeRO 如何节省显存？",
    answer: `结论：大模型训练显存瓶颈在优化器状态（Adam 的 m、v 各占参数量 FP32）和梯度。ZeRO 把优化器状态/梯度/参数分片到多卡，ZeRO-1/2/3 逐步分片，显存从 O(4d) 降到 O(d/N)，支持更大模型。

实际案例：字节 AML、阿里 PAI 训练千亿模型用 DeepSpeed ZeRO-3 + 激活重计算 + 混合精度。ZeRO-3 把参数也分片，前向反向时按需 All-Gather 收集，通信换显存。

\`\`\`python
import deepspeed
model, optimizer, _, _ = deepspeed.initialize(
    model=model, optimizer=optimizer, config={
        "zero_optimization": {"stage": 3, "offload_optimizer": {"device": "cpu"}},
        "fp16": {"enabled": True},
        "train_batch_size": 1024,
    })
# ZeRO-3：参数/梯度/优化器状态全分片
\`\`\`

踩坑：ZeRO-3 通信开销大，小模型不值得；激活重计算省显存增计算，需权衡；CPU offload 慢但省 GPU 显存。`,
    keyPoints: ["Adam 优化器状态占 2 倍参数 FP32", "ZeRO 分片优化器状态/梯度/参数", "通信换显存"],
    followUps: ["ZeRO 三个 stage 区别？", "激活重计算原理？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 7. ai-evaluation =====
  {
    id: "ai-41",
    nodeId: "ai-evaluation",
    question: "精确率、召回率、F1、AUC 的含义？什么场景看重哪个？",
    answer: `结论：Precision=TP/(TP+FP) 预测为正中真为正比例；Recall=TP/(TP+FN) 真实为正中被找出比例；F1 调和平均 P 和 R；AUC 是 ROC 曲线下面积，阈值无关，适合不平衡。

实际案例：医疗诊断/欺诈检测看重 Recall（漏诊代价高）；垃圾邮件/推荐看重 Precision（误判正常代价高）；类别不平衡用 AUC/PR-AUC。

\`\`\`python
from sklearn.metrics import (precision_score, recall_score, f1_score,
                             roc_auc_score, classification_report)
print(classification_report(y_true, y_pred))
print("AUC:", roc_auc_score(y_true, y_prob))
\`\`\`

踩坑：极度不平衡时 AUC 也可能高估，用 PR-AUC；业务阈值需按 PR 曲线选而非默认 0.5；多分类看 Macro-F1。`,
    keyPoints: ["Precision/Recall/F1/AUC", "Recall 重漏诊 Precision 重误报", "不平衡用 AUC/PR-AUC"],
    followUps: ["ROC 和 PR 曲线区别？", "极度不平衡用 AUC 还是 PR-AUC？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-42",
    nodeId: "ai-evaluation",
    question: "ROC 曲线和 PR 曲线的区别？极度不平衡时用哪个？",
    answer: `结论：ROC 横轴 FPR=FP/(FP+TN)，纵轴 TPR(Recall)，含 TN 受不平衡影响小但极度不平衡时虚高乐观；PR 横轴 Precision 纵轴 Recall，不含 TN，极度不平衡时更真实反映正类表现。

实际案例：腾讯反欺诈正样本 0.01%，AUC 0.99 看着很好但实际 Precision 极低（误报多），改用 PR-AUC 才暴露问题。推荐 PR-AUC 评估正类稀疏场景。

\`\`\`python
from sklearn.metrics import roc_curve, precision_recall_curve, auc
fpr, tpr, _ = roc_curve(y, prob); print("ROC-AUC:", auc(fpr, tpr))
prec, rec, _ = precision_recall_curve(y, prob); print("PR-AUC:", auc(rec, prec))
\`\`\`

踩坑：负样本远多于正样本时，FPR 分母大导致 ROC 看起来好；PR-AUC 不稳定需多次采样平均；报告两者更全面。`,
    keyPoints: ["ROC 含 TN 极度不平衡虚高", "PR 不含 TN 更真实", "正类稀疏用 PR-AUC"],
    followUps: ["为什么 AUC 阈值无关？", "PR-AUC 如何稳定计算？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-43",
    nodeId: "ai-evaluation",
    question: "回归指标 MAE、MSE、RMSE、MAPE 的区别与适用？",
    answer: `结论：MAE 平均绝对误差对异常值鲁棒可解释；MSE 平方误差对大误差敏感可导性好；RMSE 量纲与原值一致；MAPE 百分比误差跨量纲比较但 y 接近 0 时不稳定。

实际案例：美团 ETA 预估关注 MAE（分钟级误差可解释）；金融预测关注 RMSE（惩罚大偏差）；多业务线比较用 MAPE。抖音播放量预测用 MAPE 比较不同量级视频。

\`\`\`python
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
mae = mean_absolute_error(y, pred)
rmse = np.sqrt(mean_squared_error(y, pred))
mape = np.mean(np.abs((y - pred) / np.clip(y, 1e-8, None))) * 100
# Huber Loss：MAE+MSE 折中，对异常值鲁棒且可导
from sklearn.metrics import mean_squared_error
def huber(y, p, delta=1.0):
    err = np.abs(y - p)
    return np.where(err < delta, 0.5*err**2, delta*(err - 0.5*delta))
\`\`\`

踩坑：MSE 对异常值敏感需先清洗或用 MAE/Huber；MAPE 在 y≈0 时爆炸；R² 在外样本可能为负，不能只看 R²。`,
    keyPoints: ["MAE 鲁棒可解释", "MSE 对大误差敏感可导", "MAPE 跨量纲但 y≈0 不稳"],
    followUps: ["Huber Loss 为什么折中？", "R² 为何可能为负？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-44",
    nodeId: "ai-evaluation",
    question: "推荐/搜索排序指标 NDCG、MRR、MAP 的含义？",
    answer: `结论：NDCG 衡量排序质量考虑位置折扣和增益，适合多相关度等级；MRR 第一个相关项位置的倒数；MAP 所有相关项位置的平均精度。NDCG 是搜索/推荐最常用。

实际案例：阿里淘宝搜索用 NDCG@10 评估排序质量，位置越靠前权重越高（log2 折扣）；百度搜索用 MRR 评估第一个相关结果。NDCG 对头部位置敏感，符合用户只看前几条的行为。

\`\`\`python
import numpy as np
def dcg(rels):
    return sum(r / np.log2(i + 2) for i, r in enumerate(rels))
def ndcg(rels, k):
    dcg_k = dcg(rels[:k])
    idcg_k = dcg(sorted(rels, reverse=True)[:k])
    return dcg_k / idcg_k if idcg_k > 0 else 0
def mrr(rels_list):
    return np.mean([1/(rels.index(1)+1) if 1 in rels else 0 for rels in rels_list])
\`\`\`

踩坑：NDCG 需归一化（除以 IDCG）；位置折扣函数可选（1/log2 或 1/rank）；离线 NDCG 提升不一定带来线上 CTR 提升，需 A/B 验证。`,
    keyPoints: ["NDCG 位置折扣多相关度", "MRR 第一个相关项倒数", "MAP 相关项平均精度"],
    followUps: ["NDCG 和 MAP 区别？", "离线 NDCG 与线上 CTR 为何不一致？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-45",
    nodeId: "ai-evaluation",
    question: "A/B 测试如何设计？如何判断显著性？",
    answer: `结论：A/B 测试随机分流对照实验，控制组用旧策略实验组用新策略，按业务指标（CTR/收入/留存）比较，用 t 检验/卡方检验判断差异是否显著（p<0.05）且效应量足够。

实际案例：抖音推荐改版先 1% 流量灰度 A/B，观察核心指标（人均播放时长、互动率）7-14 天，显著正向才全量。需注意 SRM（样本比例失衡）和辛普森悖论。

\`\`\`python
from scipy import stats
import numpy as np
# 两组转化率检验
conv_a, n_a = 1200, 50000  # 对照组
conv_b, n_b = 1280, 50000  # 实验组
p_a, p_b = conv_a/n_a, conv_b/n_b
p_pool = (conv_a + conv_b) / (n_a + n_b)
z = (p_b - p_a) / np.sqrt(p_pool*(1-p_pool)*(1/n_a + 1/n_b))
p_value = 2 * (1 - stats.norm.cdf(abs(z)))
print("显著" if p_value < 0.05 else "不显著", "p=", p_value)
\`\`\`

踩坑：样本量不足导致检测不出差异（功效低）；指标窥探（多次看 p 值）增加假阳性；长期效应与短期不同，需观察足够周期。`,
    keyPoints: ["随机分流对照实验", "t 检验/卡方判断显著性", "SRM 和辛普森悖论"],
    followUps: ["样本量如何计算？", "SRM 如何检测？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-46",
    nodeId: "ai-evaluation",
    question: "在线指标和离线指标为何常不一致？如何对齐？",
    answer: `结论：离线指标（AUC/NDCG）在固定数据上算，在线指标（CTR/收入）受用户实时反馈、探索偏差、特征分布变化影响，常不一致。对齐靠：离线用更贴近业务的指标、A/B 验证、监控特征漂移。

实际案例：阿里搜索离线 NDCG 提升 3% 但线上 CTR 无变化，因离线数据是历史日志含位置偏差（靠前的本就被点击多），离线指标乐观。需用反事实评估或位置去偏。腾讯广告离线 AUC 提升但线上收入降，因校准破坏出价。

\`\`\`python
# 位置去偏：逆倾向加权（IPS）
propensity = estimate_position_bias(train_data)  # 每个位置的点击倾向
weighted_loss = (1 / propensity[pos]) * (pred - label) ** 2
# 在线监控特征分布漂移
from scipy.stats import ks_2samp
for col in features:
    stat, p = ks_2samp(offline_dist[col], online_dist[col])
    if p < 0.05: print(f"{col} 漂移!")
\`\`\`

踩坑：离线提升 <0.3% 往往线上无感；位置偏差让离线指标虚高；校准类模型（出价/风控）离线 AUC 提升可能破坏校准。`,
    keyPoints: ["离线固定数据在线实时反馈", "位置偏差致离线乐观", "IPS 去偏+A/B 验证"],
    followUps: ["位置偏差如何去偏？", "校准破坏如何检测？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-47",
    nodeId: "ai-evaluation",
    question: "多分类评估中宏平均（Macro）和微平均（Micro）的区别？",
    answer: `结论：Macro 各类指标算术平均，类等权关注小类；Micro 先汇总所有类 TP/FP/FN 再算，样本等权由大类主导。不平衡关注小类用 Macro，整体表现用 Micro。

实际案例：ImageNet 用 Top-5 准确率；医疗多分类（病种不平衡）看 Macro-F1 防止大类掩盖小类问题。多标签用 Micro/Macro-F1。

\`\`\`python
from sklearn.metrics import classification_report, f1_score
print(classification_report(y_true, y_pred, digits=4))
macro = f1_score(y_true, y_pred, average="macro")  # 类等权
micro = f1_score(y_true, y_pred, average="micro")  # 样本等权
weighted = f1_score(y_true, y_pred, average="weighted")  # 按样本数加权
\`\`\`

踩坑：Macro 被极小类拖低需看小类单独指标；Top-k 准确率适合类别多且近义（ImageNet）；Cohen's Kappa 考虑随机一致性更严谨。`,
    keyPoints: ["Macro 类等权关注小类", "Micro 样本等权大类主导", "多分类看 Macro-F1+混淆矩阵"],
    followUps: ["多标签分类如何评估？", "Top-k 准确率何时用？"],
    favorited: false,
    bigTech: false,
  },

  // ===== 8. ai-feature-eng =====
  {
    id: "ai-48",
    nodeId: "ai-feature-eng",
    question: "数值特征和类别特征分别如何处理？树模型和线性模型处理有何不同？",
    answer: `结论：数值特征做缺失填充、标准化（线性/距离类必需，树模型不需要）、分箱、对数变换；类别特征做 One-Hot（低基数）、Target/Embedding（高基数）。树模型只需排序对单调变换不敏感。

实际案例：阿里淘宝搜索特征工程，数值特征（价格、销量）做分箱+对数；类别特征（类目、品牌）用 Embedding。腾讯广告高基数 ID 用哈希分桶+Embedding。

\`\`\`python
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline, ColumnTransformer
num_pipe = Pipeline([("imp", SimpleImputer(strategy="median")),
                     ("sc", StandardScaler())])
cat_pipe = Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                     ("oh", OneHotEncoder(handle_unknown="ignore"))])
pre = ColumnTransformer([("num", num_pipe, num_cols), ("cat", cat_pipe, cat_cols)])
\`\`\`

踩坑：Target Encoding 必须在交叉验证折内算防泄露；树模型直接吃原始数值，标准化无益；ID 类特征用 Embedding 而非 One-Hot 防维度爆炸。`,
    keyPoints: ["线性/距离类需标准化树模型不需要", "高基数用 Target/Embedding", "Target Encoding 折内算防泄露"],
    followUps: ["特征交叉如何避免组合爆炸？", "Target Encoding 如何防泄露？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-49",
    nodeId: "ai-feature-eng",
    question: "特征选择有哪些方法？过滤法、包裹法、嵌入法区别？",
    answer: `结论：过滤法按统计量（方差/相关系数/卡方）独立于模型快但忽略特征交互；包裹法（RFE 递归消除）用模型性能选，准但慢；嵌入法（L1/树重要性）训练中顺带选，平衡速度与效果。

实际案例：蚂蚁风控上千特征，用 LightGBM 特征重要性初筛+SHAP 精筛，保留几十个强特征上线降低计算成本。L1 逻辑回归做特征筛选可解释强。

\`\`\`python
from sklearn.feature_selection import (SelectKBest, f_classif, RFE,
                                        SelectFromModel)
# 过滤法
sel = SelectKBest(f_classif, k=20).fit(X, y)
# 包裹法
rfe = RFE(LogisticRegression(), n_features_to_select=20).fit(X, y)
# 嵌入法
from sklearn.ensemble import RandomForestClassifier
sel = SelectFromModel(RandomForestClassifier(n_estimators=200),
                      threshold="median").fit(X, y)
X_sel = sel.transform(X)
\`\`\`

踩坑：相关特征会让重要性分散，需配合 SHAP；过滤法忽略交互可能丢重要特征；选特征必须在训练折内做防泄露。`,
    keyPoints: ["过滤法快忽略交互", "包裹法准但慢", "嵌入法平衡+折内做防泄露"],
    followUps: ["RFE 如何工作？", "相关特征重要性为何分散？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-50",
    nodeId: "ai-feature-eng",
    question: "特征交叉如何构造？如何避免组合爆炸？",
    answer: `结论：特征交叉捕捉交互（如"男性×游戏"高转化）。手工交叉依赖先验易遗漏；自动交叉用 FM/DeepFM（隐向量内积）、Cross 层（DCN）、树模型自动学交叉。避免爆炸用 Embedding+内积而非 One-Hot 笛卡尔积。

实际案例：腾讯广告 CTR 用 DeepFM 自动学二阶交叉，避免人工枚举上亿组合。阿里搜索用 GBDT 自动构造交叉特征再喂 LR（GBDT+LR 范式）。

\`\`\`python
# FM 二阶交叉：0.5*((Σvᵢxᵢ)² - Σvᵢ²xᵢ²)
import torch
class FM(torch.nn.Module):
    def __init__(self, n_fields, emb_dim):
        super().__init__()
        self.emb = torch.nn.ModuleList([torch.nn.Embedding(n, emb_dim) for n in n_fields])
    def forward(self, x):
        embs = torch.stack([e(x[:, i]) for i, e in enumerate(self.emb)])  # (F,B,D)
        s = embs.sum(0)
        return 0.5 * (s.pow(2).sum(1) - embs.pow(2).sum(0).sum(1))
# GBDT+LR：树叶子路径作为交叉特征
\`\`\`

踩坑：高基数交叉（城市×类目）用 Embedding 内积而非 One-Hot；DeepFM 端到端学交叉优于手工；交叉特征易过拟合需正则。`,
    keyPoints: ["FM/DeepFM 自动学二阶交叉", "Embedding 内积避免爆炸", "GBDT+LR 树自动交叉"],
    followUps: ["FM 和 DeepFM 关系？", "DCN Cross 层原理？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-51",
    nodeId: "ai-feature-eng",
    question: "自动特征和特征哈希是什么？何时使用？",
    answer: `结论：自动特征指用模型自动学特征交互（DeepFM/AutoInt/神经网络），减少人工；特征哈希把高基数类别哈希到固定维度桶，避免维护大映射表，适合在线学习和大规模稀疏特征。

实际案例：腾讯广告在线学习用特征哈希把亿万级 ID 哈希到 2^24 桶，省去映射表维护且支持新 ID 即时哈希。AutoInt 用多头自注意力学特征交互。

\`\`\`python
import numpy as np
# 特征哈希
def hash_feature(category, n_buckets=2**24):
    return hash(category) % n_buckets
from sklearn.feature_extraction import FeatureHasher
hasher = FeatureHasher(n_features=2**20, input_type="string")
X_hashed = hasher.transform([{"city": "北京", "cat": "手机"}])
# AutoInt 自动特征交互
# 用 MultiHeadAttention 学习特征间关系
\`\`\`

踩坑：哈希冲突（不同类别同桶）引入噪声，桶数需足够大；在线学习新特征哈希即时生效；哈希后不可逆无法解释。`,
    keyPoints: ["特征哈希避免大映射表", "在线学习即时哈希新 ID", "哈希冲突需桶数足够"],
    followUps: ["哈希冲突如何影响模型？", "AutoInt 如何学交互？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-52",
    nodeId: "ai-feature-eng",
    question: "时间序列特征如何构造？滞后、滚动、周期特征？",
    answer: `结论：时间序列特征包括滞后特征（过去 N 步值）、滚动统计（均值/方差/最值）、周期特征（星期/月/节假日）、差分特征（消除趋势）、窗口占比（当天/窗口总和）。

实际案例：美团外卖单量预测用过去 7 天同时段单量、滑动均值、星期/节假日 one-hot、天气特征。阿里销量预测用 7/14/28 天滚动均值和同比环比。

\`\`\`python
import pandas as pd
df["lag_1"] = df["sales"].shift(1)
df["lag_7"] = df["sales"].shift(7)
df["roll_mean_7"] = df["sales"].rolling(7).mean()
df["roll_std_7"] = df["sales"].rolling(7).std()
df["dayofweek"] = pd.to_datetime(df["date"]).dt.dayofweek
df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)
df["diff_1"] = df["sales"].diff(1)
\`\`\`

踩坑：滞后特征在预测时需确保特征可得（不能含未来）；滚动窗口起始有 NaN 需填充；周期特征对业务周期敏感需领域知识。`,
    keyPoints: ["滞后/滚动/周期/差分特征", "预测时特征必须可得", "业务周期需领域知识"],
    followUps: ["如何处理时间序列缺失？", "周期特征如何编码？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-53",
    nodeId: "ai-feature-eng",
    question: "推荐系统特征工程实战：用户/物品/上下文特征如何构造？",
    answer: `结论：用户特征（画像+行为序列+统计）、物品特征（属性+统计+内容 embedding）、上下文特征（时间场景）、交叉特征（用户×类目偏好）。行为序列特征是抖音推荐核心。

实际案例：抖音推荐特征工程，用户侧有长期兴趣画像+最近 N 次播放/点赞序列（Transformer 建模）；物品侧有视频 embedding+完播率+点赞率统计；上下文有时段/网络/场景；交叉有"用户对该类目历史完播率"。实时特征平台支撑毫秒级取特征。

\`\`\`python
features = {
    "user": {"age": 25, "city": "北京", "click_7d": 320,
             "recent_items": [101, 205, 88, 1024],  # 序列特征
             "pref_cat": {"数码": 0.8, "美食": 0.5}},
    "item": {"cat": "数码", "price": 4999, "ctr_7d": 0.12,
             "video_emb": [0.1]*128},
    "context": {"hour": 21, "is_weekend": False, "scene": "feed"},
}
# 序列特征用 Transformer 聚合
class SeqEncoder(torch.nn.Module):
    def forward(self, item_seq, candidate):
        h = self.transformer(item_seq)
        attn = (h @ candidate.unsqueeze(-1)).softmax(1)  # DIN 注意力
        return (attn * h).sum(1)
\`\`\`

踩坑：实时特征延迟需监控（特征过期）；序列特征长度不一需 padding/mask；线上线下特征一致性用特征日志对齐。`,
    keyPoints: ["用户画像+行为序列", "物品属性+统计+内容 embedding", "上下文+交叉+实时特征平台"],
    followUps: ["实时特征如何工程实现？", "行为序列如何建模？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-54",
    nodeId: "ai-feature-eng",
    question: "特征分箱（离散化）何时有用？等频/等宽/卡方如何选？",
    answer: `结论：分箱把连续值离散化，引入非线性、对异常值鲁棒、提升可解释性，适合 LR/评分卡。等频（每箱样本数相等）抗偏态；等宽简单但受异常值影响；卡方分箱按标签合并相似箱保单调性。

实际案例：蚂蚁信用评分卡用卡方分箱把连续特征（收入、负债比）分箱+WOE 编码，保单调性且可解释。LR 用分箱后特征能学到非线性。

\`\`\`python
import pandas as pd
# 等频分箱
df["age_bin"] = pd.qcut(df["age"], q=5, labels=False)
# 等宽分箱
df["inc_bin"] = pd.cut(df["income"], bins=5, labels=False)
# WOE 编码
def woe(df, feat, label):
    g = df.groupby(feat)[label].agg(["sum", "count"])
    woe = np.log((g["sum"] + 0.5) / (g["count"] - g["sum"] + 0.5))
    return df[feat].map(woe)
\`\`\`

踩坑：树模型不需分箱（自身找切分点）；分箱过多过拟合过少欠拟合；WOE 编码需在训练集算防泄露；分箱后需保单调性符合业务。`,
    keyPoints: ["分箱引入非线性+鲁棒+可解释", "等频抗偏态/卡方保单调", "评分卡用 WOE 编码"],
    followUps: ["WOE 编码原理？", "分箱数如何确定？"],
    favorited: false,
    bigTech: false,
  },

  // ===== 9. ai-nn-fundamentals =====
  {
    id: "ai-55",
    nodeId: "ai-nn-fundamentals",
    question: "反向传播算法的原理？链式法则如何应用？",
    answer: `结论：反向传播用链式法则从输出层向输入层逐层算损失对各参数梯度。前向记录中间值，反向 ∂L/∂z=∂L/∂a⊙σ'(z)，∂L/∂W=(∂L/∂z)·xᵀ，向上一层传 ∂L/∂x=Wᵀ·∂L/∂z。

实际案例：PyTorch autograd 自动构建计算图反向求导，开发者只写前向。理解反向传播有助调试梯度消失、设计自定义层。

\`\`\`python
import torch
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x
y.backward()
print(x.grad)  # dy/dx = 2x+3 = 7.0
# 简化反向传播
dA = -(Y / A - (1 - Y) / (1 - A))  # 损失对输出导数
dZ = dA * sigmoid_derivative(Z)    # 激活导数逐元素
dW = dZ @ X.T / m
dA_prev = W.T @ dZ                 # 传给上一层
\`\`\`

踩坑：梯度需累加而非覆盖（mini-batch）；autograd 默认累加梯度需 zero_grad；detach() 截断梯度用于冻结。`,
    keyPoints: ["链式法则逐层求梯度", "∂L/∂z=∂L/∂a⊙σ'(z)", "梯度向前层传 ∂L/∂x=Wᵀ·∂L/∂z"],
    followUps: ["梯度消失原因和解决？", "自动微分和数值微分区别？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-56",
    nodeId: "ai-nn-fundamentals",
    question: "为什么 ReLU 比 Sigmoid 常用？ReLU 的缺点及改进？",
    answer: `结论：ReLU 正区间梯度恒 1 缓解梯度消失、计算简单、稀疏激活。缺点是神经元死亡（负输入梯度 0 永不更新）。改进 Leaky ReLU/GELU/Swish。

实际案例：CNN 隐藏层默认 ReLU；Transformer/BERT 用 GELU 平滑且性能好；Leaky ReLU 防死亡。Sigmoid 仅用于二分类输出或门控。

\`\`\`python
import torch.nn as nn
import torch.nn.functional as F
# ReLU
relu = nn.ReLU()
# Leaky ReLU
leaky = nn.LeakyReLU(0.01)
# GELU（Transformer 常用）
gelu = nn.GELU()
# Swish
def swish(x, beta=1.0): return x * torch.sigmoid(beta * x)
\`\`\`

踩坑：ReLU 死亡可降低学习率或用 Leaky/GELU；Sigmoid 梯度消失深网络禁用；ELU 负区间平滑零均值但计算贵。`,
    keyPoints: ["ReLU 正区间梯度恒 1 防消失", "ReLU 有神经元死亡问题", "Leaky/GELU 改进"],
    followUps: ["为什么 Sigmoid 梯度消失？", "GELU 为什么 Transformer 常用？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-57",
    nodeId: "ai-nn-fundamentals",
    question: "权重初始化为什么重要？Xavier 和 He 初始化的区别？",
    answer: `结论：全零初始化致同层神经元对称无法学习。好的初始化让前向各层激活方差稳定、反向各层梯度方差稳定。Xavier（Var=1/n_in）适合 tanh/sigmoid；He（Var=2/n_in）适合 ReLU（负值归零方差减半需补偿）。

实际案例：CNN 用 He 初始化，Transformer 也用 He 或截断正态。BN 能放宽对初始化的依赖但仍需合理初始化。

\`\`\`python
import torch.nn as nn
layer = nn.Linear(256, 128)
nn.init.kaiming_normal_(layer.weight, mode="fan_in", nonlinearity="relu")  # He
nn.init.zeros_(layer.bias)
nn.init.xavier_uniform_(layer.weight)  # Xavier（tanh）
\`\`\`

踩坑：初始化过大梯度爆炸过小消失；bias 通常初始化 0；Embedding 用正态小值初始化；残差分支初始化要保证初始接近恒等。`,
    keyPoints: ["全零初始化致对称无法学习", "He 适合 ReLU", "Xavier 适合 tanh/sigmoid"],
    followUps: ["为什么 ReLU 需更大初始化方差？", "BN 如何放宽初始化要求？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-58",
    nodeId: "ai-nn-fundamentals",
    question: "BatchNorm 的原理？训练和推理有何不同？",
    answer: `结论：BN 在 mini-batch 内对每层激活归一化（减均值除标准差）再用可学习 γ、β 仿射，稳定训练加速收敛。训练用 batch 统计，推理用累积 running 统计，需 model.eval() 切换。

实际案例：CNN 用 BN 加速训练放宽初始化；batch 太小 BN 统计不准用 GroupNorm 替代。训练/推理模式不切换是常见 bug。

\`\`\`python
import torch.nn as nn
model = nn.Sequential(
    nn.Linear(784, 256), nn.BatchNorm1d(256), nn.ReLU(),
    nn.Linear(256, 10))
model.train()  # 训练用 batch 统计
model.eval()   # 推理用 running 统计
\`\`\`

踩坑：BN 依赖 batch，batch=1 推理时必须用 eval 模式；分布式训练用 SyncBN 同步统计；序列模型/小 batch 用 LayerNorm/GroupNorm。`,
    keyPoints: ["batch 内归一化+γ/β 仿射", "训练用 batch 推理用 running", "放宽初始化加速收敛"],
    followUps: ["BN 和 LayerNorm 区别？", "为什么 batch 小 BN 效果差？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-59",
    nodeId: "ai-nn-fundamentals",
    question: "Dropout 的原理？训练和推理有何不同？为什么能防过拟合？",
    answer: `结论：Dropout 训练时按概率 p 随机置零神经元（存活乘 1/(1-p) 缩放），推理不 drop。防过拟合靠子网络集成和去神经元共适应。

实际案例：全连接层 p=0.5 经典；卷积层 p=0.1-0.3 或用 Spatial Dropout 整通道 drop。BERT 微调常用 0.1。MC Dropout 多次推理取均值估计不确定性。

\`\`\`python
import torch.nn as nn
net = nn.Sequential(
    nn.Linear(784, 512), nn.ReLU(), nn.Dropout(0.5),
    nn.Linear(512, 256), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(256, 10))
net.train()  # 启用 dropout
net.eval()   # 关闭 dropout
\`\`\`

踩坑：BN+Dropout 顺序和位置影响效果；Dropout 过大欠拟合；推理务必 eval 模式否则结果随机。`,
    keyPoints: ["训练随机 drop+缩放（inverted dropout）", "推理不 drop", "子网络集成+去共适应"],
    followUps: ["Dropout 和 BN 一起用注意什么？", "Spatial Dropout 区别？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-60",
    nodeId: "ai-nn-fundamentals",
    question: "梯度消失和梯度爆炸的原因和解决方法？",
    answer: `结论：梯度消失因反向连乘雅可比谱半径<1（Sigmoid 饱和、深网络）使浅层梯度趋零；梯度爆炸谱半径>1 使梯度指数增长。解决：消失用 ReLU/残差/LSTM/门控/合理初始化；爆炸用梯度裁剪。

实际案例：ResNet 残差连接让深网络可训（梯度直连）；RNN 用 LSTM 门控缓解消失+梯度裁剪防爆炸；Transformer 用残差+LayerNorm+warmup 稳定训练。

\`\`\`python
import torch
# 梯度裁剪防爆炸
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
# 残差连接缓解消失
class ResBlock(torch.nn.Module):
    def forward(self, x):
        return x + self.fn(x)  # 梯度直连通路
# 合理初始化
nn.init.kaiming_normal_(layer.weight, nonlinearity="relu")
\`\`\`

踩坑：检测梯度可打印各层梯度范数；激活输出全 0 可能是 ReLU 死亡或学习率过大；BN/残差是稳定深网络基石。`,
    keyPoints: ["消失：连乘谱半径<1 爆炸：>1", "消失用 ReLU/残差/门控", "爆炸用梯度裁剪"],
    followUps: ["为什么残差连接缓解消失？", "如何检测梯度异常？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-61",
    nodeId: "ai-nn-fundamentals",
    question: "LayerNorm 和 BatchNorm 的区别？Transformer 为什么用 LayerNorm？",
    answer: `结论：BN 在 batch 维归一化（依赖 batch 统计），LN 在特征维归一化（每样本独立）。Transformer 用 LN 因序列长度可变、batch 小、训练推理一致。

实际案例：BERT/GPT/LLaMA 用 LN；Pre-Norm（残差直连）比 Post-Norm 深训稳定，现代 LLM 主流。RMSNorm 是 LN 简化版（去均值只缩放）省算力，LLaMA 用。

\`\`\`python
import torch.nn as nn
class PreNormBlock(nn.Module):
    def __init__(self, d, fn):
        super().__init__()
        self.norm = nn.LayerNorm(d); self.fn = fn
    def forward(self, x):
        return x + self.fn(self.norm(x))  # Pre-Norm 残差直连
# RMSNorm
import torch
class RMSNorm(nn.Module):
    def __init__(self, d, eps=1e-6):
        super().__init__(); self.eps = eps; self.w = nn.Parameter(torch.ones(d))
    def forward(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.w
\`\`\`

踩坑：BN batch 小统计不准；LN 适合序列/小 batch；Pre-Norm 深训稳但上限略低于 Post-Norm。`,
    keyPoints: ["LN 特征维归一化与 batch 无关", "BN batch 小/序列变长不稳", "Pre-Norm 残差直连深训稳主流"],
    followUps: ["RMSNorm 和 LN 区别？", "为什么 Pre-Norm 更稳定？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 10. ai-cnn =====
  {
    id: "ai-62",
    nodeId: "ai-cnn",
    question: "卷积层中感受野的概念？如何计算？",
    answer: `结论：感受野是特征图某点对应输入图像的区域大小。递推 RFₖ=RFₖ₋₁+(k-1)·∏strideᵢ（累乘之前所有 stride）。两个 3×3 卷积堆叠（RF=5）等效一个 5×5 但参数少（18 vs 25）且非线性多。

实际案例：VGG 用小卷积堆叠扩大感受野；DeepLab 用空洞卷积不增参数扩大感受野做分割。检测网络需大感受野看全局。

\`\`\`python
def receptive_rf(layers):
    rf, jump = 1, 1
    for k, s in layers:
        rf = rf + (k - 1) * jump
        jump *= s
    return rf
print(receptive_rf([(3,1),(3,1),(3,2),(3,1)]))  # 11
\`\`\`

踩坑：感受野大不代表有效感受野大（中心贡献大）；下采样过多损失细节影响分割；空洞卷积过大有网格效应。`,
    keyPoints: ["感受野=特征点对应原图区域", "RFₖ=RFₖ₋₁+(k-1)·∏stride", "小卷积堆叠等效大卷积省参数"],
    followUps: ["空洞卷积如何扩大感受野？", "有效感受野和理论感受野区别？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-63",
    nodeId: "ai-cnn",
    question: "ResNet 残差连接解决了什么问题？为什么有效？",
    answer: `结论：解决深网络退化问题（加深训练误差反升，非过拟合是优化难）。H(x)=F(x)+x 学残差，恒等支路让梯度直连缓解消失，恒等映射易学（F=0 即可），残差小更易优化。

实际案例：ResNet 可训 152 层，是现代 backbone 基础。商汤、旷视人脸识别用 ResNet 系列作特征提取器。ViT 也用残差连接。

\`\`\`python
import torch.nn as nn
class ResBlock(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.conv1 = nn.Conv2d(c, c, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(c); self.act = nn.ReLU()
        self.conv2 = nn.Conv2d(c, c, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(c)
    def forward(self, x):
        return self.act(x + self.bn2(self.conv2(self.act(self.bn1(self.conv1(x))))))
\`\`\`

踩坑：残差维度不匹配需用 1×1 卷积投影对齐；残差连接让深网络可训但不代表越深越好（计算成本）；BN 位置影响效果。`,
    keyPoints: ["H(x)=F(x)+x 学残差", "恒等支路缓解梯度消失", "退化问题非过拟合是优化难"],
    followUps: ["为什么残差连接缓解消失？", "1×1 卷积在残差中作用？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-64",
    nodeId: "ai-cnn",
    question: "1×1 卷积的作用？为什么在 Inception/ResNet 中广泛使用？",
    answer: `结论：1×1 卷积做通道升降维、跨通道信息融合、增加非线性（接激活等效像素 MLP）、替代全连接减参数。瓶颈结构（1×1 降维→3×3→1×1 升维）大幅省 FLOPs。

实际案例：Inception 用 1×1 先降维再做 3×3/5×5；ResNet 瓶颈块用 1×1 降维省计算；MobileNet 用 1×1 实现逐点卷积。

\`\`\`python
import torch.nn as nn
bottleneck = nn.Sequential(
    nn.Conv2d(256, 64, 1, bias=False), nn.BatchNorm2d(64), nn.ReLU(),  # 降维
    nn.Conv2d(64, 64, 3, padding=1, bias=False), nn.BatchNorm2d(64), nn.ReLU(),
    nn.Conv2d(64, 256, 1, bias=False), nn.BatchNorm2d(256))  # 升维
\`\`\`

踩坑：1×1 卷积不改变空间尺寸只调通道；瓶颈结构降维过多损失信息；深度可分离卷积=深度卷积+1×1 逐点卷积。`,
    keyPoints: ["1×1 通道升降维", "跨通道融合+增加非线性", "瓶颈结构降维省计算"],
    followUps: ["深度可分离卷积如何用 1×1？", "1×1 和全连接等价关系？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-65",
    nodeId: "ai-cnn",
    question: "经典 CNN 架构如何演进？LeNet/AlexNet/VGG/ResNet/EfficientNet/ViT 贡献？",
    answer: `结论：LeNet 卷积可行→AlexNet ReLU+GPU+Dropout 引爆→VGG 小卷积堆叠→Inception 多尺度→ResNet 残差可训深→MobileNet 轻量化→EfficientNet 复合缩放→ViT 用 Transformer 替代卷积。

实际案例：阿里商品识别用 EfficientNet 平衡精度速度；商汤人脸用 ResNet 系列；大规模数据 ViT 超越 CNN。选型看数据量、算力、部署平台。

\`\`\`python
import torchvision.models as M
resnet = M.resnet50(weights=M.ResNet50_Weights.DEFAULT)
eff = M.efficientnet_b0(weights=M.EfficientNet_B0_Weights.DEFAULT)
mobile = M.mobilenet_v3_small(weights=M.MobileNet_V3_Small_Weights.DEFAULT)
\`\`\`

踩坑：移动端用 MobileNet/EfficientNet-Lite；大规模数据 ViT 优势明显但小数据 CNN 更稳；预训练权重迁移通常优于从头训。`,
    keyPoints: ["VGG 小卷积堆叠", "ResNet 残差可训深", "EfficientNet 复合缩放 ViT 替代卷积"],
    followUps: ["1×1 卷积作用？", "深度可分离卷积为何省计算？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-66",
    nodeId: "ai-cnn",
    question: "深度可分离卷积为什么省计算？MobileNet 如何轻量化？",
    answer: `结论：标准卷积计算量 O(C_in·C_out·k²·H·W)；深度可分离=深度卷积（每通道独立 O(C_in·k²·HW)）+逐点 1×1（O(C_in·C_out·HW)），计算量降约 1/C_out+1/k²。MobileNet 用此实现移动端高效。

实际案例：MobileNetV3 用深度可分离+SE 注意力+h-swish，在手机端实时分类检测。腾讯优图人脸解锁用 MobileNet 部署端侧。

\`\`\`python
import torch.nn as nn
class DepthwiseSeparable(nn.Module):
    def __init__(self, c_in, c_out, stride=1):
        super().__init__()
        self.depthwise = nn.Conv2d(c_in, c_in, 3, stride, 1, groups=c_in, bias=False)
        self.pointwise = nn.Conv2d(c_in, c_out, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(c_in); self.bn2 = nn.BatchNorm2d(c_out)
    def forward(self, x):
        return self.bn2(self.pointwise(self.bn1(self.depthwise(x))))
\`\`\`

踩坑：深度可分离省计算但访存效率低（算子碎），GPU 上未必加速明显；通道数需为 groups 整数倍；MobileNet 精度略低于 ResNet。`,
    keyPoints: ["深度卷积+1×1 逐点", "计算量降约 1/C_out+1/k²", "MobileNet 移动端高效"],
    followUps: ["ShuffleNet 通道 shuffle 作用？", "深度可分离在 GPU 为何未必加速？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-67",
    nodeId: "ai-cnn",
    question: "什么是迁移学习？如何微调预训练模型？",
    answer: `结论：迁移学习把源任务知识迁移到目标任务。微调流程：选预训练模型→换分类头→冻结主干（小数据）或全量微调（大数据，主干小学习率新层大）→数据增强+较小学习率。

实际案例：阿里商品识别用 ImageNet 预训练 ResNet 微调，小数据冻结主干只训分类头；大数据全量微调学习率主干 1e-4 新层 1e-3。

\`\`\`python
import torchvision.models as M
import torch.nn as nn
model = M.resnet50(weights=M.ResNet50_Weights.DEFAULT)
for p in model.parameters(): p.requires_grad = False  # 冻结
model.fc = nn.Linear(model.fc.in_features, num_classes)  # 换头
opt = torch.optim.Adam([{"params": model.fc.parameters(), "lr": 1e-3}])
# 大数据全量微调
for p in model.parameters(): p.requires_grad = True
opt = torch.optim.Adam([{"params": model.layer4.parameters(), "lr": 1e-4},
                        {"params": model.fc.parameters(), "lr": 1e-3}])
\`\`\`

踩坑：小数据全量微调易破坏预训练特征；微调学习率比从头训小 10×；逐层解冻渐进式更稳。`,
    keyPoints: ["预训练+换分类头", "冻结(小数据)/全量(大数据)", "微调学习率要小"],
    followUps: ["如何避免微调遗忘预训练知识？", "CLIP 零样本迁移？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-68",
    nodeId: "ai-cnn",
    question: "CNN backbone 如何选型？工业落地考虑哪些因素？",
    answer: `结论：选型看精度、速度、显存、部署平台。云端大算力用 ResNet/EfficientNet/ViT 追精度；移动端用 MobileNet/ShuffleNet 轻量化；实时检测用 YOLO backbone。还需考虑预训练权重可用性和生态。

实际案例：阿里商品识别云端用 EfficientNet-B4 平衡精度速度；美团无人配送边缘端用 MobileNetV3；商汤人脸用 ResNet100+ArcFace。选型先跑 baseline 再按瓶颈优化。

\`\`\`python
import torchvision.models as M
# 云端精度优先
model = M.efficientnet_b4(weights=M.EfficientNet_B4_Weights.DEFAULT)
# 移动端速度优先
model = M.mobilenet_v3_small(weights=M.MobileNet_V3_Small_Weights.DEFAULT)
# 评估 FLOPs 和参数量
from torchinfo import summary
summary(model, input_size=(1, 3, 224, 224))
\`\`\`

踩坑：FLOPs 低不代表实际推理快（访存瓶颈）；端侧需量化/剪枝进一步压缩；预训练权重迁移能省大量训练成本。`,
    keyPoints: ["精度/速度/显存/部署平台权衡", "云端 ViT/EfficientNet 移动端 MobileNet", "FLOPs 低未必推理快"],
    followUps: ["如何测量实际推理延迟？", "模型压缩方法有哪些？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 11. ai-rnn =====
  {
    id: "ai-69",
    nodeId: "ai-rnn",
    question: "RNN 为什么会有梯度消失？",
    answer: `结论：RNN 反向传播沿时间步连乘雅可比矩阵，谱半径<1 梯度指数衰减（消失），>1 指数增长（爆炸）。Sigmoid/tanh 饱和区导数小加剧消失。

实际案例：长文本依赖建模 RNN 学不到远距离关系，LSTM/GRU 用门控+加法细胞状态缓解。现代任务多用 Transformer 自注意力直接全局交互。

\`\`\`python
# RNN 梯度连乘示意
import torch
h = torch.ones(100, requires_grad=True)
for t in range(50):
    h = torch.tanh(W @ h)  # 每步雅可比连乘
loss = h.sum(); loss.backward()
print(h.grad.abs().mean())  # 梯度随时间衰减
\`\`\`

踩坑：梯度消失用 LSTM/GRU/残差/门控解决，梯度爆炸用裁剪解决；序列越长 RNN 越难；Transformer 缓解长程依赖但 O(n²) 复杂度。`,
    keyPoints: ["时间步连乘雅可比", "谱半径<1 消失 >1 爆炸", "Sigmoid 饱和加剧消失"],
    followUps: ["LSTM 如何解决？", "梯度爆炸如何处理？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-70",
    nodeId: "ai-rnn",
    question: "LSTM 的门控机制？如何缓解梯度消失？",
    answer: `结论：LSTM 三门一状态：遗忘门 f、输入门 i、输出门 o、细胞状态 Cₜ=f⊙Cₜ₋₁+i⊙Ĉ。缓解消失因细胞状态加法更新，梯度 ∂Cₜ/∂Cₜ₋₁=f 接近 1 时梯度直传形成"高速公路"。

实际案例：机器翻译早期用 LSTM Seq2Seq+Attention；科大讯飞语音识别用 LSTM 声学模型。GRU 简化版参数少。

\`\`\`python
import torch.nn as nn
lstm = nn.LSTM(input_size=128, hidden_size=256, num_layers=2,
               batch_first=True, dropout=0.3)
out, (h, c) = lstm(x)  # out: (batch, seq, 256*2 双向)
\`\`\`

踩坑：LSTM 参数多训练慢；序列长仍受限（不如 Transformer）；门控需配合梯度裁剪防爆炸；双向 LSTM 不能用于自回归生成。`,
    keyPoints: ["三门一细胞状态", "加法更新梯度直传", "遗忘门接近 1 长程保留"],
    followUps: ["GRU 和 LSTM 区别？", "LSTM 参数量如何算？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-71",
    nodeId: "ai-rnn",
    question: "GRU 相比 LSTM 简化了什么？如何选择？",
    answer: `结论：GRU 合并遗忘门+输入门为更新门 z，去独立细胞状态，2 门 vs LSTM 3 门，参数少约 1/3，保留加法梯度通路效果接近。小数据/求速度用 GRU，大数据/长序列用 LSTM。

实际案例：移动端语音助手用 GRU 省参数；翻译编码器大数据用 LSTM 表达力略强。现代多用 Transformer，RNN 在流式/资源受限场景仍用。

\`\`\`python
import torch.nn as nn
gru = nn.GRU(input_size=128, hidden_size=256, num_layers=2,
             batch_first=True, bidirectional=True, dropout=0.3)
out, h = gru(x)
\`\`\`

踩坑：GRU 更新门耦合遗忘输入，表达力略弱；RNN 在流式实时场景（语音流）仍优于 Transformer（需完整序列）；现代 LLM 已不用 RNN。`,
    keyPoints: ["GRU 2 门合并 LSTM 遗忘+输入", "无独立细胞状态参数少 1/3", "保留加法梯度通路"],
    followUps: ["GRU 更新门为何能合并？", "什么场景 LSTM 优于 GRU？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-72",
    nodeId: "ai-rnn",
    question: "双向 RNN 原理？为什么不能用于语言模型？",
    answer: `结论：BiRNN 同时前向+后向 RNN，输出拼接含双向上下文。语言模型自回归预测下一词只有上文（未来未知），BiRNN 用了未来信息破坏因果性，无法在线生成。

实际案例：NER/POS/分词用 BiLSTM（每个位置看全句判标签）；翻译编码器可双向，解码器必须单向；BERT 是双向但用 MLM 非自回归。

\`\`\`python
import torch.nn as nn
bilstm = nn.LSTM(input_size=128, hidden_size=256, bidirectional=True, batch_first=True)
out, _ = bilstm(x)  # (batch, seq, 512) 前256+后256 拼接
\`\`\`

踩坑：BiRNN 训练需完整序列，流式推理不可用；双向输出维度翻倍；ELMo 用 BiLSTM 但生成任务仍受限。`,
    keyPoints: ["前向+后向输出拼接", "用了未来信息破坏因果性", "适合标注/分类/编码器"],
    followUps: ["ELMo 为什么能用 BiLSTM？", "解码器为何必须单向？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-73",
    nodeId: "ai-rnn",
    question: "Seq2Seq 编码器-解码器结构？为什么需要注意力？",
    answer: `结论：Encoder 把输入压成定长上下文 c，Decoder 从 c 生成输出。定长 c 是长序列瓶颈，Attention 让解码每步动态对编码器隐藏状态加权求和聚焦相关部分。

实际案例：Google 早期神经机器翻译用 Seq2Seq+Attention，Attention 缓解长句翻译退化并可视化对齐。Attention 是 Transformer 基础。

\`\`\`python
import torch
class Decoder(torch.nn.Module):
    def forward(self, y_prev, h, enc_outs):
        scores = torch.matmul(h, enc_outs.transpose(-2, -1))  # 对齐分数
        attn = scores.softmax(dim=-1)
        ctx = torch.matmul(attn, enc_outs)  # 动态上下文
        return self.rnn(y_prev, ctx, h)
\`\`\`

踩坑：teacher forcing 训练快但暴露偏差（推理用自己预测易累积误差）；定长 c 长序列信息丢失；Attention 解决瓶颈且可解释。`,
    keyPoints: ["Encoder 压缩成定长上下文", "定长向量是长序列瓶颈", "Attention 动态加权缓解瓶颈"],
    followUps: ["teacher forcing 缺点？", "Attention 如何解决长句翻译？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-74",
    nodeId: "ai-rnn",
    question: "RNN 在语音识别/OCR 中如何应用？",
    answer: `结论：语音识别声学模型用 LSTM/GRU 建模音频帧序列，CTC 对齐变长输出；OCR 用 CRNN（CNN 提特征+BiLSTM 序列建模+CTC）。RNN 适合流式和变长序列。

实际案例：科大讯飞语音识别早期用 LSTM-CTF 声学模型；CRNN+CTC 是 OCR 经典方案，端到端无需字符级标注。

\`\`\`python
import torch.nn as nn
class CRNN(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.cnn = nn.Sequential(nn.Conv2d(1,64,3,1,1), nn.ReLU(), nn.MaxPool2d(2),
                                 nn.Conv2d(64,128,3,1,1), nn.ReLU(), nn.MaxPool2d(2))
        self.rnn = nn.LSTM(128*8, 256, bidirectional=True, batch_first=True)
        self.fc = nn.Linear(256*2, n_classes)
    def forward(self, x):
        f = self.cnn(x)
        b,c,h,w = f.shape
        f = f.permute(0,3,1,2).reshape(b, w, c*h)  # 按宽度序列化
        f,_ = self.rnn(f)
        return self.fc(f)
loss = nn.CTCLoss(blank=n_classes-1, zero_infinity=True)
\`\`\`

踩坑：CTC blank 对齐变长序列无需逐字符标注；流式语音需单向 RNN+在线 CTC；现代语音/OCR 也转向 Transformer/Conformer。`,
    keyPoints: ["RNN 建模变长序列+CTC 对齐", "CRNN=CNN+BiLSTM+CTC", "流式场景单向 RNN"],
    followUps: ["CTC 解码方式？", "Conformer 相比 RNN 优势？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 12. ai-transformer =====
  {
    id: "ai-75",
    nodeId: "ai-transformer",
    question: "Self-Attention 的计算过程？为什么除以 √dₖ？",
    answer: `结论：Self-Attention 中 Q=K=V 来自同一输入，输出=softmax(QKᵀ/√dₖ)·V。除以 √dₖ 因点积方差随 dₖ 增大，softmax 进入饱和区梯度小，缩放稳定梯度。

实际案例：BERT/GPT/LLaMA 核心。字节豆包、通义千问均基于 Self-Attention。多头注意力让不同头关注不同子空间。

\`\`\`python
import torch
def attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / d_k ** 0.5
    if mask is not None:
        scores = scores.masked_fill(mask, float("-inf"))
    attn = scores.softmax(dim=-1)
    return attn @ V
\`\`\`

踩坑：Self-Attention O(n²) 复杂度，长序列显存爆炸需稀疏/线性注意力；mask 处理（因果 mask 上三角、padding mask）易出错。`,
    keyPoints: ["softmax(QKᵀ/√dₖ)V", "除 √dₖ 稳定梯度", "多头关注不同子空间"],
    followUps: ["Self-Attention 复杂度？如何优化长序列？", "为什么除以 √dₖ？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-76",
    nodeId: "ai-transformer",
    question: "多头注意力（Multi-Head Attention）的原理？为什么用多头？",
    answer: `结论：多头注意力把 Q/K/V 分成 h 组各自做 attention 后拼接，不同头关注不同子空间（语法/语义/位置），表达力更强，总计算量与单头相近。

实际案例：BERT-base 12 头，GPT/LLaMA 32 头。多头让模型同时关注多种关系，如翻译中一个头学主谓一致、一个头学指代消解。

\`\`\`python
import torch.nn as nn
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.h, self.d = n_heads, d_model // n_heads
        self.qkv = nn.Linear(d_model, d_model * 3)
        self.out = nn.Linear(d_model, d_model)
    def forward(self, x, mask=None):
        B, N, D = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.h, self.d).permute(2,0,3,1,4)
        q, k, v = qkv[0], qkv[1], qkv[2]  # (B,h,N,d)
        attn = (q @ k.transpose(-2,-1) / self.d**0.5).softmax(-1)
        out = (attn @ v).transpose(1,2).reshape(B, N, D)
        return self.out(out)
\`\`\`

踩坑：d_model 必须能被 n_heads 整除；头数过多每头维度过小表达力下降；GQA/MQA 减 KV 头省 KV Cache 显存。`,
    keyPoints: ["Q/K/V 分 h 组各自 attention 拼接", "不同头关注不同子空间", "GQA/MQA 减 KV Cache"],
    followUps: ["GQA 如何省显存？", "头数如何选？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-77",
    nodeId: "ai-transformer",
    question: "Transformer 为什么需要位置编码？RoPE 为什么成为 LLM 主流？",
    answer: `结论：Self-Attention 排列不变（对顺序无感知），需注入位置信息。正余弦可外推、可学习简单不可外推、RoPE 用旋转矩阵在 Q/K 编码相对位置兼顾外推和效率，是 LLaMA/Qwen 等主流。

实际案例：LLaMA/Qwen/DeepSeek 均用 RoPE，支持长度外推（训练 2k 推理 32k）。ALiBi 用线性偏置外推。BERT 用可学习位置编码但限长。

\`\`\`python
import torch
def rope(x, base=10000.0):
    B, N, H, D = x.shape
    theta = 1.0 / (base ** (torch.arange(0, D, 2).float() / D))
    pos = torch.arange(N).float()
    freqs = torch.outer(pos, theta)  # (N, D/2)
    cos, sin = freqs.cos(), freqs.sin()
    x1, x2 = x[..., 0::2], x[..., 1::2]
    x_rot = torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1)
    return x_rot.flatten(-2)
\`\`\`

踩坑：可学习位置编码超长失效；RoPE 外推需配合 NTK-aware/位置插值；长上下文外推是 LLM 热点。`,
    keyPoints: ["Attention 排列不变需位置信息", "RoPE 编码相对位置外推好", "可学习位置编码不可外推"],
    followUps: ["RoPE 为什么支持外推？", "ALiBi 如何外推？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-78",
    nodeId: "ai-transformer",
    question: "Pre-Norm 和 Post-Norm 区别？为什么现代 LLM 用 Pre-Norm？",
    answer: `结论：Post-Norm（原始 Transformer）残差后再 LN：x'=LN(x+Sublayer(x))，深训难需 warmup 但上限略高；Pre-Norm 先 LN 再子层：x'=x+Sublayer(LN(x))，残差直连深训稳定无需精细 warmup，现代 LLM 主流。

实际案例：GPT/LLaMA/Qwen 均用 Pre-Norm（或 RMSNorm），训练千亿参数稳定。原始 BERT 用 Post-Norm 需精心 warmup。

\`\`\`python
import torch.nn as nn
class PreNormBlock(nn.Module):
    def __init__(self, d, fn):
        super().__init__()
        self.norm = nn.LayerNorm(d); self.fn = fn
    def forward(self, x):
        return x + self.fn(self.norm(x))  # Pre-Norm 残差直连
class PostNormBlock(nn.Module):
    def forward(self, x):
        return self.norm(x + self.fn(x))  # Post-Norm
\`\`\`

踩坑：Pre-Norm 深训稳但精度上限略低于 Post-Norm；Sandwich Norm（前后都加 Norm）兼顾稳定与上限；RMSNorm 去均值省算力。`,
    keyPoints: ["Post-Norm 残差后 LN 深训难", "Pre-Norm 残差直连深训稳主流", "RMSNorm 省算力"],
    followUps: ["RMSNorm 和 LN 区别？", "为什么 Pre-Norm 更稳定？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-79",
    nodeId: "ai-transformer",
    question: "Transformer 的 Encoder 和 Decoder 区别？因果掩码作用？",
    answer: `结论：Encoder 双向自注意力（看全句）用于理解；Decoder 带因果掩码自回归+交叉注意力连接 Encoder 输出。因果掩码给未来位置加 -∞ 屏蔽，softmax 后权重 0，保证生成第 t 词只看前 t-1 词。

实际案例：BERT 只 Encoder 双向；GPT 只 Decoder 自回归；T5/BART 用完整 Encoder-Decoder 做翻译摘要。

\`\`\`python
import torch
def causal_mask(seq_len):
    return torch.triu(torch.ones(seq_len, seq_len), diagonal=1).bool()
mask = causal_mask(5)
scores = scores.masked_fill(mask, float("-inf"))  # 上三角屏蔽
# Padding mask 屏蔽 PAD token
\`\`\`

踩坑：因果掩码和 padding mask 要叠加；交叉注意力 Q 来自 Decoder、K/V 来自 Encoder；漏因果掩码会数据泄露指标虚高。`,
    keyPoints: ["Encoder 双向自注意力", "Decoder 因果掩码+交叉注意力", "因果掩码屏蔽未来防泄露"],
    followUps: ["交叉注意力 Q/K/V 来自哪？", "Padding Mask 和 Causal Mask 如何叠加？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-80",
    nodeId: "ai-transformer",
    question: "Transformer 训练有哪些关键技巧？为什么需要 warmup 和大 batch？",
    answer: `结论：Transformer 训练标配 warmup+AdamW+梯度裁剪+大 batch+Label Smoothing。warmup 防初期发散（LN/Adam 二阶矩未稳）；大 batch 泛化更好但需更大学习率+更长 warmup。

实际案例：字节豆包、智谱 GLM 训练用 warmup(1-5%)+cosine+AdamW+梯度裁剪 1.0+BF16 混合精度。BERT/GPT 均需 warmup 否则初期发散。

\`\`\`python
import torch
from transformers import get_cosine_schedule_with_warmup
opt = torch.optim.AdamW(model.parameters(), lr=5e-5, weight_decay=0.01)
sched = get_cosine_schedule_with_warmup(opt, num_warmup_steps=500,
                                        num_training_steps=total)
torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
\`\`\`

踩坑：Label Smoothing 0.1 防过自信提泛化；softmax 前减最大值防溢出；BF16 比 FP16 不易溢出适合 LLM。`,
    keyPoints: ["warmup 防初期发散", "AdamW+梯度裁剪标配", "大 batch+Label Smoothing 提泛化"],
    followUps: ["为什么 Transformer 对 batch 敏感？", "Label Smoothing 为何提泛化？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-81",
    nodeId: "ai-transformer",
    question: "长序列注意力的复杂度问题如何优化？Flash Attention、线性注意力？",
    answer: `结论：标准 Self-Attention O(n²) 复杂度，长序列显存爆炸。Flash Attention 用 IO 感知分块计算减少 HBM 读写（精确不近似）；线性注意力（Linear/Performer）用核近似降到 O(n)；稀疏注意力（Longformer/BigBird）只关注局部+全局 token。

实际案例：字节豆包、GPT-4 用 Flash Attention v2 训练长上下文；Longformer 做长文档理解。Flash Attention 不改结果只加速省显存，已成标配。

\`\`\`python
import torch
# Flash Attention（库自动调用）
from flash_attn import flash_attn_func
out = flash_attn_func(q, k, v, causal=True)  # 精确加速
# 滑动窗口注意力（局部）
def sliding_window_attn(q, k, v, window=512):
    pass  # 仅在 window 范围内计算注意力
\`\`\`

踩坑：线性注意力精度损失需评估；Flash Attention 需特定 GPU（Ampere+）；长上下文还需 KV Cache 优化（GQA/PagedAttention）。`,
    keyPoints: ["标准注意力 O(n²)", "Flash Attention IO 感知分块精确加速", "线性/稀疏注意力降复杂度"],
    followUps: ["Flash Attention 为何不改变结果？", "KV Cache 如何优化？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-82",
    nodeId: "ai-pretrain",
    question: "BERT 的 MLM 和 GPT 的自回归预训练有何区别？各自适合什么任务？",
    answer: `结论：BERT 用 Encoder 双向 MLM（随机 mask 15% token 预测），适合理解类任务（分类/NER/问答）；GPT 用 Decoder 单向自回归（预测下一 token），适合生成类任务。Decoder-only 因可扩展性和少样本能力成 LLM 主流。

实际案例：百度 ERNIE 改进 BERT 用知识掩码（实体/短语级 mask）提升中文理解；GPT-4/LLaMA/Qwen 均 Decoder-only 自回归。

\`\`\`python
import torch
import torch.nn.functional as F
# MLM：随机 mask token 预测
labels = input_ids.clone()
mask = torch.rand_like(input_ids.float()) < 0.15
labels[~mask] = -100  # 只算 mask 位置损失
loss = model(input_ids, labels=labels).loss
# 自回归：预测下一 token
shift_logits = logits[:, :-1]; shift_labels = input_ids[:, 1:]
loss = F.cross_entropy(shift_logits.reshape(-1, V), shift_labels.reshape(-1))
\`\`\`

踩坑：MLM 不能直接生成；自回归预训练数据利用率高（每位置都算 loss）；Decoder-only 大模型理解任务也能通过 prompt 完成。`,
    keyPoints: ["BERT MLM 双向理解强", "GPT 自回归单向生成强", "Decoder-only 成 LLM 主流"],
    followUps: ["为什么 Decoder-only 成主流？", "MLM 和自回归数据利用差异？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-83",
    nodeId: "ai-pretrain",
    question: "T5 和 BERT/GPT 的架构区别？统一 Text-to-Text 范式？",
    answer: `结论：T5 用完整 Encoder-Decoder，把所有任务统一为 Text-to-Text（输入文本→输出文本），翻译/分类/摘要/问答都用同一格式。BERT 只 Encoder 适合理解，GPT 只 Decoder 适合生成，T5 两者兼顾。

实际案例：Google 用 T5 做多任务统一训练；Flan-T5 用指令微调提升零样本能力。Encoder-Decoder 在翻译/摘要等有明确输入输出的任务上仍有优势。

\`\`\`python
from transformers import T5ForConditionalGeneration, T5Tokenizer
tok = T5Tokenizer.from_pretrained("t5-base")
model = T5ForConditionalGeneration.from_pretrained("t5-base")
# 翻译/摘要/分类统一为 text-to-text
input_ids = tok("summarize: 长文本...", return_tensors="pt").input_ids
out = model.generate(input_ids, max_length=100)
print(tok.decode(out[0]))
\`\`\`

踩坑：Encoder-Decoder 参数效率不如 Decoder-only；T5 前缀任务提示需精心设计；小模型 T5 在多任务上表现均衡。`,
    keyPoints: ["T5 Encoder-Decoder", "统一 Text-to-Text 范式", "翻译/摘要有明确输入输出优势"],
    followUps: ["T5 和 BART 区别？", "为什么 Decoder-only 参数效率高？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-84",
    nodeId: "ai-pretrain",
    question: "对比学习（SimCLR/CLIP）的原理？为什么能学到好表示？",
    answer: `结论：对比学习通过拉近正样本对、推远负样本对学表示。SimCLR 同图增强为正对、不同图为负对，InfoNCE 损失；CLIP 把图文配对为正、不配对为负，学跨模态对齐空间。

实际案例：CLIP 是 OpenAI 多模态基础，零样本图像分类能力惊人；字节即梦、阿里通义用 CLIP 做图文检索。SimCLR 学的表示迁移效果好。

\`\`\`python
import torch
import torch.nn.functional as F
def info_nce(z_i, z_j, temperature=0.1):
    z = torch.cat([z_i, z_j], 0)
    z = F.normalize(z, dim=1)
    sim = z @ z.T / temperature
    labels = torch.arange(z_i.size(0)).repeat(2)
    mask = torch.eye(z.size(0), dtype=torch.bool)
    sim.masked_fill_(mask, -1e9)
    return F.cross_entropy(sim, labels)
# CLIP：图文对正样本，批内其他为负
logits = img_emb @ txt_emb.T / temperature
loss = F.cross_entropy(logits, torch.arange(batch))
\`\`\`

踩坑：负样本不足学不好，需大 batch 或 memory bank；温度参数敏感；hard negative mining 提升效果。`,
    keyPoints: ["拉近正对推远负对", "InfoNCE 损失", "CLIP 图文跨模态对齐"],
    followUps: ["温度参数如何影响？", "MoCo 的 memory bank 作用？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-85",
    nodeId: "ai-pretrain",
    question: "Prompt Tuning、Prefix Tuning、LoRA 的区别？参数高效微调如何选？",
    answer: `结论：Prompt Tuning 只学连续 prompt 向量（参数极少但效果随模型变大才好）；Prefix Tuning 在每层 attention 前加可学 prefix；LoRA 冻结原权重旁路低秩 A·B（参数<1% 效果接近全量微调），是主流。

实际案例：智谱 GLM、百川微调用 LoRA；QLoRA 进一步 4bit 量化基座让 65B 模型单卡可训。字节、阿里内部大量用 LoRA 做领域适配。

\`\`\`python
from peft import LoraConfig, get_peft_model
config = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05,
                    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"])
model = get_peft_model(base_model, config)  # 可训练参数 <1%
# 推理时合并 W' = W + A·B 无额外延迟
\`\`\`

踩坑：LoRA 的 r 一般 8-64，太小学不到太大学过拟合；target_modules 选 attention 投影层效果最好；QLoRA 用 NF4 量化基座省显存。`,
    keyPoints: ["Prompt Tuning 学 prompt 向量", "LoRA 冻结 W 训低秩 A·B", "QLoRA 4bit 量化省显存"],
    followUps: ["LoRA 的 r 如何选？", "QLoRA 如何省显存？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-86",
    nodeId: "ai-pretrain",
    question: "大模型的 scaling law 是什么？对训练有何指导？",
    answer: `结论：scaling law 指模型损失随参数量 N、数据量 D、计算量 C 呈幂律下降（L=A+N^α+D^β），可用小模型实验外推大模型表现，指导算力分配。Chinchilla 法则：给定计算量，参数和数据应按比例增长（约 20 token/参数）最优。

实际案例：OpenAI GPT-3 验证 scaling law；DeepSeek/LLaMA 据此规划训练。Chinchilla 发现 GPT-3 数据不足，同等算力下更小模型+更多数据更优。

\`\`\`python
# 简化 scaling law 拟合
import numpy as np
# L(N, D) = E + A/N^alpha + B/D^beta
# 用小模型损失拟合 alpha, beta 外推
def loss_law(N, D, E=1.7, A=406, alpha=0.34, B=410, beta=0.28):
    return E + A / N**alpha + B / D**beta
# Chinchilla 最优：D/N ≈ 20
\`\`\`

踩坑：scaling law 在能力涌现区可能不准；数据质量比数量更重要；过参数化（GPT-3）推理浪费，Chinchilla 更均衡。`,
    keyPoints: ["损失随 N/D/C 幂律下降", "Chinchilla D/N≈20 最优", "小模型外推大模型"],
    followUps: ["涌现能力是什么？", "数据质量与数量如何权衡？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-87",
    nodeId: "ai-pretrain",
    question: "大模型预训练工程有哪些关键挑战？数据清洗、训练稳定性？",
    answer: `结论：预训练工程挑战：海量数据清洗去重、训练稳定性（loss spike/发散）、断点续训、大规模分布式、监控。数据质量决定上限，训练稳定性需精细调参。

实际案例：智谱 GLM、月之暗面 Kimi 预训练需万亿 token 清洗（去重/去毒/质量过滤）；用 Megatron+DeepSpeed 千卡训练；监控梯度范数/loss spike，发散时回滚 checkpoint 降学习率重启。

\`\`\`python
# 数据清洗流水线
import datasets
ds = datasets.load_dataset("json", data_files="raw.jsonl")
ds = ds.filter(lambda x: len(x["text"]) > 50)  # 过短过滤
ds = ds.filter(lambda x: quality_filter(x["text"]))  # 质量过滤
ds = ds.map(dedup)  # 去重（MinHash）
# 训练监控：loss spike 检测
if loss > prev_loss * 1.5:  # spike
    load_checkpoint(prev_ckpt); reduce_lr(optimizer, factor=0.5)
\`\`\`

踩坑：数据去重不充分致过拟合重复内容；loss spike 常因学习率过大/batch 异常；checkpoint 频率需平衡存储与续训成本。`,
    keyPoints: ["数据清洗去重决定上限", "训练稳定性监控 loss spike", "千卡分布式+断点续训"],
    followUps: ["如何检测 loss spike？", "数据去重用什么算法？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-88",
    nodeId: "ai-frameworks",
    question: "PyTorch 的 autograd 原理？动态图相比静态图优势？",
    answer: `结论：autograd 前向时自动构建计算图记录操作，backward 从叶子反向链式求导。动态图每次前向即时建图可用 Python 控制流，调试友好；静态图先定义再执行优化空间大但不灵活。TF2 默认 eager+tf.function 趋同。

实际案例：PyTorch 是研究主流（字节/阿里算法栈）；TF 在工业部署（TF Serving）仍有市场。autograd 让开发者只写前向。

\`\`\`python
import torch
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x
y.backward()
print(x.grad)  # 7.0
# no_grad 推理省显存
with torch.no_grad():
    out = model(x)
\`\`\`

踩坑：梯度默认累加需 zero_grad；detach() 截断梯度；requires_grad 控制是否求导；item() 取标量。`,
    keyPoints: ["autograd 自动构建计算图求导", "动态图灵活易调试", "静态图性能优可优化"],
    followUps: ["requires_grad 和 no_grad 作用？", "tf.function 如何加速？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-89",
    nodeId: "ai-frameworks",
    question: "混合精度训练原理？为什么 BF16 比 FP16 更适合 LLM？",
    answer: `结论：混合精度用 FP16/BF16 计算+FP32 主权重+Loss Scaling 防下溢，提速省显存。BF16 指数位与 FP32 相同动态范围大不易溢出，LLM 训练首选；FP16 精度高但动态范围小易溢出需 Loss Scaling。

实际案例：A100/H100 原生支持 BF16，字节/阿里训大模型用 BF16 混合精度替代 FP16+Loss Scaling，更稳定。

\`\`\`python
from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()  # FP16 需 GradScaler
for x, y in loader:
    with autocast(dtype=torch.bfloat16):  # BF16 无需 scaler
        loss = model(x, y)
    loss.backward(); optimizer.step(); optimizer.zero_grad()
\`\`\`

踩坑：FP16 溢出需 Loss Scaling；BF16 精度略低但稳定；旧 GPU（Volta）不支持 BF16。`,
    keyPoints: ["FP16 计算快+FP32 主权重+Loss Scaling", "BF16 动态范围大不易溢出", "BF16 适合 LLM"],
    followUps: ["BF16 和 FP16 区别？", "GradScaler 如何选 scale？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-90",
    nodeId: "ai-frameworks",
    question: "DataParallel 和 DistributedDataParallel 区别？为什么 DDP 是标准？",
    answer: `结论：DP 单进程多线程，主 GPU 分发收集梯度，有 GIL 限制和负载不均；DDP 多进程每卡一进程，AllReduce 同步梯度，显存均衡无 GIL 支持多机，是分布式训练标准。

实际案例：字节/阿里训大模型全用 DDP+Megatron/DeepSpeed。DP 主卡易显存爆，DDP 均衡高效。

\`\`\`python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler
dist.init_process_group("nccl")
rank = dist.get_rank(); torch.cuda.set_device(rank)
model = DDP(model.cuda(rank), device_ids=[rank])
sampler = DistributedSampler(dataset, shuffle=True)
loader = DataLoader(dataset, batch_size=64, sampler=sampler)
# 启动：torchrun --nproc_per_node=4 train.py
\`\`\`

踩坑：DistributedSampler 需 set_epoch 保证 shuffle；DDP 梯度同步 AllReduce 通信开销大需梯度桶合并；多机需 NCCL+IB 网络。`,
    keyPoints: ["DP 单进程多线程有 GIL 负载不均", "DDP 多进程 AllReduce 同步梯度", "DDP 支持多机是标准"],
    followUps: ["DDP 如何保证各进程数据不同？", "混合精度+DDP 如何配合？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-91",
    nodeId: "ai-frameworks",
    question: "PyTorch 如何保存加载模型？state_dict 和完整模型区别？",
    answer: `结论：推荐只存 state_dict（参数张量，解耦可移植），加载需先有模型定义。完整模型 pickle 整对象依赖类路径不推荐。检查点含优化器状态可断点续训，strict=False 支持部分加载。

实际案例：字节模型仓库存 state_dict+config，加载时按 config 重建模型再 load。LoRA 微调用 strict=False 加载部分预训练权重。

\`\`\`python
# 只存 state_dict（推荐）
torch.save(model.state_dict(), "model.pt")
model = MyModel(*args); model.load_state_dict(torch.load("model.pt"))
# 检查点续训
ckpt = {"epoch": e, "model": model.state_dict(),
        "optimizer": optimizer.state_dict()}
torch.save(ckpt, "ckpt.pt")
ckpt = torch.load("ckpt.pt", map_location="cpu")
model.load_state_dict(ckpt["model"])
# 部分加载（迁移学习/LoRA）
model.load_state_dict(pretrained, strict=False)
\`\`\`

踩坑：完整模型 pickle 跨版本易失败；map_location 处理 CPU/GPU 迁移；BN running 统计必须一起存。`,
    keyPoints: ["只存 state_dict 解耦可移植", "检查点含优化器状态可续训", "strict=False 部分加载"],
    followUps: ["strict=False 何时用？", "如何只加载部分层？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-92",
    nodeId: "ai-frameworks",
    question: "Megatron-LM 和 DeepSpeed 解决什么问题？3D 并行？",
    answer: `结论：Megatron-LM 做张量并行（把单层权重切分到多卡）+流水线并行（把不同层分到不同卡）；DeepSpeed 做 ZeRO 优化器/梯度/参数分片省显存。两者结合 3D 并行（数据+张量+流水线）训千亿模型。

实际案例：字节豆包、智谱 GLM 千亿训练用 Megatron-DeepSpeed 3D 并行。张量并行适合单机多卡（NVLink 快），流水线并行跨机。

\`\`\`python
import deepspeed, megatron
# DeepSpeed ZeRO
model, opt, _, _ = deepspeed.initialize(model=model, optimizer=opt,
    config={"zero_optimization": {"stage": 3}, "fp16": {"enabled": True}})
# Megatron 张量并行（概念）
# ColumnParallelLinear / RowParallelLinear 切分权重
# 启动：多机多卡 + NCCL
\`\`\`

踩坑：张量并行通信频繁需高速互联（NVLink）；流水线并行有 bubble 空闲需微批次填充；3D 并行配置复杂需调优。`,
    keyPoints: ["Megatron 张量+流水线并行", "DeepSpeed ZeRO 分片省显存", "3D 并行训千亿"],
    followUps: ["张量并行如何切分？", "流水线 bubble 如何消除？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-93",
    nodeId: "ai-frameworks",
    question: "PyTorch 自定义 nn.Module？前向传播和参数管理？",
    answer: `结论：继承 nn.Module，__init__ 定义子层（自动注册参数），forward 实现前向（可用 Python 控制流），autograd 自动反向。parameters() 递归收集所有参数。

实际案例：研究原型用 nn.Module 灵活搭模型；生产用 torch.compile 加速。

\`\`\`python
import torch.nn as nn
class MLP(nn.Module):
    def __init__(self, in_dim, hidden, n_classes):
        super().__init__()
        self.fc1 = nn.Linear(in_dim, hidden)
        self.bn = nn.BatchNorm1d(hidden); self.act = nn.ReLU()
        self.drop = nn.Dropout(0.3); self.fc2 = nn.Linear(hidden, n_classes)
    def forward(self, x):
        return self.fc2(self.drop(self.act(self.bn(self.fc1(x)))))
model = MLP(784, 256, 10).cuda()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
\`\`\`

踩坑：forward 别用 inplace 操作破坏 autograd；冻结层设 requires_grad=False；model.train()/eval() 影响 BN/Dropout。`,
    keyPoints: ["继承 nn.Module + __init__ 定义层", "forward 前向 autograd 自动反向", "parameters() 递归收集"],
    followUps: ["nn.Sequential 和 Module 区别？", "如何冻结部分层？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-94",
    nodeId: "ai-cv-classification",
    question: "CV 数据增强有哪些？Mixup、CutMix、Mosaic 原理与区别？",
    answer: `结论：基础增强（裁剪/翻转/色彩抖动）增多样性；Mixup 两图线性插值标签混合；CutMix 裁块贴图保局部纹理；Mosaic 拼四图丰富背景对小目标友好。

实际案例：YOLO 用 Mosaic 增强提升小目标检测；ImageNet 分类用 Mixup+RandAugment 提泛化。阿里商品识别用 CutMix 防过拟合。

\`\`\`python
import albumentations as A
import numpy as np
transform = A.Compose([A.RandomResizedCrop(224,224), A.HorizontalFlip(p=0.5),
    A.ColorJitter(0.2,0.2,0.2,p=0.5), A.Normalize()])
# Mixup
lam = np.random.beta(0.2, 0.2)
x_mix = lam * x1 + (1-lam) * x2; y_mix = lam * y1 + (1-lam) * y2
# CutMix
lam = np.random.beta(1,1); bbx1,bby1,bbx2,bby2 = rand_bbox(x2.shape, lam)
x_cut = x1.copy(); x_cut[:,bbx1:bbx2,bby1:bby2] = x2[:,bbx1:bbx2,bby1:bby2]
\`\`\`

踩坑：Mixup 标签软化可能损害校准；Mosaic 拼图改变目标尺度分布需调 anchor；测试时不增强（除 TTA）。`,
    keyPoints: ["Mixup 线性插值标签混合", "CutMix 裁块贴图保纹理", "Mosaic 拼四图小目标友好"],
    followUps: ["Mixup 为何防过拟合？", "Mosaic 对小目标为何有效？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-95",
    nodeId: "ai-cv-classification",
    question: "迁移学习微调预训练模型策略？小数据 vs 大数据？",
    answer: `结论：小数据冻结主干只训分类头（防破坏预训练特征）；大数据全量微调（主干小学习率 1e-4 新层大 1e-3）；逐层解冻渐进式更稳。微调学习率比从头训小 10×。

实际案例：阿里商品识别用 ImageNet 预训练 ResNet 微调，小类目冻结主干，大类目全量微调。

\`\`\`python
import torchvision.models as M, torch.nn as nn
model = M.resnet50(weights=M.ResNet50_Weights.DEFAULT)
for p in model.parameters(): p.requires_grad = False  # 冻结
model.fc = nn.Linear(model.fc.in_features, n)  # 换头
opt = torch.optim.Adam([{"params": model.fc.parameters(), "lr": 1e-3}])
# 大数据全量
for p in model.parameters(): p.requires_grad = True
opt = torch.optim.Adam([{"params": model.layer4.parameters(), "lr":1e-4},
                        {"params": model.fc.parameters(), "lr":1e-3}])
\`\`\`

踩坑：小数据全量微调易过拟合；逐层解冻从深层开始；微调时数据增强适度防破坏预训练特征。`,
    keyPoints: ["预训练+换分类头", "冻结(小数据)/全量(大数据)", "微调学习率要小"],
    followUps: ["如何避免微调遗忘？", "CLIP 零样本迁移？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-96",
    nodeId: "ai-cv-classification",
    question: "Vision Transformer（ViT）和 CNN 区别？何时 ViT 优于 CNN？",
    answer: `结论：ViT 把图像切 patch 当 token 输入 Transformer，全局自注意力建模长程依赖；CNN 靠局部卷积+层次化有归纳偏置。大数据 ViT 超越 CNN，小数据 CNN 更稳（归纳偏置帮助）。

实际案例：Google ViT、阿里通义视觉用 ViT 在大数据上超越 ResNet；小数据集 ViT 易过拟合需强预训练。ViT 缺乏平移不变性需更多数据。

\`\`\`python
import torch.nn as nn
class PatchEmbed(nn.Module):
    def __init__(self, img_size=224, patch=16, dim=768):
        super().__init__()
        self.proj = nn.Conv2d(3, dim, patch, patch)
    def forward(self, x):
        x = self.proj(x).flatten(2).transpose(1,2)  # (B,N,D)
        return x
# ViT: patch embed + cls token + Transformer encoder
\`\`\`

踩坑：ViT 计算量 O(n²) patch 多显存大；需大规模预训练才发挥优势；Swin ViT 用窗口注意力降复杂度适合密集预测。`,
    keyPoints: ["ViT patch 当 token 全局注意力", "CNN 局部卷积有归纳偏置", "大数据 ViT 优 小数据 CNN 稳"],
    followUps: ["ViT 为什么需要大数据？", "Swin Transformer 窗口注意力？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-97",
    nodeId: "ai-cv-classification",
    question: "知识蒸馏原理？ Teacher-Student 如何工作？",
    answer: `结论：知识蒸馏用大 Teacher 的软标签（带温度 T 的 softmax）训小 Student，Student 学 Teacher 的暗知识（类间关系），压缩模型且保精度。损失=硬标签交叉熵+软标签 KL 散度。

实际案例：阿里通义、腾讯优图用蒸馏把大 ViT 知识压进 MobileNet 端侧部署。美团配送 ETA 融合模型蒸馏到单模型上线。

\`\`\`python
import torch
import torch.nn.functional as F
def distill_loss(student_logit, teacher_logit, target, T=4, alpha=0.5):
    soft = F.kl_div(F.log_softmax(student_logit/T, 1),
                    F.softmax(teacher_logit/T, 1), reduction="batchmean") * (T*T)
    hard = F.cross_entropy(student_logit, target)
    return alpha * soft + (1-alpha) * hard
# Teacher 推理时不更新
with torch.no_grad(): t_logit = teacher(x)
loss = distill_loss(student(x), t_logit, y)
\`\`\`

踩坑：温度 T 太高暗知识模糊太低接近硬标签（T=4-8 常用）；Teacher 质量决定 Student 上限；特征蒸馏（中间层）比仅 logit 蒸馏效果更好。`,
    keyPoints: ["软标签学暗知识", "硬标签+软标签 KL 损失", "温度 T 控制软化"],
    followUps: ["特征蒸馏和 logit 蒸馏区别？", "温度如何选？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-98",
    nodeId: "ai-cv-classification",
    question: "长尾分布分类如何处理？重采样、重加权、解耦？",
    answer: `结论：长尾分布（头部类多尾部类少）用重采样（类别均衡采样）、重加权（类权重/Focal Loss）、解耦表征（先正常学表征再类均衡微调分类头）处理。解耦法（BBN/Decoupling）效果最好。

实际案例：阿里商品识别长尾类目（热门 vs 冷门商品），用解耦法：第一阶段正常采样学通用表征，第二阶段类均衡采样微调分类头，尾部类 F1 显著提升。

\`\`\`python
import torch
import torch.nn.functional as F
# Focal Loss
def focal(logits, target, alpha=0.25, gamma=2.0):
    ce = F.cross_entropy(logits, target, reduction="none")
    p = torch.exp(-ce)
    return (alpha * (1-p)**gamma * ce).mean()
# 类均衡采样
from torch.utils.data import WeightedRandomSampler
weights = 1.0 / torch.tensor(class_counts)
sampler = WeightedRandomSampler(weights, len(dataset))
\`\`\`

踩坑：重采样尾部类过采样易过拟合；重加权破坏校准；解耦法两阶段策略调参多；测试时按真实分布评估。`,
    keyPoints: ["重采样/重加权/解耦表征", "解耦法两阶段效果最好", "测试按真实分布评估"],
    followUps: ["Focal Loss 和类权重区别？", "解耦法为何有效？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-99",
    nodeId: "ai-cv-classification",
    question: "ResNet 之后有哪些重要变体？ResNeXt、ConvNeXt 贡献？",
    answer: `结论：ResNeXt 引入分组卷积（cardinality 维度）提升表达力；DenseNet 密集连接特征复用；ConvNeXt 用现代设计（大卷积/GELU/LayerNorm）让 CNN 重新匹敌 ViT。

实际案例：阿里通义视觉、商汤用 ConvNeXt 作为 CNN backbone 替代 ResNet，精度接近 ViT 且推理更友好。

\`\`\`python
import torchvision.models as M
resnext = M.resnext50_32x4d(weights=M.ResNeXt50_32X4D_Weights.DEFAULT)
convnext = M.convnext_small(weights=M.ConvNeXt_Small_Weights.DEFAULT)
\`\`\`

踩坑：ResNeXt 分组卷积需 groups 整除通道；ConvNeXt 大卷积显存大；选型看精度/速度/部署平台权衡。`,
    keyPoints: ["ResNeXt 分组卷积", "ConvNeXt 现代设计匹敌 ViT", "DenseNet 密集连接"],
    followUps: ["ConvNeXt 如何匹敌 ViT？", "分组卷积和深度卷积区别？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-100",
    nodeId: "ai-cv-detection",
    question: "YOLO 检测原理？单阶段相比两阶段（Faster R-CNN）优势？",
    answer: `结论：YOLO 把检测当回归，一次前向输出所有框：图像分 S×S 网格，每网格预测 B 个框+C 类。单阶段速度快适合实时，两阶段精度高但慢。现代 YOLO（v8/v11）精度也接近两阶段。

实际案例：美团无人配送用 YOLOv8 实时检测障碍物；安防用 YOLO 实时人流检测。YOLO 系列持续演进（anchor-free/解耦头/Mosaic/CIoU）。

\`\`\`python
from ultralytics import YOLO
model = YOLO("yolov8n.pt")  # 加载预训练
results = model("image.jpg", conf=0.5)
# 训练
model.train(data="coco.yaml", epochs=100, imgsz=640, batch=16)
\`\`\`

踩坑：小目标检测 YOLO 需高分辨率输入；NMS 阈值影响召回精度权衡；anchor-free 需调中心点分配策略。`,
    keyPoints: ["YOLO 单阶段回归一次出框", "网格预测 B 框+C 类", "单阶段快两阶段精度高"],
    followUps: ["NMS 原理？Soft-NMS 改进？", "Anchor-free 优势？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-101",
    nodeId: "ai-cv-detection",
    question: "Faster R-CNN 两阶段检测原理？RPN 作用？",
    answer: `结论：Faster R-CNN 第一阶段 RPN 生成候选区域（Proposal），第二阶段对 proposal 分类+回归精修框。RPN 用 anchor 机制在全图滑动生成候选，端到端训练替代 Selective Search。

实际案例：高精度检测（医疗/工业质检）用 Faster R-CNN 牺牲速度换精度。美团无人配送对精度要求高的场景也曾用两阶段。

\`\`\`python
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
model = fasterrcnn_resnet50_fpn(weights="DEFAULT")
model.eval()
pred = model([image_tensor])  # 输出框+类别+分数
\`\`\`

踩坑：两阶段慢不适合实时；RPN anchor 尺度比例需匹配目标；FPN 多尺度特征提升小目标检测。`,
    keyPoints: ["RPN 生成候选区域", "两阶段分类+回归精修", "anchor 滑动生成候选"],
    followUps: ["RPN 如何训练？", "FPN 多尺度原理？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-102",
    nodeId: "ai-cv-detection",
    question: "DETR 端到端检测原理？为何去掉 NMS 和 anchor？",
    answer: `结论：DETR 用 Transformer Encoder-Decoder 把检测变成集合预测，用匈牙利匹配做二分图分配，一次性输出固定 N 个框，无需 NMS 和 anchor。

实际案例：Facebook 提出 DETR 后，美团/字节在广告图文检测中尝试端到端方案，省去手工 anchor 设计和 NMS 调参。Deformable DETR 解决收敛慢问题后被工业采用。

\`\`\`python
import torch
from models import build_model
model, criterion, postprocessors = build_model(args)
model.eval()
with torch.no_grad():
    out = model(samples)  # 直接输出 100 个 (class, box)
# 匈牙利匹配损失训练
\`\`\`

踩坑：DETR 收敛慢需 500 epoch；小目标检测需 Deformable Attention；query 数量影响召回。`,
    keyPoints: ["Transformer 集合预测", "匈牙利二分图匹配", "去掉 NMS/anchor"],
    followUps: ["Deformable DETR 改进？", "匈牙利匹配如何计算？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-103",
    nodeId: "ai-cv-detection",
    question: "NMS 原理？Soft-NMS 改进？mAP 如何计算？",
    answer: `结论：NMS 按置信度排序，保留最高分框，删除与其 IoU 超阈值的重复框。Soft-NMS 不直接删除而是降低重叠框分数。mAP 对每个类别按置信度排序算 PR 曲线下面积，再按类别平均。

实际案例：腾讯广告图文检测中 NMS 阈值设 0.5 平衡召回精度；密集场景用 Soft-NMS 保留遮挡目标。COCO mAP 取 IoU 0.5-0.95 平均。

\`\`\`python
def nms(boxes, scores, iou_thr=0.5):
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]; keep.append(i)
        ious = box_iou(boxes[i], boxes[order[1:]])
        order = order[1:][ious < iou_thr]
    return keep
\`\`\`

踩坑：NMS 阈值过低漏检遮挡目标；mAP 对小类别敏感需加权；视频检测需时序 NMS。`,
    keyPoints: ["NMS 按 IoU 删重复框", "Soft-NMS 降分不删除", "mAP = PR 曲线下面积均值"],
    followUps: ["DIoU-NMS 改进？", "AP50 与 AP75 区别？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-104",
    nodeId: "ai-cv-detection",
    question: "Anchor-free 检测（FCOS/CenterNet）原理？相比 anchor-based 优势？",
    answer: `结论：Anchor-free 直接预测中心点/像素到框边的距离，无需预设 anchor。FCOS 逐像素回归 l/t/r/b，CenterNet 预测热力图中心点+宽高。优势是超参少、避免 anchor 匹配。

实际案例：YOLOv8/X 采用 anchor-free 头提升通用性；美团无人配送用 CenterNet 做密集行人检测。anchor-free 对小目标和尺度变化更友好。

\`\`\`python
# FCOS 回归头：每个像素预测到四边距离
centerness, l, t, r, b = head(feat)  # (B,1,H,W),(B,4,H,W)
# 中心度加权抑制低质量框
score = centerness * cls_score
\`\`\`

踩坑：FCOS 需 centerness 抑制边缘低质量框；CenterNet 下采样丢失小目标；正负样本定义影响收敛。`,
    keyPoints: ["FCOS 逐像素回归四边距离", "CenterNet 热力图中心点", "无需 anchor 匹配"],
    followUps: ["FCOS centerness 作用？", "FCOS 如何处理多尺度？"],
    favorited: false,
    bigTech: false,
  },
  // ===== 17. ai-cv-segmentation =====
  {
    id: "ai-105",
    nodeId: "ai-cv-segmentation",
    question: "语义分割 vs 实例分割 vs 全景分割区别？U-Net 原理？",
    answer: `结论：语义分割只分类别（同类不区分实例），实例分割区分同类不同实例，全景分割=语义+实例。U-Net 用 encoder 下采样+decoder 跳跃连接上采样恢复细节，适合小数据医学分割。

实际案例：联影智能/推想医疗用 U-Net 做肺结节分割；百度 Apollo 用语义分割做可行驶区域。U-Net 跳跃连接保留高分辨率细节。

\`\`\`python
import segmentation_models_pytorch as smp
model = smp.Unet(encoder_name="resnet34", classes=1)
mask = model(image)  # (B,1,H,W) 二值掩码
# 跳跃连接：encoder 特征 concat 到 decoder
\`\`\`

踩坑：U-Net 输入需 2 的幂次尺寸；类别不平衡用 Dice Loss；医学分割需后处理去小连通域。`,
    keyPoints: ["语义/实例/全景三者区别", "U-Net 跳跃连接恢复细节", "encoder-decoder 对称结构"],
    followUps: ["U-Net++ 改进？", "实例分割如何区分同类实例？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-106",
    nodeId: "ai-cv-segmentation",
    question: "DeepLab 系列原理？空洞卷积和 ASPP 作用？",
    answer: `结论：DeepLab 用空洞卷积（dilated convolution）扩大感受野不降分辨率，ASPP（Atrous Spatial Pyramid Pooling）多尺度并行提取特征。DeepLabv3+ 加 encoder-decoder 恢复边界。

实际案例：百度 Apollo、地平线自动驾驶用 DeepLab 做车道线/可行驶区域分割。ASPP 多尺度处理远近目标。

\`\`\`python
import torchvision
from torchvision.models.segmentation import deeplabv3_resnet50
model = deeplabv3_resnet50(weights="DEFAULT", num_classes=21)
out = model(img)["out"]  # (B,21,H,W)
# ASPP: rates=[6,12,18] 并行空洞卷积
\`\`\`

踩坑：空洞卷积有栅格效应需加大 kernel；输出尺寸需双线性插值还原；CRF 后处理提升边界。`,
    keyPoints: ["空洞卷积扩感受野保分辨率", "ASPP 多尺度并行", "DeepLabv3+ encoder-decoder"],
    followUps: ["空洞卷积栅格效应？", "DeepLab 各版本演进？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-107",
    nodeId: "ai-cv-segmentation",
    question: "Mask R-CNN 实例分割原理？RoI Align 解决什么问题？",
    answer: `结论：Mask R-CNN 在 Faster R-CNN 基础上加一个 mask 预测分支，对每个 RoI 输出像素级掩码。RoI Align 用双线性插值替代 RoI Pool 的量化取整，消除坐标对齐误差，提升小目标分割精度。

实际案例：商汤/旷视商品实例分割用 Mask R-CNN；美团菜品识别用实例分割定位每个菜。

\`\`\`python
from torchvision.models.detection import maskrcnn_resnet50_fpn
model = maskrcnn_resnet50_fpn(weights="DEFAULT")
out = model([img])  # boxes, labels, scores, masks
# mask: (N,1,H,W) 每个实例一个掩码
\`\`\`

踩坑：RoI Pool 量化误差损失小目标精度；mask 分支按类独立预测；mask 阈值需调。`,
    keyPoints: ["Faster R-CNN+mask 分支", "RoI Align 双线性插值去量化", "每实例像素掩码"],
    followUps: ["RoI Pool vs RoI Align？", "Mask R-CNN 如何做全景分割？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-108",
    nodeId: "ai-cv-segmentation",
    question: "分割损失函数 Dice Loss / Focal Loss / IoU Loss 区别？类别不平衡怎么处理？",
    answer: `结论：Dice Loss 直接优化预测与 GT 的 Dice 系数（2|A∩B|/(|A|+|B|)），对小目标友好；Focal Loss 降低易分样本权重解决类别不平衡；IoU Loss 可微化 IoU。组合 CE+Dice 最常用。

实际案例：联影医疗分割肺结节前景极小用 Dice Loss；自动驾驶分割用 Focal Loss 处理背景占多数的不平衡。

\`\`\`python
def dice_loss(pred, target, eps=1e-6):
    inter = (pred * target).sum()
    return 1 - (2 * inter + eps) / (pred.sum() + target.sum() + eps)
# 组合：loss = 0.5 * ce + 0.5 * dice
\`\`\`

踩坑：Dice Loss 梯度不稳定需加 eps；极端不平衡需 OHEM+Focal；多类需逐类计算。`,
    keyPoints: ["Dice Loss 优化重叠加小目标", "Focal Loss 降易分权重", "CE+Dice 组合最常用"],
    followUps: ["Lovasz Loss 优势？", "Boundary Loss 作用？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-109",
    nodeId: "ai-cv-segmentation",
    question: "医学图像分割（MRI/CT）有何特殊性？如何处理小目标和不平衡？",
    answer: `结论：医学分割数据少、标注贵、前景极小、边界模糊、3D 体积数据。用 U-Net+Dice Loss+强增强+预训练，3D 数据用 3D U-Net/V-Net，小目标用边界损失或注意力。

实际案例：联影/推想肺结节 CT 分割、腾讯觅影眼底血管分割。数据少靠迁移学习和半监督。

\`\`\`python
# 3D U-Net 处理体积数据
from monai.networks.nets import UNet
model = UNet(spatial_dims=3, in_channels=1, out_channels=2,
             channels=(16,32,64,128), strides=(2,2,2))
# 2.5D：取相邻切片堆叠为多通道
\`\`\`

踩坑：3D 显存大需 patch 训练；标注不一致需多标注者融合；需后处理连通域去噪。`,
    keyPoints: ["3D 体积数据 patch 训练", "Dice+边界损失处理小目标", "半监督缓解标注稀缺"],
    followUps: ["2.5D 分割是什么？", "半监督医学分割方法？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-110",
    nodeId: "ai-cv-segmentation",
    question: "自动驾驶分割场景：BEV 感知、多视角融合如何做？",
    answer: `结论：自动驾驶需实时分割道路/车道/车辆/行人。BEV（鸟瞰图）把多相机图像通过 Lift-Splat/Shoot 或 BEVFormer 转到统一鸟瞰空间，融合时序做检测分割。

实际案例：蔚来/小鹏用 BEVFormer 做环视感知；地平线用 BEV+Transformer 融合多摄像头。时序融合提升速度估计。

\`\`\`python
# BEVFormer 简化：多相机特征 -> Transformer -> BEV 特征
bev_query = torch.zeros(B, C, H_bev, W_bev)
bev_feat = transformer(bev_query, multi_cam_feats, prev_bev)
seg = seg_head(bev_feat)  # BEV 空间分割
\`\`\`

踩坑：多相机标定误差需校准；时序对齐需 ego-motion 补偿；夜间需增强训练。`,
    keyPoints: ["BEV 多相机统一空间", "Lift-Splat/BEVFormer", "时序融合提速度估计"],
    followUps: ["BEVFormer 与 LSS 区别？", "Occupancy Network 原理？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-111",
    nodeId: "ai-cv-segmentation",
    question: "全景分割（Panoptic Segmentation）原理？stuff 与 thing 如何统一？",
    answer: `结论：全景分割统一语义分割（stuff 如天空道路）和实例分割（thing 如车人）。PQ 指标同时评估分割质量和实例识别。Panoptic FPN/MaskFormer 把两类输出合并。

实际案例：百度 Apollo、华为智驾用全景分割一次输出所有要素。MaskFormer 用 query 统一预测 stuff/thing。

\`\`\`python
# PQ 指标：分割质量 × 识别质量
def pq(pred, gt, classes):
    sq, rq = 0, 0
    for c in classes:
        # IoU>0.5 的匹配对算分割质量
        pass
    return sq * rq
# MaskFormer：query 同时输出 mask+类别(含 stuff)
\`\`\`

踩坑：stuff 与 thing 标注格式不同需对齐；PQ 对小实例敏感；推理速度需优化。`,
    keyPoints: ["stuff 与 thing 统一", "PQ 指标=分割质量×识别质量", "MaskFormer query 统一"],
    followUps: ["Mask2Former 改进？", "PQ 计算细节？"],
    favorited: false,
    bigTech: false,
  },
  // ===== 18. ai-cv-generative =====
  {
    id: "ai-112",
    nodeId: "ai-cv-generative",
    question: "GAN 原理？判别器与生成器如何博弈？模式崩溃怎么解决？",
    answer: `结论：GAN 由生成器 G（从噪声生成假样本）和判别器 D（区分真假）对抗训练，目标函数是极小极大博弈 min_G max_D E[logD(x)]+E[log(1-D(G(z)))]。模式崩溃指 G 只生成少数样本，用 WGAN/谱归一化/Minibatch Discrimination 解决。

实际案例：字节剪映用 GAN 做老照片修复；阿里虚拟试衣用 GAN 生成穿搭。StyleGAN 系列做人脸编辑。

\`\`\`python
import torch.nn as nn
G = nn.Sequential(nn.Linear(128, 256), nn.ReLU(), nn.Linear(256, 784))
D = nn.Sequential(nn.Linear(784, 256), nn.LeakyReLU(0.2), nn.Linear(256, 1))
# 训练：交替更新 D 和 G
g_loss = -torch.log(D(fake)).mean()  # WGAN 用 -D(fake).mean()
\`\`\`

踩坑：GAN 训练不稳需调 D/G 更新比例；模式崩溃用 WGAN-GP；评估难用 FID。`,
    keyPoints: ["G/D 极小极大博弈", "模式崩溃用 WGAN/谱归一化", "JS 散度梯度消失问题"],
    followUps: ["WGAN 原理？", "StyleGAN 改进？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-113",
    nodeId: "ai-cv-generative",
    question: "VAE 原理？重参数化技巧（Reparameterization Trick）作用？",
    answer: `结论：VAE 假设隐变量 z~N(μ,σ²)，编码器输出 μ/σ，解码器重建 x。重参数化 z=μ+σε 把采样变为可微操作使梯度能回传。损失=重建项（似然）+KL 散度（约束先验）。

实际案例：阿里推荐用 VAE 做协同过滤（Mult-VAE）；字节用 VAE 做异常检测。VAE 生成稳定但模糊。

\`\`\`python
class VAE(nn.Module):
    def encode(self, x):
        h = self.enc(x); return self.mu(h), self.logvar(h)
    def reparam(self, mu, logvar):
        std = torch.exp(0.5*logvar)
        return mu + std * torch.randn_like(std)  # 可微采样
    def loss(self, x, recon, mu, logvar):
        return bce(recon, x) + 0.5 * (logvar.exp()+mu**2-1-logvar).sum()
\`\`\`

踩坑：KL 退化需 β-VAE 调权重；生成模糊因高斯似然；后验坍缩需 free bits。`,
    keyPoints: ["z~N(μ,σ²) 重参数化", "损失=重建+KL 散度", "采样变可微"],
    followUps: ["β-VAE 作用？", "VAE vs GAN 区别？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-114",
    nodeId: "ai-cv-generative",
    question: "Diffusion 模型（DDPM）原理？前向加噪逆向去噪过程？",
    answer: `结论：DDPM 前向过程逐步对图像加高斯噪声直至纯噪声，逆向过程训练网络（常为 U-Net）逐步去噪。每步预测噪声 ε，目标函数是去噪 MSE。相比 GAN 训练稳定、多样性好。

实际案例：OpenAI DALL·E 2、Stable Diffusion 都基于 Diffusion。字节即梦/腾讯混元用 Diffusion 做图像生成。

\`\`\`python
# 前向加噪：x_t = sqrt(αbar_t)*x0 + sqrt(1-αbar_t)*ε
def q_sample(x0, t, noise):
    return sqrt_alphas[t]*x0 + sqrt_one_minus[t]*noise
# 训练：U-Net 预测噪声
loss = mse(model(x_t, t), noise)
# 采样：x_{t-1} = (x_t - β_t/sqrt(1-αbar_t)*ε_θ)/sqrt(α_t) + σ_t*z
\`\`\`

踩坑：采样慢需 DDIM/一致性模型加速；U-Net 需时间嵌入；噪声调度影响质量。`,
    keyPoints: ["前向加噪逆向去噪", "U-Net 预测噪声 ε", "训练稳多样性好"],
    followUps: ["DDIM 加速采样？", "Score-based 模型？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-115",
    nodeId: "ai-cv-generative",
    question: "Stable Diffusion 原理？为何在 latent 空间做扩散？",
    answer: `结论：Stable Diffusion（LDM）用 VAE 把图像压缩到低维 latent 空间，在 latent 上做 Diffusion，再用 VAE 解码回像素。大幅降低计算量，且用 CLIP 文本嵌入做条件控制生成。

实际案例：Stability AI 开源 SD 模型推动 AIGC 爆发；字节即梦、阿里通义万相基于 LDM 做文生图。ControlNet 加空间控制。

\`\`\`python
from diffusers import StableDiffusionPipeline
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
img = pipe("a cat on the moon", num_inference_steps=30).images[0]
# latent 空间扩散：512x512 图 → 64x64x4 latent
\`\`\`

踩坑：latent 压缩损失高频细节；文本编码需 CLIP；负向 prompt 提升质量。`,
    keyPoints: ["VAE 压缩到 latent 扩散", "CLIP 文本条件", "计算量大降"],
    followUps: ["ControlNet 如何加控制？", "SDXL 改进？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-116",
    nodeId: "ai-cv-generative",
    question: "条件生成：ControlNet / IP-Adapter / Img2Img 原理？",
    answer: `结论：ControlNet 在冻结的 SD U-Net 上加可训练副本，用边缘/深度/姿态等条件图引导生成空间结构。IP-Adapter 用图像嵌入做参考风格迁移。Img2Img 对输入图加部分噪声再去噪保持结构。

实际案例：字节即梦用 ControlNet 做姿态生成；阿里鹿班用条件生成做商品图。设计师用 ControlNet 控线稿生成。

\`\`\`python
from diffusers import ControlNetModel, StableDiffusionControlNetPipeline
controlnet = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-canny")
pipe = StableDiffusionControlNetPipeline.from_pretrained("SD1.5", controlnet)
img = pipe("room", image=canny_edge_map).images[0]
\`\`\`

踩坑：控制强度需调；多条件叠加需 MultiControlNet；条件图需预处理。`,
    keyPoints: ["ControlNet 可训练副本+条件图", "IP-Adapter 图像嵌入参考", "Img2Img 部分加噪保结构"],
    followUps: ["T2I-Adapter 区别？", "多条件如何融合？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-117",
    nodeId: "ai-cv-generative",
    question: "FID / IS 评估指标原理？生成模型如何评估质量与多样性？",
    answer: `结论：IS（Inception Score）用 Inception 网络提取生成图特征，衡量生成清晰度（条件熵低）和多样性（边缘熵高）。FID 计算生成图与真实图在 Inception 特征空间的 Fréchet 距离，越低越接近真实分布。FID 比 IS 更鲁棒。

实际案例：阿里/字节用 FID 评估文生图模型质量；论文标配 FID。FID 需大量样本才稳定。

\`\`\`python
from torchmetrics.image.fid import FrechetInceptionDistance
fid = FrechetInceptionDistance(feature=2048)
fid.update(real_imgs, real=True)
fid.update(fake_imgs, real=False)
print(fid.compute())  # 越低越好
# IS: 清晰度 × 多样性
\`\`\`

踩坑：FID 样本少时不稳定；IS 易被对抗样本欺骗；需固定 Inception 版本。`,
    keyPoints: ["FID 特征空间 Fréchet 距离", "IS 清晰度×多样性", "FID 比 IS 鲁棒"],
    followUps: ["CLIPScore 评估？", "Precision/Recall 评估？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-118",
    nodeId: "ai-cv-generative",
    question: "AIGC 图像生成工业落地：文生图、图生图、虚拟试衣、广告创意如何做？",
    answer: `结论：AIGC 落地需结合业务场景。文生图用 SD+ControlNet；图生图用 Img2Img 保结构；虚拟试衣用 Diffusion+服装迁移；广告创意用 LoRA 微调品牌风格+批量生成。核心是可控性和质量。

实际案例：阿里鹿班用 AIGC 批量生成电商商品图；字节即梦做文生图/图生视频；腾讯广告用 AIGC 生成素材。LoRA 微调降本。

\`\`\`python
# LoRA 微调品牌风格
from peft import LoraConfig
config = LoraConfig(r=16, target_modules=["to_q","to_v"])
# 用品牌图集微调后批量生成
for prompt in prompts:
    img = pipe(prompt, lora_scale=0.8).images[0]
\`\`\`

踩坑：版权与合规审核；人脸生成需鉴伪；商用需过滤违规内容。`,
    keyPoints: ["LoRA 微调品牌风格", "ControlNet 可控生成", "合规与鉴伪"],
    followUps: ["LoRA 微调 SD？", "AI 鉴伪方法？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 19. ai-nlp-fundamentals =====
  {
    id: "ai-119",
    nodeId: "ai-nlp-fundamentals",
    question: "BPE / WordPiece / SentencePiece 分词原理？为何用子词？",
    answer: `结论：BPE 从字符出发合并最高频字节对逐步构建词表；WordPiece 用似然增益选合并对（BERT 用）；SentencePiece 把文本当原始字节流支持任意语言。子词兼顾词表大小和 OOV，罕见词拆成子词。

实际案例：BERT 用 WordPiece；GPT 用 BPE；LLaMA 用 SentencePiece BPE。字节级 BPE 覆盖所有 Unicode。

\`\`\`python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
tok = Tokenizer(BPE(unk_token="[UNK]"))
tok.train_from_iterator(texts, BpeTrainer(vocab_size=30000))
ids = tok.encode("unbelievable").ids  # 拆成 un+believe+able
\`\`\`

踩坑：词表大小影响显存和速度；中文需考虑是否分词；特殊 token 需预留。`,
    keyPoints: ["BPE 合并高频字节对", "WordPiece 似然增益", "子词解决 OOV"],
    followUps: ["Unigram LM 分词？", "字节级 vs 字符级？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-120",
    nodeId: "ai-nlp-fundamentals",
    question: "Word2Vec 原理？CBOW 与 Skip-gram 区别？负采样作用？",
    answer: `结论：Word2Vec 用浅层神经网络学词向量。CBOW 用上下文预测中心词，Skip-gram 用中心词预测上下文。负采样用随机负样本近似 softmax 降低计算量。Skip-gram 对低频词更好。

实际案例：早期推荐/搜索用 Word2Vec 做用户行为序列向量化（item2vec）；腾讯 AI Lab 开源大规模词向量。

\`\`\`python
from gensim.models import Word2Vec
model = Word2Vec(sentences, vector_size=100, window=5, min_count=2, sg=1, negative=5)
# sg=1 Skip-gram, negative=5 负采样
print(model.wv.most_similar("国王", topn=3))
# 国王-男人+女人≈女王（词向量类比）
\`\`\`

踩坑：窗口大小影响语义/语法偏好；低频词需调 min_count；静态向量无法消歧。`,
    keyPoints: ["CBOW 上下文预测中心词", "Skip-gram 中心词预测上下文", "负采样降计算"],
    followUps: ["Hierarchical Softmax？", "item2vec 应用？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-121",
    nodeId: "ai-nlp-fundamentals",
    question: "GloVe 与 FastText 原理？相比 Word2Vec 有何改进？",
    answer: `结论：GloVe 基于全局共现矩阵分解学词向量，利用词共现统计信息；FastText 在 Word2Vec 基础上用子词 n-gram 向量求和，能处理 OOV 和形态学。FastText 对形态丰富语言更好。

实际案例：FastText 常用于文本分类基线（速度快）；GloVe 在语义类比任务表现好。Facebook 开源多语言 FastText。

\`\`\`python
import fasttext
model = fasttext.train_supervised("train.txt", epoch=25, lr=1.0, wordNgrams=2)
# wordNgrams 用子词 n-gram，预测时拼 n-gram 向量
labels, probs = model.predict("文本内容")
\`\`\`

踩坑：GloVe 共现矩阵构建耗内存；FastText n-gram 增大模型；均无法解决多义词。`,
    keyPoints: ["GloVe 全局共现矩阵分解", "FastText 子词 n-gram", "FastText 处理 OOV"],
    followUps: ["共现矩阵如何构建？", "FastText 分类优势？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-122",
    nodeId: "ai-nlp-fundamentals",
    question: "词向量如何评估？ analogy / similarity / 下游任务？静态向量局限？",
    answer: `结论：词向量评估分内在（analogy 类比 king-man+woman=queen、similarity 相似度相关）和外在（下游任务如分类、NER 的效果）。静态向量无法消歧（"苹果"水果 vs 公司），被上下文向量（BERT）取代。

实际案例：阿里/百度搜索用词向量做召回；评估用 SimLex-999/MEN 数据集。下游任务提升才是终极标准。

\`\`\`python
from gensim.models import KeyedVectors
wv = KeyedVectors.load_word2vec_format("vec.bin", binary=True)
# analogy 评估
result = wv.evaluate_word_analogies("questions-words.txt")
# similarity 评估
corr = wv.evaluate_word_pairs("simlex.csv")  # Spearman 相关
\`\`\`

踩坑：内在评估好不代表下游好；领域词向量需领域语料训练；OOV 影响评估。`,
    keyPoints: ["内在 analogy/similarity 评估", "外在下游任务评估", "静态向量无法消歧"],
    followUps: ["上下文向量优势？", "领域适应方法？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-123",
    nodeId: "ai-nlp-fundamentals",
    question: "中文分词（结巴/HanLP）与预训练分词有何不同？中文 NLP 特殊性？",
    answer: `结论：中文无空格分隔需分词，传统用 HMM/CRF（结巴），现代用字级别或 SentencePiece。中文 NLP 特殊性：分词歧义、未登录词、字词粒度权衡。BERT-Chinese 用字级别避免分词误差。

实际案例：百度搜索用字+词混合分词；电商搜索新词多需动态词库。中文预训练多用字级别。

\`\`\`python
import jieba
words = jieba.cut("自然语言处理很有趣", cut_all=False)
# 精确模式：自然语言/处理/很/有趣
jieba.add_word("自然语言处理")  # 加自定义词
# BERT-Chinese 字级别：自/然/语/言/处/理
\`\`\`

踩坑：分词粒度影响搜索召回；新词需动态更新词库；字级别词表小但序列长。`,
    keyPoints: ["中文无空格需分词", "字级别避免分词误差", "分词粒度影响下游"],
    followUps: ["HMM/CRF 分词原理？", "字 vs 词粒度取舍？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-124",
    nodeId: "ai-nlp-fundamentals",
    question: "子词与 OOV 处理？UNK 词如何应对？",
    answer: `结论：OOV（未登录词）传统用 UNK 替换损失信息，子词（BPE/WordPiece）把罕见词拆成已知子词避免 UNK。字节级编码覆盖所有字符。OOV 对低资源语言和拼写变体尤其重要。

实际案例：多语言模型用字节级 BPE 处理所有语言；搜索 query 常有拼写错误和生僻词，子词提升鲁棒性。

\`\`\`python
# BPE 拆分 OOV
tok.encode("tokenization").tokens  # token + ization
# 字节级：任何字符都能表示
# 传统 UNK 方案
vocab = set(["好","天气"])
text = "好天气啊"  # "啊" 不在词表 → [UNK]
\`\`\`

踩坑：过度拆分导致序列过长；OOV 在 NER/搜索影响召回；需平衡词表与拆分粒度。`,
    keyPoints: ["子词拆分避免 UNK", "字节级覆盖所有字符", "OOV 影响低资源语言"],
    followUps: ["词表大小如何选？", "字节级优劣？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-125",
    nodeId: "ai-nlp-fundamentals",
    question: "文本表示发展脉络：One-hot → Word2Vec → ELMo → BERT → LLM？",
    answer: `结论：文本表示从离散 one-hot（维度灾难、无语义）→ 分布式静态词向量 Word2Vec/GloVe（有语义但无法消歧）→ 上下文向量 ELMo（双向 LSTM 消歧）→ BERT（Transformer 强上下文）→ LLM（生成式通用表示）。每代解决上代局限。

实际案例：百度/阿里搜索表示从 Word2Vec 演进到 BERT 再到 LLM embedding；表示能力提升带来召回排序效果提升。

\`\`\`python
# 发展脉络对比
onehot = [0,0,1,0]  # 离散无语义
w2v = model.wv["苹果"]  # 静态不消歧
elmo = elmo_model("苹果手机")["苹果"]  # 上下文消歧
bert = bert_model("苹果手机")[1]  # Transformer 强上下文
# LLM: embedding = llm.encode("苹果手机")  # 通用表示
\`\`\`

踩坑：静态向量无法消歧；BERT 计算量大需蒸馏；LLM embedding 需对比学习训练。`,
    keyPoints: ["one-hot 无语义", "Word2Vec 静态不消歧", "BERT/LLM 上下文表示"],
    followUps: ["ELMo 原理？", "LLM embedding 如何训练？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 20. ai-nlp-embeddings =====
  {
    id: "ai-126",
    nodeId: "ai-nlp-embeddings",
    question: "BERT 的三种嵌入（Token/Segment/Position）如何拼接？位置编码原理？",
    answer: `结论：BERT 输入=Token Embedding+Segment Embedding（区分句子 A/B）+Position Embedding（绝对位置，可学习），三者相加。BERT 用可学习绝对位置编码，固定 512 长度；RoPE 用旋转位置编码支持外推。

实际案例：百度文心、阿里通义都用 BERT 式嵌入。RoPE 在 LLaMA/Qwen 中替代绝对位置支持长上下文。

\`\`\`python
import torch.nn as nn
class BertEmbeddings(nn.Module):
    def __init__(self, vocab, hidden, max_len=512, types=2):
        self.word = nn.Embedding(vocab, hidden)
        self.position = nn.Embedding(max_len, hidden)
        self.token_type = nn.Embedding(types, hidden)
    def forward(self, ids, types):
        pos = torch.arange(ids.size(1))
        return self.word(ids)+self.position(pos)+self.token_type(types)
\`\`\`

踩坑：BERT 最大 512 需截断；绝对位置不能外推；Segment 对单句任务置 0。`,
    keyPoints: ["Token+Segment+Position 相加", "BERT 可学习绝对位置", "RoPE 支持外推"],
    followUps: ["RoPE 原理？", "ALiBi 位置编码？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-127",
    nodeId: "ai-nlp-embeddings",
    question: "SBERT 句向量原理？为何 BERT 直接取 CLS 不适合语义相似度？",
    answer: `结论：BERT 预训练目标非语义相似度，直接用 CLS 或 mean pooling 的向量各向异性（占少数维度、不平坦），余弦相似度差。SBERT 用孪生网络+对比/回归损失微调，输出高质量句向量。

实际案例：阿里/百度搜索用 SBERT 做语义召回；RAG 用 SBERT 做文档检索。Sentence-Transformers 库提供开箱模型。

\`\`\`python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("BAAI/bge-small-zh")
emb = model.encode(["我爱编程","编程使我快乐"])
sim = model.similarity(emb[0], emb[1])  # 余弦相似度
# 孪生：两句共享 encoder，输出向量算 cos
\`\`\`

踩坑：BERT CLS 向量各向异性需白化/对比学习；句向量需在业务数据微调；负样本采样影响效果。`,
    keyPoints: ["BERT CLS 各向异性不适合相似度", "SBERT 孪生+对比微调", "mean pooling 常用"],
    followUps: ["各向异性如何度量？", "BGE 模型优势？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-128",
    nodeId: "ai-nlp-embeddings",
    question: "SimCSE 对比学习原理？无监督和有监督版本区别？",
    answer: `结论：SimCSE 用对比学习训句向量。无监督版对同一句两次 dropout 得到正对，batch 内其他句为负对；有监督版用 NLI 数据集的蕴含句为正对、矛盾句为困难负对。InfoNCE 损失拉近正对推远负对。

实际案例：字节/阿里搜索用 SimCSE 训领域句向量；GTE/BGE 系列用对比学习+困难负样本。

\`\`\`python
# 无监督 SimCSE：同一句两次 dropout
z1 = encoder(sent, dropout=0.1)
z2 = encoder(sent, dropout=0.1)
# InfoNCE：z1 与 z2 为正，batch 内其他为负
sim = z1 @ z2.T / 0.05
loss = cross_entropy(sim, torch.arange(batch))
\`\`\`

踩坑：dropout 比例敏感；batch size 影响负样本数；困难负样本提升区分度。`,
    keyPoints: ["dropout 构造正对", "InfoNCE 拉近正推远负", "NLI 困难负样本"],
    followUps: ["对比学习温度系数？", "困难负样本如何选？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-129",
    nodeId: "ai-nlp-embeddings",
    question: "向量数据库（FAISS/Milvus）原理？ANN 近似最近邻如何加速检索？",
    answer: `结论：向量检索用 ANN（近似最近邻）加速。FAISS 用乘积量化（PQ）压缩向量+IVF 倒排索引加速；Milvus 支持 HNSW 图索引。IVF 先聚类再桶内搜索，HNSW 构建分层图跳表式搜索，PQ 降低内存。

实际案例：抖音用 Milvus 做视频召回；淘宝用 FAISS 做商品向量检索。十亿级向量毫秒返回。

\`\`\`python
import faiss
index = faiss.IndexIVFPQ(quantizer, dim, nlist=4096, m=16, nbits=8)
index.train(vectors); index.add(vectors)
D, I = index.search(query, k=10)  # 近似 top-k
# HNSW：图索引召回率高但内存大
\`\`\`

踩坑：PQ 量化损失精度需调 m/nbits；IVF nlist 影响召回速度权衡；需重建索引更新向量。`,
    keyPoints: ["PQ 乘积量化压缩", "IVF 倒排桶内搜索", "HNSW 分层图索引"],
    followUps: ["HNSW 原理？", "PQ 如何量化？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-130",
    nodeId: "ai-nlp-embeddings",
    question: "语义检索工业应用：召回-粗排-精排漏斗如何设计？",
    answer: `结论：语义检索用漏斗架构：召回（双塔 ANN 毫秒召回千级）→粗排（轻量交叉网络百级）→精排（BERT 交叉注意力十级）。双塔预计算向量离线建库，交叉模型在线算交互特征。

实际案例：百度搜索召回用双塔+倒排融合；淘宝搜索召回多路（向量+行为+类目）后粗排精排。抖音搜索召回 query-doc 双塔。

\`\`\`python
# 双塔召回：query/doc 各自编码后 ANN
q_emb = query_tower(query)  # 离线预计算 doc_emb
docs = faiss.search(q_emb, k=1000)
# 精排：BERT 交叉注意力
score = bert_cross(query, doc_candidates)[:10]
\`\`\`

踩坑：双塔无交互精度低需蒸馏；召回多路需去重融合；精排特征穿越需注意。`,
    keyPoints: ["双塔召回 ANN 毫秒", "粗排轻量交叉", "精排 BERT 交叉注意力"],
    followUps: ["双塔如何蒸馏交叉模型？", "多路召回如何融合？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-131",
    nodeId: "ai-nlp-embeddings",
    question: "ELMo 原理？为何说它是上下文向量的里程碑？",
    answer: `结论：ELMo 用双向 LSTM（前向+后向）学上下文词向量，每个词的表示是各层 LSTM 隐状态的加权求和。相比静态 Word2Vec，ELMo 能根据上下文消歧（"苹果"在水果/公司语境向量不同），是上下文向量里程碑。

实际案例：ELMo 曾用于问答/NER 提升 SOTA；后被 BERT 的 Transformer 取代。阿里早期搜索用过 ELMo。

\`\`\`python
# ELMo：双向 LSTM 各层加权
class ELMo(nn.Module):
    def forward(self, tokens):
        # 前向 LSTM + 后向 LSTM，拼接多层隐状态
        fwd = self.fwd_lstm(tokens)  # 各层隐状态
        bwd = self.bwd_lstm(tokens.flip(1))
        return self.gamma * (w1*fwd + w2*bwd)  # 可学习权重
\`\`\`

踩坑：LSTM 长程依赖弱于 Transformer；ELMo 是特征向量非微调；加权层权重需学。`,
    keyPoints: ["双向 LSTM 上下文消歧", "多层隐状态加权求和", "特征向量非微调"],
    followUps: ["ELMo vs BERT？", "为什么 Transformer 取代 LSTM？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-132",
    nodeId: "ai-nlp-embeddings",
    question: "句向量聚合方法 CLS / Mean / Max pooling 对比？如何选？",
    answer: `结论：CLS pooling 取 [CLS] token 向量；Mean pooling 对所有 token 向量求平均；Max pooling 取逐维最大。Mean pooling 最稳定常用，CLS 需在预训练时对齐，Max 对关键词敏感。Sentence-BERT 实验表明 Mean 最优。

实际案例：BGE/E5 句向量模型默认 Mean pooling；部分任务用 CLS+MLP。Mean pooling 对长文本更鲁棒。

\`\`\`python
import torch
def mean_pool(last_hidden, mask):
    mask = mask.unsqueeze(-1).expand(last_hidden.size())
    return (last_hidden * mask).sum(1) / mask.sum(1)
def cls_pool(last_hidden):
    return last_hidden[:, 0]  # [CLS]
# SBERT 推荐 mean pooling
\`\`\`

踩坑：CLS 未经对齐训练效果差；Mean 需 mask 忽略 padding；Max 对噪声 token 敏感。`,
    keyPoints: ["Mean pooling 最稳定", "CLS 需预训练对齐", "Max 对关键词敏感"],
    followUps: ["Attention pooling？", "如何对齐 CLS？"],
    favorited: false,
    bigTech: false,
  },
  // ===== 21. ai-nlp-sequence =====
  {
    id: "ai-133",
    nodeId: "ai-nlp-sequence",
    question: "NER 命名实体识别原理？BIO/BIOES 标注体系？",
    answer: `结论：NER 把命名实体识别转为序列标注，用 BIO（B 实体首/I 实体内/O 非实体）或 BIOES（E 实体尾/S 单字实体）标注每个 token，模型预测标签序列。BERT+CRF 是主流方案。

实际案例：阿里达摩院医疗 NER 抽取症状/药品；百度搜索 NER 抽取 query 实体做意图理解。BIOES 比 BIO 区分边界更清晰。

\`\`\`python
from transformers import AutoModelForTokenClassification
model = AutoModelForTokenClassification.from_pretrained("bert-base", num_labels=9)
# BIO: O, B-PER, I-PER, B-ORG, I-ORG, ...
logits = model(input_ids).logits  # (B, L, 9)
preds = logits.argmax(-1)  # 每个 token 的标签
\`\`\`

踩坑：嵌套实体 BIO 无法表示需用 span；中文需字级别标注；实体边界评估要 entity-level。`,
    keyPoints: ["BIO/BIOES 标注体系", "BERT+CRF 主流", "序列标注转分类"],
    followUps: ["嵌套实体如何处理？", "Span-based NER？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-134",
    nodeId: "ai-nlp-sequence",
    question: "CRF 条件随机场在序列标注的作用？为何比 softmax 好？",
    answer: `结论：CRF 在序列标注中建模标签转移约束（如 I-PER 不能接 B-ORG），全局归一化整个标签序列。相比逐 token 独立 softmax，CRF 考虑标签间依赖，避免非法转移（如 B 后直接接非 I）。BERT+CRF 是 NER 经典。

实际案例：医疗/法律 NER 用 BERT+CRF 提升边界准确率；百度 NER 用 CRF 约束标签转移。

\`\`\`python
from torchcrf import CRF
crf = CRF(num_tags=9, batch_first=True)
emissions = bert(input_ids)  # (B, L, 9)
loss = -crf(emissions, tags, mask)  # 全局归一化
pred = crf.decode(emissions, mask)  # 最优路径
\`\`\`

踩坑：CRF 增加训练时间；转移矩阵需初始化；BERT 强后 CRF 提升递减但仍稳边界。`,
    keyPoints: ["CRF 建模标签转移约束", "全局归一化避免非法转移", "BERT+CRF 经典组合"],
    followUps: ["CRF 与 HMM 区别？", "BERT 强后还需 CRF？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-135",
    nodeId: "ai-nlp-sequence",
    question: "BERT 如何微调序列标注任务？输入输出如何设计？",
    answer: `结论：BERT 微调序列标注：输入 token 序列，取最后一层隐状态每个 token 对应位置接线性分类头预测 BIO 标签，可选加 CRF。WordPiece 子词需对齐到原词标注（取首子词或平均）。

实际案例：阿里/腾讯用 BERT 微调 NER/POS；医疗 NER 用领域 BERT（如百度 PCL-MedBERT）提升效果。

\`\`\`python
class BertNER(nn.Module):
    def __init__(self, bert, num_labels):
        self.bert = bert; self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(768, num_labels)
    def forward(self, input_ids, mask):
        seq_out = self.bert(input_ids, mask).last_hidden_state
        return self.classifier(self.dropout(seq_out))
# 子词对齐：只取每词首子词预测
\`\`\`

踩坑：WordPiece 子词需对齐标注；学习率需小（2e-5）；长文本需滑窗。`,
    keyPoints: ["BERT 隐状态+线性头", "WordPiece 子词对齐标注", "可选 CRF"],
    followUps: ["领域 BERT 如何训练？", "长文本如何滑窗？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-136",
    nodeId: "ai-nlp-sequence",
    question: "文本分类：BERT vs FastText vs TextCNN 选型？",
    answer: `结论：FastText 速度极快适合基线和海量数据；TextCNN 用卷积提局部 n-gram 特征适合短文本；BERT 效果最好但慢，适合精度要求高。工业上 BERT 蒸馏/量化后上线，FastText 做冷启动基线。

实际案例：阿里商品分类用 BERT 蒸馏上线；垃圾评论用 FastText 快速过滤；情感分析用 TextCNN。淘宝类目预测亿级商品用 FastText。

\`\`\`python
# FastText 极速分类
import fasttext
model = fasttext.train_supervised("train.txt", epoch=25, wordNgrams=2)
# BERT 分类：取 CLS 接分类头
logits = classifier(bert(input_ids).last_hidden_state[:,0])
\`\`\`

踩坑：BERT 推理慢需蒸馏；类别不平衡用 focal loss；短文本 TextCNN 够用无需 BERT。`,
    keyPoints: ["FastText 快速基线", "TextCNN 短文本 n-gram", "BERT 精度高需蒸馏"],
    followUps: ["BERT 蒸馏方法？", "TextCNN 结构？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-137",
    nodeId: "ai-nlp-sequence",
    question: "序列标注评估：token-level F1 vs entity-level F1 区别？",
    answer: `结论：token-level F1 逐 token 算 P/R/F1，会高估效果（部分匹配也算对）；entity-level F1 要求实体边界和类型完全正确才算对，更严格贴近业务。NER 标准用 entity-level F1（exact match）。

实际案例：医疗 NER 评估必须 entity-level（边界错影响下游抽取）；百度 NER 评测用 strict F1。宽松评估会掩盖边界问题。

\`\`\`python
def entity_f1(preds, golds):
    pred_ents = extract_entities(preds)  # {(type, start, end)}
    gold_ents = extract_entities(golds)
    tp = len(pred_ents & gold_ents)
    p = tp / len(pred_ents); r = tp / len(gold_ents)
    return 2*p*r/(p+r) if p+r else 0
# entity: 边界+类型完全匹配才算
\`\`\`

踩坑：token F1 高估效果；嵌套实体评估需 span-level；半实体匹配不算对。`,
    keyPoints: ["token-level 高估效果", "entity-level 严格边界匹配", "NER 用 entity F1"],
    followUps: ["部分匹配评估？", "MUC 评估？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-138",
    nodeId: "ai-nlp-sequence",
    question: "医疗/法律 NER 工业应用有何挑战？领域适配如何做？",
    answer: `结论：医疗/法律 NER 实体专业术语多、标注需专家、数据少。用领域 BERT（在领域语料继续预训练）+少量标注微调+规则辅助。医疗实体如药品/症状/剂量，法律实体如法条/罪名。

实际案例：平安好医生用医疗 NER 抽取病历结构化；阿里通义法睿用法律 NER 抽取案情要素。领域 BERT 比通用 BERT 提升明显。

\`\`\`python
# 领域 BERT：在医疗语料继续 MLM 预训练
from transformers import BertForMaskedLM
model = BertForMaskedLM.from_pretrained("bert-base")
trainer.train(medical_corpus)  # 继续预训练
# 再用少量标注 NER 微调
ner_model = AutoModelForTokenClassification.from_pretrained("./med-bert")
\`\`\`

踩坑：标注成本高需主动学习；领域词典+规则提升召回；实体归一化到标准库。`,
    keyPoints: ["领域 BERT 继续预训练", "少量标注微调+规则", "专家标注成本高"],
    followUps: ["领域自适应预训练？", "主动学习选样本？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-139",
    nodeId: "ai-nlp-sequence",
    question: "多任务序列标注：NER+POS+分类联合训练如何做？",
    answer: `结论：多任务学习共享 BERT encoder，各任务接独立任务头（NER 头/POS 头/分类头），联合损失加权。共享底层提升泛化、减少推理成本。loss 权重需平衡防止某任务主导。

实际案例：百度搜索 query 理解多任务（意图分类+实体识别+词法）；阿里商品理解多标签分类+属性抽取联合。

\`\`\`python
class MultiTaskBert(nn.Module):
    def __init__(self, bert):
        self.bert = bert
        self.ner_head = nn.Linear(768, 9)  # NER
        self.pos_head = nn.Linear(768, 12)  # POS
        self.cls_head = nn.Linear(768, 5)  # 分类
    def forward(self, ids):
        h = self.bert(ids).last_hidden_state
        return self.ner_head(h), self.pos_head(h), self.cls_head(h[:,0])
loss = w1*ner_loss + w2*pos_loss + w3*cls_loss
\`\`\`

踩坑：loss 权重需调；负迁移需任务分组；共享层 vs 私有层权衡。`,
    keyPoints: ["共享 encoder+独立任务头", "联合损失加权", "共享提升泛化减成本"],
    followUps: ["负迁移如何处理？", "GradNorm 自动加权？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 22. ai-nlp-generation =====
  {
    id: "ai-140",
    nodeId: "ai-nlp-generation",
    question: "文本摘要：抽取式 vs 生成式？各自适用场景？",
    answer: `结论：抽取式从原文选关键句组合（TextRank/BERTScore 选句），保证忠实但可能不连贯；生成式用 Seq2Seq/LLM 生成新句子，更连贯流畅但可能幻觉。工业上重要场景（新闻/法律）偏抽取保忠实，长文用生成式+引用。

实际案例：腾讯新闻用抽取式摘要快速生成；字节飞书妙记用 LLM 生成会议纪要。阿里通义用 LLM 做公文摘要。

\`\`\`python
# 抽取式：BERT 打分选句
from summa.summarizer import summarize
ext_sum = summarize(text, ratio=0.3)  # TextRank
# 生成式：LLM 生成
from transformers import pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
gen_sum = summarizer(text, max_length=130)[0]["summary_text"]
\`\`\`

踩坑：生成式幻觉需引用溯源；抽取式句子间不连贯；长文需分段摘要再汇总。`,
    keyPoints: ["抽取式选句保忠实", "生成式流畅但可能幻觉", "重要场景偏抽取"],
    followUps: ["TextRank 原理？", "如何减少生成式幻觉？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-141",
    nodeId: "ai-nlp-generation",
    question: "机器翻译 Seq2Seq 原理？注意力机制如何改进？",
    answer: `结论：Seq2Seq 用 encoder 编码源句为向量，decoder 逐步生成目标句。早期用最后隐状态做上下文瓶颈明显，注意力机制让 decoder 每步关注源句不同位置，大幅提升长句翻译。Transformer 用自注意力完全替代 RNN。

实际案例：百度翻译/有道用 Transformer 做机器翻译；阿里达摩院做多语言翻译。注意力解决长句信息丢失。

\`\`\`python
# Seq2Seq + 注意力
class AttnDecoder(nn.Module):
    def forward(self, dec_h, enc_outs):
        scores = dec_h @ enc_outs.T  # 对齐分数
        attn = softmax(scores / sqrt(d))
        ctx = attn @ enc_outs  # 加权上下文
        return torch.cat([dec_h, ctx])  # 生成
\`\`\`

踩坑：RNN 序列长时慢；beam search 平衡质量速度；低资源语言需回译数据增强。`,
    keyPoints: ["Seq2Seq encoder-decoder", "注意力解决长句瓶颈", "Transformer 自注意力"],
    followUps: ["Beam search 翻译？", "回译数据增强？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-142",
    nodeId: "ai-nlp-generation",
    question: "LLM 解码策略：Greedy / Beam Search / Top-k / Top-p / Temperature 原理？",
    answer: `结论：Greedy 每步取最高概率（易重复）；Beam Search 维护 k 个候选序列取整体最优（确定性但可能通用）；Top-k 限制候选为前 k 个；Top-p（nucleus）限制累计概率 p 的候选（自适应）；Temperature 缩放 logits 调多样性。

实际案例：字节豆包/阿里通义用 top-p=0.9+temperature=0.7 平衡质量多样性；代码生成用低 temperature 求精确；创意写作用高 temperature。

\`\`\`python
import torch.nn.functional as F
def sample(logits, top_k=0, top_p=0.9, temp=0.7):
    logits = logits / temp  # 温度缩放
    if top_k > 0:
        idx = logits.topk(top_k).indices
        logits[~torch.isin(torch.arange(len(logits)), idx)] = -float("inf")
    if top_p < 1:  # 核采样
        sorted_p = sorted(logits.exp().tolist(), reverse=True)
        cum = 0; thresh = next(p for p in sorted_p if (cum:=cum+p)>top_p)
        logits[logits.exp() < thresh] = -float("inf")
    return torch.multinomial(logits.exp(), 1)
\`\`\`

踩坑：高 temperature 幻觉多；beam search 生成重复通用；top-p 比 top-k 更自适应。`,
    keyPoints: ["Temperature 缩放调多样性", "Top-p 核采样自适应", "Beam Search 整体最优"],
    followUps: ["对比解码 DPO？", "repetition penalty？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-143",
    nodeId: "ai-nlp-generation",
    question: "BLEU / ROUGE 评估指标原理？生成任务如何评估？",
    answer: `结论：BLEU 看生成文本中 n-gram 有多少出现在参考译文中（精确率），对短句惩罚，主要用于机器翻译。ROUGE 看参考文本中 n-gram 有多少被生成覆盖（召回率），主要用于摘要。二者都基于 n-gram 匹配，无法衡量语义。

实际案例：百度翻译评测用 BLEU；摘要评测用 ROUGE-L。LLM 时代需人工+LLM-as-judge 补充语义评估。

\`\`\`python
from sacrebleu import corpus_bleu
from rouge import Rouge
bleu = corpus_bleu(hyps, [refs])  # BLEU-4
rouge = Rouge()
scores = rouge.get_scores(hyps, refs)  # ROUGE-1/2/L
# ROUGE-L 基于最长公共子序列
\`\`\`

踩坑：BLEU 对同义表达不友好；ROUGE 不衡量连贯性；需人工评估补充。`,
    keyPoints: ["BLEU 精确率+短句惩罚", "ROUGE 召回率", "n-gram 匹配无法衡量语义"],
    followUps: ["BERTScore 评估？", "LLM-as-judge？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-144",
    nodeId: "ai-nlp-generation",
    question: "对话系统：任务型 vs 开放域（Chatbot）架构区别？",
    answer: `结论：任务型对话（订票/客服）用 pipeline：NLU 意图识别+槽位填充→DST 状态追踪→DPL 策略→NLG 生成，目标完成特定任务。开放域对话（闲聊）用端到端生成模型（LLM），目标是流畅有趣。LLM 正在统一两者。

实际案例：阿里小蜜/腾讯客服用任务型对话处理工单；字节豆包/百度文心用 LLM 做开放域+function calling 做任务。

\`\`\`python
# 任务型：pipeline
intent = nlu(query)  # 意图+槽位
state = dst.update(state, intent)  # 状态追踪
action = policy(state)  # 策略选动作
resp = nlg(action)  # 生成回复
# LLM 统一：function calling
tools = [{"name":"search_order","params":{}}]
resp = llm.chat(query, tools=tools)
\`\`\`

踩坑：任务型槽位继承复杂；开放域需安全护栏；LLM function calling 需工具描述清晰。`,
    keyPoints: ["任务型 pipeline NLU-DST-DPL-NLG", "开放域端到端 LLM", "LLM 用 function calling 统一"],
    followUps: ["DST 状态追踪？", "RAG 对话？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-145",
    nodeId: "ai-nlp-generation",
    question: "代码生成：LLM 如何做代码补全/生成？如何保证正确性？",
    answer: `结论：代码生成用代码语料训练的 LLM（Codex/CodeLlama/DeepSeek-Coder），预测下一 token。保证正确性靠：训练数据高质量、上下文填充（函数签名/注释）、测试驱动生成（生成+运行测试反馈）、自我修复（报错重试）。

实际案例：字节 MarsCode/Trae、阿里通义灵码用代码 LLM 做补全；GitHub Copilot 用 Codex。DeepSeek-Coder 开源性能强。

\`\`\`python
# 代码补全：填充上下文
prompt = "def binary_search(arr, target):\\n    '''二分查找'''\\n"
code = llm.generate(prompt, temperature=0.2)  # 低温度求精确
# 测试驱动：生成+运行+修复
for _ in range(3):
    if run_tests(code): break
    code = llm.fix(code, error_msg)
\`\`\`

踩坑：代码 LLM 需长上下文；生成代码需安全审计；私有代码需本地部署保隐私。`,
    keyPoints: ["代码语料训练 LLM", "低 temperature 求精确", "测试驱动+自我修复"],
    followUps: ["FIM 填空补全？", "代码 LLM 如何评估？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-146",
    nodeId: "ai-nlp-generation",
    question: "LLM 幻觉（Hallucination）问题？如何缓解？",
    answer: `结论：幻觉指 LLM 生成看似合理但不符合事实的内容，源于训练数据噪声、知识截止、概率生成本质。缓解方法：RAG 检索增强提供事实依据、RLHF 对齐减少编造、自一致性多次采样投票、事实核查后处理、置信度校准。

实际案例：百度文心/阿里通义用 RAG 减少幻觉；医疗/法律场景必须 RAG+人工审核。字节豆包用搜索增强。

\`\`\`python
# RAG 缓解幻觉：检索事实再生成
docs = retrieve(query, vector_db)  # 检索相关文档
prompt = f"基于以下资料回答：{docs}\\n问题：{query}"
answer = llm.generate(prompt)
# 自一致性：多次采样取多数
answers = [llm.generate(query, temp=0.7) for _ in range(5)]
final = vote(answers)  # 投票
\`\`\`

踩坑：RAG 检索质量影响大；RLHF 可能过对齐拒答；完全消除幻觉极难需人工兜底。`,
    keyPoints: ["幻觉源于数据噪声和概率生成", "RAG 提供事实依据", "RLHF+自一致性缓解"],
    followUps: ["RAG 如何实现？", "如何评估幻觉率？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 23. ai-rec-fundamentals =====
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
  // ===== 24. ai-rec-deep =====
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
  // ===== 25. ai-rec-engineering =====
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
  // ===== 26. ai-rl-fundamentals =====
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
    answer: `结论：Policy Gradient 直接参数化策略 π_θ(a|s)，用梯度上升最大化期望回报 J(θ)。REINFORCE 用蒙特卡洛回报 G_t 估计：∇J=∇log π_θ(a|s) G_t。优势是无须价值函数、支持连续动作，但方差大方差大需 baseline 降方差。

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
  // ===== 27. ai-rl-advanced =====
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
    answer: `结论：GRPO（Group Relative Policy Optimization）对每个 prompt 采样一组回答，用组内相对优势（回答奖励减组均值）代替独立 critic 网络，省去价值模型降低显存。DeepSeek-R1 用 GRPO 训练推理能力，无需 SFT 直接 RL。

实际案例：DeepSeek-R1 用 GRPO+可验证奖励（数学/代码正确性）训练出强推理能力，成本低于 PPO。

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
    keyPoints: ["组内相对优势省 critic", "DeepSeek-R1 推理训练", "可验证奖励降成本"],
    followUps: ["GRPO vs PPO？", "可验证奖励设计？"],
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
  // ===== 28. ai-multimodal =====
  {
    id: "ai-182",
    nodeId: "ai-multimodal",
    question: "CLIP 原理？图文对比学习如何对齐？",
    answer: `结论：CLIP 用对比学习对齐图像和文本：batch 内图文正对拉近、负对推远。图像编码器（ViT/ResNet）和文本编码器（Transformer）分别编码，用 InfoNCE 损失。训练后零样本分类用文本 prompt 匹配图像。开启多模态对齐范式。

实际案例：OpenAI CLIP 成图文检索零样本基线；字节/阿里用 CLIP 做图文搜索、内容理解。Stable Diffusion 用 CLIP 文本编码器。

\`\`\`python
import torch
img_feat = image_encoder(image)  # (B, d)
text_feat = text_encoder(text)   # (B, d)
logits = img_feat @ text_feat.T / 0.07  # 相似度矩阵
labels = torch.arange(B)  # 对角线为正对
loss = (cross_entropy(logits, labels) + cross_entropy(logits.T, labels)) / 2
# 零样本分类：prompt="a photo of a {class}"
\`\`\`

踩坑：batch size 影响负样本数；温度系数敏感；需大规模数据。`,
    keyPoints: ["图文对比学习对齐", "InfoNCE 正对拉近负对推远", "零样本分类 prompt"],
    followUps: ["CLIP 如何做零样本？", "对比学习温度？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-183",
    nodeId: "ai-multimodal",
    question: "BLIP 原理？如何统一图文理解与生成？",
    answer: `结论：BLIP 用共享编码器统一图文理解（ITC 对比+ITM 匹配）和生成（LM 语言建模），加图像条件文本生成（Caption）。BLIP-2 用 Q-Former 连接冻结视觉编码器和冻结 LLM，降计算成本，支持图文问答和生成。

实际案例：阿里通义万相/字节用 BLIP-2 做图文理解生成；Salesforce 开源 BLIP 系列。Q-Former 提取图像特征给 LLM。

\`\`\`python
# BLIP-2：冻结视觉+冻结 LLM + 可训练 Q-Former
img_feat = frozen_vit(image)  # 冻结视觉编码器
queries = q_former(img_feat)  # 学习查询提取图像 token
text = frozen_llm(queries, text_prompt)  # 冻结 LLM 接收图像 token 生成
# 多任务：ITC 对比 + ITM 匹配 + LM 生成
\`\`\`

踩坑：Q-Former 需预热；冻结 LLM 限制能力；数据噪声需清洗。`,
    keyPoints: ["BLIP 统一理解与生成", "BLIP-2 Q-Former 连接", "冻结视觉+LLM 降成本"],
    followUps: ["Q-Former 原理？", "BLIP-2 vs LLaVA？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-184",
    nodeId: "ai-multimodal",
    question: "多模态对齐方法：早期融合 vs 晚期融合 vs 跨注意力？",
    answer: `结论：早期融合在输入层拼接特征（如拼接图像 token 到文本）；晚期融合各模态独立编码后融合（CLIP 对比对齐）；跨注意力融合用 cross-attention 让一模态 query 另一模态（Flamingo/LLaVA）。跨注意力最灵活效果好。

实际案例：LLaVA 用投影层把视觉 token 接入 LLM（早期融合）；Flamingo 用 cross-attention 融合视觉到语言模型。

\`\`\`python
# LLaVA：投影层早期融合
img_tokens = projection(vit(image))  # 视觉 token
inputs = torch.cat([img_tokens, text_tokens], dim=1)  # 拼接进 LLM
out = llm(inputs)
# Flamingo：cross-attention 融合
for layer in llm.layers:
    h = layer.self_attn(h)
    h = layer.cross_attn(h, img_feat)  # 跨注意力融合视觉
\`\`\`

踩坑：早期融合序列变长；跨注意力需调；模态对齐需大量数据。`,
    keyPoints: ["早期融合输入拼接", "晚期融合独立编码对齐", "跨注意力最灵活"],
    followUps: ["LLaVA 架构？", "Flamingo 原理？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-185",
    nodeId: "ai-multimodal",
    question: "VQA 视觉问答原理？如何结合图像理解和文本推理？",
    answer: `结论：VQA 给定图像和问题输出答案，需图像理解+文本推理。经典方法用图像特征+问题编码+注意力融合+分类。现代方法用多模态大模型（GPT-4V/Qwen-VL）把图像转 token 接入 LLM 生成答案，支持开放词表。

实际案例：阿里 Qwen-VL 支持图文问答/OCR/描述；百度文心一格做 VQA。医疗 VQA 辅助诊断读片。

\`\`\`python
# 经典 VQA
img_feat = vit(image)  # 图像特征
q_feat = bert(question)  # 问题编码
fused = attention(img_feat, q_feat)  # 注意力融合
answer = classifier(fused)  # 分类答案
# 多模态大模型 VQA
prompt = f"<image>{question}"
answer = qwen_vl(image, prompt)  # 生成开放答案
\`\`\`

踩坑：VQA 评估需 VQA accuracy（soft）；开放生成需人工评估；图像分辨率影响细节。`,
    keyPoints: ["图像理解+文本推理", "注意力融合特征", "MLLM 开放生成答案"],
    followUps: ["VQA accuracy？", "OCR 如何融入？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-186",
    nodeId: "ai-multimodal",
    question: "多模态大模型（GPT-4V/Qwen-VL/LLaVA）架构？如何训练？",
    answer: `结论：多模态大模型用视觉编码器（ViT）提图像特征，经投影/Q-Former 转为视觉 token，与文本 token 拼接送入 LLM。训练分阶段：1）对齐预训练（图文对学投影层）；2）指令微调（多模态对话数据）。LLaVA 是开源代表。

实际案例：GPT-4V/Claude 多模态；阿里 Qwen-VL、字节豆包视觉、清华 GLM-4V。LLaVA 开源易复现。

\`\`\`python
# LLaVA 架构与训练
class LLaVA(nn.Module):
    def __init__(self, vit, projector, llm):
        self.vit = vit; self.proj = projector; self.llm = llm
    def forward(self, image, text_ids):
        img_tok = self.proj(self.vit(image))  # 视觉 token
        inputs = torch.cat([img_tok, text_ids], 1)
        return self.llm(inputs)
# Stage1: 冻结 vit+llm 学 proj（图文对）
# Stage2: 冻结 vit 微调 proj+llm（指令数据）
\`\`\`

踩坑：视觉 token 数量影响序列长度；指令数据质量关键；高分辨率需动态切图。`,
    keyPoints: ["ViT 提特征+投影转 token", "对齐预训练+指令微调", "LLaVA 开源代表"],
    followUps: ["LLaVA-NeXT 改进？", "动态分辨率？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-187",
    nodeId: "ai-multimodal",
    question: "图文检索工业应用？CLIP embedding 如何用于搜索？",
    answer: `结论：图文检索用 CLIP 编码图像和文本到统一空间，用向量检索（FAISS/Milvus）做以文搜图/以图搜文。离线预计算图像 embedding 建库，在线编码 query 向量 ANN 检索。多模态提升搜索体验。

实际案例：字节抖音/小红书用图文检索做内容搜索；淘宝拍立淘用图像搜索商品；阿里通义做跨模态搜索。

\`\`\`python
import clip, faiss
model, preprocess = clip.load("ViT-B/32")
# 离线：预计算图像 embedding 建库
img_embs = [model.encode_image(preprocess(im)) for im in images]
index = faiss.IndexFlatIP(512); index.add(img_embs)
# 在线：文本搜图
text_emb = model.encode_text(clip.tokenize(query))
D, I = index.search(text_emb, k=10)  # 以文搜图
\`\`\`

踩坑：CLIP 领域偏通用需微调；细粒度检索需区域特征；embedding 需定期更新。`,
    keyPoints: ["CLIP 统一图文空间", "FAISS 向量检索", "以文搜图/以图搜文"],
    followUps: ["细粒度检索？", "CLIP 领域微调？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-188",
    nodeId: "ai-multimodal",
    question: "视频理解与多模态？时序建模如何做？",
    answer: `结论：视频理解需时序建模，方法：3D CNN（I3D）提时空特征、ViViT 时空 Transformer、VideoMAE 自监督。多模态视频理解（Video-LLM）把视频抽帧编码为 token 接入 LLM，支持视频问答/描述/检索。

实际案例：字节抖音用视频理解做内容标签/推荐；阿里用 Video-LLM 做视频问答。时序采样策略影响效果。

\`\`\`python
# Video-LLM：抽帧编码接入 LLM
frames = sample_frames(video, n=8)  # 均匀抽 8 帧
frame_embs = vit(frames)  # 每帧编码
video_tokens = projector(frame_embs.flatten(0,1))  # 视觉 token
answer = llm(torch.cat([video_tokens, text_tokens], 1))
# ViViT：时空 Transformer
\`\`\`

踩坑：抽帧数影响时序理解；长视频需分层采样；计算量大需降帧。`,
    keyPoints: ["3D CNN/ViViT 时空特征", "Video-LLM 抽帧接 LLM", "时序采样策略"],
    followUps: ["VideoMAE 自监督？", "长视频理解？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 29. ai-model-deploy =====
  {
    id: "ai-189",
    nodeId: "ai-model-deploy",
    question: "模型量化原理？GPTQ/AWQ/INT8 区别？",
    answer: `结论：量化把 FP16 权重转为低精度（INT8/INT4）降显存提速度。PTQ（训练后量化）无需重训：GPTQ 用二阶信息逐层量化误差补偿；AWQ 保护重要权重（按激活幅度）提升精度。INT8 动态量化简单但精度损失，INT4 需 GPTQ/AWQ。

实际案例：阿里/字节 LLM 部署用 GPTQ/AWQ INT4 量化降显存；腾讯用 INT8 量化 BERT。vLLM 支持 AWQ 量化推理。

\`\`\`python
# AWQ 量化：保护重要权重
from awq import AutoAWQForCausalLM
model = AutoAWQForCausalLM.from_pretrained("llama-7b")
model.quantize(calib_data, quant_config={"w_bit":4,"q_group_size":128})
# GPTQ
from auto_gptq import AutoGPTQForCausalLM
model = AutoGPTQForCausalLM.from_pretrained("llama-7b")
model.quantize(calib_data, bits=4)
\`\`\`

踩坑：INT4 精度损失需校准数据；量化对部分层敏感跳过；推理框架需支持量化。`,
    keyPoints: ["GPTQ 二阶误差补偿", "AWQ 保护重要权重", "INT4 降显存提速度"],
    followUps: ["QAT 训练感知量化？", "量化精度评估？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-190",
    nodeId: "ai-model-deploy",
    question: "知识蒸馏原理？如何用大模型教小模型？",
    answer: `结论：知识蒸馏让 teacher（大模型）指导 student（小模型）。软标签蒸馏用 teacher 输出概率（带温度）做目标，含暗知识（类间关系）；特征蒸馏对齐中间层特征。DistilBERT 用蒸馏把 BERT 压缩 40%。

实际案例：阿里/百度用蒸馏把 BERT 压缩上线；HuggingFace DistilBERT 开源。LLM 蒸馏用大模型生成数据训小模型。

\`\`\`python
import torch.nn.functional as F
def distill_loss(student_logits, teacher_logits, labels, T=4, alpha=0.7):
    soft = F.kl_div(
        F.log_softmax(student_logits/T, -1),
        F.softmax(teacher_logits/T, -1), reduction="batchmean") * T*T
    hard = F.cross_entropy(student_logits, labels)
    return alpha*soft + (1-alpha)*hard
# teacher.eval() 不更新
\`\`\`

踩坑：温度 T 需调；student 容量限制上限；特征蒸馏需对齐层。`,
    keyPoints: ["软标签含暗知识", "温度 T 平滑概率", "DistilBERT 压缩 40%"],
    followUps: ["特征蒸馏？", "LLM 蒸馏数据？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-191",
    nodeId: "ai-model-deploy",
    question: "ONNX / TensorRT 推理优化原理？如何加速？",
    answer: `结论：ONNX 是模型中间格式跨框架通用；TensorRT 在 ONNX 基础上做图优化（算子融合/内核自动调优/精度校准）和 INT8 量化，大幅提升 GPU 推理速度。常用于 CV/NLP 模型部署。

实际案例：百度/美团用 TensorRT 部署检测/分割模型提速 3-5 倍；阿里用 ONNX Runtime 跨平台部署。

\`\`\`python
# PyTorch → ONNX → TensorRT
torch.onnx.export(model, dummy, "model.onnx", opset=14)
# TensorRT 优化
import tensorrt as trt
builder = trt.Builder(logger)
network = builder.create_network()
parser = trt.OnnxParser(network, logger)
parser.parse(open("model.onnx","rb").read())
config = builder.create_builder_config()
config.set_flag(trt.BuilderFlag.INT8)  # INT8 量化
engine = builder.build_engine(network, config)
\`\`\`

踩坑：部分算子 ONNX 不支持需自定义；TensorRT 版本绑定 GPU；动态 shape 需配置。`,
    keyPoints: ["ONNX 跨框架中间格式", "TensorRT 算子融合+内核调优", "INT8 量化加速"],
    followUps: ["算子融合？", "动态 shape？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-192",
    nodeId: "ai-model-deploy",
    question: "模型服务化与 Triton？如何做高并发推理？",
    answer: `结论：模型服务化把模型封装为 API（HTTP/gRPC），用 Triton/FastAPI 部署。Triton 支持多模型多框架、动态 batching（攒批提升吞吐）、模型热更新。高并发需 batch+异步+缓存+负载均衡。

实际案例：阿里 PAI/腾讯 TI 用 Triton 做模型服务；字节用自研推理框架。动态 batching 提升 GPU 利用率。

\`\`\`python
# Triton 配置动态 batching
# config.pbtxt
dynamic_batching {
  preferred_batch_size: [4, 8, 16]
  max_queue_delay_microseconds: 50000  # 攒批等待
}
# 客户端 gRPC 调用
import tritonclient.grpc as grpcclient
client = grpcclient.InferenceServerClient("localhost:8001")
result = client.infer("resnet", [img_input])
\`\`\`

踩坑：batch 等待延迟需权衡；模型加载慢需预热；长尾请求需超时。`,
    keyPoints: ["Triton 多模型多框架", "动态 batching 攒批提吞吐", "模型热更新"],
    followUps: ["动态 batching 策略？", "gRPC vs HTTP？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-193",
    nodeId: "ai-model-deploy",
    question: "LLM 推理加速：KV Cache 原理？PagedAttention 如何优化？",
    answer: `结论：KV Cache 缓存已生成 token 的 Key/Value 避免重复计算，把生成复杂度从 O(n²) 降到 O(n)。PagedAttention（vLLM）把 KV Cache 分页管理减少碎片，支持连续 batching 提升吞吐。是 LLM 推理核心优化。

实际案例：vLLM 用 PagedAttention 提升 2-4 倍吞吐；字节/阿里 LLM 服务用 vLLM/TGI。连续 batching 动态调度请求。

\`\`\`python
# KV Cache：缓存历史 K/V
# step t: 只算新 token 的 q, 复用历史 k,v
q = proj_q(new_token)
k = torch.cat([cached_k, proj_k(new_token)], 1)  # 追加
v = torch.cat([cached_v, proj_v(new_token)], 1)
attn = q @ k.T  # 复用历史
# PagedAttention：分页管理 KV 减少碎片
# vLLM: blocks of KV, 按需分配
\`\`\`

踩坑：KV Cache 占显存大长序列易 OOM；PagedAttention 需自定义 kernel；batch 内序列长度不一需 padding。`,
    keyPoints: ["KV Cache 复用历史降复杂度", "PagedAttention 分页减碎片", "vLLM 连续 batching"],
    followUps: ["连续 batching？", "Speculative Decoding？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-194",
    nodeId: "ai-model-deploy",
    question: "大模型部署方案：vLLM / TGI / DeepSpeed-FastGen 对比？",
    answer: `结论：vLLM 用 PagedAttention+连续 batching 吞吐高、易用，主流选择；TGI（HuggingFace）功能全支持多种量化；DeepSpeed-FastGen 用 Dynamic SplitFuse 优化长序列。选型看吞吐/延迟/易用性/量化支持。

实际案例：阿里/字节用 vLLM 部署 LLM 服务；HuggingFace 用 TGI 做 Inference Endpoints。vLLM 社区活跃生态好。

\`\`\`python
# vLLM 部署
from vllm import LLM, SamplingParams
llm = LLM(model="Qwen/Qwen2-7B", tensor_parallel_size=2)
outputs = llm.generate(prompts, SamplingParams(temperature=0.7, max_tokens=512))
# 启动 API 服务
# python -m vllm.entrypoints.openai.api_server --model Qwen2-7B
\`\`\`

踩坑：vLLM 显存需预留 KV Cache；多卡张量并行需 NVLink；量化模型需对应支持。`,
    keyPoints: ["vLLM PagedAttention 吞吐高", "TGI 功能全", "DeepSpeed Dynamic SplitFuse"],
    followUps: ["张量并行？", "量化推理支持？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-195",
    nodeId: "ai-model-deploy",
    question: "边缘部署与模型压缩？手机/IoT 如何跑模型？",
    answer: `结论：边缘部署需模型小、延迟低、省电。压缩方法：剪枝去冗余权重、量化 INT8/INT4、蒸馏小模型、低秩分解。框架用 NCNN/MNN/TFLite 转换并优化。手机 NPU 加速推理。

实际案例：美团/字节用 MNN 部署端侧模型做图像识别；手机厂商用 NPU 加速人脸解锁。微信小程序用 TFLite。

\`\`\`python
# 模型压缩流水线
# 1. 剪枝
pruned = prune(model, amount=0.3)  # 去 30% 权重
# 2. 量化
quantized = quantize_dynamic(pruned, {nn.Linear}, dtype=torch.qint8)
# 3. 转 ONNX 再转 MNN
torch.onnx.export(quantized, dummy, "model.onnx")
# MNNConvert -f ONNX --modelFile model.onnx --MNNModel model.mnn
\`\`\`

踩坑：剪枝后需微调恢复精度；NPU 算子支持有限；端侧内存限制模型大小。`,
    keyPoints: ["剪枝/量化/蒸馏压缩", "NCNN/MNN/TFLite 端侧框架", "手机 NPU 加速"],
    followUps: ["结构化剪枝？", "MNN 优化？"],
    favorited: false,
    bigTech: false,
  },
  // ===== 30. ai-mlops =====
  {
    id: "ai-196",
    nodeId: "ai-mlops",
    question: "实验管理与模型注册？MLflow/W&B 如何用？",
    answer: `结论：实验管理记录每次训练的超参/指标/代码版本/模型产物，便于复现和对比。MLflow 提供实验跟踪+模型注册+模型服务一体化；Weights&Biases 可视化强协作好。模型注册管理模型版本和阶段（Staging/Production）。

实际案例：阿里 PAI/字节用自研 MLOps 平台；创业公司用 MLflow+W&B。模型注册管理上线版本回滚。

\`\`\`python
import mlflow
mlflow.set_experiment("ctr-model")
with mlflow.start_run():
    mlflow.log_params({"lr": 1e-3, "layers": [64,32]})
    for epoch in range(10):
        mlflow.log_metric("auc", auc, step=epoch)
    mlflow.pytorch.log_model(model, "model")
    mlflow.register_model("runs:/abc/model", "CTR-Model")
# 模型注册：版本管理 + 阶段切换
\`\`\`

踩坑：实验记录需自动化；模型版本需关联数据版本；注册模型需审批流程。`,
    keyPoints: ["记录超参/指标/代码/模型", "MLflow 一体化", "模型注册版本管理"],
    followUps: ["模型阶段管理？", "W&B 协作？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-197",
    nodeId: "ai-mlops",
    question: "数据版本管理？DVC 如何与 Git 配合？",
    answer: `结论：数据版本管理用 DVC（Data Version Control）追踪数据集和模型文件变化，与 Git 配合：Git 管代码，DVC 管大文件（存远程存储）。支持数据 pipeline 可复现。解决"数据改了模型效果变了无法溯源"问题。

实际案例：阿里/字节用自研数据平台；开源项目用 DVC 管理数据集。Feature Store 管理特征版本。

\`\`\`python
# DVC 数据版本管理
# dvc init  # 初始化
# dvc add data/train.csv  # 跟踪数据
# dvc push  # 推到远程存储（S3/OSS）
# git add .gitignore train.csv.dvc && git commit
# 切换数据版本
# git checkout v1.0 && dvc checkout  # 恢复 v1.0 数据
# 数据 pipeline
# dvc repro  # 可复现训练流程
\`\`\`

踩坑：大文件存储成本高；数据 pipeline 需缓存；多实验数据对齐需严格版本。`,
    keyPoints: ["DVC 管大文件+Git 管代码", "远程存储数据版本", "pipeline 可复现"],
    followUps: ["DVC pipeline？", "Feature Store？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-198",
    nodeId: "ai-mlops",
    question: "模型监控与漂移检测？如何发现线上效果下降？",
    answer: `结论：模型上线后需监控预测分布、特征分布、效果指标。漂移分数据漂移（特征分布变化）和概念漂移（特征-标签关系变化）。检测方法：KS 检验/PSI/KL 散度对比线上与训练分布，指标下降触发报警重训。

实际案例：字节/阿里推荐模型每日监控 CTR/AUC 下降；腾讯广告监控 CTR 预估偏差。漂移触发自动重训。

\`\`\`python
import numpy as np
def psi(base, cur, bins=10):
    base_hist = np.histogram(base, bins)[0] / len(base)
    cur_hist = np.histogram(cur, bins)[0] / len(cur)
    return np.sum((cur_hist - base_hist) * np.log((cur_hist+1e-6)/(base_hist+1e-6)))
# PSI > 0.2 触发重训
for feat in features:
    if psi(train_feat[feat], online_feat[feat]) > 0.2:
        alert(f"{feat} 漂移，需重训")
\`\`\`

踩坑：漂移检测需基线数据；概念漂移难检测需标签反馈；报警阈值需调防误报。`,
    keyPoints: ["数据漂移/概念漂移", "PSI/KS 检测分布变化", "指标下降触发重训"],
    followUps: ["PSI 如何计算？", "概念漂移检测？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-199",
    nodeId: "ai-mlops",
    question: "CI/CD for ML？模型上线流水线如何自动化？",
    answer: `结论：ML CI/CD 在代码 CI 基础上加数据验证、模型训练、评估、部署阶段。CI：代码测试+数据验证+模型训练+离线评估；CD：模型注册→灰度部署→A/B 测试→全量。自动化保证模型迭代速度和质量。

实际案例：字节/阿里推荐模型 CI/CD 自动化训练评估部署；GitHub Actions/Kubeflow 管道编排。

\`\`\`yaml
# GitHub Actions ML CI/CD
jobs:
  train:
    steps:
      - run: python train.py  # 训练
      - run: python evaluate.py  # 离线评估
      - run: mlflow register  # 注册
  deploy:
    needs: train
    steps:
      - run: canary_deploy 10%  # 灰度 10%
      - run: ab_test 24h  # A/B 24h
      - if: metrics_up
        run: full_deploy  # 全量
\`\`\`

踩坑：训练耗时长需缓存中间结果；灰度需流量切分；回滚需自动化。`,
    keyPoints: ["CI 数据验证+训练+评估", "CD 注册→灰度→A/B→全量", "自动化保迭代速度"],
    followUps: ["灰度部署策略？", "Kubeflow 管道？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-200",
    nodeId: "ai-mlops",
    question: "特征平台建设？在线离线特征一致性如何保证？",
    answer: `结论：特征平台统一管理特征定义、计算、存储、服务，保证在线离线一致性。离线用 Spark 批处理，近线 Flink 流式，在线 Redis 查询。一致性靠统一特征定义+计算逻辑复用+时间对齐（point-in-time join 防穿越）。

实际案例：字节/阿里建特征平台支撑推荐/广告；Feast 开源特征平台。特征穿越是核心陷阱。

\`\`\`python
# 特征平台架构
# 离线：Spark 计算特征写 Hive/HDFS
# 近线：Flink 实时特征写 Redis
# 在线：特征服务查 Redis + 离线特征
# point-in-time join 防穿越
def get_features(user, time):
    # 只取 time 之前的特征，防未来信息泄漏
    return feature_store.query(user, timestamp_lt=time)
# 统一特征定义（protobuf）
\`\`\`

踩坑：在线离线计算逻辑不一致导致偏差；时间对齐防穿越；特征更新延迟需监控。`,
    keyPoints: ["统一特征定义计算服务", "Spark+Flink+Redis", "point-in-time 防穿越"],
    followUps: ["特征穿越如何检测？", "Feast 架构？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-201",
    nodeId: "ai-mlops",
    question: "MLOps 平台架构？端到端机器学习流水线如何设计？",
    answer: `结论：MLOps 平台覆盖数据→训练→部署→监控全生命周期。核心模块：数据管理（版本/标注）、特征平台、实验管理、模型注册、模型服务、监控告警、CI/CD 编排。目标是自动化、可复现、可监控的模型迭代闭环。

实际案例：阿里 PAI/字节 Volcano/腾讯 TI 提供端到端 MLOps；Kubeflow 开源 K8s 原生方案。闭环越自动迭代越快。

\`\`\`python
# 端到端流水线（Kubeflow Pipeline）
from kfp import dsl
@dsl.pipeline(name="ctr-pipeline")
def pipeline(data_path):
    preprocess = dsl.ContainerOp(name="preprocess", image="spark",
        command=["python","preprocess.py","--data",data_path])
    train = dsl.ContainerOp(name="train", image="pytorch",
        command=["python","train.py","--input",preprocess.output])
    deploy = dsl.ContainerOp(name="deploy", image="triton",
        command=["python","deploy.py","--model",train.output])
    dsl.Sequential([preprocess, train, deploy])
\`\`\`

踩坑：平台建设周期长需分阶段；多团队协作需规范；监控闭环是核心价值。`,
    keyPoints: ["数据→训练→部署→监控闭环", "特征/实验/注册/服务模块", "自动化可复现可监控"],
    followUps: ["Kubeflow 架构？", "平台分阶段建设？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-202",
    nodeId: "ai-mlops",
    question: "模型迭代与 A/B 测试？如何科学验证模型效果？",
    answer: `结论：模型迭代用 A/B 测试科学验证：对照组（旧模型）+实验组（新模型）分流，统计显著性检验（t 检验/卡方）确认提升非随机。需足够样本量、公平分流、多指标综合（CTR+留存+GMV）、观察周期防新奇效应。

实际案例：字节/阿里每日大量 A/B 测试验证推荐模型；先 1% 灰度再逐步放量。需防 SRM（样本比例失调）。

\`\`\`python
from scipy import stats
# A/B 显著性检验
ctr_control = control_group["click"].mean()
ctr_treatment = treatment_group["click"].mean()
# t 检验
t_stat, p_value = stats.ttest_ind(control_group["click"], treatment_group["click"])
if p_value < 0.05 and ctr_treatment > ctr_control:
    print("新模型显著提升，全量上线")
# 样本量计算
n = (z_alpha * sqrt(p*(1-p)) / delta)**2  # 最小样本量
\`\`\`

踩坑：样本量不足假阴性；新奇效应需观察期；多检验需 Bonferroni 校正。`,
    keyPoints: ["A/B 对照+实验分流", "显著性检验确认非随机", "多指标综合+观察期"],
    followUps: ["SRM 检测？", "多臂老虎机？"],
    favorited: false,
    bigTech: true,
  },
];

// 按拓扑顺序生成学习计划：AI_NODES 数组顺序已按 prerequisites 拓扑排列，
// 每天最多学 2 个新节点（day = floor(idx/2)+1），次日复习当天所学；
// 节点数变化时天数自动适应，保证每天 1-2 个 learn + 1 个 review。
function buildSchedule(): ScheduleItem[] {
  // 拓扑顺序：AI_NODES 已按 prerequisites 排列，直接取数组顺序
  const order = AI_NODES.map((n) => n.id);

  const schedule: ScheduleItem[] = [];
  order.forEach((nodeId, idx) => {
    // 每天最多 2 个 learn：第 0、1 个在 day1，第 2、3 个在 day2...
    const day = Math.floor(idx / 2) + 1;
    const node = AI_NODES[idx];
    // learn 估计时间 = difficulty * 8 分钟
    schedule.push({
      day,
      nodeId,
      type: "learn",
      estimatedMinutes: node.difficulty * 8,
      completed: false,
    });
    // 当天所学次日复习
    schedule.push({
      day: day + 1,
      nodeId,
      type: "review",
      estimatedMinutes: 5,
      completed: false,
    });
  });
  return schedule;
}

export const AI_PRESET = {
  topic: "AI 算法工程师",
  knowledgeTree: AI_NODES,
  questions: AI_QUESTIONS,
  schedule: buildSchedule(),
};