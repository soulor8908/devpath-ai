// app/docs/loading.tsx
// 文档页路由级加载态（form variant：文档骨架）
import { RouteLoading } from "@/components/RouteLoading";

export default function Loading() {
  return <RouteLoading variant="form" className="max-w-3xl" />;
}
