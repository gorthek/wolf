import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMember, fetchMemberRank } from '../utils/api';
import { formatTime, progressPercent } from '../utils/formatTime';

export default function MemberDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, r] = await Promise.all([fetchMember(userId), fetchMemberRank(userId)]);
        setMember(m);
        setRank(r);
      } catch {
        setError('Membre introuvable ou API inaccessible.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
        <p className="text-red-400 font-semibold mb-4">⚠️ {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-violet-400 hover:underline"
        >
          ← Retour
        </button>
      </div>
    );
  }

  const pct = rank ? progressPercent(rank.weekly_seconds, rank.top1_weekly_seconds) : 0;

  const lastSession = member.last_session_date
    ? new Date(member.last_session_date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="space-y-6">
      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Retour au classement
      </button>

      {/* Header membre */}
      <div className="glass-card p-6 flex items-center gap-6">
        <img
          src={`https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 6}.png`}
          alt=""
          className="w-16 h-16 rounded-full"
          style={{ border: '2px solid #7c3aed' }}
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{member.user_tag}</h1>
          <p className="text-slate-400 text-sm mt-1">ID : {member.user_id}</p>
          {member.ignored ? (
            <span
              className="inline-block text-xs px-2 py-0.5 rounded mt-2"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              Ignoré du tracking
            </span>
          ) : null}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Temps vocal (semaine)</p>
          <p className="text-2xl font-bold" style={{ color: '#9f67fa' }}>
            {formatTime(member.weekly_seconds)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{member.sessions_weekly} sessions</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Temps vocal (alltime)</p>
          <p className="text-2xl font-bold text-white">{formatTime(member.alltime_seconds)}</p>
          <p className="text-xs text-slate-500 mt-1">{member.sessions_alltime} sessions</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dernière session</p>
          <p className="text-sm font-semibold text-white">{lastSession}</p>
          <p className="text-xs text-slate-500 mt-1">{formatTime(member.last_session_duration)}</p>
        </div>
      </div>

      {/* Rangs */}
      {rank && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Classements</h2>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#9f67fa' }}>#{rank.weekly_rank}</p>
              <p className="text-xs text-slate-400 mt-1">Cette semaine</p>
            </div>
            <div
              className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#818cf8' }}>#{rank.alltime_rank}</p>
              <p className="text-xs text-slate-400 mt-1">Alltime</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Progression vs #1 (semaine)</span>
              <span className="font-semibold" style={{ color: '#9f67fa' }}>{pct}%</span>
            </div>
            <div className="w-full h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #6366f1)',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{formatTime(rank.weekly_seconds)}</span>
              <span>Top 1 : {formatTime(rank.top1_weekly_seconds)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
