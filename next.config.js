/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 静态导出（部署时设 NEXT_PUBLIC_STATIC_EXPORT=true）
  // 开发/预览模式保持 undefined 以支持 API routes（output: 'export' 与 API routes 不兼容）
  // 静态导出前需将 app/api/ 迁移到 functions/api/（Cloudflare Pages Functions）
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 2026-07-26 性能优化（卡帕西视角）：
  // experimental.optimizePackageImports 让 Next.js 对 barrel export 友好的库
  // 做 per-module 拆分，只把实际用到的模块打进 chunk，避免全量引入。
  // 这些库的共同特点：默认导出大（recharts/date-fns/ai），但单模块小。
  experimental: {
    optimizePackageImports: [
      "recharts",
      "date-fns",
      "@ai-sdk/openai",
      "zod",
      "nanoid",
      "ts-fsrs",
      "react-activity-calendar",
    ],
  },
  // 2026-07-26 webpack 分包策略：把稳定的 vendor 拆成独立 chunk，提升缓存命中率。
  // - recharts-vendor：recharts + d3 全家桶（~500KB），只在 stats 页用，独立 chunk 后
  //   其他路由不会重复加载
  // - ai-sdk-vendor：ai + @ai-sdk/openai（流式 LLM 调用），只在 chat/interview 等场景用
  // - react-vendor：react + react-dom（每页必用，独立 chunk 后跨页共享）
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = config.optimization.splitChunks || {};
      // 用函数式配置，避免覆盖 Next.js 默认策略（default + vendors chunks）
      if (typeof config.optimization.splitChunks === "object") {
        config.optimization.splitChunks.cacheGroups = {
          ...(config.optimization.splitChunks.cacheGroups || {}),
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-[a-z-]+|victory-vendor|internmap)/,
            name: "recharts-vendor",
            chunks: "all",
            priority: 20,
          },
          "ai-sdk": {
            test: /[\\/]node_modules[\\/](ai|@ai-sdk)/,
            name: "ai-sdk-vendor",
            chunks: "all",
            priority: 20,
          },
        };
      }
    }
    return config;
  },
  // P1.6 路由重定向：8→5 Tab 减法后，旧路由收敛到首页或我的
  // - /dashboard → /profile（统计仪表盘并入「我的」）
  // - /mistakes  保留（阶段 7：学习统计按钮重设计后恢复独立路由）
  // - /emotion   保留（独立情绪页仍可用，只是不在底部导航）
  async redirects() {
    return [
      { source: "/dashboard", destination: "/profile", permanent: true },
    ];
  },
};

module.exports = nextConfig;
