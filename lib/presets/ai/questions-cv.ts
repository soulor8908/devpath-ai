// lib/presets/ai/questions-cv.ts
// AI 算法工程师面试题：计算机视觉（4 节点 × 8 题 = 32 题）
// 答案按策展级深度重写：分层原理 / 实际案例 / 举一反三 / 扣分点对照 / 代码 / 踩坑

import type { Question } from "../../types";

export const CV_QUESTIONS: Question[] = [
  // ===== ai-cv-classification =====

  {
    id: "ai-94",
    nodeId: "ai-cv-classification",
    question: "CV 数据增强有哪些？Mixup、CutMix、Mosaic 原理与区别？",
    answer: `【分层原理】结论：数据增强本质是"用先验知识扩充数据分布"，分三层。第一层基础增强（翻转/裁剪/色彩抖动）模拟成像变换不动语义；第二层 Mixup 对两张图做线性插值 x'=λx1+(1-λ)x2，标签同比例混合，强制类间线性过渡、抑制过自信；第三层 CutMix 裁矩形块贴到另一张图、标签按面积加权，保留局部纹理并注入遮挡先验；Mosaic（YOLOv4）四图缩放拼接，等价 batch 缩为 1/4 且引入多尺度上下文。三者差别在信息保留方式：Mixup 全局混合丢失空间结构，CutMix 保留局部块，Mosaic 保留完整目标但改变尺度分布——小目标占比放大 4 倍，对小目标检测尤其友好。

【实际案例】旷视商品检测项目发现价签、logo 等小目标召回低 12 个点，排查发现训练集小目标占比不足 3%。引入 Mosaic+Copy-Paste 后 COCO 小目标 APs 从 21.3 提到 26.8，线上召回提升 9 个点；代价是目标尺度整体变小、anchor 分布漂移，重新聚类才收敛。timm 标准 recipe（RandAugment+Mixup+CutMix+Random Erasing）把 ResNet-50 Top-1 从 76.1% 提到 80.4%，零推理成本。

【举一反三】"增强即先验"可迁移：NLP 的 EDA、语音 SpecAugment 同范式。决策模型：先诊断模型在哪类样本失效，再选注入对应先验的增强，不无脑堆。

【扣分点对照】背八股的只会罗列名词；真做过的能讲出"Mosaic 为何利好小目标"（目标绝对像素变小、batch 内上下文增多），以及增强致 anchor/归一化统计漂移要重校准的工程后果。

\`\`\`python
import torch
def mixup(x, y, alpha=0.2):
    lam = torch.distributions.Beta(alpha, alpha).sample()
    idx = torch.randperm(x.size(0))
    return lam * x + (1 - lam) * x[idx], lam * y + (1 - lam) * y[idx]
def cutmix(x, y, alpha=1.0):
    lam = torch.distributions.Beta(alpha, alpha).sample().item()
    idx = torch.randperm(x.size(0))
    H, W = x.shape[2:]
    rh, rw = int(H * (1 - lam) ** 0.5) // 2, int(W * (1 - lam) ** 0.5) // 2
    cy, cx = torch.randint(0, H, (1,)).item(), torch.randint(0, W, (1,)).item()
    y1, y2, x1, x2 = cy - rh, cy + rh, cx - rw, cx + rw
    x[:, :, y1:y2, x1:x2] = x[idx, :, y1:y2, x1:x2]
    lam = 1 - (y2 - y1) * (x2 - x1) / (H * W)  # 按实际面积重算 λ
    return x, lam * y + (1 - lam) * y[idx]
\`\`\`

踩坑：① Mixup 软化标签会损害概率校准，下游用置信度阈值需温度缩放；② Mosaic 改变尺度分布后 anchor 必须重新聚类，否则正样本分配率骤降；③ 验证集不能加增强（TTA 除外），有团队误复制训练增强到验证集致指标虚高 5 个点。`,
    keyPoints: ["基础/混合/裁剪三类增强", "Mixup 线性插值软化边界", "CutMix 保留局部纹理", "Mosaic 四图拼接利好小目标", "增强改尺度分布 anchor 需重聚类"],
    followUps: ["Mixup 为什么能防过拟合？（提示：类间线性插值相当于平滑决策边界的正则）", "Mosaic 为什么对小目标友好？（提示：拼接后目标相对像素缩小、单图上下文变多）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-95",
    nodeId: "ai-cv-classification",
    question: "参数高效微调（PEFT）与小样本学习对比？LoRA / Adapter / Prompt 与 Few-shot 如何选？",
    answer: `【分层原理】结论：两者都解决"下游标注少"，但机制不同。PEFT 冻结预训练主干、只注入少量可训参数：LoRA 在权重 W 旁并联低秩矩阵 ΔW=BA（r≪d，参数量从 d² 降到 2dr，通常 <1%），推理时合并回 W 零额外延迟；Adapter 在 FFN 后插瓶颈模块（d→r→d）；Prompt/Prefix Tuning 只学输入端或每层的连续向量。小样本学习是另一条路线：元学习（MAML 学对初始化敏感、Prototypical 学类原型度量空间）让模型"学会快速适应"；或直接用 CLIP 零样本能力+少量样本训线性头。选择逻辑：每类 <10 样本用 CLIP 零样本/度量学习；几百到几万样本 LoRA 性价比最高；>10 万再考虑全量微调。

【实际案例】阿里商品识别每月新增上千类目，全量微调 ViT-B 一次要 8 卡 A100 训 2 天，且类目间互相干扰（灾难性遗忘）。改走"冻结主干+每类目一组 LoRA（r=8，仅 0.3% 参数）"后，单类目训练降到单卡 20 分钟，新类目准确率从全量微调的 91.2% 微降到 90.6%（可接受），存储从每类目 330MB 降到 4MB。字节内部多业务共享一个视觉主干，各业务只存 Adapter 模块，显存省 60%。

【举一反三】同一思想在 LLM 是事实标准（QLoRA 指令微调），扩散模型个性化也从 DreamBooth 全量微调转向 LoRA。通用决策模型：参数预算、训练频率、是否需要合并部署——三个约束定 PEFT 选型。

【扣分点对照】背八股的会背"LoRA 是低秩分解"；真做过的能讲出 r 的选择依据（下游与预训练差距越大 r 越大，8-64 是甜区）、LoRA 合并后量化到 INT8 的掉点问题，以及为什么不全量微调（灾难性遗忘+存储爆炸）。

\`\`\`python
from peft import LoraConfig, get_peft_model
# ViT 上 LoRA：只训注意力投影的低秩旁路
config = LoraConfig(r=8, lora_alpha=16, target_modules=["qkv"], lora_dropout=0.05)
model = get_peft_model(vit, config)
model.print_trainable_parameters()  # 可训参数通常 <1%
# 小样本：Prototypical Network 用类原型最近邻分类
proto = support_emb.view(n_way, n_shot, -1).mean(1)  # 每类均值原型
pred = (query_emb[:, None] - proto[None]).norm(dim=-1).argmin(-1)
\`\`\`

踩坑：① r 太小学不动、太大失去省参意义且小数据易过拟合；② Few-shot 评估要按 episode 多次采样报均值±置信区间，单次划分方差极大；③ LoRA 合并权重后切业务需卸载重挂，工程上要缓存多份 ΔW 做热切换。`,
    keyPoints: ["LoRA 低秩旁路 参数<1%", "Adapter 层间瓶颈模块", "元学习学快速适应新类", "数据量决定选型路线"],
    followUps: ["LoRA 的秩 r 如何选？（提示：下游与预训练差距越大 r 越大，8-64 是甜区）", "Few-shot 评估为什么要 episode 采样？（提示：单次划分方差大，需多次采样报置信区间）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-96",
    nodeId: "ai-cv-classification",
    question: "Vision Transformer（ViT）和 CNN 区别？何时 ViT 优于 CNN？",
    answer: `【分层原理】结论：ViT 把图像切成 16×16 patch 线性投影成 token 序列，纯靠自注意力建模全局依赖；CNN 用局部卷积核+层次化下采样，内置局部性和平移等变两个强归纳偏置。差异本质：自注意力每层感受野即全图（O(n²) 复杂度换全局建模），CNN 感受野随深度增长（O(k²n) 更高效）。归纳偏置是双刃剑——小数据时它是正则（CNN 收敛稳、不易过拟合），大数据时成了先验天花板（ViT-H 在 JFT-300M 上 ImageNet Top-1 达 88.55%，超同期 CNN）。所以"何时优"：数据量和算力到位时 ViT 上限更高；数据 <100 万图时 CNN 或混合架构（Swin/ConvNeXt）更稳。

【实际案例】原论文数据：ViT-H/14 用 ImageNet-21k 预训练 Top-1 88.55%，但只用 ImageNet-1k（130 万张）直接训只有约 77%，被 EfficientNet 反超。阿里通义视觉在 40 亿电商图文对上预训练 ViT，商品分类 Top-1 比 ResNet-101 高 3.2 个点；但集团内小团队用 8 万张质检缺陷图微调 ViT 不收敛，退回 ConvNeXt 反而 92.1% mAcc——数据量决定胜负的典型案例。字节审核侧用 Swin-B 做视频抽帧分类，窗口注意力把 1080p 输入的计算量压到全局注意力的 1/4。

【举一反三】同样的"归纳偏置 vs 数据规模"权衡在 NLP 演过一遍：Transformer 取代 LSTM 靠的也是大数据+少偏置。决策模型可复用：先盘点数据量级、下游是否需要长程依赖（分类要全局、检测分割要局部细节），再定架构——这也是检测分割主流是 Swin 而非纯 ViT 的原因。

【扣分点对照】背八股的会说"ViT 全局、CNN 局部"；真做过的能讲出位置编码的可学习 vs 相对偏置之争、ViT 对增强和正则（DropPath/EMA）极度敏感，以及 MAE 预训练为何能补 ViT 小数据短板（掩码重建逼模型学局部结构）。

\`\`\`python
import torch
import torch.nn as nn
class PatchEmbed(nn.Module):
    def __init__(self, patch=16, dim=768):
        super().__init__()
        self.proj = nn.Conv2d(3, dim, patch, patch)  # 卷积一步完成切 patch+投影
    def forward(self, x):
        return self.proj(x).flatten(2).transpose(1, 2)  # (B,N,D)
# 复杂度：自注意力 O(N^2·D)，N=(224/16)^2=196；分辨率翻倍 N 变 4 倍、注意力开销 16 倍
\`\`\`

踩坑：① 输入分辨率 224→512 时 token 数平方增长、显存涨 5 倍；② 换分辨率需位置编码插值+微调，直接推理掉点明显；③ 纯 ViT 无层次结构，直接接 FPN 效果差，检测任务用 ViTDet 或 Swin。`,
    keyPoints: ["ViT 全局注意力 归纳偏置弱", "CNN 局部等变 小数据稳", "大数据 ViT 上限更高", "Swin 窗口注意力适配密集预测"],
    followUps: ["ViT 为什么吃数据量？（提示：无局部性先验，归纳偏置全靠数据学出来）", "MAE 预训练如何补 ViT 短板？（提示：掩码重建逼模型学习局部结构）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-97",
    nodeId: "ai-cv-classification",
    question: "知识蒸馏原理？ Teacher-Student 如何工作？",
    answer: `【分层原理】结论：蒸馏让学生学教师的"软标签"而非仅硬标签，传递类间相似性（暗知识）。机制三层：① 教师 logits 除以温度 T 再 softmax，T>1 分布变软，"猫像狗 0.2、像车 0.001"这类相对关系被保留——这是硬标签没有的信息；② 损失 L=α·T²·KL(softmax(z_T/T)‖softmax(z_S/T))+(1-α)·CE(z_S,y)，T² 因子把软标签梯度补偿到与硬标签同量级；③ 进阶是特征蒸馏（FitNets 对齐中间层）与关系蒸馏（对齐样本间距离矩阵）。为什么有效：软标签等价于逐样本自适应的 label smoothing，把教师泛化能力传递给学生，学生参数量小 10 倍仍可达教师 97% 以上精度。

【实际案例】腾讯优图把人脸属性识别从 ResNet-100（1.2G FLOPs）蒸馏到 MobileNetV3（40M FLOPs），端侧延迟从 180ms 降到 12ms，属性 F1 只掉 0.4 个点。失败形态也典型：教师与学生容量差过大（capacity gap），直接 KL 蒸馏学生学不动，准确率比不蒸还低 1.5 个点；迭代动作是加中间层特征蒸馏+助教模型（先蒸出中等模型再往下蒸），最终追回并反超 0.8 个点。美团无人配送用大 YOLO 蒸小 YOLO，车端 Orin 平台 FPS 从 15 提到 42。

【举一反三】同一范式在 LLM 是常识：DeepSeek-R1 蒸馏出 Qwen/Llama 小模型。决策模型：学生/教师容量比别低于 1:10、教师低置信样本要降权、有中间层权限就优先特征蒸馏。

【扣分点对照】背八股的会背"软标签+KL 散度"；真做过的能讲出 T² 补偿因子的推导意义、capacity gap 导致负蒸馏的现象，以及 self-distillation（教师就是自己）为何也涨点（标签平滑正则效应）。

\`\`\`python
import torch
import torch.nn.functional as F
def distill_loss(s_logit, t_logit, y, T=4.0, alpha=0.5):
    soft = F.kl_div(F.log_softmax(s_logit / T, 1),
                    F.softmax(t_logit / T, 1), reduction="batchmean") * (T * T)
    hard = F.cross_entropy(s_logit, y)
    return alpha * soft + (1 - alpha) * hard
with torch.no_grad():  # 教师前向不回传梯度
    t_logit = teacher(x)
loss = distill_loss(student(x), t_logit, y)
\`\`\`

踩坑：① T 常用 4-8，太高暗知识被抹平、太低退化为硬标签；② 教师错了学生跟着错，脏训练集会被放大，蒸馏前先洗数据；③ 蒸馏模型对 INT8 量化更敏感，端侧部署需 QAT 二次蒸馏。`,
    keyPoints: ["软标签携带类间暗知识", "温度 T 软化 T² 补偿梯度", "容量差大需助教过渡", "特征蒸馏优于纯 logit"],
    followUps: ["T² 因子的作用？（提示：补偿软标签梯度缩小，与硬标签同量级）", "什么是负蒸馏？（提示：师生容量差过大，学生学不动反掉点）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-98",
    nodeId: "ai-cv-classification",
    question: "长尾分布分类如何处理？重采样、重加权、解耦？",
    answer: `【分层原理】结论：长尾处理按作用阶段分三条路线。① 数据层——重采样：尾类过采样/头类欠采样（类别均衡采样器），直接改分布，但尾类被反复看易过拟合；② 损失层——重加权：按类频倒数或有效样本数（Class-Balanced Loss 权重 (1-β)/(1-β^n)）加权，Focal Loss 则按难分程度降权易分样本；③ 两阶段解耦（Decoupling，2019）：第一阶段实例采样正常学表征，第二阶段冻结特征、类均衡采样只重训分类器——论文证明表征在原始分布下学得最好，偏的只是分类器权重范数（头类 ‖w‖ 更大）。经验结论：解耦法及后续 BBN/LDAM 在 CIFAR-LT/ImageNet-LT 上比单纯重加权高 3-8 个点。

【实际案例】阿里商品库 10 万类目，头部 1% 类目占 70% 样本，尾类平均不足 20 张。直接用 CE 训练尾类召回仅 31%。失败迭代：先上 Focal Loss（γ=2），头类被误伤整体 acc 掉 1.2 个点；再上类均衡采样，尾类召回升到 52% 但头类掉 3 个点（过拟合尾类噪声图）。最终用解耦两阶段：backbone 原始分布训 90 epoch，冻结后分类头类均衡采样微调 10 epoch，尾类召回 58%、头类无损，整体提升 4.7 个点上线。

【举一反三】检测里长尾更极端（LVIS），对应方案是 repeat factor sampling+Seesaw Loss；推荐系统冷门 item 冷启动是同构问题（内容特征迁移头类知识）。决策模型：头尾比 10:1 内重加权足够，100:1 以上必须解耦或 τ-normalization。

【扣分点对照】背八股的会列"重采样、重加权、Focal Loss"；真做过的能讲出解耦论文核心发现（表征不怕长尾、偏的是分类器权重范数），以及为什么测试集必须按真实分布评估——用均衡测试集报指标是自欺欺人。

\`\`\`python
import torch
import torch.nn.functional as F
def focal_loss(logits, target, alpha=0.25, gamma=2.0):
    ce = F.cross_entropy(logits, target, reduction="none")
    p = torch.exp(-ce)
    return (alpha * (1 - p) ** gamma * ce).mean()
# 类均衡采样：按类频倒数构造采样权重
from torch.utils.data import WeightedRandomSampler
weights = 1.0 / torch.tensor(class_counts, dtype=torch.float)
sampler = WeightedRandomSampler(weights[torch.tensor(labels)], len(labels))
# τ-normalization：分类器权重归一后按 τ 缩放，拉平头尾类 ‖w‖ 差距
\`\`\`

踩坑：① 尾类过采样把同一张图看几百次会记住噪声；② 重加权破坏概率校准，下游置信度阈值会崩；③ τ-normalization 的 τ 要在验证集上调，别拍脑袋定。`,
    keyPoints: ["重采样改分布 重加权改损失", "解耦两阶段 表征不怕长尾", "长尾偏的是分类器权重范数", "测试必须按真实分布评估"],
    followUps: ["解耦法为何有效？（提示：实例采样下表征学得最好，偏的只是分类头）", "检测长尾怎么做？（提示：LVIS 用 repeat factor sampling+Seesaw Loss）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-99",
    nodeId: "ai-cv-classification",
    question: "ResNet 之后有哪些重要变体？ResNeXt、ConvNeXt 贡献？",
    answer: `【分层原理】结论：ResNet 之后沿三条主线演进。① 宽度维度——ResNeXt（2017）提出 cardinality：瓶颈层 3×3 卷积拆成 32 组并行分支（分组卷积），证明"增加分支数比加深加宽更划算"，ResNeXt-101 在相近 FLOPs 下 ImageNet Top-1 比 ResNet-101 高 0.9 个点；② 连接维度——DenseNet 每层输出 concat 给后续所有层，特征复用极致、参数减半但显存大；③ 现代化——ConvNeXt（2022）按 Swin 配方逆向改造 ResNet：depthwise 7×7 大核、GELU 换 ReLU、LayerNorm 换 BatchNorm、少激活少归一化，ConvNeXt-L Top-1 达 87.8% 反超 Swin-B 且推理更友好。核心启示：CNN 输给 ViT 的不是卷积本身，而是训练配方和微观设计落后了十年。

【实际案例】商汤智慧城市 ReID 项目把 backbone 从 ResNet-50 换 ResNeXt-50（32×4d），mAP 提升 1.8 个点，但 TensorRT 对分组卷积优化差，端侧延迟反涨 30%——教训是分组数按部署硬件选（GPU 喜欢 32 组、NPU 喜欢 ≤8 组）。ConvNeXt 发布后，团队用 ConvNeXt-T 替换 Swin-T 做夜间车辆检测 backbone，mAP 持平（58.2 vs 58.4），INT8 量化掉点从 1.5% 收窄到 0.3%——LayerNorm 比注意力算子对量化更友好。

【举一反三】"用新配方复活老架构"同样发生在 NLP（ModernBERT 用 RoPE/GeGLU 复活 BERT）。决策模型：选 backbone 别只看论文精度，列三张表——精度、硬件算子亲和度、量化敏感度，取交集。

【扣分点对照】背八股的会说"ResNeXt 是分组卷积、ConvNeXt 是大卷积核"；真做过的能讲出 cardinality 为何比 depth 高效（分支集成效应）、depthwise 大核为何能近似注意力感受野，以及 LN 换 BN 后小 batch 训练的稳定性差异。

\`\`\`python
import torchvision.models as M
import torch.nn as nn
resnext = M.resnext50_32x4d(weights=M.ResNeXt50_32X4D_Weights.DEFAULT)
convnext = M.convnext_small(weights=M.ConvNeXt_Small_Weights.DEFAULT)
# ResNeXt 瓶颈层核心：32 组分组卷积，等宽等 FLOPs 下表达力更强
bottleneck_conv = nn.Conv2d(128, 128, kernel_size=3, padding=1, groups=32)
# ConvNeXt block 核心：7×7 depthwise conv + LayerNorm + GELU + 1×1 升维
dw = nn.Conv2d(96, 96, kernel_size=7, padding=3, groups=96)
\`\`\`

踩坑：① 分组卷积要求 in/out 通道都被 groups 整除，剪枝时极易破坏整除性；② ConvNeXt 的 7×7 depthwise 在老 GPU 上 kernel 实现差，实测加速比不如理论值；③ DenseNet 的 concat 显存爆炸，大分辨率任务慎用。`,
    keyPoints: ["ResNeXt cardinality 分支维度", "ConvNeXt 现代配方复活 CNN", "大核 depthwise 近似注意力", "选型看硬件算子亲和度"],
    followUps: ["分组卷积为何高效？（提示：分支集成效应，同 FLOPs 表达力更强）", "ConvNeXt 做了哪些现代化？（提示：7×7 depthwise/GELU/LN/少激活）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-273",
    nodeId: "ai-cv-classification",
    question: "Swin Transformer 原理？窗口注意力与移位窗口（Shifted Window）设计解决了什么？",
    answer: `【分层原理】结论：Swin 把 ViT 改造成层次化 CNN 式结构，核心是两个设计。① 窗口注意力（W-MSA）：token 限制在 7×7 局部窗口内做自注意力，复杂度从全局 O(n²) 降到 O(n·M²)（M=7 常数，随图像尺寸线性增长）；但纯窗口内注意力无跨窗信息交换。② 移位窗口（SW-MSA）：相邻层把窗口划分平移 (M/2,M/2) 个 token，让上层窗口边界处的 token 在新窗口内相遇，两层交替后信息流等效全局；配合 cyclic shift（环移）+attention mask 把移位后不相邻的 patch 隔开，计算量不变。再仿 CNN 做 patch merging（2×2 邻域合并、分辨率减半通道翻倍），得到 stride 4/8/16/32 的四阶段层次特征，天然适配 FPN 接检测/分割；相对位置偏置（每窗口一张 (2M-1)² 可学习表）让平移鲁棒性优于绝对位置编码。

【实际案例】Swin-B 在 COCO 检测（Cascade Mask R-CNN）达 51.9 box AP，超同级纯 ViT 方案 3 个点以上，2021 年后成检测分割事实标准 backbone。商汤智慧城市视频结构化用 Swin-L 替换 ResNet-101，行人属性识别 mA 提升 2.4 个点，但 1080p 输入显存涨 60%；迭代动作：窗口从 7 调 12+输入降到 960，精度损失 0.3 个点、显存回落。字节内容审核用 Swin-T 做抽帧分类，审核准确率 94.7% 比 ResNet-50 高 1.9 个点，单卡吞吐反高 15%（规则内存访问更利于编译优化）。

【举一反三】"局部计算+移位交换"是经典复杂度工程：Longformer 的滑窗注意力、视频 Swin 的 3D 窗口同构。决策模型：序列长度超千级先考虑稀疏/窗口注意力，别硬上全局。

【扣分点对照】背八股的会说"Swin 用窗口注意力降复杂度"；真做过的能讲出 SW-MSA 为何要 cyclic shift（移位后窗口大小不一，环移恢复均匀窗口再 mask 隔离），以及相对位置偏置为何插值到高分辨率不衰减。

\`\`\`python
import torch
def window_partition(x, win=7):
    # x: (B,H,W,C) -> (B*nWin, win*win, C)，窗口内做 MSA 复杂度与 H·W 线性
    B, H, W, C = x.shape
    x = x.view(B, H // win, win, W // win, win, C)
    return x.permute(0, 1, 3, 2, 4, 5).reshape(-1, win * win, C)
# SW-MSA：下一层先 torch.roll(x, shifts=(-win//2, -win//2), dims=(1, 2))
# 再用 attention mask 屏蔽环移后跨原图边界的非法注意力对
\`\`\`

踩坑：① cyclic shift 的 attention mask 没实现会引入伪跨窗注意力，精度异常"涨"（信息泄露）；② 推理换输入尺寸要重算窗口划分，别像 CNN 随意变尺寸；③ patch merging 后所有依赖绝对分辨率的代码都要重算。`,
    keyPoints: ["窗口注意力复杂度降为线性", "移位窗口+cyclic shift 换信息", "patch merging 造层次特征", "相对位置偏置抗平移"],
    followUps: ["为什么要 cyclic shift？（提示：移位后窗口大小不均，环移恢复均匀窗口再 mask 隔离）", "Swin 为何适配检测？（提示：四阶段层次特征直接接 FPN 多尺度头）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-274",
    nodeId: "ai-cv-classification",
    question: "自监督预训练 SimCLR / MoCo / MAE 原理？为何掩码重建特别适合 ViT？",
    answer: `【分层原理】结论：自监督从无标注数据构造代理任务学表征，三代范式。① 对比学习 SimCLR：同图两种增强视图的表征拉近、批内他图推远（InfoNCE 损失），关键在强增强（裁剪+色彩抖动提供语义不变性）+大 batch（8192，负样本够多）；② MoCo：动量编码器+队列字典，把负样本数与 batch size 解耦，128 batch 也能维护 65536 负样本；③ MAE：随机遮 75% patch，编码器只处理可见 25%（算力省 3 倍），轻解码器重建被遮像素。为什么 MAE 与 ViT 天作之合：图像信息冗余度远高于文本（BERT 遮 15% 够学，图像要 75% 才有挑战），patch 化输入让"只算可见 token"天然可行（CNN 的规则网格做不到高效稀疏）。MAE 预训练 ViT-H 微调 ImageNet 87.8%，小数据迁移显著优于监督预训练，补齐 ViT 缺归纳偏置的短板。

【实际案例】Meta 用 MAE 在 10 亿 Instagram 无标注图预训练 ViT-H，K400 视频动作识别迁移 87.4% 刷新纪录。阿里质检场景只有 3 万张缺陷图：监督预训练 ResNet 微调 mAcc 88.1%，换 MAE 先在 200 万张无标注产线图掩码重建 800 epoch 再微调 ViT-B 到 92.6%。失败教训：掩码比例照搬 75% 对稀疏缺陷图过高（重建退化成边缘插值），降到 60% 才最优。字节把 MAE 用于审核视频抽帧预训练，标注需求降 70%。

【举一反三】代理任务设计是元能力：NLP 的 MLM、语音 wav2vec2（掩码+对比）、推荐的 mask 用户行为序列同构。决策模型：数据冗余度高选重建（MAE），需要明确不变性先验选对比（SimCLR），显存受限选 MoCo。

【扣分点对照】背八股的会说"对比学习拉近推远"；真做过的能讲出 InfoNCE 温度 τ 控制难分负样本权重、SimCLR 去掉色彩抖动后模型用颜色直方图作弊（准确率掉 10+ 点），以及 MAE 高掩码率的信息论解释。

\`\`\`python
import torch
import torch.nn.functional as F
def info_nce(z1, z2, tau=0.2):
    # z1,z2: (B,D) 同一图两种增强的表征，批内其余样本当负样本
    z = F.normalize(torch.cat([z1, z2]), dim=1)
    sim = z @ z.T / tau
    sim.fill_diagonal_(float("-inf"))
    labels = torch.arange(z1.size(0), device=z.device)
    labels = torch.cat([labels + z1.size(0), labels])
    return F.cross_entropy(sim, labels)
# MAE：encoder 只吃 visible tokens，decoder 用 mask token+位置嵌入重建像素
\`\`\`

踩坑：① 对比学习 batch 太小负样本不足，表征坍缩成常数（训练 loss 很低但线性评估崩）；② MAE 的 per-patch 像素归一化 target 建议开启，跨相机亮度不稳时尤其重要；③ 预训练增强与下游任务分布错位，迁移反而掉点。`,
    keyPoints: ["SimCLR 强增强+大 batch 对比", "MoCo 动量编码器+队列负样本", "MAE 遮 75% 只算可见 token", "图像冗余高故掩码率要高"],
    followUps: ["为何图像掩码率远高于 BERT？（提示：图像冗余度高，15% 重建太易学不到语义）", "对比学习为何会坍缩？（提示：负样本不足时全部映射到同点也能降 loss）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-cv-detection =====

  {
    id: "ai-100",
    nodeId: "ai-cv-detection",
    question: "YOLO 检测原理？单阶段相比两阶段（Faster R-CNN）优势？",
    answer: `【分层原理】结论：YOLO 把检测重构为单次回归——图像划成 S×S 网格，目标中心落在哪个网格，该网格就负责预测 B 个框（x,y,w,h,置信度）+C 类概率，一次前向全图出结果。对比两阶段 Faster R-CNN（RPN 提候选→RoI 精修，两次前向），单阶段省掉候选生成，v1 即达 45 FPS。早期精度差距的根源是正负样本极不平衡（全图 98% 网格是背景）和定位粗糙；现代 YOLO（v8/v11）用 anchor-free 解耦头、Task-Aligned Assigner 动态正样本分配、DFL 把框回归从点估计改成分布估计，COCO mAP 拉到 53+ 已与两阶段持平，而 N 型号边缘端仍有 100+ FPS。选型结论：实时/边缘一律单阶段，只有医疗影像这类对 AP75 极致敏感的场景才留两阶段。

【实际案例】美团第四代无人配送车用 YOLOv8s 做障碍物检测，640×640 输入在 Orin-X 上 TensorRT FP16 推理 8ms/帧，满足车端 30 FPS 实时要求。初版直接用 COCO 预训练权重微调，井盖、地锁这类贴地小目标召回只有 74%；迭代动作：输入升 960、加 P2 小目标检测头、训练集 Copy-Paste 贴地目标 3 倍过采样，召回提到 91%，mAP@0.5 达 86.3。海康威视人流统计卡口相机 1080p 单帧 12ms，单机同时跑 4 路视频。

【举一反三】"单阶段 vs 两阶段"权衡可迁移到 OCR（CTPN 两阶段 vs DBNet 单阶段分割式）、人脸检测（RetinaFace 单阶段主导）。决策模型：延迟预算 <20ms 或边缘芯片→单阶段；长尾类别+高精度+离线分析→两阶段或 DETR 系；拿不准就 YOLO 打底，它的部署工具链最完整。

【扣分点对照】背八股的会说"YOLO 快、Faster R-CNN 准"——这是 2016 年的结论；真做过的能讲出 Task-Aligned Assigner 如何按分类分×IoU 动态选正样本、DFL 为什么用 16 个离散 bin，以及 NMS-free 的 v10 如何用一致双重分配训练。

\`\`\`python
from ultralytics import YOLO
model = YOLO("yolov8n.pt")  # anchor-free 解耦头，6 种规格 n/s/m/l/x
results = model("image.jpg", conf=0.5, iou=0.45)  # 推理一次前向出全框
# 训练：data 配置类别与路径，自动 Mosaic+Copy-Paste 增强
model.train(data="coco.yaml", epochs=100, imgsz=640, batch=16)
# 部署：导出 TensorRT，车端 FP16 推理
model.export(format="engine", half=True)
\`\`\`

踩坑：① 输入 640 提到 1280 小目标涨点但 FPS 掉 4 倍，按业务权衡；② NMS 阈值 0.45/0.65 差几个点召回，密集场景必须调；③ 导出 ONNX/TensorRT 后先离线对拍精度，grid 常量折叠版本差异大。`,
    keyPoints: ["单阶段一次前向出全框", "动态分配+DFL 追平两阶段", "anchor-free 免手工先验", "实时场景选 YOLO 系生态"],
    followUps: ["Task-Aligned Assigner 是什么？（提示：按分类分与 IoU 的对齐度量动态选正样本）", "YOLOv10 怎么去 NMS？（提示：训练时一对一+一对多双重分配，推理只保留一对一）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-101",
    nodeId: "ai-cv-detection",
    question: "Faster R-CNN 两阶段检测原理？RPN 作用？",
    answer: `【分层原理】结论：Faster R-CNN=共享卷积主干+RPN 候选生成+RoI 头精修，两阶段端到端。RPN（Region Proposal Network）是核心创新：在特征图上滑 3×3 窗口，每个位置以 k 个 anchor（3 尺度×3 长宽比）为参照，输出 2k 个前景/背景分数和 4k 个框修正量，NMS 筛出约 300 个 proposal。训练是 4 项损失：RPN 分类+回归、RoI 头分类+回归；anchor 与 GT 的 IoU>0.7 为正、<0.3 为负。相比 Fast R-CNN 依赖 Selective Search（CPU 2 秒/图），RPN 把候选生成压到 10ms 且融入梯度学习。两阶段精度优势的来源：proposal 阶段先滤掉 99% 背景，第二阶段在类别近似均衡的候选集上精分类精回归，天然缓解单阶段的样本不平衡。

【实际案例】华为某产线 PCB 缺陷检测用 Faster R-CNN+FPN，缺陷 mAP@0.5 达 94.2%，比 YOLOv5 高 2.7 个点——缺陷框小且类别极不平衡，两阶段级联筛选占优；代价是单帧 80ms，靠产线相机触发式拍照（非连续视频流）容忍延迟。医疗侧联影肺结节检测用 3D Faster R-CNN 变体，敏感度 95% 时平均假阳性 1.2 个/例，满足临床辅助阅片要求。两个案例共同决策点：精度优先、吞吐可堆机器时，两阶段仍是优选。

【举一反三】两阶段思想在 LLM 时代复活为"召回+精排"：RAG 先向量召回再 cross-encoder 精排、推荐双塔召回+精排模型，与 RPN+RoI Head 完全同构。决策模型：候选集巨大且单模型既要又要两头不占优时，拆"快召回慢精修"两段。

【扣分点对照】背八股的会背"RPN 生成 proposal"；真做过的能讲出 anchor 的 IoU 正负阈值设计、RPN 与 RoI Head 的联合训练细节，以及 FPN 接入后 anchor 变为每层单尺度这个常被忽略的变化。

\`\`\`python
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn
model = fasterrcnn_resnet50_fpn(weights="DEFAULT")
model.eval()
with torch.no_grad():
    pred = model([img_tensor])[0]  # boxes/labels/scores
# 训练时 4 项损失：RPN 前景分类+框回归、RoI 头类别分类+框精修
# model.rpn 生成 proposal，model.roi_heads 对候选做分类回归
\`\`\`

踩坑：① anchor 尺度比例不匹配目标分布时 RPN 召回断崖，工业数据必须重新统计框分布；② RoI 输入 stride 算错会让框整体偏移半格；③ 两阶段显存约为单阶段 2 倍，batch 开不大时 BN 不稳，换 GN 或冻结 BN。`,
    keyPoints: ["RPN 学出候选替代人工搜索", "anchor IoU 0.7/0.3 分正负", "两阶段级联缓解样本不平衡", "精度优先场景仍选两阶段"],
    followUps: ["RPN 怎么训练？（提示：与 GT 的 IoU 定正负，分类+回归多任务损失）", "FPN 接入后 anchor 有何变化？（提示：每层单尺度 anchor，跨层覆盖多尺度）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-102",
    nodeId: "ai-cv-detection",
    question: "DETR 端到端检测原理？为何去掉 NMS 和 anchor？",
    answer: `【分层原理】结论：DETR 把检测从"密集预测+NMS 后处理"重构为集合预测（set prediction）。机制三层：① CNN 提特征后过 Transformer Encoder 做全局上下文建模；② Decoder 用 N 个（如 100）可学习 object query 交叉注意力查询图像，一次性并行输出 N 个（类，框）；③ 训练用匈牙利算法在 N 个预测与 M 个 GT 间求最优二分匹配（代价=分类概率+L1+GIoU 加权），匹配上的算正样本、其余全是背景——一对一监督让每个目标只有一个预测负责，重复框从根上消失，NMS 和 anchor 因此都可以扔掉。代价：二分匹配正样本极少（每目标仅 1 个），监督稀疏导致收敛极慢（COCO 需 500 epoch，YOLO 只要 100），且全局注意力对小目标不友好——这正是 Deformable DETR（每 query 只采 K 点，收敛快 10 倍）和 DINO（对比去噪训练）要解决的。

【实际案例】字节广告审核的图文检测曾维护一套 YOLO+人工 anchor 体系，每次换业务（电商→直播→本地生活）都要重聚类 anchor、调 NMS 阈值，耗费两人周。切 Deformable DETR 后 anchor 与 NMS 超参全部消失，新业务迁移只需换数据训 50 epoch，mAP 持平（67.1 vs 67.4），人力降到 2 天。失败教训：直接上原始 DETR 训 300 epoch 仍未收敛到 YOLO 水平，小目标 AP 差 8 个点，换 Deformable 版本+多尺度特征才追平。美团无人车用 DINO 做长尾障碍物（锥桶、三角牌）检测，query 去噪训练让收敛提速 3 倍。

【举一反三】集合预测思想正在扩散：实例分割 MaskFormer 用 query 预测 mask 集合、多目标跟踪 MOTR 用 track query 免关联后处理。决策模型：超参敏感、业务迁移频繁、类别少的场景选 DETR 系；极致实时、边缘部署仍选 YOLO 系。

【扣分点对照】背八股的会说"DETR 用 Transformer 去掉 NMS"；真做过的能讲出匈牙利匹配的代价矩阵构造、一对一匹配为何导致收敛慢（正样本稀疏），以及 Deformable Attention 为何提速（K 点采样替代全图 n² 注意力）。

\`\`\`python
import torch
from scipy.optimize import linear_sum_assignment
def hungarian_match(pred_logits, pred_boxes, gt_labels, gt_boxes):
    # 代价矩阵：分类 + L1 框回归 + GIoU 加权
    cost_cls = -pred_logits.softmax(-1)[:, gt_labels]  # (N,M)
    cost_box = torch.cdist(pred_boxes, gt_boxes, p=1)
    cost = cost_cls + 5.0 * cost_box
    row, col = linear_sum_assignment(cost.detach().cpu())  # 最优二分匹配
    return row, col  # 匹配上的为正样本，其余全背景
\`\`\`

踩坑：① 原始 DETR 不训 500 epoch 结论无效，算力不够别硬上；② query 数 N 小于图上最大目标数会系统性漏检；③ 二分匹配对 batch 内目标数方差敏感，多机训练梯度噪声大，需大 batch 或梯度累积。`,
    keyPoints: ["集合预测 N 个 query 出框", "匈牙利匹配一对一监督", "免 NMS 免 anchor", "Deformable 解决收敛慢"],
    followUps: ["匈牙利匹配代价矩阵怎么构造？（提示：分类概率+L1+GIoU 加权求和）", "DETR 为何收敛慢？（提示：一对一匹配正样本极稀疏，监督信号弱）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-103",
    nodeId: "ai-cv-detection",
    question: "NMS 原理？Soft-NMS 改进？mAP 如何计算？",
    answer: `【分层原理】结论：NMS 是去重贪心算法——按置信度降序，保留最高分框，删掉与其 IoU>阈值的所有框，循环到清空。缺陷：遮挡/密集场景两个真实目标 IoU 高（>0.5）会被误删一个。Soft-NMS 不删除而是按 IoU 连续衰减分数（线性 f=1-IoU 或高斯 f=exp(-IoU²/σ)），被压低的真目标可在后续轮次复活。mAP 计算：单类按置信度排序，逐点算 precision/recall 得 PR 曲线，101 点插值平均得 AP；COCO 标准 AP 是 IoU 从 0.5 到 0.95 步长 0.05 共 10 个阈值的平均，再对类别取 macro 均值。AP50 看检出能力、AP75 看定位质量，APs/APm/APl 按目标面积分层——读懂这组指标才能诊断模型短板在哪。

【实际案例】腾讯某广场人流密度检测项目，初版 NMS 阈值 0.5，高峰期遮挡召回只有 71%，漏检集中在两人贴身场景（IoU≈0.6 被互删）。迭代：换 Soft-NMS（高斯 σ=0.5）召回升到 79%，但低分框复活导致误检增多，再把置信度阈值从 0.3 提到 0.42 平衡，最终 precision 91.2%/recall 78.5%。后试 YOLOv8 自带 DIoU-NMS：中心点距离+IoU 联合惩罚，召回持平但误检少 3 个点，最终上线。指标侧，团队曾因只报 AP50 被挑战"定位不准"，补报 AP75（仅 52.1）后把回归损失从 Smooth L1 换 CIoU，AP75 提到 55.8。

【举一反三】NMS 的"贪心去重+分数衰减"与推荐重排（MMR 多样性）、NLP 束搜索去重同构。mAP 分层诊断法可迁移到任何排序任务：按难度切片看指标，别只看总分。

【扣分点对照】背八股的会背"NMS 删重复框、mAP 是 PR 曲线下面积"；真做过的能讲出 COCO AP 与 VOC AP 的计算差异（101 点 vs 11 点插值）、密集场景 NMS 为何是系统瓶颈，以及 DIoU-NMS 用中心距惩罚的几何直觉。

\`\`\`python
import numpy as np
def nms(boxes, scores, iou_thr=0.5):
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        ious = box_iou(boxes[i], boxes[order[1:]])
        order = order[1:][ious < iou_thr]  # 删掉与最高分框重叠过大的
    return keep
# Soft-NMS：不删除，scores[1:] *= np.exp(-(ious ** 2) / sigma)
\`\`\`

踩坑：① NMS 阈值随场景密度调，照搬 0.5 在密集场景必翻车；② 评估脚本与训练框架坐标格式（xyxy/xywh、含不含右边界）不一致会让 mAP 假性掉 10+ 点；③ 视频检测逐帧 NMS 会闪烁，需跨帧 IoU 匹配做时序平滑。`,
    keyPoints: ["NMS 贪心按 IoU 删重复", "Soft-NMS 连续衰减防误删", "COCO AP=10 个 IoU 阈值均值", "AP75 暴露定位质量"],
    followUps: ["DIoU-NMS 为何适合遮挡？（提示：中心距惩罚保留贴近的真框）", "mAP 分层怎么看？（提示：APs/APm/APl 按面积切片诊断短板）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-104",
    nodeId: "ai-cv-detection",
    question: "Anchor-free 检测（FCOS/CenterNet）原理？相比 anchor-based 优势？",
    answer: `【分层原理】结论：anchor-free 把"预设参考框再回归偏移"改为"直接预测目标几何"。两条代表路线：① FCOS 逐像素回归——特征图每个位置若落在 GT 框内即正样本，直接预测到四边的距离 (l,t,r,b)，再加 centerness 分支预测"离中心多近"，推理时 centerness×分类分抑制远离中心的低质框；② CenterNet 关键点路线——用热力图峰值定位目标中心（高斯核渲染 GT），在中心点回归宽高，把检测变成标准关键点估计。优势本质：anchor 的尺度/长宽比/IoU 阈值这组强超参全部消失，正样本定义从"框匹配"变成"点落在框内"，对新领域目标形状泛化更好，且省掉 anchor 匹配计算（9 anchor×HW→HW）。YOLOv8 起全系转 anchor-free 印证了工业共识。

【实际案例】美团无人车早期用 YOLOv5（anchor-based）检测异形障碍物——侧翻三轮车长宽比 5:1 超出 anchor 先验（最高 3:1），召回仅 68%。换 FCOS 后不需要 anchor 先验，异形框召回升到 83%；但引入新问题：密集行人场景两个目标中心重叠，同一像素同时是两个框的正样本产生歧义。迭代动作：center sampling（只有中心 1.5 倍半径内像素当正样本）+centerness 加权，歧义样本减少 70%，最终行人 mAP 84.6% 上车。海康口罩检测用 CenterNet，热力图方案把推理压到 6ms/帧（RK3399 端侧）。

【举一反三】anchor-free 本质是"用关键点/直接几何取代手工先验"，与 NLP 的 span 抽取取代 BIO 模板、3D 检测 CenterPoint 取代 3D anchor 是同一波去先验浪潮。决策模型：目标形状多样/长宽比极端→anchor-free；类别极多（>1000）时 anchor 的类先验仍有价值。

【扣分点对照】背八股的会说"不用 anchor 所以超参少"；真做过的能讲出 FCOS 的 centerness 为什么用 BCE 而非回归、中心重叠歧义怎么解（center sampling/FPN 分层分配），以及 anchor-free 为何天然契合 FPN（每层限定回归尺度范围）。

\`\`\`python
import torch
# FCOS 回归头：每个特征位置预测到四边距离 + centerness
lrtb = reg_head(feat)         # (B,4,H,W) 四边距离
centerness = ctr_head(feat)   # (B,1,H,W) BCE 训练
cls_score = cls_head(feat)    # (B,C,H,W)
score = cls_score.sigmoid() * centerness.sigmoid()  # 推理时相乘抑制低质框
# FPN 分层：P3 回归 [0,64]，P4 [64,128]，P5 [128,256]... 每层尺度范围限定
\`\`\`

踩坑：① centerness 忘乘或训崩，低质框刷爆 NMS；② CenterNet 4 倍下采样后小目标中心高斯核被抹掉，需按目标尺寸调核半径公式；③ anchor-free 正样本多（框内全像素），类别不平衡更重，Focal Loss γ 要比 anchor-based 调大。`,
    keyPoints: ["FCOS 逐像素回归四边距离", "centerness 抑制低质框", "CenterNet 热力图定中心", "无 anchor 先验适配异形目标"],
    followUps: ["中心重叠歧义怎么解？（提示：center sampling 限定中心区域+FPN 分层分配）", "anchor-free 为何配 FPN？（提示：每层限定回归尺度范围，缓解目标重叠）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-275",
    nodeId: "ai-cv-detection",
    question: "YOLO 从 v1 到 v8/v11 的演进脉络？每一代解决了什么问题？",
    answer: `【分层原理】结论：YOLO 十年演进是一部"补短板"史。v1（2016）奠基单阶段网格回归，短板是小目标（网格粗）与定位差；v2 引入 anchor+BN+高分辨率分类预训练；v3 多尺度预测（FPN 雏形）+Darknet-53。v4/v5 进入工程时代：CSPNet 梯度分流省算力、PAN 双向特征融合、Mosaic 增强、CIoU 损失，v5 用 PyTorch 重写并靠极佳工程生态（导出/量化/部署一键化）统治工业界。v6/v7 研究重参数化（RepVGG 式：训练多分支、推理融合成单路）与 E-ELAN 梯度路径设计。v8 转 anchor-free+解耦头（分类与回归分支分开，缓解任务冲突）+Task-Aligned Assigner 动态正样本分配+DFL 分布化回归。v9/v10/v11：v10 用一致双重分配实现 NMS-free 训练（端到端再快 20%），v11 换 C3k2 模块同精度参数减 22%。主线清晰：样本定义越来越动态、回归目标越来越分布化、部署越来越友好。

【实际案例】美团无人车感知团队五年三次迁移：2021 年 YOLOv5s（mAP 79.2，Orin 12ms）→2023 年 YOLOv8s（anchor-free 解决异形车 anchor 失配，mAP 82.4 同延迟）→2024 年试 v10 去 NMS，端到端延迟降 1.8ms 但小目标召回掉 1.1 个点，权衡后保留 v8 上线、v10 用于离线盘点场景。失败教训：v5→v8 迁移时沿用训练配置，DFL 的 reg_max 默认 16 对 1280 大输入（框宽可超 320 像素）不够，框回归饱和，调 reg_max=20 才恢复。海康渠道工程师人均会训 YOLO，是它打败精度更高对手的真正原因——工具链就是护城河。

【举一反三】重参数化、动态标签分配、分布化回归三个思想已跨域：RepVGG 思想进 LLM（多 LoRA 合并）、对齐思想进推荐（精排多目标对齐）。决策模型：跟踪框架演进别背版本号，抓"样本定义/特征融合/推理结构"三条主线。

【扣分点对照】背八股的会背版本流水账；真做过的能讲出 v8 为何去 anchor（静态匹配变动态对齐）、DFL 为什么要 16 个离散 bin（框边位置本质是分布），以及 v10 NMS-free 为何小目标略掉（一对一监督正样本变少）。

\`\`\`python
from ultralytics import YOLO
# v5/v8/v10/v11 同一 API，迁移成本主要在训练超参而非代码
model = YOLO("yolov8s.pt")
model.train(data="car.yaml", epochs=150, imgsz=1280,
            close_mosaic=10)          # 最后 10 epoch 关 Mosaic 收敛更稳
# DFL reg_max 要按最大框尺度调整（大分辨率输入调大）
# model.model.args.reg_max = 20
metrics = model.val()  # box.map / box.map50 / box.map75 分层看定位质量
\`\`\`

踩坑：① 版本间 anchor 机制不同，v5 的 anchor 聚类脚本别用到 v8；② 重参数化模型导出 ONNX 前必须 fuse，否则推理慢 3 倍；③ 直接沿用旧版超参（lr/增强/reg_max）是迁移最常见翻车点。`,
    keyPoints: ["v1-v3 奠基 anchor+多尺度", "v4-v7 CSP+重参数化工程化", "v8 转 anchor-free+动态分配", "v10 双重分配实现 NMS-free"],
    followUps: ["v8 为何去 anchor？（提示：动态 Task-Aligned 分配取代静态 anchor 匹配）", "reg_max 为何随分辨率调？（提示：DFL 离散 bin 数要覆盖最大框尺度）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-276",
    nodeId: "ai-cv-detection",
    question: "FPN 多尺度特征融合原理？小目标检测有哪些系统优化手段？",
    answer: `【分层原理】结论：FPN（Feature Pyramid Network）解决"深层语义强但分辨率低、浅层分辨率高但语义弱"的矛盾。结构：自顶向下路径把深层特征 2 倍上采样，与同层侧向连接（1×1 conv 对齐通道）相加，得到 {P2,P3,P4,P5}（stride 4/8/16/32）每层都"高语义+高分辨率"；检测头按目标尺度分配到对应层（小目标去 P2、大目标去 P5），各层共享 head 权重，代价是算力涨 3-4 倍。后续改进：PAN 加自底向上二次增强（浅层定位信息回灌深层）、BiFPN 加权双向融合。小目标系统打法：① 高分辨率输入/P2 检测头；② 数据侧 Copy-Paste、Mosaic、小目标过采样；③ anchor 重聚类或 anchor-free 细粒度分配；④ 损失换 NWD（归一化 Wasserstein 距离——小目标框偏移 1 像素 IoU 就崩、梯度失效，NWD 把框建模为 2D 高斯，无重叠也可导）；⑤ 推理滑窗切片（SAHI）。

【实际案例】海康高空抛物检测：目标 20×20 像素级，基线 YOLOv5（无 P2）召回仅 54%。迭代链：加 P2 头召回 71%（算力涨 40%）→Copy-Paste 把抛物目标贴到不同楼层背景召回 79%→IoU 换 NWD 损失召回 84.5%，误报率反降。代价：P2 层让海思边缘芯片 FPS 从 25 掉到 14，最终 P2 头通道砍半+INT8 量化回到 22 FPS 上线。电网无人机巡检场景，SAHI 切片把 4K 图切成 640 小图检测再合并，绝缘子缺陷召回从 61% 提到 93%，代价是推理时间 6 倍——离线巡检可容忍。

【举一反三】"多尺度显式建模"思想通用：语音多窗长 FBank、时序预测多周期分解。决策模型：目标尺度跨度 >8 倍就该上金字塔结构；尺度集中（如近景人脸）单尺度深网络反而更优。

【扣分点对照】背八股的会说"FPN 自顶向下融合"；真做过的能讲出为什么用相加而非 concat（省通道算力、层差已由 1×1 对齐）、P2 层为何常被工业砍掉（stride 4 算力占大头），以及 NWD 替代 IoU 的数学动机。

\`\`\`python
import torch
import torch.nn.functional as F
def fpn_forward(c2, c3, c4, c5):
    lateral = [conv1x1(c) for c in (c2, c3, c4, c5)]  # 侧向 1×1 对齐通道
    p5 = lateral[3]
    p4 = lateral[2] + F.interpolate(p5, scale_factor=2)  # 自顶向下相加
    p3 = lateral[1] + F.interpolate(p4, scale_factor=2)
    p2 = lateral[0] + F.interpolate(p3, scale_factor=2)
    return p2, p3, p4, p5  # 小目标 head 接 p2（stride 4）
\`\`\`

踩坑：① FPN 各层共享 head 时 anchor 是每层单尺度，别按老 Faster R-CNN 习惯每层多尺度；② Copy-Paste 要贴合理背景区域，贴天上会学伪相关；③ SAHI 切片重叠率 0.2-0.3，太低边界目标被切成两半漏检。`,
    keyPoints: ["FPN 自顶向下+侧向相加", "小目标走 P2 大目标走 P5", "NWD 解小目标 IoU 梯度失效", "SAHI 切片提小目标召回"],
    followUps: ["为何融合用相加非 concat？（提示：1×1 对齐通道后相加省算力）", "NWD 的数学形式？（提示：框建模 2D 高斯，Wasserstein 距离无重叠也可导）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-277",
    nodeId: "ai-cv-detection",
    question: "IoU / GIoU / DIoU / CIoU 回归损失的演进逻辑？各自解决什么问题？",
    answer: `【分层原理】结论：边界框回归损失从 L1/L2 演进到 IoU 族，动机是"评估指标就是 IoU，直接优化它"。① IoU Loss=1-IoU：与指标一致且尺度不变，但不重叠时梯度消失，无法区分"差一点"和"差很远"；② GIoU 引入最小闭包框 C：GIoU=IoU-|C\(A∪B)|/|C|，不重叠时闭包越小罚越轻、梯度始终存在，但两框呈包含关系时闭包不再变化，退化为 IoU；③ DIoU 直接惩罚中心点归一化距离 ρ²/c²（c 为闭包对角线），收敛更快且天然处理包含场景；④ CIoU 在 DIoU 上加长宽比一致性项 α·v，三要素齐全。工程共识：训练用 CIoU（YOLOv5 起标配），NMS 用 DIoU（中心距惩罚对密集遮挡更准），小目标换 NWD（IoU 族对微小偏移梯度不稳）。

【实际案例】宇视交通卡口检测：Smooth L1 换 CIoU 后 mAP@0.75 提升 2.8 个点（定位改善最直观体现在高 IoU 阈值），收敛从 180 epoch 降到 140。失败形态：车牌这种极端长宽比（约 3:1）任务，CIoU 长宽比项 v 在 GT 高接近 0 时梯度不稳，改 DIoU 或梯度截断才稳。美团无人车密集场景 NMS 换 DIoU-NMS，遮挡车辆误删率降 35%，召回提升 2.1 个点——同一几何先验，一处用于训练、一处用于后处理。

【举一反三】"把评估指标可微化"是通用方法论：分割 Lovász-IoU、排序 LambdaRank、语音 CTC 同思路。决策模型：按失败形态选——不重叠多→GIoU/DIoU，收敛慢→DIoU，形状敏感→CIoU，微小目标→NWD。

【扣分点对照】背八股的会背四个名字；真做过的能讲出 GIoU 在包含关系下退化为 IoU 的直觉、DIoU-NMS 为何适合遮挡（中心距惩罚保留贴近框），以及 CIoU 长宽比项在极端比例下的数值陷阱。

\`\`\`python
import torch
def ciou_loss(p, t, eps=1e-7):  # p/t: (N,4) xyxy
    inter = (torch.min(p[:, 2:], t[:, 2:]) - torch.max(p[:, :2], t[:, :2])).clamp(0).prod(1)
    iou = inter / (box_area(p) + box_area(t) - inter + eps)
    c2 = (torch.max(p[:, 2:], t[:, 2:]) - torch.min(p[:, :2], t[:, :2])).pow(2).sum(1) + eps
    rho2 = (center(p) - center(t)).pow(2).sum(1)   # 中心距平方（DIoU 项）
    v = (4 / 3.14159 ** 2) * (torch.atan(w(t) / h(t)) - torch.atan(w(p) / h(p))).pow(2)
    alpha = (v / (1 - iou + v + eps)).detach()     # α 必须 stop-gradient
    return (1 - iou + rho2 / c2 + alpha * v).mean()  # IoU+中心距+长宽比
\`\`\`

踩坑：① α 的分母项要 stop-gradient 否则数值震荡；② IoU 族损失训练初期收敛慢，前几个 epoch 混 L1 热身更稳；③ 只报 AP50 看不出回归改进，定位提升要看 AP75。`,
    keyPoints: ["IoU 不重叠时梯度消失", "GIoU 闭包罚项 包含时退化", "DIoU 罚中心距收敛更快", "CIoU 加长宽比一致性"],
    followUps: ["GIoU 何时退化为 IoU？（提示：两框包含关系时最小闭包不再变化）", "小目标为何换 NWD？（提示：偏移 1 像素 IoU 剧变，梯度不稳）"],
    favorited: false,
    bigTech: false,
  },

  // ===== ai-cv-segmentation =====

  {
    id: "ai-105",
    nodeId: "ai-cv-segmentation",
    question: "语义分割 vs 实例分割 vs 全景分割区别？U-Net 原理？",
    answer: `【分层原理】结论：三个任务按"输出什么"区分——语义分割给每个像素一个类标签（同类实例不区分，图里三辆车都是"车"）；实例分割只针对可数目标（thing），每像素=（类，实例 id）；全景分割=语义+实例统一，stuff（天空道路）只给语义、thing（车人）给语义+实例。U-Net 是语义分割奠基架构：左半 encoder 四次 2 倍下采样提语义，右半 decoder 对称上采样恢复分辨率，关键是同层跳跃连接把 encoder 高分辨率特征 concat 到 decoder——下采样丢失的空间细节（边界、小结构）经短路径直接回灌，使"深语义+精定位"兼得。2015 年为医学小数据设计：弹性形变增强+边界像素加权损失分离贴连细胞，299 张训练图即赢 ISBI 挑战赛。

【实际案例】推想医疗肺结节分割初版用 FCN，结节边界模糊导致直径测量误差 2.1mm（临床要求 <1mm，影响良恶性随访判断）。换 U-Net 后跳跃连接补回边界细节，误差降到 0.8mm，Dice 从 0.83 提到 0.91；再加深监督（每层 decoder 都出损失）收敛提速 40%。失败教训：直接套用自然图增强（色彩抖动）污染 CT 的 HU 值物理含义，模型学到伪相关，外部医院测试集 Dice 掉 12 个点——医学增强只能用弹性形变/旋转/镜像这类保持物理意义的变换。百度 Apollo 可行驶区域分割用 U-Net 变体在车载平台 720p 跑到 39 FPS。

【举一反三】U 形+跳跃连接已成分割/生成通用骨架：扩散模型的去噪网络就是带注意力的 U-Net；图像恢复（去噪/超分）也全是 U-Net 变体。决策模型：需要像素级输出先想 U 形；数据少就跳跃连接+深监督+强几何增强三件套。

【扣分点对照】背八股的会说"U-Net 有跳跃连接"；真做过的能讲出跳跃连接补的是高频细节而非语义、输入尺寸为何要 2 的幂次（4 次池化对齐），以及贴连实例为何不能靠语义分割+连通域硬拆（需实例嵌入或 proposal 机制）。

\`\`\`python
import segmentation_models_pytorch as smp
model = smp.Unet(encoder_name="resnet34", classes=1, activation=None)
mask = model(image)  # (B,1,H,W) 二值掩码 logits
# 跳跃连接：encoder 第 i 层特征 concat 到 decoder 对称层
# decoder[i] = conv(cat([upsample(decoder[i+1]), encoder[i]]))
# 小数据三件套：深监督 + 弹性形变增强 + Dice/CE 组合损失
\`\`\`

踩坑：① 输入尺寸非 16 倍数时 concat 错位 1 像素，边界指标莫名掉点；② 前景占比 <1% 用 CE 必收敛到全背景，Dice/Focal 起步；③ 3D 医学数据显存爆，改 patch 训练+滑窗推理+重叠融合。`,
    keyPoints: ["语义不分实例 实例分 id", "U-Net 跳跃连接回灌细节", "深监督+几何增强小数据三件套", "贴连实例需专门机制拆分"],
    followUps: ["跳跃连接补的是什么？（提示：下采样丢失的高频空间细节，非语义）", "贴连实例为何不能用连通域拆？（提示：掩码相连，需实例嵌入或 proposal 机制）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-106",
    nodeId: "ai-cv-segmentation",
    question: "DeepLab 系列原理？空洞卷积和 ASPP 作用？",
    answer: `【分层原理】结论：DeepLab 系列围绕一个矛盾展开——下采样提感受野但毁分辨率，不降分辨率则感受野不够。空洞卷积（dilated/atrous conv）是解：卷积核元素间插空洞，3×3 核 rate=2 时等效感受野 7×7，参数与计算量不变、特征图不缩小，感受野指数扩大。但单 rate 只抓一种尺度，ASPP（Atrous Spatial Pyramid Pooling）并行多个 rate（如 6/12/18）的空洞卷积+全局池化，多尺度上下文拼接融合——近处小目标、远处大目标由不同 rate 分支各司其职。版本演进：v1 空洞卷积+CRF 后处理；v2 提出 ASPP；v3 去 CRF、ASPP 加 BN 与全局池化；v3+ 加浅层 decoder 恢复边界（stride-16 特征与 stride-4 浅层融合上采），Cityscapes mIoU 82.1%。

【实际案例】地平线征程芯片的车道线+可行驶区域分割用 DeepLabv3+ 改造版：主干换 EfficientNet-Lite，ASPP 的 rate 从 (6,12,18) 调成 (3,6,9) 适配 512×256 输入——rate 超过特征图尺寸会退化成 1×1 卷积，这是移植最常踩的坑；mIoU 保持 71.3%，INT8 量化后掉 1.1 个点，单帧 11ms。百度 Apollo 早期用 DeepLab 做障碍物分割，失败案例：50m 外车辆 mIoU 仅 54%，诊断是全局池化分支把远处小目标语义淹没，迭代为浅层加强+按距离加权损失，远距 mIoU 升到 63%。

【举一反三】空洞卷积"不降分辨率扩感受野"迁移到时序：WaveNet 因果空洞卷积做语音生成、TCN 做动作分割。ASPP 的多分支多尺度与 Inception、FPN 同一哲学——显式多尺度比指望单分支自适应靠谱。

【扣分点对照】背八股的会背"空洞卷积扩感受野、ASPP 多尺度"；真做过的能讲出 rate 超特征图尺寸退化为 1×1 的边界条件、gridding 效应（采样稀疏像梳齿，HDC 互质 rate 组合缓解），以及 v3+ 为何只融一层浅层而非 U-Net 全连（层差太大 concat 有害）。

\`\`\`python
from torchvision.models.segmentation import deeplabv3_resnet50
model = deeplabv3_resnet50(weights="DEFAULT", num_classes=21)
out = model(img)["out"]  # (B,21,H,W)
# ASPP 核心：并行 rate=[6,12,18] 空洞卷积 + 全局池化分支
# 空洞卷积：nn.Conv2d(C, C, 3, padding=rate, dilation=rate)
# 注意 rate 必须小于特征图尺寸，否则退化为 1×1 卷积
\`\`\`

踩坑：① 空洞卷积 gridding 效应让特征图出现棋盘伪影，rate 组合要互质（如 1,2,5）；② output stride=8 比 16 精度高约 1.5 个点但显存翻倍；③ ASPP 各分支 BN 统计不一致，多卡训练要同步 BN。`,
    keyPoints: ["空洞卷积扩感受野保分辨率", "ASPP 多 rate 并行抓多尺度", "rate 超特征图退化为 1×1", "v3+ 浅层 decoder 修边界"],
    followUps: ["什么是 gridding 效应？（提示：空洞采样稀疏像梳齿，互质 rate 组合缓解）", "为何只融合一层浅层特征？（提示：层差太大 concat 引入噪声）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-107",
    nodeId: "ai-cv-segmentation",
    question: "Mask R-CNN 实例分割原理？RoI Align 解决什么问题？",
    answer: `【分层原理】结论：Mask R-CNN=Faster R-CNN+第三条并行 mask 分支，每个 RoI 输出 28×28 像素级掩码。两个关键设计：① RoIAlign——RoIPool 把 proposal 浮点坐标两次量化取整（先除 stride 取整、再分 bin 取整），对 8 像素目标偏差可达 1-2 个特征像素；检测能忍（框回归会修正），分割不能忍（像素级错位直接坏 mask）。RoIAlign 取消量化，每个 bin 内双线性插值采样 4 点，坐标全程浮点，AP_mask 提升约 3 个点、小目标更多；② mask 分支按类独立预测——每 RoI 输出 K 个 28×28 掩码（每类一个），只用 GT 类那个算损失，分割与分类解耦、避免类间竞争。28×28 小尺寸再插值回原图，是该方案快的原因（不对全图做像素预测）。

【实际案例】旷视智慧零售货架商品识别用 Mask R-CNN 做单品分割：初版 RoIPool，小包装（口香糖 30×40 像素）mask IoU 只有 0.61，换 RoIAlign 后 0.74，单品计数准确率从 89% 提到 96%。后续失败形态：货架层板遮挡导致同实例断成两截、mask 只盖住一半，迭代加入 Boundary IoU 损失+mask 评分分支（Mask Scoring R-CNN），遮挡场景 AP_mask 再提 2.3 个点。美团菜品结算台用 Mask R-CNN 分割餐盘里每个菜，配合称重双重校验把结算错误率压到 0.3%。

【举一反三】RoIAlign"去量化、保子像素精度"在任何坐标敏感任务适用：关键点检测、OCR 文本框矫正、3D 重建特征采样。"按类独立预测解耦竞争"也通用——多标签分类用 sigmoid 而非 softmax 同一道理。

【扣分点对照】背八股的会说"RoIAlign 用双线性插值"；真做过的能讲出两次量化分别发生在哪、检测对量化不敏感而分割敏感的原因（回归可补偿 vs 像素不可补偿），以及 mask 为何 28×28 而非全分辨率（算力与 RoI 内信息密度权衡）。

\`\`\`python
from torchvision.models.detection import maskrcnn_resnet50_fpn
model = maskrcnn_resnet50_fpn(weights="DEFAULT")
model.eval()
out = model([img])[0]  # boxes/labels/scores/masks
masks = out["masks"]   # (N,1,H,W) 每实例一个掩码，0.5 阈值二值化
# RoIAlign：pool 尺寸内双线性插值采样，无坐标量化取整
from torchvision.ops import roi_align
pooled = roi_align(features, boxes, output_size=(7, 7), aligned=True)
\`\`\`

踩坑：① 自建实现里 RoIAlign 的 aligned 参数（half-pixel 偏移）与框架默认不一致会让 mask 整体偏半格；② mask 阈值 0.5 不是永远最优，按验证集 IoU 调；③ 实例数超 100 的图（人群）要调 MAX_DETECTIONS，否则静默截断漏检。`,
    keyPoints: ["检测框+掩码三分支并行", "RoIAlign 双线性插值去量化", "mask 按类独立预测解耦竞争", "28×28 小掩码再插值还原"],
    followUps: ["量化误差为何伤分割不伤检测？（提示：框回归可补偿，像素错位不可补偿）", "Mask Scoring R-CNN 改了什么？（提示：加 mask IoU 评分分支校准置信度）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-108",
    nodeId: "ai-cv-segmentation",
    question: "分割损失函数 Dice Loss / Focal Loss / IoU Loss 区别？类别不平衡怎么处理？",
    answer: `【分层原理】结论：分割损失选型围绕类别不平衡（前景常 <5% 像素）。① Dice Loss 直接优化 Dice 系数 2|A∩B|/(|A|+|B|)，梯度只看重叠区域，前景再小也有强信号、天然抗不平衡，但梯度随交并比非线性、训练初期易震荡；② Focal Loss 在 CE 上乘 (1-p)^γ，易分像素（大片背景）权重趋零，让难例主导梯度；③ IoU/Jaccard 类损失直接可微化交并比（Lovász 扩展把离散 IoU 延拓成光滑代理）；④ 边界类损失（Boundary/HD Loss）惩罚轮廓距离，补重叠类损失对边界不敏感的短板。工业标配是 CE+Dice 组合：CE 保证逐像素稳定梯度、Dice 保证全局重叠，nnU-Net 用这套默认组合横扫 50+ 医学分割竞赛。

【实际案例】联影肝脏肿瘤分割：肿瘤像素占比中位数仅 0.4%，纯 CE 训出来全预测肝（Dice≈0）。先用 Focal（γ=2）Dice 到 0.68 但小肿瘤仍漏；换纯 Dice 小肿瘤召回上来但假阳性飙升（Dice 对假阳性惩罚弱）；最终 CE+Dice 各 0.5 加权+深监督，肿瘤 Dice 0.79、假阳性率降 40%。自动驾驶侧，某 L4 团队车道线分割（线宽 4-8 像素，占比 0.1% 级）在 CE+Dice 外再叠 Boundary Loss，车道线断点数/公里从 3.2 降到 1.1——边界损失逼模型把线画"连"而非只画"对"。

【举一反三】"重叠损失+逐点损失组合"可迁移到任何结构化输出：OCR 文本检测 Dice+CE、关键点检测 heatmap MSE+offset L1。决策模型：前景占比 >10% 用 CE/Focal 即可，<1% 必须 Dice/IoU 类，边界敏感再叠距离类损失。

【扣分点对照】背八股的会背"Dice 处理不平衡"；真做过的能讲出 Dice 梯度在 p≈0 区域饱和的现象、Focal 为何解决不了"全背景坍缩"而 Dice 能（逐点 vs 区域梯度），以及 Lovász-Softmax 为何比直接 1-IoU 更稳。

\`\`\`python
import torch
def dice_loss(pred, target, eps=1e-6):
    pred = pred.sigmoid()
    inter = (pred * target).sum(dim=(1, 2))
    return 1 - (2 * inter + eps) / (pred.sum(dim=(1, 2)) + target.sum(dim=(1, 2)) + eps).mean()
def focal_loss(logits, target, gamma=2.0):
    ce = torch.nn.functional.cross_entropy(logits, target, reduction="none")
    return ((1 - torch.exp(-ce)) ** gamma * ce).mean()
# 工业标配：loss = 0.5 * ce + 0.5 * dice，逐类算 Dice 再平均
\`\`\`

踩坑：① Dice 分母忘加 eps，首图全背景时梯度 NaN；② 多类分割要逐类算 Dice 再平均，macro/micro 混用指标差 5 个点；③ 组合损失权重 1:1 起步，别信论文魔法数字，按验证集网格搜。`,
    keyPoints: ["Dice 优化重叠 抗极端不平衡", "Focal 降易分像素权重", "CE+Dice 组合是工业标配", "边界敏感任务叠距离损失"],
    followUps: ["Dice 梯度有何缺陷？（提示：p≈0 区域梯度饱和，训练初期震荡）", "Lovász-IoU 为何更稳？（提示：把离散 IoU 延拓为光滑代理损失）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-109",
    nodeId: "ai-cv-segmentation",
    question: "医学图像分割（MRI/CT）有何特殊性？如何处理小目标和不平衡？",
    answer: `【分层原理】结论：医学分割的特殊性四条——数据少（单病种几百例 vs 自然图百万级）、标注贵（一个 3D CT 勾画 30 分钟、需执业医师）、前景极小（肿瘤常 <1% 体素）、模态是 3D 体数据且灰度有物理意义（CT 的 HU 值）。对应打法：① 架构用 3D U-Net/V-Net 或 2.5D（相邻几层当通道，省显存又带上下文）；② nnU-Net 范式——不做架构创新，把预处理（重采样统一 spacing、HU 窗宽窗位归一化）、patch 采样（前景过采样保证 1/3 patch 含目标）、增强（弹性形变/旋转/gamma）全自动配置，这套"配方优先"的方法拿了 30+ 个挑战赛冠军；③ 小目标用 Dice+深监督+级联（先粗分割定位器官、再 ROI 内精分割病灶）；④ 标注稀缺用半监督（Mean Teacher 一致性正则）和迁移学习。

【实际案例】推想医疗肺结节项目：初版 2D U-Net 逐层分割，结节漏检率 18%——单层看不到结节的球状上下文。迭代一：2.5D 输入（前后各 2 层共 5 通道），漏检降到 11%；迭代二：级联 3D U-Net 精分割 Dice 0.91，但显存从 8G 涨到 22G，推理改滑窗+高斯权重融合解决拼接缝。腾讯觅影眼底血管分割只有 400 张标注，用 Mean Teacher 半监督（400 标注+3000 未标注），血管 Dice 从 0.78 提到 0.84，相当于多标 1000 张。失败教训：不同医院 CT 重建核不同（软组织核/骨核），混训后模型"看机器下菜碟"，按机型分层评估+分域归一化才稳住外部测试。

【举一反三】"配方自动化优先于架构创新"可迁移到任何垂直领域：先把预处理/采样/增强做成数据驱动自动配置，最后才动架构。级联"粗定位+精分割"也通用：人脸关键点先检测框再回归、工业缺陷先整图筛疑似再放大复检。

【扣分点对照】背八股的会说"医学数据少用 U-Net"；真做过的能讲出 HU 窗宽窗位（肺窗 [-1200,600]）的物理意义、2.5D 为何是显存与上下文的甜区，以及多中心域偏移（机型/层厚/重建核）才是医学 AI 落地的真实主战场。

\`\`\`python
from monai.networks.nets import UNet
# 3D U-Net 处理体积数据：patch 训练 + 滑窗推理
model = UNet(spatial_dims=3, in_channels=1, out_channels=2,
             channels=(16, 32, 64, 128), strides=(2, 2, 2))
# 2.5D 替代：相邻 5 层堆叠为多通道输入 2D U-Net，显存省 4 倍
# 前景过采样：保证每个 batch 至少 1/3 patch 含目标体素
\`\`\`

踩坑：① patch 随机采样会让前景占比 <0.1% 的任务训不动，必须前景过采样；② 滑窗推理硬拼接有块状伪影，用高斯权重或 1/2 重叠融合；③ 标注者间差异（两医生勾画 IoU 常只有 0.75-0.85）决定模型上限，先做一致性分析再定验收指标。`,
    keyPoints: ["3D 体数据 patch 训练滑窗推理", "2.5D 平衡显存与上下文", "nnU-Net 配方优先于架构", "域偏移是落地主战场"],
    followUps: ["HU 窗宽窗位是什么？（提示：CT 值物理窗口，肺窗 [-1200,600]）", "半监督医学分割主流方法？（提示：Mean Teacher 一致性正则）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-110",
    nodeId: "ai-cv-segmentation",
    question: "自动驾驶分割场景：BEV 感知、多视角融合如何做？",
    answer: `【分层原理】结论：BEV（鸟瞰图）感知把多路相机图像统一变换到俯视平面坐标系，在 BEV 空间做检测/分割/跟踪。两条技术路线：① 自底向上 LSS（Lift-Splat-Shoot）——每像素预测深度分布，按深度把图像特征"抬升"成视锥点云，再 splat 到 BEV 网格池化，显式几何可解释但深度误差直接传导；② 自顶向下 BEVFormer——预定义 BEV 平面 query（如 200×200 网格），用可变形注意力让每个 query 按相机标定参数投影回各路图像采样特征，再加时序自注意力融合历史帧 BEV，隐式学几何、无需显式深度监督。时序融合是 BEV 的另一红利：多帧 BEV 对齐后天然支持速度估计与遮挡补全。标定是精度地基：1° 安装偏差在 50m 处投影偏移近 1m。

【实际案例】蔚来 NT2.0 平台用 BEVFormer 类架构融合 7 颗 800 万像素环视相机，BEV 网格 200×200（0.5m/格，覆盖 100m），障碍物检测 mAP 比单目方案高 12 个点，静止车辆召回从 71% 提到 89%——单目对静止异形车深度估计差，BEV 靠时序累积解决。失败案例：某团队标定过期（载重变化致外参漂移 0.8°），BEV 拼接处出现重影、远处 mAP 掉 6 个点，加在线标定模块后恢复。小鹏 XNet 用 BEV+Occupancy 推送后，城市 NGP 接管率降约 30%。

【举一反三】"统一坐标系+多传感器融合"范式可迁移：机器人 SLAM 多传感器因子图、安防多摄像头跨镜追踪（先映射到平面图再关联）。决策模型：传感器重叠视场多、需跨相机几何一致性→BEV；传感器少且单视角可解→别为用而用。

【扣分点对照】背八股的会说"BEV 就是鸟瞰图融合"；真做过的能讲出 LSS 与 BEVFormer 的深度处理差异（显式分布 vs 隐式注意力）、标定误差如何沿链路放大，以及 Occupancy 相对 BEV 分割的进步（免枚举类别，直接预测体素占据+语义，天然处理长尾异形障碍物）。

\`\`\`python
import torch
# BEVFormer 简化：BEV query 反投影采样多相机特征
bev_query = torch.zeros(B, C, H_bev, W_bev)  # 预定义鸟瞰网格
ref_points = project_bev_to_cams(bev_query, cam_extrinsics)  # 按外参投影
bev_feat = deform_attn(bev_query, multi_cam_feats, ref_points)
bev_feat = temporal_attn(bev_feat, prev_bev_aligned)  # ego-motion 补偿后融合
seg = seg_head(bev_feat)  # BEV 空间直接输出可行驶区域分割
\`\`\`

踩坑：① 标定要随载重/胎压/悬架在线更新，离线标定撑不过三个月；② 时序融合必须做 ego-motion 补偿（轮速/IMU 把历史 BEV 对齐当前帧），忘对齐时转弯场景特征全糊；③ BEV 网格 0.5m vs 0.25m 显存差 4 倍，车道线任务才需要细网格。`,
    keyPoints: ["BEV 统一多相机坐标系", "LSS 显式深度 BEVFormer 隐式", "时序融合需 ego-motion 补偿", "标定误差沿链路放大"],
    followUps: ["LSS 与 BEVFormer 核心差异？（提示：显式深度分布抬升 vs query 反投影采样）", "Occupancy 解决了什么？（提示：免枚举类别，体素占据处理长尾异形障碍物）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-111",
    nodeId: "ai-cv-segmentation",
    question: "全景分割（Panoptic Segmentation）原理？stuff 与 thing 如何统一？",
    answer: `【分层原理】结论：全景分割要求给每个像素一个"语义标签+实例 id"二元组：stuff（天空、道路等不可数区域）只做语义分割，thing（车、人等可数个体）还要区分实例。早期方案是双支路拼接（Panoptic FPN：语义头+Mask R-CNN 头，再启发式合并、重叠区按置信度裁决）；MaskFormer 带来范式统一——不再逐像素分类，而是用 N 个 query 预测 N 组二值 mask+类别分布，stuff 与 thing 都视为"一组掩码"，与 DETR 同构用匈牙利匹配做监督。评估指标 PQ=SQ×RQ：SQ 是匹配段（IoU>0.5）的平均 IoU，RQ 是匹配段的 F1，漏检、错分、碎 mask 被同时惩罚。Mask2Former 进一步用 masked attention（query 只关注预测 mask 内像素）把 COCO PQ 推到 57.8。

【实际案例】华为智驾域控用全景分割一次输出车道线/可行驶区域（stuff）+车辆行人（thing），替代原先三个独立模型，Orin 上推理从 3 帧/秒提到 11 帧/秒，城区场景要素召回 96.2%。失败形态：双支路方案在 thing 与 stuff 重叠区（公交车车身广告被语义头判为"广告牌"）产生鬼影，裁决规则调了两周仍漏 3%；迁移 MaskFormer 统一输出后消除冲突，PQ 从 48.1 提到 53.6。代价是 query 数从 100 加到 200 才覆盖早晚高峰稠密车流，显存涨 35%，靠稀疏化注意力回落。

【举一反三】"集合预测统一多任务"已扩散到多目标跟踪（MOTR 用 query 统一检测+关联）、3D 占用预测（稀疏 query 预测体素语义）。决策模型：多任务输出互相重叠冲突时，优先集合预测统一，而非堆裁决规则——规则是无底洞。

【扣分点对照】背八股的会说"全景=语义+实例"；真做过的能讲出 PQ 中 IoU>0.5 匹配门槛对碎 mask 的惩罚机制、MaskFormer 如何用 mask 分类框架统一 stuff/thing，以及双支路合并的冲突裁决为何在工业场景永远调不完。

\`\`\`python
from transformers import Mask2FormerForUniversalSegmentation
model = Mask2FormerForUniversalSegmentation.from_pretrained(
    "facebook/mask2former-swin-large-coco-panoptic")
# 统一输出：N 个 query 各预测 mask(N,H,W) + 类别分布（含 stuff 类）
out = model(pixel_values=img)
masks_queries = out.masks_queries_logits   # (B,N,H,W)
class_queries = out.class_queries_logits   # (B,N,C+1)
# PQ = SQ × RQ；匹配门槛 IoU>0.5，stuff 段 IoU 低即碎 mask 重罚
\`\`\`

踩坑：① stuff 与 thing 标注格式不同（COCO 分两份 json），训练前对齐成统一 panoptic 格式；② PQ 对小于 100 像素的实例极敏感，先清洗标注噪声再报指标；③ query 数量按场景最大实例数 1.5 倍配，少了大场景漏实例。`,
    keyPoints: ["每像素语义+实例 id 双输出", "MaskFormer query 统一掩码", "PQ=SQ×RQ 罚碎 mask", "集合预测替代裁决规则"],
    followUps: ["Mask2Former 改进点？（提示：masked attention，query 只看预测 mask 内像素）", "双支路合并为何是坑？（提示：thing/stuff 重叠区裁决规则永远调不完）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-278",
    nodeId: "ai-cv-segmentation",
    question: "Segment Anything（SAM）原理？可提示分割如何训练？对 CV 范式的影响？",
    answer: `【分层原理】结论：SAM 把分割重构为"可提示分割"——给定点/框/掩码/文本提示，输出有效掩码，零样本迁移到任意分割任务。架构三件套：① 图像编码器用 MAE 预训练的 ViT-H（632M 参数，最重但每图只编码一次）；② 提示编码器把点/框编成位置编码、掩码用卷积嵌入；③ 轻量掩码解码器做双向交叉注意力（提示↔图像 token），50ms 内输出 3 个候选 mask+IoU 预测分——歧义提示（点在人身上指人还是指衣服）靠多候选消解。训练关键是数据引擎闭环：模型辅助标注→人工修正→重训，迭代三轮攒出 SA-1B 的 11 亿掩码（比此前最大分割数据集大 400 倍）；歧义监督用"多 mask 输出+只对最小损失回传"的多假设学习。

【实际案例】医疗影像公司把 SAM 当交互式勾画助手：医生点 3 个点出一个器官轮廓，勾画效率比纯手工快 6 倍；但 CT 灰度属域外数据，零样本边缘 Dice 只有 0.71，用 500 例微调掩码解码器（图像编码器冻结）提到 0.88。字节剪映"智能抠图"基于 SAM 蒸馏小模型，端侧 90ms 出 mask，日调用亿级。失败教训：SAM 对细长结构（血管、裂缝）与透明反光物体明显弱，工业缺陷分割零样本召回仅 62%，必须领域微调或后接高分辨率细化头。

【举一反三】"基础模型+提示接口"与 GPT 的 prompt 范式同构——CV 从"一任务一模型"转向"一模型多提示"。决策模型：标注成本高的交互式场景（医疗、遥感、标注平台）直接受益；全自动高精度产线场景仍需领域微调，别把零样本当终点。

【扣分点对照】背八股的会说"SAM 能分割一切"；真做过的能讲出歧义提示为何输出 3 个 mask（点/框语义不唯一）、数据引擎自举闭环怎么运转，以及 ViT-H 图像编码太重导致视频流场景必须换 MobileSAM/FastSAM 蒸馏的取舍。

\`\`\`python
from segment_anything import sam_model_registry, SamPredictor
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h.pth").to("cuda")
predictor = SamPredictor(sam)
predictor.set_image(img)          # ViT-H 编码一次缓存 embedding
masks, iou_pred, _ = predictor.predict(
    point_coords=pts, point_labels=labels,  # 1=前景点 0=背景点
    box=box, multimask_output=True)  # 歧义提示返回 3 候选取 IoU 最高
# 领域微调：冻结图像编码器，只训掩码解码器+提示编码器
\`\`\`

踩坑：① set_image 的 ViT-H 编码是瓶颈（A100 约 150ms），视频流必须缓存 embedding 只重解码；② 提示点落在小物体旁歧义大，多候选取 IoU 分最高而非默认第一个；③ SA-1B 掩码是模型生成未全人工校验，拿它微调会继承假阳性边缘。`,
    keyPoints: ["点/框/掩码提示出 mask", "ViT-H 编码一次解码轻量", "歧义提示输出 3 候选", "数据引擎自举 11 亿掩码"],
    followUps: ["SAM 为何输出 3 个 mask？（提示：点/框提示语义不唯一，多候选消解歧义）", "领域微调怎么做？（提示：冻结图像编码器，只训提示编码器+掩码解码器）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-cv-generative =====

  {
    id: "ai-112",
    nodeId: "ai-cv-generative",
    question: "GAN 原理？判别器与生成器如何博弈？模式崩溃怎么解决？",
    answer: `【分层原理】结论：GAN 是双人零和博弈——生成器 G 从噪声 z 映射假样本骗判别器 D，D 学分辨真假，目标 min_G max_D E[log D(x)]+E[log(1-D(G(z)))]。理论最优 D*=p_data/(p_data+p_g)，此时 G 的梯度等价于最小化 JS 散度；问题恰在此：两分布不重叠时 JS 恒为 log2、梯度消失（训练初期常态），且 JS 不度量距离导致模式崩溃（G 只产少数几种样本，D 局部饱和）。工程解三条：① WGAN 换 Wasserstein 距离（D 改 1-Lipschitz 的 critic，梯度处处存在，损失值与样本质量相关可监控），配梯度惩罚 WGAN-GP；② 谱归一化约束 D 的 Lipschitz 常数稳训练；③ 小批量判别/单侧标签平滑防模式崩溃。StyleGAN 系另辟蹊径：映射网络+AdaIN 按层注入风格，实现属性解耦控制。

【实际案例】字节剪映老照片修复用 StyleGAN2 先验（GFPGAN 路线）：把退化人脸投影到 StyleGAN 潜空间再重建，PSNR 比纯监督高 1.8dB、人工盲评 MOS 4.1/5。失败形态：初版用 DCGAN 式直连训练，3000 iter 后模式崩溃——生成脸全是一个模子；换 WGAN-GP+谱归一化后 FID 从 41 降到 12。腾讯会议虚拟背景早期用 CycleGAN 做风格迁移，用户投诉"脸变形"率 7%，引入身份保持损失（ArcFace 特征对齐）降到 1.2%。

【举一反三】对抗训练思想已泛化：域适应用域判别器对齐特征、扩散模型的 GAN 蒸馏（SDXL-Turbo 的 ADD 把 50 步压到 4 步）。决策模型：2023 后新建图像生成项目默认扩散系，GAN 只在极致实时（端侧超分/人像卡通化，单次前向 <5ms）场景不可替代。

【扣分点对照】背八股的会背"G 和 D 博弈"；真做过的能讲出 JS 散度为何梯度消失、Wasserstein 距离需要 1-Lipschitz 约束的推导动机，以及"判别器不是越强越好"——D 过强 G 梯度消失，D/G 更新比通常 1:1 或 5:1 视架构定。

\`\`\`python
import torch
def wgan_gp_loss(critic, gen, real, z, lam=10):
    fake = gen(z).detach()
    d_real, d_fake = critic(real).mean(), critic(fake).mean()
    eps = torch.rand(real.size(0), 1, 1, 1, device=real.device)
    interp = (eps * real + (1 - eps) * fake).requires_grad_(True)
    grad = torch.autograd.grad(critic(interp).sum(), interp, create_graph=True)[0]
    gp = lam * (grad.flatten(1).norm(2, dim=1) - 1).pow(2).mean()
    return d_fake - d_real + gp  # critic 损失；G 损失 = -critic(gen(z)).mean()
\`\`\`

踩坑：① BatchNorm 在 critic 里与梯度惩罚冲突，换 LayerNorm；② GAN 无可靠收敛指标，盯 FID 曲线+人工抽检，别盯 loss；③ 模式崩溃早警：生成 batch 内两两 LPIPS 距离骤降就该加正则重启。`,
    keyPoints: ["G/D 极小极大博弈", "JS 不重叠时梯度消失", "WGAN-GP 解模式崩溃", "StyleGAN 按层注入风格"],
    followUps: ["WGAN 为何需要 1-Lipschitz？（提示：Wasserstein 距离对偶形式要求 critic 利普希茨连续）", "模式崩溃如何早期发现？（提示：batch 内样本两两 LPIPS 距离骤降即预警）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-113",
    nodeId: "ai-cv-generative",
    question: "VAE 原理？重参数化技巧（Reparameterization Trick）作用？",
    answer: `【分层原理】结论：VAE 把生成建模为隐变量模型 p(x)=∫p(x|z)p(z)dz，z~N(0,I)。积分不可解，引入变分后验 q(z|x)=N(μ(x),σ²(x)) 逼近，优化证据下界 ELBO=重建项 E[log p(x|z)]-KL(q(z|x)‖p(z))——前者保生成质量，后者把后验拉向先验使 z 空间连续可采样。重参数化是关键工程：z=μ+σ⊙ε（ε~N(0,I)）把"采样"这个不可导操作移出梯度路径，μ/σ 才能收梯度端到端训练。与 GAN 对比的本质：VAE 有显式似然可评估、训练稳、z 空间语义连续可插值；代价是高斯似然假设让生成图偏模糊（逐像素 MSE 倾向均值化）。β-VAE 给 KL 加权 β>1 增强解耦；后验坍缩（KL 归零、解码器无视 z）用 free bits/KL 退火缓解。

【实际案例】阿里推荐 Mult-VAE 用 VAE 做协同过滤：用户交互向量编码到 z 再重建，Top-20 召回比矩阵分解高 5.7 个点，z 空间插值实现"口味渐变"探索。字节内容安全用 VAE 做异常检测：正常样本重建误差低，违规变种图重建误差飙升，作黑产对抗样本过滤器召回 91%。失败形态：生成人脸项目用 VAE 初版结果模糊被业务否掉——根因是逐像素高斯似然，改 VQ-VAE（离散码本）+自回归先验后 FID 从 68 降到 24；这条路后来演化成 VQGAN，正是 Stable Diffusion 的图像压缩器。

【举一反三】变分推断是通用方法论：推荐去偏的隐变量建模、贝叶斯神经网络不确定性估计同源。决策模型：需要可评估似然/语义插值/不确定性→VAE 系；追求极致画质→扩散/GAN。

【扣分点对照】背八股的会背"重参数化让采样可导"；真做过的能讲出 ELBO 两项的拉力平衡（KL 太强→坍缩、重建太强→过拟合噪声）、模糊的高斯似然根因，以及 VQ-VAE 离散化为何救回锐度（码本学离散原型避开均值化回归）。

\`\`\`python
import torch
class VAE(torch.nn.Module):
    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        return mu + std * torch.randn_like(std)  # ε 外移，μ/σ 可收梯度
    def loss(self, x, recon, mu, logvar, beta=1.0):
        rec = torch.nn.functional.mse_loss(recon, x, reduction="sum")
        kl = -0.5 * (1 + logvar - mu.pow(2) - logvar.exp()).sum()
        return rec + beta * kl  # β>1 解耦增强；β<1 重建优先
\`\`\`

踩坑：① 回归 log σ² 而非 σ（数值稳定且天然保正）；② 训练初期 KL 权重从 0 退火升到 1 防坍缩；③ 生成模糊别急着堆容量，先查似然假设——换 VQ 或感知损失立竿见影。`,
    keyPoints: ["ELBO=重建-KL 双项平衡", "重参数化移采样出梯度路径", "高斯似然致生成模糊", "VQ-VAE 离散码本救锐度"],
    followUps: ["后验坍缩是什么？（提示：KL 归零、解码器无视 z，用 free bits/退火缓解）", "VAE 生成为何模糊？（提示：逐像素高斯似然倾向预测条件均值）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-114",
    nodeId: "ai-cv-generative",
    question: "Diffusion 模型（DDPM）原理？前向加噪逆向去噪过程？",
    answer: `【分层原理】结论：DDPM 把生成拆成两个马尔可夫链。前向加噪 q(x_t|x_{t-1})=N(√(1-β_t)x_{t-1}, β_t I)，T=1000 步后图像退化为纯高斯；闭式性质 x_t=√ᾱ_t·x_0+√(1-ᾱ_t)·ε 让训练可任意采 t 一步直达。逆向去噪学网络 ε_θ(x_t,t) 预测每步加入的噪声，损失是简化的 MSE ‖ε-ε_θ‖²——L2 目标让训练像回归一样稳定，没有 GAN 的博弈震荡。采样从 x_T~N(0,I) 出发逐步减噪，σ_t·z 的随机注入保多样性。为什么超越 GAN：① 似然-based 目标覆盖全模式，无模式崩溃；② 逐步 refinement 比单次映射易学；③ 代价是采样几十到上千步串行——后续 DDIM（非马尔可夫确定性跳步）、DPM-Solver（高阶 ODE 求解）、一致性模型把步数压到 4-10 步。

【实际案例】Stability 的 SD 系列 2022 开源后，AIGC 图像生成从 GAN 全面倒向扩散。腾讯混元文生图团队实测：同等 10 亿参数，扩散模型 FID 8.4 对 GAN 的 15.2，且训练 loss 曲线平滑无震荡，千卡训练一次成功率从 GAN 的约 60% 提到 95%。失败教训：初版噪声调度用线性 β_t，低噪声区（t<100）步数分配不足导致高频细节糊，换 cosine 调度 FID 改善 1.3；采样器从 DDPM 1000 步换 DPM-Solver++ 20 步，延迟降 40 倍 FID 仅升 0.2。

【举一反三】"加噪-去噪"思想外溢：语音 DiffWave 声码器、3D 生成 DiffRF、分子生成 GeoDiff。决策模型：新建生成项目默认扩散系；延迟敏感场景用一致性模型/LCM 蒸馏或 Rectified Flow 直线路径。

【扣分点对照】背八股的会背"前向加噪逆向去噪"；真做过的能讲出为什么预测噪声 ε 而非直接预测 x_0（ε 目标方差恒定、与 t 解耦，训练更稳）、cosine 调度为何优于线性，以及分类器无关引导 CFG 的数学本质（条件与无条件分数外推）。

\`\`\`python
import torch
def q_sample(x0, t, abar):
    eps = torch.randn_like(x0)
    return abar[t].sqrt() * x0 + (1 - abar[t]).sqrt() * eps, eps
# 训练：随机采 t，U-Net 预测噪声，L2 回归
x_t, eps = q_sample(x0, t, alphas_cumprod)
loss = torch.nn.functional.mse_loss(eps_theta(x_t, t, cond), eps)
# CFG 采样：eps = eps_uncond + s * (eps_cond - eps_uncond)，s 常取 7.5
\`\`\`

踩坑：① 预测目标 x_0/ε/v-prediction 三种别混用，微调预训练模型先对齐；② CFG 强度 >12 会过饱和伪影，7.5 是甜区；③ 训练时 t 均匀采样但低 t 区决定画质，推理调度器要加密低噪声段。`,
    keyPoints: ["前向闭式加噪逆向学去噪", "预测 ε 让目标方差恒定", "L2 目标训练稳无崩溃", "DDIM/DPM-Solver 加速采样"],
    followUps: ["为何预测 ε 而非 x_0？（提示：ε 目标方差恒定、与 t 解耦训练更稳）", "CFG 的数学本质？（提示：条件与无条件分数的外推，s 控条件强度）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-115",
    nodeId: "ai-cv-generative",
    question: "Stable Diffusion 原理？为何在 latent 空间做扩散？",
    answer: `【分层原理】结论：Stable Diffusion（LDM，2022）的关键决策是把扩散从像素空间搬到 VAE 潜空间。三段式：① VAE 编码器把 512×512×3 图压成 64×64×4 latent（48 倍压缩），解码器重建，KL 正则保 latent 平滑；② 在 latent 上跑 DDPM，U-Net 带交叉注意力注入条件；③ CLIP text encoder 把 prompt 编为 77×768 序列，经交叉注意力控生成。为什么有效：像素空间扩散在 512² 上每步算 26 万维，latent 上只 1.6 万维——训练/推理算力降一个量级；且 VAE 滤掉的高频冗余恰是扩散最难学的部分，模型容量集中攻语义结构。SDXL 改进：双文本编码器+更大 U-Net+多尺度微调；SD3 换 MMDiT 双流 DiT+Rectified Flow。

【实际案例】Stability 开源 SD1.5 后，Civitai 生态半年长出 10 万+ LoRA/Checkpoint，文生图进入社区时代。字节即梦基于 LDM 架构做中文优化：换自研中文文本编码器（CLIP 对中文弱），中文 prompt 语义对齐率从 71% 提到 89%；推理侧 DPM-Solver 20 步+latent 蒸馏，A10 单卡 1.8s 出图。失败形态：直接拿 SD1.5 生成海报文字全乱码（扩散模型不懂字符结构），方案是外接文本渲染模块；手部畸形率约 30% 靠手部 ControlNet+负向 prompt 工程降到 8%。

【举一反三】"压缩到潜空间再建模"是多模态通用范式：视频生成 Sora 把视频压成时空 patch latent、音频 Stable Audio 同构。决策模型：任何高维信号生成任务，先问能否先学个好压缩器——压缩质量定生成上限。

【扣分点对照】背八股的会说"在 latent 上做扩散省算力"；真做过的能讲出 VAE 压缩率 4 倍 vs 8 倍的画质-算力权衡、CLIP 77 token 截断对长 prompt 的坑，以及文本条件为何走交叉注意力而非拼接（条件维度与特征维度解耦、可插拔多条件）。

\`\`\`python
from diffusers import StableDiffusionPipeline
import torch
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16).to("cuda")
img = pipe(prompt="a cat astronaut, 4k",
           negative_prompt="blurry, deformed hands",  # 负向提示压伪影
           num_inference_steps=25, guidance_scale=7.5).images[0]
# 内部：prompt→CLIP 77×768→交叉注意力注入 U-Net→64×64×4 latent 扩散→VAE 解码
\`\`\`

踩坑：① fp16 推理 VAE 解码偶发黑图（上采样溢出），VAE 单独保 fp32；② prompt 超 77 token 被静默截断，长描述要分段加权；③ 中文 prompt 直出效果差，先翻译英文或用中文优化模型。`,
    keyPoints: ["VAE 压 48 倍进潜空间", "CLIP 文本走交叉注意力", "算力降一个量级", "压缩质量定生成上限"],
    followUps: ["为何条件走交叉注意力？（提示：条件与特征维度解耦，多条件可插拔）", "77 token 截断怎么办？（提示：CLIP 硬限制，长 prompt 分段加权）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-116",
    nodeId: "ai-cv-generative",
    question: "条件生成：ControlNet / IP-Adapter / Img2Img 原理？",
    answer: `【分层原理】结论：三者是不同粒度的条件注入。① ControlNet：冻结 SD 的 U-Net 主干，克隆其编码器做可训练副本，条件图（Canny 边缘/深度/姿态）经副本提取多尺度特征，通过 zero-conv（初始化为 0 的 1×1 卷积）加回主干对应层——零初始化保证训练起点等价原模型，逐步学条件控制而不破坏预训练能力，空间结构控制最精确；② IP-Adapter：参考图经 CLIP 图像编码器得全局嵌入，新增解耦交叉注意力层注入（文本与图像各走各的 K/V），传风格/内容语义但无空间控制，优势是即插即用；③ Img2Img：对输入图加噪到 t 步（strength 控制）再从 t 去噪，加噪越少结构保留越多——本质是"以图当初值"，最轻但可控性最弱。选型：精确空间控制 ControlNet、风格迁移 IP-Adapter、快速变体 Img2Img，工业界常叠加用。

【实际案例】阿里鹿班商品图流水线：白底商品图+Canny ControlNet 生成场景图，点击率与实拍持平，单张成本从 200 元降到 0.3 元，双 11 日产 50 万张。失败形态：初版控制权重设 1.0，生成图被边缘图"锁死"缺光影创意，改分阶段权重（前 30% 步 1.0 锁结构、后 70% 步 0.4 放创意）后 CTR 提升 12%。字节剪映"AI 写真"用 IP-Adapter 传人脸特征+姿态 ControlNet 控构图，相似度 0.72 达标；多人合影身份串扰，加人脸 mask 注入才解决。

【举一反三】"冻结主干+旁路注入条件"与 LoRA 的 PEFT 思想同构。决策模型：条件是空间结构→ControlNet；是语义风格→Adapter 系；弱对齐组合用。

【扣分点对照】背八股的会说"ControlNet 加条件图"；真做过的能讲出 zero-conv 为何必须零初始化（起点不退化原模型）、多 ControlNet 叠加的权重冲突怎么调，以及 IP-Adapter 图像 token 为何解耦交叉注意力（避免与文本 token 抢注意力容量）。

\`\`\`python
from diffusers import ControlNetModel, StableDiffusionControlNetPipeline
import torch
controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/sd-controlnet-canny", torch_dtype=torch.float16)
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", controlnet=controlnet,
    torch_dtype=torch.float16).to("cuda")
img = pipe("modern living room", image=canny_map,
           controlnet_conditioning_scale=0.8,  # 结构锁死程度
           guidance_scale=7.5, num_inference_steps=25).images[0]
# zero-conv 输出初始为 0：训练起点=原 SD，条件能力渐进生长
\`\`\`

踩坑：① 条件图必须与目标同分辨率对齐，预处理器版本不同结果差异大；② conditioning_scale 全程设高会丢光影创意，分阶段衰减；③ 多 ControlNet 特征直接相加互冲，按区域 mask 或按步数分时。`,
    keyPoints: ["ControlNet 零卷积锁空间结构", "IP-Adapter 解耦注入风格", "Img2Img 以图当初值", "三者按条件粒度叠加"],
    followUps: ["zero-conv 为何零初始化？（提示：训练起点等价原模型，不破坏预训练能力）", "多 ControlNet 如何共存？（提示：按区域 mask 或按采样步数分时注入）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-117",
    nodeId: "ai-cv-generative",
    question: "FID / IS 评估指标原理？生成模型如何评估质量与多样性？",
    answer: `【分层原理】结论：生成模型无逐像素 ground truth，评估转而在特征空间比分布。① IS：用 InceptionV3 分类生图，exp(E_x KL(p(y|x)‖p(y)))——单图条件分布 p(y|x) 尖锐（清晰）且边缘分布 p(y) 平坦（多样）时得分高；缺陷是只看生成侧不看真实分布，生成清晰但偏离真实分布的图也能高分，且对 Inception 训练域敏感。② FID：真图与生图都过 InceptionV3 pool3 取 2048 维特征，各拟合高斯，算 Fréchet 距离 ‖μ_r-μ_g‖²+Tr(Σ_r+Σ_g-2(Σ_rΣ_g)^{1/2})，越低越好——同时惩罚均值偏移（质量差）与协方差收缩（多样性塌缩），对模式崩溃敏感，成事实标准。③ 进阶：KID 用 MMD 无偏估计适合小样本；CLIP-FID 换语义特征对齐文生图；Precision/Recall 把质量与多样性拆开报。

【实际案例】腾讯混元文生图迭代门禁：每版模型在 MS-COCO 30k 抽图上算 FID，从初版 18.7 优化到 7.2 才允许灰度。曾有工程师用 5k 样本算 FID 报 8.1，复算 30k 变 9.4——小样本 FID 系统性偏乐观且方差大，团队规范定为≥30k 样本+固定 seed。字节评估 LoRA 风格模型时发现 FID 反而惩罚风格化（风格图偏离真实照片分布），换 CLIP-FID+人工偏好盲评（Elo 打分）双轨，避免"越真实越高分"的评估错配。

【举一反三】"在合适特征空间比分布"通用：语音用 FAD（VGGish 特征）、文本用 MAUVE。决策模型：评估指标必须匹配任务目标——保真任务用 FID，风格/创意任务 CLIP 分数+人工 Elo，别拿单一指标当圣旨。

【扣分点对照】背八股的会背"FID 越低越好"；真做过的能讲出 FID 的高斯假设局限（真实特征远非高斯）、样本量不足的系统性偏差，以及 Inception 在 ImageNet 上训练导致对动漫/医学等域外图评估失真——换 CLIP 特征才行。

\`\`\`python
from torchmetrics.image.fid import FrechetInceptionDistance
fid = FrechetInceptionDistance(feature=2048, normalize=True)
for real_batch in real_loader:      # ≥30k 样本，[0,1] 浮点
    fid.update(real_batch, real=True)
for fake_batch in fake_loader:
    fid.update(fake_batch, real=False)
score = fid.compute()  # 越低越好；COCO 基准 SD1.5 约 9-10
# 工程规范：固定 Inception 权重版本+固定 resize 方式，否则跨团队不可比
\`\`\`

踩坑：① resize/抗锯齿实现差异能让 FID 漂 2-3 分，与论文对齐预处理；② FID 对压缩伪影敏感，JPEG 存档前先算；③ 生成图与训练集撞脸（记忆化）会让 FID 虚低，配 k-NN 检索查泄漏。`,
    keyPoints: ["FID 特征空间 Fréchet 距离", "IS 只看生成侧有盲区", "小样本 FID 偏乐观", "风格任务换 CLIP-FID"],
    followUps: ["FID 的高斯假设有何问题？（提示：真实特征非高斯，KID 用 MMD 无偏估计）", "风格化模型为何 FID 失真？（提示：风格图偏离真实照片分布被误罚）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-118",
    nodeId: "ai-cv-generative",
    question: "AIGC 图像生成工业落地：文生图、图生图、虚拟试衣、广告创意如何做？",
    answer: `【分层原理】结论：AIGC 落地的工程本质是把"能生成"变"可控、稳定、合规地批量生成"。四大场景套路：① 文生图——SD/SDXL 底座+业务 LoRA 微调风格；② 图生图——Img2Img/重绘 mask 保结构，ControlNet 锁构图；③ 虚拟试衣——两阶段：服装解析（分割出衣区）+TryOn Diffusion 把服装 warp 到人体，难点在布料纹理细节与人体边缘融合；④ 广告创意——品牌 LoRA（几十张 VI 图训 20 分钟）+批量 prompt 模板+自动筛选。通用管线五层：prompt 工程（模板+负向词库）→生成（多模型路由）→过滤（NSFW/水印/鉴伪）→优选（美学评分/业务指标）→回流（人工优选数据再微调）。

【实际案例】阿里鹿班 2.0：商家上传 30 张商品图训 LoRA（r=16，单卡 20 分钟），接"商品图换背景"管线——分割抠图+SD inpainting 重绘背景，双 11 生成 1.2 亿张场景图，CTR 与实拍持平、成本降 99%。失败形态：初版整图重绘导致商品 LOGO 变形（侵权风险），改"商品区冻结+仅背景 inpaint"后合规通过。腾讯广告创意用"模板 prompt+LoRA"日产 30 万素材，自动过滤率 43%（NSFW 8%、低美学分 35%），优选素材 CTR 较人工设计高 9%。虚拟试衣侧，唯品会实测 TryOn 模型对复杂花纹保真不足，加 garment-warp 光流对齐后相关退货率降 2.1 个点。

【举一反三】"生成+过滤+优选+回流"闭环是 AIGC 产品通用架构，文生视频、AI 音乐同构。决策模型：商业价值不在模型本身在数据回流飞轮——用户采纳/拒绝行为是最便宜的微调信号。

【扣分点对照】背八股的会说"用 SD 生成商品图"；真做过的能讲出版权合规链（训练数据来源审计+生成图鉴伪+C2PA 水印）、LoRA 微调的商品细节保真难题（LOGO/文字必须冻结或后期贴回），以及自动过滤的多级漏斗设计。

\`\`\`python
from diffusers import StableDiffusionInpaintPipeline
import torch
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting", torch_dtype=torch.float16).to("cuda")
# 商品图换背景：mask=背景区域，商品区冻结不变形
img = pipe(prompt="product on marble table, studio light",
           image=product_img, mask_image=bg_mask,
           strength=0.95, num_inference_steps=30).images[0]
# 品牌 LoRA：pipe.load_lora_weights("brand_lora.safetensors")
\`\`\`

踩坑：① 人脸/LOGO 区域必须 mask 保护，扩散重绘必变形；② LoRA 训练图 <20 张易过拟合，加正则化图防概念绑定；③ 商用管线必须接鉴伪+水印（C2PA），监管与平台审核双要求。`,
    keyPoints: ["五层管线 prompt 到回流", "inpaint 冻结商品区保 LOGO", "品牌 LoRA 低成本定制", "数据回流飞轮是壁垒"],
    followUps: ["商品图 LOGO 如何保真？（提示：商品区 mask 冻结，仅背景 inpaint）", "AIGC 合规链有哪些环节？（提示：来源审计+鉴伪+C2PA 水印）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-279",
    nodeId: "ai-cv-generative",
    question: "视频生成模型原理？Sora 与 DiT 如何把扩散模型扩展到时空建模？",
    answer: `【分层原理】结论：视频生成=图像扩散+时间维度建模，架构演进三步。① 早期 AnimateDiff/Video LDM：冻结图像 SD 的 2D U-Net，插入时序注意力层（跨帧自注意力）只训时序层——快但运动幅度小、长视频漂移；② DiT：把 U-Net 换成纯 Transformer，latent patch 化后时空 token 统一进注意力，架构简洁且 scaling law 明确（参数与算力翻倍损失稳定下降），为大规模训练铺路；③ Sora（2024）：DiT 路线+时空 patch（视频 VAE 把时间维也压缩，多帧压成 token），原生支持可变分辨率/时长/长宽比（不裁剪、按原始尺寸 patch 化训练），长镜头一致性靠大规模算力+视频 caption 重标注（仿 DALL·E 3 用 GPT-4V 重写训练文本）。技术共识：核心瓶颈不在架构在数据——高质量长视频文本对稀缺，caption 重写与自研视频 VAE 是护城河。

【实际案例】快手可灵 2024 年上线即支持 2 分钟 1080p 生成，采用类 Sora 的 3D VAE+DiT 路线，公测首月排队百万用户；数据管线用自研视频描述模型给千万级素材重打标签，运动幅度评分过滤静态"PPT 视频"。失败形态：初版 2D U-Net+时序层方案生成 4 秒后人物面部漂移（跨帧注意力感受野不足），切全时空注意力+3D VAE 后 8 秒身份一致性（人脸相似度）从 0.61 提到 0.85。字节即梦视频生成实测文生视频采纳率 34%，核心差评是物理规律错误（水流倒灌、影子缺失），物理引擎仿真数据混入训练是主流解法。

【举一反三】"时空 patch 化+Transformer scaling"与多模态 LLM（视频 token 化进 LLM）殊途同归。决策模型：短视频特效/风格化用 AnimateDiff 低成本起步；追求长时长物理一致性必须 DiT+3D VAE+海量算力，中小团队慎入——训练成本是图像模型的 50 倍。

【扣分点对照】背八股的会说"Sora 用 DiT"；真做过的能讲出时空 patch 相对逐帧独立处理的优势（运动建模进注意力而非后处理）、可变分辨率训练为何重要（裁剪破坏构图先验），以及视频 caption 重写对语义对齐的贡献——Sora 技术报告明确精细描述文本是关键增益。

\`\`\`python
import torch
# DiT 视频块：时空 token 统一注意力（简化示意）
B, T, H, W, C = 2, 16, 32, 32, 1152  # 视频 VAE 压缩后的 latent
tokens = patchify(video_latent)       # (B, T*H*W, C) 时空 patch
tokens = tokens + pos_emb_3d          # 3D RoPE 或正弦位置编码
for block in dit_blocks:
    tokens = tokens + block.full_attn(tokens)               # 时空全注意力
    tokens = tokens + block.cross_attn(tokens, text_emb)    # 注入 caption
# 采样同图像扩散；长视频成本 O((T·H·W)^2)，分块/稀疏注意力是优化方向
\`\`\`

踩坑：① 逐帧独立去噪必闪帧，时序注意力/3D VAE 二选一保底；② 训练视频统一裁剪会学成"中央构图"偏置，保留原始长宽比分桶训练；③ 长视频显存爆炸，时空注意力分块+梯度检查点是标配，别硬扛全注意力。`,
    keyPoints: ["时序层到 DiT 时空统一", "时空 patch 建模运动", "可变分辨率保构图先验", "瓶颈在数据非架构"],
    followUps: ["时空 patch 的优势？（提示：运动建模进注意力，而非逐帧后处理）", "长视频一致性靠什么？（提示：3D VAE+全时空注意力+caption 重标注）"],
    favorited: false,
    bigTech: true,
  },


  // ===== 从远程合入：ai-diffusion-advanced =====
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

];