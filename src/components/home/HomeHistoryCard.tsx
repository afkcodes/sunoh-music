import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import SquircleView from 'react-native-fast-squircle';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import TurboImage from 'react-native-turbo-image';
import { useMediaNavigation } from '../../hooks/useMediaNavigation';
import { borderRadius, fontNames, springs, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { getMediaItemProps } from '../../utils/media';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { MusicNote } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

// We can put the card in a separate file to keep things clean.

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
    cardOuter: {
        marginBottom: s.mScale(8),
        marginRight: s.mScale(12),
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: s.mScale(6),
        paddingHorizontal: s.mScale(6),
    },
    imageContainer: {
        width: s.mScale(48),
        height: s.mScale(48),
        backgroundColor: colors.bgSurfaceHover,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: s.mScale(12),
        justifyContent: 'center',
    },
}));

export const HomeHistoryCard = memo(({ item, width }: { item: any; width: number }) => {
    const { colors, scale: s } = useTheme();
    const styles = useScalingStyles(createStyles, colors);
    const { navigateToItem } = useMediaNavigation();
    const props = getMediaItemProps(item, item.provider);

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.96, springs.stiff);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, springs.bouncy);
    };

    const isCircle = props.isCircle;

    return (
        <Animated.View style={[styles.cardOuter, { width }, animatedStyle]}>
            <Pressable
                onPress={() => navigateToItem(item, item.provider)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <SquircleView
                    style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgSurface, borderRadius: s.mScale(borderRadius.md) }]}
                    cornerSmoothing={1}
                />
                <View style={styles.cardInner}>
                    <SquircleView
                        style={[
                            styles.imageContainer,
                            isCircle ? { borderRadius: 9999 } : { borderRadius: s.mScale(borderRadius.sm) }
                        ]}
                        cornerSmoothing={isCircle ? 0 : 1}
                    >
                        {props.imageUrl ? (
                            <TurboImage
                                source={{ uri: props.imageUrl }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <MusicNote size={s.mScale(24)} color={colors.textSecondary} />
                        )}
                    </SquircleView>
                    <View style={styles.textContainer}>
                        <Text variant="body" style={{ fontFamily: fontNames.semibold, color: colors.textPrimary }} numberOfLines={1}>
                            {props.title}
                        </Text>
                        <Text variant="caption" style={{ fontFamily: fontNames.medium, color: colors.textSecondary }} numberOfLines={1}>
                            {props.type.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
});
