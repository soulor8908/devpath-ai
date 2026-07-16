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
      <RechartsRadar data={data} outerRadius="75%">
        <PolarGrid />
        <PolarAngleAxis dataKey="node" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} />
        <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
