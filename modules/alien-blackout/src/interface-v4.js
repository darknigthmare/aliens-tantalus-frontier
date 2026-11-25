/* V4 controls call the public simulation API. Planning is a pausing modal, not
   an omniscient remote editor; no game objects are inserted by normal UI. */
(()=>{'use strict';const e=blackout,D=BO_DATA,R=BO.rooms,$=id=>document.getElementById(id);
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const insert=(html,where)=>{const t=document.createElement('template');t.innerHTML=html;const n=t.content.firstElementChild;where(n);return n;};
 insert(`<section id="plan-summary-v4" class="plan-summary-v4"><div><small>DIRECTIVES EMBARQUÉES</small><strong id="queue-summary-v4"></strong></div><button id="plan-open-v4" class="small">PRÉPARER L’ITINÉRAIRE</button></section>`,n=>document.querySelector('#crew-care').before(n));
 insert(`<section id="watch-v4" class="watch-v4"><div class="panel-heading"><span>TOUR DE VEILLE</span><span id="sweep-v4"></span></div><div class="watch-actions"><button id="pin-v4" class="small">ÉPINGLER LA CAMÉRA</button><button id="cycle-v4" class="small">TOUR : NON</button></div><div id="pins-v4" class="pins-v4"></div><div id="contacts-v4" class="contacts-v4"></div><p>Un écho date un passage, pas une position certaine.</p></section>`,n=>document.querySelector('.map-shell').after(n));
 insert(`<section id="incident-v4" class="incident-v4"><div class="eyebrow">MAINTENANCE DE SECTEUR <span id="incident-state-v4"></span></div><h3 id="incident-title-v4"></h3><p id="incident-detail-v4"></p><div class="progress"><span id="incident-progress-v4"></span></div><div class="row"><button id="incident-view-v4" class="small ghost">VOIR LE POSTE</button><button id="incident-order-v4" class="small">MAINTENANCE</button></div></section>`,n=>document.querySelector('.doors').before(n));
 insert(`<dialog id="plan-dialog-v4" class="modal plan-dialog-v4" data-controls-v4><header><div><div class="eyebrow">ORDRES EMBARQUÉS / 6 CONSIGNES MAXIMUM</div><h2 id="plan-title-v4">Itinéraire</h2></div><button id="plan-close-v4">FERMER</button></header><div class="modal-content"><p>La simulation est en pause. Les ordres envoyés restent exécutables pendant une coupure radio. Les portes fermées restent des obstacles.</p><div class="plan-form-v4"><label>ACTION<select id="plan-action-v4"><option value="move">Rejoindre une pièce</option><option value="hide">Se cacher dans une pièce</option><option value="wait">Attendre sur place</option><option value="task">Intervention principale</option><option value="service">Circuit annexe / maintenance</option><option value="exit">Rejoindre le sas</option><option value="repair">Réparer la caméra</option></select></label><label id="plan-room-label-v4">DESTINATION<select id="plan-room-v4"></select></label><label id="plan-wait-label-v4" hidden>SECONDES<input id="plan-wait-v4" type="number" min="1" max="30" step="1" value="5"></label><label>ALLURE<select id="plan-mode-v4"><option value="sneak">Prudent</option><option value="walk">Marche</option><option value="run">Course</option></select></label><button id="plan-add-v4" class="primary">AJOUTER</button></div><div id="plan-list-v4" class="plan-list-v4"></div><p id="plan-status-v4" role="status"></p><div class="row"><button id="plan-run-v4" class="primary">TRANSMETTRE / REPRENDRE</button><button id="plan-pause-v4">SUSPENDRE</button><button id="plan-clear-v4" class="ghost">ANNULER LA FILE</button></div><p class="notice">Un ordre immédiat, un soin ou le contrôle direct annule cette file. Le repli prudent la suspend : reprenez-la explicitement une fois la route sûre. Une attente après une cachette conserve le couvert.</p></div></dialog>`,n=>document.body.append(n));
 insert(`<section id="escape-controls-v4" class="escape-controls-v4" hidden><div><div class="eyebrow">HALDIN / SURVIVANTS À BORD</div><h2>À ton tour, Amanda.</h2><p>Avancez dans le conduit. Devant une cloison, restez près de la manivelle et maintenez E. Le ventilateur bloque le passage en rotation : attendez sa coupure. La silhouette vous suit.</p></div><div class="escape-pad-v4"><button id="escape-left-v4" aria-label="Reculer dans le conduit">← RECULER</button><button id="escape-use-v4">MAINTENIR / MANIVELLE</button><button id="escape-right-v4" class="primary">AVANCER →</button></div></section>`,n=>document.querySelector('.feed').after(n));
 const api={escapeAxis:0,escapeUse:false};window.BO_UI4=api;
 let planPaused=true,planIndex=0,listKey='',pinKey='';
 function options(){const type=$('plan-action-v4').value;$('plan-wait-label-v4').hidden=type!=='wait';$('plan-room-label-v4').hidden=type==='wait';const dest=$('plan-room-v4');dest.replaceChildren();
  let rows=type==='task'?e.chapter.tasks.slice(e.taskIndex).map(t=>[t.protocol.id,t.title+' / '+R.get(t.room).name]):type==='service'?e.chapter.services.map(s=>[s.id,s.title+' / '+R.get(s.room).name]):type==='repair'?(e.brokenCamera?[[e.brokenCamera,R.get(e.brokenCamera).name]]:[]):type==='exit'?[[e.chapter.exit,R.get(e.chapter.exit).name]]:e.chapter.rooms.map(id=>[id,R.get(id).name]);
  for(const [val,name]of rows){const o=node('option',name);o.value=val;dest.append(o);}if(rows.some(r=>r[0]===e.camera))dest.value=e.camera;
 }
 function label(it){if(it.type==='wait')return `Attendre ${it.seconds} s sur place`;const name=R.get(it.room)?.name||it.room;
  return `${it.type==='hide'?'Se cacher':it.type==='task'?'Intervenir':it.type==='service'?e.chapter.services.find(s=>s.id===it.service).title:it.type==='repair'?'Réparer l’image':it.type==='exit'?'Rejoindre le sas':'Rejoindre'} — ${name}`;}
 function refreshPlan(){const q=e.v4.queues[planIndex];$('plan-title-v4').textContent=e.crew[planIndex].name+' / Itinéraire';
  const key=JSON.stringify(q);if(key!==listKey){listKey=key;const list=$('plan-list-v4');list.replaceChildren();
   const items=[...(q.current?[{item:q.current,current:true}]:[]),...q.items.map((item,i)=>({item,i}))];
   if(!items.length)list.append(node('p','Aucune consigne. Choisissez une destination puis ajoutez-la.','empty-v4'));
   items.forEach(({item,current,i},rank)=>{const row=node('div',undefined,'plan-step-v4');row.append(node('span',String(rank+1).padStart(2,'0'),'step-number-v4'),node('div',label(item)),node('small',current?'EN COURS':item.mode==='run'?'COURSE':item.mode==='walk'?'MARCHE':item.type==='wait'?'ATTENTE':'PRUDENT'));
    if(!current){const b=node('button','RETIRER','small ghost');b.onclick=()=>{if(e.canCommand()){q.items.splice(i,1);refreshPlan();}};row.append(b);}list.append(row);});
  }
  $('plan-status-v4').textContent=q.suspended?'File suspendue. Reprenez-la lorsque la situation est sûre.':q.blocked?'En attente : route fermée ou intervention précédente non terminée.':q.enabled?'File transmise. Elle continue même sans liaison radio.':'File préparée, pas encore transmise.';
  $('plan-add-v4').disabled=!e.link||q.items.length+(q.current?1:0)>=6;$('plan-run-v4').disabled=!e.link||(!q.current&&!q.items.length);$('plan-pause-v4').disabled=!e.link||!q.enabled;$('plan-clear-v4').disabled=!e.link;
 }
 function closePlan(){$('plan-dialog-v4').close();e.paused=planPaused||e.status!=='playing';app.refresh();}
 $('plan-open-v4').onclick=()=>{planIndex=e.selected;planPaused=e.paused;e.paused=true;listKey='';options();refreshPlan();$('plan-dialog-v4').showModal();app.refresh();};
 $('plan-close-v4').onclick=closePlan;$('plan-dialog-v4').addEventListener('cancel',ev=>{ev.preventDefault();closePlan();});$('plan-action-v4').onchange=options;
 $('plan-add-v4').onclick=()=>{const type=$('plan-action-v4').value,room=$('plan-room-v4').value,mode=$('plan-mode-v4').value;let item={type,room,mode};
  if(type==='wait'){if(!$('plan-wait-v4').reportValidity())return;item={type,seconds:Number($('plan-wait-v4').value)};}
  if(type==='task'){const task=e.chapter.tasks.find(t=>t.protocol.id===room);if(!task)return;item.room=task.room;item.taskId=task.protocol.id;}
  if(type==='service'){const s=e.chapter.services.find(s=>s.id===room);if(!s)return;item.room=s.room;item.service=s.id;}
  e.enqueue(planIndex,item);refreshPlan();};
 $('plan-run-v4').onclick=()=>{if(e.startQueue(planIndex))closePlan();};$('plan-pause-v4').onclick=()=>{e.pauseQueue(planIndex);refreshPlan();};$('plan-clear-v4').onclick=()=>{e.stop(planIndex);refreshPlan();};
 $('pin-v4').onclick=()=>{e.pinCamera();refresh();};$('cycle-v4').onclick=()=>{e.toggleCycle();refresh();};
 $('incident-view-v4').onclick=()=>{e.cameraTo(e.incident.room);app.setRefuge(false);app.refresh();};
 $('incident-order-v4').onclick=()=>{e.order(e.selected,e.incident.room,'service',e.incident.id);app.refresh();};
 const release=()=>{api.escapeAxis=0;api.escapeUse=false;e.setEscapeInput(0,false);};
 for(const [id,axis,use]of [['escape-left-v4',-1,false],['escape-right-v4',1,false],['escape-use-v4',0,true]]){const b=$(id);b.onpointerdown=ev=>{ev.preventDefault();b.setPointerCapture(ev.pointerId);api.escapeAxis=axis;api.escapeUse=use;};b.onpointerup=b.onpointercancel=b.onlostpointercapture=release;}
 window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 function refresh(){
  const q=e.v4.queues[e.selected],s=e.v4.escape,escaping=['running','failed','complete'].includes(s.phase);
  document.body.classList.toggle('escape-mode-v4',escaping);$('escape-controls-v4').hidden=!escaping;$('pause-layer').querySelector('small').textContent=escaping?'P pour reprendre la fuite.':'P pour reprendre la surveillance.';
  $('plan-open-v4').disabled=!e.link||escaping;$('queue-summary-v4').textContent=`${e.crew[e.selected].name} / ${q.items.length+(q.current?1:0)} consigne(s)${q.suspended?' · suspendu':q.blocked?' · bloqué':q.enabled?' · en route':''}`;
  if($('plan-dialog-v4').open)refreshPlan();
  $('pin-v4').textContent=e.v4.pins.includes(e.camera)?'RETIRER L’ÉPINGLE':'ÉPINGLER LA CAMÉRA';$('pin-v4').disabled=!e.link;
  $('cycle-v4').textContent='TOUR : '+(e.v4.cycle?'OUI':'NON');$('cycle-v4').disabled=!e.link||e.v4.pins.length<2;
  $('sweep-v4').textContent=e.sensor&&e.link?`BALAYAGE ${Math.max(0,e.v4.sweepLeft).toFixed(1)} s`:'CAPTEUR HORS LIGNE';
  const k=e.v4.pins.join('|')+e.camera;if(k!==pinKey){pinKey=k;$('pins-v4').replaceChildren(...e.v4.pins.map(id=>{const b=node('button',R.get(id).name,'small ghost');b.classList.toggle('on',id===e.camera);b.onclick=()=>{e.cameraTo(id);app.setRefuge(false);app.refresh();};return b;}));}
  $('contacts-v4').replaceChildren(...(e.contacts().length?e.contacts().map(c=>node('div',`${c.kind==='camera'?'● IMAGE':'◇ ÉCHO '+c.age.toFixed(1)+' s'} / ${R.get(c.room).name}`,c.kind==='camera'?'contact-live-v4':'contact-echo-v4')):[node('div','Aucun contact récent. Ce n’est pas un feu vert.','contact-empty-v4')]));
  const phase=e.v4.incident.phase,done=['prevented','repaired'].includes(phase),state=e.serviceState[e.incident.id];
  $('incident-v4').dataset.phase=phase;$('incident-state-v4').textContent={dormant:'PRÉVENTION',warning:'PRÉALERTE',active:'INCIDENT ACTIF',prevented:'PRÉVENU',repaired:'RÉPARÉ'}[phase];
  $('incident-title-v4').textContent=e.incident.title;$('incident-detail-v4').textContent=`${R.get(e.incident.room).name}. ${done?'Systèmes locaux stabilisés.':phase==='warning'?`Activation dans ${Math.max(0,Math.ceil(e.incident.warningAt+10-e.sectorElapsed))} s. `+e.incident.effect:e.incident.effect}`;
  $('incident-progress-v4').style.width=state.progress/10*100+'%';$('incident-order-v4').disabled=!e.link||done;$('incident-order-v4').textContent=done?'TERMINÉ':phase==='active'?'ENVOYER RÉPARER':'PRÉVENIR LA PANNE';
  if($('result-dialog').open){if(s.phase==='failed'){$('result-retry').textContent='REPRENDRE LA FUITE';$('result-retry').hidden=false;}else $('result-retry').textContent='RECOMMENCER LE SECTEUR';
   if(s.phase==='complete'){$('result-text').textContent=e.ending.text;$('recap-v3')?.querySelector('small')?.remove();}
  }
  if(escaping){$('timer').textContent=Math.ceil(s.left)+' s';$('sector-label').textContent='LIAISON 07 / 07 · DERNIER RELAIS';$('chapter-title').textContent='Amanda / Conduit d’évacuation';}
 }
 api.refresh=refresh;api.refreshPlan=refreshPlan;refresh();
})();
