// app/sitemap.ts
// Next.js Metadata API 生成的 sitemap.xml
//
// 2026-07-27 P1：补齐 SEO 基础设施
//   - 列出公开可索引的静态页面（需登录的 /profile /onboarding 不列）
//   - 动态路由（/u/[username] /learn/[planId]）由用户内容驱动，暂不列
//     （避免低质量/未填充页面被索引，后续可按需扩展）
//   - changeFrequency: weekly —— 内容更新频率中等，让爬虫合理调度
//   - priority：首页 1.0，核心功能页 0.8，文档/导航页 0.6
//
// 2026-07-27 P0-2：修复 trailingSlash 不一致
//   - 站点体检发现 sitemap 中所有 URL 不带尾斜杠
//   - 但 next.config.js 设 trailingSlash: true，导致每个 URL 都 308 重定向
//   - 11 个 URL 全部 308 → 浪费爬虫 crawl budget + SEO 扣分
//   - 修复：除根 / 外所有 URL 末尾加 /（根 / 已含 /，保持原样）
//   - 守护测试：__tests__/seo-metadata-guard.test.ts 同步更新断言
//
// 访问路径：https://devpath-ai.ai-kits.workers.dev/sitemap.xml

import type { MetadataRoute } from "next";

const SITE_URL = "https://devpath-ai.ai-kits.workers.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/learn/list/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/learn/new/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/review/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/interview/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/train/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/favorites/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/mistakes/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/stats/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/rest/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/docs/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
