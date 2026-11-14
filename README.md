# Madgic — boutique d’information pratique

Boutique francophone, pensée pour le mobile et le partage social. Premier produit : **Le Guide de l’IA gratuite — Plusieurs IA et un agent, sans abonnement**, au prix de **3 000 FCFA**.

## Positionnement

Madgic vend **de l’information organisée**, pas un abonnement logiciel :

1. Les problèmes : coût des abonnements, dispersion entre outils, manque de méthode.
2. Les avantages : plusieurs IA et un agent derrière un accès officiel gratuit.
3. Le contenu payant : prise en main, conditions, exemples, 25 prompts et plan sur 7 jours.

Le nom et l’adresse de la plateforme sont volontairement absents de la vitrine, des métadonnées, des messages de partage, de la commande et des vidéos publiques. Aucun PDF du guide n’est public. Ces informations sont expliquées uniquement dans le guide complet livré après vérification du paiement. L’offre publique reste honnête : l’accès à l’outil est gratuit selon les conditions et quotas de son éditeur ; le guide, lui, est payant. « Gratuit » ne signifie pas « illimité ».

## Démarrer

```bash
npm install
npm run dev
```

Le serveur écoute sur `0.0.0.0` pour l’aperçu de développement. Build de production : `npm run build`, sortie dans `dist/`.

## Configurer la vente sans partager de numéros dans le chat

Ajoutez `#vendeur` à l’URL de la boutique. En développement, un raccourci existe aussi en bas de page ; il est retiré du build public.

- **Valeurs de démonstration** : aperçu local uniquement. Les numéros fictifs ne peuvent pas ouvrir une conversation WhatsApp réelle et ne peuvent pas être exportés.
- **Enregistrer sur cet appareil** : conserve le brouillon dans le navigateur actuel. Cela ne configure pas les autres visiteurs.
- **Exporter madgic-config.json** : avec des coordonnées réelles valides, produit le fichier à placer dans `public/madgic-config.json` avant redéploiement.

Les coordonnées de paiement sont destinées à être visibles des clients. Aucun code PIN ne doit être demandé. Tant que la configuration publique est vide, les commandes affichent « bientôt ouvertes » et aucun paiement ne doit être envoyé.

Alternative : remplir directement `src/config.js` avant le build.

## Paiement et livraison

Le paiement est **manuel**, sans API bancaire intégrée :

1. Le client choisit MTN MoMo ou Airtel Money.
2. Il règle auprès du vendeur et conserve sa preuve.
3. Il transmet la preuve par WhatsApp.
4. Le vendeur vérifie la réception réelle des fonds.
5. Le vendeur envoie le guide et les bonus. Le bouton WhatsApp ne débloque aucun fichier automatiquement.

## Produit numérique

Dans cet espace de travail, le dossier ignoré `private-products/` contient :

- `guide-ia-gratuite-madgic.pdf` — guide complet de 25 pages ;
- `25-prompts-madgic.md` ;
- `plan-7-jours-madgic.md` ;
- `scripts-videos-madgic.md` ;
- `generate_guide.py` — source de génération privée.

Ne placez jamais le PDF complet dans `public/` et ne le publiez pas dans un dépôt public. Aucun extrait PDF n’est servi publiquement : la présentation publique passe par les vidéos. Le dossier privé n’est pas transféré par GitHub : conservez une copie privée des fichiers livrés au client.

Régénération dans l’espace de travail actuel :

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-pdf.txt
.venv/bin/python scripts/design_assets.py
.venv/bin/python private-products/generate_guide.py
```

## Identité visuelle

Direction éditoriale : papier clair, vert profond, typographie Lora/Inter, couverture typographique du vrai guide. Pas de décor lumineux générique ni de fausse capture de logiciel. Les images sont générées de façon reproductible par `scripts/design_assets.py`.

Animations : apparition au défilement, barre de progression de lecture, compteurs animés, légère inclinaison de la couverture au pointeur, transitions de FAQ/modales et deux vidéos muettes de présentation. Les mouvements respectent `prefers-reduced-motion` et les vidéos ne se lancent qu’après une action explicite.

Régénérer les vidéos publiques :

```bash
.venv/bin/pip install -r requirements-video.txt
.venv/bin/python scripts/generate_videos.py
```

Les vidéos montrent le problème, la proposition et le parcours de commande, jamais le nom, l’adresse, l’écran de la plateforme ni une page du guide payé.

## Vérifier

```bash
npm test
npm run build
.venv/bin/python scripts/check_public_surface.py
```

Le contrôle public vérifie les textes, le build, les vidéos de présentation et l’absence de tout PDF public du guide. Il ne remplace pas une relecture humaine avant publication.

## Déployer

Netlify est préconfiguré : commande `npm run build`, dossier `dist`.

Avant la mise en vente :

- compléter l’identité légale, le contact et les conditions de remboursement ;
- configurer et tester les vrais moyens de paiement ;
- renseigner `siteUrl` et utiliser des URL absolues pour les images Open Graph dans `index.html` ;
- tester le lien public sur WhatsApp, Facebook et mobile ;
- vérifier que les fichiers payés ne sont pas servis publiquement.

## Structure

```txt
src/App.jsx                    vitrine et parcours d’achat
src/components/                commande, FAQ, partage, configuration vendeur
src/lib/                       logique de commande et réglages locaux
public/madgic-config.json      configuration publique vide par défaut
public/videos/                 vidéos publiques muettes, sans identité de la plateforme
public/images/                 couverture, carte de partage et affiches vidéo
scripts/                       génération visuelle et contrôle public
private-products/              produit payé et source privée, ignorés par Git
tests/                         logique métier et contrôle de la surface publique
```
