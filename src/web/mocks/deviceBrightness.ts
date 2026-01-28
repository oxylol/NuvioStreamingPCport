/**
 * Mock for @adrianso/react-native-device-brightness on web
 */

export function getBrightnessLevel(): Promise<number> {
  return Promise.resolve(1);
}

export function setBrightnessLevel(_level: number): Promise<void> {
  // Can't control screen brightness on web
  return Promise.resolve();
}

export function getSystemBrightnessLevel(): Promise<number> {
  return Promise.resolve(1);
}

export function setSystemBrightnessLevel(_level: number): Promise<void> {
  // Can't control screen brightness on web
  return Promise.resolve();
}

export default {
  getBrightnessLevel,
  setBrightnessLevel,
  getSystemBrightnessLevel,
  setSystemBrightnessLevel,
};
