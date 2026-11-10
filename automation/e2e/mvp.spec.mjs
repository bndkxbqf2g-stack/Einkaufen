import { test, expect } from '@playwright/test';

test('durchgängiger MVP-Ablauf bleibt lokal bedienbar und speichert Änderungen', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.locator('#page-plan')).toHaveClass(/active/);
  await expect(page.locator('#dayList .day-card')).toHaveCount(5);

  await page.locator('#peopleSelect').selectOption('3');
  await expect(page.locator('#dayList .day-people-filter select').first()).toHaveValue('3');
  await page.locator('#daysSelect').selectOption('4');
  await expect(page.locator('#dayList .day-card')).toHaveCount(4);
  await page.locator('#eveningToggle').uncheck();

  await page.locator('button[data-page="suggestions"]').click();
  await expect(page.locator('#page-suggestions')).toHaveClass(/active/);
  await expect(page.locator('button[data-assign-recipe]').first()).toBeVisible();
  await page.locator('button[data-assign-recipe]').first().click();
  await expect(page.locator('#assignModal')).toHaveClass(/open/);
  await page.locator('#assignDaySelect').selectOption('1');
  await page.locator('#saveDayAssignment').click();
  await expect(page.locator('#assignModal')).not.toHaveClass(/open/);

  const manualPlan = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.manualPlan') || '{}'));
  expect(Object.keys(manualPlan)).not.toHaveLength(0);

  await page.locator('button[data-page="plan"]').click();
  await expect(page.locator('#page-plan')).toHaveClass(/active/);
  await expect(page.locator('[data-clear-day]')).toHaveCount(1);

  await page.locator('button[data-page="pantry"]').click();
  await expect(page.locator('#page-pantry')).toHaveClass(/active/);
  await page.locator('#addPantry').click();
  await page.locator('#pantryInput').fill('E2E-Reis');
  await page.locator('#pantryQuantity').fill('500');
  await page.locator('#pantryUnit').selectOption('g');
  await page.locator('#savePantryItem').click();
  await expect(page.locator('#pantryModal')).not.toHaveClass(/open/);
  await expect(page.locator('#pantryList')).toContainText('E2E-Reis');

  const pantry = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.pantry') || '[]'));
  expect(pantry).toContain('E2E-Reis');
  const pantryQuantities = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.pantryQuantities') || '{}'));
  expect(JSON.stringify(pantryQuantities)).toContain('E2E-Reis');

  await page.locator('button[data-page="shopping"]').click();
  await expect(page.locator('#page-shopping')).toHaveClass(/active/);
  await expect(page.locator('#shoppingList')).not.toBeEmpty();
  await page.locator('#openShoppingItem').click();
  await page.locator('#shoppingItemInput').fill('E2E-Zutat');
  await page.locator('#shoppingItemQuantity').fill('2');
  await page.locator('#saveShoppingItem').click();
  await expect(page.locator('#shoppingModal')).not.toHaveClass(/open/);
  await expect(page.locator('#shoppingList')).toContainText('E2E-Zutat');

  const manualItems = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.manualShoppingItems') || '[]'));
  expect(manualItems).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: 'E2E-Zutat', quantity: 2 })
  ]));

  await page.reload();
  await page.locator('button[data-page="shopping"]').click();
  await expect(page.locator('#shoppingList')).toContainText('E2E-Zutat');

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
