const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  isElectron: true,

  // Window controls
  setTitle: (title) => ipcRenderer.send('set-title', title),
  enterFullscreen: () => ipcRenderer.send('enter-fullscreen'),
  exitFullscreen: () => ipcRenderer.send('exit-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),

  // Playback control listeners
  onPlaybackControl: (callback) => {
    ipcRenderer.on('playback-control', (event, action) => callback(action));
  },
  removePlaybackControlListener: () => {
    ipcRenderer.removeAllListeners('playback-control');
  },

  // File operations
  openFile: (options) => ipcRenderer.invoke('open-file', options),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
});

// Add keyboard shortcut handling for player
window.addEventListener('keydown', (event) => {
  // Global keyboard shortcuts for video playback
  const playerShortcuts = {
    ' ': 'toggle',        // Space - Play/Pause
    'ArrowRight': 'forward', // Right Arrow - Seek forward
    'ArrowLeft': 'backward', // Left Arrow - Seek backward
    'ArrowUp': 'volumeUp',   // Up Arrow - Volume up
    'ArrowDown': 'volumeDown', // Down Arrow - Volume down
    'm': 'mute',           // M - Mute
    'M': 'mute',
    'f': 'fullscreen',     // F - Fullscreen
    'F': 'fullscreen',
    'Escape': 'exitFullscreen',
  };

  const action = playerShortcuts[event.key];
  if (action) {
    // Dispatch a custom event that the React app can listen to
    window.dispatchEvent(new CustomEvent('nuvio-player-shortcut', {
      detail: { action, key: event.key }
    }));
  }
});
