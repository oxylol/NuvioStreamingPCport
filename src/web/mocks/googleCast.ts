/**
 * Mock for react-native-google-cast on web
 * Chromecast is not supported in Electron, but we provide no-op implementations
 */
import React from 'react';
import { View } from 'react-native';

export interface CastDevice {
  deviceId: string;
  friendlyName: string;
}

export interface MediaInfo {
  contentUrl: string;
  contentType: string;
  metadata?: {
    title?: string;
    subtitle?: string;
    images?: Array<{ url: string }>;
  };
}

export const CastState = {
  NO_DEVICES_AVAILABLE: 'noDevicesAvailable',
  NOT_CONNECTED: 'notConnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
} as const;

export const MediaPlayerState = {
  UNKNOWN: 'unknown',
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  LOADING: 'loading',
} as const;

class CastContextMock {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  getCastState(): Promise<string> {
    return Promise.resolve(CastState.NO_DEVICES_AVAILABLE);
  }

  getSessionManager() {
    return {
      getCurrentCastSession: () => null,
      endCurrentSession: () => Promise.resolve(),
    };
  }

  showCastDialog(): Promise<void> {
    console.log('Cast not supported on desktop');
    return Promise.resolve();
  }

  showExpandedControls(): Promise<void> {
    return Promise.resolve();
  }

  onCastStateChanged(listener: (state: string) => void): () => void {
    const key = 'castStateChanged';
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(listener);
    return () => this.listeners.get(key)?.delete(listener);
  }

  onSessionStarted(listener: () => void): () => void {
    const key = 'sessionStarted';
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(listener);
    return () => this.listeners.get(key)?.delete(listener);
  }

  onSessionEnded(listener: () => void): () => void {
    const key = 'sessionEnded';
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(listener);
    return () => this.listeners.get(key)?.delete(listener);
  }
}

class RemoteMediaClientMock {
  loadMedia(_mediaInfo: MediaInfo): Promise<void> {
    console.log('Cast not supported on desktop');
    return Promise.resolve();
  }

  play(): Promise<void> {
    return Promise.resolve();
  }

  pause(): Promise<void> {
    return Promise.resolve();
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }

  seek(_position: number): Promise<void> {
    return Promise.resolve();
  }

  setStreamVolume(_volume: number): Promise<void> {
    return Promise.resolve();
  }

  getMediaStatus(): Promise<null> {
    return Promise.resolve(null);
  }

  onMediaStatusUpdated(_listener: () => void): () => void {
    return () => {};
  }

  onMediaPlaybackStarted(_listener: () => void): () => void {
    return () => {};
  }

  onMediaPlaybackEnded(_listener: () => void): () => void {
    return () => {};
  }
}

export const CastContext = new CastContextMock();
export const RemoteMediaClient = new RemoteMediaClientMock();

export const CastButton: React.FC<{
  style?: any;
  tintColor?: string;
}> = ({ style }) => {
  // Return empty view - cast not supported on desktop
  return React.createElement(View, { style });
};

export function useCastState(): string {
  return CastState.NO_DEVICES_AVAILABLE;
}

export function useDevices(): CastDevice[] {
  return [];
}

export function useRemoteMediaClient(): typeof RemoteMediaClient | null {
  return null;
}

export function useMediaStatus(): null {
  return null;
}

export function useStreamPosition(): number {
  return 0;
}

export default {
  CastContext,
  CastState,
  CastButton,
  MediaPlayerState,
  RemoteMediaClient,
  useCastState,
  useDevices,
  useRemoteMediaClient,
  useMediaStatus,
  useStreamPosition,
};
