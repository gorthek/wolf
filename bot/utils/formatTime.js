/**
 * Convertit un nombre de secondes en chaîne lisible.
 * Ex: 16332 → "4h 32m 12s"
 */
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0m';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && h === 0) parts.push(`${s}s`); // affiche les secondes seulement si < 1h

  return parts.length > 0 ? parts.join(' ') : '0m';
}

/**
 * Génère une barre de progression en blocs Unicode.
 * Ex: 78% → "████████░░ 78%"
 */
function progressBar(current, max, length = 10) {
  if (!max || max === 0) return '░'.repeat(length) + ' 0%';
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const filled = Math.round((pct / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${pct}%`;
}

module.exports = { formatTime, progressBar };
