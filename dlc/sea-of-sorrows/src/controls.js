/* Deterministic input normalization. No DOM, no game state, no dependency. */
(function(root){'use strict';
const finite=v=>Number.isFinite(v)?v:0;
function stick(x,y,dead=.2){
 x=Math.max(-1,Math.min(1,finite(x)));y=Math.max(-1,Math.min(1,finite(y)));
 const m=Math.hypot(x,y);if(m<=dead)return {x:0,y:0};
 const scaled=(Math.min(m,1)-dead)/(1-dead);return {x:x/m*scaled,y:y/m*scaled};
}
const idle=()=>({connected:false,active:false,blocked:false,buttons:Array(17).fill(false),edges:Array(17).fill(false),move:{x:0,y:0},aim:{x:0,y:0},disconnected:false});
class PadInput{
 constructor(){this.connected=false;this.identity=null;this.previous=Array(17).fill(false);this.waitNeutral=true;}
 rearm(){this.waitNeutral=true;this.previous=Array(17).fill(false);}
 read(raw){
  if(!raw||raw.connected===false||raw.mapping!=='standard'){
   const result=idle();result.disconnected=this.connected;result.unsupported=!!raw&&raw.mapping!=='standard';
   this.connected=false;this.identity=null;this.rearm();return result;
  }
  const identity=String(raw.index)+':'+String(raw.id);
  if(identity!==this.identity){this.rearm();this.identity=identity;}
  this.connected=true;
  const buttons=Array.from({length:17},(_,i)=>{const b=raw.buttons?.[i];return !!(b&& (b.pressed===true||finite(b.value)>.5));});
  const move=stick(raw.axes?.[0],raw.axes?.[1]),aim=stick(raw.axes?.[2],raw.axes?.[3]);
  const active=buttons.some(Boolean)||!!(move.x||move.y||aim.x||aim.y);
  if(this.waitNeutral){if(!active)this.waitNeutral=false;this.previous=buttons;return {...idle(),connected:true,blocked:active};}
  const edges=buttons.map((b,i)=>b&&!this.previous[i]);this.previous=buttons;
  return {connected:true,active,blocked:false,buttons,edges,move,aim,disconnected:false};
 }
}
function wheelIndex(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||Math.hypot(x,y)<.3)return null;return (Math.round(Math.atan2(x,-y)/(Math.PI/4))+8)%8;}
const API={PadInput,stick,wheelIndex};if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SoSControls=API;
})(typeof globalThis!=='undefined'?globalThis:this);
