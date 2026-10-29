import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
const root=resolve('film/kinetic-v2');const out=resolve('kinetic-render');await mkdir(out,{recursive:true});
const config=JSON.parse(await readFile(resolve(root,'render-config.json'),'utf8'));
if(!['preview','final'].includes(config.mode))throw Error('Unknown render mode');
const ranges=config.mode==='preview'?[{name:'opening',start:0,end:18.5},{name:'interaction',start:18.5,end:34.5}]:[{name:'motion-final',start:0,end:65.5}];
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+sep)){res.writeHead(403).end();return}const b=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});server.listen(4175,'127.0.0.1');await once(server,'listening');
let browser;const errors=[];const manifest={source:process.env.GITHUB_SHA,mode:config.mode,fps:30,width:1600,height:900,footage:'Editorial layer with actual source-frame proxies. Local compositor replaces declared intervals with genuine unchanged 1x capture.',ranges:[],pageErrors:errors};
try{browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4175');await page.waitForFunction(()=>window.ready===true);await page.evaluate(()=>document.fonts.ready);await page.locator('.ui img').evaluateAll(async images=>Promise.all(images.map(i=>i.decode())));
for(const r of ranges){const target=resolve(out,r.name+'.mp4');const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-vcodec','png','-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',target],{stdio:['pipe','inherit','inherit']});const count=Math.round((r.end-r.start)*30);for(let i=0;i<count;i++){const t=r.start+i/30;await page.evaluate(async t=>{await window.seek(t)},t);const png=await page.screenshot({type:'png'});if(!ff.stdin.write(png))await once(ff.stdin,'drain');if(i%15===0)await writeFile(resolve(out,`${r.name}-${String(i).padStart(5,'0')}.jpg`),await page.screenshot({type:'jpeg',quality:70}));}ff.stdin.end();const [code]=await once(ff,'close');if(code!==0)throw Error('ffmpeg failed '+code);manifest.ranges.push({...r,frames:count,sha256:createHash('sha256').update(await readFile(target)).digest('hex')});}
if(errors.length)throw Error(errors.join('\n'));manifest.complete=true;
}finally{if(browser)await browser.close();server.close();await writeFile(resolve(out,'render-manifest.json'),JSON.stringify(manifest,null,2));}
