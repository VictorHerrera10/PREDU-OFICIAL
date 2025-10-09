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
    'Ingenierias': 'Ingenierías', // Match a la prediccion psicologica
    'Sociales': 'Sociales', // Match a la prediccion psicologica
    'Ciencias Sociales': 'Sociales',
    'Psicologia': 'Sociales',
    'Biomedicas': 'Biomedicas', // Match a la prediccion psicologica
    'Ciencias de la Salud': 'Biomedicas',
    'Medicina': 'Biomedicas',
};

// Mapeo del resultado RIASEC a un perfil más general si es necesario
const RIASEC_MAP: Record<string, RiasecProfile> = {
    realista: 'Realista',
    investigador: 'Investigador',
    artistico: 'Artistico',
    social: 'Social',
    emprendedor: 'Emprendedor',
    convencional: 'Convencional',
};

const MATRIX: Partial<Record<CareerArea, Partial<Record<CareerArea, Recommendation>>>> = {
    Ingenierías: {
        Ingenierías: {
            academicAdvice: "Si destacas en Matemática ➗ y Física ⚛️, refuerza programación 💻 y cálculo 📊 para una base sólida.",
            psychologicalAdvice: "Tu perfil \"Realista\" 🔨 refleja habilidades prácticas y técnicas.",
            opportunities: "Ingeniería de Sistemas, Civil, Electrónica, Industrial, Mecánica, Telecomunicaciones. 🚀",
            compatibilityAdvice: "Coincidencia total 🎯. Tu perfil y tus notas se alinean perfectamente con Ingeniería. 💪"
        },
        Sociales: {
            academicAdvice: "Tus notas reflejan fuerza en comunicación y análisis social. Podrías explorar gestión o innovación aplicada.",
            psychologicalAdvice: "El perfil \"Realista\" 🔨 se adapta bien a la aplicación técnica en entornos humanos.",
            opportunities: "Gestión de Proyectos Sociales, Innovación Tecnológica, Marketing Técnico. 📊",
            compatibilityAdvice: "Interdisciplinario: puedes conectar tecnología y sociedad, ideal para liderazgo técnico-social. 🌐"
        },
        Biomedicas: {
            academicAdvice: "Notas altas en Biología y Química te dan una base en salud.",
            psychologicalAdvice: "El perfil \"Realista\" ⚙️ favorece el trabajo en tecnología aplicada a la salud.",
            opportunities: "Ingeniería Biomédica, Tecnología Médica, Diseño de Dispositivos Médicos. 🧠",
            compatibilityAdvice: "Gran sinergia entre lo técnico y lo biológico: la salud tecnológica es tu campo ideal. 🏥"
        }
    },
    Sociales: {
        Sociales: {
            academicAdvice: "Si sobresales en Ciencias Sociales, Comunicación y Literatura, continúa fortaleciendo la argumentación y empatía.",
            psychologicalAdvice: "Tu perfil \"Social\" 👥 indica orientación al trabajo en equipo y ayuda a los demás.",
            opportunities: "Psicología, Educación, Sociología, Trabajo Social, Marketing, RR.HH. 🌟",
            compatibilityAdvice: "Perfecta compatibilidad. Tu vocación y tu rendimiento se dirigen hacia lo humano y social. 🤝"
        },
        Ingenierías: {
            academicAdvice: "Tus notas muestran lógica y razonamiento cuantitativo. Refuerza gestión y análisis de datos. 📈",
            psychologicalAdvice: "El perfil \"Social\" 👥 destaca empatía y comunicación.",
            opportunities: "Gestión de Proyectos, Ingeniería Industrial, Innovación Social Tecnológica. ⚙️",
            compatibilityAdvice: "Tu perfil humano combinado con capacidad analítica te hace ideal para la gestión tecnológica. 🤝💡"
        },

        Biomedicas: {
            academicAdvice: "Buen desempeño en Ciencias Naturales y Biología.",
            psychologicalAdvice: "Tu perfil \"Social\" 👥 encaja con profesiones de ayuda y salud mental.",
            opportunities: "Psicología Social, Trabajo Social en Salud, Terapia Ocupacional. 🌿",
            compatibilityAdvice: "Orientación clara al bienestar y la comunidad: ideal para áreas sociales en salud. ❤️"
        }
    },
    Biomedicas: {
        Biomedicas: {
            academicAdvice: "Si tienes buenas notas en Biología 🧬, Química 🧪 y Ciencias Naturales, sigue reforzando tu lado analítico.",
            psychologicalAdvice: "Tu perfil \"Investigador\" 🔬 te impulsa a la observación y experimentación científica.",
            opportunities: "Medicina, Bioquímica, Biotecnología, Enfermería, Fisioterapia, Investigación en salud. 🧫",
            compatibilityAdvice: "Coincidencia ideal. Tu perfil científico y tus notas apuntan a las Ciencias de la Salud. 👨‍⚕️"
        },
        Sociales: {
            academicAdvice: "Fortalece tus habilidades comunicativas y de liderazgo para aplicar el conocimiento científico. 🧬📢",
            psychologicalAdvice: "El perfil \"Investigador\" 🔬 se enfoca en el análisis profundo y los datos.",
            opportunities: "Salud Pública, Gestión de la Salud, Educación Científica, Divulgación Científica. 🧑‍🔬",
            compatibilityAdvice: "Ideal para unir ciencia y comunicación, orientado a la educación o gestión sanitaria. 🌍"
        },
        Ingenierías: {
            academicAdvice: "Tienes alta capacidad en Matemáticas y Física: aprovecha para dominar la programación aplicada a biología. 💻",
            psychologicalAdvice: "El perfil \"Investigador\" 🔬 indica curiosidad y precisión técnica.",
            opportunities: "Ingeniería Biomédica, Bioinformática, Ciencias de Datos en Salud. 🧠",
            compatibilityAdvice: "Excelente combinación para desarrollar soluciones tecnológicas en medicina. 🚀"
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
    // La prediccion academica puede ser "Ingenieria de Sistemas", la psicologica "investigador"
    // El psicologico puede ser una de las 6 categorias, o una de las 3 carreras
    const academicArea = CAREER_MAP[academicResult];
    const psychologicalArea = CAREER_MAP[psychologicalResult]; // Puede ser una carrera como 'Ingenierias'

    if (academicArea && psychologicalArea) {
        const specificRecommendation = MATRIX[academicArea]?.[psychologicalArea];
        if (specificRecommendation) {
            return specificRecommendation;
        }
    }
    
    // Fallback genérico si no se encuentra una coincidencia directa.
    return FALLBACK_RECOMMENDATION;
}
