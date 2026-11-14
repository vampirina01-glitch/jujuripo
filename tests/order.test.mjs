import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  createOrderReference,
  digitsOnly,
  isPaymentConfigured,
  isCheckoutReady,
  buildWhatsAppUrl,
  buildShareLinks,
  isDemoNumber,
  hasDemoNumbers,
} from '../src/lib/order.js';

const baseConfig = {
  name: 'Madgic',
  product: { name: 'Le Guide de l’IA gratuite', price: 3000, currency: 'XOF', priceLabel: '3 000 FCFA' },
  payments: {
    mtn: { enabled: true, label: 'MTN MoMo', number: '', accountName: '' },
    airtel: { enabled: true, label: 'Airtel Money', number: '', accountName: '' },
  },
  whatsapp: { number: '', display: '' },
};

test('formatPrice affiche les francs CFA en français', () => {
  assert.equal(formatPrice(3000), '3 000 FCFA');
});

test('createOrderReference est stable et préfixée', () => {
  const ref = createOrderReference(new Date('2026-11-14T12:00:00Z'), () => 0.123456789);
  assert.match(ref, /^MDG-20261114-[A-Z0-9]{5}$/);
});

test('digitsOnly nettoie un numéro', () => {
  assert.equal(digitsOnly('+242 06 000 00 00'), '242060000000');
});

test('le checkout reste bloqué tant que les numéros sont vides', () => {
  assert.equal(isCheckoutReady(baseConfig), false);
  assert.equal(buildWhatsAppUrl(baseConfig, 'mtn', 'MDG-TEST'), null);
});

test('le checkout exige au moins un moyen de paiement configuré', () => {
  const config = structuredClone(baseConfig);
  config.whatsapp.number = '242060000000';
  assert.equal(isCheckoutReady(config), false);
  config.payments.mtn.number = '242050000000';
  assert.equal(isPaymentConfigured(config.payments.mtn), true);
  assert.equal(isCheckoutReady(config), true);
});

test('buildWhatsAppUrl encode le message et refuse un opérateur non configuré', () => {
  const config = structuredClone(baseConfig);
  config.whatsapp.number = '242060000000';
  config.payments.mtn.number = '242050000000';
  const url = buildWhatsAppUrl(config, 'mtn', 'MDG-20261114-ABCDE');
  assert.ok(url.startsWith('https://wa.me/242060000000?text='));
  assert.ok(decodeURIComponent(url).includes('MTN MoMo'));
  assert.equal(buildWhatsAppUrl(config, 'airtel', 'MDG-20261114-ABCDE'), null);
});

test('les numéros de démonstration sont reconnus et bloquent la commande', () => {
  assert.equal(isDemoNumber('000000000000'), true);
  assert.equal(isDemoNumber('+242 06 000 00 00'), false);
  const config = structuredClone(baseConfig);
  config.whatsapp.number = '242060000000';
  config.payments.mtn.number = '000000000000';
  config.payments.airtel.number = '242040000000';
  assert.equal(hasDemoNumbers(config), true);
  assert.equal(isCheckoutReady(config), false);
  assert.equal(buildWhatsAppUrl(config, 'airtel', 'MDG-TEST'), null);
});

test('buildShareLinks produit un lien WhatsApp et Facebook', () => {
  const links = buildShareLinks('https://madgic.example', 'Découvre Madgic');
  assert.ok(links.whatsapp.includes('wa.me/?text='));
  assert.ok(links.facebook.includes('facebook.com/sharer/sharer.php'));
  assert.equal(links.copyText, 'Découvre Madgic https://madgic.example');
});
