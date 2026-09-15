/* Beispieldaten — die fünf Varianten aus der Figma-Vorlage
   `Rückblick / Grafik Sonnenuhr` und die Gegenstücke der beiden
   anderen Diagramme. Als Vorlage gedacht, nicht als Pflichtform. */

export const TAGESZEITEN = [
  { id: 'morgens',     titel: 'Morgens',     fenster: '5 – 12 Uhr',  gestirn: 'sonne', marken: 14,
    scheitel: '12 Uhr', links: '5 Uhr',  rechts: '18 Uhr', von: 0,  bis: 7,  stand: 131.9 },
  { id: 'mittags',     titel: 'Mittags',     fenster: '12 – 15 Uhr', gestirn: 'sonne', marken: 14,
    scheitel: '12 Uhr', links: '5 Uhr',  rechts: '18 Uhr', von: 7,  bis: 10, stand: 62.3 },
  { id: 'nachmittags', titel: 'Nachmittags', fenster: '15 – 18 Uhr', gestirn: 'sonne', marken: 14,
    scheitel: '12 Uhr', links: '5 Uhr',  rechts: '18 Uhr', von: 10, bis: 13, stand: 20.8 },
  { id: 'abends',      titel: 'Abends',      fenster: '18 – 24 Uhr', gestirn: 'mond',  marken: 12,
    scheitel: '0 Uhr',  links: '18 Uhr', rechts: '5 Uhr',  von: 0,  bis: 6,  stand: 130.9, sterne: true },
  { id: 'nachts',      titel: 'Nachts',      fenster: '0 – 5 Uhr',   gestirn: 'mond',  marken: 12,
    scheitel: '0 Uhr',  links: '18 Uhr', rechts: '5 Uhr',  von: 6,  bis: 11, stand: 40.9, sterne: true, spiegel: true }
];

export const ZEHNTEL = [
  { titel: 'Oberstes Zehntel', sie: 9, dunkel: false },
  { titel: 'Zweitoberstes',    sie: 8, dunkel: false },
  { titel: 'Drittes von oben', sie: 7, dunkel: true  },
  { titel: 'Mitte',            sie: 5, dunkel: true  }
];

export const CLUSTER = [
  { titel: 'Standard',
    haupt: { x: 159.3, y: 111.3, r: 77, text: 'Innenpolitik Deutschland' },
    neben: [
      { x: 55.6,  y: 68.2,  r: 35.3, text: 'Familie, Erziehung' },
      { x: 251.0, y: 46.4,  r: 35.3, text: 'Digitalisierung und KI' },
      { x: 61.3,  y: 166.0, r: 35.3, text: 'Geschichte' },
      { x: 210.7, y: 200.2, r: 25.7, text: 'Wirtschafts­politik' },
      { x: 262.0, y: 111.3, r: 25.7, text: 'Persönlich­keiten' }
    ] },
  { titel: 'Langer Name',
    haupt: { x: 151.0, y: 101.2, r: 77, text: 'Digitalisierung, Medientrends und soziale Netzwerke' },
    neben: [
      { x: 51.6,  y: 49.0,  r: 35.3, text: 'Innenpolitik Deutschland' },
      { x: 46.2,  y: 141.5, r: 35.3, text: 'Geschichte' },
      { x: 261.8, y: 82.6,  r: 35.3, text: 'Gesundheit und Psychologie' },
      { x: 186.2, y: 197.7, r: 25.7, text: 'Wirtschafts­politik' },
      { x: 88.3,  y: 185.2, r: 25.7, text: 'Persönlich­keiten' }
    ] },
  { titel: 'Seltenes Thema',
    haupt: { x: 151.0, y: 101.2, r: 77, text: 'Familie, Erziehung, Geburt' },
    neben: [
      { x: 51.6,  y: 49.0,  r: 35.3, text: 'Innenpolitik Deutschland' },
      { x: 46.2,  y: 141.5, r: 35.3, text: 'Geschichte' },
      { x: 261.8, y: 82.6,  r: 35.3, text: 'Digitalisierung und KI' },
      { x: 186.2, y: 197.7, r: 25.7, text: 'Wirtschafts­politik' },
      { x: 88.3,  y: 185.2, r: 25.7, text: 'Persönlich­keiten' }
    ] }
];
