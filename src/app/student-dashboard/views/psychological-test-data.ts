import { HandPlatter, Wrench, Microscope, Palette, Users, Handshake, Landmark, Briefcase, Calculator } from 'lucide-react';

export type QuestionCategory = 'realista' | 'investigador' | 'artistico' | 'social' | 'emprendedor' | 'convencional';
export type TestSection = 'actividades' | 'habilidades' | 'ocupaciones';

export interface HollandQuestion {
  id: string;
  section: TestSection;
  category: QuestionCategory;
  text: string;
  gifUrl: string;
}

export const CATEGORY_DETAILS: Record<QuestionCategory, { icon: React.ElementType, color: string }> = {
    realista: { icon: Wrench, color: 'text-sky-400' },
    investigador: { icon: Microscope, color: 'text-blue-400' },
    artistico: { icon: Palette, color: 'text-purple-400' },
    social: { icon: Users, color: 'text-pink-400' },
    emprendedor: { icon: Handshake, color: 'text-amber-400' },
    convencional: { icon: Calculator, color: 'text-teal-400' },
};

export const SECTION_DETAILS: Record<TestSection, { icon: React.ElementType, title: string }> = {
    actividades: { icon: Landmark, title: 'Actividades' },
    habilidades: { icon: Briefcase, title: 'Habilidades' },
    ocupaciones: { icon: HandPlatter, title: 'Ocupaciones' },
};


export const questions: HollandQuestion[] = [
  // Actividades
  {
    id: 'act-1',
    section: 'actividades',
    category: 'realista',
    text: '¿Te gustaría reparar aparatos eléctricos?',
    gifUrl: 'https://picsum.photos/seed/q1/400/200',
  },
  {
    id: 'act-2',
    section: 'actividades',
    category: 'investigador',
    text: '¿Disfrutas leer sobre ciencia y tecnología?',
    gifUrl: 'https://picsum.photos/seed/q2/400/200',
  },
  {
    id: 'act-3',
    section: 'actividades',
    category: 'social',
    text: '¿Te agrada participar en colectas para ayudar a otros?',
    gifUrl: 'https://picsum.photos/seed/q3/400/200',
  },

  // Habilidades
  {
    id: 'hab-1',
    section: 'habilidades',
    category: 'artistico',
    text: '¿Tienes habilidad para escribir historias o poemas?',
    gifUrl: 'https://picsum.photos/seed/q4/400/200',
  },
  {
    id: 'hab-2',
    section: 'habilidades',
    category: 'emprendedor',
    text: '¿Eres bueno para organizar actividades y liderar equipos?',
    gifUrl: 'https://picsum.photos/seed/q5/400/200',
  },
  {
    id: 'hab-3',
    section: 'habilidades',
    category: 'social',
    text: '¿Se te facilita explicarle cosas a los demás?',
    gifUrl: 'https://picsum.photos/seed/q6/400/200',
  },

  // Ocupaciones
  {
    id: 'ocu-1',
    section: 'ocupaciones',
    category: 'convencional',
    text: '¿Te ves trabajando como contador o analista de datos?',
    gifUrl: 'https://picsum.photos/seed/q7/400/200',
  },
  {
    id: 'ocu-2',
    section: 'ocupaciones',
    category: 'realista',
    text: '¿Considerarías ser carpintero o ingeniero mecánico?',
    gifUrl: 'https://picsum.photos/seed/q8/400/200',
  },
  {
    id: 'ocu-3',
    section: 'ocupaciones',
    category: 'artistico',
    text: '¿Te atrae la idea de ser músico o diseñador gráfico?',
    gifUrl: 'https://picsum.photos/seed/q9/400/200',
  },
];
