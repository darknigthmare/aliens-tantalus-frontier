import * as B from '../src/beacons-v114.mjs';
/* Canvas lighting generated from the same occluded world-space beam as perception.
   No external art, media request, canvas readback or replacement gameplay layer. */
import * as L from '../src/lighting-v114.mjs';
import {distance,trace} from '../src/spatial-core-v108.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function path(c,points,renderer,lift=0){if(!points.length)return;c.beginPath();for(let i=0;i<points.length;i++){const p=renderer.project(points[i]);if(i===0)c.moveTo(p.x,p.y-lift);else c.lineTo(p.x,p.y-lift);}c.closePath();}
export function renderLighting(renderer,world,session){if(!session?.lighting)return;const c=renderer.c,p=session.team[0],on=L.powered(world),torch=L.beamOrigin(session,world);
 // Nominal lighting preserves V110 contrast. Emergency light remains legible,
 // but recognition is controlled by the simulation, not display brightness.
 if(on){for(const beacon of B.active(session,world)){const a=renderer.project(beacon);c.save();path(c,B.polygon(world,beacon),renderer,8);c.clip();const g=c.createRadialGradient(a.x,a.y-8,0,a.x,a.y-8,B.RULES.radius);g.addColorStop(0,'#f0c58228');g.addColorStop(1,'#e8cf9000');c.fillStyle=g;c.fillRect(a.x-240,a.y-248,480,480);c.restore();}if(torch){const a=renderer.project(p),poly=L.beamPolygon(session,world);c.save();path(c,poly,renderer,33);c.clip();const g=c.createRadialGradient(a.x,a.y-33,0,a.x,a.y-33,470);g.addColorStop(0,'#e7e6c61a');g.addColorStop(.8,'#e0e3bd0a');g.addColorStop(1,'#e0e3bd00');c.fillStyle=g;c.fillRect(0,0,1280,720);c.restore();}return;}
 if(!renderer.lightMask){renderer.lightMask=document.createElement('canvas');renderer.lightMask.width=1280;renderer.lightMask.height=720;}
 const m=renderer.lightMask.getContext('2d');m.clearRect(0,0,1280,720);m.globalCompositeOperation='source-over';m.fillStyle=renderer.highContrast?'rgba(1,8,13,.77)':'rgba(1,8,13,.88)';m.fillRect(0,0,1280,720);
 const a=renderer.project(p);m.globalCompositeOperation='destination-out';
 // Proximity reading is intentional, matching the short-range perception rule.
 let g=m.createRadialGradient(a.x,a.y-20,20,a.x,a.y-20,130);g.addColorStop(0,'rgba(255,255,255,.46)');g.addColorStop(.65,'rgba(255,255,255,.24)');g.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=g;m.fillRect(a.x-145,a.y-165,290,290);
 if(torch){const poly=L.beamPolygon(session,world,64);m.save();path(m,poly,renderer,33);m.clip();g=m.createRadialGradient(a.x,a.y-33,0,a.x,a.y-33,520);g.addColorStop(0,'rgba(255,255,255,.97)');g.addColorStop(.62,'rgba(255,255,255,.84)');g.addColorStop(1,'rgba(255,255,255,.45)');m.fillStyle=g;m.fillRect(0,0,1280,720);m.restore();}
 for(const beacon of B.active(session,world)){const q=renderer.project(beacon),power=B.strength(session,beacon);m.save();path(m,B.polygon(world,beacon),renderer,8);m.clip();g=m.createRadialGradient(q.x,q.y-8,0,q.x,q.y-8,B.RULES.radius);g.addColorStop(0,`rgba(255,255,255,${.93*power})`);g.addColorStop(.62,`rgba(255,255,255,${.61*power})`);g.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=g;m.fillRect(q.x-240,q.y-248,480,480);m.restore();}
 // Visible muzzle flashes illuminate just their local surface, briefly.
 for(const n of session.contacts.noises){if(n.roomId!==world.scene.id||n.kind!=='shot'||session.elapsed-n.at>L.RULES.flashTime)continue;const q=renderer.project(n);g=m.createRadialGradient(q.x,q.y-42,4,q.x,q.y-42,145);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=g;m.fillRect(q.x-145,q.y-187,290,290);}
 if(session.action&&['brace','cut-brace','repair-hatch'].includes(session.action.kind)){g=m.createRadialGradient(a.x,a.y-45,8,a.x,a.y-45,100);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=g;m.fillRect(a.x-100,a.y-145,200,200);}
 m.globalCompositeOperation='source-over';c.drawImage(renderer.lightMask,0,0);
 if(torch){c.save();const poly=L.beamPolygon(session,world,64);path(c,poly,renderer,33);c.clip();g=c.createRadialGradient(a.x,a.y-33,8,a.x,a.y-33,510);g.addColorStop(0,'#edead820');g.addColorStop(.7,'#c5dce912');g.addColorStop(1,'#c1d9e802');c.fillStyle=g;c.fillRect(0,0,1280,720);c.restore();}
 for(const beacon of B.active(session,world)){const q=renderer.project(beacon);c.save();path(c,B.polygon(world,beacon),renderer,8);c.clip();g=c.createRadialGradient(q.x,q.y-8,0,q.x,q.y-8,B.RULES.radius);g.addColorStop(0,'#eed19735');g.addColorStop(1,'#e2bf6500');c.fillStyle=g;c.fillRect(q.x-240,q.y-248,480,480);c.restore();}
 // Emergency guidance is a graphic sign only: it never reveals contacts or
 // authorises a shot through a dark/opaque surface.
 c.save();for(const ctrl of world.scene.controls.filter(c=>c.circuit==='service')){if(distance(p,ctrl)>110)continue;const q=renderer.project(ctrl);c.fillStyle='#c8a86c';c.fillRect(q.x-4,q.y-60,8,3);c.font='10px monospace';c.textAlign='center';c.fillText('K · ÉCLAIRAGE',q.x,q.y-74);}c.restore();
}
