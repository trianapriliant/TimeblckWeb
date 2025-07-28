'use client';
import { useState, useEffect, useCallback } from 'react';

type PermissionStatus = 'default' | 'granted' | 'denied';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<PermissionStatus>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission as PermissionStatus);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    const status = await Notification.requestPermission();
    setPermission(status);
  }, []);

  return { permission, requestPermission };
}
