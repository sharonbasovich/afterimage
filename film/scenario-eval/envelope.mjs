import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,createCipheriv,createDecipheriv,publicEncrypt,privateDecrypt,constants} from 'node:crypto';
const [mode,keypath,input,output]=process.argv.slice(2), key=readFileSync(keypath);
if(mode==='encrypt'){
 const secret=randomBytes(32),nonce=randomBytes(12),c=createCipheriv('aes-256-gcm',secret,nonce);c.setAAD(Buffer.from('afterimage-scenario-evaluation-v1'));
 const ciphertext=Buffer.concat([c.update(readFileSync(input)),c.final()]);
 writeFileSync(output,JSON.stringify({version:1,alg:'RSA-OAEP-SHA256/AES-256-GCM',wrapped:publicEncrypt({key,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},secret).toString('base64'),nonce:nonce.toString('base64'),tag:c.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')}));
}else if(mode==='decrypt'){
 const e=JSON.parse(readFileSync(input));if(e.version!==1||e.alg!=='RSA-OAEP-SHA256/AES-256-GCM')throw Error('Unsupported envelope');
 const secret=privateDecrypt({key,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(e.wrapped,'base64'));
 const c=createDecipheriv('aes-256-gcm',secret,Buffer.from(e.nonce,'base64'));c.setAAD(Buffer.from('afterimage-scenario-evaluation-v1'));c.setAuthTag(Buffer.from(e.tag,'base64'));
 const plaintext=Buffer.concat([c.update(Buffer.from(e.ciphertext,'base64')),c.final()]);writeFileSync(output,plaintext);
}else throw Error('Use encrypt or decrypt');
