import test from 'node:test';
import assert from 'node:assert/strict';
import {createAPI} from '../api.mjs';
const request=(query=' lights ',requestId='test-1')=>({method:'POST',path:'/api/search',body:JSON.stringify({query,requestId})});
const loader=async()=>({embed:async texts=>texts.map(()=>[1,0]),dispose:async()=>{}});
test('readiness, archive, exact query and retrieval uncertainty',async()=>{
 const api=createAPI({loader});assert.equal((await api.handle({method:'GET',path:'/api/status'})).body.status,'loading');
 assert.equal((await api.handle(request())).httpStatus,503);await api.initialize();
 const archive=(await api.handle({method:'GET',path:'/api/archive'})).body;
 assert.equal(archive.synthetic,true);assert.equal(archive.records.length,8);assert.equal(archive.records[0].id,'M01');
 const r=await api.handle(request());assert.equal(r.body.query,'lights');assert.equal(r.body.requestId,'test-1');assert.equal(r.body.status,'uncertain');assert.equal(r.body.results[0].quote,archive.records[0].quote);
 await api.dispose();
});
test('validation and safe startup errors',async()=>{
 const api=createAPI({loader:async()=>{throw new Error('/secret/path sourceprompt');}});await api.initialize();
 assert.equal((await api.handle({method:'GET',path:'/api/status'})).body.status,'error');
 for(const [req,code] of [[request(''),400],[request('a'.repeat(501)),400],[request('x','<>'),400],[{...request(),body:'x'.repeat(4097)},413],[{...request(),contentType:'text/plain'},415],[{...request(),body:'null'},400],[{...request(),body:'{'},400],[{method:'GET',path:'/api/search'},405],[{method:'GET',path:'/other'},404]]) assert.equal((await api.handle(req)).httpStatus,code);
 assert(!JSON.stringify(await api.handle(request())).includes('secret'));
});
test('backpressure and cancellation retain lock until inference settles',async()=>{
 let release;let count=0;
 const api=createAPI({loader:async()=>({embed:async texts=>{if(++count===1)return texts.map(()=>[1,0]);return await new Promise(r=>{release=()=>r([[1,0]]);});},dispose:async()=>{}})});
 await api.initialize();const abort=new AbortController();const first=api.handle({...request(),signal:abort.signal});
 abort.abort();assert.equal((await api.handle(request('second','newer'))).httpStatus,429);release();assert.equal((await first).httpStatus,499);
 assert.equal((await api.handle({...request(),signal:abort.signal})).httpStatus,499);
 await api.dispose();
});
test('inference errors do not leak internal details',async()=>{
 let n=0;const api=createAPI({loader:async()=>({embed:async texts=>{if(n++)throw new Error('/private sourceprompt');return texts.map(()=>[1,0]);},dispose:async()=>{}})});await api.initialize();
 const r=await api.handle(request());assert.equal(r.httpStatus,503);assert(!JSON.stringify(r).includes('private'));await api.dispose();
});
