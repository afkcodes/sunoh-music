import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { fontNames, spacing } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { AltArrowRight } from './SolarIcons.generated';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

const createStyles = makeScalingStyles((s, _) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline', // Align text baseline for cleaner look
    paddingHorizontal: s.mScale(spacing.lg),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(4),
    padding: s.mScale(4),
  },
}));

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  action,
  onActionPress,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);

  return (
    <View style={[styles.container, style]}>
      <Text variant="h3" color="primary" style={{ fontFamily: fontNames.semibold }}>
        {title}
      </Text>

      {action && (
        <View>
          <Pressable
            onPress={onActionPress}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.6 : 1 }
            ]}
          >
            <Text variant="caption" color="secondary">
              {action}
            </Text>
            {/* Tiny arrow */}
            <AltArrowRight size={12} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}
    </View>
  );
};
