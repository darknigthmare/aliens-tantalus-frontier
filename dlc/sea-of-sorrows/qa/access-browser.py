#!/usr/bin/env python3
"""Current UI/audio validation. Explicit memory storage; no native-policy bypass."""
from pathlib import Path
import json,hashlib,traceback,wave,struct
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];OUT=R/'reports/v090';CAP=OUT/'captures';CAP.mkdir(parents=True,exist_ok=True)
HTML=(R/'MER_DES_CHAGRINS_JOUABLE.html').read_text();KEY='tantalus.dlc.sea-of-sorrows.v1'
checks=[];errors=[];network=[];captures=[];audio_metrics=[];fatal=None
sha=lambda s:hashlib.sha256(s).hexdigest()
def ck(name,value):
 checks.append({'name':name,'pass':bool(value)});print(('PASS 'if value else'FAIL ')+name,flush=True)
def boot(b,width=1440,height=900,seed=None):
 p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1);p.set_default_timeout(9000)
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:network.append(r.url))
 p.evaluate('''seed=>{window.__SOS_QA__=true;window.__memory=new Map(Object.entries(seed||{}));window.__denyWrites=false;Object.defineProperty(window,'localStorage',{value:{getItem:k=>__memory.has(k)?__memory.get(k):null,setItem:(k,v)=>{if(__denyWrites)throw new DOMException('Simulated quota','QuotaExceededError');__memory.set(String(k),String(v));},removeItem:k=>__memory.delete(k),clear:()=>__memory.clear()}});}''',seed or {})
 p.set_content(HTML,wait_until='load');p.wait_for_timeout(120);return p

def load(p,key,frozen=False):
 raw=(R/'qa/access-fixtures'/f'{key}.json').read_text()
 p.evaluate('''({raw,frozen})=>{const q=__sos;q.game.importSave(raw);q.game.drainEvents();q.cueBus.reset();q.closeAll();if(frozen)q.freeze();q.renderer.lastRoom='';q.updateHUD();q.renderer.draw(0,0);}''',{'raw':raw,'frozen':frozen});return raw

def shot(p,name,caption,source=None):
 p.screenshot(path=str(CAP/name));state=p.evaluate('__sos.game.exportSave()');sd=OUT/'capture-states';sd.mkdir(exist_ok=True);(sd/(name+'.json')).write_text(state);captures.append({'file':name,'sha256':sha((CAP/name).read_bytes()),'state_sha256':sha(state.encode()),'caption':caption,'source_snapshot':source,'source_sha256':sha((R/'qa/access-fixtures'/f'{source}.json').read_bytes())if source else None});print('CAPTURE '+name,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  p=boot(b)
  ck('Version 0.9, 50 salles, 120 dossiers et schéma 8',p.evaluate('SoSData.meta.version==="0.9.0"&&SoSData.rooms.length===50&&SoSData.codex.length===120&&__sos.game.state.schema===8'))
  ck('Aucun contexte sonore avant autorisation',p.evaluate('__sos.audio.ctx===null&&!__sos.getSettings().sound'))
  shot(p,'01_titre.png','Écran titre du HTML livré, état neuf.')
  p.click('#optionsBtn');ck('Quatre catégories réelles de réglages',p.locator('[data-options]').count()==4)
  ck('Quatre volumes et légendes indépendantes',p.locator('[data-mix]').count()==4 and p.locator('#captionEnabled').is_checked())
  before=p.evaluate('__sos.game.exportSave()');p.click('#mixEnabled');p.wait_for_timeout(120)
  ck('Activer le son ne reprend pas la simulation',p.evaluate('__sos.game.exportSave()')==before and p.evaluate('__sos.isPaused()'))
  p.wait_for_function('__sos.audio.ctx&&__sos.audio.ctx.state==="suspended"')
  ck('Contexte audio suspendu dans Réglages',p.evaluate('__sos.audio.ctx.state==="suspended"'))
  p.locator('#mix-ambience').evaluate("e=>{e.value='23';e.dispatchEvent(new Event('input',{bubbles:true}));}")
  ck('Un curseur modifie seulement son bus',p.evaluate('__sos.getSettings().audio.ambience===.23&&__sos.getSettings().audio.effects===.65'))
  p.click('#testSound');p.wait_for_function('__sos.audio.ctx.state==="running"');ck('Le bouton de test réveille réellement AudioContext',p.evaluate('__sos.audio.ctx.state==="running"'))
  p.wait_for_function('__sos.audio.ctx.state==="suspended"',timeout=3500);ck('Le test se termine sans boucle ni voix restante',p.evaluate('__sos.audio.voices.size===0') and p.evaluate('__sos.game.exportSave()')==before)
  shot(p,'02_mixage.png','Réglages : ambiance à 23 %, test sonore terminé. La mission est restée en pause.')
  p.click('#mixEnabled');ck('Son muet, légendes toujours actives',p.evaluate('!__sos.getSettings().sound&&__sos.getSettings().audio.captions'))
  p.click('#captionEnabled');ck('Désactivation des légendes indépendante du son',p.evaluate('!__sos.getSettings().audio.captions&&!__sos.getSettings().sound'));p.click('#captionEnabled')
  p.click('[data-options="keyboard"]');p.click('[data-bindgroup="Terrain"]');p.click('[data-bind="use"]');p.keyboard.press('KeyL')
  ck('Conflit L refusé et ancien E conservé',p.evaluate('__sos.bindings.canonical("KeyE")==="KeyE"')and'déjà affectée'in p.locator('#bindingMessage').inner_text())
  p.keyboard.press('Escape');ck('Échap annule la saisie sans fermer les options',p.locator('#bindingMessage').inner_text()=='Modification annulée.' and p.locator('#panel').is_visible())
  p.click('[data-bind="use"]');p.keyboard.press('KeyM');ck('Interagir devient M, ancien E libéré',p.evaluate('__sos.bindings.canonical("KeyM")==="KeyE"&&__sos.bindings.canonical("KeyE")===null'))
  shot(p,'03_clavier.png','Affectation réellement réalisée : Interagir / outil sélectionné est passé à M. Les conflits ont été refusés.')
  stored=p.evaluate('Object.fromEntries(__memory)');p2=boot(b,seed=stored);ck('Les commandes et volumes sont relus à la création d’une page',p2.evaluate('__sos.bindings.primary("use")==="M"&&__sos.getSettings().audio.ambience===.23'));p2.close()
  p.click('#closePanel');load(p,'sealed-locker-03')
  p.keyboard.down('KeyO');p.wait_for_timeout(120);p.keyboard.down('KeyO');p.wait_for_timeout(80)
  ck('Maintenir O ne referme pas la roue par répétition',p.locator('#tactical').is_visible() and p.evaluate('__sos.isPaused()'))
  ck('La roue indique aussi la touche personnalisée', 'Maintenir M' in p.locator('.wheelHub').inner_text())
  p.keyboard.up('KeyO');p.keyboard.press('KeyO');ck('Une nouvelle pression ferme la roue',not p.locator('#tactical').is_visible())

  p.keyboard.down('KeyE');p.wait_for_timeout(300);p.keyboard.up('KeyE');ck('Ancien E inactif près du casier',p.evaluate('__sos.game.rs.lockers["locker-03"].progress===0'))
  p.keyboard.down('KeyM');p.wait_for_timeout(650);p.keyboard.up('KeyM');progress=p.evaluate('__sos.game.rs.lockers["locker-03"].progress')
  ck('M maintenu réalise une ouverture partielle',0.3<progress<1.3)
  p.wait_for_timeout(160);ck('Relâcher M conserve le travail',p.evaluate('__sos.game.rs.lockers["locker-03"].progress')==progress)
  ck('Le HUD indique la nouvelle touche', 'M' in p.locator('#prompt').inner_text() and 'Maintenir E'not in p.locator('#prompt').inner_text())
  p.evaluate('__sos.freeze()');shot(p,'04_interaction_m.png','Casier du vestiaire, après 0,65 s de maintien de M dans Chromium. Position héritée du parcours 0.9, sans déplacement préparé.','sealed-locker-03')
  p.evaluate('__sos.closeAll()');p.keyboard.down('KeyM');p.wait_for_function('__sos.game.rs.lockers["locker-03"].opened&&document.getElementById("takeAllStock")');p.keyboard.up('KeyM')
  ck('L’interaction reconfigurée termine le vrai scellé',p.locator('#takeAllStock').is_visible())
  p.click('#leaveStock');p.evaluate('__sos.freeze()');ck('Légende d’ouverture sans son', 'Casier déverrouillé'in p.locator('#soundCaption').inner_text() and not p.evaluate('__sos.getSettings().sound'))
  shot(p,'05_casier_legende.png','Ouverture achevée avec M et inspection refermée ; légende du mécanisme, audio désactivé.','sealed-locker-03')
  load(p,'trace-departure');p.wait_for_function('document.getElementById("soundCaption").textContent.includes("griffes")',timeout=16000);p.evaluate('__sos.freeze()')
  ck('La retraite émet un préavis légendé sans audio', 'griffes'in p.locator('#soundCaption').inner_text() and not p.evaluate('__sos.getSettings().sound'))
  ck('La légende ne fournit pas de coordonnées ennemies',p.evaluate('__sos.cueBus.captionsAt(__sos.game.state.stats.time).every(c=>!("x"in c)&&!("enemy"in c))'))
  shot(p,'06_seuil_silencieux.png','Après reprise du départ au belvédère, le poursuivant a rejoint son seuil dans le moteur. Audio muet, légende réelle, positions non retouchées.','trace-departure')
  ck('Bandeau de légende en dehors du canvas',p.evaluate('document.getElementById("signalRail").getBoundingClientRect().top>=document.getElementById("viewport").getBoundingClientRect().bottom'))
  # Isolated fault injection; this is not a campaign victory or native storage certification.
  backup=(R/'qa/access-fixtures/HYBRID-survival-14.json').read_text();p.evaluate('({key,raw})=>{__memory.set(key,"CORRUPTED FOR TEST");__memory.set(key+".last-valid",raw);__sos.showOptions("saves");}',{'key':KEY,'raw':backup})
  ck('Sauvegarde corrompue distinguée du secours valide','Illisible'in p.locator('#panelContent').inner_text() and 'Disponible'in p.locator('#panelContent').inner_text())
  p.click('#restoreLastValid');ck('La sélection ne restaure pas silencieusement',p.evaluate('(key)=>localStorage.getItem(key)',KEY)=='CORRUPTED FOR TEST')
  p.click('#cancelLastValid');ck('Annuler conserve la sauvegarde courante',p.evaluate('(key)=>localStorage.getItem(key)',KEY)=='CORRUPTED FOR TEST')
  shot(p,'07_copie_valide.png','Scénario de récupération explicitement préparé : sauvegarde courante rendue illisible, véritable export 0.9 placé en secours.')
  p.click('#restoreLastValid');p.click('#confirmLastValid');p.evaluate('__sos.freeze()');ck('Confirmation restaure le point sélectionné',p.evaluate('__sos.game.state.objectiveIndex===14'))
  current=p.evaluate('(key)=>localStorage.getItem(key)',KEY);p.evaluate('__sos.game.toggleLamp();__denyWrites=true;')
  ck('Quota simulé : refus visible au lieu de succès fictif',p.evaluate('__sos.persist()')==False and 'plein'in p.locator('#saveWarning').inner_text())
  ck('Quota simulé : sauvegarde courante intacte',p.evaluate('(key)=>localStorage.getItem(key)',KEY)==current)
  ck('L’expédition en mémoire reste exportable',p.evaluate('(()=>{const q=new SoSCore.Game();return q.importSave(__sos.game.exportSave());})()'))
  p.evaluate('__denyWrites=false;__sos.persist();__sos.showOptions("saves")');ck('Le stockage reprend après levée du refus',p.evaluate('__sos.vault.inspect().current'))
  # Actual offline Web Audio rendering, not mocked oscillator calls.
  for kind in p.evaluate('Object.keys(SoSSoundscape.CUES)'):
   metric=p.evaluate('''async kind=>{const c=new OfflineAudioContext(2,24000,24000);SoSSoundscape.synth(c,c.destination,kind,{start:0,volume:1});const b=await c.startRendering();const a=b.getChannelData(0);let peak=0,sum=0,finite=true;for(const x of a){finite=finite&&Number.isFinite(x);peak=Math.max(peak,Math.abs(x));sum+=x*x;}return {kind,peak,rms:Math.sqrt(sum/a.length),finite};}''',kind);audio_metrics.append(metric)
   ck('Synthèse audio réelle : '+kind,metric['finite']and 0.00001<metric['rms']<.4 and metric['peak']<1)
  zero=p.evaluate('''async()=>{const c=new OfflineAudioContext(2,16000,24000),bus=c.createGain();bus.gain.value=0;bus.connect(c.destination);SoSSoundscape.synth(c,bus,'sensor',{start:0});const b=await c.startRendering();return Array.from(b.getChannelData(0)).every(x=>x===0);}''')
  ck('Bus à zéro : rendu sonore intégralement nul',zero)
  pan=p.evaluate('''async()=>{const c=new OfflineAudioContext(2,16000,24000);SoSSoundscape.synth(c,c.destination,'sensor',{pan:-.8,start:0});const b=await c.startRendering();return [0,1].map(i=>b.getChannelData(i).reduce((s,x)=>s+x*x,0));}''');ck('Panoramique stéréo gauche réel',pan[0]>pan[1]*3)
  # A playable WAV evidence sample; exclusively our procedural cue definitions.
  sample=p.evaluate('''async()=>{const keys=Object.keys(SoSSoundscape.CUES),c=new OfflineAudioContext(2,Math.ceil(keys.length*.6*24000),24000);keys.forEach((kind,i)=>SoSSoundscape.synth(c,c.destination,kind,{start:i*.6,volume:.7}));const b=await c.startRendering();return [Array.from(b.getChannelData(0)),Array.from(b.getChannelData(1))];}''')
  with wave.open(str(OUT/'SONS_PROCEDURAUX_TEST.wav'),'wb')as w:
   w.setnchannels(2);w.setsampwidth(2);w.setframerate(24000);w.writeframes(b''.join(struct.pack('<hh',int(max(-1,min(1,l))*32767),int(max(-1,min(1,r))*32767))for l,r in zip(*sample)))
  ck('Échantillon WAV non vide et généré par le même synthétiseur',(OUT/'SONS_PROCEDURAUX_TEST.wav').stat().st_size>100000)
  for width,height in [(1024,768),(390,844),(360,780)]:
   small=boot(b,width,height);small.click('#optionsBtn')
   ck(str(width)+' px : options audio sans débordement horizontal',small.evaluate('document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector(".panelBox").getBoundingClientRect().right<=innerWidth+1'))
   small.click('[data-options="keyboard"]');ck(str(width)+' px : commandes sans boutons superposés',small.evaluate('()=>{const a=[...document.querySelectorAll(".bindingsList button")].map(e=>e.getBoundingClientRect());return a.every((r,i)=>a.every((s,j)=>i===j||r.bottom<=s.top||r.top>=s.bottom));}'))
   ck(str(width)+' px : fermeture toujours accessible',small.locator('#closePanel').is_visible())
   if width==390:shot(small,'08_clavier_390.png','Réglages clavier en 390 × 844. Contrôle d’agencement ; ne certifie pas un appareil tactile complet.')
   small.close()
  p.evaluate('__sos.showOptions("keyboard")');p.click('#resetBindings');p.click('#confirmKeys');ck('Restauration des commandes sans réinitialiser le mixage',p.evaluate('__sos.bindings.canonical("KeyE")==="KeyE"&&__sos.getSettings().audio.ambience===.23'))
  ck('Aucune exception JavaScript détectée',not errors);ck('Aucun chargement réseau par le HTML autonome',not network)
  p.close()
 except Exception as e:fatal=str(e);traceback.print_exc()
 finally:b.close()
report={'version':'0.9.0','html_sha256':sha(HTML.encode()),'checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks)+(1 if fatal else 0),'fatal':fatal,'errors':errors,'network':network,'captures':captures,'audio_metrics':audio_metrics,'method':'Playwright/Chromium exact HTML set_content; explicit memory storage. Ordinary keyboard and button operations. Current earned snapshots except the labelled corrupted-save fixture. OfflineAudioContext generated real samples. No human listening audit or native persistence certification.'}
(OUT/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('RESULT',report['passed'],report['failed'],flush=True)
raise SystemExit(1 if report['failed']else 0)
