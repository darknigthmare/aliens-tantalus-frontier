/** Original field-work sequences. These contracts do not claim new movie scenes.
 * Completion is delegated to the V105 objective owner; no second progression system.
 */
import {stationV105,participantReadyV105} from './alien3-encounter-v105.js';
import {nearStationV105,finite105,center105,feet105} from './alien3-navigation-v105.js';
export const OPERATIONS_V107=Object.freeze([
 {id:'report',mode:'traque',stage:1,station:'report',seconds:1.10,label:'Examiner le relevé',working:'Les lignes sont presque lisibles…',sound:'paper',power:.16},
 {id:'prime',mode:'rabattage',stage:1,station:'water',seconds:1.80,label:'Amorcer le collecteur',working:'La pression monte dans le collecteur.',sound:'water',power:.68},
 {id:'arm',mode:'rabattage',stage:2,station:'mold',seconds:1.25,label:'Verrouiller le moule',working:'Le mécanisme prend sa place.',sound:'metal',power:.82},
 {id:'cool',mode:'rabattage',stage:4,station:'water',seconds:2.00,label:'Ouvrir l’eau',working:'Le volant résiste. Tenez encore.',sound:'water',power:.96}
].map(Object.freeze));
export const FIELD_RULES_V107=Object.freeze([
 ['one-owner','Les opérations terminées appellent le propriétaire d’objectif existant, sans valider deux fois la même étape.'],
 ['floor','La commande exige un appui stable au bon étage.'],['depth','La profondeur réellement interpolée est testée pendant toute la manœuvre.'],
 ['door','Une porte fermée interrompt la manœuvre comme elle en empêche le début.'],['release','Relâcher E interrompt la manœuvre en mode maintien.'],
 ['toggle','Le mode Appuyer conserve la durée et les contraintes ; une seconde pression annule.'],['motion','Marcher, grimper, sauter ou changer de profondeur interrompt sans bloquer le joueur.'],
 ['damage','Une blessure interrompt ; les dommages ne sont pas neutralisés par la manœuvre.'],['modal','Pause, plan, archives et perte de focus interrompent ; aucun objectif ne progresse hors jeu.'],
 ['participants','Morse et Dillon doivent tenir leur poste pendant tout le verrouillage du moule.'],['no-remote','La présence à une station est physique, jamais déduite du nom de la salle.'],
 ['machinery','Chaque bruit de manœuvre part de sa station, pas de la position future du joueur.'],['sound-cadence','Les sons sont émis à cadence bornée, pas une fois par image.'],
 ['crew-footsteps','Un détenu produit des pas seulement lorsque sa position réelle change.'],['crew-order','Un ordre audible provient du détenu auquel Ripley parle.'],
 ['trace','Un bruit de matériel peut attirer le Runner, mais ne lui livre pas la position cachée de Ripley.'],['emergency-lever','La coulée reste une commande brève à utiliser quand le Runner est dans le moule ; aucun délai arbitraire ne le téléporte ou l’y immobilise.'],
 ['no-partial-import','Une manœuvre partielle n’est jamais reprise automatiquement depuis un fichier.'],['safe-settings','Le dernier poste sûr conserve le mode de commande ; l’import reprend en pause.'],
 ['strict-sequence','Les opérations consignées doivent correspondre aux étapes réellement acquises.'],['old-files','Les fichiers V105/V106 valides migrent sans devoir refaire leurs objectifs déjà terminés.'],
 ['draw-pure','Le dessin montre l’avancement mais ne change ni les étapes, ni les sons, ni la sauvegarde.'],['no-score','Aucun nouveau rang ni compteur de collecte obligatoire n’est ajouté.'],
 ['scope','La couche s’active uniquement dans les deux séquences originales, pas dans toutes les cinématiques historiques.']
].map(([id,text])=>Object.freeze({id:'A3-107-'+id,text,validation:id==='scope'?'scope':'automated/local'})));
export const operationForV107=(enc)=>enc?.status==='active'?OPERATIONS_V107.find(d=>d.mode===enc.mode&&d.stage===enc.stage)||null:null;
export const completedForV107=(enc)=>enc?OPERATIONS_V107.filter(d=>d.mode===enc.mode&&enc.stage>d.stage).map(d=>d.id):[];
export function createOperationsV107(enc=null,mode='hold'){return {schema:107,sequence:enc?.mode||null,inputMode:mode==='toggle'?'toggle':'hold',active:null,completed:completedForV107(enc),stats:{started:0,completed:0,cancelled:0,workSeconds:0,machinePulses:0,crewSteps:0,crewCalls:0}};}
export function operationsSnapshotV107(raw,enc){if(!raw)return createOperationsV107(enc);return {schema:107,sequence:enc?.mode||null,inputMode:raw.inputMode,active:null,completed:[...raw.completed],stats:{...raw.stats}};}
export function validateOperationsV107(raw,enc){const fail=reason=>({ok:false,reason});if(!raw||Array.isArray(raw)||raw.schema!==107||raw.sequence!==(enc?.mode||null))return fail('identity');
 if(!['hold','toggle'].includes(raw.inputMode)||raw.active!==null)return fail('active-or-input');
 if(!Array.isArray(raw.completed)||JSON.stringify(raw.completed)!==JSON.stringify(completedForV107(enc)))return fail('completion-sequence');
 const keys=Object.keys(createOperationsV107(enc).stats);if(!raw.stats||Array.isArray(raw.stats)||keys.some(k=>!finite105(raw.stats[k])||raw.stats[k]<0||raw.stats[k]>1e7||k!=='workSeconds'&&!Number.isInteger(raw.stats[k])))return fail('stats');
 if(raw.stats.completed+raw.stats.cancelled>raw.stats.started)return fail('stats-consistency');
 return {ok:true,state:{...createOperationsV107(enc,raw.inputMode),completed:[...raw.completed],stats:Object.fromEntries(keys.map(k=>[k,raw.stats[k]]))}};}
export function effectiveLaneV107(engine){const d=engine.alien3V98?.director;if(d?.laneShiftActive&&[d.laneFrom,d.laneTo,d.laneBlend].every(finite105))return d.laneFrom+(d.laneTo-d.laneFrom)*Math.max(0,Math.min(1,d.laneBlend));return engine.player?.depth??engine.alien3V97?.hybrid?.playerLane??1;}
export function operationAccessV107(engine,def=operationForV107(engine.alien3EncounterV105)){
 if(!def||!engine.alien3EncounterV105||engine.alien3EncounterV105.mode!==def.mode||engine.alien3EncounterV105.stage!==def.stage)return {ok:false,reason:'stage',message:'Cette commande n’est pas prête.'};
 if(engine.alien3BlockedV105?.())return {ok:false,reason:'blocked',message:''};
 const p=engine.player,station=stationV105(engine.alien3NavV105,def.station);
 if(!p||p.grounded!==true||p.climbing||Math.abs(p.vy||0)>2)return {ok:false,reason:'support',message:'Reprenez appui devant la commande.'};
 if(!nearStationV105({...p,depth:effectiveLaneV107(engine)},station,engine.doors||[],{range:85,height:16,depth:.30}))return {ok:false,reason:'reach',message:'Rapprochez-vous de la commande.'};
 const enc=engine.alien3EncounterV105;
 if(def.id==='arm'){
  if(!participantReadyV105(enc,'morse',engine.alien3NavV105,'f161-lead-primer'))return {ok:false,reason:'morse',message:'Morse n’a pas rejoint la coulée. Vérifiez le passage derrière lui.'};
  if(!participantReadyV105(enc,'dillon',engine.alien3NavV105,'f161-piston-c-node'))return {ok:false,reason:'dillon',message:'Dillon n’est pas encore à sa commande.'};
 }
 if(def.id==='cool'&&(!enc.flags.poured||!participantReadyV105(enc,'morse',engine.alien3NavV105,'f161-lead-primer')))return {ok:false,reason:'pour',message:'La coulée n’est pas assurée.'};
 return {ok:true,reason:null,station};
}
export function movementIntentV107(keys){return ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyQ','KeyD','KeyW','KeyZ','KeyS','Space'].some(k=>keys?.has?.(k));}
export function operationStillValidV107(engine,active){const def=OPERATIONS_V107.find(d=>d.id===active?.id);const access=operationAccessV107(engine,def);if(!access.ok)return access;
 const p=engine.player;if(movementIntentV107(engine.keys)||Math.hypot(center105(p)-active.origin.x,feet105(p)-active.origin.foot)>12)return {ok:false,reason:'movement',message:'La manœuvre est interrompue.'};
 if(p.health<active.health)return {ok:false,reason:'damage',message:'La manœuvre est interrompue.'};
 if(engine.alien3OperationsV107.inputMode==='hold'&&!engine.keys?.has?.('KeyE'))return {ok:false,reason:'release',message:'La manœuvre est interrompue.'};
 return access;
}

/** One new compact operator post on the existing high water-header support.
 * The arm wheel and report tray reuse already drawn components. None is a new collision.
 */
export function operatorFittingsV107(model){const n=model?.nodeById?.get('f161-water-header');if(!n)return[];return [
 {id:'water-housing-107',kind:'housing',nodeId:n.id,x:n.x+43,y:n.y-38,w:26,h:38,mount:'floor'},
 {id:'water-stem-107',kind:'pipe',nodeId:n.id,x:n.x+51,y:n.y-84,w:8,h:84,mount:'floor'},
 {id:'water-wheel-107',kind:'wheel',nodeId:n.id,x:n.x+39,y:n.y-64,w:32,h:32,mount:'bracket'},
 {id:'water-gauge-107',kind:'gauge',nodeId:n.id,x:n.x+44,y:n.y-89,w:22,h:22,mount:'pipe'}
 ].map(p=>({...p,collision:'none'}));}
export function operationDrawingAnchorV107(model,def){if(def.id==='prime'||def.id==='cool'){const p=operatorFittingsV107(model).find(p=>p.kind==='wheel');return p?{x:p.x+p.w/2,y:p.y+p.h/2,r:13}:null;}
 const station=stationV105(model,def.station),node=station?.nav?.nodeId;const kind=def.id==='arm'?'valve':'tray';const p=model?.scene?.decor?.props.find(p=>p.nodeId===node&&p.kind===kind);return p?{x:p.x+p.w/2,y:p.y+p.h/2,r:def.id==='arm'?p.w*.44:8}:null;}
