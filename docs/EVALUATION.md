# Retrieval evaluation and product boundaries

## Current reproducible evidence: new 40-query CPU run

The primary supported evaluation is the **new pre-labeled 40-query diagnostic run of October 28, 2026**. It is not reconstruction of the unavailable historical 48-query raw report. See [full method, findings and limitations](evaluation-20261028/EVALUATION.md), [frozen labels](evaluation-20261028/queries.json), [raw results](evaluation-20261028/artifacts/results.json), and [runner instructions](evaluation-20261028/README.md).

| Category | Cases | Relevant top-one | Complete labeled evidence in returned top-three | No match |
|---|---:|---:|---:|---:|
| Ordinary | 8 | 7 | 8 | 0 |
| Temporal | 8 | 1 | 2 | 6 |
| Multi-record | 8 | 6 | 6 | 2 |
| Misleading premise | 8 | 8 | 7 | 0 |
| Unrelated | 8 | N/A | N/A | 8 |

For misleading premises, relevant evidence means corrective or contextual passages, **not confirmation of the premise**. All eight returned passages; seven received internal `match` status. The engine does not verify claims. Across all returned passages, 35/72 scored below 0.4 because the existing threshold gates only the first result.

The exact original query “How was the recurring nighttime alarm fixed?” still returns M02, M03, M07 with `uncertain` status; M07 remains the intended repair record. Scores exactly equal the archived seven-query baseline. No query relabeling, threshold adjustment, or corpus change was used to hide the miss.

This run used the candidate's actual corpus and retrieval implementation, pinned q8 MiniLM weights with verified hashes, Transformers.js 3.8.1 and native Node CPU ONNX Runtime 1.21.0, one inference process and one intra-/inter-op thread. **It is not browser WASM, interaction, accessibility, or visual QA.** Eleven evaluation/scoring/artifact tests pass. Labels were fixed before inference, but authored by the evaluating agent, not independently adjudicated. A tiny fictional archive and diagnostic sample do not establish general accuracy.

## Historical report preserved, raw 48-query observations unavailable

The earlier report is retained verbatim in [HISTORICAL-EVALUATION-UNAVAILABLE-RAW.md](evaluation-20261028/HISTORICAL-EVALUATION-UNAVAILABLE-RAW.md). Its aggregates remain historical, not reproduced measurements or substitutes for the new raw evidence. The new 40-query set differs from the historical set; compare neither as an accuracy improvement.
