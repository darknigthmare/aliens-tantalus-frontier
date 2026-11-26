/* Explicit bridge for a native host. No inferred X/Y/Z mapping, no scene generation.
   Native mission/vehicle/Queen/airlock progression remains entirely in Base.
   Host must supply a reviewed scene contract and call movement/trace hooks.
   Merely copying this module does not activate it in V105. */
import * as Space from './spatial-core.mjs';
export const ALIENS_V106_RELEASE=Space.VERSION;
export function withAliens1986SpatialV106(Base){
  return class AliensSpatialV106 extends Base {
    configureAliens1986SpatialV106(scene,{commitActor=null,onDoor=null}={}){
      // Construct/validate completely before replacing a running contract.
      const world=Space.createWorld(scene);
      if(commitActor!==null&&typeof commitActor!=='function')throw new TypeError('commitActor doit être une fonction');
      if(onDoor!==null&&typeof onDoor!=='function')throw new TypeError('onDoor doit être une fonction');
      this.aliensSpatialV106={world,commitActor,onDoor};return this.spatialStatusV106();
    }
    spatialStatusV106(){const ext=this.aliensSpatialV106;return ext?{active:true,release:ALIENS_V106_RELEASE,roomId:ext.world.scene.id,geometry:ext.world.geometry}:{active:false,reason:'Contrat spatial natif non enregistré'};}
    moveSpatialActorV106(id,dx,dz){const ext=this.aliensSpatialV106;if(!ext)return {ok:false,reason:'Contrat absent'};
      const actor=ext.world.actors.find(a=>a.id===id);if(!actor)return {ok:false,reason:'Acteur absent'};
      const prior={x:actor.x,z:actor.z},moved=Space.move(ext.world,actor,dx,dz);
      try{if(moved)ext.commitActor?.(id,{x:actor.x,z:actor.z});}catch(error){Object.assign(actor,prior);throw error;}return {ok:moved,x:actor.x,z:actor.z};
    }
    doorSpatialV106(id,open,actorId){const ext=this.aliensSpatialV106;if(!ext)return {ok:false,reason:'Contrat absent'};
      const actor=ext.world.actors.find(a=>a.id===actorId);if(!actor)return {ok:false,reason:'Acteur absent'};
      const prior=structuredClone(ext.world.doors),revision=ext.world.revision,stats=structuredClone(ext.world.stats),events=ext.world.events.length;
      const result=Space.setDoor(ext.world,id,open,{actor});try{if(result.changed)ext.onDoor?.(id,open);}catch(error){ext.world.doors=prior;ext.world.revision=revision;ext.world.stats=stats;ext.world.events.length=events;throw error;}return result;
    }
    traceSpatialV106(a,b,radius=0){if(!this.aliensSpatialV106)return {blocked:true,reason:'Contrat absent'};const hit=Space.trace(this.aliensSpatialV106.world,a,b,radius);return {blocked:!!hit,hit};}
    routeSpatialV106(from,to,radius=15){return this.aliensSpatialV106?Space.planRoute(this.aliensSpatialV106.world,from,to,radius):[];}
    captureResumeState(){const base=super.captureResumeState();return this.aliensSpatialV106?{...base,aliensSpatialV106:Space.exportState(this.aliensSpatialV106.world)}:base;}
    applyResumeState(raw){
      // Reject a malformed add-on BEFORE asking Base to mutate any state.
      if(raw?.aliensSpatialV106){if(!this.aliensSpatialV106)throw new Error('Enregistrer le contrat de cette salle avant la reprise');
        const verdict=Space.validateState(this.aliensSpatialV106.world,raw.aliensSpatialV106);if(!verdict.ok)throw new Error(verdict.reason);}
      const result=super.applyResumeState(raw);
      if(raw?.aliensSpatialV106)Space.importState(this.aliensSpatialV106.world,raw.aliensSpatialV106);
      return result;
    }
  };
}
