import React from 'react';
import type { QuoteStatus } from '../../types';

interface BadgeProps {
  status: QuoteStatus;
}

const statusConfig: Record<QuoteStatus, { label: string; classes: string }> = {
  PENDING: {
    label: 'Pendente',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Concluído',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelado',
    classes: 'bg-red-50 text-red-700 border-red-200',
  },
};

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.label}
    </span>
  );
};
