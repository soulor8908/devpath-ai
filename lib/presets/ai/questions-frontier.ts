// lib/presets/ai/questions-frontier.ts
// AI 算法工程师面试题：多模态 / 部署 / MLOps（3 节点）
// 从 lib/presets/ai.ts 拆分而来，内容保持不变

import type { Question } from "../../types";

export const FRONTIER_QUESTIONS: Question[] = [
  // ===== ai-multimodal =====

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
  // ===== 29. ai-model-deploy =====,

  // ===== ai-model-deploy =====

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
  // ===== 30. ai-mlops =====,

  // ===== ai-mlops =====

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
