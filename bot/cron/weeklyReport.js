const cron = require('node-cron');
const { pool } = require('../utils/db');
const { createEmbed, COLORS } = require('../utils/embedBuilder');
const { formatTime } = require('../utils/formatTime');
const { getWeekLabel } = require('../utils/weekRange');

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Génère et envoie le rapport hebdomadaire, puis remet à zéro les weekly.
 */
async function sendWeeklyReport(client) {
  const guildId = process.env.GUILD_ID;
  const reportChannelId = process.env.REPORT_CHANNEL_ID;

  if (!reportChannelId) {
    console.warn('⚠️ REPORT_CHANNEL_ID non défini, rapport annulé.');
    return;
  }

  const channel = await client.channels.fetch(reportChannelId).catch(() => null);
  if (!channel) {
    console.warn('⚠️ Channel de rapport introuvable.');
    return;
  }

  try {
    // Récupération du top 10 de la semaine
    const [rows] = await pool.query(
      `SELECT user_id, user_tag, weekly_seconds, sessions_weekly
       FROM voice_stats
       WHERE guild_id = ? AND ignored = 0 AND weekly_seconds > 0
       ORDER BY weekly_seconds DESC
       LIMIT 10`,
      [guildId]
    );

    // Stats globales de la semaine
    const [[globalRow]] = await pool.query(
      `SELECT COUNT(*) as active_members, SUM(weekly_seconds) as total_seconds
       FROM voice_stats
       WHERE guild_id = ? AND ignored = 0 AND weekly_seconds > 0`,
      [guildId]
    );

    const weekLabel = getWeekLabel();
    const description = rows.length === 0
      ? 'Aucune activité vocale cette semaine.'
      : rows.map((r, i) => {
          const medal = i < 3 ? MEDALS[i] : `\`#${i + 1}\``;
          return `${medal} **${r.user_tag}** — ${formatTime(r.weekly_seconds)} (${r.sessions_weekly} session${r.sessions_weekly > 1 ? 's' : ''})`;
        }).join('\n');

    const embed = createEmbed(COLORS.primary)
      .setTitle('📊 Rapport Hebdomadaire — Vocal Tracker')
      .setDescription(description)
      .addFields(
        { name: '👥 Membres actifs', value: `**${globalRow.active_members || 0}**`, inline: true },
        { name: '⏱️ Total vocal', value: `**${formatTime(globalRow.total_seconds || 0)}**`, inline: true },
      )
      .setFooter({ text: `Bot Wolf • ${weekLabel}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Sauvegarde du rapport dans weekly_reports
    if (rows.length > 0) {
      await pool.query(
        `INSERT INTO weekly_reports
           (guild_id, report_date, top1_user_id, top1_seconds, total_members_active, total_seconds_week)
         VALUES (?, NOW(), ?, ?, ?, ?)`,
        [guildId, rows[0].user_id, rows[0].weekly_seconds, globalRow.active_members || 0, globalRow.total_seconds || 0]
      );
    }

    // Remise à zéro des compteurs weekly
    await pool.query(
      'UPDATE voice_stats SET weekly_seconds = 0, sessions_weekly = 0 WHERE guild_id = ?',
      [guildId]
    );

    console.log('✅ Rapport hebdomadaire envoyé et compteurs weekly remis à zéro.');
  } catch (err) {
    console.error('❌ Erreur rapport hebdomadaire :', err.message);
  }
}

/**
 * Démarre le cron : chaque vendredi à 23h59.
 */
function start(client) {
  // Expression cron : 59 23 * * 5 = vendredi à 23:59
  cron.schedule('59 23 * * 5', () => {
    console.log('🕐 Déclenchement du rapport hebdomadaire...');
    sendWeeklyReport(client);
  }, {
    timezone: 'Europe/Paris',
  });

  console.log('⏰ Cron hebdomadaire configuré (vendredi 23:59 Europe/Paris)');
}

module.exports = { start, sendWeeklyReport };
