'use client';

import React from 'react';
import styles from './Notification.module.css';

export type NotificationType = 'success' | 'error' | 'warning';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContainerProps {
  notifications: Notification[];
}

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '!',
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications }) => {
  return (
    <div className={styles.notificationContainer}>
      {notifications.map(notification => (
        <div key={notification.id} className={`${styles.notification} ${styles[notification.type]}`}>
          <span className={styles.icon}>{iconMap[notification.type]}</span>
          <p className={styles.message}>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
