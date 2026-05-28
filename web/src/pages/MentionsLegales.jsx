import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function MentionsLegales() {
  return (
    <main className="pt-24 pb-16 bg-surface min-h-screen">
      <SEO
        title="Mentions légales"
        description="Mentions légales de Foga-Tech International — éditeur, hébergeur, propriété intellectuelle et droit applicable."
        canonical="https://foga-tech.tech/mentions-legales"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <nav className="mb-6">
          <Link to="/" className="text-primary text-sm font-body hover:text-secondary transition-colors">← Accueil</Link>
        </nav>

        <h1 className="font-headline text-4xl font-black text-primary mb-8">Mentions légales</h1>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">1. Éditeur du site</h2>
          <div className="font-body text-on-surface space-y-2">
            <p><strong>Raison sociale :</strong> Foga-Tech International</p>
            <p><strong>Siège social :</strong> 1509 Rue Motaba, Plateaux des 15 ans (réf. pressing 5 à sec) — Moungali, Brazzaville, République du Congo</p>
            <p><strong>Bureau Pointe-Noire :</strong> 34 Rue Atali, Centre Ville — derrière Ex Bouda Bar, Pointe-Noire</p>
            <p><strong>RCCM :</strong> CG/BZV/17B6964</p>
            <p><strong>NIU :</strong> M2017110000375160</p>
            <p><strong>Directeur de publication :</strong> Direction générale — Foga-Tech International</p>
            <p><strong>Contact :</strong> contact@foga-tech.com | +242 06 990 56 40 / +242 06 990 56 40</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">2. Hébergeur</h2>
          <div className="font-body text-on-surface space-y-2">
            <p><strong>Hostinger International UAB</strong></p>
            <p>Švitrigailos g. 34, Vilnius 03230, Lituanie</p>
            <p>Site : <a href="https://www.hostinger.com" className="text-primary underline">hostinger.com</a></p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">3. Propriété intellectuelle</h2>
          <div className="font-body text-on-surface">
            <p>L'ensemble du contenu de ce site (textes, images, logos, codes) est la propriété exclusive de Foga-Tech BTP. Toute reproduction, diffusion ou exploitation commerciale sans autorisation écrite préalable est interdite.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">4. Responsabilité</h2>
          <div className="font-body text-on-surface">
            <p>Foga-Tech BTP s'efforce de fournir des informations exactes mais ne peut garantir l'exactitude, l'exhaustivité ou l'actualité des contenus. L'entreprise décline toute responsabilité en cas d'erreur ou d'indisponibilité du service.</p>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">5. Droit applicable</h2>
          <div className="font-body text-on-surface">
            <p>Les présentes mentions légales sont régies par le droit congolais. Tout litige relève de la compétence exclusive des tribunaux de Brazzaville.</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-outline-variant space-y-6">
          <div>
            <p className="text-on-surface-variant text-xs font-body uppercase tracking-widest mb-3">Voir aussi</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/confidentialite" className="text-primary text-sm font-body hover:text-secondary transition-colors">Politique de confidentialité</Link>
              <Link to="/cgu" className="text-primary text-sm font-body hover:text-secondary transition-colors">CGU</Link>
            </div>
          </div>
          <Link to="/" className="inline-block text-primary font-headline font-bold text-sm uppercase tracking-widest hover:text-secondary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
