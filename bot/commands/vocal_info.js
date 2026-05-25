const { createEmbed, COLORS } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');
const { formatTime } = require('../utils/formatTime');
const { getWeekLabel, getTimeUntilNextReport } = require('../utils/weekRange');

/**
 * !vocal_info → Récapitulatif de la configuration et des stats globales.
 */
async function vocalInfo(message) {
  const guildId = message.guild.id;

  const [[countRow]] = await pool.query(
    'SELECT COUNT(*) as total FROM voice_stats WHERE guild_id = ? AND ignored = 0',
    [guildId]
  );

  const [[topRow]] = await pool.query(
    `SELECT user_tag, weekly_seconds FROM voice_stats
     WHERE guild_id = ? AND ignored = 0
     ORDER BY weekly_seconds DESC LIMIT 1`,
    [guildId]
  );

  const reportChannel = process.env.REPORT_CHANNEL_ID
    ? `<#${process.env.REPORT_CHANNEL_ID}>`
    : '`Non configuré`';

  const { days, hours, minutes } = getTimeUntilNextReport();
  const nextReport = `${days}j ${hours}h ${minutes}m`;

  const topMember = topRow && topRow.weekly_seconds > 0
    ? `**${topRow.user_tag}** (${formatTime(topRow.weekly_seconds)})`
    : 'Aucun';

  const embed = createEmbed(COLORS.info)
    .setTitle('⚙️ Configuration — Bot Wolf Vocal Tracker')
    .addFields(
      { name: '📢 Channel rapport', value: reportChannel, inline: true },
      { name: '⏰ Prochain rapport dans', value: nextReport, inline: true },
      { name: '👥 Membres trackés', value: `**${countRow.total}**`, inline: true },
      { name: '🏆 Membre le plus actif (semaine)', value: topMember, inline: false },
      { name: '📅 Période actuelle', value: getWeekLabel(), inline: false },
    )
    .setFooter({ text: 'Bot Wolf • Vocal Tracker' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = vocalInfo;
