export function parseExpiryToMs(value: string): number {
  const match = /^\s*(\d+)\s*([smhd])\s*$/i.exec(value || '');
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // Default: 7 days
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] ?? 7 * 24 * 60 * 60 * 1000);
}
