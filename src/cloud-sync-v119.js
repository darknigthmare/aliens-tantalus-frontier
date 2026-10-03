import { assertSaveProfileIdV78 } from './save-profile-v78.js';
import { saveChecksumV119, validateCloudRowV119, classifySavePairV119 } from './cloud-save-v119.js';

const emptyLedger = () => ({ bases: {}, queued: {} });
export class CloudSyncV119 {
  constructor({ saveSystem, transport, applyRemote, getOwner, ownsOwner, onChange = () => {}, online = () => globalThis.navigator?.onLine !== false }) {
    Object.assign(this, { saveSystem, transport, applyRemote, getOwner, ownsOwner, onChange, online });
    this.userId = null; this.epoch = 0; this.remote = {}; this.states = {}; this.busy = false;
    this.ledger = emptyLedger(); this.timer = null; this.disposed = false;
    const storage = saveSystem.storage;
    try {
      this.deviceId = storage.getItem('atf-device-v119') || globalThis.crypto.randomUUID();
      storage.setItem('atf-device-v119', this.deviceId);
    } catch { this.deviceId = globalThis.crypto.randomUUID(); }
  }
  key() { return `atf-cloud-sync-v119:${this.userId}`; }
  persist() {
    try { this.saveSystem.storage.setItem(this.key(), JSON.stringify(this.ledger)); return true; }
    catch { this.error = 'File de synchronisation indisponible ; les profils locaux sont conservés.'; return false; }
  }
  setUser(userId) {
    if (this.disposed) return;
    if (this.userId === userId) return;
    this.epoch += 1; clearTimeout(this.timer); this.userId = userId;
    this.remote = {}; this.states = {}; this.ledger = emptyLedger();
    if (userId) {
      try {
        const stored = JSON.parse(this.saveSystem.storage.getItem(this.key()));
        for (const slot of [1, 2, 3]) {
          const base = stored?.bases?.[slot];
          if (Number.isSafeInteger(base?.revision) && base.revision > 0 && /^[a-f0-9]{64}$/.test(base.checksum)) this.ledger.bases[slot] = base;
          // Queues contain checksums, never tokens or a second copy of saves.
          if (/^[a-f0-9]{64}$/.test(stored?.queued?.[slot])) this.ledger.queued[slot] = stored.queued[slot];
        }
      } catch { /* Metadata corruption cannot replace a local save. */ }
    }
    this.onChange();
  }
  async local(slot) {
    const entry = this.saveSystem.readSlotV78(slot);
    if (entry.status === 'corrupt') throw new Error('Profil local protégé : récupération nécessaire.');
    if (entry.status !== 'ready') return null;
    return { payload: entry.data, checksum: await saveChecksumV119(entry.data) };
  }
  state(slot) { return this.states[slot] || (this.userId ? 'pending' : 'local'); }
  notify() { this.onChange(); }
  schedule() {
    if (this.disposed || !this.userId) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.sync().catch(() => {}); }, 1000);
  }
  async saved(slot) {
    slot = assertSaveProfileIdV78(slot);
    const epoch = this.epoch;
    if (!this.userId) return;
    try {
      const local = await this.local(slot);
      if (epoch !== this.epoch || !local) return;
      this.ledger.queued[slot] = local.checksum;
      this.persist(); this.states[slot] = this.online() ? 'pending' : 'offline'; this.notify(); this.schedule();
    } catch (error) { if (epoch === this.epoch) { this.error = error.message; this.states[slot] = 'error'; this.notify(); } }
  }
  async sync() {
    if (this.disposed || this.busy || !this.userId) return;
    if (!this.online()) { for (const slot of [1, 2, 3]) this.states[slot] = 'offline'; this.notify(); return; }
    const epoch = this.epoch, userId = this.userId;
    this.busy = true; this.error = ''; this.notify();
    try {
      const rows = await this.transport.pull();
      if (epoch !== this.epoch) return;
      const remote = {};
      for (const row of rows) {
        try {
          const valid = await validateCloudRowV119(row, userId);
          remote[valid.slot] = valid;
        } catch (error) {
          if ([1, 2, 3].includes(row?.slot)) { remote[row.slot] = { invalid: true }; this.states[row.slot] = 'corrupt'; }
          this.error = error.message;
        }
      }
      if (epoch !== this.epoch) return;
      this.remote = remote;
      for (const slot of [1, 2, 3]) {
        if (epoch !== this.epoch) return;
        if (remote[slot]?.invalid) continue;
        try {
          const local = await this.local(slot);
          if (epoch !== this.epoch) return;
          const status = classifySavePairV119(local?.checksum, remote[slot], this.ledger.bases[slot]);
          this.states[slot] = status;
          if (status === 'synced') this.accept(slot, remote[slot]);
          if (status === 'upload') await this.push(slot, local, remote[slot], epoch);
        } catch (error) { if (epoch === this.epoch) { this.states[slot] = 'error'; this.error = error.message; } }
      }
    } catch (error) {
      if (epoch === this.epoch) { for (const slot of [1, 2, 3]) this.states[slot] = this.online() ? 'error' : 'offline'; this.error = 'Synchronisation interrompue. ' + (error.message || 'Réessayez.'); }
    } finally {
      this.busy = false; this.notify();
      // A local commit during an upload is not lost: it schedules another CAS.
      if (!this.disposed && this.userId && (epoch !== this.epoch || (Object.keys(this.ledger.queued).length && Object.values(this.states).includes('pending')))) this.schedule();
    }
  }
  accept(slot, remote) {
    this.ledger.bases[slot] = { revision: remote.revision, checksum: remote.checksum };
    if (this.ledger.queued[slot] === remote.checksum) delete this.ledger.queued[slot];
    this.persist();
  }
  async push(slot, local, remote, epoch) {
    if (!local) return;
    this.ledger.queued[slot] = local.checksum; this.persist();
    const result = await this.transport.put({ slot, revision: remote?.revision || 0,
      previousChecksum: remote?.checksum || null, ...local, deviceId: this.deviceId });
    if (epoch !== this.epoch) return;
    if (!result?.ok) {
      const conflict = result?.remote ? await validateCloudRowV119(result.remote, this.userId) : null;
      if (epoch !== this.epoch) return;
      if (conflict && conflict.slot !== slot) throw new Error('Conflit distant attribué au mauvais profil.');
      this.states[slot] = 'conflict'; if (conflict) this.remote[slot] = conflict; return;
    }
    const valid = await validateCloudRowV119(result.remote, this.userId);
    if (epoch !== this.epoch) return;
    if (valid.slot !== slot || valid.checksum !== local.checksum || valid.revision !== (remote?.revision || 0) + 1) throw new Error('Réponse de sauvegarde distante incohérente.');
    this.remote[slot] = valid; this.accept(slot, valid);
    const current = await this.local(slot);
    if (epoch !== this.epoch) return;
    this.states[slot] = current?.checksum === local.checksum ? 'synced' : 'pending';
    if (this.states[slot] === 'pending' && current) { this.ledger.queued[slot] = current.checksum; this.persist(); }
  }
  async resolve(slot, choice) {
    slot = assertSaveProfileIdV78(slot);
    if (this.disposed || this.busy || !this.userId || !['local', 'cloud', 'both'].includes(choice)) return false;
    const epoch = this.epoch, userId = this.userId, owner = this.getOwner();
    const rawBefore = this.saveSystem.storage.getItem(this.saveSystem.key(slot));
    const observed = this.remote[slot];
    if (observed?.invalid || !observed) throw new Error('Version distante non validée.');
    this.busy = true; this.notify();
    try {
      const local = await this.local(slot);
      const unchanged = () => epoch === this.epoch && this.ownsOwner(owner) && this.saveSystem.storage.getItem(this.saveSystem.key(slot)) === rawBefore;
      if (!unchanged()) throw new Error('Le profil a changé pendant la demande. Rouvrez le conflit.');
      const rows = await this.transport.pull();
      const row = rows.find(r => r.slot === slot);
      const remote = await validateCloudRowV119(row, userId);
      if (!unchanged()) throw new Error('Le profil a changé pendant la demande. Rouvrez le conflit.');
      if (remote.revision !== observed.revision || remote.checksum !== observed.checksum) { this.remote[slot] = remote; this.states[slot] = 'conflict'; throw new Error('La version distante a changé. Confirmez à nouveau votre choix.'); }
      if (choice === 'cloud') {
        this.applyRemote(slot, remote.payload, { owner, expectedRaw: rawBefore });
        this.accept(slot, remote); this.states[slot] = 'synced';
      } else {
        if (!local) throw new Error('Aucune version locale à conserver.');
        if (choice === 'both') {
          const free = [1, 2, 3].find(s => s !== slot && this.saveSystem.readSlotV78(s).status === 'empty' && !rows.some(r => r.slot === s));
          if (!free) throw new Error('Aucun emplacement libre local ET distant. Exportez une version avant de choisir.');
          this.applyRemote(free, remote.payload, { owner, expectedRaw: null });
          const copy = await this.local(free);
          if (epoch !== this.epoch) return false;
          await this.push(free, copy, null, epoch);
          if (this.states[free] !== 'synced') throw new Error('Copie conservée localement ; envoi non terminé. La version distante originale reste intacte.');
        }
        if (!unchanged()) throw new Error('Le profil a changé pendant la copie. La version distante originale reste intacte.');
        await this.push(slot, local, remote, epoch);
      }
      return true;
    } finally {
      this.busy = false; this.notify();
      if (!this.disposed && this.userId && (epoch !== this.epoch || Object.values(this.states).includes('pending'))) this.schedule();
    }
  }
  dispose() { this.disposed = true; this.epoch += 1; this.userId = null; clearTimeout(this.timer); }
}
