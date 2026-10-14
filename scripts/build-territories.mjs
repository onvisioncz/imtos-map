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
      'Beroun', 'Příbram', 'Benešov',
      'Kolín', 'Kutná Hora', 'Nymburk',
    ],
  },
  praha: {
    // Celá pražská aglomerace — rozdělí se vodorovně (sever David, jih Kolář)
    name: 'Praha',
    reps: ['kolar', 'david'],
    psc: '1xx',
    okresy: ['Hlavní město Praha', 'Praha-západ', 'Praha-východ'],
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

// Ponechá jen vnější prstence (zahodí díry/slivery z union dvou datasetů)
function stripHoles(geom) {
  if (geom.type === 'Polygon') {
    return { type: 'Polygon', coordinates: [geom.coordinates[0]] };
  }
  if (geom.type === 'MultiPolygon') {
    // Zahodí drobné slivery (plošky < práh) a u zbylých nechá jen vnější prstenec
    const parts = geom.coordinates
      .map((poly) => [poly[0]])
      .filter((poly) => Math.abs(ringArea(poly[0])) > 1e-6);
    return { type: 'MultiPolygon', coordinates: parts.length ? parts : geom.coordinates.map((p) => [p[0]]) };
  }
  return geom;
}

// Hrubá plocha prstence (shoelace, ve stupních² — jen pro relativní porovnání)
function ringArea(ring) {
  let a = 0;
  for (let i = 0, n = ring.length; i < n - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return a / 2;
}

const outFeatures = [];

for (const [id, t] of Object.entries(TERRITORIES)) {
  if (id === 'praha') continue; // Praha se dělí zvlášť (viz níže)
  const feats = okresy.features
    // Šumperk se dělí zvlášť (jih → Procházka), tady ho vynecháme
    .filter((f) => t.okresy.includes(f.name) && f.name !== 'Šumperk')
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

// ── Pražská aglomerace (Praha + Praha-západ + Praha-východ) ──
// Vodorovný řez na úrovni středu hl. m. Prahy: sever → David, jih → Kolář.
{
  const aggNames = ['Hlavní město Praha', 'Praha-západ', 'Praha-východ'];
  const aggFeats = okresy.features
    .filter((f) => aggNames.includes(f.name))
    .map((f) => turf.feature(f.geometry));
  let agg = dissolve(aggFeats);
  agg = turf.simplify(agg, { tolerance: 0.0005, highQuality: true });

  // Dělicí zeměpisná šířka = střed hl. m. Prahy
  const cityGeom = turf.feature(
    okresy.features.find((f) => f.name === 'Hlavní město Praha').geometry
  );
  const splitLat = turf.centroid(cityGeom).geometry.coordinates[1];

  const ab = turf.bbox(agg);
  const pad = 0.1;
  const northBox = turf.bboxPolygon([ab[0] - pad, splitLat, ab[2] + pad, ab[3] + pad]);
  const southBox = turf.bboxPolygon([ab[0] - pad, ab[1] - pad, ab[2] + pad, splitLat]);
  const north = turf.intersect(turf.featureCollection([agg, northBox]));
  const south = turf.intersect(turf.featureCollection([agg, southBox]));
  turf.truncate(north, { precision: 5, coordinates: 2, mutate: true });
  turf.truncate(south, { precision: 5, coordinates: 2, mutate: true });
  console.log('Splitting Praha agglomeration → sever (david) + jih (kolar)…');
  outFeatures.push({
    type: 'Feature',
    properties: { id: 'praha-sever', name: 'Praha (sever)', reps: ['david'], psc: '1xx sever + Praha-východ', country: 'CZ' },
    geometry: north.geometry,
  });
  outFeatures.push({
    type: 'Feature',
    properties: { id: 'praha-jih', name: 'Praha (jih)', reps: ['kolar'], psc: '1xx jih + Praha-západ', country: 'CZ' },
    geometry: south.geometry,
  });
}

// ── Šumperk rozdělen po hranicích OBCÍ: jih (Mohelnicko, Zábřežsko) → Procházka, sever → Tošenovjan ──
// Vybíráme celé obce → hranice vede po reálných hranicích obcí (přirozeně zakřivená, jediná).
{
  const obce = JSON.parse(fs.readFileSync('geodata-src/obce.json', 'utf8'));
  const sumperkPoly = turf.feature(
    okresy.features.find((f) => f.name === 'Šumperk').geometry
  );

  const SPLIT_LAT = 49.93; // Zábřeh 49.88 / Mohelnice 49.78 jih; Šumperk 49.97 sever
  const southObce = [];
  const northObce = [];
  for (const o of obce.features) {
    let c;
    try {
      c = turf.centroid(turf.feature(o.geometry));
    } catch (e) {
      continue;
    }
    if (!turf.booleanPointInPolygon(c, sumperkPoly)) continue;
    const lat = c.geometry.coordinates[1];
    (lat < SPLIT_LAT ? southObce : northObce).push(turf.feature(o.geometry));
  }
  console.log(`Šumperk: ${southObce.length} obcí jih (Procházka), ${northObce.length} obcí sever (Tošenovjan)`);

  const southMerged = dissolve(southObce);
  const northMerged = dissolve(northObce);

  const tosFeature = outFeatures.find((f) => f.properties.id === 'tosenovjan');
  const proFeature = outFeatures.find((f) => f.properties.id === 'prochazka');

  let tosGeom = turf.union(turf.featureCollection([turf.feature(tosFeature.geometry), northMerged]));
  let proGeom = turf.union(turf.featureCollection([turf.feature(proFeature.geometry), southMerged]));
  // Union obcí + okresů vytváří tisíce drobných děr (slivery) kvůli mírně odlišným
  // hranicím datasetů. Území nemají legitimní díry → ponecháme jen vnější obrysy.
  tosGeom = turf.feature(stripHoles(tosGeom.geometry));
  proGeom = turf.feature(stripHoles(proGeom.geometry));
  tosGeom = turf.simplify(tosGeom, { tolerance: 0.0006, highQuality: true });
  proGeom = turf.simplify(proGeom, { tolerance: 0.0006, highQuality: true });
  turf.truncate(tosGeom, { precision: 5, coordinates: 2, mutate: true });
  turf.truncate(proGeom, { precision: 5, coordinates: 2, mutate: true });
  tosFeature.geometry = tosGeom.geometry;
  proFeature.geometry = proGeom.geometry;
}

// ── Slovensko po OKRESECH (dle mapy od Petra Teverného) ──
// Žilinka = Bratislavský + Trnavský + Trenčiansky BEZ Prievidze + Žilinský BEZ Turč. Teplic + okres Topoľčany
// Kaizer  = všechny ostatní okresy (Nitriansky BEZ Topoľčan, Prievidza, Turčianske Teplice, BB, PO, KE)
const SK_GROUPS = {
  zilinka: {
    name: 'Západné a severozápadné Slovensko',
    reps: ['zilinka'],
    psc: 'SK: BA, TT, TN (bez Prievidze), ZA (bez Turč. Teplic) + Topoľčany',
  },
  kaizer: {
    name: 'Stredné a východné Slovensko',
    reps: ['kaizer'],
    psc: 'SK: NR (bez Topoľčan), Prievidza, Turč. Teplice, BB, PO, KE',
  },
};

// Žilinkovy okresy — přesně tak, jak jsou zapsané v geoBoundaries (bez „District of",
// s poškozenou diakritikou ze zdroje: Pilina = Žilina, Prchov = Púchov, Gala = Šaľa…)
const ZILINKA_DISTRICTS = [
  // Bratislavský kraj
  'Bratislava I', 'Bratislava II', 'Bratislava III', 'Bratislava IV', 'Bratislava V',
  'Malacky', 'Pezinok', 'Senec',
  // Trnavský kraj
  'Dunajskn Streda', 'Galanta', 'Hlohovec', 'Piertany', 'Senica', 'Skalica', 'Trnava',
  // Trenčiansky kraj (bez Prievidze)
  'Bonovce nad Bebra*', 'Ilava', 'Myjava', 'Nova Mesto nad Va*', 'Partizonske',
  'Povacskn Bystrica', 'Prchov', 'Trencon',
  // Žilinský kraj (bez Turčianskych Teplíc)
  'Bytca', 'Cadca', 'Dolne Kub', 'Kysucki Novi Mesto', 'Liptovsk', 'Martin',
  'Numestovo', 'Ruromberok', 'Tvrdo', 'Pilina',
  // Nitriansky kraj — jen Topoľčany
  'Topolcany',
];

const skDistricts = JSON.parse(
  fs.readFileSync('geodata-src/sk/geoBoundaries-SVK-ADM2.geojson', 'utf8')
).features;
const skNames = skDistricts.map((d) => d.properties.shapeName.replace(/^District of /, ''));
const unknownSk = ZILINKA_DISTRICTS.filter((n) => !skNames.includes(n));
if (unknownSk.length) throw new Error(`Neznámé SK okresy: ${unknownSk.join(', ')}`);

const skBuckets = { zilinka: [], kaizer: [] };
skDistricts.forEach((d, i) => {
  const group = ZILINKA_DISTRICTS.includes(skNames[i]) ? 'zilinka' : 'kaizer';
  skBuckets[group].push(turf.feature(d.geometry));
});

for (const [id, g] of Object.entries(SK_GROUPS)) {
  console.log(`Merging ${id}: ${skBuckets[id].length} okresov…`);
  let merged = dissolve(skBuckets[id]);
  merged = turf.feature(stripHoles(merged.geometry));
  merged = turf.simplify(merged, { tolerance: 0.0006, highQuality: true });
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
