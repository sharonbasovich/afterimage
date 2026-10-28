# Real browser source-pinned capture

Capture-only draft: `scripts/capture-demo.mjs` + `.github/workflows/demo-capture.yml`.

The workflow checks out the app at exact previously verified commit c38a1bd7c4bdc73a87bdf1bd5dce7bf66f3c6c80 separately from capture tooling. Fresh isolated Chromium context records 1600×900 WebM with actual WASM and same-origin pinned model assets. No interception, synthetic engine, injected app content, CSS alteration, storage preload, or hidden inference. Consent and entire elapsed loading are preserved in raw recording; edits must label shortened wait. Sidecar records precise relative shot markers, requests, errors and actual query results. Long hold PNGs also exported, derived directly from page pixels. App illustration is original UI, not hardware evidence.

GitHub standard public ubuntu-24.04 runner, no secrets, read-only token, no persisted checkout credentials, SHA-pinned actions, short artifact retention. No Pages deployment/release/contest or final film publication. Raw app capture artifact is accessible under the public repository's Actions access rules; final film remains private.

Validation so far: Node syntax check passed. Actual execution not yet run. Independent review required before source publication.

## Recorded outcomes

App footage used for private edit: run 40670230034, artifact 12809340234, capture commit c80fb79c0917273775e415291df3c4381e54ca70; app step passed, later motion step hung on a GSAP thenable returned through Playwright and was cancelled. Always-upload preserved complete app footage.

Motion footage used: run 40671693943, artifact 12808497268, capture commit 25a30e1e47086c57f413bc81b2a13c157260b6ba. Real app and all three motion recordings succeeded. Job failed afterward because GSAP npm package has no standalone LICENSE file. Metadata copy now preserves package.json and gsap.min.js with unmodified license header; this correction uses skip-ci and does not regenerate footage. GSAP uses its own Standard No Charge License, NOT MIT; official terms URL is in the retained runtime header. App source remains pinned c38a1bd7c4bdc73a87bdf1bd5dce7bf66f3c6c80 in both runs. Do not claim either workflow overall passed.
