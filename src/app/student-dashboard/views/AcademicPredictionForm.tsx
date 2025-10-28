'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import api from '@/lib/api-client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subjects } from './academic-test-data';
import { useNotifications } from '@/hooks/use-notifications';

// ===== Datos base =====
const gradeOptions: ("AD" | "A" | "B" | "C")[] = ["AD", "A", "B", "C"];

// ===== Validación Zod =====
const gradeSchema = z.enum(["AD", "A", "B", "C"], {
  required_error: "Debes seleccionar una calificación.",
});

const formSchemaObject = subjects.reduce((acc, subject) => {
  acc[subject.id] = gradeSchema;
  return acc;
}, {} as Record<string, typeof gradeSchema>);

const formSchema = z.object(formSchemaObject);

type PredictionFormValues = z.infer<typeof formSchema>;

type Props = {
  setPredictionResult: (result: string | null) => void;
};

// ===== Componente principal =====
export function VocationalFormModal({ setPredictionResult }: Props) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addNotification } = useNotifications();

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: subjects.reduce(
      (acc, subject) => ({ ...acc, [subject.id]: undefined }),
      {}
    ),
  });

  const { formState: { errors } } = form;
  const hasErrors = Object.keys(errors).length > 0 && form.formState.isSubmitted;

  const handleSaveGrades = async () => {
    if (!user || !firestore) return;

    // Trigger validation to show errors if fields are empty
    const isValid = await form.trigger();
    if (!isValid) {
        toast({
            variant: "destructive",
            title: "Faltan Campos",
            description: "Por favor, completa todas las calificaciones antes de guardar.",
        });
        return;
    }
    
    setIsSaving(true);
    const data = form.getValues();
    const predictionDocRef = doc(firestore, 'academic_prediction', user.uid);
    
    setDocumentNonBlocking(predictionDocRef, {
        userId: user.uid,
        grades: data,
        // No establecemos la predicción aquí, solo guardamos las notas
        createdAt: serverTimestamp(),
    }, { merge: true });

    toast({
        title: "¡Notas Guardadas! 💾",
        description: `Tus calificaciones han sido guardadas. Ahora puedes obtener una predicción cuando quieras.`,
    });
    
    setIsSaving(false);
  };


  const onSubmit = async (data: PredictionFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error de Autenticación",
        description: "Debes iniciar sesión para realizar una predicción.",
      });
      return;
    }

    setIsSubmitting(true);
    const predictionDocRef = doc(firestore, 'academic_prediction', user.uid);

    try {
      // Intenta obtener la predicción de la API
      const response = await api.post("/prediccion/academico/", data);
      const result =
        Object.values(response.data)[0] as string ||
        "No se pudo determinar la carrera.";
      
      // Si tiene éxito, guarda las notas y la predicción
      setPredictionResult(result);
      setDocumentNonBlocking(predictionDocRef, {
        userId: user.uid,
        grades: data,
        prediction: result,
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: "¡Predicción Exitosa! 🎉",
        description: `Carrera recomendada: ${result}`,
      });
      
      setTimeout(() => {
        addNotification({
            type: 'academic_test_complete',
            title: '¡Test Académico Completo!',
            description: '¡Felicidades! Sigue así para descubrir tu vocación.',
            emoji: '🎓'
        });
      }, 6000);

      setIsOpen(false);
    } catch (error: any) {
      console.error("Error al contactar la API de predicción:", error);

      // Si la API falla, guarda solo las notas
      setDocumentNonBlocking(predictionDocRef, {
          userId: user.uid,
          grades: data,
          prediction: null,
          createdAt: serverTimestamp(),
      }, { merge: true });
      
      // Notifica al usuario que las notas se guardaron pero la predicción falló
      toast({
        variant: "destructive",
        title: "Servicio no Disponible",
        description: "Tus notas se han guardado, pero el servicio de predicción no está disponible. Inténtalo de nuevo más tarde.",
      });
       setIsOpen(false); // Cierra el modal igual

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Obtener Predicción</Button>
      </DialogTrigger>

      {/* ===== Modal con scroll externo y estilo acorde a tu página ===== */}
      <DialogContent className="max-w-4xl max-h-[95vh] w-full overflow-y-auto flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <DialogHeader className="flex-shrink-0 px-6 pt-6">
          <DialogTitle className="text-center text-2xl font-bold">
            🚀 ¡Descubramos tu Vocación!
          </DialogTitle>
          <DialogDescription className={cn("text-center text-sm text-muted-foreground mt-1", hasErrors && "text-destructive font-semibold")}>
            {hasErrors
              ? "Debes seleccionar una calificación para todos los cursos."
              : "Ingresa tus últimas calificaciones. ¡Cada nota es una pista hacia tu futuro profesional! 🎓"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow px-6 py-4 space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <FormField
                  key={subject.id}
                  control={form.control}
                  name={subject.id as keyof PredictionFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn("flex items-center gap-2 text-base font-medium", errors[subject.id] && "text-destructive")}>
                        {subject.emoji} {subject.label}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-4 gap-2"
                        >
                          {gradeOptions.map((grade) => (
                            <FormItem key={grade} className="m-0 p-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={grade}
                                  id={`${subject.id}-${grade}`}
                                  className="sr-only focus:outline-none"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`${subject.id}-${grade}`}
                                className={cn(
                                  "flex items-center justify-center h-10 min-w-[48px] rounded-md border-2 border-muted bg-popover p-2 font-bold cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground box-border",
                                  field.value === grade &&
                                    "border-primary ring-2 ring-primary/50 text-primary"
                                )}
                              >
                                {grade}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter className="flex-shrink-0 pt-4 pb-6">
                <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button type="button" variant="outline" onClick={handleSaveGrades} disabled={isSubmitting || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? "Guardando..." : "Guardar Notas"}
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isSaving} size="lg" className='w-full sm:w-auto'>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Analizando..." : "Obtener Predicción"}
                    </Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
