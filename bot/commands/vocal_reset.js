const { createEmbed, successEmbed, warningEmbed, errorEmbed, COLORS } = require('../utils/embedBuilder');
const { pool } = require('../utils/db');

const CONFIRM_EMOJI = '✅';
const CANCEL_EMOJI = '❌';
const TIMEOUT_MS = 30000;

/**
 * !vocal_reset weekly → reset des compteurs weekly avec confirmation
 * !vocal_reset all    → reset complet avec confirmation
 */
async function vocalReset(message, args) {
  const mode = args[0]?.toLowerCase();

  if (!['weekly', 'all'].includes(mode)) {
    return message.reply({
      embeds: [
        errorEmbed('Syntaxe incorrecte', 'Usage : `!vocal_reset weekly` ou `!vocal_reset all`'),
      ],
    });
  }

  const guildId = message.guild.id;
  const description = mode === 'weekly'
    ? '⚠️ Cette action va remettre à zéro les compteurs **weekly** de tous les membres.\nRéagissez ✅ pour confirmer ou ❌ pour annuler.'
    : '🚨 **ATTENTION** — Cette action va supprimer **TOUTES** les données (weekly + alltime + sessions).\nCette action est **irréversible**.\nRéagissez ✅ pour confirmer ou ❌ pour annuler.';

  const confirmEmbed = createEmbed(mode === 'all' ? COLORS.error : COLORS.warning)
    .setTitle(`Confirmation — Reset ${mode.toUpperCase()}`)
    .setDescription(description)
    .setTimestamp();

  const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

  // Ajout des réactions de confirmation
  await confirmMsg.react(CONFIRM_EMOJI);
  await confirmMsg.react(CANCEL_EMOJI);

  // Collecteur de réactions (uniquement l'auteur de la commande)
  const filter = (reaction, user) =>
    [CONFIRM_EMOJI, CANCEL_EMOJI].includes(reaction.emoji.name) &&
    user.id === message.author.id;

  try {
    const collected = await confirmMsg.awaitReactions({ filter, max: 1, time: TIMEOUT_MS, errors: ['time'] });
    const reaction = collected.first();

    if (reaction.emoji.name === CONFIRM_EMOJI) {
      if (mode === 'weekly') {
        await pool.query(
          'UPDATE voice_stats SET weekly_seconds = 0, sessions_weekly = 0 WHERE guild_id = ?',
          [guildId]
        );
        await confirmMsg.edit({
          embeds: [successEmbed('Reset Weekly effectué', 'Les compteurs weekly ont été remis à zéro.')],
        });
      } else {
        // Reset complet : stats + sessions
        await pool.query(
          'UPDATE voice_stats SET weekly_seconds = 0, alltime_seconds = 0, sessions_weekly = 0, sessions_alltime = 0, last_session_date = NULL, last_session_duration = 0 WHERE guild_id = ?',
          [guildId]
        );
        await pool.query('DELETE FROM voice_sessions WHERE guild_id = ?', [guildId]);
        await pool.query('DELETE FROM weekly_reports WHERE guild_id = ?', [guildId]);
        await confirmMsg.edit({
          embeds: [successEmbed('Reset complet effectué', 'Toutes les données ont été supprimées.')],
        });
      }
    } else {
      await confirmMsg.edit({
        embeds: [createEmbed(COLORS.info).setTitle('❌ Annulé').setDescription('Le reset a été annulé.')],
      });
    }
  } catch {
    // Timeout : pas de réaction dans le délai imparti
    await confirmMsg.edit({
      embeds: [createEmbed(COLORS.info).setTitle('⏱️ Délai expiré').setDescription('La confirmation a expiré. Aucune action effectuée.')],
    });
  }
}

module.exports = vocalReset;
