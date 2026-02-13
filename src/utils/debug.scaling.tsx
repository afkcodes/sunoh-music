import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../components/common/Text';
import { useTheme } from '../theme/ThemeContext';
import { useScaling } from './style.util';

interface DebugEntry {
  component: string;
  timestamp: number;
  data: Record<string, any>;
}

class ScalingDebugger {
  private static instance: ScalingDebugger;
  private logs: DebugEntry[] = [];
  private listeners: Array<() => void> = [];

  static getInstance() {
    if (!ScalingDebugger.instance) {
      ScalingDebugger.instance = new ScalingDebugger();
    }
    return ScalingDebugger.instance;
  }

  log(component: string, data: Record<string, any>) {
    this.logs.push({
      component,
      timestamp: Date.now(),
      data,
    });

    // Keep only last 50 entries
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }

    // Notify listeners
    this.listeners.forEach(fn => fn());

    // Also console.log for easy viewing
    console.log(`[${component}]`, data);
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(fn => fn());
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}

export const scalingDebugger = ScalingDebugger.getInstance();

// Hook to use in components
export const useScalingDebug = (componentName: string) => {
  const s = useScaling();
  const { colors } = useTheme();

  return React.useCallback((label: string, additionalData?: Record<string, any>) => {
    scalingDebugger.log(componentName, {
      label,
      deviceInfo: {
        width: s.device.width,
        height: s.device.height,
        isLandscape: s.device.isLandscape,
        isSmallPhone: s.device.isSmallPhone,
        isPhone: s.device.isPhone,
        isTablet: s.device.isTablet,
        fontScale: s.device.fontScale,
        scaleX: s.device.scaleX,
        scaleY: s.device.scaleY,
        pixelRatio: s.device.pixelRatio,
      },
      scalingFunctions: {
        'scale(100)': s.scale(100),
        'vScale(100)': s.vScale(100),
        'mScale(100)': s.mScale(100),
        'mScale(144)': s.mScale(144),
        'font(16)': s.font(16),
        'touchable(44)': s.touchable(44),
        'square(100)': s.square(100),
        'wp(50)': s.wp(50),
        'hp(50)': s.hp(50),
      },
      themeColors: {
        bgPrimary: colors.bgPage,
        textPrimary: colors.textPrimary,
      },
      ...additionalData,
    });
  }, [s, colors, componentName]);
};

// Debug Panel Component
export const ScalingDebugPanel: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [logs, setLogs] = React.useState<DebugEntry[]>([]);
  const s = useScaling();

  React.useEffect(() => {
    const unsubscribe = scalingDebugger.subscribe(() => {
      setLogs([...scalingDebugger.getLogs()]);
    });
    return unsubscribe;
  }, []);

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <>
      {/* Floating Debug Button */}
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          position: 'absolute',
          bottom: s.mScale(100),
          right: s.mScale(16),
          width: s.mScale(56),
          height: s.mScale(56),
          borderRadius: s.mScale(28),
          backgroundColor: '#FF0000',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
      >
        <Text style={{ color: '#FFF', fontSize: s.font(20), fontWeight: 'bold' }}>
          🐛
        </Text>
      </Pressable>

      {/* Debug Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#000',
          paddingTop: s.mScale(50),
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: s.mScale(16),
            paddingBottom: s.mScale(16),
            borderBottomWidth: 1,
            borderBottomColor: '#333',
          }}>
            <Text style={{ color: '#FFF', fontSize: s.font(20), fontWeight: 'bold' }}>
              Scaling Debug Panel
            </Text>
            <View style={{ flexDirection: 'row', gap: s.mScale(8) }}>
              <Pressable
                onPress={() => {
                  scalingDebugger.clear();
                  setLogs([]);
                }}
                style={{
                  paddingHorizontal: s.mScale(12),
                  paddingVertical: s.mScale(8),
                  backgroundColor: '#FF6B00',
                  borderRadius: s.mScale(6),
                }}
              >
                <Text style={{ color: '#FFF', fontSize: s.font(14) }}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={() => setVisible(false)}
                style={{
                  paddingHorizontal: s.mScale(12),
                  paddingVertical: s.mScale(8),
                  backgroundColor: '#333',
                  borderRadius: s.mScale(6),
                }}
              >
                <Text style={{ color: '#FFF', fontSize: s.font(14) }}>Close</Text>
              </Pressable>
            </View>
          </View>

          {/* Device Summary */}
          <View style={{
            padding: s.mScale(16),
            backgroundColor: '#111',
            borderBottomWidth: 1,
            borderBottomColor: '#333',
          }}>
            <Text style={{ color: '#0F0', fontSize: s.font(16), fontWeight: 'bold', marginBottom: s.mScale(8) }}>
              📱 DEVICE INFO
            </Text>
            <View style={{ gap: s.mScale(4) }}>
              <Text style={{ color: '#FFF', fontSize: s.font(12), fontFamily: 'monospace' }}>
                Width: {s.device.width}px | Height: {s.device.height}px
              </Text>
              <Text style={{ color: '#FFF', fontSize: s.font(12), fontFamily: 'monospace' }}>
                Scale: X={s.device.scaleX.toFixed(3)} Y={s.device.scaleY.toFixed(3)}
              </Text>
              <Text style={{ color: '#FFF', fontSize: s.font(12), fontFamily: 'monospace' }}>
                Font Scale: {s.device.fontScale.toFixed(2)}x | Pixel Ratio: {s.device.pixelRatio}x
              </Text>
              <Text style={{ color: '#FFF', fontSize: s.font(12), fontFamily: 'monospace' }}>
                Type: {s.device.isTablet ? 'Tablet' : s.device.isSmallPhone ? 'Small Phone' : 'Phone'} |
                {s.device.isLandscape ? ' Landscape' : ' Portrait'}
              </Text>
            </View>
          </View>

          {/* Logs */}
          <ScrollView style={{ flex: 1 }}>
            {logs.length === 0 ? (
              <View style={{ padding: s.mScale(16), alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: s.font(14) }}>
                  No debug logs yet. Interact with components to see data.
                </Text>
              </View>
            ) : (
              logs.slice().reverse().map((entry, index) => (
                <View
                  key={`${entry.timestamp}-${index}`}
                  style={{
                    padding: s.mScale(12),
                    marginHorizontal: s.mScale(8),
                    marginVertical: s.mScale(4),
                    backgroundColor: '#1a1a1a',
                    borderRadius: s.mScale(8),
                    borderLeftWidth: 3,
                    borderLeftColor: '#00FF00',
                  }}
                >
                  {/* Component Name */}
                  <Text style={{
                    color: '#00FF00',
                    fontSize: s.font(14),
                    fontWeight: 'bold',
                    marginBottom: s.mScale(4),
                  }}>
                    [{entry.component}] {entry.data.label || ''}
                  </Text>

                  {/* Timestamp */}
                  <Text style={{
                    color: '#666',
                    fontSize: s.font(10),
                    marginBottom: s.mScale(8),
                  }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </Text>

                  {/* Data */}
                  {Object.entries(entry.data).map(([key, value]) => {
                    if (key === 'label') return null;

                    if (typeof value === 'object' && value !== null) {
                      return (
                        <View key={key} style={{ marginBottom: s.mScale(8) }}>
                          <Text style={{ color: '#FFD700', fontSize: s.font(12), fontWeight: 'bold' }}>
                            {key}:
                          </Text>
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <Text
                              key={subKey}
                              style={{
                                color: '#FFF',
                                fontSize: s.font(11),
                                fontFamily: 'monospace',
                                paddingLeft: s.mScale(12),
                              }}
                            >
                              {subKey}: {formatValue(subValue)}
                            </Text>
                          ))}
                        </View>
                      );
                    }

                    return (
                      <Text
                        key={key}
                        style={{
                          color: '#FFF',
                          fontSize: s.font(11),
                          fontFamily: 'monospace',
                          marginBottom: s.mScale(2),
                        }}
                      >
                        {key}: {formatValue(value)}
                      </Text>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};