// app/learn/[planId]/edit/loading.tsx
// 计划编辑路由级加载态（form variant：编辑表单骨架）
import { RouteLoading } from "@/components/RouteLoading";

export default function Loading() {
  return <RouteLoading variant="form" />;
}
