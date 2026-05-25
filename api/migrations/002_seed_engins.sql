-- Foga-Tech BTP — Seed catalogue engins
BEGIN;

INSERT INTO engins (id, icon, name, available, total, price, tag, sort_order) VALUES
  ('bull',   'agriculture',             'Bulldozers',          12, 15, '250K FCFA/j', 'Disponible',    10),
  ('grue',   'precision_manufacturing', 'Grues mobiles',        8, 10, '400K FCFA/j', 'Disponible',    20),
  ('pelle',  'handyman',                'Pelles hydrauliques', 15, 18, '200K FCFA/j', 'Disponible',    30),
  ('compac', 'tire_repair',             'Compacteurs',          6,  8, '150K FCFA/j', 'Disponible',    40),
  ('beton',  'hardware',                'Bétonnières',         20, 20, '80K FCFA/j',  'Stock complet', 50),
  ('camion', 'local_shipping',          'Camions benne',        4, 12, '180K FCFA/j', 'Limité',        60)
ON CONFLICT (id) DO UPDATE SET
  icon       = EXCLUDED.icon,
  name       = EXCLUDED.name,
  total      = EXCLUDED.total,
  price      = EXCLUDED.price,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

COMMIT;
