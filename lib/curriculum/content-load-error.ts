// lib/curriculum/content-load-error.ts
// ContentLoadError 独立文件，避免 graph.ts → loader.ts → yaml 的依赖链
// 把 yaml 库（约 100KB+）拉进客户端 bundle，导致 Cloudflare Pages 部署失败。
//
// 拆分原因（卡帕西视角）：
//   - graph.ts 只需要 ContentLoadError 类（throw 用）
//   - loader.ts 需要 yaml 库（解析 YAML 文件）
//   - 把 ContentLoadError 拆出来后，graph.ts 不再依赖 loader.ts，
//     yaml 库只在 scripts/compile-content.ts 运行时被拉入，不进客户端 bundle

/**
 * 内容加载错误：附带文件路径上下文，便于定位问题文件
 */
export class ContentLoadError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`[${path}] ${message}`);
    this.name = "ContentLoadError";
    this.path = path;
  }
}
