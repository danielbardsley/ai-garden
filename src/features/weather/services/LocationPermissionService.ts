import { Platform } from 'react-native';

import { LocationCoordinates } from '../models/WeatherWidgetState';

export type LocationPermissionResult =
  | { status: 'granted'; coordinates: LocationCoordinates }
  | { status: 'denied' | 'unavailable'; error?: Error };

type ExpoLocationModule = typeof import('expo-location');

export class LocationPermissionService {
  async getCurrentCoordinates(): Promise<LocationPermissionResult> {
    if (Platform.OS === 'web') {
      return this.getWebCoordinates();
    }

    try {
      const location = await this.loadExpoLocation();
      const permission = await location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return { status: 'denied', error: new Error('Location permission was denied.') };
      }
      const position = await location.getCurrentPositionAsync({ accuracy: location.Accuracy.Balanced });
      return {
        status: 'granted',
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
    } catch (error) {
      return { status: 'unavailable', error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  private async loadExpoLocation(): Promise<ExpoLocationModule> {
    // Keep the native module out of the initial render path so a missing Expo Go
    // module or stale client reports as widget-unavailable instead of crashing Home.
    return import('expo-location');
  }

  private getWebCoordinates(): Promise<LocationPermissionResult> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return Promise.resolve({ status: 'unavailable', error: new Error('Geolocation is unavailable.') });
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            status: 'granted',
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          resolve({ status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable', error: new Error(error.message) });
        },
        { enableHighAccuracy: false, maximumAge: 1000 * 60 * 30, timeout: 8000 }
      );
    });
  }
}
