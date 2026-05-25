import { useState, useEffect, useRef } from 'react'

const STATS = [
  { label: 'Chantiers en cours', value: 12, suffix: '', color: 'text-secondary-container' },
  { label: 'Livrés en Avril', value: 3, suffix: '', color: 'text-success' },
  { label: 'Engins actifs', value: 22, suffix: '', color: 'text-primary' },
  { label: 'Clients servis', value: 847, suffix: '+', color: 'text-on-surface-variant' },
]

function CountUp({ target, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(current))
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LiveDashboard() {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="bg-surface-container-low border-y border-outline-variant py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`w-2.5 h-2.5 rounded-full bg-green-400 ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity duration-700`} />
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Tableau de bord en direct</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-4xl md:text-5xl font-black ${s.color}`}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-on-surface-variant mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
