'use client';
import { generateGameStyleMessage } from '@/ai/flows/generate-game-style-message';
import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LogOut, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';

function DashboardPage() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const { user } = useUser();

  useEffect(() => {
    async function getMessage() {
      if (user) {
        const welcomeMessageData = await generateGameStyleMessage({
          username: user.displayName || 'Estudiante',
          event: 'login',
        });
        setWelcomeMessage(welcomeMessageData.message);
      }
    }
    getMessage();
  }, [user]);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo />
        <form action={logout}>
          <Button
            variant="ghost"
            type="submit"
            className="text-muted-foreground hover:text-primary-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl text-center bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              LEVEL 1: The Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full border border-dashed border-secondary/50 bg-black/50 p-6">
              <div className="flex items-center gap-3 justify-center">
                <Terminal className="h-6 w-6 text-secondary" />
                <p className="font-mono text-lg font-bold text-secondary">
                  {welcomeMessage || 'Loading...'}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              Your digital treasures are safe here.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default DashboardPage;
