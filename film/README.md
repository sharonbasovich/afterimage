# Real browser source-pinned capture

Capture-only draft: `scripts/capture-demo.mjs` + `.github/workflows/demo-capture.yml`.

The workflow checks out the app at exact previously verified commit c38a1bd7c4bdc73a87bdf1bd5dce7bf66f3c6c80 separately from capture tooling. Fresh isolated Chromium context records 1600×900 WebM with actual WASM and same-origin pinned model assets. No interception, synthetic engine, injected app content, CSS alteration, storage preload, or hidden inference. Consent and entire elapsed loading are preserved in raw recording; edits must label shortened wait. Sidecar records precise relative shot markers, requests, errors and actual query results. Long hold PNGs also exported, derived directly from page pixels. App illustration is original UI, not hardware evidence.

GitHub standard public ubuntu-24.04 runner, no secrets, read-only token, no persisted checkout credentials, SHA-pinned actions, short artifact retention. No Pages deployment/release/contest or final film publication. Raw app capture artifact is accessible under the public repository's Actions access rules; final film remains private.

Pushes validate capture-source syntax and execute license collection from the committed GSAP lockfile without installing Chromium, downloading models, or recording footage. This is explicitly not a browser pass. Full source-pinned capture remains available through `workflow_dispatch`, after this workflow exists on the default branch; while PR2 is draft, the manual GitHub Actions control may be unavailable. Do not merge only to enable that control. No skip-ci marker is needed for metadata changes.

## Recorded outcomes

App footage used for private edit: run 40670230034, artifact 12809340234, capture commit c80fb79c0917273775e415291df3c4381e54ca70; app step passed, later motion step hung on a GSAP thenable returned through Playwright and was cancelled. Always-upload preserved complete app footage.

Motion footage used: run 40671693943, artifact 12808497268, capture commit 25a30e1e47086c57f413bc81b2a13c157260b6ba. Real app and all three motion recordings succeeded. Job failed afterward because GSAP npm package has no standalone LICENSE file. Metadata copy now preserves package.json and gsap.min.js with unmodified license header; that correction (62d6cb9ca1d4aba5762a49b9dd7ae11490eb00e4) used skip-ci and did not regenerate footage. GSAP uses its own Standard No Charge License, NOT MIT; official terms URL is in the retained runtime header. App source remains pinned c38a1bd7c4bdc73a87bdf1bd5dce7bf66f3c6c80 in both runs. Do not claim either workflow overall passed.

## Reproducibility boundary

The committed motion dependency lock is preserved from run 40671693943 and pins the official GSAP 3.15.0 tarball by SHA-512 integrity. Both validation and manual capture use npm ci with lifecycle scripts disabled. Collection retains the lock, package license metadata, and unmodified runtime license notice; it does not invent a missing LICENSE file. A passing validation job verifies only syntax, installation, and metadata collection. It cannot turn the historical canceled/failed capture runs into passes or establish a full-browser pass on a newer tooling head. The capture job preserves all consent, actual model/WASM, exact-source, rank-order, no-match and browser-error assertions.
