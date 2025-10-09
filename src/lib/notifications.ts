'use client';

import { v4 as uuidv4 } from 'uuid';

export type Notification = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  read: boolean;
  createdAt: number;
};

const NOTIFICATIONS_STORAGE_KEY = 'predu-notifications';

const getStoredNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse notifications from localStorage", error);
    return [];
  }
};

const setStoredNotifications = (notifications: Notification[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Failed to save notifications to localStorage", error);
  }
};

export const notificationStore = {
  get: getStoredNotifications,
  set: setStoredNotifications,
};
