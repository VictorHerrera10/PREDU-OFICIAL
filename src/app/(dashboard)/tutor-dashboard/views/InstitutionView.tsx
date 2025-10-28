'use client';

import StudentsList from './StudentsView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function InstitutionView() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary"/> Estudiantes</CardTitle>
                <CardDescription>
                    Revisa el progreso, los resultados y los perfiles de los estudiantes a tu cargo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <StudentsList />
            </CardContent>
        </Card>
    );
}
