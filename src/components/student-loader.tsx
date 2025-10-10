
'use client';

import { PacmanLoader } from 'react-spinners';

type Props = {
    loadingText: string;
}

export function StudentLoader({ loadingText }: Props) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 gap-8">
            <PacmanLoader color="#fde047" size={50} />
            <p className="text-muted-foreground animate-pulse">{loadingText}</p>
       </div>
    );
}
