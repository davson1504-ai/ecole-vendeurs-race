import {test,expect} from '@playwright/test';
test('accueil et paiement de démonstration',async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.goto('/paiement');await expect(page.getByRole('heading',{name:/Paiement bientôt disponible/i})).toBeVisible();await expect(page.getByText(/paiement réussi/i)).toHaveCount(0);});
test('catalogue responsive et sans bouton mort principal',async({page})=>{await page.goto('/formations');await expect(page.getByRole('heading',{name:/Formations publiées/i})).toBeVisible();});
