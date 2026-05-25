import React from 'react';

/**
 * Card de statistique avec icône, valeur et label.
 */
export default function StatCard({ icon, label, value, sub, accent = '#7c3aed' }) {
  return (
    <div className="glass-card p-6 flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white truncate">{value}</p>
        <p className="text-sm text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}
