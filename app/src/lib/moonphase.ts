// Moon phase from a calendar date, computed locally (no API/key needed) against a
// known new moon reference point and the synodic month length. Anglers often track
// this against bite activity, so it rides along with each catch log entry.

const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASES = [
  { name: "New Moon", emoji: "🌑" },
  { name: "Waxing Crescent", emoji: "🌒" },
  { name: "First Quarter", emoji: "🌓" },
  { name: "Waxing Gibbous", emoji: "🌔" },
  { name: "Full Moon", emoji: "🌕" },
  { name: "Waning Gibbous", emoji: "🌖" },
  { name: "Last Quarter", emoji: "🌗" },
  { name: "Waning Crescent", emoji: "🌘" },
];

export function moonPhase(dateStr: string): { name: string; emoji: string; fraction: number } {
  const date = new Date(`${dateStr}T12:00:00Z`);
  const diffDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86400000;
  const fraction = (((diffDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS;
  const phase = PHASES[Math.round(fraction * 8) % 8];
  return { ...phase, fraction };
}
