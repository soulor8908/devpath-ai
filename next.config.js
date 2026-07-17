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
