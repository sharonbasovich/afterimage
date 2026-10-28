/* global window */
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await mkdir('motion-capture',{recursive:true});
const browser=await chromium.launch();
const evidence=[];
try {
 for(const scene of ['intro','method','end']){
  console.log('MOTION scene start',scene);
  const context=await browser.newContext({viewport:{width:1600,height:900},recordVideo:{dir:'motion-capture',size:{width:1600,height:900}}});
  const page=await context.newPage();const pageCreated=Date.now();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve('motion/index.html')).href+`?scene=${scene}`);
  await page.waitForFunction(()=>window.__FILM_READY__===true,{},{timeout:15000});
  await page.evaluate(()=>{window.film.seek(4);});await page.screenshot({path:`motion-capture/${scene}-review.png`});console.log('MOTION review screenshot saved',scene);
  const duration=await page.evaluate(()=>window.film.duration);
  const start=Date.now();await page.evaluate(()=>{window.film.play();});console.log('MOTION playback started',scene);await page.waitForTimeout(duration*1000);
  const video=page.video();await context.close();console.log('MOTION context closed',scene);await video.saveAs(`motion-capture/${scene}.webm`);
  evidence.push({scene,duration,start,pageCreated,playbackOffsetEstimateSeconds:(start-pageCreated)/1000,errors,note:'Original GSAP editorial illustration, not application or inference evidence; recording includes initial seek-to-four review frame before playback starts.'});
  if(errors.length)throw Error(`${scene}: ${errors.join('; ')}`);
 }
}finally{await browser.close();await writeFile('motion-capture/provenance.json',JSON.stringify(evidence,null,2));}
