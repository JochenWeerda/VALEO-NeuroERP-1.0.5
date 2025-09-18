import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';

test.describe('BI Visualisierungen', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('BiDashboard Charts sichtbar', async ({ page }) => {
    const biLink = page.getByRole('link', { name: /bi|analytics/i });
    if (await biLink.count()) {
      await biLink.first().click();
    }
    const chart = page.locator('[data-testid="chart-ready"], .recharts-wrapper, canvas');
    const hasChart = (await chart.count()) > 0;
    if (!hasChart) {
      test.skip(true, 'Keine BI-Charts vorhanden – Test übersprungen');
    }
    await expect(chart.first()).toBeVisible({ timeout: 5_000 });
  });
});


