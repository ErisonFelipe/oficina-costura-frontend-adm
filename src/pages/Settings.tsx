import React from 'react';
import { FiSettings, FiTool } from 'react-icons/fi';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-text-primary mb-2">
          Configurações
        </h1>
        <p className="text-sm text-text-secondary">
          Ajustes gerais do painel e da oficina.
        </p>
      </div>

      <div className="card p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-bg border border-accent-light mb-4">
          <FiTool className="w-7 h-7 text-accent" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-text-primary mb-2">
          Em desenvolvimento
        </h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Esta seção estará disponível em breve com opções para personalizar
          horários de atendimento, dados de contato, integrações e muito mais.
        </p>
      </div>
    </div>
  );
};
