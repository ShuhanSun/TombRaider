const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const runtime=fs.readFileSync('runtime-core.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const interaction=fs.readFileSync('interaction-polish.js','utf8');

test('runtime core owns indexed entity queries',()=>{
    assert.match(runtime,/Game\.rebuildEntityIndex\s*=\s*function/);
    assert.match(runtime,/Game\.entitiesOf\s*=\s*function/);
    assert.match(runtime,/Game\.nearestEntity\s*=\s*function/);
    assert.match(runtime,/Game\.assignZombieHome\s*=\s*function/);
    assert.match(runtime,/buckets\.get\('projectileBlocker'\)/);
});

test('hot player and projectile paths use indexed buckets',()=>{
    assert.match(runtime,/Game\.entitiesOf\('blocker'\)/);
    assert.match(runtime,/Game\.entitiesOf\('coffin'\)/);
    assert.match(runtime,/Game\.nearestEntity\('zombie'/);
    assert.match(runtime,/Game\.entitiesOf\('projectileBlocker'\)/);
    assert.match(runtime,/for \(const zombie of Game\.entitiesOf\('zombie'\)\)/);
});

test('context coaching no longer scans the full entity array',()=>{
    assert.match(interaction,/Game\.entitiesOf\('zombie'\)/);
    assert.match(interaction,/Game\.entitiesOf\('trap'\)/);
    assert.doesNotMatch(interaction,/this\.ents\.some\(/);
});

test('page loads one centralized runtime adapter and no legacy patch scripts',()=>{
    const game=html.indexOf('game.js');
    const optimization=html.indexOf('game-optimizations.js');
    const puzzle=html.indexOf('puzzle-system.js');
    const runtimePos=html.indexOf('runtime-core.js');
    const visual=html.indexOf('visual-polish.js');
    const interactionPos=html.indexOf('interaction-polish.js');
    assert.ok(game<optimization&&optimization<puzzle&&puzzle<runtimePos&&runtimePos<visual&&visual<interactionPos);
    assert.doesNotMatch(html,/game-patches\.js/);
    assert.doesNotMatch(html,/puzzle-patches\.js/);
});
