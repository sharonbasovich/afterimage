import test from 'node:test';
import assert from 'node:assert/strict';
import {clearModelCache} from './modelCache.ts';
import {MODEL,REVISION} from './protocol.ts';

const base=new URL('https://example.test/afterimage/');
const path=`models/${REVISION}/${MODEL}/`;
test('cache recovery deletes only the current app and pinned model namespace',async()=>{
 const own=[new URL(`${path}config.json`,base).href,new URL(`${path}onnx/model_quantized.onnx?cache=1`,base).href];
 const other=[
  new URL('models/unrelated-model/config.json',base).href,
  new URL(`models/other-revision/${MODEL}/config.json`,base).href,
  new URL(`${path.slice(0,-1)}-other/config.json`,base).href,
  new URL(`${path}config.json`,'https://example.test/other-app/').href,
  new URL(`${path}config.json`,'https://other.test/afterimage/').href,
  new URL('wasm/ort-wasm-simd-threaded.wasm',base).href,
 ];
 const entries=new Set([...own,...other]);const opened:string[]=[];
 const storage={open:async(name:string)=>{opened.push(name);return{
  keys:async()=>[...entries].map(url=>new Request(url)),
  delete:async(request:Request)=>entries.delete(request.url),
 } as unknown as Cache;}};
 await clearModelCache(base,storage);
 assert.deepEqual(opened,['transformers-cache']);assert.deepEqual([...entries],other);
});
test('cache recovery is harmless when CacheStorage is unavailable',async()=>{await clearModelCache(base,undefined);});
test('cache recovery reports inaccessible storage instead of silently reusing it',async()=>{
 for(const failure of ['open','keys','delete']){
  const denied=()=>{throw new Error('Storage unavailable');};
  const storage={open:async()=>{
   if(failure==='open')denied();
   return {keys:async()=>{if(failure==='keys')denied();return[new Request(new URL(`${path}config.json`,base))];},delete:async()=>denied()} as unknown as Cache;
  }};
  await assert.rejects(clearModelCache(base,storage),/Could not refresh the browser model cache/);
 }
});
test('cache recovery tolerates an entry already removed during cleanup',async()=>{
 const storage={open:async()=>({keys:async()=>[new Request(new URL(`${path}config.json`,base))],delete:async()=>false}) as unknown as Cache};
 await clearModelCache(base,storage);
});
