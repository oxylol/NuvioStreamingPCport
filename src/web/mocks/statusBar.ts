/**
 * Mock for expo-status-bar on web
 */
import React from 'react';

export type StatusBarStyle = 'auto' | 'inverted' | 'light' | 'dark';

interface StatusBarProps {
  style?: StatusBarStyle;
  animated?: boolean;
  hidden?: boolean;
  backgroundColor?: string;
  translucent?: boolean;
  networkActivityIndicatorVisible?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = () => {
  // StatusBar has no effect on web
  return null;
};

export function setStatusBarStyle(_style: StatusBarStyle, _animated?: boolean): void {
  // No-op on web
}

export function setStatusBarHidden(_hidden: boolean, _animation?: string): void {
  // No-op on web
}

export function setStatusBarBackgroundColor(_color: string, _animated?: boolean): void {
  // No-op on web
}

export function setStatusBarTranslucent(_translucent: boolean): void {
  // No-op on web
}

export function setStatusBarNetworkActivityIndicatorVisible(_visible: boolean): void {
  // No-op on web
}

export default StatusBar;
