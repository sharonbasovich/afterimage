/* global process, console, performance */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {score,summarize} from './scoring.mjs';
const here=dirname(fileURLToPath(import.meta.url)),candidate=resolve(process.env.AFTERIMAGE_CANDIDATE||resolve(here,'../..'));
const sha=b=>createHash('sha256').update(b).digest('hex'),read=async p=>readFile(resolve(candidate,p));
const labelsBytes=await readFile(resolve(here,'queries.json'));assert.equal(sha(labelsBytes),(await readFile(resolve(here,'PRELABEL-SHA256.txt'),'utf8')).split(/\s/)[0],'Frozen labels changed');
const labels=JSON.parse(labelsBytes),revision='751bff37182d3f1213fa05d7196b954e230abad9',modelId='Xenova/all-MiniLM-L6-v2';
const {browserRecords}=await import(pathToFileURL(resolve(candidate,'src/browserCorpus.ts'))),{retrieve,cosine}=await import(pathToFileURL(resolve(candidate,'src/browserRetrieve.ts')));
const records=browserRecords.map(({id,date,text})=>({id,date,text}));assert.deepEqual(records,JSON.parse(await read('api/corpus.json')),'API/browser corpus diverged');
const modelHashes={};for(const line of (await read('api/MODEL-SHA256SUMS')).toString().trim().split('\n')){const [hash,oldPath]=line.split(/\s+/);const relative=oldPath.split(`${revision}/`)[1],p=`public/models/${revision}/${modelId}/${relative}`;assert.equal(sha(await read(p)),hash,`Model hash mismatch ${p}`);modelHashes[relative]=hash;}
const {pipeline,env}=await import(pathToFileURL(resolve(candidate,'node_modules/@huggingface/transformers/src/transformers.js')));
env.allowRemoteModels=false;env.allowLocalModels=true;env.useFSCache=false;env.localModelPath=resolve(candidate,'public/models',revision)+'/';env.backends.onnx.wasm.numThreads=1;
const sourceHashes={};for(const p of ['src/browserCorpus.ts','src/browserRetrieve.ts','src/embedding.worker.ts','api/corpus.json','api/test/baseline-offline.json','package-lock.json'])sourceHashes[p]=sha(await read(p));
const start=performance.now(),createdUtc=new Date().toISOString();
const extractor=await pipeline('feature-extraction',modelId,{revision,dtype:'q8',device:'cpu',local_files_only:true,session_options:{intraOpNumThreads:1,interOpNumThreads:1}});
try{
 const loadMs=performance.now()-start,indexStart=performance.now(),vectors=(await extractor(records.map(r=>r.text),{pooling:'mean',normalize:true})).tolist(),indexMs=performance.now()-indexStart;
 const rows=[],queryVectors=[];
 for(const label of labels.queries){const t=performance.now(),vector=(await extractor(label.query,{pooling:'mean',normalize:true})).tolist()[0];assert.equal(vector.length,384);assert(vector.every(Number.isFinite));queryVectors.push({id:label.id,vector});
  const result=retrieve(vector,browserRecords,vectors),ranked=records.map((r,i)=>({id:r.id,score:cosine(vector,vectors[i])})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  for(const r of result.results){assert(records.some(x=>x.id===r.id&&x.date===r.date&&x.text===r.quote));assert(Number.isFinite(r.score)&&Math.abs(r.score)<=1+1e-12);}
  rows.push({...label,...result,fullRanking:ranked,latencyMs:performance.now()-t,metrics:score(label,result,ranked)});
 }
 const baseline=JSON.parse(await read('api/test/baseline-offline.json')),hard=rows.find(r=>r.query==='How was the recurring nighttime alarm fixed?'),old=baseline.results.find(r=>r.query===hard.query);
 const metadata={createdUtc,node:process.version,runtime:'Node native ONNX CPU; NOT browser WASM or visual/interaction QA',transformersVersion:JSON.parse(await read('node_modules/@huggingface/transformers/package.json')).version,onnxVersion:JSON.parse(await read('node_modules/onnxruntime-node/package.json')).version,modelId,revision,dtype:'q8',pooling:'mean',normalize:true,dimensions:384,threads:{intraOp:1,interOp:1},remoteModels:false,threshold:.4,margin:.04,limit:3,labelSha256:sha(labelsBytes),modelHashes,sourceHashes,loadMs,indexMs,totalMs:performance.now()-start};
 const report={metadata,summary:summarize(rows),originalHardQueryComparison:{query:hard.query,intended:'M07',archivedRanking:old.results.map(r=>r.id),currentRanking:hard.results.map(r=>r.id),archivedStatus:old.status,currentStatus:hard.status,scoreDeltas:hard.results.map((r,i)=>({id:r.id,delta:r.score-old.results[i].score})),note:'Archived seven-query baseline only; not lost 48-query artifacts.'},results:rows};
 await mkdir(resolve(here,'artifacts'),{recursive:true});await writeFile(resolve(here,'artifacts/results.json'),JSON.stringify(report,null,2)+'\n');await writeFile(resolve(here,'artifacts/embeddings.json'),JSON.stringify({corpus:records.map((r,i)=>({id:r.id,vector:vectors[i]})),queries:queryVectors})+'\n');await writeFile(resolve(here,'artifacts/corpus.json'),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify({summary:report.summary,hard:report.originalHardQueryComparison},null,2));
}finally{await extractor.dispose();}
