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

const SearchScreen = () => {
    const { colors } = useTheme();
    const styles = useScalingStyles(createStyles, colors);

    return (
        <View style={styles.container}>
            <Text variant="h1" color="primary">Search</Text>
            <Text variant="body" color="secondary">Find your favorite tracks.</Text>
        </View>
    );
};

export default SearchScreen;