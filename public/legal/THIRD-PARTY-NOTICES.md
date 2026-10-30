# Third-party notices

The initial local prototype used React Bits SpotlightCard. That component and its stylesheet were removed because its additional license restrictions were not clearly compatible with the event's sublicensing requirements. No React Bits source is included in this package. The spatial review candidate's interface and fictional archive instrument are original project code.

## React runtime dependencies

The locked browser dependencies `react` 19.3.1, `react-dom` 19.3.1, and
`scheduler` 0.28.0 are MIT licensed, copyright Meta Platforms, Inc. and affiliates.
Their installed package `LICENSE` files are byte-identical. The complete,
unmodified license text is preserved in `licenses/REACT-MIT.txt` and
`public/legal/REACT-MIT.txt`; the static build distributes it as
`legal/REACT-MIT.txt` alongside this notice. Keep this notice and the full license
with redistributed source and browser builds, including minified bundles.
Exact package versions and npm tarball integrity values are in `package-lock.json`.

## Spatial review candidate

Three.js `0.187.0` is MIT licensed, copyright its authors. The original procedural
scene uses its renderer and the bundled RoundedBoxGeometry/RoomEnvironment addons.
The complete notice is retained in `licenses/THREE-MIT.txt` and distributed at
`legal/THREE-MIT.txt`. No third-party product model, HDR image, stock texture,
photograph, paid kit or asset is included. The instrument is fictional UI, not a
recovered machine or an explanation of AI reasoning.

Barlow Condensed and Manrope are self-hosted from the integrity-locked Fontsource
packages `@fontsource/barlow-condensed` and `@fontsource/manrope` `5.3.0`.
Their complete SIL Open Font License notices are retained in `licenses/BARLOW-OFL.txt`
and `licenses/MANROPE-OFL.txt`, and distributed at `legal/BARLOW-OFL.txt` and
`legal/MANROPE-OFL.txt`. Only the Latin weights used by the interface are bundled.
No Google Fonts or other remote font service is contacted. Source transcripts use
the user's installed Georgia/serif fallback; no proprietary system font is copied.

## Other dependencies and assets

Vite: MIT. TypeScript: Apache-2.0. ESLint ecosystem: see each dependency's included license. Exact resolved dependencies are pinned by `package-lock.json`.

The pre-redesign instrument illustration was original inline SVG + CSS; the review candidate uses the original procedural 3D instrument described above. No stock photos, paid assets, remote fonts, or analytics. Browser AI loads model/runtime resources only after explicit consent. The review candidate loads its self-hosted fonts explicitly; pre-redesign DM Sans/IBM Plex Mono declarations had relied on local installation. Pinned q8 model weights (approximately 23 MB), tokenizer/configuration files, and WASM runtime assets are bundled as self-hosted static resources under public/models/ and public/wasm/ (models/ and wasm/ in dist). These assets are included in the source preservation and static delivery archives; the Git repository instead provides `npm run setup:browser-assets` to restore the identical SHA256-pinned assets from the official pinned model revision and integrity-locked runtime npm package. In all cases, model/runtime assets are fetched by the browser only after explicit consent; they are not embedded in the initial UI JavaScript. Xenova/all-MiniLM-L6-v2 is Apache-2.0 licensed; its pinned revision and runtime configuration are recorded in README.md. Transformers.js 3.8.1 is Apache-2.0 licensed (copy in api/licenses/TRANSFORMERS-APACHE-2.0.txt); ONNX Runtime is MIT licensed (see package license). Pinned runtime and model resources are served same-origin, after consent; the browser worker disables remote model fallback.
