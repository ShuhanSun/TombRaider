/*
 * Xunlong Jue gameplay optimization layer.
 * Keeps the legacy engine small while overriding outdated prototype rules.
 */
(() => {
    'use strict';

    const OPT = Object.freeze({
        BREATH_MAX: 30,
        BREATH_MOVE_SCALE: 0.34,
        AUTO_ATTACK_RANGE: 58,
        AUTO_ATTACK_COOLDOWN: 0.55,
        BLOCKER_MARGIN: 12
    });

    const RELICS = [
        {n:'玄龟镇墓盘',en:'Black Tortoise Tomb Disc',i:'🐢',d:'玄龟负斗，龟甲星位暗示墓门方位。',end:'Star marks on the shell encode directions.'},
        {n:'三足金乌灯',en:'Three-Legged Sun Crow Lamp',i:'🪔',d:'日升、日中、日落的影子记录着机关顺序。',end:'Its shadows encode the path of the sun.'},
        {n:'双鱼阴阳佩',en:'Twin-Fish Yin-Yang Pendant',i:'☯️',d:'黑白相间，鱼眼却必须同向归心。',end:'Alternating halves and inward eyes form the clue.'},
        {n:'九宫洛书镜',en:'Luoshu Nine-Palace Mirror',i:'🪞',d:'镜背九宫圆点纵横相应，缺位即是答案。',end:'The nine-palace dots reveal the missing arrangement.'},
        {n:'六兽司辰璧',en:'Six-Beast Time Jade',i:'🦊',d:'残月为始，六兽逆时而行。',end:'Begin at the moon and read the beasts counter-clockwise.'},
        {n:'七星葬魂尺',en:'Seven-Star Soul Ruler',i:'✨',d:'明暗七星对应甬道踏板，红痕不可触。',end:'Lit stars mark safe steps; red scars mark danger.'},
        {n:'人面青铜觚',en:'Four-Faced Bronze Gu',i:'🏺',d:'喜怒哀惧各有所向，墓室本身就是线索。',end:'Each face points to a different meaning in the room.'},
        {n:'无字天机简',en:'Wordless Oracle Slips',i:'📜',d:'火照、水映、血染，方能显出完整纹样。',end:'Fire, water and blood reveal its hidden symbols.'},
        {n:'五音镇魂钟',en:'Five-Tone Soul Bell',i:'🔔',d:'五音有序，错一声便惊动幽宫。',end:'A five-note sequence seals the passage.'},
        {n:'天枢地宫印',en:'Tianshu Palace Seal',i:'🔱',d:'主墓总印，汇合方位、环境与次序三类线索。',end:'The final seal combines direction, environment and sequence.'}
    ];
    for(let i=0;i<Math.min(ARTIFACTS.length,RELICS.length);i++) Object.assign(ARTIFACTS[i],RELICS[i]);

    // Ten authored, deterministic room graphs. Room 0 is spawn; the last room is the exit.
    const LEVEL_LAYOUTS = [
        {rooms:[
            {x:27,y:52,w:6,h:5,tag:'墓道入口'}, {x:23,y:41,w:14,h:8,tag:'前墓室'},
            {x:10,y:41,w:9,h:8,tag:'左耳室'}, {x:41,y:41,w:9,h:8,tag:'右耳室'},
            {x:21,y:27,w:18,h:10,tag:'主墓室'}, {x:24,y:15,w:12,h:7,tag:'后墓室'},
            {x:27,y:6,w:6,h:5,tag:'下层墓道'}], links:[[0,1],[1,2],[1,3],[1,4],[4,5],[5,6]]},
        {rooms:[{x:5,y:49,w:8,h:7},{x:19,y:47,w:10,h:9},{x:37,y:48,w:11,h:8},{x:37,y:33,w:11,h:9},{x:20,y:31,w:10,h:9},{x:7,y:29,w:8,h:8},{x:8,y:12,w:12,h:9},{x:30,y:10,w:12,h:10}],links:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[1,4]]},
        {rooms:[{x:26,y:51,w:8,h:6},{x:24,y:40,w:12,h:8},{x:7,y:39,w:10,h:9},{x:43,y:39,w:10,h:9},{x:8,y:22,w:10,h:9},{x:42,y:22,w:10,h:9},{x:24,y:20,w:12,h:10},{x:25,y:7,w:10,h:7}],links:[[0,1],[1,2],[1,3],[2,4],[3,5],[4,6],[5,6],[6,7]]},
        {rooms:[{x:5,y:49,w:8,h:7},{x:20,y:48,w:9,h:8},{x:36,y:48,w:9,h:8},{x:5,y:33,w:9,h:9},{x:20,y:32,w:9,h:9},{x:36,y:32,w:9,h:9},{x:5,y:16,w:9,h:9},{x:20,y:15,w:9,h:9},{x:36,y:14,w:11,h:10}],links:[[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[3,6],[4,7],[5,8],[6,7],[7,8]]},
        {rooms:[{x:25,y:51,w:9,h:6},{x:11,y:44,w:10,h:8},{x:39,y:44,w:10,h:8},{x:6,y:29,w:10,h:9},{x:25,y:31,w:10,h:9},{x:44,y:29,w:10,h:9},{x:12,y:14,w:10,h:9},{x:38,y:14,w:10,h:9},{x:25,y:7,w:10,h:7}],links:[[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[6,8],[7,8]]},
        {rooms:[{x:6,y:50,w:9,h:7},{x:20,y:48,w:10,h:9},{x:37,y:48,w:10,h:9},{x:44,y:33,w:9,h:9},{x:27,y:31,w:10,h:9},{x:10,y:31,w:10,h:9},{x:7,y:15,w:11,h:9},{x:25,y:14,w:10,h:9},{x:43,y:13,w:10,h:10}],links:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[4,7],[3,8],[6,7],[7,8]]},
        {rooms:[{x:26,y:51,w:8,h:6},{x:24,y:42,w:12,h:7},{x:8,y:38,w:9,h:9},{x:43,y:38,w:9,h:9},{x:6,y:23,w:10,h:9},{x:25,y:25,w:10,h:9},{x:44,y:22,w:10,h:9},{x:10,y:8,w:10,h:9},{x:25,y:8,w:10,h:9},{x:41,y:7,w:11,h:10}],links:[[0,1],[1,2],[1,3],[2,4],[2,5],[3,5],[3,6],[4,7],[5,8],[6,9],[7,8],[8,9]]},
        {rooms:[{x:5,y:50,w:9,h:7},{x:19,y:48,w:10,h:9},{x:36,y:47,w:11,h:10},{x:44,y:32,w:10,h:9},{x:27,y:31,w:10,h:10},{x:9,y:31,w:10,h:9},{x:7,y:15,w:11,h:9},{x:24,y:14,w:11,h:10},{x:42,y:13,w:11,h:10},{x:27,y:4,w:9,h:7}],links:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[4,7],[3,8],[6,7],[7,8],[7,9],[8,9]]},
        {rooms:[{x:26,y:52,w:8,h:5},{x:25,y:43,w:10,h:7},{x:8,y:42,w:10,h:8},{x:42,y:42,w:10,h:8},{x:6,y:28,w:10,h:9},{x:25,y:28,w:10,h:9},{x:44,y:28,w:10,h:9},{x:9,y:13,w:10,h:9},{x:25,y:12,w:10,h:9},{x:42,y:12,w:10,h:9},{x:26,y:3,w:8,h:6}],links:[[0,1],[1,2],[1,3],[2,4],[2,5],[3,5],[3,6],[4,7],[5,8],[6,9],[7,8],[8,9],[8,10]]},
        {rooms:[{x:26,y:53,w:8,h:4},{x:24,y:45,w:12,h:6},{x:7,y:43,w:11,h:8},{x:42,y:43,w:11,h:8},{x:5,y:28,w:11,h:9},{x:24,y:29,w:12,h:9},{x:44,y:27,w:11,h:10},{x:7,y:12,w:12,h:10},{x:24,y:12,w:12,h:10},{x:42,y:11,w:12,h:11},{x:23,y:2,w:14,h:7}],links:[[0,1],[1,2],[1,3],[2,4],[2,5],[3,5],[3,6],[4,7],[5,8],[6,9],[7,8],[8,9],[8,10]]}
    ];

    const center = r => ({x:(r.x+r.w/2)*CONFIG.TILE,y:(r.y+r.h/2)*CONFIG.TILE});
    const carveRoom = (t,w,r) => {
        for(let y=r.y;y<r.y+r.h;y++) for(let x=r.x;x<r.x+r.w;x++) t[y*w+x]=TERRAIN.FLOOR;
    };
    const carvePath = (t,w,a,b) => {
        let x=Math.floor(a.x+a.w/2), y=Math.floor(a.y+a.h/2);
        const tx=Math.floor(b.x+b.w/2), ty=Math.floor(b.y+b.h/2);
        while(x!==tx){ t[y*w+x]=TERRAIN.FLOOR; x+=x<tx?1:-1; t[y*w+x]=TERRAIN.FLOOR; }
        while(y!==ty){ t[y*w+x]=TERRAIN.FLOOR; y+=y<ty?1:-1; t[y*w+x]=TERRAIN.FLOOR; }
    };

    MapSys.gen = function(level){
        const def=LEVEL_LAYOUTS[Math.max(0,Math.min(9,level-1))];
        this.t=new Uint8Array(this.w*this.h).fill(TERRAIN.WALL);
        const rooms=def.rooms.map(r=>({...r}));
        rooms.forEach(r=>carveRoom(this.t,this.w,r));
        def.links.forEach(([a,b])=>carvePath(this.t,this.w,rooms[a],rooms[b]));
        this.lastRooms=rooms;
        return rooms;
    };

    class Blocker extends Entity {
        constructor(x,y,kind='column',radius=22){super(x,y,'blocker');this.kind=kind;this.radius=radius;this.projectileBlocker=true;}
        draw(ctx){
            ctx.save();
            if(this.kind==='stele'){
                ctx.fillStyle='#4a4a45';ctx.fillRect(-20,-32,40,58);
                ctx.strokeStyle='#777367';ctx.lineWidth=3;ctx.strokeRect(-18,-30,36,54);
                ctx.fillStyle='#9b927d';ctx.font='12px serif';ctx.textAlign='center';ctx.fillText('镇',0,-2);
            } else {
                ctx.fillStyle='#3d3b36';ctx.beginPath();ctx.ellipse(0,0,22,28,0,0,Math.PI*2);ctx.fill();
                ctx.strokeStyle='#6a655a';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,17,23,0,0,Math.PI*2);ctx.stroke();
            }
            ctx.restore();
        }
    }

    class ShovelItem extends Entity {
        constructor(x,y){super(x,y,'shovel_item');}
        update(dt,p){
            if(Math.hypot(this.x-p.x,this.y-p.y)<30){
                p.hasShovel=1;this.dead=1;AudioSys.playItem(true);
                Game.msg(curLang==='CN'?'拾得洛阳铲 · 靠近尸祟自动攻击':'Luoyang shovel acquired · attacks are automatic','#d7b77a');
            }
        }
        draw(ctx){
            const bob=Math.sin(Date.now()/260)*4;
            ctx.save();ctx.translate(0,bob);ctx.rotate(-0.55);
            ctx.strokeStyle='#8d6e63';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,22);ctx.stroke();
            ctx.fillStyle='#9e9e9e';ctx.beginPath();ctx.moveTo(-8,-26);ctx.lineTo(8,-26);ctx.lineTo(5,-10);ctx.lineTo(-5,-10);ctx.closePath();ctx.fill();
            ctx.restore();
        }
    }

    const baseTrapUpdate=Trap.prototype.update;
    const baseTrapDraw=Trap.prototype.draw;
    Trap.prototype.update=function(dt,p){
        if(this.revealed===undefined) this.revealed=false;
        const dist=Math.hypot(this.x-p.x,this.y-p.y);
        if(!this.revealed){
            if(dist<230){
                this.revealed=true;this.cd=Math.min(this.cd,0.22);
                Game.addText(this.x,this.y,curLang==='CN'?'机关显露':'Trap revealed','#e7b96c');
            } else return;
        }
        baseTrapUpdate.call(this,dt,p);
    };
    Trap.prototype.draw=function(ctx){
        if(!this.revealed) return;
        ctx.save();
        const type=this.pType;
        if(type==='FIRE'){
            ctx.fillStyle='#46392f';ctx.beginPath();ctx.arc(0,-7,19,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#17120f';ctx.beginPath();ctx.ellipse(0,-6,10,7,0,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#a94720';ctx.fillRect(-5,7,10,12);
        } else if(type==='STONE'){
            ctx.fillStyle='#514c44';ctx.fillRect(-19,-19,38,28);ctx.fillStyle='#1b1a18';ctx.fillRect(-11,-13,22,16);
            ctx.fillStyle='#777168';ctx.beginPath();ctx.arc(0,-4,8,0,Math.PI*2);ctx.fill();
        } else if(type==='LOG'){
            ctx.fillStyle='#3c2a1f';ctx.fillRect(-22,-18,44,30);ctx.fillStyle='#17100b';ctx.fillRect(-15,-12,30,18);
            ctx.strokeStyle='#7c5a3a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(15,0);ctx.stroke();
        } else {
            ctx.fillStyle='#494844';ctx.fillRect(-20,-18,40,28);ctx.fillStyle='#151515';ctx.fillRect(-14,-11,28,6);
            ctx.strokeStyle='#9b8a72';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-8);ctx.lineTo(12,-8);ctx.stroke();
        }
        ctx.fillStyle='#cf6a56';ctx.beginPath();ctx.arc(0,-28,3+Math.sin(Date.now()/120)*1.5,0,Math.PI*2);ctx.fill();
        ctx.restore();
    };

    Projectile.prototype.update=function(dt,p){
        if(this.dead) return;
        this.life-=dt;if(this.life<0){this.dead=1;return;}
        this.x+=this.vx*dt;this.y+=this.vy*dt;
        if(MapSys.get(this.x,this.y)===TERRAIN.WALL){this.dead=1;return;}
        for(const e of Game.ents){
            if(e.dead||!e.projectileBlocker) continue;
            if(Math.hypot(this.x-e.x,this.y-e.y)<(e.radius||20)+this.info.size){this.dead=1;return;}
        }
        if(this.info!==PROJ_TYPES.VENOM){
            for(const z of Game.ents){
                if(z.dead||z.type!=='zombie') continue;
                if(Math.hypot(this.x-z.x,this.y-z.y)<this.info.size+12){
                    z.hp=(z.hp??2)-1;this.dead=1;
                    if(z.hp<=0){z.dead=1;Game.spawn(new Effect(z.x,z.y,'burst'));}
                    return;
                }
            }
        }
        if(Math.hypot(this.x-p.x,this.y-p.y)<this.info.size+10){
            if(p.buffs.jade>0)this.dead=1;else{p.hit();this.dead=1;}
        }
    };

    const baseZombieUpdate=Zombie.prototype.update;
    Zombie.prototype.update=function(dt,p){
        if(this.homeX===undefined){
            let home=null,best=Infinity;
            for(const e of Game.ents){
                if(e.type!=='coffin') continue;
                const d=Math.hypot(e.x-this.x,e.y-this.y);if(d<best){best=d;home=e;}
            }
            this.homeX=home?home.x:this.x;this.homeY=home?home.y:this.y;
            this.hp=this.zType===1?1:2;this._breathFreeze=0;this._calm=0;this._sawBreath=false;
        }
        if(p.breathing){
            if(!this._sawBreath){this._sawBreath=true;this._breathFreeze=1.2;this._calm=1.5;}
            if(this._breathFreeze>0){this._breathFreeze-=dt;return;}
            const dx=this.homeX-this.x,dy=this.homeY-this.y,d=Math.hypot(dx,dy);
            if(d<14){this.dead=1;return;}
            const speed=Math.max(24,this.spd*0.38),nx=this.x+dx/(d||1)*speed*dt,ny=this.y+dy/(d||1)*speed*dt;
            if(MapSys.canOccupy(nx,this.y,10))this.x=nx;
            if(MapSys.canOccupy(this.x,ny,10))this.y=ny;
            return;
        }
        if(this._sawBreath){this._sawBreath=false;this._calm=Math.max(this._calm,1.4);}
        if(this._calm>0){
            this._calm-=dt;
            const dx=this.homeX-this.x,dy=this.homeY-this.y,d=Math.hypot(dx,dy);
            if(d>24){
                const speed=Math.max(20,this.spd*0.28),nx=this.x+dx/(d||1)*speed*dt,ny=this.y+dy/(d||1)*speed*dt;
                if(MapSys.canOccupy(nx,this.y,10))this.x=nx;
                if(MapSys.canOccupy(this.x,ny,10))this.y=ny;
            }
            return;
        }
        baseZombieUpdate.call(this,dt,p);
    };

    const baseCoffinInteract=Coffin.prototype.interact;
    Coffin.prototype.interact=function(dt,p){
        const d=Math.hypot(this.x-p.x,this.y-p.y);
        if(!this.opened&&d<48){
            p.facing=Math.atan2(this.y-p.y,this.x-p.x);
            p.pushing=true;
        }
        baseCoffinInteract.call(this,dt,p);
    };

    Player.prototype.update=function(dt){
        this.pushing=false;
        this.attackCD=Math.max(0,(this.attackCD||0)-dt);
        this.attackAnim=Math.max(0,(this.attackAnim||0)-dt);
        if(this.inv>0)this.inv-=dt;
        if(this.buffs.hoof>0)this.buffs.hoof-=dt;
        if(this.buffs.candle>0)this.buffs.candle-=dt;
        if(this.buffs.jade>0)this.buffs.jade-=dt;
        if(this.breathing){
            this.breathLeft=Math.max(0,(this.breathLeft??OPT.BREATH_MAX)-dt);
            if(this.breathLeft<=0) Game.setBreathing(false);
        }
        let speed=160;
        if(Input.sprint&&!this.breathing)speed*=1.5;
        if(this.breathing)speed*=OPT.BREATH_MOVE_SCALE;
        if(MapSys.get(this.x,this.y)===TERRAIN.WATER)speed*=0.5;
        const oldX=this.x,oldY=this.y;
        if(Input.active){
            this.facing=Math.atan2(Input.y,Input.x);
            const nx=this.x+Input.x*speed*dt,ny=this.y+Input.y*speed*dt;
            if(MapSys.canOccupy(nx,this.y,10))this.x=nx;
            if(MapSys.canOccupy(this.x,ny,10))this.y=ny;
            for(const e of Game.ents){
                if(e.dead||e.type!=='blocker')continue;
                if(Math.hypot(this.x-e.x,this.y-e.y)<(e.radius||20)+OPT.BLOCKER_MARGIN){this.x=oldX;this.y=oldY;break;}
            }
            this.stepPhase+=dt*(this.breathing?4:10);
            this.walkT+=dt;if(this.walkT>0.4){AudioSys.playStep();this.walkT=0;}
            if(Game.lvl===1)Game.dismissMoveTutorial();
        } else this.stepPhase=0;

        const nearCoffin=Game.ents.some(e=>e.type==='coffin'&&!e.opened&&Math.hypot(e.x-this.x,e.y-this.y)<50);
        if(this.hasShovel&&!this.breathing&&!nearCoffin&&this.attackCD<=0){
            let target=null,best=OPT.AUTO_ATTACK_RANGE;
            for(const e of Game.ents){
                if(e.dead||e.type!=='zombie')continue;
                const d=Math.hypot(e.x-this.x,e.y-this.y);if(d<best){best=d;target=e;}
            }
            if(target){
                this.facing=Math.atan2(target.y-this.y,target.x-this.x);this.attackAnim=0.22;this.attackCD=OPT.AUTO_ATTACK_COOLDOWN;
                target.hp=(target.hp??(target.zType===1?1:2))-1;AudioSys.playAttack();
                if(target.hp<=0){target.dead=1;Game.spawn(new Effect(target.x,target.y,'burst'));}
            }
        }
        Game.updateBreathUI();
    };

    Player.prototype.draw=function(ctx){
        if(this.inv>0&&Date.now()%100<50)return;
        ctx.save();
        if(this.breathing){ctx.globalAlpha=0.62;ctx.scale(1,0.78);ctx.translate(0,8);}
        if(this.buffs.hoof>0){ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.fillStyle='rgba(161,136,127,0.3)';ctx.fill();}
        if(this.buffs.jade>0){ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.strokeStyle='#a5d6a7';ctx.lineWidth=2;ctx.stroke();}
        ctx.rotate(this.facing||0);
        const l1=Math.sin(this.stepPhase||0)*6,l2=Math.sin((this.stepPhase||0)+Math.PI)*6;
        ctx.fillStyle='#3e2723';ctx.fillRect(-8,-5+l1,6,12);ctx.fillRect(2,-5+l2,6,12);
        ctx.fillStyle='#d7ccc8';ctx.fillRect(-8,5+l1,6,4);ctx.fillRect(2,5+l2,6,4);
        ctx.fillStyle='#5d4037';ctx.fillRect(-10,-10,20,18);ctx.fillStyle='#8d6e63';ctx.fillRect(-8,-8,16,10);
        ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
        if(this.breathing){
            ctx.fillStyle='#d7ccc8';ctx.beginPath();ctx.arc(6,-3,4,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='rgba(90,120,110,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.stroke();
        }
        if(this.attackAnim>0&&this.hasShovel){
            const swing=(1-this.attackAnim/0.22)*1.5-0.7;ctx.save();ctx.rotate(swing);
            ctx.strokeStyle='#8d6e63';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(4,2);ctx.lineTo(31,2);ctx.stroke();
            ctx.fillStyle='#b0b0ad';ctx.fillRect(28,-5,12,14);ctx.restore();
        }
        if(this.pushing){ctx.fillStyle='rgba(230,210,170,.35)';ctx.fillRect(10,-11,15,4);}
        ctx.restore();
    };

    Game.setBreathing=function(on){
        if(!this.running||this.pause||!this.p)return;
        const next=!!on;
        if(next===!!this.p.breathing)return;
        this.p.breathing=next;
        this.p.breathLeft=next?OPT.BREATH_MAX:0;
        this.p.attackAnim=0;
        const btn=document.getElementById('breath-btn');
        if(btn)btn.classList.toggle('active',next);
        this.updateBreathUI();
    };
    Game.toggleBreath=function(){this.setBreathing(!this.p?.breathing);};
    Game.updateBreathUI=function(){
        const btn=document.getElementById('breath-btn'),timer=document.getElementById('breath-timer');
        if(!btn||!timer||!this.p)return;
        btn.textContent=curLang==='CN'?(this.p.breathing?'松气':'屏气'):(this.p.breathing?'RELEASE':'HOLD BREATH');
        timer.textContent=this.p.breathing?`${Math.ceil(this.p.breathLeft)}s`:'';
    };
    Game.dismissMoveTutorial=function(){
        const el=document.getElementById('move-tutorial');if(el)el.classList.add('done');
    };

    const baseLoad=Game.load.bind(Game);
    Game.load=function(level){
        baseLoad(level);
        this.ents=this.ents.filter(e=>e===this.p);
        this.p.hasShovel=this.saved?.hasShovel||level>1?1:0;
        this.p.facing=-Math.PI/2;this.p.breathing=false;this.p.breathLeft=0;this.p.attackCD=0;this.p.attackAnim=0;
        const rooms=MapSys.lastRooms;
        const at=(idx,ox=0,oy=0)=>{const c=center(rooms[Math.max(0,Math.min(rooms.length-1,idx))]);return{x:c.x+ox,y:c.y+oy};};
        const artifactIndex=Math.max(1,rooms.length-3),artifact=at(artifactIndex);
        this.ents.push(new Coffin(artifact.x,artifact.y,'artifact'));this.artifactPos={...artifact};
        const coffinIndexes=[1,2,3,Math.max(1,rooms.length-2)].filter((v,i,a)=>v<rooms.length-1&&a.indexOf(v)===i&&v!==artifactIndex);
        coffinIndexes.forEach((idx,i)=>{const p=at(idx,i%2?45:-45,0);this.ents.push(new Coffin(p.x,p.y,i%3===1?'zombie':'empty'));});
        if(level===1){
            const shovel=at(2);this.ents.push(new ShovelItem(shovel.x-70,shovel.y));
            const compass=at(1,-150,100);this.ents.push(new GroundItem(compass.x,compass.y,'item_compass'));
            const wine=at(4,150,90);this.ents.push(new GroundItem(wine.x,wine.y,'item_wine'));
        } else {
            const compass=at(1,-80,60);this.ents.push(new GroundItem(compass.x,compass.y,'item_compass'));
            const wine=at(Math.min(3,rooms.length-2),70,-60);this.ents.push(new GroundItem(wine.x,wine.y,'item_wine'));
            if(level%2===0){const jade=at(Math.min(4,rooms.length-2),-70,60);this.ents.push(new GroundItem(jade.x,jade.y,'item_jade'));}
        }
        const trapTypes=['ARROW','FIRE','STONE','LOG'];
        const trapCount=Math.min(2+Math.floor(level/2),6);
        for(let i=0;i<trapCount;i++){
            const idx=1+(i*2)%(Math.max(1,rooms.length-2)),p=at(idx,(i%2?1:-1)*Math.min(120,rooms[idx].w*14),-rooms[idx].h*14);
            const trap=new Trap(p.x,p.y,level-1);trap.pType=trapTypes[(level+i-1)%trapTypes.length];trap.revealed=false;this.ents.push(trap);
        }
        const zombieCount=Math.min(1+level,8);
        for(let i=0;i<zombieCount;i++){
            const idx=1+(i+2)%(Math.max(1,rooms.length-2)),p=at(idx,(i%3-1)*70,(i%2?1:-1)*55);
            if(Math.hypot(p.x-this.p.x,p.y-this.p.y)<170)continue;
            const z=new Zombie(p.x,p.y,i%5===4?2:(i%4===3?1:0));z.homeX=p.x;z.homeY=p.y;this.ents.push(z);
        }
        const blockerSpots=level===1?[
            {...at(3,-80,20),kind:'stele',radius:24},{...at(3,85,-25),kind:'column',radius:24},
            {...at(4,-160,0),kind:'column',radius:24},{...at(4,160,0),kind:'column',radius:24}
        ]:[
            {...at(Math.min(2,rooms.length-2),-70,0),kind:'stele',radius:23},
            {...at(Math.min(4,rooms.length-2),80,20),kind:'column',radius:24}
        ];
        blockerSpots.forEach(b=>this.ents.push(new Blocker(b.x,b.y,b.kind,b.radius)));
        this.exitRoom=rooms[rooms.length-1];
        this.exitPos={x:(this.exitRoom.x+this.exitRoom.w/2)*CONFIG.TILE,y:(this.exitRoom.y+0.5)*CONFIG.TILE};
        const tutorial=document.getElementById('move-tutorial');if(tutorial)tutorial.classList.toggle('visible',level===1),tutorial.classList.remove('done');
        this.updateHUD();this.refreshExploration();this.drawMinimap();this.updateBreathUI();
    };

    const baseConfirm=Game.confirmNextLevel.bind(Game);
    Game.confirmNextLevel=function(){
        if(this.p&&this.running&&this.exit&&document.getElementById('exit-modal').classList.contains('active')){
            this.saved={hp:this.p.hp,sight:this.p.sight,hasCompass:this.p.hasCompass,hasShovel:this.p.hasShovel};
        }
        baseConfirm();
    };

    const baseHUD=Game.updateHUD.bind(Game);
    Game.updateHUD=function(){
        baseHUD();
        if(!this.p)return;
        const objective=document.getElementById('objective');
        if(!this.exit)objective.textContent=curLang==='CN'?'探索墓室 · 寻找冥器线索':'Explore the tomb · find the relic clue';
        else objective.textContent=curLang==='CN'?'冥器线索已取得 · 前往墓道机关':'Relic clue found · reach the passage mechanism';
    };

    const baseUpdateUI=Game.updateUI.bind(Game);
    Game.updateUI=function(){
        baseUpdateUI();
        const hint=document.getElementById('control-hint');
        if(hint)hint.textContent=curLang==='CN'?'WASD 移动 · Shift 疾行 · B 屏气 · 靠近尸祟自动攻击':'WASD Move · Shift Sprint · B Hold Breath · auto-attack nearby threats';
        const desc=document.getElementById('guide-find-desc');
        if(desc)desc.textContent=curLang==='CN'?'拾取洛阳铲后，靠近尸祟会自动攻击；靠近棺椁会自动推开。':'With the shovel, nearby threats are attacked automatically; approach coffins to open them.';
        this.updateBreathUI();
    };

    const breathBtn=document.getElementById('breath-btn');
    if(breathBtn){
        breathBtn.addEventListener('pointerdown',e=>{e.preventDefault();Game.toggleBreath();});
        breathBtn.addEventListener('dblclick',e=>e.preventDefault());
    }
    window.addEventListener('keydown',e=>{
        if(e.code==='KeyB'&&!e.repeat&&Game.running&&!Game.pause){e.preventDefault();Game.toggleBreath();}
    });
    document.addEventListener('dblclick',e=>{
        if(e.target.closest?.('#ui-layer,#gameCanvas'))e.preventDefault();
    },{passive:false});

    Game.updateUI();
})();
