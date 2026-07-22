// lib/types/public-profile.ts
// 公开主页 + 用户数据云端备份领域类型

// 公开主页
export interface PublicProfile {
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  visibility: {
    radar: boolean;
    heatmap: boolean;
    currentTopic: boolean;
    notes: boolean;
    /** 成就墙是否公开（默认 false，用户需显式开启） */
    achievements: boolean;
  };
  followerCount: number;
  followingCount: number;
  updatedAt: string;
}

// 用户数据云端备份（全量同步：IndexedDB 所有 key-value 打包）
export interface UserBackup {
  userId: string;
  updatedAt: string;
  version: number;
  data: Record<string, unknown>; // 所有 IndexedDB key-value
}
