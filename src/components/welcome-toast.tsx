'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { markWelcomeSeen } from '@/app/(dashboard)/dashboard/actions';

export function WelcomeToast() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    void markWelcomeSeen();
    const timer = window.setTimeout(() => setVisible(false), 10_000);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return <aside role="status" aria-live="polite" className="welcome-toast fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-xl rounded-3xl border-2 border-[#d8ad46] bg-white p-6 shadow-2xl sm:left-auto sm:right-6">
    <button type="button" onClick={() => setVisible(false)} aria-label="Fermer le message de bienvenue" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 focus-visible:outline-2"><X className="h-5 w-5" /></button>
    <p className="pr-10 text-xl font-extrabold text-[#071b3a]">Bienvenue dans l’École des Vendeurs</p>
    <p className="mt-3 leading-6 text-slate-600">Votre compte a été créé avec succès. Pour accéder pleinement à votre espace de formation, finalisez maintenant votre profil et suivez les étapes proposées.</p>
    <Link href="/onboarding" className="mt-5 inline-flex rounded-xl bg-[#d8ad46] px-5 py-3 font-bold text-[#071b3a]">Finaliser mon inscription</Link>
    <div aria-hidden="true" className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="welcome-countdown h-full bg-[#d8ad46]" /></div>
  </aside>;
}
