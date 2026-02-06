import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

import { useNavigationEvent } from 'navigation-react';
import { Routes } from '../app/navigation/routes';
import { SafeView } from '../components/common';
import LogoAnimation from '../components/common/Loader';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeSection } from '../components/home/HomeSection';
import { useHomeData } from '../hooks/useHomeData';
import { spacing, ThemeColors } from '../theme';

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
    container: {
        flex: 1,
        backgroundColor: colors.bgPage,
    },
    scrollContent: {
        paddingBottom: s.mScale(spacing.lg),
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
}));

const HomeScreen = () => {
    const { colors } = useTheme();
    const styles = useScalingStyles(createStyles, colors);
    const { data: homeData, isLoading, error } = useHomeData({ provider: 'unified' });
    const { stateNavigator } = useNavigationEvent();

    if (isLoading) {
        // return <HomeSkeleton />;
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

    return (
        <SafeView style={styles.container}>
            <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(400)}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    renderToHardwareTextureAndroid
                    scrollEventThrottle={64}

                >
                    <HomeHeader onSettingsPress={() => stateNavigator.navigate(Routes.Settings)} />

                    {homeData?.data?.slice(0, -1).map((section, index) => (
                        <HomeSection
                            key={`${section.heading}-${index}`}
                            title={section.heading}
                            data={section.data}
                            provider={section.source === 'unified' ? undefined : section.source as any}
                            style={{ marginTop: index === 0 ? 0 : spacing.md }}
                        />
                    ))}

                </ScrollView>
            </Animated.View>
        </SafeView>
    );
};

export default HomeScreen;