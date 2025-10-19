'use client';

import { Shield } from 'lucide-react';
import packageJson from '../../package.json';

export function VersionBadge() {
  const version = packageJson.version;

  return (
    <div className="fixed bottom-4 right-4 z-50 group">
      <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-lg px-2 py-1.5 text-xs font-mono shadow-lg transition-all duration-300 w-9 h-9 group-hover:w-auto group-hover:px-3 group-hover:py-1.5 overflow-hidden">
        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
        <span className="text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-150 duration-200">
          Beta | v <span className="font-bold text-foreground">{version}</span>
        </span>
      </div>
    </div>
  );
}
