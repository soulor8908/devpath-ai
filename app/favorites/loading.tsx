// app/favorites/loading.tsx
// 收藏页路由级加载态（list variant：试题集 + 单题列表骨架）
import { RouteLoading } from "@/components/RouteLoading";

export default function Loading() {
  return <RouteLoading variant="list" />;
}
