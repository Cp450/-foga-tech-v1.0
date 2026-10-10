# Foga-Tech International — Programme d'exécution des systèmes numériques

Version 0.2, document de travail du 10 octobre 2026 (v0.1 corrigée après l'analyse des manques). Échéance du premier chantier : 31 octobre 2026. Ce programme couvre l'archivage comptable, la mise en ligne de l'ERP SFP Suite BTP, le secrétariat numérique (courrier et agents) et la place des autres logiciels. Il s'appuie sur les dépôts `sfp-suite-btp-`, `finarchi` (spécification FTMA), `-foga-tech-v1.0`, `sfp-flotte`, ainsi que sur les manuels et formulaires de l'entreprise.

## 1. Ce qu'on demande à la Direction

Le programme repose sur cinq décisions. Elles sont détaillées au §12.

1. Fixer le jeu de règles de référence (délais, paiements, arborescence, nommage), car deux jeux de documents se contredisent (§4).
2. Désigner nommément le responsable qui valide les règles de classement et contrôle les échantillons.
3. Confirmer la durée de conservation des pièces comptables avec l'expert-comptable.
4. Autoriser la mise en ligne de l'ERP sur le serveur, avec volume de données et sauvegarde.
5. Dire si le contenu des documents peut passer par un service d'intelligence artificielle externe.

## 2. Portefeuille des logiciels

| Module | Dépôt | Technique | État au 10/10/2026 | Rôle dans le programme |
|---|---|---|---|---|
| ERP SFP Suite BTP | `sfp-suite-btp-` (privé) | Python, Flask, SQLite, pages HTMX | Complet, environ 2 470 tests, tourne en local, pas en ligne | Cœur : comptabilité, achats, chantiers ; reçoit le lien vers les pièces |
| Archivage comptable | à créer dans l'ERP | Tables dans la base de l'ERP, fichiers sur stockage unique | À construire, échéance 31/10 | Prouver chaque chiffre des 3 derniers exercices |
| FTMA (gestion, procédures, archivage, agents) | `finarchi` | Spécification (PostgreSQL, S3, n8n) | Spécification v1.1, pas de code | Spécification mère à long terme |
| Secrétariat numérique | documents du dépôt `-foga-tech-v1.0` | Registre, workflows n8n, agents | Manuel, user stories et conception rédigés | Courrier, mails, accusés, contre-contrôle |
| Site web et API devis | `-foga-tech-v1.0` | React, Express, PostgreSQL, n8n, NocoDB | Code réel ; guide de déploiement présent | Source des demandes en ligne |
| SFP Flotte | `sfp-flotte` | Rust (Tauri), SQLite, mobile Expo | Code, 36 tests ; ancien projet | Gestion de flotte ; à positionner (§12) |

## 3. Architecture cible

### 3.1 Principe
Un seul parcours pour toute pièce, qu'elle arrive par papier, par mail ou par le site : collecte, tri, classement, index, lien avec l'ERP, sauvegarde. L'ERP est la source de vérité de la comptabilité ; l'archive est la source de vérité des pièces ; le lien entre les deux est un identifiant de pièce.

### 3.2 Les six étapes
| Étape | Rôle | Support |
|---|---|---|
| 1. Collecte | Transformer chaque pièce papier en PDF ou image nette dans un dossier « À trier » | Scanner, ou smartphone avec application de scan |
| 2. Tri | Séparer par type de pièce | Outil de tri (Jev, à préciser) puis contrôle humain |
| 3. Classement | Renommer selon la règle unique et ranger dans l'arborescence | Dossiers sur le stockage principal |
| 4. Index | Une ligne par pièce, avec son état de traitement | Table `pieces` dans la base de l'ERP |
| 5. Lien ERP | Chaque écriture comptable cite l'identifiant de la pièce | Champ `piece_id` renseigné par `comptabilisation.py` |
| 6. Sauvegarde | 3 copies sur 2 supports, dont une hors du lieu de travail | Disque externe et stockage en ligne |

### 3.3 Pourquoi l'index dans l'ERP
- Un seul point d'écriture comptable existe déjà ; y ajouter l'identifiant de pièce est un changement localisé.
- Le journal d'audit, les droits par rôle et la règle des quatre yeux de l'ERP s'appliquent automatiquement à l'archive.
- Une base de plus (NocoDB) ajouterait un point de perte de données, comme en juin quand NocoDB a perdu ses données faute de volume persistant.

NocoDB reste utile pour le site web et le CRM des devis. Il ne porte pas les pièces comptables.

### 3.4 Correspondance entre types de pièces et modules de l'ERP
| Type de pièce | Dossier | Module de l'ERP concerné |
|---|---|---|
| Factures fournisseurs | `1_Factures-fournisseurs` | Achats (bon de commande, réception, facture fournisseur) |
| Reçus de caisse | `2_Recus-de-caisse` | Caisse |
| Encaissements | `3_Encaissements` | Facturation, encaissements, trésorerie |
| Sous-traitance | `4_Sous-traitance` | Sous-traitants et marketplace |

Les factures émises par l'ERP, ses PDF de devis, de situations et de bons sont générés par le moteur commun `pdf_moteur.py` ; elles seront archivées dans les mêmes dossiers et indexées avec le même identifiant.

## 4. Référentiel des règles à figer

Une règle doit avoir une seule valeur. Le tableau montre les valeurs actuellement en conflit et la proposition.

| Règle | Source A | Source B | Proposition |
|---|---|---|---|
| Accusé de réception d'un prospect | 4 h (FTMA) | 24 à 48 h (manuel du fichier transmis) | **À trancher par la Direction** |
| Relances de devis | J+3, J+7, J+14 (FTMA) | J+3, J+7, J+14, J+30 (manuel) | Reprendre J+3, J+7, J+14, J+30 ; la dernière est une alerte interne |
| Paiement par tranches | 20 / 40 / 40 (FTMA) | acompte 30 à 40 %, puis 40 %, puis 30 % selon le secteur | **À trancher** ; le moteur doit permettre le réglage par contrat |
| Dossier client | 10 dossiers numérotés (FTMA) | 9 sous-dossiers | Adopter les 10 dossiers numérotés de FTMA |
| Identifiant d'un document | `FT-TYPE-ANNÉE-NUMÉRO` (FTMA) | `FT-CE-2026-0001`, même logique | Conserver ; ajouter `FT-PC-AAAA-NNNNN` pour les pièces comptables |
| Nom de fichier | `AAAA-MM-JJ_RÉF_TYPE_ENTITÉ_VERSION` (FTMA) | `AAAA-MM-JJ_type_tiers_montant` (plan d'archivage) | Une seule règle : `AAAA-MM-JJ_FT-PC-AAAA-NNNNN_type_tiers_montant.pdf` |
| Conservation des pièces comptables | À confirmer avec le comptable | 3 ans retenus pour le courrier | À ma connaissance, l'OHADA prévoit 10 ans pour les pièces comptables : **à faire confirmer** |

Le numéro de pièce `2025-0314` du plan d'origine ressemble à une date et risque de se répéter deux fois le même jour. Un compteur séquentiel par année règle le problème.

## 5. Module 1 — Archivage comptable (échéance 31 octobre 2026)

### 5.1 Objectif
Retrouver, pour chaque chiffre des états financiers des trois derniers exercices, la pièce qui le justifie, et alimenter l'ERP : chaque écriture saisie renvoie à une pièce classée.

### 5.2 Périmètre
Priorité pour le 31 octobre : factures fournisseurs, reçus de caisse, suivis d'encaissements, pièces de sous-traitance, pour les exercices en cours et les deux précédents.

Pour que chaque chiffre des états financiers ait sa pièce, l'inventaire couvre aussi, et la Direction décide ce qui entre avant l'échéance : relevés bancaires et rapprochements (`5_Banque`), factures émises et situations (`6_Ventes`), paie et déclarations sociales (`7_Paie`), déclarations fiscales (`8_Fiscal`), contrats, marchés, cautions (`9_Contrats`), immobilisations (`10_Immobilisations`), stock (`11_Stock`). Les PDF produits par l'ERP (factures, situations, bons) sont archivés et indexés automatiquement.

### 5.3 Prérequis
| Prérequis | Pourquoi | Responsable | Statut |
|---|---|---|---|
| Règles de classement validées (§4) | Figées avant le premier fichier | Direction | À faire |
| Inventaire des pièces par année, tous types du §5.2 | Estimer la charge et repérer les manques | Comptable | À faire |
| État des lieux comptable et méthode de reprise des écritures | Savoir où sont les trois exercices et comment ils entrent dans l'ERP | Comptable, développeur | À faire |
| Première copie hors site vérifiée | Règle des trois copies | Développeur | À faire |
| Formation du comptable et de l'aide au tri | Éviter les erreurs dès le premier jour | Développeur | À faire |
| Outil de tri réglé et testé sur 50 pièces | Éviter de refaire le tri en masse | Développeur | À faire |
| Emplacement unique de l'archive | Pas de doublons | Développeur et Direction | À décider |
| Stockage de la base de l'ERP fiable | Volume persistant, sinon perte au redémarrage | Développeur | À vérifier |
| Sauvegarde restaurée avec un fichier d'essai | Une sauvegarde jamais restaurée n'est pas une sauvegarde | Développeur | À faire |
| Périmètre de l'ERP figé : champ `piece_id` et écran d'ouverture de pièce | Tenir l'échéance | Développeur | À faire |
| Durée de conservation confirmée | Aucune destruction avant | Comptable et Direction | À faire |

### 5.4 Besoins techniques
- Un scanner ou un smartphone avec application de scan, résolution suffisante pour lire les montants.
- Un ordinateur avec assez d'espace disque pour trois ans de pièces, après l'inventaire.
- Un emplacement principal unique pour les fichiers : serveur, stockage Google Cloud ou Drive, à choisir et à capaciter.
- La table `pieces` dans l'ERP, avec un identifiant unique jamais réutilisé.
- Un onduleur et une connexion fiable pendant la numérisation et les sauvegardes.
- Des droits de lecture seule pour la consultation et d'écriture réservés à ceux qui classent.

### 5.5 Besoins non techniques
- Toutes les pièces papier réunies au même endroit, avec l'autorisation de les manipuler.
- Des plages fixes dans la journée : le matin pour l'archivage, l'après-midi pour l'ERP.
- Une personne qui valide les règles et contrôle un échantillon de pièces saisies.
- Une aide au tri pendant les deux semaines les plus chargées.
- Une règle pour les pièces manquantes : demande de duplicata au fournisseur, ou attestation interne signée par la Direction.
- Une liste nominative des personnes autorisées à consulter l'archive.

### 5.6 Index des pièces
| Champ | Contenu | Exemple |
|---|---|---|
| `id_piece` | Identifiant unique, jamais réutilisé | FT-PC-2025-00017 |
| `date_piece` | Date figurant sur la pièce | 2025-03-14 |
| `type` | Facture fournisseur, reçu de caisse, encaissement, sous-traitance | Facture fournisseur |
| `tiers` | Fournisseur, client ou sous-traitant | |
| `montant_fcfa` | Montant en FCFA, sans séparateur | 450000 |
| `chemin` | Emplacement du fichier | Archive/2025/1_Factures-fournisseurs/03_Mars/ |
| `empreinte` | Empreinte du fichier, pour détecter une modification | |
| `statut` | À trier, classée, saisie dans l'ERP, contrôlée | Classée |
| `ref_ecriture` | Numéro de l'écriture qui cite la pièce | Vide tant que non saisie |

### 5.7 Critères d'acceptation, mesurables
- 100 % des pièces de l'inventaire sont classées, ou notées « manquante » avec sa règle de traitement.
- 100 % des écritures des trois exercices citent une pièce, ou une pièce manquante déclarée.
- Contrôle inverse : aucune pièce « saisie dans l'ERP » sans écriture, aucune écriture sans pièce.
- Un échantillon de 30 pièces par année est retrouvé en moins de deux minutes depuis l'état financier.
- Une sauvegarde est restaurée avec succès avant l'archivage en masse, puis une dernière fois le 31 octobre.
- Aucun identifiant de pièce n'apparaît deux fois.
- Le solde de chaque compte bancaire est rapproché avec le relevé à la clôture de chaque exercice.

### 5.8 Indicateurs de suivi hebdomadaire
Nombre de pièces collectées, triées, classées, saisies, contrôlées ; pièces manquantes ; écritures sans pièce ; temps moyen de traitement d'une pièce.

## 6. Module 2 — Mise en ligne de l'ERP (condition du module 1)

Aujourd'hui l'ERP ne tourne qu'en local, et son serveur s'arrête quand la session se ferme. Tout est préparé : `DEPLOY.md`, page de santé `/healthz`, configuration Coolify. Restent deux étapes :
1. Tester l'image Docker sur le poste après démarrage de Docker Desktop.
2. Installer l'application sur le serveur Hostinger avec Coolify, avec un **volume persistant** pour la base et pour les fichiers de l'archive.

Contrôles avant d'archiver en masse :
- Redémarrer l'application : la base et les fichiers sont toujours là.
- Restaurer une sauvegarde sur une instance de test.
- Vérifier que les secrets sont lus dans l'environnement, pas dans le code.
- Obtenir l'accord de la Direction avant la mise en ligne.

Les écritures de stock (comptes 31 et 603) et la facturation électronique certifiée SFEC restent hors périmètre du 31 octobre.

## 7. Module 3 — Secrétariat numérique (novembre et décembre)

Il se construit sur le même socle d'archive. Il reprend les documents déjà rédigés : manuel de procédures du secrétariat, registre courrier et workflows, acteurs, cas d'utilisation et user stories.

| Étape | Contenu | Condition de passage |
|---|---|---|
| 0. Registre papier | Dès le 12 octobre : registre paraphé, tampon, numéros FT-CE ; le numérique reprend la série | Aucune |
| A. Registre et numérotation | Tables du registre, numéros FT-CE et FT-CS, journal d'audit, environnement de test, alertes de workflows | Règles du §4 figées |
| B. Mode ombre | Les agents classent et proposent, le secrétariat fait comme avant, on compare pendant 2 à 4 semaines | Cinq boîtes mail branchées |
| C. Classement et archivage automatiques | Agents agissant seuls au-dessus d'un seuil de confiance, file de revue en dessous | Fiabilité mesurée d'au moins 95 % sur 100 cas |
| D. Brouillons et relances | Accusés et relances préparés, envoi après validation humaine | Étape C validée |
| E. Contre-contrôle et recherche | Rapport du lundi, recherche dans l'archive | Étape D validée |

Boîtes surveillées : contact@foga-tech.com, cyril.nsaha@foga-tech.com, prince.ngoulou@foga-tech.com, fogat.technology@gmail.com, ngoulounoe5@gmail.com.

Frontière avec l'ERP : le module Chantiers de l'ERP gère déjà des courriers de chantier. Le registre du secrétariat enregistre tout courrier entrant, et l'ERP affiche les courriers rattachés à un chantier par un renvoi vers le numéro FT-CE. Il n'y a qu'un seul enregistrement par courrier.

## 8. Calendrier consolidé

| Période | Archivage comptable | ERP en ligne | Secrétariat |
|---|---|---|---|
| 10 au 12 octobre | Figer les règles, inventaire, choisir l'emplacement, régler l'outil de tri | Démarrer Docker Desktop, tester l'image | Attente |
| 13 au 15 octobre | Tester la sauvegarde ; traiter 50 pièces de bout en bout | Installer sur le serveur avec volume | Attente |
| 16 au 18 octobre | Traiter l'année la plus ancienne ; saisir les écritures avec l'identifiant de pièce | Test de redémarrage et de restauration | Attente |
| 19 au 25 octobre | Traiter les deux années suivantes | Surveillance | Attente |
| 26 au 31 octobre | Contrôler un échantillon par année ; recouper avec les encaissements ; sauvegarde finale | Sauvegarde finale | Attente |
| Novembre | Corrections, pièces manquantes | Exploitation | Étapes A et B |
| Décembre | | | Étapes C à E, selon la fiabilité mesurée |

Il reste 21 jours avant l'échéance. Le volume de pièces est inconnu : l'inventaire du week-end conditionne tout le calendrier.

## 9. Risques

| Risque | Effet | Parade |
|---|---|---|
| Volume de pièces sous-estimé | Échéance manquée | Inventaire d'abord ; prioriser les pièces qui justifient les plus gros montants |
| ERP pas en ligne à temps | Aucune écriture ne cite de pièce | Repli écrit : index local sur le poste, sauvegardé chaque soir et copié hors site, import dans l'ERP dès la mise en ligne |
| Workflow n8n en échec silencieux | Un mail non enregistré passe inaperçu | File d'erreurs, alerte, reprise ; contre-contrôle du lundi |
| Périmètre des pièces trop étroit | Des chiffres des états financiers sans justificatif | Inventaire étendu ; décision de la Direction sur ce qui entre avant le 31 octobre |
| Perte de la base sans volume persistant | Perte de l'index et des écritures | Volume obligatoire ; test de redémarrage avant archivage en masse |
| Règles contradictoires | Travail refait | Décision de la Direction sur le §4 avant le tri en masse |
| Durée de conservation erronée | Destruction illégale ou conservation inutile | Confirmation de l'expert-comptable ; aucune destruction avant |
| Un seul développeur pour tous les modules | Retard, erreurs | Ne mener que les modules 1 et 2 jusqu'au 31 octobre |
| Pièces manquantes | Écritures sans justificatif | Règle du duplicata ou de l'attestation interne, validée par la Direction |
| Coupures d'électricité et de réseau | Perte de saisie | Onduleur, saisie locale, synchronisation différée |
| Données sensibles envoyées à une IA externe | Fuite de données | Décision de la Direction : service à conservation nulle, masquage ou modèle local |
| Mail piégé qui manipule un agent | Action non voulue | Les agents de lecture ne peuvent ni envoyer ni supprimer ; validation humaine de tout envoi |

## 10. Budget

Postes déjà cités dans votre note budgétaire :
- Claude Max, 100 USD par mois, à comparer avec Claude Pro selon l'usage réel.
- Outil de tri, dépôt provisionnel de 10 000 FCFA.
- Google Cloud Platform, 11 883 FCFA par an.

À chiffrer avant la présentation : disque externe de sauvegarde, onduleur, scanner s'il n'existe pas, temps d'aide au tri, serveur ou volume supplémentaire. Aucun chiffre n'est inventé ici.

## 11. Responsabilités

| Rôle | Responsabilité dans le programme | Nom |
|---|---|---|
| Direction | Décisions du §1, validation de la mise en ligne, signature des attestations de pièces manquantes | À renseigner |
| Responsable de validation | Règles de classement, contrôle d'échantillon | À renseigner |
| Comptable | Inventaire, état des lieux comptable, saisie des écritures avec identifiant de pièce, rapprochement bancaire, contrôle inverse | À renseigner |
| Développeur | ERP, table des pièces, mise en ligne, sauvegardes, workflows | À renseigner |
| Aide au tri | Numérisation et tri aux semaines chargées | À renseigner |
| Secrétariat | Courrier, mails, registre à partir de novembre | À renseigner |

## 12. Décisions et questions ouvertes

1. **Jeu de règles de référence** : quel jeu fait foi pour les délais, les tranches de paiement et l'arborescence (§4) ?
2. **Responsable de validation** : qui valide les règles de classement et contrôle les échantillons ?
3. **Conservation** : durée applicable aux pièces comptables au Congo, confirmée par l'expert-comptable.
4. **Mise en ligne de l'ERP** : accord de la Direction, serveur et volume.
5. **IA externe** : le contenu des documents peut-il passer par un service externe, ou tout reste-t-il sur le serveur de l'entreprise ?
6. **Outil de tri** : confirmer ce qu'est « Jev » (un outil ou une personne) et son état de réglage.
7. **SFP Flotte** : quelle place lui donner face aux procédures de location et de maintenance d'engins prévues dans FTMA ? Les deux se recoupent.
8. **Pièces du plan d'origine** : où se trouvent physiquement les pièces, combien par année, et à quelle date le dernier lot sera disponible ?
9. **Consultation de l'archive** : d'autres personnes que le développeur doivent-elles pouvoir la consulter ?
