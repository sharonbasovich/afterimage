import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createAPI } from '../api/api.mjs'
import { createServer } from '../api/server.mjs'
import { createHttpEngine } from '../src/httpEngine.ts'

test('real frontend adapter talks to the loopback API and pinned offline model', async () => {
  const api = createAPI()
  const server = createServer(api)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  const engine = createHttpEngine(base)
  try {
    await api.initialize()
    const controller = new AbortController()
    const progress = []
    await engine.initialize({ signal: controller.signal, onProgress: (p) => progress.push(p) })
    assert.equal(engine.records.length, 8)
    const result = await engine.search('Why are the lights blinking?', { signal: controller.signal })
    assert.equal(result.evidence[0].recordId, 'M04')
    const source = engine.records.find((r) => r.id === 'M04')
    assert.equal(result.evidence[0].quote, source.text)
    assert.ok(Number.isFinite(result.evidence[0].score))
    const miss = await engine.search('How do I bake a chocolate birthday cake?', { signal: controller.signal })
    assert.equal(miss.outcome, 'no-match')
    assert.deepEqual(miss.evidence, [])
    const uncertain = await engine.search('How was the recurring nighttime alarm fixed?', { signal: controller.signal })
    assert.equal(uncertain.outcome, 'ambiguous')
    assert.ok(uncertain.evidence.some((entry) => entry.recordId === 'M07'))
    assert.notEqual(uncertain.evidence[0].recordId, 'M07') // Preserve known ranking limitation.
    controller.abort()
    await assert.rejects(engine.search('late request', { signal: controller.signal }))
    assert.ok(progress.length > 0)
  } finally {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
    await api.dispose()
  }
})
