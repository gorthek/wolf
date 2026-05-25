import React, { useEffect, useState, useMemo } from 'react';
import MemberRow from '../components/MemberRow';
import { fetchLeaderboard } from '../utils/api';

export default function Leaderboard() {
  const [type, setType] = useState('weekly');
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchLeaderboard(type, 50)
      .then((res) => setMembers(res.data || []))
      .catch(() => setError("Impossible de contacter l'API."))
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    return members.filter((m) =>
      m.user_tag.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Classement</h1>
        <p className="text-slate-400 text-sm mt-1">Temps vocal des membres du serveur</p>
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Toggle Weekly / Alltime */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid rgba(124,58,237,0.3)' }}
        >
          {['weekly', 'alltime'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="px-4 py-2 text-sm font-medium transition-colors duration-150"
              style={
                type === t
                  ? { background: '#7c3aed', color: '#fff' }
                  : { background: 'transparent', color: '#94a3b8' }
              }
            >
              {t === 'weekly' ? '📅 Semaine' : '🏆 Alltime'}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher un pseudo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm rounded-lg flex-1 max-w-xs"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            outline: 'none',
          }}
        />
      </div>

      {/* Tableau */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Chargement...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">Aucun résultat</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr
                className="text-xs uppercase text-slate-500 text-left"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <th className="py-3 px-4 w-16">Rang</th>
                <th className="py-3 px-4">Membre</th>
                <th className="py-3 px-4 text-right">
                  {type === 'weekly' ? 'Semaine' : 'Alltime'}
                </th>
                <th className="py-3 px-4 text-right">Sessions</th>
                <th className="py-3 px-4 text-right">Alltime</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <MemberRow key={m.user_id} member={m} rank={i + 1} type={type} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
