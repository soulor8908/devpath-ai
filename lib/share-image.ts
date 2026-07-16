// lib/share-image.ts
// 用 html-to-image 把隐藏 div 渲染成 PNG 分享图
//
// 设计目标：
//   1. 视觉冲击力强——朋友圈分享后能吸引点击
//   2. 底部加二维码：扫码即可访问 /u/{username} 公开主页
//   3. 数据可读：用户名/打卡/总时长/热力图/能力雷达 一目了然
//
// 数据隐私：仅渲染 profile.visibility 开启的字段，关闭的不显示

import { toPng } from "html-to-image";
import QRCode from "qrcode";

interface ShareCardData {
  username: string;
  displayName: string;
  streakDays: number;
  totalMinutes: number;
  heatmapData?: Array<{ date: string; count: number }>;
  radarData?: Array<{ node: string; value: number }>;
  /** 公开主页访问 URL（用于生成二维码） */
  shareUrl?: string;
}

/**
 * 生成分享图 PNG Blob
 * 1. 创建隐藏 div（fixed + 屏幕外）
 * 2. 渲染用户名 + 打卡天数 + 热力图缩略 + 雷达缩略 + 二维码
 * 3. html-to-image 转 PNG
 * 4. 移除 div，返回 Blob
 */
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "640px";
  // 高度由内容决定，不固定 height
  container.style.padding = "0";
  container.style.fontFamily = "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
  container.style.borderRadius = "24px";
  container.style.overflow = "hidden";
  container.style.background = "#0f172a";

  // 生成二维码 data URL（如果提供了 shareUrl）
  let qrDataUrl = "";
  if (data.shareUrl) {
    try {
      qrDataUrl = await QRCode.toDataURL(data.shareUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
    } catch {
      // 二维码生成失败时降级：使用占位（不影响分享图主内容）
      qrDataUrl = "";
    }
  }

  const heatmapGrid = (data.heatmapData ?? []).slice(-49).map((d) => {
    const level = d.count >= 60 ? 4 : d.count >= 30 ? 3 : d.count >= 15 ? 2 : d.count > 0 ? 1 : 0;
    const colors = ["rgba(255,255,255,0.08)", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
    return `<div style="width:14px;height:14px;border-radius:3px;background:${colors[level]};display:inline-block;margin:1px"></div>`;
  }).join("");

  const radarBars = (data.radarData ?? []).slice(0, 5).map((r) => `
    <div style="display:flex;align-items:center;gap:8px;margin:3px 0">
      <span style="width:96px;font-size:12px;color:rgba(255,255,255,0.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.node)}</span>
      <div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
        <div style="width:${r.value}%;height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:3px"></div>
      </div>
      <span style="width:32px;text-align:right;font-size:11px;color:rgba(255,255,255,0.6)">${r.value}</span>
    </div>
  `).join("");

  // 头像首字母（无 avatar 时用首字母占位）
  const initial = (data.displayName || data.username || "?").slice(0, 1).toUpperCase();

  container.innerHTML = `
    <!-- Hero 渐变背景 -->
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);padding:36px 32px 28px;color:white;position:relative;overflow:hidden">
      <!-- 装饰圆点（背景纹理） -->
      <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.08)"></div>
      <div style="position:absolute;bottom:-60px;left:-30px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>

      <div style="display:flex;align-items:center;gap:16px;position:relative">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.4)">${escapeHtml(initial)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:26px;font-weight:bold;line-height:1.2">${escapeHtml(data.displayName)}</div>
          <div style="font-size:13px;opacity:0.85;margin-top:2px">@${escapeHtml(data.username)}</div>
        </div>
        <div style="text-align:right;font-size:11px;opacity:0.7;line-height:1.4">
          devpath<br>AI 学习教练
        </div>
      </div>

      <!-- 核心数据 -->
      <div style="display:flex;gap:32px;margin-top:24px;position:relative">
        <div>
          <div style="font-size:36px;font-weight:bold;line-height:1">${data.streakDays}</div>
          <div style="font-size:11px;opacity:0.85;margin-top:4px">连续打卡天</div>
        </div>
        <div>
          <div style="font-size:36px;font-weight:bold;line-height:1">${data.totalMinutes}</div>
          <div style="font-size:11px;opacity:0.85;margin-top:4px">总学习分钟</div>
        </div>
      </div>
    </div>

    <!-- 数据卡片区域（深色背景 + 卡片化） -->
    <div style="padding:20px 28px;background:#0f172a;color:white">
      ${heatmapGrid ? `
        <div style="margin-bottom:18px">
          <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px;letter-spacing:0.5px">近期学习</div>
          <div style="display:flex;flex-wrap:wrap;width:322px">${heatmapGrid}</div>
        </div>` : ""}

      ${radarBars ? `
        <div style="margin-bottom:8px">
          <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px;letter-spacing:0.5px">能力雷达</div>
          ${radarBars}
        </div>` : ""}

      <!-- 底部：二维码 + 文案 -->
      <div style="display:flex;align-items:center;gap:16px;margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.1)">
        ${qrDataUrl ? `
          <div style="width:88px;height:88px;background:white;padding:6px;border-radius:10px;flex-shrink:0">
            <img src="${qrDataUrl}" style="width:100%;height:100%;display:block" />
          </div>` : ""}
        <div style="flex:1">
          <div style="font-size:14px;font-weight:bold;margin-bottom:2px">扫码查看我的学习主页</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);line-height:1.5">
            AI 驱动的开发者成长 OS · 个性化学习路径 · FSRS 间隔重复
          </div>
        </div>
      </div>
    </div>
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
