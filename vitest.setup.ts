// vitest.setup.ts
// 全局测试环境初始化：注册 @testing-library/jest-dom 的 DOM 断言匹配器
// （toHaveAttribute / toBeDisabled / toBeInTheDocument 等）
import "@testing-library/jest-dom/vitest";

// jsdom 不实现 Element.prototype.scrollIntoView，但 Select 等组件在打开下拉时
// 会调用它（focusedIndex 变化时把当前 option 滚动到可视区）。
// 这里 stub 一个 no-op，避免所有用到 Select 的测试报错。
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {
    /* no-op for jsdom */
  };
}
