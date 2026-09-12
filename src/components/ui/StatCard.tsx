import React from 'react';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: 'accent' | 'amber' | 'blue' | 'emerald' | 'red';
  delay?: number;
}

const colorMap = {
  accent: {
    bg: 'bg-accent-bg',
    text: 'text-accent',
    border: 'border-accent-light',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
}) => {
  const colors = colorMap[color];

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>

      <div className="text-3xl font-serif font-semibold text-text-primary mb-1">
        {value}
      </div>
      <div className="text-sm text-text-secondary">{title}</div>
    </motion.div>
  );
};
