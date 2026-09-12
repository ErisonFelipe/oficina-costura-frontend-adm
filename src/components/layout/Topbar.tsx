import React from 'react';
import { FiMenu, FiBell, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Esquerda: menu mobile + saudação */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-bg-secondary transition-colors"
          aria-label="Abrir menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-text-primary">
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </div>
          <div className="text-xs text-text-light">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>
      </div>

      {/* Direita: notificações + user */}
      <div className="flex items-center gap-2">
        {/* Notificações */}
        <button
          className="relative p-2.5 rounded-lg hover:bg-bg-secondary transition-colors"
          aria-label="Notificações"
        >
          <FiBell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
        </button>

        {/* User dropdown (simplificado) */}
        <div className="hidden sm:flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-text-primary">{user?.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-text-light">
              {user?.role}
            </span>
          </div>
          <FiChevronDown className="w-4 h-4 text-text-light" />
        </div>
      </div>
    </header>
  );
};
