import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Exercise the same initial HTML and bootstrap in source and production builds.
function appModule(entry: 'main' | 'review'): string {
  if (!process.env.BUILT_PREVIEW) return `/src/${entry}.ts`;
  const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
  const page = manifest[entry === 'main' ? 'index.html' : 'review.html'];
  return '/' + manifest[page.dynamicImports[0]].file;
}

test('startup guard: a cold-load click waits for actual handlers', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**' + appModule('main'), async route => { await held; await route.continue(); });
  await page.goto('/');
  await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state', 'LOADING');
  await expect(page.locator('section[aria-labelledby=workspace-title]')).toHaveAttribute('inert', '');
  await expect(page.locator('#app-startup a')).toBeVisible();
  let clicked = false;
  // Use an above-the-fold control. A lower button moves as the held reviewer
  // module mounts and competes with smooth auto-scroll during a pending click.
  const click = page.locator('#role-holder').click().then(() => { clicked = true; });
  try {
    await page.waitForTimeout(250);
    expect(clicked).toBe(false);
    await expect(page.locator('#role-holder')).toHaveAttribute('aria-pressed', 'false');
  } finally { release(); }
  await click;
  await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state', 'READY');
  await expect(page.locator('#role-holder')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#role-instruction')).toContainText('비밀값');
  await expect(page.locator('[data-startup-guard][inert]')).toHaveCount(0);
  // Readiness must not enable a transaction that main correctly disabled.
  await expect(page.locator('#deploy-button')).toBeDisabled();
});

for (const entry of ['main', 'review'] as const) {
  test(`startup guard: ${entry} failed import retains guard and usable historical link`, async ({ page }) => {
    await page.route('**' + appModule(entry), route => route.abort('failed'));
    await page.goto(entry === 'main' ? '/' : '/review.html');
    await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state', 'FAILED');
    await expect(page.locator('#app-startup-status')).toContainText('live 성공이 아닙니다');
    expect(await page.locator('[data-startup-guard]').evaluateAll(nodes => nodes.every(n => n.hasAttribute('inert')))).toBe(true);
    await page.locator('#app-startup a').focus();
    await expect(page.locator('#app-startup a')).toBeFocused();
    await expect(page.locator('#reviewer-read')).toHaveCount(0);
    if (entry === 'main') {
      // Its independent import graph can still work when the holder SDK fails.
      await page.locator('#role-reviewer').click();
      await expect(page).toHaveURL(/\/review\.html$/);
      await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state', 'READY');
      await expect(page.locator('#reviewer-read')).toBeEnabled();
    }
  });
}

test('production reviewer: only audited chunks, no holder or wallet controls', async ({ page }) => {
  test.skip(!process.env.BUILT_PREVIEW, 'Requires the actual production build');
  const audit = JSON.parse(readFileSync('dist/reviewer-bundle-audit.json', 'utf8'));
  expect(audit.checked).toBe(true); expect(audit.forbiddenModules).toEqual([]);
  const scripts: string[] = [];
  page.on('request', r => { if (new URL(r.url()).pathname.endsWith('.js')) scripts.push(new URL(r.url()).pathname.slice(1)); });
  await page.goto('/review.html');
  await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state', 'READY');
  await expect(page.locator('#reviewer-read')).toBeEnabled();
  await expect(page.locator('input,textarea,select,#connect-button,#scenario-run')).toHaveCount(0);
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.every(path => audit.chunks.includes(path))).toBe(true);
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state', 'IDLE');
});
