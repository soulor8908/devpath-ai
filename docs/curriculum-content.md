# 课程内容层（Curriculum）开发指南

策展式知识库的协作规范。内容即代码：修改内容 = 提交 PR，CI 自动校验。

## 目录结构

```
content/
├── sources/registry.yaml      # 权威来源登记处（T0-T3 四级）
├── graph/
│   ├── tracks/*.yaml          # 学习轨道（含阶段定义）
│   └── nodes/*.yaml           # 技能节点（一文件一节点）
└── rubrics/*.yaml             # V3/V4 验证的评分细则
```

## 权威等级（内容的可信度 = 其来源的最高等级）

| 等级 | 含义 | 示例 |
|------|------|------|
| T0 | 一手规范 | 官方文档、协议规范、论文 |
| T1 | 一手实现 | 经典源码、官方 Cookbook |
| T2 | 权威工程实践 | 一线从业者深度文章 |
| T3 | 二手解读 | 仅作补充，不可单独支撑节点 |

## 新增一个技能节点

1. 在 `sources/registry.yaml` 登记其来源（≥2 条，至少 1 条 T0/T1）
2. 在 `graph/nodes/` 新建 `<id>.yaml`，字段见 `lib/curriculum/schema.ts`
3. 必填的教学字段：`frontendBridge`（前端迁移映射）、`concepts`、`gotchas`、`interview`（含追问）、`masteryCheck`
4. 跑 `npm run content:validate` 通过
5. `npm run content:compile` 生成 `public/data/curriculum-graph.json`

## 校验规则（CI 门禁，npm test 自动执行）

- 结构层：zod schema（id 格式、日期格式、必填字段）
- 图谱层 G1-G7：前置存在 / 来源已登记 / ≥1 条 T0-T1 / 无环 / 轨道阶段合法 / V3-V4 必挂 Rubric / Rubric 权重和=100
- 成分层：权威体系、教学完备性（迁移映射、面试题、里程碑验证）、路径引擎端到端

## 验证等级（掌握状态机 V1→V4 逐级递进，不可跳级）

| 级别 | 形式 | 验证什么 |
|------|------|----------|
| V1 | FSRS 卡片 | 概念理解 |
| V2 | 沙箱代码题 | 能写出来 |
| V3 | 项目检查点（AI 按 Rubric 审查） | 能造出来 |
| V4 | 作品集发布 | 能证明给谁看 |

## 运行时消费

客户端 fetch `public/data/curriculum-graph.json`（`CurriculumGraph` 类型），
通过 `lib/curriculum/` 的纯函数 API 使用：

- `computePath(graph, { trackId, knownNodeIds, dailyMinutes })` → 个性化路径
- `toKnowledgeNodes(nodes)` → 适配为既有 `KnowledgeNode[]`（供 plan-generator / 脑图 / FSRS 复用）
- `applyVerificationResult(node, state, level, passed)` → 掌握状态推进
