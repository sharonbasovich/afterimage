# New retrieval evidence — 2026-10-28

**This is a new 40-query, hand-labeled diagnostic evaluation. It is not recovery of the lost 48-query report, a general accuracy benchmark, or browser QA.**

## Results

| Category | Queries | Relevant top-1 | Any relevant in returned top-3 | Entire labeled set in returned top-3 | No match |
|---|---:|---:|---:|---:|---:|
| Ordinary retrieval | 8 | 7 | 8 | 8 | 0 |
| Temporal / record chronology | 8 | 1 | 2 | 2 | 6 |
| Multi-record | 8 | 6 | 6 | 6 | 2 |
| Misleading premise | 8 | 8 | 8 | 7 | 0 |
| Unrelated | 8 | N/A | N/A | N/A | 8 |

Misleading-premise recall means retrieval of **correction or related context**, not support for the premise. All eight misleading-premise queries returned passages; seven received internal `match` status and one `uncertain`. The engine does not perform claim verification. No premise-verification accuracy is reported.

Across 32 queries with labeled relevant records: 22 top-one hits, 24 with any relevant returned top-three passage, and 23 with the complete labeled set. Macro returned recall is 73.4375%; micro returned recall is 33/45 (73.3333%). These aggregate coverage figures mix different diagnostic tasks and should not be advertised as product accuracy. The supported-question subset (ordinary, temporal, multi-record) has 14/24 top-one hits and 16/24 complete top-three sets.

Of 72 returned passages, **35 score below 0.4**. This is expected under the current implementation: threshold gates only the first result, then up to three candidates are returned. It is not a threshold implementation regression.

### Original hard query retained exactly

> How was the recurring nighttime alarm fixed?

Intended record remains **M07**. Actual result remains `uncertain`:

1. M02 — 0.41346315242201703
2. M03 — 0.39445953059669436
3. M07 — 0.386465203968284

All three scores exactly equal the available archived **seven-query** baseline. This demonstrates this regression in the new run, not reproduction of the missing 48-query run. No labels, thresholds, embeddings, or corpus text were changed to turn it into a top-one success.

## Practical failure modes

- **Chronology is not embedded metadata.** Only record text is embedded. Date-oriented Q09–Q13 and Q16 abstain; Q14 returns the corridor speaker record before its chronologically subsequent target. Sorting source dates or browsing records can help users inspect chronology, but is not model temporal reasoning.
- **Multi-record composition can abstain despite available evidence.** Q23 (October 27 prints and pressure) and Q24 (humming and missing personnel history) return nothing.
- **Similarity does not validate loaded premises.** For Q32, the model returns M07/M02/M03 while the complete corrective context also requires M08: the October 28 entry concerns missing files, not a completed repair follow-up. A high similarity result cannot prove a date or causal assumption.
- **Lower-ranked weak evidence is common.** UI labeling needs to continue distinguishing semantic similarity from confidence or truth and marking weak candidates.
- **The original paraphrase regression persists.** M07 is recoverable at rank three, not rank one. Manual archive access remains valuable.

`metrics.categories` supplies overlapping diagnostic flags. `top-one-relevance-miss` applies only when passages were returned; abstentions are separately labeled `threshold-abstention-with-relevant-evidence`. A misleading-premise result is a limitation/risk flag, not an assertion that the product generated a false answer.

## Method and boundaries

- Labels were written and SHA-256 frozen before this evaluation's first inference. Forty cases: eight in each category. One agent authored labels and scoring; **no independent adjudication or blind holdout**. The original hard query and archived baseline were already known.
- `queries.json` retains each exact query, all required relevant IDs, premise-support label, and rationale. `supported` means answerable from the fictional corpus; `contradicted` means conflicts with the archive's stated attribution/metadata, not proof of metaphysical impossibility; `unsupported` means the asserted detail/conclusion is not established. Unrelated questions have no relevant IDs.
- Temporal labels concern **record timestamps**, not guessed event dates. M07 is October 31, 08:00 UTC, a retrospective note. No exact capacitor-replacement date is inferred.
- Imported the candidate's actual `browserCorpus.ts` and `browserRetrieve.ts`; verified browser records equal the API corpus on ID/date/text. All eight records are hand-authored fiction. No source edits were made.
- Actual local model files passed all four pinned SHA-256 checks. Xenova/all-MiniLM-L6-v2, revision `751bff37182d3f1213fa05d7196b954e230abad9`, q8, normalized mean pooling, 384 dimensions; Transformers.js 3.8.1, ONNX Runtime **native Node CPU 1.21.0**, Node v24.22.1. One inference process; intra-/inter-op threads each 1. Remote downloads disabled. Existing dependencies only.
- Threshold 0.4, ambiguity margin 0.04, return limit 3 are unchanged. No tuning or corpus modification. Model sees record text, not timestamps or IDs. Each query is embedded separately; record texts are embedded in one batch.
- Stored full eight-record ranking is **ungated diagnostic data**. Main metrics score only actually returned passages after threshold abstention. Unrelated queries are excluded from recall denominators. Multi-record `allRelevantAt3` requires every labeled ID; a partial hit is not a complete answer.
- Results are CPU evidence about the pinned model and shared retrieval function. They do **not** establish browser WASM numerical parity, model download/consent behavior, worker cancellation, UI rendering, accessibility, visual polish, network privacy, or deployed behavior. No browser, publication, or authentication retry occurred.
- Eleven tests pass: six synthetic scoring tests plus five raw-artifact integrity/consistency checks. A single new inference run was performed; no repeat-run determinism claim is made. Timings are raw local observations, not performance claims.

## Files and reproduction

See `README.md`. Raw results include exact returned quotations/scores/status, all labels, all eight diagnostic ranks, timing, runtime versions, and model/source hashes. Full query and corpus embeddings are saved to permit independent offline scoring audits. Preserved source and the available seven-query baseline are under `source-snapshot/`; no old 48-query raw observations were reconstructed.
