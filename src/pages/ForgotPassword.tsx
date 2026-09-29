import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiScissors } from 'react-icons/fi';

export const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <motion.div
        className="w-full max-w-md card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-accent-bg border-2 border-dashed border-accent/40 flex items-center justify-center">
            <FiScissors className="w-7 h-7 text-accent" />
          </div>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-text-primary text-center mb-3">
          Esqueceu sua senha?
        </h1>

        <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
          Para redefinir sua senha, entre em contato com um administrador do
          sistema. Ele poderá gerar uma nova senha para você.
        </p>

        <div className="p-4 rounded-lg bg-bg-secondary border border-border-light space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <FiMail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-text-primary">
                E-mail do administrador
              </div>
              <div className="text-sm text-text-secondary">
                admin@oficina.local
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiPhone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-text-primary">
                WhatsApp
              </div>
              <div className="text-sm text-text-secondary">
                (11) 98765-4321
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="btn btn-outline w-full justify-center"
        >
          <FiArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>

        <p className="mt-6 text-center text-xs text-text-light">
          © {new Date().getFullYear()} Lunnexx — Todos os direitos reservados
        </p>
      </motion.div>
    </div>
  );
};
