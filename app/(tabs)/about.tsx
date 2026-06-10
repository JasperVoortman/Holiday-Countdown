import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HolidayHeader } from '@/components/holiday-header';

const appDetails = [
  { label: 'App Naam', value: 'Deltion Holiday App' },
  { label: 'Versie', value: '1.0.0' },
  { label: 'Keuzedeel', value: 'Mobile App Development K0497' },
  { label: 'Data bron', value: 'Rijksoverheid Open Data' },
];

export default function AboutScreen() {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <HolidayHeader title="Over deze app" />

        <View style={[styles.body, isLandscape && styles.bodyLandscape]}>
          <View style={styles.profile}>
            <Image
              source={require('@/assets/images/Profielfoto.jpeg')}
              style={styles.avatar}
              contentFit="cover"
              accessibilityLabel="Foto van de developer"
            />

            <Text style={styles.name}>Jasper Voortman</Text>
            <Text style={styles.role}>Developer</Text>
          </View>

          <View style={[styles.detailsContainer, isLandscape && styles.detailsContainerLandscape]}>
            <View style={styles.divider} />

            <View style={styles.details}>
              {appDetails.map((detail) => (
                <View key={detail.label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bodyLandscape: {
    flexDirection: 'row',
    gap: 32,
  },
  profile: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#E5E7EB',
  },
  name: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },
  role: {
    color: '#334155',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  detailsContainerLandscape: {
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 26,
    marginBottom: 18,
  },
  details: {
    gap: 18,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    color: '#334155',
    fontSize: 12,
  },
  detailValue: {
    color: '#020617',
    fontSize: 14,
    lineHeight: 18,
  },
});
