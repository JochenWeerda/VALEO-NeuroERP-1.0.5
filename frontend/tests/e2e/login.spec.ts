import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';

test.describe('Login', () => {
  test('erfolgreicher Login und Dashboard-Sichtbarkeit', async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
    const shell = page.getByTestId('app-shell');
    if (await shell.count()) {
      await expect(shell).toBeVisible();
    } else {
      await expect(page.getByTestId('dashboard-root')).toBeVisible();
    }
  });
});


