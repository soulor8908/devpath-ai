// app/learn/[planId]/loading.tsx
// 学习详情页路由级加载态（detail variant：知识树 + 题目骨架）
import { RouteLoading } from "@/components/RouteLoading";

export default function Loading() {
  return <RouteLoading variant="detail" />;
}
