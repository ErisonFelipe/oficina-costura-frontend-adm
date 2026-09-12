// ===== USUÁRIO =====
export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}

// ===== AUTENTICAÇÃO =====
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// ===== ORÇAMENTOS =====
export type QuoteStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: QuoteStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedQuotes {
  data: Quote[];
  pagination: Pagination;
}

export interface ListQuotesParams {
  status?: QuoteStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ===== API =====
export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  message?: string;
}
