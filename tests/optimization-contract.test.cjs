const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const opt=fs.readFileSync('game-optimizations.js','utf8');
const runtime=fs.readFileSync('runtime-core.js','utf8');

test('latest gameplay contract is wired into the page',()=>{
  assert.match(html,/id="breath-btn"/);
  assert.match(html,/id="move-tutorial"/);
  assert.match(html,/game-optimizations\.js/);
  assert.match(html,/runtime-core\.js/);
  assert.match(html,/user-scalable=no/);
  assert.doesNotMatch(html,/game-patches\.js/);
});

test('breath, deterministic levels and auto attack use latest design values',()=>{
  assert.match(opt,/BREATH_MAX:\s*30/);
  assert.match(opt,/AUTO_ATTACK_RANGE/);
  assert.match(opt,/MapSys\.gen\s*=\s*function/);
  assert.match(opt,/LEVEL_LAYOUTS/);
  assert.match(opt,/this\.hasShovel/);
  assert.match(opt,/this\.breathing/);
  assert.match(opt,/projectileBlocker/);
  assert.match(opt,/this\.revealed=true/);
});

test('central runtime assigns zombies to real coffin homes',()=>{
  assert.match(runtime,/Game\.assignZombieHome\s*=\s*function/);
  assert.match(runtime,/nearestEntity\('coffin'/);
  assert.match(runtime,/zombie\.homeX = home\.x/);
  assert.match(runtime,/zombie\.homeY = home\.y/);
});
