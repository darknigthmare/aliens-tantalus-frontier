import { ForgeModel, TILE_TYPES, DEFAULT_LAYER, LAYERS, clone, decorative, lineCells, rectangle, inside, serializeProject, nativeTiles, validateProject } from './forge-model-v130.js';
import { mountForgeUI } from './forge-ui-v130.js';
export { TILE_TYPES } from './forge-model-v130.js';

const colors={floor:'#789486',platform:'#96b6a1',wall:'#425951',door:'#ecc677',vent:'#70a8b9',ladder:'#cb9e66',lift:'#b194ce',spawn:'#86efbb',objective:'#ffde7b',enemy:'#ed7983',vehicle:'#8fb6e1',terminal:'#69dacc',hazard:'#fa9d63'};
/** Canvas controller. A gesture is one transaction, never one history entry per pixel. */
export class LevelEditor {
  constructor(canvas,onChange=()=>{}) {
    this.canvas=canvas;this.context=canvas.getContext('2d');this.onChange=onChange;
    this.model=new ForgeModel();this.tool='floor';this.layer='structure';this.mode='brush';this.brushSize=1;
    this.visible=new Set(LAYERS);this.lockedLayers=new Set();this.selection=new Set();this.clipboard=null;
    this.viewport={zoom:1,x:0,y:0};this.cursor=null;this.gesture=null;this.grid=true;this.listeners=[];this.disposed=false;
    canvas.tabIndex=0;canvas.style.touchAction='none';canvas.setAttribute('aria-label','Plan Frontier Forge. Flèches : déplacer la sélection ; contrôle Z : annuler.');
    this.bind();this.ui=mountForgeUI(this);this.draw();
  }
  get cols(){return this.model.room.size[0];} get rows(){return this.model.room.size[1];}
  get shipMode(){return this.model.data.kind==='ship';}
  get history(){return this.model.history;} get future(){return this.model.future;}
  get tiles(){return new Map(this.model.room.cells.filter(cell=>!decorative(cell)).map(cell=>[`${cell.x}:${cell.y}`,cell.type]));}
  get room(){return this.model.room;}
  listen(target,type,fn,options){if(!target?.addEventListener)return;target.addEventListener(type,fn,options);this.listeners.push(()=>target.removeEventListener(type,fn,options));}
  bind(){
    this.listen(this.canvas,'pointerdown',event=>this.pointerDown(event));
    this.listen(this.canvas,'pointermove',event=>this.pointerMove(event));
    this.listen(this.canvas,'pointerup',event=>this.pointerUp(event));
    this.listen(this.canvas,'pointercancel',event=>this.cancelGesture(event));
    this.listen(this.canvas,'lostpointercapture',event=>this.cancelGesture(event));
    this.listen(this.canvas,'contextmenu',event=>event.preventDefault());
    this.listen(this.canvas,'wheel',event=>{event.preventDefault();this.zoomAt(event,Math.exp(-Math.max(-200,Math.min(200,event.deltaY))*.003));},{passive:false});
    this.listen(globalThis,'blur',()=>this.cancelGesture());
    this.listen(this.canvas,'keydown',event=>this.keyDown(event));
  }
  matrix(){const base=Math.min(this.canvas.width/this.cols,this.canvas.height/this.rows);return {scale:base*this.viewport.zoom,x:(this.canvas.width-this.cols*base)/2+this.viewport.x,y:(this.canvas.height-this.rows*base)/2+this.viewport.y};}
  canvasPoint(event){const rect=this.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;return {x:(event.clientX-rect.left)*this.canvas.width/rect.width,y:(event.clientY-rect.top)*this.canvas.height/rect.height};}
  point(event,{outside=false}={}){const p=this.canvasPoint(event);if(!p)return null;const m=this.matrix(),x=Math.floor((p.x-m.x)/m.scale),y=Math.floor((p.y-m.y)/m.scale);return outside?{x:Math.max(0,Math.min(this.cols-1,x)),y:Math.max(0,Math.min(this.rows-1,y))}:x>=0&&y>=0&&x<this.cols&&y<this.rows?{x,y}:null;}
  zoomAt(event,factor){if(this.gesture)return;const p=this.canvasPoint(event);if(!p)return;const m=this.matrix(),wx=(p.x-m.x)/m.scale,wy=(p.y-m.y)/m.scale;this.viewport.zoom=Math.max(.25,Math.min(8,this.viewport.zoom*factor));const next=this.matrix();this.viewport.x+=p.x-(next.x+wx*next.scale);this.viewport.y+=p.y-(next.y+wy*next.scale);this.draw();this.ui?.refreshStatus();}
  fit(){this.viewport={zoom:1,x:0,y:0};this.draw();this.ui?.refreshStatus();}
  activeEditable(){return this.visible.has(this.layer)&&!this.lockedLayers.has(this.layer);}
  report(error){this.ui?.message(error?.message||String(error),true);}
  setTool(tool){if(TILE_TYPES.includes(tool)){this.cancelGesture();this.tool=tool;this.layer=DEFAULT_LAYER(tool);this.mode='brush';this.ui?.refresh();this.draw();}}
  setShipMode(enabled){return this.edit('Changer le mode',()=>{this.model.data.kind=enabled?'ship':'mission';});}
  state(){return clone(this.model.data);}
  restore(state,notify=true){this.cancelGesture();this.model.data=this.model.constructor===ForgeModel?new ForgeModel(state).data:clone(state);this.selection.clear();this.fit();if(notify)this.notify();else this.ui?.refresh();}
  mutate(callback){return this.edit('Modifier le plan',callback);}
  edit(label,callback){this.cancelGesture();try{const changed=this.model.transaction(label,callback);if(changed)this.notify();else{this.ui?.refresh();this.draw();}return changed;}catch(error){this.report(error);throw error;}}
  notify(){
    const ids=new Set(this.room.cells.map(cell=>cell.id));
    this.selection=new Set([...this.selection].filter(id=>ids.has(id)));
    this.draw();this.ui?.refresh();
    try{this.onChange(this.serialize());}catch(error){this.report(new Error(`Enregistrement impossible : ${error.message}. Exportez votre plan.`));}
  }
  clear(){return this.edit('Effacer le calque',()=>this.model.deleteCells(this.room.cells.filter(cell=>cell.layer===this.layer&&!this.lockedLayers.has(cell.layer)).map(cell=>cell.id)));}
  undo(){this.cancelGesture();const changed=this.model.undo();if(changed){this.selection.clear();this.notify();}return changed;}
  redo(){this.cancelGesture();const changed=this.model.redo();if(changed){this.selection.clear();this.notify();}return changed;}
  validate(){
    const data=this.model.data;
    if(this.model.pending)return validateProject(data);
    if(this.validationCacheV134?.data!==data)this.validationCacheV134={data,value:validateProject(data)};
    return clone(this.validationCacheV134.value);
  }
  serialize(){return {...clone(this.model.data),size:[...this.room.size],tiles:nativeTiles(this.room),validation:this.validate()};}
  getSnapshot(){return {...this.serialize(),tool:this.tool,layer:this.layer,mode:this.mode,canUndo:this.history.length>0,canRedo:this.future.length>0,selection:[...this.selection],viewport:{...this.viewport}};}
  load(project){this.cancelGesture();const changed=this.model.load(project);this.selection.clear();this.fit();if(changed)this.notify();return changed;}
  setRoom(id){if(id===this.room.id)return;if(!this.model.data.rooms.some(room=>room.id===id))throw new Error('Salle inconnue.');this.edit('Changer de salle',()=>{this.model.data.activeRoomId=id;});this.selection.clear();this.fit();}
  selected(){return this.room.cells.filter(cell=>this.selection.has(cell.id));}
  selectRect(rect){this.selection=new Set(this.room.cells.filter(cell=>cell.layer===this.layer&&this.visible.has(cell.layer)&&inside(cell,rect)).map(cell=>cell.id));this.draw();this.ui?.refreshInspector();}
  copy(){this.clipboard=this.model.copy([...this.selection]);this.ui?.message(this.clipboard?`${this.clipboard.cells.length} bloc(s) copiés.`:'Sélectionnez des blocs à copier.');return this.clipboard;}
  paste(at=this.cursor||{x:1,y:1}){if(!this.activeEditable())throw new Error('Le calque actif est masqué ou verrouillé.');if(this.clipboard?.cells.some(c=>this.lockedLayers.has(c.layer)||!this.visible.has(c.layer)))throw new Error('Un calque du presse-papiers est masqué ou verrouillé.');return this.edit('Coller les blocs',()=>{this.selection=new Set(this.model.paste(this.clipboard,at.x,at.y));});}
  move(dx,dy){this.assertSelectionEditable();return this.edit('Déplacer la sélection',()=>this.model.transform([...this.selection],cell=>({x:cell.x+dx,y:cell.y+dy})));}
  assertSelectionEditable(){if(this.selected().some(cell=>this.lockedLayers.has(cell.layer)||!this.visible.has(cell.layer)))throw new Error('Un calque sélectionné est masqué ou verrouillé.');}
  flip(axis){const cells=this.selected();if(!cells.length)return;this.assertSelectionEditable();const values=cells.map(cell=>cell[axis]),sum=Math.min(...values)+Math.max(...values);return this.edit('Symétrie de la sélection',()=>this.model.transform([...this.selection],cell=>({[axis]:sum-cell[axis]})));}
  removeSelection(){this.assertSelectionEditable();return this.edit('Supprimer la sélection',()=>this.model.deleteCells([...this.selection]));}
  pointerDown(event){
    if(this.disposed||this.gesture||![0,1,2].includes(event.button))return;
    const p=this.point(event),screen=this.canvasPoint(event);if(!screen)return;
    const pan=this.mode==='pan'||event.button===1||event.altKey;if(!pan&&!p)return;
    event.preventDefault();this.canvas.focus({preventScroll:true});
    this.canvas.setPointerCapture?.(event.pointerId);
    this.cursor=p;
    if(pan){this.gesture={pointerId:event.pointerId,mode:'pan',screen,view:{...this.viewport}};return;}
    if(this.mode==='pick'){
      const cell=this.room.cells.filter(c=>this.visible.has(c.layer)&&c.x===p.x&&c.y===p.y).sort((a,b)=>LAYERS.indexOf(b.layer)-LAYERS.indexOf(a.layer))[0];
      if(cell){this.tool=cell.type;this.layer=cell.layer;this.mode='brush';this.ui?.refresh();}this.canvas.releasePointerCapture?.(event.pointerId);return;
    }
    if(!this.activeEditable()){this.report(new Error('Calque masqué ou verrouillé.'));this.canvas.releasePointerCapture?.(event.pointerId);return;}
    const erase=event.button===2||event.shiftKey;
    let mode=this.mode;
    if(mode==='select'&&this.selected().some(cell=>cell.x===p.x&&cell.y===p.y)&&!event.shiftKey)mode='move';
    this.gesture={pointerId:event.pointerId,mode,start:p,end:p,last:p,erase,dx:0,dy:0};
    if(!['select','move'].includes(mode))this.model.begin(erase?'Gommer les blocs':`Tracer : ${mode}`);
    try{
      if(mode==='brush')this.model.paint(p.x,p.y,this.tool,this.layer,{erase,size:this.brushSize});
      if(mode==='fill')this.model.fill(p.x,p.y,this.tool,this.layer,erase);
    }catch(error){this.cancelGesture();this.report(error);}
    this.draw();
  }
  pointerMove(event){
    const gesture=this.gesture;if(gesture&&event.pointerId!==gesture.pointerId)return;
    const point=this.point(event);this.cursor=point;this.ui?.refreshStatus();
    if(!gesture){this.draw();return;}
    if(gesture.mode==='pan'){const screen=this.canvasPoint(event);if(!screen)return;this.viewport.x=gesture.view.x+screen.x-gesture.screen.x;this.viewport.y=gesture.view.y+screen.y-gesture.screen.y;this.draw();return;}
    if(!point){gesture.last=null;return;}
    gesture.end=point;gesture.dx=point.x-gesture.start.x;gesture.dy=point.y-gesture.start.y;
    try{if(gesture.mode==='brush')for(const cell of lineCells(gesture.last||point,point))this.model.paint(cell.x,cell.y,this.tool,this.layer,{erase:gesture.erase,size:this.brushSize});}catch(error){this.cancelGesture();this.report(error);}
    gesture.last=point;this.draw();
  }
  pointerUp(event){
    const gesture=this.gesture;if(!gesture||gesture.pointerId!==event.pointerId)return;
    const p=this.point(event);if(p)gesture.end=p;
    this.gesture=null;
    try{
      if(gesture.mode==='select')this.selectRect(rectangle(gesture.start,gesture.end));
      else if(gesture.mode==='move')this.move(gesture.end.x-gesture.start.x,gesture.end.y-gesture.start.y);
      else if(gesture.mode!=='pan'){
        if(gesture.mode==='brush')for(const cell of lineCells(gesture.last||gesture.end,gesture.end))this.model.paint(cell.x,cell.y,this.tool,this.layer,{erase:gesture.erase,size:this.brushSize});
        if(gesture.mode==='line')for(const cell of lineCells(gesture.start,gesture.end))this.model.paint(cell.x,cell.y,this.tool,this.layer,{erase:gesture.erase,size:this.brushSize});
        if(gesture.mode==='rect'){const rect=rectangle(gesture.start,gesture.end);for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++)this.model.paint(x,y,this.tool,this.layer,{erase:gesture.erase});}
        if(this.model.commit())this.notify();
      }
    }catch(error){this.model.cancel();this.report(error);}finally{if(this.canvas.hasPointerCapture?.(event.pointerId))this.canvas.releasePointerCapture?.(event.pointerId);this.draw();}
  }
  cancelGesture(event){const gesture=this.gesture;if(!gesture||(event&&gesture.pointerId!==event.pointerId))return false;this.gesture=null;this.model.cancel();if(this.canvas.hasPointerCapture?.(gesture.pointerId))this.canvas.releasePointerCapture?.(gesture.pointerId);this.draw();return true;}
  keyDown(event){
    const modifier=event.ctrlKey||event.metaKey,key=event.key.toLowerCase();let handled=true;
    try{
      if(key==='escape'){if(!this.cancelGesture()&&!this.selection.size)return;this.selection.clear();this.draw();this.ui?.refreshInspector();}
      else if(modifier&&key==='z')event.shiftKey?this.redo():this.undo();
      else if(modifier&&key==='y')this.redo();
      else if(modifier&&key==='s')this.notify();
      else if(modifier&&key==='c')this.copy();
      else if(modifier&&key==='v')this.paste();
      else if(modifier&&key==='a')this.selectRect({x:0,y:0,w:this.cols,h:this.rows});
      else if(key==='delete'||key==='backspace')this.removeSelection();
      else if(['arrowleft','arrowright','arrowup','arrowdown'].includes(key)){const step=event.shiftKey?10:1;this.move((key==='arrowright'?1:key==='arrowleft'?-1:0)*step,(key==='arrowdown'?1:key==='arrowup'?-1:0)*step);}
      else if(key==='0')this.fit();
      else if(key==='g'){this.grid=!this.grid;this.draw();}
      else if(!modifier&&['b','l','r','f','v','i','p'].includes(key)){this.mode={b:'brush',l:'line',r:'rect',f:'fill',v:'select',i:'pick',p:'pan'}[key];this.ui?.refresh();}
      else handled=false;
    }catch(error){this.report(error);}
    if(handled){event.preventDefault();event.stopPropagation();}
  }
  draw(){
    if(this.disposed)return;const ctx=this.context,w=this.canvas.width,h=this.canvas.height,m=this.matrix(),s=m.scale;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#080f12';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(m.x,m.y);ctx.fillStyle=this.shipMode?'#102329':'#10221e';ctx.fillRect(0,0,this.cols*s,this.rows*s);
    ctx.beginPath();ctx.rect(0,0,this.cols*s,this.rows*s);ctx.clip();
    for(const layer of LAYERS.filter(layer=>this.visible.has(layer)))for(const cell of this.room.cells.filter(cell=>cell.layer===layer)){
      let dx=0,dy=0;if(this.gesture?.mode==='move'&&this.selection.has(cell.id)){dx=this.gesture.dx;dy=this.gesture.dy;}
      const x=(cell.x+dx)*s,y=(cell.y+dy)*s;if(x+s<-m.x||y+s<-m.y||x>w-m.x||y>h-m.y)continue;
      ctx.globalAlpha=decorative(cell)?.38:1;ctx.fillStyle=colors[cell.type];
      ctx.fillRect(x+1,y+1,Math.max(1,s-2),Math.max(1,s-2));
      ctx.strokeStyle='#081510';ctx.lineWidth=Math.max(1,s*.04);
      if(cell.type==='ladder'){for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(x+s*.22,y+s*k/4);ctx.lineTo(x+s*.78,y+s*k/4);ctx.stroke();}}
      else if(cell.type==='door'){ctx.strokeRect(x+s*.2,y+s*.12,s*.6,s*.78);ctx.beginPath();ctx.moveTo(x+s*.5,y+s*.12);ctx.lineTo(x+s*.5,y+s*.9);ctx.stroke();}
      else if(cell.type==='platform')ctx.clearRect(x+1,y+s*.28,s-2,s*.65);
      else if(s>=16){ctx.fillStyle='#081510';ctx.font=`bold ${Math.max(10,Math.min(19,s*.44))}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText({spawn:'S',objective:'O',enemy:'X',vehicle:'V',terminal:'T',hazard:'!',floor:'═',wall:'▥',vent:'≋',lift:'↕'}[cell.type]||'',x+s/2,y+s/2);}
      ctx.globalAlpha=1;
      if(cell.locked){ctx.fillStyle='#fff';ctx.fillRect(x+s*.78,y+s*.1,Math.max(2,s*.12),Math.max(2,s*.12));}
      if(this.selection.has(cell.id)){ctx.strokeStyle='#fff3ba';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,s-2,s-2);}
    }
    if(this.grid&&s>=8){ctx.globalAlpha=.2;ctx.strokeStyle='#9ad4bd';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=this.cols;x++){ctx.moveTo(x*s,0);ctx.lineTo(x*s,this.rows*s);}for(let y=0;y<=this.rows;y++){ctx.moveTo(0,y*s);ctx.lineTo(this.cols*s,y*s);}ctx.stroke();ctx.globalAlpha=1;}
    if(this.gesture&&['select','rect','line'].includes(this.gesture.mode)){
      ctx.strokeStyle='#ffdf8c';ctx.fillStyle='#ffdf8c22';ctx.lineWidth=2;
      if(this.gesture.mode==='line'){for(const cell of lineCells(this.gesture.start,this.gesture.end))ctx.strokeRect(cell.x*s,cell.y*s,s,s);}else{const r=rectangle(this.gesture.start,this.gesture.end);ctx.fillRect(r.x*s,r.y*s,r.w*s,r.h*s);ctx.strokeRect(r.x*s,r.y*s,r.w*s,r.h*s);}
    }
    if(this.cursor&&!this.gesture){ctx.strokeStyle=this.activeEditable()?'#a7edc8':'#ef7c85';ctx.lineWidth=2;ctx.strokeRect(this.cursor.x*s,this.cursor.y*s,s*this.brushSize,s*this.brushSize);}
    ctx.restore();ctx.strokeStyle='#3e6154';ctx.lineWidth=2;ctx.strokeRect(m.x,m.y,this.cols*s,this.rows*s);
  }
  destroy(){this.cancelGesture();this.disposed=true;this.listeners.splice(0).forEach(remove=>remove());this.ui?.destroy();}
}
