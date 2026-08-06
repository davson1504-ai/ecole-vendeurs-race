'use server';
import { requireUser } from '@/lib/auth/authorization';
export async function markWelcomeSeen(){const {supabase,user,profile}=await requireUser('/dashboard');if(profile.role!=='apprenant')return;await supabase.from('profiles').update({first_login_welcome_seen_at:new Date().toISOString()}).eq('id',user.id).is('first_login_welcome_seen_at',null)}
