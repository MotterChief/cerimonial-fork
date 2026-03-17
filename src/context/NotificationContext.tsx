'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ReactDOM from 'react-dom';
import NotificationContainer from '@/components/Notification';

export type NotificationType = 'success' | 'error' | 'warning';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextData {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000); // A notificação desaparecerá após 5 segundos
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {typeof window !== 'undefined' && ReactDOM.createPortal(
        <NotificationContainer notifications={notifications} />,
        document.body
      )}
    </NotificationContext.Provider>
  );
};
