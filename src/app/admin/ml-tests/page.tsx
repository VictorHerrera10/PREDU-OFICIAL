'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube2, BrainCircuit, Compass, Archive } from 'lucide-react';
import { AcademicPredictionTest } from './AcademicPredictionTest';
import { PsychologicalPredictionTest } from './PsychologicalPredictionTest';
import { StorageTest } from './StorageTest';

function AdminMLTestsPage() {
  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        <Tabs defaultValue="academic">
            <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4">
                    <div className="flex flex-row items-center gap-4">
                         <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <TestTube2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Pruebas de Modelos y Servicios</h1>
                            <p className="text-muted-foreground">
                            Interactúa directamente con los endpoints y servicios para validarlos.
                            </p>
                        </div>
                    </div>
                     <TabsList className="grid w-full md:w-auto grid-cols-2 lg:grid-cols-3">
                        <TabsTrigger value="academic">
                            <Compass className="mr-2 h-4 w-4" /> Predicción Académica
                        </TabsTrigger>
                        <TabsTrigger value="psychological">
                            <BrainCircuit className="mr-2 h-4 w-4" /> Predicción Psicológica
                        </TabsTrigger>
                         <TabsTrigger value="storage">
                            <Archive className="mr-2 h-4 w-4" /> Pruebas de Storage
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="academic">
                        <AcademicPredictionTest />
                    </TabsContent>
                    <TabsContent value="psychological">
                        <PsychologicalPredictionTest />
                    </TabsContent>
                    <TabsContent value="storage">
                        <StorageTest />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    </div>
  );
}

export default AdminMLTestsPage;
