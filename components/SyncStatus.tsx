"use client";

// components/SyncStatus.tsx
// 数据同步状态组件：显示同步状态 + 上次同步时间 + 手动上传 + 跨设备恢复
// 支持导入已有 userId：在新设备粘贴旧 ID 即可继承云端数据
// 可在 profile 页面或首页使用。

import { useState, useEffect, useCallback } from "react";
import { getUserId, setUserId, uploadAll, downloadAll, getLastSyncedAt } from "@/lib/sync";
import { Icon } from "@/components/Icon";

type Status = "idle" | "syncing" | "success" | "error";

export function SyncStatus() {
  const [userId, setUserIdState] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      await refresh();
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "上传失败");
    }
  }

  async function handleDownload() {
    if (!window.confirm("从云端恢复会与本地数据合并（较新者覆盖），确认继续？")) return;
    setStatus("syncing");
    setMessage("");
    try {
      const has = await downloadAll();
      setStatus("success");
      setMessage(has ? "已从云端恢复，正在刷新页面..." : "云端暂无数据");
      await refresh();
      // 恢复后自动刷新页面以加载新数据
      if (has) {
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "恢复失败");
    }
  }

  function copyUserId() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // 提交导入：保存到 IndexedDB，并提示用户从云端恢复
  async function submitImport() {
    const trimmed = importValue.trim();
    if (!trimmed) {
      setImportError("请粘贴你的 userId");
      return;
    }
    try {
      await setUserId(trimmed);
      await refresh();
      setImporting(false);
      setImportValue("");
      setImportError("");
      setMessage("userId 已切换，点击下方「从云端恢复」即可拉取旧设备数据");
      setStatus("idle");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "导入失败");
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
      ? "text-green-600"
      : status === "error"
        ? "text-red-600"
        : status === "syncing"
          ? "text-blue-600"
          : "text-gray-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${statusColor}`}>{statusText}</span>
        {lastSync && (
          <span className="text-xs text-gray-400">上次同步：{formatTime(lastSync)}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">用户 ID</label>
        {importing ? (
          <div className="mt-1 space-y-2">
            <input
              type="text"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="粘贴旧设备的 userId"
              autoFocus
              className="w-full rounded border px-2 py-1 font-mono text-xs"
            />
            {importError && (
              <p className="text-xs text-red-600">{importError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={submitImport}
                className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                确认导入
              </button>
              <button
                onClick={cancelImport}
                className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex gap-2">
            <input
              value={userId}
              readOnly
              className="w-full rounded border bg-gray-50 px-2 py-1 font-mono text-xs"
            />
            <button
              onClick={copyUserId}
              className="shrink-0 flex items-center gap-1 rounded-lg border dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
              {copied ? "已复制" : "复制"}
            </button>
          </div>
        )}
        {!importing && (
          <p className="mt-1 text-xs text-gray-500">
            跨设备同步：旧设备先「上传到云端」并复制此 ID；新设备点击「导入已有 ID」粘贴即可
          </p>
        )}
      </div>

      {message && <p className={`text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`}>{message}</p>}

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
