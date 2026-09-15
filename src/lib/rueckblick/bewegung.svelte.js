/**
 * Bewegung reduzieren — folgt der Systemeinstellung und lässt sich
 * von der Anwendung übersteuern.
 *
 *   import { bewegung } from '$lib/rueckblick';
 *   bewegung.ruhig = true;          // z. B. aus einem eigenen Schalter
 *
 * Die Media Query wird beim Laden des Moduls abgefragt, nicht erst beim
 * ersten Lesen: eine Zustandsänderung während des Renderns würde Svelte
 * zu Recht bemängeln.
 */
let _ruhig = $state(false);

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const frage = window.matchMedia('(prefers-reduced-motion: reduce)');
  _ruhig = frage.matches;
  frage.addEventListener('change', (e) => { _ruhig = e.matches; });
}

export const bewegung = {
  get ruhig() { return _ruhig; },
  set ruhig(wert) { _ruhig = wert; }
};
