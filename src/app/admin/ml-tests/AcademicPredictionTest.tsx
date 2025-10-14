'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api-client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subjects } from '@/app/student-dashboard/views/academic-test-data';

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

export function AcademicPredictionTest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

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
    setIsSubmitting(true);
    setPredictionResult(null);
    try {
      const response = await api.post("/prediccion/academico/", data);
      const result =
        Object.values(response.data)[0] as string ||
        "No se pudo determinar la carrera.";
      setPredictionResult(result);

      toast({
        title: "¡Predicción Exitosa! 🎉",
        description: `Carrera recomendada: ${result}`,
      });

    } catch (error: any) {
      console.error("Error al contactar la API de predicción:", error);
      toast({
        variant: "destructive",
        title: "Error en la Predicción",
        description: error.response?.data?.detail || "Hubo un problema al procesar la solicitud.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Probar Endpoint de Predicción Académica</CardTitle>
            <CardDescription>
                Selecciona las calificaciones para cada materia y envía la solicitud al endpoint de ML para ver el resultado.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <FormField
                    key={subject.id}
                    control={form.control}
                    name={subject.id as keyof PredictionFormValues}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className={cn("flex items-center gap-2 font-medium", errors[subject.id] && "text-destructive")}>
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
                                    id={`${subject.id}-${grade}-admin`}
                                    className="sr-only"
                                    />
                                </FormControl>
                                <FormLabel
                                    htmlFor={`${subject.id}-${grade}-admin`}
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

                <div className="flex flex-col items-center justify-center gap-6">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Analizando..." : "Obtener Predicción"}
                    </Button>

                    {predictionResult && (
                        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
                            <h3 className="text-lg font-semibold flex items-center justify-center gap-2"><Sparkles className="text-primary"/>Resultado de la Predicción</h3>
                            <p className="text-2xl font-bold text-foreground mt-2">{predictionResult}</p>
                        </div>
                    )}
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
