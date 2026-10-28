import {validateResult} from './engine.ts';
import type {ArchiveEngine,ArchiveRecord,ModelProgress} from './engine.ts';
import type {Request,Reply,WorkerPort} from './protocol.ts';
import {browserRecords} from './browserCorpus.ts';
export type BrowserState='consent-required'|'idle'|'loading'|'ready'|'searching'|'error'|'disposed';
export interface BrowserEngine extends ArchiveEngine{readonly state:BrowserState;readonly requiresDownloadConsent:true;readonly cancellationUnloadsModel:true;readonly isReady:boolean;grantDownloadConsent():void;cancel():void;dispose():void}
const aborted=()=>new DOMException('Canceled','AbortError');
/** Consent + initialize are both required before any worker/model/runtime load. */
export function createBrowserEngine(options:{records?:readonly ArchiveRecord[];assetBase?:string;workerFactory?:()=>WorkerPort;onState?:(state:BrowserState)=>void}={}):BrowserEngine{
 const records=Object.freeze((options.records??browserRecords).map(r=>Object.freeze({...r})));
 let state:BrowserState='consent-required',consented=false,worker:WorkerPort|undefined,sequence=0,generation=0;
 let pending:{id:number;resolve:(reply:Reply)=>void;reject:(error:Error)=>void;cleanup:()=>void;progress?:(p:ModelProgress)=>void}|undefined;
 const setState=(value:BrowserState)=>{state=value;options.onState?.(value);};
 const stop=(error:Error,next:BrowserState)=>{generation++;const old=pending;pending=undefined;worker?.terminate();worker=undefined;old?.cleanup();old?.reject(error);setState(next);};
 const call=(request:Request,signal:AbortSignal,progress?:(p:ModelProgress)=>void)=>new Promise<Reply>((resolve,reject)=>{
  if(signal.aborted){reject(aborted());return;}
  const abort=()=>stop(aborted(),'idle');
  pending={id:request.id,resolve,reject,cleanup:()=>signal.removeEventListener('abort',abort),progress};
  signal.addEventListener('abort',abort,{once:true});
  try{worker!.postMessage(request);}catch(error){stop(error instanceof Error?error:new Error(String(error)),'error');}
 });
 return{
  name:'Browser-local MiniLM · WASM CPU · experimental',records,requiresDownloadConsent:true,cancellationUnloadsModel:true,
  get state(){return state;},get isReady(){return state==='ready';},
  grantDownloadConsent(){if(state==='disposed')throw new Error('Engine disposed');consented=true;if(state==='consent-required')setState('idle');},
  cancel(){if(state!=='disposed')stop(aborted(),consented?'idle':'consent-required');},
  dispose(){stop(aborted(),'disposed');},
  async initialize({signal,onProgress}){
   if(state==='disposed')throw new Error('Engine disposed');
   if(!consented)throw new Error('Explicit model download consent is required');
   if(signal.aborted)throw aborted();
   stop(aborted(),'loading');const own=generation;
   try{
    worker=options.workerFactory?.()??new Worker(new URL('./embedding.worker.ts',import.meta.url),{type:'module'}) as unknown as WorkerPort;
    const activeWorker=worker;
    worker.onmessage=({data})=>{
     if(own!==generation||worker!==activeWorker||!pending||data.id!==pending.id)return;
     if(data.type==='progress'){pending.progress?.(data.progress);return;}
     const done=pending;pending=undefined;done.cleanup();
     if(data.type==='error')done.reject(new Error(data.message));else done.resolve(data);
    };
    worker.onerror=event=>{
     if(own!==generation||worker!==activeWorker)return;
     stop(new Error(event.message||'Browser model worker failed'),'error');
    };
    const assetBase=options.assetBase??new URL('.',globalThis.location.href).href;
    const reply=await call({id:++sequence,type:'initialize',records,assetBase},signal,onProgress);
    if(own!==generation)throw aborted();
    if(reply.type!=='ready')throw new Error('Invalid initialization response');
    setState('ready');
   }catch(error){if(own===generation)stop(error instanceof Error?error:new Error(String(error)),'error');throw error;}
  },
  async search(query,{signal}){
   if(signal.aborted)throw aborted();
   if(state!=='ready')throw new Error('Browser model is not ready; initialize first');
   if(!query.trim()||query.trim().length>500)throw new Error('Query must contain 1–500 characters');
   setState('searching');const own=generation;
   try{
    const reply=await call({id:++sequence,type:'search',query:query.trim()},signal);
    if(own!==generation)throw aborted();
    if(reply.type!=='result')throw new Error('Invalid search response');
    const result=validateResult(reply.result,records);setState('ready');return result;
   }catch(error){if(own===generation)stop(error instanceof Error?error:new Error(String(error)),'error');throw error;}
  }
 };
}
