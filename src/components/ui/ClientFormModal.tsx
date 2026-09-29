import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { Modal } from './Modal';
import { api } from '../../lib/api';
import type { Client, CreateClientPayload } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  client?: Client | null; // se passado, é edição
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  notes: string;
}

const initialForm: FormData = {
  name: '',
  phone: '',
  email: '',
  document: '',
  address: '',
  notes: '',
};

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  client,
}) => {
  const isEditing = !!client;

  const [form, setForm] = useState<FormData>(initialForm);
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sincroniza quando abre o modal
  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        phone: client.phone,
        email: client.email || '',
        document: client.document || '',
        address: client.address || '',
        notes: client.notes || '',
      });
      setActive(client.active);
    } else {
      setForm(initialForm);
      setActive(true);
    }
    setErrors({});
  }, [client, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Nome é obrigatório (mínimo 2 caracteres)';
    }

    if (!form.phone.trim() || form.phone.trim().length < 8) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsSaving(true);

    try {
      const payload: CreateClientPayload = {
        name: form.name.trim(),
        phone: form.phone.trim().replace(/\D/g, ''), // remove formatação
        email: form.email.trim() || undefined,
        document: form.document.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (isEditing && client) {
        await api.clients.update(client.id, { ...payload, active });
        toast.success('Cliente atualizado!');
      } else {
        await api.clients.create(payload);
        toast.success('Cliente cadastrado!');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const message =
        err?.details
          ? Object.values(err.details).flat().join(', ')
          : err?.message || 'Erro ao salvar cliente';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar cliente' : 'Novo cliente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Nome *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Leo Silva"
              disabled={isSaving}
              className={`input ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="label">Telefone / WhatsApp *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              disabled={isSaving}
              className={`input ${errors.phone ? 'border-red-400' : ''}`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="cliente@email.com"
              disabled={isSaving}
              className={`input ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="label">CNPJ / CPF</label>
            <input
              type="text"
              name="document"
              value={form.document}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              disabled={isSaving}
              className="input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Endereço</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Rua, número, bairro, cidade"
              disabled={isSaving}
              className="input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Observações</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Anotações sobre o cliente..."
              disabled={isSaving}
              className="input resize-y"
            />
          </div>

          {isEditing && (
            <div className="sm:col-span-2">
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
                    Cliente ativo
                  </div>
                  <div className="text-xs text-text-secondary">
                    Clientes inativos não aparecem nas buscas
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

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
                {isEditing ? 'Salvar' : 'Cadastrar'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
