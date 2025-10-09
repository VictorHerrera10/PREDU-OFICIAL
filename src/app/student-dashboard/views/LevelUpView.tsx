'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Shield, Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const levels = [
  {
    name: 'Nivel Caballero',
    icon: Shield,
    price: 'Gratis',
    description: 'El punto de partida de todo héroe. Accede a las herramientas esenciales para descubrir tu vocación.',
    features: ['Test Vocacional RIASEC', 'Test de Calificaciones', 'Recomendación de Carrera Básica', 'Dashboard Personal'],
    current: true,
    buttonText: 'Tu Nivel Actual',
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
  },
  {
    name: 'Nivel Maestro Supremo',
    icon: Gem,
    price: 'S/ 39.99',
    description: 'El dominio total de tu futuro profesional con mentoría y soporte personalizado.',
    features: ['Todo en Héroe', 'Sesiones de mentoría con psicólogos', 'Simuladores de entrevistas', 'Soporte prioritario'],
    current: false,
    buttonText: 'Alcanzar la Maestría',
  },
];

export function LevelUpView() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg shadow-primary/30 animate-[pulse-glow_4s_ease-in-out_infinite]"
            >
              <Sparkles className="w-8 h-8" />
              <span className="sr-only">Subir de Nivel</span>
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="max-w-5xl bg-transparent border-none shadow-none p-0">
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 overflow-hidden">
            <DialogHeader className="p-6 text-center">
              <DialogTitle className="text-3xl font-bold text-primary font-headline">
                ¡Elige tu Destino!
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">
                Sube de nivel para desbloquear nuevas habilidades y herramientas en tu aventura vocacional.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {levels.map((level, index) => (
                <motion.div
                  key={level.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card
                    className={cn(
                      'flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2',
                      level.recommended
                        ? 'border-primary ring-2 ring-primary/70 shadow-lg shadow-primary/20'
                        : 'border-border/50',
                      level.current ? 'bg-muted/30' : 'bg-background/50'
                    )}
                  >
                    <CardHeader className="items-center text-center">
                      <level.icon
                        className={cn(
                          'w-12 h-12 mb-4',
                          level.recommended ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <CardTitle className="text-2xl font-bold">{level.name}</CardTitle>
                      <p className="text-3xl font-headline text-primary">{level.price}</p>
                      <p className="text-sm text-muted-foreground min-h-[40px]">{level.description}</p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {level.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground/90">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={level.recommended ? 'default' : 'secondary'}
                        disabled={level.current}
                      >
                        {level.buttonText}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
