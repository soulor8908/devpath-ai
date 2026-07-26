// lib/presets/ai/questions-nlp.ts
// AI 算法工程师面试题：自然语言处理（4 节点）
// 从 lib/presets/ai.ts 拆分而来，内容保持不变

import type { Question } from "../../types";

export const NLP_QUESTIONS: Question[] = [
  // ===== ai-nlp-fundamentals =====

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
  // ===== 20. ai-nlp-embeddings =====,

  // ===== ai-nlp-embeddings =====

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
  // ===== 21. ai-nlp-sequence =====,

  // ===== ai-nlp-sequence =====

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
  // ===== 22. ai-nlp-generation =====,

  // ===== ai-nlp-generation =====

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
  // ===== 23. ai-rec-fundamentals =====,
];
