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


export const hollandQuestions: HollandQuestion[] = [
  // Realista - Actividades
  { id: 'q1', section: 'actividades', category: 'realista', text: 'Reparar aparatos eléctricos', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2tmeDVpa21ocjI4ZjI2ZTU5dGdtNjBwdnNhaDVoemkzenpyc2ZleSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TFApQ22gqG2Yv4s/giphy.gif' },
  { id: 'q2', section: 'actividades', category: 'realista', text: 'Conducir un camión', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmNpdjZnaGZ0dWZ0c2N6ZGRzYjVoM2FydXRnYzUwb3M4MWpjeDUweiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5AUq4yg2oG3gQ/giphy.gif' },
  { id: 'q3', section: 'actividades', category: 'realista', text: 'Hacer cosas con madera', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExemRlcjZndWZnY2Q2MXVqbnVoZHN0cmY4b2Nwa3A3YTVvMHV5cmM0ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iY1QY0OERQ0dG/giphy.gif' },
  
  // Realista - Habilidades
  { id: 'q4', section: 'habilidades', category: 'realista', text: 'He trabajado con herramientas eléctricas', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWc0NWp1aXFyZTN1d2h1eDB0Zzk0YTNmMHJsZDFxNXRyMGk5eG1jZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RhQ4md3iB65A4/giphy.gif' },
  { id: 'q5', section: 'habilidades', category: 'realista', text: 'Puedo leer planos', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y2anZsdWU4dzF3dDBzemU5bXJzNHVpZ2pnaDA0cndkeXh5aXg3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aDgaRRH5KKO2rdC/giphy.gif' },
  
  // Realista - Ocupaciones
  { id: 'q6', section: 'ocupaciones', category: 'realista', text: 'Carpintero', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTVoamR5eDE3OTFjd3ZjaXl3czZjcHE2ZzZtaWwzNTV6d3d6am5hbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TDMbOH12Pj12o/giphy.gif' },
  { id: 'q7', section: 'ocupaciones', category: 'realista', text: 'Mecánico', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajJma3hnc3UyZHUwdHZ3a20yYjVnbDZ1emc1dnZrYjc4eHR6NTF0dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlNa2aU6a2wNFaU/giphy.gif' },

  // Investigador - Actividades
  { id: 'q8', section: 'actividades', category: 'investigador', text: 'Leer libros científicos', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczJldnlnenVjbXJld3BkaGNxY2Zia2R1cHZwb2I3NnZ0d2tucjNoZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0Iyl55kTeh71nTXy/giphy.gif' },
  { id: 'q9', section: 'actividades', category: 'investigador', text: 'Trabajar en un laboratorio', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVyc2VvOW04ZWp2dXFscDlzYXprNWx0MXdvOWV2ODFvdmg1bmR5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/j9lg3FZ52xO2Q/giphy.gif' },

  // Investigador - Habilidades
  { id: 'q10', section: 'habilidades', category: 'investigador', text: 'Entiendo la teoría de la evolución', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTc1cjVqejVnY212ZzZna25kaDBuOXE2bjM5cGtzN3N1b2lmeW04OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4Epfjei0Y26y2aHe/giphy.gif' },
  { id: 'q11', section: 'habilidades', category: 'investigador', text: 'Uso de microscopio', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnRhd2JzcHNoeDFkYjFidGdweXFxbjZqazVpcWoyOXZnNmhwcDRhbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26gR1p0Ip6YUJ433W/giphy.gif' },

  // Investigador - Ocupaciones
  { id: 'q12', section: 'ocupaciones', category: 'investigador', text: 'Biólogo', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZThia3E1a2k3bG9wY3N4dDBybm5kNTczYjE3cGVjMmdyM2VubzNxeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13fza7QdG34m4M/giphy.gif' },
  { id: 'q13', section: 'ocupaciones', category: 'investigador', text: 'Astrónomo', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExenBzbXVsc3dybG5yMzY4MXFqenI0OTU4cGN4YXF2eTR5MDh0ZW5qNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn1s3nBxa9n7wze/giphy.gif' },

  // Artístico - Actividades
  { id: 'q14', section: 'actividades', category: 'artistico', text: 'Dibujar o pintar', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJvdHV6eHMyOXduNnZ5ZnBqNHQzN2p4ZDBnbW9ycnF1cHhlZDJjciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o751VRT12A7f93N6w/giphy.gif' },
  { id: 'q15', section: 'actividades', category: 'artistico', text: 'Cantar en un coro', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmNucnQ5aTJ0MnV0bWJtYjM2NHdkaGt1bGNrYjNnc2h5MHYyNTdxMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2Z6S6n38zjPswo/giphy.gif' },

  // Artístico - Habilidades
  { id: 'q16', section: 'habilidades', category: 'artistico', text: 'Sé tocar un instrumento musical', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3dldmQ5NW5qa3duOGN0c25tNTM1enYyemZrc3V4eTdkY296MnZmeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MMPZg3s0d1eBW/giphy.gif' },
  { id: 'q17', section: 'habilidades', category: 'artistico', text: 'Puedo escribir historias o poemas', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2F4eGI0bmZqYzY4NjJicmt3eXRwd2ZodXRhMnI1c2N1eWV1MDR5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26AHLsKAcC2GdtI6A/giphy.gif' },

  // Artístico - Ocupaciones
  { id: 'q18', section: 'ocupaciones', category: 'artistico', text: 'Músico', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTZ5c3BnaXVnNnhzc2R5cHp5MXN1cmF2eDR2b2FjMHlwbTZqNncxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6gbbiSeB421E92wM/giphy.gif' },
  { id: 'q19', section: 'ocupaciones', category: 'artistico', text: 'Escritor', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejA3c2N3M3hveGJhOXgwdWJzdGxlZHVtdHFtN21iZG5zYjZxaG82ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aD7JCCA3s02a45G/giphy.gif' },
];