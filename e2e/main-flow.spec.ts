import { test, expect } from '@playwright/test';

/**
 * E2E 主流程：底部导航栏在核心页面间切换
 * 只测 UI 导航，不测 AI 生成（需 API Key）
 *
 * 流程：首页(今日) → 学习 → 复习 → 聊天(AI) → 我的
 */

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

  test('通过底部导航切换到聊天页', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    // 聊天页 nav label 为「AI」
    await page.getByRole('link', { name: 'AI' }).first().click();
    await expect(page).toHaveURL(/\/chat$/);
    // 聊天页默认标题「新对话」（加载完成后）
    await expect(page.getByText('加载中...')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: '新对话' })).toBeVisible();
  });

  test('通过底部导航切换到我的页', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今日', exact: true })).toBeVisible();

    await page.getByRole('link', { name: '我的' }).first().click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('heading', { name: '我的', exact: true })).toBeVisible();
  });

  test('完整流程：首页 → 学习 → 复习 → 聊天 → 我的', async ({ page }) => {
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

    // → 聊天
    await page.getByRole('link', { name: 'AI' }).first().click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByText('加载中...')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: '新对话' })).toBeVisible();

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
