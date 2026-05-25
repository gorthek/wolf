const { createEmbed, COLORS } = require('../utils/embedBuilder');

/**
 * !help → Liste toutes les commandes disponibles.
 */
async function help(message) {
  const embed = createEmbed(COLORS.primary)
    .setTitle('📖 Aide — Bot Wolf Vocal Tracker')
    .setDescription(
      'Toutes les commandes utilisent le préfixe `!`.\n' +
      '🔒 = Rôle requis  |  🌐 = Accessible par tous'
    )
    .addFields(
      {
        name: '🌐 Commandes publiques',
        value: [
          '`!monvocal` / `!mv` — Affiche tes propres stats vocales (temps, rang, barre de progression)',
        ].join('\n'),
      },
      {
        name: '🔒 Classements',
        value: [
          '`!vocal_lead` — Classement des membres par temps vocal **cette semaine**',
          '`!vocal_lead all` — Classement **alltime** depuis le début du tracking',
        ].join('\n'),
      },
      {
        name: '🔒 Statistiques',
        value: [
          '`!vocal_stats` — Tes propres stats détaillées (rang, sessions, dernière session)',
          '`!vocal_stats @membre` — Stats détaillées d\'un autre membre',
        ].join('\n'),
      },
      {
        name: '🔒 Administration',
        value: [
          '`!vocal_info` — Affiche la configuration et les stats globales',
          '`!vocal_reset weekly` — Remet à zéro les compteurs weekly *(confirmation requise)*',
          '`!vocal_reset all` — Supprime **toutes** les données *(confirmation requise)*',
          '`!vocal_ignore @membre` — Exclut un membre du tracking',
          '`!vocal_unignore @membre` — Réintègre un membre dans le tracking',
        ].join('\n'),
      },
      {
        name: '📅 Rapport automatique',
        value: 'Un rapport hebdomadaire est envoyé chaque **vendredi à 23h59** dans le salon configuré.\nLa semaine va du **vendredi** au **jeudi**.',
      }
    )
    .setFooter({ text: 'Bot Wolf • Vocal Tracker' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = help;
