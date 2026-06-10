import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HolidayHeader } from '@/components/holiday-header';
import { useHolidaySettings } from '@/contexts/holiday-context';
import { REGIONS, Region } from '@/lib/holiday-data';

export default function SettingsScreen() {
  const {
    availableSchoolYears,
    detectRegionWithGps,
    isLoadingHolidays,
    locationMessage,
    locationStatus,
    region,
    schoolYear,
    setRegion,
    setSchoolYear,
  } = useHolidaySettings();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const gpsLoading = locationStatus === 'loading';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <HolidayHeader title="Instellingen" />

        <View style={[styles.body, isLandscape && styles.bodyLandscape]}>
          <View style={styles.column}>
            <Text style={styles.label}>Regio</Text>

            <View style={styles.options}>
              {REGIONS.map((option) => (
                <RegionOption
                  key={option}
                  label={option}
                  selected={region === option}
                  onPress={() => setRegion(option)}
                />
              ))}
            </View>

            <Pressable
              style={[styles.gpsButton, gpsLoading && styles.gpsButtonDisabled]}
              onPress={detectRegionWithGps}
              disabled={gpsLoading}>
              {gpsLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <MaterialIcons name="near-me" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.gpsButtonText}>
                {gpsLoading ? 'GPS controleren...' : 'Bepaal regio via GPS'}
              </Text>
            </Pressable>

            {locationMessage ? (
              <Text
                style={[
                  styles.helperText,
                  locationStatus === 'success' && styles.successText,
                  (locationStatus === 'denied' ||
                    locationStatus === 'unavailable' ||
                    locationStatus === 'error') &&
                    styles.errorText,
                ]}>
                {locationMessage}
              </Text>
            ) : null}
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Schooljaar</Text>

            <View style={styles.yearGrid}>
              {availableSchoolYears.map((year) => {
                const selected = schoolYear === year;

                return (
                  <Pressable
                    key={year}
                    style={[styles.yearButton, selected && styles.yearButtonSelected]}
                    onPress={() => setSchoolYear(year)}>
                    <Text style={[styles.yearButtonText, selected && styles.yearButtonTextSelected]}>
                      {year}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.helperText}>
              Bij wijzigen van schooljaar wordt de vakantiedata opnieuw opgehaald.
            </Text>

            {isLoadingHolidays ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#2563EB" />
                <Text style={styles.helperText}>Data wordt opnieuw geladen...</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RegionOption({
  label,
  onPress,
  selected,
}: {
  label: Region;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <Text style={styles.optionText}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 24,
  },
  body: {
    gap: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  bodyLandscape: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  label: {
    color: '#020617',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  options: {
    gap: 8,
  },
  option: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7DCE3',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    color: '#020617',
    fontSize: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  gpsButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#08A83D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  gpsButtonDisabled: {
    opacity: 0.75,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  helperText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  successText: {
    color: '#047857',
  },
  errorText: {
    color: '#B91C1C',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7DCE3',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  yearButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  yearButtonText: {
    color: '#020617',
    fontSize: 14,
  },
  yearButtonTextSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
