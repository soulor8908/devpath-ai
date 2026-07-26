// lib/presets/ai/questions-infrastructure.ts
// AI 工程基础设施题库：模型压缩 / 分布式训练 / 推理优化 / CUDA GPU
// 从远程 main 合入，覆盖大厂高频工程面试题

import type { Question } from "../../types";

export const INFRA_QUESTIONS: Question[] = [

  // ===== ai-model-compression (8 题) =====
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


  // ===== ai-distributed-training (8 题) =====
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


  // ===== ai-inference-optimization (8 题) =====
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


  // ===== ai-cuda-gpu (8 题) =====
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
