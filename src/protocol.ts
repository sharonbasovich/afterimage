import type {ArchiveRecord,ModelProgress,SearchResult} from './engine.ts';
export const MODEL='Xenova/all-MiniLM-L6-v2';
export const REVISION='751bff37182d3f1213fa05d7196b954e230abad9';
export const DIMENSIONS=384;
export type Request={id:number;type:'initialize';assetBase:string;records:readonly ArchiveRecord[]}|{id:number;type:'search';query:string};
export type Reply={id:number;type:'progress';progress:ModelProgress}|{id:number;type:'ready'}|{id:number;type:'result';result:SearchResult}|{id:number;type:'error';message:string};
export interface WorkerPort{postMessage(message:Request):void;terminate():void;onmessage:((event:{data:Reply})=>void)|null;onerror:((event:{message:string})=>void)|null}
