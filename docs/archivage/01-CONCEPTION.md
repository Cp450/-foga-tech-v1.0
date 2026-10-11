# Archivage comptable — Conception (n8n + NocoDB)

Rédigée par l'architecte de la chaîne de conception. La fiche de cadrage `00-FICHE-CADRAGE.md` fait foi. Conventions : « Hypothèse » = fait non établi ; « À confirmer » = décision humaine ; « À vérifier sur la version installée » = capacité de n8n, de NocoDB ou de Google Cloud Storage (GCS) non vérifiée ; « Par défaut, sous réserve de Dnn » = option retenue en attendant la décision Dnn de la revue senior (`04-REVUE-SENIOR.md` §6, rappelées au §12).

## Historique des versions

| Version | Date | Auteur | Changements |
|---|---|---|---|
| 0.1 | 11 oct. 2026 | Architecte | Première version |
| 0.2 | 11 oct. 2026 | Architecte | Prise en compte de la revue senior (`04-REVUE-SENIOR.md`, 35 constats) et de l'audit de sécurité (`05-AUDIT-SECURITE.md`, 24 constats). Changements principaux : statut réduit au cycle de vie, « saisie » et « contrôlée » calculées ; registre des identifiants hors base et recalage après restauration ; fichiers stockés une fois sous leur empreinte et rendus non modifiables ; ouverture par `/piece/<id>` derrière l'authentification ; rôles PostgreSQL sans propriété ni superutilisateur, toutes les écritures sensibles par fonctions ; journal chaîné dès le go ; sauvegardes chiffrées par clé publique ; inventaire, plan, versions de pièces, déclarations de pièces manquantes ; exposition réseau délimitée ; trois workflows n8n plus l'alerte, le reste en tâches planifiées de l'hôte et en vues SQL ; migration des métadonnées de NocoDB et de n8n reportée après le 31 octobre |

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
3. **Ingestion** (système, W01). Vérifications (octets de tête `%PDF-`, taille, empreinte du manifeste) ; fichier copié dans `objets/<sha256>.pdf` ; pièce créée `A_trier` ; H1 rend le fichier non modifiable.
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

**Recommandation : option 1, GCS pour la copie hors site.** H1 passe chaque nouvel objet à `root:root 0444` dans un répertoire au bit collant (n8n ne peut ni le modifier ni le supprimer) ; `chattr +i` en plus si le système de fichiers le permet (à vérifier). Seuil d'alerte disque 80 %. **Coût de se tromper** : disque plein = ingestion arrêtée (alerte H6) ; Drive = chemins faux, critère 4 compromis.

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
Garde-fous : unicité de `id_piece` ; format `^FT-(PC|TS)-[0-9]{4}-[0-9]{5}$` ; `id_piece` et `compteurs` écrits seulement par les fonctions (§4.5) ; `compteurs.dernier` ne peut passer qu'à `dernier + 1`, sauf par `recaler_compteurs` (hausse seulement) ; pièces jamais supprimées.

**Registre hors base (H3).** Chaque minute, H3 lit les nouvelles attributions et les ajoute à `/srv/archive/registre_ids/AAAA.log` (`annee;numero;id_piece;empreinte;date_piece;type;tiers;montant;horodatage`), fichier en ajout seul, puis envoie le nouveau segment chiffré sur GCS sous un nom unique. Ce registre contient des données de tiers : il est protégé et sauvegardé comme l'archive.

**Recalage après restauration (procédure §8.7, obligatoire).** `attribution_suspendue = vrai` ; maximum observé par année dans le registre, dans les liens d'arborescence, dans les segments GCS et dans le dernier CSV d'écritures ; réintégration de chaque pièce présente dans le registre mais absente de la base par `reintegrer_piece` (journalisée) ; `recaler_compteurs` au maximum observé ; levée de la suspension. Test obligatoire (ARC-007) : sauvegarde S1, 20 attributions, restauration de S1, recalage, nouvelle attribution → `…-00021`.

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
| `version` | integer | oui | +1 à chaque mise à jour | 4 |
| `cree_le`, `modifie_le` | timestamptz | oui | posés par la base | — |

La vue `v_pieces` ajoute, sans les stocker : `saisie` (au moins une écriture présente au dernier import la cite), `refs_ecritures` (toutes les écritures qui la citent : une pièce peut être citée par plusieurs lignes, par exemple facture et règlement ; une ligne cite une seule pièce), `controlee` (dernier contrôle de `controles_pieces` positif), `libelle_fiche` (« À trier », « Classée », « Saisie dans l'ERP », « Contrôlée », « Manquante », etc.), `lien` (`/piece/<id_piece>`).

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
| `demandes` | Décisions humaines hors tri (une ligne par demande) | `type` (Rattacher_justificatif, Corriger, Annuler, Reouvrir_rejet), `piece_id`, `piece_deposee_id` (rattachement), `champ`, `nouvelle_valeur`, `motif` (obligatoire), `demande_par`, `statut` (A_traiter, Appliquee, Refusee), `code_refus` |
| `pieces_versions` | Version d'une pièce avant correction (RS-19, insertion seule) | `piece_id`, `version`, `donnees` (jsonb), `ancien_chemin`, `ancien_nom`, `motif`, `auteur`, `horodatage` |
| `controles_pieces` | Contrôle d'échantillon (insertion seule) | `piece_id`, `controle_par`, `date`, `resultat` (Conforme, Non_conforme, Reouvert), `commentaire` ; `controle_par` ≠ `trie_par` et ≠ `saisi_par` des écritures (Défaut D10) |
| `ecritures` | Lignes importées | `source` (ERP, EXCEL) ; `exercice` ; `journal` ; `numero_ecriture` ; `ligne` ; `date_ecriture` ; `compte` (`^[0-9]{2,12}$`) ; `libelle` (≤ 200 caractères) ; `debit_fcfa`, `credit_fcfa` (entiers ≥ 0, un seul non nul) ; `saisi_par` ; `piece_id_cite` (option A) ; `piece_id_saisi` (option B, seulement une pièce `Classee` ou `Manquante`) ; `motif_piece_manquante` (informatif seulement) ; `import_id` ; `presente_dernier_import`. Clé naturelle unique (source, exercice, journal, numéro, ligne) |
| `ecritures_import_brut` | Zone de chargement d'un CSV avant application | mêmes colonnes en texte + `import_id` |
| `imports_ecritures` | Un fichier CSV | `nom_fichier`, `empreinte_sha256`, `depose_par` (compte SFTP « imports »), `source`, `exercice`, `nb_lignes`, `nb_inserees`, `nb_mises_a_jour`, `nb_disparues`, `statut` (Recu, A_confirmer, Importe, Rejete), `motif_rejet`. Empreinte unique parmi les imports `Importe` seulement |
| `sources_exercice` | Une seule source d'écritures par exercice (RS-13) | `exercice` clé, `source` ; changement par fonction d'administration |
| `comptes_bancaires` | Comptes de banque (Défaut D8) | `compte_comptable`, `banque`, `libelle` |
| `rapprochements_bancaires` | Critère 7 (Défaut D8) | `compte_bancaire`, `exercice`, `mois`, `solde_releve_fcfa` (saisi), `piece_releve` (lien vers une pièce `5_Banque`), `piece_etat_rapprochement` (état détaillé du comptable, lien), `statut` (Brouillon, Releve_manquant, Rapproche, Ecart_explique) ; `Rapproche` refusé si `piece_releve` est vide ou si l'écart n'est pas nul ; `etabli_par` ≠ `valide_par`. Le solde comptable et l'écart sont calculés dans `v_rapprochements` à partir des écritures |
| `ecarts_acceptes` | Écarts acceptés et documentés (J15) | `code_ecart`, `objet`, `commentaire` obligatoire, `accepte_par` (responsable de validation), `date` |
| `refus` | Refus métier consignés par les fonctions (insertion seule) | `fonction`, `objet`, `code_refus`, `acteur`, `horodatage` |
| `resultats_integrite` | Résultats de H5 | `objet`, `code` (FICHIER_ABSENT, EMPREINTE_DIFFERENTE, FICHIER_SANS_PIECE, LIEN_ABSENT, REGISTRE_DIFFERENT), `detail`, `horodatage` |
| `journal_audit` | Journal en ajout seul, chaîné | `id`, `horodatage`, `acteur_db`, `acteur_humain`, `table_nom`, `enregistrement_id`, `action`, `avant`, `apres`, `execution_n8n`, `empreinte_precedente`, `empreinte` = SHA-256(`empreinte_precedente` + contenu canonique) |
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
| T4 | `A_trier`/`A_valider` → `Rejetee` | Comptable, RV | W02 | Décision Rejeter + motif ; pas d'identifiant |
| T5 | `Rejetee` → `A_trier` | RV | W02 (`demandes` Reouvrir_rejet) | Motif |
| T6 | `A_valider` → `Classee` | Comptable, RV (≠ trieur) | W02, `valider_piece` | ADR-03 ; quatre yeux |
| T7 | déclaration → `Manquante` | Comptable | W02, `declarer_piece_manquante` | §4.4 |
| T8 | `Manquante` → `Classee` et pièce déposée `A_valider` → `Fusionnee` | Comptable (≠ trieur du justificatif) | W02, `rattacher_justificatif` | Justificatif trié ; même année, sinon T9 + nouvelle pièce avec `remplace_par` (Défaut D11) |
| T9 | `Classee`/`Manquante` → `Annulee` | RV | W02 (`demandes` Annuler) | Motif ; aucune écriture ne la cite ; numéro jamais réutilisé |

Corrections d'une pièce classée (date dans la même année, type, tiers, montant) : demande `Corriger` par le comptable, appliquée par la fonction `corriger_piece` réservée au responsable de validation (Défaut D11) : copie dans `pieces_versions`, recalcul du nom et du chemin, l'ancien lien est déplacé par H2 dans `fichiers/_versions/<id_piece>/` ; l'objet et l'empreinte ne changent jamais.

**Quatre yeux (SEC-04, RS-06, Défaut D7).** W02 n'utilise pas les noms saisis s'il peut lire le compte NocoDB réel (champs système « créé par / modifié par » ou journal d'activité de NocoDB : à vérifier, ARC-002) ; il compare le compte qui a fait T2 au compte qui a posé la décision ; égalité → décision effacée, refus consigné. Si la version ne le permet pas : `trie_par` et `valide_par` restent déclaratifs, la vue de l'aide au tri ne montre pas les champs de décision, une vue signale les pièces validées moins d'une heure après leur tri, l'échantillon de contrôle surpondère ces pièces, et la Direction signe le risque résiduel (D7).

### 4.4 Fonctions et règles d'intégrité

Fonctions `SECURITY DEFINER`, propriété du rôle `arch_fonctions` (sans connexion), `search_path` fixé, paramètres typés :

| Fonction | Appelée par | Effet en une transaction |
|---|---|---|
| `enregistrer_lot`, `enregistrer_fichier` | W01 | Lot et fichier ; pièce `A_trier` si empreinte nouvelle ; `Doublon_exact` seulement si l'empreinte appartient à une pièce d'un **autre** lot ; fichier déjà traité dans ce lot = sauté |
| `valider_piece`, `renvoyer_piece`, `rejeter_piece` | W02 | ADR-03 ; T3, T4 |
| `declarer_piece_manquante(declaration_id)` | W02 | Refus si une déclaration ou pièce de même clé métier existe et que `confirme_doublon` est faux (RS-23) ; sinon crée la pièce `Manquante` avec identifiant (année de la date estimée), `pieces_manquantes`, relie la déclaration ; rejeu = même identifiant |
| `rattacher_justificatif(demande_id)` | W02 | Pièce déposée → `Fusionnee` ; pièce manquante reçoit empreinte, taille, nature, nom, chemin → `Classee` ; une empreinte vide reçoit une valeur une seule fois (pas d'exception à l'immuabilité) |
| `corriger_piece`, `annuler_piece`, `reouvrir_rejet` | W02 | Version, T9, T5 |
| `appliquer_import(import_id)` | W05 | §5.1 W05 |
| `reintegrer_piece`, `recaler_compteurs`, `changer_source_exercice` | Administrateur (rôle `arch_admin`) | Recalage §8.7 ; journalisés |
| `consigner_integrite` | H5 | Résultats d'intégrité |

Déclencheurs (sur toutes les tables protégées) :
- refus de `DELETE` (ligne) et de `TRUNCATE` (`BEFORE TRUNCATE … FOR EACH STATEMENT`) ;
- `empreinte_sha256`, `taille_octets` : non modifiables par **personne** une fois posées ; `id_piece`, `chemin`, `nom_fichier`, `statut` (sauf T2), `compteurs`, `journal_audit` : écrits seulement par les fonctions (contrôle de `current_user` = `arch_fonctions`) ;
- colonnes de tri modifiables par `arch_nocodb` seulement aux statuts `A_trier` et `A_valider`, colonnes de décision seulement à `A_valider` ; après `Classee`, toute correction passe par `demandes` ;
- champs obligatoires par statut ; borne de `date_piece` contre `parametres` (déclencheur, code d'erreur `DATE_HORS_PERIODE`) ; un changement de `annees_ouvertes` ne revalide pas l'existant mais alimente une vue d'écarts ;
- `piece_id_saisi` refusé si la pièce n'est pas `Classee` ou `Manquante` ;
- journal : chaque insertion, mise à jour et appel de fonction écrit une ligne chaînée (verrou sur la ligne de tête du journal pour sérialiser le chaînage).

**Refus tracés.** Une exception PostgreSQL annule toute la transaction, journal compris (RS-06). Donc : (1) les fonctions ne lèvent pas d'exception pour un refus métier, elles écrivent une ligne `refus` et renvoient un code ; (2) les refus des déclencheurs (écritures directes depuis NocoDB) sont tracés par le journal du serveur PostgreSQL (§8.11), conservé avec les sauvegardes.

**Préfixe de test (RS-27).** La base de test a `prefixe_identifiant = FT-TS` ; les PDF d'essai portent le filigrane « SPÉCIMEN ». Les 50 pièces de l'essai J06 sont réelles et vont en production (FT-PC).

### 4.5 Rôles PostgreSQL et matrice des droits

Aucun outil ne se connecte en superutilisateur ni en propriétaire. `postgres` (superutilisateur) : mot de passe au coffre, utilisé seulement pour créer les rôles. `arch_owner` : propriétaire des tables, `NOLOGIN` hors migration (chaque ouverture notée au journal d'exploitation). `arch_fonctions` : `NOLOGIN`, propriétaire des fonctions. Révoqués partout pour les rôles de connexion : `TRUNCATE`, `REFERENCES`, `TRIGGER`, `DELETE`.

| Table | `arch_nocodb` (NocoDB) | `arch_n8n` (n8n) | `arch_lecture` (H1–H6, rapports) | `arch_admin` |
|---|---|---|---|---|
| `pieces` | SELECT ; UPDATE des seules colonnes de tri (`date_piece`, `date_estimee`, `type_piece`, `tiers`, `numero_doc_tiers`, `montant_fcfa`, `sens`, `sans_montant`, `trie_par`, `pris_par`, `statut` pour T2) et de décision (`decision`, `motif_decision`, `valide_par`) | SELECT | SELECT | SELECT |
| `compteurs`, `journal_audit`, `refus`, `pieces_versions`, `fichiers_deposes`, `lots_depot` | SELECT | SELECT | SELECT | SELECT |
| `parametres`, `types_piece`, `sources_exercice`, `comptes_bancaires` | SELECT | SELECT | SELECT | SELECT (modification par migration) |
| `declarations_manquantes`, `demandes` | SELECT, INSERT | SELECT | SELECT | SELECT |
| `inventaire`, `plan_avancement`, `rapprochements_bancaires`, `ecarts_acceptes`, `controles_pieces` | SELECT, INSERT, UPDATE (colonnes de saisie ; `controles_pieces` en INSERT seul) | SELECT | SELECT | SELECT |
| `ecritures` | SELECT ; UPDATE (`piece_id_saisi`) | SELECT | SELECT | SELECT |
| `ecritures_import_brut`, `imports_ecritures` | SELECT | SELECT, INSERT (zone brute, ligne d'import `Recu`) | SELECT | SELECT |
| `erreurs_workflow` | SELECT | SELECT, INSERT | SELECT | SELECT, UPDATE (`statut`) |
| `resultats_integrite` | SELECT | SELECT | SELECT (écriture par `consigner_integrite`) | SELECT |
| Fonctions | — | EXECUTE (W01, W02, W05) | EXECUTE (`consigner_integrite`) | EXECUTE (administration) |

Les restrictions de NocoDB par rôle (§6) viennent en plus ; la base reste la protection de dernier ressort.

### 4.6 Arborescence sur disque

```
/srv/archive/
  depot/                 zone SFTP du poste (chroot) ; un lot _PRET est déplacé par W01 hors de cette zone
  entree/<id_lot>/        lots en cours d'ingestion (hors zone SFTP)
  objets/<sha256>.pdf     fichiers, root:root 0444, répertoire au bit collant
  quarantaine/<id_lot>/<sha256>.bin
  fichiers/Archive/AAAA/N_Type/MM_Mois/<nom>.pdf   liens vers objets/ (H2)
  fichiers/_versions/<id_piece>/<ancien nom>.pdf    anciens liens après correction
  imports/               zone SFTP du compte « imports » (chroot)
  registre_ids/AAAA.log  registre hors base (H3), ajout seul
  sauvegardes/           fichiers chiffrés avant envoi
  pgdata/                PostgreSQL
```
La racine `/srv/archive` est une variable d'environnement de n8n et des tâches de l'hôte, pas un paramètre modifiable dans NocoDB.

### 4.7 Règle de nommage (calculée en SQL)

`AAAA-MM-JJ_FT-PC-AAAA-NNNNN_type_tiers_montant.pdf` : `AAAA-MM-JJ` = `date_piece` ; `type` = `code_nom_fichier` ; `tiers` = translittération (é → e, œ → oe, æ → ae, ß → ss), minuscules, tout caractère hors `[a-z0-9]` remplacé par un tiret, tirets successifs fusionnés, tirets de début et de fin retirés, tronqué à 40 caractères puis tiret final retiré ; vide → refus à T2 ; `montant` = chiffres seuls, `sans-montant` si `sans_montant`, préfixe `avoir-` si `sens` = Avoir (Défaut D4). Chemin `Archive/AAAA/<types_piece.code>/<nom du mois>/`. Seul ce calcul produit des chemins ; aucun nom fourni par un humain ou par le poste n'entre dans un chemin (§8.4). Une pièce = un PDF ; un PDF de plusieurs pièces est rejeté (T4).

## 5. Workflows, tâches planifiées et contrôles

### 5.1 Workflows n8n (trois, plus l'alerte)

Règles communes : toutes les requêtes appellent une fonction ou utilisent des paramètres liés (`$1`, `$2`) ; aucune expression `{{ }}` dans le texte SQL (vérifié dans les exports JSON) ; nœud Execute Command désactivé ; accès disque limité à `/srv/archive` ; aucun appel vers un service extérieur autre que SMTP ; workflow d'erreur = W09 ; arrêt de la reprise automatique après 5 échecs sur le même objet.

**W01 — Ingestion d'un lot** (planifié toutes les 5 min ; humain avant : numérisation ; après : tri).
1. Lister `depot/` : un nom de lot qui ne respecte pas le format → lot `Erreur`, rien n'est lu. Un lot dont le code existe déjà avec un manifeste différent → refus (un redépôt volontaire prend un nouveau code).
2. Déplacer le lot prêt vers `entree/<id_lot>/` (le poste ne peut plus le modifier).
3. Pour chaque ligne du manifeste (sous-dossiers admis) : fichier déjà enregistré dans ce lot → sauté ; octets de tête différents de `%PDF-` → `Rejete_format` ; taille > maximum → `Rejete_taille` ; empreinte ≠ manifeste → `Rejete_transfert` ; sinon calcul SHA-256, copie vers `objets/<sha256>.pdf` (si absent), appel `enregistrer_fichier`. Les refusés vont en `quarantaine/<id_lot>/<sha256>.bin`.
4. Compteurs du lot, statut `Ingere` ou `Ingere_avec_ecarts`.
- **Reprise** : les lots `En_ingestion` non modifiés depuis 15 min et les lots `Erreur` sont repris ; le rejeu ne crée ni pièce ni doublon de plus.

**W02 — Décisions humaines** (planifié toutes les 2 min ; l'humain décide dans NocoDB).
Traite, dans l'ordre : pièces `A_valider` avec décision ; déclarations `A_traiter` ; demandes `A_traiter`. Pour chaque élément : contrôle des quatre yeux (§4.3), appel de la fonction correspondante, lecture du code de retour ; refus → message dans la ligne (`code_refus`) visible par l'auteur. Aucune écriture de fichier : la validation ne touche que la base ; H2 crée les liens. Rejouable : chaque fonction renvoie le même résultat pour un élément déjà traité.

**W05 — Import des écritures** (planifié toutes les 15 min sur `imports/`).
1. Fichier déjà importé (empreinte d'un import `Importe`) → ignoré.
2. Validation stricte par colonne : en-tête exact, UTF-8, `journal` `^[A-Z0-9]{1,6}$`, `numero_ecriture` `^[A-Za-z0-9-]{1,20}$`, `compte` `^[0-9]{2,12}$`, `piece_id` au format ADR-03 ou vide, entiers bornés, `libelle` ≤ 200 caractères et ne commençant pas par `= + - @`, équilibre débit = crédit par écriture, `source` égale à `sources_exercice` → sinon import `Rejete` en entier.
3. Chargement dans `ecritures_import_brut`, puis `appliquer_import` en **une** transaction : insertion ou mise à jour par clé naturelle sans toucher `piece_id_saisi`, `presente_dernier_import` recalculé, import `Importe`. Si l'import ferait perdre leur citation à plus de `seuil_import_confirmation` pièces ou à une pièce contrôlée : statut `A_confirmer`, appliqué seulement après confirmation du responsable de validation dans NocoDB.
- Une coupure avant la fin annule tout ; le rejeu repart de zéro, car l'empreinte n'est marquée importée qu'au statut `Importe`.

**W09 — Alerte d'échec et file d'erreurs.** Déclencheur d'erreur de n8n ; ligne `erreurs_workflow` ; courriel au développeur et au responsable de validation (SMTP) sans chemin, tiers ni montant ; au-delà de 5 erreurs par heure, un récapitulatif. Si n8n est arrêté, la sonde externe (§8.8) prend le relais.

**W08 (ouverture d'une pièce)** : supprimé comme webhook public ; remplacé par la route `/piece/<id>` (§8.2), servie par un webhook n8n joignable seulement depuis Nginx en `127.0.0.1`.

### 5.2 Tâches planifiées de l'hôte

Scripts versionnés, lancés par cron ou systemd, sous un utilisateur dédié sans droit sur `pgdata` ; ils ne passent jamais par un interpréteur de commandes avec des valeurs lues en base ; ils ne lisent que des identifiants numériques, des empreintes (`^[0-9a-f]{64}$`) et des chemins calculés par la base, qu'ils revalident (préfixe `/srv/archive/fichiers/Archive/` après normalisation).

| Tâche | Fréquence | Rôle |
|---|---|---|
| H1 Scellement | Chaque minute | Nouveaux objets → `root:root 0444` ; `chattr +i` si possible (à vérifier) |
| H2 Liens d'arborescence | Chaque minute | Crée les liens de `v_arborescence` ; déplace les anciens liens corrigés vers `_versions/` |
| H3 Registre des identifiants | Chaque minute | Ajoute les nouvelles attributions à `registre_ids/AAAA.log` ; envoie le segment chiffré sur GCS (nom unique) |
| H4 Sauvegarde | Chaque nuit à 1 h ; toutes les 2 h de 8 h à 20 h pendant S43–S44 (Défaut D9) | §8.6 |
| H5 Intégrité | Chaque nuit (pièces des 7 derniers jours) ; complète chaque dimanche | Recalcule les empreintes et compare à `pieces` **et** à `fichiers_deposes` ; fichiers sans pièce ; liens absents ; registre ≠ base ; écrit par `consigner_integrite` |
| H6 Disque et ancre | Toutes les 15 min (disque) ; chaque nuit (ancre) | Alerte au seuil de 80 % ; ancre du journal (§8.11) |

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
| Aide au tri | Editor | « File à trier » (sans les champs de décision) ; « Mes lots » |
| Comptable | Editor | « À valider » (avec doublons probables) ; « Déclarer une pièce manquante » (formulaire sur `declarations_manquantes`) ; « Justificatifs à rattacher » et « Corrections » (formulaires sur `demandes`) ; « Écritures à relier » (ne propose que les pièces `Classee` ou `Manquante`) ; « Inventaire » ; « Rapprochements » ; « Contrôles E01–E13 » ; « Recherche » |
| Responsable de validation | Editor | Vues du comptable + « Échantillon » ; « Imports à confirmer » ; « Écarts acceptés » ; « Annulations » ; tableau de bord |
| Direction | Viewer | Tableau de bord ; Recherche ; Manquantes à signer ; Contrôles |
| Développeur | Owner | Tout, plus `erreurs_workflow`, `refus`, `resultats_integrite` |

Vues de travail verrouillées ; **aucune vue ni formulaire partagé par lien public** ; inscription fermée (§8.2) ; recherche insensible à la casse et aux accents par `tiers_recherche` ; montants affichés avec séparateur, stockés sans. L'exportation CSV depuis NocoDB est réservée au développeur et au responsable de validation (Défaut D13).

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
- **Éditeur n8n non exposé** : accès par tunnel SSH pour le développeur seul. Nginx ne publie que le chemin nommé du webhook des devis du site ; les webhooks de l'archive ne sont joignables que depuis Nginx en `127.0.0.1`.
- NocoDB sur son sous-domaine en HTTPS, inscription fermée (variable à vérifier), partage public désactivé ou absent.
- **`/piece/<id>` et `/apercu/<n>`** (sous-domaine distinct de NocoDB) : authentification Nginx **avant** tout traitement ; `limit_req` ; format vérifié par Nginx (`^/piece/FT-(PC|TS)-[0-9]{4}-[0-9]{5}$`, `^/apercu/[0-9]{1,12}$`) ; requête transmise au webhook n8n interne avec le nom de l'utilisateur authentifié ; n8n lit l'empreinte par requête paramétrée et répond `X-Accel-Redirect: /_objets/<sha256>.pdf` vers un emplacement Nginx `internal` (en-tête de réponse personnalisé : à vérifier sur la version de n8n ; repli : liens `par-id/<id>.pdf` créés par H2 et servis par `alias`). Sans authentification : 401, sans `Location`, identique pour tout identifiant. Inconnu, mal formé, annulé : même 404 générique. Le chemin réel n'apparaît jamais au navigateur.
- En-têtes sur l'archive : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` ; sur les fichiers : `Content-Type: application/pdf` forcé, `Content-Disposition: inline`, `Content-Security-Policy: sandbox`.
- n8n et NocoDB à la dernière version corrective avant le go ; abonnement aux avis de sécurité.
- **Cloisonnement de n8n (ARC-041)** : webhook des devis protégé par un en-tête secret ; identifiants d'IA du site réservés à ses workflows (projets séparés si la version les gère) ; aucun workflow de l'archive ne contient de nœud vers un service extérieur hors SMTP (vérifié sur les exports). Option ultérieure : instance n8n dédiée.

### 8.3 Secrets
- Fichiers d'environnement `600 root` ; seul root dans le groupe `docker` (les variables sont lisibles par `docker inspect`).
- `N8N_ENCRYPTION_KEY` et le secret de NocoDB **fixés explicitement**, imprimés au coffre, vérifiés lors de la restauration (identifiants n8n lisibles).
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` ; aucun secret écrit en dur dans un nœud ; exports de workflows passés à `gitleaks` avant tout commit.
- **Jetons NocoDB (SEC-11)** : n8n n'utilise aucun jeton NocoDB pour l'archive (SQL direct) ; s'il en faut un pour lire le journal d'activité de NocoDB, il vient d'un compte en lecture seule sur la base de l'archive. Le jeton du site est recréé depuis un compte de service NocoDB limité à la base du CRM des devis ; l'ancien est révoqué ; essai : ce jeton ne lit aucune table de l'archive. Cette action modifie la configuration de production du site : elle se fait avec l'accord explicite de la Direction (ARC-045).
- Clé privée de déchiffrement des sauvegardes : jamais sur le VPS (§8.6).
- Rotation de tous les secrets utilisés pendant la construction le 30 ou 31 octobre et à chaque départ.

### 8.4 Entrées non fiables
- **Chemins** : seuls `objets/<sha256>`, `quarantaine/<id_lot>/<sha256>`, `entree/<id_lot>/` et les chemins calculés en SQL (§4.7) sont utilisés ; `nom_origine`, `code_lot`, `tiers` n'entrent jamais dans un chemin ; contraintes `CHECK` sur les référentiels ; vérification du préfixe absolu avant toute écriture.
- **Commandes** : nœud Execute Command désactivé (`NODES_EXCLUDE`, par défaut sur les versions récentes : à vérifier) ; empreinte par le nœud Crypto ou le nœud Code avec le module `crypto` (à vérifier) ; `pg_dump` et opérations système dans les tâches de l'hôte seulement.
- **SQL** : requêtes paramétrées ou fonctions ; essai avec apostrophe, point-virgule, guillemets et chaîne SQL dans `tiers` et `libelle`.
- **CSV d'écritures** : dépôt par un compte SFTP « imports » distinct, réservé au comptable, chroot sans shell ; `depose_par` enregistré ; validation stricte (§5.1 W05) ; confirmation au-delà du seuil.
- **Injection de formules** : à l'export, toute cellule texte commençant par `= + - @`, tabulation ou retour chariot est préfixée d'une apostrophe ; à la saisie, `tiers` ne peut pas commencer par ces caractères ; à l'import, `libelle` est refusé dans ce cas.
- **Poste et SFTP** : compte `internal-sftp` chroot, sans shell ni redirection de ports, clé dédiée au poste et révocable, quota disque ; disque du poste chiffré (BitLocker si Windows, à confirmer) ; script versionné sans mot de passe ; lot `_PRET` déplacé immédiatement hors de la zone SFTP.
- **Fichiers** : type reconnu par les octets de tête ; taille maximale 20 Mo dès le premier lot (Défaut D4) ; pièces ouvertes dans le lecteur du navigateur ; lecteurs PDF des postes à jour.

### 8.5 Droits sur les fichiers
`depot/` : compte SFTP du poste ; `imports/` : compte SFTP « imports » ; `entree/`, `quarantaine/`, écriture initiale dans `objets/` : utilisateur du conteneur n8n ; `objets/` scellés par H1 ; `fichiers/` : liens créés par H2, lecture par Nginx seulement par `internal`. Aucun accès direct à `/fichiers/` par URL : tout passe par `/piece/<id>`.

### 8.6 Sauvegarde 3-2-1

| Copie | Support | Lieu | Contenu | Fréquence |
|---|---|---|---|---|
| 1 | SSD du VPS | Datacentre Hostinger | Production | Continu |
| 2 | Bucket GCS | Hors site | Objets nouveaux, registre, journaux PostgreSQL et Nginx, puis dump des bases (`archive_compta` et métadonnées NocoDB et n8n), chiffrés | H4 : nuit + toutes les 2 h en S43–S44 (Défaut D9) ; registre chaque minute |
| 3 | Disque externe chiffré | Bureau, débranché, sous clé | Copie **incrémentale** des objets chiffrés depuis GCS (seulement les nouveaux, empreinte vérifiée) | Chaque vendredi |

- **Chiffrement à clé publique** (`age` ou `gpg`, à installer : à vérifier) : le VPS n'a que la clé publique ; la clé privée est imprimée en deux exemplaires au coffre (deux lieux) et n'est sortie que le temps d'une restauration.
- **Ordre** : fichiers d'abord, dump ensuite ; la vérification de restauration contrôle que chaque objet cité par le dump existe dans la copie. `entree/` et `registre_ids/` sont inclus.
- **GCS** : noms d'objets uniques (date, heure, empreinte), jamais réécrits ; création avec précondition « n'existe pas » (un objet déjà présent = succès) ; compte de service avec le seul droit de création d'objets (rôle exact à vérifier) ; essai consigné : une suppression **et** un écrasement échouent ; règle de rétention sur le bucket (Défaut D9 : 400 jours pour les dumps ; fichiers : durée de conservation légale, D14), **verrouillée** une fois la durée confirmée (J12) ; accès public interdit ; accès uniforme ; versionnement activé ; double authentification sur le compte propriétaire.
- **Copie 3** : identifiant GCS en **lecture seule**, distinct, sur le seul poste qui fait la copie ; les fichiers étant déjà chiffrés, le disque l'est aussi par BitLocker (à confirmer selon le système).
- Les instantanés Hostinger (à vérifier) réduisent la durée de restauration mais ne comptent pas comme copie.

### 8.7 Restauration et recalage
Procédure écrite (ARC-015) : machine de restauration à disque chiffré (environnement de test du VPS ou machine dans le nuage ; le poste du bureau ne sert qu'à lire un échantillon) ; clé privée sortie du coffre ; restauration des objets puis du dump ; **recalage obligatoire (ADR-03)** ; vérifications : comptes par statut, compteurs = maximum observé, 20 empreintes, 3 pièces ouvertes par `/piece/<id>`, identifiants n8n lisibles ; durée notée ; effacement des données restaurées hors VPS noté au procès-verbal. Restaurations complètes : avant l'archivage en masse (ARC-015) et le 30 octobre (ARC-034).

### 8.8 Supervision et objectifs de reprise
Sonde externe gratuite (service de surveillance HTTP, à choisir, D14) **avant le go**, sur NocoDB et sur `/piece/` (401 attendu) ; alerte disque H6 ; W09. Objectifs (Défaut D9) : perte maximale admise (RPO) 2 h pendant S43–S44 et 24 h ensuite, registre des identifiants à 1 minute ; durée de restauration (RTO) 1 jour ouvré. Supervision interne W11, rapport W10 et restauration automatique W07b : reportés (§11).

### 8.9 Environnement de test
Composition Docker sur le poste du développeur (ports liés à `127.0.0.1`, mots de passe propres, jamais réutilisés en production), mêmes versions, `prefixe_identifiant = FT-TS`, PDF fictifs marqués « SPÉCIMEN » ; aucune pièce réelle sur un poste non chiffré.

### 8.10 Mode dégradé
Coupure réseau : la numérisation continue, l'envoi reprend ; coupure électrique : onduleur (à acheter), lot renvoyé entier ; serveur indisponible : lots locaux conservés jusqu'à `Ingere` et sauvegarde suivante, papier conservé ; reprise automatique des lots `En_ingestion`. Aucun papier détruit avant la réponse J12.

### 8.11 Journaux
- **Journal d'audit chaîné dès le go** : ancre de la nuit (dernière empreinte et nombre de lignes) écrite par H6 dans un objet GCS sous rétention et dans un courriel à la Direction ; toute réécriture par un administrateur devient détectable. Le développeur administrateur ne peut être qu'observé, pas empêché (Défaut D7).
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
| US-ARC-05 | `declarations_manquantes`, `declarer_piece_manquante`, `rattacher_justificatif` | Couverte ; texte de l'attestation (D14) ; relances automatiques reportées |
| US-ARC-06 | Script du poste, W01, ADR-05 | Couverte |
| US-ARC-07 | `rapprochements_bancaires`, `v_rapprochements`, E09 | Partielle, Défaut D8 : solde comptable calculé, appariement ligne à ligne dans l'état joint |
| US-ARC-08 | `v_balance` → écritures → `/piece/<id>` | Couverte depuis le compte ; « poste du bilan → comptes » avec la balance, hors outil |
| US-ARC-09 | F4 | **Hors périmètre du 31 octobre, Défaut D6** ; repli : dépôt manuel des PDF |
| US-ARC-10 | `date_fin_conservation`, aucune suppression | Partielle : durée non confirmée (D14) ; alerte reportée |
| US-ARC-11 | `v_tableau_bord`, `plan_avancement` | Couverte (vue) ; courriel quotidien reporté |
| US-SYS-08 | W09, `erreurs_workflow`, sonde externe | Couverte |
| US-SYS-10 | §8.9, préfixe FT-TS | Couverte |
| US-SYS-11 | CSV par table protégés, PDF, dump | Couverte (ARC-033) |
| US-DIR-05 | Aucune suppression ; rétention GCS ; papier conservé | Partielle (D14 ; 3 ans contre 10 ans à trancher) |
| Critère 1 | `inventaire`, E11, E07, E10 | Couverte par comptage (pas pièce par pièce) |
| Critère 2 | E01, E02, E12 ; justification Défaut D5 | Couverte si l'export d'écritures est complet |
| Critère 3 | E01, E03, E04 (délai 0 à J14) ; saisie calculée | Couverte |
| Critère 4 | `v_echantillon` stratifié, `/piece/<id>` | Couverte ; tolérance D15 ; mesure J14 |
| Critère 5 | H4, chiffrement, ARC-015, ARC-034, recalage | Couverte |
| Critère 6 | ADR-03, registre hors base, recalage, E05 | Couverte, y compris après restauration |
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

Hypothèses ouvertes : versions et installation de n8n et NocoDB ; espace disque ; système du poste ; outils `age` et `chattr` ; rôle GCS exact et offre de rétention ; outil de sonde ; liste nominative des utilisateurs.

## 11. Reportés

| Constat | Ce qui est reporté | Raison |
|---|---|---|
| RS-35 | W10 (courriel quotidien), W11 (supervision interne), W07b (restauration automatique hebdomadaire) | Les vues, la sonde externe, H6 et les deux restaurations manuelles tiennent le critère 5 ; à faire après le 31 octobre |
| RS-11 | Migration des métadonnées de NocoDB et de n8n vers PostgreSQL | Hors périmètre de la fiche ; volumes persistants suffisants en S42 |
| RS-09 (partie) | Relances automatiques des demandes de duplicata (W04) | La vue E07 suffit pour J13 |
| RS-06 (partie) | Identité nominative garantie par la base | Impossible sans changement d'outil ; D7 |
| SEC-20 (partie) | Ne plus journaliser le corps des réponses NocoDB dans le code du site (`api/lib/nocodb.js`) | Hors des deux fichiers et hors du périmètre de l'archive ; tâche ARC-052 |
| SEC-23 | `.gitignore` (`.env.*`, clés, exports) et port de développement lié à `127.0.0.1` dans `docker-compose.yml` | Autres fichiers ; tâche ARC-052 avec accord |
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
| D7 | Compte NocoDB réel si disponible ; sinon déclaratif, risque signé ; développeur observé par l'ancre du journal |
| D8 | Rapprochement calculé par le comptable, état joint ; solde comptable calculé dans l'outil ; relevés `5_Banque` dans le périmètre |
| D9 | RPO 2 h en S43–S44, 24 h ensuite ; RTO 1 jour ouvré ; chiffrement par clé publique ; rétention des dumps 400 jours ; disque et onduleur achetés avant le 14 |
| D10 | Contrôleur ≠ trieur et ≠ saisisseur |
| D11 | Correction versionnée, appliquée par le responsable de validation ; changement d'année = annulation et nouvelle pièce |
| D12 | Noms de mois sans accents (`02_Fevrier`) ; codes de type de §4.2 |
| D13 | Liste nominative signée ; exportation réservée au développeur et au responsable de validation ; retrait de droits immédiat |
| D14 | Texte de l'attestation à fournir ; sonde externe gratuite ; IA désactivée ; conservation en attente de J12 |
| D15 | 30 sur 30 à l'échantillon ; REC-039 requalifié (parade `pris_par`) |
| D16 | Une source d'écritures par exercice ; balance F1b facultative |
