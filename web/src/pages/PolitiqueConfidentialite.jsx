import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function PolitiqueConfidentialite() {
  return (
    <main className="pt-24 pb-16 bg-surface min-h-screen">
      <SEO
        title="Politique de confidentialité"
        description="Politique de confidentialité de Foga-Tech International — données collectées, finalité, droits des utilisateurs."
        canonical="https://foga-tech.tech/confidentialite"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <nav className="mb-6">
          <Link to="/" className="text-primary text-sm font-body hover:text-secondary transition-colors">← Accueil</Link>
        </nav>

        <h1 className="font-headline text-4xl font-black text-primary mb-8">Politique de confidentialité</h1>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">1. Données collectées</h2>
          <div className="font-body text-on-surface space-y-2">
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone</li>
              <li>Informations relatives à votre projet BTP (localisation, surface, budget, délais)</li>
            </ul>
            <p>Ces données sont collectées via :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Le formulaire de demande de devis</li>
              <li>L'authentification client (magic-link Supabase)</li>
              <li>Les échanges WhatsApp et e-mails</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">2. Finalité du traitement</h2>
          <div className="font-body text-on-surface">
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Établir et vous transmettre un devis personnalisé</li>
              <li>Assurer le suivi de votre chantier via l'espace client</li>
              <li>Vous communiquer des informations relatives à nos services</li>
              <li>Répondre à vos demandes de contact</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">3. Base légale</h2>
          <div className="font-body text-on-surface">
            <p>Le traitement de vos données repose sur :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Le consentement :</strong> vous acceptez explicitement le traitement lors de la soumission du formulaire de devis</li>
              <li><strong>L'exécution contractuelle :</strong> traitement nécessaire à la mise en œuvre du contrat de construction</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">4. Durée de conservation</h2>
          <div className="font-body text-on-surface">
            <p>Nous conservons vos données pendant :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>3 ans</strong> après le dernier contact pour les prospects</li>
              <li><strong>10 ans</strong> après la fin du chantier pour les clients (garantie décennale)</li>
              <li><strong>3 ans</strong> après la dernière connexion pour les comptes clients inactifs</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">5. Destinataires des données</h2>
          <div className="font-body text-on-surface">
            <p>Vos données sont accessibles à :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>L'équipe Foga-Tech BTP (direction, chefs de projet, commerciaux)</li>
              <li>L'hébergeur Vercel Inc. (États-Unis)</li>
              <li>Supabase Inc. (base de données hébergée dans l'Union Européenne)</li>
            </ul>
            <p>Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">6. Vos droits</h2>
          <div className="font-body text-on-surface">
            <p>Conformément à la législation en vigueur, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement (sous réserve des obligations légales de conservation)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-4">Pour exercer ces droits, contactez-nous à : <strong>contact@foga-tech.com</strong></p>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold text-primary mb-4">7. Cookies</h2>
          <div className="font-body text-on-surface">
            <p>Ce site utilise :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Cookies techniques de session Supabase :</strong> nécessaires à l'authentification client (durée : 1 an)</li>
              <li><strong>Aucun cookie de tracking publicitaire</strong></li>
            </ul>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-outline-variant space-y-6">
          <div>
            <p className="text-on-surface-variant text-xs font-body uppercase tracking-widest mb-3">Voir aussi</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/mentions-legales" className="text-primary text-sm font-body hover:text-secondary transition-colors">Mentions légales</Link>
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
