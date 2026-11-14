import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../src/config.js';
import { buildWhatsAppUrl } from '../src/lib/order.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const allowedPublicHosts = new Set(['schema.org', 'www.w3.org']);
const urlRe = /https?:\/\/[^\s"'<>)]+/gi;

function files(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

function privateIdentity() {
  const path = join(root, 'private-products', 'redactions.txt');
  if (!existsSync(path)) return null;
  const terms = readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!terms.length) return null;
  return new RegExp(terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
}

test('la surface publique ne publie ni terme privé ni URL externe inattendue', () => {
  const identity = privateIdentity();
  const publicPaths = ['index.html', ...files('public')]
    .filter((path) => /\.(jsx?|css|html|json|svg|txt|webmanifest)$/.test(path));
  for (const path of publicPaths) {
    const text = readFileSync(join(root, path), 'utf8');
    if (identity) assert.doesNotMatch(text, identity, `Private term disclosed in ${path}`);
    for (const url of text.match(urlRe) || []) {
      assert.ok(allowedPublicHosts.has(new URL(url).hostname), `Unexpected external URL in ${path}: ${url}`);
    }
  }
  if (identity) {
    for (const path of files('src')) {
      assert.doesNotMatch(readFileSync(join(root, path), 'utf8'), identity, `Private term disclosed in ${path}`);
    }
  }
});

test('l’offre vend explicitement un guide, pas un accès logiciel', () => {
  assert.equal(config.product.name, 'Le Guide de l’IA gratuite');
  assert.equal(config.product.price, 3000);
  assert.equal(config.product.pages, '25 pages');
  assert.equal(config.product.prompts, 25);
  assert.match(config.product.delivery, /Guide PDF/);
  assert.equal(config.product.sampleUrl, undefined);
});

test('aucun PDF du guide n’est public et les vidéos de présentation existent', () => {
  const publicFiles = files('public');
  assert.equal(publicFiles.some((path) => path.endsWith('.pdf')), false);
  for (const path of ['public/videos/presentation-madgic.mp4', 'public/videos/commande-madgic.mp4', 'public/images/video-presentation.jpg', 'public/images/video-commande.jpg']) {
    assert.ok(existsSync(join(root, path)), `Missing public teaser asset: ${path}`);
  }
});

test('le message de commande reste centré sur le guide et sans URL externe', () => {
  const ready = structuredClone(config);
  ready.whatsapp.number = '242060000000';
  ready.payments.mtn.number = '242050000000';
  const url = buildWhatsAppUrl(ready, 'mtn', 'MDG-TEST');
  assert.ok(url);
  assert.ok(url.startsWith('https://wa.me/242060000000?text='));
  const message = decodeURIComponent(url.split('?text=')[1]);
  assert.match(message, /Guide de l’IA gratuite/);
  assert.match(message, /3 000 FCFA/);
  assert.match(message, /MDG-TEST/);
  assert.doesNotMatch(message, /https?:\/\//i);
});
