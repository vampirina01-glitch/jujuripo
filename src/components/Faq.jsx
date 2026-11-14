import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const items = [
  {
    q: 'Qu’est-ce que je paie exactement ?',
    a: 'Vous payez 3 000 FCFA pour le guide PDF et ses ressources : les explications pas à pas, 25 prompts, des exemples et un plan sur 7 jours. Vous ne payez pas l’accès à la plateforme présentée : celui-ci est gratuit via son offre officielle.',
  },
  {
    q: 'L’outil est-il vraiment gratuit et légal ?',
    a: 'Oui, le guide présente un accès officiellement proposé sans abonnement. Vous utilisez le service directement, sans compte piraté, partage de codes ou contournement. L’offre gratuite comporte des crédits, quotas et conditions qui peuvent évoluer ; elle n’est pas garantie illimitée.',
  },
  {
    q: 'Que voulez-vous dire par « plusieurs IA et un agent » ?',
    a: 'L’outil présenté donne accès à différents modèles d’intelligence artificielle selon leur disponibilité. Il propose aussi un agent capable de travailler sur des tâches en plusieurs étapes. Le guide explique comment choisir, formuler votre demande et vérifier le résultat.',
  },
  {
    q: 'Comment vais-je trouver l’outil ?',
    a: 'La page publique présente les usages et le contenu, sans afficher le nom de la plateforme. Le guide contient son nom, son adresse officielle et les étapes pour y accéder. Vous n’avez pas à acheter un compte supplémentaire auprès de Madgic.',
  },
  {
    q: 'Est-ce adapté si je débute ?',
    a: 'Oui. Les étapes sont expliquées en français, avec des exemples et des checklists. Un téléphone ou un ordinateur et une connexion Internet suffisent pour suivre le guide. Vous n’avez pas besoin de savoir coder.',
  },
  {
    q: 'Comment recevoir le guide après le paiement ?',
    a: 'Choisissez MTN MoMo ou Airtel Money, puis suivez les instructions du vendeur. Envoyez votre preuve de paiement sur WhatsApp. Après vérification manuelle de la réception, le vendeur vous transmet les fichiers. Le site ne vous prélève pas automatiquement.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Le guide explique les précautions à prendre et les conditions de confidentialité du service présenté. Une utilisation gratuite ne signifie pas que vos conversations sont privées. Ne saisissez jamais de mot de passe, de code bancaire, de pièce d’identité ou de données confidentielles.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="faq">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <article className={`faq__item ${open ? 'is-open' : ''}`} key={item.q}>
            <h3><button type="button" className="faq__question" aria-expanded={open} aria-controls={`faq-panel-${index}`} id={`faq-button-${index}`} onClick={() => setOpenIndex(open ? -1 : index)}><span>{item.q}</span>{open ? <Minus size={19} aria-hidden="true" /> : <Plus size={19} aria-hidden="true" />}</button></h3>
            <div className="faq__answer" id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-button-${index}`} hidden={!open}><p>{item.a}</p></div>
          </article>
        );
      })}
    </div>
  );
}
