import { useState } from 'react';
import Dialog from './Dialog.jsx';
import { AlertTriangle, Download, Save, ShieldCheck, Trash2, Wand2, X } from 'lucide-react';
import {
  clearSellerSettings,
  configToSellerSettings,
  defaultSellerSettings,
  saveSellerSettings,
  serializeSellerSettings,
  validateSellerSettings,
  SELLER_SETTINGS_EVENT,
} from '../lib/sellerSettings.js';

function Field({ id, label, hint, error, ...props }) {
  return (
    <div className={`seller-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} aria-invalid={Boolean(error)} aria-describedby={hint || error ? `${id}-hint` : undefined} />
      {(hint || error) && <small id={`${id}-hint`}>{error || hint}</small>}
    </div>
  );
}

export default function SellerSettingsModal({ config, onClose, notify }) {
  const [form, setForm] = useState(() => configToSellerSettings(config));
  const validation = validateSellerSettings(form);
  const demoMode = validation.demoMode;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const broadcast = () => window.dispatchEvent(new Event(SELLER_SETTINGS_EVENT));

  const handleSave = (event) => {
    event.preventDefault();
    if (Object.keys(validation.errors).length > 0) {
      notify('Corrige les champs en rouge avant d’enregistrer.');
      return;
    }
    const ok = saveSellerSettings(form);
    if (!ok) {
      notify('Stockage local indisponible dans ce navigateur.');
      return;
    }
    broadcast();
    notify(demoMode ? 'Aperçu de démonstration enregistré. Aucun paiement réel ne sera possible.' : validation.checkoutReady ? 'Réglages enregistrés sur cet appareil. Commande active.' : 'Brouillon enregistré sur cet appareil.');
  };

  const handleExport = () => {
    if (demoMode) {
      notify('Export impossible : remplacez les numéros de démonstration par vos coordonnées réelles.');
      return;
    }
    if (Object.keys(validation.errors).length > 0) {
      notify('Corrige les champs en rouge avant d’exporter.');
      return;
    }
    const blob = new Blob([serializeSellerSettings(form)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'madgic-config.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Fichier madgic-config.json exporté.');
  };

  const handleReset = () => {
    clearSellerSettings();
    broadcast();
    setForm({ ...defaultSellerSettings });
    notify('Réglages locaux effacés.');
  };

  const fillDemo = () => {
    setForm({
      ...defaultSellerSettings,
      whatsappNumber: '000000000000',
      mtnNumber: '000000000000',
      mtnAccountName: 'Compte démo MTN',
      airtelNumber: '000000000000',
      airtelAccountName: 'Compte démo Airtel',
      sellerName: 'Madgic Démo',
      email: 'demo@example.com',
      siteUrl: 'https://example.com',
    });
    notify('Valeurs de démonstration chargées. Ne pas exporter ni publier.');
  };

  return (
    <Dialog titleId="seller-title" className="seller" onClose={onClose}>
        <header className="modal__header">
          <div>
            <p className="eyebrow">Espace vendeur · local</p>
            <h2 id="seller-title">Configurer sans partager tes numéros</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer" data-autofocus>
            <X size={20} />
          </button>
        </header>

        <div className="seller__privacy">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>
            Ce formulaire ne demande pas tes numéros dans le chat. Enregistré ici, il reste seulement dans ce navigateur.
            Pour tester sans vrais numéros, utilise « Valeurs de démonstration ». Pour le rendre visible à tous les clients, exporte le fichier et remplace <code>public/madgic-config.json</code> avant de redéployer.
          </p>
        </div>

        <form className="seller__form" onSubmit={handleSave}>
          <fieldset>
            <legend>Contact client</legend>
            <Field
              id="seller-whatsapp"
              label="Numéro WhatsApp de réception"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="Indicatif pays + numéro"
              value={form.whatsappNumber}
              onChange={update('whatsappNumber')}
              error={validation.errors.whatsappNumber}
              hint="Sert à ouvrir la conversation de confirmation de commande."
            />
          </fieldset>

          <fieldset>
            <legend>Mobile Money</legend>
            <div className="seller__grid">
              <Field
                id="seller-mtn-number"
                label="Numéro MTN MoMo"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="Numéro MTN"
                value={form.mtnNumber}
                onChange={update('mtnNumber')}
                error={validation.errors.mtnNumber}
              />
              <Field
                id="seller-mtn-name"
                label="Nom du compte MTN"
                type="text"
                autoComplete="off"
                placeholder="Nom affiché au paiement"
                value={form.mtnAccountName}
                onChange={update('mtnAccountName')}
              />
              <Field
                id="seller-airtel-number"
                label="Numéro Airtel Money"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="Numéro Airtel"
                value={form.airtelNumber}
                onChange={update('airtelNumber')}
                error={validation.errors.airtelNumber}
              />
              <Field
                id="seller-airtel-name"
                label="Nom du compte Airtel"
                type="text"
                autoComplete="off"
                placeholder="Nom affiché au paiement"
                value={form.airtelAccountName}
                onChange={update('airtelAccountName')}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Identité & lien public</legend>
            <div className="seller__grid">
              <Field
                id="seller-name"
                label="Nom du vendeur / boutique"
                type="text"
                autoComplete="organization"
                placeholder="Nom légal ou commercial"
                value={form.sellerName}
                onChange={update('sellerName')}
              />
              <Field
                id="seller-email"
                label="Email de contact"
                type="email"
                autoComplete="email"
                placeholder="contact@exemple.com"
                value={form.email}
                onChange={update('email')}
                error={validation.errors.email}
              />
            </div>
            <Field
              id="seller-site-url"
              label="URL publique de la boutique"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://ton-domaine.com"
              value={form.siteUrl}
              onChange={update('siteUrl')}
              error={validation.errors.siteUrl}
              hint="Après déploiement, utile pour le partage et les aperçus sociaux."
            />
          </fieldset>

          <div className={`seller__status ${validation.checkoutReady ? 'is-ready' : ''}`} role="status">
            {validation.checkoutReady || demoMode ? <ShieldCheck size={17} aria-hidden="true" /> : <AlertTriangle size={17} aria-hidden="true" />}
            <span>
              {demoMode
                ? 'Mode démonstration : aperçu local uniquement. Aucun lien WhatsApp réel, aucun paiement et aucun export possible.'
                : validation.checkoutReady
                ? 'Commande active sur cet appareil. Exporte le fichier pour la rendre publique.'
                : 'Configuration incomplète : la commande restera bloquée tant qu’il manque WhatsApp ou un Mobile Money valide.'}
            </span>
          </div>

          {validation.warnings.length > 0 && (
            <ul className="seller__warnings">
              {validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          )}

          <div className="seller__actions">
            <button type="submit" className="btn btn--primary">
              <Save size={17} aria-hidden="true" /> Enregistrer sur cet appareil
            </button>
            <button type="button" className="btn btn--ghost" onClick={fillDemo}>
              <Wand2 size={17} aria-hidden="true" /> Valeurs de démonstration
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleExport} disabled={demoMode}>
              <Download size={17} aria-hidden="true" /> Exporter madgic-config.json
            </button>
            <button type="button" className="btn btn--ghost seller__reset" onClick={handleReset}>
              <Trash2 size={17} aria-hidden="true" /> Effacer le brouillon local
            </button>
          </div>
        </form>
    </Dialog>
  );
}
