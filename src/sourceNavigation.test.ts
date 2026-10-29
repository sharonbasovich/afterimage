import {test} from 'node:test';
import assert from 'node:assert/strict';
import {focusAndReveal} from './sourceNavigation.ts';
for (const reduced of [false, true]) {
  test(`source navigation moves focus and viewport together; reduced motion ${reduced}`, () => {
    const calls: unknown[] = [];
    const target = {isConnected: true, focus: (options: unknown) => calls.push(['focus', options]), scrollIntoView: (options: unknown) => calls.push(['scroll', options])};
    assert.equal(focusAndReveal(target, reduced), true);
    assert.deepEqual(calls, [['focus', {preventScroll: true}], ['scroll', {block: 'center', behavior: reduced ? 'instant' : 'smooth'}]]);
  });
}
test('stale source or return target cannot steal focus after reset/unmount', () => {
  assert.equal(focusAndReveal(null, false), false);
  const stale = {isConnected: false, focus: () => assert.fail('stale focus'), scrollIntoView: () => assert.fail('stale scroll')};
  assert.equal(focusAndReveal(stale, false), false);
});
test('a tall source can align its heading at the viewport start', () => {
  let position: ScrollIntoViewOptions | undefined;
  focusAndReveal({isConnected: true, focus: () => {}, scrollIntoView: (options) => {position = options as ScrollIntoViewOptions;}}, true, 'start');
  assert.deepEqual(position, {block: 'start', behavior: 'instant'});
});
