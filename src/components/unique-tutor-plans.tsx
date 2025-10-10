'use client';

import { useState, useEffect } from 'react';
import useResizeObserver from 'use-resize-observer';
import Confetti from 'react-confetti';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as CardTitleComponent, CardDescription as CardDescriptionComponent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Gem, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HeroTutorForm } from './hero-tutor-form';

const plans = [
    {
    name: 'Nivel Institucional',
    icon: Gem,
    price: 'Plan Institucional',
    description: 'Accede con el código de tu colegio para desbloquear todas las herramientas de gestión y mentoría.',
    features: ['Todo del Nivel Héroe', 'Vinculación con tu institución y tutores', 'Mentoría y reportes avanzados', 'Foro inter-institucional y chat'],
    buttonText: 'Registrarme por Institución',
    borderColor: 'border-blue-500',
    isInstitutional: true,
  },
  {
    name: 'Nivel Héroe',
    icon: Crown,
    price: 'S/ 19.99',
    description: 'Potencia tu camino con análisis avanzados y herramientas de exploración profesional.',
    features: [
        'Todo del Nivel Caballero', 
        'Chatbot con IA, consejos y reportes avanzados',
        'Explorador de carreras, universidades y becas', 
        'Enviar reportes por correo y soporte 24/7'
    ],
    buttonText: 'Convertirme en Héroe',
    recommended: true,
    borderColor: 'border-destructive',
  },
];

export function UniqueTutorPlans({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const { ref, width = 0, height = 0 } = useResizeObserver<HTMLBodyElement>();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            ref(document.body);
        }
    }, [ref]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setShowConfetti(true);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
             <DialogContent className="max-w-4xl w-full bg-background/95 backdrop-blur-sm border-border/50 shadow-lg p-6">
                {showConfetti && (
                    <div className="fixed inset-0 z-[101] pointer-events-none">
                        <Confetti
                            width={width}
                            height={height}
                            recycle={false}
                            numberOfPieces={400}
                            gravity={0.1}
                            onConfettiComplete={() => setShowConfetti(false)}
                        />
                    </div>
                )}
                <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary z-50">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                </DialogClose>
                <DialogHeader className="text-center my-1 sm:text-center">
                    <DialogTitle className="text-lg font-bold text-primary font-headline">
                        ¡Planes para Tutores Independientes!
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        Elige un plan para acceder a herramientas avanzadas y potenciar tu labor de guía.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                        <Card
                        className={cn(
                            'flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 border-2 bg-card',
                            plan.borderColor,
                            plan.recommended
                            ? 'ring-2 ring-offset-2 ring-offset-background'
                            : '',
                            plan.recommended ? `ring-destructive` : ''
                        )}
                        >
                        <CardHeader className="items-center text-center">
                            <plan.icon
                            className={cn(
                                'w-8 h-8 mb-2',
                                plan.borderColor === 'border-destructive' ? 'text-destructive' : 'text-blue-500'
                            )}
                            />
                            <CardTitleComponent className="text-base font-bold">{plan.name}</CardTitleComponent>
                            <p className="text-lg font-headline text-foreground">{plan.price}</p>
                            <CardDescriptionComponent className="text-xs text-muted-foreground min-h-[30px]">{plan.description}</CardDescriptionComponent>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-1.5">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-foreground/80">{feature}</span>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {plan.isInstitutional ? (
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {plan.buttonText}
                                </Button>
                            ) : (
                                <HeroTutorForm>
                                    <Button
                                        className="w-full"
                                        variant={plan.recommended ? 'destructive' : 'secondary'}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </HeroTutorForm>
                            )}
                        </CardFooter>
                        </Card>
                    </motion.div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
