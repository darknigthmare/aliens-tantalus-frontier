import test from 'node:test';
import assert from 'node:assert/strict';
import { createKorariFixture, GameEngine, MissionLevelEngine, SHEET_ID } from '../docs/references/v74-enemy-fixes/050/korari-engine-fixture.mjs';
import { GameEngine as ResumeEngine } from '../src/game-production-resume.js';
import { resolveEnemyAnimation, SpriteAnimationController } from '../src/sprite-animation-runtime.js';

for (const [label,Engine] of [['V51',GameEngine],['V52',MissionLevelEngine]]) {
  for (const facing of [-1,1]) {
    for (const initialGap of [48,100,147]) {
      test(`050 ${label}: coque240 sens${facing} bord${initialGap}, morsure unique sans pénétration`, () => {
        const {engine,enemy,damage,step,arm,contract}=createKorariFixture(Engine,{facing});
        const origin=enemy.x+enemy.w/2;
        engine.player.inVehicle=true;
        engine.vehicle={id:'apc',x:origin+facing*initialGap-(facing<0?240:0),y:826,w:240,h:104,active:true,hull:100};
        const start=enemy.x;
        arm();step(contract.windup);
        assert.equal(enemy.x,start);
        step(contract.impact-contract.windup);
        assert.equal(damage.length,1);
        assert.equal(damage[0].target,engine.vehicle);
        assert.equal(engine.player.health,100);
        assert.equal(engine.vehicle.hull,74);
        const edgeGap=facing>0?engine.vehicle.x-enemy.x-enemy.w:enemy.x-engine.vehicle.x-engine.vehicle.w;
        assert.ok(edgeGap>=0,'aucune intrusion dans la coque à l’impact');
        assert.equal(Math.abs(enemy.x-start),Math.max(0,initialGap-77));
        const centreToHull=edgeGap+enemy.w/2;
        assert.ok(centreToHull<=82.125,'la mâchoire mesurée atteint réellement la coque');
        step(contract.duration-contract.impact+0.00001);
        assert.equal(damage.length,1);
      });
    }
    test(`050 ${label}: coque qui recule hors portée annule l’impact sens${facing}`, () => {
      const {engine,enemy,damage,step,arm,contract}=createKorariFixture(Engine,{facing});
      const origin=enemy.x+enemy.w/2;
      engine.player.inVehicle=true;
      engine.vehicle={id:'apc',x:origin+facing*100-(facing<0?240:0),y:826,w:240,h:104,active:true,hull:100};
      arm();engine.vehicle.x+=facing*7;step(contract.impact);
      assert.equal(damage.length,0,'bord84 après élan > seuil83');
      assert.equal(engine.vehicle.hull,100);
    });
  }

  for (const [deathClock,expectedFrame] of [[2.8,24],[2.5,27],[1.5,31],[0,31]]) {
    test(`050 ${label}: vraie reprise JSON cadavre horloge${deathClock}, contrôleur neuf pose${expectedFrame}`, () => {
      const original=createKorariFixture(Engine);
      Object.assign(original.enemy,{alive:false,health:0,deathClock});
      original.engine.resumeIdentity={seed:50};
      const saved=JSON.parse(JSON.stringify(ResumeEngine.prototype.captureResumeState.call(original.engine)));
      const restored=createKorariFixture(Engine);
      restored.engine.resumeIdentity={seed:50};
      const result=ResumeEngine.prototype.applyResumeState.call(restored.engine,saved);
      assert.equal(result.applied,true);
      assert.equal(restored.enemy.alive,false);
      assert.equal(restored.enemy.deathClock,deathClock);
      assert.equal(restored.enemy.batchAttackV66,null);
      const request=resolveEnemyAnimation(restored.enemy);
      assert.deepEqual(request,{sheetId:SHEET_ID,clipId:'death',frame:expectedFrame});
      for (const wallClock of [0,50,1000]) {
        const controller=new SpriteAnimationController();
        assert.equal(controller.sample(restored.enemy.id,request,wallClock).frame,expectedFrame);
      }
      restored.step(0);
      assert.equal(restored.damage.length,0);
    });
  }
}
