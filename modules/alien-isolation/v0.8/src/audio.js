/** Procedural, optional sound layer. No samples/voices from the commercial game. */
export class IsolationAudio{
 constructor(){this.context=null;this.master=null;this.hum=null;this.on=false;this.level=.45;this.owner=null;this.cursor=0;this.lastDistance=0;this.lastPing=0;this.active=false;}
 configure(on,volume=45){this.on=!!on;this.level=Math.max(0,Math.min(1,volume/100));if(on&&!this.context){const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)return false;try{this.context=new AC();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);this.hum=this.context.createOscillator();const g=this.context.createGain();g.gain.value=.15;this.hum.frequency.value=47;this.hum.type='sine';this.hum.connect(g);g.connect(this.master);this.hum.start();}catch{return false;}}if(this.context){if(on)this.context.resume().catch(()=>{});this.master.gain.setTargetAtTime(on&&this.active?this.level*.13:0,this.context.currentTime,.12);}return !!this.context;}
 tone(frequency,duration=.12,pan=0,amount=.3,type='sine'){if(!this.context||!this.on||!this.active)return;const c=this.context,t=c.currentTime,o=c.createOscillator(),gain=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(Math.max(.0001,amount),t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(gain);let p=null;if(c.createStereoPanner){p=c.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));gain.connect(p);p.connect(this.master);}else gain.connect(this.master);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();gain.disconnect();p?.disconnect();};}
 update(engine,active){if(this.owner!==engine){this.owner=engine;this.cursor=engine.events.length;this.lastDistance=engine.s.stats.distance;}
  if(this.active!==active){this.active=active;if(this.master)this.master.gain.setTargetAtTime(active&&this.on?this.level*.13:0,this.context.currentTime,.15);}
  const s=engine.s;if(active&&s.stats.distance-this.lastDistance>(s.crouched?160:95)){this.lastDistance=s.stats.distance;this.tone(s.crouched?95:130,.055,0,s.crouched?.09:.22,'triangle');}
  for(const ev of engine.events.slice(this.cursor)){
   const near=!ev.room||ev.room===s.room;if(!near)continue;
   if(ev.type==='scanner-ping')this.tone(760,.09,0,.36);
   if(ev.type==='scanner-reload'||ev.type==='scanner-dock')this.tone(520,.16,0,.2);
   if(ev.type==='perceived-sound'&&ev.label.startsWith('Pas'))this.tone(ev.label==='Pas lourds'?70:105,.11,ev.side==='À GAUCHE'?-.6:ev.side==='À DROITE'?.6:0,.10,'triangle');
   if(ev.type==='alien-cue')this.tone(83,.65,s.alien.x<s.x?-.65:.65,.35,'sawtooth');
   if(ev.type==='item-thrown')this.tone(ev.kind==='emp'?1150:380,.1,Math.sign(ev.x-s.x)*.65,.25,'triangle');
   if(ev.type==='escape-warning'||ev.type==='thermal-overload'||ev.type==='oxygen-warning'){this.tone(330,.5,0,.3,'triangle');this.tone(660,.25,0,.12);}
   if(ev.type==='airlock-ready'||ev.type==='oxygen-refill')this.tone(650,.24,0,.22);if(ev.type==='item-activated')this.tone(ev.kind==='emp'?150:570,.18,Math.sign(ev.x-s.x)*.5,.2);if(ev.type==='containment-verified')this.tone(540,.28,0,.22);if(ev.type==='transition')this.tone(62,.45,0,.15,'triangle');
  }
  this.cursor=engine.events.length;

 }
}
