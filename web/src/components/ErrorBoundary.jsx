import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-surface flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <span
              className="material-symbols-outlined text-6xl text-outline-variant block mb-6"
              aria-hidden="true"
            >
              error_outline
            </span>
            <h1 className="font-headline text-3xl font-black text-primary mb-3">
              Une erreur inattendue est survenue
            </h1>
            <p className="text-on-surface-variant font-body mb-8">
              Notre équipe a été notifiée. Vous pouvez essayer de recharger la page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-xs px-8 py-4 hover:shadow-tectonic-orange transition-all duration-200 rounded-full"
              >
                Recharger
              </button>
              <a
                href="/"
                className="border-2 border-outline-variant text-on-surface font-headline font-bold uppercase text-xs tracking-widest px-6 py-4 hover:border-primary hover:text-primary transition-colors rounded-full"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
