import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { resolveHubRoomArtV56 } from './hub-art-runtime-v56.js';
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';
import { HUB_LOADER_ROOM_V132 } from './hub-training-v132.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const ready = image => Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
const roomWidth = room => finite(room?.profile?.worldWidth || room?.world?.width, 1280);
const roomFloor = room => finite(room?.world?.floorY, 624);
const roles = [
  ['bridge', 'PASSERELLE', 'Navigation et conduite du Tantalus', 'navigation', '#86b9ca'],
  ['briefing', 'BRIEFING', 'Planification des opérations', 'planning', '#bdc99a'],
  ['combat-information', 'CENTRE TACTIQUE', 'Suivi des secteurs et des équipes', 'tactics', '#83c3b3'],
  ['cryo-bay', 'BAIE CRYO', 'Surveillance des capsules de stase', 'stasis', '#9cbec9'],
  ['crew-quarters', 'QUARTIERS', 'Repos et préparation de l’équipage', 'habitat', '#c7b795'],
  ['mess', 'MESS', 'Vie commune et ravitaillement', 'social', '#c5b491'],
  ['medical', 'BLOC MÉDICAL', 'Soins et suivi biologique', 'medical', '#a8d0c6'],
  ['science-lab', 'LABORATOIRE', 'Analyse des échantillons', 'science', '#a9c5d2'],
  ['quarantine', 'CONFINEMENT', 'Chambres isolées et sas sanitaires', 'containment', '#c6b384'],
  ['armory', 'ARMURERIE', 'Dotation et entretien des armes', 'armory', '#c5ba99'],
  ['workshop', 'ATELIER', 'Maintenance des équipements', 'maintenance', '#c4b78c'],
  ['vehicle-bay', 'BAIE VÉHICULES', 'Inspection et maintenance du M577', 'vehicles', '#b2ba9e'],
  ['dropship-hangar', 'HANGAR', 'Contrôle de vol et embarquement', 'flight', '#9bbdc5'],
  ['reactor', 'RÉACTEUR', 'Conversion et distribution d’énergie', 'reactor', '#c4bc87'],
  ['life-support', 'SUPPORT VIE', 'Circuits d’air et filtration', 'life-support', '#9cbea1'],
  ['sensor-array', 'CAPTEURS', 'Balayage et analyse des contacts', 'sensors', '#94bacc'],
  ['arrival-airlock', 'SAS D’ARRIVÉE', 'Accueil et transit vers le bord', 'airlock', '#a5bec2'],
  ['logistics', 'LOGISTIQUE', 'Stockage et manutention du fret', 'cargo', '#c3b590'],
  ['mire-archives', 'ARCHIVES MIRE', 'Consultation des dossiers et simulations', 'archive', '#96bec7'],
  ['synthetic-bay', 'BAIE SYNTHÉTIQUE', 'Diagnostic des unités manufacturées', 'synthetics', '#a7bfc0'],
  ['cctv', 'SURVEILLANCE', 'Caméras et sécurité des accès', 'security', '#95c0a4'],
  ['proving-ground', 'TERRAIN D’ESSAI', 'Tir contrôlé et manutention humaine', 'training', '#c0b58d'],
  ['morgue', 'MORGUE', 'Autopsies et identification', 'autopsy', '#a3beb9'],
  ['escape-pods', 'CAPSULES DE SECOURS', 'Inspection des modules d’évacuation', 'escape', '#c9b797'],
  ['durandal', 'NOYAU DURANDAL', 'Calcul et coordination technique', 'computing', '#a5b6cd'],
  ['bioforge', 'ACCÈS BIOFORGE', 'Sas de recherche biologique', 'biological', '#b0bf8e'],
  ['animal-care', 'SOINS ANIMALIERS', 'Suivi et logement des spécimens', 'animal-care', '#a5be9b'],
  ['frontier-civil-counter', 'COMPTOIR CIVIL', 'Accueil des contrats civils', 'civil', '#c6baa0'],
  ['personal-refuge', 'REFUGE', 'Repos et équipement personnel', 'refuge', '#aebdae']
];
export const HUB_AUTHORED_COMPOSITIONS_V133 = Object.freeze(Object.fromEntries(roles.map(([id, title, purpose, motif, accent]) => [id,
  Object.freeze({ id, title, purpose, motif, accent, plane: 'rear', collidable: false,
    sourceStatus: 'existing-room-bitmap-and-original-vector-instrumentation', foreground: 'below-walk-rail', genericMid: 'replace-by-room-instrumentation' })])));

export function hubAuthoredLayerBoundsV133(room, renderBounds = { x: 0, y: 0, w: 1280, h: 640 }) {
  const width = roomWidth(room), sceneScale = finite(room?.profile?.sceneScale, 1), ratio = finite(room?.profile?.floorRatio, .82);
  const w = renderBounds.w * width / 1280 * sceneScale, h = renderBounds.h * sceneScale;
  return { x: finite(room?.xStart) + (width - w) / 2 + renderBounds.x * width / 1280 * sceneScale,
    y: roomFloor(room) - h * ratio + renderBounds.y * sceneScale, w, h };
}

/** Foreground bitmaps retain their exact source projection. Only the clip is
 * restricted below the physical walk rail; nobody stretches a complete room
 * sheet into a strip or treats a crop as a newly generated room asset. */
export function drawHubAuthoredLayerV133(ctx, image, entry, room, phase = entry?.phase) {
  if (!ctx || !ready(image) || !entry?.renderBounds) return false;
  const target = hubAuthoredLayerBoundsV133(room, entry.renderBounds), floor = roomFloor(room), x = finite(room?.xStart), width = roomWidth(room);
  ctx.save(); ctx.beginPath(); ctx.rect(x, phase === 'front' ? floor + 4 : 0, width, phase === 'front' ? Math.max(0, 720 - floor - 4) : 720); ctx.clip();
  ctx.drawImage(resolveSpriteDrawableV134(image), 0, 0, image.naturalWidth, image.naturalHeight, target.x, target.y, target.w, target.h);
  ctx.restore(); return true;
}

function panel(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(6,14,16,.90)'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#465b5d'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
}
function line(ctx, points) {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
}
function screen(ctx, x, y, w, h, color) {
  panel(ctx, x, y, w, h, color); ctx.fillStyle = 'rgba(94,150,155,.06)'; ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
}

/** Original orthographic steelwork. Walking edges are the actual support y,
 * and the rear posts are scenery rather than additional collision geometry. */
export function drawHubSteelPlatformV133(ctx, platform, { floorY = 624 } = {}) {
  if (!ctx || !platform || !(platform.w > 0) || !(platform.h > 0)) return false;
  const { x, y, w, h } = platform;
  ctx.save();
  const postTop = y + h, postHeight = Math.max(0, floorY - postTop);
  // Two rear uprights and their floor feet visibly support each fixed deck.
  ctx.fillStyle = '#233334';
  for (const post of [x + 12, x + w - 20]) {
    ctx.fillRect(post, postTop, 8, postHeight);
    if (postHeight) {ctx.fillRect(post - 6, floorY - 4, 20, 4);ctx.fillRect(post - 3, postTop, 14, 8);}
  }
  ctx.fillStyle = '#35484a';ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#7b9190';ctx.fillRect(x, y, w, Math.min(3,h));
  ctx.strokeStyle = '#203132';ctx.lineWidth = 2;
  const underside = Math.max(4, h - 3);
  for(let offset=0;offset<w;offset+=44) {
    const right=Math.min(w,offset+44);
    line(ctx,[[x+offset,y+3],[x+right,y+underside],[x+right,y+3]]);
  }
  // A low rear guardrail is attached to the deck, so it never floats above it.
  ctx.strokeStyle='#405657';ctx.lineWidth=3;
  line(ctx,[[x+8,y],[x+8,y-25],[x+w-8,y-25],[x+w-8,y]]);
  for(let offset=104;offset<w-8;offset+=104)line(ctx,[[x+offset,y],[x+offset,y-25]]);
  ctx.restore();return true;
}

export function drawHubSteelLadderV133(ctx, ladder, { centered = true } = {}) {
  if(!ctx || !ladder || !(ladder.bottom > ladder.top))return false;
  const width=Math.min(58,Math.max(42,ladder.w || 52)),left=ladder.x-(centered?width/2:0),height=ladder.bottom-ladder.top;
  ctx.save();ctx.fillStyle='#384d4e';
  ctx.fillRect(left,ladder.top,6,height);ctx.fillRect(left+width-6,ladder.top,6,height);
  ctx.fillStyle='#829593';
  for(let y=ladder.top+10;y<ladder.bottom-4;y+=22){ctx.fillRect(left+6,y,width-12,4);ctx.fillStyle='#405758';ctx.fillRect(left+6,y+4,width-12,2);ctx.fillStyle='#829593';}
  ctx.fillStyle='#4b6363';
  for(const y of [ladder.top,ladder.bottom-7])for(const x of [left-4,left+width-6])ctx.fillRect(x,y,10,7);
  ctx.restore();return true;
}

export function drawHubSteelServicesV133(ctx, occlusion, { floorY = 624 } = {}) {
  if(!ctx||!occlusion)return false;
  ctx.save();ctx.strokeStyle='#31494b';ctx.lineWidth=5;
  const {x,w}=occlusion;
  if(occlusion.art==='ceilingCables') {
    // Orthographic conduits and brackets mounted to the rear ceiling beam.
    // They retain transparent gaps and cannot cover the human walk rail.
    const y=Math.max(72,Math.min(116,occlusion.y+occlusion.h-20));
    for(let row=0;row<3;row++)line(ctx,[[x,y+row*9],[x+w,y+row*9]]);
    ctx.fillStyle='#536a6a';for(let xx=x+14;xx<x+w;xx+=92){ctx.fillRect(xx,y-12,6,38);ctx.fillRect(xx-5,y-14,16,4);}
  } else if(occlusion.art==='foregroundPipes') {
    ctx.beginPath();ctx.rect(x,floorY+4,w,Math.max(0,720-floorY-4));ctx.clip();
    for(let row=0;row<3;row++)line(ctx,[[x,floorY+22+row*18],[x+w,floorY+22+row*18]]);
    ctx.fillStyle='#3f5655';for(let xx=x+10;xx<x+w;xx+=88)ctx.fillRect(xx,floorY+8,7,66);
  } else if(occlusion.art==='maintenancePipe') {
    const y=Math.max(174,occlusion.y),bottom=Math.min(floorY-150,y+occlusion.h);
    for(let offset=0;offset<3;offset++)line(ctx,[[x+20+offset*12,y],[x+20+offset*12,bottom-12],[x+w-18,bottom-12]]);
    ctx.fillStyle='#4b6463';ctx.fillRect(x+10,y+18,52,6);ctx.fillRect(x+w-28,bottom-22,6,24);
  } else {ctx.restore();return false;}
  ctx.restore();return true;
}

/** Replace the old overhead bitmap's white-edged hanging cutouts with an
 * original rear shell. The native far wall, viewport and purpose instruments
 * remain visible through its open middle; no image is edited or relabelled. */
export function drawHubRearShellV133(ctx, room) {
  const composition=HUB_AUTHORED_COMPOSITIONS_V133[room?.id];if(!composition||!ctx)return false;
  const x=finite(room.xStart),width=roomWidth(room),floor=roomFloor(room),top=132;
  ctx.save();ctx.beginPath();ctx.rect(x,top,width,floor-top);ctx.clip();
  ctx.fillStyle='#182629';ctx.fillRect(x,top,width,54);
  ctx.fillStyle='#2e4246';ctx.fillRect(x,top+4,width,7);ctx.fillRect(x,top+46,width,8);
  ctx.strokeStyle='#0b181b';ctx.lineWidth=2;
  for(let xx=x;xx<x+width;xx+=160){ctx.strokeRect(xx+10,top+16,Math.min(140,x+width-xx-20),22);
    ctx.fillStyle='#526367';ctx.fillRect(xx+14,top+19,3,3);ctx.fillRect(xx+126,top+33,3,3);}
  for(const column of [x+40,x+width-62]) {
    ctx.fillStyle='#182a2d';ctx.fillRect(column,top+54,22,floor-top-54);
    ctx.fillStyle='#3c5052';ctx.fillRect(column,top+54,4,floor-top-54);
    ctx.fillStyle='#34494a';ctx.fillRect(column-14,floor-12,50,12);
    for(let yy=top+96;yy<floor-12;yy+=116)ctx.fillRect(column-4,yy,30,8);
  }
  // Small bay lamps sit inside the beam instead of dangling into actor space.
  ctx.fillStyle=composition.accent;
  for(let xx=x+124;xx<x+width-90;xx+=256)ctx.fillRect(xx,top+30,52,3);
  ctx.strokeStyle='#354b4e';ctx.lineWidth=6;
  line(ctx,[[x+62,top+80],[x+100,top+54]]);line(ctx,[[x+width-62,top+80],[x+width-100,top+54]]);
  ctx.restore();return true;
}

/** An authored wall instrument cluster, never an interactable or collision.
 * Its purpose is visible at a distance; real furniture, crew and services keep
 * their own front walking plane and native coordinates. */
export function drawHubRoomPurposeV133(ctx, room, { top: authoredTop } = {}) {
  const composition = HUB_AUTHORED_COMPOSITIONS_V133[room?.id]; if (!composition || !ctx) return false;
  const width = roomWidth(room), x = finite(room.xStart), floor = roomFloor(room), scale = width / 1280;
  const center = x + width / 2, left = center - 230 * scale, top = finite(authoredTop, Math.max(156, floor - 390)), color = composition.accent;
  ctx.save(); ctx.beginPath(); ctx.rect(x, 140, width, floor - 148); ctx.clip();
  ctx.translate(left, top); ctx.scale(scale, 1);
  // This limited cluster replaces the generic giant central bay frame. Fine
  // existing room walls and their specific props remain visible around it.
  screen(ctx, 0, 0, 460, 222, color);
  ctx.fillStyle = color; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'left'; ctx.fillText(composition.title, 20, 28);
  ctx.fillStyle = '#99acac'; ctx.font = '11px monospace'; ctx.fillText(composition.purpose, 20, 47, 420);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5;
  const motif = composition.motif;
  if (['navigation', 'flight', 'escape', 'sensors'].includes(motif)) {
    const cx = 230, cy = 139;
    for (const radius of [24, 48, 72]) { ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.9, radius, 0, 0, Math.PI * 2); ctx.stroke(); }
    line(ctx, [[50,139],[410,139]]); line(ctx, [[230,65],[230,208]]);
    if (motif === 'navigation') { line(ctx, [[82,184],[150,160],[214,137],[274,116],[365,87]]); for (const p of [[82,184],[214,137],[365,87]]) ctx.fillRect(p[0]-3,p[1]-3,6,6); }
    if (motif === 'flight') { line(ctx, [[146,147],[218,101],[250,101],[310,147],[260,146],[242,182],[224,182],[205,146],[146,147]]); }
    if (motif === 'escape') for (let i = 0; i < 3; i++) ctx.strokeRect(170 + i * 44, 112, 28, 66);
    if (motif === 'sensors') line(ctx, [[230,139],[321,83]]);
  } else if (['medical', 'autopsy', 'science', 'biological', 'animal-care'].includes(motif)) {
    ctx.fillRect(40,80,18,62); ctx.fillRect(18,102,62,18);
    line(ctx, [[112,132],[139,132],[148,114],[159,158],[170,89],[186,134],[208,134],[227,118],[245,132],[416,132]]);
    for (let i = 0; i < 4; i++) { ctx.strokeRect(113+i*73,164,57,22); ctx.fillRect(119+i*73,170,15+i*6,10); }
    if (['science','biological'].includes(motif)) {
      ctx.beginPath(); ctx.ellipse(359,89,32,22,0,0,Math.PI*2); ctx.stroke(); line(ctx,[[330,78],[380,98]]);
    }
  } else if (['stasis','containment','synthetics'].includes(motif)) {
    for (let i = 0; i < 3; i++) { const xx=66+i*125; ctx.strokeRect(xx,76,78,119); ctx.strokeRect(xx+8,85,62,98);
      ctx.beginPath(); ctx.ellipse(xx+39,110,11,12,0,0,Math.PI*2);ctx.stroke(); line(ctx,[[xx+39,122],[xx+39,164],[xx+24,143],[xx+54,143]]);ctx.fillRect(xx+18,187,42,3); }
  } else if (['planning','tactics','security','archive','computing'].includes(motif)) {
    for (let i=0;i<3;i++) screen(ctx,22+i*145,71,126,123,color);
    if (motif === 'archive') for(let i=0;i<3;i++)for(let j=0;j<5;j++)ctx.fillRect(35+i*145,88+j*18,82-(j%3)*12,3);
    else for (let i=0;i<3;i++) { line(ctx,[[36+i*145,159],[56+i*145,108],[85+i*145,140],[120+i*145,95]]);ctx.strokeRect(42+i*145,88,70,91); }
  } else if (['reactor','life-support','maintenance','vehicles','cargo','armory','training','airlock'].includes(motif)) {
    for(let i=0;i<3;i++) { ctx.strokeRect(51+i*132,79,94,117);ctx.fillRect(61+i*132,87,74,5);line(ctx,[[67+i*132,112],[113+i*132,112],[113+i*132,175],[67+i*132,175],[67+i*132,112]]); }
    if(motif==='reactor') for(let i=0;i<3;i++)line(ctx,[[77+i*132,101],[101+i*132,132],[79+i*132,145],[106+i*132,182]]);
    if(motif==='life-support') for(let i=0;i<3;i++) {ctx.beginPath();ctx.ellipse(98+i*132,143,27,27,0,0,Math.PI*2);ctx.stroke();line(ctx,[[76+i*132,143],[120+i*132,143]]);}
    if(motif==='armory') for(let i=0;i<3;i++)line(ctx,[[72+i*132,172],[105+i*132,108],[119+i*132,108]]);
  } else {
    for(let i=0;i<3;i++){ctx.strokeRect(38+i*143,81,107,110);ctx.strokeRect(48+i*143,95,87,29);ctx.strokeRect(48+i*143,142,87,29);}
  }
  // Device status belongs on the rear panel, not as a new fullscreen HUD.
  ctx.fillStyle='#648b83';for(let i=0;i<7;i++)ctx.fillRect(21+i*13,207,7,3);
  ctx.restore(); return true;
}

export function withHubAuthoredCompositionV133(Base) {
  if (Base.hubAuthoredCompositionV133) return Base;
  return class HubAuthoredCompositionV133 extends Base {
    static hubAuthoredCompositionV133 = true;
    drawHubRoomPurposeV133(ctx, room, options) {
      return drawHubRoomPurposeV133(ctx, room, options);
    }
    drawTraversalPlatform(ctx, platform) {
      if(this.editorPlaytest)return super.drawTraversalPlatform(ctx,platform);
      return drawHubSteelPlatformV133(ctx,platform);
    }
    drawTraversalLadder(ctx, ladder) {
      if(this.editorPlaytest)return super.drawTraversalLadder(ctx,ladder);
      return drawHubSteelLadderV133(ctx,ladder);
    }
    drawAnnexSteelPlatformV133(ctx, platform, annex) {
      if(this.editorPlaytest)return false;
      return drawHubSteelPlatformV133(ctx,platform,{floorY:annex.world.floorY});
    }
    drawAnnexSteelLadderV133(ctx, ladder) {
      if(this.editorPlaytest)return false;
      return drawHubSteelLadderV133(ctx,ladder,{centered:false});
    }
    drawTraversalOcclusions(ctx, phase = 'front') {
      if(this.editorPlaytest)return super.drawTraversalOcclusions(ctx,phase);
      for(const occlusion of this.v51Occluders.filter(entry=>entry.phase===phase))drawHubSteelServicesV133(ctx,occlusion);
    }
    drawModularRoomV56(ctx, room, phase) {
      if (this.editorPlaytest) return super.drawModularRoomV56(ctx, room, phase);
      if(phase==='back'&&drawHubRearShellV133(ctx,room))return true;
      const contract = resolveHubRoomArtV56(room?.id), entry = contract?.renderStack.find(item => item.phase === phase && item.asset);
      if (!entry) return super.drawModularRoomV56(ctx, room, phase);
      return drawHubAuthoredLayerV133(ctx, this.roomLayerImages?.get(entry.asset), entry, room, phase);
    }
    drawModularHangar(ctx, room, phase) {
      if(this.editorPlaytest)return super.drawModularHangar(ctx,room,phase);
      if(phase!=='back') {
        ctx.save();ctx.beginPath();ctx.rect(room.xStart,roomFloor(room)+4,roomWidth(room),720-roomFloor(room)-4);ctx.clip();
        const result=super.drawModularHangar(ctx,room,phase);ctx.restore();return result;
      }
      if(!this.drawHubSpatialRearV136?.(ctx,room))drawHubRearShellV133(ctx,room);
      // Dedicated booth, dropship and dangerous arc retain their native exact
      // sources and bounds. Only the fringed, non-colliding overhead is replaced.
      ctx.save();ctx.beginPath();ctx.rect(room.xStart,0,roomWidth(room),720);ctx.clip();
      for(const entry of DROPSHIP_HANGAR_ART_V55.renderStack) {
        if(entry.phase!=='back'||entry.kind==='visual-layer'||!entry.asset)continue;
        const image=this.hubArtImages.get(entry.asset);if(!ready(image))continue;
        const target=this.getHubActorRenderBoundsV136?.(entry,room)||{...entry.renderBounds,x:room.xStart+entry.renderBounds.x};ctx.save();
        if(entry.kind==='station-prop'&&this.nearestInteraction()?.id===entry.id){ctx.shadowColor='rgba(226,203,121,.62)';ctx.shadowBlur=8;}
        if(entry.kind==='electrical')ctx.globalAlpha=this.reducedMotion?.78:Math.max(.38,Math.min(.94,.64+Math.sin(this.animationTime*13)*.22));
        const source=entry.kind==='vehicle-sprite'?{...entry.sourceOpaqueBounds,
          x:entry.sourceOpaqueBounds.x+entry.sourceCell.column*entry.sheet.cellWidth,
          y:entry.sourceOpaqueBounds.y+entry.sourceCell.row*entry.sheet.cellHeight}:entry.sourceCrop;
        ctx.drawImage(resolveSpriteDrawableV134(image),source.x,source.y,source.w,source.h,target.x,target.y,target.w,target.h);ctx.restore();
      }
      ctx.restore();return true;
    }
    drawHubRoomMidV58(ctx, room) {
      if (this.editorPlaytest || !HUB_AUTHORED_COMPOSITIONS_V133[room?.id]) return super.drawHubRoomMidV58(ctx, room);
      // Fine far walls and specific overhead art supply the shell. The shared
      // giant mid frame formerly inserted a false extra level into every room.
      return false;
    }
    drawRoomModule(ctx, room, farImage) {
      const result = super.drawRoomModule(ctx, room, farImage);
      if (!this.editorPlaytest) this.drawHubRoomPurposeV133(ctx, room);
      return result;
    }
    drawAnnexForegroundV72(ctx, annex, image) {
      if (this.editorPlaytest || !annex) return super.drawAnnexForegroundV72(ctx, annex, image);
      ctx.save();ctx.beginPath();ctx.rect(0,roomFloor(annex)+4,roomWidth(annex),720-roomFloor(annex)-4);ctx.clip();
      const result=super.drawAnnexForegroundV72(ctx,annex,image);ctx.restore();return result;
    }
    drawAnnexGeometryV71(ctx, annex) {
      if (!this.editorPlaytest) this.drawHubRoomPurposeV133(ctx, { ...annex, xStart: 0 });
      return super.drawAnnexGeometryV71(ctx, annex);
    }
    draw() {
      const result = super.draw();
      if (!this.hubTrainingV132?.active || !this.ctx || !this.player) return result;
      const state = this.hubTrainingV132.course, camera = Math.max(0,Math.min(1320,(state.mounted?state.loader.x:this.player.x)-420)),ctx=this.ctx;
      ctx.save(); ctx.translate(-camera,0);
      // The loader/cargo can rise no higher than y386 in this authored course.
      // This rear instrument strip stays above y370; mechanics and actors are
      // drawn exclusively by the existing renderer and keep its accepted scale.
      ctx.save();ctx.beginPath();ctx.rect(camera,132,1280,238);ctx.clip();
      const wall=this.annexModularImagesV72?.get('/assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp');
      if(ready(wall)) {const scale=1280/wall.naturalWidth;ctx.drawImage(wall,camera,132,1280,wall.naturalHeight*scale);}
      this.drawHubRoomPurposeV133(ctx,{id:'proving-ground',xStart:camera,profile:{worldWidth:1280},world:{floorY:624}},{top:148});
      ctx.restore();
      // Detail the three actual beams and freight cases at their physical
      // bounds. These original steel ribs do not create another obstacle.
      ctx.strokeStyle='#33494b';ctx.lineWidth=4;
      for(const obstacle of HUB_LOADER_ROOM_V132.obstacles) {ctx.strokeRect(obstacle.x+3,obstacle.y+3,obstacle.w-6,obstacle.h-6);
        line(ctx,[[obstacle.x+9,obstacle.y+9],[obstacle.x+obstacle.w-9,obstacle.y+obstacle.h-9]]);
        line(ctx,[[obstacle.x+obstacle.w-9,obstacle.y+9],[obstacle.x+9,obstacle.y+obstacle.h-9]]);}
      ctx.lineWidth=2;ctx.strokeStyle='#6c6856';
      for(const cargo of state.cargo) {ctx.strokeRect(cargo.x+2,cargo.y+2,54,54);line(ctx,[[cargo.x+6,cargo.y+18],[cargo.x+52,cargo.y+18]]);
        line(ctx,[[cargo.x+6,cargo.y+40],[cargo.x+52,cargo.y+40]]);ctx.fillStyle='#222d29';ctx.font='bold 12px monospace';ctx.fillText(cargo.id.slice(-1).toUpperCase(),cargo.x+22,cargo.y+35);}
      ctx.restore(); return result;
    }
    getSnapshot() {return {...super.getSnapshot(),hubAuthoredCompositionV133:{active:!this.editorPlaytest,
      rooms:Object.keys(HUB_AUTHORED_COMPOSITIONS_V133).length,plane:'2d-gameplay-with-room-local-rear-depth',foreground:'below-walk-rail',
      sourceStatus:'reused-authored-room-assets-and-original-instrument-clusters'}};}
  };
}
