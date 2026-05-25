const { pool } = require('../utils/db');

// Map en mémoire : userId → { joinTime, channelId }
const activeSessions = new Map();

/**
 * Enregistre l'entrée en vocal d'un membre.
 */
async function handleJoin(member, channelId) {
  const userId = member.id;

  // Vérifier si le membre est ignoré
  const [rows] = await pool.query(
    'SELECT ignored FROM voice_stats WHERE user_id = ? AND guild_id = ?',
    [userId, member.guild.id]
  );
  if (rows.length > 0 && rows[0].ignored) return;

  activeSessions.set(userId, { joinTime: new Date(), channelId });
}

/**
 * Enregistre la sortie et calcule la durée de la session.
 */
async function handleLeave(member) {
  const userId = member.id;
  const session = activeSessions.get(userId);
  if (!session) return;

  activeSessions.delete(userId);

  const joinTime = session.joinTime;
  const leaveTime = new Date();
  const durationSeconds = Math.floor((leaveTime - joinTime) / 1000);

  // Ignorer les sessions de moins de 10 secondes (anti-spam)
  if (durationSeconds < 10) return;

  const guildId = member.guild.id;
  const userTag = member.user.tag;

  try {
    // Insertion de la session
    await pool.query(
      `INSERT INTO voice_sessions (user_id, user_tag, guild_id, join_time, leave_time, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userTag, guildId, joinTime, leaveTime, durationSeconds]
    );

    // Mise à jour ou création des stats
    await pool.query(
      `INSERT INTO voice_stats
         (user_id, user_tag, guild_id, weekly_seconds, alltime_seconds,
          sessions_weekly, sessions_alltime, last_session_date, last_session_duration)
       VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_tag = VALUES(user_tag),
         weekly_seconds = weekly_seconds + VALUES(weekly_seconds),
         alltime_seconds = alltime_seconds + VALUES(alltime_seconds),
         sessions_weekly = sessions_weekly + 1,
         sessions_alltime = sessions_alltime + 1,
         last_session_date = VALUES(last_session_date),
         last_session_duration = VALUES(last_session_duration)`,
      [userId, userTag, guildId, durationSeconds, durationSeconds, leaveTime, durationSeconds]
    );
  } catch (err) {
    console.error(`❌ Erreur sauvegarde session vocale pour ${userTag}:`, err.message);
  }
}

/**
 * Handler principal de l'événement voiceStateUpdate.
 */
async function voiceStateUpdate(oldState, newState) {
  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;

  const wasInVoice = !!oldState.channelId;
  const isInVoice = !!newState.channelId;

  if (!wasInVoice && isInVoice) {
    // Entrée en vocal
    await handleJoin(member, newState.channelId);
  } else if (wasInVoice && !isInVoice) {
    // Sortie du vocal
    await handleLeave(member);
  } else if (wasInVoice && isInVoice && oldState.channelId !== newState.channelId) {
    // Changement de salon : on sauvegarde l'ancienne session et on en démarre une nouvelle
    await handleLeave(member);
    await handleJoin(member, newState.channelId);
  }
}

module.exports = voiceStateUpdate;
module.exports.activeSessions = activeSessions;
