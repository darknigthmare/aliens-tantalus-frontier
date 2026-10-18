import { forgeNarrativeFieldsV156, editForgeNarrativeV156 } from './forge-narrative-ui-v156.js';
import { LAYERS, LABELS, TEMPLATES, applyTemplate, decorative, LIMITS } from './forge-model-v130.js';
import { FORGE_DECORATION_ASSETS_V141, defaultForgeDecorationV141, forgeDecorationAssetV141 } from './forge-decoration-v141.js';
import { inspectForgeJourneyV141 } from './forge-journey-admission-v141.js';
import { FORGE_NPC_PRESETS_V158 } from './forge-npcs-v158.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layerNames={structure:'Structure',gameplay:'Interactions',background:'Arrière-plan',foreground:'Premier plan'};
const button=(action,label,extra='')=>`<button type="button" data-forge-action="${action}" ${extra}>${label}</button>`;
function download(doc,name,text,type='application/json'){
  const url=URL.createObjectURL(new Blob([text],{type}));const anchor=doc.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
/** Enhances the existing editor section without replacing its app bindings or campaign flows. */
export function mountForgeUI(editor){
  const doc=editor.canvas.ownerDocument,panel=editor.canvas.closest?.('[data-panel="editor"]');
  if(!doc||!panel)return null;
  const styleId='forge-styles-v130';if(!doc.getElementById(styleId)){const link=doc.createElement('link');link.id=styleId;link.rel='stylesheet';link.href=new URL('./forge-editor-v130.css',import.meta.url).href;doc.head.append(link);}
  panel.classList.add('forge-v130');
  panel.querySelector('h2').textContent='Frontier Forge';
  const stage=editor.canvas.closest('.editor-stage'),layout=panel.querySelector('.editor-layout'),toolPanel=panel.querySelector('.tool-panel');
  const toolbar=doc.createElement('div');toolbar.className='forge-toolbar-v130';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Outils de tracé et de sélection');
  toolbar.innerHTML=`<div class="forge-tool-modes">${Object.entries({brush:'Brosse · B',line:'Ligne · L',rect:'Rectangle · R',fill:'Remplir · F',select:'Sélection · V',pick:'Pipette · I',pan:'Caméra · P'}).map(([mode,label])=>button('mode',label,`data-mode="${mode}" aria-pressed="false"`)).join('')}</div><label>Brosse<select data-forge-field="brush">${[1,2,3,4,5,6].map(n=>`<option>${n}</option>`).join('')}</select></label>${button('fit','Cadrer · 0')}${button('grid','Grille · G','aria-pressed="true"')}${button('expand','Agrandir l’atelier','aria-pressed="false"')}`;
  stage.before(toolbar);layout.prepend(toolbar);
  const status=doc.createElement('div');status.className='forge-status-v130';status.setAttribute('aria-live','polite');stage.append(status);
  const message=doc.createElement('p');message.className='forge-message-v130';message.setAttribute('role','status');toolbar.after(message);
  const inspector=doc.createElement('aside');inspector.className='forge-inspector-v130';inspector.setAttribute('aria-label','Salles, propriétés et vérifications');layout.append(inspector);
  const paletteTools=doc.createElement('div');paletteTools.className='forge-palette-controls-v130';paletteTools.innerHTML=`<label>Filtrer le catalogue<input data-forge-field="search" type="search" placeholder="Sol, sas, menace…"></label><label>Calque actif<select data-forge-field="layer">${LAYERS.map(layer=>`<option value="${layer}">${layerNames[layer]}</option>`).join('')}</select></label><div data-forge-layers></div><p class="forge-note">Les décors d’arrière-plan et de premier plan sont visibles en jeu, sans collision. Sélectionnez un décor pour choisir sa ressource et son opacité.</p>`;toolPanel.prepend(paletteTools);
  const clear=panel.querySelector('#editor-clear');clear.textContent='VIDER LE CALQUE';
  toolPanel.querySelector('.hint').textContent='Clic droit ou Maj : gommer. Molette : zoom ancré. Alt + glisser : caméra. Un geste = une annulation.';
  const play=panel.querySelector('#editor-play');play.textContent='TESTER LE PARCOURS';play.title='Démarrer dans la salle active, franchir les sas reliés avec E et valider les objectifs des salles accessibles.';
  const saveStatus=doc.createElement('p');saveStatus.className='forge-save-v130';saveStatus.setAttribute('role','status');saveStatus.textContent='Espace Forge séparé de la campagne.';panel.querySelector('#editor-validation').after(saveStatus);
  let importRequest=0,dead=false,storyNodeV156='';
  const disposers=[];
  const listen=(target,type,fn,options)=>{if(!target)return;target.addEventListener(type,fn,options);disposers.push(()=>target.removeEventListener(type,fn,options));};
  const guarded=fn=>{try{return fn();}catch(error){api.message(error.message,true);return false;}};
  const field=name=>panel.querySelector(`[data-forge-field="${name}"]`);
  const getReport=()=>editor.controlV136?.getReport()||inspectForgeJourneyV141(editor.model.data);
  const selectedDoorOptions=()=>editor.room.cells.filter(cell=>cell.type==='door'&&!decorative(cell)).map(cell=>`<option value="${escape(cell.id)}">${escape(cell.label||cell.id)} · ${cell.x},${cell.y}</option>`).join('');
  const targetDoorOptions=()=>editor.model.data.rooms.filter(room=>room.id!==editor.room.id).flatMap(room=>room.cells.filter(cell=>cell.type==='door'&&!decorative(cell)).map(cell=>`<option value="${escape(room.id)}:${escape(cell.id)}">${escape(room.name)} / ${escape(cell.label||cell.id)}</option>`)).join('');
  const npcFields=cell=>cell?.type==='npc'?`<section><h4>PERSONNAGE DU PLAN</h4><label>Nom affiché<input data-forge-field="npc-name" maxlength="80" value="${escape(cell.npc.name)}"></label><label>Apparence<select data-forge-field="npc-preset">${FORGE_NPC_PRESETS_V158.map(p=>`<option value="${p.id}" ${cell.npc.presetId===p.id?'selected':''}>${escape(p.label)}</option>`).join('')}</select></label><label>Orientation<select data-forge-field="npc-facing"><option value="1" ${cell.npc.facing===1?'selected':''}>Droite</option><option value="-1" ${cell.npc.facing===-1?'selected':''}>Gauche</option></select></label><p class="forge-note">Personnage local stationnaire et non combattant, sans collision avec le joueur. Placez ses deux pieds sur un support fixe, avec un corps entièrement dégagé. Les apparences réutilisent des atlas du personnel colonial ; ce nom ne recrute aucun membre de campagne. 16 PNJ par salle, 64 par projet.</p></section>`:'';
  const decorationFields=cell=>{
    if(!cell||!decorative(cell))return '';
    const decoration=cell.decoration||defaultForgeDecorationV141(cell),asset=forgeDecorationAssetV141(decoration.assetId);
    return `<div class="forge-decoration-v141"><h4>DÉCOR SANS COLLISION</h4><svg viewBox="${asset.source.x} ${asset.source.y} ${asset.source.w} ${asset.source.h}" role="img" aria-label="${escape(asset.label)}"><defs><clipPath id="forge-decor-crop-${cell.id}"><rect x="${asset.source.x}" y="${asset.source.y}" width="${asset.source.w}" height="${asset.source.h}"></rect></clipPath></defs><image clip-path="url(#forge-decor-crop-${cell.id})" href="${asset.src}" width="${asset.imageWidth}" height="${asset.imageHeight}"></image></svg><label>Ressource locale<select data-forge-field="decor-asset">${FORGE_DECORATION_ASSETS_V141.map(entry=>`<option value="${entry.id}" ${entry.id===asset.id?'selected':''}>${escape(entry.label)}</option>`).join('')}</select></label><p class="forge-note">Taille fixe, proportions d’origine. Pied au bas de la case, quelle que soit la résolution de la grille.</p><label>Opacité (%)<input data-forge-field="decor-opacity" type="number" min="0" max="100" step="1" value="${Math.round(decoration.opacity*100)}"></label><label><input data-forge-field="decor-flip" type="checkbox" ${decoration.flipX?'checked':''}>Miroir de la ressource</label><label>Parallaxe (−0,15 à 0,15)<input data-forge-field="decor-parallax" type="number" min="-0.15" max="0.15" step="0.01" value="${decoration.parallax}"></label><p class="forge-note">Dérive bornée à 32 pixels et désactivée avec la réduction des mouvements.</p></div>`;
  };
  const api={
    message(text,error=false){message.textContent=text;message.dataset.error=String(error);},
    refreshStatus(){status.textContent=`${editor.room.name} · ${editor.cols} × ${editor.rows} · ${Math.round(editor.viewport.zoom*100)} % · ${editor.cursor?`X ${editor.cursor.x} / Y ${editor.cursor.y}`:'hors plan'} · ${editor.selection.size} sélectionné(s)`;},
    refreshInspector(){
      const selected=editor.selected(),single=selected.length===1?selected[0]:null;
      const validation=getReport();
      inspector.innerHTML=`<section><h3>SECTEURS <span>${editor.model.data.rooms.length}/32</span></h3><label>Salle active<select data-forge-field="room">${editor.model.data.rooms.map(room=>`<option value="${escape(room.id)}" ${room.id===editor.room.id?'selected':''}>${escape(room.name)} · ${room.cells.length} blocs</option>`).join('')}</select></label><div class="forge-row">${button('room-add','Nouvelle salle')}${button('room-copy','Dupliquer')}${button('room-delete','Supprimer')}</div><label>Nom du secteur<input data-forge-field="room-name" maxlength="120" value="${escape(editor.room.name)}"></label><div class="forge-row"><label>Colonnes<input data-forge-field="width" type="number" min="8" max="128" value="${editor.cols}"></label><label>Lignes<input data-forge-field="height" type="number" min="8" max="72" value="${editor.rows}"></label>${button('resize','Redimensionner')}</div><label>Gabarit<select data-forge-field="template">${Object.entries(TEMPLATES).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>${button('template','Appliquer le gabarit')}<canvas class="forge-minimap-v130" width="256" height="144" aria-label="Vue d’ensemble de la salle ; cliquer pour centrer la caméra" tabindex="0"></canvas></section>
      <section><h3>SÉLECTION <span>${selected.length}</span></h3><div class="forge-row">${button('copy','Copier')}${button('paste','Coller')}${button('delete','Supprimer')}${button('flip-x','Miroir horizontal')}${button('flip-y','Miroir vertical')}</div>${single?`<p class="forge-note">${escape(LABELS[single.type])} · ${escape(single.id)} · ${layerNames[single.layer]}</p><label>Repère<input data-forge-field="cell-label" maxlength="120" value="${escape(single.label)}"></label><div class="forge-row"><label>X<input data-forge-field="cell-x" type="number" min="0" max="${editor.cols-1}" value="${single.x}"></label><label>Y<input data-forge-field="cell-y" type="number" min="0" max="${editor.rows-1}" value="${single.y}"></label>${button('position','Déplacer')}</div>${decorationFields(single)}${npcFields(single)}${forgeNarrativeFieldsV156(editor,single,storyNodeV156)}<label><input data-forge-field="cell-lock" type="checkbox" ${single.locked?'checked':''}>Verrouiller ce bloc</label>`:'<p class="forge-note">Outil Sélection : encadrez des blocs du calque actif, puis déplacez-les. Flèches : 1 case ; Maj + flèches : 10 cases.</p>'}</section>
      <section><h3>LIAISONS DE SAS</h3><p class="forge-note">En jeu, approchez un sas relié et appuyez sur E pour changer de salle. Les flèches indiquent les passages à sens unique.</p><label>Depuis ce secteur<select data-forge-field="link-from">${selectedDoorOptions()}</select></label><label>Vers un autre secteur<select data-forge-field="link-to">${targetDoorOptions()}</select></label><label><input data-forge-field="link-both" type="checkbox" checked>Aller-retour</label>${button('link','Relier les sas')}<div class="forge-links">${editor.model.data.links.map(link=>`<p>${escape(editor.model.data.rooms.find(r=>r.id===link.from.roomId)?.name)} ${link.bidirectional?'↔':'→'} ${escape(editor.model.data.rooms.find(r=>r.id===link.to.roomId)?.name)} ${button('unlink','Délier',`data-link="${escape(link.id)}"`)}</p>`).join('')||'<p class="forge-note">Aucune liaison.</p>'}</div></section>
      <section><h3>CONTRÔLES DU PARCOURS <span>${validation.issues.length}</span></h3><p class="forge-note">Salles accessibles, supports et arrivées aux sas. Un objectif peut se trouver dans une autre salle reliée. Ce contrôle ne prouve pas la faisabilité des sauts.</p><div class="forge-audit-v130">${validation.issues.slice(0,100).map((issue,index)=>button('issue',`${issue.severity==='error'?'ERREUR':'À VÉRIFIER'} · ${escape(issue.message)}`,`data-issue="${index}" class="forge-issue-${issue.severity}"`)).join('')||'<p>Aucune anomalie de parcours détectée.</p>'}</div>${validation.issues.length>100?'<p>Affichage limité aux 100 premiers éléments ; le rapport exporté contient tout.</p>':''}${button('report','Exporter le rapport')}</section>
      <section><h3>REPÈRES DU SECTEUR</h3><div class="forge-outline-v130">${editor.room.cells.filter(cell=>cell.label||['spawn','objective','door','terminal','npc','enemy'].includes(cell.type)).slice(0,100).map(cell=>button('focus',`${escape(LABELS[cell.type])} · ${escape(cell.label||cell.id)} (${cell.x},${cell.y})`,`data-cell="${escape(cell.id)}"`)).join('')}</div></section>
      <details><summary>Aide & limites du playtest</summary><p>Le fichier JSON contient toutes les salles, les quatre calques et les liaisons. Le parcours commence dans la salle active et charge les salles accessibles par leurs sas reliés. Validez leurs objectifs pour terminer le test ; une salle de transit n’exige pas d’objectif local.</p><p>Les décors locaux sont dessinés derrière ou devant les acteurs selon leur calque, sans collision. La progression du parcours reste dans la session de test. Les arrivées sont contrôlées à chaque passage ; la faisabilité des sauts reste à vérifier en jeu.</p><p>B/L/R/F/V/I/P : outils ; Ctrl/Cmd + Z/Y : annuler/rétablir ; Ctrl/Cmd + C/V/A : copier/coller/tout sélectionner ; Suppr : supprimer ; 0 : cadrer ; G : grille.</p></details>`;
      api.drawMinimap();api.refreshStatus();
    },
    drawMinimap(){const canvas=inspector.querySelector('.forge-minimap-v130');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.fillStyle='#08120f';ctx.fillRect(0,0,256,144);for(const cell of editor.room.cells){if(!editor.visible.has(cell.layer))continue;ctx.fillStyle=cell.type==='spawn'?'#8be8b4':cell.type==='enemy'?'#ec7d88':'#748e81';ctx.fillRect(cell.x/editor.cols*256,cell.y/editor.rows*144,Math.max(1,256/editor.cols),Math.max(1,144/editor.rows));}},
    refresh(){
      panel.querySelectorAll('[data-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.mode===editor.mode)));
      field('layer').value=editor.layer;field('brush').value=editor.brushSize;
      panel.querySelector('[data-forge-action="grid"]').setAttribute('aria-pressed',String(editor.grid));
      paletteTools.querySelector('[data-forge-layers]').innerHTML=LAYERS.map(layer=>`<div class="forge-layer-row"><span>${layerNames[layer]}</span><button type="button" data-forge-action="visibility" data-layer="${layer}" aria-label="Afficher ${layerNames[layer]}" aria-pressed="${editor.visible.has(layer)}">Vue</button><button type="button" data-forge-action="lock-layer" data-layer="${layer}" aria-label="Verrouiller ${layerNames[layer]}" aria-pressed="${editor.lockedLayers.has(layer)}">Verrou</button></div>`).join('');
      panel.querySelectorAll('[data-editor-tool]').forEach(node=>{node.textContent=LABELS[node.dataset.editorTool]||node.dataset.editorTool;node.classList.toggle('active',node.dataset.editorTool===editor.tool);node.setAttribute('aria-pressed',String(node.dataset.editorTool===editor.tool));});
      const mode=panel.querySelector('#editor-mode');if(mode)mode.value=editor.shipMode?'ship':'mission';
      api.refreshInspector();
    },
    focusCell(cell){editor.layer=cell.layer;editor.visible.add(cell.layer);editor.selection=new Set([cell.id]);const m=editor.matrix();editor.viewport.x+=editor.canvas.width/2-(m.x+(cell.x+.5)*m.scale);editor.viewport.y+=editor.canvas.height/2-(m.y+(cell.y+.5)*m.scale);editor.draw();api.refresh();editor.canvas.focus({preventScroll:true});},
    destroy(){dead=true;importRequest++;disposers.forEach(remove=>remove());toolbar.remove();inspector.remove();paletteTools.remove();message.remove();status.remove();saveStatus.remove();panel.classList.remove('forge-v130','forge-expanded-v130');}
  };
  listen(panel,'click',event=>{
    const target=event.target.closest('[data-forge-action]');if(!target)return;
    const action=target.dataset.forgeAction;
    guarded(()=>{
      if(action==='mode'){editor.cancelGesture();editor.mode=target.dataset.mode;api.refresh();editor.canvas.focus({preventScroll:true});}
      if(action==='fit')editor.fit();
      if(action==='grid'){editor.grid=!editor.grid;api.refresh();editor.draw();}
      if(action==='expand'){panel.classList.toggle('forge-expanded-v130');target.setAttribute('aria-pressed',String(panel.classList.contains('forge-expanded-v130')));}
      if(action==='visibility'){editor.cancelGesture();const layer=target.dataset.layer;editor.visible.has(layer)?editor.visible.delete(layer):editor.visible.add(layer);api.refresh();editor.draw();}
      if(action==='lock-layer'){editor.cancelGesture();const layer=target.dataset.layer;editor.lockedLayers.has(layer)?editor.lockedLayers.delete(layer):editor.lockedLayers.add(layer);api.refresh();}
      if(action==='copy')editor.copy();if(action==='paste')editor.paste();if(action==='delete')editor.removeSelection();
      if(action==='flip-x')editor.flip('x');if(action==='flip-y')editor.flip('y');
      if(action==='room-add'||action==='room-copy'){editor.edit(action==='room-add'?'Créer une salle':'Dupliquer une salle',()=>editor.model.addRoom({duplicate:action==='room-copy'}));editor.selection.clear();editor.fit();}
      if(action==='room-delete'&&globalThis.confirm(`Supprimer « ${editor.room.name} » et ses liaisons ? Cette action reste annulable.`)){editor.edit('Supprimer la salle',()=>editor.model.deleteRoom());editor.selection.clear();editor.fit();}
      if(action==='resize'){
        const w=Number(field('width').value),h=Number(field('height').value);const lost=editor.room.cells.filter(cell=>cell.x>=w||cell.y>=h).length;
        if(lost&&!globalThis.confirm(`Ce recadrage retirera ${lost} bloc(s) et leurs liaisons. Continuer ?`))return;
        editor.edit('Redimensionner la salle',()=>editor.model.resize(w,h,{crop:lost>0}));editor.fit();
      }
      if(action==='template'){const template=field('template').value;if(editor.room.cells.length&&!globalThis.confirm('Remplacer le contenu de cette salle par le gabarit ? Les autres salles sont conservées.'))return;editor.edit('Appliquer un gabarit',()=>applyTemplate(editor.model,template));}
      if(action.startsWith('story-')){editForgeNarrativeV156(editor,action,name=>field(name)?.value||'');api.message('Récit modifié. La commande reste annulable.');}
      if(action==='position'){const cell=editor.selected()[0];if(cell)editor.move(Number(field('cell-x').value)-cell.x,Number(field('cell-y').value)-cell.y);}
      if(action==='link'){const from=field('link-from').value,[roomId,cellId]=field('link-to').value.split(':');const both=field('link-both').checked;editor.edit('Relier les sas',()=>editor.model.link(from,roomId,cellId,both));}
      if(action==='unlink')editor.edit('Délier les sas',()=>{editor.model.data.links=editor.model.data.links.filter(link=>link.id!==target.dataset.link);});
      if(action==='issue'){const issue=getReport().issues[Number(target.dataset.issue)];if(!issue)return;editor.setRoom(issue.roomId);const cell=editor.room.cells.find(item=>item.id===issue.cellId);if(cell)api.focusCell(cell);else editor.fit();api.message(issue.message,issue.severity==='error');}
      if(action==='focus'){const cell=editor.room.cells.find(item=>item.id===target.dataset.cell);if(cell)api.focusCell(cell);}
      if(action==='report')download(doc,'frontier-forge-rapport-v141.json',JSON.stringify(getReport(),null,2));
    });
  });
  listen(panel,'change',event=>guarded(()=>{
    const name=event.target.dataset.forgeField,value=event.target.value;
    if(name==='story-node'){storyNodeV156=value;api.refreshInspector();return;}
    if(name==='room')editor.setRoom(value);
    if(name==='room-name')editor.edit('Renommer le secteur',()=>{editor.room.name=value;});
    if(name==='layer'){editor.cancelGesture();editor.layer=value;editor.selection.clear();api.refresh();editor.draw();}
    if(name==='brush'){editor.cancelGesture();editor.brushSize=Number(value);}
    if(name==='cell-label'||name==='cell-lock'){const cell=editor.selected()[0];if(cell){editor.assertSelectionEditable();editor.edit('Modifier les propriétés',()=>{if(name==='cell-label')cell.label=value;else cell.locked=event.target.checked;});}}
    if(['npc-name','npc-preset','npc-facing'].includes(name)){
      const cell=editor.selected()[0];if(cell?.type!=='npc')return;
      editor.assertSelectionEditable();if(cell.locked)throw new Error('Déverrouillez le PNJ avant de modifier ses propriétés.');
      editor.edit('Modifier le personnage',()=>{cell.npc={...cell.npc,...(name==='npc-name'?{name:value}:name==='npc-preset'?{presetId:value}:{facing:Number(value)})};});
    }
    if(['decor-asset','decor-opacity','decor-flip','decor-parallax'].includes(name)){
      const cell=editor.selected()[0];if(!cell||!decorative(cell))return;
      editor.assertSelectionEditable();editor.edit('Modifier le décor',()=>{
        const decoration={...(cell.decoration||defaultForgeDecorationV141(cell))};
        if(name==='decor-asset')decoration.assetId=value;
        if(name==='decor-opacity')decoration.opacity=value.trim()===''?NaN:Number(value)/100;
        if(name==='decor-flip')decoration.flipX=event.target.checked;
        if(name==='decor-parallax')decoration.parallax=value.trim()===''?NaN:Number(value);
        cell.decoration=decoration;
      });
    }
  }));
  listen(panel,'input',event=>{if(event.target.dataset.forgeField!=='search')return;const query=event.target.value.toLocaleLowerCase('fr');panel.querySelectorAll('[data-editor-tool]').forEach(node=>{node.hidden=!`${node.dataset.editorTool} ${LABELS[node.dataset.editorTool]}`.toLocaleLowerCase('fr').includes(query);});});
  listen(inspector,'click',event=>{if(!event.target.matches('.forge-minimap-v130'))return;const bounds=event.target.getBoundingClientRect(),x=(event.clientX-bounds.left)/bounds.width*editor.cols,y=(event.clientY-bounds.top)/bounds.height*editor.rows,m=editor.matrix();editor.viewport.x+=editor.canvas.width/2-(m.x+x*m.scale);editor.viewport.y+=editor.canvas.height/2-(m.y+y*m.scale);editor.draw();});
  listen(inspector,'keydown',event=>{if(event.target.matches('.forge-minimap-v130')&&['Enter',' '].includes(event.key)){event.preventDefault();event.stopPropagation();editor.fit();editor.canvas.focus();}});
  listen(panel,'keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('forge-expanded-v130')&&!editor.gesture&&!editor.selection.size){event.preventDefault();event.stopPropagation();panel.classList.remove('forge-expanded-v130');panel.querySelector('[data-forge-action="expand"]').setAttribute('aria-pressed','false');}},true);
  listen(clear,'click',event=>{event.preventDefault();event.stopImmediatePropagation();if(!editor.activeEditable()){api.message('Calque masqué ou verrouillé.',true);return;}if(globalThis.confirm(`Vider le calque « ${layerNames[editor.layer]} » ? Les blocs verrouillés et les autres calques sont conservés.`))guarded(()=>editor.clear());},true);
  const input=panel.querySelector('#editor-import');
  listen(input,'change',async event=>{
    event.stopImmediatePropagation();const file=input.files?.[0];if(!file)return;
    const request=++importRequest,revision=editor.model.revision;
    try{
      if(file.size>LIMITS.bytes)throw new Error('Fichier trop volumineux (4 Mio maximum).');
      const text=await file.text();if(dead||request!==importRequest)return;
      if(editor.model.revision!==revision||editor.gesture)throw new Error('Le plan a changé pendant la lecture. Import annulé ; choisissez à nouveau le fichier.');
      if(editor.model.data.rooms.some(room=>room.cells.length)&&!globalThis.confirm('Remplacer le projet ouvert par ce fichier ? L’import reste annulable.'))return;
      editor.load(text);api.message('Projet importé. Toutes les salles et liaisons ont été vérifiées.');
    }catch(error){api.message(error.message,true);}finally{if(request===importRequest)input.value='';}
  },true);
  const exportButton=panel.querySelector('#editor-export');
  listen(exportButton,'click',event=>{event.preventDefault();event.stopImmediatePropagation();guarded(()=>download(doc,`frontier-forge-v130-${Date.now()}.json`,JSON.stringify(editor.model.data,null,2)));},true);
  listen(play,'click',event=>{editor.cancelGesture();const report=guarded(getReport);if(!report?.ok){event.preventDefault();event.stopImmediatePropagation();api.refreshInspector();api.message('Corrigez les erreurs du parcours avant le playtest.',true);}},true);
  listen(globalThis,'atf:forge-save-status-v130',event=>{const state=event.detail;saveStatus.dataset.error=String(!state?.persisted);saveStatus.textContent=state?.persisted?'Plan enregistré dans l’espace Forge.':`Enregistrement non confirmé : ${state?.reason||'stockage indisponible'}. Exportez le projet avant de quitter.`;});
  listen(globalThis,'beforeunload',event=>{if(saveStatus.dataset.error==='true'){event.preventDefault();event.returnValue='';}});
  // setupEditor creates the legacy palette immediately after construction.
  queueMicrotask(()=>{if(!dead)api.refresh();});
  return api;
}
