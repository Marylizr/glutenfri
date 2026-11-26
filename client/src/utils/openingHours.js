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

function localDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function intervalsFor(establishment, date, day) {
  const special = establishment.specialHours?.find((entry) => entry.date === date);
  const intervals = special ? (special.closed ? [] : special.intervals) : establishment.weeklyHours?.[day];
  const validTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!Array.isArray(intervals) || !intervals.every((entry) => validTime(entry?.start) && validTime(entry?.end) && entry.start !== entry.end)) return null;
  return intervals;
}

export function getOpenStatus(establishment, now = new Date()) {
  const hours = establishment?.weeklyHours;
  const timeZone = validTimeZone(establishment?.timezone);
  if ((!hours && !establishment?.specialHours?.length) || !timeZone || !(now instanceof Date) || Number.isNaN(now.getTime())) {
    return { status: 'unavailable' };
  }

  const clock = zonedClock(now, timeZone);
  const dayIndex = WEEK_DAYS.indexOf(clock.day);
  if (dayIndex < 0) return { status: 'unavailable' };
  const previousDay = WEEK_DAYS[(dayIndex + 6) % 7];
  if (establishment.informationStatus === 'closed_or_removed' || establishment.temporarilyClosed === true) return { status: 'unavailable' };
  const today = localDate(now, timeZone);
  // Calendar arithmetic, not minus 24h across DST transitions.
  const yesterday = new Date(`${today}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const currentIntervals = intervalsFor(establishment, today, clock.day);
  const previousIntervals = intervalsFor(establishment, yesterday.toISOString().slice(0, 10), previousDay);
  const specialToday = establishment.specialHours?.find((entry) => entry.date === today);
  if (specialToday?.closed === true) return { status: 'closed' };

  const openInCurrent = currentIntervals?.some(({ start, end }) => {
    const from = minutes(start);
    const to = minutes(end);
    return to > from
      ? clock.minute >= from && clock.minute < to
      : clock.minute >= from;
  });
  const openFromPrevious = previousIntervals?.some(({ start, end }) => {
    const from = minutes(start);
    const to = minutes(end);
    return to <= from && clock.minute < to;
  });

  if (openInCurrent || openFromPrevious) return { status: 'open' };
  // Missing days and an unknown previous night cannot establish closure.
  if (currentIntervals === null || (previousIntervals === null && !specialToday)) return { status: 'unavailable' };
  return { status: 'closed' };
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
