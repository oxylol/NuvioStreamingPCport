/**
 * Mock for expo-brightness on web
 */

export async function getBrightnessAsync(): Promise<number> {
  return 1;
}

export async function setBrightnessAsync(_brightness: number): Promise<void> {
  // No-op on web - can't control screen brightness
}

export async function getSystemBrightnessAsync(): Promise<number> {
  return 1;
}

export async function setSystemBrightnessAsync(_brightness: number): Promise<void> {
  // No-op on web
}

export async function useSystemBrightnessAsync(): Promise<void> {
  // No-op on web
}

export async function isUsingSystemBrightnessAsync(): Promise<boolean> {
  return true;
}

export const BrightnessMode = {
  UNKNOWN: 0,
  AUTOMATIC: 1,
  MANUAL: 2,
} as const;

export async function getPermissionsAsync(): Promise<{ status: string }> {
  return { status: 'granted' };
}

export async function requestPermissionsAsync(): Promise<{ status: string }> {
  return { status: 'granted' };
}

export default {
  getBrightnessAsync,
  setBrightnessAsync,
  getSystemBrightnessAsync,
  setSystemBrightnessAsync,
  useSystemBrightnessAsync,
  isUsingSystemBrightnessAsync,
  BrightnessMode,
  getPermissionsAsync,
  requestPermissionsAsync,
};
