import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { toHours } from '../utils/formatTime';

const GRADIENT_START = '#7c3aed';
const GRADIENT_END = '#6366f1';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="glass-card px-4 py-3 text-sm"
      style={{ border: '1px solid rgba(124,58,237,0.4)' }}
    >
      <p className="font-semibold text-white">{d.user_tag}</p>
      <p className="text-slate-400">{d.label}</p>
    </div>
  );
}

/**
 * Graphique barres : top membres par temps vocal.
 */
export default function VocalBarChart({ data, type = 'weekly' }) {
  const field = type === 'alltime' ? 'alltime_seconds' : 'weekly_seconds';

  const chartData = data.slice(0, 10).map((m) => ({
    name: m.user_tag.split('#')[0], // Pseudo sans discriminant
    user_tag: m.user_tag,
    hours: toHours(m[field] || m.seconds || 0),
    label: `${toHours(m[field] || m.seconds || 0)}h`,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GRADIENT_START} stopOpacity={0.9} />
            <stop offset="100%" stopColor={GRADIENT_END} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          unit="h"
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
        <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
