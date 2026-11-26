import { QUICK_ITEMS } from './signals.js';
/** The wheel is selection-only. Opening it never pauses the simulation.
 * Event capture keeps selection keys out of movement, hacking and quick actions.
 */
export class IsolationQuickControls{
 constructor(options){this.options=options;this.opened=false;this.preview='noise';this.root=document.getElementById('quickWheel');this.slot=document.getElementById('quickSlot');this.captions=document.getElementById('soundCaptions');this.status=document.getElementById('signalReadout');
  this.root.innerHTML=`<div class="wheel-scrim"></div><div class="wheel-shell"><div class="wheel-heading"><small>ÉQUIPEMENT / ACCÈS RAPIDE</small><h2>Choisir son prochain geste.</h2><p>Le temps continue. Choisir n’utilise pas l’objet.</p></div><div class="wheel-disc" role="group" aria-label="Objets rapides">${QUICK_ITEMS.map((q,i)=>`<button class="wheel-item wheel-${i}" data-quick="${q.id}" aria-pressed="false"><img alt="" data-icon="${q.icon}"><span>${q.name}</span><b data-stock="${q.id}">0</b><small>${q.key} · ${i+1}</small></button>`).join('')}<div class="wheel-center"><span id="wheelSymbol">◎</span><strong id="wheelCurrent"></strong><small>APERÇU DU CHOIX</small></div></div><div class="wheel-description"><p id="wheelDescription"></p><small id="wheelRecipe"></small></div><div class="wheel-actions"><button id="wheelConfirm">CHOISIR · ENTRÉE</button><button id="wheelInventory">FABRICATION · I</button><button id="wheelCancel">ANNULER · ÉCHAP</button></div><p class="wheel-help">FLÈCHES / 1–4 : CHOISIR · CLIC DROIT EN JEU : UTILISER</p></div>`;
  this.slot.onclick=()=>this.open();this.root.querySelector('#wheelConfirm').onclick=()=>this.commit();this.root.querySelector('#wheelInventory').onclick=()=>{this.close();options.inventory();};this.root.querySelector('#wheelCancel').onclick=()=>this.close();this.root.querySelector('.wheel-scrim').onclick=()=>this.close();
  for(const b of this.root.querySelectorAll('[data-quick]')){b.onpointerenter=()=>this.choose(b.dataset.quick);b.onclick=()=>{this.choose(b.dataset.quick);this.commit();};b.onfocus=()=>{this.choose(b.dataset.quick);};}
  this.root.oncontextmenu=ev=>{ev.preventDefault();this.close();};
  document.addEventListener('keydown',ev=>this.key(ev),true);
  const canvas=document.getElementById('game');canvas.addEventListener('contextmenu',ev=>ev.preventDefault());
  canvas.addEventListener('pointerdown',ev=>{if(ev.button!==2||!options.gameplay()||this.opened)return;ev.preventDefault();const e=options.engine();e.signals.useSelected();});
 }
 ready(){for(const im of this.root.querySelectorAll('[data-icon]')){const img=this.options.renderer.images['ui/'+im.dataset.icon+'.svg'];if(img)im.src=img.src;}}
 valid(){const e=this.options.engine();return this.options.gameplay()&&!e.s.dead&&!e.s.ended;}
 open(){const e=this.options.engine();if(!this.valid()||e.pendingHack)return false;e.aim=null;e.hold=null;e.requireRelease=true;e.signals.cancelHandling();this.options.clear();this.opened=true;this.preview=e.s.signals.selected;this.root.hidden=false;this.update();this.root.querySelector(`[data-quick="${this.preview}"]`).focus();return true;}
 close(){this.opened=false;this.root.hidden=true;this.options.clear();document.activeElement?.blur();}
 choose(id){if(!QUICK_ITEMS.some(q=>q.id===id))return;this.preview=id;this.updateWheel();}
 commit(){const e=this.options.engine();if(this.opened&&this.valid())e.signals.select(this.preview);this.close();}
 key(ev){const k=ev.key.toLowerCase();if(!this.opened&&(!this.valid()||ev.target instanceof HTMLInputElement||ev.target instanceof HTMLSelectElement))return;
  if(!this.opened){if(k==='tab'&&!this.options.engine().pendingHack){ev.preventDefault();ev.stopImmediatePropagation();if(!ev.repeat)this.open();}if(k==='k'&&!ev.repeat){ev.preventDefault();ev.stopImmediatePropagation();this.options.engine().signals.toggleSilent();}return;}
  ev.preventDefault();ev.stopImmediatePropagation();if(ev.repeat)return;
  if(k==='escape'||k==='tab'){this.close();return;}if(k==='enter'){this.commit();return;}if(k==='i'){this.close();this.options.inventory();return;}
  const id={arrowup:'noise',arrowright:'flare',arrowdown:'emp',arrowleft:'medkit','1':'noise','2':'flare','3':'emp','4':'medkit'}[k];if(id){this.choose(id);this.root.querySelector(`[data-quick="${id}"]`).focus();}
 }
 updateWheel(){const e=this.options.engine(),q=QUICK_ITEMS.find(q=>q.id===this.preview);for(const b of this.root.querySelectorAll('[data-quick]')){const sel=b.dataset.quick===q.id;b.classList.toggle('active',sel);b.setAttribute('aria-pressed',String(sel));b.classList.toggle('empty',e.s.inventory[b.dataset.quick]===0);}
  for(const span of this.root.querySelectorAll('[data-stock]'))span.textContent=e.s.inventory[span.dataset.stock];
  this.root.querySelector('#wheelCurrent').textContent=q.name;this.root.querySelector('#wheelDescription').textContent=q.detail;this.root.querySelector('#wheelRecipe').textContent='RECETTE : '+q.cost;this.root.querySelector('#wheelSymbol').textContent=q.id==='medkit'?'+':q.id==='noise'?'◎':q.id==='flare'?'✦':'ϟ';
 }
 update(){const e=this.options.engine(),s=e.s,visible=this.valid();if(this.opened&&(!visible||e.paused))this.close();
  this.slot.hidden=!visible||this.opened;this.status.hidden=!visible||this.opened||!s.tools.tracker;this.captions.hidden=!visible||!this.options.captions()||this.opened;
  if(visible){const q=QUICK_ITEMS.find(q=>q.id===s.signals.selected);this.slot.innerHTML=`<span>${q.key} / ${s.inventory[q.id]} EN RÉSERVE</span><strong>${q.name}</strong><small>TAB : CHOISIR · CLIC DROIT : UTILISER</small>`;
   const swap=e.signals.swap,charge=Math.ceil(s.signals.charge);this.status.classList.toggle('low',charge<=20);this.status.innerHTML=`<span>DÉTECTEUR / ${s.signals.silent?'SILENCIEUX':'HAUT-PARLEUR ACTIF'}</span><strong>${swap?'PILE · '+Math.floor(100*swap.progress/e.signals.cfg.swapTime)+' %':charge+' %'+(s.tracker?' · BALAYAGE':' · RANGÉ')}</strong><div class="signal-meter"><i style="width:${charge}%"></i></div><small>${swap?'MAINTENIR Y · RESTER IMMOBILE':'R : LIRE · K : SON · Y MAINTENU : PILE'}</small>`;
   this.captions.innerHTML=e.signals.cues.map(c=>`<div><span>♪</span> ${c.label.toUpperCase()} <small>${c.side}</small></div>`).join('');
  }if(this.opened)this.updateWheel();
 }
}
