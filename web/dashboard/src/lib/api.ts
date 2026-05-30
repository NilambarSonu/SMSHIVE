// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — API Client (Clerk-powered)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Use relative URL in browser to leverage Next.js rewrites (/api/* → backend)
// This avoids CORS issues when the backend is on a different port.
// Only fall back to the full URL in SSR context.
const API_BASE = typeof window !== 'undefined'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

type GetTokenFn = () => Promise<string | null>;

class ApiClient {
  private baseUrl: string;
  private getTokenFn: GetTokenFn | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the Clerk token getter function.
   * Called from React components via useAuth().getToken
   */
  setTokenGetter(fn: GetTokenFn) {
    this.getTokenFn = fn;
  }

  private async getToken(): Promise<string | null> {
    if (this.getTokenFn) {
      try {
        return await this.getTokenFn();
      } catch {
        return null;
      }
    }
    return null;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    // When baseUrl is empty (browser), use window.location.origin for URL parsing
    // but return relative path so fetch goes through Next.js rewrites
    const base = this.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const url = new URL(`${base}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    // Return relative URL when using browser (no baseUrl) to leverage Next.js rewrites
    if (!this.baseUrl) {
      return `${url.pathname}${url.search}`;
    }
    return url.toString();
  }

  async request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);
    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (err: any) {
      // Network-level errors: ECONNREFUSED, DNS failure, offline, etc.
      throw new ApiError(0, 'Unable to connect to the server. Please check if the backend is running.');
    }

    if (response.status === 401) {
      // Clerk handles session refresh automatically.
      // If we still get 401, the session is truly expired.
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    if (response.status === 502 || response.status === 503) {
      throw new ApiError(response.status, 'Backend service is temporarily unavailable. Please try again later.');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorBody.error || errorBody.message || 'Request failed');
    }

    return response.json();
  }

  get<T>(path: string, options?: ApiOptions) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: ApiOptions) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = new ApiClient(API_BASE);
