const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');

// Run the real game with a strict DOM fixture and a controllable animation clock.
function setup(seed=1) {
    const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique');
    const calls=[];
    const ctx=new Proxy({}, {get(target,key) {
        if(key==='createRadialGradient') return ()=>({addColorStop(){}});
        return target[key]??((...args)=>calls.push([key,...args]));
    },set(target,key,value){target[key]=value;return true;}});
    function element(id) {
        const classes=new Set(), handlers={};
        return {id,style:{},innerHTML:'',textContent:'',width:180,height:180,handlers,
            classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle(k,on){if(on)classes.add(k);else classes.delete(k);}},
            setAttribute(){},getContext:()=>ctx,appendChild(){},remove(){},focus(){},
            getBoundingClientRect:()=>({left:0,top:0,width:120,height:120}),setPointerCapture(){},
            addEventListener(k,fn){handlers[k]=fn;}
        };
    }
    const els=Object.fromEntries(ids.map(id=>[id,element(id)]));
    const windowEvents={}, documentEvents={}, frames=new Map(), timers=new Map(); let next=0;
    const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const context=vm.createContext({Math:math,Date,Uint8Array,console,
        document:{getElementById:id=>els[id]||null,documentElement:{},hidden:false,
            querySelectorAll:()=>Object.values(els).filter(e=>/modal$/.test(e.id)),createElement:()=>element(''),addEventListener(k,fn){documentEvents[k]=fn;}},
        window:{innerWidth:1200,innerHeight:800,devicePixelRatio:2,addEventListener(k,fn){windowEvents[k]=fn;}},
        requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),
        setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)
    });
    vm.runInContext(source+'\nthis.api={Game,MapSys,Input,Player,Coffin,Zombie,Projectile,Effect,FloatText,AudioSys,CONFIG,TERRAIN};',context);
    const api=context.api;
    api.Game.resize();api.Game.restart();
    const tick=t=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(t));};
    return {...api,els,frames,timers,tick,calls,windowEvents,documentEvents,context};
}

test('boot, language switches before and after play, and HiDPI sizing',()=>{
    const {Game,els}=setup();
    Game.toggleLang(); assert.equal(els['game-title'].innerText,'Tomb Raider');
    Game.toggleLang(); assert.equal(els['game-title'].innerText,'寻龙诀');
    assert.equal(Game.cvs.width,2400); assert.equal(Game.width,1200);
    assert.equal(els['exit-confirm-btn'].textContent,'进入下一层');
});

test('300 generated floors have one reachable relic, connected terrain and safe spawns',()=>{
    const {Game,MapSys}=setup(19);
    for(let n=0;n<300;n++) {
        Game.load(n%10+1);
        const relics=Game.ents.filter(e=>e.content==='artifact');assert.equal(relics.length,1);
        const index=p=>Math.floor(p.y/50)*60+Math.floor(p.x/50);
        const seen=new Set([index(Game.p)]),queue=[index(Game.p)];
        for(let i=0;i<queue.length;i++) {
            const at=queue[i];
            for(const to of [at-60,at+60,at-1,at+1]) {
                if(to<0||to>=3600||Math.abs(to%60-at%60)>1||MapSys.t[to]===1||seen.has(to))continue;
                seen.add(to);queue.push(to);
            }
        }
        assert.ok(seen.has(index(relics[0])));assert.ok(seen.has(index(Game.exitPos)));
        assert.equal(seen.size,[...MapSys.t].filter(t=>t!==1).length);
        for(const e of Game.ents.filter(e=>e.type==='zombie'||e.type==='trap')) assert.ok(Math.hypot(e.x-Game.p.x,e.y-Game.p.y)>150);
        assert.ok(MapSys.canOccupy(Game.p.x,Game.p.y,10));
        assert.ok(MapSys.canOccupy(Game.exitPos.x,Game.exitPos.y,10));
    }
});

test('pathological RNG still produces a relic, compass and a connected fallback',()=>{
    const env=setup();vm.runInContext('Math.random=()=>0;',env.context);env.Game.load(1);
    assert.equal(env.Game.ents.filter(e=>e.content==='artifact').length,1);
    assert.equal(env.Game.ents.filter(e=>e.code==='item_compass').length,1);
    assert.equal(env.MapSys.get(-0.1,1200),1);
});

test('simulation speed is stable at 30, 60 and 144 Hz',()=>{
    const distances=[];
    for(const hz of [30,60,144]) {
        const env=setup(7),{Game,Input,MapSys,tick}=env;
        MapSys.t.fill(0);Game.ents=[Game.p];Game.p.x=400;Game.p.y=400;
        Input.keys.KeyD=true;Input.update();
        for(let i=0;i<=hz*2;i++)tick(i*1000/hz);
        distances.push(Game.p.x-400);
        assert.ok(Math.abs(Game.elapsed-2)<1/60+1e-9);
        assert.equal(env.frames.size,1);
    }
    assert.ok(Math.max(...distances)-Math.min(...distances)<=160/60+1e-8);
});

test('pause freezes coffin reveals and buffs; restart discards old reveals and extra loops',()=>{
    const env=setup(),{Game,tick,Coffin}=env;
    const coffin=new Coffin(Game.p.x+35,Game.p.y,'artifact');Game.ents=[Game.p,coffin];
    coffin.open();Game.p.buffs.jade=10;
    tick(0);Game.togglePause();tick(5000);
    assert.equal(coffin.revealTimer,0.6);assert.equal(Game.art,0);assert.equal(Game.p.buffs.jade,10);
    Game.togglePause();tick(5001);
    for(let i=1;i<=40;i++)tick(5001+i*1000/60);
    assert.equal(Game.art,1);
    Game.restart();Game.restart();assert.equal(env.frames.size,1);
    tick(10000);tick(10020);assert.equal(Game.art,0);assert.equal(Game.pause,false);
});

test('repel prevents zombie attacks but traps hurt; jade prevents trap damage',()=>{
    const {Game,Projectile,Zombie}=setup();
    Game.p.inv=0;Game.p.buffs.hoof=15;
    const z=new Zombie(Game.p.x,Game.p.y,0);z.update(1/60,Game.p);
    assert.ok(Number.isFinite(z.x)&&Number.isFinite(z.y));assert.equal(Game.p.hp,5);
    new Projectile(Game.p.x,Game.p.y,0,'ARROW').update(0,Game.p);assert.equal(Game.p.hp,4);
    Game.p.inv=0;Game.p.buffs.jade=15;
    new Projectile(Game.p.x,Game.p.y,0,'ARROW').update(0,Game.p);assert.equal(Game.p.hp,4);
});

test('compass renders before relic pickup, particles expire and text uses local coordinates',()=>{
    const {Game,Effect,FloatText,calls}=setup();
    Game.p.hasCompass=1;Game.exit=0;Game.shake=0;Game.render();
    assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===70&&c[2]===0));
    const effect=new Effect(Game.p.x,Game.p.y,'gold');Game.ents=[Game.p,effect];
    for(let i=0;i<40;i++)Game.step(1/60);
    assert.ok(!Game.ents.includes(effect));
    calls.length=0;new FloatText(400,500,'test','#fff').draw(Game.ctx);
    assert.ok(calls.some(c=>c[0]==='fillText'&&c[1]==='test'&&c[2]===0&&c[3]===0));
});

test('two pointers move and sprint independently; cancellation and blur clear input',()=>{
    const {Input,Game,els,windowEvents}=setup();
    const event=(pointerId,x=110)=>({pointerId,clientX:x,clientY:60,preventDefault(){}});
    els['joystick-zone'].handlers.pointerdown(event(1));assert.ok(Input.x>0);
    els['sprint-btn'].handlers.pointerdown(event(2));assert.equal(Input.sprint,true);
    els['sprint-btn'].handlers.pointercancel(event(2));assert.equal(Input.sprint,false);assert.equal(Input.active,true);
    els['joystick-zone'].handlers.pointercancel(event(1));assert.equal(Input.active,false);
    Input.keys.ShiftRight=true;Input.update();assert.equal(Input.sprint,true);
    windowEvents.blur();assert.equal(Input.sprint,false);assert.equal(Game.pause,true);
});

test('ten-floor progression preserves equipment, floods only on pickup, and ends once',()=>{
    const {Game,MapSys,els}=setup();
    Game.p.hp=4;Game.p.sight=600;Game.p.hasCompass=1;
    for(let floor=1;floor<=10;floor++) {
        assert.equal(Game.lvl,floor);assert.equal(Game.art,floor-1);
        assert.equal([...MapSys.t].filter(t=>t===2).length,0);
        Game.getArtifact();Game.getArtifact();assert.equal(Game.art,floor);
        assert.ok([...MapSys.t].some(t=>t===2));
        Game.showExitModal();Game.confirmNextLevel();
        assert.equal(Game.p.hp,4);assert.equal(Game.p.sight,600);assert.equal(Game.p.hasCompass,1);
    }
    assert.equal(Game.running,0);assert.ok(els['victory-modal'].classList.contains('active'));
    Game.confirmNextLevel();assert.equal(Game.lvl,10);
    Game.restart();assert.equal(Game.p.hp,5);assert.equal(Game.p.hasCompass,0);
});
