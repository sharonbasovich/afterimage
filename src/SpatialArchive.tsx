import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import type {ArchiveRecord} from './engine';
import type {ArchiveSceneHandle} from './scene/createArchiveScene';
import {Icon} from './icons';
import {recordSubjects,shortDate} from './archivePresentation';

interface Props {records:readonly ArchiveRecord[];selectedId:string;onSelect:(id:string)=>void;onRead:()=>void}
export function SpatialArchive({records,selectedId,onSelect,onRead}:Props){
 const host=useRef<HTMLDivElement>(null);
 const scene=useRef<ArchiveSceneHandle|null>(null);
 const selection=useRef(selectedId);
 const pick=useRef(onSelect);
 const [lightweight,setLightweight]=useState(false);
 const [sceneState,setSceneState]=useState<'loading'|'spatial'|'flat'>('loading');
 const [rotation,setRotation]=useState(0);
 const selected=records.find(r=>r.id===selectedId)??records[0];
 const index=Math.max(0,records.findIndex(r=>r.id===selectedId));
 useEffect(()=>{pick.current=onSelect;},[onSelect]);
 useEffect(()=>{selection.current=selectedId;scene.current?.select(selectedId);},[selectedId]);
 useEffect(()=>{scene.current?.rotate(rotation);},[rotation]);
 useEffect(()=>{
  const element=host.current;if(!element||lightweight)return;
  let disposed=false;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>scene.current?.motion(!motion.matches);
  motion.addEventListener('change',change);
  void import('./scene/createArchiveScene').then(({createArchiveScene})=>{
   if(disposed)return;
   const handle=createArchiveScene(element,records,selection.current,!motion.matches,id=>pick.current(id),()=>{if(!disposed){setSceneState('flat');setLightweight(true);}});
   if(!handle){setSceneState('flat');setLightweight(true);return;}
   scene.current=handle;setSceneState('spatial');
  }).catch(()=>{if(!disposed){setSceneState('flat');setLightweight(true);}});
  return ()=>{disposed=true;motion.removeEventListener('change',change);scene.current?.dispose();scene.current=null;};
 },[records,lightweight]);
 const step=(offset:number)=>onSelect(records[(index+offset+records.length)%records.length]?.id??selectedId);
 return <div className={`spatial-archive ${lightweight?'is-flat':''}`} data-scene-state={lightweight?'flat':sceneState}>
  <div className="scene-meta"><span><span className="live-point"/>{records.length===8?'Eight':records.length} fictional accounts</span><button className="view-mode" onClick={()=>{setLightweight(!lightweight);if(lightweight)setSceneState('loading');}}>{lightweight?'Use 3D view':'Use lightweight view'}<Icon name="layers"/></button></div>
  <div className="spatial-stage" onPointerMove={event=>{if(event.pointerType==='mouse'){const b=event.currentTarget.getBoundingClientRect();scene.current?.pointer((event.clientX-b.left)/b.width-.5,(event.clientY-b.top)/b.height-.5);}}} onPointerLeave={()=>scene.current?.pointer(0,0)}>
   <div className="scene-canvas" ref={host} aria-hidden="true"/>
   {(lightweight||sceneState!=='spatial')&&<div className="flat-artifact" aria-hidden="true" style={{'--view-rotation':`${rotation}rad`} as CSSProperties}><div className="flat-plinth"/>{records.map((record,i)=><div className={`flat-carrier ${record.id===selectedId?'active':''}`} key={record.id} style={{'--i':i} as CSSProperties}><span>{record.id}</span><i/><i/><p>{recordSubjects[record.id]?.kind??record.title}</p></div>)}</div>}
   <div className="stage-coordinate" aria-hidden="true"><span>October 1987</span><span>Archive / {selectedId}</span></div>
   <div className="scene-orbit"><button className="icon-button" aria-label="Rotate archive left" disabled={rotation<=-.65} onClick={()=>setRotation(r=>Math.max(-.65,r-.2))}><Icon name="rotate"/></button><button className="icon-button" aria-label="Rotate archive right" disabled={rotation>=.65} onClick={()=>setRotation(r=>Math.min(.65,r+.2))}><Icon name="rotate" style={{transform:'scaleX(-1)'}}/></button></div>
  </div>
  <div className="artifact-selector" aria-label="Spatial archive record selection">{records.map(record=><button key={record.id} aria-label={`Select ${record.id} in archive`} aria-pressed={record.id===selectedId} onClick={()=>onSelect(record.id)}>{record.id}</button>)}</div>
  <div className="artifact-caption"><div><span>{selected?.id}<span className="caption-date">{selected?shortDate(selected.date):''}</span></span><h2>{recordSubjects[selectedId]?.name??selected?.title}</h2></div><button className="read-artifact" onClick={onRead}>Read original<Icon name="down"/></button></div>
  <div className="scene-pagination"><span>Explore the records. The model can wait.</span><div><button className="icon-button" aria-label="Previous record" onClick={()=>step(-1)}><Icon name="left"/></button><span>{index+1} / {records.length}</span><button className="icon-button" aria-label="Next record" onClick={()=>step(1)}><Icon name="right"/></button></div></div>
 </div>;
}
