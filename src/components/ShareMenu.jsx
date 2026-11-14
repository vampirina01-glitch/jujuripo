import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Facebook, Link2, MessageCircle, Music2, Share2 } from 'lucide-react';
import { buildShareLinks } from '../lib/order.js';

export default function ShareMenu({ config, notify, className = '' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);
  const url = config.siteUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  const text = `${config.name} — ${config.product.name} : ${config.product.subtitle}. ${config.product.priceLabel}.`;
  const links = buildShareLinks(url, text);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copy = async (value, message) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notify(message);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify('Copie impossible automatiquement. Sélectionne le lien dans la barre d’adresse.');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${config.name} — ${config.product.name}`, text, url });
        setOpen(false);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    setOpen((value) => !value);
  };

  return (
    <div className={`share ${className}`} ref={rootRef}>
      <button type="button" className="btn btn--ghost btn--sm" onClick={nativeShare} aria-expanded={open} aria-haspopup="menu">
        <Share2 size={16} aria-hidden="true" />
        Partager
      </button>
      {open && (
        <div className="share__menu" role="menu" aria-label="Partager Madgic">
          <a role="menuitem" href={links.whatsapp} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            <MessageCircle size={17} aria-hidden="true" /> WhatsApp
          </a>
          {links.facebook && (
            <a role="menuitem" href={links.facebook} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <Facebook size={17} aria-hidden="true" /> Facebook
            </a>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => copy(`${text} ${url}\n#Madgic #IntelligenceArtificielle #IAGratuite`, 'Texte TikTok copié. Colle-le dans ta vidéo ou ta bio.')}
          >
            <Music2 size={17} aria-hidden="true" /> TikTok · copier le texte
          </button>
          <button type="button" role="menuitem" onClick={() => copy(url, 'Lien copié.')}>
            {copied ? <Check size={17} aria-hidden="true" /> : <Link2 size={17} aria-hidden="true" />}
            {copied ? 'Lien copié' : 'Copier le lien'}
          </button>
          <button type="button" role="menuitem" className="share__copyall" onClick={() => copy(links.copyText, 'Message de partage copié.')}>
            <Copy size={17} aria-hidden="true" /> Copier le message complet
          </button>
        </div>
      )}
    </div>
  );
}
