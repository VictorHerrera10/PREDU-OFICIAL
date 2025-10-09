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
    ingenierias: 'Ingenierías',
    sociales: 'Sociales',
    biomedicas: 'Biomedicas'
};

const MATRIX: Partial<Record<CareerArea, Partial<Record<CareerArea, Recommendation>>>> = {
    Ingenierías: {
        Ingenierías: {
            academicAdvice: "Tus resultados académicos reflejan un dominio sólido de las áreas cuantitativas, especialmente **Matemática**, **Física** y **Lógica**. Esto indica que posees una mente analítica, orientada al razonamiento abstracto y la resolución de problemas. Se recomienda continuar fortaleciendo competencias en **programación**, **estadística**, **modelado matemático** y **pensamiento computacional**, ya que serán fundamentales para tu desarrollo profesional. Además, trabajar en proyectos que involucren el diseño o la automatización puede ayudarte a aplicar tus conocimientos en contextos reales.",
            psychologicalAdvice: "Tu perfil **\"Realista\"** 🔨 del modelo RIASEC indica que disfrutas de actividades prácticas, concretas y técnicas. Prefieres trabajar con herramientas, máquinas o sistemas, y te motiva ver resultados tangibles de tu trabajo. Esto sugiere que tu vocación está orientada hacia la creación, el mantenimiento y la mejora de estructuras o procesos. Disfrutas de los retos técnicos y de aplicar soluciones lógicas a problemas reales.",
            relatedCareers: "Ingeniería de Sistemas, Electrónica, Civil, Mecánica, Industrial, Telecomunicaciones, Robótica, Mecatrónica. 🚀",
            compatibilityAdvice: "La compatibilidad entre tus notas y tu perfil vocacional es sobresaliente 🎯. Posees tanto las habilidades como la motivación interna para sobresalir en las Ingenierías. Tu mente analítica y tu enfoque práctico se complementan perfectamente. Enfócate en desarrollar competencias blandas como **trabajo en equipo**, **comunicación técnica** y **liderazgo en proyectos**, ya que potenciarán aún más tu perfil profesional. 💪"
        },
        Sociales: {
            academicAdvice: "Tus notas en Ciencias Sociales reflejan un dominio en comunicación y pensamiento crítico, lo que te da ventaja en la **gestión de equipos**, **liderazgo organizacional** y **análisis estratégico**. Aunque tu enfoque académico no es puramente técnico, podrías fortalecer tus bases en **análisis de datos**, **estadística aplicada** y **pensamiento lógico** para integrarte a entornos tecnológicos.",
            psychologicalAdvice: "El perfil **\"Realista\"** 🔨 sugiere preferencia por lo concreto y estructurado. Te gusta crear soluciones tangibles y aplicar herramientas técnicas. Esta combinación te orienta a **roles de gestión o innovación tecnológica**, donde puedas conectar personas y procesos.",
            relatedCareers: "Gestión de Proyectos Sociales, Marketing Tecnológico, Innovación Social, Diseño de Servicios, Consultoría en Transformación Digital. 📊",
            compatibilityAdvice: "Una combinación muy valiosa: tu enfoque social y tu capacidad técnica pueden convertirte en un **puente entre la tecnología y las personas**. Aprovecha tu empatía y tu disciplina para asumir roles de liderazgo en proyectos de innovación con impacto social. 🌐"
        },
        Biomedicas: {
            academicAdvice: "Tus notas en áreas científicas y matemáticas muestran una excelente capacidad para el análisis numérico y la comprensión de procesos naturales. Eres capaz de conectar la lógica de la ingeniería con los fundamentos biológicos. Te recomiendo fortalecer conocimientos en **física médica**, **circuitos biomédicos** y **análisis de datos en salud**.",
            psychologicalAdvice: "Tu perfil **\"Realista-Investigador\"** combina precisión técnica y curiosidad científica. Te interesa aplicar la ingeniería al bienestar humano, lo que indica una orientación hacia la tecnología médica o la investigación aplicada.",
            relatedCareers: "Ingeniería Biomédica, Bioinformática, Diseño de Prótesis, Instrumentación Médica, Biotecnología Aplicada. 🧠",
            compatibilityAdvice: "Esta combinación representa el futuro de la innovación en salud. Posees el equilibrio entre la lógica técnica y la sensibilidad biológica, ideal para crear soluciones que mejoren la calidad de vida de las personas. 🏥"
        }
    },
    Sociales: {
        Sociales: {
            academicAdvice: "Tus calificaciones en áreas como **Ciencias Sociales**, **Comunicación**, **Literatura** y **Lenguaje** demuestran una fuerte capacidad para **analizar, comunicar y comprender contextos humanos y sociales**. Tienes habilidades para expresarte con claridad, interpretar situaciones sociales y construir argumentos sólidos. Te beneficiarías de fortalecer competencias en **pensamiento crítico**, **oratoria**, **investigación social** y **ética profesional**, que te permitirán desempeñarte con impacto en ámbitos educativos, comunitarios o institucionales.",
            psychologicalAdvice: "Tu perfil **\"Social\"** 👥 indica una alta orientación hacia la cooperación, la empatía y el liderazgo positivo. Te motiva el trabajo con personas, la ayuda mutua y la mejora de la sociedad. Prefieres entornos colaborativos donde puedas comunicar, enseñar o inspirar. Además, tu naturaleza empática te hace ideal para roles que requieren comprensión emocional y trabajo en grupo.",
            relatedCareers: "Psicología, Educación, Sociología, Trabajo Social, Marketing, Gestión de Recursos Humanos, Comunicación Social, Relaciones Públicas. 🌟",
            compatibilityAdvice: "La compatibilidad es excelente: tu desempeño académico y tu vocación apuntan hacia el desarrollo humano. Tienes el potencial para impactar en el bienestar de los demás. 🌱 Desarrollar habilidades de **escucha activa**, **resolución de conflictos** y **liderazgo empático** consolidará tu perfil como futuro profesional del ámbito social. 🤝"
        },
        Ingenierías: {
            academicAdvice: "Tus calificaciones en Matemática y Física reflejan pensamiento estructurado y habilidad para la resolución de problemas. Si bien tu enfoque social es fuerte, puedes potenciarlo con competencias analíticas como **estadística**, **visualización de datos** y **gestión tecnológica**.",
            psychologicalAdvice: "El perfil **\"Social\"** 👥 te orienta a la colaboración, enseñanza y liderazgo. Tu interés por las personas puede ser una ventaja para dirigir equipos técnicos o coordinar proyectos de desarrollo.",
            relatedCareers: "Ingeniería Industrial, Gestión Tecnológica, Emprendimiento Social, Educación STEM. ⚙️",
            compatibilityAdvice: "Eres un **líder natural** con pensamiento técnico. Esta combinación te hace ideal para entornos de gestión y educación tecnológica, donde la empatía y la organización se combinan con la eficiencia. 💼"
        },
        Biomedicas: {
            academicAdvice: "Tus notas en Ciencias Naturales y Biología muestran una afinidad con temas de salud, mientras que tu formación social resalta tu capacidad de empatía y comunicación. Refuerza tu conocimiento en **psicología biológica**, **salud pública** y **comunicación científica**.",
            psychologicalAdvice: "Tu perfil **\"Social\"** 👥 refleja sensibilidad humana, orientación al servicio y deseo de ayudar. Eres ideal para profesiones donde la salud mental y el bienestar social son prioritarios.",
            relatedCareers: "Psicología Clínica o Social, Trabajo Social en Salud, Terapia Ocupacional, Educación para la Salud, Orientación Comunitaria. 🌿",
            compatibilityAdvice: "Esta combinación te orienta hacia carreras donde se integran el conocimiento científico y la vocación por ayudar. Tienes el potencial de transformar la vida de las personas desde la comprensión y el acompañamiento. ❤️"
        }
    },
    Biomedicas: {
        Biomedicas: {
            academicAdvice: "Tus notas demuestran un alto rendimiento en **Biología**, **Química**, **Ciencias Naturales** y **Matemática Aplicada**, lo cual evidencia un pensamiento científico estructurado y detallista. Eres capaz de analizar fenómenos biológicos y comprender procesos complejos. Se recomienda fortalecer habilidades de **laboratorio**, **bioestadística**, **métodos de investigación** y **redacción científica** para avanzar con solidez en áreas biomédicas.",
            psychologicalAdvice: "Tu perfil **\"Investigador\"** 🔬 muestra una inclinación hacia el análisis, la observación y la búsqueda constante de conocimiento. Te apasiona comprender cómo funcionan las cosas, experimentar y descubrir. Este tipo de perfil se asocia con la perseverancia, el pensamiento crítico y la curiosidad intelectual.",
            relatedCareers: "Medicina, Bioquímica, Biotecnología, Genética, Enfermería, Fisioterapia, Farmacia, Investigación Científica. 🧫",
            compatibilityAdvice: "Tu combinación es perfecta. Tienes tanto el talento académico como la motivación para una carrera científica. Mantén tu curiosidad activa y busca oportunidades en **investigaciones tempranas**, **proyectos de laboratorio** o **voluntariados en salud**. 💡"
        },
        Sociales: {
            academicAdvice: "Tus resultados en Ciencias Sociales reflejan pensamiento crítico, liderazgo y facilidad de comunicación. Complementa tu perfil con formación en **gestión sanitaria**, **educación científica** o **bioética** para aplicar tus conocimientos biomédicos en entornos sociales.",
            psychologicalAdvice: "Tu perfil **\"Investigador\"** 🔬 se asocia con el análisis y la búsqueda de conocimiento. Combinarlo con habilidades sociales te permitirá influir positivamente en políticas o educación en salud.",
            relatedCareers: "Gestión en Salud, Educación Científica, Divulgación Científica, Salud Pública, Bioética Aplicada. 🧑‍🔬",
            compatibilityAdvice: "Esta combinación es ideal para quienes desean conectar la ciencia con la sociedad. Puedes liderar proyectos de educación o comunicación en salud, impactando en comunidades y políticas públicas. 🌍"
        },
        Ingenierías: {
            academicAdvice: "Tus notas en áreas técnicas y exactas demuestran una mente estructurada, capaz de aplicar métodos cuantitativos en entornos biológicos. Fortalece conocimientos en **electrónica médica**, **procesamiento de señales biológicas** y **modelado de sistemas fisiológicos**.",
            psychologicalAdvice: "Tu perfil **\"Investigador\"** 🔬 se destaca por la precisión, la curiosidad y el pensamiento analítico. Disfrutas comprender cómo funciona el cuerpo y cómo la tecnología puede mejorarlo.",
            relatedCareers: "Ingeniería Biomédica, Ciencia de Datos en Salud, Robótica Médica, Inteligencia Artificial en Medicina, Bioinformática. 🚀",
            compatibilityAdvice: "Una combinación visionaria: unir la ingeniería con la biología te posiciona en el futuro de la medicina digital y la innovación tecnológica en salud. 🌐"
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
    const academicArea = CAREER_MAP[academicResult];
    const psychologicalArea = RIASEC_MAP[psychologicalResult.toLowerCase()];

    if (academicArea && psychologicalArea) {
        const specificRecommendation = MATRIX[academicArea]?.[psychologicalArea];
        if (specificRecommendation) {
            return specificRecommendation;
        }
    }
    
    // Fallback genérico si no se encuentra una coincidencia directa.
    return FALLBACK_RECOMMENDATION;
}
