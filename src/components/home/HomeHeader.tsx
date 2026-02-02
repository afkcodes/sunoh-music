import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { spacing } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Settings } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';


interface HomeHeaderProps {
  userName?: string;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
}

const createStyles = makeScalingStyles((s, theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s.mScale(spacing.lg), // 16px
    paddingTop: s.mScale(spacing.lg), // 16px
    paddingBottom: s.mScale(spacing.lg),
  },
  greetingColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: s.mScale(4),
  },
  dateCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: theme.bgSurfaceHover,
    paddingHorizontal: s.mScale(10),
    paddingVertical: s.mScale(4),
    marginBottom: s.mScale(8),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(12),
  },
  avatarContainer: {
    width: s.touchable(48),
    height: s.touchable(48),
    padding: 2, // Border gap
    backgroundColor: theme.bgSurface, // or a gradient
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    // @ts-ignore
    borderRadius: s.mScale(14),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  iconButton: {
    width: s.touchable(40),
    height: s.touchable(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bgSurfaceHover, 
  }
}));

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good Night'; // Late night coding
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};


export const HomeHeader: React.FC<HomeHeaderProps> = React.memo(({ 
  onSettingsPress 
}) => {
  const { colors } = useTheme();
  // @ts-ignore
  const styles = useScalingStyles(createStyles, colors);
  
  const greeting = useMemo(() => getGreeting(), []);

  const renderIconButton = (icon: React.ReactNode, onPress?: () => void) => (
    <Pressable onPress={onPress} hitSlop={8} style={{ padding: 4 }}>
      {icon}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Left: Greeting */}
      <View style={styles.greetingColumn}>
        <View>
          <Text variant="h2" color="primary">
            {greeting}
          </Text>
        </View>
      </View>

      {/* Right: Actions */}
      <View style={styles.actionsRow}>
        <View style={{flexDirection: 'row', gap: 16, alignItems: 'center'}}>
            
            {/* Settings */}
            {renderIconButton(
                <Settings size={22} color={colors.textPrimary} />, // Smaller size
                onSettingsPress
            )}
        </View>
      </View>
    </View>
  );
});

HomeHeader.displayName = 'HomeHeader';
