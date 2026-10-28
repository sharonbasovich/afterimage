/** Retrieval coverage only. A related passage is never counted as premise verification. */
export function score(label, result, ranked, threshold = .4) {
 const wanted = new Set(label.relevant_record_ids);
 const returned = result.results.map(r => r.id);
 const hits = [...wanted].filter(id => returned.includes(id));
 const categories = [];
 if (wanted.size && !returned.length) categories.push('threshold-abstention-with-relevant-evidence');
 if (wanted.size && returned.length && !wanted.has(returned[0])) categories.push('top-one-relevance-miss');
 if (wanted.size && hits.length < wanted.size) categories.push('incomplete-relevant-set');
 if (!wanted.size && returned.length) categories.push('out-of-domain-return');
 if (result.results.some(r => r.score < threshold)) categories.push('weak-lower-ranked-candidate');
 if (label.category === 'misleading-premise' && returned.length) categories.push('related-results-for-non-supported-premise');
 if (label.category === 'misleading-premise' && result.status === 'match') categories.push('match-status-for-non-supported-premise');
 return {relevantCount:wanted.size, relevantReturned:hits.length, top1Relevant:wanted.size ? wanted.has(returned[0]) : null,
  anyRelevantAt3:wanted.size ? hits.length > 0 : null, allRelevantAt3:wanted.size ? hits.length === wanted.size : null,
  recallAt3:wanted.size ? hits.length / wanted.size : null,
  ungatedRecallAt3:wanted.size ? ranked.slice(0,3).filter(r=>wanted.has(r.id)).length/wanted.size : null,
  outOfDomainAbstained:wanted.size ? null : result.status === 'no-match',
  premiseSupport:label.premise_support, premiseVerification:'not-performed-by-retrieval-engine', categories};
}
export function summarize(rows) {
 const groups = {};
 for (const key of ['all', ...new Set(rows.map(r=>r.category))]) {
  const group=key==='all'?rows:rows.filter(r=>r.category===key), relevant=group.filter(r=>r.metrics.relevantCount);
  const errors={}; for(const r of group)for(const c of r.metrics.categories)errors[c]=(errors[c]||0)+1;
  groups[key]={queries:group.length,relevanceQueries:relevant.length,top1Hits:relevant.filter(r=>r.metrics.top1Relevant).length,
   anyRelevantAt3:relevant.filter(r=>r.metrics.anyRelevantAt3).length,allRelevantAt3:relevant.filter(r=>r.metrics.allRelevantAt3).length,
   macroRecallAt3:relevant.length?relevant.reduce((a,r)=>a+r.metrics.recallAt3,0)/relevant.length:null,
   microRecallAt3:relevant.length?relevant.reduce((a,r)=>a+r.metrics.relevantReturned,0)/relevant.reduce((a,r)=>a+r.metrics.relevantCount,0):null,
   noMatch:group.filter(r=>r.status==='no-match').length,match:group.filter(r=>r.status==='match').length,uncertain:group.filter(r=>r.status==='uncertain').length,
   returnedPassages:group.reduce((a,r)=>a+r.results.length,0),weakReturnedPassages:group.reduce((a,r)=>a+r.results.filter(x=>x.score<.4).length,0),categories:errors};
 }
 return groups;
}
