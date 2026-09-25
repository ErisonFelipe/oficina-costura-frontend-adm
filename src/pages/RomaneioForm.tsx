import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiDollarSign,
  FiPackage,
  FiUser,
  FiFileText,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { GradeItem } from '../types';

interface FormData {
  cliente: string;
  data: string;
  produto: string;
  referencia: string;
  tipoTecido: string;
  quantidadeRolos: string;
  quantidadeFolhas: string;
  quantidadeEncaixados: string;
  quantidadePecas: string;
  quantidadeVolumes: string;
  cortadorResponsavel: string;
  conferidoPor: string;
  observacoes: string;
}

const initialFormData: FormData = {
  cliente: '',
  data: new Date().toISOString().split('T')[0], // hoje, formato YYYY-MM-DD
  produto: '',
  referencia: '',
  tipoTecido: '',
  quantidadeRolos: '',
  quantidadeFolhas: '',
  quantidadeEncaixados: '',
  quantidadePecas: '',
  quantidadeVolumes: '',
  cortadorResponsavel: '',
  conferidoPor: '',
  observacoes: '',
};

export const RomaneioForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialFormData);
  const [grade, setGrade] = useState<GradeItem[]>([
    { cor: '', tamanho: '', quantidade: 0 },
  ]);
  const [valorUnitario, setValorUnitario] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [cobrancaObservacao, setCobrancaObservacao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ===== HANDLERS DO FORM =====
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ===== HANDLERS DA GRADE =====
  const addGradeItem = () => {
    setGrade((prev) => [...prev, { cor: '', tamanho: '', quantidade: 0 }]);
  };

  const removeGradeItem = (index: number) => {
    if (grade.length === 1) {
      toast.error('Adicione pelo menos uma linha na grade');
      return;
    }
    setGrade((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGradeItem = (
    index: number,
    field: keyof GradeItem,
    value: string | number
  ) => {
    setGrade((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'quantidade') {
          return { ...item, quantidade: Number(value) || 0 };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // Total de peças da grade (somatório)
  const totalGrade = grade.reduce((acc, item) => acc + (item.quantidade || 0), 0);

  // Sincronizar "quantidadePecas" com o total da grade (opcional)
  const handleSyncPecasWithGrade = () => {
    setForm((prev) => ({ ...prev, quantidadePecas: String(totalGrade) }));
  };

  // ===== VALIDAÇÃO =====
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.cliente.trim()) newErrors.cliente = 'Cliente é obrigatório';
    if (!form.data) newErrors.data = 'Data é obrigatória';
    if (!form.produto.trim()) newErrors.produto = 'Produto é obrigatório';
    if (!form.quantidadePecas || Number(form.quantidadePecas) < 1) {
      newErrors.quantidadePecas = 'Quantidade de peças é obrigatória';
    }

    const gradeValida = grade.every(
      (item) => item.cor.trim() && item.quantidade >= 0
    );
    if (!gradeValida) {
      newErrors.grade = 'Preencha todas as cores da grade';
    }
    if (grade.length === 0) {
      newErrors.grade = 'Adicione pelo menos uma linha na grade';
    }

    if (!valorUnitario || Number(valorUnitario) < 0) {
      newErrors.valorUnitario = 'Valor unitário é obrigatório';
    }
    if (!valorTotal || Number(valorTotal) < 0) {
      newErrors.valorTotal = 'Valor total é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cliente: form.cliente.trim(),
        data: form.data,
        produto: form.produto.trim(),
        referencia: form.referencia.trim() || undefined,
        tipoTecido: form.tipoTecido.trim() || undefined,
        quantidadeRolos: form.quantidadeRolos
          ? Number(form.quantidadeRolos)
          : undefined,
        quantidadeFolhas: form.quantidadeFolhas
          ? Number(form.quantidadeFolhas)
          : undefined,
        quantidadeEncaixados: form.quantidadeEncaixados
          ? Number(form.quantidadeEncaixados)
          : undefined,
        quantidadePecas: Number(form.quantidadePecas),
        quantidadeVolumes: form.quantidadeVolumes
          ? Number(form.quantidadeVolumes)
          : undefined,
        cortadorResponsavel: form.cortadorResponsavel.trim() || undefined,
        conferidoPor: form.conferidoPor.trim() || undefined,
        grade: grade.map((item) => ({
          cor: item.cor.trim(),
          tamanho: item.tamanho?.trim() || '',
          quantidade: Number(item.quantidade) || 0,
        })),
        cobranca: {
          valorUnitario: Number(valorUnitario),
          valorTotal: Number(valorTotal),
          observacao: cobrancaObservacao.trim() || undefined,
        },
        observacoes: form.observacoes.trim() || undefined,
      };

      const response = await api.romaneios.create(payload);
      toast.success(`Romaneio ${response.data.numero} criado com sucesso!`);
      navigate(`/romaneios/${response.data.id}`);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.details
          ? Object.values(err.details).flat().join(', ')
          : err?.message || 'Erro ao criar romaneio';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/romaneios')}
          className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
          aria-label="Voltar"
        >
          <FiArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-text-primary">
            Novo Romaneio
          </h1>
          <p className="text-sm text-text-secondary">
            Preencha os dados do corte para gerar o romaneio.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== DADOS GERAIS ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiUser className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">Dados Gerais</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cliente *</label>
              <input
                type="text"
                name="cliente"
                value={form.cliente}
                onChange={handleChange}
                placeholder="Ex: Leo"
                disabled={isSubmitting}
                className={`input ${errors.cliente ? 'border-red-400' : ''}`}
              />
              {errors.cliente && (
                <p className="mt-1 text-xs text-red-500">{errors.cliente}</p>
              )}
            </div>
            <div>
              <label className="label">Data *</label>
              <input
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`input ${errors.data ? 'border-red-400' : ''}`}
              />
              {errors.data && (
                <p className="mt-1 text-xs text-red-500">{errors.data}</p>
              )}
            </div>
            <div>
              <label className="label">Produto *</label>
              <input
                type="text"
                name="produto"
                value={form.produto}
                onChange={handleChange}
                placeholder="Ex: Cropped ombro a ombro"
                disabled={isSubmitting}
                className={`input ${errors.produto ? 'border-red-400' : ''}`}
              />
              {errors.produto && (
                <p className="mt-1 text-xs text-red-500">{errors.produto}</p>
              )}
            </div>
            <div>
              <label className="label">Referência</label>
              <input
                type="text"
                name="referencia"
                value={form.referencia}
                onChange={handleChange}
                placeholder="Ex: 7010"
                disabled={isSubmitting}
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Tipo de tecido</label>
              <input
                type="text"
                name="tipoTecido"
                value={form.tipoTecido}
                onChange={handleChange}
                placeholder="Ex: Malha PV"
                disabled={isSubmitting}
                className="input"
              />
            </div>
          </div>
        </motion.div>

        {/* ===== INFO DO CORTE ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiPackage className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">
              Informações do Corte
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="label">Rolos</label>
              <input
                type="number"
                name="quantidadeRolos"
                value={form.quantidadeRolos}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
                className="input"
              />
            </div>
            <div>
              <label className="label">Folhas</label>
              <input
                type="number"
                name="quantidadeFolhas"
                value={form.quantidadeFolhas}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
                className="input"
              />
            </div>
            <div>
              <label className="label">Encaixados</label>
              <input
                type="number"
                name="quantidadeEncaixados"
                value={form.quantidadeEncaixados}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
                className="input"
              />
            </div>
            <div>
              <label className="label">
                Peças *
                {totalGrade > 0 && form.quantidadePecas !== String(totalGrade) && (
                  <button
                    type="button"
                    onClick={handleSyncPecasWithGrade}
                    className="ml-2 text-accent hover:underline text-[10px] normal-case"
                  >
                    usar total da grade
                  </button>
                )}
              </label>
              <input
                type="number"
                name="quantidadePecas"
                value={form.quantidadePecas}
                onChange={handleChange}
                placeholder="0"
                min="1"
                disabled={isSubmitting}
                className={`input ${errors.quantidadePecas ? 'border-red-400' : ''}`}
              />
              {errors.quantidadePecas && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.quantidadePecas}
                </p>
              )}
            </div>
            <div>
              <label className="label">Volumes</label>
              <input
                type="number"
                name="quantidadeVolumes"
                value={form.quantidadeVolumes}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
                className="input"
              />
            </div>
          </div>
        </motion.div>

        {/* ===== GRADE ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-light">
            <div className="flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-accent" />
              <h2 className="font-serif text-lg font-semibold">
                Grade / Distribuição
              </h2>
            </div>
            <button
              type="button"
              onClick={addGradeItem}
              disabled={isSubmitting}
              className="btn btn-outline text-xs py-2 px-4"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Adicionar cor
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {grade.map((item, index) => (
                <motion.div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-end"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="col-span-5 sm:col-span-5">
                    {index === 0 && <label className="label">Cor *</label>}
                    <input
                      type="text"
                      value={item.cor}
                      onChange={(e) =>
                        updateGradeItem(index, 'cor', e.target.value)
                      }
                      placeholder="Ex: Marrom"
                      disabled={isSubmitting}
                      className="input"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3">
                    {index === 0 && <label className="label">Tamanho</label>}
                    <input
                      type="text"
                      value={item.tamanho || ''}
                      onChange={(e) =>
                        updateGradeItem(index, 'tamanho', e.target.value)
                      }
                      placeholder="Opcional"
                      disabled={isSubmitting}
                      className="input"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3">
                    {index === 0 && (
                      <label className="label">Quantidade *</label>
                    )}
                    <input
                      type="number"
                      value={item.quantidade || ''}
                      onChange={(e) =>
                        updateGradeItem(index, 'quantidade', e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      disabled={isSubmitting}
                      className="input"
                    />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && (
                      <label className="label opacity-0">Ações</label>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGradeItem(index)}
                      disabled={isSubmitting || grade.length === 1}
                      className="w-full p-2.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-30"
                      title="Remover"
                    >
                      <FiTrash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {errors.grade && (
            <p className="mt-2 text-xs text-red-500">{errors.grade}</p>
          )}

          {/* Total da grade */}
          <div className="mt-4 pt-4 border-t border-dashed border-border-medium flex items-center justify-between">
            <span className="text-sm font-semibold text-text-secondary">
              Total da grade
            </span>
            <span className="font-serif text-xl font-bold text-accent">
              {totalGrade.toLocaleString('pt-BR')} peças
            </span>
          </div>
        </motion.div>

        {/* ===== COBRANÇA ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiDollarSign className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">Cobrança</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Valor unitário (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
                placeholder="0.50"
                min="0"
                disabled={isSubmitting}
                className={`input ${errors.valorUnitario ? 'border-red-400' : ''}`}
              />
              {errors.valorUnitario && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.valorUnitario}
                </p>
              )}
            </div>
            <div>
              <label className="label">Valor total (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                placeholder="668.00"
                min="0"
                disabled={isSubmitting}
                className={`input ${errors.valorTotal ? 'border-red-400' : ''}`}
              />
              {errors.valorTotal && (
                <p className="mt-1 text-xs text-red-500">{errors.valorTotal}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observação da cobrança</label>
              <input
                type="text"
                value={cobrancaObservacao}
                onChange={(e) => setCobrancaObservacao(e.target.value)}
                placeholder="Opcional"
                disabled={isSubmitting}
                className="input"
              />
            </div>
          </div>
        </motion.div>

        {/* ===== CONFERÊNCIA ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiUser className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">Conferência</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cortador responsável</label>
              <input
                type="text"
                name="cortadorResponsavel"
                value={form.cortadorResponsavel}
                onChange={handleChange}
                placeholder="Ex: Leo"
                disabled={isSubmitting}
                className="input"
              />
            </div>
            <div>
              <label className="label">Conferido por</label>
              <input
                type="text"
                name="conferidoPor"
                value={form.conferidoPor}
                onChange={handleChange}
                placeholder="Ex: Ester"
                disabled={isSubmitting}
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={3}
                placeholder="Alguma observação adicional sobre este romaneio..."
                disabled={isSubmitting}
                className="input resize-y"
              />
            </div>
          </div>
        </motion.div>

        {/* ===== AÇÕES ===== */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <button
            type="button"
            onClick={() => navigate('/romaneios')}
            disabled={isSubmitting}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Criar Romaneio
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};
