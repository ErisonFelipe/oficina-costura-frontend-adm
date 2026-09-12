import type {
  ApiError,
  AuthResponse,
  ListQuotesParams,
  LoginCredentials,
  PaginatedQuotes,
  Quote,
  QuoteStats,
  QuoteStatus,
  User,
  UserRole,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334/api';
const TOKEN_KEY = 'oficina_adm_token';

// ===== TOKEN MANAGEMENT =====
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

// ===== ERRO CUSTOMIZADO =====
export class ApiException extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.details = details;
  }
}

// ===== FETCH WRAPPER =====
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requireAuth) {
    const token = tokenStorage.get();
    if (!token) {
      throw new ApiException('Não autenticado', 401);
    }
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && requireAuth) {
      tokenStorage.remove();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const err = data as ApiError;
    throw new ApiException(
      err.error || err.message || `Erro ${response.status}`,
      response.status,
      err.details
    );
  }

  return data as T;
}

// ===== API CLIENT =====
export const api = {
  // ===== AUTENTICAÇÃO =====
  auth: {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
      return request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    async me(): Promise<{ data: User }> {
      return request<{ data: User }>('/auth/me', {}, true);
    },

    async logout(): Promise<void> {
      await request('/auth/logout', { method: 'POST' });
      tokenStorage.remove();
    },
  },

  // ===== ORÇAMENTOS =====
  quotes: {
    async list(params: ListQuotesParams = {}): Promise<PaginatedQuotes> {
      const search = new URLSearchParams();
      if (params.status) search.set('status', params.status);
      if (params.search) search.set('search', params.search);
      if (params.page) search.set('page', String(params.page));
      if (params.limit) search.set('limit', String(params.limit));

      const qs = search.toString();
      return request<PaginatedQuotes>(
        `/admin/quotes${qs ? `?${qs}` : ''}`,
        {},
        true
      );
    },

    async show(id: string): Promise<{ data: Quote }> {
      return request<{ data: Quote }>(`/admin/quotes/${id}`, {}, true);
    },

    async stats(): Promise<{ data: QuoteStats }> {
      return request<{ data: QuoteStats }>('/admin/quotes/stats', {}, true);
    },

    async updateStatus(
      id: string,
      status: QuoteStatus,
      notes?: string
    ): Promise<{ data: Quote }> {
      return request<{ data: Quote }>(
        `/admin/quotes/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, notes }),
        },
        true
      );
    },

    async delete(id: string): Promise<void> {
      await request(`/admin/quotes/${id}`, { method: 'DELETE' }, true);
    },
  },

  // ===== USUÁRIOS (ADMIN) =====
  users: {
    async list(): Promise<{ data: User[] }> {
      return request<{ data: User[] }>('/admin/users', {}, true);
    },

    async create(payload: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }): Promise<{ data: User }> {
      return request<{ data: User }>(
        '/admin/users',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );
    },

    async update(
      id: string,
      payload: Partial<{
        name: string;
        email: string;
        password: string;
        role: UserRole;
        active: boolean;
      }>
    ): Promise<{ data: User }> {
      return request<{ data: User }>(
        `/admin/users/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
        true
      );
    },

    async delete(id: string): Promise<void> {
      await request(`/admin/users/${id}`, { method: 'DELETE' }, true);
    },
  },
};
