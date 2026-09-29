import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiScissors,
  FiCheck,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { api, ApiException } from '../lib/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Se já está autenticado, redireciona
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validações em tempo real (para feedback visual)
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const allChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password && password === confirmPassword;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Nome é obrigatório (mínimo 2 caracteres)';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!allChecksPassed) {
      newErrors.password = 'A senha não atende todos os requisitos';
    }

    if (!passwordsMatch) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await api.auth.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success('Cadastro realizado! Faça login para continuar.', {
        duration: 5000,
      });

      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          toast.error('Este e-mail já está cadastrado');
          setErrors({ email: 'E-mail já cadastrado' });
        } else if (err.details) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(err.details).forEach(([field, messages]) => {
            fieldErrors[field] = messages[0];
          });
          setErrors(fieldErrors);
          toast.error('Verifique os campos do formulário');
        } else {
          toast.error(err.message || 'Erro ao criar conta');
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
      {/* ===== LADO ESQUERDO — VISUAL ===== */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#FDF8F5] via-[#F5EDE6] to-[#E8D5CB] items-center justify-center p-12"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
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
        </svg>

        <div className="relative z-10 max-w-md text-center">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-dashed border-accent/40 mb-8 shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FiScissors className="w-9 h-9 text-accent" />
          </motion.div>

          <h1 className="font-serif text-4xl font-semibold text-text-primary mb-4 leading-tight">
            Criar sua conta
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-12 h-px bg-accent" />
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="w-12 h-px bg-accent" />
          </div>

          <p className="text-text-secondary leading-relaxed">
            Acesse o painel administrativo da Lunnexx. Sua conta será criada com
            permissão de visualização — um administrador pode liberar mais
            acessos depois.
          </p>
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
              <strong className="font-serif text-lg font-semibold">
                Linha &amp; Ponto
              </strong>
              <span className="text-xs tracking-widest uppercase text-text-light">
                Painel Admin
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold text-text-primary mb-2">
              Criar conta
            </h2>
            <p className="text-sm text-text-secondary">
              Preencha seus dados para começar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="label">
                Nome completo
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined as any }));
                  }}
                  placeholder="Seu nome"
                  autoFocus
                  disabled={isSubmitting}
                  className={`input pl-11 ${errors.name ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined as any }));
                  }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`input pl-11 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined as any }));
                  }}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={`input pl-11 pr-11 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-accent"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>

              {/* Checklist visual */}
              {password && (
                <div className="mt-2 p-3 rounded-lg bg-bg-secondary border border-border-light space-y-1.5">
                  <CheckItem checked={passwordChecks.minLength} label="Pelo menos 8 caracteres" />
                  <CheckItem checked={passwordChecks.hasUpper} label="1 letra maiúscula" />
                  <CheckItem checked={passwordChecks.hasLower} label="1 letra minúscula" />
                  <CheckItem checked={passwordChecks.hasNumber} label="1 número" />
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: undefined as any }));
                  }}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={`input pl-11 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-500">
                  As senhas não coincidem
                </p>
              )}
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3 text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link para login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">Já tem uma conta? </span>
            <Link
              to="/login"
              className="text-accent hover:underline font-semibold"
            >
              Entrar
            </Link>
          </div>

          {/* Rodapé */}
          <p className="mt-8 text-center text-xs text-text-light">
            © {new Date().getFullYear()} Lunnexx — Todos os direitos reservados
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ===== COMPONENTE AUXILIAR =====
const CheckItem: React.FC<{ checked: boolean; label: string }> = ({
  checked,
  label,
}) => (
  <div className="flex items-center gap-2 text-xs">
    <span
      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
        checked ? 'bg-emerald-500 text-white' : 'bg-border-light text-transparent'
      }`}
    >
      <FiCheck className="w-2.5 h-2.5" strokeWidth={3} />
    </span>
    <span className={checked ? 'text-emerald-700' : 'text-text-secondary'}>
      {label}
    </span>
  </div>
);
