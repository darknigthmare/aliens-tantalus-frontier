/* Source-aware production ledger and a physical weapon rack, no remote item grants. */
(function(root){'use strict';
root.ROP_FIDELITY_UI=function({getSim,openDialog,closeDialog,events,esc}){
 const D=root.ROP_DATA,A=root.ROP_ARMORY;
 function act(command){closeDialog();getSim().useArmory(command);events();}
 function arsenal(){
  const sim=getSim(),s=sim.s,k=A.kit(s),blocked=!A.ready(sim),near=A.rackNear(sim);
  openDialog('armory','Armement et dotation',`
   <p class="source-warning">Modèles inspirés d’<em>Aliens</em>. Le râtelier et l’attribution des réserves sont des ajouts de jeu, pas l’inventaire intégral attesté du roman.</p>
   <div class="armory-cards">
   <article><span class="weapon-symbol">M41A</span><h3>Fusil à impulsion</h3><p>${sim.character.weapon?s.player.ammo+' cartouches / '+s.player.reserve+' en réserve':'Non attribué à ce personnage'}</p><small>Impacts arrêtés au premier obstacle. Chargeur de 30 : équilibre du prototype.</small><button data-armory="pulse" ${blocked||k?.selected==='pulse'?'disabled':''}>ÉQUIPER LE M41A</button></article>
   <article><span class="weapon-symbol">M240</span><h3>Unité incendiaire</h3><p>${k?.issued?k.fuel+' unités de carburant restantes':'À récupérer au râtelier'}</p><small>Jet directionnel borné par les obstacles, réserve finie. F pour utiliser.</small><button data-armory="flame" ${blocked||!k?.issued||k.selected==='flame'?'disabled':''}>ÉQUIPER LE M240</button></article>
   <article><span class="weapon-symbol">M41A / LG</span><h3>Lance-grenades</h3><p>${k?.grenades||0} munition(s)</p><small>3 pour cette dotation. Attention à vous-même et au compagnon. 3 pour tirer en jeu ; explosion sans traverser les parois.</small><button data-armory="grenade" ${blocked||!k?.grenades||k.selected!=='pulse'||s.armory.projectiles.length?'disabled':''}>TIRER DANS LA DIRECTION VISÉE</button></article></div>
   <section class="rack-status"><h3>Râtelier physique · Armurerie de la garnison</h3><p>${!k?'Anne et Newt ne reçoivent pas ces armes.':k.issued?'Dotation déjà prélevée pour ce Marine. Aucun réapprovisionnement.':near?'Râtelier à portée. Le prélèvement dure deux secondes dans le monde.':'Rejoignez le poste à pied. Consulter ce dossier ne donne aucun matériel.'}</p><button data-armory="issue" ${blocked||!near||k?.issued?'disabled':''}>PRÉLEVER LA DOTATION FACULTATIVE</button></section>`,
   [{label:'RÉFÉRENCES / ÉCARTS',run:()=>catalog('équipement')},{label:'RETOUR AU PARCOURS',primary:true,run:()=>closeDialog()}],false,'6 / DOTATIONS INDIVIDUELLES');
  for(const b of document.querySelectorAll('[data-armory]'))b.onclick=()=>act(b.dataset.armory);
 }
 function catalog(category='lieu',filter=''){
  const list=D.fidelity.coverage.filter(e=>e.category===category&&(!filter||(e.title+' '+e.status+' '+e.note).toLowerCase().includes(filter.toLowerCase())));
  openDialog('fidelity','Références et écarts de fidélité',`
   <p class="source-warning">${esc(D.fidelity.warning)} Aucun pourcentage « 1:1 » n’est attribué. Un lieu relié dans le moteur ne prouve pas que son plan reproduit le roman.</p>
   <div class="fidelity-tabs">${['lieu','personnage','équipement'].map(cat=>`<button data-fidelity-cat="${cat}" aria-pressed="${cat===category}">${cat==='lieu'?'LIEUX':cat==='personnage'?'PERSONNAGES':'ÉQUIPEMENTS'}</button>`).join('')}</div>
   <label class="fidelity-search">RECHERCHER DANS CETTE CATÉGORIE<input id="fidelity-search" type="search" value="${esc(filter)}" placeholder="Manquant, épave, original…"></label>
   <p class="tiny">${list.length} entrée(s) affichée(s). Les manques restent visibles ; une fiche ne vaut pas une implémentation.</p>
   <div class="fidelity-list">${list.map(e=>`<article data-entry="${esc(e.id)}" class="fidelity-entry">
    ${category==='personnage'&&D.appearances[e.id]?`<canvas class="profile-preview" data-profile="${e.id}" width="156" height="155" aria-label="Silhouette de ${esc(e.title)}"></canvas>`:''}
    <div><h3>${esc(e.title)}</h3><b class="evidence-state">${esc(e.status)}</b><p>${esc(e.note)}</p>
    ${e.sources.length?e.sources.map(id=>{const q=D.sources.find(x=>x.id===id);return `<a class="source-link" href="${esc(q.url)}" target="_blank" rel="noopener noreferrer">${esc(q.title)}</a>`;}).join(''):'<small class="tiny">Sans preuve primaire suffisante pour certifier ce détail.</small>'}
    ${category==='lieu'&&D.rooms.some(r=>r.id===e.id)?`<small class="tiny">Connexions : ${D.rooms.find(r=>r.id===e.id).portals.map(p=>esc(root.ROP_CORE.roomDef(p.to).name)+' ('+esc(p.kind)+')').join(' · ')}</small>`:''}
    </div></article>`).join('')}</div>`,
   [{label:'RETOUR AU PARCOURS',primary:true,run:()=>closeDialog()}],false,'7 / REGISTRE DE PRODUCTION · ROMAN ≠ FILM ≠ AJOUT DE JEU');
  for(const b of document.querySelectorAll('[data-fidelity-cat]'))b.onclick=()=>catalog(b.dataset.fidelityCat);
  const input=document.getElementById('fidelity-search');input.onchange=()=>catalog(category,input.value);
  for(const canvas of document.querySelectorAll('[data-profile]')){
   const ren=new root.ROP_Renderer(canvas);ren.w=156;ren.h=155;ren.scale=1.18;ren.cam=0;ren.reduced=true;ren.fidelitySim=getSim();
   ren.ctx.fillStyle='#122930';ren.ctx.fillRect(0,0,156,155);ren.person({x:66,z:.83,facing:1,stowed:true},canvas.dataset.profile,false);
  }
 }
 function inspect(id){
  const sim=getSim(),o=sim.room.objects.find(o=>o.id===id);
  if(!o||o.kind!=='inspection'||!sim.near(sim.s.player,o,110))return;
  const medical=o.id==='medical-unit-v09';
  openDialog('inspection',medical?'Unité obstétricale':'Serre vitrée',`<p>${esc(o.description)}</p><p>${medical?'Les moniteurs clairs et la cloche transparente':'La forme vitrée en demi-sphère'} sont décrits dans l’extrait autorisé. Dimensions, implantation et état de cette scène restent interprétés.</p>`,
   [{label:'RÉFÉRENCES',run:()=>catalog(medical?'équipement':'lieu',medical?'obst':'serre')},{label:'RETOUR',primary:true,run:()=>closeDialog()}],false,'OBSERVATION / RÉFÉRENCE ET INTERPRÉTATION');
 }

 function contact(id){
  const sim=getSim(),o=sim.room.objects.find(o=>o.id===id);
  if(!o||o.kind!=='lore-contact'||sim.s.phase>o.phaseMax||!sim.near(sim.s.player,o,110))return;
  openDialog('loreContact',D.appearances[o.actorId].name,`<p class="lore-speech">${esc(o.description)}</p><p class="tiny">${esc(o.note)}</p><p class="tiny">Dialogue original, pas une citation du roman. Lecture en pause ; aucune récompense ou survie supplémentaire attribuée.</p>`,
  [{label:'FICHE / SOURCES',run:()=>catalog('personnage',D.appearances[o.actorId].name)},{label:'RETOUR',primary:true,run:()=>closeDialog()}],false,'HADLEY’S HOPE / RENCONTRE');
 }
 return {arsenal,catalog,inspect,contact};

};
})(globalThis);
