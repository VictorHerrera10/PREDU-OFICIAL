'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { verifyTutorAndLogin } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/components/logout-button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { CheckCircle, KeySquare, ArrowLeft } from 'lucide-react';
import { WindowControls } from '@/components/window-controls';
import { Button } from '@/components/ui/button';


const initialState = {
  message: null,
  success: false,
};

export default function TutorVerificationPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [state, formAction] = useActionState(verifyTutorAndLogin, initialState);

  const [uniqueCode, setUniqueCode] = useState(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Error de Verificación 😵',
        description: state.message,
      });
    }
  }, [state, toast]);
  
  const handleCodeChange = (index: number, value: string) => {
    if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 1) {
      const newCode = [...uniqueCode];
      newCode[index] = value.toUpperCase();
      setUniqueCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
   const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !uniqueCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const newCode = [...uniqueCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setUniqueCode(newCode);

    const lastFullIndex = Math.min(pastedData.length, 6) -1;
    if (lastFullIndex >= 0 && inputRefs.current[lastFullIndex]) {
       inputRefs.current[lastFullIndex]?.focus();
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 overflow-hidden">
          <WindowControls />
          <div className="relative p-6 md:p-8">
            <Button variant="ghost" size="sm" onClick={() => handleLogout(auth, router, toast)} className="absolute top-2 left-2 text-primary/80 hover:text-primary transition-colors flex items-center gap-1 text-xs">
                <ArrowLeft className="w-3 h-3" />
                Volver al Login
            </Button>
            <CardHeader className="p-0 pt-8 mb-6 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-primary">¡Solicitud Aprobada!</CardTitle>
              <CardDescription>
                ¡Felicidades, {user?.displayName}! Para tu seguridad, necesitamos un último paso. Ingresa tu DNI y el código de tu grupo para acceder.
              </CardDescription>
            </CardHeader>
            
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="userId" value={user?.uid} />
                <input type="hidden" name="uniqueCode" value={uniqueCode.join('')} />
                
                <div className="space-y-2">
                    <Label htmlFor="dni">Documento Nacional de Identidad (DNI)</Label>
                    <Input id="dni" name="dni" type="text" placeholder="Tu número de DNI" required maxLength={8} />
                </div>

                <div className="pt-4 flex flex-col items-center">
                    <Label className="flex items-center gap-2 mb-2 text-center"><KeySquare className="w-4 h-4"/> Código de Grupo</Label>
                    <div className="flex justify-center gap-2">
                        {uniqueCode.map((digit, index) => (
                            <Input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-10 h-10 text-center text-lg font-mono uppercase bg-input"
                                required
                            />
                        ))}
                    </div>
                </div>

                <SubmitButton className="w-full btn-retro">Acceder al Dashboard</SubmitButton>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
