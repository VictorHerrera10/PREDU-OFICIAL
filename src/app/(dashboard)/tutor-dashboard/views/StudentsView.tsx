'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail } from 'lucide-react';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  institutionId?: string;
};

export default function StudentsView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    
    // We need the tutor's profile to find their institutionId
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    // Now query for students in that institution
    const studentsQuery = useMemo(() => {
        if (!userProfile?.institutionId || !firestore) return null;
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', userProfile.institutionId),
            where('role', '==', 'student')
        );
    }, [userProfile, firestore]);

    const { data: students, isLoading: areStudentsLoading } = useCollection<UserProfile>(studentsQuery);
    
    const isLoading = isProfileLoading || areStudentsLoading;

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary" /> Estudiantes</CardTitle>
                <CardDescription>
                    Lista de estudiantes registrados en tu institución.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {students && students.length > 0 ? (
                    <div className="space-y-3">
                        {students.map(student => (
                            <div key={student.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background/50">
                                <Avatar>
                                    <AvatarImage src={student.profilePictureUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.username}`} />
                                    <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{student.username}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {student.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-muted-foreground text-center py-8">
                        Aún no hay estudiantes registrados en tu institución.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// We need useDoc for the tutor's profile
import { doc, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import React, { useState, useEffect } from 'react';

type WithId<T> = T & { id: string };
interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

function useDoc<T = any>(
  docRef: doc<DocumentData> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: any) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: docRef.path,
        })
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, isLoading, error };
}

import { onSnapshot } from 'firebase/firestore';
