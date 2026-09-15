<!--
  Sonnenuhr — wo im Tag gelesen wurde.

  Der Bogen wird von EINEM Stift in einem Zug gezeichnet; das Gestirn reitet
  auf seiner Spitze, bis es seinen Stand erreicht hat, und bleibt dort stehen,
  während die Linie bis zum Tagesende weiterläuft. Die dafür nötige Teilkurve
  rechnet `teilKurve()` in bogen.js aus.

  <Sonnenuhr tageszeit="abends" gestirn="mond" stand={130.9}
             marken={12} von={0} bis={6} sterne
             scheitel="0 Uhr" links="18 Uhr" rechts="5 Uhr" />
-->
<script>
  import { bogen, bogenLaenge, punkt, winkelFuer, teilKurve, STERNE } from './bogen.js';
  import { lauf } from './lauf.svelte.js';
  import { sicht } from './sicht.js';

  let {
    /** Tageszeit — bestimmt die Himmelsfarben: morgens | mittags | nachmittags | abends | nachts */
    tageszeit = 'morgens',
    /** sonne | mond */
    gestirn = 'sonne',
    /** Stand des Gestirns in Grad: 180 = Aufgang links, 0 = Untergang rechts */
    stand = 131.9,
    /** Anzahl der Stundenmarken auf dem Bogen */
    marken = 14,
    /** Lesefenster als Marken-Index, jeweils einschließlich */
    von = 0,
    bis = 7,
    /** Beschriftung: Scheitel, linkes und rechtes Bogenende */
    scheitel = '12 Uhr',
    links = '5 Uhr',
    rechts = '18 Uhr',
    /** Sternenhimmel zeigen (abends, nachts) */
    sterne = false,
    /** Sternenfeld an der Mittelachse spiegeln (nachts) */
    spiegel = false,
    /** Tempo der Choreografie: 1 = wie im Token, 2 = doppelt so schnell */
    tempo = 1,
    /** Bogenkurve. Muss zu --rb-e-bogen passen; wird hier auch gesetzt. */
    kurve = 'cubic-bezier(.22,1,.36,1)',
    /** Beim Sichtbarwerden von selbst starten */
    autoplay = true,
    /** Vorlesetext; ohne Angabe aus Tageszeit und Lesefenster gebildet */
    beschriftung = null
  } = $props();

  /* Eigene ID für Verläufe, Maske und Beschnitt. $props.id() ist über Server
     und Client hinweg gleich — ein Math.random() würde beim Hydrieren driften. */
  const uid = $props.id();
  const vorlesetext = $derived(beschriftung ?? `Sonnenuhr, ${tageszeit}`);
  const L = lauf();
  let wurzel = $state(null);

  /** Von außen: Animation neu abspielen. */
  export function spielen() { return L.spielen(wurzel); }

  const anteil = $derived((180 - stand) / 180);
  const reise = $derived(teilKurve(kurve, anteil));
  const abends = $derived(tageszeit === 'abends' ? '-abends' : '');

  const laenge = bogenLaenge(180, 0);
  const spur = bogen(180, 0);
  const band = $derived(bogen(winkelFuer(von, marken), winkelFuer(bis, marken)));
  const punkte = $derived(
    Array.from({ length: marken }, (_, i) => {
      const [x, y] = punkt(winkelFuer(i, marken));
      return { x, y, aktiv: i >= von && i <= bis };
    })
  );
  const strahlen = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return { x1: Math.cos(a) * 8, y1: Math.sin(a) * 8, x2: Math.cos(a) * 11, y2: Math.sin(a) * 11 };
  });

  const stil = $derived(
    `--rb-T:${(1 / tempo).toFixed(4)};--rb-e-bogen:${kurve};` +
    `--x:${reise.x.toFixed(5)};--e-reise:${reise.e};` +
    `--len:${laenge.toFixed(2)};--ziel:${(anteil * 100).toFixed(2)}%`
  );
</script>

<svg
  bind:this={wurzel}
  class="uhr"
  class:laeuft={L.laeuft}
  class:stumm={L.stumm}
  class:ruhig={L.ruhig}
  style={stil}
  viewBox="-16 -12 340 220"
  role="img"
  aria-label={vorlesetext}
  use:sicht={{ an: L.starten, aktiv: autoplay }}
>
  <defs>
    <!-- Himmelskuppel -->
    <radialGradient id="{uid}-k">
      <stop offset="0"   style:stop-color="var(--rb-k-{tageszeit})" style:stop-opacity="var(--rb-ka0{abends})" />
      <stop offset=".48" style:stop-color="var(--rb-k-{tageszeit})" style:stop-opacity="var(--rb-ka1{abends})" />
      <stop offset=".78" style:stop-color="var(--rb-k-{tageszeit})" style:stop-opacity="var(--rb-ka2{abends})" />
      <stop offset="1"   style:stop-color="var(--rb-k-{tageszeit})" style:stop-opacity="0" />
    </radialGradient>
    <!-- Horizontdunst -->
    <radialGradient id="{uid}-d">
      <stop offset="0"   style:stop-color="var(--rb-d-{tageszeit})" style:stop-opacity="var(--rb-da0{abends})" />
      <stop offset=".40" style:stop-color="var(--rb-d-{tageszeit})" style:stop-opacity="var(--rb-da1{abends})" />
      <stop offset="1"   style:stop-color="var(--rb-d-{tageszeit})" style:stop-opacity="0" />
    </radialGradient>
    <!-- Rest des Tages: vom Scheitel zum Horizont heller werdend -->
    <linearGradient id="{uid}-t" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--rb-accent)" style:stop-opacity="var(--rb-bogen-rest-0)" />
      <stop offset="1" stop-color="var(--rb-accent)" style:stop-opacity="var(--rb-bogen-rest-1)" />
    </linearGradient>
    <!-- Alles endet am Horizont: sonst stehen die runden Bogenenden darunter -->
    <clipPath id="{uid}-c">
      <rect x="-30" y="-30" width="368" height="194.5" />
    </clipPath>
    <!-- Der Stift legt frei, was hinter ihm liegt -->
    <mask id="{uid}-m" maskUnits="userSpaceOnUse" x="-30" y="-30" width="368" height="260">
      <path class="stift" d={spur} />
    </mask>
  </defs>

  <g clip-path="url(#{uid}-c)">
    <circle class="himmel-schicht" cx="154" cy="164" r="153.7" fill="url(#{uid}-k)" />
    {#if sterne}
      <g>
        {#each STERNE as s, i}
          <circle
            class="stern"
            cx={spiegel ? 308 - s.x : s.x}
            cy={s.y}
            r={s.r}
            fill="var(--rb-stern)"
            style="--i:{i};--o:calc({s.deckung} * var(--rb-stern-op));--p:{s.takt}ms;--fv:{s.versatz}ms;--tief:{s.tiefe}"
          />
        {/each}
      </g>
    {/if}
    <ellipse class="himmel-schicht" cx="154" cy="164" rx="134" ry="65" fill="url(#{uid}-d)" />
  </g>

  <!-- Bogen, Band und Punkte in EINER maskierten Gruppe: durchgehende Pfade, keine Nahtstellen -->
  <g mask="url(#{uid}-m)" clip-path="url(#{uid}-c)">
    <path class="spur" d={spur} stroke="url(#{uid}-t)" />
    <path class="band" d={band} />
    {#each punkte as p}
      <circle class="punkt" class:aktiv={p.aktiv} cx={p.x} cy={p.y} r="2.25" />
    {/each}
  </g>

  <g class="laeufer">
    <g class="hof">
      <circle class="scheibe" r="20" />
      {#if gestirn === 'sonne'}
        <circle class="strahl" r="5" />
        <g class="strahlen">
          {#each strahlen as s}
            <line class="strahl" x1={s.x1.toFixed(2)} y1={s.y1.toFixed(2)} x2={s.x2.toFixed(2)} y2={s.y2.toFixed(2)} />
          {/each}
        </g>
      {:else}
        <path class="mond" d="M 3.1 -8.2 A 8.8 8.8 0 1 0 3.1 8.2 A 11.3 11.3 0 0 1 3.1 -8.2 Z" />
      {/if}
    </g>
  </g>

  <line class="horizont" x1="6" y1="164.5" x2="302" y2="164.5" />
  <text class="achse beschriftung" x="154" y="3.6" text-anchor="middle">{scheitel}</text>
  <text class="achse beschriftung" x="0" y="186.6">{links}</text>
  <text class="achse beschriftung" x="308" y="186.6" text-anchor="end">{rechts}</text>
</svg>

<style>
  .uhr { display: block; width: 100%; max-width: var(--rb-max, 560px); height: auto; margin-inline: auto; font-family: inherit; }

  /* Ankunft des Gestirns: es fährt nur den Teil des Bogens ab, der bis zu
     seinem Stand reicht. --x kommt aus teilKurve(). */
  .uhr { --ankunft: calc((var(--rb-v-bogen) + var(--rb-d-bogen) * var(--x, 1)) * var(--rb-T)); }

  .achse { font-size: 12px; fill: var(--rb-text-55); }

  /* 1 Horizont — von links nach rechts */
  .horizont {
    stroke: var(--rb-border-100); stroke-width: 1;
    transform-box: view-box; transform-origin: 6px 164.5px; transform: scaleX(0);
    transition: transform calc(var(--rb-d-horizont) * var(--rb-T)) var(--rb-e) calc(var(--rb-v-horizont) * var(--rb-T));
  }
  .laeuft .horizont { transform: scaleX(1); }

  /* 2 Himmel — steigt weich über dem Horizont auf */
  .himmel-schicht {
    opacity: 0;
    transform-box: view-box; transform-origin: 154px 164px;
    transform: translateY(16px) scaleY(.86);
    transition: opacity   calc(var(--rb-d-himmel) * var(--rb-T))        var(--rb-e)       calc(var(--rb-v-himmel) * var(--rb-T)),
                transform calc(var(--rb-d-himmel) * 1.25 * var(--rb-T)) var(--rb-e-bogen) calc(var(--rb-v-himmel) * var(--rb-T));
  }
  .laeuft .himmel-schicht { opacity: 1; transform: translateY(0) scaleY(1); }

  .stern {
    transform-box: fill-box; transform-origin: center; transform: scale(0); opacity: 0;
    --aufgang: calc((var(--rb-v-himmel) + 240ms + var(--i) * 30ms) * var(--rb-T));
    transition: transform 520ms var(--rb-e-pop) var(--aufgang),
                opacity   420ms var(--rb-e)     var(--aufgang);
  }
  .laeuft .stern { transform: scale(1); opacity: var(--o); }
  /* Funkeln — beginnt erst, wenn der Stern oben ist; Takt und Versatz je Stern */
  @keyframes funkeln {
    0%, 100% { opacity: var(--o); transform: scale(1); }
    50%      { opacity: calc(var(--o) * var(--tief, .3)); transform: scale(.78); }
  }
  .laeuft .stern {
    animation: funkeln calc(var(--p, 3600ms) * var(--rb-T)) ease-in-out
               calc(var(--aufgang) + 520ms * var(--rb-T) + var(--fv, 0ms) * var(--rb-T)) infinite;
  }

  /* 3 Der Stift — zeichnet den ganzen Bogen in einem Zug.
     Die Länge steht als --len fest (aus dem Winkel gerechnet); getTotalLength()
     misst an Pfaden in <defs> unzuverlässig. */
  .stift {
    fill: none; stroke: #fff; stroke-width: 26; stroke-linecap: butt;
    filter: blur(2.5px); will-change: stroke-dashoffset;
    stroke-dasharray: var(--len); stroke-dashoffset: var(--len);
    transition: stroke-dashoffset calc(var(--rb-d-bogen) * var(--rb-T)) var(--rb-e-bogen) calc(var(--rb-v-bogen) * var(--rb-T));
  }
  .laeuft .stift { stroke-dashoffset: 0; }

  .spur, .band {
    fill: none; stroke-width: 14; stroke-linecap: round; shape-rendering: geometricPrecision;
    opacity: 0;
    transition: opacity calc(var(--rb-d-himmel) * .7 * var(--rb-T)) var(--rb-e) calc((var(--rb-v-bogen) - 200ms) * var(--rb-T));
  }
  .band { stroke: var(--rb-accent); }
  .laeuft .spur, .laeuft .band { opacity: 1; }

  .punkt { fill: var(--rb-text-40); shape-rendering: geometricPrecision; }
  .punkt.aktiv { fill: var(--rb-weiss); fill-opacity: .6; }

  /* 4 Gestirn — hängt am Stift: derselbe Kurvenabschnitt, nur früher zu Ende */
  .laeufer {
    offset-path: path('M 13 164 A 141 141 0 0 1 295 164');
    offset-rotate: 0deg; offset-distance: 0%;
    will-change: offset-distance;
    transition: offset-distance calc(var(--rb-d-bogen) * var(--x, 1) * var(--rb-T))
                var(--e-reise, var(--rb-e-bogen)) calc(var(--rb-v-bogen) * var(--rb-T));
  }
  .laeuft .laeufer { offset-distance: var(--ziel); }

  .hof {
    opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.4);
    transition: opacity   calc(var(--rb-d-bogen) * .18 * var(--rb-T)) var(--rb-e)     calc(var(--rb-v-bogen) * var(--rb-T)),
                transform calc(var(--rb-d-bogen) * .28 * var(--rb-T)) var(--rb-e-pop) calc(var(--rb-v-bogen) * var(--rb-T));
  }
  .laeuft .hof { opacity: 1; transform: scale(1); }

  .scheibe { fill: var(--rb-accent); }
  .strahl { fill: none; stroke: var(--rb-weiss); stroke-width: 2; stroke-linecap: round; }
  .mond { fill: var(--rb-weiss); }
  .strahlen { transform-box: fill-box; transform-origin: center; }
  @keyframes drehen { to { transform: rotate(90deg); } }
  .laeuft .strahlen {
    animation: drehen calc(var(--rb-d-bogen) * var(--x, 1) * var(--rb-T))
               var(--e-reise, var(--rb-e-bogen)) calc(var(--rb-v-bogen) * var(--rb-T)) 1 both;
  }

  /* 5 Beschriftung — nach der Ankunft */
  .beschriftung {
    opacity: 0; transform: translateY(4px);
    transition: opacity   calc(var(--rb-d-label) * var(--rb-T)) var(--rb-e) calc(var(--ankunft) + var(--rb-v-label) * var(--rb-T)),
                transform calc(var(--rb-d-label) * var(--rb-T)) var(--rb-e) calc(var(--ankunft) + var(--rb-v-label) * var(--rb-T));
  }
  .laeuft .beschriftung { opacity: 1; transform: translateY(0); }

  /* Neustart: alles auf einen Schlag zurück, ohne Rückwärts-Übergang */
  .stumm, .stumm * { transition: none !important; animation: none !important; }

  /* Bewegung reduzieren: nichts bewegt sich, alles blendet nur auf */
  .ruhig, .ruhig * {
    animation: none !important;
    transition-property: opacity !important;
    transition-duration: 240ms !important;
    transition-delay: 0ms !important;
    transition-timing-function: ease !important;
  }
</style>
