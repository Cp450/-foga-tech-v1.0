/**
 * WaveBackground — vagues SVG animées en CSS pure (GPU, 0 JS).
 * - Désactivé sur mobile (<768px) et prefers-reduced-motion
 * - Charte mix navy #002045 + orange #FE932C
 * - 5 vagues superposées à vitesses/opacités différentes pour profondeur
 */
export default function WaveBackground() {
  // Pattern sinusoïdal : période 600px, amplitude 60px, baseline variable
  // Path width 2400 = 4 périodes ; translation -1200px = boucle seamless (2 périodes)
  const wavePath = (baseY) =>
    `M 0,${baseY} ` +
    `C 150,${baseY - 60} 300,${baseY + 60} 600,${baseY} ` +
    `S 900,${baseY - 60} 1200,${baseY} ` +
    `S 1500,${baseY + 60} 1800,${baseY} ` +
    `S 2100,${baseY - 60} 2400,${baseY}`;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block motion-reduce:hidden"
    >
      <svg
        viewBox="0 0 2400 800"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-[200%] h-full"
      >
        {/* Wave 1 — navy slow base */}
        <path
          d={wavePath(200)}
          stroke="#002045"
          strokeWidth="2"
          fill="none"
          opacity="0.45"
          className="wave-flow wave-1"
        />
        {/* Wave 2 — orange medium */}
        <path
          d={wavePath(320)}
          stroke="#FE932C"
          strokeWidth="1.5"
          fill="none"
          opacity="0.25"
          className="wave-flow wave-2"
        />
        {/* Wave 3 — navy mid */}
        <path
          d={wavePath(440)}
          stroke="#1a365d"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
          className="wave-flow wave-3"
        />
        {/* Wave 4 — orange fast */}
        <path
          d={wavePath(560)}
          stroke="#FE932C"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
          className="wave-flow wave-4"
        />
        {/* Wave 5 — navy bottom */}
        <path
          d={wavePath(680)}
          stroke="#002045"
          strokeWidth="2.5"
          fill="none"
          opacity="0.4"
          className="wave-flow wave-5"
        />
      </svg>
    </div>
  );
}
