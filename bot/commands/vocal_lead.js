const { createEmbed, COLORS } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');
const { formatTime } = require('../utils/formatTime');
const { getWeekLabel } = require('../utils/weekRange');

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * !vocal_lead        → classement weekly
 * !vocal_lead all    → classement alltime
 */
async function vocalLead(message, args) {
  const isAll = args[0]?.toLowerCase() === 'all';
  const guildId = message.guild.id;

  const field = isAll ? 'alltime_seconds' : 'weekly_seconds';
  const title = isAll ? '🏆 Classement Alltime' : '📊 Classement de la semaine';
  const footerText = isAll
    ? 'Classement depuis le début du tracking'
    : getWeekLabel();

  const [rows] = await pool.query(
    `SELECT user_tag, ${field} as seconds
     FROM voice_stats
     WHERE guild_id = ? AND ignored = 0 AND ${field} > 0
     ORDER BY ${field} DESC
     LIMIT 20`,
    [guildId]
  );

  if (rows.length === 0) {
    return message.reply({
      embeds: [
        createEmbed(COLORS.info)
          .setTitle(title)
          .setDescription('Aucune donnée disponible pour le moment.'),
      ],
    });
  }

  const lines = rows.map((row, i) => {
    const medal = i < 3 ? MEDALS[i] : `\`#${i + 1}\``;
    return `${medal} **${row.user_tag}** — ${formatTime(row.seconds)}`;
  });

  const embed = createEmbed(COLORS.primary)
    .setTitle(title)
    .setDescription(lines.join('\n'))
    .setFooter({ text: `Bot Wolf • ${footerText}` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = vocalLead;
