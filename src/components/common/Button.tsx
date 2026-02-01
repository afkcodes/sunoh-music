/**
 * Button Component
 * 
 * A fully themed, responsive button with multiple variants,
 * haptic feedback, and smooth press animations.
 * Uses 'react-native-fast-squircle' for organic shapes.
 * 
 * @example
 * ```tsx
 * <Button onPress={handlePress}>Primary Button</Button>
 * <Button variant="outline" icon={<Icon name="add" />} onPress={handlePress}>Add Item</Button>
 * <Button variant="ghost" size="small" onPress={handlePress}>Cancel</Button>
 * ```
 */

import type { FC, ReactNode } from 'react';
import { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type ViewStyle
} from 'react-native';
import SquircleView from 'react-native-fast-squircle';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { springs, useTheme } from '../../theme';
import {
  makeScalingStyles,
  useScalingStyles,
} from '../../utils/style.util';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Button label */
  children?: string | ReactNode;
  /** Custom style */
  style?: ViewStyle;
  /** Left icon */
  icon?: ReactNode;
  /** Right icon */
  iconRight?: ReactNode;
  /** Haptic feedback on press */
  haptic?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const createStyles = makeScalingStyles((s, theme) => ({
  // Container (Pressable) - Layout only
  container: {
    // No visuals here, just positioning context if needed
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Squircle Visuals (The actual button shape)
  squircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s.mScale(14), // Slightly larger radius for squircle effect
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Size variants (applied to Squircle)
  small: {
    paddingHorizontal: s.mScale(12),
    paddingVertical: s.mScale(6),
    minHeight: s.touchable(32),
  },
  medium: {
    paddingHorizontal: s.mScale(16),
    paddingVertical: s.mScale(10),
    minHeight: s.touchable(48),
  },
  large: {
    paddingHorizontal: s.mScale(24),
    paddingVertical: s.mScale(14),
    minHeight: s.touchable(56),
  },
  
  // Variant styles (applied to Squircle)
  primary: {
    backgroundColor: theme.primaryBase,
    borderColor: theme.primaryBase,
  },
  secondary: {
    backgroundColor: theme.bgSurfaceHover,
    borderColor: theme.borderSubtle,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.borderStrong,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.error,
    borderColor: theme.error,
  },
  success: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  warning: {
    backgroundColor: theme.warning,
    borderColor: theme.warning,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Content spacing
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.mScale(8),
  },
}));

export const Button: FC<ButtonProps> = memo(({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  style,
  icon,
  iconRight,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}) => {
  const { colors } = useTheme();
  // @ts-ignore - complex theme inference
  const styles = useScalingStyles(createStyles, colors);
  const scale = useSharedValue(1);

  const handlePressIn = useCallback((e: any) => {
    if (disabled || loading) return;
    scale.value = withSpring(0.98, springs.stiff);
    onPressIn?.(e);
  }, [scale, onPressIn, disabled, loading]);

  const handlePressOut = useCallback((e: any) => {
    if (disabled || loading) return;
    scale.value = withSpring(1, springs.bouncy);
    onPressOut?.(e);
  }, [scale, onPressOut, disabled, loading]);

  const handlePress = useCallback((e: any) => {
    if (disabled || loading) return;
    if (haptic) {
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
    onPress?.(e);
  }, [haptic, onPress, disabled, loading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  // Typography Variant
  const getTextVariant = () => {
    switch (size) {
      case 'small': return 'caption'; 
      case 'large': return 'h3';     
      default: return 'body';         
    }
  };

  // Spinner Color - Match Text
  const getSpinnerColor = () => {
    switch (variant) {
      case 'primary': return colors.primaryText;
      case 'danger': return colors.errorText;
      case 'success': return colors.successText;
      case 'warning': return colors.warningText;
      case 'ghost':
      case 'outline':
      case 'secondary':
        return colors.textPrimary;
      default: return colors.primaryText;
    }
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style, 
      ]}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      <SquircleView
        style={[
          styles.squircle,
          styles[size],
          styles[variant],
          // Ensure width follows container if needed, but flex handling above does it
          fullWidth && { width: '100%' }, 
        ]}
        cornerSmoothing={1} // Max squircle smoothing
      >
        {loading ? (
          <ActivityIndicator size="small" color={getSpinnerColor()} />
        ) : (
          <Animated.View style={styles.content}>
            {icon && icon}
            
            {typeof children === 'string' ? (
              <Text
                variant={getTextVariant()}
                style={{ 
                  color: (
                    variant === 'primary' ? colors.primaryText :
                    variant === 'danger' ? colors.errorText :
                    variant === 'success' ? colors.successText : 
                    variant === 'warning' ? colors.warningText :
                    variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? colors.textPrimary :
                    colors.textPrimary
                  ) as any,
                  fontWeight: variant === 'ghost' ? '500' : '600',
                  textAlign: 'center',
                }}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            
            {iconRight && iconRight}
          </Animated.View>
        )}
      </SquircleView>
    </AnimatedPressable>
  );
});

Button.displayName = 'Button';
