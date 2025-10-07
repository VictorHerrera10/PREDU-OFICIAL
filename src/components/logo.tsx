import { Gamepad2 } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Gamepad2 className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold font-headline text-glow-primary">
        Pixel Vault
      </h1>
    </div>
  );
}
