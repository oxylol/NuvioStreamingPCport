/**
 * Mock for react-native-immersive-mode on web
 */

export function fullLayout(_isFullLayout: boolean): void {
  // No-op on web
}

export function setBarMode(_mode: string): void {
  // No-op on web
}

export function setBarStyle(_style: string): void {
  // No-op on web
}

export function setBarTranslucent(_translucent: boolean): void {
  // No-op on web
}

export function setBarColor(_color: string): void {
  // No-op on web
}

export function setBarDefaultColor(): void {
  // No-op on web
}

export function setStatusBarColor(_color: string): void {
  // No-op on web
}

export function setNavigationBarColor(_color: string): void {
  // No-op on web
}

export function addEventListener(_event: string, _callback: () => void): { remove: () => void } {
  return { remove: () => {} };
}

export const BarMode = {
  Normal: 'Normal',
  BottomSticky: 'BottomSticky',
  FullSticky: 'FullSticky',
  Full: 'Full',
} as const;

export const BarStyle = {
  Light: 'Light',
  Dark: 'Dark',
} as const;

export default {
  fullLayout,
  setBarMode,
  setBarStyle,
  setBarTranslucent,
  setBarColor,
  setBarDefaultColor,
  setStatusBarColor,
  setNavigationBarColor,
  addEventListener,
  BarMode,
  BarStyle,
};
