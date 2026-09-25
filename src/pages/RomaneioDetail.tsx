import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiX,
  FiUser,
  FiPackage,
  FiFileText,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api, tokenStorage } from '../lib/api';
import type { Romaneio, GradeItem } from '../types';

export const RomaneioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [romaneio, setRomaneio] = useState<Romaneio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Estado do form de edição
  const [form, setForm] = useState<Record<string, any>>({});

  // ===== CARREGAR =====
  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setIsLoading(true);

    api.romaneios
      .show(id)
      .then((res) => {
        if (!mounted) return;
        setRomaneio(res.data);
        setForm({
          cliente: res.data.cliente,
          data: res.data.data.split('T')[0],
          produto: res.data.produto,
          referencia: res.data.referencia || '',
          tipoTecido: res.data.tipoTecido || '',
          quantidadeRolos: res.data.quantidadeRolos ?? '',
          quantidadeFolhas: res.data.quantidadeFolhas ?? '',
          quantidadeEncaixados: res.data.quantidadeEncaixados ?? '',
          quantidadePecas: res.data.quantidadePecas,
          quantidadeVolumes: res.data.quantidadeVolumes ?? '',
          cortadorResponsavel: res.data.cortadorResponsavel || '',
          conferidoPor: res.data.conferidoPor || '',
          observacoes: res.data.observacoes || '',
          grade: res.data.grade,
          valorUnitario: res.data.cobranca.valorUnitario,
          valorTotal: res.data.cobranca.valorTotal,
          cobrancaObservacao: res.data.cobranca.observacao || '',
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Erro ao carregar romaneio');
        navigate('/romaneios');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  // ===== AÇÕES =====
  const handleDownloadPdf = async () => {
    if (!romaneio) return;

    try {
      setIsDownloading(true);
      const token = tokenStorage.get();
      if (!token) {
        toast.error('Sessão expirada');
        return;
      }

      toast.loading('Gerando PDF...', { id: 'pdf' });

      const response = await fetch(
        `http://localhost:3334/api/admin/romaneios/${romaneio.id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Erro ao gerar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `romaneio-${romaneio.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF', { id: 'pdf' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!romaneio) return;
    if (
      !confirm(
        `Tem certeza que deseja deletar o romaneio ${romaneio.numero}? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      await api.romaneios.delete(romaneio.id);
      toast.success('Romaneio deletado');
      navigate('/romaneios');
    } catch {
      toast.error('Erro ao deletar romaneio');
    }
  };

  const handleSave = async () => {
    if (!romaneio) return;
    setIsSaving(true);

    try {
      const payload = {
        cliente: form.cliente,
        data: form.data,
        produto: form.produto,
        referencia: form.referencia || undefined,
        tipoTecido: form.tipoTecido || undefined,
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
        cortadorResponsavel: form.cortadorResponsavel || undefined,
        conferidoPor: form.conferidoPor || undefined,
        grade: form.grade.map((g: GradeItem) => ({
          cor: g.cor,
          tamanho: g.tamanho || '',
          quantidade: Number(g.quantidade) || 0,
        })),
        cobranca: {
          valorUnitario: Number(form.valorUnitario),
          valorTotal: Number(form.valorTotal),
          observacao: form.cobrancaObservacao || undefined,
        },
        observacoes: form.observacoes || undefined,
      };

      const response = await api.romaneios.update(romaneio.id, payload);
      setRomaneio(response.data);
      setIsEditing(false);
      toast.success('Romaneio atualizado!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao atualizar romaneio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!romaneio) return;
    setForm({
      cliente: romaneio.cliente,
      data: romaneio.data.split('T')[0],
      produto: romaneio.produto,
      referencia: romaneio.referencia || '',
      tipoTecido: romaneio.tipoTecido || '',
      quantidadeRolos: romaneio.quantidadeRolos ?? '',
      quantidadeFolhas: romaneio.quantidadeFolhas ?? '',
      quantidadeEncaixados: romaneio.quantidadeEncaixados ?? '',
      quantidadePecas: romaneio.quantidadePecas,
      quantidadeVolumes: romaneio.quantidadeVolumes ?? '',
      cortadorResponsavel: romaneio.cortadorResponsavel || '',
      conferidoPor: romaneio.conferidoPor || '',
      observacoes: romaneio.observacoes || '',
      grade: romaneio.grade,
      valorUnitario: romaneio.cobranca.valorUnitario,
      valorTotal: romaneio.cobranca.valorTotal,
      cobrancaObservacao: romaneio.cobranca.observacao || '',
    });
    setIsEditing(false);
  };

  // ===== HELPERS DE EDIÇÃO =====
  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateGradeItem = (
    index: number,
    field: keyof GradeItem,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      grade: prev.grade.map((g: GradeItem, i: number) =>
        i === index
          ? { ...g, [field]: field === 'quantidade' ? Number(value) || 0 : value }
          : g
      ),
    }));
  };

  const addGradeItem = () => {
    setForm((prev) => ({
      ...prev,
      grade: [...prev.grade, { cor: '', tamanho: '', quantidade: 0 }],
    }));
  };

  const removeGradeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      grade: prev.grade.filter((_: any, i: number) => i !== index),
    }));
  };

  const totalGrade = (form.grade || []).reduce(
    (acc: number, g: GradeItem) => acc + (Number(g.quantidade) || 0),
    0
  );

  // ===== RENDER =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-light">Carregando romaneio...</p>
        </div>
      </div>
    );
  }

  if (!romaneio) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/romaneios')}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            aria-label="Voltar"
          >
            <FiArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <div className="text-xs uppercase tracking-widest text-accent font-semibold">
              Romaneio
            </div>
            <h1 className="font-mono text-3xl font-bold text-text-primary">
              {romaneio.numero}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline text-sm"
              >
                <FiEdit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="btn btn-primary text-sm"
              >
                {isDownloading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiDownload className="w-4 h-4" />
                )}
                Baixar PDF
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-outline text-sm text-red-600 hover:bg-red-50"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="btn btn-outline text-sm"
              >
                <FiX className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary text-sm"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* ===== DADOS GERAIS ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiUser className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">Dados Gerais</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field
              label="Cliente"
              value={form.cliente}
              isEditing={isEditing}
              onChange={(v) => updateField('cliente', v)}
            />
            <Field
              label="Data"
              value={form.data}
              isEditing={isEditing}
              type="date"
              onChange={(v) => updateField('data', v)}
              display={format(new Date(romaneio.data), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            />
            <Field
              label="Produto"
              value={form.produto}
              isEditing={isEditing}
              onChange={(v) => updateField('produto', v)}
            />
            <Field
              label="Referência"
              value={form.referencia}
              isEditing={isEditing}
              onChange={(v) => updateField('referencia', v)}
              fallback="—"
            />
            <Field
              label="Tipo de tecido"
              value={form.tipoTecido}
              isEditing={isEditing}
              onChange={(v) => updateField('tipoTecido', v)}
              fallback="—"
            />
          </div>
        </motion.div>

        {/* ===== INFO DO CORTE ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiPackage className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">
              Informações do Corte
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Field
              label="Rolos"
              value={form.quantidadeRolos}
              isEditing={isEditing}
              type="number"
              onChange={(v) => updateField('quantidadeRolos', v)}
              fallback="—"
            />
            <Field
              label="Folhas"
              value={form.quantidadeFolhas}
              isEditing={isEditing}
              type="number"
              onChange={(v) => updateField('quantidadeFolhas', v)}
              fallback="—"
            />
            <Field
              label="Encaixados"
              value={form.quantidadeEncaixados}
              isEditing={isEditing}
              type="number"
              onChange={(v) => updateField('quantidadeEncaixados', v)}
              fallback="—"
            />
            <Field
              label="Peças"
              value={form.quantidadePecas}
              isEditing={isEditing}
              type="number"
              onChange={(v) => updateField('quantidadePecas', v)}
              highlight
            />
            <Field
              label="Volumes"
              value={form.quantidadeVolumes}
              isEditing={isEditing}
              type="number"
              onChange={(v) => updateField('quantidadeVolumes', v)}
              fallback="—"
            />
          </div>
        </motion.div>

        {/* ===== GRADE ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-light">
            <div className="flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-accent" />
              <h2 className="font-serif text-lg font-semibold">
                Grade / Distribuição
              </h2>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={addGradeItem}
                className="btn btn-outline text-xs py-2 px-4"
              >
                + Adicionar cor
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-text-light font-semibold">
                    Cor
                  </th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-text-light font-semibold">
                    Tamanho
                  </th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-text-light font-semibold">
                    Quantidade
                  </th>
                  {isEditing && <th className="w-12"></th>}
                </tr>
              </thead>
              <tbody>
                {(form.grade || []).map((item: GradeItem, i: number) => (
                  <tr key={i} className="border-b border-border-light last:border-0">
                    {isEditing ? (
                      <>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.cor}
                            onChange={(e) =>
                              updateGradeItem(i, 'cor', e.target.value)
                            }
                            className="input py-1.5 text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.tamanho || ''}
                            onChange={(e) =>
                              updateGradeItem(i, 'tamanho', e.target.value)
                            }
                            className="input py-1.5 text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.quantidade || ''}
                            onChange={(e) =>
                              updateGradeItem(i, 'quantidade', e.target.value)
                            }
                            className="input py-1.5 text-sm text-right"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeGradeItem(i)}
                            disabled={form.grade.length === 1}
                            className="p-1.5 rounded hover:bg-red-50 text-text-light hover:text-red-600 transition-colors disabled:opacity-30"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 font-medium text-text-primary">
                          {item.cor}
                        </td>
                        <td className="py-2 px-3 text-text-secondary">
                          {item.tamanho || '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-text-primary">
                          {item.quantidade.toLocaleString('pt-BR')}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                <tr className="bg-bg-secondary">
                  <td
                    colSpan={2}
                    className="py-2 px-3 font-bold text-text-primary"
                  >
                    Total
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-accent text-lg">
                    {totalGrade.toLocaleString('pt-BR')}
                  </td>
                  {isEditing && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ===== COBRANÇA ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiDollarSign className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">Cobrança</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field
              label="Valor unitário (R$)"
              value={form.valorUnitario}
              isEditing={isEditing}
              type="number"
              step="0.01"
              onChange={(v) => updateField('valorUnitario', v)}
              display={`R$ ${Number(romaneio.cobranca.valorUnitario).toFixed(2)}`}
            />
            <Field
              label="Valor total (R$)"
              value={form.valorTotal}
              isEditing={isEditing}
              type="number"
              step="0.01"
              onChange={(v) => updateField('valorTotal', v)}
              display={`R$ ${Number(romaneio.cobranca.valorTotal).toFixed(2)}`}
              highlight
            />
            <div className="sm:col-span-2">
              <Field
                label="Observação da cobrança"
                value={form.cobrancaObservacao}
                isEditing={isEditing}
                onChange={(v) => updateField('cobrancaObservacao', v)}
                fallback="—"
              />
            </div>
          </div>
        </motion.div>

        {/* ===== CONFERÊNCIA ===== */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
            <FiUser className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold">Conferência</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field
              label="Cortador responsável"
              value={form.cortadorResponsavel}
              isEditing={isEditing}
              onChange={(v) => updateField('cortadorResponsavel', v)}
              fallback="—"
            />
            <Field
              label="Conferido por"
              value={form.conferidoPor}
              isEditing={isEditing}
              onChange={(v) => updateField('conferidoPor', v)}
              fallback="—"
            />
            <div className="sm:col-span-2">
              <Field
                label="Observações"
                value={form.observacoes}
                isEditing={isEditing}
                multiline
                onChange={(v) => updateField('observacoes', v)}
                fallback="—"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ===== COMPONENTE AUXILIAR =====
interface FieldProps {
  label: string;
  value: any;
  isEditing: boolean;
  onChange?: (value: string) => void;
  type?: string;
  step?: string;
  multiline?: boolean;
  fallback?: string;
  highlight?: boolean;
  display?: string;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  step,
  multiline = false,
  fallback,
  highlight,
  display,
}) => {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-text-light font-semibold mb-1.5">
        {label}
      </div>
      {isEditing && onChange ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="input resize-y"
          />
        ) : (
          <input
            type={type}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input"
          />
        )
      ) : (
        <div
          className={`text-sm ${
            highlight
              ? 'font-serif text-2xl font-bold text-accent'
              : 'text-text-primary'
          }`}
        >
          {display ?? (value?.toString().trim() || fallback || value)}
        </div>
      )}
    </div>
  );
};
