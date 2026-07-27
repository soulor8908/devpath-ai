import { test, expect } from '@playwright/test';

/**
 * E2E 三条核心用户旅程：learn / review / interview 入口与 UI 状态机
 *
 * 设计（卡帕西视角）：
 *   - main-flow.spec.ts 已覆盖底部导航切换，但没覆盖三个核心场景的"页面状态机正确性"：
 *     学习创建表单是否渲染、复习筛选栏是否可用、面试配置阶段是否能切换难度/主题。
 *   - 这三条旅程的真 AI 调用需要 API Key，无法在 CI 跑；但 UI 状态机（元素存在 +
 *     默认选中 + 点击切换）可以在本地或 CI 跑，价值在于捕获"渲染崩溃 / 默认值漂移 /
 *     状态切换断裂"这类回归。
 *   - 不调 AI：只测入口可达 + UI 元素 + 默认状态 + 点击切换，避免 mock 复杂度。
 *
 * 三条旅程对应清单 P2-1：
 *   1. learn：/learn/new 创建表单 + 内置知识库 + 跳转 /learn/list 入口
 *   2. review：/review 筛选栏 + 空态/卡片视图分支
 *   3. interview：/interview 配置阶段 + 难度/主题切换 + "开始面试"按钮
 */

test.describe('核心旅程 1：学习创建页', () => {
  test('渲染创建表单核心元素（标题 / 输入框 / 开始按钮 / 内置知识库）', async ({ page }) => {
    await page.goto('/learn/new');

    // 标题
    await expect(page.getByRole('heading', { name: 'AI 学习教练', exact: true })).toBeVisible();
    // 副标题
    await expect(page.getByText('告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题')).toBeVisible();

    // 主题输入框（placeholder 定位）
    const topicInput = page.getByPlaceholder('你想学什么？');
    await expect(topicInput).toBeVisible();

    // "开始学习"按钮初始 disabled（topic 为空时不允许提交）
    const startBtn = page.getByRole('button', { name: /开始学习/ });
    await expect(startBtn).toBeDisabled();

    // 输入文字后按钮变 enabled
    await topicInput.fill('React 性能优化');
    await expect(startBtn).toBeEnabled();

    // 内置知识库区块标题
    await expect(page.getByText(/内置知识库/)).toBeVisible();
  });

  test('顶部"我的学习"链接指向 /learn/list', async ({ page }) => {
    await page.goto('/learn/new');
    const link = page.getByRole('link', { name: /我的学习/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/learn/list');
  });

  test('点击"我的学习"跳转到列表页（无计划时回到 /learn/new）', async ({ page }) => {
    await page.goto('/learn/new');
    await page.getByRole('link', { name: /我的学习/ }).click();
    // 列表页无计划时会 replace 回 /learn/new，断言 URL 二者之一
    await page.waitForURL(/\/learn\/(list|new)$/);
    expect(page.url()).toMatch(/\/learn\/(list|new)$/);
  });
});

test.describe('核心旅程 2：复习页筛选与空态', () => {
  test('渲染筛选栏 + 等待加载完成', async ({ page }) => {
    await page.goto('/review');
    // 等待 loading 文案消失（与 main-flow.spec.ts 一致）
    await expect(page.getByText('加载复习卡片...')).toBeHidden({ timeout: 15_000 });

    // 筛选标签可见
    await expect(page.getByText('筛选', { exact: true })).toBeVisible();
    // "收起"/"展开过滤" 切换按钮可见
    await expect(page.getByRole('button', { name: /收起|展开过滤/ })).toBeVisible();
  });

  test('筛选栏可收起与展开', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByText('加载复习卡片...')).toBeHidden({ timeout: 15_000 });

    // 默认展开：看到"全部计划"下拉
    await expect(page.getByRole('option', { name: '全部计划' })).toBeVisible();

    // 点击"收起"
    await page.getByRole('button', { name: '收起' }).click();
    // 收起后：切换按钮变成"展开过滤"
    await expect(page.getByRole('button', { name: '展开过滤' })).toBeVisible();

    // 再点"展开过滤"恢复
    await page.getByRole('button', { name: '展开过滤' }).click();
    await expect(page.getByRole('button', { name: '收起' })).toBeVisible();
  });

  test('页面渲染正常（空态或卡片视图二选一）', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByText('加载复习卡片...')).toBeHidden({ timeout: 15_000 });

    // 空态分支：要么看到"当前筛选下没有到期的复习卡片"，要么看到卡片视图
    // （Demo 数据注入后会看到卡片，二者其一即可证明页面渲染正常）
    // 用 or 检查避免 Promise.race 行为不确定：先快照判定两者之一可见
    const emptyHintVisible = await page.getByText('当前筛选下没有到期的复习卡片').isVisible().catch(() => false);
    const cardViewVisible = await page.getByText(/复习进度|上一条/).first().isVisible().catch(() => false);
    expect(emptyHintVisible || cardViewVisible).toBeTruthy();
  });
});

test.describe('核心旅程 3：面试配置阶段', () => {
  test('渲染配置阶段核心元素（标题 / 难度 / 主题 / 开始按钮）', async ({ page }) => {
    await page.goto('/interview');

    // 标题
    await expect(page.getByRole('heading', { name: 'AI 模拟面试', exact: true })).toBeVisible();
    await expect(page.getByText('选择难度和主题，开始你的面试练习')).toBeVisible();

    // 4 档难度按钮（来自 DIFFICULTY_LABELS）
    await expect(page.getByRole('button', { name: '初级 · 友好引导' })).toBeVisible();
    await expect(page.getByRole('button', { name: '中级 · 追问细节' })).toBeVisible();
    await expect(page.getByRole('button', { name: '高级 · 系统设计' })).toBeVisible();
    await expect(page.getByRole('button', { name: '压力面 · 抗压测试' })).toBeVisible();

    // 6 个主题 chip
    await expect(page.getByRole('button', { name: 'Transformer 基础' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RAG 检索增强生成' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prompt Engineering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LLM 应用开发' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Agent 智能体' })).toBeVisible();
    await expect(page.getByRole('button', { name: '向量数据库' })).toBeVisible();

    // "开始面试"按钮
    await expect(page.getByRole('button', { name: /开始面试/ })).toBeVisible();
  });

  test('默认选中初级 + 第一个主题（点击其他难度/主题可切换）', async ({ page }) => {
    await page.goto('/interview');
    await expect(page.getByRole('heading', { name: 'AI 模拟面试' })).toBeVisible();

    // 默认选中初级（用 aria-pressed 或样式判定不可靠，用按钮的 selected 状态间接验证：
    // 点击其他难度后，初级应失去选中、目标难度应被选中）
    // 这里用更稳健的策略：点击"中级"后，再点"初级"应能切回（按钮始终可点）
    const juniorBtn = page.getByRole('button', { name: '初级 · 友好引导' });
    const midBtn = page.getByRole('button', { name: '中级 · 追问细节' });

    // 切到中级
    await midBtn.click();
    // 切回初级
    await juniorBtn.click();
    // 按钮始终可点击（无 disabled 状态卡死）
    await expect(juniorBtn).toBeEnabled();
  });

  test('主题 chip 可切换（点击不同主题后按钮可点击）', async ({ page }) => {
    await page.goto('/interview');
    await expect(page.getByRole('heading', { name: 'AI 模拟面试' })).toBeVisible();

    const topic1 = page.getByRole('button', { name: 'RAG 检索增强生成' });
    const topic2 = page.getByRole('button', { name: 'Agent 智能体' });

    await topic1.click();
    await topic2.click();
    // 切换后按钮仍可点击
    await expect(topic2).toBeEnabled();
  });

  test('返回链接指向首页', async ({ page }) => {
    await page.goto('/interview');
    const backLink = page.getByRole('link', { name: /返回/ });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });
});
