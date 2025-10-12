'use client';

export const mockUniversities = [
    { 
        id: 'unmsm', 
        name: 'Universidad Nacional Mayor de San Marcos',
        studentScore: 1450,
        cutoffScore: 1300,
        probability: 78,
        recommendation: 'Tu puntaje es competitivo. Concéntrate en repasar los temas de Química y Biología para asegurar tu vacante en el Área de Ciencias de la Salud.',
        area: 'Salud',
        region: 'Lima',
        cost: 450,
        employability: 87,
    },
    { 
        id: 'uni', 
        name: 'Universidad Nacional de Ingeniería',
        studentScore: 1280,
        cutoffScore: 1550,
        probability: 45,
        recommendation: 'Necesitas mejorar Razonamiento Matemático (+12%) y Física (+10%) para alcanzar el corte en Ingeniería de Sistemas. ¡Intensifica tu preparación!',
        area: 'Ingeniería',
        region: 'Lima',
        cost: 500,
        employability: 92,
    },
    { 
        id: 'pucp', 
        name: 'Pontificia Universidad Católica del Perú',
        studentScore: 1600,
        cutoffScore: 1500,
        probability: 85,
        recommendation: 'Tu puntaje es excelente para el Área de Humanidades. Asegura tu preparación en redacción y comprensión lectora para destacar aún más.',
        area: 'Humanidades',
        region: 'Lima',
        cost: 1500,
        employability: 90,
    },
    {
        id: 'unsa',
        name: 'Universidad Nacional de San Agustín',
        area: 'Ingeniería',
        region: 'Arequipa',
        cost: 300,
        employability: 85,
    },
     {
        id: 'utec',
        name: 'Universidad de Ingeniería y Tecnología (UTEC)',
        area: 'Ingeniería',
        region: 'Lima',
        cost: 1200,
        employability: 91,
    }
];

export const regions = ["Lima", "Arequipa", "La Libertad", "Cusco", "Piura"];
export const academicAreas = ["Salud", "Ingeniería", "Humanidades", "Ciencias Sociales", "Artes"];

export const mockRoadmapTasks = [
    { id: 'task-1', label: 'Inscribirse al Examen de Admisión UNMSM', completed: true },
    { id: 'task-2', label: 'Subir Constancia de Logros de Aprendizaje (CLA)', completed: true },
    { id: 'task-3', label: 'Completar simulacro del Examen Nacional de Preselección (ENP)', completed: false },
    { id: 'task-4', label: 'Reunir documentos para Beca 18 (DNI, Certificados, etc.)', completed: false },
    { id: 'task-5', label: 'Verificar cronograma de inscripción de la UNI', completed: false },
    { id: 'task-6', label: 'Realizar pago por derecho de inscripción', completed: false },
];
