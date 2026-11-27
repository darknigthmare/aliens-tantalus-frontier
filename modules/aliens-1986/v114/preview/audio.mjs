/* Optional, original procedural feedback. Silent until explicitly enabled.
   No external samples, copyrighted audio or network calls. */
export class SoundBus {
 constructor(){this.enabled=false;this.ctx=null;this.master=null;this.lastSeq=0;this.paused=true;}
 async enable(value){this.enabled=Boolean(value);try{if(this.enabled&&!this.ctx){const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC){this.enabled=false;return false;}this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.16;this.master.connect(this.ctx.destination);}if(this.ctx&&this.enabled)await this.ctx.resume();if(this.master)this.master.gain.value=this.enabled&&!this.paused?.16:0;return this.enabled;}catch{this.enabled=false;return false;}}
 setPaused(value){this.paused=Boolean(value);if(this.master)this.master.gain.value=this.enabled&&!this.paused?.16:0;}
 cue(kind){if(!this.enabled||this.paused||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,t=c.currentTime,g=c.createGain();g.connect(this.master);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(kind==='shot'?.35:.16,t+.007);g.gain.exponentialRampToValueAtTime(.001,t+(kind==='hatch'?.34:.11));const o=c.createOscillator();o.type=['shot','breach','weld'].includes(kind)?'sawtooth':'sine';o.frequency.setValueAtTime(kind==='tracker'?850:kind==='shot'?110:kind==='footstep'?64:kind==='breach'?58:kind==='weld'?320:160,t);o.frequency.exponentialRampToValueAtTime(kind==='tracker'?750:36,t+.12);o.connect(g);o.start(t);o.stop(t+.35);o.onended=()=>{o.disconnect();g.disconnect();};}
 consume(s){if(!s?.contacts)return;for(const n of s.contacts.noises)if(n.seq>this.lastSeq&&n.roomId===s.roomId&&s.elapsed-n.at<.22)this.cue(n.kind==='hatch'&&s.engineering?.attacks&&Object.hasOwn(s.engineering.attacks,n.source)?'breach':n.source.startsWith('engineering:')?'weld':n.kind);this.lastSeq=s.contacts.serial;}
 reset(s){this.lastSeq=s?.contacts?.serial||0;}
}
