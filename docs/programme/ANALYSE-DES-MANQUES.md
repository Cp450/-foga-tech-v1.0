# Foga-Tech International — Analyse des manques : planification, réalisation, user stories

Version 0.1 du 10 octobre 2026. Relecture critique des documents produits (programme d'exécution, jalons, manuel du secrétariat, conception du registre courrier, acteurs et user stories), confrontés à la spécification FTMA, à la présentation de l'ERP SFP Suite BTP et aux manuels de l'entreprise. Chaque manque est classé par gravité : **B** = bloquant pour l'objectif du 31 octobre ou pour la fiabilité du système ; **I** = important, à traiter avant la mise en service du module concerné ; **A** = amélioration.

## 1. Résumé

Les documents couvrent bien le courrier, les contacts, le parcours client et les huit secteurs. Ils laissent trois trous principaux :

1. **Le chantier du 31 octobre n'a pas de user stories.** L'archivage comptable est planifié, mais personne n'a écrit ce que le comptable, le responsable de validation et l'aide au tri attendent de l'outil. Les critères d'acceptation existent dans le programme, pas les parcours d'utilisation.
2. **Le périmètre des pièces est trop étroit pour l'objectif annoncé.** « Retrouver la pièce qui justifie chaque chiffre des états financiers » exige plus que les quatre types retenus : il manque les relevés bancaires, les factures émises, la paie, les déclarations fiscales et sociales, les immobilisations et les contrats.
3. **L'exploitation n'est pas planifiée.** Rien ne dit qui fait tourner le système après le 31 octobre : environnement de test, surveillance des pannes de workflows, formation, support, mise à jour des procédures. Et rien n'organise le courrier d'ici la mise en service du registre numérique.

Le reste du document détaille 42 manques et propose 41 user stories supplémentaires.

## 2. Manques de planification

| N° | Manque | Gravité | Effet si rien n'est fait | Proposition |
|---|---|---|---|---|
| P01 | Périmètre des pièces limité à quatre types (factures fournisseurs, reçus de caisse, encaissements, sous-traitance) | B | Des chiffres des états financiers resteront sans justificatif : banque, paie, impôts, immobilisations, factures clients | Étendre l'inventaire (J02) à tous les types du §4 ; décider ce qui entre avant le 31 octobre et ce qui suit en novembre |
| P02 | Pas d'état des lieux de la comptabilité existante : où sont les trois exercices aujourd'hui (Excel, papier, ancien logiciel, expert-comptable) | B | Impossible d'estimer la reprise ni de rapprocher les chiffres | Ajouter un jalon « état des lieux comptable » le 12 ou 13 octobre, avec le comptable |
| P03 | Pas de plan de reprise des écritures dans l'ERP : saisie manuelle, import, ou re-saisie depuis les pièces | B | La charge de J09 et J10 est inconnue ; le calendrier repose sur une hypothèse | Choisir la méthode à J04 ; chiffrer le nombre d'écritures par exercice |
| P04 | Rapprochement bancaire absent des critères d'acceptation | B | Le lien pièce-écriture peut être complet et les comptes faux | Ajouter : solde de chaque compte bancaire rapproché avec le relevé à la clôture de chaque exercice |
| P05 | Capacité d'un seul développeur partagé entre l'ERP (J03 à J08) et l'archivage (J06, J09) la même semaine | B | Glissement de toute la semaine S42 | Budget en heures par jalon ; déplacer ce qui peut l'être vers l'aide au tri et le comptable |
| P06 | Pas de plan de repli si la mise en ligne de l'ERP échoue avant le 16 octobre | I | L'archivage en masse s'arrête | Repli écrit : index local sur le poste, sauvegardé chaque soir, import dans l'ERP dès la mise en ligne |
| P07 | Copie hors site (règle des trois copies) non planifiée comme jalon ; seules les restaurations le sont | I | Un incendie ou un vol emporte l'archive et sa sauvegarde | Jalon « première copie hors site vérifiée » avant l'archivage en masse |
| P08 | Aucune estimation de charge (heures ou jours) par jalon, ni de taux de traitement attendu (pièces par heure) | I | Impossible de savoir le 23 octobre si l'on est en retard | Mesurer le temps réel sur les 50 pièces d'essai (J06) et en déduire le plan de S43 |
| P09 | Pas de comité de suivi ni de point hebdomadaire formalisé | I | Les décisions attendent, les écarts s'accumulent | Point de 30 minutes chaque vendredi : Direction, comptable, développeur ; compte rendu d'une page |
| P10 | Pas de formation planifiée pour le comptable, l'aide au tri et le secrétariat | I | Erreurs de classement et de saisie dès le premier jour | Demi-journée de formation avant J09, puis avant J20 |
| P11 | Rien n'est prévu pour le courrier entre aujourd'hui et la mise en service du registre numérique (novembre) | I | Un mois de courrier sans numérotation ni traçabilité | Démarrer le registre papier et le tampon dès le lundi 12 octobre, avec la numérotation FT-CE ; le numérique reprendra la suite des numéros |
| P12 | Date de début de la numérotation non fixée ; sort du courrier déjà reçu en 2026 non décidé | I | Débat sans fin, trous dans la série | Décision : numérotation à partir du 12 octobre ; le courrier antérieur est classé sans numéro, dans un dossier « avant registre » |
| P13 | Archives papier antérieures aux trois exercices : rien ne dit si on les traite | A | Travail non borné | Les déclarer hors périmètre par écrit, conservées en l'état |
| P14 | Exercice comptable (janvier à décembre ?) et état de clôture des exercices non précisés | I | Mauvais découpage des dossiers par année | À confirmer avec le comptable à J02 |
| P15 | Les pièces produites par l'ERP lui-même (factures émises, situations, bons) ne figurent dans aucun jalon | I | Les ventes ne sont pas justifiées par une pièce archivée | Ajouter à J08 : chaque PDF généré par l'ERP reçoit un identifiant de pièce et est archivé automatiquement |
| P16 | Jours fériés et disponibilité des personnes non vérifiés (25 décembre dans S52, congés de fin d'année) | A | Jalons J24 et J25 irréalistes | Vérifier le calendrier officiel ; décaler J24 à janvier si besoin |
| P17 | Agence de Pointe-Noire : le programme ne dit pas si elle a son courrier, ses pièces et son secrétariat | I | Deux séries de numéros ou des pièces oubliées | Question à trancher ; si oui, préfixe d'agence dans les numéros (par exemple FT-CE-BZV, FT-CE-PNR) |

## 3. Manques de réalisation et d'exploitation

| N° | Manque | Gravité | Proposition |
|---|---|---|---|
| R01 | Pas d'environnement de test séparé de la production (exigé par le manuel §17 et par FTMA) | I | Une instance de test de l'ERP et des workflows avant toute mise en production |
| R02 | Pas de surveillance des pannes de workflows n8n : un mail non enregistré à cause d'une erreur passe inaperçu | B | File d'erreurs, alerte au développeur, reprise automatique ; le contre-contrôle du lundi compare la boîte mail au registre |
| R03 | Pas de supervision du serveur : espace disque, mémoire, service arrêté | I | Alerte simple sur l'espace disque et sur la page de santé `/healthz` |
| R04 | Pas de procédure de redémarrage ni de journal d'exploitation (qui redémarre quoi, où sont les traces) | I | Un document d'exploitation d'une page, tenu à jour |
| R05 | Gestion des secrets et des accès : création des comptes utilisateurs, mots de passe, double authentification, rotation des clés d'API | I | Liste des comptes et des rôles avant la mise en ligne ; double authentification pour la Direction et la finance |
| R06 | Droits d'accès aux fichiers de l'archive non définis techniquement (qui lit, qui écrit, par quel mécanisme) | I | Droits sur le stockage alignés sur les rôles de l'ERP ; lecture seule par défaut |
| R07 | Pas de contrôle de qualité des scans (lisibilité des montants, pages manquantes, doublons) avant indexation | I | Liste de contrôle à la collecte ; l'empreinte du fichier détecte les doublons |
| R08 | Pas de politique de données personnelles, alors que les pièces et le courrier en contiennent | I | À ma connaissance, le Congo dispose d'une loi sur la protection des données personnelles (loi n° 29-2019) : à vérifier avec le conseil juridique ; limiter l'accès, journaliser, fixer les durées |
| R09 | Export et réversibilité : pouvoir sortir toutes les données (registre, index, fichiers) si l'on change d'outil | A | Export complet en formats ouverts (CSV, PDF) testé une fois par trimestre |
| R10 | Support après mise en service : qui corrige les anomalies, dans quel délai | I | Un responsable désigné, un canal de signalement, un délai interne |
| R11 | Gouvernance des documents de procédures : qui est propriétaire du manuel, cycle de révision, numéro de version | A | Propriétaire : responsable administratif ; révision trimestrielle (déjà dans P10 du manuel) ; en-tête avec version et date |
| R12 | Stratégie de test des workflows (jeu de mails de test, cas d'erreur) | I | Jeu de 30 mails de test couvrant les catégories, les doublons, les mails suspects |
| R13 | Coût et suivi de l'usage de l'intelligence artificielle (appels, dépenses mensuelles) | A | Compteur mensuel et plafond |
| R14 | Mode dégradé du secrétariat numérique : coupure d'électricité ou de réseau en pleine journée | I | Déjà prévu côté papier ; à prévoir côté numérique : file locale et synchronisation différée |
| R15 | Correspondance entre les catégories du courrier et les modules de l'ERP (une facture fournisseur reçue par mail doit finir dans Achats) | I | Table de correspondance catégorie → module → action, dans la conception du registre |

## 4. Types de pièces à ajouter au périmètre de l'archivage

| Type de pièce | Pourquoi elle justifie un chiffre | Proposition de dossier |
|---|---|---|
| Relevés bancaires et états de rapprochement | Trésorerie, encaissements, décaissements | `5_Banque` |
| Factures clients émises, situations de travaux, décomptes | Chiffre d'affaires, créances | `6_Ventes` |
| Bulletins de paie, états de salaires, déclarations sociales | Charges de personnel | `7_Paie` |
| Déclarations fiscales et quittances (TVA, impôts, taxes) | Dettes fiscales, charges | `8_Fiscal` |
| Contrats, marchés, avenants, ordres de service, cautions | Engagements, retenues de garantie, provisions | `9_Contrats` |
| Factures d'immobilisations, tableau d'amortissement | Actif immobilisé, dotations | `10_Immobilisations` |
| Inventaire de stock et pièces d'entrée et de sortie | Stocks | `11_Stock` |
| Pièces de caisse (déjà prévues), notes de frais, avances | Caisse | `2_Recus-de-caisse` |
| Procès-verbaux de réception, garanties | Produits constatés, retenues libérées | `9_Contrats` |

Les quatre types d'origine restent prioritaires pour le 31 octobre. Les autres sont au moins inventoriés ; la Direction décide ce qui entre avant l'échéance.

## 5. Fonctionnalités et user stories non couvertes

### 5.1 Archivage comptable (aucune story aujourd'hui)
| ID proposé | Story | Critères d'acceptation | Priorité |
|---|---|---|---|
| US-ARC-01 | En tant que comptable, je veux enregistrer une pièce avec un identifiant unique et ses informations clés, afin de la retrouver depuis une écriture | Identifiant FT-PC attribué automatiquement ; champs du §5.6 du programme obligatoires ; fichier joint | M |
| US-ARC-02 | En tant que comptable, je veux citer la pièce dans l'écriture au moment de la saisie, afin de ne jamais saisir un chiffre sans origine | Champ `piece_id` obligatoire ou motif « pièce manquante » obligatoire | M |
| US-ARC-03 | En tant que responsable de validation, je veux ouvrir la pièce depuis l'écriture et l'écriture depuis la pièce, afin de contrôler en deux clics | Lien dans les deux sens ; ouverture en moins de 2 secondes | M |
| US-ARC-04 | En tant que responsable de validation, je veux la liste des écritures sans pièce et des pièces sans écriture, afin de corriger les écarts | Deux rapports, filtrables par exercice, exportables | M |
| US-ARC-05 | En tant que comptable, je veux déclarer une pièce manquante avec son motif et son justificatif de remplacement, afin de ne pas bloquer la saisie | Statut « manquante », motif, attestation signée par la Direction jointe | M |
| US-ARC-06 | En tant qu'aide au tri, je veux déposer un lot de scans et les voir apparaître dans la file « À trier », afin d'enchaîner sans manipulation | Dépôt par dossier ; détection des doublons par empreinte ; compteur du lot | M |
| US-ARC-07 | En tant que comptable, je veux rapprocher chaque compte bancaire avec son relevé, afin de prouver la trésorerie | État de rapprochement par compte et par mois ; écarts listés | M |
| US-ARC-08 | En tant que Direction, je veux retrouver depuis un chiffre du bilan la liste des pièces qui le composent, afin de répondre à un contrôle | Navigation état financier → compte → écritures → pièces | M |
| US-ARC-09 | En tant que développeur, je veux que chaque PDF produit par l'ERP soit archivé et indexé automatiquement, afin que les ventes soient justifiées comme les achats | Facture, situation, bon : identifiant de pièce et fichier archivé à la génération | M |
| US-ARC-10 | En tant que Direction, je veux connaître la date de fin de conservation de chaque pièce et être prévenue avant, afin de ne rien détruire trop tôt ni garder inutilement | Date calculée selon la règle confirmée ; aucune suppression sans procès-verbal | S |
| US-ARC-11 | En tant que responsable de validation, je veux un tableau de bord du chantier d'archivage (collectées, classées, saisies, contrôlées, manquantes), afin de suivre l'avancement | Mis à jour chaque jour ; comparé au plan | S |

### 5.2 Secrétariat : fonctions classiques absentes
| ID proposé | Story | Priorité |
|---|---|---|
| US-SEC-13 | En tant que secrétariat, je veux tenir l'agenda des dirigeants et les demandes de rendez-vous, afin de tracer qui a demandé quoi et quand | S |
| US-SEC-14 | En tant que secrétariat, je veux un registre des visiteurs et des livraisons au siège, afin de savoir qui est entré et ce qui a été reçu | S |
| US-SEC-15 | En tant que secrétariat, je veux un circuit de signature (parapheur) pour les courriers sortants, afin de savoir où en est chaque document à signer | M |
| US-SEC-16 | En tant que Direction, je veux désigner un délégataire de signature pendant mes absences, afin que le courrier ne s'arrête pas | M |
| US-SEC-17 | En tant que secrétariat, je veux enregistrer et diffuser les notes de service et le courrier interne, afin que les décisions internes soient tracées comme le courrier externe | S |
| US-SEC-18 | En tant que secrétariat, je veux un niveau de confidentialité sur chaque courrier (ordinaire, interne, confidentiel), afin de limiter qui peut le voir | M |
| US-SEC-19 | En tant que secrétariat, je veux suivre le stock de fournitures et déclencher le réapprovisionnement, afin de ne jamais manquer de tampons, d'encre ou d'enveloppes | A |
| US-SEC-20 | En tant que secrétariat, je veux imprimer une étiquette avec le numéro et un code QR à coller sur le papier, afin de retrouver la ligne du registre depuis l'original | S |
| US-SEC-21 | En tant que secrétariat, je veux enregistrer la sortie et le retour d'un original prêté, afin de savoir où est chaque dossier | S |
| US-SEC-22 | En tant que secrétariat, je veux des indicateurs propres au courrier (délai moyen de traitement, taux d'accusés dans les délais, courriers en retard par responsable), afin d'alimenter le point hebdomadaire | S |

### 5.3 Obligations à échéance, propres au BTP
| ID proposé | Story | Priorité |
|---|---|---|
| US-ECH-01 | En tant que Direction, je veux un dossier administratif d'entreprise à jour (RCCM, attestations fiscale et sociale, agréments, assurances) avec alerte avant expiration, afin de répondre à tout appel d'offres sans courir | M |
| US-ECH-02 | En tant que finance, je veux suivre chaque caution bancaire (soumission, avance, bonne exécution, retenue de garantie) avec son montant, son échéance et sa mainlevée, afin de récupérer l'argent immobilisé | M |
| US-ECH-03 | En tant que Direction, je veux suivre les assurances de l'entreprise, des chantiers, des engins et des véhicules avec alerte avant échéance, afin de ne jamais être découvert | M |
| US-ECH-04 | En tant que Direction, je veux suivre les permis, autorisations et contrats récurrents (bail, abonnements) avec leurs échéances, afin d'anticiper les renouvellements | S |
| US-ECH-05 | En tant que chargé d'affaires, je veux une veille des appels d'offres avec la date limite et la liste des pièces à fournir, afin de décider vite si l'on répond | S |

### 5.4 Règles de FTMA absentes de nos stories
| ID proposé | Story | Source | Priorité |
|---|---|---|---|
| US-PAY-01 | En tant que Direction, je veux que le système bloque la visite, la production et la livraison tant que la tranche de paiement correspondante n'est pas payée, sauf dérogation tracée, afin de protéger la trésorerie | FTMA §9.4 | M |
| US-PAY-02 | En tant que finance, je veux un échéancier de tranches généré à l'ouverture de chaque dossier selon le secteur, modifiable par contrat, afin de ne pas le recalculer à la main | FTMA §9.4 | M |
| US-ITE-01 | En tant que chargé d'affaires, je veux compter les itérations d'esquisse, de devis ou de dimensionnement avec les points modifiés demandés, afin de savoir quand on sort du forfait | FTMA §9.5 | M |
| US-ITE-02 | En tant que Direction, je veux qu'une modification substantielle après validation bascule en avenant et non en itération gratuite, afin de ne pas refaire du travail non facturé | FTMA §9.5 | M |
| US-ETU-01 | En tant que responsable technique, je veux que le refus d'une étude recommandée par le client soit acté par une validation explicite signée, afin de dégager la responsabilité de l'entreprise | FTMA §5.7 | M |
| US-ETU-02 | En tant que responsable technique, je veux la matrice d'études de chaque secteur (obligatoire, recommandée) proposée automatiquement selon la situation du terrain, afin de ne rien oublier | FTMA §5.7 | S |

### 5.5 Passerelles entre le secrétariat et l'ERP
| ID proposé | Story | Priorité |
|---|---|---|
| US-PONT-01 | En tant que secrétariat, je veux qu'une facture fournisseur reçue par courrier ou mail crée une pièce dans l'archive et une facture à rapprocher dans le module Achats, afin de ne pas la saisir deux fois | M |
| US-PONT-02 | En tant que conducteur de travaux, je veux voir dans la fiche chantier de l'ERP les courriers du registre rattachés au chantier, afin d'avoir tout au même endroit | M |
| US-PONT-03 | En tant que comptable, je veux qu'un encaissement signalé par mail (avis de virement) soit proposé au rapprochement dans l'ERP, afin d'accélérer le lettrage | S |
| US-PONT-04 | En tant que Direction, je veux un seul annuaire des tiers (clients, fournisseurs, sous-traitants) partagé entre le registre, le site web et l'ERP, afin d'éviter les doublons | M |

### 5.6 Système et fiabilité
| ID proposé | Story | Priorité |
|---|---|---|
| US-SYS-08 | En tant que développeur, je veux être alerté quand un workflow échoue et que le mail concerné soit mis en file de reprise, afin qu'aucun mail ne soit perdu silencieusement | M |
| US-SYS-09 | En tant que secrétariat, je veux annoter les propositions des agents (juste, faux, corrigé), afin de constituer le jeu de 100 cas qui mesure leur fiabilité | M |
| US-SYS-10 | En tant que Direction, je veux un environnement de test où l'on essaie les changements avant la production, afin de ne pas casser le système en service | M |
| US-SYS-11 | En tant que Direction, je veux exporter l'ensemble des données en formats ouverts, afin de ne pas dépendre d'un outil | S |
| US-SYS-12 | En tant que responsable informatique, je veux un journal des accès aux documents confidentiels, afin de savoir qui a consulté quoi | S |

## 6. Incohérences relevées entre les documents

| Sujet | Où | Correction proposée |
|---|---|---|
| Le jalon J09 (saisie des écritures de la première année) commence le 14 octobre alors que le champ `piece_id` n'existe qu'au jalon J08 du 16 octobre | Jalons | Classer et indexer dès le 14, saisir les écritures à partir du 16 |
| Le programme dit « ne mener que les modules 1 et 2 jusqu'au 31 octobre » mais la liste des prérequis ne budgète pas le temps du développeur sur l'ERP | Programme §5.3 et §9 | Ajouter une ligne de charge par jalon |
| Le manuel du secrétariat prévoit un tirage mensuel de 10 courriers ; le programme prévoit 30 pièces par année pour l'archivage | Manuel P10, programme §5.7 | Deux contrôles différents, à nommer distinctement pour éviter la confusion |
| Les user stories citent une « réponse commerciale sous 48 h » issue de FTMA et un « accusé sous 24–48 h » issu du manuel transmis | User stories, conception | Dépend de la décision J01 sur le jeu de règles |
| Le document de conception du registre parle de catégories, le manuel de « catégorie » et « urgence », FTMA de « département » | Trois documents | Un seul vocabulaire dans le référentiel des règles (§4 du programme) |

## 7. Ce que je recommande de faire tout de suite

1. **Lundi 12 octobre** : démarrer le registre papier et le tampon « REÇU LE » avec la numérotation FT-CE, sans attendre le numérique (P11, P12).
2. **Au jalon J02** : étendre l'inventaire à tous les types de pièces du §4 ; la Direction tranche ensuite ce qui entre avant le 31 octobre (P01).
3. **Au jalon J04** : ajouter l'état des lieux comptable et la méthode de reprise des écritures (P02, P03).
4. **Au jalon J06** : mesurer le temps par pièce sur les 50 pièces d'essai et recalculer S43 (P08).
5. **Avant J09** : première copie hors site vérifiée (P07) et demi-journée de formation (P10).
6. **Avant J20** : file d'erreurs et alertes des workflows (R02), environnement de test (R01), table de correspondance catégorie → module ERP (R15).
7. **Intégrer les 41 stories proposées** dans le document des user stories, avec leur priorité, après validation par la Direction.
