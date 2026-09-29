import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiUserCheck, FiX } from 'react-icons/fi';
import { api } from '../../lib/api';
import type { ClientSearchResult } from '../../types';

interface ClientAutocompleteProps {
  value: string;
  clientId: string | null;
  onChange: (name: string, clientId: string | null) => void;
  disabled?: boolean;
  error?: boolean;
}

export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  value,
  clientId,
  onChange,
  disabled,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState(value);
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincroniza o termo quando o value externo muda
  useEffect(() => {
    setTerm(value);
  }, [value]);

  // Busca com debounce
  useEffect(() => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    // Se o cliente já está vinculado e o termo não mudou, não busca
    if (clientId && term === value) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.clients.search(term);
        setResults(response.data);
        setHighlightIndex(0);
      } catch (err) {
        console.error('Erro na busca de clientes:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [term, clientId, value]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: ClientSearchResult) => {
    setTerm(client.name);
    onChange(client.name, client.id);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setTerm('');
    onChange('', null);
    setResults([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setTerm(newTerm);
    // Se o usuário digitar algo diferente do cliente vinculado, desvincula
    if (clientId && newTerm !== value) {
      onChange(newTerm, null);
    } else {
      onChange(newTerm, clientId);
    }
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlightIndex]) {
        handleSelect(results[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
        <input
          type="text"
          value={term}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Digite para buscar um cliente cadastrado ou um novo nome..."
          disabled={disabled}
          className={`input pl-11 pr-24 ${
            error ? 'border-red-400' : ''
          }`}
        />

        {/* Indicador de vinculado */}
        {clientId && (
          <span className="absolute right-11 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <FiUserCheck className="w-3.5 h-3.5" />
            Cadastrado
          </span>
        )}

        {/* Botão limpar */}
        {term && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-secondary"
            aria-label="Limpar"
          >
            <FiX className="w-4 h-4 text-text-light" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border-light rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-xs text-text-light text-center">
              Buscando...
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((client, index) => (
                <li
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={`px-4 py-2.5 cursor-pointer transition-colors ${
                    index === highlightIndex
                      ? 'bg-accent-bg'
                      : 'hover:bg-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {formatPhone(client.phone)}
                        {client.email && ` · ${client.email}`}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Dica se não houver resultados */}
      {isOpen && !isLoading && term.length >= 2 && results.length === 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border-light rounded-lg shadow-lg px-4 py-3 text-xs text-text-light">
          Nenhum cliente encontrado. O nome "{term}" será salvo como texto livre.
        </div>
      )}
    </div>
  );
};
