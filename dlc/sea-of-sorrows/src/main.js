/* Browser shell: local-only persistence, accessible modal controls and no network dependency. */
(function(){'use strict';
const D=SoSData,g=new SoSCore.Game(),$=id=>document.getElementById(id),canvas=$('scene'),renderer=new SoSRenderer(canvas,g);
const SAVE=D.meta.saveNamespace,SETTINGS=SAVE+'.settings',RECOVERY=SAVE+'.recovery';
const vault=new SoSSupport.SaveVault(()=>localStorage,SAVE,raw=>{const probe=new SoSCore.Game();probe.importSave(raw);return true;});
let capturingBinding=null,optionsGroup='Déplacement',audioPreviewUntil=0;
let started=false,focusLost=false,firing=false,pointer=null,touchAim=null,storyQueue=[],storyAction=null,last=performance.now(),hudAt=0,autoAt=0,toastTimer,arrivalTimer,returnFocus=null;
const keys=new Set(),blockedKeys=new Set(),screens=['menu','panel','story','tactical'];
const padInput=new SoSControls.PadInput();let padState=null,padActive=false,padCursor=null,padNavAt=0,workTool='use',wheelPage=0,wheelSelection=0;
const esc=t=>String(t).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function readSaved(){try{return localStorage.getItem(SAVE);}catch(e){$('saveWarning').textContent='Stockage indisponible. Exportez votre sauvegarde depuis Pause.';return null;}}
function persist(){
 if(!started)return false;
 const result=vault.write(g.exportSave());$('saveWarning').textContent=result.ok?'':result.message;
 $('saveBadge').textContent=result.ok?'COPIE LOCALE RELUE':'EXPORT CONSEILLÉ';$('saveBadge').dataset.ok=String(result.ok);
 $('saveBadge').title=result.message;if(result.ok)$('continueBtn').disabled=false;return result.ok;
}
let settings={sound:false,reduced:false,contrast:false,brightness:1,audio:{},controls:{}};
try{const s=JSON.parse(localStorage.getItem(SETTINGS)||'{}');if(s&&typeof s==='object')for(const k of Object.keys(settings))if(typeof s[k]===typeof settings[k])settings[k]=s[k];}catch(e){}
const bindings=new SoSSupport.Bindings(settings.controls),keyboard=new SoSSupport.Keyboard(bindings),cueBus=new SoSSoundscape.CueBus();
const keyHeld=code=>keys.has(code)||keyboard.has(code);
settings.audio=SoSSoundscape.preferences({...settings.audio,enabled:settings.sound});
settings.controls=bindings.export();
$('sound').checked=settings.sound;$('reduceMotion').checked=settings.reduced;$('contrast').checked=settings.contrast;$('brightness').value=SoSCore.clamp(settings.brightness,.8,1.5);
function paused(){return !started||focusLost||document.hidden||screens.some(id=>$(id).classList.contains('open'));}
function clearInput(){keyboard.rearm();audioPreviewUntil=0;for(const k of keys)blockedKeys.add(k);keys.clear();firing=false;touchAim=null;g.activeWork=null;padInput.rearm();padState=null;}
function open(id){clearInput();returnFocus=document.activeElement;$(id).classList.add('open');setTimeout(()=>$(id).querySelector('button:not(:disabled),input,select')?.focus(),0);}
function close(id){if(id==='panel')capturingBinding=null;$(id).classList.remove('open');clearInput();if(returnFocus?.isConnected)returnFocus.focus();}
function toast(text){$('toast').textContent=hintText(text);$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3400);}
function arrival(text){$('roomArrival').textContent=text;$('roomArrival').classList.add('show');clearTimeout(arrivalTimer);arrivalTimer=setTimeout(()=>$('roomArrival').classList.remove('show'),2200);}
const audio=new SoSSoundscape.Mixer(settings.audio);
function hintText(text){
 const ids={E:'use',G:'shutter',K:'repair',P:'sensor',L:'lamp',T:'tracker',R:'reload',F:'decoy',H:'heal',X:'filter',V:'companion',Y:'rally',N:'fireMode',B:'convoy',O:'wheel',Tab:'map',J:'codex',I:'inventory',U:'journal',F6:'presentation',Espace:'focus',ESPACE:'focus',Ctrl:'dodge',CTRL:'dodge',Majuscule:'run'};
 return String(text).replace(/\b(Espace|ESPACE|Majuscule|Ctrl|CTRL|Tab|F6|[EGKPLTRFHXVYNBOJIU])\b/g,m=>bindings.primary(ids[m]));
}
function adaptHints(element){if(!element)return;const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){if(!n.parentElement.closest('script,style,kbd,.optionsBody'))n.textContent=hintText(n.textContent);}}
function commitSettings(){
 settings.controls=bindings.export();settings.audio=SoSSoundscape.preferences({...settings.audio,enabled:settings.sound});
 applySettings();audio.configure(settings.audio);
 try{localStorage.setItem(SETTINGS,JSON.stringify(settings));return true;}catch(e){toast('Réglages actifs pour cette session seulement. Le stockage local est indisponible.');return false;}
}
function applySettings(){renderer.reduced=!!settings.reduced;renderer.exposure=Number($('brightness').value)||1;document.body.classList.toggle('reduced',!!settings.reduced);document.body.classList.toggle('contrast',!!settings.contrast);}
function saveSettings(){settings.sound=$('sound').checked;settings.reduced=$('reduceMotion').checked;settings.contrast=$('contrast').checked;settings.brightness=Number($('brightness').value);commitSettings();if(settings.sound)audio.unlock();audio.set(settings.sound&&!paused());}
for(const id of['sound','reduceMotion','contrast','brightness'])$(id).onchange=saveSettings;
applySettings();$('continueBtn').disabled=!readSaved();
$('presentation').onchange=()=>{g.setPresentation($('presentation').value);if(started)persist();};
function begin(load=false){
 try{
  if(load){const raw=readSaved();if(!raw)throw Error('Aucune sauvegarde à reprendre.');
   g.importSave(raw);if(JSON.parse(raw).schema<8){try{localStorage.setItem(SAVE+'.backup-v'+JSON.parse(raw).schema,raw);}catch(e){toast('Migration terminée. Exportez une copie de votre expédition.');}}
  }else g.newGame({difficulty:$('difficulty').value,presentation:$('presentation').value});
 }catch(e){$('saveWarning').textContent=e.message;return;}
 cueBus.reset();started=true;focusLost=false;storyQueue=[];screens.forEach(close);$('difficulty').value=g.state.difficulty;$('presentation').value=g.state.presentation;
 persist();handleEvents();
 if(!load)showStory({title:'Le relevé',text:'New Galveston. Le vent pousse une poussière noire contre les installations. Vous êtes venu inspecter un chantier, pas écouter ce qui attend dessous.'});
 if(load&&g.state.failed)showStory({title:'Expédition interrompue',text:g.state.failed},retry);
 if(load&&g.state.finished)showSummary();if(settings.sound)audio.unlock();audio.set(settings.sound&&!paused());
}
function retry(){g.retry();handleEvents();persist();}
$('continueBtn').onclick=()=>begin(true);
$('newBtn').onclick=()=>{
 if(readSaved()){
  showPanel('Nouvelle traversée','CONFIRMATION','<p>Remplacer l’expédition en cours ? Pensez à exporter votre sauvegarde avant de repartir.</p><div class="pauseActions"><button id="confirmNew" class="primary">Commencer</button><button id="cancelNew">Annuler</button></div>');
  $('confirmNew').onclick=()=>begin(false);$('cancelNew').onclick=()=>close('panel');
 }else begin(false);
};
function showPanel(title,kicker,html){$('panelTitle').textContent=title;$('panelKicker').textContent=kicker;$('panelContent').innerHTML=html;open('panel');}
$('closePanel').onclick=()=>close('panel');
function readRecoveries(){
 try{const raw=localStorage.getItem(RECOVERY);if(!raw||raw.length>6000000)return [];
  const entries=JSON.parse(raw);if(!Array.isArray(entries))return [];
  return entries.slice(0,3).filter(item=>{try{if(!item||typeof item.data!=='string')return false;const check=new SoSCore.Game();check.importSave(item.data);return !check.state.failed&&!check.state.finished;}catch(e){return false;}});
 }catch(e){return [];}
}
function recordRecovery(){
 if(!started||g.state.failed||g.state.finished)return;
 try{const data=g.exportSave(),entries=readRecoveries();if(entries[0]?.data===data)return;
  localStorage.setItem(RECOVERY,JSON.stringify([{data},...entries].slice(0,3)));$('recoveryBtn').disabled=false;
 }catch(e){toast('Copie de repli indisponible. Exportez votre sauvegarde depuis Pause.');}
}
function showRecovery(){
 const entries=readRecoveries();
 showPanel('Points de repli','TROIS DERNIÈRES ENTRÉES DE SALLE',`<p>Restaurer un point remplace l’expédition en cours. Les événements survenus après cette entrée seront annulés. Exportez d’abord votre partie pour en conserver une copie.</p><div class="recoveryGrid">${entries.map((item,i)=>{const q=new SoSCore.Game();q.importSave(item.data);return `<article><small>REPLI ${i+1} · ${esc(D.difficulties[q.state.difficulty].label)}</small><h3>${esc(q.room.name)}</h3><p>${q.state.completed.length} / 33 objectifs · ${Math.floor(q.state.stats.time/60)} min · ${Math.ceil(q.p.hp)} % d’état</p><button data-recover="${i}">Choisir ce point</button></article>`;}).join('')||'<p>Aucun point de repli valide. Importez une sauvegarde exportée.</p>'}</div>`);
 $('panelContent').querySelectorAll('[data-recover]').forEach(b=>b.onclick=()=>{
  const data=entries[Number(b.dataset.recover)].data;
  showPanel('Restaurer le point de repli ?','CONFIRMATION','<p>La progression actuelle sera remplacée par celle de cette entrée de salle.</p><div class="pauseActions"><button id="confirmRecovery">Restaurer</button><button id="cancelRecovery">Annuler</button></div>');
  $('cancelRecovery').onclick=showRecovery;
  $('confirmRecovery').onclick=()=>{try{g.importSave(data);started=true;focusLost=false;storyQueue=[];screens.forEach(close);$('difficulty').value=g.state.difficulty;$('presentation').value=g.state.presentation;persist();handleEvents();toast('Point de repli restauré.');}catch(e){toast(e.message);}};
 });
}
function showJournal(){
 if(!started)return;
 const rows=[...g.state.pursuit.journal].reverse();
 showPanel('Journal de terrain','ÉVÉNEMENTS OBSERVÉS · U',`<p>Les 24 derniers faits consignés. Ce journal n’indique pas les positions ennemies et ne compte pas les créatures à distance.</p><div class="fieldJournal">${rows.map(j=>`<article><small>${Math.floor(j.time/60).toString().padStart(2,'0')}:${Math.floor(j.time%60).toString().padStart(2,'0')} · ${esc(SoSCore.ROOMS[j.room].name)}</small><p>${esc(j.text)}</p></article>`).join('')||'<p>Aucun fait tactique consigné pour le moment.</p>'}</div>`);
}
$('recoveryBtn').onclick=showRecovery;$('recoveryBtn').disabled=readRecoveries().length===0;
function showOptions(tab='audio',group=optionsGroup){
 capturingBinding=null;optionsGroup=group;
 const tabs=[['audio','Son et légendes'],['keyboard','Clavier'],['display','Affichage'],['saves','Sauvegardes']];
 const head='<nav class="optionsTabs" aria-label="Catégories de réglages">'+tabs.map(([id,label])=>`<button data-options="${id}" class="${tab===id?'selected':''}" aria-pressed="${tab===id}">${label}</button>`).join('')+'</nav>';
 let body='';
 if(tab==='audio'){
  const p=settings.audio;
  body=`<div class="optionsIntro"><small>01 / ÉCOUTE DE TERRAIN</small><h3>Entendre sans perdre le signal.</h3><p>Sons synthétisés localement. Les réglages ne modifient jamais le bruit entendu par les créatures.</p></div><div class="audioLayout"><section class="audioSwitches"><label><input id="mixEnabled" type="checkbox" ${settings.sound?'checked':''}> Activer le son</label><label><input id="captionEnabled" type="checkbox" ${p.captions?'checked':''}> Légendes d’événements</label><p class="hint">Les légendes restent disponibles sans son. Elles ne donnent aucune position ennemie supplémentaire.</p><button id="testSound" ${settings.sound?'':'disabled'}>Écouter un signal de test</button><p id="audioMessage" role="status">${esc(audio.error||'Le son est suspendu dans les menus, sauf pendant ce test explicite.')}</p></section><section class="mixSliders">${[['master','Volume général'],['ambience','Ambiance du lieu'],['effects','Gestes et impacts'],['alerts','Signaux et alertes']].map(([id,label])=>`<label for="mix-${id}"><span>${label}</span><output id="out-${id}">${Math.round(p[id]*100)} %</output><input id="mix-${id}" data-mix="${id}" type="range" min="0" max="100" step="1" value="${Math.round(p[id]*100)}" aria-label="${label}"></label>`).join('')}</section></div>`;
 }else if(tab==='keyboard'){
  const groups=[...new Set(SoSSupport.ACTIONS.map(a=>a.group))];if(!groups.includes(group))group=groups[0];optionsGroup=group;
  body=`<div class="optionsIntro"><small>02 / COMMANDES PERSONNELLES</small><h3>Chaque geste, à ta main.</h3><p>Choisissez une commande puis pressez une touche. La nouvelle touche remplace ses anciens raccourcis. Une affectation en conflit est refusée.</p></div><div class="bindingGroups">${groups.map(k=>`<button data-bindgroup="${esc(k)}" class="${k===group?'selected':''}">${esc(k)}</button>`).join('')}</div><p id="bindingMessage" role="status">Échap annule une affectation. Échap, Entrée et Tab gardent leur rôle de navigation dans les menus.</p><div class="bindingsList">${SoSSupport.ACTIONS.filter(a=>a.group===group).map(a=>`<article><span>${esc(a.label)}</span><button data-bind="${a.id}" aria-label="Modifier ${esc(a.label)}"><kbd>${esc(bindings.label(a.id))}</kbd><span>Modifier</span></button></article>`).join('')}</div><p class="hint">Sans affectation personnalisée, les lettres indiquent les positions physiques du clavier ; flèches et positions ZQSD/WASD sont disponibles. Après saisie, le libellé reçu de votre clavier est conservé. Tir et visée à la souris inchangés.</p><button id="resetBindings">Rétablir toutes les touches</button>`;
 }else if(tab==='display'){
  body=`<div class="optionsIntro"><small>03 / LISIBILITÉ</small><h3>Garder le terrain lisible.</h3><p>Ces réglages modifient l’affichage, pas la perception des adversaires.</p></div><div class="displayOptions"><label><input id="displayReduced" type="checkbox" ${settings.reduced?'checked':''}> Mouvements d’interface réduits</label><label><input id="displayContrast" type="checkbox" ${settings.contrast?'checked':''}> Contraste renforcé</label><label for="displayBrightness">Luminosité de l’affichage <input id="displayBrightness" type="range" min="0.8" max="1.5" step="0.1" value="${settings.brightness}"></label></div>`;
 }else{
  const status=vault.inspect(),desc=raw=>{try{const q=JSON.parse(raw).state;return esc(SoSCore.ROOMS[q.room].name)+' · '+q.completed.length+' / 33 objectifs · '+Math.floor(q.stats.time/60)+' min';}catch(e){return 'Aucune copie lisible';}};
  body=`<div class="optionsIntro"><small>04 / COPIES LOCALES</small><h3>Une reprise, pas une promesse.</h3><p>Chaque nouvelle écriture est relue. Une copie valide précédente est protégée avant de remplacer la sauvegarde courante.</p></div><div class="saveCards"><article><small>SAUVEGARDE COURANTE</small><h3>${status.current?'Lisible':status.currentPresent?'Illisible':'Absente'}</h3><p>${status.current?desc(status.raw):'L’expédition en mémoire reste exportable tant que la page est ouverte.'}</p><button id="exportFromOptions" ${started||status.current?'':'disabled'}>Exporter une copie</button></article><article><small>DERNIÈRE COPIE VALIDE</small><h3>${status.backup?'Disponible':'Absente'}</h3><p>${status.backup?desc(status.backupRaw):'Créée lors d’une première sauvegarde vérifiée.'}</p><button id="restoreLastValid" ${status.backup?'':'disabled'}>Examiner la reprise</button></article></div><p class="saveDiagnostic" role="status">${esc(status.available?vault.last.message:'Stockage bloqué : export externe recommandé.')}</p><p class="hint">Ces deux copies et les trois points de repli restent sur ce navigateur et cette origine. Les données peuvent disparaître ensemble si le stockage est effacé. Une relecture n’est pas une garantie de conservation sur disque.</p><button id="importFromOptions">Importer un export externe</button><input id="optionsSaveFile" type="file" accept=".json,application/json" hidden>`;
 }
 showPanel('Réglages de terrain','LES ÉCHOS DU TERRAIN · 0.9',head+'<div class="optionsBody">'+body+'</div>');
 $('panelContent').querySelectorAll('[data-options]').forEach(b=>b.onclick=()=>showOptions(b.dataset.options));
 if(tab==='audio'){
  $('mixEnabled').onchange=()=>{settings.sound=$('mixEnabled').checked;$('sound').checked=settings.sound;commitSettings();if(settings.sound)audio.unlock();$('testSound').disabled=!settings.sound;};
  $('captionEnabled').onchange=()=>{settings.audio.captions=$('captionEnabled').checked;commitSettings();};
  $('panelContent').querySelectorAll('[data-mix]').forEach(n=>n.oninput=()=>{settings.audio[n.dataset.mix]=Number(n.value)/100;$('out-'+n.dataset.mix).textContent=n.value+' %';commitSettings();});
  $('testSound').onclick=()=>{if(!settings.sound)return;audio.unlock();audioPreviewUntil=performance.now()+1000;audio.set(true);$('audioMessage').textContent='Signal de test uniquement — aucune action dans la mission.';setTimeout(()=>{if(performance.now()<audioPreviewUntil)audio.play({kind:'sensor',pan:0});},100);};
 }else if(tab==='keyboard'){
  $('panelContent').querySelectorAll('[data-bindgroup]').forEach(b=>b.onclick=()=>showOptions('keyboard',b.dataset.bindgroup));
  $('panelContent').querySelectorAll('[data-bind]').forEach(b=>b.onclick=()=>{clearInput();capturingBinding=b.dataset.bind;$('bindingMessage').textContent='Nouvelle touche pour « '+SoSSupport.ACTIONS.find(a=>a.id===capturingBinding).label+' » ? Échap pour annuler.';});
  $('resetBindings').onclick=()=>{showPanel('Rétablir les touches ?','CONFIRMATION','<p>Toutes les affectations personnelles seront remplacées par les commandes d’origine. Les préférences sonores sont conservées.</p><div class="pauseActions"><button id="confirmKeys">Rétablir</button><button id="cancelKeys">Annuler</button></div>');$('cancelKeys').onclick=()=>showOptions('keyboard');$('confirmKeys').onclick=()=>{keyboard.rearm();bindings.reset();commitSettings();showOptions('keyboard');};};
 }else if(tab==='display'){
  $('displayReduced').onchange=()=>{$('reduceMotion').checked=settings.reduced=$('displayReduced').checked;commitSettings();};
  $('displayContrast').onchange=()=>{$('contrast').checked=settings.contrast=$('displayContrast').checked;commitSettings();};
  $('displayBrightness').oninput=()=>{$('brightness').value=settings.brightness=Number($('displayBrightness').value);commitSettings();};
 }else{
  const downloadRaw=raw=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.href=url;a.download='MER_DES_CHAGRINS_COPIE_EXTERNE.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
  $('exportFromOptions').onclick=()=>downloadRaw(started?g.exportSave():vault.primary());
  $('restoreLastValid').onclick=()=>{const raw=vault.inspect().backupRaw;if(!vault.valid(raw)){toast('Cette copie n’est plus disponible.');return;}
   const q=JSON.parse(raw).state;showPanel('Revenir à cette copie ?','CONFIRMATION',`<p>${esc(SoSCore.ROOMS[q.room].name)} · ${q.completed.length} / 33 objectifs. La progression actuelle sera remplacée. Exportez-la d’abord pour la garder.</p><div class="pauseActions"><button id="confirmLastValid">Restaurer cette copie</button><button id="cancelLastValid">Annuler</button></div>`);
   $('cancelLastValid').onclick=()=>showOptions('saves');$('confirmLastValid').onclick=()=>applyExternalSave(raw);
  };
  $('importFromOptions').onclick=()=>$('optionsSaveFile').click();$('optionsSaveFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>2000000)throw Error('Fichier trop volumineux.');applyExternalSave(await f.text());}catch(error){toast(error.message);}};
 }
}
function applyExternalSave(raw){try{g.importSave(raw);cueBus.reset();started=true;focusLost=false;storyQueue=[];screens.forEach(close);$('difficulty').value=g.state.difficulty;$('presentation').value=g.state.presentation;handleEvents();persist();if(g.state.failed)showStory({title:'Expédition interrompue',text:g.state.failed},retry);else if(g.state.finished)showSummary();toast('Expédition restaurée.');}catch(e){toast(e.message);}}
$('optionsBtn').onclick=()=>showOptions();

function showHelp(){showPanel('Guide de terrain','COMMANDES ET EXPÉDITION',`<p class="storeNote"><b>Les échos du terrain · 0.9.</b> Son et légendes, 31 commandes personnalisables et copie locale vérifiée dans Réglages.  Quatre annexes reliées et dix casiers. Maintenir E près du meuble avec Interaction sélectionnée ouvre son scellé en 2,4 secondes ; choisir ensuite ce qui est emporté. Équipement → Stocks repérés permet de relire les réserves laissées sur place.</p><div class="controlGrid"><b>O · P · Manette standard</b><span>Roue tactique en pause / poser ou récupérer un capteur. <button id="controllerHelp">Commandes de manette</button></span>
<b>U · Points de repli dans Pause</b><span>Journal tactique / trois dernières entrées de salle conservées séparément. Leur restauration remplace la partie en cours après confirmation.</span><b>G maintenu / E sur pupitre</b><span>Manœuvrer une cloison. Chaque côté possède une commande. Une présence dans la course interdit la fermeture.</span>
<b>Clic droit au sol / Y</b><span>Manning rejoint cette position puis la couvre ; V le rappelle. Les passages fermés restent bloquants.</span>
<b>Espace, immobile</b><span>Écouter les huit rémanences facultatives. Trois secondes de lecture au-delà de 28 de pression. Ce sont des impressions, pas des preuves.</span>
<b>Flèches / ZQSD / WASD</b><span>Marcher. Haut et bas permettent de contourner les obstacles dans les salles en profondeur.</span>
<b>E / E maintenu</b><span>Franchir un seuil, lire un dossier / effectuer un relevé, réparer ou préparer un brancard. Relâcher conserve le travail réalisé.</span>
<b>Souris + clic</b><span>Viser directement la silhouette et tirer. Les obstacles interceptent les tirs.</span>
<b>1 / 2 / 3 · R</b><span>Pistolet / mousse / lance-flammes · Recharger. Le nouveau chargeur n’est prêt qu’à la fin du geste.</span>
<b>Espace · C · Majuscule</b><span>Concentration empathique · Accroupissement silencieux · Course.</span>
<b>L · T · F</b><span>Lampe · Détecteur lorsqu’il est disponible · Leurre acoustique vers le pointeur.</span>
<b>H · X · I</b><span>Soins · Filtre de rechange · Équipement.</span>
<b>V · N</b><span>Manning : suivre / tenir · Riposte seulement / feu libre / ne pas tirer.</span>
<b>B · K maintenu</b><span>Convoi : suivre / halte · Réparer un brancard proche arrêté (3 secondes et un renfort).</span><b>Ctrl + direction</b><span>Esquive de 28 points d’endurance. Sans direction : un pas en arrière. Les obstacles restent bloquants.</span>
<b>Tab · J · Échap · F6</b><span>Carte · Dossiers · Pause · Vue hybride / latérale.</span>
</div><div class="helpSection"><h3>Une porte ne coupe pas la traque</h3><p>Une créature ayant un contact visuel récent à moins de sept mètres peut vous suivre sur un passage compatible. Elle rejoint physiquement le seuil, puis des griffes annoncent son arrivée. Une fuite silencieuse ou un leurre peut rompre le contact avant de sortir. Les vols, transferts scénarisés, ascenseur principal et arènes de la reine et de capture restent isolés.</p><h3>Ne laisser personne derrière</h3><p>Maintenez E auprès de chaque porteur pour préparer son brancard. Les deux suivent ensuite le groupe. Leur allure est plus lente que votre course : attendez-les aux seuils. Une cloison fermée les séparant du seuil interdit la transition ; Manning doit lui aussi être rassemblé. V le rappelle. Les attaques peuvent détruire les châssis. Dans la soute, utilisez les berceaux de transport avant de capturer le spécimen.</p><h3>Éclairage de travail</h3><p>Dix pupitres locaux permettent de couper ou rétablir la lumière en maintenant E pendant deux secondes. Le balisage de secours reste actif. Éteignez aussi votre lampe pour réduire la portée visuelle adverse ; bruit et mémoire persistent. Cela ne coupe ni les objectifs, ni les dangers.</p><h3>Allures du convoi</h3><p>Pause ou Équipement → Ordres d’escorte : Standard, Rapproché ou Discret. Les roues font du bruit pendant leur déplacement. Aucun changement de formation ne téléporte les patients.</p><h3>Le bruit porte</h3><p>Les tirs, la course et les treuils attirent les présences proches. Un ennemi ayant perdu le contact fouille le dernier endroit perçu. Un leurre l’attire vers un point, mais ne vous rend pas invisible.</p><h3>Ramener un être vivant</h3><p>Attirez l’adulte près du caisson, immobilisez-le avec la mousse, puis verrouillez. Une balle perdue peut condamner l’expédition. Manning ne tire pas sur le spécimen.</p><h3>Des passages sous pression</h3><p>Les dangers passent par une période calme, un avertissement puis une phase active. Une vanne ou un coupe-circuit peut les isoler définitivement. La carte locale montre leur emprise. Les attaques des créatures sont annoncées au sol : sortez de la zone avant la frappe.</p><h3>La pondeuse</h3><p>Brûlez les trois attaches avant de concentrer les tirs sur la reine.</p><p class="hint">Les lectures mettent le jeu en pause. Les salles annexes sont facultatives. Clavier et souris recommandés. Les commandes tactiles ne couvrent pas encore toutes les actions ; un profil de manette standard est disponible.</p></div>`);$('controllerHelp').onclick=showControllerHelp;adaptHints($('panelContent'));}
$('helpBtn').onclick=showHelp;
function exportSave(){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([g.exportSave()],{type:'application/json'}));a.href=url;a.download='MER_DES_CHAGRINS_SAUVEGARDE.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function showPause(){
 if(!started)return;
 showPanel('Expédition en pause',g.room.name,`<p>${esc(g.missionHint())}</p><div class="pauseActions"><button id="resumePlay" class="primary">Reprendre</button><button id="saveNow">Sauvegarder</button><button id="exportSave">Exporter</button><button id="importSave">Importer</button><button id="helpPause">Commandes</button><button id="optionsPause">Réglages</button><button id="referencePause">Fidélité et sources</button><button id="wheelPause">Roue tactique</button><button id="sensorsPause">Capteurs</button><button id="escortPause">Ordres d’escorte</button><button id="journalPause">Journal de terrain</button><button id="recoveryPause">Points de repli</button><button id="changeView">Changer de vue</button><button id="retryRoom">Reprendre la salle</button><button id="backMenu">Écran titre</button></div><input id="saveFile" type="file" accept=".json,application/json" hidden><p class="hint">Chaque entrée de salle crée un point de reprise. L’exportation permet de garder une copie de l’expédition.</p>`);
 $('resumePlay').onclick=()=>close('panel');$('saveNow').onclick=()=>toast(persist()?'Expédition enregistrée.':'Stockage indisponible. Utilisez Exporter.');$('exportSave').onclick=exportSave;
 $('importSave').onclick=()=>$('saveFile').click();$('saveFile').onchange=async ev=>{
  const f=ev.target.files[0];if(!f)return;
  try{if(f.size>2000000)throw Error('Fichier trop volumineux.');g.importSave(await f.text());close('panel');handleEvents();persist();if(g.state.failed)showStory({title:'Expédition interrompue',text:g.state.failed},retry);else if(g.state.finished)showSummary();toast('Expédition restaurée.');}catch(e){toast(e.message);}
 };
 $('referencePause').onclick=()=>showFidelity();$('escortPause').onclick=showEscort;$('journalPause').onclick=showJournal;$('recoveryPause').onclick=showRecovery;
 $('wheelPause').onclick=()=>{close('panel');showTactical();};$('sensorsPause').onclick=showSensors;$('helpPause').onclick=showHelp;$('optionsPause').onclick=()=>showOptions('audio');$('changeView').onclick=()=>{g.setPresentation(g.state.presentation==='HYBRID'?'CLASSIC':'HYBRID');$('presentation').value=g.state.presentation;handleEvents();persist();};
 $('retryRoom').onclick=()=>{close('panel');retry();};$('backMenu').onclick=()=>{persist();close('panel');open('menu');};
}
$('pauseBtn').onclick=showPause;

function showArmory(){
 if(!started)return;const kit=g.state.armory;
 const cards=D.fidelity.weapons.filter(w=>['pistol','foam','flame','pulse','plasma'].includes(w.id)).map(w=>`<article class="referenceCard"><small>${esc(w.status.replaceAll('_',' '))}</small><h3>${esc(w.name)}</h3><p>${esc(w.limits)}</p><button data-equip="${w.id}" ${g.weaponOwned(w.id)&&g.p.reload<=0?'':'disabled'}>${g.p.weapon===w.id?'En main':'Équiper'}</button></article>`).join('');
 showPanel('Armes de l’expédition','DOTATION FINIE · INTERPRÉTATION JOUABLE',`<p>Le Reaper conserve les anciennes réserves. Les deux fusils sont une dotation facultative commune aux râteliers de la réserve et de l’atelier. Les prendre ici n’est pas une attribution authentifiée à Decker dans le roman.</p><div class="referenceToolbar"><button id="claimRifles" ${!g.armoryAccess()||kit.claimed?'disabled':''}>${kit.claimed?'Dotation déjà retirée':'Retirer les deux fusils sur place'}</button><button id="armoryReferences">Références et écarts</button></div><p class="hint">${g.armoryAccess()?'Vous êtes au râtelier.':'Approchez physiquement un râtelier pour retirer la dotation ; aucun envoi à distance.'}</p><div class="referenceGrid">${cards}</div><p class="referenceNotice">Impulsions : ${kit.pulseAmmo} / ${kit.pulseReserve}. Plasma : ${kit.plasmaAmmo} tirs, ${kit.plasmaCells} cellules de réserve. Chaleur : ${Math.ceil(kit.heat)} / 100${kit.locked?' · refroidissement obligatoire':''}. Capacités, dégâts et cadence sont des choix de jeu. R recharge l’arme en main ; le plasma ne remplace une cellule qu’à vide.</p>`);
 $('claimRifles').onclick=()=>{g.claimArmory();handleEvents();persist();showArmory();};$('armoryReferences').onclick=()=>showFidelity('materiel');
 $('panelContent').querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{g.setWeapon(b.dataset.equip);handleEvents();persist();showArmory();updateHUD();});
}
function showFidelity(tab='lieux'){
 const f=D.fidelity;let body='';
 if(tab==='lieux')body=`<p class="referenceNotice">Les 50 salles du jeu ont une implantation documentée. Cela ne signifie pas que tous les lieux du roman sont reconstitués. Les noms de salles, métrages et plans détaillés restent originaux.</p><div class="referenceGrid">${D.rooms.map(r=>`<article class="referenceCard"><small>${esc(r.territory)} · ${r.id.toUpperCase()}</small><h3>${esc(r.name)}</h3><p>${esc(r.sourceNote)}</p><details><summary>${r.doors.length} accès documentés</summary>${r.doors.map(d=>`<p><b>${esc(d.label)}</b> · ${esc(d.portal.type)} · ${esc(d.portal.mount)}<br><small>${esc(d.portal.structuralReason)} Paire ${d.pair}.</small></p>`).join('')}</details></article>`).join('')}</div>`;
 if(tab==='personnages')body=`<p class="referenceNotice">Les portraits ci-dessous sont rendus par le même dessinateur que les personnages en jeu. Des traits connus ne suffisent pas à authentifier un visage entier. Aucun acteur de la version audio ne sert de modèle.</p><div class="referenceGrid">${Object.entries(f.characters).filter(([id])=>id!=='worker').map(([id,a])=>`<article class="referenceCard"><canvas class="castPortrait" data-portrait="${id}" width="240" height="175" aria-label="Interprétation de ${esc(a.name)}"></canvas><small>${esc(a.evidence)}</small><h3>${esc(a.name)}</h3><p>${esc(a.role)}</p><p>${esc(a.known)}</p><small>${D.rooms.some(r=>(r.cast||[]).some(c=>c.id===id))||['decker','manning','adams','elway'].includes(id)?'Présence rendue en jeu selon la phase':'Fiche seulement · scène individuelle non reconstituée'}</small></article>`).join('')}</div>`;
 if(tab==='materiel')body=`<p class="referenceNotice">Un objet de scénario n’est pas automatiquement une arme portable pour Decker. Le statut indique ce qui est jouable, représenté par une séquence, ou encore à vérifier.</p><div class="referenceGrid">${[...f.weapons,...f.equipment].map(a=>`<article class="referenceCard"><small>${esc(a.status.replaceAll('_',' '))} · ${a.source?'source : '+esc(a.source):'non authentifié / original'}</small><h3>${esc(a.name)}</h3><p>${esc(a.canonical||'')}</p><p>${esc(a.limits)}</p></article>`).join('')}</div>`;
 if(tab==='ecarts')body=`<p class="referenceNotice">Cible : roman de James A. Moore (2014). Texte intégral non confronté. Aucun pourcentage de fidélité calculé à partir du nombre d’objets ajoutés.</p>${f.remaining.map(a=>`<p class="referenceIssue">${esc(a)}</p>`).join('')}<h3>Sources de cette passe</h3>${f.sources.map(a=>`<p><b>${esc(a.title)}</b> · ${esc(a.tier)}<br><small>${esc(a.scope)}</small><br><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Consulter la source externe</a></p>`).join('')}`;
 showPanel('Registre de fidélité','RÉFÉRENCE / INTERPRÉTATION / MANQUES',`<div class="referenceToolbar">${[['lieux','Lieux et accès'],['personnages','Personnages'],['materiel','Armes et équipement'],['ecarts','Écarts et sources']].map(([id,label])=>`<button data-reference="${id}" class="${tab===id?'selected':''}">${label}</button>`).join('')}</div>${body}`);
 $('panelContent').querySelectorAll('[data-reference]').forEach(b=>b.onclick=()=>showFidelity(b.dataset.reference));
 if(tab==='personnages')for(const cv of $('panelContent').querySelectorAll('[data-portrait]')){
  const rr=new SoSRenderer(cv,g);rr.canvas.width=240;rr.canvas.height=175;rr.W=240;rr.H=175;rr.unit=1.15;rr.camera=-120;rr.pos=()=>({x:112,y:154});rr.ctx.setTransform(1,0,0,1,0,0);rr.ctx.fillStyle='#132a36';rr.ctx.fillRect(0,0,240,175);rr.human({x:0,z:.55,facing:1},0,cv.dataset.portrait);
 }
}
$('fidelityBtn').onclick=()=>showFidelity();

function showInventory(){
 if(!started)return;const p=g.p;
 showPanel('Équipement de terrain','RÉSERVES ET OUTILS',`<p><button id="escortInventory">Ordres d’escorte</button> <button id="storageInventory">Stocks repérés</button> <button id="armoryInventory">Armes</button> <button id="referenceInventory">Fidélité</button></p><div class="loadoutGrid">
 <article class="loadout"><div class="itemGlyph">✚</div><small>SOINS · H</small><h3>Trousse de terrain</h3><strong>${p.medkits}</strong><p>Rend jusqu’à 45 points d’état. Une réserve n’est consommée que si elle est utile.</p><button id="useKit" ${p.medkits<1||p.hp>=100?'disabled':''}>Utiliser</button></article>
 <article class="loadout"><div class="itemGlyph">◉</div><small>RESPIRATION · X</small><h3>Cartouche filtrante</h3><strong>${p.filters}</strong><p>Remplace le filtre saturé. La poussière n’épargne pas le trajet du retour.</p><button id="useFilter" ${p.filters<1||p.filter>=99.9?'disabled':''}>Remplacer</button></article>
 <article class="loadout"><div class="itemGlyph">◎</div><small>DISTRACTION · F</small><h3>Leurre acoustique</h3><strong>${p.decoys}</strong><p>Émet pendant sept secondes. Lancer vers un point dégagé, à moins de 4,2 mètres.</p></article>
 </div><p><button id="sensorsInventory">Capteurs de mouvement · ${g.state.flags.equipped?g.state.sensors.filter(b=>b.room===null).length:0} / 3 rangés</button><button id="inventoryWheel">Roue tactique</button></p><div class="loadoutFooter"><span>Chargeur : <b>${p.ammo} / 12</b></span><span>Réserve : <b>${p.reserve}</b></span><span>Mousse : <b>${Math.floor(p.foam)}</b></span><span>Combustible : <b>${Math.floor(p.fuel)}</b></span><span>Renforts de châssis : <b>${p.parts}</b></span></div><p class="hint">Lampe : ${p.lamp?'allumée':'éteinte'} · Manning : ${({free:'feu libre',return:'riposte seulement',hold:'ne pas tirer'})[g.state.companion.fireMode]}</p>`);
 $('sensorsInventory').onclick=showSensors;$('inventoryWheel').onclick=()=>{close('panel');showTactical(1);};
 $('armoryInventory').onclick=showArmory;$('referenceInventory').onclick=()=>showFidelity();$('escortInventory').onclick=showEscort;$('storageInventory').onclick=showStores;
 $('useKit').onclick=()=>{g.useMedkit();handleEvents();showInventory();};$('useFilter').onclick=()=>{g.replaceFilter();handleEvents();showInventory();};
}
$('inventoryBtn').onclick=showInventory;

function showStorage(id){
 const l=g.storageDef(id);if(!l||!g.storageAccess(id)){toast('Approchez le casier ouvert : aucun transfert à distance.');return;}
 const contents=g.rs.lockers[id].contents,stocks=SoSCore.STOCKS,step={reserve:6,fuel:10,foam:1,medkits:1,filters:1,decoys:1,parts:1};
 const rows=Object.entries(stocks).map(([k,v])=>`<article class="storeRow" data-stock-row="${k}"><div class="stockName"><h3>${esc(v.label)}</h3><small>Prise plafonnée à ${v.cap} · le surplus reste ici</small></div><div class="stockCounts"><span>CASIER <b data-stock="${k}">${contents[k]}</b></span><span>PORTÉ <b data-carried="${k}">${g.p[k]}</b></span></div><div class="stockActions"><button data-transfer="take" data-resource="${k}" ${contents[k]===0||g.p[k]>=v.cap?'disabled':''}>Prendre ${Math.min(step[k],contents[k],Math.max(0,v.cap-g.p[k]))||step[k]}</button><button data-transfer="deposit" data-resource="${k}" ${g.p[k]===0||contents[k]>=9999?'disabled':''}>Déposer ${Math.min(step[k],g.p[k])||step[k]}</button></div></article>`).join('');
 showPanel(l.label,'CASIER OUVERT · ÉCHANGES SUR PLACE',`<p class="storeNote">Choisissez le matériel à emporter. Le surplus reste dans ce casier ; vous pouvez aussi y déposer vos réserves.</p><div class="storeToolbar"><button id="takeAllStock" ${Object.keys(stocks).every(k=>contents[k]===0||g.p[k]>=stocks[k].cap)?'disabled':''}>Prendre le disponible</button><button id="leaveStock">Laisser le reste et repartir</button></div><div class="storeGrid">${rows}</div><p class="hint">Le chargeur, la santé et le filtre porté ne changent pas. Déposer libère de la place pour un autre passage ; aucun objet ne se régénère.</p>`);
 $('leaveStock').onclick=()=>close('panel');
 $('takeAllStock').onclick=()=>{g.storageTakeAll(id);handleEvents();persist();showStorage(id);};
 $('panelContent').querySelectorAll('[data-transfer]').forEach(b=>b.onclick=()=>{const key=b.dataset.resource,dir=b.dataset.transfer;g.storageTransfer(id,key,step[key],dir);handleEvents();persist();showStorage(id);setTimeout(()=>document.querySelector(`[data-transfer="${dir}"][data-resource="${key}"]:not(:disabled)`)?.focus(),10);});
}
function showStores(){
 if(!started)return;
 const reports=g.storageReports();
 showPanel('Stocks repérés','INVENTAIRE LOCAL · AUCUN TRANSFERT DISTANT',`<p>Seuls les casiers des salles déjà visitées figurent ici. Un scellé intact ne révèle pas son contenu. La carte guide le retour ; il faut rejoindre le meuble pour récupérer ou déposer du matériel.</p><div class="knownStores">${reports.length?reports.map(a=>`<article><small>${esc(SoSCore.ROOMS[a.room].name)}</small><h3>${esc(a.label)}</h3><p>${a.opened?Object.entries(a.contents).filter(([k,n])=>n>0).map(([k,n])=>esc(SoSCore.STOCKS[k].label)+' : '+n).join(' · ')||'Casier vide · vous pouvez y déposer du matériel.':'SCELLÉ INTACT · contenu inconnu'}</p></article>`).join(''):'<p>Aucun casier repéré pour le moment.</p>'}</div><button id="stocksBack">Retour à l’équipement</button>`);$('stocksBack').onclick=showInventory;
}

function mapShell(zone,detail){
 const known=new Set(g.state.visited);for(const id of g.state.visited)for(const d of SoSCore.ROOMS[id].doors)known.add(d.to);
 const zones=[...new Set(D.rooms.filter(r=>known.has(r.id)).map(r=>r.zone))];if(!zones.includes(zone))zone=zones[0];
 return {zone,known,zones,head:`<div class="mapMode"><button id="sectorMap" class="${!detail?'selected':''}">Liaisons · schéma non métrique</button><button id="localMap" class="${detail?'selected':''}">Salle actuelle</button></div>`,tabs:`<div class="zoneTabs">${zones.map(z=>`<button data-zone="${esc(z)}" class="${z===zone?'selected':''}">${esc(z)}</button>`).join('')}</div>`};
}
function showMap(zone=g.room.zone,detail=false){
 if(!started)return;const m=mapShell(zone,detail);let body='';
 if(detail){
  const r=g.room,width=r.width,sz=z=>80+g.zFor({z})*480;
  let svg=`<rect x="30" y="132" width="${width-60}" height="370" rx="8" fill="#152a2c" stroke="#426164"/>`;
  for(const b of g.boxes())svg+=`<rect x="${b.x-b.w/2}" y="${sz(b.z-b.d/2)}" width="${b.w}" height="${b.d*480}" fill="#466268" stroke="#77959b"/>`;
  for(const h of r.hazards||[]){const st=g.hazardStatus(h);const z=g.mode==='SIDE'?.55:h.z,depth=g.mode==='SIDE'?64:h.d*480;svg+=`<rect data-hazard="${h.id}" x="${h.x-h.w/2}" y="${sz(z)-depth/2}" width="${h.w}" height="${depth}" fill="${st.phase==='stopped'?'#365b48':'#9a623d'}" fill-opacity=".55" stroke="#cfa270" stroke-dasharray="8 6"/><text x="${h.x}" y="${sz(z)-50}" fill="#edcfa4" font-size="19" text-anchor="middle">${esc(h.label)} · ${st.phase==='stopped'?'isolé':'cyclique'}</text>`;}
  for(const s of r.shutters){const a=g.rs.shutters[s.id];svg+=`<rect data-shutter="${s.id}" x="${s.x-s.w/2}" y="136" width="${s.w}" height="360" fill="${a.status==='closed'?'#c99067':a.status==='broken'?'#554d4b':'#6caba0'}" fill-opacity=".65"/><text x="${s.x}" y="112" fill="#e0c794" font-size="22" text-anchor="middle">${a.status==='closed'?'FERMÉE':a.status==='broken'?'ROMPUE':'OUVERTE'} · ${Math.ceil(a.integrity)} %</text>`;}
  for(const e of r.echoes)if(g.state.insights.includes(e.id))svg+=`<circle data-reading="${e.id}" cx="${e.x}" cy="${sz(e.z)}" r="20" fill="none" stroke="#dcc6ef" stroke-width="4"/><text x="${e.x}" y="${sz(e.z)+48}" fill="#dcc6ef" font-size="18" text-anchor="middle">PERCEPTION CONSIGNÉE</text>`;
  if(g.state.companion.rally){const a=g.state.companion.rally;svg+=`<path d="M ${a.x-22} ${sz(a.z)} h 44 M ${a.x} ${sz(a.z)-22} v 44" stroke="#8ed7de" stroke-width="5"/><text x="${a.x}" y="${sz(a.z)-32}" fill="#8ed7de" font-size="18" text-anchor="middle">POSITION MANNING</text>`;}
  for(const d of r.doors){const status=g.doorStatus(d,r.id,false);svg+=`<circle cx="${d.x}" cy="${sz(d.z)}" r="20" fill="${status.open?'#a8bbb0':'#b37358'}"/><text x="${d.x}" y="${sz(d.z)-35}" fill="#dce4d7" font-size="24" text-anchor="middle">${esc(d.label)}</text>`;}
  const marks=[...(g.current?.room===r.id?[{...g.current,mark:'OBJECTIF'}]:[]),...r.devices.filter(d=>!g.rs.devices[d.id]).map(d=>({...d,mark:'INTERVENTION'}))];
  for(const a of marks)svg+=`<path d="M ${a.x} ${sz(a.z)-20} l 20 20 -20 20 -20 -20 Z" fill="#d0b57c"/><text x="${a.x}" y="${sz(a.z)+52}" fill="#e3d1a9" font-size="20" text-anchor="middle">${a.mark}</text>`;
  for(const b of g.state.sensors.filter(b=>b.room===r.id))svg+=`<g data-sensor="${b.id}"><circle cx="${b.x}" cy="${sz(b.z)}" r="17" fill="${b.powered?'#81cbc0':'#746f66'}" stroke="#d1dfce" stroke-width="3"/><text x="${b.x}" y="${sz(b.z)+41}" fill="#cce7dc" font-size="18" text-anchor="middle">CAPTEUR ${b.id.slice(-1)} · ${Math.ceil(b.charge)} s</text></g>`;
  for(const l of r.lockers||[]){const a=g.rs.lockers[l.id];svg+=`<g data-locker="${l.id}"><rect x="${l.x-22}" y="${sz(.18)-18}" width="44" height="36" fill="${a.opened?'#73b7aa':'#bd9b69'}"/><text x="${l.x}" y="${sz(.18)-30}" font-size="18" fill="#dbc998" text-anchor="middle">CASIER · ${a.opened?'OUVERT':'SCELLÉ'}</text></g>`;}
  if(r.lighting){const l=r.lighting;svg+=`<g data-lighting="${l.id}"><rect x="${l.x-16}" y="${sz(l.z)-19}" width="32" height="38" fill="${g.lightsOff()?'#c99a61':'#c4deb4'}"/><text x="${l.x}" y="${sz(l.z)-45}" fill="#e4d7b7" text-anchor="middle" font-size="18">LUX · ${g.lightsOff()?'SECOURS':'ACTIF'}</text></g>`;}
  for(const a of g.state.rescue.actors.filter(a=>a.room===r.id&&a.status==='following'))svg+=`<rect x="${a.x-30}" y="${sz(a.z)-12}" width="60" height="24" fill="#819caf"/>`;
  svg+=`<circle cx="${g.p.x}" cy="${sz(g.p.z)}" r="16" fill="#f0d392" stroke="#fff1cc" stroke-width="4"/><text x="${g.p.x}" y="${sz(g.p.z)-32}" fill="#f0d392" font-size="20" text-anchor="middle">DECKER</text>`;
  body=`<p class="mapFloor">${esc(r.name)} · ${esc(r.floorLabel)}</p><div class="mapWrap"><svg class="mapSvg roomPlan" viewBox="0 0 ${width} 640" role="img" aria-label="Emprises et passages de la salle actuelle">${svg}</svg></div><p class="hint">Emprises réellement bloquantes dans la présentation active. Les silhouettes du décor hors des voies ne sont pas des obstacles. Aucune position ennemie n’est dévoilée par ce plan. Cliquez sur un sol praticable pour y envoyer Manning ; les cloisons fermées restent infranchissables.</p>`;
 }else{
  const list=D.rooms.filter(r=>r.zone===m.zone&&m.known.has(r.id));
  const minX=Math.min(...list.map(r=>r.map[0])),minY=Math.min(...list.map(r=>r.map[1]));
  const pos=Object.fromEntries(list.map(r=>[r.id,{x:40+(r.map[0]-minX)*310,y:42+(r.map[1]-minY)*145}]));
  const w=Math.max(650,...Object.values(pos).map(p=>p.x+275)),h=Math.max(220,...Object.values(pos).map(p=>p.y+110));let svg='';
  for(const e of D.edges){const a=pos[e.a],b=pos[e.b];if(!a||!b)continue;const door=SoSCore.ROOMS[e.a].doors.find(d=>d.pair===e.id),st=g.doorStatus(door,e.a,false);
   svg+=`<path d="M ${a.x+120} ${a.y+34} L ${b.x+120} ${b.y+34}" stroke="${st.open?'#698b8c':'#b08664'}" stroke-width="2" ${!st.open?'stroke-dasharray="6 7"':''}/>`;
  }
  for(const r of list){const p=pos[r.id],v=g.state.visited.includes(r.id),here=r.id===g.room.id,goal=g.current?.room===r.id;
   svg+=`<g><rect x="${p.x}" y="${p.y}" width="240" height="78" rx="4" fill="${here?'#34494a':'#142326'}" stroke="${here?'#efce7f':goal?'#b3be86':'#587577'}" stroke-width="${here?2:1}"/><text x="${p.x+12}" y="${p.y+25}" fill="#e4e9df" font-size="13">${esc(v?r.name:'Passage non exploré')}</text><text x="${p.x+12}" y="${p.y+44}" fill="#90a6a7" font-size="10">${v?esc(r.floorLabel)+(r.optional?' · ANNEXE':''):'SEUIL REPÉRÉ'}</text><text x="${p.x+12}" y="${p.y+63}" fill="#c7b790" font-size="10">${here?'VOUS ÊTES ICI':goal?'OBJECTIF ACTUEL':v?'RELEVÉ CONSERVÉ':''}</text></g>`;
  }
  body=m.tabs+`<div class="mapLegend"><span>Or : votre position</span><span>Clair : objectif</span><span>Pointillés : accès conditionnel</span></div><div class="mapWrap"><svg class="mapSvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Liaisons connues du secteur ${esc(m.zone)}">${svg}</svg></div><p class="hint">Plan de liaisons, pas une coupe à l’échelle. Les paliers et les vols passent par des seuils identifiés. Les lieux inconnus restent masqués.</p>`;
 }
 const known=[...g.knownRooms()],rt=g.routeTo(),barrier=g.routeBarrier(rt);
 const routeUI=`<div class="routePicker"><label for="routeTarget">Destination repérée</label><select id="routeTarget"><option value="">Aucun repère</option>${known.map(id=>`<option value="${id}" ${id===g.state.waypoint?'selected':''}>${esc(g.state.visited.includes(id)?SoSCore.ROOMS[id].name:'Seuil '+id.toUpperCase()+' — non exploré')}</option>`).join('')}</select><button id="setRoute">Marquer le chemin</button><button id="clearRoute">Effacer</button></div><p class="routeText">${g.state.waypoint?rt===null?'Aucun trajet connu et ouvert pour cette destination.':rt.length?rt.length+' seuil(s) · prochain passage : '+esc(rt[0].label)+(barrier?' · À ouvrir dans cette salle : '+esc(barrier.label):''):'Vous êtes arrivé au repère.':'Un repère guide vers un seuil, sans déplacement automatique.'}</p>`;
 showPanel('Carte de l’expédition','REPÈRES ET PASSAGES',m.head+body+routeUI);
 const floor=$('panelContent').querySelector('.roomPlan');if(floor)floor.addEventListener('click',ev=>{const point=floor.createSVGPoint();point.x=ev.clientX;point.y=ev.clientY;const q=point.matrixTransform(floor.getScreenCTM().inverse());if(q.y<132||q.y>502)return;g.commandCompanion({x:q.x,z:(q.y-80)/480});handleEvents();showMap(m.zone,true);});
 $('setRoute').onclick=()=>{g.setWaypoint($('routeTarget').value||null);persist();showMap(m.zone,detail);};
 $('clearRoute').onclick=()=>{g.setWaypoint(null);persist();showMap(m.zone,detail);};
 $('sectorMap').onclick=()=>showMap(m.zone,false);$('localMap').onclick=()=>showMap(g.room.zone,true);
 $('panelContent').querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>showMap(b.dataset.zone));
}
$('mapBtn').onclick=()=>showMap();
function showCodex(){
 if(!started)return;showPanel('Dossiers de l’expédition','NOTES ET RELEVÉS',`<div class="codexTop"><input id="codexSearch" type="search" placeholder="Chercher dans les dossiers…" aria-label="Chercher dans les dossiers"><span class="hint">${g.state.archives.length} / ${D.codex.length}</span></div><div id="dossierList" class="codexList"></div>`);
 function render(){const q=$('codexSearch').value.toLocaleLowerCase('fr');$('dossierList').innerHTML=D.codex.filter(c=>g.state.archives.includes(c.id)&&[c.title,c.text,c.category].join(' ').toLocaleLowerCase('fr').includes(q)).map(c=>`<article class="dossier"><small>${esc(c.category||'RELEVÉ')}</small><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('')||'<p>Aucun dossier ne correspond à cette recherche.</p>';}
 $('codexSearch').oninput=render;render();
}
$('codexBtn').onclick=showCodex;
function showStory(s,action=null){
 if($('story').classList.contains('open')){storyQueue.push([s,action]);return;}
 $('storyTitle').textContent=s.title||'Compte rendu';$('storyText').textContent=s.text;$('storyKicker').textContent=s.completed||'EXPÉDITION / NEW GALVESTON';
 $('storyContinue').textContent=action?'Reprendre la salle':s.finished?'Bilan de l’expédition':'Continuer';storyAction=action||(s.finished?showSummary:null);open('story');
}
$('storyContinue').onclick=()=>{close('story');const fn=storyAction;storyAction=null;if(fn)fn();if(storyQueue.length){const [s,a]=storyQueue.shift();showStory(s,a);}};
function showSummary(){
 const s=g.state.stats;
 showPanel('Les voix persistent','FIN DE L’EXPÉDITION',`<p>Un adulte vivant et deux porteurs ont été remis à la compagnie. La surface s’éloigne derrière le hublot. Le sommeil ne promet plus le silence.</p><div class="summaryGrid"><div><strong>${g.state.completed.length} / ${SoSCore.objectiveOrder.length}</strong><span>Étapes accomplies</span></div><div><strong>${g.state.visited.length} / ${D.rooms.length}</strong><span>Lieux traversés</span></div><div><strong>${g.state.archives.length} / ${D.codex.length}</strong><span>Dossiers réunis</span></div><div><strong>${Math.floor(s.time/60)} min</strong><span>Temps en action</span></div><div><strong>${s.devices}</strong><span>Interventions terminées</span></div><div><strong>${s.deaths}</strong><span>Reprises après échec</span></div></div><p class="hint">Les deux brancards ont été arrimés. Le caisson reste fermé. Votre rapport est conservé. Cloisons manœuvrées : ${s.shutterCycles}. Rompues : ${s.shutterBreaches}. Positions données : ${s.rallyOrders}. Perceptions consignées : ${s.readings} / 8. Franchissements ennemis : ${s.pursuitArrivals}.</p><div class="pauseActions"><button id="summaryMenu">Écran titre</button><button id="summaryCodex">Relire les dossiers</button></div>`);
 $('summaryMenu').onclick=()=>{close('panel');open('menu');};$('summaryCodex').onclick=showCodex;persist();
}
function handleEvents(){for(const e of g.drainEvents()){
 cueBus.event(e,g);
 if(e.type==='room'){arrival(e.text);persist();recordRecovery();}
 else if(e.type==='armory'){showArmory();}
 else if(e.type==='storage'){showStorage(e.id);persist();}
 else if(['toast','archive','saved'].includes(e.type)){toast(e.type==='archive'?'Dossier ajouté : '+e.text:e.text);if(e.type!=='toast')persist();}
 else if(['pursuit-warning','pursuit-arrival','sensor-signal'].includes(e.type)){toast(e.text);persist();}
 else if(e.type==='story'){showStory(e);persist();}
 else if(e.type==='failed'){showStory({title:'Expédition interrompue',text:e.text},retry);persist();}
 else if(['shot','hit','spark','damage','attack'].includes(e.type)){renderer.addEffect(e);}
}}
function updateHUD(){
 const p=g.p,o=g.current,n=g.nearby(),op=g.operation(n);
 $('zone').textContent=g.room.territory+' / '+g.room.zone.toUpperCase()+' / '+g.room.floorLabel;$('roomName').textContent=g.room.name;$('lightingStatus').hidden=!g.room.lighting;$('lightingStatus').textContent=g.lightsOff()?'ÉCLAIRAGE COUPÉ · SECOURS ACTIF':'ÉCLAIRAGE DE TRAVAIL ACTIF';document.body.dataset.blackout=String(g.lightsOff());
 for(const [id,v]of[['health',p.hp],['filter',p.filter],['stress',p.stress],['stamina',p.stamina]])$(id).value=v;
 $('healthText').textContent=Math.ceil(p.hp);$('filterText').textContent=Math.ceil(p.filter);
 $('chapterNumber').textContent=String(g.chapter.number).padStart(2,'0')+' / '+D.chapters.length;$('chapterTitle').textContent=g.chapter.title;
 $('objectiveRoom').textContent=o?SoSCore.ROOMS[o.room].name:'HYPERSOMMEIL';$('objectiveText').textContent=g.missionHint();
 let prompt=n?(op?'Maintenir E — ':'E — ')+(n.label||'Lire le relevé'):keyHeld('Space')?(g.empathyHint()?.text||'Maintenez votre concentration.'):'E : agir · L : lampe · I : équipement';
 if(n?.action==='door'&&!g.doorStatus(n).open)prompt=g.doorStatus(n).reason;
 if(op&&g.workCondition(n))prompt=g.workCondition(n);
 $('prompt').textContent=prompt;
 const repairing=!!g.activeWork&&(g.activeWork.id.startsWith('repair-')||g.activeWork.id.startsWith('shutter-'));if(repairing)$('prompt').textContent=(g.activeWork.id.startsWith('shutter-')?'Maintenir G / E — ':'Maintenir K — ')+g.activeWork.label;
 const prog=repairing?g.activeWork.progress:op?SoSCore.clamp((n.action==='shutter'?g.rs.shutters[n.gateId].progress:n.action==='lighting'?g.rs.lighting.progress:(g.rs.work[n.id]||0))/op.duration,0,1):0;
 $('operationProgress').hidden=!op&&!repairing;$('operationProgress').value=prog;$('operationProgress').setAttribute('aria-label',op?`${n.label} : ${Math.round(prog*100)} %`:'Intervention');
 $('weaponLabel').textContent=g.state.inventory.pistol?SoSCore.WEAPONS[p.weapon]:'ÉQUIPEMENT CIVIL';
 $('ammoText').textContent=p.reload>0?'RECHARGEMENT…':g.state.inventory.pistol?g.weaponReadout():'LAMPE / RADIO';
 $('companionText').textContent=g.state.flags.equipped&&g.chapter.number<17?'Manning : '+(g.state.companion.rally?(g.distance(g.state.companion,g.state.companion.rally)>14?'rejoint le point':'couvre le point'):g.state.companion.order==='follow'?'suit':'tient')+' · '+(({free:'feu libre',return:'riposte',hold:'ne tire pas'})[g.state.companion.fireMode]):'Espace : se concentrer';
 const re=g.state.rescue;
 $('convoyStatus').hidden=!re.active;$('convoyStatus').innerHTML=re.active?re.actors.map(a=>`<span>${esc(a.name)} <meter min="0" max="100" value="${a.integrity}" aria-label="Intégrité du brancard de ${esc(a.name)}"></meter> ${Math.ceil(a.integrity)}%</span>`).join('')+`<b>${esc(g.formation().label)} · B : ${re.order==='follow'?'halte':'repartir'}</b>`:'';
 const contacts=g.trackerContacts(),near=contacts.sort((a,b)=>a.distance-b.distance)[0];
 $('trackerReadout').textContent=g.state.inventory.tracker?(p.trackerOn?near?`${near.x<0?'←':'→'} ${near.distance.toFixed(1)} m · ${contacts.length} mouvement${contacts.length>1?'s':''}`:'AUCUN MOUVEMENT':'DÉTECTEUR ÉTEINT'):'DÉTECTEUR ABSENT';
 $('trackerReadout').classList.toggle('signal',!!near);$('fieldStatus').textContent=(p.lamp?'LAMPE ON':'LAMPE OFF')+' · LEURRES '+p.decoys+' · RENFORTS '+p.parts;
 const rt=g.routeTo(),barrier=g.routeBarrier(rt);$('routeStatus').hidden=!g.state.waypoint;$('routeStatus').textContent=!g.state.waypoint?'':rt===null?'REPÈRE : trajet fermé ou inconnu':rt.length?barrier?`REPÈRE BLOQUÉ · ${barrier.label}`:`REPÈRE ${rt[0].x<g.p.x?'←':'→'} ${rt[0].label}`:'REPÈRE ATTEINT';
 const threat=g.rs.enemies.find(e=>(e.attack||e.breach)&&g.distance(g.p,e)<520&&g.visible(g.p,e));const hazard=(g.room.hazards||[]).filter(h=>g.hazardStatus(h).phase!=='stopped'&&Math.abs(h.x-g.p.x)<500).sort((a,b)=>Math.abs(a.x-g.p.x)-Math.abs(b.x-g.p.x))[0];
 const acid=g.rs.acid.some(a=>a.time>0&&g.distance(g.p,a)<240);
 $('dangerStatus').textContent=threat?(threat.breach?'CLOISON SOUS ATTAQUE':'ATTAQUE EN PRÉPARATION'):acid?'ACIDE AU SOL — ATTENDEZ OU CONTOURNEZ':hazard?({safe:'PASSAGE LIBRE',warning:'ATTENTION — MISE EN PRESSION',active:'DANGER ACTIF'})[g.hazardStatus(hazard).phase]+' · '+hazard.label:'CTRL : ESQUIVE · K : RÉPARER';
 const signals=g.pursuitSignals();$('pursuitStatus').hidden=!signals.length;$('pursuitStatus').textContent=signals.length?'GRIFFES AU SEUIL — '+SoSCore.ROOMS[signals[0].from].name:'';
 const reports=g.sensorReports(),alerts=reports.filter(b=>b.linked&&b.powered&&b.age!==null&&b.age<2);$('sensorStatus').hidden=!g.state.flags.equipped;$('sensorStatus').textContent=alerts.length?'CAPTEUR '+alerts[0].id.slice(-1)+' — MOUVEMENT · '+SoSCore.ROOMS[alerts[0].room].name:reports.some(b=>b.room)?'CAPTEURS : '+reports.filter(b=>b.room&&b.linked&&b.powered).length+' en liaison / '+reports.filter(b=>b.room).length+' posés':'P : POSER UN CAPTEUR · O : ROUE TACTIQUE';
 if(workTool!=='use'&&!g.activeWork)$('prompt').textContent=(padActive?'CROIX / A':'E')+' maintenu — '+(workTool==='repair'?'réparer le brancard proche':'manœuvrer le pupitre proche')+' · O : changer d’outil';
 $('inputStatus').textContent=padActive?'MANETTE'+(padState?.blocked?' · RELÂCHEZ LES COMMANDES':''):'CLAVIER / SOURIS';
 const echo=g.readingHint();if((keyHeld('Space')||!!padState?.buttons[6])&&echo){const progress=(g.rs.echoProgress[echo.id]||0)/echo.duration;$('prompt').textContent=g.distance(g.p,echo)>=echo.radius?'RÉMANENCE '+(echo.x<g.p.x?'←':'→')+' · approchez, puis restez immobile':'ESPACE — '+echo.title+' · '+Math.round(progress*100)+' %';$('operationProgress').hidden=false;$('operationProgress').value=progress;$('operationProgress').setAttribute('aria-label','Lecture empathique : '+Math.round(progress*100)+' %');}
 document.body.dataset.biome=g.room.kind;canvas.setAttribute('data-room',g.room.id);
 for(const id of ['prompt','companionText','dangerStatus','sensorStatus'])$(id).textContent=hintText($(id).textContent);
 $('scene').setAttribute('aria-label','Scène de jeu. Déplacement : '+bindings.label('up')+', '+bindings.label('left')+', '+bindings.label('down')+', '+bindings.label('right')+'. '+bindings.primary('use')+' pour interagir.');
}
// Shared tactical actions: the wheel calls the same simulation methods as the keyboard.
function selectWork(kind){workTool=kind;toast(kind==='repair'?'Réparation sélectionnée : maintenez E / Croix / A près du brancard arrêté.':kind==='shutter'?'Cloison sélectionnée : maintenez E / Croix / A près du pupitre.':'Interaction standard sélectionnée.');}
function showEscort(){
 if(!started)return;const re=g.state.rescue;
 showPanel('Ramener les vivants','ORDRES D’ESCORTE · PAUSE',`<p>Les châssis restent physiques. Une nouvelle allure change leur destination et leur marche, jamais leur position instantanément. Le bruit des roues suit le déplacement réel.</p><div class="escortPatients">${re.actors.map(a=>`<article><small>${esc(a.name)}</small><meter min="0" max="100" value="${a.integrity}" aria-label="Intégrité ${esc(a.name)}"></meter><strong>${Math.ceil(a.integrity)} %</strong><span>${re.aboard?'ARRIMÉ':re.active?(re.order==='hold'?'À L’ARRÊT':'EN SUIVI'):'EN ATTENTE'}</span></article>`).join('')}</div><div class="formationGrid">${Object.entries(SoSCore.FORMATIONS).map(([id,f])=>`<button data-formation="${id}" aria-pressed="${re.formation===id}" ${!re.active?'disabled':''}><strong>${esc(f.label)}</strong><span>Écart visé ${f.gap} · vitesse ${f.speed}</span><small>Bruit de roulement ${f.noise}</small></button>`).join('')}</div><p class="hint">Unités de terrain du moteur, pas des mètres réels. Rapproché : plus rapide, plus bruyant. Discret : plus lent, sans invisibilité. Les portes exigent toujours les deux brancards rassemblés.</p><div class="pauseActions"><button id="escortOrder" ${!re.active?'disabled':''}>${re.order==='follow'?'Arrêter le convoi':'Faire suivre le convoi'}</button><button id="escortBack">Retour à Pause</button></div>`);
 $('panelContent').querySelectorAll('[data-formation]').forEach(b=>b.onclick=()=>{g.setFormation(b.dataset.formation);handleEvents();showEscort();});
 $('escortOrder').onclick=()=>{g.toggleConvoy();handleEvents();showEscort();};$('escortBack').onclick=showPause;
}
function showSensors(){
 if(!started)return;
 const rows=g.sensorReports();
 showPanel('Veille de mouvement','MATÉRIEL RÉCUPÉRABLE · P',`<p>Un signal de mouvement, pas une identification. Decker, Manning et les brancards peuvent le déclencher. Portée de mesure : 6,5 m avec ligne de vue. La radio relaie seulement une salle attenante compatible.</p><div class="sensorGrid">${rows.map(b=>`<article class="sensorCard" data-sensor-card="${b.id}"><small>CAPTEUR ${b.id.slice(-1)}</small><h3>${b.room?esc(SoSCore.ROOMS[b.room].name):'Dans le sac'}</h3><meter min="0" max="180" value="${b.charge}" aria-label="Charge du capteur ${b.id.slice(-1)}"></meter><strong>${Math.ceil(b.charge)} s de veille</strong><p>${!b.room?'RANGÉ':!b.linked?'HORS LIAISON':b.charge<=0?'BATTERIE ÉPUISÉE':b.powered?'VEILLE ACTIVE':'VEILLE COUPÉE'}</p><p class="sensorObservation">${b.lastPulse>=0?'Dernier mouvement reçu à '+Math.floor(b.lastPulse/60)+':'+String(Math.floor(b.lastPulse%60)).padStart(2,'0')+' · '+Math.floor(b.age)+' s écoulées.':'Aucun mouvement consigné.'}</p><button data-sensor-toggle="${b.id}" ${!b.room||!b.linked||b.charge<=0?'disabled':''}>${b.powered?'Couper la veille':'Activer la veille'}</button></article>`).join('')||'<p>Les trois capteurs seront remis avec l’équipement.</p>'}</div><p class="hint">P pose le prochain capteur chargé à vos pieds, ou récupère celui qui est proche. Récupérer ne recharge pas. La veille consomme aussi hors liaison ; la pause arrête l’horloge. Les créatures hors champ ne bougent pas, sauf celles déjà engagées dans une poursuite.</p><button id="sensorBackWheel">Roue tactique</button>`);
 $('panelContent').querySelectorAll('[data-sensor-toggle]').forEach(b=>b.onclick=()=>{g.toggleSensor(b.dataset.sensorToggle);handleEvents();showSensors();});
 $('sensorBackWheel').onclick=()=>{close('panel');showTactical(2);};
}
function showControllerHelp(){
 showPanel('Manette et terrain','PROFIL STANDARD · ZONE MORTE 20 %',`<div class="padGuide"><article><h3>Se déplacer et viser</h3><p>Stick gauche : déplacement analogique.<br>Stick droit : déplacer le viseur à l’écran.<br>L3 : courir · R3 : s’accroupir.</p></article><article><h3>Combattre et percevoir</h3><p>R2 / RT : tirer · L2 / LT : empathie.<br>Carré / X : recharger.<br>Triangle / Y : arme suivante.<br>Rond / B : esquive directionnelle.</p></article><article><h3>Intervenir</h3><p>Croix / A : interagir, maintenir pour travailler.<br>R1 / RB : choisir interaction / réparation / cloison.<br>L1 / LB : roue tactique.<br>Dans la roue : R1 / RB change d’onglet.</p></article><article><h3>Commander et consulter</h3><p>Croix directionnelle : haut = lampe, bas = capteur, gauche = Manning, droite = convoi.<br>Select : carte · Start : Pause.</p></article></div><p class="hint">Après une pause, relâchez boutons et gâchettes et recentrez les sticks. Une déconnexion en partie met le jeu en pause. Les boutons sont nommés par leur position sur le profil standard, pas par une marque détectée. Sans profil compatible, utilisez le clavier. Le matériel physique et le retour haptique ne sont pas certifiés.</p>`);
}
function wheelItems(){
 const equipped=!!g.state.flags.equipped,alive=!g.state.failed&&!g.state.finished;
 const a=(id,label,glyph,detail,run,enabled=true)=>({id,label,glyph,detail,run,enabled:enabled&&alive});
 if(wheelPage===0)return [
  a('ally',g.state.companion.order==='follow'?'Manning : halte':'Manning : suivre','M','Le rappel ne traverse pas une cloison fermée.',()=>g.toggleCompanion(),equipped&&g.chapter.number<17),
  a('discipline','Discipline de tir','◎','Riposte → feu libre → ne pas tirer. Aucun tir sur le spécimen de capture.',()=>g.cycleCompanionFire(),equipped&&g.chapter.number<17),
  a('rally','Tenir le point','⌖','Envoyer Manning au dernier point visé, seulement si le chemin est praticable.',()=>g.commandCompanion(pointer?renderer.mouse(pointer.x,pointer.y):{x:g.p.x+g.p.facing*260,z:g.p.z}),equipped&&g.chapter.number<17),
  a('convoy',g.state.rescue.order==='follow'?'Convoi : halte':'Convoi : suivre','Ⅱ','Les deux brancards restent physiques ; rassemblez-les avant un départ.',()=>g.toggleConvoy(),g.state.rescue.active),
  a('use','Interaction','E','Sélectionner l’interaction standard. Maintenez ensuite E / Croix / A pour travailler.',()=>selectWork('use')),
  a('repair','Réparation','K','Sélectionner la réparation. Arrêtez le convoi et maintenez ensuite E / Croix / A près du châssis.',()=>selectWork('repair'),g.state.rescue.active),
  a('shutter','Cloison','G','Sélectionner la manœuvre. Maintenez ensuite E / Croix / A près du pupitre.',()=>selectWork('shutter'),equipped),
  a('inventory','Équipement','▦','Consulter les réserves et outils sans modifier la partie.',showInventory)
 ];
 if(wheelPage===1)return [
  a('pistol','Pistolet','01','Équiper le pistolet. Les réserves restent inchangées.',()=>g.setWeapon('pistol'),g.state.inventory.pistol),
  a('foam','Mousse','02','Équiper la mousse ; immobiliser sans tuer.',()=>g.setWeapon('foam'),g.state.inventory.foam),
  a('flame','Flammes','03','Équiper le lance-flammes.',()=>g.setWeapon('flame'),g.state.inventory.flame),
  a('reload','Recharger','R','Lancer le rechargement de 1,1 seconde ; les cartouches arrivent à la fin.',()=>g.reload(),g.state.inventory.pistol&&g.p.reserve>0&&g.p.ammo<12&&g.p.reload<=0),
  a('medkit','Soins','✚','Utiliser une trousse, jusqu’à 45 points de santé.',()=>g.useMedkit(),g.p.medkits>0&&g.p.hp<100),
  a('filter','Filtre','◉','Consommer une cartouche pour remplacer le filtre usé.',()=>g.replaceFilter(),g.p.filters>0&&g.p.filter<99.9),
  a('decoy','Leurre','F','Lancer vers le dernier point visé. Aucun lancer à travers une paroi.',()=>g.deployDecoy(pointer?renderer.pickTarget(pointer.x,pointer.y):null),g.p.decoys>0),
  a('sensor',g.sensorNear()?'Récupérer capteur':'Poser capteur','P',g.sensorPlacement().reason||'Trois appareils au total. Récupérer conserve seulement la charge restante.',()=>g.sensorAction(),g.sensorPlacement().ok)
 ];
 return [
  a('lamp',g.p.lamp?'Éteindre lampe':'Allumer lampe','L','Votre lampe influence la perception des créatures.',()=>g.toggleLamp()),
  a('tracker',g.p.trackerOn?'Éteindre détecteur':'Allumer détecteur','T','Le détecteur portable n’est pas une balise posée.',()=>g.toggleTracker(),g.state.inventory.tracker),
  a('sensors','Veille des capteurs','◌','Relire les signaux et couper la veille des appareils en liaison.',showSensors,equipped),
  a('map','Plan local','◇','Voir les obstacles, passages et le matériel ; aucun ennemi ajouté à la carte.',()=>showMap(g.room.zone,true)),
  a('journal','Journal','U','Les 24 derniers faits observés. Aucun comptage secret d’ennemis.',showJournal),
  a('codex','Dossiers','J','Relire les connaissances déjà réunies.',showCodex),
  a('view','Présentation','F6','Basculer Latérale / Hybride en conservant la progression.',()=>{g.setPresentation(g.state.presentation==='HYBRID'?'CLASSIC':'HYBRID');$('presentation').value=g.state.presentation;persist();}),
  a('controller','Commandes','?','Consulter le profil standard de manette.',showControllerHelp)
 ];
}
function wheelSelect(i,focus=false){
 wheelSelection=(i+8)%8;
 const list=wheelItems();$('wheelDetail').textContent=list[wheelSelection].detail+(!list[wheelSelection].enabled?' — Indisponible dans cet état.':'');
 $('wheelFace').querySelectorAll('.wheelAction').forEach((b,k)=>{b.classList.toggle('chosen',k===wheelSelection);if(k===wheelSelection&&focus)b.focus();});
}
function showTactical(page=0){
 if(!started||g.state.failed||g.state.finished)return;
 wheelPage=(Number(page)+3)%3;wheelSelection=0;
 for(const [i,id]of ['wheelTeam','wheelGear','wheelField'].entries()){$(id).classList.toggle('selected',wheelPage===i);$(id).setAttribute('aria-pressed',wheelPage===i?'true':'false');}
 const items=wheelItems();
 $('wheelFace').innerHTML='<div class="wheelHub"><small>OUTIL ACTUEL</small><strong>'+({use:'INTERAGIR',repair:'RÉPARER',shutter:'CLOISON'})[workTool]+'</strong><span>Maintenir E / A / Croix</span></div>'+items.map((a,i)=>{const angle=i*Math.PI/4;return `<button class="wheelAction" data-wheel="${a.id}" data-index="${i}" aria-disabled="${!a.enabled}" style="--wx:${Math.sin(angle).toFixed(5)};--wy:${(-Math.cos(angle)).toFixed(5)}"><i>${a.glyph}</i><span>${a.label}</span><small>${i+1}</small></button>`;}).join('');
 $('wheelFace').querySelectorAll('[data-wheel]').forEach((b,i)=>{b.onfocus=()=>wheelSelect(i);b.onpointerenter=()=>wheelSelect(i);b.onclick=()=>{const item=wheelItems()[i];if(!item.enabled){wheelSelect(i);return;}close('tactical');item.run();handleEvents();updateHUD();};});
 $('wheelFace').querySelector('.wheelHub span').textContent='Maintenir '+bindings.primary('use')+' / A / Croix';
 open('tactical');const selected=Math.max(0,items.findIndex(a=>a.enabled));wheelSelect(selected);setTimeout(()=>{if($('tactical').classList.contains('open'))wheelSelect(selected,true);},0);
}
function wheelKey(ev){
 if(bindings.canonical(ev.code)==='KeyO'||ev.code==='Escape'){if(!ev.repeat)close('tactical');return true;}
 if(ev.repeat&&['Enter','Space'].includes(ev.code))return true;
 if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(ev.code)){wheelSelect(wheelSelection+(['ArrowLeft','ArrowUp'].includes(ev.code)?-1:1),true);return true;}
 if(ev.code==='Enter'||ev.code==='Space'){$('wheelFace').querySelectorAll('.wheelAction')[wheelSelection]?.click();return true;}
 if(/^Digit[1-8]$/.test(ev.code)){$('wheelFace').querySelectorAll('.wheelAction')[Number(ev.code.slice(-1))-1]?.click();return true;}
 if(ev.code==='BracketRight'){showTactical((wheelPage+1)%3);return true;}return false;
}
$('wheelBtn').onclick=()=>showTactical();$('wheelClose').onclick=()=>close('tactical');
$('wheelTeam').onclick=()=>showTactical(0);$('wheelGear').onclick=()=>showTactical(1);$('wheelField').onclick=()=>showTactical(2);
$('controllerHelpBtn').onclick=showControllerHelp;
function pollController(dt,now){
 let pads=[];try{pads=Array.from(navigator.getGamepads?.()||[]);}catch(e){pads=[];}
 padState=padInput.read(pads.find(p=>p?.connected&&p.mapping==='standard'));
 const q=padState;
 if(q.disconnected){padCursor=null;if(started&&!paused()){showPause();toast('Manette déconnectée. La partie est en pause.');}return;}
 if(!q.connected||q.blocked)return;
 if(q.active)padActive=true;
 if(paused()){
  const active=screens.filter(id=>$(id).classList.contains('open')).at(-1);if(!active)return;
  if(active==='tactical'){
   const ix=SoSControls.wheelIndex(q.move.x,q.move.y);if(ix!==null)wheelSelect(ix,true);
   if(q.edges[5]){showTactical((wheelPage+1)%3);return;}
   if(q.edges[4]||q.edges[1]||q.edges[9]){close('tactical');return;}
   if(q.edges[14]||q.edges[12])wheelSelect(wheelSelection-1,true);
   if(q.edges[15]||q.edges[13])wheelSelect(wheelSelection+1,true);
   if(q.edges[0])$('wheelFace').querySelectorAll('.wheelAction')[wheelSelection]?.click();return;
  }
  if((q.edges[1]||q.edges[9])&&active!=='story'){if(active==='panel')close('panel');else if(started)close('menu');return;}
  const nodes=[...$(active).querySelectorAll('button:not(:disabled),input:not([hidden]),select')].filter(n=>n.offsetParent!==null);
  const focused=document.activeElement;
  if(focused?.tagName==='SELECT'&&(q.edges[14]||q.edges[15])){focused.selectedIndex=Math.max(0,Math.min(focused.options.length-1,focused.selectedIndex+(q.edges[15]?1:-1)));focused.dispatchEvent(new Event('change'));return;}
  if(focused?.type==='range'&&(q.edges[14]||q.edges[15])){q.edges[15]?focused.stepUp():focused.stepDown();focused.dispatchEvent(new Event('change'));return;}
  const direction=q.move.y>.5||q.edges[13]?1:q.move.y<-.5||q.edges[12]?-1:0;
  if(direction&&now-padNavAt>180&&nodes.length){const i=nodes.indexOf(document.activeElement);nodes[(i+direction+nodes.length)%nodes.length].focus();padNavAt=now;}
  if(q.edges[0]){if(focused?.tagName==='SELECT'){focused.selectedIndex=(focused.selectedIndex+1)%focused.options.length;focused.dispatchEvent(new Event('change'));}else if(focused&&$(active).contains(focused))focused.click();}return;
 }
 if(q.edges[9]){showPause();return;}if(q.edges[8]){showMap();return;}if(q.edges[4]){showTactical();return;}
 const box=canvas.getBoundingClientRect();
 if(q.aim.x||q.aim.y){
  if(!padCursor){const pos=renderer.pos(g.p.x,g.zFor(g.p));padCursor={x:box.left+(pos.x+180*g.p.facing)/renderer.W*box.width,y:box.top+(pos.y-75*renderer.unit)/renderer.H*box.height};}
  padCursor.x=SoSCore.clamp(padCursor.x+q.aim.x*800*dt,box.left+6,box.right-6);padCursor.y=SoSCore.clamp(padCursor.y+q.aim.y*650*dt,box.top+6,box.bottom-6);pointer={...padCursor};touchAim=null;
 }
 if(q.edges[0]&&workTool==='use')g.interact();
 if(q.edges[1])g.startDodge({left:q.move.x<-.2,right:q.move.x>.2,up:q.move.y<-.2,down:q.move.y>.2});
 if(q.edges[2])g.reload();
 if(q.edges[3]){const weapons=Object.keys(SoSCore.WEAPONS).filter(w=>g.weaponOwned(w));if(weapons.length)g.setWeapon(weapons[(weapons.indexOf(g.p.weapon)+1)%weapons.length]);}
 if(q.edges[5])selectWork(({use:'repair',repair:'shutter',shutter:'use'})[workTool]);
 if(q.edges[12])g.toggleLamp();if(q.edges[13])g.sensorAction();if(q.edges[14])g.toggleCompanion();if(q.edges[15])g.toggleConvoy();
 handleEvents();
}

const movementKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyQ','KeyD','KeyW','KeyZ','KeyS','Space','ShiftLeft','ShiftRight','KeyC','KeyE','KeyK','KeyG','ControlLeft','ControlRight'];
window.addEventListener('keydown',ev=>{
 if(capturingBinding){
  ev.preventDefault();ev.stopImmediatePropagation();keyboard.suppress(ev.code);
  if(ev.code==='Escape'){capturingBinding=null;$('bindingMessage').textContent='Modification annulée.';return;}
  if(ev.repeat)return;
  if(ev.altKey||ev.metaKey||(ev.ctrlKey&&!ev.code.startsWith('Control'))){$('bindingMessage').textContent='Les combinaisons de navigateur restent réservées.';return;}
  const result=bindings.assign(capturingBinding,ev.code,ev.key?.length===1?ev.key:SoSSupport.labelCode(ev.code));
  if(!result.ok){$('bindingMessage').textContent=result.message;return;}
  capturingBinding=null;keyboard.rearm();keyboard.suppress(ev.code);commitSettings();showOptions('keyboard',optionsGroup);$('bindingMessage').textContent='Touche enregistrée. Relâchez-la avant de reprendre.';return;
 }
 padActive=false;
 if($('tactical').classList.contains('open')&&wheelKey(ev)){ev.preventDefault();return;}
 if(ev.code==='Tab'&&screens.some(id=>$(id).classList.contains('open'))){
  const active=screens.filter(id=>$(id).classList.contains('open')).at(-1),items=[...$(active).querySelectorAll('button:not(:disabled),input:not([hidden]),select')].filter(n=>n.offsetParent!==null);
  if(items.length){const i=items.indexOf(document.activeElement),j=ev.shiftKey?(i<=0?items.length-1:i-1):(i+1)%items.length;items[j].focus();ev.preventDefault();}return;
 }
 if(ev.code==='Escape'){ev.preventDefault();if($('story').classList.contains('open'))return;if($('panel').classList.contains('open'))close('panel');else if(started&&$('menu').classList.contains('open'))close('menu');else showPause();return;}
 if(paused())return;
 const code=keyboard.press(ev.code);if(!code)return;ev.preventDefault();if(ev.repeat)return;
 if(settings.sound)audio.unlock();
 if(code==='KeyO'){showTactical();return;}
 if(code==='KeyE'&&workTool==='use')g.interact();
 else if(code==='KeyP')g.sensorAction();
 else if(code==='ControlLeft'||code==='ControlRight')g.startDodge({left:keyHeld('ArrowLeft')||keyHeld('KeyA')||keyHeld('KeyQ'),right:keyHeld('ArrowRight')||keyHeld('KeyD'),up:keyHeld('ArrowUp')||keyHeld('KeyW')||keyHeld('KeyZ'),down:keyHeld('ArrowDown')||keyHeld('KeyS')});
 else if(code==='KeyK'&&!g.repairTarget())toast('Arrêtez le convoi avec B puis approchez un châssis abîmé.');
 else if(code==='KeyK'&&g.p.parts<1)toast('Aucun renfort de châssis disponible.');
 else if(code==='KeyR')g.reload();
 else if(['Digit1','Digit2','Digit3'].includes(code))g.setWeapon({Digit1:'pistol',Digit2:'foam',Digit3:'flame'}[code]);
 else if(code==='KeyV')g.toggleCompanion();
 else if(code==='KeyY')g.commandCompanion(pointer?renderer.mouse(pointer.x,pointer.y):{x:g.p.x+g.p.facing*260,z:g.p.z});
 else if(code==='KeyG'&&!g.nearShutter())toast('Approchez un pupitre de cloison ; maintenez G pour agir.');
 else if(code==='KeyN')g.cycleCompanionFire();
 else if(code==='KeyB')g.toggleConvoy();else if(code==='KeyL')g.toggleLamp();else if(code==='KeyT')g.toggleTracker();
 else if(code==='KeyF')g.deployDecoy(pointer?renderer.pickTarget(pointer.x,pointer.y):null);else if(code==='KeyH')g.useMedkit();else if(code==='KeyX')g.replaceFilter();
 else if(code==='F6'){g.setPresentation(g.state.presentation==='HYBRID'?'CLASSIC':'HYBRID');$('presentation').value=g.state.presentation;persist();}
 else if(code==='KeyU')showJournal();
 else if(code==='Tab')showMap();else if(code==='KeyJ')showCodex();else if(code==='KeyI')showInventory();
 handleEvents();
});
window.addEventListener('keyup',ev=>{keyboard.release(ev.code);blockedKeys.delete(ev.code);});
canvas.addEventListener('pointermove',ev=>{pointer={x:ev.clientX,y:ev.clientY};padActive=false;touchAim=null;});
canvas.addEventListener('pointerdown',ev=>{if(paused())return;pointer={x:ev.clientX,y:ev.clientY};if(ev.button===2){g.commandCompanion(renderer.mouse(ev.clientX,ev.clientY));handleEvents();ev.preventDefault();return;}firing=ev.button===0;if(firing){g.shoot(renderer.pickTarget(ev.clientX,ev.clientY));handleEvents();}canvas.setPointerCapture?.(ev.pointerId);if(settings.sound)audio.unlock();audio.set(settings.sound);});
window.addEventListener('pointerup',()=>firing=false);window.addEventListener('pointercancel',clearInput);canvas.addEventListener('lostpointercapture',()=>firing=false);canvas.oncontextmenu=ev=>ev.preventDefault();
window.addEventListener('blur',()=>{clearInput();focusLost=true;if(started)persist();});
window.addEventListener('focus',()=>{if(focusLost&&started&&!screens.some(id=>$(id).classList.contains('open')))showPause();focusLost=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(started){persist();if(!screens.some(id=>$(id).classList.contains('open')))showPause();}}});
window.addEventListener('pagehide',persist);
$('touchControls').querySelectorAll('[data-key]').forEach(b=>{
 b.addEventListener('pointerdown',ev=>{ev.preventDefault();if(!paused())keys.add(b.dataset.key);b.setPointerCapture?.(ev.pointerId);});
 b.addEventListener('pointerup',()=>keys.delete(b.dataset.key));b.addEventListener('pointercancel',()=>keys.delete(b.dataset.key));b.addEventListener('lostpointercapture',()=>keys.delete(b.dataset.key));
});
$('touchInteract').addEventListener('pointerdown',ev=>{ev.preventDefault();if(!paused()){keys.add('KeyE');if(workTool==='use')g.interact();handleEvents();}ev.currentTarget.setPointerCapture?.(ev.pointerId);});
for(const event of['pointerup','pointercancel','lostpointercapture'])$('touchInteract').addEventListener(event,()=>keys.delete('KeyE'));
$('touchFire').addEventListener('pointerdown',ev=>{if(!paused()){firing=true;pointer=null;touchAim={x:g.p.x+g.p.facing*900,z:g.p.z};g.shoot(touchAim);handleEvents();ev.currentTarget.setPointerCapture?.(ev.pointerId);}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('touchFire').addEventListener(event,()=>firing=false);
window.addEventListener('resize',()=>renderer.resize());
function frame(now){
 const dt=Math.min((now-last)/1000,.05);last=now;pollController(dt,now);const stop=paused();
 const aim=touchAim|| (pointer?renderer.pickTarget(pointer.x,pointer.y):{x:g.p.x+g.p.facing*600,z:g.p.z});
 if(!stop){
  g.step(dt,{left:keyHeld('ArrowLeft')||keyHeld('KeyA')||keyHeld('KeyQ'),right:keyHeld('ArrowRight')||keyHeld('KeyD'),up:keyHeld('ArrowUp')||keyHeld('KeyW')||keyHeld('KeyZ'),down:keyHeld('ArrowDown')||keyHeld('KeyS'),crouch:keyHeld('KeyC')||!!padState?.buttons[11],run:keyHeld('ShiftLeft')||keyHeld('ShiftRight')||!!padState?.buttons[10],focus:keyHeld('Space')||!!padState?.buttons[6],use:(keyHeld('KeyE')||!!padState?.buttons[0])&&workTool==='use',repair:keyHeld('KeyK')||(keyHeld('KeyE')||!!padState?.buttons[0])&&workTool==='repair',shutter:keyHeld('KeyG')||(keyHeld('KeyE')||!!padState?.buttons[0])&&workTool==='shutter',fire:firing||!!padState?.buttons[7],moveX:padState?.move.x||0,moveZ:padState?.move.y||0,target:aim});
  handleEvents();cueBus.update(g);if(now-autoAt>10000){persist();autoAt=now;}
 }
 renderer.focus=(keyHeld('Space')||!!padState?.buttons[6])&&!stop;renderer.draw(g.time,stop?0:dt);
 if(now-hudAt>90){updateHUD();hudAt=now;}
 const cross=$('crosshair'),box=canvas.getBoundingClientRect();
 cross.hidden=!pointer||stop;if(pointer&&!stop){cross.style.left=(pointer.x-box.left)+'px';cross.style.top=(pointer.y-box.top)+'px';cross.classList.toggle('onTarget',!!renderer.hoverTarget);}
 audio.set(settings.sound&&(!stop||now<audioPreviewUntil));audio.scene(g.room);
 for(const cue of cueBus.drain())audio.play(cue);
 const captions=settings.audio.captions&&started?cueBus.captionsAt(g.state.stats.time):[];
 const captionText=captions.map(c=>c.text).join(' · ');if($('soundCaption').textContent!==captionText)$('soundCaption').textContent=captionText;
 $('soundCaption').setAttribute('aria-hidden',settings.audio.captions?'false':'true');
 requestAnimationFrame(frame);
}
g.drainEvents();updateHUD();requestAnimationFrame(frame);
if(window.__SOS_QA__===true||new URLSearchParams(location.search).has('qa'))window.__sos={freeze:()=>{clearInput();focusLost=true;},showTactical,showSensors,showEscort,showControllerHelp,padInput,showOptions,showFidelity,showArmory,bindings,keyboard,cueBus,audio,vault,getSettings:()=>JSON.parse(JSON.stringify(settings)),getWorkTool:()=>workTool,getPadState:()=>padState,game:g,renderer,begin,showStorage,showStores,showMap,showCodex,showPause,showInventory,showHelp,showJournal,showRecovery,readRecoveries,recordRecovery,handleEvents,updateHUD,persist,closeAll(){screens.forEach(close);storyQueue=[];started=true;focusLost=false;},isPaused:paused};
})();
