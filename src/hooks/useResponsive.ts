/**
 * useResponsive Hook
 * Provides responsive layout utilities for different screen sizes
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { isDesktop, isMobile, getBreakpoint, getGridColumns } from '../utils/platform';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';

export interface ResponsiveConfig {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  gridColumns: number;
  posterWidth: number;
  posterHeight: number;
  spacing: number;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  padding: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const useResponsive = (): ResponsiveConfig => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const handleChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, []);

  const breakpoint = useMemo((): Breakpoint => {
    const { width } = dimensions;
    if (width < 600) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'large-desktop';
  }, [dimensions.width]);

  const gridColumns = useMemo((): number => {
    switch (breakpoint) {
      case 'mobile': return 2;
      case 'tablet': return 4;
      case 'desktop': return 5;
      case 'large-desktop': return 7;
      default: return 4;
    }
  }, [breakpoint]);

  const posterWidth = useMemo((): number => {
    const { width } = dimensions;
    const spacing = breakpoint === 'mobile' ? 8 : breakpoint === 'tablet' ? 12 : 16;
    const totalSpacing = spacing * (gridColumns + 1);
    const sidebarWidth = breakpoint === 'desktop' || breakpoint === 'large-desktop' ? 240 : 0;
    const availableWidth = width - totalSpacing - sidebarWidth;
    return Math.floor(availableWidth / gridColumns);
  }, [dimensions.width, breakpoint, gridColumns]);

  const posterHeight = useMemo((): number => {
    return Math.round(posterWidth * 1.5); // 2:3 aspect ratio
  }, [posterWidth]);

  const spacing = useMemo((): number => {
    switch (breakpoint) {
      case 'mobile': return 8;
      case 'tablet': return 12;
      case 'desktop': return 16;
      case 'large-desktop': return 20;
      default: return 12;
    }
  }, [breakpoint]);

  const fontSize = useMemo(() => {
    const baseSize = breakpoint === 'mobile' ? 14 : breakpoint === 'tablet' ? 15 : 16;
    return {
      xs: baseSize - 4,
      sm: baseSize - 2,
      md: baseSize,
      lg: baseSize + 2,
      xl: baseSize + 6,
      xxl: baseSize + 12,
    };
  }, [breakpoint]);

  const padding = useMemo(() => {
    const base = breakpoint === 'mobile' ? 12 : breakpoint === 'tablet' ? 16 : 24;
    return {
      xs: base / 2,
      sm: base * 0.75,
      md: base,
      lg: base * 1.5,
      xl: base * 2,
    };
  }, [breakpoint]);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isLargeDesktop: breakpoint === 'large-desktop',
    width: dimensions.width,
    height: dimensions.height,
    gridColumns,
    posterWidth,
    posterHeight,
    spacing,
    fontSize,
    padding,
  };
};

/**
 * Get styles based on breakpoint
 */
export function responsiveValue<T>(
  config: ResponsiveConfig,
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    'large-desktop'?: T;
    default: T;
  }
): T {
  const { breakpoint } = config;
  return values[breakpoint] ?? values.default;
}

/**
 * Create responsive styles
 */
export function createResponsiveStyles<T extends Record<string, any>>(
  config: ResponsiveConfig,
  styleFactory: (config: ResponsiveConfig) => T
): T {
  return styleFactory(config);
}

export default useResponsive;
