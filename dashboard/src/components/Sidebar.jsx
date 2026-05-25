import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Vue d\'ensemble', icon: '📊' },
  { to: '/leaderboard', label: 'Classement', icon: '🏆' },
];

export default function Sidebar() {
  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 flex flex-col py-8 px-4"
      style={{
        background: 'rgba(16, 16, 26, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐺</span>
          <div>
            <p className="font-bold text-white text-lg leading-tight">Bot Wolf</p>
            <p className="text-xs" style={{ color: '#7c3aed' }}>Vocal Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))', border: '1px solid rgba(124,58,237,0.3)' }
                : {}
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs text-slate-500">Bot Wolf v1.0</p>
        <p className="text-xs text-slate-600">Dashboard local</p>
      </div>
    </aside>
  );
}
