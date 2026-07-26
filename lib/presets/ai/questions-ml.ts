// lib/presets/ai/questions-ml.ts
// AI 算法工程师面试题：机器学习基础（8 节点）
// 从 lib/presets/ai.ts 拆分而来，内容保持不变

import type { Question } from "../../types";

export const ML_QUESTIONS: Question[] = [
  // ===== ai-ml-fundamentals =====

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

  // ===== 2. ai-linear-models =====,

  // ===== ai-linear-models =====

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

  // ===== 3. ai-tree-models =====,

  // ===== ai-tree-models =====

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

  // ===== 4. ai-svm =====,

  // ===== ai-svm =====

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

  // ===== 5. ai-ensemble =====,

  // ===== ai-ensemble =====

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

  // ===== 6. ai-optimization =====,

  // ===== ai-optimization =====

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

  // ===== 7. ai-evaluation =====,

  // ===== ai-evaluation =====

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

  // ===== 8. ai-feature-eng =====,

  // ===== ai-feature-eng =====

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

  // ===== 9. ai-nn-fundamentals =====,


  // ===== 从远程合入：ai-math-foundations =====
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

];
