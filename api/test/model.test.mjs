import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createAPI} from '../api.mjs';
import {loadModel} from '../model.mjs';
test('real pinned CPU model: offline retrieval preserves complete baseline scores and known miss',async()=>{
 const fetch=globalThis.fetch;globalThis.fetch=()=>{throw new Error('No network permitted');};
 const api=createAPI();
 try {
  await api.initialize();assert.equal((await api.handle({method:'GET',path:'/api/status'})).body.status,'ready');
  const baseline=JSON.parse(await readFile(new URL('./baseline-offline.json',import.meta.url),'utf8'));
  let top1=0,top3=0;
  for(const [i,c] of baseline.results.entries()) {
   const r=await api.handle({method:'POST',path:'/api/search',body:JSON.stringify({query:c.query,requestId:`baseline-${i}`})});
   assert.equal(r.httpStatus,200);assert.equal(r.body.status,c.status);assert.deepEqual(r.body.results,c.results);
   if(c.expected){top1+=r.body.results[0]?.id===c.expected;top3+=r.body.results.some(x=>x.id===c.expected);}else assert.equal(r.body.status,'no-match');
  }
  assert.equal(top1,4);assert.equal(top3,5);
 } finally {await api.dispose();globalThis.fetch=fetch;}
});
test('missing offline cache fails without network',async()=>{
 const fetch=globalThis.fetch;let calls=0;globalThis.fetch=()=>{calls++;throw new Error('No network');};
 try {await assert.rejects(loadModel({cache:'/tmp/afterimage-deliberately-missing-cache'}));assert.equal(calls,0);}finally{globalThis.fetch=fetch;}
});
