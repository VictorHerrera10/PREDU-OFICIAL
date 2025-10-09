'use client';

export type Subject = {
    id: string;
    label: string;
    emoji: string;
};

export const subjects: Subject[] = [
  { id: "matematica", label: "Matemática", emoji: "🧮" },
  { id: "comunicacion", label: "Comunicación", emoji: "🗣️" },
  { id: "ingles", label: "Inglés", emoji: "🌍" },
  { id: "ciencia_tecnologia", label: "Ciencia y Tecnología", emoji: "🔬" },
  { id: "ciencias_sociales", label: "Ciencias Sociales", emoji: "🏛️" },
  { id: "desarrollo_personal_ciudadania_civica", label: "DPCC", emoji: "🤝" },
  { id: "educacion_fisica", label: "Educación Física", emoji: "🏃‍♂️" },
  { id: "educacion_religiosa", label: "Educación Religiosa", emoji: "🙏" },
  { id: "arte_cultura", label: "Arte y Cultura", emoji: "🎨" },
  { id: "educacion_para_trabajo", label: "Educación para el Trabajo", emoji: "💼" },
];
