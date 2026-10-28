> Historical Node-prototype report only. Original raw 48-query artifacts are no longer available after temporary workspace loss. These aggregates are not a reproducibility claim or current browser-candidate benchmark.

# Retrieval evaluation and product boundaries

The initial seven-question smoke test preserved four of five relevant top-one
hits, five of five relevant top-three hits, and two unrelated no-matches. This is
not a general accuracy claim.

A separate, pre-labeled 48-query evaluation used the same fixed model, corpus text,
0.4 top-result threshold, and 0.04 ambiguity margin. No threshold was tuned to hide
misses. Two separate process runs reproduced every non-timing field.

Important observed limitations:

- Only three of seven temporal questions had a relevant first result. Sorting dates
  in the UI does not make the embedding model a temporal reasoning system.
- Three of six multi-record questions produced no match despite relevant passages.
- All six misleading-premise questions returned related passages; five received the
  internal `match` status. That status means semantic proximity, not factual support.
- The top-result threshold does not filter every lower-ranked candidate. Fifty-five
  of 99 returned passages were below 0.4, including one near 0.013.

The UI therefore says **related archive passages**, labels similarity as not
confidence, marks weak candidates, and explicitly warns that results do not confirm
the question's assumptions. Manual browsing exposes all original records even when
retrieval misses them. No generated answer or automated claim-verification result
is presented.

Across these cases, exact quotations, known source identifiers, finite bounded scores,
repeatability, and cancellation suppression/recovery checks passed. The hand-authored
synthetic corpus is tiny; these results do not establish general retrieval quality.

## Synthetic chronology correction

The original M07 fixture was dated October 28 while describing three subsequent
nights. Its record timestamp was corrected to October 31, 08:00 UTC, consistent with
a retrospective maintenance note. Text and embeddings were not changed. Expected
metadata in the fixed baseline was updated; ranking scores and the known miss remain
unchanged. Earlier evaluation snapshots retain the original timestamp as historical
evidence, not as the current corpus.

## Remaining validation

Real local model and HTTP-adapter tests are distinct from browser verification.
Actual browser visual/interaction checks, assistive-technology speech, physical
devices, and any final event submission remain unperformed. This is an unpublished
local prototype, not a completed competition entry.
