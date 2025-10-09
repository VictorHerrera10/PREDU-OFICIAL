'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, notificationStore } from '@/lib/notifications';

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedNotifications = notificationStore.get();
    setNotifications(storedNotifications);
    setUnreadCount(storedNotifications.filter(n => !n.read).length);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      read: false,
      createdAt: Date.now(),
    };
    
    setNotifications(prev => {
        const updated = [newNotification, ...prev];
        notificationStore.set(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
    });

  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      notificationStore.set(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      notificationStore.set(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, []);
  
  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, deleteNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
