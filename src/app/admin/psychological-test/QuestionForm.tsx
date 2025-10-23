'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit } from 'lucide-react';
import { HollandQuestion } from './QuestionsTable';
import { CATEGORY_DETAILS, SECTION_DETAILS, QuestionCategory, TestSection } from '@/app/student-dashboard/views/psychological-test-data';

const formSchema = z.object({
  text: z.string().min(10, 'El texto de la pregunta es muy corto.'),
  gifUrl: z.string().url('Debe ser una URL válida.'),
  section: z.enum(['actividades', 'habilidades', 'ocupaciones']),
  category: z.enum(['realista', 'investigador', 'artistico', 'social', 'emprendedor', 'convencional']),
});

export type QuestionFormData = z.infer<typeof formSchema>;

type QuestionFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuestionFormData) => void;
  initialData?: HollandQuestion | null;
  isProcessing: boolean;
};

export function QuestionForm({ isOpen, onOpenChange, onSubmit, initialData, isProcessing }: QuestionFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<QuestionFormData>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if(initialData) {
        reset(initialData);
    } else {
        reset({
            text: '',
            gifUrl: '',
            section: 'actividades',
            category: 'realista'
        });
    }
  }, [initialData, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="text-primary" />
              {initialData ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
            </DialogTitle>
            <DialogDescription>
              Completa los detalles de la pregunta para el test RIASEC.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">Texto de la pregunta</Label>
              <Textarea id="text" {...register('text')} placeholder="Ej: ¿Te gustaría reparar aparatos eléctricos?" />
              {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gifUrl">URL del GIF</Label>
              <Input id="gifUrl" {...register('gifUrl')} placeholder="https://example.com/image.gif" />
              {errors.gifUrl && <p className="text-xs text-destructive">{errors.gifUrl.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="section"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Sección</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(SECTION_DETAILS) as TestSection[]).map(key => (
                          <SelectItem key={key} value={key} className="capitalize">{SECTION_DETAILS[key].title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Categoría (RIASEC)</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CATEGORY_DETAILS) as QuestionCategory[]).map(key => (
                           <SelectItem key={key} value={key} className="capitalize">{CATEGORY_DETAILS[key].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
