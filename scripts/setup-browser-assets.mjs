// Reconstruct self-hosted assets without credentials; reject any bytes not in the reviewed manifest.
import {readFile, mkdir, writeFile, rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'docs/PINNED-ASSET-SHA256.json'), 'utf8'));
const revision = '751bff37182d3f1213fa05d7196b954e230abad9';
const prefix = `public/models/${revision}/Xenova/all-MiniLM-L6-v2/`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [path, expected] of Object.entries(manifest)) {
  const target = resolve(root, path);
  try {
    const existing = await readFile(target);
    if (hash(existing) !== expected) throw new Error(`Existing asset hash mismatch: ${path}`);
    console.log(`Verified ${path}`);
    continue;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let bytes;
  if (path.startsWith(prefix)) {
    const url = `https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/${revision}/${path.slice(prefix.length)}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(180_000)});
    if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
    bytes = Buffer.from(await response.arrayBuffer());
  } else if (/^public\/wasm\/ort-wasm-simd-threaded(?:\.jsep)?\.(?:mjs|wasm)$/.test(path)) {
    // npm ci verifies the locked package tarball integrity; this verifies the exact runtime bytes too.
    bytes = await readFile(resolve(root, 'node_modules/onnxruntime-web/dist', path.split('/').at(-1)));
  } else { throw new Error(`Unexpected asset manifest path: ${path}`); }
  if (hash(bytes) !== expected) throw new Error(`Downloaded asset hash mismatch: ${path}`);
  await mkdir(dirname(target), {recursive: true});
  await writeFile(`${target}.tmp`, bytes);
  await rename(`${target}.tmp`, target);
  console.log(`Restored and verified ${path}`);
}
