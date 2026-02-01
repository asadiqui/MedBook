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

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  const resolvedBaseUrl = baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL;
  if (!resolvedBaseUrl) return avatar;

  const url = `${resolvedBaseUrl}${avatar}`;
  if (!cacheBust) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
};
