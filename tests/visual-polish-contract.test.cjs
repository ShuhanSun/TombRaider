const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('visual-polish.js','utf8');
const css=fs.readFileSync('visual-polish.css','utf8');
const html=fs.readFileSync('index.html','utf8');

test('visual polish layer is loaded after gameplay and puzzle systems',()=>{
    assert.match(html,/visual-polish\.css/);
    assert.match(html,/id="atmosphere-overlay"/);
    assert.match(html,/puzzle-patches\.js[\s\S]*visual-polish\.js/);
});

test('coffin opening keeps lid displacement and uses bounded blood or translucent smoke effects',()=>{
    assert.match(src,/lidOffset < 48/);
    assert.match(src,/Math\.min\(48/);
    assert.match(src,/class BloodPool/);
    assert.match(src,/class SmokeCloud/);
    assert.match(src,/this\.life = 4\.8/);
    assert.match(src,/this\.life <= 0/);
    assert.doesNotMatch(src,/SmokeCloud[\s\S]{0,1200}Math\.random/);
});

test('each floor gets authored environmental decoration and first floor emphasizes Han tomb motifs',()=>{
    for(let level=1;level<=10;level++) assert.match(src,new RegExp(`level === ${level}`));
    for(const motif of ['bronzeLamp','pottery','ritualTable','guardian','mural','floorSeal']) assert.match(src,new RegExp(`'${motif}'`));
    assert.match(src,/function addLevelDecor/);
});

test('breath presentation darkens atmosphere without adding an attack control',()=>{
    assert.match(src,/classList\.toggle\('breath-mode'/);
    assert.match(css,/body\.breath-mode #atmosphere-overlay/);
    assert.match(css,/#breath-timer/);
    assert.doesNotMatch(html,/id="attack-btn"/);
});

test('decorations remain bounded and screen culling can still handle them as ordinary entities',()=>{
    assert.match(src,/class TombDecor extends Entity/);
    assert.doesNotMatch(src,/setInterval/);
    assert.doesNotMatch(src,/requestAnimationFrame/);
    const adds=(src.match(/add\('/g)||[]).length;
    assert.ok(adds < 60,`expected a bounded authored decoration count, found ${adds}`);
});
