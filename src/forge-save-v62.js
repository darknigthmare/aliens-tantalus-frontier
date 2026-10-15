/** V133 workspace controls with a V134 default namespace and non-destructive legacy copying. */
import { ForgeSaveSystemV62 as BaseStore, sanitizeForgeProjectV62, sanitizeForgeSaveV62, FORGE_SAVE_KEY_V62 as FORGE_LEGACY_SAVE_KEY_V62 } from './forge-save-v62-base.js';
import { ForgeModel, parseProject, clone } from './forge-model-v130.js';
export * from './forge-save-v62-base.js';
export const FORGE_SAVE_KEY_V134 = 'atf-frontier-forge-workspace-v134';
// Existing callers importing the default key must follow the default store.
export const FORGE_SAVE_KEY_V62 = FORGE_SAVE_KEY_V134;
export { FORGE_LEGACY_SAVE_KEY_V62 };
let activeForgeStoreV133 = null;
export function getForgeStoreV133() { return activeForgeStoreV133; }
export class ForgeSaveSystemV62 extends BaseStore {
  constructor(storage, key = FORGE_SAVE_KEY_V134) { super(storage, key); activeForgeStoreV133 = this; }
  load(options = {}) {
    this.legacyRawV134 = undefined;
    // New durable namespace is never written by older Forge releases. Copy, never move.
    if (this.key === FORGE_SAVE_KEY_V134) {
      let current, legacy;
      try { current = this.storage?.getItem(this.key) ?? null; legacy = this.storage?.getItem(FORGE_LEGACY_SAVE_KEY_V62) ?? null; }
      catch { return super.load(options); }
      if (current === null && legacy !== null) {
        this.expectedRawV130 = null;
        try { this.data = readWorkspaceV133(legacy); }
        catch (error) {
          this.recoveryNeededV130 = true; this.legacyRawV134 = legacy;
          this.statusV130(false, `Ancien espace conservé : ${error.message}`);
          return { save: this.data, recoveryNeeded: true, migratedV134: false, imported: 0 };
        }
        this.recoveryNeededV130 = false;
        this.commit(options.now ?? Date.now());
        return { save: this.data, recoveryNeeded: false, migratedV134: this.lastWriteV130.persisted, imported: 0 };
      }
    }
    return super.load(options);
  }
  import(text, now) { const result=super.import(text, now); this.legacyRawV134=undefined; return result; }
  exportRawV130() { return this.legacyRawV134 ?? super.exportRawV130(); }
  upsert(project, now = Date.now()) {
    // app.js V130 used to replace names and choose a different ID on mode changes.
    // These transient hints are produced by the editor, stripped by the sanitizer,
    // and never trusted from a file (parseProject removes unknown fields).
    const id = project?.forgeProjectIdV133;
    if (typeof id === 'string' && /^[a-z0-9][a-z0-9_-]{0,119}$/.test(id)) project = { ...project, id, name: project.forgeProjectNameV133 || project.name };
    return super.upsert(project, now);
  }
}
const fail = message => { throw new Error(message); };
const freshId = projects => { const ids = new Set(projects.map(p => p.id)); let n = 1; while(ids.has(`forge-project-${n}`))n++; return `forge-project-${n}`; };
export function readWorkspaceV133(raw) {
  if(typeof raw === 'string') { if(new TextEncoder().encode(raw).length > 16 * 1024 * 1024) fail('Espace de travail trop volumineux (16 Mio).'); raw = JSON.parse(raw); }
  if(raw?.schema !== 1 || !Array.isArray(raw.projects) || raw.projects.length > 256) fail('Espace de travail Forge invalide.');
  // Check every document before the legacy sanitizer, which otherwise drops bad entries.
  for(const project of raw.projects) parseProject(project);
  return sanitizeForgeSaveV62(raw);
}
export class ForgeWorkspaceV133 {
  constructor(editor, store) { this.editor = editor; this.store = store; this.id = store.data.activeProjectId || freshId(store.data.projects); this.epoch = 0; }
  saveCurrent() {
    const project = this.editor.serialize();
    this.store.upsert({ ...project, id: this.id, name: this.editor.model.data.name, forgeProjectIdV133: this.id, forgeProjectNameV133: this.editor.model.data.name });
    return this.store.lastWriteV130.persisted;
  }
  requireSaved() { this.editor.cancelGesture(); if(!this.saveCurrent()) fail(`Changement de projet annulé : ${this.store.lastWriteV130.reason}. Exportez le projet avant de quitter.`); }
  adopt(project) {
    const next = new ForgeModel(project), revision = this.editor.model.revision + 1;
    this.editor.cancelGesture(); this.editor.model = next; next.revision = revision;
    this.id = project.id; this.epoch++; this.editor.selection.clear(); this.editor.cursor = null;
    this.editor.mode = 'brush'; this.editor.workbenchV133?.cancelStamp(); this.editor.fit(); this.editor.ui?.refresh(); this.editor.workbenchV133?.refresh(); this.editor.navigatorV134?.refresh(); this.editor.constructionV135?.refresh();this.editor.controlV136?.refresh();
    // History belongs to the document. Never undo a switch into another project.
  }
  commitCandidate(candidate, activeId) {
    const checked = readWorkspaceV133(candidate), old = this.store.data;
    checked.activeProjectId = activeId;
    this.store.data = checked;
    this.store.commit();
    if(!this.store.lastWriteV130.persisted) { this.store.data = old; fail(`Opération non enregistrée : ${this.store.lastWriteV130.reason}. Projet actuel conservé. Exportez votre travail avant de quitter.`); }
    this.adopt(checked.projects.find(p => p.id === activeId));
  }
  open(id) {
    if(id === this.id)return false;
    const project = this.store.data.projects.find(p => p.id === id); if(!project)fail('Projet introuvable.');
    parseProject(project); this.requireSaved();
    this.commitCandidate({ ...clone(this.store.data), activeProjectId:id }, id); return true;
  }
  create(name='Nouveau projet', kind='mission', input=null) {
    const project = parseProject(input || {schema:2,kind,size:[32,18],tiles:[],name});
    if(input && name)project.name = name;
    this.requireSaved();
    if(this.store.data.projects.length >= 256)fail('Maximum : 256 projets.');
    const id = freshId(this.store.data.projects), record = sanitizeForgeProjectV62({...project,id,updatedAt:Date.now()});
    this.commitCandidate({...clone(this.store.data),projects:[...this.store.data.projects,record],activeProjectId:id},id);return id;
  }
  duplicate(name) { return this.create(name || `${this.editor.model.data.name} · copie`, this.editor.model.data.kind, this.editor.model.data); }
  rename(name) { const text = typeof name === 'string' ? name.trim().slice(0,120) : ''; if(!text)fail('Le nom ne peut pas être vide.'); return this.editor.edit('Renommer le projet',()=>{this.editor.model.data.name=text;}); }
  remove(id=this.id) {
    if(!this.store.data.projects.some(p=>p.id===id))fail('Projet introuvable.');
    this.requireSaved();
    const projects = this.store.data.projects.filter(p=>p.id!==id);
    if(!projects.length)projects.push(sanitizeForgeProjectV62({schema:2,id:'forge-project-1',kind:'mission',name:'Nouveau projet',tiles:[],size:[32,18]}));
    const next = id===this.id ? projects[0].id : this.id;
    this.commitCandidate({...clone(this.store.data),projects,activeProjectId:next},next);
  }
  merge(raw) {
    const imported = readWorkspaceV133(raw); // Validate before saving/changing anything.
    this.requireSaved();
    const projects=clone(this.store.data.projects);
    if(projects.length+imported.projects.length>256)fail('Import trop grand : maximum 256 projets.');
    for(const project of imported.projects)projects.push({...project,id:freshId(projects)});
    this.commitCandidate({...clone(this.store.data),projects},this.id);return imported.projects.length;
  }
  backupText() { const raw=this.store.storage?.getItem(`${this.store.key}-backup-v130`);if(!raw)fail('Aucune copie de secours disponible.');readWorkspaceV133(raw);return raw; }
  restoreBackup(raw) {
    const data=readWorkspaceV133(raw);if(!data.projects.length)fail('La copie de secours ne contient aucun projet.');
    if(this.store.storage?.getItem(`${this.store.key}-backup-v130`)!==raw)fail('La copie de secours a changé. Ouvrez de nouveau la récupération.');
    // Explicit UI confirmation is required. Do not adopt a newer other-tab value silently.
    const previous=clone(this.store.data), protectedBefore=this.store.recoveryNeededV130;
    this.store.recoveryNeededV130=false;this.store.data=data;this.store.commit();
    if(!this.store.lastWriteV130.persisted){this.store.data=previous;this.store.recoveryNeededV130=protectedBefore;fail(`Récupération refusée : ${this.store.lastWriteV130.reason}.`);}
    this.adopt(data.projects.find(p=>p.id===data.activeProjectId)||data.projects[0]);
  }
  export() { const data=clone(this.store.data),record=sanitizeForgeProjectV62({...this.editor.serialize(),id:this.id,name:this.editor.model.data.name});const index=data.projects.findIndex(p=>p.id===this.id);if(index>=0)data.projects[index]=record;else data.projects.push(record);data.activeProjectId=this.id;return JSON.stringify(data,null,2); }
}
