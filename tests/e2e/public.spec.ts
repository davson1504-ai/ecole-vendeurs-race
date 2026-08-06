import {test,expect} from '@playwright/test';

test('accueil, catalogue et paiement de démonstration',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.locator('img[alt*="performance commerciale"]')).toBeVisible();
  await page.goto('/formations');
  await expect(page.getByRole('heading',{name:/Formations publiées/i})).toBeVisible();
  await expect(page.locator('article img')).toHaveCount(3);
  await page.goto('/paiement');
  await expect(page.getByRole('heading',{name:/Choisissez le moyen/i})).toBeVisible();
  await expect(page.getByText('Mobile Money',{exact:true})).toBeVisible();
  await expect(page.getByText('Carte bancaire',{exact:true})).toBeVisible();
  await expect(page.getByText('Validation administrative',{exact:true})).toBeVisible();
  await expect(page.getByText(/paiement réussi/i)).toHaveCount(0);
});

test('inscription complète, scrollable et sans Apple',async({page})=>{
  await page.setViewportSize({width:375,height:667});
  await page.goto('/inscription');
  await expect(page.getByLabel('Nom complet')).toBeVisible();
  await expect(page.getByLabel('Confirmer le mot de passe')).toBeVisible();
  await expect(page.getByRole('button',{name:'Créer mon compte'})).toBeVisible();
  await expect(page.getByText(/Continuer avec (Apple|Google)/i)).toHaveCount(0);
});

test('programme public affiche les 5 modules et 10 leçons sans contenu privé',async({page})=>{
  await page.goto('/formations/les-fondamentaux-de-la-vente');
  await expect(page.getByRole('heading',{name:/Programme · 5 modules · 10 leçons/i})).toBeVisible();
  await expect(page.getByText('Contenu réel du smoke test.')).toHaveCount(0);
});

test('navigation publique, page à propos et formulaire contact',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('link',{name:'À propos de nous'}).first()).toBeVisible();
  await expect(page.getByRole('link',{name:'Contactez-nous'}).first()).toBeVisible();
  await page.goto('/a-propos');
  await expect(page.getByRole('heading',{name:/plateforme dédiée aux compétences commerciales/i})).toBeVisible();
  await page.goto('/contact');
  await expect(page.getByLabel('Nom complet')).toBeVisible();
  await expect(page.getByRole('button',{name:'Envoyer mon message'})).toBeEnabled();
});

for(const width of [375,430,768,1024,1366,1920]){
  test(`accueil sans débordement horizontal à ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client+1);
  });
}
