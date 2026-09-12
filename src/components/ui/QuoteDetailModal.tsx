import React, { useState } from 'react';
import { FiMail, FiPhone, FiCalendar, FiFileText, FiSave } from 'react-icons/fi';
import { Modal } from './Modal';
import { Badge } from './Badge';
import type { Quote, QuoteStatus } from '../../types';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuoteDetailModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (quote: Quote) => void;
}

const statusOptions: { value: QuoteStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [status, setStatus] = useState<QuoteStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza quando o quote muda
  React.useEffect(() => {
    if (quote) {
      setStatus(quote.status);
      setNotes(quote.notes || '');
    }
  }, [quote]);

  if (!quote) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.quotes.updateStatus(quote.id, status, notes);
      toast.success('Orçamento atualizado!');
      onUpdated(response.data);
      onClose();
    } catch (err) {
      toast.error('Erro ao atualizar orçamento');
    } finally {
      setIsSaving(false);
    }
  };

  const whatsappLink = quote.phone
    ? `https://wa.me/55${quote.phone.replace(/\D/g, '')}`
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do orçamento" size="lg">
      <div className="space-y-6">
        {/* Header com nome + status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-text-primary mb-1">
              {quote.name}
            </h3>
            <Badge status={quote.status} />
          </div>
          <div className="text-xs text-text-light text-right">
            <div>Recebido em</div>
            <div className="font-medium text-text-secondary">
              {format(new Date(quote.createdAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </div>
            <div>
              às{' '}
              {format(new Date(quote.createdAt), 'HH:mm', {
                locale: ptBR,
              })}
            </div>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary">
            <FiMail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-text-light mb-0.5">
                E-mail
              </div>
              <a
                href={`mailto:${quote.email}`}
                className="text-sm font-medium text-text-primary hover:text-accent transition-colors break-all"
              >
                {quote.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary">
            <FiPhone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-text-light mb-0.5">
                Telefone
              </div>
              {quote.phone ? (
                <a
                  href={whatsappLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
                >
                  {quote.phone}
                </a>
              ) : (
                <span className="text-sm text-text-light">Não informado</span>
              )}
            </div>
          </div>
        </div>

        {/* Serviço */}
        {quote.service && (
          <div className="flex items-start gap-3">
            <FiFileText className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-text-light mb-0.5">
                Serviço solicitado
              </div>
              <div className="text-sm font-medium text-text-primary capitalize">
                {quote.service.replace(/-/g, ' ')}
              </div>
            </div>
          </div>
        )}

        {/* Mensagem */}
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-light mb-2">
            <FiFileText className="w-3.5 h-3.5" />
            Mensagem do cliente
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border-light text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {quote.message}
          </div>
        </div>

        {/* Atualização de status */}
        <div className="pt-4 border-t border-border-light space-y-4">
          <div>
            <label className="label">Atualizar status</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    status === opt.value
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-secondary text-text-secondary hover:bg-border-light'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Anotações internas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Adicione observações sobre este orçamento..."
              className="input resize-y"
            />
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary flex-1"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Salvar alterações
                </>
              )}
            </button>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#25D366] text-white hover:bg-[#1eb958] flex-1 sm:flex-initial"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
