"use client";

// components/SyncStatus.tsx
// 数据同步状态组件：显示同步状态 + 上次同步时间 + 手动上传 + 跨设备恢复
// 支持导入已有 userId：在新设备粘贴旧 ID 即可继承云端数据
//
// 安全设计（卡帕西视角）：
//   - userId 是同步钥匙，泄露后他人可同步/覆盖你的数据
//   - 默认脱敏显示（前 4 + **** + 后 4）
//   - 「显示完整 ID」按钮切换明文（用户自己可见自己 ID）
//   - 复制按钮始终复制完整 ID（用户复制自己 ID 不算泄露）
//   - 「导入已有 ID」流程增加 confirmDialog 二次确认（防止误粘贴他人 ID）

import { useState, useEffect, useCallback } from "react";
import { getUserId, setUserId, uploadAll, downloadAll, getLastSyncedAt } from "@/lib/sync";
import { Icon } from "@/components/Icon";
import { maskUserId } from "@/lib/username-mask";
import { confirmDialog } from "@/lib/confirm-dialog";
import { toast } from "@/lib/toast";

type Status = "idle" | "syncing" | "success" | "error";

export function SyncStatus() {
  const [userId, setUserIdState] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // 是否显示完整 ID（默认脱敏）
  const [revealId, setRevealId] = useState(false);
  // 导入已有 ID 模式
  const [importing, setImporting] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [importError, setImportError] = useState("");

  const refresh = useCallback(async () => {
    const id = await getUserId();
    setUserIdState(id);
    setLastSync(await getLastSyncedAt());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload() {
    setStatus("syncing");
    setMessage("");
    try {
      await uploadAll();
      setStatus("success");
      setMessage("已上传到云端");
      toast.success("已上传到云端");
      await refresh();
    } catch (e) {
      setStatus("error");
      const msg = e instanceof Error ? e.message : "上传失败";
      setMessage(msg);
      toast.error(msg);
    }
  }

  async function handleDownload() {
    const ok = await confirmDialog({
      title: "从云端恢复",
      message: "从云端恢复会与本地数据合并（较新者覆盖），确认继续？",
      confirmText: "恢复",
      cancelText: "取消",
    });
    if (!ok) return;
    setStatus("syncing");
    setMessage("");
    try {
      const has = await downloadAll();
      setStatus("success");
      setMessage(has ? "已从云端恢复，正在刷新页面..." : "云端暂无数据");
      if (has) {
        toast.success("已从云端恢复，正在刷新页面...");
      } else {
        toast.info("云端暂无数据");
      }
      await refresh();
      if (has) {
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (e) {
      setStatus("error");
      const msg = e instanceof Error ? e.message : "恢复失败";
      setMessage(msg);
      toast.error(msg);
    }
  }

  async function copyUserId() {
    if (!navigator.clipboard) {
      toast.warning("当前环境不支持复制");
      return;
    }
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      toast.success("已复制完整 ID");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败");
    }
  }

  // 切换到"导入已有 userId"模式
  function startImport() {
    setImporting(true);
    setImportValue("");
    setImportError("");
  }

  function cancelImport() {
    setImporting(false);
    setImportValue("");
    setImportError("");
  }

  // 提交导入：先弹 confirmDialog 二次确认，再保存到 IndexedDB
  async function submitImport() {
    const trimmed = importValue.trim();
    if (!trimmed) {
      setImportError("请粘贴你的 userId");
      return;
    }
    // 二次确认：防止误粘贴他人 ID 导致本地数据被覆盖
    const ok = await confirmDialog({
      title: "确认导入此 ID",
      message: `导入此 ID 后，本地 userId 将被替换，下次「从云端恢复」会拉取该 ID 的云端数据。请确认这是你自己的 ID：${maskUserId(trimmed)}`,
      confirmText: "确认导入",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    try {
      await setUserId(trimmed);
      await refresh();
      setImporting(false);
      setImportValue("");
      setImportError("");
      setMessage("userId 已切换，点击下方「从云端恢复」即可拉取旧设备数据");
      setStatus("idle");
      toast.success("userId 已切换，可「从云端恢复」拉取旧设备数据");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "导入失败";
      setImportError(msg);
      toast.error(msg);
    }
  }

  const statusText =
    status === "syncing"
      ? "同步中…"
      : status === "success"
        ? "已同步"
        : status === "error"
          ? "同步失败"
          : "未同步";

  const statusColor =
    status === "success"
      ? "text-green-600 dark:text-green-400"
      : status === "error"
        ? "text-red-600 dark:text-red-400"
        : status === "syncing"
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-500 dark:text-gray-400";

  // 脱敏显示值
  const displayId = revealId ? userId : maskUserId(userId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${statusColor}`}>{statusText}</span>
        {lastSync && (
          <span className="text-xs text-gray-400 dark:text-gray-500">上次同步：{formatTime(lastSync)}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">用户 ID</label>
        {importing ? (
          <div className="mt-1 space-y-2">
            <input
              type="text"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="粘贴旧设备的 userId"
              autoFocus
              className="w-full rounded border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-2 py-1 font-mono text-xs"
            />
            {importError && (
              <p className="text-xs text-red-600 dark:text-red-400">{importError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={submitImport}
                className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 transition-colors"
              >
                确认导入
              </button>
              <button
                onClick={cancelImport}
                className="rounded-lg border dark:border-gray-600 px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex gap-2">
            <input
              value={displayId}
              readOnly
              aria-label="用户 ID"
              className="w-full rounded border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 px-2 py-1 font-mono text-xs"
            />
            <button
              onClick={() => setRevealId((v) => !v)}
              className="shrink-0 flex items-center gap-1 rounded-lg border dark:border-gray-600 px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={revealId ? "隐藏完整 ID" : "显示完整 ID"}
            >
              <Icon name={revealId ? "check-circle" : "info"} className="w-3.5 h-3.5" />
              {revealId ? "隐藏" : "显示"}
            </button>
            <button
              onClick={copyUserId}
              className="shrink-0 flex items-center gap-1 rounded-lg border dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="复制完整 ID（脱敏显示不影响复制内容）"
            >
              <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
              {copied ? "已复制" : "复制"}
            </button>
          </div>
        )}
        {!importing && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            跨设备同步：旧设备先「上传到云端」并复制此 ID；新设备点击「导入已有 ID」粘贴即可。默认脱敏显示防止他人偷看。
          </p>
        )}
      </div>

      {message && <p className={`text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"}`}>{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleUpload}
          disabled={status === "syncing"}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Icon name="cloud" className="w-4 h-4" />
          上传到云端
        </button>
        <button
          onClick={handleDownload}
          disabled={status === "syncing"}
          className="flex items-center gap-1.5 rounded-lg border dark:border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <Icon name="cloud-download" className="w-4 h-4" />
          从云端恢复
        </button>
        {!importing && (
          <button
            onClick={startImport}
            className="flex items-center gap-1.5 rounded-lg border border-blue-300 dark:border-blue-700 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            导入已有 ID
          </button>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}
