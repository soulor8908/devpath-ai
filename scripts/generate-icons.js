// scripts/generate-icons.js
// 生成 PWA 图标（icon-192/512、apple-touch-icon、favicon、icon.svg）
//
// 2026-07-27 P0-1：修复 PWA 图标全 404
//   - 站点体检发现 /icons/icon-192.png /icons/icon-512.png 全部 404
//   - manifest.json / layout.tsx og:image / <link rel=icon> 全引用这些路径
//   - 导致 PWA 不可安装、社交分享无预览图、浏览器 tab 无 favicon
//
// 设计理念（乔布斯视角）：
//   - 品牌蓝 #2563eb 背景（与 manifest theme_color 一致）
//   - 中心白色实心圆 = 目标/掌握
//   - 白色圆环 = 路径/成长循环
//   - 三个外围白色节点 = 知识节点（FSRS 复习 + 学习路径 + 面试题三能力）
//   - 圆角矩形（maskable safe zone 友好，不会被裁切）
//
// 技术选型（卡帕西视角）：
//   - 纯 Node.js zlib 手写 PNG 编码，零依赖（环境无 sharp/ImageMagick/PIL）
//   - 同时输出 SVG（矢量，未来 HiDPI 屏更清晰）
//   - favicon.ico 用 PNG-in-ICO 格式（现代浏览器全支持）

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// CRC32 表（PNG chunk 校验用）
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * 生成 PNG buffer
 * @param size 边长（像素）
 * @param drawFn (x, y, size) => [r, g, b, a]
 */
function generatePNG(size, drawFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // 像素数据：每行以 filter byte(0) 开头
  const rowSize = size * 4 + 1;
  const raw = Buffer.alloc(rowSize * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawFn(x, y, size);
      const offset = y * rowSize + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * 生成 ICO buffer（含 1 个 PNG 图像）
 * 现代浏览器（Chrome/Firefox/Safari/Edge）均支持 PNG-in-ICO
 */
function generateICO(pngBuffer, size) {
  // ICO header: reserved(2) + type(2) + count(2)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = ICO
  header.writeUInt16LE(1, 4); // 1 image

  // Directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width (0 = 256)
  entry[1] = size >= 256 ? 0 : size; // height
  entry[2] = 0; // color palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuffer.length, 8); // image size
  entry.writeUInt32LE(22, 12); // offset = 6 + 16 = 22

  return Buffer.concat([header, entry, pngBuffer]);
}

/**
 * 图标绘制：品牌蓝背景 + 白色路径节点图案
 * 设计寓意：中心圆=目标，圆环=成长路径，三个外围节点=知识节点
 */
function drawIcon(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // maskable safe zone：中心 80% 区域是 safe zone
  // 圆角矩形背景（maskable 友好，全出血）
  const bg = [37, 99, 235, 255]; // #2563eb 品牌蓝

  // 中心白色实心圆（目标/掌握）—— 半径 size*0.14
  const innerR = size * 0.14;
  if (dist < innerR) {
    return [255, 255, 255, 255];
  }

  // 白色圆环（成长路径）—— 外半径 size*0.34，内半径 size*0.26
  const outerR = size * 0.34;
  const innerRing = size * 0.26;
  if (dist <= outerR && dist >= innerRing) {
    return [255, 255, 255, 255];
  }

  // 三个外围白色节点（知识节点）—— 在圆环外侧
  // 节点位置：上、左下、右下（等边三角形，象征学习路径三阶段）
  const nodeR = size * 0.055;
  const nodeDist = size * 0.4;
  for (let i = 0; i < 3; i++) {
    const angle = ((i * 120 - 90) * Math.PI) / 180;
    const nx = cx + Math.cos(angle) * nodeDist;
    const ny = cy + Math.sin(angle) * nodeDist;
    const ndx = x - nx;
    const ndy = y - ny;
    if (Math.sqrt(ndx * ndx + ndy * ndy) < nodeR) {
      return [255, 255, 255, 255];
    }
  }

  return bg;
}

// === 执行生成 ===
const outDir = path.join(__dirname, "..", "public", "icons");
const publicDir = path.join(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });

// 1. icon-192.png（manifest 必需）
const png192 = generatePNG(192, drawIcon);
fs.writeFileSync(path.join(outDir, "icon-192.png"), png192);
console.log(`✓ icon-192.png (${png192.length} bytes)`);

// 2. icon-512.png（manifest 必需 + og:image）
const png512 = generatePNG(512, drawIcon);
fs.writeFileSync(path.join(outDir, "icon-512.png"), png512);
console.log(`✓ icon-512.png (${png512.length} bytes)`);

// 3. apple-touch-icon.png（iOS 主屏图标，180x180）
const png180 = generatePNG(180, drawIcon);
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), png180);
console.log(`✓ apple-touch-icon.png (${png180.length} bytes)`);

// 4. icon-144.png（MS tile，部分旧设备）
const png144 = generatePNG(144, drawIcon);
fs.writeFileSync(path.join(outDir, "icon-144.png"), png144);
console.log(`✓ icon-144.png (${png144.length} bytes)`);

// 5. favicon-32.png + favicon.ico（浏览器 tab 图标）
const png32 = generatePNG(32, drawIcon);
fs.writeFileSync(path.join(outDir, "favicon-32.png"), png32);
const ico = generateICO(png32, 32);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);
console.log(`✓ favicon.ico (${ico.length} bytes)`);

// 6. icon.svg（矢量版，未来 HiDPI 屏更清晰）
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#2563eb" rx="96"/>
  <circle cx="256" cy="256" r="174" fill="none" stroke="white" stroke-width="41"/>
  <circle cx="256" cy="256" r="72" fill="white"/>
  <circle cx="256" cy="112" r="28" fill="white"/>
  <circle cx="381" cy="328" r="28" fill="white"/>
  <circle cx="131" cy="328" r="28" fill="white"/>
</svg>`;
fs.writeFileSync(path.join(outDir, "icon.svg"), svg);
console.log(`✓ icon.svg (${svg.length} bytes)`);

console.log("\n所有图标已生成到 public/icons/");
