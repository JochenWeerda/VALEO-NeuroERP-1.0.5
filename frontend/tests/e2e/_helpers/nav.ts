import { Page } from '@playwright/test';

export async function gotoMenu(page: Page, labelRegex: RegExp): Promise<boolean> {
  // Versuche ggf. das Menü zu öffnen (Sidebar-Toggle oder Menü-Button)
  const togglers = [
    page.getByTestId('sidebar-toggle'),
    page.getByRole('button', { name: /menü|menu|navigation|nav/i })
  ];
  for (const t of togglers) {
    if (await t.count()) {
      await t.first().click().catch(() => {});
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      break;
    }
  }

  // Versuche Link oder Button nach sichtbarem Text
  const link = page.getByRole('link', { name: labelRegex });
  if (await link.count()) {
    await link.first().click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    return true;
  }
  const button = page.getByRole('button', { name: labelRegex });
  if (await button.count()) {
    await button.first().click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    return true;
  }
  // Fallback: direkter Textknoten klickbar
  const textNode = page.getByText(labelRegex, { exact: false });
  if (await textNode.count()) {
    await textNode.first().click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    return true;
  }
  // Fallback: Überschrift auf Seite direkt anwählen (ohne Klicknavigation)
  const heading = page.getByRole('heading', { name: labelRegex });
  if (await heading.count()) {
    return true;
  }
  return false;
}


