# Archivage comptable — Conception (n8n + NocoDB)

Rédigée par l'architecte de la chaîne de conception. La fiche de cadrage `00-FICHE-CADRAGE.md` fait foi. Conventions : « Hypothèse » = fait non établi ; « À confirmer » = décision humaine ; « À vérifier sur la version installée » = capacité de n8n, de NocoDB ou de Google Cloud Storage (GCS) non vérifiée ; « Par défaut, sous réserve de Dnn » = option retenue en attendant la décision Dnn de la revue senior (`04-REVUE-SENIOR.md` §6, rappelées au §12).

## Historique des versions

| Version | Date | Auteur | Changements |
|---|---|---|---|
| 0.1 | 11 oct. 2026 | Architecte | Première version |
| 0.2 | 11 oct. 2026 | Architecte | Prise en compte de la revue senior (`04-REVUE-SENIOR.md`, 35 constats) et de l'audit de sécurité (`05-AUDIT-SECURITE.md`, 24 constats). Changements principaux : statut réduit au cycle de vie, « saisie » et « contrôlée » calculées ; registre des identifiants hors base et recalage après restauration ; fichiers stockés une fois sous leur empreinte et rendus non modifiables ; ouverture par `/piece/<id>` derrière l'authentification ; rôles PostgreSQL sans propriété ni superutilisateur, toutes les écritures sensibles par fonctions ; journal chaîné dès le go ; sauvegardes chiffrées par clé publique ; inventaire, plan, versions de pièces, déclarations de pièces manquantes ; exposition réseau délimitée ; trois workflows n8n plus l'alerte, le reste en tâches planifiées de l'hôte et en vues SQL ; migration des métadonnées de NocoDB et de n8n reportée après le 31 octobre |
| 0.3 | 11 oct. 2026 | Architecte | Corrections ciblées après vérification de la v0.2 (`04-REVUE-SENIOR.md` §7 : NV-01 à NV-11 ; `05-AUDIT-SECURITE.md` §5 : NR-01 à NR-14), sans changement d'architecture : écriture des objets en dossier temporaire puis renommage, scellement après vérification de l'empreinte par un script root minimal ; rejet possible depuis `A_trier` ; journal chaîné hors transaction par une tâche de nuit et vérifié contre l'ancre ; marge de réserve au recalage, registre complet et protégé, recalage depuis GCS ; droits `EXECUTE` révoqués à `PUBLIC` ; second rôle PostgreSQL pour le responsable de validation ; montages n8n restreints, liens SFTP interdits ; deux buckets GCS ; table de correspondance des personnes ; copie 3 avant le go |

## Traitement des revues

Légende : **Corrigé** (section) ; **Défaut Dnn** = corrigé avec une option par défaut qui attend la décision Dnn ; **Reporté** (raison, voir §11).

| Constat | Traitement | Constat | Traitement |
|---|---|---|---|
| RS-01 compteur après restauration | Corrigé §3 ADR-03, §5.2 H3, §8.7 ; RPO Défaut D9 | SEC-01 W08 public | Corrigé §5.1 W08 supprimé, §8.2 `/piece/<id>` |
| RS-02 charge S42 | Défaut D2 (backlog v0.2) | SEC-02 journal contournable | Corrigé §4.4, §4.5, §8.11 |
| RS-03 go du 16 et J09a | Défaut D2 (backlog v0.2, deux scénarios) | SEC-03 empreinte réécrite | Corrigé §4.4 |
| RS-04 W08 oracle et fuite | Corrigé §8.2 | SEC-04 quatre yeux | Corrigé en partie §4.3, §8.1 ; reste Défaut D7 |
| RS-05 justification d'une écriture | Défaut D5, §4.3, §5.3 | SEC-05 droits NocoDB | Corrigé §4.5 |
| RS-06 auteur, refus, TRUNCATE, développeur | Corrigé §4.4, §4.5, §8.11 ; auteur Défaut D7 | SEC-06 traversée de chemin | Corrigé §8.4 |
| RS-07 statut mélangé | Corrigé §4.3 | SEC-07 commandes système | Corrigé §8.4 |
| RS-08 inventaire absent | Corrigé §4.2, §5.3 E11 | SEC-08 exposition réseau | Corrigé §8.2 |
| RS-09 parcours pièce manquante | Corrigé §4.2, §4.4 | SEC-09 SQL et CSV | Corrigé §5.1 W05, §8.4 |
| RS-10 US-ARC-09 exclue | Défaut D6 §7.1 | SEC-10 sauvegardes | Corrigé §8.6 ; durée de rétention Défaut D9/D14 |
| RS-11 base dédiée non présentée | Défaut D1 §1 Écart 2 ; migration reportée | SEC-11 jetons NocoDB | Corrigé §8.3 (action sur la configuration du site soumise à accord) |
| RS-12 W01 reprise | Corrigé §5.1 W01 | SEC-12 secrets générés | Corrigé §8.3 |
| RS-13 W05 coupé en deux | Corrigé §5.1 W05 | SEC-13 type et taille de fichier | Corrigé §5.1 W01, §8.2 ; taille Défaut D4 |
| RS-14 sauvegarde GCS et copie 3 | Corrigé §8.6 | SEC-14 immuabilité des fichiers | Corrigé §3 ADR-02, §5.2 H1 |
| RS-15 droits trop larges | Corrigé §4.5 | SEC-15 double authentification | Corrigé §8.1 |
| RS-16 option B | Corrigé §4.4, §7.4 ; REC-045 Défaut D2 | SEC-16 injection de formules | Corrigé §8.4 |
| RS-17 rapprochement bancaire | Défaut D8 §4.2 | SEC-17 supervision, RPO/RTO | Corrigé §8.8 ; valeurs Défaut D9 |
| RS-18 quatre yeux contrôle | Défaut D10 §4.3, §7.2 | SEC-18 n8n partagé avec le site | Corrigé §8.2 (ARC-041) |
| RS-19 correction sans version | Défaut D11 §4.2, §4.4 | SEC-19 poste et SFTP | Corrigé §8.4 |
| RS-20 vue de balance | Corrigé §5.3 | SEC-20 données dans les journaux | Corrigé §8.11 ; partie code du site Reporté |
| RS-21 avoirs, sans montant | Défaut D4 §4.1 | SEC-21 garde-fous IA | Corrigé §3 ADR-06 (option toujours désactivée) |
| RS-22 états sans issue | Corrigé §4.3 | SEC-22 données réelles sur postes | Corrigé §8.7, §8.9 |
| RS-23 déclarations en double | Corrigé §4.4 | SEC-23 `.gitignore`, compose de dev | Reporté (autres fichiers) ; tâche ARC-052 |
| RS-24 plan absent | Corrigé §4.2 | SEC-24 accès aux types sensibles | Corrigé §4.2 (`7_Paie` inactif) ; restriction fine Reporté |
| RS-25 modifications concurrentes | Corrigé (parade) §4.1 ; REC-039 Défaut D15 | | |
| RS-26 échantillon | Défaut D15 §5.3 | | |
| RS-27 identifiant de test | Corrigé §4.4, §8.9 | | |
| RS-28 dates incohérentes | Corrigé (backlog v0.2) | | |
| RS-29 nommage incomplet | Corrigé §4.7 ; noms de mois Défaut D12 | | |
| RS-30 borne de date | Corrigé §4.4 | | |
| RS-31 W02 concurrent | Corrigé (plus d'écriture de fichier à la validation, §5.1) | | |
| RS-32 tiers dans les journaux | Corrigé §8.11 | | |
| RS-33 plusieurs écritures par pièce | Corrigé §4.1 | | |
| RS-34 années ouvertes | Défaut D3 §4.2 | | |
| RS-35 W10, W11, W07b | Reporté (§11) ; alerte disque et sonde gardées | | |

**Compléments de la v0.3** (vérification de la v0.2).

| Constat | Traitement v0.3 | Constat | Traitement v0.3 |
|---|---|---|---|
| NV-01 objet tronqué scellé | Corrigé §5.1 W01, §5.2 H1 | NR-01 `EXECUTE` à `PUBLIC` | Corrigé §4.4, §4.5 |
| NV-02 rejet impossible depuis `A_trier` | Corrigé §4.3 T4, §4.4 | NR-02 H1 en root, liens | Corrigé §5.2 H1, §4.6 |
| NV-03 chaînage sérialisant | Corrigé §4.4, §5.2 H6, §8.11 | NR-03 actions réservées déclaratives | Corrigé §4.5 (rôle `arch_nocodb_rv`) ; repli signé Défaut D7 |
| NV-04 recalage incomplet | Corrigé ADR-03, §8.7 | NR-04 liens SFTP, chemins du manifeste | Corrigé §5.1 W01, §8.4 |
| NV-05 refus sans annulation | Corrigé §4.4 | NR-05 montages n8n trop larges | Corrigé §4.6, §8.5 |
| NV-06 redépôt d'un lot | Corrigé §5.1 W01 | NR-06 registre hors base | Corrigé ADR-03, §5.2 H3 |
| NV-07 cas de `Fusionnee` | Corrigé §4.3, §4.4, §5.3 | NR-07 rétention GCS | Corrigé §8.6 (deux buckets) ; Défaut D9, décision avant création du bucket |
| NV-08 « Contrôlée » après correction | Corrigé §4.1, §4.2 | NR-08 chaîne non vérifiée | Corrigé §5.2 H5, §4.2 |
| NV-09 fichiers impossibles à retirer | Corrigé en partie §8.6 ; Défaut D14 | NR-09 webhook devis, en-tête | Corrigé §8.2 |
| NV-10 `FT-TS` accepté en production | Corrigé ADR-03 | NR-10 cache, `/apercu` | Corrigé §8.2 ; restriction par type Reporté (ARC-040) |
| NV-11 copie 3 incomplète | Corrigé §8.6 | NR-11 objet préexistant | Corrigé §5.1 W01, §5.2 H1 |
| RS-18 (partiel) `saisi_par` | Corrigé §4.2 `correspondance_personnes` ; Défaut D10 | NR-12 `arch_admin` permanent | Corrigé §4.5 |
| SEC-23 (non résolu) | Corrigé en partie : `.gitignore` avant le go (ARC-052a, accord requis) ; compose de dev Reporté | NR-13 boucle de refus | Corrigé §4.4 |
| SEC-13 (CSP `sandbox`) | Corrigé §8.2 : à essayer, retiré s'il bloque le lecteur | NR-14 tunnel SSH | Corrigé §8.2 |
| SEC-18 (partiel) | Vérification « aucun nœud extérieur » avancée à ARC-019 | SEC-02, SEC-10 (partiels) | NR-08 et NR-07 |

## 1. Résumé

1. Les données de l'archive (pièces, compteurs, écritures importées, contrôles, journal) vivent dans une base PostgreSQL dédiée, `archive_compta`, sur volume persistant ; NocoDB en est l'écran, n8n l'automate ; toute écriture sensible passe par une fonction SQL.
2. Chaque fichier est stocké une seule fois sous le nom de son empreinte, puis rendu non modifiable ; l'arborescence `Archive/AAAA/N_Type/MM_Mois/` et les noms de la fiche sont des liens vers ces fichiers ; les sauvegardes sont chiffrées et partent sur GCS et sur un disque externe.
3. L'identifiant `FT-PC-AAAA-NNNNN` est attribué par une fonction qui verrouille le compteur de l'année dans la transaction de validation ; un registre des identifiants tenu hors base et un recalage obligatoire après toute restauration empêchent de réémettre un numéro déjà sorti.
4. Le statut stocké ne décrit que le cycle de vie de la pièce ; « saisie dans l'ERP » et « contrôlée » sont calculées ; une écriture n'est justifiée que si elle cite une pièce classée ou une pièce manquante déclarée.
5. Démarrage en option B (écritures importées par CSV, reliées dans NocoDB) ; option A (l'ERP enregistre l'identifiant) visée ensuite sans changer l'archive ; aucune intelligence artificielle.

**Écart 1 avec le programme d'exécution.** Le programme v0.2 (§3.3) plaçait l'index des pièces dans l'ERP ; la décision du 11 octobre le place dans n8n + NocoDB. Le journal, les droits et les quatre yeux de l'ERP ne s'appliquent pas à l'archive ; ils sont reconstruits ici (§4.4, §4.5, §8). Le jalon J08 devient « identifiant de pièce sur les écritures et ouverture de la pièce », sans table de pièces dans l'ERP.

**Écart 2 avec la décision « n8n + NocoDB » — à valider par l'utilisateur (D1).** La conception ajoute une base PostgreSQL dédiée sous NocoDB et place les règles métier (attribution, transitions, quatre yeux, champs obligatoires, journal) en fonctions et déclencheurs PostgreSQL, et non dans NocoDB ou n8n. Conséquences pour l'entreprise : la maintenance demande un développeur capable d'écrire des migrations SQL ; NocoDB devient un écran dont certains messages d'erreur seront ceux de PostgreSQL ; un composant de plus à sauvegarder. Raison : c'est le seul moyen identifié d'obtenir une numérotation sans doublon ni trou et des règles qui tiennent quel que soit l'outil qui écrit (ADR-01, ADR-03). Repli si D1 est refusée ou si NocoDB ne gère pas la source externe : ADR-01 option 2. **Par défaut, sous réserve de D1** : base dédiée ; les métadonnées de NocoDB et de n8n restent dans leur moteur actuel, avec seulement des volumes persistants en S42 ; leur migration vers PostgreSQL est reportée après le 31 octobre.

## 2. Architecture

### 2.1 Composants

| Composant | Rôle | Emplacement | État connu |
|---|---|---|---|
| n8n | Trois workflows (ingestion, décisions humaines, import des écritures) + workflow d'erreur + `/piece` | VPS Hostinger KVM2, conteneur (Hypothèse) | En place ; version, base interne, exposition : à relever (ARC-001) |
| NocoDB | Écrans : files de travail, formulaires, vues de contrôle | VPS | En place ; a perdu ses données en juin 2026 |
| PostgreSQL `archive_compta` | Données, fonctions, déclencheurs, vues de contrôle | VPS, conteneur dédié, non publié, données dans `/srv/archive/pgdata` | À créer |
| Métadonnées NocoDB et n8n | Définitions des vues, workflows, identifiants chiffrés | Moteur actuel, sur volume persistant | Volume à monter (S42) ; migration PostgreSQL reportée |
| Stockage | `/srv/archive/` (§4.6) | Disque du VPS | À créer ; espace libre inconnu (ARC-001) |
| Tâches planifiées de l'hôte | H1 scellement des fichiers, H2 liens d'arborescence, H3 registre des identifiants, H4 sauvegarde, H5 intégrité, H6 alerte disque (§5.2) | VPS (cron ou systemd) | À créer |
| Nginx | HTTPS, authentification, `/piece/<id>`, `/apercu/<n>`, en-têtes | VPS, déjà installé | En place |
| Poste de numérisation | Scanner, dossier `A_ENVOYER/`, script d'envoi | Bureau | Matériel et système à confirmer |
| ERP SFP Suite BTP | Source des écritures (CSV) ; option A plus tard | Poste du développeur, puis VPS (hors S42, Défaut D2) | Code non accessible : contrat §7 |
| Sauvegardes | Copie 2 : bucket GCS sous rétention ; copie 3 : disque externe chiffré | Hors VPS | À créer et acheter (prix non chiffré) |

### 2.2 Flux d'une pièce

1. **Collecte** (humain : aide au tri). Un PDF par pièce dans `A_ENVOYER/LOT-AAAAMMJJ-HHMM-POSTE/` ; papier rangé dans la boîte du lot.
2. **Envoi** (humain lance, script exécute). Empreintes SHA-256 dans `manifest.csv`, copie SFTP reprise après coupure, `_PRET` déposé en dernier.
3. **Ingestion** (système, W01). Vérifications (octets de tête `%PDF-`, taille, empreinte du manifeste) ; fichier écrit dans `objets_tmp/`, empreinte vérifiée, renommé en `objets/<sha256>.pdf` ; pièce créée `A_trier` ; H1 (root) le scelle après avoir recalculé son empreinte. Une pièce illisible peut être rejetée directement depuis `A_trier`.
4. **Tri** (humain). Vue « File à trier » : aperçu par `/apercu/<n>`, saisie date, type, tiers, montant, numéro du document ; passage à `A_valider`.
5. **Validation** (humain, autre compte que le trieur). Décision Valider, Renvoyer ou Rejeter dans la vue « À valider » ; avertissement de doublon probable.
6. **Attribution** (système, W02). Contrôle des quatre yeux, puis fonction `valider_piece` : identifiant attribué, nom et chemin calculés en SQL, statut `Classee`, journal, dans une seule transaction. H3 recopie l'attribution dans le registre hors base ; H2 crée le lien d'arborescence.
7. **Écritures** (humain : comptable). CSV déposé ; W05 l'importe en une transaction ; le comptable relie chaque écriture à sa pièce (option B) ou l'ERP l'a déjà citée (option A).
8. **Contrôles** (vues SQL ; humain corrige). E01 à E13 (§5.3) consultés dans NocoDB et envoyés chaque matin en CSV.
9. **Contrôle d'échantillon** (humain : responsable de validation). Ligne `controles_pieces` ; la pièce apparaît « Contrôlée ».

### 2.3 Schéma

```
 POSTE (bureau)                         VPS HOSTINGER KVM2 (seuls 22 et 443 ouverts)
 +----------------------+  SFTP chroot +------------------------------------------------+
 | A_ENVOYER/LOT-.../   |------------->| depot/  --W01-->  objets/<sha256>.pdf (0444)   |
 | manifest + _PRET     |              |                     ^ H1 scelle                |
 +----------------------+              |   PostgreSQL archive_compta (non publié)       |
 | disque externe       |<-- copie 3 --|   fonctions SECURITY DEFINER, journal chaîné   |
 | chiffré (hebdo)      |   (via GCS)  |     ^ arch_nocodb       ^ arch_n8n             |
 +----------------------+              |   NocoDB (écrans)    n8n (W01 W02 W05 W09)     |
 NAVIGATEUR (comptes nominatifs)       |     ^                   ^ 127.0.0.1           |
   --HTTPS--> Nginx (auth) -------------+-----+-------------------+                    |
   /piece/<id>, /apercu/<n> --> n8n --> X-Accel-Redirect --> /_objets/ (interne)      |
 ERP / Excel --CSV--> SFTP « imports » --> W05                                       |
                                       |  H2 Archive/AAAA/N_Type/MM_Mois/<nom> -> lien |
                                       |  H3 registre_ids/AAAA.log ---+                |
                                       |  H4 dump + fichiers chiffrés -+--> GCS (rétention)
                                       +------------------------------------------------+
```

## 3. Décisions d'architecture (ADR)

### ADR-01 — Base sous-jacente et persistance
**Contexte.** Perte de données de NocoDB en juin 2026 ; besoin d'une attribution transactionnelle et de règles indépendantes de l'outil.

| Option | Avantages | Inconvénients |
|---|---|---|
| 1. SQLite interne de NocoDB sur volume | Rien à installer | Pas de fonction transactionnelle exploitable ; règles portées par NocoDB seul |
| 2. PostgreSQL comme base interne de NocoDB | Une base | Tables gérées par NocoDB ; contraintes ajoutées à la main, fragiles aux mises à jour |
| 3. **Base `archive_compta` créée et versionnée par nous, branchée sur NocoDB comme source externe** | Règles dans la base ; n8n parle SQL ; migrations versionnées | Source externe à vérifier sur la version installée ; écart à présenter (Écart 2) |

**Recommandation : option 3 (Défaut D1).** Conteneur PostgreSQL 16 dédié, non publié, données dans `/srv/archive/pgdata`. En S42, NocoDB et n8n gardent leur moteur de métadonnées ; on monte seulement leurs volumes persistants et on fixe leurs clés (§8.3), puis redémarrage complet du serveur et vérification. **Coût de se tromper** : option 1 = perte de données ou doublons (critères 5 et 6) ; option 3 impossible = une demi-journée avant de basculer en option 2.

### ADR-02 — Emplacement et immuabilité des fichiers
**Contexte.** Disque du VPS, GCS ou Google Drive ; réseau du bureau instable ; un fichier rangé ne doit plus pouvoir changer (SEC-14).

| Option | Avantages | Inconvénients |
|---|---|---|
| 1. **Disque du VPS : stockage par empreinte `objets/<sha256>.pdf`, non modifiable ; arborescence de la fiche faite de liens** | Contenu jamais réécrit ; corrections = changement de lien ; ouverture rapide | Capacité du disque ; copie hors site indispensable |
| 2. GCS principal | Capacité | Chaque opération passe par le réseau ; liens signés ; coût non chiffré |
| 3. Google Drive | Familier | Renommages hors contrôle, droits trop larges, chemins faux |

**Recommandation : option 1, GCS pour la copie hors site.** n8n écrit dans `objets_tmp/`, vérifie l'empreinte et renomme dans `objets/` (répertoire `root`, mode `1733` : n8n peut y créer un nom, pas lister ni supprimer) ; H1, script root minimal, ne scelle (`root:root 0444`, `chattr +i` si possible, à vérifier) qu'un fichier ordinaire dont l'empreinte recalculée égale le nom (§5.2). Seuil d'alerte disque 80 %. **Coût de se tromper** : disque plein = ingestion arrêtée (alerte H6) ; Drive = chemins faux, critère 4 compromis.

### ADR-03 — Attribution sans doublon ni trou, y compris après restauration
**Contexte.** Exécutions concurrentes ; NocoDB n'a pas de compteur transactionnel ; restauration possible d'un dump antérieur à des attributions (RS-01). « Sans trou » = pour chaque année, chaque numéro de 1 au dernier est porté par exactement une ligne `pieces`, jamais supprimée. Année = année de `date_piece` (Défaut D3).

| Option | Verdict |
|---|---|
| Lire le maximum via l'API NocoDB + 1 | Doublon en cas de concurrence. Rejetée |
| Champ « numéro automatique » (séquence) | Une séquence n'est pas sans trou ni annuelle. Rejetée |
| n8n limité à une exécution | Réglage incertain, trou en cas de panne. Rejetée |
| **Fonction PostgreSQL unique : verrou de la pièce et de la ligne du compteur, incrément, écriture de l'identifiant, du nom, du chemin, du statut et du journal dans une transaction ; registre hors base ; recalage obligatoire après restauration** | Retenue |

Logique de `valider_piece(p_piece, p_execution)` (PL/pgSQL, `SECURITY DEFINER`, `SET search_path` fixé) :
```
si parametres.attribution_suspendue : renvoyer le code REFUS_SUSPENDU (refus consigné, §4.4)
verrouiller la pièce (SELECT … FOR UPDATE)
si elle a déjà un id_piece : renvoyer cet identifiant (rejeu)
contrôler : statut A_valider, decision = Valider, champs obligatoires, quatre yeux (§4.3)
  sinon : renvoyer un code de refus et le consigner (pas d'exception)
annee := année de date_piece ; insérer compteurs(annee, 0) s'il manque
UPDATE compteurs SET dernier = dernier + 1 WHERE annee = … RETURNING dernier   -- verrou de ligne
si > 99999 : exception
id := prefixe_identifiant || '-' || annee || '-' || numéro sur 5 chiffres   -- FT-PC, ou FT-TS en test
calculer nom_fichier et chemin (§4.7) ; statut := Classee ; journal ATTRIBUTION
renvoyer id
```
Garde-fous : unicité de `id_piece` ; format `^FT-(PC|TS)-[0-9]{4}-[0-9]{5}$` **et** déclencheur qui exige que le préfixe soit égal à `parametres.prefixe_identifiant` (un `FT-TS` est refusé en production) ; `id_piece` et `compteurs` écrits seulement par les fonctions (§4.5) ; `compteurs.dernier` ne peut passer qu'à `dernier + 1`, sauf par `recaler_compteurs` (hausse seulement) ; pièces jamais supprimées.

**Registre hors base (H3).** Chaque minute, H3 lit les nouvelles attributions et les ajoute à `/srv/archive/registre_ids/AAAA.log` (`annee;numero;id_piece;empreinte;date_piece;type;tiers;montant;sens;sans_montant;nature;trie_par;valide_par;horodatage`), puis envoie le segment chiffré sur GCS (bucket `dumps-registre`, rétention verrouillée, §8.6) sous un nom unique. Le fichier local est en ajout seul imposé (`chattr +a`, posé par root), en mode `0640`, jamais monté dans n8n ; il ne sert qu'à la comparaison E05. Il contient des données de tiers : protégé et sauvegardé comme l'archive.

**Recalage après restauration (procédure §8.7, obligatoire).**
1. `attribution_suspendue = vrai`.
2. Maximum observé par année, à partir des **segments GCS déchiffrés** (source de référence, protégée par la rétention), des liens d'arborescence et du dernier CSV d'écritures ; le registre local ne sert qu'à comparer.
3. Réintégration de chaque pièce présente dans les segments mais absente de la base par `reintegrer_piece(id_piece, empreinte, date_piece, type, tiers, montant, sens, sans_montant, nature, trie_par, valide_par)` : refusée si l'objet `objets/<empreinte>.pdf` n'existe pas avec cette empreinte ; pièce créée avec `reintegree = vrai`, dispensée des seuls champs absents du registre, listée dans la vue « Pièces réintégrées » pour revue du responsable de validation. Recherche du fichier dans cet ordre : GCS, lot conservé sur le poste, nouvelle numérisation depuis la boîte du lot (nouvelle empreinte : rattachement par `rattacher_justificatif`).
4. `recaler_compteurs` porte chaque compteur au maximum observé **plus une marge de 20 numéros** (Défaut D9) ; les numéros de marge sont créés comme pièces `Annulee`, motif « réserve après restauration du … » : ni trou, ni réémission d'un numéro attribué dans la dernière minute avant la perte.
5. Levée de la suspension.

Test obligatoire (ARC-007) : sauvegarde S1, 20 attributions, restauration de S1, recalage, nouvelle attribution → `…-00041` (20 réintégrées, 20 de réserve annulées).

**Coût de se tromper.** Doublon ou trou : critère 6 cassé, fichiers déjà cités à renommer. Complexité L4.

### ADR-04 — Lien avec l'ERP
| Option | Description | Limites |
|---|---|---|
| A. L'ERP enregistre `piece_id` sur chaque écriture | Refus à la saisie sans identifiant ; lien vers la pièce | Code de l'ERP non vu ; ERP pas en ligne |
| B. **Rapprochement par CSV** | Écritures importées ; le comptable relie chaque écriture dans NocoDB | Pas de refus à la saisie dans l'ERP (REC-045 tenu seulement en option A) ; travail du comptable |

**Recommandation : démarrer en option B (Défaut D2)**, même format CSV pour les deux (§7.2) ; option A visée pour le mercredi 21 octobre ; date unique de bascule : si A n'est pas prête le 21, B reste jusqu'au 31. Quand A arrive, `piece_id_cite` l'emporte sur `piece_id_saisi` et toute différence devient l'écart E12. **Coût de se tromper** : A imposée et non livrée = J09b bloqué ; B seule = saisie double.

### ADR-05 — Doublons
Empreinte SHA-256 **bloquante** (un fichier connu ne crée pas de pièce) ; clé métier (type, tiers normalisé, date, montant, numéro du document) en **avertissement** dans la vue « À valider », le valideur décide ; pas d'empreinte d'image ni de lecture de texte (outillage, hors MVP). Coût : un doublon non vu se corrige par annulation ; un blocage à tort refuserait une pièce réelle.

### ADR-06 — Intelligence artificielle
**Aucune IA d'ici le 31 octobre** ; paramètre `ia_extraction_active = faux`, modifiable seulement par migration, **et** variable d'environnement de n8n : deux clés pour activer. Si la Direction l'autorise (J19, D14) : préférer une lecture de texte locale ; pour un service externe, exclure `7_Paie`, `8_Fiscal`, `9_Contrats`, n'envoyer que la première page, contrat de traitement et engagement de non-réutilisation des données, avis juridique sur la protection des données au Congo (à confirmer). L'IA ne remplit que `proposition_ia`, n'attribue rien et ne valide rien ; aucun workflow de l'archive n'utilise les identifiants d'IA du site (ARC-041).

## 4. Modèle de données

Base `archive_compta`. Montants entiers en FCFA. Horodatages `timestamptz`, affichés en Africa/Brazzaville. Capacités d'affichage de NocoDB sur source externe (liens, vues, types) : à vérifier sur la version installée (ARC-002).

### 4.1 Table `pieces` (jamais supprimée)

| Champ | Type PG → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `id` | bigint identité → ID | oui | clé technique ; sert à `/apercu/<n>` | 4812 |
| `id_piece` | text | dès `Classee` ou `Manquante` | unique ; format ADR-03 ; écrit seulement par fonction | FT-PC-2025-00017 |
| `statut` | text → SingleSelect | oui | `A_trier`, `A_valider`, `Classee`, `Manquante`, `Rejetee`, `Annulee`, `Fusionnee` (§4.3) | Classee |
| `date_piece` | date | dès `A_valider` | bornée par déclencheur (§4.4) | 2025-03-14 |
| `date_estimee` | boolean → Checkbox | non | vrai si la date n'est pas lisible et a été reconstituée (Défaut D4) | faux |
| `type_piece` | text → Links `types_piece` | dès `A_valider` | type actif | 1_Factures-fournisseurs |
| `tiers` | text | dès `A_valider` | 2 à 80 caractères ; ne commence pas par `= + - @` ; normalisé non vide | SOCOFER SARL |
| `tiers_recherche` | text (calculé) | — | minuscules sans accents, pour la recherche | socofer sarl |
| `numero_doc_tiers` | text | non | — | F-2025-0331 |
| `montant_fcfa` | bigint → Number | dès `A_valider` sauf si `sans_montant` | entier ≥ 0 ; vide si `sans_montant` | 450000 |
| `sens` | text → SingleSelect | oui | Normal, Avoir (Défaut D4) | Normal |
| `sans_montant` | boolean | oui | vrai = pièce sans montant (distinct de 0) (Défaut D4) | faux |
| `nature_justificatif` | text → SingleSelect | oui | Original, Duplicata, Attestation interne | Original |
| `empreinte_sha256` | char(64) | si fichier | unique hors `Fusionnee` ; non modifiable par personne une fois posée | 9f2c…e1 |
| `taille_octets` | bigint | si fichier | > 0 ; non modifiable une fois posée | 284113 |
| `lot_id` | bigint → Links `lots_depot` | si déposée | — | — |
| `chemin`, `nom_fichier` | text | dès `Classee` (sauf manquante sans justificatif) | calculés par fonction (§4.7) | Archive/2025/1_Factures-fournisseurs/03_Mars/ |
| `trie_par`, `date_tri` | text, timestamptz | dès `A_valider` | compte NocoDB réel si disponible, sinon nom déclaré (Défaut D7) | Aide au tri 1 |
| `pris_par` | text | non | personne qui a la pièce en cours de tri (parade RS-25) | Aide au tri 1 |
| `decision`, `motif_decision` | text | non | vide, Valider, Renvoyer, Rejeter ; motif obligatoire sauf Valider | Valider |
| `valide_par`, `date_validation` | text, timestamptz | dès `Classee` | ≠ `trie_par` (§4.3) | Comptable |
| `remplace_par` | text | non | identifiant de la pièce qui la remplace (changement d'année) | — |
| `fusionnee_dans` | bigint → Links `pieces` | si `Fusionnee` | pièce manquante qui a reçu ce fichier | — |
| `date_fin_conservation` | date | non | vide tant que la durée n'est pas confirmée (D14) | — |
| `proposition_ia` | jsonb | non | vide tant que l'IA est désactivée | — |
| `reintegree` | boolean | oui | vrai si créée par `reintegrer_piece` après restauration | faux |
| `version` | integer | oui | +1 à chaque mise à jour | 4 |
| `cree_le`, `modifie_le` | timestamptz | oui | posés par la base | — |

La vue `v_pieces` ajoute, sans les stocker : `saisie` (au moins une écriture présente au dernier import la cite), `refs_ecritures` (toutes les écritures qui la citent : une pièce peut être citée par plusieurs lignes, par exemple facture et règlement ; une ligne cite une seule pièce), `controlee` (dernier contrôle de `controles_pieces` positif **et** portant sur la version courante de la pièce : une correction fait retomber la pièce à « non contrôlée »), `libelle_fiche` (« À trier », « Classée », « Saisie dans l'ERP », « Contrôlée », « Manquante », etc.), `lien` (`/piece/<id_piece>`).

### 4.2 Autres tables

| Table | Rôle | Champs principaux (contraintes) |
|---|---|---|
| `lots_depot` | Un envoi du poste | `code_lot` unique, format `^LOT-[0-9]{8}-[0-9]{4}-[A-Z0-9]{1,8}$` ; `empreinte_manifeste` ; `nb_annonces`, `nb_nouveaux`, `nb_doublons`, `nb_rejetes` ; `statut` (Recu, En_ingestion, Ingere, Ingere_avec_ecarts, Erreur) ; `tentatives` ; `modifie_le` |
| `fichiers_deposes` | Un fichier d'un lot (insertion seule) | `lot_id` ; `nom_origine` (texte affiché, jamais utilisé dans un chemin) ; `empreinte_sha256` ; `taille` ; `resultat` (Nouveau, Doublon_exact, Rejete_format, Rejete_taille, Rejete_transfert) ; `piece_id` ; unique (lot, nom) |
| `compteurs` | Un compteur par année | `annee` (clé, 2000–2100) ; `dernier` (0–99999, écrit par fonction seulement) |
| `types_piece` | Référentiel | `code` (`^[0-9]{1,2}_[A-Za-z-]{1,40}$`) ; `libelle` ; `code_nom_fichier` (`^[a-z0-9-]{1,30}$`) ; `prioritaire` ; `actif`. `7_Paie` reste **inactif** tant que la restriction d'accès par type n'existe pas (SEC-24, ARC-040) |
| `parametres` | Réglages (modifiés par migration seulement) | `annees_ouvertes` (Défaut D3 : exercices 2024–2026, dates de pièce admises dès 2023-01-01 pour les pièces qui justifient les soldes d'ouverture 2024), `debut_exercice` (01-01, Défaut D3), `noms_mois` (`^[0-9]{2}_[A-Za-z]{3,10}$`, sans accents, Défaut D12), `prefixe_identifiant` (FT-PC ; FT-TS en test), `attribution_suspendue`, `ia_extraction_active`, `taille_max_fichier_mo` (20, Défaut D4), `delai_e04_jours` (7 ; 0 pour J14), `seuil_import_confirmation` (50 pièces) |
| `inventaire` | Inventaire J02 (RS-08) | `exercice`, `type_piece`, `nb_attendu` (≥ 0), `source`, `saisi_par`, `date` ; unique (exercice, type) |
| `plan_avancement` | Plan recalculé à J06c (RS-24) | `semaine`, `exercice`, `type_piece`, `nb_prevu` |
| `declarations_manquantes` | Cible du formulaire « Déclarer une pièce manquante » (RS-09) | `exercice`, `type_piece`, `tiers`, `date_estimee`, `montant_estime`, `description`, `motif` (Perdue, Jamais reçue, Détériorée, Autre), `traitement` (Duplicata demandé, Attestation interne), `declare_par`, `confirme_doublon` (booléen), `statut` (A_traiter, Traitee, Refusee), `piece_id` (posé par la fonction), `code_refus` |
| `pieces_manquantes` | Suivi du traitement | `piece_id` unique ; `declaration_id` ; `date_demande`, `date_relance` ; `attestation_signee_par` (Direction), `date_signature` ; `statut_traitement` (Ouvert, Duplicata reçu, Attestation signée, Clos) |
| `demandes` | Décisions humaines hors tri (une ligne par demande) | `type` (Rattacher_justificatif, Corriger, Annuler, Reouvrir_rejet), `piece_id`, `piece_deposee_id` (rattachement), `champ`, `nouvelle_valeur`, `motif` (obligatoire), `demande_par`, `insere_par_role` (= `session_user`, posé par la base), `approuvee` (modifiable seulement par `arch_nocodb_rv`), `statut` (A_traiter, Appliquee, Refusee), `code_refus`. Les types `Annuler` et `Reouvrir_rejet` ne peuvent être insérés que par `arch_nocodb_rv` ; une demande `Corriger` du comptable n'est appliquée qu'une fois `approuvee` (Défaut D11) |
| `pieces_versions` | Version d'une pièce avant correction (RS-19, insertion seule) | `piece_id`, `version`, `donnees` (jsonb), `ancien_chemin`, `ancien_nom`, `motif`, `auteur`, `horodatage` |
| `controles_pieces` | Contrôle d'échantillon (insertion seule, rôle `arch_nocodb_rv`) | `piece_id`, `version_controlee`, `controle_par`, `date`, `resultat` (Conforme, Non_conforme, Reouvert), `commentaire` ; `controle_par` ≠ `trie_par` et ≠ la personne qui a saisi les écritures, comparée par `correspondance_personnes` (Défaut D10) |
| `correspondance_personnes` | Relie les identifiants de saisie de l'ERP ou d'Excel aux personnes (RS-18) | `identifiant_saisie` (unique, ex. `cpt1`), `personne` (nom de la liste nominative), `compte_nocodb` ; un `saisi_par` inconnu de cette table rend l'import `Rejete` |
| `ecritures` | Lignes importées | `source` (ERP, EXCEL) ; `exercice` ; `journal` ; `numero_ecriture` ; `ligne` ; `date_ecriture` ; `compte` (`^[0-9]{2,12}$`) ; `libelle` (≤ 200 caractères) ; `debit_fcfa`, `credit_fcfa` (entiers ≥ 0, un seul non nul) ; `saisi_par` ; `piece_id_cite` (option A) ; `piece_id_saisi` (option B, seulement une pièce `Classee` ou `Manquante`) ; `motif_piece_manquante` (informatif seulement) ; `import_id` ; `presente_dernier_import`. Clé naturelle unique (source, exercice, journal, numéro, ligne) |
| `ecritures_import_brut` | Zone de chargement d'un CSV avant application | mêmes colonnes en texte + `import_id` |
| `imports_ecritures` | Un fichier CSV | `nom_fichier`, `empreinte_sha256`, `depose_par` (compte SFTP « imports »), `source`, `exercice`, `nb_lignes`, `nb_inserees`, `nb_mises_a_jour`, `nb_disparues`, `statut` (Recu, A_confirmer, Importe, Rejete), `motif_rejet`. Empreinte unique parmi les imports `Importe` seulement |
| `sources_exercice` | Une seule source d'écritures par exercice (RS-13) | `exercice` clé, `source` ; changement par fonction d'administration |
| `comptes_bancaires` | Comptes de banque (Défaut D8) | `compte_comptable`, `banque`, `libelle` |
| `rapprochements_bancaires` | Critère 7 (Défaut D8) | `compte_bancaire`, `exercice`, `mois`, `solde_releve_fcfa` (saisi), `piece_releve` (lien vers une pièce `5_Banque`), `piece_etat_rapprochement` (état détaillé du comptable, lien), `statut` (Brouillon, Releve_manquant, Rapproche, Ecart_explique) ; `Rapproche` refusé si `piece_releve` est vide ou si l'écart n'est pas nul ; `etabli_par` ≠ `valide_par`. Le solde comptable et l'écart sont calculés dans `v_rapprochements` à partir des écritures |
| `ecarts_acceptes` | Écarts acceptés et documentés (J15) | `code_ecart`, `objet`, `commentaire` obligatoire, `accepte_par` (responsable de validation), `date` |
| `refus` | Refus métier consignés par les fonctions (insertion seule) | `fonction`, `objet`, `code_refus`, `acteur`, `horodatage` |
| `resultats_integrite` | Résultats de H5 | `objet`, `code` (FICHIER_ABSENT, EMPREINTE_DIFFERENTE, FICHIER_SANS_PIECE, LIEN_ABSENT, REGISTRE_DIFFERENT), `detail`, `horodatage` |
| `journal_audit` | Journal en ajout seul, chaîné hors transaction (§4.4) | `id` (identité croissante ; les trous de séquence laissés par une transaction annulée sont normaux et consignés comme tels), `horodatage`, `acteur_db` = `session_user` (donc `arch_nocodb`, `arch_nocodb_rv`, `arch_n8n`… et non le propriétaire de la fonction), `acteur_humain`, `table_nom`, `enregistrement_id`, `action`, `avant`, `apres`, `execution_n8n`, `empreinte_precedente`, `empreinte` (vides à l'écriture, posées une seule fois par `chainer_journal`). Contenu canonique : `id`, `horodatage` en UTC à la microseconde, `acteur_db`, `table_nom`, `enregistrement_id`, `action`, `avant::text`, `apres::text`, dans cet ordre, séparés par un caractère de contrôle fixe ; `empreinte` = SHA-256(`empreinte_precedente` + contenu canonique) |
| `ancres_journal` | Ancres de la chaîne (insertion seule) | `id_max`, `empreinte`, `nb_lignes`, `horodatage`, `objet_gcs` |
| `erreurs_workflow` | File d'erreurs (US-SYS-08) | `horodatage`, `workflow`, `execution_id`, `noeud`, `code` (jamais de chemin, de tiers ni de montant), `objet_ref` (identifiant technique), `tentatives`, `statut` |

### 4.3 Cycle de vie de la pièce

Statut stocké = cycle de vie uniquement. « Saisie dans l'ERP » et « Contrôlée » sont calculées (§4.1) : une pièce contrôlée dont l'écriture disparaît reste visible dans E03 ; une pièce manquante citée reste `Manquante`.

```
 [dépôt] -W01-> A_trier --T2--> A_valider --T6 (W02 : valider_piece)--> Classee --T9--> Annulee
                  ^  |  ^           |                                     |   ^
          T5 (RV) |  |  +--T3-------+  (Renvoyer)                         |   | T8 rattacher_justificatif
                  |  v                                                    |   |
                 Rejetee <---T4 (Rejeter, depuis A_trier ou A_valider)    |  Manquante <--T7-- [déclaration]
                                                                          |      |
 A_valider (pièce déposée comme justificatif) --T8--> Fusionnee           |      +--T9--> Annulee
```

| N° | Transition | Qui | Par | Condition |
|---|---|---|---|---|
| T1 | création → `A_trier` | Système | W01, fonction `enregistrer_fichier` | Fichier PDF valide, empreinte nouvelle |
| T2 | `A_trier` → `A_valider` | Aide au tri, comptable | NocoDB (déclencheur) | Date, type, tiers, montant (ou `sans_montant`), `trie_par` |
| T3 | `A_valider` → `A_trier` | Comptable, RV | W02 | Décision Renvoyer + motif |
| T4 | `A_trier`/`A_valider` → `Rejetee` | Comptable, RV | W02 | Décision Rejeter + motif ; pas d'identifiant. À `A_trier`, `Rejeter` est la **seule** décision admise et ne demande ni date, ni tiers, ni montant (pièce illisible, PDF de plusieurs pièces, document non comptable) ; quatre yeux comme pour la validation |
| T5 | `Rejetee` → `A_trier` | RV (rôle `arch_nocodb_rv`) | W02 (`demandes` Reouvrir_rejet) | Motif |
| T6 | `A_valider` → `Classee` | Comptable, RV (≠ trieur) | W02, `valider_piece` | ADR-03 ; quatre yeux |
| T7 | déclaration → `Manquante` | Comptable | W02, `declarer_piece_manquante` | §4.4 |
| T8 | `Manquante` → `Classee` et pièce déposée `A_valider` → `Fusionnee` | Comptable (≠ trieur du justificatif) | W02, `rattacher_justificatif` | Justificatif trié ; la date, le tiers et le montant lus sur le justificatif remplacent les valeurs estimées, l'état précédent va dans `pieces_versions`. Autre année : nouvelle pièce `remplace_par`, l'écriture qui citait la pièce manquante est d'abord reliée à la nouvelle (option B : `piece_id_saisi` ; option A : correction dans l'ERP), puis l'ancienne est annulée (T9) (Défaut D11) |
| T9 | `Classee`/`Manquante` → `Annulee` | RV (rôle `arch_nocodb_rv`) | W02 (`demandes` Annuler) | Motif ; aucune écriture ne la cite ; numéro jamais réutilisé |

Corrections d'une pièce classée (date dans la même année, type, tiers, montant) : demande `Corriger` par le comptable, appliquée par la fonction `corriger_piece` réservée au responsable de validation (Défaut D11) : copie dans `pieces_versions`, recalcul du nom et du chemin, l'ancien lien est déplacé par H2 dans `fichiers/_versions/<id_piece>/` ; l'objet et l'empreinte ne changent jamais.

**Quatre yeux (SEC-04, RS-06, NR-03, Défaut D7).** Deux protections s'ajoutent.
1. **Actions réservées au responsable de validation, imposées par la base (NR-03).** `archive_compta` est branchée **deux fois** dans NocoDB : « Archive – saisie » avec le rôle `arch_nocodb` (aide au tri, comptable) et « Archive – validation » avec le rôle `arch_nocodb_rv` (responsable de validation seul). Seul `arch_nocodb_rv` peut : insérer des demandes `Annuler` et `Reouvrir_rejet`, approuver une correction, insérer dans `ecarts_acceptes` et `controles_pieces`, confirmer un import `A_confirmer`, passer un rapprochement à `Rapproche`. Les déclencheurs et les fonctions vérifient `session_user`. La restriction d'une base NocoDB à certains utilisateurs est à vérifier (ARC-002) ; à défaut, W02 vérifie le compte NocoDB réel dans le journal d'activité de NocoDB, et à défaut encore la Direction signe le risque et relit chaque semaine le rapport des actions réservées (`journal_audit` filtré) (Défaut D7).
2. **Trieur ≠ valideur.** W02 n'utilise pas les noms saisis s'il peut lire le compte NocoDB réel (champs « créé par / modifié par » ou journal d'activité : à vérifier, ARC-002) ; égalité → décision effacée, refus consigné. Sinon `trie_par` et `valide_par` restent déclaratifs, la vue de l'aide au tri ne montre pas les champs de décision, E13 signale les pièces validées moins d'une heure après leur tri, l'échantillon les surpondère, et la Direction signe le risque résiduel (D7). Option si D7 le demande : un troisième rôle `arch_nocodb_tri` réservé à l'aide au tri, sans colonnes de décision.

### 4.4 Fonctions et règles d'intégrité

Toutes les fonctions sont `SECURITY DEFINER`, propriété du rôle `arch_fonctions` (sans connexion), avec `SET search_path = archive, pg_temp` (`pg_temp` en dernier), des noms qualifiés dans le corps et aucun SQL dynamique construit avec des valeurs. Avant toute création : `ALTER DEFAULT PRIVILEGES FOR ROLE arch_fonctions REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC` ; après : `REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA archive FROM PUBLIC`, puis `GRANT EXECUTE` fonction par fonction selon la colonne « Rôle autorisé ». Chaque fonction commence par contrôler `session_user` contre ce même rôle (défense en profondeur).

| Fonction | Rôle autorisé (`session_user`) | Effet en une transaction |
|---|---|---|
| `enregistrer_lot`, `enregistrer_fichier` | `arch_n8n` | Lot et fichier ; pièce `A_trier` si empreinte nouvelle ; `Doublon_exact` seulement si l'empreinte appartient à une pièce non `Fusionnee` d'un **autre** lot ; fichier déjà traité dans ce lot = sauté |
| `valider_piece`, `renvoyer_piece`, `rejeter_piece` | `arch_n8n` | ADR-03 ; T3, T4 |
| `declarer_piece_manquante(declaration_id)` | `arch_n8n` | Refus si une déclaration ou pièce de même clé métier existe et que `confirme_doublon` est faux (RS-23) ; sinon crée la pièce `Manquante` avec identifiant (année de la date estimée), `pieces_manquantes`, relie la déclaration ; rejeu = même identifiant |
| `rattacher_justificatif(demande_id)` | `arch_n8n` | Pièce déposée → `Fusionnee` ; pièce manquante reçoit empreinte, taille, nature, date, tiers, montant (version précédente dans `pieces_versions`), nom, chemin → `Classee` ; une empreinte vide reçoit une valeur une seule fois |
| `corriger_piece`, `annuler_piece`, `reouvrir_rejet` | `arch_n8n`, et seulement pour une demande insérée ou approuvée par `arch_nocodb_rv` | Version, T9, T5 |
| `appliquer_import(import_id)` | `arch_n8n` (confirmation par `arch_nocodb_rv` si `A_confirmer`) | §5.1 W05, tout ou rien |
| `chainer_journal()` | `arch_chaine` (H6) | Chaîne les lignes non chaînées par ordre d'`id`, pose `empreinte_precedente` et `empreinte` une seule fois, écrit une ligne `ancres_journal` |
| `consigner_integrite` | `arch_lecture` (H5) | Résultats d'intégrité |
| `reintegrer_piece`, `recaler_compteurs`, `changer_source_exercice` | `arch_admin` | Recalage (ADR-03, §8.7) ; journalisés |

Déclencheurs (sur toutes les tables protégées) :
- refus de `DELETE` (ligne) et de `TRUNCATE` (`BEFORE TRUNCATE … FOR EACH STATEMENT`) ;
- `empreinte_sha256`, `taille_octets` : non modifiables par **personne** une fois posées ; `id_piece`, `chemin`, `nom_fichier`, `statut` (sauf T2), `compteurs` : écrits seulement par les fonctions (contrôle de `current_user` = `arch_fonctions`) ; `journal_audit` : insertion par les déclencheurs seulement, `empreinte` posée une seule fois par `chainer_journal` ;
- colonnes de tri modifiables par `arch_nocodb` seulement aux statuts `A_trier` et `A_valider` ; colonne de décision : `Rejeter` seul admis à `A_trier` (sans les champs de tri), toutes les décisions à `A_valider` ; après `Classee`, toute correction passe par `demandes` ;
- champs obligatoires par statut (sauf ceux absents du registre pour une pièce `reintegree`) ; borne de `date_piece` contre `parametres` (code `DATE_HORS_PERIODE`) ; un changement de `annees_ouvertes` ne revalide pas l'existant mais alimente une vue d'écarts ;
- préfixe de `id_piece` égal à `parametres.prefixe_identifiant` ;
- `piece_id_saisi` refusé si la pièce n'est pas `Classee` ou `Manquante` ;
- journal : chaque insertion, mise à jour et appel de fonction écrit une ligne **non chaînée** (aucun verrou global : pas de sérialisation ni d'interblocage avec l'import, NV-03). Le chaînage est fait hors transaction par H6 chaque nuit et après chaque sauvegarde de deux heures ; la vérification est faite par H5 (§5.2).

**Refus tracés (NV-05, NR-13).** Une exception PostgreSQL annule toute la transaction, journal compris. Donc :
1. Chaque fonction fait **tous ses contrôles avant toute écriture** ; un refus métier écrit alors une ligne `refus` et renvoie un code, sans rien d'autre à annuler. Si un contrôle ne peut se faire qu'en cours de traitement (`appliquer_import`, `rattacher_justificatif`), le travail est fait dans un bloc `BEGIN … EXCEPTION` (point de sauvegarde) : en cas de refus, le bloc est annulé, puis la ligne `refus` est écrite ; `appliquer_import` reste « tout ou rien ».
2. Tout refus met l'élément dans un état terminal (décision effacée ; `statut = Refusee` pour `demandes` et `declarations_manquantes`) : W02 ne le retraite pas en boucle. Un même refus (fonction, objet, code) n'est consigné qu'une fois par heure.
3. Les refus des déclencheurs (écritures directes depuis NocoDB) sont tracés par le journal du serveur PostgreSQL (§8.11).

**Préfixe de test (RS-27, NV-10).** La base de test a `prefixe_identifiant = FT-TS`, la production `FT-PC` ; le déclencheur refuse l'autre préfixe. Les PDF d'essai portent le filigrane « SPÉCIMEN ». Les 50 pièces de l'essai J06 sont réelles et vont en production (FT-PC).

**`Fusionnee` (NV-07).** Une même empreinte peut appartenir à une pièce `Fusionnee` et à la pièce manquante devenue `Classee` : la recherche de doublons, H5 et `v_inventaire_vs_archive` excluent `Fusionnee` (la pièce comptée est la pièce manquante devenue classée, avec sa nature de justificatif).

### 4.5 Rôles PostgreSQL et matrice des droits

Aucun outil ne se connecte en superutilisateur ni en propriétaire. `postgres` (superutilisateur) : mot de passe au coffre, utilisé seulement pour créer les rôles. `arch_owner` (propriétaire des tables) et `arch_admin` (fonctions de recalage, NR-12) : `NOLOGIN` hors migration ou recalage, chaque ouverture notée au journal d'exploitation ; `arch_admin` n'est membre d'aucun autre rôle. `arch_fonctions` : `NOLOGIN`, propriétaire des fonctions. `arch_chaine` : connexion de H6, seulement `EXECUTE` sur `chainer_journal`. Révoqués partout pour les rôles de connexion : `TRUNCATE`, `REFERENCES`, `TRIGGER`, `DELETE`, et `EXECUTE` à `PUBLIC`.

| Table | `arch_nocodb` (saisie) | `arch_nocodb_rv` (validation) | `arch_n8n` | `arch_lecture` (H2–H5) |
|---|---|---|---|---|
| `pieces` | SELECT ; UPDATE des colonnes de tri (`date_piece`, `date_estimee`, `type_piece`, `tiers`, `numero_doc_tiers`, `montant_fcfa`, `sens`, `sans_montant`, `trie_par`, `pris_par`, `statut` pour T2) et de décision (`decision`, `motif_decision`, `valide_par`) | SELECT ; UPDATE des colonnes de décision | SELECT | SELECT |
| `compteurs`, `journal_audit`, `ancres_journal`, `refus`, `pieces_versions`, `fichiers_deposes`, `lots_depot` | SELECT | SELECT | SELECT | SELECT |
| `parametres`, `types_piece`, `sources_exercice`, `comptes_bancaires`, `correspondance_personnes` | SELECT | SELECT | SELECT | SELECT (modification par migration) |
| `declarations_manquantes` | SELECT, INSERT | SELECT, INSERT | SELECT | SELECT |
| `demandes` | SELECT, INSERT (types `Corriger`, `Rattacher_justificatif`) | SELECT, INSERT (tous types), UPDATE (`approuvee`) | SELECT | SELECT |
| `inventaire`, `plan_avancement` | SELECT, INSERT, UPDATE | SELECT, INSERT, UPDATE | SELECT | SELECT |
| `rapprochements_bancaires` | SELECT, INSERT, UPDATE (sauf passage à `Rapproche`) | SELECT, UPDATE (statut) | SELECT | SELECT |
| `ecarts_acceptes`, `controles_pieces` | SELECT | SELECT, INSERT | SELECT | SELECT |
| `ecritures` | SELECT ; UPDATE (`piece_id_saisi`) | SELECT ; UPDATE (`piece_id_saisi`) | SELECT | SELECT |
| `ecritures_import_brut`, `imports_ecritures` | SELECT | SELECT ; UPDATE (`statut` de `A_confirmer` à confirmé) | SELECT, INSERT (zone brute, ligne `Recu`) | SELECT |
| `erreurs_workflow` | SELECT | SELECT | SELECT, INSERT | SELECT |
| `resultats_integrite` | SELECT | SELECT | SELECT | SELECT (écriture par `consigner_integrite`) |
| Fonctions | aucune | aucune | EXECUTE sur les fonctions de W01, W02, W05 | EXECUTE (`consigner_integrite`) |

Les restrictions de NocoDB par rôle (§6) viennent en plus ; la base reste la protection de dernier ressort.

### 4.6 Arborescence sur disque

```
/srv/archive/                                        propriétaire, droits ; monté dans n8n ?
  depot/                 zone SFTP du poste (chroot)   compte poste ; n8n lecture-écriture
  entree/<id_lot>/        lots en cours d'ingestion     n8n ; lecture-écriture
  objets_tmp/             écriture en cours (W01)       n8n ; lecture-écriture
  objets/<sha256>.pdf     fichiers scellés              root, répertoire 1733, fichiers 0444 ; n8n création seule
  quarantaine/<id_lot>/<sha256>.bin                     n8n ; lecture-écriture
  imports/               zone SFTP « imports »          compte imports ; n8n lecture seule
  fichiers/Archive/AAAA/N_Type/MM_Mois/<nom>.pdf        liens créés par H2 ; non monté dans n8n
  fichiers/_versions/<id_piece>/<ancien nom>.pdf        H2 ; non monté
  registre_ids/AAAA.log  registre hors base             H3, 0640, chattr +a ; non monté
  sauvegardes/           fichiers chiffrés avant envoi  H4 ; non monté
/srv/pgdata-archive/     PostgreSQL, hors de l'arborescence partagée ; non monté
```
Le conteneur n8n ne monte que `depot/`, `entree/`, `objets_tmp/`, `objets/`, `quarantaine/` et `imports/` (lecture seule) (NR-05) ; jamais `pgdata`, `registre_ids/`, `sauvegardes/` ni `fichiers/`. `objets_tmp/` et `objets/` sont sur le même système de fichiers (renommage atomique).
La racine `/srv/archive` est une variable d'environnement de n8n et des tâches de l'hôte, pas un paramètre modifiable dans NocoDB.

### 4.7 Règle de nommage (calculée en SQL)

`AAAA-MM-JJ_FT-PC-AAAA-NNNNN_type_tiers_montant.pdf` : `AAAA-MM-JJ` = `date_piece` ; `type` = `code_nom_fichier` ; `tiers` = translittération (é → e, œ → oe, æ → ae, ß → ss), minuscules, tout caractère hors `[a-z0-9]` remplacé par un tiret, tirets successifs fusionnés, tirets de début et de fin retirés, tronqué à 40 caractères puis tiret final retiré ; vide → refus à T2 ; `montant` = chiffres seuls, `sans-montant` si `sans_montant`, préfixe `avoir-` si `sens` = Avoir (Défaut D4). Chemin `Archive/AAAA/<types_piece.code>/<nom du mois>/`. Seul ce calcul produit des chemins ; aucun nom fourni par un humain ou par le poste n'entre dans un chemin (§8.4). Une pièce = un PDF ; un PDF de plusieurs pièces est rejeté (T4).

## 5. Workflows, tâches planifiées et contrôles

### 5.1 Workflows n8n (trois, plus l'alerte)

Règles communes : toutes les requêtes appellent une fonction ou utilisent des paramètres liés (`$1`, `$2`) ; aucune expression `{{ }}` dans le texte SQL (vérifié dans les exports JSON) ; nœud Execute Command désactivé ; accès disque limité à `/srv/archive` ; aucun appel vers un service extérieur autre que SMTP ; workflow d'erreur = W09 ; arrêt de la reprise automatique après 5 échecs sur le même objet.

**W01 — Ingestion d'un lot** (planifié toutes les 5 min ; humain avant : numérisation ; après : tri).
1. Lister `depot/` : un nom de lot qui ne respecte pas le format → lot `Erreur`, rien n'est lu. Un code de lot déjà `Ingere` ou `Ingere_avec_ecarts` → **refus « lot déjà ingéré »** : W01 calcule les empreintes sans rien créer et signale le nombre de fichiers déjà connus comme doublons (NV-06, REC-114). Un code existant avec un manifeste différent → refus. La reprise ne vaut que pour un lot `En_ingestion` ou `Erreur`.
2. Déplacer le lot prêt vers `entree/<id_lot>/` (le poste ne peut plus le modifier). Tout ce qui n'est pas un fichier ordinaire (`lstat` : lien symbolique, lien physique, périphérique) est refusé ; une ligne de manifeste absolue ou contenant `..` est refusée ; le chemin réel de chaque fichier doit rester sous `entree/<id_lot>/` (NR-04).
3. Pour chaque ligne du manifeste (sous-dossiers admis) : fichier déjà enregistré dans ce lot → sauté ; octets de tête différents de `%PDF-` → `Rejete_format` ; taille > maximum → `Rejete_taille` ; empreinte ≠ manifeste → `Rejete_transfert`. Sinon (NV-01, NR-11) :
   - si `objets/<sha256>.pdf` existe déjà : W01 recalcule son empreinte ; égale → réutilisé ; différente → alerte W09, le lot passe `Erreur` (seul root peut retirer un objet scellé ; H1 ne scelle jamais un tel fichier) ;
   - sinon : écriture dans `objets_tmp/<sha256>.<exécution>`, relecture et comparaison de l'empreinte, puis **renommage** vers `objets/<sha256>.pdf` (atomique ; dans un répertoire au bit collant, un objet scellé ne peut pas être remplacé) ; une coupure laisse au pire un fichier dans `objets_tmp/`, purgé après 24 h ;
   - puis appel `enregistrer_fichier`. Les refusés vont en `quarantaine/<id_lot>/<sha256>.bin`.
4. Compteurs du lot, statut `Ingere` ou `Ingere_avec_ecarts`.
- **Reprise** : les lots `En_ingestion` non modifiés depuis 15 min et les lots `Erreur` sont repris ; le rejeu ne crée ni pièce ni doublon de plus.

**W02 — Décisions humaines** (planifié toutes les 2 min ; l'humain décide dans NocoDB).
Traite, dans l'ordre : pièces `A_valider` avec décision et pièces `A_trier` avec la décision `Rejeter` ; déclarations `A_traiter` ; demandes `A_traiter`. Pour chaque élément : contrôle des quatre yeux (§4.3), appel de la fonction correspondante, lecture du code de retour ; refus → message dans la ligne (`code_refus`) visible par l'auteur. Aucune écriture de fichier : la validation ne touche que la base ; H2 crée les liens. Rejouable : chaque fonction renvoie le même résultat pour un élément déjà traité.

**W05 — Import des écritures** (planifié toutes les 15 min sur `imports/`).
1. Fichier déjà importé (empreinte d'un import `Importe`) → ignoré.
2. Validation stricte par colonne : en-tête exact, UTF-8, `journal` `^[A-Z0-9]{1,6}$`, `numero_ecriture` `^[A-Za-z0-9-]{1,20}$`, `compte` `^[0-9]{2,12}$`, `piece_id` au format ADR-03 ou vide, entiers bornés, `libelle` ≤ 200 caractères et ne commençant pas par `= + - @`, équilibre débit = crédit par écriture, `source` égale à `sources_exercice`, `saisi_par` non vide et présent dans `correspondance_personnes` (Défaut D10, D16) → sinon import `Rejete` en entier.
3. Chargement dans `ecritures_import_brut`, puis `appliquer_import` en **une** transaction : insertion ou mise à jour par clé naturelle sans toucher `piece_id_saisi`, `presente_dernier_import` recalculé, import `Importe`. Si l'import ferait perdre leur citation à plus de `seuil_import_confirmation` pièces ou à une pièce contrôlée : statut `A_confirmer`, appliqué seulement après confirmation du responsable de validation dans la base NocoDB « Archive – validation » (rôle `arch_nocodb_rv`).
- Une coupure avant la fin annule tout ; le rejeu repart de zéro, car l'empreinte n'est marquée importée qu'au statut `Importe`.

**W09 — Alerte d'échec et file d'erreurs.** Déclencheur d'erreur de n8n ; ligne `erreurs_workflow` ; courriel au développeur et au responsable de validation (SMTP) sans chemin, tiers ni montant ; au-delà de 5 erreurs par heure, un récapitulatif. Si n8n est arrêté, la sonde externe (§8.8) prend le relais.

**W08 (ouverture d'une pièce)** : supprimé comme webhook public ; remplacé par la route `/piece/<id>` (§8.2), servie par un webhook n8n joignable seulement depuis Nginx en `127.0.0.1`.

### 5.2 Tâches planifiées de l'hôte

Scripts versionnés, lancés par cron ou systemd. **H2 à H6** tournent sous un utilisateur dédié sans droit sur `pgdata` ; **H1** est le seul script root, minimal et séparé (NR-02). Aucun ne passe par un interpréteur de commandes avec des valeurs lues en base ; ils ne lisent que des identifiants numériques, des empreintes (`^[0-9a-f]{64}$`) et des chemins calculés par la base, qu'ils revalident (préfixe `/srv/archive/fichiers/Archive/` après normalisation).

| Tâche | Fréquence | Rôle |
|---|---|---|
| H1 Scellement (root) | Chaque minute | Ne traite que les noms `^[0-9a-f]{64}\.pdf$` de `objets/` ; ouvre chaque fichier avec `O_NOFOLLOW` ; refuse ce qui n'est pas un fichier ordinaire ou a plus d'un lien (`nlink > 1`) ; recalcule la SHA-256 et la compare au nom ; seulement alors `fchown root:root` et `fchmod 0444` sur le descripteur ouvert, puis `chattr +i` si possible (à vérifier) ; un fichier refusé est déplacé en quarantaine, ligne `resultats_integrite` et alerte (NV-01, NR-02, NR-11) |
| H2 Liens d'arborescence | Chaque minute | Crée les liens de `v_arborescence` ; déplace les anciens liens corrigés vers `_versions/` |
| H3 Registre des identifiants | Chaque minute | Ajoute les nouvelles attributions à `registre_ids/AAAA.log` (`chattr +a`) ; envoie le segment chiffré sur le bucket `dumps-registre` (nom unique) |
| H4 Sauvegarde | Chaque nuit à 1 h ; toutes les 2 h de 8 h à 20 h pendant S43–S44 (Défaut D9) | §8.6 |
| H5 Intégrité et chaîne | Chaque nuit (pièces des 7 derniers jours) ; complète chaque dimanche | Recalcule les empreintes et compare à `pieces` (hors `Fusionnee`) **et** à `fichiers_deposes` ; fichiers sans pièce ; liens absents ; registre ≠ base ; **recalcule la chaîne du journal depuis l'ancre précédente lue sur GCS** et signale toute rupture (E06 et alerte) (NR-08) ; écrit par `consigner_integrite` |
| H6 Disque, chaînage et ancre | Toutes les 15 min (disque) ; chaque nuit et après chaque sauvegarde de 2 h (chaînage) | Alerte au seuil de 80 % ; appelle `chainer_journal()` (rôle `arch_chaine`), puis écrit l'ancre (dernière empreinte, `id_max`, nombre de lignes) sur le bucket `dumps-registre` et dans le courriel du soir à la Direction (§8.11) (NV-03) |

### 5.3 Contrôles (vues SQL dans NocoDB, export CSV envoyé chaque matin au responsable de validation)

Une écriture est **justifiée** si et seulement si elle cite (`piece_id_cite`, à défaut `piece_id_saisi`) une pièce `Classee` ou `Manquante` (Défaut D5). `motif_piece_manquante` est informatif.

| Code | Vue | Critère |
|---|---|---|
| E01 | Écriture présente sans aucune citation | 2, 3 |
| E02 | Écriture citant un identifiant inconnu, rejeté, annulé ou fusionné | 2 |
| E03 | Pièce contrôlée sans écriture présente | 3 |
| E04 | Pièce `Classee` ou `Manquante` sans écriture depuis plus de `delai_e04_jours` | 3 |
| E05 | Trou ou doublon de numérotation ; différence entre la base et le registre hors base | 6 |
| E06 | Résultats d'intégrité H5 (fichier absent, empreinte différente, fichier sans pièce, lien absent) | Intégrité |
| E07 | Pièce `Manquante` sans traitement clos à la date limite | 1 |
| E08 | Somme des écritures ≠ montant de la pièce (information) ; année de la pièce et exercice distants de plus d'un an (information) | Qualité |
| E09 | Rapprochement avec écart non expliqué ou relevé manquant | 7 |
| E10 | Lot non ingéré depuis 24 h ; pièce `A_trier` depuis plus de 5 jours ouvrés | 1 |
| E11 | Écart entre `inventaire` et l'archive (`v_inventaire_vs_archive` : attendu, classées, manquantes, rejetées, en cours) | 1 |
| E12 | `piece_id_cite` différent de `piece_id_saisi` | 2 |
| E13 | Pièce validée moins d'une heure après son tri ou par un compte égal au trieur (si identifiable) | Quatre yeux |

Un écart enregistré dans `ecarts_acceptes` sort de la vue et apparaît dans la vue « Écarts acceptés ». Vues complémentaires : `v_balance` (exercice, compte, débit, crédit, solde, nombre d'écritures, nombre non justifiées) ouverte sur les écritures du compte, puis sur leur pièce (RS-20) ; comparaison à la balance de l'ERP si elle est fournie au même format (Défaut D16) ; `v_tableau_bord` (déposées, à trier, triées, classées, saisies, contrôlées, manquantes, rejetées, par année et type ; temps moyen dépôt → classement ; écart à `plan_avancement`) ; `v_echantillon` : tirage d'**écritures** par compte avec graine notée, strates (au moins 3 par type de pièce, 5 plus gros montants, premier et dernier mois), parcours chronométré « compte → écriture → pièce » (tolérance Défaut D15 : 30 sur 30).

## 6. Interfaces utilisateur (NocoDB)

Rôles NocoDB et restrictions par table ou par champ : à vérifier sur la version installée ; la base protège de toute façon (§4.5).

| Utilisateur | Rôle proposé | Vues et formulaires |
|---|---|---|
| Aide au tri | Editor sur « Archive – saisie » seulement | « File à trier » (sans les champs de décision) ; « Mes lots » |
| Comptable | Editor sur « Archive – saisie » seulement | « À valider » (y compris Rejeter une pièce `A_trier` illisible) (avec doublons probables) ; « Déclarer une pièce manquante » (formulaire sur `declarations_manquantes`) ; « Justificatifs à rattacher » et « Demandes de correction » (formulaires sur `demandes`) ; « Écritures à relier » (ne propose que les pièces `Classee` ou `Manquante`) ; « Inventaire » ; « Rapprochements » ; « Contrôles E01–E13 » ; « Recherche » |
| Responsable de validation | Editor sur les deux bases | Vues du comptable + sur « Archive – validation » : « Échantillon » (contrôles) ; « Imports à confirmer » ; « Écarts acceptés » ; « Annulations et réouvertures » ; « Corrections à approuver » ; « Rapprochements à valider » ; « Pièces réintégrées » ; tableau de bord |
| Direction | Viewer | Tableau de bord ; Recherche ; Manquantes à signer ; Contrôles |
| Développeur | Owner | Tout, plus `erreurs_workflow`, `refus`, `resultats_integrite` |

La base NocoDB « Archive – validation » n'est partagée qu'avec le responsable de validation (et le développeur) ; restreindre une base à certains utilisateurs est à vérifier (ARC-002), repli au §4.3. Vues de travail verrouillées ; **aucune vue ni formulaire partagé par lien public** ; inscription fermée (§8.2) ; recherche insensible à la casse et aux accents par `tiers_recherche` ; montants affichés avec séparateur, stockés sans. L'exportation CSV depuis NocoDB est réservée au développeur et au responsable de validation (Défaut D13).

## 7. Contrat d'interface avec l'ERP

À confirmer par le développeur après lecture du code de l'ERP (ARC-018). Rien n'est supposé sur ses capacités.

### 7.1 Flux
| Flux | Sens | Contenu | Fréquence | Responsable |
|---|---|---|---|---|
| F1 Écritures | ERP ou Excel → archive | CSV §7.2, exercice complet | Chaque jour ouvré en S43–S44 et avant chaque contrôle | Comptable, par le compte SFTP « imports » |
| F1b Balance (facultatif) | ERP → archive | `exercice;compte;debit_fcfa;credit_fcfa` | Avec F1 | Comptable (Défaut D16) |
| F3 Ouverture | ERP → archive | Lien `https://<archive>/piece/<id>` | À la demande | ERP (option A) |
| F2 Liste des pièces vers l'ERP | — | **Reporté** après le 31 octobre (§11) | — | — |
| F4 PDF produits par l'ERP | ERP → archive | **Hors périmètre du 31 octobre, Défaut D6** : d'ici là, les factures émises par l'ERP sont imprimées en PDF et déposées comme lots ordinaires `6_Ventes` si ce type entre dans le périmètre | — | Comptable |

### 7.2 Format du CSV des écritures (F1)
UTF-8, point-virgule, en-tête obligatoire, une ligne par ligne d'écriture, montants entiers, dates `AAAA-MM-JJ`, nom `ecritures_<SOURCE>_<EXERCICE>_<AAAAMMJJHHMM>.csv`, exercice complet.

`source;exercice;journal;numero_ecriture;ligne;date_ecriture;compte;libelle;debit_fcfa;credit_fcfa;saisi_par;piece_id;motif_piece_manquante`

Exemple : `ERP;2025;AC;000231;1;2025-03-15;401100;Facture SOCOFER;0;450000;cpt1;FT-PC-2025-00017;`

`saisi_par` (identifiant de la personne qui a saisi l'écriture) sert aux quatre yeux du contrôle (Défaut D10). Une pièce manquante se cite par son identifiant FT-PC, pas par un motif libre (Défaut D5).

### 7.3 Option A (visée pour le 21 octobre, Défaut D2)
`piece_id` obligatoire sur chaque écriture au point d'écriture `comptabilisation.py` ; format vérifié à la saisie ; export F1 avec la colonne ; lien F3 ; aucune table de pièces dans l'ERP.

### 7.4 Option B (démarrage)
Export F1 sans `piece_id` ; correspondance dans « Écritures à relier » ; clé (journal, numéro, ligne) stable d'un export à l'autre. Limites acceptées par défaut (Défaut D2) : pas de refus à la saisie dans l'ERP (REC-045), pas d'identifiant affiché dans l'ERP (REC-044 en partie).

### 7.5 À vérifier dans le code de l'ERP
Identifiant stable des écritures ; modification d'une écriture validée et reflet dans l'export ; `comptabilisation.py` seul chemin d'écriture ; champ, export ou API existants ; reprise des exercices passés (J04b, D16) ; fuseau et format de date ; utilisateur de saisie disponible pour `saisi_par` ; sûreté de la production du CSV (entrée non fiable pour l'archive).

## 8. Sécurité et exploitation

### 8.1 Comptes
- Un compte NocoDB nominatif par personne ; liste signée par la Direction (D13) ; retrait de droits immédiat, sur NocoDB, Nginx et SFTP ensemble (fiche de sortie unique).
- **Double authentification obligatoire avant le go** sur le panneau Hostinger, le compte Google propriétaire du projet GCS et GitHub ; SSH par clé seulement ; NocoDB : double authentification si la version la propose (à vérifier), sinon mots de passe d'au moins 14 caractères par gestionnaire de mots de passe, limitation de débit et `fail2ban` sur les pages de connexion.
- Comptes Nginx : un par personne, synchronisés avec la liste NocoDB.

### 8.2 Exposition réseau
- Seuls 22 et 443 (80 en redirection) répondent depuis Internet, vérifié par `nmap` depuis un autre réseau. Tous les ports Docker liés à `127.0.0.1` ; PostgreSQL non publié (réseau Docker interne) ; `docker ps` ne montre aucun `0.0.0.0` hors Nginx.
- **Éditeur n8n non exposé** : accès par tunnel SSH pour le développeur seul (`AllowTcpForwarding no` par défaut, `yes` seulement dans un bloc `Match User` du développeur ; clé SSH protégée par phrase de passe ; gestion des utilisateurs de n8n active avec double authentification sur le compte propriétaire, à vérifier sur la version) (NR-14).
- **Webhooks (NR-09)** : le site web publie son webhook des devis par une correspondance **exacte** (`location = /webhook/<chemin-devis>`), jamais par préfixe ; les webhooks de l'archive ont un chemin non devinable, ne sont joignables que depuis le site Nginx de l'archive en `127.0.0.1`, et vérifient un en-tête secret partagé Nginx → n8n ; l'emplacement `/_objets/` n'existe que dans le site Nginx de l'archive ; `proxy_ignore_headers X-Accel-Redirect` sur tous les autres `proxy_pass`. Essai : depuis Internet, `/webhook/<chemin de l'archive>` → 404.
- NocoDB sur son sous-domaine en HTTPS, inscription fermée (variable à vérifier), partage public désactivé ou absent.
- **`/piece/<id>` et `/apercu/<n>`** (sous-domaine distinct de NocoDB) : authentification Nginx **avant** tout traitement ; `limit_req` ; format vérifié par Nginx (`^/piece/FT-(PC|TS)-[0-9]{4}-[0-9]{5}$`, `^/apercu/[0-9]{1,12}$`) ; requête transmise au webhook n8n interne avec le nom de l'utilisateur authentifié ; n8n lit l'empreinte par requête paramétrée et répond `X-Accel-Redirect: /_objets/<sha256>.pdf` vers un emplacement Nginx `internal` (en-tête de réponse personnalisé : à vérifier sur la version de n8n ; repli : liens `par-id/<id>.pdf` créés par H2 et servis par `alias`). Sans authentification : 401, sans `Location`, identique pour tout identifiant. Inconnu, mal formé, annulé : même 404 générique. Le chemin réel n'apparaît jamais au navigateur. `/apercu/<n>` ne sert que les pièces `A_trier` et `A_valider` (statut vérifié par n8n) ; `/piece/<id>` sert les pièces classées (NR-10). `Cache-Control: no-store, private` sur les deux ; consigne « fermer le navigateur » et session Windows par personne dans la fiche réflexe. Restriction par type sensible : avec ARC-040, avant tout lot de paie.
- En-têtes sur l'archive : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` ; sur les fichiers : `Content-Type: application/pdf` forcé, `Content-Disposition: inline` ; `Content-Security-Policy: sandbox` **à essayer** avec le lecteur PDF des navigateurs du bureau (ARC-024) : s'il empêche l'affichage, il est retiré, le sous-domaine distinct, `nosniff` et le `Content-Type` forcé suffisant (SEC-13).
- n8n et NocoDB à la dernière version corrective avant le go ; abonnement aux avis de sécurité.
- **Cloisonnement de n8n (ARC-041)** : webhook des devis protégé par un en-tête secret ; identifiants d'IA du site réservés à ses workflows (projets séparés si la version les gère) ; aucun workflow de l'archive ne contient de nœud vers un service extérieur hors SMTP — cette vérification sur les exports est faite **dès ARC-019, avant le go**, sans attendre ARC-041. Option ultérieure : instance n8n dédiée.

### 8.3 Secrets
- Fichiers d'environnement `600 root` ; seul root dans le groupe `docker` (les variables sont lisibles par `docker inspect`).
- `N8N_ENCRYPTION_KEY` et le secret de NocoDB **fixés explicitement**, imprimés au coffre, vérifiés lors de la restauration (identifiants n8n lisibles).
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` ; aucun secret écrit en dur dans un nœud ; exports de workflows passés à `gitleaks` avant tout commit.
- **Jetons NocoDB (SEC-11)** : n8n n'utilise aucun jeton NocoDB pour l'archive (SQL direct) ; s'il en faut un pour lire le journal d'activité de NocoDB, il vient d'un compte en lecture seule sur la base de l'archive. Le jeton du site est recréé depuis un compte de service NocoDB limité à la base du CRM des devis ; l'ancien est révoqué ; essai : ce jeton ne lit aucune table de l'archive. Cette action modifie la configuration de production du site : elle se fait avec l'accord explicite de la Direction (ARC-045).
- Clé privée de déchiffrement des sauvegardes : jamais sur le VPS (§8.6).
- Rotation de tous les secrets utilisés pendant la construction le 30 ou 31 octobre et à chaque départ.

### 8.4 Entrées non fiables
- **Chemins** : seuls `objets/<sha256>`, `objets_tmp/<sha256>.<exécution>`, `quarantaine/<id_lot>/<sha256>`, `entree/<id_lot>/` et les chemins calculés en SQL (§4.7) sont utilisés ; `nom_origine`, `code_lot`, `tiers` n'entrent jamais dans un chemin ; contraintes `CHECK` sur les référentiels ; vérification du préfixe absolu avant toute écriture.
- **Commandes** : nœud Execute Command désactivé (`NODES_EXCLUDE`, par défaut sur les versions récentes : à vérifier) ; empreinte par le nœud Crypto ou le nœud Code avec le module `crypto` (`NODE_FUNCTION_ALLOW_BUILTIN=crypto` seulement, jamais `*`) (à vérifier) ; `pg_dump` et opérations système dans les tâches de l'hôte seulement.
- **SQL** : requêtes paramétrées ou fonctions ; essai avec apostrophe, point-virgule, guillemets et chaîne SQL dans `tiers` et `libelle`.
- **CSV d'écritures** : dépôt par un compte SFTP « imports » distinct, réservé au comptable, chroot sans shell ; `depose_par` enregistré ; validation stricte (§5.1 W05) ; confirmation au-delà du seuil.
- **Injection de formules** : à l'export, toute cellule texte commençant par `= + - @`, tabulation ou retour chariot est préfixée d'une apostrophe ; à la saisie, `tiers` ne peut pas commencer par ces caractères ; à l'import, `libelle` est refusé dans ce cas.
- **Poste et SFTP** : `Subsystem sftp internal-sftp -P symlink,hardlink` (création de liens refusée, NR-04) ; compte chroot, sans shell ni redirection de ports, clé dédiée au poste et révocable, quota disque ; disque du poste chiffré (BitLocker si Windows, à confirmer) ; script versionné sans mot de passe ; lot `_PRET` déplacé immédiatement hors de la zone SFTP.
- **Fichiers** : type reconnu par les octets de tête ; taille maximale 20 Mo dès le premier lot (Défaut D4) ; pièces ouvertes dans le lecteur du navigateur ; lecteurs PDF des postes à jour.

### 8.5 Droits sur les fichiers
Voir le tableau du §4.6 (propriétaires, droits, montages). `depot/` : compte SFTP du poste ; `imports/` : compte SFTP « imports » ; `entree/`, `objets_tmp/`, `quarantaine/` : utilisateur du conteneur n8n ; `objets/` : répertoire `root` en `1733`, fichiers scellés par H1 ; `fichiers/` : liens créés par H2, lecture par Nginx seulement par `internal`. Aucun accès direct à `/fichiers/` par URL : tout passe par `/piece/<id>`.

### 8.6 Sauvegarde 3-2-1

| Copie | Support | Lieu | Contenu | Fréquence |
|---|---|---|---|---|
| 1 | SSD du VPS | Datacentre Hostinger | Production | Continu |
| 2a | Bucket GCS `dumps-registre` | Hors site | Dumps des bases (`archive_compta`, métadonnées NocoDB et n8n), segments du registre, ancres du journal, journaux PostgreSQL et Nginx, objets des pièces encore `A_trier` ou `A_valider`, chiffrés | H4 : nuit + toutes les 2 h en S43–S44 (Défaut D9) ; registre chaque minute ; ancre après chaque chaînage |
| 2b | Bucket GCS `objets` | Hors site | Objets des pièces `Classee`, `Manquante` justifiée ou `Annulee`, chiffrés ; jamais ceux des pièces `Rejetee` | H4, dès qu'une pièce quitte `A_valider` |
| 3 | Disque externe chiffré | Bureau, débranché, sous clé | Copie **incrémentale** des deux buckets (objets nouveaux, dernier dump, segments du registre, ancre de la semaine), empreintes vérifiées (NV-11) | **Première copie avant le go** (REC-094), puis chaque vendredi |

- **Chiffrement à clé publique** (`age` ou `gpg`, à installer : à vérifier) : le VPS n'a que la clé publique ; la clé privée est imprimée en deux exemplaires au coffre (deux lieux) et n'est sortie que le temps d'une restauration.
- **Ordre** : fichiers d'abord, dump ensuite ; la vérification de restauration contrôle que chaque objet cité par le dump existe dans la copie. `entree/` et `registre_ids/` sont inclus.
- **GCS** : noms d'objets uniques (date, heure, empreinte), jamais réécrits ; création avec précondition « n'existe pas » (un objet déjà présent = succès) ; compte de service avec le seul droit de création d'objets (rôle exact à vérifier) ; essai consigné : une suppression **et** un écrasement échouent ; **deux buckets** (NR-07, Défaut D9, à décider **avant la création des buckets**, le choix étant irréversible) : `dumps-registre` avec une règle de rétention de 400 jours **verrouillée dès le go** (D9 la fixe ; elle protège aussi les ancres du journal) ; `objets` avec une règle provisoire, verrouillée après la réponse sur la durée de conservation (J12, D14). Raison du choix contre la rétention par objet : une règle de bucket se verrouille simplement et ne demande pas au compte de service le droit de poser une rétention par objet (droit plus large, à vérifier) ; inconvénient : deux buckets à surveiller. Le compte de service a **création et lecture** (pour vérifier présence et taille), sans suppression ni écrasement ; c'est acceptable, car tout est chiffré par une clé absente du VPS ; accès public interdit ; accès uniforme ; versionnement activé ; double authentification sur le compte propriétaire.
- **Fichiers déposés par erreur (NV-09, Défaut D14)** : un objet de pièce `Rejetee` n'est jamais copié dans le bucket `objets` ; il reste au plus 400 jours dans `dumps-registre` s'il y est parti avant le rejet (chiffré) ; sur le VPS, il est retiré par root après 30 jours, sur procès-verbal du responsable de validation.
- **Copie 3** : identifiant GCS en **lecture seule**, distinct, sur le seul poste qui fait la copie ; les fichiers étant déjà chiffrés, le disque l'est aussi par BitLocker (à confirmer selon le système).
- Les instantanés Hostinger (à vérifier) réduisent la durée de restauration mais ne comptent pas comme copie.

### 8.7 Restauration et recalage
Procédure écrite (ARC-015) : machine de restauration à disque chiffré (environnement de test du VPS ou machine dans le nuage ; le poste du bureau ne sert qu'à lire un échantillon) ; clé privée sortie du coffre ; restauration des objets puis du dump ; vérification que chaque objet cité par le dump existe ; **recalage obligatoire (ADR-03 : segments GCS comme référence, réintégration avec contrôle de l'objet, ordre de recherche du fichier GCS → lot du poste → nouvelle numérisation, marge de 20 numéros créés `Annulee`)** ; vérifications : comptes par statut, compteurs = maximum observé + marge, chaîne du journal vérifiée contre la dernière ancre, 20 empreintes, 3 pièces ouvertes par `/piece/<id>`, identifiants n8n lisibles ; durée notée ; effacement des données restaurées hors VPS noté au procès-verbal. Restaurations complètes : avant l'archivage en masse (ARC-015) et le 30 octobre (ARC-034).

### 8.8 Supervision et objectifs de reprise
Sonde externe gratuite (service de surveillance HTTP, à choisir, D14) **avant le go**, sur NocoDB et sur `/piece/` (401 attendu) ; alerte disque H6 ; W09. Objectifs (Défaut D9) : perte maximale admise (RPO) 2 h pendant S43–S44 et 24 h ensuite, registre des identifiants à 1 minute ; durée de restauration (RTO) 1 jour ouvré. Supervision interne W11, rapport W10 et restauration automatique W07b : reportés (§11).

### 8.9 Environnement de test
Composition Docker sur le poste du développeur (ports liés à `127.0.0.1`, mots de passe propres, jamais réutilisés en production), mêmes versions, `prefixe_identifiant = FT-TS`, PDF fictifs marqués « SPÉCIMEN » ; aucune pièce réelle sur un poste non chiffré.

### 8.10 Mode dégradé
Coupure réseau : la numérisation continue, l'envoi reprend ; coupure électrique : onduleur (à acheter), lot renvoyé entier ; serveur indisponible : lots locaux conservés jusqu'à `Ingere` et sauvegarde suivante, papier conservé ; reprise automatique des lots `En_ingestion`. Aucun papier détruit avant la réponse J12.

### 8.11 Journaux
- **Journal d'audit chaîné dès le go, hors transaction** (NV-03) : H6 chaîne chaque nuit et après chaque sauvegarde de deux heures ; l'ancre (dernière empreinte, `id_max`, nombre de lignes) part dans le bucket `dumps-registre` verrouillé et dans un courriel à la Direction (boîte à conserver) ; H5 recalcule la chaîne chaque nuit depuis l'ancre précédente lue sur GCS ; une fois par mois, le responsable de validation compare la valeur du courriel à celle recalculée (une ligne au journal d'exploitation) (NR-08). Toute réécriture antérieure à la dernière ancre devient détectable ; les lignes postérieures (au plus 2 h en S43–S44) ne le sont qu'à l'ancre suivante. Le développeur administrateur ne peut être qu'observé, pas empêché (Défaut D7).
- **Journal du serveur PostgreSQL** : `log_min_error_statement = error`, `log_statement = 'ddl'`, `log_connections = on`, `log_line_prefix` avec utilisateur et base : trace des refus de déclencheur et de toute désactivation de déclencheur. Il peut contenir des valeurs (tiers, montants) : il est traité comme une donnée de l'archive (sauvegardé chiffré, accès root).
- **Nginx** : format qui n'écrit que l'URI `/piece/<id>` et l'utilisateur (aucun nom de fichier) ; conservation 1 an, incluse dans la sauvegarde (base de US-SYS-12).
- **n8n** : données d'exécution non conservées en cas de succès (`EXECUTIONS_DATA_SAVE_ON_SUCCESS=none`), purge courte ; `erreurs_workflow.code` ne contient jamais de chemin.
- **Journal d'exploitation** d'une page : redémarrages, ouvertures de `arch_owner`, restaurations, rotations.

## 9. Correspondance exigences → conception

| Exigence | Élément de conception | Couverture |
|---|---|---|
| US-ARC-01 | `pieces`, ADR-03, W01, W02 | Couverte |
| US-ARC-02 | Option B : « Écritures à relier » ; option A : §7.3 | Partielle en option B (pas de refus à la saisie, Défaut D2) ; couverte en option A |
| US-ARC-03 | `/piece/<id>`, `v_pieces.refs_ecritures` | Pièce → écritures : couverte ; écriture → pièce : par `/piece/<id>` depuis NocoDB, depuis l'ERP en option A ; 2 s à mesurer |
| US-ARC-04 | E01–E04, export CSV | Couverte |
| US-ARC-05 | `declarations_manquantes`, `declarer_piece_manquante`, `rattacher_justificatif` (valeurs du justificatif, version, changement d'année) | Couverte ; texte de l'attestation (D14) ; relances automatiques reportées |
| US-ARC-06 | Script du poste, W01 (écriture atomique, lot déjà ingéré signalé, rejet depuis `A_trier`), ADR-05 | Couverte (REC-106, REC-114, REC-176 hors règles D4) |
| US-ARC-07 | `rapprochements_bancaires`, `v_rapprochements`, E09 | Partielle, Défaut D8 : solde comptable calculé, appariement ligne à ligne dans l'état joint |
| US-ARC-08 | `v_balance` → écritures → `/piece/<id>` | Couverte depuis le compte ; « poste du bilan → comptes » avec la balance, hors outil |
| US-ARC-09 | F4 | **Hors périmètre du 31 octobre, Défaut D6** ; repli : dépôt manuel des PDF |
| US-ARC-10 | `date_fin_conservation`, aucune suppression | Partielle : durée non confirmée (D14) ; alerte reportée |
| US-ARC-11 | `v_tableau_bord`, `plan_avancement` | Couverte (vue) ; courriel quotidien reporté |
| US-SYS-08 | W09, `erreurs_workflow`, sonde externe, alertes H1, H5, H6 | Couverte |
| US-SYS-10 | §8.9, préfixe FT-TS | Couverte |
| US-SYS-11 | CSV par table protégés, PDF, dump | Couverte (ARC-033) |
| US-DIR-05 | Aucune suppression ; rétention GCS ; papier conservé | Partielle (D14 ; 3 ans contre 10 ans à trancher) |
| Critère 1 | `inventaire`, E11, E07, E10 | Couverte par comptage (pas pièce par pièce) |
| Critère 2 | E01, E02, E12 ; justification Défaut D5 | Couverte si l'export d'écritures est complet |
| Critère 3 | E01, E03, E04 (délai 0 à J14) ; saisie calculée | Couverte |
| Critère 4 | `v_echantillon` stratifié, `/piece/<id>` | Couverte ; tolérance D15 ; mesure J14 |
| Critère 5 | H4, deux buckets, chiffrement, copie 3 avant le go, ARC-015, ARC-034, recalage | Couverte (REC-094 : copie 3 faite avant le go ; REC-096 : voir backlog §5) |
| Critère 6 | ADR-03, registre hors base protégé, recalage depuis GCS avec marge de réserve, préfixe contrôlé, E05 | Couverte, y compris après restauration et perte de la dernière minute |
| Critère 7 | `v_rapprochements`, E09 | Partielle, Défaut D8 |

## 10. Risques techniques et hypothèses ouvertes

| N° | Risque ou hypothèse | Parade |
|---|---|---|
| R1 | NocoDB ne gère pas bien une source PostgreSQL externe (liens, vues, messages d'erreur) | ARC-002 le 12 oct. ; repli ADR-01 option 2 ; D1 |
| R2 | Migration et volumes touchent le CRM des devis du site | Sauvegarde préalable, hors heures, essai du formulaire devis ; migration des métadonnées reportée |
| R3 | Rôles NocoDB grossiers | Matrice de droits en base (§4.5) |
| R4 | Identité humaine non fournie par NocoDB | §4.3 ; risque signé (D7) |
| R5 | Charge du développeur seul | Backlog v0.2 ; D2 |
| R6 | Disque ou mémoire insuffisants | ARC-001 ; H6 ; test sur le poste |
| R7 | Option A non livrée | Option B par défaut |
| R8 | Écritures passées hors ERP | Source `EXCEL`, une source par exercice (D16) |
| R9 | Année du compteur, exercices | D3 avant la première attribution (irréversible ensuite) |
| R10 | Qualité des scans | Fiche de collecte, formation, T4 |
| R11 | Capacités de n8n différentes (en-tête `X-Accel-Redirect`, Crypto, accès disque, données d'exécution) | ARC-002 ; replis cités |
| R12 | Durée de conservation contradictoire | Aucune suppression ; rétention verrouillée seulement après J12 |
| R13 | Coûts GCS, disque, onduleur non chiffrés | À chiffrer après l'inventaire (D9) |
| R14 | Ouverture en moins de 2 s non tenue | Mesure à J06 |
| R15 | Liens symboliques mal gérés par l'outil de copie ou par Nginx | Les liens ne sont qu'une présentation : la copie porte sur `objets/` et la base ; ouverture par `X-Accel-Redirect` |
| R16 | Un administrateur malveillant | Observé, pas empêché : ancre externe du journal, journal du serveur (D7) |
| R17 | NocoDB ne permet pas de restreindre une base à certains utilisateurs | Journal d'activité de NocoDB lu par W02, sinon risque signé et rapport hebdomadaire des actions réservées (D7) |
| R18 | Mauvais choix de rétention GCS, irréversible après verrouillage | Décision D9 avant la création des buckets ; verrou du bucket `objets` seulement après J12 |
| R19 | Un objet préexistant faux bloque un lot (seul root peut le retirer) | Alerte immédiate ; procédure root d'une page au journal d'exploitation |

Hypothèses ouvertes : versions et installation de n8n et NocoDB ; espace disque ; système du poste ; outils `age` et `chattr` ; rôle GCS exact et offre de rétention ; outil de sonde ; liste nominative des utilisateurs.

## 11. Reportés

| Constat | Ce qui est reporté | Raison |
|---|---|---|
| RS-35 | W10 (courriel quotidien), W11 (supervision interne), W07b (restauration automatique hebdomadaire) | Les vues, la sonde externe, H6 et les deux restaurations manuelles tiennent le critère 5 ; à faire après le 31 octobre |
| RS-11 | Migration des métadonnées de NocoDB et de n8n vers PostgreSQL | Hors périmètre de la fiche ; volumes persistants suffisants en S42 |
| RS-09 (partie) | Relances automatiques des demandes de duplicata (W04) | La vue E07 suffit pour J13 |
| RS-06 (partie) | Identité nominative garantie par la base | Impossible sans changement d'outil ; D7 |
| SEC-20 (partie) | Ne plus journaliser le corps des réponses NocoDB dans le code du site (`api/lib/nocodb.js`) | Hors des deux fichiers et hors du périmètre de l'archive ; tâche ARC-052 |
| SEC-23 (partie) | Port de développement lié à `127.0.0.1` dans `docker-compose.yml` | Autre fichier, sans effet sur la production ; ARC-052b après le 31 octobre. La partie `.gitignore` est avancée avant le go (ARC-052a, accord requis) |
| NV-09 (partie) | Retrait d'un objet parti sur `dumps-registre` avant son rejet | Rétention verrouillée de 400 jours ; objet chiffré ; D14 |
| NR-10 (partie) | Droits par type de pièce sur `/piece/` | Avec ARC-040, avant tout lot `7_Paie` |
| SEC-24 (partie) | Restriction Nginx et NocoDB par type sensible | `7_Paie` reste inactif jusqu'à ARC-040 |
| — | Table `ecarts` avec cycle de vie, flux F2 et F4, option IA, chaînage déjà fait | Après le 31 octobre |

## 12. Décisions D1–D16 : options par défaut retenues

| N° | Option par défaut dans cette conception |
|---|---|
| D1 | Base dédiée sous NocoDB ; métadonnées NocoDB et n8n migrées après le 31 octobre |
| D2 | S42 sans travail sur l'ERP ; démarrage en option B ; option A visée le 21 ; date du go : deux scénarios dans le backlog, non tranchés |
| D3 | Année du compteur = année de `date_piece` ; exercice civil ; exercices 2024–2026 ; pièces 2023 admises pour les soldes d'ouverture |
| D4 | `sens` (Normal/Avoir), `sans_montant`, `date_estimee` ; PDF seul, 20 Mo ; PDF protégé refusé ; devise d'origine non gérée (montant FCFA de l'écriture) |
| D5 | Écriture justifiée seulement par l'identifiant d'une pièce `Classee` ou `Manquante` |
| D6 | US-ARC-09 hors du 31 octobre ; REC-152 à REC-157 en vague « Post » |
| D7 | Second rôle PostgreSQL `arch_nocodb_rv` pour les actions réservées ; trieur ≠ valideur par le compte NocoDB réel si disponible, sinon déclaratif et risque signé ; troisième rôle `arch_nocodb_tri` en option ; développeur observé par l'ancre du journal |
| D8 | Rapprochement calculé par le comptable, état joint ; solde comptable calculé dans l'outil ; relevés `5_Banque` dans le périmètre |
| D9 | RPO 2 h en S43–S44, 24 h ensuite ; RTO 1 jour ouvré ; chiffrement par clé publique ; **deux buckets** (`dumps-registre` 400 jours verrouillé au go ; `objets` verrouillé après J12), décidé avant leur création ; marge de recalage de 20 numéros ; disque et onduleur achetés avant le 14, copie 3 avant le go |
| D10 | Contrôleur ≠ trieur et ≠ saisisseur, comparés par `correspondance_personnes` ; `saisi_par` obligatoire à l'import |
| D11 | Correction versionnée, appliquée par le responsable de validation ; changement d'année = annulation et nouvelle pièce |
| D12 | Noms de mois sans accents (`02_Fevrier`) ; codes de type de §4.2 |
| D13 | Liste nominative signée ; exportation réservée au développeur et au responsable de validation ; retrait de droits immédiat |
| D14 | Texte de l'attestation à fournir ; sonde externe gratuite ; IA désactivée ; conservation en attente de J12 ; retrait des objets rejetés après 30 jours sur procès-verbal |
| D15 | 30 sur 30 à l'échantillon ; REC-039 requalifié (parade `pris_par`) |
| D16 | Une source d'écritures par exercice ; balance F1b facultative |
