const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const puzzle=fs.readFileSync('puzzle-system.js','utf8');

test('puzzle UI is wired after core gameplay layers',()=>{
  assert.match(html,/id="mechanism-btn"/);
  assert.match(html,/id="puzzle-modal"/);
  assert.match(html,/puzzle-system\.css/);
  assert.match(html,/game-patches\.js[\s\S]*puzzle-system\.js[\s\S]*puzzle-patches\.js/);
});

test('all ten floors have distinct puzzle definitions',()=>{
  for(const name of ['玄龟星位','金乌逐日','双鱼归心','洛书九宫','六兽逆行','七星生路','四面有向','无字显纹','五音镇魂','天枢总印']) {
    assert.ok(puzzle.includes(name),`missing puzzle ${name}`);
  }
  assert.match(puzzle,/requires:\['火','水','血'\]/);
  assert.match(puzzle,/requires:\['方','象','序'\]/);
});

test('relic pickup no longer opens exit; solving the mechanism does',()=>{
  const pickup=puzzle.slice(puzzle.indexOf('Game.getArtifact=function'),puzzle.indexOf('const baseLoad'));
  assert.match(pickup,/this\.relicCollected=true/);
  assert.match(pickup,/this\.exit=0/);
  assert.doesNotMatch(pickup,/baseGetArtifact\(\)/);
  const solve=puzzle.slice(puzzle.indexOf('Game.solvePuzzle=function'));
  assert.match(solve,/this\.exit=1/);
});

test('failed puzzle attempts escalate hints without lethal final-hit punishment',()=>{
  assert.match(puzzle,/this\.puzzleAttempts>=5/);
  assert.match(puzzle,/this\.puzzleAttempts>=3/);
  assert.match(puzzle,/if\(this\.p\.hp>1\)/);
});
