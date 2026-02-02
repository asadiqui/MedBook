/**
 * Shared date and time utility functions
 * Used across availability, booking, and dashboard components
 */

/**
 * Convert time string (HH:mm) to total minutes
 * @example timeToMinutes("14:30") => 870
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convert total minutes to time string (HH:mm)
 * @example minutesToTime(870) => "14:30"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Format time string to 12-hour format with AM/PM
 * @example formatTime("14:30") => "2:30 PM"
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format date string to readable format
 * @example formatDate("2024-03-15") => "Fri, Mar 15"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
