export function formatRelativeTime(dateString, language = 'pt-PT') {
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  if (diffSec < 60) return formatter.format(-Math.max(0, diffSec), 'second');
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return formatter.format(-diffMin, 'minute');
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return formatter.format(-diffHour, 'hour');
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return formatter.format(-diffDay, 'day');
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return formatter.format(-diffWeek, 'week');
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return formatter.format(-diffMonth, 'month');
  return formatter.format(-Math.floor(diffDay / 365), 'year');
}
