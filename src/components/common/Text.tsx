/**
 * Text Component
 * 
 * A themed, responsive text component that automatically scales
 * based on screen size and respects accessibility settings.
 * 
 * @example
 * ```tsx
 * <Text variant="h1">Welcome</Text>
 * <Text variant="body" color="secondary">Description</Text>
 * <Text variant="caption" color="tertiary">Caption</Text>
 * ```
 */

import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { Platform, Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { fontNames, typography, type TypographyVariant, useTheme } from '../../theme';
import { useScaling } from '../../utils/style.util';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'error' | 'success' | 'warning' | 'onPrimary' | 'onError' | 'onSuccess' | 'onWarning';

interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Typography variant */
  variant?: TypographyVariant;
  /** Text color */
  color?: TextColor;
  /** Center align text */
  center?: boolean;
  /** Custom style (use sparingly) */
  style?: RNTextProps['style'];
  /** Children */
  children: React.ReactNode;
}

export const Text: FC<TextProps> = memo(({
  variant = 'body',
  color = 'primary',
  center = false,
  style,
  children,
  ...props
}) => {
  const s = useScaling();
  const { colors } = useTheme();
  
  const textStyle = useMemo(() => {
    const typo = typography[variant];
    
    const getTextColor = () => {
      switch (color) {
        case 'primary': return colors.textPrimary;
        case 'secondary': return colors.textSecondary;
        case 'tertiary': return colors.textTertiary;
        case 'inverse': return colors.textInverse;
        case 'accent': return colors.primaryBase;
        case 'error': return colors.error;
        case 'onPrimary': return colors.primaryText; 
        case 'onError': return colors.errorText;
        case 'onSuccess': return colors.successText;
        case 'onWarning': return colors.warningText;
        default: return colors.textPrimary;
      }
    };

    // Base style from variant
    const variantStyle = {
      fontSize: s.font(typo.fontSize),
      lineHeight: s.font(typo.lineHeight),
      fontWeight: typo.fontWeight,
      fontFamily: typo.fontFamily,
      letterSpacing: typo.letterSpacing,
      color: getTextColor(),
      textAlign: center ? 'center' as const : undefined,
    };

    // If style override has fontWeight, we need to handle it carefully for Android
    // Android often fails to map fontWeight to custom font fields correctly.
    // We intercept any fontWeight and map it to the correct fontFamily.
    const flattenedStyle = StyleSheet.flatten(style);
    const overrideWeight = flattenedStyle?.fontWeight;

    if (overrideWeight) {
      // Map common weights to our explicit font names
      let weightFamily = variantStyle.fontFamily;
      
      switch (overrideWeight) {
        case 'bold':
        case '700':
        case '800':
        case '900':
          weightFamily = fontNames.bold;
          break;
        case '600':
          weightFamily = fontNames.semibold;
          break;
        case '500':
          weightFamily = fontNames.medium;
          break;
        case 'normal':
        case '400':
          weightFamily = fontNames.regular;
          break;
      }
      
      return {
        ...variantStyle,
        fontFamily: weightFamily,
        // On Android, we should usually unset fontWeight when using explicit font files
        // to prevent "fake bold" or lookup failures.
        fontWeight: Platform.OS === 'android' ? undefined : overrideWeight, 
      };
    }

    return variantStyle;
  }, [variant, color, center, s, colors, style]);

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';

// Pre-defined text components for convenience
export const DisplayText: FC<Omit<TextProps, 'variant'>> = memo((props) => (
  <Text variant="display" {...props} />
));
DisplayText.displayName = 'DisplayText';

export const HeadlineText: FC<Omit<TextProps, 'variant'>> = memo((props) => (
  <Text variant="h1" {...props} />
));
HeadlineText.displayName = 'HeadlineText';

export const TitleText: FC<Omit<TextProps, 'variant'>> = memo((props) => (
  <Text variant="h3" {...props} />
));
TitleText.displayName = 'TitleText';

export const BodyText: FC<Omit<TextProps, 'variant'>> = memo((props) => (
  <Text variant="body" {...props} />
));
BodyText.displayName = 'BodyText';

export const LabelText: FC<Omit<TextProps, 'variant'>> = memo((props) => (
  <Text variant="caption" {...props} />
));
LabelText.displayName = 'LabelText';
