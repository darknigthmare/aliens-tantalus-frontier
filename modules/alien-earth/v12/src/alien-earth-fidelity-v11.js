import { EARTH_DATA } from './alien-earth-data.js';
export function initialFidelityV11(){return {joeWeapon:'mcsx',maximShots:0};}
export function upgradeFidelityV11(s,raw){
 s.schema=11;s.version=EARTH_DATA.version;s.fidelityV11=initialFidelityV11();
 if(raw.schema<11)return s;
 const q=raw.fidelityV11;if(!q||typeof q!=='object'||Array.isArray(q))throw Error('Registre de fidélité V11 absent.');
 if(!['mcsx','maxim9'].includes(q.joeWeapon))throw Error('Arme secondaire Joe inconnue.');
 if(!Number.isInteger(q.maximShots)||q.maximShots<0||q.maximShots>999999)throw Error('Compteur Maxim 9 invalide.');
 s.fidelityV11={joeWeapon:q.joeWeapon,maximShots:q.maximShots};return s;
}
export function withEarthFidelityV11(Base,{clone}){
 return class EarthFidelityV11Engine extends Base{
  get fidelity11(){return this.state.fidelityV11;}
  get weaponId(){
   const inherited=super.weaponId;
   if(['ksg-al','cutter'].includes(inherited))return inherited;
   if(this.character.id==='joe')return this.fidelity11?.joeWeapon||'mcsx';
   return inherited;
  }
  get weaponCaption(){
   if(this.weaponId==='maxim9')return 'MAXIM 9 · SIDEARM PRODIGY';
   if(this.weaponId==='mcsx')return 'MCS-X · PRODIGY';
   if(this.weaponId==='wy-pistol')return 'PISTOLET MAGINOT · GLOCK/P80 MOD.';
   return super.weaponCaption;
  }
  cycleWeapon(){
   if(this.character.id!=='joe')return super.cycleWeapon();
   if(this.pending||this.dead||this.state.finished||!this.handsFree()||this.serviceAction||this.reloadTime>0)return false;
   this.fidelity11.joeWeapon=this.fidelity11.joeWeapon==='mcsx'?'maxim9':'mcsx';
   this.emit('toast',{text:this.weaponCaption});this.emit('save');return true;
  }
  fire(){const before=this.player.ammo,ok=super.fire();if(ok&&this.weaponId==='maxim9'&&this.player.ammo<before){this.fidelity11.maximShots++;this.emit('save');}return ok;}
  advanceChapter(){const old=this.fidelity11?.joeWeapon;const out=super.advanceChapter();if(this.fidelity11&&this.character.id!=='joe')this.fidelity11.joeWeapon=old||'mcsx';return out;}
  restartCheckpoint(){const remembered=clone(this.fidelity11);super.restartCheckpoint();this.state.fidelityV11=remembered;}
 };
}
