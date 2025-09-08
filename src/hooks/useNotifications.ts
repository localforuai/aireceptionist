import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
  persistent?: boolean;
  timestamp: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setNotifications(prev => {
      // Remove any existing notifications with the same type and title to avoid duplicates
      const filtered = prev.filter(n => !(n.type === notification.type && n.title === notification.title));
      return [...filtered, newNotification];
    });

    // Auto-dismiss non-persistent notifications after 10 seconds
    if (!notification.persistent) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 10000);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Clean up old notifications (older than 1 hour)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      setNotifications(prev => prev.filter(n => n.timestamp > oneHourAgo));
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  };
};