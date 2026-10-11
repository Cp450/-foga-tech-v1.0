# Archivage comptable — Backlog de construction

Rédigé par l'architecte. Découpage de `01-CONCEPTION.md` v0.3 en tâches.

## Historique des versions

| Version | Date | Changements |
|---|---|---|
| 0.1 | 11 oct. 2026 | Première version (67 h avant le go, ERP en S42) |
| 0.2 | 11 oct. 2026 | Minimum viable de la revue senior : option B, ERP hors S42, trois workflows plus l'alerte, tâches de l'hôte, contrôles en vues ; tâches de sécurité avant le go ; ARC-041 ; deux scénarios (D2) |
| 0.3 | 11 oct. 2026 | Corrections NV-01 à NV-11 et NR-01 à NR-14 reportées dans les critères des tâches ; ARC-046 (copie 3) et ARC-052a (`.gitignore`) avant le go ; ARC-022 avant J09a ; J09b et J10 décalés ; ARC-015b (liens après restauration) ; calendrier jour par jour dans les deux scénarios, avec la charge par jour et les heures de renfort nécessaires pour tenir 8 h par jour |

**Lecture.** Niveau : L1 mécanique ; L2 standard ; L3 complexe (règle croisée, état, transaction) ; L4 critique (perte de données, d'argent, sécurité) ; en cas de doute, le plus haut. Postes : ARC architecte, TST testeur, DEV développeur, REL relecteur, RS relecteur senior, SEC sécurité, HUM humain. Règle : L3 → RS ; L4 → TST, RS et SEC. Heures = heures de développeur estimées par l'architecte, **à recaler à J06c** ; le temps des humains n'est pas compté.

## 1. Principes du minimum viable

1. **Option B au démarrage** ; option A visée le mercredi 21 octobre ; date unique de bascule : si A n'est pas prête le 21, B reste jusqu'au 31. L'option B par défaut vaut « option ERP décidée » pour le go (ARC-020).
2. **Aucun travail sur l'ERP en S42** (Défaut D2) : J07 et J08 passent en S43 (ARC-021).
3. **Trois workflows n8n** (W01, W02, W05) **plus W09** et la route `/piece/<id>` ; tâches de l'hôte H1 à H6 ; contrôles en vues SQL.
4. **La liste de contrôle de sécurité de l'audit** (§3.1 et ajouts du §5.3 de `05-AUDIT-SECURITE.md`) est une condition du go.
5. **Calendrier** : `docs/programme/JALONS-EXECUTION.md` et la recette (`03-PLAN-RECETTE.md` §6 : vague R1, REC-064, REC-073, REC-094, REC-096) sont à réaligner par l'orchestrateur sur le scénario retenu ; ce backlog ne les modifie pas.

## 2. Tâches avant le go

**ARC-001 — Relever l'existant du serveur** · L2 · 2,5 h · Dépend de : — · Postes : DEV, SEC, HUM (Direction : accès)
Critères : note d'une page, constatée sur la machine : versions de n8n et NocoDB, mode d'installation, moteur et volumes de leurs métadonnées, présence de `N8N_ENCRYPTION_KEY` et du secret NocoDB, espace disque, mémoire ; ports vus de l'extérieur (`nmap`) et publications Docker ; rôles PostgreSQL utilisés ; inventaire des jetons NocoDB et de leur compte créateur (sans les afficher) ; workflows existants et identifiants qu'ils utilisent ; publication actuelle du webhook devis (préfixe ou exacte). Aucun secret dans la note.

**ARC-002 — Vérifier les capacités supposées** · L2 · 3 h · Dépend de : ARC-001 · Postes : DEV, ARC
Critères : essai oui/non consigné pour : source PostgreSQL externe dans NocoDB, branchée **deux fois** avec deux rôles et partagée avec des utilisateurs différents (NR-03) ; liens, vues, message d'erreur d'un déclencheur ; champs « créé par / modifié par » ou journal d'activité lisible par API ; inscription fermée, partage public désactivable, double authentification ; nœud PostgreSQL avec paramètres liés ; nœuds de fichiers et restriction d'accès ; SHA-256 d'un binaire avec `NODE_FUNCTION_ALLOW_BUILTIN=crypto` ; Execute Command désactivé ; en-tête `X-Accel-Redirect` dans la réponse d'un webhook ; rétention des exécutions ; gestion des utilisateurs de n8n et double authentification. Chaque « non » active le repli de la conception.

**ARC-003 — Préparer les décisions D1 à D16** · L3 · 1 h · Dépend de : ARC-002 (pour D7) · Postes : ARC, HUM (Direction, comptable, responsable de validation)
Critères : une feuille par décision avec l'option par défaut (§12 de la conception) ; D1, D2, D6, D9 (dont **deux buckets, avant leur création**), D13 signées le lundi 12 ; D3, D4, D5, D7, D8, D10, D11, D12, D16 le mardi 13 ; D15 le mercredi 14 ; D14 avant J13.

**ARC-004 — Environnement de test** · L2 · 2 h · Dépend de : ARC-001 · Postes : DEV, REL
Critères : composition Docker aux mêmes versions, ports sur `127.0.0.1`, mots de passe propres ; `prefixe_identifiant = FT-TS` ; PDF « SPÉCIMEN » ; données présentes après arrêt et relance.

**ARC-052a — `.gitignore` avant la création des secrets** (SEC-23) · L2 · 0,5 h · Dépend de : accord de l'utilisateur · Postes : DEV, SEC, HUM
Critères : `.env.*` (sauf `.env.example`), `*.key`, `*-sa.json`, `*credentials*.json`, clés `age`, exports bruts de workflows ignorés ; `gitleaks` passé ; valeur `SMTP_PASS` d'`api/.env.example` confirmée fictive.

**ARC-005 — Persistance (réduit)** · L4 · 3,5 h · Dépend de : ARC-001, D1 · Postes : DEV, TST, RS, SEC, HUM (Direction : accord, hors heures)
Critères : sauvegarde de l'existant relue avant toute modification ; volumes persistants pour NocoDB et n8n sans changement de moteur ; clés fixées, `600 root`, au coffre ; conteneur PostgreSQL dédié, non publié, données dans `/srv/pgdata-archive` ; conteneur n8n monté seulement sur `depot/`, `entree/`, `objets_tmp/`, `objets/`, `quarantaine/`, `imports/` (lecture seule) (`docker inspect`, NR-05) ; redémarrage complet du serveur et vérifications ; formulaire devis essayé.

**ARC-006 — Schéma, rôles et droits (migration 001)** · L4 · 5 h · Dépend de : ARC-005, D3, D4, D12 · Postes : ARC, TST, DEV, RS, SEC
Critères : tables et vues §4.1, §4.2 (dont `correspondance_personnes`, `ancres_journal`) ; contraintes `CHECK` ; rôles `arch_owner`, `arch_admin` (`NOLOGIN`, membre d'aucun rôle), `arch_fonctions` (`NOLOGIN`), `arch_nocodb`, `arch_nocodb_rv`, `arch_n8n`, `arch_lecture`, `arch_chaine` ; matrice §4.5 ; `ALTER DEFAULT PRIVILEGES … REVOKE EXECUTE … FROM PUBLIC` avant toute fonction. Tests : `TRUNCATE` et `DELETE` refusés ; `UPDATE compteurs` et `INSERT journal_audit` refusés ; aucun rôle de connexion superutilisateur ni propriétaire ; `arch_nocodb` ne peut insérer ni demande `Annuler`, ni `ecarts_acceptes`, ni `controles_pieces`, ni passer un rapprochement à `Rapproche` (NR-03).

**ARC-007 — Fonctions, déclencheurs, journal (migration 002)** · L4 · 10,5 h · Dépend de : ARC-006 · Postes : ARC, TST (tests écrits avant), DEV, RS, SEC
Critères : fonctions §4.4 sauf `declarer_piece_manquante`, `rattacher_justificatif`, `corriger_piece` (ARC-022, ARC-025) ; `REVOKE EXECUTE … FROM PUBLIC` puis `GRANT` fonction par fonction ; `SET search_path = archive, pg_temp` ; contrôle de `session_user` ; journal non chaîné à l'écriture et `chainer_journal()` ; refus selon le modèle §4.4 (contrôles avant écriture, point de sauvegarde, état terminal, un refus par heure). Tests : (a) première pièce 2025 → `FT-PC-2025-00001` ; (b) rejeu → même identifiant ; (c) 200 validations sur 20 connexions → 1 à 200 sans trou ni doublon ; (d) erreur après incrément → compteur inchangé ; (e) deux années en parallèle ; (f) 99999 dépassé ; (g) transition interdite → refus ; (h) modification ou `TRUNCATE` du journal → refus ; (i) `UPDATE empreinte_sha256` refusé pour tous ; (j) **restauration** : sauvegarde S1, 20 attributions, restauration, recalage depuis les segments → 20 pièces réintégrées (`reintegree`), 20 numéros de réserve `Annulee`, nouvelle attribution `…-00041` ; (k) altération d'une ligne déjà chaînée → rupture détectée par la vérification ; (l) `attribution_suspendue` → refus consigné ; (m) `arch_nocodb` appelle chaque fonction → refus de droit (`\df+` sans `PUBLIC`) (NR-01) ; (n) `FT-TS` refusé en production (NV-10) ; (o) refus en milieu de `appliquer_import` → rien d'écrit sauf la ligne `refus` (NV-05) ; (p) import de 10 000 lignes pendant des liaisons en option B → aucune attente globale ni interblocage (NV-03) ; (q) `Rejeter` sur une pièce `A_trier` sans champs de tri → `Rejetee` (NV-02).

**ARC-008 — SFTP et Nginx** · L4 · 4 h · Dépend de : ARC-001 · Postes : DEV, RS, SEC
Critères : comptes SFTP `poste` et `imports`, `internal-sftp -P symlink,hardlink`, chroot, sans shell, `AllowTcpForwarding no`, clés dédiées, quota ; `Match User` du développeur seul autorisé au tunnel (NR-14) ; site Nginx de l'archive : `/piece/` et `/apercu/` authentifiés avant traitement, `limit_req`, format vérifié, `/_objets/` interne **seulement dans ce site**, en-tête secret vers n8n, `Cache-Control: no-store, private` ; site web : webhook devis par `location =`, `proxy_ignore_headers X-Accel-Redirect` partout ailleurs (NR-09) ; en-têtes HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Content-Type` forcé ; journal sans nom de fichier, conservé 1 an ; `fail2ban`. Essai : lien symbolique créé par SFTP → refusé.

**ARC-042 — Exposition réseau** (SEC-08) · L4 · 2 h · Dépend de : ARC-001, ARC-005 · Postes : DEV, SEC, RS
Critères : ports Docker sur `127.0.0.1` ; éditeur n8n par tunnel seulement ; NocoDB en HTTPS, inscription fermée ; versions correctives à jour ; `nmap` extérieur : 22, 80 (redirection), 443 seulement ; depuis Internet, `/webhook/<chemin de l'archive>` → 404.

**ARC-009 — Poste : fiche de collecte et script d'envoi** · L3 · 3 h · Dépend de : ARC-008, D12 · Postes : DEV, TST, RS, HUM (aide au tri)
Critères : fiche d'une page (dont « fermer le navigateur », session par personne) ; script sans mot de passe en clair, SHA-256, manifeste sans chemin absolu ni `..`, copie avec reprise, `_PRET` en dernier ; essai avec coupure réseau ; disque du poste chiffré (à confirmer selon le système).

**ARC-010 — Écrans NocoDB, deux bases** · L3 · 4 h · Dépend de : ARC-007, D13 · Postes : DEV, TST, RS, SEC, HUM (comptable, responsable de validation)
Critères : « Archive – saisie » (`arch_nocodb`) et « Archive – validation » (`arch_nocodb_rv`, partagée avec le seul responsable de validation et le développeur) ; vues §6 ; comptes nominatifs ; aucun partage public. Essais : l'aide au tri ne peut créer ni demande d'annulation, ni écart accepté, ni contrôle d'échantillon ; la Direction ne peut rien modifier. Si la restriction par base n'existe pas : repli §4.3 et feuille de risque pour D7.

**ARC-011 — W01 Ingestion** · L3 · 4,5 h · Dépend de : ARC-007, ARC-008, ARC-009 · Postes : TST, DEV, RS, SEC
Critères : 10 fichiers → 10 pièces `A_trier` ; doublon d'un autre lot → `Doublon_exact` ; même fichier deux fois dans un lot → une pièce, un doublon ; **coupure pendant la copie d'un fichier de 20 Mo puis rejeu → aucun objet tronqué, pièce correcte (NV-01, REC-106)** ; objet préexistant d'empreinte différente → lot `Erreur` et alerte (NR-11) ; lot interrompu repris après 15 min sans doublon ; **même code de lot déjà ingéré → refus « lot déjà ingéré » avec le nombre de doublons signalé, rien de créé (NV-06, REC-114)** ; lot piégé : `../`, chemin absolu, lien symbolique, `$()`, `;`, HTML renommé `.pdf`, fichier de plus de 20 Mo → aucun effet hors du lot, motifs consignés (NR-04) ; sous-dossiers admis.

**ARC-012 — W02 Décisions humaines (validation, renvoi, rejet)** · L4 · 4,5 h · Dépend de : ARC-007, ARC-010 · Postes : ARC, TST, DEV, RS, SEC
Critères : Valider → identifiant, nom, chemin, `Classee` en une transaction ; **Rejeter une pièce `A_trier` illisible (sans date, tiers ni montant) → `Rejetee` (NV-02, REC-176)** ; Renvoyer ou Rejeter sans motif → refus, décision effacée (pas de boucle, NR-13) ; même compte (ou nom, D7) au tri et à la validation → refus ; validations simultanées → identifiants consécutifs ; aucun `{{` dans le texte SQL de l'export.

**ARC-043 — Tâches de l'hôte H1, H2, H3, H6** · L4 · 4 h · Dépend de : ARC-006, ARC-011 · Postes : DEV, TST, RS, SEC
Critères : H1 seul script root, minimal ; `objets/` appartient à root en `1733` ; un objet valide est scellé en moins de 2 min et n8n ne peut ni le modifier, ni le supprimer, ni lister le répertoire ; **lien symbolique, lien physique et fichier dont l'empreinte diffère du nom, déposés dans `objets/`, sont refusés, mis en quarantaine, cible intacte (NR-02, NR-11)** ; H2 : lien au nom de la règle, chemin revalidé ; H3 : attribution dans `registre_ids/AAAA.log` (`chattr +a`, `0640`, non monté dans n8n) et dans un segment chiffré du bucket `dumps-registre` en moins de 2 min (NR-06) ; H6 : `chainer_journal()` puis ancre sur GCS et dans le courriel du soir ; alerte disque à 80 % essayée.

**ARC-024 — Route `/piece/<id>` et `/apercu/<n>`** · L3 · 2 h · Dépend de : ARC-008, ARC-012 · Postes : DEV, TST, RS, SEC
Critères : authentifié → PDF par `X-Accel-Redirect` (ou repli `par-id/`) ; non authentifié : 100 identifiants → 100 réponses 401 identiques, sans `Location` ; inconnu, mal formé, annulé → même 404 ; `/apercu/` refuse une pièce classée, `/piece/` une pièce `A_trier` (NR-10) ; `Cache-Control: no-store, private` présent ; **lecteur PDF des navigateurs du bureau essayé avec `CSP: sandbox` : retiré s'il bloque (SEC-13)** ; temps d'ouverture noté sur 10 pièces.

**ARC-013 — W09 Alerte d'échec** · L3 · 1,5 h · Dépend de : ARC-011 · Postes : DEV, TST, RS
Critères : erreur provoquée dans W01 et W02 → ligne et courriel en moins de 5 min, sans chemin, tiers ni montant ; récapitulatif au-delà de 5 par heure ; exécutions réussies non conservées.

**ARC-014 — Sauvegarde H4 et deux buckets GCS** · L4 · 4 h · Dépend de : ARC-005, ARC-006, D9 (choix fait **avant** la création des buckets), compte GCS (HUM) · Postes : DEV, TST, RS, SEC, HUM (Direction : compte Google avec double authentification, facturation)
Critères : buckets `dumps-registre` (rétention 400 jours **verrouillée**) et `objets` (rétention provisoire) (NR-07) ; chiffrement par clé publique, clé privée absente du VPS ; noms uniques ; compte de service avec création et lecture, sans suppression ni écrasement (essai consigné : une suppression et un écrasement échouent) ; présence et taille vérifiées ; objets des pièces `Rejetee` jamais envoyés dans `objets` (NV-09) ; journaux PostgreSQL et Nginx inclus ; accès public interdit ; première copie hors site lue depuis un autre poste (J06b).

**ARC-046 — Copie 3 sur disque externe, avant le go** · L3 · 1,5 h · Dépend de : ARC-014 ; disque acheté (HUM) · Postes : DEV, SEC, HUM (personne désignée)
Critères : identifiant GCS en lecture seule sur le poste de copie ; copie incrémentale des deux buckets (objets, dernier dump, segments du registre, ancre) avec vérification d'empreinte (NV-11) ; disque chiffré ; procédure d'une page ; **les trois copies existent avant le go (REC-094)**.

**ARC-015 — Restauration complète et recalage** · L4 · 3 h · Dépend de : ARC-014, ARC-043 ; dans le scénario B aussi ARC-023 · Postes : DEV, TST, SEC, HUM (responsable de validation : témoin)
Critères : procédure §8.7 sur une machine à disque chiffré, clé privée sortie du coffre ; recalage depuis les segments GCS, marge de 20 numéros `Annulee`, pièces réintégrées listées ; comptes, compteurs, 20 empreintes, chaîne du journal contre la dernière ancre, 3 ouvertures par `/piece/<id>`, identifiants n8n lisibles ; dans le scénario B, **3 liens écriture → pièce vérifiés (REC-096)** ; durée et effacement notés ; procès-verbal.

**ARC-044 — Sonde externe et comptes à fort privilège** · L2 · 1 h · Dépend de : ARC-024 · Postes : DEV, SEC, HUM (Direction)
Critères : sonde sur NocoDB et `/piece/` (401 attendu), alerte essayée ; double authentification active sur Hostinger, Google, GitHub.

**ARC-045 — Jeton NocoDB du site restreint** (SEC-11) · L4 · 1 h · Dépend de : ARC-010 · Postes : DEV, SEC, HUM (Direction : accord)
Critères : compte de service limité au CRM ; nouveau jeton en place ; ancien révoqué ; appel sur une table de l'archive → refus ; formulaire devis essayé. Sans accord : constat noté ouvert au go.

**ARC-016 — Essai sur 50 pièces et mesure** · L2 · 2,5 h · Dépend de : ARC-010 à ARC-014, ARC-024, ARC-043 · Postes : TST, DEV, HUM (comptable, aide au tri)
Critères : 50 pièces réelles (FT-PC) déposées, triées, validées, dont au moins une rejetée depuis `A_trier` ; zéro doublon, zéro trou ; temps par pièce et par étape ; `plan_avancement` rempli (J06c).

**ARC-019 — Relecture finale de sécurité** · L4 · 1,5 h · Dépend de : tout ce qui précède · Postes : SEC, RS, DEV
Critères : chaque case de la liste §3.1 et des ajouts §5.3 de l'audit cochée avec sa preuve ; **vérification « aucun nœud extérieur hors SMTP dans les workflows de l'archive » faite sur les exports (SEC-18)** ; `gitleaks` passé.

**ARC-020 — Liste du go** · L2 · 0,5 h · Dépend de : ARC-015, ARC-016, ARC-019, ARC-046 · Postes : ARC, HUM (Direction)
Critères : persistance prouvée ; restauration et recalage réussis ; trois copies présentes ; 50 pièces sans anomalie ; alerte fonctionnelle ; relecture de sécurité sans point bloquant ; option B par défaut actée (vaut décision ERP). Un « non » = no-go et date de reprise écrite.

## 3. Tâches après le go (ou avant, selon le scénario)

**ARC-022 — Pièces manquantes** · L3 · 4,5 h · **avant le début de J09a** · Dépend de : ARC-012 · Postes : TST, DEV, RS, HUM (Direction : texte de l'attestation, D14)
Critères : déclaration → `Manquante` avec identifiant ; déclaration identique → refus sauf confirmation ; rejeu → même identifiant ; justificatif trié par un autre et rattaché → `Classee`, même identifiant, valeurs du justificatif reprises avec version, pièce déposée `Fusionnee` exclue des doublons et de l'inventaire (NV-07) ; justificatif d'une autre année avec écriture citante → écriture reliée à la nouvelle pièce puis ancienne annulée.

**ARC-017 — Formation et fiches réflexes** · L1 · 2 h · Dépend de : ARC-016 · Postes : DEV, HUM
Critères : chaque personne traite 10 pièces sans erreur, dont un rejet depuis `A_trier` ; fiche par rôle (coupure, fermeture du navigateur).

**ARC-018 — Contrat ERP et format CSV** · L3 · 3 h · Dépend de : accès au code de l'ERP · Postes : DEV, ARC, RS, HUM (comptable : J04b, D16)
Critères : réponses au §7.5 de la conception ; extrait réel validé au format §7.2 ; `correspondance_personnes` remplie ; source par exercice fixée ; décision écrite sur l'option A pour le 21.

**ARC-023 — W05 Import des écritures** · L3 · 5,5 h · Dépend de : ARC-018, ARC-007 · Postes : TST, DEV, RS, SEC
Critères : import conforme en une transaction ; fichier redéposé → ignoré ; coupure → rien d'écrit, rejeu complet ; écriture déséquilibrée, décimale, en-tête faux, source différente, `saisi_par` vide ou inconnu de `correspondance_personnes` → rejet en entier ; `piece_id_saisi` conservé ; apostrophe, point-virgule, guillemets, SQL dans `libelle` → sans effet ; `libelle` commençant par `=` → rejet ; au-delà du seuil → `A_confirmer`, confirmable seulement par `arch_nocodb_rv` ; `depose_par` = compte SFTP réel.

**ARC-027a — Contrôles essentiels en vues** · L3 · 3 h · Dépend de : ARC-023 · Postes : ARC, TST, DEV, RS
Critères : E01, E02, E03, E04, E05, E11 et `v_balance` ; un cas de chaque code détecté une fois ; motif sans identifiant → E01 ; pièce contrôlée dont l'écriture disparaît → E03 ; pièce contrôlée puis corrigée → n'est plus « contrôlée » (NV-08).

**ARC-015b — Liens écriture → pièce après restauration** (scénario A seulement) · L3 · 1 h · Dépend de : ARC-023 · Postes : DEV, TST, HUM (témoin)
Critères : restauration de la dernière sauvegarde de 2 h sur l'environnement de test du VPS ; 3 liens écriture → pièce ouverts ; procès-verbal. Rend REC-096 satisfaisable si la recette déplace sa partie « liens » en R2 (à faire par l'orchestrateur).

**ARC-025 — Corrections approuvées, annulation, réouverture** · L3 · 3 h · Dépend de : ARC-012, ARC-043 · Postes : TST, DEV, RS
Critères : demande `Corriger` du comptable appliquée seulement après approbation par `arch_nocodb_rv` ; version, nouveau lien, ancien lien dans `_versions/`, objet inchangé ; changement d'année → refus et proposition d'annulation ; annulation d'une pièce citée → refus ; `Rejetee` → `A_trier` par le seul rôle de validation.

**ARC-027b — Contrôles complémentaires, intégrité et vérification de la chaîne** · L3 · 3 h · Dépend de : ARC-027a, ARC-043 · Postes : TST, DEV, RS, SEC
Critères : E06 à E10, E12, E13 ; `ecarts_acceptes` ; export CSV quotidien protégé contre les formules ; H5 : intégrité (hors `Fusionnee`, double référence), **chaîne du journal recalculée depuis l'ancre GCS précédente, rupture → E06 et alerte (NR-08)** ; contenu canonique conforme à §4.2.

**ARC-026 — Tableau de bord** · L2 · 1,5 h · Dépend de : ARC-016 · Postes : DEV, REL, HUM
Critères : `v_tableau_bord` égal à un comptage direct ; écart au plan affiché.

**ARC-041 — Cloisonnement de n8n** (SEC-18) · L3 · 1,5 h · Dépend de : ARC-001 · Postes : DEV, SEC, RS, HUM (Direction : accord)
Critères : webhook devis protégé par en-tête secret ; identifiants d'IA réservés aux workflows du site.

**ARC-047 — Quatre yeux vérifiés** (SEC-04) · L3 · 1 h · Dépend de : ARC-012, ARC-027b · Postes : TST, SEC, HUM (Direction)
Critères : essai de contournement → refus ou E13 ; sinon risque résiduel signé (D7).

**ARC-030 — Document et journal d'exploitation** · L1 · 2 h · Postes : DEV, REL
Critères : une page, dont la procédure root de retrait d'un objet faux et le contrôle mensuel de l'ancre ; relue par une autre personne.

**ARC-031 — Rapprochements bancaires** · L2 · 2 h · Dépend de : ARC-027a, D8 · Postes : DEV, REL, HUM (comptable)
Critères : solde comptable calculé ; `Releve_manquant` ; `Rapproche` seulement par `arch_nocodb_rv`, refusé sans relevé lié ou avec écart.

**ARC-032 — Échantillon stratifié et chronométrage** · L2 · 2 h · Dépend de : ARC-024, ARC-027a, D15 · Postes : DEV, TST, HUM
Critères : tirage d'écritures avec graine et strates ; parcours chronométré ; échecs corrigés puis re-chronométrés.

**ARC-033 — Export en formats ouverts** · L2 · 2 h · Postes : DEV, REL
Critères : CSV par table protégés, objets, lisez-moi ; relu dans un tableur.

**ARC-034 — Sauvegarde finale, restauration, démonstration** · L4 · 3 h · Dépend de : ARC-015, ARC-032, ARC-046 · Postes : DEV, TST, SEC, HUM (Direction)
Critères : restauration complète avec recalage et liens écriture → pièce ; copie 3 vérifiée ; trois chiffres remontés jusqu'à leur pièce ; procès-verbal.

**ARC-035 — Rotation des secrets et clôture** · L4 · 2 h · Dépend de : ARC-034 · Postes : SEC, DEV, RS
Critères : secrets de construction changés ; comptes inutiles fermés ; liste signée ; RPO et RTO signés ; verrou du bucket `objets` posé si J12 a répondu.

**ARC-021 — Option A et mise en ligne de l'ERP (J07, J08)** · L4 · **à estimer après lecture du code** · S43 · Dépend de : ARC-018, D2 · Postes : DEV, TST, RS, SEC
Critères : §7.3 de la conception ; l'ERP passe la liste de sécurité de l'audit.

## 4. Après le 31 octobre

| Id | Titre | Niveau | Heures | Raison du report |
|---|---|---|---|---|
| ARC-036 | Fin de conservation et alerte | L2 | 2 | J12, D14 |
| ARC-037 | Archivage des PDF de l'ERP (F4) | L3 | à estimer | D6 |
| ARC-039 | Option IA (désactivée) | L3 | à estimer | J19 |
| ARC-040 | Droits par type sensible sur `/piece/` et NocoDB ; rapport de consultation | L3 | 2,5 | Avant tout lot `7_Paie` |
| ARC-048 | Migration des métadonnées NocoDB et n8n vers PostgreSQL | L4 | à estimer | RS-11 |
| ARC-049 | W07b, W10, W11 | L2 | 5 | RS-35 |
| ARC-050 | Table `ecarts` avec cycle de vie, relances des duplicata | L3 | 4 | Vues suffisantes |
| ARC-051 | Liste des pièces vers l'ERP (F2) | L2 | 2 | Option A |
| ARC-052b | Port de développement sur `127.0.0.1` ; plus de corps de réponse NocoDB dans les journaux du site | L2 | 0,5 | Autres fichiers, accord nécessaire |

## 5. Charge, calendrier et renfort (décision D2, non tranchée)

| Lot | Tâches | Heures |
|---|---|---|
| Socle et sécurité | ARC-001 à ARC-016 (sauf ARC-015b), ARC-019, ARC-020, ARC-024, ARC-042 à ARC-046, ARC-052a | 72,5 |
| Pièces manquantes | ARC-022 | 4,5 |
| Formation | ARC-017 | 2 |
| Écritures et contrôles essentiels | ARC-018, ARC-023, ARC-027a | 11,5 |
| Reste avant la remise | ARC-025, ARC-026, ARC-027b, ARC-030 à ARC-035, ARC-041, ARC-047 | 23 |
| Liens après restauration (scénario A seulement) | ARC-015b | 1 |
| **Total jusqu'au 31 octobre** | hors ARC-021 (ERP, non estimé) | **113,5 (B) ou 114,5 (A)** |

Hypothèse de capacité : 8 h par jour ouvré pour le développeur ; samedi 17 utilisable comme journée de réserve si la Direction l'accepte ; le lundi 19 au matin compte pour 4 h dans le scénario B.

**Contrainte de chaîne.** Même avec du renfort, la suite ARC-005 → 006 → 007 → 011 → 012 → 015 → 016 → 019 → 020 fait **35,5 h en série** à partir du mardi 13, par une même personne ou en relais. Le renfort ne réduit pas cette durée ; il prend les tâches parallèles (ARC-008, 009, 010, 013, 014, 024, 042 à 046, 052a), qui demandent un profil de développeur (L3 ou L4) relu par RS et SEC.

### Scénario A — go technique le vendredi 16 au soir, limité à R1

| Jour | Tâches | Charge | Au-delà de 8 h |
|---|---|---|---|
| Lun 12 | ARC-001, 002, 003, 004, 052a | 9 h | 1 |
| Mar 13 | ARC-005, 006, 008, 042 | 14,5 h | 6,5 |
| Mer 14 | ARC-007, 009 | 13,5 h | 5,5 |
| Jeu 15 | ARC-010, 011, 012, 043 | 17 h | 9 |
| Ven 16 | ARC-024, 013, 014, 046, 015, 044, 045, 016, 019, 020 | 18,5 h | 10,5 |
| Sam 17 (réserve) | ARC-022 | 4,5 h | 0 |
| Lun 19 | ARC-017 (formation 8 h–10 h), ARC-018, ARC-041 | 6,5 h | 0 |
| Mar 20 | ARC-023 | 5,5 h | 0 |
| Mer 21 | ARC-027a, ARC-015b, ARC-025 | 7 h | 0 |
| Jeu 22 | ARC-027b, ARC-026, ARC-047 | 5,5 h | 0 |
| Ven 23 | ARC-030, ARC-031 | 4 h | 0 |
| 26–30 oct. | ARC-032 (27), ARC-033 (29), ARC-034 (30), ARC-035 (30–31) | 9 h | 0 |

- **Avant le go : 72,5 h en 5 jours, soit 14,5 h par jour. Renfort nécessaire pour tenir 8 h par jour : 32,5 h** (lundi 12 au vendredi 16). La chaîne de 35,5 h tient du mardi au vendredi à environ 8,9 h par jour : le développeur ne descend à 8 h que si le renfort prend aussi une tâche de la chaîne (ARC-011 ou ARC-012).
- Après le go : 42 h en 9,5 jours ouvrés, soit environ 4,4 h par jour, ce qui laisse environ 3,5 h par jour pour l'ERP (ARC-021) et le soutien.
- Jalons : J09a du lundi 19 au mercredi 21 (ARC-022 faite le 17) ; J09b du mercredi 21 au jeudi 22 (après ARC-023) ; J10 du jeudi 22 au lundi 26, samedi 24 en réserve ; J11 vendredi 23 ; J13 lundi 26 et mardi 27 ; J14 mercredi 28. R2 et le critère « ouvrir la pièce depuis l'écriture » le mercredi 21. REC-096 : par ARC-015b (21 octobre), si la recette l'accepte.

### Scénario B — go le lundi 19 à midi, samedi 17 en réserve

| Jour | Tâches | Charge | Au-delà de la capacité |
|---|---|---|---|
| Lun 12 | ARC-001, 002, 003, 004, 052a | 9 h | 1 |
| Mar 13 | ARC-005, 006, 008, 042 | 14,5 h | 6,5 |
| Mer 14 | ARC-007, 009 | 13,5 h | 5,5 |
| Jeu 15 | ARC-010, 011, 012, 043 | 17 h | 9 |
| Ven 16 | ARC-024, 013, 014, 046, 016, 044, 045 | 13,5 h | 5,5 |
| Sam 17 | ARC-018, 023, 027a, 015 (après l'import : liens vérifiés) | 14,5 h | 6,5 |
| Lun 19 matin | ARC-022, 017, 019, 020 | 8,5 h | 4,5 (capacité 4 h) |
| 19 après-midi – 30 oct. | ARC-025, 026, 027b, 030 à 035, 041, 047 | 23 h | 0 |

- **Avant le go : 90,5 h en 6,5 jours, soit environ 13,9 h par jour. Renfort nécessaire pour tenir 8 h par jour : 38,5 h** (du lundi 12 au lundi 19 midi). Même contrainte de chaîne que A, plus ARC-018 → 023 → 015 le samedi.
- Après le go : 23 h en 9,5 jours, soit environ 2,4 h par jour, ce qui laisse la place à l'ERP (ARC-021) et au soutien.
- Jalons : J09a du lundi 19 après-midi au mercredi 21 ; J09b du mercredi 21 au jeudi 22 ; J10 du jeudi 22 au lundi 26 (samedi 24 en réserve) ; J13 26–27 ; J14 28. REC-096 satisfait par ARC-015 le samedi 17.

**Comparaison.** A demande moins de renfort (32,5 h contre 38,5 h) mais repousse le lien écriture → pièce au 21 ; B livre R1 et un R2 réduit au go mais exige le travail du samedi et des humains présents ce jour-là pour ARC-015. Sans renfort, aucun des deux ne tient à 8 h par jour. Sans aide au tri en S43, l'échéance n'est tenable dans aucun scénario (jalons §5). La compression de J09a à J13 sur les humains (comptable, aide au tri) est un risque à revoir à J11 : si le retard dépasse une journée, la Direction réduit le périmètre aux pièces des plus gros montants.

## 6. Cas bloquants de la recette signalés en échec par la revue v0.2

| Cas | Situation en v0.3 |
|---|---|
| REC-094 | Satisfaisable : ARC-046 avant le go, trois copies vérifiées par ARC-020 |
| REC-096 | Satisfaisable dans B (ARC-015 après ARC-023) ; dans A seulement si la recette déplace la partie « liens » en R2 (ARC-015b, 21 octobre) : la restauration qui précède un go du 16 ne peut pas porter sur des écritures qui ne sont pas encore importées |
| REC-106 | Satisfaisable : écriture temporaire, vérification, renommage, scellement après vérification (ARC-011, ARC-043) |
| REC-114 | Satisfaisable : lot déjà ingéré refusé avec le nombre de doublons signalé (ARC-011) |
| REC-176 | Satisfaisable pour P14 (rejet depuis `A_trier`, ARC-012) ; P12, P13, P18 et P21 restent dépendants de D4 |

## 7. Chemin critique

ARC-001 → ARC-002 → ARC-005 → ARC-006 → ARC-007 → ARC-011 → ARC-012 → ARC-043 → ARC-014 → ARC-046 → ARC-015 → ARC-016 → ARC-019 → ARC-020 (go) → ARC-022 (avant J09a) → ARC-018 → ARC-023 → ARC-027a → ARC-032 → ARC-034.
Le scénario B place ARC-018, ARC-023 et ARC-027a avant ARC-015. En parallèle et bloquants : ARC-003 (D1, D2, D9 dont le choix des buckets, D13 le 12 ; D3 le 13) ; ARC-008, ARC-042 ; achat du disque externe et compte GCS avant le 14. Points sans retour : première attribution en production ; création des buckets et verrou de `dumps-registre` ; ARC-005 (touche le CRM des devis).

## 8. Ce qui doit être fait à la main

| Quoi | Qui | Quand |
|---|---|---|
| Décisions D1 à D16, dont le renfort nommé et daté (D2) et le choix des buckets (D9) | Direction, comptable, responsable de validation | 12–14 oct. ; D14 avant J13 |
| Accords pour ARC-005, ARC-041, ARC-045, ARC-052a | Direction, utilisateur | 12–13 oct. |
| Compte Google, buckets, double authentification Hostinger, Google, GitHub | Direction | 13–14 oct. |
| Achat du disque externe, de l'onduleur, d'un scanner si absent | Direction | avant le 14 |
| Garde de la clé privée des sauvegardes et des clés n8n et NocoDB (deux exemplaires au coffre) | Direction | 14 oct. |
| Numérisation et envoi des lots | Aide au tri | dès le 13 (les lots attendent sur le poste) |
| Inventaire dans `inventaire` ; plan à J06c ; `correspondance_personnes` | Comptable ; responsable de validation | 13–15 oct. ; avant le premier import |
| Tri ; validation par une autre personne ; rejets des pièces illisibles | Aide au tri, comptable, responsable de validation | dès l'ingestion |
| Déclarations, duplicata, attestations signées | Comptable ; Direction | jusqu'à J13 |
| CSV d'écritures, correspondance en option B, confirmations d'import | Comptable ; responsable de validation | à partir du go |
| Approbation des corrections, annulations, contrôles, écarts acceptés, rapprochements | Responsable de validation (base « validation ») | en continu |
| Témoins des restaurations ; procès-verbaux de retrait des objets rejetés | Responsable de validation, Direction | avant le go, 21 (A), 30 oct. ; au besoin |
| Copie 3 (première avant le go, puis chaque vendredi) | Personne désignée (à nommer) | avant le go ; vendredis |
| Comparaison mensuelle de l'ancre du journal | Responsable de validation | chaque mois |
| Signature des risques résiduels (D7) si nécessaire | Direction | après ARC-010 et ARC-047 |
| Décision de go ; remise | Direction | 16 ou 19 oct. ; 31 oct. |
| Conservation du papier | Tous | jusqu'à J12 et au-delà |
