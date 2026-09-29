/**
 * Tabelas de preços por tipo de serviço.
 * Cada tabela tem faixas (min, max) e o valor por peça.
 * max = null significa "sem limite superior".
 */

export interface PriceRange {
  min: number;
  max: number | null;
  unitPrice: number;
}

export interface PriceTable {
  id: string;
  label: string;
  ranges: PriceRange[];
}

// ===== LUNNEXX — CORTE =====
export const LUNNEXX_CORTE_TABLE: PriceTable = {
  id: 'lunnexx-corte',
  label: 'Lunnexx — Corte',
  ranges: [
    { min: 1, max: 10, unitPrice: 10.0 },
    { min: 11, max: 50, unitPrice: 5.0 },
    { min: 51, max: 100, unitPrice: 2.5 },
    { min: 101, max: 200, unitPrice: 2.0 },
    { min: 201, max: 300, unitPrice: 1.5 },
    { min: 301, max: 400, unitPrice: 1.0 },
    { min: 401, max: 500, unitPrice: 0.7 },
    { min: 501, max: 1000, unitPrice: 0.6 },
    { min: 1001, max: null, unitPrice: 0.5 },
  ],
};

// Tabela padrão (hoje só temos Lunnexx)
export const DEFAULT_PRICE_TABLE = LUNNEXX_CORTE_TABLE;

/**
 * Retorna o valor unitário para uma dada quantidade,
 * com base na tabela de preços.
 */
export function getUnitPrice(
  quantidade: number,
  table: PriceTable = DEFAULT_PRICE_TABLE
): number {
  if (quantidade < 1) return 0;

  for (const range of table.ranges) {
    const dentroDoMin = quantidade >= range.min;
    const dentroDoMax = range.max === null || quantidade <= range.max;

    if (dentroDoMin && dentroDoMax) {
      return range.unitPrice;
    }
  }

  // Fallback (nunca deve acontecer se a tabela estiver bem formada)
  return table.ranges[table.ranges.length - 1].unitPrice;
}

/**
 * Retorna o valor total para uma quantidade × tabela.
 */
export function getTotalPrice(
  quantidade: number,
  table: PriceTable = DEFAULT_PRICE_TABLE
): number {
  const unit = getUnitPrice(quantidade, table);
  return Math.round(quantidade * unit * 100) / 100; // arredonda pra 2 casas
}

/**
 * Retorna a faixa aplicada (para exibir ao usuário).
 */
export function getPriceRange(
  quantidade: number,
  table: PriceTable = DEFAULT_PRICE_TABLE
): PriceRange | null {
  if (quantidade < 1) return null;

  for (const range of table.ranges) {
    const dentroDoMin = quantidade >= range.min;
    const dentroDoMax = range.max === null || quantidade <= range.max;

    if (dentroDoMin && dentroDoMax) {
      return range;
    }
  }

  return null;
}

/**
 * Formata valor em Real (R$ 1.234,56).
 */
export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Retorna um resumo textual da faixa aplicada.
 * Ex: "501 a 1.000 peças → R$ 0,60 / peça"
 */
export function getRangeLabel(range: PriceRange | null): string {
  if (!range) return '—';

  const formatNumber = (n: number) =>
    n.toLocaleString('pt-BR');

  if (range.max === null) {
    return `Acima de ${formatNumber(range.min - 1)} peças → ${formatBRL(range.unitPrice)} / peça`;
  }

  if (range.min === range.max) {
    return `${range.min} ${range.min === 1 ? 'peça' : 'peças'} → ${formatBRL(range.unitPrice)} / peça`;
  }

  return `${formatNumber(range.min)} a ${formatNumber(range.max)} peças → ${formatBRL(range.unitPrice)} / peça`;
}
