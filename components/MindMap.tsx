"use client";

// components/MindMap.tsx
// 知识树脑图组件（水平树形布局，左→右展开，可折叠子树）
//
// 设计（乔布斯视角）：
//   - 节点不截断 title，通过更大节点 + 多行排版解决"看不清"
//   - 支持点击节点切换子树展开/收起（解决"放最大也看不清"的拥挤问题）
//   - 节点右侧有"进入学习"小按钮，点击触发 onSelectNode（与展开区分）
//   - 节点内显示：title（多行）/ 难度星级 / 频率 / 大厂标记 / 掌握度进度条
//   - 工具栏：放大 + 缩小 + 重置 + 全部展开 + 全部收起 + 适配视图
//
// 设计（卡帕西视角）：
//   - DAG → Tree 转换保留（每节点挂到最深 prereq 下）
//   - 折叠态：子树不参与 layout，画布更紧凑
//   - foreignObject 用于 HTML 节点（比纯 SVG text 更易实现多行 + 样式）
//   - 拖拽 + 缩放交互保留（桌面滚轮 + 移动端 pinch）
//   - 节点点击分两个区域：标题区 = 切换展开，"进入"按钮 = onSelectNode

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { KnowledgeNode } from "@/lib/types";

interface MindMapProps {
  nodes: KnowledgeNode[];
  topic?: string;
  selectedNodeId?: string;
  onSelectNode?: (node: KnowledgeNode) => void;
  /** 是否填充父容器高度（用于弹窗内嵌场景），默认 false 使用固定 400px 最小高度 */
  fillHeight?: boolean;
  /** 是否显示"进入学习"按钮（仅在传了 onSelectNode 时生效） */
  showEnterButton?: boolean;
}

interface TreeNode {
  node: KnowledgeNode;
  children: TreeNode[];
  leafCount: number;
}

const NODE_W = 220;
const NODE_H = 96;
const COL_GAP = 60;
const ROW_GAP = 16;
const PADDING = 32;

// 计算每个节点的深度
function computeDepth(
  nodeId: string,
  nodeMap: Map<string, KnowledgeNode>,
  depthCache: Map<string, number>,
  visiting: Set<string>,
): number {
  if (depthCache.has(nodeId)) return depthCache.get(nodeId)!;
  if (visiting.has(nodeId)) return 0;
  const node = nodeMap.get(nodeId);
  if (!node) return 0;
  visiting.add(nodeId);
  let maxDepth = 0;
  for (const p of node.prerequisites) {
    if (!nodeMap.has(p)) continue;
    maxDepth = Math.max(
      maxDepth,
      computeDepth(p, nodeMap, depthCache, visiting) + 1,
    );
  }
  visiting.delete(nodeId);
  depthCache.set(nodeId, maxDepth);
  return maxDepth;
}

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
        (a, b) => (depthCache.get(b) ?? 0) - (depthCache.get(a) ?? 0),
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

// 收集一棵树中所有节点 id（用于全部展开/收起）
function collectAllIds(roots: TreeNode[]): string[] {
  const ids: string[] = [];
  function walk(tn: TreeNode) {
    ids.push(tn.node.id);
    tn.children.forEach(walk);
  }
  roots.forEach(walk);
  return ids;
}

interface Positioned {
  id: string;
  x: number;
  y: number;
  node: KnowledgeNode;
  hasChildren: boolean;
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// 根据 expanded 集合做 layout：折叠的子树不参与布局
function layout(
  roots: TreeNode[],
  expanded: Set<string>,
): { positions: Positioned[]; edges: Edge[] } {
  const positions: Positioned[] = [];
  const edges: Edge[] = [];
  const ROW_UNIT = NODE_H + ROW_GAP;
  let cursorY = 0;

  function place(tn: TreeNode, depth: number): { topY: number; midY: number; bottomY: number } {
    const x = depth * (NODE_W + COL_GAP);
    const isExpanded = expanded.has(tn.node.id);
    // 折叠态：子节点不布局，父节点当作叶子
    const visibleChildren = isExpanded ? tn.children : [];

    if (visibleChildren.length === 0) {
      const y = cursorY;
      positions.push({
        id: tn.node.id,
        x,
        y,
        node: tn.node,
        hasChildren: tn.children.length > 0,
      });
      cursorY += ROW_UNIT;
      return { topY: y, midY: y + NODE_H / 2, bottomY: y + NODE_H };
    }

    const childMids: number[] = [];
    for (const c of visibleChildren) {
      const m = place(c, depth + 1);
      childMids.push(m.midY);
    }
    const minMid = Math.min(...childMids);
    const maxMid = Math.max(...childMids);
    const avgMid = (minMid + maxMid) / 2;
    let y = avgMid - NODE_H / 2;
    if (y < cursorY) y = cursorY;
    positions.push({
      id: tn.node.id,
      x,
      y,
      node: tn.node,
      hasChildren: tn.children.length > 0,
    });
    return { topY: y, midY: y + NODE_H / 2, bottomY: y + NODE_H };
  }

  roots.forEach((r) => place(r, 0));

  const posMap = new Map(positions.map((p) => [p.id, p]));
  function walkEdges(tn: TreeNode, parentExpanded: boolean) {
    if (!parentExpanded) return;
    const p = posMap.get(tn.node.id);
    if (!p) return;
    if (expanded.has(tn.node.id)) {
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
        walkEdges(c, true);
      });
    }
  }
  roots.forEach((r) => walkEdges(r, true));

  return { positions, edges };
}

const DIFF_BG = ["#dbeafe", "#bfdbfe", "#fde68a", "#fdba74", "#fca5a5"];
const DIFF_BORDER = ["#3b82f6", "#60a5fa", "#f59e0b", "#f97316", "#ef4444"];
const DIFF_LABEL = ["入门", "基础", "进阶", "高级", "专家"];

export function MindMap({
  nodes,
  selectedNodeId,
  onSelectNode,
  fillHeight = false,
  showEnterButton = true,
}: MindMapProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  // 折叠状态：默认全部展开
  const treeRoots = useMemo(() => buildTree(nodes), [nodes]);
  const allIds = useMemo(() => collectAllIds(treeRoots), [treeRoots]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allIds));

  // nodes 变化时重置 expanded（如切换不同预设）
  useEffect(() => {
    setExpanded(new Set(allIds));
  }, [allIds]);

  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchRef = useRef<{
    mode: "pan" | "pinch" | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    initialDist?: number;
    initialScale?: number;
  } | null>(null);

  const { positions, edges, width, height } = useMemo(() => {
    const { positions, edges } = layout(treeRoots, expanded);
    const maxX = positions.reduce((m, p) => Math.max(m, p.x + NODE_W), 0);
    const maxY = positions.reduce((m, p) => Math.max(m, p.y + NODE_H), 0);
    return {
      positions,
      edges,
      width: maxX + PADDING * 2,
      height: maxY + PADDING * 2,
    };
  }, [treeRoots, expanded]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = -e.deltaY * 0.0015;
    setScale((s) => {
      const next = Math.max(0.3, Math.min(2.5, s + delta * s));
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
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
      touchRef.current = {
        mode: "pinch",
        startX: (t1.clientX + t2.clientX) / 2,
        startY: (t1.clientY + t2.clientY) / 2,
        originX: translate.x,
        originY: translate.y,
        initialDist: dist,
        initialScale: scale,
      };
    }
  }, [translate.x, translate.y, scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = touchRef.current;
    if (!t) return;
    if (t.mode === "pan" && e.touches.length === 1) {
      const touch = e.touches[0];
      setTranslate({
        x: t.originX + (touch.clientX - t.startX),
        y: t.originY + (touch.clientY - t.startY),
      });
    } else if (t.mode === "pinch" && e.touches.length === 2 && t.initialDist && t.initialScale) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / t.initialDist;
      setScale(Math.max(0.3, Math.min(2.5, t.initialScale * ratio)));
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      setTranslate({
        x: t.originX + (midX - t.startX),
        y: t.originY + (midY - t.startY),
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
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

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setScale((s) => Math.min(2.5, s + 0.2)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.3, s - 0.2)), []);
  const expandAll = useCallback(() => setExpanded(new Set(allIds)), [allIds]);
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  // 适配视图：让所有节点刚好可见
  const fitView = useCallback(() => {
    if (!containerRef.current || positions.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = (rect.width - PADDING * 2) / width;
    const scaleY = (rect.height - PADDING * 2) / height;
    const next = Math.max(0.3, Math.min(2.5, Math.min(scaleX, scaleY)));
    setScale(next);
    setTranslate({ x: 0, y: 0 });
  }, [positions.length, width, height]);

  useEffect(() => {
    const handler = () => {
      dragRef.current = null;
    };
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
      {/* 工具栏 */}
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
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <button
          onClick={fitView}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm"
          aria-label="适配视图"
          title="适配视图"
        >
          ⤢
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm"
          aria-label="重置"
          title="重置视图"
        >
          ⟲
        </button>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <button
          onClick={expandAll}
          className="px-2 h-8 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          aria-label="全部展开"
          title="全部展开"
        >
          展开
        </button>
        <button
          onClick={collapseAll}
          className="px-2 h-8 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          aria-label="全部收起"
          title="全部收起"
        >
          收起
        </button>
      </div>

      {/* 提示 */}
      <div className="absolute bottom-2 left-2 z-20 text-[10px] text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
        双指缩放 · 单指拖拽 · 点击节点展开/收起
      </div>

      {/* 画布 */}
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
        style={{ minHeight: fillHeight ? "100%" : "400px", touchAction: "none" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${Math.max(width, 100)} ${Math.max(height, 100)}`}
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
              const isExpanded = expanded.has(p.id);
              const bg = isSelected
                ? "#0f172a"
                : isBigTech
                  ? "#fef3c7"
                  : DIFF_BG[diff - 1] || "#e2e8f0";
              const border = isSelected
                ? "#3b82f6"
                : isBigTech
                  ? "#f59e0b"
                  : isHover
                    ? DIFF_BORDER[diff - 1] || "#475569"
                    : "#cbd5e1";
              const fg = isSelected ? "#fff" : "#1e293b";
              const subFg = isSelected ? "#cbd5e1" : "#64748b";

              // foreignObject 用于渲染 HTML 节点（多行文本 + 按钮）
              return (
                <g
                  key={p.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  style={{ pointerEvents: "all" }}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    fill={bg}
                    stroke={border}
                    strokeWidth={isSelected ? 2.5 : isBigTech ? 2 : isHover ? 2 : 1}
                  />
                  <foreignObject x={0} y={0} width={NODE_W} height={NODE_H} style={{ pointerEvents: "none" }}>
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        color: fg,
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        pointerEvents: "none",
                      }}
                    >
                      {/* 标题行 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "8px",
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "1.3",
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-word",
                            cursor: p.hasChildren ? "pointer" : "default",
                            pointerEvents: "auto",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.hasChildren) {
                              setExpanded((prev) => {
                                const next = new Set(prev);
                                if (next.has(p.id)) next.delete(p.id);
                                else next.add(p.id);
                                return next;
                              });
                            } else if (onSelectNode) {
                              // 叶子节点直接触发 onSelectNode
                              onSelectNode(p.node);
                            }
                          }}
                        >
                          {p.node.title}
                        </div>
                        {p.hasChildren && (
                          <div
                            style={{
                              fontSize: "14px",
                              color: subFg,
                              cursor: "pointer",
                              pointerEvents: "auto",
                              padding: "0 4px",
                              userSelect: "none",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpanded((prev) => {
                                const next = new Set(prev);
                                if (next.has(p.id)) next.delete(p.id);
                                else next.add(p.id);
                                return next;
                              });
                            }}
                          >
                            {isExpanded ? "▾" : "▸"}
                          </div>
                        )}
                      </div>
                      {/* 元信息行 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "11px",
                          color: subFg,
                          pointerEvents: "none",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{DIFF_LABEL[diff - 1] || `D${diff}`}</span>
                        <span>{"★".repeat(diff)}</span>
                        <span>·</span>
                        <span>{p.node.frequency}频</span>
                        {isBigTech && (
                          <>
                            <span>·</span>
                            <span style={{ color: isSelected ? "#fbbf24" : "#d97706" }}>大厂</span>
                          </>
                        )}
                        {p.node.customOrder != null && (
                          <>
                            <span>·</span>
                            <span>#{p.node.customOrder}</span>
                          </>
                        )}
                      </div>
                      {/* 掌握度进度条 + 进入按钮 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "4px",
                            background: isSelected ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p.node.mastery}%`,
                              height: "100%",
                              background: isSelected ? "#60a5fa" : "#3b82f6",
                              borderRadius: "2px",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "10px", color: subFg, minWidth: "28px" }}>
                          {p.node.mastery}%
                        </span>
                        {onSelectNode && showEnterButton && (
                          <button
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: isSelected ? "#3b82f6" : "#1e293b",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              pointerEvents: "auto",
                              fontWeight: 500,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNode(p.node);
                            }}
                          >
                            进入
                          </button>
                        )}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
