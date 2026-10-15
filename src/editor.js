import { mountForgeControlV136 } from './forge-control-v136.js';
import { LevelEditor as BaseEditor, TILE_TYPES } from './forge-editor-base.js';
import { LAYERS, inside, ForgeModel } from './forge-model-v130.js';
import { ForgeWorkspaceV133, getForgeStoreV133 } from './forge-save-v62.js';
import { mountForgeWorkbenchV133 } from './forge-workbench-v133.js';
import { mountForgeNavigatorV134 } from './forge-navigator-v134.js';
import { mountForgeConstructionV135 } from './forge-construction-v135.js';
export { TILE_TYPES };
/** Additive authoring controller; the native level compiler is unchanged. */
export class LevelEditor extends BaseEditor {
  constructor(canvas, onChange=()=>{}, options={}) {
    super(canvas,onChange);
    this.onDocumentChangeV140 = typeof options.onDocumentChange === 'function' ? options.onDocumentChange : null;
    this.selectionScopeV133='active';
    const store=options.store || (canvas.ownerDocument ? getForgeStoreV133() : null);
    if(store)this.workspaceV133=new ForgeWorkspaceV133(this,store);
    this.workbenchV133=mountForgeWorkbenchV133(this,store);
    this.navigatorV134=mountForgeNavigatorV134(this);
    this.constructionV135=mountForgeConstructionV135(this);
    this.controlV136=mountForgeControlV136(this);
  }
  serialize() { const project=super.serialize();return this.workspaceV133?{...project,forgeProjectIdV133:this.workspaceV133.id,forgeProjectNameV133:this.model.data.name}:project; }
  notify() { super.notify();this.workbenchV133?.refresh();this.navigatorV134?.refresh();this.constructionV135?.refresh();this.controlV136?.refresh(); }
  load(project) {
    const stored=this.workspaceV133?.store.data.projects.find(p=>p.id===this.workspaceV133.id);
    if(stored&&project===stored&&this.model.revision===0&&this.room.cells.length===0)return this.loadInitialProject(project);
    const result=super.load(project);this.workbenchV133?.refresh();this.navigatorV134?.refresh();this.constructionV135?.refresh();this.controlV136?.refresh();return result; }
  /** Boot/reopen is not an import command: never create an undo path to the previous document. */
  loadInitialProject(project) {
    if (this.workspaceV133) this.workspaceV133.adopt(project);
    else {
      const next = new ForgeModel(project);
      this.cancelGesture(); this.model = next; this.selection.clear(); this.cursor = null; this.fit();
    }
    this.ui?.refresh(); this.workbenchV133?.refresh(); this.navigatorV134?.refresh();this.constructionV135?.refresh();this.controlV136?.refresh();
    return true;
  }
  setTool(tool) { this.workbenchV133?.cancelStamp();super.setTool(tool);this.workbenchV133?.refresh(); }
  selectRect(rect, operation='replace') {
    const ids=this.room.cells.filter(cell=>(this.selectionScopeV133==='visible'||cell.layer===this.layer)&&this.visible.has(cell.layer)&&inside(cell,rect)).map(c=>c.id);
    if(operation==='replace')this.selection=new Set(ids);
    else for(const id of ids)operation==='add'?this.selection.add(id):this.selection.delete(id);
    this.draw();this.ui?.refreshInspector();this.workbenchV133?.refresh();this.navigatorV134?.refresh();this.constructionV135?.refresh();this.controlV136?.refresh();
  }
  pointerDown(event) {
    if(event.isPrimary===false)return;
    if(this.workbenchV133?.pointerDown(event))return;
    const selecting=this.mode==='select';
    super.pointerDown(event);
    if(selecting&&(event.ctrlKey||event.metaKey)&&this.gesture?.mode==='move')this.gesture.mode='select';
    if(this.gesture?.mode==='select')this.gesture.selectOperationV133=(event.ctrlKey||event.metaKey)?'subtract':event.shiftKey?'add':'replace';
  }
  pointerMove(event) { super.pointerMove(event);this.workbenchV133?.pointerMove(event); }
  pointerUp(event) {
    if(this.gesture?.mode==='select'&&this.gesture.pointerId===event.pointerId){
      const g=this.gesture,p=this.point(event)||g.end;this.gesture=null;
      this.selectRect({x:Math.min(g.start.x,p.x),y:Math.min(g.start.y,p.y),w:Math.abs(g.start.x-p.x)+1,h:Math.abs(g.start.y-p.y)+1},g.selectOperationV133);
      if(this.canvas.hasPointerCapture?.(event.pointerId))this.canvas.releasePointerCapture?.(event.pointerId);
      return;
    }
    if(this.gesture?.mode==='outline'&&this.gesture.pointerId===event.pointerId){
      const g=this.gesture,p=this.point(event)||g.end;this.gesture=null;
      const x0=Math.min(p.x,g.start.x),x1=Math.max(p.x,g.start.x),y0=Math.min(p.y,g.start.y),y1=Math.max(p.y,g.start.y);
      try{for(let x=x0;x<=x1;x++){this.model.paint(x,y0,this.tool,this.layer,{erase:g.erase});this.model.paint(x,y1,this.tool,this.layer,{erase:g.erase});}
        for(let y=y0+1;y<y1;y++){this.model.paint(x0,y,this.tool,this.layer,{erase:g.erase});this.model.paint(x1,y,this.tool,this.layer,{erase:g.erase});}
        if(this.model.commit())this.notify();
      }catch(error){this.model.cancel();this.report(error);}finally{if(this.canvas.hasPointerCapture?.(event.pointerId))this.canvas.releasePointerCapture?.(event.pointerId);this.draw();}
      return;
    }
    super.pointerUp(event);
  }
  keyDown(event) { if(this.constructionV135?.keyDown(event))return;if(this.navigatorV134?.keyDown(event))return;if(this.workbenchV133?.keyDown(event))return;super.keyDown(event);this.workbenchV133?.refresh(); }
  draw() { super.draw();this.workbenchV133?.draw();this.navigatorV134?.draw(); }
  destroy() { this.controlV136?.destroy();this.constructionV135?.destroy();this.navigatorV134?.destroy();this.workbenchV133?.destroy();super.destroy(); }
}
