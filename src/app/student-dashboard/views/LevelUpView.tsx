'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Check, Shield, Crown, Gem, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const levels = [
  {
    name: 'Nivel Caballero',
    icon: Shield,
    price: 'Gratis',
    description: 'El punto de partida de todo héroe. Accede a las herramientas esenciales para descubrir tu vocación.',
    features: ['Test Vocacional RIASEC', 'Test de Calificaciones', 'Recomendación de Carrera Básica', 'Dashboard Personal'],
    current: true,
    buttonText: 'Tu Nivel Actual',
    borderColor: 'border-primary', // Amarillo
  },
  {
    name: 'Nivel Héroe',
    icon: Crown,
    price: 'S/ 19.99',
    description: 'Potencia tu camino con análisis avanzados y herramientas de exploración profesional.',
    features: ['Todo en Caballero', 'Análisis detallado de resultados', 'Explorador de carreras y universidades', 'Plan de mejora de habilidades'],
    current: false,
    buttonText: 'Convertirme en Héroe',
    recommended: true,
    borderColor: 'border-destructive', // Rojo
  },
  {
    name: 'Nivel Maestro Supremo',
    icon: Gem,
    price: 'S/ 39.99',
    description: 'El dominio total de tu futuro profesional con mentoría y soporte personalizado.',
    features: ['Todo en Héroe', 'Sesiones de mentoría con psicólogos', 'Simuladores de entrevistas', 'Soporte prioritario'],
    current: false,
    buttonText: 'Alcanzar la Maestría',
    borderColor: 'border-blue-500', // Azul
  },
];

export function LevelUpView() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <motion.button
                          className="fixed bottom-6 right-6 z-30 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center animate-[pulse-glow_4s_ease-in-out_infinite]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Sparkles className="h-8 w-8" />
                          <span className="sr-only">Subir de Nivel</span>
                        </motion.button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-primary text-primary-foreground">
                    <p>¡Sube de Nivel!</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="max-w-7xl w-full bg-background/95 backdrop-blur-sm border-border/50 shadow-lg p-6">
           <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary z-50">
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
            </DialogClose>
          <div className="text-center my-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary font-headline">
              ¡Elige tu Destino!
            </h1>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
              Sube de nivel para desbloquear nuevas habilidades y herramientas en tu aventura vocacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  className={cn(
                    'flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 border-2',
                    level.borderColor,
                    level.recommended
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : '',
                    level.recommended ? `ring-destructive` : '',
                    level.current ? 'bg-muted/30' : 'bg-card'
                  )}
                >
                  <CardHeader className="items-center text-center">
                    <level.icon
                      className={cn(
                        'w-10 h-10 mb-3',
                        level.recommended ? 'text-destructive' : level.borderColor === 'border-primary' ? 'text-primary' : 'text-blue-500'
                      )}
                    />
                    <CardTitle className="text-xl font-bold">{level.name}</CardTitle>
                    <p className="text-2xl font-headline text-foreground">{level.price}</p>
                    <CardDescription className="text-xs text-muted-foreground min-h-[30px]">{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {level.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={level.recommended ? 'destructive' : level.current ? 'outline' : 'secondary'}
                      disabled={level.current}
                    >
                      {level.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
