'use client';

import { useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { questions, CATEGORY_DETAILS, TestSection, QuestionCategory } from './psychological-test-data';
import { cn } from '@/lib/utils';

type Answers = Record<string, 'yes' | 'no' | null>;

type ResultsDisplayProps = {
    answers: Answers;
};

type ResultCounts = {
    [key in QuestionCategory]: {
        yes: number;
        no: number;
    };
};

function calculateSectionResults(section: TestSection | 'all', answers: Answers): ResultCounts {
    const initialCounts: ResultCounts = {
        realista: { yes: 0, no: 0 },
        investigador: { yes: 0, no: 0 },
        artistico: { yes: 0, no: 0 },
        social: { yes: 0, no: 0 },
        emprendedor: { yes: 0, no: 0 },
        convencional: { yes: 0, no: 0 },
    };

    const relevantQuestions = section === 'all'
        ? questions
        : questions.filter(q => q.section === section);

    return relevantQuestions.reduce((acc, question) => {
        const answer = answers[question.id];
        if (answer === 'yes') {
            acc[question.category].yes++;
        } else if (answer === 'no') {
            acc[question.category].no++;
        }
        return acc;
    }, initialCounts);
}

function ResultsTable({ title, data }: { title: string; data: ResultCounts }) {
    const categories = Object.keys(data) as QuestionCategory[];

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle className="text-xl text-primary">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-center text-green-400">Sí</TableHead>
                            <TableHead className="text-center text-red-400">No</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map(category => {
                            const categoryInfo = CATEGORY_DETAILS[category];
                            const Icon = categoryInfo.icon;
                            return (
                                <TableRow key={category}>
                                    <TableCell className="font-medium">
                                        <div className={cn("flex items-center gap-2", categoryInfo.color)}>
                                            <Icon className="w-4 h-4" />
                                            <span className="capitalize">{category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono">{data[category].yes}</TableCell>
                                    <TableCell className="text-center font-mono">{data[category].no}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function ResultsDisplay({ answers }: ResultsDisplayProps) {
    const results = useMemo(() => {
        return {
            actividades: calculateSectionResults('actividades', answers),
            habilidades: calculateSectionResults('habilidades', answers),
            ocupaciones: calculateSectionResults('ocupaciones', answers),
            general: calculateSectionResults('all', answers),
        };
    }, [answers]);

    return (
        <div className="space-y-8">
             <CardHeader className="text-center items-center">
                <CardTitle className="text-3xl font-bold text-foreground">
                    📊 Resumen de tus Intereses
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                    Aquí tienes un desglose de tus respuestas por cada área.
                </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResultsTable title="Resultados de Actividades" data={results.actividades} />
                <ResultsTable title="Resultados de Habilidades" data={results.habilidades} />
                <ResultsTable title="Resultados de Ocupaciones" data={results.ocupaciones} />
                <ResultsTable title="Resultados Generales" data={results.general} />
            </div>
        </div>
    );
}
