// lib/presets/ai.ts
// AI 算法工程师面试全攻略预设：38 知识节点 + 270 道高频面试题 + 学习计划
// 覆盖：机器学习基础 → 数学基础 → 深度学习 → CV → NLP → 向量检索 → 推荐系统 →
//       强化学习 → 多模态 → 模型压缩/部署 → 分布式训练 → 推理优化 → CUDA/GPU → MLOps
// 答案四段式（核心原理+代码示例+实际案例+踩坑 tradeoff），全部 ≥500 字符，新增 700-1400 字符

import type { KnowledgeNode, Question, ScheduleItem } from "../types";

const AI_NODES: KnowledgeNode[] = [
  // ===== 机器学习基础（9 个节点） =====
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
    id: "ai-math-foundations",
    title: "数学基础（线代/概率/最优化）",
    difficulty: 3,
    prerequisites: [],
    frequency: "高",
    bigTech: true,
    summary: "特征值分解与 SVD、矩阵求导、MLE/MAP 与贝叶斯、信息论（熵/KL/互信息）、凸优化与 KKT、大数定律与中心极限定理。",
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
  // ===== 深度学习（7 个节点） =====
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
  {
    id: "ai-gnn",
    title: "图神经网络",
    difficulty: 4,
    prerequisites: ["ai-nn-fundamentals"],
    frequency: "中",
    bigTech: true,
    summary: "消息传递范式、GCN/GraphSAGE/GAT、大图训练邻居采样、异构图与知识图谱嵌入、过平滑问题、风控团伙挖掘与推荐图召回。",
    mastery: 0,
  },
  // ===== CV 方向（5 个节点） =====
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
  {
    id: "ai-diffusion-advanced",
    title: "扩散模型进阶",
    difficulty: 5,
    prerequisites: ["ai-cv-generative"],
    frequency: "高",
    bigTech: true,
    summary: "DDPM 噪声预测目标、DDIM 加速采样、Classifier-Free Guidance、noise schedule、Score SDE 统一视角、DiT、Flow Matching、视频生成。",
    mastery: 0,
  },
  // ===== NLP 方向（5 个节点） =====
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
  {
    id: "ai-vector-retrieval",
    title: "向量检索与 ANN 算法",
    difficulty: 4,
    prerequisites: ["ai-nlp-embeddings"],
    frequency: "高",
    bigTech: true,
    summary: "HNSW 分层小世界图、IVF 倒排索引、PQ 乘积量化、IVFPQ/OPQ、DiskANN/ScaNN 十亿级检索、召回率-QPS-内存权衡、向量+标量混合检索。",
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
  // ===== 前沿与部署（7 个节点） =====
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
    id: "ai-model-compression",
    title: "模型压缩",
    difficulty: 4,
    prerequisites: ["ai-model-deploy"],
    frequency: "高",
    bigTech: true,
    summary: "结构化/非结构化剪枝、低秩分解、PTQ vs QAT、SmoothQuant 激活异常值、量化粒度 W4A16、2:4 结构化稀疏、端侧推理框架。",
    mastery: 0,
  },
  {
    id: "ai-distributed-training",
    title: "分布式训练深入",
    difficulty: 5,
    prerequisites: ["ai-frameworks"],
    frequency: "高",
    bigTech: true,
    summary: "ZeRO-1/2/3 显存切分、FSDP、张量并行 Megatron 切分、流水并行 1F1B 与气泡、通信原语、序列并行、3D 并行选型、训练稳定性工程。",
    mastery: 0,
  },
  {
    id: "ai-inference-optimization",
    title: "LLM 推理优化深入",
    difficulty: 5,
    prerequisites: ["ai-model-deploy"],
    frequency: "高",
    bigTech: true,
    summary: "Roofline 分析 prefill/decode、连续批处理、Chunked Prefill 与 PD 分离、Prefix Caching、GQA/MLA 显存影响、KV Cache 量化、TTFT/TPOT 与容量规划。",
    mastery: 0,
  },
  {
    id: "ai-cuda-gpu",
    title: "CUDA 与 GPU 编程",
    difficulty: 4,
    prerequisites: ["ai-frameworks"],
    frequency: "中",
    bigTech: true,
    summary: "GPU 架构 SM/warp/occupancy、CUDA 内存层次与合并访存、tile 与 bank conflict、FlashAttention IO 感知、算子融合、CUDA Graph、NCCL 调试、Triton。",
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
    answer: `结论：最小二乘是闭式解 θ=(XᵀX)⁻¹Xᵀy，对正规方程一步求解，代价是 O(nd²+d³) 计算与 O(d²) 内存，且要求 XᵀX 可逆；梯度下降用 θ←θ-η·Xᵀ(Xθ-y)/n 迭代逼近，每步仅 O(nd)，可 mini-batch 流式处理。机制差异：闭式解数值精度高但对共线性极敏感——XᵀX 条件数大时，数据微小噪声会被逆矩阵放大成权重的剧烈波动（方差膨胀）；迭代法用多步小更新换内存可行与数值稳定，且天然支持正则（早停近似等价于 L2）。

实际案例：某广告平台做 CTR 预估，ID 特征 one-hot 后维度过亿，XᵀX 既存不下更求不了逆，线上用 FTRL/SGD 按日志流式更新；某金融风控评分卡（约 5 万样本、30 个 WOE 特征）直接用闭式解+岭回归一次出结果，还能输出系数置信区间供合规审查。特征数超过样本数时 XᵀX 必奇异，须加 L2 变岭回归 θ=(XᵀX+λI)⁻¹Xᵀy。

\`\`\`python
import numpy as np
# 闭式解（pinv 处理近奇异矩阵）
Xb = np.c_[np.ones(len(X)), X]
theta = np.linalg.pinv(Xb.T @ Xb) @ Xb.T @ y
# 梯度下降（先标准化特征）
w = np.zeros(X.shape[1])
for _ in range(1000):
    grad = X.T @ (X @ w - y) / len(y)
    w -= 0.01 * grad
\`\`\`

踩坑：特征未标准化时梯度下降各维步长不一，沿狭长椭圆 zigzag 收敛极慢，必须先 StandardScaler；共线性使闭式解权重符号反常、方差爆炸，用 VIF 检测后加正则；n 超过内存时用 mini-batch GD 而非全量批梯度。`,
    keyPoints: ["闭式解 O(d³) 需 XᵀX 可逆且内存够", "梯度下降每步 O(nd) 支持流式", "共线性放大闭式解方差，加 L2 岭回归"],
    followUps: ["XᵀX 条件数大为什么会让闭式解不稳定？", "FTRL 相比 SGD 为什么更适合在线 CTR？"],
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
    answer: `结论：L1（Lasso）在损失上加 λΣ|w|，L2（Ridge）加 λΣw²。L1 稀疏的几何解释：L1 约束区域是菱形（高维为菱形体），损失等值线与它相切时切点大概率落在顶点——顶点恰在坐标轴上，对应维度权重为 0，故能自动特征选择；L2 约束是球形，各方向曲率相同，切点一般不在轴上，权重只被均匀压缩趋近 0 而不归零。从梯度看更直观：L1 对任意权重施加恒定推力 ±λ，小权重被推过 0 即消失；L2 的推力 2λw 随权重变小而衰减，永远差一步到不了 0。

实际案例：某电商风控团队用 L1 逻辑回归从 2000+ 特征中自动筛出约 60 个强特征，线上特征计算成本降 70%，模型卡可解释性也顺利过审；某广告平台 CTR 模型用 L2 防过拟合、保住概率校准性（出价直接乘 pCTR，概率不准直接亏钱）。特征强相关时换 Elastic Net（α·L1+(1-α)·L2），兼顾分组选择与结果稳定。

\`\`\`python
from sklearn.linear_model import LogisticRegression
l1 = LogisticRegression(penalty="l1", solver="liblinear", C=0.1)
l2 = LogisticRegression(penalty="l2", C=1.0)
l1.fit(X, y)
print("L1 非零特征数:", (l1.coef_ != 0).sum())  # 稀疏
\`\`\`

踩坑：L1 在特征高度相关时会随机选中其一、结果不稳定（Elastic Net 可解）；sklearn 的 C 是正则强度倒数，C 越小正则越强，需交叉验证对数网格调参；L1 在 0 点不可导，需坐标下降/次梯度求解器，不能直接套普通 SGD。`,
    keyPoints: ["L1 菱形约束切点落顶点致稀疏", "L1 恒定推力过零即消，L2 推力随权重衰减", "特征强相关用 Elastic Net"],
    followUps: ["从贝叶斯先验看 L1/L2 分别对应什么分布？", "Elastic Net 如何解决 L1 的相关特征随机选择？"],
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
    answer: `结论：Bagging 有放回采样训练多棵树，再投票/平均。方差账：若单树方差 σ²、树间预测相关系数 ρ，则 n 棵树平均后的方差 = ρσ² + (1−ρ)σ²/n——只有当树间相互独立（ρ=0）时才退化为理想的 σ²/n。树越多只能消掉第二项，ρσ² 是下限。随机森林再加特征随机（每次分裂只选特征子集）降低树间相关性 ρ，逼近独立假设，进一步降方差。

实际案例：金融风控用随机森林做信用评分，单棵深决策树易过拟合，集成后稳定且 OOB（袋外）评估免费。Boosting（GBDT）则降偏差，串联纠错，适合残差还大的场景。

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=300, max_features="sqrt",
                            oob_score=True, n_jobs=-1, random_state=42)
rf.fit(X_tr, y_tr)
print("OOB 得分:", rf.oob_score_)  # 免费验证集评估
\`\`\`

踩坑：树越多收益递减且耗时，通常 100-500 棵够了；特征随机比例 sqrt 适合分类，1/3 适合回归；Bagging 降方差不降偏差，欠拟合时换 Boosting。`,
    keyPoints: ["Bagging 有放回采样训练多棵树", "方差=ρσ²+(1−ρ)σ²/n，独立时才 σ²/n", "随机森林加特征随机降 ρ"],
    followUps: ["Bagging 和 Boosting 区别？", "OOB 评估原理？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-16",
    nodeId: "ai-tree-models",
    question: "GBDT 的原理？为什么拟合负梯度（残差）？",
    answer: `结论：GBDT 串行训练，每棵新树拟合之前模型的负梯度（残差），逐步降低偏差。加法模型 Fₘ=Fₘ₋₁+α·hₘ，hₘ 学残差。

实际案例：搜索排序早期用 LambdaMART（GBDT 的排序版本）。注意 NDCG 本身不可导，LambdaMART 并非"拟合 NDCG 的负梯度"，而是用 pair 交换前后 ΔNDCG 加权 pairwise 损失梯度、直接构造出 λ 梯度让每棵树去拟合，从而隐式优化 NDCG。GBDT 降偏差适合"模型还不够强"的场景，但串行训练慢、对噪声敏感。

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
    answer: `结论：XGBoost 相对原始 GBDT 的核心改进：①目标函数二阶泰勒展开（同时用一阶梯度 g 和二阶梯度 h 求分裂增益，收敛更快更准）；②目标函数加正则项（叶子数 γ·T + 叶权重 L2 项 λ‖w‖²），直接写进分裂增益公式防过拟合；③列采样（colsample_bytree/level）；④缺失值自动学默认方向（分裂时对缺失样本分别尝试走左/右取增益大者）；⑤加权分位数草图（weighted quantile sketch）做近似分裂，按二阶梯度 h 加权选候选切分点；⑥列块（column block）预排序+特征粒度并行找分裂点。注意：直方图分裂（histogram-based，连续值分桶后按桶统计）是 LightGBM 首创的做法，XGBoost 是后期才以 tree_method="hist" 引入，并非 XGBoost 原始贡献。

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
    keyPoints: ["二阶泰勒展开+正则项进增益公式", "列采样+缺失值默认方向", "加权分位数草图近似分裂+列块并行"],
    followUps: ["加权分位数草图如何选切分点？", "直方图法是谁首创、XGBoost 何时引入？"],
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
    answer: `结论：样本线性不可分时，把 x 映射到高维 φ(x) 后可分，但显式算 φ 会维度爆炸；核技巧利用 SVM 对偶问题只含样本内积的特点，用 K(xᵢ,xⱼ)=φ(xᵢ)·φ(xⱼ) 在原空间直接算高维内积，绕过显式映射。RBF 核 K=exp(-γ||x-z||²) 等价无穷维映射：γ 控制单个支持向量的影响半径——γ 大则每个支持向量只影响极小邻域，决策边界紧贴样本、退化成"记答案"式过拟合；γ 小则影响范围大、边界平滑，可能欠拟合。γ 与 C 必须联合调：C 管误分类惩罚，γ 管边界复杂度。

实际案例：某基因表达分类项目（200 样本、2 万特征），线性模型欠拟合，RBF-SVM 配合 γ/C 对数网格搜索（γ∈[1e-4,1]、C∈[0.1,100]）把 F1 从 0.71 提到 0.89；而文本分类（TF-IDF 十万维稀疏）用线性核反而更快更准——高维空间本就近似线性可分，RBF 只白白增加 O(n²) 核矩阵成本。

\`\`\`python
from sklearn.svm import SVC
linear = SVC(kernel="linear", C=1.0)          # 高维稀疏
rbf = SVC(kernel="rbf", C=10, gamma=0.01)     # 中小样本非线性
def my_kernel(X, Z): return X @ Z.T           # 自定义核需半正定
custom = SVC(kernel=my_kernel)
\`\`\`

踩坑：γ 过大模型退化为 1-NN 只看最近邻；核矩阵 O(n²) 内存，样本超 10 万用 Nystroem 近似或直接换线性模型；RBF 对特征尺度极敏感，标准化是前提；自定义核函数必须满足 Mercer 条件（核矩阵半正定），否则优化不再凸。`,
    keyPoints: ["核技巧用内积绕过显式高维映射", "RBF γ 控影响半径：大过拟合小欠拟合", "高维稀疏数据优先线性核"],
    followUps: ["核函数必须满足的 Mercer 条件是什么？", "Nystroem 近似如何降低核矩阵成本？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-23",
    nodeId: "ai-svm",
    question: "SVM 对偶问题是什么？为什么要求对偶？",
    answer: `结论：SVM 原始问题在约束 yᵢ(w·xᵢ+b)≥1-ξᵢ 下最小化 1/2||w||²+CΣξᵢ。引入拉格朗日乘子 αᵢ≥0 构造函数，对 w、b、ξ 求偏导置零再代回，得对偶问题：max Σαᵢ-1/2ΣᵢΣⱼαᵢαⱼyᵢyⱼ(xᵢ·xⱼ)，约束 Σαᵢyᵢ=0、0≤αᵢ≤C。求对偶的三重收益：①目标只含样本内积，核技巧可无缝替换为 K(xᵢ,xⱼ)；②变量数从特征维 d 降到样本数 n，d≫n 时更划算；③由 KKT 条件，非支持向量 αᵢ=0，w=Σαᵢyᵢxᵢ 只由少数支持向量张成，预测天然稀疏。

实际案例：libsvm 的 SMO 算法就是高效求解对偶：每次启发式选一对最违反 KKT 的 αᵢ、αⱼ，固定其余变量后子问题有闭式解、解析更新，无需数值优化器迭代到收敛。理解对偶还能解释工程事实：SVM 线上预测延迟取决于支持向量个数而非训练集规模，所以训练后要监控 SV 比例。

\`\`\`python
# 对偶解出 alpha 后：
# w = Σ alpha_i * y_i * x_i （仅 alpha>0 的支持向量参与）
from sklearn.svm import SVC
clf = SVC(kernel="linear", C=1.0).fit(X, y)
print("支持向量数:", clf.n_support_)  # 多数样本 alpha=0
\`\`\`

踩坑：样本量大时对偶核矩阵 O(n²) 内存仍是瓶颈，线性场景直接用原问题求解的 LinearSVC（liblinear）快一个量级；要分清边界支持向量（0<α<C，决定 b）与越界支持向量（α=C）；对偶间隙为 0 依赖问题的凸性，核矩阵半正定是前提。`,
    keyPoints: ["拉格朗日乘子转对偶，变量从 d 维降到 n 维", "对偶只含内积，核技巧无缝接入", "KKT 条件保证 α 稀疏、预测只靠支持向量"],
    followUps: ["SMO 为什么每次只优化一对 α？", "KKT 条件如何把原问题解和对偶解联系起来？"],
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
    answer: `结论：SVM 用 hinge loss max(0,1-y·f(x)) 最大化几何间隔，解只由支持向量决定——远离边界的样本梯度恒为 0，因此对远离边界的异常点天然鲁棒，但不输出概率；LR 用 log loss 对所有样本都有非零梯度，输出经 sigmoid 校准的概率，凸优化+全样本信息使其在大数据上更稳。本质差别：SVM 是"间隔最大化"的几何判据，LR 是"似然最大化"的概率判据；hinge 只要求分得对且有余量，log loss 永远鼓励更自信，所以 LR 概率可排序可校准、SVM 决策值只能比大小。

实际案例：某广告平台 CTR 预估选 LR——出价=pCTR×单价需要校准概率，亿级稀疏特征下 LR 可参数服务器分布式训练，特征权重还能直接解释给广告主；某医疗影像良恶性二分类（仅 800 例）选 RBF-SVM，小样本下间隔最大化比概率拟合泛化更好。文本高维稀疏场景两者效果接近，LR 工程化更省心。

\`\`\`python
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
lr = LogisticRegression(C=1.0, class_weight="balanced")
svm = SVC(kernel="rbf", C=1.0, gamma="scale", probability=True)  # Platt 转概率
\`\`\`

踩坑：SVM 要概率需 Platt scaling 二次拟合 sigmoid，小样本上该校准本身容易过拟合；LR 可并行流式训练，核 SVM 难并行；表格数据上 XGBoost 常同时优于两者，线性模型主要赢在线推理延迟、可解释性和 incremental 更新。`,
    keyPoints: ["SVM 间隔最大化、解只由支持向量决定", "LR 概率输出、全样本参与、易分布式", "要概率和大规模选 LR，小样本非线性选核 SVM"],
    followUps: ["hinge loss 与 log loss 的曲线形状差在哪？", "Platt scaling 怎么把 SVM 决策值校准成概率？"],
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

实际案例：大模型训练追求大 batch 提吞吐（GPU 利用率高、梯度方差小），但并非越大越好：超过 critical batch size 后计算收益递减，且过大 batch 泛化变差（倾向收敛到尖锐极小值），需配合线性/平方根学习率缩放与 warmup；受显存限制时用梯度累加模拟大 batch。腾讯广告在线学习用 SGD/FTRL 单样本更新应对实时性。

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
    keyPoints: ["Mini-batch 折中速度与稳定", "大 batch 提吞吐但受 critical batch size 与泛化约束", "梯度累加模拟大 batch"],
    followUps: ["critical batch size 如何确定？", "线性缩放规则是什么？"],
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
    answer: `结论：二阶方法（牛顿法）用 Hessian 矩阵 H 的逆乘以梯度更新 θ←θ-H⁻¹g，一步跳到二次近似的最优点，凸问题收敛阶数远高于一阶。但深度学习中基本不用，核心原因是计算与存储成本：参数量 d 时 Hessian 是 d×d 矩阵，存储 O(d²)、求逆 O(d³)。7B 模型 d=7×10⁹，存 Hessian 需 5×10¹⁹ 个元素（约 2×10¹¹ GB），求逆需 ~10²⁹ 次浮点运算——全球最强制卡也算不动。此外深度网络损失高度非凸，Hessian 不定（有负特征值），H⁻¹g 可能指向上升方向；mini-batch 噪声让 Hessian 估计本身不准，二阶信息被噪声淹没。鞍点问题：深度损失面鞍点远多于局部极小，牛顿法会被吸向鞍点（梯度为 0 处牛顿方向也消失），一阶+动量反而更易逃逸。

\`\`\`python
from scipy.optimize import minimize
# 小规模凸问题：L-BFGS（有限记忆拟牛顿，只存 m 组 (s,y) 隐式近似 H⁻¹）
res = minimize(loss_fn, x0, jac=grad_fn, method="L-BFGS-B",
               options={"maxcor": 10})  # 内存 O(md)，d=1e4 内秒级收敛
# 深度学习：Adam 用二阶动量 v≈E[g²] 做"对角 Hessian"近似，每参数 O(1) 额外存储
# torch.optim.Adam(params, lr=1e-3)  # m 一阶矩 + v 二阶矩，等效逐参数自适应步长
\`\`\`

实际案例：sklearn 的 LogisticRegression 在 lbfgs 求解器下对小数据收敛远快于 SGD，是表格数据基线首选；XGBoost 每棵树分裂用损失的二阶泰勒展开（g、h 统计量）加速增益计算，是"二阶思想+非参数模型"的成功案例；Google 的 Shampoo、K-FAC 用 Kronecker 分解近似 Hessian 块对角，在 TPU 上训 ViT/ResNet 比 Adam 快 1.5-2 倍，但工程复杂未普及。

踩坑与 tradeoff：别把"二阶不用"绝对化——参数 < 1 万的科学计算/控制问题，L-BFGS/Newton 仍是最优；Gauss-Newton 用 JᵀJ 近似 H 保证半正定，是强化学习 TRPO 的基础；面试常追问"Adam 为什么算对角二阶"——v 是梯度的二阶矩，除以 √v 等效用对角 Hessian 缩放步长，这是折中精度与成本的工业最优解。`,
    keyPoints: ["Hessian O(d²)存储 O(d³)求逆，大模型物理不可行", "非凸 Hessian 不定+噪声淹没二阶信息+鞍点吸附", "Adam 二阶动量=对角 Hessian 近似，工业折中最优"],
    followUps: ["为什么鞍点上牛顿法失效而一阶动量更易逃逸？", "K-FAC/Shampoo 用什么近似让二阶方法在大模型可行？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-39",
    nodeId: "ai-optimization",
    question: "梯度裁剪的原理？为什么 RNN/Transformer 训练常需要它？",
    answer: `结论：梯度裁剪在反向传播后、optimizer.step() 前限制梯度大小，防单步更新过猛导致 loss 尖刺甚至 NaN。主流用按范数裁剪（clip by norm）：算全局范数 ||g||=√(Σᵢ gᵢ²)，若 ||g||>max_norm 则 g←g·max_norm/||g||——只缩放不改变方向，保留梯度提供的相对信息。另一种按值裁剪（clip by value）把每个分量截到 [-c,c]，会扭曲方向（各分量被独立截断），仅作兜底少用。RNN 必备的原因：BPTT 沿时间步连乘雅可比，谱半径>1 时梯度指数爆炸，长序列必触发；Transformer 需要它的原因是注意力 logits 随维度缩放、深层残差流累积，训练初期个别 batch 会出现巨梯度，LLM 训练 max_norm=1.0 是事实标准（LLaMA、GPT 系列均如此）。

\`\`\`python
import torch
optimizer.zero_grad()
loss.backward()
# 按范数裁剪（工业标准）：返回裁剪前的总范数，可用于监控
total_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
if total_norm > 10:  # 尖刺告警：数据脏样本或学习率过大
    logger.warn(f"grad spike: {total_norm}")
optimizer.step()
# 按值裁剪（改变方向，慎用）：
# torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=0.5)
\`\`\`

实际案例：某 LLM 预训练团队发现 loss 每隔几千步突跳后恢复，监控 clip_grad_norm_ 返回值定位到个别脏数据 batch 范数超 100，裁剪+数据清洗后训练曲线平滑；DeepMind 训练 AlphaStar、OpenAI 训练 GPT 均报告无梯度裁剪时会出现不可逆发散。RNN 时代（2016 机器翻译）无裁剪的模型 50 步内必 NaN。

踩坑与 tradeoff：max_norm 太小（如 0.01）等于给学习率上限，收敛变慢甚至欠拟合；太大则形同虚设。经验值：LLM 用 1.0，CV 用 1-5，配合梯度范数监控曲线调整。注意范数是全局所有参数拼起来算，不是逐层；混合精度训练中要在 unscale 之后裁剪（GradScaler 自动处理）；梯度裁剪治爆炸不治消失，消失要靠残差/门控/归一化。`,
    keyPoints: ["按范数裁剪只缩放不改方向，按值裁剪扭曲方向", "RNN 连乘爆炸必备，LLM max_norm=1.0 事实标准", "裁剪前范数是宝贵的训练健康监控信号"],
    followUps: ["为什么混合精度训练要在梯度 unscale 后再裁剪？", "全局范数裁剪 vs 逐层裁剪各自的适用场景？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-40",
    nodeId: "ai-optimization",
    question: "大规模分布式训练中优化器有哪些工程挑战？ZeRO 如何节省显存？",
    answer: `结论：混合精度 Adam 训练每个参数共占 16 字节：FP16 参数 2 + FP16 梯度 2 + FP32 主参数 4 + FP32 动量 m 4 + FP32 方差 v 4。设参数量为 Ψ、卡数 N，基线单卡要装下全部 16Ψ。ZeRO 逐级分片：ZeRO-1 只分片优化器状态（主参数+m+v 共 12Ψ），每卡 4Ψ + 12Ψ/N；ZeRO-2 再分片梯度，每卡 2Ψ + 14Ψ/N；ZeRO-3 连参数也分片，每卡仅 16Ψ/N，前向/反向时按需 All-Gather 收集。N 越大单卡越省，代价是通信量增加。

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
    keyPoints: ["混合精度 Adam 16 字节/参数（2+2+4+4+4）", "ZeRO-1/2/3 逐级分片优化器状态/梯度/参数", "ZeRO-3 每卡 16Ψ/N 通信换显存"],
    followUps: ["ZeRO-2 相比 ZeRO-1 多省在哪？", "激活重计算原理？"],
    favorited: false,
    bigTech: true,
  },

  // ===== 7. ai-evaluation =====
  {
    id: "ai-41",
    nodeId: "ai-evaluation",
    question: "精确率、召回率、F1、AUC 的含义？什么场景看重哪个？",
    answer: `结论：基于混淆矩阵——TP/FP/TN/FN 四格。Precision=TP/(TP+FP)：预测为正的样本里真正为正的比例，衡量"误报率"；Recall=TP/(TP+FN)：真实为正的样本被找出的比例，衡量"漏检率"。F1=2PR/(P+R) 是 P 和 R 的调和平均，调和平均被较小值主导，惩罚两者不均衡（算术平均会高估）。AUC 是 ROC 曲线下面积，物理含义=随机取一对正负样本，模型把正样本排在负样本前面的概率，阈值无关，衡量排序能力。场景选择：漏检代价高的用 Recall（癌症筛查漏一个代价是一条命、欺诈漏检损失真金白银）；误报代价高的用 Precision（垃圾邮件误杀正常邮件、内容审核误伤正常用户流失）；需要单一数值比较模型用 F1 或 AUC；极度不平衡且关心排序质量用 PR-AUC。

\`\`\`python
from sklearn.metrics import (precision_score, recall_score, f1_score,
                             roc_auc_score, classification_report,
                             precision_recall_curve)
print(classification_report(y_true, y_pred))  # 各类 P/R/F1 一览
print("AUC:", roc_auc_score(y_true, y_prob))
# 按业务选阈值：在 PR 曲线上找满足 Recall≥0.95 的最大 Precision 点
prec, rec, thr = precision_recall_curve(y_true, y_prob)
best = max((p, t) for p, r, t in zip(prec, rec, thr) if r >= 0.95)
\`\`\`

实际案例：某银行信用卡反欺诈，正样本占比 0.1%，业务要求召回率≥98%（漏一个欺诈损失数万），运营只能承受日审 200 单→反推 Precision≥5%，在 PR 曲线上选阈值 0.73 而非默认 0.5，上线后欺诈损失降 62%、审核人力仅增 30%。某内容平台低俗审核相反：误杀正常视频伤创作者，要求 Precision≥99.5% 再放量。

踩坑与 tradeoff：默认阈值 0.5 几乎总是错的，必须按业务代价在 PR 曲线上选点；样本不平衡时 accuracy 无意义（全猜负也有 99.9%）；AUC 在极度不平衡时会虚高（FPR 分母含巨量 TN），此时看 PR-AUC；多分类用 Macro-F1（各类等权，暴露小类差表现）还是 Weighted-F1（按样本数加权，反映整体）要跟业务对齐；P 和 R 跷跷板，提阈值升 P 降 R，没有免费午餐。`,
    keyPoints: ["Precision 管误报 Recall 管漏检，F1 调和平均惩罚不均衡", "AUC=正负样本排序正确的概率，阈值无关", "业务代价决定阈值，默认 0.5 几乎总是错的"],
    followUps: ["为什么极度不平衡时 AUC 虚高、PR-AUC 更可信？", "多分类 Macro-F1 和 Weighted-F1 怎么选？"],
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
from sklearn.metrics import (roc_curve, precision_recall_curve, auc,
                             average_precision_score)
fpr, tpr, _ = roc_curve(y, prob); print("ROC-AUC:", auc(fpr, tpr))
# 注意：precision_recall_curve 返回的 recall 是递减的，
# 直接 auc(rec, prec) 梯形积分会得到负值，需反转或改用：
print("PR-AUC:", average_precision_score(y, prob))  # 推荐，加权平均定义
prec, rec, _ = precision_recall_curve(y, prob)
print("PR-AUC(梯形):", auc(rec[::-1], prec[::-1]))  # 反转后积分
\`\`\`

踩坑：负样本远多于正样本时，FPR 分母大导致 ROC 看起来好；average_precision_score 与梯形 auc 口径略有差异（插值方式不同），报告时注明；PR-AUC 不稳定需多次采样平均；报告两者更全面。`,
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
    answer: `结论：NDCG 衡量排序质量考虑位置折扣和增益，适合多相关度等级；MRR 第一个相关项位置的倒数；AP（Average Precision）是单个 query 内、在每个相关文档位置处取 Precision 再求平均；MAP（Mean AP）是多个 query 的 AP 再取均值——AP 是单 query 指标，MAP 才是跨 query 的集合级指标，二者别混用。NDCG 是搜索/推荐最常用。

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
    keyPoints: ["NDCG 位置折扣多相关度", "MRR 第一个相关项倒数", "AP 单 query、MAP 跨 query 均值"],
    followUps: ["AP 的具体计算步骤？", "离线 NDCG 与线上 CTR 为何不一致？"],
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
# WOE 编码：WOE = ln(该箱正样本占比 / 该箱负样本占比)
# 占比是相对"全体正/负样本"归一化，不是箱内比率（箱内比率算的是 odds 不是 WOE）
def woe(df, feat, label):
    g = df.groupby(feat)[label].agg(["sum", "count"])
    pos = g["sum"]                      # 每箱正样本数
    neg = g["count"] - g["sum"]         # 每箱负样本数
    pos_pct = (pos + 0.5) / (pos.sum() + 0.5)   # 占全体正样本比例
    neg_pct = (neg + 0.5) / (neg.sum() + 0.5)   # 占全体负样本比例
    woe = np.log(pos_pct / neg_pct)
    return df[feat].map(woe)
\`\`\`

踩坑：树模型不需分箱（自身找切分点）；分箱过多过拟合过少欠拟合；WOE 编码需在训练集算防泄露；分箱后需保单调性符合业务。`,
    keyPoints: ["分箱引入非线性+鲁棒+可解释", "等频抗偏态/卡方保单调", "WOE=ln(pos%/neg%) 需对全体正负样本归一化"],
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
    answer: `结论：Sigmoid 有两个致命伤——① 饱和区梯度消失：|x|>4 时导数 σ'(x)=σ(x)(1-σ(x))≈0（最大值也仅 0.25），深层网络反向传播连乘这些 <0.25 的数，梯度指数级衰减到 0，浅层学不动；② 输出非零中心：输出恒为正，导致下一层权重梯度全同号，更新呈 zigzag 低效路径。ReLU(x)=max(0,x) 正区间梯度恒为 1，反向不衰减，深网络可训；计算只是比较运算，比 exp 快数倍；负区间输出 0 产生稀疏激活（约 50% 神经元沉默），符合生物神经特性且有正则效果。缺点：Dying ReLU——若某神经元输入恒为负（大负 bias 或巨大学习率把权重打进死区），梯度恒 0 永不复活，实践中 10-20% 神经元可能死亡。改进：Leaky ReLU 负区间给 0.01 斜率保梯度通路；GELU 用 x·Φ(x) 平滑近似（Transformer/BERT/GPT 标配，平滑非单调在 0 附近提供更丰富梯度）；Swish/SiLU=x·sigmoid(x)，Google 系模型常用。

\`\`\`python
import torch
import torch.nn as nn
relu = nn.ReLU()
leaky = nn.LeakyReLU(0.01)   # 防死亡：负区间保小梯度
gelu = nn.GELU()             # Transformer 标配：x·Φ(x) 平滑
silu = nn.SiLU()             # Swish：x·sigmoid(x)，Llama 前馈用 SwiGLU 变体
def swiglu(x, W, V):
    return nn.functional.silu(x @ W) * (x @ V)  # 门控线性单元
\`\`\`

实际案例：ResNet 全线 ReLU 把可训深度推到 152 层；BERT/GPT-2/3 前馈层用 GELU，消融实验显示比 ReLU 收敛快且下游任务 +0.5-1 个点；LLaMA 系列用 SwiGLU（Swish 门控版），同等参数下比 GELU 前馈效果更好，已成为 2024+ 开源 LLM 默认选择。

踩坑与 tradeoff：大学习率是 Dying ReLU 主因，配合 He 初始化+BN 可缓解；GELU/Swish 平滑但计算略贵（有 exp/erf），训练大模型时这点开销可忽略；Sigmoid 没被淘汰——二分类输出层、LSTM 门控（要 [0,1] 开关语义）、注意力权重的某些变体仍用它；面试易错点：ReLU 在 0 点不可导，工程上用次梯度（取 0 或 1）不影响 SGD。`,
    keyPoints: ["Sigmoid 饱和梯度<0.25 连乘消失+输出非零中心", "ReLU 正区间梯度恒 1+计算快+稀疏激活", "Dying ReLU 用 Leaky/GELU 修；LLM 前馈主流 GELU/SwiGLU"],
    followUps: ["为什么 SwiGLU 比 GELU 前馈效果更好？", "ReLU 在 0 点不可导为什么不影响训练？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-57",
    nodeId: "ai-nn-fundamentals",
    question: "权重初始化为什么重要？Xavier 和 He 初始化的区别？",
    answer: `结论：全零初始化致同层神经元对称无法学习。好的初始化让前向各层激活方差稳定、反向各层梯度方差稳定。Glorot/Xavier 同时兼顾前向与反向，取 Var=2/(n_in+n_out)，对应均匀分布 U(±√(6/(n_in+n_out))) 或同方差正态，适合 tanh/sigmoid；He（Var=2/n_in）适合 ReLU（负值归零方差减半需补偿）。注意 Var=1/n_in 是更早的 LeCun 初始化（只考虑前向，配合 SELU/tanh 类），不要与 Xavier 混淆。

实际案例：CNN 用 He 初始化，Transformer 也用 He 或截断正态。BN 能放宽对初始化的依赖但仍需合理初始化。

\`\`\`python
import torch.nn as nn
layer = nn.Linear(256, 128)
nn.init.kaiming_normal_(layer.weight, mode="fan_in", nonlinearity="relu")  # He
nn.init.zeros_(layer.bias)
nn.init.xavier_uniform_(layer.weight)  # Xavier（tanh）
\`\`\`

踩坑：初始化过大梯度爆炸过小消失；bias 通常初始化 0；Embedding 用正态小值初始化；残差分支初始化要保证初始接近恒等。`,
    keyPoints: ["全零初始化致对称无法学习", "Xavier Var=2/(n_in+n_out) 适合 tanh", "He Var=2/n_in 适合 ReLU；Var=1/n_in 是 LeCun"],
    followUps: ["为什么 ReLU 需更大初始化方差？", "Xavier 与 LeCun 初始化推导差异？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-58",
    nodeId: "ai-nn-fundamentals",
    question: "BatchNorm 的原理？训练和推理有何不同？",
    answer: `结论：BN 对每个特征在 mini-batch 维度做归一化：x̂=(x-μ_batch)/√(σ²_batch+ε)，再经可学习参数 γ、β 仿射 y=γx̂+β。γ/β 是关键设计——若恒等映射最优，网络可学 γ=σ、β=μ 还原，保留表达能力。有效的机制级解释（2019 年后共识，原论文"缓解 internal covariate shift"已被质疑）：① 平滑损失面——BN 让损失的 Lipschitz 常数变小，允许大 5-10 倍学习率不发散，收敛显著加速；② 尺度不变性——对任意缩放 c，BN(cWx)=BN(Wx)，解耦了权重范数与有效学习率；③ 轻微正则——batch 统计的噪声等效数据增强，但大 batch 下此效应消失。训练与推理差异：训练用当前 batch 的 μ/σ（并滑动平均累积 running_μ/running_σ），推理用 running 统计（否则单样本推理时 μ=x、σ=0 输出恒为 β）。必须 model.eval() 切换，忘切换是最常见线上 bug。

\`\`\`python
import torch.nn as nn
model = nn.Sequential(
    nn.Conv2d(3, 64, 3, padding=1, bias=False),  # BN 后 bias 冗余，省掉
    nn.BatchNorm2d(64), nn.ReLU())
model.train()  # 用 batch 统计 + 更新 running
model.eval()   # 冻结 running 统计，推理确定
# 分布式训练：SyncBN 跨卡同步统计，否则各卡统计不一致
# model = nn.SyncBatchNorm.convert_sync_batchnorm(model)
\`\`\`

实际案例：ResNet 靠 BN 用大学习率把 152 层训练从数周压到数天；某检测团队 batch 从 256 减到 8（高分辨率输入显存限制），BN 统计噪声大导致 mAP 掉 3 个点，换 GroupNorm 后恢复——小 batch/检测/分割场景 GroupNorm 是标准替代。

踩坑与 tradeoff：batch<8 时 BN 统计不稳，换 GroupNorm（通道内分组，与 batch 无关）或 LayerNorm；Transformer 用 LayerNorm 不用 BN（序列内特征归一化更自然，且变长序列 batch 统计无意义）；BN 折叠：推理时把 BN 参数并入前一层卷积权重（W'=γW/σ, b'=γ(b-μ)/σ+β），零成本提速，部署标配；BN+Dropout 共用有争议，现代网络（ResNet50+）一般只用 BN。`,
    keyPoints: ["batch 归一化+γ/β 仿射保表达能力；有效主因是平滑损失面", "训练用 batch 统计，推理用 running 统计，eval() 必切", "小 batch/检测分割换 GroupNorm；推理可折叠进卷积零成本"],
    followUps: ["为什么说「缓解 internal covariate shift」的解释被质疑？", "BN 折叠进卷积的数学推导是什么？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-59",
    nodeId: "ai-nn-fundamentals",
    question: "Dropout 的原理？训练和推理有何不同？为什么能防过拟合？",
    answer: `结论：Dropout 训练时以概率 p 把神经元输出置零，存活神经元乘以 1/(1-p) 缩放（inverted dropout，保持期望不变：E[(1-p)·(1/(1-p))·x + p·0]=x），推理时不 drop、不缩放——期望对齐都已在训练侧完成。防过拟合的三个机制：① 指数级子网络集成——n 个神经元有 2ⁿ 种 drop 组合，每次前向都在训练不同的稀疏子网络，推理时等价于对指数级子网做几何平均（类似集成学习的方差缩减）；② 打破神经元共适应（co-adaptation）——某神经元不能依赖特定邻居的存在，被迫学出独立鲁棒的特征（比如不能只靠"猫胡须探测器"，还得学"猫脸轮廓"）；③ 近似贝叶斯——Gal & Ghahramani 证明带 dropout 的网络等价于深度高斯过程的近似变分推断，这就是 MC Dropout 估计不确定性的理论基础。

\`\`\`python
import torch.nn as nn
net = nn.Sequential(
    nn.Linear(768, 512), nn.GELU(), nn.Dropout(0.1),   # BERT 微调经典值
    nn.Linear(512, 256), nn.GELU(), nn.Dropout(0.1),
    nn.Linear(256, 2))
net.train()  # dropout 生效
net.eval()   # dropout 关闭，输出确定
# MC Dropout：保持 train() 模式多次前向，均值=预测，方差=不确定性
# preds = torch.stack([net(x) for _ in range(20)])  # 需手动 enable dropout
\`\`\`

实际案例：AlexNet 2012 年靠 FC 层 p=0.5 的 dropout 把 ImageNet top-5 错误率砍下约 2 个点，是深度学习爆发期的关键 trick；BERT 微调默认 0.1，NLP 小数据集上从 0.1 调到 0.3 通常 +0.5-1 个 F1；某医疗影像团队用 MC Dropout 给分割结果附加置信度，把低置信样本转人工复核，误诊率降 40%。

踩坑与 tradeoff：推理忘切 eval() 输出随机，是新手高频 bug；p 过大（>0.5）欠拟合，CNN 卷积层空间相关性强，普通 dropout 无效，要用 SpatialDropout（整通道 drop）或 DropBlock（连续块 drop）；BN+Dropout 共用会互相干扰（方差偏移问题），现代 ResNet/EfficientNet 一般只用 BN，大模型时代 LLM 预训练甚至完全不用 dropout（数据量即正则），仅微调阶段保留 0.05-0.1。`,
    keyPoints: ["训练置零+1/(1-p) 缩放保期望，推理不 drop 不缩放", "2ⁿ 子网集成+打破共适应+近似贝叶斯推断", "CNN 用 SpatialDropout；LLM 预训练不用 dropout 微调才用"],
    followUps: ["MC Dropout 为什么能估计不确定性？", "BN 和 Dropout 共用的方差偏移问题是什么？"],
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
    answer: `结论：感受野（Receptive Field）= 特征图上某像素能"看到"的输入图像区域大小。递推公式：RFₖ = RFₖ₋₁ + (kₖ-1)·Jₖ₋₁，其中 Jₖ₋₁=∏ᵢ₌₁ᵏ⁻¹ strideᵢ 是之前所有层步长的累积（jump），初始 RF=1、J=1。直觉：每加一层 k×k 卷积，视野向四周各扩 (k-1)/2 个"上层的步长单位"；stride>1 的层会放大后续所有层的有效步长，是感受野增长的最大杠杆。两个 3×3 堆叠 RF=5 等效一个 5×5，但参数 18 vs 25（省 28%）、FLOPs 也更省、且多一次非线性表达力更强——这是 VGG 的核心洞察。空洞卷积（dilation=d）等效核尺寸 k'=k+(k-1)(d-1)，不增参数扩大 RF。

\`\`\`python
def receptive_field(layers):  # layers: [(kernel, stride), ...]
    rf, jump = 1, 1
    for k, s in layers:
        rf += (k - 1) * jump   # 当前层贡献 (k-1) 个上层步长
        jump *= s              # 累积步长放大后续层贡献
    return rf
# VGG 前 4 层 3×3 conv：RF = 1+2+2+2+2 = 9
print(receptive_field([(3,1),(3,1),(3,2),(3,1)]))  # 11
# 空洞卷积 d=2 的 3×3 等效 k=5：rf += 4 * jump
\`\`\`

实际案例：VGG16 用 13 层 3×3 堆叠把 RF 推到 212，证明"小核堆叠>大核"；DeepLab 系列用 dilation=2/4 的空洞卷积在不下采样的情况下扩大 RF 做语义分割，Cityscapes mIoU 提升约 2 个点；检测网络 FPN 顶层特征 RF 数百像素，才能检测大物体，小物体检测则用底层小 RF 高分辨率特征。

踩坑与 tradeoff：理论感受野 ≠ 有效感受野（Luo et al. 证明实际贡献呈高斯分布，中心像素权重大，有效 RF 远小于理论值）；stride 下采样 RF 涨得快但丢空间细节，分割任务用空洞卷积替代部分下采样；空洞卷积 dilation 过大产生网格效应（gridding，采样点不连续），HDC（混合膨胀率 1,2,5 这类互质组合）可缓解；面试常让手推 RF，记住公式和"stride 累积放大"两个点就够。`,
    keyPoints: ["RFₖ=RFₖ₋₁+(kₖ-1)·∏strideᵢ，stride 累积放大是最大杠杆", "3×3 堆叠等效大核省参数多非线性（VGG 洞察）", "有效感受野呈高斯分布，远小于理论感受野"],
    followUps: ["空洞卷积的网格效应怎么产生、如何缓解？", "检测网络为什么浅层管小物体、深层管大物体？"],
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
    answer: `结论：BPTT（沿时间反向传播）把梯度从 T 时刻传回 t 时刻要连乘 (T-t) 个雅可比矩阵 J=diag(σ'(z))·W_hh。若最大奇异值（谱半径）<1，梯度范数以 O(ρ^(T-t)) 指数衰减——100 步后 ρ=0.9 时剩 0.9¹⁰⁰≈2.6×10⁻⁵，远处梯度约等于 0，长程依赖学不到；ρ>1 则指数爆炸（梯度 NaN）。tanh/sigmoid 饱和区导数最大 0.25，进一步压低有效 ρ，是最糟糕的激活选择。数学直觉：连乘矩阵的行为由特征值主导，就像马尔可夫链的收敛由转移矩阵谱半径决定。注意消失和爆炸是同一机制的两面，但工程上爆炸好治（梯度裁剪一刀切），消失难治（要改结构）。

\`\`\`python
import torch
torch.manual_seed(0)
W = torch.randn(64, 64) * 0.5  # 谱半径 < 1 的递归矩阵
h = torch.ones(64, requires_grad=True)
grads = []
x = h
for t in range(50):
    x = torch.tanh(W @ x)     # 每步雅可比 diag(tanh')·W 连乘
    if t % 10 == 0:
        g = torch.autograd.grad(x.sum(), h, retain_graph=True)[0]
        grads.append(g.abs().mean().item())
print(grads)  # 梯度随步数指数衰减，~10^-2 → 10^-6
\`\`\`

实际案例：2015 年前用 RNN 做机器翻译，超过 20 词的句子 BLEU 断崖下跌——主语和谓语隔太远梯度传不回去；换 LSTM 后 50 词内稳定；2017 年 Transformer 用自注意力让任意两位置直接交互（路径长度 O(1)），从根上消除连乘结构，长文本建模能力质变。这就是"RNN 梯度消失"问题驱动了 LLM 架构革命。

踩坑与 tradeoff：面试要区分——爆炸症状是 loss 突 NaN、梯度范数爆，治法是梯度裁剪 max_norm=1-5；消失症状是浅层/远时间步权重几乎不更新（打印各层梯度范数可见数量级差异），治法是 LSTM/GRU 门控（加法细胞状态）、残差连接、合理初始化、LayerNorm。LSTM 也只是缓解——细胞状态仍要穿过遗忘门连乘 f，f<1 时同样衰减，只是 f 可学到接近 1。序列超 1000 步即使 LSTM 也力不从心，直接上 Transformer/SSM（Mamba 用线性递归+硬件并行扫描，是 RNN 思想的新解法）。`,
    keyPoints: ["BPTT 连乘雅可比，谱半径<1 梯度 O(ρᵗ) 指数消失", "tanh 饱和导数≤0.25 加剧；爆炸裁剪可治，消失要改结构", "Transformer 注意力 O(1) 路径从根上消除连乘"],
    followUps: ["LSTM 细胞状态为什么能缓解但仍然治标不治本？", "Mamba/SSM 如何解决 RNN 的长序列问题？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-70",
    nodeId: "ai-rnn",
    question: "LSTM 的门控机制？如何缓解梯度消失？",
    answer: `结论：LSTM 用三门一状态结构：遗忘门 f=σ(W_f[h,x]) 决定旧细胞保留多少、输入门 i=σ(W_i[h,x]) 决定新信息 Ĉ=tanh(W_c[h,x]) 写入多少、输出门 o=σ(W_o[h,x]) 决定细胞暴露多少给隐状态 h=o⊙tanh(C)。核心更新是 Cₜ=f⊙Cₜ₋₁+i⊙Ĉ——注意这是加法结构，C 像一条贯穿时间的"传送带"。缓解梯度消失的机制：∂Cₜ/∂Cₜ₋₁=diag(f)，当遗忘门 f≈1（可学习且初始化 bias=1 正向激励）时梯度几乎无损直传，形成梯度高速公路——把 RNN 的连乘变成了连加+门控缩放。h 侧仍有连乘（∂hₜ/∂hₜ₋₁ 经过 o 和 tanh），但 C 侧通路保证了远距离的监督信号能流回来。参数量：每方向 4h(h+i)（4 组门，h=隐层，i=输入）。

\`\`\`python
import torch.nn as nn
lstm = nn.LSTM(input_size=128, hidden_size=256, num_layers=2,
               batch_first=True, dropout=0.3)
out, (h_n, c_n) = lstm(x)   # out: (B, T, 256)；h_n/c_n: (2, B, 256)
# 参数量 = 4×(256×(128+256) + 256) + 4×(256×(256+256) + 256) ≈ 0.92M
# 手写门控（理解用）：
# f = sigmoid(x@Wxf + h@Whf + bf)  # 遗忘：f≈1 保留旧记忆
# c = f * c_prev + i * tanh(x@Wxc + h@Whc + bc)  # 加法传送带
\`\`\`

实际案例：2014-2017 年 Google 神经机器翻译（GNMT）用 8 层 LSTM+Attention 把翻译质量首次推到接近人类，比短 RNN 提升 60% BLEU；科大讯飞 2016 语音识别声学模型用深层双向 LSTM，字错率降 20%+；时序预测（销量/流量）至今仍有 LSTM 基线，小数据上不输 Transformer。

踩坑与 tradeoff：f 只是缓解不是根治——f 学到 <1 时 C 侧仍衰减，超长序列（>1000）照样丢信息；LSTM 无法并行（t 依赖 t-1），训练吞吐比 Transformer 低一个数量级，这是它被取代的主因而非建模能力；遗忘门 bias 初始化为 1（或更大）是重要 trick（Jozefowicz et al. 实验 +2 个点），PyTorch 默认不这么做需手动；双向 LSTM 适合标注任务但不能做自回归生成；面试常考"为什么加法比乘法好"——加法让梯度项为 1·∂Cₜ₋₁ 形式，连加不坍缩，乘法项连乘才坍缩。`,
    keyPoints: ["三门一状态：f/i/o 门控 + Cₜ=f⊙Cₜ₋₁+i⊙Ĉ 加法传送带", "∂Cₜ/∂Cₜ₋₁=f≈1 时梯度直传，连乘变连加", "无法并行是 LSTM 被 Transformer 取代的主因"],
    followUps: ["为什么加法结构能缓解梯度消失而乘法不行？", "遗忘门 bias 为什么要初始化为 1？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-71",
    nodeId: "ai-rnn",
    question: "GRU 相比 LSTM 简化了什么？如何选择？",
    answer: `结论：GRU 合并遗忘门+输入门为更新门 z，去独立细胞状态，2 门 vs LSTM 3 门。参数量上：LSTM 有 4 组权重（输入门 i、遗忘门 f、输出门 o、候选细胞 g），GRU 有 3 组（重置门 r、更新门 z、候选隐状态 h̃），同隐层维度下 GRU 约为 LSTM 的 3/4，即少约 1/4（不是 1/3），保留加法梯度通路效果接近。小数据/求速度用 GRU，大数据/长序列用 LSTM。

实际案例：移动端语音助手用 GRU 省参数；翻译编码器大数据用 LSTM 表达力略强。现代多用 Transformer，RNN 在流式/资源受限场景仍用。

\`\`\`python
import torch.nn as nn
gru = nn.GRU(input_size=128, hidden_size=256, num_layers=2,
             batch_first=True, bidirectional=True, dropout=0.3)
out, h = gru(x)
\`\`\`

踩坑：GRU 更新门耦合遗忘输入，表达力略弱；RNN 在流式实时场景（语音流）仍优于 Transformer（需完整序列）；现代 LLM 已不用 RNN。`,
    keyPoints: ["GRU 2 门合并 LSTM 遗忘+输入", "LSTM 4 组权重 GRU 3 组，参数少约 1/4", "保留加法梯度通路"],
    followUps: ["GRU 更新门为何能合并？", "什么场景 LSTM 优于 GRU？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-72",
    nodeId: "ai-rnn",
    question: "双向 RNN 原理？为什么不能用于语言模型？",
    answer: `结论：BiRNN 由两条独立 RNN 组成——前向从 t=1 读到 T，后向从 t=T 读到 1，每个位置输出拼接 [h⃗ₜ; h⃖ₜ]，任何位置的表示都包含完整双向上下文。不能用于语言模型的原因：LM 是条件概率分解 p(x)=∏p(xₜ|x₁..ₜ₋₁)，预测第 t 词时只允许看 1..t-1；BiRNN 的后向分量 h⃖ₜ 编码了 xₜ₊₁..x_T 的未来信息，用它预测 xₜ 等于考试偷看答案——训练时每个位置都"见过"答案，loss 假性极低，部署自回归生成时根本没有未来输入，模型直接失效。这叫破坏因果性（causality）。对比：BERT 也是双向的，但它用 MLM（掩码语言建模）训练——预测被 mask 的词时看双向上下文是合法的，因为那不是自回归生成，所以 BERT 只能做理解任务不能直接续写文本。

\`\`\`python
import torch.nn as nn
bilstm = nn.LSTM(128, 256, bidirectional=True, batch_first=True)
out, _ = bilstm(x)       # (B, T, 512) = 前 256 维前向 + 后 256 维后向
# 标注任务合法：每个位置的标签预测可用全句上下文
tag_logits = nn.Linear(512, num_tags)(out)
# LM 非法替代：因果掩码单向模型
# GPT: attention 上三角 mask 强制只能看左侧
\`\`\`

实际案例：NER/分词/POS 经典架构 BiLSTM-CRF——每个字的标签依赖全句（"苹果"在"吃苹果"和"苹果手机"中词性不同，必须看后文），2015-2019 年是序列标注 SOTA；ELMo 用双向 LSTM 拿上下文词向量，但生成任务仍要单向解码；工业界实体识别至今大量用 BiLSTM-CRF，推理延迟只有 BERT 的 1/10。

踩坑与 tradeoff：BiRNN 推理必须等完整序列到齐，流式场景（实时语音字幕逐字出）不可用——流式用单向 RNN 或带有限右上下文的延迟双向；输出维度翻倍（拼接），参数也翻倍；面试高频坑："BERT 是双向的为什么能存在？"——因为 MLM ≠ 自回归 LM，目标不同约束不同；"GPT 为什么不用双向？"——双向会让每个位置预测自己，除非 mask，但 mask 了就不是语言建模。生成=单向因果，理解=双向自由，这条线划清就通了。`,
    keyPoints: ["双向拼接 [h⃗;h⃖] 含全句上下文，标注任务合法", "LM 自回归禁止未来信息，双向破坏因果性必失效", "BERT 双向因 MLM 非自回归；生成=单向，理解=双向"],
    followUps: ["BERT 双向为什么不破坏因果性？", "流式语音识别怎么兼顾双向上下文和低延迟？"],
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

实际案例：科大讯飞语音识别早期用 LSTM-CTC 声学模型；CRNN+CTC 是 OCR 经典方案，端到端无需字符级标注。

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
    B = z_i.size(0)
    z = torch.cat([z_i, z_j], 0)          # 前 B 行是视图1，后 B 行是视图2
    z = F.normalize(z, dim=1)
    sim = z @ z.T / temperature
    # 第 k 行的正样本在 B+k；第 B+k 行的正样本在 k（roll 生成）
    labels = torch.cat([torch.arange(B) + B, torch.arange(B)]).to(z.device)
    mask = torch.eye(2 * B, dtype=torch.bool, device=z.device)
    sim.masked_fill_(mask, -1e9)          # 屏蔽自身相似度
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
    id: "ai-203",
    nodeId: "ai-pretrain",
    question: "MoE 混合专家模型原理？Router 负载均衡与专家并行怎么做？",
    answer: `结论：MoE 把 Transformer 的 FFN 换成 N 个专家网络，router（门控线性层）对每个 token 输出 N 个分数，取 top-k（如 8 选 2）稀疏激活：总参数量做大但每 token 只算 k 个专家，计算量按"激活参数"计，等算力下容量更大。核心难题是负载均衡——router 易"赢者通吃"（专家坍缩，少数专家吃满多数闲置）。Switch 用辅助损失 aux loss = N·Σfᵢ·Pᵢ（fᵢ 为分到专家 i 的 token 比例，Pᵢ 为 router 给专家 i 的平均概率）鼓励均匀；DeepSeek-V3 用 aux-loss-free 方案（给 router logits 加只升不降的可调偏置，超载专家降偏置，不污染主损失）+ 细粒度专家 + 共享专家。工程上专家并行把专家放不同卡，token 经 all-to-all 通信路由；每专家容量 = 容量因子×平均 token 数，溢出 token 被丢弃走残差连接。

实际案例：Mixtral 8x7B（8 专家 top-2）开源打响 MoE；DeepSeek-V3 用 256 个细粒度专家+1 共享专家、top-8 激活；Qwen 系列 MoE 版本同路线。字节/阿里内部大模型也普遍转向 MoE 架构摊薄训练推理成本。

\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F
class MoELayer(nn.Module):
    def __init__(self, d, n_expert=8, k=2):
        super().__init__()
        self.k = k
        self.router = nn.Linear(d, n_expert, bias=False)
        self.experts = nn.ModuleList([
            nn.Sequential(nn.Linear(d, 4*d), nn.GELU(), nn.Linear(4*d, d))
            for _ in range(n_expert)])
    def forward(self, x):                    # x: (T, d)
        prob = F.softmax(self.router(x), -1)  # (T, E)
        topv, topi = prob.topk(self.k, -1)    # 每 token 选 k 个专家
        gate = topv / topv.sum(-1, keepdim=True)  # 门控权重归一化
        out = torch.zeros_like(x)
        for e, expert in enumerate(self.experts):
            sel = (topi == e).any(-1)
            if not sel.any(): continue
            w = (gate * (topi == e).float()).sum(-1, keepdim=True)[sel]
            out[sel] += w * expert(x[sel])
        # Switch 负载均衡损失：N · Σ fᵢ · Pᵢ
        f = torch.stack([(topi == e).float().mean()
                         for e in range(prob.size(1))])
        aux = prob.size(1) * (f * prob.mean(0)).sum()
        return out, aux
\`\`\`

踩坑：aux loss 权重大了伤主任务、小了不均衡，DeepSeek 的偏置法就是为绕开此权衡；容量因子小丢 token 掉点、大了显存浪费（常用 1.0-1.25）；all-to-all 通信是训练瓶颈需与计算重叠；推理时虽激活少但全量专家参数都要驻留显存。`,
    keyPoints: ["top-k 稀疏激活 总参大算力省", "aux loss/偏置法防专家坍缩", "专家并行 all-to-all+容量因子"],
    followUps: ["DeepSeek-V3 免 aux loss 如何均衡？", "MoE 推理显存为何没省？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-88",
    nodeId: "ai-frameworks",
    question: "PyTorch 的 autograd 原理？动态图相比静态图优势？",
    answer: `结论：autograd 是 PyTorch 的自动微分引擎：前向时每步运算（matmul、add、relu...）在后台创建一个 Function 节点并记录输入输出，形成有向无环计算图（DAG）；调 backward() 时从标量输出出发，按链式法则沿图反向遍历，每个节点算本地梯度乘以上游梯度，累加到叶子张量的 .grad。关键设计：动态图（define-by-run）——图在每次前向时现场构建，可以用任意 Python 控制流（if/for/while 依赖中间结果），调试时 pdb 断点、print 中间张量都自然可用；静态图（TF1 define-and-run）先把图编译好再喂数据，能做全局算子融合/内存规划等优化，但写动态逻辑极其痛苦。历史已给出答案：TF2 默认 eager + 可选 @tf.function 追踪成图，PyTorch 也加了 torch.compile/JIT 追踪——两边殊途同归，动态优先+按需静态化是终局。

\`\`\`python
import torch
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x        # 前向同时建图：PowBackward/AddBackward 节点
y.backward()              # dy/dx = 2x+3 = 7，写入 x.grad
print(x.grad)             # tensor(7.)
with torch.no_grad():     # 推理：不建图，省显存约 30-50%
    out = model(x)
h = features.detach()     # 截断梯度：下游 loss 不回传到上游
\`\`\`

实际案例：PyTorch 凭动态图和 Pythonic 体验拿下研究界 >70% 份额（Papers with Code 统计），LLaMA/GPT 系全部 PyTorch 实现；字节/阿里大模型栈以 PyTorch+Megatron 为主。生产部署则常把训练好的模型 trace/onnx 导出成静态图换推理性能（torch.compile 平均提速 20-40%）。

踩坑与 tradeoff：梯度默认累加（多 batch 共享图省显存的设计），忘 zero_grad 结果悄悄错；backward 默认只能对标量调用，非标量要传 gradient 参数；in-place 操作（add_）会破坏前向值导致反向报错；retain_graph=True 才能二次 backward；动态图灵活但每次前向重建图有开销，超大规模训练要靠 compile/并行策略摊薄。`,
    keyPoints: ["前向建 DAG 节点，backward 链式法则反向累加到 .grad", "动态图 define-by-run 支持 Python 控制流+调试友好", "终局是动态优先+按需静态化（TF2 eager / torch.compile）"],
    followUps: ["为什么梯度默认累加而不是清零？", "torch.compile 做了哪些静态图优化？"],
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
    question: "参数高效微调（PEFT）与小样本学习对比？LoRA / Adapter / Prompt 与 Few-shot 如何选？",
    answer: `结论：二者都解决"下游数据少"但路线不同。PEFT 冻结大模型主干、只训少量参数：LoRA 旁路低秩 A·B（参数<1%，推理可合并无延迟）；Adapter 在层间插小 bottleneck 模块；Prompt/Prefix Tuning 只学输入或每层的连续向量（参数最少但依赖模型规模）。小样本学习（Few-shot）更进一步：元学习（MAML/Prototypical Network）学"如何快速学新类"，或直接靠大模型 in-context learning 不给梯度只给示例。工业主流：数据几百到几万用 LoRA；每类只有几张图用度量学习/CLIP 零样本+线性探测。

实际案例：阿里商品新类目冷启动用 CLIP 零样本先上线，攒几百样本后 LoRA 微调 ViT；字节用 Adapter 做多业务共享一个主干，各业务只存小模块省显存。

\`\`\`python
from peft import LoraConfig, get_peft_model
# ViT 上 LoRA：只训 q/v 投影的低秩旁路
config = LoraConfig(r=8, lora_alpha=16, target_modules=["qkv"],
                    lora_dropout=0.05)
model = get_peft_model(vit, config)
model.print_trainable_parameters()  # 通常 <1%
# 小样本：Prototypical Network 用类原型最近邻
proto = support_emb.view(n_way, n_shot, -1).mean(1)  # 每类均值原型
pred = (query_emb[:, None] - proto[None]).norm(dim=-1).argmin(-1)
\`\`\`

踩坑：LoRA 的 r 太小学不动、太大失去省参意义；Prompt Tuning 在小模型上效果明显差；Few-shot 评估要按 episode 采样报置信区间，单次划分方差大。`,
    keyPoints: ["LoRA/Adapter/Prompt 冻结主干训小参数", "元学习学快速适应新类", "数据量定路线：零样本→LoRA→全量"],
    followUps: ["LoRA 的 r 如何选？", "Prototypical Network 原理？"],
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
    answer: `结论：ResNet(2015) 之后三条演进线——① ResNeXt(2017)：提出 cardinality（基数）维度，把 3×3 卷积拆成 32 组并行小卷积再聚合（分组卷积），同计算量下比加深/加宽收益更大，证明"多分支聚合"是独立于深度宽度的第三维度；② DenseNet(2017)：每层与之前所有层 concat 密集连接，特征复用极致，参数少但显存爆炸；③ ConvNeXt(2022)：Meta 用 ViT 的现代配方逐项改造 ResNet——7×7 大核（对齐 ViT 感受野）、GELU 换 ReLU、LayerNorm 换 BN、Pre-Norm、更少的激活与归一化层、Patchify stem（4×4 stride4）、AdamW+更长的训练 schedule+强数据增强，最终在 ImageNet 上 87.8% top-1 反超 Swin-T，证明 CNN 输的不是卷积归纳偏置而是"训练与设计的现代化程度"。

\`\`\`python
import torchvision.models as M
resnext = M.resnext50_32x4d(weights="DEFAULT")   # 32 组×4 通道分组卷积
convnext = M.convnext_tiny(weights="DEFAULT")     # 现代 CNN：大核+LN+GELU
# ResNeXt 分组卷积核心（等效基数 32）：
# nn.Conv2d(256, 256, 3, padding=1, groups=32)
\`\`\`

实际案例：商汤/旷视人脸与安防 backbone 曾长期用 ResNeXt（同 FLOPs 精度 +1-2 点）；阿里通义视觉部分链路用 ConvNeXt 做特征提取——部署端 CNN 算子友好（无 attention 的 gather/reshape），TensorRT 推理比同精度 ViT 快 30%+；DenseNet 思想则活在 ViT 时代的特征复用模块里。

踩坑与 tradeoff：分组卷积 groups 必须整除通道数，且 group 数过多会让 GPU 利用率骤降（每个 group 太小打不满 SM）；ConvNeXt 大核对训练技巧敏感（需 LayerScale 稳训练），且 7×7 卷积在部分推理芯片上不如 3×3 优化充分；选型口诀：研究刷榜 ViT/ConvNeXt，端侧部署 MobileNet 系，通用 backbone ConvNeXt 是当前 CNN 最优折中。面试要会说清：ConvNeXt 的意义不是"CNN 复兴"，而是证明架构差距<训练配方差距。`,
    keyPoints: ["ResNeXt 提出 cardinality 第三维度（分组聚合）", "ConvNeXt 用 ViT 配方现代化 CNN 反超 Swin-T", "CNN 的差距在训练配方而非卷积归纳偏置"],
    followUps: ["ConvNeXt 逐项改造 ResNet 中收益最大的是哪几项？", "分组卷积为什么 group 数过多反而慢？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-100",
    nodeId: "ai-cv-detection",
    question: "YOLO 检测原理？单阶段相比两阶段（Faster R-CNN）优势？",
    answer: `结论：YOLO（You Only Look Once）把检测统一成单次回归：图像分 S×S 网格，每网格直接预测 B 个边界框（x,y,w,h+置信度）和 C 类概率，一次前向得到所有结果。单阶段 vs 两阶段（Faster R-CNN）的本质区别：两阶段先用 RPN 生成约 2000 个候选框，再逐框分类精修——多一次"筛选-细看"所以精度上限高；单阶段在稠密网格上直接回归，省掉候选生成，速度快 3-10 倍（YOLOv8n 边缘端可达 100+ FPS）但小目标/密集目标召回天然吃亏。现代演进已大幅弥合差距：YOLOv5 引入 Mosaic 增强+CIoU 损失，YOLOv8 换 anchor-free 解耦头+Task-Aligned 正负样本分配（TaskAlignedAssigner 按分类分与 IoU 联合打分选正样本），精度追平两阶段。当前工业默认：实时场景一律 YOLO 系。

\`\`\`python
from ultralytics import YOLO
model = YOLO("yolov8n.pt")                    # nano 版 3.2M 参数
results = model("street.jpg", conf=0.4, iou=0.5)  # 推理一行
for r in results:
    for box in r.boxes:  # xyxy + conf + cls
        print(box.xyxy, box.conf, box.cls)
model.train(data="custom.yaml", epochs=100, imgsz=640,
            batch=16, optimizer="AdamW")      # 迁移训练
\`\`\`

实际案例：美团无人配送车端用 YOLOv8 实时检测行人/车辆/红绿灯，Orin 平台 30ms 内出结果；海康威视安防摄像头人流统计用 YOLO+DeepSORT 跟踪；某工业质检线从 Faster R-CNN 切到 YOLOv8s，吞吐从 8 FPS 提到 60 FPS，mAP 仅降 0.4 点。

踩坑与 tradeoff：小目标密集场景（远处车辆/芯片缺陷）YOLO 仍是短板——对策是提高输入分辨率（640→1280，FLOPs 涨 4 倍）、加 P2 小目标检测头、或切两阶段；NMS 阈值对密集遮挡敏感（人群里两个人 IoU>0.5 会被误杀）；anchor-free 的正样本分配策略比 anchor 时代更影响收敛，自定义数据集要检查正负样本统计；模型选型 nano/s/m/l/x 按延迟预算选，别为用不上的精度买单。`,
    keyPoints: ["单阶段稠密网格直接回归，速度 3-10 倍于两阶段", "v8 演进：anchor-free+解耦头+TaskAligned 分配弥合精度差", "实时场景工业默认 YOLO 系；小目标密集仍短板"],
    followUps: ["TaskAlignedAssigner 相比 IoU-based 分配解决了什么？", "YOLO 检测小目标的三种工程改进路径？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-101",
    nodeId: "ai-cv-detection",
    question: "Faster R-CNN 两阶段检测原理？RPN 作用？",
    answer: `结论：Faster R-CNN = 共享卷积 backbone + RPN（Region Proposal Network）+ RoI Head 两阶段。第一阶段 RPN：在特征图上滑窗，每位置预设 k 个 anchor（3 尺度×3 比例=9 个），对每个 anchor 二分类"有无物体"+粗回归位置偏移，输出约 2000 个候选框——替代了 Faster 之前 Fast R-CNN 用的 Selective Search（CPU 上 2 秒/图的瓶颈），让候选生成也进 GPU 端到端训练。第二阶段：用 RoI Pooling/RoI Align 把不同大小的候选区域池化成固定 7×7 特征，逐候选做 C+1 类分类+框精修回归。RPN 的关键设计是 anchor 机制——把"框在哪"的搜索问题转化为"对预设参考框做分类+微调"的局部回归问题，大幅降低学习难度；RPN 与检测头共享 backbone 特征（交替训练或联合训练）， proposal 几乎零额外计算。

\`\`\`python
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
model = fasterrcnn_resnet50_fpn(weights="DEFAULT")
model.eval()
pred = model([img_tensor])   # boxes/labels/scores
# 内部结构：
# model.rpn      # RPN：anchor 生成 + objectness 分类 + 粗回归
# model.roi_heads # RoI Align + 逐候选分类 + 精修回归
# model.backbone  # ResNet50+FPN 共享特征
\`\`\`

实际案例：医疗影像肺结节检测、工业 PCB 缺陷检测等高精度场景仍用 Faster R-CNN 系（Cascade R-CNN 三级级联把 IoU 阈值从 0.5 提到 0.6/0.7 逐级精修，COCO AP +3 点）；美团早期无人配送对漏检零容忍的场景用两阶段+多尺度测试；FPN 的引入让小目标 AP 提升约 5-8 点，是后续所有检测器的标配。

踩坑与 tradeoff：两阶段慢（RPN+逐候选 head），边缘部署基本无缘；anchor 的尺度/比例要与数据分布匹配（行人检测要竖长 anchor），不匹配会漏检——这是 anchor-free 兴起的动机；RPN 与 head 的正负样本定义不同（RPN 用 0.7/0.3 IoU 阈值，head 用 0.5），面试常混淆；RoI Pool 的两次量化取整对小目标伤害大，必须用 RoI Align（双线性插值）；Cascade R-CNN 证明单一 IoU 阈值训练对高低质量 proposal 不可兼得。`,
    keyPoints: ["RPN 用 anchor 把搜索变局部分类+回归，替代 Selective Search", "两阶段共享 backbone：RPN 粗筛 + RoI Head 精修", "anchor 尺度需匹配数据分布；Cascade 逐级提 IoU 阈值"],
    followUps: ["RoI Align 相比 RoI Pool 改进在哪、为什么小目标收益大？", "Cascade R-CNN 为什么不能用单一 IoU 阈值训练？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-102",
    nodeId: "ai-cv-detection",
    question: "DETR 端到端检测原理？为何去掉 NMS 和 anchor？",
    answer: `结论：DETR（DEtection TRansformer）把检测重定义为集合预测问题：CNN backbone 提特征 → Transformer Encoder 全局建模 → Decoder 用 N 个可学习 object query 交叉注意力查询场景 → FFN 头直接输出 N 个（类别，框）集合。去掉 NMS 的关键是二分图匹配监督：训练时用匈牙利算法在 N 个预测和 G 个真值间求最小代价匹配（代价=分类损失+L1+GIoU），每个真值恰好匹配一个预测，其余预测监督为"背景"——一对一监督让模型自己学会"一个物体只出一个框"，冗余框在训练中就被压掉，推理自然无需 NMS 去重。去掉 anchor 的原因：object query 本身就是可学习的"软 anchor"，靠注意力自适应聚焦，无需手工设计尺度比例。这套范式把检测 pipeline 从"anchor+NMS 的手工后处理"变成纯端到端可微。

\`\`\`python
from transformers import DetrImageProcessor, DetrForObjectDetection
import torch
processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")
inputs = processor(images=img, return_tensors="pt")
with torch.no_grad():
    out = model(**inputs)   # logits: (1, 100, 92)；pred_boxes: (1, 100, 4)
# 训练核心：匈牙利匹配 loss
# indices = linear_sum_assignment(cost_class + cost_bbox + cost_giou)
\`\`\`

实际案例：DETR 原版收敛极慢（500 epoch，比 Faster R-CNN 慢 10 倍+）且小目标差，Deformable DETR 用多尺度可变形注意力（每 query 只采样少数关键点）把收敛压到 50 epoch；后续 DINO/DAB-DETR 把 query 显式建模为锚框，COCO AP 冲到 63；字节在广告素材元素检测中用过 DETR 变体，省去 NMS 阈值在不同素材分布间反复调参的成本。

踩坑与 tradeoff：query 数量 N 是硬上限——图里物体超过 N（如密集人群 100+）直接漏检，需按数据分布调大；注意力全局建模让大分辨率输入显存爆炸（O((HW)²)），Deformable 版本才实用；训练慢的主因是二分图匹配早期分配极不稳定（匈牙利分配在训练初期频繁跳变），DINO 用对比去噪训练稳定匹配；工业实时场景仍打不过 YOLO，DETR 的价值在范式启发（端到端集合预测影响了后续分割/跟踪/多模态检测）。`,
    keyPoints: ["集合预测：N 个可学习 query 一次出 N 个（类，框）", "匈牙利一对一匹配监督，模型自学不重复出框，去 NMS", "Deformable/DINO 解决收敛慢与小目标差"],
    followUps: ["匈牙利匹配的代价矩阵由哪几项组成？", "为什么二分图匹配训练初期不稳定、DINO 如何改善？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-103",
    nodeId: "ai-cv-detection",
    question: "NMS 原理？Soft-NMS 改进？mAP 如何计算？",
    answer: `结论：NMS（非极大值抑制）是检测后处理：按置信度降序排序，贪心取最高分框入保留集，删除所有与其 IoU>阈值的框，对剩余框重复直到清空——同一物体的多个重叠候选只留最优那个。缺陷：硬删除对密集遮挡不友好（两个人 IoU=0.6，低分框直接被删→漏检）。Soft-NMS 改进：不删除而是按重叠程度衰减分数（线性 s=s(1-IoU) 或高斯 s=s·e^(-IoU²/σ)），被压分的框若仍高于置信阈值还有机会保留，密集场景 AP+1-2 点。mAP 计算：单类别下按置信度排序，逐步累积 TP/FP，取 11 点或全点插值算 PR 曲线下面积得 AP；COCO 标准 mAP@[0.5:0.95] 在 IoU 阈值 0.5 到 0.95 步长 0.05 共 10 个阈值各算 AP 取平均，再对所有类别平均——同时考核"检得准"（定位质量）和"分得对"。AP50 宽松、AP75 严格。

\`\`\`python
def soft_nms(boxes, scores, sigma=0.5, score_thr=0.001):
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]; keep.append(i)
        ious = box_iou(boxes[i], boxes[order[1:]])
        scores[order[1:]] *= np.exp(-(ious ** 2) / sigma)  # 高斯衰减
        order = order[1:][scores[order[1:]] > score_thr]
        order = order[scores[order].argsort()[::-1]]       # 重排序
    return keep
\`\`\`

实际案例：COCO 比赛密集场景（person 类）Soft-NMS 稳定 +1 AP；某安防人流检测把硬 NMS 换 Soft-NMS 后密集区域漏检率降 15%；DIoU-NMS 用中心点距离+IoU 联合判重，对相邻同向物体（排队行人）区分更好，YOLOv4 起成为可选配置。

踩坑与 tradeoff：NMS 阈值是召回-精度旋钮——调低（0.3）精度升召回降，调高（0.7）反之，必须按业务选；类别间要不要做 NMS？标准是逐类独立做（同类框才互相抑制）；NMS 不可微，是检测端到端化的最后障碍（DETR 的动机之一）；视频检测用时序 NMS（跨帧关联后再抑制）避免闪烁；mAP 对小类别敏感，类别不均衡时报告 per-class AP 更诚实；矩阵化实现 NMS 可 GPU 加速（batched_nms），TorchVision 自带。`,
    keyPoints: ["NMS 贪心删 IoU 超阈值框；Soft-NMS 高斯衰减分数不硬删", "mAP=各类别 PR 曲线下面积均值；COCO 用 IoU 0.5:0.95 十阈值", "NMS 不可微是端到端检测的最后障碍"],
    followUps: ["DIoU-NMS 相比普通 NMS 多考虑了什么？", "为什么 COCO mAP 要用 10 个 IoU 阈值平均？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-104",
    nodeId: "ai-cv-detection",
    question: "Anchor-free 检测（FCOS/CenterNet）原理？相比 anchor-based 优势？",
    answer: `结论：Anchor-free 不再预设 anchor 框，直接在特征图上逐位置预测目标。两条路线：① FCOS：每个特征点回归它到所属目标框四边的距离 (l,t,r,b)+分类+centerness 分支（预测该点到目标中心的归一化距离，用于抑制远离中心的低质量框）；② CenterNet：把检测变成关键点估计——预测类别热力图（峰值=目标中心）+中心偏移+宽高回归，peak 提取替代 NMS。相比 anchor-based 的优势：超参大幅减少（不用调 anchor 尺度/比例/数量，这些超参换数据集就要重调）；省去 anchor-GT 的 IoU 匹配计算；内存省（不用存储数万元 anchor 的中间结果）；正样本定义更简洁（FCOS 用中心区域、CenterNet 用高斯核半径），对尺度变化大/长宽比极端的目标天然友好（anchor 覆盖不到的形状 anchor-free 直接回归）。

\`\`\`python
# FCOS 头：逐像素回归四边距 + 分类 + centerness
cls, reg, ctr = head(fpn_feat)   # (B,C,H,W),(B,4,H,W),(B,1,H,W)
score = cls.sigmoid() * ctr.sigmoid()   # 中心度加权抑制边缘低质框
# CenterNet 头：热力图 peak 即中心
hm, wh, off = head(feat)  # heatmap(B,C,H,W) + wh + offset
# 训练时 GT 用高斯核撒到热力图，Focal Loss 变体监督
\`\`\`

实际案例：YOLOv8/v11 全面转向 anchor-free 解耦头，跨数据集迁移不用重算 anchor 聚类，COCO AP 还 +0.5；美团无人配送密集行人检测用 CenterNet——行人是高重叠场景，anchor 匹配歧义大，中心点表示更干净；FCOS 发表时在 COCO 上以 anchor-free 身份反超 RetinaNet 约 2 个点，终结了"anchor-free 精度差"的认知。

踩坑与 tradeoff：FCOS 的 centerness 分支必不可少——没有它，大量远离目标中心的点回归出低质框，AP 掉 3-5 点；CenterNet 的大下采样（×4）丢失小目标中心定位精度，配 DCN（可变形卷积）缓解；anchor-free 的正负样本分配（如 ATSS/SimOTA/TaskAligned）比 anchor 时代更影响上限，是调参重心；多目标中心重叠（极端密集）CenterNet 会合并漏检；anchor-based 并没死——大模型检测器（DINO 等）又借回了"显式锚框 query"思想，说明锚点概念本身有价值，烦的只是手工调参。`,
    keyPoints: ["FCOS 逐点回归四边距+centerness 抑低质；CenterNet 热力图峰值即中心", "优势：免 anchor 超参、免 IoU 匹配、尺度/长宽比友好", "centerness 与正负样本分配是精度关键"],
    followUps: ["FCOS 没有 centerness 为什么 AP 掉 3-5 点？", "ATSS/SimOTA 分配策略的核心思想差异？"],
    favorited: false,
    bigTech: false,
  },
  // ===== 17. ai-cv-segmentation =====
  {
    id: "ai-105",
    nodeId: "ai-cv-segmentation",
    question: "语义分割 vs 实例分割 vs 全景分割区别？U-Net 原理？",
    answer: `结论：三种分割的任务定义——语义分割：逐像素分类，同类实例不可分（两个并排的人都标"person"，无法区分）；实例分割：检测+逐实例掩码，同类不同实例分开（人 A、人 B 各一个 mask），只管可数目标（thing）；全景分割=语义+实例的统一：thing 类区分实例、stuff 类（天空、道路等不可数背景）只分类别，每像素恰好一个（类别，实例 id) 标签。U-Net 原理：对称 encoder-decoder——encoder 逐层下采样提语义，decoder 逐层上采样恢复分辨率，关键是跳跃连接把 encoder 各层的高分辨率特征 concat 到 decoder 对应层，补偿下采样丢失的空间细节（分割需要"语义强+定位准"，高层语义强但定位差，低层反之，跳跃连接两全）。输入输出同尺寸，全卷积无 FC。

\`\`\`python
import segmentation_models_pytorch as smp
model = smp.Unet(encoder_name="resnet34", encoder_weights="imagenet",
                 in_channels=3, classes=1)   # 二值分割
mask = model(img)                            # (B,1,H,W) sigmoid 概率图
# 跳跃连接本质：decoder_i 输入 = concat(upsample(decoder_{i+1}), encoder_i)
# 变体：U-Net++ 嵌套密集跳跃；nnU-Net 自适应配置（医学 SOTA 基线）
\`\`\`

实际案例：医学影像几乎被 U-Net 家族统治——联影/推想肺结节分割、细胞分割大赛冠军方案多为 U-Net 变体；nnU-Net 提出"无需调参的 U-Net 自动配置"，在 50+ 医学分割挑战赛霸榜，证明结构简单+配置合理>花哨结构；百度 Apollo 可行驶区域用语义分割（道路是 stuff 无需实例）；字节视频人像分割（背景虚化）是实时语义分割。

踩坑与 tradeoff：U-Net 输入尺寸需被 2^depth 整除（5 次下采样要 32 的倍数），否则跳跃连接尺寸对不齐；类别极不平衡（前景 1%）用 Dice/Focal Loss 替代 CE；encoder 用 ImageNet 预训练 backbone 收敛快一倍；实例分割别用 U-Net——它不分实例，要 Mask R-CNN 或 query-based（Mask2Former）；3D 医学数据用 3D U-Net 或 2.5D（相邻切片当通道）折中显存；全景分割别指望一个头搞定，thing/stuff 分支分开再合并是工程常态。`,
    keyPoints: ["语义不区分实例，实例只分管 thing，全景统一两者", "U-Net 跳跃连接：高分辨率细节+高层语义两全", "nnU-Net 证明：自动配置的朴素 U-Net 是医学分割强基线"],
    followUps: ["U-Net++ 的嵌套跳跃连接解决了什么问题？", "全景分割中 thing 与 stuff 冲突时如何仲裁？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-106",
    nodeId: "ai-cv-segmentation",
    question: "DeepLab 系列原理？空洞卷积和 ASPP 作用？",
    answer: `结论：DeepLab 系列解决分割的核心矛盾——深层特征语义强但空间分辨率被下采样摧毁。三大武器：① 空洞卷积（Atrous/Dilated Conv）：核元素间插入 dilation-1 个空隙，dilation=r 的 3×3 卷积等效感受野 3+2(r-1)，不增参数、不降分辨率地扩大感受野——backbone 后两个下采样用 dilation=2/4 替代，特征图保持 1/8 分辨率而非 1/32；② ASPP（空洞空间金字塔池化）：并行多个 dilation（如 6/12/18）的空洞卷积+全局平均池化，同层捕获多尺度上下文——远处大车和近处行人一次覆盖；③ DeepLabv3+ 补回 encoder-decoder：低层特征经 1×1 降维后与 decoder 特征 concat，细化边界。版本线：v1 空洞+CRF → v2 ASPP → v3 改 ASPP+去 CRF → v3+ 加 decoder → 后续被 Transformer 系（SegFormer/Mask2Former）接棒。

\`\`\`python
from torchvision.models.segmentation import deeplabv3_resnet50
model = deeplabv3_resnet50(weights="DEFAULT")
out = model(img)["out"]          # (B, num_classes, H/8, W/8) 再上采样
# ASPP 核心结构（简化）：
# branches = [Conv(3,dilation=6), Conv(3,dilation=12), Conv(3,dilation=18),
#             GlobalAvgPool -> 1x1 -> upsample]
# out = concat(branches) -> 1x1 融合
\`\`\`

实际案例：自动驾驶场景分割长期被 DeepLab 系统治——百度 Apollo、地平线征程平台车道线/可行驶区域分割用 DeepLabv3+ 变体，ASPP 的多尺度对"近处大车道线+远处小锥桶"至关重要；某短视频人像分割项目从 FCN 换 DeepLabv3+，边界 IoU +4 点，主要靠 decoder 低层融合修毛发边缘。

踩坑与 tradeoff：空洞卷积的网格效应（gridding）——dilation 采样点不连续导致棋盘状伪影，HDC（混合膨胀率，如 1,2,5 互质组合）缓解；dilation 过大时 3×3 核实际有效权重退化（边缘位置采不到物体内），DeepLabv3 论文指出 r=24 时接近 1×1 卷积失效；空洞卷积保分辨率的代价是显存/算力倍增（特征图 1/8 vs 1/32 面积 16 倍）；CRF 后处理能修边界但慢且难调，v3+ 之后基本弃用；现代替代：SegFormer（高效 Transformer 分割）、SAM 系（可提示分割）是 2024+ 新项目选型起点。`,
    keyPoints: ["空洞卷积不降分辨率扩感受野；ASPP 多 dilation 并行覆盖多尺度", "v3+ = ASPP + 轻量 decoder 修边界，免 CRF", "网格效应用 HDC；特征图大导致显存算力倍增"],
    followUps: ["为什么 dilation 过大会让 3×3 空洞卷积退化成 1×1？", "SegFormer 相比 DeepLab 的设计取舍是什么？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-107",
    nodeId: "ai-cv-segmentation",
    question: "Mask R-CNN 实例分割原理？RoI Align 解决什么问题？",
    answer: `结论：Mask R-CNN = Faster R-CNN + 第三条并行分支：对每个 RoI 在分类/回归之外加一个微型 FCN，输出 K×28×28 的类别相关掩码（K 个类各预测一个二值 mask，训练只监督 GT 类那一路，推理按预测类取对应 mask，避免类间竞争）。RoI Align 解决的是 RoI Pool 的量化错位：RoI Pool 有两次取整——proposal 浮点坐标取整到特征图网格、池化分 bin 时再取整，几像素偏差对小目标/边界是致命的（分割要求像素级对齐）。RoI Align 取消取整：bin 内规则采 4 个点，每点用双线性插值取亚像素值再平均，坐标全程浮点连续——Mask AP 提升约 3 点、关键点检测 AP 提升更大。这一改动的本质：检测可以容忍几像素错位，分割/关键点不行。

\`\`\`python
from torchvision.models.detection import maskrcnn_resnet50_fpn
model = maskrcnn_resnet50_fpn(weights="DEFAULT")
out = model([img_tensor])[0]
# out: boxes(N,4), labels(N,), scores(N,), masks(N,1,28,28)
mask = (out["masks"][0, 0] > 0.5).float()   # 28x28 -> resize 回框内贴图
# RoI Align: torchvision.ops.roi_align(feat, boxes, output_size=(7,7),
#                                      spatial_scale=1/16, sampling_ratio=2)
\`\`\`

实际案例：COCO 实例分割多年基线，商汤/旷视早期商品与工业质检实例分割都用它；某电商"拍立淘"商品抠图用 Mask R-CNN 实例分割+matting 后处理，自动抠图通过率 85%+；遥感建筑提取用 Mask R-CNN 区分相邻楼宇（语义分割分不开紧贴的两栋楼，实例分割可以）。

踩坑与 tradeoff：mask 分支 28×28 分辨率对大目标是瓶颈（放大回 1000px 框锯齿明显），PointRend 用"渲染思想"在不确定点迭代上采样修边界；RoI Align 的 sampling_ratio=-1 表示自适应（bin 内像素数开方），不是真的 -1；类别相关 mask（K 路）vs 类别无关（1 路）——K 路解耦类别是涨点关键；两阶段实例分割慢，YOLACT/SOLOv2 等单阶段方案用原型+系数组合换速度；现代演进：Mask2Former 用 query+掩码分类统一语义/实例/全景，Mask R-CNN 已是"教学与轻量场景"角色。`,
    keyPoints: ["Faster R-CNN + 每 RoI 微型 FCN 出 K 路类别相关 mask", "RoI Align 双线性插值消量化错位，Mask AP+3", "分割要像素级对齐，检测可容几像素——这是两者分水岭"],
    followUps: ["类别相关 mask（K 路）为什么比类别无关（1 路）好？", "PointRend 的渲染思想如何修大目标边界？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-108",
    nodeId: "ai-cv-segmentation",
    question: "分割损失函数 Dice Loss / Focal Loss / IoU Loss 区别？类别不平衡怎么处理？",
    answer: `结论：三者从不同角度解不平衡。Dice Loss=1-2|A∩B|/(|A|+|B|)，直接优化集合重叠度：梯度大小与预测面积无关，天然对小目标加权（小目标错 10 个像素 Dice 掉很多，大目标错 10 个像素几乎无感），医学分割标配；缺点是梯度随重叠度非线性变化，训练初期（重叠≈0）梯度不稳。Focal Loss= -(1-pₜ)^γ log pₜ，给 CE 加调制因子：易分样本 pₜ→1 时 (1-pₜ)^γ→0 权重趋零，难分样本权重保持——让模型别在"海量简单背景"上刷梯度，专注难例，γ=2 常用；它处理的是"样本级"难易不平衡，RetinaNet 用它让单阶段检测器打过两阶段。IoU Loss（GIoU/DIoU/CIoU）：把不可微的 IoU 指标变成可微损失直接优化，DIoU 加中心距惩罚、CIoU 再加长宽比一致性，解决 IoU=0 时无梯度的问题。工程标配组合：CE+Dice（分割，CE 稳训练+Dice 顾小目标），检测用 Focal+CIoU。

\`\`\`python
def dice_loss(pred, target, eps=1e-6):
    pred = pred.sigmoid()
    inter = (pred * target).sum(dim=(1,2))
    return 1 - ((2*inter + eps) / (pred.sum(dim=(1,2)) + target.sum(dim=(1,2)) + eps)).mean()
def focal_loss(logit, target, gamma=2.0, alpha=0.25):
    p = logit.sigmoid(); pt = torch.where(target==1, p, 1-p)
    w = torch.where(target==1, alpha, 1-alpha)
    return (-w * (1-pt)**gamma * pt.clamp_min(1e-8).log()).mean()
# 分割组合：loss = ce + dice（各 0.5 或 1:1）
\`\`\`

实际案例：联影肺结节分割前景占全图 <0.5%，纯 CE 收敛到"全背景"平凡解，换 Dice 后 Dice 系数 0→0.78；RetinaNet 用 Focal 把单阶段 AP 提升约 4 点追平 Faster R-CNN；某工业缺陷检测缺陷像素占比 0.01%，用 Focal(γ=2)+Dice 组合 + OHEM（在线难例挖掘，只回传 top-K 难像素梯度）才把召回做到 95%。

踩坑与 tradeoff：Dice 必须加 eps 防分母 0，且多空类别（GT 全背景）需特殊处理（给该样本 Dice=1 或跳过）；Focal 的 γ 太大会让难例梯度爆炸（标注噪声被当成难例过拟合），数据脏时 γ 调小到 1；极端不平衡组合拳：Focal/Dice + OHEM + 重采样（过采样前景 patch）；多类分割 Dice 逐类算再平均，宏平均会偏向小类（符合需求但要知晓）；Lovász-Softmax 直接优化 IoU 的次模松弛，边界指标更好，竞赛常用但工业少见。`,
    keyPoints: ["Dice 按重叠度优化，小目标权重天然大；初期梯度不稳", "Focal (1-pₜ)^γ 压易分样本权重，治样本级难易不均", "CE+Dice 分割标配；检测 Focal+CIoU；极端不平衡加 OHEM"],
    followUps: ["Focal Loss 的 γ 为什么数据脏时要调小？", "OHEM 在线难例挖掘与 Focal 能叠加吗？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-109",
    nodeId: "ai-cv-segmentation",
    question: "医学图像分割（MRI/CT）有何特殊性？如何处理小目标和不平衡？",
    answer: `结论：医学分割与自然图像有五大差异：① 数据是 3D 体积（CT/MRI 序列），空间上下文跨切片；② 标注极贵（专家逐层勾画，一个病例数小时），标注集常只有几百例；③ 前景极小（肺结节 5-10mm，占全图 <0.1%），类别极端不平衡；④ 边界模糊低对比（肿瘤浸润区与正常组织灰度渐变），且标注者间一致性差（两位医生边界可差数毫米）；⑤ 模态特殊（CT 有 HU 值物理标定、MRI 多序列 T1/T2/FLAIR 互补）。对应策略：3D 用 3D U-Net/V-Net，显存不够退 2.5D（相邻切片堆叠为多通道）或 patch 滑窗训练；小数据靠 ImageNet/自监督预训练+强数据增强（弹性形变模拟器官形变、灰度抖动）；不平衡用 Dice Loss+前景过采样；边界模糊用 Boundary Loss/HD Loss（豪斯多夫距离）显式监督边界；标注噪声用多标注者融合（STAPLE 算法）或软标签训练。nnU-Net 把这些工程决策自动化，是事实标准。

\`\`\`python
from monai.networks.nets import UNet
model = UNet(spatial_dims=3, in_channels=1, out_channels=2,
             channels=(16,32,64,128), strides=(2,2,2))  # 3D U-Net
# patch 训练：128³ 滑窗 crop，推理时 sliding_window_inference
from monai.inferers import sliding_window_inference
pred = sliding_window_inference(volume, roi_size=(128,128,128),
                                sw_batch_size=4, predictor=model, overlap=0.5)
\`\`\`

实际案例：MICCAI 分割挑战赛长期被 nnU-Net 霸榜（自动按数据指纹选 patch 尺寸/归一化/增强）；联影 uAI 肺结节检测分割进入数千家医院体检流程，敏感度 95%+ 时平均每例假阳 <1；某眼底血管分割项目用 2.5D U-Net+Dice+Boundary Loss，在 200 例标注上达到专家间一致性水平。

踩坑与 tradeoff：3D 显存爆炸——patch 训练+梯度检查点+混合精度三件套；CT 要按 HU 窗宽窗位归一化（肺窗 [-1200,600]），直接 min-max 归一会丢诊断信息；跨中心域偏移（不同设备/协议灰度分布不同）是落地最大坑，需按中心做标准化或域适应；后处理必须连通域分析去假阳（保留最大连通域/按尺寸过滤）；合规：医疗 AI 需 NMPA 三类证，模型更新要重新注册，工程上版本冻结+可追溯是硬要求。`,
    keyPoints: ["3D 体积+标注贵+前景<0.1%+边界模糊+模态特殊五大差异", "2.5D/patch 折中显存；Dice+Boundary Loss 治不平衡与模糊", "nnU-Net 自动配置是事实标准；跨中心域偏移是落地大坑"],
    followUps: ["STAPLE 算法如何融合多标注者的标注？", "为什么 CT 要用 HU 窗宽窗位归一化而不是 min-max？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-110",
    nodeId: "ai-cv-segmentation",
    question: "自动驾驶分割场景：BEV 感知、多视角融合如何做？",
    answer: `结论：自动驾驶感知要把 6-8 路环视相机的透视图像统一到车辆坐标系的鸟瞰图（BEV）做检测/分割——BEV 空间尺度一致（1 像素=N 厘米）、无透视畸变、天然适配多传感器融合与下游规划。两条主流技术路线：① LSS（Lift-Splat-Shoot）：对每个像素预测深度分布，把特征按深度加权"抬升"（Lift）到 3D 视锥点云，再经相机内外参投影 splat 到 BEV 网格池化——深度是隐式学的，端到端可微；② BEVFormer：预定义 BEV 网格 query，用 spatial cross-attention 让每个 BEV 格子按 3D→2D 投影去各相机特征上采样，再用 temporal self-attention 融合历史帧 BEV——注意力代替显式深度，时序信息让被遮挡目标可推断。工程栈：相机标定（内外参）是地基，时序融合要做 ego-motion 补偿（本车运动把历史 BEV 对齐到当前坐标系）。

\`\`\`python
# LSS 核心（简化）：每像素深度分布加权抬升 -> BEV splat
depth_dist = depth_net(img_feat)        # (B,C,D,H,W) D 个深度面概率
lifted = depth_dist.unsqueeze(1) * img_feat.unsqueeze(2)  # 视锥特征
bev = splat(lifted, cam_intrinsic, cam_extrinsic)  # 投影到 BEV 网格求和
# BEVFormer 核心：BEV query 交叉注意力采样多相机特征 + 时序自注意力
bev = temporal_self_attn(bev_query, prev_bev_aligned)
bev = spatial_cross_attn(bev, multi_cam_feats, proj_matrix)
seg = seg_head(bev)   # BEV 空间可行驶区域/车道线分割
\`\`\`

实际案例：特斯拉 2021 AI Day 公布 BEV+Transformer 环视融合后，国内全面跟进——蔚来 NOP+、小鹏 XNGP 用 BEVFormer 类架构做城市 NOA；华为 ADS 2.0 用 GOD 网络（BEV 占用网络 Occupancy），不识别物体类别只预测"该体素是否被占据"，解决了异形障碍物（侧翻卡车、掉落轮胎）漏检问题；理想 L 系用 BEV+占用网格实现无图城市领航。

踩坑与 tradeoff：相机标定漂移（颠簸导致外参变化）会让 BEV 融合错位——需在线标定或标定鲁棒训练；时序融合帧数 2-4 帧收益明显，再多收益递减但延迟内存线性涨；BEV 网格分辨率（0.5m vs 0.2m）直接决定小目标（锥桶/宠物）检出能力与算力消耗，200m 感知范围 0.2m 网格的 BEV query 是百万级，需稀疏化；纯视觉 vs 激光雷达之争：视觉 BEV 成本低但深度靠学，雨雪夜间掉点明显，量产车多为视觉+毫米波/激光冗余；评测要看 mAVE（速度误差）不只看 mAP——规划对速度敏感。`,
    keyPoints: ["BEV 统一车系鸟瞰空间：尺度一致+无透视畸变+适配融合规划", "LSS 显式深度抬升 vs BEVFormer query 交叉注意力", "时序融合需 ego-motion 补偿；占用网络解决异形障碍"],
    followUps: ["Occupancy Network 相比 BEV 检测解决了什么长尾问题？", "相机外参在线漂移如何感知与补偿？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-111",
    nodeId: "ai-cv-segmentation",
    question: "全景分割（Panoptic Segmentation）原理？stuff 与 thing 如何统一？",
    answer: `结论：全景分割（Panoptic Segmentation）要求每个像素同时获得语义标签和实例 id：stuff（天空/道路/草地等不可数背景）只分类别，thing（人/车等可数目标）区分实例，输出是像素级 (class, instance_id) 二元组且每像素唯一。统一的技术演进：早期启发式合并——分别跑语义分割（FCN）和实例分割（Mask R-CNN），按规则仲裁重叠像素（thing 优先），接缝处质量差；Panoptic FPN 用共享 FPN backbone+两分支端到端训练缓解；MaskFormer/Mask2Former 范式革命——把分割统一为"掩码分类"：N 个 query 各预测一个二值掩码和类别分布（类别集含 stuff 类），匈牙利匹配监督，thing 的实例性由"一个 query 一个掩码"天然保证，一套架构同时做语义/实例/全景，Mask2Former 在三大任务全部 SOTA。指标 PQ=SQ×RQ：SQ（分割质量）= 匹配段平均 IoU，RQ（识别质量）= 匹配段的 F1（IoU>0.5 算 TP），乘积惩罚"分得准但认错"和"认得对但分不准"。

\`\`\`python
# Mask2Former 统一推理（HuggingFace）
from transformers import Mask2FormerForUniversalSegmentation
model = Mask2FormerForUniversalSegmentation.from_pretrained(
    "facebook/mask2former-swin-large-coco-panoptic")
out = model(pixel_values=img)   # masks_queries_logits + class_queries_logits
# 后处理：每像素取 argmax(类别概率 × 掩码概率)，thing 类按 query 分实例
# PQ = SQ × RQ；SQ = mean IoU(matched)；RQ = F1(matched @IoU>0.5)
\`\`\`

实际案例：华为/地平线智驾平台用全景分割一次输出可行驶区域（stuff）+车辆行人（thing），供下游规划直接消费；机器人抓取场景用全景分割区分桌面（stuff）和每个物体（thing）；某地图厂商用全景分割从街景自动提取道路要素，生产效率提升 5 倍。

踩坑与 tradeoff：thing/stuff 冲突仲裁（一个像素同时被两分支声称）是启发式合并的核心 bug 源，Mask2Former 的掩码分类从根上避免；PQ 的 0.5 IoU 阈值对小实例苛刻（小目标几个像素偏差就 <0.5），报告时看 per-class 分解；query 数量限制实例上限（同 DETR）；掩码分类范式训练需要掩码级标注，stuff 的"实例 id"约定要统一（通常同类别 stuff 共享一个 id 或忽略）；端侧部署 Mask2Former 比 DeepLab 重，轻量场景仍是"语义分割+规则"。`,
    keyPoints: ["每像素唯一 (class, instance_id)；stuff 分类别，thing 分实例", "Mask2Former 掩码分类统一三任务：query 出掩码+类别", "PQ=SQ×RQ 同时惩罚分割质量与识别质量"],
    followUps: ["Mask2Former 的掩码分类范式为什么天然区分实例？", "PQ 指标的 0.5 IoU 阈值对小实例有何影响、如何改进？"],
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
    answer: `结论：DDPM（Denoising Diffusion Probabilistic Model）把生成建模为两个马尔可夫链。前向（扩散）过程：T 步逐步加高斯噪声 q(xₜ|xₜ₋₁)=N(xₜ; √(1-βₜ)xₜ₋₁, βₜI)，βₜ 是预设噪声调度（linear/cosine），T 步后 x_T≈纯噪声；重要性质是任意步可闭式采样：xₜ=√(ᾱₜ)x₀+√(1-ᾱₜ)ε，ᾱₜ=∏(1-βₛ)，训练不用逐步模拟。逆向（生成）过程：从纯噪声出发逐步去噪 p_θ(xₜ₋₁|xₜ)，神经网络（U-Net，注入时间步 embedding）学习每步去噪方向。训练目标用简化版：随机采 t 和噪声 ε，让网络预测噪声 ε_θ(xₜ,t)，MSE 损失——预测噪声等效于预测 score 函数（对数密度的梯度），这就是与 score-based 模型的统一视角。相比 GAN：没有对抗博弈所以训练稳定不崩、极大极小目标变单一回归、似然可界定所以多样性好（GAN 模式崩溃就是因为生成器只骗判别器不覆盖分布）。

\`\`\`python
def q_sample(x0, t, noise):      # 前向：任意 t 一步加噪（闭式）
    return sqrt_alphas_cumprod[t]*x0 + sqrt_one_minus_alphas[t]*noise
def p_sample(model, x_t, t):     # 逆向：一步去噪
    eps = model(x_t, t)
    mean = (x_t - betas[t]/sqrt_one_minus_alphas[t]*eps) / sqrt_alphas[t]
    return mean + torch.sqrt(betas[t]) * torch.randn_like(x_t)  # t>0 加随机
def train_step(model, x0):       # 训练：预测噪声 MSE
    t = torch.randint(0, T, (x0.size(0),))
    noise = torch.randn_like(x0)
    return F.mse_loss(model(q_sample(x0, t, noise), t), noise)
\`\`\`

实际案例：Stable Diffusion/Midjourney/DALL·E 2-3 全是扩散家族——DALL·E 2 用扩散生成 CLIP 图像嵌入再解码；视频生成 Sora/可灵/Pika 用时空扩散（DiT 架构）；字节即梦、腾讯混元文生图底座均为扩散模型；语音合成（NaturalSpeech）也用扩散替代自回归提速。

踩坑与 tradeoff：采样需几十到上千步串行去噪，慢是最大短板——DDIM 把马尔可夫改非马尔可夫确定性采样（步数 1000→50），一致性模型/LCM 蒸馏到 1-4 步但质量略降；噪声调度影响大：linear 在高分辨率下信息毁太快，cosine 更平缓；预测目标选 ε 还是 x₀ 还是 v-parameterization（SDXL 用 v）影响训练稳定；U-Net 的时间步 embedding（sinusoidal+MLP 注入各层）不可省；classifier-free guidance（训练时 10-20% 概率丢条件，推理用 ε_uncond+w(ε_cond-ε_uncond) 外推）是质量-多样性旋钮，w=7.5 常用，过大过饱和失真。`,
    keyPoints: ["前向闭式加噪 xₜ=√ᾱₜx₀+√(1-ᾱₜ)ε；逆向学预测噪声", "预测 ε=学 score 函数；训练单一回归无对抗，稳定不崩", "采样慢用 DDIM/一致性蒸馏；CFG 控制质量-多样性"],
    followUps: ["DDIM 为什么能跳步采样？推导的关键假设是什么？", "classifier-free guidance 为什么不用单独训练分类器？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-115",
    nodeId: "ai-cv-generative",
    question: "Stable Diffusion 原理？为何在 latent 空间做扩散？",
    answer: `结论：Stable Diffusion（LDM, Latent Diffusion Model）的核心洞察：图像像素空间有大量感知冗余，扩散模型直接在像素上算（512²×3=78 万维）太贵——先用感知压缩：训练一个自编码器（VAE/VQGAN，带感知损失+PatchGAN 判别器）把 512×512×3 图像压成 64×64×4 的 latent（48 倍降维，f=8 下采样），在 latent 空间做扩散，最后解码回像素。收益：扩散的 U-Net 输入从 78 万维变 1.6 万维，训练推理算力降一个数量级，单卡可训——这是 SD 能开源、能在消费级显卡跑起来的根本原因；且 latent 更"语义化"（压缩已滤掉高频噪声），扩散学语义结构更高效。文本条件：CLIP text encoder（ViT-L）把 prompt 编成 77×768 嵌入，通过交叉注意力注入 U-Net 各层（Q 来自图像特征，K/V 来自文本），让每个去噪步都"看着"文本。

\`\`\`python
from diffusers import StableDiffusionPipeline
import torch
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1", torch_dtype=torch.float16).to("cuda")
img = pipe("a cat astronaut, cinematic lighting",
           negative_prompt="blurry, low quality, deformed",  # 负向 prompt
           num_inference_steps=30, guidance_scale=7.5).images[0]
# 数据流：prompt→CLIP(77,768)→cross-attn；img→VAE enc→64×64×4 扩散→VAE dec
\`\`\`

实际案例：SD 1.5/2.1/XL 开源引爆 AIGC 生态——Civitai 数十万 LoRA 微调模型；字节即梦、阿里通义万相底座均为 LDM 变体；ControlNet 在冻结 SD 上加可训练副本实现边缘/深度/姿态控制，让 AIGC 从"抽卡"变成"可控生产工具"，广告设计行业工作流随之重构；SDXL 用双文本编码器（CLIP-L+OpenCLIP-G）+更大 U-Net+精细化微调到 1024 分辨率。

踩坑与 tradeoff：f=8 压缩损失高频细节（人脸小字糊），f=4 质量好但算力翻倍，SDXL 仍用 f=4 变体；VAE 是质量天花板——latent 丢了的信息扩散学不回来，很多"SD 画不好手/文字"的锅其实在 VAE；CLIP text encoder 77 token 上限截断长 prompt（SD3 换 T5 解决）；负向 prompt 实质是把 CFG 的 uncond 分支导向"坏质量"，是免费的质量提升；商业合规：SD1.5 训练集含 LAION 版权图，商用需评估法律风险（Adobe Firefly 主打版权干净）。`,
    keyPoints: ["VAE 感知压缩 48 倍降维，扩散在 latent 上做，单卡可训", "CLIP 文本嵌入经交叉注意力逐层注入 U-Net", "VAE 是质量天花板；latent 丢失的信息扩散学不回"],
    followUps: ["为什么 SD 画不好手部和文字、锅在 VAE 还是 U-Net？", "ControlNet 的可训练副本为什么不破坏原模型能力？"],
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
    answer: `结论：生成模型没有真值可比对，只能间接度量。IS（Inception Score）：把生成图过 InceptionV3 分类器，算 exp(E[KL(p(y|x)‖p(y))])——要求每张图分类置信度高（条件分布 p(y|x) 熵低=清晰）且全体类别分布均匀（边缘分布 p(y) 熵高=多样），越高越好。缺陷明显：不看真实数据分布（生成图再假但"像某类"就高分）、对 Inception 网络敏感、可被对抗样本刷分。FID（Fréchet Inception Distance）：分别提取真实图和生成图的 Inception 2048 维特征，各拟合高斯 (μᵣ,Σᵣ)/(μg,Σg)，算两高斯间 Fréchet 距离 ‖μᵣ-μg‖²+Tr(Σᵣ+Σg-2(ΣᵣΣg)^{1/2})，越低越好——直接比较分布统计，同时惩罚质量差（特征偏移）和多样性塌缩（Σg 收缩）。FID 对模式崩溃敏感（GAN 只生成 10 类中的 3 类，Σg 明显小），成为事实标准。

\`\`\`python
from torchmetrics.image.fid import FrechetInceptionDistance
fid = FrechetInceptionDistance(feature=2048, normalize=True)
for batch in real_loader: fid.update(batch, real=True)   # 累计真实统计
for batch in fake_loader: fid.update(batch, real=False)  # 累计生成统计
print("FID:", fid.compute())   # SD 级模型 COCO 30k 约 5-15，越低越好
\`\`\`

实际案例：论文标配 COCO-30k FID（SD 1.5 约 10.8，SDXL 约 12，注：FID 受采样器/步数影响大，跨论文比较必须对齐协议）；某 AIGC 团队用 FID 监控线上模型迭代，配合人工盲评（FID 降 2 点但人评偏好率不变时，以人评为准）；CLIP Score（生成图与 prompt 的 CLIP 余弦）补位评估文图对齐。

踩坑与 tradeoff：FID 样本量敏感——少于 5k 张方差巨大，论文惯例 30k/50k；Inception 在 ImageNet 上训练，评估人脸/动漫/医学等域外数据时特征失真，领域生成用 KID（无偏、小样本稳）或领域特征 FID；FID 低≠好——记忆训练集可以刷出极低 FID，需配 Precision/Recall for distributions（P 度量质量/R 度量覆盖多样性）才能拆穿；文本条件生成必须加 CLIP Score 或人评对齐度；实践中"FID 监控+人工盲评+业务 CTR"三层并用，单一指标都不可信。`,
    keyPoints: ["IS 只看生成图清晰度×多样性，不看真实分布，易被刷分", "FID 比较真实/生成特征高斯的 Fréchet 距离，对模式崩溃敏感", "FID 需 30k+ 样本；记忆训练集可刷低 FID，配 P&R 拆穿"],
    followUps: ["Precision/Recall for distributions 如何拆开度量质量与覆盖度？", "为什么 FID 对域外数据（动漫/医学）失真、KID 好在哪？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-118",
    nodeId: "ai-cv-generative",
    question: "AIGC 图像生成工业落地：文生图、图生图、虚拟试衣、广告创意如何做？",
    answer: `结论：AIGC 落地的技术栈按可控性需求分层：① 文生图基础层：SD/SDXL+提示词工程，适合创意探索，但"抽卡式"产出不可控；② 结构控制：ControlNet（canny 边缘/depth 深度/openpose 姿态/scribble 线稿）把布局变成硬约束，设计稿转成品图、模特姿势复刻都靠它，控制强度 conditioning_scale 平衡"听话"与"自然"；③ 风格定制：LoRA 微调（r=8-32，只训注意力层的低秩增量，几十张品牌图+几小时单卡即可），产出风格一致的批量素材，成本远低于全量微调；④ 局部编辑：Img2Img（对原图加 0.4-0.75 强度噪声再去噪，强度控制改动力度）+Inpainting（蒙版区域重绘，换背景/换服装）；⑤ 虚拟试衣：专项方案如 OOTDiffusion/IDM-VTON——服装图经 garment encoder 提特征，通过交叉注意力注入人物去噪过程，保留面料纹理同时适配人物姿态。

\`\`\`python
# 电商批量素材管线：SD + LoRA(品牌风格) + ControlNet(版式)
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
cn = ControlNetModel.from_pretrained("lllyasviel/control_v11p_sd15_canny")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "sd15", controlnet=cn, torch_dtype=torch.float16).to("cuda")
pipe.load_lora_weights("brand_style_lora.safetensors")
img = pipe("skincare bottle on marble, studio light",
           image=canny_layout, num_inference_steps=25,
           guidance_scale=7.0, controlnet_conditioning_scale=0.8).images[0]
\`\`\`

实际案例：阿里鹿班"AI 商品图"为淘宝商家批量生成场景图——白底商品图+场景 prompt+LoRA 类目风格，点击率持平实拍图但成本从 500 元/张降到 <1 元；某服装品牌用虚拟试衣把上新拍摄周期从 2 周压到 1 天；腾讯广告用 AIGC 生成创意素材，A/B 测试 CTR 提升 12%（素材多样性增加，广告疲劳度下降）；字节即梦/剪映把 ControlNet 包装成"姿势同款""线稿上色"一键功能。

踩坑与 tradeoff：合规红线——人脸生成必须过鉴伪+肖像授权审核（深度合成法规要求显著标识"AI 生成"），商用素材要过滤品牌 logo/版权元素；LoRA 过拟合：训练图 <20 张时风格会锁死构图，加正则化图集（regularization images）；ControlNet 多条件叠加（姿态+深度）互相干扰，需分强度调或换 Multi-ControlNet；批量生成后必须机器审核（NSFW 检测+品牌合规分类器）再人工抽检，纯人工审不过量；"AI 感"（皮肤蜡像、手指畸形）仍是用户投诉 Top1，手部修复（ADetailer 局部重绘）是管线标配。`,
    keyPoints: ["可控性分层：prompt→ControlNet 结构→LoRA 风格→Inpaint 局部", "虚拟试衣专项：服装特征交叉注意力注入，保纹理适姿态", "合规三件套：鉴伪+授权+AI 生成标识；审核机审+人检"],
    followUps: ["LoRA 训练为什么要配正则化图集、不配会怎样？", "虚拟试衣如何保留服装纹理细节而不串人物特征？"],
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
    answer: `结论：Word2Vec（2013, Mikolov）用浅层网络学分布式词向量，核心洞察是"词义由上下文决定"（分布假设）。两个架构：CBOW——用窗口内上下文词向量平均预测中心词，像"完形填空"，训练快、高频词向量好；Skip-gram——反过来用中心词预测每个上下文词，每对（中心，上下文）都是样本，低频词被训练次数多，低频/罕见词向量质量更好，但慢数倍。工程关键是负采样（Negative Sampling）：词表几十万时输出层 softmax 分母要算全词表，不可接受；改成把任务变成二分类——中心词+真上下文词对判 1，中心词+按词频 3/4 次幂分布随机采的 k 个负词判 0，每次只更新 k+1 个输出向量，计算量从 O(V) 降到 O(k)。词频 3/4 次幂是经验值：压低高频词（the 被采太多次没意义）抬升低频词。训练好的向量出现著名线性结构：king-man+woman≈queen——说明向量把语义关系编码成了方向。

\`\`\`python
from gensim.models import Word2Vec
model = Word2Vec(sentences, vector_size=100, window=5,
                 min_count=5, sg=1, negative=5, epochs=10)
# sg=1 用 Skip-gram（低频词好）；sg=0 用 CBOW（快）
print(model.wv.most_similar("国王", topn=3))
# 类比：国王-男人+女人≈女王
print(model.wv.most_similar(positive=["国王","女人"], negative=["男人"]))
\`\`\`

实际案例：推荐系统 item2vec 是最大遗产——把用户点击/购买序列当"句子"，商品当"词"，Skip-gram 学商品向量做 i2i 召回，Airbnb 房源推荐、阿里电商 i2i 召回都靠它冷启动；搜索 query 改写用语义相似词扩展召回；腾讯开源 800 万中文词向量曾是中文 NLP 标配。

踩坑与 tradeoff：window 大小是语义-语法旋钮——window=2 偏句法（词性相近的词聚类），window=10 偏主题语义；静态向量一词一向量，多义词硬伤（"苹果"水果/公司一个向量），这是被 BERT 取代的根本原因；OOV 无解（词表外的词没有向量，FastText 子词方案缓解）；min_count 截断低频词会让领域新词全丢——业务词表要先灌进去；现代定位：词向量已退居"特征工程一环"，但 item2vec 思想在推荐召回仍是主力，理解 Word2Vec 是理解 Embedding 技术谱系的起点。`,
    keyPoints: ["CBOW 上下文→中心词快；Skip-gram 中心词→上下文低频词好", "负采样把 softmax O(V) 降到 O(k)，词频 3/4 幂采样", "一词一向量多义词硬伤；item2vec 是推荐最大遗产"],
    followUps: ["负采样为什么用词频 3/4 次幂而不是均匀或原始频率？", "item2vec 把用户行为序列当句子有哪些隐含假设问题？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-121",
    nodeId: "ai-nlp-fundamentals",
    question: "GloVe 与 FastText 原理？相比 Word2Vec 有何改进？",
    answer: `结论：两者从不同角度补 Word2Vec。GloVe（Global Vectors, 2014）：Word2Vec 只用局部窗口上下文，浪费了语料的全局统计；GloVe 先构建全局词-词共现矩阵 X（Xᵢⱼ=词 j 出现在词 i 上下文的次数），再学词向量使 wᵢᵀw̃ⱼ+bᵢ+b̃ⱼ≈logXᵢⱼ——用加权最小二乘拟合共现计数对数，权重函数 f(x) 压低过大共现（the 类）和零共现。本质是把矩阵分解思想（LSA 谱系）和窗口预测思想（Word2Vec 谱系）统一，实验证明两者其实近似等价（Levy & Goldberg 证明 Skip-gram 负采样隐式分解 PMI 矩阵），GloVe 是显式版。FastText（2016）：Word2Vec 的词是最小单元，OOV 和形态变化无能为力；FastText 把词拆成字符 n-gram（"apple"→<ap,app,ppl,ple,le>+整词），词向量=其子词向量之和——没见过的词（拼写错误、词形变化、新词）也能拼出向量，对德语/土耳其语等形态丰富语言和搜索拼错场景是质变；代价是 n-gram 哈希表大、训练略慢。

\`\`\`python
import fasttext
# 有监督文本分类（FastText 最实用场景：百万级语料分钟级训练）
model = fasttext.train_supervised("train.txt", lr=0.5, epoch=25,
                                  wordNgrams=2, minn=2, maxn=5)
labels, probs = model.predict("这个产品真的太棒了", k=2)
# 无监督词向量（含子词）：model = fasttext.train_unsupervised("corpus.txt")
print(model.get_word_vector("applle"))   # 拼错的 OOV 也有向量
\`\`\`

实际案例：FastText 分类至今是文本分类的"一分钟基线"——比 BERT 慢不了多少精度但快 1000 倍，内容安全初审、意图粗分类仍在用；Facebook 开源 157 语言 FastText 向量是低资源语言标配；GloVe 的预训练向量（6B/840B tokens）曾是英文 NLP 论文标配初始化。

踩坑与 tradeoff：GloVe 共现矩阵对超大语料内存爆炸（词表平方级，需哈希/采样技巧）；两者都是静态向量，多义词问题与 Word2Vec 一样无解；FastText 的子词求和丢了子词顺序（"abc"和"cba"子词重叠），且子词平均稀释了整词语义，句法任务不如 Word2Vec；minn/maxn 决定子词长度范围，中文按字 n-gram 意义有限（中文单字即语素，子词机制更适合拼音文字）；三者统一局限：静态、浅层、无上下文——它们的历史定位是"BERT 时代之前的特征工程"。`,
    keyPoints: ["GloVe 显式分解全局共现矩阵对数；SGNS 隐式分解 PMI 矩阵", "FastText 字符 n-gram 子词求和，OOV/拼错/形态变化有救", "三者共同局限：静态向量无上下文，BERT 前时代的特征"],
    followUps: ["Levy & Goldberg 如何证明 SGNS 等价于分解 PMI 矩阵？", "FastText 子词机制为什么对中文收益有限？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-122",
    nodeId: "ai-nlp-fundamentals",
    question: "词向量如何评估？ analogy / similarity / 下游任务？静态向量局限？",
    answer: `结论：词向量评估分内在与外在两层。内在评估（intrinsic）：① 相似度任务——人工标注的词对相似度数据集（SimLex-999、MEN、Wordsim-353）上算向量余弦与人工分的 Spearman 相关，测"向量距离是否反映语义远近"；② 类比任务——king:man::queen:? 式的 a-b+c 最近邻准确率（Google analogy 数据集约 2 万题），测"向量差是否编码关系"。内在评估便宜快速，适合训练过程监控。外在评估（extrinsic）：把词向量冻住进下游任务（文本分类/NER/情感分析），看端到端指标——这才是工业唯一认的标准，因为内在高分经常不迁移（类比任务强但分类烂很常见）。静态向量的根本局限：一词一向量，无法按上下文消歧——"苹果"在"吃苹果"和"苹果发布会"里向量相同；上下文无关也导致句向量只能词袋平均，丢语序。这催生了 ELMo（同词不同上下文不同向量）和 BERT。

\`\`\`python
from gensim.models import KeyedVectors
from scipy.stats import spearmanr
wv = KeyedVectors.load_word2vec_format("glove.6B.100d.txt", no_header=True)
# 内在：相似度相关
pairs = [("猫","狗",0.6),("猫","汽车",0.05),("医生","护士",0.8)]
gold = [g for _,_,g in pairs]
pred = [wv.similarity(a,b) for a,b,_ in pairs]
print(spearmanr(gold, pred))          # ρ 越高越好
# 内在：类比
print(wv.most_similar(positive=["king","woman"], negative=["man"]))
# 外在：冻住向量喂 sklearn 分类器看 F1（工业唯一标准）
\`\`\`

实际案例：某搜索团队评估自建 query 向量时发现内在 SimLex 相关 0.75 高于开源 0.72，但上线 A/B 召回 CTR 反而降——外在评估（下游相关性分类 F1）才是准星；领域词向量必须在领域语料重训：通用向量在医疗/金融垂直领域相似度全乱（"cold" 在医疗是感冒不是冷）。

踩坑与 tradeoff：内在评估的类比任务有已知偏差（对高频词有利、对训练窗口敏感），论文里刷类比分容易误导选型；评估集要防训练泄漏（GloVe 在 Wikipedia 上训，评估词对也来自 Wikipedia 会虚高）；OOV 处理策略（跳过/UNK/子词）会让评估结果差 10%+，报告必须注明；多义词评估要用上下文版数据集（WiC）；现代视角：静态词向量评估方法论（内在+外在分离）被完整继承到了 LLM embedding 评估（MTEB 榜单本质是外在评估大集合）。`,
    keyPoints: ["内在：相似度 Spearman+类比 a-b+c；外在：下游任务端到端指标", "外在评估是工业唯一标准，内在高分常不迁移", "静态向量一词一向量无法消歧，催生 ELMo/BERT"],
    followUps: ["为什么内在评估高分经常迁移不到下游任务？", "MTEB 榜单评估 LLM embedding 的方法与词向量评估有何异同？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-123",
    nodeId: "ai-nlp-fundamentals",
    question: "中文分词（结巴/HanLP）与预训练分词有何不同？中文 NLP 特殊性？",
    answer: `结论：中文没有天然空格，传统 NLP 管线必须先分词，这带来三大特殊性：① 分词歧义——"研究生命起源"可切"研究生/命/起源"或"研究/生命/起源"，歧义消解靠上下文统计；② 未登录词（OOV）——新词/人名/网络用语层出不穷，词典法永远滞后；③ 错误传播——分词错了后面全错。传统方法：结巴（词典+前缀树扫最大匹配，未登录词用 HMM 按字标注 B/M/E/S 序列发现新词）、HanLP/LTP（CRF 序列标注分词，能利用上下文特征，准确率 97%+）。预训练时代范式切换：BERT-Chinese 直接用字级别——中文 2 万常用字即词表，单字本身携带语义（"鲸"独立于"鲸鱼"有意义），字粒度彻底消除分词错误传播，代价是序列变长、词级语义需模型自己组合；现代 LLM 用 BPE/SentencePiece 在字与词之间自动学出子词单元（"自然语言"可能被学成单 token）。英语系模型中文差常因词表中文覆盖率不足，被拆成碎片字节。

\`\`\`python
import jieba
print("/".join(jieba.cut("研究生命起源的奥秘")))   # 精确模式+词典
jieba.add_word("研究生命")                          # 领域词注入
print("/".join(jieba.cut("研究生命起源的奥秘")))
# 搜索引擎模式（全切分保召回）：jieba.cut_for_search(...)
# BERT 字级别：from transformers import BertTokenizer
# tok("自然语言处理") → 自/然/语/言/处/理（6 个单字 token）
\`\`\`

实际案例：百度搜索用"字+词混合"——索引用词粒度保精度，召回用字粒度保覆盖；某电商搜索"iPhone17pro max"等新词漏召回，原因就是分词词典滞后，改子词模型后新词 recall +18%；医疗 NLP 领域词典（疾病/药品名）必须定制，通用分词把"阿莫西林"切碎。

踩坑与 tradeoff：分词粒度是精度-召回旋钮——词粒度准但漏，字粒度全但噪声大，搜索双粒度索引是工业标准解法；分词模型自身也有域偏移（新闻语料训的分词器切电商标题很差）；BERT 字级方案不是免费午餐——词边界信息丢失，Chinese-BERT-wwm（全词掩码）和 MacBERT 通过整词掩码把词信息重新注入，中文任务普遍 +1-2 点；LLM 时代中文 token 效率仍关键：同一句话中文 token 数是英文 1.5-2 倍（词表偏英文），直接影响推理成本与上下文窗口有效长度，国产模型（Qwen/GLM）中文词表扩充后 token 效率显著更好。`,
    keyPoints: ["中文三大特殊性：切分歧义+未登录词+错误传播", "结巴=词典+HMM 发现新词；CRF 序列标注更准", "BERT 字级消错误传播但丢词边界；wwm 整词掩码回补"],
    followUps: ["全词掩码（wwm）相比字掩码为什么对中文有效？", "中文 token 效率如何影响 LLM 推理成本与上下文利用？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-124",
    nodeId: "ai-nlp-fundamentals",
    question: "子词与 OOV 处理？UNK 词如何应对？",
    answer: `结论：固定词表必然遇到训练时没见过的词（OOV）：新词、拼写错误、词形变化、低资源语言。传统方案拿一个 [UNK] token 顶替——所有未知词共享同一向量，信息全丢且模型无法区分"两个不同的生僻词"。子词（subword）方案把词拆小、让罕见词由已知部件拼出：BPE（Byte Pair Encoding）从字符级开始，贪心合并语料中最高频的相邻符号对，直到词表大小达标（GPT 系 5 万）；WordPiece（BERT）类似但按似然增益选合并对；Unigram（T5/ALBERT）反向从大到小剪枝，按移除后对语料似然损失最小原则淘汰；SentencePiece 是不依赖空格的语言无关封装（中日文友好）。字节级（byte-level BPE，GPT-2 起）把基础单元定为 256 个字节——任何 Unicode 字符都能被字节序列表示，词表永远封闭，OOV 在定义上消失。代价：罕见词被拆成多个 token，序列变长，模型需学习组合子词。

\`\`\`python
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("bert-base-uncased")  # WordPiece
print(tok.tokenize("unbelievably"))     # un + ##believ + ##ably
print(tok.tokenize("ChatGPT5o"))        # 新词拆成已知子词，无 UNK
# byte-level（GPT-2）：emoji/生僻字/乱码全可编码
# tiktoken: enc.encode("🚀🤖") 每个 emoji 几个字节 token
\`\`\`

实际案例：搜索 query 含 5-15% 拼写错误和生僻组合，子词模型对拼错鲁棒（"iphnoe"→iph+noe，向量仍接近 iPhone），召回鲁棒性显著提升；多语言模型（mBERT/XLM-R）用共享 BPE 词表，让跨语言同形子词共享表示，低资源语言借高资源语言的子词迁移；代码模型（CodeLLaMA）必须字节级——代码里任意标识符都能编码。

踩坑与 tradeoff：词表大小是核心 tradeoff——太小（5k）序列超长训练慢，太大（250k）embedding 参数占比高且低频 token 学不充分，GPT 系 5 万、多语言 25 万是甜点；数字拆分是著名坑：BPE 常把"12345"拆成 12+345 或 1+2345，不同数字的拆分边界不一致，导致 LLM 算术和比较大小翻车（LLaMA3 起单独切数字缓解）；中文场景：BPE 合并出的"半个词"（如"自然语"）语义不完整，属正常；评估 tokenizer 质量看 fertility（平均每词 token 数），越低越高效；别在生产系统混用不同版本的 tokenizer——缓存的 token id 会错位。`,
    keyPoints: ["子词让罕见词由已知部件拼出；字节级 256 字节封闭词表 OOV 消失", "BPE 贪心合高频对/WordPiece 按似然/Unigram 反向剪枝", "词表大小是序列长度与 embedding 参数的权衡；数字拆分是坑"],
    followUps: ["为什么 BPE 的数字拆分会让 LLM 算术出错？", "Unigram 与 BPE 的训练目标差异带来什么性质差异？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-125",
    nodeId: "ai-nlp-fundamentals",
    question: "文本表示发展脉络：One-hot → Word2Vec → ELMo → BERT → LLM？",
    answer: `结论：五代文本表示，每代精确打击上一代痛点。① One-hot/词袋：词表维度的 0/1 向量——维度灾难（词表百万级）、语义鸿沟（"猫""狗"向量正交，与"猫""汽车"一样远），但 TF-IDF 加权后在搜索召回（BM25）活到今天。② 静态词向量 Word2Vec/GloVe：低维稠密（100-300 维）、语义可算（类比算术），解决了语义鸿沟；硬伤是静态——一词一向量，多义词、上下文全丢。③ ELMo：首个上下文表示——双向 LSTM 各层隐状态加权求和，"苹果"在水果/公司语境下向量不同，NER/问答 SOTA 普涨；硬伤是 LSTM 特征提取器弱+浅层拼接。④ BERT：Transformer 双向编码+MLM 预训练，深上下文物尽其用，"预训练+微调"范式统一 NLP，GLUE 屠榜；硬伤是双向不适合生成、512 长度限制。⑤ LLM（GPT 系）：自回归生成式预训练，表示即生成、规模即能力（scaling law），in-context learning 让"表示"直接变成"完成任务"；embedding 场景由对比学习微调的 decoder 或 encoder 模型（BGE/E5/OpenAI ada）承接。范式主线：特征工程→预训练微调→预训练提示/对齐。

\`\`\`python
# 同一词在不同语境的表示演进
w2v_vec = wv["苹果"]                        # 静态：永远同一个向量
# BERT：上下文相关
from transformers import BertModel, BertTokenizer
tok, bert = BertTokenizer.from_pretrained("bert-base-chinese"), \
            BertModel.from_pretrained("bert-base-chinese")
ids = tok("我吃苹果", return_tensors="pt")
h1 = bert(**ids).last_hidden_state[0, 2]    # "果"的上下文向量
ids2 = tok("苹果发布会", return_tensors="pt")
h2 = bert(**ids2).last_hidden_state[0, 1]   # 同字不同向量
# LLM embedding：model.encode("苹果发布会") 一句一向量
\`\`\`

实际案例：百度搜索表示栈演进是行业缩影——2015 前 BM25 词袋，2016 上 Word2Vec 语义召回，2019 ERNIE（百度 BERT）相关性精排，2023 文心 LLM 统一理解与生成；每代切换带来 CTR/相关性指标 5-15% 提升；RAG 时代的 embedding 模型（BGE/E5）本质是"第 4.5 代"——BERT 架构+对比学习+指令微调。

踩坑与 tradeoff：别在非黑即白地"新替旧"——BM25 在精确词匹配（型号、编号）上仍强于向量，工业召回是 BM25+向量双路融合；BERT 的 CLS 直接当句向量效果差（各向异性），要 SBERT/对比学习；LLM 直取隐状态当 embedding 不如专门对比训练的模型；演进面试题的标准答法是"痛点-方案"对：每次革命都解决了什么、引入了什么新问题（BERT 解决上下文但引入长度限制→RoPE/稀疏注意力；LLM 解决通用性但引入幻觉→RAG/对齐）。`,
    keyPoints: ["one-hot 语义鸿沟→Word2Vec 静态不消歧→ELMo 浅层→BERT 强上下文→LLM 生成式", "范式主线：特征工程→预训练微调→预训练提示对齐", "工业现实是新旧融合：BM25+向量双路召回"],
    followUps: ["为什么 BERT 的 CLS 向量不能直接当句向量用？", "RAG 时代的 BGE/E5 属于这条脉络的什么位置？"],
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
    answer: `结论：SBERT（Sentence-BERT, 2019）解决两个问题：① 计算问题——BERT 算句对相似度要交叉编码（两句拼接过模型），1 万句两两比较要 5 千万次前向（65 小时），SBERT 用孪生结构各自编码再算余弦，1 万句只需 1 万次前向（秒级）；② 表示问题——BERT 预训练目标（MLM+NSP）不是为语义相似度设计的，直接取 CLS 或 mean pooling 的向量存在各向异性（anisotropy）：向量挤在锥形小区域内，任意两句余弦都 >0.9，相似度没有区分度——原因是高频词主导表示+词向量分布不平坦。SBERT 微调方案：孪生/三胞胎网络共享权重，用 NLI 数据按任务训练——分类目标（两句向量+交互特征过 softmax 判蕴含/矛盾）或回归目标（直接拟合标注相似度），三元组目标（anchor 拉近 positive 推远 negative）；池化实验证明 mean pooling 优于 CLS。输出句向量直接支持余弦/点积检索。

\`\`\`python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("BAAI/bge-base-zh-v1.5")
emb = model.encode(["怎么退货", "退货流程是什么", "今天天气不错"],
                   normalize_embeddings=True)
import numpy as np
print((emb @ emb.T).round(3))   # 前两句余弦 ~0.85，与第三句 ~0.3
# 训练（孪生+对比）：
# from sentence_transformers import losses, InputExample
# train_loss = losses.MultipleNegativesRankingLoss(model)
\`\`\`

实际案例：语义检索事实标准——阿里/百度 query-doc 语义召回、RAG 文档检索、智能客服 FAQ 匹配全用 SBERT 系；BGE（智源）、GTE（阿里）、E5（微软）在 MTEB 中文榜轮流登顶，核心配方都是"SBERT 架构+大规模弱监督对+对比学习+指令微调"；某客服机器人把关键词匹配换成 BGE 召回，问题解决率从 58% 提到 79%。

踩坑与 tradeoff：通用句向量直接上垂直业务效果平庸，必须用业务正负样本对微调（点击率对、人工标注对）；困难负样本是天花板——随机负样本太容易，模型学不到细粒度区分，挖掘"字面上像但语义不同"的难负例（如同类目不同商品）提升最大；维度 768 可降到 256（Matryoshka 嵌套维度训练）省存储检索快 3 倍；白化（whitening）可后处理矫正各向异性但不如对比微调；别拿交叉编码器（cross-encoder）的分数标准衡量双塔——双塔换效率、交叉换精度，RAG 里两者串联用。`,
    keyPoints: ["孪生结构各自编码，1 万句相似度从 65 小时到秒级", "BERT CLS 各向异性：任意两句余弦>0.9 无区分度", "NLI/对比微调+mean pooling；BGE/GTE/E5 是当前主力"],
    followUps: ["各向异性产生的机制是什么、为什么对比学习能矫正？", "双塔与交叉编码器在 RAG 链路中如何分工？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-128",
    nodeId: "ai-nlp-embeddings",
    question: "SimCSE 对比学习原理？无监督和有监督版本区别？",
    answer: `结论：SimCSE（2021）用最简方案把对比学习引入句向量：同一句话过两次带 dropout 的 encoder，dropout 随机性产生两个略有差异的表示构成正样本对，batch 内其他句子当负样本，用 InfoNCE 损失训练——loss 对第 i 句是 -log(exp(sim(zᵢ,zᵢ⁺)/τ)/Σⱼexp(sim(zᵢ,zⱼ)/τ)，τ 是温度系数（0.05）。美在不需要任何标注：dropout 是最小数据增强，模型被迫学"对扰动不变"的语义表示，同时把各向异性的锥形分布推开（对比学习理论：alignment 正样本对齐+uniformity 负样本均匀分布，后者直接修复各向异性）。有监督 SimCSE 更强：用 NLI 数据集——entailment（蕴含）句当正样本，contradiction（矛盾）句当困难负样本（字面相似但语义相反，最磨模型），STS-B 相关从 76%（无监督）提到 82%。后续工作（DiffCSE、PromptBERT、E5）都是这条线的增强。

\`\`\`python
import torch, torch.nn.functional as F
def simcse_loss(encoder, sents, tau=0.05):
    z = encoder(sents)              # 输入重复一次：batch 变 2N
    z = F.normalize(z, dim=-1)
    z1, z2 = z[::2], z[1::2]        # 同句两个 dropout 视图
    sim = z1 @ z2.T / tau           # (N,N) 第 i 行：句子 i 对所有 z2
    labels = torch.arange(len(z1))  # 对角线为正样本
    return F.cross_entropy(sim, labels)
# 有监督版：正样本=NLI 蕴含句，困难负=矛盾句，拼进 batch 负样本池
\`\`\`

实际案例：SimCSE 发表时在 STS 语义相似度基准超 SBERT 5+ 个点，且方法简单到 50 行代码可复现，成为各家句向量训练的标配组件；BGE/GTE 训练管线里的对比阶段本质是 SimCSE 思想+亿级弱监督对+难负例挖掘；某搜索团队用 SimCSE 无监督版在业务 query 语料上继续训练（domain-adaptive pretraining），零标注成本下召回相关性 +6%。

踩坑与 tradeoff：dropout rate 极敏感——0.1 最佳，>0.3 两个视图差异过大学不到东西，<0.05 视图太像塌缩；batch size 决定负样本数量，512-1024 起，太小对比无力（可用跨卡负样本扩充）；温度 τ 控制分布锐度，0.05 是甜点，过小梯度集中在最难负样本易振荡；各向异性修复有副作用——过度 uniformity 会拉开本应近的句子（同义句相似度下降），这是对比学习的 alignment-uniformity 权衡；无监督版上限受限于 dropout 单一增强，E5/BGE 换用真实（query, doc）点击对后远超 SimCSE——工程上 SimCSE 是"没标注时的免费午餐"，有业务数据就用真实对。`,
    keyPoints: ["同句两次 dropout 造正对，batch 内他句为负，InfoNCE", "对比学习的 uniformity 项恰好修复 BERT 各向异性", "有监督版用 NLI 蕴含为正、矛盾为困难负，STS-B 76→82"],
    followUps: ["为什么 dropout rate 0.1 是甜点、过大会怎样？", "alignment 与 uniformity 的权衡在实际调参中如何体现？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-129",
    nodeId: "ai-nlp-embeddings",
    question: "向量数据库（FAISS/Milvus）原理？ANN 近似最近邻如何加速检索？",
    answer: `结论：暴力最近邻在 n 个 d 维向量上查 top-k 是 O(nd)，亿级规模不可行，ANN（近似最近邻）用 1-5% 精度损失换 100-1000 倍加速。三大索引家族：① IVF（倒排文件）：先用 k-means 把向量分成 nlist 个簇，查询只搜 query 最近的 nprobe 个簇——nprobe 是召回-速度旋钮，nlist=4096、nprobe=16 时只扫 0.4% 数据，召回 95%+；② PQ（乘积量化）：把 d 维向量切 m 段，每段各自 k-means 出 256 个码字，向量存成 m 个字节（码本 id），距离用码本查表近似——内存省 97%（768 维 float32=3KB → 96B），常与 IVF 组合成 IVFPQ；③ HNSW（分层可导航小世界图）：借鉴跳表——高层稀疏长边快跳、底层密边精修，从入口点贪心游走"往更近的邻居走"，查询 O(log n)，召回 98%+ 且无需训练，是 2023+ 首选，代价是内存大（图边存原始向量+连接表，约为原始数据 1.5-2 倍）。FAISS（Meta）是索引算法库，Milvus/Zilliz 是分布式向量数据库（存算分离+多索引+标量过滤），Qdrant/Weaviate 同类，PG 生态用 pgvector。

\`\`\`python
import faiss, numpy as np
d, nb = 768, 1_000_000
xb = np.random.randn(nb, d).astype("float32")
# IVFPQ：nlist 聚类中心数，m 段数（d 须整除），nbits 每段码本位数
quantizer = faiss.IndexFlatIP(d)
index = faiss.IndexIVFPQ(quantizer, d, 4096, 96, 8)
index.train(xb[:100_000]); index.add(xb)
index.nprobe = 32                       # 召回-速度旋钮
D, I = index.search(xb[:5], 10)         # 近似 top-10
# HNSW：M=每点邻居数，efSearch=搜索宽度（召回旋钮）
# index2 = faiss.IndexHNSWFlat(d, 32); index2.hnsw.efSearch = 64
\`\`\`

实际案例：抖音/TikTok 视频召回用 Milvus 集群承载十亿级 embedding，P99 <20ms；淘宝"拍立淘"图像检索用自研 IVF+PQ 变体；RAG 时代向量库成基础设施——LangChain/LlamaIndex 默认集成 FAISS/Chroma，企业生产级用 Milvus/PG；某 SaaS 公司从 Elasticsearch 向量检索切到 Milvus HNSW，召回率 87%→97%。

踩坑与 tradeoff：PQ 量化误差会让余弦相似的分数失真——精排阶段必须取回原始向量重算距离（IVFPQ 粗召回+Flat 精排两段式是标准）；IVF 对数据分布敏感，新增向量与训练集分布漂移后召回衰减，需定期重建索引；HNSW 的 M 和 efConstruction 在建索引时定死，efSearch 查询时可调；标量过滤（先按 user_id 过滤再向量搜）会让 IVF 的簇内候选变少召回骤降，用分区索引（partition by 标量）解决；删除/更新向量在多数 ANN 索引里是痛点（HNSW 支持标记删除，IVF 需重建）；维度 >1024 时 PQ 误差陡增，先 PCA 降维。`,
    keyPoints: ["IVF 聚类分桶只搜 nprobe 簇；PQ 分段量化 3KB→96B", "HNSW 分层图贪心游走 O(log n)，召回最高内存最贵", "IVFPQ 粗召回+原始向量精排两段式是工业标准"],
    followUps: ["标量过滤为什么会伤害 IVF 召回、分区索引怎么解？", "HNSW 的 M 和 efSearch 分别控制什么、如何调？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-130",
    nodeId: "ai-nlp-embeddings",
    question: "语义检索工业应用：召回-粗排-精排漏斗如何设计？",
    answer: `结论：工业搜索/推荐的延迟预算（<100ms）和库规模（亿级）决定了单模型不可能同时满足，必然漏斗分层，每层用"算力换精度"逐级筛选：① 召回（Recall）：从亿级库捞数千候选，延迟预算 <10ms——双塔模型：query 塔和 doc 塔各自独立编码，doc 向量离线预计算入 ANN 索引，在线只算 query 向量+近邻检索；多路召回并行：语义向量路+BM25 倒排路+行为协同路（i2i/u2i）+热门兜底路，互补覆盖。② 粗排（Pre-rank）：数千→数百，预算 <20ms——轻量模型：小版双塔/简化交叉（向量内积+少量统计特征过 LR/小 MLP），或精排蒸馏出的小模型。③ 精排（Rank）：数百→数十，预算 <50ms——交叉编码器（cross-encoder）：query 和 doc 拼接过 BERT，全交互注意力捕获细粒度匹配信号，精度上限最高但每个 (q,d) 对都要前向，只能用在候选已很少的最后一级。级间一致性是核心工程问题：召回模型要与精排目标对齐（用精排分数蒸馏双塔），否则"召回的好"≠"精排认的好"，漏斗脱节。

\`\`\`python
# 召回：双塔各自编码，doc 离线入库
q_vec = query_tower(q)                      # 在线 1 次前向
cands = faiss_index.search(q_vec, 2000)     # ANN 召回
# 粗排：轻量打分
s2 = light_ranker.predict(q_vec, cand_vecs) # 内积+小 MLP
# 精排：交叉编码逐对交互（候选少才用得起）
scores = cross_encoder([(q, d) for d in cands[:200]])
final = sorted(zip(cands[:200], scores), key=lambda x: -x[1])[:10]
\`\`\`

实际案例：百度搜索"双塔语义召回+ERNIE 精排"，语义召回贡献了传统倒排漏掉的相关结果的 15%；淘宝首页搜索多路召回（向量/文本/个性化/类目）经粗排融合再进精排大模型；抖音搜索 query-doc 双塔召回 + 精排混排视频与用户；RAG 借鉴同一漏斗：向量召回 top50→cross-encoder 重排 top5 喂 LLM，答案质量提升显著。

踩坑与 tradeoff：双塔最大的痛是两塔分离无交互，精度天花板低于交叉——解法：精排蒸馏双塔（cross-encoder 当老师）、训练时引入 late-interaction（ColBERT 逐 token 最大相似度折中）；多路召回重复内容要去重（按 doc_id+相似度），各路配额按价值分配不是平均分；特征穿越：精排用了在线特征（如实时库存），训练数据里没对齐会导致线上线下不一致；漏斗各级要监控"级间损失"——精排 top10 里有多少根本没被召回，这是召回侧优化的北极星；扩层级（召回→粗排→精排→重排）每加一级延迟+复杂度，中小系统两级足够。`,
    keyPoints: ["漏斗=算力逐级换精度：双塔召回→轻量粗排→交叉精排", "双塔 doc 离线预计算是在线毫秒级的前提", "级间对齐靠蒸馏；级间损失（精排 topN 未召回率）是北极星"],
    followUps: ["ColBERT 的 late-interaction 如何在双塔与交叉间折中？", "多路召回的配额应该按什么原则分配？"],
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
    answer: `结论：逐 token softmax 的隐含假设是"各位置标签条件独立"：P(y|x)=∏P(y_t|x)，每个位置贪心 argmax，无法表达"I-PER 前面必须是 B-PER/I-PER"这类硬约束——模型可能输出 B-PER→I-ORG 的非法路径。CRF（线性链条件随机场）改为对整个标签序列建模：P(y|x)=exp(Σ_t[E_t(y_t)+A(y_{t-1},y_t)])/Z(x)，其中 E 是发射分（encoder 逐位置输出），A 是可学习的 K×K 转移矩阵（训练后 A[B-PER][I-PER] 得分高、A[B-PER][I-ORG] 被压到极低），Z(x) 是配分函数（所有路径得分和，用前向算法 O(L·K²) 可算）。推理用 Viterbi 动态规划找全局最优路径而非逐点贪心——核心差别：softmax 求"每格各自最可能"，CRF 求"整行联合最可能"，非法路径概率趋零，实体边界更准更一致。

\`\`\`python
from torchcrf import CRF
crf = CRF(num_tags=9, batch_first=True)
emissions = bert(input_ids).last_hidden_state @ W  # (B, L, 9) 发射分
loss = -crf(emissions, tags, mask=mask)   # 对数似然 = 真实路径分 - logZ（前向算法）
pred = crf.decode(emissions, mask=mask)   # Viterbi 解码全局最优路径
# 学到的转移矩阵可打印检查：A[B-PER][I-ORG] 应接近 -inf
\`\`\`

实际案例：CoNLL-03 上 BiLSTM+CRF 比纯 BiLSTM+softmax F1 高约 1-1.5 个点；医疗 NER 对边界极敏感（药品名错一个字含义全变），某医疗 NLP 团队病历实体抽取 F1 从 87.2 提到 89.6 主要靠 CRF 稳边界；百度/阿里工业 NER 长期以 BiLSTM/BERT+CRF 为标配。

踩坑与 tradeoff：CRF 训练慢 20-30%（配分函数要跑前向算法），Viterbi 解码 O(L·K²) 在长序列+大标签集下延迟可感；BERT 足够强时 CRF 绝对增益降到 0.3-0.8 个点，但法律/医疗等边界敏感场景仍值得加；标签体系选 BIO 还是 BIOES 的影响常大于 CRF 本身；LLM 时代生成式 NER（直接输出 JSON）绕开标签约束，但低延迟/小模型场景 CRF 仍是首选。`,
    keyPoints: ["softmax 逐点独立 vs CRF 全局归一化建模转移", "Viterbi 解码全局最优，非法转移概率压到零", "BERT 强时增益变小但边界敏感场景仍标配"],
    followUps: ["前向算法如何 O(L·K²) 计算配分函数 Z(x)？", "生成式 NER 与 BERT+CRF 各适合什么场景？"],
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
    answer: `结论：三者代表三代范式和三个成本档位。FastText：词+subword n-gram 哈希 embedding 取平均后过线性层，本质是"线性模型+词袋"，训练推理都是毫秒级、亿级语料 CPU 几分钟训完，但语序全丢、无语义理解；TextCNN：多宽度卷积核（3/4/5 滑窗）在 embedding 上提取局部 n-gram 特征+max-pooling 取最强信号，对短文本里关键词模式（"假货""退款""不新鲜"）捕捉好，长距离依赖弱；BERT：self-attention 建模全局上下文+大规模预训练迁移语义知识，精度上限最高，但 12 层 Transformer 推理成本高（CPU 单条几十毫秒起）。选型决策树：QPS 极高+精度容忍→FastText 基线兜底；短文本+关键词驱动（意图/敏感词/类目）→TextCNN 性价比最优；精度敏感+有 GPU 或蒸馏预算→BERT 系（线上用蒸馏小模型 TinyBERT/MiniLM 或量化版）。

\`\`\`python
# FastText：极速基线
import fasttext
model = fasttext.train_supervised("train.txt", epoch=25, wordNgrams=2, minn=2, maxn=5)
# TextCNN：多宽度卷积 + max-pool
convs = nn.ModuleList([nn.Conv1d(300, 100, k) for k in (3,4,5)])
feat = torch.cat([c(x).max(dim=2).values for c in convs], dim=1)
# BERT：CLS 接分类头
logits = classifier(bert(input_ids, mask).last_hidden_state[:, 0])
\`\`\`

实际案例：淘宝亿级商品类目预测第一版用 FastText（CPU 天级全量重训），头部类目后换 BERT 蒸馏版准确率 +4 个点；某内容平台垃圾评论过滤用 FastText 单机 QPS 过万、准确率 92% 达标；某电商情感分析在 50 字内短评上 TextCNN 与 BERT 差距 <1 个点但推理成本只有 1/50。

踩坑与 tradeoff：别把 BERT 当银弹——短文本+强关键词场景 TextCNN/FastText 性价比更高；类别极不均衡时换模型不如先治数据（focal loss/重采样）；BERT 直接 12 层 FP32 上线是成本事故，必须蒸馏或 INT8 量化；FastText 中文要调字/词切分与 subword 参数，n-gram 哈希碰撞在词表大时引入噪声；长文本（>512）BERT 需截断/滑窗/长文本模型，别硬塞。`,
    keyPoints: ["FastText 线性词袋毫秒级，TextCNN 卷积抓局部关键词", "BERT 全局语义精度上限最高但需蒸馏量化上线", "选型看 QPS/精度/文本长度三角，不是越贵越好"],
    followUps: ["知识蒸馏如何把 BERT 压到 6 层而精度损失 <1%？", "类别不均衡时 focal loss 与重采样如何选？"],
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
    answer: `结论：医疗/法律 NER 的四大挑战：①术语密集且组合爆炸（"注射用头孢呋辛钠 1.5g 静滴"药名带剂量用法），通用词表 OOV 高；②标注必须领域专家（医学生/律师），人天标注量只有通用场景 1/3，成本数倍；③实体嵌套/不连续（"高血压、糖尿病史"两病共用一个"史"字，BIO 标不出来）；④隐私合规限制语料获取与出院。领域适配的标准阶梯：DAPT（domain-adaptive pretraining：领域无标注语料继续做 MLM，收益最大）→TAPT（task-adaptive：在任务未标注文本上再训一轮）→少量精标微调；数据不足时叠加远程监督（领域词典/知识库回标，Snorkel 学标注函数权重融合噪声）+规则后处理（剂量/单位/法条号正则）+主动学习（挑不确定性最高样本送专家，标注效率提 2-3 倍）。

\`\`\`python
# 1) DAPT：领域语料继续 MLM 预训练
model = BertForMaskedLM.from_pretrained("bert-base-chinese")
trainer.train(medical_corpus)   # 50 万份脱敏病历
# 2) TAPT + 精标微调
ner = AutoModelForTokenClassification.from_pretrained("./med-dapt", num_labels=15)
# 3) 主动学习：按预测熵挑样本送专家标注
scores = -probs * probs.log(); to_label = scores.sum(-1).topk(200)
# 4) 规则后处理：剂量/单位正则补齐边界
\`\`\`

实际案例：某医疗信息化公司用 50 万份脱敏病历做 DAPT，NER F1 比通用 BERT +6.8 个点，再叠药品词典远程监督召回又 +2；某法律科技公司"案由/法条/标的金额"要素抽取用判决书 TAPT+正则后处理上线，抽取准确率 91%。医渡云/森亿智能病历结构化、通义法睿案情要素抽取都是此路线。

踩坑与 tradeoff：DAPT 语料与下游分布不匹配反而伤效果（门诊病历和住院病历都是不同分布）；远程监督噪声大，直接当金标训练会拉低上限；嵌套实体要换 span-based/global pointer 方案；实体归一化（"心梗"→"急性心肌梗死"标准术语）不做等于白抽；隐私合规下语料出不了院，院内训练/联邦学习是硬约束。`,
    keyPoints: ["挑战=术语密集+专家标注贵+实体嵌套+隐私", "DAPT→TAPT→精标微调阶梯，远程监督+主动学习补数据", "嵌套实体换 span 方案，实体归一化必须做"],
    followUps: ["远程监督的噪声如何用 Snorkel 建模？", "嵌套 NER 的 span-based 方案怎么做标注与解码？"],
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
    question: "机器翻译专题：beam search、回译、子词切分各解决什么问题？",
    answer: `结论：三个翻译关键技术：①Beam search 解码：保留 k 条候选按累计对数概率扩展，缓解 greedy 局部最优，配长度惩罚（length normalization，除以 |y|^α）防偏爱短句；束宽一般 4-8，再大收益小且易出通用句。②回译（back-translation）：用反向模型把目标语单语料译回源语，造伪平行句对，解决低资源语言平行语料稀缺。③子词切分（BPE/SentencePiece）：把词拆成子词单元，平衡词表大小与 OOV，未登录词可拼出，中英等多语言共享词表。

实际案例：百度翻译/有道用 Transformer+beam search；阿里达摩院低资源语种（如东南亚小语种）靠回译把 BLEU 提升数个点；多语言模型 mBART/NLLB 用 SentencePiece 统一子词。

\`\`\`python
# Beam search 简化实现（长度惩罚）
def beam_search(model, src, beam=4, max_len=50, alpha=0.6):
    hyps = [([bos], 0.0)]
    for _ in range(max_len):
        cand = []
        for ys, score in hyps:
            logp = model.next_logprob(src, ys)     # (V,)
            top = logp.topk(beam)
            for v, p in zip(top.indices, top.values):
                cand.append((ys + [v.item()], score + p.item()))
        # 长度惩罚：score / len^alpha
        hyps = sorted(cand, key=lambda c: c[1] / len(c[0])**alpha)[:beam]
        if all(h[0][-1] == eos for h in hyps): break
    return max(hyps, key=lambda c: c[1] / len(c[0])**alpha)[0]
# 回译：tgt 单语 → 反向模型 → 伪 src，与真平行数据混训
\`\`\`

踩坑：beam search 与采样目标不同——翻译求准用 beam，对话求多样用采样；回译伪数据比例过高会噪声反噬，通常伪：真 ≤ 1:1 起调；子词粒度太细序列变长拖慢训练。`,
    keyPoints: ["Beam search+长度惩罚求全局较优", "回译造伪平行语料救低资源", "BPE/SentencePiece 平衡词表与 OOV"],
    followUps: ["长度惩罚为什么需要？", "回译数据比例如何调？"],
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
    answer: `结论：BLEU 衡量"生成的 n-gram 有多少出现在参考里"（精确率导向）：对 n=1..4 算修正精确率（clip 各 n-gram 在参考中的最大出现次数）取几何平均，再乘 brevity penalty 指数惩罚过短输出，是机器翻译标准指标。ROUGE 反过来衡量"参考的 n-gram 有多少被生成覆盖"（召回导向）：ROUGE-N 按 n-gram 召回，ROUGE-L 基于最长公共子序列衡量句子级流畅度，是摘要标准指标。共同硬伤：只看字面重叠——"猫追狗"和"狗被猫追"n-gram 高度重合但语义相反；同义改写（"购买"→"买下"）被误判；事实错误完全测不出。现代生成评估分三层：字面层 BLEU/ROUGE 做回归监控，语义层 BERTScore（embedding 相似度）/BLEURT 补同义，事实层用 LLM-as-judge+人工抽检兜底；对话/开放域生成基本以人工偏好+LLM 评审为主。

\`\`\`python
from sacrebleu import corpus_bleu
from rouge import Rouge
bleu = corpus_bleu(hyps, [refs])            # BLEU-4，语料级
scores = Rouge().get_scores(hyps, refs)     # ROUGE-1/2/L
# 语义层：BERTScore
from bert_score import score
P, R, F = score(hyps, refs, lang="zh")      # embedding 级相似
\`\`\`

实际案例：机器翻译产业评测仍以 sacreBLEU 为准（分词统一可复现）；某摘要产品上线门槛 ROUGE-L>35 再人工评 500 条事实性；RAG 场景用 RAGAS 评 faithfulness（答案是否忠于检索内容）比 ROUGE 更贴业务，某客服知识库据此发现 12% 回答存在检索外编造。

踩坑与 tradeoff：BLEU 是语料级指标，单句 BLEU 噪声极大，别用于 case 分析；多参考译文能显著缓解同义误判（单参考偏严）；ROUGE 高分不代表不幻觉，事实一致性必须单独评；中文 BLEU 受分词影响大，sacreBLEU 加 --tokenize zh 才可比；LLM-as-judge 有位置/冗长偏置，要交换顺序评两次取一致结论。`,
    keyPoints: ["BLEU=修正 n-gram 精确率×短句惩罚；ROUGE=召回/LCS", "字面重叠测不出同义改写和事实错误", "三层评估：字面回归+语义 BERTScore+事实 LLM-judge"],
    followUps: ["BERTScore 为什么能捕捉同义改写？", "RAGAS 的 faithfulness 指标如何计算？"],
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
    answer: `结论：代码生成用代码语料训练的 LLM，预测下一 token。早期 GitHub Copilot 基于 Codex，但 Codex API 已于 2023 年下线；2026 年现状是 GPT-4 系/Claude/DeepSeek-Coder/Qwen-Coder 等多模型时代，Copilot 等工具也改为可选多模型。保证正确性靠：训练数据高质量、上下文填充（函数签名/注释/FIM 填空）、测试驱动生成（生成+运行测试反馈）、自我修复（报错重试）。评估常用 HumanEval/MBPP 等 pass@k 基准，真实工程能力看 SWE-bench（解决真实 GitHub issue）。

实际案例：字节 MarsCode/Trae、阿里通义灵码用代码 LLM 做补全；GitHub Copilot 现已支持 GPT-4 系等多模型切换。DeepSeek-Coder、Qwen2.5-Coder 开源性能强，SWE-bench 类 agent 评测成为代码能力新标杆。

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
    keyPoints: ["代码语料训练 LLM，Codex 已下线进入多模型时代", "低 temperature 求精确+测试驱动", "HumanEval/MBPP 与 SWE-bench 评估"],
    followUps: ["SWE-bench 评估什么？", "FIM 填空补全？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-146",
    nodeId: "ai-nlp-generation",
    question: "LLM 幻觉（Hallucination）问题？如何缓解？",
    answer: `结论：幻觉分两类——事实性幻觉（与客观事实冲突，如编造论文引用、错年代数字）和忠实性幻觉（偏离输入/检索内容，如摘要添加原文没有的信息）。机制根源：①训练目标是下一 token 概率最大化而非真值最大化，模型学的是"像人话的文本分布"，流畅与真实在训练信号里没有区分；②长尾知识在语料中出现次数少，记不住就用"最像的"模式补全（confabulation）；③RLHF 让模型倾向给自信完整的回答，拒答率被打压；④自回归误差累积，前面编错后面接着圆。缓解按层做：推理层 RAG 检索事实注入 prompt（工业界第一手段）、低温采样、自一致性多采样投票、思维链先引证据再下结论；对齐层 RLHF/DPO 奖励"知之为知之"、训练拒答能力；后验层事实核查——把回答拆成原子 claim 逐条对检索证据核真（FActScore 思路）、NLI 模型判蕴含。

\`\`\`python
# RAG 缓解幻觉：检索事实再生成，并要求引用
docs = retrieve(query, vector_db)
prompt = f"仅基于以下资料回答，每条结论标注[资料序号]，资料不足就说不知道：\\n{docs}\\n问题：{query}"
answer = llm.generate(prompt, temperature=0.1)
# 后验核查：拆原子 claim 逐条核真
for claim in split_claims(answer):
    if nli_entailment(evidence[claim.ref], claim.text) < 0.7:
        flag_hallucination(claim)   #  unsupported claim 打回
\`\`\`

实际案例：某法律问答产品上 RAG 后幻觉投诉降 70%，再叠"回答必须附法条引用+引用命中校验"把剩余幻觉压到 2%；医疗场景强制"检索不到就拒答"+人工审核双保险；百度文心/字节豆包用联网搜索增强应对时效性问题。

踩坑与 tradeoff：RAG 不是银弹——检索召回不到或检索内容本身错，幻觉照样发生（garbage in garbage out），检索质量是上限；temperature=0 只降随机性、降不了系统性编造；过度对齐会过度拒答伤可用性，拒答率也要监控；完全消除幻觉目前无解，高风险场景必须人机协同兜底；幻觉率要用真实业务 query 长尾集评估，通用基准看不出领域差异。`,
    keyPoints: ["训练目标是像人话而非说真话，长尾知识靠模式补全", "RAG+低温+自一致性+事实核查分层缓解", "拒答能力是 feature 不是 bug，过度对齐会伤可用性"],
    followUps: ["FActScore 如何把长回答拆成原子事实核真？", "为什么 RAG 检索不到时模型仍会'硬答'而不是拒答？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-205",
    nodeId: "ai-nlp-generation",
    question: "LLM 评估：LLM-as-judge 有哪些偏置？事实性/幻觉如何评？基准污染如何应对？",
    answer: `结论：①LLM-as-judge 用强模型（如 GPT-4 系）给回答打分/ pairwise 比较，便宜且与人类偏好相关性高，但有系统性偏置：位置偏置（偏好先出现的答案，需交换顺序评两次取均值）、冗长偏置（偏好更长更"像样"的回答）、自我偏好（judge 给同家模型打分偏高）、格式偏置（偏好 markdown/列表）。缓解：交换位置、打乱模型匿名、长度归一化、多 judge 投票、给 rubric 评分细则。②事实性/幻觉评估：FActScore 把长回答拆成原子事实逐条对照知识源核真；RAGAS 评 RAG 的 faithfulness/answer relevance/context recall；TruthfulQA 测抗误导。③基准污染：测试集被爬进训练语料导致分数虚高；检测靠 n-gram 重叠分析、扰动测试（改写后大幅掉分说明靠背题）、以及用持续更新的动态基准（如考后发布的新题、LiveCodeBench 按时间滚动）做对照。

实际案例：各大模型榜单（Chatbot Arena 人工投票 vs MT-Bench LLM 评分）并存互为校验；DeepSeek/Qwen 技术报告会公布污染检测（去重 n-gram）说明；字节/阿里内部评估用自留私有测试集防污染。

\`\`\`python
# LLM-as-judge 位置偏置缓解：交换顺序评两次
def judge_pair(question, ans_a, ans_b, judge):
    r1 = judge.compare(question, ans_a, ans_b)   # A 在前
    r2 = judge.compare(question, ans_b, ans_a)   # B 在前
    if r1 == "A" and r2 == "B": return "A wins"
    if r1 == "B" and r2 == "A": return "B wins"
    return "tie/inconsistent"                    # 两次不一致判平
# 基准污染扰动测试：改写变量名/数字后复测
score_clean = evaluate(model, benchmark)
score_perturbed = evaluate(model, perturb(benchmark))
if score_clean - score_perturbed > threshold:    # 掉分过大疑似记忆
    flag_contamination_risk()
\`\`\`

踩坑：judge 模型本身能力上限决定评估上限（judge 不会的题评不准）； pairwise 比较结果不可传递（A>B、B>C 但 C>A）；基准一旦公开即开始被污染，高分需结合私有集复核；FActScore 依赖检索知识源质量。`,
    keyPoints: ["judge 偏置：位置/冗长/自我偏好", "FActScore 原子事实核查+RAGAS", "污染检测：重叠/扰动/动态基准"],
    followUps: ["如何设计抗污染的私有评估集？", "Arena Elo 与 LLM 评分如何互相校验？"],
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
    answer: `结论：冷启动的本质是"行为数据缺失时用先验/内容/迁移补位"。用户冷启动：注册画像（年龄/性别/兴趣勾选）做人群定向热门+探索；关键是首因效应——前 10 次曝光决定新用户留存，所以要用全站高置信爆款混排而非个性化长尾，辅以 ε-greedy/UCB 在每刷中插少量试探内容快速收敛兴趣。物品冷启动：无交互就靠内容特征——标题/封面/正文 embedding 进 ANN 找"相似老物品"的受众定向试投；用质量分模型（作者历史表现+内容理解特征）给初始 CTR 先验；配流量池机制小额试投收集真实反馈后逐级爬坡。系统冷启动（全新产品无用户无内容）：编辑精选+热门榜+跨域迁移（集团内其他产品用户兴趣向量映射/预训练 embedding 迁移）扛过数据积累期。

\`\`\`python
# 用户冷启动：人群热门 + UCB 探索
def cold_start_user(profile):
    group = profile["age_bucket"] + "_" + profile["gender"]
    hot = popular_by_group[group][:40]      # 人群高置信爆款
    explore = ucb_sample(candidates, c=2)    # 10 个探索位
    return interleave(hot, explore, ratio=4)
# 物品冷启动：内容 embedding 找相似老品的受众
new_emb = content_encoder(new_item.title, new_item.cover)
target_users = ann_search_users(similar_old_items(new_emb))
\`\`\`

实际案例：抖音新用户首启勾选兴趣标签+前 N 刷全站高热混排，7 日留存比纯随机高约 15%；淘宝新品打"新品标"并对类目相似品人群定向试投；某内容平台用内容 embedding 做冷启动召回，新文首日 CTR 从只投热门的 40% 追到老文的 75% 水平。

踩坑与 tradeoff：冷启动指标必须单独分桶监控（新用户 CTR/留存 vs 老用户），混在全站指标里会被老用户稀释到看不见；探索流量占比是战略参数（常见 5-15%），太少新品起不来、太多伤大盘 CTR；内容 embedding 冷启动有"图文质量好≠点击欲高"的偏差，要尽快切换到真实反馈信号；防马太死循环——新物品没曝光就没数据、没数据就不给曝光，保底流量是打破循环的关键设计。`,
    keyPoints: ["用户冷启动靠画像+爆款+UCB 探索，首因效应定留存", "物品冷启动靠内容 embedding+质量分先验+流量池爬坡", "保底流量打破马太，冷启动指标必须分桶监控"],
    followUps: ["跨域迁移如何做用户兴趣向量映射？", "流量池爬坡阈值怎么定才不误杀好内容？"],
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
    answer: `结论：推荐指标体系分三层且经常互相打架：离线模型指标（AUC/LogLoss 评 CTR 预估、NDCG/HitRate 评排序质量）、在线业务指标（CTR、完播率、停留时长、留存、GMV/客单价）、生态健康指标（多样性、新颖性、类目覆盖率、作者侧投稿留存）。冲突是常态：纯优化 CTR 会让标题党/擦边内容胜出，短期 CTR 涨但长期留存跌（用户爽完就流失）；纯优化多样性牺牲精准度 CTR 跌。工业界解法：①多目标融合打分 score=Σw_i·obj_i 或乘积形式，权重靠 A/B 实验调；②硬约束保生态——重排层 MMR 多样性、同作者/同类目打散、负反馈降权；③指标分层定主次——用次留/7 留做主指标（北极星），CTR/时长做护栏指标（guardrail，不允许显著为负）。方法论上：离线 AUC 涨 0.3-0.5 个点以上才值得开 A/B；在线实验跑 7-14 天覆盖星期周期，看长期效应而非首日新奇效应。

\`\`\`python
# 多目标融合分（电商）
score = pctr * pcvr * price            # GMV 期望 = CTR×CVR×客单价
score = score ** alpha * quality ** beta  # 质量分调节
# 护栏：多样性重排
final = mmr_rerank(final, sim_matrix, lambda_=0.7)  # 同作者打散规则另算
# A/B 判定：主指标留存 + 护栏指标 CTR/负反馈率
assert retention_delta > 0 and ctr_delta > -0.01 and negfb_delta < 0
\`\`\`

实际案例：抖音融合分综合 CTR 预估×完播预估×互动预估，外加同作者/同 BGM 打散；淘宝排序以 GMV=CTR×CVR×客单价为目标并用"相似商品不超 N 个"保多样性；某资讯 App 曾纯优化 CTR，三个月后 7 留降 4 个点，回滚多目标后才恢复。

踩坑与 tradeoff：离线涨在线不涨是常态（离线分布≠在线分布，有位置偏置和自选择偏差），别拿离线 AUC 当上线依据；CTR 可被封面党刷高，必须配完读率/负反馈率看；长期留存归因难、实验周期长，要先研究"哪些短期指标与留存相关"再定代理指标；多样性 λ 要用留存而非点击率来调，点击率会骗你把内容调得越来越窄。`,
    keyPoints: ["三层指标：离线模型/在线业务/生态健康，互相打架是常态", "多目标融合+重排硬约束+留存北极星 CTR 护栏", "离线 AUC 不是上线依据，A/B 看 7-14 天长期效应"],
    followUps: ["为什么离线 AUC 涨 0.5% 在线可能纹丝不动？", "如何验证某个短期指标与长期留存的相关性？"],
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
    answer: `结论：多任务学习有两个本质问题：①损失尺度不一——CTR 的 BCE 是 0.1 量级，GMV 回归可能上百，简单相加等于让大尺度任务独吞梯度；②梯度冲突——共享层中两任务梯度方向夹角 >90° 时互相拖拽（负迁移），典型如"点击"和"时长"对标题党样本的梯度方向相反。解法谱系：静态加权（手调 w_i，最常用但费人力）；Uncertainty Weighting（每任务的同方差不确定性 σ_i 作为可学习参数，loss=Σ(1/2σ_i²)L_i+log σ_i，噪声大的任务自动降权）；GradNorm（监控各任务在共享层的梯度范数，动态调权让所有任务相对训练速度一致）；PCGrad/CAGrad（检测到梯度冲突时把梯度投影到对方法平面，消除互相抵消的分量）；架构层 MMoE/PLE 用多专家+门控隔离冲突。推荐特有建模范式：ESMM 用 pCTCVR=pCTR×pCVR 的概率链式结构，把 CVR 的稀疏监督转化为全样本空间联合学习，从建模上绕过冲突。

\`\`\`python
# Uncertainty Weighting：自动学任务权重
log_vars = nn.Parameter(torch.zeros(2))     # 每任务 log σ²
loss = (0.5*torch.exp(-log_vars[0])*loss_ctr + 0.5*log_vars[0]
      + 0.5*torch.exp(-log_vars[1])*loss_cvr + 0.5*log_vars[1])
# PCGrad：冲突时投影
for i in range(K):
    for j in range(K):
        if (g[i]*g[j]).sum() < 0:
            g[i] -= (g[i]*g[j]).sum() / (g[j]*g[j]).sum() * g[j]
# ESMM：pCTCVR = pCTR * pCVR 全空间监督
loss = bce(pctr, click) + bce(pctr*pcvr, conversion)
\`\`\`

实际案例：阿里 ESMM 解决 CVR 样本选择偏差，全空间建模后 CVR AUC +2.4 个点、GMV +3%；某短视频团队用 Uncertainty Weighting 替代手调，点击/完播/互动三任务首次全部正收益（手调时代总有一个被牺牲）；GradNorm 在多场景建模中防止小流量场景被大场景压制。

踩坑与 tradeoff：Uncertainty Weighting 漏掉 log σ 正则项会让 σ→∞ 偷懒（loss 全推给正则）；PCGrad 要算两两梯度点积开销 O(K²)，小 batch 下梯度方向噪声大、投影反而添乱；任务不是越多越好——弱相关任务（点击+举报）硬共享双输，该分塔就分塔；调权收益上限远低于数据质量和架构（MMoE/PLE/ESMM），别在权重上过度内卷。`,
    keyPoints: ["损失尺度不一+梯度方向冲突是多任务两大病根", "Uncertainty/GradNorm 动态调权，PCGrad 投影消冲突", "ESMM 用概率链式结构从建模范式上绕开冲突"],
    followUps: ["Uncertainty Weighting 的贝叶斯推导是什么？", "MMoE/PLE 如何从架构上隔离任务冲突？"],
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
    answer: `结论：四层漏斗是"精度×成本"的帕累托解：候选从亿级开始，每层量级降一档、模型复杂度升一档。召回（10⁹→10³~10⁴）：目标是覆盖率与多样性，绝不允许漏掉潜在好内容——多路并行（双塔 ANN/itemCF/图召回/标签热门兜底），单路必须轻（内积走 ANN 索引毫秒返回）；粗排（10⁴→10²~10³）：在 5-10ms 预算内砍掉明显不行的，用简化版精排或精排蒸馏双塔，是漏斗里最拧巴的一层——要比召回准、比精排快；精排（10²→10¹）：目标是把每分算准，复杂深度模型（DIN/DeepFM/多目标）特征全开，几十 ms 预算；重排（10¹→最终曝光）：目标是整屏体验而非单点最优——多样性打散、广告混排、业务规则、已读过滤。关键认知：各层目标函数不同，上一层的最优不是下一层的最优——召回看 recall@k，精排看 AUC/校准，重排看整页指标。

\`\`\`python
# 四层漏斗伪代码
cands = multi_recall(user)                 # 20+ 路并行 → ~5000
cands = coarse_rank(user, cands)[:800]     # 精排蒸馏双塔，<10ms
scores = deepfm_multi(user, cands)         # 精排多目标，<40ms
final = rerank(scores, rules=[same_author_max2, ad_insert, dedup_read])
\`\`\`

实际案例：抖音召回 20+ 路并行取数千候选，粗排用精排蒸馏双塔压到数百，精排多目标出分，重排做打散+广告混排；淘宝搜索因 query 意图明确，召回偏文本匹配+个性化，重排商业化权重更高；某电商粗排从 LR 升级蒸馏双塔后精排候选质量提升，最终 GMV +1.8%。

踩坑与 tradeoff：层间目标错位是大坑——广告与自然内容的精排分数域不同，混排前必须校准（Platt scaling/isotonic）；粗排蒸馏精排时特征必须对齐，否则在线离线不一致；召回配额分配直接决定多样性，全给双塔会同质化；层数不是越多越好，每多一层多一处误杀好内容的环节，小流量产品两层就够。`,
    keyPoints: ["亿→万→千→十逐层降量升精度，各层目标函数不同", "召回保覆盖、粗排蒸馏提速、精排算准、重排管整屏体验", "混排前分数校准，层间特征对齐防在线离线不一致"],
    followUps: ["粗排蒸馏精排时如何保证分数分布对齐？", "多路召回的配额应该怎么分配（双塔 vs 图 vs 热门）？"],
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
    answer: `结论：推荐的"鲜度"来自两条链路：实时特征与在线学习。实时特征（用户最近 5 分钟点击/停留/跳过序列）捕捉即时意图——用户刚搜了"帐篷"，下一刷就该切露营场景，离线 T+1 特征完全跟不上；技术栈是 Kafka 埋点流→Flink 窗口聚合（滑窗/会话窗）→Redis/特征服务毫秒级读。在线学习让模型权重分钟级更新：样本流直接进训练，梯度累积后定时推送到在线 serving。新鲜度与稳定性的矛盾：更新越频繁越追得上热点，也越容易被瞬时噪声/刷量攻击带偏（一次热点事件让模型给所有人推同一内容）。平衡手段：①增量更新加 EMA 平滑、限制单次步长；②灰度发布+自动回滚（在线 AUC 跌超阈值自动切回旧版）；③实时特征本身做指数衰减平滑，防单条噪声行为主导；④监控特征 PSI 与输出分布漂移，报警先于回滚。

\`\`\`python
# 实时特征：Flink 滑窗聚合写 Redis
user_rt = {
    "last_20_actions": flink_sliding_window(events, size=20),
    "session_ctr_1h": session_agg(user, "1h"),
}
# 在线学习：EMA 平滑 + 护栏回滚
new_w = 0.99 * old_w + 0.01 * grad_update(stream_batch)
if online_auc_drop(new_w) > 0.005: rollback(old_w)
\`\`\`

实际案例：抖音"刚看过同类"体验靠实时序列特征，大促/热点期在线学习让 CTR 模型分钟级跟进新梗；某电商双 11 用 15 分钟粒度增量更新，GMV 比 T+1 模型高 2-4%；广告系统对在线学习更保守——eCPM 漂移直接影响收入，多用小时级+严格护栏。

踩坑与 tradeoff：最大坑是 label 延迟——点击 label 等窗口关闭、转化 label 延迟数天，用太早的样本训练等于教模型错答案（需 delay compensation）；实时流链路任何一环积压都会让"实时特征"变陈旧，延迟监控要和特征一起上线；模型热更新时新旧版本并存，特征版本不一致会算错分；别把在线学习当默认选项——内容池稳定的长尾场景 T+1 就够，在线学习工程成本远超收益。`,
    keyPoints: ["实时特征追即时意图（Kafka+Flink+Redis）", "在线学习分钟级更新，用 EMA/灰度/回滚压稳定性风险", "label 延迟是在线训练第一坑，需 delay compensation"],
    followUps: ["label 延迟的 delay compensation 具体怎么做？", "实时特征链路如何设计降级策略（Flink 故障时）？"],
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
    answer: `结论：推荐工程架构的标准分层是离线/近线/在线三层，按"数据新鲜度×计算量级"切分。离线层（T+1/H+1）干重活：Spark 跑特征 ETL、全量训练深度模型、离线评估、item embedding 全量重算，产出模型文件与离线特征表；近线层（秒/分钟级）追热点：Flink 消费行为流实时聚合用户兴趣、item 实时统计（近 1 小时 CTR）、增量更新 embedding，写 Redis/特征服务；在线层（<100ms）处理请求：并行查特征（离线+近线+请求上下文）→多路召回→粗排→精排→重排，每层独立微服务可弹性扩容。三层契约是特征平台和模型仓库：特征平台统一定义（一套 DSL 同时生成离线样本与在线特征），模型仓库管版本+灰度。为什么这样分：训练要吞吐（跑批便宜）、在线要延迟（100ms 预算）、近线是两者的桥——把"必须新鲜"的特征单独提速，避免全链路实时化的天价成本。

\`\`\`python
# 在线请求链路（各层独立微服务）
def recommend(req):
    u_feat = feature_store.get(req.uid, views=["offline", "realtime"])
    cands = recall_svc.query(req.uid, u_feat)        # 多路召回 ~20ms
    coarse = coarse_svc.score(req.uid, cands)        # 粗排 ~10ms
    fine = rank_svc.score(req.uid, coarse[:500])     # 精排 ~40ms
    return rerank_svc.apply(fine, biz_rules)         # 重排 ~10ms
\`\`\`

实际案例：字节推荐：离线 Hadoop/Spark 训练+Doris 特征表，近线 Flink 实时特征写自研 KV，在线召回/粗排/精排/重排独立部署、高峰弹性扩 10 倍；阿里用 PAI 统一训练+EAS 在线服务化，双 11 全靠分层扛流量；某中型电商三层拆分后在线 P99 从 800ms 降到 120ms。

踩坑与 tradeoff：最大坑是离线/在线特征不一致——离线 Python UDF 算的特征在线用 Java 重实现，两套逻辑漂移导致离线 AUC 高在线翻车（解法：特征平台统一 DSL 或共享计算库）；级联调用 P99 是各层之和，延迟预算要逐层分配；近线特征别贪多——每个实时特征都是一条要保活的流，故障域随数量线性涨；模型上线必须灰度，全量直推的事故都够写本错题集。`,
    keyPoints: ["离线训练重吞吐/近线流式追新鲜/在线服务保延迟", "特征平台+模型仓库是三层契约，统一特征定义", "P99 预算逐层分配，灰度发布是铁律"],
    followUps: ["离线在线特征一致性除了统一 DSL 还有什么工程手段？", "在线服务雪崩时各层如何做降级（fallback 策略）？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-166",
    nodeId: "ai-rec-engineering",
    question: "推荐特征工程：用户/物品/上下文/交叉特征如何设计？",
    answer: `结论：推荐特征四分法，各类设计逻辑不同。用户特征：静态画像（年龄/性别/城市，注意合规）+动态兴趣（行为序列、长期类目偏好向量、活跃度分桶）——行为序列最值钱，DIN 类模型就是围绕它建的；物品特征：内容属性（类目/品牌/价格带）+统计特征（近 1/7/30 天 CTR、曝光、转化）+内容 embedding（图文多模态向量）；上下文特征：时间（小时/星期/节假日，节日效应极强）、位置、网络环境、session 内即时行为（"刚才搜了什么"是最强即时信号）；交叉特征：用户×类目历史 CTR、用户×价格带偏好——交叉是 LR/GBDT 时代的灵魂，深度时代模型自动学，但强业务先验的手工交叉仍是免费午餐。统计特征三原则：时间窗口对齐（防穿越）、贝叶斯平滑（小样本 CTR 不可信，(click+α)/(show+α+β)）、分桶离散化（深度模型对原始连续值尺度敏感，等频分桶+embedding 是标准操作）。

\`\`\`python
# 统计特征：贝叶斯平滑 + point-in-time
def smooth_ctr(click, show, a=10, b=90):
    return (click + a) / (show + a + b)    # 小样本向全局均值收缩
feat = {
    "user_cat_ctr_7d": smooth_ctr(c7, s7), # 只统计 T 时刻之前数据（防穿越）
    "user_seq": last_n_items(uid, 50),      # 行为序列截断 50
    "price_bucket": equal_freq_bin(price),  # 等频分桶
}
\`\`\`

实际案例：抖音特征体系：用户侧完播率/关注偏好，物品侧质量分/热度/内容标签，上下文侧时间/session 深度，交叉侧"用户对该作者的历史完播率"；某资讯团队补"用户×类目 7 日点击率"交叉特征，精排 AUC +0.8 个点，比换模型结构划算得多；淘宝大促单独建"用户对大促商品敏感度"交叉特征。

踩坑与 tradeoff：特征穿越是第一红线——用今天的统计预测今天的行为等于看答案，离线 AUC 虚高在线翻车，统计特征必须 point-in-time 生成；稀疏特征低频值要截断（出现 <N 次归 OOV 桶），否则 embedding 学噪声；新特征上线前先看覆盖率（<30% 样本覆盖的特征大概率没用）；特征不是越多越好——几千维里起作用的常是几百维，定期用置换重要性/SHAP 清理，省成本也省排障时间。`,
    keyPoints: ["用户/物品/上下文/交叉四类，行为序列最值钱", "统计特征三原则：防穿越/贝叶斯平滑/分桶离散化", "特征穿越是红线，定期清理低价值特征"],
    followUps: ["行为序列过长（>1000）时如何压缩进模型？", "置换重要性和 SHAP 在特征筛选上各有什么坑？"],
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
    answer: `结论：两者都是 TD 控制算法，差别只在 TD target 里下一状态价值怎么估。SARSA：Q(s,a)←Q(s,a)+α[r+γQ(s',a')−Q(s,a)]，a' 是行为策略实际选出的下一动作（五元组 s,a,r,s',a' 因此得名）——on-policy：学的就是正在采样数据的那个策略；Q-Learning：Q(s,a)←Q(s,a)+α[r+γ max Q(s',a')−Q(s,a)]，用贪心 max 而非实际动作——off-policy：行为策略（ε-greedy 探索）与目标策略（纯贪心）分离，学的是"接下来全走最优"的价值。cliff walking 是最直观的对照实验：SARSA 学到绕远的安全路径（探索时可能掉崖的风险被计入了价值），Q-Learning 学到贴崖边的最短路径（训练中常被 ε-greedy 拖下崖，但 Q 值对应理论最优）。工程含义：Q-Learning 可直接吃历史离线数据/他人演示（off-policy 复用经验），是 DQN 与经验回放的基础；SARSA 数据效率低但评估的就是当前策略，策略迭代更老实。Expected SARSA 是中间点：对 a' 按策略分布取期望而非 max 或单样本，方差比 SARSA 小又不像 Q-Learning 那样高估。

\`\`\`python
# SARSA（on-policy）：a2 来自当前行为策略
a2 = epsilon_greedy(Q[s2], eps)
Q[s,a] += alpha * (r + gamma*Q[s2,a2] - Q[s,a])
# Q-Learning（off-policy）：用 max 而非实际动作
Q[s,a] += alpha * (r + gamma*Q[s2].max() - Q[s,a])
# Expected SARSA：按策略分布取期望，降方差
Q[s,a] += alpha * (r + gamma*np.dot(pi[s2], Q[s2]) - Q[s,a])
\`\`\`

实际案例：DQN 玩 Atari 用 Q-Learning+经验回放，老样本反复利用；机器人导航训练偏好 SARSA 系，避免学出"理论最短但一探索就撞墙"的策略；推荐离线日志训练必须用 off-policy 方法（Q-Learning 思想+CQL 保守修正），因为日志是老策略产生的。

踩坑与 tradeoff：Q-Learning 的 max 在函数逼近下系统性过估计 Q 值（max of noisy estimates > true max），Double DQN 为此而生；on-policy 方法策略一更新旧经验即"过期"，PPO 靠重要性采样+clip 复用几轮；别死记"SARSA 安全 Q-Learning 激进"——本质差别是 bootstrap 假设，面试画 cliff walking 两条路径最直观。`,
    keyPoints: ["SARSA 用实际 a' 更新（on-policy），Q-Learning 用 max（off-policy）", "cliff walking：SARSA 绕远安全路，Q-Learning 贴崖最短路", "off-policy 可复用离线数据，是 DQN/离线 RL 的根基"],
    followUps: ["为什么 max 操作在神经网络下会过估计 Q 值？", "Expected SARSA 在什么场景比两者都好？"],
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
    answer: `结论：把推荐当 MDP：状态 s=用户画像+近期行为序列+上下文，动作 a=推荐哪个（或哪屏）item，奖励 r=点击/完播/时长/留存/GMV 加权和，γ 控制看多远。为什么要 RL 而非监督学习：监督学"这次曝光点不点"（myopic 单步最优），RL 学"现在推什么能让用户长期留下"——比如推一个短期 CTR 一般但能打开新兴趣的内容，长期留存更高。落地三大形态：①Value-based：DQN 系估每个候选的长期价值再排序（动作离散、候选几百以内适用）；②Actor-Critic：直接输出连续"理想 item 向量"再 ANN 召回（动作空间大时的标准做法）；③离线 RL：全部用历史日志训练（CQL/IQL/BCQ），解决在线探索伤体验的硬伤——这是工业界主流，在线 RL 几乎没人敢全量。奖励工程是成败关键：只奖点击模型必学标题党，必须把负反馈、快速划走、停留、次留编码进奖励且量纲归一。

\`\`\`python
# 离线 RL 训练推荐策略（CQL 思想：惩罚 OOD 动作的 Q 值）
state = user_seq_encoder(history)          # 状态=行为序列
q_values = critic(state, candidate_items)  # 每个候选的长期价值
cql_loss = logsumexp(q_values) - q_values[logged_action]  # 保守正则
# 奖励设计：多信号加权归一
reward = 1.0*click + 0.3*finish + 0.5*dwell_norm - 1.5*neg_feedback
\`\`\`

实际案例：阿里猜你喜欢用 DQN 优化长期 GMV，相对监督基线显著提升；腾讯广告用 RL 在预算约束下优化长期 ROI 竞价；字节分享过 RL 优化搜索/推荐长期留存的实践；共同套路是离线 RL 跑通→用户模拟器验证→小流量 A/B 看长期指标，三步缺一不可。

踩坑与 tradeoff：离线 RL 核心难题是分布偏移——日志只有老策略推过的内容，模型对没见过的 (s,a) 乱估 Q 值并自我强化，CQL 的保守惩罚就是给 OOD 动作打折；奖励延迟（留存明天才知道）用多步回报/RNN 状态缓解；新策略上线前要用 OPE（IPS/Doubly Robust）离线估值，直接上线试是拿用户做实验；模拟器与真实用户差距永远存在，只能做排序验证不能承诺绝对收益。`,
    keyPoints: ["监督学单步 CTR，RL 学长期累计价值（留存/GMV）", "离线 RL（CQL/BCQ）是工业主流，在线探索没人敢全量", "奖励工程定成败：负反馈不编码进去模型就学标题党"],
    followUps: ["CQL 的保守 Q 值惩罚具体怎么加进 loss？", "OPE 的 Doubly Robust 估计为什么比纯 IPS 方差小？"],
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
    answer: `结论：BLIP（2022）解决两个前代痛点：①模型割裂——CLIP 只能理解、encoder-decoder 只能生成，BLIP 用 MED 架构一个模型三用（单模态编码器/图像 grounded 编码器/图像 grounded 解码器，共享参数），三任务联合训练：ITC（图文对比，对齐全局特征）、ITM（图文匹配二分类，学细粒度对齐，含 hard negative 挖掘）、LM（以图像为条件生成 caption）；②数据噪声——爬来的 alt-text 图文对噪声大，BLIP 提出 CapFilt 自举清洗：Captioner 给图生成更干净的描述，Filter 用 ITM/ITC 打分滤掉原始噪声文本，这个"自己造干净数据"的闭环让性能大涨。BLIP-2（2023）更进一步：ViT 和 LLM 全冻结，只训中间的 Q-Former——32 个可学习 query 向量通过 cross-attention 从冻结 ViT 特征里"抽取"LLM 能懂的视觉信息，两阶段训练（先对齐视觉-语言表征，再接 LLM 学生成），训练成本比端到端低一个量级，开创"冻结大模型+轻量桥接"范式，LLaVA 就是它的简化（Q-Former 换成线性投影）。

\`\`\`python
# BLIP-2：冻结 ViT + 冻结 LLM，只训 Q-Former
img_feat = frozen_vit(image)                 # (197, 1408)
queries = q_former.learned_queries           # 32 个可学习 query
vis_tokens = q_former(queries, context=img_feat)  # cross-attn 抽取 → (32, 768)
text = frozen_llm(torch.cat([vis_tokens, prompt_tokens]))
# BLIP 三任务联合：ITC 对比 + ITM 匹配(hard neg) + LM 生成
\`\`\`

实际案例：Salesforce 开源 BLIP/BLIP-2 长期霸榜 VQA/图文检索；阿里通义、字节视觉理解模型借鉴 Q-Former 思想；某电商用 BLIP-2 微调做商品图自动描述+视觉问答，比从零训练节省 90% 算力。

踩坑与 tradeoff：ITM 的 hard negative 挖掘是关键 trick（批内选最难负样本），不做细粒度对齐学不出；CapFilt 过滤太狠会丢多样性，模型只会说"标准答案"；BLIP-2 冻结 LLM 意味着视觉信息只能过 32 个 query 的瓶颈，细粒度任务（OCR 小字、空间关系）会丢——高分辨率场景要换 LLaVA-NeXT 动态切块；Q-Former 两阶段顺序不能反，先接 LLM 会训崩。`,
    keyPoints: ["BLIP 一个 MED 架构统一理解（ITC/ITM）与生成（LM）", "CapFilt 自举清洗噪声图文对，数据质量闭环", "BLIP-2 冻结 ViT+LLM 只训 Q-Former，成本降一个量级"],
    followUps: ["Q-Former 的 32 个 query 为什么是信息瓶颈？", "LLaVA 用线性投影替代 Q-Former 为什么依然有效？"],
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
    answer: `结论：VQA 输入图+问题、输出答案，本质考"跨模态推理"：模型要同时理解图像内容、问题意图，再对齐两者推理。三代范式：①早期（2015-2019）：CNN 提图特征+LSTM 编问题+注意力融合+答案分类（答案限定 top-3000 常见词表，本质是分类）；②Transformer 时代（2019-2022）：ViLBERT/UNITER 双塔+跨模态 Transformer 预训练，BLIP 统一理解生成；③MLLM 时代（2023+）：GPT-4V/Qwen-VL/LLaVA 把图像转视觉 token 接进 LLM，VQA 变成"带图的对话"——开放式生成答案、能解释推理过程，还顺带覆盖 OCR、图表理解、多图推理。评估跟着变：分类时代用 VQA accuracy（min(1, 匹配的人类标注数/3)，soft 评分容忍答案多样性）；生成时代用规则匹配（数学题看最终答案）+LLM-as-judge。VQA 的深层价值：它是多模态模型最全面的体检项目——视觉感知、文本理解、知识调用、逻辑推理缺一不可。

\`\`\`python
# MLLM 时代 VQA：图像 token 进 LLM 开放式生成
img_tokens = projector(vit(image))           # 视觉 token
prompt = tokenizer("Question: 图中左侧的动物是什么？Answer:")
out = llm.generate(torch.cat([img_tokens, prompt.ids]))
# 经典 VQA accuracy（soft 评分）
acc = min(1.0, matches_with_10_annotations / 3)
\`\`\`

实际案例：医疗 VQA 辅助读片（"这片区域是否异常"）；电商客服拍图问"这个型号适配吗"；微软 Seeing AI 为视障用户描述图片并回答追问；阿里 Qwen-VL 系列在 DocVQA/ChartVQA 文档理解榜单长期领先。

踩坑与 tradeoff：分类式 VQA 的著名坑是语言先验 shortcut——模型不看图只凭"什么颜色"就猜"白色"也能高分，VQA v2 做答案平衡才缓解，面试常考；MLLM 的短板是细粒度感知（数个数、小物体、精确空间关系），高分辨率输入+动态切块是主流解法；开放式生成评估难，LLM-judge 有偏置、人工评估贵；多语言场景视觉概念与小语种词表的对齐会明显劣化。`,
    keyPoints: ["三代范式：分类→跨模态预训练→MLLM 开放生成", "VQA accuracy 用 3/10 标注 soft 匹配", "语言先验 shortcut 是经典坑，细粒度感知是 MLLM 短板"],
    followUps: ["VQA v2 如何通过答案平衡消除语言先验？", "动态切块（any-resolution）为什么能提升细粒度 VQA？"],
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
    answer: `结论：视频比图像多一维时间，时序建模是核心问题。方法谱系：①3D CNN（I3D）：2D 卷积核吹成 3D（t×h×w）直接在时空体上卷积，有效但算量爆炸（Kinetics 训练几百 GPU 天）；②时空分解：SlowFast 双路径（Slow 低帧率抓语义+Fast 高帧率抓运动）、TSM 用通道移位近似时序卷积降成本；③ViViT/TimeSformer：视频切时空 tubelet 进 Transformer，时空分解 attention（先空间后时间）比 full attention 便宜一个量级；④VideoMAE：掩码自监督预训练，随机遮 90% tubelet 重建，数据效率极高；⑤Video-LLM（2023+ 主流）：均匀抽 8-32 帧→每帧 ViT 编码→投影成视觉 token→接 LLM，时序靠帧位置编码或时序 Q-Former 聚合，直接复用 LLM 推理能力做视频问答/描述/定位。工程核心矛盾是 token 爆炸：32 帧×196 patch=6272 token 直接撑爆上下文，降帧/时序 pooling/token 压缩（每帧 196→16）是必备手艺。

\`\`\`python
# Video-LLM 标准流水线
frames = uniform_sample(video, n=16)         # 均匀抽帧
tokens = vit(frames)                          # (16, 196, 768)
tokens = temporal_pool(tokens, ratio=8)       # 每帧 196→24 token，防爆炸
video_tokens = projector(tokens.flatten(0,1)) # 投影进 LLM 空间
answer = llm(torch.cat([video_tokens, text_tokens]))
# VideoMAE 预训练：遮 90% tubelet 重建像素
\`\`\`

实际案例：抖音视频理解打标（内容安全+推荐标签）用抽帧+多模态流水线，亿级日处理靠分层采样降成本；某安防团队用 VideoMAE 微调做异常行为检测，标注量只需监督方案 1/10；Sora 类生成模型反向依赖视频理解（时空 patch VAE 编码）。

踩坑与 tradeoff：抽帧策略决定上限——均匀抽帧漏快速动作（体育/打斗），要镜头切换检测+关键帧自适应；长视频必须分层：先镜头级切分再镜头内抽帧，全局 pooling 会糊掉事件边界；视频-文本对齐数据贵图文对 10 倍（HowTo100M 的 ASR 弱监督噪声大）；Video-LLM 时序推理（"先发生什么后发生什么"）仍是弱项，时间定位任务普遍比描述任务低 20+ 个点。`,
    keyPoints: ["3D CNN→SlowFast→ViViT→VideoMAE→Video-LLM 五代演进", "token 爆炸是工程核心矛盾，降帧+时序 pooling 必备", "抽帧策略决定上限，时序推理仍是 Video-LLM 弱项"],
    followUps: ["SlowFast 双路径为什么比单路径 3D CNN 高效？", "镜头切换检测怎么做、对长视频理解有多大提升？"],
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
    question: "部署视角的知识蒸馏：在线蒸馏、蒸馏+量化组合怎么做？",
    answer: `结论：部署蒸馏关注"压缩后线上不掉点+成本可控"。三种形态：①离线蒸馏：teacher 先训好再教 student，最常见但 teacher 训练贵；②在线蒸馏：teacher 与 student 同步训练（或互为同伴互蒸），省掉单独训大模型的阶段，适合 teacher 也放不上产线的场景；③自蒸馏：深层教浅层/自身 logits 复用。蒸馏+量化组合是端侧标配：先蒸馏出小模型，再 QAT（量化感知训练）时继续用 teacher 软标签做蒸馏损失，补偿 INT8 带来的精度损失，通常比"先量化后补救"高。注意蒸馏目标要与线上推理精度格式一致（FP16/INT8 下数值范围不同）。

实际案例：美团/字节把推荐精排大模型在线蒸馏到轻量模型上线，teacher 只离线服务；阿里端侧模型用"蒸馏→QAT 联合训练"，INT8 下精度损失从 1-2% 压到 0.3% 内。

\`\`\`python
# QAT + 蒸馏联合：量化 student 同时拟合硬标签与 teacher 软标签
import torch.nn.functional as F
student_q = torch.ao.quantization.prepare_qat(student.train())
for x, y in loader:
    with torch.no_grad():
        t_logits = teacher_fp32(x)          # teacher 保持高精度
    s_logits = student_q(x)
    loss = F.cross_entropy(s_logits, y) + 0.7 * F.kl_div(
        F.log_softmax(s_logits/4, -1), F.softmax(t_logits/4, -1),
        reduction="batchmean") * 16
    loss.backward(); opt.step()
student_int8 = torch.ao.quantization.convert(student_q.eval())
\`\`\`

踩坑：在线蒸馏 teacher 未收敛会带偏 student，需 warmup 后再开蒸馏项；QAT 中 BN 折叠与伪量化节点位置影响大；先量化再蒸馏顺序反了精度难救回。`,
    keyPoints: ["离线/在线/自蒸馏三形态", "蒸馏+QAT 联合补偿量化损失", "蒸馏目标对齐线上推理精度"],
    followUps: ["QAT 与 PTQ 区别？", "在线蒸馏为何要 warmup？"],
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
    answer: `结论：KV Cache 缓存已生成 token 的 Key/Value 避免重复计算。复杂度账（生成长度 n，隐层 d）：无 cache 时第 t 步要对全部 t 个位置重算注意力，单步 O(t²·d)，累计 O(n³·d)；有 cache 时第 t 步只算新 token 的 Q/K/V，并与 t 个缓存 K 做点积，单步 O(t·d)，累计 O(n²·d)——平方项不可消除（注意力本身随长度平方增长），cache 省掉的是重复计算的立方项。PagedAttention（vLLM）把 KV Cache 分页管理减少碎片，支持连续 batching 提升吞吐。此外 GQA/MQA 让多个 Q 头共享 K/V 头（GQA 分组共享、MQA 全部共享 1 组），把 KV Cache 显存降到 1/g 甚至 1/h，是长上下文部署标配。

实际案例：vLLM 用 PagedAttention 提升 2-4 倍吞吐；字节/阿里 LLM 服务用 vLLM/TGI。LLaMA-2/3-70B、Qwen 系列用 GQA 压缩 KV Cache，连续 batching 动态调度请求。

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
    keyPoints: ["无 cache 累计 O(n³)、有 cache 单步 O(t) 累计 O(n²)", "PagedAttention 分页减碎片", "GQA/MQA 共享 K/V 头压缩 KV Cache"],
    followUps: ["GQA 和 MQA 的区别与取舍？", "Speculative Decoding？"],
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
    answer: `结论：边缘部署的约束三角：模型大小（手机 App 预算 50-200MB）、延迟（实时场景 <30ms/帧）、功耗（持续推理不能烫手降频）。压缩工具箱四件套：①剪枝——非结构化剪枝（删单个权重，压缩率高但需稀疏库支持，落地少）vs 结构化剪枝（整通道/整层砍，直接变瘦模型，是主流）；②量化——PTQ 直接转 INT8 快但可能掉点，QAT 训练时模拟量化误差精度最好；③蒸馏——小模型学 teacher 输出分布（暗知识）而非只学硬标签；④高效架构——MobileNetV3/EfficientNet-Lite 这类天生瘦的模型比事后压缩更省心。部署栈：PyTorch→ONNX→端侧框架（NCNN 腾讯/MNN 阿里/TFLite Google/CoreML 苹果），框架负责算子融合、内存复用、NEON/NPU 指令优化。NPU/DSP 是手机标配但算子白名单有限（自定义算子跑不了会回退 CPU），模型设计阶段就要查目标芯片的算子支持表。

\`\`\`python
# 压缩流水线：结构化剪枝 → 微调 → QAT → 转 MNN
pruned = channel_prune(model, ratio=0.4)       # 砍 40% 通道
finetune(pruned, epochs=10)                    # 微调恢复精度
qat_model = quantize_aware_train(pruned)       # QAT 模拟 INT8 误差
torch.onnx.export(qat_model, dummy, "m.onnx")
# MNNConvert -f ONNX --modelFile m.onnx --MNNModel m.mnn --bizCode biz
\`\`\`

实际案例：美团骑手 App 菜品图像识别跑端侧，MNN+INT8 模型 <10MB、单帧 <20ms；手机厂商人脸解锁用 NPU 跑轻量人脸模型，全程本地不上云（隐私卖点）；某 IoT 团队把 YOLOv5s 剪枝 40%+INT8 后跑瑞芯微 RK3399，30fps 实时检测。

踩坑与 tradeoff：剪枝后必须微调，直接上线掉 3-10 个点；INT8 校准数据不覆盖真实分布会严重掉点（用线上真实样本做校准集）；安卓碎片化是噩梦——同模型不同 SoC 表现差 3 倍，要按机型分级下发；端侧瓶颈常是内存带宽不是算力，小模型频繁读写大张量照样卡；明文模型放 APK 等于送竞争对手，模型加密/混淆是刚需。`,
    keyPoints: ["剪枝/量化/蒸馏/高效架构四件套，结构化剪枝是主流", "PyTorch→ONNX→NCNN/MNN/TFLite，NPU 算子白名单是硬约束", "端侧瓶颈常是带宽不是算力，机型碎片化要分级下发"],
    followUps: ["结构化剪枝按什么准则选要砍的通道？", "QAT 中伪量化节点应该插在哪里才不影响收敛？"],
    favorited: false,
    bigTech: false,
  },
  {
    id: "ai-206",
    nodeId: "ai-model-deploy",
    question: "Speculative Decoding 投机解码原理？Medusa/EAGLE 变体？接受率与加速比关系？",
    answer: `结论：自回归解码逐 token 串行是延迟瓶颈，且小 batch 时 GPU 算力闲置（显存带宽受限，decode 是 memory-bound）。Speculative Decoding 用"draft-verify"：小 draft 模型先自回归猜 γ 个 token，大 target 模型一次前向并行验证这 γ 个位置；逐位置比较，接受最长匹配前缀，第一个拒绝处按修正分布 p_norm=max(0, p_target−p_draft) 重采样——数学上保证输出分布与 target 模型完全一致（无损加速）。加速比 ≈ 每步平均接受 token 数 /（draft 耗时占比+1），接受率 α 越高收益越大；draft 越小越快但 α 越低，需在速度与接受率间权衡（同系列小模型或早退头 α 高）。变体：Medusa 在 target 上加多个预测头直接出候选（免独立 draft 模型）；EAGLE 在特征层做外推+树状草稿（tree attention 一次验证多分支），接受长度更长，vLLM/SGLang 已集成。

实际案例：vLLM/SGLang/TensorRT-LLM 均支持 EAGLE/Medusa，实测对话场景 1.5-2.5 倍加速；字节/阿里 LLM 服务在低峰小 batch 时开启投机解码降延迟，高峰大 batch 时关闭（batch 大后 decode 变 compute-bound，投机反而亏）。

\`\`\`python
# draft-verify 核心逻辑（简化）
def speculative_step(target, draft, prefix, gamma=4):
    tokens = list(prefix)
    for _ in range(gamma):                      # draft 串行猜 γ 个
        tokens.append(draft.sample(tokens))
    logits = target.forward(tokens)             # target 一次并行验证
    accepted = 0
    for i in range(gamma):
        p_t, p_d = softmax(logits[len(prefix)+i]), draft.last_prob[i]
        if sample_accept(p_t[tokens[len(prefix)+1+i]], p_d[tokens[len(prefix)+1+i]]):
            accepted += 1                        # 接受该 token
        else:
            tokens[len(prefix)+1+i] = sample_from_residual(p_t, p_d)
            break                                # 拒绝处修正后终止
    return tokens[:len(prefix)+1+accepted]       # 至少前进 1 步
\`\`\`

踩坑：采样温度高时接受率骤降（分布分散难猜中），greedy 场景收益最大；γ 不是越大越好，超过平均可接受长度后白算；大 batch 下 target 验证变成额外开销，需按负载动态开关；draft 与 target 词表/分词必须一致。`,
    keyPoints: ["draft 猜 γ 个 target 并行验证 分布无损", "加速比取决于接受率与 draft 开销", "Medusa 多头预测/EAGLE 特征外推+树状验证"],
    followUps: ["为何说投机解码输出分布无损？", "什么负载场景该关闭投机解码？"],
    favorited: false,
    bigTech: true,
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
    answer: `结论：ML 项目的"版本"有三维：代码、数据、模型，Git 只管代码（大文件会让仓库爆炸），DVC（Data Version Control）补上后两块。核心机制：dvc add data/train.csv 后真实文件移入 .dvc/cache（按内容 hash 寻址），Git 里只存几 KB 的 .dvc 元文件（记录 hash+远程存储位置）——Git 历史从此能精确追踪"这次实验用哪版数据"，git checkout v1.0 + dvc checkout 完整复原当时代码+数据。远程存储（S3/OSS/GCS/NAS）解决团队共享，dvc push/pull 像 git 一样同步。进阶是 dvc.yaml 定义 pipeline（stage：prepare→train→evaluate，声明依赖与产出），dvc repro 只重跑依赖变了的 stage（增量复现），dvc exp 管实验对比。与 Git 的配合哲学：Git 是版本图谱，DVC 是大文件内容寻址层，通过 .dvc 元文件桥接，提交粒度保持一致（数据变更和代码变更进同一 commit）。

\`\`\`bash
dvc init                                  # 初始化
dvc add data/train.csv                    # 跟踪数据 → 生成 train.csv.dvc
dvc remote add -d storage s3://bucket/dvc # 配置远程存储
dvc push                                  # 数据推远程
git add data/train.csv.dvc .gitignore && git commit -m "data v2"
git checkout v1.0 && dvc checkout         # 切回 v1.0 的代码+数据
dvc repro                                 # 按 dvc.yaml 增量复现 pipeline
\`\`\`

实际案例：某自动驾驶团队用 DVC+S3 管理路测数据切片，每次实验可精确回溯数据版本；医疗 AI 公司用 DVC 满足审计（模型用哪版数据训练必须可追溯）；Kaggle 团队赛常用 DVC 同步特征文件；替代方案有 lakeFS（数据湖分支化）、Pachyderm（K8s 原生）。

踩坑与 tradeoff：DVC 管版本不管特征语义——特征平台（Feast）解决特征定义复用与在线离线一致，两者互补不替代；百万小文件场景文件级 hash 开销大，要打包 tar 再管；.dvc/cache 本地会膨胀，定期 dvc gc；成员忘 dvc push 导致别人拉到旧数据的事故常见，要配 CI 检查；别用 DVC 管高频变化的数据库 dump，那是数据湖快照的活。`,
    keyPoints: ["Git 管代码+DVC 管数据模型，.dvc 元文件桥接", "内容 hash 寻址+dvc checkout 完整复原历史实验", "dvc.yaml pipeline 增量复现，只重跑变了的 stage"],
    followUps: ["DVC 与 lakeFS 的分支化数据管理有什么本质区别？", "pipeline 的 stage 依赖缓存失效机制是怎样的？"],
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
    answer: `结论：特征平台（Feature Store）解决的核心矛盾是"训练用一套特征逻辑、serving 用另一套"导致的线上线下不一致——这是推荐/风控系统离线 AUC 高、线上翻车的头号原因。架构五层：①注册中心（特征用 DSL/protobuf 声明一次：计算逻辑、数据源、负责人、更新频率）；②离线计算（Spark 按定义批量算历史特征写 Hive/Parquet，产出训练样本）；③在线计算（同一定义编译成 Flink 作业或在线服务代码，算实时特征写 Redis/KV）；④存储（离线表+在线 KV 双写）；⑤服务（训练时 point-in-time join 取历史快照，推理时低延迟读最新值）。point-in-time join 是灵魂：取用户 T 时刻特征必须只用 T 之前的数据计算，否则特征穿越——训练样本混进"未来信息"，离线指标虚高。一致性靠"一套定义、两套执行"：定义唯一、引擎不同但逻辑同源，再加定期对账（抽样比对离线重算值 vs 在线值，不一致率超阈值报警）。

\`\`\`python
# point-in-time join：只取 label 时间之前的特征
samples = events.join(
    features,
    on=["user_id"],
    condition=features.ts < events.label_ts,   # 关键：严格小于
    how="left",
)
# 特征注册（Feast 风格）
user_ctr_7d = Feature(name="user_ctr_7d", dtype=Float32,
    source=spark_sql, ttl=timedelta(days=7), owner="rec-team")
\`\`\`

实际案例：字节/阿里自研特征平台支撑推荐广告，特征注册-开发-上线全自助化，新特征从天级到小时级；开源 Feast（Gojek 开源）是中小团队首选；某金融风控团队上特征平台后，线上线下不一致导致的 A/B 翻车事故归零，新特征上线周期从 2 周缩到 2 天。

踩坑与 tradeoff：point-in-time join 在 Spark 里要按事件时间戳关联（不是 join 当天分区），条件写错一个就穿越；实时与离线特征的"同一定义"常在细节上漂移（Flink 滑窗 vs Spark 天窗口径不同），窗口语义必须对齐；在线 KV 的 value 要版本化（定义变了老值要失效）；特征平台不是银弹——特征少于 100 个的小团队，维护平台成本大于收益，规范化宽表+脚本也能活；监控特征分布漂移（PSI）比监控模型指标更能提前发现问题。`,
    keyPoints: ["一套定义两套执行，根治线上线下特征不一致", "point-in-time join 防特征穿越是平台灵魂", "注册中心+离线/在线计算+双存储+服务层五层架构"],
    followUps: ["离线重算值与在线值的对账具体怎么抽样比对？", "实时特征窗口语义（Flink 滑窗 vs Spark 天窗）如何对齐？"],
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
  // ===== 32. ai-math-foundations =====
  {
    id: "ai-306",
    nodeId: "ai-math-foundations",
    question: "特征值分解与 SVD 的区别与联系？SVD 在推荐和降维中怎么用？",
    answer: `结论：特征值分解 A=VDV⁻¹ 只适用于方阵，且要求 A 可对角化（有 n 个线性无关特征向量）；SVD（奇异值分解）A=UΣVᵀ 适用于任意 m×n 矩阵，U/V 是正交矩阵、Σ 是对角奇异值矩阵——SVD 是特征值分解的广义化：AAᵀ 的特征向量是 U、AᵀA 的特征向量是 V、奇异值 σᵢ=√λᵢ。几何直觉：任何线性变换都可以分解为"旋转→按奇异值缩放→再旋转"。截断 SVD 取 top-k 奇异值即最优低秩近似（Eckart-Young 定理，F 范数意义下误差最小），这是 PCA 和矩阵分解推荐的数学根基。

\`\`\`python
import numpy as np
U, S, Vt = np.linalg.svd(A, full_matrices=False)
k = 20
A_k = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]   # 最优秩 k 近似
err = np.linalg.norm(A - A_k, "fro")          # = sqrt(sum(S[k:]**2))
# 信息保留率 = 前 k 奇异值平方和 / 全部奇异值平方和
ratio = (S[:k]**2).sum() / (S**2).sum()
\`\`\`

实际案例：Netflix Prize 时代 Funk-SVD 把用户-物品评分矩阵分解为隐因子向量，RMSE 降 8%+；推荐系统用截断 SVD 做 embedding 初始化（亿级物品维度压到 128 维）；NLP 早期 LSA 用 SVD 把词-文档矩阵降维做语义检索；某搜索团队用 SVD 压缩双塔 query embedding 层参数，存储降 75% 而召回率损失 <1%。

踩坑与 tradeoff：SVD 复杂度 O(mn·min(m,n))，亿级矩阵要用随机化 SVD（randomized SVD，复杂度降到 O(mnk)）或增量 SVD；稀疏矩阵做 SVD 要先填缺失值（推荐里填充策略影响巨大，填 0 vs 填均值 vs 只优化观测项的 Funk-SVD 是三代演进）；奇异值衰减慢的矩阵（如 attention 权重）低秩近似误差大；SVD 给出的是线性近似，非线性结构要用 autoencoder 或核方法；数值上优先用 np.linalg.svd 而不是手写 AᵀA 特征分解——AᵀA 会平方条件数，丢失精度。`,
    keyPoints: ["SVD 是任意矩阵的广义特征分解，σᵢ=√λᵢ(AᵀA)", "截断 SVD=最优低秩近似（Eckart-Young）", "大矩阵用随机化 SVD，推荐场景缺失值填充策略决定效果"],
    followUps: ["随机化 SVD 的原理与误差界？", "为什么直接对 AᵀA 做特征分解数值不稳定？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-307",
    nodeId: "ai-math-foundations",
    question: "矩阵求导常用结论？如何推导最小二乘的正规方程？",
    answer: `结论：矩阵求导先定布局约定（分母布局 denominator layout 最常用：标量对向量求导得到列向量）。核心结论三板斧：①∂(aᵀx)/∂x = a；②∂(xᵀAx)/∂x = (A+Aᵀ)x（A 对称时为 2Ax）；③∂||Ax-b||²/∂x = 2Aᵀ(Ax-b)。最小二乘推导：目标 f(x)=||Ax-b||²=(Ax-b)ᵀ(Ax-b)，展开得 xᵀAᵀAx - 2bᵀAx + bᵀb，对 x 求导用结论①②得 2AᵀAx - 2Aᵀb，令梯度为零即正规方程 AᵀAx = Aᵀb；AᵀA 可逆时 x=(AᵀA)⁻¹Aᵀb。二阶条件：Hessian=2AᵀA 半正定，故为极小值点。面试常追问"为什么不用手算逆矩阵"——实际用 QR 分解或 SVD 求解，数值更稳。

\`\`\`python
import numpy as np
# 正规方程（教学用，生产别这么写）
x_ne = np.linalg.solve(A.T @ A, A.T @ b)
# 生产做法 1：QR 分解（A 列满秩时数值稳定）
Q, R = np.linalg.qr(A)
x_qr = np.linalg.solve(R, Q.T @ b)
# 生产做法 2：lstsq 内部走 SVD，能处理秩亏
x_svd, *_ = np.linalg.lstsq(A, b, rcond=None)
\`\`\`

实际案例：CTR 预估的线性模型冷启动用正规方程闭式解（特征几十万时用共轭梯度）；在线学习 FTRL 出现前，广告系统每天用 MapReduce 算 AᵀA 和 Aᵀb 解正规方程更新 LR；某风控团队特征共线性严重（AᵀA 近奇异），加岭正则 (AᵀA+λI) 后权重从爆炸量级回到合理范围，KS 稳定 +3 个点。

踩坑与 tradeoff：AᵀA 的条件数是 A 的条件数平方——病态矩阵直接炸，这就是"为什么代码里写 lstsq 不写 inv(AᵀA)Aᵀb"；特征强相关（多重共线性）时解不唯一，要加 L2；样本量 n<特征数 p 时 AᵀA 必不可逆，必须用正则或伪逆；面试常考"梯度=0 为什么是最小值"，答 Hessian 半正定即可；推导时最容易错的是 xᵀAx 的导数忘记 A 不对称时要 (A+Aᵀ)x。`,
    keyPoints: ["三条求导结论覆盖 90% 面试推导题", "正规方程 AᵀAx=Aᵀb，生产用 QR/SVD 而非求逆", "AᵀA 条件数平方是数值灾难根源"],
    followUps: ["岭回归的贝叶斯解释（先验是什么）？", "共轭梯度为什么适合大规模正规方程？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-308",
    nodeId: "ai-math-foundations",
    question: "MLE 与 MAP 的区别？与正则化的关系？",
    answer: `结论：MLE（最大似然估计）只问"什么参数让观测数据最可能"：θ_MLE = argmax P(D|θ) = argmax Σ log P(xᵢ|θ)，大数据下一致且渐近有效，但对小数据过拟合、对参数毫无偏好。MAP（最大后验）乘上先验：θ_MAP = argmax P(D|θ)P(θ)，取对数后是 log P(D|θ) + log P(θ)——先验取对数就是正则项：高斯先验 N(0,τ²) → log 先验 = -||θ||²/2τ² + const，正好对应 L2 正则（λ=1/2τ²）；拉普拉斯先验 → |θ| 求和，对应 L1 正则。所以"L2 正则=高斯先验、L1 正则=拉普拉斯先验"不是类比，是恒等。贝叶斯方法再进一步：不求点估计，直接维护后验分布 P(θ|D)，预测时积分掉参数。

\`\`\`python
# 同一模型的三种估计视角（逻辑回归）
from sklearn.linear_model import LogisticRegression
# MLE：C→∞ 等价无正则
mle = LogisticRegression(C=1e9, penalty=None)
# MAP + 高斯先验 = L2；C = 1/λ 控制先验强度
map_l2 = LogisticRegression(C=1.0, penalty="l2")
# MAP + 拉普拉斯先验 = L1 → 稀疏解
map_l1 = LogisticRegression(C=1.0, penalty="l1", solver="liblinear")
\`\`\`

实际案例：医疗小样本场景（几百例）纯 MLE 的 LR 权重方差巨大，加 L2（高斯先验）后交叉验证 AUC 从 0.71 稳到 0.78；广告 LR 用 L1 把千万维特征压到十万维非零， serving 内存降 90%；贝叶斯优化用高斯过程后验指导超参搜索，比网格搜索省 10 倍实验次数。

踩坑与 tradeoff：先验是双刃剑——先验错了（如真实权重很大而先验压得狠）MAP 会有偏，偏差-方差权衡里它是"用偏差换方差"；样本量 n→∞ 时似然项主导、先验被淹没，MAP≈MLE（贝叶斯一致性）；L1 的"稀疏先验"其实是零处尖峰不可导的拉普拉斯分布，优化要用次梯度/近端算子；面试加分点：MAP 仍是点估计，丢失了不确定性信息——知道"参数大概在哪"和"参数后验分布长什么样"在风险决策（金融/医疗）里差别巨大，这是贝叶斯方法的真正卖点。`,
    keyPoints: ["MAP = MLE + log 先验，L2↔高斯先验、L1↔拉普拉斯先验", "n→∞ 时似然主导，MAP 退化为 MLE", "MAP 是点估计，完整贝叶斯保留后验不确定性"],
    followUps: ["为什么拉普拉斯先验（L1）产生稀疏解而高斯先验不产生？", "贝叶斯 logistic 回归怎么做在线推断？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-309",
    nodeId: "ai-math-foundations",
    question: "常见概率分布及应用场景？什么是共轭先验？",
    answer: `结论：建模第一步是选对分布。伯努利分布建模单次二元事件（点击/不点击，CTR 的似然就是伯努利乘积→交叉熵）；二项分布是 n 次伯努利的计数；多项分布建模单次多类（softmax 分类的似然）；高斯分布由中心极限定理背书，建模误差/身高类连续量，最大熵原理说"只知道均值方差时高斯是假设最少的分布"；泊松分布建模单位时间计数（每分钟请求数、曝光数），均值=方差；指数分布建模等待时间，无记忆性；Dirichlet 是多项分布参数上的分布（LDA 主题模型的先验）。共轭先验：先验与似然共轭 ⇒ 后验与先验同族——Beta 是伯努利/二项的共轭先验（Beta-Binomial），Dirichlet 是多项的共轭先验，高斯均值在方差已知时的共轭先验还是高斯。共轭让后验有闭式解，观测数据只是更新超参数（如 Beta(α,β) 观测 s 次成功 f 次失败 → Beta(α+s, β+f)）。

\`\`\`python
from scipy import stats
# Beta-Binomial 共轭更新：先验 Beta(2,2)（弱信息，等价 2+2 个虚拟样本）
alpha, beta = 2, 2
s, f = 47, 3          # 观测：50 次展示 47 次点击
post = stats.beta(alpha + s, beta + f)   # 后验 Beta(49,5)
post.mean()           # ≈0.907，比 MLE 的 0.94 温和（先验收缩）
post.ppf([0.025, 0.975])   # 95% 后验区间，小样本也有量化不确定性的能力
\`\`\`

实际案例：广告 CTR 平滑用 Beta-Binomial——新广告 3 次展示 2 次点击的 MLE=0.67 不可信，加先验 Beta(20,2000)（大盘 CTR≈1%）后收缩到 2% 附近，防冷启动高估；多臂老虎机 Thompson sampling 本质就是 Beta 后验采样；LDA 主题模型全程 Dirichlet-Multinomial 共轭才使 Gibbs 采样可行。

踩坑与 tradeoff：分布选错全盘皆输——曝光数方差远超均值（过度离散）时用泊松会低估波动，应换负二项分布；高斯假设下厚尾数据（收入、停留时长）的均值方差被极端值带偏，要先 log 变换或用中位数；共轭先验计算优雅但表达力有限，真实先验复杂时只能 MCMC/变分推断；样本量大后先验影响消失，别在亿级数据上纠结先验形式。`,
    keyPoints: ["似然选择=分布选择：伯努利→CTR、多项→softmax、泊松→计数", "共轭先验让后验闭式可更新（Beta-Binomial/Dirichlet-Multinomial）", "小样本靠先验收缩防 MLE 过自信"],
    followUps: ["泊松分布过度离散时为什么换负二项？", "Thompson sampling 为什么比 UCB 更适合延迟反馈场景？"],
    favorited: false,
  },
  {
    id: "ai-310",
    nodeId: "ai-math-foundations",
    question: "熵、交叉熵、KL 散度、互信息的定义与关系？为什么 KL 不对称？",
    answer: `结论：熵 H(P) = -Σ p log p 是分布自身的不确定性（最优编码平均码长下界）；交叉熵 H(P,Q) = -Σ p log q 是用 Q 的编码方案编 P 的平均码长；KL 散度 D_KL(P||Q) = Σ p log(p/q) = H(P,Q) - H(P) 是多花的码长/信息损失，恒 ≥0（Gibbs 不等式），等号当且仅当 P=Q。训练分类器时标注分布 P 固定，最小化交叉熵 ≡ 最小化 KL 散度——这就是"交叉熵损失"的信息论解释。KL 不对称的根源：对数里放的是 p/q——P 有质量而 Q 接近零的地方，log(p/q)→∞ 惩罚爆炸；反过来 Q 有 P 无的地方 P 根本不参与求和。后果：D_KL(P||Q) 是"正向 KL/均值寻求 mode-covering"（Q 不敢漏掉 P 的任何模式），D_KL(Q||P) 是"反向 KL/模式寻求 mode-seeking"（Q 挑 P 的一个峰贴上）。互信息 I(X;Y) = D_KL(P(X,Y)||P(X)P(Y)) = H(X)-H(X|Y)，衡量知道 Y 后 X 不确定性降多少。

\`\`\`python
import numpy as np
def kl(p, q):
    mask = p > 0
    return np.sum(p[mask] * np.log(p[mask] / q[mask]))
p = np.array([0.5, 0.4, 0.1]); q = np.array([0.4, 0.4, 0.2])
kl(p, q)   # ≈0.034
kl(q, p)   # ≈0.038 —— 不相等，即不对称
# 交叉熵 = 熵 + KL
H = -np.sum(p * np.log(p)); CE = -np.sum(p * np.log(q))
assert np.isclose(CE, H + kl(p, q))
\`\`\`

实际案例：知识蒸馏最小化 D_KL(teacher||student)（正向 KL，student 要覆盖 teacher 的整个软分布）；VAE 的 ELBO 里 D_KL(q(z|x)||p(z)) 是反向 KL，导致后验坍缩倾向单峰；扩散模型训练等价于变分下界串起一串 KL；某对话系统用互信息做特征选择，把与意图标签互信息 top-2000 的词喂给 FastText，小模型 F1 +2 个点。

踩坑与 tradeoff：KL 不是距离（不满足三角不等式），需要真距离用 Wasserstein 或 JS 散度（JSD 对称、有界，GAN 初期用 JSD 解释训练饱和）；P 支持集外 Q=0 时 KL=∞，工程实现要加 eps 平滑；反向 KL 的 mode-seeking 解释了 RLHF 后模型输出多样性下降（策略向奖励模型主峰收缩）；熵的单位取决于 log 底：底 2 是 bit，底 e 是 nat，比较论文数字先确认单位。`,
    keyPoints: ["交叉熵=熵+KL，P 固定时二者等价优化", "KL 不对称：正向 mode-covering、反向 mode-seeking", "互信息=联合分布与独立假设的 KL"],
    followUps: ["JS 散度为什么对称有界？与 GAN 训练饱和的关系？", "RLHF 中反向 KL 如何导致多样性塌缩？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-311",
    nodeId: "ai-math-foundations",
    question: "什么是凸优化？为什么凸函数保证全局最优？深度学习是凸的吗？",
    answer: `结论：凸集：集合内任意两点连线仍在集合内；凸函数：定义域是凸集且 f(θx+(1-θ)y) ≤ θf(x)+(1-θ)f(y)（弦在函数上方），严格凸则不等号严格成立。判定三法：①定义（难用）；②一阶条件：可微 f 凸 ⟺ f(y) ≥ f(x)+∇f(x)ᵀ(y-x)（任意点切线是全局下界——这一条直接推出"梯度为零即全局最优"，因为 f(y) ≥ f(x*)+0 = f(x*)）；③二阶条件：二阶可微 f 凸 ⟺ Hessian 半正定。凸优化=凸目标+凸约束集，核心性质：任何局部极小都是全局极小，且解集是凸集。常见凸问题：线性回归（Hessian=2AᵀA 半正定）、逻辑回归、SVM、Lasso；深度学习损失对参数高度非凸（置换对称性就保证多个等价极小点），但实际中 SGD 能找到很好的解——现代理论解释：过参数化网络的损失面"坏局部极小很少、鞍点很多"，SGD 的噪声帮助逃离鞍点。

\`\`\`python
import numpy as np
# 验证凸性：随机点对检查弦在函数上方
def is_convex_empirical(f, lo, hi, n=1000):
    for _ in range(n):
        x, y = np.random.uniform(lo, hi, 2)
        t = np.random.rand()
        if f(t*x + (1-t)*y) > t*f(x) + (1-t)*f(y) + 1e-12:
            return False
    return True
is_convex_empirical(lambda z: z**2, -10, 10)      # True
is_convex_empirical(lambda z: np.sin(z), -10, 10) # False
# Hessian 半正定判定：特征值全 >= 0
np.linalg.eigvalsh(2 * A.T @ A).min() >= 0  # 线性回归凸性证明
\`\`\`

实际案例：SVM 的辉煌时代（2000s）很大程度因为凸优化保证全局解+可复现，而同期神经网络"炼金术"口碑差；广告 LR 时代亿级特征照样每天稳定收敛到同一解——凸性就是工业可复现性的底气；运筹排产（线性规划也是凸问题）至今是供应链核心。

踩坑与 tradeoff：凸性对变换敏感——log-sum-exp 凸、max 凸，但 f(x)=x⁴ 凸而 ∇² 在原点为零（半正定不是正定，仍凸）；范数都凸，但 ||x||⁰（非零元个数）不凸，这是 L0 稀疏必须用 L1 松弛的原因；约束条件凸性同样重要——等式约束必须仿射才保凸；面试陷阱："深度学习非凸所以找不到好解"是错误论断，过参数化+SGD 隐式偏置（倾向低范数/低秩解）让经验效果远超经典理论预期；证明题套路：先写定义或求 Hessian，别空喊"显然凸"。`,
    keyPoints: ["凸函数一阶条件：切线是全局下界 ⇒ 梯度零即全局最优", "Hessian 半正定 ⟺ 二阶可微函数凸", "深度学习非凸但坏局部极小少，SGD 隐式偏置兜底"],
    followUps: ["为什么 L0 正则不凸？L1 是最佳凸松弛怎么证？", "过参数化为什么让非凸问题变好优化？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-312",
    nodeId: "ai-math-foundations",
    question: "拉格朗日乘子法与 KKT 条件？SVM 中如何应用？",
    answer: `结论：等式约束 min f(x) s.t. h(x)=0：构造 L(x,λ)=f(x)+λh(x)，最优解满足 ∇f+λ∇h=0——几何意义是目标梯度与约束梯度平行（约束曲面上走不动更优方向）。不等式约束升级为 KKT 条件（凸问题+slater 条件下是充要）：①平稳性 ∇f+Σλᵢ∇gᵢ+Σμⱼ∇hⱼ=0；②原始可行 gᵢ(x)≤0、hⱼ(x)=0；③对偶可行 λᵢ≥0；④互补松弛 λᵢgᵢ(x)=0——最后一条是灵魂：要么约束紧（g=0，支撑向量），要么乘子零（λ=0，无关样本）。SVM 应用：原始问题 min ||w||²/2 s.t. yᵢ(wᵀxᵢ+b)≥1，KKT 互补松弛 ⇒ 只有间隔边界上的样本 λᵢ>0（这就是"支持向量"），w=Σλᵢyᵢxᵢ 只由支持向量展开；对偶问题把 w 消去后只剩内积 xᵢᵀxⱼ，核技巧得以无缝插入（内积换成核函数 K(xᵢ,xⱼ)）。

\`\`\`python
# SVM 对偶问题（cvxpy 直接解，教学版）
import cvxpy as cp
lam = cp.Variable(n)
dual = cp.Maximize(cp.sum(lam) - 0.5*cp.sum_squares(lam * y @ K))  # K 为核矩阵
prob = cp.Problem(dual, [lam >= 0, cp.sum(lam * y) == 0])
prob.solve()
sv = lam.value > 1e-5            # 互补松弛：只有支持向量非零
w = (lam.value * y) @ X          # w 完全由支持向量张成
print(f"支持向量占比: {sv.mean():.1%}")   # 通常 <10%
\`\`\`

实际案例：SVM 面试必考"为什么只依赖支持向量"——答案就是互补松弛；推荐系统带约束排序（如 GMV 最大化 s.t. 用户体验损失≤阈值）用拉格朗日把约束转进目标，线上调节 λ 即可在指标间滑动，某电商广告团队用此法把"收入-体验"权衡从周级调参变成实时旋钮；强化学习约束策略优化（CPO/RCPO）同样靠拉格朗日对偶。

踩坑与 tradeoff：KKT 对非凸问题只是必要非充分（满足 KKT 不等于全局最优）；互补松弛 λg=0 数值上难严格成立，求解器都用容差 1e-6 量级；对偶间隙（duality gap）凸问题+slater 为零，非凸问题可能很大，别把对偶解当原问题解；面试高频推导"SVM 原问题→对偶"的关键两步：先对 w、b 求导得 w=Σλyx 和 Σλy=0，再代回消元；SVM 大样本不用对偶直接 primal SGD（如 liblinear）反而更快——对偶是为核技巧和小样本理论美而生的。`,
    keyPoints: ["KKT 四条件：平稳/原始可行/对偶可行/互补松弛", "互补松弛 ⇒ SVM 只依赖支持向量，w 是支持向量线性组合", "对偶把内积暴露出来，核技巧由此插入"],
    followUps: ["Slater 条件是什么？缺了它会怎样？", "推荐系统用拉格朗日做约束排序的工程细节？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-313",
    nodeId: "ai-math-foundations",
    question: "大数定律与中心极限定理？在 A/B 测试与模型评估中如何用？",
    answer: `结论：大数定律（LLN）：样本均值依概率收敛到期望——n 越大估计越准，这是一切"用数据估计真实指标"的合法性来源；中心极限定理（CLT）更强：不管原始分布长什么样（只要方差有限），标准化后的样本均值 (x̄-μ)/(σ/√n) 依分布收敛到标准正态——CTR 这种伯努利量、时长这种重尾量，n 足够大时均值都近似正态，置信区间 x̄±1.96σ/√n 才可用。两个直接推论：①标准误随 √n 衰减——想精度翻倍，样本要 4 倍，这就是 A/B 测试样本量公式的由来；②方差 σ² 越大所需 n 越大——高方差指标（GMV、时长）比低方差指标（CTR）需要更长实验周期。A/B 检验里，两组的差 x̄₁-x̄₂ 也近似正态，z 检验/t 检验皆出于 CLT。

\`\`\`python
import numpy as np
from scipy import stats
# A/B 样本量公式（MDE=最小可检测效应）
def sample_size(p, mde, alpha=0.05, power=0.8):
    z_a, z_b = stats.norm.ppf(1-alpha/2), stats.norm.ppf(power)
    return 2 * (z_a + z_b)**2 * p*(1-p) / mde**2
n = sample_size(p=0.10, mde=0.005)   # CTR 10%，检测 +0.5pt：每组约 2.76 万
# 模拟验证 CLT：指数分布（重偏）的样本均值仍趋正态
means = [np.mean(np.random.exponential(1, 50)) for _ in range(10000)]
stats.normaltest(means).pvalue       # p 大 ⇒ 无法拒绝正态
\`\`\`

实际案例：某内容平台实验平台默认配置：CTR 类指标 5% MDE 需 3 天流量，GMV 类高方差指标同 MDE 要 14 天——强行缩短周期曾把噪声当提升全量上线，复盘损失数百万；模型离线评估同样吃 CLT：测试集 1 万条时 AUC±0.005 是噪声范围，比较两个 AUC 差 0.003 的模型毫无意义，需要 10 万级样本或 bootstrap 置信区间。

踩坑与 tradeoff：CLT 要求 i.i.d.——用户级指标按"请求"随机分流会违反独立性（同一用户多次出现），要按用户分流且方差用 cluster-robust 估计；重尾分布（收入）收敛慢，n=几百时正态近似很差，用 bootstrap 或对数变换；多重检验（同时看 20 个指标）假阳性暴增，需 Bonferroni/FDR 校正；连续监控（天天看 p 值，显著就停）会让假阳性率从 5% 膨胀到 30%+，要用序贯检验（mSPRT）或固定 horizon；"p=0.051 就是没效果"是误读——报告效应量+置信区间比二元判定诚实得多。`,
    keyPoints: ["LLN 保证均值收敛，CLT 保证正态近似→置信区间可用", "精度翻倍样本 4 倍（√n 律），高方差指标需更长周期", "i.i.d. 假设被用户级分流破坏时用 cluster-robust"],
    followUps: ["bootstrap 置信区间怎么算？何时优于正态近似？", "序贯检验如何控制连续监控的假阳性？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 33. ai-gnn =====
  {
    id: "ai-314",
    nodeId: "ai-gnn",
    question: "GNN 消息传递（Message Passing）范式？聚合-更新两步如何工作？",
    answer: `结论：GNN 的统一抽象是消息传递：每个节点向邻居"收消息"、聚合、更新自身表示。第 k 层：h_v⁽ᵏ⁾ = UPDATE(h_v⁽ᵏ⁻¹⁾, AGGREGATE({h_u⁽ᵏ⁻¹⁾ : u ∈ N(v)}))——AGGREGATE 必须对邻居集合置换不变（sum/mean/max/attention），因为图没有顺序。k 层后每个节点的表示融合了 k 跳邻域信息（k 跳感受野），再按任务接读出头：节点分类逐节点接 MLP，图分类做全局池化（graph readout），边预测对两端表示做点积/拼接。表达能力上限是 Weisfeiler-Lehman 图同构测试：标准消息传递 GNN 区分图结构的能力不超过 1-WL——两个 1-WL 等价的图（如两个三角形 vs 六元环）GNN 分不开，这是 GIN 论文的核心结论，也解释了为什么 AGGREGATE 用 sum（单射性最好）优于 mean/max。

\`\`\`python
import torch
from torch_geometric.nn import GCNConv
class GNN(torch.nn.Module):
    def __init__(self, in_dim, hid, out_dim):
        super().__init__()
        self.c1, self.c2 = GCNConv(in_dim, hid), GCNConv(hid, out_dim)
    def forward(self, x, edge_index):
        x = torch.relu(self.c1(x, edge_index))  # 第 1 层：聚合 1 跳
        return self.c2(x, edge_index)           # 第 2 层：感受野扩到 2 跳
# 节点分类损失
loss = F.cross_entropy(out[train_mask], y[train_mask])
\`\`\`

实际案例：Pinterest 的 PinSage 用 GraphSAGE 在 30 亿节点 pin 图上生成 embedding，推荐 CTR +25%；阿里电商图召回用 GNN 聚合用户-商品二部图，相比 ItemCF 覆盖率 +18%；支付风控用 GNN 聚合设备-账户-银行卡关系网，团伙欺诈召回率 +30%。

踩坑与 tradeoff：层数不能堆——2-4 层是甜区，再深过平滑（所有节点表示趋同）；聚合函数 mean 会丢邻居数量信息（度归一化后 100 个邻居和 3 个邻居输出同量级），度差异大的图用 sum 或 attention；有向边/边特征（转账金额）要专门设计（R-GCN/edge features），直接当无向会损失语义；消息传递是局部操作，长程依赖（图两端节点交互）需要虚拟节点或 Graph Transformer；异构图（用户/商品/店铺不同节点类型）不能混着聚合，要按边类型分别聚合再合并。`,
    keyPoints: ["聚合必须置换不变，k 层=k 跳感受野", "表达能力上限 1-WL，sum 聚合单射性最好", "2-4 层甜区，过深过平滑"],
    followUps: ["GIN 如何逼近 1-WL 表达上限？", "虚拟节点（virtual node）如何缓解长程依赖问题？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-315",
    nodeId: "ai-gnn",
    question: "GCN 原理？谱域卷积如何近似为一阶邻居聚合？",
    answer: `结论：GCN 有两条推导路线，面试要能从谱图理论讲到空间形式。谱域路线：图傅里叶变换建立在拉普拉斯矩阵 L=I-D^(-1/2)AD^(-1/2) 的特征基上，图卷积=特征空间里逐特征值滤波 g_θ(Λ)；直接算特征分解 O(N³) 不可行，用 K 阶 Chebyshev 多项式逼近滤波器（Kipf & Welling 再简化到 K=1 一阶近似）：卷积退化为 h' = σ(D̂^(-1/2)ÃD̂^(-1/2) X W)，其中 Ã=A+I 是自环邻接矩阵（不加自环节点会丢自身信息），D̂ 做对称归一化防高度节点数值爆炸。一句话：一层 GCN = "邻居表示的对称归一化加权平均 + 线性变换 + 非线性"，谱域的"一阶局部化"恰好等价空间域的"一阶邻居聚合"——这是谱与空间两视角会师的地方，也是面试最想要的回答。

\`\`\`python
import torch
def gcn_layer(X, A, W):
    A_hat = A + torch.eye(A.size(0))          # Ã = A + I（自环）
    D_inv_sqrt = torch.diag(A_hat.sum(1).pow(-0.5))
    agg = D_inv_sqrt @ A_hat @ D_inv_sqrt @ X # 对称归一化聚合
    return torch.relu(agg @ W)
# 等价 PyG 调用：GCNConv(in_dim, out_dim)
\`\`\`

实际案例：半监督节点分类是 GCN 成名战——Cora 引用网络只用 5% 标注就 81.5% 准确率（当年 SOTA）；某内容社区用 GCN 做账号 embedding，下游虚假注册识别 AUC +0.04；学术图谱分类、分子性质预测（图即分子式）都是标准落地。

踩坑与 tradeoff：GCN 是直推式（transductive）——聚合矩阵固定，新节点加入要重训全图，工业动态图基本用 GraphSAGE 替代；对称归一化把高度节点权重压扁（D^(-1/2) 两侧各除一次），hub 节点多的图（社交网络大 V）信息损失明显；自环权重和邻居权重绑死无法分别学习，GAT/GIN 解耦了这一点；两层 GCN 感受野只有 2 跳，深层堆叠触发过平滑+参数量爆炸；谱 GCN 对图结构扰动敏感（对抗攻击加几条边就能翻转预测），风控场景要做图净化或鲁棒聚合。`,
    keyPoints: ["Chebyshev 多项式逼近谱滤波，一阶近似=邻居聚合", "Ã=A+I 自环保自身信息，D^(-1/2) 对称归一化防数值爆炸", "直推式限制：新节点要重训，工业用 GraphSAGE"],
    followUps: ["为什么 Chebyshev 逼近能避免 O(N³) 特征分解？", "GCN 对图对抗攻击为什么脆弱？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-316",
    nodeId: "ai-gnn",
    question: "GraphSAGE 与 GCN 的核心区别？归纳式学习如何做到？",
    answer: `结论：两个本质区别。①归纳式 vs 直推式：GCN 的传播矩阵 D̂^(-1/2)ÃD̂^(-1/2) 依赖全图结构，训练时见过全部节点，新节点加入必须重训；GraphSAGE 学的是"聚合函数本身"——给任意节点的邻居集合就能算表示，新节点带上自己的邻居即可零成本推理（inductive），这是工业动态图选 GraphSAGE 的根本原因。②采样+自环解耦：GCN 用全邻居，GraphSAGE 每层固定采样 k 个邻居（如 25/10），把单节点计算量从 O(度) 压到常数，大图可 mini-batch 训练；同时自身表示和邻居聚合结果走 concat 而非绑死加权（h_v = σ(W·[h_v || AGG(h_u)])），自身信息和邻域信息分别学习。聚合器三选：mean、LSTM（打乱顺序训练置换鲁棒）、max-pooling。

\`\`\`python
from torch_geometric.nn import SAGEConv
from torch_geometric.loader import NeighborLoader
# 每层采样 [25, 10] 个邻居 → mini-batch 大图训练
loader = NeighborLoader(data, num_neighbors=[25, 10],
                        batch_size=1024, input_nodes=train_idx)
class SAGE(torch.nn.Module):
    def __init__(self, d):
        super().__init__()
        self.c1, self.c2 = SAGEConv(d, 256), SAGEConv(256, 128)
    def forward(self, x, edge_index):
        return self.c2(torch.relu(self.c1(x, edge_index)), edge_index)
# 推理新节点：只需取其邻居子图前向一次，无需重训
\`\`\`

实际案例：Pinterest PinSage 是 GraphSAGE 工业标杆——30 亿节点 180 亿边，邻居采样+MapReduce 批量生成 embedding，线上 A/B 相关 pin 点击 +25%；某支付风控用 GraphSAGE 对新注册账户即时产出风险 embedding（GCN 做不到新节点零重训），欺诈拦截时效从 T+1 到分钟级。

踩坑与 tradeoff：采样引入方差——k 太小（如 5）训练不稳，k 太大失去省算力意义，常用 25/10 或 10/10；邻居数指数膨胀（k₁×k₂=250 个二跳节点）在 hub 节点上仍会爆，重要性采样/历史嵌入缓存（VR-GCN、GraphFM）可缓解；mean 聚合对高度节点友好但对稀疏节点噪声大；LSTM 聚合器理论上违反置换不变，靠随机打乱硬学，实践中常不如 mean 稳；无监督训练用"邻居应相近"的对比损失（random walk 共现），有标签时直接任务损失即可，别硬套原论文。`,
    keyPoints: ["学聚合函数而非传播矩阵 ⇒ 新节点零重训（归纳式）", "固定邻居采样把单节点算力压到 O(1)，大图可 mini-batch", "自身与邻域表示 concat 解耦，比 GCN 绑定加权更灵活"],
    followUps: ["邻居采样的方差怎么控制？VR-GCN 的思路？", "PinSage 的重要性采样（random walk 计数）相比均匀采样好在哪？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-317",
    nodeId: "ai-gnn",
    question: "GAT 图注意力网络原理？相比 GCN 的优势与代价？",
    answer: `结论：GAT 把 Transformer 的注意力搬到图上：邻居聚合权重不再由度归一化固定（GCN），而是由内容可学习地计算。对每条边 (v,u)：e_vu = LeakyReLU(aᵀ[Wh_v || Wh_u])，再对邻居做 softmax 得注意力系数 α_vu，更新 h_v' = σ(Σ α_vu Wh_u)。多头：K 个独立注意力头，中间层 concat、输出层平均。优势：①权重内容自适应——噪声邻居（误连边、羊毛党混入的正常设备）自动降权，GCN 只能按度均摊；②自环与邻居权重自然解耦（自己也是注意力候选）；③注意力系数可解释，风控场景能审计"模型看了哪些关联账户"；④归纳式成立（注意力函数对任意子图可算）。代价：每条边都要算注意力，计算/显存开销约为 GCN 2-3 倍，边数亿级时训练成本高。

\`\`\`python
from torch_geometric.nn import GATConv
class GAT(torch.nn.Module):
    def __init__(self, in_dim, hid, out_dim, heads=8):
        super().__init__()
        self.c1 = GATConv(in_dim, hid, heads=heads)             # concat → hid*8
        self.c2 = GATConv(hid*heads, out_dim, heads=1, concat=False)
    def forward(self, x, edge_index):
        x = torch.elu(self.c1(x, edge_index))
        return self.c2(x, edge_index)
# 取注意力权重做可解释审计
out, (ei, alpha) = self.c1(x, edge_index, return_attention_weights=True)
\`\`\`

实际案例：某支付风控把 GCN 换成 GAT，误连的家庭宽带 IP 不再污染正常用户表示，团伙召回率 +8%，且注意力权重直接进了风控审计报告；学术引用网络节点分类 GAT 比 GCN 高 1.5 个点；分子性质预测中注意力能定位关键化学键。

踩坑与 tradeoff：注意力不是免费的——图大边密时 e_vu 计算成为瓶颈，Sparse 实现（PyG 的 GATConv）必须配合邻居采样；注意力容易"注意力坍缩"（所有头学出相似分布），多头+不同初始化缓解；图上注意力是局部 softmax，邻居数量级差大时（3 vs 3000 邻居）系数不可比；GAT 对特征质量更敏感——邻居特征噪声大时注意力学不出区分度，反而不如 GCN 的固定归一化稳；后续 GATv2 指出原 GAT 的 aᵀ[Wx||Wy] 其实是"静态注意力"（排序与 query 无关），修正为 aᵀLeakyReLU(W[x||y]) 才是真正的动态注意力。`,
    keyPoints: ["边权重由内容注意力学习，替代 GCN 固定度归一化", "抗噪邻居+可解释+归纳式，代价是 2-3 倍边计算", "GATv2：原版是静态注意力，动态版更表达"],
    followUps: ["图 Transformer（全局注意力）与 GAT 局部注意力的取舍？", "注意力系数如何做风控审计落地？"],
    favorited: false,
  },
  {
    id: "ai-318",
    nodeId: "ai-gnn",
    question: "大规模图训练怎么做？邻居采样、ClusterGCN、GraphSAINT 对比？",
    answer: `结论：全图训练（GCN 原版）显存随节点数线性涨、单步要扫全图，亿级节点根本放不进 GPU。三条主流路线：①邻居采样（GraphSAGE 系）：以目标节点为根按层采样 k 个邻居构成小计算图，mini-batch 训练——优点是归纳式天然支持，缺点是层数深时邻居数指数膨胀（25×10=250 个二跳），hub 节点依旧爆炸；②图聚类（ClusterGCN）：先用 METIS 把图切成稠密子图块，每 batch 只在块内训练——块内边密度高所以近似误差小，复杂度 O(块大小)，但切图破坏跨块边（结构信息有损）；③子图采样（GraphSAINT）：不采邻居而采子图（按节点/边/random walk 采样器），在采出子图上做全量 GCN，并用归一化系数校正采样偏差——层间不再指数膨胀，方差可控。工业再加两板斧：特征与图结构分离存储（特征放 CPU/分布式 KV，采样后按 id gather）、历史嵌入缓存（GAS/VR-GCN 用上一 epoch 的旧嵌入代替实时聚合，省 80% 计算）。

\`\`\`python
from torch_geometric.loader import NeighborLoader, GraphSAINTRandomWalkSampler
# 路线 1：邻居采样（最常用）
nbr_loader = NeighborLoader(data, num_neighbors=[15, 10], batch_size=512)
# 路线 3：GraphSAINT 子图采样
saint_loader = GraphSAINTRandomWalkSampler(data, batch_size=2048,
                                           walk_length=3, num_steps=5)
for batch in saint_loader:   # batch 自带 node_norm/edge_norm 校正系数
    out = model(batch.x, batch.edge_index)
    loss = F.cross_entropy(out[batch.train_mask], batch.y[batch.train_mask],
                           reduction="none") * batch.node_norm[batch.train_mask]
\`\`\`

实际案例：PinSage（30 亿节点）= 邻居采样 + random walk 重要性采样 + MapReduce 离线推理；微信看一看用异构大图+邻居采样训练，十亿级边日更；某银行风控用 GraphSAINT 在 2 亿节点关联图上训练，相比全图 GCN 显存从 800GB 压到 40GB，欺诈召回持平。

踩坑与 tradeoff：采样方差与效率的权衡——k 太小 loss 抖动大（尤其稀疏标签），用重要性采样（按度或 random walk 频率）降方差；ClusterGCN 的跨块边丢失对社区结构强的图伤害大，可把块间边按概率回填（ClusterGCN 的多簇合并）；历史嵌入缓存引入 staleness，缓存超过 1 个 epoch 精度掉得快，需混入一定比例实时聚合；分布式训练时图切分要按边均衡而非节点均衡（度分布幂律，按节点切会负载倾斜）；评估时要全邻居精确推理（不能再采样），离线批量推理用"逐层全图聚合"避免邻居爆炸。`,
    keyPoints: ["邻居采样简单但深层指数膨胀，GraphSAINT 采子图+偏差校正", "ClusterGCN 切稠密块省显存，牺牲跨块边", "工业组合拳：特征外存+历史嵌入缓存+离线逐层推理"],
    followUps: ["历史嵌入缓存（GAS）的一致性如何保证？", "为什么评估阶段要全邻居精确推理而不是继续采样？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-319",
    nodeId: "ai-gnn",
    question: "异构图与知识图谱嵌入怎么做？R-GCN 与 TransE 系列？",
    answer: `结论：同构图假设只有一种节点一种边，现实业务全是异构：电商图有用户/商品/店铺节点和点击/购买/收藏边。两种建模范式：①异构 GNN——R-GCN 按关系类型各学一套变换矩阵，聚合时按边类型分别变换再求和：h_v' = Σ_r Σ_{u∈N_r(v)} (1/c) W_r h_u + W_0 h_v；参数量随关系数爆炸，用基分解（basis decomposition：W_r = Σ a_rb V_b 共享基矩阵）或块对角分解压缩；HAN 用"元路径"（如 用户-购买-商品-被购买-用户）把异构转同构子图再分层注意力。②知识图谱嵌入（KGE）——不做消息传递，直接给每个实体/关系学向量，用打分函数衡量三元组 (h,r,t) 合理性：TransE 要求 h+r≈t（关系=平移）；DistMult 双线性打分 h∘r·t（只能建模对称关系）；ComplEx 复数扩展解决非对称；RotatE 把关系建模为复数空间旋转，能同时处理对称/反对称/逆关系/组合关系，是工业常用默认。

\`\`\`python
import torch
# TransE 打分：距离越小越合理
def transe_score(h, r, t):
    return -torch.norm(h + r - t, p=1, dim=-1)
# 负采样对比损失（KG 训练标准做法）
pos = transe_score(h, r, t)                    # 真实三元组
neg = transe_score(h_neg, r, t)                # 头实体替换的负样本
loss = -torch.logsigmoid(pos).mean() - torch.logsigmoid(-neg).mean()
# R-GCN：PyG 一行
from torch_geometric.nn import RGCNConv
conv = RGCNConv(in_dim, out_dim, num_relations=6, num_bases=4)  # 基分解压缩参数
\`\`\`

实际案例：阿里电商知识图谱（商品-类目-品牌-属性三元组十亿级）用 KGE 生成实体向量喂推荐召回，新品冷启动曝光 +15%；美团大脑用 RotatE 做商户-菜品-场景关联，搜索相关性 NDCG +3%；某金融反洗钱团队用 R-GCN 在账户-交易异构图上识别洗钱路径，可疑交易召回 +22%。

踩坑与 tradeoff：关系数上千时 R-GCN 基分解的基数量是敏感超参（太少欠拟合，太多过拟合），通常 4-8 起步调；TransE 处理不了 1-N/N-1/N-N 关系（h+r≈t 会让多个尾实体挤成同一点），这类关系必须 RotatE/ComplEx；元路径需要领域专家设计，选错元路径（如把"用户-同为粉丝-用户"用在兴趣建模）引入噪声；KGE 只做链接预测/实体表示，不利用节点丰富特征（用户画像），工业上常 KGE 向量当初始化再喂 GNN 精调；知识图谱 schema 漂移（新增关系类型）要支持增量训练，全量重训十亿三元组成本高。`,
    keyPoints: ["R-GCN 按关系分变换+基分解压参数，HAN 走元路径", "RotatE 复数旋转统一对称/反对称/逆/组合关系", "KGE 与 GNN 互补：KGE 出结构向量，GNN 融节点特征"],
    followUps: ["基分解为什么能防 R-GCN 过拟合？", "RotatE 如何同时建模对称与反对称关系？"],
    favorited: false,
  },
  {
    id: "ai-320",
    nodeId: "ai-gnn",
    question: "GNN 过平滑（oversmoothing）是什么？为什么层数做不深，如何缓解？",
    answer: `结论：过平滑指 GNN 层数加深后所有节点表示趋于相同、下游任务精度反而下降的现象。机理：每层消息传递本质是邻域上的扩散/低通滤波——对称归一化传播矩阵 P=D̂^(-1/2)ÃD̂^(-1/2) 的最大特征值为 1，反复乘 P 会把节点信号推向 P 的主特征向量方向（与度 √d 成比例的"平滑信号"），节点间差异（高频分量）被指数级抹平；数学上 k 层后任意两节点表示距离以 λ₂ᵏ 速率衰减（λ₂ 是 P 的次大特征值），图越连通（λ₂ 越大）塌缩越快。这和 CNN 能堆 100 层形成鲜明对比——CNN 的卷积核逐层学新变换，GCN 的传播矩阵每层固定，深度只放大平滑。缓解手段：①残差/跳跃连接（JK-Net：每层输出 concat 到最后，浅层局部信息不衰减）；②DropEdge 训练时随机删边，既是正则又打断图连通性（λ₂ 变小）；③归一化层（PairNorm 保持节点对间距离，LayerNorm 也常用）；④降低层数+扩大单层感受野（用大聚合半径替代深层堆叠）；⑤初始残差（GCNII：每层显式混入 h⁽⁰⁾）——GCNII 是少数能稳定做到 32/64 层的方案。

\`\`\`python
# 经验验证：节点表示两两距离随层数塌缩
def pair_dist(x):
    return torch.pdist(F.normalize(x, dim=-1)).mean()
x = data.x
for k in range(8):
    x = torch.relu(gcn_layer(x, A, W[k]))
    print(k, pair_dist(x).item())   # 距离单调下降 → 过平滑
# 缓解：初始残差（GCNII 思想），每层混回输入
x = alpha * x0 + (1 - alpha) * propagate(x)
\`\`\`

实际案例：Cora 上 GCN 层数从 2 加到 8，准确率从 81% 掉到 70% 以下——教科书级过平滑曲线；某社交推荐团队盲目堆 6 层 GraphSAGE 导致所有用户 embedding 余弦相似度 0.99+，推荐结果千人一面，改 JK 连接+3 层后多样性指标恢复。

踩坑与 tradeoff：过平滑≠过拟合——训练 loss 也在涨，是结构性塌缩不是记忆噪声；缓解手段多为"保浅层信息"，代价是深层变换能力被稀释（GCNII 的 64 层增益在非连部结构任务上也就 1-2 个点）；DropEdge 在稀疏图上可能切断关键路径（小图的桥边），drop rate 别超 0.3；批归一化类方法对节点分类有效，图分类任务收益不一致；实务口诀：先 2-4 层把 pipeline 跑通，过平滑是"想堆深"时才需要面对的问题，多数工业图 2 跳信息已够。`,
    keyPoints: ["固定传播矩阵反复低通滤波，节点表示指数级趋同", "λ₂（次大特征值）决定塌缩速率，图越连通塌越快", "JK 残差/DropEdge/GCNII 初始残差是三大缓解法"],
    followUps: ["PairNorm 为什么能保持节点间距离？", "为什么 CNN 能堆百层而 GCN 不行？本质差异在哪？"],
    favorited: false,
  },
  {
    id: "ai-321",
    nodeId: "ai-gnn",
    question: "GNN 在风控团伙挖掘与推荐图召回中如何落地？",
    answer: `结论：两个最值钱的 GNN 工业场景。风控团伙挖掘：欺诈是"群体性作案"——黑产共享设备/WiFi/收款卡/收货地址，单点特征（某账户行为）看不出异常，图上却形成稠密可疑子图。落地范式：建异构图（账户-设备-银行卡-手机号-地址，边=登录/绑定/转账）→ GNN（R-GCN 或 GAT，边类型区分关系）学节点表示 → 下游两用：节点分类判单个账户欺诈概率、社区发现（Louvain/连通分量+embedding 聚类）挖团伙整体。关键设计：高度节点（公共 WiFi、公司 NAT）会制造虚假稠密，要按"稀有度"给边加权或过滤；团伙演化快，图要小时级增量更新。推荐图召回：用户-物品二部图上跑 GNN，聚合多跳共现信号（user→item→user→item），产出 embedding 做向量近邻召回——比 ItemCF 多走了高跳路径，比双塔多了结构信息；PinSage（Pin 图）、阿里 EGES（商品图+side information 补冷启动）是标杆。

\`\`\`python
# 风控：异构图 + 边稀有度过滤 + R-GCN 节点分类
edges = [e for e in raw_edges if rarity(e) > 0.01]  # 滤公共 WiFi 等虚假稠密
h = rgcn(x, edge_index, edge_type)                   # (账户数, 128)
fraud_prob = classifier(h[account_nodes])
# 团伙挖掘：高欺诈分账户子图上跑连通分量
gangs = connected_components(subgraph(high_risk_nodes))
# 推荐：二部图 GraphSAGE 无监督训练（共现边对比损失）
loss = -log_sigmoid((z_u * z_i).sum()) - log_sigmoid(-(z_u * z_neg).sum())
\`\`\`

实际案例：某支付平台上线图风控后，团伙欺诈（养号+集中提现）召回率从 61% 提到 89%，单月止损数千万；Pinterest PinSage 召回相关 pin，首页点击 +25%；某短视频用用户-视频二部图 GNN 召回补充双塔，长尾视频曝光占比 +12%（双塔对冷门视频 embedding 学不好，图上靠邻居救回来）。

踩坑与 tradeoff：图构建比模型重要——边定义错（如把"同 IP 段"当强关联）满图假稠密，模型直接学废；风控标签极少（万分之一），要用 PU learning 或把规则命中当弱标签；GNN 给召回的增益常不如特征工程（EGES 论文自己都承认 side information 贡献大于图结构），先确认双塔/ItemCF 已榨干再上 GNN；线上 serving 需要离线批量算好 embedding 灌入向量库，实时子图推理成本高（毫秒级预算放不下 2 跳聚合）；对抗性强——黑产会故意连接正常账户"洗图"，需要鲁棒聚合（中位数聚合/注意力降权）。`,
    keyPoints: ["风控靠图：团伙=稠密可疑子图，高度节点要稀有度加权", "推荐图召回=高跳共现+结构信息，补双塔长尾短板", "图构建质量>模型选型，先榨干简单基线再上 GNN"],
    followUps: ["PU learning 如何处理风控『只有正样本和未标注』问题？", "EGES 的 side information 加权聚合怎么设计？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 34. ai-diffusion-advanced =====
  {
    id: "ai-322",
    nodeId: "ai-diffusion-advanced",
    question: "DDPM 为什么训练时预测噪声 ε 而不是直接预测原图 x₀？",
    answer: `结论：DDPM 的 ELBO 展开后，每一步反向过程的最优解是让模型预测"前向加噪时混入的那个噪声"——重参数化后训练目标可写成 ||ε - ε_θ(x_t, t)||²，就是一句话：随机取时间步 t、给 x₀ 加标准高斯噪声得到 x_t、让网络猜这个噪声。为什么预测 ε 优于预测 x₀：①信号信噪比——直接预测 x₀ 在 t 大（噪声强）时输入几乎纯噪声，目标 x₀ 与输入相关性极低，学习信号弱且输出方差大；而 ε 与输入 x_t 始终有明确统计关系（x_t = ᾱ_t x₀ + √(1-ᾱ_t) ε），残差学习更稳。②与 score function 的联系：预测 ε 等价于估计 ∇log p(x_t)（score matching 的尺度变换版本），理论更干净。③实验事实：DDPM 论文消融显示预测 x₀ 样本质量明显差于预测 ε，且预测 x₀ 需要额外处理方差项。后续的 v-prediction（预测 ᾱ_t ε - √(1-ᾱ_t) x₀ 的组合）在高分辨率生成（SDXL/SD3 采用）进一步稳定训练，因为它在 t 两端都不退化。

\`\`\`python
import torch
# DDPM 训练一步（极简版）
t = torch.randint(0, T, (B,))
eps = torch.randn_like(x0)
x_t = sqrt_alpha_bar[t] * x0 + sqrt_one_minus_alpha_bar[t] * eps
eps_pred = unet(x_t, t, context=text_emb)   # 网络猜噪声
loss = F.mse_loss(eps_pred, eps)            # 就这一行，不用真算 ELBO
# v-prediction 变体
v_target = sqrt_alpha_bar[t] * eps - sqrt_one_minus_alpha_bar[t] * x0
\`\`\`

实际案例：Stable Diffusion 全系用 ε-prediction 在 latent 空间训练；SDXL/Stable Diffusion 3 的高分辨率阶段切 v-prediction，大分辨率伪影明显减少；某图像生成团队在 1024px 训练从 ε 切 v 后，FID 从 11.2 降到 8.7。

踩坑与 tradeoff：ε-prediction 在 t→0 时输入几乎就是 x₀，网络学"从干净图猜微量噪声"意义不大，采样末端细节差——用 v-prediction 或对低 t 加权（loss weighting）缓解；信噪比加权（Min-SNR，权重= min(SNR,5)/SNR）把大 t 步的 loss 压小，收敛快 2-3 倍，是近年标配；别混淆训练目标与采样器：训练预测 ε，采样器（DDIM/Euler/DPM++）决定怎么用这个预测走回去，两者正交可自由组合。`,
    keyPoints: ["预测 ε=重参数化的 ELBO 简化，训练就一行 MSE", "预测 x₀ 在高噪声段信号弱，ε-prediction 全程稳定", "v-prediction+Min-SNR 加权是高分辨率标配"],
    followUps: ["Min-SNR 加权为什么能加速收敛？", "score matching 与 ε-prediction 的等价推导？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-323",
    nodeId: "ai-diffusion-advanced",
    question: "DDIM 原理？为什么能把 1000 步采样压缩到 50 步？",
    answer: `结论：DDPM 的反向过程是马尔可夫链：x_{t-1} 只能依赖 x_t，每一步都加随机噪声，必须小步走（1000 步），且轨迹随机不可复现。DDIM 的关键观察：DDPM 的训练目标只约束边缘分布 q(x_t|x₀)，并不约束联合分布——于是可以构造一族非马尔可夫前向过程，其边缘分布与 DDPM 完全相同（模型不用重训！），但反向过程变成确定性的隐式映射：x_{t-1} = ᾱ_{t-1}·x̂₀(x_t) + √(1-ᾱ_{t-1}-σ_t²)·ε_θ(x_t) + σ_t·z，其中 x̂₀ 是由 ε_θ 反推出的干净图。σ_t=0 时完全确定（ODE 极限），采样步长可以任意跳：把 1000 步的时间轴均匀抽 50 个点照样走，因为每步不再依赖"小步马尔可夫近似"。η 参数（0=确定 DDIM，1=退回 DDPM）在质量与多样性间调。数学本质：DDIM 是扩散 ODE（probability flow ODE）的一阶离散化——这解释了为什么确定性、可逆（能从图走回噪声做编辑）。

\`\`\`python
# DDIM 采样一步（η=0 完全确定）
x0_pred = (x_t - sqrt(1-ab_t) * eps_pred) / sqrt(ab_t)   # 反推干净图
x_prev = sqrt(ab_prev) * x0_pred + sqrt(1-ab_prev) * eps_pred  # 无随机项
# diffusers 一行
from diffusers import DDIMScheduler
pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
image = pipe(prompt, num_inference_steps=50).images[0]
\`\`\`

实际案例：Stable Diffusion 生态早期标配 50 步 DDIM，把出图从秒级×10 压到亚秒级；图像编辑（DDIM inversion：真实照片反演到噪声再按新 prompt 走回）是 Null-text inversion/Prompt-to-Prompt 等编辑方法的地基；某设计工具用 DDIM inversion 做"保留构图换风格"，付费转化率 +18%。

踩坑与 tradeoff：步数砍太狠（<20）细节崩——一阶离散化误差累积，要换高阶求解器（DPM-Solver++、UniPC，20 步质量媲美 50 步 DDIM）；CFG 强度大时 DDIM inversion 误差被放大（每步外推偏差），编辑任务要控制 guidance≈1 或用 null-text 优化补偿；η=0 牺牲了随机多样性——同一噪声种子只出一个结果，创意场景要保留一点 η；DDIM 不是唯一快采样路线：蒸馏（4 步 LCM/Turbo）、Consistency Model、Rectified Flow 直线路径是更激进的方向，选型看"步数预算 vs 训练成本"。`,
    keyPoints: ["训练只约束边缘分布 ⇒ 可构造非马尔可夫确定性反向", "DDIM=扩散 ODE 一阶离散化，确定可逆支撑图像编辑", "η 调随机性，<20 步需换高阶求解器"],
    followUps: ["DDIM inversion 的误差从哪来？Null-text inversion 怎么补？", "DPM-Solver++ 为什么 20 步能追平 50 步 DDIM？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-324",
    nodeId: "ai-diffusion-advanced",
    question: "Classifier-Free Guidance（CFG）原理？guidance scale 如何权衡质量与多样性？",
    answer: `结论：条件生成要的是 p(x|text)，但扩散模型学的是 p(x|text) 的 score——classifier guidance（早期方案）额外训一个噪声鲁棒的分类器，用其梯度 ∇log p(text|x_t) 引导采样，多训一个模型且分类器梯度在高噪声段不可靠。CFG 的巧思：贝叶斯 p(text|x) ∝ p(x|text)/p(x)，取对数求梯度得 ∇log p(text|x_t) = ∇log p(x_t|text) - ∇log p(x_t)——分类器梯度=条件 score 减无条件 score，而这两个 score 同一个网络就能给：训练时以一定概率（10-20%）把文本条件随机置空（drop），同一个 U-Net 既能算 ε(x_t, text) 又能算 ε(x_t, ∅)。采样时外推：ε̂ = ε_uncond + w·(ε_cond - ε_uncond)，w 即 guidance scale。几何直觉：沿"条件方向"超调，w>1 时实际上在采样一个尖化分布 p(x|text)^w·p(x)^(1-w)——文本对齐度上升、分布方差收缩、多样性下降。

\`\`\`python
# CFG 训练：随机丢条件
cond = text_emb if torch.rand(1) > 0.1 else null_emb
loss = F.mse_loss(unet(x_t, t, cond), eps)
# CFG 采样：双路前向外推（可 batch 合并成一次）
eps_u, eps_c = unet(x_t, t, null_emb), unet(x_t, t, text_emb)
eps = eps_u + guidance_scale * (eps_c - eps_u)   # w=7.5 是 SD 默认
\`\`\`

实际案例：Stable Diffusion 默认 w=7.5 是"质量-多样性"甜区；Midjourney 类强风格产品 w 更高（10+）保证提示词强服从；某电商素材生成平台发现 w>12 时商品边缘出现饱和伪影（颜色过饱和、纹理炸），用 dynamic thresholding（每步把 x̂₀ 高分位截断）消除后，素材可用率从 82% 提到 96%。

踩坑与 tradeoff：w 不是越大越好——w 过大导致过饱和/对比度失真/构图僵化（分布被过度尖化），w=1 退化为纯条件采样；CFG 让每步计算翻倍（条件+无条件两次前向），推理成本敏感的端侧用蒸馏（SDXL-Turbo 把 CFG 蒸进单模型）；有限区间问题：ε̂ 外推可能把 x̂₀ 推出 [-1,1] 合法像素域，dynamic thresholding 或 rescale（CFG++ 的改进）是工程刚需；DDIM inversion 与高 w 不兼容（外推破坏可逆性）；现代替代：Autoguidance（用差模型自己做引导）、APG（限制外推方向）在 2025-2026 新模型中逐步替代裸 CFG。`,
    keyPoints: ["贝叶斯分解：分类器梯度=条件score-无条件score，一模型两路", "w 外推尖化分布：文本对齐↑多样性↓，7.5 是经典甜区", "w 过大过饱和，dynamic thresholding/rescale 是工程标配"],
    followUps: ["CFG 为什么让 DDIM inversion 失效？", "Autoguidance 相比 CFG 的改进点？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-325",
    nodeId: "ai-diffusion-advanced",
    question: "Noise schedule 如何设计？linear 与 cosine 有何影响？",
    answer: `结论：noise schedule β_t（或等价的信噪比 SNR(t)=ᾱ_t/(1-ᾱ_t)）决定加噪节奏，直接塑造模型"在哪些噪声水平上花容量"。DDPM 原版 linear schedule：β 从 1e-4 线性涨到 0.02——在 64×64 小图上工作良好，但 Improved DDPM 指出其缺陷：linear 在 t 末端加噪过快，序列还没充分破坏 ᾱ_t 就≈0（信息在 t≈700 已毁完），末端 300 步几乎纯噪声，浪费训练容量且采样末端质量差。cosine schedule（Nichol & Dhariwal）：ᾱ_t = cos²((t/T+s)/(1+s)·π/2)，加噪前慢后快，中段 SNR 变化均匀，小偏移 s=0.008 防 t=0 处 β 过小数值不稳——ImageNet 上 FID 显著优于 linear，成为后续标配。更本质视角（EDM/Karras）：schedule 的选择=在 log-SNR 轴上分配训练密度，连续时间下一切 schedule 都是 σ(t) 的参数化，Karras 给出 ρ=7 的幂律 schedule 把密度集中在"感知最敏感"的中等噪声段。

\`\`\`python
import numpy as np
def cosine_alpha_bar(t, T=1000, s=0.008):
    f = np.cos(((t/T + s) / (1+s)) * np.pi/2) ** 2
    return f / f[0]                     # 归一化使 ᾱ_0=1
def linear_beta(t, T=1000):
    return 1e-4 + (0.02-1e-4) * t/T
# 对比末端：linear 的 ᾱ_999≈0.005，cosine 更平缓
# diffusers 切换
from diffusers import DDPMScheduler
sched = DDPMScheduler(beta_schedule="squaredcos_cap_v2")
\`\`\`

实际案例：Improved DDPM 用 cosine schedule 把 ImageNet 64×64 FID 从 26 打到 12；Stable Diffusion 训练用 scaled_linear（linear 的平方缩放版），社区微调实验切 cosine 后细节质感可感知提升；某视频生成团队按 EDM 思路自定义 log-normal 密度 schedule，把训练容量集中到人物面部关键噪声段，人脸崩坏率降 40%。

踩坑与 tradeoff：schedule 与分辨率强耦合——1024px 图的有效信息在更高噪声段才被破坏，直接套 64px 的 schedule 高分辨率训练浪费严重（SDXL 用 v-prediction+多分辨率训练部分缓解）；schedule 决定 loss 在各 t 的分布，和 loss weighting（Min-SNR）是同一枚硬币两面，别两边都猛调；采样器 schedule（推理时选哪些 t 子序列）与训练 schedule 是两个东西，Karras/uniform/logSNR 推理步各有拥趸；改 schedule 必须重训（ε_θ 的 t 条件分布变了），线上模型迭代成本极高——新项目起步直接 cosine/Karras 别踩 linear 的坑。`,
    keyPoints: ["linear 末端加噪过快浪费容量，cosine 中段均匀成标配", "现代视角：schedule=log-SNR 轴上的训练密度分配", "schedule 与分辨率/loss 加权耦合，改动需重训"],
    followUps: ["EDM 的 ρ=7 Karras schedule 推导思路？", "为什么高分辨率需要向高噪声段偏移 schedule？"],
    favorited: false,
  },
  {
    id: "ai-326",
    nodeId: "ai-diffusion-advanced",
    question: "Score matching 与 SDE 统一视角？DDPM 与 Score SDE 是什么关系？",
    answer: `结论：Song & Ermon 的 Score SDE 论文把两条线统一：扩散模型与 score-based 模型是同一过程离散化 vs 连续化的两面。核心对象：前向 SDE dx = f(x,t)dt + g(t)dw 把数据连续推向噪声（VE-SDE 对应 SMLD，VP-SDE 对应 DDPM——DDPM 就是 VP-SDE 在 t∈{0..1000} 的离散采样）；Anderson 定理给出反向 SDE dx = [f - g²∇log p_t(x)]dt + g dw，唯一未知量是 score ∇log p_t(x)——训练目标就是 score matching：min E||s_θ(x_t,t) - ∇log p_t(x_t|x₀)||²，而 ∇log p_t(x_t|x₀) = -ε/√(1-ᾱ_t)，所以 score matching 与 DDPM 的 ε-prediction 只差一个噪声尺度的常数因子——同一目标两种参数化。统一视角的红利：①probability flow ODE——与反向 SDE 共享边缘分布的确定性 ODE，DDIM 就是其离散化，引出所有快速求解器（DPM-Solver/UniPC 本质都是 ODE 高阶求解）；②SDEdit/反演编辑有了连续极限的理论语言；③噪声尺度统一后可以在任意 σ 上采样（EDM 框架）。

\`\`\`python
# 三种参数化的换算（VP 情形）
# score  = -eps / sigma_t
# eps    = -sigma_t * score
# x0_hat = (x_t + sigma_t**2 * score) / alpha_t   # Tweedie 公式
def to_x0(x_t, score, alpha_t, sigma_t):
    return (x_t + sigma_t**2 * score) / alpha_t
# Probability Flow ODE（无随机项）：dx/dt = f(x,t) - 0.5*g(t)**2 * score
def pf_ode_step(x, t, dt):
    return x + dt * (f(x, t) - 0.5 * g(t)**2 * s_theta(x, t))
\`\`\`

实际案例：DPM-Solver 系列直接站在 ODE 视角推导 2/3 阶求解器，10-20 步达到 100 步 DDIM 质量，已是 diffusers 默认推荐；EDM（Karras 2022）用统一框架重调预条件与 schedule，ImageNet FID 1.36 刷新纪录；某音乐生成团队用 VP-SDE 连续框架做音频超分（低采样率音频当"加噪版本"），一个模型覆盖 8k→48k 全部倍率。

踩坑与 tradeoff：score 参数化与 ε 参数化数值范围不同（score 随 σ→0 发散），混用框架换算错一个 σ 因子全盘皆输——面试手写换算公式是高频考点；VE/VP/sub-VP 三种 SDE 的噪声几何不同，VE 末端 σ 巨大（~100）数值范围考验精度，VP 有界更工程友好；ODE 视角下"采样器竞赛"本质是数值方法竞赛，步数预算 <10 时离散化误差主导，模型再好也救不回来——这是蒸馏/Consistency Model 路线的存在理由；理论上 SDE 采样比 ODE 多点"纠错随机性"，极低步数时 ODE 反而更准，中等步数 SDE 多样性更好。`,
    keyPoints: ["DDPM=VP-SDE 离散化，ε-prediction 与 score 只差 σ 因子", "Anderson 反向 SDE 唯一未知量是 score", "Probability Flow ODE 统一解释 DDIM 与所有快速求解器"],
    followUps: ["Tweedie 公式如何从 score 一步估计 x₀？", "VE 与 VP 噪声几何差异对工程的影响？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-327",
    nodeId: "ai-diffusion-advanced",
    question: "DiT（Diffusion Transformer）架构？为什么 Transformer 正在取代 U-Net？",
    answer: `结论：DiT（Peebles & Xie，2023）把扩散模型的 backbone 从 U-Net 换成标准 ViT：图像切 patch → 加位置编码 → 过 N 层 Transformer block，条件信息（时间步 t、文本/类别）通过 adaLN-Zero 注入——把 LayerNorm 的 scale/shift 参数用条件向量回归出来，且每 block 的调制参数初始化为零（训练起点等价恒等映射，稳定性关键）。取代 U-Net 的三个理由：①可扩展性——DiT 论文核心发现是 FID 随模型 GFLOPs 平滑下降（ scaling law 在生成模型上首次清晰成立），U-Net 堆容量收益递减而 Transformer 线性吃到红利；②统一性——文本/图像/视频/3D 都能 patch 化成 token 序列，一个架构吃所有模态（Sora、SD3、可灵全是 DiT 变体），U-Net 的 2D 卷积归纳偏置反而成枷锁；③全局依赖——自注意力天然建模长程结构（整体构图、人物对称），U-Net 靠小卷积核堆感受野效率低。代价：注意力 O(n²) 在高分辨率 token 数爆炸，要窗口注意力/稀疏化/先在 latent 空间降维。

\`\`\`python
import torch.nn as nn
class DiTBlock(nn.Module):
    def __init__(self, dim, cond_dim, heads=16):
        super().__init__()
        self.norm1, self.attn = nn.LayerNorm(dim, elementwise_affine=False), MHA(dim, heads)
        self.norm2, self.mlp = nn.LayerNorm(dim, elementwise_affine=False), MLP(dim)
        self.adaLN = nn.Linear(cond_dim, 6*dim)      # scale/shift/gate ×2
        nn.init.zeros_(self.adaLN.weight); nn.init.zeros_(self.adaLN.bias)  # Zero 初始化
    def forward(self, x, c):
        s1, b1, g1, s2, b2, g2 = self.adaLN(c).chunk(6, dim=-1)
        x = x + g1 * self.attn(self.norm1(x)*(1+s1) + b1)
        return x + g2 * self.mlp(self.norm2(x)*(1+s2) + b2)
\`\`\`

实际案例：Sora 用时空 patch 的 DiT 做视频生成；Stable Diffusion 3 用 MMDiT（文本图像双流 DiT）取代 SD1.5/SDXL 的 U-Net，文字渲染和构图能力跃升；PixArt-α 证明 DiT 训练成本可压到 SD1.5 的 1%（高效数据+T5 条件），某设计 SaaS 基于 PixArt 微调，海报生成质量追平 Midjourney V5 而成本自可控。

踩坑与 tradeoff：DiT 吃数据吃算力——同参数量下小规模数据 U-Net 反而更稳（卷积归纳偏置=免费先验），数据 <百万级慎切；adaLN 比 cross-attention 省参数但条件表达弱，文本条件强的模型（SD3）用双流+joint attention；patch size 是质量-成本旋钮（16→8 质量升算力 4 倍）；Transformer 缺多尺度结构，靠 VAE latent 压缩（8×）和 patch 层级弥补；训练初期 adaLN-Zero 让梯度过小收敛慢，warmup 和 lr 要比 U-Net 更激进；U-Net 并未死——音频扩散、小模型端侧仍是 U-Net 天下。`,
    keyPoints: ["DiT=ViT+adaLN-Zero 条件注入，FID 随算力平滑 scaling", "统一 token 序列吃图像/视频/3D，Sora/SD3 皆 DiT", "数据少时 U-Net 归纳偏置仍是优势，别盲目换"],
    followUps: ["adaLN-Zero 的零初始化为什么稳定训练？", "SD3 的 MMDiT 双流结构与传统 cross-attention 差异？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-328",
    nodeId: "ai-diffusion-advanced",
    question: "Flow Matching / Rectified Flow 原理？相比 DDPM 有什么优势？",
    answer: `结论：Flow Matching（Lipman 2023，Meta）把生成建模从"学反向扩散"换成"学速度场"：定义一条从噪声分布 π₁ 到数据分布 π₀ 的概率路径 p_t，训练网络回归沿路径的条件速度场 v_t(x)=dx/dt。最简实例 Rectified Flow：直接取噪声 x₁ 与数据 x₀ 的直线插值 x_t = (1-t)x₀ + t·x₁，真实速度恒定 v = x₁ - x₀（指向数据方向的匀速直线），训练目标一行 ||v_θ(x_t,t) - (x₁-x₀)||²。相比 DDPM 的优势：①路径直——DDPM 的概率流 ODE 轨迹弯弯曲曲（曲率大），大步长离散误差爆炸所以必须小步走；Rectified Flow 轨迹接近直线，直线可大步走不丢精度，采样 4-16 步质量即可打平 DDPM 50 步；②训练-采样对齐——Reflow 操作（用当前模型生成 (x₀,x₁) 配对再重训）迭代拉直轨迹，两轮 reflow 后 1-2 步可生成；③理论干净——直连最优传输（OT）条件，配对用 OT minibatch 进一步优化路径。SD3（MM-DiT+RF）、Flux、Stable Audio 全部转投 Flow Matching，2026 年已是图像/视频生成事实标准。

\`\`\`python
import torch
# Rectified Flow 训练（完整核心就这些）
t = torch.rand(B, 1, 1, 1)
x_t = (1 - t) * x0 + t * noise            # 直线插值
v_target = noise - x0                     # 恒定速度场
loss = F.mse_loss(model(x_t, t, cond), v_target)
# 采样：Euler 解 ODE，8 步即可
x = torch.randn_like(x0)
for t in torch.linspace(1, 0, 9)[:-1]:    # t: 1→0
    x = x - (1/8) * model(x, t.expand(B), cond)
\`\`\`

实际案例：Stable Diffusion 3 用 Rectified Flow + MM-DiT，官方消融显示同算力下 FID/CLIP 分全面优于 DDPM 版本；Flux.1（Black Forest Labs）全 RF 路线，8 步出图成行业标配；某视频生成团队从 DDPM 迁 RF 后，16 步采样质量追平原 50 步，推理成本降 65%；SD3.5 的 Turbo 版 reflow+蒸馏做到 4 步。

踩坑与 tradeoff：时间步采样分布敏感——均匀采 t 在中段（t≈0.5，插值最模糊区域）学习信号不足，logit-normal 采样（SD3 用）把密度压向中段，不采对 loss 曲线明显变差；RF 的"直线"只在一阶近似成立，paired reflow 数据本身有模型偏差，迭代 3 轮以上收益消失且多样性受损；与 CFG 组合时高 w 照样过饱和，老问题不消失；从 ε-prediction 存量模型迁移无捷径，必须重训；理论优雅不等于无条件更好——音频/分子等小规模数据上精调 DDPM 与 RF 差距常在噪声内。`,
    keyPoints: ["学速度场而非反向噪声，直线插值 v=x₁-x₀ 一行 loss", "轨迹直 ⇒ 大步长低误差，4-16 步打平 DDPM 50 步", "Reflow 迭代拉直轨迹，SD3/Flux 已成事实标准"],
    followUps: ["logit-normal 时间步采样为什么优于均匀采样？", "OT minibatch 配对如何进一步拉直路径？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-329",
    nodeId: "ai-diffusion-advanced",
    question: "视频生成模型（Sora 类）的架构要点？时空建模怎么做？",
    answer: `结论：视频=带时间轴的图像序列，难点在时序一致性（帧间不闪烁、物体不消失）与长序列算力。Sora 公开的技术路线要点：①时空 patch 化——视频先过时空 VAE（3D causal VAE，时间空间同时压缩，如 4×8×8）压成 latent 立方体，再切成 spacetime patches 展平成 token 序列喂 DiT——图像就是 T=1 的特例，所以同一架构原生混训图像和视频（混合训练还解决了视频数据不足）；②可变时长/分辨率/宽高比——patch 化天然支持任意 token 长度，训练时原生多分辨率，推理按需求切；③文本条件强——重标注（recaptioning，用 GPT-4V 给训练视频写详细描述，DALL·E 3 同款技术）解决视频-文本数据对齐差；④规模出涌现——足够算力下出现运镜连贯、物体恒存、简单物理交互的"世界模型"雏形。开源阵营（Open-Sora/可灵/混元视频）架构趋同：Causal 3D VAE + MM-DiT 双流 + Rectified Flow，时序靠 full attention（帧数短时）或时空分解注意力（空间 attn + 时间 attn 交替，省算力）。

\`\`\`python
# 时空分解注意力（省算力主流做法）
def st_attn_block(x):          # x: (B, T*H*W, D)
    x = rearrange(x, "b (t s) d -> (b t) s d", t=T)
    x = x + spatial_attn(x)    # 帧内空间注意力
    x = rearrange(x, "(b t) s d -> (b s) t d", t=T)
    x = x + temporal_attn(x)   # 帧间时间注意力（建模运动）
    return x
# 时空 VAE：时间维 causal 压缩（不用未来帧）
lat = causal_vae_3d.encode(video)   # (B, C, T/4, H/8, W/8)
\`\`\`

实际案例：可灵（快手）用 3D VAE+DiT 做到分钟级长视频，C端产品月活千万级；Sora 重标注管线后提示词遵循显著提升，60 秒长镜头一致性远超同期；某短视频平台用视频扩散做"图片动起来"特效，日生成量破亿，相比 GAN 时代时序闪烁投诉降 90%。

踩坑与 tradeoff：算力是真门槛——60 秒 24fps 视频 token 数十万，full attention 不可行，时空分解/稀疏/序列并行是标配，训练千卡月级；数据质量>数量——抖动/剪辑跳变/水印视频直接教坏模型，清洗管线（镜头检测、光流稳定性过滤、美学打分）占工程量一半；时序一致性与动态幅度矛盾——时间注意力太强视频变"静态图微动"，太弱则闪烁，temporal module 初始化和训练比例要精调；评测没有银弹——FID/FVD 测不出闪烁和物理错误，人工评分+VBench 多维度是当下现实；长视频的"记忆"（3 秒前的人长什么样）靠 latent 一致性而非显式机制，超过训练时长的生成一致性仍靠 sliding window 硬撑。`,
    keyPoints: ["时空 patch+3D causal VAE，图像=T=1 特例原生混训", "重标注解决视频-文本对齐，多分辨率原生训练", "时空分解注意力是算力现实，数据清洗占一半工程量"],
    followUps: ["为什么时间维 VAE 要 causal（因果）压缩？", "长视频生成的 sliding window 一致性怎么维持？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 35. ai-vector-retrieval =====
  {
    id: "ai-330",
    nodeId: "ai-vector-retrieval",
    question: "HNSW 原理？分层小世界图为什么能做到 O(log N) 检索？",
    answer: `结论：HNSW（Hierarchical Navigable Small World）= 概率跳表 + 小世界图。每个节点以指数衰减概率被抽到更高层（层 0 必有，层 ℓ 概率 p^ℓ），高层是稀疏的"高速公路"，层 0 是稠密的"地面路网"。检索从最高层入口点贪心下降：在当前层找离 query 最近的节点，跳到层数更小时以它为入口继续贪心——高层大步长快速逼近目标区域（对数级步数，因为每层把搜索范围缩小常数倍），低层小步长精修。构图时同样分层插入，每层连接 M 个最近邻（用启发式选边：优先选"方向分散"的邻居保持图连通与多样性），efConstruction 控制建索引质量。复杂度直觉：小世界图的"六度分隔"性质保证任意两点短路径存在，分层贪心保证找到它——期望 O(log N) 跳数、每跳 O(M) 距离计算。参数三件套：M（每点最大边数，16-64，内存与质量旋钮）、efConstruction（建图候选池，200-500）、efSearch（查询候选池，运行时召回率-QPS 旋钮）。

\`\`\`python
import hnswlib
idx = hnswlib.Index(space="cosine", dim=768)
idx.init_index(max_elements=10_000_000, ef_construction=200, M=32)
idx.add_items(vectors, ids)
idx.set_ef(128)                    # 查询时调：召回率 vs 延迟
labels, dists = idx.knn_query(query_vec, k=10)
# 内存估算：M=32 时每点边表约 32*2*8B + 向量本体，千万 768 维 fp32 ≈ 30GB+
\`\`\`

实际案例：Milvus/Weaviate/Qdrant 默认索引都是 HNSW 或其变体；某搜索团队千万级商品向量 HNSW（M=32, ef=128）召回率 97%、P99 延迟 8ms，替代 IVF 后相关性指标 +2%；RAG 系统 90% 以上的向量库生产实例跑 HNSW。

踩坑与 tradeoff：内存大户——图结构+原始向量全驻内存，亿级 768 维要数百 GB，成本敏感场景换 IVFPQ/DiskANN；高维诅咒依旧存在——维度 >1000 时距离区分度下降，召回率靠 efSearch 硬拉；删除支持弱（标记删除，图结构不收缩），删除率高的场景要定期重建；构建慢且难并行（图是有序插入的），批量建索引比 IVF 慢 3-5 倍；参数联动——M 加倍内存涨 40% 但召回只 +1-2%，efSearch 是线上唯一实时旋钮，A/B 时固定 M 只调 ef。`,
    keyPoints: ["分层=跳表思想，高层粗搜低层精修，期望 O(log N)", "M 控内存与质量，efSearch 是线上召回-QPS 旋钮", "内存大户+删除弱，亿级场景看 DiskANN/IVFPQ"],
    followUps: ["HNSW 的选边启发式为什么优先方向分散的邻居？", "标记删除累积后图质量如何衰减？何时该重建？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-331",
    nodeId: "ai-vector-retrieval",
    question: "IVF 倒排索引原理？nlist 与 nprobe 如何权衡？",
    answer: `结论：IVF（Inverted File）用空间划分替代图遍历：先对全量向量跑 KMeans 得到 nlist 个聚类中心（质心），每个向量挂到最近质心的倒排桶里。查询时：①把 query 与 nlist 个质心算距离（这一步 O(nlist·d)）；②只钻进最近的 nprobe 个桶内暴力比对——计算量从全库 N 降到 nprobe·(N/nlist)。nlist 是构建期参数：桶越多每桶越瘦（N/nlist 小），单桶内比对快，但"query 该进哪个桶"的误差变大——真实近邻被分到相邻桶的概率上升，必须靠多探几个桶（大 nprobe）补偿。nprobe 是查询期参数：召回率随 nprobe 单调升，延迟也线性升。经验甜区：nlist ≈ 4√N（百万级 nlist=4096 常见），nprobe 从 nlist 的 1% 起调（4096 桶探 16-64 个）；召回率目标 95%+ 时 nprobe 往往要提到 5-10%，此时 IVF 性价比开始输 HNSW。

\`\`\`python
import faiss
# nlist=4096 需训练质心（先用 30 万+ 样本训 KMeans）
quantizer = faiss.IndexFlatIP(d)
idx = faiss.IndexIVFFlat(quantizer, d, 4096, faiss.METRIC_INNER_PRODUCT)
idx.train(train_vecs)
idx.add(all_vecs)
idx.nprobe = 32                    # 查询旋钮：1=最快，nlist=全库
D, I = idx.search(query, k=10)
\`\`\`

实际案例：FAISS 官方十亿级 benchmark 标配 IVF4096+PQ；某内容社区 2 亿图文向量用 IVFPQ（nlist=8192, nprobe=64），召回 92%、单机 QPS 3000，成本只有 HNSW 内存方案的 1/5；推荐粗排候选集扩展（item2item 近邻表离线预计算）大量用 IVF。

踩坑与 tradeoff：KMeans 质心代表真实分布——向量分布漂移（embedding 模型升级/业务扩张）后桶划分失配，召回率缓慢劣化，要监控桶大小分布偏斜度并定期重建；均匀分布假设常不成立——真实数据簇密度不均，大桶内仍要比对几万条（热点桶拖尾延迟），可用多层级 IVF 或按密度自适应 nlist；nprobe 调大后质心距离计算本身成瓶颈（nlist=65536 时光找桶就 1ms+），要对质心再建小索引；训练样本要够（≥50×nlist）否则质心过拟合；与标量过滤组合时先过滤后桶内搜索（post-filter）可能桶内候选不够，召回断崖——这是混合检索要单独设计的根本原因。`,
    keyPoints: ["KMeans 分桶+只探 nprobe 桶，计算量降两个数量级", "nlist≈4√N，nprobe 从 1% 起调，召回 95% 后 IVF 输给 HNSW", "分布漂移让桶失配，需监控偏斜定期重建"],
    followUps: ["为什么 nprobe 大后 IVF 性价比输给 HNSW？", "热点桶拖尾延迟怎么治理？"],
    favorited: false,
  },
  {
    id: "ai-332",
    nodeId: "ai-vector-retrieval",
    question: "PQ 乘积量化原理？为什么压缩 32 倍还能算距离？",
    answer: `结论：PQ（Product Quantization）把 d 维向量切成 m 段子向量（如 768 维切 96 段、每段 8 维），每段独立跑 KMeans（k=256 个码本中心），向量每段用 1 字节码本 id 表示——d 维 fp32（4d 字节）压成 m 字节，压缩率 4d/m（768 维→96 字节=32 倍）。查询距离不用解压：ADC（非对称距离计算）——query 不压缩，预先算 query 各段与 256 个码本中心的距离表（m×256 次计算），然后对库里每个压缩向量查表累加 m 次即得近似距离，每向量成本 m 次内存查表+加法，比原始 d 次乘加还快。"非对称"是关键：query 保持全精度，只有库向量被量化，距离误差减半（对称方案两边都量化误差叠加）。误差来源：段内量化损失（8 维用 256 中心表示，残差不可避免）+段间独立性假设（各段独立量化忽略跨段相关性——OPQ 用一个可学习旋转矩阵 R 先把相关性转进段内再 PQ，召回率显著回升）。

\`\`\`python
import faiss
# IndexPQ：d=768 切 m=96 段，每段 8bit → 96 字节/向量
idx = faiss.IndexPQ(d=768, M=96, nbits=8)
idx.train(train_vecs)     # 训 96 套独立 KMeans 码本
idx.add(all_vecs)         # 存储只有 96 字节/条
D, I = idx.search(query, 10)
# OPQ 改进：先学旋转再 PQ
opq = faiss.OPQMatrix(768, M=96)
idx2 = faiss.IndexPreTransform(opq, faiss.IndexPQ(768, 96, 8))
\`\`\`

实际案例：FAISS 十亿向量标配 IVFPQ——1B×96 字节=96GB 单机能装（原始 fp32 要 3TB）；某电商平台 5 亿商品图向量 IVFPQ 召回率 91%（vs 精确检索）、内存降 96%、P99 12ms，支撑拍照购日千万次请求；Embedding 服务侧常用 PQ 压缩历史语料库做离线相似对挖掘。

踩坑与 tradeoff：召回率损失 5-15% 是常态——排序敏感场景（精排候选）不能忍，方案是 PQ 粗召回 top-200 → 原始向量精排（rerank），内存只存热数据原始向量；nbits=8（256 中心）是甜点，nbits=4 召回再掉 5 个点以上；段数 m 越多误差越小但距离表计算 m×256 变大，m=d/8 是常见折中；PQ 假设各段方差均衡——embedding 某些维度方差极大时前几段吃满误差，OPQ 或先 PCA  whitening；内积/余弦场景注意：PQ 为 L2 设计，余弦要先归一化再用 L2 等价转换；量化码本随数据分布漂移，模型升级 embedding 后必须重训码本。`,
    keyPoints: ["分段独立量化：d 维→m 字节，32 倍压缩", "ADC 查表算距：query 全精度+库向量压缩，比原始计算还快", "OPQ 旋转救段间相关性，PQ 粗召回+精排是生产范式"],
    followUps: ["为什么 ADC（非对称）比对称量化误差小？", "PQ 在余弦相似度场景为什么要先归一化？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-333",
    nodeId: "ai-vector-retrieval",
    question: "IVFPQ 组合索引为什么是工业主流？OPQ 与残差量化如何进一步提效？",
    answer: `结论：IVF 与 PQ 解决的是两个正交的瓶颈——IVF 减少"要比对的向量数"（空间划分，N→N/nlist·nprobe），PQ 减少"每条向量的存储与比对成本"（d 维→m 字节+查表）。组合后十亿级向量单机可检索：1B 向量 IVFPQ 存储≈100GB、查询先钻桶再 PQ 查表，召回 90%+ 时 QPS 数千。细节加分项：①残差量化——IVF 桶内向量不直接 PQ，而是先减所属质心（r = x - centroid）再对残差 PQ，残差动态范围小得多，量化误差降一半（FAISS 的 IndexIVFPQ 默认开启）；②OPQ 旋转——PQ 分段独立假设被 embedding 维度相关性破坏，OPQ 学一个正交旋转 R（最小化量化误差的目标交替优化），把相关性"转匀"到各段，同字节预算下召回 +3-8 个点；③重排级联——IVFPQ 快速召回 top-k×10 候选，用原始向量（或更精确的 SQ8）重排取 top-k，两阶段把召回率拉回 97%+。选型阶梯：百万级以内 HNSW 省心；千万-亿级 IVFPQ(+OPQ)+重排；十亿级或 SSD 场景 DiskANN。

\`\`\`python
import faiss
# 工业标配：OPQ 旋转 → IVF 分桶 → 残差 PQ
d, M, nlist = 768, 96, 8192
opq = faiss.OPQMatrix(d, M=M)
coarse = faiss.IndexFlatL2(d)
ivfpq = faiss.IndexIVFPQ(coarse, d, nlist, M, 8)   # 默认残差量化
idx = faiss.IndexPreTransform(opq, ivfpq)
idx.train(train_vecs); idx.add(all_vecs)
idx.nprobe = 64
# 两阶段：PQ 召回 500 → fp32 原始向量重排取 50
D, I = idx.search(q, 500)
final = rerank_with_raw(q, I)   # 只拉 500 条原始向量，内存可控
\`\`\`

实际案例：某搜索引擎图文召回 8 亿向量，IVF8192+OPQ+PQ96+fp32 重排，召回率 96.5%、P99 延迟 15ms、单机内存 220GB（纯 HNSW 方案要 1.2TB）；Meta/Facebook 的十亿级相似图片检索（FAISS 论文场景）同款架构；Milvus 生产集群 60% 以上索引类型是 IVFPQ 系。

踩坑与 tradeoff：三个组件各有训练集要求——KMeans 要 50×nlist 样本、PQ 码本要百万级、OPQ 优化不稳定需多随机种子取优，训练样本不足时索引质量静默劣化（不报错但召回低）；nprobe×桶大小决定真实计算量，幂律分布下大桶拖尾（热点 query 词全落同一语义桶），监控每桶 P99；OPQ 旋转矩阵在分布漂移后失效且不易察觉，A/B 灰度重建；GPU-FAISS 对 IVFPQ 加速 10 倍但 OPQ/重排链路在 GPU 上实现受限，混合架构工程复杂；别忘了标量过滤联合查询（post-filter 后桶内候选可能不足 k，要扩 nprobe 兜底逻辑）。`,
    keyPoints: ["IVF 减候选数、PQ 减单条成本，正交组合吃十亿级", "残差量化（减质心再 PQ）误差减半，OPQ 旋转再提召回", "PQ 粗召回+fp32 重排两段式拉回 97%+"],
    followUps: ["残差量化为什么比直接量化误差小？", "OPQ 的优化目标是什么？为什么要多随机种子？"],
    favorited: false,
  },
  {
    id: "ai-334",
    nodeId: "ai-vector-retrieval",
    question: "LSH 局部敏感哈希原理？相比图与量化方法何时该用？",
    answer: `结论：LSH 用一族"碰撞概率随距离单调"的哈希函数把向量映射到桶：随机超平面哈希（SimHash，适合余弦）——随机画 k 个超平面，向量在平面同侧记 1 异侧记 0，k 位签名碰撞概率=1-θ/π（θ 是向量夹角），近邻大概率同签名；p-stable LSH（适合 L2）——随机投影加随机偏移后按宽度 w 分桶。多表策略：建 L 张独立哈希表，每张用 k 位签名，查询并集 L 张表的同桶候选——k 控精度（位多桶纯但候选少）、L 控召回（表多候选全）。理论保证：对 (r, cr)-近似近邻，查准查全有显式概率界（这是 LSH 区别于启发式方法的卖点）。复杂度亚线性但常数不小：达到 95% 召回往往需要 L=几十张表，内存翻倍。与 HNSW/IVFPQ 对比：LSH 胜在理论保证+流式友好（新增向量算签名插桶即可，无图结构维护）+天然二值签名可与位运算/倒排索引结合；输在相同召回下内存与延迟常数普遍劣于 HNSW（图法）和 IVFPQ（量化法）——2019 年后纯向量检索基准上 LSH 基本退出主流。

\`\`\`python
import numpy as np
# SimHash（余弦 LSH）：k 个随机超平面
planes = np.random.randn(k, d)
sig = (vectors @ planes.T > 0)        # (N, k) 布尔签名
q_sig = (query @ planes > 0)
candidates = np.where((sig == q_sig).all(axis=1))[0]   # 同桶候选
# datasketch 库：MinHash LSH（Jaccard 场景）
from datasketch import MinHashLSH
lsh = MinHashLSH(threshold=0.5, num_perm=128)
\`\`\`

实际案例：Google SimHash 网页去重是 LSH 成名战（百亿网页 64 位签名，海明距离 ≤3 判重复）；推荐系统 i2i 近邻表离线计算仍有团队用 LSH 做初筛（Spark 上比精确比对快 20 倍）；MinHash LSH 在集合相似度（文档 shingle、用户行为集合）场景至今是标配——datasketch 支撑大量去重/聚类管线。

踩坑与 tradeoff：理论保证在高维稀释——维度上千时为保持召回要把 k 调小、L 调大，内存和候选集膨胀，实测常不如调好的 HNSW；参数 (k, L) 互相耦合且随数据分布变，调参比 HNSW 的 ef 单旋钮痛苦；LSH 对"近邻都在同一个小区域"的密集簇表现好，对长尾稀疏向量差；二值签名丢精度，最后一步仍要原始向量精排；今天选型口诀：在线向量检索选 HNSW/IVFPQ，离线大规模去重/聚类（Jaccard/余弦粗筛）用 MinHash/SimHash LSH，需要流式插入+理论保证的细分场景才考虑 LSH 索引。`,
    keyPoints: ["碰撞概率随距离单调，SimHash 签名=随机超平面同侧性", "k 控精度 L 控召回，理论有显式概率界", "流式友好但常数劣于 HNSW，现役主场是离线去重/集合相似"],
    followUps: ["MinHash 为什么估计的是 Jaccard 相似度？", "LSH 的 (r,cr)-近似保证具体形式是什么？"],
    favorited: false,
  },
  {
    id: "ai-335",
    nodeId: "ai-vector-retrieval",
    question: "十亿级向量检索怎么做？DiskANN 与 ScaNN 的思路？",
    answer: `结论：内存放不下时两条路线。DiskANN（微软）：把图索引搬到 SSD——核心洞察是"图的遍历天然是局部访问，SSD 随机读 4KB 只要几十微秒，一条遍历路径的 IO 次数可控"。三个设计：①Vamana 图算法（比 HNSW 更激进的长边剪枝，直径更小，遍历步数少 → IO 次数少）；②布局优化：SSD 上每个 4KB 扇区存"一个节点的完整向量+邻居表"，一跳一次读盘不浪费带宽；③两级精度：SSD 存全精度向量（图遍历用），内存只放 PQ 压缩向量做距离初算，候选节点再读盘精算——内存占用压到原始 1/30，十亿向量单机（64GB 内存+NVMe）QPS 数千、召回 95%+。ScaNN（Google）：留在内存但把量化做到极致——各向异性量化损失：不最小化向量重构误差，而是直接最小化"内积误差对 MIPS 排序的影响"（高分向量的内积保真权重大），同压缩率下内积检索精度超 PQ 一档，加上 AVX2 寄存器级查表，是当时 recall-QPS 双榜第一。选型：内存装得下→HNSW/ScaNN；装不下但有 NVMe→DiskANN；超大规模多副本→分布式 IVF（Milvus/FAISS index shard）。

\`\`\`python
# DiskANN（diskannpy）
import diskannpy as dap
idx = dap.builder.build_disk_index(
    data=vectors_file, distance_metric="l2",
    index_directory="ann_index",
    complexity=64,             # 图度数
    graph_degree=64,
    num_threads=16,
    pq_disk_bytes=0,           # PQ 向量也放盘上的极端省内存模式
)
# 查询：内存 PQ 粗排 → SSD 读候选精排
labels, dists = dap.disk_aligned_search(
    "ann_index", query, k=10, search_list_size=75, beam_width=4)
\`\`\`

实际案例：Bing 搜索的向量召回层公开承认用 DiskANN 支撑百亿级段落向量；微软 Azure AI Search 十亿向量档默认 DiskANN 后端；某电商拍照搜商品 20 亿 SKU 图向量，从 128 节点内存 HNSW 集群迁到 8 节点 DiskANN，年成本降 85%、P99 从 25ms 升到 45ms 但仍在预算内。

踩坑与 tradeoff：SSD 寿命与 IO 争抢——DiskANN 高 QPS 下读盘 IOPS 拉满，消费级 NVMe 一年写穿（重建索引时），生产要企业级 SSD+写入限速；冷启动灾难——page cache 未热时延迟 10 倍，需要 warmup 脚本预热热点分区；更新不友好：图索引合并新点代价高，DiskANN 用 FreshDiskANN（内存小图+定期合并）兜增量；ScaNN 的各向异性量化对内积/余弦场景优势明显，L2 场景提升收窄；别忽视"召回率定义"——DiskANN 论文 recall@10 是与精确结果比，业务上常只需"业务相关 item 进候选"，验收口径先对齐。`,
    keyPoints: ["DiskANN：Vamana 小直径图+扇区对齐布局+内存PQ/SSD全精度两级", "ScaNN：各向异性量化直接优化内积排序误差", "选型阶梯：内存→HNSW/ScaNN，NVMe→DiskANN，分布式→IVF shard"],
    followUps: ["Vamana 的长边剪枝为什么减少遍历 IO 次数？", "FreshDiskANN 的增量合并机制？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-336",
    nodeId: "ai-vector-retrieval",
    question: "ANN 索引如何评估？召回率-QPS-内存的基准测试怎么做？",
    answer: `结论：三轴评估缺一不可，只报召回率是耍流氓。①召回率（Recall@k）：ANN 返回 top-k 与精确暴力检索 top-k 的交集比例——注意口径：recall@10 严格于 recall@100，业务常用"目标 item 进 top-100 候选"的宽松口径；②QPS/延迟：单机压测报 P50/P99（P99 才反映尾延迟，对检索服务更重要），并发从 1 到满载阶梯加压，记录拐点；③内存/建索引成本：常驻内存（图+向量+码本）、构建时间、训练样本需求。标准流程：固定数据集（SIFT1M/GIST1M/Deep1B 或业务抽样 100 万）→ 暴力精确检索存 ground truth → 扫参数网格（HNSW 扫 efSearch、IVF 扫 nprobe、PQ 扫段数）→ 画召回-QPS 帕累托曲线——同一图上比较方法才公平（ann-benchmarks 标准做法）。业务验收再加两条：增量更新后召回衰减曲线（插入 10% 新数据后是否劣化）、标量过滤联合查询召回（带过滤条件时召回往往掉 10 个点，必须单测）。

\`\`\`python
import numpy as np, time
def recall_at_k(ann_ids, gt_ids, k=10):
    return np.mean([len(set(a[:k]) & set(g[:k])) / k
                    for a, g in zip(ann_ids, gt_ids)])
def bench(idx, queries, gt, k=10):
    idx.set_ef(64)  # 或 idx.nprobe = 32，单参数扫描
    t0 = time.perf_counter()
    ids = idx.knn_query(queries, k=k)      # 批量查询
    qps = len(queries) / (time.perf_counter() - t0)
    return recall_at_k(ids, gt, k), qps
# 扫 efSearch ∈ {16,32,64,128,256} 画帕累托曲线
\`\`\`

实际案例：ann-benchmarks 公开榜曾是选型事实标准（HNSW 长期霸榜内存场景）；某搜索团队迁移前用 100 万业务向量+10 万真实 query 做基准：HNSW(ef=64) 召回 96%/QPS 8000/内存 48GB vs IVFPQ(nprobe=32) 召回 91%/QPS 12000/内存 9GB，最终按"召回 95% 硬线"选 HNSW；embedding 模型每次升级都重跑基准——同一索引参数在新向量分布下召回可能漂移 5 个点。

踩坑与 tradeoff：基准最大的坑是数据分布失真——用均匀随机向量测出的召回率普遍虚高 10+ 个点（真实 embedding 有簇结构，近邻重叠严重），必须用业务向量；query 分布也要真实（热门 query 的近邻密集，难度低）；QPS 数字依赖核数/NUMA/页缓存，跨机器比较没意义，报告必须带硬件配置；批量查询（batch）QPS 好看但掩盖单查询延迟，在线服务要用逐条压测；构建成本常被忽略——HNSW 亿级建索引数小时，重建窗口影响发布节奏，评估报告要含"构建时间/增量支持"列；召回-QPS 曲线会随数据量增长平移，上线后每季度复测。`,
    keyPoints: ["召回@k 口径+P99 延迟+内存三轴，帕累托曲线公平比较", "业务向量+真实 query 分布，随机数据召回虚高 10+ 点", "验收加增量更新衰减与带过滤召回两条线"],
    followUps: ["为什么真实 embedding 分布让 ANN 更难？簇结构的影响？", "标量过滤+向量检索为什么召回会掉？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-337",
    nodeId: "ai-vector-retrieval",
    question: "向量+标量混合检索（filtered search）怎么设计？pre-filter 与 post-filter 对比？",
    answer: `结论：生产查询几乎都是"向量相似 + WHERE 条件"（如：语义相近的商品 AND 类目=女装 AND 库存>0 AND 上架<30 天）。两种执行顺序：post-filter（先向量检索 top-k 再过滤）——实现简单但致命缺陷：过滤把候选筛光，返回不足 k 条（过滤率 90% 时要先取 10k 候选才剩 1k，延迟爆炸或召回崩塌）；pre-filter（先用标量条件缩小集合再在子集内向量检索）——召回有保证，但子集可能很小（过滤率 99.9% 时只剩几千条），此时暴力比对反而比走索引快且精确。工程正解是按过滤率自适应：高过滤率（剩 <1%）→ pre-filter+暴力；中过滤率（1-20%）→ 受约束的图遍历（HNSW 遍历时跳过不满足条件的节点，Qdrant/Weaviate 实现，图遍历不被条件打断是关键——如果起点邻域全被过滤，遍历会"卡死"在局部，需要允许少量条件外节点做"跳板"）；低过滤率 → post-filter 直接筛。索引组织上：标量建倒排/Bitmap 索引（Roaring bitmap 求交毫秒级），与向量索引并列，查询规划器先估算各条件的基数（cardinality）再选策略。

\`\`\`python
# Qdrant：过滤条件下推到 HNSW 遍历（受约束遍历）
from qdrant_client.models import Filter, FieldCondition, MatchValue
results = client.search(
    collection_name="products",
    query_vector=emb,
    query_filter=Filter(must=[
        FieldCondition(key="category", match=MatchValue(value="女装")),
        FieldCondition(key="stock", range={"gt": 0}),
    ]),
    limit=10,
)
# 自适应规划伪码
if selectivity < 0.01:      # 高过滤：倒排查 id 后暴力
    cand_ids = inverted_index.query(filter)
    return brute_force(query_vec, cand_ids)
else:                       # 中低过滤：受约束图遍历
    return constrained_hnsw_search(query_vec, filter_bitmap)
\`\`\`

实际案例：电商"图搜+类目过滤"是标配场景，某平台自适应策略上线后，高过滤查询（长尾类目）召回率从 62% 修复到 98%，P99 延迟从 340ms 降到 28ms；RAG 企业知识库按租户隔离（tenant_id 过滤）是最常见混合检索，Qdrant 为此设计了 tenant 专用的 partition 索引。

踩坑与 tradeoff：基数估算是基石——没有直方图/采样统计时规划器选错策略（把 50% 过滤率当 5% 处理）性能差 10 倍，CBO（cost-based optimizer）思路同样适用于向量 DB；受约束遍历的"跳板"比例是质量旋钮（全禁止跳板召回掉、全放开等于没过滤），Qdrant 用"允许访问不满足条件的节点但不计入结果"；多租户场景把 tenant 建物理分区比逻辑过滤快 10 倍（牺牲跨租户灵活性）；时间范围类条件（上架<30 天）值域连续变化，bitmap 要按时间分桶；别忘记组合条件的相关性——category=女装 AND color=红 的实际基数远小于独立估算的乘积。`,
    keyPoints: ["post-filter 会筛光候选，高过滤率必须 pre-filter", "中过滤率用受约束图遍历（跳板机制防遍历卡死）", "基数估算选策略，Roaring bitmap 做标量求交"],
    followUps: ["受约束 HNSW 遍历的跳板节点如何选择？", "多租户 RAG 为什么物理分区优于逻辑过滤？"],
    favorited: false,
    bigTech: true,
  },
  // ===== 36. ai-model-compression =====
  {
    id: "ai-338",
    nodeId: "ai-model-compression",
    question: "结构化剪枝与非结构化剪枝的区别？为什么非结构化剪枝难加速？",
    answer: `结论：剪枝按粒度分两层世界。非结构化剪枝：逐权重置零（幅度最小的 |w| 置零），压缩率高（90%+ 稀疏度精度损失可控）、理论 FLOPs 大降，但稀疏位置随机——硬件看到的是带随机空洞的稠密矩阵，GEMM/Tensor Core 无法跳过零值，实测延迟不降甚至略升（稀疏 kernel 的索引开销），只在专用稀疏硬件（NVIDIA 2:4 稀疏 Tensor Core、寒武纪）或 CSR 格式+定制 kernel 下兑现加速。结构化剪枝：整通道/整头/整层移除（卷积删 filter、Transformer 删 attention head 或 FFN 神经元、LLM 删整层），剩余仍是稠密矩阵——任何硬件立即加速，缺点是同等压缩率下精度掉得多（50% 通道剪枝常掉 1-3 个点，需微调恢复）。判据一句：稀疏模式与硬件计算粒度对齐才有真加速。流程三板斧：训练→按重要性准则（幅度/Taylor 一阶影响/BN 的 γ 系数）剪→微调恢复；迭代剪枝（每次剪 10-20% 再恢复）比一次性剪到目标稀疏度精度高得多。

\`\`\`python
import torch.nn.utils.prune as prune
# 非结构化：逐权重 L1 剪 30%（参数变小但推理不加速）
prune.l1_unstructured(layer, name="weight", amount=0.3)
# 结构化：按 L2 范数剪 30% 输出通道（真实加速）
prune.ln_structured(layer, name="weight", amount=0.3, n=2, dim=0)
prune.remove(layer, "weight")     # 固化，真正删掉通道
# LLM 层剪枝：整层移除后微调（ShortGPT/LLM-Pruner 思路）
model.layers = torch.nn.ModuleList([l for i, l in enumerate(model.layers)
                                    if importance[i] > threshold])
\`\`\`

实际案例：某 OCR 团队结构化剪枝 MobileNet backbone 40% 通道+微调，端侧延迟 31ms→17ms、精度掉 0.2%；DeepSeek-V2 的 MLA 本质有"结构压缩"思想；某 CV 检测团队对 YOLO 颈部做通道剪枝+蒸馏恢复，模型体积 -55%、mAP 持平。

踩坑与 tradeoff：剪枝准则是最大变量——幅度准则假设"小权重不重要"，在 BatchNorm 层后失效（γ 缩放可放大任何小权重），Taylor 准则（|w·∇L|）更准但要额外反传；剪枝后 BN 的统计量全废，微调前必须重新估计 running stats；Transformer 剪头要谨慎——研究表明不同头冗余度差异巨大，均匀剪每层 25% 不如按头重要性差异剪；彩票假说（LTH）说存在独立训练的稀疏子网络，但工业价值有限（找到子网络的成本>训练大模型）；剪枝+蒸馏组合收益最大：剪后模型当 student、原模型当 teacher，恢复精度比纯微调快一倍。`,
    keyPoints: ["非结构化压缩率高但硬件不加速，结构化真加速但精度掉得多", "稀疏模式必须对齐硬件计算粒度（2:4/CSR/专用核）", "迭代剪枝+微调恢复，剪枝+蒸馏组合收益最大"],
    followUps: ["Taylor 重要性准则为什么优于幅度准则？", "彩票假说的工业价值为什么有限？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-339",
    nodeId: "ai-model-compression",
    question: "低秩分解如何做模型压缩？与 LoRA 是什么关系？",
    answer: `结论：核心观察——训练好的权重矩阵往往"有效秩"远低于维度（奇异值谱快速衰减），W∈R^{m×n} 用 SVD 截断 W≈UΣVᵀ≈A·B（A∈R^{m×r}、B∈R^{r×n}），参数量 mn→r(m+n)，r≪min(m,n) 时压缩数倍。应用方式两种：①事后分解（直接 SVD 已训练权重再接微调），②先天低秩（训练时就把层参数化为 A·B 乘积，如 ALBERT 的 embedding 分解、轻量网络的瓶颈结构）。与 LoRA 的关系是"一体两面"：压缩视角用低秩近似"已有的 W"（W→AB 减参数）；LoRA 用低秩参数化"增量 ΔW"（W 冻结只训 A·B，ΔW=BA 秩 r=8-64）——LoRA 有效恰恰因为 LLM 微调的权重更新本身是低秩的（Hu 等论文实测 ΔW 有效秩<10），说明大模型权重处于低秩流形附近。衍生物：DoRA 把权重分解为"方向×幅度"分别微调（方向用 LoRA），QLoRA 把基底量化到 NF4 再叠 LoRA。

\`\`\`python
import torch
# 事后 SVD 低秩压缩线性层：W (4096×4096) → r=256 压缩 50%+
U, S, Vh = torch.linalg.svd(W)
r = 256
A, B = U[:, :r] * S[:r].sqrt(), (Vh[:r, :].T * S[:r].sqrt()).T  # W ≈ A @ B
compressed = lambda x: x @ B.T @ A.T   # 两次小矩阵乘
param_ratio = r*(W.shape[0]+W.shape[1]) / W.numel()
# LoRA：冻结 W，只学 ΔW=BA
class LoRALinear(torch.nn.Module):
    def forward(self, x):
        return x @ W.T + (x @ B_lora.T @ A_lora.T) * (alpha / r)
\`\`\`

实际案例：ALBERT 用 embedding 低秩分解+跨层共享把 BERT-large 参数砍 89% 而性能持平；某推荐团队对双塔的 4096 维输出层做 r=512 低秩分解，在线推理 CPU 占用降 38%、AUC 无损；QLoRA 让 65B 模型单卡 48GB 可微调，直接引爆 2023-2024 开源微调生态；DoRA 在 LLaMA-2-7B 上常规任务超 LoRA 1-2 个点。

踩坑与 tradeoff：有效秩判定别拍脑袋——画奇异值能谱（Σσᵢ² 累计占比），LLM 的 attention QK 矩阵谱平（低秩压缩损失大）、FFN 与 O 投影谱陡（适合压缩），全层统一 r 是浪费，按层敏感度分配 r（AdaLoRA 思路）；事后 SVD 截断的误差在激活分布不均时被放大（某几维激活特别大的通道），要按激活加权（类似 AWQ 思想）；r 太小（<16）微调类任务欠拟合、r>256 失去压缩意义；低秩近似对"任务相关方向"和"无用方向"一视同仁——重要方向可能恰在小奇异值区，微调恢复必不可少；压缩和微调目标不同：压缩要最小 ||W-AB||，LoRA 要让 AB 学到任务增量，别指望一个 r 通吃。`,
    keyPoints: ["有效秩≪维度 ⇒ W≈AB，参数量 mn→r(m+n)", "LoRA=低秩参数化增量 ΔW，微调有效因 ΔW 本身低秩", "按层敏感度分配 r（谱陡的 FFN 多压，谱平的 QK 少压）"],
    followUps: ["AdaLoRA 如何按奇异值重要性动态分配各层秩？", "QLoRA 的 NF4 为什么比 INT4 更适合权重分布？"],
    favorited: false,
  },
  {
    id: "ai-340",
    nodeId: "ai-model-compression",
    question: "PTQ 与 QAT 的区别？量化感知训练如何恢复精度？",
    answer: `结论：PTQ（训练后量化）：拿现成模型直接量化，用少量校准数据（几百到几千条无标注样本）统计激活范围定 scale/zero-point——零训练成本、分钟级完成，INT8 下精度损失通常 <1%，但 INT4 或敏感模型上损失可达数个点。QAT（量化感知训练）：训练/微调时在计算图中插入伪量化节点（FakeQuantize：前向模拟"量化-反量化"的舍入误差，反向用 STE 直通估计器把梯度原样传过不可导的 round）——模型在训练期就"感知"到量化噪声并适应（权重学会避开量化误差大的配置、BN 统计量按量化后分布更新），INT4 也能把损失压到零点几个点。代价：QAT 要完整训练管线+标注数据+数天 GPU 时。决策树：INT8 优先 PTQ（够好）；INT4/INT2 或精度敏感场景（医疗/金融）上 QAT；LLM 场景因训练成本不可行，主流是"强化版 PTQ"（GPTQ/AWQ 用二阶信息或激活感知在小校准集上做逐层误差补偿，逼近 QAT 效果）。

\`\`\`python
import torch
from torch.ao.quantization import get_default_qat_qconfig_mapping, prepare_qat, convert
# QAT 三步：准备伪量化 → 微调 → 转真量化
model.qconfig = get_default_qat_qconfig_mapping("x86")["activation"].with_args()
qat_model = prepare_qat(model.train())
for x, y in train_loader:                    # 正常微调，前向带伪量化
    loss = criterion(qat_model(x), y)
    loss.backward(); optimizer.step()
int8_model = convert(qat_model.eval())       # 固化 scale，真 INT8 kernel
# STE 的直觉：round 不可导，梯度恒等穿过
# forward: y = round(x/s)*s   backward: dy/dx ≈ 1（截断在量化范围内）
\`\`\`

实际案例：移动端 CV（TFLite/QNN）标配 QAT：某安防厂商把 INT8 检测模型精度损失从 PTQ 的 2.1% 压到 0.3%；推荐广告模型 INT8 QAT 后线上 AUC 无损、推理成本降 55%；LLM 侧 QAT 代表是 LLM-QAT（用模型自己生成数据做蒸馏式 QAT），但工业主流仍是 GPTQ/AWQ 这类"PTQ 价格 QAT 效果"的折中。

踩坑与 tradeoff：STE 是"善意的谎言"——梯度恒等近似在 bit 数极低（2-4bit）时误差大，QAT 低比特训练要配合可学习量化范围（LSQ 让 scale 也可学）；QAT 的校准分布必须与上线分布一致，用旧数据微调会学到错的量化范围；BN 折叠（conv+BN 融合后再量化）顺序搞错精度直接崩；伪量化节点的粒度（per-tensor/per-channel）必须和部署后端一致，训练 per-channel 部署 per-tensor 是经典翻车；别迷信 QAT——INT8 下精心校准的 PTQ（直方图/MSE 选范围）常已足够，QAT 的收益主要在 4bit 以下。`,
    keyPoints: ["PTQ 零成本适合 INT8，QAT 训练期感知量化噪声适配 INT4", "FakeQuantize 前向模拟舍入、STE 反向直传梯度", "LLM 用 GPTQ/AWQ 折中：PTQ 成本逼近 QAT 效果"],
    followUps: ["LSQ 为什么让量化范围也可学习？", "BN 折叠顺序错误为什么会让量化精度崩？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-341",
    nodeId: "ai-model-compression",
    question: "LLM 量化的激活异常值问题？SmoothQuant 与 LLM.int8() 如何解决？",
    answer: `结论：LLM 量化的独特难点不在权重（权重大致平滑、钟形分布），而在激活——Transformer 某些通道存在"异常值"（outlier channels）：个别维度激活值可达 100+，比中位数大两个数量级，且系统性出现在固定通道（LayerNorm 后某些维度负责"信息哨兵"）。per-tensor 量化用全局 min/max 定 scale，一个 outlier 把量化范围撑大 100 倍，其余 99% 的激活挤在 1-2 个量化桶里——信息全灭。两种解法：LLM.int8()（混合精度分解）：矩阵乘前按通道把激活拆成 outlier 集合（约 0.1% 维度）与正常集合，outlier 走 FP16 高精度计算、其余走 INT8，各自累加再合并——精度无损、速度约 INT8 的 90%；SmoothQuant（更优雅）：数学恒等变换把激活的量化难度"转移"给权重——X·W = (X·diag(s)⁻¹)·(diag(s)·W)，用平滑因子 s_j = max(|X_j|)^α / max(|W_j|)^(1-α) 按通道缩放：激活被压平（好量化）、权重被顶起少量起伏（权重本来就耐量化），α=0.5 经典，之后激活/权重都能 W8A8 全 INT8 跑——无混合精度分支，硬件友好。

\`\`\`python
import torch
# SmoothQuant 一行核心：按通道缩放，难度从 X 转移到 W
s = (act_absmax ** alpha) / (weight_absmax ** (1 - alpha))   # (C_in,)
W_smooth = W * s                      # 权重先缩放（离线做）
x_smooth = x / s                      # 激活推理时除回
y = (x_smooth.to(torch.int8) @ W_smooth_int8) * scale   # 数学上 = x @ W
# LLM.int8()：outlier 通道分解
mask = x.abs().max(dim=0).values > 6.0     # outlier 维度约 0.1%
y = x[:, ~mask] @ W[~mask].int8() + x[:, mask] @ W[mask].half()
\`\`\`

实际案例：SmoothQuant 让 OPT-175B 全 INT8（W8A8）精度无损，首次实现"激活也 INT8"的大模型 serving；LLM.int8() 是 bitsandbytes 核心，让 175B 模型单卡可推理（2022 年民主化里程碑）；某云厂商 LLM 推理服务用 SmoothQuant W8A8，吞吐 +1.9 倍、PPL 变化 <0.1；AWQ/GPTQ 则主攻 W4A16（权重量化激活保 FP16），端侧部署主流。

踩坑与 tradeoff：outlier 随模型规模增长而加剧（13B+ 明显，175B 极端），小模型（<1B）粗暴 per-tensor 可能也能活；SmoothQuant 的 α 是数据集相关的——校准集与线上分布偏差大时 s 估计失真，激活被压太平反而引入新误差；KV Cache 量化是另一个战场（长上下文下 KV 占显存 70%+），SmoothQuant 不覆盖，要用专门的 KV INT8/FP8；MoE 模型 outlier 更严重（专家间激活分布差异大），量化需按专家分组；W8A8 收益最大的是 prefill（计算密集），decode 是访存密集瓶颈在 KV Cache 读取——别指望全 INT8 解决所有延迟问题。`,
    keyPoints: ["LLM 量化难在激活 outlier 通道，权重反而耐量化", "SmoothQuant 数学恒等把难度转给权重，实现 W8A8", "LLM.int8() 混合精度分解，outlier 走 FP16 其余 INT8"],
    followUps: ["为什么 outlier 通道在 LayerNorm 后系统性出现？", "MoE 模型量化为什么要按专家分组校准？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-342",
    nodeId: "ai-model-compression",
    question: "量化粒度 per-tensor / per-channel / group-wise 的区别？W4A16 是什么含义？",
    answer: `结论：量化粒度决定"多少个元素共享一组 scale/zero-point"。per-tensor：整张量一组 scale——实现最简单、kernel 最快，但离群值撑大范围导致精度损失（LLM 激活场景致命）；per-channel（per-output-channel）：每个输出通道一组 scale（权重矩阵每行独立）——匹配卷积/GEMM 的输出结构，精度大幅提升而 kernel 几乎无损（scale 在累加后乘），是 INT8 权重标配；group-wise：权重沿输入维每 G 个元素一组 scale（G=64/128）——进一步隔离组内离群值，INT4 权重量化（GPTQ/AWQ）的事实标准，代价是 scale 表开销（G=128、4bit 时 scale 占 ~6%）与 kernel 反量化复杂度。术语解码：W4A16=权重 4bit、激活 16bit（FP16/BF16）——decode 场景主流，因为 LLM 解码是访存密集，瓶颈在权重搬运，权重压 4 倍显存带宽省 4 倍，激活保 FP16 护精度；W8A8=权重激活都 INT8，prefill/高吞吐场景更优（INT8 Tensor Core 算力 2 倍）；W4A8/W2A16 是研究前沿。选型口诀：权重永远至少 per-channel、INT4 必须 group-wise、激活敢量化就先 SmoothQuant。

\`\`\`python
import torch
def quant_weight(W, bits=4, group_size=128):
    # group-wise 量化：沿输入维每 G 个一组 scale
    Wg = W.reshape(-1, group_size)
    scale = Wg.abs().amax(dim=1, keepdim=True) / (2**(bits-1) - 1)
    q = torch.clamp((Wg / scale).round(), -8, 7)      # INT4
    return q.reshape(W.shape), scale.reshape(W.shape[0], -1)
# 推理 kernel：INT4 权重读进来 → 按组反量化 → FP16 GEMM
W_deq = (q.reshape(-1, G) * scale).reshape(W.shape)   # 每组用自己的 scale
# W4A16 收益：权重显存/带宽 ÷4，decode 吞吐 ~2.5-3×
\`\`\`

实际案例：GPTQ/AWQ 默认 g=128 group-wise W4A16，LLaMA-70B 显存 140GB→38GB，单卡 A100 可跑且 PPL 损失 <0.2；vLLM/TensorRT-LLM 生产 serving 权重一律 per-channel 起步；某端侧团队手机跑 7B 模型，W4A16 g=64 + MNN 内核，生成速度 8 token/s 可商用。

踩坑与 tradeoff：group_size 不是越小越好——g=32 比 g=128 精度提升 <0.05 PPL 但 scale 开销 ×4、kernel 反量化指令翻倍，甜区在 64-128；per-channel 对激活基本无用（激活的 outlier 在固定特征通道，per-token 才有意义——这是另一个维度，别混淆）；对称 vs 非对称量化：权重大致零均值用对称（省 zero-point），激活有偏（GELU 后全正）用非对称；FP8（E4M3/E5M2）在 H100+ 是 group-wise 的新替代——不用反量化 kernel，硬件原生，vLLM/DeepSeek 已大规模上线；量化后 eval 要测长尾任务（代码/数学），平均 PPL 无损不代表推理链能力无损。`,
    keyPoints: ["粒度越细越隔离离群值：per-tensor→per-channel→group-wise", "W4A16=权重4bit激活FP16，decode 访存瓶颈的最优解", "INT4 权重必须 group-wise，g=128 是开销-精度甜区"],
    followUps: ["per-token 激活量化与 per-channel 权重量化为什么常组合？", "FP8 相比 INT8 group-wise 省了什么？"],
    favorited: false,
  },
  {
    id: "ai-343",
    nodeId: "ai-model-compression",
    question: "2:4 结构化稀疏是什么？NVIDIA 稀疏 Tensor Core 如何加速？",
    answer: `结论：2:4 稀疏是 NVIDIA Ampere 起硬件支持的结构化稀疏模式：每连续 4 个权重中恰好 2 个为零（50% 稀疏度），非零位置用 2bit 索引记录。硬件原理：稀疏 Tensor Core 在 GEMM 数据通路里加"压缩-跳过"逻辑——权重以压缩格式（2 个非零值+2bit 索引）从显存读出，算力单元跳过零值乘法，理论峰值算力 2 倍（A100 稠密 312 TFLOPS vs 稀疏 624 TFLOPS），且权重搬运带宽减半。关键在"模式与硬件对齐"：50% 稀疏度换来的 2 倍加速是真实可得的（不像非结构化稀疏只是纸面 FLOPs）。训练流程：①稠密训练收敛；②按 2:4 约束剪枝——每 4 元素组保留幅度最大的 2 个（重要性准则可用 Taylor）；③微调恢复（稀疏掩码固定，或 ASP 方法在训练中保持稀疏约束）；精度损失通常 <1%。限制：只有权重稀疏（激活仍稠密），且矩阵形状需对齐 4 的倍数。

\`\`\`python
import torch
def prune_2_4(W):                        # W: (out, in)，按行每 4 个一组
    Wg = W.reshape(W.shape[0], -1, 4)
    top2 = Wg.abs().topk(2, dim=-1, keepdim=True).values.min(dim=-1, keepdim=True).values
    mask = (Wg.abs() >= top2).reshape(W.shape)
    return W * mask                      # 50% 权重置零，位置记录为索引
# 推理（需 CUTLASS/cusparselt 稀疏 GEMM kernel）
import sparse_lib
W_sparse = sparse_lib.to_sparse_24(W_pruned)   # 压缩格式：值+2bit 索引
y = sparse_lib.spmm(W_sparse, x)               # 2× 峰值算力
\`\`\`

实际案例：NVIDIA 官方 Transformer 2:4 稀疏实验：BERT/ViT 精度损失 <0.5%、推理 1.5-1.8 倍加速；某广告精排大模型（DCN-v2 类）MLP 层 2:4 稀疏化，在线推理延迟降 42%、AUC 持平；TensorRT-LLM 对 LLaMA 支持 W 稀疏+INT4 组合（2:4 sparsity 叠 W4A16），吞吐再提 1.6 倍。

踩坑与 tradeoff：2 倍是峰值不是实测——真实 GEMM 受形状/带宽限制，M 维度小（decode batch=1）时稀疏 kernel 优势缩水，实测 1.2-1.5 倍常态；剪枝准则影响大——幅度准则在 2:4 约束下比非结构化掉点更多（约束更强），必须微调；全网络稀疏化要分层敏感度分析：第一层和输出层保持稠密几乎免费（参数占比小但敏感度高）；2:4 与量化正交可叠加（稀疏 W4A16）但校准互相影响，先稀疏微调再量化顺序更稳；训练侧加速有限（稀疏 GEMM 主要优化推理），别指望训练 2 倍；H100 后 NVIDIA 推 FP8 优先于稀疏，新硬件稀疏宣传降温——选型看部署硬件代际。`,
    keyPoints: ["每4留2的固定模式，硬件跳过零值真 2 倍峰值", "压缩格式=非零值+2bit索引，权重带宽减半", "幅度剪枝+微调恢复，首末层保稠密"],
    followUps: ["为什么 batch=1 的 decode 场景稀疏 kernel 收益缩水？", "2:4 稀疏与 W4A16 叠加时的校准顺序？"],
    favorited: false,
  },
  {
    id: "ai-344",
    nodeId: "ai-model-compression",
    question: "小模型获得方式选型：从头训、剪枝、量化、蒸馏如何组合？",
    answer: `结论：四种路径不是互斥而是流水线，选型取决于"目标延迟/显存预算"与"可投入的训练成本"。决策框架：①预算宽松（只要能跑起来）→ 直接找官方小模型从头训/微调（Qwen-0.5B、Phi 系）——架构为小尺寸原生设计，性价比最高；②预算中等（INT8 可接受）→ 大模型+PTQ INT8——分钟级完成、精度损失 <1%，首选默认动作；③预算紧（INT4/延迟减半）→ GPTQ/AWQ W4A16 或 2:4 稀疏+微调——要校准数据与数小时 GPU；④预算极紧（端侧 CPU、10 倍压缩）→ 蒸馏小模型（或剪枝+蒸馏组合）——蒸馏是唯一能"突破原模型能力天花板换尺寸"的方法：student 学习 teacher 的软标签（温度 T=3-6 平滑的分布含暗知识：类间相似度），同尺寸下比从头训高 2-5 个点。黄金组合：剪枝出结构 → 蒸馏恢复精度 → 量化收尾部署（剪枝改架构后蒸馏，量化永远最后做，因为前面步骤都改变权重分布）。

\`\`\`python
# 蒸馏损失：软标签 KL + 硬标签 CE
T, alpha = 4.0, 0.7
soft = F.kl_div(F.log_softmax(student_logits/T, -1),
                F.softmax(teacher_logits/T, -1), reduction="batchmean") * T*T
hard = F.cross_entropy(student_logits, labels)
loss = alpha * soft + (1 - alpha) * hard
# 特征层蒸馏（中间层对齐，加深监督）
loss += beta * F.mse_loss(student_hidden, projector(teacher_hidden))
\`\`\`

实际案例：DistilBERT 蒸馏 BERT 保 97% 性能、体积 -40%、速度 +60%；TinyBERT 叠中间层蒸馏+数据增强，6 层达 BERT-base 96.8% 指标；某内容审核团队把 7B 审核模型蒸馏到 0.5B：线上 P99 从 85ms 降到 9ms、成本降 92%、准确率仅掉 0.4%；MiniCPM/Gemma 小模型系列公开用蒸馏达到"越级"效果。

踩坑与 tradeoff：蒸馏的温度与 α 敏感——T 太高分布过平丢失 top 类信息、T=1 退化为硬标签，T=3-6 起步扫；teacher-student 容量差过大（70B→0.5B）学不动，用"中间尺寸助教"级联蒸馏（70B→7B→0.5B）；任务型小模型蒸馏特定任务数据就够，通用小模型蒸馏要覆盖 teacher 全能力分布（数据配比是核心 know-how）；剪枝+蒸馏顺序别反——先蒸馏出的紧凑知识在剪枝后需重新对齐；量化放最后，QAT 阶段可把蒸馏损失一并加入（联合目标）；别忽视数据侧：对小模型，训练数据质量的边际收益常大于压缩技术本身。`,
    keyPoints: ["蒸馏软标签含暗知识，同尺寸比从头训高 2-5 点", "黄金组合：剪枝改结构→蒸馏恢复→量化收尾", "容量差大用级联蒸馏，量化永远最后一步"],
    followUps: ["为什么温度 T 的平方要乘回蒸馏损失？", "级联蒸馏相比直接蒸馏的收益机制？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-345",
    nodeId: "ai-model-compression",
    question: "端侧推理框架（MNN/NCNN/TFLite/CoreML）如何选型？异构计算怎么调度？",
    answer: `结论：端侧推理与云端完全不同：算力弱、内存小、功耗敏感、硬件碎片化（CPU 大小核、GPU、NPU/DSP 三分天下）。主流框架：TFLite（Google 官方，Android 生态位稳，GPU/NNAPI delegate）；CoreML（苹果全家桶唯一选择，ANE 神经网络引擎自动调度，转换工具链 coremltools 成熟）；MNN（阿里开源，算子融合与量化 kernel 打磨深，手淘亿级 DAU 验证）；NCNN（腾讯开源，无第三方依赖、极致轻量，适合嵌入式）；ONNX Runtime Mobile（跨平台统一，模型来源杂时省心）。异构调度核心：不同算子在不同硬件上效率差 10 倍——卷积/GEMM 给 NPU（能效比高 10 倍），reshape/concat 等内存操作留 CPU（NPU 不支持或转换开销大），框架做图分割：把计算图切成"NPU 子图+CPU 子图"，边界处插入格式转换（NCHW↔NHWC）。调度陷阱：跨硬件数据搬运一次 0.5-2ms，子图切太碎搬运吃掉加速收益；NPU 对动态 shape 支持差（要固定输入尺寸编译）；功耗墙——持续满载 30 秒降频，实测帧率先升后降。

\`\`\`python
# TFLite：量化 + GPU/NNAPI delegate
import tensorflow as tf
converter = tf.lite.TFLiteConverter.from_saved_model("model")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = calib_gen      # INT8 校准
tflite_model = converter.convert()
interpreter = tf.lite.Interpreter(model_content=tflite_model,
    experimental_delegates=[gpu_delegate])         # 或 NNAPI delegate
# MNN（C++ 部署为主）：Python 仅做转换验证
# ./MNNConvert -f ONNX --modelFile model.onnx --MNNModel model.mnn --fp16
\`\`\`

实际案例：手淘"拍立淘"用 MNN 在千元机跑检测+检索全链路 200ms 内；某门锁厂商人脸活体模型 NCNN 部署 ARM Linux 开发板，INT8 后 45ms 可商用；iOS 端 CoreML 把 Stable Diffusion 级模型跑上 iPhone（split_einsum 编译模式+ANE），生成 512px 图 <10 秒。

踩坑与 tradeoff：算子覆盖是最大坑——新模型算子（如 GLU、RMSNorm 变体）框架没实现就 fallback CPU，延迟炸 5 倍，选型前先跑一遍模型看算子支持报告；INT8 端侧 kernel 各框架质量参差（同样的模型 MNN 可能比 TFLite 快 30%），要在目标机型实测；内存峰值常被忽略——推理中间激活可能占模型体积 3-5 倍，低端机 OOM 比慢更致命；发热降频让 benchmark 失真：连续压测 10 分钟后的数字才是真实体验；多模型串联 pipeline（检测→对齐→识别）要合并编译减少硬件上下文切换；版本碎片化：NPU 驱动 bug 按机型出现，上线矩阵要覆盖 top-20 机型。`,
    keyPoints: ["TFLite/CoreML/MNN/NCNN 按平台生态选型，算子覆盖先验证", "图分割调度：GEMM 给 NPU，内存操作留 CPU，搬运是隐性成本", "功耗墙+内存峰值+机型碎片化是端侧三大现实"],
    followUps: ["为什么 NPU 子图切太碎反而更慢？", "CoreML 的 split_einsum 模式解决什么问题？"],
    favorited: false,
  },
  {
    id: "ai-346",
    nodeId: "ai-distributed-training",
    question: "DDP 的梯度分桶（gradient bucketing）与通信-计算重叠是怎么做的？桶大小为什么影响吞吐？",
    answer: `结论：DDP 的核心优化不是"每台机器算完梯度再统一 AllReduce"——那样通信是纯串行尾巴；而是梯度分桶+反向传播重叠通信：把梯度按参数逆序切成约 25MB 的桶（bucket），反向传播每算完一桶立即触发该桶的 AllReduce，同时继续反传下一桶——通信藏在计算后面，理想情况通信开销≈0（条件是单桶计算时间 ≥ 单桶通信时间）。桶按反向完成顺序（参数的逆序）排列，保证最先算完的梯度最先通信。AllReduce 用 ring 拓扑：每个 rank 只与左右邻居收发，总通信量 2·(N-1)/N·M ≈ 2M（M=参数字节数），与 rank 数无关——这是 DDP 能扩展到千卡级的数学基础。实现细节：桶内梯度先 flatten 成连续 buffer（减少 kernel launch 与网络包数）；通过 autograd hook 监听"梯度就绪"事件入队通信。

\`\`\`python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
dist.init_process_group("nccl")
ddp = DDP(model.to(local_rank), device_ids=[local_rank],
          bucket_cap_mb=25)      # 唯一重要旋钮：默认 25MB
# 梯度累积必须 no_sync：跳过中间步的 AllReduce，否则通信量×累积步数
for i, batch in enumerate(batches):
    ctx = ddp.no_sync() if i % ACCUM != ACCUM - 1 else nullcontext()
    with ctx:
        (ddp(batch).sum() / ACCUM).backward()
\`\`\`

实际案例：某 LLM 团队 7B 模型 256 卡 DDP，bucket_cap_mb 从 25 调到 100 后吞吐 +6%（桶数减少、overlap 窗口更完整）；另一团队梯度累积忘用 no_sync，通信量翻 4 倍，MFU 从 45% 掉到 28%。

踩坑与 tradeoff：find_unused_parameters=True 会逐参数做可达性检查，拖慢 10-20%，能不用就不用；冻结参数各 rank 必须一致——A rank 冻结、B rank 不冻结会让 AllReduce 的桶对不齐直接挂死（DDP 最常见 hang 原因）；桶顺序假设反向严格按参数逆序完成，模型有条件分支/稀疏激活时假设失效，通信暴露；混合精度下各 rank 梯度 dtype 必须统一（GradScaler unscale 后再通信）；纯 DDP 的通信量是全量梯度 2M，大模型不如 ZeRO/FSDP（通信 2M/N）——DDP 是"小模型多卡"的方案，不是"大模型"的方案。`,
    keyPoints: ["分桶+逆序触发 AllReduce，通信藏进反向计算", "ring AllReduce 通信量≈2M 与卡数无关，这是可扩展性来源", "梯度累积必须 no_sync，冻结参数各 rank 必须一致"],
    followUps: ["为什么 ZeRO-3 的通信量比 DDP 大 50% 却仍更省显存？", "DDP hang 住的排查顺序是什么？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-347",
    nodeId: "ai-distributed-training",
    question: "ZeRO-1/2/3 三个阶段分别切分什么？显存节省公式怎么算？通信代价各是多少？",
    answer: `结论：ZeRO 的洞察：数据并行下每个 rank 都存全量的优化器状态、梯度、参数——纯冗余。三阶段逐级切分：ZeRO-1 切优化器状态（AdamW 的 FP32 master copy+m+v，占显存大头=12 字节/参数），每 rank 只存 1/N 分片、更新完 AllGather 回参数，显存省约 4 倍；ZeRO-2 再切梯度：反向完成后不 AllReduce 而是 ReduceScatter，每 rank 只保留自己负责更新那 1/N 参数的梯度，省约 8 倍；ZeRO-3 连参数也切：前向/反向用到哪层才 AllGather 哪层、用完即弃，理论省 N 倍——万亿参数模型因此可训。显存账（Ψ=参数量，混合精度训练）：baseline DP=2Ψ(BF16 参数)+2Ψ(梯度)+12Ψ(Adam)=16Ψ 字节；ZeRO-3=(2+2+12)Ψ/N+通信 buffer。通信代价：ZeRO-1/2 通信量与 DDP 相同（≈2M）；ZeRO-3 是 1.5 倍（参数 AllGather 前向一次反向一次 + 梯度 ReduceScatter 一次，共 3M vs 2M）——单节点放得下的模型不要上 ZeRO-3。

\`\`\`python
# DeepSpeed ds_config.json 关键段
{
  "zero_optimization": {
    "stage": 3,
    "offload_optimizer": {"device": "cpu", "pin_memory": true},
    "offload_param": {"device": "cpu", "pin_memory": true},
    "overlap_comm": true,            # AllGather 与计算重叠
    "contiguous_gradients": true,
    "allgather_bucket_size": 5e8
  },
  "bf16": {"enabled": true}
}
# PyTorch 原生等价：FSDP FULL_SHARD ≈ ZeRO-3，SHARD_GRAD_OP ≈ ZeRO-2
\`\`\`

实际案例：DeepSpeed 官方用 ZeRO-3 跑通 1 万亿参数 MoE（Turing-NLG 系列）；某团队 70B 全参数训练 512 卡：ZeRO-1 放不下（每卡 16Ψ/N 外还要完整参数+激活），ZeRO-3+optimizer offload 放下且 MFU 38%。

踩坑与 tradeoff：ZeRO-3 下 weight 是分片的——权重初始化、LoRA merge、checkpoint 保存任何"直接读完整 weight"的操作都必须显式 Gather，忘 Gather 保存会存出 1/N 的残片模型；stage 越高通信越重，跨机带宽差的集群 ZeRO-3 比 ZeRO-1 慢 30%+；offload 到 CPU 后 PCIe/NVMe 成瓶颈，pin_memory 必开，NVMe offload 只对超大模型值得；与梯度累积组合时 ZeRO-2/3 的 ReduceScatter 每个 micro-step 都发生，累积省通信的收益打折；碎小层（大量小 Linear）AllGather 次数爆炸，调大 bucket 合并。`,
    keyPoints: ["1 切优化器/2 切梯度/3 切参数，显存 4x/8x/Nx", "baseline 16Ψ 字节，ZeRO-3 通信是 DDP 的 1.5 倍", "ZeRO-3 读权重必须显式 Gather，否则存出残片"],
    followUps: ["ZeRO-Offload 与 ZeRO-Infinity 的瓶颈分别在哪？", "为什么 ZeRO-3 不适合与张量并行混用在同一维度？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-348",
    nodeId: "ai-distributed-training",
    question: "FSDP 的分片策略（FULL_SHARD / SHARD_GRAD_OP / HYBRID_SHARD）怎么选？auto_wrap 粒度为什么是命门？",
    answer: `结论：FSDP 是 PyTorch 原生 ZeRO-3：把模型按 FSDP unit（通常每个 transformer block 一个 unit）分片到所有 rank，计算到某 unit 时 AllGather 出完整参数→前向→释放非本地分片；反向再 AllGather 一次+ReduceScatter 梯度。分片策略对照：FULL_SHARD（参数+梯度+优化器状态全切=ZeRO-3）；SHARD_GRAD_OP（切梯度+优化器状态=ZeRO-2）；NO_SHARD（=DDP）；HYBRID_SHARD（节点内全切、节点间只做梯度同步——8 卡 NVLink 内 AllGather 便宜，跨机只付一次 AllReduce，是千卡集群的甜区策略）。关键旋钮：backward_prefetch=BACKWARD_PRE（反向算当前 unit 时提前 AllGather 下一个，掩盖通信）、forward_prefetch、limit_all_gathers（限制并发 AllGather 防显存尖峰）、cpu_offload（参数闲置时放 CPU，再省一档但慢 20-40%）、use_orig_params=True（才能配 torch.compile、支持部分参数冻结）。

\`\`\`python
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp import ShardingStrategy, BackwardPrefetch
from torch.distributed.fsdp.wrap import transformer_auto_wrap_policy
import functools
policy = functools.partial(transformer_auto_wrap_policy,
                           transformer_layer_cls={DecoderBlock})
model = FSDP(model, auto_wrap_policy=policy,
             sharding_strategy=ShardingStrategy.HYBRID_SHARD,
             backward_prefetch=BackwardPrefetch.BACKWARD_PRE,
             use_orig_params=True, device_id=torch.cuda.current_device())
\`\`\`

实际案例：Meta LLaMA 全系用 FSDP 训练；某团队 30B 模型 128 卡跨机 FULL_SHARD，AllGather 打满 IB 带宽 MFU 仅 30%，切 HYBRID_SHARD 后 MFU 47%。

踩坑与 tradeoff：auto_wrap 粒度是命门——包太细（每个 Linear 一个 unit）AllGather 次数爆炸、通信全是小消息；包太粗（整个模型一个 unit）退化成 DDP 没有省显存效果，正确粒度=每个 transformer block；sharded checkpoint 保存的是各 rank 分片，直接 torch.save 拿残片，要用 FullStateDictConfig（小模型）或 distributed checkpoint（大模型）；FSDP 与 activation checkpointing 组合时注意重计算必须发生在 AllGather 之后，否则重算时参数已释放、再 AllGather 一次白付通信；混合精度配 MixedPrecision(param_dtype=bf16, reduce_dtype=bf16)，FP32 通信稳但带宽翻倍；frozen base weight（LoRA 场景）也要被 shard，否则单卡放不下。`,
    keyPoints: ["FULL=ZeRO-3、SHARD_GRAD_OP=ZeRO-2、HYBRID 是千卡甜区", "auto_wrap 按 transformer block 切，过细过粗都崩", "backward_prefetch 掩盖 AllGather，sharded ckpt 不能裸 save"],
    followUps: ["HYBRID_SHARD 的节点内/节点间通信量各是多少？", "FSDP 与 TP 组合时谁在内层、为什么？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-349",
    nodeId: "ai-distributed-training",
    question: "张量并行（TP）在 Transformer 里具体怎么切？为什么 MLP 先列切再行切可以只通信一次？",
    answer: `结论：张量并行把单层权重矩阵切到多卡各算一部分。Megatron-LM 的经典切法：MLP（h→4h→h 两个线性层 Y=GeLU(XA)B）——第一层 A 按列切（每卡算 4h/N 个神经元），第二层 B 按行切（每卡只吃自己那 4h/N 维输入、输出部分和），中间零通信！数学原理：列切后 GeLU 是逐元素操作可直接过；行切矩阵乘 Y=Σᵢ XᵢBᵢ 天然是"各部分积求和"，最后 AllReduce 一次即得完整结果。Attention 同理：Q/K/V 按 head 切（每卡 h/N 个头各自算 attention），输出投影 O 按行切，一次 AllReduce。整个 block 前向仅 2 次 AllReduce（attention 一次、MLP 一次），反向各一次共 4 次/层——数学上严格等价无近似，但通信发生在每层计算的关键路径上、无法 overlap，所以 TP 对带宽极敏感：只敢在 NVLink 节点内做（8 卡 600-900GB/s），TP 跨机必死。embedding 按 vocab 维切，LayerNorm/dropout 不切（sequence parallel 把它们沿序列维切进一步省）。

\`\`\`python
# 概念实现（torch.distributed 已就绪）
class ColumnParallelLinear(nn.Module):      # A：列切，零通信
    def forward(self, x):
        return F.linear(x, self.weight)     # weight: (out/N, in)
class RowParallelLinear(nn.Module):         # B：行切，一次 AllReduce
    def forward(self, x_shard):
        out = F.linear(x_shard, self.weight)  # weight: (out, in/N)
        dist.all_reduce(out)                # 唯一通信点
        return out
\`\`\`

实际案例：LLaMA-70B 训练典型配置 TP=8（节点内）×PP=4×DP=若干；某团队误配 TP=16 跨 2 节点，单步从 1.2s 涨到 3.8s，profile 显示跨机 AllReduce 占 65%。

踩坑与 tradeoff：整除约束——head 数、FFN 维度必须被 TP size 整除；GQA 模型 KV head 数 < TP size 时只能复制 KV head（LLaMA-70B 的 8 个 KV head 配 TP=8 刚好，TP=16 就要复制）；TP 不改数学但改数值（AllReduce 求和顺序不同），跨 TP size 比 loss 曲线有 1e-3 级抖动属正常；TP 组内坏一卡全组停，千卡任务要配热备；与 FSDP/ZeRO 组合时 TP 永远放最内层（节点内），FSDP 在外层，顺序反了通信爆炸；vocab 并行 embedding 的输出要 AllReduce，词表超大时（多语言 256k）这部分通信不可忽略。`,
    keyPoints: ["MLP 列切+行切串联中间零通信，每 block 仅 2 次 AllReduce", "TP 通信在关键路径不可 overlap，只敢节点内 NVLink", "head/FFN/KV head 整除约束决定 TP 上限"],
    followUps: ["sequence parallel 在 TP 基础上又省了什么？", "为什么 TP 跨机后性能是断崖式而非线性下降？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-350",
    nodeId: "ai-distributed-training",
    question: "流水线并行（PP）的 bubble 比例怎么算？1F1B 与 interleaved 调度如何压缩 bubble？",
    answer: `结论：PP 把模型按层切成 N 段（stage）每卡一段，micro-batch 在 stage 间流水传递。问题在启动与排空阶段大部分卡空转——bubble。朴素 GPipe 调度（M 个 micro-batch 全前向完再统一反向）bubble 比例=(N-1)/M：8 stage、8 micro-batch 空转 88%！工程解法：①加大 M——bubble 占比线性下降，但 GPipe 要存全部 M 份激活，显存爆炸；②1F1B 调度（PipeDream-Flush）：稳态阶段每卡交替做"1 前向+1 反向"，激活只需存 N 份（与 M 解耦），bubble 仍是 (N-1)/M 但 M 可以放心开大；③interleaved 1F1B（Megatron v2）：每卡负责的层切成 v 个 chunk 交错分布，bubble 缩到 (N-1)/(vM)，代价是通信量×v；④zero-bubble 调度（2023 后，DeepSeek-V3 采用）：把反向拆成"输入梯度反传"和"参数梯度计算"两段独立调度，用通信和优化器步骤填缝，bubble 理论上压到 0。PP 的通信量很小（只传 stage 边界 hidden states，2·s·b·h 字节/micro-batch），天然适合跨机慢带宽。

\`\`\`python
def bubble_ratio(n_stage, n_micro, v_chunks=1):
    return (n_stage - 1) / (n_micro * v_chunks)
# 8 stage：M=8 → 87%(v=1)；M=64 → 11%；interleaved v=2 → 5.5%
# Megatron 开启交错流水：
# --num-layers-per-virtual-pipeline-stage 5
\`\`\`

实际案例：GPT-3 级训练 PP=12、M 开到数百、interleaved v=2，bubble <10%；某团队 global batch 太小导致 M=N，MFU 只有 22%，加大 batch 把 M 拉到 64 后 MFU 41%。

踩坑与 tradeoff：stage 负载均衡是隐形坑——embedding 层与 LM head 的 FLOPs 分布不均，按层数均切会让首尾 stage 成短板，要按 FLOPs 加权切分；micro-batch size 太小 GPU 吃不满（kernel launch 占比高）、太大激活显存涨，M 与 micro-batch 要联调；重计算拉长前向会让 bubble 窗口同步变大；PP 与 TP 正交互补：TP 节点内、PP 跨机；M 上限受 global batch 约束（M=global_batch/(DP×micro_batch)），小 batch 任务 PP 效率天然受限——这也是预训练用超大 batch 的 infra 原因之一。`,
    keyPoints: ["bubble=(N-1)/M，1F1B 把激活显存与 M 解耦", "interleaved 缩到 (N-1)/(vM)，zero-bubble 拆反向填缝", "PP 通信量最小适合跨机，stage 要按 FLOPs 均衡"],
    followUps: ["zero-bubble 调度把反向拆成哪两段、为什么合法？", "为什么 M 受 global batch 约束、小 batch 任务怎么救？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-351",
    nodeId: "ai-distributed-training",
    question: "千亿模型的 3D 并行拓扑怎么设计？TP/PP/DP 各放哪个维度、背后的带宽逻辑是什么？",
    answer: `结论：3D 并行设计原则一句话：通信越密的并行维度，放带宽越高的物理拓扑上。带宽阶梯：节点内 NVLink 600-900GB/s ≫ 跨机 InfiniBand 约 50GB/s/卡（400Gbps）。三种并行的通信特性：TP 每层 4 次 AllReduce 且在计算关键路径上不可 overlap——必须收在节点内，TP≤8；PP 只在 stage 边界传激活、通信量最小——放跨机最外层；DP/ZeRO 梯度同步通信量大（2M）但可 overlap——放中间层。以 175B、3072 卡为例：TP=8（节点内）×PP=12（跨 12 节点）×DP=32；单卡显存：参数 175B×2B/8(TP)/12(PP)≈3.6GB + 优化器 ZeRO-1 分片≈2GB + 重计算后激活约 10GB，A100-80G 刚好。经验公式：TP 开到头数/8 或 8 封顶；PP=层数/每 stage 2-4 层；剩余全给 DP；DP 维叠 ZeRO-1 省优化器显存（不要再叠 ZeRO-3，与 TP 分片冲突且通信爆炸）。

\`\`\`python
# Megatron-DeepSpeed 启动参数（175B / 3072 卡）
--tensor-model-parallel-size 8       # 节点内
--pipeline-model-parallel-size 12    # 跨机
# DP = 3072 / 8 / 12 = 32 自动推导
--num-layers-per-virtual-pipeline-stage 5
--recompute-granularity selective
--zero-stage 1
--sequence-parallel                  # 省 LayerNorm/Dropout 激活
\`\`\`

实际案例：GPT-3 公开配置 TP=8/PP=12；BLOOM-176B 用 TP=4/PP=12/DP=48（Megatron-DeepSpeed）；某团队 65B 在 256 卡（IB 200G）TP=8/PP=4/DP=8+ZeRO-1，MFU 52%，关掉 sequence parallel 掉到 44%。

踩坑与 tradeoff：拓扑必须对齐物理网络——NCCL 拓扑探测错误把 TP 组跨了交换机直接慢 3 倍，上线前跑 nccl-tests 验证；DP 组越大 AllReduce 效率越高，但 global batch=DP×micro×accum 被迫变大，batch 超 4000 后收敛敏感要调 warmup 与 LR；PP stage 数别超过层数一半，太碎 bubble 压不下来；故障域：千卡任务日均坏 1 卡，TP 组内坏一卡全组停，配热备+每 100 步 checkpoint；弹性训练（torchrun elastic）在 3D 并行下基本不可用——拓扑是编译期固定的，故障恢复靠快速重启+最近 checkpoint，MTBF 决定有效训练时间。`,
    keyPoints: ["通信密度 TP>DP>PP，带宽 NVLink>IB，对号入座", "TP≤8 节点内、PP 跨机最外层、DP+ZeRO-1 中间", "global batch=DP×micro×accum 反推 DP 上限"],
    followUps: ["为什么 ZeRO-3 与 TP 不宜在同一模型维度叠加？", "千卡集群的 MTBF 怎么折算进有效吞吐？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-352",
    nodeId: "ai-distributed-training",
    question: "激活重计算（activation checkpointing）能省多少显存？full 与 selective 粒度怎么选？",
    answer: `结论：反向传播要用前向的中间激活算梯度，所以激活常驻显存——transformer 每层激活≈s·b·h·(34+5·a·s/h) 字节（s=序列长、b=micro batch、h=hidden、a=head 数），注意 s² 项：序列越长 attention 内部激活（softmax 输入/输出）越主导。30B 模型 4k 序列下激活可超过参数+优化器总和。重计算的交换：前向只存 checkpoint 边界（如每层输入），反向时从最近边界重新前向算出中间激活——显存换计算。开销账：重算一次前向≈总时间 +30-40%（前向:反向≈1:2）；显存从 O(L) 层激活降到 O(checkpoint 数)。粒度三档：full（每整层重算，省最多，Megatron uniform 方法）；selective（只重算 attention core 的 s² 项、保留其余激活，开销 <5% 却砍掉序列平方项——Megatron 官方推荐的性价比之王）；none（显存土豪）。序列 ≥4k 时 selective 收益巨大，s² 项占激活 60%+。

\`\`\`python
# Megatron 配置（首选 selective）
--recompute-granularity selective
# 或 full：--recompute-granularity full --recompute-method uniform
#   --recompute-num-layers 1
# PyTorch 原生：
from torch.utils.checkpoint import checkpoint
class Block(nn.Module):
    def forward(self, x):
        if self.training:
            return checkpoint(self._fwd, x, use_reentrant=False)
        return self._fwd(x)
\`\`\`

实际案例：某 13B 全参数微调 A100-40G：不开重计算 OOM，selective 重计算后 micro-batch 从 1 开到 8，吞吐反升 2.1 倍（显存换大 batch 摊薄 kernel launch）；LLaMA-65B 训练 full recompute 省约 60% 激活显存。

踩坑与 tradeoff：use_reentrant=True 的老 API 与 FSDP/DDP 的 hook 冲突（梯度不触发静默错误），必须用 use_reentrant=False；重计算段内的 dropout 等 RNG 操作要保证重算时随机数一致（新版 checkpoint 自动保存 RNG state，手动 fork_rng 是老做法）；与 PP 交互：stage 边界本来就是天然 checkpoint，stage 内再切细粒度；TP 组内每个 rank 存的是同样的激活副本——sequence parallel 把 LayerNorm/Dropout 激活按序列切掉才彻底；收益账要算清：省下的显存如果换不成更大 batch 或更长序列，纯亏 30% 速度——重计算是手段不是目的。`,
    keyPoints: ["每层激活 s·b·h·(34+5as/h)，s² 项随序列主导", "full 省最多+30-40% 开销，selective <5% 砍 s² 项", "省显存必须换成更大 batch/更长序列才算赢"],
    followUps: ["use_reentrant=False 为什么对 DDP/FSDP 是必要的？", "sequence parallel 与重计算如何叠加省激活？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-353",
    nodeId: "ai-distributed-training",
    question: "多机训练的通信量怎么估算？为什么说 AllReduce 的通信时间必须压进计算时间内？",
    answer: `结论：通信估算是分布式训练的基本功。三个原语的通信量（N=rank 数、M=消息字节数）：AllReduce（ring）=2·(N-1)/N·M≈2M——与 N 无关，这是它能扩展到千卡的原因；ReduceScatter=AllGather=(N-1)/N·M≈M。每步通信账：纯 DDP=2·参数量×梯度字节（175B 模型 BF16 梯度=700GB/步）；ZeRO-3/FSDP 每 rank=3·参数字节/N；TP=每 block 4 次×s·b·h；PP=2·边界数×s·b·h。再除有效带宽得时间：700GB 在 400Gbps IB（实测 NCCL 打七折≈42GB/s/卡有效）下 AllReduce≈0.42s/步；算力侧 175B、4M tokens/步的计算≈6·175e9·4e6/(卡数×卡算力）也在 1s 量级——通信与计算同量级，所以必须 overlap：通信时间/计算时间 >0.3 就说明拓扑或并行策略有问题。判断瓶颈流程：nccl-tests 先测硬件基准→DCGM 看 bus bandwidth→nsys 看通信-计算时间线重叠率。

\`\`\`python
def allreduce_time(model_b, bw_gbps_eff, bytes_per_grad=2):
    vol = 2 * model_b * 1e9 * bytes_per_grad      # ring AllReduce 总量
    return vol / (bw_gbps_eff * 1e9 / 8)
# 175B, IB 400G 实测 336Gbps：allreduce_time(175, 336) ≈ 0.42s/步
# ZeRO-3 每 rank：3*175e9*2 / 512卡 / 42GB/s ≈ 0.049s
# 硬件基准：./nccl-tests/build/all_reduce_perf -b 128M -e 4G -f 2 -g 8
\`\`\`

实际案例：某团队 512 卡训 70B MFU 只有 31%，nccl-tests 发现跨机实测带宽只有标称 55%（交换机 4:1 超订），把 DP 组收进同 pod 后 MFU 48%；另一案例梯度通信从 FP32 改 BF16，通信时间减半、loss 曲线无差异。

踩坑与 tradeoff：标称带宽≠有效带宽——NCCL 协议开销+交换机收敛比（fat-tree 1:1 才无阻塞）是采购级大坑；ring 延迟随 N 线性涨（2(N-1) 跳），N>64 后小消息被延迟主导——bucket 合并就是把小消息攒成大消息逼近带宽上限；NVLink 与 IB 是两张网，NCCL 自动按拓扑选通道但 PXN（借道 NVLink 上 IB）开关影响大；通信占比突增通常是某条链路物理降速（光模块老化）——drain 节点重测，别在软件层瞎调；监控三指标：busbw、algbw、通信/计算时间线重叠率。`,
    keyPoints: ["AllReduce≈2M 与卡数无关，ReduceScatter/AllGather≈M", "通信时间/计算时间 >0.3 就要改拓扑或并行策略", "nccl-tests 实测打七折看，超订比是采购级坑"],
    followUps: ["为什么 ring AllReduce 带宽最优但延迟随 N 线性涨？", "NVLS（NVLink SHARP）如何卸载 AllReduce？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-354",
    nodeId: "ai-inference-optimization",
    question: "KV Cache 显存占用怎么精确计算？为什么长上下文推理的 decode 阶段必然变慢？",
    answer: `结论：自回归推理每步要用全部历史 token 的 K/V，不重算就得缓存——KV Cache。显存公式：2(K 与 V)×层数 L×KV head 数 H×head 维度 D×序列长 S×batch B×字节数。以 LLaMA-70B（L=80、GQA 后 KV head=8、D=128、BF16）：单 token=2×80×8×128×2B=327KB，100k 上下文=32GB；一个 4k 请求 batch=32 要 42GB——KV Cache 超越权重成为显存大头。GQA/MQA/MLA 的价值正在此：GQA 把 KV head 从 64 砍到 8（省 8 倍），DeepSeek 的 MLA 把 KV 压成低秩潜向量（省 10 倍+）。decode 变慢的本质：每步要读"全部权重+该请求全部 KV Cache"却只算 1 个 token——纯带宽 bound，KV 越大每步读取量越大，S=100k 时单请求 KV 读取 33MB/步，叠加权重 140GB，TPOT 线性恶化。

\`\`\`python
def kv_cache_gb(n_layer, n_kv_head, head_dim, seq, batch, bytes=2):
    return 2 * n_layer * n_kv_head * head_dim * seq * batch * bytes / 1e9
# LLaMA-70B：kv_cache_gb(80, 8, 128, 4096, 32) ≈ 42.9 GB
# LLaMA-8B(L=32,kv=8,D=128)：4k 单请求 ≈ 0.27GB → 256 并发 ≈ 68GB
# decode 每步读取：权重 140GB + KV 0.33MB×S/请求
\`\`\`

实际案例：某客服 RAG 用 70B+16k 上下文，单卡 A100-80G 只并发 6 路，KV Cache 量化 INT8 后并发 11 路；DeepSeek 靠 MLA 把长上下文 API 成本打到竞对 1/10。

踩坑与 tradeoff：KV Cache 可量化（FP8/INT8，vLLM 支持），检索类任务精度损失 <1% 但数学推理类敏感；滑窗 attention（Mistral SWA）只缓存最近 4k，KV 显存封顶但超长检索能力下降；KV 驱逐策略（H2O、StreamingLLM 保留 attention sink 头部 token）省 5 倍显存但丢信息，长文档 QA 慎用；容量估算别忘 activation 与 CUDA graph 常驻开销：可用并发=(总显存-权重-激活-图开销）/单请求 KV；PagedAttention 解决碎片但 prefill 峰值仍要整块显存，突发长 prompt 会 OOM 在 prefill 而非 decode。`,
    keyPoints: ["KV=2·L·H·D·S·B·bytes，70B 单 token 327KB", "decode 带宽 bound：每步读全权重+全 KV 只算 1 token", "GQA/MLA/KV 量化是长上下文成本三件套"],
    followUps: ["MLA 的低秩压缩为什么比 GQA 更省、代价是什么？", "StreamingLLM 的 attention sink 现象是什么？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-355",
    nodeId: "ai-inference-optimization",
    question: "连续批处理（continuous batching）为什么比静态批处理吞吐高数倍？调度器每个 iteration 做什么？",
    answer: `结论：静态批处理凑够 B 个请求一起跑、全部生成完才放下一批——短板效应致命：同批里 10 token 就结束的请求陪着 2000 token 的请求空转，GPU 气泡 60-80%。连续批处理（Orca 系统 2022 提出，vLLM/TensorRT-LLM 标配）把调度粒度从"请求"降到"迭代"：每生成一步后调度器重新决策——完成的请求立即踢出释放 KV 块、等待队列的新请求立即插入，GPU 永远满载，吞吐实测提升 3-24 倍（vLLM 论文 vs 朴素 HF）。调度核心循环：①显存有余量且有等待请求→执行新请求的 prefill（或 chunked prefill 切一片）；②所有 running 请求各 decode 一步；③结束的释放资源。关键权衡：新请求 prefill 会抢 decode 的算力（TTFT 与 TPOT 互斥），生产上用 max_num_batched_tokens 限制每步总 token 预算，prefill 与 decode 共享预算、按策略分配。

\`\`\`python
from vllm import LLM
llm = LLM(model="Qwen/Qwen2.5-72B-Instruct",
          max_num_seqs=256,             # 同时在飞请求上限
          max_num_batched_tokens=8192,  # 每步 token 预算（prefill+decode 共享）
          enable_chunked_prefill=True,  # 长 prefill 切片防堵 decode
          gpu_memory_utilization=0.92,
          scheduling_policy="fcfs")     # 或 priority 优先级
\`\`\`

实际案例：vLLM 论文 LLaMA-13B 吞吐 24 倍于 HF 朴素方案；某 SaaS 团队 API 后端从静态批切 vLLM 连续批，同卡吞吐 4.2 倍、P99 延迟降 40%。

踩坑与 tradeoff：max_num_seqs 不是越大越好——每请求有块表元数据开销，且 decode kernel 效率在 A100 上 256-512 是甜区；长输出请求"赖着不走"造成新请求饥饿，要配 max_tokens 上限与 priority；突发流量下 prefill 排队让 TTFT 暴涨，根本解法是 prefill/decode 分池；抢占策略：显存不足时 vLLM 可选 swap（KV 换出 CPU）或 recompute（重算 prefill），长 prefill 请求被 recompute 代价极高；流式输出的 flush 频率影响体验与网络开销，按 8-16 token 聚合是常见折中；监控要分 P50/P99：连续批处理下 P99 TTFT 常被个别长 prefill 打爆。`,
    keyPoints: ["调度粒度从请求降到迭代，完成即踢、有空即插", "max_num_batched_tokens 是 TTFT 与 TPOT 的分配阀", "吞吐 3-24 倍，但 P99 TTFT 需专门治理"],
    followUps: ["chunked prefill 的片长怎么定？", "swap 与 recompute 两种抢占策略各适合什么负载？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-356",
    nodeId: "ai-inference-optimization",
    question: "PagedAttention 的块表（block table）如何管理 KV 显存？为什么浪费能从 60-80% 降到 4% 以下？",
    answer: `结论：朴素 KV Cache 按"最大长度"为每请求预分配连续显存：标称 max 2048 实际平均只生成 300，预分配的 85% 闲置；长度不一的 buffer 还造成外部碎片——vLLM 实测朴素方案浪费 60-80%。PagedAttention 借 OS 虚拟内存思想：KV Cache 切成定长块（block，默认 16 token/块）按需分配，逻辑块号经 block table 映射到物理块——请求逻辑连续、物理离散；beam search/多采样/共享系统 prompt 的前缀块直接 copy-on-write 共享。浪费只剩最后一个块的部分空间（<4%）。attention kernel 改写为按块表 gather 读取后计算。收益：同卡并发 2-4 倍、吞吐 2-4 倍。块大小的 tradeoff：块大→尾部浪费多但块表小、kernel 连续读长；块小→管理开销大；16 是实验甜区。

\`\`\`python
from vllm import LLM, SamplingParams
llm = LLM(model="meta-llama/Llama-3.1-8B", block_size=16,
          enable_prefix_caching=True)    # 系统 prompt 块级共享
sp = SamplingParams(n=8, temperature=0.9)  # n=8 多采样共享 prompt KV 块
# 块数查看：engine 的 cache_config.num_gpu_blocks
\`\`\`

实际案例：vLLM 论文：LLaMA-13B 的 KV 浪费从 60-80% 降到 <4%，吞吐 2-4 倍；某对话产品 2k 固定系统 prompt 开 prefix caching 后该部分 KV 全部跨请求共享，等效多塞 30% 并发。

踩坑与 tradeoff：块表 gather 多一次间接寻址，短序列下 PagedAttention 比连续 KV 慢 3-5%——长序列+大 batch 才赚回；prefix 复用要求前缀逐 token 严格一致，一个 token 差异整块失配——prompt 模板必须把静态内容放最前、动态内容（时间戳/uuid）放最后；块大小与 CUDA graph 捕获形状耦合，改 block_size 要重新 capture；swap 抢占按块换出，长请求被多次 swap 后 TTFT 尾延迟恶化；多 LoRA 场景 KV 可按前缀共享但权重不共享，权重切换成本另算；块表本身是 CPU 侧数据结构，超高并发（>1k seqs）下调度器 CPU 开销成为新瓶颈。`,
    keyPoints: ["定长块+块表映射=KV 版虚拟内存，浪费 <4%", "前缀块 copy-on-write 共享：多采样/系统 prompt 白赚", "block_size=16 是碎片与管理开销的甜区"],
    followUps: ["prefix caching 的失配边界为什么按块粒度对齐？", "为什么超高并发下调度器 CPU 会成为瓶颈？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-357",
    nodeId: "ai-inference-optimization",
    question: "TTFT 与 TPOT 分别由什么决定？为什么 prefill 是算力瓶颈、decode 是带宽瓶颈？",
    answer: `结论：LLM 推理体验由两指标定义：TTFT（首 token 延迟）=排队+prefill 时间，决定"响应快不快"；TPOT（每输出 token 间隔）=decode 单步时间，决定"生成流不流畅"。瓶颈本质对偶：prefill 阶段 S 个 prompt token 并行过模型，FLOPs=2×参数量×S——算力 bound，70B 模型 2k prompt 在 A100（312TFLOPS FP16，有效打五折）≈0.9s；decode 阶段每步读全部权重（70B BF16=140GB）+全部 KV 只为 batch 个 token 算一遍——带宽 bound，TPOT≈权重点节数/HBM 带宽=140GB/2TB/s≈70ms（batch 小到中等时）。优化方向因此对偶：TTFT 靠堆算力（TP 切 prefill）、prefix cache 跳过重复 prefill、chunked prefill；TPOT 靠减字节（W4/W8 量化、GQA/MLA 减 KV）、加带宽（HBM 更大的卡）、加 batch 摊薄权重读取（连续批处理——batch 翻倍吞吐近似翻倍而 TPOT 只涨 10-20%）。产品及格线：聊天 TTFT<1s、TPOT<50ms；agent 场景总时延=TTFT+TPOT×输出长度，长输出更要压 TPOT。

\`\`\`python
def ttft(params_b, prompt_len, eff_tflops):        # 有效算力打 5 折现实
    return 2 * params_b * 1e9 * prompt_len / (eff_tflops * 1e12)
def tpot(params_b, bytes_per_w, hbm_tbps):
    return params_b * bytes_per_w / (hbm_tbps * 1e3)
# 70B BF16 A100(2TB/s)：tpot ≈ 70ms；W4A16 → ≈35ms+反量化开销
# 2k prompt prefill：ttft(70, 2000, 150) ≈ 1.9s
\`\`\`

实际案例：某代码助手要求 TTFT<500ms：4k prompt 单卡 prefill 2.4s 不达标，8 卡 TP 后 0.3s 达标；DeepSeek API 用 MLA+PD 分离把 TPOT 压到 30ms 级。

踩坑与 tradeoff：batch 与 TPOT 的权衡是核心商业决策——延迟敏感产品（对话）限 batch、成本敏感（离线摘要）拉满；监控必须分 P50/P99：P99 TTFT 常被长 prefill 打爆、P99 TPOT 被抢占事件打爆；测速要带真实流量分布（burst 与匀速差异巨大）；TTFT 还含网关排队与调度开销，引擎外排队经常是大头——别只盯 GPU；MoE 模型的 TPOT 不能按激活参数估，要按"被激活专家的字节读取"估。`,
    keyPoints: ["TTFT=算力 bound，TPOT=带宽 bound，优化方向对偶", "TPOT≈权重字节/HBM 带宽，量化是最直接的压法", "batch 是吞吐与延迟的总阀门：翻倍吞吐 TPOT 只涨 10-20%"],
    followUps: ["为什么 decode 加大 batch 能把 GEMV 变成 GEMM？", "MoE 模型的 TPOT 估算与稠密模型差在哪？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-358",
    nodeId: "ai-inference-optimization",
    question: "Chunked prefill 与 prefill/decode 分离（PD 分离）分别解决什么问题？架构趋势是什么？",
    answer: `结论：连续批处理有个内伤：新请求的长 prefill（8k token）一步吃掉全部 token 预算，整批 decode 被堵一步——所有在线用户 TPOT 毛刺。两个互补解法：Chunked prefill（Sarathi-Serve 提出）：把长 prefill 切成 512-2048 token 的片，每步调度把"若干 decode+一片 prefill"混在同一批跑满预算，prefill 不再独占——TPOT 毛刺消失，代价是 prefill 总时长略增（片间 kernel 效率略降）；PD 分离（DistServe/Splitwise/Mooncake 路线）：物理分池——prefill 节点（高配算力）算完 KV 经 RDMA/NVLink 传给 decode 节点（高配带宽），各自独立扩缩容、独立调 batch 策略，彻底消灭 prefill-decode 干扰，还能按负载特性买卡。KV 传输成本：70B 模型 4k 上下文 KV≈1.3GB，400Gbps RDMA≈26ms——远小于 prefill 时间（秒级）就稳赚。架构趋势：chunked prefill 已是 vLLM 默认；大流量生产系统（Kimi 的 Mooncake、DeepSeek）都走 PD 分离+KV cache 中心化存储。

\`\`\`python
# vLLM：chunked prefill（0.6+ 默认开启）
llm = LLM(model="...", enable_chunked_prefill=True,
          max_num_batched_tokens=4096)   # prefill 片长从该预算扣
# PD 分离部署（vLLM v1 / SGLang 架构）
# prefill 实例：--disaggregation-mode prefill --kv-transfer-config nixl
# decode  实例：--disaggregation-mode decode
\`\`\`

实际案例：Mooncake 承载 Kimi 千万级请求，论文报告吞吐 +75%、SLO 达标率大幅提升；某团队 8k 平均 prompt 场景开 chunked prefill 后 TPOT P99 从 400ms 降到 95ms。

踩坑与 tradeoff：chunked 片长是调出来的——太短 kernel 效率掉、太长毛刺回来，经验值=max_num_batched_tokens 的 1/2~1/4；PD 分离对短 prompt（<500 token）收益小甚至为负（传输开销>干扰收益），长 prompt 混合负载才值得；分离架构运维复杂度翻倍：两套池子、KV 传输层故障域、容量配比（prefill:decode 卡数比随业务 prompt/输出长度比定，经验 1:2~1:4）；跨节点 KV 传输必须 GPUDirect RDMA 直通，走 CPU bounce 延迟翻 3 倍；会话亲和性：多轮对话的 decode 最好固定在持有其 KV 的节点。`,
    keyPoints: ["chunked prefill 消灭 TPOT 毛刺，PD 分离消灭资源互扰", "KV 传输 26ms 级 vs prefill 秒级，分离稳赚", "容量配比 1:2~1:4，短 prompt 场景不值得分离"],
    followUps: ["Mooncake 的 KV cache 中心化存储解决什么一致性问题？", "为什么 PD 分离后 decode 池可以开更大的 batch？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-359",
    nodeId: "ai-inference-optimization",
    question: "Prefix Cache（前缀缓存）的命中原理与收益？RadixAttention 为什么更适合多轮对话？",
    answer: `结论：Prefix Cache（vLLM 称 APC）：KV Cache 按 token 前缀哈希建索引，新请求前缀若命中已缓存块，直接复用、跳过该段 prefill——命中部分成本归零，TTFT 近似正比于"未命中长度"。SGLang 的 RadixAttention 更进一步：用 radix tree（基数树）组织全部 KV，节点=token 序列分片、共享边=共享前缀，多轮对话的历史天然长在同一个树分枝上，支持 LRU 驱逐与跨请求细粒度共享（vLLM 是块级精确匹配，radix 是树结构部分匹配）。高命中场景：①固定系统 prompt（客服 bot 的 2k 人设+工具定义，100% 命中）；②多轮对话（第 n 轮复用前 n-1 轮全部 KV，省 50-80% prefill）；③RAG 同文档多问题（文档块前缀命中）；④agent few-shot 模板。零命中场景：每请求 prompt 全变（纯续写 API），缓存纯属浪费显存。

\`\`\`python
# vLLM 一行开启（块级哈希匹配）
llm = LLM(model="...", enable_prefix_caching=True, block_size=16)
# SGLang：RadixAttention 默认开启，多轮对话自动复用
# 第1轮 [sys|u1] → 全量 prefill；第2轮 [sys|u1|a1|u2] → 仅 u2 未命中
# 命中率监控指标：vllm:prefix_cache_hits / vllm:prefix_cache_queries
\`\`\`

实际案例：某客服系统 1.8k 固定系统 prompt+平均 200 token 用户输入：开 prefix cache 后 TTFT 从 900ms 降到 120ms，等效吞吐 ×3；SGLang 论文多轮对话场景 RadixAttention 吞吐 ×5。

踩坑与 tradeoff：前缀必须逐 token 严格一致——模板开头放变动的时间戳/uuid 整棵树失配，动态内容永远放 prompt 尾部；块粒度对齐：vLLM 按 16 token 块匹配，前缀长度非 16 倍数时尾巴小段浪费；缓存占显存挤压在飞请求的 KV 空间，要配容量上限+LRU 驱逐；多 LoRA/多模型共卡时缓存按 (model, lora, tokens) 键隔离；安全面：多租户共享前缀缓存有跨租户串话风险，生产按租户 namespace 隔离；命中率监控是必备——上线后命中率 <30% 说明 prompt 模板设计有问题（动态内容位置不对）。`,
    keyPoints: ["前缀哈希命中即跳过 prefill，TTFT∝未命中长度", "RadixAttention 树结构部分匹配，多轮对话收益最大", "动态内容放 prompt 尾部，命中率 <30% 是模板事故"],
    followUps: ["radix tree 的 LRU 驱逐与 vLLM 块级驱逐粒度差异？", "多租户场景 prefix cache 如何做 namespace 隔离？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-360",
    nodeId: "ai-inference-optimization",
    question: "MoE 模型推理的专家并行（EP）怎么做？为什么 MoE decode 必须开大 batch 才划算？",
    answer: `结论：MoE 推理的算盘：总参数巨大（DeepSeek-V3 671B）但每 token 只激活 top-k 专家（37B 激活）——算力省 18 倍，但全部专家权重都得驻显存；且 decode 是带宽 bound：batch 内不同 token 路由到不同专家，最坏情况每步读遍全部专家=671GB——MoE decode 的带宽压力并不比稠密模型小！解法组合拳：①专家并行 EP：256 个专家切到 N 卡每卡 256/N 个，token 按路由 All-to-All 发送到对应卡、算完再 All-to-All 回来——通信换显存与带宽（每卡只读自己专家的权重）；②大 batch 摊薄：batch 足够大时全部专家都被激活、总读取=全权重，但均摊到每 token 的成本=1/batch——这就是"MoE 推理必须开大 batch"的第一性原因，与连续批处理天然互补；③混合量化：热专家 FP8、冷专家 INT4；④专家卸载：冷专家放 CPU/NVMe 按需加载（DeepSeek 推理方案之一）。

\`\`\`python
# vLLM / SGLang 跑 DeepSeek-V3 的典型配置
llm = LLM(model="deepseek-ai/DeepSeek-V3",
          tensor_parallel_size=8,
          enable_expert_parallel=True,   # EP 与 TP 组合
          quantization="fp8",            # 官方 FP8 checkpoint
          max_num_seqs=256)              # 大 batch 摊薄专家读取
# All-to-All 通信量 ≈ 2 × tokens × hidden × bytes / 步
\`\`\`

实际案例：DeepSeek 官方推理系统大规模 EP（数百卡）+大 batch decode，H800 集群每卡吞吐 3 倍于同激活参数的稠密模型；某团队 8 卡 EP 跑 Mixtral 8x7B，batch=128 时吞吐是 TP-only 的 1.8 倍。

踩坑与 tradeoff：负载不均再版——路由倾斜时热专家所在卡成瓶颈，推理期没有 aux loss 调节，靠冗余专家部署（热专家复制多份）或路由 clamp；All-to-All 对对分带宽敏感，EP 组最好收在 NVLink 域内（EP≤8-16），跨机 EP 要求 IB 对分带宽 1:1；小 batch 场景 MoE 劣势明显（读遍专家摊不薄）——端侧/低并发 API 别选 MoE；显存规划按总参数而非激活参数：671B 的 MoE 再省算力也得 16 卡起步；专家并行与 TP 的组合维度要对齐网络拓扑，All-to-All 放 NVLink、TP AllReduce 也放 NVLink 时带宽会互相挤占。`,
    keyPoints: ["算力省 18 倍但带宽压力不减，decode 最坏读遍全专家", "EP=All-to-All 换显存带宽，大 batch 是摊薄的总开关", "低并发场景 MoE 劣势，显存按总参数规划"],
    followUps: ["冗余专家部署的路由改写怎么做？", "MoE 的 All-to-All 与 TP 的 AllReduce 在 NVLink 上如何争带宽？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-361",
    nodeId: "ai-inference-optimization",
    question: "推理框架选型：vLLM / SGLang / TensorRT-LLM / TGI 各自适合什么场景？",
    answer: `结论：四大主流框架定位差异明确：vLLM——生态位之王：PagedAttention 发源地，模型覆盖最全（新模型周内支持），continuous batching+chunked prefill+prefix cache+PD 分离特性全，Python 友好，通用默认选择；SGLang——结构化生成与复杂调度之王：RadixAttention 多轮对话缓存最优、约束解码（JSON schema/正则）用压缩 FSM 跳转快 5 倍、前端 DSL 适合 agent 编排，多轮+结构化输出场景吞吐领先 vLLM 20-50%；TensorRT-LLM——NVIDIA 极限性能：手写 kernel+FP8/FP4 量化+in-flight batching，单卡性能常胜 vLLM 10-30%，但新模型适配滞后（平均 2-4 周）、工程链重（C++ 引擎编译+Triton server 部署）；TGI——HuggingFace 官方，hub 生态整合好，但调度与缓存特性落后 vLLM 一代，新项目不推荐。决策树：模型固定+极限性能→TRT-LLM；agent/多轮/结构化输出→SGLang；通用+快速上线+社区支持→vLLM；存量 HF 体系→TGI。

\`\`\`python
# vLLM OpenAI 兼容服务（最常见上线形态）
# python -m vllm.entrypoints.openai.api_server \
#   --model Qwen/Qwen2.5-72B-Instruct --tensor-parallel-size 4 \
#   --enable-prefix-caching --max-num-seqs 256
# SGLang：python -m sglang.launch_server --model ... --enable-radix-cache
# TRT-LLM：trtllm-build 编译引擎 → tritonserver 部署
# 压测工具：genai-perf / vllm bench serve（必须带真实流量分布）
\`\`\`

实际案例：某 agent 平台（JSON 输出+多轮）从 vLLM 迁 SGLang，结构化解码开销降 80%、整体吞吐 +35%；某云厂商用 TRT-LLM+FP8 跑 LLaMA-70B，单卡吞吐比 vLLM 高 22% 但新模型适配平均滞后 3 周。

踩坑与 tradeoff：benchmark 陷阱——厂商数据都是特定 shape 峰值，必须用自己业务的 prompt/output 长度分布实测；版本迭代极快（vLLM 两周一版），升级要跑精度+性能双基线回归（曾有版本 prefix cache off-by-one 导致输出错乱）；CUDA graph 与 chunked prefill 的兼容坑各框架不同；多模态支持参差（vLLM 最全）；商用授权：vLLM/SGLang/TRT-LLM 均 Apache 2.0 无忧；可观测性是生产红线：没有 TTFT/TPOT/队列深度 Prometheus 指标的框架不上生产；混合部署趋势：网关层按请求特征路由（结构化输出→SGLang 池、通用→vLLM 池）。`,
    keyPoints: ["vLLM 通用默认、SGLang 结构化/多轮、TRT-LLM 极限性能", "TRT-LLM 快 10-30% 但新模型适配滞后数周", "压测必须带真实流量分布，升级跑双基线回归"],
    followUps: ["SGLang 的压缩 FSM 约束解码为什么快 5 倍？", "生产环境混合部署（多框架共池）的路由策略怎么设计？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-362",
    nodeId: "ai-cuda-gpu",
    question: "GPU 线程层次（grid/block/warp/thread）与 SM 架构是什么？为什么 occupancy 决定性能下限？",
    answer: `结论：GPU 与 CPU 设计哲学相反：CPU 用大缓存+复杂控制求单线程低延迟，GPU 把晶体管全堆 ALU 求吞吐——H100 有 132 个 SM（流多处理器），每 SM 128 个 FP32 核。线程三级层次：grid（整个 kernel）→block（线程块，≤1024 线程，调度到一个 SM，块内可共享 shared memory 与同步）→thread；硬件执行单位是 warp（32 线程锁步执行同一指令，SIMT 模型）。两个核心推论：①warp 分歧（divergence）——同 warp 线程走不同分支时硬件串行执行各路径再合并，性能腰斩，写 kernel 要让同 warp 线程走同路径；②occupancy（占用率）=每 SM 常驻 warp 数/上限，受 block 线程数、寄存器用量、shared memory 用量三者制约。GPU 没有大缓存，靠"某 warp 等内存时切换执行其他 warp"隐藏延迟——occupancy 太低延迟藏不住，算力利用率崩塌：延迟隐藏靠并发而不是缓存，这是 GPU 编程的第一性原理。

\`\`\`python
# Nsight Compute 看 occupancy 与 stall 原因：
# ncu --metrics sm__warps_active.avg.pct_of_peak_sustained_active,\
#smsp__average_warp_latency_issue_stalled_long_scoreboard python bench.py
# PyTorch 侧粗验：elementwise kernel 的带宽利用率 <50% 多半是 occupancy 问题
import torch
x = torch.randn(1 << 26, device="cuda")
torch.cuda.synchronize(); %timeit x.relu_()   # 对比理论带宽时间
\`\`\`

实际案例：某团队自定义 LayerNorm kernel 用 1024 线程/block+每线程 64 寄存器，occupancy 仅 25%、带宽利用率 40%；改 256 线程+寄存器压到 32 后 occupancy 75%、带宽利用率 82%，LayerNorm 耗时减半。

踩坑与 tradeoff：block size 取 128-256 通常最优（32 的倍数、SM 可同时放多个 block 互补）；__syncthreads() 在分歧分支里调用=死锁；warp shuffle（__shfl_sync）做 warp 内归约比 shared memory 快且不占资源；occupancy 不是越高越好——ILP（指令级并行）高的 kernel（如 GEMM）低 occupancy 也能满算力；新手别急着手搓 kernel：先 profile 确认瓶颈真在 kernel——90% 的"PyTorch 慢"是 Python 端开销、H2D 拷贝、kernel launch 间隙，不是 kernel 本身。`,
    keyPoints: ["warp 32 线程锁步，分歧=串行执行各路径", "occupancy 受寄存器/shared memory/线程数三制约", "延迟隐藏靠 warp 切换并发，不靠缓存"],
    followUps: ["为什么 GEMM 在 30% occupancy 下也能打满算力？", "寄存器溢出（spill）怎么发现与消除？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-363",
    nodeId: "ai-cuda-gpu",
    question: "GPU 内存层次（register/shared/L2/HBM）各有什么特性？为什么 shared memory 是 kernel 优化主战场？",
    answer: `结论：GPU 内存是陡峭金字塔：寄存器（每 SM 256KB，零额外延迟）→shared memory（每 SM 最高 228KB 可配，约 20-30 周期，block 内共享、程序员手动管理）→L2（全卡 50MB，约 200 周期）→HBM 全局显存（80GB、3.35TB/s、约 500 周期）。H100 算力 989 TFLOPS vs 带宽 3.35TB/s，机器平衡点≈295 FLOP/字节——数据复用率低于这个数的 kernel 必然带宽 bound，优化本质就是把数据往金字塔上层搬、提高复用。shared memory 是主战场：它是唯一程序员可控的片上缓存，GEMM/attention 的 tiling 全靠它。两大坑：bank conflict——shared memory 分 32 个 bank，同 warp 32 线程访问同 bank 不同地址会串行化（差 32 倍），解法是 padding（行尾+1 错开 bank）；coalescing——warp 的 32 次全局内存访问要落在连续 128 字节内才合并成一次事务，stride>1 的散乱访问带宽打 1/32。

\`\`\`python
# bank conflict 经典例：tile[32][32] 按列读 stride=32 → 全落同 bank 串行 32 拍
# padding 成 tile[32][33]：stride=33，33%32 打散 → 无冲突
# coalescing 验证（PyTorch 层）：
x = torch.randn(4096, 4096, device="cuda")
x[:, ::2].sum()      # stride=2：带宽利用率约减半
# ncu --metrics l1tex__t_sectors_pipe_lsu_mem_global_op_ld.sum 看合并度
\`\`\`

实际案例：某团队手写转置 kernel 朴素实现 180GB/s，加 shared memory tiling+padding 后到 1.4TB/s（A100 峰值的 70%）；FlashAttention 的本质就是把 s×s 得分矩阵挡在 SRAM 层不落 HBM。

踩坑与 tradeoff：shared memory 与 L1 共用物理 SRAM（carveout 可调），开大 shared 就压缩 L1，算子要试配；shared memory 用量直接卡 occupancy（每 SM 总量固定，单 block 用得多→并发 block 少）；寄存器溢出（local memory spill）会偷偷走 HBM——编译加 -Xptxas -v 看 spill 计数，>0 就要减每线程工作量；PyTorch 的 contiguous()/transpose 性能问题本质是 coalescing，channels_last 对卷积就是这个原理；H100 的 TMA（Tensor Memory Accelerator）硬件异步搬数，Triton/CUTLASS 已接入，手写 cp.async 的必要性在下降。`,
    keyPoints: ["金字塔：寄存器<SMEM<L2<HBM，延迟 0/30/200/500 周期", "bank conflict 串行 32 倍，padding 错开；coalescing 合并 128B", "SMEM 用量 ↔ occupancy，spill 会偷走 HBM 带宽"],
    followUps: ["TMA 相比 cp.async 解放了什么硬件资源？", "为什么转置 kernel 是 bank conflict 的经典考场？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-364",
    nodeId: "ai-cuda-gpu",
    question: "Roofline 模型怎么判断 kernel 是算力瓶颈还是带宽瓶颈？arithmetic intensity 怎么算？",
    answer: `结论：Roofline 一句话：kernel 性能=min（峰值算力，带宽×arithmetic intensity）——算术强度 AI（FLOPs/访问字节数）决定你踩在哪片屋顶。AI<机器平衡点（H100≈295 FLOP/B、A100≈160）→带宽 bound（屋顶斜坡段），优化方向是减字节（量化、融合、tiling 提复用）；AI>平衡点→算力 bound（平顶段），优化方向是提算力利用率（Tensor Core、减分歧、提 occupancy）。典型 kernel 的 AI：elementwise（add/relu）≈0.25-1 FLOP/B——永远带宽 bound，优化=融合减少往返；LayerNorm/softmax≈10；GEMM（m=n=k=4096）≈K/6≈680——算力 bound，所以 GPU 喜欢大矩阵；decode 阶段的 GEMV（batch=1 的矩阵×向量）AI≈1-2——纯带宽 bound。这就是 LLM decode 慢的第一性解释：不是算不动，是读权重来不及。

\`\`\`python
def roofline(ai, peak_tflops=989, bw_tbps=3.35):   # H100 SXM
    return min(peak_tflops, bw_tbps * ai)
# decode GEMV：AI = 2·P / (P·2B) = 1 → 3.35 TFLOPs（峰值的 0.3%！）
# prefill GEMM（大 batch）：AI 数百 → 算力 bound
# 实测定位（哪个接近 100% 就是谁 bound）：
# ncu --metrics gpu__compute_memory_throughput.avg.pct_of_peak_sustained_elapsed,\
#sm__throughput.avg.pct_of_peak_sustained_elapsed
\`\`\`

实际案例：某团队 decode 慢误以为是算力不足换 H100，TPOT 只降 15%；按 roofline 确认带宽 bound 后改 W4A16 量化（权重字节÷4），TPOT 降 58%；FlashAttention 通过 tiling 复用把 attention 的 AI 拉高，等同把 kernel 从斜坡段拽回平顶段。

踩坑与 tradeoff：AI 要算全字节——权重+激活+KV+中间结果，漏算一项结论反转（比如忘了 KV 读取会把 decode 误判为算力 bound）；理论屋顶≠可达屋顶：kernel 实现差时连斜坡都摸不到，先 ncu 看利用率百分比；batch 是最强的 AI 旋钮——decode 的 GEMV 加大 batch 变 GEMM，AI 线性涨，这是连续批处理提升吞吐的第一性解释；多 kernel 串联要逐段分析，总时间被最带宽 bound 的段主导；量化（FP8/INT4）等效把 AI 提高 2-4 倍（同 FLOPs 字节减半），是带宽 bound 场景的银弹。`,
    keyPoints: ["性能=min(算力, 带宽×AI)，AI 定屋顶区间", "elementwise AI≈1 永远带宽 bound，GEMV 同理", "batch 与量化是提升 AI 的两大旋钮"],
    followUps: ["为什么 W4A16 量化的反量化开销不改变 roofline 结论？", "FlashAttention 把 attention 的 AI 从多少提到多少？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-365",
    nodeId: "ai-cuda-gpu",
    question: "GEMM 优化的三级火箭（tiling/向量化与双缓冲/Tensor Core）分别解决什么？",
    answer: `结论：GEMM（C=A×B）是深度学习的心脏（80%+ FLOPs），其优化是教科书级案例。朴素三层循环 AI≈2，带宽 bound 死。三级火箭：①tiling 分块——把矩阵切成 128×128 的 tile 搬进 shared memory，tile 内数据复用 K 次，AI 提到 tile 边长量级、带宽压力骤降；再切 register tile（每线程算 8×8 微块）寄存器复用第二波；②向量化+双缓冲——float4/128 位加载一次事务搬 16 字节；cp.async/TMA 预取下一块 tile 与当前计算重叠（软件流水线），访存延迟全隐藏；③Tensor Core——HMMA/wgmma 指令一条算 4×4×4 甚至更大的矩阵乘，理论算力是 CUDA core 的 4-15 倍（H100 FP16 989 vs FP32 67 TFLOPS），数据要按 mma fragment 布局重排（ldmatrix 指令）。cuBLAS/CUTLASS 已把三级做到极致（峰值 95%+），自写 GEMM 的意义在融合（GEMM+bias+activation 一个 kernel）与特殊 shape。

\`\`\`python
# Triton 版 GEMM 骨架（tiling 思想的直观体现）
@triton.jit
def matmul_kernel(A, B, C, M, N, K, BLOCK: tl.constexpr):
    pid_m, pid_n = tl.program_id(0), tl.program_id(1)
    rm = pid_m * BLOCK + tl.arange(0, BLOCK)
    rn = pid_n * BLOCK + tl.arange(0, BLOCK)
    acc = tl.zeros((BLOCK, BLOCK), dtype=tl.float32)
    for k in range(0, K, BLOCK):                     # K 维流水
        a = tl.load(A + rm[:, None] * K + k + tl.arange(0, BLOCK)[None, :])
        b = tl.load(B + (k + tl.arange(0, BLOCK))[:, None] * N + rn[None, :])
        acc += tl.dot(a, b)                          # 自动映射 Tensor Core
    tl.store(C + rm[:, None] * N + rn[None, :], acc)
\`\`\`

实际案例：某团队用 Triton 把"线性层+LayerNorm"融合，省中间激活 HBM 往返，7B 模型 prefill 提速 8%；cuBLASLt 的 epilogue 融合（bias+GELU 在写回时顺手算）是 PyTorch nn.Linear+activation 的实际形态。

踩坑与 tradeoff：小矩阵 GEMM（decode GEMV、小 batch）tile 填不满一个 wave，算力利用率 <20%——小 shape 换 GEMV 专用 kernel 或攒 batch；对齐是隐性杀手：K/N 非 8/16 倍数时向量化失效，LLM 的 vocab 维度常故意 pad 到 128 倍数；Tensor Core 要求 FP16/BF16/FP8/INT8 输入，FP32 要走 TF32（10 bit 尾数）才加速，科学计算注意精度；分块甜区随卡代际变（A100 128×128、H100 128×256），别背参数，用 autotune；自写 GEMM 打 cuBLAS 只在"融合收益>kernel 效率差"时成立，纯 GEMM 别重复造轮子。`,
    keyPoints: ["tiling 提复用→AI 到 tile 边长量级，寄存器再复用一波", "双缓冲隐藏访存延迟，Tensor Core 算力 4-15 倍", "对齐与 wave 量化决定小矩阵 GEMM 效率"],
    followUps: ["为什么 decode 阶段 GEMM 退化成 GEMV、专用 kernel 怎么做？", "wgmma 相比 HMMA 在 H100 上改变了什么编程模型？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-366",
    nodeId: "ai-cuda-gpu",
    question: "FlashAttention 为什么快？IO 感知 tiling 与 online softmax 的数学等价性怎么保证？",
    answer: `结论：标准 attention 的痛点不是 FLOPs 而是内存：QK^T 的 s×s 得分矩阵、softmax 中间量、P·V 都要落 HBM——s=16k 时得分矩阵 1GB（FP16）读写 3 次，带宽打满算力闲置。FlashAttention 是 IO 感知优化的典范：①tiling——Q/K/V 按块（128×128）加载进 SRAM，在片上完成该分块的 QK^T→softmax→PV 全程，永不实例化完整 s×s 矩阵，HBM 访问量从 O(s²) 降到 O(s²·d²/M)（M=SRAM 大小），实测 IO 省 10-20 倍；②online softmax——分块算 softmax 时维护 running max m 与 running sum ℓ（Milakov-Gimelshein 技巧）：新块到来时历史累加乘 exp(m_old−m_new) 修正再合并，最终 ℓ 归一化——数学上与一次性 softmax 严格等价；③反向重计算：不存 s×s 注意力矩阵，用保存的 softmax 统计量（m、ℓ）在反向时重算，省显存多花约 20% FLOPs。结果：2-4 倍加速、显存 O(s²)→O(s)，长上下文训练成为可能。FA2 优化 warp 分工与序列维并行；FA3 针对 H100 用 TMA+wgmma 异步+FP8。

\`\`\`python
# PyTorch 2.x 一行启用（SDPA 自动路由 FA2/内存高效/cuDNN 后端）
import torch
with torch.nn.attention.sdpa_kernel(torch.nn.attention.SDPBackend.FLASH_ATTENTION):
    out = torch.nn.functional.scaled_dot_product_attention(q, k, v, is_causal=True)
# 变长 batch：from flash_attn import flash_attn_varlen_func（免 padding）
\`\`\`

实际案例：LLaMA-2 训练全程 FA2，官方数据训练吞吐 ×2；某团队 32k 长文微调标准 attention OOM（得分矩阵 4GB/层），FA2 后显存降 76%、step 快 2.8 倍。

踩坑与 tradeoff：head_dim 支持有限（FA2≤256），GQA 的 KV 维度对齐注意；dropout、自定义 attention bias、特殊 mask 支持不全，退回 memory-efficient 后端性能打折；online softmax 与标准实现有 1e-5 级数值差，RLHF 等敏感场景观察 reward 抖动；FA 只优化 attention core，QKV/O 投影 GEMM 另算；seq<512 优势不明显（调度开销盖过收益）；变长 batch 必须用 varlen 版本，padding 到等长纯属浪费——batch 内长度方差大时收益可达 2 倍。`,
    keyPoints: ["tiling 把 s×s 矩阵挡在 SRAM，HBM IO 降 10-20 倍", "online softmax：running max/sum+exp 修正，严格等价", "反向重算省显存，FA2/FA3 持续压榨硬件"],
    followUps: ["online softmax 的修正公式推导？", "FA3 的 pingpong 调度如何重叠 GEMM 与 softmax？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-367",
    nodeId: "ai-cuda-gpu",
    question: "算子融合为什么重要？TorchInductor 自动融合与 CUDA Graph 分别消灭什么开销？",
    answer: `结论：GPU kernel 有两类固定成本：launch 开销 5-10μs/个，以及中间结果的 HBM 往返——elementwise 链（x→relu→add→mul）每个算子把全程数据读写一遍，带宽白白烧掉。算子融合把多算子编进一个 kernel：中间结果留寄存器/shared memory，省掉 N-1 次 HBM 往返，elementwise 序列融合后提速常见 3-5 倍。三个层次：①手工融合（FlashAttention、cuBLASLt epilogue：GEMM+bias+activation）；②编译器自动融合——torch.compile 的 TorchInductor 把 FX graph 的 pointwise/reduction 子图生成 Triton kernel，epilogue/prologue 自动并入 GEMM 模板；③调度层——CUDA Graph 把整段 kernel 序列录制成一张图一次提交，消灭 launch 开销与 CPU-GPU 同步间隙（vLLM decode 步标配，小 batch 提速 20%+）。融合可行性规则：pointwise 与 pointwise 随意融；reduction（softmax/LayerNorm）可融前后 pointwise；GEMM 只融 epilogue 与 prologue；存在交叉数据依赖（attention score 依赖全部 K）不能融。

\`\`\`python
import torch
@torch.compile(mode="max-autotune")      # Inductor 自动融合+autotune
def f(x, w, b):
    return torch.relu(torch.addmm(b, x, w) + 1e-5 * x.square().mean())
# 看生成的 Triton kernel：TORCH_LOGS=output_code python x.py
# CUDA Graph 手动录制（推理小 shape 场景）：
g = torch.cuda.CUDAGraph()
with torch.cuda.graph(g):
    static_out = model(static_in)
g.replay()
\`\`\`

实际案例：某推荐模型 60+ 小算子 torch.compile 后融合成 12 个 kernel，推理延迟降 41%；vLLM decode 步 CUDA graph 化后小 batch TPOT 降 18%；Meta 报告 torch.compile 训练平均提速 30-50%。

踩坑与 tradeoff：graph break 是头号敌人——Python 控制流/print/.item() 打断图，融合范围骤缩，用 TORCH_LOGS=graph_breaks 排查；动态 shape 触发重编译（每个新 shape 编一次），服务侧要 shape bucket 或 mark_dynamic；max-autotune 首次编译分钟级，生产要预热+cache dir 挂盘；CUDA Graph 要求输入地址固定（static buffer），数据要 copy_ 进静态张量；数值差异：融合改变归约顺序导致 bitwise 不一致，fp32 累加的 Triton kernel 通常更稳；编译器融合有天花板——attention 这种跨 reduction 的深度融合仍靠 FlashAttention 手写。`,
    keyPoints: ["融合省 N-1 次 HBM 往返，CUDA Graph 消灭 launch 开销", "Inductor 融 pointwise/reduction，GEMM 只融首尾", "graph break 与动态 shape 是生产两大坑"],
    followUps: ["为什么 reduction 算子融合后仍要两次遍历数据？", "CUDA Graph 的 static input 约束如何影响推理框架设计？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-368",
    nodeId: "ai-cuda-gpu",
    question: "Triton 相比手写 CUDA 的优势与局限？block 级编程模型怎么理解？",
    answer: `结论：Triton（OpenAI 开源）是 Python 语法的 GPU kernel DSL，核心抽象换位：CUDA 以"线程"为单位编程（自己算 threadIdx、手动管 shared memory、手动同步），Triton 以"块（block/tile）"为单位——tl.arange/tl.load/tl.dot 操作的都是小张量，编译器自动处理线程映射、shared memory 分配、bank conflict 规避、软件流水线、向量化，还内置 autotune（遍历 BLOCK/num_warps/num_stages 找最优）。效果：熟练者 1 小时写出 cuBLAS 90% 性能的 GEMM、普遍达手写 CUDA 80-95% 性能，开发效率 5-10 倍——这就是 TorchInductor 选它做后端的原因。适用场景：自定义融合算子（RMSNorm+residual、fused RoPE、fused cross-entropy）、研究期新算子（Mamba 的 selective scan 官方实现就是 Triton）、多 shape 需要 autotune 的服务端 kernel。局限：极致性能场景（FA3 级、DeepGEMM 的 FP8 双累加）仍需 CUDA/CUTLASS（Triton 拿不到 TMA/wgmma 全部特性，虽然在追）；调试体验差（报错栈深、printf 调试常态、mask 逻辑错=静默错数据）。

\`\`\`python
import triton, triton.language as tl
@triton.jit
def rmsnorm_kernel(X, W, Y, N, eps, BLOCK: tl.constexpr):
    row = tl.program_id(0)
    cols = tl.arange(0, BLOCK)
    mask = cols < N
    x = tl.load(X + row * N + cols, mask=mask, other=0.0)
    ms = tl.sum(x * x, axis=0) / N
    w = tl.load(W + cols, mask=mask, other=0.0)
    tl.store(Y + row * N + cols, x * tl.rsqrt(ms + eps) * w, mask=mask)
# 生产标配：@triton.autotune(configs=[...], key=["N"])
\`\`\`

实际案例：Unsloth 用 Triton 重写 LLM 训练 kernel（fused RoPE/SwiGLU/CE），LLaMA 微调显存省 40%、速度 ×2；vLLM 的 MoE kernel 与部分 PagedAttention 变体均为 Triton；某团队 30 行 Triton 融合 RMSNorm+residual，端到端训练提速 6%。

踩坑与 tradeoff：小 kernel 不划算——launch 开销与 CUDA 相同，单个 elementwise 别写；block 级思维对新手反直觉，mask 边界条件错=静默错误数据（必须写单元测试对拍 PyTorch 参考实现）；AMD（ROCm）与国产卡适配参差，跨平台项目先验证；版本演进快，pin 版本+回归测试；autotune 的 key 要覆盖生产 shape 分布，否则运行时现 tune 卡顿；最优 config 随 shape 漂移，shape 种类多的服务建议预编译 cache。`,
    keyPoints: ["block 级抽象：编译器管线程映射/SMEM/流水线", "开发效率 5-10 倍，性能达手写 80-95%", "极致场景仍需 CUDA，mask 错=静默错数据必须对拍"],
    followUps: ["Triton 的 num_stages 软件流水线参数在调什么？", "为什么 Mamba 的 selective scan 适合用 Triton 写？"],
    favorited: false,
    bigTech: true,
  },
  {
    id: "ai-369",
    nodeId: "ai-cuda-gpu",
    question: "NCCL 的五个集合通信原语分别对应什么并行场景？Ring 与 Tree 拓扑怎么选？",
    answer: `结论：NCCL 是多卡训练的通信层，五个原语撑起全部并行范式：Broadcast（参数分发）；Reduce（梯度汇总到一根节点）；AllReduce=Reduce+Broadcast——DDP 梯度同步，ring 实现通信量 2M(N-1)/N≈2M 与卡数无关；ReduceScatter=AllReduce 的前半（每卡拿结果的 1/N 分片，ZeRO/FSDP 的梯度同步）；AllGather=后半（FSDP 的参数收集）——后两者组合=AllReduce，但显存语义完全不同：AllReduce 后每卡有全量，RS+AG 后每卡始终只有分片。另有 All-to-All（MoE 专家并行的 token 路由）。拓扑算法：ring（带宽最优、延迟∝N，大消息首选）、tree（延迟∝logN、小消息优）、collnet/SHARP（交换机内计算卸载），NCCL 按消息大小+拓扑自动选择。性能铁律：通信时间=α（延迟）+β·M（带宽项）——小消息被 α 主导（这是梯度分桶合并的原因），大消息逼近带宽上限。实测带宽打七折看：IB 400Gbps 标称 50GB/s，NCCL 实测 busbw≈42-45GB/s；NVLink 900GB/s（H100）实测 700+。

\`\`\`python
import torch.distributed as dist
dist.init_process_group("nccl")
dist.broadcast(t, src=0)                    # 参数分发
dist.all_reduce(t)                          # DDP 梯度同步
dist.reduce_scatter_tensor(out, t)          # FSDP 梯度分片
dist.all_gather_into_tensor(out, t)         # FSDP 参数收集
dist.all_to_all_single(out, t)              # MoE 专家路由
# 硬件排障第一步：nccl-tests
# ./build/all_reduce_perf -b 128M -e 4G -f 2 -g 8
\`\`\`

实际案例：某千卡集群 MFU 从 48% 跌到 31%，nccl-tests 定位两台交换机间链路降速（光模块故障带宽腰斩），drain 更换后恢复；DeepSeek 公开用 NVLS（NVLink SHARP）把节点内 AllReduce 卸载到交换芯片；某团队梯度 AllReduce 从 FP32 改 BF16，单步通信时间 -45%、loss 无可见差异。

踩坑与 tradeoff：虚拟化/容器里 NVLink P2P 可能被禁（NCCL_P2P_DISABLE=1 的应急会让节点内通信慢 5 倍，先查 nvidia-smi topo -m）；异构链路混跑（部分 IB 部分 RoCE）NCCL 按最慢链路对齐；All-to-All 对对分带宽最敏感，fat-tree 超订比>1:1 时 MoE 训练通信爆炸；watchdog 超时是分布式 hang 第一排查点——99% 的 hang 是某 rank 提前异常或 shape 不一致导致的 desync；调试三板斧：NCCL_DEBUG=INFO 看建环拓扑、nccl-tests 跑基准隔离硬件、TORCH_DISTRIBUTED_DEBUG=DETAIL 看 desync 栈。`,
    keyPoints: ["AllReduce≈2M 与卡数无关，RS+AG=AllReduce 但显存语义不同", "ring 带宽优/tree 延迟优，NCCL 按消息大小自动选", "nccl-tests 是排障第一站，实测带宽打七折"],
    followUps: ["SHARP/NVLS 交换机内计算的收益边界在哪？", "All-to-All 为什么对对分带宽最敏感？"],
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