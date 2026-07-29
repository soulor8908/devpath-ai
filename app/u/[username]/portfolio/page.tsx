// app/u/[username]/portfolio/page.tsx
// 公开作品集页 —— 访客查看某用户发布的 V4 作品集
//
// 设计：
//   - server route wrapper（保持 edge runtime 一致）
//   - 实际渲染委托给 PortfolioPublicClient（client component，fetch /api/portfolio/[username]）
//
// 与 /u/[username] 主页关系：
//   - 主页是「人 + 学习数据」的分享卡片
//   - 本页是「作品集」的求职资产展示页（V4 验证等级的对外呈现）

import PortfolioPublicClient from "./PortfolioPublicClient";

export const runtime = "edge";

export default function Page() {
  return <PortfolioPublicClient />;
}
