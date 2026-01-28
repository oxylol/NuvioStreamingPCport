/**
 * Desktop Video Player Component
 * Wraps the web video player with desktop-specific controls and keyboard shortcuts
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { isDesktop, getElectronAPI } from '../../utils/platform';
import Video, { VideoRef, OnLoadData, OnProgressData } from '../../web/components/WebVideoPlayer';

// Import shared components
import LoadingOverlay from './modals/LoadingOverlay';
import { ErrorModal } from './modals/ErrorModal';

interface PlayerRouteParams {
  uri: string;
  title: string;
  episodeTitle?: string;
  season?: number;
  episode?: number;
  quality?: string;
  year?: number;
  streamProvider?: string;
  streamName?: string;
  videoType?: string;
  id: string;
  type: string;
  episodeId?: string;
  imdbId?: string;
  backdrop?: string;
  availableStreams?: { [providerId: string]: { streams: any[]; addonName: string } };
  headers?: Record<string, string>;
  initialPosition?: number;
}

const DesktopPlayer: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const params = route.params as PlayerRouteParams;

  const videoRef = useRef<VideoRef>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { uri, title, episodeTitle, season, episode, headers, initialPosition } = params;

  // Display title
  const displayTitle = episodeTitle
    ? `${title} - S${season}E${episode} - ${episodeTitle}`
    : title;

  // Update window title
  useEffect(() => {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      electronAPI.setTitle(`${displayTitle} - Nuvio`);
    }
    return () => {
      if (electronAPI) {
        electronAPI.setTitle('Nuvio');
      }
    };
  }, [displayTitle]);

  // Show/hide controls with timeout
  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (!paused) {
      controlsTimeoutRef.current = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 3000);
    }
  }, [paused, controlsOpacity]);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    showControlsWithTimeout();
  }, [showControlsWithTimeout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for player shortcuts
      const playerKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'm', 'M', 'f', 'F', 'Escape'];
      if (playerKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case ' ':
          setPaused(p => !p);
          showControlsWithTimeout();
          break;
        case 'ArrowLeft':
          videoRef.current?.seek(Math.max(0, currentTime - 10));
          showControlsWithTimeout();
          break;
        case 'ArrowRight':
          videoRef.current?.seek(Math.min(duration, currentTime + 10));
          showControlsWithTimeout();
          break;
        case 'ArrowUp':
          setVolume(v => Math.min(1, v + 0.1));
          showControlsWithTimeout();
          break;
        case 'ArrowDown':
          setVolume(v => Math.max(0, v - 0.1));
          showControlsWithTimeout();
          break;
        case 'm':
        case 'M':
          setIsMuted(m => !m);
          showControlsWithTimeout();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            navigation.goBack();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isFullscreen, navigation, showControlsWithTimeout]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      if (isFullscreen) {
        electronAPI.exitFullscreen();
      } else {
        electronAPI.enterFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    } else {
      // Browser fallback
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  }, [isFullscreen]);

  const exitFullscreen = useCallback(async () => {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      electronAPI.exitFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  // Video event handlers
  const handleLoad = useCallback((data: OnLoadData) => {
    setDuration(data.duration);
    setIsLoaded(true);
    setIsBuffering(false);

    // Seek to initial position if provided
    if (initialPosition && initialPosition > 0) {
      videoRef.current?.seek(initialPosition);
    }
  }, [initialPosition]);

  const handleProgress = useCallback((data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    setBuffered(data.playableDuration);
  }, []);

  const handleBuffer = useCallback(({ isBuffering: buffering }: { isBuffering: boolean }) => {
    setIsBuffering(buffering);
  }, []);

  const handleEnd = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleError = useCallback((data: { error: { message: string } }) => {
    setError(data.error.message);
    setIsBuffering(false);
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hours = Math.floor(mins / 60);

    if (hours > 0) {
      return `${hours}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Seek to position
  const handleSeek = useCallback((position: number) => {
    videoRef.current?.seek(position);
    setCurrentTime(position);
  }, []);

  // Progress bar click handler
  const handleProgressClick = useCallback((event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;
    handleSeek(seekTime);
  }, [duration, handleSeek]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.colors.darkBackground }]}>
        <ErrorModal
          visible={true}
          onDismiss={() => navigation.goBack()}
          errorMessage={error}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: '#000' }]}
      // @ts-ignore - Web specific
      onMouseMove={handleMouseMove}
    >
      {/* Video */}
      <Video
        ref={videoRef}
        source={{ uri, headers }}
        style={styles.video}
        paused={paused}
        volume={volume}
        muted={isMuted}
        resizeMode="contain"
        onLoad={handleLoad}
        onProgress={handleProgress}
        onBuffer={handleBuffer}
        onEnd={handleEnd}
        onError={handleError}
      />

      {/* Loading Overlay */}
      {isBuffering && <LoadingOverlay />}

      {/* Controls Overlay */}
      <Animated.View
        style={[
          styles.controlsOverlay,
          { opacity: controlsOpacity },
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.titleText} numberOfLines={1}>
            {displayTitle}
          </Text>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Center Play/Pause */}
        <TouchableOpacity
          style={styles.centerControls}
          onPress={() => setPaused(p => !p)}
        >
          <View style={styles.playPauseButton}>
            <Text style={styles.playPauseIcon}>
              {paused ? '▶' : '⏸'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Progress Bar */}
          <TouchableOpacity
            style={styles.progressContainer}
            onPress={handleProgressClick}
            activeOpacity={1}
          >
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBuffered,
                  { width: `${(buffered / duration) * 100}%` }
                ]}
              />
              <View
                style={[
                  styles.progressFilled,
                  { width: `${(currentTime / duration) * 100}%` }
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Time and Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setPaused(p => !p)}
            >
              <Text style={styles.controlIcon}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleSeek(Math.max(0, currentTime - 10))}
            >
              <Text style={styles.controlIcon}>⏪</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleSeek(Math.min(duration, currentTime + 10))}
            >
              <Text style={styles.controlIcon}>⏩</Text>
            </TouchableOpacity>

            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>

            <View style={styles.spacer} />

            {/* Volume Control */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsMuted(m => !m)}
            >
              <Text style={styles.controlIcon}>
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </Text>
            </TouchableOpacity>

            {/* Fullscreen */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFullscreen}
            >
              <Text style={styles.controlIcon}>
                {isFullscreen ? '⛶' : '⛶'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Keyboard Shortcuts Hint */}
          <Text style={styles.shortcutsHint}>
            Space: Play/Pause | ←→: Seek | ↑↓: Volume | M: Mute | F: Fullscreen | Esc: Exit
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
  } as any,
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  topBarSpacer: {
    width: 60,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45, 156, 219, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    color: '#fff',
    fontSize: 32,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 24,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  } as any,
  progressContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBuffered: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressFilled: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#2d9cdb',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  controlIcon: {
    color: '#fff',
    fontSize: 20,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
  },
  shortcutsHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DesktopPlayer;
