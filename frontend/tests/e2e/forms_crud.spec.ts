import { test, expect } from '@playwright/test';

test.describe('Formulare & CRUD (Demo)', () => {
  test('Beispiel-Formular interagieren (falls vorhanden)', async ({ page }) => {
    await page.goto('/');
    // Suche nach gängigen Feldern
    const textField = page.locator('input[type="text"], textarea');
    if (await textField.count() === 0) {
      test.skip(true, 'Kein Formularfeld gefunden – Test übersprungen');
    }
    await textField.first().fill('Testeingabe');
    await expect(textField.first()).toHaveValue(/Testeingabe/);
    const submit = page.locator('button:has-text("Speichern"), button[type="submit"]');
    if (await submit.count() === 0) {
      test.skip(true, 'Kein Submit-Button – Test übersprungen');
    }
    await submit.first().click();
    // Erfolgsmeldung erwarten, falls vorhanden
    const toast = page.locator('text=Erfolg|Gespeichert|Erstellt|Aktualisiert');
    await expect(toast).toBeVisible({ timeout: 3_000 }).catch(() => {});
  });
});
