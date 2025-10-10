'use client';

import { useAuth } from '@/firebase';
import { Button, ButtonProps } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React from 'react';

// This function can be exported and called from anywhere, making it more reusable.
export const handleLogout = async (auth: any, router: any, toast: any) => {
  if (!auth) return;
  try {
    await signOut(auth);
    setTimeout(() => {
        toast({
          title: '¡Hasta la próxima clase! 👋',
          description: 'Vuelve pronto, ¡el conocimiento te espera!',
        });
    }, 4000);
    router.push('/login'); // Explicit redirection
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    toast({
      variant: 'destructive',
      title: 'Error al salir 😵',
      description: 'No pudimos cerrar la sesión. Inténtalo de nuevo.',
    });
  }
};


type LogoutButtonProps = ButtonProps & {
  asChild?: boolean;
};

// The component can now just be a simple button if needed elsewhere.
export const LogoutButton = React.forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    return (
      <Button
        ref={ref}
        variant="ghost"
        onClick={() => handleLogout(auth, router, toast)}
        className={cn('text-muted-foreground hover:text-primary-foreground', className)}
        {...props}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Salir del Aula
      </Button>
    );
  }
);
LogoutButton.displayName = 'LogoutButton';
