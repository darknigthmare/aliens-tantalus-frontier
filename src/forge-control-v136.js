import { inspectForgePlaytestV136 } from './forge-playtest-v136.js';
import { ForgeVersionStoreV136, compareForgeDocumentsV136 } from './forge-versions-v136.js';
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,extra='')=>`<button type="button" data-control-action="${action}" ${extra}>${label}</button>`;
function download(doc,name,text) {const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=doc.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function mountForgeControlV136(editor) {
  const doc=editor.canvas.ownerDocument,panel=editor.canvas.closest?.('[data-panel="editor"]');
  const workbench=panel?.querySelector('.forge-workbench-v133');if(!workbench||!doc)return null;
  if(!doc.getElementById('forge-styles-v136')){const link=doc.createElement('link');link.id='forge-styles-v136';link.rel='stylesheet';link.href=new URL('./forge-control-v136.css',import.meta.url).href;doc.head.append(link);}
  const tab=doc.createElement('button');tab.type='button';tab.dataset.workAction='tab';tab.dataset.tab='control';tab.setAttribute('aria-pressed','false');tab.textContent='Contrôle & versions';workbench.querySelector('.forge-tabs-v133').append(tab);
  const root=doc.createElement('section');root.className='forge-control-v136';root.dataset.workPanel='control';root.hidden=true;root.setAttribute('aria-label','Contrôle du test natif et versions des niveaux');
  root.innerHTML=`<header><h3>Contrôle du test natif</h3><p data-control-status role="status"></p></header>
    <p class="forge-work-note">Volumes techniques de la salle active, pas un aperçu artistique. Les autres salles et les décors ne sont pas chargés par le test publié.</p>
    <canvas width="1240" height="260" data-control-preview aria-label="Volumes de collision et silhouette du Marine à son insertion"></canvas>
    <div class="forge-work-row"><label>Diagnostics<select data-control-field="severity"><option value="all">Tous</option><option value="error">Erreurs</option><option value="warning">Avertissements</option></select></label>${button('audit','Recontrôler')}${button('report','Exporter le contrôle')}${button('test','Tester la salle active')}</div>
    <div data-control-issues class="forge-control-issues-v136"></div>
    <section class="forge-versions-v136"><h3>Versions nommées du projet</h3>
    <p class="forge-work-note">Créez une copie avant un changement important. Restaurer ouvre un nouveau projet ; le projet courant et la version source sont conservés. Ces versions ne sont pas des sauvegardes de progression du test.</p>
    <div class="forge-work-row"><label>Nom de la version<input data-control-field="name" maxlength="100" placeholder="Avant réorganisation du hangar"></label>${button('capture','Créer une version')}</div>
    <div class="forge-work-row"><label>Version enregistrée<select data-control-field="version" aria-label="Version enregistrée"></select></label>${button('compare','Comparer au projet courant')}${button('diff-report','Exporter les différences')}${button('restore','Restaurer en copie')}${button('delete','Supprimer la version')}</div>
    <div data-control-diff role="status" class="forge-control-diff-v136">Choisissez une version à comparer.</div>
    <div class="forge-work-row">${button('export','Exporter les versions')}${button('original','Exporter les données originales')}
    <label class="forge-work-file">Importer des copies<input type="file" data-control-field="import" accept="application/json,.json"></label></div>
    <p class="forge-work-note" data-control-budget>32 versions / 8 Mio maximum, selon la place disponible dans le navigateur. Aucune suppression automatique.</p></section>
    <p data-control-message role="status" class="forge-work-status-v133"></p>`;
  workbench.append(root);
  const field=name=>root.querySelector(`[data-control-field="${name}"]`),out=name=>root.querySelector(`[data-control-${name}]`);
  const store=new ForgeVersionStoreV136(editor.workspaceV133?.store.storage);store.load();
  const removers=[];let dead=false,request=0,report=null,source=null,modeKey='',storeRevision=-1,diff=null;
  const listen=(target,type,fn,options)=>{target?.addEventListener(type,fn,options);removers.push(()=>target?.removeEventListener(type,fn,options));};
  const tell=(message,error=false)=>{out('message').textContent=message;out('message').dataset.error=String(error);};
  const guard=fn=>{try{return fn();}catch(error){tell(error.message,true);return false;}};
  function renderReport() {
    if(!report)return;
    const errors=report.issues.filter(i=>i.severity==='error').length,warnings=report.issues.filter(i=>i.severity==='warning').length;
    out('status').textContent=`${report.roomName} · ${report.mode==='mission'?'Mission':'Vaisseau'} · ${report.bounds.width} × ${report.bounds.height} unités · ${errors} erreur(s), ${warnings} avertissement(s).`;
    root.querySelector('[data-control-action="test"]').disabled=!report.ok;
    const filter=field('severity').value,issues=report.issues.filter(i=>filter==='all'||i.severity===filter);
    out('issues').innerHTML=issues.slice(0,100).map(i=>`<button type="button" class="forge-control-${i.severity}-v136" data-control-action="focus" data-cell="${escape(i.cellId||'')}" data-room="${escape(i.roomId)}"><strong>${i.severity==='error'?'ERREUR':'À VÉRIFIER'}</strong> ${escape(i.message)}</button>`).join('')||'<p>Aucune anomalie dans ce filtre. Les sauts ne sont pas simulés.</p>';
    if(issues.length>100){const note=doc.createElement('p');note.textContent=`${issues.length-100} diagnostics supplémentaires dans le rapport exporté.`;out('issues').append(note);}
    const canvas=out('preview'),ctx=canvas.getContext('2d'),s=Math.min((canvas.width-24)/report.bounds.width,(canvas.height-24)/report.bounds.height),x=(canvas.width-report.bounds.width*s)/2,y=(canvas.height-report.bounds.height*s)/2;
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#091410';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    for(const g of report.geometry){ctx.fillStyle={floor:'#709584',platform:'#a4c8ae',wall:'#425e50',door:'#ddb56e',hazard:'#d77463',spawn:'#e1f7ba',lift:'#a197c6'}[g.type];ctx.fillRect(g.x,g.y,g.w,g.h);if(g.type==='spawn'){ctx.lineWidth=2/s;ctx.strokeStyle='#fff7c2';ctx.strokeRect(g.x,g.y,g.w,g.h);}}
    ctx.strokeStyle='#84aa93';ctx.lineWidth=1/s;ctx.strokeRect(0,0,report.bounds.width,report.bounds.height);ctx.restore();
  }
  const api={
    store,
    refresh(){
      if(dead)return;
      const current=editor.model.data,key=`${editor.room.id}:${editor.model.revision}:${Boolean(editor.model.pending)}`;
      if(source!==current||modeKey!==key){source=current;modeKey=key;report=inspectForgePlaytestV136(current);diff=null;out('diff').textContent='Choisissez une version à comparer.';renderReport();}
      if(storeRevision!==store.revision){storeRevision=store.revision;const chosen=field('version').value;
        field('version').innerHTML='<option value="">Choisir une version</option>'+store.data.entries.map(e=>`<option value="${escape(e.id)}">${escape(e.name)} — ${escape(e.project.name)} (${e.project.rooms.length} salle(s))</option>`).join('');
        field('version').value=store.data.entries.some(e=>e.id===chosen)?chosen:'';
        out('budget').textContent=`${store.data.entries.length}/32 versions · maximum 8 Mio, sous réserve du quota du navigateur. Aucune version supprimée automatiquement.`;}
      root.querySelector('[data-control-action="diff-report"]').disabled=!diff;
      for(const action of ['compare','restore','delete'])root.querySelector(`[data-control-action="${action}"]`).disabled=!field('version').value;
    },
    getReport(){api.refresh();return structuredClone(report);},
    destroy(){dead=true;request++;removers.forEach(off=>off());root.remove();tab.remove();}
  };
  listen(root,'click',event=>{const target=event.target.closest('[data-control-action]');if(!target)return;
    guard(()=>{const action=target.dataset.controlAction;
      if(action==='audit'){source=null;api.refresh();tell('Contrôle recalculé. Aucune donnée du projet modifiée.');}
      if(action==='report')download(doc,'frontier-forge-controle-v136.json',JSON.stringify(api.getReport(),null,2));
      if(action==='test')panel.querySelector('#editor-play').click();
      if(action==='focus'&&target.dataset.cell){editor.setRoom(target.dataset.room);const c=editor.room.cells.find(c=>c.id===target.dataset.cell);if(c)editor.ui?.focusCell(c);}
      if(action==='capture'){
        editor.cancelGesture();const saved=store.capture(editor.model.data,field('name').value,editor.workspaceV133?.id||'');api.refresh();field('version').value=saved.id;
        tell(`Version « ${saved.name} » enregistrée. Le projet courant n’a pas été remplacé.`);
      }
      if(action==='compare'){
        diff=compareForgeDocumentsV136(store.get(field('version').value).project,editor.model.data);
        out('diff').textContent=diff.identical?'Le contenu est identique.':`Écart depuis cette version : ${diff.totals.cells.added} bloc(s) ajouté(s), ${diff.totals.cells.removed} supprimé(s), ${diff.totals.cells.changed} modifié(s) ; ${diff.totals.rooms.added} salle(s) ajoutée(s), ${diff.totals.rooms.removed} supprimée(s) ; ${diff.totals.links.added} liaison(s) ajoutée(s), ${diff.totals.links.removed} supprimée(s).`;
        if(!diff.identical&&diff.metadata.length)out('diff').textContent+=` Métadonnées différentes : ${diff.metadata.join(', ')}.`;
      }
      if(action==='diff-report'&&diff)download(doc,'frontier-forge-differences-v136.json',JSON.stringify(diff,null,2));
      if(action==='restore'){
        if(!editor.workspaceV133)throw new Error('Bibliothèque de projets indisponible dans cet hôte.');
        const saved=store.get(field('version').value);
        if(globalThis.confirm(`Ouvrir « ${saved.name} » dans un nouveau projet ? Le projet courant sera d’abord enregistré et conservé.`)){
          editor.workspaceV133.create(`${saved.project.name} · ${saved.name}`,saved.project.kind,saved.project);tell('Version ouverte comme nouveau projet. Original conservé.');
        }
      }
      if(action==='delete'&&globalThis.confirm('Supprimer uniquement cette version ? Les projets restent inchangés.')){store.remove(field('version').value);tell('Version supprimée ; aucun projet modifié.');}
      if(action==='export')download(doc,'frontier-forge-versions-v136.json',store.export());
      if(action==='original')download(doc,'frontier-forge-versions-original.json',store.raw??'');
      api.refresh();
    });
  });
  listen(root,'change',event=>{
    if(event.target===field('severity')){renderReport();return;}
    if(event.target===field('version')){diff=null;out('diff').textContent='Version sélectionnée. Lancez la comparaison.';api.refresh();return;}
    if(event.target!==field('import'))return;
    const input=event.target,file=input.files?.[0];if(!file)return;
    const ticket=++request,model=editor.model,revision=model.revision,versionRevision=store.revision;
    void(async()=>{try{
      if(file.size>8*1024*1024)throw new Error('Fichier trop grand (8 Mio maximum).');
      const raw=await file.text();if(dead||request!==ticket)return;
      if(editor.model!==model||revision!==model.revision||model.pending||versionRevision!==store.revision)throw new Error('Le projet ou les versions ont changé pendant la lecture. Import annulé.');
      const count=store.merge(raw);tell(`${count} version(s) importée(s) en copies. Aucun projet ouvert ou remplacé.`);api.refresh();
    }catch(error){tell(error.message,true);}finally{if(ticket===request)input.value='';}})();
  });
  // Existing app owns launch/return behavior. Only reject a lossy or obstructed projection here.
  listen(panel,'click',event=>{
    if(!event.target.closest?.('#editor-play'))return;
    editor.cancelGesture();const checked=guard(()=>api.getReport());
    if(!checked?.ok){event.preventDefault();event.stopImmediatePropagation();tab.click();tell('Test refusé. Corrigez les erreurs de la salle active dans ce contrôle.',true);}
  },true);
  queueMicrotask(()=>{if(!dead){api.refresh();if(store.error)tell(store.error,true);}});
  return api;
}
