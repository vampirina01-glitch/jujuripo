export function formatPrice(amount, currency = 'XOF') {
  const value = new Intl.NumberFormat('fr-FR').format(Number(amount) || 0).replace(/[\u202f\u00a0]/g, ' ');
  return currency === 'XOF' ? `${value} FCFA` : `${value} ${currency}`;
}

export function createOrderReference(date = new Date(), random = Math.random) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const suffix = random().toString(36).slice(2, 7).toUpperCase().padEnd(5, '0');
  return `MDG-${y}${m}${d}-${suffix}`;
}

export function digitsOnly(value = '') {
  return String(value).replace(/\D/g, '');
}

// The seller panel uses all-zero numbers for its local preview. They must never
// open a real WhatsApp conversation or be treated as a live payment destination.
export function isDemoNumber(value = '') {
  const digits = digitsOnly(value);
  return digits.length >= 8 && /^0+$/.test(digits);
}

export function getEnabledPayments(config) {
  return Object.entries(config?.payments || {})
    .filter(([, method]) => method?.enabled)
    .map(([key, method]) => ({ key, ...method }));
}

export function isPaymentConfigured(method) {
  return Boolean(method?.enabled && digitsOnly(method?.number).length >= 8);
}

export function hasDemoNumbers(config) {
  return isDemoNumber(config?.whatsapp?.number)
    || getEnabledPayments(config).some((method) => isDemoNumber(method.number));
}

export function isCheckoutReady(config) {
  const whatsapp = config?.whatsapp?.number;
  const whatsappReady = digitsOnly(whatsapp).length >= 8 && !isDemoNumber(whatsapp);
  const paymentReady = getEnabledPayments(config).some((method) => isPaymentConfigured(method) && !isDemoNumber(method.number));
  return whatsappReady && paymentReady && !hasDemoNumbers(config);
}

export function buildWhatsAppUrl(config, methodKey, reference) {
  if (!isCheckoutReady(config)) return null;
  const method = config?.payments?.[methodKey];
  if (!isPaymentConfigured(method) || isDemoNumber(method.number)) return null;

  const phone = digitsOnly(config.whatsapp.number);
  const lines = [
    `Bonjour ${config.name || 'Madgic'},`,
    `Je souhaite commander : ${config.product?.name || 'Le Guide de l’IA gratuite'}.`,
    `Montant : ${config.product?.priceLabel || formatPrice(config.product?.price, config.product?.currency)}.`,
    `Référence : ${reference}.`,
    `Paiement prévu : ${method.label}.`,
    'Je vous transmets ma preuve de paiement pour vérification, puis je recevrai les fichiers.',
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildShareLinks(url, text) {
  const safeUrl = url || '';
  const message = `${text} ${safeUrl}`.trim();
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
    facebook: safeUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(safeUrl)}` : null,
    copyText: message,
  };
}
