import {env,pipeline} from '@huggingface/transformers';
import type {FeatureExtractionPipeline} from '@huggingface/transformers';
import type {ArchiveRecord} from './engine.ts';
import {DIMENSIONS,MODEL,REVISION} from './protocol.ts';
import type {Request,Reply} from './protocol.ts';
import {retrieve} from './browserRetrieve.ts';
const scope=globalThis as unknown as {location:Location;onmessage:((event:{data:Request})=>void)|null;postMessage:(reply:Reply)=>void};
let extractor:FeatureExtractionPipeline|undefined,records:readonly ArchiveRecord[]=[],vectors:number[][]=[];
function check(values:number[][]){if(!values.length||values.some(v=>v.length!==DIMENSIONS||v.some(x=>!Number.isFinite(x))))throw new Error('Model returned invalid 384-dimensional embeddings');return values;}
let busy=false;
scope.onmessage=async({data})=>{
 if(busy){scope.postMessage({id:data.id,type:'error',message:'Worker is busy'});return;}
 busy=true;
 try{
  if(data.type==='initialize'){
   const base=new URL(data.assetBase,scope.location.href);
   if(base.origin!==scope.location.origin||!['http:','https:'].includes(base.protocol))throw new Error('Assets must be same-origin HTTP(S)');
   if(!base.pathname.endsWith('/'))base.pathname+='/';
   env.allowRemoteModels=false;env.allowLocalModels=true;env.useFSCache=false;
   env.useBrowserCache=typeof caches!=='undefined';
   env.localModelPath=new URL(`models/${REVISION}/`,base).href;
   env.backends.onnx.wasm!.wasmPaths=new URL('wasm/',base).href;
   env.backends.onnx.wasm!.numThreads=1;env.backends.onnx.wasm!.proxy=false;
   const createExtractor=pipeline as unknown as (task:'feature-extraction',model:string,options:Record<string,unknown>)=>Promise<FeatureExtractionPipeline>;
   extractor=await createExtractor('feature-extraction',MODEL,{revision:REVISION,dtype:'q8',device:'wasm',local_files_only:true,progress_callback:(progress:unknown)=>{
    const p=progress as {status:string;file?:string;progress?:number};
    scope.postMessage({id:data.id,type:'progress',progress:{stage:'downloading',message:`${p.status}: ${p.file??'pinned model'}`,progress:typeof p.progress==='number'?p.progress:undefined}});
   }});
   records=data.records;
   scope.postMessage({id:data.id,type:'progress',progress:{stage:'indexing',message:'Embedding eight synthetic archive records locally…'}});
   vectors=check((await extractor(records.map(r=>r.text),{pooling:'mean',normalize:true})).tolist());
   if(vectors.length!==records.length)throw new Error('Index mismatch');
   scope.postMessage({id:data.id,type:'ready'});
  }else{
   if(!extractor||!vectors.length)throw new Error('Model not initialized');
   const query=check((await extractor(data.query,{pooling:'mean',normalize:true})).tolist())[0];
   const result=retrieve(query,records,vectors);
   scope.postMessage({id:data.id,type:'result',result:{outcome:result.status==='match'?'matches':result.status==='uncertain'?'ambiguous':'no-match',evidence:result.results.map(r=>({recordId:r.id,quote:r.quote,score:r.score})),inference:result.reason,model:'all-MiniLM-L6-v2 · browser WASM · semantic similarity'}});
  }
 }catch(error){scope.postMessage({id:data.id,type:'error',message:error instanceof Error?error.message:String(error)});}
 finally{busy=false;}
};
