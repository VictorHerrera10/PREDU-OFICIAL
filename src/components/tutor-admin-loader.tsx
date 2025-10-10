
'use client';

import { HashLoader } from 'react-spinners';

type Props = {
    loadingText: string;
}

export function TutorAdminLoader({ loadingText }: Props) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 gap-8">
            <HashLoader color="#fde047" size={60} />
            <p className="mt-4 text-muted-foreground animate-pulse">{loadingText}</p>
       </div>
    );
}
