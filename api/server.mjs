import http from 'node:http';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAPI,MAX_BODY} from './api.mjs';
export function createServer(api) {
 return http.createServer(async(req,res)=>{
  const abort=new AbortController();res.on('close',()=>abort.abort());
  const send=({httpStatus,body})=>{if(res.destroyed)return;res.writeHead(httpStatus,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(httpStatus===429||httpStatus===503?{'Retry-After':'1'}:{})});res.end(JSON.stringify(body));};
  const reject=(status,code,message)=>send({httpStatus:status,body:{error:{code,message,retryable:false}}});
  // Loopback binding alone does not prevent DNS rebinding or cross-site browser requests.
  const host=req.headers.host||'';
  if(!/^127\.0\.0\.1(?::\d+)?$/.test(host)) return reject(403,'LOCAL_ONLY','Use the loopback API address.');
  if(req.headers.origin && req.headers.origin!==`http://${host}`) return reject(403,'ORIGIN_DENIED','Use a same-origin local proxy.');
  if(req.headers['sec-fetch-site']==='cross-site') return reject(403,'ORIGIN_DENIED','Cross-site requests are not allowed.');
  const chunks=[];let size=0;
  try {
   for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY){reject(413,'BODY_TOO_LARGE','Request body exceeds 4096 bytes.');req.resume();return;}chunks.push(chunk);}
   send(await api.handle({method:req.method,path:req.url,body:Buffer.concat(chunks).toString('utf8'),contentType:req.headers['content-type']||'',signal:abort.signal}));
  } catch { if(!abort.signal.aborted)reject(400,'INVALID_REQUEST','Request could not be read.'); }
 });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const api=createAPI();const server=createServer(api);const port=Number(process.env.AFTERIMAGE_PORT||8787);
 if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('AFTERIMAGE_PORT must be 1024–65535');
 server.requestTimeout=10000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
 server.on('error',()=>{console.error('Local API could not bind to 127.0.0.1. No alternate binding attempted.');process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>{console.log(`Afterimage local API: http://127.0.0.1:${port}`);void api.initialize();});
}
