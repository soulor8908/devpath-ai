// app/u/[username]/loading.tsx
// 用户公开主页路由级加载态（detail variant：用户资料 + 数据卡片骨架）
import { RouteLoading } from "@/components/RouteLoading";

export default function Loading() {
  return <RouteLoading variant="detail" />;
}
