import type { ArchiveEngine, ArchiveRecord } from './engine';
export const previewRecords: ArchiveRecord[] = [
 {id:'LOG-014',title:'The night shift hears it first',date:'1987-11-03',author:'Operator A',location:'Shift ledger / page 14',text:'At 02:14 the west relay clicked three times. I marked it as thermal expansion. The cooling pump was disconnected before midnight.',belief:'The operator believed the sound was harmless.'},
 {id:'LOG-021',title:'A fault without a circuit',date:'1987-11-09',author:'Operator B',location:'Inspection note / page 21',text:'The west relay repeats its three-click sequence with the supply isolated. Thermal expansion does not explain the regular interval. The auxiliary battery has not yet been inspected.',belief:'The next operator challenged the thermal explanation.'},
 {id:'LOG-033',title:'Something was still keeping time',date:'1987-11-17',author:'Operator C',location:'Repair ledger / page 33',text:'Found an auxiliary timer connected to the west relay. Removing its battery stopped the clicks. No test was performed on the cooling pump.',belief:'A timer explains the clicks, not every unresolved fault.'}
];
/** Deterministic UI states ONLY. Not retrieval, not AI; deliberately opt-in. */
export const previewEngine: ArchiveEngine = {
 name:'Synthetic interface preview — no AI', records:previewRecords, syntheticPreview:true,
 async initialize({signal,onProgress}) { onProgress({stage:'indexing',message:'Opening synthetic interface examples'}); if(signal.aborted) throw new DOMException('Canceled','AbortError'); },
 async search(query,{signal}) {
  if(signal.aborted) throw new DOMException('Canceled','AbortError');
  if(query.toLowerCase().includes('error')) throw new Error('Synthetic error state. Retry with a different preview example.');
  if(query.toLowerCase().includes('no match')) return {outcome:'no-match',evidence:[],model:'UI fixture — not a model'};
  return {outcome:'ambiguous',model:'UI fixture — not a model',inference:'These authored preview records disagree about the cause of the clicks. Read the dated sources before choosing an explanation.',evidence:previewRecords.map((r,i)=>({recordId:r.id,quote:r.text,score:0.8-i*0.05}))};
 }
};
