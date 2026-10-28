# Reconstructed candidate validation — 2026-10-28

## Recovery
The original temporary browser-candidate directory and its two archives were absent in both available executors. No prior Library upload was made. This is a new reconstruction from the preserved Node UI and prior worker implementation context, not byte-for-byte recovery. The original Node project remains unchanged.

## Passed on reconstructed source
- TypeScript strict check, whole-project ESLint (official vendored WASM loader files excluded), 37 unit/adapter/reducer tests.
- Actual React component server render: all eight sources present before initialization, explicit ~45 MB consent visible, search disabled, zero initialization calls.
- Production Vite build; browser worker bundled successfully.
- All four pinned model assets verified against original SHA256 manifest. WASM resources copied from installed pinned ONNX runtime package; asset hashes saved separately.
- Separate differently-worded seven-query, pre-labeled CPU inference smoke using the same pinned q8 model and browser retrieval function: five expected top-one sources and two no-matches. Exact raw results and runnable script retained. **Node CPU inference is not browser WASM verification.** This small set is not a general accuracy benchmark, is not comparable to the original seven-query baseline, and does not replace the historical 48-query evaluation. An eighth explicit original regression query, “How was the recurring nighttime alarm fixed?”, still ranks M02 first, M03 second, M07 third and returns ambiguous/uncertain. The known repair miss is preserved; no thresholds or labels were tuned. Raw evidence: `DIFFERENT-QUERY-SMOKE-AND-ORIGINAL-REGRESSION.json`.

## Current browser QA blocked
The supported managed preview CLI returned `http://127.0.0.1:4173/` and reported running. Opening through cloud CUA timed out; subsequent CDP tab inventory timed out at 50 seconds. Native Sky window inventory and screenshot showed no Chromium window. Supported app relaunch and desktop launcher did not produce a window. Preview was stopped. No raw browser process, socket bypass, permission/security change, or alternative browser driver was attempted.

An earlier full typecheck exited 137 during competing workload; after that workload stopped and preview was stopped, the serial full check/build completed successfully. First lint included official vendored loader files; fixed by excluding only `public/wasm/**`, not application source.

**Not verified on this reconstructed candidate:** actual browser model initialization/inference, browser cancellation/retry interaction, visual/responsive/keyboard/mobile behavior, network absence before consent, physical-device or assistive-technology output. Unit tests use mock workers for lifecycle coverage, not real WASM.

No repository, release, Site, account setting, competition submission, or existing submitted entry was changed. Private Library copies are preservation artifacts, not public publication.

## Independent-review corrections

- Corrected root and copied static legal notices to state that pinned q8 weights/tokenizers/runtime assets are bundled for same-origin hosting, although browser fetching remains consent-gated.
- Fixed stale worker event handling: both message/error callbacks now require the captured generation and worker identity to remain current. A regression test failed before the fix because an old worker error terminated its replacement; replacement initialization/search and disposed-state regressions now cover this path. This is a runtime change requiring the updated dist for final browser QA.

- Developer fixture initialization now says “Open fixed examples” and explicitly states that it does not load a model or download AI assets. Actual-component render test verifies the preview lacks real-model download claims.
