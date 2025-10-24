'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { QuestionForm } from './QuestionForm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TestSection, QuestionCategory, CATEGORY_DETAILS, HollandQuestion } from '@/app/student-dashboard/views/psychological-test-data';
import { createPsychologicalQuestion, updatePsychologicalQuestion, deletePsychologicalQuestion, type QuestionFormData } from '@/app/actions';


export function QuestionsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<HollandQuestion | null>(null);

  const questionsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'psychological_questions'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: questions, isLoading } = useCollection<HollandQuestion>(questionsQuery);

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (question: HollandQuestion) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    setIsProcessing(true);
    const result = await deletePsychologicalQuestion(questionId);
    if(result.success) {
        toast({ title: 'Pregunta eliminada' });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsProcessing(false);
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
    setIsProcessing(true);
    const result = editingQuestion
      ? await updatePsychologicalQuestion(editingQuestion.id, data)
      : await createPsychologicalQuestion(data);

    if (result.success) {
      toast({
        title: `Pregunta ${editingQuestion ? 'actualizada' : 'creada'}`,
        description: 'Los cambios se han guardado en la base de datos.',
      });
      setIsFormOpen(false);
      setEditingQuestion(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: result.message,
      });
    }
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
         <div className="flex justify-end">
             <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button size="sm" className="h-8 gap-1" onClick={handleCreate}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Crear Pregunta
          </span>
        </Button>
      </div>
       <QuestionForm 
            isOpen={isFormOpen} 
            onOpenChange={setIsFormOpen}
            onSubmit={handleFormSubmit}
            initialData={editingQuestion}
            isProcessing={isProcessing}
        />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 hidden sm:table-cell">#</TableHead>
            <TableHead>Texto de la Pregunta</TableHead>
            <TableHead className="hidden md:table-cell">Sección</TableHead>
            <TableHead className="hidden lg:table-cell">Categoría (RIASEC)</TableHead>
            <TableHead className="hidden md:table-cell">GIF</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions && questions.length > 0 ? (
            questions.map((question, index) => {
              const categoryInfo = CATEGORY_DETAILS[question.category] || {};
              const CategoryIcon = categoryInfo.icon || FileText;
              return (
              <motion.tr 
                key={question.id}
                className="hover:bg-muted/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TableCell className="font-mono text-muted-foreground hidden sm:table-cell">{index + 1}</TableCell>
                <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                        <span className="truncate max-w-xs">{question.text}</span>
                         <div className="flex items-center gap-2 lg:hidden">
                            <Badge variant="outline" className="capitalize">{question.section}</Badge>
                            <Badge variant="outline" className="capitalize flex w-fit items-center gap-1.5" style={{ color: categoryInfo.color, borderColor: categoryInfo.color }}>
                                <CategoryIcon className="h-3.5 w-3.5" />
                                {question.category}
                            </Badge>
                         </div>
                    </div>
                </TableCell>
                <TableCell className="capitalize hidden md:table-cell">{question.section}</TableCell>
                <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="capitalize flex w-fit items-center gap-1.5" style={{ color: categoryInfo.color, borderColor: categoryInfo.color }}>
                        <CategoryIcon className="h-3.5 w-3.5" />
                        {question.category}
                    </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <a href={question.gifUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <ImageIcon className="h-4 w-4" />
                        Ver GIF
                    </a>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(question)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro de eliminar esta pregunta?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción no se puede deshacer y es permanente. 💀</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(question.id)} disabled={isProcessing} className={cn(buttonVariants({variant: 'destructive'}), "btn-retro")}>
                                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                  {isProcessing ? 'Eliminando...' : 'Sí, eliminar'}
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            )})
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay preguntas configuradas. ¡Crea la primera! 🚀
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
