/**
 * Stable Pexels image URLs — organised by context.
 * Format: ?auto=compress&cs=tinysrgb&w={width}
 * All images are free to use (Pexels License).
 */

const px = (id, w = 1280) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

// ── Hero / Construction sites ────────────────────────────────────────────────
export const IMG_HERO_CHANTIER    = px(5298215,  1600) // construction workers South Africa
export const IMG_HERO_GENIE_RURAL = px(1144627,  1600) // rural road / field
export const IMG_HERO_DEVIS       = px(2219024,  1600) // building under construction
export const IMG_HERO_SMART_CITY  = px(31466702, 1600) // Kigali modern skyline Rwanda

// ── Portfolio / Projets ──────────────────────────────────────────────────────
export const IMG_PROJET_VILLA      = px(6430734,  800) // modern villa tropical plants
export const IMG_PROJET_COMMERCIAL = px(323705,   800) // commercial building
export const IMG_PROJET_ROUTE      = px(18263701, 800) // men working road construction
export const IMG_PROJET_IMMEUBLE   = px(439391,  800)  // apartment building
export const IMG_PROJET_SMART      = px(1105666, 800)  // modern city infrastructure
export const IMG_PROJET_AGRI       = px(440731,  800)  // agricultural land

// ── Routes & Ponts ───────────────────────────────────────────────────────────
export const IMG_HERO_ROUTES       = px(1078884,  1600) // road construction workers Africa
export const IMG_PONT_OUVRAGE      = px(2253643,  800)  // concrete bridge under construction
export const IMG_ROUTE_BITUMEE     = px(2199293,  800)  // freshly paved asphalt road

// ── Génie Rural ──────────────────────────────────────────────────────────────
export const IMG_TERRAIN_PREP      = px(1579356, 800)  // aerial view excavators bulldozers
export const IMG_SILOS_STOCKAGE    = px(1537498, 800)  // grain storage silos
export const IMG_IRRIGATION        = px(2255459, 800)  // irrigation system
export const IMG_SOLUTIONS_DURABLES= px(1108572, 800)  // solar + agricultural

// ── Élevage & Pisciculture ───────────────────────────────────────────────────
export const IMG_AVICULTURE        = px(735968,  640)  // poultry farm
export const IMG_PORCHERIE         = px(1300558, 640)  // pig farm
export const IMG_BOVINS            = px(422220,  640)  // cattle
export const IMG_PISCICULTURE      = px(128756,  640)  // fish pond

// ── Location Engins ──────────────────────────────────────────────────────────
export const IMG_EXCAVATRICE       = px(2760241, 640)  // excavator
export const IMG_GRUE              = px(2106042, 640)  // crane
export const IMG_BULLDOZER         = px(1216589, 640)  // bulldozer
export const IMG_CAMION_BENNE      = px(1108101, 640)  // dump truck
export const IMG_CHARGEUSE         = px(1586555, 640)  // wheel loader
export const IMG_NIVELEUSE         = px(1537498, 640)  // grader

// ── Équipe ───────────────────────────────────────────────────────────────────
export const IMG_CHEF_1 = px(19039168, 400) // African man studio portrait
export const IMG_CHEF_2 = px(7937365,  400) // female engineer clipboard helmet
export const IMG_CHEF_3 = px(19982408, 400) // construction worker Uganda
export const IMG_CHEF_4 = px(2379004,  400) // smiling professional man

// ── Divers ───────────────────────────────────────────────────────────────────
export const IMG_DEVIS_SIDEBAR = px(1005058, 640) // blueprints desk
