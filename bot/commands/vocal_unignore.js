const { successEmbed, errorEmbed, COLORS, createEmbed } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');

/**
 * !vocal_unignore @membre → Réintègre un membre dans le tracking vocal.
 */
async function vocalUnignore(message, args) {
  const target = message.mentions.members.first();

  if (!target) {
    return message.reply({
      embeds: [errorEmbed('Membre manquant', 'Mentionnez un membre à réintégrer. Ex: `!vocal_unignore @membre`')],
    });
  }

  const guildId = message.guild.id;

  const [existing] = await pool.query(
    'SELECT ignored FROM voice_stats WHERE user_id = ? AND guild_id = ?',
    [target.id, guildId]
  );

  if (existing.length === 0 || !existing[0].ignored) {
    return message.reply({
      embeds: [
        createEmbed(COLORS.warning)
          .setTitle('⚠️ Non ignoré')
          .setDescription(`**${target.displayName}** n'est pas dans la liste des membres ignorés.`),
      ],
    });
  }

  await pool.query(
    'UPDATE voice_stats SET ignored = 0 WHERE user_id = ? AND guild_id = ?',
    [target.id, guildId]
  );

  await message.reply({
    embeds: [
      successEmbed(
        'Membre réintégré',
        `**${target.displayName}** est de nouveau tracké. Ses prochaines sessions seront enregistrées.`
      ),
    ],
  });
}

module.exports = vocalUnignore;
