'use client';
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

export const CATEGORY_DETAILS: Record<QuestionCategory, { icon: React.ElementType, color: string, colorClass: string, label: string }> = {
    realista: { icon: Wrench, color: 'hsl(140 70% 40%)', colorClass: 'green', label: 'Realista' },
    investigador: { icon: Microscope, color: 'hsl(210 70% 50%)', colorClass: 'blue', label: 'Investigador' },
    artistico: { icon: Palette, color: 'hsl(280 70% 60%)', colorClass: 'purple', label: 'Artístico' },
    social: { icon: Users, color: 'hsl(330 70% 60%)', colorClass: 'pink', label: 'Social' },
    emprendedor: { icon: Handshake, color: 'hsl(45 90% 50%)', colorClass: 'amber', label: 'Emprendedor' },
    convencional: { icon: Calculator, color: 'hsl(170 70% 40%)', colorClass: 'teal', label: 'Convencional' },
};

export const SECTION_DETAILS: Record<TestSection, { icon: React.ElementType, title: string, description: string }> = {
    actividades: { icon: Landmark, title: 'Actividades', description: '¿Qué te gusta hacer?' },
    habilidades: { icon: Briefcase, title: 'Habilidades', description: '¿En qué eres bueno?' },
    ocupaciones: { icon: HandPlatter, title: 'Ocupaciones', description: '¿Qué trabajos te interesan?' },
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
    {
    id: 'act-4',
    section: 'actividades',
    category: 'artistico',
    text: '¿Te gusta tocar un instrumento musical?',
    gifUrl: 'https://picsum.photos/seed/q10/400/200',
  },
  {
    id: 'act-5',
    section: 'actividades',
    category: 'emprendedor',
    text: '¿Te ves dirigiendo tu propio negocio?',
    gifUrl: 'https://picsum.photos/seed/q11/400/200',
  },
  {
    id: 'act-6',
    section: 'actividades',
    category: 'convencional',
    text: '¿Disfrutas organizando tu información en hojas de cálculo?',
    gifUrl: 'https://picsum.photos/seed/q12/400/200',
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
  {
    id: 'hab-4',
    section: 'habilidades',
    category: 'realista',
    text: '¿Eres bueno usando herramientas manuales?',
    gifUrl: 'https://picsum.photos/seed/q13/400/200',
  },
  {
    id: 'hab-5',
    section: 'habilidades',
    category: 'investigador',
    text: '¿Tienes facilidad para entender fórmulas matemáticas?',
    gifUrl: 'https://picsum.photos/seed/q14/400/200',
  },
    {
    id: 'hab-6',
    section: 'habilidades',
    category: 'convencional',
    text: '¿Eres una persona muy ordenada y metódica?',
    gifUrl: 'https://picsum.photos/seed/q15/400/200',
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
    {
    id: 'ocu-4',
    section: 'ocupaciones',
    category: 'investigador',
    text: '¿Te gustaría ser biólogo marino o químico?',
    gifUrl: 'https://picsum.photos/seed/q16/400/200',
  },
  {
    id: 'ocu-5',
    section: 'ocupaciones',
    category: 'social',
    text: '¿Te interesaría trabajar como profesor o psicólogo?',
    gifUrl: 'https://picsum.photos/seed/q17/400/200',
  },
    {
    id: 'ocu-6',
    section: 'ocupaciones',
    category: 'emprendedor',
    text: '¿Te ves como gerente de ventas o un político?',
    gifUrl: 'https://picsum.photos/seed/q18/400/200',
  },
];
