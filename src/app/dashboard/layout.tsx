'use client';

import { useUser } from '@/firebase/provider';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

  if (isUserLoading || !user) {
    // You can show a loading spinner here
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}