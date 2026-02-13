
import { useNavigationEvent } from 'navigation-react';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeView } from '../components/common/SafeView';
import { AltArrowLeft, Share as ShareIcon, TrashBin2 } from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { useTheme } from '../theme/ThemeContext';
import { debugLogger } from '../utils/debugLogger';

export const DebugLogsScreen = () => {
  const [logs, setLogs] = useState(debugLogger.getLogs());
  const { colors, spacing } = useTheme();
  const { stateNavigator } = useNavigationEvent();

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe((newLogs) => {
      setLogs([...newLogs]);
    });
    return unsubscribe;
  }, []);

  const handleClear = () => {
    debugLogger.clear();
  };

  const handleShare = async () => {
    const text = logs
      .map((l) => `[${l.timestamp}] ${l.type}: ${JSON.stringify(l.data)}`)
      .join('\n');
    try {
      await Share.share({
        message: text,
      });
    } catch (error) {
      console.error('Error sharing logs:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isAudioEvent = item.type === 'AUDIO_EVENT';
    const isAppState = item.type === 'APP_STATE';

    let color = colors.textPrimary;
    if (isAudioEvent) color = colors.primaryBase;
    if (isAppState) color = '#FFD700'; // Gold for app state

    return (
      <View style={[styles.logItem, { borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.logHeader}>
          <Text variant="tiny" color="tertiary">
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
          <Text variant="tiny" style={{ color, fontWeight: 'bold' }}>
            {item.type}
          </Text>
        </View>
        <Text variant="caption" style={styles.logData}>
          {JSON.stringify(item.data, null, 2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeView style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <View style={[styles.header, { paddingHorizontal: spacing[6] }]}>
        <TouchableOpacity onPress={() => stateNavigator.navigateBack(1)}>
          <AltArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2" style={{ flex: 1, marginLeft: spacing[4] }}>Debug Logs</Text>
        <TouchableOpacity onPress={handleShare} style={{ marginRight: spacing[4] }}>
          <ShareIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear}>
          <TrashBin2 size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: spacing[10] }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text color="secondary">No logs yet</Text>
          </View>
        }
      />
    </SafeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logData: {
    fontFamily: 'monospace',
    fontSize: 10,
    opacity: 0.8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});
