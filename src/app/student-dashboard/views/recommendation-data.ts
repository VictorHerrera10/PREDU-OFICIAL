'use client';

type CareerArea = 'Ingenierías' | 'Sociales' | 'Biomedicas';
type RiasecProfile = 'Realista' | 'Investigador' | 'Social' | 'Emprendedor' | 'Convencional' | 'Artistico';

type Recommendation = {
    academicAdvice: string;
    psychologicalAdvice: string;
    opportunities: string;
    compatibilityAdvice: string;
};

// Mapeo de la predicción de la API a nuestras áreas de carrera
const CAREER_MAP: Record<string, CareerArea> = {
    'Ingenieria de Sistemas': 'Ingenierías',
    'Ingenieria Electronica': 'Ingenierías',
    'Ingenieria de Software': 'Ingenierías',
    'Ciencias Sociales': 'Sociales',
    'Psicologia': 'Sociales',
    'Ciencias de la Salud': 'Biomedicas',
    'Medicina': 'Biomedicas',
};

// Mapeo del resultado RIASEC a un perfil más general si es necesario
const RIASEC_MAP: Record<string, RiasecProfile> = {
    realista: 'Realista',
    investigador: 'Investigador',
    artistico: 'Artistico',
    artístico: 'Artistico',
    social: 'Social',
    emprendedor: 'Emprendedor',
    convencional: 'Convencional',
};

const MATRIX: Record<CareerArea, Partial<Record<RiasecProfile, Recommendation>>> = {
    Ingenierías: {
        Realista: {
            academicAdvice: "Si tus notas en Matemáticas y Ciencia y Tecnología son fuertes, ¡Ingeniería es para ti! Fortalece áreas como programación y cálculo.",
            psychologicalAdvice: "Tu perfil 'Realista' es perfecto para trabajar en proyectos técnicos o prácticos.",
            opportunities: "Ingeniería en sistemas, Electrónica, Civil, Mecánica, Industrial, Telecomunicaciones.",
            compatibilityAdvice: "Tu perfil 'Realista' y tus buenas notas en Ciencias Exactas hacen que Ingeniería sea la opción ideal."
        },
        Investigador: {
            academicAdvice: "Tus altas notas en Matemáticas y Ciencia y Tecnología son una base excelente. Considera especializarte en áreas de I+D dentro de la ingeniería.",
            psychologicalAdvice: "Tu perfil 'Investigador' te impulsa a resolver problemas complejos y a innovar. La ingeniería de software o la investigación tecnológica son ideales.",
            opportunities: "Ingeniería de Software, Investigación y Desarrollo, Ciencia de Datos, Ingeniería Aeroespacial.",
            compatibilityAdvice: "La combinación de un pensador analítico ('Investigador') con una base sólida en ciencias te convierte en un innovador en potencia en el campo de la ingeniería."
        },
         Convencional: {
            academicAdvice: "Tus buenas notas en Matemáticas te dan una base sólida. El orden y la estructura son tus aliados en carreras de gestión de proyectos tecnológicos.",
            psychologicalAdvice: "El perfil 'Convencional' te permitirá gestionar proyectos, procesos y planificación con eficacia.",
            opportunities: "Gestión de Proyectos de TI, Ingeniería Industrial con enfoque en procesos, Planificación de producción.",
            compatibilityAdvice: "Tu afinidad por la estructura y tus habilidades numéricas encajan perfectamente en roles que organizan y optimizan sistemas complejos."
        },
    },
    Sociales: {
        Social: {
            academicAdvice: "Si tus mejores notas están en Comunicación, Desarrollo Personal y Ciencias Sociales, las Ciencias Sociales son perfectas para ti.",
            psychologicalAdvice: "Tu perfil 'Social' es ideal para trabajos que impliquen ayudar a otros o liderazgo.",
            opportunities: "Psicología, Sociología, Trabajo Social, Marketing, Gestión de Recursos Humanos.",
            compatibilityAdvice: "El perfil 'Social' y tus buenas notas en Ciencias Sociales indican que este es tu camino."
        },
        Emprendedor: {
            academicAdvice: "Tus fortalezas en Comunicación y Ciencias Sociales son clave. Liderar proyectos sociales o crear tu propia ONG podría ser tu vocación.",
            psychologicalAdvice: "El perfil 'Emprendedor' te da la visión y la energía para liderar iniciativas de impacto social.",
            opportunities: "Dirección de ONGs, Consultoría de impacto social, Emprendimiento Social, Marketing Estratégico.",
            compatibilityAdvice: "Combinas la empatía ('Social') con la acción ('Emprendedor'), una fórmula poderosa para generar cambios positivos."
        }
    },
    Biomedicas: {
        Investigador: {
            academicAdvice: "Si tienes buenas notas en Ciencia y Tecnología, ¡Biomedicas es tu opción! Revisa ciencias de la salud.",
            psychologicalAdvice: "Tu perfil 'Investigador' es ideal para trabajos que requieren análisis detallado y trabajo en laboratorio.",
            opportunities: "Medicina, Bioquímica, Enfermería, Fisioterapia, Biotecnología, Investigación en salud.",
            compatibilityAdvice: "Las notas en Biología y Química y el perfil 'Investigador' se alinean perfectamente con Biomedicas."
        },
        Social: {
            academicAdvice: "Tus notas en Ciencia y Tecnología y Desarrollo Personal son una combinación interesante. Carreras que unen la ciencia con el trato humano son para ti.",
            psychologicalAdvice: "Tu perfil 'Social' es perfecto para roles en salud comunitaria o trabajo directo con pacientes.",
            opportunities: "Medicina Familiar, Enfermería, Terapia Ocupacional, Salud Comunitaria, Fisioterapia.",
            compatibilityAdvice: "Tu perfil 'Social' y tus notas en ciencias te llevan hacia una carrera en bienestar y apoyo directo a las personas."
        },
        Realista: {
            academicAdvice: "Tus buenas notas en Ciencia y Tecnología y tu habilidad para lo práctico te abren puertas en áreas aplicadas de la salud.",
            psychologicalAdvice: "Tu perfil 'Realista' se alinea muy bien para trabajar con tecnologías y procedimientos aplicados a la salud.",
            opportunities: "Tecnología Médica, Ingeniería Biomédica, Radiología, Técnico de laboratorio.",
            compatibilityAdvice: "Tus habilidades prácticas ('Realista') y tu base científica hacen que las carreras de tecnología en salud sean un camino ideal."
        }
    },
};

const FALLBACK_RECOMMENDATION: Recommendation = {
    academicAdvice: "Sigue explorando tus cursos. Identifica si te inclinas más por las ciencias, las letras o los números. ¡Cada nota es una pista!",
    psychologicalAdvice: "Tu perfil de intereses es único. Sigue aprendiendo sobre las diferentes áreas de RIASEC para entender mejor tus motivaciones.",
    opportunities: "El mundo está lleno de opciones. Investiga diferentes campos como tecnología, salud, artes, educación y negocios.",
    compatibilityAdvice: "Aún estamos conociéndote. Al completar ambos tests, podremos darte una recomendación mucho más precisa. ¡Estás en el camino correcto!"
};


export function getRecommendation(academicResult: string, psychologicalResult: string): Recommendation {
    const careerArea = CAREER_MAP[academicResult];
    const riasecProfile = RIASEC_MAP[psychologicalResult.toLowerCase()];

    if (careerArea && riasecProfile) {
        const specificRecommendation = MATRIX[careerArea]?.[riasecProfile];
        if (specificRecommendation) {
            return specificRecommendation;
        }
        
        // Fallback si no hay una combinación exacta pero sí tenemos el área de carrera
        const genericCareerRecommendation = Object.values(MATRIX[careerArea])[0];
        if(genericCareerRecommendation){
            return {
                ...genericCareerRecommendation,
                // Add a note that this is a more generic recommendation
                 compatibilityAdvice: `Aunque tu perfil '${riasecProfile}' no es una pareja clásica para el área de '${careerArea}', tus habilidades académicas son un gran punto de partida. ${genericCareerRecommendation.compatibilityAdvice}`
            };
        }
    }

    return FALLBACK_RECOMMENDATION;
}
