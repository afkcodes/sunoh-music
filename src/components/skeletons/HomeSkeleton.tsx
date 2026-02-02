import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { borderRadius, spacing, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScaling, useScalingStyles } from '../../utils/style.util';
import { SafeView } from '../common';

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
    container: {
        flex: 1,
        backgroundColor: colors.bgPage,
    },
    header: {
        paddingHorizontal: s.mScale(spacing.lg),
        paddingVertical: s.mScale(spacing.lg),
        // Removed marginBottom to match HomeHeader
    },
    headerText: {
        height: s.mScale(32), // h2 line height is 28 actually, will override
        width: '50%',
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: s.mScale(borderRadius.md),
    },
    section: {
        // Base margin top to match SectionHeader top margin
        marginTop: s.mScale(spacing.lg), 
    },
    sectionHeader: {
        marginHorizontal: s.mScale(spacing.lg),
        height: s.mScale(24),
        width: '40%',
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: s.mScale(borderRadius.sm),
        marginBottom: s.mScale(spacing.md), // Matching SectionHeader bottom margin
    },
    horizontalList: {
        flexDirection: 'row',
        paddingHorizontal: s.mScale(spacing.lg),
        gap: s.mScale(spacing.lg), // Matching HomeSection separator width
        overflow: 'hidden',
    },
    card: {
        width: s.mScale(140),
        gap: s.mScale(8),
    },
    cardImage: {
        width: s.mScale(140),
        height: s.mScale(140),
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: s.mScale(borderRadius.lg),
    },
    cardText1: {
        height: s.mScale(16),
        width: '85%',
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: s.mScale(borderRadius.xs),
        marginTop: s.mScale(4),
    },
    cardText2: {
        height: s.mScale(12),
        width: '60%',
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: s.mScale(borderRadius.xs),
    }
}));

const SkeletonBlock = ({ style }: { style: any }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    return <Animated.View style={[style, animatedStyle]} />;
};

export const HomeSkeleton = () => {
    const { colors } = useTheme();
    const s = useScaling();
    const styles = useScalingStyles(createStyles, colors);

    const renderCard = (key: number) => (
        <View key={key} style={styles.card}>
            <SkeletonBlock style={styles.cardImage} />
            <SkeletonBlock style={styles.cardText1} />
            <SkeletonBlock style={styles.cardText2} />
        </View>
    );

    const renderSection = (key: number, index: number) => (
        <View 
            key={key} 
            style={[
                styles.section,
                // Logic:
                // First Section (index 0): marginTop = spacing.lg (from base style)
                // Next Sections: marginTop = spacing.lg (base) + spacing.md (extra gap from HomeSection)
                { marginTop: index === 0 ? s.mScale(spacing.lg) : s.mScale(spacing.lg + spacing.md) }
            ]}
        >
            <SkeletonBlock style={styles.sectionHeader} />
            <View style={styles.horizontalList}>
                {[1, 2, 3].map(i => renderCard(i))}
            </View>
        </View>
    );

    return (
        <SafeView style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <SkeletonBlock style={[styles.headerText, { height: s.mScale(28) }]} />
            </View>

            {/* Sections */}
            <View>
                {[1, 2, 3].map((key, index) => renderSection(key, index))}
            </View>
        </SafeView>
    );
};
