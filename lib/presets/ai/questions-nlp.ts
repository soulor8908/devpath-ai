// lib/presets/ai/questions-nlp.ts
// AI 算法工程师面试题：自然语言处理（4 节点 × 8 题 = 32 题）
// 答案按策展级黄金格式重写：分层原理 → 实际案例（含量化数字）→ 举一反三 → 扣分点对照 → 代码 → 踩坑

import type { Question } from "../../types";

export const NLP_QUESTIONS: Question[] = [
  // ===== ai-nlp-fundamentals =====

  {
    id: "ai-119",
    nodeId: "ai-nlp-fundamentals",
    question: "BPE / WordPiece / SentencePiece 分词原理？为何用子词？",
    answer: `【分层原理】结论：三者都是子词切分方案，在词表大小与 OOV 之间取折中。第一层 BPE：从字符/字节出发，迭代合并频率最高的相邻符号对直到词表达标，GPT 系用字节级 BPE 可表示任意 Unicode。第二层 WordPiece：合并准则不是频率而是似然增益——选合并后让训练语料似然提升最大的对，BERT 用它，更倾向合成"真正的词"。第三层 SentencePiece：不是算法而是框架，把输入当原始 Unicode 流（空格编码为 ▁），内置 BPE/Unigram 两种算法，免预分词，对中日韩天然友好，LLaMA/Qwen 采用。为何用子词：词级词表爆炸且 OOV 无解，字级序列过长语义稀疏，子词让罕见词拆成已知片段（unbelievable→un+believe+able），新词与拼写变体都能表示。

【实际案例】百度搜索早年用词级词表，长尾 query 大量 [UNK]，语义召回接近失效；换 SentencePiece+BPE（词表 32k）后可表示率从约 92% 升到 99.9%，语义召回离线 Recall@10 提升约 3 个点。字节多语言场景统一字节级 BPE（词表 128k+），一份 tokenizer 覆盖 100+ 语种，免去逐语种训练。反例：某电商搜索词表仅 8k 且未覆盖型号字符，"iPhone15ProMax" 被拆成无意义碎片导致召回不可用，扩词表+子词回退后才恢复。

【举一反三】粒度折中的决策模型可迁移：①推荐系统 ID 特征哈希——全量 ID 内存爆炸，哈希到固定桶牺牲精度换存储；②语音 ASR 建模单元（音素/字/子词）同款权衡。判断标准：词表越大表示越精确但越稀疏、显存越大，选型看长尾分布与资源约束。

【扣分点对照】背八股的只会说"BPE 合并高频对、解决 OOV"；真做过的能讲出 WordPiece 的似然增益准则、SentencePiece 把空格编码为 ▁ 从而免预分词、以及 vocab_size 对显存（embedding 参数=vocab×hidden）与训练速度的实测影响。

\`\`\`python
from tokenizers import Tokenizer, models, trainers
tok = Tokenizer(models.BPE(unk_token="[UNK]"))
tok.train_from_iterator(texts, trainers.BpeTrainer(vocab_size=32000))
print(tok.encode("unbelievable").tokens)  # ['un','bel','ievable']
# vocab 每加 1 万，embedding 层多 10000×hidden 参数
\`\`\`

踩坑：①通用词表在医疗/法律拆分过碎，序列变长 20%+，需领域语料增量训练；②中文用 BPE 前不要再过结巴分词，双重切分引入对齐误差；③训练语料要含足够代码/数字/URL，否则这些模式被拆成单字符。`,
    keyPoints: ["BPE 按频率合并字节对", "WordPiece 按似然增益合并", "SentencePiece 免预分词", "子词折中词表与 OOV"],
    followUps: ["Unigram LM 与 BPE 有何不同？（提示：Unigram 从全词表做减法按概率剪枝）", "vocab_size 如何影响显存与速度？（提示：embedding 参数=vocab×hidden，softmax 随词表线性涨）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-120",
    nodeId: "ai-nlp-fundamentals",
    question: "Word2Vec 原理？CBOW 与 Skip-gram 区别？负采样作用？",
    answer: `【分层原理】结论：Word2Vec 基于分布式假设——词义由上下文决定，用浅层网络把词映射为低维稠密向量。第一层 CBOW：窗口内上下文词向量平均后预测中心词，一个样本一次更新，快、高频词学得好。第二层 Skip-gram：反过来用中心词预测上下文每个词，每个（中心，上下文）对都是样本，低频词获得更多更新，小语料质量更高，代价是训练慢数倍。第三层负采样：|V| 路 softmax 计算不可行，改成 k+1 个二分类——真实上下文为正、按词频 0.75 次幂采 k 个负样本（压高频抬低频），计算量从 O(V) 降到 O(k)，Levy & Goldberg 证明其等价于隐式分解 PMI 矩阵。

【实际案例】阿里 item2vec 把用户购买序列当"句子"、商品当"词"，skip-gram+负采样学商品 embedding 做 i2i 召回，双 11 场景 i2i 召回点击通过率提升约 8%；腾讯 AI Lab 开源的 800 万中文词向量同样用大规模语料+负采样训练。失败形态：千万级词表上 hierarchical softmax 建树成本高、更新慢，换负采样（k=5~10）后训练吞吐提升一个数量级，效果基本持平——负采样是大规模词向量可行的前提。

【举一反三】负采样思想直接迁移：①推荐双塔的 in-batch negative——batch 内其他样本当负例，是检索标配；②对比学习 InfoNCE 本质也是"一正多负"分类。决策模型：类别空间巨大（词表/商品库/全量 doc）时全量 softmax 不可行，用采样近似+事后纠偏（logQ correction）是通用套路。

【扣分点对照】背八股的只说"CBOW 快、skip-gram 对低频好"；真做过的能讲出负采样为何按 freq^0.75 采样、负采样与 PMI 矩阵分解的等价关系、以及 item2vec 里"句子顺序不敏感要先打乱再训"的实操细节。

\`\`\`python
from gensim.models import Word2Vec
m = Word2Vec(sentences, vector_size=100, window=5, sg=1, negative=5)
# sg=1 skip-gram；negative=5 每个正样本配 5 个负样本
print(m.wv.most_similar("国王", topn=3))  # 国王-男人+女人≈女王
\`\`\`

踩坑：①window 小偏语法、大偏语义，同义词召回建议 window≥5；②min_count 太大会丢弃业务关键长尾词，OOV 率飙升；③静态向量无法消歧，"苹果"水果与数码同向量，上线前必须用业务歧义样本验证。`,
    keyPoints: ["CBOW 上下文预测中心词", "Skip-gram 低频词更优", "负采样降算力等价 PMI 分解", "item2vec 行为序列即句子"],
    followUps: ["负采样为什么按 freq^0.75 采样？（提示：压高频抬低频的经验折中）", "in-batch negative 有何坑？（提示：热门商品被采样概率高需 logQ 纠偏）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-121",
    nodeId: "ai-nlp-fundamentals",
    question: "GloVe 与 FastText 原理？相比 Word2Vec 有何改进？",
    answer: `【分层原理】结论：GloVe 把全局共现统计显式写进目标函数，FastText 把词拆成子词 n-gram 解决 OOV，分别补上 Word2Vec"只用局部窗口"和"词是最小单元"两个短板。第一层 GloVe：构建词-词共现矩阵 X，优化 w_i·w_j+b_i+b_j≈log X_ij，用加权最小二乘让向量内积拟合共现对数——全局统计一次利用，比局部窗口采样更充分。第二层权重函数 f(x)：对超高频共现截断，避免"的/了"主导损失。第三层 FastText：词=字符 n-gram 向量之和，"apple"与"apples"共享子词，OOV 词可拼出向量，形态丰富语言（德语/土耳其语）收益最大；监督版用层次 softmax+线性结构，速度极快。

【实际案例】知乎早期内容打标用 FastText 处理亿级文本，训练 1 秒/百万条、单机 QPS 过万，准确率只比 BERT 低 1~2 个点，是冷启动基线标配；GloVe 在英文类比任务上曾长期优于同规模 Word2Vec，斯坦福 840B 版本多年是英文预训练词向量基准。失败形态：中文场景直接套字符 n-gram 没意义（中文最小单元是字），向量质量反不如 Word2Vec，需改用字+词 n-gram 重新设计——生搬英文配置是中文团队常踩的坑。

【举一反三】"全局统计 vs 局部采样"的权衡到处可见：①推荐物品共现矩阵（i2i）就是 GloVe 思想，离线扫全量行为序列；②图 embedding 的二阶相似度也在显式建模共现。子词思想迁移：商品 ID 太稀疏时用"类目+品牌+属性词"组合表示，本质是特征级 FastText。

【扣分点对照】背八股的会说"GloVe 用共现矩阵、FastText 用子词"；真做过的能讲出 GloVe 加权函数 f(x) 的设计动机、FastText 监督版为什么快（无隐层+层次 softmax）、以及中文 FastText 要用词 n-gram 而非字符 n-gram 的坑。

\`\`\`python
import fasttext
m = fasttext.train_supervised("train.txt", epoch=25, lr=1.0, wordNgrams=2)
# wordNgrams=2 加词 bigram 捕捉语序；bucket 默认 200 万哈希桶
label, prob = m.predict("这家店味道真不错")  # ('__label__pos', 0.97)
\`\`\`

踩坑：①GloVe 共现矩阵内存 O(V²)，百万词表需稀疏存储+分块训练；②FastText 的 bucket 哈希碰撞会轻微掉点，词表大时调大 bucket；③两者都是静态向量，多义词无解，别在歧义重的场景硬用。`,
    keyPoints: ["GloVe 拟合全局共现对数", "加权函数压超高频共现", "FastText 子词求和解 OOV", "中文需词 n-gram 非字符"],
    followUps: ["GloVe 权重函数如何设计？（提示：低频不加权、超高频截断的分段函数）", "FastText 监督版为何这么快？（提示：线性结构无隐层+层次 softmax）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-122",
    nodeId: "ai-nlp-fundamentals",
    question: "词向量如何评估？ analogy / similarity / 下游任务？静态向量局限？",
    answer: `【分层原理】结论：词向量评估分内在（不依赖任务）与外在（下游效果）两层，外在才是上线标准。第一层内在-相似度：词对余弦相似度与人工打分的 Spearman 相关（SimLex-999/MEN/WordSim-353），检验向量空间是否贴合人类语义直觉；SimLex-999 严格区分"相似"与"相关"，比 WordSim 更苛刻。第二层内在-类比：king-man+woman≈queen 的 3CosAdd 准确率，检验向量的线性语义结构。第三层外在：把向量喂给下游（分类/NER/检索召回）看真实指标。静态向量根本局限是一词一向量：多义词所有义项压进同一向量，"苹果"的水果义与公司义互相污染——这正是 ELMo/BERT 上下文向量取而代之的根本原因。

【实际案例】百度搜索词向量升级时，内在评估（自建 query 相似度集相关度 0.72→0.78）只作参考，拍板看下游：query-doc 语义匹配 AUC 提升 1.2 个点、线上人工 MRR 抽检提升 0.8 个点才全量。反例：某团队向量类比准确率很高但下游召回不涨，排查发现类比集全是高频通用词、与业务长尾 query 分布不匹配，白优化一个月——内在指标与业务分布脱节是最隐蔽的浪费。

【举一反三】"内在涨下游不涨"是通用陷阱：①推荐离线 AUC 涨、线上 CTR 不涨，常因训练/服务特征不一致；②LLM 榜单分高不代表业务好用，需自建领域评测集。决策模型：内在指标用于快速迭代筛选（便宜），外在指标用于上线门禁（贵但真实），两层都建、各司其职。

【扣分点对照】背八股的只背"analogy 和 similarity 两种评估"；真做过的能讲出 Spearman 相关的计算、SimLex-999 为何更严格、以及"内在涨下游不涨"时如何定位（评估集分布偏移/向量被少数维度主导/各向异性）。

\`\`\`python
from scipy.stats import spearmanr
sims = [cosine(wv[a], wv[b]) for a, b in pairs]  # 词对余弦
rho, _ = spearmanr(sims, human_scores)           # 与人工分相关
# 类比：argmax cos(x, king - man + woman) == queen
\`\`\`

踩坑：①评估集被训练语料覆盖会虚高，需去重；②余弦相似度受范数影响，先归一化再比较；③领域向量必须在领域评估集上测，通用集结论不可迁移。`,
    keyPoints: ["内在评估作迭代筛选", "外在下游效果是上线门禁", "SimLex-999 区分相似与相关", "静态向量多义词无解"],
    followUps: ["内在涨下游不涨如何定位？（提示：查评估集分布偏移与各向异性）", "上下文向量如何消歧？（提示：同一词在不同语境生成不同向量）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-123",
    nodeId: "ai-nlp-fundamentals",
    question: "中文分词（结巴/HanLP）与预训练分词有何不同？中文 NLP 特殊性？",
    answer: `【分层原理】结论：中文无天然词边界，传统 NLP 必须先分词；分词本质是序列标注——给每字标 B/M/E/S；预训练时代主流转向字级或 SentencePiece，把分词误差从流水线中移除。第一层词典+统计（结巴）：前缀词典匹配最长路径，未登录词用 HMM 兜底，快但依赖词典新鲜度。第二层 CRF（HanLP）：全局建模字标签转移，准确率高但慢。第三层字级 BERT：完全不分词，配合深层上下文建模，效果反超词级——因为分词错误会级联，切错一次实体边界全错。中文特殊性还有：未登录词爆发（网络新词/型号/人名）、组合歧义（"研究生命"=研究生/命 or 研究/生命）、字词粒度信息密度差异。

【实际案例】哈工大讯飞联合实验室的 BERT-wwm 是标志性迭代：原版中文 BERT 用字级，wwm 改为整词 mask——MLM 时把同一词的所有字一起遮盖，让模型显式学词边界，中文任务平均提升 1+ 个点。淘宝搜索面对"连衣裙2024新款小个子"这类无空格长尾 query，用"字+词混合输入"：字粒度保召回鲁棒、商品词库粒度保精确，融合后长尾 query 召回率提升约 5%。失败形态：医疗搜索直接用结巴，"冠状动脉搭桥术"切成"冠状/动脉/搭桥/术"，实体抽取 F1 掉到 0.6 以下，换领域分词器+自定义词典后回到 0.85+。

【举一反三】"先切分再建模 vs 端到端"的争论重演于：①语音 ASR 从音素拼接转向 CTC 端到端；②CV 从手工特征转向 CNN 自动学特征。规律：流水线误差级联，数据足够时端到端胜出；但词典质量极高的垂直领域，显式切分+词典仍是最优。

【扣分点对照】背八股的只说"中文要分词、有歧义"；真做过的能讲出 WWM 为何有效（mask 粒度对齐建模粒度）、分词错误的级联放大效应、搜索"字保召回词保精确"的双路设计，以及新词发现方法（互信息+左右熵）。

\`\`\`python
import jieba
jieba.add_word("冠状动脉搭桥术")          # 领域词入库
print("/".join(jieba.cut("研究生命起源")))  # 研究生/命/起源
# 新词发现：互信息 P(x,y)/(P(x)P(y)) 高 + 左右熵大 → 候选词
\`\`\`

踩坑：①线上词典与离线训练词典不一致会导致特征错位，必须同版本发布；②自定义词典过万拖慢前缀匹配，建议 AC 自动机；③别把分词结果再喂 BERT——它有自己的 tokenizer，双重切分引入对齐误差。`,
    keyPoints: ["分词=字级 B/M/E/S 序列标注", "分词错误会级联放大", "WWM 整词 mask 补词边界", "字保召回词保精确双路"],
    followUps: ["WWM 为什么比字级 mask 好？（提示：mask 粒度对齐建模粒度，迫使学词内依赖）", "新词发现怎么做？（提示：互信息高+左右熵大是候选）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-124",
    nodeId: "ai-nlp-fundamentals",
    question: "子词与 OOV 处理？UNK 词如何应对？",
    answer: `【分层原理】结论：OOV 的本质是"封闭词表对开放语言"的矛盾，解法沿三层升级。第一层 UNK 兜底：损失全部信息，仅作最后防线。第二层子词切分：罕见词拆成已知子词组合（tokenization→token+ization），词表封闭但表示开放，BPE/WordPiece/Unigram 皆属此类。第三层字节/字符级：词表最小（256 字节）理论零 OOV，代价是序列变长 2~3 倍、语义学习负担加重。选型看长尾分布：拼写变体多（搜索 query/社交文本）选子词，多语言混合选字节级，受控领域（工单分类）词级+UNK 也够用。关键认知：子词不是免费午餐——过度拆分让语义碎片化（"糖尿病"拆成"糖尿+病"尚可，拆成"糖+尿+病"语义尽失），词表大小需在覆盖率与序列长度间调优。

【实际案例】百度搜索 query 约 15% 含拼写错误或生僻组合，早年词级模型 UNK 率高导致这部分语义召回接近随机；换 SentencePiece 子词后 UNK 率降到 0.1% 以下，长尾 query Recall@10 提升 4 个点。字节多语言模型用字节级 BPE，泰语/阿拉伯语等无空格语言免预分词，一份 tokenizer 服务 100+ 语种。反例：某医疗 NER 词表未纳入药品通用名，"二甲双胍"整词 [UNK]，药品实体召回从 0.93 崩到 0.71——NER 对 OOV 极敏感，因为实体本身就是最罕见的词。

【举一反三】OOV 思维可迁移：①推荐新商品冷启动——ID 未见过，用属性（类目/品牌/文本）组合表示，本质是"特征子词化"；②风控未见过的设备指纹组合，拆成字段级特征泛化。决策模型：封闭词表遇开放世界，扩词表（贵）、拆细粒度（序列变长）、引外部知识（词典/属性）三选一或组合。

【扣分点对照】背八股的只说"OOV 用 UNK 或子词"；真做过的能讲出三方案成本对比（UNK 信息全失/子词序列变长 10-30%/字节级 2-3 倍）、NER 为何对 OOV 最敏感、字节级 BPE 为何天然支持多语言。

\`\`\`python
vocab = {"今天", "天气"}
print(vocab.get("雨雪", "[UNK]"))      # 词级：信息全失
tok.encode("tokenization").tokens      # ['token','ization'] 子词可拼
# 字节级：零 OOV，但序列长 2~3 倍
\`\`\`

踩坑：①词表训练语料缺数字/URL/代码模式会被拆成单字符，序列爆炸；②子词拆分导致实体边界对齐困难（NER 取首子词标签）；③线上词表版本与模型不一致是高频线上 bug，发版必须原子化。`,
    keyPoints: ["UNK 信息全失仅作兜底", "子词让词表封闭表示开放", "字节级零 OOV 序列变长", "NER 对 OOV 最敏感"],
    followUps: ["词表大小如何调优？（提示：覆盖率与序列长度折中，看长尾分布）", "字节级 BPE 有何优劣？（提示：零 OOV 多语言友好，但序列 2-3 倍长）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-125",
    nodeId: "ai-nlp-fundamentals",
    question: "文本表示发展脉络：One-hot → Word2Vec → ELMo → BERT → LLM？",
    answer: `【分层原理】结论：文本表示五次跃迁，每步解决上一步核心瓶颈。第一层 one-hot：离散符号，维度=词表大小，任意两词距离相等，语义全失。第二层 Word2Vec/GloVe：分布式假设+浅层训练，稠密低维、语义可计算（类比），但一词一向量无法消歧。第三层 ELMo：双向 LSTM 按上下文动态生成向量，首次解决多义词，但 LSTM 长程弱、且只作特征不微调。第四层 BERT：Transformer 自注意力+MLM 预训练，深层双向上下文，pretrain-finetune 范式统一 NLP。第五层 LLM embedding/生成式表示：千亿参数+指令微调，一个模型通吃分类/检索/生成。主线：从符号到分布、从静态到动态、从任务专用到通用。

【实际案例】百度搜索表示升级是行业缩影：2015 年前后 query 表示用 Word2Vec 平均，语义召回只能抓同义词；2019 年切 BERT 双塔后 query-doc 匹配 AUC 提升 3+ 个点，"附近修手机的"能召回"手机维修点"；2023 年后头部公司用 LLM 蒸馏 embedding 替换 BERT 双塔，多语言与长尾意图再进一步。阿里商品表示同样：item2vec→BERT→通义 embedding，每次换代召回 NDCG 提升 2-5 个点。每次升级都伴随全量重建索引与双跑迁移成本。

【举一反三】"表示层升级驱动全链路收益"在 CV 同样成立——SIFT→CNN→ViT→CLIP 每次跃迁重刷下游；推荐的 ID embedding→内容 embedding→多模态 embedding 也是同一脉络。判断何时升级表示层：下游指标长期停滞、badcase 集中在"语义理解错"而非"策略错"时，优先换表示而非调策略。

【扣分点对照】背八股的能背五代名字；真做过的能讲出每代"为什么必须被取代"（one-hot 无语义→静态不消歧→LSTM 长程弱→BERT 非生成式），以及每次升级在业务里的真实收益数字和迁移成本（重训/重建索引/特征穿越）。

\`\`\`python
# 同题对比："苹果多少钱一斤" vs "苹果手机多少钱"
w2v_sim = cosine(wv["苹果"], wv["苹果"])      # 1.0 静态无法区分
o = bert(["苹果多少钱一斤", "苹果手机多少钱"])
ctx_sim = cosine(o[0][:,2], o[1][:,2])         # <0.7 上下文消歧
\`\`\`

踩坑：①直接拿 LLM 最后层当 embedding 效果差，需对比学习专门训；②换表示必须全量重建向量索引，迁移期双跑保稳定；③维度不是越高越好，1024 维的存储与检索成本是 256 维的 4 倍。`,
    keyPoints: ["one-hot 离散无语义", "静态向量一词一向量不消歧", "ELMo 首开上下文表示", "LLM embedding 需对比学习训"],
    followUps: ["何时该升级表示层？（提示：badcase 集中在语义理解错而非策略错时）", "LLM embedding 为何不直接用最后层？（提示：各向异性，需对比学习重塑空间）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-280",
    nodeId: "ai-nlp-fundamentals",
    question: "TF-IDF 与 BM25 原理？为何 BM25 至今仍是搜索强基线？",
    answer: `【分层原理】结论：TF-IDF 用词频×逆文档频率给词加权，BM25 是它的概率化改良，至今是关键词检索不可绕过的基线。第一层 TF-IDF：tf(t,d) 越高词对本文越重要，idf=log(N/df) 越高词越稀有，乘积同时奖励"本篇多"与"全局稀"。第二层 BM25 三大改良：词频饱和（tf/(tf+k1)，出现 10 次不比 5 次重要 2 倍，k1≈1.2~2.0 控饱和速度）、文档长度归一（b≈0.75，长文档天然词频高需惩罚）、idf 用概率检索模型推导的 log((N-df+0.5)/(df+0.5))。第三层为何经久不衰：零训练成本、可解释（每词贡献几分可查）、配倒排索引毫秒返回、精确匹配场景（型号/专名/代码）语义模型反而打不过。弱点明确：词袋无语义，"手机坏了"匹配不到"设备故障"。

【实际案例】Elasticsearch/Lucene 默认评分就是 BM25，支撑知乎、维基及无数企业站内搜索；百度搜索至今仍保留倒排+BM25 作召回主链路之一与向量召回混排——内部数据显示含型号/编号/专名的精确 query，BM25 召回准确率比纯向量高 15%+，而口语化 query 向量更优，两者互补。失败形态：某电商只用向量召回，用户搜"iPhone15 128G 蓝色"，向量把"128G"与"256G"视为近义导致错款率飙升，补回 BM25 属性倒排后错款率下降 70%。

【举一反三】BM25+向量混排就是 RAG 的 hybrid search（稀疏+稠密，RRF 秩融合），2026 年 RAG 系统标准配置；"词频饱和"思想也见于推荐（重复行为边际效用递减的 log 变换）。决策模型：精确匹配强（型号/法条/代码）→BM25 为主；语义泛化强（同义/口语）→向量为主；真实系统两者混排，别二选一。

【扣分点对照】背八股的只背"TF-IDF=词频乘逆文档频率"；真做过的能写出 BM25 完整公式并解释 k1/b、讲清词频饱和与长度归一的动机、知道 Lucene 默认 BM25、能量化"精确 query BM25 胜向量、口语 query 反之"的互补关系及 RRF 混排做法。

\`\`\`python
from rank_bm25 import BM25Okapi
bm25 = BM25Okapi([d.split() for d in docs])  # k1=1.5, b=0.75
scores = bm25.get_scores("手机 维修".split())
# RRF 混排：1/(k+rank_bm25) + 1/(k+rank_vec)
\`\`\`

踩坑：①中文 BM25 必须先分词，分词质量决定上限；②idf 依赖语料分布，文档库大幅更新后要重建索引；③BM25 量纲随库漂移，与向量分数混排必须用 RRF 等秩融合而非分数直接相加。`,
    keyPoints: ["TF-IDF=词频×逆文档频率", "BM25 词频饱和+长度归一", "精确匹配 BM25 胜向量", "稀疏稠密 RRF 混排标配"],
    followUps: ["k1 和 b 如何调？（提示：k1 控饱和速度，b 控长度惩罚，验证集网格搜）", "与向量召回如何融合？（提示：RRF 秩融合避免量纲对齐问题）"],
    favorited: false,
    bigTech: true,
  },
  // ===== ai-nlp-embeddings =====

  {
    id: "ai-126",
    nodeId: "ai-nlp-embeddings",
    question: "BERT 的三种嵌入（Token/Segment/Position）如何拼接？位置编码原理？",
    answer: `【分层原理】结论：BERT 输入=Token+Segment+Position 三种嵌入逐元素相加，再过 LayerNorm+Dropout。第一层 Token Embedding：WordPiece 子词 id 映射 768 维向量，承载词义。第二层 Segment Embedding：仅 2 个 id 区分句子 A/B，问答/匹配任务用它让模型感知"两段角色不同"。第三层 Position Embedding：可学习绝对位置向量（0~511），是自注意力感知顺序的唯一来源——自注意力对输入顺序置换不变，打乱词序输出不变。三者同维相加而非拼接：信息融合且不增维，后续 12 层再解耦。局限：可学习绝对位置长度固定 512，超长只能截断/滑窗；RoPE 用旋转把相对位置编码进内积（attention 只依赖 m-n）支持外推，ALiBi 直接给注意力加线性距离偏置，外推性更好。

【实际案例】百度 ERNIE 在三嵌入基础上加知识实体嵌入（对齐知识图谱），中文任务平均提升 1~2 个点。阿里电商问答把 query 作 A 段、商品标题作 B 段，相比拼成单句准确率提升约 1.5%——Segment 让模型天然学会角色分工。长度局限的血泪史：法律合同动辄 3000 字，早期硬截断 512 导致尾部条款全丢、要素抽取召回腰斩，换滑窗（stride=128）+段落聚合后达标，后来直接换 RoPE 长文本模型（Qwen 系）才根治。

【举一反三】"离散 id→可学习嵌入→多源相加"是通用范式：推荐系统把 user_id/item_id/类目/时间桶各自嵌入后相加，与 BERT 三嵌入同构；CLIP 的 patch embedding+position 也是这套。位置编码选型：固定长度任务用可学习绝对位置，需长度外推（长文档/长对话）用 RoPE/ALiBi。

【扣分点对照】背八股的只说"三种嵌入相加"；真做过的能讲出自注意力为何需要位置编码（置换不变性）、Segment 在单句任务全置 0、512 超长后三种工程解法（截断/滑窗/换长文本模型）、RoPE 外推原理（内积只依赖相对距离 m-n）。

\`\`\`python
class BertEmbeddings(nn.Module):
    def __init__(self, V, H=768, L=512):
        self.word = nn.Embedding(V, H); self.pos = nn.Embedding(L, H)
        self.seg = nn.Embedding(2, H); self.ln = nn.LayerNorm(H)
    def forward(self, ids, seg):
        p = torch.arange(ids.size(1), device=ids.device)
        return self.ln(self.word(ids) + self.pos(p) + self.seg(seg))
\`\`\`

踩坑：①position id 超训练最大长度直接越界报错，上线前必须 assert；②XLM-R 等模型无 Segment 嵌入，照抄 BERT 用法会错；③相加后必须 LayerNorm，否则三种嵌入尺度不一训练不稳。`,
    keyPoints: ["三嵌入同维相加再 LayerNorm", "位置编码救自注意力置换不变", "可学习绝对位置锁死 512", "RoPE/ALiBi 支持长度外推"],
    followUps: ["RoPE 为何能外推？（提示：attention 内积只依赖相对位置 m-n）", "单句任务 Segment 怎么处理？（提示：全置 0，相当于退化为无段信息）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-127",
    nodeId: "ai-nlp-embeddings",
    question: "SBERT 句向量原理？为何 BERT 直接取 CLS 不适合语义相似度？",
    answer: `【分层原理】结论：BERT 预训练目标（MLM+NSP）从不优化句向量空间，直接取 CLS 或 mean pooling 的向量各向异性严重——所有向量挤在窄锥里，任意两句余弦都 0.6+，区分度极差。第一层结构：SBERT 用孪生网络，query/doc 共享同一 BERT encoder 各自编码成向量再算余弦，把交互从 cross-attention 的 O(L²) 降到向量点积，doc 向量可离线预计算。第二层训练：用 NLI/标注句对做分类或回归微调，显式把语义相近句对拉近、相远推远，重塑向量空间。原论文数据：BERT CLS 直接算 STS-B 相关度仅 0.2~0.3，SBERT 微调后到 0.85+，差距悬殊——句向量必须专门训，白拿预训练表示没有出路。

【实际案例】阿里电商搜索早年用 BERT cross-encoder 做 query-商品语义匹配，精度高但逐对推理扛不住大促 QPS；切 SBERT 式双塔后商品向量离线预计算入 FAISS，在线只编码 query+ANN，延迟从 80ms 降到 8ms，代价精度掉约 2 个点——再用 cross-encoder 蒸馏双塔补回大半。知乎用 SBERT 向量做相似问题聚类去重，重复问题识别 F1 0.9+，每天合并数万重复提问。

【举一反三】"表示空间需专门优化"在推荐同样成立——直接拿 LLM 最后层 hidden state 当 item embedding 远不如对比学习专门训的（同款各向异性）。双塔 vs 交叉取舍通用：召回要速度用双塔，精排要精度用交叉，中间靠蒸馏弥合。

【扣分点对照】背八股的只说"BERT 直接算相似度不好，SBERT 用孪生"；真做过的能讲出各向异性成因（高频词主导+MLM 目标致锥形分布）、mean pooling 为何比 CLS 稳、双塔蒸馏 cross-encoder 的细节（soft label 用分数分布而非硬标签）。

\`\`\`python
from sentence_transformers import SentenceTransformer
m = SentenceTransformer("BAAI/bge-base-zh-v1.5")
e = m.encode(["我爱编程", "编程使我快乐", "今天下雨"], normalize_embeddings=True)
print(e @ e.T)  # 相似两句 ~0.85，无关 <0.4，对比度清晰
\`\`\`

踩坑：①BGE/E5 要求 query 侧加指令前缀，漏加掉 1~2 个点；②通用句向量在垂直领域区分度差，必须业务句对微调；③白化（BERT-flow）能后验救各向异性，但不如重训彻底。`,
    keyPoints: ["CLS/mean 向量各向异性", "孪生共享 encoder 降算力", "NLI 微调重塑向量空间", "双塔可离线预计算"],
    followUps: ["各向异性如何度量？（提示：随机句对平均余弦越接近 0 越各向同性）", "双塔如何用交叉模型蒸馏？（提示：精排分数分布作 soft label 训双塔）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-128",
    nodeId: "ai-nlp-embeddings",
    question: "SimCSE 对比学习原理？无监督和有监督版本区别？",
    answer: `【分层原理】结论：SimCSE 把对比学习引入句向量训练，核心思想极简——同一句话应与自己相似、与他人不相似。第一层无监督版：同一句过两次 BERT，仅 dropout 随机性不同得到两个"视角"互为正例，batch 内其余句向量作负例；dropout 充当最轻量的数据增强。第二层有监督版：用 NLI 数据集，蕴含句对为正例、矛盾句对为困难负例（字面重合高但语义相反），监督信号更强。第三层 InfoNCE 损失：-log exp(s(z,z+)/τ)/Σ exp(s(z,zi)/τ)，温度 τ 控制分布锐度，τ 小则聚焦难分负例。有效性的理论解释：对比目标同时优化 alignment（正例贴近）与 uniformity（空间均匀），直接治愈 BERT 句向量的各向异性。

【实际案例】SimCSE 无监督版把 BERT-base 在 STS-B 的 Spearman 相关从白化版的 0.68 拉到 0.75+，有监督版 0.81+，单卡数小时可训，成为中小团队句向量起点。字节搜索在 SimCSE 上加业务难负例（点击未购 query-doc 对、同 session 未点击 doc），垂类语义相关度人工评测提升 3 个点。失败形态：batch size 太小（<64）负例不足，模型学会"记 batch"而非语义空间，离线评测虚高上线即崩——InfoNCE 性能与负例数强相关。

【举一反三】"dropout 即增强"可迁移到所有构造正对难的场景：①CV 的 SimCLR 用裁剪/色变换视角；②文本回译/删词也能造正对但都不如 dropout 便宜；③推荐双塔 in-batch negative 是同款 InfoNCE。难负例挖掘通用套路：用当前模型召回 top-K 近似但标签不同的样本，难负例质量决定上限。

【扣分点对照】背八股的只说"SimCSE 用 dropout 造正对"；真做过的能写出 InfoNCE 公式并解释 τ、讲清 alignment 与 uniformity 两性质、说出 batch size 与负例数关系，以及 NLI 矛盾句为何是天然难负例。

\`\`\`python
z1 = bert(sent, dropout=0.1); z2 = bert(sent, dropout=0.1)  # 两次 dropout
sim = (z1 @ z2.T) / 0.05           # τ=0.05，对角为正例
loss = F.cross_entropy(sim, torch.arange(len(sent)))  # InfoNCE
\`\`\`

踩坑：①dropout 率过高（>0.2）破坏语义，正对差异太大；②τ 是敏感超参，偏离 0.05 一个数量级效果显著恶化；③训练语料混入重复句（日志数据常见）会让真负例变假负例，必须去重。`,
    keyPoints: ["dropout 即最轻量数据增强", "InfoNCE 拉正推负", "NLI 矛盾句是天然难负例", "负例数决定性能下限"],
    followUps: ["温度 τ 起什么作用？（提示：τ 小分布锐，聚焦难分负例）", "难负例如何挖掘？（提示：当前模型召回 top-K 中标签为负者）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-129",
    nodeId: "ai-nlp-embeddings",
    question: "向量数据库（FAISS/Milvus）原理？ANN 近似最近邻如何加速检索？",
    answer: `【分层原理】结论：亿级向量精确最近邻是 O(N·d) 暴力扫描，不可行；ANN 用"近似换速度"，三条技术路线。第一层 IVF（倒排索引）：全库 k-means 聚成 nlist 个桶，查询只搜最近 nprobe 个桶，扫描量降到 N/nlist×nprobe。第二层 PQ（乘积量化）：d 维向量切 m 段各自 k-means 出 256 码字，向量压成 m 字节，内存降一个数量级，距离查表近似。第三层 HNSW（分层图）：多层近邻图，顶层稀疏快速定位、底层稠密精确搜索，类似跳表，召回最高但内存开销大。组合策略：IVF 控扫描范围+PQ 控内存（IndexIVFPQ），召回 95%+ 时延迟毫秒级。选型：百万级 HNSW，亿级 IVFPQ，十亿级 IVF+PQ+分片。

【实际案例】抖音视频召回用 Milvus（HNSW）承载百亿级视频向量，p99 延迟控在 20ms 内支撑数万 QPS；淘宝商品检索用 IVFPQ 变体，8 亿商品向量单机内存从 3TB 压到 200GB（PQ m=32），召回率 97% 换全库单机部署。失败形态：某团队在 5 亿向量上用 HNSW，图索引内存膨胀到向量本身的 1.5 倍直接 OOM；换 IVFPQ 内存降 10 倍但召回从 99% 掉到 95%，调大 nprobe 找回 1.5 个点，最终接受 96.5% 的折中——召回率与成本永远在做交易。

【举一反三】"近似换规模"是工程通用思维：①数据库 LSM 用读写放大换写入吞吐；②HyperLogLog 近似去重计数；③LLM 推理 KV cache 量化压缩。决策模型：先定业务容错线（召回≥95%），再选近似方案把成本压到线下。

【扣分点对照】背八股的只列"IVF/PQ/HNSW 三个名词"；真做过的能画出 nlist/nprobe 的召回-延迟权衡曲线、说清 PQ 的 m/nbits 如何影响精度与内存（内存=m 字节/向量）、HNSW 的 M 与 efSearch 含义，以及向量更新后 IVF 为何要重建索引（聚类中心漂移）。

\`\`\`python
import faiss
quant = faiss.IndexFlatIP(d)
index = faiss.IndexIVFPQ(quant, d, 4096, 16, 8)  # 4096桶 m=16 8bit
index.train(xb); index.add(xb)
index.nprobe = 32        # 扫 32/4096 桶，召回~96%
D, I = index.search(q, 10)
\`\`\`

踩坑：①用内积必须先 L2 归一化再建 IP 索引，否则与欧氏逻辑混乱；②训练样本需 ≥39×nlist 否则聚类质量差；③图索引删向量代价高，高更新场景选 IVF 或定期全量重建。`,
    keyPoints: ["IVF 聚类控扫描范围", "PQ 分段量化压内存", "HNSW 分层图召回最高", "nprobe 调召回-延迟权衡"],
    followUps: ["PQ 的 m 和 nbits 如何选？（提示：内存=m 字节/向量，m 大段多精度高但表大）", "HNSW 的 M 与 efSearch 含义？（提示：M 控图度数即内存，efSearch 控搜索宽度即召回）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-130",
    nodeId: "ai-nlp-embeddings",
    question: "语义检索工业应用：召回-粗排-精排漏斗如何设计？",
    answer: `【分层原理】结论：漏斗架构是"算力预算×精度"的帕累托最优。第一层召回：双塔+ANN，毫秒级从亿级库取千级候选，重覆盖——召回漏掉的好结果精排救不回。第二层粗排：轻量交叉或双塔打分，百级，承上启下。第三层精排：BERT/LLM 交叉注意力逐对深度交互，十级透出，重排序。为什么必须分层：cross-encoder 逐对交互精度最高，但亿级库上 O(N) 次完整推理算力不可行；双塔把 doc 侧离线预计算，在线复杂度降到一次 query 编码+一次 ANN，但缺 token 级交互精度天花板低。分层让每级只做"自己算力负担得起的最优模型"。级间一致性要求：召回重 Recall@K，精排重 NDCG/人工满意度，指标不可混用。

【实际案例】百度搜索语义链路：倒排+双塔向量+改写扩展多路召回合并去重约 5000 条，粗排轻量双塔截到 300，精排 ERNIE 交叉模型逐对算相关度透出 10 条，语义满意率提升 5+ 个点且成本可控。失败形态：召回双塔未用精排蒸馏，"精排眼中的好结果根本没被召回"，线上优化精排半年无收益——后用精排分数蒸馏召回模型，Recall@1000 提升 8 个点，精排优化才重新生效。级间一致性比单级精度更重要。

【举一反三】漏斗模式跨域通用：①推荐召回-粗排-精排-重排同构；②RAG 的向量召回+rerank 就是两级漏斗；③广告投放也有召回-粗排-精排-pacing。共性决策：每级候选量按"下一级算力/单条成本"反推，级间用蒸馏保一致性，用逐级漏斗转化率定位瓶颈。

【扣分点对照】背八股的只背"召回粗排精排三层"；真做过的能讲出双塔为何精度低（无 token 交互）却必须用（doc 离线预计算）、级间蒸馏的具体做法（精排打分作 soft label）、以及用漏斗转化率定位瓶颈级（召回 Recall 低先补召回，别死磕精排）。

\`\`\`python
q = query_tower("附近修手机的")              # 在线 1 次编码
cand = faiss_index.search(q, 1000)           # 召回千级
rough = light_ranker.score(q, cand)[:100]    # 粗排百级
final = cross_encoder.rank([("附近修手机的", d) for d in rough])[:10]
\`\`\`

踩坑：①多路召回去重不彻底浪费粗排算力；②向量索引与精排模型版本不一致（特征穿越）导致分数错位；③精排 100 条 cross-encoder p99 要控 50ms 内，需蒸馏/量化。`,
    keyPoints: ["召回重覆盖精排重排序", "双塔离线预计算换速度", "级间蒸馏保一致性", "漏斗转化率定位瓶颈"],
    followUps: ["如何定位瓶颈在哪一级？（提示：看逐级转化率，召回 Recall 低先补召回）", "双塔与精排如何蒸馏？（提示：精排分数分布作 soft label 训双塔）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-131",
    nodeId: "ai-nlp-embeddings",
    question: "ELMo 原理？为何说它是上下文向量的里程碑？",
    answer: `【分层原理】结论：ELMo 是上下文词向量的开山之作——词的表示不再是固定查表，而是双向 LSTM 各层隐状态的可学习加权和，随上下文动态变化。第一层结构：前向 LSTM 从左到右、后向从右到左，双向语言模型预训练。第二层表示：对下游任务取字符 CNN 层+两层双向 LSTM 共三组表示，用任务特定权重 γ·Σ s_j·h_j 加权融合——低层偏句法、高层偏语义，不同任务自动学侧重。第三层用法：ELMo 是"特征提取器"而非微调范式，向量算好冻住喂下游模型。里程碑意义：首次让"苹果"在水果与公司语境下有不同向量，多义词问题被正式解决，NLP 从静态嵌入迈入预训练时代，直接铺平 BERT 的路。局限同样明显：LSTM 长程依赖弱于自注意力，双向只是浅层拼接非深度融合，特征式用法没释放预训练全部潜力。

【实际案例】ELMo 2018 年发布当年在 SQuAD 问答上把单模型 F1 提升约 4.5 个点，SNLI、SRL 同步刷新 SOTA；阿里早期搜索语义匹配与美团 NER 都曾拼接 ELMo 特征，相比 Word2Vec 基线提升 2~3 个点。但仅一年后 BERT 出现，同样任务再提 5~10 个点，ELMo 迅速退场——这个"一年即被取代"的速度本身就是预训练时代加速度的最好注脚。

【举一反三】"多层表示加权融合"延续至今：①BERT 时代研究发现取后四层平均常优于只取末层；②LLM probing 实验同样显示不同层编码不同抽象级别。"特征式 vs 微调式"之争在多模态重演——CLIP 当特征提取器 vs 端到端微调，规律相同：数据够就微调，数据少冻主干。

【扣分点对照】背八股的只说"ELMo 是双向 LSTM 能消歧"；真做过的能讲出它为何很快输给 BERT（LSTM 容量+浅层双向拼接+特征式用法三重局限）、加权系数 s_j 任务可学习、"低层句法高层语义"的层间分工，并把 ELMo 放进范式演进完整叙事。

\`\`\`python
# ELMo 加权融合（伪代码）
h = [char_cnn(x), lstm1(x), lstm2(x)]   # 三层表示
elmo_vec = gamma * sum(s[j] * h[j])      # s 为任务可学习权重
# 下游：elmo_vec 冻住拼到任务模型输入
\`\`\`

踩坑：①ELMo 向量维度高（1024×3），下游拼接注意显存；②字符 CNN 对中文需改字级输入；③不要再用 ELMo 做新项目——了解它只为理解范式演进。`,
    keyPoints: ["双向 LSTM 语言模型预训练", "多层隐状态可学习加权", "低层句法高层语义分工", "特征式用法被 BERT 微调取代"],
    followUps: ["ELMo 为何输给 BERT？（提示：LSTM 容量+浅层拼接+特征式三重局限）", "层间分工有何实证？（提示：probing 显示低层句法高层语义）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-132",
    nodeId: "ai-nlp-embeddings",
    question: "句向量聚合方法 CLS / Mean / Max pooling 对比？如何选？",
    answer: `【分层原理】结论：三种 pooling 把变长 token 序列压成定长向量，本质是不同先验假设。第一层 CLS：假设 [CLS] 在预训练时已聚合全句信息直接取首位；问题是 MLM 目标下 CLS 只被 NSP 弱监督，未对齐相似度任务时质量差、各向异性重。第二层 Mean：所有 token 向量按 attention mask 加权平均，假设每词都贡献语义，最平滑稳定、对长文本鲁棒，SBERT 论文消融证明其在 STS 任务系统优于 CLS。第三层 Max：逐维取最大值，假设关键语义由少数强激活维度承载，对关键词敏感适合短文本/情感词主导场景，但对噪声 token 敏感。选型：句向量默认 Mean（BGE/E5/SBERT 全如此）；专门训过 [CLS] 对齐目标才用 CLS；Max 只在短文本且词重要性差异大时考虑。工程关键：Mean 必须用 attention mask 屏蔽 padding，否则短句向量被稀释。

【实际案例】Sentence-Transformers 全库默认 Mean pooling 不是随意选择，而是 SBERT 论文在多数据集上的消融结论；BGE 训练时对比 Mean 与 CLS，前者在 C-MTEB 检索任务高约 1 个点，全系列采用 Mean。反例：某团队做专利相似度用 CLS pooling 且未微调，相似度挤在 0.7~0.9 无法区分，换 Mean+领域微调后分布拉开，检索 P@10 从 0.52 升到 0.78。另一高频事故：线上 Mean pooling 忘传 attention mask，padding 位置向量参与平均，batch 内最长句决定其他句质量，指标诡异波动。

【举一反三】"变长序列聚合成定长向量"在多模态同样存在：①视频理解对帧特征做 temporal pooling 常用 attention pooling；②推荐用户行为序列聚合，DIN 用 target-attention 加权——本质是按目标动态 pooling；③图神经网络 readout 函数（sum/mean/max）同款权衡。决策：元素重要性均匀→mean，少数主导→max/attention，有专门聚合 token→CLS。

【扣分点对照】背八股的只罗列三种 pooling 名称；真做过的能讲出 CLS 各向异性原因（NSP 监督弱）、Mean 必须 mask padding 的工程细节、SBERT 消融结论，以及何时该上 attention pooling（行为序列等重要性差异大场景）。

\`\`\`python
def mean_pool(hidden, mask):
    m = mask.unsqueeze(-1).float()          # (B,L,1)
    return (hidden * m).sum(1) / m.sum(1).clamp(min=1e-9)
def cls_pool(hidden):  return hidden[:, 0]  # 未对齐训练时慎用
def max_pool(hidden, mask):
    return hidden.masked_fill(~mask.bool()[...,None], -1e9).max(1).values
\`\`\`

踩坑：①mask 忘传是 Mean pooling 最高频线上 bug；②向量入库前统一 L2 归一化，否则模长干扰余弦；③不同 pooling 训出的模型向量不可混用，重建索引成本极高。`,
    keyPoints: ["Mean 最稳定为默认选择", "CLS 需专门对齐训练", "Max 适合关键词主导短文本", "Mean 必须 mask padding"],
    followUps: ["为何 CLS 未训练时效果差？（提示：NSP 弱监督+各向异性）", "何时用 attention pooling？（提示：元素重要性差异大如行为序列）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-281",
    nodeId: "ai-nlp-embeddings",
    question: "工业级 embedding 模型（BGE/E5/GTE）训练 pipeline？指令微调与困难负样本挖掘？",
    answer: `【分层原理】结论：现代句向量模型已不是 SimCSE 时代的单阶段对比学习，而是三段式 pipeline。第一段弱监督预训练：用海量无标弱相关对（标题-正文、query-click、问答对）做对比学习，让模型见够分布。第二段监督微调：人工标注高质量对（NLI/检索标注）+指令微调——同一 query 不同任务给不同前缀（如"为这个句子生成表示用于检索相关文章"），一个模型适配检索/聚类/分类多任务。第三段难负例精修：挖掘"向量相近但标签不同"的困难负样本（检索 top-100 里的非答案），InfoNCE 中难负例贡献主要梯度（简单负例 loss≈0 无梯度）。工程细节：query 与 passage 用不同前缀、in-batch negative 与难负例混合、τ 与学习率随阶段退火。BGE 在 C-MTEB 的榜首成绩与这套 pipeline 强相关——架构就是 BERT，赢的是数据工程。

【实际案例】智源 BGE 用 1 亿级弱监督对预训练+千万级监督微调+难负例挖掘，中文检索 ndcg@10 比通用 SimCSE 高 8+ 个点。阿里电商向量召回同款思路：query-点击商品弱监督预训练→人工相关度标注微调→"点击未购买"当难负例，长尾 query 语义召回转化率提升 4.2%。失败形态：某团队只加数据量不加难负例，模型对"苹果手机"vs"苹果价格"这类表面相似语义不同的 query 完全无区分力，补难负例挖掘后该类 badcase 下降 60%。

【举一反三】三段式（弱监督打底→监督对齐→难例精修）是表示学习通用范式：①人脸识别从 WebFace 弱标注到精细比对；②推荐双塔用点击弱监督+精排蒸馏；③LLM 的 pretrain→SFT→RLHF 是同哲学的生成版。难负例挖掘通用套路：当前模型找"最像正例的负例"，模型与挖掘迭代共进。

【扣分点对照】背八股的还停在"对比学习训句向量"；真做过的能画出三段式 pipeline、讲出指令前缀如何让单模型适配多任务、难负例为何贡献主要梯度、以及"点击未购买"这类业务难负例的设计直觉。

\`\`\`python
# BGE 用法：query 加指令前缀，passage 不加
q = "为这个句子生成表示以用于检索相关文章：" + query
# 训练：InfoNCE，正例 + in-batch 负例 + top-100 难负例
loss = infoNCE(q_emb, pos_emb, neg_inbatch + neg_hard, tau=0.02)
\`\`\`

踩坑：①指令前缀训练推理必须一致，漏加前缀 C-MTEB 掉 1~2 点；②难负例比例要控（难:in-batch≤1:1），过多噪声假负例反噬；③弱监督数据要去噪（点击≠相关），否则预训练天花板低。`,
    keyPoints: ["三段式：弱监督→监督→难负例", "指令前缀单模型适配多任务", "难负例贡献主要梯度", "点击未购买是天然难负例"],
    followUps: ["难负例如何挖掘？（提示：当前模型检索 top-K 中标签为负者，迭代更新）", "BGE 与 E5 前缀差异？（提示：E5 用 query:/passage:，BGE 中文用自然语言指令）"],
    favorited: false,
    bigTech: true,
  },
  // ===== ai-nlp-sequence =====

  {
    id: "ai-133",
    nodeId: "ai-nlp-sequence",
    question: "NER 命名实体识别原理？BIO/BIOES 标注体系？",
    answer: `【分层原理】结论：NER 把"找实体"转化为序列标注——给每个 token 打标签，模型学 token→标签映射，主流是 BERT 编码+线性头（+CRF）。第一层 BIO：B-X 实体首 token、I-X 实体内部、O 非实体，"马云创立阿里巴巴"标为 B-PER I-PER O B-ORG I-ORG I-ORG I-ORG。第二层 BIOES：增加 E（实体尾）与 S（单 token 实体），边界信息更显式，标签数翻倍换边界准确率，中文常用。第三层解码：线性头逐 token 独立 softmax 可能产出非法序列（B 后无 I），CRF 层建模标签转移约束保证合法。评估用 entity-level F1（边界+类型全对才算对）。局限：BIO 类处理不了嵌套实体（"北京市海淀区"中两个地名），需 span 枚举或指针网络。

【实际案例】百度搜索 query 理解的 NER 抽取"品牌/品类/地点"实体供召回改写，早期 CRF+词典 F1 约 0.82，换 BERT+CRF 后到 0.91，query 改写准确率提升带动长尾 query 召回率涨 3 个点。阿里达摩院医疗 NER 在 CMeEE 数据集上字级 BERT+BIOES 方案 F1 约 0.87，支撑电子病历结构化落地医院系统。失败形态：某团队标注规范不统一（"北京大学"有时标 ORG 有时拆 B-LOC+ORG），模型学到矛盾信号 F1 卡在 0.75——标注一致性比模型选型更重要，重标后同模型 F1 升到 0.88。

【举一反三】序列标注范式覆盖一大类任务：①分词就是 B/M/E/S 标注；②槽位填充（订机票的出发地/目的地）与 NER 同构；③事件抽取的论元识别也按角色做 span 标注。嵌套实体是共同难点，指针网络（首尾指针）与 span 枚举（O(n²) 子串分类）是两条通用解法。

【扣分点对照】背八股的只背"BIO 三种标签"；真做过的能讲出 BIOES 相对 BIO 的收益与代价、为何需要 CRF 兜底非法转移、entity-level F1 怎么算（边界+类型 exact match）、嵌套实体两种解法，以及标注规范一致性对 F1 的量级影响（±0.1）。

\`\`\`python
from transformers import AutoModelForTokenClassification
m = AutoModelForTokenClassification.from_pretrained("bert-base-chinese", num_labels=9)
logits = m(input_ids, attention_mask=mask).logits  # (B,L,9)
pred = logits.argmax(-1)   # 字级 BIOES 标签序列
\`\`\`

踩坑：①中文必须字级标注，词级标注依赖分词质量会级联错误；②子词模型要决定标签挂首子词还是全子词，训练推理必须一致；③线下 F1 高线上差，常因训练语料与线上 query 领域漂移，需线上回流数据持续迭代。`,
    keyPoints: ["NER=序列标注 token→标签", "BIOES 边界更显式", "CRF 兜底非法转移", "嵌套实体需 span/指针"],
    followUps: ["嵌套实体如何处理？（提示：span 枚举或首尾指针网络）", "标注一致性为何比模型重要？（提示：矛盾标注让 F1 卡 0.75，重标后 0.88）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-134",
    nodeId: "ai-nlp-sequence",
    question: "CRF 条件随机场在序列标注的作用？为何比 softmax 好？",
    answer: `【分层原理】结论：softmax 逐 token 独立决策忽略标签间结构约束，CRF 把整个标签序列当作一个随机变量建模，全局归一化选最优路径。第一层问题：独立 softmax 会产出 B-PER→I-ORG 这类非法转移，且贪心解码局部最优累积——每步选最高，全局可能更差。第二层 CRF 原理：线性链 CRF 学转移矩阵 T（T[y_{i-1},y_i] 表标签转移分数）+发射分数（BERT 输出的逐 token logits），序列总分=Σ发射+Σ转移；训练用前向算法算全局归一化项（partition function），推理由 Viterbi 解码最优路径。第三层收益本质：CRF 把"标签合法性"与"长程一致性"显式编码进目标，即使某位置发射分数模糊，转移约束也能纠偏（B-ORG 后模型犹豫时，I-ORG 的高转移分把它拉回）。BERT 足够强后 CRF 边际收益收窄到 1~2 点 F1，但标注少、边界模糊的场景仍显著。

【实际案例】法律 NER（罪名/法条/当事人）实体长且边界模糊，阿里达摩院实验显示 BERT+CRF 比纯 BERT 在 CAIL 数据集 F1 高 1.8 个点，非法序列率从 3.2% 降到 0.1%；医疗病历 NER 中"胸闷气短三天"这类症状边界常歧义，CRF 转移约束让边界准确率明显提升。工程账：CRF 训练慢 20~30%（前向算法 O(L·T²)），解码同样变慢；百度搜索高并发链路最终用 BERT+softmax+后处理规则（非法序列修复）替代 CRF，用 0.5 个点 F1 换 3 倍吞吐——精度与算力的交易要算清。

【举一反三】"局部预测+全局约束"是结构化预测通用模式：①语音 ASR 的 CTC 是帧级发射+序列级约束；②图像分割用 CRF 后处理平滑边界（DeepLab 早期）；③beam search 也是全局视角替代贪心。决策：输出空间有强结构约束时显式全局建模优于纯局部分类；约束可被大数据隐式学到时全局层可省。

【扣分点对照】背八股的只说"CRF 能约束标签转移"；真做过的能写出序列总分公式（发射+转移）、讲清全局归一化为何要前向算法、知道 Viterbi 解码、能量化 CRF 在自己数据上的收益与推理成本，以及何时该省掉 CRF（数据大/实体短/QPS 敏感）。

\`\`\`python
from torchcrf import CRF
crf = CRF(9, batch_first=True)
emissions = bert(input_ids).last_hidden_state @ W  # (B,L,9)
loss = -crf(emissions, tags, mask=mask, reduction='mean')  # 全局归一化
best = crf.decode(emissions, mask=mask)  # Viterbi 最优路径
\`\`\`

踩坑：①转移矩阵初始化屏蔽非法转移（置 -1e4）收敛更快；②mask 必须正确屏蔽 padding，否则 partition function 算错；③torchcrf 的 emission 是未归一化分数，别提前 softmax。`,
    keyPoints: ["CRF 全局建模标签序列", "总分=发射+转移", "前向算法归一化 Viterbi 解码", "高 QPS 场景可用规则替代"],
    followUps: ["CRF 与 HMM 区别？（提示：CRF 判别式建模 P(y|x)，HMM 生成式）", "何时可省 CRF？（提示：数据大/实体短/QPS 敏感时 BERT 已隐式学到约束）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-135",
    nodeId: "ai-nlp-sequence",
    question: "BERT 如何微调序列标注任务？输入输出如何设计？",
    answer: `【分层原理】结论：BERT 微调序列标注的标准做法——token 序列过 BERT 取最后一层隐状态，每个位置接共享线性分类头预测标签，损失用交叉熵（或+CRF）。第一层输入设计：句子转子词，首尾加 [CLS]/[SEP]，padding 到统一长度。第二层子词对齐是关键难点：一个词拆成多个子词（"playing"→play+##ing），标注策略两种——只在首子词挂标签、其余填 -100（忽略 loss），或所有子词共享标签；前者更标准，评估也只算首子词。第三层超参：学习率 2e-5~5e-5 远小于从头训练（预训练权重不能大步破坏），epoch 2~4，warmup 10%；进阶用分层学习率（bert 层 2e-5、新增任务头 2e-4）。第四层长文本：超 512 需滑窗（stride 重叠防实体被切断）或换长文本模型。

【实际案例】腾讯微信输入法的 NER（人名/地址识别供快捷填充）用 BERT 微调+首子词标注，F1 0.93，蒸馏到 6 层后手机端实时推理。阿里商品属性抽取（"红色 XL 码 连衣裙"→颜色/尺码/品类）用淘系语料继续预训练的 BERT 再微调，比通用 BERT F1 高 2.5 个点。失败形态：某团队学习率照抄 CV 经验设 1e-3，微调后比不微调还差——大步长把预训练知识冲没了（灾难性遗忘），降到 2e-5 后正常；另一常见错是所有子词挂标签但评估没对齐，线下 F1 虚高 3 个点，上线原形毕露。

【举一反三】预训练+微调的工程范式直接迁移：①CV 里 ImageNet 预训练+检测头微调；②多模态 CLIP 冻结主干+训 adapter。共同规律：预训练主干用小学习率、新增任务头可大 10 倍，数据越少学习率越小、epoch 越少（防过拟合）。

【扣分点对照】背八股的只说"BERT 后面接个分类头"；真做过的能讲出首子词标注策略与 -100 忽略机制、学习率为何必须 2e-5 量级（防灾难性遗忘）、滑窗重叠为何防实体切断，以及分层学习率设置（主干 2e-5、任务头 2e-4）。

\`\`\`python
class BertNER(nn.Module):
    def __init__(self, bert, n_tags):
        self.bert, self.head = bert, nn.Linear(768, n_tags)
    def forward(self, ids, mask):
        h = self.bert(ids, attention_mask=mask).last_hidden_state
        return self.head(h)            # (B,L,n_tags)
# labels 中非首子词位置填 -100，CrossEntropy 自动忽略
\`\`\`

踩坑：①tokenizer 的 offset_mapping 是子词对齐的救命稻草，务必保存；②batch 内按最长 padding 浪费算力，按长度分桶可提速 2 倍；③评估必须在词级/实体级做，token 级 F1 虚高。`,
    keyPoints: ["末层隐状态+线性分类头", "首子词挂标签其余 -100", "学习率 2e-5 防灾难性遗忘", "长文本滑窗重叠防切断"],
    followUps: ["分层学习率怎么设？（提示：预训练主干 2e-5、新增任务头 2e-4）", "长文本滑窗为何要重叠？（提示：防止实体恰好被窗口边界切断）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-136",
    nodeId: "ai-nlp-sequence",
    question: "文本分类：BERT vs FastText vs TextCNN 选型？",
    answer: `【分层原理】结论：三者是"速度-精度"光谱上的三个点。第一层 FastText：词/n-gram 向量平均+线性分类，无隐层，训练秒级、推理微秒级，亿级语料单机可训，精度是"够用"线。第二层 TextCNN：多尺寸卷积核（3/4/5-gram）+max pooling 提局部关键特征，参数少，短文本（<50 字）上接近 BERT，长文本无力。第三层 BERT：全连接自注意力建模长程依赖，精度上限最高，但推理慢 2~3 个数量级，高 QPS 必须蒸馏（TinyBERT）或量化。选型决策树：QPS>10 万或延迟<1ms→FastText；短文本+中等精度→TextCNN；精度敏感+可承受 10ms 级延迟→BERT 蒸馏版；冷启动无标注→先 FastText+规则上线收数据再迭代。类别不平衡时三者都要配 focal loss 或重采样。

【实际案例】淘宝商品类目预测（万级类目、亿级商品）第一层用 FastText 粗分百级类目（延迟<0.5ms），第二层类目内 BERT 细分，混合架构整体准确率 96%+。美团外卖评价情感分析：早期 TextCNN（F1 0.89）跑全量历史评价，BERT 蒸馏版上线后 F1 0.93 且 QPS 3 万可用；垃圾评论过滤因对抗性强（变体多）一直用 FastText+n-gram 大词表硬扛，靠词表日更维持召回。失败形态：某团队给 20 字以内的 query 意图分类硬上 BERT，效果与 TextCNN 持平但成本 10 倍——短文本没有长程依赖可学，复杂度全浪费。

【举一反三】"简单模型打底、复杂模型攻坚"的混合架构通用：①推荐召回双塔（快）精排交叉（准）；②搜索 query 理解用词典+规则处理头部、模型处理长尾。判断模型是否过度复杂：消融掉复杂结构看指标掉不掉——TextCNN 能追平 BERT 的短文本任务，说明任务本身不需要全局交互。

【扣分点对照】背八股的只背"BERT 准、FastText 快"；真做过的能给出量化对比（FastText 微秒级/BERT 10ms 级）、讲出混合分层架构（FastText 粗分+BERT 细分）、知道 BERT 上线必须蒸馏量化（4 层蒸馏+INT8 延迟压到 3ms）、以及短文本不必上 BERT 的判断依据。

\`\`\`python
import fasttext
m = fasttext.train_supervised("train.txt", epoch=25, lr=1.0, wordNgrams=2)
m.predict("这家店味道怎么样")       # 微秒级
# BERT 版：蒸馏 4 层 + INT8 量化，精度掉<1%，延迟 10x 下降
\`\`\`

踩坑：①FastText 词表与线上分词器必须同版本，否则特征错位；②类别极不平衡（1:1000）先欠采样+focal loss，否则全预测多数类；③类目体系会演进，模型要支持增量类目（冻结主干只训新类头）。`,
    keyPoints: ["FastText 微秒级基线", "TextCNN 短文本够用", "BERT 精度上限高需蒸馏", "混合分层架构兼顾吞吐"],
    followUps: ["BERT 蒸馏常用方法？（提示：TinyBERT 层间蒸馏+logits 匹配）", "如何判断模型过度复杂？（提示：消融复杂结构看指标掉不掉）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-137",
    nodeId: "ai-nlp-sequence",
    question: "序列标注评估：token-level F1 vs entity-level F1 区别？",
    answer: `【分层原理】结论：两种评估的粒度差异决定结论可信度。第一层 token-level：每个 token 的标签独立算 P/R/F1，一个 5 字实体预测对 4 字就有 4 个 TP，指标被"部分正确"灌水。第二层 entity-level：实体的边界与类型必须完全匹配金标准才算 TP，多一字少一字都算错，是 NER 的标准评估（CoNLL 官方口径）。第三层量级差距：同一模型 token-level F1 可能比 entity-level 高 5~15 个点，实体越长差距越大。实现：把 BIO 序列解码成（type, start, end）三元组集合，预测集与金标集求交算 TP，再算 micro-F1（跨类汇总）；宏平均（macro）适合类别均衡分析。延伸：exact match 之外有 relaxed match（边界重叠即算对，MUC 评测用），适合边界本身有标注歧义的场景，但交付物是结构化数据时必须坚持 exact。

【实际案例】医疗 NER 抽取"药品+剂量"供处方审核，边界错一个字（"阿莫西林 0.5g"抽成"阿莫西林 0.5"）下游规则就匹配失败——平安医疗的验收标准明确 entity-level exact F1≥0.85，token-level 的 0.95 毫无意义。失败形态：某团队汇报 token-level F1 0.94 立项上线，业务方实测抽取准确率只有 78%——token 灌水掩盖了边界错误率，项目险些被砍，重训以 entity F1 为目标（加 CRF+边界强化损失）后才达标。

【举一反三】"评估粒度决定优化方向"通用：①目标检测用 IoU≥0.5 的 mAP 而非像素级准确率，同理防灌水；②机器翻译 BLEU 的 n-gram 截断计数是"部分匹配有限给分"；③LLM 评估 pass@1（整段代码可运行）就是 entity-level 思维。决策：交付物是完整实体/结构化记录就用 exact，是倾向性/主题可用宽松指标。

【扣分点对照】背八股的只知道"F1 是 P 和 R 的调和平均"；真做过的能讲出两种粒度的计算差异与量级差（5~15 点）、BIO 解码成实体集合的实现细节（孤立 I-X 的处理）、micro 与 macro 的选择，以及业务验收为何必须坚持 entity-level。

\`\`\`python
def bio2ents(tags):  # BIO → {(type,start,end)}
    ents, start = [], None
    for i, t in enumerate(tags + ["O"]):
        if t.startswith("B-"): start, typ = i, t[2:]
        elif t == "O" and start is not None:
            ents.append((typ, start, i)); start = None
    return set(ents)
f1 = 2*tp/(2*tp+fp+fn)  # tp = |pred ∩ gold|
\`\`\`

踩坑：①孤立 I-X 的处理策略要与评测脚本一致（seqeval 库是标准）；②跨句实体（换行被切）要在解码层合并；③类别极不均衡时 micro-F1 被大类主导，汇报需附 macro。`,
    keyPoints: ["token-level 部分正确灌水", "entity-level 边界类型全对才算", "量级差 5~15 个点", "业务验收坚持 exact match"],
    followUps: ["孤立 I-X 如何处理？（提示：与 seqeval 标准一致，视为新实体或丢弃需统一）", "micro 与 macro 如何选？（提示：类别均衡分析用 macro，总体水平用 micro）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-138",
    nodeId: "ai-nlp-sequence",
    question: "医疗/法律 NER 工业应用有何挑战？领域适配如何做？",
    answer: `【分层原理】结论：垂直领域 NER 三大死结——术语密集（通用词表覆盖差）、标注依赖专家（成本高量级小）、实体长尾（罕见病/偏门法条），解法对应三层。第一层表示层领域化：通用 BERT 在领域语料继续 MLM 预训练（DAPT），代价几千卡时，收益是术语表示质量质变——PCL-MedBERT、LawBERT 皆此路线产物。第二层数据层放大：专家标注少量金标准（千级）+远程监督/规则/词典弱标注扩充（十万级）+主动学习挑信息量最大的样本给专家，标注成本压一个数量级。第三层推理层兜底：实体归一化（"二甲双胍片"→标准药品库条目）用词典+编辑距离+向量召回多路融合——NER 只负责边界，归一化负责落地。领域特有难点：嵌套与缩写（"上感"="上呼吸道感染"）需术语表消歧。

【实际案例】平安好医生的病历结构化：初始通用 BERT F1 仅 0.71（医疗术语 OOV 严重），用 50GB 电子病历+医学文献 DAPT 后 F1 到 0.84，再加词典规则兜底归一化到 0.89，支撑每日百万级病历入库。阿里"通义法睿"用裁判文书网数千万文书 DAPT，罪名/法条实体 F1 0.87，律师检索效率提升数倍。失败形态：某团队跳过 DAPT 直接微调，F1 卡在 0.75 加数据也不涨——表示层不认识术语，任务层再努力也是空中楼阁，补 DAPT 后一周过 0.85。

【举一反三】领域适配三板斧（DAPT→弱监督放大→归一化兜底）可迁移任何垂直场景：①金融研报实体抽取（公司/产品/指标）；②工业设备故障工单抽取（部件/故障模式）；③跨境电商多语言商品抽取。决策顺序：先评估术语 OOV 率决定是否 DAPT，再看标注预算定弱监督配比，归一化永远要做——实体不归一化就只是字符串。

【扣分点对照】背八股的只说"用领域数据微调"；真做过的能讲出 DAPT 与直接微调的差距（10+ 点 F1）、远程监督的噪声处理（snorkel 标注函数投票）、主动学习采样策略（不确定性+多样性），以及归一化为何必须与识别分两步（边界和标准化是两种错误模式）。

\`\`\`python
# DAPT：领域语料继续 MLM，再任务微调
model = BertForMaskedLM.from_pretrained("bert-base-chinese")
mlm_trainer.train(medical_corpus)          # 病历+文献
model.save_pretrained("./med-bert")
ner = AutoModelForTokenClassification.from_pretrained("./med-bert", num_labels=13)
\`\`\`

踩坑：①DAPT 语料要清洗脱敏（病历隐私是合规红线）；②弱标注与金标分训（先弱后精），混训噪声反噬；③术语表版本化管理，药品/法条更新需触发归一化重建。`,
    keyPoints: ["DAPT 领域继续预训练", "弱监督放大标注成本", "主动学习挑高价值样本", "归一化与识别分两步"],
    followUps: ["远程监督噪声如何处理？（提示：snorkel 标注函数投票/多实例学习）", "主动学习如何选样本？（提示：不确定性×多样性，避开冗余）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-139",
    nodeId: "ai-nlp-sequence",
    question: "多任务序列标注：NER+POS+分类联合训练如何做？",
    answer: `【分层原理】结论：多任务学习共享 BERT 主干、各任务挂独立头，一个模型同时产出 NER/POS/分类结果，收益与风险并存。第一层收益：任务间归纳偏置互补（POS 知识帮 NER 定边界、意图分类给实体理解提供上下文），小数据任务借力大数据任务；推理成本从 N 个模型降到 1 个，线上 QPS 直接翻倍。第二层结构：硬参数共享（底层全共享+顶层任务头独立）最常用；软参数共享（私有层+跨任务注意力，如 MMoE/PLE）缓解任务冲突但参数翻倍。第三层损失：L=Σ w_i·L_i，权重 w_i 是核心难点——loss 量级差异大（分类 loss 天然小于序列标注）会让大 loss 任务主导梯度；进阶用 GradNorm（按梯度范数动态调权）或不确定性加权。第四层风险：负迁移——任务相关性差时共享互相伤害，检测方法是看任务间梯度余弦相似度是否为负。

【实际案例】百度搜索 query 理解用一个多任务 BERT 同时输出意图分类、实体识别、词性标注，相比三个独立模型：单任务 F1 基本持平（±0.3%），但线上推理成本降 60%，QPS 承载提升 2.5 倍——工程收益远大于指标收益。阿里商品理解的"类目预测+属性抽取+标题纠错"联合训练，属性抽取借力类目信息 F1 提升 1.2 个点（正相关红利）。失败形态：某团队把 8 个弱相关任务硬共享，3 个小任务指标反降，按任务聚类拆成 3 组分别共享后恢复——任务分组要看梯度方向相似性。

【举一反三】多任务权衡在推荐系统更极致：①MMoE/PLE 解决 CTR+CVR+时长多目标，与 NLP 多任务同构；②LLM 指令微调本质是千万任务隐式多任务，靠数据和容量硬吃负迁移。决策：相关性高+资源受限→硬共享；相关性弱+指标敏感→软共享；任务数>10→分组或统一 prompt。

【扣分点对照】背八股的只说"共享底层、独立头部、加权求和"；真做过的能讲出 loss 量级失衡的解法（GradNorm/不确定性加权）、负迁移的检测（梯度余弦为负即冲突）、硬共享 vs MMoE 选型，以及多任务真正的大头收益是推理成本而非指标。

\`\`\`python
class MultiTaskBert(nn.Module):
    def __init__(self, bert):
        self.bert = bert
        self.ner, self.pos, self.cls = nn.Linear(768,9), nn.Linear(768,12), nn.Linear(768,5)
    def forward(self, ids, mask):
        h = self.bert(ids, attention_mask=mask).last_hidden_state
        return self.ner(h), self.pos(h), self.cls(h[:,0])
loss = 1.0*ner_l + 0.5*pos_l + 0.8*cls_l  # 按 loss 量级与优先级调权
\`\`\`

踩坑：①各任务 batch 格式不同，用任务采样器按比率混批；②某任务标注缺失位置填 -100 防污染；③上线灰度要逐任务对比指标，多任务模型单任务回退难定位。`,
    keyPoints: ["共享主干+独立任务头", "loss 量级失衡需动态调权", "梯度余弦测任务冲突", "收益大头是推理成本"],
    followUps: ["负迁移如何检测？（提示：任务间梯度余弦相似度为负即冲突）", "GradNorm 原理？（提示：按各任务梯度范数动态调 loss 权重）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-282",
    nodeId: "ai-nlp-sequence",
    question: "关系抽取与事件抽取如何做？信息抽取 pipeline 在工业界如何落地？",
    answer: `【分层原理】结论：NER 只找实体，关系抽取（RE）进一步判定实体对间的语义关系，事件抽取（EE）再找触发词与论元，三者构成信息抽取的递进栈。第一层 RE 两条路线：pipeline（先 NER 再对实体对分类，错误级联但可解释）与联合抽取（TPLinker/GlobalPointer 把实体与关系统一成 span 矩阵一次解出，避免级联且能处理关系重叠——一个实体参与多个三元组）。第二层 EE：触发词检测+论元按角色抽取（时间/地点/人物），本质是多角色 span 标注。第三层 schema 是灵魂：预先定义关系/事件类型集合，模型只做封闭集分类或按 schema 生成。第四层工业落地范式：小模型按 schema 高精度抽取+LLM 兜底长尾+人工审核高价值条目——纯 LLM 抽取一致性差难入库。

【实际案例】阿里商品知识图谱从标题/详情抽取（品牌，生产，商品）等三元组，用 GlobalPointer 联合抽取 F1 0.88，支撑亿级商品属性补全与搜索导购；对比 pipeline 方案，关系重叠场景（一个标题多品牌）召回提升 11%。百度的金融事件抽取从公告抽"股权质押（股东/比例/期限）"结构化入库供风控预警，事件漏报率从规则时代的 18% 降到 4%。失败形态：某团队用 LLM 直接生成三元组入库，同一事实每次表述不同（"位于北京"vs"总部位于北京市"），图谱无法对齐——入库前必须实体归一化+schema 校验，LLM 输出要过结构化网关。

【举一反三】"小模型高精+LLM 兜底+人审"三层架构通用：①简历解析（NER+RE 抽教育/工作经历）；②合同审查（条款要素抽取）；③舆情监测（事件抽取做热点发现）。决策：schema 稳定高频场景用小模型（便宜稳定），schema 多变长尾场景用 LLM 生成+校验，价值高错误代价大的条目永远留人审。

【扣分点对照】背八股的只会说"先 NER 再关系分类"；真做过的能讲出 pipeline 的错误级联与联合抽取的关系重叠解法（span 矩阵）、事件论元的角色标注、schema 设计如何决定上限，以及 LLM 抽取入库前必须过的归一化与校验网关。

\`\`\`python
# GlobalPointer：实体与关系统一成 (s,p,o) span 打分
scores = model(text)  # (R, L, L) 每种关系一张头尾矩阵
triples = [(r, text[h:t+1], text[h2:t2+1])
           for r, h, t, h2, t2 in threshold_decode(scores)]
# LLM 兜底：prompt 按 schema 生成 JSON，过校验网关再入库
\`\`\`

踩坑：①schema 变更意味着标注全废，设计时预留扩展位；②联合抽取的阈值按关系类型分别调，全局阈值顾此失彼；③LLM 生成三元组必须 JSON schema 强约束+实体回链原文，否则幻觉入库污染图谱。`,
    keyPoints: ["RE 判实体对关系", "联合抽取解级联与重叠", "schema 设计决定上限", "小模型+LLM 兜底+人审"],
    followUps: ["联合抽取如何处理关系重叠？（提示：每种关系一张 span 头尾矩阵，实体可复用）", "LLM 抽取如何防幻觉入库？（提示：schema 校验+实体回链原文+抽样人审）"],
    favorited: false,
    bigTech: true,
  },
  // ===== ai-nlp-generation =====

  {
    id: "ai-140",
    nodeId: "ai-nlp-generation",
    question: "文本摘要：抽取式 vs 生成式？各自适用场景？",
    answer: `【分层原理】结论：两条路线的本质分歧是"忠实性"与"流畅性"的取舍。第一层抽取式：把摘要定义为句子选择问题（TextRank 图排序/BERT 打句分），输出全是原文句子，事实性天然有保证，但句间衔接生硬、压缩率受整句粒度限制。第二层生成式：Seq2Seq（BART/Pegasus）或 LLM 逐 token 生成，可融合多句信息、压缩率高、语言连贯，但概率生成本质带来幻觉风险（捏造数字/张冠李戴）。第三层工业决策矩阵：医疗/法律/金融等事实零容忍场景用抽取式或生成+引用溯源；新闻快讯/会议纪要对流畅性要求高，用生成式+事实核查。LLM 时代主流是"生成+约束"：RAG 提供原文、要求逐句引用、后处理校验实体一致性，把幻觉率压到可接受。评估：抽取看 ROUGE+人工忠实度，生成必须加事实一致性指标（SummaC/QAG）。

【实际案例】腾讯新闻热点摘要早期用 TextRank 抽取式，零幻觉但摘要像"句子拼盘"，阅读完成率低；切生成式后阅读时长提升 18%，但出现过"把 A 公司数据安到 B 公司"的事故——上线事实核查模块（摘要中的数字/人名必须在原文出现）拦截 92% 的幻觉输出。飞书妙记会议纪要用 LLM 生成+发言人归属校验，纪要采纳率（用户不改直接用）从 61% 提升到 83%。知乎日报类场景则坚持抽取式——知乎内容观点性强，改写易失真。

【举一反三】"忠实优先还是流畅优先"的取舍重演于：①机器翻译的直译 vs 意译；②RAG 问答"只答检索到的"vs"允许推理发挥"；③数据到文本（表格转描述）的模板 vs 生成。决策模型：错误代价高的场景保忠实（错误成本>>体验收益），体验驱动场景用生成+多层校验。

【扣分点对照】背八股的只会说"抽取保真、生成流畅"；真做过的能讲出幻觉的具体形态（实体替换/数字捏造/无中生有引用）、工业界三种压幻觉手段（RAG 约束/引用溯源/实体一致性后验）及拦截率，以及"生成+约束"为何成为主流折中。

\`\`\`python
# 生成 + 事实一致性后验
summary = llm.generate(f"基于原文写摘要：{doc}")
ents_s, ents_d = ner(summary), ner(doc)
if not ents_s.issubset(ents_d):      # 摘要实体必须 ⊆ 原文实体
    summary = extractive_fallback(doc)   # 触发回退抽取式
\`\`\`

踩坑：①长文摘要先分段再汇总（map-reduce），直接全文输入超窗口；②生成摘要 ROUGE 高≠事实对，必须独立评估忠实度；③抽取式句子排序用原文顺序，乱序拼接影响可读性。`,
    keyPoints: ["抽取式保忠实但生硬", "生成式流畅但有幻觉", "事实零容忍场景保忠实", "生成+约束成主流折中"],
    followUps: ["幻觉有哪些具体形态？（提示：实体替换/数字捏造/无中生有引用）", "长文摘要如何处理？（提示：map-reduce 分段摘要再汇总）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-141",
    nodeId: "ai-nlp-generation",
    question: "机器翻译专题：beam search、回译、子词切分各解决什么问题？",
    answer: `【分层原理】结论：三者分别是解码、数据、表示层面的关键技术。第一层 beam search：每步保留 k 条累计对数概率最高的候选，避免贪心每步取最高导致全局次优（贪心 BLEU 通常低 beam 1~2 个点）；必须配长度惩罚 score/|y|^α 否则偏爱短句；束宽 4~8 是甜点，再大 BLEU 不涨反降——大束宽倾向高概率但通用干瘪的句子。第二层回译（back-translation）：目标语单语料经反向翻译模型造伪源语，合成平行句对，把低资源语言训练数据放大 10 倍；伪数据噪声用打标（tagged BT）或比例控制（伪：真≤1:1）抑制。第三层子词切分（BPE/SentencePiece）：多语言联合词表让中英等共享编码，未登录词拼子词表示，平衡词表与 OOV。

【实际案例】阿里达摩院做东南亚小语种电商翻译（泰语/越南语商品标题），真实平行语料仅 200 万句对，回译合成 2000 万伪句对后 BLEU 从 28 提升到 35，跨境商品信息翻译覆盖率从 71% 升到 93%，直接拉动 Lazada 转化。Meta 的 NLLB 覆盖 200 语种，核心手段就是大规模回译+多语言联合训练。失败形态：beam 束宽从 4 调到 32 想"更优"，线上译文变得千篇一律（全是高频安全句），人工评估流畅度反降；回译不设比例上限，伪数据 10:1 淹没真数据，模型学会翻译腔，BLEU 虚高 2 点人工评测反降。

【举一反三】三件套思想各自迁移：①beam+长度惩罚通用所有序列生成（摘要/对话）；②回译本质是"用生成模型造训练数据"，LLM 时代的 self-instruct 指令合成、RAG 的 HyDE（生成假设文档再检索）同宗；③子词联合词表思想迁移到多模态统一 tokenization。决策口诀：数据不够先想合成，生成不准先看解码，OOV 先拆子词。

【扣分点对照】背八股的只背三个名词定义；真做过的能讲出长度惩罚公式 score/|y|^α 与 α 经验值（0.6~1.0）、束宽增大 BLEU 反降的原因（高概率≠高质量，模式坍塌到通用句）、回译伪数据比例与打标技巧，以及低资源翻译完整 pipeline（单语挖掘+回译+蒸馏）。

\`\`\`python
def beam_score(hyp, alpha=0.6):
    return hyp.logprob / len(hyp.tokens)**alpha   # 长度惩罚防短句
# 回译：tgt 单语 → 反向模型 → 伪 src，打 <BT> 标
pseudo_src = mt_reverse(tgt_mono)
train(real_pairs + pseudo_pairs)   # 伪：真 ≤ 1:1 起调
\`\`\`

踩坑：①翻译求准用 beam、对话求多样用采样，目标不同别混；②回译伪数据必须打标让模型区分真伪；③联合词表下高资源语言挤占低资源配额，需温度采样平衡。`,
    keyPoints: ["beam search+长度惩罚求全局优", "回译造伪平行语料救低资源", "子词联合词表多语言共享", "伪：真≤1:1 防噪声反噬"],
    followUps: ["束宽增大 BLEU 为何反降？（提示：高概率≠高质量，模式坍塌到通用句）", "回译伪数据为何要打标？（提示：让模型区分真伪，防翻译腔）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-142",
    nodeId: "ai-nlp-generation",
    question: "LLM 解码策略：Greedy / Beam Search / Top-k / Top-p / Temperature 原理？",
    answer: `【分层原理】结论：解码策略在"质量-多样性"光谱上取点，本质是每步从概率分布选 token 的不同规则。第一层 Greedy：每步 argmax，确定性最强，但开放生成陷入重复循环（"我觉得我觉得..."）。第二层 Beam Search：维护 k 条全局最优，适合翻译/摘要等有标准答案的任务，开放对话里输出干瘪通用。第三层 Temperature：logits/T 再 softmax，T<1 分布变尖（保守）、T>1 变平（发散）。第四层 Top-k：只在概率前 k 个采样，硬截断不自适应（分布平时 k 太小丢信息）。第五层 Top-p（nucleus）：取累计概率≥p 的最小集合，分布尖时集合小、平时集合大，自适应是工业默认。组合使用：T 调分布形状，top-p 截尾，top-k 兜底。本质认知：解码策略不改变模型知识，只改变从分布中"提取"的方式——幻觉靠解码只能缓解不能根治。

【实际案例】字节豆包默认 temperature≈0.7、top-p≈0.9 平衡对话质量与多样性；代码场景（MarsCode）调到 T=0.2 求确定性——代码对错分明不需要创意；创意写作功能 T 提到 1.0+ 并配 repetition_penalty≈1.1 防重复。阿里通义千问 API 官方建议客服场景 T=0.1（答案稳定可复现）、营销文案 T=0.85。失败形态：某客服机器人误用 T=1.2，同一问题每次答案不一致甚至政策口径打架，客诉激增；另一团队用 beam search 做闲聊，回复全是"哈哈是的呢"式高频安全句，用户 3 句流失。

【举一反三】"从分布中提取样本的策略"思想通用：①扩散模型的 guidance scale 调条件强度与 temperature 异曲同工；②RL 探索的 ε-greedy 是利用-探索权衡；③搜索广告的随机探索同样逻辑。决策：答案唯一的任务（代码/数学/客服政策）低温+窄采样，答案开放的任务（文案/闲聊/脑暴）高温+核采样，永远配重复惩罚。

【扣分点对照】背八股的只会罗列五个名词；真做过的能讲出 top-p 为何比 top-k 自适应（按分布形状动态集合）、beam 在开放生成失败的原因（高概率=通用化）、greedy 重复循环的成因（自回归正反馈），以及业务参数表（客服 T=0.1/代码 T=0.2/创意 T≥0.85）。

\`\`\`python
def sample(logits, T=0.7, top_p=0.9):
    p = F.softmax(logits / T, dim=-1)
    sp, si = p.sort(descending=True)
    keep = sp.cumsum(-1) <= top_p; keep[..., 0] = True  # 至少留 1 个
    p = torch.where(keep, sp, torch.zeros_like(sp)); p /= p.sum()
    return si.gather(-1, p.multinomial(1))
\`\`\`

踩坑：①T=0 等价 greedy 但部分框架有数值坑，用 T=0.01 更稳；②repetition_penalty>1.2 误伤专名复现（代码变量名）；③流式输出下 beam search 无法逐字透出，对话产品只能采样。`,
    keyPoints: ["T 调分布形状 top-p 截尾", "top-p 按分布形状自适应", "beam 求准采样求多样", "解码改提取不改知识"],
    followUps: ["top-p 为何优于 top-k？（提示：按分布形状动态集合，硬 k 不自适应）", "greedy 为何会重复循环？（提示：自回归正反馈，前文强化同 token）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-143",
    nodeId: "ai-nlp-generation",
    question: "BLEU / ROUGE 评估指标原理？生成任务如何评估？",
    answer: `【分层原理】结论：BLEU 与 ROUGE 都是 n-gram 重合度指标，前者重精确、后者重召回。第一层 BLEU：n=1~4 阶精确率几何平均，乘简洁惩罚 BP=min(1,e^(1-参考长/译文长)）防"只译高频短句"刷分，是机器翻译三十年标准。第二层 ROUGE-N：以参考为分母算召回，摘要任务用——摘要要"覆盖要点"而非"字字对得上"；ROUGE-L 用最长公共子序列捕捉句级流利度。第三层根本局限：n-gram 重合≠语义等价——"猫追狗"与"狗追猫"重合度极高语义相反；同义改写（"快速"→"迅速"）被无辜扣分。第四层演进：BERTScore 用 embedding 余弦替代硬重合，COMET 学人类打分回归；LLM 时代开放性长答案转向 LLM-as-judge+人工抽检。
  
【实际案例】谷歌翻译迭代以 BLEU 为离线门禁、人工 side-by-side 为上线门禁，论文报告的 +2~3 BLEU 在人工评测里常只剩一半增益——指标与体感之间要打折。阿里商品文案摘要团队用 ROUGE-L 筛基线、上线看点击转化，发现 ROUGE 与转化相关性仅约 0.3，最终自建"卖点覆盖度"领域指标。失败形态：某团队刷 BLEU 把束宽调到 50，译文全是高频安全短句，BLEU+2 但人工满意度反降——指标被古德哈特定律反噬，"指标成目标即失效"。
  
【举一反三】"可计算代理指标 vs 真实目标错配"是通用病：①推荐刷 AUC 不涨 CTR；②LLM 刷榜分高业务难用。决策模型：自动指标做迭代筛选（便宜高频），人工/业务指标做上线门禁（贵但真实），定期校验两者相关性，相关性衰减就换指标。
  
【扣分点对照】背八股的只背"BLEU 精确、ROUGE 召回"；真做过的能讲 BP 为何必须存在、ROUGE-L 的 LCS 定义、单参考译文系统性低估质量（多参考可涨 5+ BLEU）、以及为何 LLM 时代 n-gram 指标让位于 LLM-as-judge。
  
\`\`\`python
from nltk.translate.bleu_score import sentence_bleu
ref = [["这只", "猫", "追", "狗"]]
cand = ["这只", "狗", "追", "猫"]
print(sentence_bleu(ref, cand))  # 重合高但语义反：n-gram 盲区
\`\`\`
  
踩坑：①中文 BLEU 必须先统一分词（或用字级），分词器不同结果不可比；②单参考低估质量，报告用多参考；③指标涨人工不涨时立即停发，查是否过拟合指标。`,
    keyPoints: ["BLEU 精确率+简洁惩罚", "ROUGE 召回导向摘要适用", "n-gram 重合≠语义等价", "自动指标筛选人工门禁"],
    followUps: ["BP 为何必须存在？（提示：防只译短句刷精确率）", "n-gram 指标为何让位 LLM-as-judge？（提示：开放长答案硬重合失效）"],
    favorited: false,
    bigTech: false,
  },

  {
    id: "ai-144",
    nodeId: "ai-nlp-generation",
    question: "对话系统：任务型 vs 开放域（Chatbot）架构区别？",
    answer: `【分层原理】结论：任务型对话是"带目标的状态机"，开放域是"无目标的生成"，架构目标根本不同。第一层任务型经典 pipeline：NLU（意图分类+槽位抽取）→DST（对话状态追踪：槽位填到哪）→Policy（下一步动作：问/确认/执行）→NLG（生成回复），模块解耦可控可调试，代价是误差级联——NLU 错了后面全错。第二层任务型端到端：一个模型直接从对话历史到回复，减少级联但数据要求高。第三层开放域：检索式（语料匹配，可控但死板）或生成式（LLM，灵活但跑题），评估从"任务成功率+平均轮次"变成"连贯性/趣味性/人设一致"。第四层 LLM 时代融合：function calling 让 LLM 同时承担闲聊大脑与任务调度，传统四模块塌缩成"LLM+工具"。
  
【实际案例】阿里小蜜双十一承接亿级咨询：意图识别准确率 95%+、平均 2.3 轮解决问题；早期 NLU 把"改地址"误判成"查物流"导致整轮对话崩坏——误差级联的教科书案例，后加置信度拒识转人工兜底。微软小冰走开放域路线，以 CPS（每次对话轮数）为北极星优化到 23 轮，却长期无法落地任务场景。LLM 后美团客服把"闲聊安抚+查订单"统一：LLM 先判断情绪安抚、识别意图调订单 API，人工介入率降 18%。
  
【举一反三】"状态机 vs 自由生成"的分歧到处可见：①自动驾驶规则派 vs 端到端派；②风控规则引擎 vs 模型评分。决策：动作空间封闭、容错低（订机票/转账）用状态机+强校验；交互开放、容错高（陪聊/导购）用生成式，关键动作前加确认环节。
  
【扣分点对照】背八股的只说"任务型 pipeline、开放域生成"；真做过的能讲 DST 状态表示设计、误差级联如何用置信度拒识缓解、CPS 与任务成功率两个北极星的冲突，以及 function calling 如何把四模块塌缩成"LLM+工具"。
  
\`\`\`python
# 任务型最小骨架：意图+槽位 → 状态 → 动作
intent, slots = nlu("帮我订明天去北京的机票")
state.update(slots)                      # DST
missing = [s for s in required if s not in state]
action = f"请问{missing[0]}？" if missing else book(state)
\`\`\`
  
踩坑：①NLU 置信度低必须拒识转人工，硬答错一次用户永久流失；②多轮槽位继承要处理指代（"那后天呢"）；③开放域接任务前先界定能力边界，防用户期望失控。`,
    keyPoints: ["任务型=NLU→DST→Policy→NLG", "pipeline 误差级联需拒识", "开放域北极星是 CPS", "function calling 融合两派"],
    followUps: ["误差级联如何缓解？（提示：置信度拒识+确认环节+端到端）", "LLM 时代 DST 还有必要吗？（提示：塌缩为 function calling 参数校验）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-145",
    nodeId: "ai-nlp-generation",
    question: "代码生成：LLM 如何做代码补全/生成？如何保证正确性？",
    answer: `【分层原理】结论：代码生成=代码语料预训练+指令微调，评估靠"能不能跑通测试"这一硬标准。第一层训练：GitHub 级语料上 causal LM，关键是 FIM（fill-in-the-middle）训练——把中间段挪到末尾，让模型学会光标处双向补全，IDE 补全必备。第二层评估：HumanEval/MBPP 用 pass@k——生成 k 个样本任一通过单测即算过；pass@1 看一次成功率，pass@100 看搜索上限，无偏估计 1-C(n-c,k)/C(n,k)。第三层正确性保障：①采样多候选+执行过滤（跑测试留通过者）；②self-repair 把报错喂回模型重写；③verifier 模型排序；④受约束解码保语法合法。本质优势：代码是唯一"免费获得执行反馈"的生成任务，正确性可机器验证。
  
【实际案例】GitHub Copilot 公开数据：开发者约 30% 新代码由其生成，任务完成速度提升 55%；字节 MarsCode 落地以采纳率（补全被接受比例约 30%）为核心北极星——采纳率每涨 1 点背后是 FIM 数据配比与延迟（<300ms）的联合调优。失败形态：某团队只报 pass@100=85 显得很强，实际 pass@1 只有 28，用户按 Tab 采纳率惨淡；另一团队模型生成"看起来对"的代码，单测覆盖不到边界条件，空指针上线后才炸——测试覆盖度决定执行过滤的上限。
  
【举一反三】"生成+机器验证"闭环可迁移：①Text2SQL 可在沙箱库执行校验；②数学证明用 Lean 形式化验证；③芯片设计用仿真器过滤。决策模型：有可执行环境时，"采样 n 个+验证过滤"几乎免费提升正确性，这是开放文本生成享受不到的特权。
  
【扣分点对照】背八股的只说"Codex 很强"；真做过的能写 pass@k 无偏估计公式、讲 FIM 的 PSM/SPM 格式、执行过滤管线（采样→沙箱→单测→排序）、以及采纳率为何受延迟与上下文窗口双重约束。
  
\`\`\`python
def pass_at_k(n, c, k):
    # n=采样总数 c=通过数 k=取几个评估；无偏估计
    if n - c < k: return 1.0
    return 1.0 - math.comb(n - c, k) / math.comb(n, k)
# 采样 20 个跑单测，pass@1 与 pass@10 分开报
\`\`\`
  
踩坑：①训练语料含 HumanEval 题解会刷分虚高，必须去污染；②执行过滤沙箱要限 CPU/内存/网络，防恶意代码；③补全延迟>500ms 采纳率断崖，小模型+缓存比大模型实用。`,
    keyPoints: ["FIM 训练支持光标双向补全", "pass@k 无偏估计分开报", "执行过滤+self-repair 保正确", "采纳率受延迟覆盖双约束"],
    followUps: ["pass@k 公式如何推？（提示：组合数，1-全不中的概率）", "执行过滤为何是代码生成特权？（提示：唯一免费获机器反馈的生成任务）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-146",
    nodeId: "ai-nlp-generation",
    question: "LLM 幻觉（Hallucination）问题？如何缓解？",
    answer: `【分层原理】结论：幻觉=模型生成看似合理但与事实或输入矛盾的内容，根因是训练目标与事实正确性错位。第一层成因：MLE 训练只优化"下一个 token 像人话"，从不奖励"说真话"；长尾知识在语料里出现一两次，模型只学到模糊印象，被迫"脑补"细节。第二层分类：事实性幻觉（与世界知识矛盾：编不存在的论文）与忠实性幻觉（与给定上下文矛盾：摘要添油加醋），后者在 RAG/摘要场景更致命。第三层检测：自洽性采样（多次采样答案互斥则可疑）、NLI 矛盾校验、检索证据比对。第四层缓解：RAG 把知识外置、强制引用溯源、temperature 调低、RLHF/DPO 奖励"承认不知道"、事后校验链。认知底线：幻觉只能降频不能根治——压缩必有损，模型不可能记住所有长尾事实。
  
【实际案例】2023 年美国律师用 ChatGPT 写诉状，引用 6 个判例全是编造的，被法官处罚——法律界幻觉标志性事件，此后法律 AI 产品强制"每条引文可点开核实"。医疗更严苛：讯飞医疗大模型用 RAG 挂临床指南库+引用编号，幻觉率从约 8% 压到 1% 以下才获准试点。失败形态：某知识库问答让 LLM 自由发挥，编造"公司年假 30 天"政策截图疯传；改 RAG+引用+拒答（检索置信度低时明说不知道）后客诉降 90%——"会说不知道"比"永远有答案"值钱。
  
【举一反三】"生成模型的可信度工程"是通用命题：①推荐的"探索噪声"本质是主动引入的幻觉换多样性；②自动驾驶感知误检用多传感器交叉验证，与 NLI 校验同构。决策：高风险场景（医/法/金融）幻觉成本无穷大，必须 RAG+引用+拒答三件套；低风险创意场景幻觉即灵感，反而要加温。
  
【扣分点对照】背八股的只说"幻觉是模型瞎编，用 RAG 解决"；真做过的能区分事实性/忠实性两类、讲 MLE 目标错位根因、自洽性采样检测法、以及 RAG 的边界（检索不到照样编，需配拒答阈值）。
  
\`\`\`python
answers = [sample(prompt, T=0.8) for _ in range(5)]  # 自洽性采样
agree = nli_entail(answers[0], answers[1:])
if agree < 0.6: return "抱歉，我不确定"      # 答案互斥→拒答
\`\`\`
  
踩坑：①RAG 检索到错误文档会"自信地编"，引用≠正确；②降 temperature 只降频不除根；③摘要幻觉最难查——添油加醋部分语法完美，需 NLI 逐句校验。`,
    keyPoints: ["幻觉根因是 MLE 目标错位", "事实性/忠实性两类分治", "自洽性采样+NLI 检测", "RAG+引用+拒答三件套"],
    followUps: ["RAG 为何不能根治幻觉？（提示：检索缺失或错误时照样编）", "自洽性检测原理？（提示：多次采样互斥则置信度低）"],
    favorited: false,
    bigTech: true,
  },

  {
    id: "ai-205",
    nodeId: "ai-nlp-generation",
    question: "LLM 评估：LLM-as-judge 有哪些偏置？事实性/幻觉如何评？基准污染如何应对？",
    answer: `【分层原理】结论：LLM-as-judge 用强模型给输出打分，便宜可扩展，但裁判本身有系统性偏置。第一层四大偏置：位置偏置（交换两答案顺序评分就变）、冗长偏置（长答案易得高分哪怕废话）、自我偏好（GPT-4 给 GPT 系打分偏高）、风格偏置（偏爱 markdown 列表体）；缓解用交换位置取平均、长度归一、多裁判投票、屏蔽来源。第二层事实性评估：FActScore 把长答案拆成原子事实逐条核对检索证据；知识用选择题基准（MMLU），开放式用 judge+人工。第三层基准污染：测试题泄入训练语料分数虚高——检测用 n-gram 重叠扫描、金丝雀字符串（big-bench 埋的唯一标识串，出现在输出即泄漏）；应对用动态评测（LiveBench 每月新题）、私有 held-out 集、Chatbot Arena 真人盲投 Elo。
  
【实际案例】Chatbot Arena 收集数百万真人盲投，Elo 排名成为比 MMLU 更可信的公众参照——因为无法预刷。2024 年多家厂商被质疑刷榜：GSM8K/MMLU 分数极高却 Arena 排名不符，社区用 n-gram 重叠发现部分模型训练语料含测试题原文。工业落地：阿里内部评测用"GPT-4 judge 初筛+业务专家抽检 5%"双层，judge 与人类一致性约 85%，靠交换位置+多裁判把位置偏置从 12% 压到 3% 以内。
  
【举一反三】"裁判的可信度需要被评估"是元问题：①A/B 实验指标本身可能被新奇效应污染；②离线标注员也有一致性问题需互检。决策：自动 judge 做大规模初筛，人工做校准锚点，定期测人机一致性（Cohen's kappa），低于 0.7 就修 judge prompt 或换裁判。
  
【扣分点对照】背八股的只会说"用 GPT-4 当裁判"；真做过的能列四大偏置及各自缓解法、FActScore 原子事实拆解流程、金丝雀字符串检测原理、以及 Arena Elo 为何抗刷榜（动态真人无法预刷）。
  
\`\`\`python
def judge_pair(a, b, prompt):
    s1 = gpt4(prompt, answer1=a, answer2=b)   # 原始顺序
    s2 = gpt4(prompt, answer1=b, answer2=a)   # 交换位置
    return (s1 + (6 - s2)) / 2                # 取平均消位置偏置
# 污染检测：输出含 canary 串 = 训练泄漏
\`\`\`
  
踩坑：①judge prompt 微小改动分数漂移大，版本必须冻结；②让裁判给自家模型打分=自我偏好实锤，评测报告要披露裁判型号；③公开基准分数只信 6 个月内的，老基准默认已被污染。`,
    keyPoints: ["judge 四偏置：位置/冗长/自我/风格", "FActScore 原子事实逐条核", "金丝雀串检测基准污染", "Arena 真人 Elo 抗刷榜"],
    followUps: ["位置偏置如何量化与消除？（提示：交换顺序测一致率，取平均）", "基准污染如何取证？（提示：n-gram 重叠+金丝雀字符串）"],
    favorited: false,
    bigTech: true,
  },


  // ===== 从远程合入：ai-vector-retrieval =====
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

];

