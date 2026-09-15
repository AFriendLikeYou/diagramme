/**
 * Svelte-Action: meldet, sobald das Element weit genug im Bild ist.
 * Feuert genau einmal; danach hängt kein Beobachter mehr am Knoten.
 *
 *   <svg use:sicht={{ an: starten, aktiv: autoplay }}>
 */
export function sicht(knoten, optionen = {}) {
  let beobachter;

  function an(o) {
    const { an: melden, aktiv = true, schwelle = 0.35 } = o;
    if (!aktiv) return;                       // Start übernimmt die Anwendung
    if (typeof IntersectionObserver === 'undefined') { melden?.(); return; }
    beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) { melden?.(); beobachter.disconnect(); beobachter = null; }
      }
    }, { threshold: schwelle });
    beobachter.observe(knoten);
  }

  an(optionen);
  return {
    update(neu) { beobachter?.disconnect(); beobachter = null; an(neu); },
    destroy() { beobachter?.disconnect(); beobachter = null; }
  };
}
