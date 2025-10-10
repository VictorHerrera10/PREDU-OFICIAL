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
    if (!isUserLoading && !user) {
      redirect(`/login?redirect=${pathname}`);
    }
  }, [user, isUserLoading, pathname]);

  if (isUserLoading) {
    return (
       <StudentLoader loadingText="Verificando tu mochila..." />
    )
  }

  // user object might be null for a brief moment, so we also check for that
  if (!user) {
     return (
       <StudentLoader loadingText="Redirigiendo a la entrada..." />
    )
  }

  return <>{children}</>;
}
