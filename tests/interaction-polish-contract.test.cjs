const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('interaction-polish.js','utf8');
const css=fs.readFileSync('interaction-polish.css','utf8');
const html=fs.readFileSync('index.html','utf8');

test('interaction layer loads after visual and puzzle layers',()=>{
    assert.match(html,/id="context-tutorial"/);
    assert.match(html,/interaction-polish\.css/);
    assert.match(html,/visual-polish\.js[\s\S]*interaction-polish\.js/);
});

test('breath-lost zombies visibly return into their coffin instead of disappearing instantly',()=>{
    assert.match(src,/returningToCoffin/);
    assert.match(src,/returnTimer=0\.7/);
    assert.match(src,/this\.dead=0;this\.returningToCoffin=true/);
    assert.match(src,/ctx\.globalAlpha=a/);
    assert.match(src,/ctx\.translate\(0,\(1-a\)\*18\)/);
});

test('first floor teaches shovel auto attack, breath, trap cover and relic puzzle contextually',()=>{
    for(const key of ["'shovel'","'breath'","'trap'","'relic'"]) assert.match(src,new RegExp(key));
    assert.match(src,/不需要攻击按钮/);
    assert.match(src,/石碑、石柱可挡住直线射击/);
    assert.match(src,/冥器上的纹路不像装饰/);
    assert.match(src,/this\.lvl!==1/);
});

test('contextual tutorial stays out of the movement controls and has no pointer capture',()=>{
    assert.match(css,/bottom:max\(260px/);
    assert.match(css,/pointer-events:none/);
    assert.doesNotMatch(html,/id="attack-btn"/);
});
