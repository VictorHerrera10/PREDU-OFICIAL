'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function VersionBadge() {
  const [version, setVersion] = useState<string | null>(null);
  const [currentPathname, setCurrentPathname] = useState<string>('');

  useEffect(() => {
    // Safely set the version and pathname on the client-side to avoid hydration errors.
    setVersion('0.55.0');
    setCurrentPathname(window.location.pathname);
  }, []);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPathname);

  // Render nothing on the server and initial client render to avoid hydration mismatch
  if (!version) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", !isAuthPage && "group")}>
      <div className={cn(
          "flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-lg px-2 py-1.5 text-xs font-mono shadow-lg transition-all duration-300 overflow-hidden",
          isAuthPage 
            ? "w-auto px-3 py-1.5" 
            : "w-9 h-9 group-hover:w-auto group-hover:px-3 group-hover:py-1.5"
      )}>
        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
        <span className={cn(
            "text-muted-foreground whitespace-nowrap transition-opacity delay-150 duration-200",
            isAuthPage ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          Beta | v <span className="font-bold text-foreground">{version}</span>
        </span>
      </div>
    </div>
  );
}
