export type JwtPayload = Record<string, unknown> & {
	sub?: string;
	id?: string;
	userId?: string;
};

function base64UrlDecode(input: string): string {
	const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	if (typeof window !== "undefined" && typeof window.atob === "function") {
		// atob returns a binary string; decode it as UTF-8
		const binary = window.atob(padded);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
		return new TextDecoder().decode(bytes);
	}
	// SSR fallback
	return Buffer.from(padded, "base64").toString("utf-8");
}

export function decodeJwtPayload(token: string): JwtPayload | null {
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;
		return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
	} catch {
		return null;
	}
}

export function getUserIdFromAccessToken(token: string): string | null {
	const payload = decodeJwtPayload(token);
	const candidate = payload?.sub || payload?.id || payload?.userId;
	return typeof candidate === "string" && candidate.trim() ? candidate : null;
}
