// app/robots.ts
// Next.js Metadata API 生成的 robots.txt
//
// 2026-07-27 P1：补齐 SEO 基础设施
//   - 允许全站索引（公开内容都是 SEO 友好的：学习路径/复习/面试等）
//   - 不允许 /api/、/u/（用户个人主页隐私）、/profile、/onboarding（登录后页）
//   - 指向 sitemap.xml
//
// 访问路径：https://devpath-ai.pages.dev/robots.txt

import type { MetadataRoute } from "next";

const SITE_URL = "https://devpath-ai.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/u/", "/profile", "/onboarding", "/learn/[planId]/edit"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
