"use client";

// lib/hooks/use-ask-ai.tsx
// 选中文字后弹出"问 AI"按钮的可复用 React hook
//
// 设计目的（卡帕西视角）：
//   - 把原本耦合在 components/CodeBlock.tsx 的 AskAIFloatingButton 逻辑提取为可复用 hook
//   - 任何需要"选文字问 AI"的容器只需：
//       const { containerRef, floatingButton } = useAskAI({ onAskAI: handleAsk });
//       <div ref={containerRef}>...文本内容...</div>
//       {floatingButton}
//   - 单一职责：hook 只管 selection 监听 + 位置计算 + 按钮渲染；onAskAI 回调由业务方定义
//   - SSR 安全：useEffect 内才注册 document/window 监听，render 阶段不访问 window
//   - 性能：onAskAI 用 ref 保存最新引用，避免每次回调变化都重注册 selectionchange
//
// 设计目的（乔布斯视角）：
//   - 选中文字 → 出现"问 AI"按钮 → 一键把选中内容发给 AI
//   - 不让用户思考"在哪里问 AI"——任何能看到文字的地方都能问
//   - 按钮位置避开系统原生 selection 菜单（见下方"遮挡修复"）
//
// 遮挡修复（解决"问 AI 按钮被系统选中后的快捷弹框挡住"问题）：
//   - 移动端浏览器（iOS Safari / Android Chrome）在用户长按选择文字后会弹出一个原生
//     "复制/分享/查询"菜单，这个菜单通常出现在选中范围的**上方**
//   - 原方案把按钮放在 rect.top - 6（上方），与原生菜单位置冲突 → 被遮挡
//   - 修复策略：
//       1) 默认把按钮放在选中范围的**下方**（rect.bottom + 6），避开上方原生菜单
//       2) 若下方空间不足（viewport - rect.bottom < 60），回退到上方
//       3) z-index 提到 9999，高于一般浮层（FloatingChat z-50、Modal z-70）
//       4) 按钮 onMouseDown preventDefault，避免点击时 selection 被破坏
//   - 桌面端无原生 selection 菜单（只有右键 context menu，不冲突），下方位置也符合视觉习惯

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

export interface UseAskAIOptions {
  /** 选中文字并点击"问 AI"按钮时触发（参数为选中的纯文本） */
  onAskAI: (selectedText: string) => void;
  /**
   * 是否启用（默认 true）。
   * 设为 false 时不监听 selection，不渲染按钮（如聊天流式输出中临时关闭）。
   */
  enabled?: boolean;
}

export interface UseAskAIResult<T extends HTMLElement = HTMLDivElement> {
  /** 绑定到容器元素的 ref（用于检测选中范围是否在容器内）
   *  泛型 T 默认 HTMLDivElement，可传 HTMLButtonElement / HTMLSpanElement 等以匹配 ref 类型 */
  containerRef: RefObject<T | null>;
  /** 浮动按钮 React 节点（fixed 定位，位置由 hook 内部计算；在容器内任意位置渲染即可） */
  floatingButton: ReactNode;
}

/** 按钮距选中范围边缘的间距（px） */
const BUTTON_OFFSET_PX = 6;
/** 按钮估算高度（px），用于判断下方空间是否足够 */
const BUTTON_HEIGHT_PX = 32;
/** 选中范围过小阈值（< 5px 视为误触，不显示按钮） */
const MIN_SELECTION_PX = 5;
/** 浮动按钮 z-index：高于 FloatingChat(z-50) / Modal(z-70) / PomodoroWidget(z-80) */
const BUTTON_Z_INDEX = 9999;

/**
 * 选中文字后弹出"问 AI"按钮。
 *
 * 用法：
 * ```tsx
 * const { containerRef, floatingButton } = useAskAI({
 *   onAskAI: (text) => openChatModal({ prefill: `关于这段内容：\n\n> ${text}\n\n请帮我深入理解。` }),
 * });
 * return (
 *   <div ref={containerRef}>
 *     {answerText}
 *     {floatingButton}
 *   </div>
 * );
 * ```
 *
 * 泛型：默认 T = HTMLDivElement。若容器是 <button>/<span> 等，可显式指定：
 * ```tsx
 * const { containerRef } = useAskAI<HTMLButtonElement>({ onAskAI: ... });
 * <Button ref={containerRef}>...</Button>
 * ```
 */
export function useAskAI<T extends HTMLElement = HTMLDivElement>({
  onAskAI,
  enabled = true,
}: UseAskAIOptions): UseAskAIResult<T> {
  const containerRef = useRef<T | null>(null);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
    placeAbove: boolean;
  } | null>(null);

  // 用 ref 保存最新的 onAskAI / enabled，避免每次回调变化都重注册 document 监听
  const onAskAIRef = useRef(onAskAI);
  onAskAIRef.current = onAskAI;

  useEffect(() => {
    if (!enabled) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPosition(null);
        return;
      }
      const container = containerRef.current;
      if (!container) {
        setPosition(null);
        return;
      }
      const range = sel.getRangeAt(0);
      // 选中范围必须在容器内才显示按钮
      if (!container.contains(range.commonAncestorContainer)) {
        setPosition(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      // 选中范围过小不显示，避免误触
      if (rect.width < MIN_SELECTION_PX || rect.height < MIN_SELECTION_PX) {
        setPosition(null);
        return;
      }
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom;
      // 默认放下方（避开移动端原生 selection 菜单，菜单通常在选中范围上方）
      // 下方空间不足时回退到上方
      const placeAbove = spaceBelow < BUTTON_HEIGHT_PX + BUTTON_OFFSET_PX;
      const x = rect.left + rect.width / 2;
      const y = placeAbove ? rect.top - BUTTON_OFFSET_PX : rect.bottom + BUTTON_OFFSET_PX;
      setPosition({ x, y, placeAbove });
    };

    // selectionchange 是 document 级事件（浏览器不会在元素上派发）
    document.addEventListener("selectionchange", updatePosition);
    // 滚动 / 窗口尺寸变化时也要更新位置（选中范围相对 viewport 改变）
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("selectionchange", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [enabled]);

  const handleClick = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString();
    if (!text.trim()) return;
    onAskAIRef.current(text);
    // 清空选中，按钮自然消失
    sel.removeAllRanges();
  }, []);

  const floatingButton = useMemo(() => {
    if (!position) return null;
    // placeAbove: translate(-50%, -100%) 把按钮整体放到坐标上方
    // placeBelow (默认): translate(-50%, 0) 把按钮顶部贴到坐标
    const transform = position.placeAbove
      ? "translate(-50%, -100%)"
      : "translate(-50%, 0)";
    return (
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform,
          zIndex: BUTTON_Z_INDEX,
        }}
      >
        <Button
          size="sm"
          onClick={handleClick}
          // 关键：阻止 mousedown 默认行为，避免点击按钮时 selection 被破坏
          // （浏览器在 mousedown 时会清空当前 selection，导致 handleClick 取不到选中文字）
          onMouseDown={(e) => e.preventDefault()}
          className="shadow-floating rounded-pill px-2.5 py-1 h-7 text-2xs bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="把选中内容发送给 AI"
        >
          <Icon name="sparkles" className="w-3 h-3" />
          问 AI
        </Button>
      </div>
    );
  }, [position, handleClick]);

  return { containerRef, floatingButton };
}
