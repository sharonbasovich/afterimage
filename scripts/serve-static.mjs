// Test the production artifact under a real directory prefix, without SPA fallback.
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
const root=resolve('dist');
const prefix=process.env.STATIC_PREFIX || '/';
if(!prefix.startsWith('/')||!prefix.endsWith('/')) throw new Error('STATIC_PREFIX must start/end with /');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.txt':'text/plain','.md':'text/plain'};
createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(prefix!=='/' && path===prefix.slice(0,-1)){res.writeHead(301,{Location:prefix});res.end();return;}
  if(!path.startsWith(prefix))throw new Error('Not found');
  let file=resolve(root,path.slice(prefix.length)||'index.html');
  if(file!==root&&!file.startsWith(root+sep))throw new Error('Not found');
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1');
