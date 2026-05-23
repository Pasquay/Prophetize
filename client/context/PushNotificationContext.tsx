import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import * as api from '../utils/api';

type PushNotificationContextType = {
  expoPushToken: string | null;
};

const PushNotificationContext = createContext<PushNotificationContextType>({
  expoPushToken: null,
});

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { token: authToken } = useAuth();
  const expoPushTokenRef = useRef<string | null>(null);
  const NRef = useRef<any>(null);
  const [notificationsReady, setNotificationsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let notificationListener: any;
    let responseListener: any;

    (async () => {
      try {
        const N = await import('expo-notifications');
        NRef.current = N;

        N.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        await N.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: N.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });

        notificationListener = N.addNotificationReceivedListener((notification: any) => {
          console.log('push received', notification.request.content.data);
        });

        responseListener = N.addNotificationResponseReceivedListener((response: any) => {
          const data = response.notification.request.content.data;
          if (data?.targetPath && typeof data.targetPath === 'string') {
          }
        });

        setNotificationsReady(true);
      } catch {
        // Notifications not available
      }
    })();

    return () => {
      const N = NRef.current;
      if (notificationListener) {
        N?.removeNotificationSubscription(notificationListener);
      }
      if (responseListener) {
        N?.removeNotificationSubscription(responseListener);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const N = NRef.current;

    if (authToken && notificationsReady && N) {
      (async () => {
        try {
          const { status: existingStatus } = await N.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await N.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== 'granted') {
            console.log('push permission not granted');
            return;
          }

          const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          if (!projectId) {
            console.log('push: no projectId found');
            return;
          }

          const tokenData = await N.getExpoPushTokenAsync({ projectId });
          const pushToken = tokenData.data;
          expoPushTokenRef.current = pushToken;

          const platform = Platform.OS === 'ios' ? 'ios' : 'android';
          await api.post('/notifications/register-push-token', {
            token: pushToken,
            platform,
          });
        } catch (e) {
          console.log('push token registration failed', e);
        }
      })();
    } else if (expoPushTokenRef.current) {
      api.post('/notifications/unregister-push-token', {
        token: expoPushTokenRef.current,
      }).catch(() => {});
      expoPushTokenRef.current = null;
    }
  }, [authToken, notificationsReady]);

  return (
    <PushNotificationContext.Provider value={{ expoPushToken: expoPushTokenRef.current }}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  return useContext(PushNotificationContext);
}
