'use client';

import { useActionState, useRef } from 'react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { sendPsychologicalValidation } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Send, BrainCircuit } from 'lucide-react';

type TutorPsychologicalValidationFormProps = {
    studentName: string;
    studentEmail: string;
};

const initialState = {
    message: null,
    success: false,
};

export function TutorPsychologicalValidationForm({ studentName, studentEmail }: TutorPsychologicalValidationFormProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(sendPsychologicalValidation, initialState);

    if (state.success && state.message) {
        toast({
            title: '¡Validación Psicológica Enviada! ✅',
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
        <Card className="bg-background/50 border-purple-500/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" />
                    Validación Psicológica del Tutor
                </CardTitle>
                <CardDescription>
                    Envía un consejo enfocado en el perfil de intereses (RIASEC) del estudiante.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="email" value={studentEmail} />
                    <input type="hidden" name="studentName" value={studentName} />
                    <input type="hidden" name="tutorName" value={user?.displayName || 'Tu Tutor'} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="tutorPsychologicalAdvice">Consejo sobre Intereses y Personalidad</Label>
                        <Textarea
                            id="tutorPsychologicalAdvice"
                            name="tutorAdvice"
                            placeholder={`Ej: "Hola ${studentName}, tu perfil 'Social' es muy marcado. ¡Has pensado en carreras como psicología o docencia?"`}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <SubmitButton>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Validación Psicológica
                        </SubmitButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
