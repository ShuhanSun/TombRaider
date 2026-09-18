/*
 * Relic puzzle progression for Xunlong Jue.
 * A relic reveals information; it never opens the next passage by itself.
 */
(() => {
    'use strict';


    const RELIC_DEFINITIONS = [
        {name:'玄龟镇墓盘',en:'Xuan Turtle Burial Disk',icon:'🐢',pattern:'玄龟负北斗，龟甲八分；三片星甲的位置每次入墓都会变化。',desc:'暗青石盘中央伏着玄龟，龟甲分成八块，边缘刻八方。三片甲纹微亮，显然不是装饰，而是墓道生门的方位密码。'},
        {name:'三足金乌灯',en:'Three-Legged Sun Crow Lamp',icon:'🪔',pattern:'三足分别刻日升、日中、日落；墓室朝向变化时，金乌投影也会整体偏转。',desc:'青铜油灯的灯座铸成三足金乌。灯火照墙时，乌影随三足刻痕显出一日太阳运行的次序。'},
        {name:'双鱼阴阳佩',en:'Twin-Fish Yin-Yang Pendant',icon:'☯',pattern:'黑白双鱼相衔，黑鱼白眼、白鱼黑眼；四环可转，鱼眼均可朝内或朝外。',desc:'残缺玉佩由黑白双鱼组成。颜色只是第一层线索，鱼眼的朝向才决定阴阳是否真正归位。'},
        {name:'九宫洛书镜',en:'Luoshu Nine-Palace Mirror',icon:'🪞',pattern:'镜背刻九宫点阵，中央五点；横、纵、斜三线皆须同数。',desc:'裂纹古铜镜背面不是花纹，而是一座九宫。部分格位固定，剩余点阵必须按洛书规律复原。'},
        {name:'六兽司辰璧',en:'Six-Beast Time Jade',icon:'🐾',pattern:'六边黑玉刻鼠、虎、蛇、马、猴、犬，残月旁留有逆时针箭纹。',desc:'六兽不是生肖摆设，而是一圈读取顺序。残月决定起点，逆行刻痕决定方向。'},
        {name:'七星葬魂尺',en:'Seven-Star Soul Ruler',icon:'📏',pattern:'七颗星石由近及远嵌入黑木，每次会有两至三颗被血色刻痕圈住。',desc:'短尺上的七星对应墓门前的踏板。血痕星位代表死路，亮星则标示可踏的生路。'},
        {name:'人面青铜觚',en:'Bronze Gu of Four Faces',icon:'🏺',pattern:'器身四面为喜、怒、哀、惧，四张脸的眼神分别指向不同目标。',desc:'青铜觚上的四张人脸不是表情装饰。它们借“生、兵、死、门”的隐语指向墓室里的真实方位。'},
        {name:'无字天机简',en:'Wordless Celestial Slips',icon:'🎋',pattern:'黑竹简表面无字；火照、水映、血染会显出每局不同的暗纹。',desc:'竹简本身不给答案。只有把它带过墓中的火、水、血三处环境，隐藏纹样才会逐段显现。'},
        {name:'五行镇墓鼎',en:'Five-Phase Sepulcher Cauldron',icon:'鼎',pattern:'方鼎五面分刻木、火、土、金、水，鼎耳箭纹首尾相接。',desc:'青铜方鼎把五行刻成一条闭合的相生链。墓门机关要求按“生”的次序，而不是按相克关系启动。'},
        {name:'天门合契璧',en:'Heaven-Gate Covenant Jade',icon:'◈',pattern:'白玉合璧分天、地、人、龙四契；天居上、地承下、人处中，龙契最终封合中枢。',desc:'最终合璧并非一整块玉。主墓外围散落天地人三枚残契，找齐后才能在墓门处以龙契完成最后闭合。'}
    ];

    RELIC_DEFINITIONS.forEach((r,i)=>{
        if(!ARTIFACTS[i])return;
        ARTIFACTS[i].n=r.name;
        ARTIFACTS[i].en=r.en;
        ARTIFACTS[i].i=r.icon;
        ARTIFACTS[i].d=r.desc;
        ARTIFACTS[i].end=r.pattern;
    });

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
            type:'sequence', title:'五行归环', enTitle:'Five Phases in Cycle',
            clue:'方鼎五面依次刻木、火、土、金、水，鼎耳箭纹首尾相接。按五行相生的次序启动五枚机关。',
            enClue:'The cauldron marks Wood, Fire, Earth, Metal and Water in a closed generating cycle. Activate them in the generating order.',
            options:['木','火','土','金','水'], answer:['木','火','土','金','水'], max:5,
            hint1:'这里考的是“相生”，不是相克。', hint2:'木生火，火生土，土生金，金生水。'
        },
        {
            type:'sequence', title:'天门合契', enTitle:'Heaven-Gate Covenant',
            clue:'白玉合璧分天、地、人、龙四契。先在主墓外围找齐天、地、人三枚残契，再按“天覆、地承、人居其中、龙守中枢”的次序闭合。',
            enClue:'The jade is divided into Heaven, Earth, Human and Dragon covenants. Recover the first three fragments, then close the seal in that order with Dragon last.',
            requires:['天','地','人'], options:['天','地','人','龙'], answer:['天','地','人','龙'], max:4,
            hint1:'前三枚残契必须先在主墓外围找到。', hint2:'顺序是天 → 地 → 人 → 龙。'
        }
    ];

    const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    const cn=()=>curLang==='CN';
    const clone=o=>JSON.parse(JSON.stringify(o));
    const shuffle=a=>{const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
    const sample=(a,n)=>shuffle(a).slice(0,n);
    const DIR8=['北','东北','东','东南','南','西南','西','西北'],DIR4=['北','东','南','西'];
    const rot=(v,n,ring)=>ring[(ring.indexOf(v)+n+ring.length)%ring.length];
    const rotSquare=g=>[g[6],g[3],g[0],g[7],g[4],g[1],g[8],g[5],g[2]];
    const mirror=g=>[g[2],g[1],g[0],g[5],g[4],g[3],g[8],g[7],g[6]];
    const magic=()=>{let g=[4,9,2,3,5,7,8,1,6],n=Math.floor(Math.random()*4);while(n--)g=rotSquare(g);return Math.random()<.5?mirror(g):g;};

    const makePuzzleVariant=level=>{
        const d=clone(PUZZLES[level-1]);
        if(level===1){
            const n=Math.floor(Math.random()*8);d.answer=[0,3,5].map(i=>DIR8[(i+n)%8]);d.options=DIR8.slice();d.visual=d.answer.slice();
            d.clue='观察玄龟盘图像：三片青甲的位置才是本局星位。不要背固定答案。';d.hint2='本局：'+d.answer.join('、');
        }else if(level===2){
            const n=Math.floor(Math.random()*4);d.answer=['东','南','西'].map(x=>rot(x,n,DIR4));d.options=shuffle(DIR4);d.visual=d.answer.slice();
            d.clue='墓室朝向会变化。按冥器图上的日升、日中、日落投影顺序操作。';d.hint2='本局：'+d.answer.join(' → ');
        }else if(level===3){
            const black=Math.random()<.5,pat=sample([['内','内','内','内'],['内','外','外','内'],['外','内','内','外']],1)[0];
            const col=Array.from({length:4},(_,i)=>(i%2===0)===black?'黑':'白');d.answer=col.map((x,i)=>x+'·'+pat[i]);d.visual=d.answer.slice();
            d.start=Array.from({length:4},()=>d.states[Math.floor(Math.random()*d.states.length)]);if(same(d.start,d.answer))d.start[0]=d.states[(d.states.indexOf(d.start[0])+1)%4];
            d.clue='黑白必须交替，但四只鱼眼的朝向也由本局玉佩图决定。';d.hint2='本局：'+d.answer.join(' ｜ ');
        }else if(level===4){
            d.answer=magic();d.visual=d.answer.slice();d.editable=sample([0,1,2,3,5,6,7,8],5).sort((a,b)=>a-b);d.start=d.answer.slice();
            const vals=shuffle(d.editable.map(i=>d.start[i]));d.editable.forEach((x,i)=>d.start[x]=vals[i]);if(same(d.start,d.answer)){const a=d.editable[0],b=d.editable[1];[d.start[a],d.start[b]]=[d.start[b],d.start[a]];}
            d.clue='九宫会旋转或镜像。不要背固定朝向，只保证横、纵、斜线之和一致。';d.hint2='每条直线都应合计十五点。';
        }else if(level===5){
            d.ring=shuffle(['鼠','虎','蛇','马','猴','犬']);const at=Math.floor(Math.random()*6),rev=Math.random()<.5;d.startBeast=d.ring[at];d.reverse=rev;
            d.answer=Array.from({length:6},(_,i)=>d.ring[(at+(rev?-i:i)+12)%6]);d.options=shuffle(d.ring);d.max=6;d.visual=d.ring.slice();
            d.clue='月痕决定起点，箭纹决定顺逆；六兽每局重新排位。';d.hint2='本局：'+d.answer.join(' → ');
        }else if(level===6){
            d.scars=sample(d.options,Math.random()<.5?2:3).sort();d.answer=d.options.filter(x=>!d.scars.includes(x));d.max=d.answer.length;d.visual=d.scars.slice();
            d.clue='血痕星位每局变化。由近及远，只踏没有血痕的亮星。';d.hint2='避开：'+d.scars.join('、');
        }else if(level===7){
            d.directions=shuffle(['出口','兵器','棺椁','背门','祭台','水道']);d.start=d.faces.map(()=>Math.floor(Math.random()*d.directions.length));d.answer=['出口','兵器','棺椁','背门'];
            d.clue='祭台和水道是干扰项。理解“喜见生、怒见兵、哀见死、惧不见门”。';
        }else if(level===8){
            const order=shuffle(['火','水','血']),symbols=sample(['山','月','眼','门','星','蛇'],3);d.sourceOrder=order;d.worldMap={火:symbols[0],水:symbols[1],血:symbols[2]};
            d.answer=order.map(k=>d.worldMap[k]);d.options=shuffle(['山','月','眼','门','星','蛇']);d.max=3;d.visual=order.slice();
            d.clue='火、水、血显出的符号与读取顺序每局变化。先找齐环境显纹，再按竹边小印组合。';d.hint2='本局：'+d.answer.join(' → ');
        }else if(level===9){
            const c=['木','火','土','金','水'],at=Math.floor(Math.random()*5);d.answer=Array.from({length:5},(_,i)=>c[(at+i)%5]);d.options=shuffle(c);d.startPhase=d.answer[0];d.visual=[d.startPhase];
            d.clue='五行相生不变，但起始缺口每局不同。';d.hint2='本局：'+d.answer.join(' → ');
        }
        return d;
    };
    const puzzleFor=()=>Game.puzzleDef||PUZZLES[Math.max(0,Math.min(PUZZLES.length-1,Game.lvl-1))];

    const visualHTML=(d,relic)=>{
        if(!relic)return '<div class="mechanism-figure"><span>◉</span><span>◌</span><span>◉</span><span>◌</span></div>';
        if(Game.lvl===1)return '<div class="compass-figure">'+DIR8.map(x=>'<span class="'+(d.visual.includes(x)?'lit':'')+'">'+x+'</span>').join('')+'</div>';
        if(Game.lvl===2)return '<div class="sun-figure">'+d.visual.map(x=>'<span.☀<b>'+x+'</b></span>').join('<i>→</i>')+'</div>';
        if(Game.lvl===3)return '<div class="fish-figure">'+d.visual.map(x=>'<span class="'+(x[0]==='黑'?'black':'white')+'">◉<b>'+x.slice(2)+'</b></span>').join('')+'</div>';
        if(Game.lvl===4)return '<div class="visual-nine">'+d.visual.map(n=>'<span>'+'●'.repeat(n)+'</span>').join('')+'</div>';
        if(Game.lvl===5)return '<div class="beast-figure">'+d.ring.map(x=>'<span class="'+(x===d.startBeast?'lit':'')+'">'+x+'</span>').join('')+'<b>'+(d.reverse?'↺':'↻')+'</b></div>';
        if(Game.lvl===6)return '<div class="star-figure">'+['1','2','3','4','5','6','7'].map(x=>'<span class="'+(d.scars.includes(x)?'scar':'')+'">★<b>'+x+'</b></span>').join('')+'</div>';
        if(Game.lvl===7)return '<div class="face-figure"><span>喜</span><span>怒</span><span>哀</span><span>惧</span></div>';
        if(Game.lvl===8)return '<div class="env-figure">'+d.sourceOrder.map(x=>'<span>'+(x==='火'?'🔥':x==='水'?'≈':'●')+'<b>'+x+'</b></span>').join('<i>→</i>')+'</div>';
        if(Game.lvl===9)return '<div class="phase-figure">'+['木','火','土','金','水'].map(x=>'<span class="'+(x===d.startPhase?'lit':'')+'">'+x+'</span>').join('')+'</div>';
        return '<div class="seal-figure"><span>天</span><span>地</span><span>人</span>龙</span></div>';
    };

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
        const relicBtn=document.getElementById('relic-btn');if(relicBtn)relicBtn.hidden=false;
        this.art++;
        this.exit=0;
        this.artifactPos=this.lvl<=3?null:{...this.exitPos};
        AudioSys.playItem(true);
        this.msg(cn()?`发现冥器：${a.n} · 新的谜题线索已发现`:`Relic found: ${a.en} · new puzzle clue discovered`,'#dfc58c');
        this.updateHUD();
        this.refreshBuffs();
    };

    const baseLoad=Game.load.bind(Game);
    Game.load=function(level){
        baseLoad(level);
        this.relicCollected=false;
        this.relicReview=false;
        const relicBtn=document.getElementById('relic-btn');if(relicBtn)relicBtn.hidden=true;
        this.puzzleAttempts=0;
        this.puzzleState=null;
        this.worldClues=new Set();
        this.worldClueValues={};
        this.puzzleDef=makePuzzleVariant(level);
        const gate=new TombMechanism(this.exitPos.x,this.exitPos.y+34);
        this.ents.push(gate);
        const rooms=MapSys.lastRooms||[];
        const roomCenter=i=>{
            const r=rooms[Math.max(0,Math.min(rooms.length-1,i))];
            return{x:(r.x+r.w/2)*CONFIG.TILE,y:(r.y+r.h/2)*CONFIG.TILE};
        };
        if(level===8&&rooms.length>6){
            const def=this.puzzleDef,slots=shuffle([2,3,4,5,6]).slice(0,3);
            const f=roomCenter(slots[0]),w=roomCenter(slots[1]),b=roomCenter(slots[2]);
            this.ents.push(new WorldClue(f.x,f.y,'火',def.worldMap.火,'fire'));
            this.ents.push(new WorldClue(w.x,w.y,'水',def.worldMap.水,'water'));
            this.ents.push(new WorldClue(b.x,b.y,'血',def.worldMap.血,'blood'));
        }
        if(level===10&&rooms.length>8){
            const slots=shuffle([2,3,4,5,6,7,8]).slice(0,3),a=roomCenter(slots[0]),b=roomCenter(slots[1]),c=roomCenter(slots[2]);
            this.ents.push(new WorldClue(a.x,a.y,'天','上','seal'));
            this.ents.push(new WorldClue(b.x,b.y,'地','下','seal'));
            this.ents.push(new WorldClue(c.x,c.y,'人','中','seal'));
        }
        this.hideMechanismButton();
        this.updateHUD();
    };

    Game.hideMechanismButton=function(){
        const b=document.getElementById('mechanism-btn');if(b)b.classList.remove('visible');
    };
    Game.updateMechanismButton=function(){
        const b=document.getElementById('mechanism-btn');if(!b||!this.p)return;
        const revealRange=this.lvl<=3?48:86;
        const near=Math.hypot(this.exitPos.x-this.p.x,(this.exitPos.y+34)-this.p.y)<revealRange;
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
            if(this.lvl<=3)objective.textContent=cn()?'冥器上的纹路似乎另有所指':'The relic markings seem to correspond to something nearby';
            else objective.textContent=missing.length?(cn()?'冥器已发现 · 仍有环境线索未明':'Relic found · some environmental clues remain'):(cn()?'冥器已发现 · 寻找与纹样对应的机关':'Relic found · find a mechanism matching the markings');
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
        else if(d.type==='orientation')this.puzzleState=d.start?d.start.slice():d.faces.map(()=>0);
        else if(d.type==='composite')this.puzzleState={direction:null,symbol:null,order:[]};
    };

    Game.openRelicReview=function(){
        if(!this.running||this.pause||!this.relicCollected)return;
        this.relicReview=true;
        this.pause=true;Input.reset();this.hideMechanismButton();
        document.getElementById('puzzle-modal').classList.add('active');
        this.renderPuzzle();
    };

    Game.openPuzzle=function(){
        if(!this.running||this.pause||!this.relicCollected||this.exit)return;
        this.relicReview=false;
        this.pause=true;Input.reset();this.hideMechanismButton();
        if(!this.puzzleState)this.resetPuzzleState();
        document.getElementById('puzzle-modal').classList.add('active');
        this.renderPuzzle();
    };
    Game.closePuzzle=function(){
        const m=document.getElementById('puzzle-modal');if(m)m.classList.remove('active');
        this.relicReview=false;
        if(this.running)this.pause=false;
        this.lastTime=null;this.accumulator=0;
    };

    Game.renderPuzzle=function(){
        const d=puzzleFor(),a=ARTIFACTS[this.lvl-1],board=document.getElementById('puzzle-board'),visual=document.getElementById('puzzle-visual');
        const resetButton=document.getElementById('puzzle-reset-btn');
        const submitButton=document.getElementById('puzzle-submit-btn');
        const closeButton=document.getElementById('puzzle-close-btn');
        if(this.relicReview){
            if(visual)visual.innerHTML=visualHTML(d,true);
            document.getElementById('puzzle-title').textContent=cn()?'冥器线索':'RELIC CLUE';
            document.getElementById('puzzle-relic').textContent=`${a.i||'◆'} ${cn()?a.n:a.en}`;
            document.getElementById('puzzle-clue').textContent=cn()?`${a.d} ${a.end}`:`${a.en}. ${a.end}`;
            document.getElementById('puzzle-world-clues').textContent=cn()?`墓道线索：${d.clue}`:`Gate clue: ${d.enClue}`;
            document.getElementById('puzzle-feedback').textContent='';
            document.getElementById('puzzle-hint').textContent='';
            board.innerHTML=`<div class="relic-inspection"><div class="relic-symbol">${a.i||'◆'}</div><strong>${cn()?a.n:a.en}</strong><p>${a.d}</p><p class="relic-pattern">${a.end}</p></div>`;
            if(resetButton)resetButton.style.display='none';
            if(submitButton)submitButton.style.display='none';
            if(closeButton)closeButton.textContent=cn()?'收起线索':'CLOSE';
            return;
        }
        if(resetButton)resetButton.style.display='';
        if(submitButton)submitButton.style.display='';
        if(visual)visual.innerHTML=visualHTML(d,false);
        document.getElementById('puzzle-title').textContent=cn()?d.title:d.enTitle;
        document.getElementById('puzzle-relic').textContent=`${a.i||'◆'} ${cn()?a.n:a.en}`;
        document.getElementById('puzzle-clue').textContent=cn()?d.clue:d.enClue;
        const req=d.requires||[],missing=req.filter(k=>!this.worldClues?.has(k));
        const found=req.map(k=>`${k}${this.worldClueValues?.[k]?`→${this.worldClueValues[k]}`:''}`).join('　');
        document.getElementById('puzzle-world-clues').textContent=req.length?(cn()?`环境线索：${found||'尚未发现'}${missing.length?`（缺 ${missing.length}）`:''}`:`World clues: ${found||'none'}${missing.length?` (${missing.length} missing)`:''}`):'';
        document.getElementById('puzzle-feedback').textContent='';
        const hint=this.puzzleAttempts>=6?d.hint2:this.puzzleAttempts>=3?d.hint1:'';
        document.getElementById('puzzle-hint').textContent=hint?(cn()?`提示：${hint}`:`Hint: ${hint}`):'';
        const submit=document.getElementById('puzzle-submit-btn');submit.disabled=missing.length>0;
        submit.textContent=cn()?'确认机关':'CONFIRM';
        document.getElementById('puzzle-reset-btn').textContent=cn()?'重置':'RESET';
        document.getElementById('puzzle-close-btn').textContent=cn()?'离开机关':'LEAVE';

        if(d.type==='sequence'){
            const sel=this.puzzleState||[];
            const ring=d.ring?`<div class="puzzle-ring">月痕 · ${d.startBeast||''} · ${d.reverse?'↺':'↻'} · ${d.ring.join(' · ')}</div>`:'';
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
        if(this.puzzleAttempts===3||this.puzzleAttempts===6)setTimeout(()=>{if(document.getElementById('puzzle-modal').classList.contains('active'))this.renderPuzzle();},350);
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
    document.getElementById('relic-btn')?.addEventListener('pointerdown',e=>{e.preventDefault();Game.openRelicReview();});

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
    Game.updateUI=function(){
        baseUpdateUI();
        const relicBtn=document.getElementById('relic-btn');
        if(relicBtn){
            relicBtn.textContent=cn()?'冥':'REL';
            relicBtn.setAttribute('aria-label',cn()?'查看冥器线索':'View relic clue');
        }
        this.updateHUD();this.updateMechanismButton();
    };
})();
