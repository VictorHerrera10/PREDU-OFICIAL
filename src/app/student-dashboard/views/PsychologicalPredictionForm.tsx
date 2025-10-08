'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase';
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
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const questions = [
  { id: "realistic_q1", label: "Disfruto trabajar con herramientas y máquinas." },
  { id: "investigative_q1", label: "Me gusta resolver problemas complejos y abstractos." },
  { id: "artistic_q1", label: "Me considero una persona creativa e imaginativa." },
  { id: "social_q1", label: "Disfruto ayudar y enseñar a otras personas." },
  { id: "enterprising_q1", label: "Me siento cómodo liderando equipos y tomando decisiones." },
  { id: "conventional_q1", label: "Prefiero tener rutinas claras y un trabajo organizado." },
  { id: "realistic_q2", label: "Prefiero actividades al aire libre que trabajo de oficina." },
  { id: "investigative_q2", label: "Siento curiosidad por cómo funcionan las cosas." },
  { id: "artistic_q2", label: "Me expreso mejor a través de formas artísticas (música, escritura, etc.)." },
  { id: "social_q2", label: "Soy bueno escuchando y entendiendo los problemas de los demás." },
  { id: "enterprising_q2", label: "Me motivan los desafíos y me gusta persuadir a la gente." },
  { id: "conventional_q2", label: "Disfruto trabajar con datos y prestar atención a los detalles." },
];

const scoreSchema = z.string().refine(val => ["1", "2", "3", "4", "5"].includes(val), {
  message: "Debes seleccionar una puntuación.",
});

const formSchema = z.object(
  questions.reduce((acc, question) => {
    acc[question.id] = scoreSchema;
    return acc;
  }, {} as Record<string, typeof scoreSchema>)
);

type PredictionFormValues = z.infer<typeof formSchema>;

type Props = {
    setPredictionResult: (result: string | null) => void;
}

export function PsychologicalPredictionForm({ setPredictionResult }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: questions.reduce((acc, question) => ({...acc, [question.id]: undefined }), {})
  });

  const onSubmit = async (data: PredictionFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error de Autenticación",
        description: "Debes iniciar sesión para realizar el test.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        user_id: user.uid,
        ...Object.entries(data).reduce((acc, [key, value]) => ({...acc, [key]: parseInt(value) }), {})
      };
      
      const response = await api.post('/prediccion/psicologica/', requestData);
      
      const result = Object.values(response.data)[0] as string || "No se pudo determinar el perfil.";
      setPredictionResult(result);
      
      toast({
        title: "¡Análisis Completado! 🧠",
        description: `Tu perfil sugerido es: ${result}`,
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error al contactar la API de predicción psicológica:', error);
      toast({
        variant: "destructive",
        title: "Error en el Análisis",
        description: error.response?.data?.detail || "No se pudo conectar con el servicio de predicción.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Iniciar Test Psicológico</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Test de Perfil Psicológico</DialogTitle>
          <DialogDescription>
            Responde del 1 (Totalmente en desacuerdo) al 5 (Totalmente de acuerdo) según qué tan bien te describe cada frase.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pr-6 py-4">
                    {questions.map((question) => (
                    <FormField
                        key={question.id}
                        control={form.control}
                        name={question.id as keyof PredictionFormValues}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{question.label}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Puntuación (1-5)" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="1">1 - Totalmente en desacuerdo</SelectItem>
                                <SelectItem value="2">2 - En desacuerdo</SelectItem>
                                <SelectItem value="3">3 - Neutral</SelectItem>
                                <SelectItem value="4">4 - De acuerdo</SelectItem>
                                <SelectItem value="5">5 - Totalmente de acuerdo</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    ))}
                </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Analizando...' : 'Obtener Perfil'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
