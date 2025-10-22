'use client';

import { useUser } from '@/firebase/provider';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { StudentLoader } from '@/components/student-loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and there's no user or the user is anonymous, redirect to login
    if (!isUserLoading && (!user || user.isAnonymous)) {
      redirect(`/login?redirect=${pathname}`);
    }
  }, [user, isUserLoading, pathname]);

  if (isUserLoading || !user || user.isAnonymous) {
    return (
       <StudentLoader loadingText="Verificando tu mochila..." />
    )
  }

  return <>{children}</>;
}
