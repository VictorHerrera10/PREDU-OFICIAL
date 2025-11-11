'use client';

import { useActionState, useRef } from 'react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { sendAcademicValidation } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Send, BookOpen } from 'lucide-react';

type TutorAcademicValidationFormProps = {
    studentName: string;
    studentEmail: string;
};

const initialState = {
    message: null,
    success: false,
};

export function TutorAcademicValidationForm({ studentName, studentEmail }: TutorAcademicValidationFormProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(sendAcademicValidation, initialState);

    if (state.success && state.message) {
        toast({
            title: '¡Validación Académica Enviada! ✅',
            description: state.message,
        });
        formRef.current?.reset();
        state.success = false; 
        state.message = null;
    } else if (!state.success && state.message) {
        toast({
            variant: 'destructive',
            title: 'Error al Enviar 😵',
            description: state.message,
        });
        state.message = null;
    }

    return (
        <Card className="bg-background/50 border-sky-500/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-sky-400" />
                    Validación Académica del Tutor
                </CardTitle>
                <CardDescription>
                    Envía un consejo enfocado en el rendimiento académico del estudiante.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="email" value={studentEmail} />
                    <input type="hidden" name="studentName" value={studentName} />
                    <input type="hidden" name="tutorName" value={user?.displayName || 'Tu Tutor'} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="tutorAcademicAdvice">Consejo sobre Notas y Rendimiento</Label>
                        <Textarea
                            id="tutorAcademicAdvice"
                            name="tutorAdvice"
                            placeholder={`Ej: "Hola ${studentName}, he notado tu excelente rendimiento en ciencias. ¡Considera explorar carreras de ingeniería!"`}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <SubmitButton>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Validación Académica
                        </SubmitButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
