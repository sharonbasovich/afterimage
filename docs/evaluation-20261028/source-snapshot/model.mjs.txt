import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const MODEL=Object.freeze({id:'Xenova/all-MiniLM-L6-v2',revision:'751bff37182d3f1213fa05d7196b954e230abad9',dtype:'q8',license:'Apache-2.0',runtime:'Transformers.js 3.8.1 / ONNX Runtime CPU 1.21.0'});
export const cachePath=()=>resolve(process.env.AFTERIMAGE_MODEL_CACHE || fileURLToPath(new URL('./model-cache',import.meta.url)));
export async function verifyCache(cache=cachePath()) {
 const manifest=await readFile(new URL('./MODEL-SHA256SUMS',import.meta.url),'utf8');
 for(const line of manifest.trim().split('\n')) {
  const [hash,path]=line.split(/\s+/);
  const bytes=await readFile(resolve(cache,path.replace(/^model-cache\//,'')));
  if(createHash('sha256').update(bytes).digest('hex')!==hash) throw new Error('Model integrity check failed');
 }
}
export async function loadModel({download=false,cache=cachePath()}={}) {
 if(!download) await verifyCache(cache);
 const {pipeline,env}=await import('@huggingface/transformers');
 env.cacheDir=cache; env.allowRemoteModels=download; env.allowLocalModels=true;
 env.backends.onnx.wasm.numThreads=1;
 const extractor=await pipeline('feature-extraction',MODEL.id,{revision:MODEL.revision,dtype:MODEL.dtype,device:'cpu',session_options:{intraOpNumThreads:1,interOpNumThreads:1}});
 try { await verifyCache(cache); } catch(e) { await extractor.dispose(); throw e; }
 return {embed:async texts=>(await extractor(texts,{pooling:'mean',normalize:true})).tolist(),dispose:()=>extractor.dispose()};
}
