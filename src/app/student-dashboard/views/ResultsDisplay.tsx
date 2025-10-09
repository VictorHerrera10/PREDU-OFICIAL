'use client';

import { useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { questions, CATEGORY_DETAILS, TestSection, QuestionCategory } from './psychological-test-data';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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

const chartConfig = {
    realista: { label: "Realista", color: "hsl(var(--chart-1))" },
    investigador: { label: "Investigador", color: "hsl(var(--chart-2))" },
    artistico: { label: "Artístico", color: "hsl(var(--chart-3))" },
    social: { label: "Social", color: "hsl(var(--chart-4))" },
    emprendedor: { label: "Emprendedor", color: "hsl(var(--chart-5))" },
    convencional: { label: "Convencional", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

function GeneralPieChart({ data }: { data: ResultCounts }) {
    const chartData = useMemo(() => {
        return (Object.keys(data) as QuestionCategory[])
            .map(category => ({
                name: CATEGORY_DETAILS[category].label || category,
                value: data[category].yes,
                fill: `var(--color-${category})`,
            }))
            .filter(item => item.value > 0);
    }, [data]);


    const chartConfigWithColors = Object.keys(CATEGORY_DETAILS).reduce((acc, key) => {
        const categoryKey = key as QuestionCategory;
        const colorName = CATEGORY_DETAILS[categoryKey].colorClass;
        
        let colorValue = '';
        switch(colorName) {
            case 'green': colorValue = '#4ade80'; break; // green-400
            case 'blue': colorValue = '#60a5fa'; break; // blue-400
            case 'purple': colorValue = '#a78bfa'; break; // purple-400
            case 'pink': colorValue = '#f472b6'; break; // pink-400
            case 'amber': colorValue = '#facc15'; break; // amber-400
            case 'teal': colorValue = '#2dd4bf'; break; // teal-400
            default: colorValue = '#8884d8';
        }

        acc[categoryKey] = {
            label: CATEGORY_DETAILS[categoryKey].label,
            color: colorValue,
        };
        return acc;
    }, {} as ChartConfig);

    return (
         <Card className="bg-background/50 flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl text-primary">Resumen General de Intereses (Sí)</CardTitle>
                <CardDescription>Visualización de tus áreas de mayor interés basadas en tus respuestas afirmativas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfigWithColors}
                    className="mx-auto aspect-square h-[250px]"
                >
                    <ResponsiveContainer>
                        <PieChart>
                             <Tooltip
                                content={<ChartTooltipContent nameKey="value" hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <Legend
                                content={({ payload }) => {
                                    return (
                                        <ul className="grid grid-cols-3 gap-x-4 gap-y-1 mt-4 text-sm text-muted-foreground">
                                            {payload?.map((entry) => (
                                                <li key={`item-${entry.value}`} className="flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    {entry.value}
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ResultsTable title="Resultados de Actividades" data={results.actividades} />
                <ResultsTable title="Resultados de Habilidades" data={results.habilidades} />
                <ResultsTable title="Resultados de Ocupaciones" data={results.ocupaciones} />
            </div>

             <div className="mt-8">
                <GeneralPieChart data={results.general} />
            </div>
        </div>
    );
}
