import { generateGameStyleMessage } from '@/ai/flows/generate-game-style-message';
import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LogOut, Terminal } from 'lucide-react';

export default async function DashboardPage() {
  const welcomeMessageData = await generateGameStyleMessage({
    username: 'Player 1',
    event: 'login',
  });
  const welcomeMessage = welcomeMessageData.message;

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo />
        <form action={logout}>
          <Button variant="ghost" type="submit" className="text-muted-foreground hover:text-primary">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl text-center shadow-2xl shadow-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">LEVEL 1: The Vault</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full rounded-md border border-dashed border-secondary/50 bg-secondary/10 p-6">
                <div className="flex items-center gap-3 justify-center">
                    <Terminal className="h-6 w-6 text-secondary" />
                    <p className="font-mono text-lg font-bold text-secondary">
                        {welcomeMessage}
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
