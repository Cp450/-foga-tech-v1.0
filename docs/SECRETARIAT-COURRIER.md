# Secrétariat — Registre courrier, workflows n8n et contre-contrôle

Document de conception. Il s'appuie sur le Manuel des procédures (v1.0, 22/08/2026), le Manuel sectoriel, les formulaires FT-ACC et le Recueil de traçabilité (FT-REG). Il ne remplace aucune procédure existante : il les outille.

## 1. Principes repris du manuel

| Règle du manuel | Application au courrier |
|---|---|
| « Toute demande est enregistrée » | Tout courrier, mail, appel ou visite reçoit un numéro avant d'être traité |
| « Chaque dossier possède un responsable » | Champ `responsable` obligatoire à la transmission |
| « Toute décision importante est traçable » | Chaque changement de statut écrit une ligne dans le journal (FT-REG) |
| Accusé de réception sous 24–48 h (secteur 1) | Échéance `ar_avant` calculée à la création |
| Priorités SAV : urgence chantier le jour même, réclamation 24 h, demande normale 48 h | Délais de réponse par type de courrier (§4) |
| Relances J+3 / J+7 / J+14 / J+30, stoppées si devis accepté, refusé, annulé ou délai demandé | Workflow W4, même logique d'arrêt |
| Toute modification après validation crée une nouvelle version | Les enregistrements validés sont verrouillés ; une correction ajoute une ligne au journal |
| Classement `Clients/FT-CLI-XXXX/` | Archivage automatique sous ce dossier quand le client est identifié |

## 2. Numérotation (cohérente avec FT-PRO, FT-DEV, FT-CON, FT-CH, FT-REG…)

| Objet | Format | Exemple |
|---|---|---|
| Courrier / mail entrant | `FT-CE-AAAA-NNNN` | FT-CE-2026-0001 |
| Courrier / mail sortant | `FT-CS-AAAA-NNNN` | FT-CS-2026-0001 |
| Contact reçu (appel, visite, WhatsApp) | `FT-ACC-AAAA-NNNN` (déjà existant : formulaire d'accueil) | FT-ACC-2026-0007 |
| Ligne de journal | `FT-REG-AAAA-NNNN` (déjà existant) | FT-REG-2026-0001 |

La numérotation est attribuée par n8n (compteur annuel en base), jamais à la main, pour éviter doublons et trous. Un trou détecté au contre-contrôle est une anomalie.

Un courrier est relié, quand ils existent, au client (`FT-CLI-`), au chantier (`FT-CH-`), au devis (`FT-DEV-`), au contrat (`FT-CON-`), à la facture (`FT-FAC-`) ou au ticket SAV (`FT-SAV-`).

## 3. Tables NocoDB

NocoDB est déjà utilisé par `api/lib/nocodb.js` (variables `NOCODB_API_URL`, `NOCODB_API_TOKEN`, `NOCODB_TABLE_ID`). Cet outil lit un seul `NOCODB_TABLE_ID` ; les nouvelles tables seront appelées par n8n directement, sans toucher à ce code.

### `courriers` (entrant et sortant)
| Champ | Type | Remarque |
|---|---|---|
| `numero` | texte, unique | FT-CE- / FT-CS- |
| `sens` | Entrant / Sortant | |
| `canal` | Courrier physique / Mail / Coursier / Dépôt bureau / Recommandé | |
| `date_reception` ou `date_envoi` | date-heure | |
| `expediteur` / `destinataire` | texte | |
| `objet` | texte | |
| `categorie` | liste | voir §4 |
| `urgence` | Immédiate / 24 h / 48 h / Normale | |
| `secteur` | 1 à 8 | secteurs du manuel |
| `client_code`, `chantier_code`, `doc_ref` | texte | FT-CLI-, FT-CH-, FT-DEV-… |
| `responsable` | utilisateur | chargé d'affaires ou dirigeant |
| `statut` | Reçu → Enregistré → Transmis → En traitement → Répondu → Clos / Sans suite | statuts contrôlés |
| `ar_requis`, `ar_avant`, `ar_envoye_le` | booléen, date | accusé de réception |
| `reponse_avant`, `reponse_le` | date | |
| `lien_archive` | URL | scan ou pièce jointe |
| `message_id` | texte | identifiant du mail, sert au rapprochement |
| `no_recommande`, `preuve_envoi` | texte, fichier | pour le sortant |

### `journal` (équivalent numérique du FT-REG)
`numero` FT-REG-, `date_heure`, `action`, `document_ref`, `auteur`, `statut_avant`, `statut_apres`, `preuve`. Table en ajout seul : aucun droit de modification ni de suppression, y compris pour l'administrateur métier.

### `relances`
`courrier_numero`, `echeance` (J+3 / J+7 / J+14 / J+30), `type`, `statut` (Planifiée / Faite / Annulée), `date_faite`, `resultat`.

### `controles`
Résultat de chaque contre-contrôle hebdomadaire : date, écarts trouvés, responsable, statut de correction.

## 4. Catégories de courrier et délais

| Catégorie | Exemples BTP | Remonte à | Délai de traitement |
|---|---|---|---|
| Demande client | demande de devis, besoin de travaux, réservation d'engin | Chargé d'affaires du secteur (→ ouvre FT-PRO / FT-ACC) | AR sous 24–48 h |
| Réponse à une offre | accord, refus, demande de délai sur un devis | Commercial + Direction | immédiat, arrête les relances |
| Réclamation / SAV | désordre, retard, litige | Responsable SAV + Direction | 24 h (urgence chantier : jour même) |
| Marché / appel d'offres | consultation, ordre de service, avenant | Direction | immédiat |
| Administratif et réglementaire | permis, récépissé, administration, impôts, CNSS, assurance | Direction / Admin-Finance | selon l'échéance du document |
| Finance | facture fournisseur, relance de paiement, banque | Responsable administratif et financier | selon l'échéance |
| Chantier / technique | rapport, PV, réserves | Chef de chantier / responsable technique | 48 h |
| Autre / indésirable | publicité, hors sujet | Secrétariat | classement |

Le classement automatique propose une catégorie ; le secrétariat la confirme ou la corrige. Toute correction est journalisée.

## 5. Workflows n8n

**W1 — Mail entrant (boîtes entreprise et dirigeants).** Déclencheur IMAP ou Gmail. Étapes : dédoublonnage par `message_id` → numéro FT-CE → classement (règles par mots-clés puis IA en cas de doute) → recherche du client par email/téléphone (évite les doublons de fiche, règle du manuel) → archivage des pièces jointes → ligne dans `courriers` → ligne dans `journal` → alerte au responsable selon l'urgence → création du brouillon d'accusé.

**W2 — Accusé de réception.** Brouillon généré à partir d'un modèle, **envoyé après validation du secrétariat** (recommandation : pas d'envoi automatique, pour éviter une réponse erronée au nom de l'entreprise). Au clic de validation : envoi SMTP, `ar_envoye_le` renseigné, journal alimenté, copie archivée avec la preuve d'envoi.

**W3 — Courrier physique.** Formulaire NocoDB (ou formulaire web interne) rempli au bureau : expéditeur, objet, catégorie, photo ou scan. n8n numérote, archive le scan, notifie le responsable, prépare l'accusé. Le papier original est tamponné « reçu le » avec le numéro, puis classé.

**W4 — Relances et échéances.** Exécution quotidienne : courriers sans accusé après 24–48 h, réponses en retard, relances J+3 / J+7 / J+14 / J+30 sur les devis envoyés. Arrêt automatique quand le devis est accepté, refusé, annulé ou qu'un délai est demandé.

**W5 — Contacts (formulaire d'accueil FT-ACC).** Le site envoie déjà ses demandes à n8n via `N8N_DEVIS_WEBHOOK` (voir `api/routes/devis.js`). Même mécanisme à réutiliser pour le formulaire de contact, WhatsApp et téléphone (saisie rapide). Chaque contact crée un FT-ACC, le routage vers le secteur 1–8 suit la section D du formulaire, le rappel est planifié selon le « délai de rappel annoncé ».

**W6 — Sortant.** Chaque courrier ou mail officiel sortant est enregistré (FT-CS), avec preuve d'envoi (recommandé, accusé, mail envoyé) et échéance d'accusé de réception attendu.

**W7 — Contre-contrôle hebdomadaire (voir §6).**

## 6. Contre-contrôle

Rapport automatique envoyé chaque lundi à la Direction et au responsable administratif :
1. **Numérotation** : trous ou doublons dans FT-CE / FT-CS.
2. **Rapprochement boîtes mail ↔ registre** : mails reçus dans la semaine sans ligne au registre.
3. **Rapprochement archives ↔ registre** : fichiers dans `Clients/…` sans ligne, lignes sans fichier.
4. **Retards** : accusés non envoyés, réponses hors délai, relances non faites.
5. **Journal** : modifications de statut sans auteur ou sans preuve.
6. **Courrier physique** : contrôle visuel mensuel d'un échantillon de papiers contre le registre, signé par la Direction.

Les écarts sont écrits dans `controles` avec un responsable et une date de correction.

## 7. Rôles (tirés du manuel)

| Rôle | Droits sur le registre |
|---|---|
| Secrétariat / accueil | Créer, qualifier, transmettre, préparer et envoyer les accusés ; pas de suppression |
| Chargé d'affaires, responsable technique, chef de chantier, SAV | Voir et traiter leurs courriers, changer le statut, répondre |
| Responsable administratif et financier | Voir tout ce qui est finance et administratif ; lancer le contre-contrôle |
| Direction | Lecture complète, validation, arbitrage ; reçoit le rapport hebdomadaire |

Sécurité (manuel §17) : authentification renforcée pour les comptes sensibles, droits par rôle, sauvegardes quotidiennes testées, aucune clé API ni mot de passe dans le dépôt (voir `.env.example`).

## 8. Fournitures du secrétariat

Tampon dateur « Reçu le », tampon « Original / Copie conforme », registre papier de secours (numéroté et paraphé), scanner de bureau ou application de scan, bannettes « À traiter / Transmis / À archiver », classeurs par client et par chantier, étiquettes, enveloppes et bordereaux d'envoi, cahier de décharge pour les coursiers, rangement fermé à clé pour les originaux (contrats, PV, cautions).

## 9. Boîtes surveillées et conservation (confirmé)

| Boîte | Titulaire |
|---|---|
| contact@foga-tech.com | Secrétariat |
| cyril.nsaha@foga-tech.com | Directeur général |
| prince.ngoulou@foga-tech.com | Directeur général adjoint |
| fogat.technology@gmail.com | Directeur général |
| ngoulounoe5@gmail.com | Directeur général adjoint |

Conservation : 3 ans (durée légale indiquée par la Direction) ; point de départ à confirmer ; ne pas détruire un dossier de chantier ou de garantie sans accord écrit.

Conséquence technique : le domaine `foga-tech.com` (Hostinger, IMAP/SMTP) et les boîtes Gmail (API Google) sont deux connecteurs différents dans n8n ; le workflow W1 est donc doublé, avec le même enregistrement en aval.

## 10. Points encore à confirmer

1. Accusés de réception : brouillon validé par le secrétariat (recommandé) ou envoi automatique ?
2. NocoDB et n8n sur le VPS : confirmés ?
3. Canal d'alerte des dirigeants : WhatsApp, mail, ou les deux ? Et dirigeant référent pour chacun des 8 secteurs ?
4. Le directeur général a deux adresses (`fogat.technology@gmail.com` et `cyril.nsaha@foga-tech.com`), de même pour l'adjoint : s'agit-il des mêmes personnes ?
