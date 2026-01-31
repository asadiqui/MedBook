export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';


export interface ApiRequestOptions {
    method ?: HttpMethod;
    body ?: unknown;
    headers ?: Record<string, string>;
}

export class Apierror extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }

}

function normalizeBaseUrl(raw: string): string {
    // Remove trailing slashes so `${base}${path}` behaves predictably
    return raw.replace(/\/+$/, '');
}

// IMPORTANT:
// - Backend API base is "http://localhost:3001/api"
// - Do NOT use "/api" here, because that targets Next.js API routes.
const BASE_URL = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
);

export async function apiRequest<T>(path : string, options: ApiRequestOptions = {}) : Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    let data: unknown = null;
    try {
        data = await response.json();
    } catch {
        // ignore JSON parse errors
    }

    if (!response.ok) {
        const message = (data as any)?.message || `Request failed with status ${response.status}`;
        throw new Apierror(message, response.status, data);
    }
    return data as T;
}
