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

const subjects = [
  { id: "arte_y_cultura", label: "Arte y Cultura" },
  { id: "castellano_como_segunda_lengua", label: "Castellano como Segunda Lengua" },
  { id: "ciencia_y_tecnologia", label: "Ciencia y Tecnología" },
  { id: "ciencias_sociales", label: "Ciencias Sociales" },
  { id: "comunicacion", label: "Comunicación" },
  { id: "desarrollo_personal", label: "Desarrollo Personal" },
  { id: "educacion_fisica", label: "Educación Física" },
  { id: "educacion_para_el_trabajo", label: "Educación para el Trabajo" },
  { id: "educacion_religiosa", label: "Educación Religiosa" },
  { id: "ingles", label: "Inglés" },
  { id: "matematica", label: "Matemática" },
];

const gradeSchema = z.enum(["AD", "A", "B", "C"], {
  required_error: "Debes seleccionar una calificación.",
});

const formSchema = z.object(
  subjects.reduce((acc, subject) => {
    acc[subject.id] = gradeSchema;
    return acc;
  }, {} as Record<string, typeof gradeSchema>)
);

type PredictionFormValues = z.infer<typeof formSchema>;

type Props = {
    setPredictionResult: (result: string | null) => void;
}

export function AcademicPredictionForm({ setPredictionResult }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: subjects.reduce((acc, subject) => ({...acc, [subject.id]: undefined }), {})
  });

  const onSubmit = async (data: PredictionFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error de Autenticación",
        description: "Debes iniciar sesión para realizar una predicción.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        user_id: user.uid,
        ...data
      };
      
      const response = await api.post('/prediccion/academico/', requestData);
      
      const result = Object.values(response.data)[0] as string || "No se pudo determinar la carrera.";
      setPredictionResult(result);
      
      toast({
        title: "¡Predicción Exitosa! 🎉",
        description: `Carrera recomendada: ${result}`,
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error al contactar la API de predicción:', error);
      toast({
        variant: "destructive",
        title: "Error en la Predicción",
        description: error.response?.data?.detail || "No se pudo conectar con el servicio de predicción.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Iniciar Predicción Vocacional</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Formulario de Predicción Vocacional</DialogTitle>
          <DialogDescription>
            Ingresa tus calificaciones en las siguientes materias para obtener una recomendación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pr-6 py-4">
                    {subjects.map((subject) => (
                    <FormField
                        key={subject.id}
                        control={form.control}
                        name={subject.id as keyof PredictionFormValues}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{subject.label}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Calificación" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="AD">AD (Logro Destacado)</SelectItem>
                                <SelectItem value="A">A (Logro Esperado)</SelectItem>
                                <SelectItem value="B">B (En Proceso)</SelectItem>
                                <SelectItem value="C">C (En Inicio)</SelectItem>
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
                {isSubmitting ? 'Analizando...' : 'Obtener Predicción'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
