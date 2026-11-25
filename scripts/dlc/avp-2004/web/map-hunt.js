
/* A schematic, not a claimed topographic reconstruction of the film. */
(function(G){'use strict';const D=G.AVP_DATA,C=G.AVP_CORE;
const groups={
 ship:{label:'Piper Maru',rows:[['brief','maru','gear','bridge']]},
 surface:{label:'Station & banquise',rows:[['tower','dormitory','mess'],['landing','station','office','workshop','infirmary','engine','tanks','icebattle','elder'],['bore','cellar']]},
 pyramid:{label:'Pyramide',rows:[['forecourt','vestibule','sacrifice','ossuary','weapons','weights','cloister','astrarium','balcony'],['shaft','pivot','press','duel','glyphs','refuge','trophies','hunter','incubator','eggworks','drain','gantry'],['service','nursery','cocoonhall','queenhold']]}
};
const positions={},regionOf={};
for(const [key,g] of Object.entries(groups))for(const [j,row] of g.rows.entries())for(const [i,id] of row.entries()){
 const x=170+(i+(12-row.length)/2)*194,y=135+j*220;
 positions[id]={x,y};regionOf[id]=key;
}
const esc=s=>String(s??'').replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
function knownRooms(g){const visited=new Set(g.s.visited),known=new Set(visited);for(const id of visited)for(const d of C.ROOMS.get(id)?.doors||[])known.add(d.to);return {visited,known};}
function build(g,key){
 const group=groups[key]||groups[regionOf[g.s.room]||'ship'],actualKey=Object.keys(groups).find(k=>groups[k]===group),{visited,known}=knownRooms(g),height=group.rows.length*220+65,width=2578;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="group" aria-label="Relevé schématique des passages : ${esc(group.label)}">`;
 svg+='<defs><pattern id="mapgrid4" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#7d9d8a11"/></pattern></defs>';
 svg+=`<rect width="${width}" height="${height}" fill="#102933"/><rect width="${width}" height="${height}" fill="url(#mapgrid4)"/>`;
 for(const [i,row] of group.rows.entries()){const room=C.ROOMS.get(row[0]),floor=room.floor;svg+=`<path d="M25 ${185+i*220}H${width-25}" stroke="#a2b8a326"/><text x="22" y="${138+i*220}" fill="#a2b7a4" font-family="system-ui" font-size="13">${floor>0?'+':''}${floor}</text>`;}
 const links=new Set();let n=0;
 for(const r of D.rooms.filter(r=>known.has(r.id)&&regionOf[r.id]===actualKey))for(const d of r.doors){
  if(!known.has(d.to))continue;const id=[r.id,d.to].sort().join(':');if(links.has(id))continue;links.add(id);
  const a=positions[r.id],b=positions[d.to],foreign=regionOf[d.to]!==actualKey;
  if(!a)continue;
  if(foreign){svg+=`<text x="${a.x}" y="${a.y+67}" fill="#d6c18c" text-anchor="middle" font-size="12" font-family="system-ui">↗ ${esc(groups[regionOf[d.to]]?.label||'Passage')}</text>`;continue;}
  const portal=g.portalFor(d),memory=portal&&g.s.portalMemory[portal.id],structural=g.structuralGate(d),closed=memory?.status==='closed'||memory?.status==='closing';
  const color=structural?'#765f4e':closed?'#c29463':memory?.status==='broken'?'#b07161':'#709f93';
  let path;const lane=n++%5;
  if(a.y===b.y){const yy=a.y-57-lane*8;path=`M${a.x} ${a.y-25}V${yy}H${b.x}V${b.y-25}`;}
  else{const sign=b.y>a.y?1:-1,mid=a.y+(b.y-a.y)/2+lane*6;path=`M${a.x} ${a.y+sign*25}V${mid}H${b.x}V${b.y-sign*25}`;}
  svg+=`<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" ${d.phases?'stroke-dasharray="7 6"':''}/>`;
  if(portal){const yy=a.y===b.y?a.y-59-lane*8:(a.y+b.y)/2+lane*6;svg+=`<rect x="${(a.x+b.x)/2-6}" y="${yy-6}" width="12" height="12" fill="#142c32" stroke="${color}" stroke-width="2"/>`;}
 }
 for(const id of group.rows.flat().filter(id=>known.has(id))){const r=C.ROOMS.get(id),p=positions[id],current=id===g.s.room,name=visited.has(id)?r.name.split(' · ').pop():'Passage aperçu',words=name.split(' '),lines=[''];for(const word of words){if((lines[lines.length-1]+' '+word).length>21)lines.push(word);else lines[lines.length-1]+=(lines[lines.length-1]?' ':'')+word;}
  svg+=`<g class="map-node" data-room="${id}" role="button" tabindex="0" aria-label="${esc(current?'Lex · '+name:name)}" transform="translate(${p.x} ${p.y})"><rect x="-83" y="-27" width="166" height="54" rx="3" fill="${current?'#435849':'#183641'}" stroke="${current?'#e5cb8a':visited.has(id)?'#789e8b':'#405f67'}" stroke-width="${current?2.5:1.5}"/><text text-anchor="middle" fill="${current?'#f4e5ba':'#bed2be'}" font-size="12.5" font-family="system-ui">${lines.slice(0,3).map((t,i)=>`<tspan x="0" y="${lines.length===1?4:-3+i*16}">${esc(t)}</tspan>`).join('')}</text>${current?'<circle cy="38" r="4" fill="#e5cb8a"/>':''}</g>`;
 }
 svg+='</svg>';return {svg,key:actualKey,width,height,visited,known};
}
G.AVP_MAP={groups,regionOf,positions,knownRooms,build};
})(globalThis);

