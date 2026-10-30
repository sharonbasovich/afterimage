import {test,expect,type Page} from '@playwright/test';
import {browserRecords} from '../../src/browserCorpus';

test.use({video:{mode:'on',size:{width:1280,height:800}}});
async function settled(page:Page){
 await expect.poll(async()=>{
  const before=await page.locator('.scene-canvas').getAttribute('data-render-count');
  await page.waitForTimeout(300);
  return before===await page.locator('.scene-canvas').getAttribute('data-render-count');
 },{timeout:15_000,message:'Scene must settle instead of rendering perpetually'}).toBe(true);
}

test('spatial archive offers real manual value before consent, loaded fonts and stable motion',async({page},info)=>{
 const requests:string[]=[];const errors:string[]=[];
 page.on('request',request=>requests.push(request.url()));page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./');
 const initial=browserRecords.find(r=>r.id==='M03')!;
 await expect(page.locator('.source-text p')).toHaveText(initial.text);
 await expect(page.locator('.record-index-list button')).toHaveCount(8);
 await expect(page.locator('.spatial-archive')).toHaveAttribute('data-scene-state',/spatial|flat/);
 const fonts=await page.evaluate(async()=>{await document.fonts.ready;return [...document.fonts].filter(font=>/Barlow Condensed|Manrope/.test(font.family)).map(font=>({family:font.family,status:font.status}));});
 expect(fonts.length).toBeGreaterThanOrEqual(3);expect(fonts.every(font=>font.status==='loaded')).toBe(true);
 expect(requests.some(url=>/\.woff2(?:\?|$)/.test(url))).toBe(true);
 expect(requests.filter(url=>/\/(models|wasm)\//.test(new URL(url).pathname))).toEqual([]);
 await page.screenshot({path:info.outputPath('opening.png')});
 const spatial=await page.locator('.spatial-archive').getAttribute('data-scene-state')==='spatial';
 if(spatial)await settled(page);
 const countBefore=Number(await page.locator('.scene-canvas').getAttribute('data-render-count'));
 await page.getByRole('button',{name:'Select M07 in archive',exact:true}).click();
 await expect(page.locator('.source-text p')).toHaveText(browserRecords.find(r=>r.id==='M07')!.text);
 if(spatial){
  await expect(page.locator('.scene-canvas')).toHaveAttribute('data-selected-record','M07');
  await page.waitForTimeout(80);await page.screenshot({path:info.outputPath('selection-in-progress.png')});
  await settled(page);
  const countAfter=Number(await page.locator('.scene-canvas').getAttribute('data-render-count'));
  const reduced=await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  await expect(page.locator('.scene-canvas')).toHaveAttribute('data-motion-policy',reduced?'reduced':'responsive');
  if(reduced)expect(countAfter-countBefore).toBeLessThanOrEqual(4);
  else expect(countAfter-countBefore).toBeGreaterThan(4);
 }
 await page.screenshot({path:info.outputPath('selected-carrier.png')});
 await page.getByRole('button',{name:'Enter the archive',exact:true}).click();
 await expect(page.locator('#archive')).toBeFocused();
 await expect(page.locator('.record-index-list button[aria-pressed="true"]')).toBeInViewport();
 await expect(page.getByRole('complementary',{name:'Selected original source M07'})).toBeVisible();
 await expect(page.getByLabel('What are you trying to understand?')).toBeDisabled();
 await page.locator('.record-index-list button').filter({hasText:'M02'}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('.source-text p')).toHaveText(browserRecords.find(r=>r.id==='M02')!.text);
 await page.screenshot({path:info.outputPath('manual-desk.png')});
 await page.getByRole('button',{name:'Reveal the timeline'}).click();
 await expect(page.locator('#timeline li')).toHaveCount(8);
 const inspect=page.locator('#timeline li').filter({hasText:'Three quiet nights'}).getByRole('button',{name:'Inspect source'});
 await inspect.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('complementary',{name:'Selected original source M07'})).toBeFocused();
 await page.getByRole('button',{name:'Return to timeline'}).click();await expect(inspect).toBeFocused();
 await expect(page.getByLabel('What are you trying to understand?')).toBeDisabled();
 expect(requests.filter(url=>/\/(models|wasm)\//.test(new URL(url).pathname))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
 await info.attach('scene-observation.json',{contentType:'application/json',body:JSON.stringify({fonts,spatial,scene:await page.locator('.scene-canvas').evaluate(el=>({...((el as HTMLElement).dataset)})),viewport:page.viewportSize(),requests,errors},null,2)});
});

test('WebGL-unavailable fallback preserves source exploration and all essential controls',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 // Fault injection affects only the decorative/interactive view, never model inference.
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type==='webgl2')return null;return Reflect.apply(original,this,[type,...args]);}});
 });
 await page.goto('./');
 await expect(page.locator('.spatial-archive')).toHaveAttribute('data-scene-state','flat');
 await expect(page.locator('.flat-artifact')).toBeVisible();
 const originalView=await page.locator('.flat-artifact').evaluate(element=>getComputedStyle(element).transform);
 await page.getByRole('button',{name:'Rotate archive right',exact:true}).click();
 await expect.poll(()=>page.locator('.flat-artifact').evaluate(element=>getComputedStyle(element).transform)).not.toBe(originalView);
 await page.getByRole('button',{name:'Next record',exact:true}).click();
 await expect(page.locator('.source-text p')).toHaveText(browserRecords.find(r=>r.id==='M04')!.text);
 await page.getByRole('button',{name:'Read original',exact:true}).click();
 await expect(page.getByRole('complementary',{name:'Selected original source M04'})).toBeFocused();
 await page.screenshot({path:info.outputPath('fallback-source.png')});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
