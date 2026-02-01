/**
 * Theme System Usage Examples
 * 
 * This file demonstrates all the ways to use the theme system in Sunoh.
 * Delete this file once you're familiar with the patterns.
 */

import type { FC } from 'react';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button } from '../common/Button';
import { Text } from '../common/Text';

import { useTheme } from '../../theme/ThemeContext';
import {
  makeScalingStyles,
  useScaling,
  useScalingStyles,
  type ScalingFunctions,
} from '../../utils/style.util';

// =============================================================================
// PATTERN 1: Direct useTheme (Simple cases)
// =============================================================================

/**
 * For simple components, use useTheme directly.
 * Good for: Quick prototypes, simple layouts, one-off components.
 */
export const SimpleCard: FC<{ title: string; subtitle: string }> = memo(({ title, subtitle }) => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        marginBottom: spacing[3],
      }}
    >
      <Text variant="h3" color="primary" style={{ fontWeight: '600' }}>
        {title}
      </Text>
      <Text variant="caption" color="secondary" style={{ marginTop: spacing[1] }}>
        {subtitle}
      </Text>
    </View>
  );
});
SimpleCard.displayName = 'SimpleCard';

// =============================================================================
// PATTERN 2: Style Factory (Recommended for most components)
// =============================================================================

/**
 * Define style factory OUTSIDE the component for optimal performance.
 * The factory receives scaling functions and theme, returns styles.
 */
const createCardStyles = makeScalingStyles((s: ScalingFunctions, theme: ReturnType<typeof useTheme>) => ({
  container: {
    backgroundColor: theme.colors.bgSurface,
    padding: s.mScale(16),
    borderRadius: s.mScale(12),
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: s.mScale(12),
  },
  title: {
    // fontSize and color handled by Text component props, or override here if needed
    fontWeight: '600' as const,
  },
  subtitle: {
    marginTop: s.mScale(4),
  },
  badge: {
    backgroundColor: theme.colors.primaryBase,
    paddingHorizontal: s.mScale(8),
    paddingVertical: s.mScale(4),
    borderRadius: s.mScale(4),
    alignSelf: 'flex-start' as const,
    marginTop: s.mScale(8),
  },
  badgeText: {
    fontWeight: '500' as const,
  },
}));

/**
 * Component using the style factory pattern.
 * Styles are memoized and only recalculate on theme/dimension changes.
 */
export const StyledCard: FC<{ title: string; subtitle: string; badge?: string }> = memo(
  ({ title, subtitle, badge }) => {
    const theme = useTheme();
    const styles = useScalingStyles(createCardStyles, theme);

    return (
      <View style={styles.container}>
        <Text variant="h3" color="primary" style={styles.title}>{title}</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>{subtitle}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text variant="tiny" style={{ color: theme.colors.primaryText, ...styles.badgeText }}>{badge}</Text>
          </View>
        )}
      </View>
    );
  }
);
StyledCard.displayName = 'StyledCard';

// =============================================================================
// PATTERN 3: Using Palette Colors (Advanced)
// =============================================================================

/**
 * Access the full color palette for custom shades.
 * Useful for: Gradients, custom states, data visualization.
 */
export const PaletteDemo: FC = memo(() => {
  const { colors, spacing, borderRadius } = useTheme();
  // colors object now contains semantic colors, not the raw palette. 
  // We cannot easily iterate 'palette.primary' from 'colors' unless we expose it.
  // Assuming 'palette' is NOT exposed on 'colors' in new system.
  // We will skip iteration or import palette directly if needed. 
  // For this demo, let's just show semantic colors.
  
  const demoColors = [
    { name: 'Primary', value: colors.primaryBase, text: colors.primaryText },
    { name: 'Success', value: colors.success, text: colors.successText },
    { name: 'Warning', value: colors.warning, text: colors.warningText },
    { name: 'Error', value: colors.error, text: colors.errorText },
  ];

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <Text variant="body" color="primary" style={{ marginBottom: spacing[2] }}>
        Semantic Palette:
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] }}>
        {demoColors.map((item) => (
          <View
            key={item.name}
            style={{
              width: 80,
              height: 40,
              backgroundColor: item.value,
              borderRadius: borderRadius.sm,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              variant="tiny"
              style={{
                color: item.text,
                fontWeight: '600',
              }}
            >
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});
PaletteDemo.displayName = 'PaletteDemo';

// =============================================================================
// PATTERN 4: Theme Toggle Button
// =============================================================================

const createToggleStyles = makeScalingStyles((s, theme: ReturnType<typeof useTheme>) => ({
  button: {
    backgroundColor: theme.colors.bgSurfaceHover,
    paddingHorizontal: s.mScale(16),
    paddingVertical: s.mScale(12),
    borderRadius: s.mScale(8),
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: s.mScale(12),
  },
  label: {
    fontSize: s.font(16),
  },
  value: {
    fontSize: s.font(14),
  },
}));

export const ThemeToggle: FC = memo(() => {
  const theme = useTheme();
  const { mode, toggleMode, isDark } = theme;
  const styles = useScalingStyles(createToggleStyles, theme);

  return (
    <Pressable style={styles.button} onPress={toggleMode}>
      <Text color="primary" style={styles.label}>Theme Mode</Text>
      <Text color="secondary" style={styles.value}>
        {mode} ({isDark ? '🌙' : '☀️'})
      </Text>
    </Pressable>
  );
});
ThemeToggle.displayName = 'ThemeToggle';

// =============================================================================
// PATTERN 6: Button Demo
// =============================================================================

export const ButtonDemo: FC = memo(() => {
  const { spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing[4], gap: spacing[2] }}>
       <Text variant="h3">Buttons</Text>
       
       <Text variant="caption">Variants</Text>
       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
         <Button>Primary</Button>
         <Button variant="secondary">Secondary</Button>
         <Button variant="outline">Outline</Button>
         <Button variant="ghost">Ghost</Button>
         <Button variant="danger">Danger</Button>
         <Button variant="success">Success</Button>
         <Button variant="warning">Warning</Button>
       </View>

       <Text variant="caption">Sizes</Text>
       <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
         <Button size="small">Small</Button>
         <Button size="medium">Medium</Button>
         <Button size="large">Large</Button>
       </View>

       <Text variant="caption">States</Text>
       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
         <Button loading>Loading</Button>
         <Button disabled>Disabled</Button>
         <Button fullWidth>Full Width</Button>
       </View>
    </View>
  );
});
ButtonDemo.displayName = 'ButtonDemo';

// =============================================================================
// PATTERN 5: Responsive Layout with Device Info
// =============================================================================

export const ResponsiveInfo: FC = memo(() => {
  const { colors, spacing } = useTheme();
  const s = useScaling();

  return (
    <View
      style={{
        backgroundColor: colors.bgSurfaceHover,
        padding: spacing[4],
        borderRadius: spacing[2],
        marginBottom: spacing[3],
      }}
    >
      <Text variant="body" color="primary" style={{ fontWeight: '600' }}>
        Device Info
      </Text>
      <Text variant="caption" color="secondary" style={{ marginTop: spacing[2] }}>
        Screen: {Math.round(s.device.width)} × {Math.round(s.device.height)}
        {'\n'}
        Orientation: {s.device.isLandscape ? 'Landscape' : 'Portrait'}
        {'\n'}
        Device: {s.device.isTablet ? 'Tablet' : s.device.isSmallPhone ? 'Small Phone' : 'Phone'}
        {'\n'}
        Font Scale: {s.device.fontScale.toFixed(2)}
        {s.device.isLargeFontScale && ' (Large)'}
        {s.device.isExtraLargeFontScale && ' (Extra Large)'}
      </Text>
    </View>
  );
});
ResponsiveInfo.displayName = 'ResponsiveInfo';

// =============================================================================
// MAIN DEMO SCREEN
// =============================================================================

export const ThemeExampleScreen: FC = () => {
  const { colors, spacing } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPage }}
      contentContainerStyle={{ padding: spacing[4] }}
    >
      <Text
        variant="h1"
        color="primary"
        style={{
          fontWeight: '700',
          marginBottom: spacing[4],
        }}
      >
        Theme System Demo
      </Text>

      <ThemeToggle />
      <ResponsiveInfo />

      <Text
        variant="caption"
        color="secondary"
        style={{
          marginBottom: spacing[2],
          marginTop: spacing[2],
        }}
      >
        Pattern 1: Direct useTheme
      </Text>
      <SimpleCard title="Simple Card" subtitle="Using useTheme directly" />

      <Text
        variant="caption"
        color="secondary"
        style={{
          marginBottom: spacing[2],
        }}
      >
        Pattern 2: Style Factory
      </Text>
      <StyledCard title="Styled Card" subtitle="Using makeScalingStyles" badge="Recommended" />

      <Text
        variant="caption"
        color="secondary"
        style={{
          marginBottom: spacing[2],
        }}
      >
        Pattern 3: Palette Access
      </Text>
      <PaletteDemo />
      
      <ButtonDemo />
    </ScrollView>
  );
};
