"use client";

// app/rest/page.tsx
// 高效休息页面：478 呼吸引导 + 能量评分 + 休息方法库（结构化 + 折叠 + 能量联动）
// 参考主项目 rest/methods.md 内容，去 GitHub 依赖，内置完整原理/步骤/适用场景

import { useState } from "react";
import { BreathTimer } from "@/components/BreathTimer";
import { REST_METHODS, getMethodsByEnergy, type RestMethod } from "@/lib/rest-methods";
import { Icon } from "@/components/Icon";

// 可折叠的方法卡片
function MethodCard({ method, defaultOpen }: { method: RestMethod; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{method.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{method.name}</p>
            <p className="text-xs text-gray-400">{method.duration}</p>
          </div>
        </div>
        <span className={`text-gray-400 text-xs transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 text-xs">
          <div>
            <span className="text-gray-400">原理：</span>
            <span className="text-gray-600">{method.principle}</span>
          </div>
          {method.steps && method.steps.length > 0 && (
            <div>
              <span className="text-gray-400 block mb-1">操作步骤：</span>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                {method.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          <div>
            <span className="text-gray-400">适用：</span>
            <span className="text-gray-600">{method.suitableFor}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestPage() {
  const [energy, setEnergy] = useState<number>(3);
  const recommended = getMethodsByEnergy(energy);
  const others = REST_METHODS.filter((m) => !recommended.includes(m));

  const energyLabel =
    energy <= 2 ? "低能量 · 优先深度恢复" :
    energy === 3 ? "中等疲劳 · 切换重置" :
    "状态良好 · 轻量切换";

  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-20">
      <h1 className="text-lg font-bold"><Icon name="moon" className="w-4 h-4 inline-block align-middle" /> 高效休息</h1>

      <BreathTimer />

      {/* 能量评分 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm font-medium mb-2">当前能量</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setEnergy(n)}
              className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                energy === n ? "bg-black text-white" : "bg-gray-100 text-gray-400"
              }`}
              aria-label={`能量 ${n} 分`}
              aria-pressed={energy === n}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">{energyLabel}</p>
      </div>

      {/* 按能量推荐 */}
      {recommended.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            <Icon name="target" className="w-4 h-4 inline-block align-middle" /> 适合你现在的方法（{recommended.length}）
          </h2>
          <div className="space-y-2">
            {recommended.map((m, i) => (
              <MethodCard key={m.id} method={m} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      )}

      {/* 其他方法 */}
      {others.length > 0 && (
        <details className="mt-2">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">
            其他方法（{others.length}）
          </summary>
          <div className="space-y-2 mt-2">
            {others.map((m) => (
              <MethodCard key={m.id} method={m} />
            ))}
          </div>
        </details>
      )}
    </main>
  );
}
