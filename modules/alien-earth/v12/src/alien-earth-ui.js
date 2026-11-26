import { getEarthRasterPreviewPoseV12 } from './alien-earth-raster-v12.js';
import { drawReferenceHumanV11, drawReferenceWeaponV11 } from './alien-earth-reference-art-v11.js';
import { sectorReportV8, makeFieldReportV8 } from './alien-earth-investigations-v8.js';
import { EARTH_DATA } from './alien-earth-data.js';
import { EarthEngine, ROOM_BY_ID, SAVE_KEY, sanitizeSave, newState, clamp } from './alien-earth-core.js';
import { persistEarthProgress } from './alien-earth-storage-v2.js';
import { EarthRenderer } from './alien-earth-renderer.js';

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let engine=new EarthEngine(),renderer=new EarthRenderer($('game')),modal='title',started=false,saved=null,saveError='',protectSave=false;
let lastStoredRaw=null;
const hostReturnUrlV12=/^https?:$/.test(location.protocol)&&/^\/dlc\/alien-earth\/v12(?:\/|$)/.test(location.pathname)?'/':null;
let keys=new Set(),returnTo='title',audioOn=false,audioContext=null,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let investigationId=null,investigationAnswer=['','',''],objectiveFilter='all';
let codexTab='organisms',codexIndex=0,puzzleAnswer=[],toastTimer=0,last=0,saveClock=0,hudClock=0;
renderer.reduced=reduced;
try{const raw=localStorage.getItem(SAVE_KEY);lastStoredRaw=raw;if(raw){try{saved=sanitizeSave(raw);}catch(e){saveError=e.message;protectSave=true;}}}catch{saveError='Le stockage local est inaccessible. Utilisez l’export de sauvegarde.';protectSave=true;}
function notify(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4400);}
function save(){
 if(!started||protectSave||engine.dead)return false;
 try{
  const state=engine.snapshot(),bytes=persistEarthProgress(localStorage,state,lastStoredRaw);lastStoredRaw=bytes;saved=state;$('saveLabel').textContent='ENREGISTRÉ';return true;}
 catch(e){if(e.code==='EARTH_SAVE_CONFLICT'){protectSave=true;saveError=e.message;$('saveLabel').textContent='CONFLIT';notify(saveError);return false;}protectSave=true;saveError='La sauvegarde locale a échoué. Exportez votre progression avant de fermer cette fenêtre.';$('saveLabel').textContent='NON ENREGISTRÉ';notify(saveError);return false;}
}
function returnHostV12(force=false){
 if(!hostReturnUrlV12)return false;
 if(!force&&started&&!engine.dead&&!save()){
  open('returnHost',header('Retour au Tantalus','Conserver la progression',false)+'<p>'+esc(saveError||'La sauvegarde n’a pas pu être enregistrée.')+' Exportez votre progression pour la conserver.</p><div class="actions"><button data-act="export">Exporter la progression</button><button data-act="hostForce">Quitter sans enregistrer</button><button data-act="pause">Rester ici</button></div>');return false;
 }
 const previousProtection=protectSave;if(force)protectSave=true;keys.clear();
 try{location.assign(hostReturnUrlV12);return true;}catch(error){protectSave=previousProtection;notify('Le retour est indisponible. Votre progression reste accessible ici.');return false;}
}
function sound(kind){
 if(!audioOn)return;
 try{
  audioContext ||= new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
  const now=audioContext.currentTime,o=audioContext.createOscillator(),g=audioContext.createGain();o.connect(g);g.connect(audioContext.destination);
  const notes={security:[390,620,.45],sensor:[620,480,.13],service:[280,560,.2],impact:[62,35,.18],footstep:[90,45,.1],decoy:[560,360,.18],tool:[85,43,.25],shot:[130,31,.11],reload:[410,220,.15],resonance:[170,340,.65],goal:[420,840,.25],click:[380,360,.05]};const [a,b,d]=notes[kind]||notes.click;
  o.type=kind==='shot'?'sawtooth':'sine';o.frequency.setValueAtTime(a,now);o.frequency.exponentialRampToValueAtTime(b,now+d);g.gain.setValueAtTime(kind==='shot'?.05:.06,now);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.start(now);o.stop(now+d);
 }catch{audioOn=false;notify('Le son n’est pas disponible dans ce navigateur.');}
}
function header(kicker,title,close=true){return `<header><div><div class="eyebrow">${esc(kicker)}</div><h2 id="modalHeading">${esc(title)}</h2></div>${close?'<button data-act="close" aria-label="Fermer">×</button>':''}</header>`;}
function open(type,html,style=''){
 if(['dialog','puzzle','service','containment','sensors','investigation','security'].includes(modal)&&type!==modal&&!(modal==='service'&&['investigation','security'].includes(type)))engine.cancelInteraction();
 $('hud').inert=true;$('touch').inert=true;
 modal=type;keys.clear();$('overlay').hidden=false;$('panel').className='panel '+style;$('panel').innerHTML=html;$('panel').scrollTop=0;
 $('shell').dataset.state=type;requestAnimationFrame(()=>{const f=$('panel').querySelector('button:not([disabled]),input,select,a');if(f)f.focus({preventScroll:true});});
}
function resume(){$('hud').inert=false;$('touch').inert=false;modal=null;keys.clear();$('overlay').hidden=true;$('shell').dataset.state='playing';$('game').focus({preventScroll:true});last=performance.now();}
function close(){
 if(modal==='title')return;
 if(['dialog','puzzle','service','containment','sensors','investigation','security'].includes(modal))engine.cancelInteraction();
 if(modal==='chapterEnd'||modal==='dead'||modal==='finished')return;
 if(!started||returnTo==='title'){showTitle();returnTo=started?'game':'title';}else if(engine.state.finished)finished();else resume();
}
function showTitle(){
 returnTo='title';open('title',`<div class="eyebrow">TANTALUS FRONTIER · CAMPAGNE ADDITIONNELLE</div><h1 class="brand" id="modalHeading">ALIEN</h1><div class="earth">EARTH</div><h2>Les enfants de Neverland</h2><p>Un nouveau corps. Une île qui se croit à l’abri.<br>Et quelque chose qui n’aurait jamais dû arriver jusqu’ici.</p>${saveError?`<div class="alert">${esc(saveError)} Vos anciennes données ne seront pas remplacées sans votre accord.</div>`:''}<div class="buttons">${saved?'<button class="primary" data-act="continue">Continuer la campagne</button>':'<button class="primary" data-act="new">Commencer</button>'}<button data-act="chapters">Les huit chapitres</button><button data-act="codex">Dossiers de Neverland</button><button data-act="fidelity">Lieux, silhouettes & références</button><button data-act="options">Options & commandes</button>${saved?'<button data-act="new">Nouvelle campagne</button>':'<button data-act="import">Importer une sauvegarde</button>'}${hostReturnUrlV12?'<button data-act="host">Retour au Tantalus</button>':''}</div><p class="fine">Adaptation non officielle de la saison 1 · contient des révélations.<br>Dialogues et plans originaux. Version 12.0.0 · Les enfants de Neverland.<br>Clavier et commandes tactiles.</p>`,'title');
}
function briefing(){returnTo='game';const c=engine.chapter;open('briefing',`<span class="chapter-number">${String(engine.state.chapter+1).padStart(2,'0')}</span>${header(c.subtitle,c.title,false)}<p class="lede">${esc(c.context)}</p><div class="tag">${esc(engine.character.name)} · ${esc(engine.character.type)}</div><p>${esc(engine.character.role)}</p><div class="actions"><button class="primary" data-act="start">Entrer dans le chapitre</button><button data-act="help">Lire les commandes</button></div><p class="source-note">Le récit conserve les grands événements de la saison 1. Les trajets, les tâches intermédiaires et les dialogues sont adaptés pour le jeu.</p>`,'briefing');}
function newGame(){
 if(saved||protectSave||started){open('confirmNew',header('Nouvelle campagne','Recommencer depuis Neverland')+'<p>La nouvelle campagne remplacera la progression de ce module uniquement. Les sauvegardes de Tantalus et des autres DLC ne sont pas touchées.</p><div class="actions"><button data-act="export">Exporter la progression</button><button class="primary" data-act="confirmNew">Recommencer</button><button data-act="title">Annuler</button></div>');return;}
 beginNew();
}
function beginNew(){const prefs={presentation:engine.state.presentation,difficulty:engine.state.difficulty};engine=new EarthEngine();Object.assign(engine.state,prefs);started=true;protectSave=false;saveError='';try{lastStoredRaw=localStorage.getItem(SAVE_KEY);}catch{}saved=null;renderer.lastRoom=null;save();briefing();}
function continueGame(){if(!saved){notify('Aucune sauvegarde valide n’est disponible.');return;}try{engine=new EarthEngine(saved);started=true;renderer.lastRoom=null;returnTo='game';if(engine.state.finished)finished();else resume();}catch(e){notify(e.message);}}
function showPause(){
 if(!started){showTitle();return;}returnTo='game';engine.cancelInteraction();open('pause',header(engine.chapter.subtitle,'Faire une pause')+`<p>${esc(engine.room.title)} · ${engine.character.name}</p><div class="actions"><button class="primary" data-act="resume">Reprendre</button><button data-act="map">Carte du secteur</button><button data-act="codex">Dossiers</button><button data-act="bag">Équipement & secours</button><button data-act="fidelity">Références & dotations · 5</button><button data-act="switchGear">Changer de dotation · 6</button><button data-act="objectives">Objectifs du secteur</button><button data-act="investigations">Enquêtes · 3</button><button data-act="fieldReport">Bilan de terrain</button><button data-act="journal">Journal de terrain</button><button data-act="options">Options</button><button data-act="export">Exporter la sauvegarde</button><button data-act="import">Importer</button><button data-act="title">Menu principal</button>${hostReturnUrlV12?'<button data-act="host">Retour au Tantalus</button>':''}</div><p class="fine" style="margin-top:25px">Le jeu est arrêté tant que ce menu reste ouvert. La progression du DLC est indépendante de celle du jeu hôte.</p>`);
}
function sectorSvg(){
 const ids=EARTH_DATA.rooms.filter(r=>r.chapter===engine.chapter.id).map(r=>r.id),coords=ids.map((id,i)=>[95+(i%3)*325,55+Math.floor(i/3)*182]);const mapHeight=70+Math.ceil(ids.length/3)*182;
 const points=Object.fromEntries(ids.map((id,i)=>[id,coords[i]]));let lines='',nodes='';const seen=new Set();const guidance=engine.routeToTracked()||[];
 for(const id of ids){const r=ROOM_BY_ID[id],a=points[id];for(const door of r.portals.filter(p=>p.kind==='door')){
  const b=points[door.to],key=[id,door.to].sort().join(':');if(!b||seen.has(key))continue;seen.add(key);
  const unlocked=(door.requires||[]).every(t=>engine.state.completed.includes(t))&&(!door.hatchKey||engine.hatchOpen(door));
  lines+=`<path class="map-link ${door.hatchKey?'technical':door.shortcut?'shortcut':''} ${unlocked?'open':'locked'} ${guidance.some(g=>[id,door.to].includes(g.from)&&[id,door.to].includes(g.to))?'guided':''}" d="M${a[0]+70} ${a[1]+41} L${b[0]+70} ${b[1]+41}"/>`;
 }
 const here=id===engine.room.id,done=engine.state.completed.includes(r.task.id),visited=engine.state.visited.includes(id);
 nodes+=`<g class="map-node ${here?'here':''} ${visited?'visited':''}" transform="translate(${a[0]-34},${a[1]})"><rect width="235" height="84" rx="5"/><text x="13" y="20" class="map-node-kind">${r.duct?'GALERIE TECHNIQUE':r.optional?'PASSAGE SECONDAIRE':'ITINÉRAIRE PRINCIPAL'}${done?' · ✓':''}</text><text x="13" y="45" style="font-size:11px">${esc(r.title.slice(0,31))}</text><text x="13" y="67" class="map-node-floor">${here?'VOUS ÊTES ICI':esc(r.level)}</text></g>`;
 }
 return `<svg class="sector-map" viewBox="0 0 1010 ${mapHeight}" role="img" aria-label="Plan schématique des ${ids.length} pièces et de leurs accès"><defs><pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#a1b0a40c"/></pattern></defs><rect width="1010" height="${mapHeight}" fill="url(#map-grid)"/>${lines}${nodes}</svg>`;
}
function showMap(){
 if(!started){showChapters();return;}returnTo='game';const c=engine.chapter,ids=EARTH_DATA.rooms.filter(r=>r.chapter===c.id).map(r=>r.id);
 open('map',header(c.subtitle,'Les chemins du secteur')+serviceStrip()+`<div class="map-legend"><span>— Porte</span><span>┄ Passage de secours</span><span>··· Grille technique</span><span>Vert : guidage</span><span class="locked-key">Brun : accès verrouillé</span></div>${sectorSvg()}<div class="map-grid">${ids.map(id=>{
  const r=ROOM_BY_ID[id],here=id===engine.state.room,done=engine.state.completed.includes(r.task.id);return `<article class="map-room ${here?'here':''} ${done?'complete':''}"><small>${esc(r.level)}${here?' · ICI':''}${r.duct?' · GALERIE':r.optional?' · FACULTATIF':''}${engine.state.trackedRoom===id?' · SUIVI':''}</small><h3>${esc(r.title)}</h3><p class="objective-status">${done?'✓':'◇'} ${esc(r.task.label)}</p><p class="route">${r.portals.filter(d=>d.kind==='door').map(d=>`${(d.requires||[]).every(g=>engine.state.completed.includes(g))?'↔':'⊗'} ${esc(ROOM_BY_ID[d.to].title)}`).join('<br>')}</p>${engine.state.intel[id]?`<p class="intel-note">Dernière écoute · ${Math.max(0,Math.floor(engine.state.playSeconds-engine.state.intel[id].time))} s : ${{quiet:'aucun bruit distinct',movement:'mouvement',heavy:'pas lourds'}[engine.state.intel[id].level]}</p>`:''}${EARTH_DATA.containmentPads.some(p=>p.room===id)?`<p class="pod-map-status">Confinement · ${EARTH_DATA.containmentPads.filter(p=>p.room===id&&engine.podState(p.id).status==='sealed').length} occupé / ${EARTH_DATA.containmentPads.filter(p=>p.room===id).length} plateau</p>`:''}${sensorMapLine(id)}${securityMapLine(id)}${r.duct?`<p class="duct-map-state">Turbine : ${done?'consignée':here?engine.ductFan().label.toLowerCase():'cycle local, non observé'} · passage accroupi</p>`:''}<button data-act="track" data-room="${id}" class="track-button">${engine.state.trackedRoom===id?'Objectif suivi':'Suivre ce lieu'}</button></article>`;}).join('')}</div><p class="fine">${c.goals.filter(id=>engine.state.completed.includes(id)).length}/4 actions principales · ${c.annexes.filter(id=>engine.state.completed.includes(ROOM_BY_ID[id].task.id)).length}/2 passages rétablis. Plan schématique ; les changements d’étage sont indiqués sur le terrain.</p><div class="actions"><button class="primary" data-act="resume">Retour sur le terrain</button></div>`,'map-panel');
}
function showJournal(){
 if(!started){showTitle();return;}returnTo='game';
 const list=[...engine.state.journal].reverse();
 open('journal',header('Événements vécus & indices datés','Le journal de terrain')+`<div class="actions"><button data-act="investigations">Enquêtes</button><button data-act="objectives">Objectifs</button><button data-act="fieldReport">Bilans</button><button data-act="archiveIndex">Documents retrouvés</button><button data-act="security">Sentinelles · 4</button><button data-act="sensors">Récepteur de sondes</button><button data-act="containRegister">Registre de confinement</button>${Object.values(engine.state.cameraFrames).map(f=>`<button data-act="cameraReview" data-camera="${f.camera}">${esc(ROOM_BY_ID[f.room].title)} · relevé</button>`).join('')}</div><p class="fine">Les indices reflètent l’instant où vous les avez entendus. Une présence peut s’être déplacée depuis. Ce journal n’est pas un détecteur permanent.</p><div class="journal-list">${list.length?list.map(j=>`<article class="journal-entry"><time>${String(Math.floor(j.time/60)).padStart(2,'0')}:${String(Math.floor(j.time%60)).padStart(2,'0')}</time><div><small>${esc(ROOM_BY_ID[j.room].title)}</small><p>${esc(j.text)}</p></div></article>`).join(''):'<p>Aucun événement relevé. Maintenez G près d’une porte pour écouter.</p>'}</div><div class="actions"><button class="primary" data-act="resume">Revenir au terrain</button><button data-act="map">Carte du secteur</button></div>`);
}
function showBag(){
 if(!started){showTitle();return;}returnTo='game';const inv=engine.state.inventory;
 const status={follow:'Vous suit',wait:'Attend sur place',down:'À stabiliser',rescued:'Évacué',left:'Resté dans le secteur'};
 const survivors=Object.values(engine.state.survivors);
 open('bag',header('Équipement & secours','Ce que vous emportez')+serviceStrip()+`<div class="gear-grid"><article><small>U · STABILISER</small><strong>${inv.care}</strong><h3>Kits disponibles</h3><p>40 points d’intégrité. Les kits servent également aux personnes à terre.</p><button data-act="useCare" ${engine.player.hp>=engine.character.health||!inv.care?'disabled':''}>Utiliser un kit</button></article><article><small>B · DÉTOURNER L’ATTENTION</small><strong>${inv.decoys}</strong><h3>Balises sonores</h3><p>Lancez dans un passage dégagé, puis quittez la ligne de vue. Une balise n’efface pas une poursuite.</p></article></div><p class="fine">Établi : ${esc(ROOM_BY_ID[engine.network.benchRoom].title)}. Les pièces servent aux recettes et à une réparation par porte. Aucune fabrication à distance.</p><section class="bag-containment"><h3>Confinement de terrain</h3>${containmentSummary()}<p>Cartouche : quatre pièces à l’établi. Tique, Facehugger ou Mouche ; aucun gros organisme.</p><button data-act="investigations">Enquêtes</button><button data-act="objectives">Objectifs</button><button data-act="fieldReport">Bilans</button><button data-act="archiveIndex">Documents retrouvés</button><button data-act="security">Sentinelles · 4</button><button data-act="sensors">Récepteur de sondes</button><button data-act="containRegister">Registre de confinement</button></section><h3>Les personnes retrouvées</h3>${survivors.length?survivors.map(f=>`<article class="survivor-row"><div><b>${esc(engine.survivorDef(f.id).name)}</b><small>${engine.state.carryId===f.id?'Porté · évacuation médicale':esc(status[f.status])} · ${esc(ROOM_BY_ID[f.room].title)}</small></div><span>${Math.ceil(f.hp)} / ${engine.survivorDef(f.id).health}<small>Tension ${Math.round(f.stress||0)} %${f.quiet?' · discret':''}</small></span></article>`).join(''):'<p>Vous n’avez encore rencontré personne dans les passages secondaires.</p>'}<p class="fine">P maintenu : porter une personne à terre ; P pour déposer. E : attendre, suivre ou stabiliser. T maintenu : rassurer un compagnon proche. Les ordres ci-dessous ne s’adressent qu’aux personnes de votre pièce. La balise de secours est indiquée dans sa destination d’évacuation.</p><div class="actions"><button class="primary" data-act="resume">Retour au terrain</button><button data-act="map">Carte du secteur</button></div><div class="actions"><button data-act="order" data-order="follow">H · Regrouper</button><button data-act="order" data-order="wait">Y · Attendre</button><button data-act="order" data-order="quiet">Suivre discrètement</button></div>`);
}
function showChapters(){
 open('chapters',header('SAISON 1','Les huit chapitres')+`<div class="chapter-grid">${EARTH_DATA.chapters.map((c,i)=>`<article class="chapter-card"><small>${String(i+1).padStart(2,'0')} · ${esc(c.pov==='joe'?'Joe Hermit':c.pov==='morrow'?'Morrow':'Wendy')}</small><h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p><p class="fine">${c.goals.every(g=>(saved?.completed||engine.state.completed).includes(g))?'Terminé':(saved?.chapter??engine.state.chapter)===i?'Chapitre actuel':'À découvrir'}</p></article>`).join('')}</div><p class="fine" style="margin:20px 0 0">La progression se fait par les accès du terrain, pas par une sélection qui saute les objectifs.</p>`);
}
function options(){
 const origin=modal==='briefing'?'briefing':returnTo;open('options',header('Configuration','Options & commandes')+`
 <div class="options-row"><label for="presentation">Présentation<small>Classique : trois plans reliés aux passages marqués. Hybride : profondeur libre là où la pièce s’y prête. F6 change aussi ce réglage.</small></label><select id="presentation"><option value="HYBRID" ${engine.state.presentation==='HYBRID'?'selected':''}>Hybride</option><option value="CLASSIC" ${engine.state.presentation==='CLASSIC'?'selected':''}>Classique multi-plans</option></select></div>
 <div class="options-row"><label for="difficulty">Pression des menaces<small>Modifie les dégâts reçus ; les portes, les preuves et les événements restent identiques.</small></label><select id="difficulty"><option value="story" ${engine.state.difficulty==='story'?'selected':''}>Récit</option><option value="normal" ${engine.state.difficulty==='normal'?'selected':''}>Survie</option><option value="danger" ${engine.state.difficulty==='danger'?'selected':''}>Danger</option></select></div>
 <div class="options-row"><label for="audio">Effets sonores<small>Signaux synthétiques originaux. Aucune voix ni musique de la série.</small></label><input id="audio" type="checkbox" ${audioOn?'checked':''}></div>
 <div class="options-row"><label for="reduced">Réduire les mouvements<small>Arrête pluie animée, flottements et animation ambiante. Le mouvement du jeu reste actif.</small></label><input id="reduced" type="checkbox" ${reduced?'checked':''}></div>
 <div class="controls-grid">${[
 ['Références & fidélité','5'],['Changer de dotation','6'],['Mousse du KSG-AL','7'],['Marcher','Q/D ou A/D'],['Profondeur / plan','Z/S ou W/S'],['Interagir / maintenir','E'],['Repousser','F'],['Tirer (Joe / Morrow)','J'],['Recharger','R'],['Résonance de Wendy','V'],['Balise sonore','B'],['Kit de stabilisation','U'],['Relevé de terrain','N maintenu'],['Équipement & secours','I'],['Verrou de porte','X maintenu'],['Réparer le verrou','M maintenu'],['Porter / déposer','P maintenu'],['Écouter à la porte','G maintenu'],['Rassurer un compagnon','T maintenu'],['Regrouper / attendre','H / Y'],['Journal des indices','O'],['Confinement','E au plateau'],['Poser une sonde','1 maintenu'],['Récepteur des sondes','2'],['S’accroupir','C maintenu'],['Courir','Maj maintenu'],['Torche','L'],['Carte / dossiers','Tab / K'],['Pause / vue','Échap / F6']].map(([l,k])=>`<div><span>${l}</span><kbd>${k}</kbd></div>`).join('')}</div><p class="fine">Grilles : E maintenu deux secondes, puis E pour passer. Galeries : marche accroupie imposée, pas de tir ou de portage. Frein : E maintenu 2,5 secondes depuis chaque côté. Les flèches directionnelles fonctionnent aussi. En vue classique, changez de plan aux repères ↕. Il n’y a pas de saut, de conduite libre, de coop ni de manette configurée dans cette version.</p><div class="actions"><button class="primary" data-act="${origin==='briefing'?'briefing':'close'}">Revenir</button><button data-act="export">Exporter</button><button data-act="import">Importer</button></div>`);
}
function showCodex(tab=codexTab,index=codexIndex){
 codexTab=tab;codexIndex=index;if(started&&returnTo!=='title')returnTo='game';
 const tabs=[['equipment','Équipement'],['organisms','Organismes'],['people','Personnes'],['places','Lieux'],['rules','Protocoles'],['sources','Sources']];
 let list=[],detail='';
 if(tab==='equipment'){list=EARTH_DATA.equipment;index=clamp(index,0,list.length-1);const item=list[index];detail=`<span class="tag">${esc(item.key)}</span><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p>`;}else if(tab==='organisms'){
  list=EARTH_DATA.creatures;index=clamp(index,0,list.length-1);const d=list[index];detail=`<span class="tag">${esc(d.status)}</span><h3>${esc(d.name)}</h3><p class="field-status">${engine.state.research.includes(d.id)?'✓ Relevé de terrain conservé':'N maintenu sur le terrain · relevé non effectué'}</p><h4>Repère narratif</h4><p>${esc(d.canon)}</p><h4>Comportement dans ce jeu</h4><p>${esc(d.behavior)}</p><h4>Réagir</h4><p>${esc(d.counter)}</p><p class="fine">Source de référence : ${esc(d.source)}. Les valeurs de vitesse, les attaques et leurs délais sont des choix de l’adaptation.</p>`;
 }else if(tab==='people'){
  list=EARTH_DATA.characters;index=clamp(index,0,list.length-1);const d=list[index];detail=`<span class="tag">${esc(d.type)} · PERSONNAGE JOUABLE</span><h3>${esc(d.name)}</h3><h4>Identité</h4><p>${esc(d.canon)}</p><h4>Dans la campagne</h4><p>${esc(d.role)}</p><h4>Les autres personnages</h4><p>Kirsh, Dame Sylvia, Arthur, Boy Kavalier, Curly, Nibs et les autres hybrides apparaissent dans les dialogues et les événements du récit. Leurs actions intermédiaires sont condensées ; ils ne disposent pas chacun d’une campagne jouable autonome.</p>`;
 }else if(tab==='places'){
  list=EARTH_DATA.rooms;index=clamp(index,0,list.length-1);const r=list[index];detail=`<span class="tag">${esc(r.level)}${r.optional?' · ANNEXE ORIGINALE':''}</span><h3>${esc(r.title)}</h3><p>${esc(r.landmark)}</p><h4>Action locale</h4><p>${esc(r.task.label)}</p><h4>Circulation</h4><p>${r.portals.map(d=>`${d.kind==='chapter'?'Transfert':'Porte'} : ${esc(d.label)}`).join('<br>')}</p><h4>Réseau local</h4><p>${esc(r.serviceContract||'')}<br>Appareils : ${r.interactables.filter(i=>['powercab','workbench','cameraConsole','scrap'].includes(i.kind)).map(i=>esc(i.label)).join(' · ')||'éclairage de service'}.</p><h4>Confinement</h4><p>${esc(r.containmentContract||'Aucun plateau dans cette pièce.')}</p><h4>Sondes portables</h4><p>${esc(r.sensorContract||'Pose sur sol libre, sans obstruer les commandes.')}</p><h4>Construction</h4><p>${r.props.length} éléments de décor placés. ${r.enemies.length?'Rencontre : '+esc(EARTH_DATA.creatures.find(e=>e.id===r.enemies[0].kind)?.name):'Aucune menace mobile imposée.'}</p><p class="fine">${esc(r.geometryStatus)}. Longueur de la scène : ${r.width} unités de jeu, et non des mètres attestés.</p>`;
 }else if(tab==='rules'){
  list=[...new Set(EARTH_DATA.rules.map(r=>r.category))].map(x=>({id:x,name:x}));index=clamp(index,0,list.length-1);detail=`<h3>Codex de level design</h3><p>${EARTH_DATA.rules.length} règles de production. Leur présence dans ce dossier ne constitue pas, à elle seule, une preuve de validation.</p><div class="rules">${EARTH_DATA.rules.filter(r=>r.category===list[index].name).map(r=>`<article><span class="rule-code">${r.id} · ${esc(r.category)}</span><p>${esc(r.text)}</p></article>`).join('')}</div>`;
 }else{
  detail=`<h3>Repères et limites</h3><p>Le cadre est celui de la saison 1. Les plans, dialogues et mécaniques de ce module sont originaux. Les liens ci-dessous sont des références externes ; aucun fichier de la série n’est chargé pour jouer.</p>${EARTH_DATA.sources.map(s=>`<article class="source-card"><small>${esc(s.id)} · ${esc(s.type)}</small><p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></p><p>${esc(s.scope)}</p></article>`).join('')}`;
 }
 open('codex',header('Dossiers de Neverland','Observer avant d’agir')+`<nav class="tabs">${tabs.map(([id,label])=>`<button data-act="codexTab" data-tab="${id}" class="${tab===id?'selected':''}">${label}</button>`).join('')}</nav><div class="${list.length?'codex-layout':''}">${list.length?`<nav class="codex-nav">${list.map((item,i)=>`<button data-act="codexItem" data-index="${i}" class="${i===index?'selected':''}">${esc(item.name||item.title)}</button>`).join('')}</nav>`:''}<article class="codex-detail">${detail}</article></div>`);
}
function puzzle(task){
 puzzleAnswer=task.kind==='scan'?[]:[0,0,0];let html='';
 if(task.kind==='scan'){
  const labels=['Grave','Médium','Aigu'];html=`<p>Reproduisez le motif enregistré, du premier au dernier signal.</p><div class="signal-code">${task.sequence.map((n,i)=>`${i?'<i>→</i>':''}<span>${n+1}</span>`).join('')}</div><div class="puzzle-row">${labels.map((label,i)=>`<button data-act="tone" data-tone="${i}" class="switch"><b>${i+1} · ${label}</b><small>Échantillon ${i+1}</small></button>`).join('')}</div><div id="puzzleResult" class="puzzle-result">En attente du premier signal.</div><div class="actions"><button data-act="resetPuzzle">Réinitialiser</button><button class="primary" data-act="submitPuzzle">Confirmer la lecture</button></div>`;
 }else{
  html=`<div class="task-clue">Consigne locale : ${task.circuits.map((name,i)=>`${esc(name)} ${task.pattern[i]?'alimenté':'coupé'}`).join(' · ')}.</div><div class="puzzle-row">${task.circuits.map((name,i)=>`<button data-act="switch" data-index="${i}" data-on="0" class="switch"><span class="lamp"></span><b>${esc(name)}</b><small>Coupé</small></button>`).join('')}</div><div id="puzzleResult" class="puzzle-result">Les commandes sont indépendantes.</div><div class="actions"><button class="primary" data-act="submitPuzzle">${task.kind==='contain'?'Engager le verrouillage':'Valider le circuit'}</button><button data-act="close">Revenir au terrain</button></div>`;
 }
 returnTo='game';open('puzzle',header(task.speaker,task.label)+`<p>${esc(task.dialogue)}</p>`+html);
}
function dialog(task){
 const choices={
 'AE-01':['Je peux marcher. Je veux essayer.','Mon nom… C’est bien Wendy, maintenant ?'],
 'AE-04':['Garde le canal ouvert. Je dois l’entendre.','Trouve sa position avant qu’ils coupent la liaison.'],
 'AE-21':['Je vais la retrouver. Reste avec les autres.','Ne les laisse pas vous séparer.'],
 'AE-31':['Tu vas leur répondre. Sous nos conditions.','Alors ils attendront. Ouvre les derniers accès.'],
 'AE-32':['Rassembler les hybrides près de la terrasse.','Observer les lumières au large avant d’avancer.']
 }[task.id]||['Continuons.','Restons prudents.'];
 returnTo='game';open('dialog',header(task.speaker,task.label)+`<p class="dialogue-line">${esc(task.dialogue)}</p><div class="dialog-choices"><button class="primary" data-act="dialogChoice" data-choice="0">${esc(choices[0])}</button><button data-act="dialogChoice" data-choice="1">${esc(choices[1])}</button></div><p class="fine" style="margin:20px 0 0">Votre réponse est conservée dans le journal. Elle ne réécrit pas les événements établis de la saison.</p>`);}
function chapterEnd(chapter){returnTo='game';open('chapterEnd',header(chapter.subtitle,'Ce qui vient après',false)+`<p class="lede">${esc(chapter.ending)}</p><p class="fine">${Object.values(engine.state.survivors).filter(f=>ROOM_BY_ID[f.room].chapter===chapter.id&&!['rescued','left'].includes(f.status)).length?'Des personnes retrouvées attendent encore leur évacuation. Ce transfert quitte définitivement le secteur.':'Vous pouvez encore explorer les passages secondaires avant de partir.'}</p><div class="actions"><button data-act="fieldReport">Voir le bilan avant départ</button><button data-act="staySector">Rester dans le secteur</button><button class="primary" data-act="nextChapter">${engine.state.chapter===7?'Achever la campagne':'Continuer le récit'}</button></div>${sensorDepartureWarning()}<p class="fine" style="margin-top:22px">${esc(chapter.transfer)} · transfert narratif explicite, distinct d’une porte intérieure.</p>`);}
function finished(){returnTo='game';open('finished',header('FIN DE LA SAISON 1','La nuit n’est pas finie',false)+`<p class="lede">Le complexe a changé de mains. Au large, les lumières se rapprochent. L’avenir de Neverland reste ouvert.</p><div class="stats-grid"><div><strong>${engine.state.completed.length}/${EARTH_DATA.rooms.length}</strong><span>32 principales + 30 facultatives</span></div><div><strong>${engine.state.archives.length}/${EARTH_DATA.rooms.length}</strong><span>Archives retrouvées</span></div><div><strong>${engine.state.visited.length}/${EARTH_DATA.rooms.length}</strong><span>Pièces parcourues</span></div></div><p>${engine.state.stats.rescues}/4 personnes évacuées, dont ${engine.state.serviceStats.medicalEvacs} portées · ${engine.state.research.length}/8 profils observés.</p>${containmentSummary()}<div class="actions"><button data-act="investigations">Enquêtes</button><button data-act="objectives">Objectifs</button><button data-act="fieldReport">Bilans</button><button data-act="archiveIndex">Documents retrouvés</button><button data-act="security">Sentinelles · 4</button><button data-act="sensors">Récepteur de sondes</button><button data-act="containRegister">Consulter les études</button></div><p>Les huit chapitres de cette adaptation sont achevés. Aucune saison suivante n’est imaginée ici.</p><div class="actions"><button class="primary" data-act="export">Conserver la sauvegarde</button><button data-act="codex">Dossiers</button><button data-act="title">Menu principal</button></div>`);}
function dead(){open('dead',header('LIAISON PERDUE','Revenir au dernier point sûr',false)+'<p>Le point d’entrée de la pièce reste disponible. Les actions et les archives déjà enregistrées sont conservées.</p><div class="actions"><button class="primary" data-act="retry">Reprendre</button><button data-act="title">Menu principal</button></div>');}
function handleEvents(){
 for(const e of engine.drain()){
  if(e.type==='toast')notify(e.text);
  else if(e.type==='save'){if(started)save();}
  else if(e.type==='sensorPanel')showSensors(e.id);
  else if(e.type==='containmentPanel')showContainment(e.pad);
  else if(e.type==='investigationPanel'){investigationAnswer=['','',''];showInvestigation(e.id,true);}
  else if(e.type==='securityPanel')showSecurity(e.id,true);
  else if(e.type==='servicePanel')showServicePanel(e.station);
  else if(e.type==='cameraReport')showCameraReport(e.frame.camera);
  else if(e.type==='puzzle')puzzle(e.task);
  else if(e.type==='dialog')dialog(e.task);
  else if(e.type==='archive'){returnTo='game';open('archive',header('Archive retrouvée',e.archive.title)+`<p class="lede">${esc(e.archive.text)}</p><p class="fine">Note originale de l’adaptation, pas une citation de la série.</p><div class="actions"><button class="primary" data-act="close">Refermer le dossier</button></div>`);}
  else if(e.type==='goal'){notify(e.text+' — terminé.');sound('goal');}
  else if(e.type==='chapterEnd')chapterEnd(e.chapter);
  else if(e.type==='chapterStart')briefing();
  else if(e.type==='finished')finished();
  else if(e.type==='dead')dead();
  else if(e.type==='sound')sound(e.kind);
 }
 updateHud();
}
function exportFieldReport(){
 if(!started){notify('Commencez une campagne avant de produire un rapport.');return;}
 const data=engine.fieldReport(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='ALIEN_EARTH_RAPPORT_TERRAIN_V9.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);notify('Rapport de terrain exporté. Ce fichier n’est pas une sauvegarde.');
}
function exportSave(){
 if(started&&engine.dead){notify('Reprenez au point sûr avant d’exporter.');return;}
 const data=started?engine.snapshot():saved;if(!data){notify('Commencez une campagne avant d’exporter.');return;}
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ALIEN_EARTH_SAUVEGARDE.json';document.body.append(a);try{a.click();}finally{a.remove();}setTimeout(()=>URL.revokeObjectURL(url),5000);notify('Sauvegarde exportée.');
}
function updateHud(){
 $('chapterLabel').textContent=String(engine.state.chapter+1).padStart(2,'0')+' / '+engine.chapter.subtitle;
 $('roomLabel').textContent=engine.room.title;$('povLabel').textContent=engine.character.name;
 $('healthBar').style.width=(engine.player.hp/engine.character.health*100)+'%';$('energyBar').style.width=engine.player.energy+'%';
 $('ammoLabel').textContent=engine.character.weapon==='none'?(engine.weaponId==='cutter'?engine.weaponCaption:engine.state.resonance?'RÉSONANCE':''):(['ksg-al','cutter'].includes(engine.weaponId)?engine.weaponCaption:(engine.reloadTime>0?'RECHARGE':engine.player.ammo+' / '+engine.player.reserve));
 const done=engine.state.completed.includes(engine.room.task.id);$('objectiveLabel').textContent=(engine.room.optional?'Facultatif · ':'')+(done?'✓ ':'')+engine.room.task.label;
 if($('guideLabel')){const path=engine.routeToTracked();$('guideLabel').textContent=engine.state.trackedRoom?engine.state.trackedRoom===engine.room.id?'Repère atteint · '+engine.room.title:path?.length?'→ '+ROOM_BY_ID[path[0].to].title+(path[0].hatch?' · dévisser la grille':path[0].sealed?' · ouvrir le verrou':''):'Repère bloqué par un prérequis':'';}
 $('ammoLabel').title=engine.weaponCaption;
 $('gearLabel').textContent='U '+engine.state.inventory.care+' · B '+engine.state.inventory.decoys+' · ⚙ '+engine.state.parts+' · ⌑ '+engine.state.inventory.capsules;
 $('situationLabel').textContent=engine.serviceAction?engine.serviceAction.label+' '+Math.floor(engine.serviceAction.time/engine.serviceAction.duration*100)+' %':engine.carrying?'PORTE : '+engine.survivorDef(engine.carrying.id).name:engine.scanProgress?'Relevé '+Math.round(engine.scanProgress.time/3*100)+' %':engine.actionV3?'VERROU '+Math.round(engine.actionV3.time*100)+' %':engine.listenWork&&!engine.listenWork.done?'ÉCOUTE…':engine.calmWork&&!engine.calmWork.done?'RASSURER…':engine.hidden?'DISSIMULÉ':engine.state.lightOn?'TORCHE ALLUMÉE':'';
 const nearest=engine.nearestInteraction(),door=engine.nearestDoor();$('interactionLabel').textContent=engine.serviceAction?'Maintenez '+({interact:'E',repair:'M',carry:'P',sensor:'1'}[engine.serviceAction.key])+' · '+engine.serviceAction.label:engine.carrying?'P · Déposer / E · Porte':door?.hatchKey?(engine.hatchOpen(door)?'E · Passer accroupi / G · Écouter':'E maintenu · Dévisser la grille'):door?'E · Porte / X · Verrou / M · Réparer / G · Écouter':nearest?'E · '+nearest.label:(engine.state.presentation==='CLASSIC'?'Q/D · passages ↕ · E interagir':'Q/D · Z/S · E interagir');
}
function keyAction(code,repeat=false){
 if(modal){if(code==='Escape'&&!repeat)close();return;}
 if(code==='Escape'){showPause();return;}
 if(code==='Tab'){returnTo='game';showMap();return;}
 if(code==='Digit2'&&!repeat){showSensors();return;}
 if(code==='Digit1'&&!repeat)engine.startSensorDeploy();
 if(code==='Digit5'){returnTo='game';showFidelity();return;}
 if(code==='Digit6'&&!repeat)engine.cycleWeapon();
 if(code==='Digit7'&&!repeat)engine.fireFoam();
 if(code==='Digit4'){returnTo='game';showSecurity();return;}
 if(code==='Digit3'){returnTo='game';showInvestigations();return;}
 if(code==='KeyO'){returnTo='game';showJournal();return;}
 if(code==='KeyI'){returnTo='game';showBag();return;}
 if(code==='KeyK'){returnTo='game';showCodex();return;}
 if(code==='F6'&&!repeat){engine.setPresentation(engine.state.presentation==='CLASSIC'?'HYBRID':'CLASSIC');notify(engine.state.presentation==='CLASSIC'?'Vue classique · changements de plan aux passages ↕.':'Vue hybride · profondeur adaptée à chaque pièce.');}
 if(code==='KeyE'&&!repeat)engine.interact();
 if(code==='KeyX'&&!repeat)engine.startSeal();
 if(code==='KeyM'&&!repeat)engine.startRepair();
 if(code==='KeyP'&&!repeat)engine.startCarry();
 if(code==='KeyH'&&!repeat)engine.commandSurvivors('follow');
 if(code==='KeyY'&&!repeat)engine.commandSurvivors('wait');
 if(code==='KeyF'&&!repeat)engine.tool();
 if(code==='KeyJ')engine.fire();
 if(code==='KeyR'&&!repeat)engine.reload();
 if(code==='KeyV'&&!repeat)engine.resonate();
 if(code==='KeyL'&&!repeat){engine.state.lightOn=!engine.state.lightOn;notify(engine.state.lightOn?'Torche allumée.':'Torche éteinte.');}
 if(code==='KeyB'&&!repeat)engine.throwDecoy();
 if(code==='KeyU'&&!repeat)engine.useCare();
 if(engine.state.presentation==='CLASSIC'&&!repeat){if(['KeyW','KeyZ','ArrowUp'].includes(code))engine.laneMove(-1);if(['KeyS','ArrowDown'].includes(code))engine.laneMove(1);}
 handleEvents();
}
document.addEventListener('keydown',event=>{
 if(modal){
  if(event.code==='Escape'){event.preventDefault();close();}
  if(event.code==='Tab'){
   const focusables=[...$('panel').querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])')];const first=focusables[0],end=focusables.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();end?.focus();}else if(!event.shiftKey&&document.activeElement===end){event.preventDefault();first?.focus();}
  }return;
 }
 if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;
 if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','F6'].includes(event.code))event.preventDefault();
 keys.add(event.code);keyAction(event.code,event.repeat);
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(started&&!modal&&!engine.state.finished)showPause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(started&&!modal&&!engine.state.finished)showPause();save();}});
window.addEventListener('pagehide',()=>{if(started&&!engine.dead)save();});
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;sound('click');
 if(a==='host'){returnHostV12();return;}
 if(a==='hostForce'){returnHostV12(true);return;}
 if(a==='fidelity'){showFidelity(b.dataset.tab||'places');return;}
 if(a==='switchGear'){close();engine.cycleWeapon();handleEvents();return;}
 if(a==='foam'){close();engine.fireFoam();handleEvents();return;}
 if(a==='investigations')showInvestigations();
 else if(a==='investigationOpen')showInvestigation(b.dataset.dossier,false);
 else if(a==='investigationTerminal'){if(engine.openInvestigationAtTerminal(b.dataset.dossier))handleEvents();else notify('Rejoignez le terminal de ce secteur.');}
 else if(a==='investigationReset'){investigationAnswer=['','',''];showInvestigation(investigationId,engine.pending?.type==='investigation-v8');}
 else if(a==='investigationQueue'){
  if(engine.queueInvestigation(investigationId,investigationAnswer,b.dataset.channel))resume();
  else {const status=$('associationStatus');if(status)status.textContent='Association ou conditions non conformes. Relisez les trois sources ; aucun document n’a été consommé.';}
  handleEvents();
 }
 else if(a==='objectives')showObjectives();
 else if(a==='objectiveFilter'){objectiveFilter=b.dataset.filter;showObjectives();}
 else if(a==='archiveIndex')showArchiveIndex();
 else if(a==='reviewArchive')reviewOwnedArchive(b.dataset.archive);
 else if(a==='fieldReport')showFieldReport(b.dataset.chapter||engine.chapter.id);
 else if(a==='exportFieldReport')exportFieldReport();
 else if(a==='new')newGame();else if(a==='confirmNew')beginNew();else if(a==='continue')continueGame();
 else if(a==='sensors')showSensors();
 else if(a==='sensorDeploy'){engine.cancelInteraction();if(engine.startSensorDeploy('interact'))resume();handleEvents();}
 else if(a==='sensorRecover'){engine.cancelInteraction();if(engine.queueSensorRecover(b.dataset.unit))resume();handleEvents();}
 else if(a==='sensorCharge'){if(engine.queueSensorRecharge(b.dataset.unit))resume();handleEvents();}
 else if(a==='sensorPulse'){engine.cancelInteraction();if(engine.queueSensorPulse(b.dataset.unit))resume();handleEvents();}
 else if(a==='sensorTrack'){engine.trackRoom(b.dataset.room);engine.cancelInteraction();handleEvents();showMap();}
 else if(a==='containQueue'){if(engine.queueContainment(b.dataset.kind,b.dataset.preset))resume();handleEvents();}
 else if(a==='containConfirm')showContainment(EARTH_DATA.containmentPads.find(p=>p.id===b.dataset.pad),true);
 else if(a==='containBack')showContainment(EARTH_DATA.containmentPads.find(p=>p.id===b.dataset.pad));
 else if(a==='containRegister')showContainmentRegister();
 else if(a==='containTrack'){engine.trackRoom(b.dataset.room);handleEvents();showMap();}
 else if(a==='security')showSecurity();
 else if(a==='securityOpen'){engine.openSecurity(b.dataset.id);handleEvents();}
 else if(a==='securityQueue'){if(engine.queueSecurity(b.dataset.id,b.dataset.kind))resume();handleEvents();}
 else if(a==='serviceQueue'){if(engine.queueService(b.dataset.kind,b.dataset.value))resume();handleEvents();}
 else if(a==='cameraReview'){engine.cancelInteraction();showCameraReport(b.dataset.camera);}
 else if(a==='cameraTrack'){engine.trackRoom(b.dataset.room);engine.cancelInteraction();handleEvents();showMap();}
 else if(a==='title'){if(started&&!engine.dead)save();showTitle();}
 else if(a==='start'||a==='resume'){if(engine.state.finished){finished();return;}if(!started){showTitle();return;}returnTo='game';resume();}
 else if(a==='close')close();else if(a==='pause')showPause();else if(a==='map'){if(modal==='title')returnTo='title';else if(started)returnTo='game';showMap();}
 else if(a==='bag')showBag();else if(a==='useCare'){engine.useCare();handleEvents();showBag();}
 else if(a==='journal')showJournal();else if(a==='track'){engine.trackRoom(b.dataset.room);handleEvents();showMap();}else if(a==='order'){engine.commandSurvivors(b.dataset.order);handleEvents();showBag();}
 else if(a==='chapters')showChapters();else if(a==='options'||a==='help')options();else if(a==='briefing')briefing();
 else if(a==='codex'){if(!modal&&started)returnTo='game';showCodex();}
 else if(a==='codexTab')showCodex(b.dataset.tab,0);else if(a==='codexItem')showCodex(codexTab,Number(b.dataset.index));
 else if(a==='export')exportSave();else if(a==='import')$('importFile').click();
 else if(a==='dialogChoice'){if(engine.resolveDialog(Number(b.dataset.choice)))resume();handleEvents();}
 else if(a==='switch'){const i=Number(b.dataset.index);puzzleAnswer[i]=1-puzzleAnswer[i];b.dataset.on=String(puzzleAnswer[i]);b.querySelector('small').textContent=puzzleAnswer[i]?'Alimenté':'Coupé';}
 else if(a==='tone'){if(puzzleAnswer.length<3)puzzleAnswer.push(Number(b.dataset.tone));$('puzzleResult').textContent='Votre lecture : '+puzzleAnswer.map(x=>x+1).join(' → ');}
 else if(a==='resetPuzzle'){puzzleAnswer=[];$('puzzleResult').textContent='En attente du premier signal.';}
 else if(a==='submitPuzzle'){if(engine.resolvePuzzle(puzzleAnswer))resume();else if($('puzzleResult'))$('puzzleResult').textContent='Lecture non conforme. Vérifiez le motif ou la consigne.';handleEvents();}
 else if(a==='staySector'){engine.cancelInteraction();resume();}
 else if(a==='nextChapter'){engine.advanceChapter();handleEvents();}
 else if(a==='retry'){engine.restartCheckpoint();resume();handleEvents();}
});
document.addEventListener('change',event=>{
 if(event.target.dataset.proofSlot!==undefined){investigationAnswer[Number(event.target.dataset.proofSlot)]=event.target.value;const s=$('associationStatus');if(s)s.textContent='Association modifiée. Relisez les sources avant de préparer la conservation.';}
 if(event.target.id==='presentation'){engine.setPresentation(event.target.value);handleEvents();}
 if(event.target.id==='difficulty'){engine.state.difficulty=event.target.value;if(started)save();}
 if(event.target.id==='audio'){audioOn=event.target.checked;sound('goal');}
 if(event.target.id==='reduced'){reduced=event.target.checked;renderer.reduced=reduced;}
});
$('importFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>250000){notify('Fichier trop volumineux.');return;}
 try{
  const state=sanitizeSave(await file.text());saved=state;engine=new EarthEngine(state);started=true;protectSave=false;saveError='';try{lastStoredRaw=localStorage.getItem(SAVE_KEY);}catch{}renderer.lastRoom=null;save();returnTo='game';if(engine.state.finished)finished();else showPause();notify('Sauvegarde importée.');
 }catch(error){notify(error.message);}
});
for(const b of document.querySelectorAll('[data-hold]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(modal)return;b.setPointerCapture(e.pointerId);keys.add(b.dataset.hold);keyAction(b.dataset.hold);});
 const stop=()=>keys.delete(b.dataset.hold);b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);
}
function frame(now){
 const dt=Math.min(.05,(now-(last||now))/1000);last=now;
 if(!modal&&started){
  const k=(...codes)=>codes.some(c=>keys.has(c));
  engine.update(dt,{x:(k('KeyD','ArrowRight')?1:0)-(k('KeyA','KeyQ','ArrowLeft')?1:0),z:(k('KeyS','ArrowDown')?1:0)-(k('KeyW','KeyZ','ArrowUp')?1:0),crouch:k('KeyC'),sprint:k('ShiftLeft','ShiftRight'),interact:k('KeyE'),scan:k('KeyN'),seal:k('KeyX'),listen:k('KeyG'),calm:k('KeyT'),repair:k('KeyM'),carry:k('KeyP'),sensor:k('Digit1')});
  if(k('KeyJ'))engine.fire();handleEvents();saveClock+=dt;if(saveClock>25){saveClock=0;save();}
 }
 renderer.draw(engine,dt);hudClock+=dt;if(hudClock>.15){updateHud();hudClock=0;}
 requestAnimationFrame(frame);
}
// The inspection harness is opt-in, absent from normal game menus. It is not a gameplay shortcut.
if(new URLSearchParams(location.search).get('qa')==='1'||document.documentElement.dataset.earthQa==='1'){
 window.__EARTH_QA={
  state:()=>engine.snapshot(),engine:()=>engine,data:EARTH_DATA,
  loadRoom:(id)=>{const room=ROOM_BY_ID[id];if(!room)throw new Error('Unknown room');const s=newState();s.chapter=EARTH_DATA.chapters.findIndex(c=>c.id===room.chapter);s.room=id;s.completed=EARTH_DATA.chapters.slice(0,s.chapter).flatMap(c=>c.goals);s.resonance=s.completed.includes('AE-15');s.player.hp=EARTH_DATA.characters.find(c=>c.id===EARTH_DATA.chapters[s.chapter].pov).health;s.visited=[id];if(room.duct){const h=room.portals.find(p=>p.hatchKey);s.completed=[...new Set([...s.completed,...(h.requires||[])])];s.ducts.opened.push(h.hatchKey);s.player.x=140;s.player.z=125;}engine=new EarthEngine(s);started=true;protectSave=true;returnTo='game';renderer.lastRoom=null;resume();return engine.snapshot();},
  place:(x,z)=>{engine.player.x=x;engine.player.z=z;renderer.resetCamera(engine);updateHud();},
  pause:()=>showPause(),codex:()=>showCodex(),events:()=>handleEvents(),
  freeze:()=>{modal='qa-capture';$('overlay').hidden=true;},resume:()=>resume(),
  interact:()=>{const out=engine.interact();handleEvents();return out;}
 };
}
showTitle();updateHud();requestAnimationFrame(frame);

function serviceStrip(){
 const n=engine.network,mode=EARTH_DATA.powerModes.find(m=>m.id===engine.powerMode());
 return `<section class="service-summary"><div><small>${esc(n.id)} · RÉSEAU LOCAL</small><h3>${esc(mode.label)}</h3></div><div class="circuit-badges">${[['light','Éclairage'],['extraction','Extraction'],['surveillance','Surveillance']].map(([id,label])=>`<span class="${engine.channelOn(id)?'on':'off'}">${engine.channelOn(id)?'●':'○'} ${label}</span>`).join('')}</div><p>Pièces détachées : <b>${engine.state.parts}/24</b> · Répartiteur : ${esc(ROOM_BY_ID[n.cabinetRoom].title)}</p></section>`;
}
function cameraDiagram(frame){
 const cam=EARTH_DATA.cameras.find(c=>c.id===frame.camera),r=ROOM_BY_ID[frame.room];
 const left=Math.max(35,cam.x-cam.range),right=cam.x+50,span=right-left,sx=x=>40+(x-left)/span*820,sy=z=>52+(z-25)/200*218;
 let shapes='';
 const solids=[...r.props.filter(p=>p.solid),...(frame.closedGate&&r.gate?[r.gate]:[])];
 for(const p of solids)if(p.x+p.w>left&&p.x<right)shapes+=`<rect x="${sx(p.x)}" y="${sy(p.z)}" width="${p.w/span*820}" height="${Math.max(4,p.d/200*218)}" class="camera-obstacle"/>`;
 const points=frame.points.map(p=>`<g transform="translate(${sx(p.x)},${sy(p.z)})"><circle r="${p.heavy?10:7}" class="camera-${p.type}"/><path d="M-15 0H15 M0-15V15" class="camera-cross"/><text y="-20" text-anchor="middle">${p.type==='person'?'PERSONNE':p.confined?'ENCEINTE':p.heavy?'FORME LONGUE':'MOUVEMENT'}</text></g>`).join('');
 return `<svg class="camera-diagram" viewBox="0 0 900 320" role="img" aria-label="Relevé tactique ponctuel de la caméra : obstacles et présences dans son champ"><defs><clipPath id="camclip"><rect x="40" y="38" width="820" height="246"/></clipPath><pattern id="camgrid" width="41" height="22" patternUnits="userSpaceOnUse"><path d="M41 0H0V22" fill="none" stroke="#607d7130"/></pattern></defs><rect x="40" y="38" width="820" height="246" fill="url(#camgrid)"/><g clip-path="url(#camclip)">${shapes}${points}</g><path d="M${sx(cam.x)} 155 l-16 -12v24Z" fill="#dfc794"/><text x="42" y="21">${esc(frame.camera)} / CHAMP BORNE / ${frame.powered?'LUMIERE DISPONIBLE':'VISION DE SERVICE'}</text><text x="42" y="305">RECONSTRUCTION TACTIQUE · RELEVE FIGE · PAS DE VIDEO CONTINUE</text></svg>`;
}
function showCameraReport(id){
 const f=engine.state.cameraFrames[id];if(!f)return;
 returnTo='game';const age=Math.max(0,Math.floor(engine.state.playSeconds-f.time));
 open('cameraReport',header('SURVEILLANCE · ACQUISITION PONCTUELLE',ROOM_BY_ID[f.room].title)+`<div class="camera-readout"><span>${esc(id)}</span><strong>Relevé de ${age} s</strong><span>${f.points.length} trace${f.points.length>1?'s':''} dans le champ</span></div>${cameraDiagram(f)}<p>Ce relevé reflète les positions au moment de l’acquisition. Les meubles masquent la vue ; une présence hors champ n’est pas signalée. Les pièces hors écran ne sont pas simulées en continu, sauf les poursuites déjà engagées.</p><div class="actions"><button class="primary" data-act="resume">Retour au terrain</button><button data-act="cameraTrack" data-room="${f.room}">Suivre cette pièce sur la carte</button></div>`,'camera-panel');
}
function showServicePanel(station){
 returnTo='game';let body='';
 if(station.kind==='powercab'){
  body=`<p>Deux départs peuvent fonctionner ensemble. La sélection prépare la manœuvre ; elle ne commute rien tant que vous n’avez pas maintenu <b>E pendant 2,5 secondes sur place</b>.</p><div class="service-options">${EARTH_DATA.powerModes.map(m=>`<article class="${m.id===engine.powerMode()?'current':''}"><small>${m.id===engine.powerMode()?'EN SERVICE':'REPARTITION POSSIBLE'}</small><h3>${esc(m.label)}</h3><p>${esc(m.description)}</p><button data-act="serviceQueue" data-kind="switch" data-value="${m.id}" ${m.id===engine.powerMode()?'disabled':''}>Préparer ${esc(m.label.toLowerCase())}</button></article>`).join('')}</div><p class="fine">Les verrous manuels et les tâches principales restent utilisables. La lumière naturelle n’est pas coupée. Une panne du récit ne se répare pas par simple répartition.</p>`;
 }else if(station.kind==='workbench'){
  body=`<p>L’assemblage se termine sur l’établi, pas dans ce menu. Relâcher E, bouger ou subir un impact interrompt le travail sans consommer de pièces.</p><div class="service-options workshop">${EARTH_DATA.recipes.map(r=>`<article><small>${r.cost} PIECES · ${r.duration.toLocaleString('fr-FR')} S</small><h3>${esc(r.label)}</h3><p>Réserve : ${engine.state.inventory[r.item]}/${r.capacity||9}</p><button data-act="serviceQueue" data-kind="craft" data-value="${r.id}" ${engine.state.parts<r.cost||engine.state.inventory[r.item]>=(r.capacity||9)?'disabled':''}>Préparer l’assemblage</button></article>`).join('')}</div>${sensorWorkbench()}<p class="fine">M tenu 3,5 secondes au seuil répare aussi une barre usée ou rompue : trois pièces et un remplacement autorisé par porte.</p>`;
 }else{
  body=`<p>Alimentez le départ Surveillance, puis maintenez <b>E pendant 1,5 seconde au terminal</b> pour une acquisition. Les anciennes images restent consultables même après une coupure.</p><div class="service-options workshop">${engine.network.cameraIds.map(id=>{const c=EARTH_DATA.cameras.find(c=>c.id===id),f=engine.state.cameraFrames[id];return `<article><small>${id} · ${engine.channelOn('surveillance')?'DISPONIBLE':'HORS LIGNE'}</small><h3>${esc(c.label)}</h3><p>Portée bornée · obstacles masquants.</p><button data-act="serviceQueue" data-kind="capture" data-value="${id}" ${engine.channelOn('surveillance')?'':'disabled'}>Préparer l’acquisition</button>${f?`<button data-act="cameraReview" data-camera="${id}">Dernier relevé (${Math.floor(engine.state.playSeconds-f.time)} s)</button>`:''}</article>`;}).join('')}</div>`;
 }
 open('service',header(engine.network.id+' · INFRASTRUCTURE',station.label)+serviceStrip()+investigationTerminalEntry(station)+securityTerminalEntry(station)+body+`<div class="actions"><button data-act="close">Refermer le tableau</button></div>`,'service-panel');
}


function containmentSummary(){
 const records=Object.values(engine.state.containment.records),sealed=Object.values(engine.state.containment.pads).filter(p=>p.status==='sealed').length;
 return `<div class="containment-metrics"><span><b>${engine.state.inventory.capsules}/4</b> cartouches</span><span><b>${sealed}</b> enceintes occupées</span><span><b>${records.filter(r=>r.studied).length}</b> études uniques</span></div>`;
}
function showContainment(pad,confirmRelease=false){
 returnTo='game';const p=engine.podState(pad.id),record=engine.state.containment.records[p.sample];
 let body='';
 if(confirmRelease){
  body=`<div class="alert"><b>Le spécimen redeviendra une menace.</b><p>La cartouche ne sera pas rendue. La commande prépare l’ouverture ; il faudra ensuite maintenir E pendant deux secondes sur place.</p></div><div class="actions"><button data-act="containQueue" data-kind="release" class="danger-action">Préparer la libération</button><button data-act="containBack" data-pad="${pad.id}">Garder l’enceinte fermée</button></div>`;
 }else if(p.status==='sealed'){
  const cr=EARTH_DATA.creatures.find(c=>c.id===record?.kind);
  body=`<div class="specimen-display"><div class="specimen-symbol" aria-hidden="true">${p.preset==='flyer'?'⋈':'⋇'}</div><div><small>IDENTITÉ ${esc(p.sample)} · RÉSISTANCE ${Math.ceil(p.integrity)} %</small><h3>${esc(cr?.name)}</h3><p>${record?.studied?'Étude déjà conservée pour cette identité.':'Observer sous enceinte demande trois secondes immobiles et exposées.'}</p></div></div><p>Le spécimen ne patrouille plus, mais les autres menaces restent actives sur le terrain. Un Xénomorphe peut briser l’enceinte.</p><div class="actions"><button data-act="containQueue" data-kind="study" class="primary" ${record?.studied?'disabled':''}>Préparer l’étude</button><button data-act="containConfirm" data-pad="${pad.id}">Libérer le spécimen…</button></div>`;
 }else if(p.status==='armed'){
  body=`<h3>Appât actif · ${Math.max(0,Math.ceil(p.expiresAt-engine.time))} secondes</h3><p>Réglage : ${p.preset==='flyer'?'Volants (Mouche)':'Rampeurs (Tique / Facehugger)'}. Attirez la bonne créature dans la bande du plateau ; elle doit y rester 0,8 seconde.</p><p class="fine">L’appât peut aussi attirer un organisme incompatible. Le menu suspend la simulation, mais n’efface pas une poursuite.</p><div class="actions"><button data-act="resume" class="primary">Se remettre à couvert</button><button data-act="containQueue" data-kind="recover" ${engine.state.inventory.capsules>=4?'disabled':''}>Préparer le démontage</button></div>`;
 }else if(p.status==='broken'){
  body='<div class="alert">Le châssis est rompu. Il ne peut plus être armé dans cette campagne.</div>';
 }else{
  body=`<p>Une cartouche et deux secondes de travail exposé. L’appât fonctionne pendant 45 secondes ; seule une présence continue dans la bonne bande déclenche la capture.</p><div class="service-options">${EARTH_DATA.containmentPresets.map(preset=>`<article><small>1 CARTOUCHE · 2 S</small><h3>${esc(preset.label)}</h3><p>${esc(preset.description)}</p><button class="primary" data-act="containQueue" data-kind="arm" data-preset="${preset.id}" ${engine.state.inventory.capsules<=0?'disabled':''}>Préparer ${esc(preset.label.toLowerCase())}</button></article>`).join('')}</div>${pad.tutorial?`<div class="calibration-box"><h3>Apprendre sans gaspiller</h3><p>Calibration à vide en 1,5 seconde, sans ennemi ajouté ni cartouche consommée. Le chapitre de réveil reste un espace d’apprentissage.</p><button data-act="containQueue" data-kind="calibrate">Préparer la calibration</button></div>`:''}`;
 }
 open('containment',header('CONFINEMENT LOCAL · DISPOSITIF ORIGINAL',pad.label)+containmentSummary()+body+`<div class="actions"><button data-act="investigations">Enquêtes</button><button data-act="objectives">Objectifs</button><button data-act="fieldReport">Bilans</button><button data-act="archiveIndex">Documents retrouvés</button><button data-act="security">Sentinelles · 4</button><button data-act="sensors">Récepteur de sondes</button><button data-act="containRegister">Consulter le registre</button><button data-act="close">Refermer le tableau</button></div>`,'containment-panel');
}
function showContainmentRegister(){
 if(!started){showTitle();return;}returnTo='game';engine.cancelInteraction();
 const recs=Object.values(engine.state.containment.records).sort((a,b)=>b.first-a.first),labels={sealed:'Confiné',released:'Libéré',escaped:'Enceinte rompue'};
 const studies={facehugger:'Les déplacements cessent lorsque le filet retient le corps. La phase parasitaire n’est pas simulée à travers cette enceinte. Une libération restitue le même risque de bond.',tick:'L’enveloppe est immobilisée sans effacer les traces de danger déposées auparavant. Le filet mécanique est une convention de cette adaptation, pas un dispositif attesté à l’écran.',fly:'L’enceinte filtre les projections du spécimen tant qu’elle reste fermée. Les jets déjà tirés et les résidus extérieurs ne disparaissent pas. Le vol demeure une abstraction sur le plan de jeu.'};
 open('containRegister',header('TRAÇABILITÉ DES RENCONTRES','Registre de confinement')+containmentSummary()+`<p>Chaque ligne correspond à une identité de rencontre du jeu, pas à un nouvel individu canonique. Capturer puis libérer plusieurs fois ne multiplie pas les études.</p><div class="specimen-records">${recs.length?recs.map(rec=>`<article class="specimen-record"><div><small>${esc(rec.id)} · ${labels[rec.lastStatus]||'Relevé'} · ${Math.floor(rec.first/60)}:${String(Math.floor(rec.first%60)).padStart(2,'0')}</small><h3>${esc(EARTH_DATA.creatures.find(c=>c.id===rec.kind)?.name)}</h3><p>${esc(ROOM_BY_ID[rec.room].title)} · ${esc(rec.pad)}</p></div><div><strong>${rec.studied?'Étude conservée':'Étude à effectuer'}</strong><p>${rec.studied?esc(studies[rec.kind]):'E au plateau scellé, puis maintenir E trois secondes.'}</p>${ROOM_BY_ID[rec.room].chapter===engine.chapter.id?`<button data-act="containTrack" data-room="${rec.room}">Suivre le lieu du relevé</button>`:''}</div></article>`).join(''):'<p class="empty-register">Aucun spécimen confiné. Les plateaux se trouvent sur la carte du secteur ; les établis assemblent les cartouches.</p>'}</div><p class="fine">Les études ci-dessus sont des observations originales de l’adaptation. Hors écran, les enceintes occupées restent inertes.</p><div class="actions"><button data-act="resume" class="primary">Revenir au terrain</button><button data-act="map">Carte du secteur</button></div>`,'containment-register');
}

// V6 receiver: finite, dated, anonymous measurements. The menu is paused, not a live radar.
function sensorObservation(d) {
 const f=d.received;
 if(!f)return '<p class="sensor-observation">Aucun relevé reçu. La mesure commence après la pose.</p>';
 const age=Math.max(0,Math.floor(engine.time-f.time)),label={movement:'Mouvement mesuré',quiet:'Pas de mouvement mesuré',unknown:'Pièce non observée'}[f.result];
 return `<div class="sensor-observation ${f.result}"><strong>${label}</strong><small>RELEVÉ IL Y A ${age} S · ${f.scope==='local'?'PIÈCE CHARGÉE':f.scope==='partial'?'POURSUITES SEULEMENT':'HORS ÉCRAN'}</small><div class="sensor-directions" aria-label="Direction approximative du mouvement">${[['left','Gauche'],['near','Proche'],['right','Droite']].map(([id,l])=>`<span class="${f.directions.includes(id)?'detected':''}">${f.directions.includes(id)?'●':'—'} ${l}</span>`).join('')}</div></div>`;
}
function sensorWorkbench(){
 return `<section class="sensor-workbench"><h3>Entretien des sondes</h3><p>Deux pièces et trois secondes de travail. Apportez l’appareil ; au moins vingt secondes d’autonomie doivent avoir été consommées. Pas de récupération à distance.</p><div class="service-options">${Object.values(engine.state.sensors.units).map(d=>`<article><small>${d.id} · ${d.status==='carried'?'DANS LE SAC':'LAISSÉE SUR LE TERRAIN'}</small><h3>${Math.ceil(d.battery)} / 180 s</h3><button data-act="sensorCharge" data-unit="${d.id}" ${d.status!=='carried'||d.battery>160||engine.state.parts<2?'disabled':''}>Préparer le reconditionnement</button></article>`).join('')}</div></section>`;
}
function sensorMapLine(room){
 const devices=Object.values(engine.state.sensors.units).filter(d=>d.status==='deployed'&&d.room===room);
 return devices.length?`<p class="sensor-map-note">Sondes déposées : ${devices.map(d=>esc(d.id)).join(' · ')} · lieu connu, pas position d’une créature</p>`:'';
}
function sensorDepartureWarning(){
 const left=Object.values(engine.state.sensors.units).filter(d=>d.status==='deployed'&&ROOM_BY_ID[d.room].chapter===engine.chapter.id);
 return left.length?`<div class="alert sensor-departure"><b>${left.length} sonde${left.length>1?'s':''} encore sur le terrain.</b><p>${left.map(d=>`${d.id} — ${esc(ROOM_BY_ID[d.room].title)}`).join('<br>')}. Le transfert quitte le secteur. Ces appareils ne reviendront pas automatiquement dans votre sac.</p></div>`:'';
}
function showSensors(focusId=null){
 if(!started){showTitle();return;}returnTo='game';engine.cancelInteraction();
 const units=Object.values(engine.state.sensors.units),names={movement:'Mouvement non identifié',quiet:'Plus de mouvement mesuré',unknown:'Zone non observée'};
 const cards=units.map(d=>{
  const link=engine.sensorLink(d.id),local=d.room===engine.room.id,field=d.status==='deployed',nearby=field&&local&&Math.abs(d.x-engine.player.x)<=86&&Math.abs(d.z-engine.player.z)<=31;
  return `<article class="sensor-card ${focusId===d.id?'selected':''}"><div class="sensor-card-head"><span class="sensor-unit-icon" aria-hidden="true">⌁</span><div><small>UNITÉ RÉUTILISABLE</small><h3>${d.id}</h3></div><span class="sensor-link ${link.ok?'linked':''}">${esc(link.reason)}</span></div><p class="sensor-location">${field?esc(ROOM_BY_ID[d.room].title):'Dans votre équipement'}</p><div class="sensor-battery"><meter min="0" max="180" value="${d.battery}" aria-label="Autonomie de ${d.id}"></meter><b>${Math.ceil(d.battery)} s</b></div><p class="fine">${field?'Autonomie calculée au temps de simulation.':'La réserve est conservée dans le sac, sans recharge passive.'}</p>${field?sensorObservation(d):'<p>Pose : <b>1 maintenu</b> sur un emplacement dégagé. La sonde reste traversable.</p>'}<div class="sensor-actions">${nearby?`<button data-act="sensorRecover" data-unit="${d.id}" class="primary">Préparer la récupération</button>`:''}${field?`<button data-act="sensorPulse" data-unit="${d.id}" ${engine.sensorPulseAllowed(d.id)?'':'disabled'}>Émettre un leurre · 25 s</button>`:''}${field&&ROOM_BY_ID[d.room].chapter===engine.chapter.id?`<button data-act="sensorTrack" data-room="${d.room}">Suivre la sonde</button>`:''}</div>${field?`<p class="fine">Émission : uniquement dans la pièce chargée, quatre secondes, douze secondes de délai. La simulation reprend dès la commande ; aucune créature n’est déplacée instantanément.</p>`:''}</article>`;
 }).join('');
 const history=engine.state.sensors.history.slice(-12).reverse();
 open('sensors',header('TERRAIN · MESURES LOCALES ET DATÉES','Récepteur de proximité')+`<p class="sensor-intro">Un passage n’est pas une identification. Vos propres déplacements et ceux des compagnons peuvent aussi déclencher les sondes. <b>Temps suspendu : les relevés restent figés pendant cette consultation.</b></p><div class="sensor-grid">${cards}</div><div class="actions"><button data-act="sensorDeploy" ${units.some(d=>d.status==='carried'&&d.battery>0)&&engine.handsFree(true)?'':'disabled'}>Préparer une pose · E maintenu</button><button data-act="resume" class="primary">Retour au terrain</button></div><details class="sensor-contract"><summary>Portée, obstacles et pièces hors écran</summary><p>460 unités autour du capteur, visibilité masquée par le mobilier et les cloisons. Le récepteur atteint deux portes intérieures accessibles et ouvertes au maximum. Une barre fermée peut couper le relais.</p><p>Hors écran, seuls les trajets de poursuite déjà engagés alimentent une mesure partielle. Les autres habitants restent dormants : le récepteur affiche alors « non observée », jamais « sûre ». Les chapitres ne sont pas reliés par radio.</p></details><section class="sensor-history"><h3>Dernières observations reçues</h3>${history.length?history.map(h=>`<div><small>${h.unit} · ${Math.floor(h.time/60)}:${String(Math.floor(h.time%60)).padStart(2,'0')}</small><p>${esc(names[h.result])} — ${esc(ROOM_BY_ID[h.room].title)}</p></div>`).join(''):'<p>Pas encore de mesure transmise. Les quarante derniers événements sont conservés dans la sauvegarde.</p>'}</section>`,'sensor-panel');
}

// V8 evidence board. Texts are displayed only after physical collection; terminal authority stays in the engine.
function investigationTerminalEntry(station){
 if(station.kind!=='cameraConsole')return '';
 const d=EARTH_DATA.investigations.find(d=>d.station===station.id);if(!d)return '';
 const info=engine.investigationInfo(d.id);
 return `<section class="evidence-terminal"><div><small>RECROUPEMENT DOCUMENTAIRE · FACULTATIF</small><h3>${esc(d.title)}</h3><p>${info.owned.length}/3 sources retrouvées · ${info.decision?'décision déjà conservée':'aucun document requis par la campagne principale'}</p></div><button data-act="investigationTerminal" data-dossier="${d.id}">Ouvrir l’enquête au terminal</button></section>`;
}
function showInvestigations(){
 if(!started){showTitle();return;}returnTo='game';engine.cancelInteraction();
 const ds=EARTH_DATA.investigations.filter(d=>EARTH_DATA.chapters.findIndex(c=>c.id===d.chapter)<=engine.state.chapter);
 open('investigations',header('DOCUMENTS RETROUVÉS · AUCUNE PREUVE AUTOMATIQUE','Les preuves qu’on garde')+`<p class="lede">Trois documents, trois rôles à relier. Une conclusion ne remplace jamais un sauvetage.</p><div class="dossier-grid">${ds.map(d=>{const i=engine.investigationInfo(d.id),past=d.chapter!==engine.chapter.id;return `<article class="dossier-card"><small>${esc(d.chapter)} · ${past?'SECTEUR QUITTÉ':'SECTEUR ACTIF'}</small><h3>${esc(d.title)}</h3><p>${esc(d.question)}</p><div class="proof-progress" aria-label="${i.owned.length} sources retrouvées sur trois">${d.proofs.map(p=>`<i class="${i.owned.includes(p)?'acquired':''}"></i>`).join('')}<span>${i.owned.length}/3</span></div><p>${i.decision?(i.decision.channel==='local'?'Copie locale scellée':'Émission enregistrée'):past?'Aucune décision enregistrée au départ':'Recoupement à effectuer au terminal'}</p><button data-act="investigationOpen" data-dossier="${d.id}">Consulter les sources</button></article>`;}).join('')}</div><div class="actions"><button data-act="objectives">Objectifs & archives</button><button data-act="fieldReport">Bilan des secteurs</button><button data-act="resume" class="primary">Revenir au terrain</button></div><p class="fine">Ces enquêtes sont originales. La consultation fige le temps ; la conservation s’effectue ensuite sur place, exposée aux dangers.</p>`,'investigation-board');
}
function showInvestigation(id,physical=false){
 if(!started)return;
 const info=engine.investigationInfo(id);if(!info||EARTH_DATA.chapters.findIndex(c=>c.id===info.definition.chapter)>engine.state.chapter)return;
 const d=info.definition;if(investigationId!==id){investigationId=id;investigationAnswer=['','',''];}
 if(!physical)engine.cancelInteraction();
 physical=physical&&engine.pending?.type==='investigation-v8'&&engine.pending.id===id;returnTo='game';
 const sources=[d.proofs[2],d.proofs[0],d.proofs[1]],available=info.owned.length===3,done=info.decision;
 const cards=sources.map(pid=>{
  const r=EARTH_DATA.rooms.find(r=>r.archive.id===pid),owned=engine.state.archives.includes(pid);
  return `<article class="evidence-card ${owned?'acquired':'missing'}"><small>${owned?esc(pid)+' · DOCUMENT RAMASSÉ':'SOURCE NON RETROUVÉE'}</small><h3>${owned?esc(r.archive.title):'Une pièce du dossier manque'}</h3><p>${owned?esc(r.archive.text):'Le carnet ne fournit pas le contenu d’un document absent. Retrouvez cette archive sur le terrain.'}</p><footer>${esc(r.title)}${!owned&&r.chapter===engine.chapter.id?`<button data-act="track" data-room="${r.id}">Suivre le lieu</button>`:''}</footer></article>`;
 }).join('');
 const choices=d.roles.map((role,i)=>`<label class="proof-slot"><b>${i+1}. ${esc(role)}</b><select data-proof-slot="${i}" aria-label="Source : ${esc(role)}" ${!available||done?'disabled':''}><option value="">Associer une source…</option>${sources.map(pid=>{const r=EARTH_DATA.rooms.find(r=>r.archive.id===pid);return `<option value="${pid}" ${investigationAnswer[i]===pid?'selected':''}>${pid} · ${esc(r.archive.title)}</option>`;}).join('')}</select></label>`).join('');
 let action=done?`<section class="dossier-conclusion"><small>${done.channel==='local'?'COPIE LOCALE SCELLÉE':'ÉMISSION ENREGISTRÉE'}</small><h3>Recoupement conservé</h3><p>${esc(d.conclusion)}</p><p>${esc(done.channel==='local'?d.localEnding:d.networkEnding)}</p><p class="fine">Enregistré à ${Math.floor(done.time/60)}:${String(Math.floor(done.time%60)).padStart(2,'0')} de simulation. Source : les trois archives ci-dessus.</p></section>`:
 `<div class="association-grid">${choices}</div><p id="associationStatus" role="status" class="association-status">${available?'Les trois sources sont présentes. Associez chaque document au rôle qu’il démontre.':'Récupérez les trois documents avant de valider une association.'}</p>${physical?`<div class="conservation-options"><article><h3>Conserver localement</h3><p>Deux secondes avec E au terminal. Aucune émission ajoutée. La copie reste locale.</p><button data-act="investigationQueue" data-channel="local" ${available?'':'disabled'}>Préparer la copie locale</button></article><article><h3>Diffuser sur le réseau interne</h3><p>Quatre secondes avec E. Surveillance doit rester alimentée. Le terminal émet du bruit pendant le travail.</p><button data-act="investigationQueue" data-channel="network" ${available&&engine.channelOn('surveillance')?'':'disabled'}>Préparer la diffusion</button><small>${engine.channelOn('surveillance')?'Surveillance alimentée':'Surveillance hors ligne'}</small></article></div><p class="fine">Choix unique, appliqué seulement après le maintien terminé. Ni bonus de ressource, ni destinataire externe simulé.</p>`:`<p class="alert">Consultation uniquement. ${d.chapter===engine.chapter.id?'Rendez-vous au terminal de '+esc(ROOM_BY_ID[d.room].title)+' pour conserver cette enquête.':'Le secteur est quitté ; aucune décision ne peut être écrite rétroactivement.'}</p>`}`;
 open('investigation',header(d.chapter+' · ENQUÊTE FACULTATIVE',d.title)+`<p class="lede">${esc(d.question)}</p><div class="evidence-grid">${cards}</div>${action}<div class="actions">${!done?'<button data-act="investigationReset">Effacer l’association</button>':''}${!done&&d.chapter===engine.chapter.id?`<button data-act="track" data-room="${d.room}">Suivre le terminal</button>`:''}<button data-act="investigations">Toutes les enquêtes</button><button data-act="close" class="primary">Revenir au terrain</button></div><p class="fine">Recoupement original des documents du jeu. Pas un nouveau fait canonique sur la série.</p>`,'investigation-detail');
}
function showObjectives(){
 if(!started){showTitle();return;}returnTo='game';engine.cancelInteraction();
 const all=EARTH_DATA.rooms.filter(r=>r.chapter===engine.chapter.id),list=all.filter(r=>objectiveFilter==='main'?!r.optional:objectiveFilter==='optional'?r.optional:true);
 const filters=[['all','Tout le secteur'],['main','Principales'],['optional','Facultatives'],['archives','Archives']];
 open('objectives',header(engine.chapter.subtitle,'Ce qui reste à faire')+`<nav class="tabs">${filters.map(([id,label])=>`<button data-act="objectiveFilter" data-filter="${id}" class="${id===objectiveFilter?'selected':''}">${label}</button>`).join('')}</nav><div class="objective-list">${list.map(r=>{const ar=objectiveFilter==='archives',done=ar?engine.state.archives.includes(r.archive.id):engine.state.completed.includes(r.task.id);return `<article class="objective-row ${done?'complete':''}"><span aria-hidden="true">${done?'✓':'◇'}</span><div><small>${esc(r.title)} · ${ar?'DOCUMENT':r.optional?'FACULTATIF':'PRINCIPAL'}</small><h3>${esc(ar?(done?r.archive.title:'Archive à retrouver'):r.task.label)}</h3><p>${done?'Acquis et conservé dans le profil.':engine.state.visited.includes(r.id)?'Lieu déjà parcouru. L’action reste à accomplir sur place.':'Lieu à explorer. Aucun objectif n’est validé par le guidage.'}</p></div><div class="actions">${ar&&done?`<button data-act="reviewArchive" data-archive="${r.archive.id}">Relire</button>`:''}<button data-act="track" data-room="${r.id}">Suivre</button></div></article>`;}).join('')}</div><div class="actions"><button data-act="investigations">Enquêtes du secteur</button><button data-act="archiveIndex">Tous les documents retrouvés</button><button data-act="resume" class="primary">Revenir au terrain</button></div>`,'objectives-panel');
}
function showArchiveIndex(){
 if(!started)return;returnTo='game';engine.cancelInteraction();
 const rs=EARTH_DATA.rooms.filter(r=>engine.state.archives.includes(r.archive.id));
 open('archiveIndex',header('COLLECTION RÉELLE · '+rs.length+' DOCUMENTS','Les documents retrouvés')+`<p>Les textes restent relisibles après le départ d’un secteur. Aucun document manquant n’est ajouté à cette collection.</p><div class="archive-index">${rs.length?rs.map(r=>`<button data-act="reviewArchive" data-archive="${r.archive.id}"><small>${esc(r.chapter)} · ${esc(r.title)}</small><b>${esc(r.archive.title)}</b></button>`).join(''):'<p>Aucune archive ramassée pour le moment.</p>'}</div><div class="actions"><button data-act="investigations">Recouper les indices</button><button data-act="resume" class="primary">Revenir au terrain</button></div>`);
}
function reviewOwnedArchive(id){
 const r=EARTH_DATA.rooms.find(r=>r.archive.id===id);if(!r||!engine.state.archives.includes(id)){notify('Ce document n’a pas été retrouvé.');return;}
 engine.cancelInteraction();returnTo='game';open('archive',header(r.chapter+' · '+r.title,r.archive.title)+`<p class="lede">${esc(r.archive.text)}</p><p class="fine">Note originale de l’adaptation, retrouvée sur le terrain. Cette relecture ne produit aucun gain.</p><div class="actions"><button data-act="archiveIndex">Les autres documents</button><button data-act="investigations">Tableau d’enquêtes</button><button class="primary" data-act="resume">Revenir au terrain</button></div>`);
}
function showFieldReport(chapterId=engine.chapter.id){
 if(!started)return;returnTo='game';engine.cancelInteraction();
 const r=sectorReportV8(engine.state,chapterId);if(!r||EARTH_DATA.chapters.findIndex(c=>c.id===chapterId)>engine.state.chapter)return;
 const ds=EARTH_DATA.investigations.find(d=>d.chapter===chapterId),labels={'not-met':'Non rencontré',follow:'Sur place · suit le groupe',wait:'Sur place · attend',down:'À terre, non évacué',rescued:'Évacué',left:'Resté dans le secteur'};
 open('fieldReport',header('BILAN DÉRIVÉ DES ACTIONS ENREGISTRÉES',r.title)+`<nav class="tabs">${EARTH_DATA.chapters.slice(0,engine.state.chapter+1).map(c=>`<button data-act="fieldReport" data-chapter="${c.id}" class="${c.id===chapterId?'selected':''}">${c.id}</button>`).join('')}</nav><div class="report-state"><b>${r.status==='closed'?'Secteur quitté':'Secteur actif'}</b><span>${r.departure?r.departure.provenance==='recorded'?'Départ enregistré à '+Math.floor(r.departure.time/60)+':'+String(Math.floor(r.departure.time%60)).padStart(2,'0'):'Bilan reconstitué · date historique inconnue':'Vous pouvez encore compléter les actions facultatives.'}</span></div><div class="stats-grid report-metrics">${[['Principales',r.main],['Facultatives',r.optional],['Archives',r.archives],['Lieux',r.places]].map(([label,n])=>`<div><strong>${n.done}/${n.total}</strong><span>${label}</span></div>`).join('')}</div><section class="report-section"><h3>Les personnes, pas seulement leur signal</h3>${r.people.length?r.people.map(p=>`<div class="person-outcome"><b>${esc(p.name)}</b><span>${p.medical?'Évacuation médicale · toujours blessé':labels[p.status]}</span><small>${esc(ROOM_BY_ID[p.room].title)}</small></div>`).join(''):'<p>Aucun des quatre sauvetages secondaires n’est assigné à ce secteur.</p>'}</section><section class="report-section"><h3>${esc(ds.title)}</h3><p>${r.dossier.proofs.length}/3 sources retrouvées. ${r.dossier.decision?(r.dossier.decision.channel==='local'?'Copie locale scellée.':'Émission enregistrée.'):'Aucune décision enregistrée.'}</p>${r.dossier.decision?`<p>${esc(ds.conclusion)}</p><p class="fine">${esc(r.dossier.decision.channel==='local'?ds.localEnding:ds.networkEnding)}</p>`:''}<button data-act="investigationOpen" data-dossier="${ds.id}">Consulter les pièces du dossier</button></section><section class="report-section"><h3>Le matériel et les observations</h3><p>${r.studies.length} étude${r.studies.length>1?'s':''} de spécimen conservée${r.studies.length>1?'s':''} · ${r.turbineStopped}/1 turbine consignée.</p><p>${r.probesLeft.length?r.probesLeft.map(u=>esc(u.id)+' — '+esc(ROOM_BY_ID[u.room].title)).join('<br>'):'Aucune sonde laissée dans ce secteur.'}</p></section><div class="actions"><button data-act="exportFieldReport">Exporter le rapport JSON</button><button data-act="export">Exporter la sauvegarde</button><button data-act="close" class="primary">Revenir</button></div><p class="fine">Le rapport n’est pas un profil importable, ni un envoi réseau réel. Il n’évalue pas une « bonne » ou « mauvaise » fin et ne modifie pas les événements établis.</p>`,'field-report-panel');
}

// V9 controls and read-only registry share one display; only physical service context authorizes actions.
const SECURITY_LABELS_V9={off:'Hors tension',scan:'Veille optique',alarm:'Alarme locale',cooldown:'Réarmement',stunned:'Aveuglé temporairement',isolated:'Consigné',broken:'Hors service'};
function securityTerminalEntry(station){
 const d=engine.localSecurity;return d&&d.control.id===station.id?`<section class="security-terminal"><div><small>CONTRÔLE OPTIQUE · ${d.id}</small><h3>La sentinelle du local</h3><p>Surveillance alimente aussi son balayage. Consigner cet appareil ne coupe pas les caméras.</p></div><button data-act="securityOpen" data-id="${d.id}">Contrôler la sentinelle</button></section>`:'';
}
function securityMapLine(room){
 const d=EARTH_DATA.securityStations.find(d=>d.room===room);if(!d)return '';const u=engine.securityUnit(d.id);
 return `<p class="security-map">${d.id} · ${u.firstSeen===null?'Non observée':room===engine.room.id?SECURITY_LABELS_V9[engine.securityMode(d.id)]:'Dernier état : '+SECURITY_LABELS_V9[u.lastMode]+' · '+Math.floor(engine.state.playSeconds-u.lastSeen)+' s'}</p>`;
}
function showSecurity(id=null,local=false){
 if(!started){showTitle();return;}returnTo='game';
 const authorized=local&&engine.pending?.type==='security-v9'&&engine.pending.id===id;
 const defs=EARTH_DATA.securityStations.filter(d=>EARTH_DATA.chapters.findIndex(c=>c.id===d.chapter)<=engine.state.chapter&&(!authorized||d.id===id));
 const cards=defs.map(d=>{const u=engine.securityUnit(d.id),here=d.room===engine.room.id,known=u.firstSeen!==null,mode=here?engine.securityMode(d.id):u.lastMode;
 return `<article class="security-card ${known?mode:'unknown'}"><div class="security-card-title"><span>${d.id}</span><small>${here?'PIÈCE CHARGÉE':'HORS ÉCRAN · DERNIÈRE OBSERVATION'}</small></div><h3>${esc(d.name)}</h3><strong class="security-status">${known?SECURITY_LABELS_V9[mode]:'Dispositif non observé'}</strong>${known?`<p>Intégrité ${Math.ceil(u.integrity)}/100 · ${u.alarms} alarme${u.alarms>1?'s':''} enregistrée${u.alarms>1?'s':''}.<br>Observation il y a ${Math.floor(engine.state.playSeconds-u.lastSeen)} s.</p>`:'<p>Rejoignez le local ou sa commande pour examiner cet appareil.</p>'}${authorized?`<div class="security-operations"><button class="primary" data-act="securityQueue" data-id="${d.id}" data-kind="isolate" ${u.isolated||u.integrity<=0?'disabled':''}>Préparer la consignation · 3 s</button><button data-act="securityQueue" data-id="${d.id}" data-kind="test" ${mode!=='scan'?'disabled':''}>Préparer un essai sonore · 1,5 s</button></div><p class="fine">Aucun coût ni récompense. Le geste s’accomplit avec E maintenu sur place. Le test déclenche une véritable alarme dans le jeu.</p>`:d.chapter===engine.chapter.id?`<button data-act="track" data-room="${d.room}">Suivre la commande sur la carte</button>`:''}</article>`;}).join('');
 const events=[...engine.state.security.events].reverse();const labels={alarm:'Alarme',isolated:'Consignation',impact:'Impact',disabled:'Destruction',stunned:'Aveuglement'};
 open('security',header(authorized?'COMMANDE LOCALE · ACTION EXPOSÉE':'REGISTRE DE TERRAIN · 4','Les yeux du complexe')+`<p class="lede">Deux secondes sous le regard du capteur peuvent déclencher six secondes d’alarme. Le son attire les créatures déjà présentes ; aucune n’apparaît à cause du dispositif.</p><div class="security-grid">${cards}</div><div class="security-notice"><h3>Le départ Surveillance est partagé</h3><p>Travail : caméras et sentinelles hors tension. Observation ou Discrétion : les deux sont alimentées. Les portes, turbines et objectifs restent indépendants.</p><p>F au pied : aveugler pendant six secondes avec le coût normal du dégagement. Trois impacts d’arme détruisent le détecteur. Seule une commande locale permet de le consigner sans tirer.</p></div>${events.length?`<h3>Derniers événements</h3><div class="security-history">${events.slice(0,12).map(e=>`<p><time>${Math.floor(e.time/60)}:${String(Math.floor(e.time%60)).padStart(2,'0')}</time> ${e.id} · ${labels[e.kind]} · ${esc(ROOM_BY_ID[e.room].title)}</p>`).join('')}</div>`:''}<p class="fine">Équipements originaux de cette adaptation. Ce registre ne commande rien à distance. Les pièces hors écran ne sont pas simulées ; le menu suspend l’horloge.</p><div class="actions"><button class="primary" data-act="close">Revenir</button></div>`,'security-panel');
}

/** Source registry: not a completion badge. Photographic identities are represented by stylized game silhouettes. */
function showFidelity(tab='places'){
 const data=EARTH_DATA.fidelity;
 const tabs=[['places','Lieux & raccords'],['cast','Silhouettes'],['gear','Armes & équipements'],['limits','Ce qui manque']];
 let body='';
 if(tab==='cast')body=`<div class="reference-cast">${EARTH_DATA.referenceCast.map(p=>`<article><canvas width="230" height="230" data-portrait="${p.id}" aria-label="Silhouette stylisée de ${esc(p.name)}"></canvas><h3>${esc(p.name)}</h3><p>${esc(p.note)}</p><small>${esc(p.status)}${getEarthRasterPreviewPoseV12(p.id)?'<br>Tenue de sauvetage · aperçu':''}</small></article>`).join('')}</div><p>Vingt-cinq silhouettes de référence, pas vingt-cinq personnages jouables ni vingt-cinq PNJ ajoutés à la campagne. Les visages restent stylisés ; plusieurs variantes de tenue manquent.</p>`;
 else if(tab==='gear')body=`<div class="reference-gear-active"><b>Dotation actuelle : ${esc(engine.weaponCaption)}</b><div class="actions"><button data-act="switchGear">6 · Changer de dotation acquise</button><button data-act="foam">7 · Mousse sur cible immobilisée</button></div><p>Joe : MCS-X / Maxim 9 avec 6. KSG-AL : prise facultative à l’armurerie du Maginot. Massicot : observation dans la salle commune, puis lame au chapitre de sauvetage. Les effets et quantités sont des règles originales.</p></div><div class="reference-equipment">${data.equipment.map(p=>`<article><h3>${esc(p.name)}</h3><b>${esc(p.status)}</b><p>${esc(p.note)}</p>${['mcsx','maxim9','wy-pistol','ksg-al','kriss'].includes(p.id)?`<canvas width="350" height="85" data-weapon="${p.id}" aria-label="Silhouette de l’équipement"></canvas>`:''}</article>`).join('')}</div>`;
 else if(tab==='limits')body=`<div class="reference-warning"><h3>Objectif : se rapprocher du 1:1. Statut actuel : adaptation partielle.</h3><p>${esc(data.locationScope)} ${esc(data.layout)}</p></div>${data.missing.map(t=>`<p class="reference-missing">À compléter — ${esc(t)}</p>`).join('')}<h3>Sources consultées</h3>${data.sources.map(s=>`<article class="reference-source"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><p>${esc(s.scope)}</p></article>`).join('')}`;
 else body=`<p>${esc(data.layout)} Les lieux référencés ne rendent pas leurs plans officiels. Les annexes imaginées sont identifiées.</p><div class="reference-places">${EARTH_DATA.chapters.map(c=>`<section><h3>${esc(c.subtitle)}</h3>${EARTH_DATA.rooms.filter(r=>r.chapter===c.id).map(r=>`<article><b>${esc(r.title)}</b><small>${esc(r.fidelity.status)}</small><p>${r.portals.filter(d=>d.kind==='door').map(d=>`↔ ${esc(ROOM_BY_ID[d.to].title)} <em>(${esc(d.anchor.kind)})</em>`).join('<br>')}</p><button data-act="track" data-room="${r.id}" ${!started||c.id!==engine.chapter.id?'disabled':''}>Suivre dans le secteur</button></article>`).join('')}</section>`).join('')}</div>`;
 open('fidelity',header('RÉFÉRENCES DE NEVERLAND','Lieux, silhouettes & dotations')+`<nav class="reference-tabs">${tabs.map(([id,label])=>`<button data-act="fidelity" data-tab="${id}" class="${tab===id?'primary':''}">${label}</button>`).join('')}</nav>${body}<div class="actions"><button data-act="close">Revenir</button></div>`,'reference-panel');
 drawFidelityCanvasesV12();
}
function drawFidelityCanvasesV12(){
 for(const canvas of document.querySelectorAll('[data-portrait]')){const c=canvas.getContext('2d');c.fillStyle='#15292d';c.fillRect(0,0,230,230);c.strokeStyle='#314d4c';c.beginPath();c.moveTo(18,208);c.lineTo(212,208);c.stroke();drawReferenceHumanV11(c,113,208,canvas.dataset.portrait,{scale:1.45,time:0,facing:1,chapter:canvas.dataset.portrait==='wendy'?0:engine.state.chapter,weapon:'none',...(getEarthRasterPreviewPoseV12(canvas.dataset.portrait)||{})});}
 for(const canvas of document.querySelectorAll('[data-weapon]')){const c=canvas.getContext('2d');c.fillStyle='#23363a';c.fillRect(0,0,350,85);c.save();c.translate(100,42);c.scale(3,3);drawReferenceWeaponV11(c,0,0,canvas.dataset.weapon);c.restore();}
}

document.addEventListener('earth-raster-ready-v12',()=>{if(modal==='fidelity')drawFidelityCanvasesV12();});
