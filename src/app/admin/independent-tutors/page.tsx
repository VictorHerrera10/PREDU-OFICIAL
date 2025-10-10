'use client';

import { IndependentTutorsTable } from '@/app/admin/independent-tutors/IndependentTutorsTable';
import { TutorRequestsTable } from '@/app/admin/requests/TutorRequestsTable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Inbox } from 'lucide-react';

function AdminIndependentTutorsPage() {
  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        <Tabs defaultValue="groups">
            <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4">
                    <div className="flex flex-row items-center gap-4">
                         <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <UserCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Gestión de Tutores Independientes</h1>
                            <p className="text-muted-foreground">
                            Crea grupos y gestiona las solicitudes de los tutores que no pertenecen a una institución.
                            </p>
                        </div>
                    </div>
                     <TabsList className="grid w-full md:w-auto grid-cols-2">
                        <TabsTrigger value="groups">
                            <UserCheck className="mr-2 h-4 w-4" /> Grupos Creados
                        </TabsTrigger>
                        <TabsTrigger value="requests">
                            <Inbox className="mr-2 h-4 w-4" /> Solicitudes
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="groups">
                        <IndependentTutorsTable />
                    </TabsContent>
                    <TabsContent value="requests">
                        <TutorRequestsTable />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    </div>
  );
}

export default AdminIndependentTutorsPage;
