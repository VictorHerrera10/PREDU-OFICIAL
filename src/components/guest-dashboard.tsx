'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Compass, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { UserNav } from './user-nav';

type View = 'inicio' | 'prediccionAcademica' | 'prediccionPsicologica';

const mainOptions = [
  { id: 'inicio', icon: Home, title: 'Inicio', description: 'Un resumen de lo que puedes lograr y tus próximos pasos.' },
  { id: 'prediccionAcademica', icon: Compass, title: 'Predicción Académica', description: 'Descubre tu vocación profesional basado en tus notas.' },
  { id: 'prediccionPsicologica', icon: BrainCircuit, title: 'Predicción Psicológica', description: 'Entiende tus fortalezas y áreas de mejora personal.' },
];

const WelcomeContent = () => (
    <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="font-bold text-xl mb-2 text-primary">¡Explora Predu!</h3>
        <p className="text-muted-foreground">
            Selecciona una de las opciones de arriba para ver una demostración. <br/>
            Regístrate para guardar tu progreso y desbloquear todo tu potencial.
        </p>
    </div>
);


export function GuestDashboard() {
  const [selectedView, setSelectedView] = useState<View | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      toast({
        title: '🚀 ¿Listo para el siguiente nivel?',
        description: 'Inicia sesión o regístrate para guardar tu progreso y desbloquear todas las funciones.',
        duration: 5000,
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);


  const renderContent = () => {
    switch (selectedView) {
      case 'inicio':
        return <WelcomeContent />;
      case 'prediccionAcademica':
        return <WelcomeContent />;
      case 'prediccionPsicologica':
        return <WelcomeContent />;
      default:
        return <WelcomeContent />;
    }
  };

  const handleSelectView = (viewId: View) => {
    if (selectedView === viewId) {
      setSelectedView(null);
    } else {
      setSelectedView(viewId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b fixed top-0 left-0 right-0 z-20">
        <Logo />
        <UserNav />
      </header>

      <main className="flex-grow pt-20">
        <LayoutGroup>
          <AnimatePresence>
            {!selectedView && (
              <motion.div
                key="welcome-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center px-4 my-8"
              >
                <CardHeader>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                    ¡Bienvenido a Predu! 🚀
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-2">
                    Estás en el modo invitado. Explora nuestras herramientas y regístrate para una experiencia completa.
                  </CardDescription>
                </CardHeader>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            key="options-container"
            className={cn(
              "grid gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8",
              selectedView ? `grid-cols-${mainOptions.length}` : 'grid-cols-1 md:grid-cols-3'
            )}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {mainOptions.map((option) => (
              <motion.div
                layout
                key={option.id}
                onClick={() => handleSelectView(option.id as View)}
                className={cn(
                  "cursor-pointer overflow-hidden",
                  selectedView ? 'rounded-lg' : 'card-outline'
                )}
                initial={{ borderRadius: '0.75rem' }}
              >
                 <AnimatePresence>
                  {selectedView === option.id ? (
                    <motion.div className="text-primary-foreground bg-primary rounded-lg p-3 flex items-center justify-center gap-2">
                      <motion.div layout="position">
                        <option.icon className="w-5 h-5" />
                      </motion.div>
                      <motion.h2 layout="position" className="font-bold text-sm">{option.title}</motion.h2>
                    </motion.div>
                  ) : selectedView ? (
                     <motion.div
                      className="bg-muted hover:bg-muted/80 rounded-lg p-3 flex items-center justify-center gap-2"
                      onClick={() => handleSelectView(option.id as View)}
                    >
                      <motion.div layout="position">
                        <option.icon className="w-5 h-5" />
                      </motion.div>
                      <motion.h2 layout="position" className="font-bold text-sm">{option.title}</motion.h2>
                    </motion.div>
                  ) : (
                     <div className="card-content flex flex-col items-center text-center gap-4 p-6">
                      <motion.div layout="position">
                        <option.icon className="w-10 h-10 text-primary" />
                      </motion.div>
                      <div className="flex flex-col">
                        <motion.h2 layout="position" className="font-bold text-2xl">{option.title}</motion.h2>
                        <motion.p
                          layout
                          className="text-muted-foreground mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {option.description}
                        </motion.p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </LayoutGroup>

        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedView}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedView && renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
