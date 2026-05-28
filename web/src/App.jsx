import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import StickyMobileBar from './components/StickyMobileBar'
import WhatsAppButton from './components/WhatsAppButton'
import ChatbotFoga from './components/ChatbotFoga'
import ScrollToTop from './components/ScrollToTop'

// Code splitting — pages loaded on demand
const Home                 = lazy(() => import('./pages/Home'))
const Portfolio            = lazy(() => import('./pages/Portfolio'))
const GenieRural           = lazy(() => import('./pages/GenieRural'))
const GenieCivil           = lazy(() => import('./pages/GenieCivil'))
const DemandeDevis         = lazy(() => import('./pages/DemandeDevis'))
const ClientPortal         = lazy(() => import('./pages/ClientPortal'))
const Location             = lazy(() => import('./pages/Location'))
const SolutionsDurables    = lazy(() => import('./pages/SolutionsDurables'))
const InfrastructuresRurales = lazy(() => import('./pages/InfrastructuresRurales'))
const LevagePisciculture   = lazy(() => import('./pages/LevagePisciculture'))
const PortfolioDetail      = lazy(() => import('./pages/PortfolioDetail'))
const DevisParticulier     = lazy(() => import('./pages/DevisParticulier'))
const PartenairesPage      = lazy(() => import('./pages/PartenairesPage'))
const MentionsLegales      = lazy(() => import('./pages/MentionsLegales'))
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite'))
const CGU                  = lazy(() => import('./pages/CGU'))
const Contact              = lazy(() => import('./pages/Contact'))
const APropos              = lazy(() => import('./pages/APropos'))
const NotFound             = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="inline-block w-8 h-8 border-2 border-outline-variant border-t-secondary-container rounded-full animate-spin" />
    </div>
  )
}

function useLenis() {
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Reset Lenis on route change (Lenis persists scroll state)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
}

export default function App() {
  useLenis();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                                    element={<Home />} />
          <Route path="/portfolio"                           element={<Portfolio />} />
          <Route path="/portfolio/:id"                       element={<PortfolioDetail />} />
          <Route path="/genie-civil"                         element={<GenieCivil />} />
          <Route path="/genie-rural"                         element={<GenieRural />} />
          <Route path="/genie-rural/solutions-durables"      element={<SolutionsDurables />} />
          <Route path="/genie-rural/infrastructures-rurales" element={<InfrastructuresRurales />} />
          <Route path="/genie-rural/levage-pisciculture"     element={<LevagePisciculture />} />
          <Route path="/devis-particulier"                   element={<DevisParticulier />} />
          <Route path="/devis"                               element={<DemandeDevis />} />
          <Route path="/location"                            element={<Location />} />
          <Route path="/client/*"                            element={<ClientPortal />} />
          <Route path="/partenaires"                         element={<PartenairesPage />} />
          <Route path="/mentions-legales"                    element={<MentionsLegales />} />
          <Route path="/confidentialite"                     element={<PolitiqueConfidentialite />} />
          <Route path="/cgu"                                 element={<CGU />} />
          <Route path="/contact"                             element={<Contact />} />
          <Route path="/a-propos"                            element={<APropos />} />
          <Route path="*"                                    element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <StickyMobileBar />
      <WhatsAppButton />
      <ChatbotFoga />
    </>
  )
}

