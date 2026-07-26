// app/profile/loading.tsx
// 「我的」页路由级加载态（form variant：个人信息表单骨架）
import { RouteLoading } from "@/components/RouteLoading";

export default function Loading() {
  return <RouteLoading variant="form" className="max-w-2xl" />;
}
