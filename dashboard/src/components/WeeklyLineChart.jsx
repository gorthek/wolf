import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { toHours } from '../utils/formatTime';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card px-4 py-3 text-sm"
      style={{ border: '1px solid rgba(124,58,237,0.4)' }}
    >
      <p className="font-semibold text-white">{label}</p>
      <p className="text-violet-400">{payload[0].value}h de vocal</p>
      <p className="text-slate-400">{payload[1]?.value} membres actifs</p>
    </div>
  );
}

/**
 * Graphique ligne : évolution hebdomadaire sur les N dernières semaines.
 */
export default function WeeklyLineChart({ history }) {
  const data = history.map((r) => ({
    name: new Date(r.report_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    hours: toHours(r.total_seconds_week || 0),
    members: r.total_members_active || 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Aucun historique disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="h" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="hours"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={{ fill: '#7c3aed', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="members"
          stroke="#6366f1"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
