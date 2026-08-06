'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/authorization';

const profileSchema = z.object({
  full_name: z.string().trim().min(2), phone: z.string().trim().min(6),
  city_country: z.string().trim().min(2), affiliate_code: z.string().trim().max(40).optional(),
  avatar_url: z.union([z.string().trim().url(), z.literal('')]).optional(),
  terms: z.literal('on'),
});

export async function saveProfileAction(formData: FormData) {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/onboarding?step=profil&error=profil-incomplet');
  const { supabase, user } = await requireUser('/onboarding');
  const profile = { full_name: parsed.data.full_name, phone: parsed.data.phone, city_country: parsed.data.city_country, affiliate_code: parsed.data.affiliate_code || null, avatar_url: parsed.data.avatar_url || null };
  const { error } = await supabase.from('profiles').update({ ...profile, terms_accepted_at: new Date().toISOString() }).eq('id', user.id);
  if (error) redirect('/onboarding?step=profil&error=enregistrement');
  redirect('/onboarding?step=formation');
}

export async function selectCourseAction(formData: FormData) {
  const courseId = z.string().uuid().parse(formData.get('course_id'));
  const { supabase, user } = await requireUser('/onboarding');
  const { data: course } = await supabase.from('courses').select('id,price_xof').eq('id', courseId).eq('status', 'published').single();
  if (!course) redirect('/onboarding?step=formation&error=formation');
  const { data: existing } = await supabase.from('orders').select('id').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle();
  const payload = { course_id: course.id, amount_xof: course.price_xof, payment_method: 'manual_validation', status: 'pending' as const };
  const result = existing
    ? await supabase.from('orders').update(payload).eq('id', existing.id)
    : await supabase.from('orders').insert({ ...payload, user_id: user.id, order_number: `DEMO-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`, currency: 'XOF' });
  if (result.error) redirect('/onboarding?step=formation&error=enregistrement');
  redirect('/onboarding?step=paiement');
}

export async function choosePaymentAction(formData: FormData) {
  const method = z.enum(['mobile_money', 'card', 'manual_validation']).parse(formData.get('payment_method'));
  const { supabase, user } = await requireUser('/onboarding');
  const { data: order } = await supabase.from('orders').select('id').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!order) redirect('/onboarding?step=formation');
  const { error } = await supabase.from('orders').update({ payment_method: method, status: 'pending' }).eq('id', order.id);
  if (error) redirect('/onboarding?step=paiement&error=enregistrement');
  redirect('/onboarding?step=finalisation');
}
