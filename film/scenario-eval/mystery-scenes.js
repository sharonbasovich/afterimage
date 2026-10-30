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
  for(let j=0;j<10;j++)el('div',this.speaker,'abs',{left:'36px',top:(80+j*28)+'px',width:'164px',height:'5px',background:'#e5b369',borderRadius:'3px'});
  this.rings=[];for(let i=0;i<3;i++){let r=el('div',this.root,'abs',{left:'1120px',top:'135px',width:'520px',height:'710px',border:'3px solid #e5b369',borderRadius:'50%',opacity:0});this.rings.push(r);}
  this.head=label(this.root,'NOBODY WAS\nON SHIFT.',110,390,118);this.head.style.whiteSpace='pre-line';this.head.style.fontFamily='Archivo';this.head.style.fontWeight=900;
  this.question=label(this.root,'WHY DID\nIT PLAY?',110,370,145,'#e5b369',1150);this.question.style.whiteSpace='pre-line';this.question.style.fontFamily='Archivo';this.question.style.fontWeight=900;
  this.stop=label(this.root,'WHAT\nSTOPPED IT?',110,370,138,'#f3edda',1500);this.stop.style.whiteSpace='pre-line';this.stop.style.fontFamily='Archivo';this.stop.style.fontWeight=900;
  this.trace=el('div',this.root,'abs',{left:'110px',top:'920px',width:'1700px',height:'6px',background:'#e5b369',transformOrigin:'left center'});
  label(this.root,'ILLUSTRATED INCIDENT · THE RECORD IS THE EVIDENCE',110,1004,24,'#aabdb1');
 }
 update(t){let u=t-this.t0, q=ease(u,3,3.35), z=ease(u,5.55,5.85);let notes=this.o.notes||[.35,.85,1.35];this.clock.style.transform=`translate(${860*q}px,${80*(1-ease(u,0,.35))}px) scale(${1-.4*q})`;this.clock.style.transformOrigin='left top';this.clock.style.opacity=ease(u,0,.2);this.head.style.opacity=ease(u,.5,1)*(1-q);this.head.style.transform=`translate(${-130*(1-ease(u,.5,1))-70*q}px,${-150*q}px)`;this.question.style.opacity=q*(1-z);this.question.style.transform=`translateX(${180*(1-q)-160*z}px) rotate(${-4*(1-q)}deg)`;this.stop.style.opacity=z;this.stop.style.transform=`translateX(${-200*(1-z)}px)`;this.speaker.style.transform=`translate(${190*q}px,${90*q}px) rotate(${12*z}deg) scale(${1-.12*q})`;this.trace.style.transform=`scaleX(${ease(u,2,this.t1-this.t0-.1)})`;for(let i=0;i<3;i++){let onset=u<3?notes[i]:u<5.55?3+i*.12:5.55+i*.10;let a=clamp((u-onset)/.85);this.rings[i].style.opacity=(a>0&&a<1)?String((1-a)*.8):'0';this.rings[i].style.transform=`translate(${190*q}px,${90*q}px) scale(${.7+1.2*a})`;}}

}
export class SourcePayoff extends Scene {
 build(){this.f.ground(this.t0,this.t1,'#f3edda');label(this.root,'31 OCT 1987 / ORIGINAL RECORD M07',110,90,35,'#526047');this.rule=el('div',this.root,'abs',{left:'110px',top:'175px',width:'1700px',height:'5px',background:'#13251f',transformOrigin:'left'});this.big=label(this.root,'THE RESET\nSTOPPED.',110,245,150,'#13251f');this.big.style.fontFamily='Archivo';this.big.style.fontWeight=900;this.big.style.whiteSpace='pre-line';this.quote=label(this.root,'',115,660,64,'#13251f',1650);this.quote.style.fontFamily='Georgia';this.quote.append(document.createTextNode('“Replacing the '));this.cap=document.createElement('span');this.cap.textContent='backup capacitor';this.quote.append(this.cap,document.createTextNode(' stopped the nightly relay reset.”'));this.cap.style.transition='none';
  this.trace=el('div',this.root,'abs',{left:'1090px',top:'370px',width:'620px',height:'140px'});this.bars=[];for(let i=0;i<20;i++){let b=el('div',this.trace,'abs',{left:(i*30)+'px',bottom:'0px',width:'12px',height:'80px',background:'#526047',transformOrigin:'bottom'});this.bars.push(b)}
  this.signal=label(this.root,'NIGHTLY RESET',1090,535,28,'#526047',650);label(this.root,'THE RECORD SAYS IT. YOU CAN INSPECT IT.',115,880,36,'#526047');label(this.root,'CHOREOGRAPHED EXCERPT · FICTIONAL ARCHIVE',115,1004,24,'#526047');}
 update(t){let u=t-this.t0;this.rule.style.transform=`scaleX(${ease(u,0,.3)})`;this.big.style.transform=`translateY(${70*(1-ease(u,.1,.5))}px)`;this.big.style.opacity=ease(u,.1,.3);this.quote.style.opacity=ease(u,.45,.9);let stop=ease(u,2.4,2.7);this.cap.style.background=`rgba(229,179,105,${ease(u,1.0,1.25)})`;this.cap.style.boxShadow=`0 ${6*ease(u,1.0,1.25)}px 0 #13251f`;this.bars.forEach((b,i)=>b.style.transform=`scaleY(${(1-stop)*(.3+.7*Math.abs(Math.sin(u*7+i*.75)))+.035})`);this.signal.textContent=stop>.9?'RESET STOPPED / RECORD M07':'NIGHTLY RESET';this.big.style.transform+=` scale(${1+.025*Math.sin(Math.PI*ease(u,2.4,2.7))})`;}
}
export class ManualArchive extends Scene {
 build(){this.f.ground(this.t0,this.t1,'#10221c');label(this.root,'THE ORIGINALS STAY YOURS.',110,100,87,'#f3edda');label(this.root,'READ WITHOUT AI / 8 FICTIONAL RECORDS',115,240,28,'#e5b369');this.cards=[];['M01 · 24 OCT','M02 · 25 OCT','M03 · 26 OCT','M04 · 26 OCT','M05 · 27 OCT','M06 · 27 OCT','M08 · 28 OCT','M07 · 31 OCT'].forEach((s,i)=>{let x=110+(i%4)*430,y=355+Math.floor(i/4)*235;let c=el('div',this.root,'abs',{left:x+'px',top:y+'px',width:'395px',height:'200px',background:i===7?'#eee8d5':'#193329',border:'1px solid #667d6f',borderRadius:'6px'});label(c,s,25,60,34,i===7?'#13251f':'#f3edda',355);this.cards.push(c)});label(this.root,'CHOREOGRAPHED UI · CHRONOLOGICAL ORDER · NOT A MODEL VERDICT',115,1004,24,'#aabdb1');}
 update(t){let u=t-this.t0;this.cards.forEach((c,i)=>{let a=ease(u,.15+i*.12,.65+i*.12);c.style.opacity=a;c.style.transform=`translateY(${70*(1-a)}px) rotate(${(i%2?2:-2)*(1-a)}deg)`;});}
}
