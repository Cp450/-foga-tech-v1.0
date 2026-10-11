# Archivage comptable — Plan de recette

Version 0.1 du 11 octobre 2026. Auteur : testeur de la chaîne de conception. Écrit à partir des seuls besoins (fiche de cadrage, user stories, programme d'exécution, jalons), sans lire la conception ni le backlog. Cette recette servira ensuite à juger la conception et le développement. Elle ne suppose aucune plateforme (la cible est n8n et NocoDB) ni aucune structure de données particulière.

Total : **186 cas** (67 bloquants, 96 majeurs, 23 mineurs). **57 cas** portent un résultat « à fixer » faute de règle ; les 32 règles manquantes sont listées au §7.

## 1. Objet et principes

### 1.1 Objet
Vérifier que le système d'archivage comptable de Foga-Tech International tient les besoins du chantier : retrouver, pour chaque chiffre des états financiers des trois derniers exercices, la pièce qui le justifie ; chaque écriture cite une pièce classée ou une pièce manquante déclarée ; rien ne se perd, ne se duplique ni ne se modifie sans trace. Échéance du chantier : samedi 31 octobre 2026.

### 1.2 Principes
1. **Test d'abord.** Chaque résultat attendu vient d'un besoin écrit (story, critère, programme). Un cas décrit un comportement observable, jamais une implémentation. Si la solution retenue rend un cas inapplicable, on corrige la solution ou on fait approuver par écrit l'écart, on ne réécrit pas le cas pour le faire passer.
2. **Règle manquante = cas non conclu.** Quand le besoin ne dit pas quel est le bon résultat, le cas porte « À fixer — règle manquante : … (Qnn) ». Le cas reste à l'état « Bloqué (règle) » tant que la Direction ou le responsable de validation n'a pas tranché par écrit. Les questions sont au §7.
3. **Données fictives.** Toutes les données d'essai (tiers, montants, pièces, comptes, utilisateurs) sont inventées. Ce document ne contient aucune donnée réelle ; toute ressemblance avec une entreprise existante est fortuite. Les fichiers d'essai sont fabriqués par script (PDF générés), marqués « SPÉCIMEN » dans leur contenu.
4. **Environnements.** « T » = environnement de test isolé (US-SYS-10) : compteur, base, fichiers et sauvegardes séparés de la production. « P » = production. « T+P » = les deux. Les pièces d'essai ne doivent pas entrer en production, car les identifiants ne sont jamais réutilisés et rien ne se supprime : les cas « P » sont limités à ce qui ne peut pas se prouver en test (persistance, restauration, copie hors site, tableau de bord réel, contrôles finaux). Marquage et retrait des essais en production : Q26.
5. **Exécutants.** Un cas est exécuté par la personne dont c'est le rôle, jamais seulement par le développeur : aide au tri (dépôts, lots), comptable (enregistrement, écritures, rapprochement), responsable de validation (rapports, échantillon, contrôles), Direction (démonstration, dérogations, constat des restaurations). Le développeur exécute les cas techniques (coupures, sauvegardes, accès direct à la base) en présence d'un témoin.
6. **Preuves.** Chaque exécution est consignée au registre de recette : numéro du cas, date et heure, exécutant, version du système, résultat (Passé, Échec, Bloqué par règle, Non exécuté), preuve (capture, export, chronos signés), numéro d'anomalie.
7. **Gravité.** *Bloquant* : perte ou altération d'une pièce ou de l'index, identifiant en double, contrôle inverse en défaut, droit contourné, sauvegarde non restaurable, écriture sans pièce acceptée, ou tout critère d'acceptation de la fiche mis en échec. *Majeur* : fonction attendue dégradée ou contournable à la main, ou règle à fixer sans risque immédiat de perte. *Mineur* : confort, présentation, cas rare sans perte.
8. **Rejeu et non-régression.** Toute correction d'un cas bloquant ou majeur entraîne le rejeu de ce cas et des cas voisins du même groupe.
9. **Sans IA externe.** L'intelligence artificielle externe n'est pas autorisée (fiche §8). Le parcours complet doit fonctionner sans elle (voir le cas sur le trafic sortant).

### 1.3 Hypothèses de travail (à confirmer, signalées dans les cas)
- Exercice = année civile ; les trois exercices sont 2024, 2025 et 2026 (en cours) (Q04).
- Fuseau Africa/Brazzaville, FCFA, montants entiers.
- Le support des fichiers n'est pas décidé (disque du serveur, Google Cloud Storage, Drive) : les cas ne le supposent pas ; ceux qui concernent un stockage distant sont conditionnels.

## 2. Jeu de données d'essai à préparer

À préparer le 13 octobre (après le gel des règles, J04) et à faire valider par le comptable. Les montants sont en FCFA. Abréviations : FF = facture fournisseur, RC = reçu de caisse, ENC = encaissement, ST = sous-traitance, REL = relevé bancaire.

### 2.1 Pièces fictives
| Code | Type | Date de la pièce | Tiers fictif | Montant | Particularité et usage |
|---|---|---|---|---|---|
| P01 | FF | 2025-03-14 | Ets Mabiala & Fils | 450000 | Cas nominal |
| P02 | FF | 2024-12-31 | Quincaillerie L'Étoile du Congo | 1250000 | Dernier jour d'exercice |
| P03 | FF | 2025-01-01 | Société Générale de Béton / Nord | 87500 | Premier jour d'exercice, barre oblique |
| P04 | FF | 2024-02-29 | Bâtiment-Équipement Moukila SARL | 15000 | 29 février d'une année bissextile |
| P05 | FF | 2026-06-10 | Cimenterie Océan SA | 999999999 | Montant à 9 chiffres |
| P06 | FF | 2025-07-02 | Transports Mbéri | 0 | Montant zéro explicite |
| P07 | RC | 2025-05-20 | Café Chez Maman Ngoma | 150 | Petit montant ; sert de « pièce Saisie sans écriture » (PW-1) |
| P08 | RC | 2026-02-03 | Papeterie Élan | 1 | Montant minimal ; sert de « pièce Classée jamais citée » (PW-2) |
| P09 | ENC | 2025-09-30 | Maître d'Ouvrage & Associés / Lot 2 | 12000000 | Apostrophe, « & », barre oblique |
| P10 | ST | 2024-08-15 | Électricité Mpila Étoile | 3750000 | Accents |
| P11 | FF | 2024-11-05 | Fournitures Océane | (aucun) | Pièce sans montant (bon de livraison) |
| P12 | FF | (aucune) | Ets Kimbouala | 275000 | Pièce sans date |
| P13 | FF | 2025-10-10 | Matériel Import Lyon SARL | 2300 EUR | Devise étrangère |
| P14 | FF | 2025-04-18 | (illisible) | (illisible) | Scan flou, tiers et montant illisibles |
| P15 | FF | = P01 | = P01 | = P01 | Doublon exact : fichier identique octet pour octet, autre nom |
| P16 | FF | = P01 | = P01 | = P01 | Quasi-doublon : même pièce rescannée (300 ppp couleur contre 150 ppp gris) |
| P17 | ST | 2026-03-01 | Sous-traitance Électrique Œuvre & Co | 8400000 | PDF de 12 pages ; ligature « Œ » |
| P18 | RC | 2026-04-12 | Station Mbou | 32500 | Photo JPG prise au smartphone |
| P19 | — | — | — | — | Fichier de 0 octet |
| P20 | — | — | — | — | Fichier .docx |
| P21 | FF | 2025-06-06 | Ets Test Protégé | 90000 | PDF protégé par mot de passe |
| P22 | FF | 2025-08-08 | (nom de 200 caractères) | 600000 | Tiers très long |
| P23 | FF | 2023-06-15 | Ets Ancien Exercice | 100000 | Hors des trois exercices |
| P24 | FF | 2026-12-15 | Ets Futur | 50000 | Date dans le futur |
| P25 | FF | 2025-02-29 | Ets Date Impossible | 80000 | Jour inexistant |
| P26 | ENC | 2025-12-31 | Client Fictif Nord | 4100000 | Encaissement de clôture (pour le rapprochement) ; reste « À trier » dans un cas |
| P27 | REL | 2024-12-31 | Banque Fictive, compte BQ-A | — | Relevé de décembre 2024 |
| P28 | FF | 2025-11-20 | Ets Centimes | 1250,50 | Montant décimal |
| P29 | FF | 2025-11-21 | Ets Avoir | -50000 | Avoir (montant négatif) |
| P30 | FF | 2026-01-15 | Ets Gros Fichier | 700000 | Fichier de 60 Mo |
| P31 | FF | 2025-03-14 | Ets Mabiala & Fils | 450000 | Autre facture réelle, même tiers, date et montant que P01, fichier différent |

### 2.2 Lots
- **LOT-A** : les 50 pièces d'essai du 14 octobre (J06) = P01 à P18, P22 à P26 et P28 à P31 utiles, plus des pièces ordinaires N01 à N19, répartis sur les 4 types prioritaires et les années 2024 à 2026.
- **LOT-1** : N01 à N10, 10 PDF valides. **LOT-C** : 200 PDF valides. **LOT-D** : 8 PDF dans 2 sous-dossiers plus un .docx. **LOT-E** : 10 valides, P19, P20 et un doublon de P01.
- Deux paquets de 20 fichiers valides et un paquet de 100 (script) pour les cas de concurrence.
- Deux fichiers « scan001.pdf » de contenus différents.

### 2.3 Écritures et déclarations d'essai (jeu isolé en test)
- 20 écritures normales citant 20 pièces classées (dont E01 qui cite P01).
- **EW-1** (2025) : écriture sans pièce ni motif, injectée par import ou en base. **EW-2** (2025) : cite FT-PC-2025-99999, inexistant. **EW-3** (2024) : motif « pièce manquante » sans déclaration. **EW-4** (2024) : cite la pièce manquante déclarée **MQ-1**.
- **PW-1** : P07 au statut « Saisie dans l'ERP » sans écriture. **PW-2** : P08 « Classée », jamais citée.
- Résultat attendu des rapports sur ce jeu : écritures sans pièce = EW-1, EW-2 (2025) et EW-3 (2024) ; pièces sans écriture = PW-1, PW-2.

### 2.4 Comptes bancaires fictifs
| Compte | Situation plantée |
|---|---|
| BQ-A (courant) | Déc. 2024 : solde ERP = relevé = 185 400 000, rapproché. Juin 2025 : frais bancaires de 15 000 non comptabilisés (écart 15 000). Sept. 2025 : chèque de 400 000 émis le 29/09, débité le 03/10. Déc. 2025 : crédit du 31/12 valeur 02/01. |
| BQ-B (chantier) | Mars 2025 : 450 000 saisi au lieu de 540 000 (écart 90 000). Juillet 2025 : relevé manquant. Clôturé le 30/09/2025. |
Des relevés mensuels fictifs couvrent 2024 et 2025 pour les deux comptes.

### 2.5 Utilisateurs d'essai
U-TRI (aide au tri), U-CPT (comptable), U-VAL (responsable de validation), U-DIR (Direction), U-EXT (compte authentifié hors liste nominative), anonyme (non authentifié), DEV (développeur). Un compte par personne, nominatif.

### 2.6 Outils d'essai
Script de génération des PDF (avec empreintes connues), script de dépôts parallèles, outil de calcul d'empreinte indépendant du système, chronomètre, feuille de chronos, registre de recette, accès à la base en lecture pour les contrôles de comptage.

## 3. Cas de recette

Colonnes : **Couvre** = story ou critère (C1 à C7 = critères d'acceptation de la fiche) ; **Prio** = B bloquant, M majeur, m mineur ; **Vague · Env** = vague de recette (§6) et environnement (T test, P production). Les abréviations d'utilisateurs sont au §2.5. Les cas renvoient à des codes de données du §2 (P01, EW-1, BQ-A…).

### A. Dépôt, tri et enregistrement (US-ARC-06, US-ARC-01)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-001 | ARC-06 | U-TRI connectée ; file « À trier » vide ; LOT-1 = 10 PDF valides (N01 à N10) | Déposer le dossier LOT-1 | 10 pièces visibles dans « À trier » avec le statut « À trier » ; compteur du lot = 10 ; aucun fichier perdu ni en double ; empreinte calculée pour chacune | B | R1 · T |
| REC-002 | ARC-06 | Dossier de dépôt vide | Lancer le dépôt | Aucune pièce créée ; compteur = 0 ; message ou code d'erreur compréhensible, pas d'erreur technique brute | m | R1 · T |
| REC-003 | ARC-06, C6 | LOT-C = 200 fichiers valides | Déposer LOT-C ; chronométrer | 200 pièces, compteur = 200, aucune perte, aucune interruption ; durée totale et durée moyenne par pièce consignées (alimente J06c) | M | R3 · T |
| REC-004 | ARC-06, C6 | P01 déjà classée ; P15 = copie octet pour octet de P01 sous un autre nom | U-TRI dépose P15 | P15 détectée comme doublon par empreinte ; aucune nouvelle pièce créée ; le message cite l'identifiant de P01 ; le compteur du lot compte 1 doublon | B | R1 · T |
| REC-005 | ARC-06, C6 | P01 et P15 dans le même lot de 5 fichiers | Déposer le lot | Une seule des deux est retenue ; l'autre est signalée comme doublon ; les 3 autres fichiers sont enregistrés normalement | B | R1 · T |
| REC-006 | ARC-06, ARC-01 | P01 classée ; P16 = même pièce rescannée (résolution et couleurs différentes, octets différents) | Déposer P16 | L'empreinte ne détecte pas P16 comme doublon. À fixer — règle manquante : traitement d'un quasi-doublon (alerte de similarité sur date + tiers + montant ? blocage ? décision humaine ?) (Q11) | M | R1 · T |
| REC-007 | ARC-06, ARC-01 | P01 classée ; P31 = autre facture réelle, même tiers, même date, même montant, fichier différent | Déposer et enregistrer P31 | P31 n'est pas rejetée comme doublon ; elle reçoit son propre identifiant ; une éventuelle alerte de ressemblance ne bloque pas l'enregistrement | M | R1 · T |
| REC-008 | ARC-06, ARC-01 | Deux lots déposés par deux personnes, chacun contenant un fichier « scan001.pdf » au contenu différent | Déposer les deux lots | Deux pièces distinctes ; aucun fichier écrasé ; le nom d'origine n'est pas l'identité de la pièce | B | R1 · T |
| REC-009 | ARC-06 | LOT-D = dossier avec 2 sous-dossiers, 8 PDF valides, 1 fichier .docx | Déposer LOT-D | Les 8 PDF sont enregistrés quel que soit le sous-dossier ; le .docx est listé comme rejeté avec son motif ; aucun fichier ne disparaît sans trace | M | R1 · T |
| REC-010 | ARC-06 | LOT-E = 10 valides, 2 invalides (P19 et P20), 1 doublon de P01 | Déposer LOT-E | 10 pièces créées ; 2 rejets avec motif ; 1 doublon signalé ; compteur du lot détaille 13 reçus / 10 acceptés / 2 rejetés / 1 doublon ; les rejets ne bloquent pas les valides | M | R1 · T |
| REC-011 | ARC-01 | U-CPT ; P01 déposée | Enregistrer P01 : date 2025-03-14, type Facture fournisseur, tiers « Ets Mabiala & Fils », montant 450000 | Identifiant FT-PC-AAAA-NNNNN attribué automatiquement (sans saisie humaine) ; tous les champs de l'index renseignés ; fichier joint ; chemin conforme à Archive/2025/1_Factures-fournisseurs/03_Mars/ | B | R1 · T |
| REC-012 | ARC-01 | P01 en cours d'enregistrement | Laisser vide successivement : date, type, tiers, montant, fichier ; valider à chaque fois | Chaque tentative est refusée avec un code ou un message nommant le champ manquant ; aucune ligne partielle n'est créée dans l'index | B | R1 · T |
| REC-013 | ARC-01 | Une pièce prête pour chacun des 4 types | Enregistrer 1 pièce par type (factures fournisseurs, reçus de caisse, encaissements, sous-traitance) | Chaque pièce est rangée dans le dossier 1_, 2_, 3_ ou 4_ correspondant ; types libellés comme dans la règle figée | M | R1 · T |
| REC-014 | ARC-01 | 12 pièces, une datée dans chaque mois de 2025 | Enregistrer et lister les chemins | Dossiers 01_Janvier à 12_Décembre exactement comme la règle figée (accents compris) ; aucun mois mal rangé | m | R1 · T |
| REC-015 | ARC-01, C6 | Toutes les pièces classées du jeu d'essai | Contrôler chaque nom de fichier par un motif AAAA-MM-JJ_FT-PC-AAAA-NNNNN_type_tiers_montant.pdf | 100 % conformes ; la date du nom est la date de la pièce ; l'identifiant du nom est celui de l'index ; montant sans séparateur | M | R1 · T |
| REC-016 | ARC-01, C5 | 10 fichiers classés | Recalculer l'empreinte avec un outil indépendant ; comparer à l'index ; copier le fichier et recalculer | Empreintes identiques à l'index pour 10 sur 10 ; la copie conserve la même empreinte | B | R1 · T |
| REC-017 | ARC-01 | Pièce « À trier » avec un champ obligatoire vide | Tenter le passage à « Classée » | Refusé avec indication du champ ; le fichier reste dans « À trier » | B | R1 · T |
| REC-018 | ARC-01 | Pièce « À trier » | Tenter le passage direct « À trier » vers « Contrôlée » | Refusé : les statuts se suivent (À trier, Classée, Saisie dans l'ERP, Contrôlée) ; tentative tracée au journal | M | R1 · T |
| REC-019 | ARC-01 | P02 : facture du 31 décembre 2024 | Enregistrer | Rangée dans Archive/2024/…/12_Décembre ; rattachée à l'exercice 2024 ; À fixer — règle manquante : confirmer que l'exercice est l'année civile (Q04) | B | R1 · T |
| REC-020 | ARC-01 | P03 : facture du 1er janvier 2025 | Enregistrer | Rangée dans Archive/2025/…/01_Janvier ; distincte de P02 ; jamais dans l'exercice 2024 | B | R1 · T |
| REC-021 | ARC-01 | P04 : facture du 29 février 2024 (année bissextile) | Enregistrer | Acceptée ; dossier 02_Février ; nom de fichier commençant par 2024-02-29_ | m | R1 · T |
| REC-022 | ARC-01 | P25 : pièce datée du 29 février 2025 (jour inexistant) | Saisir la date | Refusée avec code d'erreur de date invalide ; rien n'est créé | M | R1 · T |
| REC-023 | ARC-01 | P12 : pièce sans date ; P24 : date future ; P23 : année 2023 | Enregistrer chacune | P12 : refus du champ date vide (obligatoire). Traitement de substitution : À fixer — règle manquante : pièce sans date (Q06) ; P24 et P23 : À fixer — règle manquante : dates futures et hors des trois exercices (Q07) | M | R1 · T |
| REC-024 | ARC-01 | P06 : montant 0 | Enregistrer avec montant 0 explicite | Acceptée ; montant 0 conservé comme 0 (différent de vide) ; nom de fichier terminé par _0.pdf | M | R1 · T |
| REC-025 | ARC-01 | P11 : pièce sans montant | Enregistrer en laissant le montant vide | Refus avec code d'erreur nommant le champ (champ obligatoire). Traitement de ce type de pièce : À fixer — règle manquante : pièce sans montant (Q05) | M | R1 · T |
| REC-026 | ARC-01, C6 | P05 : montant 999999999 | Enregistrer ; ouvrir ; exporter le résultat | Valeur 999999999 exacte dans l'index, le nom de fichier, l'affichage et l'export ; aucune notation scientifique ni troncature ni arrondi | B | R1 · T |
| REC-027 | ARC-01 | Montants hors norme : 1000000000 ; -50000 (P29, avoir) ; 1250,50 (P28) ; « 1 250 000 », « 1.250.000 », « 1,250,000 » | Saisir chacun | Stockage final sans séparateur et en entiers. À fixer — règle manquante : plafond, négatif, décimales et séparateurs (Q08) | m | R1 · T |
| REC-028 | ARC-01 | P13 : facture de 2 300 EUR | Enregistrer | Aucune conversion silencieuse. À fixer — règle manquante : conversion en FCFA et conservation de la devise d'origine (Q09) | M | R1 · T |
| REC-029 | ARC-01, C6 | P10 : tiers « Électricité Mpila Étoile » | Enregistrer ; rechercher ; exporter | Tiers conservé à l'identique (accents compris) dans l'index, l'affichage et l'export UTF-8 ; nom de fichier ouvrable sous Windows et Linux ; identifiant intact | M | R1 · T |
| REC-030 | ARC-01, C6 | P09 : tiers « Maître d'Ouvrage & Associés / Lot 2 » | Enregistrer ; vérifier le dossier et le nom de fichier ; exporter en CSV | Pas de sous-dossier créé par la barre oblique ; aucun caractère interdit (\ / : * ? " < > /) dans le nom ; index exact ; CSV correctement échappé ; aucune injection dans le chemin. À fixer — règle manquante : transformation des caractères spéciaux (Q12) | B | R1 · T |
| REC-031 | ARC-01 | P18 (photo JPG) ; P21 (PDF protégé) ; P30 (60 Mo) | Déposer chacune | Chaque cas donne une réponse explicite (accepté ou rejeté avec motif), jamais un échec silencieux. À fixer — règle manquante : formats, conversion, taille maximale, PDF protégé (Q13) | m | R1 · T |
| REC-032 | ARC-01, ARC-06 | P19 : fichier de 0 octet ; P20 : fichier .docx | Déposer | Rejetés avec motif ; rien dans l'archive ; aucune ligne dans l'index | M | R1 · T |
| REC-033 | ARC-01 | P17 : PDF de 12 pages | Déposer et enregistrer | 12 pages conservées à l'ouverture ; empreinte conforme | m | R1 · T |
| REC-034 | ARC-01, ARC-06 | P14 : scan illisible (montant et tiers non lisibles) | Déposer ; tenter de classer | La pièce ne peut pas être classée avec des valeurs inventées. À fixer — règle manquante : statut et traitement d'une pièce illisible et lien avec le rescan (Q10) | M | R1 · T |

### B. Identifiants et concurrence (critère 6)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-035 | ARC-01, C6 | Année 2025 sans pièce | Enregistrer 10 pièces une à une | Identifiants FT-PC-2025-00001 à 00010, consécutifs, sans trou ni doublon, 5 chiffres complétés par des zéros | B | R1 · T |
| REC-036 | ARC-01, C6 | Fin 2025 et début 2026 existants | Enregistrer la première pièce de 2026 | Compteur 2026 démarre à 00001, indépendant de 2025 ; le compteur 2025 n'est pas modifié | M | R1 · T |
| REC-037 | C6, ARC-06 | U-CPT et U-TRI prêtes, 20 fichiers chacune | Lancer les deux dépôts à moins d'une seconde d'écart | 40 identifiants distincts, consécutifs, sans trou ; aucun fichier perdu ni écrasé | B | R1 · T |
| REC-038 | C6, ARC-06 | 5 dépôts de 20 fichiers lancés en parallèle par script | Lancer ; répéter 3 fois | 100 identifiants distincts et consécutifs à chaque passage ; zéro erreur de doublon ; comptage index = comptage fichiers | B | R1 · T |
| REC-039 | C6, ARC-01 | Une pièce « À trier » ouverte par U-CPT et U-TRI | Les deux enregistrent des valeurs différentes en même temps | Une seule ligne d'index ; le second reçoit un code de conflit ; le fichier n'est classé qu'une fois ; les deux tentatives sont au journal | M | R1 · T |
| REC-040 | C6, ARC-01 | Lot de 3 pièces dont une refusée (fichier vide) | Déposer, puis déposer 3 nouvelles pièces | Aucun identifiant attribué deux fois. À fixer — règle manquante : traitement d'un numéro attribué puis abandonné : trou tracé au journal ou autre (Q03) | M | R1 · T |
| REC-041 | C6, ARC-01 | Dépôt à 23h59m50 le 31 décembre et à 00h00m10 le 1er janvier (fuseau Africa/Brazzaville, horloge simulée) | Déposer deux pièces datées de ces jours | Aucun doublon ni mélange de compteurs. À fixer — règle manquante : année prise pour l'identifiant (pièce, dépôt, exercice) (Q02) | M | R1 · T |
| REC-042 | C6 | Pièces de l'environnement de test ou de production après chaque vague | Compter les identifiants distincts et le nombre de lignes d'index (requête ou rapport) | nombre d'identifiants distincts = nombre de lignes ; zéro doublon ; consigné aux dates 14, 28 et 30 octobre | B | R1 · T+P |
| REC-043 | C6, ARC-01 | Pièce classée | Tenter de modifier ou de réimposer l'identifiant par l'interface, par l'API et par un accès direct à la base | Interface et API : refus ; accès direct : modification détectée par le contrôle d'intégrité et tracée ; création avec identifiant imposé par le client : l'identifiant imposé est ignoré ou refusé | B | R1 · T |

### C. Citation de la pièce dans l'écriture (US-ARC-02, critère 2)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-044 | ARC-02, C2 | ERP en ligne ; P01 classée | Saisir une écriture citant l'identifiant de P01 | Écriture enregistrée avec l'identifiant ; P01 passe à « Saisie dans l'ERP » ; ref_ecriture renseigné | B | R2 · T |
| REC-045 | ARC-02, C2 | Saisie d'écriture | Valider sans identifiant de pièce ni motif | Refus avec code d'erreur ; aucune écriture ni écriture partielle enregistrée | B | R2 · T |
| REC-046 | ARC-02, C2 | Pièce manquante déclarée MQ-1 | Saisir une écriture avec le motif « pièce manquante » rattaché à MQ-1 | Acceptée ; le rapport « écritures sans pièce » ne la liste pas | M | R2 · T |
| REC-047 | ARC-02, C2 | Aucune déclaration de pièce manquante | Saisir une écriture avec motif « pièce manquante » sans déclaration | Selon la règle : À fixer — règle manquante : motif valable sans déclaration ? (Q14). Dans tous les cas, l'écriture figure au rapport « sans pièce » tant qu'aucune déclaration n'existe (critère 2) | M | R2 · T |
| REC-048 | ARC-02 | Écriture | Citer FT-PC-2025-99999 (inexistant) | Refus avec code d'erreur ; aucune écriture enregistrée | M | R2 · T |
| REC-049 | ARC-02, C2 | P26 au statut « À trier » (non classée) | Citer P26 | Refusé : seule une pièce classée peut être citée | B | R2 · T |
| REC-050 | ARC-02 | P01 déjà citée par E01 | Citer P01 dans une seconde écriture ; citer deux pièces dans une écriture | Comportement défini. À fixer — règle manquante : cardinalité pièce/écriture (Q14) | M | R2 · T |
| REC-051 | ARC-02 | P02 (exercice 2024) ; écriture datée 2025 ; montant d'écriture différent de la pièce | Saisir | Contrôle défini. À fixer — règle manquante : cohérence de montant et d'exercice entre pièce et écriture (Q15) | M | R2 · T |
| REC-052 | ARC-02, C3 | E01 citant P01 | Modifier l'écriture pour citer P02 à la place | Journal : ancien et nouveau lien, auteur, heure ; P01 et P02 reflètent la situation correcte aux rapports inverses. Statut de P01 : À fixer — règle manquante : retour de statut (Q16) | M | R2 · T |
| REC-053 | ARC-02, C3 | E01 citant P01 | Annuler l'écriture | Annulation tracée ; la pièce n'est jamais supprimée. Statut : À fixer — règle manquante : retour de statut après annulation (Q16) | M | R2 · T |
| REC-054 | ARC-02, C2 | Fichier d'import de 100 lignes dont 5 sans pièce ni motif (méthode de reprise) | Importer | Les 5 lignes sont rejetées ou listées comme anomalies avec leur ligne ; aucune ligne partiellement importée ; mêmes contrôles que la saisie. À fixer — règle manquante : méthode de reprise retenue (Q32) | B | R3 · T |

### D. Navigation pièce - écriture et état financier - pièce (US-ARC-03, US-ARC-08, critère 4)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-055 | ARC-03 | P01 citée par E01 | Depuis E01 ouvrir la pièce | Maximum 2 clics ; le PDF affiché a l'empreinte de P01 ; ouverture en moins de 2 secondes | B | R2 · T |
| REC-056 | ARC-03 | Idem | Depuis P01 ouvrir l'écriture | Maximum 2 clics ; l'écriture E01 affichée est la bonne ; lien cohérent dans les deux sens | M | R2 · T |
| REC-057 | ARC-03 | 20 pièces de 100 Ko à 5 Mo | Ouvrir chacune depuis son écriture, chronomètre | 20 sur 20 en moins de 2 s, réseau local normal ; temps consignés. À fixer — règle manquante : taille et réseau de référence (Q27) | M | R3 · T |
| REC-058 | ARC-03 | Fichier d'une pièce effacé sur le stockage | Ouvrir la pièce | Erreur explicite nommant l'identifiant ; pas de page blanche ni d'autre fichier servi ; anomalie signalée (voir contrôle d'intégrité) | M | R3 · T |
| REC-059 | ARC-08, C4 | Bilan 2025 ; compte fournisseurs (401) | Navigation état financier, compte, écritures, pièces | Chaque niveau s'ouvre ; la somme des écritures égale le chiffre du bilan (écart 0) ; chaque écriture ouvre sa pièce | B | R4 · T |
| REC-060 | ARC-08, C2 | Compte dont une écriture cite une pièce manquante déclarée | Naviguer | L'écriture apparaît avec la mention pièce manquante et sa déclaration ; elle n'est pas confondue avec une pièce classée | m | R4 · T |
| REC-061 | ARC-08 | Compte de plus de 500 écritures | Naviguer jusqu'aux pièces | Nombre d'écritures affiché = nombre en base ; aucune omission due à la pagination ; réponse dans un délai raisonnable ; durée consignée | M | R4 · T |
| REC-062 | ARC-08 | Bilans 2024, 2025, 2026 | Remonter un chiffre de chaque exercice | Les trois exercices sont navigables, y compris 2026 en cours | M | R4 · T |
| REC-063 | ARC-03, ARC-08 | Pièces P09, P10, P02 | Rechercher par identifiant, tiers (avec apostrophe et accent), montant, date | Chaque recherche retrouve la pièce attendue. À fixer — règle manquante : casse et accents (« electricite » trouve-t-il « Électricité » ?) (Q28) | m | R4 · T |

### E. Contrôles inverses et rapports (US-ARC-04, critères 2 et 3)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-064 | ARC-04, C3 | Jeu isolé : PW-1 (pièce « Saisie » sans écriture), PW-2 (classée jamais citée), 20 pièces citées normalement | Ouvrir le rapport « pièces sans écriture », filtre 2025 | Liste exactement PW-1 et PW-2, rien d'autre ; PW-1 marquée en incohérence de statut | B | R2 · T |
| REC-065 | ARC-04, C2 | Jeu isolé : EW-1 (sans pièce ni motif), EW-2 (pièce inexistante), EW-3 (motif sans déclaration), EW-4 (motif déclaré) | Ouvrir « écritures sans pièce », exercices 2024 puis 2025 | 2025 : EW-1 et EW-2 ; 2024 : EW-3 ; EW-4 absente ; aucun oubli ni faux positif | B | R2 · T |
| REC-066 | ARC-04, C2, C3 | Écriture injectée directement en base sans pièce, en contournant l'interface | Lancer le rapport | Elle est détectée : le contrôle ne dépend pas des blocages de la saisie | B | R3 · T |
| REC-067 | ARC-04 | Rapports 2024, 2025, 2026 et « tous exercices » | Filtrer par exercice | Chaque filtre ne contient que son exercice ; « tous » = somme des trois | m | R3 · T |
| REC-068 | ARC-04 | Rapports remplis | Exporter les deux rapports | Fichier en format ouvert (CSV ou tableur) : mêmes lignes qu'à l'écran, accents, apostrophes et montants à 9 chiffres intacts | M | R3 · T |
| REC-069 | ARC-04, C3 | Aucun écart | Ouvrir les deux rapports | Rapports vides affichés sans erreur ; export avec en-têtes seulement ; message de conformité | m | R4 · T |
| REC-070 | ARC-04, C2 | EW-1 corrigée (pièce citée) ; PW-2 citée | Relancer les rapports | Les éléments corrigés disparaissent ; correction au journal | M | R3 · T |
| REC-071 | ARC-04 | Pièce manquante déclarée citée par une écriture | Ouvrir « écritures sans pièce » | Non listée (critère 2 : pièce manquante déclarée) | m | R3 · T |
| REC-072 | ARC-04 | 300 anomalies injectées | Ouvrir et exporter | Nombre affiché = nombre injecté = nombre exporté ; pagination sans perte | M | R3 · T |

### F. Pièce manquante (US-ARC-05, critères 1 et 2)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-073 | ARC-05, C1 | U-CPT ; attestation signée par la Direction scannée | Déclarer une pièce manquante : motif, attestation jointe | Statut « Manquante » ; motif et attestation visibles ; citable par une écriture ; journal complet | B | R4 · T |
| REC-074 | ARC-05 | Déclaration | Valider sans motif | Refus avec code d'erreur | M | R4 · T |
| REC-075 | ARC-05 | Déclaration | Valider sans attestation ni preuve de demande de duplicata | Refus, ou état d'attente défini. À fixer — règle manquante : états intermédiaires et justificatifs acceptés (Q17) | M | R4 · T |
| REC-076 | ARC-05 | Duplicata demandé à un fournisseur | Déclarer avec la date et le fournisseur sollicité | Traitement « duplicata demandé » enregistré. À fixer — règle manquante : champs requis et état de la déclaration (Q17) | M | R4 · T |
| REC-077 | ARC-05, C1 | MQ-1 citée par EW-4 ; duplicata reçu | Classer le duplicata et le rattacher à MQ-1 | La pièce réelle est classée avec son identifiant ; le lien de l'écriture est conservé ou rattaché ; la déclaration reste consultable au journal | M | R4 · T |
| REC-078 | ARC-05 | Pièce manquante | Attacher une attestation illisible, vide ou au mauvais format | Refus ; l'attestation acceptée est archivée avec empreinte comme toute pièce | M | R4 · T |
| REC-079 | ARC-05, C6 | Deux déclarations créées en même temps par deux personnes | Valider | Identifiants ou références distincts, aucun doublon. À fixer — règle manquante : la déclaration reçoit-elle un identifiant FT-PC ? (Q17) | M | R4 · T |
| REC-080 | ARC-05, C1 | Inventaire : 100 pièces dont 3 manquantes déclarées | Rapprocher inventaire et index | 100 = classées + manquantes déclarées ; 0 non traité (critère 1) | B | R4 · T |

### G. Rapprochement bancaire (US-ARC-07, critère 7)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-081 | ARC-07, C7 | BQ-A décembre 2024 : solde ERP = relevé = 185 400 000 FCFA | Ouvrir l'état de rapprochement | État « rapproché », écart 0 ; solde à 9 chiffres sans débordement | B | R4 · T |
| REC-082 | ARC-07, C7 | BQ-A juin 2025 : frais bancaires de 15 000 non comptabilisés | Ouvrir l'état du mois | Écart exactement 15 000 ; ligne du relevé non appariée listée ; état « non rapproché » | B | R4 · T |
| REC-083 | ARC-07 | BQ-B mars 2025 : transposition 450 000 saisi au lieu de 540 000 | Ouvrir l'état | Écart 90 000 ; les deux lignes apparentées sont listées | M | R4 · T |
| REC-084 | ARC-07 | BQ-A septembre 2025 : chèque de 400 000 émis le 29/09, débité le 03/10 | Ouvrir l'état du mois | Écart listé comme élément en suspens. À fixer — règle manquante : traitement des éléments en suspens et critère « rapproché » (Q18) | M | R4 · T |
| REC-085 | ARC-07, C7 | BQ-B juillet 2025 : relevé absent | Ouvrir l'état | « Relevé manquant » affiché ; jamais « rapproché » ni écart 0 | B | R4 · T |
| REC-086 | ARC-07, C7 | BQ-A et BQ-B, clôtures 31/12/2024 et 31/12/2025 | Ouvrir les soldes de clôture | Un état par compte et exercice ; solde ERP égal au solde du relevé, sinon écart listé | B | R4 · T |
| REC-087 | ARC-07, C7 | BQ-A décembre 2025 : crédit du 31/12 valeur 02/01 | Ouvrir l'état | Traitement défini. À fixer — règle manquante : date d'opération ou date de valeur (Q18) | M | R4 · T |
| REC-088 | ARC-07, C7 | BQ-A premier mois de 2024 | Ouvrir l'état | Solde d'ouverture justifié. À fixer — règle manquante : source du solde d'ouverture au 1er janvier 2024 (Q18) | M | R4 · T |
| REC-089 | ARC-07 | Relevé BQ-A de déc. 2024 classé | Ouvrir l'état puis le relevé | Le relevé est une pièce identifiée, ouverte depuis l'état. À fixer — règle manquante : relevés bancaires dans le périmètre (Q30) | M | R4 · T |
| REC-090 | ARC-07 | Vue par compte et par mois | Filtrer par compte et mois ; exporter | 12 mois par compte et par exercice ; export identique à l'écran | m | R4 · T |
| REC-091 | ARC-07 | Écart de REC-082 corrigé par une écriture de frais | Relancer le rapprochement | Écart 0 ; l'ancien état et la correction restent consultables au journal | M | R4 · T |
| REC-092 | ARC-07 | État validé ; une écriture du mois modifiée ensuite | Rouvrir l'état | L'état reflète la modification ou est marqué « à revoir » ; modification tracée. À fixer — règle manquante : verrouillage d'un état validé (Q18) | M | R4 · T |

### H. Sauvegarde et restauration (critère 5)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-093 | C5 | Trois nuits consécutives écoulées | Lire le journal des sauvegardes | Une sauvegarde par nuit, statut succès, taille non nulle. À fixer — règle manquante : fréquence et heure (Q19) | m | R3 · P |
| REC-094 | C5 | Inventaire des supports | Localiser les trois copies et leurs supports ; lire la copie hors site depuis un autre poste | 3 copies, 2 supports au moins, 1 hors du lieu de travail ; copie hors site lisible depuis un autre poste (J06b) ; date de la dernière copie hors site consignée | B | R1 · P |
| REC-095 | C5 | Fichier d'essai et ligne d'index déposés | Sauvegarder ; effacer le fichier et la ligne ; restaurer dans l'environnement visé | Fichier retrouvé avec la même empreinte ; ligne d'index retrouvée (J06, 14 octobre) | B | R1 · P |
| REC-096 | C5, C6 | Archive avec au moins 50 pièces, journal, liens écriture-pièce | Restaurer la sauvegarde complète dans un environnement vierge distinct de la production | Nombre de lignes d'index et de fichiers identique ; 100 % des empreintes recalculées égales à l'index ; journal complet ; 3 liens écriture-pièce testés ; compteur d'identifiants cohérent | B | R1 · P |
| REC-097 | C5 | Archive complète après corrections du 29 octobre | Refaire REC-096 sur la sauvegarde finale, en présence de la Direction | Mêmes résultats que REC-096 ; exécutée et constatée par une personne autre que l'auteur de la sauvegarde. À fixer — règle manquante : 30 ou 31 octobre (Q20) | B | R5 · P |
| REC-098 | C5 | Restauration chronométrée | Mesurer la durée et la perte de données | Valeurs consignées. À fixer — règle manquante : objectifs RPO et RTO (Q19) | m | R1 · P |
| REC-099 | C5 | Service de l'archive en marche | Redémarrer le serveur puis le service | Base d'index, fichiers, journal et compteurs intacts (J07 ; incident NocoDB de juin 2026) | B | R1 · P |
| REC-100 | C5 | Idem | Détruire puis recréer le conteneur ou le service | Données intactes : le stockage ne dépend pas du conteneur | M | R1 · P |
| REC-101 | C5, SYS-08 | Disque de destination plein ou injoignable | Lancer une sauvegarde | Échec visible et alerte émise ; aucun « succès » affiché ; la dernière bonne sauvegarde reste intacte | M | R3 · T |
| REC-102 | C5 | Copie de sauvegarde dont un fichier est altéré | Lancer la vérification d'intégrité de la sauvegarde | Altération détectée avant toute restauration | M | R3 · T |
| REC-103 | C5 | Un fichier classé effacé par erreur | Restaurer ce seul fichier depuis la sauvegarde | Fichier retrouvé sans restaurer toute l'archive ni créer de doublon | M | R3 · T |
| REC-104 | C5, C6 | Sauvegarde S1 ; 20 pièces nouvelles ; restauration de S1 | Enregistrer une nouvelle pièce après la restauration | Aucun identifiant déjà attribué après S1 n'est réémis sans détection. À fixer — règle manquante : compteur après restauration d'une sauvegarde antérieure (Q19) | B | R3 · T |
| REC-105 | C5 | Copie hors site | Tenter d'y accéder sans identification | Accès refusé ; contenu non lisible publiquement. À fixer — règle manquante : chiffrement de la copie hors site (Q19) | M | R1 · P |

### I. Résilience, rejeu et alertes (US-SYS-08)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-106 | C6, ARC-06 | Dépôt de 50 fichiers | Couper le courant (arrêt brutal du serveur) après 25 fichiers ; redémarrer ; relancer le même lot | Chaque fichier est soit entièrement déposé et indexé, soit absent ; aucun fichier indexé sans fichier, aucun fichier sans ligne d'index ; après relance 50 pièces, 0 doublon, identifiants sans doublon ; coupure et reprise visibles au journal | B | R1 · T |
| REC-107 | C6, ARC-01 | Classement d'une pièce en cours | Couper l'alimentation entre le déplacement du fichier et la mise à jour de l'index | Au redémarrage chemin d'index = emplacement réel ; un seul exemplaire du fichier ; pièce relançable | B | R1 · T |
| REC-108 | C6, ARC-06 | Poste de l'aide au tri | Couper le réseau pendant l'envoi d'un fichier de 40 Mo, puis le rétablir | Fichier partiel jamais indexé comme valide ; message ; renvoi possible ; aucun PDF tronqué classé | M | R1 · T |
| REC-109 | C6, ARC-06 | Archive stockée à distance (si retenu par l'ADR) | Couper la liaison serveur-stockage pendant un dépôt | Dépôts en file de reprise, aucune perte, aucun doublon à la reprise ; alerte émise | M | R3 · T |
| REC-110 | C6, ARC-01 | Création d'une pièce | Couper entre l'attribution du numéro et l'enregistrement final | À la reprise aucun doublon d'identifiant ; le numéro est classé ou tracé. À fixer — règle manquante : numéro attribué non finalisé (Q03) | M | R1 · T |
| REC-111 | C5, SYS-08 | Sauvegarde en cours | Couper l'alimentation | Sauvegarde marquée incomplète et alertée ; la dernière bonne sauvegarde n'est pas écrasée | M | R3 · T |
| REC-112 | C5 | Restauration d'essai en cours | Couper l'alimentation, redémarrer, relancer | Sauvegarde source intacte ; cible vierge relançable ; la production n'a pas été touchée | M | R3 · T |
| REC-113 | C3, ARC-02 | Saisie d'une écriture citant P01 | Couper entre l'écriture et la mise à jour du statut de la pièce | Cohérence à la reprise : jamais une pièce « Saisie » sans écriture ni une écriture sans lien (critère 3) | B | R3 · T |
| REC-114 | C6, ARC-06 | LOT-1 déjà déposé et classé | Déposer à nouveau LOT-1 | 0 nouvelle pièce ; 10 doublons signalés ; compteur d'identifiants inchangé | B | R1 · T |
| REC-115 | C6, SYS-08 | Automatisme de dépôt | Envoyer deux fois le même événement à 1 seconde d'écart | Un seul enregistrement par pièce | B | R1 · T |
| REC-116 | SYS-08, C6 | Traitement échoué placé en file de reprise | Corriger la cause puis rejouer | Exactement 1 enregistrement ; élément de la file marqué traité ; journal complet | B | R1 · T |
| REC-117 | SYS-08 | Cause d'échec persistante | Laisser la reprise échouer plusieurs fois | Élément conservé en file, jamais supprimé ; alerte maintenue. À fixer — règle manquante : nombre de reprises et escalade (Q21) | M | R3 · T |
| REC-118 | SYS-08 | Automatisme de dépôt | Provoquer un échec (stockage arrêté) | Alerte reçue par le développeur : nom de l'automatisme, heure, lot ou pièce concerné ; pas de pièce jointe ni de montant dans l'alerte. À fixer — règle manquante : canal, destinataires et délai (Q21) | B | R1 · T |
| REC-119 | SYS-08 | Canal d'alerte coupé | Provoquer un échec | L'échec reste consultable dans un journal des échecs ; l'alerte part dès le rétablissement du canal | m | R3 · T |
| REC-120 | SYS-08, C5 | Sauvegarde nocturne supprimée de la planification | Attendre l'heure prévue | Absence d'exécution détectée et alertée (un automatisme silencieusement arrêté) | M | R3 · T |
| REC-121 | SYS-08 | Si l'entrée des pièces par mail est retenue : mail avec pièce jointe | Faire échouer le traitement | Le mail est mis en file de reprise et n'est pas perdu. À fixer — règle manquante : périmètre de l'entrée par mail (Q21) | M | R3 · T |

### J. Immuabilité et journal d'audit

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-122 | C5, C6 | Pièces classées du jeu d'essai | Lancer le contrôle d'intégrité | Rapport avec 0 écart ; nombre de pièces contrôlées = nombre d'index. À fixer — règle manquante : fréquence et déclencheur du contrôle (Q22) | B | R1 · T |
| REC-123 | ARC-01 | P01 classée | Modifier un octet du fichier sur le stockage (hors application) ; lancer le contrôle | Écart détecté, identifiant P01 nommé, alerte émise ; l'empreinte d'origine n'est pas remplacée | B | R1 · T |
| REC-124 | ARC-01 | P01 classée | Remplacer le fichier par un autre PDF du même nom | Détecté comme P01 | B | R1 · T |
| REC-125 | ARC-01 | P01 classée | Supprimer le fichier sur le stockage | Détecté comme « fichier absent », distinct d'une pièce déclarée manquante | M | R1 · T |
| REC-126 | ARC-01 | P01 classée | Renommer ou déplacer le fichier hors règle | Écart chemin/index détecté et signalé | M | R3 · T |
| REC-127 | ARC-01 | P01 classée | Modifier l'empreinte dans l'index par accès direct à la base | Écart détecté par recoupement (journal, sauvegarde) ou modification refusée | M | R3 · T |
| REC-128 | ARC-01 | P01 classée ; U-CPT | Corriger le montant par l'application | Refus ou création d'une nouvelle version avec l'ancienne consultable ; journal : avant, après, auteur, heure. À fixer — règle manquante : correction d'une pièce déjà classée (Q22) | M | R3 · T |
| REC-129 | Audit | Compte U-CPT | Créer une pièce | Entrée au journal : auteur nominatif, date et heure Africa/Brazzaville, action, identifiant, empreinte | B | R1 · T |
| REC-130 | Audit | Pièce classée | Changer de statut, de champ, de lien d'écriture | Une entrée par changement avec ancienne et nouvelle valeur | B | R1 · T |
| REC-131 | Audit | Compte sans droit | Tenter une action interdite | Refus tracé au journal avec auteur et action tentée | M | R1 · T |
| REC-132 | Audit | U-DIR, DEV | Chercher une action de modification d'une entrée du journal ; tenter par l'API et par la base | Aucune action disponible ; tentative refusée et tracée, y compris pour la Direction et le développeur | B | R1 · T |
| REC-133 | Audit | Idem | Tenter de supprimer une entrée, de purger ou tronquer le journal | Refusé et tracé ; journal intact | B | R1 · T |
| REC-134 | Audit | Accès direct à la base par un administrateur | Altérer une ligne du journal | Altération détectée. À fixer — règle manquante : détection d'une altération par un administrateur ; sinon écart documenté (Q22) | M | R3 · T |
| REC-135 | Audit | 1 000 modifications par script | Compter les entrées | 1 000 entrées, aucune perdue, ordre chronologique conservé | m | R3 · T |
| REC-136 | Audit | Actions faites par un automatisme | Lire le journal | Auteur « système » identifié, distinct d'un utilisateur ; aucun compte partagé générique | m | R3 · T |
| REC-137 | Audit, SYS-12 | Pièce confidentielle | Ouvrir une pièce | Consultation tracée (qui, quoi, quand). Optionnel : US-SYS-12 est de priorité S | m | R3 · T |

### K. Droits par rôle

Hypothèse de lecture des stories : l'aide au tri dépose, le comptable enregistre, cite, déclare et rapproche, le responsable de validation contrôle et lit, la Direction lit tout et signe, la personne non autorisée n'a aucun accès. Toute autre règle est à fixer (Q01).

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-138 | Droits | Compte authentifié mais hors liste nominative (U-EXT) | Tenter : liste des pièces, ouverture d'un PDF, rapports, export, API | Tout est refusé ; aucun nom de tiers ni montant n'est divulgué | B | R1 · T |
| REC-139 | Droits | Personne non authentifiée | Appeler le lien direct d'un PDF, l'API et l'automatisme de dépôt | Refus ; aucune différence de réponse révélant si l'identifiant existe | B | R1 · T |
| REC-140 | Droits, ARC-06 | U-TRI | Déposer un lot, voir « À trier » | Autorisé | M | R1 · T |
| REC-141 | Droits, ARC-01 | U-TRI | Enregistrer et classer une pièce ; voir les montants | Résultat à fixer. À fixer — règle manquante : l'aide au tri classe-t-elle, voit-elle les montants ? (Q01) | M | R1 · T |
| REC-142 | Droits, ARC-02 | U-TRI | Saisir une écriture, déclarer une pièce manquante, faire un rapprochement | Résultat à fixer. À fixer — règle manquante : actions interdites à l'aide au tri (Q01) | M | R1 · T |
| REC-143 | Droits, ARC-01, ARC-02, ARC-05, ARC-07 | U-CPT | Enregistrer, citer, déclarer une pièce manquante, rapprocher | Autorisé (stories US-ARC-01, 02, 05, 07) | B | R2 · T |
| REC-144 | Droits, ARC-03, ARC-04 | U-VAL | Ouvrir pièce et écriture, lire les rapports et le tableau de bord | Autorisé | M | R2 · T |
| REC-145 | Droits | U-VAL | Modifier un champ de pièce classée ; supprimer une pièce | Résultat à fixer. À fixer — règle manquante : limites du responsable de validation (Q01) | M | R2 · T |
| REC-146 | Droits | Pièce saisie par U-CPT | U-CPT tente de la faire passer à « Contrôlée » ; U-VAL le fait | Résultat à fixer. À fixer — règle manquante : règle des quatre yeux sur « Contrôlée » (Q31) | M | R2 · T |
| REC-147 | Droits, ARC-08 | U-DIR | Naviguer d'un chiffre du bilan à la pièce ; lire tous les rapports | Autorisé en lecture | M | R2 · T |
| REC-148 | Droits, ARC-05 | Attestation de pièce manquante | Contrôler qui peut valider la déclaration | Résultat à fixer. À fixer — règle manquante : validation de la Direction dans l'outil (Q17) | M | R4 · T |
| REC-149 | Droits | Lecteur en lecture seule | Appeler directement l'API d'écriture avec son jeton de lecture | Refus côté serveur ; aucune modification ; tentative tracée | B | R1 · T |
| REC-150 | Droits | Droits retirés à un utilisateur pendant sa session | Poursuivre ses actions | Effet immédiat ou dans un délai documenté. À fixer — règle manquante : délai d'effet (Q01) | M | R3 · T |
| REC-151 | Droits, Audit | Un utilisateur quitte l'entreprise | Désactiver son compte | Connexion impossible ; ses actions passées restent au journal sous son nom ; compte jamais supprimé | M | R3 · T |

### L. PDF produits par l'ERP (US-ARC-09)

Cas exécutables seulement quand l'ERP est en ligne (J07, 14-15 octobre) et le contrat d'interface confirmé (Q24).

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-152 | ARC-09 | ERP en ligne ; contrat confirmé | Générer une facture de vente | PDF archivé et indexé à la génération avec identifiant FT-PC, empreinte égale au fichier généré, chemin conforme. À fixer — règle manquante : type et dossier de classement (Q24) | B | R2 · T |
| REC-153 | ARC-09 | Idem | Générer une situation de travaux et un bon | Chaque document devient une pièce distincte, indexée, ouvrable depuis son écriture | M | R2 · T |
| REC-154 | ARC-09 | Facture déjà archivée | Régénérer ou réimprimer le même document | Aucun doublon silencieux. À fixer — règle manquante : régénération du même document (Q24) | M | R3 · T |
| REC-155 | ARC-09, SYS-08 | Stockage de l'archive arrêté | Générer une facture | Aucun PDF émis sans pièce archivée, ou mise en file de reprise avec alerte. À fixer — règle manquante : comportement de l'ERP si l'archivage échoue (Q24) | M | R3 · T |
| REC-156 | ARC-09, C6 | U-CPT dépose une pièce pendant que l'ERP génère 2 factures | Lancer en parallèle | Identifiants distincts et consécutifs sur le compteur commun | M | R3 · T |
| REC-157 | ARC-09 | Facture annulée par un avoir | Générer facture puis avoir | Les deux PDF sont archivés, aucun n'est supprimé | m | R3 · T |

### M. Conservation (US-ARC-10)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-158 | ARC-10 | Pièces de 2024 et 2025 | Lire la date de fin de conservation | Date calculée pour chaque pièce selon la règle. À fixer — règle manquante : durée, point de départ, durée par type (Q23) | M | Post · T |
| REC-159 | ARC-10 | Date de fin proche (horloge simulée) | Attendre l'échéance de préavis | Direction prévenue avant l'échéance. À fixer — règle manquante : préavis (Q23) | M | Post · T |
| REC-160 | ARC-10, Audit | Pièce avant sa fin de conservation | Tenter de la supprimer, avec ou sans procès-verbal, par tous les rôles et par la base | Refusé pour tous ; tentative tracée | B | R3 · T |
| REC-161 | ARC-10 | Pièce échue | Supprimer sans procès-verbal | Refusé | M | Post · T |
| REC-162 | ARC-10, Audit | Pièce échue ; PV joint | Supprimer selon la procédure | Suppression tracée au journal avec identifiant, empreinte, PV ; identifiant jamais réutilisé. À fixer — règle manquante : qui autorise, contenu du PV (Q23) | m | Post · T |
| REC-163 | ARC-10 | Règle de durée modifiée après l'avis de l'expert-comptable | Modifier la règle | Dates recalculées, aucune pièce modifiée, changement tracé | M | Post · T |

### N. Tableau de bord (US-ARC-11)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-164 | ARC-11 | 50 pièces d'essai à statuts variés | Comparer le tableau de bord à un comptage direct de l'index | Collectées, classées, saisies, contrôlées, manquantes : écart 0 | M | R1 · T |
| REC-165 | ARC-11 | Actions faites un jour J | Consulter à l'heure de mise à jour | Chiffres à jour ; horodatage de mise à jour affiché. À fixer — règle manquante : heure de mise à jour (Q25) | M | R3 · P |
| REC-166 | ARC-11 | Plan saisi (pièces attendues par semaine) | Consulter la comparaison au plan | Écart affiché par semaine. À fixer — règle manquante : format et source du plan (Q25) | M | R3 · P |
| REC-167 | ARC-11 | Tableau de bord | Contrôler la cohérence | Somme des statuts = total ; une pièce dans un seul statut ; manquantes comptées une fois | M | R3 · P |
| REC-168 | ARC-11 | Programme §5.8 | Vérifier les indicateurs hebdomadaires | Présents : collectées, triées, classées, saisies, contrôlées, manquantes, écritures sans pièce, temps moyen de traitement | M | R3 · P |

### O. Environnement de test et export (US-SYS-10, US-SYS-11)

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-169 | SYS-10 | Environnement de test en place | Créer des pièces, écritures et fichiers en test | Rien n'apparaît en production ; fichiers, base, compteurs séparés | B | R1 · T |
| REC-170 | SYS-10, C6 | Idem | Créer des pièces en test et en production | Identifiants de test distinguables et sans effet sur le compteur de production. À fixer — règle manquante : marquage des identifiants de test (Q26) | M | R1 · T |
| REC-171 | SYS-10 | Un changement prêt | Le déployer d'abord en test avec le jeu des 50 pièces, rejouer les cas bloquants, puis en production | Procédure respectée ; mise en production tracée ; aucune régression des cas bloquants | M | R3 · T |
| REC-172 | SYS-10 | Environnement de test | Observer ses connexions | Aucune alerte, sauvegarde hors site, mail ou écriture dans la production ; jeu d'essai réinitialisable | m | R1 · T |
| REC-173 | SYS-11 | Archive de 50 pièces avec journal | Exporter l'ensemble | Index et journal en CSV UTF-8, fichiers en PDF d'origine, manifeste des nombres ; ouverture dans un tableur sans outil propriétaire ; accents et montants à 9 chiffres intacts. À fixer — règle manquante : périmètre et formats (Q29) | M | R5 · T |
| REC-174 | SYS-11, C5 | Export | Ouvrir l'export dans un environnement vierge et recalculer les empreintes | 100 % des fichiers conformes à l'index ; nombres égaux au manifeste | M | R5 · T |
| REC-175 | SYS-11, Droits | Export | Demander l'export avec chaque rôle | Autorisé aux seuls rôles prévus ; export tracé. À fixer — règle manquante : rôle autorisé (Q29) | M | R5 · T |

### P. Recette de bout en bout et critères d'acceptation

| N° | Couvre | Préconditions | Étapes | Résultat attendu | Prio | Vague · Env |
|---|---|---|---|---|---|---|
| REC-176 | C1, ARC-06, ARC-01 | 50 pièces d'essai (J06) : LOT-A, soit P01 à P31 utiles et 19 pièces ordinaires | Collecte, tri, classement et index, chronométrés pièce par pièce | 50 pièces traitées : chacune classée, ou rejetée / déclarée selon sa règle ; aucune perdue ; temps par pièce consigné pour J06c | B | R1 · T+P |
| REC-177 | C5, C6, ARC-03 | Checklist go/no-go du 16 octobre | Vérifier : 50 pièces OK, restauration réussie, persistance, écran ouvrant la pièce depuis l'écriture, zéro doublon, aucun cas bloquant du socle en échec | Décision écrite go ou no-go signée par la Direction avec la liste des cas passés | B | R2 · T+P |
| REC-178 | C1 | Inventaire du 13 octobre par exercice et par type | Comparer inventaire et index à la fin de chaque année archivée | Pour chaque exercice et type : inventaire = classées + manquantes déclarées ; zéro non traité | B | R4 · P |
| REC-179 | C1 | Archive complète | Rechercher des pièces classées hors inventaire | Pièces hors inventaire listées et expliquées | m | R4 · P |
| REC-180 | C2 | Trois exercices complets | Compter les écritures avec pièce, avec pièce manquante déclarée et sans aucune | Sans aucune = 0 pour 2024, 2025 et 2026 ; taux 100 % | B | R4 · P |
| REC-181 | C3 | Après corrections du 29 octobre | Relancer les deux rapports inverses | Les deux rapports vides, ou chaque écart restant documenté et accepté par écrit | B | R5 · P |
| REC-182 | C4, ARC-08 | Échantillon de 30 pièces par exercice tiré par le responsable de validation (au moins 3 par type, dont les plus gros montants et des pièces des dates limites) | Pour chaque pièce, chronométrer depuis le chiffre de l'état financier jusqu'à l'affichage de la pièce | Les 90 pièces retrouvées en moins de 2 minutes chacune, et la pièce ouverte est bien celle de l'écriture ; feuille de chronos signée. À fixer — règle manquante : tolérance et tirage (Q27) | B | R4 · P |
| REC-183 | C4, ARC-08 | Démonstration du 30 octobre | La Direction choisit 3 chiffres et demande la remontée jusqu'à la pièce | 3 sur 3 démontrés devant la Direction, par une personne autre que le développeur | B | R5 · P |
| REC-184 | C5, C6, C3 | Version finale | Rejouer tous les cas bloquants du socle (A, B, C, D, E, H, I, J, K) | 100 % passés avant la restauration finale | M | R5 · P |
| REC-185 | ARC-01 | Politique "sans IA externe" | Dérouler le parcours complet en surveillant le trafic sortant | Parcours complet sans service d'IA ; aucune donnée vers un service d'IA ; toute option d'extraction assistée est désactivée par défaut | B | R1 · T |
| REC-186 | ARC-01, ARC-06 | Comptable et aide au tri formées (J06d) | Appliquer la checklist de collecte à 10 pièces | 10 pièces sans erreur de nommage ni de rangement | m | R1 · P |

## 4. Matrice de couverture

### 4.1 Stories et critères

| Story ou critère | Intitulé | Cas (REC-) | Nb | Limites et réserves |
|---|---|---|---|---|
| ARC-01 | US-ARC-01 Enregistrer une pièce avec identifiant unique | 006, 007, 008, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 039, 040, 041, 043, 107, 110, 123, 124, 125, 126, 127, 128, 141, 143, 176, 185, 186 | 46 | Testable. Les champs obligatoires sont ceux du §5.6 du programme. |
| ARC-02 | US-ARC-02 Citer la pièce dans l'écriture | 044, 045, 046, 047, 048, 049, 050, 051, 052, 053, 054, 113, 142, 143 | 14 | Dépend du contrat avec l'ERP (Q24) ; avant la mise en ligne de l'ERP, cas à jouer sur un ERP d'essai ou un jeu d'écritures fictif. |
| ARC-03 | US-ARC-03 Ouvrir la pièce depuis l'écriture et inversement | 055, 056, 057, 058, 063, 144, 177 | 7 | « Moins de 2 secondes » dépend du réseau et de la taille du fichier (Q27) : mesure indicative en conditions locales. |
| ARC-04 | US-ARC-04 Rapports écritures sans pièce et pièces sans écriture | 064, 065, 066, 067, 068, 069, 070, 071, 072, 144 | 10 | Testable sur jeu isolé ; le contrôle indépendant de l'interface (REC écriture injectée) suppose un accès à la base. |
| ARC-05 | US-ARC-05 Déclarer une pièce manquante | 073, 074, 075, 076, 077, 078, 079, 080, 143, 148 | 10 | L'authenticité de la signature de la Direction sur l'attestation n'est pas testable par le système (contrôle humain). |
| ARC-06 | US-ARC-06 Déposer un lot, doublons par empreinte, compteur | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 032, 034, 037, 038, 106, 108, 109, 114, 140, 176, 186 | 21 | L'empreinte ne détecte pas les quasi-doublons : règle manquante (Q11). |
| ARC-07 | US-ARC-07 Rapprochement bancaire | 081, 082, 083, 084, 085, 086, 087, 088, 089, 090, 091, 092, 143 | 13 | Dépend de la disponibilité des relevés (Q30) et de règles de rapprochement non écrites (Q18). |
| ARC-08 | US-ARC-08 Du chiffre du bilan aux pièces | 059, 060, 061, 062, 063, 147, 182, 183 | 8 | Dépend des états financiers navigables de l'ERP (contrat, Q24). |
| ARC-09 | US-ARC-09 PDF de l'ERP archivés automatiquement | 152, 153, 154, 155, 156, 157 | 6 | Non testable tant que l'ERP n'est pas en ligne (J07, 14-15 octobre) et que le contrat d'interface n'est pas confirmé ; code de l'ERP inaccessible. |
| ARC-10 | US-ARC-10 Conservation et préavis | 158, 159, 160, 161, 162, 163 | 6 | Seul le mécanisme est testable ; la durée légale n'est pas confirmée (réponse de l'expert-comptable attendue au J12, 23 octobre). Conformité légale non testable par nous. |
| ARC-11 | US-ARC-11 Tableau de bord d'avancement | 164, 165, 166, 167, 168 | 5 | Comparaison au plan : format du plan non défini (Q25). |
| SYS-08 | US-SYS-08 Alerte d'échec et file de reprise | 101, 111, 115, 116, 117, 118, 119, 120, 121, 155 | 10 | Canal et délai non définis (Q21) ; la partie « mail » ne vaut que si l'entrée par mail est dans le périmètre. |
| SYS-10 | US-SYS-10 Environnement de test | 169, 170, 171, 172 | 4 | Testable. |
| SYS-11 | US-SYS-11 Export en formats ouverts | 173, 174, 175 | 3 | Périmètre et formats à fixer (Q29). |
| C1 | Critère 1 — 100 % des pièces de l'inventaire classées ou déclarées manquantes | 073, 077, 080, 176, 178, 179 | 6 | Dépend de l'inventaire du 13 octobre (J02) ; l'exhaustivité de l'inventaire lui-même n'est pas testable par le système. |
| C2 | Critère 2 — 100 % des écritures citent une pièce ou une pièce manquante déclarée | 044, 045, 046, 047, 049, 054, 060, 065, 066, 070, 180 | 11 | Dépend de la méthode de reprise des écritures (J04b, Q32). |
| C3 | Critère 3 — contrôles inverses | 052, 053, 064, 066, 069, 113, 181, 184 | 8 | Testable. |
| C4 | Critère 4 — 30 pièces par année en moins de 2 minutes | 059, 182, 183 | 3 | Exécutable seulement quand les écritures des trois exercices sont saisies (28 octobre) ; répétition à blanc sur la plus ancienne année dès J09b. Tolérance et tirage à fixer (Q27). |
| C5 | Critère 5 — sauvegarde restaurée avant l'archivage en masse et à la fin | 016, 093, 094, 095, 096, 097, 098, 099, 100, 101, 102, 103, 104, 105, 111, 112, 120, 122, 174, 177, 184 | 21 | Date finale 30 ou 31 octobre (Q20). Une panne réelle du fournisseur d'hébergement n'est pas reproductible. |
| C6 | Critère 6 — aucun identifiant de pièce en double | 003, 004, 005, 015, 026, 029, 030, 035, 036, 037, 038, 039, 040, 041, 042, 043, 079, 096, 104, 106, 107, 108, 109, 110, 114, 115, 116, 122, 156, 170, 177, 184 | 32 | Testable ; « sans trou » est en tension avec « jamais réutilisé » (Q03). |
| C7 | Critère 7 — soldes bancaires rapprochés à la clôture de chaque exercice | 081, 082, 085, 086, 087, 088 | 6 | Exercice 2026 non clos (Q04) ; relevés requis (Q30). |

Contrôle : chaque story US-ARC-01 à 11, US-SYS-08, US-SYS-10, US-SYS-11 et chacun des 7 critères est couvert par au moins un cas (colonne Nb non nulle). Couvertures transverses sans story dans la liste demandée : droits par rôle (138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 175), journal d'audit (129, 130, 131, 132, 133, 134, 135, 136, 137, 151, 160, 162), immuabilité (cas du groupe J). US-SYS-12 (journal des accès) n'est couverte que par un cas optionnel (137). US-DIR-05 (conservation) n'a pas été lue en détail : elle parle de 3 ans pour le périmètre secrétariat, en tension avec les 10 ans évoqués pour les pièces comptables (Q23).

### 4.2 Exigences du chantier sans story propre
| Exigence | Cas |
|---|---|
| Concurrence (deux personnes déposent ou classent) | 037, 038, 039, 079, 156 |
| Reprise après coupure d'électricité ou de réseau | 106, 107, 108, 109, 110, 111, 112, 113 |
| Rejeu d'un traitement | 106, 114, 115, 116, 117 |
| Recherche en moins de 2 minutes depuis un chiffre | 059, 182, 183 |
| Sauvegarde et restauration effective | 093, 094, 095, 096, 097, 098, 099, 100, 101, 102, 103, 104, 105 |
| Immuabilité d'un fichier classé | 122, 123, 124, 125, 126, 127 |
| Fonctionnement sans IA ni outil Jev | 185 |

### 4.3 Ce qui ne peut pas être testé, et pourquoi
1. **Authenticité de la signature de la Direction** sur l'attestation de pièce manquante : le système ne la vérifie pas. Contrôle humain par le responsable de validation sur échantillon.
2. **Fidélité de la saisie au papier** (le comptable a-t-il bien recopié ?) : seul l'échantillon du critère 4 et le contrôle humain la couvrent.
3. **Exhaustivité de l'inventaire et des pièces papier** : une pièce jamais retrouvée n'est pas détectable par le système ; on ne contrôle que l'écart entre l'inventaire et l'index.
4. **Coupure d'électricité réelle et onduleur** : simulée par arrêt brutal ; le matériel (onduleur, scanner) se vérifie à la main.
5. **Réseau réel du site et performance « moins de 2 secondes »** : mesures indicatives, dépendantes des conditions du jour.
6. **ERP** : code inaccessible, application pas encore en ligne avant le 14-15 octobre ; tout cas qui en dépend (groupes C, D, E, G, L) est conditionné à J07 et au contrat d'interface. En attendant, répétition sur un jeu fictif.
7. **Durée légale de conservation** : on teste le mécanisme, pas la conformité légale (non confirmée, J12). Destruction du papier : contrôle manuel du registre des destructions (aucune avant la réponse de l'expert-comptable).
8. **Administrateur du serveur malveillant** (accès complet au système) : on ne peut garantir l'inviolabilité ; on vérifie la détection et on documente la limite.
9. **Panne réelle de l'hébergeur** : non reproductible ; la restauration depuis la copie hors site, lue depuis un autre poste, en tient lieu.
10. **Absence d'IA** : prouvée seulement sur la période de surveillance du trafic sortant.
11. **Lisibilité d'un scan** pour un humain : jugement du comptable.

## 5. Critères de sortie de recette

La recette est déclarée **passée** quand toutes les conditions suivantes sont réunies à la date de remise (31 octobre 2026) :
1. **100 % des cas bloquants exécutés et passés.** Aucune dérogation possible sur un bloquant.
2. **Aucun cas majeur ouvert sans dérogation écrite de la Direction** (datée, signée, avec plan de correction et date). Tous les majeurs sont exécutés.
3. **Mineurs** : au moins 80 % passés ; les autres consignés comme écarts connus avec échéance.
4. **Aucune règle manquante en suspens sur un cas bloquant** : une règle « à fixer » non tranchée à la date d'exécution met le cas en « Bloqué par règle », ce qui compte comme non passé.
5. **Les 7 critères d'acceptation de la fiche sont démontrés** par des preuves archivées : rapports de contrôles inverses vides (C3), feuille de chronos signée sur 30 pièces par exercice (C4), deux procès-verbaux de restauration datés avant l'archivage en masse et à la fin (C5), contrôle d'unicité à 0 doublon aux trois dates (C6), états de rapprochement par compte et par exercice (C7), tableau inventaire contre index (C1), décompte des écritures (C2).
6. **Zéro anomalie ouverte de gravité critique** : perte ou altération de pièce, identifiant en double, sauvegarde non restaurable.
7. **Rejeu final des cas bloquants du socle** sur la version déployée avant la restauration finale du 30 octobre.
8. Registre de recette complet, compte rendu de recette signé par le responsable de validation et la Direction.

**Go/no-go du 16 octobre** (décision J08, pas la recette finale) : go si tous les cas bloquants des vagues R1 et R2 sont passés, la restauration d'essai a réussi, la persistance après redémarrage est prouvée, l'écran qui ouvre la pièce depuis l'écriture fonctionne, et le zéro doublon est constaté. Sinon no-go : rester sur les 50 pièces d'essai et corriger.

**Gestion des écarts** : une anomalie reçoit un numéro, une gravité (§1.2), un responsable et une date de correction ; elle est rejouée avant fermeture ; un majeur fermé par dérogation reste listé au compte rendu.

## 6. Calendrier de recette

Aligné sur les jalons v0.2 (`docs/programme/JALONS-EXECUTION.md`). Dates 2026 ; jours ouvrés du lundi au vendredi, samedi 31 en réserve.

| Date | Jalon | Activité de recette | Cas |
|---|---|---|---|
| lun 12 oct | J01 | Lecture du plan par la Direction et le responsable de validation ; désignation des exécutants ; arbitrage des questions §7 | — |
| mar 13 oct | J04, J02 | Règles figées : **trancher les questions marquées « avant le 13 »** (Q01 à Q07, Q10, Q12, Q17, Q18, Q20) ; préparer le jeu de données §2 ; créer l'environnement de test | — |
| mer 14 oct | J06, J06b, J07 | **Vague R1** : 50 pièces d'essai de bout en bout, dépôts, identifiants, coupures, restauration d'essai, copie hors site, persistance après redémarrage, alertes | 001, 002, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 043, 094, 095, 096, 098, 099, 100, 105, 106, 107, 108, 110, 114, 115, 116, 118, 122, 123, 124, 125, 129, 130, 131, 132, 133, 138, 139, 140, 141, 142, 149, 164, 169, 170, 172, 176, 185, 186 |
| jeu 15 oct | J06c, J06d | Rejeu des échecs de R1 ; mesure du temps par pièce ; contrôle de la formation (10 pièces sans erreur) | rejeux |
| ven 16 oct | J08 | **Vague R2** : lien écriture-pièce, rapports inverses, droits, ERP ; **go/no-go** avec la liste des cas passés | 044, 045, 046, 047, 048, 049, 050, 051, 052, 053, 055, 056, 064, 065, 143, 144, 145, 146, 147, 152, 153, 177 |
| lun 19 au ven 23 oct | J09b, J10, J11 | **Vague R3** pendant l'archivage en masse : concurrence réelle avec l'aide au tri, contrôle quotidien du soir (unicité, intégrité, tableau de bord, sauvegarde de la nuit), répétition à blanc de l'échantillon sur l'année la plus ancienne (dès J09b) ; revue de charge du 23 | 003, 054, 057, 058, 066, 067, 068, 070, 071, 072, 093, 101, 102, 103, 104, 109, 111, 112, 113, 117, 119, 120, 121, 126, 127, 128, 134, 135, 136, 137, 150, 151, 154, 155, 156, 157, 160, 165, 166, 167, 168, 171 |
| ven 23 oct | J12 | Réponse de l'expert-comptable sur la durée de conservation : débloque les cas de conservation | — |
| lun 26 et mar 27 oct | J13 | Cas des pièces manquantes (groupe F) au fil du traitement | groupe F |
| mer 28 oct | J14 | **Vague R4** : échantillon de 30 pièces par exercice, contrôles inverses, rapprochement bancaire, inventaire contre index, décompte des écritures | 059, 060, 061, 062, 063, 069, 073, 074, 075, 076, 077, 078, 079, 080, 081, 082, 083, 084, 085, 086, 087, 088, 089, 090, 091, 092, 148, 178, 179, 180, 182 |
| jeu 29 oct | J15 | Corrections et rejeu des cas en échec | rejeux |
| ven 30 oct | J16 | **Vague R5** : rejeu des cas bloquants du socle, sauvegarde finale restaurée et constatée, export, démonstration de 3 chiffres remontés à leur pièce | 097, 173, 174, 175, 181, 183, 184 |
| sam 31 oct | J17 | Réserve ; compte rendu de recette signé ; décision sur les dérogations | — |
| lun 2 au ven 6 nov | J18 | Cas de conservation (vague « Post »), bilan des écarts | 158, 159, 161, 162, 163 |

## 7. Règles manquantes et questions

Ces règles manquent pour fixer le résultat attendu. Il revient à la Direction ou au responsable de validation de les trancher, de préférence **avant le 13 octobre** pour celles qui touchent les 50 pièces d'essai du 14.

| N° | Règle manquante | Cas touchés |
|---|---|---|
| Q01 | Matrice des droits par rôle : qui peut déposer, enregistrer, classer, saisir une écriture, déclarer une pièce manquante, faire passer une pièce à « Contrôlée », exporter, voir les montants ; rôle exact du développeur ; contenu de la liste nominative des personnes autorisées. | 141, 142, 145, 150 |
| Q02 | Identifiant FT-PC : AAAA est-il l'année de la pièce, du dépôt ou de l'exercice ? L'identifiant est-il attribué au dépôt ou à l'enregistrement ? | 041 |
| Q03 | Numéro attribué puis abandonné (fichier refusé, enregistrement annulé, coupure) : trou admis et tracé au journal, ou numéro à ne jamais consommer avant validation ? La demande « pas de trou » est incompatible avec « jamais réutilisé » si un numéro peut être perdu. | 040, 110 |
| Q04 | Exercice comptable : année civile du 1er janvier au 31 décembre ? Les trois exercices sont-ils 2024, 2025 et 2026 (en cours) ? Le critère 7 (rapprochement à la clôture) s'applique-t-il à 2026, non clos ? | 019 |
| Q05 | Pièce sans montant (bon de livraison, par exemple) : montant obligatoire, ou valeur 0 distincte de « vide » ? Comment l'archiver ? | 025 |
| Q06 | Pièce sans date lisible : date obligatoire (refus), date de substitution (date de réception ?), ou statut particulier ? | 023 |
| Q07 | Pièce datée dans le futur ou hors des trois exercices (2023 et avant) : acceptée, refusée ou classée à part ? | 023 |
| Q08 | Montant : plafond (10 chiffres ?), montant négatif (avoir), décimales et règle d'arrondi (les montants sont des entiers), séparateurs saisis (espace, point, virgule). | 027 |
| Q09 | Pièce en devise étrangère : montant_fcfa converti à quel taux (date, source) ? Conserve-t-on montant et devise d'origine ? | 028 |
| Q10 | Pièce illisible : statut, traitement (nouveau scan, déclaration de pièce manquante) et lien entre l'ancien et le nouveau scan. | 034 |
| Q11 | Quasi-doublons (même pièce scannée deux fois, octets différents) : détection (date + tiers + montant ?), alerte ou blocage, qui tranche, que devient la seconde copie. | 006 |
| Q12 | Caractères spéciaux dans le tiers : règle de transformation pour le nom de fichier et les dossiers (accents, apostrophe, « & », « / »), longueur maximale du tiers et du nom de fichier. | 030 |
| Q13 | Formats acceptés (PDF seul, ou JPG/PNG convertis ?), taille maximale d'un fichier, PDF protégé par mot de passe. | 031 |
| Q14 | Une pièce peut-elle être citée par plusieurs écritures, une écriture citer plusieurs pièces ? Un motif « pièce manquante » est-il valable sans déclaration préalable (critère 2 parle de « pièce manquante déclarée ») ? | 047, 050 |
| Q15 | Cohérence entre pièce et écriture : le montant et l'exercice de la pièce doivent-ils égaler ceux de l'écriture ? Écart toléré ? Cas du paiement partiel. | 051 |
| Q16 | Retour en arrière des statuts : que devient une pièce « Saisie » quand son écriture est modifiée, annulée ou change de pièce citée ? | 052, 053 |
| Q17 | Pièce manquante : état intermédiaire « duplicata demandé » ? Champs exigés (tiers, date, montant estimé) ? Qui valide (la Direction dans l'outil, ou seulement signature papier scannée) ? La déclaration reçoit-elle un identifiant FT-PC ? | 075, 076, 079, 148 |
| Q18 | Rapprochement bancaire : définition d'un écart et des éléments en suspens (chèque non encaissé), date d'opération ou date de valeur, solde d'ouverture de 2024, verrouillage d'un état validé, qui valide, compte clôturé en cours d'exercice. | 084, 087, 088, 092 |
| Q19 | Sauvegarde : fréquence et heure, durée de rétention, perte maximale acceptable (RPO), durée de restauration visée (RTO), fraîcheur de la copie hors site, chiffrement. Comportement du compteur d'identifiants après restauration d'une sauvegarde antérieure à la dernière attribution. | 093, 098, 104, 105 |
| Q20 | Date de la dernière restauration : la fiche dit « le 30 octobre », le programme dit « le 31 octobre » ; les jalons placent J16 le 30. Retenir le 30 ? | 097 |
| Q21 | Alertes d'échec d'automatisme : canal, destinataires, délai maximal d'émission, regroupement, nombre de reprises avant escalade ; l'entrée des pièces par mail est-elle dans le périmètre (US-SYS-08 parle d'un mail mis en file de reprise) ? | 117, 118, 121 |
| Q22 | Contrôle d'intégrité : fréquence, déclencheur, destinataire. Correction d'une pièce déjà classée : nouvelle version, ou refus ? (les exigences transverses parlent de version après validation). Détection d'une altération du journal par un administrateur de la base. | 122, 128, 134 |
| Q23 | Conservation : durée confirmée par l'expert-comptable (10 ans non vérifiés ; l'US-DIR-05 cite 3 ans pour un autre périmètre), point de départ, préavis d'alerte, qui autorise une destruction, contenu du procès-verbal, durée par type. | 158, 159, 162 |
| Q24 | Contrat d'interface avec l'ERP : champ numéro de pièce sur les écritures, export des écritures, type/dossier des PDF produits (6_Ventes ou dossiers existants), régénération d'un même document, comportement de l'ERP si l'archivage échoue à la génération. | 152, 154, 155 |
| Q25 | Tableau de bord : heure de mise à jour quotidienne, format et source du plan de comparaison. | 165, 166 |
| Q26 | Essais en production : comment marquer et retirer des pièces d'essai alors que les identifiants ne sont jamais réutilisés et que rien ne se supprime ? Marquage des identifiants de l'environnement de test. | 170 |
| Q27 | Conditions de mesure de « moins de 2 secondes » (taille de fichier, réseau local ou distant) et tolérance sur « 30 pièces par année en moins de 2 minutes » (30 sur 30 exigé ?). Qui tire l'échantillon ? | 057, 182 |
| Q28 | Recherche : sensibilité à la casse et aux accents. | 063 |
| Q29 | Export : périmètre exact (index, fichiers, journal), formats ouverts retenus, rôle autorisé. | 173, 175 |
| Q30 | Les relevés bancaires (5_Banque) entrent-ils dans le périmètre avant le 31 octobre ? Le rapprochement en dépend, la Direction décide (programme §5.2). | 089 |
| Q31 | Passage à « Contrôlée » : la règle des quatre yeux de l'ERP s'applique-t-elle (le saisisseur ne peut pas contrôler sa propre écriture) ? | 146 |
| Q32 | Reprise des écritures historiques (J04b) : méthode choisie (saisie, import, re-saisie) ; l'import applique-t-il les mêmes contrôles que la saisie ? | 054 |

Incohérences relevées dans les sources : la fiche (critère 5) et les jalons parlent du 30 octobre pour la restauration finale, le programme du 31 (Q20) ; l'US-DIR-05 fixe 3 ans pour le secrétariat alors que 10 ans sont évoqués pour les pièces comptables (Q23) ; l'US-ARC-02 parle d'un motif « pièce manquante » alors que le critère 2 parle de « pièce manquante déclarée » (Q14).
