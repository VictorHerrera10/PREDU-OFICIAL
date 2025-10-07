'use client';

import { useUser } from '@/firebase/provider';
import { redirect } from 'next/navigation';
import { ComponentType, useEffect } from 'react';

export default function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithAuthComponent = (props: P) => {
    const { user, isUserLoading } = useUser();

    useEffect(() => {
      if (!isUserLoading && !user) {
        redirect('/login');
      }
    }, [user, isUserLoading]);

    if (isUserLoading) {
      return <div>Loading...</div>; // Or a spinner
    }

    if (!user) {
      return null; // or a loading component, redirect is happening in useEffect
    }

    return <WrappedComponent {...props} />;
  };
  WithAuthComponent.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  return WithAuthComponent;
}
