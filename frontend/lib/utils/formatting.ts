export const getInitials = (
  firstName?: string,
  lastName?: string,
  fallback: string = "?",
): string => {
  const a = (firstName || "").trim().slice(0, 1).toUpperCase();
  const b = (lastName || "").trim().slice(0, 1).toUpperCase();
  return (a + b) || fallback;
};

export const getInitialsFromName = (name: string, fallback: string = "?") => {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || fallback;
};
