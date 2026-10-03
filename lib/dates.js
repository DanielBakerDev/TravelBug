/*
 * Date ranges, written the way the site has always written them:
 *
 *   long   30 June – 9 July 2027      20–29 July 2027
 *   short  30 Jun – 9 Jul             20–29 Jul          (+ year when asked)
 *
 * Same-month ranges close up around the dash; ranges that cross a month get
 * spaces. Ranges that cross a year always carry both years.
 *
 * Month names are spelled out here rather than taken from Intl, because
 * en-GB in current ICU abbreviates September to "Sept".
 */
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec'];

// Pages CMS writes "2027-06-30". YAML may hand that back as a string or, if it
// was saved unquoted, as a Date at midnight UTC. Either way, read it as UTC so
// the day never shifts with the build machine's time zone.
export function parseDate(value) {
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

const parts = (d) => ({ day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() });

function range(start, end, names, withYear) {
  const a = parts(start);
  const b = parts(end);

  if (a.year !== b.year) {
    return `${a.day} ${names[a.month]} ${a.year} – ${b.day} ${names[b.month]} ${b.year}`;
  }
  const year = withYear ? ` ${b.year}` : '';
  if (a.month === b.month) return `${a.day}–${b.day} ${names[b.month]}${year}`;
  return `${a.day} ${names[a.month]} – ${b.day} ${names[b.month]}${year}`;
}

export const longRange = (start, end) => range(start, end, LONG, true);
export const shortRange = (start, end, withYear = false) => range(start, end, SHORT, withYear);
export const dayMonth = (d) => `${d.getUTCDate()} ${LONG[d.getUTCMonth()]}`;

// "30jun2027" — the date part of an automatically named departure page.
export const slugDate = (d) =>
  `${String(d.getUTCDate()).padStart(2, '0')}${SHORT[d.getUTCMonth()].toLowerCase()}${d.getUTCFullYear()}`;
