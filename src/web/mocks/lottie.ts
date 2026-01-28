/**
 * Mock for lottie-react-native on web
 * Could be replaced with @lottiefiles/dotlottie-react for web support
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface LottieViewProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: ViewStyle;
  onAnimationFinish?: () => void;
  progress?: number;
}

const LottieView: React.FC<LottieViewProps> = ({
  style,
  source,
  autoPlay,
  loop,
}) => {
  // Simple placeholder that could be enhanced with @lottiefiles/dotlottie-react
  // For now, return an empty view
  return React.createElement(View, {
    style: [style, { backgroundColor: 'transparent' }],
  });
};

export default LottieView;
