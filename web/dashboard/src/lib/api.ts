// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — API Client
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('smshive_access_token');
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      // Try refresh token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`;
        const retryResponse = await fetch(url, { ...fetchOptions, headers });
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, await retryResponse.text());
        }
        return retryResponse.json();
      }
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smshive_access_token');
        localStorage.removeItem('smshive_refresh_token');
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Unauthorized');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorBody.error || errorBody.message || 'Request failed');
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('smshive_refresh_token')
      : null;

    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.data?.accessToken) {
        localStorage.setItem('smshive_access_token', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('smshive_refresh_token', data.data.refreshToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
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
