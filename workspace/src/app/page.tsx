'use client';

import { useUser } from '@/firebase';
import { StudentLoader } from '@/components/student-loader';
import { GuestDashboard } from '@/components/guest-dashboard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and is NOT anonymous, redirect them
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <StudentLoader loadingText="Cargando experiencia de invitado..." />;
  }

  // If user is anonymous or there is no user yet (before anonymous sign-in completes)
  // or if they are a registered user waiting for redirect.
  if (!user || user.isAnonymous) {
    return <GuestDashboard />;
  }
  
  // If a registered user lands here, they will be redirected by the useEffect.
  // We can show a loader while that happens.
  return <StudentLoader loadingText="Redirigiendo a tu dashboard..." />;
}
