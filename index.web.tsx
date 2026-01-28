/**
 * Nuvio Web Entry Point
 * This file bootstraps the React Native Web application for desktop (Electron)
 */

import { AppRegistry, Platform } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('Nuvio', () => App);

// Run the app on web
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');

  if (rootTag) {
    AppRegistry.runApplication('Nuvio', {
      rootTag,
      initialProps: {},
    });

    // Hide loading screen after a short delay to ensure app is rendered
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.hideLoadingScreen) {
        window.hideLoadingScreen();
      }
    }, 500);
  }
}

// Declare global window properties
declare global {
  interface Window {
    hideLoadingScreen?: () => void;
    electronAPI?: {
      getPlatform: () => Promise<string>;
      getVersion: () => Promise<string>;
      isElectron: boolean;
      setTitle: (title: string) => void;
      enterFullscreen: () => void;
      exitFullscreen: () => void;
      isFullscreen: () => Promise<boolean>;
      onPlaybackControl: (callback: (action: string) => void) => void;
      removePlaybackControlListener: () => void;
    };
  }
}
