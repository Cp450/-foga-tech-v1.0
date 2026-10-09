# Foga-Tech International — Acteurs, cas d'utilisation et user stories

Version 1.0 — octobre 2026. Document d'expression de besoins, préalable à la rédaction de toutes les procédures. Il est tiré uniquement de vos documents : Manuel des procédures (22/08/2026), Manuel des procédures sectorielles, Formulaires de prise en charge (FT-ACC et secteurs 2 à 8), Recueil des formulaires opérationnels avec traçabilité (FT-PRO à FT-REG) et Recueil des modèles par secteur.

## 1. Objet et méthode

Ce document recense, pour chaque activité de l'entreprise, qui fait quoi, ce que chacun attend, et à quelle condition on considère que c'est bien fait. Il sert ensuite de base pour :
- vérifier qu'aucune procédure ne manque ;
- rédiger les procédures une par une, sans oubli ;
- paramétrer le registre et les workflows n8n ;
- contrôler, a posteriori, que chaque besoin est couvert.

Conventions :
- **Cas d'utilisation (UC)** : un objectif concret d'un acteur, du déclencheur au résultat.
- **User story (US)** : « En tant que [acteur], je veux [action], afin de [bénéfice] », avec des critères d'acceptation vérifiables.
- **Priorité** : M = indispensable (Must), S = souhaitable (Should), C = confort (Could).
- **Source** : document ou formulaire dont le besoin est tiré (MP = Manuel des procédures, MS = Manuel sectoriel, FT-xxx = formulaire).

## 2. Acteurs

| Acteur | Rôle | Source |
|---|---|---|
| Agent d'accueil / secrétariat | Point d'entrée unique de tout client ; courrier, mails, contacts, archivage | FT-ACC, MP |
| Chargé d'affaires / commercial | Premier contact, qualification, devis, relances, relation client | MP, MS |
| Responsable technique / bureau d'études | Étude, dimensionnement, validation technique, contrôle qualité | MP, MS |
| Chef de chantier / chef de projet | Exécution, planning, rapports, sécurité, réception | MP, MS |
| Responsable administratif et financier | Facturation, paiements, archivage, contrôle des informations légales | MP, MS |
| Direction (DG et DG adjoint) | Validation, arbitrages, contrats importants, risques | MP, MS |
| Responsable SAV | Tickets, garanties, interventions | MP |
| Responsable du parc (engins) | Disponibilité, maintenance, état des engins | MP |
| Opérateur d'engin / chauffeur | Conduite, relevé d'heures, incidents | MS secteur 8 |
| Client (particulier, entreprise, institution, ONG / coopérative) | Demandeur, signataire, payeur | FT-ACC |
| Donneur d'ordre / maître d'ouvrage public ou majeur du BTP | Appel d'offres, marché, ordre de service | MS secteur 3 |
| Fournisseur, sous-traitant, transporteur | Matériaux, équipements, prestations | MP |
| Administration (mairie, ministère, impôts, organismes sociaux) | Permis, récépissés, courriers officiels | MS secteur 1 |
| Responsable informatique / administrateur du système | Comptes, droits, sauvegardes, sécurité | MP §17 |
| Système (registre NocoDB, workflows n8n) | Numérotation, alertes, relances, contrôles automatiques | Architecture proposée |

## 3. Vue d'ensemble des cas d'utilisation

### 3.1 Secrétariat et traçabilité (transverse)
| UC | Intitulé | Acteur principal | Déclencheur | Document lié |
|---|---|---|---|---|
| UC-S01 | Enregistrer un courrier physique entrant | Secrétariat | Arrivée d'un courrier ou colis | FT-CE |
| UC-S02 | Traiter un mail entrant d'une boîte surveillée | Secrétariat, système | Réception d'un mail | FT-CE |
| UC-S03 | Accueillir et enregistrer un contact (appel, visite, WhatsApp) | Secrétariat | Premier contact | FT-ACC |
| UC-S04 | Enregistrer et expédier un courrier sortant | Secrétariat | Courrier validé et signé | FT-CS |
| UC-S05 | Envoyer un accusé de réception | Secrétariat | Courrier ou demande enregistré | Accusé |
| UC-S06 | Remonter un courrier à la bonne personne | Secrétariat | Catégorie et urgence connues | Bordereau |
| UC-S07 | Archiver un document (papier et numérique) | Secrétariat | Document traité ou clos | `Clients/FT-CLI-XXXX/` |
| UC-S08 | Suivre les échéances et relancer | Secrétariat, système | Échéance atteinte | FT-REG |
| UC-S09 | Contrôler le registre (quotidien, hebdomadaire, mensuel) | Secrétariat, responsable administratif, Direction | Calendrier de contrôle | FT-REG |
| UC-S10 | Gérer un incident (courrier perdu, mail suspect, outil en panne) | Secrétariat | Incident constaté | Registre de secours |

### 3.2 Parcours client commun à tous les secteurs
| UC | Intitulé | Acteur principal | Document lié |
|---|---|---|---|
| UC-C01 | Enregistrer et qualifier un prospect | Chargé d'affaires | FT-PRO, FT-ACC |
| UC-C02 | Créer et tenir la fiche client (sans doublon) | Chargé d'affaires, administration | FT-CLI |
| UC-C03 | Qualifier la demande | Chargé d'affaires, technique | Compte rendu de qualification |
| UC-C04 | Réaliser une visite technique | Technique | FT-VIS |
| UC-C05 | Établir et valider un devis | Commercial, technique, finance | FT-DEV |
| UC-C06 | Relancer un devis | Commercial, système | Historique des relances |
| UC-C07 | Contractualiser et encaisser l'acompte | Direction, finance | FT-CON |
| UC-C08 | Lancer un chantier | Chef de chantier | Checklist de lancement, FT-CH |
| UC-C09 | Suivre l'avancement et rapporter | Chef de chantier | Rapport hebdomadaire |
| UC-C10 | Traiter une modification de périmètre (avenant) | Chef de chantier, commercial, Direction | FT-AVN |
| UC-C11 | Établir une situation de travaux et facturer | Administration, technique, Direction | FT-FAC |
| UC-C12 | Suivre le paiement et relancer les impayés | Finance | FT-FAC |
| UC-C13 | Réceptionner (provisoire, définitive) et lever les réserves | Chef de projet, client | FT-PVRP, FT-PVRD |
| UC-C14 | Traiter une réclamation ou un ticket SAV | SAV | FT-SAV |
| UC-C15 | Mesurer la satisfaction et clôturer le dossier | SAV, administration | FT-SAT, FT-CLO |
| UC-C16 | Piloter l'activité (tableau de bord) | Direction | Tableau de bord MP §13 |

### 3.3 Cas propres à chaque secteur
| Secteur | UC spécifiques |
|---|---|
| 1 Bureau d'études et architecture | UC-1A Visite de terrain et relevé ; UC-1B Esquisse et APS ; UC-1C Contrat de maîtrise d'œuvre et acompte 30 % ; UC-1D APD, modélisation BIM et validation, versement de 40 % ; UC-1E Dossier de permis de construire et suivi d'instruction ; UC-1F Plans d'exécution, PV de remise et solde 30 % ; UC-1G Suivi de chantier (mission optionnelle) |
| 2 Génie civil et gros œuvre | UC-2A Orienter vers le bureau d'études si pas de plans ; UC-2B Chiffrage avec double validation et bordereau de prix ; UC-2C Contrôles qualité (essais béton, ferraillage, compactage) ; UC-2D Situations mensuelles contresignées ; UC-2E Réception, levée des réserves, garantie décennale |
| 3 VRD et ouvrages d'art | UC-3A Répondre à une consultation ou un appel d'offres ; UC-3B Essais géotechniques (Proctor, CBR) ; UC-3C Marché ou sous-traitance, ordre de service, avance de démarrage 10–20 % ; UC-3D Rapports au maître d'ouvrage, contrôles de portance ; UC-3E Plans de récolement, décompte général définitif |
| 4 Génie rural et hydraulique | UC-4A Diagnostic agro-hydraulique ; UC-4B Note de calcul hydraulique ; UC-4C Essais de mise en eau et de pression ; UC-4D Formation des utilisateurs, notice d'entretien ; UC-4E Retour d'expérience après une saison |
| 5 Infrastructures rurales | UC-5A Piste, hangar ou électrification : visite et faisabilité ; UC-5B Validation du dimensionnement par le bureau d'études ; UC-5C Contrôle par type d'ouvrage ; UC-5D Essai de fonctionnement électrique |
| 6 Élevage et pisciculture | UC-6A Diagnostic sanitaire et technique ; UC-6B Plan de biosécurité ; UC-6C Contrôle d'étanchéité et de ventilation ; UC-6D Mise en eau et mise en service ; UC-6E Retour après le premier cycle |
| 7 Solutions durables | UC-7A Audit énergétique ou de gisement ; UC-7B Note de dimensionnement validée par un ingénieur ; UC-7C Tests de mise en service et de performance ; UC-7D Suivi de performance sur les premiers mois |
| 8 Location d'engins | UC-8A Réserver (disponibilité, devis, caution) ; UC-8B Contrat et état contradictoire de sortie ; UC-8C Livraison sur site ; UC-8D Suivi des heures et incidents ; UC-8E Maintenance préventive (alertes par heures ou dates) ; UC-8F Retour, état contradictoire et facturation des dommages |

## 4. Cas d'utilisation détaillés — Secrétariat

### UC-S01 — Enregistrer un courrier physique entrant
| Élément | Description |
|---|---|
| Acteur principal | Secrétariat |
| Déclencheur | Un courrier, un recommandé ou un colis arrive (poste, coursier, dépôt au bureau) |
| Préconditions | Registre accessible (ou registre papier de secours) ; tampon « REÇU LE » disponible |
| Scénario nominal | 1. Contrôler l'état et signer la décharge. 2. Trier (personnel, recommandé, administration, ordinaire). 3. Tamponner date et heure. 4. Ouvrir et vérifier les pièces. 5. Numéroter FT-CE, qualifier la catégorie et l'urgence. 6. Scanner et joindre. 7. Désigner le responsable. 8. Remettre contre décharge. 9. Préparer l'accusé. 10. Classer l'original |
| Variantes | Courrier « personnel ou confidentiel » : enregistrer l'enveloppe seulement ; colis abîmé : photographier et réserver ; outil indisponible : registre papier puis saisie différée |
| Postcondition | Une ligne au registre, un scan, un responsable, une trace dans le journal |
| Exceptions | Expéditeur inconnu ; pièce annoncée absente ; courrier adressé à une personne qui a quitté l'entreprise |

### UC-S02 — Traiter un mail entrant
| Élément | Description |
|---|---|
| Acteurs | Secrétariat, système (n8n) |
| Déclencheur | Mail reçu sur l'une des cinq boîtes : contact@foga-tech.com, cyril.nsaha@foga-tech.com, prince.ngoulou@foga-tech.com, fogat.technology@gmail.com, ngoulounoe5@gmail.com |
| Scénario nominal | 1. Le système crée la ligne FT-CE et classe. 2. Le secrétariat vérifie la catégorie. 3. Pièces jointes archivées en PDF. 4. Alerte au responsable selon l'urgence. 5. Brouillon d'accusé préparé. 6. Mail marqué « Traité » |
| Variantes | Mail d'un client connu : rattachement automatique à FT-CLI ; mail d'un dirigeant à titre privé : non enregistré ; réponse à un devis : arrêt des relances |
| Exceptions | Mail suspect ; doublon ; pièce jointe illisible ; boîte Gmail d'un dirigeant non transférée |

### UC-S03 — Accueillir et enregistrer un contact
| Élément | Description |
|---|---|
| Acteur principal | Secrétariat |
| Déclencheur | Appel, visite, message WhatsApp, formulaire du site |
| Scénario nominal | 1. Ouvrir FT-ACC. 2. Identifier le client (A). 3. Décrire l'objet, cocher le secteur, indiquer l'urgence (B). 4. Poser les questions minimales du secteur (C). 5. Orienter, désigner le chargé d'affaires, transmettre (D). 6. Remettre l'accusé et annoncer le délai de rappel (E). 7. Faire signer la transmission |
| Variantes | Client inconnu du secteur : « Ne sait pas encore », orientation après échange ; plusieurs secteurs concernés ; client déjà existant : réutiliser la fiche |
| Postcondition | Dossier exploitable par le chargé d'affaires dès le premier rendez-vous |

### UC-S04 à UC-S10
Les autres cas du secrétariat suivent la même structure et sont détaillés par les user stories du §6. Leur contenu opérationnel est déjà couvert par les procédures P4 à P10 du manuel du secrétariat (courrier sortant, accusé de réception, remontée, archivage, relances, incidents, contre-contrôle) ; ils seront repris et complétés lors de la rédaction finale.

## 5. Cas d'utilisation détaillés — Parcours client et secteurs (extraits clés)

### UC-C05 — Établir et valider un devis
| Élément | Description |
|---|---|
| Acteurs | Chargé d'affaires, responsable technique, responsable financier |
| Préconditions | Visite faite si nécessaire (FT-VIS) ; besoin recueilli ; fiche client créée |
| Scénario nominal | 1. Rassembler plans, photos, métrés, contraintes d'accès, délais. 2. Chiffrer : main-d'œuvre, matériaux, transport, sous-traitance, frais de chantier, taxes, marge, aléas. 3. Contrôle croisé des quantités et des prix par deux responsables. 4. Numéroter FT-DEV-AAAA-NNNN. 5. Indiquer périmètre, exclusions, délais, validité (30 jours en général), paiement, garanties. 6. Envoyer. 7. Planifier les relances |
| Postcondition | Devis envoyé, tracé, versionné ; relances J+3, J+7, J+14, J+30 programmées |
| Exceptions | Devis modifié : nouvelle version ; client demande un délai : relances suspendues |

### UC-C13 — Réceptionner et lever les réserves
| Élément | Description |
|---|---|
| Acteurs | Chef de projet, client |
| Scénario nominal | 1. Inspection interne. 2. Correction des défauts. 3. PV de réception provisoire avec réserves datées et attribuées. 4. Levée des réserves dans le délai. 5. PV de réception définitive. 6. Facture finale. 7. Remise des garanties |
| Postcondition | Dossier prêt pour la clôture ; solde exigible |

### UC-8B — Contrat de location et état contradictoire de sortie
| Élément | Description |
|---|---|
| Acteurs | Responsable du parc, client, opérateur |
| Préconditions | Réservation et devis acceptés ; caution et assurance vérifiées |
| Scénario nominal | 1. Contrôle de l'engin (mécanique, sécurité, carburant). 2. Photos et relevé du compteur. 3. Signature du contrat, de l'état contradictoire de sortie. 4. Livraison sous 24 h avec bon de livraison. 5. Suivi des heures |
| Postcondition | Engin indisponible dans le parc pour la période ; alertes de maintenance armées |

Les autres cas sectoriels du §3.3 suivent le même format. Ils seront détaillés dans les procédures de chaque secteur.

## 6. User stories

### 6.1 Secrétariat — courrier et mails
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-SEC-01 | En tant que secrétariat, je veux enregistrer chaque courrier entrant avec un numéro unique, afin de ne perdre aucune trace | Numéro FT-CE attribué à la création ; aucun trou ni doublon ; date et heure enregistrées | M — MP §2 |
| US-SEC-02 | En tant que secrétariat, je veux tamponner et scanner chaque courrier le jour même, afin de disposer d'une preuve datée | Tampon « REÇU LE » ; scan PDF lié à la ligne du registre avant la fin de journée | M — MP §2 |
| US-SEC-03 | En tant que secrétariat, je veux trier les courriers personnels, recommandés et officiels, afin d'éviter l'ouverture indue et de gagner du temps | Le courrier « personnel » n'est pas ouvert ; les recommandés portent signature et date ; les courriers d'huissier ou d'administration sont marqués urgents | M — Procédure P1 |
| US-SEC-04 | En tant que secrétariat, je veux que les mails des cinq boîtes soient enregistrés automatiquement, afin que le registre soit unique | Un mail d'intérêt crée une ligne FT-CE ; les doublons sont écartés par l'identifiant du mail | M — Architecture |
| US-SEC-05 | En tant que secrétariat, je veux repérer les mails suspects, afin de protéger l'entreprise | Un mail suspect est signalé, non ouvert, noté au registre | M — Procédure P2 |
| US-SEC-06 | En tant que secrétariat, je veux enregistrer les appels, visites et messages WhatsApp dans FT-ACC, afin de tracer tout contact | Une fiche FT-ACC par contact avec canal, date, heure, objet, secteur, urgence | M — FT-ACC |
| US-SEC-07 | En tant que secrétariat, je veux détecter si le client existe déjà, afin d'éviter les doublons de fiche | Recherche par nom, téléphone et email avant création | M — MP §4 |
| US-SEC-08 | En tant que secrétariat, je veux enregistrer les courriers sortants avec preuve d'envoi, afin de pouvoir prouver la date et le contenu | Numéro FT-CS avant envoi ; copie signée ; bordereau, recommandé ou copie du mail conservés | M — Procédure P4 |
| US-SEC-09 | En tant que secrétariat, je veux envoyer un accusé de réception sous 24–48 h, afin de rassurer le client et respecter nos engagements | Brouillon généré ; envoi après validation ; copie archivée ; date inscrite au registre | M — MS secteur 1 |
| US-SEC-10 | En tant que secrétariat, je veux un registre papier de secours, afin de continuer à travailler lors des coupures | Registre numéroté et paraphé ; saisie différée notée « saisie différée » | S — Contexte local |
| US-SEC-11 | En tant que secrétariat, je veux suivre les accusés de réception attendus sur nos envois, afin de relancer à temps | Alerte à 3 jours ouvrés ; information du responsable à 7 jours | S — Procédure P4 |
| US-SEC-12 | En tant que suppléant, je veux disposer des mêmes consignes que le titulaire, afin d'assurer la continuité | Manuel affiché ; accès au registre ; nom du suppléant au poste | S — Procédure |

### 6.2 Remontée, Direction et contrôle
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-DIR-01 | En tant que Direction, je veux être alertée le jour même des courriers juridiques, financiers et officiels, afin de réagir à temps | Alerte mail ou WhatsApp ; remise en main propre des originaux urgents ; accusé de prise en charge | M — Procédure P6 |
| US-DIR-02 | En tant que Direction, je veux un rapport hebdomadaire de contrôle, afin de vérifier que rien ne s'est perdu | Rapport automatique chaque lundi : trous, doublons, retards, mails non enregistrés | M — Contre-contrôle |
| US-DIR-03 | En tant que Direction, je veux valider les contrats, devis importants et réponses engageantes, afin de maîtriser les risques | Validation tracée avant envoi ; signature de la Direction | M — MP §12 |
| US-DIR-04 | En tant que Direction, je veux un tableau de bord par domaine, afin de piloter | Indicateurs commercial, prestations, clients, finance, engins, SAV (MP §13) | S — MP §13 |
| US-DIR-05 | En tant que Direction, je veux que les durées de conservation soient respectées, afin d'être en règle | Conservation 3 ans ; aucune destruction sans procès-verbal ; dossiers de garantie conservés plus longtemps | M — Décision de la Direction |
| US-CTL-01 | En tant que responsable administratif, je veux rapprocher boîtes mail, registre et archives, afin de détecter les oublis | Écarts listés avec responsable et date de correction | M — Contre-contrôle |
| US-CTL-02 | En tant que Direction, je veux un échantillon mensuel de contrôle papier, afin de vérifier la réalité du terrain | 10 courriers tirés au hasard retrouvés au registre, au scan et en archive | S — Contre-contrôle |

### 6.3 Prospects, clients et devis
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-COM-01 | En tant que chargé d'affaires, je veux recevoir un dossier d'accueil complet, afin d'être efficace dès le premier rendez-vous | Informations minimales du secteur renseignées ; chargé d'affaires désigné ; transmission signée | M — FT-ACC |
| US-COM-02 | En tant que chargé d'affaires, je veux qualifier le prospect (service compatible, visite nécessaire, prochaine action), afin de ne pas perdre de temps | Statut mis à jour parmi : Nouveau, À qualifier, Qualifié, Devis à préparer… ; prochaine action datée | M — MP §4 |
| US-COM-03 | En tant que commercial, je veux un historique complet par client, afin de ne rien oublier | Fiche unique avec échanges, devis, contrats, chantiers, factures, paiements, réclamations | M — MP §4 |
| US-COM-04 | En tant que chargé d'affaires, je veux envoyer un devis numéroté et versionné, afin de tracer chaque offre | FT-DEV unique ; une modification crée une nouvelle version ; statut « À revoir » ou « Validé » | M — Formulaire F |
| US-COM-05 | En tant que responsable technique et financier, je veux valider chaque devis avant envoi, afin d'éviter les erreurs de prix | Double validation tracée ; contrôle croisé des quantités | M — MS secteur 2 |
| US-COM-06 | En tant que commercial, je veux des relances automatiques à J+3, J+7, J+14, J+30, afin de ne pas laisser mourir un devis | Rappels générés ; arrêt si accepté, refusé, annulé ou délai demandé ; historique conservé | M — MP §6 |
| US-COM-07 | En tant que commercial, je veux connaître les devis expirants, afin de relancer avant la fin de validité | Liste des devis à 14 jours de l'expiration | S — MP §6 |
| US-COM-08 | En tant que Direction, je veux signer le contrat et encaisser l'acompte avant démarrage, afin de protéger l'entreprise | Aucun chantier ouvert sans contrat signé, ni acompte encaissé si prévu | M — MS |

### 6.4 Chantiers, avenants, facturation
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-CH-01 | En tant que chef de chantier, je veux une checklist de lancement, afin de démarrer en sécurité | Contrat signé, responsable, planning, équipe, matériaux, engins, autorisations, sécurité, photos de l'état initial | M — MP §7 |
| US-CH-02 | En tant que chef de chantier, je veux un rapport hebdomadaire standard, afin d'informer client et Direction | Travaux, effectif, matériaux, engins, incidents, retards, photos, décisions | M — MP §7 |
| US-CH-03 | En tant que chef de chantier, je veux consigner les contrôles qualité (béton, ferraillage, compactage, portance), afin de prouver la conformité | Résultats joints au dossier | M — MS secteurs 2, 3, 5 |
| US-CH-04 | En tant que chef de chantier, je veux traiter toute modification par avenant, afin qu'aucun travail supplémentaire ne soit exécuté sans accord écrit | Demande client, devis complémentaire ou avenant ; impact coût et délai ; validation écrite | M — MP §2, §7 |
| US-CH-05 | En tant que responsable de la sécurité, je veux un registre HSE du chantier, afin de prévenir les accidents | Registre ouvert dès le lancement | S — MS secteur 2 |
| US-FIN-01 | En tant que responsable administratif, je veux préparer les situations de travaux mensuelles, afin de facturer l'avancement réel | Situation préparée par l'administration, confirmée par le technique, validée par la Direction ou la finance | M — MP §9 |
| US-FIN-02 | En tant que client, je veux contresigner la situation, afin de valider l'avancement | Signature ou accord écrit du client ou de son représentant | S — MS secteur 2 |
| US-FIN-03 | En tant que responsable financier, je veux suivre échéances, paiements partiels et soldes, afin de limiter les impayés | Échéance, justificatif, relances et solde enregistrés | M — MP §9 |
| US-FIN-04 | En tant que Direction, je veux que chaque paiement soit adossé à un jalon technique vérifiable, afin d'éviter les paiements sans contrepartie | Jalon et preuve liés à la facture | M — MS |
| US-REC-01 | En tant que chef de projet, je veux consigner les réserves avec responsable et date limite, afin de les lever | Chaque réserve datée, attribuée et suivie jusqu'à sa levée | M — MP §10 |
| US-REC-02 | En tant que client, je veux un PV de réception et mes garanties, afin d'être couvert | PV provisoire et définitif signés ; attestation de garantie décennale transmise | M — MS secteur 2 |

### 6.5 SAV, satisfaction, clôture
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-SAV-01 | En tant que client, je veux déposer une réclamation et recevoir un accusé immédiat, afin de savoir qu'elle est prise en charge | Ticket FT-SAV avec client, projet, problème, priorité, date, pièces, responsable ; accusé envoyé | M — MP §11 |
| US-SAV-02 | En tant que responsable SAV, je veux traiter selon la priorité (urgence chantier le jour même, réclamation importante 24 h, demande normale 48 h), afin de tenir nos engagements | Délais calculés ; alerte en cas de retard | M — MP §11 |
| US-SAV-03 | En tant que responsable SAV, je veux clôturer avec cause et action préventive, afin d'éviter la récidive | Ticket clos avec cause, solution, confirmation du client | M — MP §11 |
| US-SAT-01 | En tant que Direction, je veux une fiche de satisfaction à chaque clôture, afin d'améliorer en continu | Fiche envoyée et enregistrée pour chaque dossier | S — MS |
| US-CLO-01 | En tant que responsable administratif, je veux une checklist de clôture, afin que le dossier soit complet et archivé | Pièces vérifiées, factures soldées, archivage dans `Clients/FT-CLI-XXXX/` | M — FT-CLO |

### 6.6 Location d'engins
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-ENG-01 | En tant que commercial, je veux vérifier la disponibilité d'un engin, afin de ne pas surréserver | Calendrier du parc consulté ; période bloquée à la réservation | M — MS secteur 8 |
| US-ENG-02 | En tant que responsable du parc, je veux un état contradictoire de sortie et de retour, afin de prouver l'état de l'engin | Photos, relevé compteur, niveaux ; signature du client | M — MS secteur 8 |
| US-ENG-03 | En tant que responsable du parc, je veux des alertes de maintenance par heures ou dates, afin d'éviter les pannes | Alerte avant échéance ; fiche de maintenance FT-MNT | M — MP §8 |
| US-ENG-04 | En tant qu'opérateur, je veux déclarer un incident ou une panne, afin d'obtenir une intervention rapide | Rapport d'incident daté ; maintenance mobile déclenchée | M — MS secteur 8 |
| US-ENG-05 | En tant que finance, je veux facturer la location selon la durée et facturer les dommages, afin de recouvrer nos coûts | Facture périodique ; caution débitée selon l'état de retour | M — MS secteur 8 |
| US-ENG-06 | En tant que responsable du parc, je veux vérifier assurance, caution et accessibilité du site avant livraison, afin d'éviter les litiges | Liste de contrôle remplie avant départ | S — MP §8 |

### 6.7 Secteurs 1 à 7
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-S1-01 | En tant qu'architecte, je veux une fiche de renseignements client et un compte rendu de visite, afin de cadrer le projet | Documents signés et archivés ; constructibilité du terrain vérifiée | M — MS secteur 1 |
| US-S1-02 | En tant qu'architecte, je veux ne lancer l'APD qu'après l'acompte de 30 %, afin de ne pas travailler sans garantie | Acompte encaissé et enregistré avant lancement | M — MS secteur 1 |
| US-S1-03 | En tant qu'ingénieur, je veux contrôler la cohérence structurelle de l'APD, afin de respecter les Eurocodes et le DTU Congo | Contrôle tracé ; PV de validation APD signé par le client ; second versement de 40 % | M — MS secteur 1 |
| US-S1-04 | En tant que chargé d'études, je veux constituer le dossier de permis et suivre l'instruction, afin de ne pas retarder le projet | Dossier complet avant dépôt ; récépissé archivé ; compléments suivis | M — MS secteur 1 |
| US-S1-05 | En tant que Direction, je veux remettre le dossier final contre solde de 30 %, afin de sécuriser le paiement | PV de remise signé ; fichiers finaux transmis après paiement | M — MS secteur 1 |
| US-S2-01 | En tant que chargé d'affaires, je veux orienter vers le bureau d'études quand il n'y a pas de plans, afin de ne pas chiffrer à l'aveugle | Orientation tracée dans FT-ACC et FT-GC | M — FT-GC |
| US-S2-02 | En tant que responsable technique, je veux des études techniques retenues et leur statut (incluse ou en supplément), afin de maîtriser le périmètre | Tableau des études complété (sol, structure, VRD, thermique, décennale) | S — FT-GC |
| US-S3-01 | En tant que chargé d'affaires, je veux enregistrer chaque appel d'offres et son échéance, afin de ne rien manquer | Date limite et pièces requises suivies ; alerte avant échéance | M — MS secteur 3 |
| US-S3-02 | En tant que Direction, je veux contrôler la conformité juridique du marché, afin d'éviter un risque public ou privé | Contrôle tracé avant signature | M — MS secteur 3 |
| US-S3-03 | En tant que chef de chantier, je veux joindre les essais de compactage et de portance, afin de justifier la qualité | Résultats par étape clé | M — MS secteur 3 |
| US-S4-01 | En tant qu'ingénieur hydraulique, je veux vérifier la ressource en eau avant dimensionnement, afin d'éviter un projet irréaliste | Rapport de diagnostic et note de calcul hydraulique | M — MS secteur 4 |
| US-S4-02 | En tant que client, je veux être formé et recevoir une notice d'entretien, afin d'exploiter correctement | Fiche de formation signée ; notice remise | S — MS secteur 4 |
| US-S5-01 | En tant que responsable technique, je veux valider le dimensionnement par le bureau d'études avant démarrage, afin de sécuriser les ouvrages | Validation tracée ; essai de fonctionnement pour l'électrification | M — MS secteur 5 |
| US-S6-01 | En tant que responsable technique, je veux valider un plan de biosécurité avant travaux, afin de respecter les exigences sanitaires | Zones propres et sales, circulation, effluents validés | M — MS secteur 6 |
| US-S6-02 | En tant que chef de chantier, je veux tester l'étanchéité des bassins et la ventilation des bâtiments, afin de livrer un ouvrage conforme | Contrôles consignés ; mise en eau testée | M — MS secteur 6 |
| US-S7-01 | En tant qu'ingénieur, je veux valider le dimensionnement solaire ou de méthanisation avant commande, afin de ne pas acheter un équipement inadapté | Note validée avant commande | M — MS secteur 7 |
| US-S7-02 | En tant que client, je veux un suivi de performance sur les premiers mois, afin de vérifier les résultats | Suivi convenu au contrat ; ajustements consignés | C — MS secteur 7 |

### 6.8 Système, sécurité et administration
| ID | Story | Critères d'acceptation | Prio. / Source |
|---|---|---|---|
| US-SYS-01 | En tant que Direction, je veux un journal d'audit en ajout seul, afin de prouver qui a fait quoi et quand | Chaque création, validation, envoi, modification, clôture journalisée ; aucune suppression | M — FT-REG |
| US-SYS-02 | En tant qu'administrateur, je veux des droits par rôle, afin de protéger les données sensibles | Chaque rôle ne voit et ne modifie que son périmètre | M — MP §12, §17 |
| US-SYS-03 | En tant qu'administrateur, je veux une authentification renforcée pour les comptes sensibles, afin d'éviter les accès frauduleux | Authentification à deux facteurs pour la Direction et la finance | S — MP §17 |
| US-SYS-04 | En tant qu'administrateur, je veux des sauvegardes quotidiennes chiffrées et testées, afin de ne rien perdre | Sauvegarde automatique ; test de restauration trimestriel | M — MP §17 |
| US-SYS-05 | En tant que Direction, je veux un classement identique pour tous les secteurs, afin de pouvoir basculer vers un outil unique | Arborescence `Clients/FT-CLI-XXXX/` appliquée partout | M — MS |
| US-SYS-06 | En tant qu'utilisateur terrain, je veux travailler même sans connexion, afin de ne pas être bloqué sur chantier | Saisie hors connexion et synchronisation ultérieure (phase 4 du manuel) | C — MP §15 |
| US-SYS-07 | En tant que Direction, je veux que le site web alimente directement le registre, afin que toute demande en ligne soit tracée | Formulaires du site (devis, contact) envoyés au workflow ; fiche FT-ACC créée | M — Dépôt existant |

## 7. Exigences transverses

| Domaine | Exigence | Source |
|---|---|---|
| Délais | Accusé 24–48 h ; urgence chantier le jour même ; réclamation importante 24 h ; demande normale 48 h | MP §11, MS secteur 1 |
| Traçabilité | Numéro unique, version, statut, auteur, preuve ; toute modification après validation crée une version | Recueil de traçabilité |
| Conservation | 3 ans ; destruction sur procès-verbal ; dossiers de garantie plus longtemps | Décision de la Direction |
| Sécurité | Droits par rôle, chiffrement, sauvegardes testées, aucun mot de passe dans une feuille partagée | MP §17 |
| Continuité | Registre papier de secours, suppléant désigné, saisie différée | Contexte local |
| Canaux | Courrier, mail, téléphone, WhatsApp, visite, site web | FT-ACC |
| Langue | Français ; modèles et formulaires en français | Documents sources |
| Cohérence | Même squelette en quatre phases (accueil et étude, contractualisation, exécution, réception) pour tous les secteurs | MS introduction |

## 8. Matrice des procédures à rédiger

Cette matrice relie les besoins ci-dessus aux procédures à écrire. À valider avant rédaction.

| Réf. | Procédure à rédiger | Cas d'utilisation | User stories | État |
|---|---|---|---|---|
| PR-01 | Courrier physique entrant | UC-S01 | US-SEC-01 à 03 | Rédigée (manuel du secrétariat, P1) |
| PR-02 | Mails des boîtes surveillées | UC-S02 | US-SEC-04, 05 | Rédigée (P2) |
| PR-03 | Contacts : appel, visite, WhatsApp, site web | UC-S03 | US-SEC-06, 07, US-SYS-07 | Rédigée (P3) |
| PR-04 | Courrier sortant | UC-S04 | US-SEC-08, 11 | Rédigée (P4) |
| PR-05 | Accusé de réception | UC-S05 | US-SEC-09 | Rédigée (P5) |
| PR-06 | Remontée aux dirigeants | UC-S06 | US-DIR-01 | Rédigée (P6) |
| PR-07 | Archivage et conservation | UC-S07 | US-DIR-05, US-SYS-05 | Rédigée (P7) ; à compléter par secteur |
| PR-08 | Relances et échéances | UC-S08, UC-C06 | US-COM-06, 07 | Rédigée (P8) |
| PR-09 | Contre-contrôle | UC-S09 | US-DIR-02, US-CTL-01, 02 | Rédigée (P10) |
| PR-10 | Incidents | UC-S10 | US-SEC-10 | Rédigée (P9) |
| PR-11 | Prospects, clients, qualification | UC-C01 à C03 | US-COM-01 à 03 | À rédiger |
| PR-12 | Visite technique | UC-C04 | US-S1-01 | À rédiger |
| PR-13 | Devis, validation, versions | UC-C05 | US-COM-04, 05 | À rédiger |
| PR-14 | Contrat et acompte | UC-C07 | US-COM-08, US-DIR-03 | À rédiger |
| PR-15 | Lancement et suivi de chantier | UC-C08, C09 | US-CH-01 à 05 | À rédiger |
| PR-16 | Avenants et travaux supplémentaires | UC-C10 | US-CH-04 | À rédiger |
| PR-17 | Situations de travaux, facturation, paiement | UC-C11, C12 | US-FIN-01 à 04 | À rédiger |
| PR-18 | Réception et levée des réserves | UC-C13 | US-REC-01, 02 | À rédiger |
| PR-19 | Réclamations et SAV | UC-C14 | US-SAV-01 à 03 | À rédiger |
| PR-20 | Satisfaction et clôture | UC-C15 | US-SAT-01, US-CLO-01 | À rédiger |
| PR-21 | Location d'engins (réservation à retour) | UC-8A à 8F | US-ENG-01 à 06 | À rédiger |
| PR-22 | Maintenance du parc | UC-8E | US-ENG-03, 04 | À rédiger |
| PR-23 | Secteur 1 — bureau d'études et architecture | UC-1A à 1G | US-S1-01 à 05 | À rédiger |
| PR-24 | Secteur 2 — génie civil et gros œuvre | UC-2A à 2E | US-S2-01, 02, US-CH-03 | À rédiger |
| PR-25 | Secteur 3 — VRD et ouvrages d'art | UC-3A à 3E | US-S3-01 à 03 | À rédiger |
| PR-26 | Secteur 4 — génie rural et hydraulique | UC-4A à 4E | US-S4-01, 02 | À rédiger |
| PR-27 | Secteur 5 — infrastructures rurales | UC-5A à 5D | US-S5-01 | À rédiger |
| PR-28 | Secteur 6 — élevage et pisciculture | UC-6A à 6E | US-S6-01, 02 | À rédiger |
| PR-29 | Secteur 7 — solutions durables | UC-7A à 7D | US-S7-01, 02 | À rédiger |
| PR-30 | Pilotage et tableau de bord | UC-C16 | US-DIR-04 | À rédiger |
| PR-31 | Sécurité des accès, sauvegardes, droits | — | US-SYS-02 à 04 | À rédiger |

## 9. Points à valider avant de rédiger les procédures

1. Cette liste d'acteurs, de cas d'utilisation et de procédures est-elle complète ? Y a-t-il des activités de l'entreprise absentes de vos manuels (achats, ressources humaines, paie, stocks de matériaux, transport) ?
2. Y a-t-il d'autres agences que Brazzaville et Pointe-Noire, et le secrétariat est-il unique ou présent dans chacune ?
3. Qui joue réellement les rôles « chargé d'affaires », « responsable technique », « responsable SAV » et « responsable du parc » ? Les noms serviront à compléter les procédures.
4. Les priorités M, S, C vous conviennent-elles ?
5. Souhaitez-vous que les procédures soient livrées en un seul manuel ou secteur par secteur ?
