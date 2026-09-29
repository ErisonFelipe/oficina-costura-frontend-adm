/**
 * Formata um número de telefone brasileiro para o formato do WhatsApp.
 * Ex: "(11) 99999-9999" → "5511999999999"
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove tudo que não é dígito
  let digits = phone.replace(/\D/g, '');

  // Se já tem o código do país (55), usa direto
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }

  // Adiciona o código do Brasil
  return `55${digits}`;
}

/**
 * Abre o WhatsApp com uma mensagem pré-preenchida.
 * No desktop, abre o WhatsApp Web.
 * No celular, abre o app.
 */
export function openWhatsApp(phone: string, message: string): void {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}

interface RomaneioForWhatsApp {
  numero: string;
  cliente: string;
  produto: string;
  data: string;
  quantidadePecas: number;
  cobranca: {
    valorTotal: number;
  };
}

/**
 * Monta a mensagem padrão do romaneio para o WhatsApp.
 */
export function buildRomaneioMessage(romaneio: RomaneioForWhatsApp): string {
  const dataFormatada = romaneio.data.split('-').reverse().join('/');
  const valorFormatado = romaneio.cobranca.valorTotal
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return `Olá, ${romaneio.cliente}! 👋

Segue o romaneio *#${romaneio.numero}* da Lunnexx.

📅 Data: ${dataFormatada}
📦 Produto: ${romaneio.produto}
🔢 Quantidade: ${romaneio.quantidadePecas.toLocaleString('pt-BR')} peças
💰 Valor total: ${valorFormatado}

📎 O PDF em anexo contém todos os detalhes do romaneio.

Qualquer dúvida, é só chamar!`;
}
