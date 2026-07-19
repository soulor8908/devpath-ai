"use client";

// components/RadarChartContent.tsx
// 雷达图渲染组件（重依赖 recharts，通过 dynamic import 懒加载）
// 由 RadarChart.tsx 包装，不直接使用

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface ChartDataItem {
  node: string;
  value: number;
}

interface Props {
  data: ChartDataItem[];
}

export function RadarChartContent({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* className + currentColor 让 Recharts 内部 SVG 跟随 Tailwind dark variant */}
      <RechartsRadar data={data} outerRadius="75%" className="text-gray-300 dark:text-gray-600">
        <PolarGrid stroke="currentColor" />
        <PolarAngleAxis dataKey="node" tick={{ fontSize: 12, fill: "currentColor" }} className="text-gray-600 dark:text-gray-300" />
        <PolarRadiusAxis domain={[0, 100]} tick={false} stroke="currentColor" />
        <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
