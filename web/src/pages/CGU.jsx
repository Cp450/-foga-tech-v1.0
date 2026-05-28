import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function CGU() {
  return (
    <main className="pt-24 pb-16 bg-surface min-h-screen">
      <SEO
        title="Conditions Générales d'Utilisation"
        description="Conditions générales d'utilisation de Foga-Tech International — services, devis, responsabilité et droit applicable."
        canonical="https://foga-tech.tech/cgu"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <nav className="mb-6">
          <Link to="/" className="text-primary text-sm font-body hover:text-secondary transition-colors">← Accueil</Link>
        </nav>

        <h1 className="font-headline text-4xl font-black text-primary mb-8">Conditions Générales d'Utilisation</h1>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">1. Acceptation des conditions</h2>
          <div className="font-body text-on-surface">
            <p>L'accès et l'utilisation du site foga-tech.com impliquent l'acceptation sans réserve des présentes conditions générales d'utilisation. Foga-Tech BTP se réserve le droit de modifier ces conditions à tout moment. L'utilisateur est invité à les consulter régulièrement.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">2. Services proposés</h2>
          <div className="font-body text-on-surface">
            <p>Foga-Tech BTP propose les services suivants :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Génie Civil & BTP :</strong> construction de villas, immeubles, bureaux, locaux commerciaux</li>
              <li><strong>Études & Maîtrise d'œuvre :</strong> bureau d'étude, plans d'exécution, contrôle qualité</li>
              <li><strong>Génie Rural :</strong> routes, ponts, irrigation, infrastructures agricoles</li>
              <li><strong>Location d'engins :</strong> pelleteuses, bulldozers, grues, camions-béton</li>
              <li><strong>Devis en ligne :</strong> estimation indicative de projets de construction</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">3. Devis en ligne</h2>
          <div className="font-body text-on-surface space-y-4">
            <p><strong>Nature du devis :</strong> Les devis générés via le formulaire en ligne ou le calculateur budgétaire ont une valeur <strong>indicative</strong>. Ils constituent une estimation basée sur les informations fournies par l'utilisateur.</p>
            <p><strong>Devis ferme :</strong> Un devis ferme et définitif ne peut être établi qu'après :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Une visite technique du chantier</li>
              <li>Une étude détaillée des plans et cahier des charges</li>
              <li>Une validation écrite par Foga-Tech BTP</li>
            </ul>
            <p><strong>Validité :</strong> Les devis fermes sont valables 30 jours à compter de leur date d'émission.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">4. Délais de réalisation</h2>
          <div className="font-body text-on-surface">
            <p>Les délais annoncés sont des estimations basées sur notre expérience. Le délai ferme est fixé dans le contrat de construction signé entre les parties.</p>
            <p className="mt-4"><strong>Garantie de délai :</strong> En cas de retard imputable à Foga-Tech BTP, une pénalité de 0,5% du montant du contrat par semaine de retard est appliquée, dans la limite de 5% du montant total.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">5. Responsabilité</h2>
          <div className="font-body text-on-surface space-y-4">
            <p><strong>Limitation de responsabilité :</strong> Foga-Tech BTP ne peut être tenu responsable des dommages résultant de :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Force majeure (événements climatiques, conflits sociaux, pénurie de matériaux)</li>
              <li>Modifications demandées par le client en cours de chantier</li>
              <li>Retards de livraison de matériaux par des fournisseurs tiers</li>
            </ul>
            <p><strong>Assurances :</strong> Foga-Tech BTP est assurée pour :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>La responsabilité civile professionnelle</li>
              <li>La garantie décennale (gros œuvre)</li>
              <li>La garantie biennale (équipements)</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">6. Propriété intellectuelle</h2>
          <div className="font-body text-on-surface">
            <p>Tous les contenus du site (textes, images, plans, logos, codes source) sont la propriété exclusive de Foga-Tech BTP. Toute reproduction, représentation, modification ou adaptation, même partielle, est interdite sans autorisation écrite préalable, conformément aux articles du Code de la propriété intellectuelle.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">7. Modifications des CGU</h2>
          <div className="font-body text-on-surface">
            <p>Foga-Tech BTP se réserve le droit de modifier les présentes conditions générales à tout moment. Les nouvelles conditions s'appliquent à compter de leur mise en ligne. L'utilisation continue du site vaut acceptation des nouvelles conditions.</p>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">8. Droit applicable et juridiction</h2>
          <div className="font-body text-on-surface">
            <p>Les présentes conditions sont régies par le <strong>droit congolais</strong>. Tout litige relève de la compétence exclusive des tribunaux de <strong>Brazzaville</strong>, République du Congo.</p>
            <p className="mt-4">En cas de différend, une tentative de résolution amiable doit être engagée avant toute action judiciaire.</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-outline-variant space-y-6">
          <div>
            <p className="text-on-surface-variant text-xs font-body uppercase tracking-widest mb-3">Voir aussi</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/mentions-legales" className="text-primary text-sm font-body hover:text-secondary transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="text-primary text-sm font-body hover:text-secondary transition-colors">Politique de confidentialité</Link>
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
