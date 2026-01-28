/**
 * Mock for @sentry/react-native on web
 * Provides no-op implementations for Sentry
 */
import React from 'react';

export function init(_options?: any): void {
  // No-op - could integrate with @sentry/browser if needed
  console.log('Sentry init (web mock)');
}

export function wrap<T extends React.ComponentType<any>>(component: T): T {
  return component;
}

export function captureException(error: any, _captureContext?: any): string {
  console.error('Sentry captureException:', error);
  return 'mock-event-id';
}

export function captureMessage(message: string, _captureContext?: any): string {
  console.log('Sentry captureMessage:', message);
  return 'mock-event-id';
}

export function setUser(_user: any): void {
  // No-op
}

export function setTag(_key: string, _value: string): void {
  // No-op
}

export function setExtra(_key: string, _value: any): void {
  // No-op
}

export function setContext(_name: string, _context: any): void {
  // No-op
}

export function addBreadcrumb(_breadcrumb: any): void {
  // No-op
}

export function configureScope(_callback: (scope: any) => void): void {
  // No-op
}

export function withScope(_callback: (scope: any) => void): void {
  // No-op
}

export function startTransaction(_context: any): any {
  return {
    finish: () => {},
    setStatus: () => {},
    setData: () => {},
  };
}

export function feedbackIntegration(): any {
  return {};
}

export const Severity = {
  Fatal: 'fatal',
  Error: 'error',
  Warning: 'warning',
  Log: 'log',
  Info: 'info',
  Debug: 'debug',
} as const;

export default {
  init,
  wrap,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setExtra,
  setContext,
  addBreadcrumb,
  configureScope,
  withScope,
  startTransaction,
  feedbackIntegration,
  Severity,
};
