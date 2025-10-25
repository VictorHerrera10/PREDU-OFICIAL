'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function VersionBadge() {
  const [version, setVersion] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // This ensures the version is only set on the client-side after initial render, preventing hydration mismatch.
    setVersion("0.51.1");
  }, []);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);

  if (!version) {
    return null; // Don't render anything until the version is set on the client
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
