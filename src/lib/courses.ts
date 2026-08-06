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
  const { data, error } = await supabase.from('courses').select('id,slug,title,short_description,description,image_url,status,price_xof,level,duration_minutes,updated_at,modules(id,title,description,position,lessons(id,slug,title,objective,duration_minutes,position,is_preview))').eq('slug',slug).eq('status','published').order('position',{referencedTable:'modules'}).order('position',{referencedTable:'modules.lessons'}).maybeSingle();
  if (error) throw new Error('Impossible de charger cette formation.');
  return data;
}

export const formatXof = (amount:number) => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(amount)+' FCFA';
export const formatDuration = (minutes:number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes/60)} h${minutes%60 ? ` ${minutes%60} min` : ''}`;
