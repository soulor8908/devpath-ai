---
name: update-docs
description: 扫描代码库现状，更新项目基础文档（README.md / docs/ARCHITECTURE.md / docs/DEVELOPMENT.md / docs/PRODUCT.md）以反映最新功能、架构、数据指标。每次用户提到"更新基础文档"时自动执行。
---

# update-docs — 项目基础文档同步 Skill

> 用途：当代码库发生功能 / 架构 / 指标变化后，把变化同步到 4 份基础文档，保持文档与代码一致。
> 触发：用户说"更新基础文档" / "同步文档" / "update docs" 等。
> 范围：仅更新 README.md / docs/ARCHITECTURE.md / docs/DEVELOPMENT.md / docs/PRODUCT.md 这 4 份基础文档。其他文档（如 ui-design-system.md / content-generation-standard.md / curriculum-content.md）由对应守护测试维护，不在本 skill 范围内。

---

## 执行步骤（严格按顺序）

### Step 1：扫描代码现状（事实源）

并行执行以下命令收集事实数据，**不依赖记忆**——文档里的每个数字都必须来自实时扫描：

```bash
# 1.1 测试用例数 & 测试文件数（用于 README/ARCHITECTURE/DEVELOPMENT/PRODUCT）
find /workspace/__tests__ -name "*.test.ts" -type f | wc -l                              # 测试文件数
grep -rE "^\s*(it|test)\(" /workspace/__tests__/ 2>/dev/null | wc -l                    # 测试用例数

# 1.2 课程节点数 & 轨道数（用于 README/ARCHITECTURE/PRODUCT）
ls /workspace/content/graph/nodes/*.yaml 2>/dev/null | wc -l                            # 节点数
ls /workspace/content/graph/tracks/*.yaml 2>/dev/null | wc -l                           # 轨道数

# 1.3 预置 preset 数（用于 README/ARCHITECTURE/PRODUCT）
ls /workspace/lib/presets/*.ts 2>/dev/null | grep -v index.ts | wc -l                   # preset 数

# 1.4 关键依赖版本（用于 README）
grep -E '"(next|react|typescript|tailwindcss|vitest|ts-fsrs|ai|@ai-sdk)' /workspace/package.json

# 1.5 关键功能是否存在（用于 ARCHITECTURE 优化方向标记）
test -f /workspace/lib/knowledge/search.ts && echo "vector search: yes" || echo "no"
test -f /workspace/public/sw.js && echo "service worker: yes" || echo "no"
test -f /workspace/lib/auth/session.ts && echo "zero-trust session: yes" || echo "no"

# 1.6 文档当前状态（用于 diff 检查）
wc -l /workspace/README.md /workspace/docs/ARCHITECTURE.md /workspace/docs/DEVELOPMENT.md /workspace/docs/PRODUCT.md 2>/dev/null
```

把扫描结果记录在临时变量里，后续步骤会用。

### Step 2：更新 README.md（项目介绍）

**职责**：开发者 / 用户的入口文档，反映「项目是什么、能做什么、怎么用」。

**必检章节**：

1. **顶部介绍段**：技术栈（Next.js 15 / React 19 / TS 5.5 / Tailwind 3.4 / Vitest 1.6 / IndexedDB / Cloudflare KV）+ 生产链接
2. **✨ 核心能力** 章节：
   - 基础能力（L4 交付层）
   - 智能化能力（AI-Native）
   - 内容层（L1 策展护城河）
   - 三层质量护栏
3. **🚀 快速开始** 章节：环境要求 / 安装 / 本地开发 / 测试与质量门禁 / 内容生产管线 / 部署
4. **测试用例数**：替换为 Step 1.1 扫描的真实数字（格式：「986 个用例 / 77 个测试文件」）
5. **预置轨道数**：替换为 Step 1.3 扫描的真实数字
6. **📚 文档导航** 表格：列全所有 docs/*.md + AGENTS.md + devpath-ai-redesign.md

**更新策略**：用 Edit 工具精准替换过时数字 / 章节，不重写整个文件。

### Step 3：更新 docs/ARCHITECTURE.md（技术架构）

**职责**：面向开发者的架构文档，反映「分层、数据流、关键设计决策、AI-Native 演化」。

**必检章节**：

1. **产品四层架构（L1-L4）**：内容层 / 路径引擎 / 验证层 / 交付层，每层职责清晰
2. **运行时分层架构** 图：UI 层 / Hook 层 / AI 编排层 / 业务逻辑层 / 存储层
3. **数据流** 章节：首页加载流 / 学习计划生成流 / 番茄时钟流程 / 节奏引擎决策流 / AI 聊天工具调用流 / 用户画像构建流 / 限流流程
4. **关键设计决策**（10 条）：IndexedDB 主存储 / 增量同步 / Prompt 版本指纹 / 能量回归冷启动 / 情绪字段迁移层 / 节奏引擎规则优先 / 画像批量重建 / Persona 单一数据源 / 乐观限流 / 成就检测纯函数
5. **L1 内容层关键设计**：Content-as-Code / 权威来源等级 / 三层质量门禁 / 内容生产管线 / 6 个预置计划 / 运行时加载 / 知识库向量搜索
6. **零信任 session（安全架构）**：流程图 + 关键文件
7. **PWA Service Worker**：缓存策略 / Web Push / periodicsync
8. **AI-Native 架构分析**：三阶段演化 + 成熟度评估表 + 优化方向（已完成项标记 ✅）
9. **测试策略**：单测数 / E2E / CI 强制校验
10. **部署**：Cloudflare Pages / GitHub Actions / KV binding

**更新策略**：
- 用 Step 1 数据替换测试用例数 / 节点数 / preset 数
- 已完成功能在「优化方向」中标记 `~~名称~~（P0 ✅ 已完成 YYYY-MM）`
- 新增模块（如 Service Worker / 向量搜索）在对应章节补充

### Step 4：更新 docs/DEVELOPMENT.md（开发指南）

**职责**：面向开发者的实操指南，反映「环境、测试、各模块开发流程」。

**必检章节**：

1. **环境要求** + **本地开发**
2. **安全配置**：MASTER_KEY 生成 / 本地开发 / Cloudflare Pages 部署 / 密钥轮换
3. **测试**：用例数（替换为 Step 1.1 真实数字）
4. **代码质量**：typecheck / lint / quality-gate
5. **添加新的 AI Prompt**：5 步流程（含 prompts.test.ts 快照）
6. **添加新的 AI 工具（clientAction）**：6 步流程（含幂等键）
7. **添加新的 IndexedDB 数据类型**：4 步流程
8. **番茄时钟开发**：Session 生命周期 / 唤起入口 / 休息规则 / 专注保护 / 完成副作用
9. **用户画像开发**：构建流程 / 画像注入点 / 添加新画像维度
10. **优先级引擎开发**：评分公式 / 关键文件 / 健康检查规则
11. **节奏引擎开发**：决策优先级链 / 添加新分支
12. **AI Persona 开发**：4 种 Persona 表 / 关键文件 / 添加新 Persona
13. **成就系统开发**：16 个预置成就表 / 添加新成就
14. **限流开发**：场景配额表 / 关键文件 / 添加新场景
15. **Demo 数据开发**
16. **能量回归模型**
17. **同步引擎**
18. **首页后台任务**：5 路并行表
19. **课程内容开发（L1 内容层）**：仓库布局 / 添加新节点 / G1-G7 图谱规则 / 添加新 preset / 知识库向量搜索
20. **PWA Service Worker 开发**
21. **性能优化**：已完成优化清单 + 性能基线
22. **代码风格**
23. **AI 成本追踪开发**
24. **质量门禁**：本地一键校验 / Git 钩子 / CI 自动门禁

**更新策略**：用 Edit 精准替换过时数字 + 补充新模块章节。

### Step 5：新建 / 更新 docs/PRODUCT.md（产品说明）

**职责**：面向所有人的产品文档，反映「是什么、为谁、解决什么、怎么用」。

**必检章节**（详见 docs/PRODUCT.md 现有结构）：

1. 一句话定位
2. 谁该用 / 不该用 DevPath
3. 解决什么问题（4 矛盾 → 4 层架构）
4. 核心产品原则（6 条，乔布斯视角）
5. 核心使用流程（第一次使用 / 日常闭环 / 周末复盘 / 跨设备同步）
6. 主要功能模块（学习 / 复习 / 番茄 / AI 教练 / 成就 / 作品集 / 数据同步 / AI 质量成本）
7. 数据隐私
8. 与其他产品的差异（对比表）
9. 设计哲学（乔布斯视角 6 条）
10. 路线图
11. 相关文档

**更新策略**：
- 测试用例数替换为 Step 1.1 真实数字
- 新功能模块补充到「主要功能模块」
- 路线图进展同步（✅ 已完成 / 🚧 进行中 / 📋 未来）

### Step 6：一致性校验

更新完 4 份文档后，运行一致性校验：

```bash
# 6.1 测试用例数在 4 份文档里必须一致
grep -E "(986|786|758)" /workspace/README.md /workspace/docs/ARCHITECTURE.md /workspace/docs/DEVELOPMENT.md /workspace/docs/PRODUCT.md 2>/dev/null

# 6.2 节点数（49）必须一致
grep -E "49 (个)?节点|49 nodes" /workspace/README.md /workspace/docs/ARCHITECTURE.md /workspace/docs/PRODUCT.md 2>/dev/null

# 6.3 preset 数（6）必须一致
grep -E "6 个预置|6 presets|6 preset" /workspace/README.md /workspace/docs/ARCHITECTURE.md /workspace/docs/PRODUCT.md 2>/dev/null
```

发现不一致立即用 Edit 修正。

### Step 7：提交并推送

```bash
git add README.md docs/ARCHITECTURE.md docs/DEVELOPMENT.md docs/PRODUCT.md .trae/skills/update-docs/SKILL.md
git status   # 确认暂存内容
git commit -m "$(cat <<'EOF'
docs: 同步基础文档与代码现状

- README.md / ARCHITECTURE.md / DEVELOPMENT.md / PRODUCT.md 4 份基础文档对齐最新代码
- 测试用例数 / 节点数 / preset 数 等指标校准
- 补充 L1-L4 四层架构 / Content-as-Code / 零信任 session / PWA Service Worker 章节
- 新建 docs/PRODUCT.md（产品说明，乔布斯视角）
- 新增 update-docs skill 用于定期同步
EOF
)"

git pull --rebase origin main   # 避免远程有新提交导致 push 失败
git push origin main
```

如果 push 失败（远程有冲突），先 `git pull --rebase` 解决冲突再 push。**不要 force push**。

### Step 8：回复用户

报告：
- 哪些文档被更新了（按 README / ARCHITECTURE / DEVELOPMENT / PRODUCT 列）
- 关键变更点（数字校准 / 新增章节 / 删除过时内容）
- 是否 push 成功
- 一致性校验结果

---

## 注意事项

1. **不依赖记忆**：所有数字（测试数 / 节点数 / preset 数）必须用 shell 命令实时扫描，不能凭印象写。
2. **不重写整个文件**：用 Edit 工具精准替换过时片段，保留原有结构。
3. **不创建新文档**：除非 docs/PRODUCT.md 不存在（首次运行），否则只编辑现有 4 份文档。
4. **不修改守护测试**：本 skill 只同步文档，不改代码 / 不改测试。
5. **不更新其他文档**：ui-design-system.md / content-generation-standard.md / curriculum-content.md / code-audit-methodology.md / perf-optimization-methodology.md 由对应守护测试或独立流程维护。
6. **遵循 AGENTS.md**：文档内的 markdown 链接用 `file:///workspace/...` 格式（IDE 可点击）。
7. **视角切换**：PRODUCT.md 用乔布斯视角（少即是多、说人话）；ARCHITECTURE.md 用卡帕西视角（系统思维、第一性原理）。

---

## 触发示例

- "更新基础文档"
- "同步文档和代码"
- "文档过时了，刷新一下"
- "update docs"
- "执行 update-docs skill"
- "每次说更新基础文档就执行 skills"（用户原始指令）

每次触发都从 Step 1 开始重新扫描，不复用上一次的结果（代码会变）。
