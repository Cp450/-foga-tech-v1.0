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
