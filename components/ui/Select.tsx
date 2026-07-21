"use client";

// components/ui/Select.tsx
// 统一下拉选择框 — 自定义 popover 替代原生 <select>
//
// 重新设计动机（用户反馈 + 卡帕西视角）：
//   旧版用原生 <select> + appearance-none + SVG 箭头。
//   问题：原生 select 的「下拉弹层」在不同浏览器/操作系统表现不一致
//     - iOS Safari：弹出 wheel picker，样式与桌面完全不同
//     - Android Chrome：弹出 native bottom sheet
//     - 桌面 Chrome/Firefox/Safari：各自原生弹层，圆角/阴影/字号不一
//   用户反馈："样式太丑了，不同设备的样式不一致"
//
// 新版设计（乔布斯视角：克制即设计）：
//   - 完全自定义 popover：trigger + 弹出列表，跨设备 100% 一致
//   - 视觉与 Input 完全统一（同圆角/边框/焦点环/字号/暗色模式）
//   - 键盘可达：ArrowDown 打开 + 上下选择 + Enter 确认 + ESC 关闭
//   - ARIA 完整：role=listbox/option, aria-expanded, aria-selected, aria-activedescendant
//   - 点击外部关闭 + ESC 关闭 + 焦点恢复到 trigger
//   - 弹出位置自适应：默认在 trigger 下方，下方空间不足时翻转到上方
//
// API 兼容（卡帕西视角：零破坏性升级）：
//   - 调用方继续传 <option value="x">label</option> 作为 children（已 5 处使用）
//   - 内部用 React.Children 解析 <option>，提取 {value, label, disabled}
//   - onChange(e) 收到与原生 select 一致的 shape: { target: { value } }
//   - 不渲染原生 <select>，ref 暴露的是 trigger button（如调用方读取 ref.value
//     会失效——经核查无调用方依赖 ref.value）

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  type SelectHTMLAttributes,
  type ReactNode,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  error?: boolean;
  /** 输入框尺寸 */
  inputSize?: "sm" | "md" | "lg";
  /** 右侧自定义图标（默认 chevron-down） */
  rightIcon?: React.ComponentProps<typeof Icon>["name"];
  /** 占位提示（无 value 时显示） */
  placeholder?: string;
  children?: ReactNode;
}

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs pr-7",
  md: "px-3 py-2 text-sm pr-9",
  lg: "px-4 py-2.5 text-base pr-10",
};

const ICON_SIZE = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const ICON_RIGHT = {
  sm: "right-2",
  md: "right-2.5",
  lg: "right-3",
};

const PANEL_MAX_HEIGHT = 240;

interface OptionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * 递归解析 children 中的 <option> 节点，提取 {value, label, disabled}
 * 支持 <optgroup> 嵌套（展开后丢失分组标题，保留扁平选项）
 */
function parseOptions(children: ReactNode): OptionItem[] {
  const items: OptionItem[] = [];
  const walk = (node: ReactNode): void => {
    if (node == null || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      for (const c of node) walk(c);
      return;
    }
    const el = node as ReactElement<{
      value?: unknown;
      disabled?: boolean;
      children?: ReactNode;
    }>;
    if (el.type === "option") {
      const rawValue = el.props.value;
      const labelFromChildren = el.props.children;
      let label: string;
      if (typeof labelFromChildren === "string") {
        label = labelFromChildren;
      } else if (typeof labelFromChildren === "number") {
        label = String(labelFromChildren);
      } else if (Array.isArray(labelFromChildren)) {
        label = labelFromChildren
          .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : ""))
          .join("");
      } else {
        label = "";
      }
      items.push({
        value: rawValue == null ? "" : String(rawValue),
        label,
        disabled: el.props.disabled === true,
      });
    } else if (el.type === "optgroup") {
      walk(el.props.children);
    }
  };
  walk(children);
  return items;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      className,
      error = false,
      inputSize = "md",
      disabled,
      rightIcon = "chevron-down",
      placeholder,
      children,
      value,
      onChange,
      id,
      "aria-labelledby": ariaLabelledBy,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    // 当前键盘焦点在哪个 option（用于 aria-activedescendant + 视觉高亮）
    const [focusedIndex, setFocusedIndex] = useState(-1);
    // 弹出位置：below | above（根据 viewport 空间动态翻转）
    const [placement, setPlacement] = useState<"below" | "above">("below");

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const options = useMemo(() => parseOptions(children), [children]);
    const currentValue = value == null ? "" : String(value);
    const selectedOption = options.find((o) => o.value === currentValue);
    const displayLabel = selectedOption?.label ?? placeholder ?? "";

    const setTriggerRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [ref],
    );

    // 选中某个 option（模仿原生 select 的 onChange 事件 shape）
    const handleSelect = useCallback(
      (opt: OptionItem) => {
        if (opt.disabled) return;
        // 仅暴露 e.target.value / e.currentTarget.value —— 这是所有调用方实际使用的字段
        // 强制 as ChangeEvent<HTMLSelectElement> 让 TS 满足签名，运行时不构造完整 select 对象
        const syntheticEvent = {
          target: { value: opt.value },
          currentTarget: { value: opt.value },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange?.(syntheticEvent);
        setOpen(false);
        // 焦点恢复到 trigger，便于继续 Tab
        triggerRef.current?.focus();
      },
      [onChange],
    );

    // 打开下拉时：初始化 focusedIndex 到当前选中项，并计算翻转位置
    useLayoutEffect(() => {
      if (!open) return;
      const idx = options.findIndex((o) => o.value === currentValue);
      setFocusedIndex(idx >= 0 ? idx : 0);

      // 计算下方空间是否足够，不足则翻转到上方
      const trigger = triggerRef.current;
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const spaceBelow = viewportH - rect.bottom;
        const spaceAbove = rect.top;
        // 估算需要的高度：每项约 36px + 边框 8px，封顶 PANEL_MAX_HEIGHT
        const needed = Math.min(PANEL_MAX_HEIGHT, options.length * 36 + 8);
        if (spaceBelow < needed && spaceAbove > spaceBelow) {
          setPlacement("above");
        } else {
          setPlacement("below");
        }
      }
    }, [open, options, currentValue]);

    // ESC 关闭 + 点击外部关闭
    useEffect(() => {
      if (!open) return;
      function handleClickOutside(e: MouseEvent) {
        const target = e.target as Node;
        if (
          !triggerRef.current?.contains(target) &&
          !panelRef.current?.contains(target)
        ) {
          setOpen(false);
        }
      }
      function handleEscape(e: KeyboardEvent) {
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open]);

    // 当 focusedIndex 变化时，确保 option 在 panel 可视区内（scroll into view）
    useEffect(() => {
      if (!open || focusedIndex < 0) return;
      const panel = panelRef.current;
      if (!panel) return;
      const option = panel.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`);
      option?.scrollIntoView({ block: "nearest" });
    }, [focusedIndex, open]);

    const openDropdown = useCallback(() => {
      if (disabled) return;
      setOpen((prev) => !prev);
    }, [disabled]);

    const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            setOpen(true);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!open) setOpen(true);
          break;
        case "Tab":
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
      }
    };

    const handlePanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev + 1;
            // 跳过 disabled
            while (next < options.length && options[next].disabled) next++;
            return next < options.length ? next : prev;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            handleSelect(options[focusedIndex]);
          }
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(options.length - 1);
          break;
        case "Tab":
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
      }
    };

    // listbox id 用于 aria-activedescendant 关联 trigger 与 option
    const listboxId = (id ?? "select") + "-listbox";

    return (
      <div className={cn("relative inline-block w-full", className)}>
        {/* trigger button（替代原生 <select>，承载 id 与 aria-*） */}
        <button
          ref={setTriggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabel}
          onClick={openDropdown}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "w-full text-left rounded-lg border bg-white text-gray-900 transition-colors cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:bg-gray-800 dark:text-gray-100",
            SIZE_CLASSES[inputSize],
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600",
            disabled &&
              "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-500",
          )}
        >
          <span
            className={cn(
              "block truncate",
              !selectedOption && "text-gray-400 dark:text-gray-500",
            )}
          >
            {displayLabel || "\u00A0"}
          </span>
        </button>

        {/* 右侧 chevron 图标（trigger 不可点击时也保留视觉） */}
        {!disabled && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-transform",
              ICON_RIGHT[inputSize],
              open && "rotate-180",
            )}
          >
            <Icon name={rightIcon} className={ICON_SIZE[inputSize]} />
          </span>
        )}

        {/* 弹出列表（popover） */}
        {open && !disabled && (
          <div
            ref={panelRef}
            role="listbox"
            id={listboxId}
            tabIndex={-1}
            aria-activedescendant={
              focusedIndex >= 0 ? `${listboxId}-opt-${focusedIndex}` : undefined
            }
            onKeyDown={handlePanelKeyDown}
            className={cn(
              "absolute left-0 right-0 z-50 overflow-y-auto rounded-lg border shadow-modal bg-white",
              "dark:bg-gray-800 dark:border-gray-700",
              "border-gray-200 dark:border-gray-700",
              "animate-fade-in",
              placement === "above" ? "bottom-full mb-1" : "top-full mt-1",
            )}
            style={{ maxHeight: PANEL_MAX_HEIGHT }}
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                无可选项
              </div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = opt.value === currentValue;
                const isFocused = idx === focusedIndex;
                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    id={`${listboxId}-opt-${idx}`}
                    role="option"
                    data-index={idx}
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => !opt.disabled && setFocusedIndex(idx)}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer transition-colors",
                      "text-gray-700 dark:text-gray-200",
                      isFocused && !opt.disabled && "bg-blue-50 dark:bg-blue-900/40",
                      isSelected && "font-medium text-blue-600 dark:text-blue-300",
                      opt.disabled && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate flex-1">{opt.label}</span>
                      {isSelected && (
                        <Icon
                          name="check"
                          className="w-3.5 h-3.5 text-blue-500 shrink-0"
                          aria-hidden
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 隐藏的 native select 用于 form 序列化场景（如 form submit 浏览器读取 value） */}
        {/* aria-hidden + tabIndex=-1 不参与可达性，onChange 由 trigger 处理（no-op 避免重复触发） */}
        <select
          aria-hidden="true"
          tabIndex={-1}
          value={currentValue}
          disabled={disabled}
          onChange={() => {
            /* no-op：onChange 已由 trigger 处理 */
          }}
          className="sr-only"
          {...rest}
        >
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
