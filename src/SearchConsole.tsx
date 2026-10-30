import type {FormEvent,RefObject} from 'react';
import type {ArchiveEngine,ArchiveRecord} from './engine';
import type {State} from './state';
import {Icon} from './icons';
import {displayDate} from './archivePresentation';

interface Props {
 engine?:ArchiveEngine;state:State;query:string;records:readonly ArchiveRecord[];selectedId?:string;
 queryRef:RefObject<HTMLTextAreaElement|null>;onQuery:(q:string)=>void;onSearch:(event?:FormEvent)=>void;
 onInitialize:()=>void;onCancel:()=>void;onReset:()=>void;onSelect:(id:string,origin:HTMLButtonElement)=>void;onRead:()=>void;onRealEngine?:()=>void;
}
export function SearchConsole({engine,state,query,records,selectedId,queryRef,onQuery,onSearch,onInitialize,onCancel,onReset,onSelect,onRead,onRealEngine}:Props){
 const preview=engine?.syntheticPreview;
 const busy=state.phase==='loading'||state.phase==='searching';
 return <section className="search-console" aria-labelledby="search-title">
  <div className="console-heading"><Icon name="search"/><h3 id="search-title">Ask the archive.</h3></div>
  <p className="console-description">Find related language. Keep your own conclusions.</p>
  <div className="engine-bar"><span className={`status-dot ${state.ready?'ready':''}`}/><span>{preview?'Synthetic UI preview — no AI running':engine?.name??'No model connected'}</span><span className="engine-state">{state.ready?`${records.length} records available`:state.phase==='loading'?'Opening model…':'Not initialized'}</span></div>
  {preview&&<div className="preview-warning">Development preview: these are fixed, authored examples, not AI search results. Any query shows the same example except &quot;no match&quot; and &quot;error&quot;. {onRealEngine&&<button className="text-button" onClick={onRealEngine}>Return to real engine<Icon name="arrow"/></button>}</div>}
  {!state.ready&&<div className="initialize-panel"><h4>{state.phase==='loading'?'Preparing the archive':'Reading needs no download.'}</h4><p>{preview?'This labeled interface preview uses fixed authored examples. It does not load a model or download AI assets.':engine?'Only when you choose Enable browser AI, this page downloads approximately 45 MB of pinned open model and runtime files served with this site. Your browser may cache them. Questions stay in this browser; no hosted AI receives them. You can browse all eight fictional records without downloading the model.':'Connect an ArchiveEngine adapter to search with a real model.'}</p><button className="primary" disabled={!engine||busy} onClick={onInitialize}>{state.phase==='loading'?'Preparing…':preview?'Open fixed examples':'Enable browser AI (~45 MB)'}<Icon name="plus"/></button></div>}
  <form onSubmit={onSearch} className="search-form"><label htmlFor="query">What are you trying to understand?</label><div className="search-box"><textarea ref={queryRef} id="query" maxLength={500} rows={3} value={query} onChange={event=>onQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();onSearch();}}} placeholder="Why did the chime play when nobody was there?" disabled={!state.ready} autoComplete="off"/><button className="primary" type="submit" disabled={!state.ready||busy||!query.trim()}>{state.phase==='searching'?'Tracing…':'Trace the evidence'}<Icon name="arrow"/></button></div><div className="query-meta"><span>{query.length}/500</span><button type="button" className="text-button" onClick={onReset}>Clear investigation<Icon name="close"/></button></div></form>
  {state.submittedQuery&&(state.phase==='searching'||state.result)&&<p className="submitted-query">{state.phase==='searching'?'Searching for':'Results for'}: <q>{state.submittedQuery}</q>{query.trim()!==state.submittedQuery&&<span> Question edited. Search again to update the evidence.</span>}</p>}
  <div className="status-area" role="status" aria-live="polite" aria-atomic="true">
   {busy&&<div className="loading-state"><span className="loading-line"/><span>{state.progress?.message??'Comparing your question with the archive…'}</span>{state.progress?.progress!==undefined&&<progress max={100} value={state.progress.progress} aria-label="Model loading progress"/>}<button className="text-button" onClick={onCancel}>Cancel</button></div>}
   {state.phase==='error'&&<div className="error-state"><strong>The trace was interrupted.</strong><p>{state.ready?'Search could not be completed. Your original records are still available.':'The model could not be opened. Keep reading the originals, or retry the connection.'}</p><button className="secondary" onClick={()=>state.ready?onSearch():onInitialize()}>Retry {state.ready?'search':'connection'}<Icon name="rotate"/></button><details className="error-details"><summary>Technical details<Icon name="plus"/></summary><p>{state.error}</p></details></div>}
   {state.result?.outcome==='no-match'&&<div className="empty-state"><Icon name="search"/><h3>No close semantic match.</h3><p>No passage met the fixed similarity threshold. That does not prove the archive lacks relevant evidence. Browse the original records or try a more specific question.</p><button className="text-button" onClick={onRead}>Return to the original<Icon name="left"/></button></div>}
  </div>
  {state.result&&state.result.outcome!=='no-match'&&<div className="investigation">
   <div className="results-heading"><span>{preview?'Synthetic example':'Related archive passages'}</span><h3>{state.result.outcome==='ambiguous'?'A trace, not a verdict.':'Here is what the archive holds.'}</h3></div>
   {state.result.inference&&<aside className="inference"><span>{preview?'Authored preview interpretation':'Retrieval note, not source testimony'}</span><p>{state.result.inference}</p></aside>}
   <p className="retrieval-caution">Related passages are not an answer and do not confirm assumptions in your question. Lower-ranked candidates may be weak matches; read the original.</p>
   <div className="evidence-list" aria-label="Retrieved source records">{state.result.evidence.map((e,index)=>{const record=records.find(r=>r.id===e.recordId)!;return <button key={e.recordId} className={`evidence-card ${selectedId===e.recordId?'selected':''}`} onClick={event=>onSelect(e.recordId,event.currentTarget)} aria-pressed={selectedId===e.recordId}><span className="evidence-top"><span>{String(index+1).padStart(2,'0')} / {record.id}</span><time dateTime={record.date}>{displayDate(record.date)}</time></span><h4>{record.title}</h4><blockquote>{'“'}{e.quote}{'”'}</blockquote><span className="evidence-bottom"><span>SIMILARITY {e.score.toFixed(3)} · NOT CONFIDENCE{e.score<.4?' · WEAK CANDIDATE':''}</span><span className="evidence-action">Read original<Icon name="arrow"/></span></span></button>;})}</div>
   <p className="model-footnote">{state.result.model} · Similarity ranks related language. It does not establish factual truth or detect contradictions.</p>
  </div>}
  {!state.result&&!busy&&state.phase!=='error'&&<p className="console-boundary">The source is the evidence. AI only helps you find it.</p>}
 </section>;
}
