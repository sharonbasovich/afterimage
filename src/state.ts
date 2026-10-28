import type { ModelProgress, SearchResult } from './engine.ts';
export interface State {
  phase: 'disconnected' | 'idle' | 'loading' | 'ready' | 'searching' | 'error';
  operation: number; ready: boolean; submittedQuery?: string; progress?: ModelProgress; result?: SearchResult; error?: string; selected?: string;
}
export const initialState: State = { phase: 'disconnected', operation: 0, ready: false };
export type Action =
 | {type:'attach'; operation:number}
 | {type:'initialize'; operation:number}
 | {type:'progress'; operation:number; progress:ModelProgress}
 | {type:'ready'; operation:number}
 | {type:'search'; operation:number; query:string}
 | {type:'result'; operation:number; result:SearchResult}
 | {type:'error'; operation:number; error:string}
 | {type:'cancel'; operation:number}
 | {type:'reset'; operation:number}
 | {type:'select'; id:string};
export function reducer(state:State, action:Action):State {
  if (action.type === 'select') return {...state, selected:action.id};
  if (action.operation < state.operation) return state;
  switch (action.type) {
    case 'attach': return {...initialState, phase:'idle', operation:action.operation};
    case 'initialize': return {...state, phase:'loading', ready:false, operation:action.operation,error:undefined,result:undefined};
    case 'progress': return state.phase==='loading' ? {...state,progress:action.progress} : state;
    case 'ready': return state.phase==='loading' ? {...state,phase:'ready',ready:true,progress:undefined} : state;
    case 'search': return state.ready ? {...state,phase:'searching',operation:action.operation,submittedQuery:action.query,result:undefined,error:undefined,selected:undefined} : state;
    case 'result': return state.phase==='searching' ? {...state,phase:'ready',result:action.result,selected:action.result.evidence[0]?.recordId} : state;
    case 'error': return {...state,phase:'error',error:action.error,operation:action.operation,progress:undefined};
    case 'cancel': return {...state,phase:state.ready?'ready':'idle',operation:action.operation,progress:undefined,error:undefined};
    case 'reset': return {...state,submittedQuery:undefined,phase:state.ready?'ready':state.phase==='disconnected'?'disconnected':'idle',operation:action.operation,result:undefined,error:undefined,progress:undefined,selected:undefined};
  }
}
