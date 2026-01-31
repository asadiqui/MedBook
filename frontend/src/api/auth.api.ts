import { apiRequest } from "./apiClient";

type AuthOptions = {
	accessToken?: string;
};

function authHeaders(accessToken?: string): Record<string, string> {
	return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export type CurrentUser = {
	id: string;
	email?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	avatar?: string | null;
	role?: string | null;
	specialty?: string | null;
};

export type LoginRequest = {
	email: string;
	password: string;
	twoFactorCode?: string;
};

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

export type AuthResponse = {
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
		avatar: string | null;
	};
	tokens: AuthTokens;
};

// GET /auth/me
export function getCurrentUser(options: AuthOptions = {}) {
	return apiRequest<CurrentUser>("/auth/me", {
		method: "GET",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// POST /auth/login
export function login(data: LoginRequest) {
	return apiRequest<AuthResponse>("/auth/login", {
		method: "POST",
		body: data,
	});
}
