# 开发指南

## 环境要求

- Node.js 22+
- npm 10+

## 本地开发

```bash
npm ci
npm run dev
```

## 测试

```bash
# 全部单测
npm test

# 监听模式
npm run test:watch

# 性能基准测试
npm run test:perf

# 覆盖率
npm run test:coverage

# E2E（需先启动 dev server）
npm run test:e2e
```

## 类型检查

```bash
npx tsc --noEmit
```

> 已知 `__tests__/observability.test.ts` 有 2 个 vitest 类型兼容性噪声，与业务代码无关。

## 构建

```bash
npm run build
```

## 添加新的 AI Prompt

1. 在 `lib/ai/prompts.ts` 的 `PROMPTS` 对象中添加条目：

```ts
my_new_prompt: {
  id: "my_new_prompt",
  version: "v1",
  scene: "my_new_prompt" as const,
  system: `你是...`,
  changelog: "v1: 初始版本",
},
```

2. 在 `lib/types.ts` 的 `AIScene` 类型中添加 `"my_new_prompt"`

3. **必须**：在 `__tests__/prompts.test.ts` 的 `PROMPT_VERSION_HASHES` 中添加快照条目

```ts
my_new_prompt: "v1:<hash>",
```

> 运行 `npx vitest run __tests__/prompts.test.ts` 看失败信息里的「实际值」，复制到快照即可。

4. 修改 prompt 内容时，必须 bump `version`（v1→v2）并更新快照，否则 CI 测试失败。

## 添加新的 AI 工具（clientAction）

1. 在 `lib/ai/chat-tools.ts` 的 `tools` 数组中添加工具定义
2. 如果是写入工具（有副作用），必须：
   - 使用 `makeIdempotencyKey(type, params)` 生成幂等键
   - 在返回值中填充 `clientAction.idempotencyKey`
3. 在 `app/chat/ChatClient.tsx` 的 `executeClientAction` 中添加处理分支
4. 写入操作用不可变克隆 + 单次原子写入（参考 `adjust_plan` 的实现）

## 添加新的 IndexedDB 数据类型

1. 在 `lib/types.ts` 定义类型，并添加到 `KEY_PREFIXES`：

```ts
export const KEY_PREFIXES = {
  // ...
  MY_TYPE: "mytype:",
} as const;
```

2. 使用 `setItem(`${KEY_PREFIXES.MY_TYPE}${id}`, value)` 写入
3. 使用 `listItems<MyType>(KEY_PREFIXES.MY_TYPE)` 查询
4. `updatedAt` 字段会被 `setUpdatedAt()` 自动设置，增量同步自动生效

## 能量回归模型

- `lib/energy-config.ts`：配置（最小样本数、重训间隔）
- `lib/energy-collector.ts`：记录样本 + 自动回填
- `lib/energy-regression.ts`：线性回归训练 + 预测
- 首页 `useHomeData` 末尾并行触发 `autoFillTodayActualMinutes()` + `maybeRetrain()`

## 同步引擎

- `lib/sync.ts`：`uploadIncremental()` / `uploadAll()` / `downloadAll()`
- `lib/storage/kv.ts`：KVStore 接口 + `mergeUserBackup` LWW 合并
- `app/api/sync/route.ts`：POST 支持 `mode: "incremental"` 和全量两种模式

## 代码风格

- TypeScript strict mode
- 函数式风格优先（纯函数 + 不可变数据）
- 中文注释（与现有代码库一致）
- 文件头注释说明文件职责
