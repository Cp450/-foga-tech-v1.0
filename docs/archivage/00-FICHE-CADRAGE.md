# Archivage comptable — Fiche de cadrage de la conception

Version 0.1 du 11 octobre 2026. Fiche commune remise à chaque agent de la chaîne de conception. Elle fixe le périmètre, les décisions déjà prises, les faits établis et les hypothèses. Un agent qui trouve une règle manquante le signale ; il ne l'invente pas.

## 1. Objectif
Retrouver, pour chaque chiffre des états financiers des trois derniers exercices de Foga-Tech International (entreprise de BTP à Brazzaville, Congo), la pièce qui le justifie. Chaque écriture comptable doit citer l'identifiant d'une pièce classée. Échéance du chantier initial : samedi 31 octobre 2026.

## 2. Décisions prises par l'utilisateur (11 octobre 2026)
| Sujet | Décision |
|---|---|
| Périmètre de cette conception | **Archivage comptable seul** (pas le secrétariat, pas les autres modules) |
| Plateforme | **n8n + NocoDB**, déjà en place sur le serveur VPS Hostinger (KVM2) de l'entreprise |
| Méthode | Chaîne d'agents : architecte, testeur, relecteur senior, sécurité ; l'orchestrateur intègre |

## 3. Faits établis
- **NocoDB a perdu ses données en juin 2026** faute de volume de stockage persistant sur le serveur. Ce défaut doit être corrigé avant tout usage pour l'archive.
- Le site web (dépôt `-foga-tech-v1.0`) utilise déjà NocoDB (`api/lib/nocodb.js`, API v2, en-tête `xc-token`) et un webhook n8n (`api/routes/devis.js`).
- **ERP SFP Suite BTP** : application Python/Flask, base SQLite, comptabilité SYSCOHADA (journaux VT, AC, BQ, CA ; grand livre ; balance ; bilan). Tout flux d'argent passe par un point d'écriture unique `comptabilisation.py`. Journal d'audit, règle des quatre yeux, sauvegarde quotidienne à 2 h. **Pas encore en ligne** (tourne en local sur le poste du développeur). **Le code de l'ERP n'est pas accessible** à cette conception : tout ce qui touche l'ERP est un contrat d'interface à confirmer.
- Le développement est fait par **une seule personne** (le développeur), aidée par un comptable et une aide au tri à désigner.
- Réseau et électricité instables : coupures possibles.
- Devise FCFA (XAF), montants entiers, fuseau Africa/Brazzaville.

## 4. Règles déjà proposées (programme d'exécution v0.2)
- Types de pièces prioritaires : `1_Factures-fournisseurs`, `2_Recus-de-caisse`, `3_Encaissements`, `4_Sous-traitance`. Types à inventorier ensuite : `5_Banque`, `6_Ventes`, `7_Paie`, `8_Fiscal`, `9_Contrats`, `10_Immobilisations`, `11_Stock`.
- Arborescence : `Archive/AAAA/N_Type/MM_Mois/` (exemple `Archive/2025/1_Factures-fournisseurs/03_Mars/`).
- Identifiant de pièce : `FT-PC-AAAA-NNNNN`, compteur séquentiel par année, **jamais réutilisé**.
- Nom de fichier : `AAAA-MM-JJ_FT-PC-AAAA-NNNNN_type_tiers_montant.pdf` (date de la pièce, montant en FCFA sans séparateur).
- Champs de l'index : `id_piece`, `date_piece`, `type`, `tiers`, `montant_fcfa`, `chemin`, `empreinte`, `statut` (À trier, Classée, Saisie dans l'ERP, Contrôlée ; plus Manquante), `ref_ecriture`.
- Sauvegarde : trois copies sur deux supports dont une hors site ; restauration testée avant l'archivage en masse.
- Pièce manquante : duplicata demandé au fournisseur, ou attestation interne signée par la Direction.

## 5. Critères d'acceptation du chantier
1. 100 % des pièces de l'inventaire classées, ou déclarées manquantes avec leur traitement.
2. 100 % des écritures des trois exercices citent une pièce, ou une pièce manquante déclarée.
3. Contrôles inverses : aucune pièce « saisie » sans écriture ; aucune écriture sans pièce.
4. Échantillon de 30 pièces par année retrouvé en moins de 2 minutes depuis l'état financier.
5. Sauvegarde restaurée avant l'archivage en masse et le 30 octobre.
6. Aucun identifiant de pièce en double.
7. Solde de chaque compte bancaire rapproché avec le relevé à la clôture de chaque exercice.

## 6. User stories concernées
US-ARC-01 à US-ARC-11 dans `docs/USER-STORIES-USE-CASES.md` (section 6.9). Également US-SYS-08 (alerte d'échec de workflow), US-SYS-10 (environnement de test), US-SYS-11 (export), US-DIR-05 (conservation).

## 7. Calendrier imposé (jalons v0.2, `docs/programme/JALONS-EXECUTION.md`)
lun 12 oct décisions ; mar 13 oct règles figées, inventaire, état des lieux comptable ; mer 14 oct 50 pièces d'essai et restauration ; ven 16 oct go ou no-go ; 14 au 23 oct archivage en masse ; 28 oct contrôles ; 30 oct sauvegarde finale ; 31 oct remise.

## 8. Points non décidés (à traiter comme hypothèses explicites)
- **Intelligence artificielle externe** : non autorisée à ce jour. La conception doit fonctionner **sans IA** ; une extraction assistée par IA peut être prévue comme option désactivable.
- **Durée de conservation** des pièces comptables : à confirmer par l'expert-comptable (à notre connaissance l'OHADA prévoit 10 ans ; non vérifié).
- **Outil de tri « Jev »** : nature inconnue (outil payant, dépôt de 10 000 FCFA). La conception ne doit pas en dépendre.
- **Emplacement des fichiers** : disque du serveur, Google Cloud Storage (abonnement cité 11 883 FCFA/an) ou Google Drive. À trancher par la conception (ADR).
- **Lien avec l'ERP** : on ignore si l'ERP a déjà un champ « numéro de pièce » sur ses écritures et s'il sait exporter ses écritures. À poser comme contrat d'interface avec deux options.
- **Volume de pièces** : inconnu jusqu'à l'inventaire du 13 octobre.

## 9. Sources à lire
- `docs/programme/PROGRAMME-EXECUTION.md` (§3 à §6, §9)
- `docs/programme/JALONS-EXECUTION.md`
- `docs/programme/ANALYSE-DES-MANQUES.md` (§3, §4, §5.1, §5.6)
- `docs/USER-STORIES-USE-CASES.md` (§6.9, §6.14)
- `api/lib/nocodb.js`, `api/routes/devis.js`, `docs/DEPLOY-KVM2.md` (contexte technique existant)
