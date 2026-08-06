'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/authorization';

const schema=z.object({lessonId:z.string().uuid(),courseSlug:z.string().min(1).max(160),completed:z.enum(['true','false'])});
export async function updateLessonProgress(formData:FormData){
  const input=schema.parse(Object.fromEntries(formData));
  const {supabase,user}=await requireUser(`/cours/${input.courseSlug}`);
  const {error}=await supabase.from('lesson_progress').upsert({profile_id:user.id,lesson_id:input.lessonId,completed:input.completed==='true',completed_at:input.completed==='true'?new Date().toISOString():null,last_viewed_at:new Date().toISOString()},{onConflict:'profile_id,lesson_id'});
  if(error) throw new Error('Progression non enregistrée.');
  revalidatePath(`/cours/${input.courseSlug}`);
}

export async function recordLessonView(lessonId:string,courseSlug:string){
  const input=z.object({lessonId:z.string().uuid(),courseSlug:z.string().min(1).max(160)}).parse({lessonId,courseSlug});
  const {supabase,user}=await requireUser(`/cours/${input.courseSlug}`);
  await supabase.from('lesson_progress').upsert({profile_id:user.id,lesson_id:input.lessonId,last_viewed_at:new Date().toISOString()},{onConflict:'profile_id,lesson_id'});
}
