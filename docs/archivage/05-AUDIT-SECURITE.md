# Archivage comptable — Audit de sécurité de la conception

Version 0.1 du 11 octobre 2026, rédigée par l'agent sécurité de la chaîne de conception. Objet audité : `01-CONCEPTION.md` v0.1 et `02-BACKLOG.md` v0.1, à la lumière de `00-FICHE-CADRAGE.md` et du contexte technique du dépôt (`api/lib/nocodb.js`, `api/routes/devis.js`, `docs/DEPLOY-KVM2.md`, `docker-compose.yml`, `.env.example`, `.gitignore`). Il n'existe pas encore de code de l'archive : l'audit porte sur ce que la conception prévoit, ce qu'elle oublie et ce qu'elle laisse à la configuration.

Conventions :
- **Démontré** : le problème découle du texte de la conception tel qu'il est écrit ; il existera si la conception est construite sans changement.
- **À vérifier** : le problème dépend de la configuration réelle (versions, conteneurs, ports, options) que cet audit ne peut pas voir ; il est probable ou fréquent, pas prouvé.
- Les correctifs sont dimensionnés pour une PME de BTP avec un seul développeur : chaque correctif indique un ordre de grandeur d'effort.
- Aucune valeur de secret n'est reproduite dans ce document.

---

## 1. Synthèse

**Niveau de risque global : ÉLEVÉ** tel que la conception est écrite. Il descend à **MOYEN** (acceptable pour la mise en service) si les cinq points ci-dessous sont corrigés avant le go du 16 octobre ; les autres constats peuvent suivre pendant S43.

La conception est sérieuse sur la persistance, l'attribution des identifiants, l'absence de suppression et la sauvegarde 3-2-1. Ses faiblesses de sécurité sont de trois ordres :
1. une **surface exposée mal délimitée** (webhook n8n public qui révèle tiers et montants ; exposition de l'éditeur n8n, de NocoDB et de PostgreSQL laissée à la configuration) ;
2. des **garanties d'intégrité qui reposent sur des déclencheurs que les comptes techniques ou le propriétaire peuvent contourner**, et un compte n8n autorisé à réécrire l'empreinte d'une pièce classée, ce qui rend une falsification invisible au contrôle E06 ;
3. un **traitement des entrées non fiables non spécifié** (noms de fichiers, paramètres et référentiels modifiables utilisés pour construire des chemins, requêtes SQL et commandes système construites par n8n, CSV d'écritures déposé sans contrôle de l'auteur).

Le développeur concentre aussi tous les privilèges (root du VPS, propriétaire NocoDB, `arch_owner`, éditeur n8n, administrateur GCS probable) : sans trace externe, il peut tout modifier sans laisser de preuve. Ce n'est pas une accusation, c'est une limite de preuve à couvrir par un ancrage externe du journal (SEC-02).

### Les 5 points à corriger avant toute mise en service

| # | Point | Constats | Effort estimé |
|---|---|---|---|
| 1 | **W08 derrière l'authentification** : le lien « ouvrir la pièce » ne doit rien révéler sans authentification (aujourd'hui la redirection publique donne date, tiers et montant de chaque pièce, énumérable de 00001 à N) | SEC-01 | 1 h |
| 2 | **Rien d'administrable sur Internet sauf HTTPS** : éditeur n8n, PostgreSQL et ports Docker liés à `127.0.0.1` ; inscription NocoDB fermée ; n8n à jour ; seuls 443 et 22 ouverts, vérifiés depuis l'extérieur | SEC-08 | 2 h |
| 3 | **Droits de base réellement « moindre privilège »** : aucun outil ne se connecte en propriétaire ou superutilisateur ; `TRUNCATE` révoqué ; `compteurs` et `journal_audit` écrits seulement par fonctions ; empreinte non modifiable par personne une fois posée ; chaînage du journal avec ancrage quotidien hors du VPS | SEC-02, SEC-03, SEC-05 | 5 h (dont 3 h d'ARC-038 avancé) |
| 4 | **Sauvegardes inviolables et chiffrées** : chiffrement à clé publique sur le VPS (clé privée seulement au coffre) ; bucket avec règle de rétention ; compte de service qui ne peut ni supprimer ni écraser ; noms d'objets uniques ; test de suppression qui échoue | SEC-10 | 3 h |
| 5 | **Entrées non fiables neutralisées** : aucun nom fourni par un humain ou un fichier dans un chemin ou une commande ; requêtes SQL paramétrées ; nœud Execute Command désactivé ; contrôle du chemin final sous la racine ; dépôt des CSV réservé | SEC-06, SEC-07, SEC-09 | 4 h (règles de construction + tests) |

Juste après le go (avant la fin de S43) : la règle des quatre yeux réellement vérifiée (SEC-04), la portée des jetons NocoDB (SEC-11), la supervision externe (SEC-17).

### Décompte des constats

| Gravité | Nombre | Constats |
|---|---|---|
| Critique | 2 | SEC-01, SEC-02 |
| Élevée | 9 | SEC-03 à SEC-11 |
| Moyenne | 8 | SEC-12 à SEC-19 |
| Faible | 5 | SEC-20 à SEC-24 |
| **Total** | **24** | |

---

## 2. Constats

### SEC-01 — Le webhook W08 est public et révèle date, tiers et montant de chaque pièce
- **Gravité** : Critique · **Nature** : Démontré · **Composant** : n8n (W08), Nginx
- **Menace** : exposition de données comptables sans authentification ; énumération.
- **Scénario** : W08 répond à `GET /webhook/piece?id=FT-PC-AAAA-NNNNN` par une redirection vers `https://<domaine>/fichiers/Archive/AAAA/N_Type/MM_Mois/<nom>.pdf`. L'authentification n'est demandée qu'**après** la redirection, par Nginx. Or le nom de fichier contient la date, le type, le **tiers** et le **montant** (`2025-03-14_FT-PC-2025-00017_facture-fournisseur_socofer-sarl_450000.pdf`). Les identifiants étant séquentiels sans trou (c'est même une exigence), un script anonyme qui interroge `00001` à `99999` pour chaque année lit l'en-tête `Location` et reconstitue la liste complète des fournisseurs, sous-traitants et montants des trois exercices, sans jamais s'authentifier. La différence « redirection / introuvable » confirme aussi l'existence de chaque pièce. Le même problème touchera les pièces de paie (`7_Paie`, noms de salariés) quand elles entreront.
- **Preuve** : `01-CONCEPTION.md` §5 W08 (« répondre par une redirection… Nginx demande l'authentification ») ; §4.6 (règle de nommage) ; §7.1 F3 ; ADR-03 (numérotation séquentielle) ; `02-BACKLOG.md` ARC-024 (critère « identifiant connu → redirection, puis authentification Nginx »).
- **Correctif** (1 h) : ne plus exposer le webhook n8n sur Internet. Publier une route Nginx `https://<domaine archive>/piece/<id>` placée **derrière la même authentification** que `/fichiers/` (`auth_basic` ou équivalent, avant le `proxy_pass` vers n8n en `127.0.0.1`). Mieux : n8n renvoie un en-tête `X-Accel-Redirect` vers un emplacement Nginx `internal` ; le chemin réel n'apparaît alors jamais au navigateur. Limiter le débit (`limit_req`) sur `/piece/`. Réponse identique (404 générique) pour « inconnu », « mal formé » et « annulé ».
- **Backlog** : modifier **ARC-024** (critère : « sans authentification, `/piece/<id>` renvoie 401 sans aucun en-tête `Location` ») et **ARC-008** ; ajouter un cas de recette « énumération anonyme de 100 identifiants → 100 réponses 401 identiques ».

### SEC-02 — Le journal « en ajout seul » et l'interdiction de suppression sont contournables sans trace
- **Gravité** : Critique · **Nature** : Démontré (principe) / À vérifier (comptes réellement utilisés) · **Composant** : PostgreSQL `archive_compta`
- **Menace** : falsification de l'index ou du journal par un compte privilégié, sans preuve.
- **Scénario** :
  1. Les déclencheurs de refus `DELETE` sont des déclencheurs de **ligne** : un `TRUNCATE journal_audit` (ou `TRUNCATE pieces CASCADE`) ne les déclenche pas. La conception ne parle que du droit `DELETE`.
  2. Le propriétaire des tables (`arch_owner`) et tout superutilisateur peuvent faire `ALTER TABLE … DISABLE TRIGGER ALL`, `SET session_replication_role = replica` (superutilisateur), `UPDATE`, puis réactiver : aucune ligne de journal n'est écrite.
  3. Dans les compositions Docker courantes, NocoDB et n8n se connectent à leurs bases de métadonnées avec l'utilisateur `POSTGRES_USER` du conteneur, qui est **superutilisateur** de toute l'instance, donc aussi de `archive_compta`. Une faille de NocoDB ou de n8n, ou une personne qui a la main sur l'un des deux, a alors tous les droits sur l'archive.
  4. Le chaînage par empreinte qui rendrait une altération visible est reporté **après le 31 octobre** (ARC-038) : pendant tout le chantier, une modification faite par le propriétaire ne laisse aucune trace détectable.
  5. Une seule personne détient root, `arch_owner`, l'Owner NocoDB et l'éditeur n8n.
- **Preuve** : `01-CONCEPTION.md` §4.2 `journal_audit` (« Aucun droit UPDATE ni DELETE accordé ; un déclencheur refuse aussi ces opérations. Option après le 31 octobre : chaîner ») ; §4.4 ; §8.1 (comptes PostgreSQL) ; `02-BACKLOG.md` ARC-006 (test limité à `DELETE`), ARC-038 (après le 31 oct.).
- **Correctif** (5 h au total avec SEC-03 et SEC-05) :
  - `REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA … FROM PUBLIC, arch_nocodb, arch_n8n, arch_lecture` ; ajouter un déclencheur `BEFORE TRUNCATE … FOR EACH STATEMENT` qui lève une erreur sur les tables protégées.
  - `arch_owner` : `NOLOGIN` en exploitation (activé seulement pour une migration, puis désactivé ; chaque activation notée au journal d'exploitation). Aucun outil ne se connecte en propriétaire ni en superutilisateur. NocoDB et n8n ont chacun un rôle dédié propriétaire de **sa seule** base de métadonnées (`nocodb_meta`, `n8n`), sans droit sur `archive_compta`.
  - Avancer **ARC-038** avant le go (3 h) : chaque ligne de `journal_audit` porte `empreinte = sha256(empreinte_précédente || contenu)` calculée dans le déclencheur. Chaque nuit, W07a écrit la dernière empreinte du journal et le nombre de lignes dans un objet GCS sous rétention verrouillée **et** dans le courriel quotidien à la Direction (W10). Une réécriture du journal devient détectable par comparaison avec ces ancres, que le développeur ne peut plus modifier.
  - Activer `log_statement = 'ddl'` et `log_connections` de PostgreSQL : un `ALTER TABLE … DISABLE TRIGGER` laisse au moins une trace dans le journal du serveur (envoyé avec la sauvegarde).
- **Backlog** : modifier **ARC-006** (tests : `TRUNCATE` refusé pour tous les rôles applicatifs ; aucune connexion NocoDB/n8n n'est superutilisateur : `SELECT rolsuper FROM pg_roles`) ; avancer **ARC-038** en MVP-0 ; modifier **ARC-005** (rôles dédiés pour les métadonnées).

### SEC-03 — Le compte n8n peut réécrire l'empreinte et le chemin d'une pièce classée : falsification indétectable
- **Gravité** : Élevée · **Nature** : Démontré · **Composant** : PostgreSQL (`arch_n8n`), n8n
- **Menace** : remplacement d'un justificatif classé par un autre, sans alerte.
- **Scénario** : `id_piece`, `empreinte_sha256`, `chemin` et `nom_fichier` sont « modifiables uniquement par `arch_n8n` ». Toute personne qui peut éditer un workflow n8n (ou un attaquant qui compromet n8n) remplace le PDF d'une pièce `Controlee` par un faux, puis met à jour `empreinte_sha256` avec l'empreinte du faux. Le contrôle E06 compare le fichier à l'empreinte **en base** : il ne voit rien. Le journal enregistre une mise à jour par `arch_n8n`, indiscernable d'un rangement légitime.
- **Preuve** : `01-CONCEPTION.md` §4.4 (« modifiables uniquement par `arch_n8n` ») ; §4.1 (`empreinte_sha256` « non modifiable », contredit par §4.4) ; §5 W06 E06 ; `02-BACKLOG.md` ARC-007 (« immutabilité … hors `arch_n8n` »).
- **Correctif** (inclus dans les 5 h) :
  - `empreinte_sha256` et `taille_octets` : non modifiables **par personne** une fois posés (déclencheur sans exception). Une correction T14 ne change jamais le contenu du fichier, donc jamais son empreinte.
  - `id_piece` : écrit seulement par `attribuer_id_piece` (fonction `SECURITY DEFINER`, `SET search_path` fixé) ; `chemin`, `nom_fichier`, passage à `Classee` : seulement par une seconde fonction `ranger_piece(id, chemin, nom)` qui vérifie le statut `Classement_en_cours`. `arch_n8n` n'a **aucun** droit `UPDATE` direct sur ces colonnes (droits par colonne : `GRANT UPDATE (col1, col2…)` limité aux colonnes nécessaires).
  - E06 compare aussi l'empreinte de la base à celle consignée lors de l'ingestion dans `fichiers_deposes` (table en insertion seule) et à la copie GCS sous rétention.
- **Backlog** : modifier **ARC-007** (test : `UPDATE pieces SET empreinte_sha256 = …` refusé pour `arch_n8n` sur une pièce classée) et **ARC-027** (E06 à double référence).

### SEC-04 — La règle des quatre yeux est contournable par une seule personne
- **Gravité** : Élevée · **Nature** : Démontré · **Composant** : NocoDB, W03, déclencheurs
- **Menace** : classement (puis citation dans une écriture) d'une pièce non contrôlée, ou fausse pièce validée par son auteur.
- **Scénario** : `trie_par` et `valide_par` sont des textes « choisis dans la liste des utilisateurs ». L'aide au tri a le rôle Editor sur la table `pieces` ; si NocoDB ne restreint pas par champ (R3, probable), elle remplit elle-même `trie_par = « Aide au tri 1 »`, `decision_validation = Valider`, `valide_par = « Comptable »`. W03 voit deux noms différents et lance l'attribution. Le même contournement vaut pour `controle_par` (T11) et `rapprochements_bancaires.valide_par`.
- **Preuve** : `01-CONCEPTION.md` §4.1 (`trie_par` « nom choisi dans la liste »), §4.3 (« elle n'est pas garantie par la base »), §8.1 (« C'est déclaratif »), §10 R3 et R4 ; §6 (rôle Editor pour l'aide au tri).
- **Correctif** (3 h, proportionné) :
  1. Dans NocoDB, `trie_par`, `valide_par`, `controle_par` deviennent des champs système « Modifié par » / « Utilisateur » si la version les fournit (à vérifier, ARC-002), non des textes libres.
  2. W03 ne fait pas confiance au champ : il interroge le **journal d'audit de NocoDB** (API) pour connaître le **compte NocoDB** qui a posé `decision_validation`, et le compare au compte qui a fait T2. Écart → décision effacée et écart créé.
  3. Vues verrouillées : la vue de l'aide au tri ne montre pas `decision_validation` ni `valide_par` ; si NocoDB ne peut pas l'empêcher en écriture via l'API, le déclencheur refuse `decision_validation` non vide tant que la pièce n'est pas `A_valider` depuis au moins une minute (ralentit le contournement en une seule saisie) et W06 signale chaque pièce où `trie_par` et le compte NocoDB réel diffèrent.
  4. Si aucun de ces moyens n'existe sur la version installée : risque résiduel écrit et accepté par la Direction (signature), contrôle d'échantillon renforcé sur les pièces validées le jour même de leur tri.
- **Backlog** : modifier **ARC-002** (vérifier champs « modifié par » et API d'audit), **ARC-010**, **ARC-012** ; ajouter un cas de recette « une même personne trie et valide en se faisant passer pour un autre nom → refus ou écart ».

### SEC-05 — Le compte NocoDB a des droits d'écriture sur des tables qui doivent lui être fermées
- **Gravité** : Élevée · **Nature** : Démontré · **Composant** : PostgreSQL (`arch_nocodb`), NocoDB
- **Menace** : création de trous de numérotation, faux journal, fermeture d'écarts, détournement des paramètres.
- **Scénario** : `arch_nocodb` a « lecture, insertion, mise à jour » sans distinction de table. Conséquences :
  - `UPDATE compteurs SET dernier = dernier + 5` est permis (le déclencheur n'interdit que la **diminution**) : cinq numéros n'existeront jamais, le critère 6 « sans trou » casse, et seul E05 le verra le lendemain.
  - `INSERT INTO journal_audit` : on peut écrire de fausses lignes de journal (acteur, action) ; le journal perd sa valeur probante.
  - `UPDATE parametres` : changer `racine_archive`, `noms_mois`, `alerte_destinataires` (détourner les alertes), `ia_extraction_active = vrai` (activer l'IA sans décision de la Direction) ; voir aussi SEC-06.
  - `UPDATE types_piece` : changer `code` ou `code_nom_fichier` (utilisés dans le chemin).
  - `UPDATE ecarts SET statut = 'Corrige'`, `controles`, `erreurs_workflow`, `imports_ecritures` : masquer un écart ou une erreur.
  - Un « Editor » NocoDB peut tout cela si la restriction par table n'existe pas (R3).
- **Preuve** : `01-CONCEPTION.md` §8.1 (`arch_nocodb` : « lecture, insertion, mise à jour ») ; ADR-03 (« interdit de diminuer `compteurs.dernier` ») ; §4.2 `compteurs` (« affichée en lecture seule dans NocoDB » : protection d'écran seulement), `parametres`, `journal_audit` ; §10 R3.
- **Correctif** (inclus dans les 5 h) : droits **par table** pour `arch_nocodb` :
  - `SELECT` seulement : `compteurs`, `journal_audit`, `parametres`, `types_piece`, `controles`, `erreurs_workflow`, `imports_ecritures`, `lots_depot`, `fichiers_deposes`, vues.
  - `INSERT, UPDATE` sur les colonnes nécessaires seulement : `pieces` (colonnes de tri, de décision, de correction), `pieces_manquantes`, `ecarts` (statut `Accepte_documente` + commentaire uniquement, `Corrige` réservé au système), `rapprochements_bancaires`, `ecritures.piece_id_saisi`.
  - `compteurs` : aucun droit d'écriture pour personne sauf la fonction `attribuer_id_piece` (`SECURITY DEFINER`) ; déclencheur : `dernier` ne peut que passer à `dernier + 1`.
  - `journal_audit` : aucun `INSERT` direct pour aucun rôle ; écrit seulement par les fonctions de déclencheur `SECURITY DEFINER`.
  - `parametres` et `types_piece` : modifiés seulement par migration (`arch_owner`), tracés.
- **Backlog** : modifier **ARC-006** (matrice de droits table × rôle en annexe de la migration, testée : un `UPDATE compteurs` et un `INSERT journal_audit` par `arch_nocodb` et `arch_n8n` échouent).

### SEC-06 — Traversée de chemin : des valeurs modifiables ou fournies par le poste servent à construire des chemins
- **Gravité** : Élevée · **Nature** : Démontré (sources de données) / À vérifier (implémentation) · **Composant** : W01, W02, W04, script du poste
- **Menace** : écriture ou écrasement de fichiers hors de l'arborescence, y compris de fichiers de configuration du conteneur n8n.
- **Scénario** :
  - `code_lot` vient du nom du répertoire déposé par SFTP ; `nom_origine` vient de `manifest.csv`, écrit par le poste. Un manifeste qui contient `../../.n8n/config` ou un nom de lot forgé, réutilisé pour la copie en `quarantaine/LOT-…/<nom_origine>`, écrit hors de la quarantaine.
  - `types_piece.code`, `parametres.racine_archive` et `noms_mois` sont modifiables (SEC-05) et entrent dans `Archive/AAAA/N_Type/MM_Mois/` : une valeur `../../` déplace le rangement.
  - `tiers` est nettoyé par la règle §4.6, mais rien n'interdit une implémentation par liste noire incomplète (caractères Unicode, points, chaîne vide).
- **Preuve** : `01-CONCEPTION.md` §4.5 (quarantaine `LOT-…/`), §4.6, §5 W01 étape (3), §4.2 `fichiers_deposes.nom_origine`, `parametres` ; `03-PLAN-RECETTE.md` REC-030 (couvre seulement le tiers).
- **Correctif** (dans les 4 h « entrées ») :
  - **Aucun nom fourni par un humain ou par le poste n'entre dans un chemin.** Quarantaine : `quarantaine/<id_lot_en_base>/<sha256>.pdf` ; `a_trier/<sha256>.pdf` (déjà prévu).
  - `code_lot` validé par `^LOT-[0-9]{8}-[0-9]{4}-[A-Z0-9]{1,8}$` avant tout usage ; sinon lot `Erreur`.
  - Contraintes `CHECK` en base : `types_piece.code ~ '^[0-9]{1,2}_[A-Za-z-]{1,40}$'`, `code_nom_fichier ~ '^[a-z0-9-]{1,30}$'`, noms de mois `^[0-9]{2}_[A-Za-z]{3,10}$`.
  - `racine_archive` sort de la table `parametres` : c'est une variable d'environnement du conteneur, non modifiable depuis NocoDB.
  - Nom final construit par **liste blanche** (`[a-z0-9-]` après translittération), longueur bornée, jamais vide (`inconnu`).
  - Avant toute écriture, W02 vérifie que le chemin absolu normalisé commence par `/srv/archive/fichiers/Archive/` ; sinon erreur et alerte.
  - n8n : `N8N_RESTRICT_FILE_ACCESS_TO=/srv/archive` (ou équivalent de la version installée) pour borner les nœuds de fichiers.
- **Backlog** : modifier **ARC-011** et **ARC-012** (tests : manifeste avec `../`, nom de lot forgé, `types_piece.code` avec `/` refusé par la base) ; ajouter des cas à la recette.

### SEC-07 — Commandes système lancées par n8n : injection de commande et « shell » donné à tout éditeur de workflow
- **Gravité** : Élevée · **Nature** : À vérifier (dépend du choix d'implémentation, ouvert par la conception) · **Composant** : n8n (Execute Command, scripts de l'hôte)
- **Menace** : exécution de commandes arbitraires sur le conteneur n8n (accès aux fichiers, aux secrets d'environnement, à la base).
- **Scénario** : la conception prévoit, en repli, « un petit script sur l'hôte » et un `pg_dump` lancé par n8n ; le calcul d'empreinte et le déplacement de fichiers sont souvent faits avec le nœud Execute Command (`sha256sum "{{ nom }}"`, `mv …`). Un nom de fichier `facture$(curl …|sh).pdf` dans le manifeste, ou un tiers saisi `x; rm -rf …`, exécute du code. Par ailleurs, le simple fait que le nœud Execute Command soit actif donne un shell à toute personne qui peut éditer un workflow ou à tout attaquant qui compromet l'éditeur n8n.
- **Preuve** : `01-CONCEPTION.md` §5 (règles communes : « calcul d'empreinte (nœud de chiffrement ou nœud de code) », « écriture de fichiers sur disque ») ; W07a (« si n8n n'a pas accès à `pg_dump` ») ; §10 R11 (« repli : petit script sur l'hôte ») ; `02-BACKLOG.md` ARC-002 (« commande système » non listée parmi les points à tester sous l'angle sécurité).
- **Correctif** (dans les 4 h « entrées ») :
  - Désactiver le nœud Execute Command (variable `NODES_EXCLUDE` ; il est désactivé par défaut sur les versions récentes : à vérifier) ; empreinte avec le nœud Crypto ou le nœud Code et le module `crypto` ; fichiers avec les nœuds de lecture/écriture de fichiers bornés par SEC-06.
  - `pg_dump` et sauvegardes : tâche planifiée **de l'hôte** (cron/systemd), hors n8n ; n8n vérifie seulement le résultat (déjà proposé en option par W07a : en faire la règle).
  - Si un script hôte est indispensable : il reçoit **uniquement des identifiants numériques** (`pieces.id`), relit lui-même les valeurs en base, ne passe jamais par un shell (`execve` avec liste d'arguments, pas de `sh -c`), et tourne sous un utilisateur sans droit sur `pgdata`.
  - `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` pour que les expressions et le nœud Code ne lisent pas les secrets d'environnement.
- **Backlog** : modifier **ARC-002** (constat écrit : Execute Command désactivé) et **ARC-019** (contrôle) ; ajouter un cas de recette « fichier nommé avec `$()`, `;`, `` ` `` → rangé sous un nom propre, aucune commande exécutée ».

### SEC-08 — Exposition des interfaces : n8n, NocoDB et PostgreSQL ne sont pas délimités, Docker contourne le pare-feu
- **Gravité** : Élevée · **Nature** : À vérifier (configuration) ; l'absence de règle est démontrée · **Composant** : VPS, Docker, Nginx, n8n, NocoDB, PostgreSQL
- **Menace** : prise de contrôle de n8n ou de NocoDB depuis Internet ; accès direct à PostgreSQL.
- **Scénario** :
  - La conception ne dit pas par quelle adresse on atteint l'éditeur n8n ni NocoDB. Le site utilise déjà un webhook n8n et l'API NocoDB depuis le serveur : les deux sont probablement publiés sur Internet aujourd'hui. L'éditeur n8n a connu en 2025-2026 des vulnérabilités critiques d'exécution de code ; un éditeur exposé et non mis à jour donne l'accès à toutes les identifiants qu'il garde (base de l'archive, GCS, SMTP).
  - Les ports publiés par Docker (`ports: "5432:5432"`, `"5678:5678"`, `"8080:8080"`) **ne sont pas filtrés par UFW** : la règle « seuls HTTPS et SSH » de `DEPLOY-KVM2.md` ne protège pas un conteneur publié sur `0.0.0.0`. Le `docker-compose.yml` du dépôt publie justement PostgreSQL sur toutes les interfaces avec un mot de passe de développement connu : si ce modèle est réutilisé sur le VPS (ARC-004/ARC-005), la base est ouverte.
  - L'inscription libre sur NocoDB (si elle est ouverte) permet à un inconnu de se créer un compte.
  - En-têtes : la configuration Nginx existante n'a ni HSTS ni politique de contenu ; les nouveaux sites (NocoDB, `/fichiers/`) ne sont pas décrits.
- **Preuve** : `01-CONCEPTION.md` §2.1 (n8n, NocoDB « en place », exposition non décrite), §8.1 (« PostgreSQL n'écoute pas sur Internet », sans moyen de le garantir) ; `docker-compose.yml` lignes 17-18 (publication du port) ; `docs/DEPLOY-KVM2.md` §2 (UFW), §9 (en-têtes) ; `api/routes/devis.js` lignes 101-103 (webhook n8n appelé par le site).
- **Correctif** (2 h) :
  - Tous les ports Docker liés à `127.0.0.1:` ; PostgreSQL sans publication du tout (réseau Docker interne). Vérification **depuis l'extérieur** (`nmap` depuis un autre réseau) : seuls 22 et 443 (et 80 qui redirige) répondent.
  - **Éditeur n8n non exposé** : accès par tunnel SSH (`ssh -L 5678:127.0.0.1:5678`) pour le développeur seul. Nginx publie seulement les chemins de webhook utiles, nommément (`/webhook/<chemin-devis>`), jamais `/` ni `/rest/`.
  - NocoDB derrière Nginx en HTTPS sur son sous-domaine, inscription fermée (invitation seulement : variable à vérifier sur la version), pas de partage public.
  - En-têtes sur les sites de l'archive : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
  - n8n et NocoDB à la dernière version corrective avant le go ; abonnement aux avis de sécurité des deux projets.
  - `fail2ban` sur SSH (déjà prévu) et sur les échecs d'authentification Nginx.
- **Backlog** : modifier **ARC-001** (relever les ports **vus de l'extérieur** et les publications Docker), **ARC-005** (critère : `docker ps` ne montre aucun `0.0.0.0:` hors Nginx), **ARC-019**.

### SEC-09 — Injection SQL dans les requêtes de n8n et dépôt de CSV d'écritures sans contrôle d'auteur
- **Gravité** : Élevée · **Nature** : À vérifier (implémentation) / Démontré (dépôt non attribué) · **Composant** : n8n (nœud PostgreSQL), W01-W06, `imports/ecritures/`
- **Menace** : modification arbitraire de la base par une valeur saisie ; import d'écritures falsifiées.
- **Scénario** :
  - Le nœud PostgreSQL de n8n en mode « Execute Query » avec des expressions `{{ $json.tiers }}` **concatène** la valeur dans le texte SQL. Un tiers saisi `Maître d'Ouvrage` casse la requête (cas déjà présent en recette REC-030) ; un libellé d'écriture `'); UPDATE compteurs …; --` dans le CSV s'exécute avec les droits de `arch_n8n`.
  - Le répertoire `imports/ecritures/` n'a pas d'auteur défini : quiconque peut y écrire (compte SFTP, n8n, une personne sur le serveur) dépose un export complet qui fait passer des pièces à `Saisie_ERP` (T9), en fait revenir d'autres à `Classee` (T10), et ferme des écarts au contrôle suivant. Le CSV n'est ni signé ni rattaché à une personne.
- **Preuve** : `01-CONCEPTION.md` §5 W05 (« déposé dans `imports/ecritures/` (par l'ERP ou à la main) ») ; §7.1 F1 (« Comptable dépose ») ; §5 (requêtes construites par n8n, non précisées) ; `02-BACKLOG.md` ARC-023.
- **Correctif** (dans les 4 h « entrées ») :
  - Règle de construction : **toutes** les requêtes n8n utilisent des paramètres (`$1, $2` + « Query Parameters » du nœud) ou appellent des fonctions SQL ; aucune expression `{{ }}` dans le texte d'une requête. Vérifiable par recherche dans les exports JSON des workflows (ajouter à ARC-019).
  - W05 : validation stricte par colonne (expressions régulières pour `journal`, `numero_ecriture`, `compte`, `piece_id` ; entiers bornés ; longueur maximale de `libelle`) **avant** toute insertion ; rejet en bloc déjà prévu.
  - Dépôt des CSV : par un formulaire NocoDB (pièce jointe) ou un compte SFTP **distinct** du poste de numérisation, réservé au comptable ; `imports_ecritures` enregistre `depose_par` (compte réel) ; un import qui change le statut de plus de N pièces ou fait disparaître des écritures déjà `Controlee` demande une confirmation du responsable de validation.
- **Backlog** : modifier **ARC-023** (tests : apostrophe, point-virgule, guillemets, chaîne SQL dans `libelle` → importés tels quels sans effet) ; modifier **ARC-008** (compte de dépôt des imports).

### SEC-10 — Sauvegardes : chiffrement non décidé, effacement ou écrasement possible, disque externe en clair
- **Gravité** : Élevée · **Nature** : Démontré · **Composant** : W07a, GCS, disque externe
- **Menace** : perte de l'archive (rançongiciel, compromission du VPS ou du compte Google) ; fuite de toutes les pièces (vol du disque, erreur de droits sur le bucket).
- **Scénario** :
  - **Contradiction de conception** : W07a dit qu'« un envoi refait remplace l'objet du même nom » ; ARC-014 exige un compte de service « sans droit de suppression ». Dans GCS, **écraser un objet existant demande le droit de suppression**. Soit l'idempotence échoue, soit on donne le droit de suppression pour la faire marcher, et un attaquant qui prend le VPS peut alors effacer la copie hors site (le versionnement seul ne suffit pas : un compte qui peut supprimer peut aussi supprimer les versions anciennes).
  - Le verrou de rétention est « si l'offre le permet » ; le chiffrement est « recommandé », non décidé (question Q19 de la recette). Le disque externe USB contient en clair toutes les pièces et, plus tard, la paie.
  - Le bucket appartient à un projet Google dont le compte administrateur (Direction) n'a pas d'exigence de double authentification dans la conception : la prise de ce compte efface tout.
  - La copie 3 est faite « depuis GCS » sur un poste du bureau : il faut un identifiant de lecture GCS sur ce poste (non décrit).
- **Preuve** : `01-CONCEPTION.md` §5 W07a (« Idempotence : … remplace l'objet du même nom »), §8.2 (« rôle exact à vérifier »), §8.4 (« verrou de rétention si l'offre le permet », « chiffrement … recommandé ») ; `02-BACKLOG.md` ARC-014 ; `03-PLAN-RECETTE.md` REC-105 (« règle manquante : chiffrement »).
- **Correctif** (3 h) :
  - **Chiffrement à clé publique** (par exemple `age` ou `gpg`) : le VPS ne détient que la **clé publique** ; la clé privée est imprimée et au coffre (deux exemplaires, lieux différents), et sur le poste qui fait la restauration seulement le temps de la restauration. Bénéfice : un attaquant qui prend le VPS ne peut lire aucune sauvegarde passée.
  - Noms d'objets **uniques** (date + heure + empreinte) : jamais d'écrasement, donc le compte de service n'a besoin que de `storage.objects.create` (rôle « Créateur d'objets » sans lecture ni suppression). Test d'ARC-014 étendu : une suppression **et** un écrasement échouent.
  - Règle de rétention sur le bucket (par exemple 400 jours pour les dumps ; durée légale pour les fichiers, à fixer à J12), **verrouillée** une fois validée (« Bucket Lock ») ; la suppression devient impossible même pour l'administrateur pendant la durée.
  - Accès public interdit au niveau du bucket (« public access prevention ») et accès uniforme ; double authentification obligatoire sur le compte Google propriétaire du projet.
  - Copie 3 : disque externe chiffré (BitLocker si Windows, ou fichiers déjà chiffrés par `age` copiés tels quels, ce qui suffit) ; identifiant GCS de **lecture seule**, distinct, sur le poste qui fait la copie.
- **Backlog** : modifier **ARC-014** et **ARC-015** (la restauration utilise la clé privée sortie du coffre : procédure écrite), **ARC-034** ; trancher Q19 à ARC-003.

### SEC-11 — Jetons NocoDB (`xc-token`) : portée trop large, le jeton du site peut atteindre l'archive
- **Gravité** : Élevée · **Nature** : À vérifier (portée réelle sur la version installée) · **Composant** : NocoDB, site web
- **Menace** : une faille du site public donne accès en lecture et écriture à l'archive via l'API NocoDB.
- **Scénario** : un jeton d'API NocoDB porte les droits **de l'utilisateur qui l'a créé**, sur toutes les bases auxquelles il a accès ; il n'a pas de portée par table. Le site utilise un jeton (`NOCODB_API_TOKEN`, `api/lib/nocodb.js`) ; s'il a été créé par le compte propriétaire (cas le plus fréquent), il donne demain accès à la base `archive_compta` branchée dans la même instance NocoDB, avec les droits `arch_nocodb` (lecture de toutes les pièces, modification de tri et de décision). Le site public étant la surface la plus attaquée, c'est le chemin le plus probable vers l'archive. La conception demande seulement un jeton n8n « distinct de celui du site ».
- **Preuve** : `api/lib/nocodb.js` lignes 6-8, 45 ; `01-CONCEPTION.md` §8.2 (« Jeton NocoDB de n8n distinct de celui du site ») ; `02-BACKLOG.md` ARC-019.
- **Correctif** (1 h) :
  - Le jeton du site est recréé depuis un **compte de service NocoDB dédié** (« site-crm ») qui n'a accès qu'à la base du CRM des devis, avec le rôle le plus faible permettant l'insertion ; l'ancien jeton est révoqué.
  - n8n n'utilise **pas** de jeton NocoDB pour l'archive (il parle SQL directement, ADR-01) ; s'il en faut un pour l'API d'audit (SEC-04), il vient d'un compte NocoDB en lecture seule sur la base de l'archive.
  - Rotation des jetons à ARC-035 et à chaque départ ; inventaire des jetons existants à ARC-001.
- **Backlog** : modifier **ARC-001** (inventaire des jetons, sans les afficher), **ARC-010**, **ARC-019** (« le jeton du site ne lit aucune table de l'archive » : test d'appel API qui doit échouer).

### SEC-12 — Secrets : clés de chiffrement générées automatiquement, lisibles par le groupe Docker, exports de workflows
- **Gravité** : Moyenne · **Nature** : À vérifier · **Composant** : n8n, NocoDB, VPS
- **Menace** : perte irréversible des identifiants n8n ; lecture des secrets par un compte non-root.
- **Scénario** :
  - Si `N8N_ENCRYPTION_KEY` n'est pas fixée, n8n génère sa clé dans son répertoire de données ; sans volume persistant, la clé disparaît au prochain recréation du conteneur, exactement comme les données de NocoDB en juin, et tous les identifiants enregistrés deviennent illisibles. Même logique pour le secret de session de NocoDB (`NC_AUTH_JWT_SECRET` ou équivalent) qui chiffre aussi les identifiants de la source PostgreSQL externe.
  - Les variables d'environnement d'un conteneur sont lisibles par `docker inspect` pour tout membre du groupe `docker` (équivalent root). Les fichiers 600 « lisibles par root » ne suffisent pas si l'utilisateur `foga` est dans le groupe `docker`.
  - Les exports JSON de workflows ne contiennent pas les secrets des identifiants, mais contiennent tout ce qui est écrit **en dur** dans un nœud (en-tête HTTP, URL avec jeton).
  - `n8n export:credentials --decrypted` permet à quiconque a un shell sur le conteneur de sortir tous les secrets en clair.
- **Preuve** : `01-CONCEPTION.md` ADR-01 (« sa clé de chiffrement des identifiants est sauvegardée à part »), §8.2 ; `02-BACKLOG.md` ARC-019 (« clés imprimées et mises sous enveloppe »).
- **Correctif** (1 h) : fixer explicitement `N8N_ENCRYPTION_KEY` et le secret NocoDB dans les fichiers d'environnement (600, propriétaire root), les imprimer au coffre (déjà prévu) **et** vérifier leur restauration lors d'ARC-015 (n8n relancé sur une machine vierge lit ses identifiants) ; personne d'autre que root dans le groupe `docker` ; analyse des exports de workflows par un outil de détection de secrets (`gitleaks`) avant chaque commit ; aucun secret en dur dans un nœud (règle écrite).
- **Backlog** : modifier **ARC-005** et **ARC-015** (critère : identifiants n8n lisibles après restauration) ; **ARC-019**.

### SEC-13 — Fichiers téléversés : type vérifié comment, taille sans limite, fichiers servis sur la même origine que NocoDB
- **Gravité** : Moyenne · **Nature** : Démontré (paramètre non fixé) / À vérifier (implémentation) · **Composant** : W01, Nginx `/fichiers/`
- **Menace** : saturation du disque ; contenu actif exécuté dans le navigateur des comptables.
- **Scénario** :
  - « Fichier non PDF → quarantaine » sans dire comment le type est reconnu : une vérification par extension accepte un HTML ou un SVG renommé `.pdf`. Servi depuis `/fichiers/` sur le même domaine que NocoDB, avec un type déduit du contenu par le navigateur, il exécute du script dans le contexte de l'archive (vol de session NocoDB si même origine).
  - `taille_max_fichier_mo` est « à fixer après les 50 pièces d'essai » : pendant l'essai et tant que ce n'est pas fait, aucune limite ; un lot de très gros fichiers remplit le disque et arrête PostgreSQL.
  - PDF piégés (JavaScript, fichiers incorporés, actions de lancement) : risque réel si les pièces sont ouvertes dans un lecteur PDF de bureau ancien sur les postes Windows.
- **Preuve** : `01-CONCEPTION.md` §5 W01 étape (3), §4.2 `parametres.taille_max_fichier_mo`, §8.3 (seul `nosniff` est cité).
- **Correctif** (1 h) : type reconnu par les **octets de tête** (`%PDF-`) et non par l'extension ; taille maximale fixée **dès maintenant** (par exemple 20 Mo, ajustable) ; sur `/fichiers/` et `/piece/` : `Content-Type: application/pdf` forcé, `Content-Disposition: inline`, `Content-Security-Policy: sandbox`, `X-Content-Type-Options: nosniff` ; idéalement `/fichiers/` sur un **sous-domaine distinct** de NocoDB. Ouvrir les pièces dans le navigateur (lecteur intégré, sans JavaScript PDF) plutôt que dans un lecteur de bureau ; lecteurs PDF des postes à jour.
- **Backlog** : modifier **ARC-011** (test : fichier HTML renommé `.pdf` → quarantaine) et **ARC-008** (en-têtes).

### SEC-14 — Immuabilité des fichiers rangés non garantie sur le disque
- **Gravité** : Moyenne · **Nature** : Démontré · **Composant** : `/srv/archive/fichiers/`, n8n
- **Menace** : modification ou suppression d'un PDF classé par n8n (erreur de workflow ou compromission).
- **Scénario** : `fichiers/` est en « écriture par l'utilisateur du conteneur n8n seulement ; fichiers en lecture seule après rangement ». Le propriétaire d'un fichier peut toujours remettre le droit d'écriture (`chmod`) et le supprimer, car il a l'écriture sur le répertoire. La correction T14 suppose même que n8n retire l'ancien nom (« ancien nom absent du rangement »). Un workflow défectueux qui boucle peut donc effacer le rangement ; seul E06 hebdomadaire complet le verra.
- **Preuve** : `01-CONCEPTION.md` §8.3, §4.3 (T14), §5 W06 (E06 complet une fois par semaine) ; `02-BACKLOG.md` ARC-025.
- **Correctif** (2 h, simple) : séparer **le stockage** de **la présentation** : chaque fichier est écrit une fois dans `objets/<sha256>.pdf`, puis une tâche de l'hôte le passe à `root:root 0444` (et éventuellement `chattr +i`) ; l'arborescence `Archive/AAAA/…` lisible par Nginx est faite de **liens** vers ces objets, que n8n peut recréer lors d'une correction T14 sans jamais toucher au contenu. À défaut : copie GCS sous rétention (SEC-10) comme référence et E06 quotidien sur toutes les pièces classées dans les 7 derniers jours.
- **Backlog** : modifier **ARC-008** et **ARC-012** ; à arbitrer par l'architecte (changement de structure mineur, chemin indexé inchangé).

### SEC-15 — Double authentification et comptes à fort privilège hors NocoDB non traités
- **Gravité** : Moyenne · **Nature** : À vérifier · **Composant** : NocoDB, Hostinger, Google, SSH
- **Menace** : vol de mot de passe d'un compte qui donne tout.
- **Scénario** : la double authentification n'est prévue que « si NocoDB la propose » (incertain sur la version libre). Les comptes qui donnent **tout** ne sont pas listés : le panneau Hostinger (console root, réinstallation et restauration d'instantané du VPS en un clic), le compte Google propriétaire du projet GCS, le compte SMTP, le compte GitHub du dépôt. L'authentification Nginx (`/fichiers/`) est une deuxième base de mots de passe à tenir à jour en parallèle de NocoDB, sans limitation de tentatives.
- **Preuve** : `01-CONCEPTION.md` §8.1, §8.3 ; `02-BACKLOG.md` ARC-019 (« double authentification activée là où c'est possible, sinon écart noté »).
- **Correctif** (1 h) : double authentification **obligatoire** sur Hostinger, Google et GitHub (gratuite et disponible) avant le go ; SSH par clé seulement (déjà prévu) ; si NocoDB n'a pas de double authentification : mots de passe de 14 caractères au moins par gestionnaire de mots de passe, limitation de débit Nginx sur la page de connexion et `fail2ban`. Option proportionnée si le risque est jugé élevé plus tard : réseau privé (WireGuard / Tailscale) pour la dizaine d'utilisateurs, ce qui retire NocoDB d'Internet. Départ d'une personne : fiche de sortie unique (NocoDB, Nginx, SFTP, jetons).
- **Backlog** : modifier **ARC-019** (liste des comptes à fort privilège et état de leur double authentification) et **ARC-035**.

### SEC-16 — Injection de formules dans les CSV exportés et importés
- **Gravité** : Moyenne · **Nature** : Démontré (exports prévus) / À vérifier (implémentation) · **Composant** : F2, exports NocoDB, ARC-033, W05
- **Menace** : exécution de formules ou de liens piégés dans le tableur du comptable ou de la Direction.
- **Scénario** : un `tiers` ou un `libelle` saisi `=HYPERLINK("http://…";"Voir")` ou commençant par `=`, `+`, `-`, `@` est recopié dans les exports CSV (F2, listes d'écarts, export complet en formats ouverts) et s'évalue à l'ouverture dans Excel. Le CSV d'écritures produit depuis l'Excel du comptable (source `EXCEL`) peut aussi en contenir.
- **Preuve** : `01-CONCEPTION.md` §7.1 F2, §9 US-ARC-04 et US-SYS-11 ; `02-BACKLOG.md` ARC-027, ARC-033.
- **Correctif** (1 h) : à l'export, préfixer d'une apostrophe toute cellule texte qui commence par `=`, `+`, `-`, `@`, tabulation ou retour chariot (les montants sont des entiers, non concernés) ; à la saisie, refuser ces caractères en tête de `tiers` (contrainte `CHECK`) ; à l'import W05, rejeter un `libelle` qui commence par `=`.
- **Backlog** : modifier **ARC-027** et **ARC-033** ; un cas de recette.

### SEC-17 — Disponibilité : supervision externe après le go, RTO/RPO non fixés, revue de sécurité le jour même du go
- **Gravité** : Moyenne · **Nature** : Démontré · **Composant** : exploitation
- **Menace** : panne silencieuse pendant l'archivage en masse ; correctifs de sécurité découverts trop tard pour être faits.
- **Scénario** : la sonde externe (ARC-028) est prévue le 21 octobre, après le début de l'archivage en masse (14-23 octobre) ; un VPS arrêté un soir n'alerte personne jusqu'au lendemain. Aucune perte maximale admissible (RPO) ni durée de restauration (RTO) n'est fixée (Q19). La revue de sécurité ARC-019 a lieu le vendredi 16 au matin, jour du go : un point bloquant trouvé ce jour-là impose un no-go. Perte de la clé n8n = perte des identifiants (SEC-12). Coupures électriques et réseau au bureau : n'affectent pas le VPS, mais retardent la copie 3.
- **Preuve** : `02-BACKLOG.md` ARC-019 (J08), ARC-028 (J10) ; `01-CONCEPTION.md` §8.6 (« à choisir ») ; `03-PLAN-RECETTE.md` Q19.
- **Correctif** (1 h) : sonde externe gratuite (service de surveillance HTTP en ligne) **avant le go**, sur NocoDB et sur `/piece/` (réponse 401 attendue) ; RPO = 24 h, RTO = 1 jour ouvré, écrits et signés ; faire chaque contrôle de sécurité **dans le critère de la tâche qui le crée** (ARC-005, 006, 008, 014) et réduire ARC-019 à une relecture finale ; instantanés Hostinger activés (n'est pas une copie, mais réduit le RTO).
- **Backlog** : avancer une partie d'**ARC-028** en MVP-0 ; modifier **ARC-019**.

### SEC-18 — L'instance n8n est partagée avec le site public et un flux d'IA existant
- **Gravité** : Moyenne · **Nature** : À vérifier · **Composant** : n8n, site web
- **Menace** : sortie de données comptables vers un service d'IA par un workflow voisin ; webhook public abusé.
- **Scénario** : le site appelle un webhook n8n pour une « qualification IA » des devis (`api/routes/devis.js`, lignes 101 et 233) : l'instance n8n contient donc déjà, probablement, des identifiants d'un service d'IA externe et un webhook public sans authentification (n'importe qui peut y envoyer de fausses demandes et consommer le crédit d'IA). L'archive est prévue dans la même instance : un workflow d'archive pourrait utiliser ces identifiants par erreur, et l'option IA « désactivée » ne l'est que par un paramètre en base (SEC-05).
- **Preuve** : `api/routes/devis.js` lignes 101-120 et 233-250 ; `01-CONCEPTION.md` ADR-06, §2.1.
- **Correctif** (1 h ; séparation complète optionnelle) : au minimum, webhook devis protégé par un en-tête secret (authentification « Header Auth » du nœud Webhook, secret dans l'environnement du site) ; identifiants d'IA réservés aux workflows du site (projets n8n séparés si la version les gère) ; règle écrite « aucun workflow de l'archive n'a de nœud vers un service externe hors GCS et SMTP », vérifiée sur les exports JSON. Option si la mémoire le permet : une seconde instance n8n dédiée à l'archive.
- **Backlog** : à créer **ARC-041 — Cloisonnement de n8n (site / archive)**, L3, 1 à 2 h ; ajouter le contrôle à **ARC-019**.

### SEC-19 — Poste de numérisation et compte SFTP
- **Gravité** : Moyenne · **Nature** : À vérifier · **Composant** : poste Windows, script d'envoi, SFTP
- **Menace** : vol du poste ou de la clé SFTP ; dépôt malveillant ; fuite des scans locaux.
- **Scénario** : le script « lancé par double-clic » doit s'authentifier sans saisie : clé SFTP sans phrase de passe ou mot de passe en clair dans le script. Les scans restent dans `A_ENVOYER/` jusqu'à ingestion et sauvegarde, en clair sur un poste de bureau. Avec la clé, on peut déposer des lots arbitraires (remplir le disque, tenter SEC-06/SEC-07) et, selon la configuration, supprimer ou remplacer un lot non encore ingéré.
- **Preuve** : `01-CONCEPTION.md` §2.2 étapes 1-2, §8.3 ; `02-BACKLOG.md` ARC-009.
- **Correctif** (1 h) : compte SFTP en `ForceCommand internal-sftp` + `ChrootDirectory`, sans shell ni redirection de ports ; clé dédiée au poste, révocable ; quota disque sur le compte (ou partition dédiée) ; chiffrement du disque du poste (BitLocker) ; script versionné **sans** mot de passe ; un lot déjà marqué `_PRET` n'est plus modifiable (W01 le déplace immédiatement dans une zone non accessible au compte SFTP).
- **Backlog** : modifier **ARC-008** et **ARC-009**.

### SEC-20 — Données comptables conservées dans les exécutions n8n et dans les journaux
- **Gravité** : Faible · **Nature** : À vérifier · **Composant** : n8n, Nginx, API du site
- **Menace** : copie non maîtrisée des données (et des données personnelles des clients du site) dans des journaux sans durée de conservation.
- **Scénario** : n8n garde par défaut les données de chaque exécution (tiers, montants, contenus de CSV) dans sa base ; elles se retrouvent dans les dumps et ne sont jamais purgées. Les journaux Nginx de `/fichiers/` (preuve des consultations, US-SYS-12) sont tournés par défaut après 14 jours et seraient perdus. Le site journalise le corps des réponses d'erreur de NocoDB (`api/lib/nocodb.js` ligne 56), qui peut contenir des données personnelles.
- **Preuve** : `01-CONCEPTION.md` §5 (règles communes), §8.3, §8.9.
- **Correctif** (30 min) : `EXECUTIONS_DATA_SAVE_ON_SUCCESS=none` (ou rétention courte avec `EXECUTIONS_DATA_PRUNE`) ; journaux d'accès `/fichiers/` conservés 1 an et inclus dans la sauvegarde ; ne pas journaliser les corps de réponse.
- **Backlog** : modifier **ARC-013** et **ARC-040**.

### SEC-21 — Option IA : garde-fous incomplets
- **Gravité** : Faible (tant qu'elle est désactivée) · **Nature** : Démontré · **Composant** : W12, ADR-06
- **Menace** : sortie de pièces comptables et de données de salariés vers un tiers.
- **Scénario** : ADR-06 limite bien le rôle de l'IA (propositions seulement, jamais d'identifiant ni de statut). Il ne dit pas **quelles données sortent** (le PDF entier, donc tout son contenu), vers quel prestataire, dans quel pays, avec quelle conservation chez lui, ni quels types sont exclus. Le paramètre d'activation est modifiable depuis NocoDB (SEC-05).
- **Preuve** : `01-CONCEPTION.md` ADR-06 ; `02-BACKLOG.md` ARC-039.
- **Correctif** (à la décision J19) : préférer l'OCR local (ADR-06 option 2, aucune sortie) ; si un service externe est retenu : exclure `7_Paie`, `8_Fiscal`, `9_Contrats` ; n'envoyer que la première page ; contrat de traitement des données avec le prestataire et option « pas d'entraînement sur les données » ; identifiants d'IA dans un workflow qui ne lit que les pièces `A_trier` ; activation par variable d'environnement **et** paramètre (deux clés) ; avis d'un juriste sur la loi congolaise de protection des données personnelles (à confirmer).
- **Backlog** : compléter **ARC-039** (SEC déjà prévu).

### SEC-22 — Restaurations et environnement de test : données réelles sur des postes non maîtrisés
- **Gravité** : Faible · **Nature** : Démontré · **Composant** : ARC-015, ARC-029, §8.7
- **Menace** : copie complète de l'archive laissée sur un poste.
- **Scénario** : §8.7 interdit « la copie des pièces réelles sur un poste non chiffré », mais ARC-015 et ARC-034 restaurent l'archive complète « sur une machine qui n'est pas le VPS » ; W07b restaure chaque semaine sur l'environnement de test. Rien ne dit que la machine est chiffrée ni que la copie est effacée après.
- **Preuve** : `01-CONCEPTION.md` §8.5, §8.7, W07b ; `02-BACKLOG.md` ARC-015, ARC-029.
- **Correctif** (15 min de procédure) : machine de restauration à disque chiffré ; effacement des données restaurées noté au procès-verbal ; W07b restaure sur le VPS (`archive_restore`, déjà prévu) plutôt que sur un poste.
- **Backlog** : modifier **ARC-015**.

### SEC-23 — Dépôt : aucun secret réel trouvé, mais `.gitignore` incomplet et modèle Docker de développement risqué
- **Gravité** : Faible · **Nature** : Démontré · **Composant** : dépôt `-foga-tech-v1.0`
- **Constat** (vérification rapide des 229 fichiers suivis par git et des noms de fichiers de tout l'historique) :
  - Aucun fichier `.env` réel, aucune clé privée, aucun fichier de clé de compte de service n'est suivi ni ne l'a été.
  - `.env.example` ligne 6 et `api/.env.example` ligne 2 contiennent une URL de base avec le **mot de passe de développement local**, identique à celui de `docker-compose.yml` ligne 15 (base locale de développement, pas de production : acceptable, à ne jamais réutiliser sur le VPS).
  - `api/.env.example` ligne 17 (`SMTP_PASS`) contient une valeur qui a la forme d'un exemple ; **à confirmer par le développeur** qu'il ne s'agit pas du vrai mot de passe SMTP (sinon : changer le mot de passe chez Hostinger, puis nettoyer la ligne).
  - `docs/ENV.md` ligne 9 : valeur d'exemple.
  - `.gitignore` ignore `.env` et `.env.local` mais pas `.env.production`, `.env.*`, les fichiers de clé JSON d'un compte de service GCS, ni les exports de workflows n8n non relus. Il ignore `*.pdf` (bien : aucune pièce ne peut être versionnée par erreur).
  - `docker-compose.yml` publie PostgreSQL sur toutes les interfaces (lignes 17-18) : voir SEC-08.
- **Correctif** (15 min) : ajouter à `.gitignore` `.env.*` (avec `!.env.example`), `*.key`, `*-sa.json`, `*credentials*.json`, `n8n-export-brut/` ; lier le port de développement à `127.0.0.1:5433` ; ajouter `gitleaks` en crochet de pré-commit ou en étape manuelle d'ARC-019.
- **Backlog** : **ARC-004** (fichier de composition de test) et **ARC-019**.

### SEC-24 — Accès aux fichiers : tout compte authentifié lit toutes les pièces
- **Gravité** : Faible aujourd'hui, Moyenne quand la paie entrera · **Nature** : Démontré · **Composant** : Nginx `/fichiers/`
- **Menace** : lecture de bulletins de paie ou de contrats par une personne qui n'en a pas besoin (aide au tri).
- **Scénario** : l'authentification Nginx est « un compte par personne autorisée » sans distinction de type : l'aide au tri peut lire toutes les pièces classées, y compris `7_Paie` dès qu'elles existeront.
- **Preuve** : `01-CONCEPTION.md` §8.3, §6 ; fiche §4 (types `7_Paie` à inventorier).
- **Correctif** (30 min, avant l'entrée de la paie) : `location` Nginx par type sensible (`/fichiers/Archive/*/7_Paie/`) limitée à une liste d'utilisateurs (Direction, comptable) ; même restriction dans les vues NocoDB.
- **Backlog** : compléter **ARC-040** ; décision avant tout lot de paie.

---

## 3. Liste de contrôle de sécurité

### 3.1 À valider avant le go du vendredi 16 octobre (un seul « non » = point bloquant pour ARC-020)

**Exposition**
- [ ] Depuis un réseau extérieur, seuls les ports 22 et 443 (et 80 en redirection) répondent (`nmap`), y compris pour les conteneurs Docker (SEC-08).
- [ ] `docker ps` : aucun port publié sur `0.0.0.0` hors Nginx ; PostgreSQL non publié (SEC-08).
- [ ] L'éditeur n8n n'est pas joignable depuis Internet ; seul le chemin de webhook nommé est publié par Nginx (SEC-08).
- [ ] Inscription NocoDB fermée ; aucune vue ni aucun formulaire partagé par lien public (SEC-08, ARC-010).
- [ ] n8n et NocoDB à la dernière version corrective ; versions notées (SEC-08).
- [ ] `/piece/<id>` et `/fichiers/…` sans authentification : 401, sans en-tête `Location`, réponse identique pour un identifiant connu et inconnu (SEC-01).
- [ ] En-têtes HSTS, `nosniff`, `X-Frame-Options`, CSP `sandbox` sur `/fichiers/` présents (SEC-08, SEC-13).

**Base de données**
- [ ] Aucun rôle utilisé par NocoDB ou n8n n'est superutilisateur ni propriétaire des tables de l'archive (`pg_roles`, `pg_tables`) (SEC-02).
- [ ] `arch_owner` en `NOLOGIN` hors migration (SEC-02).
- [ ] `TRUNCATE` sur `pieces` et `journal_audit` refusé pour tous les rôles applicatifs (SEC-02).
- [ ] `UPDATE compteurs` et `INSERT journal_audit` refusés pour `arch_nocodb` et `arch_n8n` (SEC-05).
- [ ] `UPDATE pieces SET empreinte_sha256 = …` refusé pour **tous** les rôles sur une pièce qui a une empreinte (SEC-03).
- [ ] Journal chaîné par empreinte ; ancre de la nuit présente sur GCS et dans le courriel du soir (SEC-02).
- [ ] `parametres` et `types_piece` en lecture seule pour NocoDB ; contraintes `CHECK` de format en place (SEC-05, SEC-06).

**Entrées et workflows**
- [ ] Nœud Execute Command désactivé ; `N8N_BLOCK_ENV_ACCESS_IN_NODE` et restriction des accès fichiers actifs (SEC-07, SEC-06).
- [ ] Aucune expression `{{ }}` dans le texte d'une requête SQL des exports de workflows (recherche dans les JSON) (SEC-09).
- [ ] Lot de test piégé ingéré sans effet : nom avec `../`, nom avec `$()` et `;`, HTML renommé `.pdf`, fichier au-dessus de la taille maximale (SEC-06, SEC-07, SEC-13).
- [ ] Taille maximale de fichier fixée dans `parametres` (SEC-13).

**Sauvegardes et secrets**
- [ ] Sauvegardes chiffrées avec une clé publique ; clé privée au coffre, absente du VPS (SEC-10).
- [ ] Compte de service GCS : création seule ; une suppression **et** un écrasement échouent (essai consigné) (SEC-10).
- [ ] Règle de rétention posée sur le bucket ; accès public interdit (SEC-10).
- [ ] Restauration ARC-015 réussie avec la clé sortie du coffre ; identifiants n8n lisibles après restauration (SEC-10, SEC-12).
- [ ] `N8N_ENCRYPTION_KEY` et secret NocoDB fixés, fichiers d'environnement en 600 root, au coffre (SEC-12).
- [ ] Aucun secret dans le dépôt ni dans les exports de workflows (`gitleaks` passé) ; valeur `SMTP_PASS` d'`api/.env.example` confirmée comme fictive (SEC-23).
- [ ] Jeton NocoDB du site recréé sur un compte limité au CRM ; il ne lit aucune table de l'archive (essai) (SEC-11).

**Comptes**
- [ ] Double authentification active sur Hostinger, Google (GCS) et GitHub (SEC-15).
- [ ] Un compte NocoDB nominatif par personne, liste signée par la Direction ; aucun compte partagé (§8.1).
- [ ] Compte SFTP du poste : chroot, sans shell, quota (SEC-19).
- [ ] Sonde externe en place et essayée (SEC-17).

### 3.2 À valider avant la mise en service définitive (remise du 31 octobre)
- [ ] Quatre yeux vérifié sur le compte NocoDB réel (ou risque résiduel signé par la Direction) ; essai de contournement en recette (SEC-04).
- [ ] Dépôt des CSV d'écritures réservé et attribué à une personne (SEC-09).
- [ ] Exports CSV protégés contre l'injection de formules (SEC-16).
- [ ] Fichiers rangés non modifiables par n8n (objets en lecture seule ou E06 renforcé) (SEC-14).
- [ ] Webhook devis du site authentifié ; identifiants d'IA séparés des workflows de l'archive (SEC-18).
- [ ] Rétention des exécutions n8n réglée ; journaux d'accès aux fichiers conservés 1 an (SEC-20).
- [ ] Disque externe chiffré ; procédure de copie hebdomadaire avec identifiant GCS en lecture seule (SEC-10).
- [ ] RPO et RTO écrits et signés (SEC-17).
- [ ] Rotation de tous les secrets utilisés pendant la construction (ARC-035) ; comptes inutiles fermés ; liste des comptes à fort privilège signée.
- [ ] Règle de rétention du bucket verrouillée une fois la durée de conservation confirmée (J12) (SEC-10).
- [ ] Restriction d'accès aux types sensibles prête avant tout lot de paie (SEC-24).

---

## 4. Ce qui n'est pas vérifiable sans accès au serveur, aux versions ou au code de l'ERP

| Sujet | Pourquoi c'est important | Où le vérifier |
|---|---|---|
| Versions installées de n8n et de NocoDB, et leur exposition réelle | Vulnérabilités connues, options de sécurité disponibles (2FA, inscription, restriction par table, champs « modifié par », API d'audit, désactivation d'Execute Command par défaut) | ARC-001, ARC-002 |
| Ports réellement ouverts et publications Docker | SEC-08 : Docker contourne UFW | ARC-001 (`ss -tlnp`, `docker ps`, `nmap` extérieur) |
| Rôles PostgreSQL utilisés aujourd'hui par NocoDB et n8n (superutilisateur ?) | SEC-02 | ARC-001 |
| Portée et créateur des jetons NocoDB existants (site, n8n) | SEC-11 | ARC-001, interface NocoDB |
| Contenu des workflows n8n existants (devis, « qualification IA ») et identifiants enregistrés | SEC-18 | Éditeur n8n |
| Présence et sauvegarde de `N8N_ENCRYPTION_KEY` et du secret NocoDB | SEC-12 : sans eux, les identifiants sont perdus | ARC-001, ARC-005 |
| Offre GCS : rétention, verrou, rôles exacts, suppression douce | SEC-10 | Console GCS (Direction) |
| Système et chiffrement du poste de numérisation | SEC-19 | ARC-009 |
| Code de l'ERP : authentification, stockage de `piece_id`, sûreté de la production du CSV F1, chemin unique `comptabilisation.py`, protection de la base SQLite, construction du lien F3 | Le CSV de l'ERP est une entrée non fiable de l'archive ; l'ERP sera en ligne sur le même VPS (J07) et devient une nouvelle surface d'attaque | ARC-018, ARC-021 (SEC à prévoir) |
| Lieu de stockage de la liste F2 côté ERP | Liste de tous les tiers et montants sur le poste du développeur tant que l'ERP y tourne | ARC-018 |
| Configuration Nginx réelle (sites, en-têtes, TLS, renouvellement) | SEC-01, SEC-08, SEC-13 | ARC-008 |
| Sécurité du compte Hostinger (accès console, instantanés) | Prise du compte = prise du VPS | Direction |
| Valeur réelle de `SMTP_PASS` dans `api/.env.example` ligne 17 | SEC-23 | Développeur |
| Cadre légal (protection des données personnelles au Congo, durée de conservation OHADA) | SEC-21, SEC-24, rétention | Juriste, expert-comptable (J12) |

**Ce que cet audit ne couvre pas** : test d'intrusion réel ; revue du code (inexistant) ; sécurité du reste du site web au-delà de son lien avec NocoDB et n8n ; sécurité physique des boîtes de papier.

---

## 5. Vérification de la version 0.2

Contre-vérification indépendante de `01-CONCEPTION.md` v0.2 et `02-BACKLOG.md` v0.2, faite le 11 octobre 2026. Chaque verdict s'appuie sur le texte de la v0.2, pas sur le tableau « Traitement des revues » de l'auteur. Les sections citées sont celles de la v0.2.

Verdicts : **Résolu** (correctif présent, suffisant et techniquement juste) ; **Partiellement** (correctif présent mais incomplet, ou reporté après le go) ; **Non résolu** ; **Régression** (la v0.2 aggrave le constat).

### 5.1 Verdict par constat

#### Constats critiques et élevés

| Constat | Verdict | Ce que fait la v0.2 (section) | Ce qui manque ou est faux |
|---|---|---|---|
| SEC-01 W08 public | **Résolu** | W08 supprimé (§5.1). `/piece/<id>` et `/apercu/<n>` authentifiés par Nginx **avant** tout traitement, format vérifié par Nginx, `limit_req`, `X-Accel-Redirect` vers un emplacement `internal`, 401 sans `Location`, 404 générique (§8.2). Test d'énumération dans ARC-024. | Points résiduels traités dans les nouveaux risques NR-09 (publication du webhook) et NR-10 (cache, droits par rôle). |
| SEC-02 journal et interdictions contournables | **Partiellement** | Aucun outil en superutilisateur ni en propriétaire. `arch_owner` et `arch_fonctions` en `NOLOGIN`. `TRUNCATE` révoqué et déclencheur par instruction. Journal chaîné dès le go. Ancre chaque nuit sur GCS et par courriel. `log_statement = 'ddl'` (§4.4, §4.5, §8.11). Tests (h) et (k) dans ARC-007. | **Personne ne vérifie la chaîne** : aucune tâche ne recalcule les empreintes ni ne les compare à l'ancre (H5 ne le fait pas, §5.2). La règle de rétention n'est verrouillée qu'après J12 : d'ici là, l'administrateur du projet GCS peut la retirer. `acteur_db` n'est pas défini : s'il vient de `current_user`, toutes les lignes écrites par une fonction `SECURITY DEFINER` porteront `arch_fonctions`. Voir NR-08. |
| SEC-03 empreinte réécrite | **Résolu** | Empreinte et taille non modifiables par personne. `id_piece`, `chemin`, `nom_fichier` écrits seulement par les fonctions. `arch_n8n` n'a que SELECT sur `pieces`. H5 compare à `pieces` **et** à `fichiers_deposes` (§4.4, §4.5, §5.2). | Fenêtre d'une minute avant le scellement et objet préexistant non revérifié : voir NR-11 (faible). |
| SEC-04 quatre yeux | **Partiellement** | Compte NocoDB réel si la version le permet. Sinon : champs de décision masqués, E13, échantillon surpondéré, risque signé (D7) (§4.3, §5.3). ARC-047 après le go. | `trie_par` et `valide_par` restent modifiables par `arch_nocodb` (§4.5). La base ne distingue toujours pas l'aide au tri du valideur. Correctif proposé en NR-03 (deux rôles de base). |
| SEC-05 droits NocoDB | **Partiellement** | La matrice table × rôle (§4.5) est juste et précise. | 1. **Les fonctions restent exécutables par tous** (NR-01) : PostgreSQL donne `EXECUTE` à `PUBLIC` sur toute nouvelle fonction. La case « — » de la matrice ne retire donc pas ce droit à `arch_nocodb`. 2. Les actions « réservées au responsable de validation » ne sont pas vérifiées (NR-03). |
| SEC-06 traversée de chemin | **Partiellement** | Aucun nom fourni par un humain ou par le poste dans un chemin. Format de `code_lot`. `CHECK` sur les référentiels. `racine_archive` en variable d'environnement. Préfixe revalidé (§4.2, §4.6, §4.7, §8.4). | La traversée **en écriture** est fermée. Restent la lecture d'un chemin du manifeste (« sous-dossiers admis », §5.1 W01 étape 3) et les liens symboliques déposés par SFTP : voir NR-04. |
| SEC-07 commandes système | **Résolu** | Execute Command désactivé, empreinte par Crypto ou Code, opérations système dans les tâches de l'hôte, sans interpréteur de commandes ni valeur lue en base (§5.1, §5.2, §8.4). | Préciser : `NODE_FUNCTION_ALLOW_BUILTIN=crypto` seulement, jamais `*`. Le montage du disque dans n8n est trop large : voir NR-05. |
| SEC-08 exposition | **Résolu** | Seuls 22 et 443, ports Docker sur `127.0.0.1`, éditeur n8n par tunnel SSH, inscription fermée, mises à jour, `nmap` extérieur (§8.2, ARC-042). | Publication exacte du webhook devis : voir NR-09. |
| SEC-09 SQL et CSV | **Résolu** | Paramètres liés ou fonctions, aucun `{{ }}` dans le SQL, compte SFTP « imports » distinct, validation stricte par colonne, une transaction, seuil de confirmation (§5.1 W05, §8.4, ARC-023). | Incohérence : la confirmation d'un import `A_confirmer` « dans NocoDB » est impossible, car `arch_nocodb` n'a que SELECT sur `imports_ecritures` (§4.5). Elle sera réglée avec NR-03. |
| SEC-10 sauvegardes | **Partiellement** | Correctif juste sur l'essentiel (§8.6, ARC-014) : clé publique seule sur le VPS ; noms uniques avec précondition « n'existe pas » ; compte de service en création seule ; essai de suppression et d'écrasement ; accès public interdit ; copie 3 en lecture seule et chiffrée. | 1. **Une règle de rétention s'applique au bucket entier** : on ne peut pas y mettre 400 jours pour les dumps et la durée légale pour les fichiers (§8.6). 2. Vérifier « l'objet distant existe et a la bonne taille » demande un droit de lecture que le rôle en création seule n'a pas. 3. Le verrou n'est posé qu'après J12. Voir NR-07. |
| SEC-11 jetons NocoDB | **Résolu** (sous condition) | n8n sans jeton NocoDB. Jeton du site recréé sur un compte limité au CRM, l'ancien révoqué, essai de refus (§8.3, ARC-045). | Dépend de l'accord de la Direction (configuration de production du site). Sans accord, le constat reste ouvert et doit être noté au go. |

#### Constats moyens et faibles

| Constat | Verdict | Section v0.2 | Remarque |
|---|---|---|---|
| SEC-12 secrets générés | **Résolu** | §8.3, ARC-005, ARC-015 | Clés fixées, au coffre, vérifiées à la restauration ; seul root dans le groupe `docker`. |
| SEC-13 type et taille | **Résolu** | §5.1 W01, §8.2, §8.4 | Octets de tête, 20 Mo, sous-domaine distinct. **Correction de mon propre correctif** : l'en-tête `Content-Security-Policy: sandbox` peut empêcher le lecteur PDF intégré du navigateur (Chrome notamment) d'afficher le fichier. À essayer à ARC-024 ; s'il bloque, le retirer et garder sous-domaine distinct, `nosniff` et `Content-Type` forcé, qui suffisent. |
| SEC-14 immuabilité des fichiers | **Partiellement** | ADR-02, §4.6, §5.2 H1 | Le principe est juste (objets par empreinte, liens). Mais `root:root` et `chattr +i` exigent root, alors que §5.2 annonce « un utilisateur dédié ». Le répertoire `objets/` doit appartenir à root : avec le bit collant, le **propriétaire du répertoire** peut encore supprimer. Voir NR-02. |
| SEC-15 double authentification | **Résolu** | §8.1, ARC-044 | Hostinger, Google, GitHub avant le go. |
| SEC-16 injection de formules | **Résolu** | §8.4, §4.1, §5.1 W05 | Contrôlé à la saisie, à l'import et à l'export. |
| SEC-17 supervision, RPO/RTO | **Résolu** | §8.8, ARC-044 | Sonde avant le go ; RPO et RTO par défaut (D9) ; ARC-019 réduite à une relecture. |
| SEC-18 n8n partagé | **Partiellement** | §8.2, ARC-041 (J10) | ARC-041 vient **après** le go : pendant une semaine, l'archive tourne dans la même instance que le webhook devis non authentifié et les identifiants d'IA. Acceptable seulement si la vérification « aucun nœud extérieur dans les workflows de l'archive » est faite dès ARC-019. |
| SEC-19 poste et SFTP | **Résolu** | §8.4, ARC-008, ARC-009 | Plus la question des liens symboliques SFTP (NR-04). |
| SEC-20 données dans les journaux | **Partiellement** | §8.11 ; ARC-052 reportée | Les journaux n8n et Nginx sont réglés. Le code du site est reporté après le 31 octobre. |
| SEC-21 IA | **Résolu** | ADR-06 | Deux clés d'activation, exclusions, contrat de traitement. |
| SEC-22 données réelles sur postes | **Résolu** | §8.7, §8.9 | — |
| SEC-23 `.gitignore`, compose de dev | **Non résolu** | §11, ARC-052 (après le 31 octobre) | Quinze minutes de travail, alors que les secrets de production sont **créés cette semaine** (clés n8n, GCS, `age`). L'ajout de `.env.*`, `*-sa.json` et des clés à `.gitignore` devrait passer avant le go, avec l'accord de l'utilisateur. |
| SEC-24 types sensibles | **Partiellement** | §4.2 (`7_Paie` inactif) | Bonne parade provisoire. `/apercu/<n>` ouvre toute pièce à tout compte authentifié : voir NR-10. |

**Décompte** : Résolu 14 (SEC-01, 03, 07, 08, 09, 11, 12, 13, 15, 16, 17, 19, 21, 22) · Partiellement 9 (SEC-02, 04, 05, 06, 10, 14, 18, 20, 24) · Non résolu 1 (SEC-23) · Régression 0.

Pour les deux critiques : SEC-01 est résolu. SEC-02 est **largement corrigé**, mais la chaîne n'est vérifiée par personne.

### 5.2 Nouveaux risques introduits ou révélés par la v0.2

#### NR-01 — Les fonctions `SECURITY DEFINER` sont exécutables par `arch_nocodb` (droit `PUBLIC` par défaut)
- **Gravité** : Élevée · **Nature** : Démontré (omission) · **Preuve** : §4.4 (fonctions `SECURITY DEFINER`) ; §4.5 (« Fonctions : — » pour `arch_nocodb`, sans révocation de `PUBLIC`) ; ARC-006 et ARC-007 (pas de test d'`EXECUTE`).
- **Scénario** : PostgreSQL accorde `EXECUTE` à `PUBLIC` sur toute fonction créée. Sans `REVOKE`, une personne qui obtient la main sur NocoDB (ou sur sa source) peut appeler toutes les fonctions sous les droits de `arch_fonctions` :
  - `recaler_compteurs` : crée des trous ;
  - `reintegrer_piece` : crée des pièces avec un identifiant choisi ;
  - `valider_piece` : contourne le contrôle des quatre yeux fait dans W02 ;
  - `annuler_piece`, `appliquer_import`.

  C'est un contournement complet de la matrice SEC-05. Les déclencheurs ne bloquent rien, puisqu'ils exigent justement `current_user = arch_fonctions`.
- **Correctif** (30 min) :
  - `ALTER DEFAULT PRIVILEGES FOR ROLE arch_fonctions REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC` avant toute création, puis `REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA … FROM PUBLIC`, puis un `GRANT EXECUTE` fonction par fonction selon la matrice.
  - `SET search_path = <schéma>, pg_temp` (`pg_temp` en dernier) sur chaque fonction ; noms qualifiés dans le corps ; aucun SQL dynamique construit avec des valeurs.
  - Au début de chaque fonction, contrôle de `session_user` (et non de `current_user`) contre la liste des rôles autorisés.
  - `arch_admin` ne doit pas être membre de `arch_fonctions`.
  - Test dans ARC-007 : `arch_nocodb` appelle chaque fonction et reçoit un refus de droit.

#### NR-02 — H1 tourne nécessairement en root sur des noms créés par n8n : attaque par lien symbolique
- **Gravité** : Élevée · **Nature** : Démontré (contradiction) / À vérifier (implémentation) · **Preuve** : §5.2 (« sous un utilisateur dédié ») contre H1 (« `root:root 0444` ; `chattr +i` ») ; §4.6 (`objets/`, répertoire au bit collant) ; §8.5 (n8n écrit dans `objets/`).
- **Scénario** : seul root peut donner un fichier à root et poser `chattr +i`, donc H1 tournera en root. Elle traite des entrées de `objets/`, où n8n peut créer ce qu'il veut. Un n8n compromis crée `objets/<64 hex>.pdf` sous forme de **lien symbolique** vers `/etc/shadow`, vers la configuration de NocoDB ou vers `pgdata/…`. `chmod` et `chown` suivent le lien : H1 rend ce fichier lisible par tous, ou rend un fichier système immuable (déni de service). Un n8n compromis devient ainsi root.

  Deuxième défaut : si `objets/` appartient à l'utilisateur de n8n, le bit collant ne l'empêche pas de supprimer les objets, car le propriétaire du répertoire le peut toujours.
- **Correctif** (1 h) :
  - H1 est un script root **minimal**, séparé de H2 à H6 (qui restent sous l'utilisateur dédié).
  - Il ne traite que les noms `^[0-9a-f]{64}\.pdf$`. Il ouvre chaque fichier avec `O_NOFOLLOW`, refuse tout ce qui n'est pas un fichier ordinaire ou a plus d'un lien (`nlink > 1`), recalcule la SHA-256 et la compare au nom, puis applique `fchown`/`fchmod` sur le descripteur ouvert. Le chemin n'est jamais repassé à une commande.
  - Un fichier refusé va en quarantaine et produit une alerte.
  - `objets/` appartient à `root`, en mode `1733` (n8n peut créer, pas lister, pas supprimer).
  - Test dans ARC-043 : lien symbolique et lien physique déposés dans `objets/` → refusés, cible intacte.

#### NR-03 — Les actions « réservées » reposent sur des noms déclarés : n'importe quel compte NocoDB peut les obtenir
- **Gravité** : Élevée · **Nature** : Démontré · **Preuve** : §4.3 (« `corriger_piece` réservée au responsable de validation », T5 et T9 par le responsable) ; §4.5 (`arch_nocodb` : INSERT sur `demandes`, `ecarts_acceptes`, `controles_pieces`, UPDATE sur `rapprochements_bancaires`) ; §4.2 (`demande_par`, `accepte_par`, `controle_par`, `valide_par` en texte) ; §5.1 W02.
- **Scénario** : NocoDB se connecte avec un seul rôle de base, donc la base ne sait pas qui agit. L'aide au tri (rôle Editor) peut faire tout ceci :
  - insérer une demande `Annuler` ou `Corriger` avec `demande_par = « Responsable de validation »` ; W02 l'applique ;
  - insérer une ligne `ecarts_acceptes` : l'écart E01, E05 ou E13 sort des contrôles ;
  - insérer un `controles_pieces` « Conforme » : la pièce apparaît « Contrôlée » ;
  - passer un rapprochement à `Rapproche`.

  Les contrôles inverses, qui sont le filet de sécurité de tout le chantier, deviennent effaçables par n'importe quel utilisateur.
- **Correctif** (2 h, proportionné) : brancher `archive_compta` **deux fois** dans NocoDB, avec deux rôles PostgreSQL. La règle s'appuie sur l'appartenance par base de NocoDB (à vérifier à ARC-002), pas sur un nom saisi.
  - « Archive – saisie », rôle `arch_nocodb` : tri, déclarations ; accessible à l'aide au tri et au comptable.
  - « Archive – validation », rôle `arch_nocodb_rv` : `demandes` Annuler, Corriger et Réouvrir, `ecarts_acceptes`, `controles_pieces`, confirmation des imports, statut des rapprochements ; accessible au seul responsable de validation (et au comptable pour ce qui lui revient).
  - Les fonctions et les déclencheurs vérifient `session_user`.
  - Cela règle aussi l'incohérence de la confirmation d'import (SEC-09) et renforce SEC-04 : l'aide au tri ne peut plus poser de décision du tout.
  - Si NocoDB ne permet pas de restreindre une base à certains utilisateurs : W02 vérifie le compte NocoDB réel via le journal d'activité (comme D7). À défaut, le risque est signé par la Direction et un rapport hebdomadaire des actions réservées est relu par celle-ci.

#### NR-04 — Lecture hors du lot : chemins du manifeste et liens symboliques déposés par SFTP
- **Gravité** : Moyenne · **Nature** : À vérifier · **Preuve** : §5.1 W01 étape 3 (« sous-dossiers admis ») ; §8.4 (SFTP chroot).
- **Scénario** : OpenSSH SFTP permet de créer des liens symboliques. Le chroot ne vaut que pour le compte SFTP : n8n, lui, suit le lien hors du chroot. Un lot qui contient un lien vers un fichier du VPS, ou une ligne de manifeste `../../…`, fait lire à W01 un fichier hors du lot. S'il commence par `%PDF-`, il devient une pièce consultable par `/apercu/` ; sinon il est copié en quarantaine.
- **Correctif** (30 min) :
  - `Subsystem sftp internal-sftp -P symlink,hardlink` (refus de créer des liens).
  - W01 refuse tout ce qui n'est pas un fichier ordinaire (`lstat`) et tout chemin de manifeste absolu ou contenant `..`, puis vérifie que le chemin réel reste sous `entree/<id_lot>/`.
  - Test dans ARC-011.

#### NR-05 — Le montage de `/srv/archive` dans n8n inclut `pgdata`, `registre_ids` et `sauvegardes`
- **Gravité** : Moyenne · **Nature** : À vérifier · **Preuve** : §4.6 (`pgdata/` sous `/srv/archive`) ; §5.1 et §8.4 (« accès disque limité à `/srv/archive` »).
- **Scénario** : la restriction d'accès aux fichiers de n8n porte sur toute la racine. Un workflow modifié (ou un n8n compromis) lit ou altère les fichiers de PostgreSQL, le registre des identifiants et les sauvegardes avant chiffrement.
- **Correctif** (15 min) :
  - Ne monter dans le conteneur n8n que `depot/` et `entree/` (lecture et écriture), `quarantaine/`, `objets/` (création seule, NR-02) et `imports/` (lecture seule).
  - Ne jamais y monter `pgdata/`, `registre_ids/`, `sauvegardes/` ni `fichiers/`.
  - Sortir `pgdata/` de l'arborescence partagée (par exemple `/srv/pgdata-archive`).

#### NR-06 — Registre hors base : en clair, « ajout seul » non garanti, et source de `reintegrer_piece`
- **Gravité** : Moyenne · **Nature** : Démontré · **Preuve** : ADR-03 (« Registre hors base », « Recalage ») ; §5.2 H3 ; §4.6.
- **Scénario** :
  - `registre_ids/AAAA.log` appartient à l'utilisateur de H3, qui peut le réécrire : l'« ajout seul » n'est pas imposé.
  - Lors d'un recalage, la procédure réintègre en base toute pièce présente dans le registre et absente de la base. Une ligne ajoutée au registre local avant une restauration crée donc une fausse pièce avec un identifiant officiel.
  - Le fichier contient en clair tiers et montants de toutes les pièces.
- **Correctif** (30 min) :
  - `chattr +a` sur le fichier de l'année (posé par root).
  - Le recalage s'appuie sur les **segments GCS** déchiffrés, protégés par la rétention, et non sur le fichier local. Le fichier local ne sert qu'à la comparaison E05.
  - Une pièce réintégrée exige que son objet existe avec la même empreinte, et elle est listée pour revue du responsable de validation.
  - Droits du fichier : 0640, sans accès pour n8n (NR-05).

#### NR-07 — Rétention GCS : un bucket, deux durées ; vérification sans droit de lecture ; verrou tardif
- **Gravité** : Moyenne · **Nature** : Démontré · **Preuve** : §8.6 (« 400 jours pour les dumps ; fichiers : durée de conservation légale ») ; ARC-014.
- **Scénario** :
  - La règle de rétention d'un bucket est unique. Si elle vaut 400 jours, les fichiers pourront être supprimés après 400 jours. Si elle vaut 10 ans, les dumps le seront aussi, avec un coût qui grossit.
  - La rétention par objet, elle, doit être activée **à la création du bucket**. Le choix doit donc être fait avant ARC-014.
  - Contrôler la présence et la taille d'un objet demande `storage.objects.get`, que le rôle de création seule n'a pas.
  - Tant que la règle n'est pas verrouillée (J12 au plus tôt), l'administrateur du projet peut la retirer puis supprimer.
- **Correctif** (30 min, décision avant la création du bucket) :
  - Soit **deux buckets** : `dumps-registre`, règle de 400 jours verrouillée dès le go puisque D9 la fixe ; `objets`, règle provisoire puis verrouillée après J12.
  - Soit un bucket avec rétention par objet activée à la création.
  - Donner aussi au compte de service la lecture des objets : c'est acceptable, car tout est chiffré par une clé absente du VPS.
  - Garder l'interdiction de suppression et d'écrasement.

#### NR-08 — Chaîne du journal : vérification non organisée, auteur technique mal défini
- **Gravité** : Moyenne · **Nature** : Démontré · **Preuve** : §4.2 `journal_audit` ; §4.4 (journal) ; §8.11 (ancre) ; §5.2 H5 ; ARC-007 test (k).
- **Scénario** :
  - L'ancre est produite chaque nuit, mais aucune tâche ne recalcule la chaîne et ne la compare à l'ancre de la veille. Une réécriture complète du journal (chaîne recalculée de bout en bout) n'est détectée que si quelqu'un compare un jour la valeur au courriel archivé.
  - Le « contenu canonique » n'est pas défini : deux implémentations divergentes rendraient la vérification impossible après une restauration.
  - Si `acteur_db` vient de `current_user`, toutes les écritures faites par fonction porteront `arch_fonctions` : la distinction NocoDB / n8n est perdue.
- **Correctif** (1 h) :
  - H5 recalcule chaque nuit la chaîne depuis l'ancre précédente lue sur GCS ; une rupture alimente E06 et une alerte.
  - Contenu canonique écrit noir sur blanc (champs dans un ordre fixe, `jsonb::text`, horodatage en UTC à la microseconde).
  - `acteur_db = session_user`.
  - Une fois par mois, le responsable de validation compare la valeur du courriel à celle que recalcule H5 (une ligne au journal d'exploitation).

#### NR-09 — Publication du webhook devis et confiance dans l'en-tête d'utilisateur transmis à n8n
- **Gravité** : Moyenne · **Nature** : À vérifier · **Preuve** : §8.2 (« Nginx ne publie que le chemin nommé du webhook des devis » ; « requête transmise au webhook n8n interne avec le nom de l'utilisateur authentifié ») ; §5.1 W08.
- **Scénario** :
  - Les webhooks de l'archive et celui des devis sont servis par la même instance n8n, sur le même port. Si le webhook devis est publié par un préfixe (`location /webhook/`) plutôt que par son chemin exact, le webhook `/piece` devient joignable depuis Internet, sans authentification et avec un en-tête d'utilisateur forgé.
  - Si l'emplacement `internal` existe dans le même site Nginx, la réponse `X-Accel-Redirect` est servie : le PDF sort.
- **Correctif** (15 min) :
  - `location = /webhook/<chemin-devis>` (correspondance exacte), dans le seul site Nginx du site web.
  - `/_objets/` défini seulement dans le site Nginx de l'archive.
  - `proxy_ignore_headers X-Accel-Redirect` sur tous les autres `proxy_pass`.
  - Chemin du webhook de l'archive non devinable, et en-tête secret partagé Nginx → n8n vérifié par le workflow.
  - Test : depuis Internet, `/webhook/<chemin archive>` → 404.

#### NR-10 — `/piece` et `/apercu` : cache, mémorisation de l'authentification, absence de droits par rôle
- **Gravité** : Faible (Moyenne dès l'entrée de la paie) · **Nature** : Démontré · **Preuve** : §8.2, §8.1 (comptes Nginx), §4.1 (`id` sert à `/apercu/<n>`).
- **Scénario** :
  - Aucun en-tête de cache n'est prévu : les PDF restent dans le cache du navigateur des postes du bureau.
  - L'authentification Nginx de base est mémorisée par le navigateur jusqu'à sa fermeture : sur un poste partagé, la personne suivante ouvre les pièces.
  - `/apercu/<n>`, avec un numéro séquentiel, ouvre à tout compte authentifié toute pièce, quel que soit son statut ou son type ; l'aide au tri peut parcourir toute l'archive. La limitation de débit freine sans interdire.
- **Correctif** (30 min) :
  - `Cache-Control: no-store, private` sur `/piece/` et `/apercu/`.
  - Consigne « fermer le navigateur » dans la fiche réflexe et session Windows par personne.
  - `/apercu/` limité aux pièces `A_trier` et `A_valider` (vérifié par n8n, qui a le statut) ; `/piece/` pour les pièces classées.
  - Restriction par type avec ARC-040, avant tout lot de paie.

#### NR-11 — W01 « copie si absent » : un objet déjà présent n'est pas revérifié avant scellement
- **Gravité** : Faible · **Preuve** : §5.1 W01 étape 3 ; §5.2 H1 (« chaque minute »).
- **Scénario** : un fichier faux déposé à l'avance dans `objets/` sous le nom d'une empreinte attendue est gardé et scellé. H5 ne le signale que la nuit suivante.
- **Correctif** : W01 recalcule l'empreinte d'un objet existant avant de l'accepter ; H1 refuse de sceller un objet dont l'empreinte diffère de son nom (NR-02).

#### NR-12 — `arch_admin` : rôle de connexion permanent doté de fonctions puissantes
- **Gravité** : Faible · **Preuve** : §4.4 (`reintegrer_piece`, `recaler_compteurs`, `changer_source_exercice`), §4.5.
- **Correctif** : `arch_admin` en `NOLOGIN` hors recalage, comme `arch_owner` ; chaque ouverture est notée au journal d'exploitation ; `arch_admin` n'est membre d'aucun autre rôle.

#### NR-13 — Table `refus` : boucle de refus et gonflement du journal
- **Gravité** : Faible · **Preuve** : §4.4 « Refus tracés » ; §5.1 W02 (toutes les 2 min, « rejouable »).
- **Scénario** : un élément refusé dont la décision n'est pas effacée est retraité toutes les 2 minutes. Cela fait 720 lignes `refus` et 720 maillons de journal par jour et par élément, ce qui rend le journal illisible et masque les vrais refus.
- **Correctif** : tout refus fait passer l'élément à un état terminal (décision effacée, ou `statut = Refusee` pour `demandes` et `declarations_manquantes`) ; un même refus (fonction, objet, code) n'est consigné qu'une fois par heure.

#### NR-14 — Accès à l'éditeur n8n par tunnel SSH
- **Gravité** : Faible · **Preuve** : §8.2.
- **Correctif** :
  - `AllowTcpForwarding no` par défaut, `yes` seulement dans un bloc `Match User <développeur>` (les comptes SFTP l'ont déjà interdit).
  - Gestion des utilisateurs de n8n active, avec double authentification sur le compte propriétaire (n8n la propose : à vérifier sur la version).
  - Clé SSH du développeur protégée par une phrase de passe.

**Décompte des nouveaux risques** : Élevée 3 (NR-01, NR-02, NR-03) · Moyenne 6 (NR-04 à NR-09) · Faible 5 (NR-10 à NR-14). Aucun critique.

Les points de la v0.2 examinés sans nouveau risque notable :
- **Registre copié chaque minute sur GCS** : chiffré, noms uniques, création seule. Le volume d'opérations est négligeable.
- **Ancre** : envoyée par courriel à la Direction. C'est une bonne preuve indépendante, à condition que la boîte de la Direction conserve les messages.
- **H3 à H6** : sous un utilisateur dédié, sans interpréteur de commandes. C'est correct, une fois H1 isolée en root (NR-02).

### 5.3 Ajouts à la liste de contrôle avant le go (§3.1)

Les cases du §3.1 restent valables. Ajouter :

- [ ] `\df+` : aucune fonction de l'archive n'a `EXECUTE` pour `PUBLIC` ; `arch_nocodb` reçoit un refus de droit sur `recaler_compteurs`, `reintegrer_piece`, `valider_piece` (NR-01).
- [ ] Chaque fonction `SECURITY DEFINER` a `search_path` fixé avec `pg_temp` en dernier et contrôle `session_user` (NR-01).
- [ ] H1 isolée en root : lien symbolique, lien physique et fichier dont l'empreinte diffère du nom, déposés dans `objets/`, sont refusés et la cible reste intacte ; `objets/` appartient à root en mode `1733` (NR-02, NR-11).
- [ ] Deux rôles NocoDB de base (`arch_nocodb`, `arch_nocodb_rv`) ou repli signé : l'aide au tri ne peut créer ni demande d'annulation, ni écart accepté, ni contrôle d'échantillon (essai) (NR-03).
- [ ] SFTP `-P symlink,hardlink` ; lot avec lien symbolique et manifeste `../` → refusés (NR-04).
- [ ] Conteneur n8n : aucun montage de `pgdata`, `registre_ids`, `sauvegardes`, `fichiers` (`docker inspect`) (NR-05).
- [ ] `chattr +a` sur le registre de l'année ; recalage d'ARC-015 fait à partir des segments GCS (NR-06).
- [ ] Choix fait **avant la création du bucket** : deux buckets, ou rétention par objet ; compte de service avec création et lecture, sans suppression ni écrasement (NR-07).
- [ ] H5 vérifie la chaîne du journal contre l'ancre de la veille ; contenu canonique écrit ; `acteur_db = session_user` (NR-08).
- [ ] Depuis Internet, `/webhook/<chemin de l'archive>` → 404 ; webhook devis publié par `location =` (NR-09).
- [ ] `Cache-Control: no-store, private` sur `/piece/` et `/apercu/` ; lecteur PDF du navigateur essayé avec les en-têtes retenus (NR-10, SEC-13).
- [ ] Vérification « aucun nœud extérieur dans les workflows de l'archive » faite dès ARC-019, sans attendre ARC-041 (SEC-18).
- [ ] `.gitignore` complété (`.env.*`, `*-sa.json`, clés) avant la création des secrets de production, avec l'accord de l'utilisateur (SEC-23).

Tâches du backlog à compléter :
- ARC-006 : NR-01, NR-03, NR-12.
- ARC-007 : NR-01, NR-08, NR-13.
- ARC-008 : NR-04, NR-09, NR-10, NR-14.
- ARC-005 : NR-05.
- ARC-043 : NR-02, NR-06, NR-11.
- ARC-014 : NR-07.
- ARC-024 : NR-09, NR-10.
- ARC-052 : à avancer avant le go pour sa partie `.gitignore`.

### 5.4 Niveau de risque résiduel et points bloquants

**Si la v0.2 est construite telle qu'écrite : risque ÉLEVÉ.** La v0.2 corrige bien la surface exposée, les sauvegardes, les entrées non fiables et l'essentiel de l'intégrité. Mais NR-01 (fonctions exécutables par tous) rouvre à lui seul toute la matrice de droits, et NR-02 offre un passage de n8n vers root.

**Après correction des points bloquants ci-dessous (environ 5 h), risque MOYEN**, acceptable pour la mise en service. Le risque restant est celui, connu et signé, d'un administrateur unique observé mais non empêché (D7).

Points encore bloquants pour la mise en service (go du 16 octobre) :
1. **NR-01** : `REVOKE EXECUTE … FROM PUBLIC`, `GRANT` fonction par fonction, `search_path` avec `pg_temp` en dernier, contrôle de `session_user`.
2. **NR-02** : H1 isolée en root et durcie (`O_NOFOLLOW`, fichier ordinaire, empreinte égale au nom) ; `objets/` appartenant à root.
3. **NR-03** : les actions réservées au responsable de validation sont imposées par un second rôle de base, ou le repli est signé par la Direction avant le go.
4. **NR-07** : décision « deux buckets ou rétention par objet » prise **avant** la création du bucket (irréversible ensuite).
5. **NR-05 et NR-04** : montages n8n restreints ; liens SFTP interdits.

Non bloquants mais à faire en S43 : NR-08 (vérification de la chaîne, avant la première ancre à comparer), NR-09, NR-10, SEC-18 (ARC-041), ARC-047 (SEC-04), SEC-23 (si l'accord est donné).
