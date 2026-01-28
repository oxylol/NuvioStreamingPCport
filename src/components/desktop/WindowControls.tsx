/**
 * Desktop Window Controls Component
 * Custom title bar controls for macOS-style window management
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { isDesktop, getElectronAPI } from '../../utils/platform';

interface WindowControlsProps {
  title?: string;
  showTitle?: boolean;
  style?: any;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  title = 'Nuvio',
  showTitle = true,
  style,
}) => {
  // Only render on desktop (Electron)
  if (!isDesktop()) {
    return null;
  }

  const electronAPI = getElectronAPI();
  if (!electronAPI) {
    return null;
  }

  // Determine if on macOS (traffic light buttons are on the left)
  // On Windows/Linux, we might want different controls
  const isMacOS = Platform.OS === 'web' && typeof navigator !== 'undefined' &&
    navigator.platform?.toLowerCase().includes('mac');

  // On macOS, we don't need custom window controls as the native ones are used
  // This component is mainly for the draggable title bar area
  if (isMacOS) {
    return (
      <View style={[styles.container, styles.macContainer, style]}>
        {/* Spacer for traffic lights */}
        <View style={styles.trafficLightSpacer} />
        {showTitle && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
        <View style={styles.trafficLightSpacer} />
      </View>
    );
  }

  // Windows/Linux style controls
  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            // Minimize - would need IPC handler
          }}
        >
          <Text style={styles.controlIcon}>─</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={async () => {
            const isFullscreen = await electronAPI.isFullscreen();
            if (isFullscreen) {
              electronAPI.exitFullscreen();
            } else {
              electronAPI.enterFullscreen();
            }
          }}
        >
          <Text style={styles.controlIcon}>□</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.closeButton]}
          onPress={() => {
            // Close - would need IPC handler
            window.close();
          }}
        >
          <Text style={[styles.controlIcon, styles.closeIcon]}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020404',
    paddingHorizontal: 8,
    // Make title bar draggable
    // @ts-ignore - Web specific
    WebkitAppRegion: 'drag',
  },
  macContainer: {
    justifyContent: 'center',
    paddingTop: 4,
  },
  trafficLightSpacer: {
    width: 70, // Space for traffic light buttons
  },
  title: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    // Don't allow dragging on the text itself for better UX
    // @ts-ignore - Web specific
    WebkitAppRegion: 'no-drag',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    // Don't allow dragging on controls
    // @ts-ignore - Web specific
    WebkitAppRegion: 'no-drag',
  },
  controlButton: {
    width: 46,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  closeButton: {
    // Highlight on hover via CSS
  },
  closeIcon: {
    fontSize: 20,
  },
});

export default WindowControls;
