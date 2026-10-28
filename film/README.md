# Real browser source-pinned capture

Capture-only draft: `scripts/capture-demo.mjs` + `.github/workflows/demo-capture.yml`.

The workflow checks out the app at exact previously verified commit c38a1bd7c4bdc73a87bdf1bd5dce7bf66f3c6c80 separately from capture tooling. Fresh isolated Chromium context records 1600×900 WebM with actual WASM and same-origin pinned model assets. No interception, synthetic engine, injected app content, CSS alteration, storage preload, or hidden inference. Consent and entire elapsed loading are preserved in raw recording; edits must label shortened wait. Sidecar records precise relative shot markers, requests, errors and actual query results. Long hold PNGs also exported, derived directly from page pixels. App illustration is original UI, not hardware evidence.

GitHub standard public ubuntu-24.04 runner, no secrets, read-only token, no persisted checkout credentials, SHA-pinned actions, short artifact retention. No Pages deployment/release/contest or final film publication. Raw app capture artifact is accessible under the public repository's Actions access rules; final film remains private.

Validation so far: Node syntax check passed. Actual execution not yet run. Independent review required before source publication.
