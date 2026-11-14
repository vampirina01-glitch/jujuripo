import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, MessageCircle, Play, ShieldCheck, Smartphone, X } from 'lucide-react';
import Dialog from './Dialog.jsx';
import { buildWhatsAppUrl, createOrderReference, digitsOnly, getEnabledPayments, isPaymentConfigured, isDemoNumber, hasDemoNumbers } from '../lib/order.js';

export default function CheckoutModal({ config, onClose, notify, onConfigure, onWatch }) {
  const methods = useMemo(() => getEnabledPayments(config), [config]);
  const [selectedKey, setSelectedKey] = useState(methods[0]?.key || 'mtn');
  const [reference] = useState(() => createOrderReference());
  const selected = config.payments[selectedKey];
  const configured = isPaymentConfigured(selected) && digitsOnly(config.whatsapp.number).length >= 8;
  const demoMode = hasDemoNumbers(config);
  const ready = configured && !demoMode;
  const whatsappUrl = ready ? buildWhatsAppUrl(config, selectedKey, reference) : null;

  const copyNumber = async () => {
    if (!selected?.number) return;
    try {
      await navigator.clipboard.writeText(digitsOnly(selected.number));
      notify(`Numéro ${selected.label} copié.`);
    } catch {
      notify('Copie impossible. Notez le numéro affiché.');
    }
  };

  return (
    <Dialog titleId="checkout-title" className="checkout" onClose={onClose}>
      <header className="modal__header">
        <div><p className="eyebrow">Guide PDF · Paiement unique</p><h2 id="checkout-title">{demoMode ? 'Aperçu de commande' : ready ? 'Recevoir votre guide' : 'Commandes bientôt ouvertes'}</h2></div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer" data-autofocus><X size={20} /></button>
      </header>
      <div className="checkout__summary">
        <img src={config.product.cover} alt="" width="54" height="72" />
        <div><strong>{config.product.name}</strong><span>{config.product.subtitle}</span><span className="checkout__ref">Réf. {reference}</span></div>
        <strong className="checkout__price">{config.product.priceLabel}</strong>
      </div>
      <fieldset className="checkout__methods">
        <legend>1. Votre moyen de paiement</legend>
        <div className="method-grid">
          {methods.map((method) => (
            <label className={`method ${selectedKey === method.key ? 'is-selected' : ''} method--${method.key}`} key={method.key}>
              <input type="radio" name="payment" value={method.key} checked={selectedKey === method.key} onChange={() => setSelectedKey(method.key)} />
              <span className="method__dot" aria-hidden="true" />
              <span><strong>{method.label}</strong><small>{isDemoNumber(method.number) ? 'Aperçu local' : isPaymentConfigured(method) ? 'Disponible' : 'Bientôt disponible'}</small></span>
              {selectedKey === method.key && <Check size={17} aria-hidden="true" />}
            </label>
          ))}
        </div>
      </fieldset>
      {configured ? (
        <div className="checkout__instructions">
          <h3>{demoMode ? '2. Aperçu des instructions — démonstration' : '2. Règlement et confirmation'}</h3>
          <ol>
            <li>{demoMode ? 'Voici le montant qui sera demandé : ' : 'Envoyez '}<strong>{config.product.priceLabel}</strong>{demoMode ? '. N’envoyez aucun paiement en mode démonstration.' : ` au numéro ${selected?.label} ci-dessous.`}</li>
            <li>Vérifiez le nom du compte avant de valider. Conservez votre preuve de paiement.</li>
            <li>Transmettez cette preuve sur WhatsApp. Le vendeur vous envoie les fichiers après vérification.</li>
          </ol>
          <div className="number-box">
            <Smartphone size={20} aria-hidden="true" />
            <div><span>{selected.label}{demoMode ? ' · Numéro fictif' : ''}</span><strong>{selected.number}</strong>{selected.accountName && <small>Au nom de : {selected.accountName}</small>}</div>
            <button type="button" className="icon-btn" onClick={copyNumber} aria-label={`Copier le numéro ${selected.label}`}><Copy size={17} /></button>
          </div>
        </div>
      ) : (
        <div className="checkout__instructions">
          <p className="section__lead">Les coordonnées de paiement ne sont pas encore disponibles. Aucun règlement ne doit être envoyé pour le moment. Vous pouvez regarder la présentation publique ; le guide complet reste privé jusqu’à la vérification du paiement.</p>
          {onWatch && <button type="button" className="text-link" onClick={onWatch} style={{ marginTop: 14 }}><Play size={16} aria-hidden="true" /> Regarder la présentation</button>}
        </div>
      )}
      {import.meta.env.DEV && !configured && (
        <div className="checkout__dev-note">Aperçu vendeur uniquement : <button type="button" className="link-button" onClick={onConfigure}>ouvrir la configuration privée</button> ou utiliser les valeurs de démonstration. Ces réglages restent sur votre appareil.</div>
      )}
      <div className="checkout__actions">
        {whatsappUrl ? (
          <a className="btn btn--primary btn--block" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Confirmer sur WhatsApp <ArrowRight size={17} aria-hidden="true" /></a>
        ) : (
          <button type="button" className="btn btn--primary btn--block" disabled>{demoMode ? 'Démonstration · aucun paiement réel' : 'Commandes bientôt ouvertes'}</button>
        )}
        <p className="checkout__safe"><ShieldCheck size={16} aria-hidden="true" /> Ne communiquez jamais votre code PIN. Le paiement est vérifié manuellement par le vendeur, pas par ce site.</p>
      </div>
    </Dialog>
  );
}
