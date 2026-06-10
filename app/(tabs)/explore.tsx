import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HolidayHeader } from '@/components/holiday-header';
import { useHolidaySettings } from '@/contexts/holiday-context';
import { formatFullDate, getHolidayVisual } from '@/lib/holiday-data';

export default function CountdownScreen() {
  const { daysUntilNextHoliday, error, isLoadingHolidays, nextHoliday, schoolYear } =
    useHolidaySettings();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const visual = getHolidayVisual(nextHoliday?.kind ?? 'default');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <HolidayHeader title="Countdown" />

        <View style={[styles.body, isLandscape && styles.bodyLandscape]}>
          <View
            style={[
              styles.imagePlaceholder,
              isLandscape && styles.imagePlaceholderLandscape,
              { backgroundColor: visual.backgroundColor },
            ]}>
            <Text style={styles.imageEmoji}>{visual.emoji}</Text>
            <Text style={styles.imageText}>{visual.label}</Text>
          </View>

          <View style={[styles.countdownPanel, isLandscape && styles.countdownPanelLandscape]}>
            {isLoadingHolidays ? (
              <View style={styles.stateBlock}>
                <ActivityIndicator color="#2563EB" />
                <Text style={styles.caption}>Vakantiedata ophalen...</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Geen countdown beschikbaar</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {!isLoadingHolidays && !error && nextHoliday ? (
              <>
                <Text style={styles.caption}>Volgende vakantie:</Text>
                <Text style={styles.holidayTitle}>{nextHoliday.name}</Text>

                <View style={styles.daysCard}>
                  <Text style={styles.daysNumber}>{daysUntilNextHoliday}</Text>
                  <Text style={styles.daysLabel}>
                    {daysUntilNextHoliday === 1 ? 'dag te gaan' : 'dagen te gaan'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.dateLine}>Start: {formatFullDate(nextHoliday.startDate)}</Text>
                <Text style={styles.dateLine}>Einde: {formatFullDate(nextHoliday.endDate)}</Text>
                <Text style={styles.schoolYear}>Schooljaar {schoolYear}</Text>
              </>
            ) : null}

            {!isLoadingHolidays && !error && !nextHoliday ? (
              <Text style={styles.caption}>Geen aankomende vakantie gevonden voor {schoolYear}.</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bodyLandscape: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 24,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderLandscape: {
    flex: 1,
    height: 260,
  },
  imageEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  imageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  countdownPanel: {
    alignItems: 'center',
    width: '100%',
  },
  countdownPanelLandscape: {
    flex: 1,
    justifyContent: 'center',
  },
  stateBlock: {
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  caption: {
    color: '#334155',
    fontSize: 15,
    marginTop: 26,
    textAlign: 'center',
  },
  holidayTitle: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  daysCard: {
    width: 152,
    height: 136,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  daysNumber: {
    color: '#2563EB',
    fontSize: 58,
    fontWeight: '800',
    lineHeight: 66,
  },
  daysLabel: {
    color: '#1E293B',
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 24,
    marginBottom: 18,
  },
  dateLine: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
  schoolYear: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  errorCard: {
    width: '100%',
    borderRadius: 9,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    marginTop: 24,
    padding: 14,
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  errorText: {
    color: '#7F1D1D',
    fontSize: 13,
    lineHeight: 18,
  },
});
