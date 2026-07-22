"use client";

// components/UsernameSetupModal.tsx
// 用户名设置弹窗（可复用）
//
// 设计（乔布斯视角）：
//   用户在"分享"等场景下被阻断时，应原地弹窗完成用户名设置，
//   不应让用户跳到「我的」页面填写再回来——上下文切换会显著降低转化率。
//   该弹窗封装"用户名 + 显示名 + 简介"三字段，覆盖分享/路径等场景的最小信息需求。
//
// 复用场景：
//   1. HomeClient 点击"分享"时，若未设置 username → 弹此 Modal
//   2. onboarding 选择路径后 → 弹此 Modal 顺带让用户设置用户名
//   3. profile 页面"编辑信息"按钮 → 弹此 Modal 替代原 inline 编辑
//
// 数据流（卡帕西视角）：
//   - 打开时从 IndexedDB（key="my:profile"）加载已有 PublicProfile
//   - 保存时合并新字段 → 写 IndexedDB → PUT /api/public/[username] 同步到 KV
//   - 与 app/profile/page.tsx 的 save() 逻辑一致，确保单一事实源
//   - 失败时回滚（不更新外部状态），并向用户展示错误信息

import { useState, useEffect, useCallback } from "react";
import type { PublicProfile, Achievement } from "@/lib/types";
import { getItem as dbGet, setItem as dbSet } from "@/lib/storage/db";
import { listAchievements } from "@/lib/achievements/store";
import { apiFetch } from "@/lib/api-client";
import { scheduleAutoSync } from "@/lib/sync";
import { Icon } from "@/components/Icon";
import { Button, Input, Textarea, Modal } from "@/components/ui";

const STORAGE_KEY = "my:profile";

/** 默认 profile：当用户从未设置时用作基线 */
const DEFAULT_PROFILE: PublicProfile = {
  username: "",
  displayName: "",
  avatar: undefined,
  bio: "",
  visibility: { radar: true, heatmap: true, currentTopic: true, notes: false, achievements: false },
  followerCount: 0,
  followingCount: 0,
  updatedAt: new Date().toISOString(),
};

export interface UsernameSetupModalProps {
  open: boolean;
  onClose: () => void;
  /** 保存成功后回调，参数为新保存的 profile */
  onSaved?: (profile: PublicProfile) => void;
  /** 自定义标题（默认"设置用户名"）*/
  title?: string;
  /** 自定义描述（默认"用户名用于生成你的公开主页地址"）*/
  description?: string;
  /** 是否允许点击遮罩/ESC 关闭（默认 true；分享场景应保持 true，避免强制困住用户）*/
  allowClose?: boolean;
  /** 是否显示头像 URL 字段（默认 false；profile 页面编辑时设 true）*/
  showAvatar?: boolean;
}

export function UsernameSetupModal({
  open,
  onClose,
  onSaved,
  title = "设置用户名",
  description = "用户名用于生成你的公开主页地址，设置后即可分享给朋友。",
  allowClose = true,
  showAvatar = false,
}: UsernameSetupModalProps) {
  const [profile, setProfile] = useState<PublicProfile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 打开时加载已有 profile
  const loadProfile = useCallback(async () => {
    try {
      const stored = await dbGet<PublicProfile>(STORAGE_KEY);
      if (stored) {
        setProfile({ ...DEFAULT_PROFILE, ...stored });
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    } catch {
      setProfile(DEFAULT_PROFILE);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setLoaded(false);
      setError(null);
      void loadProfile();
    }
  }, [open, loadProfile]);

  function update<K extends keyof PublicProfile>(key: K, value: PublicProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function handleSave() {
    const username = profile.username.trim();
    if (!username) {
      setError("请输入用户名");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("用户名只能包含字母、数字、下划线和连字符");
      return;
    }
    if (username.length < 2 || username.length > 32) {
      setError("用户名长度需 2-32 个字符");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated: PublicProfile = {
        ...profile,
        username: username.toLowerCase(),
        updatedAt: new Date().toISOString(),
      };
      await dbSet(STORAGE_KEY, updated);

      // 同步到 Cloudflare KV（与 profile 页面 save 逻辑一致）
      let achievementsPayload: Achievement[] | undefined = undefined;
      if (updated.visibility.achievements) {
        try {
          achievementsPayload = await listAchievements();
        } catch {
          achievementsPayload = [];
        }
      }
      try {
        const res = await apiFetch(
          `/api/public/${encodeURIComponent(updated.username)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile: updated, achievements: achievementsPayload }),
          },
        );
        if (!res.ok) {
          // 同步失败：profile 已写入本地 IndexedDB（本地可用），仅同步失败不阻断主流程
          let serverMsg = "";
          try {
            const errBody = (await res.json()) as { message?: string; error?: string };
            serverMsg = errBody.message ?? errBody.error ?? "";
          } catch {
            serverMsg = `HTTP ${res.status}`;
          }
          console.warn("公开主页同步失败:", res.status, serverMsg);
        } else {
          scheduleAutoSync();
        }
      } catch (syncErr) {
        // 网络异常等：仅 console.warn，不阻断本地保存
        console.warn("公开主页同步异常:", syncErr);
      }

      onSaved?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={allowClose ? onClose : () => {}}
      title={title}
      description={description}
      size="sm"
      closeOnBackdropClick={allowClose}
      closeOnEsc={allowClose}
      showCloseButton={allowClose}
      footer={
        <>
          {allowClose && (
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              取消
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            leftIcon="check"
          >
            保存
          </Button>
        </>
      }
    >
      {!loaded ? (
        <div className="flex items-center justify-center py-6">
          <Icon name="loader" className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              用户名（URL 标识）
            </label>
            <Input
              value={profile.username}
              onChange={(e) =>
                update(
                  "username",
                  e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase(),
                )
              }
              placeholder="alice"
              className="mt-1"
              autoFocus
              aria-describedby="username-help"
            />
            {profile.username && (
              <p id="username-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                主页地址：/u/{profile.username}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              显示名（可选）
            </label>
            <Input
              value={profile.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              placeholder="Alice"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              简介（可选）
            </label>
            <Textarea
              value={profile.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={2}
              placeholder="一句话介绍自己"
              className="mt-1"
            />
          </div>
          {showAvatar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                头像 URL（可选）
              </label>
              <Input
                value={profile.avatar ?? ""}
                onChange={(e) => update("avatar", e.target.value || undefined)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-2 text-sm text-red-700 dark:text-red-300"
            >
              <Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle mr-1" />
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
