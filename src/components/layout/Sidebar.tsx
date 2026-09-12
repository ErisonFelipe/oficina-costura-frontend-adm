import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiGrid,
  FiClipboard,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiScissors,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: ('ADMIN' | 'MANAGER' | 'VIEWER')[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/quotes', label: 'Orçamentos', icon: <FiClipboard /> },
  { to: '/users', label: 'Usuários', icon: <FiUsers />, roles: ['ADMIN'] },
  { to: '/settings', label: 'Configurações', icon: <FiSettings />, roles: ['ADMIN'] },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Você saiu da sua conta');
    navigate('/login', { replace: true });
  };

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <aside className="h-full w-64 bg-white border-r border-border-light flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-bg border-2 border-accent-light flex items-center justify-center flex-shrink-0">
            <FiScissors className="w-5 h-5 text-accent" />
          </div>
          <div className="flex flex-col leading-tight">
            <strong className="font-serif text-base font-semibold text-text-primary">
              Linha &amp; Ponto
            </strong>
            <span className="text-[10px] tracking-widest uppercase text-text-light">
              Painel Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-border-light space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-accent-bg border border-accent-light flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">
                {user.name}
              </div>
              <div className="text-xs text-text-light truncate">{user.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="text-lg" />
          Sair
        </button>
      </div>
    </aside>
  );
};
