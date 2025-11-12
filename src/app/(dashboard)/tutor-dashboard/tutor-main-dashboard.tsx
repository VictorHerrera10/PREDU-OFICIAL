'use client';

import { useState, useMemo } from 'react';
import { Logo } from '@/components/logo';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { Home, School, Users, GraduationCap } from 'lucide-react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Inbox } from '@/components/chat/Inbox';

import HomeView from './views/HomeView';
import StudentsView from './views/StudentsView'; 
import { InstitutionHeader } from './institution-header';
import { GroupHeader } from './group-header';
import GroupView from './views/GroupView';

type View = 'inicio' | 'estudiantes' | 'grupo';

type Option = {
  id: View;
  icon: React.ElementType;
  title: string;
  description: string;
};

type UserProfile = {
  institutionId?: string;
};

type Props = {
    user: User | null;
};

export function TutorMainDashboard({ user }: Props) {
  const [selectedView, setSelectedView] = useState<View>('inicio');
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isIndependentTutor = !userProfile?.institutionId;

  const options: Option[] = useMemo(() => {
    const baseOptions = [
      { id: 'inicio', icon: Home, title: 'Inicio', description: 'Tu resumen, notificaciones y próximos pasos.' } as const,
    ];
    if (isIndependentTutor) {
      return [
        ...baseOptions,
        { id: 'grupo', icon: Users, title: 'Mi Grupo', description: 'Información y estadísticas de tu grupo.' } as const,
      ];
    }
    return [
      ...baseOptions,
      { id: 'estudiantes', icon: GraduationCap, title: 'Estudiantes', description: 'Revisa el progreso y los resultados de tus estudiantes.' } as const,
    ];
  }, [isIndependentTutor]);


  const renderContent = () => {
    switch (selectedView) {
      case 'inicio':
        return <HomeView />;
      case 'estudiantes':
        return <StudentsView />;
      case 'grupo':
        return <GroupView />;
      default:
        // Por defecto, mostramos la vista de inicio si no hay nada seleccionado
        return <HomeView />;
    }
  };
  
  const handleSelectView = (viewId: View) => {
    setSelectedView(viewId);
  };


  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-20">
        <header className="p-4 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b">
          <Logo />
          <UserNav />
        </header>
        <div className="bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            {isIndependentTutor ? <GroupHeader /> : <InstitutionHeader />}
          </div>
        </div>
      </div>

      <main className="flex-grow pt-32">
        <LayoutGroup>
          <motion.div
            layout
            key="options-container"
            className={`grid gap-8 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 grid-cols-${options.length}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {options.map((option) => (
              <motion.div
                layout
                key={option.id}
                onClick={() => handleSelectView(option.id)}
                className="cursor-pointer overflow-hidden rounded-lg"
                initial={{ borderRadius: '0.75rem' }}
              >
                <div
                    className={
                        `p-6 flex items-center justify-center gap-2 ${selectedView === option.id ? 'bg-primary text-primary-foreground rounded-lg' 
                        : 'bg-muted hover:bg-muted/80 rounded-lg'}`
                    }
                  >
                    <motion.div layout="position">
                        <option.icon className="w-5 h-5" />
                    </motion.div>
                    
                    <div className="flex flex-col">
                      <motion.h2 layout="position" className="font-bold text-sm">{option.title}</motion.h2>
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
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>

      {user && (
        <div className="fixed bottom-20 right-6 z-30 flex flex-col items-end gap-4">
          <Inbox user={user} />
        </div>
      )}
    </div>
  );
}
