import React, { useMemo } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { spacing } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Text } from '../common/Text';
import { HomeHistoryCard } from './HomeHistoryCard';

const NUM_ROWS = 2; // e.g. 2 rows of items horizontally scrolling

const createStyles = makeScalingStyles((s) => ({
    container: {
        marginTop: s.mScale(spacing.md),
        marginBottom: s.mScale(spacing.md - 8),
    },
    header: {
        marginBottom: s.mScale(12),
        paddingHorizontal: s.mScale(spacing.lg),
    },
    scrollContent: {
        paddingHorizontal: s.mScale(spacing.lg),
    },
    column: {
        flexDirection: 'column',
    }
}));

export const HomeHistorySection = ({ data }: { data: any[] }) => {
    const { colors, scale: s } = useTheme();
    const styles = useScalingStyles(createStyles, colors);
    const { width } = useWindowDimensions();

    // We want roughly 2.2 items visible so it hints at scrolling. Or exactly 2 with a little peek.
    // Let's do width * 0.42 to show more than 2.
    const actualCardWidth = Math.max(s.mScale(160), width * 0.42);

    // Group items into columns of NUM_ROWS
    const columns = useMemo(() => {
        const cols = [];
        for (let i = 0; i < data.length; i += NUM_ROWS) {
            cols.push(data.slice(i, i + NUM_ROWS));
        }
        return cols;
    }, [data]);

    if (!data || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="h3" style={{ fontWeight: '700' }}>Recently Played</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {columns.map((colItems, colIdx) => (
                    <View key={colIdx} style={styles.column}>
                        {colItems.map((item, idx) => (
                            <HomeHistoryCard
                                key={`${item.id || item.token}-${idx}`}
                                item={item}
                                width={actualCardWidth}
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
