/**
 * Mock for expo-keep-awake on web
 * Uses the Wake Lock API when available
 */

let wakeLock: WakeLockSentinel | null = null;

export async function activateKeepAwake(tag?: string): Promise<void> {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      // @ts-ignore - Wake Lock API
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated:', tag);
    } catch (err) {
      console.log('Wake lock not available:', err);
    }
  }
}

export async function activateKeepAwakeAsync(tag?: string): Promise<void> {
  return activateKeepAwake(tag);
}

export function deactivateKeepAwake(tag?: string): void {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
    console.log('Wake lock deactivated:', tag);
  }
}

export function deactivateKeepAwakeAsync(tag?: string): Promise<void> {
  deactivateKeepAwake(tag);
  return Promise.resolve();
}

export function useKeepAwake(tag?: string): void {
  // Hook version - activates on mount, deactivates on unmount
  if (typeof window !== 'undefined') {
    activateKeepAwake(tag);
  }
}

export function isAvailableAsync(): Promise<boolean> {
  return Promise.resolve(
    typeof navigator !== 'undefined' && 'wakeLock' in navigator
  );
}

export default {
  activateKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  deactivateKeepAwakeAsync,
  useKeepAwake,
  isAvailableAsync,
};
