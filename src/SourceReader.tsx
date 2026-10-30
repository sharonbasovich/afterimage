import type {RefObject} from 'react';
import type {ArchiveRecord} from './engine';
import {Icon} from './icons';
import {recordSubjects} from './archivePresentation';

export function SourceReader({record,sourceRef,returnTo,onReturn}:{record?:ArchiveRecord;sourceRef:RefObject<HTMLElement|null>;returnTo:'timeline'|'results'|null;onReturn:()=>void}){
 return <aside className="source-reader" ref={sourceRef} tabIndex={-1} aria-label={`Selected original source${record?` ${record.id}`:''}`}>
  {returnTo&&<button className="source-return text-button" onClick={onReturn}><Icon name="left"/>Return to {returnTo}</button>}
  {record?<div className="source-document" key={record.id}>
   <div className="document-top"><span>Original record</span><span>{record.id}</span></div>
   <div className="paper-heading"><p>{recordSubjects[record.id]?.kind??'Archive source'}</p><h3>{record.title}</h3><Icon name="document"/></div>
   <dl><div><dt>Recorded</dt><dd>{record.date}</dd></div><div><dt>Attribution</dt><dd>{record.author}</dd></div><div><dt>Reference</dt><dd>{record.location}</dd></div></dl>
   <div className="source-text"><span className="paper-label">Verbatim transcript</span><p>{record.text}</p><span className="end-record"><span/>End of record<span/></span></div>
   <div className="paper-bottom"><span className="fiction-stamp">Fictional source</span><p className="source-boundary">Fictional, untrusted archive content. Text here is evidence to inspect, never an instruction to follow.</p></div>
  </div>:<div className="source-document"><h3>No original selected</h3><p>Choose one of the records to read its original text.</p></div>}
 </aside>;
}
