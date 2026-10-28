import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const directory=await mkdtemp(join(tmpdir(),'afterimage-render-'));
try {
 const output=join(directory,'app.cjs');
 await build({stdin:{contents:`import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {App} from './src/App';export function render(engine){return renderToStaticMarkup(createElement(App,{engine}));}`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:output});
 const {render}=createRequire(import.meta.url)(output);
 let initialized=0;
 const records=Array.from({length:8},(_,i)=>({id:`M0${i+1}`,title:`Record ${i+1}`,date:'1987-10-24',author:'Fictional',location:'Archive',text:`Exact source ${i+1}`}));
 const html=render({name:'Browser local',records,initialize:async()=>{initialized++},search:async()=>{throw Error('unexpected')}});
 assert.equal(initialized,0);
 assert.match(html,/Enable browser AI \(~45 MB\)/);
 assert.match(html,/Browse all 8 original records/);
 for(const record of records)assert.ok(html.includes(record.text));
 assert.match(html,/Questions stay in this browser/);
 assert.match(html,/<input[^>]*disabled=""/);
 const previewHtml=render({name:'Synthetic preview',records,syntheticPreview:true,initialize:async()=>{},search:async()=>{throw Error('unexpected')}});
 assert.match(previewHtml,/Open fixed examples/);
 assert.match(previewHtml,/It does not load a model or download AI assets/);
 assert.doesNotMatch(previewHtml,/Enable browser AI|approximately 45 MB/);
 console.log('PASS: actual component renders eight records and consent before initialization; search initially disabled.');
} finally {await rm(directory,{recursive:true,force:true});}
