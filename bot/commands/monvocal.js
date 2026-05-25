const { createEmbed, COLORS } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');
const { formatTime, progressBar } = require('../utils/formatTime');
const { getWeekLabel } = require('../utils/weekRange');

/**
 * !monvocal / !mv → Commande publique : affiche ses propres stats vocales.
 */
async function monvocal(message) {
  const userId = message.author.id;
  const guildId = message.guild.id;

  const [stats] = await pool.query(
    'SELECT * FROM voice_stats WHERE user_id = ? AND guild_id = ?',
    [userId, guildId]
  );

  // Aucune session
  if (stats.length === 0 || stats[0].weekly_seconds === 0) {
    const embed = createEmbed(COLORS.info)
      .setTitle('🎙️ Mes stats vocales')
      .setDescription("🎙️ Aucune session détectée pour toi cette semaine !\nRejoin un salon vocal pour commencer à être tracké.")
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Bot Wolf • ${getWeekLabel()}` })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  const s = stats[0];

  // Rang weekly
  const [[weeklyRankRow]] = await pool.query(
    `SELECT COUNT(*) + 1 as rank FROM voice_stats
     WHERE guild_id = ? AND weekly_seconds > ? AND ignored = 0`,
    [guildId, s.weekly_seconds]
  );

  // Rang alltime
  const [[alltimeRankRow]] = await pool.query(
    `SELECT COUNT(*) + 1 as rank FROM voice_stats
     WHERE guild_id = ? AND alltime_seconds > ? AND ignored = 0`,
    [guildId, s.alltime_seconds]
  );

  // Temps du 1er pour la barre de progression
  const [[top1Row]] = await pool.query(
    `SELECT weekly_seconds FROM voice_stats
     WHERE guild_id = ? AND ignored = 0
     ORDER BY weekly_seconds DESC LIMIT 1`,
    [guildId]
  );

  const top1Seconds = top1Row ? top1Row.weekly_seconds : s.weekly_seconds;
  const bar = progressBar(s.weekly_seconds, top1Seconds);

  const embed = createEmbed(COLORS.primary)
    .setTitle(`🎙️ Mes stats vocales`)
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .addFields(
      {
        name: '📅 Cette semaine',
        value: [
          `⏱️ Temps vocal : **${formatTime(s.weekly_seconds)}**`,
          `📍 Tu es **#${weeklyRankRow.rank}** cette semaine`,
          `\n${bar}`,
        ].join('\n'),
        inline: false,
      },
      {
        name: '🏆 Alltime',
        value: [
          `⏱️ Temps vocal : **${formatTime(s.alltime_seconds)}**`,
          `🏅 Tu es **#${alltimeRankRow.rank}** au classement général`,
        ].join('\n'),
        inline: false,
      }
    )
    .setFooter({ text: `Bot Wolf • ${getWeekLabel()}` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = monvocal;
