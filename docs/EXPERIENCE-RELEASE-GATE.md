# Deployed experience release gate

Adopted for this review candidate on October 30, 2026. This is a blocking gate, not an implementation checklist or a numerical score.

Applies before submission, a ready/finished claim, or presenting a completed judge-facing bundle to the owner. It supplements event rules, functional tests, media QA and publication permission. An explicitly labeled unfinished critique preview can be shared but cannot count as a passed release. Preserve already-submitted versions and build-window restrictions.

## Review the experience, not the implementation report

A reviewer other than the implementer must open the exact deployed candidate when another worker is available. Inspect actual rendered pixels and personally exercise the primary interaction. Source inspection, CI success, unopened generated screenshots, and the implementer's summary are not substitutes. Record candidate URL and revision/build identity; resolve uncertain provenance before passing. A preview deployment is acceptable before release, followed by a smoke check on the final judge URL. An inaccessible deployment is unverified, not passed.

Recover the owner's intended creative direction and actual reference/example where one exists. Describe the concrete experience it implies, such as a dimensional interactive scene, distinct hierarchy and responsive exploration. Compare the rendered candidate against that reference. If a reference cannot be recovered, disclose the limit and use a clearly stated interim interpretation. Do not claim reference parity. An explicit dimensional/interactive brief cannot silently become a static illustration.

## Exercise the judge's journey

- **First ten seconds:** arrive cold and follow the main CTA. Can a newcomer identify the hook and immediately see or do something valuable? Does the visual promise survive, or collapse into setup prose, disabled controls and empty space? Expose honest manual/example value before model download where possible. Never disguise fixtures as live results.
- **Visual craft and depth:** inspect composition, hierarchy, typography and loaded fonts, imagery/icons, spacing, contrast and intentional detail across entry, working and result states. Look for generic scaffolding, missing assets, empty filler and a polished hero concealing an unfinished workspace. More sections alone are not an improvement.
- **Real interaction and motion:** perform the task, inspect its output and return/reset. Motion must explain state, direct attention or reward meaningful action. Inspect temporal behavior, not only stills. Verify dimensional effects visibly respond and serve the product. Do not obscure evidence or inputs with spectacle.
- **Phone and accessibility:** operate the task at a real narrow viewport, including touch-sized controls and reading documents/results. Exercise keyboard/focus and reduced motion. Essential content and actions must survive without camera motion, parallax or tilt.
- **Performance and resilience:** observe arrival, responsiveness, loading/error/empty states. Record timings or stalls when measured, with device/viewport and conditions. Do not invent low-end performance or FPS claims. Heavy media/3D must not delay the first useful action. Preserve consent and explicit expensive downloads.
- **Truthful complete bundle:** compare app, story, screenshots and hosted demo. Claims/capabilities must match; disclose fictional data and choreographed demonstrations. A superior film does not certify the app, nor vice versa. Watch motion to judge motion. Only claim subjective audio quality when audio was actually heard; technical audio metrics do not pass listening. Mark unavailable modalities explicitly; the owner is not routine QA.

## Decision with evidence

**PASS for this exact candidate:** explain why the observed journey meets the specific brief, cite inspected evidence and non-blocking limitations. No score or checklist total can manufacture a pass.

**REJECT / needs revision:** name the exact screen/action and visible problem, why it violates the brief/journey, and the repair/outcome. This blocks ready/completed-review delivery and new submission until a revised deployed candidate is re-reviewed.

**UNVERIFIED / blocked:** name the required observation that cannot be made and why. Continue available independent review. Never call an unchecked dimension passed. Escalate an actual permission/input blocker, not an ordinary design decision.

Any verified blocking failure makes the candidate REJECT even when other dimensions remain unverified. With no verified failure but a required observation missing, the full bundle is UNVERIFIED. A scoped pass must name its scope and cannot be reused as complete-bundle approval. Deadlines cannot waive required listening, motion or deployed-interaction evidence.

## Required short review record

URL, build identity, timestamp and reviewer; recovered brief/reference and comparison limits; inspected desktop/phone screenshots; observed interaction and temporal motion sequence; first-CTA finding; separate functional/creative decisions; failures, assigned repairs and exact-candidate recheck. Evidence must be real and durable. Do not fabricate recordings or screenshot paths.

Every handoff carries this gate, candidate identity, intended creative reference, primary journey and known gaps. The receiving reviewer must acknowledge the gate and return an evidence-backed decision before the coordinator marks ready. The coordinator owns fixes and re-review. No acknowledgement means instructions delivered, not verified adoption.

## This candidate's release plan

Scope is an **app redesign candidate**, not a revalidated film/submission bundle. Baseline source and evidence remain intact. The interim creative interpretation is the spatial relay desk in `SPATIAL-REDESIGN-20261030.md`; no complete owner-supplied design reference has been recovered, so reference parity is not claimed.

Journey: cold arrival → source-linked spatial carrier selection → populated manual desk → optional consent-based model → real query → exact original → timeline → reset/retry. Known baseline failures: static decorative hero, empty setup-first workspace, hidden records, unloaded declared fonts.

Implementation checks and the implementer's rendered critique come first. A separate reviewer then inspects the exact rendered candidate and can reject it. A locally served candidate review must identify itself as local-preview scope and cannot substitute for the required hosted-candidate/final-judge smoke check. No redesigned-main publication or DEV/Devpost change is authorized by a local pass. Event/build-window review still precedes publication/submission.
