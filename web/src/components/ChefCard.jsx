const CHEFS = [
  {
    id: 1,
    nom: "Parfait Moukassa",
    titre: "Ingénieur Génie Civil",
    specialite: "Résidentiel & BTP",
    experience: 14,
    projets: 34,
    note: 4.9,
    avis: 47,
    certifs: [
      "Ordre des Ingénieurs Congo",
      "Agrément Ministère BTP",
      "HQE Concepteur",
    ],
    bio: "Diplômé de l'ENSP Brazzaville + INSA Lyon. Spécialiste structures R+4 et éco-construction.",
    dispo: true,
    photo: null,
  },
  {
    id: 2,
    nom: "Christelle Nzaba",
    titre: "Architecte DPLG",
    specialite: "Commercial & Bureaux",
    experience: 11,
    projets: 28,
    note: 5.0,
    avis: 31,
    certifs: [
      "Ordre des Architectes Congo",
      "LEED Green Associate",
      "HQE Concepteur",
    ],
    bio: "Architecte DPLG formée à Yaoundé et Paris La Villette. Signature esthétique contemporaine afro-moderne.",
    dispo: true,
    photo: null,
  },
  {
    id: 3,
    nom: "Jean-Baptiste Okoko",
    titre: "Ingénieur Travaux Publics",
    specialite: "Génie Rural & Infrastructure",
    experience: 17,
    projets: 52,
    note: 4.7,
    avis: 63,
    certifs: ["Ministère BTP Congo", "CFCO Travaux Ferroviaires", "Ordre des Ingénieurs"],
    bio: "Expert routes, ponts et ouvrages d'art. 17 ans sur terrain en zones rurales et périurbaines.",
    dispo: false,
    photo: null,
  },
];

function StarRating({ note }) {
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-sm ${i <= full ? "text-secondary-container" : i === full + 1 && half ? "text-secondary-container/50" : "text-outline-variant"}`}
          style={{ fontVariationSettings: i <= full || (i === full + 1 && half) ? "'FILL' 1" : "'FILL' 0" }}
          aria-hidden="true"
        >
          star
        </span>
      ))}
    </span>
  );
}

function ChefCard({ chef }) {
  const initials = chef.nom
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="bg-surface-container-low border border-outline-variant p-5 hover:border-success/50 transition-colors flex flex-col rounded-2xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-success/40 flex items-center justify-center text-on-primary text-xl font-black">
            {initials}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface-container-low ${chef.dispo ? "bg-green-400" : "bg-gray-500"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-on-surface font-bold text-sm leading-tight">
            {chef.nom}
          </h3>
          <p className="text-secondary-container text-xs font-semibold">{chef.titre}</p>
          <p className="text-on-surface-variant text-xs mt-0.5 truncate">
            {chef.specialite}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-4 py-3 border-y border-outline-variant">
        <div>
          <div className="text-on-surface font-black text-lg">{chef.experience}</div>
          <div className="text-on-surface-variant text-[10px]">ans exp.</div>
        </div>
        <div>
          <div className="text-success font-black text-lg">{chef.projets}</div>
          <div className="text-on-surface-variant text-[10px]">projets</div>
        </div>
        <div>
          <div className="text-secondary-container font-black text-lg">{chef.note}</div>
          <div className="text-on-surface-variant text-[10px]">/ 5</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StarRating note={chef.note} />
        <span className="text-xs text-on-surface-variant">
          {chef.avis} avis vérifiés
        </span>
      </div>

      <p className="text-on-surface-variant text-xs leading-relaxed mb-4 flex-1">
        {chef.bio}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {chef.certifs.map((c) => (
          <span
            key={c}
            className="text-[10px] bg-primary/10 border border-primary/30 text-primary px-2 py-0.5 flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-xs" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1", fontSize: "12px" }}>check_circle</span>
            {c}
          </span>
        ))}
      </div>

      <a
        href={`https://wa.me/242069610635?text=Bonjour%2C%20je%20voudrais%20travailler%20avec%20${encodeURIComponent(chef.nom)}%20sur%20mon%20projet`}
        target="_blank"
        rel="noreferrer"
        className={`w-full text-center text-sm py-2 font-semibold transition-colors ${chef.dispo ? rounded-full"bg-success text-on-success hover:bg-success/80" : "bg-surface text-on-surface-variant border border-outline-variant cursor-not-allowed"}`}
      >
        {chef.dispo ? "Demander ce chef →" : "Indisponible actuellement"}
      </a>
    </div>
  );
}

export default function ChefsSection() {
  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
            Équipe certifiée
          </p>
          <h2 className="text-3xl font-black text-primary mb-2">
            Vos Chefs de <span className="text-success">Projet</span>
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Vous choisissez votre chef. Certifications publiques, notes clients
            vérifiées.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHEFS.map((c) => (
            <ChefCard key={c.id} chef={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { CHEFS };
