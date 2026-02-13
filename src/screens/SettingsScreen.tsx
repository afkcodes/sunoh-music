import { useNavigationEvent } from 'navigation-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';
import { AudioPro } from 'react-native-audio-pro';
import SquircleView from 'react-native-fast-squircle';
import { Routes } from '../app/navigation/routes';
import { SafeView } from '../components/common/SafeView';
import { Sheet, SheetRef } from '../components/common/Sheet';
import {
  AltArrowRight,
  CheckCircle,
  HandMoney,
  HeartFill,
  InfoCircle,
  Play,
  Share,
  ShieldCheck,
  TrashBin2,
  UsersGroupRounded,
  Widget2,
  Wifi
} from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { useLanguages } from '../hooks/useLanguages';
import { useUserSettings } from '../store/useUserSettings';
import { fontNames } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { AppTheme } from '../theme/types';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  scrollContent: {
    paddingBottom: s.mScale(40),
  },
  headerRow: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: s.vScale(24),
  },
  section: {
    marginBottom: s.mScale(28),
  },
  sectionLabel: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: s.mScale(8),
    opacity: 0.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: s.font(14),
    fontWeight: '500',
  },
  itemsWrapper: {
    backgroundColor: theme.colors.bgSurface,
    marginHorizontal: theme.spacing[4],
    borderRadius: s.mScale(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s.mScale(14),
    paddingHorizontal: theme.spacing[4],
  },
  itemIconCarrier: {
    width: s.mScale(30),
    height: s.mScale(30),
    borderRadius: s.mScale(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
    backgroundColor: theme.colors.primaryBase + '10',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontFamily: fontNames.medium,
    fontSize: s.font(15),
    color: theme.colors.textPrimary,
  },
  itemValue: {
    marginRight: s.mScale(4),
    fontFamily: fontNames.medium,
    fontSize: s.font(13),
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginLeft: s.mScale(54),
  },
  footer: {
    marginTop: s.mScale(40),
    alignItems: 'center',
    paddingBottom: s.mScale(40),
  },
  sheetHeader: {
    padding: theme.spacing[6],
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: s.mScale(18),
    paddingHorizontal: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  confirmSheetContent: {
    padding: theme.spacing[6],
    paddingBottom: s.mScale(40),
    alignItems: 'center',
  },
  confirmActionBtn: {
    width: '100%',
    height: s.mScale(54),
    borderRadius: s.mScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    marginTop: s.mScale(24),
  },
  cancelBtn: {
    width: '100%',
    height: s.mScale(54),
    borderRadius: s.mScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSurfaceHover,
    marginTop: s.mScale(12),
  },
}));

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  isLast?: boolean;
  isDanger?: boolean;
}

const SettingsItem = ({
  icon,
  label,
  value,
  onPress,
  showSwitch,
  switchValue,
  onSwitchChange,
  isLast,
  isDanger
}: SettingsItemProps) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useScalingStyles(createStyles, theme);

  const Content = (
    <View style={styles.item}>
      <View style={styles.itemIconCarrier}>{icon}</View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, isDanger && { color: theme.colors.error }]}>
          {label}
        </Text>
      </View>

      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.bgSurfaceHover, true: colors.primaryBase }}
          thumbColor="#FFF"
          style={{ transform: [{ scale: 0.7 }] }}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {value && (
            <Text color="secondary" style={styles.itemValue}>
              {value}
            </Text>
          )}
          <AltArrowRight size={16} color={colors.textTertiary} />
        </View>
      )}
    </View>
  );

  return (
    <View>
      {showSwitch ? (
        <View>{Content}</View>
      ) : (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.bgSurfaceHover : 'transparent'
          })}
        >
          {Content}
        </Pressable>
      )}
      {!isLast && <View style={styles.separator} />}
    </View>
  );
};

const SettingsScreen = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useScalingStyles(createStyles, theme);
  const { stateNavigator } = useNavigationEvent();

  const {
    languages: selectedLangs,
    toggleLanguage,
    streamingQuality,
    downloadQuality,
    setStreamingQuality,
    setDownloadQuality,
    skipSilence,
    setSkipSilence,
  } = useUserSettings();

  const { data: languagesData } = useLanguages();

  const langSheetRef = useRef<SheetRef>(null);
  const qualitySheetRef = useRef<SheetRef>(null);
  const confirmSheetRef = useRef<SheetRef>(null);

  const [qualityType, setQualityType] = useState<'streaming' | 'download'>('streaming');
  const [cacheSize, setCacheSize] = useState<string>('...');
  const [isClearingCache, setIsClearingCache] = useState(false);

  const checkCache = async () => {
    try {
      const size = await AudioPro.getCacheSize();
      const mb = (size / (1024 * 1024)).toFixed(1);
      setCacheSize(`${mb} MB`);
    } catch {
      setCacheSize('0 MB');
    }
  };

  useEffect(() => {
    checkCache();
  }, []);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await AudioPro.clearCache();
      await checkCache();
    } finally {
      setIsClearingCache(false);
      confirmSheetRef.current?.dismiss();
    }
  };

  const openQualitySheet = (type: 'streaming' | 'download') => {
    setQualityType(type);
    qualitySheetRef.current?.present();
  };

  const qualities: Array<typeof streamingQuality> = ['Low', 'Medium', 'High', 'Ultra'];

  return (
    <SafeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text variant="display" color="primary" style={{ fontWeight: '800' }}>Settings</Text>
        </View>

        {/* Music & Content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Music & Content</Text>
          <SquircleView style={styles.itemsWrapper} cornerSmoothing={1}>
            <SettingsItem
              icon={<Widget2 size={18} color={colors.primaryBase} />}
              label="Music Languages"
              value={selectedLangs.length > 2
                ? `${selectedLangs.length} Selected`
                : selectedLangs.join(', ')}
              onPress={() => langSheetRef.current?.present()}
            />
            <SettingsItem
              icon={<Wifi size={18} color={colors.primaryBase} />}
              label="Streaming Quality"
              value={streamingQuality}
              onPress={() => openQualitySheet('streaming')}
            />
            <SettingsItem
              icon={<Play size={18} color={colors.primaryBase} />}
              label="Download Quality"
              value={downloadQuality}
              isLast
              onPress={() => openQualitySheet('download')}
            />
          </SquircleView>
        </View>

        {/* Community & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Community & Support</Text>
          <SquircleView style={styles.itemsWrapper} cornerSmoothing={1}>
            <SettingsItem
              icon={<Share size={18} color={colors.primaryBase} />}
              label="Share Sunoh"
              onPress={() => { }}
            />
            <SettingsItem
              icon={<HandMoney size={18} color={colors.primaryBase} />}
              label="Tip the Developer"
              onPress={() => { }}
            />
            <SettingsItem
              icon={<UsersGroupRounded size={18} color={colors.primaryBase} />}
              label="Join Community"
              isLast
              onPress={() => { }}
            />
          </SquircleView>
        </View>

        {/* Playback Experience
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Playback Experience</Text>
          <SquircleView style={styles.itemsWrapper} cornerSmoothing={1}>
            <SettingsItem
              icon={<MusicNote size={18} color={colors.primaryBase} />}
              label="Skip Silence"
              showSwitch
              switchValue={skipSilence}
              onSwitchChange={(val) => {
                setSkipSilence(val);
                AudioPro.setSkipSilence(val);
              }}
              isLast
            />
          </SquircleView>
        </View> */}

        {/* Storage & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Storage & Data</Text>
          <SquircleView style={styles.itemsWrapper} cornerSmoothing={1}>
            <SettingsItem
              icon={<TrashBin2 size={18} color={colors.error} />}
              label="Clear Cache"
              value={isClearingCache ? '...' : cacheSize}
              onPress={() => confirmSheetRef.current?.present()}
              isDanger
              isLast
            />
          </SquircleView>
        </View>



        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support & Legal</Text>
          <SquircleView style={styles.itemsWrapper} cornerSmoothing={1}>
            <SettingsItem
              icon={<InfoCircle size={18} color={colors.textSecondary} />}
              label="About Sunoh"
              onPress={() => { }}
            />
            <SettingsItem
              icon={<ShieldCheck size={18} color={colors.textSecondary} />}
              label="Privacy & Terms"
              isLast
              onPress={() => { }}
            />
          </SquircleView>
        </View>

        {/* Debug & Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Troubleshooting</Text>
          <SquircleView style={styles.itemsWrapper} cornerSmoothing={1}>
            <SettingsItem
              icon={<InfoCircle size={18} color={colors.primaryBase} />}
              label="Debug Logs"
              onPress={() => stateNavigator.navigate(Routes.DebugLogs)}
              isLast
            />
          </SquircleView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="h2" color="primary" style={{ fontWeight: '800' }}>Sunoh</Text>
          <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>Version 1.0.0</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <Text variant="tiny" color="tertiary">Made with</Text>
            <HeartFill size={14} color={colors.primaryBase} />
            <Text variant="tiny" color="tertiary">for music lovers</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Sheet */}
      <Sheet ref={langSheetRef} detents={[0.8]} scrollable={true}>
        <View style={{ flex: 1 }}>
          <View style={styles.sheetHeader}>
            <Text variant="h2" style={{ marginBottom: 4 }}>Music Languages</Text>
            <Text variant="body" color="secondary">Update your discovery preferences</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {languagesData?.data?.map((lang: any, index: number, arr: any[]) => {
              const isSelected = selectedLangs.includes(lang.value.toLowerCase());
              const isLastItem = index === arr.length - 1;
              return (
                <TouchableOpacity
                  key={lang.value}
                  style={[styles.sheetOption, isLastItem && { borderBottomWidth: 0 }]}
                  onPress={() => toggleLanguage(lang.value.toLowerCase())}
                >
                  <Text
                    variant="h3"
                    style={{
                      fontFamily: isSelected ? fontNames.bold : fontNames.medium,
                      color: isSelected ? colors.primaryBase : colors.textPrimary
                    }}
                  >
                    {lang.name}
                  </Text>
                  {isSelected && <CheckCircle size={22} color={colors.primaryBase} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Sheet>

      {/* Quality Selection Sheet */}
      <Sheet ref={qualitySheetRef} sizes={['auto']}>
        <View style={{ paddingBottom: 40 }}>
          <View style={styles.sheetHeader}>
            <Text variant="h2" style={{ marginBottom: 4 }}>
              {qualityType === 'streaming' ? 'Streaming Quality' : 'Download Quality'}
            </Text>
            <Text variant="body" color="secondary">
              Higher quality uses more data and storage
            </Text>
          </View>
          {qualities.map((q, idx) => {
            const current = qualityType === 'streaming' ? streamingQuality : downloadQuality;
            const isSelected = current === q;
            const isLastItem = idx === qualities.length - 1;

            return (
              <TouchableOpacity
                key={q}
                style={[styles.sheetOption, isLastItem && { borderBottomWidth: 0 }]}
                onPress={() => {
                  if (qualityType === 'streaming') setStreamingQuality(q);
                  else setDownloadQuality(q);
                  qualitySheetRef.current?.dismiss();
                }}
              >
                <Text
                  variant="h3"
                  style={{
                    fontFamily: isSelected ? fontNames.bold : fontNames.medium,
                    color: isSelected ? colors.primaryBase : colors.textPrimary
                  }}
                >
                  {q}
                </Text>
                {isSelected && <CheckCircle size={22} color={colors.primaryBase} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Sheet>

      {/* Cache Confirmation Sheet */}
      <Sheet ref={confirmSheetRef} sizes={['auto']}>
        <View style={styles.confirmSheetContent}>
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: colors.error + '15',
            justifyContent: 'center', alignItems: 'center',
            marginBottom: 20
          }}>
            <TrashBin2 size={28} color={colors.error} />
          </View>
          <Text variant="h2" style={{ marginBottom: 8, textAlign: 'center' }}>Clear Cache</Text>
          <Text variant="body" color="secondary" style={{ textAlign: 'center', paddingHorizontal: 20 }}>
            This will remove all temporarily stored audio files. Your downloads will not be affected.
          </Text>

          <TouchableOpacity
            style={styles.confirmActionBtn}
            onPress={handleClearCache}
            disabled={isClearingCache}
          >
            {isClearingCache ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontFamily: fontNames.bold, fontSize: 16 }}>Clear Cache</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => confirmSheetRef.current?.dismiss()}
          >
            <Text style={{ fontFamily: fontNames.bold, fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Sheet>
    </SafeView>
  );
};

export default SettingsScreen;
