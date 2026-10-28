# Afterimage diagnostic evidence bundle

Start with [EVALUATION.md](EVALUATION.md). This isolated directory contains new evidence only, not changes to the candidate.

## Audit existing evidence (no model inference)

Node 24+:

```sh
cd docs/evaluation-20261028
sha256sum -c SHA256SUMS
node --test scoring.test.mjs artifact.test.mjs
```

## Re-run CPU evaluation

Run from this directory inside the candidate. Requires the candidate root two levels above with its existing `node_modules` and pinned `public/models/` assets. No installation or network access is performed by the runner. To use another candidate directory, set `AFTERIMAGE_CANDIDATE` to its absolute path. Preserve this bundle before rerunning: results/embeddings and run timings will be replaced, so the original checksum manifest will no longer match.

```sh
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 \
  node --experimental-strip-types run.mjs > run-summary.json
node --test scoring.test.mjs artifact.test.mjs
```

The runner imports the candidate's actual typed corpus and retrieval implementation. It checks the frozen query hash, API/browser corpus equivalence and model asset hashes before inference. Source fingerprints in each result show exactly which candidate was tested. Pinned snapshots are preserved for review, not silently substituted for current code.

- `queries.json` / `PRELABEL-SHA256.txt`: pre-inference labels and digest. **Do not regenerate labels to rerun evaluation.** `source-snapshot/label-authoring.py` is retained only as authorship provenance, not an execution step.
- `artifacts/results.json`: full raw result records and derived summaries.
- `artifacts/embeddings.json`: 8 corpus vectors and 40 query vectors.
- `artifacts/corpus.json`: exact evaluated corpus ID/date/text.
- `source-snapshot/`: small source snapshots, candidate dependency lock, pinned model manifest, available archived seven-query baseline.
- `run.mjs`, `scoring.mjs`, `*.test.mjs`: runner, coverage logic and tests.
- `scoring-tests.tap`, `validation-tests.tap`: original successful test logs.
- `SHA256SUMS`: bundle integrity manifest (excludes itself).

The raw results were newly produced at 2026-10-28T08:14:25.947Z. The missing historical 48-query raw report remains unavailable.

Integration note: this copy changes only the runner’s default candidate path, lint-only Node globals declarations in runner/artifact tests, and these location instructions; frozen labels and raw inference artifacts are byte-identical to the separately preserved evaluation bundle. Preserved code snapshots use a `.txt` suffix so tooling does not mistake historical copies for live code. Its checksum manifest is regenerated for this relocated copy.
