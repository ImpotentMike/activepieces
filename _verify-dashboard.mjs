import { chromium } from '@playwright/test';

const OUT =
  '/private/tmp/claude-503/-Users-mikael-Frieza-Beta-PromptFlow-ActivePieces/faaec53e-ca95-481c-8680-826f684b0fb6/scratchpad';
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const log = (...a) => console.log('[verify]', ...a);

const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({
  viewport: { width: 1480, height: 1300 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

try {
  await page.goto('http://localhost:4200/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  log('landed', page.url());

  if (
    page.url().includes('sign-in') ||
    (await page.locator('input[type="password"]').count()) > 0
  ) {
    log('signing in');
    await page.getByPlaceholder('email@example.com').fill('dev@ap.com');
    await page.locator('input[type="password"]').fill('12345678');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForURL('**/projects/**', { timeout: 40000 });
    await page.waitForTimeout(1500);
  }

  const m = page.url().match(/projects\/([^/?#]+)/);
  const projectId = m ? m[1] : null;
  log('projectId', projectId);
  if (!projectId) throw new Error('no projectId — url=' + page.url());

  const url = `http://localhost:4200/projects/${projectId}/dashboard?demo=1`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page
    .waitForSelector('[data-slot="dashboard-summary-grid"]', { timeout: 30000 })
    .catch(() => log('summary-grid not found'));
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/dash-line.png`, fullPage: true });
  log('saved dash-line.png');

  const barTab = page.getByRole('tab', { name: /Bar chart/i });
  if ((await barTab.count()) > 0) {
    await barTab.first().click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/dash-bar.png`, fullPage: true });
    log('saved dash-bar.png');
  } else {
    log('Bar chart tab not found');
  }

  const chartCard = page.locator('[data-slot="dashboard-runs-over-time"]');
  if ((await chartCard.count()) > 0) {
    await chartCard.first().screenshot({ path: `${OUT}/dash-bar-chart.png` });
    log('saved dash-bar-chart.png');
  }
  const grid = page.locator('[data-slot="dashboard-summary-grid"]');
  if ((await grid.count()) > 0) {
    await grid.first().screenshot({ path: `${OUT}/dash-top-row.png` });
    log('saved dash-top-row.png');
  }
} catch (e) {
  log('ERROR', e.message);
  await page
    .screenshot({ path: `${OUT}/dash-error.png`, fullPage: true })
    .catch(() => {});
} finally {
  await browser.close();
  log('done');
}
