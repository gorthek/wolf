const express = require('express');
const cors = require('cors');
const { pool } = require('../utils/db');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * GET /api/leaderboard?type=weekly|alltime&limit=10
 * Retourne le classement JSON
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const type = req.query.type === 'alltime' ? 'alltime' : 'weekly';
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const guildId = process.env.GUILD_ID;

    const field = type === 'alltime' ? 'alltime_seconds' : 'weekly_seconds';
    const sessionsField = type === 'alltime' ? 'sessions_alltime' : 'sessions_weekly';

    const [rows] = await pool.query(
      `SELECT user_id, user_tag, ${field} as seconds, ${sessionsField} as sessions,
              weekly_seconds, alltime_seconds, sessions_weekly, sessions_alltime
       FROM voice_stats
       WHERE guild_id = ? AND ignored = 0 AND ${field} > 0
       ORDER BY ${field} DESC
       LIMIT ?`,
      [guildId, limit]
    );

    const result = rows.map((r, i) => ({
      rank: i + 1,
      user_id: r.user_id,
      user_tag: r.user_tag,
      seconds: r.seconds,
      sessions: r.sessions,
      weekly_seconds: r.weekly_seconds,
      alltime_seconds: r.alltime_seconds,
      sessions_weekly: r.sessions_weekly,
      sessions_alltime: r.sessions_alltime,
      avatar_url: `https://cdn.discordapp.com/embed/avatars/${parseInt(r.user_id) % 6}.png`,
    }));

    res.json({ type, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/member/:userId
 * Stats complètes d'un membre
 */
app.get('/api/member/:userId', async (req, res) => {
  try {
    const guildId = process.env.GUILD_ID;
    const { userId } = req.params;

    const [stats] = await pool.query(
      'SELECT * FROM voice_stats WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );

    if (stats.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/member/:userId/rank
 * Rang weekly, alltime + top1 pour barre de progression
 */
app.get('/api/member/:userId/rank', async (req, res) => {
  try {
    const guildId = process.env.GUILD_ID;
    const { userId } = req.params;

    const [stats] = await pool.query(
      'SELECT weekly_seconds, alltime_seconds FROM voice_stats WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );

    if (stats.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    const s = stats[0];

    const [[weeklyRank]] = await pool.query(
      `SELECT COUNT(*) + 1 as rank FROM voice_stats
       WHERE guild_id = ? AND weekly_seconds > ? AND ignored = 0`,
      [guildId, s.weekly_seconds]
    );

    const [[alltimeRank]] = await pool.query(
      `SELECT COUNT(*) + 1 as rank FROM voice_stats
       WHERE guild_id = ? AND alltime_seconds > ? AND ignored = 0`,
      [guildId, s.alltime_seconds]
    );

    const [[top1]] = await pool.query(
      `SELECT weekly_seconds FROM voice_stats
       WHERE guild_id = ? AND ignored = 0
       ORDER BY weekly_seconds DESC LIMIT 1`,
      [guildId]
    );

    res.json({
      weekly_rank: weeklyRank.rank,
      alltime_rank: alltimeRank.rank,
      weekly_seconds: s.weekly_seconds,
      alltime_seconds: s.alltime_seconds,
      top1_weekly_seconds: top1 ? top1.weekly_seconds : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/overview
 * Stats globales du serveur
 */
app.get('/api/overview', async (req, res) => {
  try {
    const guildId = process.env.GUILD_ID;

    const [[overview]] = await pool.query(
      `SELECT
         COUNT(CASE WHEN weekly_seconds > 0 THEN 1 END) as active_weekly,
         SUM(weekly_seconds) as total_weekly_seconds,
         COUNT(*) as total_members
       FROM voice_stats
       WHERE guild_id = ? AND ignored = 0`,
      [guildId]
    );

    const [[topMember]] = await pool.query(
      `SELECT user_tag, weekly_seconds FROM voice_stats
       WHERE guild_id = ? AND ignored = 0
       ORDER BY weekly_seconds DESC LIMIT 1`,
      [guildId]
    );

    const [[sessionCount]] = await pool.query(
      `SELECT COUNT(*) as total FROM voice_sessions WHERE guild_id = ?`,
      [guildId]
    );

    res.json({
      active_members_weekly: overview.active_weekly || 0,
      total_hours_weekly: Math.round((overview.total_weekly_seconds || 0) / 3600 * 10) / 10,
      total_members: overview.total_members || 0,
      top_member: topMember || null,
      total_sessions: sessionCount.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/history?weeks=4
 * Historique des rapports weekly des N dernières semaines
 */
app.get('/api/history', async (req, res) => {
  try {
    const guildId = process.env.GUILD_ID;
    const weeks = Math.min(parseInt(req.query.weeks) || 4, 12);

    const [rows] = await pool.query(
      `SELECT * FROM weekly_reports
       WHERE guild_id = ?
       ORDER BY report_date DESC
       LIMIT ?`,
      [guildId, weeks]
    );

    res.json(rows.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function start() {
  // Railway injecte PORT automatiquement, sinon fallback local
  const port = parseInt(process.env.PORT || process.env.API_PORT) || 3001;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 API REST démarrée sur le port ${port}`);
  });
}

module.exports = { start, app };
