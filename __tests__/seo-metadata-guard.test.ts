// __tests__/seo-metadata-guard.test.ts
// SEO 元数据守护测试（2026-07-27 P1）
//
// 历史根因：
//   app/layout.tsx 只有最基本的 title + description + manifest，
//   无 metadataBase / openGraph / twitter / canonical / robots，
//   导致：
//   - 分享到微信/钉钉/Slack 等无卡片预览（仅显示 URL）
//   - 搜索引擎无法理解站点结构（无 canonical 容易重复内容判罚）
//   - og:image 缺失，社交分享转化率低
//   app/sitemap.ts 与 app/robots.ts 也缺失，爬虫无法发现新页面。
//
// 闭环解法：
//   1. layout.tsx 用 Next.js Metadata API 补齐 openGraph / twitter /
//      metadataBase / canonical / robots
//   2. app/sitemap.ts 输出 sitemap.xml
//   3. app/robots.ts 输出 robots.txt
//
// 检测策略：源码级别扫描，防止未来被误删或弱化
//   - 防止"误删 openGraph 配置"
//   - 防止"误删 metadataBase"（relative URL 不被社交平台识别）
//   - 防止"误删 sitemap.ts / robots.ts"
//   - 防止"误删 og:image / twitter:card"
//   - 测试即文档：每条断言说明一个必须存在的 SEO 元数据

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const LAYOUT = readFileSync(resolve(__dirname, "../app/layout.tsx"), "utf-8");

describe("app/layout.tsx SEO 元数据守护", () => {
  it("必须配置 metadataBase（让相对路径解析为绝对 URL）", () => {
    expect(LAYOUT).toContain("metadataBase");
    expect(LAYOUT).toContain("new URL(");
  });

  it("必须有 openGraph 配置（社交分享卡片）", () => {
    expect(LAYOUT).toContain("openGraph");
    expect(LAYOUT).toContain("type: \"website\"");
    expect(LAYOUT).toContain("locale: \"zh_CN\"");
    expect(LAYOUT).toContain("siteName");
  });

  it("必须有 og:image（社交平台缩略图）", () => {
    expect(LAYOUT).toContain("images");
    expect(LAYOUT).toMatch(/icon-512\.png|og:image/);
  });

  it("必须有 twitter card 配置", () => {
    expect(LAYOUT).toContain("twitter");
    expect(LAYOUT).toMatch(/card:\s*["']summary/);
  });

  it("必须有 canonical（防重复内容判罚）", () => {
    expect(LAYOUT).toContain("alternates");
    expect(LAYOUT).toContain("canonical");
  });

  it("必须有 robots 元数据（允许索引）", () => {
    expect(LAYOUT).toContain("robots");
    expect(LAYOUT).toContain("index: true");
    expect(LAYOUT).toContain("follow: true");
  });

  it("title 必须支持 template（子页面追加站点名）", () => {
    expect(LAYOUT).toContain("template");
    expect(LAYOUT).toContain("default");
  });
});

describe("app/sitemap.ts 守护", () => {
  const sitemapPath = resolve(__dirname, "../app/sitemap.ts");
  it("文件必须存在（Next.js 自动映射到 /sitemap.xml）", () => {
    expect(existsSync(sitemapPath)).toBe(true);
  });

  it("必须列出核心公开页面（首页 + 学习 + 复习 + 面试）", () => {
    const content = readFileSync(sitemapPath, "utf-8");
    // 2026-07-27 P0-2：trailingSlash: true 下所有 URL 须带尾斜杠（根 / 除外）
    expect(content).toContain("/learn/list/");
    expect(content).toContain("/review/");
    expect(content).toContain("/interview/");
    expect(content).toContain("/train/");
  });

  it("2026-07-27 P0-2：除根 / 外所有 URL 必须带尾斜杠（防 308 重定向）", () => {
    const content = readFileSync(sitemapPath, "utf-8");
    // 提取所有 url: 行，校验尾斜杠
    const urlLines = content
      .split("\n")
      .filter((l) => l.includes("url:"))
      .map((l) => l.match(/`[^`]*\/`|"[^"]*"/g))
      .flat()
      .filter(Boolean) as string[];
    expect(urlLines.length).toBeGreaterThan(0);
    for (const url of urlLines) {
      // 根 URL 是 `${SITE_URL}/`，其他必须是 `${SITE_URL}/xxx/`
      // 即：除 SITE_URL/ 外，所有都以 / 结尾
      const cleaned = url.replace(/[`"]/g, "");
      // 允许 ${SITE_URL}/ 作为根，其他必须以 / 结尾
      if (cleaned.endsWith("}/`")) continue; // 根 URL ${SITE_URL}/
      expect(cleaned.endsWith("/")).toBe(true);
    }
  });

  it("必须设置 priority 与 changeFrequency", () => {
    const content = readFileSync(sitemapPath, "utf-8");
    expect(content).toContain("priority");
    expect(content).toContain("changeFrequency");
  });
});

describe("app/robots.ts 守护", () => {
  const robotsPath = resolve(__dirname, "../app/robots.ts");
  it("文件必须存在（Next.js 自动映射到 /robots.txt）", () => {
    expect(existsSync(robotsPath)).toBe(true);
  });

  it("必须禁止爬取 /api/ 与用户隐私路径", () => {
    const content = readFileSync(robotsPath, "utf-8");
    expect(content).toContain("disallow");
    expect(content).toContain("/api/");
    expect(content).toContain("/u/");
    expect(content).toContain("/profile");
  });

  it("必须指向 sitemap.xml", () => {
    const content = readFileSync(robotsPath, "utf-8");
    expect(content).toContain("sitemap");
    expect(content).toContain("sitemap.xml");
  });
});
