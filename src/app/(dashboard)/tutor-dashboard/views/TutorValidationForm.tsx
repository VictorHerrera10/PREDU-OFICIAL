'use client';

import { useActionState, useRef } from 'react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { sendTutorValidation } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Send, GraduationCap } from 'lucide-react';

type TutorValidationFormProps = {
    studentName: string;
    studentEmail: string;
};

const initialState = {
    message: null,
    success: false,
};

export function TutorValidationForm({ studentName, studentEmail }: TutorValidationFormProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(sendTutorValidation, initialState);

    if (state.success && state.message) {
        toast({
            title: '¡Correo Enviado! ✅',
            description: state.message,
        });
        formRef.current?.reset();
        // Reset state manually after showing toast
        state.success = false; 
        state.message = null;
    } else if (!state.success && state.message) {
        toast({
            variant: 'destructive',
            title: 'Error al Enviar 😵',
            description: state.message,
        });
         // Reset state manually after showing toast
        state.message = null;
    }

    return (
        <Card className="bg-background/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="text-primary" />
                    Validación y Consejo del Tutor
                </CardTitle>
                <CardDescription>
                    Envía una retroalimentación personalizada al estudiante basada en sus resultados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="email" value={studentEmail} />
                    <input type="hidden" name="studentName" value={studentName} />
                    <input type="hidden" name="tutorName" value={user?.displayName || 'Tu Tutor'} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="tutorAdvice">Tu Consejo Personalizado</Label>
                        <Textarea
                            id="tutorAdvice"
                            name="tutorAdvice"
                            placeholder={`Ej: "Hola ${studentName}, he visto tus resultados y creo que tienes un gran potencial en el área de... ¡Sigue así!"`}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <SubmitButton>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Validación por Correo
                        </SubmitButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
