import { LAYERS, TILE_TYPES, LABELS } from './forge-model-v130.js';
import { selectionBoundsV133 } from './forge-authoring-v133.js';
import { ARRANGEMENTS_V134, planArrangementV134, applyArrangementV134, exploreForgeV134,
  labelForgeCellsV134, diagramForgeV134, forgeSearchReportV134 } from './forge-layout-v134.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const layers = { background:'Arrière-plan', structure:'Structure', gameplay:'Interactions', foreground:'Premier plan' };
const button = (action, label, extra = '') => `<button type="button" data-nav-action="${action}" ${extra}>${label}</button>`;
const select = (name, caption, entries) => `<label>${caption}<select data-nav-field="${name}">${entries.map(([v,t])=>`<option value="${escape(v)}">${escape(t)}</option>`).join('')}</select></label>`;

/** Adds navigation and layout controls without capturing gameplay or text-input keys. */
export function mountForgeNavigatorV134(editor) {
  const doc = editor.canvas.ownerDocument, panel = editor.canvas.closest?.('[data-panel="editor"]');
  const work = panel?.querySelector('.forge-workbench-v133'); if (!doc || !work) return null;
  if (!doc.getElementById('forge-styles-v134')) {
    const css = doc.createElement('link'); css.id='forge-styles-v134'; css.rel='stylesheet';
    css.href=new URL('./forge-navigator-v134.css', import.meta.url).href; doc.head.append(css);
  }
  const tab = doc.createElement('button'); tab.type='button';tab.dataset.workAction='tab';tab.dataset.tab='explorer';
  tab.setAttribute('aria-pressed','false');tab.setAttribute('aria-controls','forge-panel-explorer-v134');tab.textContent='Explorateur';
  work.querySelector('.forge-tabs-v133').insertBefore(tab, work.querySelector('[data-work-selection]'));
  const explorer = doc.createElement('div');explorer.id='forge-panel-explorer-v134';explorer.dataset.workPanel='explorer';explorer.hidden=true;
  explorer.innerHTML=`<div class="forge-work-row"><label>Rechercher dans les salles<input type="search" data-nav-field="query" placeholder="Sas, terminal, repère…" maxlength="120"></label>
    ${select('scope','Portée',[['all','Toutes les salles'],['current','Salle active']])}
    ${select('type','Type',[['','Tous'],...TILE_TYPES.map(t=>[t,LABELS[t]])])}
    ${select('layer','Calque',[['','Tous'],...LAYERS.map(l=>[l,layers[l]] )])}
    ${select('state','État',[['','Tous'],['locked','Verrouillés'],['unlocked','Déverrouillés'],['unlinked','Sas non reliés']])}
    ${button('reset','Effacer les filtres')}</div>
    <p class="forge-work-note">Rechercher ne modifie pas le niveau. Les cases cochées servent à numéroter des repères ; « Sélectionner dans le plan » demande une seule salle.</p>
    <div class="forge-work-row">${button('page-mark','Cocher cette page')}${button('clear-marks','Tout décocher')}${button('select-marked','Sélectionner dans le plan')}${button('export-search','Exporter les résultats JSON')}</div>
    <div class="forge-explorer-list-v134" data-nav-results></div>
    <div class="forge-work-row">${button('previous','Page précédente')}<output data-nav-page aria-live="polite"></output>${button('next','Page suivante')}</div>
    <details><summary>Numéroter les repères cochés</summary><div class="forge-work-row"><label>Préfixe<input data-nav-field="prefix" maxlength="100" placeholder="Terminal maintenance"></label><label>Départ<input data-nav-field="start" type="number" min="0" max="999999" value="1"></label>${button('label','Appliquer la numérotation')}</div><p class="forge-work-note">Une seule annulation pour toute la numérotation. Identifiants, connexions et rôles natifs inchangés.</p></details>`;
  work.append(explorer);
  const layout = doc.createElement('details');layout.className='forge-layout-v134';
  layout.innerHTML=`<summary>Aligner, espacer et cadrer</summary><div class="forge-work-row">
    ${select('grouping','Déplacer',[['islands','Groupes de blocs jointifs'],['cells','Chaque bloc séparément']])}
    ${select('reference','Cadre',[['selection','Sélection'],['room','Salle entière']])}
    ${select('command','Disposition',Object.entries(ARRANGEMENTS_V134))}
    <label>Pas de grille<input data-nav-field="step" type="number" min="1" max="16" value="2"></label>
    ${button('preview','Prévisualiser')}${button('apply','Appliquer','disabled')}${button('cancel','Annuler l’aperçu')}${button('frame-selection','Cadrer la sélection · Home')}${button('frame-content','Cadrer les blocs')}</div>
    <p class="forge-work-note">Les blocs jointifs se déplacent ensemble ; les diagonales restent séparées. Vert : pose possible, rouge : conflit. L’aperçu ne déplace aucun bloc.</p><output data-nav-plan></output>`;
  work.querySelector('[data-work-panel="tools"]').append(layout);
  const graph = doc.createElement('section');graph.className='forge-diagram-v134';
  graph.setAttribute('aria-label','Schéma logique des connexions');
  graph.innerHTML='<p class="forge-work-note">Schéma logique, non géographique. Les flèches indiquent le sens des sas. Chaque carte peut être ouverte au clavier.</p><div class="forge-diagram-scroll-v134"><div data-nav-diagram></div></div><p data-nav-graph-note class="forge-work-note"></p>';
  work.querySelector('[data-work-panel="graph"]').prepend(graph);
  const message = doc.createElement('p');message.className='forge-nav-status-v134';message.setAttribute('role','status');work.append(message);
  const disposers=[],field=name=>work.querySelector(`[data-nav-field="${name}"]`),access=()=>({locked:editor.lockedLayers,visible:editor.visible});
  let plan=null, page=0, result=null, model=editor.model, lastData=null, queryKey='', diagramData=null, disposed=false;
  const marked = new Set();
  const listen=(target,type,fn)=>{target.addEventListener(type,fn);disposers.push(()=>target.removeEventListener(type,fn));};
  const filters=()=>({query:field('query').value,roomId:field('scope').value==='current'?editor.room.id:'',type:field('type').value,layer:field('layer').value,state:field('state').value});
  const tell=(text,error=false)=>{message.textContent=text;message.dataset.error=String(error);};
  const guard=fn=>{try{return fn();}catch(error){tell(error.message,true);return false;}};
  const output=name=>work.querySelector(`[data-nav-${name}]`);
  const invalidate=()=>{plan=null;work.querySelector('[data-nav-action="apply"]').disabled=true;output('plan').textContent='';};
  const download=content=>{const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=doc.createElement('a');a.href=url;a.download='frontier-forge-reperes.json';doc.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  function renderResults() {
    result=exploreForgeV134(editor.model.data,{...filters(),page,pageSize:50});page=result.page;
    output('results').innerHTML=result.items.map(cell=>`<div class="forge-explorer-row-v134"><input type="checkbox" data-nav-mark="${escape(cell.id)}" aria-label="Cocher ${escape(cell.label||cell.id)}" ${marked.has(cell.id)?'checked':''}>
      ${button('focus',`<strong>${escape(cell.label||LABELS[cell.type])}</strong><small>${escape(cell.roomName)} · ${escape(layers[cell.layer])} · ${cell.x}, ${cell.y}${cell.locked?' · verrouillé':''}</small>`,`data-room="${escape(cell.roomId)}" data-cell="${escape(cell.id)}"`)}</div>`).join('')||'<p>Aucun bloc ne correspond aux filtres.</p>';
    output('page').textContent=`${result.total} résultat(s) · page ${page+1}/${result.pages} · ${marked.size} coché(s)`;
    work.querySelector('[data-nav-action="previous"]').disabled=page===0;
    work.querySelector('[data-nav-action="next"]').disabled=page+1>=result.pages;
  }
  function renderDiagram() {
    const data=diagramForgeV134(editor.model.data), canvas=output('diagram');
    canvas.style.width=`${data.width}px`;canvas.style.height=`${data.height}px`;
    canvas.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${data.width}" height="${data.height}" aria-hidden="true" focusable="false"><defs><marker id="forge-arrow-v134" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs>${data.edges.map(edge=>`<path class="forge-edge-v134" d="${edge.d}" marker-end="url(#forge-arrow-v134)" ${edge.both?'marker-start="url(#forge-arrow-v134)"':''}/>`).join('')}</svg>` + data.nodes.map(n=>button('open-room',`<strong>${escape(n.name)}</strong><small>${n.blocks} blocs · ${n.reachable?'accessible':'non reliée'}</small>`,`class="forge-node-v134" data-room="${escape(n.id)}" data-reachable="${n.reachable}" aria-pressed="${n.active}" style="left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px"`)).join('');
    output('graph-note').textContent=`${data.nodes.length} salle(s) · ${editor.model.data.links.length} liaison(s)${data.omittedEdges?' · affichage limité à 160 tracés ; la liste détaillée conserve les autres liaisons':''}`;
  }
  function focusSelection() {
    const cells=editor.selected();if(!cells.length)throw new Error('Sélectionnez des blocs à cadrer.');
    api.frame(cells);editor.canvas.focus({preventScroll:true});
  }
  const api={
    refresh() {
      if(disposed)return;
      if(model!==editor.model){model=editor.model;marked.clear();page=0;invalidate();lastData=null;}
      if(plan&&(plan.source!==model.data||plan.revision!==model.revision||model.pending||plan.ids.length!==editor.selection.size||plan.ids.some(id=>!editor.selection.has(id)))){invalidate();tell('Le projet a changé : aperçu annulé.');}
      const key=JSON.stringify([filters(),page]);
      if(lastData!==model.data||key!==queryKey){
        const valid=new Set(model.data.rooms.flatMap(r=>r.cells.map(c=>c.id)));for(const id of marked)if(!valid.has(id))marked.delete(id);
        lastData=model.data;queryKey=key;renderResults();
      }
      if(diagramData!==model.data){diagramData=model.data;renderDiagram();}
    },
    frame(cells) {
      const bounds=selectionBoundsV133(cells);if(!bounds)return;
      editor.cancelGesture();const base=Math.min(editor.canvas.width/editor.cols,editor.canvas.height/editor.rows);
      const scale=Math.min(editor.canvas.width/(bounds.w+4),editor.canvas.height/(bounds.h+4));
      editor.viewport.zoom=Math.max(.25,Math.min(8,scale/base));const matrix=editor.matrix();
      editor.viewport.x+=editor.canvas.width/2-(matrix.x+(bounds.x+bounds.w/2)*matrix.scale);
      editor.viewport.y+=editor.canvas.height/2-(matrix.y+(bounds.y+bounds.h/2)*matrix.scale);
      editor.draw();editor.ui?.refreshStatus();
    },
    draw() {
      if(disposed||!plan||plan.source!==editor.model.data||editor.gesture)return;
      const ctx=editor.context,m=editor.matrix(),bad=new Set(plan.errors.map(e=>e.cellId));
      ctx.save();ctx.translate(m.x,m.y);
      for(const cell of plan.moves){const x=cell.x*m.scale,y=cell.y*m.scale;if(x+m.scale<-m.x||y+m.scale<-m.y||x>editor.canvas.width-m.x||y>editor.canvas.height-m.y)continue;
        ctx.fillStyle=bad.has(cell.id)?'#df667670':'#86dcb970';ctx.strokeStyle=bad.has(cell.id)?'#ffadad':'#c9f6d7';ctx.lineWidth=2;
        ctx.fillRect(x,y,m.scale,m.scale);ctx.strokeRect(x+1,y+1,m.scale-2,m.scale-2);
      }ctx.restore();
    },
    keyDown(event) {
      if(event.key==='Escape'&&plan){event.preventDefault();event.stopPropagation();invalidate();editor.draw();return true;}
      if(event.key==='Home'&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();event.stopPropagation();guard(focusSelection);return true;}
      return false;
    },
    destroy(){disposed=true;disposers.forEach(off=>off());tab.remove();explorer.remove();layout.remove();graph.remove();message.remove();}
  };
  listen(work,'click',event=>{
    const target=event.target.closest('[data-nav-action]');if(!target)return;
    guard(()=>{
      const action=target.dataset.navAction;
      if(action==='preview'){
        editor.cancelGesture();editor.workbenchV133.cancelStamp();
        plan=planArrangementV134(editor.model,[...editor.selection],field('command').value,{grouping:field('grouping').value,reference:field('reference').value,step:Number(field('step').value),...access()});
        output('plan').textContent=`${plan.groups} groupe(s) · ${plan.moves.length} bloc(s) · ${plan.ok?(plan.changed?'disposition disponible':'déjà alignés'):[...new Set(plan.errors.map(e=>e.code))].join(', ')}`;
        work.querySelector('[data-nav-action="apply"]').disabled=!plan.ok||!plan.changed;editor.draw();
      }
      if(action==='apply'){const changed=applyArrangementV134(editor.model,plan,access());invalidate();if(changed)editor.notify();tell('Disposition appliquée ; une annulation rétablit le groupe.');}
      if(action==='cancel'){invalidate();editor.draw();}
      if(action==='frame-selection')focusSelection();
      if(action==='frame-content')api.frame(editor.room.cells.filter(c=>editor.visible.has(c.layer)));
      if(action==='reset'){for(const name of ['query','type','layer','state'])field(name).value='';field('scope').value='all';page=0;queryKey='';api.refresh();}
      if(action==='next'||action==='previous'){page+=action==='next'?1:-1;api.refresh();}
      if(action==='page-mark'){result.items.forEach(c=>marked.add(c.id));renderResults();}
      if(action==='clear-marks'){marked.clear();renderResults();}
      if(action==='label'){
        editor.cancelGesture();if(!globalThis.confirm(`Numéroter ${marked.size} repère(s) ? Cette opération est annulable.`))return;
        if(labelForgeCellsV134(editor.model,[...marked],field('prefix').value,Number(field('start').value),access()))editor.notify();tell('Repères numérotés ; les identifiants et les liaisons sont conservés.');
      }
      if(action==='select-marked'){
        const rooms=editor.model.data.rooms.filter(r=>r.cells.some(c=>marked.has(c.id)));
        if(rooms.length!==1)throw new Error('Cochez des blocs d’une seule salle pour les sélectionner dans le plan.');
        const cells=rooms[0].cells.filter(c=>marked.has(c.id));editor.setRoom(rooms[0].id);cells.forEach(c=>editor.visible.add(c.layer));
        editor.selection=new Set(cells.map(c=>c.id));editor.ui?.refresh();editor.workbenchV133.refresh();focusSelection();
      }
      if(action==='focus'){
        editor.setRoom(target.dataset.room);const cell=editor.room.cells.find(c=>c.id===target.dataset.cell);if(cell)editor.ui.focusCell(cell);api.refresh();
      }
      if(action==='open-room'){editor.setRoom(target.dataset.room);api.refresh();}
      if(action==='export-search'){
        const report=forgeSearchReportV134(editor.model.data,filters());download(report);tell(`${report.total} résultat(s) exporté(s).`);
      }
    });
  });
  listen(work,'input',event=>{if(event.target.dataset.navField==='query'){page=0;api.refresh();}});
  listen(work,'change',event=>{
    if(event.target.dataset.navMark){event.target.checked?marked.add(event.target.dataset.navMark):marked.delete(event.target.dataset.navMark);output('page').textContent=`${result.total} résultat(s) · page ${page+1}/${result.pages} · ${marked.size} coché(s)`;return;}
    const name=event.target.dataset.navField;
    if(['scope','type','layer','state'].includes(name)){page=0;api.refresh();}
    if(['grouping','reference','command','step'].includes(name)){invalidate();editor.draw();}
  });
  // Existing layer switches and graph controls also need to refresh the explorer.
  listen(panel,'click',()=>api.refresh());listen(panel,'change',()=>api.refresh());
  queueMicrotask(()=>{if(!disposed)api.refresh();});return api;
}
