import { FRANCHISE_COSTUMES_V119, canEquipCostumeV119 } from './franchise-costumes-v119.js';
import { getPlayerCostumeSkinV119 } from './player-costume-skins-v119.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
const searchable = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
const unique = values => [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'fr'));
const filterFields = Object.freeze({ work:'sourceWork', character:'sourceCharacter', faction:'sourceFaction', era:'era', type:'type' });
const filterLabels = Object.freeze({ work:'Œuvre', character:'Personnage', faction:'Faction', era:'Époque', type:'Type', availability:'Disponibilité' });
const typeLabels = Object.freeze({ 'crew-coveralls':'Combinaison utilitaire', 'environment-suit':'Protection environnementale',
  'crew-jacket':'Veste de bord', 'combat-armor':'Armure de combat', 'combat-uniform':'Treillis',
  'synthetic-uniform':'Uniforme de synthétique', 'prison-uniform':'Tenue de détention',
  'civilian-uniform':'Tenue civile', 'crew-uniform':'Tenue de bord', 'security-uniform':'Sécurité',
  'civilian-jacket':'Veste civile', 'flight-suit':'Combinaison de vol' });

/** Read-only model. Filters belong to the UI, never to the profile/save schema. */
export function buildCostumeArchivesModelV119({ save={}, COSTUMES=[], filters={}, operationLocked }={}) {
  const locked=operationLocked === undefined ? Boolean(save.strategy?.currentOperation) : Boolean(operationLocked);
  const catalog=FRANCHISE_COSTUMES_V119;
  const facets=Object.fromEntries(Object.entries(filterFields).map(([key,field])=>[key,unique(catalog.map(entry=>entry[field]))]));
  const query=searchable(filters.query);
  const entries=catalog.filter(entry=>Object.entries(filterFields).every(([key,field])=>!filters[key] || filters[key]==='all' || entry[field]===filters[key])
    && (!['ready','missing'].includes(filters.availability) || (filters.availability==='ready')===canEquipCostumeV119(entry.id,COSTUMES))
    && searchable([entry.name,entry.sourceWork,entry.sourceCharacter,entry.sourceFaction,entry.era,entry.type].join(' ')).includes(query));
  return { entries,facets,locked,selectedId:save.player?.costumeId || null,legacyCount:COSTUMES.filter(entry=>entry.collection!=='franchise').length,
    franchiseCount:catalog.length,readyCount:catalog.filter(entry=>canEquipCostumeV119(entry.id,COSTUMES)).length };
}

/** Only an exact dedicated player atlas returned by its API can illustrate a
 * card. No enemy art, modular mannequin or another outfit is substituted. */
export function renderCostumeArchiveCardV119(entry,{ selectedId=null,locked=false,COSTUMES=[],getSkin=getPlayerCostumeSkinV119 }={}) {
  const ready=canEquipCostumeV119(entry.id,COSTUMES),selected=selectedId===entry.id;
  const skin=ready ? getSkin(entry.id) : null,atlas=skin?.costumeId===entry.id ? skin.atlases?.find(asset=>asset.kind==='locomotion') : null;
  const frame=atlas?.frames?.[0],source=frame?.source;
  const validPreview=atlas && source && /^\/assets\//.test(atlas.path) && [atlas.sourceWidth,atlas.sourceHeight,source.x,source.y,source.width,source.height].every(Number.isFinite)
    && atlas.sourceWidth>0 && atlas.sourceHeight>0 && source.x>=0 && source.y>=0 && source.width>0 && source.height>0
    && source.x+source.width<=atlas.sourceWidth && source.y+source.height<=atlas.sourceHeight;
  const preview=validPreview ? `<svg class="costume-archive-preview-v119" viewBox="${source.x} ${source.y} ${source.width} ${source.height}" role="img" aria-label="${escapeHtml(entry.name)} · aperçu dédié adapté" preserveAspectRatio="xMidYMax meet"><image href="${escapeHtml(atlas.path)}" width="${atlas.sourceWidth}" height="${atlas.sourceHeight}" /></svg>`
    : `<div class="costume-archive-missing-v119"><strong>${ready?'APERÇU DÉDIÉ INDISPONIBLE':'VISUEL DÉDIÉ ABSENT'}</strong><span>${ready?'Aucune image de substitution affichée.':'Référence conservée · tenue non équipable.'}</span></div>`;
  const layers=entry.layers || {},url=typeof entry.source?.url==='string' && /^https:\/\//.test(entry.source.url) ? entry.source.url : null;
  const parts=[['Sous-couche',layers.underLayer],['Armure / enveloppe',layers.armorLayer],['Casque',layers.helmet],
    ['Accessoires',Array.isArray(layers.accessories)?layers.accessories.join(' · '):null]].filter(([,value])=>value);
  return `<article class="costume-archive-card-v119 ${selected?'selected':''}" data-archive-costume="${escapeHtml(entry.id)}">
    <header><span class="eyebrow">${escapeHtml(entry.sourceWork)}</span><h3>${escapeHtml(entry.name)}</h3><p>${escapeHtml(entry.sourceCharacter)} · ${escapeHtml(entry.sourceFaction)} · ${escapeHtml(entry.era)}</p></header>
    ${preview}<p class="costume-archive-status-v119">${ready?'ATLAS JOUEUR DÉDIÉ ADAPTÉ · ÉQUIPABLE':'VISUEL ABSENT · NON ÉQUIPABLE'}</p>
    <dl>${parts.map(([label,value])=>`<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
    <p>${escapeHtml(typeLabels[entry.type] || entry.type)} · Cosmétique uniquement, aucun bonus de combat déduit.</p>
    <p class="costume-archive-reference-v119">${entry.referenceStatus==='documented-primary-reference'?'Référence documentaire disponible':'Référence visuelle à documenter'}${url?` · <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">CONSULTER LA SOURCE</a>`:''}</p>
    <footer>${ready?`<button type="button" class="button compact" data-costume-id="${escapeHtml(entry.id)}" ${selected||locked?'disabled':''}${locked?' title="Opération active : manifeste verrouillé"':''}>${selected?'PORTÉE':locked?'OPÉRATION ACTIVE':'APPLIQUER LA TENUE'}</button>`:'<button type="button" class="button compact" disabled title="Aucun atlas joueur dédié disponible">NON ÉQUIPABLE · VISUEL ABSENT</button>'}</footer>
  </article>`;
}

export class CostumeArchivesUiV119 {
  constructor({root,save={},COSTUMES=[],operationLocked,getSkin=getPlayerCostumeSkinV119}) {
    if (!root?.querySelector) throw new Error('Costume archives require a dedicated root');
    Object.assign(this,{root,COSTUMES,getSkin,filters:{query:'',work:'all',character:'all',faction:'all',era:'all',type:'all',availability:'all'}});
    root.innerHTML=`<header class="section-intro compact-intro"><div><p class="eyebrow">DOSSIERS DOCUMENTAIRES // TENUES DISTINCTES</p><h2>Archives de tenues</h2></div></header><p class="costume-archives-note-v119">Les références de franchise sont séparées des combinaisons modulaires historiques. Seules les tenues possédant un atlas joueur dédié peuvent être appliquées. Aucun visuel générique ne remplace une référence absente.</p>
      <div class="costume-archives-filters-v119" role="group" aria-label="Filtres des archives de tenues"><label>Recherche<input type="search" maxlength="100" data-costume-filter="query" placeholder="Ripley, Nostromo, Seegson…"></label>${Object.entries(filterLabels).map(([key,label])=>`<label>${label}<select data-costume-filter="${key}" aria-label="${label}"></select></label>`).join('')}<button type="button" class="button" data-costume-reset>RÉINITIALISER LES FILTRES</button></div>
      <p data-costume-archive-count role="status" aria-live="polite"></p><div class="costume-archives-grid-v119" data-costume-archive-list></div>`;
    this.listeners=[];
    for (const key of Object.keys(this.filters)) {
      const node=root.querySelector(`[data-costume-filter="${key}"]`),type=key==='query'?'input':'change';
      const callback=()=>{this.filters[key]=node.value;this.render();}; node.addEventListener(type,callback);this.listeners.push(()=>node.removeEventListener(type,callback));
    }
    const reset=root.querySelector('[data-costume-reset]'),onReset=()=>{for(const key of Object.keys(this.filters))this.filters[key]=key==='query'?'':'all';this.render();};
    reset.addEventListener('click',onReset);this.listeners.push(()=>reset.removeEventListener('click',onReset));
    this.update(save,{operationLocked});
  }
  update(save,{operationLocked}={}) { this.save=save || {};this.operationLocked=operationLocked;this.render(); }
  render() {
    const model=buildCostumeArchivesModelV119({save:this.save,COSTUMES:this.COSTUMES,filters:this.filters,operationLocked:this.operationLocked});
    for (const key of Object.keys(filterLabels)) {
      const choices=key==='availability'?['ready','missing']:model.facets[key],node=this.root.querySelector(`[data-costume-filter="${key}"]`);
      node.innerHTML=`<option value="all">Toutes</option>${choices.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(key==='availability'?value==='ready'?'Équipables':'Visuel absent':key==='type'?typeLabels[value]||value:value)}</option>`).join('')}`;
      node.value=this.filters[key];
    }
    this.root.querySelector('[data-costume-filter="query"]').value=this.filters.query;
    this.root.querySelector('[data-costume-archive-count]').textContent=`${model.entries.length}/${model.franchiseCount} références de tenues · ${model.readyCount} avec atlas dédié équipable · ${model.legacyCount} combinaisons historiques séparées${model.locked?' · Opération active : changement verrouillé':''}`;
    this.root.querySelector('[data-costume-archive-list]').innerHTML=model.entries.map(entry=>renderCostumeArchiveCardV119(entry,{...model,COSTUMES:this.COSTUMES,getSkin:this.getSkin})).join('') || '<p class="costume-archives-note-v119">Aucune tenue ne correspond à ces filtres. La tenue portée reste inchangée.</p>';
  }
  destroy() { for(const remove of this.listeners)remove();this.listeners=[]; }
}
