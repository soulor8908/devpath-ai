// __tests__/portfolio-editor.test.tsx
// V4 作品集编辑器模态 UI 测试
//
// 验证：
//   - open=true 时渲染标题、表单字段
//   - 创建模式：标题为「新建作品集」，字段为空
//   - 编辑模式：标题为「编辑作品集」，字段预填 entry 值
//   - 必填校验：标题/摘要/节点为空时显示错误，不调用 onSubmit
//   - 提交成功后调用 onClose
//   - 评审结果（reviewPassed）在编辑模式下以只读展示

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PortfolioEditorModal, type PortfolioEditorSubmit } from "../components/PortfolioEditorModal";
import type { PortfolioEntry } from "../lib/types";
import type { SkillNode } from "../lib/types/curriculum";

const mockNodes: SkillNode[] = [
  {
    id: "project.cli-llm-tool",
    title: "CLI LLM 工具",
    summary: "",
    tracks: ["frontend-to-ai-engineer"],
    phase: 0,
    prerequisites: [],
    estimatedMinutes: 240,
    difficulty: 3,
    concepts: [],
    sourceIds: [],
    gotchas: [],
    interview: [],
    masteryCheck: {
      level: "V3",
      type: "project-checkpoint",
      description: "",
      rubricId: "project-cli-llm-tool",
    },
    status: "reviewed",
    lastVerified: "2026-07-24",
  },
  {
    id: "project.rag-pipeline",
    title: "RAG 管线项目",
    summary: "",
    tracks: ["frontend-to-ai-engineer"],
    phase: 2,
    prerequisites: [],
    estimatedMinutes: 480,
    difficulty: 4,
    concepts: [],
    sourceIds: [],
    gotchas: [],
    interview: [],
    masteryCheck: {
      level: "V3",
      type: "project-checkpoint",
      description: "",
      rubricId: "project-rag-pipeline",
    },
    status: "reviewed",
    lastVerified: "2026-07-24",
  },
];

const baseEntry: PortfolioEntry = {
  id: "entry-1",
  title: "已有作品",
  summary: "已有摘要",
  nodeId: "project.cli-llm-tool",
  rubricId: "project-cli-llm-tool",
  repoUrl: "https://github.com/u/repo",
  deployUrl: undefined,
  docUrl: undefined,
  reviewScore: 82,
  reviewPassed: true,
  reviewFeedback: "结构清晰",
  status: "draft",
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z",
};

describe("PortfolioEditorModal", () => {
  let onSubmit: ReturnType<typeof vi.fn<[PortfolioEditorSubmit], void>>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn<[PortfolioEditorSubmit], void>();
    onClose = vi.fn();
  });

  it("open=false 时不渲染", () => {
    const { container } = render(
      <PortfolioEditorModal
        open={false}
        onClose={onClose}
        nodes={mockNodes}
        onSubmit={onSubmit}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("创建模式：标题为「新建作品集」，表单字段为空", () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("新建作品集")).toBeInTheDocument();
    // 标题输入框为空
    const titleInput = screen.getByPlaceholderText(
      "如：CLI 文本批处理工具",
    ) as HTMLInputElement;
    expect(titleInput.value).toBe("");
  });

  it("编辑模式：标题为「编辑作品集」，字段预填", () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        entry={baseEntry}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("编辑作品集")).toBeInTheDocument();
    const titleInput = screen.getByPlaceholderText(
      "如：CLI 文本批处理工具",
    ) as HTMLInputElement;
    expect(titleInput.value).toBe("已有作品");
  });

  it("节点下拉只列 V3/V4 节点（mockNodes 都符合）", async () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        onSubmit={onSubmit}
      />,
    );
    // Select trigger 是 button，与 FormField label「关联节点」关联，
    // 所以 accessible name 是「关联节点」（通过 htmlFor → id 绑定）
    const trigger = screen.getByRole("button", { name: /关联节点/ });
    fireEvent.click(trigger);
    // 等待 listbox 弹出，两个节点 label 都可见
    // 用 role="option" 精确匹配（Select 内部还有隐藏的 native <select> 供 form 序列化，
    // 其 <option> 与自定义 div option 同文本，getByText 会命中多个元素）
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "CLI LLM 工具" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "RAG 管线项目" }),
      ).toBeInTheDocument();
    });
  });

  it("必填校验：标题/摘要/节点为空时不调用 onSubmit", async () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        onSubmit={onSubmit}
      />,
    );
    // 直接点提交（未填任何字段）
    const submitBtn = screen.getByText("创建");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      // 至少显示一个错误提示
      expect(screen.getByText("标题不能为空")).toBeInTheDocument();
    });
  });

  it("填写完整后提交：调用 onSubmit 并关闭", async () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        onSubmit={onSubmit}
      />,
    );
    // 填标题
    fireEvent.change(
      screen.getByPlaceholderText("如：CLI 文本批处理工具"),
      { target: { value: "我的项目" } },
    );
    // 填摘要
    fireEvent.change(screen.getByPlaceholderText(/asyncio 的 LLM 批处理工具/), {
      target: { value: "测试摘要" },
    });
    // 选节点：点 trigger 展开 listbox，再点 option
    fireEvent.click(screen.getByRole("button", { name: /关联节点/ }));
    const cliOption = await waitFor(() =>
      screen.getByRole("option", { name: "CLI LLM 工具" }),
    );
    fireEvent.click(cliOption);

    // 提交
    fireEvent.click(screen.getByText("创建"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const callArg = onSubmit.mock.calls[0][0];
    expect(callArg.title).toBe("我的项目");
    expect(callArg.summary).toBe("测试摘要");
    expect(callArg.nodeId).toBe("project.cli-llm-tool");
    expect(callArg.rubricId).toBe("project-cli-llm-tool");
    expect(callArg.status).toBe("draft");
    // 关闭回调被调用
    expect(onClose).toHaveBeenCalled();
  });

  it("编辑模式下展示只读评审结果（reviewPassed=true）", () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        entry={baseEntry}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("V3 AI 评审结果（只读）")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("通过")).toBeInTheDocument();
    expect(screen.getByText("结构清晰")).toBeInTheDocument();
  });

  it("取消按钮触发 onClose，不调用 onSubmit", () => {
    render(
      <PortfolioEditorModal
        open
        onClose={onClose}
        nodes={mockNodes}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByText("取消"));
    expect(onClose).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
