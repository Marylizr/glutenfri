// Tiempo relativo simple en español — no hace falta date-fns para esto,
// el proyecto no tenía ninguna librería de fechas instalada.
export function formatRelativeTime(dateString) {
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (diffSec < 60) return 'hace un momento';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `hace ${diffWeek} ${diffWeek === 1 ? 'semana' : 'semanas'}`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`;

  const diffYear = Math.floor(diffDay / 365);
  return `hace ${diffYear} ${diffYear === 1 ? 'año' : 'años'}`;
}
