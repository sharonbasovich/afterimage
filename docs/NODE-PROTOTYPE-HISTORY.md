# Afterimage — local UI prototype

Fresh implementation begun 2026-10-28 for the DEV Week 4 “Ghost in the Machine” theme. Local-only: no repository, deployment, upload, or submission created.

## Run

Node 24, npm:

```sh
npm ci
npm run api:install
npm run setup:model  # Explicit one-time download of the pinned public model.
npm run api          # Terminal 1: cache-only local API.
npm run dev
# Terminal 2: frontend. API listens at http://127.0.0.1:8787.
npm run typecheck
npm run lint
npm test
npm run test:api
npm run test:integration
npm run build
```

Vite binds only to 127.0.0.1 and proxies `/api` to 127.0.0.1:8787, rewriting Origin to the trusted local API origin. Do not expose either server publicly. Change `vite.config.ts` if your API uses another port. Production should serve `dist` and `/api` from the same origin via a trusted loopback proxy. No keys are required by the UI. This UI does not download or run a model by itself.

## Integration contract

`src/engine.ts` exports `ArchiveEngine` and source/evidence types. `App` accepts `engine`. Default entrypoint uses `createHttpEngine()`; it does not silently fall back to fake results.

- GET `/api/status`: `{status:'loading'|'ready'|'error'}` plus optional metadata. Loading is polled every 1500ms until ready/error/user cancellation; unavailable HTTP/network responses become retryable UI errors.
- GET `/api/archive`: `{synthetic:true, records:[{id,date,quote}]}`. Mapped to source `text`; metadata uses generic labels, not invented authors.
- POST `/api/search`: `{query,requestId}` -> `{requestId,query,status:'match'|'uncertain'|'no-match',reason,results:[{id,date,quote,score}]}`.
- Query limit 500 characters. Request IDs and query echoes are verified. Scores must be finite and between -1 and 1. HTTP 429 has a dedicated message. Cancel/reset/engine switching abort active operations, and a monotonic reducer token suppresses late results/progress/errors.
- Every result's citation ID must exist and quote must be an exact nonempty substring of source text. No-match cannot contain evidence. Unsupported evidence produces an error rather than a believable fabricated citation.
- Similarity is explicitly NOT confidence. `reason` appears as a retrieval note, not source testimony. No generated conclusion is required.

The real corpus is fictional/synthetic but real inference is distinct from the **synthetic interface preview**, which uses fixed results and performs no AI search. Preview is opt-in behind a developer disclosure. It labels itself conspicuously and documents its fixed special commands (“no match”, “error”).

## Design and behavior

Coherent landing + workspace: obsolete instrument illustration, archival amber/olive palette, paper transcript pane, semantic query, selectable evidence, chronological reveal, clear source/inference separation. The initial restricted-license card was removed after event-rights review; current method cards are original CSS under the project MIT license. See `THIRD-PARTY-NOTICES.md`.

Keyboard-visible focus, skip link, semantic form/status regions, native buttons/details, pressed evidence selection, expanded timeline state, mobile layout, 48px primary controls, reduced-motion CSS and component support. No remote assets or font calls. Source content is rendered as React text, never HTML or executable instructions. The UI currently has no file upload/import feature.

## Verified and limits

Passed: TypeScript strict check, ESLint, production build, 23 reducer/citation/adapter tests, eight API tests, and one real frontend-adapter-to-loopback-API integration test using the pinned cached model. Bundle approximately 250 kB JS / 79 kB gzip; no model in the frontend bundle. The model cache is about 23.7 MB and is acquired only by explicit setup.

**Browser visual and interaction QA has NOT been performed.** Chromium launch was blocked by socket EPERM in the available environment. The separately provided cloud browser could not reach the local execution server. No bypass was attempted. Responsive layout, contrast, scroll, hover, keyboard, touch, screen-reader behavior and reduced-motion are implemented by design but require actual browser/device verification. No screenshots exist. The HTTP adapter and running real API were integrated and tested, separately from browser verification.

Independent code review found and fixed an engine-switch render crash and a query/evidence attribution mismatch. Switching engines now aborts and clears old evidence synchronously. Results display the submitted question separately from later edits. Controlled actual-component render tests verified both fixes with effects deferred; these are not a substitute for browser tests.

Real-model smoke evaluation preserves its limitations: four of five relevant questions rank their intended source first; all five put it in the first three. Two unrelated questions produce no match. The known top-one miss remains visible as ambiguity rather than being hidden by threshold tuning. This tiny synthetic evaluation is not a general accuracy benchmark. Similarity is not confidence or verified truth.

No upstream card component is bundled. The original inline instrument illustration and CSS surfaces require no paid assets or external runtime requests.

Real initial corpus has explanatory maintenance notes, not explicit contradictory operator testimony. UI copy therefore says incomplete accounts rather than claiming contradictions. The labeled preview includes a deliberately contradictory example only. Timeline is chronological inspection, not automated contradiction detection.

Contest rules checked: https://dev.to/page/hacktoberfest-week4-2026-10-26-contest-rules — entry period Oct 26 09:00 PDT to Oct 31 23:59 PDT; fresh project, open-source AI/open weights central; submission needs public DEV post, demo and repository. No eligibility/submission claim is made by this prototype.
