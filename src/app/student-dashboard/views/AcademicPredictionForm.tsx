'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import api from '@/lib/api-client';

// Importaciones de Componentes
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
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { subjects } from './academic-test-data';

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

const formSchema = z.object(formSchemaObject).refine(data => {
    const allDefined = Object.values(data).every(value => value !== undefined && value !== null && value !== '');
    return allDefined;
}, {
    message: "Debes seleccionar una calificación para todos los cursos.",
    path: [], // General form error
});


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

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: subjects.reduce(
      (acc, subject) => ({ ...acc, [subject.id]: undefined }),
      {}
    ),
  });

  const { formState: { errors } } = form;
  const hasErrors = Object.keys(errors).length > 0 && form.formState.isSubmitted;
  
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
    try {
      const response = await api.post("/prediccion/academico/", data);
      const result =
        Object.values(response.data)[0] as string ||
        "No se pudo determinar la carrera.";
      setPredictionResult(result);
      
      const predictionDocRef = doc(firestore, 'academic_prediction', user.uid);
      await setDocumentNonBlocking(predictionDocRef, {
          userId: user.uid,
          grades: data,
          prediction: result,
          createdAt: new Date().toISOString(),
      }, { merge: true });


      toast({
        title: "¡Predicción Exitosa! 🎉",
        description: `Carrera recomendada: ${result}`,
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error al contactar la API de predicción:", error);

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        toast({
          variant: "destructive",
          title: "Error en la Predicción",
          description: error.response.data?.detail || "Hubo un problema al procesar tus calificaciones.",
        });
      } else {
        // La solicitud se hizo pero no se recibió respuesta (problema de red/servidor)
        toast({
          variant: "destructive",
          title: "Servicio no Disponible",
          description: "El servicio de predicción parece tener dificultades. Por favor, intenta de nuevo más tarde o regresa al inicio. 🛠️",
        });
        setIsOpen(false); // Close the modal on network error
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Obtener Predicción</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-full max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-2xl font-bold">
            🚀 ¡Descubramos tu Vocación!
          </DialogTitle>
          <DialogDescription className={cn("text-center text-sm text-muted-foreground", hasErrors && "text-destructive font-semibold")}>
            {hasErrors
              ? "Debes seleccionar una calificación para todos los cursos."
              : "Ingresa tus últimas calificaciones. ¡Cada nota es una pista hacia tu futuro profesional! 🎓"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-hidden flex flex-col flex-grow">
            
            <ScrollArea className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-6 py-4">
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
                            defaultValue={field.value}
                            className={cn("grid grid-cols-4 gap-2 pt-2 rounded-md", errors[subject.id] && "ring-2 ring-destructive ring-offset-2 ring-offset-background")}
                          >
                            {gradeOptions.map((grade) => (
                              <FormItem key={grade}>
                                <FormControl>
                                  <RadioGroupItem
                                    value={grade}
                                    id={`${subject.id}-${grade}`}
                                    className="sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`${subject.id}-${grade}`}
                                  className={cn(
                                    "flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 font-bold cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground",
                                    "h-10 min-w-[48px]",
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
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
            
            <DialogFooter className="flex-shrink-0 pt-4 px-6 border-t">
              <div className="w-full flex justify-center">
                <Button type="submit" disabled={isSubmitting} size="lg" className='w-full md:w-auto'>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
