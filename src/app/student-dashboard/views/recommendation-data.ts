'use client';

type Recommendation = {
    academicAdvice: string;
    psychologicalAdvice: string;
    relatedCareers: string;
    compatibilityAdvice: string;
};

// Mapa para agrupar carreras en áreas más grandes
const CAREER_MAP: Record<string, string> = {
    'ingenieria de sistemas': 'ingenierias',
    'ingenieria de software': 'ingenierias',
    'ingenieria industrial': 'ingenierias',
    'ciencias de la computacion': 'ingenierias',
    'derecho': 'sociales',
    'psicologia': 'sociales',
    'sociologia': 'sociales',
    'medicina': 'biomedicas',
    'biologia': 'biomedicas',
    'enfermeria': 'biomedicas',
};

// MATRIX con claves en minúsculas y sin tildes
const MATRIX: Record<string, Record<string, Recommendation>> = {
    'ingenierias': {
        'realista': {
            academicAdvice: "Tus notas reflejan un excelente dominio en Matemática, Física y Tecnología, lo que muestra una mente lógica y resolutiva. Refuerza tus conocimientos en programación, análisis de datos y diseño de sistemas para ampliar tu campo profesional.",
            psychologicalAdvice: "El perfil 'Realista' indica que disfrutas resolver problemas concretos, crear estructuras y trabajar con herramientas o sistemas. Prefieres actividades que te permitan construir y ver resultados tangibles.",
            relatedCareers: "- Ingeniería de Sistemas  <br> - Ingeniería Civil  <br> - Ingeniería Electrónica  <br> - Ingeniería Mecánica  <br> - Ingeniería Industrial  <br> - Ingeniería en Telecomunicaciones  <br> - Robótica y Mecatrónica",
            compatibilityAdvice: "Tu perfil vocacional y tu rendimiento académico están completamente alineados. Estás preparado para destacar en el ámbito tecnológico y productivo. Aprovecha tu capacidad analítica para liderar proyectos innovadores y tecnológicos."
        },
        'investigador': {
            academicAdvice: "Tus buenas notas en ciencias exactas y biología revelan un perfil técnico con sensibilidad científica. Refuerza tus conocimientos en tecnología médica y procesamiento de datos biológicos.",
            psychologicalAdvice: "El perfil 'Investigador' combina precisión técnica y curiosidad científica. Te motiva aplicar la ingeniería al cuidado y bienestar humano.",
            relatedCareers: "- Ingeniería Biomédica  <br> - Bioinformática  <br> - Biotecnología Aplicada  <br> - Diseño de Prótesis  <br> - Instrumentación Médica",
            compatibilityAdvice: "Tienes una mezcla excepcional entre ciencia y tecnología. Estás orientado hacia el futuro de la salud y la innovación médica."
        },
        'social': {
            academicAdvice: "Tus calificaciones reflejan solidez en comunicación y pensamiento crítico. Puedes aplicar tus habilidades sociales en la gestión de proyectos tecnológicos o en áreas de innovación social.",
            psychologicalAdvice: "El perfil 'Social' se orienta a lo técnico, pero puede adaptarse a la planificación y coordinación. Disfrutas aplicar métodos y ver resultados en contextos con impacto social.",
            relatedCareers: "- Gestión de Proyectos Sociales  <br> - Marketing Tecnológico  <br> - Innovación Social  <br> - Consultoría en Transformación Digital  <br> - Diseño de Servicios",
            compatibilityAdvice: "Esta mezcla te convierte en un profesional estratégico: sabes conectar la tecnología con las personas. Perfecto para roles de gestión o innovación con impacto social."
        }
    },
    'sociales': {
        'social': {
            academicAdvice: "Tu desempeño en Ciencias Sociales, Comunicación, Lenguaje y Literatura revela habilidades destacadas para analizar, comunicar y empatizar. Potencia tu pensamiento crítico y tus habilidades de expresión oral y escrita.",
            psychologicalAdvice: "El perfil 'Social' refleja empatía, cooperación y orientación al servicio. Te motiva ayudar, enseñar y trabajar en equipo para mejorar la vida de los demás.",
            relatedCareers: "- Psicología  <br> - Educación  <br> - Sociología  <br> - Trabajo Social  <br> - Comunicación Social  <br> - Marketing  <br> - Recursos Humanos  <br> - Relaciones Públicas",
            compatibilityAdvice: "Tienes una clara vocación humanista y social. Tu capacidad de escucha y comunicación te permitirá influir positivamente en las personas y comunidades."
        },
        'realista': {
            academicAdvice: "Tus notas en Matemática y Física muestran razonamiento lógico y pensamiento estructurado. Complementa tu perfil social con formación en gestión tecnológica o análisis de datos.",
            psychologicalAdvice: "El perfil 'Realista' indica que te motiva coordinar, enseñar y guiar a otros. Eres ideal para dirigir equipos técnicos y promover el desarrollo organizacional.",
            relatedCareers: "- Ingeniería Industrial  <br> - Gestión Tecnológica  <br> - Emprendimiento Social  <br> - Educación STEM  <br> - Gestión de Innovación",
            compatibilityAdvice: "Eres un perfil híbrido con liderazgo y visión técnica. Perfecto para combinar el lado humano con la eficiencia tecnológica."
        },
        'investigador': {
            academicAdvice: "Tus notas reflejan interés por la biología y las ciencias de la salud. Tienes facilidad para comunicar temas complejos y trabajar con personas.",
            psychologicalAdvice: "El perfil 'Investigador' muestra empatía y vocación de servicio. Te sientes realizado ayudando a otros en temas de salud o bienestar.",
            relatedCareers: "- Psicología Clínica o Social  <br> - Trabajo Social en Salud  <br> - Terapia Ocupacional  <br> - Educación para la Salud  <br> - Salud Comunitaria",
            compatibilityAdvice: "Esta combinación demuestra una vocación por el bienestar humano. Puedes destacar en la salud mental, la intervención social o la orientación educativa."
        }
    },
    'biomedicas': {
        'investigador': {
            academicAdvice: "Tus notas en Biología, Química y Ciencias Naturales muestran un pensamiento científico estructurado. Tienes gran atención al detalle y curiosidad por comprender los procesos de la vida.",
            psychologicalAdvice: "El perfil 'Investigador' indica que disfrutas explorar, experimentar y analizar datos. Buscas respuestas profundas y soluciones basadas en evidencia.",
            relatedCareers: "- Medicina  <br> - Bioquímica  <br> - Biotecnología  <br> - Enfermería  <br> - Fisioterapia  <br> - Genética  <br> - Farmacia  <br> - Investigación Científica",
            compatibilityAdvice: "Excelente compatibilidad: tu curiosidad natural y tus capacidades académicas te permitirán contribuir al avance de la ciencia y la salud."
        },
        'social': {
            academicAdvice: "Tus notas en Ciencias Sociales y Comunicación muestran comprensión del entorno humano. Puedes aplicar tu formación científica para educar o gestionar programas de salud.",
            psychologicalAdvice: "El perfil 'Investigador' revela pensamiento crítico y analítico. Combinarlo con tu sensibilidad social te convierte en un gran comunicador científico o gestor en salud.",
            relatedCareers: "- Gestión en Salud  <br> - Educación Científica  <br> - Divulgación Científica  <br> - Bioética Aplicada  <br> - Salud Pública",
            compatibilityAdvice: "Tienes un perfil ideal para unir la ciencia y la sociedad. Puedes liderar programas educativos o de impacto sanitario."
        },
        'realista': {
            academicAdvice: "Tus notas en Matemática, Física y Biología demuestran una mente estructurada y lógica. Refuerza tus capacidades en modelado de sistemas biológicos, robótica médica y análisis de datos en salud.",
            psychologicalAdvice: "El perfil 'Realista' destaca por la precisión, la observación y la curiosidad científica. Buscas aplicar la tecnología para mejorar la vida.",
            relatedCareers: "- Ingeniería Biomédica  <br> - Ciencia de Datos en Salud  <br> - Robótica Médica  <br> - Inteligencia Artificial en Medicina  <br> - Bioinformática",
            compatibilityAdvice: "Una de las combinaciones más prometedoras del futuro: unir biología, ingeniería y tecnología para revolucionar la salud."
        }
    },
};

// Recomendación por defecto
const FALLBACK_RECOMMENDATION: Recommendation = {
    academicAdvice: "Sigue explorando tus cursos. Identifica si te inclinas más por las ciencias, las letras o los números. ¡Cada nota es una pista!",
    psychologicalAdvice: "Tu perfil de intereses es único. Sigue aprendiendo sobre las diferentes áreas de RIASEC para entender mejor tus motivaciones.",
    relatedCareers: "El mundo está lleno de opciones. Investiga diferentes campos como tecnología, salud, artes, educación y negocios.",
    compatibilityAdvice: "Aún estamos conociéndote. Al completar ambos tests, podremos darte una recomendación mucho más precisa. ¡Estás en el camino correcto!"
};

/**
 * Devuelve la recomendación basada en la combinación de carrera académica y perfil psicológico.
 */
export function getRecommendation(academicResult: string, psychologicalResult: string): Recommendation {
    // academicResult y psychologicalResult ya vienen normalizados (minúsculas, sin tildes)
    const academicArea = CAREER_MAP[academicResult] || academicResult;
    const psychologicalProfile = psychologicalResult;

    if (academicArea && psychologicalProfile && MATRIX[academicArea]?.[psychologicalProfile]) {
        return MATRIX[academicArea][psychologicalProfile];
    }
    
    return FALLBACK_RECOMMENDATION;
}
