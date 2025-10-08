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
  const [selectedView, setSelectedView] = useState<View>('inicio');

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
          <motion.div
            layout
            key="options-container"
            className={'flex justify-center items-center gap-4 py-4 px-4 border-b'}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {options.map((option) => (
              <motion.div
                layout
                key={option.id}
                onClick={() => setSelectedView(option.id)}
                className={`cursor-pointer overflow-hidden rounded-lg`}
                initial={{ borderRadius: '0.5rem' }}
              >
                <div
                    className={
                        `flex items-center gap-2 px-4 py-2 rounded-lg ${selectedView === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`
                    }
                  >
                    <motion.div layout="position">
                        <option.icon className={"w-5 h-5"} />
                    </motion.div>
                    
                    <motion.div layout="position">
                      <h2 className={`font-bold text-sm`}>{option.title}</h2>
                    </motion.div>
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
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
