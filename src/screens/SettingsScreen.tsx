import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { AudioPro } from 'react-native-audio-pro';
import { SafeView } from '../components/common/SafeView';
import { SectionHeader } from '../components/common/SectionHeader';
import { Sheet, SheetRef } from '../components/common/Sheet';
import { AltArrowRight, CheckCircle, HeartFill, MusicNote, Play, ShieldCheck, TrashBin2, User, Widget2 } from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { useLanguages } from '../hooks/useLanguages';
import { useUserSettings } from '../store/useUserSettings';
import { useTheme } from '../theme/ThemeContext';
import { AppTheme } from '../theme/types';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

const createStyles = makeScalingStyles((s, theme: AppTheme) => (
  {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPage,
    },
    // Main content padding
    scrollContent: {
      paddingBottom: s.mScale(40),
      paddingHorizontal: theme.spacing[4],
    },
    section: {
      marginBottom: s.mScale(24),
    },
    // The "Island" container for items
    itemsWrapper: {
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s.mScale(16),
      paddingHorizontal: theme.spacing[4],
      // No background here, wrapper handles it
    },
    itemSeparator: {
      height: 1,
      backgroundColor: theme.colors.borderSubtle,
      marginLeft: s.mScale(56), // Align with text content
    },
    itemIcon: {
      width: s.mScale(32),
      height: s.mScale(32),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing[4],
      // Removed heavy background for cleaner look
    },
    itemContent: {
      flex: 1,
    },
    itemValue: {
      marginRight: s.mScale(8),
    },
    footer: {
      marginTop: s.mScale(40),
      alignItems: 'center',
      gap: s.mScale(8),
    },
    versionText: {
      opacity: 0.5,
    },
    modalHeader: {
      padding: theme.spacing[6],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
      alignItems: 'center',
    },
    langItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: s.mScale(18),
      paddingHorizontal: theme.spacing[6],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    langItemLast: {
      borderBottomWidth: 0,
    }
  }));

const SettingsItem = ({
  icon,
  label,
  value,
  onPress,
  isLast = false
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useScalingStyles(createStyles, theme);


  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: pressed ? theme.colors.bgSurfaceHover : 'transparent' }
      ]}
    >
      <View style={styles.itemIcon}>{icon}</View>
      <View style={styles.itemContent}>
        <Text variant="body" style={{ fontWeight: '600' }}>{label}</Text>
      </View>
      {value && (
        <Text variant="caption" color="secondary" style={styles.itemValue}>
          {value}
        </Text>
      )}
      <AltArrowRight size={20} color={colors.textTertiary} />

      {/* Internal separator for non-last items */}
      {!isLast && (
        <View style={[styles.itemSeparator, { position: 'absolute', bottom: 0, left: 0, right: 0 }]} />
      )}
    </Pressable>
  );
};



const SettingsScreen = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useScalingStyles(createStyles, theme);
  const { data: languagesData } = useLanguages();
  const { languages: selectedLangs, toggleLanguage, streamingQuality, downloadQuality } = useUserSettings();
  const langSheetRef = useRef<SheetRef>(null);

  const [cacheSize, setCacheSize] = useState<string>('Checking...');

  const checkCache = async () => {
    try {
      const size = await AudioPro.getCacheSize();
      const mb = (size / (1024 * 1024)).toFixed(2);
      setCacheSize(`${mb} MB`);
    } catch (e) {
      console.error('Failed to get cache size', e);
      setCacheSize('Error');
    }
  };

  useEffect(() => {
    checkCache()
  }, [])

  const formatLanguages = (langs: string[]) => {
    return langs.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ');
  };

  return (
    <SafeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 24 }}>
          <Text variant="display" color="primary" style={{ fontWeight: 'bold' }}>Settings</Text>
        </View>

        {/* Music Preferences */}
        {/* Music Preferences */}
        <View style={styles.section}>
          <SectionHeader title="Music Preferences" style={{ marginBottom: 12, paddingHorizontal: 0 }} />
          <View style={styles.itemsWrapper}>
            <SettingsItem
              icon={<Widget2 size={24} color={colors.primaryBase} />}
              label="Languages"
              value={formatLanguages(selectedLangs)}
              onPress={() => langSheetRef.current?.present()}
            />
            <SettingsItem
              icon={<MusicNote size={24} color={colors.primaryBase} />}
              label="Streaming Quality"
              value={streamingQuality}
              onPress={() => { }}
            />
            <SettingsItem
              icon={<Play size={24} color={colors.primaryBase} />}
              label="Download Quality"
              value={downloadQuality}
              isLast
              onPress={() => { }}
            />
          </View>
        </View>

        {/* Playback */}
        <View style={styles.section}>
          <SectionHeader title="Playback" style={{ marginBottom: 12, paddingHorizontal: 0 }} />
          <View style={styles.itemsWrapper}>
            <SettingsItem
              icon={<Play size={24} color={colors.primaryBase} />}
              label="Crossfade"
              value="Off"
              onPress={() => { }}
            />
            <SettingsItem
              icon={<MusicNote size={24} color={colors.primaryBase} />}
              label="Gapless Playback"
              value="On"
              isLast
              onPress={() => {
                // Demo: Play a track
                const { play } = require('../store/usePlayerStore').usePlayerStore.getState();
                play({
                  id: '1',
                  title: 'Midnight City',
                  artist: 'M83',
                  artwork: 'https://i.scdn.co/image/ab67616d0000b273063fc7d9536c5356e6d30623',
                  url: ''
                });
              }}
            />
          </View>
        </View>

        {/* Account & Storage */}
        <View style={styles.section}>
          <SectionHeader title="Account & Storage" style={{ marginBottom: 12, paddingHorizontal: 0 }} />
          <View style={styles.itemsWrapper}>
            <SettingsItem
              icon={<User size={24} color={colors.primaryBase} />}
              label="Manage Account"
              onPress={() => { }}
            />
            <SettingsItem
              icon={<TrashBin2 size={24} color={colors.primaryBase} />}
              label="Clear Cache"
              value={cacheSize}
              isLast
              onPress={() => { }}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" style={{ marginBottom: 12, paddingHorizontal: 0 }} />
          <View style={styles.itemsWrapper}>
            <SettingsItem
              icon={<ShieldCheck size={24} color={colors.primaryBase} />}
              label="Privacy Policy"
              onPress={() => { }}
            />
            <SettingsItem
              icon={<ShieldCheck size={24} color={colors.primaryBase} />}
              label="Terms of Service"
              isLast
              onPress={() => { }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="h3" color="primary">Sunoh</Text>
          <Text variant="caption" color="secondary" style={styles.versionText}>Version 1.0.0 (Build 124)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text variant="tiny" color="tertiary">Made with</Text>
            <HeartFill size={18} color={colors.primaryBase} />
            <Text variant="tiny" color="tertiary">for Music Lovers</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Sheet */}
      <Sheet ref={langSheetRef} detents={[0.7]} scrollable={true}>
        <View style={{ paddingBottom: 40 }}>
          <View style={styles.modalHeader}>
            <Text variant="h2" style={{ marginBottom: 4 }}>Content Languages</Text>
            <Text variant="body" color="secondary">Select your preferred languages</Text>
          </View>
          <ScrollView nestedScrollEnabled>
            {languagesData?.data?.map((lang: any, index: number, arr: any[]) => {
              const isSelected = selectedLangs.includes(lang.value);
              const isLastItem = index === arr.length - 1;
              return (
                <TouchableOpacity
                  key={lang.value}
                  style={[styles.langItem, isLastItem && styles.langItemLast]}
                  onPress={() => toggleLanguage(lang.value)}
                >
                  <Text
                    variant="h3"
                    color={isSelected ? 'primary' : 'secondary'}
                    style={{ fontWeight: isSelected ? '700' : '500' }}
                  >
                    {lang.name}
                  </Text>
                  {isSelected && <CheckCircle size={24} color={colors.primaryBase} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Sheet>
    </SafeView>
  );
};

export default SettingsScreen;
