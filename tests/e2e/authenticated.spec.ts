import {expect, test} from '@playwright/test';

const adminEmail=process.env.E2E_ADMIN_EMAIL;
const adminPassword=process.env.E2E_ADMIN_PASSWORD;
const learnerEmail=process.env.E2E_LEARNER_EMAIL;
const learnerPassword=process.env.E2E_LEARNER_PASSWORD;

test('workflow administrateur puis apprenant',async({browser})=>{
  test.skip(!adminEmail||!adminPassword||!learnerEmail||!learnerPassword,'Identifiants E2E absents');
  const slug='smoke-e2e-validation';

  const admin=await browser.newPage();
  await admin.goto('/connexion');
  await admin.getByPlaceholder('Email').fill(adminEmail!);
  await admin.getByPlaceholder('Mot de passe').fill(adminPassword!);
  await admin.getByRole('button',{name:'Se connecter'}).click();
  await expect(admin).toHaveURL(/\/admin$/);
  await expect(admin.getByRole('heading',{name:'Tableau de bord'})).toBeVisible();

  await admin.goto('/admin/formations/nouvelle');
  await admin.getByLabel('Titre').fill('Formation Smoke E2E');
  await admin.getByLabel('Slug').fill(slug);
  await admin.getByLabel(/Résumé/).fill('Formation créée pour valider le workflow administrateur.');
  await admin.getByLabel('Description').fill('Contenu temporaire du test de bout en bout.');
  await admin.getByLabel('Prix FCFA').fill('0');
  await admin.getByLabel(/Durée/).fill('20');
  await admin.getByLabel('Statut').selectOption('published');
  await admin.getByRole('button',{name:'Enregistrer la formation'}).click();
  await expect(admin).toHaveURL(/\/admin\/formations\/[0-9a-f-]+\/modifier\?success=1$/);
  const courseId=admin.url().match(/formations\/([0-9a-f-]+)\/modifier/)?.[1];
  expect(courseId).toBeTruthy();

  await admin.goto(`/admin/formations/${courseId}/modules`);
  const newModule=admin.locator('form').filter({has:admin.getByRole('button',{name:'Ajouter le module'})});
  await newModule.getByLabel('Titre').fill('Module Smoke');
  await newModule.getByLabel('Description').fill('Module temporaire de validation');
  await newModule.getByRole('button',{name:'Ajouter le module'}).click();
  await expect(admin.getByText('Module Smoke')).toBeVisible();

  await admin.getByText('Ajouter une leçon').click();
  const lessonForm=admin.locator('form').filter({has:admin.getByRole('button',{name:'Enregistrer la leçon'})});
  await lessonForm.getByLabel('Titre').fill('Leçon Smoke');
  await lessonForm.getByLabel('Slug').fill('lecon-smoke');
  await lessonForm.getByLabel('Objectif').fill('Valider la gestion des leçons');
  await lessonForm.getByLabel('Contenu').fill('Contenu pédagogique temporaire.');
  await lessonForm.getByLabel('Aperçu public').check();
  await lessonForm.getByRole('button',{name:'Enregistrer la leçon'}).click();
  await expect(admin.getByText(/Leçon Smoke/)).toBeVisible();

  await admin.goto('/admin/inscriptions');
  await admin.getByRole('combobox',{name:''}).first().selectOption({label:'Apprenant Démo'});
  await admin.getByRole('combobox',{name:''}).nth(1).selectOption({label:'Formation Smoke E2E'});
  await admin.getByRole('button',{name:'Inscrire'}).click();
  await expect(admin.getByRole('cell',{name:'Apprenant Démo'})).toBeVisible();
  await admin.close();

  const learner=await browser.newPage();
  await learner.goto('/connexion');
  await learner.getByPlaceholder('Email').fill(learnerEmail!);
  await learner.getByPlaceholder('Mot de passe').fill(learnerPassword!);
  await learner.getByRole('button',{name:'Se connecter'}).click();
  await expect(learner).toHaveURL(/\/dashboard$/);
  await expect(learner.getByRole('heading',{name:/Bonjour, Apprenant Démo/})).toBeVisible();
  await expect(learner.getByRole('heading',{name:'Formation Smoke E2E'})).toBeVisible();
  await learner.getByRole('link',{name:'Continuer'}).click();
  await expect(learner.getByRole('heading',{name:'Leçon Smoke'})).toBeVisible();
  await learner.getByRole('button',{name:'Marquer comme terminée'}).click();
  await expect(learner.getByRole('button',{name:'Marquer à reprendre'})).toBeVisible();
  await learner.close();
});
