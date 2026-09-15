<!--
  Themencluster — was Sie lesen.

  Eine große Blase mit dem Hauptthema, darum herum die Nebenthemen. Zuerst
  taucht die Hauptblase auf, dann blenden die Nebenblasen in ihrer Mitte auf
  und wandern wachsend nach außen.

  Weg und Größe sitzen bewusst auf ZWEI Ebenen: `.blase` trägt den Weg,
  `.kern` die Größe. In einer einzigen transform-Eigenschaft müssten sich
  beide denselben Verlauf teilen — dann lässt sich das Wachsen nicht
  gegenüber dem Weg verschieben, ohne einen sichtbaren Knick zu erzeugen.

  <Themencluster haupt={{ x:159.3, y:111.3, r:77, text:"Innenpolitik" }}
                 neben={[{x:55.6, y:68.2, r:35.3, text:'Familie'}, …]} />
-->
<script>
  import { lauf } from './lauf.svelte.js';
  import { sicht } from './sicht.js';

  let {
    /** Hauptthema. x/y/r in Einheiten des 308 × 237 großen Feldes. */
    haupt = { x: 159.3, y: 111.3, r: 77, text: 'Innenpolitik Deutschland' },
    /** Nebenthemen, gleiche Einheiten. */
    neben = [
      { x: 55.6,  y: 68.2,  r: 35.3, text: 'Familie, Erziehung' },
      { x: 251.0, y: 46.4,  r: 35.3, text: 'Digitalisierung und\u00A0KI' },
      { x: 61.3,  y: 166.0, r: 35.3, text: 'Geschichte' },
      { x: 210.7, y: 200.2, r: 25.7, text: 'Wirtschafts\u00ADpolitik' },
      { x: 262.0, y: 111.3, r: 25.7, text: 'Persönlich\u00ADkeiten' }
    ],
    tempo = 1,
    autoplay = true,
    /** Vorlesetext; ohne Angabe aus dem Hauptthema gebildet */
    beschriftung = null
  } = $props();

  const vorlesetext = $derived(
    beschriftung ?? `Themen-Cluster, Hauptthema ${String(haupt.text).replace(/\u00AD/g, '')}`
  );

  const B = 308, H = 237;   // Feldmaße aus Figma
  const L = lauf();
  let wurzel = $state(null);

  /** Von außen: Animation neu abspielen. */
  export function spielen() { return L.spielen(wurzel); }

  const platz = (b) => ({
    left:   `${(100 * (b.x - b.r)) / B}%`,
    top:    `${(100 * (b.y - b.r)) / H}%`,
    width:  `${(100 * 2 * b.r) / B}%`,
    height: `${(100 * 2 * b.r) / H}%`
  });

  /* Reihenfolge nach Nähe zur Hauptblase: die innersten treten zuerst hervor.
     Die Nebenblasen stehen VOR der Hauptblase im DOM und liegen damit dahinter. */
  const sortiert = $derived(
    neben
      .map((b) => ({ b, abstand: Math.hypot(b.x - haupt.x, b.y - haupt.y) }))
      .sort((p, q) => p.abstand - q.abstand)
      .map(({ b }, i) => {
        const p = platz(b);
        return {
          text: b.text,
          stil:
            `left:${p.left};top:${p.top};width:${p.width};height:${p.height};` +
            `--fx:${((100 * (haupt.x - b.x)) / (2 * b.r)).toFixed(1)}%;` +
            `--fy:${((100 * (haupt.y - b.y)) / (2 * b.r)).toFixed(1)}%;` +
            `--start:.58;--i:${i}`
        };
      })
  );
  const hauptStil = $derived.by(() => {
    const p = platz(haupt);
    return `left:${p.left};top:${p.top};width:${p.width};height:${p.height};--start:.5`;
  });
  const stil = $derived(`--rb-T:${(1 / tempo).toFixed(4)}`);
</script>

<div
  bind:this={wurzel}
  class="wolke"
  class:laeuft={L.laeuft}
  class:stumm={L.stumm}
  class:ruhig={L.ruhig}
  style={stil}
  role="img"
  aria-label={vorlesetext}
  use:sicht={{ an: L.starten, aktiv: autoplay }}
>
  {#each sortiert as b}
    <div class="blase neben" style={b.stil}>
      <div class="kern"><span>{b.text}</span></div>
    </div>
  {/each}
  <div class="blase haupt" style={hauptStil}>
    <div class="kern"><span>{haupt.text}</span></div>
  </div>
</div>

<style>
  .wolke {
    position: relative; width: 100%; max-width: var(--rb-max, 560px);
    margin-inline: auto; aspect-ratio: 308 / 237;
    container-type: inline-size; font-family: inherit;
  }

  .blase { position: absolute; will-change: transform; transform: translate(var(--fx, 0px), var(--fy, 0px)); }
  .kern {
    width: 100%; height: 100%; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; text-align: center;
    will-change: transform, opacity;
    transform: scale(var(--start, .3)); opacity: 0;
  }
  .blase span {
    display: block; padding: 0 8%; line-height: 1.14; hyphens: auto;
    opacity: 0; transform: scale(.94);
    transition: opacity   380ms var(--rb-e)     calc(var(--spaet) * var(--rb-T)),
                transform 520ms var(--rb-e-pop) calc(var(--spaet) * var(--rb-T));
  }

  /* Hintere Blasen: blenden in der Mitte auf und wandern wachsend nach außen */
  .blase.neben {
    --los: calc((var(--rb-v-blase) + var(--i) * var(--rb-s-blase)) * var(--rb-T));
    --spaet: calc(var(--rb-v-blase) + var(--i) * var(--rb-s-blase) + var(--rb-d-blase) * .62);
    transition: transform calc(var(--rb-d-blase) * var(--rb-T)) var(--rb-e-blase-neben) var(--los);
  }
  .blase.neben span { padding: 0 5%; line-height: 1.1; }
  .blase.neben .kern {
    background: var(--rb-flaeche-10);
    border: 1.6px solid var(--rb-border-70);
    color: var(--rb-text-55);
    font-size: clamp(7px, 2.6cqw, 13px);
    transition: transform calc(var(--rb-d-blase) * var(--rb-T)) var(--rb-e-blase-neben) var(--los),
                opacity   calc(var(--rb-d-blase) * .55 * var(--rb-T)) var(--rb-e-blase-neben) var(--los);
  }

  /* Hauptblase: taucht zuerst auf, Fläche und Schrift kurz nacheinander */
  .blase.haupt { --spaet: calc(var(--rb-v-haupt) + var(--rb-d-haupt) * .5); }
  .blase.haupt .kern {
    background: var(--rb-accent); color: var(--rb-weiss);
    font-weight: 700; font-size: clamp(13px, 5.2cqw, 22px);
    box-shadow: var(--rb-blase-schatten);
    transition: transform calc(var(--rb-d-haupt) * var(--rb-T)) var(--rb-e-blase) calc(var(--rb-v-haupt) * var(--rb-T)),
                opacity   calc(var(--rb-d-haupt) * .6 * var(--rb-T)) var(--rb-e) calc(var(--rb-v-haupt) * var(--rb-T));
  }

  .laeuft .blase { transform: translate(0, 0); }
  .laeuft .kern { transform: scale(1); opacity: 1; }
  .laeuft .blase span { opacity: 1; transform: scale(1); }

  .stumm, .stumm * { transition: none !important; animation: none !important; }
  .ruhig, .ruhig * {
    animation: none !important;
    transition-property: opacity !important;
    transition-duration: 240ms !important;
    transition-delay: 0ms !important;
    transition-timing-function: ease !important;
  }
</style>
