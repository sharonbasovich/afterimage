import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createAPI} from '../api.mjs';
import {createServer} from '../server.mjs';
function request(port,{path='/api/status',method='GET',body,headers={}}={}) {
 return new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port,path,method,headers},res=>{let text='';res.on('data',x=>text+=x);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(text)}));});req.on('error',reject);req.end(body);});
}
test('real HTTP loopback routes, UTF-8, request limits and cross-origin rejection',async()=>{
 const api=createAPI();await api.initialize();const server=createServer(api);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const port=server.address().port;
 try {
  assert.equal(server.address().address,'127.0.0.1');
  assert.equal((await request(port)).body.status,'ready');
  assert.equal((await request(port,{path:'/api/archive'})).body.records.length,8);
  const r=await request(port,{path:'/api/search',method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:'Why are the lights blinking?',requestId:'http-1'})});
  assert.equal(r.status,200);assert.equal(r.body.results[0].id,'M04');assert.equal(r.headers['cache-control'],'no-store');
  assert.equal((await request(port,{headers:{origin:'https://malicious.example'}})).status,403);
  assert.equal((await request(port,{headers:{host:'evil.example'}})).status,403);
  assert.equal((await request(port,{headers:{'sec-fetch-site':'cross-site'}})).status,403);
  assert.equal((await request(port,{path:'/api/search',method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(5000)})).status,413);
  const utf=await request(port,{path:'/api/search',method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:'éclairage 灯',requestId:'utf8'})});
  assert.equal(utf.body.query,'éclairage 灯');
 }finally{await new Promise(r=>server.close(r));await api.dispose();}
});
