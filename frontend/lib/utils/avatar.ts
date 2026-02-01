declare const process: {
  env: {
    NEXT_PUBLIC_BASE_URL?: string;
  };
};

type ResolveAvatarOptions = {
  cacheBust?: boolean;
  fallback?: string;
  baseUrl?: string;
};

export const resolveAvatarUrl = (
  avatar?: string | null,
  options: ResolveAvatarOptions = {}
) => {
  const { cacheBust = false, fallback = "/default-avatar.png", baseUrl } = options;

  if (!avatar) return fallback;

  // Handle external URLs (e.g., Google OAuth avatars)
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    if (!cacheBust) return avatar;
    // Add cache-busting parameter to external URLs
    const separator = avatar.includes("?") ? "&" : "?";
    return `${avatar}${separator}t=${Date.now()}`;
  }

  // Handle relative/local URLs
  const resolvedBaseUrl = baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL;
  if (!resolvedBaseUrl) return avatar;

  const url = `${resolvedBaseUrl}${avatar}`;
  if (!cacheBust) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
};
