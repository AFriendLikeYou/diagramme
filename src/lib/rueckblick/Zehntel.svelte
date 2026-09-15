<!--
  Zehntel — wie viel Sie gelesen haben, im Vergleich zu allen anderen.

  Zehn Balken, einer davon markiert. Die Balken steigen der Reihe nach auf,
  der eigene mitten in der Reihe, nicht als Nachzügler.

  <Zehntel sie={9} titel="Oberstes Zehntel" />
-->
<script>
  import { lauf } from './lauf.svelte.js';
  import { sicht } from './sicht.js';

  let {
    /** Index des eigenen Zehntels, 0 (wenig) bis 9 (viel) */
    sie = 9,
    /** Marke und Balken in Textfarbe statt in Akzentrot */
    dunkel = false,
    /** Balkenhöhen in Nutzereinheiten, von links nach rechts (Figma-Werte) */
    hoehen = [31.1, 43.9, 56.8, 69.7, 82.6, 95.5, 108.4, 121.2, 134.1, 147],
    /** Beschriftung der Achse */
    links = 'wenig',
    rechts = 'viel',
    /** Aufschrift der Marke */
    marke = 'Sie',
    tempo = 1,
    autoplay = true,
    /** Vorlesetext; ohne Angabe aus dem eigenen Zehntel gebildet */
    beschriftung = null
  } = $props();

  const vorlesetext = $derived(beschriftung ?? `Zehn Zehntel, Ihr Zehntel: ${sie + 1}`);

  /* Maße aus Figma `Rückblick / Platz im Vergleich` (262:29914):
     Balken 27 breit, Raster 33,2, Band 325,8 — dieselben Einheiten wie die
     Balkenhöhen. Nur so stimmt das Verhältnis von Schrift und Marke zum Band. */
  const BW = 27, BASIS = 187, BREITE = 325.8;
  const BX = [0, 33.2, 66.4, 99.6, 132.8, 166, 199.2, 232.4, 265.6, 298.8];

  const L = lauf();
  let wurzel = $state(null);

  /** Von außen: Animation neu abspielen. */
  export function spielen() { return L.spielen(wurzel); }

  const balken = $derived(
    hoehen.map((h, i) => {
      const x = BX[i], y = BASIS - h, r = 4;
      return {
        i,
        eigen: i === sie,
        d: `M ${x} ${BASIS} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} ` +
           `H ${x + BW - r} A ${r} ${r} 0 0 1 ${x + BW} ${y + r} V ${BASIS} Z`
      };
    })
  );
  const mx = $derived(BX[sie] + BW / 2);
  const stil = $derived(`--rb-T:${(1 / tempo).toFixed(4)}`);
</script>

<svg
  bind:this={wurzel}
  class="zehntel"
  class:laeuft={L.laeuft}
  class:stumm={L.stumm}
  class:ruhig={L.ruhig}
  style={stil}
  viewBox="-16 -4 358 222"
  role="img"
  aria-label={vorlesetext}
  use:sicht={{ an: L.starten, aktiv: autoplay }}
>
  <!-- Die Grundlinie ist der Rahmen, den die Balken dann füllen -->
  <line class="grundlinie" x1="0" y1={BASIS + 0.5} x2={BREITE} y2={BASIS + 0.5} />

  {#each balken as b}
    <path
      class="balken"
      class:eigen={b.eigen}
      class:dunkel={b.eigen && dunkel}
      d={b.d}
      style="--i:{b.i}"
    />
  {/each}

  <g class="marke" class:dunkel>
    <rect x={mx - 21.5} y="0" width="43" height="30" rx="15" />
    <path d="M {mx - 6} 29 L {mx} 35 L {mx + 6} 29 Z" />
    <text x={mx} y="20" text-anchor="middle">{marke}</text>
  </g>

  <text class="achse frueh" x="0" y={BASIS + 23.6}>{links}</text>
  <text class="achse frueh" x={BREITE} y={BASIS + 23.6} text-anchor="end">{rechts}</text>
</svg>

<style>
  .zehntel {
    display: block; width: 100%; max-width: var(--rb-max, 560px); height: auto;
    margin-inline: auto; font-family: inherit;
  }
  .achse { font-size: 12px; fill: var(--rb-text-55); }

  .grundlinie {
    stroke: var(--rb-border-100); stroke-width: 1;
    transform-box: view-box; transform-origin: 0 187.5px; transform: scaleX(0);
    transition: transform calc(var(--rb-d-horizont) * var(--rb-T)) var(--rb-e) calc(var(--rb-v-horizont) * var(--rb-T));
  }
  .laeuft .grundlinie { transform: scaleX(1); }

  .frueh {
    opacity: 0;
    transition: opacity 600ms var(--rb-e) calc((var(--rb-v-horizont) + 200ms) * var(--rb-T));
  }
  .laeuft .frueh { opacity: 1; }

  .balken {
    fill: var(--rb-balken-grau);
    transform-box: fill-box; transform-origin: bottom; transform: scaleY(0);
    transition: transform calc(var(--rb-d-balken) * var(--rb-T)) var(--rb-e)
                calc((var(--rb-v-balken) + var(--i) * var(--rb-s-balken)) * var(--rb-T));
  }
  /* Der eigene Balken steigt in seiner Reihenfolge auf, nicht zuletzt —
     deshalb hängt die Verzögerung nur an --i. */
  .balken.eigen { fill: var(--rb-accent); transition-timing-function: var(--rb-e-pop); }
  .balken.dunkel { fill: var(--rb-text-100); }
  .laeuft .balken { transform: scaleY(1); }

  .marke {
    opacity: 0; transform: translateY(-10px);
    transition: opacity   calc(var(--rb-d-marke) * .5 * var(--rb-T)) var(--rb-e)     calc(var(--rb-v-marke) * var(--rb-T)),
                transform calc(var(--rb-d-marke) * var(--rb-T))      var(--rb-e-pop) calc(var(--rb-v-marke) * var(--rb-T));
  }
  .laeuft .marke { opacity: 1; transform: translateY(0); }
  .marke rect, .marke path { fill: var(--rb-accent); }
  .marke text { fill: var(--rb-weiss); font-size: 14px; }
  .marke.dunkel rect, .marke.dunkel path { fill: var(--rb-text-100); }
  .marke.dunkel text { fill: var(--rb-flaeche); }

  .stumm, .stumm * { transition: none !important; animation: none !important; }
  .ruhig, .ruhig * {
    animation: none !important;
    transition-property: opacity !important;
    transition-duration: 240ms !important;
    transition-delay: 0ms !important;
    transition-timing-function: ease !important;
  }
</style>
