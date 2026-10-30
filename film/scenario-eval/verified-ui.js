import {Scene} from './blocks.js';
import {el,E,clamp} from './core.js';
const ease=(t,a,b)=>E.outCubic(clamp((t-a)/(b-a)));
const box=(p,x,y,w,h,bg='#19251d')=>el('div',p,'abs',{left:x+'px',top:y+'px',width:w+'px',height:h+'px',background:bg,border:'1px solid #62705d',borderRadius:'8px',boxSizing:'border-box'});
const text=(p,s,x,y,w,size=36,color='#f3edda',font='Inst')=>{const e=el('div',p,'abs',{left:x+'px',top:y+'px',width:w+'px',fontFamily:font,fontSize:size+'px',lineHeight:'1.25',color});e.textContent=s;return e;};
const move=(e,x,y,s=1,r=0)=>e.style.transform=`translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`;
const records={M02:['25 OCT 1987','The relay clock loses power at 02:13 each night. Its backup capacitor discharges and restarts the maintenance chime.'],M03:['26 OCT 1987','A recorded three-note maintenance chime played from the corridor speaker although nobody was on shift. The automatic relay reboot triggered the recording.'],M07:['31 OCT 1987','Replacing the backup capacitor stopped the nightly relay reset. No further unprompted chimes were logged during the following three nights.']};
class ArchiveUI extends Scene {
 build(){
  this.f.ground(this.t0,this.t1,'#13251f');
  text(this.root,'AFTERIMAGE / THE READING ROOM',110,68,1400,28,'#e5b369','JBM');
  text(this.root,'CHOREOGRAPHED UI · NOT LIVE CAPTURE · FICTIONAL ARCHIVE',110,1004,1700,24,'#c9d2c4','JBM');
  this.g=el('div',this.root,'abs full');
  const mode=this.o.mode;
  if(mode==='search'||mode==='repair')this.buildSearch(mode==='repair');
  if(mode==='source')this.buildSource();
  if(mode==='failure')this.buildFailure();
  if(mode==='consent')this.buildConsent();
 }
 card(id,rank,score,y){
  const c=box(this.g,110,y,750,144);text(c,`${rank} / ${id}${Number(score)<.4?' · WEAK CANDIDATE':''}`,25,17,700,22,'#e5b369','JBM');text(c,`Record ${id}`,25,52,400,38);text(c,`SIMILARITY ${score} · NOT CONFIDENCE`,25,106,700,21,'#bdc8b8','JBM');return c;
 }
 paper(parent,id,x,y,w=800,h=510){
  const p=box(parent,x,y,w,h,'#eee8d5');p.style.boxShadow='18px 24px 0 #08160f55';
  text(p,`ORIGINAL RECORD / ${id}`,38,32,w-76,24,'#526047','JBM');text(p,records[id][0],38,82,w-76,34,'#13251f');
  const q=text(p,records[id][1],38,157,w-76,38,'#13251f','Georgia');q.style.lineHeight='1.48';
  text(p,'VERBATIM TRANSCRIPT · SYNTHETIC ARCHIVE',38,h-62,w-76,20,'#526047','JBM');return p;
 }
 buildSearch(repair){
  this.repair=repair;this.query=box(this.g,110,165,1700,130,'#0d1b15');
  this.queryText=text(this.query,repair?'How was the recurring nighttime alarm fixed?':'Why did the speaker play music with no workers present?',30,35,1300,36);
  const b=box(this.query,1370,20,300,88,'#e5b369');text(b,'Trace the evidence ↗',18,28,280,25,'#13251f');
  this.heading=text(this.g,repair?'A trace, not a verdict.':'Top result shown / M03',110,330,1400,48);
  this.cards=repair?[this.card('M02','01','0.413',425),this.card('M03','02','0.394',585),this.card('M07','03','0.384',745)]:[this.card('M03','01','0.518',425)];
  this.paperEl=this.paper(this.g,repair?'M07':'M03',960,405,850,510);
  this.rank=text(this.g,'THIRD — NOT FIRST.',110,350,800,50,'#e5b369');this.rank.style.opacity=0;
  if(repair){this.timeline=box(this.g,110,155,1700,780,'#13251f');text(this.timeline,'Accounts accumulate. Dates remain.',35,25,1550,55);this.nodes=[];['M02','M03','M07'].forEach((id,i)=>{const n=box(this.timeline,45+i*555,180,510,500,i===2?'#eee8d5':'#19251d');const col=i===2?'#13251f':'#f3edda';text(n,records[id][0],25,28,460,28,col,'JBM');text(n,id,25,94,460,65,col);text(n,records[id][1],25,200,460,29,col,'Georgia');this.nodes.push(n);});}
 }
 buildSource(){this.paperEl=this.paper(this.g,'M03',400,180,1120,690);text(this.paperEl,'THE SOURCE STAYS ATTACHED.',38,580,1044,33,'#13251f','JBM');}
 buildFailure(){
  this.query=box(this.g,110,175,1700,130,'#0d1b15');text(this.query,'How do I bake a chocolate birthday cake?',35,38,1600,42);
  this.empty=box(this.g,280,385,1360,390,'#19251d');text(this.empty,'∅',50,35,180,120,'#e5b369');text(this.empty,'No close semantic match.',235,65,1070,56);text(this.empty,'No passage met the fixed similarity threshold.',235,165,1040,32,'#c9d2c4');text(this.empty,'This does not prove the archive lacks relevant evidence.',235,235,1040,28,'#c9d2c4');
  this.browse=box(this.g,110,805,1700,100,'#e5b369');text(this.browse,'Browse all 8 original records  →',35,26,1600,40,'#13251f');
  this.manual=box(this.g,650,330,1120,610,'#19251d');text(this.manual,'ORIGINAL ARCHIVE / 8 RECORDS',30,22,1060,28,'#e5b369','JBM');
  ['M01 · 24 OCT','M02 · 25 OCT','M03 · 26 OCT','M04 · 26 OCT','M05 · 27 OCT','M06 · 27 OCT','M08 · 28 OCT','M07 · 31 OCT'].forEach((id,i)=>text(this.manual,id,30,78+i*62,1060,32));
 }
 buildConsent(){
  this.panel=box(this.g,200,230,1520,600,'#19251d');text(this.panel,'Bring the archive online.',55,40,1400,65);text(this.panel,'Only when you choose. Model + runtime files served by this site.',55,145,1400,32,'#c9d2c4');
  this.button=box(this.panel,55,245,1410,115,'#e5b369');this.buttonText=text(this.button,'Enable browser AI (~45 MB)  ↗',35,30,1340,44,'#13251f');
  this.ready=text(this.panel,'Browser-local MiniLM · WASM CPU',55,400,1400,40);text(this.panel,'Questions stay in this browser. Originals remain available without AI.',55,488,1400,28,'#c9d2c4');
 }
 update(t){
  const u=t-this.t0,mode=this.o.mode;move(this.g,0,28*(1-ease(u,0,.5)),1);this.g.style.opacity=ease(u,0,.22);
  if(mode==='search'||mode==='repair'){
   const appear=ease(u,.8,1.5);this.query.style.opacity=1;move(this.query,0,0,1);this.heading.style.opacity=appear;
   this.cards.forEach((c,i)=>{const a=ease(u,1.25+i*.28,1.85+i*.28);move(c,(-140*(1-a)),55*(1-a),1);c.style.opacity=a;});
   const open=ease(u,this.repair?8.25:2.7,this.repair?8.75:3.4);move(this.paperEl,180*(1-open),35*(1-open),.96+.04*open,-3*(1-open));this.paperEl.style.opacity=open;
   if(this.repair){const third=ease(u,5.6,6.4);this.rank.style.opacity=third;this.heading.style.opacity=appear*(1-third);this.cards[2].style.borderColor=third>.1?'#e5b369':'#62705d';move(this.cards[2],third*35,0,1+third*.02);const tl=ease(u,10.35,10.9);this.timeline.style.opacity=tl;move(this.timeline,1400*(1-tl),0);this.nodes.forEach((n,i)=>move(n,0,55*(1-ease(u,10.7+i*.25,11.3+i*.25))));}
  }
  if(mode==='source'){move(this.paperEl,-80*(1-ease(u,0,.65)),0,1+.025*u/3.45,-2*(1-ease(u,0,.65)));}
  if(mode==='failure'){const a=ease(u,1.1,1.8);this.empty.style.opacity=a;move(this.empty,0,65*(1-a));const b=ease(u,4.8,5.45);move(this.empty,-1100*b,0);this.empty.style.opacity=a*(1-b);this.manual.style.opacity=b;move(this.manual,400*(1-b),0,1,-2*(1-b));this.browse.style.opacity=1-b;move(this.browse,-540*b,-350*b,.6+.4*(1-b));}
  if(mode==='consent'){const a=ease(u,1.8,2.3);this.button.style.opacity=1-a;move(this.button,0,-70*a,1-.025*Math.sin(Math.PI*a));this.ready.textContent='8 records available · Browser-local MiniLM · WASM CPU';this.ready.style.opacity=ease(u,2.2,2.8);move(this.ready,0,-120*a);}
 }
 cam(){return {x:0,y:0,s:1,r:0};}
}


export {ArchiveUI};
// Original editorial time mapping over already-verified reconstructed UI.
export class PacedArchiveUI extends ArchiveUI {
 update(t){
  const range=this.o.sourceRange || [0,({search:6,source:3.45,repair:13.85,failure:7.3,consent:5.4})[this.o.mode]];
  const p=clamp((t-this.t0)/(this.t1-this.t0));
  super.update(this.t0+range[0]+p*(range[1]-range[0]));
 }
}
