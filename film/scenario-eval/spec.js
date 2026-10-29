// Private evaluation of the official Scenario Kinetic Film engine.
// 120 BPM is a timing grid, NOT a claim of a generated soundtrack.
// Actual app footage is composited at 1x over declared Proof intervals.
import {Words, Hero, Chain, Picture, Logo, Scene} from './blocks.js';
import {el, set} from './core.js';
const K=s=>s*2;
class InsetWords extends Words {cam(t){const c=super.cam(t);if(this.t0===32.5 && t<33.8)return c;return {...c,s:c.s*.88};}}
class Proof extends Scene {
  build(){
    this.img=el('img',this.root,'abs full',{width:'1920px',height:'1080px',objectFit:'fill'});
    this.img.src=this.o.src;
  }
  cam(){return {x:0,y:0,s:1,r:0};}
  update(){}
}
const proof=(a,b,id)=>[Proof,K(a),K(b),{src:`assets/${id}-first.jpg`}];
export default {
 title:'Afterimage — Scenario engine evaluation',bpm:120,beats:131,fps:30,
 palette:{bg:'#13251f',paper:'#f3edda',accent:'#e5b369',hot:'#efc88e',ink:'#13251f'},
 hud:false,sounds:{},cues:[],captions:[],
 scenes:[
  [Words,0,K(2.8),{charge:true,shots:[
   {at:.3,style:'punch3d',text:'02:13',fx:'none'},
   {at:2,style:'split',text:['EMPTY','CORRIDOR.'],second:.5,fx:'none',in:'whipX'}],exit:{type:'collapse',at:4.8,end:5.6}}],
  proof(2.8,8.8,'music'),
  [Chain,K(8.8),K(11.2),{nodes:[['MEANING','Semantic retrieval'],['PASSAGE','Eight fictional records'],['SOURCE','Record M03','accent']],whipIn:[-1000,0,.12]}],
  [Words,K(11.2),K(15.2),{shots:[
   {at:K(11.2),style:'stack',text:['M03 · 26 OCT 1987 · EXACT EXCERPT','AUTOMATIC'],second:.6,ground:'paper',fx:'none'},
   {at:K(12.6),style:'split',text:['RELAY','REBOOT.'],color:'ink',ground:'paper',fx:'none',in:'whipX',note:'“The automatic relay reboot triggered the recording.”',noteAt:.3}
  ]}],
  [Picture,K(15.2),K(18.65),{src:'assets/music-last.jpg',focus:[.72,.55],tint:0,frame:false,weather:null,reveal:'zoom',words:[],whipOut:[0,-900,.12]}],
  proof(18.65,25.25,'repair'),
  [Words,K(25.25),K(27),{shots:[{at:K(25.25),style:'split',text:['REPAIR RANKED','THIRD.'],second:.35,color:'ink',ground:'accent',fx:'none',note:'M07 · similarity 0.384, not confidence',noteAt:.5}]}],
  proof(27,29,'select'),
  proof(29,32.5,'timeline'),
  [InsetWords,K(32.5),K(35.2),{shots:[
   {at:K(32.5),style:'stack',text:['M07 · OCTOBER 31, 1987','CAPACITOR'],ground:'paper',second:.5,fx:'none'},
   {at:K(33.8),style:'pair',text:['REPLACED.','RESET STOPPED.'],color2:'ink',ground:'paper',fx:'none',in:'whipX'}
  ]}],
  [Hero,K(35.2),K(38.0),{kicker:'EVIDENCE TO INSPECT',title:'SOURCE.',sub:'Not a generated verdict.',chevron:'',landZoom:1.0,whipOut:[-1000,0,.12]}],
  [InsetWords,K(38),K(40),{shots:[{at:K(38),style:'pair',text:['EXACT QUOTE.','CHECK CONTEXT.'],color2:'ink',fx:'none',ground:'paper'}]}],
  proof(40,44.5,'failure'),
  [Words,K(44.5),K(44.9),{shots:[{at:K(44.5),style:'cut',text:'ORIGINALS.',fx:'none',color:'accent'}]}],
  proof(44.9,47.3,'recovery'),
  [Words,K(47.3),K(48),{shots:[{at:K(47.3),style:'cut',text:'OPTIONAL.',fx:'none',ground:'paper'}]}],
  proof(48,53.4,'consent'),
  [Chain,K(53.4),K(57.5),{nodes:[['QUESTION','Explicit model download'],['MINILM','Browser-local search'],['RECORDS','Sources remain visible','accent']],whipIn:[1000,0,.12]}],
  [Words,K(57.5),K(60.45),{shots:[
   {at:K(57.5),style:'pair',text:['SIMILARITY ≠','TRUTH.'],color2:'ink',fx:'none',ground:'paper'},
   {at:K(59),style:'split',text:['KEEP THE','SOURCE.'],second:.3,fx:'none',in:'whipY'}
  ],exit:{type:'collapse',at:K(60.15),end:K(60.45)}}],
  [Logo,K(60.45),131,{wordmark:'AFTERIMAGE',width:1420,tagline:'Follow the trace. Keep the source.',small:'FICTIONAL ARCHIVE · PRIVATE COMPARISON'}]
 ]
};
