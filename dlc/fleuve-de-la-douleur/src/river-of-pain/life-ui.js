/* UI for physically accessed reserves, benches and remembered residents. */
(function(root){'use strict';
root.ROP_LIFE_UI=function({getSim,openDialog,closeDialog,events,esc}){
 const D=root.ROP_DATA,L=root.ROP_LIFE,C=root.ROP_CORE;
 const items=D.life.items;
 function pockets(){const sim=getSim(),p=sim.s.life.pockets[sim.s.character];return `<div class="parts-row">${L.parts.map(k=>`<span><b>${p[k]}</b> ${esc(items[k].label)} <small>/ ${items[k].capacity}</small></span>`).join('')}</div>`;}
 function supplies(id){
  const sim=getSim(),d=L.containers.get(id);if(!L.available(sim,d))return;
  const v=L.containerState(sim.s,d),left=Object.values(v.remaining).reduce((a,b)=>a+b,0);
  let body=`<p class="tiny">${esc(C.roomDef(d.room).name)} · Réserve commune à tous les points de vue.</p>`;
  if(!v.open){body+=`<div class="supply-intro"><span class="supply-symbol" aria-hidden="true">▣</span><div><h3>Le fermoir est encore fermé.</h3><p>Choisissez votre façon d’ouvrir. Le temps de lecture est en pause ; la manipulation se fait ensuite dans le monde, sans protection contre les attaques.</p></div></div><div class="search-choices"><button data-search-method="quiet"><strong>OUVRIR DOUCEMENT</strong><span>3,2 secondes · bruit faible</span><small>Prendre le temps de déverrouiller le fermoir.</small></button><button data-search-method="fast"><strong>FORCER LE FERMOIR</strong><span>1,05 seconde · bruit élevé</span><small>Le claquement peut attirer une créature proche.</small></button></div>`;
  }else{
   body+=`<div class="supply-state"><b>${left?'FERMOIR OUVERT':'RÉSERVE ÉPUISÉE'}</b><span>Le couvercle reste ouvert dans le niveau.</span></div>${pockets()}<div class="supply-list">${Object.entries(v.remaining).map(([k,n])=>{
    const amount=L.takeAmount(sim,id,k),child=sim.character.child&&(L.parts.includes(k)||k==='ammo'||k==='flare');
    const why=!n?'Épuisé':child?'Matériel pour adultes':k==='ammo'&&!sim.character.weapon?'Réservé aux Marines':k==='ration'&&sim.s.player.hp>=100?'État déjà à 100 %':!amount?'Capacité atteinte':'';
    return `<article><div><strong>${esc(items[k].label)}</strong><small>${k==='ration'?'Manger sur place · jusqu’à 25 points d’état':why||'Ce qui reste pourra être récupéré plus tard.'}</small></div><b>× ${n}</b><button data-supply-take="${k}" ${amount?'':'disabled'}>${amount?(k==='ration'?'MANGER UNE PORTION':'PRENDRE '+amount):esc(why)}</button></article>`;
   }).join('')}</div><p class="tiny">Une prise partielle laisse le surplus. Aucun objet ne réapparaît en changeant de pièce ou de personnage.</p>`;
  }
  openDialog('supply',d.label,body,[{label:'RETOUR AU TERRAIN',primary:true,run:()=>closeDialog()}],false,'RÉSERVES DE LA COLONIE');
  for(const b of document.querySelectorAll('[data-search-method]'))b.onclick=()=>{if(sim.searchContainer(id,b.dataset.searchMethod)){closeDialog();events();}};
  for(const b of document.querySelectorAll('[data-supply-take]'))b.onclick=()=>{sim.takeSupply(id,b.dataset.supplyTake);events();supplies(id);};
 }
 function bench(id){
  const sim=getSim(),d=L.benches.get(id);if(!L.available(sim,d))return;
  const body=`<p>Une pile peut alimenter votre lampe, ou devenir le cœur d’une diversion. Les composants sont consommés uniquement après la manœuvre complète.</p>${pockets()}<div class="recipe-list">${Object.entries(D.life.recipes).map(([key,r])=>{
   const reason=L.recipeStatus(sim,id,key);
   return `<article><span class="recipe-symbol">${key==='decoy'?'◉':'▥'}</span><div><h3>${esc(r.label)}</h3><p>${key==='decoy'?'Non explosive. Pose au sol, délai de 3 secondes, puis 12 secondes de bips. Deux balises actives au maximum.':'Ajoute jusqu’à 45 points de batterie. Le surplus au-delà de 100 % est perdu.'}</p><small>${Object.entries(r.cost).map(([k,n])=>n+' '+esc(items[k].label)).join(' + ')} · ${r.duration.toLocaleString('fr-FR')} secondes</small><button data-recipe="${key}" ${reason?'disabled':''}>${esc(reason||'COMMENCER LA MANŒUVRE')}</button></div></article>`;
  }).join('')}</div><p class="tiny">Se déplacer ou être blessé interrompt l’assemblage sans retirer les composants. Newt n’utilise pas ces outils.</p>`;
  openDialog('bench',d.label,body,[{label:'RETOUR AU TERRAIN',primary:true,run:()=>closeDialog()}],false,'ATELIER / MATÉRIEL EMPORTÉ');
  for(const b of document.querySelectorAll('[data-recipe]'))b.onclick=()=>{if(sim.craftAt(id,b.dataset.recipe)){closeDialog();events();}};
 }
 function portrait(def){
  const canvas=document.getElementById('resident-portrait');if(!canvas)return;
  canvas.width=180;canvas.height=225;const r=new root.ROP_Renderer(canvas);
  r.scale=1.6;r.ctx.fillStyle='#1a353c';r.ctx.fillRect(0,0,180,225);
  r.project=()=>({x:82,y:212});r.person({x:0,z:.7,facing:1,walk:0,appearance:def},'anne');
  r.ctx.fillStyle='#c4d7bc';r.ctx.font='10px monospace';r.ctx.fillText('SERVICE COLONIAL',14,20);
 }
 function conversation(id,topic=null){
  const sim=getSim(),def=L.residents.get(id);if(!def||!L.conversationAllowed(sim,def))return;
  const text=topic?sim.readResident(id,topic):def.intro[Math.min(1,sim.s.phase)];if(!text)return;
  const v=sim.s.life.contacts[id];
  const body=`<div class="resident-dialogue"><div class="resident-portrait-frame"><canvas id="resident-portrait" aria-label="Silhouette du personnage en jeu"></canvas><small>PERSONNAGE ORIGINAL</small></div><div><span class="tiny">${esc(def.role)} · ${esc(C.roomDef(def.room).name)}</span><blockquote>${esc(text)}</blockquote><div class="topic-buttons">${def.topics.map(t=>`<button data-resident-topic="${t.id}">${esc(t.label)}${v?.topics.includes(t.id)?'<small>CONSERVÉ DANS LE REGISTRE</small>':''}</button>`).join('')}</div></div></div><p class="tiny">La lecture est en pause. Ces échanges ne remplacent pas les scènes du roman et ne modifient pas les objectifs principaux.</p>`;
  openDialog('conversation',def.name,body,[{label:'REPRENDRE SA ROUTE',primary:true,run:()=>closeDialog()}],false,'RENCONTRE LOCALE / '+(sim.s.phase?'PREMIERS INCIDENTS':'AVANT LA CRISE'));
  portrait(def);for(const b of document.querySelectorAll('[data-resident-topic]'))b.onclick=()=>{conversation(id,b.dataset.residentTopic);events();};
 }
 function contacts(id=null){
  const sim=getSim(),s=sim.s,known=Object.entries(s.life.contacts),def=id?L.residents.get(id):null,v=id?s.life.contacts[id]:null;
  let body;
  if(def&&v){body=`<span class="tiny">${esc(def.role)}</span><p>Dernier échange : ${esc(C.roomDef(v.room).name)} · ${v.phase?'premiers incidents':'avant la crise'}.</p>${def.topics.filter(t=>v.topics.includes(t.id)).map(t=>`<article class="codex-entry"><strong>${esc(t.label)}</strong><p>${esc(t.text)}</p></article>`).join('')||'<p>Aucun sujet détaillé conservé. Il fallait le demander lors de la rencontre.</p>'}<p class="tiny">Ceci est une relecture, pas un appel à distance. La présence actuelle de cette personne n’est pas confirmée par ce registre.</p>`;}
  else body=`<p>Des noms, des métiers et des phrases entendues avant la rupture. Seules les personnes réellement rencontrées sont consignées ici.</p><div class="contact-stats"><b>${known.length} / ${D.life.residents.length}</b><span>PERSONNES RENCONTRÉES</span><b>${known.reduce((n,[,c])=>n+c.topics.length,0)} / ${D.manifest.counts.residentTopics}</b><span>SUJETS CONSERVÉS</span></div>${s.phase>=2?'<p class="contact-warning">La crise a interrompu les routines. Les dernières positions ne prouvent ni une présence actuelle, ni un décès, ni une évacuation.</p>':''}<div class="contact-list">${known.length?known.map(([id,v])=>{const d=L.residents.get(id);return `<button data-contact="${id}"><span class="contact-initials">${esc(d.name.split(' ').map(n=>n[0]).join(''))}</span><div><strong>${esc(d.name)}</strong><small>${esc(d.role)}</small><span>Dernier échange · ${esc(C.roomDef(v.room).name)}</span></div><b>${v.topics.length}/2</b></button>`;}).join(''):'<p>Parlez aux personnes de service dans les blocs habités. E ou P lance l’échange quand vous êtes à proximité.</p>'}</div><p class="tiny">12 résidents et leurs textes ont été créés pour ce DLC. Ils ne sont pas présentés comme des personnages authentifiés du roman.</p>`;
  const actions=def&&v?[{label:'TOUS LES CONTACTS',run:()=>contacts()}]:[];const near=L.candidates(sim).find(c=>c.type==='resident');if(near)actions.push({label:'PARLER À '+L.residents.get(near.ref.id).name.toUpperCase(),run:()=>{closeDialog();sim.talkNearby();events();}});actions.push({label:'RETOUR AU PARCOURS',primary:true,run:()=>closeDialog()});
  openDialog('contacts',def&&v?def.name:'Ceux qui habitaient ici',body,actions,false,'REGISTRE LOCAL / PAS DE SUIVI EN TEMPS RÉEL');
 }
 // Delegation remains scoped to this independent dialog, never to the host UI.
 document.addEventListener('click',event=>{const b=event.target.closest?.('[data-contact]');if(b&&document.getElementById('dialog-content').contains(b))contacts(b.dataset.contact);});
 return {supplies,bench,conversation,contacts,pockets};
};
})(globalThis);
