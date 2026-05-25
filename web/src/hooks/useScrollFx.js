import { useEffect } from 'react'

/**
 * Global scroll FX:
 * 1. IntersectionObserver toggles `.is-visible` on `.reveal` and `.reveal-group`
 *    Re-scans on DOM mutations + route changes (location dependency).
 * 2. Scroll-linked CSS var `--hero-parallax-y` on `.hero-parallax` (subtle Y shift).
 */
export default function useScrollFx(location) {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    function scan() {
      document.querySelectorAll('.reveal:not(.is-visible), .reveal-group:not(.is-visible)').forEach((el) => io.observe(el))
    }
    scan()

    const mo = new MutationObserver(() => scan())
    mo.observe(document.body, { childList: true, subtree: true })

    // Hero parallax — single rAF loop
    let raf = 0
    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        document.documentElement.style.setProperty('--hero-parallax-y', `${y * -0.18}px`)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      io.disconnect()
      mo.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [location])
}
