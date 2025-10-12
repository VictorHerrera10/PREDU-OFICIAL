'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, FileCheck, ListTodo } from 'lucide-react';
import { mockRoadmapTasks } from './rui-mock-data';
import { cn } from '@/lib/utils';

type Task = {
    id: string;
    label: string;
    completed: boolean;
};

export function PostulationRoadmap() {
    const [tasks, setTasks] = useState<Task[]>(mockRoadmapTasks);
    const [showSummary, setShowSummary] = useState(false);

    const handleTaskToggle = (taskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = (completedTasks / totalTasks) * 100;
    const nextTask = tasks.find(task => !task.completed);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListTodo /> Roadmap de Postulación</CardTitle>
                    <CardDescription>Sigue esta lista de tareas para una postulación exitosa y ordenada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 rounded-md bg-muted/30"
                        >
                            <Checkbox
                                id={task.id}
                                checked={task.completed}
                                onCheckedChange={() => handleTaskToggle(task.id)}
                            />
                            <label
                                htmlFor={task.id}
                                className={cn(
                                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
                                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                                )}
                            >
                                {task.label}
                            </label>
                             {task.completed && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                        </motion.div>
                    ))}
                </CardContent>
                 <div className="p-6 pt-0 text-center">
                    <Button onClick={() => setShowSummary(true)} disabled={showSummary}>
                        <FileCheck className="mr-2" />
                        Generar Resumen de Postulación
                    </Button>
                </div>
            </Card>

            {showSummary && (
                <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                >
                     <Card className="bg-blue-600/10 border-blue-500/30">
                        <CardHeader>
                            <CardTitle className="text-blue-400">Resumen de Postulación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-foreground">Progreso General</span>
                                    <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="[&>div]:bg-blue-500" />
                            </div>
                            <div className="text-sm">
                                <p><span className="font-semibold text-foreground">Documentos completados:</span> {completedTasks} de {totalTasks}</p>
                                <p><span className="font-semibold text-foreground">Próxima tarea:</span> {nextTask ? nextTask.label : '¡Todas las tareas completadas!'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
