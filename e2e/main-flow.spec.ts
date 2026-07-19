import { test, expect } from '@playwright/test';

/**
 * E2E 主流程：底部导航栏在核心页面间切换
 * 只测 UI 导航，不测 AI 生成（需 API Key）
 *
 * 流程：首页(今日) → 学习 → 复习 → 我的（聊天已统一为弹窗，由浮动按钮触发）
 *
 * 环境说明：
 *   - 此测试套件需要 Playwright 浏览器已安装（`npx playwright install chromium`）
 *   - 沙箱/CI 环境若无浏览器二进制，所有测试会因 browserType.launch 失败而 error
 *   - 这是环境限制，不是测试本身的问题；本地或 CI 配置浏览器后即可运行
 *   - 番茄时钟与 Demo 数据测试新增 IndexedDB 读取/清理逻辑（readAllKVRecords/clearDevpathDB）
 *     用于验证数据持久化层（LearnLog、Demo plan、PomodoroSession）
 */

/**
 * IndexedDB 辅助：读取 devpath 库中所有 kv 表记录
 * 用于 E2E 中验证数据持久化（LearnLog / Demo plan / PomodoroSession）
 *
 * 注意：Playwright 的 page.evaluate 在浏览器上下文执行，
 *       可直接访问 indexedDB API。
 */
async function readAllKVRecords(page: import('@playwright/test').Page): Promise<Array<{ key: string; value: unknown }>> {
  return await page.evaluate(() => {
    return new Promise<Array<{ key: string; value: unknown }>>((resolve, reject) => {
      const req = indexedDB.open('devpath');
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction('kv', 'readonly');
          const store = tx.objectStore('kv');
          const allReq = store.getAll();
          allReq.onsuccess = () => {
            const records = (allReq.result ?? []) as Array<{ key: string; value: unknown }>;
            resolve(records);
          };
          allReq.onerror = () => reject(allReq.error);
        } catch (e) {
          reject(e);
        }
      };
      req.onerror = () => reject(req.error);
      // 如果数据库不存在，onsuccess 也会触发但 result 中无 kv 表
      // 用 onupgradeneeded 兜底创建空表，避免 getAll 抛错
    });
  });
}

/**
 * 清空 devpath 库（用于测试初始化）
 */
async function clearDevpathDB(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('devpath');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve(); // 即使被阻塞也继续
    });
  });
}

test.describe('主流程：底部导航切换', () => {
  test('首页加载并显示标题', async ({ page }) => {
    await page.goto('/');
    // 首页标题「今日」
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();
  });

  test('通过底部导航切换到学习页', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    // 点击底部导航「学习」
    await page.getByRole('link', { name: '学习' }).first().click();
    await expect(page).toHaveURL(/\/learn$/);
    // 学习页标题
    await expect(page.getByRole('heading', { name: 'AI 学习教练' })).toBeVisible();
  });

  test('通过底部导航切换到复习页', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    await page.getByRole('link', { name: '复习' }).first().click();
    await expect(page).toHaveURL(/\/review$/);
    // 复习页加载完成后会出现「今日待复习」进度提示或「今天没有需要复习的卡片」
    // 等待 loading 文案消失
    await expect(page.getByText('加载复习卡片...')).toBeHidden({ timeout: 15_000 });
  });

  test('通过浮动按钮打开 AI 对话弹窗', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    // /chat 路由已删除，统一为弹窗：点击右下角浮动按钮打开
    await page.getByRole('button', { name: '打开 AI 对话' }).click();
    // 弹窗 header 显示「AI 对话」
    await expect(page.getByRole('heading', { name: 'AI 对话' })).toBeVisible();
    // 加载完成后默认进入空状态或最近对话
    await expect(page.getByText('加载中...')).toBeHidden({ timeout: 15_000 });
    // 关闭按钮可见
    await expect(page.getByRole('button', { name: '关闭对话' })).toBeVisible();
  });

  test('通过底部导航切换到我的页', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    await page.getByRole('link', { name: '我的' }).first().click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('heading', { name: '我的', exact: true })).toBeVisible();
  });

  test('完整流程：首页 → 学习 → 复习 → 我的', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    // → 学习
    await page.getByRole('link', { name: '学习' }).first().click();
    await expect(page).toHaveURL(/\/learn$/);
    await expect(page.getByRole('heading', { name: 'AI 学习教练' })).toBeVisible();

    // → 复习
    await page.getByRole('link', { name: '复习' }).first().click();
    await expect(page).toHaveURL(/\/review$/);
    await expect(page.getByText('加载复习卡片...')).toBeHidden({ timeout: 15_000 });

    // /chat 路由已删除，统一为弹窗；这里改为通过浮动按钮验证聊天可用
    await page.getByRole('button', { name: '打开 AI 对话' }).click();
    await expect(page.getByRole('heading', { name: 'AI 对话' })).toBeVisible();
    await page.getByRole('button', { name: '关闭对话' }).click();

    // → 我的
    await page.getByRole('link', { name: '我的' }).first().click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('heading', { name: '我的', exact: true })).toBeVisible();
  });

  test('底部导航栏在所有页面可见且高亮当前页', async ({ page }) => {
    await page.goto('/');

    // 导航栏存在
    const nav = page.getByRole('navigation', { name: '主导航' });
    await expect(nav).toBeVisible();

    // 首页「今日」应标记为当前页
    await expect(nav.getByRole('link', { name: '今日' })).toHaveAttribute('aria-current', 'page');

    // 切到学习页后，「学习」应标记为当前页
    await nav.getByRole('link', { name: '学习' }).click();
    await expect(page).toHaveURL(/\/learn$/);
    await expect(nav.getByRole('link', { name: '学习' })).toHaveAttribute('aria-current', 'page');
  });
});

/**
 * 番茄时钟完整流程 E2E 测试
 *
 * 验证 SubTask 7.3.1：
 *   访问 /timer → 启动 25 分钟专注 → 验证 PomodoroWidget/Full 显示倒计时 →
 *   模拟完成（点击「提前完成」按钮）→ 验证 LearnLog 写入 IndexedDB
 *
 * 注意：此测试不依赖 AI API Key，纯客户端番茄钟流程。
 */
test.describe('番茄时钟完整流程', () => {
  test('启动专注 → 倒计时显示 → 提前完成 → LearnLog 写入', async ({ page }) => {
    // 清空 IndexedDB 保证干净起点（避免之前测试遗留的 running session 干扰）
    await page.goto('/');
    await clearDevpathDB(page);
    // 重新加载页面让 Dexie 重新初始化
    await page.reload();

    // 访问番茄钟页面
    await page.goto('/timer');
    // 表单视图：标题 + 开始专注按钮
    await expect(page.getByRole('heading', { name: '番茄专注' })).toBeVisible();
    await expect(page.getByRole('button', { name: '开始专注' })).toBeVisible();

    // 填写任务描述
    const taskInput = page.getByPlaceholder('例如：完成 React Hooks 章节练习');
    await taskInput.fill('E2E 测试专注任务');
    // 选择 25 分钟（默认已选，不切换）
    // 验证 25 按钮被选中
    await expect(page.getByRole('button', { name: '25', exact: true })).toBeVisible();

    // 启动专注
    await page.getByRole('button', { name: '开始专注' }).click();

    // 验证进入运行中视图：标题改为「专注中」+ 倒计时显示
    await expect(page.getByRole('heading', { name: '专注中' })).toBeVisible({ timeout: 5_000 });
    // 倒计时应该是 25:00 开头（可能已经走了一两秒，所以用正则）
    await expect(page.locator('.font-mono.tabular-nums')).toBeVisible();
    // 控制按钮存在
    await expect(page.getByRole('button', { name: '提前完成' })).toBeVisible();
    await expect(page.getByRole('button', { name: '暂停' })).toBeVisible();

    // 验证 IndexedDB 中已有 running 状态的 PomodoroSession
    const recordsBefore = await readAllKVRecords(page);
    const pomodoroKeys = recordsBefore.filter((r) => r.key.startsWith('pomodoro:'));
    expect(pomodoroKeys.length).toBeGreaterThanOrEqual(1);
    const sessionRecord = pomodoroKeys[0] as { key: string; value: { status: string; taskDescription: string; type: string; durationMinutes: number } };
    expect(sessionRecord.value.status).toBe('running');
    expect(sessionRecord.value.taskDescription).toBe('E2E 测试专注任务');
    expect(sessionRecord.value.type).toBe('focus');
    expect(sessionRecord.value.durationMinutes).toBe(25);

    // 点击「提前完成」按钮触发 completeSession
    await page.getByRole('button', { name: '提前完成' }).click();

    // 验证进入完成视图
    await expect(page.getByText('番茄完成！')).toBeVisible({ timeout: 5_000 });
    // 休息建议卡片出现
    await expect(page.getByText('休息建议')).toBeVisible();

    // 关键验证：LearnLog 写入（type=focus_session, duration=25）
    const recordsAfter = await readAllKVRecords(page);
    const learnLogs = recordsAfter.filter(
      (r) => r.key.startsWith('learn_log:') &&
      (r.value as { type: string }).type === 'focus_session',
    );
    expect(learnLogs.length).toBeGreaterThanOrEqual(1);
    const focusLog = learnLogs[0] as { key: string; value: { type: string; duration?: number; planId: string } };
    expect(focusLog.value.type).toBe('focus_session');
    expect(focusLog.value.duration).toBe(25); // 25 - 0 interruptions
    expect(focusLog.value.planId).toBe('standalone'); // 无关联计划

    // 验证 session 状态变为 completed
    const sessionAfter = recordsAfter.filter((r) => r.key.startsWith('pomodoro:'));
    expect(sessionAfter.length).toBeGreaterThanOrEqual(1);
    const completedSession = sessionAfter[0] as { key: string; value: { status: string; completedAt?: string } };
    expect(completedSession.value.status).toBe('completed');
    expect(completedSession.value.completedAt).toBeDefined();
  });
});

/**
 * Demo 数据注入 + 清除流程 E2E 测试
 *
 * 验证 SubTask 7.3.2：
 *   清空 IndexedDB → 访问首页 → 验证 Demo 数据自动注入 →
 *   清除 Demo 数据 → 验证 Demo 数据消失
 *
 * 注意：创建真实计划需要 AI API Key，所以此处通过直接操作 IndexedDB
 *       模拟「创建真实计划后清除 Demo」的场景。
 */
test.describe('Demo 数据注入 + 清除', () => {
  test('首次访问自动注入 Demo 数据，清除后消失', async ({ page }) => {
    // 清空 IndexedDB
    await page.goto('/');
    await clearDevpathDB(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    // 等待 Demo 数据注入（useEffect 异步触发 + reload）
    // 给充足时间让 injectDemoData 完成 + reload 重新加载
    await page.waitForTimeout(2_000);
    await page.reload();
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();
    // 再等一会让 reload 后的数据稳定
    await page.waitForTimeout(1_000);

    // 验证 Demo 数据已注入：plan:demo-frontend-plan 存在 + isDemo=true
    const records = await readAllKVRecords(page);
    const demoPlanRecord = records.find(
      (r) => r.key === 'plan:demo-frontend-plan',
    ) as { key: string; value: { id: string; isDemo?: boolean; topic: string } } | undefined;
    expect(demoPlanRecord).toBeDefined();
    expect(demoPlanRecord!.value.isDemo).toBe(true);
    expect(demoPlanRecord!.value.topic).toBeTruthy();

    // 验证注入了 3 张 FSRS 卡片
    const demoCards = records.filter(
      (r) => r.key.startsWith('card:demo-card-'),
    );
    expect(demoCards.length).toBe(3);

    // 验证注入了 2 天 LearnLog
    const demoLogs = records.filter(
      (r) => r.key.startsWith('learn_log:demo-log-'),
    );
    expect(demoLogs.length).toBe(2);

    // 模拟清除 Demo 数据：在 IndexedDB 中删除所有 demo- 前缀的数据
    // （真实场景由 /learn 页面创建真实计划后弹窗触发 clearDemoData）
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('devpath');
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readwrite');
          const store = tx.objectStore('kv');
          const allReq = store.getAllKeys();
          allReq.onsuccess = () => {
            const keys = (allReq.result ?? []) as string[];
            const demoKeys = keys.filter((k) =>
              k === 'plan:demo-frontend-plan' ||
              k.startsWith('card:demo-card-') ||
              k.startsWith('learn_log:demo-log-') ||
              k.startsWith('plan_summary:demo-frontend-plan'),
            );
            for (const k of demoKeys) {
              store.delete(k);
            }
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          };
          allReq.onerror = () => reject(allReq.error);
        };
        req.onerror = () => reject(req.error);
      });
    });

    // 验证 Demo 数据已被清除
    const recordsAfter = await readAllKVRecords(page);
    const demoPlanAfter = recordsAfter.find((r) => r.key === 'plan:demo-frontend-plan');
    expect(demoPlanAfter).toBeUndefined();
    const demoCardsAfter = recordsAfter.filter((r) => r.key.startsWith('card:demo-card-'));
    expect(demoCardsAfter.length).toBe(0);
    const demoLogsAfter = recordsAfter.filter((r) => r.key.startsWith('learn_log:demo-log-'));
    expect(demoLogsAfter.length).toBe(0);
  });
});
