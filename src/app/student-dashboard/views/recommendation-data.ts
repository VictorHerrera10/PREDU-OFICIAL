'use client';

type CareerArea = 'Ingenierías' | 'Sociales' | 'Biomedicas';

type Recommendation = {
    academicAdvice: string;
    psychologicalAdvice: string;
    relatedCareers: string;
    compatibilityAdvice: string;
};

// Mapeo de la predicción de la API a nuestras áreas de carrera
const CAREER_MAP: Record<string, CareerArea> = {
    'Ingenieria de Sistemas': 'Ingenierías',
    'Ingenieria Electronica': 'Ingenierías',
    'Ingenieria de Software': 'Ingenierías',
    'Ingenierias': 'Ingenierías',
    'Ingeniería de Sistemas': 'Ingenierías',
    'Ingeniería Electronica': 'Ingenierías',
    'Ingeniería de Software': 'Ingenierías',
    'Ingenierías': 'Ingenierías',
    'Sociales': 'Sociales',
    'Ciencias Sociales': 'Sociales',
    'Psicologia': 'Sociales',
    'Biomedicas': 'Biomedicas',
    'Ciencias de la Salud': 'Biomedicas',
    'Medicina': 'Biomedicas',
};

// Mapeo del resultado RIASEC a un perfil más general si es necesario
const RIASEC_MAP: Record<string, CareerArea> = {
    realista: 'Ingenierías',
    investigador: 'Biomedicas',
    artistico: 'Sociales',
    social: 'Sociales',
    emprendedor: 'Sociales',
    convencional: 'Ingenierías',
};

const MATRIX: Partial<Record<CareerArea, Partial<Record<CareerArea, Recommendation>>>> = {
    Ingenierías: {
        Ingenierías: {
            academicAdvice: "Tus notas reflejan un excelente dominio en Matemática, Física y Tecnología, lo que muestra una mente lógica y resolutiva. Refuerza tus conocimientos en programación, análisis de datos y diseño de sistemas para ampliar tu campo profesional.",
            psychologicalAdvice: "El perfil \"Realista\" indica que disfrutas resolver problemas concretos, crear estructuras y trabajar con herramientas o sistemas. Prefieres actividades que te permitan construir y ver resultados tangibles.",
            relatedCareers: "- Ingeniería de Sistemas <br> - Ingeniería Civil <br> - Ingeniería Electrónica <br> - Ingeniería Mecánica <br> - Ingeniería Industrial <br> - Ingeniería en Telecomunicaciones <br> - Robótica y Mecatrónica",
            compatibilityAdvice: "Tu perfil vocacional y tu rendimiento académico están completamente alineados. Estás preparado para destacar en el ámbito tecnológico y productivo. Aprovecha tu capacidad analítica para liderar proyectos innovadores y tecnológicos."
        },
        Sociales: {
            academicAdvice: "Tus calificaciones reflejan solidez en comunicación y pensamiento crítico. Puedes aplicar tus habilidades sociales en la gestión de proyectos tecnológicos o en áreas de innovación social.",
            psychologicalAdvice: "Tu perfil \"Realista\" se orienta a lo técnico, pero puede adaptarse a la planificación y coordinación. Disfrutas aplicar métodos y ver resultados en contextos con impacto social.",
            relatedCareers: "- Gestión de Proyectos Sociales <br> - Marketing Tecnológico <br> - Innovación Social <br> - Consultoría en Transformación Digital <br> - Diseño de Servicios",
            compatibilityAdvice: "Esta mezcla te convierte en un profesional estratégico: sabes conectar la tecnología con las personas. Perfecto para roles de gestión o innovación con impacto social."
        },
        Biomedicas: {
            academicAdvice: "Tus buenas notas en ciencias exactas y biología revelan un perfil técnico con sensibilidad científica. Refuerza tus conocimientos en tecnología médica y procesamiento de datos biológicos.",
            psychologicalAdvice: "Tu perfil \"Realista-Investigador\" combina precisión técnica y curiosidad científica. Te motiva aplicar la ingeniería al cuidado y bienestar humano.",
            relatedCareers: "- Ingeniería Biomédica <br> - Bioinformática <br> - Biotecnología Aplicada <br> - Diseño de Prótesis <br> - Instrumentación Médica",
            compatibilityAdvice: "Tienes una mezcla excepcional entre ciencia y tecnología. Estás orientado hacia el futuro de la salud y la innovación médica."
        }
    },
    Sociales: {
        Sociales: {
            academicAdvice: "Tu desempeño en Ciencias Sociales, Comunicación, Lenguaje y Literatura revela habilidades destacadas para analizar, comunicar y empatizar. Potencia tu pensamiento crítico y tus habilidades de expresión oral y escrita.",
            psychologicalAdvice: "El perfil \"Social\" refleja empatía, cooperación y orientación al servicio. Te motiva ayudar, enseñar y trabajar en equipo para mejorar la vida de los demás.",
            relatedCareers: "- Psicología <br> - Educación <br> - Sociología <br> - Trabajo Social <br> - Comunicación Social <br> - Marketing <br> - Recursos Humanos <br> - Relaciones Públicas",
            compatibilityAdvice: "Tienes una clara vocación humanista y social. Tu capacidad de escucha y comunicación te permitirá influir positivamente en las personas y comunidades."
        },
        Ingenierías: {
            academicAdvice: "Tus notas en Matemática y Física muestran razonamiento lógico y pensamiento estructurado. Complementa tu perfil social con formación en gestión tecnológica o análisis de datos.",
            psychologicalAdvice: "El perfil \"Social\" indica que te motiva coordinar, enseñar y guiar a otros. Eres ideal para dirigir equipos técnicos y promover el desarrollo organizacional.",
            relatedCareers: "- Ingeniería Industrial <br> - Gestión Tecnológica <br> - Emprendimiento Social <br> - Educación STEM <br> - Gestión de Innovación",
            compatibilityAdvice: "Eres un perfil híbrido con liderazgo y visión técnica. Perfecto para combinar el lado humano con la eficiencia tecnológica."
        },
        Biomedicas: {
            academicAdvice: "Tus notas reflejan interés por la biología y las ciencias de la salud. Tienes facilidad para comunicar temas complejos y trabajar con personas.",
            psychologicalAdvice: "Tu perfil \"Social\" muestra empatía y vocación de servicio. Te sientes realizado ayudando a otros en temas de salud o bienestar.",
            relatedCareers: "- Psicología Clínica o Social <br> - Trabajo Social en Salud <br> - Terapia Ocupacional <br> - Educación para la Salud <br> - Salud Comunitaria",
            compatibilityAdvice: "Esta combinación demuestra una vocación por el bienestar humano. Puedes destacar en la salud mental, la intervención social o la orientación educativa."
        }
    },
    Biomedicas: {
        Biomedicas: {
            academicAdvice: "Tus notas en Biología, Química y Ciencias Naturales muestran un pensamiento científico estructurado. Tienes gran atención al detalle y curiosidad por comprender los procesos de la vida.",
            psychologicalAdvice: "El perfil \"Investigador\" indica que disfrutas explorar, experimentar y analizar datos. Buscas respuestas profundas y soluciones basadas en evidencia.",
            relatedCareers: "- Medicina <br> - Bioquímica <br> - Biotecnología <br> - Enfermería <br> - Fisioterapia <br> - Genética <br> - Farmacia <br> - Investigación Científica",
            compatibilityAdvice: "Excelente compatibilidad: tu curiosidad natural y tus capacidades académicas te permitirán contribuir al avance de la ciencia y la salud."
        },
        Sociales: {
            academicAdvice: "Tus notas en Ciencias Sociales y Comunicación muestran comprensión del entorno humano. Puedes aplicar tu formación científica para educar o gestionar programas de salud.",
            psychologicalAdvice: "Tu perfil \"Investigador\" revela pensamiento crítico y analítico. Combinarlo con tu sensibilidad social te convierte en un gran comunicador científico o gestor en salud.",
            relatedCareers: "- Gestión en Salud <br> - Educación Científica <br> - Divulgación Científica <br> - Bioética Aplicada <br> - Salud Pública",
            compatibilityAdvice: "Tienes un perfil ideal para unir la ciencia y la sociedad. Puedes liderar programas educativos o de impacto sanitario."
        },
        Ingenierías: {
            academicAdvice: "Tus notas en Matemática, Física y Biología demuestran una mente estructurada y lógica. Refuerza tus capacidades en modelado de sistemas biológicos, robótica médica y análisis de datos en salud.",
            psychologicalAdvice: "Tu perfil \"Investigador\" destaca por la precisión, la observación y la curiosidad científica. Buscas aplicar la tecnología para mejorar la vida.",
            relatedCareers: "- Ingeniería Biomédica <br> - Ciencia de Datos en Salud <br> - Robótica Médica <br> - Inteligencia Artificial en Medicina <br> - Bioinformática",
            compatibilityAdvice: "Una de las combinaciones más prometedoras del futuro: unir biología, ingeniería y tecnología para revolucionar la salud."
        }
    },
};

const FALLBACK_RECOMMENDATION: Recommendation = {
    academicAdvice: "Sigue explorando tus cursos. Identifica si te inclinas más por las ciencias, las letras o los números. ¡Cada nota es una pista!",
    psychologicalAdvice: "Tu perfil de intereses es único. Sigue aprendiendo sobre las diferentes áreas de RIASEC para entender mejor tus motivaciones.",
    relatedCareers: "El mundo está lleno de opciones. Investiga diferentes campos como tecnología, salud, artes, educación y negocios.",
    compatibilityAdvice: "Aún estamos conociéndote. Al completar ambos tests, podremos darte una recomendación mucho más precisa. ¡Estás en el camino correcto!"
};

export function getRecommendation(academicResult: string, psychologicalResult: string): Recommendation {
    const academicArea = CAREER_MAP[academicResult] || null;
    const psychologicalAreaKey = psychologicalResult.toLowerCase();
    const psychologicalArea = RIASEC_MAP[psychologicalAreaKey] as CareerArea | undefined;

    if (academicArea && psychologicalArea) {
        const specificRecommendation = MATRIX[academicArea]?.[psychologicalArea];
        if (specificRecommendation) {
            return specificRecommendation;
        }
    }
    
    // Fallback genérico si no se encuentra una coincidencia directa.
    return FALLBACK_RECOMMENDATION;
}
