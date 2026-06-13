import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { BackgroundGeolocationPlugin, CallbackError, Location } from '@capacitor-community/background-geolocation';

export type RunTrackerPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
  timestamp: number;
};

export type RunTrackerError = {
  code?: string;
  message: string;
};

type RunTrackerCallback = (point?: RunTrackerPoint, error?: RunTrackerError) => void;

export type RunTrackerHandle = {
  mode: 'native-background' | 'web';
  stop: () => Promise<void>;
};

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

const normalizeNativeLocation = (location: Location): RunTrackerPoint => ({
  latitude: location.latitude,
  longitude: location.longitude,
  accuracy: location.accuracy,
  speed: location.speed,
  timestamp: location.time || Date.now(),
});

const normalizeWebPosition = (position: GeolocationPosition): RunTrackerPoint => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
  speed: position.coords.speed,
  timestamp: position.timestamp || Date.now(),
});

const normalizeNativeError = (error: CallbackError): RunTrackerError => ({
  code: error.code,
  message: error.message || 'Native location tracking failed.',
});

const startWebTracker = (callback: RunTrackerCallback): RunTrackerHandle => {
  if (!navigator.geolocation) {
    window.setTimeout(() => callback(undefined, { message: 'GPS is not available on this device.' }), 0);
    return {
      mode: 'web',
      stop: async () => undefined,
    };
  }

  const watchId = navigator.geolocation.watchPosition(
    position => callback(normalizeWebPosition(position)),
    error => callback(undefined, { code: String(error.code), message: error.message || 'GPS signal timed out.' }),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );

  return {
    mode: 'web',
    stop: async () => navigator.geolocation.clearWatch(watchId),
  };
};

export const startRunTracker = async (callback: RunTrackerCallback): Promise<RunTrackerHandle> => {
  if (!Capacitor.isNativePlatform()) {
    return startWebTracker(callback);
  }

  const notificationPermission = await LocalNotifications.checkPermissions();
  if (notificationPermission.display !== 'granted') {
    await LocalNotifications.requestPermissions();
  }

  const watcherId = await BackgroundGeolocation.addWatcher(
    {
      backgroundTitle: 'R.L.L Lite distance quest',
      backgroundMessage: 'Tracking your active distance quest.',
      requestPermissions: true,
      stale: false,
      distanceFilter: 1,
    },
    (location, error) => {
      if (error) {
        callback(undefined, normalizeNativeError(error));
        return;
      }
      if (location) {
        callback(normalizeNativeLocation(location));
      }
    }
  );

  return {
    mode: 'native-background',
    stop: async () => BackgroundGeolocation.removeWatcher({ id: watcherId }),
  };
};

export const openRunTrackerSettings = async () => {
  if (Capacitor.isNativePlatform()) {
    await BackgroundGeolocation.openSettings();
  }
};
