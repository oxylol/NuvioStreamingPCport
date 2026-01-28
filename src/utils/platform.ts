/**
 * Platform Detection Utilities
 * Provides cross-platform detection for iOS, Android, Web, and Desktop (Electron)
 */
import { Platform, Dimensions } from 'react-native';

export type PlatformType = 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';

/**
 * Check if running in Electron
 */
export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).electronAPI?.isElectron;
};

/**
 * Check if running on web (browser or Electron)
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Check if running on mobile (iOS or Android)
 */
export const isMobile = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Check if running on desktop (Electron)
 */
export const isDesktop = (): boolean => {
  return isWeb() && isElectron();
};

/**
 * Check if running in a browser (web but not Electron)
 */
export const isBrowser = (): boolean => {
  return isWeb() && !isElectron();
};

/**
 * Get the current platform type
 */
export const getPlatform = (): PlatformType => {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';

  if (isWeb()) {
    if (isElectron()) {
      // Determine desktop OS
      const platform = (window as any).electronAPI?.getPlatform?.();
      if (platform === 'darwin') return 'macos';
      if (platform === 'win32') return 'windows';
      if (platform === 'linux') return 'linux';
      return 'windows'; // Default to Windows for unknown
    }
    return 'web';
  }

  return 'web';
};

/**
 * Check if the platform supports touch input
 */
export const hasTouch = (): boolean => {
  if (isMobile()) return true;
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Check if the platform supports mouse input
 */
export const hasMouse = (): boolean => {
  if (isDesktop()) return true;
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: fine)')?.matches ?? false;
};

/**
 * Check if the screen is large (tablet or desktop)
 */
export const isLargeScreen = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  return minDimension >= 600;
};

/**
 * Check if the device is a tablet
 */
export const isTablet = (): boolean => {
  if (isDesktop()) return false;
  return isMobile() && isLargeScreen();
};

/**
 * Get electron API if available
 */
export const getElectronAPI = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).electronAPI || null;
};

/**
 * Platform-specific value selector
 * Similar to Platform.select but with additional desktop support
 */
export function selectPlatform<T>(options: {
  ios?: T;
  android?: T;
  web?: T;
  desktop?: T;
  default?: T;
}): T | undefined {
  if (isDesktop() && options.desktop !== undefined) return options.desktop;
  if (isIOS() && options.ios !== undefined) return options.ios;
  if (isAndroid() && options.android !== undefined) return options.android;
  if (isWeb() && options.web !== undefined) return options.web;
  return options.default;
}

/**
 * Run a callback only on specific platforms
 */
export function runOnPlatform(
  platforms: PlatformType[],
  callback: () => void
): void {
  const currentPlatform = getPlatform();
  if (platforms.includes(currentPlatform)) {
    callback();
  }
}

/**
 * Hook to get responsive breakpoint
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';

export const getBreakpoint = (): Breakpoint => {
  const { width } = Dimensions.get('window');

  if (width < 600) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  return 'large-desktop';
};

/**
 * Get number of columns for grid based on screen size
 */
export const getGridColumns = (): number => {
  const breakpoint = getBreakpoint();

  switch (breakpoint) {
    case 'mobile': return 2;
    case 'tablet': return 3;
    case 'desktop': return 5;
    case 'large-desktop': return 6;
    default: return 4;
  }
};

export default {
  isElectron,
  isWeb,
  isMobile,
  isIOS,
  isAndroid,
  isDesktop,
  isBrowser,
  getPlatform,
  hasTouch,
  hasMouse,
  isLargeScreen,
  isTablet,
  getElectronAPI,
  selectPlatform,
  runOnPlatform,
  getBreakpoint,
  getGridColumns,
};
