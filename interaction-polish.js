/* Interaction polish: contextual teaching and visible zombie return-to-coffin behavior. */
(() => {
    'use strict';

    const baseZombieUpdate = Zombie.prototype.update;
    const baseZombieDraw = Zombie.prototype.draw;
    Zombie.prototype.update = function(dt, p) {
        if (this.returningToCoffin) {
            this.returnTimer -= dt;
            this.returnProgress = Math.max(0, this.returnTimer / 0.7);
            const dx=(this.homeX??this.x)-this.x, dy=(this.homeY??this.y)-this.y, d=Math.hypot(dx,dy);
            if(d>2){this.x+=dx/(d||1)*22*dt;this.y+=dy/(d||1)*22*dt;}
            if(this.returnTimer<=0)this.dead=1;
            return;
        }
        const homeDist=this.homeX===undefined?Infinity:Math.hypot(this.x-this.homeX,this.y-this.homeY);
        baseZombieUpdate.call(this,dt,p);
        if(this.dead && p.breathing && homeDist<22){
            this.dead=0;this.returningToCoffin=true;this.returnTimer=0.7;this.returnProgress=1;
        }
    };
    Zombie.prototype.draw = function(ctx) {
        if(this.returningToCoffin){
            const a=Math.max(0,this.returnProgress||0);
            ctx.save();ctx.globalAlpha=a;ctx.translate(0,(1-a)*18);ctx.scale(.78+.22*a,.78+.22*a);baseZombieDraw.call(this,ctx);ctx.restore();return;
        }
        baseZombieDraw.call(this,ctx);
    };

    const coach={
        shown:new Set(), active:null, until:0,
        show(key,cn,en,duration=5){
            if(this.shown.has(key))return;
            this.shown.add(key);this.active=key;this.until=(Game.elapsed||0)+duration;
            const el=document.getElementById('context-tutorial');if(!el)return;
            el.textContent=curLang==='CN'?cn:en;el.classList.add('visible');
        },
        hide(key){if(key&&this.active!==key)return;const el=document.getElementById('context-tutorial');if(el)el.classList.remove('visible');this.active=null;},
        reset(){this.shown.clear();this.active=null;this.until=0;this.hide();}
    };

    const baseRestart=Game.restart.bind(Game);
    Game.restart=function(){coach.reset();baseRestart();};

    const baseLoad=Game.load.bind(Game);
    Game.load=function(level){
        baseLoad(level);
        if(level!==1)coach.hide();
        this._teach={hasShovel:!!this.p.hasShovel, relic:!!this.relicCollected, trap:false, attack:false, breath:false};
    };

    const baseStep=Game.step.bind(Game);
    Game.step=function(dt){
        baseStep(dt); if(!this.running||this.lvl!==1||!this.p)return;
        const t=this._teach||(this._teach={});
        if(!t.hasShovel&&this.p.hasShovel){t.hasShovel=true;coach.show('shovel','洛阳铲已收入物品栏。靠近尸祟会自动挥铲，不需要攻击按钮。','Shovel stored. Move close to a threat to attack automatically.');}
        if(!t.attack&&this.p.attackAnim>0){t.attack=true;coach.hide('shovel');}
        const nearbyZombie=Game.entitiesOf('zombie').some(e=>!e.dead&&Math.hypot(e.x-this.p.x,e.y-this.p.y)<180);
        if(nearbyZombie&&!t.breath&&t.hasShovel){coach.show('breath','遇到尸祟时可按“屏气”。你仍能缓慢移动，尸祟会先停住，再退回棺中。','Hold Breath near undead: you can still move slowly while they lose you and return to a coffin.',7);}
        if(this.p.breathing&&!t.breath){t.breath=true;coach.hide('breath');}
        const revealed=Game.entitiesOf('trap').some(e=>e.revealed&&!e.dead);
        if(revealed&&!t.trap){t.trap=true;coach.show('trap','机关一旦显露就不会重新隐藏。石碑、石柱可挡住直线射击。','Revealed traps stay visible. Steles and columns block straight projectiles.',7);}
        if(this.relicCollected&&!t.relic){t.relic=true;coach.show('relic','冥器上的纹路不像装饰。先记住它的图像，再观察墓室里有没有相似结构。','The markings are not decoration. Remember the image and look for a matching structure in the tomb.',7);}
        if(coach.active&&(Game.elapsed||0)>coach.until)coach.hide();
    };

    const baseUpdateUI=Game.updateUI.bind(Game);
    Game.updateUI=function(){baseUpdateUI();if(coach.active){const el=document.getElementById('context-tutorial');if(el){const map={shovel:['洛阳铲已收入物品栏。靠近尸祟会自动挥铲，不需要攻击按钮。','Shovel stored. Move close to a threat to attack automatically.'],breath:['遇到尸祟时可按“屏气”。你仍能缓慢移动，尸祟会先停住，再退回棺中。','Hold Breath near undead: you can still move slowly while they lose you and return to a coffin.'],trap:['机关一旦显露就不会重新隐藏。石碑、石柱可挡住直线射击。','Revealed traps stay visible. Steles and columns block straight projectiles.'],relic:['冥器上的纹路不像装饰。先记住它的图像，再观察墓室里有没有相似结构。','The markings are not decoration. Remember the image and look for a matching structure in the tomb.']};const v=map[coach.active];if(v)el.textContent=curLang==='CN'?v[0]:v[1];}}};
})();
