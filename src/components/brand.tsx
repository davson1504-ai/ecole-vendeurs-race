import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { isAdminRole } from '@/lib/auth/authorization';
import { signOutAction } from '@/app/(auth)/actions';

export function BrandLogo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d8ad46] to-[#f5df99] text-[#071b3a] shadow-sm">
        <ShieldCheck className="h-6 w-6" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className={light ? 'font-extrabold text-white' : 'font-extrabold text-[#071b3a]'}>École des</p>
          <p className={light ? 'font-extrabold text-white' : 'font-extrabold text-[#071b3a]'}>Vendeurs de Race</p>
        </div>
      )}
    </Link>
  );
}

export async function PublicHeader({ active = '' }: { active?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('full_name,role,status').eq('id', user.id).maybeSingle() : { data: null };
  const admin = isAdminRole(profile?.role) && profile?.status === 'active';
  const item = (href: string, label: string, key: string) => (
    <Link
      href={href}
      className={
        active === key
          ? 'rounded-full bg-[#d8ad46] px-4 py-2 font-semibold text-[#071b3a]'
          : 'px-2 py-2 text-sm font-medium text-[#071b3a] hover:text-[#b98722]'
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <BrandLogo />
        <nav className="hidden items-center gap-2 md:flex">
          {item('/', 'Accueil', 'home')}
          {item('/formations', 'Formations', 'formations')}
          {item('/a-propos', 'À propos de nous', 'about')}
          {item('/contact', 'Contactez-nous', 'contact')}
          {user ? item(admin ? '/admin' : '/dashboard', admin ? 'Administration' : 'Mon espace', admin ? 'admin' : 'dashboard') : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? <><span className="hidden text-sm font-semibold text-[#071b3a] sm:inline">{profile?.full_name || user.email}</span><form action={signOutAction}><button className="rounded-full bg-[#071b3a] px-4 py-2 text-sm font-semibold text-white">Déconnexion</button></form></> : <><Link href="/connexion" className="hidden rounded-full border border-[#071b3a] px-4 py-2 text-sm font-semibold text-[#071b3a] sm:inline-flex">Se connecter</Link><Link href="/inscription" className="rounded-full bg-[#071b3a] px-4 py-2 text-sm font-semibold text-white">S’inscrire</Link></>}
        </div>
        <nav className="order-3 grid w-full grid-cols-4 items-center gap-2 border-t border-slate-100 pt-3 text-center text-xs font-semibold md:hidden sm:text-sm">
          <Link href="/">Accueil</Link><Link href="/formations">Formations</Link><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link>{user ? <Link href={admin?'/admin':'/dashboard'}>{admin?'Administration':'Mon espace'}</Link> : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#071b3a] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="md:col-span-1">
          <BrandLogo light />
          <p className="mt-4 text-sm text-slate-300">Plateforme de formation commerciale structurée autour de contenus pratiques et d’une progression réelle.</p>
        </div>
        <div>
          <p className="font-bold text-[#d8ad46]">Navigation</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link href="/formations">Formations</Link>
            <Link href="/a-propos">À propos de nous</Link>
            <Link href="/contact">Contactez-nous</Link>
            <Link href="/connexion">Connexion</Link>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#d8ad46]">Support</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link href="/conditions-utilisation">Conditions d’utilisation</Link>
            <Link href="/confidentialite">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400">© 2026 École des Vendeurs de Race. Tous droits réservés.</div>
    </footer>
  );
}

export function PlaceholderImage({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={'relative flex min-h-44 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top_left,#f8df8c,transparent_30%),linear-gradient(135deg,#0b2347,#071b3a_55%,#d8ad46)] ' + className}>
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
        <GraduationCap className="h-10 w-10" />
      </div>
      <span className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{label}</span>
    </div>
  );
}

export function MetricCard({ label, value, tone = 'blue', icon }: { label: string; value: string; tone?: 'blue' | 'gold' | 'green'; icon?: ReactNode }) {
  const tones = {
    blue: 'from-[#123b70] to-[#071b3a]',
    gold: 'from-[#d8ad46] to-[#b98722]',
    green: 'from-[#2e9e57] to-[#15743c]',
  };
  return (
    <div className={'rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ' + tones[tone]}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">{icon ?? <BookOpen className="h-6 w-6" />}</div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="text-3xl font-extrabold">{value}</p>
        </div>
      </div>
    </div>
  );
}
