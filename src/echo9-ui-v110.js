import { CrewUiV85, buildCrewUiModelV85 } from './crew-ui-v85.js';
import { APTITUDE_DEFINITIONS_V85 } from './crew-recruitment-v85.js';
import { CREW_SPRITE_IDS, resolveSpriteSheet } from './sprite-animation-runtime.js';
import { ECHO9_MARKINGS_V110, getEcho9MarkingV110, selectEcho9PersonnelV110, echo9SignalV110 } from './echo9-personnel-v110.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const list = value => Array.isArray(value) ? value : [];
const amount = value => Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
const cost = value => Object.entries(value || {}).map(([key, count]) => `${amount(count)} ${key === 'credits' ? 'CR' : key === 'supplies' ? 'ravitaillement' : key}`).join(' + ');
const aptitude = (member, id) => member.aptitudesV85?.[id] ?? member.recruitV85?.aptitudes?.[id] ?? 50;
const statusName = status => ({ active: 'Disponible', wounded: 'Blessé', recovering: 'Récupération', deceased: 'Mémorial', missing: 'Porté disparu', candidat: 'Candidature' }[status] || 'Indisponible');

export function getEcho9ServiceImageV110(member) {
  const sheetId = CREW_SPRITE_IDS[member?.id] || (member?.recruitV85 || member?.candidate ? 'player.echo9-marine.locomotion' : null);
  const sheet = sheetId && resolveSpriteSheet(sheetId);
  return sheet?.identityVerified && sheet.releaseReady ? { path: sheet.path, columns: sheet.columns, rows: sheet.rows,
    shared: !CREW_SPRITE_IDS[member?.id], caption: CREW_SPRITE_IDS[member?.id] ? 'Vue de service' : 'Uniforme standard' } : null;
}

function imageMarkup(member, large = false) {
  const image = getEcho9ServiceImageV110(member);
  const marking = getEcho9MarkingV110(member);
  return `<figure class="echo9-image-v110${large ? ' large' : ''}" style="--echo9-mark:${marking.color}"><div class="echo9-cell-v110">${image
    ? `<img src="${esc(image.path)}" alt="${esc(image.shared ? 'Uniforme de service partagé' : member.name)}" loading="lazy" style="width:${image.columns * 100}%;height:${image.rows * 100}%">`
    : '<span class="echo9-no-image-v110">DOSSIER<br>PERSONNEL</span>'}</div><figcaption>${image?.caption || 'Image indisponible'}</figcaption>${marking.id !== 'standard' ? `<span class="echo9-id-strip-v110" aria-label="Marquage ${esc(marking.label)}"></span>` : ''}</figure>`;
}

export function renderEcho9SignalV110(member, key) {
  const signal = echo9SignalV110(member, key);
  const a = signal.active ? signal.amplitude : 0;
  // The waveform visualises the saved game indicator. It is not a fabricated ECG/history.
  const path = `M0 20 H18 L24 ${20 - a / 3} L28 ${20 + a / 2} L33 ${20 - a} L37 ${20 + a / 2} L42 20 H68 L74 ${20 - a / 3} L78 ${20 + a / 2} L83 ${20 - a} L87 ${20 + a / 2} L92 20 H120`;
  return `<div class="echo9-signal-v110 ${signal.tone}${signal.active ? '' : ' inactive'}"><span>${esc(signal.label)} <b>${signal.value}%</b></span><svg viewBox="0 0 120 40" aria-hidden="true" focusable="false"><path d="${path}"></path></svg><meter min="0" max="100" value="${signal.value}" aria-label="${esc(signal.label)} ${signal.value} pour cent"></meter></div>`;
}

/** Keep V85's atomic actions, stable dossiers and focus trap; replace only their presentation. */
export class Echo9UiV110 extends CrewUiV85 {
  constructor(options) {
    super(options);
    this.tab = 'overview'; this.filters = { query: '', species: 'all', sort: 'name' }; this.detailMode = 'dossier';
    this.root.classList.add('echo9-roster-v110');
    this.dialog.classList.add('echo9-dossier-v110');
    this.root.addEventListener('input', event => {
      if (!event.target.matches('[data-echo9-search]')) return;
      this.filters.query = event.target.value; this.renderLists();
    });
    this.root.addEventListener('change', event => {
      const key = event.target.dataset.echo9Filter;
      if (key === 'species' || key === 'sort') { this.filters[key] = event.target.value; this.renderLists(); }
    });
    this.dialog.addEventListener('close', () => { this.detailMode = 'dossier'; });
    this.mountPlayerWardrobe();
  }

  mountPlayerWardrobe() {
    const search = this.document.getElementById('costume-search');
    const layout = this.document.getElementById('costume-list')?.closest('.customization-layout');
    const intro = search?.closest('.section-intro');
    if (!intro || !layout) return;
    const wardrobe = this.document.createElement('dialog');
    wardrobe.id = 'echo9-player-wardrobe-v110'; wardrobe.className = 'crew-dossier-v85 echo9-player-wardrobe-v110';
    wardrobe.setAttribute('aria-labelledby', 'echo9-wardrobe-title-v110');
    wardrobe.innerHTML = '<header><div><span class="eyebrow">CASIER PERSONNEL</span><h2 id="echo9-wardrobe-title-v110">Tenue de votre opérateur</h2></div><button type="button" class="button" data-echo9-wardrobe-close>FERMER</button></header><div class="crew-dossier-body-v85"></div>';
    const body = wardrobe.querySelector('.crew-dossier-body-v85');
    const eyebrow = intro.querySelector('.eyebrow'); if (eyebrow) eyebrow.textContent = 'VESTIAIRE · FILTRES DE DOTATION';
    body.append(intro, layout); this.document.body.append(wardrobe); this.playerWardrobe = wardrobe;
    wardrobe.addEventListener('click', event => { if (event.target.closest('[data-echo9-wardrobe-close]')) wardrobe.close(); });
    wardrobe.addEventListener('keydown', event => CrewUiV85.prototype.trapFocus.call({ dialog: wardrobe, document: this.document }, event));
    wardrobe.addEventListener('close', () => this.root.querySelector('[data-echo9-player-wardrobe]')?.focus());
  }

  close() { super.close(); if (this.playerWardrobe?.open) this.playerWardrobe.close(); this.detailMode = 'dossier'; }
  open(id) { this.detailMode = 'dossier'; super.open(id); }

  render(save) {
    this.model = buildCrewUiModelV85(save, this.catalog); this.owner = this.getOwner();
    this.root.dataset.reducedMotion = save.settings?.reducedMotion ? 'true' : 'false';
    const ready = this.model.members.filter(member => member.status === 'active').length;
    const injured = this.model.members.filter(member => member.status !== 'deceased' && (member.health < 70 || member.stress >= 65 || member.fatigue >= 65)).length;
    this.root.innerHTML = `<section class="echo9-command-strip-v110" aria-label="État du détachement"><div><span class="eyebrow">USS TANTALUS · PERSONNEL</span><strong>PRÊTS POUR LA RELÈVE</strong><p>${this.model.active.length} affectés · ${ready} disponibles${injured ? ` · ${injured} à surveiller` : ''}</p></div><div class="button-row">${this.playerWardrobe ? '<button type="button" class="button" data-echo9-player-wardrobe>MON VESTIAIRE</button>' : ''}<button type="button" class="button" data-v85-tab="candidates">RECRUTEMENT · ${this.model.candidates.length}</button></div></section>
      ${this.model.locked ? '<p class="echo9-lock-v110" role="status">MANIFESTE VERROUILLÉ · Consultation disponible. Modifications après votre retour ou la fin de l’accueil.</p>' : ''}
      <div class="echo9-controls-v110"><div class="crew-tabs-v85" role="group" aria-label="Effectifs Echo-9">${[['overview', 'Équipe & réserve'], ['active', 'Équipe active'], ['reserve', 'Réserve'], ['candidates', 'Candidats'], ['archives', 'Archives']].map(([id, label]) => `<button type="button" class="button ${this.tab === id ? 'primary' : ''}" data-v85-tab="${id}" aria-pressed="${this.tab === id}">${label}${id !== 'overview' ? ` · ${this.model[id].length}` : ''}</button>`).join('')}</div>
      <div class="echo9-filters-v110"><label>RECHERCHER<input type="search" data-echo9-search value="${esc(this.filters.query)}" placeholder="Nom, indicatif, spécialité…" maxlength="100"></label><label>PERSONNEL<select data-echo9-filter="species">${[['all', 'Tous'], ['human', 'Humains'], ['synthetic', 'Synthétiques']].map(([id, name]) => `<option value="${id}" ${this.filters.species === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label><label>TRIER<select data-echo9-filter="sort">${[['name', 'Nom'], ['health', 'Santé la plus basse'], ['stress', 'Stress le plus haut'], ['fatigue', 'Fatigue la plus haute']].map(([id, name]) => `<option value="${id}" ${this.filters.sort === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label></div></div>
      <div data-echo9-lists></div><p class="echo9-signal-note-v110">Signaux d’état : indicateurs de campagne, actualisés après vos actions.</p><p class="crew-action-status-v85" role="status" aria-live="polite"></p>`;
    this.renderLists();
    if (this.dialog.open) { if (this.getMember(this.selectedId)) this.renderDetail(); else this.close(); }
  }

  renderLists() {
    const host = this.root.querySelector('[data-echo9-lists]'); if (!host) return;
    const groups = this.tab === 'overview' ? [['active', 'ÉQUIPE EN DÉPLOIEMENT'], ['reserve', 'PERSONNEL EN RÉSERVE']] : [[this.tab, { active: 'ÉQUIPE EN DÉPLOIEMENT', reserve: 'PERSONNEL EN RÉSERVE', candidates: 'DOSSIERS DE TRANSFERT', archives: 'PERSONNEL D’ARCHIVE · MIRE & DOCUMENTATION' }[this.tab]]];
    const wait = Math.max(0, this.model.lastOfferHour + (this.rules.refreshHours || 24) - this.model.hours);
    host.innerHTML = `${this.tab === 'archives' ? '<p class="crew-note-v85">Identités historiques, pas personnel embarqué en 2204. Une reconstitution MIRE réussie ouvre le dossier correspondant. Les collections documentaires sont distinctes de ces reconstitutions ; leurs visuels fournis ne sont ni des recrutements, ni des animations jouables certifiées.</p>' : this.tab === 'candidates' ? `<div class="crew-offer-v85"><p>Transfert : ${esc(cost(this.rules.recruitCost))} · La dotation indiquée est comprise.</p><button type="button" class="button" data-v85-action="refresh" ${this.model.locked || wait > 0 ? 'disabled' : ''}>RELÈVE DES CANDIDATS</button><span>${wait > 0 ? `Nouvelle relève dans ${Math.ceil(wait)} h de jeu` : 'Relève disponible'} · ${esc(cost(this.rules.refreshCost))}</span></div>` : ''}
      <div class="echo9-roster-sections-v110">${groups.map(([id, title]) => {
        const members = selectEcho9PersonnelV110(this.model[id] || [], this.filters);
        return `<section class="echo9-personnel-group-v110" aria-labelledby="echo9-${id}-v110"><header><h3 id="echo9-${id}-v110">${title}</h3><span>${members.length} / ${this.model[id]?.length || 0}</span></header><div class="crew-grid">${members.map(member => this.card(member)).join('') || '<p class="echo9-empty-v110">Aucun dossier ne correspond à cette sélection.</p>'}</div></section>`;
      }).join('')}</div>`;
  }

  card(member) {
    if (member.archive) return super.card(member);
    const profile = member.recruitV85;
    const identity = member.identityV119;
    const ranked = [...APTITUDE_DEFINITIONS_V85].sort((a, b) => aptitude(member, b.id) - aptitude(member, a.id));
    const disabled = this.model.locked;
    return `<article class="crew-card echo9-card-v110 ${member.selected ? 'selected' : ''}" data-v85-member="${esc(member.id)}"><div class="echo9-card-heading-v110">${imageMarkup(member)}<div><span class="eyebrow">${esc(member.role || 'Marine')} · ${member.species === 'synthetic' ? 'SYNTHÉTIQUE' : 'HUMAIN'}</span><h3>${esc(member.name)}</h3>${member.callsign ? `<p class="echo9-callsign-v110">« ${esc(member.callsign)} »</p>` : ''}<span class="echo9-duty-v110">${esc(statusName(member.status))}</span>${profile ? `<p class="echo9-background-v110">${esc(profile.background.activity)}</p>` : `<p class="echo9-background-v110">${esc(member.specialty || member.role || 'Personnel permanent')}</p>`}</div></div>
      ${identity ? `<div class="crew-identity-v119"><strong>${esc(identity.profession)}</strong><span>${esc(identity.tacticalRole)} · ${esc(identity.traits[0].label)}</span><p>${esc(identity.shortStory.title)} — ${esc(identity.shortStory.text)}</p></div>` : ''}${member.candidate ? `<p class="crew-tradeoffs-v85">Points forts : ${ranked.slice(0, 2).map(entry => `${esc(entry.label)} ${amount(aptitude(member, entry.id))}`).join(' · ')}<br>À développer : ${esc(ranked.at(-1).label)} ${amount(aptitude(member, ranked.at(-1).id))}</p><p class="crew-gear-summary-v85">Dotation : ${list(member.gearV85).map(item => esc(this.itemName(item))).join(' · ')}</p>` : `<div class="echo9-signals-v110">${['health', 'stress', 'fatigue'].map(key => renderEcho9SignalV110(member, key)).join('')}</div>`}
      <div class="button-row"><button type="button" class="button compact" data-v85-open="${esc(member.id)}">DOSSIER</button>${member.candidate ? `<button type="button" class="button compact primary" data-v85-action="recruit" data-v85-id="${esc(member.id)}" ${disabled || this.model.credits < Number(this.rules.recruitCost?.credits || 0) ? 'disabled' : ''}>RECRUTER</button>` : `<button type="button" class="button compact" data-echo9-customize="${esc(member.id)}">PERSONNALISER</button><button type="button" class="button compact" data-v85-action="assign" data-v85-id="${esc(member.id)}" ${disabled || member.status !== 'active' && !member.selected ? 'disabled' : ''}>${member.selected ? 'RÉSERVE' : 'AFFECTER'}</button>`}</div></article>`;
  }

  renderDetail() {
    const member = this.getMember(this.selectedId); if (!member) return;
    if (member.archive) { super.renderDetail(); return; }
    if (this.detailMode === 'markings') return this.renderMarkings(member);
    super.renderDetail();
    const note = this.dialog.querySelector('.crew-note-v85');
    if (note) note.textContent = member.recruitV85 ? 'Dossier de transfert, formation et dotation personnelle. Le passé ouvre des possibilités ; il ne verrouille aucune spécialisation.' : 'Personnel permanent du Tantalus. Les événements de service ci-dessous proviennent de votre campagne.';
    const headerId = this.dialog.querySelector('header small'); if (headerId) headerId.textContent = member.species === 'synthetic' ? 'PERSONNEL SYNTHÉTIQUE' : 'PERSONNEL HUMAIN';
    for (const paragraph of this.dialog.querySelectorAll('.crew-aptitudes-v85 article p')) {
      paragraph.textContent = paragraph.textContent.replace('Socle neutre de simulation : 50.', 'Évaluation de référence : 50.');
    }
    for (const [index, row] of [...this.dialog.querySelectorAll('.crew-gear-row-v85')].entries()) {
      const serial = row.querySelector('small'); if (serial) serial.textContent = `Dotation personnelle · ${Number(member.gearV85?.[index]?.mass) || 0} kg`;
    }
    const body = this.dialog.querySelector('.crew-dossier-body-v85');
    body?.insertAdjacentHTML('afterbegin', `<div class="echo9-detail-summary-v110">${imageMarkup(member, true)}<div><span class="eyebrow">${esc(member.role || 'MARINE')} · ${esc(statusName(member.status))}</span><h3>${esc(member.callsign || member.name)}</h3>${!member.candidate ? `<div class="button-row"><button type="button" class="button" data-echo9-customize="${esc(member.id)}">PERSONNALISER LA TENUE</button><button type="button" class="button" data-v85-action="treat" data-v85-id="${esc(member.id)}" ${this.model.locked || member.status === 'deceased' ? 'disabled' : ''}>SOIGNER</button></div>` : '<p>Dotation et aptitudes consultables avant transfert.</p>'}</div></div>`);
  }

  renderMarkings(member) {
    if (member.archive) { this.renderArchiveDetailV119(member); return; }
    const marking = getEcho9MarkingV110(member);
    const disabled = this.model.locked || member.candidate || member.status === 'deceased';
    this.dialog.innerHTML = `<header><div><span class="eyebrow">ECHO-9 · CASIER INDIVIDUEL</span><h2 id="crew-dossier-title-v85">${esc(member.name)}</h2></div><button type="button" class="button" data-v85-close>FERMER</button></header><div class="crew-dossier-body-v85"><button type="button" class="button" data-echo9-back>DOSSIER PERSONNEL</button><div class="echo9-detail-summary-v110">${imageMarkup(member, true)}<div><h3>Marquage d’identification</h3><p>Deux bandes colorées sur la tenue portée à bord et en mission. La silhouette, la protection et les aptitudes restent inchangées.</p><p>En service : <strong>${esc(marking.label)}</strong></p></div></div><div class="echo9-markings-grid-v110" role="group" aria-label="Marquages de ${esc(member.name)}">${ECHO9_MARKINGS_V110.map(option => `<button type="button" class="echo9-marking-v110 ${marking.id === option.id ? 'selected' : ''}" data-echo9-marking="${option.id}" aria-pressed="${marking.id === option.id}" ${disabled ? 'disabled' : ''}><span class="echo9-marking-sample-v110" style="--mark-color:${option.color};--mark-accent:${option.accent}" aria-hidden="true">${option.id === 'standard' ? '—' : '▰'}</span><strong>${esc(option.label)}</strong><small>${marking.id === option.id ? 'EN SERVICE' : 'APPLIQUER'}</small></button>`).join('')}</div>${disabled ? '<p class="echo9-lock-v110">Consultation uniquement : tenue verrouillée.</p>' : ''}<p>Les autres pièces de dotation se gèrent dans le dossier personnel. Aucun changement de corps ni de modèle d’armure n’est appliqué par ce marquage.</p></div><footer><p class="crew-action-status-v85" role="status" aria-live="polite"></p></footer>`;
  }

  click(event) {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.echo9PlayerWardrobe !== undefined) { this.playerWardrobe?.showModal(); this.playerWardrobe?.querySelector('[data-echo9-wardrobe-close]')?.focus(); return; }
    if (button.dataset.echo9Customize) {
      if (!this.getMember(button.dataset.echo9Customize) || this.getMember(button.dataset.echo9Customize).archive) return;
      this.previousFocus = this.document.activeElement; this.selectedId = button.dataset.echo9Customize;
      this.detailOwner = this.owner; this.detailMode = 'markings'; this.renderDetail();
      if (!this.dialog.open) this.dialog.showModal(); this.dialog.querySelector('[data-v85-close]')?.focus(); return;
    }
    if (button.dataset.echo9Back !== undefined) { this.detailMode = 'dossier'; this.renderDetail(); this.dialog.querySelector('[data-v85-close]')?.focus(); return; }
    if (button.dataset.echo9Marking) {
      if (this.getMember(this.selectedId)?.archive) return;
      const id = button.dataset.echo9Marking;
      try {
        this.onAction('marking', [this.selectedId, id], this.detailOwner);
        const status = this.dialog.querySelector('.crew-action-status-v85'); if (status) status.textContent = 'Marquage individuel enregistré.';
        this.dialog.querySelector(`[data-echo9-marking="${id}"]`)?.focus();
      } catch (error) { const status = this.dialog.querySelector('.crew-action-status-v85'); if (status) status.textContent = error.message; }
      return;
    }
    super.click(event);
  }
}
