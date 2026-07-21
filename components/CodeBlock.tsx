"use client";

// components/CodeBlock.tsx
// 轻量级语法高亮组件（无外部依赖）
// 支持 JS/TS/Python/Java/Go/SQL/Bash 等主流语言的关键字、字符串、注释、数字、函数调用着色
// 采用 token 流式扫描，避免正则回溯灾难
//
// AnswerContent 扩展（用户需求 3）：
//   - 答案文字被选中时，在选中范围附近显示悬浮"问 AI"按钮
//   - 点击按钮把选中文字 + 题目上下文通过 onAskAI 回调传给父组件（QuestionCard）
//   - 父组件调 openChatModal({ prefill, source }) 跳到聊天页
//   - 选文字问 AI 的核心逻辑已提取到 lib/hooks/use-ask-ai.ts，可跨组件复用

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { useAskAI } from "@/lib/hooks/use-ask-ai";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** 标题（如文件名），可选 */
  filename?: string;
  /** 默认折叠过长的代码（> 30 行），用户可展开 */
  collapsible?: boolean;
  /** 复制回调（用于隐式反馈追踪） */
  onCopy?: () => void;
}

// ============================================================
// 词法分析：将代码切分为 token 流
// ============================================================

type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "boolean"
  | "function"
  | "operator"
  | "punctuation"
  | "plain";

interface Token {
  type: TokenType;
  value: string;
}

// 各语言关键字
const KEYWORDS: Record<string, Set<string>> = {
  javascript: new Set("const let var function return if else for while do switch case break continue class extends super new this typeof instanceof in of null undefined true false async await yield delete void import export from default try catch finally throw typeof".split(" ")),
  typescript: new Set("const let var function return if else for while do switch case break continue class extends super new this typeof instanceof in of null undefined true false async await yield delete void import export from default try catch finally throw typeof interface type enum namespace implements public private protected readonly as is never unknown any string number boolean void".split(" ")),
  python: new Set("def class return if elif else for while break continue pass lambda with as try except finally raise assert yield async await import from None True False and or not in is global nonlocal del self print".split(" ")),
  java: new Set("public private protected class interface extends implements static final void int long double float boolean char byte short String new this super if else for while do switch case break continue return try catch finally throw throws assert import package synchronized volatile transient native enum abstract default null true false instanceof".split(" ")),
  go: new Set("package import func var const type struct interface map chan go defer select switch case default break continue return if else for range nil true false make new append len cap copy delete close panic recover".split(" ")),
  sql: new Set("SELECT FROM WHERE INSERT INTO UPDATE DELETE CREATE TABLE DROP ALTER ADD MODIFY COLUMN INDEX VIEW JOIN INNER LEFT RIGHT OUTER ON GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET DISTINCT AND OR NOT NULL IS IN LIKE BETWEEN CASE WHEN THEN ELSE END AS COUNT SUM AVG MIN MAX TRUE FALSE PRIMARY KEY FOREIGN REFERENCES DEFAULT UNIQUE NOT NULL AUTO_INCREMENT".split(" ")),
  bash: new Set("if then else elif fi for while do done case esac function return export local declare readonly source echo printf read cd ls cat grep sed awk find xargs sudo apt yum brew git curl wget ssh scp rsync make cmake chmod chown mkdir rm mv cp ln tar zip unzip".split(" ")),
  shell: new Set("if then else elif fi for while do done case esac function return export local declare readonly source echo printf read cd ls cat grep sed awk find xargs sudo apt yum brew git curl wget ssh scp rsync make cmake chmod chown mkdir rm mv cp ln tar zip unzip".split(" ")),
};

const BOOLEAN_VALUES = new Set(["true", "false", "null", "undefined", "None", "True", "False", "nil", "NULL"]);

// 单字符运算符
const OPERATORS = new Set("+-*/%=<>!&|^~?:.".split(""));
const PUNCTUATIONS = new Set("(){}[],;".split(""));

function normalizeLang(lang?: string): string {
  if (!lang) return "javascript";
  const l = lang.toLowerCase().trim();
  if (l === "js" || l === "jsx") return "javascript";
  if (l === "ts" || l === "tsx") return "typescript";
  if (l === "py") return "python";
  if (l === "sh" || l === "zsh") return "bash";
  return l;
}

function tokenize(code: string, lang: string): Token[] {
  const kw = KEYWORDS[lang] || KEYWORDS.javascript;
  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const ch = code[i];
    const next = code[i + 1] ?? "";

    // 单行注释 // 或 #
    if ((ch === "/" && next === "/") || (lang === "python" && ch === "#") || ((lang === "bash" || lang === "shell") && ch === "#")) {
      let end = code.indexOf("\n", i);
      if (end === -1) end = len;
      tokens.push({ type: "comment", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // 多行注释 /* */（也用于 CSS）
    if (ch === "/" && next === "*") {
      let end = code.indexOf("*/", i + 2);
      if (end === -1) end = len;
      else end += 2;
      tokens.push({ type: "comment", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // Python 三引号字符串
    if (lang === "python" && (ch === '"' || ch === "'") && code.slice(i, i + 3) === ch.repeat(3)) {
      const quote = ch.repeat(3);
      let end = code.indexOf(quote, i + 3);
      if (end === -1) end = len;
      else end += 3;
      tokens.push({ type: "string", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // 字符串（'...' "..." `...`）
    if (ch === '"' || ch === "'" || ch === "`") {
      let end = i + 1;
      while (end < len) {
        // 转义
        if (code[end] === "\\") {
          end += 2;
          continue;
        }
        if (code[end] === ch) {
          end++;
          break;
        }
        // 模板字符串中的 ${...}（简化处理，直接到下一个 `）
        end++;
      }
      tokens.push({ type: "string", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // 数字
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(next))) {
      let end = i + 1;
      while (end < len && /[0-9._a-fA-FxXeE]/.test(code[end])) end++;
      tokens.push({ type: "number", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // 标识符 / 关键字 / 布尔值
    if (/[a-zA-Z_$@]/.test(ch)) {
      let end = i + 1;
      while (end < len && /[a-zA-Z0-9_$]/.test(code[end])) end++;
      const word = code.slice(i, end);
      // 检查后面是否是 ( 判断为函数调用
      let afterWs = end;
      while (afterWs < len && /\s/.test(code[afterWs])) afterWs++;
      const isFuncCall = code[afterWs] === "(";
      if (kw.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (BOOLEAN_VALUES.has(word)) {
        tokens.push({ type: "boolean", value: word });
      } else if (isFuncCall) {
        tokens.push({ type: "function", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      i = end;
      continue;
    }
    // 空白字符
    if (/\s/.test(ch)) {
      let end = i + 1;
      while (end < len && /\s/.test(code[end])) end++;
      tokens.push({ type: "plain", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // 运算符
    if (OPERATORS.has(ch)) {
      let end = i + 1;
      while (end < len && OPERATORS.has(code[end])) end++;
      tokens.push({ type: "operator", value: code.slice(i, end) });
      i = end;
      continue;
    }
    // 标点
    if (PUNCTUATIONS.has(ch)) {
      tokens.push({ type: "punctuation", value: ch });
      i++;
      continue;
    }
    // 其他
    tokens.push({ type: "plain", value: ch });
    i++;
  }

  return tokens;
}

// token 颜色映射（适配深色背景 #0d1117，参考 GitHub Dark 主题）
// 原来用的是 GitHub Light 主题色，深色背景下浅色文字看不清
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "#ff7b72",       // 红（GitHub Dark keyword）
  string: "#a5d6ff",        // 浅蓝（GitHub Dark string）
  comment: "#8b949e",      // 灰（GitHub Dark comment）
  number: "#79c0ff",        // 蓝（GitHub Dark number）
  boolean: "#79c0ff",        // 蓝
  function: "#d2a8ff",       // 紫（GitHub Dark function）
  operator: "#ff7b72",      // 红
  punctuation: "#c9d1d9",   // 浅灰（GitHub Dark punctuation）
  plain: "#c9d1d9",         // 浅灰（GitHub Dark plain text）
};

// ============================================================
// 轻量 Markdown 渲染（无外部依赖，解析失败自动降级为纯文本）
// ============================================================

/** 解析行内 Markdown：**粗体** *斜体* `代码` [链接](url) */
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // 合并匹配：粗体 / 斜体 / 行内代码 / 链接
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.slice(lastIdx, match.index));
    }
    if (match[1]) {
      nodes.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      nodes.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 text-[13px] font-mono">
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      nodes.push(
        <a key={key++} href={match[9]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline break-all">
          {match[8]}
        </a>
      );
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx));
  }
  return nodes;
}

/** 将 markdown 文本渲染为结构化 React 节点（标题/列表/引用/分割线/段落） */
function renderMarkdownBlocks(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const headingSizes = [
    "text-xl font-bold mt-4 mb-2",
    "text-lg font-bold mt-3 mb-1.5",
    "text-base font-semibold mt-3 mb-1",
    "text-sm font-semibold mt-2 mb-1",
  ];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行跳过
    if (!trimmed) { i++; continue; }

    // 标题 # ## ### ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(
        <p key={key++} className={headingSizes[level - 1]}>
          {parseInline(headingMatch[2])}
        </p>
      );
      i++;
      continue;
    }

    // 水平分割线 --- *** ___
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(<hr key={key++} className="my-3 border-gray-200 dark:border-gray-700" />);
      i++;
      continue;
    }

    // 引用块 >
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="my-2 pl-3 border-l-4 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
          {quoteLines.map((l, idx) => <p key={idx}>{parseInline(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // 无序列表 - * +
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-2 list-disc list-inside space-y-0.5 marker:text-gray-400">
          {items.map((item, idx) => <li key={idx}>{parseInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    // 有序列表 1. 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-2 list-decimal list-inside space-y-0.5 marker:text-gray-400">
          {items.map((item, idx) => <li key={idx}>{parseInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    // 段落（收集连续的普通文本行）
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|[-*+]\s|\d+\.\s|>|(-{3,}|\*{3,}|_{3,})$)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={key++} className="my-1.5 leading-relaxed whitespace-pre-wrap">
          {parseInline(paraLines.join("\n"))}
        </p>
      );
    }
  }

  return blocks;
}

interface AnswerContentProps {
  text: string;
  className?: string;
  /**
   * 当用户选中答案中的文字并点击"问 AI"按钮时触发（用户需求 3）
   * - 回调参数：选中的纯文本内容
   * - 不传此 prop 时不显示"问 AI"按钮（保持原有渲染）
   * - 父组件（QuestionCard）传入此回调后调用 openChatModal({ prefill, source })
   *
   * 实现说明：选文字问 AI 的核心逻辑已提取到 lib/hooks/use-ask-ai.ts，
   * 这里只负责把 containerRef 绑定到答案容器，并渲染 floatingButton。
   */
  onAskAI?: (selectedText: string) => void;
}

/** 解析带 ```lang ... ``` 代码块的 markdown 文本 */
function parseAnswer(text: string): Array<{ type: "text" | "code"; content: string; lang?: string }> {
  const parts: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: "text", content: text.slice(lastIdx, match.index) });
    }
    parts.push({
      type: "code",
      lang: match[1] || "",
      content: match[2].replace(/\n$/, ""),
    });
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push({ type: "text", content: text.slice(lastIdx) });
  }
  return parts;
}

/**
 * 答案内容渲染：支持代码块 + 行内 markdown，可选"选文字问 AI"按钮。
 *
 * 选文字问 AI 的实现已迁移到 lib/hooks/use-ask-ai.ts（useAskAI），
 * 这里只负责把 hook 返回的 containerRef 绑到答案容器，并渲染 floatingButton。
 * - 不传 onAskAI 时 hook 仍会调用（enabled=false），但 floatingButton 始终为 null
 * - 传 onAskAI 时，用户选中容器内文字 → 出现"问 AI"按钮 → 点击触发回调
 */
export function AnswerContent({ text, className, onAskAI }: AnswerContentProps) {
  const parts = useMemo(() => parseAnswer(text), [text]);
  const { containerRef, floatingButton } = useAskAI({
    onAskAI: onAskAI ?? (() => {}),
    enabled: !!onAskAI,
  });

  return (
    <div
      ref={containerRef}
      className={className ?? "text-sm text-gray-700 dark:text-gray-300"}
    >
      {parts.map((p, i) =>
        p.type === "text" ? (
          <TextBlock key={i} content={p.content} />
        ) : (
          <CodeBlock key={i} code={p.content} language={p.lang} />
        )
      )}
      {floatingButton}
    </div>
  );
}

/** 文本块渲染：尝试 Markdown 解析，异常时降级为纯文本 */
function TextBlock({ content }: { content: string }) {
  const rendered = useMemo(() => {
    try {
      return renderMarkdownBlocks(content);
    } catch {
      // 解析失败 → 降级为纯文本（whitespace-pre-wrap 保留原始格式）
      return [<p key="fallback" className="whitespace-pre-wrap leading-relaxed">{content}</p>];
    }
  }, [content]);
  return <>{rendered}</>;
}

// ============================================================
// CodeBlock：渲染带行号 + 高亮 + 折叠的代码块
// ============================================================

export function CodeBlock({ code, language, filename, collapsible = true, onCopy }: CodeBlockProps) {
  const lang = normalizeLang(language);
  const tokens = useMemo(() => tokenize(code, lang), [code, lang]);
  const lines = useMemo(() => code.split("\n"), [code]);
  const isLong = lines.length > 30;
  const [expanded, setExpanded] = useState(!isLong || !collapsible);

  // 折叠时只显示前 25 行的 tokens（hooks 不能放在条件分支里，所以总是计算）
  const previewTokens = useMemo(
    () => tokenize(lines.slice(0, 25).join("\n"), lang),
    [lines, lang]
  );
  const displayedTokens = expanded || !isLong ? tokens : previewTokens;

  // 重组为带换行的 token 渲染（保留行号对齐）
  return (
    <div className="my-3 rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117]">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-gray-700">
        <span className="text-2xs text-gray-400 font-mono">
          {filename || lang}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => {});
            onCopy?.();
          }}
          aria-label="复制代码"
          className="text-2xs text-gray-400 hover:text-white"
        >
          <Icon name="copy" className="w-3.5 h-3.5 inline-block align-middle" /> 复制
        </Button>
      </div>
      {/* 代码区 */}
      <div className="overflow-x-auto">
        <pre className="text-[13px] leading-[1.6] p-3 font-mono">
          <code>
            {renderTokens(displayedTokens)}
          </code>
        </pre>
      </div>
      {/* 折叠/展开 */}
      {isLong && collapsible && (
        <Button
          variant="ghost"
          size="sm"
          block
          onClick={() => setExpanded((v) => !v)}
          className="text-2xs text-gray-400 bg-[#161b22] hover:bg-[#1f2937] border-t border-gray-700"
        >
          {expanded ? "▼ 收起" : `▶ 展开剩余 ${lines.length - 25} 行（共 ${lines.length} 行）`}
        </Button>
      )}
    </div>
  );
}

function renderTokens(tokens: Token[]) {
  const out: React.ReactNode[] = [];
  tokens.forEach((t, i) => {
    if (t.type === "plain") {
      out.push(<span key={i}>{t.value}</span>);
    } else {
      out.push(
        <span key={i} style={{ color: TOKEN_COLORS[t.type] }}>
          {t.value}
        </span>
      );
    }
  });
  return out;
}
