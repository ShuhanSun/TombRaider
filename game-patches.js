/* Small post-load fixes that depend on the optimized level entities existing. */
(() => {
    'use strict';
    const optimizedLoad=Game.load.bind(Game);
    Game.load=function(level){
        optimizedLoad(level);
        const coffins=this.ents.filter(e=>e.type==='coffin');
        for(const z of this.ents){
            if(z.type!=='zombie'||!coffins.length) continue;
            let home=coffins[0],best=Infinity;
            for(const c of coffins){
                const d=Math.hypot(c.x-z.x,c.y-z.y);
                if(d<best){best=d;home=c;}
            }
            z.homeX=home.x;
            z.homeY=home.y;
        }
    };
})();
