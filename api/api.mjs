import {readFile} from 'node:fs/promises';
import {retrieve} from './retrieve.mjs';
import {MODEL,loadModel} from './model.mjs';
export const MAX_BODY=4096;
const records=JSON.parse(await readFile(new URL('./corpus.json',import.meta.url),'utf8'));
const failure=(httpStatus,code,message,retryable=false,requestId)=>({httpStatus,body:{error:{code,message,retryable},...(requestId===undefined?{}:{requestId})}});
export function createAPI({loader=loadModel}={}) {
 let state='loading',model,vectors,busy=false,initializing;
 const initialize=()=>state==='ready'?Promise.resolve():initializing ??= (async()=>{
  state='loading';
  try { model=await loader();vectors=await model.embed(records.map(r=>r.text));state='ready'; }
  catch { if(model) await model.dispose().catch(()=>{});model=undefined;state='error'; }
 })().finally(()=>{initializing=undefined;});
 async function handle({method,path,body='',contentType='application/json',signal}={}) {
  if(method==='GET'&&path==='/api/status') return {httpStatus:200,body:{status:state,model:MODEL,synthetic:true,retryable:state==='error'}};
  if(method==='GET'&&path==='/api/archive') return {httpStatus:200,body:{synthetic:true,records:records.map(({id,date,text})=>({id,date,quote:text}))}};
  if(path!=='/api/search') return failure(404,'NOT_FOUND','Endpoint not found.');
  if(method!=='POST') return failure(405,'METHOD_NOT_ALLOWED','Use POST for search.');
  if(Buffer.byteLength(body)>MAX_BODY) return failure(413,'BODY_TOO_LARGE','Request body exceeds 4096 bytes.');
  if(contentType.split(';')[0].trim().toLowerCase()!=='application/json') return failure(415,'JSON_REQUIRED','Use application/json.');
  let input; try {input=JSON.parse(body);} catch {return failure(400,'INVALID_JSON','Provide a JSON object.');}
  if(!input||typeof input!=='object'||Array.isArray(input)) return failure(400,'INVALID_INPUT','Provide query and requestId.');
  const {query,requestId}=input;
  if(typeof requestId!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(requestId)) return failure(400,'INVALID_REQUEST_ID','requestId must be 1–80 ASCII letters, digits, underscores or hyphens.');
  if(typeof query!=='string'||!query.trim()||query.trim().length>500) return failure(400,'INVALID_QUERY','query must contain 1–500 characters after trimming.',false,requestId);
  if(signal?.aborted) return failure(499,'CANCELLED','Search was cancelled.',false,requestId);
  if(state!=='ready') return failure(503,'MODEL_NOT_READY',state==='loading'?'Model is loading. Retry shortly.':'Model unavailable. Check local setup and restart the API.',true,requestId);
  if(busy) return failure(429,'BUSY','One search is already running. Retry shortly.',true,requestId);
  busy=true;
  try {
   const [vector]=await model.embed([query.trim()]);
   if(signal?.aborted) return failure(499,'CANCELLED','Search was cancelled.',false,requestId);
   return {httpStatus:200,body:{requestId,query:query.trim(),...retrieve(vector,records,vectors)}};
  } catch {return failure(503,'INFERENCE_FAILED','Local search failed. Retry or restart the API.',true,requestId);}
  finally {busy=false;}
 }
 return {handle,initialize,dispose:async()=>{if(initializing)await initializing;if(busy)throw new Error('Search still active');await model?.dispose();state='error';}};
}
