import test from 'node:test';
import assert from 'node:assert/strict';
import { playbackFrame, frameRectangle } from '../docs/references/v66-batch-002-player/timeline.mjs';

test('candidate player traverses all eight poses and loops on elapsed time', () => {
  assert.deepEqual(Array.from({length:8}, (_, i) => playbackFrame(i * 100, 10, 8, true).frame), [0,1,2,3,4,5,6,7]);
  assert.deepEqual(playbackFrame(800, 10, 8, true), {frame:0, ended:false});
});
test('candidate player holds death at the last authored pose', () => {
  assert.deepEqual(playbackFrame(700, 10, 8, false), {frame:7, ended:false});
  assert.deepEqual(playbackFrame(60000, 10, 8, false), {frame:7, ended:true});
});
test('candidate player indexes extra fifth clips without assuming a four-clip atlas', () => {
  const grid = {columns:4, rows:10, cellWidth:256, cellHeight:256};
  assert.deepEqual(frameRectangle(39, grid), {x:768, y:2304, width:256, height:256});
  assert.throws(() => frameRectangle(40, grid));
  assert.throws(() => playbackFrame(0, 0, 8, true));
});
