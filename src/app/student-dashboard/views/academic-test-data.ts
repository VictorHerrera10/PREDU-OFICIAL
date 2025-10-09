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
  { id: "ciencia_y_tecnologia", label: "Ciencia y Tecnología", emoji: "🔬" },
  { id: "ciencias_sociales", label: "Ciencias Sociales", emoji: "🏛️" },
  { id: "desarrollo_personal", label: "Desarrollo Personal", emoji: "🤝" },
  { id: "educacion_fisica", label: "Educación Física", emoji: "🏃‍♂️" },
  { id: "educacion_religiosa", label: "Educación Religiosa", emoji: "🙏" },
  { id: "arte_y_cultura", label: "Arte y Cultura", emoji: "🎨" },
  { id: "educacion_para_el_trabajo", label: "Educación para el Trabajo", emoji: "💼" },
  { id: "castellano_como_segunda_lengua", label: "Castellano como Segunda Lengua", emoji: "💬" },
];
