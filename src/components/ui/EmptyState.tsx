import React from 'react';
import type { IconType } from 'react-icons';

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-secondary border border-border-light mb-4">
        <Icon className="w-7 h-7 text-text-light" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};
