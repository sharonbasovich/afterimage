import test from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserEngine} from './browserEngine.ts';
import type {Request,Reply,WorkerPort} from './protocol.ts';
import {browserRecords} from './browserCorpus.ts';
import {retrieve} from './browserRetrieve.ts';
const record={id:'M01',text:'An exact source.',title:'Test',date:'1987-10-24',author:'Synthetic',location:'Archive'};
class FakeWorker implements WorkerPort{
 onmessage:WorkerPort['onmessage']=null;onerror:WorkerPort['onerror']=null;messages:Request[]=[];terminated=false;
 postMessage(message:Request){this.messages.push(message);}terminate(){this.terminated=true;}reply(reply:Reply){this.onmessage?.({data:reply});}
}
function setup(){const workers:FakeWorker[]=[];const engine=createBrowserEngine({records:[record],assetBase:'https://example.test/',workerFactory:()=>{const worker=new FakeWorker();workers.push(worker);return worker;}});return{engine,workers};}
const opts=()=>({signal:new AbortController().signal,onProgress:()=>{}});
async function ready(){const context=setup();context.engine.grantDownloadConsent();const init=context.engine.initialize(opts());context.workers[0].reply({id:1,type:'ready'});await init;return context;}
test('browser consent gate creates zero workers and sources are immutable',async()=>{const{engine,workers}=setup();await assert.rejects(engine.initialize(opts()),/consent/);assert.equal(workers.length,0);assert.equal(engine.state,'consent-required');assert.throws(()=>{(engine.records[0] as {text:string}).text='altered';});});
test('browser protocol supports progress and exact validated citations',async()=>{const{engine,workers}=setup();engine.grantDownloadConsent();const updates:string[]=[];const init=engine.initialize({...opts(),onProgress:p=>updates.push(p.message)});workers[0].reply({id:1,type:'progress',progress:{stage:'downloading',message:'Loading'}});workers[0].reply({id:1,type:'ready'});await init;assert.deepEqual(updates,['Loading']);const query=engine.search(' question ',opts());assert.deepEqual(workers[0].messages[1],{id:2,type:'search',query:'question'});workers[0].reply({id:2,type:'result',result:{outcome:'matches',evidence:[{recordId:'M01',quote:record.text,score:.6}],model:'test'}});assert.equal((await query).evidence[0].quote,record.text);assert.equal(engine.isReady,true);});
test('browser abort initialization terminates worker and suppresses stale ready',async()=>{const{engine,workers}=setup();engine.grantDownloadConsent();const control=new AbortController();const init=engine.initialize({...opts(),signal:control.signal});const reject=assert.rejects(init,{name:'AbortError'});control.abort();await reject;assert.equal(workers[0].terminated,true);workers[0].reply({id:1,type:'ready'});assert.equal(engine.state,'idle');assert.equal(engine.isReady,false);});
test('superseding browser initialization cannot let old rejection kill new worker',async()=>{const{engine,workers}=setup();engine.grantDownloadConsent();const first=engine.initialize(opts());const reject=assert.rejects(first,{name:'AbortError'});const second=engine.initialize(opts());await reject;assert.equal(workers[1].terminated,false);workers[0].reply({id:1,type:'ready'});assert.equal(engine.state,'loading');workers[1].reply({id:2,type:'ready'});await second;assert.equal(engine.isReady,true);});
test('browser canceled search unloads model and requires initialization',async()=>{const{engine,workers}=await ready();const control=new AbortController();const query=engine.search('question',{signal:control.signal});const reject=assert.rejects(query,{name:'AbortError'});control.abort();await reject;assert.equal(workers[0].terminated,true);assert.equal(engine.isReady,false);await assert.rejects(engine.search('again',opts()),/initialize/);});
test('browser rejects fabricated citations and out-of-range scores',async()=>{for(const evidence of [{recordId:'unknown',quote:'invented',score:.8},{recordId:'M01',quote:record.text,score:2}]){const{engine,workers}=await ready();const query=engine.search('question',opts());workers[0].reply({id:2,type:'result',result:{outcome:'matches',evidence:[evidence],model:'test'}});await assert.rejects(query,/invalid source citation/);assert.equal(engine.state,'error');}});
test('browser ignores stale request IDs and surfaces worker failure',async()=>{const{engine,workers}=await ready();const query=engine.search('question',opts());workers[0].reply({id:999,type:'error',message:'stale'});assert.equal(engine.state,'searching');workers[0].onerror?.({message:'WASM failed'});await assert.rejects(query,/WASM failed/);assert.equal(engine.isReady,false);assert.equal(engine.state,'error');});
test('disposed browser engine cannot restart',async()=>{const{engine}=await ready();engine.dispose();assert.equal(engine.state,'disposed');assert.throws(()=>engine.grantDownloadConsent(),/disposed/);await assert.rejects(engine.initialize(opts()),/disposed/);});
test('pre-aborted and oversized browser queries never post',async()=>{const{engine,workers}=await ready();const control=new AbortController();control.abort();await assert.rejects(engine.search('question',{signal:control.signal}),{name:'AbortError'});await assert.rejects(engine.search('x'.repeat(501),opts()),/500/);assert.equal(workers[0].messages.length,1);});
test('resolved browser search is suppressed if canceled before promise continuation',async()=>{const{engine,workers}=await ready();const query=engine.search('question',opts());workers[0].reply({id:2,type:'result',result:{outcome:'no-match',evidence:[],model:'test'}});engine.cancel();await assert.rejects(query,{name:'AbortError'});assert.equal(engine.state,'idle');});
test('browser has eight records before initialization and corrected M07 date',()=>{const engine=createBrowserEngine();assert.equal(engine.records.length,8);assert.equal(engine.records.find(r=>r.id==='M07')?.date,'1987-10-31T08:00:00Z');});
test('browser retrieval preserves parent fixed threshold and ambiguity rule',()=>{const records=browserRecords.slice(0,2);assert.equal(retrieve([1,0],records,[[0,1],[0,1]]).status,'no-match');assert.equal(retrieve([1,0],records,[[1,0],[1,.1]]).status,'uncertain');assert.equal(retrieve([1,0],records,[[1,0],[0,1]]).status,'match');});
test('stale worker error cannot terminate replacement during initialization or search',async()=>{
 const {engine,workers}=setup();engine.grantDownloadConsent();
 const first=engine.initialize(opts());const rejected=assert.rejects(first,{name:'AbortError'});
 const second=engine.initialize(opts());await rejected;
 // Attach a rejection observer even on the buggy implementation.
 const secondOutcome=second.then(()=>null,error=>error);
 workers[0].onerror?.({message:'Late superseded worker failure'});
 assert.equal(workers[1].terminated,false);assert.equal(engine.state,'loading');
 workers[1].reply({id:2,type:'ready'});assert.equal(await secondOutcome,null);
 const search=engine.search('question',opts());const searchOutcome=search.then(value=>value,error=>error);
 workers[0].onerror?.({message:'Late old failure during replacement search'});
 assert.equal(workers[1].terminated,false);assert.equal(engine.state,'searching');
 workers[1].reply({id:3,type:'result',result:{outcome:'no-match',evidence:[],model:'test'}});
 assert.equal((await searchOutcome).outcome,'no-match');assert.equal(engine.isReady,true);
});
test('stale worker error cannot revive a disposed browser engine',async()=>{
 const {engine,workers}=await ready();engine.dispose();
 workers[0].onerror?.({message:'Late failure after disposal'});
 assert.equal(engine.state,'disposed');assert.equal(engine.isReady,false);
 assert.throws(()=>engine.grantDownloadConsent(),/disposed/);
});
