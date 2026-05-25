const { EmbedBuilder } = require('discord.js');

const COLORS = {
  primary: 0x7c3aed,   // violet
  success: 0x22c55e,   // vert
  error: 0xef4444,     // rouge
  warning: 0xf59e0b,   // orange
  info: 0x6366f1,      // indigo
};

/**
 * Crée un embed de base avec couleur, footer et timestamp.
 */
function createEmbed(color = COLORS.primary) {
  return new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: 'Bot Wolf • Vocal Tracker' })
    .setTimestamp();
}

/**
 * Embed de succès (vert).
 */
function successEmbed(title, description) {
  return createEmbed(COLORS.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description);
}

/**
 * Embed d'erreur (rouge).
 */
function errorEmbed(title, description) {
  return createEmbed(COLORS.error)
    .setTitle(`❌ ${title}`)
    .setDescription(description);
}

/**
 * Embed accès refusé (rouge).
 */
function accessDeniedEmbed() {
  return createEmbed(COLORS.error)
    .setTitle('⛔ Accès refusé')
    .setDescription("Vous n'avez pas le rôle requis pour utiliser cette commande.");
}

/**
 * Embed d'avertissement (orange).
 */
function warningEmbed(title, description) {
  return createEmbed(COLORS.warning)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description);
}

/**
 * Embed informatif (indigo).
 */
function infoEmbed(title, description) {
  return createEmbed(COLORS.info)
    .setTitle(title)
    .setDescription(description);
}

module.exports = {
  createEmbed,
  successEmbed,
  errorEmbed,
  accessDeniedEmbed,
  warningEmbed,
  infoEmbed,
  COLORS,
};
