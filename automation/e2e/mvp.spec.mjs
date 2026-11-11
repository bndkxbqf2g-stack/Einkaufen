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
  await expect(page.locator('#dayList .day-card')).toHaveCount(10);

  await page.locator('#peopleSelect').selectOption('3');
  await expect(page.locator('#dayList .day-people-filter select').first()).toHaveValue('3');
  await page.locator('#daysSelect').selectOption('4');
  await expect(page.locator('#dayList .day-card')).toHaveCount(8);
  await page.locator('#eveningToggle').uncheck({ force: true });
  await expect(page.locator('#dayList .day-card')).toHaveCount(4);
  await page.locator('#dayList .day-people-filter select').first().selectOption('4');
  await expect(page.locator('#dayList .day-people-filter select').first()).toHaveValue('4');
  const savedPlanningSettings = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.settings') || '{}'));
  expect(savedPlanningSettings.dayPeople).toEqual(expect.objectContaining({ '0': 4 }));
  await page.reload();
  await expect(page.locator('#dayList .day-card')).toHaveCount(4);
  await expect(page.locator('#dayList .day-people-filter select').first()).toHaveValue('4');

  await page.locator('button[data-page="suggestions"]').click();
  await expect(page.locator('#page-suggestions')).toHaveClass(/active/);
  // Fehlende/alte Angebote dürfen den Kernablauf nicht blockieren.
  await page.locator('#suggestionOfferMin2').uncheck({ force: true });
  await expect(page.locator('button[data-assign-recipe]').first()).toBeVisible();
  await page.locator('button[data-assign-recipe="linsencurry-paprika"]').click();
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
  await page.locator('#pantryInput').fill('Reis');
  await page.locator('#pantryQuantity').fill('500');
  await page.locator('#pantryUnit').selectOption('g');
  await page.locator('#savePantryItem').click();
  await page.locator('#cancelPantryModal').click();
  await expect(page.locator('#pantryModal')).not.toHaveClass(/open/);
  await expect(page.locator('#pantryList')).toContainText('Reis');

  const pantry = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.pantry') || '[]'));
  expect(pantry).toContain('Reis');
  const pantryQuantities = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.pantryQuantities') || '{}'));
  expect(JSON.stringify(pantryQuantities)).toContain('Reis');

  await page.locator('button[data-page="shopping"]').click();
  await expect(page.locator('#page-shopping')).toHaveClass(/active/);
  await expect(page.locator('#shoppingList')).not.toBeEmpty();
  await expect(page.locator('#shoppingPantryDetail')).toContainText('Reis');
  await expect(page.locator('.shopping-item-name').filter({ hasText: /^Reis$/ })).toHaveCount(0);
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


test('explizite Rezeptmenge und Teildeckung durch Vorrat bleiben im Einkauf sichtbar', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.locator('#page-plan')).toHaveClass(/active/);
  await page.locator('#daysSelect').selectOption('4');
  await page.locator('#eveningToggle').uncheck({ force: true });

  await page.locator('button[data-page="favorites"]').click();
  await expect(page.locator('#page-favorites')).toHaveClass(/active/);
  await page.locator('#openFavorite').click();
  await page.locator('#recipeName').fill('E2E-Mengen-Rezept');
  await page.locator('#recipeIngredients').fill('500 g E2E-Hack\n1 Stück E2E-Zwiebel');
  await page.locator('#recipeMealPurpose').selectOption('Hauptgericht');
  await page.locator('#importRecipe').click();
  await expect(page.locator('#favoriteCatalog')).toContainText('E2E-Mengen-Rezept');

  await page.locator('button[data-page="suggestions"]').click();
  await expect(page.locator('#page-suggestions')).toHaveClass(/active/);
  await page.locator('#suggestionOfferMin2').uncheck({ force: true });
  const importedSuggestion = page.locator('article.suggestion-card').filter({ hasText: 'E2E-Mengen-Rezept' });
  await expect(importedSuggestion).toBeVisible();
  await importedSuggestion.locator('button[data-assign-recipe]').click();
  await expect(page.locator('#assignModal')).toHaveClass(/open/);
  await page.locator('#assignDaySelect').selectOption('0');
  await page.locator('#saveDayAssignment').click();
  await expect(page.locator('#assignModal')).not.toHaveClass(/open/);

  await page.locator('button[data-page="pantry"]').click();
  await expect(page.locator('#page-pantry')).toHaveClass(/active/);
  await page.locator('#addPantry').click();
  await page.locator('#pantryInput').fill('E2E-Hack');
  await page.locator('#pantryQuantity').fill('250');
  await page.locator('#pantryUnit').selectOption('g');
  await page.locator('#savePantryItem').click();
  await page.locator('#cancelPantryModal').click();
  await expect(page.locator('#pantryModal')).not.toHaveClass(/open/);
  await expect(page.locator('#pantryList')).toContainText('E2E-Hack');

  await page.locator('button[data-page="shopping"]').click();
  await expect(page.locator('#page-shopping')).toHaveClass(/active/);
  const partialItem = page.locator('.shopping-item').filter({ hasText: 'E2E-Hack' });
  await expect(partialItem).toHaveCount(1);
  await expect(partialItem.locator('.shopping-item-meta')).toContainText('Vorrat deckt 250 g · Restbedarf 250 g');

  const storedQuantities = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.pantryQuantities') || '{}'));
  expect(JSON.stringify(storedQuantities)).toContain('E2E-Hack');
  const storedPlan = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.manualPlan') || '{}'));
  expect(Object.keys(storedPlan)).not.toHaveLength(0);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});


test('optionales Abendessen ist separat wählbar und beeinflusst die Einkaufsliste nur bei Aktivierung', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.locator('#page-plan')).toHaveClass(/active/);
  await page.locator('#daysSelect').selectOption('4');
  await page.locator('#eveningToggle').check({ force: true });

  await page.locator('button[data-page="favorites"]').click();
  await expect(page.locator('#page-favorites')).toHaveClass(/active/);
  await page.locator('#openFavorite').click();
  await page.locator('#recipeName').fill('E2E-Abendessen');
  await page.locator('#recipeIngredients').fill('1 Stück E2E-Brot\n200 g E2E-Käse');
  await page.locator('#recipeMealPurpose').selectOption('Brotzeit');
  await page.locator('#importRecipe').click();
  await expect(page.locator('#favoriteCatalog')).toContainText('E2E-Abendessen');

  await page.locator('button[data-page="plan"]').click();
  await expect(page.locator('#page-plan')).toHaveClass(/active/);
  await expect(page.locator('[data-choose-dinner="0"]')).toBeVisible();
  await page.locator('[data-choose-dinner="0"]').click();
  await expect(page.locator('#assignModal')).toHaveClass(/open/);

  const dinnerOption = page.locator('#assignRecipeSelect option').filter({ hasText: 'E2E-Abendessen' });
  await expect(dinnerOption).toHaveCount(1);
  const dinnerRecipeId = await dinnerOption.getAttribute('value');
  await page.locator('#assignRecipeSelect').selectOption(dinnerRecipeId);
  await page.locator('#assignDaySelect').selectOption('0');
  await page.locator('#saveDayAssignment').click();
  await expect(page.locator('#assignModal')).not.toHaveClass(/open/);
  await expect(page.locator('.day-card').filter({ has: page.locator('[data-dinner-index="0"]') })).toContainText('E2E-Abendessen');

  const savedDinnerPlan = await page.evaluate(() => JSON.parse(localStorage.getItem('angebotskueche.manualDinnerPlan') || '{}'));
  expect(Object.keys(savedDinnerPlan)).not.toHaveLength(0);

  await page.locator('#eveningToggle').uncheck({ force: true });
  await expect(page.locator('[data-dinner-index]')).toHaveCount(0);
  await page.locator('button[data-page="shopping"]').click();
  await expect(page.locator('#page-shopping')).toHaveClass(/active/);
  await expect(page.locator('.shopping-item-name').filter({ hasText: /^E2E-Käse$/ })).toHaveCount(0);

  await page.locator('button[data-page="plan"]').click();
  const eveningToggle = page.locator('#eveningToggle');
  if (!(await eveningToggle.isChecked())) await eveningToggle.check({ force: true });
  await expect(eveningToggle).toBeChecked();
  await expect(page.locator('.day-card').filter({ has: page.locator('[data-dinner-index="0"]') })).toContainText('E2E-Abendessen');
  await page.locator('button[data-page="shopping"]').click();
  await expect(page.locator('.shopping-item-name').filter({ hasText: /^E2E-Käse$/ })).toHaveCount(1);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
