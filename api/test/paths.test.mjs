import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

test('default cache path decodes filesystem spaces rather than preserving URL escapes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'afterimage path '))
  const previous = process.env.AFTERIMAGE_MODEL_CACHE
  delete process.env.AFTERIMAGE_MODEL_CACHE
  try {
    await writeFile(join(dir, 'model.mjs'), await readFile(new URL('../model.mjs', import.meta.url)))
    const module = await import(pathToFileURL(join(dir, 'model.mjs')).href)
    assert.equal(module.cachePath(), join(dir, 'model-cache'))
  } finally {
    if (previous === undefined) delete process.env.AFTERIMAGE_MODEL_CACHE
    else process.env.AFTERIMAGE_MODEL_CACHE = previous
    await rm(dir, { recursive: true, force: true })
  }
})
