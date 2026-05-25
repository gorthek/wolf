import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import VocalBarChart from '../components/VocalBarChart';
import WeeklyLineChart from '../components/WeeklyLineChart';
import { fetchOverview, fetchLeaderboard, fetchHistory } from '../utils/api';
import { formatTime } from '../utils/formatTime';

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [ov, lb, hist] = await Promise.all([
          fetchOverview(),
          fetchLeaderboard('weekly', 10),
          fetchHistory(6),
        ]);
        setOverview(ov);
        setLeaderboard(lb.data || []);
        setHistory(hist);
      } catch (err) {
        setError("Impossible de contacter l'API du bot. Assurez-vous que le bot est démarré.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="glass-card p-6 text-center"
        style={{ border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <p className="text-red-400 font-semibold">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
        <p className="text-slate-400 text-sm mt-1">Statistiques vocales du serveur</p>
      </div>

      {/* Cards stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Membres actifs (semaine)"
          value={overview?.active_members_weekly ?? '—'}
          accent="#7c3aed"
        />
        <StatCard
          icon="⏱️"
          label="Total heures semaine"
          value={`${overview?.total_hours_weekly ?? 0}h`}
          accent="#6366f1"
        />
        <StatCard
          icon="🏆"
          label="Top vocal"
          value={overview?.top_member?.user_tag?.split('#')[0] ?? '—'}
          sub={overview?.top_member ? formatTime(overview.top_member.weekly_seconds) : ''}
          accent="#f59e0b"
        />
        <StatCard
          icon="🔁"
          label="Sessions totales"
          value={overview?.total_sessions ?? '—'}
          accent="#22c55e"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4">Top 10 — Cette semaine</h2>
          {leaderboard.length > 0 ? (
            <VocalBarChart data={leaderboard} type="weekly" />
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">Aucune donnée</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4">Évolution hebdomadaire</h2>
          <WeeklyLineChart history={history} />
          <p className="text-xs text-slate-500 mt-3">
            — Heures vocales &nbsp;- - Membres actifs
          </p>
        </div>
      </div>
    </div>
  );
}
