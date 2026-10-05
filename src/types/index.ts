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
    accessToken: string;
    user: User;
  };
}

export interface RefreshResponse {
  message: string;
  data: {
    accessToken: string;
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

// ===== ROMANEIOS =====
export interface GradeItem {
  cor: string;
  tamanho?: string;
  quantidade: number;
}

export interface RomaneioCobranca {
  valorUnitario: number;
  valorTotal: number;
  observacao?: string;
}

export interface Romaneio {
  id: string;
  numero: string;
  cliente: string;
  clientId: string | null; 
  client?: {                   // ← novo
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  data: string;
  produto: string;
  referencia: string | null;
  tipoTecido: string | null;
  quantidadeRolos: number | null;
  quantidadeFolhas: number | null;
  quantidadeEncaixados: string | null;
  quantidadePecas: number;
  quantidadeVolumes: number | null;
  cortadorResponsavel: string | null;
  conferidoPor: string | null;
  grade: GradeItem[];
  cobranca: RomaneioCobranca;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRomaneioPayload {
  cliente: string;
  data: string;
  produto: string;
  referencia?: string;
  tipoTecido?: string;
  quantidadeRolos?: number;
  quantidadeFolhas?: number;
  quantidadeEncaixados?: string;
  quantidadePecas: number;
  quantidadeVolumes?: number;
  cortadorResponsavel?: string;
  conferidoPor?: string;
  grade: GradeItem[];
  cobranca: RomaneioCobranca;
  observacoes?: string;
}

export interface ListRomaneiosParams {
  search?: string;
  cliente?: string;
  page?: number;
  limit?: number;
}

export interface RomaneioStats {
  total: number;
  doAno: number;
  doMes: number;
  pecasTotal: number;
}

export interface PaginatedRomaneios {
  data: Romaneio[];
  pagination: Pagination;
}
// ===== CLIENTES =====
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    romaneios: number;
  };
}

export interface ClientSearchResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
}

export interface CreateClientPayload {
  name: string;
  phone: string;
  email?: string;
  document?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {
  active?: boolean;
}

export interface ListClientsParams {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  data: Client[];
  pagination: Pagination;
}

// ===== REGISTRO =====
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      createdAt: string;
    };
  };
}
