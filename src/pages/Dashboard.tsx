import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiLoader,
  FiCheckCircle,
  FiArrowRight,
  FiClipboard,
} from 'react-icons/fi';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../lib/api';
import type { Quote, QuoteStats } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [statsRes, quotesRes] = await Promise.all([
          api.quotes.stats(),
          api.quotes.list({ limit: 5, page: 1 }),
        ]);

        if (!mounted) return;
        setStats(statsRes.data);
        setRecentQuotes(quotesRes.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-light">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary">
          Visão geral dos orçamentos e solicitações da sua oficina.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total de orçamentos"
          value={stats?.total ?? 0}
          icon={FiClipboard}
          color="accent"
          delay={0}
        />
        <StatCard
          title="Pendentes"
          value={stats?.pending ?? 0}
          icon={FiClock}
          color="amber"
          delay={0.1}
        />
        <StatCard
          title="Em andamento"
          value={stats?.inProgress ?? 0}
          icon={FiLoader}
          color="blue"
          delay={0.2}
        />
        <StatCard
          title="Concluídos"
          value={stats?.completed ?? 0}
          icon={FiCheckCircle}
          color="emerald"
          delay={0.3}
        />
      </div>

      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div>
            <h2 className="font-serif text-lg font-semibold text-text-primary">
              Últimos orçamentos
            </h2>
            <p className="text-xs text-text-secondary">
              As 5 solicitações mais recentes
            </p>
          </div>
          <Link to="/quotes" className="btn btn-ghost text-sm">
            Ver todos
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <EmptyState
            icon={FiClipboard}
            title="Nenhum orçamento ainda"
            description="Quando alguém solicitar um orçamento pelo site, aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-border-light">
            {recentQuotes.map((quote) => (
              <Link
                key={quote.id}
                to={`/quotes/${quote.id}`}
                className="block p-4 lg:p-5 hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-sm text-text-primary truncate">
                        {quote.name}
                      </span>
                      <Badge status={quote.status} />
                    </div>
                    <p className="text-xs text-text-secondary truncate mb-1">
                      {quote.email}
                    </p>
                    <p className="text-xs text-text-light line-clamp-1">
                      {quote.message}
                    </p>
                  </div>
                  <div className="text-xs text-text-light whitespace-nowrap flex-shrink-0">
                    {formatDistanceToNow(new Date(quote.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
