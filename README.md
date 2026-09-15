# Rückblick-Diagramme · Svelte-Komponenten Prototyp

Drei Diagramme aus dem Onboarding-Rückblick, als eigenständige Svelte-5-Komponenten:

| Komponente        | Zeigt                                              |
|-------------------|----------------------------------------------------|
| `Sonnenuhr`       | Zu welcher Tageszeit gelesen wurde                  |
| `Zehntel`         | Wie viel gelesen wurde, im Vergleich zu allen       |
| `Themencluster`   | Welche Themen gelesen wurden                        |

Maße, Farben und Bewegung stammen aus der Figma-Vorlage
`Rückblick / Grafik Sonnenuhr` (`294:30264`, File `qXVl1snFCVHRxboNKQ5FLp`).

## Stand

Geprüft gegen **Svelte 5.56.8**: alle drei Komponenten kompilieren für Client und
Server ohne Warnungen. Mindestversion ist **Svelte 5.20** — `$props.id()` (für die
SSR-feste Vergabe der SVG-Verlaufs-IDs) gibt es erst ab dort.

## Einbau

```
src/lib/rueckblick/        ← diesen Ordner übernehmen
```

Einmal global, z. B. in `+layout.svelte`:

```js
import '$lib/rueckblick/rueckblick.css';
```

Dann:

```svelte
<script>
  import { Sonnenuhr, Zehntel, Themencluster } from '$lib/rueckblick';
</script>

<Sonnenuhr tageszeit="abends" gestirn="mond" stand={130.9}
           marken={12} von={0} bis={6} sterne
           scheitel="0 Uhr" links="18 Uhr" rechts="5 Uhr" />

<Zehntel sie={9} />

<Themencluster haupt={{ x: 159.3, y: 111.3, r: 77, text: 'Innenpolitik Deutschland' }}
               neben={[ /* … */ ]} />
```

Es gibt keine Abhängigkeiten außer Svelte selbst. Alles ist reines CSS und SVG;
zur Laufzeit rechnet nur die Sonnenuhr (eine Bézier-Teilung, siehe unten).

## Farben

`rueckblick.css` ist die **einzige** Stelle, an der die Komponenten am
Farbsystem hängen. Jeder Wert liegt als `var(--z-ds-color-…, <Rückfall>)` vor,
die ZDS-Custom-Properties gewinnen also, wo sie vorhanden sind. Hell und Dunkel
schalten über dieselben Selektoren wie im ZDS — `prefers-color-scheme` mit
`html:not(.color-scheme-light)` sowie `html.color-scheme-dark`; zusätzlich wird
`[data-theme="light|dark"]` erkannt.

Zwei Rollen zeigen im Dunkelmodus bewusst auf eine andere ZDS-Stufe:

* `--rb-flaeche` ist der **Kartengrund**: hell `background-0` (`#ffffff`),
  dunkel `background-10` (`#232323`). Im Dunkelmodus ist `background-0`
  (`#121212`) der Seitengrund, nicht die Karte.
* `--rb-flaeche-10` ist die Fläche **in** der Karte: hell `background-10`,
  dunkel `background-20`.

Was das ZDS nicht hat — die fünf Himmelspaletten, Sternfarbe, Balkengrau,
Blasenschatten — steht als eigener Wert daneben; die Werte kommen aus der
lokalen Figma-Kollektion `Rückblick / Farben`.

## Bewegung

Alle Dauern, Verzögerungen und Kurven sind Tokens (`--rb-d-*`, `--rb-v-*`,
`--rb-e-*`) und lassen sich global in `rueckblick.css` verstellen. Je Instanz
geht es über `tempo`:

```svelte
<Sonnenuhr tempo={1.6} />   <!-- 1 = wie im Token, größer = schneller -->
```

**Start:** Die Diagramme starten von selbst, sobald sie zu 35 % im Bild sind
(`sicht`-Action, feuert genau einmal). Mit `autoplay={false}` übernimmt das die
Anwendung; jede Komponente stellt dafür `spielen()` bereit:

```svelte
<script>let uhr;</script>
<Sonnenuhr bind:this={uhr} autoplay={false} />
<button onclick={() => uhr.spielen()}>Abspielen</button>
```

**Bewegung reduzieren:** folgt `prefers-reduced-motion` von selbst. Dann bewegt
sich nichts mehr, alles blendet nur noch auf. Übersteuern:

```js
import { bewegung } from '$lib/rueckblick';
bewegung.ruhig = true;
```

## Breite

Jede Komponente ist fließend und deckelt bei 560 px, zentriert in ihrem
Elternelement. Der Deckel hängt an `--rb-max` und lässt sich je Stelle ändern:

```svelte
<Zehntel --rb-max="420px" />
```

## Zwei Dinge, die im Code nicht offensichtlich sind

**Sonnenuhr — warum das Gestirn eine eigene Kurve bekommt.** Der Bogen wird von
*einem* Stift in einem Zug gezeichnet (eine Maske mit einem Pfad, dessen
`stroke-dashoffset` läuft). Das Gestirn soll auf der Stiftspitze sitzen, aber
bei seinem Stand anhalten. Dieselbe Kurve mit kürzerer Dauer genügt dafür
nicht — dann läuft es dem Stift davon. `teilKurve()` teilt die Bogenkurve
deshalb per de Casteljau an genau der Stelle, an der der Anteil erreicht ist,
und normiert den linken Abschnitt wieder auf 0…1. Das ist exakt, nicht genähert
(geprüft über alle fünf Tageszeiten: Abweichung unter 6·10⁻⁵ Bogenanteil).
Die Dauer des Gestirns ist `--rb-d-bogen × --x`, beides setzt die Komponente
selbst. Wer `--rb-e-bogen` global ändert, muss die `kurve`-Eigenschaft
mitändern, sonst driften Stift und Gestirn auseinander.

Die Bogenlänge für `stroke-dasharray` wird aus dem Winkel gerechnet, nicht mit
`getTotalLength()` gemessen: an Pfaden in `<defs>` liefert das unzuverlässige
Werte, und aus einer zu kurzen `dasharray` wird ein Streifenmuster statt einer
durchgehenden Linie.

**Themencluster — warum es zwei Ebenen gibt.** `.blase` trägt den Weg,
`.kern` die Größe. In einer einzigen `transform`-Eigenschaft müssten sich Weg
und Größe denselben Verlauf teilen; das Wachsen ließe sich dann nicht gegenüber
dem Weg verschieben, ohne mit zwei Keyframe-Abschnitten einen sichtbaren Knick
in der Geschwindigkeit zu erzeugen.

**Neustart.** `spielen()` schaltet über die Klasse `stumm` erst alle Übergänge
ab, setzt zurück, erzwingt die Übernahme und schaltet dann wieder an. Ohne das
laufen die Eigenschaften rückwärts — und weil fast jede eine Verzögerung trägt,
stehen sie im nächsten Bild noch auf dem Endwert; der Vorwärts-Übergang hätte
dann Start- und Zielwert gleich und bewegte nichts.

## Svelte-Version

Geschrieben für **Svelte 5** (Runen: `$props`, `$state`, `$derived`).
Für Svelte 4 sind pro Komponente drei Stellen zu ändern: `$props()` →
`export let`, `$derived(x)` → `$: y = x`, `$state()` entfällt; `bewegung`
wird zu einem `writable`-Store.

## Schrift

Die Komponenten erben die Schrift ihres Elternelements (`font-family: inherit`).
Im Rückblick ist das Tablet Gothic; die Diagramme setzen selbst keine Familie.

## Herkunft

Die Diagramme stammen aus dem Animations-Prototyp des Onboarding-Rückblicks.
Maße und Farben sind gegen die Figma-Vorlagen vermessen:

* `Rückblick / Grafik Sonnenuhr` — `294:30264`
* `Rückblick / Platz im Vergleich` — `262:29914`

beide im File `qXVl1snFCVHRxboNKQ5FLp`.

## Offen

* Das Band im `Zehntel`-Diagramm hat in Figma drei waagerechte Rasterlinien
  (1,5 stark, 130,8 / 86,9 / 42,9 über der Grundlinie). Sie fehlen hier noch.
