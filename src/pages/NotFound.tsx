import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiScissors } from 'react-icons/fi';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-bg border-2 border-dashed border-accent/40 mb-6">
          <FiScissors className="w-9 h-9 text-accent" />
        </div>
        <h1 className="font-serif text-6xl font-bold text-text-primary mb-2">404</h1>
        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-3">
          Página não encontrada
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          A linha se perdeu em algum ponto... Esta página não existe ou foi movida.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <FiArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
};
