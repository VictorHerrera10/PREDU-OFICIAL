'use client';

import { subjects } from './psychological-test-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type SavedGradesViewProps = {
  grades: Record<string, string>;
};

export function SavedGradesView({ grades }: SavedGradesViewProps) {
  return (
    <div className="w-full text-left">
        <h3 className="text-lg font-semibold mb-4 text-center">Tus Calificaciones Registradas</h3>
        <Card className="bg-background/50">
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{subject.emoji}</span>
                        <span className="font-medium text-sm">{subject.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-base font-bold">
                        {grades[subject.id] || 'N/A'}
                    </Badge>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
