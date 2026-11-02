/** Tantalus -> Alien_base offline inventory (game tuning kept in separate fields).
 * This is an audit export, not a certification or an automatic canonical import. */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WEAPONS, ENEMIES, VEHICLES, EQUIPMENT, CREW, FACTIONS, WORLDS } from '../src/content-core-v50.js';
import { AFE2_ROSTER_V110 } from '../src/afe2-roster-v110.js';

const pick = (object, fields) => Object.fromEntries(fields.filter(key => object[key] !== undefined).map(key => [key,structuredClone(object[key])]));
const identity = row => pick(row, ['id','name','family','source','sourceWork','provenance','biology','biologicalBase','caste','modifier','role','species','specialty','fit','referenceStatus','visualStatus','canonExact','referenceUrls','appearances','legacyCatalogName','canonicalVariant']);
const tune = (row, fields) => pick(row, fields);

export function exportTantalusInventoryV1() {
  const entries = (rows, kind, tuningKeys) => rows.map(row => ({
    kind,
    sourceGame: 'aliens-tantalus-frontier',
    identity: identity(row),
    gameplayTuning: tune(row, tuningKeys),
    policy: 'source-identity-separate-from-noncanonical-gameplay'
  }));
  return {
    schemaVersion: '1.0.0',
    game: 'aliens-tantalus-frontier',
    scope: 'current-live-game-catalogues-and-afe2-tracking',
    note: 'Simulation stats, generated variants, authored models and incomplete assets must never become canon by export alone.',
    catalogues: {
      weapons: entries(WEAPONS,'weapon',['damage','fireRate','magazine','reload','penetration','rarity','statsPolicy']),
      enemies: entries(ENEMIES,'enemy',['health','damage','speed','armor','acid','behavior','behaviorStatus']),
      vehicles: entries(VEHICLES,'vehicle',['hull','speed','cargo','armor','actions','statsPolicy']),
      equipment: entries(EQUIPMENT,'equipment',['charges','mass','utility','rarity']),
      characters: entries(CREW,'character',['health','stress','fatigue','loyalty','status']),
      factions: entries(FACTIONS,'faction',['stance']),
      locations: entries(WORLDS,'location',['danger','biomes','atmosphere','infestation']),
      afe2Roster: AFE2_ROSTER_V110.map(x => ({...structuredClone(x), sourceGame:'aliens-tantalus-frontier'}))
    }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const i=process.argv.indexOf('--out');
  if (i < 0 || !process.argv[i+1]) {
    throw new Error('Usage: node scripts/export-alien-base-tantalus-v1.mjs --out ../alien_base/imports/tantalus/live-catalog-v1.json');
  }
  const output=resolve(process.argv[i+1]);
  await mkdir(dirname(output),{recursive:true});
  const data=exportTantalusInventoryV1();
  await writeFile(output,JSON.stringify(data,null,2)+'\n','utf8');
  console.log('Tantalus audit export: '+Object.entries(data.catalogues).map(([k,v])=>k+'='+v.length).join(', ')+' -> '+output);
}
