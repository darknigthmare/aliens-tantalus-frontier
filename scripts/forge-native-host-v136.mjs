// Uses the real production classes. DOM, images and RAF are explicit test doubles.
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';
export function hostV136() {
  const events = new EventTarget();
  for (const key of ['addEventListener','removeEventListener','dispatchEvent']) globalThis[key] = events[key].bind(events);
  globalThis.document = Object.assign(new EventTarget(), {hidden:false, activeElement:null, hasFocus:()=>true});
  globalThis.Image = class extends EventTarget {
    complete=true; naturalWidth=1024; naturalHeight=1024; width=1024; height=1024;
    async decode(){} set src(v){this._src=v;queueMicrotask(()=>this.dispatchEvent(new Event('load')));}get src(){return this._src;}
  };
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  const ctx = new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const canvas=Object.assign(new EventTarget(), {width:1280,height:720,style:{},getContext:()=>ctx,
    focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720}),
    setPointerCapture(){},hasPointerCapture(){return false;},releasePointerCapture(){}});
  return {canvas, events};
}
export function missionV136(extra={}) {
  const host=hostV136(), messages=[];
  const engine=new GameEngine(host.canvas, {onEvent:e=>messages.push(e)});
  const options={world:WORLDS[0],campaign:CAMPAIGNS[0],weapon:WEAPONS[0],enemyCatalog:ENEMIES.slice(0,1),equipment:[],crew:[],seed:426,...extra};
  engine.start(options);return {engine, options, messages, ...host};
}
