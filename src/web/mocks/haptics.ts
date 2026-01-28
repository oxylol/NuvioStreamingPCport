/**
 * Mock for expo-haptics on web
 */

export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
  Soft: 'soft',
  Rigid: 'rigid',
} as const;

export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const;

export async function impactAsync(_style?: string): Promise<void> {
  // No-op on web
}

export async function notificationAsync(_type?: string): Promise<void> {
  // No-op on web
}

export async function selectionAsync(): Promise<void> {
  // No-op on web
}

export default {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  selectionAsync,
};
