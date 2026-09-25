import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEye,
  FiTrash2,
  FiX,
  FiClipboard,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { api, tokenStorage } from '../lib/api';
import type { Romaneio, Pagination as PaginationType } from '../types';

export const Romaneios: React.FC = () => {
  const navigate = useNavigate();
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadRomaneios = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.romaneios.list({
        search: search || undefined,
        page,
        limit: 10,
      });
      setRomaneios(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar romaneios');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadRomaneios();
  }, [loadRomaneios]);

  const handleDelete = async (romaneio: Romaneio) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o romaneio ${romaneio.numero} de ${romaneio.cliente}?`
      )
    ) {
      return;
    }

    setDeletingId(romaneio.id);
    try {
      await api.romaneios.delete(romaneio.id);
      toast.success('Romaneio deletado');
      setRomaneios((prev) => prev.filter((r) => r.id !== romaneio.id));
      loadRomaneios();
    } catch {
      toast.error('Erro ao deletar romaneio');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async (romaneio: Romaneio) => {
    try {
      const token = tokenStorage.get();
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      toast.loading('Gerando PDF...', { id: 'pdf' });

      const response = await fetch(
        `http://localhost:3334/api/admin/romaneios/${romaneio.id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `romaneio-${romaneio.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF', { id: 'pdf' });
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = !!search;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-text-primary mb-2">
            Romaneios
          </h1>
          <p className="text-sm text-text-secondary">
            Gerencie os romaneios de corte da Danka Modas.
          </p>
        </div>
        <Link to="/romaneios/novo" className="btn btn-primary self-start">
          <FiPlus className="w-4 h-4" />
          Novo romaneio
        </Link>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por número, cliente, produto ou referência..."
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

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-text-light pt-3 mt-3 border-t border-border-light">
            <span>
              Buscando por:{' '}
              <strong className="text-text-primary">"{search}"</strong>
            </span>
            <button
              onClick={clearFilters}
              className="text-accent hover:underline font-semibold"
            >
              Limpar
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
              <p className="text-sm text-text-light">Carregando romaneios...</p>
            </div>
          </div>
        ) : romaneios.length === 0 ? (
          <EmptyState
            icon={FiClipboard}
            title={hasActiveFilters ? 'Nenhum resultado' : 'Nenhum romaneio ainda'}
            description={
              hasActiveFilters
                ? 'Tente ajustar o termo de busca.'
                : 'Crie o primeiro romaneio de corte para começar.'
            }
            action={
              hasActiveFilters ? (
                <button onClick={clearFilters} className="btn btn-outline">
                  Limpar busca
                </button>
              ) : (
                <Link to="/romaneios/novo" className="btn btn-primary">
                  <FiPlus className="w-4 h-4" />
                  Criar romaneio
                </Link>
              )
            }
          />
        ) : (
          <>
            {/* Header da tabela (desktop) */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 border-b border-border-light bg-bg-secondary text-xs uppercase tracking-wider text-text-light font-semibold">
              <div className="col-span-2">Número</div>
              <div className="col-span-3">Cliente</div>
              <div className="col-span-3">Produto</div>
              <div className="col-span-2">Data</div>
              <div className="col-span-1 text-right">Peças</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {/* Linhas */}
            <div className="divide-y divide-border-light">
              {romaneios.map((romaneio, index) => (
                <motion.div
                  key={romaneio.id}
                  className="px-6 py-4 hover:bg-bg-secondary transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => navigate(`/romaneios/${romaneio.id}`)}
                >
                  {/* Desktop */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <div className="font-mono text-sm font-semibold text-accent">
                        {romaneio.numero}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="font-semibold text-sm text-text-primary truncate">
                        {romaneio.cliente}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-text-secondary truncate">
                        {romaneio.produto}
                      </div>
                      {romaneio.referencia && (
                        <div className="text-xs text-text-light">
                          Ref: {romaneio.referencia}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-xs text-text-secondary">
                      {format(new Date(romaneio.data), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                    <div className="col-span-1 text-right text-sm font-semibold text-text-primary">
                      {romaneio.quantidadePecas.toLocaleString('pt-BR')}
                    </div>
                    <div
                      className="col-span-1 flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/romaneios/${romaneio.id}`)}
                        className="p-2 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                        title="Ver detalhes"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(romaneio)}
                        className="p-2 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                        title="Baixar PDF"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(romaneio)}
                        disabled={deletingId === romaneio.id}
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
                        <div className="font-mono text-sm font-semibold text-accent mb-1">
                          {romaneio.numero}
                        </div>
                        <div className="font-semibold text-sm text-text-primary truncate">
                          {romaneio.cliente}
                        </div>
                        <div className="text-xs text-text-secondary truncate">
                          {romaneio.produto}
                        </div>
                      </div>
                      <div className="text-right text-xs text-text-light whitespace-nowrap">
                        {format(new Date(romaneio.data), 'dd/MM/yy', {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-light">
                        {romaneio.quantidadePecas.toLocaleString('pt-BR')} peças
                      </span>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDownloadPdf(romaneio)}
                          className="p-1.5 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(romaneio)}
                          disabled={deletingId === romaneio.id}
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
    </div>
  );
};
