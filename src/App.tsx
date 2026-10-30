import {useCallback,useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import type {ArchiveEngine} from './engine';
import {previewEngine} from './fixtures';
import {focusAndReveal} from './sourceNavigation';
import {useInvestigation} from './useInvestigation';
import {BrandMark,Icon} from './icons';
import {SpatialArchive} from './SpatialArchive';
import {SourceReader} from './SourceReader';
import {SearchConsole} from './SearchConsole';
import {displayDate,recordSubjects,shortDate} from './archivePresentation';

export function App({engine}:{engine?:ArchiveEngine}) {
 const investigation=useInvestigation(engine);
 const {activeEngine,state,query,setQuery,records}=investigation;
 const [timeline,setTimeline]=useState(false);
 const [manualId,setManualId]=useState('M03');
 const queryRef=useRef<HTMLTextAreaElement>(null);
 const workspaceRef=useRef<HTMLElement>(null);
 const sourceRef=useRef<HTMLElement>(null);
 const recordListRef=useRef<HTMLDivElement>(null);
 const sourceNavigationSequence=useRef(0);
 const sourceOrigin=useRef<HTMLButtonElement|null>(null);
 const [sourceReturn,setSourceReturn]=useState<'timeline'|'results'|null>(null);
 const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clearSourceOrigin=useCallback(()=>{++sourceNavigationSequence.current;setSourceReturn(null);sourceOrigin.current=null;},[]);
 useEffect(()=>()=>{++sourceNavigationSequence.current;},[]);
 const selectRecord=(id:string)=>{clearSourceOrigin();setManualId(id);investigation.select(id);};
 const inspectSource=(id:string,origin:HTMLButtonElement,returnTo:'timeline'|'results')=>{
  sourceOrigin.current=origin;setSourceReturn(returnTo);setManualId(id);investigation.select(id);
  const navigation=++sourceNavigationSequence.current;
  requestAnimationFrame(()=>{if(navigation===sourceNavigationSequence.current)focusAndReveal(sourceRef.current,reducedMotion(),'start');});
 };
 const inspectTimelineSource=(id:string,origin:HTMLButtonElement)=>inspectSource(id,origin,'timeline');
 const inspectEvidenceSource=(id:string,origin:HTMLButtonElement)=>{if(window.matchMedia('(max-width:980px)').matches)inspectSource(id,origin,'results');else selectRecord(id);};
 const returnToSourceOrigin=()=>{++sourceNavigationSequence.current;focusAndReveal(sourceOrigin.current,reducedMotion());setSourceReturn(null);sourceOrigin.current=null;};
 const search=(event?:FormEvent)=>{clearSourceOrigin();void investigation.search(event);};
 const switchEngine=(next:ArchiveEngine)=>{clearSourceOrigin();investigation.switchEngine(next);setTimeline(false);};
 const reset=()=>{clearSourceOrigin();investigation.reset();setTimeline(false);queryRef.current?.focus();};
 const enter=()=>requestAnimationFrame(()=>focusAndReveal(workspaceRef.current,reducedMotion(),'start'));
 const readOriginal=()=>{clearSourceOrigin();const navigation=++sourceNavigationSequence.current;requestAnimationFrame(()=>{if(navigation===sourceNavigationSequence.current)focusAndReveal(sourceRef.current,reducedMotion(),'start');});};
 const sortedRecords=[...records].sort((a,b)=>a.date.localeCompare(b.date));
 const selected=records.find(r=>r.id===state.selected)??records.find(r=>r.id===manualId)??records[0];
 const citedRecords=records.filter(r=>state.result?.evidence.some(e=>e.recordId===r.id)).sort((a,b)=>a.date.localeCompare(b.date));
 const timelineRecords=state.result?.evidence.length?citedRecords:sortedRecords;
 const preview=activeEngine?.syntheticPreview;
 useEffect(()=>{
  const list=recordListRef.current;
  if(!list||!window.matchMedia('(max-width:700px)').matches)return;
  const active=list.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
  if(!active)return;
  const buttonBounds=active.getBoundingClientRect(),listBounds=list.getBoundingClientRect();
  list.scrollTo({left:list.scrollLeft+buttonBounds.left-listBounds.left+buttonBounds.width/2-listBounds.width/2,behavior:reducedMotion()?'instant':'smooth'});
 },[selected?.id]);

 return <>
  <a className="skip" href="#archive">Skip to archive</a>
  <header className="site-header">
   <a className="brand" href="#home" aria-label="Afterimage home"><BrandMark/><span>AFTERIMAGE</span></a>
   <span className="header-description">An investigation in eight records.</span>
   <nav aria-label="Main navigation"><a href="#method">The method</a><button className="text-button" onClick={enter}>Open archive<Icon name="arrow"/></button></nav>
  </header>
  <main>
   <section className="opening" id="home" aria-labelledby="hero-title">
    <div className="opening-copy">
     <p className="fiction-label"><span/>A fictional archive. A real paper trail.</p>
     <h1 id="hero-title">The machine<br/>wouldn't<br/>stay quiet.</h1>
     <p className="opening-description">At 02:13, a maintenance chime played with nobody on shift. Eight records remain. Start with one. Decide what it actually tells you.</p>
     <button className="primary hero-enter" onClick={enter}>Enter the archive<Icon name="arrow"/></button>
     <div className="opening-footnote"><span>Read without AI.</span><span>Search by meaning when you choose.</span></div>
    </div>
    <SpatialArchive records={records} selectedId={selected?.id??''} onSelect={selectRecord} onRead={readOriginal}/>
   </section>
   <section className="workspace" id="archive" ref={workspaceRef} tabIndex={-1} aria-labelledby="archive-title">
    <div className="workspace-heading"><div><p className="section-caption">The evidence desk</p><h2 id="archive-title">Follow the record.</h2></div><p className="desk-status" role="status"><span className="live-point"/>{selected?`Reading ${selected.id}`:'Choose a record'}<span>Fictional source material</span></p></div>
    <div className="reading-desk">
     <nav className="record-index" aria-label="Original archive records">
      <div className="index-heading"><Icon name="layers"/><h3>{records.length===8?'Eight accounts':'Original accounts'}</h3><span>{records.length}</span></div>
      <p>Read in any order.</p>
      <div className="record-index-list" ref={recordListRef}>{sortedRecords.map(record=><button key={record.id} onClick={()=>selectRecord(record.id)} aria-pressed={selected?.id===record.id} className={selected?.id===record.id?'active':''}><span className="record-index-id">{record.id}</span><span><strong>{recordSubjects[record.id]?.name??record.title}</strong><time dateTime={record.date}>{shortDate(record.date)}</time></span><Icon name="right"/></button>)}</div>
      <div className="index-boundary">Hand-authored fiction.<br/>Unedited originals.</div>
     </nav>
     <SourceReader record={selected} sourceRef={sourceRef} returnTo={sourceReturn} onReturn={returnToSourceOrigin}/>
     <SearchConsole engine={activeEngine} state={state} query={query} records={records} selectedId={selected?.id} queryRef={queryRef} onQuery={setQuery} onSearch={search} onInitialize={()=>void investigation.initialize()} onCancel={()=>{clearSourceOrigin();investigation.cancel();}} onReset={reset} onSelect={inspectEvidenceSource} onRead={readOriginal} onRealEngine={engine?()=>switchEngine(engine):undefined}/>
    </div>
    <section className="chronology" aria-label="Chronological source inspection">
     <div className="timeline-control"><div><span className="section-caption">A sequence, not a conclusion</span><h3>What changed over time?</h3><p>Sort {state.result?.evidence.length?'these passages':'all eight records'} by record date. Dates are not an automatic filter or proof of causation.</p></div><button className="secondary" onClick={()=>{clearSourceOrigin();setTimeline(!timeline);}} aria-expanded={timeline} aria-controls="timeline">{timeline?'Hide':'Reveal'} the timeline<Icon name={timeline?'minus':'plus'}/></button></div>
     {timeline&&<ol className="timeline" id="timeline">{timelineRecords.map(record=><li key={record.id} className={selected?.id===record.id?'timeline-selected':undefined} aria-current={selected?.id===record.id?'true':undefined}><time dateTime={record.date}>{displayDate(record.date)}</time><div><p className="timeline-record-label"><span className="timeline-record-id">{record.id}</span>{selected?.id===record.id&&<span className="reading-marker"> · Reading</span>}</p><h4>{recordSubjects[record.id]?.name??record.title}</h4><blockquote>{'“'}{record.text}{'”'}</blockquote>{record.belief&&<p className="belief"><strong>Editorial reading, not a source quote:</strong> {record.belief}</p>}<button className="text-button" onClick={event=>inspectTimelineSource(record.id,event.currentTarget)}>Inspect source<Icon name="arrow"/></button></div></li>)}</ol>}
    </section>
    {records.length>0&&<details className="archive-index"><summary>Browse all {records.length} original records<Icon name="plus"/></summary><p>Manual archive browsing, independent of semantic search. All records are fictional.</p><div>{sortedRecords.map(record=><article key={record.id}><div><h3>{record.title}</h3><span>{record.id} / <time dateTime={record.date}>{displayDate(record.date)}</time></span></div><blockquote>{record.text}</blockquote><button className="text-button" onClick={()=>{selectRecord(record.id);readOriginal();}}>Read original<Icon name="arrow"/></button></article>)}</div></details>}
   </section>
   <section className="method" id="method"><details><summary>How to read this archive<Icon name="plus"/></summary><div><h2>There are records.<br/>There is your reading of them.</h2><div><p>All eight accounts are hand-authored fiction. The scene is an original fictional archive instrument, not a visualization of AI reasoning.</p><p>Optional MiniLM q8 retrieves nearby language on your device. Similarity is not confidence, truth, or premise verification. A missing record is not proof. Read the original and keep the doubt.</p><p>Questions stay in the browser. The host receives ordinary resource requests. Resetting an investigation does not erase model files from your browser cache.</p></div></div></details></section>
   {!preview&&<details className="dev-tools"><summary>Developer interface preview<Icon name="plus"/></summary><p>Inspect fixed synthetic examples without a running AI service. This is not a model demonstration.</p><button className="secondary" onClick={()=>switchEngine(previewEngine)}>Open labeled synthetic preview</button></details>}
  </main>
  <footer><a className="brand" href="#home"><BrandMark/>AFTERIMAGE</a><p>Some things remain unexplained.<br/>None of the citations should.</p><div><a href={`${import.meta.env?.BASE_URL??'/'}legal/THIRD-PARTY-NOTICES.md`}>Licenses &amp; notices</a><span>Eight fictional records. No invented testimony.</span></div></footer>
 </>;
}
