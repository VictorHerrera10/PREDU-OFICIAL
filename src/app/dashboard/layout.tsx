'use client';

import { useUser } from '@/firebase/provider';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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
       <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando tu mochila...</p>
       </div>
    )
  }

  // user object might be null for a brief moment, so we also check for that
  if (!user) {
     return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Redirigiendo a la entrada...</p>
       </div>
    )
  }

  return <>{children}</>;
}
