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
  await page.goto('/');
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
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
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
  }
  await page.getByRole('button', {name: 'Reveal the timeline'}).click();
  await expect(page.locator('#timeline li .eyebrow')).toHaveText(['M02', 'M03', 'M07']);
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
  await page.goto('/');
  await page.getByRole('button', {name: 'Enable browser AI'}).click();
  await expect(page.getByText('The trace was interrupted.', {exact: true})).toBeVisible({timeout: 120_000});
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
