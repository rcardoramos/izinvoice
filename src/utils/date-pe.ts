/**
 * date-pe.ts — Peru timezone (America/Lima, UTC-5) date utilities.
 *
 * Peru does NOT observe daylight saving time, so the offset is always UTC-5.
 *
 * WHY this matters:
 *   `new Date().toISOString()` always returns UTC. After 19:00 PE time (midnight UTC)
 *   it would return tomorrow's date, which is wrong for SUNAT issue dates.
 *
 * Use these helpers everywhere a "today" date string or local display is needed.
 */

export const TZ = 'America/Lima';

/**
 * Helper to get YYYY-MM-DD from any Date object in Peru timezone.
 */
export function formatDateOnlyPE(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ }); // en-CA gives YYYY-MM-DD
}

/**
 * Returns the current date in Peru as a `YYYY-MM-DD` string.
 * Safe to use for SUNAT `issueDate` / `referenceDate` fields.
 *
 * @example
 * todayPE() // "2026-05-30"
 */
export function todayPE(): string {
  return formatDateOnlyPE(new Date());
}

/**
 * Returns the current datetime in Peru as a full ISO-like string.
 * Useful for `created_at` / notification timestamps stored in the DB.
 */
export function nowPE(): string {
  return new Date().toISOString(); // UTC internally is fine for DB, display uses format functions below
}

/**
 * Formats any ISO timestamp for display using Peru locale and timezone.
 *
 * @example
 * formatDatePE("2026-05-31T02:30:00Z") // "30/05/2026"
 */
export function formatDatePE(
  isoString: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('es-PE', { timeZone: TZ, ...opts });
  } catch {
    return isoString;
  }
}

/**
 * Formats any ISO timestamp as a time string (HH:MM:SS) in Peru timezone.
 *
 * @example
 * formatTimePE("2026-05-31T02:30:00Z") // "21:30:00"
 */
export function formatTimePE(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-PE', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
}

/**
 * Formats any ISO timestamp to date & time in Peru timezone.
 */
export function formatDateTimePE(
  isoString: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' }
): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('es-PE', { timeZone: TZ, ...opts });
  } catch {
    return isoString;
  }
}

/**
 * Formats a date-only string (YYYY-MM-DD) for readable display in Spanish.
 * Uses Peru timezone with explicit UTC-05:00 offset to prevent timezone shifting.
 *
 * @example
 * formatIssueDatePE("2026-05-30") // "30 may. 2026"
 */
export function formatIssueDatePE(
  dateStr: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
): string {
  if (!dateStr) return '—';
  try {
    // Append T00:00:00-05:00 to specify midnight in Peru timezone explicitly
    return new Date(dateStr + 'T00:00:00-05:00').toLocaleDateString('es-PE', { timeZone: TZ, ...opts });
  } catch {
    return dateStr;
  }
}

/**
 * Returns the YYYY-MM prefix for the current month in Peru time.
 * Useful for monthly KPI filters.
 *
 * @example
 * currentMonthPE() // "2026-05"
 */
export function currentMonthPE(): string {
  return todayPE().substring(0, 7);
}

/**
 * Returns the YYYY-MM prefix for a Date object in Peru time.
 */
export function formatMonthPE(date: Date = new Date()): string {
  return formatDateOnlyPE(date).substring(0, 7);
}

