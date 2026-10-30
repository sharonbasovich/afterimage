import {test, expect, type Page} from '@playwright/test';
import {browserRecords} from '../../src/browserCorpus';
const modelResource = (url: string) => /\/(models|wasm)\//.test(new URL(url).pathname);
async function ready(page: Page) {
  await expect(page.locator('.engine-state')).toHaveText('8 records available', {timeout: 120_000});
  await expect(page.getByLabel('What are you trying to understand?')).toBeEnabled();
}
async function search(page: Page, query: string) {
  await page.getByLabel('What are you trying to understand?').fill(query);
  await page.getByLabel('What are you trying to understand?').press('Enter');
  await expect(page.locator('.submitted-query')).toContainText(`Results for: ${query}`);
}
test('production WASM: consent, real hard query, exact originals, timeline, no-match and reset', async ({page}, info) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  if (info.project.name === 'mobile-chromium') expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.getByRole('button', {name: 'Enter the archive'}).click();
  await expect(page.locator('#archive')).toBeFocused();
  await expect(page.getByLabel('What are you trying to understand?')).toBeDisabled();
  await page.getByText('Browse all 8 original records', {exact: true}).click();
  await expect(page.locator('.archive-index article')).toHaveCount(8);
  for (const record of browserRecords) await expect(page.locator('.archive-index')).toContainText(record.text);
  expect(requests.filter(modelResource)).toEqual([]);
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await ready(page);
  expect(requests.some(url => url.endsWith('model_quantized.onnx'))).toBe(true);
  expect(requests.some(url => url.endsWith('.wasm'))).toBe(true);
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
  const query = 'How was the recurring nighttime alarm fixed?';
  await search(page, query);
  const cards = page.locator('.evidence-card');
  await expect(cards).toHaveCount(3);
  await expect(page.getByRole('heading', {name: 'A trace, not a verdict.'})).toBeVisible();
  // Preserve the known hard-query weakness, not a false claim that the answer ranks first.
  await expect(cards.locator('.evidence-top > span')).toHaveText(['01 / M02', '02 / M03', '03 / M07']);
  await expect(page.locator('.model-footnote')).toContainText('browser WASM');
  await expect(page.locator('.retrieval-caution')).toContainText('do not confirm assumptions');
  for (const id of ['M02', 'M03', 'M07']) {
    const record = browserRecords.find(record => record.id === id)!;
    const card = cards.filter({hasText: `/ ${id}`});
    await expect(card.locator('blockquote')).toHaveText(`“${record.text}”`);
    await card.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.source-text p')).toHaveText(record.text);
    if ((page.viewportSize()?.width ?? 1280) <= 980) {
      const reader = page.getByRole('complementary', {name: `Selected original source ${id}`});
      await expect(reader).toBeFocused();
      await expect(reader.locator('.source-text p')).toBeInViewport();
      await page.getByRole('button', {name: 'Return to results', exact: true}).click();
      await expect(card).toBeFocused();
      await expect(card).toBeInViewport();
    }
  }
  await page.getByRole('button', {name: 'Reveal the timeline'}).click();
  await expect(page.locator('#timeline li .timeline-record-id')).toHaveText(['M02', 'M03', 'M07']);
  await info.attach('real-wasm-hard-query.json', {body: JSON.stringify({query, evidence: await cards.allTextContents(), requests, browser: info.project.name}, null, 2), contentType: 'application/json'});
  await search(page, 'How do I bake sourdough bread?');
  await expect(page.getByRole('heading', {name: 'No close semantic match.'})).toBeVisible();
  await expect(cards).toHaveCount(0);
  await page.getByRole('button', {name: 'Clear investigation'}).click();
  await expect(page.getByLabel('What are you trying to understand?')).toBeDisabled();
  await expect(page.locator('.submitted-query')).toHaveCount(0);
  await expect(page.locator('#timeline')).toHaveCount(0);
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await ready(page);
  await search(page, query);
  await expect(cards.locator('.evidence-top > span')).toHaveText(['01 / M02', '02 / M03', '03 / M07']);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('failed asset load is recoverable; cancellation cannot revive stale initialization', async ({page, context}) => {
  // Fault injection only blocks a real download. The successful retry must use unmodified real WASM.
  let failAssets = true;
  await context.route('**/models/**', route => failAssets ? route.abort('failed') : route.continue());
  await page.goto('./');
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await expect(page.getByText('The trace was interrupted.', {exact: true})).toBeVisible({timeout: 120_000});
  // Real runtime errors include long pinned asset URLs; they must wrap, not expand the mobile layout.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('.error-state').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.getByText('Browse all 8 original records', {exact: true}).click();
  await expect(page.locator('.archive-index article')).toHaveCount(8);
  failAssets = false;
  await page.getByRole('button', {name: 'Retry connection'}).click();
  await ready(page);
  await search(page, 'How was the recurring nighttime alarm fixed?');
  await expect(page.locator('.evidence-card')).toHaveCount(3);
  await page.getByRole('button', {name: 'Clear investigation'}).click();
  // Hold actual model requests until cancellation so ordering is deterministic, without fake inference.
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let observed!: () => void;
  const requestObserved = new Promise<void>(resolve => { observed = resolve; });
  await context.route('**/models/**', async route => { observed(); await held; await route.continue().catch(() => {}); });
  await page.evaluate(async () => { for (const key of await caches.keys()) await caches.delete(key); });
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await requestObserved;
  await page.getByRole('button', {name: 'Cancel', exact: true}).click();
  release();
  await expect(page.locator('.engine-state')).toHaveText('Not initialized');
  await expect(page.getByLabel('What are you trying to understand?')).toBeDisabled();
  await expect(page.locator('.evidence-card')).toHaveCount(0);
  await context.unroute('**/models/**');
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await ready(page);
});

test('timeline source handoff preserves keyboard orientation and clears stale return state', async ({page}, info) => {
  await page.goto('./');
  // Explicit development fixture isolates navigation; it is not evidence of AI quality.
  await page.getByText('Developer interface preview', {exact: true}).click();
  await page.getByRole('button', {name: 'Open labeled synthetic preview'}).click();
  await page.getByRole('button', {name: 'Open fixed examples'}).click();
  await page.getByRole('button', {name: 'Trace the evidence'}).click();
  await page.getByRole('button', {name: 'Reveal the timeline'}).click();
  const row = page.locator('#timeline li').filter({hasText: 'LOG-033'});
  const inspect = row.getByRole('button', {name: 'Inspect source'});
  // Cancel the handoff before its queued frame while the source node remains mounted.
  await page.evaluate(() => {
    (document.querySelector('#timeline li:last-child button') as HTMLButtonElement).click();
    const toggle = document.querySelector('[aria-controls="timeline"]') as HTMLButtonElement;
    toggle.focus(); toggle.click();
  });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page.getByRole('button', {name: 'Reveal the timeline'})).toBeFocused();
  await expect(page.getByRole('button', {name: 'Return to timeline'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Reveal the timeline'}).click();
  await inspect.focus(); await page.keyboard.press('Enter');
  const reader = page.getByRole('complementary', {name: 'Selected original source LOG-033'});
  await expect(reader).toBeFocused();
  await expect.poll(async () => reader.evaluate(el => { const top = el.getBoundingClientRect().top; return top >= 0 && top < 100; })).toBe(true);
  await expect(row).toHaveAttribute('aria-current', 'true');
  await expect(row.locator('.reading-marker')).toHaveText(' · Reading');
  await expect(reader.locator('.source-text p')).toContainText('Found an auxiliary timer');
  await page.screenshot({path: info.outputPath('source-focused.png')});
  await page.getByRole('button', {name: 'Return to timeline'}).click();
  await expect(inspect).toBeFocused();
  await expect(inspect).toBeInViewport();
  await page.screenshot({path: info.outputPath('timeline-return.png')});
  await expect(page.getByRole('button', {name: 'Return to timeline'})).toHaveCount(0);
  await inspect.click();
  await expect(reader).toBeFocused();
  await page.getByRole('button', {name: 'Clear investigation'}).click();
  await expect(page.getByRole('button', {name: 'Return to timeline'})).toHaveCount(0);
  await expect(page.locator('#timeline')).toHaveCount(0);
  await page.getByRole('button', {name: 'Trace the evidence'}).click();
  await expect(page.locator('.source-document')).toBeVisible();
  if (await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    expect(await page.locator('.source-document').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('malformed cached model config cannot trap connection retry', async ({page, context}, info) => {
  // A successful HTTP status with an invalid body differs from an aborted fetch:
  // Transformers may cache those bytes before discovering they cannot be parsed.
  let corrupt = true;
  const configRequests: string[] = [];
  await context.route('**/models/**/config.json', async route => {
    configRequests.push(route.request().url());
    if (corrupt) await route.fulfill({status: 200, contentType: 'application/json', body: '{"model_type":'});
    else await route.continue();
  });
  await page.goto('./');
  // Isolated test context only. A recovery must not erase other models or caches.
  await page.evaluate(async () => {
    const cache = await caches.open('transformers-cache');
    await cache.put(new URL('models/unrelated-model/config.json', location.href), new Response('keep this unrelated model'));
  });
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await expect(page.getByText('The trace was interrupted.', {exact: true})).toBeVisible({timeout: 120_000});
  await expect(page.getByRole('heading', {name: 'No close semantic match.'})).toHaveCount(0);
  await expect(page.getByLabel('What are you trying to understand?')).toBeDisabled();
  await page.getByText('Browse all 8 original records', {exact: true}).click();
  await expect(page.locator('.archive-index article')).toHaveCount(8);
  corrupt = false;
  await page.getByRole('button', {name: 'Retry connection'}).click();
  // Observe the real terminal state, so the broken baseline fails promptly.
  await page.waitForFunction(() => document.querySelector('.engine-state')?.textContent === '8 records available' || document.querySelector('.error-state'), {}, {timeout: 120_000});
  await info.attach('cached-config-retry.json', {body: JSON.stringify({configRequests, terminalState: await page.locator('.engine-state').textContent(), error: await page.locator('.error-state').allTextContents()}, null, 2), contentType: 'application/json'});
  await expect(page.locator('.engine-state')).toHaveText('8 records available', {timeout: 1_000});
  expect(configRequests.length).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(async () => (await (await caches.open('transformers-cache')).match(new URL('models/unrelated-model/config.json', location.href)))?.text())).toBe('keep this unrelated model');
  await search(page, 'How was the recurring nighttime alarm fixed?');
  await expect(page.locator('.evidence-top > span')).toHaveText(['01 / M02', '02 / M03', '03 / M07']);
  await search(page, 'How do I bake sourdough bread?');
  await expect(page.getByRole('heading', {name: 'No close semantic match.'})).toBeVisible();
  await expect(page.locator('.error-state')).toHaveCount(0);
});
