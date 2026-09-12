import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiScissors } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { ApiException } from '../lib/api';

interface LocationState {
  from?: { pathname: string };
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Se já está autenticado, redireciona para o dashboard
  if (isAuthenticated) {
    const from = (location.state as LocationState)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Informe seu e-mail';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Informe sua senha';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });

      toast.success('Login realizado com sucesso!');

      const from = (location.state as LocationState)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 401) {
          toast.error('E-mail ou senha inválidos');
          setErrors({ password: 'Credenciais inválidas' });
        } else {
          toast.error(err.message || 'Erro ao fazer login');
        }
      } else {
        toast.error('Erro de conexão. Verifique o servidor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* ===== LADO ESQUERDO — VISUAL (desktop) ===== */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#FDF8F5] via-[#F5EDE6] to-[#E8D5CB] items-center justify-center p-12"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Linhas costuradas decorativas */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
          viewBox="0 0 600 800"
          fill="none"
        >
          <path
            d="M0 200 Q150 100 300 200 T600 200"
            stroke="#C67B5C"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            fill="none"
          />
          <path
            d="M0 500 Q150 400 300 500 T600 500"
            stroke="#C67B5C"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            fill="none"
            opacity="0.6"
          />
          <circle cx="100" cy="350" r="4" fill="#C67B5C" opacity="0.4" />
          <circle cx="500" cy="650" r="4" fill="#C67B5C" opacity="0.4" />
        </svg>

        <div className="relative z-10 max-w-md text-center">
          {/* Ícone principal */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-dashed border-accent/40 mb-8 shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FiScissors className="w-9 h-9 text-accent" />
          </motion.div>

          <h1 className="font-serif text-4xl font-semibold text-text-primary mb-4 leading-tight">
            Painel Administrativo
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-12 h-px bg-accent" />
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="w-12 h-px bg-accent" />
          </div>

          <p className="text-text-secondary leading-relaxed">
            Gerencie orçamentos, acompanhe solicitações e cuide da sua oficina
            com a mesma atenção que você dedica a cada ponto.
          </p>

          <div className="mt-10 text-xs uppercase tracking-widest text-text-light font-semibold">
            Linha & Ponto — Oficina de Costura
          </div>
        </div>
      </motion.div>

      {/* ===== LADO DIREITO — FORMULÁRIO ===== */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-full bg-accent-bg border-2 border-accent-light flex items-center justify-center">
              <FiScissors className="w-5 h-5 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <strong className="font-serif text-lg font-semibold">Linha &amp; Ponto</strong>
              <span className="text-xs tracking-widest uppercase text-text-light">
                Painel Admin
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold text-text-primary mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-text-secondary">
              Faça login para acessar o painel administrativo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo E-mail */}
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                  className={`input pl-11 ${
                    errors.email ? 'border-red-400 focus:border-red-500' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`input pl-11 pr-11 ${
                    errors.password ? 'border-red-400 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-accent transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Botão de envio */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3 text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no painel
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Credenciais de desenvolvimento */}
          <div className="mt-8 p-4 rounded-lg bg-accent-bg/50 border border-accent-light/50">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
              Credenciais de desenvolvimento
            </p>
            <p className="text-xs text-text-secondary font-mono">
              admin@oficina.local / admin123
            </p>
          </div>

          {/* Rodapé */}
          <p className="mt-8 text-center text-xs text-text-light">
            © {new Date().getFullYear()} Linha &amp; Ponto — Todos os direitos reservados
          </p>
        </motion.div>
      </div>
    </div>
  );
};
