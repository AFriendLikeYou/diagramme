<!-- Beispielseite: alle drei Diagramme mit ihren Varianten und einem Neu-Knopf. -->
<script>
  import { Sonnenuhr, Zehntel, Themencluster, TAGESZEITEN, ZEHNTEL, CLUSTER, bewegung } from '$lib/rueckblick';

  let uhr = $state(0), zehntel = $state(0), cluster = $state(0);
  let uhrRef, zehntelRef, clusterRef;

  const z = $derived(TAGESZEITEN[uhr]);
</script>

<section>
  <nav>
    {#each TAGESZEITEN as t, i}
      <button aria-pressed={i === uhr} onclick={() => (uhr = i)}>{t.titel}</button>
    {/each}
    <button class="neu" onclick={() => uhrRef?.spielen()}>Neu</button>
  </nav>
  {#key uhr}
    <Sonnenuhr bind:this={uhrRef}
      tageszeit={z.id} gestirn={z.gestirn} stand={z.stand} marken={z.marken}
      von={z.von} bis={z.bis} scheitel={z.scheitel} links={z.links} rechts={z.rechts}
      sterne={!!z.sterne} spiegel={!!z.spiegel} />
  {/key}
</section>

<section>
  <nav>
    {#each ZEHNTEL as v, i}
      <button aria-pressed={i === zehntel} onclick={() => (zehntel = i)}>{v.titel}</button>
    {/each}
    <button class="neu" onclick={() => zehntelRef?.spielen()}>Neu</button>
  </nav>
  {#key zehntel}
    <Zehntel bind:this={zehntelRef} sie={ZEHNTEL[zehntel].sie} dunkel={ZEHNTEL[zehntel].dunkel} />
  {/key}
</section>

<section>
  <nav>
    {#each CLUSTER as c, i}
      <button aria-pressed={i === cluster} onclick={() => (cluster = i)}>{c.titel}</button>
    {/each}
    <button class="neu" onclick={() => clusterRef?.spielen()}>Neu</button>
  </nav>
  {#key cluster}
    <Themencluster bind:this={clusterRef} haupt={CLUSTER[cluster].haupt} neben={CLUSTER[cluster].neben} />
  {/key}
</section>

<label>
  <input type="checkbox" bind:checked={bewegung.ruhig} />
  Bewegung reduzieren
</label>

<style>
  section { display: flex; flex-direction: column; gap: 16px; margin: 0 auto 72px; max-width: 560px; }
  nav { display: flex; flex-wrap: wrap; gap: 6px; }
  button {
    font: inherit; font-size: 13px; padding: 5px 11px; cursor: pointer;
    background: var(--rb-flaeche); color: var(--rb-text-70);
    border: 1px solid var(--rb-border-100); border-radius: 999px;
  }
  button[aria-pressed='true'] { background: var(--rb-text-100); color: var(--rb-flaeche); border-color: var(--rb-text-100); }
  .neu { margin-left: auto; }
  label { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--rb-text-70); }
</style>
