'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ShieldAlert, MessageSquare } from 'lucide-react';
import { SupportChatList, UserProfile } from './SupportChatList';
import { AdminChatView } from './AdminChatView';

function AdminSupportPage() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        <Card className="md:col-span-1 bg-card/80 backdrop-blur-sm border-border/50 flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Soporte Técnico</h1>
              <p className="text-muted-foreground text-sm">
                Gestiona las conversaciones de los usuarios.
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-2">
            <SupportChatList onSelectChat={setSelectedUser} selectedUserId={selectedUser?.id} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm border-border/50">
          {selectedUser ? (
            <AdminChatView recipientUser={selectedUser} key={selectedUser.id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4" />
              <h3 className="font-semibold text-lg">Selecciona un chat</h3>
              <p>Elige una conversación de la lista para ver los mensajes.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AdminSupportPage;
