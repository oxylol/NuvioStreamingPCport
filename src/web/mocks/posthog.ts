/**
 * Mock for posthog-react-native on web
 */
import React from 'react';

export interface PostHogOptions {
  apiKey: string;
  host?: string;
}

class PostHogMock {
  identify(_distinctId: string, _properties?: Record<string, any>): void {
    // No-op
  }

  capture(_eventName: string, _properties?: Record<string, any>): void {
    // No-op
  }

  screen(_screenName: string, _properties?: Record<string, any>): void {
    // No-op
  }

  alias(_alias: string): void {
    // No-op
  }

  reset(): void {
    // No-op
  }

  flush(): Promise<void> {
    return Promise.resolve();
  }

  enable(): void {
    // No-op
  }

  disable(): void {
    // No-op
  }

  isFeatureEnabled(_key: string): boolean {
    return false;
  }

  getFeatureFlag(_key: string): string | boolean | undefined {
    return undefined;
  }

  reloadFeatureFlags(): Promise<void> {
    return Promise.resolve();
  }

  register(_properties: Record<string, any>): void {
    // No-op
  }

  unregister(_property: string): void {
    // No-op
  }

  optIn(): void {
    // No-op
  }

  optOut(): void {
    // No-op
  }

  isOptedOut(): boolean {
    return false;
  }

  debug(_enabled?: boolean): void {
    // No-op
  }
}

const posthog = new PostHogMock();

export function usePostHog(): PostHogMock {
  return posthog;
}

export const PostHogProvider: React.FC<{
  apiKey: string;
  options?: Partial<PostHogOptions>;
  children: React.ReactNode;
}> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

export default posthog;
