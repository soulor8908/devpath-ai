// components/ui/index.ts
// 表单组件库统一导出
//
// 使用示例：
//   import { Button, Input, FormField } from "@/components/ui";
//
// 设计原则（乔布斯视角）：
//   - 6 个核心组件覆盖 95% 表单场景
//   - 视觉语言统一：圆角 rounded-lg / 焦点环 ring-blue-500/20 / 错误态 border-red-500
//   - 状态语义完整：hover / active / focus / disabled / error
//
// 设计原则（卡帕西视角）：
//   - 所有组件 forwardRef，可被 form lib / 聚焦逻辑引用
//   - props extends 原生 HTML 属性，不破坏既有 API
//   - 零新依赖（不引 clsx / cva / tailwind-merge）

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { Input, type InputProps } from "./Input";
export { Textarea, type TextareaProps } from "./Textarea";
export { Select, type SelectProps } from "./Select";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Switch, type SwitchProps } from "./Switch";
export { FormField, type FormFieldProps } from "./FormField";
