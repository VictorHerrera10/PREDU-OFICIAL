'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Megaphone, Users, Building, Loader2, Award } from 'lucide-react';
import { ForumView } from '@/components/forum/ForumView';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Institution = {
    id: string;
    name: string;
};

type Group = {
    id: string;
    name: string;
};

function AdminForumsPage() {
    const firestore = useFirestore();
    const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);

    const institutionsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'institutions');
    }, [firestore]);

    const groupsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'independentTutorGroups');
    }, [firestore]);

    const { data: institutions, isLoading: isLoadingInstitutions } = useCollection<Institution>(institutionsQuery);
    const { data: groups, isLoading: isLoadingGroups } = useCollection<Group>(groupsQuery);

    const isLoading = isLoadingInstitutions || isLoadingGroups;

    return (
        <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
            <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                    <div className="flex flex-row items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <Megaphone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Gestión de Foros y Avisos</h1>
                            <p className="text-muted-foreground">
                                Modera, publica y supervisa todos los foros de la comunidad desde un solo lugar.
                            </p>
                        </div>
                    </div>
                    
                    <div className="w-full max-w-sm">
                        <Select onValueChange={setSelectedAssociationId} disabled={isLoading}>
                             <SelectTrigger>
                                <SelectValue placeholder={isLoading ? 'Cargando...' : 'Selecciona una comunidad...'} />
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectItem value="hero_students_forum">
                                    <span className="flex items-center gap-2 font-semibold text-destructive"><Award className="h-4 w-4"/> Estudiantes Héroe (Global)</span>
                                </SelectItem>
                                <SelectItem value="null" disabled>-- Instituciones --</SelectItem>
                                {institutions?.map(inst => (
                                    <SelectItem key={inst.id} value={inst.id}>
                                        <span className="flex items-center gap-2"><Building className="h-4 w-4"/> {inst.name}</span>
                                    </SelectItem>
                                ))}
                                <SelectItem value="null" disabled>-- Grupos de Tutores --</SelectItem>
                                {groups?.map(group => (
                                    <SelectItem key={group.id} value={group.id}>
                                         <span className="flex items-center gap-2"><Users className="h-4 w-4"/> {group.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedAssociationId ? (
                        <ForumView associationId={selectedAssociationId} />
                    ) : (
                        <div className="text-center text-muted-foreground p-12 border border-dashed rounded-lg">
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                     <Loader2 className="h-5 w-5 animate-spin"/>
                                     <span>Cargando comunidades...</span>
                                </div>
                            ) : (
                                <>
                                    <h3 className="font-semibold text-lg">Selecciona una Comunidad</h3>
                                    <p>Elige una institución o un grupo de la lista para ver su foro.</p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminForumsPage;
