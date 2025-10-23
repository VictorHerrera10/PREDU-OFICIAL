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

export const CATEGORY_DETAILS: Record<QuestionCategory, { icon: React.ElementType, color: string, label: string }> = {
    realista: { icon: Wrench, color: 'hsl(140 70% 40%)', label: 'Realista' },
    investigador: { icon: Microscope, color: 'hsl(210 70% 50%)', label: 'Investigador' },
    artistico: { icon: Palette, color: 'hsl(280 70% 60%)', label: 'Artístico' },
    social: { icon: Users, color: 'hsl(330 70% 60%)', label: 'Social' },
    emprendedor: { icon: Handshake, color: 'hsl(45 90% 50%)', label: 'Emprendedor' },
    convencional: { icon: Calculator, color: 'hsl(170 70% 40%)', label: 'Convencional' },
};

export const SECTION_DETAILS: Record<TestSection, { icon: React.ElementType, title: string, description: string }> = {
    actividades: { icon: Landmark, title: 'Actividades', description: '¿Qué te gusta hacer?' },
    habilidades: { icon: Briefcase, title: 'Habilidades', description: '¿En qué eres bueno?' },
    ocupaciones: { icon: HandPlatter, title: 'Ocupaciones', description: '¿Qué trabajos te interesan?' },
};

    