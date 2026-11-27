import { SAVE_KEY } from './alien-earth-core.js';
/** The browser supplies its real Storage object. Tests inject an in-memory fixture;
 * this does not certify browser permissions, disk durability or simultaneous-tab atomicity. */
export function persistEarthProgress(storage,state,expectedRaw){
 const current=storage.getItem(SAVE_KEY);
 if(current!==expectedRaw){
  const error=new Error('Une autre fenêtre a modifié la progression. Exportez votre partie avant de choisir quelle sauvegarde conserver.');
  error.code='EARTH_SAVE_CONFLICT';throw error;
 }
 let legacy=false,legacySchema=0;
 if(current){try{legacySchema=JSON.parse(current).schema;legacy=[1,2,3,4,5,6,7,8,9].includes(legacySchema)&&state.schema>legacySchema;}catch(error){if(!(error instanceof SyntaxError))throw error;}}
 if(legacy&&storage.getItem(SAVE_KEY+'.backup-v'+legacySchema)===null)storage.setItem(SAVE_KEY+'.backup-v'+legacySchema,current);
 const bytes=JSON.stringify(state);
 storage.setItem(SAVE_KEY,bytes);
 return bytes;
}
