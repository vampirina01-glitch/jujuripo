import { digitsOnly, isDemoNumber } from './order.js';

export const SELLER_SETTINGS_KEY = 'madgic.seller-settings.v1';
export const SELLER_SETTINGS_EVENT = 'madgic:seller-settings-updated';

export const defaultSellerSettings = {
  whatsappNumber: '',
  mtnNumber: '',
  mtnAccountName: '',
  airtelNumber: '',
  airtelAccountName: '',
  sellerName: '',
  email: '',
  siteUrl: '',
};

const PHONE_FIELDS = ['whatsappNumber', 'mtnNumber', 'airtelNumber'];
const TEXT_FIELDS = ['mtnAccountName', 'airtelAccountName', 'sellerName', 'email', 'siteUrl'];

export function sanitizeSellerSettings(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const settings = { ...defaultSellerSettings };
  for (const field of PHONE_FIELDS) {
    settings[field] = digitsOnly(source[field] ?? '');
  }
  for (const field of TEXT_FIELDS) {
    settings[field] = String(source[field] ?? '').trim();
  }
  return settings;
}

export function isValidPhone(value) {
  const digits = digitsOnly(value);
  return digits.length >= 8 && digits.length <= 15;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateSellerSettings(input) {
  const settings = sanitizeSellerSettings(input);
  const errors = {};
  const warnings = [];

  for (const field of PHONE_FIELDS) {
    if (settings[field] && !isValidPhone(settings[field])) {
      errors[field] = 'Numéro invalide : utilise 8 à 15 chiffres, indicatif pays inclus.';
    }
  }
  if (settings.email && !isValidEmail(settings.email)) {
    errors.email = 'Adresse email invalide.';
  }
  if (settings.siteUrl && !isValidHttpUrl(settings.siteUrl)) {
    errors.siteUrl = 'URL invalide : elle doit commencer par http:// ou https://.';
  }

  if (!settings.whatsappNumber) warnings.push('Ajoute un numéro WhatsApp pour recevoir les confirmations.');
  if (!settings.mtnNumber && !settings.airtelNumber) warnings.push('Ajoute au moins un numéro Mobile Money.');
  if (settings.mtnNumber && !settings.mtnAccountName) warnings.push('Ajoute le nom du compte MTN MoMo pour rassurer les clients.');
  if (settings.airtelNumber && !settings.airtelAccountName) warnings.push('Ajoute le nom du compte Airtel Money pour rassurer les clients.');

  const demoMode = PHONE_FIELDS.some((field) => isDemoNumber(settings[field]));
  const realPaymentReady = isValidPhone(settings.mtnNumber) || isValidPhone(settings.airtelNumber);
  const checkoutReady = !demoMode && isValidPhone(settings.whatsappNumber) && realPaymentReady && Object.keys(errors).length === 0;

  return { settings, errors, warnings, checkoutReady, demoMode };
}

export function formatPhoneDisplay(value) {
  const digits = digitsOnly(value);
  return digits ? `+${digits}` : '';
}

export function applySellerSettings(baseConfig, input) {
  const settings = sanitizeSellerSettings(input);
  const config = structuredClone(baseConfig);

  if (settings.whatsappNumber) {
    config.whatsapp.number = settings.whatsappNumber;
    config.whatsapp.display = formatPhoneDisplay(settings.whatsappNumber);
  }
  if (settings.mtnNumber) config.payments.mtn.number = settings.mtnNumber;
  if (settings.mtnAccountName) config.payments.mtn.accountName = settings.mtnAccountName;
  if (settings.airtelNumber) config.payments.airtel.number = settings.airtelNumber;
  if (settings.airtelAccountName) config.payments.airtel.accountName = settings.airtelAccountName;
  if (settings.sellerName) config.legal.sellerName = settings.sellerName;
  if (settings.email) config.legal.email = settings.email;
  if (settings.siteUrl) config.siteUrl = settings.siteUrl;

  return config;
}

export function configToSellerSettings(config) {
  return sanitizeSellerSettings({
    whatsappNumber: config?.whatsapp?.number,
    mtnNumber: config?.payments?.mtn?.number,
    mtnAccountName: config?.payments?.mtn?.accountName,
    airtelNumber: config?.payments?.airtel?.number,
    airtelAccountName: config?.payments?.airtel?.accountName,
    sellerName: config?.legal?.sellerName,
    email: config?.legal?.email,
    siteUrl: config?.siteUrl,
  });
}

function getStorage(storage) {
  if (storage) return storage;
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function loadSellerSettings(storage) {
  const target = getStorage(storage);
  if (!target) return { ...defaultSellerSettings };
  try {
    const raw = target.getItem(SELLER_SETTINGS_KEY);
    if (!raw) return { ...defaultSellerSettings };
    return sanitizeSellerSettings(JSON.parse(raw));
  } catch {
    return { ...defaultSellerSettings };
  }
}

export function saveSellerSettings(input, storage) {
  const target = getStorage(storage);
  if (!target) return false;
  try {
    target.setItem(SELLER_SETTINGS_KEY, JSON.stringify(sanitizeSellerSettings(input)));
    return true;
  } catch {
    return false;
  }
}

export function clearSellerSettings(storage) {
  const target = getStorage(storage);
  if (!target) return false;
  try {
    target.removeItem(SELLER_SETTINGS_KEY);
    return true;
  } catch {
    return false;
  }
}

export function serializeSellerSettings(input) {
  return JSON.stringify(sanitizeSellerSettings(input), null, 2) + '\n';
}
