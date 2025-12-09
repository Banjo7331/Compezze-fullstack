import React, { createContext, useContext, useState, useEffect } from 'react';

export type NotificationType = 'SURVEY' | 'CONTEST' | 'QUIZ' | 'SYSTEM';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    timestamp: number;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        const saved = localStorage.getItem('app_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (dto: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotif: AppNotification = {
            ...dto,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            isRead: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };
    
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }

    const clearAll = () => setNotifications([]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, clearAll, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationCenter = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotificationCenter must be used within NotificationProvider");
    return context;
};