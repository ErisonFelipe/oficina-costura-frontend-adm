import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserFormModal } from '../components/ui/UserFormModal';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { User, UserRole } from '../types';

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  VIEWER: 'Visualizador',
};

const roleColors: Record<UserRole, string> = {
  ADMIN: 'bg-accent-bg text-accent border-accent-light',
  MANAGER: 'bg-blue-50 text-blue-700 border-blue-200',
  VIEWER: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.users.list();
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode deletar sua própria conta');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar o usuário "${user.name}"?`)) {
      return;
    }

    setDeletingId(user.id);
    try {
      await api.users.delete(user.id);
      toast.success('Usuário deletado');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      toast.error('Erro ao deletar usuário');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-text-primary mb-2">
            Usuários
          </h1>
          <p className="text-sm text-text-secondary">
            Gerencie quem tem acesso ao painel administrativo.
          </p>
        </div>
        <button onClick={handleNew} className="btn btn-primary self-start">
          <FiPlus className="w-4 h-4" />
          Novo usuário
        </button>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-light">Carregando usuários...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="Nenhum usuário cadastrado"
            description="Crie o primeiro usuário para dar acesso ao painel."
            action={
              <button onClick={handleNew} className="btn btn-primary">
                <FiPlus className="w-4 h-4" />
                Criar usuário
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-border-light">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                className="p-4 lg:p-5 hover:bg-bg-secondary transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                      user.active
                        ? 'bg-accent text-white'
                        : 'bg-border-light text-text-light'
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-text-primary truncate">
                        {user.name}
                      </span>
                      {user.id === currentUser?.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          Você
                        </span>
                      )}
                      {!user.active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary truncate mb-1">
                      {user.email}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-light">
                      <span className="flex items-center gap-1">
                        <FiShield className="w-3 h-3" />
                        {roleLabels[user.role]}
                      </span>
                      {user.lastLogin && (
                        <span>
                          Último acesso:{' '}
                          {format(new Date(user.lastLogin), "dd MMM 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge de role */}
                  <span
                    className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      roleColors[user.role]
                    }`}
                  >
                    {roleLabels[user.role]}
                  </span>

                  {/* Ações */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 rounded-lg hover:bg-accent-bg text-text-secondary hover:text-accent transition-colors"
                      title="Editar"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={
                        user.id === currentUser?.id || deletingId === user.id
                      }
                      className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        user.id === currentUser?.id
                          ? 'Você não pode deletar a si mesmo'
                          : 'Deletar'
                      }
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadUsers}
        user={editingUser}
      />
    </div>
  );
};
