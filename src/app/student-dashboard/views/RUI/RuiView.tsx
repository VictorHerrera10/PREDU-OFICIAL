'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Map, Compass, Route } from 'lucide-react';
import { AcademicProjection } from './AcademicProjection';
import { OpportunityExplorer } from './OpportunityExplorer';
import { PostulationRoadmap } from './PostulationRoadmap';

export default function RuiView() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-blue-400">
                    <Route className="h-8 w-8" />
                    Ruta Universitaria Interactiva (RUI)
                </CardTitle>
                <CardDescription>
                    Tu guía personalizada para el ingreso a la educación superior en Perú.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="projection" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="projection"><FileText className="mr-2"/> Perfil Académico</TabsTrigger>
                        <TabsTrigger value="explorer"><Compass className="mr-2"/> Explorador</TabsTrigger>
                        <TabsTrigger value="roadmap"><Map className="mr-2"/> Roadmap</TabsTrigger>
                    </TabsList>
                    <TabsContent value="projection" className="mt-6">
                       <AcademicProjection />
                    </TabsContent>
                    <TabsContent value="explorer" className="mt-6">
                        <OpportunityExplorer />
                    </TabsContent>
                    <TabsContent value="roadmap" className="mt-6">
                       <PostulationRoadmap />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
