export function formatTime12h(time24: string): string {
	const [hh, mm] = time24.split(":").map((v) => Number(v));
	if (!Number.isFinite(hh) || !Number.isFinite(mm)) return time24;
	const suffix = hh >= 12 ? "PM" : "AM";
	const hour = ((hh + 11) % 12) + 1;
	return `${hour}:${String(mm).padStart(2, "0")} ${suffix}`;
}
