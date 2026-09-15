import { tick } from 'svelte';
import { bewegung } from './bewegung.svelte.js';

/**
 * Gemeinsame Ablaufsteuerung aller drei Diagramme.
 *
 * `spielen()` setzt die Animation zurück und startet sie neu. Das Zurücksetzen
 * muss OHNE Übergang passieren: sonst laufen die Eigenschaften rückwärts, und
 * weil fast jede eine Verzögerung trägt, stehen sie im nächsten Bild noch auf
 * dem Endwert — der Vorwärts-Übergang hätte dann Start- und Zielwert gleich
 * und bewegte nichts. Dafür ist die Klasse `stumm` da.
 */
export function lauf() {
  let laeuft = $state(false);
  let stumm = $state(false);

  return {
    get laeuft() { return laeuft; },
    get stumm() { return stumm; },
    get ruhig() { return bewegung.ruhig; },

    /** Einmaliger Start, z. B. aus der `sicht`-Action. */
    starten: () => { laeuft = true; },

    /** Von vorn abspielen. */
    async spielen(wurzel) {
      if (bewegung.ruhig || !wurzel) { laeuft = true; return; }
      stumm = true;
      laeuft = false;
      await tick();
      void wurzel.getBoundingClientRect();   // Startwerte übernehmen
      stumm = false;
      await tick();
      void wurzel.getBoundingClientRect();
      laeuft = true;
    }
  };
}
