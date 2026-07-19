// .lintstagedrc.js
// lint-staged 配置：在 pre-commit 时只对暂存的 ts/tsx 跑 eslint --fix
//
// 排除 e2e/ 目录：eslintrc.json 的 ignorePatterns 已包含 "e2e/"，
// 但 lint-staged 把文件路径显式传给 eslint 时会触发 "File ignored" warning，
// 在 --max-warnings 0 下会阻塞 commit。这里用函数形式过滤掉 e2e/ 路径。

/**
 * @param {string[]} files
 * @returns {string[]}
 */
function eslintCmd(files) {
  const filtered = files.filter((f) => !f.startsWith("e2e/") && !f.includes("/e2e/"));
  if (filtered.length === 0) return [];
  return [`eslint --fix --max-warnings 0 ${filtered.join(" ")}`];
}

module.exports = {
  "*.{ts,tsx}": eslintCmd,
};
