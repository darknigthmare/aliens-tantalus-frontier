import { CONTENT } from './content.js';
/** Single authored source for portal mounts, map plans and approach checks.
 * The network is topological, not a metric reconstruction of the commercial map.
 */
const spatialRoomMap=Object.fromEntries(CONTENT.rooms.map(r=>[r.id,r]));
export const PASSAGE_NAMES={door:'PORTE',stairs:'ESCALIER',lift:'ASCENSEUR',tram:'TRAM',shuttle:'NAVETTE',transfer:'TRANSFERT EVA',vent:'CONDUIT',memory:'RÉCIT',walkway:'PASSERELLE',passage:'ARCHE'};
const spatialEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function localPortals(room){return CONTENT.links.filter(e=>e.a===room||e.b===room).map(e=>{const side=e.a===room?'a':'b';return{...e,point:e[side+'Point'],portal:e[side+'Portal'],destination:e[side==='a'?'b':'a'],arrival:e[side==='a'?'bPoint':'aPoint'],arrivalPortal:e[side==='a'?'bPortal':'aPortal']};});}
export function portalApproach(room,actor,edge){
 if(!actor||!edge||!localPortals(room).some(d=>d.id===edge.id&&d.destination===edge.destination))return false;
 const p=edge.point,dx=Math.abs(actor.x-p.x),dy=Math.abs(actor.y-p.y);
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)>87)return false;
 if(p.wall==='N')return dx<=72&&(spatialRoomMap[room].view==='SIDE'||actor.y>=p.y-12);
 return dy<=66;
}
export function passageReason(edge,state,sealed=false){
 if(sealed)return 'Fermeture temporaire / confinement';
 if(edge.deny&&state.flags[edge.deny])return 'Rupture scénaristique : '+(edge.deny==='detached'?'module détaché':edge.deny);
 if(edge.blockedTo===edge.destination&&state.flags[edge.blockFlag])return 'Sens condamné par la séquence';
 if(state.chapter<edge.min)return 'Ouverture au chapitre '+(edge.min+1);
 if(edge.flag&&!state.flags[edge.flag])return ({morley:'Carte de Morley requise',tuner:'Syntoniseur requis',detached:'Séparation du module requise',gemini:'Régulation Gemini requise',samuels:'Procédure Samuels requise',transit:'Transit à rétablir',clamps:'Verrous d’amarrage à libérer',hunt:'Accès personnel à débloquer',purge:'Purge du réacteur requise',lift:'Monte-charge à alimenter',axel:'Passage d’Axel à ouvrir'})[edge.flag]||'Condition : '+edge.flag;
 return edge.kind==='vent'?'Praticable · accroupissement requis':'Praticable';
}
export function spatialPlanSVG(roomId,state=null){
 const r=spatialRoomMap[roomId];if(!r)return '';
 const px=x=>40+x/r.w*1000,py=y=>55+(y-90)*.65;
 let svg=`<svg class="spatial-plan" viewBox="0 0 1080 326" role="img" aria-label="Plan architectural de ${spatialEsc(r.name)}"><rect x="0" y="0" width="1080" height="326" fill="#0a1c17"/><text x="25" y="24" fill="#c4d4b7" font-family="monospace" font-size="13">${spatialEsc(r.name)} · PONT ${r.deck} · ${r.view}</text><rect x="${px(35)}" y="${py(100)}" width="${1000*(r.w-70)/r.w}" height="195" fill="#233d32" stroke="#b2bea1" stroke-width="4"/>`;
 if(r.view==='SIDE')svg+=`<path d="M${px(35)} ${py(300)} H${px(r.w-35)}" stroke="#92b793" stroke-width="10"/>`;
 if(r.view==='HYBRID')for(const [l,h] of [[35,260],[r.w-260,r.w-35]])svg+=`<rect x="${px(l)}" y="${py(100)}" width="${1000*(h-l)/r.w}" height="195" fill="#10251f"/><path d="M${px(l)} ${py(300)} H${px(h)}" stroke="#92b793" stroke-width="7"/>`;
 for(const p of r.props){svg+=`<rect x="${px(p.x-p.w/2)}" y="${py(p.y-p.d/2)}" width="${Math.max(2,p.w/r.w*1000)}" height="${Math.max(2,p.d*.65)}" fill="${p.solid?'#947e52':'#517662'}" stroke="${p.interactive?'#9cbfa2':'#637c68'}"><title>${spatialEsc(p.purpose)}</title></rect>`;}
 for(const e of localPortals(roomId)){const p=e.portal,a=e.point,n=e.spatial.labelId;const blocked=state&&(state.chapter<e.min||e.flag&&!state.flags[e.flag]||e.deny&&state.flags[e.deny]);let color=blocked?'#d1a579':'#cbdcad';
  svg+=`<path d="M${px(p.x)} ${py(p.y)} L${px(a.x)} ${py(a.y)} L${px(p.arrival.x)} ${py(p.arrival.y)}" stroke="${color}" stroke-width="2" stroke-dasharray="4 3"/><rect x="${px(p.x)-7}" y="${py(p.y)-5}" width="14" height="10" fill="${color}"/><circle cx="${px(a.x)}" cy="${py(a.y)}" r="4" fill="#a6dfd6"/><text x="${px(p.x)+(p.wall==='L'?14:p.wall==='R'?-14:0)}" y="${py(p.y)-(p.wall==='N'?12:13)}" fill="${color}" text-anchor="${p.wall==='L'?'start':p.wall==='R'?'end':'middle'}" font-size="11" font-family="monospace">${n}</text>`;
 }
 if(state?.room===roomId)svg+=`<circle cx="${px(state.x)}" cy="${py(state.y)}" r="7" fill="#f2df9c" stroke="#111"/>`;
 return svg+'<text x="25" y="292" fill="#c4d4b7" font-family="monospace" font-size="11">PAROI : CLAIR · SOLIDE : OCRE · CYAN : APPROCHE · POINTILLÉS : SEUIL / ARRIVÉE</text><text x="25" y="311" fill="#93ad98" font-family="monospace" font-size="10">Vue technique locale. La caméra de profil aplatit la profondeur ; le réseau global n’est pas à l’échelle.</text></svg>';
}
