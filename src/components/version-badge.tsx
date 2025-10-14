'use client';

import { Shield } from 'lucide-react';
import packageJson from '../../package.json';

export function VersionBadge() {
  const version = packageJson.version;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-lg px-3 py-1.5 text-xs font-mono shadow-lg">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span className="text-muted-foreground">
          v<span className="font-bold text-foreground">{version}</span> Beta
        </span>
      </div>
    </div>
  );
}
