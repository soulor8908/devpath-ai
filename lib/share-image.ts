// lib/share-image.ts
// 用 html-to-image 把隐藏 div 渲染成 PNG 分享图

import { toPng } from "html-to-image";

interface ShareCardData {
  username: string;
  displayName: string;
  streakDays: number;
  totalMinutes: number;
  heatmapData?: Array<{ date: string; count: number }>;
  radarData?: Array<{ node: string; value: number }>;
}

/**
 * 生成分享图 PNG Blob
 * 1. 创建隐藏 div（fixed + 屏幕外）
 * 2. 渲染用户名 + 打卡天数 + 热力图缩略 + 雷达缩略
 * 3. html-to-image 转 PNG
 * 4. 移除 div，返回 Blob
 */
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "600px";
  container.style.padding = "32px";
  container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  container.style.color = "white";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";
  container.style.borderRadius = "16px";

  const heatmapGrid = (data.heatmapData ?? []).slice(-49).map((d) => {
    const level = d.count >= 60 ? 4 : d.count >= 30 ? 3 : d.count >= 15 ? 2 : d.count > 0 ? 1 : 0;
    const colors = ["rgba(255,255,255,0.2)", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
    return `<div style="width:14px;height:14px;border-radius:2px;background:${colors[level]};display:inline-block;margin:1px"></div>`;
  }).join("");

  const radarBars = (data.radarData ?? []).slice(0, 5).map((r) => `
    <div style="display:flex;align-items:center;gap:6px;margin:2px 0">
      <span style="width:80px;font-size:11px;opacity:0.9;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.node)}</span>
      <div style="flex:1;height:6px;background:rgba(255,255,255,0.2);border-radius:3px">
        <div style="width:${r.value}%;height:100%;background:#fbbf24;border-radius:3px"></div>
      </div>
    </div>
  `).join("");

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:24px">📚</div>
      <div>
        <div style="font-size:22px;font-weight:bold">${escapeHtml(data.displayName)}</div>
        <div style="font-size:13px;opacity:0.8">@${escapeHtml(data.username)}</div>
      </div>
    </div>
    <div style="display:flex;gap:24px;margin-bottom:20px">
      <div>
        <div style="font-size:32px;font-weight:bold">${data.streakDays}</div>
        <div style="font-size:12px;opacity:0.8">连续打卡天</div>
      </div>
      <div>
        <div style="font-size:32px;font-weight:bold">${data.totalMinutes}</div>
        <div style="font-size:12px;opacity:0.8">总学习分钟</div>
      </div>
    </div>
    ${heatmapGrid ? `<div style="margin-bottom:16px"><div style="font-size:12px;opacity:0.8;margin-bottom:4px">近期学习</div><div style="display:flex;flex-wrap:wrap;width:294px">${heatmapGrid}</div></div>` : ""}
    ${radarBars ? `<div><div style="font-size:12px;opacity:0.8;margin-bottom:4px">能力雷达</div>${radarBars}</div>` : ""}
    <div style="margin-top:20px;font-size:11px;opacity:0.6">devpath · AI 驱动的开发者成长 OS</div>
  `;

  document.body.appendChild(container);
  try {
    const blob = await toPng(container, { pixelRatio: 2, cacheBust: true }).then(async (dataUrl) => {
      const res = await fetch(dataUrl);
      return res.blob();
    });
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] ?? c));
}
