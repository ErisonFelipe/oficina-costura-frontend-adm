import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiClipboard,
  FiEye,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { StatusFilter } from '../components/ui/StatusFilter';
import { EmptyState } from '../components/ui/EmptyState';
import { QuoteDetailModal } from '../components/ui/QuoteDetailModal';
import { api } from '../lib/api';
import type { Quote, QuoteStatus, Pagination as PaginationType } from '../types';

export const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | undefined>();
  const [page, setPage] = useState(1);

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.quotes.list({
        search: search || undefined,
        status: statusFilter,
        page,
        limit: 10,
      });
      setQuotes(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleView = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };

  const handleUpdated = (updated: Quote) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  };

  const handleDelete = async (quote: Quote) => {
    if (!confirm(`Tem certeza que deseja deletar o orçamento de ${quote.name}?`)) {
      return;
    }

    setDeletingId(quote.id);
    try {
      await api.quotes.delete(quote.id);
      toast.success('Orçamento deletado');
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
      loadQuotes();
    } catch {
      toast.error('Erro ao deletar orçamento');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter(undefined);
    setPage(1);
  };

  const hasActiveFilters = !!search || !!statusFilter;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-text-primary mb-2">
          Orçamentos
        </h1>
        <p className="text-sm text-text-secondary">
          Gerencie todas as solicitações de orçamento recebidas pelo site.
        </p>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6 space-y-4">
        {/* Busca */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, e-mail ou mensagem..."
            className="input pl-11 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-secondary"
              aria-label="Limpar busca"
            >
              <FiX className="w-4 h-4 text-text-light" />
            </button>
          )}
        </div>

        {/* Filtro de status */}
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />

        {/* Resumo */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-text-light pt-2 border-t border-border-light">
            <span>
              Filtros ativos
              {search && (
                <>
                  {' '}
                  — busca: <strong className="text-text-primary">"{search}"</strong>
                </>
              )}
            </span>
            <button
              onClick={clearFilters}
              className="text-accent hover:underline font-semibold"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-light">Carregando orçamentos...</p>
            </div>
          </div>
        ) : quotes.length === 0 ? (
          <EmptyState
            icon={FiClipboard}
            title={hasActiveFilters ? 'Nenhum resultado' : 'Nenhum orçamento ainda'}
            description={
              hasActiveFilters
                ? 'Tente ajustar os filtros ou o termo de busca.'
                : 'Quando alguém solicitar um orçamento pelo site, aparecerá aqui.'
            }
            action={
              hasActiveFilters ? (
                <button onClick={clearFilters} className="btn btn-outline">
                  Limpar filtros
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Header da tabela (desktop) */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 border-b border-border-light bg-bg-secondary text-xs uppercase tracking-wider text-text-light font-semibold">
              <div className="col-span-3">Cliente</div>
              <div className="col-span-3">Contato</div>
              <div className="col-span-3">Mensagem</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Data</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {/* Linhas */}
            <div className="divide-y divide-border-light">
              {quotes.map((quote, index) => (
                <motion.div
                  key={quote.id}
                  className="px-6 py-4 hover:bg-bg-secondary transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  {/* Desktop */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="font-semibold text-sm text-text-primary truncate">
                        {quote.name}
                      </div>
                      {quote.service && (
                        <div className="text-xs text-text-light capitalize mt-0.5">
                          {quote.service.replace(/-/g, ' ')}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <div className="text-xs text-text-secondary truncate">
                        {quote.email}
                      </div>
                      <div className="text-xs text-text-light">
                        {quote.phone || '—'}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {quote.message}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <Badge status={quote.status} />
                    </div>
                    <div className="col-span-1 text-xs text-text-light">
                      {formatDistanceToNow(new Date(quote.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleView(quote)}
                        className="p-2 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                        title="Ver detalhes"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(quote)}
                        disabled={deletingId === quote.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Deletar"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="lg:hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-text-primary truncate">
                          {quote.name}
                        </div>
                        <div className="text-xs text-text-secondary truncate">
                          {quote.email}
                        </div>
                      </div>
                      <Badge status={quote.status} />
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                      {quote.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-light">
                        {formatDistanceToNow(new Date(quote.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleView(quote)}
                          className="p-1.5 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quote)}
                          disabled={deletingId === quote.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Modal de detalhes */}
      <QuoteDetailModal
        quote={selectedQuote}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={handleUpdated}
      />
    </div>
  );
};
