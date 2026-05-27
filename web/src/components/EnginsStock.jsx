import { useState, useEffect } from "react";
import { api } from "../lib/api";

const FALLBACK_STOCK = [
  {
    id: "bull",
    icon: "agriculture",
    name: "Bulldozers",
    available: 12,
    total: 15,
    price: "250K FCFA/j",
    tag: "Disponible",
  },
  {
    id: "grue",
    icon: "precision_manufacturing",
    name: "Grues mobiles",
    available: 8,
    total: 10,
    price: "400K FCFA/j",
    tag: "Disponible",
  },
  {
    id: "pelle",
    icon: "handyman",
    name: "Pelles hydrauliques",
    available: 15,
    total: 18,
    price: "200K FCFA/j",
    tag: "Disponible",
  },
  {
    id: "compac",
    icon: "tire_repair",
    name: "Compacteurs",
    available: 6,
    total: 8,
    price: "150K FCFA/j",
    tag: "Disponible",
  },
  {
    id: "beton",
    icon: "hardware",
    name: "Bétonnières",
    available: 20,
    total: 20,
    price: "80K FCFA/j",
    tag: "Stock complet",
  },
  {
    id: "camion",
    icon: "local_shipping",
    name: "Camions benne",
    available: 4,
    total: 12,
    price: "180K FCFA/j",
    tag: "Limité",
  },
];

function StockBar({ available, total }) {
  const pct = (available / total) * 100;
  const color =
    pct > 60 ? "bg-success" : pct > 30 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-surface rounded-full h-1.5 mt-2">
      <div
        className={`h-1.5 rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function EnginsStock() {
  const [stock, setStock] = useState(FALLBACK_STOCK);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/engins")
      .then((data) => { if (!cancelled && Array.isArray(data) && data.length) setStock(data); })
      .catch(() => { /* fallback statique conservé */ });

    // Polling léger toutes les 60s pour rafraîchir le stock — pas de websocket
    const interval = setInterval(() => {
      api.get("/api/engins")
        .then((data) => {
          if (cancelled || !Array.isArray(data) || !data.length) return;
          setStock((prev) => {
            const changed = data.some((d, i) => prev[i]?.available !== d.available);
            if (changed) {
              setPulse(true);
              setTimeout(() => setPulse(false), 800);
            }
            return data;
          });
        })
        .catch(() => {});
    }, 60000);

    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const waMsg = (name, price) =>
    `Bonjour Foga-Tech, je voudrais réserver un(e) ${name} (${price}) - disponibilité immédiate?`;

  return (
    <section id="engins" className="py-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full bg-green-400 ${pulse ? "scale-150" : "scale-100"} transition-transform`}
              />
              <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                Stock en temps réel
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-primary">
              Location <span className="text-secondary-container">Engins BTP</span>
            </h2>
            <p className="text-on-surface-variant mt-1">
              Confirmation sous 2h · Livraison chantier sous 24h · Maintenance
              incluse
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-surface px-4 py-3 border border-outline-variant">
              <div className="text-2xl font-black text-secondary-container">
                {stock.reduce((s, e) => s + e.available, 0)}
              </div>
              <div className="text-xs text-on-surface-variant">Engins dispo</div>
            </div>
            <div className="bg-surface px-4 py-3 border border-outline-variant">
              <div className="text-2xl font-black text-success">24h</div>
              <div className="text-xs text-on-surface-variant">Livraison max</div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stock.map((e) => (
            <div
              key={e.id}
              className="bg-surface border border-outline-variant p-5 hover:border-secondary-container/50 transition-colors group rounded-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">{e.icon}</span>
                <span
                  className={`text-xs px-2 py-1 font-semibold ${
                    e.available > 0
                      ? "bg-success/20 text-green-700"
                      : "bg-red-500/20 text-red-600"
                  }`}
                >
                  {e.tag}
                </span>
              </div>
              <h3 className="text-on-surface font-bold mb-1">{e.name}</h3>
              <p className="text-secondary-container font-bold text-sm mb-2">{e.price}</p>
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>{e.available} disponibles</span>
                <span>/{e.total} total</span>
              </div>
              <StockBar available={e.available} total={e.total} />
              <a
                href={`https://wa.me/242069905640?text=${encodeURIComponent(waMsg(e.name, e.price))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center bg-secondary-container/10 border border-secondary-container/30 hover:bg-secondary-container text-secondary-container hover:text-on-secondary-container text-sm font-semibold py-2 transition-all rounded-full"
              >
                Réserver maintenant
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-surface border border-outline-variant p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl">
          <div>
            <h3 className="text-on-surface font-bold">
              Engin URGENCE — Modèle Uber
            </h3>
            <p className="text-sm text-on-surface-variant">
              Besoin d&apos;un engin maintenant? Confirmation sous 2h · Tarif urgence
              +15%
            </p>
          </div>
          <a
            href={`https://wa.me/242069905640?text=${encodeURIComponent("URGENT - J'ai besoin d'un engin BTP immédiatement pour mon chantier.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 text-sm transition-colors rounded-full"
          >
            Engin MAINTENANT
          </a>
        </div>
      </div>
    </section>
  );
}
