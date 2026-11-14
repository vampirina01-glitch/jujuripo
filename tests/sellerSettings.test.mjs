import test from 'node:test';
import assert from 'node:assert/strict';
import baseConfig from '../src/config.js';
import {
  applySellerSettings,
  configToSellerSettings,
  defaultSellerSettings,
  loadSellerSettings,
  saveSellerSettings,
  clearSellerSettings,
  sanitizeSellerSettings,
  serializeSellerSettings,
  validateSellerSettings,
  SELLER_SETTINGS_KEY,
} from '../src/lib/sellerSettings.js';
import { isCheckoutReady } from '../src/lib/order.js';

function mockStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

test('sanitizeSellerSettings nettoie les numéros et ignore les champs inconnus', () => {
  const settings = sanitizeSellerSettings({
    whatsappNumber: '+242 06 000 00 00',
    mtnNumber: '242-05-000-00-00',
    sellerName: '  Madgic  ',
    hacker: 'nope',
  });
  assert.equal(settings.whatsappNumber, '242060000000');
  assert.equal(settings.mtnNumber, '242050000000');
  assert.equal(settings.sellerName, 'Madgic');
  assert.equal('hacker' in settings, false);
});

test('validateSellerSettings bloque les numéros trop courts et active le checkout quand tout est prêt', () => {
  const bad = validateSellerSettings({ whatsappNumber: '123', mtnNumber: '456' });
  assert.ok(bad.errors.whatsappNumber);
  assert.ok(bad.errors.mtnNumber);
  assert.equal(bad.checkoutReady, false);

  const good = validateSellerSettings({
    whatsappNumber: '242060000000',
    mtnNumber: '242050000000',
    mtnAccountName: 'Compte Test',
  });
  assert.equal(Object.keys(good.errors).length, 0);
  assert.equal(good.checkoutReady, true);
});

test('applySellerSettings ne modifie pas la config de base et active le checkout', () => {
  const settings = {
    whatsappNumber: '242060000000',
    mtnNumber: '242050000000',
    mtnAccountName: 'Compte Test',
    sellerName: 'Madgic Test',
  };
  const config = applySellerSettings(baseConfig, settings);
  assert.equal(isCheckoutReady(config), true);
  assert.equal(config.payments.mtn.accountName, 'Compte Test');
  assert.equal(config.legal.sellerName, 'Madgic Test');
  assert.equal(baseConfig.whatsapp.number, '');
  assert.equal(baseConfig.payments.mtn.number, '');
});

test('configToSellerSettings extrait les valeurs utiles sans produit/prix', () => {
  const config = applySellerSettings(baseConfig, { whatsappNumber: '242060000000', airtelNumber: '242040000000' });
  const settings = configToSellerSettings(config);
  assert.equal(settings.whatsappNumber, '242060000000');
  assert.equal(settings.airtelNumber, '242040000000');
  assert.equal('product' in settings, false);
});

test('le stockage local est optionnel et récupérable', () => {
  const storage = mockStorage();
  assert.deepEqual(loadSellerSettings(storage), defaultSellerSettings);
  assert.equal(saveSellerSettings({ whatsappNumber: '+242 06 000 00 00' }, storage), true);
  assert.equal(loadSellerSettings(storage).whatsappNumber, '242060000000');
  assert.ok(storage.getItem(SELLER_SETTINGS_KEY));
  assert.equal(clearSellerSettings(storage), true);
  assert.deepEqual(loadSellerSettings(storage), defaultSellerSettings);
});

test('les numéros de démonstration ne sont jamais une configuration de vente réelle', () => {
  const validation = validateSellerSettings({
    whatsappNumber: '000000000000',
    mtnNumber: '000000000000',
    mtnAccountName: 'Compte démo',
  });
  assert.equal(validation.demoMode, true);
  assert.equal(validation.checkoutReady, false);
  const config = applySellerSettings(baseConfig, validation.settings);
  assert.equal(isCheckoutReady(config), false);
});

test('serializeSellerSettings produit un JSON exportable', () => {
  const json = serializeSellerSettings({ whatsappNumber: '242060000000', email: 'test@example.com' });
  const parsed = JSON.parse(json);
  assert.equal(parsed.whatsappNumber, '242060000000');
  assert.equal(parsed.email, 'test@example.com');
  assert.equal(parsed.mtnNumber, '');
});
