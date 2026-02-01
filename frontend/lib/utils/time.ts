export function formatTime12h(time24: string): string {
  const [hoursStr, minutes] = String(time24 || "").split(":");
  const hoursNum = Number(hoursStr);

  if (!Number.isFinite(hoursNum) || minutes === undefined) {
    return time24;
  }

  const ampm = hoursNum >= 12 ? "PM" : "AM";
  const displayHour = hoursNum % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
