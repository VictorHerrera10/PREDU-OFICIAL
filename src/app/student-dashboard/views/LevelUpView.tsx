'use client';

import { useState, useEffect, useRef } from 'react';
import useResizeObserver from 'use-resize-observer';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent } from '@/components/ui/dialog';
import { Check, Shield, Crown, Gem, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

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
    features: [
        'Todo del Nivel Caballero', 
        'Chatbot con IA, consejos y reportes avanzados',
        'Explorador de carreras, universidades y becas', 
        'Enviar reportes por correo y soporte 24/7'
    ],
    current: false,
    buttonText: 'Convertirme en Héroe',
    recommended: true,
    borderColor: 'border-destructive', // Rojo
  },
  {
    name: 'Nivel Maestro Supremo',
    icon: Gem,
    price: 'S/ 39.99',
    description: 'Desbloquea el dominio total de tu futuro profesional al vincularte con tu institución educativa.',
    features: ['Todo del Nivel Héroe', 'Vinculación con tu institución y tutores', 'Mentoría y reportes avanzados', 'Foro inter-institucional y chat'],
    current: false,
    buttonText: 'Vincular',
    isInstitutional: true,
    borderColor: 'border-blue-500', // Azul
  },
];

type LevelUpViewProps = {
  isViewSelected: boolean;
};

export function LevelUpView({ isViewSelected }: LevelUpViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { ref, width = 0, height = 0 } = useResizeObserver<HTMLBodyElement>();
  
  const [institutionCode, setInstitutionCode] = useState(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...institutionCode];
    // Allow only single alphanumeric character
    newCode[index] = value.slice(-1).toUpperCase();
    setInstitutionCode(newCode);

    // Move to next input
    if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !institutionCode[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
      }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const newCode = [...institutionCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setInstitutionCode(newCode);

    const lastFullIndex = Math.min(pastedData.length, 6) - 1;
    if (lastFullIndex >= 0 && inputRefs.current[lastFullIndex]) {
        inputRefs.current[lastFullIndex]?.focus();
    }
  };


  return (
    <>
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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <motion.button
                  className={cn(
                    "fixed bottom-6 right-6 z-30 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center animate-[pulse-glow_4s_ease-in-out_infinite] transition-all duration-300",
                    isViewSelected ? 'h-12 w-12' : 'h-16 w-16'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Sparkles className={cn(isViewSelected ? 'h-6 w-6' : 'h-8 w-8')} />
                  <span className="sr-only">Subir de Nivel</span>
                </motion.button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-destructive text-destructive-foreground">
              <p>¡Sube de Nivel!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent className="max-w-7xl w-full bg-background/95 backdrop-blur-sm border-border/50 shadow-lg p-6">
           <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary z-50">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
          <DialogHeader className="text-center my-1">
            <DialogTitleComponent className="text-lg font-bold text-destructive font-headline">
              ¡Elige tu Destino!
            </DialogTitleComponent>
            <DialogDescriptionComponent className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Sube de nivel para desbloquear nuevas habilidades y herramientas en tu aventura vocacional.
            </DialogDescriptionComponent>
          </DialogHeader>

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
                        'w-8 h-8 mb-2',
                        level.recommended ? 'text-destructive' : level.borderColor === 'border-primary' ? 'text-primary' : 'text-blue-500'
                      )}
                    />
                    <CardTitleComponent className="text-base font-bold">{level.name}</CardTitleComponent>
                    <p className="text-lg font-headline text-foreground">{level.price}</p>
                    <CardDescriptionComponent className="text-xs text-muted-foreground min-h-[30px]">{level.description}</CardDescriptionComponent>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-1.5">
                      {level.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex-col pt-4">
                    {level.isInstitutional ? (
                       <form className="w-full space-y-3">
                          <Label htmlFor="institution-code" className="text-xs text-center text-muted-foreground">Ingresa el Código Secreto de tu Institución</Label>
                           <input type="hidden" name="institutionId" value={institutionCode.join('')} />
                            <div className="flex justify-center gap-2">
                                {institutionCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-10 h-10 text-center text-lg font-mono uppercase bg-input"
                                    />
                                ))}
                            </div>
                          <Button className="w-full btn-retro !text-sm !font-bold">
                            {level.buttonText}
                          </Button>
                       </form>
                    ) : level.recommended ? (
                        <Button asChild className="w-full" variant="destructive">
                           <Link href="/payment">{level.buttonText}</Link>
                        </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={level.current ? 'outline' : 'secondary'}
                        disabled={level.current}
                      >
                        {level.buttonText}
                      </Button>
                    )}
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
