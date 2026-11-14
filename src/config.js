// Madgic — default public offer. Seller contact details stay empty until
// configured privately in #vendeur. Keep the platform identity out of this file.

export const shopConfig = {
  name: 'Madgic',
  tagline: 'Des informations utiles. Des explications claires.',
  city: 'Brazzaville',
  siteUrl: '',

  product: {
    name: 'Le Guide de l’IA gratuite',
    subtitle: 'Plusieurs IA et un agent, sans abonnement',
    price: 3000,
    currency: 'XOF',
    priceLabel: '3 000 FCFA',
    edition: 'Édition novembre 2026',
    pages: '25 pages',
    prompts: 25,
    cover: '/images/guide-cover.webp',
    delivery: 'Guide PDF et bonus envoyés par WhatsApp après vérification du paiement',
  },

  payments: {
    mtn: { enabled: true, label: 'MTN MoMo', number: '', accountName: '' },
    airtel: { enabled: true, label: 'Airtel Money', number: '', accountName: '' },
  },
  whatsapp: { number: '', display: '' },
  social: { facebook: '', tiktok: '', instagram: '' },
  legal: { sellerName: '', email: '' },
};

export default shopConfig;
