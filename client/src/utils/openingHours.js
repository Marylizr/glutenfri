import { WEEK_DAYS, validTimeZone } from './establishmentData.js';

const WEEKDAY_BY_SHORT = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

const minutes = (value) => {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
};

function zonedClock(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    day: WEEKDAY_BY_SHORT[get('weekday')],
    minute: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function getOpenStatus(establishment, now = new Date()) {
  const hours = establishment?.weeklyHours;
  const timeZone = validTimeZone(establishment?.timezone);
  if (!hours || !timeZone || !(now instanceof Date) || Number.isNaN(now.getTime())) {
    return { status: 'unavailable' };
  }

  const clock = zonedClock(now, timeZone);
  const dayIndex = WEEK_DAYS.indexOf(clock.day);
  if (dayIndex < 0) return { status: 'unavailable' };
  const previousDay = WEEK_DAYS[(dayIndex + 6) % 7];
  const currentIntervals = hours[clock.day] || [];
  const previousIntervals = hours[previousDay] || [];

  const openInCurrent = currentIntervals.some(({ start, end }) => {
    const from = minutes(start);
    const to = minutes(end);
    return to > from
      ? clock.minute >= from && clock.minute < to
      : clock.minute >= from;
  });
  const openFromPrevious = previousIntervals.some(({ start, end }) => {
    const from = minutes(start);
    const to = minutes(end);
    return to <= from && clock.minute < to;
  });

  return { status: openInCurrent || openFromPrevious ? 'open' : 'closed' };
}

export function formatWeeklyHours(hours, locale) {
  if (!hours) return [];
  const referenceMonday = new Date(Date.UTC(2024, 0, 1));
  const dayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    timeZone: 'UTC',
  });
  return WEEK_DAYS.map((day, index) => ({
    day,
    label: dayFormatter.format(new Date(referenceMonday.getTime() + index * 86400000)),
    intervals: hours[day] || [],
  }));
}
