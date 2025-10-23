'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Loader2, BrainCircuit, Image as ImageIcon, FileText } from 'lucide-react';
import { QuestionForm, QuestionFormData } from './QuestionForm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TestSection, QuestionCategory, CATEGORY_DETAILS, HollandQuestion } from '@/app/student-dashboard/views/psychological-test-data';


export function QuestionsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<HollandQuestion | null>(null);

  const questionsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'psychological_questions'), orderBy('section'), orderBy('category'));
  }, [firestore]);

  const { data: questions, isLoading } = useCollection<HollandQuestion>(questionsCollectionRef);

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (question: HollandQuestion) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!firestore) return;
    setIsProcessing(true);
    try {
        await deleteDoc(doc(firestore, 'psychological_questions', questionId));
        toast({ title: 'Pregunta eliminada' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la pregunta.' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
    if (!firestore) return;
    setIsProcessing(true);
    try {
        if (editingQuestion) {
            // Update existing question
            const questionRef = doc(firestore, 'psychological_questions', editingQuestion.id);
            await updateDoc(questionRef, data);
            toast({ title: 'Pregunta Actualizada' });
        } else {
            // Create new question
            await addDoc(collection(firestore, 'psychological_questions'), data);
            toast({ title: 'Pregunta Creada' });
        }
        setIsFormOpen(false);
        setEditingQuestion(null);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la pregunta.' });
    } finally {
        setIsProcessing(false);
    }
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
            <TableHead className="w-10">#</TableHead>
            <TableHead>Texto de la Pregunta</TableHead>
            <TableHead>Sección</TableHead>
            <TableHead>Categoría (RIASEC)</TableHead>
            <TableHead>GIF</TableHead>
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
                <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium max-w-sm truncate">{question.text}</TableCell>
                <TableCell className="capitalize">{question.section}</TableCell>
                <TableCell>
                    <Badge variant="outline" className="capitalize flex w-fit items-center gap-1.5" style={{ color: categoryInfo.color, borderColor: categoryInfo.color }}>
                        <CategoryIcon className="h-3.5 w-3.5" />
                        {question.category}
                    </Badge>
                </TableCell>
                <TableCell>
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

    