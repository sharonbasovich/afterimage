# Afterimage — browser-local spatial archive

A fictional archive instrument. Open-weights semantic retrieval finds related source passages; it does not generate testimony or establish whether a question's premise is true.

## Spatial archive interface
Choose one of eight fictional records on a procedural Three.js archive instrument, then read its unedited original at the evidence desk. A lightweight view preserves record selection when 3D is unavailable or unwanted. Reduced-motion preferences are respected. Barlow Condensed and Manrope are self-hosted; their SIL Open Font License notices and the Three.js MIT license are retained in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). The instrument is a fictional reading interface, not a visualization of model reasoning. This interface revision does not change the corpus, pinned model, similarity thresholds or known retrieval misses.

## Demo and revision history
The [56-second demo](https://www.youtube.com/watch?v=wm-Z-YpzmfQ) is an animated reconstruction of the earlier interface. Its queries, quotations, rankings and displayed similarities are preserved, while transitions and download timing are choreographed. It is not a screen recording of the spatial redesign or a model-speed benchmark. Its existing Scenario-generated narration, music and sound effects remain unchanged and are editorial presentation audio, not app audio. Use the [live app](https://sharonbasovich.github.io/afterimage/) for the current interface.

The spatial application was independently reviewed at commit 6b317b62a7751a2bf79d5c0a19990121f23d7b00. The [initial submitted application snapshot](https://github.com/sharonbasovich/afterimage/tree/008a75b96a5e63ad3a853c3dcbcc014ed2abed6f) remains available. The [original hosted interface](https://sharonbasovich.github.io/afterimage/archive/008a75b96a5e63ad3a853c3dcbcc014ed2abed6f/) and [reviewed spatial interface](https://sharonbasovich.github.io/afterimage/review/6b317b62a7751a2bf79d5c0a19990121f23d7b00/) are retained as immutable snapshots. Historical captures and evaluation reports retain their original revision labels.

## Run

Node 24+, npm:

```sh
npm ci
npm run setup:browser-assets  # Explicit, hash-verified public model/runtime setup.
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

The Git repository keeps model/runtime binaries out of version control. `setup:browser-assets` restores the exact SHA256-pinned resources from the official model revision and integrity-locked npm runtime package; it refuses mismatches. Source preservation archives may include these same assets. Setup requires network access; subsequent browser model requests are same-origin and consent-gated.

The default entrypoint uses a browser Web Worker, not a Node API. Serve `dist/` over HTTP(S) for a static deployment. No keys, account, or backend are required. The preserved `api/` directory and `docs/NODE-PROTOTYPE-HISTORY.md` document the earlier, separately tested loopback prototype; its prior validation is not evidence that this rebuilt browser candidate passed.

## AI development disclosure

OpenAI Codex/ChatGPT AI agents assisted with application implementation, fictional archive content, interface revisions, tests and evaluation tooling, documentation, code review, and debugging. This includes AI-generated code and text, not unaided human coding. Automated checks are evidence of the specific tested behavior, not human user validation or a guarantee of correctness.

The application's runtime AI is separate from that development assistance: after explicit consent, a browser Web Worker runs pinned q8 `Xenova/all-MiniLM-L6-v2` (revision `751bff37182d3f1213fa05d7196b954e230abad9`) through Transformers.js `3.8.1` and ONNX Runtime's WebAssembly CPU backend. It ranks source passages by semantic similarity; it does not generate testimony, verify a question's premise, or establish truth. Model/runtime licenses and attribution are preserved in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and the license files.

## Consent and data boundary

All eight fictional records are bundled and can be read before loading AI. Only an explicit **Enable browser AI (~45 MB)** action initializes the model. Model/runtime resources are downloaded from the same site and may remain in browser cache. Questions and embeddings are processed in the browser, not sent to hosted inference. The site host necessarily sees resource requests and ordinary network metadata. Clearing an investigation does not erase browser cache.

Model: `Xenova/all-MiniLM-L6-v2`, q8, revision `751bff37182d3f1213fa05d7196b954e230abad9`; Transformers.js `3.8.1`, WASM CPU runtime. The model is Apache-2.0 licensed. See third-party notices. Download size is approximate and depends on cached resources/runtime implementation.

## Product boundaries

- Exact source text and known IDs are validated before citations render.
- Similarity is not confidence, truth, or premise verification.
- Threshold 0.4 and ambiguity margin 0.04 are fixed, not an accuracy guarantee.
- Chronological inspection is not temporal reasoning or contradiction detection.
- Manual browsing remains available when model download or search fails.
- The separately labeled developer preview uses fixed examples and performs no AI search.
- A tiny fictional corpus is not a general accuracy benchmark. See `docs/EVALUATION.md` for earlier Node evaluation and known weaknesses.

## Recovery and verification

This candidate was reconstructed on 2026-10-28 from the preserved Node UI/source after the prior temporary browser candidate disappeared. It is not byte-for-byte recovery of the original archives; old archive hashes must not be used for this build. Current validation is recorded in `docs/RECOVERY-QA.md`.

The October 28 local reconstruction did not itself publish a Site, release or competition entry. Source publication and the DEV/STEM2Connect submissions followed later. Historical source snapshots and their evidence remain preserved; the spatial interface revision is an update to the same project, not a separately created entry.

## Production browser verification

`npm run test:browser` tests the production build with real Chromium/WASM inference (run `npm run build` and `npx playwright install chromium` first). GitHub Actions runs this on a clean public runner. Unit tests and the 40-query CPU evaluation are separate evidence; neither proves browser inference works. See workflow results for the exact tested commit and browser report. Known retrieval misses remain assertions, not corrected labels or hidden tuning. A passing build or source publication alone does not verify a hosted deployment or a contest submission; each needs its own recorded evidence.
