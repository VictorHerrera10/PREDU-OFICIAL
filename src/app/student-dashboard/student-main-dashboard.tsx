'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Logo } from '@/components/logo';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { BrainCircuit, Compass, Home, Award, BookOpen, Building } from 'lucide-react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import HomeView from './views/HomeView';
import AcademicPredictionView from './views/AcademicPredictionView';
import PsychologicalPredictionView from './views/PsychologicalPredictionView';
import { LevelUpView } from './views/LevelUpView';
import { cn } from '@/lib/utils';
import { StudentLoader } from '@/components/student-loader';
import { HeroChatButton } from '@/components/hero-chat-button';
import CareerInfoView from './views/CareerInfoView';
import UniversityInfoView from './views/UniversityInfoView';
import ScholarshipInfoView from './views/ScholarshipInfoView';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type View = 'inicio' | 'prediccionAcademica' | 'prediccionPsicologica' | 'infoCarreras' | 'infoUniversidades' | 'infoBecas';

type Option = {
  id: View;
  icon: React.ElementType;
  title: string;
  description: string;
  isHero?: boolean;
};

const mainOptions: Option[] = [
  { id: 'inicio', icon: Home, title: 'Inicio', description: 'Tu resumen, notificaciones y próximos pasos.' },
  { id: 'prediccionAcademica', icon: Compass, title: 'Predicción Académica', description: 'Realiza tests para descubrir tu vocación profesional.' },
  { id: 'prediccionPsicologica', icon: BrainCircuit, title: 'Predicción Psicológica', description: 'Entiende tus fortalezas y áreas de mejora personal.' },
];

const heroOptions: Option[] = [
  { id: 'infoCarreras', icon: BookOpen, title: 'Info de Carreras', description: 'Explora un universo de profesiones y encuentra tu lugar.', isHero: true },
  { id: 'infoUniversidades', icon: Building, title: 'Info de Universidades', description: 'Busca y compara instituciones para tu futuro académico.', isHero: true },
  { id: 'infoBecas', icon: Award, title: 'Info de Becas', description: 'Encuentra oportunidades de financiamiento para tus estudios.', isHero: true },
];

type UserProfile = {
  isHero?: boolean;
};

type Props = {
    user: User | null;
};

export function StudentMainDashboard({ user }: Props) {
  const [selectedView, setSelectedView] = useState<View | null>(null);
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  const renderContent = () => {
    switch (selectedView) {
      case 'inicio':
        return <HomeView />;
      case 'prediccionAcademica':
        return <AcademicPredictionView />;
      case 'prediccionPsicologica':
        return <PsychologicalPredictionView />;
      case 'infoCarreras':
        return <CareerInfoView />;
      case 'infoUniversidades':
        return <UniversityInfoView />;
      case 'infoBecas':
        return <ScholarshipInfoView />;
      default:
        return null;
    }
  };
  
  const handleSelectView = (viewId: View) => {
    if (selectedView === viewId) {
        setSelectedView(null);
    } else {
        setSelectedView(viewId);
    }
  };

  if (isLoading) {
    return <StudentLoader loadingText="Cargando tu nivel de Héroe..." />;
  }

  return (
    <div className={cn("flex flex-col min-h-screen", userProfile?.isHero && 'theme-hero')}>
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-background/80 backdrop-blur-sm border-b">
        <Logo />
        <UserNav />
      </header>

       {userProfile?.isHero && (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="fixed top-1/2 left-4 -translate-y-1/2 z-10 flex flex-col items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border rounded-lg"
            >
                <h3 className="font-headline text-sm text-destructive mb-2">INFORMACIÓN</h3>
                
                {heroOptions.map(option => (
                  <Button 
                      key={option.id}
                      variant={selectedView === option.id ? 'destructive' : 'ghost'} 
                      className="w-full h-auto flex flex-col items-center justify-center p-3 gap-2"
                      onClick={() => handleSelectView(option.id)}
                  >
                      <option.icon className="w-12 h-12"/>
                      <span className="text-xs font-semibold">{option.title}</span>
                  </Button>
                ))}
            </motion.div>
        </AnimatePresence>
      )}

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
                    onClick={() => handleSelectView(option.id)}
                    className={cn(
                        "cursor-pointer overflow-hidden",
                        selectedView ? 'rounded-lg' : 'card-outline'
                    )}
                    initial={{ borderRadius: '0.75rem' }}
                >
                    <AnimatePresence>
                    {selectedView === option.id ? (
                        <motion.div className="bg-primary text-primary-foreground rounded-lg p-3 flex items-center justify-center gap-2">
                             <motion.div layout="position">
                                <option.icon className="w-5 h-5" />
                            </motion.div>
                             <motion.h2 layout="position" className="font-bold text-sm">{option.title}</motion.h2>
                        </motion.div>
                    ) : selectedView ? (
                         <motion.div className="bg-muted hover:bg-muted/80 rounded-lg p-3 flex items-center justify-center gap-2"
                            onClick={() => handleSelectView(option.id)}
                         >
                             <motion.div layout="position">
                                <option.icon className="w-5 h-5" />
                            </motion.div>
                             <motion.h2 layout="position" className="font-bold text-sm">{option.title}</motion.h2>
                        </motion.div>
                    ) : (
                        <div className="card-content flex flex-col items-center text-center gap-4 p-6">
                            <motion.div layout="position">
                                <option.icon className={cn("w-10 h-10", option.isHero ? "text-destructive" : "text-primary")} />
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
      {!userProfile?.isHero && <LevelUpView isViewSelected={!!selectedView} />}
      <HeroChatButton />
    </div>
  );
}
