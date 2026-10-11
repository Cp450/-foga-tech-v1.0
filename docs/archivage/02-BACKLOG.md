# Archivage comptable — Backlog de construction

Rédigé par l'architecte. Découpage de `01-CONCEPTION.md` v0.2 en tâches.

## Historique des versions

| Version | Date | Changements |
|---|---|---|
| 0.1 | 11 oct. 2026 | Première version (67 h avant le go, ERP en S42) |
| 0.2 | 11 oct. 2026 | Refait autour du minimum viable de la revue senior (§5 de `04-REVUE-SENIOR.md`) et de la liste de contrôle de sécurité (§3.1 de `05-AUDIT-SECURITE.md`) : démarrage en option B ; mise en ligne de l'ERP hors S42 ; trois workflows n8n plus l'alerte ; sauvegarde et autres opérations système en tâches planifiées de l'hôte ; contrôles en vues SQL ; tâches de sécurité avant le go ; ARC-041 ajoutée ; deux scénarios de calendrier (décision D2) ; dépendances corrigées (RS-28) |

**Lecture.** Niveau : L1 mécanique ; L2 standard ; L3 complexe (règle croisée, état, transaction) ; L4 critique (perte de données, d'argent, sécurité) ; en cas de doute, le plus haut. Postes : ARC architecte, TST testeur, DEV développeur, REL relecteur, RS relecteur senior, SEC sécurité, HUM humain. Règle : L3 → RS ; L4 → TST, RS et SEC. Heures = heures de développeur estimées par l'architecte, **à recaler à J06c** ; elles ne comprennent pas le temps des humains.

## 1. Principes du minimum viable

1. **Option B au démarrage** : écritures par CSV (ERP ou Excel), reliées dans NocoDB. Option A visée le mercredi 21 octobre ; si elle n'est pas prête ce jour-là, B reste jusqu'au 31 (date unique de bascule).
2. **Aucun travail sur l'ERP en S42** (Défaut D2) : J07 et J08 (mise en ligne, champ `piece_id`) passent en S43 ou après, sans changement de l'archive.
3. **Trois workflows n8n** (W01 ingestion, W02 décisions humaines, W05 import) **plus W09** (alerte d'échec) et la route `/piece/<id>`. Sauvegarde, scellement, liens, registre, intégrité, alerte disque : **tâches planifiées de l'hôte** (H1 à H6). Contrôles : **vues SQL** affichées dans NocoDB et envoyées en CSV.
4. **La liste de contrôle de sécurité §3.1 de l'audit** est une condition du go : ses tâches sont avant le go dans les deux scénarios.

## 2. Tâches avant le go (lot MVP-0)

### Relevés et décisions — lundi 12 octobre

**ARC-001 — Relever l'existant du serveur** · L2 · 2,5 h · J01 · Dépend de : — · Postes : DEV, SEC, HUM (Direction : accès)
Critères : note d'une page, constatée sur la machine : versions de n8n et NocoDB, mode d'installation, moteur et volumes de leurs métadonnées, présence de `N8N_ENCRYPTION_KEY` et du secret NocoDB, espace disque, mémoire ; ports **vus de l'extérieur** (`nmap` depuis un autre réseau) et publications Docker (`docker ps`) ; rôles PostgreSQL utilisés (superutilisateur ou non) ; inventaire des jetons NocoDB et de leur compte créateur (sans les afficher) ; workflows existants et identifiants qu'ils utilisent (dont l'IA des devis). Aucun secret dans la note.

**ARC-002 — Vérifier les capacités supposées** · L2 · 3 h · J01 · Dépend de : ARC-001 · Postes : DEV, ARC
Critères : un essai oui/non consigné pour : source PostgreSQL externe dans NocoDB (lecture, écriture, liens par clé étrangère, vues SQL, message d'erreur d'un déclencheur lisible) ; restriction par table ou champ ; champs « créé par / modifié par » ou journal d'activité de NocoDB lisible par API ; inscription fermée et partage public désactivable ; double authentification ; nœud PostgreSQL de n8n avec paramètres liés ; nœuds de fichiers et `N8N_RESTRICT_FILE_ACCESS_TO` ; SHA-256 d'un binaire (Crypto ou Code) ; Execute Command désactivé ; en-tête personnalisé `X-Accel-Redirect` dans la réponse d'un webhook ; `EXECUTIONS_DATA_SAVE_ON_SUCCESS`. Chaque « non » active le repli prévu dans la conception, ou saisit l'architecte.

**ARC-003 — Préparer les décisions D1 à D16** · L3 · 1 h · J01–J04 · Dépend de : ARC-002 (pour D7) · Postes : ARC (prépare), HUM (Direction, comptable, responsable de validation)
Critères : une feuille par décision avec l'option par défaut de la conception (§12) ; réponses écrites et signées : D1, D2, D6, D9, D13 le lundi 12 ; D3, D4, D5, D7, D8, D10, D11, D12, D16 le mardi 13 ; D15 le mercredi 14 ; D14 avant J13.

**ARC-004 — Environnement de test** · L2 · 2 h · J03 · Dépend de : ARC-001 · Postes : DEV, REL
Critères : composition Docker (PostgreSQL, NocoDB, n8n) aux mêmes versions, ports liés à `127.0.0.1`, mots de passe propres non réutilisés ; `prefixe_identifiant = FT-TS` ; PDF d'essai marqués « SPÉCIMEN » ; arrêt puis relance : données présentes.

### Socle — mardi 13 octobre

**ARC-005 — Persistance (réduit)** · L4 · 3 h · J04 · Dépend de : ARC-001, D1 · Postes : DEV, TST, RS, SEC, HUM (Direction : accord, intervention hors heures)
Critères : sauvegarde complète de l'existant (NocoDB, n8n, CRM des devis) faite et relue **avant** toute modification ; volumes persistants montés pour NocoDB et n8n **sans changement de moteur** ; `N8N_ENCRYPTION_KEY` et secret NocoDB fixés, `600 root`, imprimés au coffre ; conteneur PostgreSQL dédié à `archive_compta`, non publié ; **redémarrage complet du serveur**, puis présence vérifiée des vues NocoDB, workflows, identifiants n8n, lignes du CRM ; formulaire devis du site essayé.

**ARC-006 — Schéma `archive_compta` et matrice des droits (migration 001)** · L4 · 4,5 h · J04 · Dépend de : ARC-005, D3, D4, D12 · Postes : ARC, TST, DEV, RS, SEC
Critères : tables et vues de la conception §4.1, §4.2 créées par migration rejouable ; contraintes `CHECK` des référentiels ; rôles `arch_owner` (NOLOGIN), `arch_fonctions` (NOLOGIN), `arch_nocodb`, `arch_n8n`, `arch_lecture`, `arch_admin` et matrice §4.5 ; tests : `TRUNCATE` et `DELETE` refusés pour tous les rôles de connexion ; `UPDATE compteurs` et `INSERT journal_audit` refusés pour `arch_nocodb` et `arch_n8n` ; aucun rôle de connexion superutilisateur ni propriétaire (`pg_roles`, `pg_tables`) ; `types_piece` avec `7_Paie` inactif ; `parametres` chargés.

**ARC-007 — Fonctions, déclencheurs, journal chaîné (migration 002)** · L4 · 9 h · J04–J06 · Dépend de : ARC-006 · Postes : ARC, TST (tests écrits avant), DEV, RS, SEC
Critères : fonctions de la conception §4.4 sauf `declarer_piece_manquante`, `rattacher_justificatif`, `corriger_piece` (ARC-022, ARC-025) ; déclencheurs §4.4 ; journal chaîné ; refus consignés dans `refus` sans exception. Tests : (a) première pièce 2025 → `FT-PC-2025-00001` ; (b) rejeu → même identifiant ; (c) 200 validations simultanées sur 20 connexions → 1 à 200 sans trou ni doublon ; (d) erreur après incrément → compteur inchangé ; (e) deux années en parallèle ; (f) 99999 dépassé → erreur ; (g) transition interdite → refus ; (h) modification ou `TRUNCATE` du journal → refus ; (i) `UPDATE empreinte_sha256` refusé pour tous les rôles ; (j) **restauration** : sauvegarde S1, 20 attributions, restauration de S1, recalage, nouvelle attribution → `…-00021` ; (k) altération d'une ligne du journal par `arch_owner` → chaîne rompue détectée ; (l) `attribution_suspendue` → refus consigné.

**ARC-008 — SFTP et Nginx** · L4 · 3,5 h · J04 · Dépend de : ARC-001 · Postes : DEV, RS, SEC
Critères : deux comptes SFTP (`poste` sur `depot/`, `imports` sur `imports/`), `internal-sftp`, chroot, sans shell ni redirection, clés dédiées, quota ; sous-domaine de l'archive : `/piece/` et `/apercu/` authentifiés **avant** traitement, `limit_req`, format vérifié, emplacement `/_objets/` interne ; en-têtes HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, CSP `sandbox`, `Content-Type` forcé ; format de journal sans nom de fichier, conservé 1 an ; `fail2ban` sur les échecs d'authentification.

**ARC-042 — Exposition réseau** (SEC-08) · L4 · 2 h · J04 · Dépend de : ARC-001, ARC-005 · Postes : DEV, SEC, RS
Critères : ports Docker liés à `127.0.0.1` ; éditeur n8n joignable seulement par tunnel SSH ; seul le chemin nommé du webhook devis publié ; NocoDB en HTTPS, inscription fermée ; n8n et NocoDB à la dernière version corrective, versions notées ; `nmap` extérieur : seuls 22, 80 (redirection) et 443.

**ARC-009 — Poste : fiche de collecte et script d'envoi** · L3 · 3 h · J04 · Dépend de : ARC-008, D12 · Postes : DEV, TST, RS, HUM (aide au tri)
Critères : fiche d'une page ; script sans mot de passe en clair, qui calcule les SHA-256, écrit le manifeste, copie avec reprise, dépose `_PRET` en dernier ; essai avec coupure réseau ; disque du poste chiffré (à confirmer selon le système).

### Chaîne de bout en bout — mercredi 14 et jeudi 15 octobre

**ARC-010 — Écrans NocoDB (réduit)** · L3 · 3 h · J06 · Dépend de : ARC-007, D13 · Postes : DEV, TST, RS, SEC, HUM (comptable)
Critères : `archive_compta` branchée avec `arch_nocodb` ; vues « File à trier » (sans champs de décision), « À valider », « Inventaire », « Écritures à relier » (seulement pièces `Classee` ou `Manquante`), « Contrôles », « Recherche » ; comptes nominatifs ; aucun partage public ; essais : l'aide au tri ne peut pas passer une pièce en `Classee` ; la Direction ne peut rien modifier.

**ARC-011 — W01 Ingestion** · L3 · 4 h · J06 · Dépend de : ARC-007, ARC-008, ARC-009 · Postes : TST, DEV, RS, SEC
Critères : 10 fichiers → 10 pièces `A_trier` ; fichier déjà connu d'un autre lot → `Doublon_exact` ; même fichier deux fois dans un lot → une pièce, un doublon ; lot interrompu (arrêt du conteneur) → repris après 15 min sans doublon ni compte faux ; code de lot existant avec manifeste différent → refus ; lot piégé : nom avec `../`, `$()`, `;`, HTML renommé `.pdf`, fichier au-dessus de 20 Mo → aucun effet hors de l'archive, motifs consignés ; sous-dossiers admis.

**ARC-012 — W02 Décisions humaines (validation, renvoi, rejet)** · L4 · 4 h · J06 · Dépend de : ARC-007, ARC-010 · Postes : ARC, TST, DEV, RS, SEC
Critères : Valider → identifiant, nom et chemin calculés, `Classee`, en une transaction ; Renvoyer ou Rejeter sans motif → refus visible ; même compte (ou même nom si le compte n'est pas lisible, D7) au tri et à la validation → refus consigné ; deux validations simultanées → identifiants consécutifs ; requêtes paramétrées uniquement (recherche de `{{` dans le texte SQL de l'export : zéro).

**ARC-043 — Tâches de l'hôte H1, H2, H3** · L4 · 3 h · J06 · Dépend de : ARC-006, ARC-011 · Postes : DEV, TST, RS, SEC
Critères : H1 : un objet nouveau passe à `root:root 0444` en moins de 2 min, n8n ne peut ni le modifier ni le supprimer (essai) ; H2 : lien d'arborescence au nom de la règle, chemin revalidé sous la racine, refus d'un chemin anormal ; H3 : chaque attribution présente dans `registre_ids/AAAA.log` en moins de 2 min et dans un segment GCS chiffré à nom unique.

**ARC-024 — Route `/piece/<id>` et `/apercu/<n>`** (remplace W08) · L3 · 1,5 h · J06 · Dépend de : ARC-008, ARC-012 · Postes : DEV, TST, RS, SEC
Critères : authentifié → PDF par `X-Accel-Redirect` (ou repli `par-id/`) ; non authentifié : 100 identifiants énumérés → 100 réponses 401 identiques, sans `Location` ; inconnu, mal formé, annulé → même 404 ; le journal Nginx ne contient que l'URI et l'utilisateur ; temps d'ouverture noté sur 10 pièces.

**ARC-013 — W09 Alerte d'échec** · L3 · 1,5 h · J06 · Dépend de : ARC-011 · Postes : DEV, TST, RS
Critères : erreur provoquée dans W01 et W02 → ligne `erreurs_workflow` et courriel en moins de 5 min, sans chemin, tiers ni montant ; récapitulatif au-delà de 5 par heure ; données d'exécution non conservées en cas de succès.

**ARC-014 — Sauvegarde H4, alerte disque et ancre H6, bucket GCS** · L4 · 3,5 h · J06b · Dépend de : ARC-005, ARC-006, D9, compte GCS (HUM) · Postes : DEV, TST, RS, SEC, HUM (Direction : compte Google avec double authentification, facturation)
Critères : fichiers puis dump, chiffrés par clé publique (clé privée absente du VPS) ; noms d'objets uniques ; compte de service en création seule : une suppression **et** un écrasement échouent (essai consigné) ; rétention posée (verrou après J12), accès public interdit, accès uniforme ; journal PostgreSQL et Nginx inclus ; alerte disque à 80 % essayée ; ancre du journal présente sur GCS et dans le courriel du soir ; première copie hors site lue depuis un autre poste (J06b).

**ARC-015 — Restauration complète et recalage** · L4 · 3 h · J06 (avant le go) · Dépend de : ARC-014, ARC-043 · Postes : DEV, TST, SEC, HUM (responsable de validation : témoin)
Critères : procédure de la conception §8.7 sur une machine à disque chiffré, clé privée sortie du coffre ; recalage exécuté ; comptes, compteurs, 20 empreintes, 3 ouvertures par `/piece/<id>`, identifiants n8n lisibles ; durée notée ; effacement noté ; procès-verbal signé.

**ARC-044 — Sonde externe et comptes à fort privilège** · L2 · 1 h · J06 · Dépend de : ARC-024 · Postes : DEV, SEC, HUM (Direction : double authentification Hostinger, Google, GitHub)
Critères : sonde sur NocoDB et `/piece/` (401 attendu), alerte essayée ; double authentification active sur les trois comptes (capture ou attestation).

**ARC-045 — Jeton NocoDB du site restreint** (SEC-11) · L4 · 1 h · J06 · Dépend de : ARC-010 · Postes : DEV, SEC, HUM (Direction : accord, car la configuration de production du site change)
Critères : compte de service NocoDB limité au CRM ; nouveau jeton en place dans l'environnement du site ; ancien révoqué ; appel API avec ce jeton sur une table de l'archive → refus ; formulaire devis essayé.

**ARC-016 — Essai sur 50 pièces et mesure** · L2 · 2,5 h · J06, J06c · Dépend de : ARC-010 à ARC-015, ARC-024, ARC-043 · Postes : TST, DEV, HUM (comptable, aide au tri)
Critères : 50 pièces réelles (en production, FT-PC) déposées, triées, validées ; zéro doublon, zéro trou ; temps par pièce et par étape ; `plan_avancement` rempli par le responsable de validation (J06c).

**ARC-017 — Formation et fiches réflexes** · L1 · 2 h · J06d · Dépend de : ARC-016 · Postes : DEV, HUM
Critères : chaque personne traite 10 pièces sans erreur de règle ; fiche par rôle, y compris « que faire en cas de coupure ».

**ARC-019 — Relecture finale de sécurité** · L4 · 1,5 h · veille du go · Dépend de : toutes les tâches ci-dessus · Postes : SEC, RS, DEV
Critères : chaque case de la liste §3.1 de l'audit cochée avec sa preuve ; `gitleaks` passé sur les exports ; valeur `SMTP_PASS` d'`api/.env.example` confirmée fictive par le développeur ; chaque contrôle déjà fait dans la tâche qui l'a créé.

**ARC-020 — Liste du go** · L2 · 0,5 h · go · Dépend de : ARC-015, ARC-016, ARC-019, ARC-018 (scénario B) · Postes : ARC, HUM (Direction)
Critères : persistance prouvée ; restauration et recalage réussis ; 50 pièces sans anomalie ; alerte fonctionnelle ; sauvegarde présente ; relecture de sécurité sans point bloquant ; option ERP décidée. Un « non » = no-go et date de reprise écrite.

## 3. Tâches après le go

**ARC-018 — Contrat ERP et format CSV** · L3 · 3 h · Dépend de : accès au code de l'ERP · Postes : DEV, ARC, RS, HUM (comptable : J04b, D16)
Critères : réponses au §7.5 de la conception ; extrait réel (ERP ou Excel) validé au format §7.2 ; source par exercice fixée ; décision écrite sur l'option A pour le 21.

**ARC-023 — W05 Import des écritures** · L3 · 5 h · J09b · Dépend de : ARC-018, ARC-007 · Postes : TST, DEV, RS, SEC
Critères : import conforme en une transaction ; même fichier redéposé → ignoré ; coupure en cours → rien d'écrit, rejeu complet ; écriture déséquilibrée, décimale, en-tête faux, source différente de `sources_exercice` → rejet en entier ; `piece_id_saisi` conservé au réimport ; apostrophe, point-virgule, guillemets, SQL dans `libelle` → importés tels quels sans effet ; `libelle` commençant par `=` → rejet ; au-delà du seuil → `A_confirmer` ; `depose_par` = compte SFTP réel.

**ARC-027a — Contrôles essentiels en vues** · L3 · 3 h · J09b · Dépend de : ARC-023 · Postes : ARC, TST, DEV, RS
Critères : vues E01, E02, E03, E04, E05, E11 et `v_balance` ; jeu d'essai avec un cas de chaque code, chacun détecté une fois ; une écriture avec motif sans identifiant → E01 (Défaut D5) ; une pièce contrôlée dont l'écriture disparaît → E03.

**ARC-027b — Contrôles complémentaires et envoi quotidien** · L3 · 2,5 h · J10 · Dépend de : ARC-027a · Postes : TST, DEV, RS
Critères : E06 à E10, E12, E13 ; `ecarts_acceptes` ; export CSV quotidien protégé contre l'injection de formules, envoyé au responsable de validation ; H5 en place (intégrité quotidienne et hebdomadaire, double référence `pieces` et `fichiers_deposes`).

**ARC-022 — Pièces manquantes** · L3 · 4 h · J10 · Dépend de : ARC-012 · Postes : TST, DEV, RS, HUM (Direction : texte de l'attestation, D14)
Critères : formulaire sur `declarations_manquantes` ; déclaration → pièce `Manquante` avec identifiant (année de la date estimée) ; seconde déclaration identique → refus sauf confirmation ; rejeu → même identifiant ; justificatif déposé, trié par un autre, rattaché → pièce `Classee` même identifiant, pièce déposée `Fusionnee` ; justificatif d'une autre année → annulation et nouvelle pièce `remplace_par`.

**ARC-025 — Corrections versionnées, annulation, réouverture d'un rejet** · L3 · 2,5 h · J10 · Dépend de : ARC-012, ARC-043 · Postes : TST, DEV, RS
Critères : correction du tiers → `pieces_versions` alimentée, nouveau lien, ancien lien dans `_versions/`, objet et empreinte inchangés ; changement d'année → refus et proposition d'annulation ; annulation d'une pièce citée → refus ; `Rejetee` → `A_trier` avec motif.

**ARC-026 — Tableau de bord** · L2 · 1,5 h · J11 · Dépend de : ARC-016 · Postes : DEV, REL, HUM
Critères : `v_tableau_bord` égal à un comptage direct ; écart au plan affiché ; lisible par la Direction.

**ARC-041 — Cloisonnement de n8n entre le site et l'archive** (SEC-18) · L3 · 1,5 h · J10 · Dépend de : ARC-001 · Postes : DEV, SEC, RS, HUM (Direction : accord, le webhook du site change)
Critères : webhook devis protégé par en-tête secret ; identifiants d'IA réservés aux workflows du site (projets séparés si la version le permet) ; aucun workflow de l'archive n'a de nœud vers un service extérieur hors SMTP (vérifié sur les exports).

**ARC-046 — Copie 3 sur disque externe** · L3 · 1,5 h · J11 (premier vendredi) · Dépend de : ARC-014 · Postes : DEV, SEC, HUM (personne désignée)
Critères : identifiant GCS en lecture seule sur le poste de copie ; copie incrémentale des objets chiffrés avec vérification d'empreinte ; disque chiffré ; procédure d'une page.

**ARC-047 — Quatre yeux vérifiés** (SEC-04) · L3 · 1 h · J11 · Dépend de : ARC-012, ARC-027b · Postes : TST, SEC, HUM (Direction)
Critères : essai de contournement (une personne trie et valide sous un autre nom) → refus ou E13 ; si la version ne permet pas mieux, risque résiduel signé par la Direction (D7).

**ARC-030 — Document et journal d'exploitation** · L1 · 2 h · J11 · Dépend de : ARC-014 · Postes : DEV, REL
Critères : une page ; relue par une autre personne.

**ARC-031 — Rapprochements bancaires** · L2 · 2 h · J13 · Dépend de : ARC-027a, D8 · Postes : DEV, REL, HUM (comptable)
Critères : solde comptable calculé depuis les écritures ; statut `Releve_manquant` ; `Rapproche` refusé sans relevé lié ou avec écart ; état détaillé joint ; valideur ≠ auteur.

**ARC-032 — Échantillon stratifié et chronométrage** · L2 · 2 h · J14 · Dépend de : ARC-024, ARC-027a, D15 · Postes : DEV, TST, HUM (responsable de validation)
Critères : tirage d'écritures avec graine notée et strates ; parcours « compte → écriture → pièce » chronométré ; chaque échec devient un écart corrigé puis re-chronométré.

**ARC-033 — Export en formats ouverts** · L2 · 2 h · J15 · Dépend de : ARC-014 · Postes : DEV, REL
Critères : un CSV par table (protégé contre les formules), objets, lisez-moi des colonnes ; relu dans un tableur sans NocoDB ; inclus dans la sauvegarde hebdomadaire.

**ARC-034 — Sauvegarde finale, restauration, démonstration** · L4 · 3 h · J16 · Dépend de : ARC-015, ARC-032, ARC-046 · Postes : DEV, TST, SEC, HUM (Direction)
Critères : restauration complète avec recalage ; copie 3 vérifiée ; trois chiffres des états financiers remontés jusqu'à leur pièce ; procès-verbal.

**ARC-035 — Rotation des secrets et clôture** · L4 · 2 h · J16–J17 · Dépend de : ARC-034 · Postes : SEC, DEV, RS
Critères : mots de passe, jetons et clés de construction changés ; comptes inutiles fermés ; liste des comptes à fort privilège signée ; RPO et RTO signés.

**ARC-021 — Option A dans l'ERP et mise en ligne de l'ERP (J07, J08)** · L4 · **à estimer par le développeur après lecture du code** · S43, visée le 21 · Dépend de : ARC-018, D2 · Postes : DEV, TST, RS, SEC
Critères : conception §7.3 ; l'ERP en ligne sur le même VPS passe aussi la liste §3.1 de l'audit (exposition, secrets).

## 4. Après le 31 octobre

| Id | Titre | Niveau | Heures | Raison du report |
|---|---|---|---|---|
| ARC-036 | Fin de conservation et alerte | L2 | 2 | Durée non confirmée (J12, D14) |
| ARC-037 | Archivage des PDF de l'ERP (F4) | L3 | à estimer | D6, code de l'ERP |
| ARC-039 | Option IA (désactivée), garde-fous de l'audit SEC-21 | L3 | à estimer | Décision J19 |
| ARC-040 | Restriction d'accès par type sensible ; rapport de consultation des documents | L3 | 2,5 | Avant tout lot `7_Paie` (inactif d'ici là) |
| ARC-048 | Migration des métadonnées NocoDB et n8n vers PostgreSQL | L4 | à estimer après ARC-001 | RS-11 : hors périmètre de la fiche |
| ARC-049 | W07b restauration automatique hebdomadaire, W10 courriel quotidien, W11 supervision interne | L2 | 5 | RS-35 |
| ARC-050 | Table `ecarts` avec cycle de vie, relances automatiques des duplicata | L3 | 4 | Les vues suffisent pour le 31 |
| ARC-051 | Liste des pièces vers l'ERP (F2) | L2 | 2 | Utile en option A seulement |
| ARC-052 | `.gitignore` (`.env.*`, clés, exports) ; port de développement lié à `127.0.0.1` ; plus de corps de réponse NocoDB dans les journaux du site | L2 | 1 | SEC-23, SEC-20 : fichiers hors de l'archive, accord nécessaire |

## 5. Charge et deux scénarios de calendrier (décision D2, non tranchée)

| Lot | Tâches | Heures |
|---|---|---|
| Socle et sécurité avant le go | ARC-001 à ARC-016, ARC-019, ARC-020, ARC-024, ARC-042 à ARC-045 | 63,5 |
| Formation | ARC-017 | 2 |
| Écritures et contrôles essentiels | ARC-018, ARC-023, ARC-027a | 11 |
| Reste avant la remise | ARC-022, ARC-025, ARC-026, ARC-027b, ARC-030 à ARC-035, ARC-041, ARC-046, ARC-047 | 27,5 |
| **Total jusqu'au 31 octobre** | hors ARC-021 (ERP, non estimé) | **104** |

### Scénario A — go technique le vendredi 16, limité à R1
- **Avant le go (12–16 oct.)** : socle et sécurité, **63,5 h** en 5 jours, soit environ 12,7 h par jour.
- Go du 16 : dépôt, attribution, rangement, persistance, restauration et recalage, alertes, liste de sécurité §3.1. La formation (ARC-017) passe au lundi 19 au matin.
- J09a (année la plus ancienne classée) décalé au 19–20 ; R2 et le critère « ouvrir la pièce depuis l'écriture » le mercredi 21 ; option A visée le 21.
- **Après le go (19–30 oct.)** : 2 + 11 + 27,5 = **40,5 h** en 10 jours ouvrés, plus l'ERP (ARC-021) si la Direction le maintient.

### Scénario B — go le lundi 19 à midi, samedi 17 en réserve
- **Avant le go (12–19 oct. midi)** : socle et sécurité, formation, écritures et contrôles essentiels (option B), **76,5 h** en 6,5 jours (samedi compris), soit environ 11,8 h par jour.
- Go du 19 : R1 et un R2 réduit (import des écritures et contrôles inverses en option B). J09a du 19 au 21. Option A visée le 21.
- **Après le go (19–30 oct.)** : **27,5 h**, plus l'ERP (ARC-021).

Dans les deux scénarios, la charge avant le go dépasse une journée normale de travail : aucun des deux ne tient pour un développeur seul à 8 h par jour (40 h en S42). Les leviers possibles relèvent de D2 : renfort nommé et daté sur les tâches L2 et L1, ou décalage du go. Sans aide au tri en S43, l'échéance n'est pas tenable quel que soit le scénario (jalons §5).

## 6. Chemin critique

ARC-001 → ARC-002 → ARC-005 → ARC-006 → ARC-007 → ARC-010 → ARC-011 → ARC-012 → ARC-043 → ARC-014 → ARC-015 → ARC-016 → ARC-019 → ARC-020 (go) → ARC-018 → ARC-023 → ARC-027a → ARC-032 → ARC-034.
Le scénario B déplace ARC-018, ARC-023 et ARC-027a avant ARC-020. En parallèle et aussi bloquants : ARC-003 (D1, D2, D3, D9 et D13 au plus tard le 13) ; ARC-008 et ARC-042 (exposition) ; achat du disque externe et ouverture du compte GCS avant le 14. Points sans retour : la première attribution en production (année du compteur, préfixe, format) ; ARC-005, qui touche le CRM des devis.

## 7. Ce qui doit être fait à la main

| Quoi | Qui | Quand |
|---|---|---|
| Décisions D1 à D16 | Direction, comptable, responsable de validation | 12–14 oct. ; D14 avant J13 |
| Accès au VPS ; accord pour ARC-005, ARC-041, ARC-045 (configuration de production du site) | Direction | 12–13 oct. |
| Compte Google et bucket GCS, double authentification Hostinger, Google, GitHub | Direction | 13–14 oct. |
| Achat du disque externe, de l'onduleur, d'un scanner si absent | Direction | avant le 14 |
| Garde de la clé privée des sauvegardes et des clés n8n et NocoDB (deux exemplaires au coffre) | Direction | 14 oct. |
| Numérisation, rangement du papier par lot, envoi | Aide au tri | dès le 13 (les lots attendent sur le poste) |
| Inventaire J02 saisi dans la table `inventaire` ; plan à J06c | Comptable ; responsable de validation | 13 et 15 oct. |
| Tri ; validation par une autre personne | Aide au tri, comptable ; comptable, responsable de validation | dès l'ingestion |
| Déclarations de pièces manquantes, demandes de duplicata, signature des attestations | Comptable ; Direction | jusqu'à J13 |
| CSV d'écritures déposés par le compte « imports » ; correspondance en option B ; confirmations d'import | Comptable ; responsable de validation | à partir du go |
| Rapprochements bancaires, état détaillé joint | Comptable, valideur distinct | J13–J14 |
| Correction ou acceptation documentée des écarts | Comptable, responsable de validation | J14–J15 |
| Témoins des restaurations, procès-verbaux | Responsable de validation, Direction | avant le go ; 30 oct. |
| Chronométrage de l'échantillon | Responsable de validation | 28 oct. |
| Copie 3 hebdomadaire, disque rangé sous clé | Personne désignée (à nommer) | chaque vendredi |
| Signature du risque résiduel des quatre yeux si nécessaire (D7) | Direction | après ARC-047 |
| Décision de go ; remise | Direction | 16 ou 19 oct. ; 31 oct. |
| Conservation du papier, aucune destruction | Tous | jusqu'à J12 et au-delà |
