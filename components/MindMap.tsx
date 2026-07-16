"use client";

// components/MindMap.tsx
// 知识树脑图组件（水平树形布局，左→右展开）
// 功能：
// 1. DAG → Tree 转换（节点挂到最深 prereq 下，保证唯一父节点）
// 2. 内部缩放（桌面滚轮 zoom / 移动端两指 pinch zoom + 单指拖拽 pan）
//    使用 touch-action: none 拦截浏览器默认手势，避免外层页面被缩放
// 3. 节点可点击：点击后调用 onSelectNode
// 4. 大厂标记渲染（bigTech=true 的节点用 🏢 + 黄色边框）

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { KnowledgeNode } from "@/lib/types";

interface MindMapProps {
  nodes: KnowledgeNode[];
  topic?: string;
  selectedNodeId?: string;
  onSelectNode?: (node: KnowledgeNode) => void;
  /** 是否填充父容器高度（用于弹窗内嵌场景），默认 false 使用固定 400px 最小高度 */
  fillHeight?: boolean;
}

interface TreeNode {
  node: KnowledgeNode;
  children: TreeNode[];
  leafCount: number;
}

const NODE_W = 180;
const NODE_H = 64;
const COL_GAP = 80;
const ROW_GAP = 12;
const PADDING = 28;

// 计算每个节点的深度（从根到此节点的最长路径长度）
function computeDepth(
  nodeId: string,
  nodeMap: Map<string, KnowledgeNode>,
  depthCache: Map<string, number>,
  visiting: Set<string>
): number {
  if (depthCache.has(nodeId)) return depthCache.get(nodeId)!;
  if (visiting.has(nodeId)) return 0; // 循环依赖
  const node = nodeMap.get(nodeId);
  if (!node) return 0;
  visiting.add(nodeId);
  let maxDepth = 0;
  for (const p of node.prerequisites) {
    if (!nodeMap.has(p)) continue;
    maxDepth = Math.max(maxDepth, computeDepth(p, nodeMap, depthCache, visiting) + 1);
  }
  visiting.delete(nodeId);
  depthCache.set(nodeId, maxDepth);
  return maxDepth;
}

// 构建树：每个节点挂到最深 prereq 下
function buildTree(nodes: KnowledgeNode[]): TreeNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const depthCache = new Map<string, number>();
  nodes.forEach((n) => computeDepth(n.id, nodeMap, depthCache, new Set()));

  const parentOf = new Map<string, string | null>();
  for (const n of nodes) {
    const validPrereqs = n.prerequisites.filter((p) => nodeMap.has(p));
    if (validPrereqs.length === 0) {
      parentOf.set(n.id, null);
    } else {
      const sorted = validPrereqs.sort(
        (a, b) => (depthCache.get(b) ?? 0) - (depthCache.get(a) ?? 0)
      );
      parentOf.set(n.id, sorted[0]);
    }
  }

  const childrenOf = (id: string) =>
    nodes
      .filter((n) => parentOf.get(n.id) === id)
      .sort((a, b) => (a.customOrder ?? 999) - (b.customOrder ?? 999));

  function build(node: KnowledgeNode): TreeNode {
    const kids = childrenOf(node.id).map(build);
    const leafCount = kids.length === 0 ? 1 : kids.reduce((s, k) => s + k.leafCount, 0);
    return { node, children: kids, leafCount };
  }

  return nodes
    .filter((n) => parentOf.get(n.id) === null)
    .sort((a, b) => (a.customOrder ?? 999) - (b.customOrder ?? 999))
    .map(build);
}

interface Positioned {
  id: string;
  x: number;
  y: number;
  node: KnowledgeNode;
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function layout(roots: TreeNode[]): { positions: Positioned[]; edges: Edge[] } {
  const positions: Positioned[] = [];
  const edges: Edge[] = [];
  const ROW_UNIT = NODE_H + ROW_GAP;
  let cursorY = 0;

  function place(tn: TreeNode, depth: number): { topY: number; midY: number; bottomY: number } {
    const x = depth * (NODE_W + COL_GAP);
    if (tn.children.length === 0) {
      const y = cursorY;
      positions.push({ id: tn.node.id, x, y, node: tn.node });
      cursorY += ROW_UNIT;
      return { topY: y, midY: y + NODE_H / 2, bottomY: y + NODE_H };
    }

    const childMids: number[] = [];
    for (const c of tn.children) {
      const m = place(c, depth + 1);
      childMids.push(m.midY);
    }
    const minMid = Math.min(...childMids);
    const maxMid = Math.max(...childMids);
    const avgMid = (minMid + maxMid) / 2;
    let y = avgMid - NODE_H / 2;
    if (y < cursorY) y = cursorY;
    positions.push({ id: tn.node.id, x, y, node: tn.node });
    return { topY: y, midY: y + NODE_H / 2, bottomY: y + NODE_H };
  }

  roots.forEach((r) => place(r, 0));

  const posMap = new Map(positions.map((p) => [p.id, p]));
  function walkEdges(tn: TreeNode) {
    const p = posMap.get(tn.node.id);
    if (!p) return;
    tn.children.forEach((c) => {
      const cp = posMap.get(c.node.id);
      if (cp) {
        edges.push({
          x1: p.x + NODE_W,
          y1: p.y + NODE_H / 2,
          x2: cp.x,
          y2: cp.y + NODE_H / 2,
        });
      }
      walkEdges(c);
    });
  }
  roots.forEach(walkEdges);

  return { positions, edges };
}

const DIFF_BG = ["#dbeafe", "#bfdbfe", "#fde68a", "#fdba74", "#fca5a5"];
const DIFF_BORDER = ["#3b82f6", "#60a5fa", "#f59e0b", "#f97316", "#ef4444"];

export function MindMap({
  nodes,
  selectedNodeId,
  onSelectNode,
  fillHeight = false,
}: MindMapProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  // 缩放与平移状态
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  // 鼠标拖拽中
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 触摸手势状态（两指 pinch zoom + 单指 pan）
  const touchRef = useRef<{
    mode: "pan" | "pinch" | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    initialDist?: number;
    initialScale?: number;
    midX?: number;
    midY?: number;
  } | null>(null);

  const { positions, edges, width, height } = useMemo(() => {
    const roots = buildTree(nodes);
    const { positions, edges } = layout(roots);
    const maxX = positions.reduce((m, p) => Math.max(m, p.x + NODE_W), 0);
    const maxY = positions.reduce((m, p) => Math.max(m, p.y + NODE_H), 0);
    return {
      positions,
      edges,
      width: maxX + PADDING * 2,
      height: maxY + PADDING * 2,
    };
  }, [nodes]);

  // 桌面端滚轮缩放（在容器内拦截，不影响外层页面）
  // 移动端不依赖滚轮，改用 touch 事件实现 pinch zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = -e.deltaY * 0.0015;
    setScale((s) => {
      const next = Math.max(0.3, Math.min(2.5, s + delta * s));
      return next;
    });
  }, []);

  // 鼠标拖拽平移（桌面）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 只对非节点的空白区域响应拖拽
    if (e.target !== e.currentTarget && (e.target as SVGElement).tagName !== "svg") return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: translate.x,
      originY: translate.y,
    };
  }, [translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTranslate({
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ============ 移动端触摸手势 ============
  // 单指 → 平移；双指 → pinch zoom（同时支持平移）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 阻止浏览器默认手势（页面缩放、滚动等）
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = {
        mode: "pan",
        startX: t.clientX,
        startY: t.clientY,
        originX: translate.x,
        originY: translate.y,
      };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      touchRef.current = {
        mode: "pinch",
        startX: midX,
        startY: midY,
        originX: translate.x,
        originY: translate.y,
        initialDist: dist,
        initialScale: scale,
        midX,
        midY,
      };
    }
  }, [translate.x, translate.y, scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // 必须 preventDefault 才能阻止页面级 pinch-to-zoom
    e.preventDefault();
    const t = touchRef.current;
    if (!t) return;

    if (t.mode === "pan" && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - t.startX;
      const dy = touch.clientY - t.startY;
      setTranslate({
        x: t.originX + dx,
        y: t.originY + dy,
      });
    } else if (t.mode === "pinch" && e.touches.length === 2 && t.initialDist && t.initialScale) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / t.initialDist;
      const next = Math.max(0.3, Math.min(2.5, t.initialScale * ratio));
      setScale(next);
      // 同时支持双指平移（按中点位移）
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      const dx = midX - t.startX;
      const dy = midY - t.startY;
      setTranslate({
        x: t.originX + dx,
        y: t.originY + dy,
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    // 手指全部离开时结束手势；从双指变单指时切回 pan 模式
    if (e.touches.length === 0) {
      touchRef.current = null;
    } else if (e.touches.length === 1 && touchRef.current?.mode === "pinch") {
      const t = e.touches[0];
      touchRef.current = {
        mode: "pan",
        startX: t.clientX,
        startY: t.clientY,
        originX: translate.x,
        originY: translate.y,
      };
    }
  }, [translate.x, translate.y]);

  // 重置缩放
  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // 放大/缩小按钮
  const zoomIn = useCallback(() => setScale((s) => Math.min(2.5, s + 0.2)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.3, s - 0.2)), []);

  // 全局 mouseup 监听（处理鼠标拖出容器的情况）
  useEffect(() => {
    const handler = () => { dragRef.current = null; };
    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        暂无知识点
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden ${fillHeight ? "h-full" : ""}`}
      style={{ minHeight: fillHeight ? "100%" : "400px" }}
    >
      {/* 工具栏 - 固定在容器右上角，不随内容滚动 */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg shadow-md p-1 border dark:border-gray-600">
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-lg font-bold"
          aria-label="缩小"
          title="缩小"
        >
          −
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center font-mono">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-lg font-bold"
          aria-label="放大"
          title="放大"
        >
          +
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm"
          aria-label="重置"
          title="重置视图"
        >
          ⟲
        </button>
      </div>

      {/* 缩放提示 */}
      <div className="absolute bottom-2 left-2 z-20 text-[10px] text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
        双指缩放 · 单指拖拽
      </div>

      {/* SVG 画布 */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        // touch-action: none 阻止浏览器默认手势，确保我们的 touch handler 全权处理
        // 这样移动端整页不会被 pinch-to-zoom
        style={{ minHeight: fillHeight ? "100%" : "400px", touchAction: "none" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          style={{ pointerEvents: "none" }}
        >
          <g transform={`translate(${PADDING + translate.x}, ${PADDING + translate.y}) scale(${scale})`}>
            {/* 边 */}
            {edges.map((e, i) => {
              const ctrl = (e.x2 - e.x1) / 2;
              return (
                <path
                  key={i}
                  d={`M ${e.x1} ${e.y1} C ${e.x1 + ctrl} ${e.y1}, ${e.x2 - ctrl} ${e.y2}, ${e.x2} ${e.y2}`}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  fill="none"
                  style={{ pointerEvents: "stroke" }}
                />
              );
            })}
            {/* 节点 */}
            {positions.map((p) => {
              const isSelected = selectedNodeId === p.id;
              const isHover = hoverId === p.id;
              const diff = p.node.difficulty;
              const isBigTech = p.node.bigTech === true;
              const bg = isSelected ? "#0f172a" : isBigTech ? "#fef3c7" : DIFF_BG[diff - 1] || "#e2e8f0";
              const border = isSelected
                ? "#3b82f6"
                : isBigTech
                  ? "#f59e0b"
                  : isHover
                    ? DIFF_BORDER[diff - 1] || "#475569"
                    : "#cbd5e1";
              const fg = isSelected ? "#fff" : "#1e293b";
              const title = p.node.title;
              const truncated = title.length > 12 ? title.slice(0, 12) + "…" : title;
              const qCount = `${p.node.frequency} · ${"★".repeat(diff)}`;
              return (
                <g
                  key={p.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  style={{ cursor: onSelectNode ? "pointer" : "default", pointerEvents: "all" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode?.(p.node);
                  }}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill={bg}
                    stroke={border}
                    strokeWidth={isSelected ? 2.5 : isBigTech ? 2 : isHover ? 2 : 1}
                  />
                  <text x={14} y={26} fontSize={13} fontWeight={600} fill={fg}>
                    {truncated}
                  </text>
                  <text x={14} y={48} fontSize={10} fill={isSelected ? "#cbd5e1" : "#64748b"}>
                    {qCount}
                    {p.node.customOrder ? ` · #${p.node.customOrder}` : ""}
                    {isBigTech ? ` · 大厂` : ""}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
