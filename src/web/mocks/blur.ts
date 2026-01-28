/**
 * Mock for @react-native-community/blur on web
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface BlurViewProps {
  style?: ViewStyle;
  blurType?: 'light' | 'dark' | 'xlight' | 'prominent' | 'regular' | 'extraDark';
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  children?: React.ReactNode;
}

export const BlurView: React.FC<BlurViewProps> = ({
  style,
  blurAmount = 10,
  reducedTransparencyFallbackColor = 'rgba(0, 0, 0, 0.5)',
  children,
}) => {
  return React.createElement(
    View,
    {
      style: [
        style,
        {
          backgroundColor: reducedTransparencyFallbackColor,
          // @ts-ignore - Web-specific style
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
        },
      ],
    },
    children
  );
};

export default { BlurView };
