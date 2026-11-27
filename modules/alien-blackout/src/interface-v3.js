/* V0.3 UI: non-modal terminal controls, readable health / directives and onboarding.
   All buttons call the same public engine commands used by gameplay. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),e=window.blackout,D=BO_DATA;
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
 const insert=(html,where)=>{const t=document.createElement('template');t.innerHTML=html.trim();const n=t.content.firstElementChild;where(n);return n;};
 const panel=insert(`<details id="protocol-panel" class="protocol-panel" data-controls-v3><summary><span class="protocol-icon">⌁</span><span><small>POSTE D’INTERVENTION</small><strong id="protocol-name"></strong></span><span id="protocol-summary"></span></summary><div class="protocol-body"><div class="protocol-top"><span id="protocol-kind" class="eyebrow"></span><button id="protocol-view" class="small ghost">VOIR LE TERMINAL</button></div><p id="protocol-instructions"></p><div id="protocol-readouts" class="protocol-readouts"></div><canvas id="signal-v3" width="760" height="150" aria-label="Comparaison entre le signal étalon et le signal réglé" hidden></canvas><div id="protocol-controls" class="protocol-controls"></div><div class="protocol-bottom"><div><b id="protocol-state" role="status"></b><p id="protocol-hint"></p></div><button id="protocol-validate" class="primary">VALIDER LE RÉGLAGE / V</button></div></div></details>`,n=>document.querySelector('.mission').after(n));
 insert(`<section id="crew-care" class="crew-care" data-controls-v3 aria-label="Santé, initiative et binôme"><div class="care-heading"><strong id="care-name"></strong><span id="care-health"></span><span id="care-stress"></span><span id="care-kits"></span></div><div class="care-controls"><label>INITIATIVE<select id="initiative-v3"><option value="direct">Ordres stricts</option><option value="cautious">Repli prudent</option></select></label><label>BINÔME AVEC<select id="leader-v3"></select></label><button id="pair-v3" class="small">SUIVRE</button><button id="resume-v3" class="small">REPRENDRE L’ORDRE</button><button id="treat-v3" class="small">SOIGNER / H</button><button id="reassure-v3" class="small">RASSURER</button></div><p id="care-detail"></p></section>`,n=>document.querySelector('.crew-panel').after(n));
 insert(`<div id="guide-v3" class="guide-v3"><strong>AMANDA / PRIORITÉ</strong><span id="guide-text"></span><button id="help-inline" class="small ghost">AIDE</button></div>`,n=>document.querySelector('.mission').before(n));
 insert(`<div id="docking-v3" class="docking-v3" hidden><strong>HALDIN / AMARRAGE EN COURS</strong><span id="docking-time"></span><div class="progress"><span id="docking-progress"></span></div><p>Gardez tous les survivants au sas. La traque et le refuge restent actifs.</p></div>`,n=>panel.after(n));
 insert(`<div class="v3-start-options" data-controls-v3><label class="assist-label"><input id="assistance-v3" type="checkbox"> Assistance aux réglages <small>Option facultative : +12 secondes par diagnostic, signalée au bilan.</small></label><label>GRAINE DE LIAISON<input id="seed-v3" type="number" min="0" max="4294967295" value="26319" step="1"></label></div>`,n=>document.querySelector('.title-bottom').before(n));
 // Wide screens keep crew, camera/terminal and network visible together.
 const roster=el('aside','roster-v3');roster.setAttribute('aria-label','Équipage et directives');
 document.querySelector('.doors').before($('refuge-panel'));
 document.querySelector('.layout').prepend(roster);roster.append(document.querySelector('.crew-panel'),$('crew-care'));
 panel.append(panel.querySelector('.protocol-bottom'));
 const workspace=()=>{const layout=document.querySelector('.layout');const wide=innerWidth>=1150&&innerHeight>=760;
 const entering=wide&&!document.body.classList.contains('workspace-v3');document.body.classList.toggle('workspace-v3',wide);if(entering)window.scrollTo(0,0);const documentTop=layout.getBoundingClientRect().top+window.scrollY;layout.style.setProperty('--workspace-height',Math.max(570,innerHeight-documentTop-12)+'px');};
 addEventListener('resize',workspace);workspace();
 panel.addEventListener('toggle',()=>document.body.classList.toggle('terminal-open-v3',panel.open));
 const helpButton=el('button','small ghost','AIDE');helpButton.id='help-v3';document.querySelector('.header-actions').prepend(helpButton);
 insert(`<dialog id="help-dialog-v3" class="modal help-dialog-v3"><header><div><div class="eyebrow">AMANDA RIPLEY / POSTE AUXILIAIRE</div><h2>Ramenez leurs voix.</h2></div><button id="help-close-v3">FERMER</button></header><div class="modal-content"><div class="help-steps"><article><b>01</b><h3>Observer</h3><p>Cliquez une pièce sur le plan : seule la caméra change. Le capteur occupe un canal et affiche les pièces où se trouvent les contacts.</p></article><article><b>02</b><h3>Faire venir l’opérateur</h3><p>Sélectionnez un membre, puis <strong>Envoyer au terminal</strong>. Il doit franchir les portes et préparer 30 % du travail.</p></article><article><b>03</b><h3>Régler les circuits</h3><p>Ouvrez le poste d’intervention sous l’objectif. Alignez les trois lectures avec leurs cibles. La transmission demande 1,5 seconde de stabilité. Validez ; le travail reprend.</p></article><article><b>04</b><h3>Gagner du temps</h3><p>Les cloisons retardent l’Alien, sans l’emprisonner définitivement. Un interphone l’attire, mais répéter la même salle le rend moins efficace.</p></article><article><b>05</b><h3>Garder des gens debout</h3><p>Un premier contact prolongé blesse. Un second tue. Vous disposez de quatre trousses pour toute la campagne. Un binôme proche accélère le travail de 15 %.</p></article><article><b>06</b><h3>Protéger aussi Amanda</h3><p>À l’alerte de sa gaine, appuyez sur <strong>Espace</strong>. Le scellement coupe les commandes pendant neuf secondes et libère les portes.</p></article></div><div class="help-footer"><p><strong>La pause est tactique.</strong> Elle arrête les dangers, pas la préparation des ordres ou les réglages. Les fenêtres Codex, Système et Aide arrêtent aussi le temps.</p><p><strong>H</strong> : soin · <strong>V</strong> : validation · <strong>O</strong> : objectif · <strong>X</strong> : casier · <strong>P</strong> : pause · <strong>Espace</strong> : refuge.</p><p>Les deux annexes de chaque secteur rechargent la batterie ou isolent les gaines. Elles restent facultatives. Au dernier sas, maintenez tout l’équipage douze secondes pour terminer l’amarrage.</p></div></div></dialog>`,n=>document.body.append(n));
 insert(`<div class="system-v3" data-controls-v3><h3>Réglages d’intervention</h3><button id="assist-toggle-v3">ASSISTANCE : NON</button><p>L’aide ajoute douze secondes de travail au terminal. Changer cette option n’efface pas les protocoles déjà résolus.</p><button id="clear-slot-v3" class="ghost">EFFACER UNIQUEMENT LA SAUVEGARDE V3</button><p class="notice">Les emplacements v1 et v2 ne sont jamais supprimés par cette commande. Exportez votre liaison avant d’effacer.</p></div>`,n=>$('system-dialog').querySelector('.modal-content').append(n));
 D.crew.forEach((c,i)=>{const o=el('option',null,c.name);o.value=i;$('leader-v3').append(o);const health=el('span','health-v3');health.id=`health-v3-${i}`;$('crew-'+i).append(health);});
 $('leader-v3').value='1';
 // Focus stays on a control while values update. Controls are rebuilt only per protocol.
 let built='',opened='',prevSelected=-1,helpPaused=true,lastResult='';
 const label={power:'RÉPARTITION / TROIS BUS',pressure:'PRESSION / BOUCLES COUPLÉES',signal:'TRANSMISSION / SIGNAL ÉTALON'};
 const instructions={power:'Chaque départ contribue aux bus A, B et C. Activez une combinaison qui donne exactement les trois charges cibles.',pressure:'A modifie I + II ; B modifie II + III ; C modifie I + III. Les boucles font sept crans : après 6, elles reviennent à 0. Alignez les trois lectures avec les cibles.',signal:'Alignez fréquence, phase et gain avec l’étalon. Courbe pointillée : cible. Courbe continue : signal local. Maintenez les réglages 1,5 seconde.'};
 const signalFormat=(i,n)=>i===0?`${n+1} kHz`:i===1?`${n*45}°`:`${n+1} V`;
 function buildProtocol(p) {
   built=p.spec.id;$('protocol-controls').replaceChildren();$('protocol-readouts').replaceChildren();
   for(let i=0;i<3;i++){
     const d=el('div','protocol-meter');d.append(el('span',null,p.spec.kind==='power'?`BUS ${'ABC'[i]}`:p.spec.kind==='pressure'?`BOUCLE ${['I','II','III'][i]}`:['FRÉQUENCE','PHASE','GAIN'][i]));
     const row=el('div');const a=el('b');a.id='reading-v3-'+i;const b=el('span','meter-target');b.id='target-v3-'+i;row.append(a,b);d.append(row);$('protocol-readouts').append(d);
   }
   p.spec.limits.forEach((limit,i)=>{
     if(p.spec.kind==='power'){
       const b=el('button','circuit-v3');b.id='setting-v3-'+i;b.append(el('strong',null,'DÉPART '+(i+1)),el('small',null,`A +${p.spec.matrix[i][0]}  / B +${p.spec.matrix[i][1]}  / C +${p.spec.matrix[i][2]}`));
       b.onclick=()=>{e.adjustProtocol(i);refresh();};$('protocol-controls').append(b);
     } else {
       const group=el('div','dial-v3');group.append(el('label',null,p.spec.kind==='pressure'?`VANNE ${'ABC'[i]}`:['FRÉQUENCE','PHASE','GAIN'][i]));
       const row=el('div','dial-row');const minus=el('button',null,'−'),plus=el('button',null,'+'),value=el('output');value.id='setting-v3-'+i;
       minus.id='minus-v3-'+i;plus.id='plus-v3-'+i;minus.setAttribute('aria-label','Diminuer '+(p.spec.kind==='pressure'?'vanne '+ 'ABC'[i]:['fréquence','phase','gain'][i]));plus.setAttribute('aria-label','Augmenter '+(p.spec.kind==='pressure'?'vanne '+ 'ABC'[i]:['fréquence','phase','gain'][i]));
       minus.onclick=()=>{e.adjustProtocol(i,-1);refresh();};plus.onclick=()=>{e.adjustProtocol(i,1);refresh();};row.append(minus,value,plus);group.append(row);$('protocol-controls').append(group);
     }
   });
   $('signal-v3').hidden=p.spec.kind!=='signal';$('protocol-kind').textContent=label[p.spec.kind];$('protocol-instructions').textContent=instructions[p.spec.kind];
   panel.open=false;
 }
 function signal(p){
   const c=$('signal-v3').getContext('2d');c.clearRect(0,0,760,150);c.fillStyle='#091c24';c.fillRect(0,0,760,150);
   c.strokeStyle='#29454b';c.lineWidth=1;
   for(let x=0;x<760;x+=38){c.beginPath();c.moveTo(x,0);c.lineTo(x,150);c.stroke();}
   for(let y=25;y<150;y+=25){c.beginPath();c.moveTo(0,y);c.lineTo(760,y);c.stroke();}
   const wave=(v,color,dash)=>{c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dash);c.beginPath();for(let x=0;x<760;x++){const y=75-Math.sin(x/760*Math.PI*2*(v[0]+1)+v[1]*Math.PI/4)*(v[2]+1)*11;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();};
   wave(p.spec.target,'#ccb685',[7,5]);wave(p.state.values,p.matching?'#b7e4bc':'#6ba5b5',[]);c.setLineDash([]);
 }
 function refresh(){
   const p=e.protocol,c=e.crew[e.selected],m=e.v3.members[c.id];
   panel.hidden=!p||e.status==='menu';
   if(p){
     if(built!==p.spec.id)buildProtocol(p);
     $('protocol-name').textContent=D.protocolTypes[p.spec.kind];
     const status=p.state.solved?'RÉGLAGE VALIDÉ':p.ready?'RÉGLAGE REQUIS':'EN PRÉPARATION';
     $('protocol-summary').textContent=status;panel.classList.toggle('ready',p.ready&&!p.state.solved);panel.classList.toggle('solved',p.state.solved);
     if(p.ready&&!p.state.solved&&opened!==p.spec.id){panel.open=true;opened=p.spec.id;}
     p.output.forEach((v,i)=>{
       $('reading-v3-'+i).textContent=p.spec.kind==='signal'?signalFormat(i,v):v;
       $('target-v3-'+i).textContent='cible '+(p.spec.kind==='signal'?signalFormat(i,p.spec.target[i]):p.spec.target[i]);
       $('reading-v3-'+i).parentElement.parentElement.classList.toggle('matched',v===p.spec.target[i]);
     });
     p.state.values.forEach((value,i)=>{
       if(p.spec.kind==='power'){$('setting-v3-'+i).classList.toggle('active',value===1);$('setting-v3-'+i).setAttribute('aria-pressed',String(value===1));}
       else $('setting-v3-'+i).textContent=p.spec.kind==='signal'?signalFormat(i,value):value;
     });
     $('protocol-controls').querySelectorAll('button').forEach(b=>b.disabled=!e.link||!p.ready||p.state.solved);
     $('protocol-validate').disabled=!e.link||!p.ready||p.state.solved||p.state.cooldown>0;
     $('protocol-validate').textContent=p.state.solved?'RÉGLAGE VALIDÉ':p.state.cooldown>0?`CONTRÔLE / ${Math.ceil(p.state.cooldown)} s`:'VALIDER LE RÉGLAGE / V';
     $('protocol-state').textContent=p.state.solved?(p.state.assisted?'Diagnostic résolu avec assistance locale.':'Réglage accepté. L’opérateur poursuit le travail.'):!p.ready?'En attente de l’opérateur au terminal.':!e.link?'Liaison coupée. Le réglage est conservé.':e.v3.assistance?`Assistance locale : ${Math.ceil(12-p.state.assistProgress)} s`:(p.spec.kind==='signal'&&p.matching?`Signal stable : ${p.state.stable.toFixed(1)} / 1,5 s`:'La préparation est terminée. À vous de régler.');
     $('protocol-hint').textContent=p.state.solved?'Un départ du terminal ne fait pas perdre cette validation.':p.ready?'Modifier un réglage est gratuit. Une validation erronée coûte 2 % de batterie et fait du bruit.':'Envoyez un équipier avec le bouton de l’objectif. Aucun personnage ne peut intervenir à travers les murs.';
     if(p.spec.kind==='signal')signal(p);
   }
   D.crew.forEach((member,i)=>{const st=e.v3.members[member.id],alive=e.crew[i].alive;
     $('health-v3-'+i).textContent=alive?(st.hp===2?'● ●':'● ○'):'—';$('health-v3-'+i).classList.toggle('wounded',st.hp===1);
     $('crew-'+i).classList.toggle('wounded',alive&&st.hp===1);
     if(alive&&st.medical>0)$('crew-'+i).children[2].textContent='Soins en cours';
     else if(alive&&st.following)$('crew-'+i).children[2].textContent='Binôme : '+D.crew.find(v=>v.id===st.following).name;
   });
   $('care-name').textContent=c.name;$('care-health').textContent=!c.alive?'SIGNAL PERDU':m.hp===2?'ÉTAT STABLE':'BLESSÉ / −25 %';
   $('care-stress').textContent=`TENSION ${Math.round(c.stress)} %`;$('care-kits').textContent=`TROUSSES ${e.v3.medkits} / 4`;
   $('initiative-v3').value=m.autonomy;$('initiative-v3').disabled=!e.link||!c.alive;
   for(const o of $('leader-v3').options)o.disabled=Number(o.value)===e.selected||!e.crew[Number(o.value)].alive;
   if(prevSelected!==e.selected||[...$('leader-v3').options].find(o=>o.selected)?.disabled){prevSelected=e.selected;const leader=D.crew.findIndex(v=>v.id===m.following);$('leader-v3').value=leader>=0?leader:[...$('leader-v3').options].find(o=>!o.disabled)?.value??'';}
   $('pair-v3').disabled=!e.link||!c.alive||$('leader-v3').value==='';$('resume-v3').disabled=!e.link||!m.interrupted||!c.alive;
   $('treat-v3').disabled=!e.link||!c.alive||m.hp!==1||m.medical>0||e.v3.medkits<1||c.spotted>0;
   $('treat-v3').textContent=m.medical>0?`SOINS / ${Math.ceil(m.medical)} s`:'SOIGNER / H';
   $('reassure-v3').disabled=!e.link||!c.alive||e.v3.reassureCooldown>0||e.energy<2||c.stress<1;
   $('reassure-v3').textContent=e.v3.reassureCooldown>0?`RADIO / ${Math.ceil(e.v3.reassureCooldown)} s`:'RASSURER / −2 %';
   $('care-detail').textContent=m.medical>0?'Restez immobile six secondes, loin d’un contact. La trousse est consommée à la fin.':m.interrupted?'Un ordre a été suspendu par le repli. Reprenez-le seulement lorsque la route semble sûre.':m.following?`Suit ${D.crew.find(v=>v.id===m.following).name}. À proximité du terminal, ce binôme apporte 15 % de vitesse.`:m.autonomy==='cautious'?'Cet équipier choisira de se replier s’il voit une menace proche. Il ne connaît pas les salles voisines.':'Ordres stricts : vous décidez des déplacements et des replis. Un binôme proche peut soutenir l’opérateur.';
   $('docking-v3').hidden=e.v3.evac<=0||e.status==='won';$('docking-time').textContent=`${Math.ceil(12-e.v3.evac)} s`;$('docking-progress').style.width=e.v3.evac/12*100+'%';
   $('guide-text').textContent=e.ventCountdown>0?'La gaine d’Amanda est menacée : Espace pour sceller.':e.shield>0?'Refuge scellé. Les portes distantes sont ouvertes ; préparez la reprise.':e.crew.some(c=>c.alive&&c.spotted>0)?'Contact à proximité d’un membre : évitez de le laisser au terminal.':e.currentTask?(p?.ready&&!p.state.solved?'Le terminal attend votre réglage. Ouvrez le poste d’intervention ci-dessous.':e.crew.some(c=>c.work)?'Le travail avance. Surveillez les voies d’approche et le refuge.':'Choisissez un membre, puis envoyez-le au terminal. Le trajet est physique.'):'Toutes les interventions sont terminées : rassemblez les survivants au sas.';
   $('assist-toggle-v3').textContent='ASSISTANCE : '+(e.v3.assistance?'OUI':'NON');$('assist-toggle-v3').disabled=e.status!=='playing';
   if($('result-dialog').open){
     const key=e.status+e.chapterIndex+e.crew.filter(c=>c.alive).length;
     if(lastResult!==key){lastResult=key;let recap=$('recap-v3');if(!recap){recap=el('div','recap-v3');recap.id='recap-v3';$('result-dialog').querySelector('.result-grid').after(recap);}
       recap.replaceChildren(el('p',null,`${e.v3.telemetry.protocols} réglages validés · ${e.v3.telemetry.assisted} assistés · ${e.v3.telemetry.protocolErrors} erreurs · ${e.v3.telemetry.injuries} blessures · ${e.v3.telemetry.treatments} soins`));
       if(e.status==='won'){$('result-title').textContent=e.ending.title;$('result-text').textContent=e.ending.text;recap.append(el('small',null,'Épilogue original conditionnel. Amarrage joué ; départ du Haldin raconté.'));}
     }
   } else lastResult='';
 }
 $('protocol-view').onclick=()=>{if(e.currentTask){e.cameraTo(e.currentTask.room);app.setRefuge(false);app.refresh();}};
 $('protocol-validate').onclick=()=>{e.validateProtocol();app.refresh();};
 $('initiative-v3').onchange=()=>{e.setAutonomy($('initiative-v3').value);refresh();};
 $('pair-v3').onclick=()=>{e.followCrew(e.selected,Number($('leader-v3').value));app.refresh();};
 $('resume-v3').onclick=()=>{e.resumeInterrupted();app.refresh();};$('treat-v3').onclick=()=>{e.treat();app.refresh();};$('reassure-v3').onclick=()=>{e.reassure();app.refresh();};
 $('assist-toggle-v3').onclick=()=>{e.setAssistance(!e.v3.assistance);refresh();};
 $('clear-slot-v3').onclick=()=>{if(!confirm('Effacer uniquement la sauvegarde locale v0.4 ? Votre partie active reste ouverte, mais ne sera pas restaurable après fermeture sans export.'))return;try{localStorage.removeItem('tantalus.dlc.blackout.save.v4');$('save-status').textContent='Emplacement v0.4 effacé. Les versions précédentes sont conservées.';}catch{$('save-status').textContent='Le navigateur refuse l’accès au stockage.';}};
 const openHelp=()=>{helpPaused=e.paused;e.paused=true;$('help-dialog-v3').showModal();app.refresh();};
 const closeHelp=()=>{$('help-dialog-v3').close();e.paused=helpPaused||e.status!=='playing';app.refresh();};
 $('help-v3').onclick=openHelp;$('help-inline').onclick=openHelp;$('help-close-v3').onclick=closeHelp;
 $('help-dialog-v3').addEventListener('cancel',ev=>{ev.preventDefault();closeHelp();});
 document.addEventListener('keydown',event=>{
   if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)||event.repeat)return;
   if(event.key.toLowerCase()==='h'){event.preventDefault();e.treat();app.refresh();}
   if(event.key.toLowerCase()==='v'){event.preventDefault();e.validateProtocol();app.refresh();}
 });
 // Draw only status markers over the existing scene. Physics and depth sorting remain in V2.
 const draw=BO_RENDER.drawScene;
 BO_RENDER.drawScene=(canvas,engine,options={})=>{
   draw(canvas,engine,options);if(!engine.v3||engine.escapeActive||(engine.v4&&!engine.cameraAvailable())||!engine.monitor||engine.shield>0||engine.reboot>0||engine.brokenCamera===engine.camera||options.refuge)return;
   const c=canvas.getContext('2d');
   engine.crew.filter(a=>a.alive&&a.room===engine.camera&&!a.hidden).forEach(a=>{
     const m=engine.v3.members[a.id];if(m.hp===1){c.fillStyle='#d7a382';c.font='bold 12px ui-monospace,monospace';c.textAlign='center';c.fillText('✚ BLESSÉ',a.x,a.y+32);c.textAlign='left';}
     if(m.medical>0){c.fillStyle='#0c252b';c.fillRect(a.x-32,a.y-125,64,7);c.fillStyle='#bcd3aa';c.fillRect(a.x-32,a.y-125,(1-m.medical/6)*64,7);}
   });
   if(engine.v3.evac>0){c.fillStyle='#122d32ed';c.fillRect(640,61,335,42);c.fillStyle='#e2c792';c.font='14px ui-monospace,monospace';c.fillText(`HALDIN / AMARRAGE ${Math.ceil(12-engine.v3.evac)} s`,657,87);}
 };
 window.BO_UI3={refresh,openHelp};refresh();
})();
