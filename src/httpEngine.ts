import {validateResult} from './engine.ts';
import type {ArchiveEngine, ArchiveRecord, ModelProgress} from './engine.ts';
interface ApiRecord {id:string; date:string; quote:string; title?:string; author?:string; location?:string}
interface ApiResult {requestId:string; query:string; status:'match'|'uncertain'|'no-match'; reason:string; results:{id:string;date:string;quote:string;score:number}[]}
export function createHttpEngine(baseUrl = ''): ArchiveEngine {
 const records:ArchiveRecord[]=[];
 const get = async (path:string, signal:AbortSignal, init?:RequestInit) => {
  let response:Response;
  try { response = await fetch(`${baseUrl}${path}`,{...init,signal}); }
  catch(error) { if(signal.aborted) throw error; throw new Error('Archive service is unavailable. Check that the local API is running, then retry.'); }
  if(!response.ok) throw new Error(response.status===429?'The archive is busy (429). Please wait a moment and retry.':`Archive service returned ${response.status}. Please retry.`);
  return response.json();
 };
 let request=0;
 return {
  name:'Local MiniLM semantic retrieval', records,
  async initialize({signal,onProgress}) {
   onProgress({stage:'indexing',message:'Checking the local model service…'});
   while(true) {
    const status = await get('/api/status',signal) as {status:string;message?:string;progress?:number};
    if(status.status==='ready') break;
    if(status.status==='error') throw new Error('The model service could not load its cache. Check local setup and restart the API, then retry.');
    if(status.status!=='loading') throw new Error('Unexpected model service status.');
    onProgress({stage:'indexing',message:status.message??'Loading the cached open model and indexing the archive…',progress:status.progress} as ModelProgress);
    await new Promise<void>((resolve,reject)=>{
     const abort=()=>{clearTimeout(timer);reject(new DOMException('Canceled','AbortError'));};
     const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},1500);
     if(signal.aborted) abort(); else signal.addEventListener('abort',abort,{once:true});
    });
   }
   const archive = await get('/api/archive',signal) as ApiRecord[]|{records:ApiRecord[]};
   const source=Array.isArray(archive)?archive:archive.records;
   if(!Array.isArray(source)||!source.length||source.some(r=>typeof r.id!=='string'||typeof r.date!=='string'||typeof r.quote!=='string')) throw new Error('The archive service returned no source records.');
   records.splice(0,records.length,...source.map(r=>({id:r.id,date:r.date,text:r.quote,title:r.title??`Record ${r.id}`,author:r.author??'Synthetic archive',location:r.location??`Archive / ${r.id}`})));
  },
  async search(query,{signal}) {
   const requestId=`afterimage-${++request}`;
   const data=await get('/api/search',signal,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,requestId})}) as ApiResult;
   if(data.requestId!==requestId) throw new Error('The service returned a different request. Please retry.');
   if(data.query!==query.trim()) throw new Error('The service returned a different query. Please retry.');
   if(!['match','uncertain','no-match'].includes(data.status)||!Array.isArray(data.results)) throw new Error('Unexpected archive response.');
   return validateResult({outcome:data.status==='match'?'matches':data.status==='uncertain'?'ambiguous':'no-match',evidence:data.results.map(r=>({recordId:r.id,quote:r.quote,score:r.score})),inference:data.reason,model:'all-MiniLM-L6-v2 · semantic similarity'},records);
  }
 };
}
