import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Gamepad2 className="h-6 w-6 text-primary" />
      {!iconOnly && (
        <h1 className="text-xl font-bold font-headline text-glow-primary">
          Predu
        </h1>
      )}
    </div>
  );
}
