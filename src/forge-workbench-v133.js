import { LAYERS, TILE_TYPES, LABELS } from './forge-model-v130.js';
import { BUILTIN_ASSEMBLIES_V133, ForgeAssemblyLibraryV133, captureAssemblyV133, transformAssemblyV133,
  placementPreviewV133, stampAssemblyV133, editSelectionV133, selectionBoundsV133, roomGraphV133 } from './forge-authoring-v133.js';
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layerName = {background:'Arrière-plan',structure:'Structure',gameplay:'Interactions',foreground:'Premier plan'};
const button = (action,label,attrs='') => `<button type="button" data-work-action="${action}" ${attrs}>${label}</button>`;
const options = (entries) => entries.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
function download(doc,name,content,type='application/json') {
  const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));
  const anchor=doc.createElement('a');anchor.download=name;anchor.href=url;doc.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
/** Static controls keep keyboard focus. Lists are redrawn only after document/library changes. */
export function mountForgeWorkbenchV133(editor,store) {
  const doc=editor.canvas.ownerDocument,panel=editor.canvas.closest?.('[data-panel="editor"]');if(!doc||!panel)return null;
  if(!doc.getElementById('forge-styles-v133')){const link=doc.createElement('link');link.id='forge-styles-v133';link.rel='stylesheet';link.href=new URL('./forge-workbench-v133.css',import.meta.url).href;doc.head.append(link);}
  const root=doc.createElement('section');root.className='forge-workbench-v133';root.setAttribute('aria-label','Outils avancés Frontier Forge');
  const layers=options(LAYERS.map(id=>[id,layerName[id]])), types=options(TILE_TYPES.map(id=>[id,LABELS[id]]));
  root.innerHTML=`<nav class="forge-tabs-v133" aria-label="Ateliers">${[['tools','Outils'],['assemblies','Assemblages'],['projects','Projets'],['graph','Réseau des salles']].map(([tab,label])=>button('tab',label,`data-tab="${tab}" aria-pressed="${tab==='tools'}" aria-controls="forge-panel-${tab}-v133"`)).join('')}<span data-work-selection></span></nav>
  <div data-work-panel="tools" id="forge-panel-tools-v133"><div class="forge-work-row"><label>Sélection<select data-work-field="scope"><option value="active">Calque actif</option><option value="visible">Tous les calques visibles</option></select></label>${button('select-all','Tout sélectionner')}${button('deselect','Désélectionner')}${button('outline','Rectangle creux','aria-pressed="false"')}${button('rotate','Rotation 90°')}${button('lock','Verrouiller')}${button('unlock','Déverrouiller')}${button('png','Exporter la vue PNG')}</div>
  <details><summary>Transformation de groupes et historique</summary><div class="forge-work-row"><label>Type<select data-work-field="type">${types}</select></label>${button('replace-type','Remplacer le type')}<label>Calque cible<select data-work-field="target-layer">${layers}</select></label>${button('move-layer','Déplacer sur ce calque')}<label>Copies<input data-work-field="repeat" type="number" min="1" max="12" value="2"></label><label>Décalage X<input data-work-field="dx" type="number" min="-128" max="128" value="4"></label><label>Décalage Y<input data-work-field="dy" type="number" min="-72" max="72" value="0"></label>${button('repeat','Répéter le groupe')}</div><p class="forge-work-note">Maj + rectangle ajoute à la sélection ; Ctrl/Cmd + rectangle retire. Rotation : positions des cases seulement, pas orientation des sprites. Les liens des sas restent attachés à leurs identifiants.</p><ol data-work-history></ol></details></div>
  <div data-work-panel="assemblies" id="forge-panel-assemblies-v133" hidden><div class="forge-work-row"><label>Rechercher un assemblage<input data-work-field="assembly-search" type="search" placeholder="Coursive, maintenance…"></label><label>Nom de la sélection<input data-work-field="assembly-name" maxlength="80" placeholder="Mon module de coursive"></label>${button('capture','Conserver la sélection')}${button('library-export','Exporter la bibliothèque')}<label class="forge-work-file">Importer une bibliothèque<input data-work-field="library-import" type="file" accept=".json,application/json"></label></div><div class="forge-assembly-list-v133" data-work-assemblies></div><div class="forge-work-row"><strong data-work-assembly-name>Aucun assemblage choisi</strong>${button('stamp-rotate','Tourner le module')}${button('stamp-mirror','Miroir du module')}${button('stamp','Placer sur le plan')}${button('stamp-cancel','Terminer la pose')}${button('library-delete','Supprimer de la bibliothèque')}${button('library-raw','Exporter les données originales')}</div><p class="forge-work-note">Aperçu vert : pose possible ; rouge : conflit. Un clic pose une copie avec de nouveaux identifiants. Échap termine la pose. Les assemblages sont des blocs éditables, pas des liens vivants : modifier l’original ne modifie pas ses copies.</p></div>
  <div data-work-panel="projects" id="forge-panel-projects-v133" hidden><div class="forge-work-row"><label>Rechercher un projet<input data-work-field="project-search" type="search"></label><label>Nom du projet<input data-work-field="project-name" maxlength="120" placeholder="Mon nouveau parcours"></label><label>Mode<select data-work-field="project-kind"><option value="mission">Mission</option><option value="ship">Vaisseau</option></select></label>${button('project-create','Nouveau projet')}${button('project-copy','Enregistrer une copie')}${button('project-rename','Renommer')}${button('project-save','Enregistrer')}</div><div class="forge-project-list-v133" data-work-projects></div><div class="forge-work-row">${button('workspace-export','Exporter tous les projets')}<label class="forge-work-file">Ajouter des projets<input data-work-field="workspace-import" type="file" accept=".json,application/json"></label>${button('project-delete','Supprimer le projet actif')}${button('workspace-backup','Restaurer la copie de secours')}${button('workspace-raw','Exporter l’original sauvegardé')}</div><p data-work-storage class="forge-work-note"></p><p class="forge-work-note">Changer de projet ouvre un historique indépendant. En cas d’enregistrement échoué, le changement est refusé. L’import de bibliothèque de projets ajoute des copies et ne remplace pas vos projets existants.</p></div>
  <div data-work-panel="graph" id="forge-panel-graph-v133" hidden><p class="forge-work-note">Connexions dirigées depuis la salle active. Ce schéma décrit les liaisons, pas la position physique des salles ni la faisabilité des sauts. Le comportement jouable dépend de la version du moteur installée.</p><div class="forge-room-graph-v133" data-work-graph></div></div>
  <p class="forge-work-status-v133" role="status" aria-live="polite" data-work-message></p>`;
  panel.querySelector('.editor-layout').before(root);
  let storage=store?.storage;if(!store)try{storage=globalThis.localStorage;}catch{storage=null;}
  const library=new ForgeAssemblyLibraryV133(storage);library.load();
  let currentAssembly=null,turns=0,flipX=false,anchor=null,tab='tools',disposed=false,request=0,lastListKey='',lastGraphKey='';
  const removers=[],field=name=>root.querySelector(`[data-work-field="${name}"]`), workspace=()=>editor.workspaceV133;
  const listen=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);removers.push(()=>target.removeEventListener(type,fn,opts));};
  const guard=fn=>{try{return fn();}catch(error){api.message(error.message,true);editor.draw();return false;}};
  const guards=()=>({locked:editor.lockedLayers,visible:editor.visible});
  const module=()=>currentAssembly?transformAssemblyV133(currentAssembly,{turns,flipX}):null;
  const api={library,
    message(text,error=false){const node=root.querySelector('[data-work-message]');node.textContent=text;node.dataset.error=String(error);},
    cancelStamp(){anchor=null;if(editor.mode==='stamp')editor.mode='brush';},
    refresh(){
      if(disposed)return;
      root.querySelector('[data-work-selection]').textContent=`${editor.selection.size} bloc(s) sélectionné(s)`;
      root.querySelector('[data-work-action="outline"]').setAttribute('aria-pressed',String(editor.mode==='outline'));
      const history=editor.history.slice(-8).reverse();root.querySelector('[data-work-history]').innerHTML=history.map(h=>`<li>${escape(h.label)}</li>`).join('')||'<li>Aucune modification dans ce projet.</li>';
      panel.querySelector('#editor-undo').disabled=!editor.history.length;panel.querySelector('#editor-redo').disabled=!editor.future.length;
      const listKey=JSON.stringify([library.revision,field('assembly-search').value,currentAssembly?.id]);
      if(listKey!==lastListKey){lastListKey=listKey;const q=field('assembly-search').value.toLocaleLowerCase('fr');root.querySelector('[data-work-assemblies]').innerHTML=[...BUILTIN_ASSEMBLIES_V133,...library.data.entries].filter(a=>a.name.toLocaleLowerCase('fr').includes(q)).map(a=>button('assembly-choose',`<strong>${escape(a.name)}</strong><small>${a.size.join(' × ')} · ${a.cells.length} blocs · ${a.builtin?'fourni':'personnel'}</small>`,`data-assembly="${escape(a.id)}" aria-pressed="${currentAssembly?.id===a.id}"`)).join('')||'<p>Aucun assemblage.</p>';}
      root.querySelector('[data-work-assembly-name]').textContent=currentAssembly?`${currentAssembly.name} · ${turns*90}°${flipX?' · miroir':''}`:'Aucun assemblage choisi';
      root.querySelector('[data-work-action="library-delete"]').disabled=!currentAssembly||Boolean(currentAssembly.builtin);
      for(const action of ['stamp','stamp-rotate','stamp-mirror'])root.querySelector(`[data-work-action="${action}"]`).disabled=!currentAssembly;
      const ws=workspace(),q=field('project-search').value.toLocaleLowerCase('fr');
      if(ws){root.querySelector('[data-work-projects]').innerHTML=ws.store.data.projects.filter(p=>p.name.toLocaleLowerCase('fr').includes(q)).map(p=>button('project-open',`<strong>${escape(p.name)}</strong><small>${p.kind==='ship'?'Vaisseau':'Mission'} · ${p.rooms?.length||1} salle(s)</small>`,`data-project="${escape(p.id)}" aria-pressed="${p.id===ws.id}"`)).join('')||'<p>Aucun projet enregistré.</p>';
        root.querySelector('[data-work-storage]').textContent=ws.store.lastWriteV130.persisted?'Dernière écriture confirmée dans l’espace Forge.':`Stockage non confirmé : ${ws.store.lastWriteV130.reason}. Exportez votre travail.`;
      }else root.querySelector('[data-work-storage]').textContent='Gestion des projets indisponible dans cet hôte. L’export du plan reste disponible.';
      const graphKey=`${editor.model.revision}:${editor.room.id}`;
      if(graphKey!==lastGraphKey){lastGraphKey=graphKey;const graph=roomGraphV133(editor.model.data);root.querySelector('[data-work-graph]').innerHTML=graph.map(r=>`<article data-reachable="${r.reachable}">${button('room-open',escape(r.name),`data-room="${escape(r.id)}" aria-pressed="${r.active}"`)}<p>${r.blocks} blocs · ${r.doors.filter(d=>!d.linked).length} sas non relié(s)${r.reachable?'':' · non accessible'}</p>${r.exits.map(e=>button('room-open',`${e.both?'↔':'→'} ${escape(graph.find(r=>r.id===e.to)?.name)}`,`data-room="${escape(e.to)}"`)).join('')||'<small>Aucune sortie reliée</small>'}<div>${r.doors.map(d=>button('door-focus',`${d.linked?'Sas':'Sas libre'} · ${escape(d.label)}`,`data-room="${escape(r.id)}" data-cell="${escape(d.id)}"`)).join('')}</div></article>`).join('');}
    },
    pointerDown(event){
      if(editor.mode!=='stamp'||event.altKey||event.button===1||editor.gesture)return false;
      event.preventDefault();if(event.button!==0||event.isPrimary===false)return true;
      const p=editor.point(event);if(!p)return true;editor.canvas.focus({preventScroll:true});
      guard(()=>{editor.selection=new Set(stampAssemblyV133(editor.model,module(),p.x,p.y,guards()));editor.notify();api.message('Assemblage posé. Cliquez pour une autre copie, Échap pour terminer.');});return true;
    },
    pointerMove(){if(editor.mode==='stamp'){anchor=editor.cursor;editor.draw();}},
    keyDown(event){
      if(event.key==='Escape'&&editor.mode==='stamp'){event.preventDefault();event.stopPropagation();api.cancelStamp();api.refresh();editor.draw();return true;}
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){event.preventDefault();event.stopPropagation();guard(()=>{const b=selectionBoundsV133(editor.selected());if(!b)throw new Error('Sélectionnez un groupe.');editSelectionV133(editor.model,[...editor.selection],'array',{count:1,dx:b.w+1,dy:0},guards());editor.notify();});return true;}
      return false;
    },
    draw(){
      if(disposed)return;const ctx=editor.context,m=editor.matrix();
      if(editor.mode==='stamp'&&anchor&&currentAssembly){const preview=placementPreviewV133(editor.model,module(),anchor.x,anchor.y,guards());ctx.save();ctx.translate(m.x,m.y);for(const {cell,reason} of preview.cells){ctx.fillStyle=reason?'#ff666670':'#97e7b870';ctx.fillRect(cell.x*m.scale,cell.y*m.scale,m.scale,m.scale);ctx.strokeStyle=reason?'#ff9595':'#caffdf';ctx.strokeRect(cell.x*m.scale,cell.y*m.scale,m.scale,m.scale);}ctx.restore();}
      if(editor.gesture?.mode==='outline'){const {start,end}=editor.gesture;ctx.save();ctx.strokeStyle='#f2d194';ctx.lineWidth=2;ctx.strokeRect(m.x+Math.min(start.x,end.x)*m.scale,m.y+Math.min(start.y,end.y)*m.scale,(Math.abs(start.x-end.x)+1)*m.scale,(Math.abs(start.y-end.y)+1)*m.scale);ctx.restore();}
    },
    destroy(){disposed=true;request++;removers.forEach(remove=>remove());root.remove();}
  };
  listen(root,'click',event=>{const target=event.target.closest('[data-work-action]');if(!target)return;const action=target.dataset.workAction;
    guard(()=>{
      if(action==='tab'){tab=target.dataset.tab;root.querySelectorAll('[data-work-panel]').forEach(n=>n.hidden=n.dataset.workPanel!==tab);root.querySelectorAll('[data-tab]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.tab===tab)));api.refresh();return;}
      if(action==='select-all')editor.selectRect({x:0,y:0,w:editor.cols,h:editor.rows});
      if(action==='deselect'){editor.selection.clear();editor.draw();editor.ui?.refreshInspector();}
      if(action==='outline'){editor.cancelGesture();api.cancelStamp();editor.mode='outline';editor.canvas.focus();}
      if(['rotate','lock','unlock','replace-type','move-layer','repeat'].includes(action)){
        editor.cancelGesture();const command={'replace-type':'type','move-layer':'layer',repeat:'array'}[action]||action;
        const value=action==='replace-type'?field('type').value:action==='move-layer'?field('target-layer').value:{count:Number(field('repeat').value),dx:Number(field('dx').value),dy:Number(field('dy').value)};
        if(editSelectionV133(editor.model,[...editor.selection],command,value,guards()))editor.notify();
      }
      if(action==='png')editor.canvas.toBlob(blob=>{if(blob&&!disposed)download(doc,'frontier-forge-vue.png',blob,'image/png');});
      if(action==='capture'){const entry=library.add(captureAssemblyV133(editor.model,[...editor.selection],field('assembly-name').value));currentAssembly=entry;turns=0;flipX=false;api.message('Assemblage enregistré dans la bibliothèque locale.');}
      if(action==='assembly-choose'){currentAssembly=[...BUILTIN_ASSEMBLIES_V133,...library.data.entries].find(a=>a.id===target.dataset.assembly);turns=0;flipX=false;}
      if(action==='stamp-rotate')turns=(turns+1)%4;
      if(action==='stamp-mirror')flipX=!flipX;
      if(action==='stamp'){editor.cancelGesture();editor.mode='stamp';editor.canvas.focus({preventScroll:true});editor.canvas.scrollIntoView?.({block:'center',behavior:'auto'});api.message('Choisissez une case sur le plan. Aucun bloc existant ne sera écrasé.');}
      if(action==='stamp-cancel'){api.cancelStamp();editor.draw();}
      if(action==='library-delete'&&currentAssembly&&!currentAssembly.builtin&&globalThis.confirm(`Supprimer l’assemblage « ${currentAssembly.name} » ? Les copies posées restent dans les salles.`)){library.remove(currentAssembly.id);currentAssembly=null;api.cancelStamp();}
      if(action==='library-export')download(doc,'frontier-forge-assemblages.json',library.export());
      if(action==='library-raw')download(doc,'frontier-forge-assemblages-original.txt',library.raw??'','text/plain');
      const ws=workspace();
      if(action.startsWith('project-')||action.startsWith('workspace-')){
        if(!ws)throw new Error('Gestion des projets non raccordée dans cet hôte.');
        const name=field('project-name').value.trim();
        if(action==='project-create')ws.create(name||'Nouveau projet',field('project-kind').value);
        if(action==='project-copy')ws.duplicate(name);
        if(action==='project-rename')ws.rename(name);
        if(action==='project-open')ws.open(target.dataset.project);
        if(action==='project-save'){if(!ws.saveCurrent())throw new Error(ws.store.lastWriteV130.reason);api.message('Projet enregistré.');}
        if(action==='project-delete'&&globalThis.confirm('Supprimer le projet actif de la bibliothèque ? Exportez-le d’abord pour conserver une copie.'))ws.remove();
        if(action==='workspace-export')download(doc,'frontier-forge-projets.json',ws.export());
        if(action==='workspace-raw')download(doc,'frontier-forge-original.txt',ws.store.exportRawV130()??'','text/plain');
        if(action==='workspace-backup'){const raw=ws.backupText();if(globalThis.confirm('Restaurer la dernière copie de secours et remplacer la bibliothèque actuelle ? Exportez les projets et les données originales avant de confirmer.'))ws.restoreBackup(raw);}
      }
      if(action==='room-open'||action==='door-focus'){editor.setRoom(target.dataset.room);if(action==='door-focus'){const cell=editor.room.cells.find(c=>c.id===target.dataset.cell);if(cell)editor.ui?.focusCell(cell);}}
      api.refresh();editor.draw();
    });
  });
  listen(root,'input',event=>{if(['assembly-search','project-search'].includes(event.target.dataset.workField))api.refresh();});
  listen(root,'change',event=>{
    const name=event.target.dataset.workField;
    if(name==='scope'){editor.selectionScopeV133=event.target.value;return;}
    if(!['library-import','workspace-import'].includes(name))return;
    const input=event.target,file=input.files?.[0];if(!file)return;const ticket=++request,revision=editor.model.revision,epoch=workspace()?.epoch,libRevision=library.revision;
    const task=async()=>{try{
      if(file.size>(name==='library-import'?2:16)*1024*1024)throw new Error('Fichier trop volumineux.');
      const text=await file.text();if(disposed||ticket!==request)return;
      if(revision!==editor.model.revision||epoch!==workspace()?.epoch||libRevision!==library.revision||editor.gesture)throw new Error('L’atelier a changé pendant la lecture. Import annulé.');
      const count=name==='library-import'?library.merge(text):workspace()?.merge(text);
      if(count===undefined)throw new Error('Gestion des projets non raccordée.');
      api.message(`${count} élément(s) ajouté(s), sans écraser les éléments existants.`);api.refresh();
    }catch(error){api.message(error.message,true);}finally{if(ticket===request)input.value='';}};
    void task();
  });
  listen(globalThis,'atf:forge-save-status-v130',()=>api.refresh());
  listen(panel,'change',event=>{if(event.target.dataset.forgeField==='layer')api.cancelStamp();});
  queueMicrotask(()=>{if(!disposed){api.refresh();if(library.error)api.message(`Bibliothèque d’assemblages protégée : ${library.error}`,true);}});
  return api;
}
