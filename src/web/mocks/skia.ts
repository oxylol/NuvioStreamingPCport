/**
 * Mock for @shopify/react-native-skia on web
 * Skia is native-only, provide minimal stubs
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CanvasProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({ style, children }) => {
  return React.createElement(View, { style }, children);
};

export const Skia = {
  Color: (color: string) => color,
  Path: {
    Make: () => ({
      moveTo: () => {},
      lineTo: () => {},
      close: () => {},
    }),
  },
  Paint: () => ({
    setColor: () => {},
    setStrokeWidth: () => {},
    setStyle: () => {},
  }),
};

export const useFont = () => null;
export const useImage = () => null;
export const usePaint = () => ({});
export const usePath = () => ({});

export const Path: React.FC<any> = () => null;
export const Rect: React.FC<any> = () => null;
export const Circle: React.FC<any> = () => null;
export const Line: React.FC<any> = () => null;
export const Text: React.FC<any> = () => null;
export const Image: React.FC<any> = () => null;
export const Group: React.FC<any> = ({ children }) => children;
export const Paint: React.FC<any> = () => null;
export const LinearGradient: React.FC<any> = () => null;
export const RadialGradient: React.FC<any> = () => null;
export const Blur: React.FC<any> = () => null;
export const Shadow: React.FC<any> = () => null;
export const RoundedRect: React.FC<any> = () => null;
export const Fill: React.FC<any> = () => null;

export const BlendMode = {
  Clear: 'clear',
  Src: 'src',
  Dst: 'dst',
  SrcOver: 'srcOver',
  DstOver: 'dstOver',
  SrcIn: 'srcIn',
  DstIn: 'dstIn',
  SrcOut: 'srcOut',
  DstOut: 'dstOut',
  SrcATop: 'srcATop',
  DstATop: 'dstATop',
  Xor: 'xor',
  Plus: 'plus',
  Modulate: 'modulate',
  Screen: 'screen',
  Overlay: 'overlay',
  Darken: 'darken',
  Lighten: 'lighten',
  ColorDodge: 'colorDodge',
  ColorBurn: 'colorBurn',
  HardLight: 'hardLight',
  SoftLight: 'softLight',
  Difference: 'difference',
  Exclusion: 'exclusion',
  Multiply: 'multiply',
  Hue: 'hue',
  Saturation: 'saturation',
  Color: 'color',
  Luminosity: 'luminosity',
} as const;

export default {
  Canvas,
  Skia,
  useFont,
  useImage,
  usePaint,
  usePath,
  Path,
  Rect,
  Circle,
  Line,
  Text,
  Image,
  Group,
  Paint,
  LinearGradient,
  RadialGradient,
  Blur,
  Shadow,
  RoundedRect,
  Fill,
  BlendMode,
};
