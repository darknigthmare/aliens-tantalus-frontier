/* Accessible field controls. Normal interaction uses only public engine commands. */
(()=>{'use strict';const e=blackout,D=BO_DATA,R=BO.rooms,$=id=>document.getElementById(id);
 const mk=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const section=mk('section');section.className='field-panel-v6';section.dataset.controlsV6='';section.innerHTML=`<div class="panel-heading"><span>OPÉRATIONS DE TERRAIN</span><span id="field-stock-v6"></span></div><button id="evac-open-v6" class="primary">ORGANISER LE SECOURS</button><p id="field-status-v6" role="status"></p><details><summary>Balise acoustique · diversion différée</summary><p>Posée par l’équipier sélectionné. Quittez les lieux avant l’émission. Trois balises pour toute la campagne.</p><div class="field-row-v6"><label>RETARD<select id="beacon-delay-v6"><option value="5">5 secondes</option><option value="10" selected>10 secondes</option><option value="15">15 secondes</option></select></label><button id="beacon-deploy-v6">POSER · 3 s</button></div><p id="beacon-status-v6"></p></details>`;
 const manual=document.createElement('details');manual.className='manual-rescue-v6';const summary=mk('summary','Secours manuel / portage libre');manual.append(summary);$('rescue-panel-v5').before(section,manual);manual.append($('rescue-panel-v5'));let previousPatients=0;
 const mark=mk('button','MARQUER À ÉVITER');mark.id='field-mark-v6';mark.className='small ghost';mark.dataset.controlsV6='';$('watch-v4').append(mark);
 const dlg=mk('dialog');dlg.id='evac-dialog-v6';dlg.className='modal evac-dialog-v6';dlg.dataset.controlsV6='';dlg.innerHTML=`<header><div><div class="eyebrow">PLANIFICATION / SIMULATION EN PAUSE</div><h2 id="evac-title-v6">Protocole de secours</h2></div><button id="evac-close-v6">FERMER</button></header><div class="modal-content"><p>Rejoindre → porter → déposer au point de soins → réanimer. Le compte à rebours du patient continue dès la reprise.</p><div class="evac-form-v6"><label>PATIENT<select id="evac-target-v6"></select></label><label>POINT DE SOINS<select id="evac-room-v6"></select></label><label>ALLURE<select id="evac-mode-v6"><option value="run">Course</option><option value="walk">Marche</option><option value="sneak">Prudent</option></select></label></div><label class="check-row-v6"><input type="checkbox" id="evac-recent-v6" checked> Éviter les contacts reçus depuis moins de trois secondes</label><div class="evac-preview-v6"><div><span>DURÉE PRÉVUE</span><strong id="evac-time-v6">—</strong></div><div><span>MARGE THÉORIQUE</span><strong id="evac-margin-v6">—</strong></div></div><p id="evac-warning-v6" role="status"></p><div id="evac-path-v6"></div><h3>Pièces à éviter</h3><p class="small">Ces marquages affectent seulement les secours programmés. Le sauveteur peut quitter une pièce marquée où il se trouve déjà.</p><div id="evac-avoid-v6" class="avoid-grid-v6"></div><div class="row"><button id="evac-send-v6" class="primary">TRANSMETTRE LE PROTOCOLE</button><button id="evac-stop-v6">ANNULER LE PROTOCOLE ACTIF</button></div><p class="notice">Estimation d’après le trajet, la santé, l’allure et la vapeur actuels. Les futures attaques, portes et attentes ne sont pas prédites. Ni ce point de soins ni l’absence d’écho ne garantissent la sécurité. Le portage ne suspend pas le délai.</p></div>`;document.body.append(dlg);
 let paused=true,index=0;
 function input(){return {target:Number($('evac-target-v6').value),room:$('evac-room-v6').value,recent:$('evac-recent-v6').checked};}
 function preview(){if(!dlg.open)return;const c=e.crew[index],values=input();const p=e.previewEvacuation(index,values.target,values.room,values.recent,$('evac-mode-v6').value);
  $('evac-title-v6').textContent=c.name+' / Secours';$('evac-time-v6').textContent=p.ok?Math.ceil(p.seconds)+' s':'—';$('evac-margin-v6').textContent=p.ok?(p.margin>=0?'+':'')+Math.floor(p.margin)+' s':'—';$('evac-margin-v6').dataset.low=p.ok&&p.margin<8?'yes':'no';
  $('evac-warning-v6').textContent=p.ok?(p.margin<=0?'Délai probablement insuffisant avec cet itinéraire.':p.margin<8?'Marge très faible : le moindre retard peut condamner le secours.':p.reason):p.reason;
  const paths=$('evac-path-v6');paths.replaceChildren();if(p.ok){for(const [label,route]of [['APPROCHE',p.approach],['PORTAGE',p.transport]]){const row=mk('div');row.append(mk('small',label),mk('p',route.map(id=>R.get(id).name).join(' → ')));paths.append(row);}}
  $('evac-send-v6').disabled=!e.link||!p.ok;$('evac-stop-v6').disabled=!e.link||!e.v6.plans[index];
  $('evac-avoid-v6').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(e.v6.avoid.includes(b.dataset.room))));
 }
 function open(){index=e.selected;paused=e.paused;e.paused=true;
  const t=$('evac-target-v6');t.replaceChildren();e.crew.forEach((c,i)=>{if(c.alive&&e.isIncapacitated(c)){const o=mk('option',c.name+' · '+Math.ceil(e.v5.members[c.id].left)+' s');o.value=i;t.append(o);}});
  if(!t.options.length){const o=mk('option','Aucun patient au sol');o.value='-1';t.append(o);}
  const dest=$('evac-room-v6'),marks=$('evac-avoid-v6');dest.replaceChildren();marks.replaceChildren();
  e.chapter.rooms.forEach(id=>{const o=mk('option',R.get(id).name);o.value=id;dest.append(o);const b=mk('button',R.get(id).name);b.dataset.room=id;b.onclick=()=>{e.markAvoid(id);preview();};marks.append(b);});
  dest.value=e.crew[index].room;$('evac-mode-v6').value=e.crew[index].mode;dlg.showModal();preview();app.refresh();
 }
 function close(){dlg.close();e.paused=paused||e.status!=='playing';app.refresh();}
 $('evac-open-v6').onclick=open;$('evac-close-v6').onclick=close;dlg.addEventListener('cancel',ev=>{ev.preventDefault();close();});
 ['evac-target-v6','evac-room-v6','evac-mode-v6','evac-recent-v6'].forEach(id=>$(id).onchange=preview);
 $('evac-send-v6').onclick=()=>{const v=input(),old=e.crew[index].mode;e.mode($('evac-mode-v6').value,index);if(e.evacuate(index,v.target,v.room,v.recent))close();else{e.mode(old,index);preview();}};
 $('evac-stop-v6').onclick=()=>{e.stop(index);preview();};mark.onclick=()=>{e.markAvoid();refresh();};
 $('beacon-deploy-v6').onclick=()=>{e.deployBeacon(e.selected,Number($('beacon-delay-v6').value));app.refresh();};
 function refresh(){const c=e.crew[e.selected],p=e.v6.plans[e.selected],j=e.v6.jobs[e.selected],m=e.v5.members[c.id];
  const patients=e.crew.filter(c=>c.alive&&e.isIncapacitated(c)).length;if(patients>previousPatients)manual.open=true;previousPatients=patients;summary.textContent='Secours manuel · '+e.v3.medkits+' trousse(s)';
  $('field-stock-v6').textContent=e.v6.stock+' BALISE(S)';$('evac-open-v6').disabled=!e.link||!e.capable(e.selected)||e.escapeActive;
  $('field-status-v6').textContent=p?`${p.stage==='pickup'?'Approche et levage':p.stage==='transport'?'Portage':'Réanimation'} → ${R.get(p.room).name}${p.blocked?' · trajet / gestes suspendus':''}`:'Une seule transmission pour porter puis réanimer. Aucune ouverture de porte automatique.';
  $('beacon-deploy-v6').disabled=!e.link||!e.capable(e.selected)||e.v6.stock<1||!!m.carrying||!!m.aid||!!p||!!j||e.v3.members[c.id].medical>0;
  $('beacon-status-v6').textContent=j?`Pose : ${j.progress.toFixed(1)} / 3 s. Stock débité à la fin.`:e.v6.beacons.filter(b=>b.life>0).map(b=>`${R.get(b.room).name} : ${b.wait>0?'déclenchement dans '+Math.ceil(b.wait)+' s':'émission · '+Math.ceil(b.life)+' s'}`).join(' / ')||'Aucune balise active. La pose révèle votre position et demande de rester immobile.';
  mark.textContent=e.v6.avoid.includes(e.camera)?'RETIRER LE MARQUAGE':'MARQUER À ÉVITER';mark.setAttribute('aria-pressed',String(e.v6.avoid.includes(e.camera)));mark.disabled=!e.link;
  for(const [i,a]of e.crew.entries()){if(e.v6.jobs[i])$('crew-'+i).children[2].textContent='Pose une balise';else if(e.v6.plans[i])$('crew-'+i).children[2].textContent=e.v6.plans[i].blocked?'Secours en attente':'Protocole de secours';}
  if(dlg.open)preview();
 }
 function clearStoredSave(storage){if(!storage||typeof storage.removeItem!=='function')throw new TypeError('Stockage indisponible.');storage.removeItem('tantalus.dlc.blackout.save.v7');}
 $('clear-slot-v3').textContent='EFFACER UNIQUEMENT LA SAUVEGARDE V7';$('clear-slot-v3').nextElementSibling.textContent='Les emplacements v1 à v6 sont conservés. Exportez votre JSON avant d’effacer.';
 $('clear-slot-v3').onclick=()=>{if(!confirm('Effacer uniquement la sauvegarde locale v0.6 ?'))return;try{clearStoredSave(localStorage);$('save-status').textContent='Emplacement v0.6 effacé. Les versions précédentes sont conservées.';}catch{$('save-status').textContent='Stockage refusé par le navigateur. Aucun fichier JSON n’a été effacé.';}};
 window.BO_UI6={refresh,clearStoredSave};refresh();
})();
