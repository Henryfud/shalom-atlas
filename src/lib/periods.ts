/**
 * Voting period utilities.
 * Periods are 12-hour windows split at 6am and 6pm UTC.
 */

export function getCurrentPeriodId(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const half = now.getUTCHours() < 18 ? "AM" : "PM";
  return `${year}-${month}-${day}-${half}`;
}
