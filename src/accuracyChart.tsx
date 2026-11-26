import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface AccuracyPoint {
  time: string;
  sec: number;
  accuracy: number;
}

declare global {
  interface Window {
    renderAccuracyTrendChart?: (data: AccuracyPoint[]) => void;
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}

function AccuracyTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0]?.value ?? 100;
  return (
    <div
      style={{
        background: 'rgba(6, 10, 22, 0.96)',
        border: '1px solid rgba(34, 211, 238, 0.35)',
        borderRadius: '6px',
        padding: '4px 8px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        color: '#f8fafc',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: '9px' }}>{label}</div>
      <div style={{ color: '#10b981', fontWeight: 800 }}>{val}% ACC</div>
    </div>
  );
}

function AccuracyTrendChart({ data }: { data: AccuracyPoint[] }) {
  const safeData: AccuracyPoint[] =
    data && data.length >= 2
      ? data
      : [
          { time: '0:00', sec: 0, accuracy: data?.[0]?.accuracy ?? 100 },
          { time: '0:01', sec: 1, accuracy: data?.[0]?.accuracy ?? 100 },
        ];

  const minAcc = Math.min(...safeData.map((d) => d.accuracy));
  const yMin = Math.max(0, Math.floor((minAcc - 8) / 10) * 10);

  return (
    <div style={{ width: '100%', height: 96 }}>
      <ResponsiveContainer width="100%" height={96} minWidth={0}>
        <LineChart data={safeData} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            minTickGap={22}
          />
          <YAxis
            domain={[yMin, 100]}
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<AccuracyTooltip />} />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#10b981"
            strokeWidth={2}
            dot={safeData.length <= 16 ? { r: 2.2, fill: '#10b981', strokeWidth: 0 } : false}
            activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 1.5 }}
            isAnimationActive={true}
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

let chartRoot: Root | null = null;

export function renderAccuracyTrendChart(data: AccuracyPoint[]): void {
  const container = document.getElementById('goAccuracyChartMount');
  if (!container) return;
  if (!chartRoot) {
    chartRoot = createRoot(container);
  }
  chartRoot.render(<AccuracyTrendChart data={data} />);
}

window.renderAccuracyTrendChart = renderAccuracyTrendChart;
