/*
 * Relic puzzle progression for Xunlong Jue.
 * A relic reveals information; it never opens the next passage by itself.
 */
(() => {
    'use strict';

    const PUZZLES = [
        {
            type:'sequence', title:'玄龟星位', enTitle:'Tortoise Star Bearings',
            clue:'玄龟龟首朝北。三处青甲依次落在龟首上方、右后甲、左后甲。将墓门三枚星钮转到对应方位。',
            enClue:'The tortoise faces north. Three lit plates appear above its head, then on the rear-right and rear-left shell.',
            options:['北','东北','东','东南','南','西南','西','西北'], answer:['北','东南','西南'], max:3,
            hint1:'先确定龟首代表“北”，再判断两块后甲相对龟身的位置。', hint2:'第二个方位在东与南之间；第三个在西与南之间。'
        },
        {
            type:'sequence', title:'金乌逐日', enTitle:'Sun Crow Passage',
            clue:'灯座三足分别刻着初升、当空、西坠的太阳。按一日之中太阳经过的方向启动三枚日轮。',
            enClue:'The three legs show sunrise, high noon and sunset. Activate the sun wheels in that daily order.',
            options:['东','南','西','北'], answer:['东','南','西'], max:3,
            hint1:'从太阳升起的方向开始。', hint2:'顺序是日出 → 日中 → 日落。'
        },
        {
            type:'cycle', title:'双鱼归心', enTitle:'Twin Fish Inward',
            clue:'黑白必须交替，但仅有颜色还不够。玉佩上两鱼的眼都朝向中心。点击每一环，使颜色和朝向同时正确。',
            enClue:'Black and white must alternate, and every fish eye must face inward. Cycle each ring until both conditions are satisfied.',
            states:['黑·外','白·外','黑·内','白·内'], start:['白·外','黑·外','白·内','黑·外'], answer:['黑·内','白·内','黑·内','白·内'],
            hint1:'先处理黑白交替，再看“内/外”。', hint2:'从左到右应为黑、白、黑、白，而且全部朝内。'
        },
        {
            type:'permute', title:'洛书九宫', enTitle:'Luoshu Nine Palace',
            clue:'镜背九宫要求每一横、每一纵、两条斜线的点数之和一致。暗色格已经固定，只交换发光格。',
            enClue:'Every row, column and diagonal must have the same sum. Dark cells are fixed; swap only the glowing cells.',
            start:[4,2,9,3,5,6,8,1,7], answer:[4,9,2,3,5,7,8,1,6], editable:[1,2,5,8],
            hint1:'中央固定为 5；每条线的总数相同。', hint2:'第一行最终是 4、9、2。'
        },
        {
            type:'sequence', title:'六兽逆行', enTitle:'Six Beasts Reverse',
            clue:'玉璧残月位于马与猴之间，月痕旁有一道逆时针箭纹。以马为起点，沿逆时针依次读取六兽。',
            enClue:'The crescent lies between Horse and Monkey. An engraved arrow runs counter-clockwise. Start from Horse.',
            ring:['马','蛇','虎','鼠','犬','猴'], options:['鼠','虎','蛇','马','猴','犬'], answer:['马','蛇','虎','鼠','犬','猴'], max:6,
            hint1:'不要从“鼠”开始；月痕旁的马才是起点。', hint2:'沿 ↺ 方向读取。'
        },
        {
            type:'sequence', title:'七星生路', enTitle:'Seven-Star Safe Path',
            clue:'七星尺中第三、第六星周围有血色刻痕。只踩没有血痕且发亮的星位，按由近及远顺序通过甬道。',
            enClue:'The third and sixth stars carry blood-red scars. Step only on the lit, unscarred stars from near to far.',
            options:['1','2','3','4','5','6','7'], answer:['1','2','4','5','7'], max:5,
            hint1:'有血痕的 3 和 6 不能踩。', hint2:'保留其余亮星，并按数字递增。'
        },
        {
            type:'orientation', title:'四面有向', enTitle:'Four Faces, Four Meanings',
            clue:'喜见生，怒见兵，哀见死，惧者不敢见门。让四尊人面像面对它们应当注视的目标。',
            enClue:'Joy sees life, Anger sees arms, Sorrow sees death, Fear refuses to face the gate.',
            faces:['喜','怒','哀','惧'], directions:['出口','兵器','棺椁','背门'], answer:['出口','兵器','棺椁','背门'],
            hint1:'“生”对应出口，“死”对应棺椁。', hint2:'惧不是面向某物，而是背对墓门。'
        },
        {
            type:'sequence', title:'无字显纹', enTitle:'Wordless Revelation',
            clue:'竹简本无字。必须先在墓中观察火、水、血三种环境，让三段隐藏纹样依次显现，再回到墓门组合。',
            enClue:'The slips are blank until exposed to fire, water and blood. Discover all three hidden symbols before returning to the gate.',
            requires:['火','水','血'], options:['山','月','眼','水','火','门'], answer:['山','月','眼'], max:3,
            hint1:'缺少的环境线索不会在墓门前凭空出现。', hint2:'火显山，水显月，血显眼。'
        },
        {
            type:'sequence', title:'五音镇魂', enTitle:'Five-Tone Seal',
            clue:'钟腹纹样把五音分别记作一点到五点。冥器上的敲击痕依次是：一点、三点、五点、两点、四点。',
            enClue:'The five tones are marked with one to five dots. The strike marks read 1, 3, 5, 2, 4 dots.',
            legend:'宫=1点 · 商=2点 · 角=3点 · 徵=4点 · 羽=5点', options:['宫','商','角','徵','羽'], answer:['宫','角','羽','商','徵'], max:5,
            hint1:'先把音名换成点数。', hint2:'目标点数顺序是 1、3、5、2、4。'
        },
        {
            type:'composite', title:'天枢总印', enTitle:'Tianshu Final Seal',
            clue:'主墓总印要求同时校准“方位、显纹、次序”。三块残印散落在主墓外围，找齐之后才能完成最终机关。',
            enClue:'The final seal combines direction, revealed symbol and sequence. Recover all three fragments in the outer burial chambers first.',
            requires:['方','象','序'],
            directionOptions:['北','东','南','西'], directionAnswer:'北',
            symbolOptions:['山','月','眼'], symbolAnswer:'眼',
            orderOptions:['1','3','5','7'], orderAnswer:['1','5','3'],
            hint1:'三块残印分别对应三个独立条件。', hint2:'方位取北；显纹取眼；最后的次序是 1、5、3。'
        }
    ];

    const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    const puzzleFor=()=>PUZZLES[Math.max(0,Math.min(PUZZLES.length-1,Game.lvl-1))];
    const cn=()=>curLang==='CN';

    class TombMechanism extends Entity {
        constructor(x,y){super(x,y,'mechanism');this.radius=24;this.projectileBlocker=true;}
        draw(ctx){
            const solved=Game.exit, ready=Game.relicCollected;
            ctx.save();
            ctx.fillStyle=solved?'#405a45':ready?'#5a4931':'#302e2a';
            ctx.fillRect(-28,-34,56,68);
            ctx.strokeStyle=solved?'#a9d29e':ready?'#d7b06a':'#6b665c';ctx.lineWidth=3;ctx.strokeRect(-25,-31,50,62);
            ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.stroke();
            for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*7,Math.sin(a)*7);ctx.lineTo(Math.cos(a)*14,Math.sin(a)*14);ctx.stroke();}
            ctx.fillStyle=solved?'#bce3b5':ready?'#f0d49b':'#8e887c';ctx.font='12px serif';ctx.textAlign='center';ctx.fillText(solved?(cn()?'已开':'OPEN'):(ready?(cn()?'可解':'READY'):(cn()?'封':'SEALED')),0,52);
            ctx.restore();
        }
    }

    class WorldClue extends Entity {
        constructor(x,y,key,symbol,kind){super(x,y,'world_clue');this.key=key;this.symbol=symbol;this.kind=kind;this.t=0;}
        update(dt,p){
            this.t+=dt;
            if(Game.worldClues?.has(this.key))return;
            if(Math.hypot(this.x-p.x,this.y-p.y)<34){
                Game.worldClues.add(this.key);Game.worldClueValues[this.key]=this.symbol;
                AudioSys.playItem(true);
                Game.msg(cn()?`发现环境线索：${this.key} → ${this.symbol}`:`Clue found: ${this.key} → ${this.symbol}`,'#e0c58f');
                Game.updateHUD();
            }
        }
        draw(ctx){
            const found=Game.worldClues?.has(this.key);
            ctx.save();ctx.globalAlpha=found?0.35:0.95;
            if(this.kind==='fire'){
                ctx.fillStyle='#6d4c41';ctx.fillRect(-14,8,28,8);ctx.fillStyle='#ff8f00';ctx.beginPath();ctx.moveTo(0,-24);ctx.quadraticCurveTo(18,-2,0,7);ctx.quadraticCurveTo(-16,-3,0,-24);ctx.fill();
            } else if(this.kind==='water'){
                ctx.strokeStyle='#5bb8c7';ctx.lineWidth=3;for(let r=8;r<=20;r+=6){ctx.beginPath();ctx.ellipse(0,0,r,r/3,0,0,Math.PI*2);ctx.stroke();}
            } else if(this.kind==='blood'){
                ctx.fillStyle='rgba(125,22,22,.75)';ctx.beginPath();ctx.ellipse(0,3,22,13,0.2,0,Math.PI*2);ctx.fill();
            } else {
                ctx.fillStyle='#635b4d';ctx.fillRect(-17,-23,34,46);ctx.strokeStyle='#b89a65';ctx.strokeRect(-14,-20,28,40);
            }
            ctx.fillStyle='#e5d2a7';ctx.font='bold 13px serif';ctx.textAlign='center';ctx.fillText(found?'✓':this.key,0,-32);
            ctx.restore();
        }
    }

    const baseGetArtifact=Game.getArtifact.bind(Game);
    Game.getArtifact=function(){
        if(this.relicCollected||!this.running)return;
        const a=ARTIFACTS[this.lvl-1];
        this.relicCollected=true;
        this.art++;
        this.exit=0;
        this.artifactPos={...this.exitPos};
        AudioSys.playItem(true);
        this.msg(cn()?`发现冥器：${a.n} · 新的谜题线索已发现`:`Relic found: ${a.en} · new puzzle clue discovered`,'#dfc58c');
        this.updateHUD();
        this.refreshBuffs();
    };

    const baseLoad=Game.load.bind(Game);
    Game.load=function(level){
        baseLoad(level);
        this.relicCollected=false;
        this.puzzleAttempts=0;
        this.puzzleState=null;
        this.worldClues=new Set();
        this.worldClueValues={};
        const gate=new TombMechanism(this.exitPos.x,this.exitPos.y+34);
        this.ents.push(gate);
        const rooms=MapSys.lastRooms||[];
        const roomCenter=i=>{
            const r=rooms[Math.max(0,Math.min(rooms.length-1,i))];
            return{x:(r.x+r.w/2)*CONFIG.TILE,y:(r.y+r.h/2)*CONFIG.TILE};
        };
        if(level===8&&rooms.length>6){
            const f=roomCenter(2),w=roomCenter(4),b=roomCenter(6);
            this.ents.push(new WorldClue(f.x,f.y,'火','山','fire'));
            this.ents.push(new WorldClue(w.x,w.y,'水','月','water'));
            this.ents.push(new WorldClue(b.x,b.y,'血','眼','blood'));
        }
        if(level===10&&rooms.length>8){
            const a=roomCenter(3),b=roomCenter(6),c=roomCenter(8);
            this.ents.push(new WorldClue(a.x,a.y,'方','北','seal'));
            this.ents.push(new WorldClue(b.x,b.y,'象','眼','seal'));
            this.ents.push(new WorldClue(c.x,c.y,'序','1-5-3','seal'));
        }
        this.hideMechanismButton();
        this.updateHUD();
    };

    Game.hideMechanismButton=function(){
        const b=document.getElementById('mechanism-btn');if(b)b.classList.remove('visible');
    };
    Game.updateMechanismButton=function(){
        const b=document.getElementById('mechanism-btn');if(!b||!this.p)return;
        const near=Math.hypot(this.exitPos.x-this.p.x,(this.exitPos.y+34)-this.p.y)<86;
        b.classList.toggle('visible',!!(near&&this.relicCollected&&!this.exit&&!this.pause));
        b.textContent=cn()?'机关':'MECHANISM';
    };

    const baseStep=Game.step.bind(Game);
    Game.step=function(dt){
        baseStep(dt);
        if(!this.running)return;
        this.updateMechanismButton();
    };

    const baseHUD=Game.updateHUD.bind(Game);
    Game.updateHUD=function(){
        baseHUD();
        if(!this.p)return;
        const objective=document.getElementById('objective');
        if(!this.relicCollected&&!this.exit){
            objective.textContent=cn()?'探索墓室 · 寻找冥器线索':'Explore the tomb · find the relic clue';
        } else if(this.relicCollected&&!this.exit){
            const def=puzzleFor();
            const missing=(def.requires||[]).filter(k=>!this.worldClues?.has(k));
            objective.textContent=missing.length?(cn()?`冥器已发现 · 继续寻找环境线索 ${missing.length}/${def.requires.length}`:`Relic found · ${missing.length} environmental clues remain`):(cn()?'冥器已发现 · 前往墓道机关解谜':'Relic found · solve the passage mechanism');
        } else {
            objective.textContent=cn()?'墓道机关已解 · 前往开启的盗洞':'Mechanism solved · enter the opened passage';
        }
        document.getElementById('artifact-bar').innerText=`${LANG[curLang].artLabel}: ${this.art}/10`;
    };

    Game.resetPuzzleState=function(){
        const d=puzzleFor();
        if(d.type==='sequence')this.puzzleState=[];
        else if(d.type==='cycle')this.puzzleState=d.start.slice();
        else if(d.type==='permute')this.puzzleState={values:d.start.slice(),selected:null};
        else if(d.type==='orientation')this.puzzleState=d.faces.map(()=>0);
        else if(d.type==='composite')this.puzzleState={direction:null,symbol:null,order:[]};
    };

    Game.openPuzzle=function(){
        if(!this.running||this.pause||!this.relicCollected||this.exit)return;
        this.pause=true;Input.reset();this.hideMechanismButton();
        if(!this.puzzleState)this.resetPuzzleState();
        document.getElementById('puzzle-modal').classList.add('active');
        this.renderPuzzle();
    };
    Game.closePuzzle=function(){
        const m=document.getElementById('puzzle-modal');if(m)m.classList.remove('active');
        if(this.running)this.pause=false;
        this.lastTime=null;this.accumulator=0;
    };

    Game.renderPuzzle=function(){
        const d=puzzleFor(),a=ARTIFACTS[this.lvl-1],board=document.getElementById('puzzle-board');
        document.getElementById('puzzle-title').textContent=cn()?d.title:d.enTitle;
        document.getElementById('puzzle-relic').textContent=`${a.i||'◆'} ${cn()?a.n:a.en}`;
        document.getElementById('puzzle-clue').textContent=cn()?d.clue:d.enClue;
        const req=d.requires||[],missing=req.filter(k=>!this.worldClues?.has(k));
        const found=req.map(k=>`${k}${this.worldClueValues?.[k]?`→${this.worldClueValues[k]}`:''}`).join('　');
        document.getElementById('puzzle-world-clues').textContent=req.length?(cn()?`环境线索：${found||'尚未发现'}${missing.length?`（缺 ${missing.length}）`:''}`:`World clues: ${found||'none'}${missing.length?` (${missing.length} missing)`:''}`):'';
        document.getElementById('puzzle-feedback').textContent='';
        const hint=this.puzzleAttempts>=5?d.hint2:this.puzzleAttempts>=3?d.hint1:'';
        document.getElementById('puzzle-hint').textContent=hint?(cn()?`提示：${hint}`:`Hint: ${hint}`):'';
        const submit=document.getElementById('puzzle-submit-btn');submit.disabled=missing.length>0;
        submit.textContent=cn()?'确认机关':'CONFIRM';
        document.getElementById('puzzle-reset-btn').textContent=cn()?'重置':'RESET';
        document.getElementById('puzzle-close-btn').textContent=cn()?'离开机关':'LEAVE';

        if(d.type==='sequence'){
            const sel=this.puzzleState||[];
            const ring=d.ring?`<div class="puzzle-ring">月痕 ◀ ${d.ring.join(' · ')} ↺</div>`:'';
            const legend=d.legend?`<div class="puzzle-legend">${d.legend}</div>`:'';
            board.innerHTML=`${ring}${legend}<div class="puzzle-options">${d.options.map(o=>`<button data-puzzle="sequence" data-value="${o}" class="${sel.includes(o)?'chosen':''}">${o}</button>`).join('')}</div><div class="puzzle-selection">${cn()?'当前':'Selected'}：${sel.join(' → ')||'—'}</div>`;
        } else if(d.type==='cycle'){
            board.innerHTML=`<div class="puzzle-slots">${this.puzzleState.map((v,i)=>`<button data-puzzle="cycle" data-index="${i}"><span>${i+1}</span>${v}</button>`).join('')}</div>`;
        } else if(d.type==='permute'){
            const s=this.puzzleState;
            board.innerHTML=`<div class="nine-grid">${s.values.map((v,i)=>`<button data-puzzle="permute" data-index="${i}" ${d.editable.includes(i)?'':'disabled'} class="${s.selected===i?'selected':''}">${'●'.repeat(v)}</button>`).join('')}</div><div class="puzzle-selection">${cn()?'点两个发光格交换位置':'Select two glowing cells to swap'}</div>`;
        } else if(d.type==='orientation'){
            board.innerHTML=`<div class="face-grid">${d.faces.map((f,i)=>`<button data-puzzle="orientation" data-index="${i}"><strong>${f}</strong><span>${d.directions[this.puzzleState[i]]}</span></button>`).join('')}</div>`;
        } else if(d.type==='composite'){
            const s=this.puzzleState;
            board.innerHTML=`<div class="composite-group"><b>${cn()?'方位':'Direction'}</b>${d.directionOptions.map(o=>`<button data-puzzle="comp-dir" data-value="${o}" class="${s.direction===o?'chosen':''}">${o}</button>`).join('')}</div><div class="composite-group"><b>${cn()?'显纹':'Symbol'}</b>${d.symbolOptions.map(o=>`<button data-puzzle="comp-symbol" data-value="${o}" class="${s.symbol===o?'chosen':''}">${o}</button>`).join('')}</div><div class="composite-group"><b>${cn()?'次序':'Order'}</b>${d.orderOptions.map(o=>`<button data-puzzle="comp-order" data-value="${o}" class="${s.order.includes(o)?'chosen':''}">${o}</button>`).join('')}<div>${s.order.join(' → ')||'—'}</div></div>`;
        }
    };

    Game.handlePuzzleButton=function(btn){
        const d=puzzleFor(),kind=btn.dataset.puzzle,value=btn.dataset.value,index=Number(btn.dataset.index);
        if(kind==='sequence'){
            const arr=this.puzzleState;if(arr.includes(value))arr.splice(arr.indexOf(value),1);else if(arr.length<(d.max||99))arr.push(value);
        } else if(kind==='cycle'){
            const current=d.states.indexOf(this.puzzleState[index]);this.puzzleState[index]=d.states[(current+1)%d.states.length];
        } else if(kind==='permute'){
            const s=this.puzzleState;if(!d.editable.includes(index))return;
            if(s.selected===null)s.selected=index;else if(s.selected===index)s.selected=null;else{[s.values[s.selected],s.values[index]]=[s.values[index],s.values[s.selected]];s.selected=null;}
        } else if(kind==='orientation'){
            this.puzzleState[index]=(this.puzzleState[index]+1)%d.directions.length;
        } else if(kind==='comp-dir')this.puzzleState.direction=value;
        else if(kind==='comp-symbol')this.puzzleState.symbol=value;
        else if(kind==='comp-order'){
            const arr=this.puzzleState.order;if(arr.includes(value))arr.splice(arr.indexOf(value),1);else if(arr.length<3)arr.push(value);
        }
        this.renderPuzzle();
    };

    Game.checkPuzzle=function(){
        const d=puzzleFor();
        const missing=(d.requires||[]).filter(k=>!this.worldClues?.has(k));
        if(missing.length){document.getElementById('puzzle-feedback').textContent=cn()?'线索尚未找齐。':'More clues are required.';return;}
        let ok=false;
        if(d.type==='sequence')ok=same(this.puzzleState,d.answer);
        else if(d.type==='cycle')ok=same(this.puzzleState,d.answer);
        else if(d.type==='permute')ok=same(this.puzzleState.values,d.answer);
        else if(d.type==='orientation')ok=same(this.puzzleState.map((v,i)=>d.directions[v]),d.answer);
        else if(d.type==='composite')ok=this.puzzleState.direction===d.directionAnswer&&this.puzzleState.symbol===d.symbolAnswer&&same(this.puzzleState.order,d.orderAnswer);
        if(ok){this.solvePuzzle();return;}
        this.puzzleAttempts++;
        if(this.p.hp>1){this.p.hp--;this.p.inv=1;AudioSys.playHurt();this.shake=8;this.updateHUD();}
        document.getElementById('puzzle-feedback').textContent=cn()?'机关错位，墓中传来危险的机括声。':'Wrong setting. A dangerous mechanism answers from inside the tomb.';
        if(this.puzzleAttempts===3||this.puzzleAttempts===5)setTimeout(()=>{if(document.getElementById('puzzle-modal').classList.contains('active'))this.renderPuzzle();},350);
    };

    Game.solvePuzzle=function(){
        this.exit=1;this.puzzleSolved=true;AudioSys.playOpen();
        this.msg(cn()?'机关归位 · 下一层墓道开启':'Mechanism aligned · passage opened','#b9d99b');
        this.updateHUD();
        document.getElementById('puzzle-feedback').textContent=cn()?'石门深处传来沉重的齿轮声。':'Heavy gears turn behind the stone gate.';
        setTimeout(()=>this.closePuzzle(),450);
    };

    Game.resetPuzzleUI=function(){this.resetPuzzleState();this.renderPuzzle();};

    const board=document.getElementById('puzzle-board');
    if(board)board.addEventListener('click',e=>{const b=e.target.closest('button[data-puzzle]');if(b)Game.handlePuzzleButton(b);});
    document.getElementById('puzzle-submit-btn')?.addEventListener('click',()=>Game.checkPuzzle());
    document.getElementById('puzzle-reset-btn')?.addEventListener('click',()=>Game.resetPuzzleUI());
    document.getElementById('puzzle-close-btn')?.addEventListener('click',()=>Game.closePuzzle());
    document.getElementById('mechanism-btn')?.addEventListener('pointerdown',e=>{e.preventDefault();Game.openPuzzle();});

    window.addEventListener('keydown',e=>{
        const modal=document.getElementById('puzzle-modal');
        if(modal?.classList.contains('active')&&e.code==='Escape'){
            e.preventDefault();e.stopImmediatePropagation();Game.closePuzzle();return;
        }
        if(e.code==='KeyE'&&!e.repeat&&Game.running&&!Game.pause){
            const btn=document.getElementById('mechanism-btn');if(btn?.classList.contains('visible')){e.preventDefault();Game.openPuzzle();}
        }
    },true);

    const baseUpdateUI=Game.updateUI.bind(Game);
    Game.updateUI=function(){baseUpdateUI();this.updateHUD();this.updateMechanismButton();};
})();
