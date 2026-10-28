# Afterimage local retrieval API

Unpublished prototype. Eight **fictional synthetic** machine archive records. No answer generation, claim verification or personal-data ingestion. Built from the verified model spike; thresholds are unchanged (`0.4` similarity, `0.04` ambiguity margin, top 3).

## Install and run (Node 20+, verified Node 24.22.1)

```sh
npm ci
# ONE-TIME EXPLICIT network setup: public pinned model download, no credentials.
npm run setup:model
# Default server is strictly cache-only. Missing/bad cache exposes safe error status.
npm start
```

`npm ci` downloads pinned dependencies and may download platform runtime binaries. It is not an offline install. Preserve package-lock.json. `npm run setup:model` downloads only the pinned public model during explicit setup. Startup and search never enable remote model access; four model files must match `MODEL-SHA256SUMS` before loading. The setup command verifies them after download too. Do not run explicit setup alongside inference in the same process: Transformers.js configuration is process-global.

Optional nonsecret variables:
- `AFTERIMAGE_MODEL_CACHE`: absolute cache directory (default `./model-cache` relative to this package).
- `AFTERIMAGE_PORT`: port 1024–65535, default 8787.

No configurable bind address: **127.0.0.1 only**. No telemetry, query logs, query uploads, credentials, paid service or hosted inference. Dependency installation and explicit setup are separate from query processing. This is library-level offline behavior, not an OS network sandbox.

### Integration in the complete project

This directory is the `api/` package beneath the frontend project. From the project
root, `npm run api:install` installs its pinned dependencies, `npm run setup:model`
performs the explicit one-time model setup, and `npm run api` starts the API.
`npm run test:api` runs the complete API suite after setup. No model weights or
node_modules directory are included in the source delivery.

## Stable contract

- `GET /api/status` → `{status:"loading"|"ready"|"error",model:{id,revision,dtype,license,runtime},synthetic:true,retryable:boolean}`. No cache paths or raw failure details. Loading transitions to ready/error after initialization. An error means inspect installation/cache locally and restart; there is no remotely triggerable model download/reload route.
- `GET /api/archive` → `{synthetic:true,records:[{id,date,quote}]}`. Dates and quotes are verbatim archive values, not model output.
- `POST /api/search`, JSON `{query,requestId}` → `{requestId,query,status:"match"|"uncertain"|"no-match",reason,results:[{id,date,quote,score}]}`. Query is trimmed, 1–500 JavaScript UTF-16 code units. requestId is 1–80 ASCII alphanumeric/underscore/hyphen characters; UUIDs work. JSON body max 4096 bytes. Content-Type must be application/json (charset suffix accepted).
- Failures: `{error:{code,message,retryable},requestId?}`. 400 validation; 404 unknown route; 405 wrong search method; 413 body limit; 415 content type; 429 busy; 503 loading/unavailable/inference error. Transient HTTP errors include `Retry-After: 1`. Pure handler cancellation returns 499; a disconnected HTTP response is suppressed.

**Scores are cosine similarity, NOT confidence, truth probability or proof.** `uncertain` is a close top-two ranking, not a calibrated confidence band. `no-match` is not proof of absence. Original wording and IDs are retained. No generated explanatory claim is added.

### Frontend integration and security boundary

Use same-origin `/api` calls through a **loopback-only** dev server proxy. No wildcard CORS. The API rejects non-127.0.0.1 Host values, foreign Origin headers and cross-site browser requests to reduce DNS rebinding/drive-by access. Vite proxy configuration:

```js
server: {
  host: '127.0.0.1',
  proxy: { '/api': {
    target: 'http://127.0.0.1:8787', changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (req) => {
        req.setHeader('origin', 'http://127.0.0.1:8787');
      });
    }
  }}
}
```

A local proxy is trusted infrastructure, not authentication: never expose either server publicly or forward arbitrary remote traffic. This API has no user accounts/auth and must not hold private archives. A hostile local process can access loopback.

Client must create a fresh requestId per search, abort prior requests and render only responses whose echoed ID equals the latest active ID. Aborting HTTP **does not interrupt native ONNX compute**; it suppresses the response, holds the inference lock until completion and rejects new work with 429 meanwhile. Retry the latest request after Retry-After; do not revive stale results. Server permits one inference at a time and no queue. Index is only eight records; ONNX CPU intra/inter-op thread counts are 1. Query length, body size, HTTP request/header timeouts and concurrency are bounded. There is no claim of guaranteed inference wall-clock cancellation.

## Tests and honest limits

```sh
npm test       # mock-model pure contract and edge cases
npm run test:model # REAL cached model; global fetch throws
npm run test:http  # REAL loopback HTTP + cached model
npm run test:all
```

The copied baseline fixture records prior spike results, and real tests compare **every ranked score/quote/ID/date**, not only a chosen successful result. Preserved: **4/5 in-domain top-1, 5/5 top-3**, plus 2/2 off-topic no-matches. The recurring nighttime alarm query remains uncertain and its intended M07 result is within top 3, not top 1. This tiny hand-authored corpus is a smoke test, not a general accuracy benchmark. Do not tune thresholds to conceal its miss.

Verified here: 4 pure contract tests, 2 strict offline real-model tests, 1 real HTTP integration test and 1 path-encoding regression test. HTTP successfully bound to 127.0.0.1 in this environment. Browser-to-frontend integration and visual QA are separate and were not performed by this API task. Fresh `npm ci` and a fresh model download were not repeated: existing pinned dependencies/cache were reused and checked.

See `THIRD-PARTY-NOTICES.md` for license evidence and redistribution caveats.
