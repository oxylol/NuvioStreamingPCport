/**
 * Mock for expo-live-activity on web
 * Live Activities are iOS-only, so this is a no-op
 */

export interface LiveActivityState {
  activityId: string | null;
  pushToken: string | null;
}

export async function startActivity<T>(_attributes: T): Promise<string | null> {
  console.log('Live Activity not supported on desktop');
  return null;
}

export async function updateActivity<T>(_activityId: string, _state: T): Promise<void> {
  // No-op
}

export async function endActivity(_activityId: string): Promise<void> {
  // No-op
}

export async function endAllActivities(): Promise<void> {
  // No-op
}

export async function getActivityState(_activityId: string): Promise<LiveActivityState> {
  return { activityId: null, pushToken: null };
}

export async function areActivitiesEnabled(): Promise<boolean> {
  return false;
}

export function addActivityUpdateListener(_listener: (state: any) => void): { remove: () => void } {
  return { remove: () => {} };
}

export function addPushTokenUpdateListener(_listener: (token: string) => void): { remove: () => void } {
  return { remove: () => {} };
}

export default {
  startActivity,
  updateActivity,
  endActivity,
  endAllActivities,
  getActivityState,
  areActivitiesEnabled,
  addActivityUpdateListener,
  addPushTokenUpdateListener,
};
