/**
 * Build script: merges okres polygons into sales territories by PSČ zones,
 * fetches SK kraje from Eurostat, outputs public/territories.json.
 *
 * Run: node scripts/build-territories.mjs
 */
import fs from 'fs';
import * as turf from '@turf/turf';

const okresy = JSON.parse(fs.readFileSync('geodata-src/okresy.json', 'utf8'));

// ── Territory definition by okres (derived from the physical PSČ map) ──
const TERRITORIES = {
  david: {
    name: 'Severní a střední Čechy',
    reps: ['david'],
    psc: '27, 29, 35–36, 40–47, 50–51, 54–55',
    okresy: [
      'Cheb', 'Sokolov', 'Karlovy Vary',
      'Děčín', 'Ústí nad Labem', 'Teplice', 'Litoměřice', 'Chomutov', 'Most', 'Louny',
      'Česká Lípa', 'Liberec', 'Jablonec nad Nisou', 'Semily',
      'Hradec Králové', 'Jičín', 'Náchod', 'Trutnov',
      'Mladá Boleslav', 'Kladno', 'Mělník', 'Rakovník',
    ],
  },
  kolar: {
    name: 'Západní a jižní Čechy',
    reps: ['kolar'],
    psc: '25–26, 28, 30–34, 37–39',
    okresy: [
      'Plzeň-město', 'Plzeň-jih', 'Plzeň-sever', 'Rokycany', 'Tachov', 'Domažlice', 'Klatovy',
      'České Budějovice', 'Český Krumlov', 'Jindřichův Hradec', 'Písek', 'Prachatice', 'Strakonice', 'Tábor',
      'Pelhřimov',
      'Beroun', 'Příbram', 'Benešov', 'Praha-východ', 'Praha-západ',
      'Kolín', 'Kutná Hora', 'Nymburk',
    ],
  },
  praha: {
    name: 'Praha',
    reps: ['kolar', 'david'],
    psc: '1xx',
    okresy: ['Hlavní město Praha'],
  },
  prochazka: {
    name: 'Morava a východní Čechy',
    reps: ['prochazka'],
    psc: '517, 56–57, 60–66, 68–69, 75–77, 796–798',
    okresy: [
      'Rychnov nad Kněžnou', 'Ústí nad Orlicí', 'Svitavy',
      'Brno-město', 'Brno-venkov', 'Blansko', 'Vyškov', 'Břeclav', 'Hodonín',
      'Olomouc', 'Prostějov', 'Přerov', 'Vsetín',
      'Zlín', 'Kroměříž', 'Uherské Hradiště',
    ],
  },
  dobrovolny: {
    name: 'Vysočina a Pardubicko',
    reps: ['dobrovolny'],
    psc: '53, 58–59, 67 (Třebíčsko a Znojemsko)',
    okresy: [
      'Pardubice', 'Chrudim',
      'Havlíčkův Brod', 'Jihlava', 'Třebíč', 'Žďár nad Sázavou',
      'Znojmo',
    ],
  },
  tosenovjan: {
    name: 'Severní Morava a Slezsko',
    reps: ['tosenovjan'],
    psc: '70–74, 78, 790–795',
    okresy: [
      'Šumperk', 'Jeseník', 'Bruntál',
      'Ostrava-město', 'Karviná', 'Frýdek-Místek', 'Nový Jičín', 'Opava',
    ],
  },
};

// ── Validation: every okres used exactly once ──
const used = Object.values(TERRITORIES).flatMap((t) => t.okresy);
const all = okresy.features.map((f) => f.name);
const missing = all.filter((n) => !used.includes(n));
const unknown = used.filter((n) => !all.includes(n));
const dupes = used.filter((n, i) => used.indexOf(n) !== i);
if (missing.length || unknown.length || dupes.length) {
  console.error('MISSING:', missing, '\nUNKNOWN:', unknown, '\nDUPES:', dupes);
  process.exit(1);
}
console.log(`✓ All ${all.length} okresy assigned exactly once`);

// ── Merge okresy per territory ──
function dissolve(features) {
  if (features.length === 1) return features[0];
  return turf.union(turf.featureCollection(features));
}

const outFeatures = [];

for (const [id, t] of Object.entries(TERRITORIES)) {
  if (id === 'praha') continue; // Praha se dělí zvlášť (viz níže)
  const feats = okresy.features
    .filter((f) => t.okresy.includes(f.name))
    .map((f) => turf.feature(f.geometry));
  console.log(`Merging ${id}: ${feats.length} okresů…`);
  let merged = dissolve(feats);
  // Jemnější zjednodušení → věrnější obrys (např. výběžek u Aše na západě)
  merged = turf.simplify(merged, { tolerance: 0.0005, highQuality: true });
  turf.truncate(merged, { precision: 5, coordinates: 2, mutate: true });
  outFeatures.push({
    type: 'Feature',
    properties: { id, name: t.name, reps: t.reps, psc: t.psc, country: 'CZ' },
    geometry: merged.geometry,
  });
}

// ── Praha rozdělena na sever (David) a jih (Kolář) ──
{
  const prahaSrc = okresy.features.find((f) => f.name === 'Hlavní město Praha');
  const prahaGeom = turf.feature(prahaSrc.geometry);
  const pb = turf.bbox(prahaGeom); // [minX, minY, maxX, maxY]
  const midY = (pb[1] + pb[3]) / 2;
  const pad = 0.05;
  const northBox = turf.bboxPolygon([pb[0] - pad, midY, pb[2] + pad, pb[3] + pad]);
  const southBox = turf.bboxPolygon([pb[0] - pad, pb[1] - pad, pb[2] + pad, midY]);
  const north = turf.intersect(turf.featureCollection([prahaGeom, northBox]));
  const south = turf.intersect(turf.featureCollection([prahaGeom, southBox]));
  turf.truncate(north, { precision: 5, coordinates: 2, mutate: true });
  turf.truncate(south, { precision: 5, coordinates: 2, mutate: true });
  console.log('Splitting Praha → sever (david) + jih (kolar)…');
  outFeatures.push({
    type: 'Feature',
    properties: { id: 'praha-sever', name: 'Praha (sever)', reps: ['david'], psc: '1xx — severní část', country: 'CZ' },
    geometry: north.geometry,
  });
  outFeatures.push({
    type: 'Feature',
    properties: { id: 'praha-jih', name: 'Praha (jih)', reps: ['kolar'], psc: '1xx — jižní část', country: 'CZ' },
    geometry: south.geometry,
  });
}

// ── Slovakia: NUTS3 kraje from Eurostat ──
console.log('Fetching SK kraje from Eurostat…');
const EUROSTAT_URL =
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_01M_2021_4326_LEVL_3.geojson';
const res = await fetch(EUROSTAT_URL);
if (!res.ok) throw new Error(`Eurostat ${res.status}`);
const eurostat = await res.json();

const SK_GROUPS = {
  zilinka: {
    name: 'Západné Slovensko',
    reps: ['zilinka'],
    psc: 'SK: západ',
    nuts: ['SK010', 'SK021', 'SK022', 'SK023'],
  },
  kaizer: {
    name: 'Stredné a východné Slovensko',
    reps: ['kaizer'],
    psc: 'SK: stred + východ',
    nuts: ['SK031', 'SK032', 'SK041', 'SK042'],
  },
};

for (const [id, g] of Object.entries(SK_GROUPS)) {
  const feats = eurostat.features
    .filter((f) => g.nuts.includes(f.properties.NUTS_ID))
    .map((f) => turf.feature(f.geometry));
  if (feats.length !== g.nuts.length) throw new Error(`SK group ${id}: expected ${g.nuts.length}, got ${feats.length}`);
  console.log(`Merging ${id}: ${feats.length} krajov…`);
  let merged = dissolve(feats);
  merged = turf.simplify(merged, { tolerance: 0.0015, highQuality: true });
  turf.truncate(merged, { precision: 5, coordinates: 2, mutate: true });
  outFeatures.push({
    type: 'Feature',
    properties: { id, name: g.name, reps: g.reps, psc: g.psc, country: 'SK' },
    geometry: merged.geometry,
  });
}

const out = { type: 'FeatureCollection', features: outFeatures };
fs.writeFileSync('public/territories.json', JSON.stringify(out));
const kb = Math.round(fs.statSync('public/territories.json').size / 1024);
console.log(`✓ public/territories.json written (${kb} KB, ${outFeatures.length} territories)`);
