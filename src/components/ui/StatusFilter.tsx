import React from 'react';
import type { QuoteStatus } from '../../types';

interface StatusFilterProps {
  value: QuoteStatus | undefined;
  onChange: (status: QuoteStatus | undefined) => void;
  counts?: Record<QuoteStatus | 'ALL', number>;
}

const options: { value: QuoteStatus | undefined; label: string; color: string }[] = [
  { value: undefined, label: 'Todos', color: 'bg-accent' },
  { value: 'PENDING', label: 'Pendentes', color: 'bg-amber-500' },
  { value: 'IN_PROGRESS', label: 'Em andamento', color: 'bg-blue-500' },
  { value: 'COMPLETED', label: 'Concluídos', color: 'bg-emerald-500' },
  { value: 'CANCELLED', label: 'Cancelados', color: 'bg-red-500' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  counts,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = value === option.value;
        const count = counts
          ? option.value
            ? counts[option.value]
            : counts.ALL
          : undefined;

        return (
          <button
            key={option.label}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isActive
                ? 'border-accent bg-accent text-white shadow-sm'
                : 'border-border-light bg-white text-text-secondary hover:border-accent-light hover:text-text-primary'
            }`}
          >
            {!isActive && (
              <span className={`w-1.5 h-1.5 rounded-full ${option.color}`} />
            )}
            {option.label}
            {count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isActive ? 'bg-white/20' : 'bg-bg-secondary'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
