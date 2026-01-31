export type StoredTokens = {
	accessToken: string;
	refreshToken?: string;
};

function isBrowser(): boolean {
	return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
	if (!isBrowser()) return null;
	return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

export function getRefreshToken(): string | null {
	if (!isBrowser()) return null;
	return localStorage.getItem("refreshToken");
}

export function setTokens(tokens: StoredTokens): void {
	if (!isBrowser()) return;
	localStorage.setItem("accessToken", tokens.accessToken);
	if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
}

export function clearTokens(): void {
	if (!isBrowser()) return;
	localStorage.removeItem("accessToken");
	localStorage.removeItem("token");
	localStorage.removeItem("refreshToken");
}
