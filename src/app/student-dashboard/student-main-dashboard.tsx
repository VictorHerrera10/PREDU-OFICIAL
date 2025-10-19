'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Logo } from '@/components/logo';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { BrainCircuit, Compass, Home, Award, BookOpen, Building, Route, MessagesSquare } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import RuiView from './views/RUI/RuiView';
import { InstitutionHeader } from './institution-header';
import { Inbox } from '@/components/chat/Inbox';

type View = 'inicio' | 'prediccionAcademica' | 'prediccionPsicologica' | 'infoCarreras' | 'infoUniversidades' | 'infoBecas' | 'rui';

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
  { id: 'infoCarreras', icon: BookOpen, title: 'Carreras', description: 'Explora un universo de profesiones y encuentra tu lugar.', isHero: true },
  { id: 'infoUniversidades', icon: Building, title: 'Universidades', description: 'Busca y compara instituciones para tu futuro académico.', isHero: true },
  { id: 'infoBecas', icon: Award, title: 'Becas', description: 'Encuentra oportunidades de financiamiento para tus estudios.', isHero: true },
];

type UserProfile = {
  isHero?: boolean;
  institutionId?: string;
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

  const isInstitutional = !!userProfile?.institutionId;
  const themeClass = isInstitutional ? 'theme-institutional' : userProfile?.isHero ? 'theme-hero' : '';

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
      case 'rui':
        return <RuiView />;
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
    <div className={cn("flex flex-col min-h-screen", themeClass)}>
      <div className="fixed top-0 left-0 right-0 z-20">
        <header className="p-4 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b">
          <Logo />
          <UserNav />
        </header>
        {isInstitutional && <InstitutionHeader />}
      </div>

      {(userProfile?.isHero || isInstitutional) && (
        <div className="group fixed top-1/2 left-4 -translate-y-1/2 z-10 flex flex-col items-center gap-4 p-2 bg-card/60 backdrop-blur-sm border rounded-lg w-20 hover:w-48 transition-all duration-300">
          {heroOptions.map(option => (
            <Button
              key={option.id}
              variant="ghost"
              className={cn(
                "w-full h-16 flex items-center justify-start transition-all duration-300 rounded-lg",
                selectedView === option.id ? (isInstitutional ? 'bg-blue-600/20' : 'bg-destructive/20') : ''
              )}
              onClick={() => handleSelectView(option.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-10">
                  <option.icon
                    style={{ width: '30px', height: '30px' }}
                    className="text-foreground flex-shrink-0"
                  />
                </div>
                <span className="font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                  {option.title}
                </span>
              </div>
            </Button>
          ))}
        </div>
      )}

      <main className={cn("flex-grow", (userProfile?.isHero || isInstitutional) ? "md:ml-24" : "", isInstitutional ? "pt-32" : "pt-20")}>
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
                    <motion.div className={cn("text-primary-foreground rounded-lg p-3 flex items-center justify-center gap-2", isInstitutional ? "bg-blue-600" : "bg-primary")}>
                      <motion.div layout="position">
                        <option.icon className="w-5 h-5" />
                      </motion.div>
                      <motion.h2 layout="position" className="font-bold text-sm">{option.title}</motion.h2>
                    </motion.div>
                  ) : selectedView ? (
                    <motion.div
                      className="bg-muted hover:bg-muted/80 rounded-lg p-3 flex items-center justify-center gap-2"
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
                        <option.icon className={cn("w-10 h-10", isInstitutional ? "text-blue-500" : "text-primary")} />
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

        {!selectedView && (userProfile?.isHero || isInstitutional) && (
          <motion.div
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => handleSelectView('rui')}
              >
                <Route className="mr-2 h-5 w-5" />
                Iniciar Ruta Universitaria Interactiva (RUI)
              </Button>
            </div>
          </motion.div>
        )}

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

      {!userProfile?.isHero && !isInstitutional && <LevelUpView isViewSelected={!!selectedView} />}
      
        <div className="fixed bottom-24 right-8 z-30 flex flex-col items-end gap-4">
            {userProfile?.isHero && <HeroChatButton />}
            {user && <Inbox user={user} />}
        </div>
    </div>
  );
}
