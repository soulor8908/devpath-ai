// lib/presets/ai/questions-dl.ts
// AI 算法工程师面试题：深度学习（6 节点）
// 从 lib/presets/ai.ts 拆分而来，内容保持不变

import type { Question } from "../../types";

export const DL_QUESTIONS: Question[] = [
  // ===== ai-nn-fundamentals =====

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

  // ===== 10. ai-cnn =====,

  // ===== ai-cnn =====

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

  // ===== 11. ai-rnn =====,

  // ===== ai-rnn =====

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

  // ===== 12. ai-transformer =====,

  // ===== ai-transformer =====

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

  // ===== ai-pretrain =====

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

  // ===== ai-frameworks =====

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
];
