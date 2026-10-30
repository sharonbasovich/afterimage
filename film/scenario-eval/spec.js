// PRIVATE EVALUATION ONLY. Scenario Free generated music is not cleared for commercial/submission publication.
// No YouTube/DEV release until separately approved and output-rights gate resolved.
import {Words,Logo} from './blocks.js';
import {PacedArchiveUI} from './verified-ui.js';
import {ChimeMystery,SourcePayoff,ManualArchive} from './mystery-scenes.js';
const K=s=>s*124/60;
export default {title:'Afterimage — Follow the record / music-led private evaluation',bpm:124,beats:K(56.3333333333),fps:30,palette:{bg:'#10221c',paper:'#f3edda',accent:'#e5b369',hot:'#efc88e',ink:'#13251f'},hud:false,sounds:{},cues:[],captions:[],scenes:[
 [ChimeMystery,0,K(7.8),{notes:[.0668,.5507,1.0346]}],
 [PacedArchiveUI,K(7.8),K(11.6666666667),{mode:'consent',sourceRange:[0,3.2]}],
 [PacedArchiveUI,K(11.6666666667),K(24.2666666667),{mode:'repair',sourceRange:[0,10]}],
 [SourcePayoff,K(24.2666666667),K(30.0666666667),{}],
 [PacedArchiveUI,K(30.0666666667),K(34.9),{mode:'repair',sourceRange:[10.35,13.85]}],
 [ManualArchive,K(34.9),K(40.7),{}],
 [Words,K(40.7),K(50.4),{shots:[
  {at:K(40.7),style:'pair',text:['EIGHT FICTIONAL','RECORDS.'],ground:'paper',color2:'ink',fx:'none'},
  {at:K(43.2),style:'pair',text:['OPTIONAL','LOCAL AI.'],fx:'none',in:'whipX'},
  {at:K(46),style:'pair',text:['NO GENERATED','TESTIMONY.'],ground:'paper',color2:'ink',fx:'none',in:'whipY'}],exit:{type:'collapse',at:K(49.95),end:K(50.4)}}],
 [Logo,K(50.4),K(56.3333333333),{wordmark:'AFTERIMAGE',width:1420,tagline:'Follow the record. Not just the story.',small:'PRIVATE EVALUATION · sharonbasovich.github.io/afterimage/'}]
]};
