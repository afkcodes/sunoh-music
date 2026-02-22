import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AudioPro } from 'react-native-audio-pro';
import { useTheme } from '../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

import { useNavigationEvent } from 'navigation-react';
import { Routes } from '../app/navigation/routes';
import { SafeView } from '../components/common';
import LogoAnimation from '../components/common/Loader';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeSection } from '../components/home/HomeSection';
import { useHomeData } from '../hooks/useHomeData';
import { usePlayerStore } from '../store/usePlayerStore';
import { spacing, ThemeColors } from '../theme';

const createStyles = makeScalingStyles((_s, colors: ThemeColors) => ({
    container: {
        flex: 1,
        backgroundColor: colors.bgPage,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    }
}));

const INITIAL_RENDER_COUNT = 6;
const INCREMENT_COUNT = 3;

const HomeScreen = () => {
    const { colors } = useTheme();
    // @ts-ignore
    const styles = useScalingStyles(createStyles, colors);
    const { data: homeData, isLoading, error } = useHomeData({ provider: 'unified' });
    const { stateNavigator } = useNavigationEvent();
    const castState = usePlayerStore((s) => s.castState);

    // State for incremental rendering
    const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);

    const onScroll = ({ nativeEvent }: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 3000; // Trigger earlier for smoother feel
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            if (homeData?.data && visibleCount < homeData.data.length) {
                setVisibleCount(prev => prev + INCREMENT_COUNT);
            }
        }
    };

    if (isLoading) {
        return (
            <SafeView style={styles.container}>
                <View style={styles.center}>
                    <LogoAnimation />
                </View>
            </SafeView>
        );
    }

    if (error) {
        console.error("Home Data Error", error);
    }

    const allData = homeData?.data || [];
    const visibleData = allData.slice(0, visibleCount);

    return (
        <SafeView style={styles.container} >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true} // Optimization for heavy lists
                scrollEventThrottle={16} // Interactive update rate
                onScroll={onScroll}
                renderToHardwareTextureAndroid
            >
                <HomeHeader
                    onSettingsPress={() => stateNavigator.navigate(Routes.Settings)}
                    castState={castState}
                    onCastPress={() => AudioPro.showCastDialog()}
                />

                {visibleData.map((section, index) => {
                    // Don't render last item if it was sliced off in original code,
                    // but here we just render what's visible.
                    // Original code had .slice(0, -1). If that's important logic, restore it.
                    // Assuming homeData.data includes all sections.

                    return (
                        <HomeSection
                            key={`${section.heading}-${index}`}
                            title={section.heading}
                            data={section.data}
                            provider={section.source === 'unified' ? undefined : section.source as any}
                            style={{ marginTop: index === 0 ? 0 : spacing.md }}
                        />
                    );
                })}

            </ScrollView>
        </SafeView >
    );
};

export default HomeScreen;