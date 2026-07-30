export type Course = {
  slug: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  priceXof: number;
  level: string;
  duration: string;
  lessonsCount: number;
  progress?: number;
  modules: { title: string; lessons: string[] }[];
};

export const courses: Course[] = [
  {
    slug: 'devenir-vendeur-professionnel',
    title: 'Devenir vendeur professionnel',
    category: 'Vente',
    description: 'Maîtrisez les fondamentaux de la vente pour exceller sur le marché africain.',
    longDescription:
      'Cette formation vous donne une méthode claire pour comprendre le client, structurer votre argumentaire, gérer les objections et conclure avec professionnalisme. Elle s’adresse aux vendeurs débutants, commerciaux terrain, entrepreneurs et toute personne qui souhaite vendre avec méthode.',
    priceXof: 150000,
    level: 'Débutant',
    duration: '25 heures',
    lessonsCount: 24,
    progress: 75,
    modules: [
      { title: 'Module 1 : Les bases de la vente', lessons: ["L’état d’esprit du vendeur", 'Comprendre le client', 'Le processus de vente'] },
      { title: 'Module 2 : Techniques de prospection', lessons: ['Identifier sa cible', 'Préparer son script', 'Relancer sans forcer'] },
      { title: 'Module 3 : Négociation commerciale', lessons: ['Traiter les objections', 'Créer la confiance', 'Conclure proprement'] },
      { title: 'Module 4 : Vendre sur le marché africain', lessons: ['Adapter son discours', 'Vendre avec Mobile Money', 'Fidéliser le client'] },
    ],
  },
  {
    slug: 'negociation-commerciale-avancee',
    title: 'Négociation commerciale avancée',
    category: 'Négociation',
    description: 'Apprenez à défendre votre prix, gérer les objections et conclure des ventes complexes.',
    longDescription:
      'Un parcours pour les commerciaux qui veulent gagner en assurance, mieux préparer leurs entretiens et sécuriser les accords importants.',
    priceXof: 120000,
    level: 'Intermédiaire',
    duration: '20 heures',
    lessonsCount: 18,
    progress: 45,
    modules: [
      { title: 'Module 1 : Préparation', lessons: ['Objectifs de négociation', 'Informations à collecter'] },
      { title: 'Module 2 : Objections', lessons: ['Prix', 'Confiance', 'Délai'] },
    ],
  },
  {
    slug: 'prospection-b2b-efficace',
    title: 'Prospection B2B efficace',
    category: 'Prospection',
    description: 'Construisez un tunnel de prospection simple pour obtenir plus de rendez-vous qualifiés.',
    longDescription:
      'Méthode pratique pour identifier les prospects, créer un message d’approche et suivre les relances.',
    priceXof: 90000,
    level: 'Débutant',
    duration: '15 heures',
    lessonsCount: 14,
    progress: 90,
    modules: [
      { title: 'Module 1 : Ciblage', lessons: ['Définir son client idéal', 'Créer une liste de prospects'] },
      { title: 'Module 2 : Contact', lessons: ['Message court', 'Appel de qualification'] },
    ],
  },
  {
    slug: 'techniques-de-closing',
    title: 'Techniques de closing',
    category: 'Closing',
    description: 'Détectez les signaux d’achat et concluez sans pression inutile.',
    longDescription:
      'Une formation courte centrée sur les méthodes de conclusion, les questions de validation et la sécurisation de la décision.',
    priceXof: 75000,
    level: 'Intermédiaire',
    duration: '12 heures',
    lessonsCount: 10,
    progress: 20,
    modules: [
      { title: 'Module 1 : Signaux d’achat', lessons: ['Questions de découverte', 'Intentions du prospect'] },
      { title: 'Module 2 : Conclusion', lessons: ['Choix alternatif', 'Résumé de valeur'] },
    ],
  },
  {
    slug: 'leadership-commercial',
    title: 'Leadership commercial',
    category: 'Management',
    description: 'Pilotez une équipe de vente et suivez les indicateurs essentiels.',
    longDescription:
      'Formation dédiée aux responsables commerciaux et entrepreneurs qui doivent structurer une équipe et améliorer la performance.',
    priceXof: 180000,
    level: 'Avancé',
    duration: '30 heures',
    lessonsCount: 22,
    progress: 0,
    modules: [
      { title: 'Module 1 : Management commercial', lessons: ['Objectifs', 'Rituels', 'Suivi de performance'] },
    ],
  },
];

export const featuredCourses = courses.slice(0, 3);

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function formatFcfa(amount: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
}

export const affiliateSales = [
  { date: '15/07/2026', student: 'Jean Dupont', product: 'Devenir vendeur professionnel', amount: 150000, commission: 30000, status: 'Payé' },
  { date: '16/07/2026', student: 'Amina Koné', product: 'Négociation commerciale avancée', amount: 120000, commission: 24000, status: 'Validé' },
  { date: '17/07/2026', student: 'Oumar Diop', product: 'Prospection B2B efficace', amount: 90000, commission: 18000, status: 'En attente' },
  { date: '18/07/2026', student: 'Fatou Ndiaye', product: 'Techniques de closing', amount: 75000, commission: 15000, status: 'Validé' },
];

export const payments = [
  { ref: 'PAY-102345', user: 'Koffi Diallo', course: 'Techniques de vente avancées', amount: 75000, method: 'Carte bancaire', status: 'Payé', date: '24/07/2026' },
  { ref: 'PAY-102344', user: 'Amina Koné', course: 'Devenir vendeur professionnel', amount: 150000, method: 'Orange Money', status: 'En attente', date: '23/07/2026' },
  { ref: 'PAY-102343', user: 'Oumar Diop', course: 'Négociation commerciale', amount: 120000, method: 'MTN Mobile Money', status: 'Payé', date: '22/07/2026' },
  { ref: 'PAY-102342', user: 'Fatou Ndiaye', course: 'Vente B2B stratégique', amount: 90000, method: 'CinetPay', status: 'Échoué', date: '21/07/2026' },
  { ref: 'PAY-102341', user: 'Amadou Ba', course: 'Gestion de la relation client', amount: 55000, method: 'Airtel Money', status: 'Payé', date: '20/07/2026' },
];
