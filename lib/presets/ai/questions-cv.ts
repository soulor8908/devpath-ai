// lib/presets/ai/questions-cv.ts
// AI 算法工程师面试题：计算机视觉（4 节点）
// 从 lib/presets/ai.ts 拆分而来，内容保持不变

import type { Question } from "../../types";

export const CV_QUESTIONS: Question[] = [
  // ===== ai-cv-classification =====

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

  // ===== ai-cv-detection =====

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
  // ===== 17. ai-cv-segmentation =====,

  // ===== ai-cv-segmentation =====

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
  // ===== 18. ai-cv-generative =====,

  // ===== ai-cv-generative =====

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
  // ===== 19. ai-nlp-fundamentals =====,
];
