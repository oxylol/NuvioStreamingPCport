/**
 * Mock for expo-navigation-bar on web
 */

export async function setBackgroundColorAsync(_color: string): Promise<void> {
  // No-op on web
}

export async function getBackgroundColorAsync(): Promise<string> {
  return '#000000';
}

export async function setBorderColorAsync(_color: string): Promise<void> {
  // No-op on web
}

export async function getBorderColorAsync(): Promise<string> {
  return '#000000';
}

export async function setButtonStyleAsync(_style: string): Promise<void> {
  // No-op on web
}

export async function getButtonStyleAsync(): Promise<string> {
  return 'light';
}

export async function setVisibilityAsync(_visibility: string): Promise<void> {
  // No-op on web
}

export async function getVisibilityAsync(): Promise<string> {
  return 'visible';
}

export async function setPositionAsync(_position: string): Promise<void> {
  // No-op on web
}

export async function setBehaviorAsync(_behavior: string): Promise<void> {
  // No-op on web
}

export async function unstable_setPositionAsync(_position: string): Promise<void> {
  // No-op on web
}

export default {
  setBackgroundColorAsync,
  getBackgroundColorAsync,
  setBorderColorAsync,
  getBorderColorAsync,
  setButtonStyleAsync,
  getButtonStyleAsync,
  setVisibilityAsync,
  getVisibilityAsync,
  setPositionAsync,
  setBehaviorAsync,
  unstable_setPositionAsync,
};
