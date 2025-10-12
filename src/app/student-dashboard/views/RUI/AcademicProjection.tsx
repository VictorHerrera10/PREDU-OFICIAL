'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Brain, Calculator, FileText, Lightbulb, TrendingUp, University, AlertTriangle } from 'lucide-react';
import { mockUniversities } from './rui-mock-data';

export function AcademicProjection() {
    const [avg4, setAvg4] = useState('');
    const [avg5, setAvg5] = useState('');
    const [meritResult, setMeritResult] = useState<{ merit: string; avg: number; scholarship: string } | null>(null);
    const [showProjection, setShowProjection] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
    
    const handleCalculateMerit = (e: React.FormEvent) => {
        e.preventDefault();
        const avg = (Number(avg4) + Number(avg5)) / 2;
        // Mock data logic
        let merit = "Medio Superior";
        if (avg >= 16) merit = "Quinto Superior";
        else if (avg >= 14) merit = "Tercio Superior";

        setMeritResult({
            merit: merit,
            avg: Number(avg.toFixed(2)),
            scholarship: avg >= 16 ? "Beca 18 Ordinaria" : "Crédito Talento",
        });
    };

    const universityData = selectedUniversity ? mockUniversities.find(u => u.id === selectedUniversity) : null;
    
    const chartData = universityData ? [
        { name: 'Tu Puntaje', value: universityData.studentScore, fill: 'hsl(var(--primary))' },
        { name: 'Puntaje de Corte', value: universityData.cutoffScore, fill: 'hsl(var(--secondary))' }
    ] : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Formulario de Notas</CardTitle>
                    <CardDescription>Ingresa tus promedios para calcular tu mérito académico.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCalculateMerit} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="w-full space-y-2">
                            <Label htmlFor="avg4">Nota Promedio 4to Año</Label>
                            <Input id="avg4" type="number" min="0" max="20" step="0.1" value={avg4} onChange={e => setAvg4(e.target.value)} placeholder="Ej: 15.5" required />
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="avg5">Nota Promedio 5to Año</Label>
                            <Input id="avg5" type="number" min="0" max="20" step="0.1" value={avg5} onChange={e => setAvg5(e.target.value)} placeholder="Ej: 17.0" required />
                        </div>
                        <Button type="submit" className="w-full sm:w-auto"><Calculator className="mr-2" /> Calcular</Button>
                    </form>
                </CardContent>
            </Card>

            <AnimatePresence>
                {meritResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Award className="text-primary"/> ¡Resultado de Mérito Académico!</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-background/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Nivel de Mérito</p>
                                    <p className="text-xl font-bold text-primary">{meritResult.merit}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Promedio General</p>
                                    <p className="text-xl font-bold text-primary">{meritResult.avg}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Cumples Requisitos para</p>
                                    <p className="text-xl font-bold text-primary">{meritResult.scholarship}</p>
                                </div>
                            </CardContent>
                             <div className="p-6 pt-0 text-center">
                                <Button onClick={() => setShowProjection(!showProjection)} variant="secondary">
                                    <TrendingUp className="mr-2" />
                                    {showProjection ? 'Ocultar Proyección de Ingreso' : 'Ver Proyección de Ingreso'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {showProjection && (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><University /> Proyección de Ingreso</CardTitle>
                                <CardDescription>Selecciona una universidad para ver tu probabilidad de ingreso simulada.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select onValueChange={setSelectedUniversity}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Elige una universidad..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockUniversities.map(uni => (
                                            <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {universityData && (
                                    <motion.div
                                        key={selectedUniversity}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Tu Puntaje Simulado</p>
                                                <p className="text-2xl font-bold text-foreground">{universityData.studentScore}</p>
                                            </div>
                                             <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Puntaje de Corte Histórico</p>
                                                <p className="text-2xl font-bold text-foreground">{universityData.cutoffScore}</p>
                                            </div>
                                            <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg text-blue-400">
                                                <p className="text-sm">Probabilidad de Ingreso</p>
                                                <p className="text-2xl font-bold">{universityData.probability}%</p>
                                            </div>
                                        </div>
                                        
                                        <div className="h-60 w-full">
                                            <ResponsiveContainer>
                                                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" hide />
                                                    <Tooltip cursor={{ fill: 'hsla(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                                                    <Bar dataKey="value" radius={[4, 4, 4, 4]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <Alert variant={universityData.probability < 50 ? "destructive" : "default"} className={universityData.probability >= 50 && universityData.probability < 75 ? "bg-yellow-600/10 border-yellow-500/30 text-yellow-400 [&>svg]:text-yellow-400" : ""}>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle className="flex items-center gap-2"><Lightbulb /> Recomendación</AlertTitle>
                                            <AlertDescription>
                                                {universityData.recommendation}
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
