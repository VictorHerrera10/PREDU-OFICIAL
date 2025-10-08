'use client';

import { useState } from 'react';
import { Logo } from '@/components/logo';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { BrainCircuit, Compass, Home } from 'lucide-react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import HomeView from './views/HomeView';
import AcademicPredictionView from './views/AcademicPredictionView';
import PsychologicalPredictionView from './views/PsychologicalPredictionView';

type View = 'inicio' | 'prediccionAcademica' | 'prediccionPsicologica';

type Option = {
  id: View;
  icon: React.ElementType;
  title: string;
  description: string;
};

const options: Option[] = [
  { id: 'inicio', icon: Home, title: 'Inicio', description: 'Tu resumen, notificaciones y próximos pasos.' },
  { id: 'prediccionAcademica', icon: Compass, title: 'Predicción Académica', description: 'Realiza tests para descubrir tu vocación profesional.' },
  { id: 'prediccionPsicologica', icon: BrainCircuit, title: 'Predicción Psicológica', description: 'Entiende tus fortalezas y áreas de mejora personal.' },
];

type Props = {
    user: User | null;
};

export function StudentMainDashboard({ user }: Props) {
  const [selectedView, setSelectedView] = useState<View | null>(null);

  const renderContent = () => {
    switch (selectedView) {
      case 'inicio':
        return <HomeView />;
      case 'prediccionAcademica':
        return <AcademicPredictionView />;
      case 'prediccionPsicologica':
        return <PsychologicalPredictionView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-background/80 backdrop-blur-sm border-b">
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
                className="text-center px-4 mb-8"
              >
                <CardHeader>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                    ¡Hola de nuevo, {user?.displayName}! 🚀
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-2">
                    Este es tu centro de mando para el éxito. ¿Qué quieres hacer hoy?
                  </CardDescription>
                </CardHeader>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            layout
            key="options-container"
            className={`grid gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${selectedView ? 'grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {options.map((option) => (
              <motion.div
                layout
                key={option.id}
                onClick={() => setSelectedView(option.id)}
                className={`cursor-pointer overflow-hidden rounded-lg ${selectedView ? '' : 'bg-card/80 backdrop-blur-sm border text-left hover:border-primary/50 transition-all transform hover:-translate-y-1'}`}
                initial={{ borderRadius: '0.75rem' }}
              >
                <div
                    className={
                        `p-6 ${selectedView === option.id ? 'bg-primary text-primary-foreground rounded-lg' 
                        : selectedView ? 'bg-muted hover:bg-muted/80 rounded-lg' 
                        : 'flex flex-col items-center text-center gap-4'} ${selectedView ? 'flex items-center justify-center gap-2' : ''}`
                    }
                  >
                    <motion.div layout="position">
                        <option.icon className={selectedView ? "w-5 h-5" : "w-10 h-10 text-primary"} />
                    </motion.div>
                    
                    <div className="flex flex-col">
                      <motion.h2 layout="position" className={`font-bold ${selectedView ? 'text-sm' : 'text-2xl'}`}>{option.title}</motion.h2>
                      <AnimatePresence>
                        {!selectedView && (
                          <motion.p 
                            layout 
                            className="text-muted-foreground mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {option.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
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
