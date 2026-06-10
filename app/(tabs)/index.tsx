import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HolidayHeader } from '@/components/holiday-header';
import { useHolidaySettings } from '@/contexts/holiday-context';
import { formatDateRange, getHolidayVisual, getRegionLabel } from '@/lib/holiday-data';

export default function HomeScreen() {
  const { error, holidays, isLoadingHolidays, region, schoolYear } = useHolidaySettings();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const cardWidth = isLandscape ? (width - 44) / 2 : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <HolidayHeader title={'Deltion\nVakanties'} subtitle={`Schooljaar ${schoolYear}`} />

        <View style={[styles.cards, isLandscape && styles.cardsLandscape]}>
          {isLoadingHolidays ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.stateText}>Vakantiedata ophalen...</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Data niet beschikbaar</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {!isLoadingHolidays && !error && holidays.length === 0 ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>Geen vakanties gevonden voor dit schooljaar.</Text>
            </View>
          ) : null}

          {holidays.map((holiday) => {
            const visual = getHolidayVisual(holiday.kind);

            return (
              <View
                key={holiday.id}
                style={[
                  styles.card,
                  isLandscape && { width: cardWidth },
                  {
                    backgroundColor: visual.cardBackgroundColor,
                    borderColor: visual.cardBorderColor,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{visual.emoji}</Text>
                  <Text style={styles.cardTitle}>{holiday.name}</Text>
                </View>
                <Text style={styles.cardDates}>{formatDateRange(holiday)}</Text>
                <Text style={[styles.cardRegion, { color: visual.accentColor }]}>
                  {holiday.appliesToAllRegions ? "Alle regio's" : getRegionLabel(region)}
                </Text>
              </View>
            );
          })}
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: 16,
  },
  cards: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardsLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  card: {
    minHeight: 88,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardEmoji: {
    fontSize: 17,
  },
  cardTitle: {
    color: '#020617',
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  cardDates: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  cardRegion: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 1,
  },
  stateCard: {
    minHeight: 88,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  stateText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: 9,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
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
