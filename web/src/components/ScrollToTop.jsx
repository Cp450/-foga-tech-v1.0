import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — gère le scroll au changement de route :
 * - Sans hash : reset en haut (scroll 0)
 * - Avec hash : scroll vers l'élément #id (avec offset pour la navbar)
 * - Retry léger si l'élément n'est pas encore monté (lazy pages)
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // Retry pour attendre que la lazy page soit montée
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          const navOffset = 80; // hauteur navbar fixe
          const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
          window.scrollTo({ top, behavior: "smooth" });
        } else if (attempts < 10) {
          attempts++;
          setTimeout(tryScroll, 80);
        }
      };
      tryScroll();
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
