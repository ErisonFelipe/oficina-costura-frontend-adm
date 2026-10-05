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
  RegisterResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334/api';

// ===== ACCESS TOKEN EM MEMÓRIA =====
// NUNCA usa localStorage. Só existe enquanto a aba estiver aberta.
let accessToken: string | null = null;

export const tokenMemory = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
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

// ===== REFRESH AUTOMÁTICO =====
// Evita múltiplas chamadas simultâneas de refresh
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Se já tem um refresh em andamento, aguarda ele
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // envia o cookie httpOnly
      });

      if (!response.ok) {
        throw new Error('Refresh falhou');
      }

      const data = await response.json();
      const newToken = data.data?.accessToken;

      if (!newToken) throw new Error('Token não retornado');

      accessToken = newToken;
      return newToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ===== FETCH WRAPPER =====
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (options.body) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    if (!accessToken) {
      // Tenta renovar antes mesmo de tentar
      try {
        await refreshAccessToken();
      } catch {
        throw new ApiException('Não autenticado', 401);
      }
    }
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // envia cookies (refresh)
  });

  // Se 401 e é rota autenticada, tenta renovar
  if (response.status === 401 && requireAuth) {
    try {
      await refreshAccessToken();
      // Repete a requisição original com o novo token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      // Refresh falhou — limpa e avisa o app
      accessToken = null;
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new ApiException('Sessão expirada', 401);
    }
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
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
      const response = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      // Salva o access token em memória
      accessToken = response.data.accessToken;
      return response;
    },

    async me(): Promise<{ data: User }> {
      return request<{ data: User }>('/auth/me', {}, true);
    },

    async refresh(): Promise<{ data: { accessToken: string; user: User } }> {
      const response = await request<{ data: { accessToken: string; user: User } }>(
        '/auth/refresh',
        { method: 'POST' }
      );
      accessToken = response.data.accessToken;
      return response;
    },

    async logout(): Promise<void> {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        accessToken = null;
      }
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

  // ===== ROMANEIOS =====
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
      return request<{ data: RomaneioStats }>('/admin/romaneios/stats', {}, true);
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

    getPdfUrl(id: string): string {
      return `${API_URL}/admin/romaneios/${id}/pdf`;
    },

    async downloadPdf(id: string): Promise<Blob> {
      const response = await fetch(`${API_URL}/admin/romaneios/${id}/pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        credentials: 'include',
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

// Helper para URL completa da imagem
export const getImageUrl = (filename: string): string => {
  return `/uploads/gallery/${filename}`;
};

// Exporta para uso onde precisamos da URL base
export { API_URL };
