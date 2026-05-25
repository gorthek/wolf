/**
 * Calcule le début et la fin de la semaine courante.
 * Semaine définie : vendredi 00h00 → jeudi 23h59:59
 */
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=dim, 1=lun, ..., 5=ven, 6=sam

  // Nombre de jours depuis le dernier vendredi
  // vendredi=5, samedi=6(+1), dimanche=0(+2), ..., jeudi=4(+6)
  const daysFromFriday = (day + 2) % 7; // ven=0, sam=1, dim=2, lun=3, mar=4, mer=5, jeu=6

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromFriday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

/**
 * Formate une date en "dd/MM/yyyy"
 */
function formatDate(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Retourne la chaîne de période "Semaine du XX/XX au XX/XX"
 */
function getWeekLabel() {
  const { weekStart, weekEnd } = getCurrentWeekRange();
  return `Semaine du ${formatDate(weekStart)} au ${formatDate(weekEnd)}`;
}

/**
 * Calcule le temps restant avant le prochain vendredi 23h59.
 * Retourne { days, hours, minutes }
 */
function getTimeUntilNextReport() {
  const now = new Date();
  const { weekEnd } = getCurrentWeekRange();

  const diff = weekEnd.getTime() - now.getTime();
  if (diff < 0) {
    // Si on est passé jeudi 23h59, calculer pour la semaine suivante
    const nextEnd = new Date(weekEnd);
    nextEnd.setDate(weekEnd.getDate() + 7);
    const diff2 = nextEnd.getTime() - now.getTime();
    return {
      days: Math.floor(diff2 / 86400000),
      hours: Math.floor((diff2 % 86400000) / 3600000),
      minutes: Math.floor((diff2 % 3600000) / 60000),
    };
  }

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

module.exports = { getCurrentWeekRange, formatDate, getWeekLabel, getTimeUntilNextReport };
