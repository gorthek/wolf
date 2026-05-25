/**
 * Convertit des secondes en chaîne lisible pour le dashboard.
 */
export function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Convertit des secondes en heures décimales pour les graphiques.
 */
export function toHours(seconds) {
  return Math.round((seconds / 3600) * 10) / 10;
}

/**
 * Calcule un pourcentage de progression par rapport au max.
 */
export function progressPercent(current, max) {
  if (!max || max === 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}
