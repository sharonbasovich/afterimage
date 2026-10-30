# Spatial archive review candidate

Status: review branch only; not approved for deployment or contest submission.

## Baseline and preservation

Base: `008a75b96a5e63ad3a853c3dcbcc014ed2abed6f`. The initial live app and source were inspected on October 30. Its CSS/SVG instrument had no spatial interaction. Entering the archive exchanged that visual surface for initialization, a disabled form, a large empty state, and collapsed records. Earlier functional QA and the separately upgraded film did not establish app visual quality.

The baseline remains at local branch `archive/pre-redesign-20261030`, in the unmodified Git history, and in a source ZIP outside this checkout. Before screenshots are retained in `evidence/redesign-20261030/`. Existing submission/source evidence is not rewritten.

## Chosen direction

The assignment explicitly delegates a concrete design decision and candidate implementation. Three compatible treatments were considered: a live spatial relay desk, a CSS perspective paper cabinet, and a 2D signal-map investigation. The **live spatial relay desk** is selected because it makes the actual eight-record archive tangible and answers the owner's request for meaningful 3D. The CSS cabinet is its performance fallback, rather than a second competing site; the signal map was rejected because it would imply relationships absent from the sources.

The central object is an original procedural archive carousel: eight physical record carriers, a machined housing, a selected carrier lifting out of the assembly, and controls connected to real source selection. It is a fictional interface artifact, not a recovered historical machine or an AI visualization. Native record buttons and a document reader remain useful without WebGL or model loading.

## Composition

Opening view: compact identity/navigation, large condensed title and a concrete chime mystery, spatial archive with native previous/next/orbit controls and the selected record. No introductory marketing steps or long feature sections.

Investigation view: all eight original record selectors, a substantial paper reader, and an optional search console. The source reader is populated from the first render. AI initialization never hides the manual workflow. Results, errors, no-match, timeline and source handoffs inhabit this same designed desk.

```
Desktop: identity / navigation
         mystery + direct archive action | spatial record carousel
         eight-record index | selected paper original | optional search / results
         chronological source inspection

Mobile:  identity / archive action
         title / compact spatial carousel / previous-next
         horizontal record rail / paper original
         optional search and retrieved candidates / timeline
```

## Visual system

- Ink blue `#10151f`, deep housing `#1b2535`, paper `#e9e8dd`, soft white `#f1f3f5`, signal blue `#8daaff`, warm source marker `#e9aa7a`.
- Self-hosted licensed Barlow Condensed for display type; Manrope for functional interface/body; reliable Georgia for the source transcript. UI sizes are deliberate, source text remains comfortably readable, and no external font service is contacted.
- Open composition, a physical source sheet, a quiet rail, and a denser search console. Avoid a repeated generic card grid.
- Original SVG icons replace arrow glyphs and decorative Unicode controls.
- Labels describe actual selection, dates, source references, model state and source limitations. No fake telemetry or invented relationships.

## Motion and fallback

One premium, damped motion language: brief assembly entrance, selected carrier separation, bounded pointer camera response and reversible view rotation. Only an explicit action changes the selected record. A single demand-driven render loop settles and stops; no perpetual particle field or auto-rotation. Pixel ratio is capped; the scene is lazy-loaded and paused out of view. Resources and observers are released on unmount.

Reduced motion removes entrance travel, camera response, and animated carrier transitions. Native previous/next/orbit controls and the record rail preserve keyboard/touch use. A semantic HTML/CSS artifact view remains when WebGL is unsupported or the lightweight view is chosen. The actual source reader, manual browsing, consent and search do not depend on 3D.

## Acceptance, including rejection criteria

The first ten seconds must expose a real source artifact and a concrete mystery without an AI download. Selecting a record must alter both the spatial carrier and the real reader. The visual standard must survive entry into the workspace, initialization/error/no-match, search results, source handoff and mobile layout.

Inspect rendered desktop and mobile, normal and reduced motion, keyboard/focus, touch-sized controls, WebGL fallback, and the actual production build. A reject-capable independent review must compare those states against this brief before the candidate is called ready. Tests passing cannot substitute for that review. Reject clipped/overlapping content, decorative gates, illegible source text, inert controls, missing fonts, bland initial archive state, mobile overflow, uncontrolled motion, or materially compromised retrieval/consent.

The unchanged evidence contracts remain mandatory: eight fictional records, exact source text and references, optional MiniLM q8 (~45 MB), explicit consent, same-origin model assets, true similarity limitations, preserved M02/M03/M07 regression ordering, and no preview output presented as real inference. Event-rule and visual review precede any redesigned-main deployment; no DEV/Devpost edit belongs to this candidate.
