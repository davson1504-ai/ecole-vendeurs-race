import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServerClient} from '@supabase/ssr';

const required=['PLAYWRIGHT_BASE_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','E2E_ADMIN_EMAIL','E2E_ADMIN_PASSWORD','E2E_LEARNER_EMAIL','E2E_LEARNER_PASSWORD'];
for(const name of required) assert.ok(process.env[name],`${name} absent`);

const base=process.env.PLAYWRIGHT_BASE_URL.replace(/\/$/,'');
const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function authClient(){
  const jar=new Map();
  const client=createServerClient(supabaseUrl,supabaseKey,{
    cookies:{
      getAll:()=>[...jar].map(([name,value])=>({name,value})),
      setAll:values=>values.forEach(({name,value})=>jar.set(name,value)),
    },
  });
  return {client,cookieHeader:()=>[...jar].map(([name,value])=>`${name}=${value}`).join('; ')};
}

function previewRequest(path,cookie=''){
  if(process.env.PUBLIC_DIRECT==='true'){
    const args=['--silent','--show-error','--write-out','\n%{http_code}',`${base}${path}`];
    if(cookie) args.push('--header',`Cookie: ${cookie}`);
    const direct=spawnSync('curl.exe',args,{encoding:'utf8',cwd:process.cwd(),windowsHide:true});
    assert.equal(direct.status,0,`${path}: curl public a échoué: ${direct.error?.message??direct.stderr}`);
    const split=direct.stdout.lastIndexOf('\n');
    return {body:direct.stdout.slice(0,split),status:Number(direct.stdout.slice(split+1).trim())};
  }
  const curlArgs=['curl',path,'--deployment',base,'--','--silent','--show-error','--fail-with-body'];
  if(cookie) curlArgs.push('--header',`Cookie: ${cookie}`);
  const executable=process.platform==='win32'?process.execPath:'vercel';
  const args=process.platform==='win32'
    ? ['C:\\Users\\LENOVO\\AppData\\Roaming\\npm\\node_modules\\vercel\\dist\\vc.js',...curlArgs]
    : curlArgs;
  const result=spawnSync(executable,args,{encoding:'utf8',cwd:process.cwd(),windowsHide:true});
  assert.equal(result.status,0,`${path}: vercel curl a échoué: ${result.error?.message??result.stderr}`);
  return {body:result.stdout,status:200};
}

function expectPage(path,needle,cookie=''){
  const {body:html,status}=previewRequest(path,cookie);
  assert.equal(status,200,`${path}: HTTP ${status}`);
  assert.match(html,needle,`${path}: contenu attendu absent`);
}

await expectPage('/',/École des Vendeurs|Ecole des Vendeurs/i);
await expectPage('/formations',/Formations publiées/i);
await expectPage('/paiement',/Mobile Money|Validation administrative/i);
const health=previewRequest('/api/health/supabase');
assert.equal(health.status,200,'health Supabase indisponible');
assert.equal(JSON.parse(health.body).ok,true,'health Supabase négatif');

const admin=authClient();
const {data:adminAuth,error:adminAuthError}=await admin.client.auth.signInWithPassword({email:process.env.E2E_ADMIN_EMAIL,password:process.env.E2E_ADMIN_PASSWORD});
assert.ifError(adminAuthError);
assert.ok(adminAuth.user,'connexion admin échouée');
await expectPage('/admin',/Tableau de bord/i,admin.cookieHeader());

if(process.env.SMOKE_VERIFY_ONLY==='true'){
  const learner=authClient();
  const {data:learnerAuth,error:learnerAuthError}=await learner.client.auth.signInWithPassword({email:process.env.E2E_LEARNER_EMAIL,password:process.env.E2E_LEARNER_PASSWORD});
  assert.ifError(learnerAuthError);
  assert.ok(learnerAuth.user,'connexion apprenant échouée');
  const {data:enrollment,error:enrollmentError}=await learner.client.from('enrollments').select('course:courses(slug,title,modules(lessons(id)))').eq('active',true).limit(1).single();
  assert.ifError(enrollmentError);
  const course=Array.isArray(enrollment.course)?enrollment.course[0]:enrollment.course;
  assert.ok(course?.slug,'formation apprenant absente');
  await expectPage('/dashboard',new RegExp(course.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),learner.cookieHeader());
  await expectPage(`/cours/${course.slug}`,/Objectif|Aperçu public|Leçon réservée/i,learner.cookieHeader());
  console.log(JSON.stringify({public:true,health:true,admin:true,learner:true,seededCourse:course.slug}));
  process.exit(0);
}

const slug='smoke-http-validation';
await admin.client.from('courses').delete().eq('slug',slug);
const {data:course,error:courseError}=await admin.client.from('courses').insert({slug,title:'Formation Smoke HTTP',short_description:'Validation distante',description:'Validation distante du workflow complet.',status:'published',price_xof:0,duration_minutes:20,created_by:adminAuth.user.id}).select('id').single();
assert.ifError(courseError);
const {data:updatedCourse,error:courseUpdateError}=await admin.client.from('courses').update({title:'Formation Smoke HTTP modifiée'}).eq('id',course.id).select('title').single();
assert.ifError(courseUpdateError);
assert.equal(updatedCourse.title,'Formation Smoke HTTP modifiée','modification admin non persistée');
const {data:module,error:moduleError}=await admin.client.from('modules').insert({course_id:course.id,title:'Module Smoke HTTP',description:'Validation',position:1}).select('id').single();
assert.ifError(moduleError);
const {data:lesson,error:lessonError}=await admin.client.from('lessons').insert({module_id:module.id,slug:'lecon-smoke-http',title:'Leçon Smoke HTTP',objective:'Valider le lecteur',content:'Contenu réel du smoke test.',exercise:'Marquer la leçon comme terminée.',duration_minutes:5,position:1,is_preview:false}).select('id').single();
assert.ifError(lessonError);
const {error:enrollmentError}=await admin.client.from('enrollments').upsert({user_id:'51000000-0000-0000-0000-000000000002',course_id:course.id,active:true,enrolled_at:new Date().toISOString()},{onConflict:'user_id,course_id'});
assert.ifError(enrollmentError);
await expectPage('/admin/inscriptions',/Apprenant Démo/i,admin.cookieHeader());

const learner=authClient();
const {data:learnerAuth,error:learnerAuthError}=await learner.client.auth.signInWithPassword({email:process.env.E2E_LEARNER_EMAIL,password:process.env.E2E_LEARNER_PASSWORD});
assert.ifError(learnerAuthError);
assert.ok(learnerAuth.user,'connexion apprenant échouée');
await expectPage('/dashboard',/Formation Smoke HTTP modifiée/i,learner.cookieHeader());
await expectPage(`/cours/${slug}`,/Leçon Smoke HTTP/i,learner.cookieHeader());
const {error:progressError}=await learner.client.from('lesson_progress').upsert({profile_id:learnerAuth.user.id,lesson_id:lesson.id,completed:true,completed_at:new Date().toISOString()},{onConflict:'profile_id,lesson_id'});
assert.ifError(progressError);
const {data:progress,error:progressReadError}=await learner.client.from('lesson_progress').select('completed').eq('lesson_id',lesson.id).single();
assert.ifError(progressReadError);
assert.equal(progress.completed,true,'progression non persistée');

const anonymousPrivate=previewRequest(`/cours/${slug}`);
assert.doesNotMatch(anonymousPrivate.body,/Contenu réel du smoke test/i,'contenu privé visible sans inscription');
assert.match(anonymousPrivate.body,/404|introuvable|not found/i,'refus du cours privé non confirmé');
await learner.client.auth.signOut();
const learnerSignedOut=previewRequest('/dashboard',learner.cookieHeader());
assert.ok([302,303,307,308].includes(learnerSignedOut.status)||/connexion|se connecter/i.test(learnerSignedOut.body),'dashboard encore accessible après déconnexion');
await admin.client.auth.signOut();
const adminSignedOut=previewRequest('/admin',admin.cookieHeader());
assert.ok([302,303,307,308].includes(adminSignedOut.status)||/connexion|se connecter/i.test(adminSignedOut.body),'admin encore accessible après déconnexion');

console.log(JSON.stringify({public:true,health:true,admin:true,adminUpdate:true,manualEnrollment:true,learner:true,privateCourseDenied:true,progress:true,logout:true,slug}));
