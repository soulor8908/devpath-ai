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

踩坑：ReLU 死亡可降低学习率或用 Leaky/GELU；Sigmoid 梯度消失深网络禁用；ELU 负区间平滑零均值但计算贵。

【举一反三】：ReLU 之于激活函数，类似后端连接池里"无状态"之于会话——把状态依赖剥掉换成线性直通，简单可扩展。GELU/Swish 的"可微平滑"思路也映射到 Attention 里的 softmax 温度：用平滑近似替代硬截断，梯度更友好。前端把硬 if 换成 sigmoid 门控也是同构——可导才能反向传播。

【扣分点对照】：背题者只能说"ReLU 计算快防消失"；真做过的人会答：训练 100 万步后约 5-10% 神经元死亡（可监控 dead_ratio 指标），用 LR 1e-3 + Leaky 0.01 把死亡率压到 <1%，并解释为什么 Transformer 选 GELU 而非 Leaky（GELU 的概率门控更适配 softmax 概率语义）。`,
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

踩坑：BN 依赖 batch，batch=1 推理时必须用 eval 模式；分布式训练用 SyncBN 同步统计；序列模型/小 batch 用 LayerNorm/GroupNorm。

【举一反三】：BN 的"训练用 batch / 推理用 running 统计"模式，和前端构建时"dev 用 source map / prod 用压缩产物"同构——同一套代码两种统计口径，切错就出 bug。GroupNorm/LayerNorm 把"批统计"换成"特征统计"，类似把全局缓存换成请求级缓存，解耦 batch 依赖，类比后端把"全局锁"换成"行级锁"提升并发可用性。

【扣分点对照】：背题者说"BN 加速训练"；真做过的人会答：batch=32 训练 ResNet50 在 CIFAR-10 上 50 epoch 到 93%，线上推理忘切 eval 模式直接用 batch=1 的统计，准确率掉 8 个点（从 93% → 85%），定位半小时才发现是 train/eval 状态没切换；SyncBN 跨卡同步在 8 卡 V100 上通信开销约占训练时间 12%。`,
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

踩坑：BN+Dropout 顺序和位置影响效果；Dropout 过大欠拟合；推理务必 eval 模式否则结果随机。

【举一反三】：Dropout 的"子网络集成"思路在前端有同构——A/B 测试多套 UI 模板取均值防止单模板过拟合某用户群。MC Dropout 多次推理取方差估计不确定性，类比后端用多次请求取分位数（P99）估延迟尾部，都是用"重复采样"换"置信度"。Dropout 概率 p 类似正则化系数 λ，过大欠拟合过小过拟合。

【扣分点对照】：背题者说"Dropout 防过拟合"；真做过的人会答：BERT 微调 GLUE 时 p=0.1 比 0.3 高 0.5 个点，p=0.5 时 val loss 卡在 0.8 不降（欠拟合）；线上推理忘切 eval 模式导致同样输入两次输出 logits 差异 0.3+，A/B 实验显著性全部失效，定位 1 小时；CNN 全连接层用 0.5 但卷积层用 Spatial Dropout 0.1 防特征图整通道失活。`,
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

踩坑：感受野大不代表有效感受野大（中心贡献大）；下采样过多损失细节影响分割；空洞卷积过大有网格效应。

【举一反三】：感受野递推 RFₖ=RFₖ₋₁+(k-1)·∏stride 类似编译器里 AST 深度计算——每层下采样等价于"提一层抽象"，stride 累乘就是抽象层级累乘。前端虚拟 DOM diff 的"层次化区间"也是同构思路：每一层只看局部窗口，深一层看到更大范围。系统设计里"调用链路跨度"的递推公式与之结构相同。

【扣分点对照】：背题者背 RF 公式但说不清有效感受野；真做过的人会答：U-Net 分割在 256×256 输入上把理论 RF 调到 212 才能覆盖整个细胞，浅层 RF 才 80 时边缘 IoU 掉 0.12（从 0.85 → 0.73）；空洞卷积 rate=4 把 RF 撑到 320 但出现网格伪影（grid artifact），需配合渐进式 dilation（1/2/4 而非全 4）或 HDF5 网络缓解；DeepLabv3 用 ASPP 多 rate 并联覆盖不同尺度目标。`,
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

踩坑：梯度消失用 LSTM/GRU/残差/门控解决，梯度爆炸用裁剪解决；序列越长 RNN 越难；Transformer 缓解长程依赖但 O(n²) 复杂度。

【举一反三】：RNN 时间步连乘雅可比，和后端长链路上 N 个微服务串行调用同构——每跳保留 0.9 的成功率，100 跳后剩 0.9^100≈0.00003 全链路失败。残差/LSTM 的"加法通路"等价于在调用链里加旁路缓存（Circuit Breaker 的 fallback），跳过下游连乘。Transformer 的全局注意力类似事件总线广播，省了串行跳转但通信 O(n²)。

【扣分点对照】：背题者说"连乘小于 1 就消失"；真做过的人会答：PTB 上训 vanilla RNN 50 步后梯度范数从 1.2 降到 1e-7（用 torch.norm 打印各层梯度实测），换 LSTM 后 100 步仍保持 0.3；序列长于 80 时 vanilla RNN 的 PPL 卡在 250 不降，LSTM 能到 78；梯度爆炸用 clip_grad_norm_ max=5.0 防止 NaN，比不裁剪训练稳定但收敛慢 15%。`,
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

踩坑：LSTM 参数多训练慢；序列长仍受限（不如 Transformer）；门控需配合梯度裁剪防爆炸；双向 LSTM 不能用于自回归生成。

【举一反三】：LSTM 三门设计映射到后端限流/熔断：遗忘门像 LRU 淘汰旧数据，输入门像准入控制限流，输出门像响应过滤器。加法细胞状态本质是"带门控的残差连接"，比 RNN 的乘法链路更接近 ResNet 思路——这也是 Highway Network 和 LSTM 共享同一作者的关键线索。GRU 把三门合并成两门，类似把"读锁+写锁"合并成单一锁以减少同步开销。

【扣分点对照】：背题者背三门公式但说不出为什么加法能防消失；真做过的人会答：WMT14 翻译上 LSTM 4 层 hidden=1024 训练 5 天 BLEU 22.5，加 attention 到 25.8；遗忘门偏置初始化 1.0（不是默认 0）让早期长程保留，否则前 10K 步梯度崩溃 loss 飙到 8+，这是 Gers & Schmidhuber 2000 论文的关键细节；序列长 100 时 LSTM 仍能学到 50 步依赖（用 LFSR 任务验证），vanilla RNN 20 步就崩。`,
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

踩坑：BiRNN 训练需完整序列，流式推理不可用；双向输出维度翻倍；ELMo 用 BiLSTM 但生成任务仍受限。

【举一反三】：BiRNN 的"双向上下文"思路在编译器里也有——LLVM 的双向数据流分析（forward 数据流 + backward 活跃变量），都是同一段代码两个方向各扫一遍再合并。BERT 的 MLM 把"双向"做到极致（全程 mask 不泄露未来），代价是没法自回归生成；GPT 选择单向换可生成性，是"理解 vs 生成"的工程权衡。

【扣分点对照】：背题者说"BiRNN 看前后文适合分类"；真做过的人会答：CoNLL 2003 NER 上 BiLSTM-CRF F1 比 unidirectional 高 6 个点（85.0 → 91.0），但流式 ASR 不能用，必须换 LAS 或 CTC 单向模型；ELMo 用 BiLSTM 但生成时只能逐层固定提取特征，不像 GPT 能流式 token 生成；BiLSTM 显存是单向的 2.1 倍（多一份反向状态 + 通信开销），batch=64 时单卡 V100 32GB 才放得下。`,
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

踩坑：梯度默认累加需 zero_grad；detach() 截断梯度；requires_grad 控制是否求导；item() 取标量。

【举一反三】：autograd 的"前向建图反向遍历"思路和 React 的 fiber 调度同构——都是把"过程式递归"转成"显式图结构"再调度。动态图相比静态图的优势，类似 REPL 相比编译型语言：调试时能 print 任意中间值、能加 if/else 控制流，代价是没法做全局编译优化（算子融合、内存复用）。torch.compile (2.0+) 是在动态图上叠加静态编译，类似 V8 的 JIT 思路。

【扣分点对照】：背题者说"动态图灵活调试方便"；真做过的人会答：训练 BERT-base 时 backward 比 forward 慢 1.8 倍（autograd 建图+反向开销），用 torch.compile(mode="reduce-overhead") 后训练吞吐 +35%；GAN 训练里 detach() 漏加一处导致判别器梯度回流生成器 loss 直接 NaN，定位 2 小时；分布式训练中梯度累积 multiple backward 后才 step，需要 zero_grad(set_to_none=True) 省显存（PyTorch 1.7+ 默认行为）。`,
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


  // ===== 从远程合入：ai-gnn =====
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

];
