// Turns a written open season into month/day pairs.
//
// Seasons are recorded as editorial text — "Apr 15 – Oct 31", "April 1 to October 15",
// "Year-round" — which is why season-opening reminders were scoped out of the original
// roadmap as unparseable. They are parseable; they just need the same discipline the
// catch measurements needed: handle the real forms, keep the original string, and
// return null rather than guessing when the text doesn't fit.
//
// Deliberately no year. An open season recurs annually, so storing 2026 would be both
// wrong next January and misleading today.

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export interface ParsedSeason {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  /** True when the season runs through the new year, e.g. Oct 1 – Mar 31. */
  wrapsYear: boolean;
}

function monthNumber(word: string): number | null {
  return MONTHS[word.slice(0, 3).toLowerCase()] ?? null;
}

/**
 * Parses "Apr 15 – Oct 31" and its common variants.
 *
 * Returns null for anything that isn't a bounded date range — including "Year-round",
 * which is genuinely not a season with an opening to be reminded about, and for which
 * null is the correct answer rather than 1 Jan – 31 Dec.
 */
const RANGE = /([A-Za-z]{3,9})\.?\s+(\d{1,2})\s*(?:[–—-]|to|through)\s*([A-Za-z]{3,9})\.?\s+(\d{1,2})/gi;

/**
 * A second season, or a date the range syntax cannot see, written as prose rather than
 * as another Month-Day range.
 *
 * The first version of this guard only caught a semicolon or a second parseable range,
 * and it was not enough. Live on the site it let through:
 *
 *   "Halifax Harbour and west (incl. Bay of Fundy): open Feb 1 - Dec 31. Hartlen Point
 *    east to Cape North: open 3rd Saturday in June through Labour Day."
 *
 * which got a confident OPEN NOW off the first clause — true west of Hartlen Point and
 * wrong east of it. The second season is real; it is just written in named days that the
 * range syntax cannot match, so the count-the-ranges test saw one season where there are
 * two. That is precisely the failure this guard exists to prevent, and it shipped.
 *
 * So: a full stop followed by a new sentence, a named-day season, or a hedge word all
 * mean the text is saying more than the one range extracted from it.
 */
const SENTENCE_BREAK = /[.!]\s+[A-Z(]/;
const NAMED_DAY =
  /\b\d+(?:st|nd|rd|th)\s+\w+day\b|labou?r day|victoria day|thanksgiving|good friday|easter|civic holiday/i;
const HEDGE =
  /\bvaries?\b|\bvarying\b|\bdepend\w*\b|\bdiffer\w*\b|\bapprox\w*\b|\broughly\b|general window|~/i;

/**
 * True when the text describes more than one season, or qualifies one heavily.
 *
 * This guard is why the parse rate is deliberately low. Measured against the 78 real
 * season strings in the content, 6 survive it — 4 distinct strings across brook trout,
 * smallmouth bass and winter flounder. Before the sentence-break, named-day and hedge
 * tests were added it was 11, and 5 of those 11 were wrong or heavily qualified.
 * Strings like
 *
 *   "Most RFAs: rivers/streams May 1–Sep 15; lakes May 15–Sep 15 (varies by RFA)"
 *   "Apr 1–Sep 30 inland; Sep 1–30 fly/unbaited-lure only province-wide"
 *
 * would each yield a confident first-range answer that is true for part of the province
 * and wrong for the rest. Refusing them is the point: a half-read regulation presented
 * as fact is worse than no answer, because the reader has no way to tell which they got.
 */
function isAmbiguous(text: string): boolean {
  const ranges = text.match(RANGE);
  if ((ranges?.length ?? 0) > 1) return true;
  if (text.includes(";")) return true;
  if (SENTENCE_BREAK.test(text)) return true;
  if (NAMED_DAY.test(text)) return true;
  if (HEDGE.test(text)) return true;
  return false;
}

export function parseSeason(text: string | null | undefined): ParsedSeason | null {
  if (!text) return null;
  const t = text.trim();
  if (/year[\s-]?round|open all year|no closed season/i.test(t)) return null;
  if (isAmbiguous(t)) return null;

  // Month name, day, separator, month name, day. The separator covers en dash, em dash,
  // hyphen and the words "to"/"through", which all appear in the source material.
  const m = t.match(
    /([A-Za-z]{3,9})\.?\s+(\d{1,2})\s*(?:[–—-]|to|through)\s*([A-Za-z]{3,9})\.?\s+(\d{1,2})/i
  );
  if (!m) return null;

  const startMonth = monthNumber(m[1]);
  const endMonth = monthNumber(m[3]);
  const startDay = parseInt(m[2], 10);
  const endDay = parseInt(m[4], 10);
  if (startMonth === null || endMonth === null) return null;
  if (startDay < 1 || startDay > 31 || endDay < 1 || endDay > 31) return null;

  return {
    startMonth,
    startDay,
    endMonth,
    endDay,
    wrapsYear: endMonth < startMonth || (endMonth === startMonth && endDay < startDay),
  };
}

/** Days until the next opening of this season, or null if it's already open. */
export function daysUntilOpen(
  season: ParsedSeason,
  today: Date = new Date()
): number | null {
  if (isOpen(season, today)) return null;
  const year = today.getFullYear();
  let opening = new Date(year, season.startMonth - 1, season.startDay);
  // Anchor both sides at midday so a timezone offset can't push the comparison a day out.
  opening.setHours(12, 0, 0, 0);
  const now = new Date(today);
  now.setHours(12, 0, 0, 0);
  if (opening < now) opening = new Date(year + 1, season.startMonth - 1, season.startDay);
  return Math.round((opening.getTime() - now.getTime()) / 86400000);
}

/** Whether the season is open on a given day, handling ranges that cross new year. */
export function isOpen(season: ParsedSeason, today: Date = new Date()): boolean {
  const md = (today.getMonth() + 1) * 100 + today.getDate();
  const start = season.startMonth * 100 + season.startDay;
  const end = season.endMonth * 100 + season.endDay;
  return season.wrapsYear ? md >= start || md <= end : md >= start && md <= end;
}
