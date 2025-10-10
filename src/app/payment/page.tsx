'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useResizeObserver from 'use-resize-observer';
import Confetti from 'react-confetti';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WindowControls } from '@/components/window-controls';
import { Crown, CreditCard, User, Calendar, Lock, Loader2, PartyPopper } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const { ref, width = 0, height = 0 } = useResizeObserver<HTMLBodyElement>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ref(document.body);
    }
  }, [ref]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        router.push('/student-dashboard');
      }, 5000); // Redirect after 5 seconds
    }, 3000); // Simulate processing for 3 seconds
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {isPaid && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <div className="w-full max-w-md">
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 overflow-hidden">
          <WindowControls />
          <div className="p-6 md:p-8">
            {isPaid ? (
              <div className="text-center flex flex-col items-center justify-center">
                <PartyPopper className="w-16 h-16 text-primary mb-4 animate-bounce" />
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl font-bold text-primary">
                    ¡Pago Exitoso! 🎉
                  </CardTitle>
                  <CardDescription>
                    ¡Felicidades! Has desbloqueado el Nivel Héroe. Serás redirigido en unos segundos...
                  </CardDescription>
                </CardHeader>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CardHeader className="p-0 mb-6 text-center">
                  <Crown className="w-12 h-12 mx-auto text-destructive mb-2" />
                  <CardTitle className="text-2xl font-bold text-primary">Nivel Héroe</CardTitle>
                  <CardDescription>
                    Estás a un paso de desbloquear herramientas avanzadas.
                  </CardDescription>
                </CardHeader>
                
                <div className="flex justify-between items-baseline mb-6 border-t border-b border-dashed py-3">
                  <span className="text-muted-foreground">Total a Pagar:</span>
                  <span className="text-2xl font-bold font-headline text-foreground">S/ 19.99</span>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2"><User /> Nombre del Titular</Label>
                    <Input id="name" type="text" placeholder="Tu nombre como aparece en la tarjeta" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="flex items-center gap-2"><CreditCard /> Número de Tarjeta</Label>
                    <Input id="cardNumber" type="text" placeholder="•••• •••• •••• ••••" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="flex items-center gap-2"><Calendar /> Vencimiento</Label>
                      <Input id="expiry" type="text" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="flex items-center gap-2"><Lock /> CVC</Label>
                      <Input id="cvc" type="text" placeholder="•••" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-retro mt-4" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Pagar S/ 19.99'
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
