import {MODEL,REVISION} from './protocol.ts';

/** A failed initialization must not make Retry reuse an invalid cached asset. */
export async function clearModelCache(assetBase:URL,storage:Pick<CacheStorage,'open'>|undefined=typeof caches==='undefined'?undefined:caches):Promise<void>{
 if(!storage)return;
 const namespace=new URL(`models/${REVISION}/${MODEL}/`,assetBase);
 try{
  const cache=await storage.open('transformers-cache');
  for(const request of await cache.keys()){
   const url=new URL(request.url);
   if(url.origin===namespace.origin&&url.pathname.startsWith(namespace.pathname))await cache.delete(request);
  }
 }catch(error){
  throw new Error('Could not refresh the browser model cache. Please retry, or use a fresh browser session.',{cause:error});
 }
}
