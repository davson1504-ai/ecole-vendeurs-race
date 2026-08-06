import { notFound } from 'next/navigation';
import { deleteLesson, deleteModule, saveLesson, saveModule } from '@/app/(dashboard)/admin/actions';
import { AdminShell } from '@/components/admin-nav';
import { ConfirmSubmit } from '@/components/confirm-submit';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic='force-dynamic';
const field='w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-[#b98722] focus:outline-none';

export default async function ModulesPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {supabase}=await requireAdmin(`/admin/formations/${id}/modules`);
  const {data:course}=await supabase.from('courses').select('id,title,modules(id,title,description,position,lessons(id,slug,title,objective,content,exercise,duration_minutes,position,is_preview))').eq('id',id).order('position',{referencedTable:'modules'}).order('position',{referencedTable:'modules.lessons'}).maybeSingle();
  if(!course)notFound();
  const modules=(course.modules??[]).toSorted((a,b)=>a.position-b.position);
  return <AdminShell>
    <h1 className="text-4xl font-extrabold text-[#071b3a]">Programme · {course.title}</h1>
    <p className="mt-3 text-slate-600">Modifiez les positions pour réordonner les modules et les leçons.</p>
    <ModuleForm courseId={id} position={modules.length+1} submitLabel="Ajouter le module" />
    <div className="mt-8 space-y-6">{modules.map(module=><section key={module.id} className="rounded-3xl border bg-white p-5">
      <ModuleForm courseId={id} module={module} position={module.position} submitLabel="Mettre à jour" />
      <form action={deleteModule} className="mt-3 text-right"><input type="hidden" name="course_id" value={id}/><input type="hidden" name="module_id" value={module.id}/><ConfirmSubmit message="Supprimer ce module vide ? Cette action est définitive." className="font-bold text-red-700">Supprimer le module s’il est vide</ConfirmSubmit></form>
      <div className="mt-5 space-y-3">{module.lessons.toSorted((a,b)=>a.position-b.position).map(lesson=><details key={lesson.id} className="rounded-2xl bg-slate-50 p-4"><summary className="cursor-pointer font-bold">{lesson.position}. {lesson.title} {lesson.is_preview?'· Aperçu public':''}</summary><LessonForm courseId={id} moduleId={module.id} lesson={lesson}/><form action={deleteLesson} className="mt-3 text-right"><input type="hidden" name="course_id" value={id}/><input type="hidden" name="lesson_id" value={lesson.id}/><ConfirmSubmit message="Supprimer cette leçon et sa progression associée ?" className="font-bold text-red-700">Supprimer la leçon</ConfirmSubmit></form></details>)}</div>
      <details className="mt-4 rounded-2xl border border-dashed p-4"><summary className="cursor-pointer font-bold text-green-700">Ajouter une leçon</summary><LessonForm courseId={id} moduleId={module.id} nextPosition={module.lessons.length+1}/></details>
    </section>)}</div>
  </AdminShell>;
}

type ModuleValue={id:string;title:string;description:string|null;position:number};
function ModuleForm({courseId,module,position,submitLabel}:{courseId:string;module?:ModuleValue;position:number;submitLabel:string}){
  return <form action={saveModule} className="mt-6 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[90px_1fr_2fr_auto]"><input type="hidden" name="course_id" value={courseId}/>{module&&<input type="hidden" name="module_id" value={module.id}/>}<label className="text-sm font-bold">Position<input required type="number" min="1" name="position" defaultValue={position} className={field}/></label><label className="text-sm font-bold">Titre<input required name="title" defaultValue={module?.title} className={field}/></label><label className="text-sm font-bold">Description<input required name="description" defaultValue={module?.description??''} className={field}/></label><button className="self-end rounded-xl bg-blue-700 px-4 py-2 font-bold text-white">{submitLabel}</button></form>;
}

type LessonValue={id:string;slug:string;title:string;objective:string|null;content:string|null;exercise:string|null;duration_minutes:number;position:number;is_preview:boolean};
function LessonForm({courseId,moduleId,lesson,nextPosition=1}:{courseId:string;moduleId:string;lesson?:LessonValue;nextPosition?:number}){
  return <form action={saveLesson} className="mt-4 grid gap-3"><input type="hidden" name="course_id" value={courseId}/><input type="hidden" name="module_id" value={moduleId}/>{lesson&&<input type="hidden" name="lesson_id" value={lesson.id}/>}<div className="grid gap-3 sm:grid-cols-3"><label>Titre<input required name="title" defaultValue={lesson?.title} className={field}/></label><label>Slug<input required name="slug" defaultValue={lesson?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={field}/></label><label>Position<input required type="number" min="1" name="position" defaultValue={lesson?.position??nextPosition} className={field}/></label></div><label>Objectif<textarea required name="objective" defaultValue={lesson?.objective??''} className={field}/></label><label>Contenu<textarea required rows={5} name="content" defaultValue={lesson?.content??''} className={field}/></label><label>Exercice<textarea name="exercise" defaultValue={lesson?.exercise??''} className={field}/></label><div className="flex flex-wrap items-center gap-5"><label>Durée <input type="number" min="0" name="duration_minutes" defaultValue={lesson?.duration_minutes??10} className="w-24 rounded-xl border px-3 py-2"/></label><label className="flex gap-2"><input type="checkbox" name="is_preview" defaultChecked={lesson?.is_preview}/> Aperçu public</label><button className="rounded-xl bg-green-700 px-5 py-2 font-bold text-white">Enregistrer la leçon</button></div></form>;
}
