import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type CourseSummary = { id:string; slug:string; title:string; short_description:string|null; description:string|null; image_url:string|null; status:'draft'|'published'|'archived'; price_xof:number; level:string; duration_minutes:number; updated_at:string };

export async function listPublishedCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('courses').select('id,slug,title,short_description,description,image_url,status,price_xof,level,duration_minutes,updated_at').eq('status','published').order('updated_at',{ascending:false});
  if (error) throw new Error('Impossible de charger les formations.');
  return (data ?? []) as CourseSummary[];
}

export async function getPublishedCourse(slug:string) {
  const supabase = await createClient();
  const [{ data, error }, { data: outline, error: outlineError }] = await Promise.all([
    supabase.from('courses').select('id,slug,title,short_description,description,image_url,status,price_xof,level,duration_minutes,updated_at').eq('slug',slug).eq('status','published').maybeSingle(),
    supabase.rpc('get_public_course_outline', { course_slug: slug }),
  ]);
  if (error || outlineError) throw new Error('Impossible de charger cette formation.');
  if (!data) return null;
  type OutlineRow = { module_id:string;module_title:string;module_description:string|null;module_position:number;lesson_id:string;lesson_slug:string;lesson_title:string;lesson_objective:string|null;lesson_duration_minutes:number;lesson_position:number;is_preview:boolean;locked:boolean };
  const modules = new Map<string,{id:string;title:string;description:string|null;position:number;lessons:Array<{id:string;slug:string;title:string;objective:string|null;duration_minutes:number;position:number;is_preview:boolean;locked:boolean}>}>();
  for (const row of (outline ?? []) as OutlineRow[]) {
    if (!modules.has(row.module_id)) modules.set(row.module_id,{id:row.module_id,title:row.module_title,description:row.module_description,position:row.module_position,lessons:[]});
    modules.get(row.module_id)!.lessons.push({id:row.lesson_id,slug:row.lesson_slug,title:row.lesson_title,objective:row.lesson_objective,duration_minutes:row.lesson_duration_minutes,position:row.lesson_position,is_preview:row.is_preview,locked:row.locked});
  }
  return { ...data, modules: [...modules.values()] };
}

export const formatXof = (amount:number) => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(amount)+' FCFA';
export const formatDuration = (minutes:number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes/60)} h${minutes%60 ? ` ${minutes%60} min` : ''}`;
