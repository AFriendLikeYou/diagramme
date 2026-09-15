export { default as Sonnenuhr }     from './Sonnenuhr.svelte';
export { default as Zehntel }       from './Zehntel.svelte';
export { default as Themencluster } from './Themencluster.svelte';

export { bewegung } from './bewegung.svelte.js';
export { sicht }    from './sicht.js';

/* Geometrie und Kurvenrechnung, falls jemand daran weiterbaut */
export { bogen, bogenLaenge, punkt, winkelFuer, teilKurve, STERNE, R, MX, MY } from './bogen.js';

/* Beispieldaten aus der Figma-Vorlage */
export { TAGESZEITEN, ZEHNTEL, CLUSTER } from './daten.js';
