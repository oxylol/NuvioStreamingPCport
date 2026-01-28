/**
 * Mock for expo-screen-orientation on web
 */

export const Orientation = {
  UNKNOWN: 0,
  PORTRAIT_UP: 1,
  PORTRAIT_DOWN: 2,
  LANDSCAPE_LEFT: 3,
  LANDSCAPE_RIGHT: 4,
} as const;

export const OrientationLock = {
  DEFAULT: 0,
  ALL: 1,
  PORTRAIT: 2,
  PORTRAIT_UP: 3,
  PORTRAIT_DOWN: 4,
  LANDSCAPE: 5,
  LANDSCAPE_LEFT: 6,
  LANDSCAPE_RIGHT: 7,
  OTHER: 8,
} as const;

export const SizeClassIOS = {
  REGULAR: 0,
  COMPACT: 1,
  UNKNOWN: 2,
} as const;

export const WebOrientationLock = {
  PORTRAIT_PRIMARY: 'portrait-primary',
  PORTRAIT_SECONDARY: 'portrait-secondary',
  PORTRAIT: 'portrait',
  LANDSCAPE_PRIMARY: 'landscape-primary',
  LANDSCAPE_SECONDARY: 'landscape-secondary',
  LANDSCAPE: 'landscape',
  ANY: 'any',
  NATURAL: 'natural',
  UNKNOWN: 'unknown',
} as const;

export async function getOrientationAsync(): Promise<number> {
  if (typeof window !== 'undefined') {
    const isLandscape = window.innerWidth > window.innerHeight;
    return isLandscape ? Orientation.LANDSCAPE_LEFT : Orientation.PORTRAIT_UP;
  }
  return Orientation.UNKNOWN;
}

export async function getOrientationLockAsync(): Promise<number> {
  return OrientationLock.DEFAULT;
}

export async function lockAsync(orientationLock: number): Promise<void> {
  // Try to use the Screen Orientation API if available
  if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
    try {
      const lockType = orientationLock === OrientationLock.LANDSCAPE
        ? 'landscape'
        : orientationLock === OrientationLock.PORTRAIT
          ? 'portrait'
          : 'any';
      // @ts-ignore - ScreenOrientation API
      await window.screen.orientation.lock(lockType);
    } catch {
      // Orientation lock not supported
    }
  }
}

export async function unlockAsync(): Promise<void> {
  if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
    try {
      // @ts-ignore - ScreenOrientation API
      window.screen.orientation.unlock();
    } catch {
      // Orientation unlock not supported
    }
  }
}

export async function getPlatformOrientationLockAsync(): Promise<{ screenOrientationArrayIOS?: number[]; screenOrientationConstantAndroid?: number }> {
  return {};
}

export async function supportsOrientationLockAsync(_orientationLock: number): Promise<boolean> {
  return false;
}

export function addOrientationChangeListener(
  listener: (event: { orientationInfo: { orientation: number } }) => void
): { remove: () => void } {
  const handler = () => {
    getOrientationAsync().then(orientation => {
      listener({ orientationInfo: { orientation } });
    });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handler);
    return {
      remove: () => window.removeEventListener('resize', handler),
    };
  }

  return { remove: () => {} };
}

export function removeOrientationChangeListeners(): void {
  // No-op on web
}

export default {
  Orientation,
  OrientationLock,
  SizeClassIOS,
  WebOrientationLock,
  getOrientationAsync,
  getOrientationLockAsync,
  lockAsync,
  unlockAsync,
  getPlatformOrientationLockAsync,
  supportsOrientationLockAsync,
  addOrientationChangeListener,
  removeOrientationChangeListeners,
};
