import React from 'react';
import { View } from 'react-native';
import { Text } from '../components/common/Text';
import { useTheme } from '../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

const createStyles = makeScalingStyles((_, theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bgPage,
  },
}));

const LibraryScreen = () => {
    const { colors } = useTheme();
    const styles = useScalingStyles(createStyles, colors);

    return (
        <View style={styles.container}>
            <Text variant="h1" color="primary">Library</Text>
            <Text variant="body" color="secondary">Your collection will appear here.</Text>
        </View>
    );
};

export default LibraryScreen;