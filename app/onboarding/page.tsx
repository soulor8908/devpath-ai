"use client";

// app/onboarding/page.tsx
// V2 极简化：3 选 1 → 路径预览 → 一键开始（零配置）
//
// 设计（乔布斯视角）：
//   - 用户目标是"拿到 offer"，不是"配置学习参数"
//   - 默认值从路径定义取，不让用户选
//   - API Key 在第一次需要 AI 生成时再提示，不堵在门口
//   - 跳转 /train 而不是 /learn，立即进入沉浸式训练

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setItem, set as dbSet } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type CareerPath as CareerPathType, type CareerPathNode } from "@/lib/types";
import { CAREER_PATHS, getCareerPathNodes } from "@/lib/onboarding/career-paths";
import { PRESET_METAS, loadPresetData } from "@/lib/presets";
import { hasDemoData, clearDemoData } from "@/lib/demo/preset-data";
import { confirmDialog } from "@/lib/confirm-dialog";
import { savePlanSummary, checkOverwriteOrCreate } from "@/lib/plan-summary";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { nanoid } from "nanoid";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<CareerPathType | null>(null);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (!selectedPath) return;
    setStarting(true);
    // 2026-07-30 防御性修复：补 catch + loadPresetData 失败不创建空 plan
    // 旧版只有 finally，异常时用户看不到错误，按钮反复点击"没反应"
    try {
      // 2026-07-27 修复（用户反馈"可以添加两个名字相同的知识库"）：
      //   以名字作为唯一键去重，遇到重名弹 confirm"是否覆盖"：
      //     - 覆盖 → 删除旧计划（含关联卡 / 日志）+ 创建新计划
      //     - 取消 → 不创建，留在 onboarding 页让用户重选路径
      //   旧的"进入已有 vs 仍要创建"会让用户选"仍要创建"产生重名，不符合唯一键语义
      //   注意：career path 的 topic 用 selectedPath.title（如"前端工程师 → AI 工程师"），
      //   与 preset.topic 一致，因此查重能命中之前创建过的同路径计划。
      const overwrite = await checkOverwriteOrCreate(selectedPath.title);
      if (!overwrite.shouldProceed) return;

      // 用户选择路径进入学习时，若存在 demo 示例数据，先询问是否清除
      // 避免示例计划/复习卡片干扰真实学习流程
      const hasDemo = await hasDemoData();
      if (hasDemo) {
        const ok = await confirmDialog({
          title: "清除示例数据？",
          message: "检测到首次访问注入的示例数据。已选择职业路径，是否清除示例数据？",
          confirmText: "清除",
          cancelText: "保留",
          danger: true,
        });
        if (ok) await clearDemoData();
      }

      const now = new Date().toISOString();
      const preset = await loadPresetData(selectedPath.linkedPresetId);
      // 2026-07-30：preset 加载失败时不创建空 plan（用户会看到空计划列表更困惑）
      // loadPresetData 内部已有 8s 超时 + try/catch，返回 undefined 说明确实加载失败
      if (!preset) {
        alert("预设数据加载失败，请检查网络后重试");
        return;
      }
      const plan: LearningPlan = {
        id: nanoid(),
        topic: selectedPath.title,
        knowledgeTree: preset.knowledgeTree,
        questions: preset.questions,
        schedule: preset.schedule,
        dailyMinutes: selectedPath.dailyMinutesDefault,
        maxNewPerDay: selectedPath.maxNewPerDayDefault,
        fsrsMode: "standard",
        createdAt: now,
        updatedAt: now,
      };
      await setItem(KEY_PREFIXES.PLAN + plan.id, plan);
      // 2026-07-26 补丁：保存 summary 让 listPlanSummaries 能立即读到（避免查重失效）
      // 旧版只 setItem 不 savePlanSummary，依赖 migrateSummaries 兜底补全——但补全时机
      // 不确定（用户下次进入 /learn/list 时才触发），导致 onboarding 创建后立即再次
      // 进入 onboarding 选同一路径时，findExistingPlanByTopic 读不到上次创建的 summary。
      await savePlanSummary(plan);
      await dbSet("my:onboarding", {
        pathId: selectedPath.id,
        planId: plan.id,
        completedAt: now,
      });
      // 立即开始第一个训练会话
      router.push(`/train?planId=${plan.id}`);
    } catch (e) {
      console.error("[onboarding] 启动失败:", e);
      alert(e instanceof Error ? e.message : "启动失败，请重试");
    } finally {
      setStarting(false);
    }
  }

  // 从 preset 动态获取路径预览节点（异步按需加载，避免把全部 preset 打进主 bundle）
  const [previewNodes, setPreviewNodes] = useState<CareerPathNode[]>([]);
  useEffect(() => {
    if (!selectedPath) {
      setPreviewNodes([]);
      return;
    }
    let cancelled = false;
    // 2026-07-30：补 .catch() 防止未捕获 rejection
    loadPresetData(selectedPath.linkedPresetId)
      .then((preset) => {
        if (cancelled) return;
        if (!preset) {
          setPreviewNodes([]);
          return;
        }
        setPreviewNodes(getCareerPathNodes(selectedPath, preset.knowledgeTree));
      })
      .catch(() => {
        if (!cancelled) setPreviewNodes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPath]);

  // 第一步：3 选 1
  if (!selectedPath) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto pb-20 dark:bg-gray-900">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">你想成为哪种 AI 人才？</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            选一个方向，我们立即为你定制学习路径
          </p>
        </div>

        <div className="w-full space-y-3">
          {CAREER_PATHS.map((path) => (
            <Button
              key={path.id}
              variant="outline"
              onClick={() => setSelectedPath(path)}
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-5 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group justify-start h-auto items-start"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">{path.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    {path.subtitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {path.description}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" />
                      约 {path.weeksEstimate} 周
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="target" className="w-3 h-3" />
                      {PRESET_METAS.find((m) => m.id === path.linkedPresetId)?.knowledgeNodeCount ?? 0} 个知识点
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" className="w-3 h-3" />
                      每天 {path.dailyMinutesDefault} 分钟
                    </span>
                  </div>
                </div>
                <Icon
                  name="chevron-right"
                  className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-2"
                />
              </div>
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 text-center">
          已经知道自己要学什么？{" "}
          <Link href="/learn/new" className="text-blue-500 hover:underline">
            自定义学习主题 →
          </Link>
        </p>
      </div>
    );
  }

  // 第二步：路径预览 + 一键开始（零配置）
  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto pb-20 dark:bg-gray-900">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedPath(null)}
        className="self-start mb-4"
      >
        <Icon name="chevron-right" className="w-4 h-4 rotate-180 mr-1" />
        重选
      </Button>

      <div className="text-center mb-6">
        <span className="text-6xl mb-4 block" aria-hidden="true">{selectedPath.icon}</span>
        <h1 className="text-2xl font-bold mb-2">{selectedPath.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{selectedPath.subtitle}</p>
      </div>

      {/* Aha Moment 卡片 */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-xl">
        <p className="text-sm opacity-80 mb-1">看到了。</p>
        <p className="text-xl font-bold mb-2">
          每天投入 {selectedPath.dailyMinutesDefault} 分钟，预计
          <span className="text-yellow-300"> {selectedPath.weeksEstimate} 周 </span>
          可以准备好面试。
        </p>
        <p className="text-sm opacity-80">我们从今天开始。</p>
      </div>

      {/* 路径节点预览——从 preset 知识库动态获取 */}
      {previewNodes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
            你的学习路径（前 {previewNodes.length} 个知识点预览）
          </p>
          <div className="space-y-0">
            {previewNodes.map((node, i) => (
              <div key={node.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      node.isMilestone
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {node.isMilestone ? (
                      <Icon name="star" className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < previewNodes.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-600" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className="font-medium text-sm">{node.title}</p>
                  {node.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {node.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {/* 终点线 */}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Icon name="check" className="w-4 h-4 text-white" />
              </div>
              <p className="font-medium text-green-600 dark:text-green-400">
                拿到 offer <span aria-hidden="true">🏆</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        variant="success"
        size="lg"
        block
        onClick={handleStart}
        loading={starting}
        className="text-lg py-4 rounded-full shadow-lg"
        leftIcon={starting ? undefined : "zap"}
      >
        {starting ? "准备中..." : "开始第一次训练 →"}
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">{selectedPath.cta}</p>
    </div>
  );
}
