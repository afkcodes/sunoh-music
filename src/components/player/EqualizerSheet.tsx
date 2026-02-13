/**
 * EqualizerSheet Component
 * 
 * A comprehensive 10-band equalizer with visual feedback,
 * preset selection, and real-time audio adjustment.
 */

import { Slider } from '@react-native-assets/slider';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { AudioPro } from 'react-native-audio-pro';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { EQ_PRESETS, EQPreset, FREQUENCY_LABELS, PRESET_CATEGORIES } from '../../features/equalizer/eqPresets';
import { mmkv } from '../../store/storage';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Button } from '../common/Button';
import { Sheet, SheetRef } from '../common/Sheet';
import { AltArrowDown, AltArrowUp, Restart, Tuning } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

const STORAGE_KEYS = {
  EQ_GAINS: 'eq_gains',
  EQ_PRESET: 'eq_preset',
  EQ_ENABLED: 'eq_enabled',
};

interface EqualizerSheetProps {
  // Props can be extended here if needed
}

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
  },
  header: {
    paddingHorizontal: s.mScale(20),
    paddingTop: s.mScale(20),
    paddingBottom: s.mScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(12),
  },
  iconContainer: {
    padding: s.mScale(8),
    borderRadius: s.mScale(12),
    backgroundColor: theme.colors.primaryBase + '20',
  },
  headerTitle: {
    fontSize: s.font(20),
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(8),
  },
  scrollContent: {
    padding: s.mScale(20),

  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(8),
    marginBottom: s.mScale(12),
  },
  sectionIndicator: {
    width: s.mScale(24),
    height: s.mScale(4),
    borderRadius: s.mScale(2),
    backgroundColor: theme.colors.primaryBase,
  },
  sectionTitle: {
    fontSize: s.font(16),
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: s.font(12),
    opacity: 0.6,
    marginLeft: 'auto',
  },
  visualizerContainer: {
    marginBottom: s.mScale(24),
  },
  visualizerBox: {
    backgroundColor: theme.colors.bgSurfaceHover + '40',
    borderRadius: s.mScale(12),
    padding: s.mScale(12),
    marginBottom: s.mScale(8),
  },
  visualizerBars: {
    height: s.mScale(96),
    backgroundColor: theme.colors.bgSurfaceHover + '60',
    borderRadius: s.mScale(8),
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: s.mScale(8),
    paddingVertical: s.mScale(8),
    gap: s.mScale(2),
  },
  zeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: theme.colors.borderSubtle + '80',
    zIndex: 10,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: s.mScale(2),
    borderTopRightRadius: s.mScale(2),
    position: 'relative',
  },
  barLabel: {
    position: 'absolute',
    top: -s.mScale(16),
    left: '50%',
    transform: [{ translateX: -s.mScale(8) }],
    fontSize: s.font(10),
    fontWeight: '600',
    backgroundColor: theme.colors.bgSurface + 'E6',
    paddingHorizontal: s.mScale(3),
    borderRadius: s.mScale(2),
  },
  frequencyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: s.mScale(8),
    marginTop: s.mScale(8),
  },
  frequencyLabel: {
    fontSize: s.font(11),
    opacity: 0.6,
    flex: 1,
    textAlign: 'center',
  },
  frequencyUnit: {
    textAlign: 'center',
    fontSize: s.font(10),
    opacity: 0.5,
    marginTop: s.mScale(4),
  },
  presetDescription: {
    backgroundColor: theme.colors.bgSurfaceHover + '60',
    borderRadius: s.mScale(12),
    padding: s.mScale(12),
    marginBottom: s.mScale(16),
  },
  presetDescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(8),
    marginBottom: s.mScale(8),
  },
  impactBadge: {
    fontSize: s.font(11),
    fontWeight: '600',
    paddingHorizontal: s.mScale(8),
    paddingVertical: s.mScale(3),
    borderRadius: s.mScale(12),
    borderWidth: 1,
    overflow: 'hidden',
  },
  presetDescriptionText: {
    fontSize: s.font(13),
    opacity: 0.7,
    lineHeight: s.font(18),
  },
  presetsSection: {
    marginBottom: s.mScale(24),
  },
  categoryContainer: {
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: s.mScale(12),
    overflow: 'hidden',
    marginBottom: s.mScale(12),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s.mScale(16),
    paddingVertical: s.mScale(12),
    backgroundColor: theme.colors.bgSurfaceHover + '40',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(8),
  },
  categoryIndicator: {
    width: s.mScale(16),
    height: s.mScale(4),
    borderRadius: s.mScale(2),
    backgroundColor: theme.colors.primaryBase,
  },
  categoryTitle: {
    fontSize: s.font(14),
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: s.font(12),
    opacity: 0.6,
    marginLeft: s.mScale(4),
  },
  categoryContent: {
    padding: s.mScale(12),
    backgroundColor: theme.colors.bgSurface,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s.mScale(8),
  },
  presetButton: {
    paddingHorizontal: s.mScale(16),
    paddingVertical: s.mScale(10),
    borderRadius: s.mScale(8),
    borderWidth: 1,
    minWidth: '48%',
    flexGrow: 1,
  },
  presetButtonActive: {
    backgroundColor: theme.colors.primaryBase,
    borderColor: theme.colors.primaryBase,
  },
  presetButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.borderSubtle,
  },
  presetButtonText: {
    fontSize: s.font(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  slidersSection: {
    marginBottom: s.mScale(24),
  },
  mixerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: s.mScale(8),
    paddingVertical: s.mScale(16),
    backgroundColor: theme.colors.bgSurfaceHover + '40',
    borderRadius: s.mScale(16),
  },
  sliderColumn: {
    alignItems: 'center',
    gap: s.mScale(8),
  },
  sliderLabel: {
    fontSize: s.font(10),
    fontWeight: '600',
    opacity: 0.7,
    textAlign: 'center',
  },
  sliderValue: {
    fontSize: s.font(10),
    fontWeight: '700',
    color: theme.colors.primaryBase,
    textAlign: 'center',
    minWidth: s.mScale(32),
  },
  dbScale: {
    position: 'absolute',
    left: s.mScale(4),
    top: s.mScale(16),
    bottom: s.mScale(40),
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dbLabel: {
    fontSize: s.font(9),
    opacity: 0.4,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bgSurface + 'F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  disabledContent: {
    alignItems: 'center',
    maxWidth: s.mScale(280),
    paddingHorizontal: s.mScale(24),
  },
  disabledIconCircle: {
    width: s.mScale(80),
    height: s.mScale(80),
    borderRadius: s.mScale(40),
    backgroundColor: theme.colors.bgSurfaceHover + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: s.mScale(16),
    borderWidth: 2,
    borderColor: theme.colors.primaryBase + '40',
  },
  disabledTitle: {
    fontSize: s.font(20),
    fontWeight: '700',
    marginBottom: s.mScale(8),
    textAlign: 'center',
  },
  disabledDescription: {
    fontSize: s.font(14),
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: s.font(20),
    marginBottom: s.mScale(20),
  },
}));

export const EqualizerSheet = forwardRef<SheetRef, EqualizerSheetProps>((_, ref) => {
  const themeContext = useTheme();
  const { colors } = themeContext;
  const styles = useScalingStyles(createStyles, themeContext);

  const [gains, setGains] = useState<number[]>(new Array(10).fill(0));
  const [activePreset, setActivePreset] = useState<string>('flat');
  const [isEnabled, setIsEnabled] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    signatures: true,
    genres: true,
    situational: false,
  });

  const sheetRef = React.useRef<SheetRef>(null);

  // Create shared values for each bar's height (animated)
  const bar0 = useSharedValue(50);
  const bar1 = useSharedValue(50);
  const bar2 = useSharedValue(50);
  const bar3 = useSharedValue(50);
  const bar4 = useSharedValue(50);
  const bar5 = useSharedValue(50);
  const bar6 = useSharedValue(50);
  const bar7 = useSharedValue(50);
  const bar8 = useSharedValue(50);
  const bar9 = useSharedValue(50);

  const barHeights = useMemo(
    () => [bar0, bar1, bar2, bar3, bar4, bar5, bar6, bar7, bar8, bar9],
    [bar0, bar1, bar2, bar3, bar4, bar5, bar6, bar7, bar8, bar9]
  );

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  // Load saved settings
  useEffect(() => {
    const savedGains = mmkv.getString(STORAGE_KEYS.EQ_GAINS);
    const savedPreset = mmkv.getString(STORAGE_KEYS.EQ_PRESET);
    const savedEnabled = mmkv.getBoolean(STORAGE_KEYS.EQ_ENABLED);

    let initialGains = new Array(10).fill(0);

    if (savedGains) {
      try {
        const parsedGains = JSON.parse(savedGains);
        if (Array.isArray(parsedGains) && parsedGains.length === 10) {
          initialGains = parsedGains;
          setGains(parsedGains);
          AudioPro.setEqualizer(parsedGains)
        }
      } catch (e) {
        console.error('Failed to parse saved EQ gains:', e);
      }
    }

    if (savedPreset) {
      setActivePreset(savedPreset);
    }

    if (savedEnabled !== undefined) {
      setIsEnabled(savedEnabled);
    }

    // Initialize bar heights
    initialGains.forEach((gain: number, index: number) => {
      const heightPercent = ((Math.max(-12, Math.min(12, gain)) + 12) / 24) * 100;
      if (barHeights[index]) {
        barHeights[index].value = Math.max(2, Math.min(98, heightPercent));
      }
    });
  }, [barHeights]);

  const applyEQ = useCallback((newGains: number[]) => {
    AudioPro.setEqualizer(newGains)
  }, []);

  const handlePresetSelect = useCallback((preset: EQPreset) => {
    setGains(preset.gains);
    setActivePreset(preset.id);

    // Animate bar heights
    preset.gains.forEach((gain, index) => {
      const heightPercent = ((Math.max(-12, Math.min(12, gain)) + 12) / 24) * 100;
      if (barHeights[index]) {
        barHeights[index].value = withSpring(Math.max(2, Math.min(98, heightPercent)), {
          damping: 20,
          stiffness: 90,
        });
      }
    });

    mmkv.set(STORAGE_KEYS.EQ_GAINS, JSON.stringify(preset.gains));
    mmkv.set(STORAGE_KEYS.EQ_PRESET, preset.id);

    if (isEnabled) {
      applyEQ(preset.gains);
    }
  }, [isEnabled, applyEQ, barHeights]);

  const handleGainChange = useCallback((index: number, value: number) => {
    // Animate bar height in real-time
    const heightPercent = ((Math.max(-12, Math.min(12, value)) + 12) / 24) * 100;
    if (barHeights[index]) {
      barHeights[index].value = Math.max(2, Math.min(98, heightPercent));
    }

    // Apply EQ in real-time for audio feedback
    if (isEnabled) {
      const tempGains = [...gains];
      tempGains[index] = value;
      applyEQ(tempGains);
    }
  }, [gains, isEnabled, applyEQ, barHeights]);

  const handleGainComplete = useCallback((index: number, value: number) => {
    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
    setActivePreset('custom');

    mmkv.set(STORAGE_KEYS.EQ_GAINS, JSON.stringify(newGains));
    mmkv.set(STORAGE_KEYS.EQ_PRESET, 'custom');

    if (isEnabled) {
      applyEQ(newGains);
    }
  }, [gains, isEnabled, applyEQ]);

  const handleReset = useCallback(() => {
    const flatPreset = EQ_PRESETS.find(p => p.id === 'flat');
    if (flatPreset) {
      handlePresetSelect(flatPreset);
    }
  }, [handlePresetSelect]);

  const toggleEQ = useCallback(() => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    mmkv.set(STORAGE_KEYS.EQ_ENABLED, newEnabled);

    if (newEnabled) {
      applyEQ(gains);
    } else {
      // Apply flat EQ when disabled
      applyEQ(new Array(10).fill(0));
    }
  }, [isEnabled, gains, applyEQ]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const getImpactLevel = useCallback(() => {
    const maxGain = Math.max(...gains.map(Math.abs));
    if (maxGain >= 6) return { level: 'High', color: colors.warning };
    if (maxGain >= 3) return { level: 'Medium', color: colors.primaryBase };
    return { level: 'Subtle', color: colors.primaryBase };
  }, [gains, colors]);

  const renderVisualizerBar = useCallback((gain: number, index: number) => {
    const isBoost = gain > 0.2;
    const isCut = gain < -0.2;

    let backgroundColor = colors.textSecondary + '60';
    if (isBoost) {
      backgroundColor = colors.primaryBase + 'B3';
    } else if (isCut) {
      backgroundColor = colors.error + 'CC';
    }

    // Animated style for the bar
    const animatedBarStyle = useAnimatedStyle(() => {
      return {
        width: '100%',
        height: `${barHeights[index]?.value ?? 50}%`,
        backgroundColor,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
      };
    }, [backgroundColor]);

    return (
      <View key={index} style={styles.bar}>
        {Math.abs(gain) > 0.5 && (
          <Text style={styles.barLabel}>
            {gain > 0 ? '+' : ''}{gain.toFixed(0)}
          </Text>
        )}
        <Animated.View style={animatedBarStyle} />
      </View>
    );
  }, [colors, styles, barHeights]);

  const renderPresetCategory = useCallback((
    categoryKey: string,
    title: string,
    count: number,
    presetIds: string[]
  ) => {
    const isExpanded = expandedCategories[categoryKey];
    const categoryPresets = EQ_PRESETS.filter(p => presetIds.includes(p.id));

    return (
      <View key={categoryKey} style={styles.categoryContainer}>
        <Pressable
          style={styles.categoryHeader}
          onPress={() => toggleCategory(categoryKey)}
        >
          <View style={styles.categoryHeaderLeft}>
            <View style={styles.categoryIndicator} />
            <Text style={styles.categoryTitle}>{title}</Text>
            <Text style={styles.categoryCount}>({count} presets)</Text>
          </View>
          {isExpanded ? (
            <AltArrowUp size={20} color={colors.textSecondary} />
          ) : (
            <AltArrowDown size={20} color={colors.textSecondary} />
          )}
        </Pressable>

        {isExpanded && (
          <View style={styles.categoryContent}>
            <View style={styles.presetGrid}>
              {categoryPresets.map(preset => (
                <Pressable
                  key={preset.id}
                  style={[
                    styles.presetButton,
                    activePreset === preset.id
                      ? styles.presetButtonActive
                      : styles.presetButtonInactive,
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      { color: activePreset === preset.id ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {preset.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }, [expandedCategories, activePreset, colors, styles, handlePresetSelect, toggleCategory]);

  const currentPreset = EQ_PRESETS.find(p => p.id === activePreset);
  const impact = getImpactLevel();
  const [isSliding, setIsSliding] = useState(false);

  return (
    <Sheet
      ref={sheetRef}
      sizes={[0.9]}
      dismissible={true}
      stackBehavior="push"
      scrollable
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Tuning size={20} color={colors.textPrimary} />
            </View>
            <Text style={styles.headerTitle}>Equalizer</Text>
          </View>

          <View style={styles.headerActions}>
            <Button
              variant="ghost"
              size="small"
              onPress={handleReset}
              icon={<Restart size={20} color={colors.textPrimary} />}
              haptic
            />
            <Button
              variant={isEnabled ? 'primary' : 'outline'}
              size="small"
              onPress={toggleEQ}
              haptic
            >
              {isEnabled ? 'ON' : 'OFF'}
            </Button>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            !isEnabled && { opacity: 0.5, pointerEvents: 'none' },
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          renderToHardwareTextureAndroid
          removeClippedSubviews
          scrollEnabled={!isSliding}
        >
          {/* Frequency Visualizer */}
          <View style={styles.visualizerContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Frequency Response</Text>
              <Text style={styles.sectionSubtitle}>-12dB to +12dB</Text>
            </View>

            <View style={styles.visualizerBox}>
              <View style={styles.visualizerBars}>
                <View style={styles.zeroLine} />
                {gains.map((gain, index) => renderVisualizerBar(gain, index))}
              </View>

              <View style={styles.frequencyLabels}>
                {FREQUENCY_LABELS.map((label, index) => (
                  <Text key={index} style={styles.frequencyLabel}>
                    {label}
                  </Text>
                ))}
              </View>
              <Text style={styles.frequencyUnit}>Frequency (Hz)</Text>
            </View>
          </View>

          {/* Preset Description */}
          {currentPreset && (
            <View style={styles.presetDescription}>
              <View style={styles.presetDescriptionHeader}>
                <View style={styles.categoryIndicator} />
                <Text style={styles.sectionTitle}>{currentPreset.name}</Text>
                <Text
                  style={[
                    styles.impactBadge,
                    {
                      color: impact.color,
                      borderColor: impact.color + '60',
                      backgroundColor: impact.color + '20',
                    },
                  ]}
                >
                  {impact.level} Impact
                </Text>
              </View>
              <Text style={styles.presetDescriptionText}>
                {currentPreset.description}
              </Text>
            </View>
          )}

          {/* Preset Categories */}
          <View style={styles.presetsSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIndicator, { width: 32 }]} />
              <Text style={styles.sectionTitle}>Sound Presets</Text>
            </View>

            {renderPresetCategory('signatures', 'Sound Signatures', PRESET_CATEGORIES.signatures.length, PRESET_CATEGORIES.signatures)}
            {renderPresetCategory('genres', 'Music Genres', PRESET_CATEGORIES.genres.length, PRESET_CATEGORIES.genres)}
            {renderPresetCategory('situational', 'Device & Situation', PRESET_CATEGORIES.situational.length, PRESET_CATEGORIES.situational)}
          </View>

          {/* Manual Sliders */}
          <View style={styles.slidersSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIndicator, { width: 32 }]} />
              <Text style={styles.sectionTitle}>Manual Adjustment</Text>
            </View>

            <GestureHandlerRootView style={styles.mixerContainer}>
              {gains.map((gain, index) => (
                <View key={index} style={styles.sliderColumn}>
                  <Text style={styles.sliderValue}>
                    {gain > 0 ? '+' : ''}{gain.toFixed(0)}
                  </Text>
                  <Slider
                    value={gain}
                    minimumValue={-12}
                    maximumValue={12}
                    step={0.5}
                    vertical
                    inverted
                    style={{ height: 140 }}
                    onValueChange={(value) => {
                      handleGainChange(index, value)
                      setIsSliding(true);
                    }}
                    onSlidingComplete={() => {
                      setIsSliding(false);
                    }}
                    minimumTrackTintColor={colors.primaryBase}
                    maximumTrackTintColor={colors.borderSubtle}
                    thumbTintColor={colors.primaryText}
                    trackHeight={6}
                    trackStyle={{ width: 2 }}
                    thumbSize={18}
                  />
                  <Text style={styles.sliderLabel}>
                    {FREQUENCY_LABELS[index]?.replace('k', 'K') ?? ''}
                  </Text>
                </View>
              ))}
            </GestureHandlerRootView>
          </View>
        </ScrollView>

        {/* Disabled Overlay */}
        {!isEnabled && (
          <View style={styles.disabledOverlay}>
            <View style={styles.disabledContent}>
              <View style={styles.disabledIconCircle}>
                <Tuning size={40} color={colors.textSecondary} />
              </View>
              <Text style={styles.disabledTitle}>Equalizer Disabled</Text>
              <Text style={styles.disabledDescription}>
                Enable the equalizer to access expertly crafted audio presets and
                enhance your listening experience with professional sound tuning.
              </Text>
              <Button
                onPress={toggleEQ}
                variant="primary"
                fullWidth
                icon={<Tuning size={20} color="#FFFFFF" />}
                haptic
              >
                Enable Equalizer
              </Button>
            </View>
          </View>
        )}
      </View>
    </Sheet>
  );
});

EqualizerSheet.displayName = 'EqualizerSheet';
