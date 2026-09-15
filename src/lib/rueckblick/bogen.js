/* =====================================================================
   Geometrie der Sonnenuhr — Maße aus Figma `Rückblick / Grafik Sonnenuhr`
   Himmel 308 × 164, Bogenmitte (154, 164), Radius 141.
   ===================================================================== */
export const R = 141, MX = 154, MY = 164;

/** Punkt auf dem Bogen. 180° = Aufgang links, 0° = Untergang rechts. */
export const punkt = (grad) => [
  MX + R * Math.cos((grad * Math.PI) / 180),
  MY - R * Math.sin((grad * Math.PI) / 180)
];

/** Pfad von Winkel g0 nach g1, im Uhrzeigersinn über den Scheitel. */
export function bogen(g0, g1) {
  const a = punkt(g0), b = punkt(g1);
  return `M ${a[0].toFixed(2)} ${a[1].toFixed(2)} A ${R} ${R} 0 0 1 ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
}

/** Bogenlänge in Nutzereinheiten — exakt, ohne getTotalLength(). */
export const bogenLaenge = (g0, g1) => (R * Math.abs(g0 - g1) * Math.PI) / 180;

/** Winkel der i-ten von n Stundenmarken. */
export const winkelFuer = (i, n) => 180 - (i / (n - 1)) * 180;

/**
 * Das Gestirn fährt denselben Weg wie der Stift, aber nur bis zum Anteil f
 * und hält dann an. Damit es dabei exakt auf der Stiftspitze sitzt, bekommt
 * es nicht dieselbe Kurve, sondern deren LINKEN ABSCHNITT: bei f geteilt
 * (de Casteljau) und wieder auf 0…1 normiert.
 *
 * Eine kürzere Dauer mit derselben Kurve genügt nicht — dann läuft das
 * Gestirn dem Stift davon.
 *
 * @returns {{x:number, e:string}} x = Zeitanteil, e = cubic-bezier(…)
 */
export function teilKurve(kurve, f) {
  if (f >= 0.9999) return { x: 1, e: kurve };
  if (f <= 0.0001) return { x: 0, e: 'linear' };
  const m = String(kurve).match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return { x: f, e: 'linear' };                 // linear bleibt linear
  const [x1, y1, x2, y2] = m[1].split(',').map(Number);
  const B = (a, b) => (t) => { const u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; };
  const X = B(x1, x2), Y = B(y1, y2);

  let lo = 0, hi = 1, t = f;                            // Parameter mit Y(t) = f
  for (let i = 0; i < 40; i++) { t = (lo + hi) / 2; if (Y(t) < f) lo = t; else hi = t; }
  const xs = X(t);
  if (xs < 1e-4) return { x: f, e: 'linear' };

  const mix = (a, b) => a + (b - a) * t;
  const p01 = [mix(0, x1), mix(0, y1)];
  const p12 = [mix(x1, x2), mix(y1, y2)];
  const p012 = [mix(p01[0], p12[0]), mix(p01[1], p12[1])];
  const k = (v) => Math.min(1, Math.max(0, v));
  return {
    x: xs,
    e: `cubic-bezier(${k(p01[0] / xs).toFixed(4)},${(p01[1] / f).toFixed(4)},` +
       `${k(p012[0] / xs).toFixed(4)},${(p012[1] / f).toFixed(4)})`
  };
}

/* Sternenfeld — Positionen, Größen und Deckungen aus der Figma-Vorlage,
   dazu Takt, Versatz und Resttiefe des Funkelns. Die Takte sind gegeneinander
   verschoben, damit sich das Muster nicht erkennbar wiederholt. */
export const STERNE = [
  [52,102],[84,72],[120,54],[160,44],[198,58],[236,78],[260,116],[100,118],
  [140,96],[186,88],[214,122],[70,140],[154,130],[112,76],[196,132],[246,140],
  [58,132],[172,66],[132,150],[228,100],[90,100],[270,150]
].map(([x, y], i) => ({
  x, y,
  r: [2,1.5,2.5,1.5,2,3,1.5,2,1.5,2.5,2,1.5,2,2.5,1.5,2,1.5,2,2.5,1.5,2,1.5][i] / 2,
  deckung: [.9,.55,1,.6,.8,.7,.5,.85,.6,.95,.7,.5,.8,.9,.55,.75,.5,.85,1,.6,.7,.5][i],
  takt:    [3400,4700,2900,5300,3800,4300,5900,3100,4900,2700,4100,5500,3300,3900,5100,4500,6100,3700,2800,5700,4200,3500][i],
  versatz: [0,820,1460,240,1980,600,1240,1720,380,2160,940,1580,120,2040,700,1340,1860,460,2280,1060,1700,180][i],
  tiefe:   [.28,.42,.18,.48,.32,.38,.5,.24,.44,.2,.36,.46,.3,.26,.48,.34,.5,.28,.22,.46,.38,.32][i]
}));
