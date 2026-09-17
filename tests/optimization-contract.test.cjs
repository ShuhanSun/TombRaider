const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const opt=fs.readFileSync('game-optimizations.js','utf8');
const patch=fs.readFileSync('game-patches.js','utf8');

test('latest gameplay contract is wired into the page',()=>{
  assert.match(html,/id="breath-btn"/);
  assert.match(html,/id="move-tutorial"/);
  assert.match(html,/game-optimizations\.js/);
  assert.match(html,/game-patches\.js/);
  assert.match(html,/user-scalable=no/);
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

test('zombies are reassigned to real coffin homes after optimized level load',()=>{
  assert.match(patch,/const coffins=this\.ents\.filter\(e=>e\.type==='coffin'\)/);
  assert.match(patch,/z\.homeX=home\.x/);
  assert.match(patch,/z\.homeY=home\.y/);
});
