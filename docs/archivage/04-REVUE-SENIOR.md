# Archivage comptable — Revue senior de la conception

Version 0.1 du 11 octobre 2026. Auteur : relecteur senior de la chaîne de conception. Documents relus : `00-FICHE-CADRAGE.md` (fait foi), `01-CONCEPTION.md`, `02-BACKLOG.md`, `03-PLAN-RECETTE.md`, `docs/programme/JALONS-EXECUTION.md`, `docs/programme/PROGRAMME-EXECUTION.md` (§3, §5), `docs/USER-STORIES-USE-CASES.md` (§6.9, §6.14, §7), `docs/DEPLOY-KVM2.md`, `docker-compose.yml`. Cette revue ne modifie pas la conception ; elle dit ce qui doit changer ou être décidé.

Convention : « Faux » signale un point que la revue peut démontrer à partir des documents ou du comportement documenté de PostgreSQL ou de Google Cloud Storage. « Non vérifiable » signale un point qui dépend de la version installée de NocoDB ou de n8n, ou du code de l'ERP.

## 1. Verdict

**Accepter avec corrections**, sous deux conditions : les constats bloquants sur le modèle (RS-01 à RS-09) sont corrigés dans `01-CONCEPTION.md` avant l'écriture des migrations ARC-006 et ARC-007 (mardi 13 octobre), et le backlog est refait autour du minimum viable du §5 (RS-02, RS-03).

Justification :
1. Le cœur technique est juste : fonction PL/pgSQL unique avec verrou de ligne, contrainte d'unicité, interdiction de suppression, fichiers sur le disque du VPS et copie hors site ; ce choix sert directement les critères 5 et 6.
2. Trois trous rendent pourtant faux les tableaux de couverture du §9 : la restauration d'une sauvegarde plus ancienne peut redonner un numéro déjà sorti (critère 6), une pièce `Controlee` ou anciennement `Manquante` échappe aux contrôles inverses (critère 3), et l'inventaire n'existe pas dans le modèle (critère 1).
3. Le webhook W08 et le journal d'audit ne tiennent pas les cas bloquants de droits et d'audit (REC-129, REC-132, REC-133, REC-138, REC-139).
4. La charge annoncée pour la semaine 42 (67 h d'archive plus 32 h d'ERP, soit environ 99 h en cinq jours) est intenable, et le go du 16 octobre exige des fonctions que le backlog livre le 19.
5. L'ajout d'une base PostgreSQL dédiée est défendable mais n'a pas été soumis à l'utilisateur comme un écart à sa décision « n8n + NocoDB » ; la migration des métadonnées de NocoDB et de n8n qui l'accompagne élargit le périmètre sans nécessité.

## 2. Constats

Gravité : 13 bloquants, 14 majeurs, 8 mineurs (35 constats).

### Bloquants

#### RS-01 — La restauration d'une sauvegarde antérieure peut réémettre un identifiant déjà sorti
- **Gravité** : Bloquant (critère 6, REC-104, Q19).
- **Emplacement** : `01-CONCEPTION.md` ADR-03, §5 W07a, §8.4, §8.5 ; `02-BACKLOG.md` ARC-007, ARC-015.
- **Constat** : ADR-03 démontre l'absence de doublon tant que la base n'est pas restaurée. Il ne traite pas le cas où l'on restaure le dump de la nuit (1 h) après des attributions faites dans la journée.
- **Preuve** : soit le dump de la nuit N, avec `compteurs.dernier = 100` pour 2025. Le jour N+1, les pièces 101 à 150 sont attribuées, leurs fichiers sont écrits sous `fichiers/Archive/…` avec `FT-PC-2025-00101` à `00150` dans le nom et, en option A, l'ERP (qui a sa propre sauvegarde de 2 h) enregistre des écritures qui les citent. La base de l'archive est perdue et restaurée depuis le dump N : le compteur revient à 100. La prochaine validation reçoit `FT-PC-2025-00101`. W02 ne voit pas de conflit, car le nom de fichier contient aussi la date, le tiers et le montant (§4.6) : il est différent, donc l'étape (3) « fichier final existe déjà » ne se déclenche pas. E05 ne compte que les lignes de la base restaurée et ne voit rien. E02 ne voit rien non plus : l'identifiant cité par l'ERP est de nouveau « connu », mais il désigne une autre pièce. Résultat : deux fichiers et deux pièces réelles portent le même identifiant, sans alerte. La perte de travail de tri d'une journée (RPO de 24 h pendant l'archivage en masse) aggrave le cas.
- **Correction proposée** :
  1. Tenir une **marque haute hors base** : à chaque attribution, W02 (ou la fonction via `NOTIFY` relayé par n8n) ajoute une ligne `annee;numero;id_piece;empreinte;horodatage` à un fichier en ajout seul `/srv/archive/registre_ids/AAAA.log`, copié vers GCS à chaque lot (objet nommé par horodatage, jamais écrasé).
  2. Écrire une **procédure de recalage obligatoire après toute restauration** (dans §8.5 et ARC-015) : mettre l'archive en mode maintenance (paramètre `attribution_suspendue = vrai` lu par la fonction, qui refuse alors toute attribution) ; calculer pour chaque année le maximum observé dans le registre hors base, dans les noms de fichiers sous `fichiers/Archive/`, dans les objets GCS et dans le dernier export des écritures de l'ERP ; réintégrer chaque pièce présente sur disque mais absente de la base par une fonction d'administration `reintegrer_piece(id_piece, empreinte, chemin…)` journalisée ; porter `compteurs.dernier` au maximum observé ; lever la suspension.
  3. Ajouter à E05 une comparaison entre la base et le registre hors base, et à E06 la détection des fichiers présents sur disque sans ligne `pieces`.
  4. Réduire le RPO pendant l'archivage en masse : dump toutes les deux heures de 8 h à 20 h pendant S43 et S44, ou archivage continu des journaux de transactions de PostgreSQL vers GCS. La valeur cible est une décision (D9).
  5. Ajouter à ARC-007 le test : sauvegarde S1, 20 attributions, restauration de S1, recalage, nouvelle attribution, résultat `…-00021` et non `…-00001` (REC-104).

#### RS-02 — La charge de la semaine 42 est intenable et les leviers proposés ne la ramènent pas à une personne
- **Gravité** : Bloquant (faisabilité de l'échéance).
- **Emplacement** : `02-BACKLOG.md` §1, §8 ; `01-CONCEPTION.md` R5.
- **Constat** : l'addition est exacte (ARC-001 à ARC-020 = 67 h ; ARC-022 à ARC-030 hors ARC-021 = 29 h ; ARC-031 à ARC-035 = 11 h ; après le 31 octobre = 7 h ; ERP J03 + J07 + J08 = 0,5 + 1,5 + 2 = 4 jours-personne, soit environ 32 h). Le total de S42 est donc d'environ 99 h pour un développeur seul sur cinq jours ouvrés, soit près de 20 h par jour. Les leviers ne suffisent pas : le levier 1 (numériser tôt) ne retire aucune heure de développement ; le levier 2 (décaler J08) retire au plus 16 h et laisse environ 83 h ; le levier 3 (renfort) n'a ni nom ni date.
- **Preuve complémentaire** : plusieurs estimations sont optimistes pour un développeur qui découvre en même temps la version installée de NocoDB et de n8n : ARC-005 (migration des métadonnées de NocoDB et de n8n vers PostgreSQL, préservation du CRM des devis, redémarrage complet) en 5 h ; ARC-007 (fonction, machine de 14 transitions, contrôle par rôle, champs obligatoires par statut, journal, huit tests dont la concurrence) en 6 h ; ARC-010 (une vingtaine de vues verrouillées pour cinq rôles) en 4 h. Aucune marge n'est prévue pour corriger ce que la recette R1 trouvera le 14.
- **Correction proposée** : adopter le minimum viable du §5 (environ 52 h avant le go, sans travail sur l'ERP en S42), reporter la mise en ligne de l'ERP (J07, J08) en S43 avec l'option B comme mode de démarrage, et faire décider la date du go (D2).

#### RS-03 — Le go du 16 octobre et le jalon J09a sont incompatibles avec le backlog et avec le critère 5
- **Gravité** : Bloquant (REC-177, critère 5, chemin critique des jalons).
- **Emplacement** : `02-BACKLOG.md` §4, §5, §9 ; `JALONS-EXECUTION.md` J08, J09a ; `03-PLAN-RECETTE.md` §5, §6.
- **Constat** :
  1. Le critère de J08 est « un écran ouvre la pièce depuis l'écriture ». Le backlog livre W08 (ARC-024) et l'import des écritures W05 (ARC-023) le lundi 19, donc après le go. La liste ARC-020 ne reprend pas ce critère.
  2. La recette exige pour le go que tous les cas bloquants des vagues R1 et R2 soient passés ; R2 (16 octobre) contient REC-044, 045, 049, 055, 064, 065, 143, 152, qui dépendent de W05, W06, W08 et de l'ERP, livrés entre le 19 et le 22.
  3. Le jalon J09a (« année la plus ancienne classée et indexée », du 14 au 16) n'apparaît nulle part dans la conception ni dans le backlog. Il suppose des attributions en production dès le 14, alors que la restauration exigée « avant l'archivage en masse » (critère 5, ARC-015) a lieu le 14 ou le 15 et que W04 (pièces manquantes, nécessaire au critère de J09a) n'est livré que le 19.
  4. Le chemin critique du §9 place ARC-018 après le go, alors qu'ARC-018 est daté du jeudi 15 et que « option ERP décidée » est un critère d'ARC-020.
- **Correction proposée** : faire trancher par la Direction (D2) l'une de ces deux solutions, puis aligner jalons, backlog et recette :
  - (a) Go technique le vendredi 16 limité à R1 (dépôt, attribution, rangement, persistance, restauration, alertes) ; J09a décalé au 19–20 ; le critère « écran pièce depuis l'écriture » et la vague R2 déplacés au mercredi 21 ;
  - (b) Go le lundi 19 à midi avec le samedi 17 en réserve, R1 et un R2 réduit (import des écritures et rapports inverses en option B).
  Dans les deux cas, ajouter ARC-018 aux dépendances d'ARC-020 et fixer une seule date de bascule vers l'option B (la conception dit le 19, le backlog le 20).

#### RS-04 — Le webhook W08 révèle l'existence d'une pièce, son tiers et son montant à un appelant non authentifié
- **Gravité** : Bloquant (REC-138, REC-139 ; §6 de la fiche des règles de sécurité).
- **Emplacement** : `01-CONCEPTION.md` §5 W08, §8.3, §4.6.
- **Constat** : W08 est un webhook n8n en `GET` sans authentification. Pour un identifiant connu, il répond par une redirection ; pour un identifiant inconnu, par une page « introuvable ». La différence de réponse est déjà un oracle d'existence (REC-139). Surtout, l'adresse de redirection contient le nom de fichier, qui contient par construction le tiers et le montant (`…_socofer-sarl_450000.pdf`) : l'en-tête `Location` les livre à n'importe qui, avant toute authentification Nginx (REC-138). Les mêmes noms finissent dans le journal d'accès de Nginx, ce qui met des données de tiers et des montants dans un journal.
- **Correction proposée** : supprimer W08. Servir les pièces par une adresse stable `https://<archive>/piece/FT-PC-AAAA-NNNNN` protégée par l'authentification Nginx, où l'identifiant est résolu côté serveur (lien symbolique `par-id/FT-PC-AAAA-NNNNN.pdf` créé par W02, ou `auth_request` vers un petit service interne). Réponse identique (401 puis 404 générique) pour un identifiant inconnu et pour un appelant non autorisé. Format de journal Nginx qui n'écrit que l'identifiant. Cette solution est aussi moins coûteuse qu'ARC-024 (environ 1 h au lieu de 2 h).

#### RS-05 — Une écriture qui porte un motif « pièce manquante » sans déclaration n'est jamais signalée
- **Gravité** : Bloquant (critère 2 ; REC-065 ; Q14 contredite).
- **Emplacement** : `01-CONCEPTION.md` §4.2 `ecritures.motif_piece_manquante`, §5 W06 code E01, §7.2, §7.3.
- **Constat** : E01 signale « écriture sans pièce ni motif de pièce manquante ». Une écriture avec un motif en texte libre et sans déclaration passe donc le contrôle. Le critère 2 parle de « pièce manquante **déclarée** », et la recette attend que EW-3 (motif sans déclaration) figure au rapport. La conception donne pourtant déjà la bonne solution : une pièce manquante déclarée reçoit un identifiant FT-PC (T7).
- **Correction proposée** : une écriture est justifiée si et seulement si elle cite un identifiant dont la pièce est `Classee`, `Saisie_ERP`, `Controlee` ou `Manquante` (déclarée). Le champ `motif_piece_manquante` devient informatif. E01 = aucune citation valide ; E02 = identifiant inconnu, annulé ou rejeté. Côté ERP (option A), le « motif » de US-ARC-02 se saisit en citant l'identifiant de la déclaration. À faire confirmer par la Direction (D5).

#### RS-06 — Le journal d'audit ne tient ni l'auteur nominatif, ni la trace des refus, ni l'immuabilité face au développeur
- **Gravité** : Bloquant (REC-129, REC-132, REC-133 ; majeur pour REC-131, REC-134, REC-160).
- **Emplacement** : `01-CONCEPTION.md` §4.2 `journal_audit`, §4.4, §8.1, R4 ; `02-BACKLOG.md` ARC-038 (après le 31 octobre).
- **Constat et preuve** :
  1. **Auteur** : la conception reconnaît que NocoDB ne transmet pas l'utilisateur à PostgreSQL ; `trie_par`, `valide_par`, `controle_par` sont des noms choisis dans une liste par la personne elle-même. REC-129 exige un auteur nominatif : non tenu. La règle des quatre yeux (T5, T11) repose sur ces mêmes noms déclaratifs : une personne peut choisir le nom d'une autre.
  2. **Refus tracés** (faux) : un déclencheur qui refuse une opération lève une exception ; PostgreSQL annule alors toute la transaction, y compris la ligne de journal que ce déclencheur aurait écrite. PostgreSQL n'a pas de transaction autonome. Une tentative refusée n'est donc jamais dans `journal_audit` (REC-131, REC-132, REC-133).
  3. **TRUNCATE** (faux) : `TRUNCATE` ne déclenche pas les déclencheurs `DELETE` par ligne. La conception ne prévoit ni le retrait du droit `TRUNCATE` ni un déclencheur `BEFORE TRUNCATE`.
  4. **Développeur** : `arch_owner` est propriétaire des tables ; il peut désactiver les déclencheurs (`ALTER TABLE … DISABLE TRIGGER`) puis modifier ou supprimer le journal et les pièces. REC-132, REC-133 et REC-160 demandent un refus « y compris pour le développeur » ; ce n'est pas tenable dans une base dont il est administrateur, et le chaînage qui rendrait l'altération visible est repoussé après le 31 octobre.
- **Correction proposée** :
  - Activer la journalisation des erreurs de PostgreSQL avec le nom de l'utilisateur et la requête (`log_min_error_statement = error`, `log_line_prefix` avec `%u`) et la conserver avec les sauvegardes : c'est la trace des refus.
  - Retirer `TRUNCATE` à tous les rôles applicatifs et ajouter des déclencheurs `BEFORE TRUNCATE` sur les tables protégées.
  - Ramener ARC-038 (chaînage par empreinte, 3 h) dans le minimum viable et publier chaque nuit l'empreinte de la dernière ligne du journal dans un objet GCS non modifiable et dans le rapport W06 : l'altération par un administrateur devient détectable (REC-134).
  - Faire vérifier par ARC-002 si la version installée de NocoDB fournit un journal d'activité ou des champs système « créé par / modifié par » utilisables sur une source externe (non vérifiable ici). Si oui, en faire la source de l'auteur ; sinon, faire accepter par écrit par la Direction que l'auteur nominatif et les quatre yeux sont déclaratifs, et requalifier REC-129 (D7). Une dérogation sur un cas bloquant n'est pas permise par la recette : la requalification doit être une décision explicite.

#### RS-07 — Une pièce `Controlee` ou anciennement `Manquante` échappe aux contrôles inverses ou bloque l'import
- **Gravité** : Bloquant (critère 3 ; REC-064 ; Q16).
- **Emplacement** : `01-CONCEPTION.md` §4.3 T9, T10, T11, T14 ; §5 W05, W06 E03, E04.
- **Constat et preuve** :
  1. T9 fait passer une pièce `Manquante` citée à `Saisie_ERP`. Si l'écriture disparaît, T10 la ramène à `Classee`. Or une pièce manquante n'a ni fichier ni `chemin`, et `chemin` est obligatoire « dès `Classee` » (déclencheur des champs obligatoires) : la mise à jour échoue, et comme W05 met à jour les statuts, l'import échoue ou laisse des statuts faux. Par ailleurs, une fois en `Saisie_ERP`, la pièce ne peut plus suivre T8 (`Manquante` → `Classee`) à l'arrivée du duplicata, et le tableau de bord ne la compte plus parmi les manquantes.
  2. E03 ne cherche que les pièces `Saisie_ERP` sans écriture. T10 ne part que de `Saisie_ERP`. Une pièce `Controlee` dont l'écriture disparaît reste `Controlee` et n'est signalée par aucun contrôle : c'est exactement une « pièce saisie sans écriture » (critère 3).
  3. T14 (correction) ramène une pièce `Saisie_ERP` ou `Controlee` à `Classee` jusqu'au prochain import : la pièce apparaît à tort dans E04 et perd sa trace de contrôle.
- **Correction proposée** : séparer deux informations qui sont aujourd'hui mélangées dans `statut`.
  - `statut` (stocké) ne garde que le cycle de vie de la pièce : `A_trier`, `A_valider`, `Classement_en_cours`, `Classee`, `Manquante`, `Rejetee`, `Annulee`.
  - « Saisie dans l'ERP » est **calculée** dans une vue (au moins une écriture présente au dernier import la cite) ; « Contrôlée » est un fait enregistré (`controle_par`, `date_controle`) affiché par la vue. La vue présente les libellés de la fiche (§4).
  - E03 devient « pièce contrôlée, ou marquée saisie par un humain, sans écriture présente » ; E04 « pièce `Classee` ou `Manquante` sans écriture » avec un délai paramétrable, mis à 0 pour les contrôles J14 et la recette (REC-064).
  - T9, T10, T12 disparaissent, W05 n'écrit plus de statut (ce qui règle aussi une partie de RS-13).

#### RS-08 — L'inventaire n'existe pas dans le modèle : le critère 1 n'est pas démontrable
- **Gravité** : Bloquant (critère 1 ; REC-080, REC-178).
- **Emplacement** : `01-CONCEPTION.md` §4, §9 (ligne « Critère 1 »).
- **Constat** : la conception écrit que le critère 1 est couvert « si l'inventaire J02 est saisi dans un tableau comparable », sans créer ce tableau. Aucune table, aucune vue, aucun contrôle ne compare l'inventaire à l'archive.
- **Correction proposée** : table `inventaire` (`exercice`, `type_piece`, `nb_attendu`, `source`, `saisi_par`, `date`), vue `v_inventaire_vs_archive` (attendu, classées, manquantes déclarées, rejetées, en cours, écart) et code d'écart E11 « écart inventaire » dans W06. Environ 1 h. La recette compare par comptage ; la limite (pas de rapprochement pièce par pièce) est déjà notée au §4.3 de la recette.

#### RS-09 — Le parcours « pièce manquante » ne peut pas fonctionner tel qu'il est écrit
- **Gravité** : Bloquant (critère 1, critère 2 ; REC-073, REC-080 ; Q17).
- **Emplacement** : `01-CONCEPTION.md` ADR-03 (pseudo-code), §4.1, §4.2 `pieces_manquantes`, §4.3 T7, T8, §5 W04.
- **Constat et preuve** :
  1. W04 « crée la ligne `pieces` puis appelle `attribuer_id_piece` ». Si la ligne est créée au statut `Manquante`, le déclencheur des champs obligatoires la refuse, car `id_piece` est obligatoire « dès `Classement_en_cours` ou `Manquante` ». Si elle est créée dans un autre statut, la fonction la refuse, car elle n'accepte que « `A_valider` avec Valider, ou `Manquante` sans id ». Les deux règles s'excluent.
  2. Le formulaire NocoDB « Déclarer une pièce manquante » doit écrire dans une table ; `pieces_manquantes.piece_id` est obligatoire et la pièce n'existe pas encore. Le formulaire n'a donc pas de table cible valide.
  3. Les deux appels de W04 (création, puis attribution) sont deux transactions : une coupure entre les deux laisse une ligne orpheline, et un rejeu crée une seconde déclaration.
  4. T8 : le duplicata ou l'attestation est déposé « comme un fichier du lot ». W01 crée alors une **nouvelle** ligne `pieces` au statut `A_trier` avec l'empreinte du fichier. Pour « rattacher » ce fichier à la pièce manquante, il faudrait déplacer l'empreinte d'une ligne à l'autre, alors que `empreinte_sha256` est unique et non modifiable, et que la ligne créée ne peut pas être supprimée. Le mécanisme n'est pas défini.
- **Correction proposée** :
  - Table de saisie `declarations_manquantes` (cible du formulaire, `piece_id` vide au départ, statut `A_traiter`/`Traitee`), et fonction unique `declarer_piece_manquante(declaration_id)` qui, dans une seule transaction, crée la pièce, attribue l'identifiant, crée `pieces_manquantes`, relie la déclaration et rend le résultat ; rejouable (renvoie l'identifiant si la déclaration est déjà traitée).
  - Fonction `rattacher_justificatif(piece_manquante_id, piece_deposee_id)` qui transfère fichier, empreinte et taille de la pièce déposée vers la pièce manquante (seule exception documentée à l'immuabilité de l'empreinte, exécutée par `arch_n8n`, journalisée) et passe la pièce déposée à un statut terminal `Fusionnee` qui pointe vers l'identifiant conservé. La pièce manquante passe ensuite par W02 (rangement) puis à `Classee`.
  - Règle d'année : l'identifiant d'une pièce manquante prend l'année de la date estimée ; si le duplicata porte une autre année, appliquer la règle « changement d'année » (annulation et `remplace_par`) déjà proposée au §4.3.

#### RS-10 — US-ARC-09 (priorité M) et le cas bloquant REC-152 sont exclus sans décision
- **Gravité** : Bloquant (décision ; REC-152).
- **Emplacement** : `01-CONCEPTION.md` §7.1 F4, §9 ; `02-BACKLOG.md` ARC-037.
- **Constat** : la conception repousse l'archivage automatique des PDF de l'ERP après le 31 octobre. C'est raisonnable (code de l'ERP inaccessible, ERP pas en ligne), mais la recette classe REC-152 en bloquant et interdit toute dérogation sur un bloquant (§5 de la recette). Sans décision, la recette ne peut pas être déclarée passée.
- **Correction proposée** : faire décider par la Direction (D6) le retrait d'US-ARC-09 du périmètre du 31 octobre et la requalification de REC-152 à REC-157 en vague « Post ». En attendant, les factures de vente produites par l'ERP sont imprimées en PDF et déposées comme des lots ordinaires de type `6_Ventes` si ce type entre dans le périmètre (Q30).

#### RS-11 — Base PostgreSQL dédiée : choix défendable, mais écart non présenté comme tel et migration hors périmètre
- **Gravité** : Bloquant (décision de l'utilisateur ; ARC-005 touche le site en production).
- **Emplacement** : `01-CONCEPTION.md` §1, ADR-01, §2.1 ; `02-BACKLOG.md` ARC-005.
- **Constat** :
  1. **Compatibilité** : la décision « n8n + NocoDB » porte sur la plateforme. Une base PostgreSQL sous NocoDB reste compatible si NocoDB l'affiche et l'édite comme source ; c'est la seule façon raisonnable d'obtenir une attribution transactionnelle et des règles d'intégrité indépendantes de l'outil. La justification d'ADR-01 tient.
  2. **Honnêteté** : la conception présente ce choix comme une option technique (§1 point 1, ADR-01) et réserve son encadré « Écart » au déplacement de l'index hors de l'ERP. Elle ne dit pas à l'utilisateur ce que le choix change pour lui : la logique métier (transitions, quatre yeux, attribution, champs obligatoires) vit dans du PL/pgSQL et non dans NocoDB ou n8n ; la maintenance exige un développeur capable d'écrire des migrations SQL ; NocoDB devient un écran dont les messages d'erreur seront ceux de PostgreSQL. Ce n'est pas mentionné dans les décisions à demander.
  3. **Non vérifiable** : la prise en charge d'une base PostgreSQL externe en lecture et écriture par la version installée de NocoDB (avec liens par clé étrangère, vues SQL, remontée lisible des erreurs de déclencheur) dépend de la version et de l'édition ; ARC-002 doit le tester le 12 octobre avant toute autre tâche.
  4. **Périmètre** : ADR-01 et ARC-005 migrent aussi les métadonnées de NocoDB et la base interne de n8n vers PostgreSQL. La fiche exige de corriger la persistance, pas de changer de moteur. Cette migration touche le CRM des devis du site (R2, R15) et coûte des heures en S42 ; un volume persistant monté sur la base existante suffit à corriger le défaut de juin 2026.
- **Correction proposée** : ajouter dans `01-CONCEPTION.md` un encadré « Écart 2 » qui décrit la base dédiée, ses conséquences de maintenance et le repli (option 2), et le soumettre à l'utilisateur (D1). Dans ARC-005, limiter S42 à : sauvegarde de l'existant, montage de volumes persistants pour NocoDB et n8n tels qu'ils sont, redémarrage complet et vérification ; création d'un conteneur PostgreSQL dédié à `archive_compta` seulement. La migration des métadonnées vers PostgreSQL passe après le 31 octobre.

#### RS-12 — W01 : un lot interrompu n'est jamais repris, et son rejeu compte ses propres fichiers comme doublons
- **Gravité** : Bloquant (REC-106).
- **Emplacement** : `01-CONCEPTION.md` §5 W01.
- **Constat et preuve** :
  1. L'étape (1) ne reprend que les lots « non encore connus ou en `Erreur` ». Après un arrêt brutal du serveur, n8n ne lance pas son workflow d'erreur : le lot reste `En_ingestion` pour toujours.
  2. Si on le relance à la main, chaque fichier déjà ingéré a son empreinte dans `pieces` et reçoit le résultat `Doublon_exact` : `nb_doublons` est faux et le lot passe `Ingere_avec_ecarts` alors que REC-106 attend « 0 doublon ». L'unicité de `fichiers_deposes` sur (lot, nom) fait en plus échouer l'insertion au lieu de la sauter.
  3. REC-114 (redépôt du même lot) : si le dossier garde le même code, W01 le considère comme connu et ne signale aucun doublon ; s'il reçoit un nouveau code, le cas passe. Le comportement n'est pas défini.
- **Correction proposée** : reprendre aussi les lots `En_ingestion` dont `modifie_le` a plus de 15 minutes ; pour chaque fichier, lire d'abord `fichiers_deposes` (lot, nom) et sauter le fichier déjà traité ; ne classer en `Doublon_exact` qu'un fichier dont l'empreinte appartient à une pièce d'un **autre** lot ; refuser un dossier dont le code de lot existe déjà et dont le manifeste diffère, et imposer un nouveau code pour un redépôt volontaire.

#### RS-13 — W05 : une coupure entre l'import et la mise à jour des pièces n'est jamais rattrapée
- **Gravité** : Bloquant (REC-113, critère 3).
- **Emplacement** : `01-CONCEPTION.md` §5 W05 étapes (1), (3), (4).
- **Constat et preuve** : l'étape (3) est une transaction, l'étape (4) (statuts et `ref_ecriture`) est faite après. Une coupure entre les deux laisse des écritures importées et des pièces non mises à jour. Le rejeu est refusé à l'étape (1) parce que l'empreinte du fichier est « déjà importée ». Les statuts restent faux jusqu'au prochain fichier différent.
- **Correction proposée** : faire les étapes (2) à (4) dans une seule transaction, et n'enregistrer l'empreinte comme « importée » qu'au statut `Importe`. Avec RS-07 (statut « saisie » calculé par une vue), l'étape (4) se réduit à `ref_ecriture`, qui peut aussi devenir une vue. Ajouter : une seule source (ERP ou EXCEL) par exercice, sinon les écritures reprises d'Excel puis exportées de l'ERP sont comptées deux fois dans E01.

### Majeurs

#### RS-14 — Sauvegarde : le compte sans droit de suppression ne peut pas écraser un objet, et la copie 3 complète par le réseau du bureau est irréaliste
- **Gravité** : Majeur (critère 5 ; REC-094, REC-101).
- **Emplacement** : `01-CONCEPTION.md` §5 W07a (idempotence), §8.2, §8.4 ; `02-BACKLOG.md` ARC-014.
- **Constat et preuve** :
  1. W07a dit qu'« un envoi refait remplace l'objet du même nom », et §8.2 donne au compte de service le droit de créer mais pas de supprimer. Dans Google Cloud Storage, remplacer un objet existant exige le droit de suppression (le rôle « Storage Object Creator » ne permet pas d'écraser). Un rejeu de la sauvegarde échouera. Faux tel qu'écrit.
  2. La copie 3 est une « copie complète depuis GCS » chaque vendredi, par le réseau du bureau décrit comme instable, pour un volume inconnu ; la restauration manuelle du 30 octobre se fait aussi « à partir de GCS seulement » sur un poste du bureau. À plein volume, ce n'est pas tenable dans une journée, et cela crée des frais de sortie GCS non chiffrés.
  3. Le contenu « fichiers ajoutés depuis la veille » ne dit pas si `a_trier/` est inclus. Or le poste supprime son lot local après « ingestion et sauvegarde de la nuit » : si `a_trier/` n'est pas sauvegardé, une pièce non encore classée n'existe plus qu'en un exemplaire.
  4. La sauvegarde des fichiers et le dump ne sont pas pris au même instant : une pièce rangée entre les deux a un `chemin` sans fichier dans la sauvegarde.
- **Correction proposée** : noms d'objets uniques (date, heure, identifiant d'exécution), jamais réécrits ; copie 3 incrémentale (synchronisation des seuls objets nouveaux, avec vérification d'empreinte) ; restauration du 30 octobre faite sur une machine dans le nuage ou sur l'environnement de test du VPS, le poste du bureau ne servant qu'à lire un échantillon ; inclure `a_trier/` et `registre_ids/` ; faire le dump après la copie des fichiers et vérifier dans W07b que chaque `chemin` du dump existe dans la copie. Réaliser la copie et l'envoi par une tâche planifiée de l'hôte (`pg_dump` et outil de synchronisation) plutôt que par n8n : moins d'heures et moins de dépendances aux capacités de n8n (R11).

#### RS-15 — Droits PostgreSQL trop larges : identifiant imposable, compteur modifiable, journal falsifiable
- **Gravité** : Majeur (critère 6 ; REC-043).
- **Emplacement** : `01-CONCEPTION.md` ADR-03 (garde-fous), §4.4, §8.1.
- **Constat** :
  1. Le déclencheur autorise `arch_n8n` à écrire `id_piece`. Un nœud n8n mal configuré peut donc insérer ou poser un identifiant quelconque, hors compteur ; l'unicité empêche le doublon, pas la rupture de séquence (REC-043 demande que l'identifiant imposé soit ignoré ou refusé).
  2. `arch_nocodb` et `arch_n8n` ont « lecture, insertion, mise à jour » sans précision par table : ils peuvent augmenter `compteurs.dernier` (le déclencheur n'interdit que la diminution) et créer un trou, et insérer dans `journal_audit` des lignes fabriquées.
- **Correction proposée** : `attribuer_id_piece`, `declarer_piece_manquante`, `rattacher_justificatif`, `reintegrer_piece` en `SECURITY DEFINER`, propriété d'un rôle sans connexion ; seul ce rôle écrit `id_piece`, `compteurs` et `journal_audit` ; aucun droit d'écriture directe sur ces tables pour `arch_nocodb` et `arch_n8n`. Écrire la matrice des droits table par table dans §8.1.

#### RS-16 — Le repli en option B fait tomber des cas bloquants que la conception ne cite pas
- **Gravité** : Majeur (REC-044, REC-045, REC-049, REC-055 ; US-ARC-02, US-ARC-03).
- **Emplacement** : `01-CONCEPTION.md` ADR-04, §7.4, §9.
- **Constat** : en option B, aucune écriture n'est refusée à la saisie (REC-045 échoue), l'ERP n'affiche pas l'identifiant (REC-044 échoue en partie) et le lien `piece_id_saisi` de NocoDB peut désigner une pièce `A_trier`, `Rejetee` ou `Annulee` (REC-049 échoue). La conception dit seulement « partielle ». Comme l'option B est le mode de démarrage le plus probable (RS-02), ces cas doivent être traités.
- **Correction proposée** : un déclencheur sur `ecritures.piece_id_saisi` refuse une pièce qui n'est pas `Classee` ou `Manquante` ; la vue « Écritures à relier » ne propose que ces pièces ; documenter que REC-045 n'est tenu qu'en option A et le faire acter (D2) ; définir la règle quand `piece_id_cite` et `piece_id_saisi` diffèrent après le passage en option A (`piece_id_cite` l'emporte, écart créé).

#### RS-17 — Rapprochement bancaire : la conception enregistre un résultat, elle ne permet pas le contrôle demandé
- **Gravité** : Majeur (critère 7 ; REC-082, REC-085 bloquants ; Q18).
- **Emplacement** : `01-CONCEPTION.md` §4.2 `rapprochements_bancaires`, §9.
- **Constat** : les soldes sont saisis à la main, l'état n'a pas de valeur « relevé manquant » (Brouillon, Rapproche, Ecart_explique), et aucune ligne de relevé n'est appariée : REC-082 (« ligne du relevé non appariée listée ») et REC-085 (« relevé manquant, jamais rapproché ») ne peuvent pas passer.
- **Correction proposée** : calculer `solde_comptable_fcfa` depuis `ecritures` (comptes de banque, à la date de fin de mois) au lieu de le saisir ; ajouter le statut `Releve_manquant`, interdire `Rapproche` si `piece_releve` est vide ou si l'écart n'est pas nul ; joindre l'état de rapprochement détaillé du comptable (tableur ou ERP) comme pièce `5_Banque` liée, qui porte la liste des éléments en suspens. L'appariement ligne à ligne reste hors outil : faire requalifier la partie « ligne non appariée listée » de REC-082 en « listée dans l'état joint » (D8).

#### RS-18 — Quatre yeux sur « Contrôlée » : la conception compare au trieur, pas au saisisseur
- **Gravité** : Majeur (Q31 contredite ; REC-146).
- **Emplacement** : `01-CONCEPTION.md` §4.1 `controle_par`, §4.3 T11 ; §7.2.
- **Constat** : T11 exige `controle_par ≠ trie_par`. La question de la recette porte sur la personne qui a saisi l'écriture, qui n'est pas connue de l'archive : le format F1 n'a pas de colonne `saisi_par`.
- **Correction proposée** : ajouter `saisi_par` (identifiant de l'utilisateur de l'ERP ou du comptable) au CSV F1 et exiger `controle_par ≠ saisi_par` et `controle_par ≠ trie_par` ; à faire confirmer (D10).

#### RS-19 — Correction d'une pièce classée : renommage en place, contraire au versionnement exigé
- **Gravité** : Majeur (exigence transverse « toute modification après validation crée une version » ; Q22 contredite ; REC-128).
- **Emplacement** : `01-CONCEPTION.md` §4.3 T14 et paragraphe suivant ; `02-BACKLOG.md` ARC-025.
- **Constat** : T14 recalcule le nom et déplace le fichier ; ARC-025 attend « ancien nom absent du rangement ». Cela suppose de supprimer ou déplacer un fichier déclaré « en lecture seule après rangement », sans version ; les sauvegardes gardent l'ancien nom, qu'une restauration fera réapparaître et qu'E06 signalera comme orphelin. Le journal garde l'avant et l'après des champs, pas l'ancien emplacement du fichier.
- **Correction proposée** : table `pieces_versions` (copie de la ligne avant correction, motif, auteur) ; ancien fichier déplacé dans `fichiers/_versions/<id_piece>/` et non supprimé ; E06 ignore ce répertoire. Pour le minimum viable, réserver la correction après classement au responsable de validation par une fonction d'administration, sans automatisation W02 (§5).

#### RS-20 — Navigation « chiffre du bilan → pièces » : aucune vue ne permet de vérifier la somme
- **Gravité** : Majeur (REC-059 bloquant, critère 4).
- **Emplacement** : `01-CONCEPTION.md` §6 (recherche depuis l'état financier), §9.
- **Constat** : l'étape « poste du bilan → comptes » est laissée hors outil, ce qui est acceptable ; mais l'archive n'a aucune vue qui donne le solde d'un compte par exercice, donc REC-059 (« la somme des écritures égale le chiffre du bilan ») ne peut pas être vérifié dans l'outil.
- **Correction proposée** : vue `v_balance` (exercice, compte, total débit, total crédit, solde, nombre d'écritures, nombre d'écritures sans pièce valide) ouverte sur la liste des écritures du compte, elles-mêmes reliées à leur pièce. Comparer `v_balance` à la balance de l'ERP au moment de chaque import (écart signalé).

#### RS-21 — Montants : les avoirs sont refusés et « sans montant » est confondu avec zéro
- **Gravité** : Majeur (Q05, Q08).
- **Emplacement** : `01-CONCEPTION.md` §4.1 `montant_fcfa`.
- **Constat** : `montant_fcfa` est un entier ≥ 0, 0 étant admis « pour un contrat sans montant ». Un avoir fournisseur ou client, pièce courante dans le BTP, ne peut pas être enregistré ; et un bon de livraison sans montant devient indiscernable d'une pièce dont le montant est réellement 0 (REC-024 attend que 0 reste distinct de vide).
- **Correction proposée** : montant toujours positif ou nul plus un champ `sens` (Normal, Avoir) ou un type de pièce « Avoir » ; champ booléen `sans_montant` (montant alors vide, nom de fichier terminé par `_sans-montant`). À faire trancher à J04 (D4).

#### RS-22 — États sans issue : `Rejetee` bloque à jamais un fichier, `Classement_en_cours` n'a pas de sortie en cas d'échec définitif
- **Gravité** : Majeur.
- **Emplacement** : `01-CONCEPTION.md` §4.3 T4, T5, T6 ; ADR-05.
- **Constat** : une pièce `Rejetee` garde son empreinte, unique : si le rejet est une erreur, le même fichier redéposé devient `Doublon_exact` d'une pièce rejetée et ne peut plus jamais entrer. Une pièce `Classement_en_cours` dont le fichier source est illisible ou perdu est reprise toutes les 10 minutes sans fin ; aucune transition humaine ne la sort (T13 ne part que de `Classee` ou `Manquante`).
- **Correction proposée** : transition `Rejetee` → `A_trier` (responsable de validation, motif) ; transition `Classement_en_cours` → `Annulee` (responsable de validation, motif ; l'identifiant reste consommé et visible) ; dans W02, après 5 échecs, arrêt de la reprise automatique et passage en file `erreurs_workflow` (Q21).

#### RS-23 — W04 et les envois en double : pas de clé d'idempotence côté déclarations et dépôts de CSV
- **Gravité** : Majeur.
- **Emplacement** : `01-CONCEPTION.md` §5 W04 (idempotence), W05.
- **Constat** : la conception accepte qu'« un formulaire soumis deux fois crée deux déclarations », chacune consommant un identifiant définitivement (annulation obligatoire). Pendant J13, où toutes les déclarations sont faites, cela produira des numéros annulés en nombre, que l'expert-comptable devra comprendre.
- **Correction proposée** : clé d'unicité métier sur `declarations_manquantes` (type, tiers normalisé, date estimée, montant estimé) en avertissement bloquant que le comptable confirme explicitement ; l'identifiant n'est attribué qu'après confirmation (RS-09).

#### RS-24 — Le tableau de bord est « comparé au plan » sans que le plan existe dans le modèle
- **Gravité** : Majeur (US-ARC-11 ; Q25 ; REC-166).
- **Emplacement** : `01-CONCEPTION.md` §4.2 `v_tableau_bord`, §5 W10.
- **Correction proposée** : table `plan_avancement` (semaine, exercice, type, nb_prevu), alimentée à J06c par le responsable de validation ; `v_tableau_bord` calcule l'écart. Indicateurs du programme §5.8 (« triées », « temps moyen ») à inclure explicitement.

#### RS-25 — Modifications concurrentes : la colonne `version` n'est pas exploitée par NocoDB
- **Gravité** : Majeur (REC-039 ; non vérifiable).
- **Emplacement** : `01-CONCEPTION.md` §4.1 `version`.
- **Constat** : la colonne est incrémentée par déclencheur, mais rien ne compare la version lue à la version écrite ; à notre connaissance NocoDB écrit sans condition (dernier enregistrement gagnant). REC-039 attend un code de conflit.
- **Correction proposée** : faire vérifier par ARC-002 ; à défaut, limiter le risque par l'organisation (une pièce `A_trier` est « prise » par une personne : champ `pris_par` posé à l'ouverture de la vue de tri) et faire requalifier REC-039.

#### RS-26 — Échantillon du critère 4 : tirage non stratifié et parti de la pièce, pas de l'état financier
- **Gravité** : Majeur (REC-182 bloquant ; Q27).
- **Emplacement** : `01-CONCEPTION.md` §4.2 `v_echantillon` ; `02-BACKLOG.md` ARC-032.
- **Constat** : `v_echantillon` tire 30 pièces au hasard ; la recette veut au moins 3 par type, les plus gros montants et des dates limites, et un parcours qui part du chiffre de l'état financier.
- **Correction proposée** : tirer des **écritures** par compte de la balance (graine notée), avec strates (type de pièce, 5 plus gros montants, premier et dernier mois de l'exercice), puis chronométrer « compte → écriture → pièce ». La tolérance (30 sur 30 ou non) reste à décider (D15).

#### RS-27 — L'identifiant ne distingue pas l'environnement de test
- **Gravité** : Majeur (REC-170 ; Q26).
- **Emplacement** : `01-CONCEPTION.md` §8.7.
- **Constat** : la base de test a son propre compteur et produit des `FT-PC-2025-00001` identiques à ceux de la production ; un PDF de test égaré dans un dossier réel est indiscernable.
- **Correction proposée** : paramètre `prefixe_identifiant` (`FT-PC` en production, `FT-TS` en test) lu par la fonction, et contrainte de format qui l'accepte ; filigrane « SPÉCIMEN » imposé par la recette sur les PDF d'essai. Les 50 pièces d'ARC-016 sont réelles et vont en production : le dire explicitement.

### Mineurs

#### RS-28 — Incohérences de dates et de dépendances entre 01, 02 et les jalons
- **Gravité** : Mineur.
- **Emplacement** : `01-CONCEPTION.md` ADR-04 ; `02-BACKLOG.md` ARC-020, ARC-022, ARC-024, ARC-029, §9.
- **Constat** : bascule en option B le 19 (01) ou le 20 (02) ; ARC-020 ne dépend pas d'ARC-018 alors qu'il exige l'option ERP décidée ; ARC-022 porte le jalon « J09a–J10 (lun 19) » alors que J09a finit le 16 ; ARC-024 est rattaché à J08 mais livré le 19 ; ARC-029 (restauration automatique hebdomadaire) dépend de l'environnement de test sur le poste du développeur, qui n'est pas allumé en permanence ; la chaîne du §9 enchaîne ARC-012 → ARC-014 alors qu'ARC-014 ne dépend que d'ARC-005 et ARC-006.
- **Correction proposée** : aligner sur la décision D2 et corriger les dépendances ; faire tourner W07b sur le VPS (projet de test séparé) ou le supprimer du minimum viable.

#### RS-29 — Règle de nommage incomplète pour les cas limites
- **Gravité** : Mineur (REC-029, REC-030 ; Q12).
- **Emplacement** : `01-CONCEPTION.md` §4.6.
- **Correction proposée** : préciser la translittération des ligatures (Œ → oe, Æ → ae), la fusion des tirets successifs, l'absence de tiret final après troncature à 40 caractères, et le cas où le tiers normalisé est vide (refus à T2).

#### RS-30 — Contrainte de date de pièce non réalisable par une contrainte `CHECK`
- **Gravité** : Mineur.
- **Emplacement** : `01-CONCEPTION.md` §4.1 `date_piece`.
- **Constat** : la borne « 1er janvier de la plus ancienne année ouverte » dépend de la table `parametres` ; une contrainte `CHECK` ne peut pas lire une autre table. Il faut un déclencheur, et décider ce qui arrive aux pièces existantes si `annees_ouvertes` change.
- **Correction proposée** : déclencheur avec code d'erreur explicite ; le changement de paramètre ne revalide pas l'existant mais produit un écart.

#### RS-31 — Concurrence de deux exécutions de W02 sur la même pièce
- **Gravité** : Mineur.
- **Emplacement** : `01-CONCEPTION.md` §5 W02 et W03.
- **Constat** : W03 appelle W02, et W02 tourne aussi toutes les 2 minutes ; deux exécutions peuvent traiter la même pièce. La fonction est sûre ; l'écriture de fichier l'est seulement si le nom temporaire est unique par exécution.
- **Correction proposée** : nom temporaire contenant l'identifiant d'exécution ; ou verrou consultatif PostgreSQL (`pg_try_advisory_lock` sur l'identifiant technique de la pièce) pris par W02 pendant le rangement.

#### RS-32 — Données de tiers et montants dans les noms de fichiers, donc dans les journaux
- **Gravité** : Mineur (règle de la fiche : pas de donnée personnelle dans les journaux).
- **Emplacement** : `01-CONCEPTION.md` §4.6, §8.3.
- **Constat** : la règle de nommage est imposée par la fiche, mais ses conséquences ne sont pas traitées : journaux Nginx, journaux d'exécution n8n, messages d'erreur avec chemin.
- **Correction proposée** : journaliser l'identifiant et non le chemin (RS-04) ; régler la conservation des exécutions n8n (durée courte, pas de données binaires) ; vérifier que `erreurs_workflow.message` ne contient jamais de chemin.

#### RS-33 — `ref_ecriture` multiple contre une valeur unique dans la fiche
- **Gravité** : Mineur.
- **Emplacement** : `01-CONCEPTION.md` §4.1 ; fiche §4 ; programme §5.6.
- **Correction proposée** : le dire explicitement (une pièce peut être citée par plusieurs lignes d'écriture : paiement en plusieurs fois, facture et règlement) et le faire valider avec Q14.

#### RS-34 — Exercices et années ouvertes contradictoires entre conception et recette
- **Gravité** : Mineur (bloque REC-019 tant que non tranché).
- **Emplacement** : `01-CONCEPTION.md` §4.2 `parametres.annees_ouvertes` (2023 à 2025 ou 2024 à 2026) ; recette §1.3 (2024 à 2026).
- **Correction proposée** : décision à J04 (D3) ; si 2023 est exclu, prévoir le traitement des pièces 2023 qui justifient les soldes d'ouverture 2024 (classées hors compteur ou acceptées).

#### RS-35 — Supervision interne et rapports redondants pour le délai
- **Gravité** : Mineur.
- **Emplacement** : `01-CONCEPTION.md` §5 W10, W11, W07b.
- **Constat** : W10 (rapport quotidien), W11 (supervision interne) et W07b (restauration automatique) recouvrent une vue NocoDB, une sonde externe et les deux restaurations manuelles exigées par le critère 5.
- **Correction proposée** : les reporter après le 31 octobre (§5), sauf l'alerte disque à 80 % (tâche planifiée de l'hôte, 30 minutes) et la sonde externe.

## 3. Règles manquantes de la recette (Q01 à Q32)

| Q | État | Réponse de la conception, ou proposition de la revue |
|---|---|---|
| Q01 | Ouverte (en partie tranchée) | §6 donne les rôles : l'aide au tri trie et voit les montants, ne valide pas ; le comptable valide, déclare, corrige, rapproche ; le responsable de validation contrôle et annule ; la Direction lit. Restent à fixer : qui exporte, délai d'effet d'un retrait de droits (proposition : immédiat, compte NocoDB et compte Nginx désactivés ensemble), limites du développeur en production. |
| Q02 | Tranchée | Année de `date_piece` ; attribution à la validation, pas au dépôt (ADR-03). À confirmer à J04. Conséquence : REC-037, REC-038 et REC-041 s'exécutent en passant par la validation ; l'écart d'exécution est à faire approuver par écrit. |
| Q03 | Tranchée | Aucun numéro consommé avant la validation ; un numéro attribué n'est jamais perdu (pièce `Annulee` conservée). Compatible avec « sans trou » et « jamais réutilisé ». Réserve : RS-01 (restauration). |
| Q04 | Ouverte | `annees_ouvertes` et `debut_exercice` en hypothèse. Proposition : exercice civil, 2024 à 2026, critère 7 limité aux clôtures 2024 et 2025. |
| Q05 | Tranchée, à corriger | Montant 0 admis pour une pièce sans montant. Proposition : champ `sans_montant` (RS-21). |
| Q06 | Ouverte | Date obligatoire, sans substitution. Proposition : date de réception avec indicateur `date_estimee`, ou rejet et déclaration de pièce manquante si aucune date n'est établie. |
| Q07 | Tranchée | Date bornée entre le 1er janvier de la plus ancienne année ouverte et aujourd'hui (§4.1) : P23 et P24 refusées. À exprimer par déclencheur avec code d'erreur (RS-30). |
| Q08 | Tranchée, à corriger | Entiers ≥ 0, sans plafond autre que `bigint` ; séparateurs seulement à l'affichage. Les avoirs sont refusés : proposition RS-21 ; décimales refusées à la saisie. |
| Q09 | Ouverte | Non traitée. Proposition : champs `devise_origine`, `montant_origine`, `taux`, `date_taux` ; `montant_fcfa` = montant de l'écriture comptable (taux retenu par le comptable), jamais calculé par l'outil. |
| Q10 | Ouverte (en partie tranchée) | Rejet T4 et renumérisation. Manque le lien entre l'ancien et le nouveau scan : champ `remplace_scan` sur la nouvelle pièce ; si le papier est illisible et irremplaçable, déclaration de pièce manquante. |
| Q11 | Tranchée | ADR-05 : empreinte bloquante, clé métier en avertissement, le valideur décide. |
| Q12 | Tranchée | §4.6 ; à compléter pour les ligatures et la troncature (RS-29). |
| Q13 | Ouverte (en partie tranchée) | PDF seul ; taille maximale à fixer après les 50 pièces ; PDF protégé non traité. Proposition : PDF protégé refusé avec motif ; JPG refusé au dépôt et converti en PDF sur le poste par le script d'envoi. |
| Q14 | Contredite | La conception accepte un motif libre sans déclaration (E01). Proposition RS-05 : seule la citation d'un identifiant `Manquante` vaut motif. Cardinalité tranchée : plusieurs lignes peuvent citer une pièce ; une ligne cite une seule pièce. |
| Q15 | Ouverte (en partie tranchée) | E08 compare le montant pour information ; l'exercice n'est pas contrôlé. Proposition : écart informatif si l'année de la pièce diffère de l'exercice de l'écriture de plus d'un an, jamais bloquant (paiements partiels, factures de décembre réglées en janvier). |
| Q16 | Tranchée, défectueuse | T10 : retour à `Classee` avec écart. Défaut démontré pour les pièces manquantes et contrôlées (RS-07) ; proposition : statut « saisie » calculé. |
| Q17 | Tranchée, mécanisme défectueux | Une pièce manquante reçoit un identifiant FT-PC ; `statut_traitement` (Ouvert, Duplicata reçu, Attestation signée, Clos) ; signature de la Direction sur papier, scannée. Mécanisme à refaire (RS-09). |
| Q18 | Ouverte | Calcul du rapprochement hors outil. Propositions RS-17 ; éléments en suspens, date d'opération ou de valeur, solde d'ouverture 2024 et verrouillage d'un état validé restent à trancher par le comptable (D8). |
| Q19 | Ouverte (en partie tranchée) | Dump quotidien à 1 h, rétention 30 jours plus un par mois, fichiers jamais supprimés. Non fixés : RPO, RTO, chiffrement, compteur après restauration (RS-01). |
| Q20 | Tranchée | 30 octobre (fiche et jalons). |
| Q21 | Tranchée (en grande partie) | Courriel SMTP au développeur et au responsable de validation, moins de 5 minutes (ARC-013), un récapitulatif au-delà de 5 erreurs par heure, reprise manuelle, rappel des erreurs de plus de 24 h. Manque : nombre de reprises automatiques avant arrêt (proposition : 5, RS-22). L'entrée des pièces par courriel est hors périmètre : à écrire explicitement. |
| Q22 | Contredite (versionnement) | Contrôle d'intégrité quotidien sur échantillon, complet chaque semaine et à la demande. Correction d'une pièce classée par renommage, sans version, contraire à l'exigence transverse (RS-19). Altération du journal par un administrateur : détection repoussée après le 31 octobre ; proposition RS-06. |
| Q23 | Ouverte | Renvoyée à J12 ; aucune suppression possible dans l'outil, papier conservé. Suffisant pour le 31 octobre. |
| Q24 | Ouverte | Contrat §7 à confirmer ; F4 (PDF de l'ERP) après le 31 octobre (RS-10). |
| Q25 | Ouverte (en partie tranchée) | Rapport à 18 h ; le plan n'est pas modélisé (RS-24). |
| Q26 | Ouverte | Environnement de test séparé, identifiants identiques. Proposition RS-27. Aucune pièce d'essai en production. |
| Q27 | Ouverte (en partie tranchée) | Tirage reproductible par graine ; tolérance non fixée. Proposition : 30 sur 30 exigé, chaque échec transformé en écart corrigé puis re-chronométré (RS-26). |
| Q28 | Ouverte | Non traitée. Proposition : recherche insensible à la casse et aux accents par une colonne normalisée `tiers_recherche` (même normalisation que le nom de fichier). |
| Q29 | Ouverte (en partie tranchée) | CSV par table, arborescence de PDF, fichier lisez-moi, dump SQL. Rôle autorisé non fixé ; proposition : développeur seul, export journalisé. |
| Q30 | Ouverte | La conception suppose des pièces `5_Banque` (lien du relevé) sans décision. Décision de la Direction requise (D8). |
| Q31 | Contredite | `controle_par ≠ trie_par` au lieu de « ≠ saisisseur » (RS-18). |
| Q32 | Ouverte | Méthode de reprise renvoyée à J04b ; source `EXCEL` prévue ; l'import contrôle format et équilibre et ne bloque pas une ligne sans pièce (listée en E01), ce qui satisfait REC-054. |

Bilan : 7 tranchées sans réserve (Q02, Q03, Q07, Q11, Q12, Q20, Q21) ; 4 tranchées mais à corriger ou défectueuses (Q05, Q08, Q16, Q17) ; 3 contredites (Q14, Q22, Q31) ; 18 ouvertes, dont 8 en partie tranchées (Q01, Q10, Q13, Q15, Q19, Q25, Q27, Q29).

## 4. Cas bloquants de la recette non satisfaits ou indéterminés

Sur les 67 cas bloquants, 34 sont satisfaisables par la conception telle qu'elle est écrite. Les 33 suivants ne le sont pas, ou dépendent d'un élément non décidé.

| Cas | Situation | Cause | Correction |
|---|---|---|---|
| REC-012 | Indéterminé | La pièce existe dans l'index dès le dépôt (`A_trier`, champs vides) ; « aucune ligne partielle » se lit comme « aucun passage avec un champ manquant » | Faire approuver cette lecture par écrit |
| REC-019 | Bloqué par règle | Q04 | D3 |
| REC-037, REC-038 | Indéterminé | Identifiant à la validation, non au dépôt (Q02) | Exécution par la validation, écart approuvé |
| REC-043 | Non satisfait | `arch_n8n` peut imposer un identifiant ; le propriétaire peut contourner les déclencheurs | RS-15, RS-06 |
| REC-044, REC-045 | Non satisfait en option B ; dépend de l'ERP en option A | Refus à la saisie et affichage dans l'ERP | RS-16, D2 |
| REC-049 | Non satisfait en option B | Lien vers une pièce non classée possible | RS-16 |
| REC-054 | Bloqué par règle | Q32 | Décision J04b |
| REC-055 | Indéterminé | Dépend de l'ERP (option A) et de W08, qui doit être refait | RS-04, D2 |
| REC-059 | Non satisfait | Aucune vue de solde par compte | RS-20 |
| REC-065 | Non satisfait | EW-3 non détectée | RS-05 |
| REC-073 | Non satisfait | Parcours de déclaration incohérent | RS-09 |
| REC-080, REC-178 | Non satisfaits | Pas d'inventaire dans le modèle | RS-08 |
| REC-082 | Non satisfait | Pas d'appariement des lignes de relevé | RS-17, D8 |
| REC-085 | Non satisfait | Pas d'état « relevé manquant » | RS-17 |
| REC-094 | Indéterminé le 14 octobre | Disque externe à acheter ; première copie 3 prévue un vendredi | Acheter avant le 14 ou déplacer le cas au 16 |
| REC-096 | Indéterminé le 14 octobre | « 3 liens écriture-pièce » impossibles avant l'import des écritures (19 octobre) | Rejouer la partie « liens » à R3 |
| REC-104 | Non satisfait | Compteur après restauration | RS-01 |
| REC-106 | Non satisfait | Lot `En_ingestion` jamais repris, doublons comptés à tort | RS-12 |
| REC-113 | Non satisfait | Transaction W05 coupée en deux | RS-13 |
| REC-129 | Non satisfait | Auteur non nominatif dans le journal | RS-06, D7 |
| REC-132, REC-133 | Non satisfaits | Refus non tracés ; `TRUNCATE` ; propriétaire | RS-06 |
| REC-138, REC-139 | Non satisfaits | W08 non authentifié, fuite par la redirection | RS-04 |
| REC-149 | Non vérifiable | Dépend des jetons d'API de NocoDB | ARC-002 |
| REC-152 | Non satisfait (exclu) | US-ARC-09 après le 31 octobre | RS-10, D6 |
| REC-160 | Non satisfait pour l'accès direct à la base | Propriétaire des tables | RS-06 ; limite à documenter (§4.3 point 8 de la recette) |
| REC-176 | Bloqué par règle en partie | P12, P13, P18, P21 dépendent de Q06, Q09, Q13 | D4 |
| REC-177 | Non satisfait le 16 octobre | W05, W08 et ERP livrés après le go | RS-03, D2 |
| REC-182 | Bloqué par règle | Q27 ; tirage non stratifié | RS-26, D15 |

Remarque sur la recette elle-même : la vague R1 du 14 octobre compte 79 cas, exécutés par des humains qui sont aussi formés le 15 et qui commencent J09a ; elle n'est pas exécutable en une journée. À réduire aux 40 cas bloquants de R1 le 14, le reste le 15.

## 5. Minimum viable pour le 31 octobre

Objectif : tenir les critères 1, 2, 3, 5 et 6 avec un développeur seul, sans travail sur l'ERP en S42, et garder l'architecture cible pour la suite.

### 5.1 Principes
1. **Option B au démarrage** : l'archive ne dépend pas de l'ERP pour le 31 octobre. Les écritures arrivent par CSV (export de l'ERP s'il sait le faire, sinon Excel du comptable) et sont reliées dans NocoDB. L'option A et la mise en ligne de l'ERP (J07, J08) passent en S43 ou après, sans changement de l'archive.
2. **Logique dans la base, peu de workflows** : trois workflows n8n seulement (ingestion, validation et rangement, import des écritures) plus le workflow d'erreur ; sauvegarde par tâche planifiée de l'hôte ; contrôles sous forme de vues SQL affichées dans NocoDB, exportées en CSV et envoyées chaque matin.
3. **Statut simplifié** (RS-07) : cycle de vie stocké, « saisie » et « contrôlée » calculées.

### 5.2 Ce qui est gardé, avec estimation (heures de développeur)

Avant le go (S42) :

| Tâche | Contenu réduit | Heures |
|---|---|---|
| ARC-001, ARC-002 | Relevé du serveur ; tests oui/non, en priorité source PostgreSQL externe dans NocoDB, nœud PostgreSQL de n8n, accès disque, calcul SHA-256 | 5 |
| ARC-003 | Décisions J04 (D3, D4, D5) | 1 |
| ARC-004 | Environnement de test (composition Docker) | 2 |
| ARC-005 réduit | Sauvegarde de l'existant ; volumes persistants pour NocoDB et n8n sans changement de moteur ; conteneur PostgreSQL `archive_compta` ; redémarrage complet vérifié | 3 |
| ARC-006 réduit | Tables `pieces`, `compteurs`, `types_piece`, `lots_depot`, `fichiers_deposes`, `journal_audit`, `parametres`, `inventaire`, `declarations_manquantes`, `pieces_manquantes`, `ecritures`, `imports_ecritures` ; droits par table (RS-15) | 4 |
| ARC-007 réduit | Fonctions `SECURITY DEFINER` d'attribution et de déclaration ; 7 statuts ; refus de suppression et de `TRUNCATE` ; journal chaîné (RS-06) ; tests (a) à (h) plus le test de restauration de RS-01 | 8 |
| ARC-008 | SFTP du poste ; Nginx authentifié avec `/piece/<id>` (remplace W08) | 3 |
| ARC-009 | Script d'envoi de lot avec manifeste | 3 |
| ARC-010 réduit | Six vues : À trier, À valider, Inventaire, Écritures à relier, Contrôles, Recherche ; comptes nominatifs | 3 |
| ARC-011 | W01 avec les corrections de RS-12 | 4 |
| ARC-012 | W02 et W03 ; registre des identifiants hors base (RS-01) | 5 |
| ARC-013 | W09 minimal (ligne d'erreur et courriel) | 1,5 |
| ARC-014 réduit | Tâche planifiée de l'hôte : dump, synchronisation vers GCS avec noms uniques, vérification ; alerte disque | 3 |
| ARC-015 | Restauration complète hors VPS, recalage du compteur, procès-verbal | 3 |
| ARC-016, ARC-019, ARC-020 | 50 pièces, revue de sécurité, liste du go | 4 |
| **Total S42** | | **environ 52** |

Après le go (S43 et S44) :

| Tâche | Contenu | Heures |
|---|---|---|
| W05 | Import CSV en une transaction, une source par exercice, lien `piece_id_saisi` contrôlé | 4 |
| Contrôles | Vues E01, E02, E03, E04, E05, E06, E11 ; `v_balance` ; export CSV quotidien envoyé au responsable de validation | 4 |
| Pièces manquantes | Formulaire, fonction de déclaration, rattachement du justificatif (RS-09) | 4 |
| Corrections | Fonction d'administration avec `pieces_versions` (RS-19) | 2 |
| ARC-018 | Lecture du code de l'ERP, format du CSV validé | 3 |
| ARC-031 réduit | Table de rapprochement avec solde comptable calculé et statut « relevé manquant » | 2 |
| ARC-032, ARC-033, ARC-034, ARC-035 | Échantillon, export, restauration finale, secrets | 9 |
| **Total S43–S44** | | **environ 28**, plus J07 et l'option A si la Direction les maintient |

### 5.3 Ce qui est reporté après le 31 octobre
W04 automatisé (relances), W06 sous forme de table `ecarts` avec cycle de vie (les vues suffisent pour le 31), W07b (restauration automatique hebdomadaire ; les restaurations manuelles du 14 et du 30 tiennent le critère 5), W10 (remplacé par une vue tableau de bord), W11 (remplacé par la sonde externe et l'alerte disque), W12, flux F2 et F4, migration des métadonnées de NocoDB et de n8n vers PostgreSQL, double authentification si elle demande une configuration particulière, option A dans l'ERP si elle n'est pas prête le 21 octobre.

### 5.4 Ce que le minimum viable ne doit pas couper
Fonction d'attribution avec ses tests de concurrence et de restauration, contrainte d'unicité, refus de suppression, registre des identifiants hors base, deux restaurations manuelles complètes, copie hors site, inventaire comparé à l'archive, contrôles E01, E02, E03, E05, E06, authentification Nginx sur les fichiers.

### 5.5 Conditions de réalisme
Même réduit, le minimum viable demande environ 10 h par jour en S42. Il n'est tenable que si la mise en ligne de l'ERP sort de S42 et si le go est fixé au lundi 19 à midi, ou si le go du 16 ne porte que sur R1 (D2). Sans aide au tri disponible en S43, l'échéance n'est pas tenable quel que soit l'outil (jalons §5).

## 6. Décisions à demander à l'humain

Liste fusionnée avec les questions de l'architecte (`01-CONCEPTION.md` §10, `02-BACKLOG.md` ARC-003 et §1) et sans doublon.

| N° | Décision | Qui | Quand | Constats |
|---|---|---|---|---|
| D1 | Accepter une base PostgreSQL dédiée sous NocoDB, avec la logique métier en SQL, et reporter la migration des métadonnées de NocoDB et de n8n après le 31 octobre | Direction (utilisateur) | lun 12 | RS-11 |
| D2 | Plan de S42 : go le 16 limité à R1, ou go le lundi 19 ; mise en ligne de l'ERP sortie de S42 ; démarrage en option B, option A visée pour le 21 ; renfort éventuel (nom et dates) | Direction | lun 12 | RS-02, RS-03, RS-16 |
| D3 | Année du compteur (année de la pièce proposée) ; exercice civil ; exercices concernés (2024–2026 ou 2023–2025) ; traitement des pièces de 2023 | Direction, comptable | mar 13 | RS-34, Q02, Q04 |
| D4 | Règles de saisie : avoirs, pièces sans montant, sans date, en devise, formats et taille, PDF protégé | Comptable, responsable de validation | mar 13 | RS-21, Q05 à Q09, Q13 |
| D5 | Une écriture n'est justifiée que par un identifiant de pièce classée ou de pièce manquante déclarée | Direction, comptable | mar 13 | RS-05, Q14 |
| D6 | Retrait d'US-ARC-09 du périmètre du 31 octobre et requalification de REC-152 à REC-157 | Direction | lun 12 | RS-10 |
| D7 | Identité : accepter que l'auteur nominatif et les quatre yeux soient déclaratifs (si NocoDB ne fournit pas mieux) et requalifier REC-129 ; accepter que le développeur administrateur ne puisse être qu'observé, pas empêché | Direction | après ARC-002, mar 13 | RS-06 |
| D8 | Rapprochement bancaire : calcul par le comptable hors outil avec état joint, ou dans l'outil ; relevés `5_Banque` dans le périmètre ; règles Q18 | Direction, comptable | mar 13 | RS-17, Q18, Q30 |
| D9 | Sauvegarde : perte maximale admise pendant l'archivage en masse, chiffrement des copies et garde de la clé, budget GCS, achat du disque externe et de l'onduleur avant le 14 | Direction | lun 12 | RS-01, RS-14, Q19 |
| D10 | Quatre yeux sur « Contrôlée » : contrôleur différent du saisisseur et du trieur | Responsable de validation | mar 13 | RS-18, Q31 |
| D11 | Correction d'une pièce classée : version conservée, réservée au responsable de validation ; règle du changement d'année (annulation et nouvelle pièce) | Responsable de validation | mar 13 | RS-19, Q22 |
| D12 | Règles figées de l'arborescence : noms de mois (avec ou sans accents), codes de type pour le nom de fichier, résolution et format de scan, une pièce par fichier | Direction, responsable de validation | mar 13 | ARC-003, RS-29 |
| D13 | Nom du responsable de validation ; liste nominative des utilisateurs et rôles ; droits d'export ; délai d'effet d'un retrait de droits | Direction | lun 12 | Q01, Q29 |
| D14 | Texte de l'attestation interne ; choix de l'outil de sonde externe ; confirmation que l'option IA reste désactivée ; durée de conservation (J12) | Direction | avant J13 ; J12 | Q23, ADR-06 |
| D15 | Recette : tolérance de l'échantillon (30 sur 30), conditions de mesure des 2 secondes, recherche insensible aux accents, marquage des identifiants de test, format du plan d'avancement | Responsable de validation | mer 14 | RS-24, RS-26, RS-27, Q25 à Q28 |
| D16 | Méthode de reprise des écritures historiques (J04b) et source par exercice | Comptable | mar 13 | RS-13, Q32 |
