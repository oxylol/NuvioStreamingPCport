/**
 * Web Video Player Component
 * Replaces react-native-video for web/desktop platforms
 * Uses HTML5 video element with HLS.js for adaptive streaming
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

// HLS.js will be loaded dynamically
let Hls: any = null;
if (typeof window !== 'undefined') {
  import('hls.js').then((module) => {
    Hls = module.default;
  }).catch(() => {
    console.warn('HLS.js not available');
  });
}

export interface VideoRef {
  seek: (time: number) => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export interface OnLoadData {
  currentTime: number;
  duration: number;
  naturalSize: {
    width: number;
    height: number;
    orientation: 'landscape' | 'portrait';
  };
  audioTracks: Array<{
    index: number;
    title: string;
    language: string;
    type: string;
  }>;
  textTracks: Array<{
    index: number;
    title: string;
    language: string;
    type: string;
  }>;
}

export interface OnProgressData {
  currentTime: number;
  playableDuration: number;
  seekableDuration: number;
}

export interface OnSeekData {
  currentTime: number;
  seekTime: number;
}

export interface OnBufferData {
  isBuffering: boolean;
}

export interface OnErrorData {
  error: {
    code: number;
    domain: string;
    message: string;
  };
}

export interface TextTrack {
  title: string;
  language: string;
  type: 'text/vtt' | 'application/x-subrip';
  uri: string;
}

export interface VideoProps {
  source: {
    uri: string;
    headers?: Record<string, string>;
    type?: string;
  };
  style?: ViewStyle;
  paused?: boolean;
  muted?: boolean;
  volume?: number;
  rate?: number;
  repeat?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'none';
  poster?: string;
  posterResizeMode?: 'contain' | 'cover' | 'stretch';
  progressUpdateInterval?: number;
  selectedAudioTrack?: { type: string; value?: number | string };
  selectedTextTrack?: { type: string; value?: number | string };
  textTracks?: TextTrack[];
  onLoad?: (data: OnLoadData) => void;
  onLoadStart?: () => void;
  onProgress?: (data: OnProgressData) => void;
  onSeek?: (data: OnSeekData) => void;
  onEnd?: () => void;
  onError?: (data: OnErrorData) => void;
  onBuffer?: (data: OnBufferData) => void;
  onPlaybackStateChanged?: (data: { isPlaying: boolean }) => void;
  onReadyForDisplay?: () => void;
  onAudioTracks?: (data: { audioTracks: OnLoadData['audioTracks'] }) => void;
  onTextTracks?: (data: { textTracks: OnLoadData['textTracks'] }) => void;
}

const Video = forwardRef<VideoRef, VideoProps>((props, ref) => {
  const {
    source,
    style,
    paused = false,
    muted = false,
    volume = 1,
    rate = 1,
    repeat = false,
    resizeMode = 'contain',
    poster,
    progressUpdateInterval = 250,
    selectedAudioTrack,
    selectedTextTrack,
    textTracks,
    onLoad,
    onLoadStart,
    onProgress,
    onSeek,
    onEnd,
    onError,
    onBuffer,
    onPlaybackStateChanged,
    onReadyForDisplay,
    onAudioTracks,
    onTextTracks,
  } = props;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Map resize mode to CSS object-fit
  const objectFitMap: Record<string, string> = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'fill',
    none: 'none',
  };

  // Imperative handle for external control
  useImperativeHandle(ref, () => ({
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    pause: () => {
      videoRef.current?.pause();
    },
    resume: () => {
      videoRef.current?.play();
    },
    setVolume: (vol: number) => {
      if (videoRef.current) {
        videoRef.current.volume = Math.max(0, Math.min(1, vol));
      }
    },
    getCurrentTime: () => videoRef.current?.currentTime || 0,
    getDuration: () => videoRef.current?.duration || 0,
  }));

  // Initialize video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source?.uri) return;

    const uri = source.uri;
    const isHLS = uri.includes('.m3u8') || source.type === 'application/x-mpegURL';

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    onLoadStart?.();

    if (isHLS && Hls && Hls.isSupported()) {
      // Use HLS.js for HLS streams
      const hls = new Hls({
        xhrSetup: (xhr: XMLHttpRequest) => {
          if (source.headers) {
            Object.entries(source.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }
        },
      });

      hls.loadSource(uri);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!paused) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
          onError?.({
            error: {
              code: -1,
              domain: 'HLSError',
              message: data.details || 'HLS playback error',
            },
          });
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHLS) {
      // Native HLS support (Safari)
      video.src = uri;
    } else {
      // Regular video file
      video.src = uri;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source?.uri]);

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    if (paused) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  }, [paused, isReady]);

  // Handle volume and mute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
    video.muted = muted;
  }, [volume, muted]);

  // Handle playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
  }, [rate]);

  // Handle loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.loop = repeat;
  }, [repeat]);

  // Handle text tracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !textTracks) return;

    // Remove existing tracks
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    // Add new tracks
    textTracks.forEach((track, index) => {
      const trackElement = document.createElement('track');
      trackElement.kind = 'subtitles';
      trackElement.label = track.title;
      trackElement.srclang = track.language;
      trackElement.src = track.uri;
      if (index === 0) {
        trackElement.default = true;
      }
      video.appendChild(trackElement);
    });
  }, [textTracks]);

  // Handle selected text track
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedTextTrack) return;

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (selectedTextTrack.type === 'disabled') {
        track.mode = 'hidden';
      } else if (selectedTextTrack.type === 'index' && i === selectedTextTrack.value) {
        track.mode = 'showing';
      } else if (selectedTextTrack.type === 'language' && track.language === selectedTextTrack.value) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    }
  }, [selectedTextTrack]);

  // Progress updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    progressIntervalRef.current = window.setInterval(() => {
      if (!video.paused && !video.seeking) {
        onProgress({
          currentTime: video.currentTime,
          playableDuration: video.buffered.length > 0
            ? video.buffered.end(video.buffered.length - 1)
            : 0,
          seekableDuration: video.duration || 0,
        });
      }
    }, progressUpdateInterval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onProgress, progressUpdateInterval]);

  // Event handlers
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsReady(true);

    // Get audio tracks
    const audioTracks: OnLoadData['audioTracks'] = [];
    // @ts-ignore - audioTracks exists on HTMLVideoElement
    if (video.audioTracks) {
      // @ts-ignore
      for (let i = 0; i < video.audioTracks.length; i++) {
        // @ts-ignore
        const track = video.audioTracks[i];
        audioTracks.push({
          index: i,
          title: track.label || `Track ${i + 1}`,
          language: track.language || 'unknown',
          type: 'audio',
        });
      }
    }

    // Get text tracks
    const textTracksData: OnLoadData['textTracks'] = [];
    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i];
      textTracksData.push({
        index: i,
        title: track.label || `Subtitle ${i + 1}`,
        language: track.language || 'unknown',
        type: 'text',
      });
    }

    onLoad?.({
      currentTime: video.currentTime,
      duration: video.duration || 0,
      naturalSize: {
        width: video.videoWidth,
        height: video.videoHeight,
        orientation: video.videoWidth > video.videoHeight ? 'landscape' : 'portrait',
      },
      audioTracks,
      textTracks: textTracksData,
    });

    onAudioTracks?.({ audioTracks });
    onTextTracks?.({ textTracks: textTracksData });
    onReadyForDisplay?.();
  }, [onLoad, onAudioTracks, onTextTracks, onReadyForDisplay]);

  const handlePlay = useCallback(() => {
    onPlaybackStateChanged?.({ isPlaying: true });
  }, [onPlaybackStateChanged]);

  const handlePause = useCallback(() => {
    onPlaybackStateChanged?.({ isPlaying: false });
  }, [onPlaybackStateChanged]);

  const handleEnded = useCallback(() => {
    onEnd?.();
  }, [onEnd]);

  const handleSeeking = useCallback(() => {
    onBuffer?.({ isBuffering: true });
  }, [onBuffer]);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    onBuffer?.({ isBuffering: false });
    onSeek?.({
      currentTime: video.currentTime,
      seekTime: video.currentTime,
    });
  }, [onBuffer, onSeek]);

  const handleWaiting = useCallback(() => {
    onBuffer?.({ isBuffering: true });
  }, [onBuffer]);

  const handleCanPlay = useCallback(() => {
    onBuffer?.({ isBuffering: false });
  }, [onBuffer]);

  const handleError = useCallback(() => {
    const video = videoRef.current;
    const error = video?.error;

    onError?.({
      error: {
        code: error?.code || -1,
        domain: 'HTMLMediaError',
        message: error?.message || 'Unknown playback error',
      },
    });
  }, [onError]);

  // Keyboard shortcut listener for player controls
  useEffect(() => {
    const handlePlayerShortcut = (event: CustomEvent<{ action: string }>) => {
      const video = videoRef.current;
      if (!video) return;

      switch (event.detail.action) {
        case 'toggle':
          if (video.paused) {
            video.play().catch(console.error);
          } else {
            video.pause();
          }
          break;
        case 'forward':
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'backward':
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'volumeUp':
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case 'volumeDown':
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case 'mute':
          video.muted = !video.muted;
          break;
        case 'fullscreen':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            video.requestFullscreen?.();
          }
          break;
        case 'exitFullscreen':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('nuvio-player-shortcut', handlePlayerShortcut as EventListener);
    return () => {
      window.removeEventListener('nuvio-player-shortcut', handlePlayerShortcut as EventListener);
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          objectFit: objectFitMap[resizeMode] as any,
        }}
        poster={poster}
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />
    </View>
  );
});

Video.displayName = 'Video';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
});

// Export named components to match react-native-video API
export default Video;
export { Video };

// Export types
export type { TextTrack as TextTrackType };
