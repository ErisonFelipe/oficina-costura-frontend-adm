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
  CreateRomaneioPayload,
  ListRomaneiosParams,
  PaginatedRomaneios,
  Romaneio,
  RomaneioStats,
  Client,
  ClientSearchResult,
  CreateClientPayload,
  UpdateClientPayload,
  ListClientsParams,
  PaginatedClients,
  RegisterPayload,
  RegisterResponse
} from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334/api';
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

  // Só envia Content-Type se houver body
  if (options.body) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

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
    
    async register(payload: RegisterPayload): Promise<RegisterResponse> {
      return request<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
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
  // ===== ROMANEIOS (ADMIN) =====
  romaneios: {
    async list(params: ListRomaneiosParams = {}): Promise<PaginatedRomaneios> {
      const search = new URLSearchParams();
      if (params.search) search.set('search', params.search);
      if (params.cliente) search.set('cliente', params.cliente);
      if (params.page) search.set('page', String(params.page));
      if (params.limit) search.set('limit', String(params.limit));

      const qs = search.toString();
      return request<PaginatedRomaneios>(
        `/admin/romaneios${qs ? `?${qs}` : ''}`,
        {},
        true
      );
    },

    async show(id: string): Promise<{ data: Romaneio }> {
      return request<{ data: Romaneio }>(`/admin/romaneios/${id}`, {}, true);
    },

    async stats(): Promise<{ data: RomaneioStats }> {
      return request<{ data: RomaneioStats }>(
        '/admin/romaneios/stats',
        {},
        true
      );
    },

    async create(
      payload: CreateRomaneioPayload
    ): Promise<{ message: string; data: Romaneio }> {
      return request<{ message: string; data: Romaneio }>(
        '/admin/romaneios',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );
    },

    async update(
      id: string,
      payload: Partial<CreateRomaneioPayload>
    ): Promise<{ message: string; data: Romaneio }> {
      return request<{ message: string; data: Romaneio }>(
        `/admin/romaneios/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
        true
      );
    },

    async delete(id: string): Promise<void> {
      await request(`/admin/romaneios/${id}`, { method: 'DELETE' }, true);
    },

    // Retorna a URL para baixar o PDF (o navegador faz o download direto)
    getPdfUrl(id: string): string {
      return `${API_URL}/admin/romaneios/${id}/pdf`;
    },

    // Baixa o PDF como blob (para casos onde precisamos do arquivo)
    async downloadPdf(id: string): Promise<Blob> {
      const token = tokenStorage.get();
      if (!token) throw new ApiException('Não autenticado', 401);

      const response = await fetch(`${API_URL}/admin/romaneios/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new ApiException('Erro ao baixar PDF', response.status);
      }

      return response.blob();
    },
  },
  // ===== CLIENTES (ADMIN) =====
  clients: {
    async list(params: ListClientsParams = {}): Promise<PaginatedClients> {
      const search = new URLSearchParams();
      if (params.search) search.set('search', params.search);
      if (params.active !== undefined) search.set('active', String(params.active));
      if (params.page) search.set('page', String(params.page));
      if (params.limit) search.set('limit', String(params.limit));

      const qs = search.toString();
      return request<PaginatedClients>(
        `/admin/clients${qs ? `?${qs}` : ''}`,
        {},
        true
      );
    },

    async show(id: string): Promise<{ data: Client }> {
      return request<{ data: Client }>(`/admin/clients/${id}`, {}, true);
    },

    async search(term: string): Promise<{ data: ClientSearchResult[] }> {
      const qs = new URLSearchParams({ q: term });
      return request<{ data: ClientSearchResult[] }>(
        `/admin/clients/search?${qs}`,
        {},
        true
      );
    },

    async create(
      payload: CreateClientPayload
    ): Promise<{ message: string; data: Client }> {
      return request<{ message: string; data: Client }>(
        '/admin/clients',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );
    },

    async update(
      id: string,
      payload: UpdateClientPayload
    ): Promise<{ message: string; data: Client }> {
      return request<{ message: string; data: Client }>(
        `/admin/clients/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
        true
      );
    },

    async delete(id: string): Promise<void> {
      await request(`/admin/clients/${id}`, { method: 'DELETE' }, true);
    },
  },
};
