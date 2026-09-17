/*
 * Central runtime adapter for Xunlong Jue.
 * Owns hot-path entity queries and compatibility glue so feature modules do not stack tiny patches.
 */
(() => {
    'use strict';

    const RUNTIME = Object.freeze({
        BLOCKER_MARGIN: 12,
        AUTO_ATTACK_RANGE: 58,
        AUTO_ATTACK_COOLDOWN: 0.55,
        BREATH_MAX: 30,
        BREATH_MOVE_SCALE: 0.34
    });

    const buckets = new Map();

    function addToIndex(entity) {
        if (!entity || !entity.type) return;
        let list = buckets.get(entity.type);
        if (!list) buckets.set(entity.type, list = []);
        list.push(entity);
        if (entity.projectileBlocker) {
            let blockers = buckets.get('projectileBlocker');
            if (!blockers) buckets.set('projectileBlocker', blockers = []);
            blockers.push(entity);
        }
    }

    Game.rebuildEntityIndex = function() {
        buckets.clear();
        for (const entity of this.ents) addToIndex(entity);
        return buckets;
    };

    Game.entitiesOf = function(type) {
        return buckets.get(type) || [];
    };

    Game.nearestEntity = function(type, x, y, maxDistance = Infinity, predicate = null) {
        let best = null;
        let bestDistance = maxDistance;
        for (const entity of this.entitiesOf(type)) {
            if (entity.dead || (predicate && !predicate(entity))) continue;
            const distance = Math.hypot(entity.x - x, entity.y - y);
            if (distance < bestDistance) {
                best = entity;
                bestDistance = distance;
            }
        }
        return best;
    };

    Game.assignZombieHome = function(zombie) {
        if (!zombie || zombie.type !== 'zombie') return zombie;
        const home = this.nearestEntity('coffin', zombie.x, zombie.y);
        if (home) {
            zombie.homeX = home.x;
            zombie.homeY = home.y;
        } else {
            zombie.homeX ??= zombie.x;
            zombie.homeY ??= zombie.y;
        }
        return zombie;
    };

    const baseSpawn = Game.spawn.bind(Game);
    Game.spawn = function(entity) {
        baseSpawn(entity);
        addToIndex(entity);
        if (entity?.type === 'zombie') this.assignZombieHome(entity);
        return entity;
    };

    const baseLoad = Game.load.bind(Game);
    Game.load = function(level) {
        baseLoad(level);
        this.rebuildEntityIndex();
        for (const zombie of this.entitiesOf('zombie')) this.assignZombieHome(zombie);
    };

    const baseStep = Game.step.bind(Game);
    Game.step = function(dt) {
        baseStep(dt);
        if (this.running) this.rebuildEntityIndex();
    };

    // Preserve the optimized player behavior while replacing repeated full-array scans
    // with indexed type queries. This is a hot path on every simulation tick.
    Player.prototype.update = function(dt) {
        this.pushing = false;
        this.attackCD = Math.max(0, (this.attackCD || 0) - dt);
        this.attackAnim = Math.max(0, (this.attackAnim || 0) - dt);
        if (this.inv > 0) this.inv -= dt;
        if (this.buffs.hoof > 0) this.buffs.hoof -= dt;
        if (this.buffs.candle > 0) this.buffs.candle -= dt;
        if (this.buffs.jade > 0) this.buffs.jade -= dt;
        if (this.breathing) {
            this.breathLeft = Math.max(0, (this.breathLeft ?? RUNTIME.BREATH_MAX) - dt);
            if (this.breathLeft <= 0) Game.setBreathing(false);
        }

        let speed = 160;
        if (Input.sprint && !this.breathing) speed *= 1.5;
        if (this.breathing) speed *= RUNTIME.BREATH_MOVE_SCALE;
        if (MapSys.get(this.x, this.y) === TERRAIN.WATER) speed *= 0.5;

        const oldX = this.x, oldY = this.y;
        if (Input.active) {
            this.facing = Math.atan2(Input.y, Input.x);
            const nx = this.x + Input.x * speed * dt;
            const ny = this.y + Input.y * speed * dt;
            if (MapSys.canOccupy(nx, this.y, 10)) this.x = nx;
            if (MapSys.canOccupy(this.x, ny, 10)) this.y = ny;

            for (const blocker of Game.entitiesOf('blocker')) {
                if (blocker.dead) continue;
                if (Math.hypot(this.x - blocker.x, this.y - blocker.y) < (blocker.radius || 20) + RUNTIME.BLOCKER_MARGIN) {
                    this.x = oldX;
                    this.y = oldY;
                    break;
                }
            }

            this.stepPhase += dt * (this.breathing ? 4 : 10);
            this.walkT += dt;
            if (this.walkT > 0.4) { AudioSys.playStep(); this.walkT = 0; }
            if (Game.lvl === 1) Game.dismissMoveTutorial();
        } else {
            this.stepPhase = 0;
        }

        let nearCoffin = false;
        for (const coffin of Game.entitiesOf('coffin')) {
            if (!coffin.opened && !coffin.dead && Math.hypot(coffin.x - this.x, coffin.y - this.y) < 50) {
                nearCoffin = true;
                break;
            }
        }

        if (this.hasShovel && !this.breathing && !nearCoffin && this.attackCD <= 0) {
            const target = Game.nearestEntity('zombie', this.x, this.y, RUNTIME.AUTO_ATTACK_RANGE);
            if (target) {
                this.facing = Math.atan2(target.y - this.y, target.x - this.x);
                this.attackAnim = 0.22;
                this.attackCD = RUNTIME.AUTO_ATTACK_COOLDOWN;
                target.hp = (target.hp ?? (target.zType === 1 ? 1 : 2)) - 1;
                AudioSys.playAttack();
                if (target.hp <= 0) {
                    target.dead = 1;
                    Game.spawn(new Effect(target.x, target.y, 'burst'));
                }
            }
        }
        Game.updateBreathUI();
    };

    Projectile.prototype.update = function(dt, player) {
        if (this.dead) return;
        this.life -= dt;
        if (this.life < 0) { this.dead = 1; return; }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (MapSys.get(this.x, this.y) === TERRAIN.WALL) { this.dead = 1; return; }

        for (const blocker of Game.entitiesOf('projectileBlocker')) {
            if (blocker.dead) continue;
            if (Math.hypot(this.x - blocker.x, this.y - blocker.y) < (blocker.radius || 20) + this.info.size) {
                this.dead = 1;
                return;
            }
        }

        if (this.info !== PROJ_TYPES.VENOM) {
            for (const zombie of Game.entitiesOf('zombie')) {
                if (zombie.dead) continue;
                if (Math.hypot(this.x - zombie.x, this.y - zombie.y) < this.info.size + 12) {
                    zombie.hp = (zombie.hp ?? 2) - 1;
                    this.dead = 1;
                    if (zombie.hp <= 0) {
                        zombie.dead = 1;
                        Game.spawn(new Effect(zombie.x, zombie.y, 'burst'));
                    }
                    return;
                }
            }
        }

        if (Math.hypot(this.x - player.x, this.y - player.y) < this.info.size + 10) {
            if (player.buffs.jade > 0) this.dead = 1;
            else { player.hit(); this.dead = 1; }
        }
    };

    // Replaces the old one-off game-patches.js behavior.
    Game.rebuildEntityIndex();
    for (const zombie of Game.entitiesOf('zombie')) Game.assignZombieHome(zombie);

    // Replaces puzzle-patches.js: localization can run on the start screen before a player exists.
    const featureUpdateUI = Game.updateUI.bind(Game);
    Game.updateUI = function() {
        if (this.p) return featureUpdateUI();
        try { featureUpdateUI(); }
        catch (err) {
            if (this.p) throw err;
        }
    };
})();
