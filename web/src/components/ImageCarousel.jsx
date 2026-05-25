import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '../lib/cn'

/* ── ImageCarousel ─────────────────────────────────────────────── */
export default function ImageCarousel({ images = [], title = '', autoPlay = true, interval = 5000 }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState('next') // for animation hint
  const timerRef = useRef(null)

  const total = images.length

  const go = useCallback((dir) => {
    setDirection(dir)
    setCurrent((c) => dir === 'next' ? (c + 1) % total : (c - 1 + total) % total)
  }, [total])

  // Auto-play
  useEffect(() => {
    if (!autoPlay || paused || lightbox) return
    timerRef.current = setInterval(() => go('next'), interval)
    return () => clearInterval(timerRef.current)
  }, [autoPlay, paused, lightbox, go, interval])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') go('next')
      if (e.key === 'ArrowLeft') go('prev')
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (!total) return null

  const img = images[current]

  return (
    <>
      {/* ── Carousel ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Main image */}
        <div className="relative aspect-[16/9] bg-surface-container overflow-hidden rounded-2xl">
          <img
            key={current}
            src={img.src}
            alt={img.alt || `Visuel ${current + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent pointer-events-none" />

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {img.tag && (
              <span className="inline-block bg-secondary-container text-on-secondary-container text-[9px] font-label font-black uppercase tracking-[0.2em] px-2 py-0.5 mb-2">
                {img.tag}
              </span>
            )}
            {img.caption && (
              <p className="font-headline font-bold text-white text-sm leading-snug">{img.caption}</p>
            )}
            {img.sub && (
              <p className="text-on-primary/60 font-body text-xs mt-0.5">{img.sub}</p>
            )}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-4 right-4 w-9 h-9 bg-primary/60 hover:bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Agrandir"
          >
            <span className="material-symbols-outlined text-base">fullscreen</span>
          </button>
        </div>

        {/* Controls */}
        <button
          onClick={() => go('prev')}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/70 hover:bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          aria-label="Image précédente"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={() => go('next')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/70 hover:bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          aria-label="Image suivante"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-10">
          <div
            className="h-full bg-secondary-container transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 'next' : 'prev'); setCurrent(i) }}
            className={cn(
              'flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-all',
              i === current ? 'border-secondary-container' : 'border-transparent opacity-60 hover:opacity-90',
            )}
            aria-label={`Image ${i + 1}`}
          >
            <img src={img.src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}

        {/* Counter */}
        <div className="flex items-center ml-auto flex-shrink-0 pl-3">
          <span className="text-xs font-label font-bold text-on-surface-variant">
            {current + 1} / {total}
          </span>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Prev */}
          <button
            onClick={() => go('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Précédent"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>

          {/* Image */}
          <div className="max-w-5xl w-full mx-16">
            <img
              src={images[current].src}
              alt={images[current].alt || `Visuel ${current + 1}`}
              className="w-full max-h-[80vh] object-contain"
            />
            {images[current].caption && (
              <p className="text-white/70 font-body text-sm text-center mt-4">
                {images[current].caption}
              </p>
            )}
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-2 h-2 transition-all',
                    i === current ? 'bg-secondary-container w-6' : 'bg-white/30 hover:bg-white/60',
                  )}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={() => go('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Suivant"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>
        </div>
      )}
    </>
  )
}
