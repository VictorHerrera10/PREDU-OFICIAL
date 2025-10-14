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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_DETAILS, QuestionCategory } from '@/app/student-dashboard/views/psychological-test-data';

// ===== Validación Zod =====
const numberSchema = z.coerce.number().min(0, "Debe ser un número positivo.");

const formSchemaObject = (Object.keys(CATEGORY_DETAILS) as QuestionCategory[]).reduce((acc, cat) => {
  acc[cat] = numberSchema;
  return acc;
}, {} as Record<QuestionCategory, typeof numberSchema>);

const formSchema = z.object(formSchemaObject);

type PredictionFormValues = z.infer<typeof formSchema>;

export function PsychologicalPredictionTest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        realista: 0,
        investigador: 0,
        artistico: 0,
        social: 0,
        emprendedor: 0,
        convencional: 0,
    },
  });

  const onSubmit = async (data: PredictionFormValues) => {
    setIsSubmitting(true);
    setPredictionResult(null);
    try {
      const response = await api.post("/prediccion/psicologica/", data);
      const result =
        Object.values(response.data)[0] as string ||
        "No se pudo determinar el perfil.";
      setPredictionResult(result);

      toast({
        title: "¡Predicción Exitosa! 🧠",
        description: `Perfil sugerido: ${result}`,
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
            <CardTitle>Probar Endpoint de Predicción Psicológica (RIASEC)</CardTitle>
            <CardDescription>
                Ingresa el conteo de respuestas "Sí" para cada categoría RIASEC y envía la solicitud para ver el resultado.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.keys(CATEGORY_DETAILS) as QuestionCategory[]).map((category) => {
                    const categoryInfo = CATEGORY_DETAILS[category];
                    const Icon = categoryInfo.icon;
                    return (
                        <FormField
                        key={category}
                        control={form.control}
                        name={category}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={cn("flex items-center gap-2 font-medium", categoryInfo.color)}>
                                    <Icon className="h-5 w-5" /> {categoryInfo.label}
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Nro de 'Sí'" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    );
                })}
                </div>

                <div className="flex flex-col items-center justify-center gap-6">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Analizando..." : "Obtener Perfil RIASEC"}
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
