'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/authorization';
const schema=z.object({full_name:z.string().trim().min(2).max(120),phone:z.string().trim().min(6).max(40),city_country:z.string().trim().min(2).max(120),avatar_url:z.union([z.string().trim().url(),z.literal('')]).optional(),preferred_learning_pace:z.enum(['flexible','regular','intensive']),weekly_lesson_goal:z.coerce.number().int().min(1).max(20)});
export async function updateProfileAction(formData:FormData){const parsed=schema.safeParse(Object.fromEntries(formData));if(!parsed.success)redirect('/profil?error=validation');const{supabase,user}=await requireUser('/profil');const{error}=await supabase.from('profiles').update({...parsed.data,avatar_url:parsed.data.avatar_url||null}).eq('id',user.id);redirect(error?'/profil?error=enregistrement':'/profil?message=profil-mis-a-jour')}
