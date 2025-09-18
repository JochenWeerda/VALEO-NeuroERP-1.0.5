import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';

test.describe('KI-gestützte Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('AI Dashboard sichtbar', async ({ page }) => {
    await gotoMenu(page, /ai|ki/i);
    await expect(page.getByText(/ai dashboard|ai analytics/i)).toBeVisible();
  });
});


