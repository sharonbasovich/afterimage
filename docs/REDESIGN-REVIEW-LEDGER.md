# Redesign review ledger

## First candidate: 2b928a3

Independent review on October 30 (19:01–19:06 UTC), at the production-built local preview, returned **REJECT**. The spatial direction, first CTA/populated manual desk, loaded fonts, real WASM, normal/reduced motion, and fallback materially addressed the brief, but the narrow query-to-original journey failed.

At 393 × 851, activating real M07 search evidence highlighted the card while leaving its original completely above the viewport and keyboard focus on the result. That invisible state change blocked the primary journey despite the first candidate's 12 passing browser tests. The reviewer supplied actual screenshots, before/after geometry and real-model observations. No release approval was inferred from the passing tests.

## Assigned repair

On the stacked reading-desk layouts, activating a retrieved record now focuses and reveals its original and exposes **Return to results**, restoring the originating card's focus and position. Wide-screen comparison remains beside the records. The guarded navigation sequence invalidates queued handoffs on reset, new search or manual selection, and the existing timeline return behavior is retained.

The real-WASM browser regression now asserts visible original transcript, focus and return orientation for every retrieved record on narrow layouts. A secondary discovery improvement keeps the selected manual record visible within the horizontal phone rail without moving the page vertically. A human recovery explanation and optional technical details replace the primary raw loader exception.

The repair requires a new candidate identity and independent recheck. This ledger does not declare that recheck passed. The full blocking gate is in `EXPERIENCE-RELEASE-GATE.md`; hosted release, event/build-window review and the film/submission bundle remain outside local app-preview approval.
