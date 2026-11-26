/* Local accessibility and verified save writes. No network and no game-state mutation. */
(function(root){'use strict';
const ACTIONS=[
 ['left','Gauche','Déplacement','ArrowLeft',['ArrowLeft','KeyA','KeyQ']],
 ['right','Droite','Déplacement','ArrowRight',['ArrowRight','KeyD']],
 ['up','Vers le fond','Déplacement','ArrowUp',['ArrowUp','KeyW','KeyZ']],
 ['down','Vers le premier plan','Déplacement','ArrowDown',['ArrowDown','KeyS']],
 ['run','Courir','Déplacement','ShiftLeft',['ShiftLeft','ShiftRight']],
 ['crouch','S’accroupir','Déplacement','KeyC',['KeyC']],
 ['dodge','Esquiver','Déplacement','ControlLeft',['ControlLeft','ControlRight']],
 ['use','Interagir / outil sélectionné','Terrain','KeyE',['KeyE']],
 ['focus','Empathie','Terrain','Space',['Space']],
 ['repair','Réparer un brancard','Terrain','KeyK',['KeyK']],
 ['shutter','Manœuvrer une cloison','Terrain','KeyG',['KeyG']],
 ['lamp','Lampe','Terrain','KeyL',['KeyL']],
 ['tracker','Détecteur','Terrain','KeyT',['KeyT']],
 ['sensor','Poser / reprendre un capteur','Terrain','KeyP',['KeyP']],
 ['reload','Recharger','Équipement','KeyR',['KeyR']],
 ['pistol','Pistolet','Équipement','Digit1',['Digit1']],
 ['foam','Mousse','Équipement','Digit2',['Digit2']],
 ['flame','Lance-flammes','Équipement','Digit3',['Digit3']],
 ['decoy','Lancer un leurre','Équipement','KeyF',['KeyF']],
 ['heal','Utiliser un soin','Équipement','KeyH',['KeyH']],
 ['filter','Remplacer le filtre','Équipement','KeyX',['KeyX']],
 ['companion','Rappeler / arrêter Manning','Équipe','KeyV',['KeyV']],
 ['rally','Position de Manning au viseur','Équipe','KeyY',['KeyY']],
 ['fireMode','Discipline de tir de Manning','Équipe','KeyN',['KeyN']],
 ['convoy','Arrêter / repartir avec le convoi','Équipe','KeyB',['KeyB']],
 ['wheel','Roue tactique','Menus','KeyO',['KeyO']],
 ['map','Carte','Menus','Tab',['Tab']],
 ['codex','Dossiers','Menus','KeyJ',['KeyJ']],
 ['inventory','Équipement','Menus','KeyI',['KeyI']],
 ['journal','Journal de terrain','Menus','KeyU',['KeyU']],
 ['presentation','Changer de présentation','Menus','F6',['F6']]
].map(([id,label,group,code,keys])=>Object.freeze({id,label,group,code,keys:Object.freeze(keys)}));
const clone=x=>JSON.parse(JSON.stringify(x));
const legalCode=c=>typeof c==='string'&&/^(Key[A-Z]|Digit[0-9]|Arrow(Left|Right|Up|Down)|Space|Tab|Shift(Left|Right)|Control(Left|Right)|F[6-9]|F10|Backquote|Minus|Equal|Bracket(Left|Right)|Backslash|Semicolon|Quote|Comma|Period|Slash|Numpad[0-9])$/.test(c);
function labelCode(c){return ({ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Espace',Tab:'Tab',ShiftLeft:'Maj G',ShiftRight:'Maj D',ControlLeft:'Ctrl G',ControlRight:'Ctrl D',Backquote:'`',Minus:'−',Equal:'=',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/'})[c]||c.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'Pavé ');}
class Bindings{
 constructor(saved){this.reset();if(saved)this.load(saved);}
 reset(){this.map=Object.fromEntries(ACTIONS.map(a=>[a.id,[...a.keys]]));this.names={};}
 load(saved){
  if(!saved||saved.version!==1||!saved.map||typeof saved.map!=='object')return false;
  const map={},used=new Set(),names={};
  for(const a of ACTIONS){const arr=saved.map[a.id];if(!Array.isArray(arr)||arr.length<1||arr.length>3)return false;
   for(const c of arr){if(!legalCode(c)||used.has(c))return false;used.add(c);}
   map[a.id]=arr.slice();
  }
  if(Object.keys(saved.map).length!==ACTIONS.length)return false;
  if(saved.names&&typeof saved.names==='object')for(const [k,v]of Object.entries(saved.names))if(used.has(k)&&typeof v==='string'&&v.length<=24&&!/[\x00-\x1f<>]/.test(v))names[k]=v;
  this.map=map;this.names=names;return true;
 }
 export(){return {version:1,map:clone(this.map),names:{...this.names}};}
 action(code){return ACTIONS.find(a=>this.map[a.id].includes(code))||null;}
 canonical(code){return this.action(code)?.code||null;}
 assign(id,code,label=''){
  const a=ACTIONS.find(a=>a.id===id);if(!a||!legalCode(code))return {ok:false,message:'Touche réservée au navigateur ou aux menus. Choisissez une lettre, un chiffre ou une touche autorisée.'};
  const other=this.action(code);if(other&&other.id!==id)return {ok:false,message:'Cette touche est déjà affectée à « '+other.label+' ». Choisissez une autre touche.'};
  const old=this.map[id];this.map[id]=[code];for(const c of old)delete this.names[c];
  if(typeof label==='string'&&label.trim()&&label.length<=24&&!/[\x00-\x1f<>]/.test(label))this.names[code]=label.length===1?label.toUpperCase():label;
  return {ok:true};
 }
 label(id){return (this.map[id]||[]).map(c=>this.names[c]||labelCode(c)).join(' / ');}
 primary(id){return this.map[id]?.map(c=>this.names[c]||labelCode(c))[0]||'?';}
}
class Keyboard{
 constructor(bindings){this.bindings=bindings;this.pressed=new Map();this.suppressed=new Set();}
 press(raw){if(this.suppressed.has(raw))return null;const canonical=this.bindings.canonical(raw);if(canonical)this.pressed.set(raw,canonical);return canonical;}
 release(raw){this.pressed.delete(raw);this.suppressed.delete(raw);}
 has(code){return [...this.pressed.values()].includes(code);}
 rearm(){for(const k of this.pressed.keys())this.suppressed.add(k);this.pressed.clear();}
 suppress(raw){this.pressed.delete(raw);this.suppressed.add(raw);}
}
class SaveVault{
 constructor(storage,key,validate){this.storage=typeof storage==='function'?storage:()=>storage;this.key=key;this.backupKey=key+'.last-valid';this.validate=validate;this.last={ok:false,message:'Aucune écriture effectuée dans cette session.'};}
 valid(raw){if(typeof raw!=='string'||raw.length>2000000)return false;try{return this.validate(raw)===true;}catch(e){return false;}}
 primary(){try{return this.storage().getItem(this.key);}catch(e){return null;}}
 inspect(){try{const s=this.storage(),p=s.getItem(this.key),b=s.getItem(this.backupKey);return {available:true,current:this.valid(p),backup:this.valid(b),currentPresent:p!==null,backupPresent:b!==null,raw:p,backupRaw:b};}catch(e){return {available:false,current:false,backup:false,raw:null,backupRaw:null};}}
 write(raw){
  const fail=message=>(this.last={ok:false,message});
  if(!this.valid(raw))return fail('État refusé : aucun fichier de sauvegarde n’a été remplacé.');
  try{
   const s=this.storage(),old=s.getItem(this.key);
   const oldValid=this.valid(old),backup=s.getItem(this.backupKey);
   if(old===raw&&this.valid(backup))return this.last={ok:true,message:'Copie locale relue et conforme.',unchanged:true};
   const protectedCopy=oldValid?old:this.valid(backup)?backup:raw;
   if(backup!==protectedCopy){s.setItem(this.backupKey,protectedCopy);if(s.getItem(this.backupKey)!==protectedCopy)return fail('Copie de sécurité non vérifiée. L’écriture courante a été annulée.');}
   s.setItem(this.key,raw);
   if(s.getItem(this.key)!==raw)return fail('Écriture locale non confirmée. La copie de sécurité reste disponible ; exportez votre partie.');
   return this.last={ok:true,message:'Copie locale relue et conforme.',unchanged:false};
  }catch(e){return fail('Stockage indisponible ou plein. Exportez la partie ; les copies déjà valides ne sont pas effacées.');}
 }
}
const API={ACTIONS,Bindings,Keyboard,SaveVault,legalCode,labelCode};if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SoSSupport=API;
})(typeof globalThis!=='undefined'?globalThis:this);
