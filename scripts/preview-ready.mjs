/** Wait for real data/DOM readiness, fonts and finite entrance animations. */
export async function waitForPreview(send, selector) {
  const result = await send('Runtime.evaluate', {
    expression: `(${settlePreview.toString()})(${JSON.stringify(selector)})`,
    awaitPromise: true, returnByValue: true,
  });
  if (result.exceptionDetails || result.result?.value !== true) throw new Error('Preview did not settle: ' + selector);
}

async function settlePreview(selector) {
  await document.fonts.ready;
  const deadline = performance.now() + 10000;
  let previous = '', stable = 0;
  while (performance.now() < deadline) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    const ready = document.querySelector(selector);
    const elements = [...document.querySelectorAll('[data-ui-transition]')].filter(el => el.getBoundingClientRect().width > 0);
    const opaque = elements.every(el => Number(getComputedStyle(el).opacity) === 1);
    const animated = document.getAnimations().some(animation => {
      const timing = animation.effect?.getComputedTiming();
      return timing?.iterations !== Infinity && animation.playState === 'running';
    });
    const rects = [ready, ...elements].filter(Boolean).map(el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(value => Math.round(value * 10)).join(','); }).join(';');
    stable = ready && opaque && !animated && rects === previous ? stable + 1 : 0;
    previous = rects;
    if (stable >= 4) return true;
  }
  throw new Error('Data, opacity or layout did not stabilize for ' + selector);
}
