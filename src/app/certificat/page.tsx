import Link from 'next/link';
import { Download } from 'lucide-react';
import { BrandLogo } from '@/components/brand';

export default function CertificatPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-5xl"><BrandLogo /></div>
      <section className="mx-auto mt-10 max-w-5xl">
        <h1 className="text-4xl font-extrabold text-[#071b3a]">Aperçu du certificat</h1>
        <div className="mt-6 rounded-[2rem] border-[12px] border-[#071b3a] bg-[#fff7df] p-4 shadow-2xl">
          <div className="rounded-[1.5rem] border-4 border-[#d8ad46] bg-white p-10 text-center">
            <div className="flex justify-center"><BrandLogo /></div>
            <p className="mt-8 font-serif text-5xl font-extrabold text-[#b98722]">Certificat de Formation</p>
            <p className="mt-6 text-lg">Ce certificat est fièrement décerné à</p>
            <p className="mt-4 font-serif text-5xl italic text-[#071b3a]">Jean-Baptiste Nguema</p>
            <p className="mt-6 text-lg">Pour la réussite complète du cours professionnel</p>
            <p className="mt-3 text-3xl font-extrabold text-[#071b3a]">Devenir vendeur professionnel</p>
            <p className="mt-8 text-lg">25 Juillet 2026</p>
            <p className="mt-3 text-sm text-slate-600">ID du certificat : EVR-2026-07-998734</p>
          </div>
        </div>
        <Link href="#" className="mt-6 flex items-center justify-center rounded-2xl bg-[#1f5d9e] px-6 py-4 text-xl font-extrabold text-white"><Download className="mr-2 h-6 w-6" />Télécharger PDF</Link>
      </section>
    </main>
  );
}
