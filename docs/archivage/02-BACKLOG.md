# Archivage comptable — Backlog de construction

Version 0.1 du 11 octobre 2026, rédigée par l'architecte. Découpage de `01-CONCEPTION.md` en tâches, ordonnées selon les jalons du 12 au 31 octobre 2026 (`docs/programme/JALONS-EXECUTION.md`).

**Lecture.** Niveau : L1 mécanique ; L2 standard ; L3 complexe (règle croisée, état, transaction) ; L4 critique (risque de perte de données, d'argent ou de sécurité). En cas de doute, le niveau le plus haut est retenu. Postes de la chaîne : ARC architecte, TST testeur, DEV développeur, REL relecteur, RS relecteur senior, SEC sécurité, HUM humain (nommé dans la tâche). Règle : toute tâche L3 passe par RS ; toute tâche L4 passe par TST, RS et SEC. Les estimations sont en heures de développeur, établies par l'architecte sans mesure : **elles sont à recaler à J06c** (temps mesuré sur les 50 pièces d'essai).

## 1. Alerte de charge avant de commencer

Le minimum à construire avant le go ou no-go du vendredi 16 octobre (lot « MVP-0 », §2 à §4) représente environ **67 heures de développeur**. La même semaine, le développeur porte la mise en ligne de l'ERP (J03, J07, J08 : 4 jours-personne au plan, soit environ 32 heures). Le total dépasse ce qu'une personne seule peut faire en cinq jours. Cette conception ne tranche pas ; elle donne trois leviers à la Direction (question Q1 du compte rendu) :
1. Commencer la numérisation dès le mardi 13 octobre sur le poste, sans attendre le serveur : les lots s'accumulent dans `A_ENVOYER/` et seront ingérés plus tard sans perte (la collecte n'est pas sur le chemin critique de l'outil).
2. Décaler la partie ERP de J08 (champ `piece_id`, lien d'ouverture) au début de S43 et commencer en option B (ADR-04), ce qui ne change rien à l'archive.
3. Renforcer ponctuellement le développement (relecture, tests) pendant S42.

## 2. Lundi 12 octobre — J01, J03 : relevés et décisions

### ARC-001 — Relever l'existant du serveur
- **Niveau** L2 · **US** prérequis de toutes · **Jalon** J01 (lun 12) · **Estimation** 2 h · **Dépend de** — · **Postes** DEV, SEC, HUM (Direction : accès au VPS)
- **Critères** : une note d'une page indique, constatés sur la machine : versions de n8n et de NocoDB ; mode d'installation (conteneurs ou non) ; base utilisée par chacun ; volumes montés ou non ; espace disque libre ; mémoire ; ports ouverts ; présence d'un PostgreSQL sur l'hôte ; nombre de lignes du CRM des devis dans NocoDB. Aucun secret n'apparaît dans la note.

### ARC-002 — Vérifier les capacités de n8n et de NocoDB supposées par la conception
- **Niveau** L2 · **US** US-ARC-01, 06 · **Jalon** J01 (lun 12) · **Estimation** 3 h · **Dépend de** ARC-001 · **Postes** DEV, ARC
- **Critères** : sur la version installée (ou la même version en test), un essai écrit oui/non pour chaque point marqué « à vérifier » dans la conception : source PostgreSQL externe dans NocoDB ; affichage des vues SQL ; rôles et restriction par table ; champs « créé par / modifié par » ; désactivation du partage public ; nœud PostgreSQL de n8n avec paramètres ; lecture et écriture de fichiers sur disque ; calcul SHA-256 d'un binaire ; déclencheur d'erreur ; base PostgreSQL pour n8n. Pour chaque « non », le repli de la conception est confirmé ou l'architecte est saisi.

### ARC-003 — Décisions de règles à figer (humain)
- **Niveau** L3 (décisions irréversibles après la première attribution) · **US** US-ARC-01 · **Jalon** J01 (lun 12) puis J04 (mar 13) · **Estimation** 1 h de préparation DEV · **Dépend de** — · **Postes** ARC (prépare), HUM (Direction, responsable de validation, comptable)
- **Critères** : décision écrite et signée sur : année du compteur (année de la pièce, de l'exercice ou d'archivage) ; exercices concernés ; début de l'exercice ; noms des mois sans accents ; résolution et format de scan (PDF) ; une pièce = un fichier ; codes de type pour le nom de fichier ; règle de correction d'une date qui change d'année ; nom du responsable de validation ; liste nominative des utilisateurs et de leur rôle ; option A ou B provisoire.

### ARC-004 — Environnement de test sur le poste du développeur
- **Niveau** L2 · **US** US-SYS-10 · **Jalon** J03 (lun 12) · **Estimation** 2 h · **Dépend de** ARC-001 · **Postes** DEV, REL
- **Critères** : un fichier de composition lance PostgreSQL, NocoDB et n8n aux mêmes versions que la production, avec volumes ; arrêt puis relance : données présentes ; le fichier est versionné sans aucun secret (fichier d'environnement d'exemple seulement) ; données de test fictives uniquement.

## 3. Mardi 13 octobre — J04 : socle persistant et schéma

### ARC-005 — Persistance : instance PostgreSQL dédiée, volumes, migration de NocoDB et de n8n
- **Niveau** L4 · **US** US-SYS-04 ; critère 5 · **Jalon** J04 (mar 13) · **Estimation** 5 h · **Dépend de** ARC-001, ARC-002 · **Postes** ARC, DEV, TST, RS, SEC, HUM (Direction : accord pour l'intervention)
- **Critères** : sauvegarde complète de l'existant (NocoDB, n8n, CRM des devis) faite et relue **avant** toute modification ; PostgreSQL dédié avec données dans `/srv/archive/pgdata` ; NocoDB et n8n utilisent PostgreSQL pour leurs métadonnées ; **redémarrage complet du serveur**, puis présence vérifiée des tables, des vues NocoDB, des workflows, des identifiants n8n et des lignes du CRM ; le formulaire devis du site fonctionne toujours ; PostgreSQL n'écoute pas sur Internet.

### ARC-006 — Schéma `archive_compta` (migration 001)
- **Niveau** L4 · **US** US-ARC-01, 04, 05, 06, 07, 11 ; US-SYS-01 · **Jalon** J04 (mar 13) · **Estimation** 5 h · **Dépend de** ARC-005, ARC-003 · **Postes** ARC, TST, DEV, RS, SEC
- **Critères** : toutes les tables et vues du §4 de la conception créées par un fichier de migration numéroté et rejouable sur une base vide ; contraintes d'unicité (`id_piece`, `empreinte_sha256`, clés naturelles) et de format en place ; utilisateurs `arch_owner`, `arch_nocodb`, `arch_n8n`, `arch_lecture` créés avec les droits prévus ; tests : un `DELETE` sur `pieces` et sur `journal_audit` échoue pour `arch_nocodb` et `arch_n8n` ; une insertion avec un `id_piece` mal formé échoue ; référentiel `types_piece` et `parametres` initiaux chargés.

### ARC-007 — Fonction d'attribution et déclencheurs d'intégrité (migration 002)
- **Niveau** L4 · **US** US-ARC-01 ; critère 6 · **Jalon** J04–J06 (mar 13 – mer 14) · **Estimation** 6 h · **Dépend de** ARC-006 · **Postes** ARC, TST (écrit les tests avant), DEV, RS, SEC
- **Critères** : `attribuer_id_piece` conforme à ADR-03 ; déclencheurs : immutabilité de `id_piece`, `empreinte_sha256`, `chemin`, `nom_fichier` hors `arch_n8n` ; transitions T1 à T14 (refus de toute autre, refus des transitions « système » venant de `arch_nocodb`) ; champs obligatoires par statut ; quatre yeux sur les noms ; journal en ajout seul. **Tests** : (a) cas normal : première pièce de 2025 → `FT-PC-2025-00001` ; (b) rejeu sur la même pièce → même identifiant, compteur inchangé ; (c) 200 appels simultanés sur 200 pièces de la même année (20 connexions parallèles) → identifiants 1 à 200 sans trou ni doublon ; (d) erreur provoquée après l'incrément → compteur inchangé ; (e) deux années en parallèle → compteurs indépendants ; (f) dépassement à 99999 → erreur ; (g) transition interdite → erreur explicite ; (h) modification de `journal_audit` → erreur.

### ARC-008 — Arborescence disque, comptes, Nginx authentifié
- **Niveau** L4 (sécurité) · **US** US-ARC-03 ; US-SYS-12 (partiel) · **Jalon** J04 (mar 13) · **Estimation** 3 h · **Dépend de** ARC-001 · **Postes** DEV, RS, SEC
- **Critères** : répertoires de `/srv/archive/` créés avec les propriétaires et droits du §8.3 ; compte SFTP du poste limité à `depot/`, sans shell ; `/fichiers/` servi en HTTPS avec un compte par personne, sans liste de répertoires, journal d'accès avec le nom de l'utilisateur ; un accès sans authentification renvoie 401 ; un chemin hors de `fichiers/` est refusé ; aucun mot de passe dans la configuration versionnée.

### ARC-009 — Poste de numérisation : procédure et script d'envoi de lot
- **Niveau** L3 · **US** US-ARC-06 · **Jalon** J04 (mar 13) · **Estimation** 4 h · **Dépend de** ARC-003 (format), ARC-008 (compte SFTP) · **Postes** DEV, TST, RS, HUM (aide au tri : essai)
- **Critères** : une fiche d'une page (régler le scanner, une pièce par PDF, nommer le lot, ranger le papier dans la boîte du lot) ; un script lancé par double-clic qui calcule les SHA-256, écrit `manifest.csv`, copie le lot par SFTP avec reprise, dépose `_PRET` en dernier ; testé avec coupure réseau en cours de copie : relance sans doublon ni fichier tronqué ingéré. Système d'exploitation du poste : **à confirmer** (Hypothèse : Windows).

## 4. Mercredi 14 et jeudi 15 octobre — J06, J06b, J06c, J06d : chaîne de bout en bout

### ARC-010 — Écrans NocoDB : connexion, vues, formulaires, comptes
- **Niveau** L3 · **US** US-ARC-01, 04, 05, 06, 11 · **Jalon** J06 (mer 14) · **Estimation** 4 h · **Dépend de** ARC-007, ARC-003 (liste des utilisateurs) · **Postes** DEV, TST, RS, SEC, HUM (comptable : essai)
- **Critères** : `archive_compta` branchée avec `arch_nocodb` ; vues du §6 créées et verrouillées ; un compte nominatif par personne avec le rôle prévu ; partage public désactivé ou absent sur toutes les vues ; essai : l'aide au tri ne peut pas passer une pièce en `Classee` (refus de la base) ; la Direction ne peut rien modifier.

### ARC-011 — W01 Ingestion d'un lot
- **Niveau** L3 · **US** US-ARC-06 · **Jalon** J06 (mer 14) · **Estimation** 5 h · **Dépend de** ARC-007, ARC-008, ARC-009 · **Postes** TST, DEV, RS
- **Critères** : lot de 10 fichiers → 10 pièces `A_trier`, compteurs du lot justes ; un fichier déjà connu → `Doublon_exact`, pas de nouvelle pièce ; empreinte différente du manifeste → `Rejete_transfert` ; fichier non PDF → quarantaine ; lot sans manifeste → lot `Erreur` et alerte ; rejouer le même lot → aucune ligne de plus.

### ARC-012 — W02 et W03 : validation, attribution, renommage, rangement
- **Niveau** L4 · **US** US-ARC-01 ; critère 6 · **Jalon** J06 (mer 14 – jeu 15) · **Estimation** 6 h · **Dépend de** ARC-007, ARC-010, ARC-011 · **Postes** ARC, TST, DEV, RS, SEC
- **Critères** : décision « Valider » → identifiant attribué, fichier présent à `Archive/AAAA/N_Type/MM_Mois/` sous le nom de la règle, empreinte identique, statut `Classee` ; « Renvoyer » sans motif refusé ; même personne au tri et à la validation → refus ; panne simulée entre attribution et rangement → pièce `Classement_en_cours` reprise automatiquement, même identifiant ; fichier de destination existant avec une autre empreinte → arrêt, alerte, rien n'est écrasé ; deux validations simultanées → deux identifiants consécutifs.

### ARC-013 — W09 Alerte d'échec et file d'erreurs
- **Niveau** L3 · **US** US-SYS-08 · **Jalon** J06 (mer 14) · **Estimation** 2 h · **Dépend de** ARC-007 · **Postes** DEV, TST, RS
- **Critères** : une erreur provoquée dans W01 et dans W02 crée une ligne `erreurs_workflow` et un courriel en moins de 5 minutes ; le courriel ne contient ni montant, ni tiers, ni donnée personnelle ; plus de 5 erreurs en une heure → un seul récapitulatif ; procédure de reprise écrite et essayée une fois.

### ARC-014 — W07a Sauvegarde 3-2-1 (copies 1 et 2) et première copie hors site
- **Niveau** L4 · **US** US-SYS-04 ; critère 5 · **Jalon** J06b (mer 14) · **Estimation** 4 h · **Dépend de** ARC-005, ARC-006 ; bucket GCS créé (HUM) · **Postes** DEV, TST, RS, SEC, HUM (Direction : compte GCS et facturation)
- **Critères** : dumps des trois bases, export des workflows et fichiers nouveaux envoyés chaque nuit vers un bucket versionné ; compte de service sans droit de suppression (vérifié : une suppression échoue) ; présence et taille de l'objet distant vérifiées par le workflow ; échec simulé → alerte W09 ; première copie lue depuis un autre poste (J06b).

### ARC-015 — Restauration complète manuelle avant l'archivage en masse
- **Niveau** L4 · **US** critère 5 · **Jalon** J06 (mer 14 ou jeu 15, avant le go) · **Estimation** 3 h · **Dépend de** ARC-014 · **Postes** DEV, TST, SEC, HUM (responsable de validation : témoin)
- **Critères** : procédure d'une page suivie sur une machine qui n'est pas le VPS, à partir de GCS seulement ; nombres de pièces par statut et compteurs identiques à la production ; 20 empreintes identiques ; 3 pièces ouvertes depuis leur identifiant ; durée notée ; procès-verbal signé par le témoin.

### ARC-016 — Essai de bout en bout sur 50 pièces et mesure du temps
- **Niveau** L2 · **US** US-ARC-01, 06 · **Jalon** J06, J06c (mer 14 – jeu 15) · **Estimation** 3 h DEV (plus le temps des humains) · **Dépend de** ARC-010 à ARC-013 · **Postes** TST, DEV, HUM (comptable, aide au tri)
- **Critères** : 50 pièces réelles déposées, triées, validées, rangées ; zéro identifiant en double, zéro trou ; temps moyen par pièce et par étape mesuré ; taux de pièces par heure transmis à la Direction pour recalculer S43 (J06c) ; taille moyenne d'un fichier et temps d'ouverture d'une pièce notés (US-ARC-03).

### ARC-017 — Formation et fiche réflexe
- **Niveau** L1 · **US** — · **Jalon** J06d (jeu 15) · **Estimation** 3 h · **Dépend de** ARC-016 · **Postes** DEV, HUM (comptable, aide au tri)
- **Critères** : demi-journée faite ; chaque personne traite 10 pièces sans erreur de règle ; fiche réflexe d'une page par rôle (numériser, trier, valider, déclarer une pièce manquante, que faire en cas de coupure).

### ARC-018 — Contrat ERP : lecture du code et choix de l'option
- **Niveau** L3 · **US** US-ARC-02, 03 · **Jalon** avant J08 (jeu 15) · **Estimation** 3 h · **Dépend de** — (accès au dépôt de l'ERP par le développeur) · **Postes** DEV, ARC, RS, HUM (comptable : méthode de reprise J04b)
- **Critères** : réponse écrite à chaque question du §7.5 de la conception ; option A ou B retenue et datée ; format CSV §7.2 validé par le comptable sur un extrait réel (ou de l'Excel).

### ARC-019 — Revue de sécurité avant le go
- **Niveau** L4 · **US** US-SYS-02, 03 · **Jalon** J08 (ven 16, matin) · **Estimation** 2 h · **Dépend de** ARC-005 à ARC-014 · **Postes** SEC, RS, DEV
- **Critères** : aucun secret dans un dépôt ni dans un export de workflow ; fichiers d'environnement en droits 600 ; ports exposés limités à HTTPS et SSH ; double authentification activée là où c'est possible, sinon écart noté ; aucune vue publique ; jeton NocoDB de n8n distinct de celui du site ; clés de chiffrement imprimées et mises sous enveloppe au coffre.

### ARC-020 — Liste de contrôle du go ou no-go
- **Niveau** L2 · **US** — · **Jalon** J08 (ven 16) · **Estimation** 1 h · **Dépend de** ARC-015, ARC-016, ARC-019 · **Postes** ARC, HUM (Direction décide)
- **Critères** : liste signée : persistance prouvée par redémarrage ; restauration réussie ; 50 pièces sans anomalie ; alertes fonctionnelles ; sauvegarde de la nuit présente sur GCS ; revue de sécurité sans point bloquant ; option ERP décidée. Un seul « non » = no-go et date de reprise écrite.

## 5. Semaine du 19 au 23 octobre — J09b, J10, J11 : archivage en masse et lien ERP

### ARC-021 — Travaux côté ERP (option A) — hors de cette conception
- **Niveau** L4 · **US** US-ARC-02, 03 · **Jalon** J08 puis J09b (lun 19 – mar 20) · **Estimation** **à faire par le développeur après lecture du code** (non estimable ici) · **Dépend de** ARC-018, mise en ligne de l'ERP (J07) · **Postes** DEV, TST, RS, SEC
- **Critères** : §7.3 de la conception ; une écriture sans `piece_id` ni motif est refusée ; un identifiant mal formé est refusé ; l'export F1 contient la colonne ; le lien ouvre la pièce.

### ARC-022 — W04 Pièce manquante et relances
- **Niveau** L3 · **US** US-ARC-05 ; critère 1 · **Jalon** J09a–J10 (lun 19) · **Estimation** 3 h · **Dépend de** ARC-012 · **Postes** TST, DEV, RS, HUM (Direction : texte de l'attestation)
- **Critères** : déclaration → pièce `Manquante` avec identifiant, fiche de traitement ouverte ; duplicata reçu et validé → `Classee`, même identifiant, `nature_justificatif` = Duplicata ; attestation signée déposée et validée → `Classee`, `nature_justificatif` = Attestation interne ; relance au comptable après le délai ; aucun courriel envoyé automatiquement à un fournisseur.

### ARC-023 — W05 Import des écritures
- **Niveau** L3 · **US** US-ARC-02, 04, 08 ; critère 2 · **Jalon** J09b (lun 19 – mar 20) · **Estimation** 5 h · **Dépend de** ARC-018, ARC-007 · **Postes** TST, DEV, RS
- **Critères** : fichier conforme → lignes créées, pièces citées passées à `Saisie_ERP` ; même fichier redéposé → refusé (déjà importé) ; écriture déséquilibrée, montant décimal ou en-tête faux → import rejeté en entier, rien d'écrit ; réimport d'un exercice : `piece_id_saisi` conservé, écriture disparue marquée et pièce revenue à `Classee` avec écart ; 10 000 lignes importées en moins de 5 minutes (Hypothèse de volume, à recaler).

### ARC-024 — W08 Ouvrir une pièce depuis son identifiant
- **Niveau** L3 · **US** US-ARC-03, 08 · **Jalon** J08–J09b (lun 19) · **Estimation** 2 h · **Dépend de** ARC-008, ARC-012 · **Postes** DEV, TST, RS, SEC
- **Critères** : identifiant connu → redirection, puis authentification Nginx, puis PDF ; identifiant inconnu ou mal formé → page « introuvable » sans détail ; aucune pièce lisible sans authentification ; temps mesuré sur 10 pièces depuis le bureau.

### ARC-025 — Corrections d'une pièce classée (T14) et annulation (T13)
- **Niveau** L3 · **US** US-ARC-01 · **Jalon** J10 (mar 20) · **Estimation** 3 h · **Dépend de** ARC-012 · **Postes** TST, DEV, RS
- **Critères** : correction du tiers → nouveau nom de fichier, même identifiant, ancien nom absent du rangement, empreinte identique, journal à jour ; changement d'année → refus et proposition d'annulation ; annulation d'une pièce citée par une écriture → refus ; annulation sans motif → refus ; un numéro annulé n'est jamais réattribué.

### ARC-026 — W10 Rapport quotidien et tableau de bord
- **Niveau** L2 · **US** US-ARC-11 · **Jalon** J10–J11 (mer 21) · **Estimation** 3 h · **Dépend de** ARC-006, ARC-016 (plan recalculé) · **Postes** DEV, REL, HUM (responsable de validation)
- **Critères** : courriel quotidien à 18 h avec les comptes par statut, année et type et l'écart au plan ; chiffres égaux à un comptage SQL direct ; vue « Tableau de bord » lisible par la Direction.

### ARC-027 — W06 Contrôles inverses et écarts
- **Niveau** L3 · **US** US-ARC-04, 05, 07 ; critères 2, 3, 6 · **Jalon** J10–J11 (mer 21 – jeu 22), quotidien ensuite · **Estimation** 6 h · **Dépend de** ARC-023 · **Postes** ARC, TST, DEV, RS
- **Critères** : jeu d'essai avec au moins un cas de chaque code E01 à E10 → chaque écart détecté une fois ; contrôle rejoué → aucun écart en double ; écart corrigé → clos automatiquement au contrôle suivant ; listes « écritures sans pièce » et « pièces sans écriture » filtrables par exercice et exportables en CSV.

### ARC-028 — W11 Supervision et sonde externe
- **Niveau** L2 · **US** US-SYS-08 · **Jalon** J10 (mer 21) · **Estimation** 2 h · **Dépend de** ARC-013 · **Postes** DEV, REL, HUM (choix de l'outil de sonde)
- **Critères** : alerte au seuil disque (essai avec un seuil abaissé) ; alerte si la sauvegarde a plus de 26 h ; NocoDB arrêté volontairement → alerte de la sonde externe en moins de 15 minutes.

### ARC-029 — W07b Vérification de restauration hebdomadaire
- **Niveau** L3 · **US** critère 5 · **Jalon** J11 (ven 23) · **Estimation** 3 h · **Dépend de** ARC-014, ARC-004 · **Postes** DEV, TST, RS
- **Critères** : restauration automatique dans `archive_restore` ; comparaison des comptes et de 20 empreintes ; résultat dans `controles` ; échec simulé (fichier manquant) → alerte.

### ARC-030 — Document d'exploitation et journal d'exploitation
- **Niveau** L1 · **US** — · **Jalon** J11 (ven 23) · **Estimation** 2 h · **Dépend de** ARC-028 · **Postes** DEV, REL
- **Critères** : une page conforme au §8.9 de la conception ; relue par une personne autre que le développeur, capable de retrouver où sont les journaux.

## 6. Semaine du 26 au 31 octobre — J13 à J17 : contrôles et remise

### ARC-031 — Rapprochements bancaires dans l'archive
- **Niveau** L2 · **US** US-ARC-07 ; critère 7 · **Jalon** J13 (lun 26) · **Estimation** 2 h · **Dépend de** ARC-006, ARC-027 · **Postes** DEV, REL, HUM (comptable)
- **Critères** : vue de saisie par compte, exercice et mois ; écart calculé ; relevé lié à une pièce `5_Banque` ; contrôle E09 actif ; valideur différent de la personne qui établit.

### ARC-032 — Tirage de l'échantillon et chronométrage
- **Niveau** L2 · **US** US-ARC-08 ; critère 4 · **Jalon** J14 (mar 27 préparation, mer 28 exécution) · **Estimation** 2 h · **Dépend de** ARC-024, ARC-023 · **Postes** DEV, TST, HUM (responsable de validation)
- **Critères** : 30 pièces par année tirées au hasard avec une graine notée (tirage reproductible) ; feuille de chronométrage : départ d'un compte de la balance, arrivée sur le PDF ; résultat : nombre sous 2 minutes, temps maximal ; échecs transformés en écarts.

### ARC-033 — Export complet en formats ouverts
- **Niveau** L2 · **US** US-SYS-11 · **Jalon** J15 (jeu 29) · **Estimation** 2 h · **Dépend de** ARC-014 · **Postes** DEV, REL
- **Critères** : un export CSV par table + l'arborescence de PDF + un fichier lisez-moi décrivant les colonnes ; relu sans NocoDB (tableur) ; ajouté à la sauvegarde hebdomadaire.

### ARC-034 — Sauvegarde finale, restauration et démonstration
- **Niveau** L4 · **US** critère 5 ; US-ARC-08 · **Jalon** J16 (ven 30) · **Estimation** 3 h · **Dépend de** ARC-015, ARC-032 · **Postes** DEV, TST, SEC, HUM (Direction)
- **Critères** : restauration complète réussie (même procédure qu'ARC-015) ; copie 3 sur disque externe faite et vérifiée ; démonstration devant la Direction : trois chiffres des états financiers remontés jusqu'à leur pièce ; procès-verbal signé.

### ARC-035 — Rotation des secrets et clôture sécurité
- **Niveau** L4 · **US** US-SYS-02 · **Jalon** J16–J17 (ven 30 – sam 31) · **Estimation** 2 h · **Dépend de** ARC-034 · **Postes** SEC, DEV, RS
- **Critères** : mots de passe PostgreSQL et jetons utilisés pendant la construction changés ; comptes inutiles fermés ; liste des comptes et rôles à jour, signée par la Direction.

## 7. Après le 31 octobre (hors échéance, ordonné)

| Id | Titre | Niveau | US | Dépend de | Estimation |
|---|---|---|---|---|---|
| ARC-036 | Date de fin de conservation et alerte avant échéance | L2 | US-ARC-10, US-DIR-05 | Réponse de l'expert-comptable (J12) | 2 h |
| ARC-037 | Archivage automatique des PDF produits par l'ERP (flux F4) | L3 | US-ARC-09 | ARC-021, code de l'ERP | à estimer après lecture du code |
| ARC-038 | Chaînage par empreinte du journal d'audit (altération visible) | L3 | US-SYS-01 | ARC-007 | 3 h |
| ARC-039 | Option IA W12 (désactivée par défaut) | L3 | — | Décision de la Direction (J19) | à estimer selon l'option retenue |
| ARC-040 | Journal des consultations de documents exploitable (rapport) | L2 | US-SYS-12 | ARC-008 | 2 h |

Postes pour ARC-036 à ARC-040 : TST, DEV, RS ; SEC en plus pour ARC-039 et ARC-040 ; HUM (Direction) pour ARC-036 et ARC-039.

## 8. Synthèse de la charge (estimations de l'architecte)

| Période | Tâches | Heures DEV |
|---|---|---|
| Lun 12 – ven 16 oct (MVP-0) | ARC-001 à ARC-020 | environ 67 h, plus l’ERP (J03, J07, J08) |
| Lun 19 – ven 23 oct | ARC-022 à ARC-030 (hors ARC-021) | environ 29 h, plus ARC-021 (non estimé) |
| Lun 26 – sam 31 oct | ARC-031 à ARC-035 | environ 11 h |
| Après le 31 oct | ARC-036 à ARC-040 | environ 7 h connues + deux non estimées |

## 9. Chemin critique

ARC-001 → ARC-002 → ARC-005 → ARC-006 → ARC-007 → ARC-010 → ARC-011 → ARC-012 → ARC-014 → ARC-015 → ARC-016 → ARC-020 (go le 16 oct.) → ARC-018 → ARC-023 → ARC-027 → ARC-032 → ARC-034 (30 oct.).

En parallèle et aussi bloquant : ARC-003 (décisions humaines du 12–13 oct.), sans lesquelles aucune attribution ne peut commencer ; ARC-021 (ERP) pour l'option A ; si ARC-021 n'est pas prêt le 20 octobre, l'option B s'applique et le chemin passe par la correspondance manuelle des écritures dans NocoDB.

Points sans retour : la première attribution d'identifiant (ARC-012 en production) fige l'année du compteur et le format ; la migration de NocoDB (ARC-005) touche aussi le CRM des devis du site.

## 10. Ce qui doit être fait à la main par un humain

| Quoi | Qui | Quand |
|---|---|---|
| Décisions de règles (ARC-003), liste nominative des utilisateurs | Direction, responsable de validation, comptable | 12–13 oct. |
| Accès au VPS, accord pour la migration de NocoDB | Direction | 12–13 oct. |
| Création du compte et du bucket GCS, moyen de paiement | Direction | 13–14 oct. |
| Achat du disque externe et de l'onduleur ; scanner si absent | Direction | avant le 16 oct. |
| Numérisation, rangement du papier par lot, envoi des lots | Aide au tri | dès le 13 oct. |
| Tri (date, type, tiers, montant) | Aide au tri, comptable | dès l'ingestion |
| Validation de chaque classement (quatre yeux) | Comptable, responsable de validation | en continu |
| Déclaration des pièces manquantes, demandes de duplicata | Comptable | dès l'inventaire |
| Signature des attestations internes | Direction | J13 au plus tard |
| Saisie des écritures avec l'identifiant (A) ou correspondance (B), dépôt des CSV | Comptable | à partir du 19 oct. |
| Rapprochements bancaires | Comptable, valideur distinct | J13–J14 |
| Correction des écarts, acceptation documentée | Comptable, responsable de validation | J14–J15 |
| Témoin des restaurations, procès-verbaux | Responsable de validation, Direction | 14–15 oct., 30 oct. |
| Chronométrage de l'échantillon | Responsable de validation | 28 oct. |
| Copie hebdomadaire sur disque externe, rangement au coffre | Personne désignée (à nommer) | chaque vendredi |
| Décision go ou no-go ; remise du chantier | Direction | 16 oct., 31 oct. |
| Conservation du papier, aucune destruction | Tous | jusqu'à la réponse J12 et au-delà |
