'use client';

import { useAuth } from '@/firebase';
import { Button, ButtonProps } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React from 'react';

type LogoutButtonProps = ButtonProps & {
  asChild?: boolean;
};

export const LogoutButton = React.forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
      if (!auth) return;
      try {
        await signOut(auth);
        toast({
          title: '¡Hasta la próxima clase! 👋',
          description: 'Vuelve pronto, ¡el conocimiento te espera!',
        });
        router.push('/login'); // Redirección explícita
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        toast({
          variant: 'destructive',
          title: 'Error al salir 😵',
          description: 'No pudimos cerrar la sesión. Inténtalo de nuevo.',
        });
      }
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        onClick={handleLogout}
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