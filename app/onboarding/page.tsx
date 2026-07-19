"use client";

// app/onboarding/page.tsx
// P1 Onboarding 重做 — 10 秒 Aha Moment（乔布斯视角）
//
// 旧版问题：3 步表单（主题→学习量→API Key），用户填完仍然不知道产品能给他什么
// 新版设计：
//   第 1 步：展示 5 个预设知识库卡片，点击任一卡片立即弹出 MindMap 脑图预览
//           —— 用户 10 秒内看到"这就是我想要的知识树"（Aha Moment）
//   第 2 步：弹窗内确认 + 合并学习量+API Key 配置（一屏搞定）
//   第 3 步：基于预设创建 plan + 跳转 /learn/{planId}
//
// 关键改动：
//   - 取消"输入主题"前置步骤，改为"先看预设脑图，再决定"
//   - 自定义主题用户可点底部"输入自定义主题"链接跳转 /learn
//   - 复用 PRESETS + MindMap 组件，零新增数据源

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setItem, set as dbSet } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan } from "@/lib/types";
import { PRESETS, type PresetMeta } from "@/lib/presets";
import { MindMap } from "@/components/MindMap";
import { Icon } from "@/components/Icon";
import { Button, Input, Slider } from "@/components/ui";
import { nanoid } from "nanoid";

export default function OnboardingPage() {
  const router = useRouter();
  const [activePreset, setActivePreset] = useState<PresetMeta | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [maxNewPerDay, setMaxNewPerDay] = useState(2);
  const [aiKey, setAiKey] = useState("");
  const [saving, setSaving] = useState(false);

  // 点击预设卡片 → 立即弹出 MindMap 预览（Aha Moment）
  function previewPreset(p: PresetMeta) {
    setActivePreset(p);
  }

  function closePreset() {
    setActivePreset(null);
  }

  // 确认使用此预设 → 创建 plan + 跳转学习页
  async function confirmAndStart() {
    if (!activePreset) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const plan: LearningPlan = {
        id: nanoid(),
        topic: activePreset.topic,
        knowledgeTree: activePreset.knowledgeTree,
        questions: activePreset.questions,
        schedule: activePreset.schedule,
        dailyMinutes,
        maxNewPerDay,
        fsrsMode: "standard",
        createdAt: now,
        updatedAt: now,
      };
      await setItem(KEY_PREFIXES.PLAN + plan.id, plan);

      // 标记 onboarding 完成
      await dbSet("my:onboarding", {
        topic: activePreset.topic,
        presetId: activePreset.id,
        dailyMinutes,
        maxNewPerDay,
        fsrsMode: "standard",
        hasAIKey: aiKey.length > 0,
        completedAt: now,
      });

      router.push(`/learn/${plan.id}`);
    } finally {
      setSaving(false);
    }
  }

  // ============ 第 1 步：预设卡片选择 ============
  if (!activePreset) {
    return (
      <div className="mx-auto max-w-2xl p-4 pb-20">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">欢迎使用 devpath</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            选一个方向，10 秒看到你的知识树 →
          </p>
        </div>

        {/* 预设卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {PRESETS.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => previewPreset(p)}
              className="text-left bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 justify-start"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 flex items-center gap-1">
                    {p.name}
                    <Icon
                      name="chevron-right"
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-2xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* 自定义主题入口 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          没找到想要的方向？{" "}
          <Link
            href="/learn"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            输入自定义主题 →
          </Link>
        </div>
      </div>
    );
  }

  // ============ 第 2 步：MindMap 预览 + 合并配置 ============
  return (
    <div className="mx-auto max-w-2xl p-4 pb-20">
      {/* 顶部返回 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={closePreset}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3"
      >
        <Icon name="chevron-right" className="w-4 h-4 rotate-180" />
        返回选择
      </Button>

      {/* 预设标题 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{activePreset.icon}</span>
        <div>
          <h1 className="text-xl font-bold">{activePreset.name}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activePreset.knowledgeTree.length} 个知识点 ·{" "}
            {activePreset.questions.length} 道题 ·{" "}
            {activePreset.schedule.length} 天计划
          </p>
        </div>
      </div>

      {/* Aha Moment：MindMap 脑图预览 */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-2 border-b dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            知识树脑图预览
          </span>
          <span className="text-xs text-green-600 dark:text-green-400 inline-flex items-center gap-1">
            <Icon name="check" className="w-3 h-3" />
            即点即用
          </span>
        </div>
        <div className="h-[360px]">
          <MindMap
            nodes={activePreset.knowledgeTree}
            topic={activePreset.topic}
            fillHeight
          />
        </div>
      </div>

      {/* 合并配置：学习量 + API Key（一屏） */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            每日学习量：{dailyMinutes} 分钟
          </label>
          <Slider
            min={15}
            max={120}
            step={5}
            value={dailyMinutes}
            onChange={setDailyMinutes}
            className="w-full"
            aria-label="每日学习量（分钟）"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>15min</span>
            <span>120min</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            每日新内容数：{maxNewPerDay} 个
          </label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={maxNewPerDay}
            onChange={setMaxNewPerDay}
            className="w-full"
            aria-label="每日新内容数（个）"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 个</span>
            <span>5 个</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            AI API Key（可选）
          </label>
          <Input
            value={aiKey}
            onChange={(e) => setAiKey(e.target.value)}
            placeholder="sk-... 留空则用预设数据"
            type="password"
          />
          <p className="text-xs text-gray-500 mt-1">
            填入可解锁 AI 重新生成知识树 + 面试题生成（支持 GLM/DeepSeek/MiMo）
          </p>
        </div>
      </div>

      {/* 开始按钮 */}
      <Button
        variant="success"
        size="lg"
        block
        onClick={confirmAndStart}
        loading={saving}
        leftIcon={saving ? undefined : "zap"}
      >
        {saving ? "创建计划中..." : "开始学习 →"}
      </Button>
      <p className="text-center text-xs text-gray-400 mt-2">
        计划创建后可随时在「学习」页用 AI 重新生成
      </p>
    </div>
  );
}
