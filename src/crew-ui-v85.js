import { APTITUDE_DEFINITIONS_V85, deriveRecruitIdentityV119, resolveCrewDefinitionV85 } from './crew-recruitment-v85.js';
import { getPremiumPersonnelV119 } from './premium-personnel-v119.js';
import { buildCrewConversationV120, renderCrewConversationV120 } from './crew-conversations-v120.js';
import { renderPersonnelDriveGalleryV123 } from './personnel-drive-ui-v123.js';
import { CAMPAIGNS, WEAPONS, EQUIPMENT } from './content.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = value => Array.isArray(value) ? value : [];
const amount = value => Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
const costLabel = cost => Object.entries(cost || {}).map(([key,value]) => `${amount(value)} ${key === 'credits' ? 'crédits' : key === 'supplies' ? 'ravitaillement' : key}`).join(' + ') || 'sans coût matériel';
const aptitudeValue = (member, id) => member.aptitudesV85?.[id] ?? member.recruitV85?.aptitudes?.[id] ?? member.aptitudes?.[id] ?? 50;
const profileOf = member => member.recruitV85 || (member.schema === 85 ? member : null);

export function buildCrewUiModelV85(save, catalog = []) {
  const selected = new Set(list(save.strategy?.selectedCrewIds));
  const members = list(save.crew).map(member => resolveCrewDefinitionV85(member, catalog)).filter(Boolean)
    .map(member => ({ ...member, selected: selected.has(member.id), candidate: false }));
  const candidates = list(save.recruitmentV85?.candidates).map(profile => ({ ...profile, recruitV85: profile, identityV119: deriveRecruitIdentityV119(profile), aptitudesV85: profile.aptitudes, gearV85: profile.gear, candidate: true, status: 'candidat' }));
  for (const member of [...members, ...candidates]) member.conversationV120 = buildCrewConversationV120(member, { roster: members, campaignCatalog: CAMPAIGNS, equipmentCatalog: [...WEAPONS, ...EQUIPMENT] });
  const archives = getPremiumPersonnelV119(save);
  return { members, candidates, archives, active: members.filter(m => m.selected), reserve: members.filter(m => !m.selected),
    locked: Boolean(save.strategy?.currentOperation || (save.onboardingV84 && save.onboardingV84.phase !== 'complete')),
    hours: (Number(save.clock?.day || 1) - 1) * 24 + Number(save.clock?.hour || 0),
    lastOfferHour: Number(save.recruitmentV85?.lastOfferHour || 0), credits: Number(save.galaxy?.resources?.credits || 0) };
}

export class CrewUiV85 {
  trapFocus(event) {
    if (event.key !== 'Tab' || !this.dialog.open) return;
    const controls = [...this.dialog.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])')]
      .filter(node => !node.hidden && node.tabIndex >= 0 && node.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1), active = this.document.activeElement;
    if (!first) { event.preventDefault(); this.dialog.focus(); return; }
    if (!this.dialog.contains(active) || (event.shiftKey ? active === first : active === last)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  }
  constructor({ root, catalog = [], itemCatalog = [], rules = {}, getOwner, onAction }) {
    Object.assign(this, { root, catalog, itemCatalog, rules, getOwner, onAction });
    this.tab = 'active'; this.selectedId = null; this.compareId = ''; this.conversationTopicV120 = null; this.owner = null;
    this.document = root.ownerDocument;
    this.dialog = this.document.createElement('dialog');
    this.dialog.id = 'crew-dossier-v85'; this.dialog.className = 'crew-dossier-v85';
    this.dialog.setAttribute('aria-labelledby', 'crew-dossier-title-v85');
    this.document.body.append(this.dialog);
    root.addEventListener('click', event => this.click(event));
    this.dialog.addEventListener('click', event => this.click(event));
    this.dialog.addEventListener('keydown', event => this.trapFocus(event));
    this.dialog.addEventListener('change', event => {
      if (event.target.matches('[data-v85-compare]')) { this.compareId = event.target.value; this.renderDetail(); this.dialog.querySelector('[data-v85-compare]')?.focus(); }
    });
    this.dialog.addEventListener('close', () => { this.selectedId = null; if (this.previousFocus?.isConnected) this.previousFocus.focus(); else this.root.querySelector(`[data-v85-tab="${this.tab}"]`)?.focus(); });
  }
  close() { if (this.dialog.open) this.dialog.close(); this.selectedId = null; }
  getMember(id) { return [...(this.model?.members || []), ...(this.model?.candidates || []), ...(this.model?.archives || [])].find(m => m.id === id); }
  itemName(item) { return this.itemCatalog.find(entry => entry.id === item.catalogId)?.name || item.catalogId; }
  render(save) {
    this.model = buildCrewUiModelV85(save, this.catalog); this.owner = this.getOwner();
    const groups = [['active','Équipe active'],['reserve','Réserve'],['candidates','Candidats'],['archives','Archives MIRE']];
    const current = this.model[this.tab] || [];
    const wait = Math.max(0, this.model.lastOfferHour + (this.rules.refreshHours || 24) - this.model.hours);
    this.root.innerHTML = `<div class="crew-tabs-v85" role="group" aria-label="Effectifs Echo-9">${groups.map(([id,label]) => `<button type="button" class="button ${this.tab === id ? 'primary' : ''}" data-v85-tab="${id}" aria-pressed="${this.tab === id}">${label} · ${this.model[id].length}</button>`).join('')}</div>
      <p class="crew-note-v85">${this.tab === 'archives' ? 'Identités historiques distinctes du personnel embarqué. Les reconstitutions réussies ouvrent les dossiers ; aucun personnage d’archive ne rejoint physiquement le Tantalus.' : this.tab === 'candidates' ? `Dossiers conservés entre les sessions. Affectation : ${esc(costLabel(this.rules.recruitCost))}. Les portraits individuels ne sont pas encore produits.` : 'État, dotation et historique restent conservés entre équipe active et réserve.'}</p>
      ${this.tab === 'candidates' ? `<div class="crew-offer-v85"><button type="button" class="button" data-v85-action="refresh" ${this.model.locked || wait > 0 ? 'disabled' : ''}>RELÈVE DES CANDIDATS</button><span>${wait > 0 ? `Nouvelle relève dans ${Math.ceil(wait)} h de jeu` : 'Prochaine relève disponible'} · ${esc(costLabel(this.rules.refreshCost))}</span></div>` : ''}
      <div class="crew-grid">${current.map(member => this.card(member)).join('') || '<p>Aucun dossier dans cette section.</p>'}</div>
      <p class="crew-action-status-v85" role="status" aria-live="polite"></p>`;
    if (this.dialog.open) { if (this.getMember(this.selectedId)) this.renderDetail(); else this.close(); }
  }
  card(member) {
    if (member.archive) return this.archiveCardV119(member);
    const profile = profileOf(member);
    const ranked = [...APTITUDE_DEFINITIONS_V85].sort((a,b) => aptitudeValue(member,b.id) - aptitudeValue(member,a.id));
    const vitals = member.candidate ? '' : `<div class="crew-vitals-v85">${[['health','Santé'],['stress','Stress'],['fatigue','Fatigue']].map(([key,label]) => `<label>${label} <b>${amount(member[key])}%</b><meter min="0" max="100" value="${amount(member[key])}" aria-label="${label}"></meter></label>`).join('')}</div>`;
    const identity = member.identityV119;
    const identitySummary = identity ? `<div class="crew-identity-v119"><strong>${esc(identity.profession)}</strong><span>${esc(identity.tacticalRole)} · ${esc(identity.traits[0].label)}</span><p>${esc(identity.shortStory.title)} — ${esc(identity.shortStory.text)}</p></div>` : '';
    return `<article class="crew-card ${member.selected ? 'selected' : ''}" data-v85-member="${esc(member.id)}"><span class="eyebrow">${esc(member.candidate ? 'DOSSIER DE TRANSFERT' : member.role || 'MARINE')} · ${esc(member.status)}</span><h3>${esc(member.name)}${member.callsign ? ` <small>« ${esc(member.callsign)} »</small>` : ''}</h3>${identitySummary}<p>${esc(profile?.background?.summary || 'Personnel permanent du Tantalus. Aucun passé supplémentaire inventé.')}</p>${profile ? `<p class="crew-tradeoffs-v85">Points forts : ${ranked.slice(0,2).map(a => `${esc(a.label)} ${amount(aptitudeValue(member,a.id))}`).join(' · ')}<br>À développer : ${esc(ranked.at(-1).label)} ${amount(aptitudeValue(member,ranked.at(-1).id))}</p><p class="crew-gear-summary-v85">Dotation : ${list(member.gearV85).map(item => esc(this.itemName(item))).join(' · ')}</p>` : ''}${vitals}<div class="button-row"><button type="button" class="button compact" data-v85-open="${esc(member.id)}">DOSSIER</button>${member.candidate ? `<button type="button" class="button compact primary" data-v85-action="recruit" data-v85-id="${esc(member.id)}" ${this.model.locked || this.model.credits < Number(this.rules.recruitCost?.credits || 0) ? 'disabled' : ''}>RECRUTER</button>` : `<button type="button" class="button compact" data-v85-action="assign" data-v85-id="${esc(member.id)}" ${this.model.locked || (member.status !== 'active' && !member.selected) ? 'disabled' : ''}>${member.selected ? 'VERS RÉSERVE' : 'AFFECTER'}</button><button type="button" class="button compact" data-v85-action="treat" data-v85-id="${esc(member.id)}" ${this.model.locked || member.status === 'deceased' ? 'disabled' : ''}>SOIGNER</button>`}</div></article>`;
  }
  archiveCardV119(member) {
    const gallery = renderPersonnelDriveGalleryV123(member, { compact: true });
    return `<article class="crew-card crew-archive-v119 ${member.selected ? 'selected' : ''}" data-v119-archive="${esc(member.id)}"><span class="eyebrow">${member.documentaryV123 ? 'DOCUMENTATION' : 'MIRE'} · ${esc(member.status)}</span><h3>${esc(member.name)}</h3>${gallery}<p>${esc(member.role)} · ${esc(member.specialty)}</p><p class="crew-archive-era-v119">${esc(member.era)}</p><p>${esc(member.conditionLabel)}</p><small>${gallery ? 'Représentation d’archive disponible' : 'Portrait dédié à produire'} · dossier historique, non opérateur jouable</small><div class="button-row"><button type="button" class="button compact" data-v85-open="${esc(member.id)}">${member.unlocked ? 'CONSULTER LE DOSSIER' : 'CONDITION D’ACCÈS'}</button></div></article>`;
  }
  open(id) {
    if (!this.getMember(id)) return;
    this.selectedId = id; this.compareId = ''; this.conversationTopicV120 = null; this.detailOwner = this.owner;
    this.previousFocus = this.document.activeElement;
    this.renderDetail(); if (!this.dialog.open) this.dialog.showModal();
    this.dialog.querySelector('[data-v85-close]')?.focus();
  }
  renderDetail() {
    const member = this.getMember(this.selectedId); if (!member) return;
    if (member.archive) { this.renderArchiveDetailV119(member); return; }
    const profile = profileOf(member), compare = this.getMember(this.compareId);
    const disabled = this.model.locked || member.candidate || member.status === 'deceased';
    const biographyLabels = {origin:'Origine',activity:'Activité antérieure',formation:'Formation',assignment:'Affectation',event:'Événement',motivation:'Motivation',habit:'Habitude',attachment:'Attache',personalObject:'Objet personnel'};
    const identity = member.identityV119;
    const identityBiography = identity ? `<div><dt>Métier</dt><dd>${esc(identity.profession)}</dd></div><div><dt>Rôle de terrain</dt><dd>${esc(identity.tacticalRole)} — selon la dotation actuelle, sans restriction de formation.</dd></div><div><dt>Trait</dt><dd>${esc(identity.traits[0].label)} : ${esc(identity.traits[0].description)} Aucun bonus statistique.</dd></div><div><dt>Histoire courte</dt><dd>${esc(identity.shortStory.title)} — ${esc(identity.shortStory.text)}</dd></div><div><dt>Appel radio</dt><dd>${esc(identity.radio.acknowledge)} Réaction textuelle du projet ; aucune voix enregistrée.</dd></div>` : '';
    const biography = profile ? Object.entries(biographyLabels).map(([key,label]) => `<div><dt>${label}</dt><dd>${esc(profile.background?.[key] || 'Non renseigné')}</dd></div>`).join('') + identityBiography : '<p>Biographie historique conservée. Aucun événement antérieur ajouté rétroactivement.</p>';
    const gearTargets = this.model.members.filter(other => other.id !== member.id && other.status !== 'deceased');
    const oldScroll = this.dialog.querySelector('.crew-dossier-body-v85')?.scrollTop || 0;
    const previousFocus = this.dialog.contains(this.document.activeElement) ? this.document.activeElement?.dataset : null;
    this.dialog.innerHTML = `<header><div><span class="eyebrow">ECHO-9 · DOSSIER INDIVIDUEL</span><h2 id="crew-dossier-title-v85">${esc(member.name)} ${member.callsign ? `« ${esc(member.callsign)} »` : ''}</h2><small>${esc(member.id)}</small></div><button type="button" class="button" data-v85-close>FERMER</button></header><div class="crew-dossier-body-v85"><p class="crew-note-v85">${profile ? 'Uniforme standard partagé. Portrait et apparence individuels non produits.' : 'Membre permanent. Les aptitudes sans dossier V85 utilisent un socle de simulation neutre, pas un passé inventé.'}</p><dl class="crew-biography-v85">${biography}</dl>${profile?.quote ? `<blockquote>${esc(profile.quote)}</blockquote>` : ''}
      ${renderCrewConversationV120(member.conversationV120, this.conversationTopicV120)}<section aria-labelledby="crew-stats-title-v85"><h3 id="crew-stats-title-v85">Aptitudes expliquées</h3><label class="crew-compare-v85">Comparer avec <select data-v85-compare><option value="">Aucune comparaison</option>${this.model.members.filter(other=>other.id!==member.id).map(other=>`<option value="${esc(other.id)}" ${other.id===this.compareId?'selected':''}>${esc(other.name)}</option>`).join('')}</select></label><p>Formation : +${amount(this.rules.trainingGain || 2)} · ${amount(this.rules.trainingHours || 4)} h de jeu · ${esc(costLabel(this.rules.trainingCost))}. Aucune spécialisation n'est interdite par le passé.</p><div class="crew-aptitudes-v85">${APTITUDE_DEFINITIONS_V85.map(a => {
        const value=aptitudeValue(member,a.id), delta=compare?value-aptitudeValue(compare,a.id):null, breakdown=profile?.breakdown?.[a.id];
        return `<article><div><strong>${esc(a.label)}</strong><b>${amount(value)}${delta!==null?` <small class="crew-delta-v85">(${delta>=0?'+':''}${amount(delta)})</small>`:''}</b></div><meter min="0" max="100" value="${amount(value)}" aria-label="${esc(a.label)}"></meter><p>${breakdown ? `Socle ${amount(breakdown.base)} · expériences ${amount(breakdown.experience)} · formation initiale ${amount(breakdown.formation)}. ${list(breakdown.explanations).map(esc).join(' ')}` : 'Socle neutre de simulation : 50.'}${value !== (profile?.aptitudes?.[a.id] ?? 50) ? ` Progression acquise : +${amount(value - (profile?.aptitudes?.[a.id] ?? 50))}.` : ''}</p><button type="button" class="button compact" data-v85-action="train" data-v85-id="${esc(member.id)}" data-v85-aptitude="${esc(a.id)}" ${disabled || value >= 100 ? 'disabled' : ''}>FORMER</button></article>`;
      }).join('')}</div></section>
      <section><h3>Dotation en possession</h3><p>Les transferts déplacent le même objet, sans créer de copie. Objets personnels exclus du budget de combat.</p>${list(member.gearV85).map((item,index)=>`<article class="crew-gear-row-v85"><div><strong>${esc(this.itemName(item))}</strong><p>${esc(item.reason || '')}</p><small>${esc(item.instanceId)} · ${Number(item.mass)||0} kg</small></div>${!member.candidate?`<label>Destinataire<select id="crew-transfer-${index}-v85" ${disabled?'disabled':''}>${gearTargets.map(other=>`<option value="${esc(other.id)}">${esc(other.name)}</option>`).join('')}</select></label><button type="button" class="button compact" data-v85-action="transfer" data-v85-id="${esc(member.id)}" data-v85-item="${esc(item.instanceId)}" data-v85-target="crew-transfer-${index}-v85" ${disabled || !gearTargets.length?'disabled':''}>TRANSFÉRER</button>`:''}</article>`).join('') || '<p>Aucune dotation individualisée enregistrée ; le manifeste historique reste inchangé.</p>'}</section>
      <section><h3>Depuis le Tantalus</h3><ul>${list(member.serviceHistoryV85).map(entry=>`<li>${esc(({success:'Mission réussie',failure:'Mission échouée',retreat:'Retour après retraite'}[entry.outcome] || entry.type))}${entry.operationId?` · ${esc(entry.operationId)}`:''}</li>`).join('') || '<li>Aucun événement de service enregistré dans ce système.</li>'}</ul><h3>Relations vécues</h3><ul>${list(member.relationsV85).map(entry=>`<li>${esc(this.getMember(entry.crewId)?.name || entry.crewId)} · ${amount(entry.sharedMissions ?? entry.missions)} mission(s) commune(s)</li>`).join('') || '<li>Aucune relation de campagne encore enregistrée.</li>'}</ul></section></div><footer><p class="crew-action-status-v85" role="status" aria-live="polite"></p>${member.candidate?`<button type="button" class="button primary" data-v85-action="recruit" data-v85-id="${esc(member.id)}" ${this.model.locked?'disabled':''}>RECRUTER · ${esc(costLabel(this.rules.recruitCost))}</button>`:''}</footer>`;
    this.dialog.querySelector('.crew-dossier-body-v85').scrollTop=oldScroll;
    if (this.dialog.open && !this.dialog.contains(this.document.activeElement)) {
      const matching = previousFocus?.v120ConversationTopic
        ? [...this.dialog.querySelectorAll('[data-v120-conversation-topic]')].find(node => node.dataset.v120ConversationTopic === previousFocus.v120ConversationTopic)
        : previousFocus?.v85Action && [...this.dialog.querySelectorAll('[data-v85-action]')].find(node => !node.disabled && node.dataset.v85Action === previousFocus.v85Action && node.dataset.v85Id === previousFocus.v85Id && node.dataset.v85Aptitude === previousFocus.v85Aptitude && node.dataset.v85Item === previousFocus.v85Item);
      (matching || this.dialog.querySelector('[data-v85-close]'))?.focus({ preventScroll: true });
    }
  }
  renderArchiveDetailV119(member) {
    const stats = member.aptitudes ? `<section><h3>Profil d’étude MIRE</h3><p>Valeurs de simulation proposées par le projet, pas des statistiques canoniques ni des bonus accordés au personnel.</p><div class="crew-archive-stats-v119">${APTITUDE_DEFINITIONS_V85.map(stat => `<span>${esc(stat.label)} <b>${amount(member.aptitudes[stat.id])}</b></span>`).join('')}</div></section>` : '';
    const recovery = member.documentaryV123 ? '<p>Import documentaire fourni ; aucun succès MIRE, récompense ou présence de personnage déduit.</p>' : `<section><h3>Trace de récupération</h3><ul>${member.evidence.map(item => `<li>${esc(item.source)} · ${esc(item.campaignId)} · reconstitution MIRE réussie</li>`).join('')}</ul></section>`;
    const radio = member.radioReaction ? `<blockquote>${esc(member.radioReaction)}</blockquote><p>Réaction textuelle adaptée par le projet, pas une citation du film ou du jeu.</p>` : '';
    const reference = member.reference?.url ? `<a href="${esc(member.reference.url)}" target="_blank" rel="noopener noreferrer">${esc(member.reference.title)}</a>` : '';
    const body = member.unlocked ? `<p>${esc(member.summary)}</p><dl class="crew-biography-v85"><div><dt>Rôle</dt><dd>${esc(member.role)}</dd></div><div><dt>Spécialité</dt><dd>${esc(member.specialty)}</dd></div><div><dt>Période</dt><dd>${esc(member.era)}</dd></div><div><dt>Sources rencontrées</dt><dd>${member.sourceWorks.map(esc).join(' · ')}</dd></div></dl>${stats}${member.equipment.length ? `<section><h3>Équipement documenté</h3><ul>${member.equipment.map(item => `<li>${esc(item.label)} — aucune dotation transférée à l’inventaire</li>`).join('')}</ul></section>` : ''}${recovery}${radio}${reference}` : `<p>${esc(member.conditionLabel)}</p><p>Le registre d’identités est visible, mais ce dossier détaillé n’a pas été récupéré dans cette sauvegarde.</p>`;
    const art = renderPersonnelDriveGalleryV123(member) || '<div class="crew-archive-art-v119">PORTRAIT DÉDIÉ À PRODUIRE<span>Le sprite d’un autre membre n’est pas réutilisé. Aucun déploiement jouable disponible.</span></div>';
    this.dialog.innerHTML = `<header><div><span class="eyebrow">${member.documentaryV123 ? 'DOCUMENTATION' : 'MIRE'} · PERSONNEL D’ARCHIVE</span><h2 id="crew-dossier-title-v85">${esc(member.name)}</h2><small>${esc(member.status)}</small></div><button type="button" class="button" data-v85-close>FERMER</button></header><div class="crew-dossier-body-v85"><p class="crew-note-v85">${esc(member.chronology)}</p>${art}${body}</div><footer><p class="crew-action-status-v85" role="status" aria-live="polite"></p>${member.unlocked && member.canSelect !== false ? `<button type="button" class="button" data-v85-action="archive-select" data-v85-id="${esc(member.id)}" ${this.model.locked || member.selected ? 'disabled' : ''}>${member.selected ? 'DOSSIER SÉLECTIONNÉ' : 'CONSERVER CE DOSSIER SÉLECTIONNÉ'}</button>` : ''}</footer>`;
    if (this.dialog.open && !this.dialog.contains(this.document.activeElement)) this.dialog.querySelector('[data-v85-close]')?.focus({ preventScroll: true });
  }
  click(event) {
    const button=event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.v120ConversationTopic) {
      const member = this.getMember(this.selectedId);
      if (!this.dialog.contains(button) || member?.archive || !member?.conversationV120?.topics.some(topic => topic.id === button.dataset.v120ConversationTopic)) return;
      this.conversationTopicV120 = button.dataset.v120ConversationTopic;
      this.renderDetail();
      this.dialog.querySelector(`[data-v120-conversation-topic="${this.conversationTopicV120}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (button.dataset.v85Close!==undefined) { this.close(); return; }
    if (button.dataset.v85Tab) { this.tab=button.dataset.v85Tab; this.render(this.save); this.root.querySelector(`[data-v85-tab="${this.tab}"]`)?.focus(); return; }
    if (button.dataset.v85Open) { this.open(button.dataset.v85Open); return; }
    const action=button.dataset.v85Action; if (!action) return;
    const id=button.dataset.v85Id;
    // Historical MIRE dossiers are documentary records, never roster actors.
    const targetMember = this.getMember(id);
    if (targetMember?.archive && (action !== 'archive-select' || targetMember.canSelect === false)) return;
    const args=action==='refresh'?[]:action==='train'?[id,button.dataset.v85Aptitude]:action==='transfer'?[id,this.dialog.querySelector(`#${button.dataset.v85Target}`)?.value,button.dataset.v85Item]:[id];
    const inDialog=this.dialog.contains(button), owner=inDialog?this.detailOwner:this.owner;
    try { this.onAction(action,args,owner); const status=(inDialog?this.dialog:this.root).querySelector('.crew-action-status-v85'); if(status)status.textContent='Action enregistrée.'; if(!inDialog&&!this.root.contains(this.document.activeElement))this.root.querySelector(`[data-v85-tab="${this.tab}"]`)?.focus(); }
    catch(error) { const status=(inDialog?this.dialog:this.root).querySelector('.crew-action-status-v85'); if(status)status.textContent=error.message; }
  }
  update(save) { this.save=save; this.render(save); }
}
