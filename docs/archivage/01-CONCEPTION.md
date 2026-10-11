# Archivage comptable — Conception (n8n + NocoDB)

Version 0.1 du 11 octobre 2026, rédigée par l'architecte de la chaîne de conception. Ce document s'appuie sur la fiche de cadrage `00-FICHE-CADRAGE.md`, qui fait foi. Conventions : « Hypothèse » signale un fait non établi ; « À confirmer » signale une décision qui revient à un humain ; « À vérifier sur la version installée » signale une capacité de n8n ou de NocoDB que l'architecte n'a pas pu vérifier.

## 1. Résumé

1. Les données de l'archive (index des pièces, compteurs, écritures importées, contrôles, journal) vivent dans une base PostgreSQL dédiée, `archive_compta`, avec un volume persistant ; NocoDB sert d'écran au-dessus de cette base, n8n automatise.
2. Les fichiers sont rangés sur le disque du serveur, selon l'arborescence et le nom figés ; une copie part chaque nuit sur Google Cloud Storage et une autre chaque semaine sur un disque externe au bureau (règle 3-2-1).
3. L'identifiant `FT-PC-AAAA-NNNNN` est attribué par une seule fonction SQL qui verrouille le compteur de l'année et écrit l'identifiant sur la pièce dans la même transaction : ni doublon, ni trou, même avec des exécutions n8n simultanées.
4. Un humain valide chaque classement avant l'attribution d'identifiant ; le système refuse les transitions d'état non autorisées, interdit la suppression et garde un journal en ajout seul.
5. Le lien avec l'ERP passe par un fichier CSV d'écritures au format fixe ; l'option A (l'ERP enregistre `piece_id` sur chaque écriture) est recommandée, l'option B (correspondance saisie dans NocoDB) sert de repli. Aucune intelligence artificielle n'est nécessaire.

**Écart avec le programme d'exécution.** Le programme v0.2 (§3.3) plaçait l'index des pièces dans la base de l'ERP. La décision du 11 octobre (fiche §2) le place dans n8n + NocoDB. Conséquences : le journal d'audit, les droits et la règle des quatre yeux de l'ERP ne s'appliquent pas à l'archive et sont reconstruits ici (§4.4, §8) ; le jalon J08 devient « champ `piece_id` dans l'ERP et ouverture de la pièce depuis l'écriture », sans table de pièces propre à l'ERP (une seule source de vérité des pièces : l'archive).

## 2. Architecture

### 2.1 Composants

| Composant | Rôle | Emplacement | État connu |
|---|---|---|---|
| n8n | Automatisation : ingestion, attribution, rangement, imports, contrôles, sauvegardes, alertes | VPS Hostinger KVM2 | En place (fiche §2) ; version, mode d'installation et base interne inconnus : **à relever (ARC-001)** |
| NocoDB | Écrans : files de travail, formulaires, vues filtrées, tableau de bord | VPS | En place ; a perdu ses données en juin 2026 faute de volume persistant |
| PostgreSQL `archive_compta` | Données de l'archive, règles d'intégrité (contraintes, déclencheurs, fonction d'attribution) | VPS, conteneur ou instance dédiée, volume persistant | À créer |
| PostgreSQL `nocodb_meta`, `n8n` | Métadonnées de NocoDB et de n8n (définitions de vues, workflows, identifiants chiffrés) | Même instance PostgreSQL, bases séparées | À créer ou migrer (Hypothèse : aujourd'hui SQLite ou base interne non persistante) |
| Stockage des fichiers | `/srv/archive/` : `depot/`, `a_trier/`, `quarantaine/`, `fichiers/Archive/…`, `imports/`, `sauvegardes/` | Disque du VPS | À créer ; espace libre inconnu : **à relever (ARC-001)** |
| Nginx | HTTPS, accès authentifié en lecture seule aux fichiers, journal des accès | VPS, déjà installé pour le site | En place |
| Poste de numérisation | Scanner ou smartphone, dossier local d'envoi, script d'envoi de lot | Bureau Foga-Tech | Matériel à confirmer |
| ERP SFP Suite BTP | Comptabilité ; cite `id_piece` sur les écritures (option A) ; produit le CSV des écritures | Poste du développeur, puis VPS (J07) | Code non accessible : contrat §7 à confirmer |
| Sauvegardes | Copie 2 : bucket Google Cloud Storage ; copie 3 : disque externe au bureau | Hors VPS | Abonnement GCS cité (11 883 FCFA/an), bucket à créer ; disque à acheter (prix non chiffré) |

### 2.2 Flux d'une pièce, de la collecte au contrôle

1. **Collecte** (humain : aide au tri). La pièce papier est numérisée en un PDF par pièce dans le dossier local `A_ENVOYER/LOT-AAAAMMJJ-HHMM-POSTE/` du poste. Le papier reçoit au crayon le code du lot et reste dans une boîte au nom du lot.
2. **Envoi** (humain lance, script exécute). Le script calcule l'empreinte SHA-256 de chaque fichier, écrit `manifest.csv`, copie le lot vers `/srv/archive/depot/` par SFTP, puis dépose le fichier `_PRET` en dernier. Une coupure réseau interrompt la copie ; la relance reprend sans doublon.
3. **Ingestion** (système, W01). n8n voit `_PRET`, vérifie chaque empreinte contre le manifeste, écarte les doublons exacts, copie chaque nouveau fichier dans `a_trier/<empreinte>.pdf` et crée une ligne `pieces` au statut `A_trier`, sans identifiant.
4. **Tri** (humain : aide au tri ou comptable). Dans la vue « File à trier », l'humain ouvre l'aperçu, saisit date, type, tiers, montant, numéro du document chez le tiers, puis passe la pièce à `A_valider`.
5. **Validation** (humain : comptable ou responsable de validation, différent de la personne qui a trié). Dans la vue « À valider », l'humain choisit « Valider » ou « Renvoyer » (motif obligatoire). Un avertissement signale un doublon probable (même tiers, date, montant, numéro de document).
6. **Attribution et rangement** (système, W02). n8n appelle la fonction SQL `attribuer_id_piece` (identifiant écrit dans la même transaction), copie le fichier sous son nom définitif dans `fichiers/Archive/AAAA/N_Type/MM_Mois/`, relit l'empreinte, puis passe la pièce à `Classee`.
7. **Saisie dans l'ERP** (humain : comptable). L'écriture cite l'identifiant (option A) ; ou le comptable relie l'écriture importée à la pièce dans NocoDB (option B).
8. **Import des écritures** (système, W05). Le CSV des écritures est importé ; chaque pièce citée passe à `Saisie_ERP`.
9. **Contrôles inverses** (système, W06 ; humain corrige). Écritures sans pièce, pièces saisies sans écriture, identifiants cités inconnus, trous de numérotation, fichiers absents ou modifiés : chaque anomalie devient une ligne `ecarts` avec un responsable.
10. **Contrôle** (humain : responsable de validation). Échantillon de 30 pièces par année, puis passage à `Controlee`.

### 2.3 Schéma

```
 POSTE DE NUMÉRISATION (bureau)                VPS HOSTINGER KVM2
 +---------------------------+   SFTP    +---------------------------------------------+
 | scanner -> A_ENVOYER/LOT/ |---------->| /srv/archive/depot/LOT-.../  (+ _PRET)      |
 | manifest.csv (SHA-256)    |  reprise  |        |                                    |
 +---------------------------+           |        v W01 ingestion                      |
          ^                              | /srv/archive/a_trier/<sha256>.pdf           |
          | disque externe (copie 3,     |        |                                    |
          | hebdomadaire, hors ligne)    |  NocoDB (écrans) <--> PostgreSQL            |
          |                              |    vues, formulaires   archive_compta       |
 +--------+------------------+           |                        - pieces, compteurs  |
 | NAVIGATEUR                |  HTTPS    |                        - attribuer_id_piece |
 | comptable, aide au tri,   |<--------->|  Nginx (auth)          - journal_audit      |
 | validation, Direction     |           |    /fichiers/ lecture   nocodb_meta, n8n    |
 +---------------------------+           |        |                                    |
                                         |        v W02 rangement                      |
 +---------------------------+  CSV      | /srv/archive/fichiers/Archive/AAAA/N_Type/  |
 | ERP SFP Suite BTP         |---------->| /srv/archive/imports/  -> W05 -> ecritures   |
 | écriture.piece_id (opt. A)|<-- lien --| W08 « ouvrir pièce » (redirection)          |
 +---------------------------+           |  W06 contrôles -> ecarts ; W09 alertes      |
                                         |  W07 sauvegarde -----------+                |
                                         +----------------------------|----------------+
                                                                      v
                                              Google Cloud Storage (copie 2, hors site)
```

## 3. Décisions d'architecture (ADR)

### ADR-01 — Base sous-jacente de NocoDB et persistance

**Contexte.** NocoDB a perdu ses données en juin 2026 faute de volume persistant. L'archive doit garantir l'unicité et la continuité des identifiants, interdire la suppression et tenir un journal en ajout seul. NocoDB peut stocker ses tables dans sa propre base (SQLite par défaut, ou PostgreSQL via sa variable de connexion) ou se connecter à une base externe existante (« source de données externe », **à vérifier sur la version installée**). PostgreSQL 16 est déjà prévu sur le VPS pour le site (`docs/DEPLOY-KVM2.md`).

| Option | Avantages | Inconvénients |
|---|---|---|
| 1. SQLite interne de NocoDB, fichier sur volume | Rien à installer | Pas de verrou de ligne ni de fonction transactionnelle exploitable par n8n ; accès concurrent limité ; contraintes et déclencheurs gérés par NocoDB seul ; c'est le montage qui a déjà échoué |
| 2. PostgreSQL comme base interne de NocoDB (tables créées par NocoDB) | Une seule base ; persistance correcte avec volume | Les noms et la structure des tables sont gérés par NocoDB (préfixes, schémas : à vérifier) ; ajouter nos contraintes à la main est fragile lors des mises à jour de NocoDB |
| 3. **Base PostgreSQL dédiée `archive_compta`, créée et versionnée par nous, branchée sur NocoDB comme source externe** ; métadonnées de NocoDB et de n8n dans des bases PostgreSQL séparées de la même instance | Règles d'intégrité dans la base (contrainte d'unicité, déclencheurs, fonction d'attribution), valables quel que soit l'outil qui écrit ; n8n parle SQL directement ; schéma versionné en fichiers de migration ; sauvegarde par `pg_dump` | Dépend de la prise en charge des sources externes par NocoDB (à vérifier) ; quelques fonctions de NocoDB peuvent être limitées sur une source externe (à vérifier) ; schéma à maintenir par le développeur |

**Recommandation : option 3.** Instance PostgreSQL 16 dédiée à l'archive (conteneur ou service séparé de la base du site, Hypothèse : n8n et NocoDB tournent en conteneurs Docker), données dans un répertoire hôte `/srv/archive/pgdata` monté en volume. Avant tout usage : redémarrage complet du serveur, puis vérification que les tables, les vues NocoDB et les workflows n8n sont toujours présents (critère de ARC-005). n8n utilise aussi PostgreSQL pour sa propre base (configuration de base de données de n8n : à vérifier sur la version installée) ; sa clé de chiffrement des identifiants est sauvegardée à part.

**Si l'option 3 n'est pas possible** (source externe absente de la version installée) : option 2, avec les contraintes ajoutées par migration SQL sur les tables créées par NocoDB et un test de non-régression après chaque mise à jour de NocoDB.

**Coût de se tromper.** Option 1 retenue à tort : perte de données ou identifiants en double, c'est-à-dire l'échec des critères 5 et 6. Option 3 retenue à tort (fonction absente) : une demi-journée perdue avant de basculer sur l'option 2.

### ADR-02 — Emplacement des fichiers

**Contexte.** Trois candidats cités : disque du VPS, Google Cloud Storage (GCS), Google Drive. Volume inconnu jusqu'au 13 octobre. Réseau du bureau instable. Espace disque du VPS inconnu (le guide de déploiement cite « min. 100 GB SSD », non vérifié sur la machine réelle).

| Option | Avantages | Inconvénients |
|---|---|---|
| 1. **Disque du VPS comme emplacement principal** | Lecture et écriture locales pour n8n (nœuds de fichiers) ; ouverture rapide via Nginx ; aucune dépendance réseau entre n8n et les fichiers ; droits Unix simples | Capacité limitée au disque ; un seul site physique, donc copie hors site indispensable |
| 2. GCS comme emplacement principal | Capacité extensible ; versionnement et rétention d'objets (à vérifier selon l'offre souscrite) | Chaque opération de n8n passe par le réseau ; droits par compte de service ; coût au volume non chiffré ; ouverture d'une pièce plus complexe (liens signés) |
| 3. Google Drive | Familier ; consultation facile | Renommages et déplacements faits à la main hors contrôle ; doublons de noms permis ; droits de partage trop permissifs ; quotas d'API ; aucune garantie que le chemin indexé reste vrai |

**Recommandation : option 1 pour l'emplacement principal, GCS pour la copie hors site** (ADR-07 du §8.4). Google Drive n'est pas utilisé pour l'archive. Seuil d'alerte disque : 80 % (paramètre). Si l'inventaire (J02) montre un volume qui dépasse la capacité du disque, l'option 2 redevient candidate ; la structure `chemin` relatif dans l'index rend ce changement possible sans toucher aux identifiants.

**Coût de se tromper.** Disque saturé en pleine semaine S43 : arrêt de l'ingestion ; mesure préventive : relevé d'espace à ARC-001 et alerte à 80 %. Drive retenu à tort : chemins faux dans l'index, critère 4 (retrouver en moins de 2 minutes) compromis.

### ADR-03 — Attribution atomique et sans trou de `FT-PC-AAAA-NNNNN`

**Contexte.** Plusieurs exécutions n8n peuvent valider des pièces en même temps (deux personnes valident à la même minute, une relance après erreur). L'API de NocoDB n'expose pas de compteur transactionnel. « Sans trou » signifie ici : pour chaque année, tout numéro de 1 au dernier attribué correspond à exactement une ligne `pieces`, qui n'est jamais supprimée (une pièce attribuée par erreur passe à `Annulee` et garde son numéro). « Année » = année de `date_piece` (Hypothèse, **à confirmer à J04** : on pourrait aussi retenir l'année de l'exercice ou l'année d'archivage).

| Option | Pourquoi elle échoue ou réussit |
|---|---|
| 1. n8n lit le plus grand numéro via l'API NocoDB et ajoute 1 | Deux exécutions simultanées lisent le même maximum : doublon. Rejetée |
| 2. Champ « numéro automatique » de NocoDB (séquence de la base) | Une séquence PostgreSQL n'est pas sans trou (une transaction annulée consomme un numéro) et n'est pas remise à zéro par année. Rejetée |
| 3. Forcer n8n à une seule exécution à la fois (file unique, limite de concurrence) | Dépend d'un réglage de n8n (à vérifier sur la version installée) ; une panne entre l'incrément et l'écriture laisse un trou ; ne protège pas d'une écriture faite depuis NocoDB. Rejetée comme mécanisme principal |
| 4. **Fonction PostgreSQL unique qui verrouille la pièce et la ligne du compteur de l'année, incrémente, écrit l'identifiant sur la pièce et le journal, le tout dans une seule transaction** | Le verrou de ligne fait attendre la seconde exécution ; si quoi que ce soit échoue, toute la transaction est annulée, compteur compris : ni trou ni doublon. Retenue |

**Recommandation : option 4**, complétée par des garde-fous dans la base :
- contrainte d'unicité sur `pieces.id_piece` et contrainte de format `^FT-PC-[0-9]{4}-[0-9]{5}$` ;
- déclencheur qui interdit de modifier un `id_piece` déjà renseigné et de supprimer une ligne `pieces` ;
- déclencheur qui interdit de diminuer `compteurs.dernier` ;
- contrôle W06 qui recompte chaque jour : pour chaque année, nombre de pièces numérotées = `dernier`, et aucun numéro manquant entre 1 et `dernier`.

Logique de la fonction (pseudo-code, à écrire en PL/pgSQL à ARC-007) :

```
attribuer_id_piece(p_piece, p_acteur, p_execution) -> texte
  début de transaction (implicite : un appel de fonction est une transaction)
  lire la pièce p_piece en la verrouillant (SELECT … FOR UPDATE)
  si la pièce a déjà un id_piece : renvoyer cet id_piece (appel rejoué = même réponse)
  si le statut n'est ni A_valider avec décision « Valider », ni Manquante sans id : erreur
  si date_piece, type, tiers ou montant manquent : erreur
  annee := année de date_piece
  insérer la ligne compteurs(annee, 0) si elle n'existe pas (sans erreur si elle existe)
  incrémenter compteurs.dernier pour annee et lire la nouvelle valeur (UPDATE … RETURNING)
    -> le verrou de ligne sérialise les appels simultanés pour la même année
  si valeur > 99999 : erreur (capacité du format dépassée)
  id := 'FT-PC-' || annee || '-' || valeur sur 5 chiffres
  écrire id sur la pièce ; statut := Classement_en_cours (ou reste Manquante)
  écrire une ligne journal_audit (action ATTRIBUTION, acteur, exécution n8n)
  renvoyer id
```

Le rangement du fichier vient après l'attribution, hors transaction. S'il échoue, la pièce reste à `Classement_en_cours` avec son identifiant : ce n'est pas un trou (le numéro est porté par une pièce réelle) et W02 rejoué termine le rangement.

**Coût de se tromper.** Un doublon ou un trou casse le critère 6 et la confiance dans toute la série ; une correction a posteriori obligerait à renommer des fichiers déjà cités par des écritures. C'est la décision la plus coûteuse de la conception : complexité L4, tests de concurrence obligatoires (ARC-007).

### ADR-04 — Lien avec l'ERP

**Contexte.** On ignore si l'ERP a un champ « numéro de pièce » et s'il sait exporter ses écritures (fiche §8). On ignore aussi où sont aujourd'hui les écritures des trois exercices (Excel, papier, logiciel, expert-comptable : réponse attendue à J02b) et comment elles seront reprises (J04b). Le contrat doit donc fonctionner quelle que soit la source des écritures.

| Option | Description | Avantages | Inconvénients |
|---|---|---|---|
| A. **L'ERP stocke `id_piece` sur chaque écriture** | Champ `piece_id` (ou motif de pièce manquante) obligatoire au point d'écriture unique `comptabilisation.py` ; l'ERP exporte ses écritures avec ce champ ; lien cliquable vers la pièce | Le comptable cite la pièce au moment de la saisie (US-ARC-02) ; aucune double saisie ; lien dans les deux sens | Modification du code de l'ERP, non vu ; dépend de la mise en ligne de l'ERP (J07, J08) |
| B. Rapprochement par export CSV | L'ERP (ou l'Excel du comptable) exporte ses écritures sans numéro de pièce ; le comptable relie chaque écriture importée à sa pièce dans NocoDB | Aucune modification de l'ERP ; fonctionne même si l'ERP n'est pas en ligne | Double travail pour le comptable ; une ré-saisie dans l'ERP peut changer la clé de l'écriture et casser le lien ; US-ARC-02 non couverte dans l'ERP |

**Recommandation : option A comme cible, avec le même format CSV que l'option B** (§7). Dans les deux cas, l'archive importe le CSV des écritures pour faire les contrôles inverses : l'option A ne dispense pas de l'import. Décision ferme au plus tard le jeudi 15 octobre, après lecture du code de l'ERP par le développeur (ARC-018), pour tenir le go ou no-go du 16. Si l'option A n'est pas livrée le 19 octobre, bascule sur l'option B sans changer l'archive : seule la colonne utilisée change (`piece_id_cite` ou `piece_id_saisi`).

**Coût de se tromper.** A choisie et non livrée : J09b glisse ; le repli B coûte du temps de comptable (non chiffrable avant J04b). B choisie à tort : saisie double pendant trois exercices et liens fragiles.

### ADR-05 — Détection des doublons

**Contexte.** Une même pièce peut arriver deux fois : même fichier envoyé deux fois (lot relancé), ou même papier numérisé deux fois (deux fichiers différents octet par octet). L'empreinte SHA-256 ne détecte que le premier cas.

| Option | Détecte | Limite |
|---|---|---|
| 1. Empreinte SHA-256 du fichier, bloquante | Fichier identique | Ne voit pas un second scan du même papier |
| 2. Clé métier (type, tiers normalisé, date, montant, numéro du document chez le tiers), bloquante | Second scan du même papier | Faux positifs : deux reçus réels identiques le même jour |
| 3. Empreinte d'image perceptuelle ou lecture du texte | Scans proches | Outils à installer ; IA ou OCR hors périmètre du MVP |

**Recommandation : option 1 bloquante + option 2 en avertissement.** L'empreinte est unique en base (`pieces.empreinte_sha256`) ; un fichier déjà connu n'ouvre pas de nouvelle pièce (il est noté `Doublon_exact` dans `fichiers_deposes`). La clé métier ne bloque pas : la vue « À valider » affiche les doublons probables et le valideur décide (rejet ou validation avec commentaire). L'empreinte sert aussi au contrôle d'intégrité (fichier modifié après rangement).

**Coût de se tromper.** Doublon non vu : deux identifiants pour une seule pièce, une écriture comptée deux fois au contrôle d'échantillon ; corrigeable par annulation d'un des deux identifiants. Blocage à tort sur la clé métier : pièce réelle refusée, plus grave ; d'où l'avertissement seulement.

### ADR-06 — Intelligence artificielle optionnelle

**Contexte.** IA externe non autorisée à ce jour (fiche §8). Le système doit fonctionner sans.

| Option | Description |
|---|---|
| 1. **Aucune IA dans le MVP** ; champs de proposition prévus dans le schéma | Tout est saisi par l'humain ; les champs `proposition_*` restent vides |
| 2. Lecture de texte locale (OCR sur le serveur) | Données restant sur le serveur ; outil à installer et à évaluer ; qualité inconnue sur les reçus manuscrits |
| 3. Extraction par un service d'IA externe | Gain de temps possible ; données comptables sortant de l'entreprise ; décision de la Direction requise (J19) |

**Recommandation : option 1 pour le 31 octobre.** Paramètre `ia_extraction_active = faux`. Si la Direction l'autorise plus tard, un workflow W12 remplit seulement les champs `proposition_*` et `source_proposition` ; l'IA n'attribue jamais d'identifiant, ne change jamais de statut et ne valide rien ; la saisie humaine reste obligatoire. Coupure de l'option = passer le paramètre à faux, sans autre changement.

**Coût de se tromper.** Faible tant que l'option reste désactivée. Activée sans décision : fuite de données comptables et personnelles (risque du programme §9).

## 4. Modèle de données

Toutes les tables sont dans la base PostgreSQL `archive_compta` (ADR-01) et affichées dans NocoDB. Type NocoDB = type d'affichage réglé dans NocoDB au-dessus du type PostgreSQL. Aucun montant décimal : FCFA entiers. Horodatage en `timestamptz`, affiché en Africa/Brazzaville.

### 4.1 Table `pieces` (une ligne par pièce, jamais supprimée)

| Champ | Type PG → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `id` | bigint identité → ID | oui | clé technique | 4812 |
| `id_piece` | text → SingleLineText | dès `Classement_en_cours` ou `Manquante` | unique ; format `^FT-PC-[0-9]{4}-[0-9]{5}$` ; non modifiable une fois écrit ; écrit seulement par `attribuer_id_piece` | FT-PC-2025-00017 |
| `statut` | text → SingleSelect | oui | liste §4.3 ; transitions contrôlées par déclencheur | Classee |
| `date_piece` | date → Date | dès `A_valider` | entre le 1er janvier de la plus ancienne année ouverte et aujourd'hui | 2025-03-14 |
| `type_piece` | text → Links vers `types_piece` | dès `A_valider` | code existant et actif | 1_Factures-fournisseurs |
| `tiers` | text → SingleLineText | dès `A_valider` | 2 à 80 caractères | SOCOFER SARL |
| `numero_doc_tiers` | text → SingleLineText | non | numéro de facture ou de reçu chez le tiers | F-2025-0331 |
| `montant_fcfa` | bigint → Number | dès `A_valider` | entier ≥ 0 (0 admis pour un contrat sans montant) | 450000 |
| `nature_justificatif` | text → SingleSelect | oui | Original, Duplicata, Attestation interne | Original |
| `empreinte_sha256` | char(64) → SingleLineText | si un fichier existe | unique ; 64 caractères hexadécimaux ; non modifiable | 9f2c…e1 |
| `taille_octets` | bigint → Number | si fichier | > 0 | 284113 |
| `lot_id` | bigint → Links vers `lots_depot` | si déposée | — | LOT-20261014-0930-P1 |
| `nom_fichier_origine` | text → SingleLineText | si déposée | — | scan_0042.pdf |
| `chemin` | text → SingleLineText | dès `Classee` | relatif à la racine ; écrit par le système seul | Archive/2025/1_Factures-fournisseurs/03_Mars/ |
| `nom_fichier` | text → SingleLineText | dès `Classee` | règle de nommage §4.6 ; écrit par le système seul | 2025-03-14_FT-PC-2025-00017_facture-fournisseur_socofer-sarl_450000.pdf |
| `lien_fichier` | vue calculée → URL | — | adresse Nginx authentifiée | https://archive.…/fichiers/Archive/2025/… |
| `trie_par`, `date_tri` | text, timestamptz → SingleLineText, DateTime | dès `A_valider` | nom choisi dans la liste des utilisateurs | Aide au tri 1 |
| `decision_validation` | text → SingleSelect | non | vide, Valider, Renvoyer | Valider |
| `valide_par`, `date_validation` | text, timestamptz | si décision | `valide_par` ≠ `trie_par` (quatre yeux) | Comptable |
| `motif` | text → LongText | si renvoi, rejet, annulation | non vide | Montant illisible |
| `ref_ecriture` | text → SingleLineText | non | tenu par le système : clés des écritures qui citent la pièce | AC-2025-000231 |
| `controle_par`, `date_controle` | text, timestamptz | dès `Controlee` | `controle_par` ≠ `trie_par` | Resp. validation |
| `remplace_par` | text → SingleLineText | si annulée pour réattribution | `id_piece` existant | FT-PC-2024-00102 |
| `date_fin_conservation` | date → Date | non | calculée si `duree_conservation_ans` est confirmée, sinon vide | (vide) |
| `proposition_ia`, `source_proposition` | jsonb, text → JSON, SingleLineText | non | rempli seulement si l'option IA est active | (vide) |
| `version` | integer → Number | oui | incrémentée à chaque mise à jour (détection des modifications concurrentes) | 4 |
| `cree_le`, `modifie_le` | timestamptz → CreatedTime, LastModifiedTime | oui | posés par la base | 2026-10-14 09:42 |

### 4.2 Autres tables

**`lots_depot`** — un envoi depuis le poste de numérisation.

| Champ | Type → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `code_lot` | text → SingleLineText | oui | unique ; `LOT-AAAAMMJJ-HHMM-POSTE` | LOT-20261014-0930-P1 |
| `poste`, `depose_par` | text | oui | — | P1, Aide au tri 1 |
| `nb_annonces` | integer → Number | oui | lignes du manifeste | 48 |
| `nb_nouveaux`, `nb_doublons`, `nb_rejetes` | integer → Number | oui | somme = `nb_annonces` une fois ingéré | 46, 1, 1 |
| `statut` | text → SingleSelect | oui | Recu, En_ingestion, Ingere, Ingere_avec_ecarts, Erreur | Ingere_avec_ecarts |
| `recu_le`, `ingere_le` | timestamptz → DateTime | oui / non | — | — |

**`fichiers_deposes`** — un fichier d'un lot, pour le compteur du lot et la traçabilité des doublons.

| Champ | Type → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `lot_id` | bigint → Links | oui | — | — |
| `nom_origine` | text | oui | unique dans le lot | scan_0042.pdf |
| `empreinte_sha256` | char(64) | oui | — | — |
| `resultat` | text → SingleSelect | oui | Nouveau, Doublon_exact, Rejete_format, Rejete_transfert | Doublon_exact |
| `piece_id` | bigint → Links vers `pieces` | si Nouveau ou Doublon_exact | pièce créée ou pièce déjà existante | 4812 |

**`compteurs`** — un compteur par année.

| Champ | Type → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `annee` | integer → Number | oui | clé ; entre 2000 et 2100 | 2025 |
| `dernier` | integer → Number | oui | 0 à 99999 ; ne diminue jamais ; écrit seulement par la fonction | 17 |
| `modifie_le` | timestamptz | oui | — | — |

Affichée en lecture seule dans NocoDB.

**`types_piece`** — référentiel (fiche §4).

| Champ | Type → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `code` | text | oui | clé ; nom du dossier | 2_Recus-de-caisse |
| `libelle` | text | oui | — | Reçu de caisse |
| `code_nom_fichier` | text | oui | minuscules, chiffres, tirets | recu-caisse |
| `prioritaire`, `actif` | boolean → Checkbox | oui | — | vrai, vrai |

**`ecritures`** — lignes d'écritures importées (§7). Clé naturelle unique : `source` + `exercice` + `journal` + `numero_ecriture` + `ligne`.

| Champ | Type → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `source` | text → SingleSelect | oui | ERP, EXCEL, AUTRE | ERP |
| `exercice` | integer | oui | année ouverte | 2025 |
| `journal` | text | oui | VT, AC, BQ, CA ou autre code de l'export | AC |
| `numero_ecriture`, `ligne` | text, integer | oui | — | 000231, 1 |
| `date_ecriture` | date | oui | dans l'exercice | 2025-03-15 |
| `compte` | text | oui | chiffres (plan SYSCOHADA) | 401100 |
| `libelle` | text → LongText | non | — | Facture SOCOFER |
| `debit_fcfa`, `credit_fcfa` | bigint | oui | entiers ≥ 0 ; un seul des deux non nul | 450000, 0 |
| `piece_id_cite` | text | non | valeur exportée par l'ERP (option A) ; jamais modifiée dans NocoDB | FT-PC-2025-00017 |
| `piece_id_saisi` | text → Links vers `pieces` | non | saisi dans NocoDB (option B) ; conservé à chaque réimport | — |
| `motif_piece_manquante` | text | non | si aucune pièce citée | — |
| `import_id` | bigint → Links vers `imports_ecritures` | oui | dernier import qui l'a vue | — |
| `presente_dernier_import` | boolean → Checkbox | oui | faux si l'écriture a disparu de l'export | vrai |

**`imports_ecritures`** : `nom_fichier`, `empreinte_sha256` (unique : un même fichier n'est jamais importé deux fois), `source`, `exercice`, `nb_lignes`, `nb_inserees`, `nb_mises_a_jour`, `nb_disparues`, `statut` (Recu, Importe, Rejete), `importe_le`, `motif_rejet`.

**`pieces_manquantes`** — traitement d'une pièce déclarée manquante ; la pièce elle-même est une ligne `pieces` au statut `Manquante`, avec un identifiant.

| Champ | Type → NocoDB | Oblig. | Contrainte | Exemple |
|---|---|---|---|---|
| `piece_id` | bigint → Links vers `pieces` | oui | unique | — |
| `description` | text → LongText | oui | ce qui manque | Facture carburant mars |
| `motif` | text → SingleSelect | oui | Perdue, Jamais reçue, Détériorée, Autre | Perdue |
| `traitement` | text → SingleSelect | oui | Duplicata demandé, Attestation interne | Duplicata demandé |
| `date_demande`, `date_relance` | date | selon traitement | — | 2026-10-15 |
| `attestation_signee_par`, `date_signature` | text, date | si attestation | Direction seulement | DG |
| `statut_traitement` | text → SingleSelect | oui | Ouvert, Duplicata reçu, Attestation signée, Clos | Ouvert |

**`controles`** (une exécution de contrôle) : `type_controle`, `declenche_par`, `perimetre_exercice`, `debut`, `fin`, `nb_verifies`, `nb_ecarts`, `statut` (En_cours, Termine, Echec), `rapport` (LongText ou lien).

**`ecarts`** (une anomalie) : `controle_id`, `code_ecart` (§5, W06), `objet` (identifiant de pièce ou clé d'écriture), `detail`, `responsable`, `date_limite`, `statut` (Ouvert, Corrige, Accepte_documente), `resolu_par`, `commentaire`. Unicité sur (`code_ecart`, `objet`) tant que le statut est Ouvert : un contrôle rejoué ne recrée pas l'écart.

**`rapprochements_bancaires`** (critère 7, US-ARC-07) : `compte_bancaire`, `exercice`, `mois`, `solde_releve_fcfa`, `solde_comptable_fcfa`, `ecart_fcfa` (calculé), `piece_releve` (lien vers la pièce `5_Banque`), `etabli_par`, `valide_par` (≠ `etabli_par`), `statut` (Brouillon, Rapproche, Ecart_explique).

**`journal_audit`** (ajout seul) : `id` (bigint identité), `horodatage` (posé par la base), `acteur_db` (utilisateur PostgreSQL : `arch_nocodb` ou `arch_n8n`), `acteur_humain` (nom transmis par NocoDB ou n8n, voir §8.1), `table_nom`, `enregistrement_id`, `action` (INSERT, UPDATE, STATUT, ATTRIBUTION, RANGEMENT, IMPORT, CONTROLE), `avant` et `apres` (jsonb), `execution_n8n`. Écrit par déclencheurs sur toutes les tables métier. Aucun droit UPDATE ni DELETE accordé ; un déclencheur refuse aussi ces opérations. Option après le 31 octobre : chaîner chaque ligne à l'empreinte de la précédente pour rendre toute altération visible.

**`parametres`** : `cle` (unique), `valeur`, `description`, `modifie_par`, `modifie_le`. Clés initiales : `racine_archive`, `noms_mois` (01_Janvier … 12_Decembre, sans accents : **à figer à J04**), `annees_ouvertes` (**à confirmer** : 2023 à 2025 ou 2024 à 2026), `debut_exercice` (01-01, Hypothèse), `duree_conservation_ans` (vide tant que non confirmée), `ia_extraction_active` (faux), `alerte_destinataires`, `seuil_disque_pct` (80), `taille_max_fichier_mo` (à fixer après les 50 pièces d'essai), `delai_relance_duplicata_jours` (à fixer).

**`erreurs_workflow`** (file d'erreurs, US-SYS-08) : `horodatage`, `workflow`, `execution_id`, `noeud`, `message` (sans donnée personnelle ni montant), `objet_ref` (code de lot, `id` de pièce, nom d'import), `tentatives`, `statut` (Nouvelle, En_reprise, Resolue, Abandonnee), `resolu_par`, `commentaire`.

**Vues SQL en lecture seule** affichées dans NocoDB (affichage des vues PostgreSQL : à vérifier sur la version installée) : `v_tableau_bord` (compteurs par statut, année et type, comparés au plan), `v_doublons_probables`, `v_ecritures_sans_piece`, `v_pieces_saisies_sans_ecriture`, `v_trous_numerotation`, `v_echantillon` (tirage aléatoire reproductible par graine).

### 4.3 Machine d'états de la pièce

```
              (W01)                 (AT/CPT)               (CPT/RV : Valider)
  [dépôt] ----------> A_trier ------------------> A_valider -----------------+
                        |  ^                         |                        |
           (CPT/RV)     |  +---- Renvoyer (CPT/RV) --+                        v (SYS, W02)
                        v                                          Classement_en_cours
                     Rejetee                                                 | (SYS, fichier vérifié)
                                                                             v
  [déclaration] --(SYS, W04)--> Manquante --(SYS : duplicata ou attestation)--> Classee
                                    |                                       |   ^
                                    |                       (SYS, W05/W06)  v   | (SYS : écriture disparue)
                                    |                                  Saisie_ERP
                                    |                                       |   ^
                                    |                              (RV)     v   | (RV : réouverture, motif)
                                    |                                   Controlee
                                    +---(RV, motif, aucune écriture)---> Annulee <--(RV)-- Classee
```

| N° | De → vers | Qui | Condition (vérifiée par déclencheur ou workflow) |
|---|---|---|---|
| T1 | (création) → `A_trier` | Système (W01) | Empreinte nouvelle, fichier PDF lisible |
| T2 | `A_trier` → `A_valider` | Aide au tri, comptable | Date, type, tiers, montant, `trie_par` renseignés |
| T3 | `A_valider` → `A_trier` | Comptable, responsable de validation | `decision_validation` = Renvoyer et motif |
| T4 | `A_trier` → `Rejetee` | Comptable, responsable de validation | Motif (illisible, plusieurs pièces dans un fichier, pas une pièce comptable) ; pas d'identifiant |
| T5 | `A_valider` → `Classement_en_cours` | Système (W02) seul | `decision_validation` = Valider ; `valide_par` ≠ `trie_par` ; identifiant attribué par la fonction |
| T6 | `Classement_en_cours` → `Classee` | Système (W02) seul | Fichier écrit à son chemin définitif, empreinte relue identique |
| T7 | (déclaration) → `Manquante` | Système (W04) seul | Fiche `pieces_manquantes` complète ; identifiant attribué |
| T8 | `Manquante` → `Classee` | Système (W02) seul | Duplicata déposé et validé (même identifiant, `nature_justificatif` = Duplicata) ou attestation signée déposée et validée (`nature_justificatif` = Attestation interne) |
| T9 | `Classee` ou `Manquante` → `Saisie_ERP` | Système (W05) seul | Au moins une écriture présente au dernier import cite la pièce |
| T10 | `Saisie_ERP` → `Classee` | Système (W05) seul | Plus aucune écriture ne la cite ; écart créé |
| T11 | `Saisie_ERP` → `Controlee` | Responsable de validation | Aucun écart ouvert sur la pièce ; `controle_par` ≠ `trie_par` |
| T12 | `Controlee` → `Saisie_ERP` | Responsable de validation | Motif de réouverture |
| T13 | `Classee` ou `Manquante` → `Annulee` | Responsable de validation | Motif ; aucune écriture ne la cite ; le numéro n'est jamais réutilisé |
| T14 | `Classee`, `Saisie_ERP` ou `Controlee` → `Classement_en_cours` | Système (déclencheur) | Correction de date (même année), tiers, type ou montant d'une pièce classée ; W02 recalcule nom et chemin |

Mise en œuvre : NocoDB se connecte avec l'utilisateur PostgreSQL `arch_nocodb`, n8n avec `arch_n8n`. Le déclencheur `controle_transition` lit `current_user` : les transitions « Système seul » sont refusées si elles viennent de `arch_nocodb`. Les humains ne choisissent donc jamais eux-mêmes `Classee` ou `Saisie_ERP`. La distinction entre aide au tri, comptable et responsable de validation, elle, repose sur les droits de NocoDB et sur les vues (§6), plus le contrôle « quatre yeux » sur les noms ; elle n'est pas garantie par la base (voir risques §10).

Modification des informations d'une pièce déjà classée (erreur de tiers, de montant ou de date) : le comptable corrige dans la vue « Corrections » ; le déclencheur repasse la pièce en `Classement_en_cours` (T14) et W02 recalcule le nom et le chemin, copie le fichier, vérifie l'empreinte ; l'identifiant ne change pas. Exception : si la correction change l'année de `date_piece`, l'identifiant (qui porte l'année) n'est plus cohérent ; règle proposée, **à confirmer à J04** : annulation (T13) et nouvelle pièce, reliées par `remplace_par`. Pour une pièce déjà `Saisie_ERP` ou `Controlee`, la correction est réservée au responsable de validation ; le statut est recalculé par W05 à l'import suivant.

### 4.4 Règles d'intégrité portées par la base

- Aucune suppression sur `pieces`, `compteurs`, `journal_audit`, `ecritures`, `imports_ecritures`, `lots_depot`, `fichiers_deposes` : droit DELETE non accordé et déclencheur de refus.
- `id_piece`, `empreinte_sha256`, `chemin`, `nom_fichier` modifiables uniquement par `arch_n8n` (déclencheur).
- Champs obligatoires par statut contrôlés par déclencheur (pas seulement par le formulaire NocoDB).
- Toute mise à jour incrémente `version` et écrit une ligne `journal_audit`.

### 4.5 Arborescence sur disque

```
/srv/archive/
  depot/LOT-AAAAMMJJ-HHMM-POSTE/   *.pdf, manifest.csv, _PRET      (écriture : compte SFTP du poste)
  a_trier/<sha256>.pdf                                             (écriture : n8n)
  quarantaine/LOT-…/                                               (fichiers refusés, conservés 30 jours, à confirmer)
  fichiers/Archive/AAAA/N_Type/MM_Mois/<nom>.pdf                   (écriture : n8n ; lecture : Nginx)
  imports/ecritures/, imports/traites/                             (CSV de l'ERP)
  sauvegardes/                                                     (dumps de la nuit, avant envoi)
  pgdata/                                                          (PostgreSQL, volume)
```

### 4.6 Règle de nommage appliquée

`AAAA-MM-JJ_FT-PC-AAAA-NNNNN_type_tiers_montant.pdf` où `AAAA-MM-JJ` = `date_piece`, `type` = `types_piece.code_nom_fichier`, `tiers` = tiers en minuscules sans accents, espaces et signes remplacés par des tirets, 40 caractères au plus, `montant` = `montant_fcfa` sans séparateur. Seul le PDF est accepté au dépôt (Hypothèse : l'application de scan produit du PDF ; **à confirmer** avec le matériel). Une pièce = un fichier ; un PDF contenant plusieurs pièces est rejeté (T4) et renumérisé.

## 5. Workflows n8n

Règles communes : chaque workflow est exporté en JSON et versionné (sans identifiants) ; chaque workflow a pour « workflow d'erreur » W09 ; aucune donnée personnelle, aucun montant ni nom de tiers dans les messages d'alerte ; les noms de nœuds et les capacités citées sont **à vérifier sur la version installée** (ARC-002), notamment le calcul d'empreinte (nœud de chiffrement ou nœud de code avec le module `crypto` autorisé) et l'écriture de fichiers sur disque (répertoires autorisés).

| N° | Nom | Déclencheur | Humain dans la boucle | US couvertes |
|---|---|---|---|---|
| W01 | Ingestion d'un lot de scans | Planifié toutes les 5 min | Avant : numérisation et envoi ; après : tri | US-ARC-06, 01 |
| W02 | Attribution d'identifiant, renommage, rangement | Planifié toutes les 2 min + appel par W03 | Avant : décision de validation | US-ARC-01 |
| W03 | Traitement des décisions de validation | Planifié toutes les 2 min | La décision elle-même | US-ARC-01, 06 |
| W04 | Déclaration d'une pièce manquante et relances | Planifié (déclarations) + quotidien (relances) | Déclaration, signature de l'attestation | US-ARC-05 |
| W05 | Import des écritures | Planifié toutes les 15 min sur `imports/ecritures/` | Dépôt du CSV ; option B : correspondance | US-ARC-02, 04, 08 |
| W06 | Contrôles inverses et rapport | Quotidien 6 h + à la demande | Correction des écarts | US-ARC-04, 07, 11 ; critères 2, 3, 6 |
| W07a | Sauvegarde | Quotidien 1 h | Branchement hebdomadaire du disque externe | US-SYS-04 ; critère 5 |
| W07b | Vérification de restauration | Hebdomadaire + aux jalons | Restauration manuelle aux jalons | Critère 5 |
| W08 | Ouvrir une pièce depuis l'ERP | Webhook GET | — | US-ARC-03, 08 |
| W09 | Alerte d'échec et file d'erreurs | Déclencheur d'erreur de n8n | Reprise ou abandon décidé par le développeur | US-SYS-08 |
| W10 | Rapport quotidien d'avancement | Quotidien 18 h | Lecture | US-ARC-11 |
| W11 | Supervision | Toutes les 15 min | — | Exploitation |
| W12 | Extraction assistée par IA | Désactivé | Validation inchangée | ADR-06 (option) |

### W01 — Ingestion d'un lot de scans
- **Entrées** : répertoire `depot/LOT-…/` contenant `_PRET` et `manifest.csv` (nom ; taille ; SHA-256).
- **Étapes** : (1) lister les lots prêts non encore connus ou en `Erreur` ; (2) créer ou reprendre la ligne `lots_depot` (`En_ingestion`) ; (3) pour chaque fichier : refuser s'il n'est pas un PDF ou dépasse la taille maximale (`Rejete_format`, copie en quarantaine) ; calculer l'empreinte ; si elle diffère du manifeste : `Rejete_transfert` ; si elle existe déjà dans `pieces` : `Doublon_exact` ; sinon copier vers `a_trier/<sha256>.pdf` et créer la pièce `A_trier` ; (4) mettre à jour les compteurs du lot, statut `Ingere` ou `Ingere_avec_ecarts` ; (5) renommer le lot en `depot/_traites/` (ou laisser au nettoyage de l'hôte si n8n ne peut pas déplacer : à vérifier).
- **Sorties** : pièces `A_trier`, compteurs du lot, fichiers en quarantaine.
- **Erreurs** : lot sans manifeste ou fichiers manquants → lot `Erreur` + W09 ; l'aide au tri renvoie le lot.
- **Idempotence** : la pièce est créée par `INSERT … ON CONFLICT (empreinte) DO NOTHING` ; le fichier `a_trier` porte l'empreinte comme nom ; `fichiers_deposes` est unique par (lot, nom). Rejouer un lot ne crée rien de plus.
- **Rejouabilité** : relancer W01 sur un lot `Erreur` suffit. Le poste ne supprime jamais un lot local avant que le lot soit `Ingere` et que la sauvegarde de la nuit suivante ait réussi.

### W02 — Attribution d'identifiant, renommage et rangement
- **Entrées** : pièces `A_valider` avec décision Valider (via W03), pièces `Classement_en_cours`, pièces `Manquante` avec justificatif validé.
- **Étapes** : (1) appeler `attribuer_id_piece(id, valide_par, execution)` (renvoie l'identifiant, existant ou nouveau) ; (2) calculer chemin et nom (§4.5, §4.6) ; (3) si le fichier final existe déjà avec la même empreinte : passer à (5) ; s'il existe avec une autre empreinte : erreur, ne jamais écraser ; (4) écrire le fichier sous un nom temporaire puis le renommer, relire et comparer l'empreinte ; (5) mettre à jour `chemin`, `nom_fichier`, statut `Classee` (T6) dans une seule requête ; (6) le fichier de `a_trier/` est purgé par le nettoyage de l'hôte une fois la pièce `Classee` et sauvegardée.
- **Sorties** : fichier rangé, pièce `Classee`, lignes `journal_audit` (ATTRIBUTION, RANGEMENT).
- **Erreurs** : erreur après l'attribution → la pièce reste `Classement_en_cours` avec son identifiant, W09 alerte ; aucune perte de numéro.
- **Idempotence** : la fonction renvoie le même identifiant ; l'écriture du fichier vérifie l'existant ; la mise à jour finale est conditionnée au statut courant.
- **Rejouabilité** : W02 reprend automatiquement toute pièce `Classement_en_cours` depuis plus de 10 minutes.

### W03 — Traitement des décisions de validation
- **Entrées** : pièces `A_valider` dont `decision_validation` est renseignée.
- **Étapes** : vérifier `valide_par` ≠ `trie_par` (sinon effacer la décision et signaler dans la vue) ; Renvoyer → T3 avec motif ; Valider → appeler W02 ; journaliser.
- **Humain** : la décision, prise dans la vue « À valider » (§6), après lecture de l'aperçu et de l'avertissement de doublon probable.
- **Idempotence** : une décision déjà traitée est remise à vide après traitement ; le statut sert de verrou.

### W04 — Pièce manquante
- **Entrées** : formulaire NocoDB « Déclarer une pièce manquante » (comptable) : année, type, tiers, date et montant estimés, description, motif, traitement choisi.
- **Étapes** : créer la ligne `pieces` (`nature_justificatif` = Attestation interne ou Duplicata selon le traitement) puis appeler `attribuer_id_piece` (T7) ; créer `pieces_manquantes` ; produire le modèle d'attestation à faire signer (texte fixe, à rédiger : **à confirmer** par la Direction) ; relance quotidienne des demandes de duplicata sans réponse après le délai paramétré (alerte au comptable, pas d'envoi automatique au fournisseur).
- **Humain** : déclaration ; demande de duplicata au fournisseur ; signature de l'attestation par la Direction ; dépôt du duplicata ou de l'attestation signée comme un fichier du lot, rattaché à l'identifiant existant dans la vue « Justificatifs à rattacher », puis validation (T8 par W02).
- **Idempotence** : un formulaire soumis deux fois crée deux déclarations ; la vue « Manquantes » affiche les doublons probables (même clé métier) pour annulation (T13).

### W05 — Import des écritures (option A et option B)
- **Entrées** : CSV au format §7.2 déposé dans `imports/ecritures/` (par l'ERP ou à la main).
- **Étapes** : (1) refuser un fichier déjà importé (empreinte connue) ; (2) valider l'en-tête, l'encodage, les montants entiers, l'équilibre débit = crédit par écriture ; en cas d'échec : import `Rejete` avec motif, rien n'est écrit ; (3) dans une transaction : insérer ou mettre à jour par clé naturelle (sans toucher `piece_id_saisi`), marquer `presente_dernier_import` pour l'exercice importé ; (4) mettre à jour les statuts des pièces (T9, T10) et `ref_ecriture` ; (5) lancer W06 sur l'exercice.
- **Humain** : dépôt du fichier ; en option B, correspondance écriture → pièce dans la vue « Écritures à relier ».
- **Idempotence** : empreinte de fichier unique ; mise à jour par clé naturelle.
- **Rejouabilité** : un import rejeté se corrige à la source et se redépose.

### W06 — Contrôles inverses et rapport

Codes d'écart produits :

| Code | Contrôle | Critère |
|---|---|---|
| E01 | Écriture sans pièce ni motif de pièce manquante | 2, 3 |
| E02 | Écriture citant un identifiant inconnu, annulé ou rejeté | 2 |
| E03 | Pièce `Saisie_ERP` sans écriture présente | 3 |
| E04 | Pièce `Classee` sans écriture depuis plus de N jours (N à fixer) | 3 |
| E05 | Trou ou doublon de numérotation par année | 6 |
| E06 | Fichier absent du disque ou empreinte différente | Intégrité |
| E07 | Pièce `Manquante` sans traitement clos à la date limite | 1 |
| E08 | Somme des écritures citant une pièce différente de son montant (information) | Qualité |
| E09 | Rapprochement bancaire avec écart non expliqué | 7 |
| E10 | Lot déposé non ingéré depuis plus de 24 h ; pièce `A_trier` depuis plus de 5 jours ouvrés | 1 |

- **Étapes** : ouvrir une ligne `controles` ; exécuter les requêtes (vues SQL §4.2) ; créer les écarts nouveaux, clore automatiquement ceux qui ont disparu (statut Corrige, `resolu_par` = système) ; envoyer un rapport par courriel (comptes par code, pas de détail nominatif) ; E06 complet (relecture de tous les fichiers) une fois par semaine, sur un échantillon chaque jour.
- **Humain** : chaque écart a un responsable et une date limite ; le responsable de validation accepte un écart documenté (statut `Accepte_documente`, commentaire obligatoire).
- **Idempotence** : unicité (code, objet) des écarts ouverts.

### W07a — Sauvegarde (détail §8.4)
- **Étapes** : `pg_dump` des bases `archive_compta`, `nocodb_meta`, `n8n` ; export JSON des workflows ; archive des fichiers ajoutés depuis la veille ; empreintes des dumps ; envoi vers GCS ; vérification que l'objet distant existe et a la bonne taille ; ligne `controles` (type Sauvegarde). Le dump peut être lancé par une tâche planifiée de l'hôte plutôt que par n8n si n8n n'a pas accès à `pg_dump` (à vérifier) ; n8n vérifie alors seulement le résultat.
- **Erreurs** : tout échec → W09 ; absence de sauvegarde de moins de 26 h → alerte W11.
- **Idempotence** : fichiers nommés par date ; un envoi refait remplace l'objet du même nom dans un bucket versionné.

### W07b — Vérification de restauration
- **Étapes** : sur l'environnement de test, restaurer le dernier dump dans une base `archive_restore` ; comparer le nombre de pièces par statut et les compteurs avec la production ; tirer 20 pièces au hasard, rapatrier leurs fichiers depuis GCS, comparer les empreintes ; consigner le résultat.
- **Humain** : aux jalons J06 (14 oct.) et J16 (30 oct.), restauration complète faite à la main sur un autre poste, à partir de GCS seulement, avec la procédure écrite (§8.5).

### W08 — Ouvrir une pièce depuis l'ERP
- **Entrée** : `GET /webhook/piece?id=FT-PC-AAAA-NNNNN`.
- **Étapes** : vérifier le format ; lire `chemin` et `nom_fichier` ; répondre par une redirection vers `https://<domaine archive>/fichiers/…` ; Nginx demande l'authentification de la personne et journalise l'accès. Le webhook ne renvoie jamais le fichier lui-même et ne révèle rien si l'identifiant est inconnu (page « introuvable »).
- **Mesure** : temps d'ouverture chronométré à J06 et J14 (US-ARC-03 : moins de 2 s ; Hypothèse : tenable sur le réseau du bureau, non vérifié).

### W09 — Alerte d'échec et file d'erreurs
- **Déclencheur** : déclencheur d'erreur de n8n, désigné comme workflow d'erreur de W01 à W11.
- **Étapes** : écrire une ligne `erreurs_workflow` ; courriel au développeur et au responsable de validation (SMTP de l'entreprise) ; si plus de 5 erreurs en une heure, un seul courriel récapitulatif.
- **Reprise** : le développeur relance le workflow concerné (tous sont rejouables), puis passe l'erreur à `Resolue` ; une erreur `Nouvelle` depuis plus de 24 h est rappelée dans le rapport W06.
- **Limite** : si n8n lui-même est arrêté, W09 ne part pas ; la supervision externe (W11, §8.6) couvre ce cas.

### W10 — Rapport quotidien d'avancement
Lit `v_tableau_bord` : pièces collectées, à trier, à valider, classées, saisies, contrôlées, manquantes, rejetées, par année et par type ; temps moyen entre dépôt et classement ; écart au plan recalculé à J06c. Courriel à la Direction, au comptable et au responsable de validation.

### W11 — Supervision
Espace disque (alerte au seuil), réponse de NocoDB et de PostgreSQL, âge de la dernière sauvegarde, nombre d'erreurs ouvertes, lots en attente. Complétée par une sonde externe (§8.6).

## 6. Interfaces utilisateur (NocoDB)

Les rôles cités (Owner, Creator, Editor, Commenter, Viewer) et la possibilité de restreindre une table ou un champ par rôle sont **à vérifier sur la version installée** ; si la restriction par table n'existe pas, les limites ci-dessous reposent sur des vues verrouillées et sur la base (§4.4).

| Utilisateur | Rôle NocoDB proposé | Vues et formulaires | Peut modifier |
|---|---|---|---|
| Aide au tri | Editor | « File à trier » (grille, colonne d'aperçu, filtre `A_trier`, tri par lot) ; « Mes lots » (`lots_depot`, `fichiers_deposes`) | Date, type, tiers, numéro du document, montant, `trie_par` ; passage T2 |
| Comptable | Editor | « À valider » (avec colonne doublon probable) ; « Corrections » ; « Déclarer une pièce manquante » (formulaire) ; « Manquantes ouvertes » ; « Écritures à relier » (option B) ; « Écritures sans pièce » ; « Pièces classées sans écriture » ; « Rapprochements » ; « Recherche » | Décision de validation (pièces triées par un autre), corrections, déclarations, rapprochements |
| Responsable de validation | Editor | Toutes les vues du comptable + « Écarts ouverts » ; « Échantillon de contrôle » (30 par année, `v_echantillon`) ; « Annulations » ; tableau de bord | Décisions, T11, T12, T13, statut des écarts |
| Direction | Viewer | « Tableau de bord » ; « Recherche » (par identifiant, tiers, montant, compte) ; « Manquantes à signer » ; « Écarts ouverts » | Rien dans NocoDB ; signe les attestations sur papier |
| Développeur | Owner | Tout, plus `erreurs_workflow`, `parametres`, `controles` | Paramètres, reprise des erreurs |

Règles d'écran :
- Les vues de travail sont verrouillées (filtres et colonnes non modifiables par les utilisateurs).
- **Aucune vue ni aucun formulaire partagé par lien public** ; le partage public est désactivé si la version le permet (à vérifier).
- Libellés en français ; montants affichés avec séparateur de milliers, stockés sans.
- Recherche « depuis l'état financier » (US-ARC-08, critère 4) : la Direction ou le contrôleur part d'un compte de la balance, filtre `ecritures` par exercice et compte, ouvre la ligne, clique sur le lien de la pièce. Le passage « poste du bilan → comptes » se fait avec la balance de l'exercice, hors outil.

## 7. Contrat d'interface avec l'ERP

Tout ce paragraphe est **à confirmer** par le développeur après lecture du code de l'ERP (ARC-018). Rien n'est supposé sur ses capacités actuelles.

### 7.1 Données échangées

| Flux | Sens | Contenu | Fréquence | Responsable |
|---|---|---|---|---|
| F1 Écritures | ERP (ou Excel du comptable) → archive | CSV §7.2 | Chaque jour ouvré pendant S43–S44, et avant chaque contrôle | Comptable dépose ; ou ERP exporte automatiquement (option A, si faisable) |
| F2 Liste des pièces | Archive → ERP | CSV : `id_piece;statut;date_piece;type;tiers;montant_fcfa;lien` des pièces `Classee`, `Saisie_ERP`, `Controlee`, `Manquante` | Chaque jour (W06) | Système |
| F3 Ouverture d'une pièce | ERP → archive | Lien `…/webhook/piece?id=…` affiché à côté de `piece_id` | À la demande | ERP construit le lien |
| F4 PDF produits par l'ERP (US-ARC-09) | ERP → archive | PDF + fichier `.json` (type, tiers, date, montant, référence ERP) déposés comme un lot | À la génération | **Après le 31 octobre**, sauf décision contraire |

### 7.2 Format du CSV des écritures (F1)
UTF-8, séparateur point-virgule, une ligne par ligne d'écriture, en-tête obligatoire, montants entiers sans séparateur, dates `AAAA-MM-JJ`. Nom : `ecritures_<SOURCE>_<EXERCICE>_<AAAAMMJJHHMM>.csv`. Un fichier contient tout l'exercice (export complet, pas différentiel) : c'est ce qui permet de voir les écritures disparues.

`source;exercice;journal;numero_ecriture;ligne;date_ecriture;compte;libelle;debit_fcfa;credit_fcfa;piece_id;motif_piece_manquante`

Exemple : `ERP;2025;AC;000231;1;2025-03-15;401100;Facture SOCOFER;0;450000;FT-PC-2025-00017;`

### 7.3 Option A — ce que l'ERP doit faire
1. Ajouter `piece_id` (texte, format `FT-PC-AAAA-NNNNN`) et `motif_piece_manquante` sur les écritures, renseignés au point d'écriture unique `comptabilisation.py` ; refuser une écriture sans l'un ou l'autre (US-ARC-02).
2. Vérifier le format à la saisie, et l'existence de l'identifiant contre la dernière liste F2 importée (fonctionne sans réseau).
3. Exporter F1 avec la colonne `piece_id`.
4. Afficher le lien F3 (ouverture de la pièce depuis l'écriture).
5. Ne pas créer de table de pièces concurrente : l'archive est la seule source des pièces.

### 7.4 Option B — ce que l'ERP doit faire
Exporter F1 sans `piece_id` (ou le comptable produit le CSV depuis son Excel). La correspondance est faite dans NocoDB (`piece_id_saisi`). Condition : la clé (journal, numéro, ligne) d'une écriture ne doit jamais changer d'un export à l'autre.

### 7.5 À vérifier dans le code de l'ERP
- L'écriture a-t-elle un identifiant stable (journal + numéro + ligne) qui ne change pas après validation ou renumérotation ?
- Une écriture validée peut-elle être modifiée (règle des quatre yeux) ? Si oui, comment l'export le reflète-t-il ?
- `comptabilisation.py` est-il vraiment le seul chemin d'écriture (imports, reprises, scripts) ?
- Existe-t-il déjà un champ de référence de pièce, un export CSV, une API ?
- Comment les écritures des trois exercices passés entreront-elles dans l'ERP (J04b) ? Si elles restent hors ERP, la source `EXCEL` de F1 s'applique.
- Fuseau horaire et format des dates de l'ERP.
- La sauvegarde de 2 h de l'ERP inclut-elle le nouveau champ ? (Elle relève de l'ERP, pas de cette conception.)

## 8. Sécurité et exploitation

### 8.1 Comptes et rôles
- Un compte NocoDB nominatif par personne ; aucun compte partagé. Liste nominative des personnes autorisées validée par la Direction (programme §5.5).
- Double authentification pour la Direction, le comptable et le développeur si la version de NocoDB la propose (à vérifier) ; sinon mots de passe longs et accès restreint (point de risque §10).
- PostgreSQL : `arch_owner` (migrations, développeur seulement), `arch_nocodb` (lecture, insertion, mise à jour ; pas de suppression), `arch_n8n` (même chose + exécution de la fonction d'attribution), `arch_lecture` (rapports et sauvegardes). PostgreSQL n'écoute pas sur Internet.
- Identité humaine dans le journal : NocoDB ne transmet pas le nom de l'utilisateur à PostgreSQL ; le journal de la base enregistre l'utilisateur technique. Le nom humain vient des champs `trie_par`, `valide_par`, `controle_par` et, si la version le fournit, du journal d'activité de NocoDB et des champs « créé par / modifié par » (à vérifier). C'est déclaratif : voir §10.

### 8.2 Secrets
- Mots de passe PostgreSQL, jetons NocoDB, clé de chiffrement de n8n, clé du compte de service GCS, mot de passe SMTP : dans des fichiers d'environnement du serveur lisibles par root seulement (droits 600), jamais dans le dépôt Git ni dans les exports de workflows.
- Jeton NocoDB de n8n distinct de celui du site web (`api/lib/nocodb.js`) ; révocable séparément.
- Compte de service GCS limité au bucket de sauvegarde, avec droit de création d'objets mais sans droit de suppression (rôle exact à vérifier dans GCS) : une machine compromise ne peut pas effacer la copie hors site.
- Rotation : à chaque départ d'une personne, et au moins une fois après le 31 octobre (les secrets ont circulé pendant la construction).
- La clé de chiffrement de n8n et la clé éventuelle de chiffrement des sauvegardes sont aussi imprimées et mises sous enveloppe scellée dans le coffre de la Direction (sinon une sauvegarde chiffrée est irrécupérable).

### 8.3 Droits sur les fichiers
- `/srv/archive/fichiers/` : écriture par l'utilisateur du conteneur n8n seulement ; fichiers en lecture seule après rangement ; lecture par Nginx.
- `/srv/archive/depot/` : compte SFTP du poste de numérisation, restreint à ce répertoire (pas de shell).
- Nginx : `/fichiers/` en HTTPS, authentification par utilisateur (un compte par personne autorisée), pas de liste de répertoires, en-tête `X-Content-Type-Options: nosniff`, journal d'accès avec le nom de l'utilisateur (base de US-SYS-12). Le mécanisme exact (authentification Nginx simple ou contrôle délégué) est à choisir à ARC-008.

### 8.4 Sauvegarde 3-2-1 concrète

| Copie | Support | Lieu | Contenu | Fréquence | Rétention |
|---|---|---|---|---|---|
| 1 (production) | Disque SSD du VPS | Datacentre Hostinger | Base + fichiers | Continu | — |
| 2 | Bucket GCS, versionnement activé, verrou de rétention si l'offre le permet (à vérifier) | Hors site (Google) | Dumps quotidiens des trois bases, export des workflows, fichiers ajoutés (copie incrémentale) | Chaque nuit 1 h (après le dump) | 30 dumps quotidiens + 1 par mois ; fichiers jamais supprimés |
| 3 | Disque externe USB | Bureau Foga-Tech, débranché hors copie, rangé fermé à clé | Copie complète depuis GCS (pas depuis le VPS) | Chaque vendredi (point hebdomadaire) | Toutes les versions tant que la place le permet |

Les deux supports sont : disques en ligne (VPS, GCS) et disque hors ligne (USB). Le chiffrement des copies 2 et 3 est recommandé (données comptables et personnelles) ; s'il est retenu, la clé est gérée selon §8.2. Le snapshot éventuel du VPS proposé par Hostinger (à vérifier) ne compte pas comme copie : il est au même endroit.

### 8.5 Restauration
Procédure écrite d'une page (ARC-015) : installer PostgreSQL, n8n et NocoDB sur une machine vierge ; récupérer depuis GCS le dernier dump et les fichiers ; restaurer ; reconnecter NocoDB ; vérifier nombres de pièces par statut, compteurs, 20 empreintes, ouverture de 3 pièces depuis leur identifiant. Durée mesurée et notée. Exécutée à la main le 14 octobre (avant l'archivage en masse) et le 30 octobre ; vérification automatique chaque semaine (W07b).

### 8.6 Supervision
W11 (intérieur) + une sonde extérieure au VPS (par exemple une instance Uptime Kuma, citée dans `DEPLOY-KVM2.md`, sur une autre machine, ou un service de surveillance externe : **à choisir**) qui alerte si NocoDB ou n8n ne répond plus. Un serveur arrêté ne peut pas signaler sa propre panne.

### 8.7 Environnement de test (US-SYS-10)
Même composition (PostgreSQL, NocoDB, n8n, mêmes versions) dans un fichier de composition Docker sur le poste du développeur, ou sur le VPS sous un autre nom de projet, d'autres ports et une autre racine `/srv/archive-test/` si la mémoire le permet (à vérifier, ARC-001). Données de test : 50 pièces fictives, pas de copie des pièces réelles sur un poste non chiffré. Aucun changement de workflow ou de schéma n'est fait en production sans avoir tourné en test ; les migrations SQL sont numérotées et rejouables.

### 8.8 Mode dégradé
- **Coupure de réseau au bureau** : la numérisation continue dans `A_ENVOYER/` ; l'envoi reprend au retour du réseau ; le tri attend. Une fiche papier par lot (code du lot, nombre de pièces, nom) sert de trace.
- **Coupure d'électricité au bureau** : onduleur pour le poste et le scanner (à acheter, prix non chiffré) ; un lot interrompu est renvoyé entier (idempotent).
- **Serveur indisponible** : rien n'est perdu côté poste (les lots locaux ne sont supprimés qu'après ingestion et sauvegarde) ; les originaux papier restent dans leur boîte de lot ; à la reprise, W02 et W01 reprennent les éléments en cours.
- **Le papier n'est jamais détruit** pendant le chantier (et pas avant la réponse de l'expert-comptable sur la durée de conservation, J12).

### 8.9 Journal d'exploitation
Document d'une page : qui redémarre quoi, commandes de santé, où sont les journaux (n8n, NocoDB, Nginx, PostgreSQL), comment rejouer un workflow, contacts.

## 9. Correspondance exigences → conception

| Exigence | Élément de conception | Couverture |
|---|---|---|
| US-ARC-01 Enregistrer une pièce avec identifiant unique | `pieces`, ADR-03, W01–W03 | Couverte |
| US-ARC-02 Citer la pièce dans l'écriture | Option A §7.3 (ERP) ; option B `piece_id_saisi` | **Dépend de l'ERP** (option A) ; partielle en option B (la citation est faite après saisie, dans NocoDB) |
| US-ARC-03 Ouvrir pièce ↔ écriture en moins de 2 s | W08 + lien ERP ; vue `ecritures` liée à `pieces` | Pièce → écriture : couverte dans NocoDB ; écriture → pièce : dépend de l'ERP ; 2 s : à mesurer |
| US-ARC-04 Listes des écarts dans les deux sens | W06 (E01–E04), vues, export CSV de NocoDB (à vérifier) | Couverte |
| US-ARC-05 Pièce manquante | `pieces_manquantes`, W04, T7, T8 | Couverte ; texte de l'attestation à rédiger |
| US-ARC-06 Dépôt de lot, doublons, compteur | Poste + script, W01, ADR-05, `lots_depot` | Couverte |
| US-ARC-07 Rapprochement bancaire | `rapprochements_bancaires`, E09 | **Partielle** : le calcul du rapprochement est fait par le comptable (ERP ou tableur) ; l'archive le trace et le contrôle |
| US-ARC-08 Chiffre du bilan → pièces | Vue `ecritures` par compte → lien pièce | **Partielle** : étape « poste du bilan → comptes » manuelle avec la balance |
| US-ARC-09 PDF de l'ERP archivés automatiquement | F4 §7.1 | **Non couverte avant le 31 octobre** (dépend du code de l'ERP) |
| US-ARC-10 Fin de conservation | `date_fin_conservation`, paramètre | **Partielle** : durée non confirmée (10 ans OHADA selon le programme, 3 ans selon US-DIR-05 : contradiction à trancher) ; alerte prévue après le 31 octobre ; aucune suppression possible dans l'outil |
| US-ARC-11 Tableau de bord | `v_tableau_bord`, W10 | Couverte ; « comparé au plan » nécessite le plan recalculé à J06c |
| US-SYS-08 Alerte d'échec et file de reprise | W09, `erreurs_workflow`, W11, sonde externe | Couverte |
| US-SYS-10 Environnement de test | §8.7 | Couverte ; capacité du VPS à vérifier |
| US-SYS-11 Export en formats ouverts | PDF + CSV de chaque table (export hebdomadaire joint à la sauvegarde) + dump SQL | Couverte |
| US-DIR-05 Conservation | Aucune suppression ; papier conservé | Partielle (voir US-ARC-10) |
| Critère 1 : 100 % de l'inventaire classé ou manquant | Statuts, E07, E10, W10 | Couverte **si** l'inventaire J02 est saisi dans un tableau comparable (nombre par année et par type) ; rapprochement inventaire ↔ archive par comptage, pas pièce par pièce |
| Critère 2 : 100 % des écritures citent une pièce | E01, E02 | Couverte, sous réserve d'un export complet des écritures |
| Critère 3 : contrôles inverses | E01, E03 | Couverte |
| Critère 4 : 30 pièces par année en moins de 2 min | `v_echantillon`, W08, procédure de chronométrage | Couverte ; résultat à mesurer à J14 |
| Critère 5 : restauration avant masse et le 30 oct. | W07a, W07b, §8.5, ARC-015, ARC-034 | Couverte |
| Critère 6 : aucun identifiant en double | ADR-03, contrainte d'unicité, E05 | Couverte |
| Critère 7 : soldes bancaires rapprochés | `rapprochements_bancaires`, E09 | Partielle (comme US-ARC-07) |

Non couvert par cette conception : US-ARC-09 avant le 31 octobre ; la traçabilité « poste du bilan → compte » ; l'identité humaine garantie par la base (§8.1) ; US-SYS-12 au-delà du journal d'accès Nginx.

## 10. Risques techniques et hypothèses ouvertes

| N° | Risque ou hypothèse | Effet | Parade |
|---|---|---|---|
| R1 | La version installée de NocoDB ne gère pas les sources PostgreSQL externes, ou mal | ADR-01 option 3 impossible | ARC-002 le 12 oct. ; repli option 2 |
| R2 | NocoDB et n8n ne sont pas en conteneurs, ou leur base est déjà en SQLite non persistante | Migration plus longue ; données actuelles du CRM des devis en jeu | ARC-001 relève l'existant ; sauvegarde complète avant toute migration |
| R3 | Les rôles NocoDB ne restreignent pas par table ou par champ | Une aide au tri peut techniquement modifier une table qui ne la concerne pas | Règles critiques dans la base (§4.4) ; journal ; peu d'utilisateurs ; vérification par l'échantillon |
| R4 | Identité humaine déclarative dans le journal et pour les quatre yeux | Preuve faible en cas de litige | Journal d'activité de NocoDB si disponible ; comptes nominatifs ; revue de sécurité |
| R5 | Le développeur seul porte aussi la mise en ligne de l'ERP (J03 à J08) | Glissement de S42 | `02-BACKLOG.md` : périmètre minimal avant le 16 oct. ; le reste ordonné après |
| R6 | Espace disque ou mémoire du VPS insuffisant (volume inconnu) | Arrêt de l'ingestion ; pas d'environnement de test sur le VPS | ARC-001 ; alerte à 80 % ; test sur le poste |
| R7 | Option A non livrée par l'ERP à temps | Repli option B, travail du comptable accru | Décision le 15 oct. ; format CSV commun |
| R8 | Les écritures des exercices passés ne sont pas dans l'ERP | F1 produit à la main depuis Excel ; qualité variable | Validation stricte de W05 ; source `EXCEL` |
| R9 | Exercice comptable différent de l'année civile ; année du compteur différente de l'année de la pièce | Identifiants incohérents avec les dossiers | À confirmer à J04 avant la première attribution (irréversible ensuite) |
| R10 | Qualité des scans (montants illisibles, plusieurs pièces dans un fichier) | Rejets et renumérisation | Liste de contrôle à la collecte, formation J06d, T4 |
| R11 | Capacités de n8n (calcul d'empreinte, accès disque, commande système) différentes de celles supposées | W01, W02 à adapter | ARC-002 ; repli : petit script sur l'hôte appelé par planification |
| R12 | Durée de conservation contradictoire (3 ans contre 10 ans) | Destruction trop tôt | Aucune suppression possible ; papier conservé ; J12 |
| R13 | Coût de GCS au volume réel et prix du disque externe et de l'onduleur | Budget | Non chiffré ici ; à chiffrer après l'inventaire |
| R14 | Ouverture en moins de 2 s non tenable sur le réseau du bureau | US-ARC-03 non tenue | Mesure à J06 ; taille de scan raisonnable (résolution à fixer à J04) |
| R15 | Version du site et du CRM des devis touchée par la migration de NocoDB | Panne du site | Faire la migration hors heures, sauvegarde préalable, test du formulaire devis après |

Hypothèses ouvertes à lever par un humain : versions de n8n et NocoDB ; mode d'installation ; espace disque ; année du compteur ; exercices concernés (2023–2025 ou 2024–2026) ; format des noms de mois ; matériel de numérisation et format PDF ; option A ou B ; texte de l'attestation interne ; durée de conservation ; chiffrement des sauvegardes ; outil de sonde externe ; liste nominative des utilisateurs.
