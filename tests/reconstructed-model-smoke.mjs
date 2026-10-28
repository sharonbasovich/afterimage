import {pipeline,env} from '@huggingface/transformers';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {retrieve} from '../src/browserRetrieve.ts';
const revision='751bff37182d3f1213fa05d7196b954e230abad9';
const records=JSON.parse(await readFile('api/corpus.json','utf8'));
const cases=[['Why did the chime sound with no one on shift?','M03'],['What made the lights flicker?','M04'],['What caused the low humming noise?','M01'],['Why is the gauge stuck?','M06'],['Why did the nightly relay reset stop?','M07'],['How do I bake a chocolate cake?',null],['Which planet has the most moons?',null],['How was the recurring nighttime alarm fixed?','M07']];
env.allowRemoteModels=false;env.allowLocalModels=true;env.useFSCache=false;env.localModelPath=resolve('public/models',revision)+'/';
const extractor=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2',{revision,dtype:'q8',device:'cpu',local_files_only:true,session_options:{intraOpNumThreads:1,interOpNumThreads:1}});
try {
 const vectors=(await extractor(records.map(r=>r.text),{pooling:'mean',normalize:true})).tolist();
 const results=[];
 for(const [query,expected] of cases){const vector=(await extractor(query,{pooling:'mean',normalize:true})).tolist()[0];const result=retrieve(vector,records,vectors);for(const item of result.results){if(!records.some(r=>r.id===item.id&&r.text===item.quote)||!Number.isFinite(item.score)||Math.abs(item.score)>1)throw Error('Invalid evidence');}results.push({query,expected,...result});}
 const report={date:'2026-10-28',runtime:'Node ONNX CPU, NOT browser WASM',model:'Xenova/all-MiniLM-L6-v2',revision,dtype:'q8',casesPrelabeled:true,threshold:.4,margin:.04,results};
 await writeFile('docs/DIFFERENT-QUERY-SMOKE-AND-ORIGINAL-REGRESSION.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(results.map(r=>({query:r.query,expected:r.expected,status:r.status,top:r.results[0]?.id,score:r.results[0]?.score}))));
}finally{await extractor.dispose();}
