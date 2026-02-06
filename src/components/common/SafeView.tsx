/**
 * SafeView - Safe Area Aware View Component
 *
 * A view component that automatically handles safe area insets with full customization.
 * Inspired by SafeAreaAwareView pattern for consistent safe area handling across screens.
 *
 * Features:
 * - Automatic safe area inset application
 * - Granular control (top, bottom, left, right)
 * - Themed background support
 * - Custom background color override
 * - Flexible configuration via props
 *
 * Usage:
 * ```tsx
 * <SafeView>
 *   <Text>Content</Text>
 * </SafeView>
 *
 * <SafeView applyTopInset={false} backgroundColor="#000">
 *   <Text>Custom</Text>
 * </SafeView>
 * ```
 */

import type React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export interface SafeViewProps extends ViewProps {
  /**
   * Whether to apply safe area insets to the view
   * @default true
   */
  useSafeArea?: boolean;

  /**
   * Whether to use themed background color
   * @default true
   */
  useThemedBackground?: boolean;

  /**
   * Whether to apply bottom safe area inset
   * @default true
   */
  applyBottomInset?: boolean;

  /**
   * Whether to apply top safe area inset
   * @default true
   */
  applyTopInset?: boolean;

  /**
   * Whether to apply left safe area inset
   * @default false
   */
  applyLeftInset?: boolean;

  /**
   * Whether to apply right safe area inset
   * @default false
   */
  applyRightInset?: boolean;

  /**
   * Optional background color (overrides themed background)
   */
  backgroundColor?: string;

  /**
   * Children components
   */
  children: React.ReactNode;
}

/**
 * A view component that automatically handles safe area insets
 *
 * Provides fine-grained control over which safe area insets to apply,
 * with support for themed backgrounds and custom colors.
 */
export const SafeView: React.FC<SafeViewProps> = ({
  useSafeArea = true,
  useThemedBackground = true,
  applyBottomInset = false,
  applyTopInset = true,
  applyLeftInset = false,
  applyRightInset = false,
  backgroundColor,
  style,
  children,
  ...rest
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // Calculate background color
  // Priority: backgroundColor prop > themed background (#09090b for dark theme) > transparent
  const bgColor = backgroundColor || (useThemedBackground ? theme.colors.bgPage : undefined);

  // Calculate padding based on safe area insets
  const safeAreaPadding: ViewStyle = useSafeArea
    ? {
      paddingTop: applyTopInset ? insets.top : 0,
      paddingBottom: applyBottomInset ? insets.bottom : 0,
      paddingLeft: applyLeftInset ? insets.left : 0,
      paddingRight: applyRightInset ? insets.right : 0,
    }
    : {};

  // Combine all styles
  const combinedStyle: ViewStyle = {
    flex: 1,
    backgroundColor: bgColor,
    ...safeAreaPadding,
    ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
  };

  return (
    <View style={combinedStyle} {...rest} collapsable={false}>
      {children}
    </View>
  );
};
