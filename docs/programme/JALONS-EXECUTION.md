# Foga-Tech International — Jalons d'exécution

Version 0.2 du 10 octobre 2026 (v0.1 corrigée après l'analyse des manques : registre papier dès le 12 octobre, état des lieux comptable, copie hors site, formation, point hebdomadaire, charge estimée, J09 scindé). Calendrier du programme d'exécution : archivage comptable et mise en ligne de l'ERP jusqu'au 31 octobre, puis secrétariat numérique jusqu'à la fin de l'année.

Lecture du tableau : J = jalon ; Sem. = semaine du calendrier (S42 commence le lundi 12 octobre) ; jours ouvrés du lundi au vendredi, samedi gardé en réserve ; les dates du week-end sont indiquées lorsqu'un jalon les utilise. Les jours fériés sont à vérifier au calendrier officiel, notamment le 25 décembre. Les noms des responsables sont à renseigner. La colonne « Charge » est une estimation en jours-personne, à recaler après la mesure faite sur les 50 pièces d'essai (J06).

## 1. Vue par semaine

| Semaine | Dates | Objectif de la semaine | Jalons |
|---|---|---|---|
| S41 | sam 10 et dim 11 oct | Lancer l'inventaire des pièces | J02 |
| S42 | lun 12 au ven 16 oct | Démarrer le registre papier, cadrer, figer les règles, état des lieux comptable, mettre l'ERP en ligne, tester le modèle sur 50 pièces, former | J00 à J09b |
| S43 | lun 19 au ven 23 oct | Archiver en masse les deux années suivantes, revue de charge, point hebdomadaire | J10, J11, J12 |
| S44 | lun 26 au ven 30 oct, sam 31 oct réserve | Contrôler, corriger, sauvegarder, remettre le chantier | J13 à J17 |
| S45 | lun 2 au ven 6 nov | Bilan du chantier, décision de lancer le secrétariat numérique | J18, J19 |
| S46 | lun 9 au ven 13 nov | Registre du courrier et journal d'audit | J20 |
| S47 à S50 | lun 16 nov au ven 11 déc | Mode ombre : les agents proposent, le secrétariat décide | J21, J22 |
| S51 | lun 14 au ven 18 déc | Décision de passage selon la fiabilité mesurée | J23 |
| S52 | lun 21 au ven 25 déc | Classement et archivage automatiques sous contrôle | J24 |
| Janvier 2027 | à planifier | Brouillons, relances, contre-contrôle, recherche | J25 |

## 2. Tableau des jalons

| N° | Sem. | Jour(s) et dates | Jalon | Livrable et critère de validation | Responsable | Charge | Dépend de |
|---|---|---|---|---|---|---|---|
| J00 | S42 | lun 12 oct | Registre papier et tampon « REÇU LE » en service, numérotation FT-CE à partir de ce jour ; courrier antérieur classé dans un dossier « avant registre » | Premier courrier du jour numéroté FT-CE-2026-0001 ; registre paraphé | Secrétariat, Direction | 0,3 | — |
| J01 | S42 | lun 12 oct | Décisions de cadrage : jeu de règles de référence, responsable de validation, intelligence artificielle externe oui ou non | Décisions écrites ; question de la durée de conservation posée à l'expert-comptable | Direction | 0,5 | — |
| J02 | S41 et S42 | sam 10 oct au mar 13 oct | Inventaire des pièces par année | Tableau du nombre de pièces par année et par type, pièces manquantes repérées, date du dernier lot connue | Comptable | 2 | — |
| J02b | S42 | mar 13 oct | État des lieux comptable : où sont les trois exercices (Excel, papier, logiciel, expert-comptable), exercice comptable, état de clôture, comptes bancaires | Note d'une page signée du comptable | Comptable | 1 | — |
| J03 | S42 | lun 12 oct | Docker Desktop démarré, image de l'ERP testée | Construction réussie, page de santé `/healthz` répond | Développeur | 0,5 | — |
| J04 | S42 | mar 13 oct | Règles figées : arborescence, nommage, champs de l'index ; outil de tri réglé | Document de règles signé par la Direction et le responsable de validation | Direction, responsable de validation, développeur | 1 | J01 |
| J04b | S42 | mar 13 oct | Méthode de reprise des écritures choisie (saisie, import, re-saisie depuis les pièces) et nombre d'écritures par exercice estimé | Décision écrite ; estimation chiffrée | Comptable, développeur | 0,5 | J02b |
| J05 | S42 | mar 13 oct | Accord de la Direction pour la mise en ligne de l'ERP | Accord écrit, serveur et volume identifiés | Direction | 0,2 | J03 |
| J06 | S42 | mer 14 oct | Sauvegarde restaurée avec un fichier d'essai ; 50 pièces traitées de bout en bout | Restauration réussie ; collecte, tri, classement et index validés sur 50 pièces | Développeur, comptable | 1,5 | J04 |
| J06b | S42 | mer 14 oct | Première copie hors site de l'archive et de la base vérifiée (règle des trois copies) | Copie sur stockage en ligne lue depuis un autre poste | Développeur | 0,3 | J06 |
| J06c | S42 | jeu 15 oct | Temps par pièce mesuré sur les 50 pièces d'essai ; plan de S43 recalculé | Taux de pièces par heure ; S43 confirmée ou périmètre réduit | Développeur, comptable | 0,2 | J06 |
| J06d | S42 | jeu 15 oct | Demi-journée de formation du comptable et de l'aide au tri | Liste de contrôle de collecte et règles de nommage appliquées sur 10 pièces sans erreur | Développeur | 0,5 | J04 |
| J07 | S42 | mer 14 et jeu 15 oct | ERP installé sur le serveur avec volume persistant | Après redémarrage, la base et les fichiers sont toujours présents | Développeur | 1,5 | J05 |
| J08 | S42 | ven 16 oct | Table des pièces et champ `piece_id` dans l'ERP ; décision go ou no-go de l'archivage en masse | Un écran ouvre la pièce depuis l'écriture ; décision écrite | Développeur, Direction | 2 | J06, J07 |
| J09a | S42 | mer 14 au ven 16 oct | Année la plus ancienne classée et indexée | 100 % de l'inventaire de l'année classé ou déclaré manquant | Comptable, aide au tri | 2 | J06 |
| J09b | S43 | lun 19 et mar 20 oct | Écritures de l'année la plus ancienne saisies ou reprises avec l'identifiant de pièce | Chaque écriture cite sa pièce ou un motif de pièce manquante ; méthode de reprise de J04b appliquée | Comptable | 2 | J08, J09a |
| J10 | S43 | lun 19 au ven 23 oct, sam 24 réserve | Deux années suivantes classées et indexées, aide au tri mobilisée | Mêmes critères que J09 pour chaque année | Comptable, aide au tri | 6 | J09 |
| J11 | S43 | ven 23 oct | Revue de charge à mi-parcours et premier point hebdomadaire de 30 minutes (puis chaque vendredi) | Taux de pièces traitées comparé au plan ; si retard, on traite d'abord les pièces des plus gros montants | Direction, développeur | 0,3 | J10 |
| J12 | S43 | ven 23 oct | Durée de conservation confirmée par l'expert-comptable | Réponse écrite ; aucune destruction de papier avant cette réponse | Comptable, Direction | 0,2 | J01 |
| J13 | S44 | lun 26 et mar 27 oct | Pièces manquantes traitées et saisies terminées | Duplicata demandé ou attestation interne signée par la Direction pour chaque pièce manquante | Comptable, Direction | 1,5 | J10 |
| J14 | S44 | mer 28 oct | Contrôle d'échantillon, contrôles inverses et rapprochement bancaire | 30 pièces par année retrouvées en moins de 2 minutes ; aucune pièce sans écriture ; aucune écriture sans pièce ; solde de chaque compte bancaire rapproché avec le relevé à la clôture de chaque exercice | Responsable de validation | 1,5 | J13 |
| J15 | S44 | jeu 29 oct | Corrections des écarts relevés | Liste des écarts ramenée à zéro, ou écarts restants documentés | Comptable, développeur | 1 | J14 |
| J16 | S44 | ven 30 oct | Sauvegarde finale restaurée ; démonstration : retrouver une pièce depuis un état financier | Restauration réussie ; trois exemples de chiffres remontés jusqu'à leur pièce | Développeur, Direction | 0,5 | J15 |
| J17 | S44 | sam 31 oct | Échéance : remise du chantier d'archivage | Compte rendu de clôture signé ; réserve du samedi disponible en cas d'imprévu | Direction | 0,3 | J16 |
| J18 | S45 | lun 2 au mer 4 nov | Bilan du chantier d'archivage | Écarts, temps réellement passé, pièces manquantes, leçons retenues | Développeur, comptable | 1 | J17 |
| J19 | S45 | ven 6 nov | Décision de lancer le secrétariat numérique | Décision écrite ; réponse de la Direction sur l'intelligence artificielle externe | Direction | 0,2 | J18, J01 |
| J20 | S46 | lun 9 au ven 13 nov | Registre du courrier numérique reprenant la série du registre papier, numérotation FT-CE et FT-CS, journal d'audit en ajout seul, environnement de test, file d'erreurs et alertes des workflows | Numéros attribués automatiquement sans trou ni doublon à la suite du papier ; journal alimenté ; un workflow en échec déclenche une alerte et une reprise | Développeur | 4 | J19 |
| J21 | S47 | lun 16 nov | Cinq boîtes mail branchées au registre | Un mail test par boîte crée une ligne au registre | Développeur | 1 | J20 |
| J22 | S47 à S50 | lun 16 nov au ven 11 déc | Mode ombre de quatre semaines : les agents proposent, le secrétariat décide | Comparaison hebdomadaire entre propositions des agents et décisions humaines ; jeu de 100 cas annotés | Secrétariat, développeur | 4 | J21 |
| J23 | S51 | ven 18 déc | Décision de passage au classement automatique | Fiabilité d'au moins 95 % sur 100 cas ; sinon prolongation du mode ombre | Direction | 0,2 | J22 |
| J24 | S52 | lun 21 au ven 25 déc | Classement et archivage automatiques avec file de revue en dessous du seuil de confiance | Aucune action hors seuil sans validation ; journal à jour | Développeur, secrétariat | 4 | J23 |
| J25 | Janv. 2027 | à planifier | Brouillons d'accusé et relances, rapport de contre-contrôle du lundi, recherche dans l'archive | Accusés envoyés après validation humaine ; premier rapport du lundi émis | Développeur, secrétariat, Direction | 6 | J24 |

## 3. Chemin critique jusqu'au 31 octobre

Cette suite de jalons ne peut pas glisser sans repousser la date de remise : J01, J02b, J04, J04b, J06, J06c, J08, J09a, J09b, J10, J13, J14, J16, J17.

La mise en ligne de l'ERP (J03, J05, J07) est l'autre condition : sans elle, l'identifiant de pièce ne peut pas être saisi sur les écritures.

## 4. Points de décision

| Date | Décision | Si la réponse est non |
|---|---|---|
| lun 12 oct | Registre papier en service | Un mois de courrier sans trace ; aucune raison valable de dire non |
| mar 13 oct | Règles figées, état des lieux comptable, accord de mise en ligne | Tout le calendrier recule d'autant ; le tri en masse ne démarre pas |
| jeu 15 oct | Plan de S43 recalculé d'après le temps mesuré | Réduire le périmètre aux pièces des plus gros montants dès maintenant |
| ven 16 oct | Go ou no-go de l'archivage en masse | Rester sur les 50 pièces d'essai et corriger l'ERP avant de continuer |
| ven 23 oct | Revue de charge | Limiter le périmètre aux pièces des plus gros montants et documenter le reste |
| sam 31 oct | Remise du chantier | Utiliser les réserves, puis fixer une date de fin de rattrapage écrite |
| ven 18 déc | Passage au classement automatique | Prolonger le mode ombre |

## 5. Hypothèses

- Charge totale estimée jusqu'au 31 octobre : environ 30 jours-personne répartis entre le comptable, le développeur et l'aide au tri sur 15 jours ouvrés ; sans aide au tri, l'échéance n'est pas tenable.
- Les trois années à archiver tiennent dans les semaines S42 à S44 ; l'inventaire (J02) confirme ou infirme cette hypothèse dès le 13 octobre.
- Une aide au tri est disponible pendant S43.
- Le serveur et le volume de stockage de l'ERP peuvent être mis en place le 14 octobre.
- Les jalons de novembre et décembre dépendent de la réussite du chantier d'archivage.
