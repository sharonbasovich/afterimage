import {loadModel} from './model.mjs';
if(!process.argv.includes('--download')) {console.error('Explicit --download is required.');process.exitCode=1;} else {
 try {const model=await loadModel({download:true});await model.dispose();console.log('Pinned model cache downloaded and checksums verified.');}
 catch {console.error('Model setup failed. Check network access, dependency installation and cache permissions.');process.exitCode=1;}
}
