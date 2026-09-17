/* Defensive compatibility for UI calls before a player exists. */
(() => {
    'use strict';
    const puzzleUpdateUI=Game.updateUI.bind(Game);
    Game.updateUI=function(){
        if(this.p){ puzzleUpdateUI(); return; }
        try { puzzleUpdateUI(); }
        catch(err){
            // The wrapped legacy HUD expects a player; start-screen localization is already applied before that point.
            if(this.p) throw err;
        }
    };
})();
