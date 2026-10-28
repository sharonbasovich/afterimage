export function cosine(a,b) {
 if(a.length !== b.length || !a.length) throw new Error('Embedding dimensions must match');
 let dot=0, aa=0, bb=0;
 for(let i=0;i<a.length;i++){if(!Number.isFinite(a[i])||!Number.isFinite(b[i])) throw new Error('Invalid embedding'); dot+=a[i]*b[i]; aa+=a[i]*a[i];bb+=b[i]*b[i];}
 if(!aa||!bb) throw new Error('Zero embedding');
 return dot/Math.sqrt(aa*bb);
}
export function retrieve(queryVector, records, vectors, {threshold=0.4, margin=0.04, limit=3}={}) {
 if(records.length!==vectors.length) throw new Error('Index mismatch');
 const ranked=records.map((record,i)=>({id:record.id,date:record.date,quote:record.text,score:cosine(queryVector,vectors[i])})).sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
 if(!ranked.length||ranked[0].score<threshold) return {status:'no-match',reason:'No archive passage met the similarity threshold. This is not proof of absence.',results:[]};
 return {status:ranked[1] && ranked[0].score-ranked[1].score<margin?'uncertain':'match',reason:'Similarity ranks passages; it does not verify a claim or establish causation.',results:ranked.slice(0,limit)};
}
