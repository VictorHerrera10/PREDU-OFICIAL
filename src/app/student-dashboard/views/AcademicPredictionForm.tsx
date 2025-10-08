'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase';
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
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


// ===== Datos base =====
const subjects = [
  { id: "arte_y_cultura", label: "Arte y Cultura", emoji: "🎨" },
  { id: "castellano_como_segunda_lengua", label: "Castellano (2da Lengua)", emoji: "🗣️" },
  { id: "ciencia_y_tecnologia", label: "Ciencia y Tecnología", emoji: "🔬" },
  { id: "ciencias_sociales", label: "Ciencias Sociales", emoji: "🌍" },
  { id: "comunicacion", label: "Comunicación", emoji: "✍️" },
  { id: "desarrollo_personal", label: "Desarrollo Personal", emoji: "🧘" },
  { id: "educacion_fisica", label: "Educación Física", emoji: "🏃‍♂️" },
  { id: "educacion_para_el_trabajo", label: "Educación para el Trabajo", emoji: "💼" },
  { id: "educacion_religiosa", label: "Educación Religiosa", emoji: "🙏" },
  { id: "ingles", label: "Inglés", emoji: "🇬🇧" },
  { id: "matematica", label: "Matemática", emoji: "➗" },
];

const gradeOptions: ("AD" | "A" | "B" | "C")[] = ["AD", "A", "B", "C"];

// ===== Validación Zod =====
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
};

// ===== Componente principal =====
export function VocationalFormModal({ setPredictionResult }: Props) {
  const { user } = useUser();
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
      const requestData = { user_id: user.uid, ...data };
      const response = await api.post("/prediccion/academico/", requestData);
      const result =
        Object.values(response.data)[0] as string ||
        "No se pudo determinar la carrera.";
      setPredictionResult(result);

      toast({
        title: "¡Predicción Exitosa! 🎉",
        description: `Carrera recomendada: ${result}`,
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error al contactar la API de predicción:", error);
      toast({
        variant: "destructive",
        title: "Error en la Predicción",
        description:
          error.response?.data?.detail ||
          "No se pudo conectar con el servicio de predicción.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Obtener Predicción</Button>
      </DialogTrigger>

      {/* **AJUSTE CRÍTICO 1:** Aumentamos la altura máxima y garantizamos h-full */}
      <DialogContent className="max-w-4xl h-full max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-2xl font-bold">
            🚀 ¡Descubramos tu Vocación!
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Ingresa tus últimas calificaciones. ¡Cada nota es una pista hacia tu
            futuro profesional! 🎓
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-hidden flex flex-col flex-grow">
            
            {/* **AJUSTE CRÍTICO 2:** Simplificamos el ScrollArea para evitar conflictos de padding/margin */}
            <ScrollArea className="flex-grow">
              {/* Le aplicamos el padding directamente al grid, no al ScrollArea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-6 py-4">
                {subjects.map((subject) => (
                  <FormField
                    key={subject.id}
                    control={form.control}
                    name={subject.id as keyof PredictionFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base font-medium">
                          {subject.emoji} {subject.label}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-4 gap-2 pt-2"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
            
            {/* El DialogFooter tiene una altura fija y queda siempre visible */}
            <DialogFooter className="flex-shrink-0 pt-4 px-6 border-t"> {/* Añadí un borde para separarlo visualmente del scroll */}
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