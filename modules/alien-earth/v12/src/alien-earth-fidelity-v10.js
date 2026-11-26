import { EARTH_DATA } from './alien-earth-data.js';
export function initialFidelityGearV10(){return {observedCutter:false,cutterIntact:true,ksgOwned:false,arc:0,foam:0,selected:'default',foamUntil:{},shots:0};}
export function upgradeFidelityV10(s,raw){
 s.schema=10;s.version=EARTH_DATA.version;s.fidelityGear=initialFidelityGearV10();
 if(raw.schema<10)return s;
 const q=raw.fidelityGear;
 if(!q||typeof q!=='object'||Array.isArray(q))throw Error('Registre de dotation V10 absent.');
 for(const k of ['observedCutter','cutterIntact','ksgOwned'])if(typeof q[k]!=='boolean')throw Error('État de dotation invalide : '+k);
 for(const [k,max] of [['arc',6],['foam',3],['shots',999999]])if(!Number.isInteger(q[k])||q[k]<0||q[k]>max)throw Error('Réserve de dotation invalide : '+k);
 if(q.observedCutter!==s.completed.includes('AE-58')||q.ksgOwned!==s.completed.includes('AE-62'))throw Error('Dotation sans prise acquise sur place.');
 if((!q.ksgOwned&&(q.arc||q.foam))||(!q.observedCutter&&!q.cutterIntact))throw Error('État de matériel non acquis.');
 if(!['default','cutter','ksg-al'].includes(q.selected))throw Error('Sélection de dotation inconnue.');
 if(q.selected==='ksg-al'&&(!q.ksgOwned||s.chapter!==4)||q.selected==='cutter'&&(!q.observedCutter||s.chapter!==2))throw Error('Dotation incompatible avec ce point de vue.');
 s.fidelityGear={...Object.fromEntries(Object.keys(initialFidelityGearV10()).filter(k=>k!=='foamUntil').map(k=>[k,q[k]])),foamUntil:{}};
 if(!q.foamUntil||typeof q.foamUntil!=='object'||Array.isArray(q.foamUntil))throw Error('Registre de mousse invalide.');
 const ids=new Set(EARTH_DATA.rooms.flatMap(r=>r.enemies.map(e=>e.id)));
 for(const [id,t] of Object.entries(q.foamUntil)){if(!ids.has(id)||!Number.isFinite(t)||t<0||t>s.playSeconds+6.01)throw Error('Immobilisation inconnue ou future.');if(t>s.playSeconds)s.fidelityGear.foamUntil[id]=t;}
 return s;
}
/** Optional equipment obeys the same local collision / carrying / gallery rules as the inherited weapons. */
export function withEarthFidelityV10(Base,{visible,clone}){
 return class EarthFidelityEngine extends Base{
  get gear(){return this.state.fidelityGear;}
  get weaponId(){return this.gear?.selected==='ksg-al'?'ksg-al':this.gear?.selected==='cutter'?'cutter':this.character.id==='joe'?'mcsx':this.character.id==='morrow'?'wy-pistol':'none';}
  get weaponCaption(){const id=this.weaponId;return id==='ksg-al'?`KSG-AL · ARC ${this.gear.arc} / MOUSSE ${this.gear.foam}`:id==='cutter'?(this.gear.cutterIntact?'LAME DE MASSICOT':'LAME DISSOUTE'):id==='mcsx'?'MCS-X':id==='wy-pistol'?'PISTOLET WY':'MAINS LIBRES';}
  completeGoal(id){const ok=super.completeGoal(id);if(ok){if(id==='AE-58'){this.gear.observedCutter=true;this.emit('toast',{text:'Massicot repéré. La lame sera disponible pendant le sauvetage, pas dans le prologue.'});}if(id==='AE-62'){this.gear.ksgOwned=true;this.gear.arc=6;this.gear.foam=3;this.emit('toast',{text:'KSG-AL récupéré : 6 charges d’arc et 3 de mousse. 6 change de dotation ; 7 projette la mousse.'});}this.emit('save');}return ok;}
  advanceChapter(){const before=this.state.chapter,old=this.gear.selected;this.gear.selected='default';const out=super.advanceChapter();if(this.state.chapter===before&&!this.state.finished)this.gear.selected=old;return out;}
  cycleWeapon(){if(this.pending||this.dead||this.state.finished||!this.handsFree()||this.serviceAction||this.reloadTime>0)return false;
   const special=this.state.chapter===4&&this.gear.ksgOwned?'ksg-al':this.state.chapter===2&&this.gear.observedCutter?'cutter':null;
   if(!special){this.emit('toast',{text:'Aucune autre dotation acquise pour ce personnage à ce moment du récit.'});return false;}
   this.gear.selected=this.gear.selected==='default'?special:'default';this.emit('toast',{text:this.weaponCaption});this.emit('save');return true;
  }
  fidelityActionAllowed(){return !this.dead&&!this.state.finished&&!this.pending&&!this.hold&&!this.serviceAction&&!this.actionV3&&!this.room.duct&&this.handsFree(true)&&this.fireCooldown<=0&&this.reloadTime<=0;}
  equipmentTarget(range){return this.enemies.filter(e=>e.kind!=='eye_caged'&&e.kind!=='orchid'&&(e.x-this.player.x)*this.player.facing>=-8&&Math.abs(e.x-this.player.x)<range&&Math.abs(e.z-this.player.z)<26&&visible(this.room,this.player,e)).sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0];}
  fire(){
   if(this.weaponId!=='ksg-al'&&this.weaponId!=='cutter')return super.fire();
   if(!this.fidelityActionAllowed())return false;
   if(this.weaponId==='cutter'){
    if(!this.gear.cutterIntact||this.player.energy<18)return false;
    this.player.energy-=18;this.fireCooldown=.75;const e=this.equipmentTarget(125);
    this.effects.push({kind:'blade-v10',x:this.player.x,z:this.player.z,ttl:.35});
    if(e){e.stun=Math.max(e.stun,2.5);if(e.kind.startsWith('xeno')){this.gear.cutterIntact=false;this.emit('toast',{text:'Le contact acide a dissous la lame. Il faut se dégager.'});}}
    this.emit('save');return true;
   }
   if(this.gear.arc<=0){this.emit('toast',{text:'Réserve d’arc épuisée.'});return false;}
   this.gear.arc--;this.gear.shots++;this.fireCooldown=.9;const e=this.equipmentTarget(480);
   if(e)e.stun=Math.max(e.stun,3.5);
   this.noise={x:this.player.x,z:this.player.z,ttl:.65,radius:520};
   let endpoint={x:this.player.x,z:this.player.z}; if(e)endpoint=e;else for(let d=10;d<=300;d+=10){const next={x:this.player.x+this.player.facing*d,z:this.player.z};if(next.x<35||next.x>this.room.width-35||!visible(this.room,this.player,next))break;endpoint=next;}
   this.effects.push({kind:'arc-v10',x:this.player.x,z:this.player.z,toX:endpoint.x,toZ:endpoint.z,ttl:.3});
   this.emit('save');return true;
  }
  fireFoam(){
   if(this.weaponId!=='ksg-al'||!this.fidelityActionAllowed()||this.gear.foam<=0)return false;
   const e=this.equipmentTarget(360);if(!e||e.stun<=.25){this.emit('toast',{text:'La mousse exige un organisme déjà immobilisé, visible et dans le même plan.'});return false;}
   this.gear.foam--;this.gear.foamUntil[e.id]=this.state.playSeconds+6;e.stun=Math.max(e.stun,6);this.fireCooldown=1.2;this.gear.shots++;
   this.emit('toast',{text:'Mousse appliquée : maintien temporaire, pas une capture en enceinte.'});this.emit('save');return true;
  }
  reload(){if(this.weaponId==='ksg-al'||this.weaponId==='cutter')return false;return super.reload();}
  restartCheckpoint(){const remembered=clone(this.gear);super.restartCheckpoint();this.state.fidelityGear=remembered;if(this.state.chapter!==4&&remembered.selected==='ksg-al'||this.state.chapter!==2&&remembered.selected==='cutter')remembered.selected='default';}
  update(dt,input={}){super.update(dt,input);if(this.gear)for(const [id,t] of Object.entries(this.gear.foamUntil))if(t<=this.state.playSeconds)delete this.gear.foamUntil[id];}
 };
}
