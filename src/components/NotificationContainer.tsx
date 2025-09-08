import React from 'react';
import { NotificationBanner } from './NotificationBanner';
import { useNotificationContext } from '../contexts/NotificationContext';

export const NotificationContainer: React.FC = () => {
  const { notifications, dismissNotification } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {notifications.map((notification) => (
        <NotificationBanner
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          actionText={notification.actionText}
          onAction={notification.onAction}
          onDismiss={notification.dismissible !== false ? () => dismissNotification(notification.id) : undefined}
          dismissible={notification.dismissible !== false}
        />
      ))}
    </div>
  );
};