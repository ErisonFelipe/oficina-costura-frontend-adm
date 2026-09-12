import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { Modal } from './Modal';
import { api } from '../../lib/api';
import type { User, UserRole } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  user?: User | null; // se passado, é edição; se null/undefined, é criação
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Acesso total, incluindo gestão de usuários',
  },
  {
    value: 'MANAGER',
    label: 'Gerente',
    description: 'Gerencia orçamentos e galeria',
  },
  {
    value: 'VIEWER',
    label: 'Visualizador',
    description: 'Apenas visualiza os dados',
  },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  user,
}) => {
  const isEditing = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('VIEWER');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setRole(user.role);
      setActive(user.active ?? true);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('VIEWER');
      setActive(true);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Nome e e-mail são obrigatórios');
      return;
    }

    if (!isEditing && password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (isEditing && password && password.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && user) {
        // Atualizar
        const payload: any = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          active,
        };
        if (password) payload.password = password;

        await api.users.update(user.id, payload);
        toast.success('Usuário atualizado!');
      } else {
        // Criar
        await api.users.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        });
        toast.success('Usuário criado!');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const message =
        err?.message?.includes('E-mail já cadastrado') ||
        err?.status === 409
          ? 'E-mail já cadastrado'
          : 'Erro ao salvar usuário';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar usuário' : 'Novo usuário'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="user-name" className="label">
            Nome *
          </label>
          <input
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            required
            disabled={isSaving}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="user-email" className="label">
            E-mail *
          </label>
          <input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@oficina.local"
            required
            disabled={isSaving}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="user-password" className="label">
            {isEditing ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}
          </label>
          <input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
            required={!isEditing}
            disabled={isSaving}
            className="input"
          />
        </div>

        <div>
          <label className="label">Permissão</label>
          <div className="space-y-2">
            {roleOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  role === opt.value
                    ? 'border-accent bg-accent-bg'
                    : 'border-border-light hover:border-accent-light'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={() => setRole(opt.value)}
                  className="mt-1 accent-accent"
                  disabled={isSaving}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-primary">
                    {opt.label}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {opt.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {isEditing && (
          <div>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border-light cursor-pointer hover:bg-bg-secondary transition-colors">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-accent"
                disabled={isSaving}
              />
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  Conta ativa
                </div>
                <div className="text-xs text-text-secondary">
                  Usuários inativos não conseguem fazer login
                </div>
              </div>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                {isEditing ? 'Salvar' : 'Criar usuário'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
