import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Ligne d'un membre dans le tableau classement.
 */
export default function MemberRow({ member, rank, type }) {
  const navigate = useNavigate();
  const seconds = type === 'alltime' ? member.alltime_seconds : member.weekly_seconds;
  const sessions = type === 'alltime' ? member.sessions_alltime : member.sessions_weekly;

  const medal = rank <= 3 ? MEDALS[rank - 1] : null;

  return (
    <tr
      className="border-b cursor-pointer transition-colors duration-150"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      onClick={() => navigate(`/member/${member.user_id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.06)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Rang */}
      <td className="py-3 px-4 w-16">
        {medal ? (
          <span className="text-lg">{medal}</span>
        ) : (
          <span className="text-slate-500 font-mono text-sm">#{rank}</span>
        )}
      </td>

      {/* Avatar + pseudo */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={member.avatar_url || `https://cdn.discordapp.com/embed/avatars/${rank % 6}.png`}
            alt=""
            className="w-8 h-8 rounded-full"
            style={{ border: '1px solid rgba(124,58,237,0.3)' }}
            onError={(e) => {
              e.target.src = `https://cdn.discordapp.com/embed/avatars/${rank % 6}.png`;
            }}
          />
          <span className="text-white font-medium text-sm">{member.user_tag}</span>
        </div>
      </td>

      {/* Temps */}
      <td className="py-3 px-4 text-right">
        <span className="font-semibold" style={{ color: '#9f67fa' }}>{formatTime(seconds)}</span>
      </td>

      {/* Sessions */}
      <td className="py-3 px-4 text-right text-slate-400 text-sm">{sessions}</td>

      {/* Alltime */}
      <td className="py-3 px-4 text-right text-slate-500 text-sm">
        {formatTime(member.alltime_seconds)}
      </td>
    </tr>
  );
}
