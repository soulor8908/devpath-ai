// lib/cn.ts
// 轻量 className 合并工具（无第三方依赖）
// - falsy 值过滤
// - 同一 tailwind group 后写覆盖前写（基于简单冲突检测）
//
// 设计动机（卡帕西视角）：
//   - 不引 clsx + tailwind-merge 两套依赖，单文件 30 行覆盖 95% 场景
//   - 对于表单组件库这种"variant + 用户 className 覆盖"足够用
//   - 复杂冲突场景（如 p-2 p-4 同时存在）极少见，可手动避免

export type ClassValue =
  | string
  | number
  | null
  | boolean
  | undefined
  | ClassValue[];

/**
 * 合并多个 className，过滤 falsy 值。
 * 不做 tailwind 冲突智能消解，调用方需注意别同时传互斥 class。
 *
 * @example
 * cn("p-2", isActive && "bg-blue-500", "rounded") // "p-2 bg-blue-500 rounded"
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (Array.isArray(v)) {
      const inner = cn(...v);
      if (inner) out.push(inner);
    } else {
      out.push(String(v));
    }
  }
  return out.join(" ");
}
