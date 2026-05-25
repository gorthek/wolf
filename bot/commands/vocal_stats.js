const { createEmbed, errorEmbed, COLORS } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');
const { formatTime } = require('../utils/formatTime');
const { getWeekLabel } = require('../utils/weekRange');

/**
 * !vocal_stats [@membre]
 * Affiche les stats complètes d'un membre (soi-même si pas de mention).
 */
async function vocalStats(message, args) {
  const guildId = message.guild.id;

  // Cible : membre mentionné ou soi-même
  const target = message.mentions.members.first() || message.member;
  const userId = target.id;
  const displayName = target.displayName;

  const [stats] = await pool.query(
    'SELECT * FROM voice_stats WHERE user_id = ? AND guild_id = ?',
    [userId, guildId]
  );

  if (stats.length === 0 || (stats[0].alltime_seconds === 0)) {
    return message.reply({
      embeds: [
        createEmbed(COLORS.info)
          .setTitle(`🎙️ Stats de ${displayName}`)
          .setDescription("Aucune session vocale enregistrée pour ce membre."),
      ],
    });
  }

  const s = stats[0];

  // Calcul des rangs
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

  const lastSessionDate = s.last_session_date
    ? new Date(s.last_session_date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Inconnue';

  const embed = createEmbed(COLORS.primary)
    .setTitle(`🎙️ Stats de ${displayName}`)
    .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      {
        name: '📅 Cette semaine',
        value: [
          `⏱️ Temps vocal : **${formatTime(s.weekly_seconds)}**`,
          `🔁 Sessions : **${s.sessions_weekly}**`,
          `📍 Rang weekly : **#${weeklyRank.rank}**`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🏆 Alltime',
        value: [
          `⏱️ Temps vocal : **${formatTime(s.alltime_seconds)}**`,
          `🔁 Sessions : **${s.sessions_alltime}**`,
          `🏅 Rang alltime : **#${alltimeRank.rank}**`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '📝 Dernière session',
        value: `📆 ${lastSessionDate}\n⏳ Durée : **${formatTime(s.last_session_duration)}**`,
        inline: false,
      }
    )
    .setFooter({ text: `Bot Wolf • ${getWeekLabel()}` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = vocalStats;
