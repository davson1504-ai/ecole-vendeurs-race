import Image from 'next/image';

const fallbackBySlug: Record<string, string> = {
  'les-fondamentaux-de-la-vente': '/images/formations/fondamentaux-vente.webp',
  'techniques-de-vente-terrain': '/images/formations/vente-terrain.webp',
  'excellence-commerciale-et-performance': '/images/formations/excellence-commerciale.webp',
};

export function courseImage(slug: string, imageUrl?: string | null) {
  return imageUrl || fallbackBySlug[slug] || '/images/auth/auth-hero.webp';
}

export function CourseImage({ slug, title, imageUrl, className = '' }: { slug: string; title: string; imageUrl?: string | null; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#071b3a] ${className}`}>
      <Image src={courseImage(slug, imageUrl)} alt={`Formation ${title}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px" className="object-cover" />
    </div>
  );
}
