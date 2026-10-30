import {useEffect,useReducer,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import type {ArchiveEngine,ArchiveRecord} from './engine';
import {validateResult} from './engine';
import {initialState,reducer} from './state';

const noRecords:readonly ArchiveRecord[]=[];
/** Preserve the real engine's consent, cancellation and stale-operation boundary. */
export function useInvestigation(engine?:ArchiveEngine){
 const [activeEngine,setActiveEngine]=useState(engine);
 const [state,dispatch]=useReducer(reducer,initialState);
 const [query,setQuery]=useState('Why did the chime play when nobody was there?');
 const sequence=useRef(0);
 const controller=useRef<AbortController|undefined>(undefined);
 const next=()=>{controller.current?.abort();controller.current=new AbortController();return {id:++sequence.current,signal:controller.current.signal};};
 useEffect(()=>{
  controller.current?.abort();
  dispatch(activeEngine?{type:'attach',operation:++sequence.current}:{type:'reset',operation:++sequence.current});
  return ()=>{controller.current?.abort();activeEngine?.cancel?.();};
 },[activeEngine]);
 const initialize=async()=>{
  if(!activeEngine)return;
  activeEngine.grantDownloadConsent?.();
  const {id,signal}=next();dispatch({type:'initialize',operation:id});
  try {await activeEngine.initialize({signal,onProgress:progress=>dispatch({type:'progress',operation:id,progress})});if(!signal.aborted)dispatch({type:'ready',operation:id});}
  catch(error){if(!signal.aborted)dispatch({type:'error',operation:id,error:error instanceof Error?error.message:'Could not open the model.'});}
 };
 const search=async(event?:FormEvent)=>{
  event?.preventDefault();if(!activeEngine||!state.ready||!query.trim())return;
  const {id,signal}=next();dispatch({type:'search',operation:id,query:query.trim()});
  try {const result=validateResult(await activeEngine.search(query.trim(),{signal}),activeEngine.records);if(!signal.aborted)dispatch({type:'result',operation:id,result});}
  catch(error){if(!signal.aborted){if(activeEngine.isReady===false)dispatch({type:'attach',operation:id});dispatch({type:'error',operation:id,error:error instanceof Error?error.message:'Search failed. Please retry.'});}}
 };
 const switchEngine=(nextEngine:ArchiveEngine)=>{controller.current?.abort();activeEngine?.cancel?.();dispatch({type:'attach',operation:++sequence.current});setActiveEngine(nextEngine);};
 const cancel=()=>{controller.current?.abort();activeEngine?.cancel?.();dispatch({type:activeEngine?.cancellationUnloadsModel?'attach':'cancel',operation:++sequence.current});};
 const reset=()=>{controller.current?.abort();activeEngine?.cancel?.();dispatch({type:activeEngine?.cancellationUnloadsModel?'attach':'reset',operation:++sequence.current});};
 const select=(id:string)=>dispatch({type:'select',id});
 return {activeEngine,state,query,setQuery,records:activeEngine?.records??noRecords,initialize,search,switchEngine,cancel,reset,select};
}
