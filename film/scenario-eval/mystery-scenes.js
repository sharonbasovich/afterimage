// Original illustrative choreography, not an application feature or screen capture.
import {Scene} from './blocks.js';
import {el,E,clamp} from './core.js';
const ease=(t,a,b)=>E.outCubic(clamp((t-a)/(b-a)));
const label=(p,s,x,y,size=40,color='#f3edda',w=1700)=>{let e=el('div',p,'abs',{left:x+'px',top:y+'px',width:w+'px',fontFamily:'Inst',fontSize:size+'px',lineHeight:'1.15',color});e.textContent=s;return e;};
export class ChimeMystery extends Scene {
 build(){
  this.f.ground(this.t0,this.t1,'#10221c');
  this.clock=label(this.root,'02:13',110,95,184,'#e5b369');
  this.flag=label(this.root,'FICTIONAL ARCHIVE / INCIDENT 03',118,45,25,'#aabdb1');
  this.speaker=el('div',this.root,'abs',{left:'1260px',top:'275px',width:'240px',height:'430px',border:'4px solid #e5b369',borderRadius:'120px',background:'#182e24'});
  this.rings=[];for(let i=0;i<3;i++){let r=el('div',this.root,'abs',{left:'1120px',top:'135px',width:'520px',height:'710px',border:'3px solid #e5b369',borderRadius:'50%',opacity:0});this.rings.push(r);}
  this.head=label(this.root,'NOBODY WAS\nON SHIFT.',110,390,118);this.head.style.whiteSpace='pre-line';this.head.style.fontFamily='Archivo';this.head.style.fontWeight=900;
  this.question=label(this.root,'So why did the chime play?',116,760,56,'#e5b369');
  this.trace=el('div',this.root,'abs',{left:'110px',top:'920px',width:'1700px',height:'6px',background:'#e5b369',transformOrigin:'left center'});
  label(this.root,'ILLUSTRATED INCIDENT · THE RECORD IS THE EVIDENCE',110,1004,24,'#aabdb1');
 }
 update(t){let u=t-this.t0;let notes=this.o.notes||[.35,.85,1.35];this.clock.style.transform=`translateY(${80*(1-ease(u,0,.35))}px)`;this.clock.style.opacity=ease(u,0,.2);this.head.style.opacity=ease(u,.5,1);this.head.style.transform=`translateX(${-130*(1-ease(u,.5,1))}px)`;this.question.style.opacity=ease(u,1.5,2);this.trace.style.transform=`scaleX(${ease(u,2,this.t1-this.t0-.1)})`;for(let i=0;i<3;i++){let a=clamp((u-notes[i])/.85);this.rings[i].style.opacity=(a>0&&a<1)?String((1-a)*.8):'0';this.rings[i].style.transform=`scale(${.7+1.2*a})`;}}
}
export class SourcePayoff extends Scene {
 build(){this.f.ground(this.t0,this.t1,'#f3edda');label(this.root,'31 OCT 1987 / ORIGINAL RECORD M07',110,90,35,'#526047');this.rule=el('div',this.root,'abs',{left:'110px',top:'175px',width:'1700px',height:'5px',background:'#13251f',transformOrigin:'left'});this.big=label(this.root,'THE RESET\nSTOPPED.',110,245,150,'#13251f');this.big.style.fontFamily='Archivo';this.big.style.fontWeight=900;this.big.style.whiteSpace='pre-line';this.quote=label(this.root,'“Replacing the backup capacitor stopped the nightly relay reset.”',115,670,49,'#13251f');this.quote.style.fontFamily='Georgia';label(this.root,'THE RECORD SAYS IT. YOU CAN INSPECT IT.',115,880,36,'#526047');label(this.root,'CHOREOGRAPHED EXCERPT · FICTIONAL ARCHIVE',115,1004,24,'#526047');}
 update(t){let u=t-this.t0;this.rule.style.transform=`scaleX(${ease(u,0,.3)})`;this.big.style.transform=`translateY(${70*(1-ease(u,.1,.5))}px)`;this.big.style.opacity=ease(u,.1,.3);this.quote.style.opacity=ease(u,.45,.9);}
}
export class ManualArchive extends Scene {
 build(){this.f.ground(this.t0,this.t1,'#10221c');label(this.root,'THE ORIGINALS STAY YOURS.',110,100,87,'#f3edda');label(this.root,'READ WITHOUT AI / 8 FICTIONAL RECORDS',115,240,28,'#e5b369');this.cards=[];['M01 · 24 OCT','M02 · 25 OCT','M03 · 26 OCT','M04 · 26 OCT','M05 · 27 OCT','M06 · 27 OCT','M08 · 28 OCT','M07 · 31 OCT'].forEach((s,i)=>{let x=110+(i%4)*430,y=355+Math.floor(i/4)*235;let c=el('div',this.root,'abs',{left:x+'px',top:y+'px',width:'395px',height:'200px',background:i===7?'#eee8d5':'#193329',border:'1px solid #667d6f',borderRadius:'6px'});label(c,s,25,60,34,i===7?'#13251f':'#f3edda',355);this.cards.push(c)});label(this.root,'CHOREOGRAPHED UI · CHRONOLOGICAL ORDER · NOT A MODEL VERDICT',115,1004,24,'#aabdb1');}
 update(t){let u=t-this.t0;this.cards.forEach((c,i)=>{let a=ease(u,.15+i*.12,.65+i*.12);c.style.opacity=a;c.style.transform=`translateY(${70*(1-a)}px) rotate(${(i%2?2:-2)*(1-a)}deg)`;});}
}
