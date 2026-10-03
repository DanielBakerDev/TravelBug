/*
 * Reads everything in content/ — the files Amanda edits through Pages CMS —
 * and works out the things she shouldn't have to type twice.
 *
 * Page files (home.yml, about.yml, ...) are handed to the templates as they
 * are. Trips get more work, because one trip file turns into several pages:
 *
 *   kind: dates        one page per departure, named trip-<file>-<ddmonyyyy>
 *                      unless the departure sets its own `page`
 *   kind: combined     one page for trips run back to back (the Grand Tour).
 *                      `parts` lists the trip files it joins, and the nth
 *                      departure of each part makes up the nth window
 *   kind: coming-soon  a card with no page at all
 */
import fs from 'node:fs';
import path from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { parseDate, longRange, shortRange, dayMonth, slugDate } from './dates.js';

const CONTENT = 'content';
const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const readYaml = (file) => parseYaml(fs.readFileSync(file, 'utf8')) ?? {};
const isYaml = (name) => /\.ya?ml$/.test(name);
const stem = (name) => name.replace(/\.ya?ml$/, '');
const camel = (name) => name.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const countWord = (n) => NUMBERS[n] ?? String(n);

const money = (n) => Number(n).toLocaleString('en-GB');

function price(trip) {
  const eur = Number(trip.price_eur) > 0 ? `€${money(trip.price_eur)}` : '';
  const gbp = Number(trip.price_gbp) > 0 ? `£${money(trip.price_gbp)}` : '';
  return [eur, gbp].filter(Boolean).join(' / ');
}

export function spotsLabel(spots) {
  if (spots === undefined || spots === null || spots === '') return '';
  const n = Number(spots);
  if (n <= 0) return 'Fully booked';
  return n === 1 ? '1 spot left' : `${n} spots left`;
}

/* {start}, {end}, {dates} and {combined-dates} in trip text. Unknown tokens are
   left alone so a typo shows up on the page rather than vanishing. */
export function fillTokens(text, values) {
  if (!text) return '';
  return String(text).replace(/\{([a-z-]+)\}/g, (whole, key) => values[key] ?? whole);
}

function prepareDeparture(trip, raw) {
  const start = parseDate(raw.start);
  const end = parseDate(raw.end);
  if (!start || !end) return null;

  const page = raw.page || `trip-${trip.id}-${slugDate(start)}`;
  const long = longRange(start, end);

  return {
    start,
    end,
    page,
    url: `${page}.html`,
    spots: raw.spots_left,
    spotsLabel: spotsLabel(raw.spots_left),
    full: raw.spots_left !== undefined && raw.spots_left !== null && Number(raw.spots_left) <= 0,
    long,
    short: shortRange(start, end),
    shortYear: shortRange(start, end, true),
    enquiry: `${trip.name} — ${long}`,
    tokens: { start: dayMonth(start), end: dayMonth(end), dates: long },
  };
}

export function loadTrips() {
  const dir = path.join(CONTENT, 'trips');
  const trips = fs.readdirSync(dir).filter(isYaml).map((name) => ({
    id: stem(name),
    ...readYaml(path.join(dir, name)),
  }));

  trips.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || String(a.name).localeCompare(String(b.name)));
  const byId = new Map(trips.map((t) => [t.id, t]));

  for (const trip of trips) {
    trip.kind ||= 'dates';
    trip.name ||= trip.id;
    trip.priceText = price(trip);
    trip.cardTitle = trip.card_title || trip.title;
    trip.departures = (trip.kind === 'dates' ? trip.departures ?? [] : [])
      .map((d) => prepareDeparture(trip, d))
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
  }

  for (const trip of trips) {
    if (trip.kind !== 'combined') continue;

    trip.page ||= `trip-${trip.id}`;
    trip.url = `${trip.page}.html`;
    trip.enquiry = trip.length ? `${trip.name}, ${trip.length}` : trip.name;
    trip.parts = (trip.parts ?? []).map((id) => byId.get(id)).filter(Boolean);

    const count = trip.parts.length ? Math.min(...trip.parts.map((p) => p.departures.length)) : 0;
    trip.windows = Array.from({ length: count }, (_, i) => {
      const legs = trip.parts.map((p) => p.departures[i]);
      const start = legs[0].start;
      const end = legs[legs.length - 1].end;
      const long = longRange(start, end);
      return { legs, start, end, long, short: shortRange(start, end), enquiry: `${trip.name} — ${long}` };
    });

    // "three departures in 2027", or "in 2027–28" if the windows cross a year.
    const years = [...new Set(trip.windows.map((w) => w.start.getUTCFullYear()))];
    trip.years = years.length > 1 ? `${years[0]}–${String(years.at(-1)).slice(-2)}` : String(years[0] ?? '');

    // Tell each part which family it belongs to and who its neighbours are,
    // for the Part One / Part Two / Grand Tour switch and the "runs straight
    // into" chip.
    const familySwitch = (i, current) => [
      ...trip.parts.map((p) => ({
        label: p.short_name || p.name,
        url: (p.departures[i] ?? p.departures[0])?.url,
        current: p === current,
      })),
      { label: trip.short_name || trip.name, url: trip.url, current: current === trip },
    ];
    trip.partSwitch = familySwitch(0, trip);

    trip.parts.forEach((part, k) => {
      part.family = trip;
      part.departures.forEach((dep, i) => {
        dep.partSwitch = familySwitch(i, part);
        const window = trip.windows[i];
        if (!window) return;
        dep.window = window;
        dep.tokens['combined-dates'] = window.long;
        dep.next = trip.parts[k + 1]?.departures[i] && { trip: trip.parts[k + 1], dep: trip.parts[k + 1].departures[i] };
        dep.previous = trip.parts[k - 1]?.departures[i] && { trip: trip.parts[k - 1], dep: trip.parts[k - 1].departures[i] };
      });
    });

    // Day ranges for the "Part One, days 1–10" buttons. The changeover day
    // belongs to both halves, so each part starts on the day the last ended.
    let day = 1;
    trip.legLabels = trip.parts.map((part) => {
      const days = parseInt(part.length, 10);
      if (!days) return part.short_name || part.name;
      const label = `${part.short_name || part.name}, days ${day}–${day + days - 1}`;
      day += days - 1;
      return label;
    });
  }

  for (const trip of trips) {
    const first = trip.departures[0];

    if (trip.kind === 'dates') trip.url = first?.url;
    if (trip.kind === 'coming-soon') trip.url = null;

    if (trip.kind === 'coming-soon') {
      trip.badgeText = trip.badge || 'Coming soon';
      trip.badgeColour = 'sunshine';
    } else if (trip.badge) {
      trip.badgeText = trip.badge;
      trip.badgeColour = 'tangerine';
    } else {
      trip.badgeText = first?.spotsLabel;
      trip.badgeColour = 'coral';
    }

    const dated = trip.kind === 'combined' ? trip.windows : trip.departures;
    const noun = trip.kind === 'combined' ? 'window' : 'departure';
    trip.datesLabel = dated?.length
      ? `${capitalise(countWord(dated.length))} ${noun}${dated.length === 1 ? '' : 's'}`
      : '';
  }

  return trips;
}

// One entry per generated departure page.
export const departurePages = (trips) =>
  trips.flatMap((trip) => trip.departures.map((dep) => ({ trip, dep })));

/* The "Which trip?" dropdown on the contact page. main.js pre-selects an
   option by matching its text against the ?trip= link on a trip page, and
   both come from the same strings here, so they always line up. */
export function enquiryOptions(trips) {
  return trips.map((trip) => {
    if (trip.kind === 'coming-soon') {
      return { option: `${trip.name} — the trip that's in the works` };
    }
    if (trip.kind === 'combined') {
      return {
        group: trip.badge || trip.name,
        options: [trip.enquiry, ...trip.windows.map((w) => w.enquiry)],
      };
    }
    return { group: trip.name, options: trip.departures.map((d) => d.enquiry) };
  });
}

// Every other file in content/ becomes global data named after it:
// past-journeys.yml -> pastJourneys.
export function loadPages() {
  return Object.fromEntries(
    fs.readdirSync(CONTENT)
      .filter(isYaml)
      .map((name) => [camel(stem(name)), readYaml(path.join(CONTENT, name))]),
  );
}
