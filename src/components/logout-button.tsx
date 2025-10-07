'use client';

import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function LogoutButton() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
      // El layout del dashboard se encargará de redirigir a /login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la sesión.',
      });
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-primary-foreground"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar Sesión
    </Button>
  );
}
