/**
 * Desktop Sidebar Navigation Component
 * Provides a desktop-style sidebar for navigation on larger screens
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { isDesktop, getBreakpoint } from '../../utils/platform';

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  route: string;
}

const sidebarItems: SidebarItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', route: 'Home' },
  { key: 'search', label: 'Search', icon: '🔍', route: 'Search' },
  { key: 'library', label: 'Library', icon: '📚', route: 'Library' },
  { key: 'calendar', label: 'Calendar', icon: '📅', route: 'Calendar' },
  { key: 'downloads', label: 'Downloads', icon: '⬇️', route: 'Downloads' },
  { key: 'settings', label: 'Settings', icon: '⚙️', route: 'Settings' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { currentTheme } = useTheme();
  const breakpoint = getBreakpoint();

  // Only show sidebar on desktop breakpoints
  if (breakpoint === 'mobile' || breakpoint === 'tablet') {
    return null;
  }

  const handleNavigation = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const isActive = (routeName: string) => {
    return route.name === routeName;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.darkBackground },
        collapsed && styles.containerCollapsed,
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: currentTheme.colors.primary }]}>
          {collapsed ? 'N' : 'NUVIO'}
        </Text>
      </View>

      {/* Navigation Items */}
      <ScrollView
        style={styles.navContainer}
        showsVerticalScrollIndicator={false}
      >
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navItem,
              isActive(item.route) && {
                backgroundColor: `${currentTheme.colors.primary}20`,
                borderLeftColor: currentTheme.colors.primary,
              },
            ]}
            onPress={() => handleNavigation(item.route)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            {!collapsed && (
              <Text
                style={[
                  styles.navLabel,
                  isActive(item.route) && { color: currentTheme.colors.primary },
                ]}
              >
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={onToggleCollapse}
        >
          <Text style={styles.collapseIcon}>
            {collapsed ? '→' : '←'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Version Info */}
      {!collapsed && (
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v0.6.0-beta.6</Text>
          <Text style={styles.platformText}>Desktop</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  containerCollapsed: {
    width: 64,
  },
  logoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  navLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  collapseButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  collapseIcon: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 18,
  },
  versionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
  },
  platformText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    marginTop: 2,
  },
});

export default Sidebar;
