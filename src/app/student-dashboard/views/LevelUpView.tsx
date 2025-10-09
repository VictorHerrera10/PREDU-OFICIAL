'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Shield, Crown, Gem, ArrowLeft } from 'lucide-react';
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

type Props = {
    onBack: () => void;
};

export function LevelUpView({ onBack }: Props) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary font-headline">
          ¡Elige tu Destino!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Sube de nivel para desbloquear nuevas habilidades y herramientas en tu aventura vocacional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                level.current ? 'bg-muted/30' : 'bg-background/50'
              )}
            >
              <CardHeader className="items-center text-center">
                <level.icon
                  className={cn(
                    'w-12 h-12 mb-4',
                    level.recommended ? 'text-destructive' : level.borderColor === 'border-primary' ? 'text-primary' : 'text-blue-500'
                  )}
                />
                <CardTitle className="text-2xl font-bold">{level.name}</CardTitle>
                <p className="text-3xl font-headline text-foreground">{level.price}</p>
                <CardDescription className="text-sm text-muted-foreground min-h-[40px]">{level.description}</CardDescription>
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
      
      <div className="mt-12 text-center">
          <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mi actividad
          </Button>
      </div>
    </div>
  );
}
