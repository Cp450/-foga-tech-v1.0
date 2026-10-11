# Archivage comptable — Synthèse de la conception et décisions à prendre

Version 1.0 du 11 octobre 2026. Document pour la Direction : ce que contient le dossier de conception, où en est la qualité, combien cela coûte en temps, et ce qu'il faut décider avant de construire.

## 1. En une page

- **Le système** : un archivage des pièces comptables construit sur n8n et NocoDB, sur le serveur de l'entreprise, sans intelligence artificielle. Chaque pièce reçoit un numéro unique `FT-PC-AAAA-NNNNN`, son fichier est stocké une seule fois et verrouillé, et chaque écriture comptable doit citer une pièce classée ou une pièce manquante déclarée.
- **Un écart à votre décision, à valider (D1)** : sous NocoDB, la conception ajoute une base de données PostgreSQL dédiée à l'archive. Sans elle, ni la numérotation sans doublon, ni le journal infalsifiable, ni les droits par rôle ne sont possibles. NocoDB reste l'écran, n8n l'automate.
- **La qualité** : la conception a traversé trois versions et deux tours de relecture indépendante (relecteur senior et sécurité). Les défauts bloquants et critiques trouvés ont été corrigés. La version 0.3 n'a pas encore été relue ; chaque tâche de construction le sera (voir §6).
- **Le temps** : environ 114 heures de développement jusqu'au 31 octobre, hors travail dans l'ERP. **Aucun scénario ne tient avec un développeur seul à 8 heures par jour** : il faut un renfort de 32 à 39 heures, capable de faire les tâches difficiles (§4).
- **Ce qu'il faut maintenant** : 16 décisions, dont 6 à prendre lundi 12 octobre (§5), et la vérification des versions réelles de n8n et NocoDB installées sur le serveur (tâche ARC-002, lundi 12).

## 2. Le dossier

| N° | Document | Auteur dans la chaîne | Contenu |
|---|---|---|---|
| 00 | Fiche de cadrage | Orchestrateur | Périmètre, décisions de l'utilisateur, faits, règles, critères d'acceptation, hypothèses |
| 01 | Conception, v0.3 | Architecte | Architecture, 6 décisions d'architecture, modèle de données, workflows, écrans, contrat avec l'ERP, sécurité et exploitation, correspondance avec les besoins, risques |
| 02 | Backlog, v0.3 | Architecte | Tâches ARC-001 à ARC-052, niveau L1 à L4, heures, jalons, postes de la chaîne, deux scénarios de calendrier |
| 03 | Plan de recette | Testeur | 186 cas de recette écrits à partir des besoins seuls, sans voir la conception ; 32 règles manquantes relevées |
| 04 | Revue senior | Relecteur senior | Revue de la v0.1 (35 constats) puis vérification de la v0.2 (11 nouveaux défauts) |
| 05 | Audit de sécurité | Sécurité | Audit de la v0.1 (24 constats) puis vérification de la v0.2 (14 nouveaux risques) |
| 06 | Synthèse et décisions | Orchestrateur | Ce document |

## 3. Comment la chaîne d'agents a travaillé

| Tour | Ce qui s'est passé | Résultat |
|---|---|---|
| 1 | L'architecte conçoit ; en parallèle, le testeur écrit la recette sans voir la conception | Conception v0.1 ; 186 cas de recette |
| 2 | Le relecteur senior confronte la conception à la recette ; l'agent sécurité l'audite | 35 constats dont 13 bloquants ; 24 constats dont 2 critiques ; 34 cas bloquants sur 67 seulement satisfaits |
| 3 | L'architecte corrige (v0.2) | Tous les bloquants, critiques et élevés traités |
| 4 | Les deux relecteurs vérifient la v0.2 dans le texte | 45 cas bloquants sur 67 satisfaits ; 11 nouveaux défauts et 14 nouveaux risques trouvés, dont 1 bloquant et 3 élevés |
| 5 | L'architecte corrige de façon ciblée (v0.3) | Nouveaux défauts et risques élevés corrigés ; 4 des 5 cas bloquants restants rendus satisfaisables, le cinquième dépend du scénario de go |

Règle respectée à chaque tour : l'auteur ne contrôle jamais son propre travail.

## 4. Le temps et le renfort (décision D2)

| Scénario | Go | Heures avant le go | Charge par jour pour un seul développeur | Renfort pour tenir 8 h par jour | Après le go |
|---|---|---|---|---|---|
| A | vendredi 16 au soir, limité à la première vague | 72,5 h en 5 jours | 14,5 h | **32,5 h** | 42 h |
| B | lundi 19 à midi, samedi travaillé | 90,5 h en 6,5 jours | environ 13,9 h | **38,5 h** | 23 h |

- Une partie du travail ne se divise pas : une suite de 35,5 heures de tâches doit être faite dans l'ordre. Le renfort doit donc être **un développeur capable de prendre des tâches difficiles** (niveaux L3 et L4), relu comme les autres.
- Ces chiffres sont des estimations des agents, sans mesure réelle. Ils seront recalés après les 50 pièces d'essai.
- Le travail dans l'ERP (enregistrer le numéro de pièce sur chaque écriture) n'est pas estimé : le code de l'ERP n'est pas accessible. La conception démarre donc sans toucher à l'ERP, par un rapprochement à partir d'un export des écritures.
- Les jalons du programme (`docs/programme/JALONS-EXECUTION.md`) seront réalignés une fois le scénario choisi.

## 5. Les 16 décisions

Pour chaque décision, la conception propose une option par défaut. Si vous ne dites rien, c'est elle qui s'applique.

### 5.1 À décider lundi 12 octobre
| N° | Question | Option par défaut |
|---|---|---|
| D1 | Acceptez-vous la base PostgreSQL dédiée sous NocoDB ? | Oui ; la migration des données internes de NocoDB et n8n vers PostgreSQL est reportée après le 31 octobre |
| D2 | Quel scénario de go, et qui renforce le développeur ? | Aucune option par défaut : à vous de choisir A ou B et de nommer le renfort avec ses dates |
| D6 | Sortez-vous l'archivage automatique des PDF produits par l'ERP du 31 octobre ? | Oui, il passe après le 31 octobre |
| D9 | Sauvegardes : perte maximale admise, chiffrement, garde de la clé, deux espaces Google Cloud, achat du disque externe et de l'onduleur avant le 14 | Perte maximale de 2 heures pendant l'archivage en masse ; clé de déchiffrement gardée hors du serveur ; deux espaces séparés. **Ce choix est irréversible une fois les espaces créés.** |
| D13 | Qui est le responsable de validation ? Quelle est la liste nominative des utilisateurs ? | Aucune : à fournir ; export réservé au développeur et au responsable de validation |
| D14 | Texte de l'attestation de pièce manquante, outil de surveillance externe, IA désactivée | IA désactivée ; surveillance par un service gratuit ; texte de l'attestation à fournir |

### 5.2 À décider mardi 13 octobre
| N° | Question | Option par défaut |
|---|---|---|
| D3 | Année du numéro de pièce, exercice comptable, exercices concernés | Année de la date de la pièce ; année civile ; exercices 2024, 2025, 2026. **Irréversible dès le premier numéro attribué.** |
| D4 | Pièces atypiques : avoirs, sans montant, sans date, devise étrangère, formats | Avoirs gérés ; pièce sans montant ou à date estimée acceptée et signalée ; PDF seul, 20 Mo au plus ; devise étrangère : montant en FCFA de l'écriture |
| D5 | Qu'est-ce qui justifie une écriture ? | Seulement le numéro d'une pièce classée ou d'une pièce manquante déclarée |
| D7 | Identité des personnes : accepter qu'une partie reste déclarative si NocoDB ne fait pas mieux | Second compte de base pour le responsable de validation ; sinon risque signé par la Direction |
| D8 | Rapprochement bancaire : par le comptable hors outil, ou dans l'outil | Par le comptable, état joint ; relevés bancaires dans le périmètre |
| D10 | Contrôle à quatre yeux | Le contrôleur n'est ni celui qui a trié ni celui qui a saisi |
| D11 | Correction d'une pièce déjà classée | Nouvelle version, par le responsable de validation seulement |
| D12 | Noms de dossiers et codes de type | Mois sans accents (`02_Fevrier`) |
| D16 | Méthode de reprise des écritures des années passées | Une seule source d'écritures par exercice |

### 5.3 À décider mercredi 14 octobre
| N° | Question | Option par défaut |
|---|---|---|
| D15 | Règles de la recette : tolérance de l'échantillon, mesure du temps de recherche | 30 pièces sur 30 retrouvées |

### 5.4 Accords à donner sur la configuration du site
Les tâches ARC-005 (volumes persistants), ARC-041 (séparation des workflows du site et de l'archive), ARC-045 (jeton NocoDB du site) et ARC-052a (`.gitignore`) modifient la configuration de production du site web. Elles demandent votre accord explicite avant d'être faites.

## 6. Ce qui n'est pas vérifié

- **Versions réelles de n8n et NocoDB** sur le serveur, et leurs capacités : base externe branchée deux fois, en-tête de redirection interne, double authentification. C'est la première tâche, ARC-002, lundi 12. Si une capacité manque, la conception prévoit un repli, mais certaines décisions (D7) peuvent changer.
- **Le code de l'ERP** : rien n'a pu être vérifié. Le contrat d'interface est à confirmer avec celui qui développe l'ERP.
- **La version 0.3 de la conception n'a pas été relue.** Plutôt qu'un quatrième tour sur le papier, chaque tâche de construction passera par la chaîne complète : testeur avant le développeur, relecteur senior pour les tâches L3 et L4, sécurité pour tout ce qui touche droits, sauvegardes et exposition. Un relecteur peut toutefois revoir la v0.3 avant le démarrage si vous le souhaitez.
- **Les estimations d'heures** : sans mesure ; à recaler après les 50 pièces d'essai.
- **Le cadre légal** : durée de conservation des pièces comptables (jalon J12) et protection des données personnelles, à faire confirmer par l'expert-comptable et le conseil juridique.

## 7. Prochaines étapes

1. **Lundi 12** : décisions D1, D2, D6, D9, D13, D14 ; tâche ARC-002 (relevé des versions et des capacités sur le serveur) ; accords du §5.4.
2. **Mardi 13** : décisions D3, D4, D5, D7, D8, D10, D11, D12, D16 ; règles figées ; réalignement des jalons et de la recette sur le scénario choisi.
3. **Construction** : tâche par tâche, selon le backlog, avec la chaîne d'agents (testeur, développeur, relecteur, sécurité) et les portes humaines : mise en production, données réelles, secrets, droits.
