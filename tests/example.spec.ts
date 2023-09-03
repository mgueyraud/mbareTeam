import { test, expect } from '@playwright/test';



test('has mario button', async ({ page }) => {
  await page.goto('http://localhost:3000/mario');

  // Expect a title "to contain" a substring.
  await expect(await page.getByRole('button').textContent()).toBe("Mario");
});