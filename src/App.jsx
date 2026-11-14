import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Download, FileText, Layers, MessageCircle, ShieldCheck, X } from 'lucide-react';
import Logo from './components/Logo.jsx';
import ShareMenu from './components/ShareMenu.jsx';
import Faq from './components/Faq.jsx';
import Dialog from './components/Dialog.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import SellerSettingsModal from './components/SellerSettingsModal.jsx';
import useShopConfig from './hooks/useShopConfig.js';

const difficulties = [
  {
    number: '01',
    title: 'Les abonnements s’additionnent.',
    text: 'Un outil pour écrire, un autre pour réfléchir, un autre encore pour créer. Avant de payer plusieurs services, il est utile de savoir ce qu’une offre gratuite permet vraiment.',
  },
  {
    number: '02',
    title: 'Les outils se multiplient. Le temps, non.',
    text: 'Comparer les offres, comprendre les essais gratuits et retrouver la bonne fonction prend du temps. Le manque d’information coûte parfois plus cher que l’abonnement lui-même.',
  },
  {
    number: '03',
    title: 'Utiliser l’IA ne suffit pas. Il faut savoir l’utiliser.',
    text: 'Une réponse peut être convaincante et pourtant incorrecte. Savoir formuler une demande, vérifier un résultat et protéger ses données reste indispensable.',
  },
];

const chapters = [
  ['01', 'Le point de départ', 'Ce qui freine l’utilisation de l’IA : coûts, dispersion et manque de repères.'],
  ['02', 'Votre accès, étape par étape', 'L’outil présenté, son adresse officielle et la marche à suivre pour commencer.'],
  ['03', 'Plusieurs IA, selon votre besoin', 'Choisir un modèle, comparer les réponses et écrire des demandes utiles.'],
  ['04', 'Un agent pour aller plus loin', 'Préparer une mission, suivre les étapes et vérifier le travail réalisé.'],
  ['05', 'Passer à la pratique', '25 prompts, des exemples concrets et un plan d’action sur 7 jours.'],
];

function LegalModal({ config, onClose }) {
  return (
    <Dialog titleId="legal-title" className="legal" onClose={onClose}>
      <header className="modal__header">
        <div><p className="eyebrow">Madgic</p><h2 id="legal-title">Informations & confidentialité</h2></div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer" data-autofocus><X size={20} /></button>
      </header>
      <div className="legal__body">
        <p><strong>Éditeur :</strong> {config.legal.sellerName || 'Madgic — identification du vendeur à compléter avant ouverture des ventes.'}</p>
        <p><strong>Contact :</strong> {config.legal.email || 'Les coordonnées de contact seront disponibles à l’ouverture des commandes.'}</p>
        <p><strong>Ce que vous achetez :</strong> un guide d’information indépendant, au format PDF, accompagné de ressources pratiques. Vous ne payez pas un abonnement à l’outil présenté et aucun compte tiers ne vous est vendu.</p>
        <p><strong>Accès à l’outil :</strong> le guide explique comment utiliser une offre officielle gratuite. Cette offre reste soumise aux conditions, quotas et disponibilités de son éditeur. Madgic ne contrôle pas ses tarifs ni ses fonctionnalités futures.</p>
        <p><strong>Paiement et livraison :</strong> le règlement s’effectue par Mobile Money auprès du vendeur. La réception est vérifiée manuellement, puis les fichiers sont envoyés par WhatsApp. Le site ne prélève pas automatiquement d’argent.</p>
        <p><strong>Vos données :</strong> aucun compte client ni cookie publicitaire n’est créé par cette application. Les réglages vendeur restent dans le navigateur qui les enregistre. Les services de partage et de messagerie ont leurs propres politiques de confidentialité.</p>
        <p><strong>Avant toute utilisation :</strong> consultez les conditions du service présenté dans le guide et ne partagez pas d’informations sensibles. Les réponses de l’IA doivent être vérifiées.</p>
      </div>
    </Dialog>
  );
}

export default function App() {
  const config = useShopConfig();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3800);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const openCheckout = useCallback(() => { setSellerOpen(false); setLegalOpen(false); setCheckoutOpen(true); }, []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);
  const openSeller = useCallback(() => { setCheckoutOpen(false); setLegalOpen(false); setSellerOpen(true); }, []);
  const closeSeller = useCallback(() => {
    setSellerOpen(false);
    if (window.location.hash === '#vendeur') window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    const syncHash = () => { if (window.location.hash === '#vendeur') openSeller(); };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [openSeller]);

  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="site-header">
        <div className="container site-header__inner">
          <a href="#accueil" className="site-header__brand" aria-label="Madgic, accueil"><Logo /></a>
          <nav className="site-nav" aria-label="Navigation principale">
            <a href="#pourquoi">Pourquoi ce guide</a>
            <a href="#guide">Ce que vous obtenez</a>
            <a href="#faq">Questions fréquentes</a>
          </nav>
          <button type="button" className="btn btn--primary btn--sm header-cta" onClick={openCheckout}>Obtenir le guide <ArrowUpRight size={16} aria-hidden="true" /></button>
        </div>
      </header>

      <main id="contenu">
        <section className="hero container" id="accueil" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="eyebrow"><span className="eyebrow-rule" />Information pratique · Intelligence artificielle</p>
            <h1 id="hero-title">L’intelligence artificielle, <em>sans multiplier les abonnements.</em></h1>
            <p className="hero__lead">Il existe un outil qui réunit <strong>plusieurs IA et un agent</strong>, avec un accès officiel gratuit. Ce guide vous montre comment le trouver, le prendre en main et l’utiliser pour votre travail.</p>
            <div className="hero__cta">
              <button type="button" className="btn btn--primary btn--lg" onClick={openCheckout}>Obtenir le guide <ArrowRight size={18} aria-hidden="true" /></button>
              <a className="text-link" href={config.product.sampleUrl} target="_blank" rel="noreferrer">Feuilleter un extrait <ArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
            <p className="hero__price"><strong>{config.product.priceLabel}</strong><span>Le guide et ses bonus · Paiement unique</span></p>
            <p className="hero__note">L’accès à l’outil est gratuit selon son offre officielle, avec quotas. Le prix indiqué concerne le guide d’information, pas la plateforme.</p>
          </div>
          <div className="hero__product">
            <div className="book-display">
              <div className="book-shadow" aria-hidden="true" />
              <img className="book-cover" src={config.product.cover} alt="Couverture du Guide de l’IA gratuite : plusieurs intelligences artificielles, un agent, un accès officiel" width="900" height="1200" fetchPriority="high" />
            </div>
            <p className="product-caption"><BookOpen size={15} aria-hidden="true" /> Un guide à lire. Des étapes à appliquer.</p>
          </div>
        </section>

        <section className="principles" aria-label="Les informations clés">
          <div className="container principles__inner">
            <div><span>Plusieurs IA</span><p>Différents modèles, un même point d’entrée.</p></div>
            <div><span>Un agent intégré</span><p>Pour travailler sur des tâches en plusieurs étapes.</p></div>
            <div><span>Un accès officiel gratuit</span><p>Sans acheter de compte ni contourner de règles.</p></div>
          </div>
        </section>

        <section className="section container problems" id="pourquoi" aria-labelledby="problems-title">
          <div className="section__intro">
            <p className="eyebrow">Avant de parler d’outils</p>
            <h2 id="problems-title">Le vrai obstacle, c’est souvent le manque d’informations.</h2>
            <p>Vous n’avez pas besoin d’une nouvelle promesse. Vous avez besoin de comprendre ce qui existe, ce qui est gratuit et ce qui vous sera réellement utile.</p>
          </div>
          <div className="problem-list">
            {difficulties.map((item) => (
              <article className="problem-row" key={item.number}>
                <span className="row-number" aria-hidden="true">{item.number}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="possibilities" aria-labelledby="possibilities-title">
          <div className="container possibilities__inner">
            <div>
              <p className="eyebrow">L’intérêt de l’outil présenté</p>
              <h2 id="possibilities-title">Plusieurs possibilités.<br /><em>Un seul accès.</em></h2>
              <p>Au lieu de chercher un abonnement différent pour chaque besoin, découvrez une plateforme qui rassemble plusieurs intelligences artificielles et un agent.</p>
              <p>Le guide vous explique ce que vous pouvez faire avec, comment vous y rendre et quelles limites garder en tête.</p>
            </div>
            <div className="use-list">
              <article><Layers size={23} strokeWidth={1.5} aria-hidden="true" /><div><h3>Comparer avant de choisir</h3><p>Essayer les modèles disponibles et confronter leurs réponses à une même demande.</p></div></article>
              <article><FileText size={23} strokeWidth={1.5} aria-hidden="true" /><div><h3>Avancer sur un travail concret</h3><p>Préparer un texte, organiser une recherche, structurer une idée ou créer un premier document.</p></div></article>
              <article><ArrowRight size={23} strokeWidth={1.5} aria-hidden="true" /><div><h3>Déléguer avec méthode</h3><p>Confier une mission à l’agent, suivre sa progression et garder la décision finale.</p></div></article>
            </div>
          </div>
        </section>

        <section className="section container guide-section" id="guide" aria-labelledby="guide-title">
          <div className="guide-heading">
            <p className="eyebrow">Ce que contient votre achat</p>
            <h2 id="guide-title">L’information complète.<br />Pas seulement une liste de liens.</h2>
            <p className="section__lead">{config.product.name} rassemble les explications, les exemples et les repères pour commencer sans vous disperser.</p>
            <div className="guide-facts" aria-label="Contenu du guide">
              <div><strong>25</strong><span>pages structurées</span></div>
              <div><strong>25</strong><span>prompts à adapter</span></div>
              <div><strong>7</strong><span>jours pour pratiquer</span></div>
            </div>
            <a className="text-link" href={config.product.sampleUrl} target="_blank" rel="noreferrer"><Download size={17} aria-hidden="true" /> Lire l’extrait gratuit <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="chapter-list" aria-label="Sommaire du guide">
            {chapters.map(([number, title, text]) => (
              <article className="chapter" key={number}>
                <span aria-hidden="true">{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
            <p className="chapter-note"><Check size={16} aria-hidden="true" /> Avec les conditions d’utilisation, les quotas et les précautions à connaître.</p>
          </div>
        </section>

        <section className="section container purchase" id="obtenir" aria-labelledby="purchase-title">
          <div className="purchase__intro">
            <p className="eyebrow">Simple et transparent</p>
            <h2 id="purchase-title">Un petit investissement.<br />Des informations à garder.</h2>
            <p>Vous achetez le travail de recherche, d’organisation et d’explication. L’outil présenté reste accessible gratuitement, directement auprès de son éditeur.</p>
            <div className="steps">
              <div><span>1</span><p><strong>Choisissez votre paiement</strong>MTN MoMo ou Airtel Money.</p></div>
              <div><span>2</span><p><strong>Confirmez votre règlement</strong>Envoyez votre preuve au vendeur sur WhatsApp.</p></div>
              <div><span>3</span><p><strong>Recevez vos fichiers</strong>Le guide et les bonus, après vérification du paiement.</p></div>
            </div>
          </div>
          <aside className="offer-card" aria-label="Offre et prix">
            <p className="eyebrow">Le guide + les ressources</p>
            <h3>{config.product.name}</h3>
            <p className="offer-subtitle">{config.product.subtitle}</p>
            <div className="offer-price">{config.product.priceLabel}<span>Paiement unique</span></div>
            <ul className="offer-inclusions">
              <li><Check size={17} aria-hidden="true" /> Le guide PDF de 25 pages</li>
              <li><Check size={17} aria-hidden="true" /> L’accès expliqué pas à pas</li>
              <li><Check size={17} aria-hidden="true" /> 25 prompts et le plan sur 7 jours</li>
              <li><Check size={17} aria-hidden="true" /> Les checklists et exemples pratiques</li>
            </ul>
            <button type="button" className="btn btn--primary btn--block" onClick={openCheckout}>Commander le guide <ArrowRight size={18} aria-hidden="true" /></button>
            <p className="offer-payment"><MessageCircle size={15} aria-hidden="true" /> Confirmation et livraison par WhatsApp</p>
            <div className="offer-disclosure"><ShieldCheck size={19} strokeWidth={1.5} aria-hidden="true" /><p><strong>Pas de compte vendu. Pas d’abonnement caché.</strong> L’accès gratuit à la plateforme est soumis à ses conditions et à ses quotas. « Gratuit » ne signifie pas « illimité ».</p></div>
          </aside>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="container faq-section__inner">
            <div className="section__intro">
              <p className="eyebrow">Avant de commander</p>
              <h2 id="faq-title">Les réponses, sans détour.</h2>
              <p>Voici ce qui est inclus, ce qui ne l’est pas et comment se déroule votre commande.</p>
              <ShareMenu config={config} notify={notify} className="faq-share" />
            </div>
            <Faq />
          </div>
        </section>

        <section className="closing container" aria-labelledby="closing-title">
          <div><p className="eyebrow">Madgic · Information pratique</p><h2 id="closing-title">Arrêtez de chercher.<br /><em>Commencez à comprendre.</em></h2></div>
          <div><p>Le guide, les prompts et la marche à suivre. Tout est réuni au même endroit.</p><button type="button" className="btn btn--light btn--lg" onClick={openCheckout}>Obtenir le guide · {config.product.priceLabel} <ArrowRight size={18} aria-hidden="true" /></button></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div><Logo /><p>{config.tagline}</p></div>
          <nav aria-label="Navigation de bas de page" className="site-footer__links">
            <a href="#guide">Le guide</a><a href="#faq">Questions fréquentes</a>
            <button type="button" className="link-button" onClick={() => { setCheckoutOpen(false); setSellerOpen(false); setLegalOpen(true); }}>Informations & confidentialité</button>
            {import.meta.env.DEV && <button type="button" className="link-button seller-link" onClick={openSeller}>Espace vendeur · aperçu</button>}
          </nav>
        </div>
        <div className="container site-footer__bottom"><span>© {new Date().getFullYear()} Madgic</span><span>Guide indépendant. Vérifiez les informations avant de les utiliser. Aucun revenu garanti.</span></div>
      </footer>

      <div className="mobile-bar" aria-label="Commande rapide"><div><strong>{config.product.priceLabel}</strong><span>Le guide + les bonus</span></div><button type="button" className="btn btn--primary" onClick={openCheckout}>Obtenir le guide <ArrowRight size={17} aria-hidden="true" /></button></div>
      {checkoutOpen && <CheckoutModal config={config} onClose={closeCheckout} notify={notify} onConfigure={openSeller} />}
      {legalOpen && <LegalModal config={config} onClose={() => setLegalOpen(false)} />}
      {sellerOpen && <SellerSettingsModal config={config} onClose={closeSeller} notify={notify} />}
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast && <><Check size={18} aria-hidden="true" />{toast}</>}</div>
    </>
  );
}
