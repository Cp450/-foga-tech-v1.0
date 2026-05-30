import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion";
import SEO from "../components/SEO";
import TextReveal from "../components/TextReveal";
import ExpandingCards from "../components/ExpandingCards";
import ProjetModal from "../components/ProjetModal";

/* ── 13 chantiers réels avec images dédiées (plaquette Foga-Tech) ── */
const PROJETS = [
  {
    slug: "hangars-pn-bzv",
    nom: "Hangars métalliques PNR + BZV",
    partenaire: "FOBERD CONGO",
    segment: "Construction métallique",
    icon: "warehouse",
    lieu: "Pointe-Noire & Brazzaville",
    annee: 2012,
    duree: "4 ans",
    desc: "Construction de 2 hangars métalliques à Pointe-Noire et Brazzaville (2012-2016, sous Établissements FOGA & Fils).",
    image: "/portfolio-hangar-pn.webp",
    logo: "/logos-partenaires/foberd-congo.svg",
    travaux: [
      "Fondations & dalles béton armé sur 2 sites",
      "Charpente métallique soudée sur place",
      "Bardage & couverture acier galvanisé",
      "Mise en service Pointe-Noire puis Brazzaville",
    ],
  },
  {
    slug: "udsn-etancheite",
    nom: "Université Denis Sassou N'Guesso",
    partenaire: "UNICON DEVELOPPEMENT",
    segment: "Étanchéité",
    icon: "umbrella",
    lieu: "Kintélé, Brazzaville",
    annee: 2013,
    duree: "3 ans",
    desc: "Travaux d'étanchéité sur le site de l'Université Denis Sassou N'Guesso (2013-2016, sous Établissements FOGA & Fils).",
    image: "/portfolio-udn.webp",
    logo: "/logos-partenaires/unico-developement.svg",
    travaux: [
      "Préparation supports toitures-terrasses",
      "Pose membrane bitumineuse multicouche",
      "Relevés & solins périphériques",
      "Tests étanchéité & garantie décennale",
    ],
  },
  {
    slug: "petit-chose-manianga",
    nom: "VRD axe Petit-Chose-Manianga",
    partenaire: "COLAS",
    segment: "Voirie urbaine",
    icon: "route",
    lieu: "Brazzaville",
    annee: 2014,
    duree: "6 mois",
    desc: "VRD du projet d'aménagement de l'axe Petit-Chose-Manianga (sous Établissements FOGA & Fils).",
    image: "/portfolio-petit-chose.webp",
    logo: "/logos-partenaires/colas.svg",
    travaux: [
      "Terrassement & profil voirie",
      "Pose réseaux assainissement EP/EU",
      "Bordures, caniveaux & trottoirs",
      "Couche de roulement bitumineuse",
    ],
  },
  {
    slug: "luminaires-corniche",
    nom: "Luminaires Corniche",
    partenaire: "EN CO — ÉNERGIE DU CONGO",
    segment: "Éclairage public",
    icon: "light_mode",
    lieu: "Corniche, Brazzaville",
    annee: 2016,
    duree: "12 mois",
    desc: "Entretien des luminaires sur la corniche, axe Case de Gaulle-Matour (2016-2017).",
    image: "/portfolio-luminaire.webp",
    logo: "/logos-partenaires/Enco.svg",
    travaux: [
      "Diagnostic & dépose luminaires défectueux",
      "Remplacement sources LED haute performance",
      "Reprise câblage & coffrets de commande",
      "Mise en service & contrôle photométrique",
    ],
  },
  {
    slug: "centre-gaz-mpila",
    nom: "Centre Emplisseur Gaz Mpila",
    partenaire: "FAAKI CONGO",
    segment: "Bâtiment industriel",
    icon: "factory",
    lieu: "Mpila, Brazzaville",
    annee: 2017,
    duree: "24 mois",
    desc: "Construction du Centre Emplisseur de Gaz de Mpila — bâtiment industriel aux normes de sécurité énergétiques (2017-2019).",
    image: "/chantier-faki.webp",
    logo: "/logos-partenaires/faaki-congo.svg",
    travaux: [
      "Gros œuvre bâtiment industriel ATEX",
      "Cuvelage rétention & dalles techniques",
      "Réseau incendie sprinklage RIA",
      "Aménagements sécurité énergétique",
    ],
  },
  {
    slug: "parknshop-froid",
    nom: "Park'n Shop — Centrale froid",
    partenaire: "IMMO ENERGY",
    segment: "Maintenance technique",
    icon: "ac_unit",
    lieu: "Centre-Ville, Brazzaville",
    annee: 2018,
    duree: "12 mois",
    desc: "Entretien de la centrale à froid sur le bâtiment Park'n Shop Centre-Ville (2018-2019).",
    image: "/portfolio-etancheite-parknshop.webp",
    logo: "/logos-partenaires/immo_energy.svg",
    travaux: [
      "Maintenance préventive groupes froid",
      "Recharge fluide frigorigène & contrôles",
      "Nettoyage condenseurs & échangeurs",
      "Suivi performance & rapports mensuels",
    ],
  },
  {
    slug: "pep-mayanga",
    nom: "Projet Pep's — Base vie Mayanga",
    partenaire: "RAZEL-BEC FAYAT",
    segment: "Génie Civil",
    icon: "foundation",
    lieu: "Mayanga, Brazzaville",
    annee: 2020,
    duree: "12 mois",
    desc: "2 hangars métalliques + bureau Mission de Contrôle, +30 km fouilles en tranchés, protection talus, 2 000+ branchements & pose compteurs.",
    image: "/portfolio-mayanga.webp",
    logo: "/logos-partenaires/razel-bec_fayat.svg",
    travaux: [
      "2 hangars métalliques + bureau MOC",
      "+30 km de fouilles en tranchée",
      "Protection talus & ouvrages anti-érosion",
      "2 000+ branchements & pose compteurs",
    ],
  },
  {
    slug: "chu-b",
    nom: "CHU-B Brazzaville",
    partenaire: "RAZEL-BEC FAYAT",
    segment: "Bâtiment santé",
    icon: "local_hospital",
    lieu: "Brazzaville",
    annee: 2021,
    duree: "14 mois",
    desc: "Construction base vie, fouilles en tranchés, maçonneries, peintures, tuyauterie & installation réseau incendie, fourniture & pose équipements.",
    image: "/portfolio-chu.webp",
    logo: "/logos-partenaires/razel-bec_fayat.svg",
    travaux: [
      "Construction base vie chantier",
      "Maçonneries, peintures & second œuvre",
      "Tuyauterie & réseau incendie complet",
      "Fourniture & pose équipements hospitaliers",
    ],
  },
  {
    slug: "boundji-ewo",
    nom: "Route Boundji-Ewo",
    partenaire: "SINOHYDRO",
    segment: "Transport & logistique",
    icon: "local_shipping",
    lieu: "Axe Boundji ↔ Ewo",
    annee: 2022,
    duree: "18 mois",
    desc: "Transport d'agrégats pour la construction routière sur l'axe Boundji-Ewo (2022-2023).",
    image: "/portfolio-boundji-ewo.webp",
    logo: "/logos-partenaires/sino_hydro.webp",
    travaux: [
      "Mobilisation flotte bennes 15-20T",
      "Rotation agrégats carrière → chantier",
      "Approvisionnement continu 18 mois",
      "Reporting tonnage & traçabilité",
    ],
  },
  {
    slug: "voiries-owando",
    nom: "Voiries Owando",
    partenaire: "SGE-C CONGO",
    segment: "Voirie urbaine",
    icon: "route",
    lieu: "Owando",
    annee: 2023,
    duree: "8 mois",
    desc: "Fourniture d'agrégats et pose de pavés sur le chantier de voiries d'Owando.",
    image: "/portfolio-owando.webp",
    logo: "/logos-partenaires/sgec-congo.svg",
    travaux: [
      "Fourniture agrégats calibrés",
      "Préparation lit de pose & sablage",
      "Pose pavés autobloquants",
      "Jointoiement & finitions trottoirs",
    ],
  },
  {
    slug: "pylones-mossaka",
    nom: "Pylônes HT Mossaka-Oyo",
    partenaire: "VALIANT POWER",
    segment: "Énergie haute tension",
    icon: "bolt",
    lieu: "Mossaka ↔ Oyo",
    annee: 2023,
    duree: "12 mois",
    desc: "Construction des massifs et levage des pylônes haute tension sur la ligne Mossaka-Oyo (2023-2024).",
    image: "/portfolio-mossaka-oyo.webp",
    logo: "/logos-partenaires/Valiant_Power.svg",
    travaux: [
      "Fouilles & massifs béton armé pylônes",
      "Assemblage treillis métalliques au sol",
      "Levage pylônes HT à la grue",
      "Mise à la terre & contrôles électriques",
    ],
  },
  {
    slug: "calcaire-loutete",
    nom: "Transport calcaire Loutété",
    partenaire: "SONOCC",
    segment: "Transport & logistique",
    icon: "local_shipping",
    lieu: "Loutété",
    annee: 2024,
    duree: "12 mois",
    desc: "Transport de calcaire depuis la carrière vers le site de production SONOCC à Loutété.",
    image: "/portfolio-loutete.webp",
    logo: "/logos-partenaires/sonocc.webp",
    travaux: [
      "Mobilisation flotte poids lourds dédiée",
      "Rotation calcaire carrière → cimenterie",
      "Pesée & traçabilité tonnages",
      "Continuité approvisionnement 12 mois",
    ],
  },
  {
    slug: "hub-loudima",
    nom: "Hub agricole Eni — Loudima",
    partenaire: "OPARH'S CONGO SARL",
    segment: "Génie Rural",
    icon: "agriculture",
    lieu: "Loudima",
    annee: 2024,
    duree: "4 mois",
    desc: "Mise à disposition d'engins de terrassement pour l'aménagement du Hub agricole Eni à Loudima.",
    image: "/portfolio-hub-agricole.webp",
    logo: "/logos-partenaires/Oprah's.svg",
    travaux: [
      "Location bulldozers & niveleuses",
      "Terrassement zones cultures",
      "Pistes d'accès & plateformes",
      "Suivi opérateurs & maintenance engins",
    ],
  },
];

export default function Portfolio() {
  const [activeProjet, setActiveProjet] = useState(null);

  const itemsWithSelect = useMemo(
    () =>
      PROJETS.map((p) => ({
        id: p.slug,
        imgSrc: p.image,
        title: p.nom,
        segment: p.segment,
        icon: p.icon,
        lieu: p.lieu,
        annee: p.annee,
        duree: p.duree,
        client: p.partenaire,
        description: p.desc,
        onSelect: () =>
          setActiveProjet({
            title: p.nom,
            imgSrc: p.image,
            segment: p.segment,
            icon: p.icon,
            lieu: p.lieu,
            annee: p.annee,
            duree: p.duree,
            client: p.partenaire,
            description: p.desc,
            logo: p.logo,
            travaux: p.travaux,
          }),
      })),
    [],
  );

  return (
    <main className="bg-[#001022] text-white font-body min-h-screen">
      <SEO
        title="Portfolio — +15 chantiers livrés | Foga-Tech BTP"
        description="Parcours chronologique 2012 → 2024 — +15 références BTP, voirie, industrie, énergie et génie rural au Congo-Brazzaville. Plaquette Foga-Tech International."
        canonical="https://foga-tech.com/portfolio"
      />

      {/* ── HERO — Home DNA Ken Burns multi-image ─────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[
            { src: "/portfolio-chu.webp", cls: "hb-1", eager: true },
            { src: "/portfolio-mayanga.webp", cls: "hb-2", eager: false },
            { src: "/portfolio-hangar-pn.webp", cls: "hb-3", eager: false },
            { src: "/portfolio-mossaka-oyo.webp", cls: "hb-4", eager: false },
            { src: "/portfolio-boundji-ewo.webp", cls: "hb-5", eager: false },
          ].map(({ src, cls, eager }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              className={`hero-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,32,69,0.88) 0%, rgba(0,32,69,0.35) 50%, rgba(0,13,26,0.45) 100%)",
            }}
          />
        </div>
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(254,147,44,0.10), transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(37,99,235,0.08), transparent 60%)
            `,
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-20">
          <motion.div
            className="max-w-[680px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                Portfolio · 2012 → 2024
              </span>
            </motion.div>
            <div style={{ fontSize: "clamp(30px, 7.5vw, 100px)" }}>
              <TextReveal
                text="Chaque chantier"
                as="h1"
                className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em]"
                animate
                delay={0.1}
              />
              <TextReveal
                text="une preuve."
                as="div"
                className="font-headline font-black text-secondary-container leading-[0.92] tracking-[-0.03em] mb-6"
                animate
                delay={0.3}
              />
            </div>
            <motion.p
              variants={fadeUp}
              className="font-body text-white/70 text-lg leading-relaxed mb-10 max-w-xl"
            >
              +15 références BTP, voirie, industrie, énergie et génie rural livrées
              au Congo-Brazzaville. Parcours chronologique de notre savoir-faire.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          RÉFÉRENCES — Header + ExpandingCards (13 chantiers réels)
      ══════════════════════════════════════════════════════ */}
      <section
        id="references"
        className="bg-[#001022] pt-20 pb-20 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto mb-10 md:mb-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-6 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
            <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-[#234998]">
              Parcours chronologique · 2012 → 2024
            </span>
            <span className="w-6 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
          </div>
          <h2
            className="font-headline font-black text-white leading-[0.95] tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(18px, 4.5vw, 52px)" }}
          >
            12 ans de chantiers
          </h2>
          <p className="font-body text-white/55 text-base max-w-xl mx-auto">
            Survolez ou cliquez sur une carte pour découvrir chaque référence,
            triée par date de démarrage. Faites défiler horizontalement pour
            tout voir.
          </p>
        </div>

        <ExpandingCards items={itemsWithSelect} defaultActiveIndex={0} />

        {activeProjet && (
          <ProjetModal projet={activeProjet} onClose={() => setActiveProjet(null)} />
        )}

        <p className="text-center text-white/55 font-body text-xs mt-10 px-6">
          Source · Document interne{" "}
          <span className="font-bold text-white/50">
            Nos références en République du Congo
          </span>
          {" — Foga-Tech International"}
        </p>
      </section>
    </main>
  );
}
