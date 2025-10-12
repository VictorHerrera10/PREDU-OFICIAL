'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Search, TrendingUp, Banknote, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { mockUniversities, regions, academicAreas } from './rui-mock-data';

export function OpportunityExplorer() {
    const [filters, setFilters] = useState({ type: '', region: '', area: '' });
    const [showResults, setShowResults] = useState(false);
    const [eligibility, setEligibility] = useState<'high' | 'medium' | 'low' | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowResults(true);
        // Reset eligibility when a new search is made
        setEligibility(null);
    };

    const handleCheckBeca18 = () => {
        // Mock logic for eligibility
        const random = Math.random();
        if (random < 0.33) setEligibility('low');
        else if (random < 0.66) setEligibility('medium');
        else setEligibility('high');
    };
    
    const getEligibilityInfo = () => {
        switch (eligibility) {
            case 'high':
                return {
                    Icon: CheckCircle,
                    color: 'text-green-400 bg-green-900/20 border-green-500/30',
                    title: 'Elegibilidad Alta',
                    description: '¡Felicidades! Cumples con los criterios principales para Beca 18 Ordinaria. ¡Tu postulación tiene alta probabilidad de éxito!',
                };
            case 'medium':
                return {
                    Icon: AlertCircle,
                    color: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
                    title: 'Elegibilidad Media',
                    description: 'Estás en buen camino, pero necesitas mejorar algunos aspectos. Por ejemplo, tu promedio debe ser superior a 14 para tener más chances.',
                };
            case 'low':
                return {
                    Icon: XCircle,
                    color: 'text-red-400 bg-red-900/20 border-red-500/30',
                    title: 'Elegibilidad Baja',
                    description: 'Actualmente, no cumples con varios de los criterios socioeconómicos o académicos. Revisa las bases de la beca para más detalles.',
                };
            default:
                return null;
        }
    };

    const eligibilityInfo = getEligibilityInfo();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Search /> Filtros de Búsqueda</CardTitle>
                    <CardDescription>Encuentra universidades y oportunidades ajustadas a tu perfil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Tipo de Universidad</Label>
                            <Select name="type" onValueChange={(value) => setFilters(f => ({ ...f, type: value }))}>
                                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nacional">Nacional</SelectItem>
                                    <SelectItem value="particular">Particular</SelectItem>
                                    <SelectItem value="licenciada">Licenciada SUNEDU</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Región</Label>
                            <Select name="region" onValueChange={(value) => setFilters(f => ({ ...f, region: value }))}>
                                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                                <SelectContent>
                                    {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Área Académica</Label>
                            <Select name="area" onValueChange={(value) => setFilters(f => ({ ...f, area: value }))}>
                                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                                <SelectContent>
                                    {academicAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">Buscar Oportunidades</Button>
                    </form>
                </CardContent>
            </Card>

            <AnimatePresence>
                {showResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockUniversities.slice(0, 4).map(uni => (
                                <Card key={uni.id} className="bg-card/80 hover:bg-muted/30 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-primary"><Building /> {uni.name}</CardTitle>
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="secondary">{uni.area}</Badge>
                                            <Badge variant="outline" className="flex items-center gap-1"><MapPin className="h-3 w-3" />{uni.region}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-muted-foreground" /> Costo Promedio: <span className="font-bold">S/ {uni.cost}</span></div>
                                        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /> Empleabilidad: <span className="font-bold">{uni.employability}%</span></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                         <Card className="text-center">
                            <CardContent className="p-6">
                                <Button onClick={handleCheckBeca18} variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700">Ver Beca 18 Aplicable</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {eligibilityInfo && (
                    <motion.div
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                    >
                         <Card className={eligibilityInfo.color}>
                            <CardHeader className="flex-row items-center gap-4">
                                <eligibilityInfo.Icon className="h-10 w-10" />
                                <div className="text-left">
                                    <CardTitle>{eligibilityInfo.title}</CardTitle>
                                    <CardDescription className="text-foreground/80">{eligibilityInfo.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
