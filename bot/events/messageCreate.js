const { accessDeniedEmbed } = require('../utils/embedBuilder');

// Import de toutes les commandes
const vocalLead = require('../commands/vocal_lead');
const vocalStats = require('../commands/vocal_stats');
const vocalReset = require('../commands/vocal_reset');
const vocalInfo = require('../commands/vocal_info');
const vocalIgnore = require('../commands/vocal_ignore');
const vocalUnignore = require('../commands/vocal_unignore');
const monvocal = require('../commands/monvocal');
const help = require('../commands/help');

const PREFIX = '!';

// Commandes accessibles sans vérification de rôle
const PUBLIC_COMMANDS = ['monvocal', 'mv'];

/**
 * Dispatcher principal des commandes préfixées.
 */
async function messageCreate(message, client) {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  // Vérification du rôle, sauf pour les commandes publiques
  const isPublic = PUBLIC_COMMANDS.includes(commandName);
  if (!isPublic) {
    const allowedRoleId = process.env.ALLOWED_ROLE_ID;
    if (!message.member.roles.cache.has(allowedRoleId)) {
      return message.reply({ embeds: [accessDeniedEmbed()] });
    }
  }

  try {
    switch (commandName) {
      case 'vocal_lead':
        await vocalLead(message, args);
        break;
      case 'vocal_stats':
        await vocalStats(message, args);
        break;
      case 'vocal_reset':
        await vocalReset(message, args, client);
        break;
      case 'vocal_info':
        await vocalInfo(message, args);
        break;
      case 'vocal_ignore':
        await vocalIgnore(message, args);
        break;
      case 'vocal_unignore':
        await vocalUnignore(message, args);
        break;
      case 'monvocal':
      case 'mv':
        await monvocal(message, args);
        break;
      case 'help':
        await help(message, args);
        break;
      default:
        // Commande inconnue : on ignore silencieusement
        break;
    }
  } catch (err) {
    console.error(`❌ Erreur commande !${commandName}:`, err);
    const { errorEmbed } = require('../utils/embedBuilder');
    try {
      await message.reply({
        embeds: [errorEmbed('Erreur interne', `Une erreur s'est produite : \`${err.message}\``)],
      });
    } catch (_) {}
  }
}

module.exports = messageCreate;
