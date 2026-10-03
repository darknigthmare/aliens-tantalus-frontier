import { createCloudClientV119, createSaveTransportV119 } from './cloud-auth-v119.js';
import { CloudSyncV119 } from './cloud-sync-v119.js';
const statuses = { local: 'LOCAL', pending: 'SYNC EN COURS', synced: 'SYNC OK', empty: 'VIDE', 'cloud-ready': 'VERSION CLOUD DISPONIBLE', conflict: 'CONFLIT', offline: 'HORS LIGNE', error: 'ERREUR — LOCAL CONSERVÉ', corrupt: 'CLOUD ILLISIBLE — LOCAL CONSERVÉ' };
export class CloudUiV119 {
  constructor(root, options) {
    this.root = root; this.options = options; this.session = null; this.message = ''; this.client = null; this.sync = null;
    this.render();
    this.online = () => this.sync?.sync();
    this.offline = () => { if (this.sync?.userId) { for (const slot of [1, 2, 3]) this.sync.states[slot] = 'offline'; this.render(); } };
    this.saved = event => this.sync?.saved(event.detail.profile);
    this.storage = event => {
      if (event.key?.startsWith('atf-v47-profile-')) {
        // A different tab changing the active slot must not be overwritten by
        // this tab's old simulation. Root freezes that old timeline immediately.
        options.onExternalLocalChange?.(event.key); this.sync?.schedule();
      }
    };
    globalThis.addEventListener('online', this.online);
    globalThis.addEventListener('offline', this.offline);
    globalThis.addEventListener('atf:saved', this.saved);
    globalThis.addEventListener('storage', this.storage);
    this.initialize().catch(error => { this.message = error.message; this.render(); });
  }
  async initialize() {
    if (this.disposed) return;
    this.authGeneration = 0;
    this.client = createCloudClientV119();
    this.sync = new CloudSyncV119({ ...this.options, transport: createSaveTransportV119(this.client), onChange: () => this.render() });
    this.subscription = this.client.auth.onAuthStateChange((_event, session) => {
      if (this.disposed) return;
      this.authGeneration += 1;
      this.session = session; this.sync.setUser(session?.user?.id || null); this.render();
      // Supabase auth callback must not await a second auth/DB call.
      setTimeout(() => { if (!this.disposed) this.sync?.sync(); }, 0);
    }).data.subscription;
    const generation = this.authGeneration;
    const { data, error } = await this.client.auth.getSession();
    if (this.disposed || generation !== this.authGeneration) return;
    if (error) throw error;
    this.session = data.session; this.sync.setUser(data.session?.user?.id || null); this.render(); await this.sync.sync();
  }
  render() {
    if (!this.root || this.disposed) return;
    const email = this.session?.user?.email || '';
    // Keep the live form during initialization/status refreshes. Credentials
    // stay in its inputs only, never in save data or a second JS draft object.
    const liveForm = !email && this.root.querySelector('form.cloud-auth-v119');
    const focused = liveForm?.contains(document.activeElement) ? document.activeElement : null;
    this.root.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = 'LIAISON FRONTIER · PROFILS'; this.root.append(heading);
    const intro = document.createElement('p'); intro.textContent = email ? `Compte : ${email}` : 'Trois profils locaux, jouables hors ligne. Connectez un compte pour les retrouver sur un autre appareil.'; this.root.append(intro);
    if (liveForm) {
      for (const button of liveForm.querySelectorAll('button')) button.disabled = !this.client || Boolean(this.authBusy);
      this.root.append(liveForm);
      focused?.focus();
    } else if (!email) {
      const form = document.createElement('form'); form.className = 'cloud-auth-v119';
      const label = (text, type, name) => { const l = document.createElement('label'); l.textContent = text; const i = document.createElement('input'); Object.assign(i, { type, name, required: true, autocomplete: type === 'password' ? 'current-password' : 'email' }); l.append(i); form.append(l); return i; };
      const emailInput = label('E-MAIL', 'email', 'email'); const password = label('MOT DE PASSE', 'password', 'password');
      const signIn = document.createElement('button'); signIn.className = 'button'; signIn.textContent = 'SE CONNECTER'; signIn.disabled = !this.client; form.append(signIn);
      const signUp = document.createElement('button'); signUp.type = 'button'; signUp.className = 'button'; signUp.textContent = 'CRÉER LE COMPTE'; signUp.disabled = !this.client; form.append(signUp);
      const submit = async signup => {
        if (this.disposed || this.authBusy || !this.client) return;
        password.minLength = signup ? 8 : 1;
        if (!form.reportValidity()) return;
        this.authBusy = true;
        signIn.disabled = signUp.disabled = true;
        try {
          const { data, error } = await this.client.auth[signup ? 'signUp' : 'signInWithPassword']({ email: emailInput.value.trim(), password: password.value,
            ...(signup ? { options: { emailRedirectTo: globalThis.location.origin + '/' } } : {}) });
          if (error) throw error;
          this.message = signup && !data.session ? 'Vérifiez votre e-mail pour confirmer le compte, puis connectez-vous.' : 'Connexion établie.';
        } catch (error) { this.message = error.message; }
        finally { password.value = ''; this.authBusy = false; this.render(); }
      };
      form.onsubmit = e => { e.preventDefault(); submit(false); }; signUp.onclick = () => submit(true); this.root.append(form);
    } else {
      this.button('SYNCHRONISER', () => this.sync.sync());
      this.button('SE DÉCONNECTER', async () => { const { error } = await this.client.auth.signOut({ scope: 'local' }); if (error) throw error; this.message = 'Compte déconnecté ; profils locaux conservés.'; });
    }
    for (const slot of [1, 2, 3]) {
      const row = document.createElement('div'); row.className = 'cloud-slot-v119';
      const status = this.sync?.state(slot) || 'local';
      const text = document.createElement('span'); text.textContent = `PROFIL ${slot} · ${statuses[status] || status}`; row.append(text);
      if (['conflict', 'cloud-ready'].includes(status)) {
        const local = this.options.saveSystem.readSlotV78(slot);
        const remote = this.sync.remote[slot];
        const summary = (label, payload, revision) => {
          const p = document.createElement('p'); p.className = 'cloud-summary-v119';
          const at = Number(payload?.updatedAt); const date = Number.isFinite(at) && at > 0 ? new Date(at).toLocaleString('fr-FR') : 'date non renseignée';
          p.textContent = `${label} · ${payload ? `J${payload.clock?.day || 1} · ${payload.statistics?.campaigns || 0} opérations · ${date}` : 'emplacement vide'}${revision ? ` · révision ${revision}` : ''}`;
          row.append(p);
        };
        summary('LOCAL', local.status === 'ready' ? local.data : null);
        summary('CLOUD', remote?.payload, remote?.revision);
        this.button('CHARGER LE CLOUD', () => this.sync.resolve(slot, 'cloud'), row);
        if (status === 'conflict') { this.button('GARDER LOCAL', () => this.sync.resolve(slot, 'local'), row); this.button('GARDER LES DEUX', () => this.sync.resolve(slot, 'both'), row); }
      }
      this.root.append(row);
    }
    const message = document.createElement('p'); message.setAttribute('role', 'status'); message.textContent = this.sync?.error || this.message; this.root.append(message);
    this.options.onStatus?.(statuses[this.sync?.state(this.options.saveSystem.profile) || 'local']);
  }
  button(text, action, parent = this.root) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'button compact'; button.textContent = text; button.disabled = Boolean(this.sync?.busy);
    button.onclick = async () => { try { await action(); } catch (error) { this.message = error.message; } this.render(); }; parent.append(button);
  }
  dispose() {
    this.disposed = true;
    this.sync?.dispose(); this.subscription?.unsubscribe();
    globalThis.removeEventListener('online', this.online); globalThis.removeEventListener('atf:saved', this.saved); globalThis.removeEventListener('storage', this.storage);
    globalThis.removeEventListener('offline', this.offline);
  }
}
