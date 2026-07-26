// lib/presets/ai/questions-frontier.ts
// AI 算法工程师面试题：多模态 / 部署 / MLOps（3 节点 × 8 题 = 24 题）
// 从 lib/presets/ai.ts 拆分而来；2026-07 全部答案升级为策展级深度：
// 每题 = 分层原理 + 实际案例（量化数字）+ 举一反三 + 扣分点对照 + 代码 + 踩坑

import type { Question } from "../../types";

export const FRONTIER_QUESTIONS: Question[] = [
  // ===== ai-multimodal =====

  {
    id: "ai-182",
    nodeId: "ai-multimodal",
    question: "CLIP 原理？图文对比学习如何对齐？",
    answer: `【分层原理】结论：CLIP 用 4 亿图文对做对比学习，把图像和文本映射到同一向量空间，靠"配对相似度高、不配对相似度低"完成对齐。机制分三层：①双塔编码——图像侧 ViT/ResNet、文本侧 Transformer，各自输出 L2 归一化的 d 维向量；②InfoNCE 损失——batch 内 N 个正对放对角线，N²-N 个负对在非对角线，图→文与文→图双向交叉熵取平均，温度 τ≈0.07 控制分布锐度；③零样本推理——把类别名套进 prompt 模板"a photo of a {class}"编码成文本向量，与图像向量算余弦取最大。为什么有效：语言监督比人工类别标签信息密度高且词表开放，对比目标天然抗噪声标签，所以 CLIP 在 ImageNet 零样本即追平有监督 ResNet-50。

【实际案例】字节内容理解团队早期用有监督分类打标签，类目上限两千、新增类目要重新采标训练，周期两周；切到 CLIP 零样本 + 自有多模态数据对比微调后，标签体系扩到十万级，细粒度标签准确率提升约 8 个点，新类目当天上线。阿里电商图文检索用 CLIP 初始化再领域微调，以文搜图 Recall@10 提升 12%，query 点击率提升 3%+；OpenAI 论文中 ViT-L/14 在 27 个数据集零样本平均超有监督基线。

【举一反三】同一对比对齐思想可迁移到：音频-文本检索（CLAP）、视频-文本检索（抽帧+时序池化）、代码-注释检索（双塔 CodeBERT）。决策模型：只要存在"成对异构数据 + 跨模态检索/零样本"诉求，优先双塔对比而非融合架构——前者可离线建索引，后者不行。

【扣分点对照】背八股的只说"图像文本各一个编码器加对比损失"；真做过的能讲清 batch size 为什么决定负样本质量、τ 可学习 vs 固定的取舍、zero-shot prompt 工程的影响（集成 80 个模板能涨 3-5 个点），以及中文场景必须换 Chinese-CLIP 或自有多语数据微调。

\`\`\`python
logits = img_feat @ txt_feat.T / tau        # (N,N) 相似度，τ≈0.07
labels = torch.arange(N)                    # 对角线为正对
loss = (F.cross_entropy(logits, labels)
      + F.cross_entropy(logits.T, labels)) / 2   # 双向 InfoNCE
# 零样本：texts = [f"a photo of a {c}" for c in classes]
\`\`\`

踩坑：①batch<1k 时负样本不足表征明显退化，需梯度累积或跨卡 gather 负样本；②τ 初始化过大导致梯度消失；③英文 CLIP 直接打中文标签准确率腰斩，别省领域微调。`,
    keyPoints: ["双塔对比学习对齐图文空间", "InfoNCE 正对拉近负对推远", "零样本靠 prompt 模板匹配", "batch 与温度决定负样本质量"],
    followUps: ["CLIP 如何做零样本分类？（提示：类别名套 prompt 模板编码后算余弦相似度取最大）", "温度系数 τ 的作用？（提示：控制相似度分布锐度，τ 小梯度集中在难分负对）", "为什么 batch 要足够大？（提示：batch 内其他样本即负样本，太小负样本不足表征退化）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-183",
    nodeId: "ai-multimodal",
    question: "BLIP 原理？如何统一图文理解与生成？",
    answer: `【分层原理】结论：BLIP 用统一架构同时做图文理解与生成，BLIP-2 进一步用 Q-Former 桥接冻结视觉编码器与冻结 LLM，只训轻量模块就把 LLM 变成多模态模型。分三层：①BLIP 的 MED 架构——单模态编码器、图像接地文本编码器（ITC 对比 + ITM 二分类判图文是否匹配）、图像接地文本解码器（LM 损失生成 caption），配 CapFilt 用生成+过滤清洗网络噪声图文对；②BLIP-2 第一阶段——32 个可学习 query token 通过 Q-Former 交叉注意力从冻结 ViT 抽取与文本对齐的视觉表征，ITC/ITM/ITG 三任务联合；③第二阶段——Q-Former 输出线性投影到 LLM 词嵌入维度，视觉 LLM 均冻结，可训练参数不到 3%。为什么省：显存与算力开销比端到端训练降一个数量级。

【实际案例】Salesforce 公开结果：BLIP-2 用 54M 可训练参数（ViT-g + FlanT5-XL 均冻结）在 VQAv2 零样本达 65.0，逼近 20 倍参数的全量训练模型。阿里内部同类路线做商品图描述生成：冻结视觉骨干+LLM、只训 1.2 亿参数桥接层，两周完成一轮迭代，badcase 率较全参微调仅高 0.4 个点但训练成本降 85%。CapFilt 让 BLIP 用噪声网络数据超过人工标注数据训练的 CLIP 同类指标，证明"数据清洗比数据量更值钱"。

【举一反三】桥接思想可迁移：语音-LLM（Qwen-Audio 用 speech encoder + adapter）、视频-LLM（帧级特征过 Q-Former 加时序 query）、点云-LLM。决策模型：已有强单模态预训练资产时，"冻结 + 轻量桥接"性价比远高于端到端重训，先验是两边预训练都要够强。

【扣分点对照】背八股的说"BLIP-2 就是 Q-Former 连接视觉和语言模型"；真做过的能讲两阶段训练各自的目标差异、为什么 query token 定 32 个（信息瓶颈压缩序列长度）、冻结 LLM 后指令遵循能力丢失要靠指令微调数据补回，以及跳过第一阶段直接训的收敛代价。

\`\`\`python
queries = learnable_q.expand(B, 32, D)              # 32 个可学 query
q_out = q_former(queries, kv=frozen_vit(image))     # 交叉注意力抽视觉
soft_prompt = linear(q_out)                         # 投影到 LLM 维度
out = frozen_llm(inputs_embeds=cat([soft_prompt, text_emb]))
\`\`\`

踩坑：①跳过第一阶段表征对齐直接第二阶段，收敛慢且效果差一截；②CapFilt 过滤阈值过严会丢长尾实体；③冻结 LLM 下输出格式漂移，需指令数据校正。`,
    keyPoints: ["MED 架构统一理解与生成", "Q-Former 32 query 桥接冻结双塔", "两阶段训练只训 <3% 参数", "CapFilt 清洗噪声图文对"],
    followUps: ["Q-Former 为什么只训得动？（提示：视觉与 LLM 冻结，只学 32 个 query 的交叉注意力）", "BLIP-2 与 LLaVA 路线差异？（提示：Q-Former 压缩 token vs 线性投影全量视觉 token）", "为什么先对齐再接 LLM？（提示：未对齐的视觉表征会污染 LLM 输出空间）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-184",
    nodeId: "ai-multimodal",
    question: "多模态对齐方法：早期融合 vs 晚期融合 vs 跨注意力？",
    answer: `【分层原理】结论：三种融合对应"模态信息交换发生的时机"——早期融合在输入层拼接、晚期融合在决策层汇合、跨注意力在中间层动态交互。①早期融合（LLaVA 投影拼接）：视觉 token 直接拼进 LLM 序列，交互最充分，但 448px 图切成 24×24=576 token，多图场景上下文窗口告急；②晚期融合（CLIP 双塔）：两模态独立编码后只在打分层点积，最快且可离线建 ANN 索引，但做不了细粒度推理；③跨注意力（Flamingo）：在冻结 LLM 每若干层后插门控 cross-attention，文本 query 主动查视觉 key/value，交互深度可控、视觉不占主序列，代价是新增参数与计算。为什么 Flamingo 用 tanh 门控初始为 0：训练初期等价纯语言模型，不破坏原能力，收敛稳定。

【实际案例】DeepMind Flamingo 用 80B 冻结语言模型 + 插入门控 cross-attention，仅少量多模态训练即拿下 16 项基准少样本 SOTA。字节豆包视觉版工程对照：早期用投影拼接（LLaVA 式），4 张图就吃掉 2304 token，长文档多图场景上下文溢出率 6%；引入 token merge（576→144）后溢出率降到 0.8%，首 token 延迟降 22%。检索业务则用双塔：淘宝拍立淘双塔建库支持 10 亿级商品毫秒召回——融合架构根本建不了索引。

【举一反三】选型决策可复用：检索/去重选双塔（可建索引）；单图深度问答选投影拼接（简单稳定）；多图/视频/图文交错文档选 cross-attention（省序列长度）。穿戴设备多模态同理：高频传感流双塔对齐，低频文本走拼接。

【扣分点对照】背八股的背三个名词解释；真做过的能算清"分辨率×图数×token 数"的上下文账、讲清 tanh 门控为何保证训练初期等价冻结 LLM、Flamingo 对图文交错数据的 attention mask 设计，以及双塔无法做属性级推理的天花板。

\`\`\`python
class GatedXAttn(nn.Module):
    def __init__(self, d):
        super().__init__(); self.gate = nn.Parameter(torch.zeros(1))
    def forward(self, text_h, vis_kv):
        # 训练初期 gate≈0 → 等价纯语言模型，稳定不破坏原能力
        return text_h + torch.tanh(self.gate) * cross_attn(text_h, vis_kv, vis_kv)
\`\`\`

踩坑：①早期融合不压缩视觉 token，高分辨率多图直接 OOM；②cross-attention 层插太密收益递减（Flamingo 每 4 层插 1 层）；③双塔训练混入未对齐噪声对，检索召回骤降。`,
    keyPoints: ["早期融合拼输入交互充分", "晚期融合双塔可建索引", "跨注意力门控插入省序列", "选型看检索/问答/多图场景"],
    followUps: ["Flamingo 的 tanh 门控为何初始为 0？（提示：训练初期等价冻结 LLM，避免破坏语言能力）", "多图场景早期融合的瓶颈？（提示：每图数百 token，上下文窗口被视觉挤爆）", "检索为什么必须双塔？（提示：查询与库内样本需独立编码才能离线建 ANN 索引）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-185",
    nodeId: "ai-multimodal",
    question: "VQA 视觉问答原理？如何结合图像理解和文本推理？",
    answer: `【分层原理】结论：VQA 本质是"以图像为条件生成/选择答案"，难点在跨模态对齐与推理，技术分两代范式。①判别式 VQA（2015-2021）：图像 CNN/ViT 特征 + 问题 LSTM/BERT 编码，用注意力（问题 query 查图像区域）融合后接 MLP 在固定答案集（VQA v2 约 3129 类）上分类，评测用 VQA accuracy——10 个人工答案投票，min(匹配人数/3, 1)；②生成式 VQA（2022-）：图像转视觉 token 进 LLM，按语言建模生成答案，开放词表、可输出推理链、能融合 OCR 与世界知识，评测转向规则匹配或 LLM 打分。为什么生成式胜出：答案空间不再受限、可解释、与 LLM 推理能力直接复用。

【实际案例】某三甲医疗影像问答项目：初版判别式答案集 500 类，医生问"病灶边缘是否清晰"这类长尾问题覆盖率仅 41%，验收被退回；换 Qwen-VL 微调生成式方案 + 8 万条放射科报告指令数据，开放问题可用率升到 87%，但出现编造征象幻觉 3.2%——再用 DPO 偏好对齐压到 0.9% 才过验收。阿里 Qwen-VL 在 DocVQA 达 96%+，关键是 448 高分辨率 + OCR 专项数据强化，小字场景拉开代差。

【举一反三】决策模型迁移：答案集闭合且固定（工业质检"合格/不合格"、定损分级）→ 判别头更快更稳；开放交互（客服看图答疑、教育批改）→ 生成式。文档智能（票据字段抽取）本质是 VQA 特化，"高分辨率 + OCR 注入"配方直接复用。

【扣分点对照】背八股的说"图像加问题出答案"；真做过的能写 VQA accuracy 投票公式、讲判别式答案集天花板、生成式幻觉率怎么测（POPE 基准/人工抽检），以及分辨率对小字 OCR 的决定性影响——288px 做文档问答等于半瞎。

\`\`\`python
# 生成式 VQA 推理（Qwen-VL 风格）
inputs = tokenizer(f"<img>{img}</img>\\n{question}", return_tensors="pt")
answer = tokenizer.decode(model.generate(**inputs, max_new_tokens=64)[0])
# VQA accuracy = min(匹配该答案的人工标注数 / 3, 1)
\`\`\`

踩坑：①评测用 exact match 误杀同义答案，需归一化或软匹配；②训练集答案先验严重（"是/否"占 60%+），模型不看图也拿高分，需 VQA-CP 类去偏验证；③低分辨率输入小字全糊，badcase 别错怪模型。`,
    keyPoints: ["判别式固定答案集分类", "生成式开放词表可推理", "VQA accuracy 人工投票计分", "高分辨率+OCR 决定文档场景"],
    followUps: ["VQA accuracy 怎么算？（提示：10 个人工答案投票，min(匹配人数/3, 1) 的软计分）", "判别式范式天花板在哪？（提示：答案集闭合，长尾开放问题覆盖率上不去）", "语言先验问题如何暴露？（提示：VQA-CP 打乱训练测试先验分布，性能暴跌即依赖先验）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-186",
    nodeId: "ai-multimodal",
    question: "多模态大模型（GPT-4V/Qwen-VL/LLaVA）架构？如何训练？",
    answer: `【分层原理】结论：主流 MLLM = 视觉编码器 + 连接器 + LLM 三段式，训练分两阶段：对齐预训练 + 指令微调。细节：①视觉侧普遍用 CLIP ViT（特征已与文本语义对齐），LLaVA 取倒数第二层 patch 特征；②连接器从简到繁：线性投影（LLaVA）、两层 MLP（LLaVA-1.5）、Q-Former（BLIP-2/Qwen-VL）、C-Abstractor（Honeybee 用卷积压缩 token）；③Stage 1 冻结 ViT 与 LLM 只训连接器，用百万级图文对学"把图像翻译成语言空间"；Stage 2 冻结 ViT、微调连接器+LLM，用几十万条多模态指令数据学遵循指令。Qwen-VL 额外支持 448 分辨率、位置编码外推与 bounding box 输出做 grounding。为什么两阶段：端到端直接微调时未对齐的连接器会污染 LLM 权重，先对齐再微调收敛快一倍。

【实际案例】LLaVA 论文实证：595K 图文对预训练 + 158K GPT-4 生成指令数据，8×A100 一天训完，能力达 GPT-4 打分的 85% 相对水平，成本千元美金级，成为开源复现基线。字节内部对照实验：跳过 Stage 1 直接指令微调，同数据量 MME 低 4-6 分、收敛步数多 2.1 倍；解冻 ViT 联合训需 4 倍显存、收益仅 0.8 分，最终保持冻结。Qwen2-VL 的动态分辨率（NaViT 式变长 token）让文档场景精度再涨，已成为 2025 后标配。

【举一反三】三段式配方迁移：音频（Whisper encoder + adapter + LLM）、点云（PointNet++ + 投影）、图表（DePlot 先转表再进 LLM）。决策模型：新模态接入 = 选该模态最强预训练编码器 + 轻量连接器 + 两阶段训练，别一上来端到端。

【扣分点对照】背八股的说"图像进 ViT 再进大模型"；真做过的能讲两阶段各自冻结什么、为什么用 CLIP 而非纯监督 ViT（文本空间先验）、视觉 token 数与算力/效果的权衡，以及 caption:指令 ≈ 4:1 数据配比的消融结论。

\`\`\`python
# Stage 1: 冻结双塔，只训 connector（图文 caption 对）
for p in list(vit.parameters()) + list(llm.parameters()):
    p.requires_grad_(False)
loss = llm(inputs_embeds=cat([connector(vit(img)), emb(cap)])).loss
# Stage 2: 解冻 connector+LLM，指令数据微调
\`\`\`

踩坑：①Stage 1 数据噪声大时 connector 学歪，Stage 2 救不回；②视觉 token 全展开，两张图撑爆 4K 上下文，需 token merge/池化；③指令数据纯英文时中文问答崩，多语配比必须前置规划。`,
    keyPoints: ["ViT+连接器+LLM 三段式", "Stage1 对齐 Stage2 指令微调", "连接器从轻量投影到 Q-Former", "数据质量与配比决定上限"],
    followUps: ["为什么视觉编码器选 CLIP？（提示：其特征空间已与文本对齐，降低连接器学习难度）", "两阶段各冻结什么？（提示：Stage1 冻 ViT+LLM 只训连接器，Stage2 冻 ViT 训其余）", "高分辨率如何处理？（提示：动态分辨率切 patch 变长 token 或 Q-Former 压缩）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-187",
    nodeId: "ai-multimodal",
    question: "图文检索工业应用？CLIP embedding 如何用于搜索？",
    answer: `【分层原理】结论：工业图文检索 = 双塔 embedding + ANN 向量索引，核心设计哲学是"离线重计算、在线轻查询"。分层：①embedding 层——CLIP 或领域微调双塔把图/文映射到 512-1024 维，L2 归一化后点积即余弦相似度；②索引层——FAISS/Milvus 建 IVF_PQ 或 HNSW，亿级库 P99 召回延迟 <20ms，PQ 量化把内存压 8 倍代价是 1-3 个召回点；③排序层——ANN 粗召回 top-200 后接交叉编码器或业务特征精排。为什么离线预计算：千万级图库在线逐张编码不可行，提前建库后在线只编码 query（<10ms）。为什么两阶段：双塔快但信息损失、交叉精排慢但准，召回-精排折中是检索系统标准配方。

【实际案例】淘宝拍立淘以图搜商品：库内 10 亿+ 商品图，领域微调双塔 + IVF_PQ 索引，粗召回 500 候选 15ms、交叉精排 30ms，整体 P99 <80ms，搜购转化率较关键词搜索高 25%+。小红书图文搜索早期直接用 CLIP 零样本，中文长 query 召回 badcase 率 18%；用 2 亿站内图文对对比微调后降到 6%，>10 字长 query 改善最明显。模型升级时用双库并行 + 灰度切换，索引重建期间服务零中断。

【举一反三】同配方迁移：视频搜索（帧 embedding 池化 + 文本检索）、音乐检索（CLAP）、代码搜索。决策模型：先问"能否离线建库"——能，就双塔+ANN；不能（如需逐对交叉打分），退而求其次用 late interaction（ColBERT 式 token 级交互）。

【扣分点对照】背八股的说"CLIP 编码然后 FAISS 搜"；真做过的能报索引选型账（Flat/IVF/HNSW 的召回-内存-延迟曲线）、PQ 量化掉点幅度、embedding 版本灰度更新策略（双索引热切换），以及领域微调前后的 badcase 对比数据。

\`\`\`python
index = faiss.index_factory(512, "IVF4096,PQ64")   # 量化省 8 倍内存
index.train(train_embs); index.add(img_embs)       # 离线建库
index.nprobe = 64                                   # 召回率/延迟折中
q = text_encoder(query); q /= np.linalg.norm(q)    # 必须归一化
D, I = index.search(q[None], 200)                   # 粗召回 200 → 精排
\`\`\`

踩坑：①embedding 不归一化直接内积，范数偏差主导排序结果；②模型升级重建索引期间断档，必须双索引热切换；③PQ 对 OOD 图像量化误差大，新品类召回差需定期重建。`,
    keyPoints: ["双塔 embedding 离线建库", "IVF_PQ/HNSW 索引毫秒召回", "粗召回+精排两阶段排序", "领域微调治中文长 query"],
    followUps: ["为什么必须离线建库？（提示：千万级库在线逐张编码不可行，在线只算 query）", "IVF 与 HNSW 怎么选？（提示：IVF_PQ 省内存适合亿级，HNSW 召回高但内存贵）", "模型升级如何不中断服务？（提示：双索引并行 + 灰度切流，新库全量后切流量）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-188",
    nodeId: "ai-multimodal",
    question: "视频理解与多模态？时序建模如何做？",
    answer: `【分层原理】结论：视频比图像多时序维度，技术主线是"空间表征 → 时空表征 → 视频-语言对齐"。三层：①时空特征——3D CNN（I3D 把 2D 卷积核膨胀成 3D）或 ViViT/TimeSformer（空间与时间注意力分治，复杂度从 O(T²H²W²) 降到 O(T²+HW) 量级）；②自监督预训练——VideoMAE 用 90-95% 高掩码率重建像素（视频时间冗余大，掩码率必须远高于图像 MAE 的 75%），Kinetics-400 达 87%；③Video-LLM——均匀/关键帧采 8-32 帧，帧级 ViT 特征经池化/Q-Former 压成视频 token 接 LLM，支持问答、描述、时刻检索。为什么抽帧可行：相邻帧冗余度 >80%，语义在稀疏帧上已可恢复，密帧只增加算力不增加信息。

【实际案例】抖音内容理解流水线：每条投稿抽 16 帧 + ASR 文本 + 封面图，Video-LLM 统一生成内容标签与摘要，替代原 30 个专用小模型，标签准确率从 78% 提到 89%，单视频理解成本降 60%，日处理 6000 万条。长视频（>10 分钟）场景初版均匀抽 16 帧，关键情节漏检率 22%；改分层采样——1fps 粗扫定位片段再片段内密抽——漏检降到 5%，算力仅增 1.3 倍。

【举一反三】决策模型迁移：短视频（<30s）均匀抽帧足够；长视频必须"粗定位+细读"两段式（与长文档 RAG 两级检索同构）；实时监控用滑窗 + 关键帧触发（帧差/光流突变）控算力。教学类视频别只用视觉轨——ASR/字幕常承载 40% 语义。

【扣分点对照】背八股的列 I3D/ViViT/VideoMAE 名词；真做过的能解释 VideoMAE 掩码率为何 90%+（时间冗余）、抽帧数与任务的关系（动作识别需 16+ 帧保时序，静态场景 4 帧够）、长视频成本如何分层控制，以及训练/推理帧率不一致的分布漂移问题。

\`\`\`python
frames = uniform_sample(video, n=16)        # 均匀抽帧
feats = vit(frames)                          # (16, 197, d) 帧级特征
vid_tok = qformer(feats.flatten(0, 1))       # 压成 32 个视频 token
ans = llm(cat([vid_tok, text_tok]))          # 接 LLM 问答
\`\`\`

踩坑：①训练 30fps 密帧、线上 1fps 抽帧，分布不匹配效果腰斩；②忽略 ASR/字幕轨丢近半语义；③帧特征不压缩直接拼接，16 帧×197 token 直接爆序列。`,
    keyPoints: ["时空注意力分治降复杂度", "VideoMAE 高掩码自监督", "Video-LLM 抽帧接 LLM", "长视频粗定位+细读两段式"],
    followUps: ["VideoMAE 掩码率为何远高于 MAE？（提示：视频时间冗余大，低掩码率重建任务太简单学不到语义）", "长视频怎么控成本？（提示：先低密度粗扫定位片段，再片段内密帧精读）", "只用视觉轨的盲区？（提示：教学/访谈类语义多在音频轨，需 ASR 文本融合）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-287",
    nodeId: "ai-multimodal",
    question: "多模态大模型幻觉是什么？成因、评估与缓解手段？",
    answer: `【分层原理】结论：MLLM 幻觉指模型生成与图像内容不符的描述（编造物体、属性、计数错误），根因是"语言先验压倒视觉证据"。成因三层：①数据层——训练 caption 由模型改写或网络抓取，本身含想象性描述，模型学到"看图说话可以脑补"；②建模层——自回归生成越往后越依赖已生成文本而非图像，实证生成 100+ token 后视觉 token 注意力占比降一半以上；③评测层——CIDEr 等传统指标奖励流畅而非忠实。评估主流用 POPE（询问"图中是否有 X"，对抗采样负例测 F1）与人工忠实度抽检。缓解三板斧：训练侧用忠实度偏好对做 RLHF/DPO；推理侧用对比解码（VCD：正常图与加噪图 logits 相减，抑制无视觉证据也能编出的先验）；数据侧用 dense caption 与硬负例。

【实际案例】字节内部商品详情图描述任务：初版 MLLM 幻觉率（人工抽检）7.8%，主要形态是编造不存在的规格文字，POPE 式自动评估定位到长描述后半段是重灾区。治理：3 万条"忠实 vs 脑补"偏好对做 DPO + 超长生成强制引用视觉 grounding，幻觉率降到 2.1%，详情页质检通过率升 11 个点。公开结果：OPERA 报告 LLaVA-1.5 长生成幻觉显著上升；VCD 免训练把 POPE F1 提升约 7 个点，代价是描述丰富度略降。

【举一反三】同一"先验 vs 证据"框架迁移：LLM 文本幻觉（检索证据 vs 参数记忆）、ASR 幻觉（静音段幻听文字）都用对比解码/证据约束/偏好对齐三件套。决策模型：先自动评估定位幻觉高发段（长生成、罕见实体），再选手段——快速止血用 VCD/OPERA 惩罚解码，要根治上 DPO。

【扣分点对照】背八股的说"幻觉就是瞎编，加数据就行"；真做过的能讲语言先验压视觉的机理（注意力随生成长度衰减）、POPE 对抗负例怎么构造、DPO 偏好对如何标注硬负例，以及 VCD 免训练但损失描述丰富度的 trade-off。

\`\`\`python
# VCD 对比解码：抵消无图也能编出的语言先验
logits_img = model(image, prompt)               # 正常前向
logits_noise = model(add_noise(image), prompt)  # 破坏视觉证据
logits = (1 + alpha) * logits_img - alpha * logits_noise
next_tok = sample(logits)   # 先验词两种输入下概率相近 → 被抵消
\`\`\`

踩坑：①只报 CIDEr 不报忠实度，指标涨幻觉也涨；②DPO 负样本太容易被秒分，偏好学习失效，需同场景错物体的硬负例；③对比解码 alpha 过大会把正确实体也压掉。`,
    keyPoints: ["幻觉=语言先验压倒视觉证据", "POPE 对抗负例测忠实度", "DPO 偏好对齐根治", "VCD 对比解码免训练止血"],
    followUps: ["长描述为什么幻觉更多？（提示：自回归越往后越依赖已生成文本，视觉注意力占比衰减）", "VCD 为什么能抑制幻觉？（提示：先验词在有/无视觉输入下概率相近，对比相减被抵消）", "DPO 偏好对怎么构造？（提示：同图忠实描述为正、同场景错物体描述为硬负例）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-model-deploy =====

  {
    id: "ai-189",
    nodeId: "ai-model-deploy",
    question: "模型量化原理？GPTQ/AWQ/INT8 区别？",
    answer: `【分层原理】结论：量化用低精度整数近似浮点权重/激活，省显存、提带宽利用率，INT4 把 7B 模型从 14GB 压到约 4GB。分层：①PTQ 免重训——GPTQ 逐层量化，用 Hessian 逆（OBQ 方法）对未量化权重做误差补偿，W4A16 困惑度逼近 FP16；②AWQ——发现约 1% 的 salient 权重（按激活幅度判定）决定精度，不直接量化它们而是做 per-channel 缩放保护，比 GPTQ 更稳且对指令模型泛化更好；③INT8 动态量化开箱即用、损失常 <0.5%，INT4 则必须 GPTQ/AWQ + 校准数据。为什么提速：decode 是 memory-bound，权重读取量减 4 倍，吞吐近线性提升。group_size=128 是精度-显存的常用折中。

【实际案例】阿里 Qwen 官方发布 GPTQ-Int4/AWQ 版：Qwen-72B-Int4 单卡 A100-80G 可跑（FP16 需 2 卡），MMLU 仅掉 0.6 分，推理吞吐提升 2.4 倍，线上成本减半。字节广告精排模型 INT8 对照：直接 PTQ 离线 AUC 掉 0.4% 超红线；改 QAT + 校准集代表性采样后损失压到 0.05%，全量后 CPM 无损。vLLM/TensorRT-LLM 内置 AWQ/GPTQ kernel，W4A16 实测 decode 提速 1.8-3 倍。

【举一反三】决策模型迁移：边缘端优先 W4A8 或 QAT-INT8（延迟敏感）；云端高吞吐选 W4A16（显存敏感）；精度红线 <0.3% 必须 QAT。Embedding 层、第一层与 lm_head 对量化敏感是通用规律——检测模型的 head 同理保 FP16。

【扣分点对照】背八股的背"GPTQ 二阶、AWQ 激活感知"；真做过的能讲 group_size 的精度-显存账、校准数据分布漂移翻车案例（英文校准量化中文模型掉 2 分）、lm_head 为何通常跳过量化，以及线上 AUC 红线与回滚预案。

\`\`\`python
from awq import AutoAWQForCausalLM
model = AutoAWQForCausalLM.from_pretrained("Qwen-7B")
model.quantize(tokenizer, quant_config={"w_bit": 4,
               "q_group_size": 128, "version": "GEMM"})  # W4A16
model.save_quantized("qwen-7b-awq")   # vLLM 可直接加载；校准集须贴合线上分布
\`\`\`

踩坑：①校准集与线上分布不一致，垂直领域（医疗/代码）量化后崩；②group_size 开 512 省显存但 PPL 明显回升；③目标框架 kernel 对量化格式支持有限，部署前必须实测而非只看论文数字。`,
    keyPoints: ["PTQ 免重训 INT8 开箱即用", "GPTQ 二阶误差补偿", "AWQ 保护 1% salient 权重", "decode memory-bound 量化近线性提速"],
    followUps: ["为什么 decode 量化收益大？（提示：decode 是 memory-bound，权重读取量减 4 倍带宽就近 4 倍）", "AWQ 如何找 salient 权重？（提示：按激活幅度判定约 1% 通道，per-channel 缩放保护）", "QAT 何时必须上？（提示：PTQ 损失超精度红线如 0.3% 时，伪量化参与训练补偿）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-190",
    nodeId: "ai-model-deploy",
    question: "部署视角的知识蒸馏：在线蒸馏、蒸馏+量化组合怎么做？",
    answer: `【分层原理】结论：部署视角的蒸馏是"用大模型能力换小模型成本"，三形态按 teacher 能否独立存在划分。①离线蒸馏：teacher 先训到收敛再产软标签，student 同时拟合硬标签（CE）与软标签（KL，温度 T=3-5 软化分布，暗知识藏在非目标类概率里），最常见但 teacher 训练贵；②在线蒸馏：teacher 与 student 同步训练甚至互为同伴互蒸，省掉单独训 teacher 的阶段，适合 teacher 本身上不了产线的场景，风险是 teacher 早期未收敛带偏 student，需 warmup 后再开蒸馏项；③自蒸馏：深层教浅层、历史 checkpoint 教当前。蒸馏+量化是端侧标配：先蒸出小模型，QAT 阶段继续用 FP32 teacher 软标签做蒸馏损失，补偿伪量化引入的精度损失，普遍比"先 PTQ 再补救"高 0.3-1 个点。注意蒸馏目标须与线上推理精度格式一致——FP16 teacher 教 INT8 student 数值范围不匹配会掉点。

【实际案例】美团外卖搜索精排：teacher 为 12 层大模型只做离线打分，student 4 层上线；硬标签训练时在线 AUC 差 0.9%，引入在线蒸馏（teacher 每日随样本回流更新）后差距收窄到 0.15%，QPS 承载提升 5 倍。阿里端侧商品识别走"蒸馏→QAT 联合训练"：直接 INT8 PTQ 掉 1.8%，联合训练后压到 0.3% 以内，端侧推理 23ms→9ms。

【举一反三】同思路迁移：LLM 场景用 72B 蒸 7B（软标签 + hidden states 对齐）；检测场景大检测器蒸 YOLO（特征层 + logits 双蒸馏）。决策模型：线上同时有精度红线与成本红线时，"离线蒸馏保上限 + QAT 保部署"是标准组合拳。

【扣分点对照】背八股的只说"大模型教小模型"；真做过的能讲 T 与损失权重配比（T 大暗知识足但梯度平，需乘 T² 补偿）、在线蒸馏 warmup 策略、以及蒸馏目标必须对齐线上推理精度格式这个隐蔽坑。

\`\`\`python
# QAT + 蒸馏联合：量化 student 同时拟合硬标签与 teacher 软标签
student_q = torch.ao.quantization.prepare_qat(student.train())
with torch.no_grad(): t_logits = teacher_fp32(x)     # teacher 保高精度
s_logits = student_q(x)
loss = F.cross_entropy(s_logits, y) + 0.7 * F.kl_div(
    F.log_softmax(s_logits/4, -1), F.softmax(t_logits/4, -1),
    reduction="batchmean") * 16                       # T=4，乘 T² 补偿
\`\`\`

踩坑：①在线蒸馏不开 warmup，teacher 乱教 student 学歪；②BN 折叠与伪量化节点位置不对，训完一部署就掉点；③顺序做反（先量化后蒸馏），量化噪声固化进权重救不回。`,
    keyPoints: ["离线/在线/自蒸馏三形态", "温度 T 软化分布藏暗知识", "蒸馏+QAT 联合补偿量化损失", "蒸馏目标对齐线上推理精度"],
    followUps: ["QAT 与 PTQ 区别？（提示：QAT 训练中插入伪量化节点让模型适应量化噪声，PTQ 训后近似）", "在线蒸馏为何要 warmup？（提示：teacher 未收敛时软标签是噪声，会带偏 student）", "T² 补偿是什么？（提示：软标签梯度幅值随 T 平方缩小，乘 T² 保持与硬标签梯度量级可比）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-191",
    nodeId: "ai-model-deploy",
    question: "ONNX / TensorRT 推理优化原理？如何加速？",
    answer: `【分层原理】结论：ONNX 解决"模型跨框架搬运"，TensorRT 解决"在特定 GPU 上跑到极限"，两者常串联使用。机制三层：①图导出——PyTorch → ONNX 把动态图固化成静态计算图，opset 版本决定算子集；②图优化——TensorRT 做常量折叠、层间融合（Conv+BN+ReLU 融成一个 kernel，省中间 tensor 写回显存）、死代码消除、kernel auto-tuning（按实际 GPU 试跑选最优 CUDA kernel 与 tile 配置）；③精度优化——FP16 直接提速约 2 倍，INT8 用校准集（KL 散度选激活阈值）再提速 1.5-2 倍。为什么快这么多：推理瓶颈常在内存搬运而非计算，融合减少显存往返次数是收益大头。

【实际案例】百度 OCR 检测+识别链路：原生 PyTorch 单卡 T4 仅 40 QPS；ONNX + TensorRT FP16 + 动态 shape 到 150 QPS；叠加 INT8 校准到 220 QPS，单卡成本降 80%，识别精度损失控制在 0.2 个点内。美团视觉审核模型曾遇转换后结果漂移：逐层比对发现 Resize 算子 align_corners 在 ONNX 与 PyTorch 默认值不一致，统一预处理后 badcase 清零——"框架语义差"是转换头号坑。

【举一反三】同一"导出→融合→校准"思路迁移：端侧 ONNX→NCNN/MNN、CPU 侧 ONNX Runtime + OpenVINO、LLM 侧 TensorRT-LLM（attention/KV cache 做成定制 plugin）。决策模型：固定 GPU 型号 + 高 QPS 必上 TensorRT；多硬件适配优先 ONNX Runtime 保可移植性。

【扣分点对照】背八股的说"ONNX 是中间格式 TensorRT 加速"；真做过的能配动态 shape 的 optimization profile（min/opt/max）、讲 INT8 校准集规模（CV 一般 500-1000 张代表性样本）、哪些层需 fallback FP16（LayerNorm 等数值敏感层），以及转换后逐层数值比对定位漂移的方法。

\`\`\`python
torch.onnx.export(model, dummy, "m.onnx", opset_version=17,
                  dynamic_axes={"input": {0: "batch"}})   # 动态 batch
config = builder.create_builder_config()
config.set_flag(trt.BuilderFlag.FP16)
profile = builder.create_optimization_profile()           # min/opt/max shape
\`\`\`

踩坑：①自定义算子 ONNX 无对应，需写 plugin 或拆图；②TensorRT 引擎绑定 GPU 型号与驱动版本，换卡必须重新 build；③动态 shape 不配 profile 直接 build 失败或回退最慢路径。`,
    keyPoints: ["ONNX 静态图跨框架搬运", "TensorRT 融合+auto-tuning", "INT8 校准再提速 1.5-2 倍", "框架语义差是转换头号坑"],
    followUps: ["算子融合为什么快？（提示：减少中间 tensor 显存往返，推理瓶颈常在带宽不在算力）", "动态 shape 怎么处理？（提示：optimization profile 配 min/opt/max 三档 shape）", "INT8 校准集怎么选？（提示：500-1000 张贴合线上分布的代表性样本，KL 散度定阈值）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-192",
    nodeId: "ai-model-deploy",
    question: "模型服务化与 Triton？如何做高并发推理？",
    answer: `【分层原理】结论：模型服务化的核心矛盾是"GPU 喜欢大批次、用户要低延迟"，Triton 用动态 batching 在两者之间找平衡点。分层：①动态 batching——请求进队列后等待 max_queue_delay（如 1000-2000μs）攒成 preferred_batch_size 一起推理，吞吐提升 2-5 倍而 P99 延迟只加毫秒级；②instance_group——同模型单卡起多实例隐藏 kernel 启动空隙，或多卡自动并行；③ensemble 编排——预处理→推理→后处理串成 pipeline，避免业务侧多次 RPC 与数据拷贝。为什么攒批有效：小 batch 时 GPU SM 利用率不足 20%，kernel launch 与权重读取是固定开销，攒批直接摊薄。

【实际案例】阿里妈妈广告精排服务：单模型直推单卡 800 QPS 时 P99 45ms（batch 小利用率低）；开动态 batching（preferred [8,16,32]，delay 1000μs）后同延迟下吞吐 3200 QPS，大促省 60% 卡。腾讯 TI 平台实践：ensemble 把图像解码+预处理下沉到 Triton 内，端到端延迟降 18%，业务侧只发原图。模型热更新让版本切换秒级完成，无需重启——这正是灰度发布的基础设施。

【举一反三】决策模型迁移：LLM 服务对应 continuous batching（vLLM 按 token 步调度而非整请求攒批）；CPU 特征服务用异步协程 + 批量 RPC 同理摊薄开销；流式场景（ASR）不能整请求攒批，改用 sequence batching 保会话状态。

【扣分点对照】背八股的说"Triton 支持多框架和动态 batching"；真做过的能给 delay 与吞吐的实测权衡曲线、讲 instance_group 的 KIND_GPU/KIND_CPU 选择、warmup 配置避免首请求 JIT 卡顿，以及 ensemble 里 GPU/CPU 混合调度的数据拷贝开销。

\`\`\`python
# config.pbtxt 关键配置
dynamic_batching {
  preferred_batch_size: [8, 16, 32]
  max_queue_delay_microseconds: 1000   # 攒批等待上限，按 SLA 反推
}
instance_group { count: 2 kind: KIND_GPU }   # 单卡双实例
model_warmup { name: "warmup" batch_size: 8 } # 预热防首请求卡顿
\`\`\`

踩坑：①delay 设太长吞吐涨但 P99 爆掉，需按 SLA 反推；②模型大首加载 30s+，不配 warmup 首波请求全超时；③HTTP 头开销占小请求 30%+，内网服务换 gRPC。`,
    keyPoints: ["动态 batching 攒批摊薄固定开销", "instance_group 多实例隐藏空隙", "ensemble 编排免多次 RPC", "热更新支撑秒级版本切换"],
    followUps: ["delay 与吞吐如何权衡？（提示：delay 越长 batch 越大吞吐越高，但 P99 延迟线性上涨，按 SLA 反推）", "LLM 为什么不用这种攒批？（提示：逐 token 生成且长度不一，需 continuous batching 按步调度）", "为什么要 warmup？（提示：首请求触发 kernel JIT 与显存分配，预热避免上线即超时）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-193",
    nodeId: "ai-model-deploy",
    question: "LLM 推理加速：KV Cache 原理？PagedAttention 如何优化？",
    answer: `【分层原理】结论：KV Cache 把 decode 从"每步重算全部历史"变成"每步只算新 token"，PagedAttention 再把 cache 管理从"连续大数组"改成"分页块"，解决显存碎片。复杂度账（生成长度 n、隐层 d）：无 cache 第 t 步对 t 个位置重算注意力，单步 O(t²·d)、累计 O(n³·d)；有 cache 第 t 步只算新 token 的 Q/K/V 并与缓存的 t 个 K/V 点积，单步 O(t·d)、累计 O(n²·d)——平方项来自注意力本身无法消除，cache 省掉的是重复计算的立方项。PagedAttention（vLLM）借鉴 OS 虚拟内存：KV 按 block（默认 16 token/块）按需分配，请求间可共享前缀块（system prompt 只存一份），碎片率从 60-80% 降到 <4%，配合 continuous batching 吞吐提升 2-4 倍。GQA 让多个 Q 头共享一组 K/V 头，KV 显存再降数倍，是长上下文标配。

【实际案例】字节 LLM 网关实测：7B 模型 A10 单卡，静态 batching 峰值 1200 tok/s；切 vLLM PagedAttention + continuous batching 后 3800 tok/s，GPU 利用率 35%→82%。LLaMA-3-70B 用 GQA（8 KV 头 vs 64 Q 头）后 8K 上下文 KV Cache 从 20GB/请求降到 2.5GB，单卡并发提 4 倍；前缀共享让带 4K system prompt 的 Agent 场景显存再省 35%。

【举一反三】分页思想迁移：多轮对话复用历史 KV（RadixAttention/SGLang 的 LRU 树）；RAG 长文档分块缓存同理。决策模型：吞吐优先选 vLLM 系；低延迟单请求场景 cache 收益小——瓶颈在权重带宽，该上投机解码或量化。

【扣分点对照】背八股的说"缓存 K V 避免重复计算"；真做过的能写 O(n³)→O(n²) 的账、讲清 prefill 是 compute-bound 而 decode 是 memory-bound 所以优化手段不同、GQA 对 KV 显存的具体倍数，以及 OOM 时该压 max_model_len 还是开 prefix caching。

\`\`\`python
# KV Cache：第 t 步只算新 token，复用历史 K/V
q = proj_q(new_token)
k = torch.cat([cached_k, proj_k(new_token)], 1)   # 追加而非重算
v = torch.cat([cached_v, proj_v(new_token)], 1)
attn = q @ k.T          # 单步 O(t·d)，累计 O(n²·d) 而非 O(n³·d)
\`\`\`

踩坑：①max_num_seqs 开太大，KV 池耗尽触发抢占重算，延迟尖刺；②GQA 模型 num_kv_heads 配错直接 OOM；③未开 prefix caching 时多轮对话每轮重算 system prompt，首 token 延迟翻倍。`,
    keyPoints: ["KV Cache 省掉重复计算立方项", "PagedAttention 分页减碎片", "continuous batching 按 token 调度", "GQA 共享 K/V 头压显存"],
    followUps: ["GQA 和 MQA 的取舍？（提示：MQA 全共享最省显存但掉点多，GQA 分组共享是精度-显存折中）", "prefill 与 decode 瓶颈差异？（提示：prefill compute-bound 拼算力，decode memory-bound 拼带宽）", "前缀共享适合什么场景？（提示：多请求共用 system prompt 的 Agent/客服场景，KV 只存一份）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-194",
    nodeId: "ai-model-deploy",
    question: "大模型部署方案：vLLM / TGI / DeepSpeed-FastGen 对比？",
    answer: `【分层原理】结论：三者都能跑 LLM 推理，差异在调度器与 kernel 设计哲学。①vLLM：PagedAttention + continuous batching（按 token 步调度，请求完成即插入新请求），吞吐最高、OpenAI 兼容 API 开箱即用，是当前开源事实标准；②TGI（HuggingFace）：Rust 核心，功能全（SSE 流式、grammar 约束输出、多 LoRA 热加载成熟），企业集成顺滑；③DeepSpeed-FastGen：Dynamic SplitFuse 把长 prompt 的 prefill 切片混进 decode 批次，TTFT（首 token 延迟）平滑，避免长 prompt 阻塞整批 decode。选型公式：高吞吐通用服务选 vLLM；重企业功能选 TGI；长上下文 Agent（prompt 10K+）实测 SplitFuse 或 vLLM 的 chunked prefill——后者已成主流答案。

【实际案例】阿里内部客服 LLM 平台起步用 TGI（需 grammar 约束保证 JSON 输出稳定），日均 2 亿 token；流量涨到 5 亿后切 vLLM，同规格机器吞吐提升 2.3 倍、单 token 成本降 55%。另一 Agent 场景 prompt 平均 8K token：vLLM 未开 chunked prefill 时 TTFT 尖刺 4s，开启（chunk 512）后尖刺压到 800ms，decode 吞吐仅降 7%。微软报告 FastGen 在长 prompt 下吞吐达 vLLM 2 倍（2024 基准），但社区与模型支持广度 vLLM 占优。

【举一反三】选型框架可迁移到任何推理系统评估：调度粒度（请求级 vs token 级）、内存管理（静态 vs 分页）、prefill/decode 耦合方式（超大流量可上 PD 分离架构如 DistServe，两者放不同卡）。小团队快速上线直接 vLLM，别为 5% 的性能差自建轮子。

【扣分点对照】背八股的罗列三个名字加一句"vLLM 快"；真做过的能讲 continuous batching 与 dynamic batching 的本质差异（token 级 vs 请求级调度）、长 prompt 阻塞 decode 的成因与 chunked prefill 解法、tensor_parallel_size 与 NVLink 的关系，并报出实测 TTFT/TPOT 指标。

\`\`\`python
from vllm import LLM, SamplingParams
llm = LLM(model="Qwen/Qwen2-7B", tensor_parallel_size=2,
          enable_chunked_prefill=True, max_num_batched_tokens=4096)
out = llm.generate(prompts, SamplingParams(temperature=0.7, max_tokens=512))
# 服务化: vllm serve Qwen/Qwen2-7B --enable-chunked-prefill
\`\`\`

踩坑：①gpu_memory_utilization 默认 0.9，多实例共存必调低否则互相 OOM；②TP=2 跨 NUMA 无 NVLink 时通信开销吃掉一半收益；③量化模型 kernel 不匹配会静默回退慢路径，需看启动日志确认。`,
    keyPoints: ["vLLM token 级调度吞吐最高", "TGI Rust 核心企业功能全", "chunked prefill 平滑 TTFT", "选型三轴：调度/内存/PD 耦合"],
    followUps: ["长 prompt 为何阻塞 decode？（提示：prefill 与 decode 同批执行，长 prompt 前向耗时拖住整批）", "chunked prefill 如何解？（提示：把 prefill 切片混入 decode 批次，TTFT 平滑代价是少量吞吐）", "TP 多卡前提？（提示：卡间需 NVLink 高带宽互联，否则通信吃掉并行收益）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-195",
    nodeId: "ai-model-deploy",
    question: "边缘部署与模型压缩？手机/IoT 如何跑模型？",
    answer: `【分层原理】结论：端侧部署约束是"算力弱、内存小、功耗敏感"，方法论是"算法压缩 × 硬件亲和框架"双轮驱动。压缩层：①剪枝——非结构化剪枝稀疏度高但硬件不友好，结构化剪枝（整通道/整层删）直接降 FLOPs，剪 30% 通道延迟近似线性降；②量化——INT8 PTQ 是底线，INT4 需 QAT；③蒸馏——大模型软标签教小模型补回压缩损失。框架层：NCNN（腾讯，ARM 优化极致）、MNN（阿里，异构调度全）、TFLite（配 NNAPI/GPU delegate）；带 NPU 的机型（骁龙 HTP/麒麟达芬奇）走厂商 SDK 再提速 2-3 倍且省电约 50%。为什么必须硬件亲和：同一个 INT8 conv，手写 NEON kernel 与 naive 实现差 5-10 倍。

【实际案例】支付宝 AR 扫福：端侧检测+识别整链预算 100ms/中端机，初版 FP32 TFLite 实测 380ms；走"结构化剪枝 40% → INT8 QAT → NCNN NEON"后降到 85ms，模型 28MB 压到 3.1MB，识别准确率仅掉 0.4%。字节抖音端侧特效模型用 MNN + GPU delegate，千元机稳定 30fps，OOM 崩溃率从 0.12% 降到 0.01%。微信小游戏的人脸关键点用 TFLite Micro 级方案跑在百元设备。

【举一反三】决策模型迁移：车机（8155）等同高端手机配方；MCU（Cortex-M）用 TFLite Micro + CMSIS-NN，模型需 <500KB；Apple 设备统一 CoreML + ANE。IoT 摄像头人形检测经典配方：端侧小模型唤醒 + 云端大模型复核，带宽成本降 95%。

【扣分点对照】背八股的背"剪枝量化蒸馏"三字经；真做过的能区分结构化/非结构化剪枝的硬件收益差异、讲 NPU 算子白名单问题（不支持就 fallback CPU 慢 10 倍）、内存峰值怎么逐层 profile（往往是中间 tensor 而非权重撑爆），以及端云协同的带宽账。

\`\`\`python
# 压缩流水线：剪枝 → QAT → 转端侧格式
pruned = prune_structured(model, amount=0.4)      # 删 40% 通道
qat_model = prepare_qat(pruned); finetune(qat_model)  # 微调补精度
torch.onnx.export(qat_model, dummy, "m.onnx")
# MNNConvert -f ONNX --modelFile m.onnx --MNNModel m.mnn --fp16
\`\`\`

踩坑：①剪枝后不微调掉 3-5 个点，至少补 10% epoch；②NPU 算子不支持静默 fallback CPU，延迟暴涨，需开厂商 profiling 确认；③CoreML 转换 BatchNorm 融合出错，转换后必须逐层对数值。`,
    keyPoints: ["结构化剪枝硬件才受益", "INT8 QAT 是端侧底线", "NCNN/MNN/TFLite 硬件亲和", "NPU 白名单与 fallback 是坑"],
    followUps: ["非结构化剪枝为何不提速？（提示：稀疏矩阵无专用硬件支持，FLOPs 降但延迟不降）", "端侧内存峰值如何排查？（提示：逐层 profile，中间 tensor 往往比权重更占内存）", "端云协同怎么分工？（提示：端侧小模型唤醒过滤，云端大模型复核，省 95% 带宽）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-206",
    nodeId: "ai-model-deploy",
    question: "Speculative Decoding 投机解码原理？Medusa/EAGLE 变体？接受率与加速比关系？",
    answer: `【分层原理】结论：投机解码用"小模型猜、大模型验"把串行 decode 变成并行验证，数学上保证输出分布与大模型完全一致（无损加速）。机制：decode 在小 batch 时是 memory-bound，GPU 算力闲置——draft 模型自回归猜 γ 个 token，target 模型一次前向并行算这 γ 个位置的 logits，额外计算几乎免费。逐位置比较：target 概率 ≥ draft 必接受，否则以 p_target/p_draft 概率接受；第一个拒绝处从修正分布 norm(max(0, p_target−p_draft)) 重采样并终止——这套接受-修正规则正是分布无损的保证。加速比 ≈ 平均接受 token 数 /（draft 耗时占比+1），接受率 α 是命门：draft 越小越快但 α 越低。变体：Medusa 在 target 上加多个预测头免独立 draft；EAGLE 在特征层外推 + 树状草稿（tree attention 一次验多分支），平均接受 3-4 token，是当前最强开源方案。

【实际案例】vLLM/SGLang/TensorRT-LLM 均已集成 EAGLE/Medusa，对话场景实测 1.5-2.5 倍加速。字节 LLM 网关策略：低峰小 batch 开投机解码，TPOT 55ms→28ms；高峰大 batch 关闭——batch>32 后 decode 转 compute-bound，验证步骤成纯开销，吞吐反降 15%。EAGLE 论文报告 Vicuna-7B greedy 下加速 2.8 倍、平均接受长度约 3.6。

【举一反三】"猜测-验证"范式迁移：RAG 级联推理——小模型先答、不确定再大模型复核，省 60% 成本；CPU 分支预测/编译器推测执行同思想。决策模型：负载低 + 温度低 + 任务模式化（代码补全接受率最高）→ 必开；高并发 + 高温度采样 → 关闭。

【扣分点对照】背八股的说"小模型猜大模型确认"；真做过的能推导接受-修正公式为何分布无损、报 γ 与 α 的实测曲线（γ=4-6 通常最优，过大白算）、讲清高温度接受率骤降的原因（分布分散难猜中），以及 draft/target 分词器必须一致这个工程死穴。

\`\`\`python
def speculative_step(target, draft, prefix, gamma=4):
    tokens = list(prefix)
    for _ in range(gamma): tokens.append(draft.sample(tokens))  # draft 猜 γ 个
    logits = target.forward(tokens)             # target 一次并行验证
    for i in range(gamma):
        p_t, p_d = softmax(logits[len(prefix)+i]), draft.last_prob[i]
        if not accept(p_t, p_d):                # 拒绝：修正分布重采样后终止
            tokens[len(prefix)+1+i] = sample_residual(p_t, p_d); break
    return tokens   # 至少前进 1 步，分布与 target 完全一致
\`\`\`

踩坑：①temperature>1 时接受率从 80% 跌到 40%，收益归零；②γ 超平均可接受长度后多做无用前向；③大 batch 下验证是额外开销，需按负载动态开关；④draft 与 target 词表不一致直接错码。`,
    keyPoints: ["draft 猜 γ 个 target 并行验证", "接受-修正规则保分布无损", "加速比=接受数/(draft 开销+1)", "Medusa 多头/EAGLE 树状草稿"],
    followUps: ["为何说投机解码分布无损？（提示：拒绝处从 norm(max(0,p_t−p_d)) 重采样，数学上等于从 target 采样）", "什么负载该关闭投机？（提示：大 batch 下 decode 转 compute-bound，验证成纯开销）", "γ 怎么定？（提示：实测接受率曲线，γ=4-6 通常最优，超平均接受长度后白算）"],
    favorited: false,
    bigTech: true,
  },

  // ===== ai-mlops =====

  {
    id: "ai-196",
    nodeId: "ai-mlops",
    question: "实验管理与模型注册？MLflow/W&B 如何用？",
    answer: `【分层原理】结论：实验管理回答"哪个模型好、好在哪、怎么复现"，模型注册回答"哪个版本在线上、怎么回滚"。分层：①实验跟踪——每次 run 记录超参、指标、代码 commit、环境、数据版本，五者缺一复现链就断；②制品管理——模型文件、ONNX、特征 schema 统一存 artifact store 并带血缘（哪个 run 产出）；③模型注册——版本号 + 阶段机（Staging/Production/Archived），阶段切换即发布动作并配审批流；④工具选型——W&B 胜在可视化协作（sweep 超参搜索、报告分享），MLflow 胜在开箱私有化全链路。为什么必须代码+数据双版本：同样超参换一天的数据快照，AUC 可能差 1 个点，只记 commit 复现不了。

【实际案例】某推荐团队曾靠微信群发截图记实验，一次线上事故要回滚到"上周二那个好模型"，三人花两天才对齐出对应 checkpoint 与数据版本。上 MLflow 后：训练脚本自动 log_param/log_metric，注册表绑定 CI 卡点（Staging→Production 需离线评估报告 + 审批），回滚从 2 天缩到 3 分钟（改别名 + Triton 热加载）。W&B 公开案例中，团队用 sweep 管理上千组超参搜索，找到最优组合比手动网格快 5 倍。

【举一反三】决策模型迁移：小团队云上起步用 W&B（免运维）；金融/政企数据不出域用 MLflow 私有化；超大规模推荐广告自研（字节 Ablab 类）。同样的"版本+阶段机"思想适用于 prompt 管理（prompt registry）与特征版本（Feast registry）。

【扣分点对照】背八股的说"记录实验、管理模型版本"；真做过的能讲复现链五要素、Staging/Production 阶段机如何接 CI 卡点、artifact 血缘怎么追踪到训练数据快照，以及多团队共用注册表时的命名空间与权限隔离设计。

\`\`\`python
import mlflow
mlflow.set_experiment("ctr-model")
with mlflow.start_run():
    mlflow.log_params({"lr": 1e-3}); mlflow.log_metric("auc", auc)
    mlflow.log_artifact("data_snapshot.dvc")       # 血缘：数据版本
    mlflow.pytorch.log_model(model, "model")
    mlflow.register_model(f"runs:/{run_id}/model", "CTR-Model")  # 入注册表
\`\`\`

踩坑：①只 log 最终指标不 log 逐 epoch 曲线，loss 震荡排查无据；②注册模型不绑数据版本，复现时数据已漂移；③artifact 不设生命周期策略，半年对象存储账单爆炸。`,
    keyPoints: ["复现链五要素缺一不可", "artifact 带血缘追踪", "注册表阶段机=发布动作", "W&B 协作 MLflow 私有化"],
    followUps: ["复现链包含什么？（提示：超参/指标/代码 commit/环境/数据版本五要素）", "Staging→Production 怎么管？（提示：阶段切换绑 CI 门禁与审批，自动触发部署）", "MLflow 与 W&B 怎么选？（提示：协作可视化选 W&B，私有化全链路选 MLflow）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-197",
    nodeId: "ai-mlops",
    question: "数据版本管理？DVC 如何与 Git 配合？",
    answer: `【分层原理】结论：DVC 让 Git 只记"数据的指针"，大文件本体进对象存储，实现"代码+数据+模型"三位一体版本化。机制：①dvc add 生成 .dvc 元文件（MD5 + 远程路径）提交 Git，数据本体推 S3/OSS/MinIO，Git 仓库保持轻量；②dvc checkout 与 git checkout 联动，切到任意 commit 即恢复当时数据快照；③dvc.yaml 定义 pipeline 阶段（preprocess→train→evaluate），各阶段声明依赖与产物，dvc repro 按 DAG 增量重跑——上游没变就命中缓存秒过。为什么不用 Git LFS：LFS 仍把大文件纳入 Git 协议，clone 慢且无 pipeline 语义。数据血缘的价值：模型效果异动时可二分定位"数据变了还是代码变了"。

【实际案例】某自动驾驶初创管理 200TB 路采数据：早期工程师各自拷贝硬盘，同一模型复现 AUC 差 0.7 个点查了一周，根因是训练集版本混用。上 DVC + 自建 MinIO 后：每次训练锁定数据 commit，pipeline 缓存让"只改模型代码"的重训跳过预处理阶段省 70% 时间，实验间数据一致性零事故。字节/阿里的自研数据血缘平台逻辑同源，只是规模放大到 EB 级。

【举一反三】决策模型迁移：纯代码项目不需要 DVC；有"可复现实验"诉求的小团队 DVC 性价比最高；超大规模直接用湖仓（Iceberg 快照即数据版本）。同思想可用于评测集管理——评测集污染检测靠哈希比对版本。

【扣分点对照】背八股的说"DVC 管数据 Git 管代码"；真做过的能讲 .dvc 文件内容结构、dvc repro 的 DAG 缓存命中逻辑、远程存储 push/pull 与 CI 集成（CI 里 dvc pull 复现训练），以及大团队下 remote 权限与流量成本治理。

\`\`\`bash
dvc add data/train.csv          # 生成 train.csv.dvc 指针文件
git add train.csv.dvc .gitignore && git commit
dvc push                        # 本体推远程存储
git checkout v1.0 && dvc checkout   # 恢复 v1.0 数据快照
dvc repro                       # 按 DAG 增量重跑 pipeline，命中缓存秒过
\`\`\`

踩坑：①成员直接改数据文件不走 dvc add，指针与本体错位；②pipeline 阶段划分太细，缓存目录爆掉；③远程桶按量计费，CI 高频 pull 流量费超预算，需配缓存层。`,
    keyPoints: ["Git 记指针 DVC 管本体", "checkout 联动恢复数据快照", "dvc repro DAG 增量重跑", "数据血缘定位效果异动"],
    followUps: ["为什么不用 Git LFS？（提示：LFS 仍走 Git 协议 clone 慢，且无 pipeline 增量语义）", "dvc repro 如何加速？（提示：按依赖 DAG 判断，上游未变的阶段命中缓存直接跳过）", "实验效果异动怎么二分？（提示：锁定代码切数据版本、锁定数据切代码版本，分别重训对比）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-198",
    nodeId: "ai-mlops",
    question: "模型监控与漂移检测？如何发现线上效果下降？",
    answer: `【分层原理】结论：线上模型衰退分两类——数据漂移（输入分布 P(X) 变）与概念漂移（输入到标签的映射 P(Y|X) 变），监控体系要分层覆盖。①特征层：PSI/KL/KS 对比线上流量与训练分布，PSI<0.1 稳定、0.1-0.2 预警、>0.2 显著漂移；②预测层：预测分数分布偏移——模型还没错但行为已变，比业务指标更领先；③效果层：CTR/AUC/GMV 天级监控，滞后但终极；④概念漂移最隐蔽：用户兴趣变了，特征分布可能没动但点击逻辑变了，只能靠标签回流（延迟 1-7 天）或代理信号（预测置信度熵变化）检测。为什么分领先/滞后指标：等业务指标跌才发现已损失一周，预测分布偏移可提前 2-3 天预警。

【实际案例】字节推荐监控体系：小时级 PSI 扫上千特征 + 预测分布监控。某次热点事件用户行为剧变，特征 PSI 两小时破 0.3 触发告警，自动拉近 6 小时样本增量热更新，CTR 仅短时波动 1.5% 即恢复；无热更新机制的对照同期跌 8%。腾讯广告监控 CTR 预估校准度（predict/actual 比值），偏差 >5% 触发自动重校准，年挽回收入损失以亿计。

【举一反三】决策模型迁移：LLM 应用对应"prompt 分布漂移 + 输出质量漂移"——用 embedding 聚类监控 query 主题迁移、LLM-as-judge 抽评输出；风控反欺诈是概念漂移极端场景（黑产周级变异），必须流式标签 + 日级迭代。通用公式：领先指标预警 + 滞后指标确认 + 自动重训闭环。

【扣分点对照】背八股的说"PSI 检测漂移"；真做过的能讲分箱策略对 PSI 的影响（等频 vs 等距）、为什么预测分布比业务指标更领先、无标签时概念漂移的代理信号，以及告警阈值的误报疲劳 vs 漏报损失权衡。

\`\`\`python
def psi(base, cur, bins=10):                     # 等频分箱
    b = np.histogram(base, bins)[0] / len(base) + 1e-6
    c = np.histogram(cur, bins)[0] / len(cur) + 1e-6
    return np.sum((c - b) * np.log(c / b))       # >0.2 显著漂移
for f in features:
    if psi(train[f], online[f]) > 0.2: alert(f"{f} 漂移，触发重训评估")
\`\`\`

踩坑：①等距分箱导致长尾特征 PSI 虚高误报；②只盯单特征忽略联合分布漂移（各自稳但相关性变了）；③报警无闭环，漂移了没人重训等于白监控。`,
    keyPoints: ["数据漂移 vs 概念漂移", "PSI 分三档 0.1/0.2", "预测分布是领先指标", "漂移告警须接重训闭环"],
    followUps: ["概念漂移无标签怎么发现？（提示：预测置信度熵变化、标签回流延迟窗口对比等代理信号）", "PSI 分箱怎么选？（提示：等频分箱更稳，等距对长尾特征虚高误报）", "阈值怎么定？（提示：按误报疲劳与漏报损失画 ROC 式权衡，核心特征从严）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-199",
    nodeId: "ai-mlops",
    question: "CI/CD for ML？模型上线流水线如何自动化？",
    answer: `【分层原理】结论：ML 的 CI/CD 在代码流水线之上叠加"数据+模型"两个新维度，核心是把"模型能不能上线"变成自动门禁。阶段分解：①CI——代码单测 + 数据验证（schema/空值率/分布检查，如 Great Expectations）+ 快速训练 smoke test（小数据 15 分钟跑通全链路）+ 离线评估门禁（新模型指标不劣于线上基线才准注册）；②CD——注册 → 灰度（1%→10%→50%）→ A/B 显著性检验 → 全量，每步带自动回滚条件（错误率/延迟/业务指标破阈值即切回）；③CT（持续训练）——数据漂移或定时触发再训练，流水线自动走完全程。为什么 smoke test 关键：训练 8 小时才发现 dataloader bug 是最贵的浪费。

【实际案例】字节推荐模型流水线：每日千余次实验提交，CI 层数据验证 + 千万样本 smoke 训练（15 分钟）拦截约 70% 低级错误；离线评估门禁要求核心指标不劣于基线 ±0.05%；CD 层 1% 灰度 2 小时自动校验 20+ 指标后逐级放量，全程无人值守，模型从提交到全量平均 8 小时。对照早期人工发布：平均 3 天且每季度至少 1 次发布事故。开源对应物是 Kubeflow/Metaflow + GitHub Actions。

【举一反三】决策模型迁移：LLM 应用 CI 对应"评测集回归门禁"（新 prompt/模型跑固定 eval 集，分不掉才准发）；CV 模型对应"金标集 + 混淆矩阵阈值"。通用原则：凡效果可量化的改动，都能把人工 review 翻译成自动门禁指标。

【扣分点对照】背八股的背"CI 测试 CD 部署"；真做过的能讲数据验证具体验什么（schema 变更/空值率/分布漂移）、smoke test 与全量训练的取舍、灰度阶段护栏指标 vs 目标指标的分工，以及流水线制品（数据版本/镜像/模型）如何统一溯源。

\`\`\`yaml
# 模型 CI/CD 流水线（简化）
ci:  [unit_test, data_validate, smoke_train, offline_eval_gate]
cd:  [register → canary_1% → auto_check(guardrail+target)
      → canary_10% → ab_test_24h → full_deploy]
rollback: { if: "err_rate>0.1% or p99_regression>10%", to: prev_version }
\`\`\`

踩坑：①离线评估集与线上分布脱节，离线涨线上跌，需定期回流线上样本建近线评测集；②灰度流量未按用户一致性切分，同一用户忽新忽旧体验抖动；③回滚只回模型不回特征逻辑，版本错乱。`,
    keyPoints: ["CI 加数据验证+smoke 训练", "离线评估门禁防劣化注册", "CD 灰度阶梯带自动回滚", "CT 漂移触发持续训练闭环"],
    followUps: ["smoke test 解决什么？（提示：小数据 15 分钟跑通全链路，拦截 dataloader 等低级错误）", "护栏指标与目标指标分工？（提示：护栏防事故如延迟/错误率，目标证价值如 CTR）", "离线涨线上跌的根因？（提示：评估集陈旧与线上分布脱节，需回流样本建近线评测集）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-200",
    nodeId: "ai-mlops",
    question: "特征平台建设？在线离线特征一致性如何保证？",
    answer: `【分层原理】结论：特征平台解决"特征定义一处、处处一致复用"，最大敌人是训练-服务偏差（training-serving skew）与特征穿越。架构三层：①离线——Spark 批计算写 Hive/Iceberg，供训练取数；②近线——Flink 流式更新实时特征（用户近 1 小时点击序列）写 Redis；③在线——特征服务低延迟查询（P99 <10ms）供推理。一致性三板斧：统一 DSL/protobuf 定义特征（一份定义编译出离线 SQL 与在线算子）、point-in-time join（训练样本只关联 label 时刻之前的特征，杜绝未来信息泄漏）、离在线双跑对账（抽样比对偏差率 <0.1%）。为什么穿越致命：用了"未来 1 天点击数"这类泄漏特征，离线 AUC 0.85 线上 0.6，且极难排查。

【实际案例】字节推荐特征平台管理百万级特征：早期各业务自算特征，同一个"用户 7 天活跃"有 5 种口径，训练-服务偏差导致线上效果平均比离线低 15%；统一平台后特征定义中心化 + point-in-time 快照，离在线一致率 99.9%，新特征上线周期从 2 周缩到 1 天。Feast（开源）被美团等用作在线特征底座，materialize 机制保证离在线同源。

【举一反三】决策模型迁移：风控对 point-in-time 要求更极端（毫秒级决策特征必须强一致）；LLM RAG 的"知识快照"同理——评测时必须用 query 时间之前的文档版本，否则评测泄漏。通用公式：一份定义 + 时间对齐 + 双跑对账 = 一致性。

【扣分点对照】背八股的说"统一存储保一致"；真做过的能讲 point-in-time join 实现（按 event_time 最近一条关联）、穿越的三种典型形态（聚合窗口越界/标签泄漏/时间戳对齐错）、在线 TTL 与新鲜度权衡，以及离在线对账的采样比例与告警设计。

\`\`\`python
# point-in-time join：只关联 label 时刻之前的特征，防穿越
def get_features(user, label_time):
    return feature_store.query(user, timestamp_lt=label_time)
# 流式特征用 event_time 而非处理时间窗口，防乱序错位
flink_sql = "SELECT user, COUNT(*) OVER w FROM clicks \
  WINDOW w AS (ORDER BY event_time RANGE INTERVAL '1' HOUR PRECEDING)"
\`\`\`

踩坑：①实时特征用处理时间而非事件时间，乱序数据口径错乱；②离线用 T+1 全量快照，训练样本混进 label 时刻之后的信息；③特征上下线无审批，线上服务引用已下线特征直接报错。`,
    keyPoints: ["一份定义编译离在线两侧", "point-in-time join 防穿越", "双跑对账偏差率 <0.1%", "Spark+Flink+Redis 三层"],
    followUps: ["特征穿越有哪些形态？（提示：聚合窗口越界、标签泄漏、时间戳对齐错误三类）", "离在线偏差怎么发现？（提示：同一样本双跑对账，抽样偏差率超 0.1% 告警）", "实时特征为何用 event_time？（提示：处理时间遇乱序/延迟数据会把事件算进错误窗口）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-201",
    nodeId: "ai-mlops",
    question: "MLOps 平台架构？端到端机器学习流水线如何设计？",
    answer: `【分层原理】结论：MLOps 平台 = 把"数据→特征→训练→评估→部署→监控→再训练"串成自动化闭环，核心价值不是工具堆砌而是缩短模型迭代周期。模块拆解：①数据层（版本管理/标注/血缘）；②特征层（特征平台，离在线一致）；③训练层（实验管理/分布式调度/超参搜索）；④交付层（模型注册/CI-CD 门禁/灰度发布）；⑤监控层（漂移检测/效果回流/自动重训触发）。设计三原则：可复现（任何模型能重放训练全程）、可回滚（任何版本 30 秒切回）、闭环自动化（监控信号能驱动再训练）。成熟度路径：手工脚本 → 流程编排（Kubeflow）→ 全闭环（自动重训+自动发布）。

【实际案例】字节推荐模型迭代频率从周级提到日级，核心靠"监控-重训-灰度"全自动闭环，算法工程师人均管理模型数提升 4 倍。反面教材：某传统企业采购全套 Kubeflow 却只用作"训练调度"，监控与回流没建，模型线上跑一年没更新，CTR 衰减 30% 才发现——平台价值在闭环不在安装。Metaflow（Netflix 开源）的"本地开发一键上云"哲学适合中小团队起步。

【举一反三】决策模型迁移：LLMOps 与 MLOps 同构——prompt 版本=代码版本、评测集回归=离线评估、线上 badcase 回流=数据回流。建设节奏：先补最痛一环（通常是实验管理或灰度发布），别一上来全量自研；<20 人团队优先开源拼装而非自研平台。

【扣分点对照】背八股的画一张模块大图；真做过的能讲闭环数据流（监控信号如何触发再训练）、各模块解耦接口（模型注册表作为枢纽）、平台 ROI 怎么度量（迭代周期/人均模型数/事故率），以及多租户资源配额与优先级调度设计。

\`\`\`python
from kfp import dsl
@dsl.pipeline(name="ctr-pipeline")
def pipeline(data_path: str):
    prep = dsl.ContainerOp(name="preprocess", image="spark",
        command=["python", "preprocess.py", "--data", data_path])
    train = dsl.ContainerOp(name="train", image="pytorch",
        command=["python", "train.py", "--input", prep.output])
    dsl.ContainerOp(name="deploy", image="triton-deployer",
        command=["python", "deploy.py", "--model", train.output])
\`\`\`

踩坑：①平台大而全但模块接口私有，换一个环节全链重写；②只管训练不管监控，模型上线即失联；③权限模型后期补，早期全员 root 出事故无法定责。`,
    keyPoints: ["数据到监控全生命周期闭环", "可复现/可回滚/自动化三原则", "注册表作模块解耦枢纽", "先补最痛一环别求全"],
    followUps: ["闭环如何驱动再训练？（提示：漂移告警/效果衰减触发流水线，自动重训评估灰度）", "平台 ROI 怎么度量？（提示：模型迭代周期、人均管理模型数、发布事故率）", "自研还是开源拼装？（提示：<20 人优先 Kubeflow/Metaflow 拼装，超大规模再自研）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-202",
    nodeId: "ai-mlops",
    question: "模型迭代与 A/B 测试？如何科学验证模型效果？",
    answer: `【分层原理】结论：A/B 测试是因果推断的黄金标准，核心纪律是"随机分流 + 事前设定 + 统计显著"。要点四层：①分流——按用户 id 哈希一致性分组（同用户始终同组），先跑 AA 实验检查组间同质性；②样本量——事前算最小可检测效应（MDE）：检测 CTR 1% 相对提升需百万级样本，样本不足宁可不测也别硬下结论；③检验——比率指标用 z/卡方检验，连续指标 t 检验，p<0.05 + 实际显著性（提升是否值得发版）双门槛；④陷阱防护——SRM（样本比例失调：卡方检验实际分流比 vs 设计比，出现即分流有 bug 结论作废）、新奇效应（首 3 天虚高，观察期 ≥7 天）、多重比较（看 20 个指标必有 1 个假阳，需 Bonferroni 校正或预设核心指标）。

【实际案例】字节日均数千个并发 A/B 实验：推荐模型上线标准流程为 1% 灰度跑 7 天，CTR/时长需同时显著（p<0.01 且提升 >0.2%），护栏指标（崩溃率/负反馈率）不破线。真实教训：某实验第 2 天 CTR +3% 提前全量，第 5 天回落到 -0.5%（新奇效应）被迫回滚，此后平台强制最短观察期。另一例：SRM 报警查出某 Android 版本分流 bug，避免错误结论上线。

【举一反三】决策模型迁移：无法随机分流的场景（城市级策略）用双重差分/合成控制；搜索广告用多臂老虎机快速收敛流量（牺牲严格性换速度）；LLM 评测用 pairwise 盲评 + 显著性检验同原理；长期效应用 holdout 组观察留存反转。

【扣分点对照】背八股的说"对照组实验组看 p 值"；真做过的能算 MDE 样本量、解释 SRM 的卡方检验、区分新奇效应与首因效应、讲网络效应场景（社交产品）为什么用户级随机失效要换 cluster 随机，以及 p=0.049 但提升仅 0.01% 该不该上线（统计显著≠业务显著）。

\`\`\`python
from scipy import stats
t, p = stats.ttest_ind(control.click, treatment.click)
sig = p < 0.05 and treatment.click.mean() > control.click.mean()
# SRM 检测：实际分流比 vs 设计比的卡方检验
chi2 = stats.chisquare([n_control, n_treat], f_exp=[N*0.5, N*0.5])
if chi2.pvalue < 0.01: abort("SRM！分流有 bug，结论作废")
\`\`\`

踩坑：①按设备/按天切流导致同用户跨组，污染结论；②偷看数据提前停（peeking problem）假阳率翻倍，需序贯检验；③实验期间埋点口径改动混入，结论全废。`,
    keyPoints: ["随机分流+事前设 MDE", "统计显著+实际显著双门槛", "SRM/新奇效应/多重比较三坑", "观察期 ≥7 天防虚高"],
    followUps: ["SRM 意味着什么？（提示：实际分流比偏离设计比，说明分流机制有 bug，结论作废）", "样本量怎么事前算？（提示：由基线率、MDE、显著性水平与功效反推 n 公式）", "为什么不能中途看数据停实验？（提示：反复偷看使假阳率远超名义 5%，需序贯检验设计）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-288",
    nodeId: "ai-mlops",
    question: "模型灰度发布与快速回滚机制如何设计？线上事故怎么应急？",
    answer: `【分层原理】结论：模型发布的本质是"风险控制下的价值交付"，灰度与回滚是把爆炸半径降到最小的两大保险。设计分层：①灰度策略——按流量阶梯放量（1%→5%→20%→50%→100%），每级设停留期与准出门禁；按用户属性灰度（内部→白名单→普通用户）更早暴露问题；shadow 模式（新模型只打分不生效，离线对比新旧输出 diff 率）做到零风险验证；②自动门禁——每级检查护栏指标（P99 延迟/错误率/崩溃率不破线）与目标指标（CTR/转化不显著劣化），任一触发即自动回滚；③回滚机制——模型与代码解耦（配置中心下发版本号秒级切换）、N-1 版本常驻内存免冷启动、一键与自动双通道。为什么模型必须独立于代码发布：代码发版以小时计，事故止血要以秒计。

【实际案例】美团配送 ETA 模型曾因特征异常导致全城预估偏差 +8 分钟：监控 3 分钟内检测到预测分布 PSI 破阈值，自动切回上一版本，预估抖动控制在 5 分钟内；事后把"特征空值率"加入发布门禁。字节广告灰度框架：新模型先 shadow 跑 24 小时比对输出 diff 率（<2% 才进 1% 流量），一次 checkpoint 损坏事故中 diff 率 40% 被直接拦截，线上零感知。行业共识：配好自动回滚的系统 MTTR 从小时级压到 3-5 分钟。

【举一反三】决策模型迁移：LLM 应用灰度=按租户/prompt 版本灰度，badcase 率做护栏；端侧模型发布用"分批推送 + 端上指标回传 + 远程 kill switch"——端上无法立即回滚，开关比回滚更重要。通用公式：爆炸半径 = 流量占比 × 发现时长，灰度压前者、监控压后者。

【扣分点对照】背八股的说"先小流量再全量，出问题回滚"；真做过的能讲 shadow 与真实灰度的先后关系、秒级切换的实现（配置下发 + 版本常驻内存）、护栏与目标指标分工，以及端侧为什么必须配 kill switch 而非依赖版本回退。

\`\`\`python
def gate_check(stage, m, base):
    guardrail_ok = m.p99 < base.p99 * 1.1 and m.err_rate < 0.001   # 护栏
    target_ok = m.ctr > base.ctr * 0.998                            # 目标
    if not (guardrail_ok and target_ok):
        rollback(prev_version); alert(stage); return "rollback"     # 自动回滚
    return promote_next_stage(stage)                                # 晋级放量
\`\`\`

踩坑：①回滚只切模型不切配套特征/预处理版本，新特征喂旧模型直接报错——版本必须绑定发布；②shadow 流量写入线上日志未脱敏，污染训练数据；③灰度期新旧模型并行，缓存键不带版本号导致结果串台。`,
    keyPoints: ["流量阶梯+属性灰度+shadow 三级", "护栏指标破线自动回滚", "模型与代码解耦秒级切换", "端侧靠 kill switch 而非回滚"],
    followUps: ["shadow 模式的价值？（提示：新模型只打分不生效，零风险对比新旧输出 diff 率）", "秒级回滚怎么实现？（提示：配置中心下发版本号 + 旧版本常驻内存免冷启动）", "端侧模型为何依赖 kill switch？（提示：客户端版本无法即时回退，只能远程关停功能）"],
    favorited: false,
    bigTech: true,
  },
];
