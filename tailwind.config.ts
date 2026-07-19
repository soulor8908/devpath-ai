import type { Config } from "tailwindcss";

// tailwind.config.ts
// 设计令牌（Design Tokens）—— UI 体检报告 C1 修复
//
// 设计（乔布斯视角）：
//   - 设计令牌是设计的"宪法"，所有视觉决策必须从这里推导
//   - brand 色 = blue（保持向后兼容，现有 bg-blue-600 仍然工作）
//   - 语义色 success/warning/danger/info 各有 DEFAULT + soft 两档
//   - 圆角只有 4 档：sm(8) / card(12) / lg(16) / pill(9999)
//   - 阴影只有 4 档：card / card-hover / modal / floating
//   - 字号补一档 2xs(11px) 替代散落的 text-[11px] 逃逸值
//   - 字体族补齐中文回退（PingFang SC / Microsoft YaHei），跨平台一致
//
// 设计（卡帕西视角）：
//   - extend 不覆盖 Tailwind 默认值，只追加 → 现有 blue-600 / gray-100 全部继续工作
//   - brand 色阶与 Tailwind blue 完全一致 → bg-brand-600 === bg-blue-600
//     这样新组件用 bg-brand-600，旧组件暂时保留 bg-blue-600，Stage 3 再统一迁移
//   - 不引第三方 plugin，零新依赖

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ============ 色彩令牌 ============
      colors: {
        // 品牌主色（与 Tailwind blue 同色阶，向后兼容）
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#2563eb", // brand = brand.600
        },
        // 语义色：DEFAULT = 主色，soft = 浅色背景（如 bg-success-soft）
        success: {
          DEFAULT: "#16a34a", // green-600
          soft: "#dcfce7", // green-100
        },
        warning: {
          DEFAULT: "#d97706", // amber-600
          soft: "#fef3c7", // amber-100
        },
        danger: {
          DEFAULT: "#dc2626", // red-600
          soft: "#fee2e2", // red-100
        },
        info: {
          DEFAULT: "#2563eb", // blue-600
          soft: "#dbeafe", // blue-100
        },
      },
      // ============ 圆角令牌 ============
      // 4 档：sm(8px 输入框/按钮) / card(12px 卡片) / lg(16px 大卡片) / pill(胶囊)
      borderRadius: {
        card: "0.75rem", // 12px — 卡片默认圆角
        lg2: "1rem", // 16px — 大卡片（避免与 Tailwind 默认 rounded-lg=8px 冲突）
        pill: "9999px", // 胶囊形（Filter Chip / FAB / CTA）
      },
      // ============ 阴影令牌（elevation system）============
      // 4 档：card(静态卡片) / card-hover(hover 态) / modal(模态) / floating(浮层)
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.08)",
        modal: "0 20px 50px -10px rgba(0, 0, 0, 0.25), 0 8px 20px -8px rgba(0, 0, 0, 0.15)",
        floating: "0 8px 24px -4px rgba(0, 0, 0, 0.18), 0 4px 8px -2px rgba(0, 0, 0, 0.1)",
      },
      // ============ 字体令牌 ============
      // 中文字体回退：macOS 用 PingFang SC，Windows 用 Microsoft YaHei
      // 跨平台一致体验（之前 Windows 会回退到 SimSun，难看）
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "PingFang SC",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      // ============ 字号令牌 ============
      // 补一档 2xs(11px) 替代散落的 text-[11px] 逃逸值
      // 注意：text-[10px] 不提供令牌，强制提升到 2xs(11px) 或 xs(12px)
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
      },
      // ============ 动效令牌 ============
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)", // 比默认 ease-out 更柔和的退出
      },
      // ============ 动画令牌 ============
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
