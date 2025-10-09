'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, notificationStore } from '@/lib/notifications';

// 1. Define the type for the context value
type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
};

// 2. Create the context with an undefined initial value
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// 3. Create the provider component
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const storedNotifications = notificationStore.get();
    setNotifications(storedNotifications);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => {
        // Validation logic: if a type is provided, check for duplicates
        if (notification.type) {
            const existingNotification = prev.find(n => n.type === notification.type);
            if (existingNotification) {
                return prev; // Do not add if a notification of the same type already exists
            }
        }

        const newNotification: Notification = {
          ...notification,
          id: uuidv4(),
          read: false,
          createdAt: Date.now(),
        };
        
        const updated = [newNotification, ...prev];
        notificationStore.set(updated);
        return updated;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      notificationStore.set(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      notificationStore.set(updated);
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    deleteNotification
  }), [notifications, unreadCount, addNotification, markAsRead, deleteNotification]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// 4. Create the custom hook to consume the context
export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
