import React from 'react';
import { useParams } from 'react-router-dom';

export const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-4">Orçamento #{id}</h1>
      <p className="text-text-secondary">Detalhes serão construídos na próxima etapa.</p>
    </div>
  );
};
