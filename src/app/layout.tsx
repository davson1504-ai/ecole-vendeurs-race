import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DemoBadge } from '@/components/demo-badge';
import './globals.css';

export const metadata: Metadata = {
  title: 'École des Vendeurs de Race',
  description: 'Plateforme e-learning, paiement sécurisé et affiliation pour vendeurs professionnels.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}<DemoBadge /></body>
    </html>
  );
}
