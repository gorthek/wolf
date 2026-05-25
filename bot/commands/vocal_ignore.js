const { successEmbed, errorEmbed, COLORS, createEmbed } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');

/**
 * !vocal_ignore @membre → Exclut un membre du tracking vocal.
 */
async function vocalIgnore(message, args) {
  const target = message.mentions.members.first();

  if (!target) {
    return message.reply({
      embeds: [errorEmbed('Membre manquant', 'Mentionnez un membre à ignorer. Ex: `!vocal_ignore @membre`')],
    });
  }

  if (target.user.bot) {
    return message.reply({
      embeds: [errorEmbed('Action impossible', 'Les bots ne sont pas trackés.')],
    });
  }

  const guildId = message.guild.id;

  // Vérifier si déjà ignoré
  const [existing] = await pool.query(
    'SELECT ignored FROM voice_stats WHERE user_id = ? AND guild_id = ?',
    [target.id, guildId]
  );

  if (existing.length > 0 && existing[0].ignored) {
    return message.reply({
      embeds: [
        createEmbed(COLORS.warning)
          .setTitle('⚠️ Déjà ignoré')
          .setDescription(`**${target.displayName}** est déjà exclu du tracking.`),
      ],
    });
  }

  // Upsert : créer ou mettre à jour avec ignored = 1
  await pool.query(
    `INSERT INTO voice_stats (user_id, user_tag, guild_id, ignored)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE ignored = 1`,
    [target.id, target.user.tag, guildId]
  );

  await message.reply({
    embeds: [
      successEmbed(
        'Membre ignoré',
        `**${target.displayName}** est maintenant exclu du tracking vocal. Ses futures sessions ne seront plus enregistrées.`
      ),
    ],
  });
}

module.exports = vocalIgnore;
