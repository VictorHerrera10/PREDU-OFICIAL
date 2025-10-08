'use client';

import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoutButton } from '@/components/logout-button';
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
  const [selectedView, setSelectedView] = useState<View | null>('inicio');

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
        <LogoutButton />
      </header>

      <main className="flex-grow pt-20">
        <LayoutGroup>
          <AnimatePresence>
            {!selectedView && (
              <motion.div
                key="welcome"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="w-full max-w-4xl mx-auto text-center px-4"
              >
                <CardHeader>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                    ¡Hola de nuevo, {user?.displayName || 'Estudiante'}! 🚀
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
            className={
              selectedView
                ? 'flex justify-center items-center gap-4 py-4 px-4 border-b'
                : 'grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto px-4 mt-8'
            }
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {options.map((option) => (
              <motion.div
                layout
                key={option.id}
                onClick={() => setSelectedView(option.id)}
                className={`cursor-pointer overflow-hidden ${selectedView ? '' : 'bg-card/80 backdrop-blur-sm border hover:border-primary/50 transition-all transform hover:-translate-y-1 rounded-lg flex flex-col items-center text-center'}`}
                initial={{ borderRadius: '0.5rem' }}
                animate={{ borderRadius: selectedView ? '0.5rem' : '0.5rem' }}
              >
                {selectedView === option.id || !selectedView ? (
                  <div
                    className={
                      selectedView
                        ? `flex items-center gap-2 px-4 py-2 rounded-lg ${selectedView === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`
                        : 'h-full flex flex-col items-center text-center p-6'
                    }
                  >
                    <AnimatePresence>
                      <motion.div
                        layout="position"
                        className={selectedView ? '' : 'flex items-center gap-4'}
                      >
                        <option.icon className={selectedView ? "w-5 h-5" : "w-10 h-10 text-primary"} />
                      </motion.div>
                    </AnimatePresence>
                    
                    <motion.div layout="position">
                      <h2 className={`font-bold ${selectedView ? 'text-sm' : 'text-2xl mt-4'}`}>{option.title}</h2>
                      {!selectedView && (
                          <motion.p 
                            initial={{ opacity: 1 }} 
                            animate={{ opacity: selectedView ? 0 : 1 }}
                            className="text-muted-foreground text-sm mt-1"
                          >
                              {option.description}
                          </motion.p>
                      )}
                    </motion.div>
                  </div>
                ) : (
                   <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80"
                  >
                     <option.icon className="w-5 h-5" />
                     <h2 className="font-bold text-sm">{option.title}</h2>
                  </div>
                )}
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
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
