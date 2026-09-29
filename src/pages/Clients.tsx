import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiX,
  FiPhone,
  FiMail,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { ClientFormModal } from '../components/ui/ClientFormModal';
import { api } from '../lib/api';
import type { Client, Pagination as PaginationType } from '../types';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.clients.list({
        search: search || undefined,
        active: filterActive,
        page,
        limit: 20,
      });
      setClients(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterActive, page]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (client: Client) => {
    const hasRomaneios = (client._count?.romaneios ?? 0) > 0;
    const message = hasRomaneios
      ? `"${client.name}" tem ${client._count?.romaneios} romaneio(s). Será desativado, não deletado. Continuar?`
      : `Tem certeza que deseja deletar o cliente "${client.name}"?`;

    if (!confirm(message)) return;

    setDeletingId(client.id);
    try {
      await api.clients.delete(client.id);
      toast.success(hasRomaneios ? 'Cliente desativado' : 'Cliente deletado');
      loadClients();
    } catch {
      toast.error('Erro ao deletar cliente');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setFilterActive(true);
    setPage(1);
  };

  const hasActiveFilters = !!search || filterActive !== true;

  // Formata telefone visualmente
  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-text-primary mb-2">
            Clientes
          </h1>
          <p className="text-sm text-text-secondary">
            Cadastro de clientes para agilizar a criação de romaneios.
          </p>
        </div>
        <button onClick={handleNew} className="btn btn-primary self-start">
          <FiPlus className="w-4 h-4" />
          Novo cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, telefone, e-mail ou documento..."
            className="input pl-11 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-secondary"
            >
              <FiX className="w-4 h-4 text-text-light" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: true, label: 'Ativos' },
            { value: false, label: 'Inativos' },
            { value: undefined, label: 'Todos' },
          ].map((opt) => {
            const isActive = filterActive === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => {
                  setFilterActive(opt.value);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isActive
                    ? 'border-accent bg-accent text-white shadow-sm'
                    : 'border-border-light bg-white text-text-secondary hover:border-accent-light'
                }`}
              >
                {opt.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-accent hover:underline font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-light">Carregando clientes...</p>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title={hasActiveFilters ? 'Nenhum resultado' : 'Nenhum cliente ainda'}
            description={
              hasActiveFilters
                ? 'Tente ajustar os filtros ou o termo de busca.'
                : 'Cadastre o primeiro cliente para agilizar seus romaneios.'
            }
            action={
              hasActiveFilters ? (
                <button onClick={clearFilters} className="btn btn-outline">
                  Limpar filtros
                </button>
              ) : (
                <button onClick={handleNew} className="btn btn-primary">
                  <FiPlus className="w-4 h-4" />
                  Cadastrar cliente
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="divide-y divide-border-light">
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  className="p-4 lg:p-5 hover:bg-bg-secondary transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                        client.active
                          ? 'bg-accent text-white'
                          : 'bg-border-light text-text-light'
                      }`}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-text-primary truncate">
                          {client.name}
                        </span>
                        {!client.active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                            Inativo
                          </span>
                        )}
                        {client._count && client._count.romaneios > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary border border-border-light font-semibold">
                            {client._count.romaneios}{' '}
                            {client._count.romaneios === 1 ? 'romaneio' : 'romaneios'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <FiPhone className="w-3 h-3" />
                          {formatPhone(client.phone)}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <FiMail className="w-3 h-3" />
                            {client.email}
                          </span>
                        )}
                        {client.document && (
                          <span className="text-text-light">
                            {client.document}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                        title="Editar"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        disabled={deletingId === client.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Deletar"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadClients}
        client={editingClient}
      />
    </div>
  );
};
