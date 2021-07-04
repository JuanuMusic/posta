import { useContext } from "react";
import { createContext, useState } from "react";

export interface INotification {
    title: string;
    text: string;
}

interface INotificationsContext {
  addNotification(notification: INotification): void;
  notifications: INotification[];
}

const context = createContext<INotificationsContext | null>(null);

export default function NotificationProvider({ children }: { children: any }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const addNotification = (notification: INotification) => {
    setNotifications([...notifications, notification]);
  };

  return (
    <context.Provider value={{ addNotification, notifications }}>
      {children}
    </context.Provider>
  );
}

NotificationProvider.context = context;


export function useNotifications() {
    return useContext(NotificationProvider.context)
}