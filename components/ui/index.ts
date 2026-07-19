// components/ui/index.ts
// UI 组件库统一导出（表单 + 展示 + 反馈）
//
// 使用示例：
//   import { Button, Input, FormField, Modal, EmptyState } from "@/components/ui";
//
// 设计原则（乔布斯视角）：
//   - 13 个核心组件覆盖 95% UI 场景：8 表单 + 5 展示/反馈
//   - 视觉语言统一：圆角 rounded-lg / 焦点环 ring-blue-500/40 / 错误态 border-red-500
//   - 状态语义完整：hover / active / focus / disabled / error / loading / empty
//
// 设计原则（卡帕西视角）：
//   - 所有组件 forwardRef，可被 form lib / 聚焦逻辑引用
//   - props extends 原生 HTML 属性，不破坏既有 API
//   - 零新依赖（不引 clsx / cva / tailwind-merge）
//   - 护栏：no-native-form-elements.test.ts 确保组件库外无原生表单元素

// ============ 表单组件 ============
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { Input, type InputProps } from "./Input";
export { Textarea, type TextareaProps } from "./Textarea";
export { Select, type SelectProps } from "./Select";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Switch, type SwitchProps } from "./Switch";
export { FormField, type FormFieldProps } from "./FormField";
export { Slider, type SliderProps } from "./Slider";

// ============ 展示/反馈组件（UI 体检报告 Stage 2 新增）============
// LinkButton：Link 当按钮用，与 Button 共享 variant/size（M3 修复）
export { LinkButton, type LinkButtonProps } from "./LinkButton";
// Modal：统一模态，内置 focus trap + ESC + 焦点恢复（C5/m5 修复）
export { Modal, type ModalProps, type ModalSize } from "./Modal";
// EmptyState：统一空状态，icon + title + description + action（M4 修复）
export { EmptyState, type EmptyStateProps } from "./EmptyState";
// Skeleton：统一加载态，text/rect/card/avatar + shimmer（M5 修复）
export {
  Skeleton,
  SkeletonCard,
  type SkeletonProps,
  type SkeletonVariant,
} from "./Skeleton";
// Kbd：统一键盘按键样式（m8 修复）
export { Kbd, type KbdProps, type KbdSize } from "./Kbd";
