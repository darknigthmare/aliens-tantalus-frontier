import {CAST_V113,EQUIPMENT_V113,REFERENCES_V113} from './alien3-fidelity-v113.js';
import {WORLD_ROOMS_V114,activeForCutV114} from './alien3-world-v114.js';
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const REFERENCES_V114=freeze([
 ...REFERENCES_V113,
 {id:'propstore-axe',title:'Propstore — Dillon fire axe / production archive',url:'https://propstore.com/movie/alien-1992/',type:'production-object',fact:'Une hache de Dillon est documentée ; elle reste un objet de personnage, pas un arsenal distribué.'},
 {id:'propstore-commando',title:'Propstore — Weyland-Yutani commando helmet',url:'https://content.propstore.com/auction/emlaus25-2/catalog/EMLA-US_SUMMER25_Catalog_WEB_LO.pdf',type:'production-object',fact:'Casque gris, masque aluminium, lunettes teintées ; commandos armés de pulse rifles.'}
]);
const extra=(id,name,skin,cloth,coat,shape,ref,status='inspection-npc')=>({id,name,skin,cloth,coat,shape,references:ref,status,portrait:'vector-interpretation-not-actor-likeness',exact1to1:false});
const CAST_EXTENSIONS_V114=[
 extra('murphy','Murphy','#b89f82','#746953','#5d5a49','stocky',['inmate-uniform']),
 extra('golic','Golic','#c3ad8e','#75644c','#655d49','lean',['inmate-uniform','cut-register']),
 extra('andrews','Andrews','#b9a489','#696553','#62634e','stocky',['asc-1992']),
 extra('clemens','Clemens','#c8b69d','#79705e','#817c65','tall',['asc-1992']),
 extra('bishop-representative','Bishop II / représentant','#c9b79f','#b7b9a4','#a7ad96','tall',['propstore-commando']),
];
export const CAST_V114=freeze(CAST_V113.map(base=>{
 const extra=CAST_EXTENSIONS_V114.find(entry=>entry.id===base.id);
 return extra?{...base,...extra,status:base.status,references:[...new Set([...base.references,...extra.references])]}:base;
}));
export const EQUIPMENT_V114=freeze([...EQUIPMENT_V113,
 {id:'dillon-axe',title:'Hache de Dillon',owner:'dillon',role:'character-prop',nodeIds:['f161-leadworks'],references:['propstore-axe'],evidence:'production-reference',implemented:'catalogue-only',notes:'Référence archivée ; rendu et interaction non réalisés. Aucun ajout à l’inventaire de Ripley.'},
 {id:'commando-helmet',title:'Casque de commando Weyland-Yutani',owner:'company-guard',role:'worn-equipment',nodeIds:['f161-company'],references:['propstore-commando'],evidence:'production-reference',implemented:'arrival-render',notes:'Masque et lunettes intégrés au porteur.'},
 {id:'pulse-rifle-black',title:'Pulse Rifle Alien 3',owner:'company-guard',role:'weapon-carried',nodeIds:['f161-company'],references:['pulse-film'],evidence:'production-reference',implemented:'arrival-render',notes:'Finition noire ; aucun spawn d’arme pour Ripley.'},
 {id:'slaughter-rail',title:'Rail / treuil d’abattoir',owner:'environment',role:'fixed-equipment',nodeIds:[],references:['cut-register'],evidence:'assembly-reference',implemented:'inspection-shell',notes:'Présent uniquement dans le shell Assembly de l’abattoir.'},
 {id:'golic-restraint',title:'Confinement de Golic',owner:'environment',role:'fixed-equipment',nodeIds:[],references:['cut-register'],evidence:'assembly-reference',implemented:'inspection-shell',notes:'Grille et couchette dans le shell d’inspection.'}
]);
export function equipmentForCutV114(cut='theatrical'){return EQUIPMENT_V114.filter(e=>{if(e.id==='slaughter-rail'||e.id==='golic-restraint')return cut==='assembly';return true;});}
export function fidelityInventoryV114(cut='theatrical'){return {cut,rooms:WORLD_ROOMS_V114.filter(r=>activeForCutV114(r,cut)).length,cast:CAST_V114.length,equipment:equipmentForCutV114(cut).length,weaponOwners:EQUIPMENT_V114.filter(e=>e.role==='weapon-carried').map(e=>({id:e.id,owner:e.owner}))};}
