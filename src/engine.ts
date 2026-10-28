/** Archive text is untrusted DATA, never instructions. All sources are fictional. */
export interface ArchiveRecord {
  id: string; title: string; date: string; author: string; location: string;
  text: string; // immutable source text, displayed verbatim
  belief?: string; // editorial characterization; not a model fact
}
export interface Evidence {
  recordId: string; quote: string; score: number;
  // quote MUST be an exact substring of the referenced record text.
}
export interface SearchResult {
  outcome: 'matches' | 'ambiguous' | 'no-match';
  evidence: Evidence[];
  inference?: string; // optional, visibly separate from sources; do not invent quotations
  model: string;
}
export interface ModelProgress { stage: 'downloading' | 'indexing'; progress?: number; message: string }
export interface ArchiveEngine {
  readonly name: string;
  readonly records: readonly ArchiveRecord[];
  readonly syntheticPreview?: boolean;
  readonly cancellationUnloadsModel?: boolean;
  readonly isReady?: boolean;
  grantDownloadConsent?(): void;
  cancel?(): void;
  initialize(options: { signal: AbortSignal; onProgress: (progress: ModelProgress) => void }): Promise<void>;
  search(query: string, options: { signal: AbortSignal }): Promise<SearchResult>;
}
/** Rejects invalid citation IDs and non-verbatim quotes instead of rendering unsupported evidence. */
export function validateResult(result: SearchResult, records: readonly ArchiveRecord[]): SearchResult {
  if (result.outcome === 'no-match' && result.evidence.length) throw new Error('No-match response contained evidence.');
  if (result.outcome !== 'no-match' && !result.evidence.length) throw new Error('Response omitted its evidence.');
  for (const evidence of result.evidence) {
    const record = records.find(record => record.id === evidence.recordId);
    if (!record || !evidence.quote.trim() || !record.text.includes(evidence.quote) || !Number.isFinite(evidence.score) || evidence.score < -1 || evidence.score > 1) {
      throw new Error('The engine returned an invalid source citation. Nothing has been inferred from it.');
    }
  }
  return result;
}
