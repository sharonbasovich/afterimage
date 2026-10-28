import test from 'node:test';
import assert from 'node:assert/strict';
import {createHttpEngine} from './httpEngine.ts';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const options=()=>({signal:new AbortController().signal,onProgress:()=>{}});
test('HTTP adapter maps real archive and search contract',async()=>{
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async(input,init)=>{
   if(String(input).endsWith('/status'))return json({status:'ready'});
   if(String(input).endsWith('/archive'))return json({synthetic:true,records:[{id:'M01',date:'1987-01-01',quote:'An exact source.'}]});
   const body=JSON.parse(String(init?.body));
   return json({requestId:body.requestId,query:body.query,status:'uncertain',reason:'Closely ranked candidates.',results:[{id:'M01',date:'1987-01-01',quote:'An exact source.',score:.4}]});
  };
  const engine=createHttpEngine();await engine.initialize(options());
  assert.equal(engine.records[0].text,'An exact source.');assert.equal(engine.records[0].author,'Synthetic archive');
  const result=await engine.search('What happened?',options());assert.equal(result.outcome,'ambiguous');assert.equal(result.evidence[0].recordId,'M01');
 } finally {globalThis.fetch=original;}
});
test('HTTP adapter reports rate limiting without fabricating result',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async()=>json({},429);await assert.rejects(createHttpEngine().search('x',options()),/429/);}finally{globalThis.fetch=original;}
});
test('HTTP adapter rejects mismatched response request ID',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async()=>json({requestId:'stale',status:'match',results:[]});await assert.rejects(createHttpEngine().search('x',options()),/different request/);}finally{globalThis.fetch=original;}
});
test('HTTP adapter rejects malformed archive',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async(input)=>String(input).endsWith('/status')?json({status:'ready'}):json({records:[{id:'M01',date:'1987-01-01'}]});await assert.rejects(createHttpEngine().initialize(options()),/no source records/);}finally{globalThis.fetch=original;}
});
test('canceling model polling aborts promptly',async()=>{
 const original=globalThis.fetch;const control=new AbortController();
 try{globalThis.fetch=async()=>json({status:'loading'});const pending=createHttpEngine().initialize({signal:control.signal,onProgress:p=>{if(p.stage==='indexing')control.abort();}});await assert.rejects(pending,{name:'AbortError'});}finally{globalThis.fetch=original;}
});
test('HTTP adapter rejects wrong query echo',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async(_input,init)=>json({requestId:JSON.parse(String(init?.body)).requestId,query:'other',status:'no-match',results:[]});await assert.rejects(createHttpEngine().search('x',options()),/different query/);}finally{globalThis.fetch=original;}
});
