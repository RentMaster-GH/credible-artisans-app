export interface AuthUser {
  id: string;
  app_id: string;
  email: string;
  role: string;
  custom_claims: Record<string, unknown>;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private storagePrefix: string;

  constructor(baseUrl: string, appId: string) {
    // Strip trailing slash if present (e.g., https://yourdomain.com)
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.appId = appId;
    this.storagePrefix = `cb_${appId}`;
  }

  private getAccessToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem(`${this.storagePrefix}_access`)
      : null;
  }

  private getRefreshToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem(`${this.storagePrefix}_refresh`)
      : null;
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.storagePrefix}_access`, accessToken);
      localStorage.setItem(`${this.storagePrefix}_refresh`, refreshToken);
    }
  }

  public clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.storagePrefix}_access`);
      localStorage.removeItem(`${this.storagePrefix}_refresh`);
    }
  }

  // Core fetch wrapper with automatic 15-minute token rotation
  private async request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    // If access token expired, attempt silent rotation once
    if (res.status === 401 && retry && this.getRefreshToken()) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return this.request<T>(path, options, false);
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data as T;
  }

  // --- AUTH METHODS ---

  async register(email: string, password: string, customClaims: Record<string, unknown> = {}) {
    const data = await this.request<{ user: AuthUser; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          app_id: this.appId,
          email,
          password,
          custom_claims: customClaims,
        }),
      },
      false
    );
    this.saveTokens(data.accessToken, data.refreshToken);
    return data.user;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          app_id: this.appId,
          email,
          password,
        }),
      },
      false
    );
    this.saveTokens(data.accessToken, data.refreshToken);
    return this.getMe();
  }

  async refreshSession(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      this.saveTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    this.clearTokens();
  }

  async getMe() {
    return this.request<{ message: string; payload: Record<string, unknown> }>('/me');
  }

  // --- ISOLATED APP DATA (CRUD) METHODS ---

  async create<T = Record<string, unknown>>(collection: string, payload: Record<string, unknown>) {
    return this.request<T>(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async list<T = Record<string, unknown>>(collection: string) {
    try {
      const res = await this.request<{ records: T[] }>(`/data/${collection}`);
      return res.records || [];
    } catch (err: any) {
      if (!this.getAccessToken() && String(err?.message || "").toLowerCase().includes("authorization")) {
        return [];
      }
      throw err;
    }
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    updates: Record<string, unknown>
  ) {
    return this.request<T>(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async remove(collection: string, id: string) {
    return this.request<{ deleted: boolean; id: string }>(`/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }
}
