/*
 * Visual and environmental polish for Xunlong Jue.
 * Keeps decoration bounded: a small authored set per floor, no unbounded particles.
 */
(() => {
    'use strict';

    const roomCenter = (rooms, index) => {
        const r = rooms[Math.max(0, Math.min(rooms.length - 1, index))];
        return { x: (r.x + r.w / 2) * CONFIG.TILE, y: (r.y + r.h / 2) * CONFIG.TILE };
    };

    class TombDecor extends Entity {
        constructor(x, y, kind, scale = 1, solid = false) {
            super(x, y, solid ? 'blocker' : 'decor');
            this.kind = kind;
            this.scale = scale;
            this.radius = solid ? Math.max(14, 19 * scale) : 0;
            this.projectileBlocker = false;
        }
        draw(ctx) {
            const s = this.scale;
            ctx.save();
            ctx.scale(s, s);
            if (this.kind === 'bronzeLamp') this.drawBronzeLamp(ctx);
            else if (this.kind === 'pottery') this.drawPottery(ctx);
            else if (this.kind === 'ritualTable') this.drawRitualTable(ctx);
            else if (this.kind === 'guardian') this.drawGuardian(ctx);
            else if (this.kind === 'mural') this.drawMural(ctx);
            else if (this.kind === 'floorSeal') this.drawFloorSeal(ctx);
            else if (this.kind === 'sunDisc') this.drawSunDisc(ctx);
            else if (this.kind === 'fishSeal') this.drawFishSeal(ctx);
            else if (this.kind === 'nineGrid') this.drawNineGrid(ctx);
            else if (this.kind === 'beast') this.drawBeast(ctx);
            else if (this.kind === 'starSeal') this.drawStarSeal(ctx);
            else if (this.kind === 'faceMask') this.drawFaceMask(ctx);
            else if (this.kind === 'waterBasin') this.drawWaterBasin(ctx);
            else if (this.kind === 'bell') this.drawBell(ctx);
            else if (this.kind === 'imperialAltar') this.drawImperialAltar(ctx);
            ctx.restore();
        }
        drawBronzeLamp(ctx) {
            const pulse = 0.78 + Math.sin((Game.elapsed || 0) * 5 + this.x * 0.002) * 0.08;
            ctx.fillStyle = 'rgba(255,151,47,.08)'; ctx.beginPath(); ctx.arc(0, -24, 25, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#6e5637'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, -10); ctx.stroke();
            ctx.fillStyle = '#72522f'; ctx.fillRect(-10, 14, 20, 6); ctx.fillRect(-8, -14, 16, 5);
            ctx.fillStyle = `rgba(255,164,55,${pulse})`; ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(11, -20, 0, -13); ctx.quadraticCurveTo(-10, -21, 0, -34); ctx.fill();
        }
        drawPottery(ctx) {
            ctx.fillStyle = '#5a4030'; ctx.beginPath(); ctx.ellipse(-9, 4, 10, 15, -0.1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#74513a'; ctx.beginPath(); ctx.ellipse(10, 8, 8, 12, 0.15, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#98705a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-2, 0); ctx.moveTo(4, 5); ctx.lineTo(16, 5); ctx.stroke();
        }
        drawRitualTable(ctx) {
            ctx.fillStyle = '#33271f'; ctx.fillRect(-34, -12, 68, 24); ctx.fillStyle = '#5c4937'; ctx.fillRect(-38, -16, 76, 8);
            ctx.fillStyle = '#8f744c'; ctx.fillRect(-28, 10, 8, 18); ctx.fillRect(20, 10, 8, 18);
            ctx.fillStyle = '#716245'; ctx.beginPath(); ctx.arc(0, -17, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#b5965c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(0, -2); ctx.lineTo(12, -10); ctx.stroke();
        }
        drawGuardian(ctx) {
            ctx.fillStyle = '#4c4b45'; ctx.beginPath(); ctx.ellipse(0, 6, 18, 20, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#5c5a52'; ctx.beginPath(); ctx.arc(0, -14, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#191918'; ctx.fillRect(-6, -17, 3, 3); ctx.fillRect(3, -17, 3, 3);
            ctx.strokeStyle = '#77746a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, 16); ctx.lineTo(-19, 26); ctx.moveTo(14, 16); ctx.lineTo(19, 26); ctx.stroke();
        }
        drawMural(ctx) {
            ctx.fillStyle = 'rgba(83,66,50,.8)'; ctx.fillRect(-42, -24, 84, 48); ctx.strokeStyle = '#9a8058'; ctx.lineWidth = 2; ctx.strokeRect(-38, -20, 76, 40);
            ctx.strokeStyle = '#b08c57'; ctx.beginPath(); ctx.arc(-18, 0, 9, Math.PI, Math.PI * 2); ctx.arc(7, 2, 12, Math.PI, Math.PI * 2); ctx.moveTo(-30, 12); ctx.quadraticCurveTo(0, -5, 31, 12); ctx.stroke();
        }
        drawFloorSeal(ctx) {
            ctx.globalAlpha = 0.35; ctx.strokeStyle = '#8e7045'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36); ctx.stroke(); }
            ctx.globalAlpha = 1;
        }
        drawSunDisc(ctx) {
            ctx.strokeStyle = '#a37a34'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 25, Math.sin(a) * 25); ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34); ctx.stroke(); }
            ctx.fillStyle = '#6f512a'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        }
        drawFishSeal(ctx) {
            ctx.globalAlpha = 0.5; ctx.strokeStyle = '#a19a83'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#d4c7a5'; ctx.beginPath(); ctx.ellipse(-8, 0, 13, 7, -0.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#343330'; ctx.beginPath(); ctx.ellipse(8, 0, 13, 7, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
        drawNineGrid(ctx) {
            ctx.globalAlpha = 0.45; ctx.strokeStyle = '#a28e68'; ctx.lineWidth = 2;
            for (let i = -1; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-30, i * 20 - 10); ctx.lineTo(30, i * 20 - 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 20 - 10, -30); ctx.lineTo(i * 20 - 10, 30); ctx.stroke(); }
            ctx.globalAlpha = 1;
        }
        drawBeast(ctx) {
            ctx.fillStyle = '#4b5a4d'; ctx.beginPath(); ctx.arc(0, -7, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-13, 3, 26, 17);
            ctx.strokeStyle = '#74836f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-15, -24); ctx.moveTo(8, -14); ctx.lineTo(15, -24); ctx.stroke();
        }
        drawStarSeal(ctx) {
            ctx.strokeStyle = '#8792a5'; ctx.lineWidth = 2; ctx.globalAlpha = 0.55;
            const pts = [[0,-28],[20,-12],[25,12],[5,26],[-18,19],[-27,-5],[-10,-20]];
            ctx.beginPath(); pts.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.stroke();
            pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, Math.PI*2); ctx.fillStyle='#b7c2d1'; ctx.fill(); }); ctx.globalAlpha = 1;
        }
        drawFaceMask(ctx) {
            ctx.fillStyle = '#4c6b62'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 24, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#171b19'; ctx.beginPath(); ctx.ellipse(-6,-5,3,5,0,0,Math.PI*2); ctx.ellipse(6,-5,3,5,0,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle='#a08b62'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,5,7,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
        }
        drawWaterBasin(ctx) {
            ctx.fillStyle='#4a4e4d'; ctx.beginPath(); ctx.ellipse(0,4,28,13,0,0,Math.PI*2); ctx.fill(); ctx.fillRect(-22,4,44,10);
            ctx.fillStyle='rgba(76,157,171,.55)'; ctx.beginPath(); ctx.ellipse(0,1,21,8,0,0,Math.PI*2); ctx.fill();
        }
        drawBell(ctx) {
            ctx.fillStyle='#5f654f'; ctx.beginPath(); ctx.moveTo(-18,14); ctx.quadraticCurveTo(-14,-24,0,-29); ctx.quadraticCurveTo(14,-24,18,14); ctx.closePath(); ctx.fill();
            ctx.strokeStyle='#a18f5e'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-21,14); ctx.lineTo(21,14); ctx.stroke();
            ctx.fillStyle='#272a23'; ctx.beginPath(); ctx.arc(0,15,4,0,Math.PI*2); ctx.fill();
        }
        drawImperialAltar(ctx) {
            ctx.fillStyle='#3b3025'; ctx.fillRect(-42,-18,84,36); ctx.fillStyle='#67523b'; ctx.fillRect(-48,-23,96,10); ctx.fillStyle='#7d6543'; ctx.fillRect(-35,18,70,9);
            ctx.strokeStyle='#b09155'; ctx.lineWidth=2; ctx.strokeRect(-28,-11,56,20); ctx.beginPath(); ctx.arc(0,-1,9,0,Math.PI*2); ctx.stroke();
        }
    }

    class BloodPool extends Entity {
        constructor(x, y) { super(x, y - 1, 'blood_pool'); this.seed = ((x * 7 + y * 11) | 0) & 7; }
        draw(ctx) {
            ctx.save(); ctx.globalAlpha = 0.72; ctx.fillStyle = '#5b1111';
            ctx.beginPath(); ctx.ellipse(0, 7, 33 + this.seed, 16, 0.15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#781818'; ctx.beginPath(); ctx.ellipse(-24, 15, 14, 6, -0.35, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(25, 10, 12, 5, 0.4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    class SmokeCloud extends Entity {
        constructor(x, y, warm = false) { super(x, y + 2, 'smoke'); this.life = 4.8; this.maxLife = 4.8; this.warm = warm; }
        update(dt) { this.life -= dt; if (this.life <= 0) this.dead = 1; }
        draw(ctx) {
            const life = Math.max(0, this.life / this.maxLife); const spread = (1 - life) * 22; const t = Game.elapsed || 0;
            ctx.save();
            for (let i = 0; i < 6; i++) {
                const a = i * 1.83 + t * 0.12; const r = 8 + i * 3 + spread * 0.4;
                ctx.globalAlpha = life * (0.11 + (i % 2) * 0.025);
                ctx.fillStyle = this.warm ? '#9b6d54' : '#9aa09a';
                ctx.beginPath(); ctx.arc(Math.cos(a) * spread, -8 - i * 3 + Math.sin(a) * 5, r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }
    }

    const baseReveal = Coffin.prototype.reveal;
    Coffin.prototype.reveal = function() {
        if (!this._visualRevealDone) {
            this._visualRevealDone = true;
            if (this.content === 'zombie') Game.spawn(new BloodPool(this.x, this.y + 12));
            if (this.content === 'trap') Game.spawn(new SmokeCloud(this.x, this.y, true));
            if (this.content === 'artifact') Game.spawn(new SmokeCloud(this.x, this.y, false));
        }
        baseReveal.call(this);
    };

    const baseCoffinUpdate = Coffin.prototype.update;
    Coffin.prototype.update = function(dt) {
        baseCoffinUpdate.call(this, dt);
        if (this.opened && this.lidOffset < 48) this.lidOffset = Math.min(48, this.lidOffset + dt * 34);
    };

    function enhanceBlocker(blocker) {
        if (blocker._visualEnhanced) return;
        blocker._visualEnhanced = true;
        blocker.draw = function(ctx) {
            ctx.save();
            if (this.kind === 'stele') {
                ctx.fillStyle='#353633'; ctx.fillRect(-22,-36,44,64); ctx.fillStyle='#555650'; ctx.fillRect(-18,-31,36,52);
                ctx.strokeStyle='#807b69'; ctx.lineWidth=2; ctx.strokeRect(-15,-28,30,46);
                ctx.fillStyle='#a79b7b'; ctx.font='bold 13px serif'; ctx.textAlign='center'; ctx.fillText('镇',0,-4);
                ctx.strokeStyle='#6d6759'; ctx.beginPath(); ctx.moveTo(-12,7); ctx.lineTo(12,7); ctx.moveTo(-9,14); ctx.lineTo(9,14); ctx.stroke();
            } else {
                ctx.fillStyle='#292a28'; ctx.beginPath(); ctx.ellipse(0,0,24,30,0,0,Math.PI*2); ctx.fill();
                ctx.strokeStyle='#55564f'; ctx.lineWidth=6; ctx.beginPath(); ctx.ellipse(0,0,18,25,0,0,Math.PI*2); ctx.stroke();
                ctx.strokeStyle='#817a66'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-15,-13); ctx.lineTo(15,-13); ctx.moveTo(-17,12); ctx.lineTo(17,12); ctx.stroke();
            }
            ctx.restore();
        };
    }

    function addLevelDecor(game, level) {
        const rooms = MapSys.lastRooms || [];
        if (!rooms.length) return;
        const add = (kind, room, dx = 0, dy = 0, scale = 1, solid = false) => {
            const p = roomCenter(rooms, room); game.ents.push(new TombDecor(p.x + dx, p.y + dy, kind, scale, solid));
        };

        if (level === 1) {
            add('bronzeLamp',1,-180,-90,.9); add('bronzeLamp',1,180,-90,.9);
            add('pottery',2,-90,70,.9); add('pottery',2,95,-65,.8);
            add('pottery',3,-80,-65,.85);
            add('floorSeal',4,0,10,1.45); add('ritualTable',4,0,-125,1.05,true);
            add('bronzeLamp',4,-190,-105,.95); add('bronzeLamp',4,190,-105,.95);
            add('guardian',4,-175,115,1,true); add('guardian',4,175,115,1,true);
            add('mural',5,0,-105,1.2);
        } else if (level === 2) {
            add('sunDisc',1,-90,-65,1.1); add('sunDisc',3,90,45,.9); add('bronzeLamp',4,-100,70,.85); add('bronzeLamp',4,100,70,.85);
        } else if (level === 3) {
            add('fishSeal',1,0,0,1.3); add('fishSeal',4,-90,45,.8); add('fishSeal',5,90,45,.8);
        } else if (level === 4) {
            add('nineGrid',4,0,0,1.6); add('bronzeLamp',1,-80,60,.8); add('bronzeLamp',7,80,-55,.8);
        } else if (level === 5) {
            add('beast',1,-90,45,1,true); add('beast',2,90,45,1,true); add('beast',6,-80,-55,.9); add('beast',7,80,-55,.9);
        } else if (level === 6) {
            add('starSeal',4,0,0,1.5); add('guardian',6,-80,40,.85,true); add('guardian',8,80,40,.85,true);
        } else if (level === 7) {
            add('faceMask',2,0,0,1.1); add('faceMask',3,0,0,1.1); add('faceMask',7,0,0,1.1); add('faceMask',9,0,0,1.1);
        } else if (level === 8) {
            add('waterBasin',4,80,50,1.05,true); add('bronzeLamp',2,-90,45,.9); add('mural',6,70,-65,.85);
        } else if (level === 9) {
            add('bell',2,-70,25,1); add('bell',4,0,20,1.15); add('bell',6,70,25,.9); add('bell',8,-70,-30,.8); add('bell',9,70,-30,.8);
        } else if (level === 10) {
            add('floorSeal',5,0,15,1.8); add('imperialAltar',8,0,-90,1.2,true); add('guardian',7,-100,60,1.1,true); add('guardian',9,100,60,1.1,true);
            add('bronzeLamp',8,-155,-110,1); add('bronzeLamp',8,155,-110,1);
        }
    }

    const baseLoad = Game.load.bind(Game);
    Game.load = function(level) {
        baseLoad(level);
        document.body.classList.remove('breath-mode');
        for (const e of this.ents) if (e.type === 'blocker' && e.kind) enhanceBlocker(e);
        addLevelDecor(this, level);
    };

    const baseBreathing = Game.setBreathing.bind(Game);
    Game.setBreathing = function(on) {
        baseBreathing(on);
        document.body.classList.toggle('breath-mode', !!this.p?.breathing);
    };

    const baseOver = Game.over.bind(Game);
    Game.over = function() { document.body.classList.remove('breath-mode'); baseOver(); };
    const baseVictory = Game.victory.bind(Game);
    Game.victory = function() { document.body.classList.remove('breath-mode'); baseVictory(); };
})();
