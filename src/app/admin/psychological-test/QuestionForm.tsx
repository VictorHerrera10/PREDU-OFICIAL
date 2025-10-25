'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

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
import { BrainCircuit, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { HollandQuestion } from './QuestionsTable';
import { CATEGORY_DETAILS, SECTION_DETAILS, QuestionCategory, TestSection } from '@/app/student-dashboard/views/psychological-test-data';
import { useStorage } from '@/firebase';
import { uploadFile } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { QuestionFormData } from '@/app/actions';

const formSchema = z.object({
  text: z.string().min(1, 'El texto de la pregunta no puede estar vacío.'),
  gifUrl: z.string().min(1, 'Debes cargar un GIF para la pregunta.').url('Debe ser una URL válida.'),
  section: z.enum(['actividades', 'habilidades', 'ocupaciones']),
  category: z.enum(['realista', 'investigador', 'artistico', 'social', 'emprendedor', 'convencional']),
});

type QuestionFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuestionFormData) => void;
  initialData?: HollandQuestion | null;
  isProcessing: boolean;
};

export function QuestionForm({ isOpen, onOpenChange, onSubmit, initialData, isProcessing }: QuestionFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch, trigger } = useForm<QuestionFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const storage = useStorage();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const gifUrlValue = watch('gifUrl');
  
  useEffect(() => {
    if(isOpen) {
        if(initialData) {
            reset({
              text: initialData.text,
              gifUrl: initialData.gifUrl,
              section: initialData.section,
              category: initialData.category,
            });
            setPreview(initialData.gifUrl);
        } else {
            reset({
                text: '',
                gifUrl: '',
                section: 'actividades',
                category: 'realista'
            });
            setPreview(null);
        }
        setImageFile(null);
        setUploadProgress(0);
        setIsUploading(false);
    }
  }, [initialData, reset, isOpen]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Archivo no válido', description: 'Por favor, sube solo archivos de imagen.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
         toast({ variant: 'destructive', title: 'Archivo muy grande', description: 'El GIF no debe pesar más de 5MB.' });
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      // Temporarily set a valid-looking but placeholder URL to pass initial validation if needed.
      setValue('gifUrl', 'https://placeholder.com/image.gif', { shouldDirty: true, shouldValidate: false });
    }
  }, [toast, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.gif', '.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Trigger validation for all fields except gifUrl if we're about to upload
    const textIsValid = await trigger("text");
    if (!textIsValid) return;

    if (imageFile && storage) {
      setIsUploading(true);
      try {
        const filePath = `psychological-test-gifs/${Date.now()}-${imageFile.name}`;
        const uploadedUrl = await uploadFile(storage, imageFile, filePath, setUploadProgress);
        setValue('gifUrl', uploadedUrl, { shouldValidate: true });
        handleSubmit((data) => onSubmit(data))();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error de carga', description: 'No se pudo subir el GIF.' });
        setIsUploading(false);
        setUploadProgress(0);
        return;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // If no new image, just submit with existing data
      handleSubmit((data) => onSubmit(data))();
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    setValue('gifUrl', initialData?.gifUrl || '', { shouldValidate: true });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleFormSubmit}>
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
                <Label>GIF de la pregunta</Label>
                {preview ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                        <Image src={preview} alt="Vista previa" layout="fill" objectFit="cover" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full z-10"
                            onClick={removeImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div {...getRootProps()} className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors",
                        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}>
                        <input {...getInputProps()} />
                        <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                {isDragActive ? 'Suelta el GIF aquí' : 'Arrastra un GIF o haz clic para seleccionarlo'}
                            </p>
                            <p className="text-xs text-muted-foreground/80">Max. 5MB</p>
                        </div>
                    </div>
                )}
                 {(isUploading || uploadProgress > 0) && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="w-full h-2 mt-2" />
                )}
                 {errors.gifUrl && <p className="text-xs text-destructive">{errors.gifUrl.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="section"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Sección</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
            <Button type="submit" disabled={isProcessing || isUploading}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : 
               isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
