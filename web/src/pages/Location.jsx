import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
import CategoryReveal from '../components/CategoryReveal'
// Note: analytics page_views — peut être branché plus tard sur l'API si besoin

/* ── Data ─────────────────────────────────────────────────────────── */
const ENGINS_DATA = [
  { id:'poclain-320', categorie:'Terrassement', marque:'Caterpillar', nom:'Poclain 320', disponible:true, poids:'22,5 T', puissance:'172 HP', description:"Excavatrice CAT 320 — terrassement de précision, fouilles profondes et chargement. 4 unités disponibles.", img:'/engin-poclain-320.webp', specsIcon:['construction','electric_bolt'] },
  { id:'tractopelle', categorie:'Terrassement', marque:'Caterpillar', nom:'Tractopelle', disponible:true, poids:'8,5 T', puissance:'92 HP', description:'Polyvalente — chargement + creusement. 2 unités disponibles.', img:'/engin-tractopelle.webp', specsIcon:['agriculture','pan_tool'] },
  { id:'chargeur', categorie:'Terrassement', marque:'Caterpillar', nom:'Chargeur sur pneus', disponible:true, poids:'18,2 T', puissance:'210 HP', description:'Manutention de matériaux, terrassement et chargement camions. 8 unités disponibles.', img:'/engin-chargeur.webp', specsIcon:['agriculture','speed'] },
  { id:'bulldozer-d6', categorie:'Nivellement', marque:'Caterpillar', nom:'Bulldozer D6', disponible:true, poids:'20,5 T', puissance:'Lame: 3,9 m', description:'Poussée puissante pour nivellement de masse, déblaiement et préparation de terrain. 2 unités disponibles.', img:'/engin-bulldozer-d6.webp', specsIcon:['width_full','speed'] },
  { id:'niveleuse', categorie:'Nivellement', marque:'Caterpillar', nom:'Niveleuse', disponible:true, poids:'14,8 T', puissance:'173 HP', description:'Profilage millimétrique de routes, pistes et plateformes. 2 unités disponibles.', img:'/engin-niveleuse.webp', specsIcon:['route','tune'] },
  { id:'benne-15', categorie:'Transport', marque:'Mercedes', nom:'Camion benne 15 m³', disponible:true, poids:'Volume: 15 m³', puissance:'2 ponts arrière', description:'Évacuation déblais et transport matériaux. 30 unités disponibles.', img:'/engin-benne-15.webp', specsIcon:['local_shipping','terrain'] },
  { id:'benne-20', categorie:'Transport', marque:'MAN', nom:'Camion benne 20 m³', disponible:true, poids:'Volume: 20 m³', puissance:'3 ponts', description:'Capacité supérieure pour chantiers à grande échelle. 4 unités disponibles.', img:'/engin-benne-20.webp', specsIcon:['local_shipping','terrain'] },
  { id:'fourgon', categorie:'Transport', marque:'Renault Trucks', nom:'Camion fourgon 30 T', disponible:true, poids:'Charge: 30 T', puissance:'Caisson 7,8×2,5 m', description:'Grand fourgon 10 roues — transport charges volumineuses. 5 unités disponibles.', img:'/engin-fourgonnette.webp', specsIcon:['local_shipping','inventory_2'] },
  { id:'plateau', categorie:'Transport', marque:'Renault Trucks', nom:'Camion plateau 30 T', disponible:true, poids:'Charge: 30 T', puissance:'Plateau 7,8 m', description:"Transport d'engins et structures métalliques. 5 unités disponibles.", img:'/engin-plateau.webp', specsIcon:['local_shipping','view_in_ar'] },
  { id:'citerne', categorie:'Transport', marque:'Renault Trucks', nom:'Camion citerne', disponible:true, poids:'36 000 L', puissance:'Eau / Carburant', description:'Approvisionnement chantier — eau et carburant. 5 unités disponibles.', img:'/engin-citerne.webp', specsIcon:['water_drop','local_gas_station'] },
  { id:'camion-grue', categorie:'Levage', marque:'Liebherr', nom:'Camion grue', disponible:true, poids:'Cap. levage 8 T', puissance:'10 roues', description:'Levage mobile autonome — pose structures, déchargement. 5 unités disponibles.', img:'/engin-camion-grue.webp', specsIcon:['vertical_align_top','directions_car'] },
  { id:'pickup-l200', categorie:'Utilitaires', marque:'Mitsubishi', nom:'Pick-up L200 Triton 4×4', disponible:true, poids:'Double cabine', puissance:'4×4 climatisé', description:'Déplacement équipes, zones difficiles. 20 unités disponibles.', img:'/engin-pickup-l200.webp', specsIcon:['directions_car','terrain'] },
  { id:'auto-betoniere', categorie:'Bétonnage', marque:'Mercedes', nom:'Auto-bétonnière', disponible:true, poids:'Capacité 6 m³', puissance:'Malaxeur intégré', description:'Fabrication et transport béton sur site. 1 unité disponible.', img:'/engin-auto-betoniere.webp', specsIcon:['blender','local_shipping'] },
  { id:'betoniere', categorie:'Bétonnage', marque:'Imer', nom:'Bétonnière', disponible:true, poids:'Capacité 500 L', puissance:'Moteur thermique', description:'Production béton sur chantier. 4 unités disponibles.', img:'/engin-betoniere.webp', specsIcon:['blender','electric_bolt'] },
  { id:'toupie', categorie:'Bétonnage', marque:'Liebherr', nom:'Toupie béton', disponible:true, poids:'Cuve 8 m³', puissance:'Brassage continu', description:"Transport béton prêt à l'emploi. 2 unités disponibles.", img:'/engin-toupie.webp', specsIcon:['blender','local_shipping'] },
  { id:'pompe-beton', categorie:'Bétonnage', marque:'Putzmeister', nom:'Pompe à béton', disponible:true, poids:'Portée 32 m', puissance:'120 m³/h', description:'Distribution béton en hauteur. 1 unité disponible.', img:'/engin-pompe-beton.webp', specsIcon:['water_pump','vertical_align_top'] },
]

const CATS = [
  { id:'Terrassement', icon:'construction',      img:'/engin-poclain-320.webp',  count:3, desc:'Excavation, fouilles, chargement' },
  { id:'Nivellement',  icon:'tune',              img:'/engin-niveleuse.webp',    count:2, desc:'Routes, pistes, plateformes' },
  { id:'Transport',    icon:'local_shipping',    img:'/engin-benne-15.webp',     count:6, desc:'Bennes, plateaux, citernes' },
  { id:'Levage',       icon:'vertical_align_top',img:'/engin-camion-grue.webp',  count:1, desc:'Levage mobile, pose structures' },
  { id:'Bétonnage',    icon:'blender',           img:'/engin-toupie.webp',       count:4, desc:'Toupies, pompes, bétonnières' },
  { id:'Utilitaires',  icon:'directions_car',    img:'/engin-pickup-l200.webp',  count:1, desc:'Pick-up 4×4, véhicules légers' },
]

/* ── Composant principal ───────────────────────────────────────────── */
export default function Location() {
  const [phase, setPhase] = useState('categories') // 'categories' | 'reveal' | 'showroom'
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState(new Set())

  /* ── Basket ────────────────────────────────────────────────────── */
  const toggleSelect = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const whatsappDevisGroupe = useCallback(() => {
    const engins = ENGINS_DATA.filter(e => selected.has(e.id))
    const liste = engins.map(e => `• ${e.nom} (${e.categorie})`).join('\n')
    const msg = encodeURIComponent(
      `Bonjour Foga-Tech,\n\nJe souhaite obtenir un devis pour la location des engins suivants :\n${liste}\n\nMerci de me préciser les disponibilités, la durée minimale et les modalités de livraison.`
    )
    window.open(`https://wa.me/242069905640?text=${msg}`, '_blank')
  }, [selected])

  /* ── Navigation clavier (phase showroom) ───────────────────────── */
  const categoryEngins = activeCategory
    ? ENGINS_DATA.filter(e => e.categorie === activeCategory)
    : []
  const current = categoryEngins[activeIndex] ?? null

  const goToCategory = useCallback((catId) => {
    setActiveCategory(catId)
    setActiveIndex(0)
    setPhase('reveal')          // → CategoryReveal → showroom (auto)
  }, [])

  useEffect(() => {
    if (phase !== 'showroom') return
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex(i => Math.max(0, i - 1))
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(i => Math.min(categoryEngins.length - 1, i + 1))
      } else if (e.key === 'Escape') {
        setPhase('categories')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, categoryEngins.length])

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#001022]">
      <SEO
        title="Location d'engins BTP Brazzaville — Foga-Tech"
        description="65 engins BTP disponibles à Brazzaville : pelleteuses, bulldozers, grues, camions. Livraison sous 24h, opérateurs certifiés. Foga-Tech BTP Congo."
        canonical="https://foga-tech.tech/location"
      />

      {/* ── PHASE 1 : Sélecteur catégories ─────────────────────────── */}
      {phase === 'categories' && (
        <section className="min-h-screen flex flex-col px-6 pt-24 pb-16">
          {/* Titre */}
          <div className="text-center mb-16">
            <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              <TextReveal
                text="Quel engin pour"
                as="h1"
                className="font-headline font-black text-white leading-[0.92] tracking-tight"
                animate
                delay={0.1}
              />
              <TextReveal
                text="votre chantier ?"
                as="div"
                className="font-headline font-black text-secondary-container leading-[0.92] tracking-tight mb-4"
                animate
                delay={0.3}
              />
            </div>
            <p className="font-body text-white/50 text-base max-w-lg mx-auto">
              Sélectionnez une catégorie — on vous guide vers le bon matériel.
            </p>
          </div>

          {/* Grille catégories */}
          <div className="max-w-5xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
            {CATS.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => goToCategory(cat.id)}
                className="relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer group text-left"
                aria-label={`Catégorie ${cat.id}`}
              >
                {/* Image fond */}
                <img
                  src={cat.img}
                  alt={cat.id}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay permanent */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#001022]/90 via-[#001022]/40 to-transparent" />
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-secondary-container/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                {/* Contenu */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <span className="material-symbols-outlined text-secondary-container text-3xl mb-2 block">
                    {cat.icon}
                  </span>
                  <div className="font-headline font-bold text-white text-xl leading-tight">
                    {cat.id}
                  </div>
                  <div className="font-label text-[10px] uppercase tracking-widest text-white/50 mt-0.5">
                    {cat.count} engins
                  </div>
                  <div className="hidden md:block font-body text-xs text-white/40 mt-1">
                    {cat.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── PHASE 2 : Showroom ─────────────────────────────────────── */}
      {phase === 'showroom' && current && (
        <div className="min-h-screen flex flex-col bg-[#001022]">
          {/* ── Header showroom : retour ── */}
          <div className="px-8 md:px-12 pt-24 pb-0 flex-shrink-0">
            {/* Retour */}
            <button
              onClick={() => setPhase('categories')}
              className="flex items-center gap-2 text-white/40 hover:text-white font-body text-xs uppercase tracking-widest mb-6 transition-colors w-fit"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Retour aux catégories
            </button>
          </div>

          {/* ── Split-screen ── */}
          <section className="flex-1 flex flex-col lg:flex-row">
          {/* LEFT PANEL */}
          <div className="lg:w-[45%] bg-[#001022] flex flex-col justify-center px-8 md:px-12 py-8 lg:py-12 order-2 lg:order-1">
            {/* Badge catégorie */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 font-label text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 w-fit">
              <span className="material-symbols-outlined text-xs">
                {CATS.find(c => c.id === activeCategory)?.icon ?? 'category'}
              </span>
              {activeCategory}
            </div>

            {/* Nom engin */}
            <h2
              className="font-headline font-black text-white leading-[0.88] tracking-[-0.04em] mb-2"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
            >
              {current.nom}
            </h2>

            {/* Marque */}
            <div className="font-body text-secondary-container text-sm uppercase tracking-widest mb-8">
              {current.marque}
            </div>

            {/* Séparateur */}
            <div className="h-px bg-white/10 mb-6" />

            {/* Specs */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container text-base">
                  {current.specsIcon[0]}
                </span>
                <span className="font-label font-bold text-white text-xs">{current.poids}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container text-base">
                  {current.specsIcon[1]}
                </span>
                <span className="font-label font-bold text-white text-xs">{current.puissance}</span>
              </div>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-white/10 mb-6" />

            {/* Image mobile */}
            <div className="lg:hidden mb-6 rounded-2xl overflow-hidden">
              <img
                src={current.img}
                alt={current.nom}
                className="h-56 w-full object-cover"
              />
            </div>

            {/* Description */}
            <p className="font-body text-white/55 text-sm leading-relaxed mb-6">
              {current.description}
            </p>

            {/* Disponibilité */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </div>
              <span className="font-label font-bold text-[10px] uppercase tracking-widest text-green-400">
                Disponible · Tarif sur devis
              </span>
            </div>

            {/* Bouton Sélectionner */}
            {(() => {
              const isSelected = selected.has(current.id)
              return (
                <button
                  onClick={() => toggleSelect(current.id)}
                  className={`w-full py-4 rounded-2xl font-headline font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-white text-[#001022] hover:bg-secondary-container hover:text-on-secondary-container'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: `'FILL' ${isSelected ? 1 : 0}` }}
                  >
                    {isSelected ? 'check_circle' : 'add_circle'}
                  </span>
                  {isSelected ? 'Sélectionné' : 'Sélectionner cet engin'}
                </button>
              )
            })()}

            {/* Navigation prev/next */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-20 transition-colors font-body text-sm"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Précédent
              </button>
              <span className="font-label font-bold text-[10px] uppercase tracking-widest text-white/55">
                {activeIndex + 1} / {categoryEngins.length}
              </span>
              <button
                onClick={() => setActiveIndex(i => Math.min(categoryEngins.length - 1, i + 1))}
                disabled={activeIndex === categoryEngins.length - 1}
                className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-20 transition-colors font-body text-sm"
              >
                Suivant
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            {/* ── Carousel catégories ── */}
            {(() => {
              const catIdx = CATS.findIndex(c => c.id === activeCategory)
              const prev = () => {
                const i = (catIdx - 1 + CATS.length) % CATS.length
                setActiveCategory(CATS[i].id); setActiveIndex(0)
              }
              const next = () => {
                const i = (catIdx + 1) % CATS.length
                setActiveCategory(CATS[i].id); setActiveIndex(0)
              }
              return (
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3">
                  {/* Flèche gauche */}
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Catégorie précédente"
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/40 hover:text-white hover:border-white/40 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>

                  {/* Track — 3 pills visibles, centré sur l'actif */}
                  <div className="flex-1 overflow-hidden relative">
                    <div
                      className="flex gap-3 transition-transform duration-400 ease-out"
                      style={{ transform: `translateX(calc(50% - ${catIdx * (160 + 12) + 80}px))` }}
                    >
                      {CATS.map((cat, i) => {
                        const isActive = i === catIdx
                        const dist = Math.abs(i - catIdx)
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setActiveCategory(cat.id); setActiveIndex(0) }}
                            aria-current={isActive ? 'true' : undefined}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-label font-bold text-[11px] uppercase tracking-widest border transition-all duration-400 whitespace-nowrap"
                            style={{
                              width: 160,
                              opacity: dist === 0 ? 1 : dist === 1 ? 0.45 : 0.15,
                              transform: `scale(${isActive ? 1 : 0.92})`,
                              background: isActive ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.04)',
                              color: isActive ? 'var(--color-on-secondary-container)' : 'rgba(255,255,255,0.6)',
                              borderColor: isActive ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.1)',
                              pointerEvents: dist > 1 ? 'none' : 'auto',
                            }}
                          >
                            <span
                              className="material-symbols-outlined text-sm flex-shrink-0"
                              aria-hidden="true"
                              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {cat.icon}
                            </span>
                            <span className="truncate">{cat.id}</span>
                          </button>
                        )
                      })}
                    </div>
                    {/* Fade edges */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#001022] to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#001022] to-transparent pointer-events-none" />
                  </div>

                  {/* Flèche droite */}
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Catégorie suivante"
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/40 hover:text-white hover:border-white/40 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              )
            })()}
          </div>

          {/* RIGHT PANEL — desktop uniquement */}
          <div className="relative hidden lg:block flex-1 order-1 lg:order-2">
            <img
              src={current.img}
              alt={current.nom}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />
            {/* Gradient gauche */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#001022] via-[#001022]/20 to-transparent" />
            {/* Badge Tarif sur devis */}
            <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md text-white font-label font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border border-white/20">
              Tarif sur devis
            </div>
          </div>
          </section>
        </div>
      )}

      {/* ── SECTION TRUST ──────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#001022]">
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon:'verified',       title:'Matériel certifié',  desc:'Contrôle technique avant chaque location' },
            { icon:'engineering',  title:'Opérateur inclus',   desc:'Chauffeur qualifié sur demande' },
            { icon:'local_shipping', title:'Livraison 24h',      desc:'Acheminement sur chantier dans tout le Congo' },
          ].map((item) => (
            <div key={item.icon} className="flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-secondary-container text-3xl">
                {item.icon}
              </span>
              <div className="font-headline font-bold text-white text-base">{item.title}</div>
              <div className="font-body text-white/40 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY REVEAL — transition fullscreen au clic catégorie ── */}
      <AnimatePresence>
        {phase === 'reveal' && activeCategory && (
          <CategoryReveal
            key={activeCategory}
            cat={CATS.find(c => c.id === activeCategory)}
            onComplete={() => setPhase('showroom')}
          />
        )}
      </AnimatePresence>

      {/* ── BASKET FLOTTANT ────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 bg-primary shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl px-6 py-4 border border-white/10 min-w-max">
            {/* Ping dot */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-container" />
              </div>
              <span className="text-white font-headline font-bold text-sm">
                {selected.size} engin{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
            </div>
            {/* Bouton devis groupé */}
            <button
              onClick={whatsappDevisGroupe}
              className="flex items-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-full hover:brightness-110 transition-all"
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              Devis groupé
            </button>
            {/* Effacer */}
            <button
              onClick={() => setSelected(new Set())}
              className="text-white/40 hover:text-white font-label font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
