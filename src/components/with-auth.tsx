'use client';

import { useUser } from '@/firebase/provider';
import { redirect } from 'next/navigation';
import { ComponentType, useEffect } from 'react';
import { usePathname } from 'next/navigation';


export default function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithAuthComponent = (props: P) => {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();

    useEffect(() => {
      if (!isUserLoading && !user) {
        redirect(`/login?redirect=${pathname}`);
      }
    }, [user, isUserLoading, pathname]);

    if (isUserLoading || !user) {
      return <div>Loading...</div>; // Or a spinner
    }

    return <WrappedComponent {...props} />;
  };
  WithAuthComponent.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  return WithAuthComponent;
}
